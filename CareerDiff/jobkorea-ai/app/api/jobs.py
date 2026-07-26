from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.repositories.jobs import JobRepository
from app.services.collector import CollectionService

router = APIRouter(prefix="/api/v1")


def serialize(job) -> dict:
    return {
        "id": job.id,
        "jobkorea_job_id": job.jobkorea_job_id,
        "company_name": job.company_name,
        "title": job.title,
        "summary": job.summary,
        "requirements": job.requirements,
        "preferred": job.preferred,
        "location": job.location,
        "career": job.career,
        "deadline": job.deadline,
        "source_url": job.source_url,
        "categories": job.categories,
        "matched_keywords": job.matched_keywords,
        "match_score": job.match_score,
        "match_level": job.match_level,
        "match_reasons": job.match_reasons,
        "last_checked_at": job.last_checked_at,
    }


@router.get("/jobs")
async def list_jobs(
    keyword: str | None = None,
    category: str | None = None,
    minimum_score: int = Query(0, ge=0, le=100),
    limit: int = Query(100, ge=1, le=500),
    session: AsyncSession = Depends(get_session),
) -> list[dict]:
    jobs = await JobRepository(session).list(
        keyword=keyword,
        category=category,
        minimum_score=minimum_score,
        limit=limit,
    )
    return [serialize(job) for job in jobs]


@router.get("/jobs/{job_id}")
async def get_job(
    job_id: int,
    session: AsyncSession = Depends(get_session),
) -> dict:
    job = await JobRepository(session).get(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="공고를 찾을 수 없습니다.")
    return serialize(job)


@router.post("/admin/collect")
async def collect_jobs(
    session: AsyncSession = Depends(get_session),
) -> dict[str, int]:
    return await CollectionService(session).collect()
