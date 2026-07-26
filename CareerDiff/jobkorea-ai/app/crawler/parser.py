import re
from dataclasses import dataclass
from urllib.parse import urljoin, urlparse, parse_qs

from bs4 import BeautifulSoup

from app.core.config import get_settings


@dataclass(slots=True)
class JobListItem:
    job_id: str
    company_name: str
    title: str
    source_url: str
    summary: str = ""
    location: str | None = None
    career: str | None = None
    deadline: str | None = None


@dataclass(slots=True)
class JobDetail:
    summary: str
    requirements: str
    preferred: str
    company_name: str = ""


# 잡코리아 공개 페이지에 공통으로 붙는 UI 상용구. classify()가 "AI추천공고" 같은 문구의
# "AI"를 실제 직무 조건으로 오인하지 않도록 파싱 단계에서 미리 제거한다.
_BOILERPLATE_PATTERNS = [
    re.compile(pattern)
    for pattern in (
        r"로그인\s*하고\s*비슷한\s*조건의\s*AI추천공고를\s*확인해\s*보세요!?",
        r"채용정보에\s*잘못된\s*내용이\s*있을\s*경우\s*문의\s*해주세요\.?",
        r"즐겨찾기",
        r"스크랩",
        r"지도보기",
        r"인근지하철",
        r"\bTOP\b",
        r"궁금해요",
    )
]


def _strip_boilerplate(text: str) -> str:
    for pattern in _BOILERPLATE_PATTERNS:
        text = pattern.sub(" ", text)
    return " ".join(text.split())


def _text(node) -> str:
    return " ".join(node.get_text(" ", strip=True).split()) if node else ""


def _extract_job_id(url: str) -> str:
    parsed = urlparse(url)
    query = parse_qs(parsed.query)
    for key in ("GI_No", "gi_no", "Gno", "gno"):
        if query.get(key):
            return query[key][0]
    match = re.search(r"(?:GI_Read|GI_No)[=/](\d+)", url, re.I)
    return match.group(1) if match else url


def parse_job_list(html: str) -> list[JobListItem]:
    """공개 직무별 목록에서 GI_Read 링크를 중심으로 공고를 찾는다.

    잡코리아 DOM 변경에 대비해 특정 클래스 하나에만 의존하지 않는다. 한 공고 카드 안에
    회사명 앵커와 제목 앵커가 같은 GI_Read 링크를 공유하는 경우(현재 사이트 구조)가 있어,
    같은 job_id로 모인 앵커 텍스트 중 가장 긴 것을 제목, 가장 짧은 것을 회사명으로 본다.
    """
    settings = get_settings()
    soup = BeautifulSoup(html, "html.parser")
    order: list[str] = []
    grouped: dict[str, dict] = {}

    for anchor in soup.select('a[href*="/Recruit/GI_Read"], a[href*="/recruit/gi_read"]'):
        href = anchor.get("href")
        text = _text(anchor)
        if not href or not text:
            continue

        url = urljoin(settings.jobkorea_base_url, href)
        job_id = _extract_job_id(url)
        if job_id not in grouped:
            grouped[job_id] = {
                "url": url,
                "texts": [],
                "container": anchor.find_parent(["li", "article", "div"]),
            }
            order.append(job_id)
        grouped[job_id]["texts"].append(text)

    results: list[JobListItem] = []
    for job_id in order:
        entry = grouped[job_id]
        texts = entry["texts"]
        title = max(texts, key=len)
        company = min(texts, key=len) if len(texts) > 1 and min(texts, key=len) != title else ""

        container = entry["container"]
        container_text = _strip_boilerplate(_text(container))
        location = None
        career = None
        deadline = None

        if container:
            if not company:
                company_node = container.select_one(
                    ".company-name, .name, .corp-name, [class*='company'], "
                    "[data-sentry-component*='Company' i]"
                )
                company = _text(company_node)

            location_match = re.search(
                r"(서울|경기|인천|대전|세종|충남|충북|광주|전남|전북|대구|경북|부산|울산|경남|강원|제주|해외)[^\s,•]*",
                container_text,
            )
            career_match = re.search(r"(경력무관|신입|경력\s*\d+년\s*↑?|신입·경력[^•,]*)", container_text)
            deadline_match = re.search(
                r"(\d{2}/\d{2}[^•]*마감|오늘마감|내일마감|상시채용|D-\d+)", container_text
            )
            location = location_match.group(0) if location_match else None
            career = career_match.group(0) if career_match else None
            deadline = deadline_match.group(0) if deadline_match else None

        results.append(
            JobListItem(
                job_id=job_id,
                company_name=company,
                title=title,
                source_url=entry["url"],
                summary=container_text[:2000],
                location=location,
                career=career,
                deadline=deadline,
            )
        )
    return results


def parse_job_detail(html: str) -> JobDetail:
    soup = BeautifulSoup(html, "html.parser")

    # "AI추천공고" 위젯은 실제 공고 내용과 무관해 classify()의 AI 키워드를 오염시킨다.
    # 문구 매칭보다 확실하도록 해당 컴포넌트 자체를 텍스트 추출 전에 제거한다.
    for widget in soup.select('[data-sentry-component="AIRecommendList"]'):
        widget.decompose()

    # 구조가 바뀌어도 텍스트 전체를 안전한 폴백으로 사용한다.
    main = soup.select_one(
        "#container, main, .recruitment-detail, .job-detail, [class*='detail']"
    ) or soup.body
    full_text = _strip_boilerplate(_text(main))

    company_name = _text(soup.select_one('[data-sentry-component="CompanyName"]'))

    def section(names: list[str]) -> str:
        for heading in soup.find_all(["h2", "h3", "h4", "strong", "dt"]):
            heading_text = _text(heading)
            if any(name in heading_text for name in names):
                sibling = heading.find_next(["div", "dd", "p", "ul", "section"])
                value = _strip_boilerplate(_text(sibling))
                if value:
                    return value[:10000]
        return ""

    requirements = section(["자격요건", "지원자격", "필수사항"])
    preferred = section(["우대사항", "우대조건"])

    if not requirements and not preferred:
        # 현재 사이트는 자격요건/우대사항을 나누지 않고 "지원자격" 카드 하나로 합쳐
        # data-sentry-component="Qualification"에 담는다. "우대" 표기를 기준으로 나눈다.
        qualification_text = _strip_boilerplate(
            _text(soup.select_one('[data-sentry-component="Qualification"]'))
        )
        if qualification_text:
            marker = qualification_text.find("우대")
            if marker != -1:
                requirements = qualification_text[:marker]
                preferred = qualification_text[marker:]
            else:
                requirements = qualification_text

    guidelines_text = _strip_boilerplate(
        _text(soup.select_one('[data-sentry-component="RecruitmentGuidelines"]'))
    )
    summary = (
        section(["주요업무", "담당업무", "직무내용"])
        or guidelines_text
        or full_text[:15000]
    )

    return JobDetail(
        summary=summary,
        requirements=requirements[:10000],
        preferred=preferred[:10000],
        company_name=company_name,
    )
