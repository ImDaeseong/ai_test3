import hashlib
import logging
from urllib.parse import urljoin

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.crawler.client import JobKoreaClient
from app.crawler.parser import parse_job_detail, parse_job_list
from app.filters.classifier import classify
from app.repositories.jobs import JobRepository

logger = logging.getLogger(__name__)


class CollectionService:
    def __init__(self, session: AsyncSession) -> None:
        self.settings = get_settings()
        self.repository = JobRepository(session)

    async def collect(self) -> dict[str, int]:
        stats = {
            "list_items": 0,
            "detail_checked": 0,
            "created": 0,
            "updated": 0,
            "skipped": 0,
        }

        list_url = urljoin(
            self.settings.jobkorea_base_url,
            self.settings.joblist_path,
        )

        async with JobKoreaClient() as client:
            html = await client.get(list_url)
            items = parse_job_list(html)
            stats["list_items"] = len(items)

            for item in items:
                first_pass = classify(
                    " ".join(
                        filter(
                            None,
                            [
                                item.title,
                                item.company_name,
                                item.summary,
                                item.location,
                                item.career,
                            ],
                        )
                    )
                )
                if not first_pass.accepted:
                    stats["skipped"] += 1
                    continue

                detail_html = await client.get(item.source_url)
                stats["detail_checked"] += 1
                detail = parse_job_detail(detail_html)

                combined = " ".join(
                    [
                        item.title,
                        item.company_name,
                        item.summary,
                        detail.summary,
                        detail.requirements,
                        detail.preferred,
                    ]
                )
                result = classify(combined)
                if not result.accepted:
                    stats["skipped"] += 1
                    continue

                content_hash = hashlib.sha256(
                    combined.encode("utf-8", errors="ignore")
                ).hexdigest()

                _, created = await self.repository.upsert(
                    {
                        "jobkorea_job_id": item.job_id,
                        "company_name": item.company_name or detail.company_name,
                        "title": item.title,
                        "summary": detail.summary or item.summary,
                        "requirements": detail.requirements,
                        "preferred": detail.preferred,
                        "location": item.location,
                        "career": item.career,
                        "deadline": item.deadline,
                        "source_url": item.source_url,
                        "categories": result.categories,
                        "matched_keywords": result.matched_keywords,
                        "match_score": result.score,
                        "match_level": result.level,
                        "match_reasons": result.reasons,
                        "content_hash": content_hash,
                    }
                )
                stats["created" if created else "updated"] += 1

        logger.info("collection finished: %s", stats)
        return stats
