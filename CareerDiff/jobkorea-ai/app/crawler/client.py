import asyncio
import random
import re
from urllib.parse import urljoin, urlparse
from urllib.robotparser import RobotFileParser

import httpx

from app.core.config import get_settings

CAPTCHA_PATTERNS = [
    re.compile(pattern, re.I)
    for pattern in ("captcha", "자동입력 방지", "비정상적인 접근", "접근이 제한")
]


class CrawlStopped(RuntimeError):
    pass


class JobKoreaClient:
    def __init__(self) -> None:
        self.settings = get_settings()
        self._client = httpx.AsyncClient(
            headers={
                "User-Agent": self.settings.user_agent,
                "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.7",
            },
            timeout=self.settings.request_timeout,
            follow_redirects=True,
        )
        self._robots = RobotFileParser(
            urljoin(self.settings.jobkorea_base_url, "/robots.txt")
        )
        self._robots.read()

    async def __aenter__(self) -> "JobKoreaClient":
        return self

    async def __aexit__(self, *_: object) -> None:
        await self._client.aclose()

    def _validate_url(self, url: str) -> None:
        parsed = urlparse(url)
        base = urlparse(self.settings.jobkorea_base_url)
        if parsed.scheme not in {"http", "https"} or parsed.netloc != base.netloc:
            raise CrawlStopped(f"허용되지 않은 도메인: {url}")
        if not self._robots.can_fetch(self.settings.user_agent, url):
            raise CrawlStopped(f"robots.txt에서 허용되지 않은 경로: {url}")

    async def get(self, url: str) -> str:
        self._validate_url(url)
        await asyncio.sleep(
            random.uniform(
                self.settings.request_min_delay,
                self.settings.request_max_delay,
            )
        )
        response = await self._client.get(url)

        if response.status_code in {403, 429}:
            raise CrawlStopped(f"접근 제한 응답 수신: HTTP {response.status_code}")
        response.raise_for_status()

        text = response.text
        if any(pattern.search(text) for pattern in CAPTCHA_PATTERNS):
            raise CrawlStopped("CAPTCHA 또는 접근 제한 화면이 감지되었습니다.")
        return text
