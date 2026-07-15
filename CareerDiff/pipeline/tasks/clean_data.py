"""Stage 2: clean_data.

Normalizes whitespace, strips HTML tags from rawHtml, and dedupes by postingId.
"""

from __future__ import annotations

import json
import re
from pathlib import Path

from tasks.paths import CLEAN_DIR, RAW_DIR

_TAG_RE = re.compile(r"<[^>]+>")
_WHITESPACE_RE = re.compile(r"\s+")


def strip_html(html: str) -> str:
    text = _TAG_RE.sub(" ", html)
    return _WHITESPACE_RE.sub(" ", text).strip()


def clean_data(input_dir: Path = RAW_DIR, output_dir: Path = CLEAN_DIR) -> list[Path]:
    output_dir.mkdir(parents=True, exist_ok=True)

    seen_posting_ids: set[str] = set()
    written: list[Path] = []

    for raw_file in sorted(input_dir.glob("*.json")):
        posting = json.loads(raw_file.read_text(encoding="utf-8"))
        posting_id = posting["postingId"]
        if posting_id in seen_posting_ids:
            continue
        seen_posting_ids.add(posting_id)

        cleaned = dict(posting)
        cleaned["descriptionText"] = strip_html(posting.get("rawHtml", ""))
        cleaned.pop("rawHtml", None)

        out_path = output_dir / raw_file.name
        out_path.write_text(json.dumps(cleaned, ensure_ascii=False, indent=2), encoding="utf-8")
        written.append(out_path)

    return written


if __name__ == "__main__":
    files = clean_data()
    print(f"clean_data: wrote {len(files)} clean posting(s)")
