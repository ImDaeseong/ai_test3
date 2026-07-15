"""Stage 5: store_vectors.

Writes embedded chunks into a local SQLite-backed vector store. SQLite instead of pgvector/managed
vector DB keeps this learning pipeline dependency-free (docs/design/AI_DATA_STRATEGY.md lists
pgvector as the production recommendation; SQLite here is a stand-in with the same metadata shape).
"""

from __future__ import annotations

import json
import sqlite3
from pathlib import Path

from tasks.paths import EMBEDDINGS_DIR, VECTOR_STORE_PATH

_SCHEMA = """
CREATE TABLE IF NOT EXISTS vector_chunks (
    id TEXT PRIMARY KEY,
    source_record_id TEXT NOT NULL,
    source_type TEXT NOT NULL,
    source_field TEXT NOT NULL,
    visibility TEXT NOT NULL,
    pii_risk TEXT NOT NULL,
    consent_basis TEXT NOT NULL,
    schema_version TEXT NOT NULL,
    created_at TEXT NOT NULL,
    text_for_embedding TEXT NOT NULL,
    vector_json TEXT NOT NULL
);
"""


def store_vectors(
    input_dir: Path = EMBEDDINGS_DIR, db_path: Path = VECTOR_STORE_PATH
) -> int:
    db_path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(db_path)
    try:
        conn.execute(_SCHEMA)
        row_count = 0

        for embedding_file in sorted(input_dir.glob("*.json")):
            chunks = json.loads(embedding_file.read_text(encoding="utf-8"))
            for chunk in chunks:
                conn.execute(
                    """
                    INSERT OR REPLACE INTO vector_chunks
                        (id, source_record_id, source_type, source_field, visibility,
                         pii_risk, consent_basis, schema_version, created_at,
                         text_for_embedding, vector_json)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        chunk["id"],
                        chunk["sourceRecordId"],
                        chunk["sourceType"],
                        chunk["sourceField"],
                        chunk["visibility"],
                        chunk["piiRisk"],
                        chunk["consentBasis"],
                        chunk["schemaVersion"],
                        chunk["createdAt"],
                        chunk["textForEmbedding"],
                        json.dumps(chunk["vector"]),
                    ),
                )
                row_count += 1

        conn.commit()
        return row_count
    finally:
        conn.close()


if __name__ == "__main__":
    count = store_vectors()
    print(f"store_vectors: upserted {count} chunk(s)")
