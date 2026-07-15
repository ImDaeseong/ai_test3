"""Stage 3: build_chunks.

Splits each cleaned posting into small typed chunks, following the chunk shape defined in
docs/design/AI_DATA_STRATEGY.md (`EmbeddableChunk`) and the "small typed chunks, not whole
documents" rule from docs/integration/RAG_EMBEDDING_PLAN.md.
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from tasks.paths import CHUNKS_DIR, CLEAN_DIR

SCHEMA_VERSION = "pipeline-chunk-v1"


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _make_chunk(
    posting_id: str,
    field: str,
    index: int,
    text: str,
    source_type: str = "job_requirement",
) -> dict[str, Any]:
    return {
        "id": f"{posting_id}:{field}:{index}",
        "ownerUserId": None,
        "sourceType": source_type,
        "visibility": "public_taxonomy",
        "textForEmbedding": text,
        "sourceRecordId": posting_id,
        "sourceField": field,
        "piiRisk": "low",
        "consentBasis": "public_data",
        "schemaVersion": SCHEMA_VERSION,
        "createdAt": _now_iso(),
    }


def build_chunks_for_posting(posting: dict[str, Any]) -> list[dict[str, Any]]:
    posting_id = posting["postingId"]
    chunks: list[dict[str, Any]] = []

    chunks.append(_make_chunk(posting_id, "title", 0, posting["title"]))

    for i, skill in enumerate(posting.get("requiredSkills", [])):
        chunks.append(_make_chunk(posting_id, "requiredSkill", i, skill))

    for i, skill in enumerate(posting.get("preferredSkills", [])):
        chunks.append(_make_chunk(posting_id, "preferredSkill", i, skill))

    description = posting.get("descriptionText")
    if description:
        chunks.append(_make_chunk(posting_id, "descriptionText", 0, description))

    return chunks


def build_chunks(input_dir: Path = CLEAN_DIR, output_dir: Path = CHUNKS_DIR) -> list[Path]:
    output_dir.mkdir(parents=True, exist_ok=True)
    written: list[Path] = []

    for clean_file in sorted(input_dir.glob("*.json")):
        posting = json.loads(clean_file.read_text(encoding="utf-8"))
        chunks = build_chunks_for_posting(posting)

        out_path = output_dir / clean_file.name
        out_path.write_text(json.dumps(chunks, ensure_ascii=False, indent=2), encoding="utf-8")
        written.append(out_path)

    return written


if __name__ == "__main__":
    files = build_chunks()
    print(f"build_chunks: wrote chunks for {len(files)} posting(s)")
