"""End-to-end test of the task functions, run with isolated tmp_path directories so it never
touches pipeline/data/work and never requires Airflow itself to be installed.
"""

from __future__ import annotations

import json
import sqlite3

import pytest

from tasks.build_chunks import build_chunks
from tasks.clean_data import clean_data, strip_html
from tasks.collect_job import collect_job
from tasks.embed_chunks import embed_chunks
from tasks.embedding_provider import LocalHashEmbeddingProvider
from tasks.notify_complete import notify_complete
from tasks.paths import SAMPLE_POSTINGS_DIR
from tasks.store_vectors import store_vectors
from tasks.update_rag_index import update_rag_index


def test_strip_html_removes_tags_and_collapses_whitespace():
    html = "<p>Node.js와  <b>TypeScript</b></p><ul><li>필수</li></ul>"
    assert strip_html(html) == "Node.js와 TypeScript 필수"


def test_sample_postings_are_synthetic_only():
    for f in SAMPLE_POSTINGS_DIR.glob("*.json"):
        posting = json.loads(f.read_text(encoding="utf-8"))
        assert posting["source"] == "synthetic_sample"


def test_collect_job_work24_without_api_key_fails_closed(tmp_path, monkeypatch):
    monkeypatch.setenv("JOB_DATA_SOURCE", "work24")
    monkeypatch.delenv("WORK24_API_KEY", raising=False)

    try:
        with pytest.raises(RuntimeError, match="WORK24_API_KEY"):
            collect_job(output_dir=tmp_path / "raw")
    finally:
        monkeypatch.delenv("JOB_DATA_SOURCE", raising=False)


def test_full_pipeline_runs_end_to_end(tmp_path):
    raw_dir = tmp_path / "raw"
    clean_dir = tmp_path / "clean"
    chunks_dir = tmp_path / "chunks"
    embeddings_dir = tmp_path / "embeddings"
    db_path = tmp_path / "vector_store.sqlite3"
    manifest_path = tmp_path / "rag_index_manifest.json"

    raw_files = collect_job(output_dir=raw_dir)
    assert len(raw_files) == 3

    clean_files = clean_data(input_dir=raw_dir, output_dir=clean_dir)
    assert len(clean_files) == 3
    for f in clean_files:
        posting = json.loads(f.read_text(encoding="utf-8"))
        assert "rawHtml" not in posting
        assert posting["descriptionText"]

    chunk_files = build_chunks(input_dir=clean_dir, output_dir=chunks_dir)
    assert len(chunk_files) == 3

    embed_files = embed_chunks(
        input_dir=chunks_dir, output_dir=embeddings_dir, provider=LocalHashEmbeddingProvider()
    )
    assert len(embed_files) == 3
    for f in embed_files:
        chunks = json.loads(f.read_text(encoding="utf-8"))
        assert all(len(c["vector"]) > 0 for c in chunks)

    row_count = store_vectors(input_dir=embeddings_dir, db_path=db_path)
    assert row_count > 0

    conn = sqlite3.connect(db_path)
    try:
        stored = conn.execute("SELECT COUNT(*) FROM vector_chunks").fetchone()[0]
        assert stored == row_count
    finally:
        conn.close()

    manifest = update_rag_index(db_path=db_path, manifest_path=manifest_path)
    assert manifest["totalChunks"] == row_count
    assert manifest["distinctPostings"] == 3

    message = notify_complete(manifest_path=manifest_path)
    assert "RAG index updated" in message
    assert str(row_count) in message
