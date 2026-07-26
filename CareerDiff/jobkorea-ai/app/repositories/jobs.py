from sqlalchemy import String, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.job import Job


class JobRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def upsert(self, values: dict) -> tuple[Job, bool]:
        query = select(Job).where(
            Job.jobkorea_job_id == values["jobkorea_job_id"]
        )
        job = await self.session.scalar(query)
        created = job is None

        if job is None:
            job = Job(**values)
            self.session.add(job)
        else:
            for key, value in values.items():
                setattr(job, key, value)

        await self.session.commit()
        await self.session.refresh(job)
        return job, created

    async def list(
        self,
        keyword: str | None = None,
        category: str | None = None,
        minimum_score: int = 0,
        limit: int = 100,
    ) -> list[Job]:
        query = select(Job).where(Job.match_score >= minimum_score)
        if keyword:
            query = query.where(
                Job.title.ilike(f"%{keyword}%")
                | Job.summary.ilike(f"%{keyword}%")
                | Job.company_name.ilike(f"%{keyword}%")
            )
        if category:
            # JSON portability를 위해 1차 버전에서는 문자열 캐스팅 검색 사용.
            query = query.where(func.cast(Job.categories, String).ilike(f"%{category}%"))
        query = query.order_by(Job.match_score.desc(), Job.id.desc()).limit(limit)
        return list((await self.session.scalars(query)).all())

    async def get(self, job_id: int) -> Job | None:
        return await self.session.get(Job, job_id)
