from datetime import datetime
from typing import Any

from sqlalchemy import Boolean, DateTime, Integer, JSON, String, Text, UniqueConstraint
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class Job(Base):
    __tablename__ = "jobs"
    __table_args__ = (UniqueConstraint("jobkorea_job_id"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    jobkorea_job_id: Mapped[str] = mapped_column(String(64), index=True)
    company_name: Mapped[str] = mapped_column(String(300), default="")
    title: Mapped[str] = mapped_column(String(500), index=True)
    summary: Mapped[str] = mapped_column(Text, default="")
    requirements: Mapped[str] = mapped_column(Text, default="")
    preferred: Mapped[str] = mapped_column(Text, default="")
    location: Mapped[str | None] = mapped_column(String(300), nullable=True)
    career: Mapped[str | None] = mapped_column(String(200), nullable=True)
    deadline: Mapped[str | None] = mapped_column(String(100), nullable=True)
    source_url: Mapped[str] = mapped_column(String(1000))
    categories: Mapped[list[str]] = mapped_column(JSON, default=list)
    matched_keywords: Mapped[list[str]] = mapped_column(JSON, default=list)
    match_score: Mapped[int] = mapped_column(Integer, default=0)
    match_level: Mapped[str] = mapped_column(String(50), default="낮은 일치도")
    match_reasons: Mapped[list[str]] = mapped_column(JSON, default=list)
    content_hash: Mapped[str] = mapped_column(String(64))
    is_closed: Mapped[bool] = mapped_column(Boolean, default=False)
    first_collected_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.now
    )
    last_checked_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.now, onupdate=datetime.now
    )
