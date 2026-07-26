import re
from dataclasses import dataclass

from app.filters.keywords import (
    AI_KEYWORDS,
    DATA_KEYWORDS,
    DEVELOPMENT_KEYWORDS,
    EXCLUSION_KEYWORDS,
    IT_CONTEXT_KEYWORDS,
    LEADERSHIP_KEYWORDS,
    OVERSEAS_KEYWORDS,
)


@dataclass(slots=True)
class Classification:
    accepted: bool
    categories: list[str]
    matched_keywords: list[str]
    score: int
    level: str
    reasons: list[str]


def normalize(text: str) -> str:
    # C#, C++, .NET 식별에 필요한 문자는 보존한다.
    return re.sub(r"\s+", " ", text or "").strip()


def _contains(text: str, keyword: str) -> bool:
    if keyword.upper() == "AI":
        return bool(re.search(r"(?<![A-Za-z])AI(?![A-Za-z])", text, re.I))
    if keyword == "C#":
        return bool(re.search(r"(?<![A-Za-z0-9])C#(?![A-Za-z0-9])", text, re.I))
    if keyword == "Golang":
        return bool(re.search(r"(?<![A-Za-z])Golang(?![A-Za-z])", text, re.I))
    return keyword.casefold() in text.casefold()


def _matches(text: str, keywords: list[str]) -> list[str]:
    return [keyword for keyword in keywords if _contains(text, keyword)]


def classify(text: str) -> Classification:
    text = normalize(text)

    ai = _matches(text, AI_KEYWORDS)
    dev = _matches(text, DEVELOPMENT_KEYWORDS)
    data = _matches(text, DATA_KEYWORDS)
    leadership = _matches(text, LEADERSHIP_KEYWORDS)
    overseas = _matches(text, OVERSEAS_KEYWORDS)
    exclusions = _matches(text, EXCLUSION_KEYWORDS)
    has_it_context = bool(_matches(text, IT_CONTEXT_KEYWORDS))

    # 광범위한 관리자/해외 공고는 IT 문맥이 있어야 한다.
    broad_role = any(word in text for word in ("팀장", "파트장", "센터장"))
    broad_overseas = bool(overseas) and not (ai or dev or data or leadership)

    accepted = bool(ai or dev or data or leadership or overseas)
    if broad_role and not has_it_context:
        accepted = False
    if broad_overseas and not has_it_context:
        accepted = False
    if exclusions and not (ai or dev or data):
        accepted = False

    categories: list[str] = []
    if ai:
        categories.append("AI")
    if dev:
        categories.append("개발")
    if data:
        categories.append("데이터")
    if leadership:
        categories.append("관리자")
    if overseas:
        categories.append("해외근무")

    score = 0
    reasons: list[str] = []

    score_map = {
        "CTO": 30, "연구소장": 30, "개발총괄": 30,
        "개발팀장": 25, "기술팀장": 25, "AI팀장": 25, "데이터팀장": 25,
        "C#": 12, "MFC": 12, ".NET": 12,
        "Python": 10, "AI": 10, "LLM": 10, "RAG": 10,
        "Golang": 8, "주재원": 15, "해외법인": 15, "법인장": 15,
    }
    matched = list(dict.fromkeys(ai + dev + data + leadership + overseas))
    for keyword in matched:
        weight = score_map.get(keyword, 4)
        score += weight
        reasons.append(f"{keyword} 조건 일치")

    score = min(score, 100)
    if score >= 90:
        level = "매우 적합"
    elif score >= 75:
        level = "적합"
    elif score >= 60:
        level = "검토 권장"
    elif score >= 40:
        level = "일부 조건 일치"
    else:
        level = "낮은 일치도"

    return Classification(
        accepted=accepted,
        categories=categories,
        matched_keywords=matched,
        score=score,
        level=level,
        reasons=reasons,
    )
