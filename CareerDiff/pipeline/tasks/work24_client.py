"""Client for the 고용24(work24.go.kr) 워크넷 채용정보 Open API — a public, government-run open
data API (legitimate ToS-compliant alternative to scraping JobKorea, see
docs/integration/AIRFLOW_PIPELINE_PLAN.md).

IMPORTANT — verify before trusting this against real data:
This module's endpoint and field names come from public documentation
(https://www.work24.go.kr/cm/e/a/0110/selectOpenApiSvcInfo.do , https://www.data.go.kr/data/3038225/openapi.do),
not from a live test call — an actual call requires an issued 인증키 (auth key) that only the
project owner can register for. Before relying on this in a real run:
  1. Register for an auth key at work24.go.kr Open API center.
  2. Run `fetch_postings_xml(api_key, display=1)` once and save the raw response to
     `tests/fixtures/work24_sample_response.xml`.
  3. Compare actual tag names against `parse_work24_xml` below and adjust if the live API differs.
This ships as an opt-in path (`JOB_DATA_SOURCE=work24`); the default pipeline behavior is
unaffected and keeps using local sample data.
"""

from __future__ import annotations

import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from typing import Any

WORK24_ENDPOINT = "https://www.work24.go.kr/cm/openApi/call/wk/callOpenApiSvcInfo210L01.do"


def fetch_postings_xml(
    api_key: str,
    start_page: int = 1,
    display: int = 10,
    keyword: str | None = None,
    timeout: float = 10.0,
) -> str:
    """Calls the work24 job-posting-list Open API and returns the raw XML response text."""
    params: dict[str, Any] = {
        "authKey": api_key,
        "callTp": "L",
        "returnType": "XML",
        "startPage": start_page,
        "display": display,
    }
    if keyword:
        params["keyword"] = keyword

    url = f"{WORK24_ENDPOINT}?{urllib.parse.urlencode(params)}"
    with urllib.request.urlopen(url, timeout=timeout) as response:  # noqa: S310 - fixed gov endpoint
        return response.read().decode("utf-8")


def parse_work24_xml(xml_text: str) -> list[dict[str, Any]]:
    """Parses a work24 job-posting-list XML response into CareerDiff's internal posting shape
    (same shape as pipeline/data/sample_postings/*.json), so downstream clean/chunk/embed stages
    do not need to know which source produced the data.
    """
    root = ET.fromstring(xml_text)
    postings: list[dict[str, Any]] = []

    for wanted in root.iter("wanted"):

        def field(tag: str, default: str = "") -> str:
            el = wanted.find(tag)
            return (el.text or default).strip() if el is not None and el.text else default

        posting_id = field("id") or field("wantedAuthNo")
        if not posting_id:
            continue

        postings.append(
            {
                "postingId": f"work24-{posting_id}",
                "source": "work24_open_api",
                "title": field("title"),
                "company": field("company"),
                "postedAt": field("regDt"),
                "rawHtml": _build_description(field),
                "requiredSkills": [],
                "preferredSkills": [],
                "domain": [field("jobCategory")] if field("jobCategory") else [],
                "seniority": field("career"),
            }
        )

    return postings


def _build_description(field) -> str:
    """work24's list endpoint does not return free-text job description body — only structured
    summary fields. Build a short HTML-ish summary from those so clean_data's HTML stripping still
    applies uniformly regardless of source.
    """
    parts = [
        f"<p>{field('title')} - {field('company')}</p>",
        f"<ul><li>지역: {field('region')}</li>",
        f"<li>경력: {field('career')}</li>",
        f"<li>학력: {field('education')}</li>",
        f"<li>급여: {field('sal')}</li></ul>",
    ]
    return "".join(parts)
