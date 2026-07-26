from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.jobs import router
from app.core.config import get_settings
from app.core.database import initialize_database


@asynccontextmanager
async def lifespan(_: FastAPI):
    await initialize_database()
    yield


settings = get_settings()
app = FastAPI(title=settings.app_name, lifespan=lifespan)
app.include_router(router)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
