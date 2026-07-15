"""Stage 1: collect_job.

Default source is synthetic sample postings only. Real JobKorea scraping is not implemented and
must not be added without a separate ToS review + HOLD sign-off (see
docs/integration/AIRFLOW_PIPELINE_PLAN.md) — Korean courts have found unauthorized crawling of
JobKorea's own postings unlawful in a prior case, so that path stays closed.

Opt-in real source: JOB_DATA_SOURCE=work24 + WORK24_API_KEY calls the government-run 고용24 Open
API instead (see tasks/work24_client.py). Default (no env vars set) stays on local sample data.
"""

from __future__ import annotations

import json
import os
from pathlib import Path

from tasks.paths import RAW_DIR, SAMPLE_POSTINGS_DIR, ensure_work_dirs
from tasks.work24_client import fetch_postings_xml, parse_work24_xml


def _collect_from_samples(source_dir: Path) -> list[dict]:
    postings = []
    for posting_file in sorted(source_dir.glob("*.json")):
        postings.append(json.loads(posting_file.read_text(encoding="utf-8")))
    return postings


def _collect_from_work24(api_key: str) -> list[dict]:
    xml_text = fetch_postings_xml(api_key=api_key, display=10)
    return parse_work24_xml(xml_text)


def collect_job(
    source_dir: Path = SAMPLE_POSTINGS_DIR, output_dir: Path = RAW_DIR
) -> list[Path]:
    ensure_work_dirs()
    output_dir.mkdir(parents=True, exist_ok=True)

    data_source = os.environ.get("JOB_DATA_SOURCE", "sample").lower()
    if data_source == "work24":
        api_key = os.environ.get("WORK24_API_KEY")
        if not api_key:
            raise RuntimeError("JOB_DATA_SOURCE=work24 requires WORK24_API_KEY to be set")
        postings = _collect_from_work24(api_key)
    else:
        postings = _collect_from_samples(source_dir)

    written: list[Path] = []
    for posting in postings:
        out_path = output_dir / f"{posting['postingId']}.json"
        out_path.write_text(json.dumps(posting, ensure_ascii=False, indent=2), encoding="utf-8")
        written.append(out_path)

    return written


if __name__ == "__main__":
    files = collect_job()
    print(f"collect_job: wrote {len(files)} raw posting(s)")
