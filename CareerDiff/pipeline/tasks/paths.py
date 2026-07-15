"""Shared filesystem layout for the pipeline. Every stage reads/writes here so
each task script stays a plain, independently testable function (no Airflow
context required to run the business logic).
"""

from __future__ import annotations

from pathlib import Path

PIPELINE_ROOT = Path(__file__).resolve().parent.parent
DATA_ROOT = PIPELINE_ROOT / "data"

SAMPLE_POSTINGS_DIR = DATA_ROOT / "sample_postings"
WORK_ROOT = DATA_ROOT / "work"

RAW_DIR = WORK_ROOT / "raw"
CLEAN_DIR = WORK_ROOT / "clean"
CHUNKS_DIR = WORK_ROOT / "chunks"
EMBEDDINGS_DIR = WORK_ROOT / "embeddings"
VECTOR_STORE_PATH = WORK_ROOT / "vector_store.sqlite3"
RAG_INDEX_MANIFEST_PATH = WORK_ROOT / "rag_index_manifest.json"


def ensure_work_dirs() -> None:
    for d in (RAW_DIR, CLEAN_DIR, CHUNKS_DIR, EMBEDDINGS_DIR):
        d.mkdir(parents=True, exist_ok=True)
