"""Aggregate collected jobs.db rows into a skill/job-type trend Markdown report,
cross-referenced against a candidate profile JSON (LLM-Wiki style: crawl once,
compile a reusable summary doc instead of re-scanning raw postings each time).

Usage:
    python -m scripts.build_trend_report
    python -m scripts.build_trend_report --profile "../../candidate-profile-임대성.json"
"""

from __future__ import annotations

import argparse
import json
import re
import sqlite3
from collections import Counter
from pathlib import Path

JOBKOREA_AI_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_DB_PATH = JOBKOREA_AI_ROOT / "jobkorea.db"
DEFAULT_PROFILE_PATH = JOBKOREA_AI_ROOT.parent.parent / "candidate-profile-임대성.json"
DEFAULT_REPORT_PATH = JOBKOREA_AI_ROOT / "reports" / "skill_trend.md"


def _normalize_skill(skill: str) -> str:
    return re.sub(r"[^a-z0-9가-힣]", "", skill.lower())


def load_jobs(db_path: Path) -> list[dict]:
    con = sqlite3.connect(db_path)
    con.row_factory = sqlite3.Row
    rows = con.execute(
        "SELECT title, company_name, career, location, deadline, categories, "
        "matched_keywords, match_score, match_level, source_url FROM jobs "
        "ORDER BY match_score DESC"
    ).fetchall()
    con.close()

    jobs = []
    for row in rows:
        job = dict(row)
        job["categories"] = json.loads(job["categories"] or "[]")
        job["matched_keywords"] = json.loads(job["matched_keywords"] or "[]")
        jobs.append(job)
    return jobs


def load_candidate_skills(profile_path: Path) -> list[str]:
    profile = json.loads(profile_path.read_text(encoding="utf-8"))
    return profile.get("profile", {}).get("coreSkills") or profile.get("coreSkills", [])


def build_report(jobs: list[dict], candidate_skills: list[str]) -> str:
    skill_counter: Counter[str] = Counter()
    category_counter: Counter[str] = Counter()
    career_counter: Counter[str] = Counter()
    location_counter: Counter[str] = Counter()

    for job in jobs:
        skill_counter.update(job["matched_keywords"])
        category_counter.update(job["categories"])
        if job["career"]:
            career_counter[job["career"]] += 1
        if job["location"]:
            location_counter[job["location"]] += 1

    normalized_candidate_skills = {_normalize_skill(s): s for s in candidate_skills}
    matched_skills = []
    gap_skills = []
    for keyword, count in skill_counter.most_common():
        normalized = _normalize_skill(keyword)
        is_owned = any(
            normalized in cand_norm or cand_norm in normalized
            for cand_norm in normalized_candidate_skills
        )
        (matched_skills if is_owned else gap_skills).append((keyword, count))

    lines = ["# JobKorea 수집 채용공고 기술/직무 트렌드", ""]
    lines.append(f"- 수집 공고 수(필터 통과): {len(jobs)}건")
    lines.append(f"- 후보자 보유 기술 수: {len(candidate_skills)}개")
    lines.append("")
    lines.append(
        "> 이 리포트는 1회 목록 페이지(최근 채용 공고) 기준 소규모 샘플입니다. "
        "여러 페이지·여러 직무 카테고리를 반복 수집해 누적할수록 트렌드 신뢰도가 올라갑니다."
    )
    lines.append("")

    lines.append("## 직무 카테고리 분포")
    lines.append("")
    for category, count in category_counter.most_common():
        lines.append(f"- {category}: {count}건")
    lines.append("")

    lines.append("## 보유 기술과 일치하는 수요 (강점)")
    lines.append("")
    if matched_skills:
        for keyword, count in matched_skills:
            lines.append(f"- {keyword}: {count}건 매칭")
    else:
        lines.append("- 일치 항목 없음 (샘플 규모가 작거나 카테고리가 후보자 기술과 무관)")
    lines.append("")

    lines.append("## 후보자 미보유 기술 수요 (학습/보강 후보)")
    lines.append("")
    if gap_skills:
        for keyword, count in gap_skills[:20]:
            lines.append(f"- {keyword}: {count}건 매칭")
    else:
        lines.append("- 없음")
    lines.append("")

    lines.append("## 경력 조건 분포")
    lines.append("")
    for career, count in career_counter.most_common():
        lines.append(f"- {career}: {count}건")
    lines.append("")

    lines.append("## 지역 분포")
    lines.append("")
    for location, count in location_counter.most_common():
        lines.append(f"- {location}: {count}건")
    lines.append("")

    lines.append("## 매칭 점수 상위 공고")
    lines.append("")
    for job in jobs[:15]:
        lines.append(
            f"- [{job['match_score']}점/{job['match_level']}] {job['title']} "
            f"| {job['company_name']} | {', '.join(job['matched_keywords']) or '-'} "
            f"| {job['source_url']}"
        )
    lines.append("")

    return "\n".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--db", type=Path, default=DEFAULT_DB_PATH)
    parser.add_argument("--profile", type=Path, default=DEFAULT_PROFILE_PATH)
    parser.add_argument("--out", type=Path, default=DEFAULT_REPORT_PATH)
    args = parser.parse_args()

    jobs = load_jobs(args.db)
    candidate_skills = load_candidate_skills(args.profile)
    report = build_report(jobs, candidate_skills)

    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(report, encoding="utf-8")
    print(f"trend report written: {args.out} ({len(jobs)} jobs, {len(candidate_skills)} candidate skills)")


if __name__ == "__main__":
    main()
