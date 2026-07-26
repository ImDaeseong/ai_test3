from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "JobKorea AI Job Intelligence"
    database_url: str = "sqlite+aiosqlite:///./jobkorea.db"

    jobkorea_base_url: str = "https://www.jobkorea.co.kr"
    joblist_path: str = "/recruit/joblist?menucode=duty"

    request_min_delay: float = 5.0
    request_max_delay: float = 12.0
    request_timeout: float = 30.0
    max_list_pages: int = 1
    user_agent: str = (
        "JobKoreaPersonalResearchBot/0.1 "
        "(+personal portfolio research; contact: change-me@example.com)"
    )

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
