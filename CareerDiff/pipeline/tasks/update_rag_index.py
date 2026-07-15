"""Stage 6: update_rag_index.

Rebuilds a small JSON manifest describing the current vector store contents. This is a stand-in
for a real RAG index refresh (e.g. rebuilding an ANN index) — here it just summarizes what is
retrievable, so a downstream RAG step could sanity-check freshness before querying.
"""

from __future__ import annotations

import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path

from tasks.paths import RAG_INDEX_MANIFEST_PATH, VECTOR_STORE_PATH


def update_rag_index(
    db_path: Path = VECTOR_STORE_PATH, manifest_path: Path = RAG_INDEX_MANIFEST_PATH
) -> dict:
    conn = sqlite3.connect(db_path)
    try:
        total = conn.execute("SELECT COUNT(*) FROM vector_chunks").fetchone()[0]
        by_source_type = dict(
            conn.execute(
                "SELECT source_type, COUNT(*) FROM vector_chunks GROUP BY source_type"
            ).fetchall()
        )
        distinct_postings = conn.execute(
            "SELECT COUNT(DISTINCT source_record_id) FROM vector_chunks"
        ).fetchone()[0]
    finally:
        conn.close()

    manifest = {
        "updatedAt": datetime.now(timezone.utc).isoformat(),
        "totalChunks": total,
        "distinctPostings": distinct_postings,
        "chunksBySourceType": by_source_type,
        "vectorStorePath": str(db_path),
    }

    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    return manifest


if __name__ == "__main__":
    result = update_rag_index()
    print(f"update_rag_index: {result['totalChunks']} chunks across {result['distinctPostings']} posting(s)")
