# Airflow Learning Pipeline Plan

This document defines a standalone, learning/portfolio-oriented data pipeline (`pipeline/`) that
demonstrates how CareerDiff's future RAG data flow (crawl → clean → embed → vector store → RAG
index → notify) would be orchestrated with Apache Airflow. It intentionally does not change the
`app/` product or the existing MVP decisions in `SPEC.md`, `ARCHITECTURE.md`,
`docs/integration/RAG_EMBEDDING_PLAN.md`, and `docs/design/AI_DATA_STRATEGY.md`.

## One-sentence use case

나는 CareerDiff 포트폴리오를 준비하면서, `pipeline/`의 Airflow DAG로 채용공고 수집→정제→임베딩→VectorDB
저장→RAG 인덱스 갱신 흐름을 로컬에서 재현하고 검증해서, "RAG 파이프라인을 운영 자동화까지 설계할 수 있다"는
근거를 얻는다.

## Purpose

- Show a working Airflow DAG with realistic task boundaries (collect → clean → embed → store →
  index → notify), runnable locally via Docker Compose.
- Keep it decoupled from `app/`: this pipeline does not feed the running Next.js app, does not
  add a database dependency to `app/`, and does not change `AnalysisOrchestrator`.
- Serve as a resume/portfolio artifact: "Airflow-orchestrated RAG data pipeline" with real,
  runnable code and tests, not just a diagram.

## Non-goals

- Not a production pipeline. No scheduling against real traffic, no SLAs, no alerting beyond a
  logged/emailed-mock notification step.
- Not a replacement for the MVP decision to defer RAG in `app/` (`RAG_EMBEDDING_PLAN.md` still
  applies to the product).
- Does not integrate with `app/`'s API routes or database in this phase.

## Security / data boundary (HOLD condition carried over from ARCHITECTURE.md)

`ARCHITECTURE.md` already lists as a HOLD condition: *"The design requires scraping job boards
without checking terms."*

**Resolved 2026-07-15**: JobKorea's ToS was reviewed and this pipeline stays permanently closed
to real JobKorea crawling — do not lift this without new legal review:

- `robots.txt` explicitly disallows several job-search-relevant paths and blocks AI/scraper bots
  entirely.
- Korean courts have already ruled on a directly on-point case: JobKorea sued a competitor
  (Saramin) for unauthorized crawling of its own job postings and won, under 정보통신망법 /
  unfair-competition theories. This is not a hypothetical risk for this exact site.
- JobKorea's own Open API (`jobkorea.co.kr/service/api`) is restricted to public
  institutions/schools and is not realistically available for a personal project.

Instead, real job data (when wanted) comes from **고용24 (work24.go.kr) Open API** — a public,
government-run open-data API anyone can register for. This is now implemented as an opt-in path:

- `JOB_DATA_SOURCE=sample` (default): reads `pipeline/data/sample_postings/*.json` only.
- `JOB_DATA_SOURCE=work24` + `WORK24_API_KEY=<key>`: calls `tasks/work24_client.py`, which hits
  the documented work24 job-posting-list endpoint. Missing the key fails closed with a
  `RuntimeError`, it does not silently fall back to fake data.
- `tasks/work24_client.py`'s field mapping is built from public API documentation, not a captured
  real response (no key was available to test with during implementation) — see the verification
  step in that module's docstring before trusting it against production data.

Rule for this pipeline:

- `collect_job` never talks to JobKorea or any other job board directly. The only two data
  sources are local sample JSON and the work24 Open API.
- No API keys, tokens, or credentials for JobKorea or any scraped site are read, stored, or
  referenced anywhere in this pipeline.
- Sample data must be synthetic or clearly-labeled placeholder postings — no real personal data,
  no scraped content.
- Embedding calls default to a local/no-op provider (`EmbeddingProvider` interface, deterministic
  hash-based fallback) so the pipeline runs end-to-end with zero API cost and zero external calls
  by default. A real embedding provider (e.g., OpenAI) is opt-in via env var, same pattern as
  `app/`'s `OPENAI_API_KEY` gating.

## Pipeline stages (DAG: `career_pipeline_dag.py`)

```
collect_job -> clean_data -> build_chunks -> embed_chunks -> store_vectors -> update_rag_index -> notify_complete
```

| Task | Responsibility | I/O |
| --- | --- | --- |
| `collect_job` | Read mock postings (default) or work24 Open API postings (opt-in) | `data/sample_postings/*.json` or work24 API -> `data/work/raw/*.json` |
| `clean_data` | Normalize whitespace, strip HTML, dedupe by posting ID | raw JSON -> `data/work/clean/*.json` |
| `build_chunks` | Split each posting into small typed chunks (title, requirements, preferred, etc.) per `AI_DATA_STRATEGY.md` chunk rules | clean JSON -> `data/work/chunks/*.json` |
| `embed_chunks` | Call `EmbeddingProvider` (default: local deterministic fallback; optional: OpenAI) | chunks -> `data/work/embeddings/*.json` |
| `store_vectors` | Write vectors + metadata into local SQLite-backed vector store | embeddings -> `data/work/vector_store.sqlite3` |
| `update_rag_index` | Rebuild a simple JSON manifest describing the current index (counts, timestamp, source files) | vector store -> `data/work/rag_index_manifest.json` |
| `notify_complete` | Log a completion summary (task counts, duration); no real email/Slack call | manifest -> Airflow task log |

## Acceptance criteria

- `docker compose up` in `pipeline/` starts Airflow webserver + scheduler on a local port.
- The DAG `career_pipeline_dag` appears in the Airflow UI and can be triggered manually.
- A full DAG run succeeds end-to-end using only sample data, producing:
  - `data/work/vector_store.sqlite3` with rows for each posting chunk,
  - `data/work/rag_index_manifest.json` with a chunk/vector count > 0.
- Task scripts are independently unit-testable outside Airflow (plain Python functions, no
  Airflow-only globals inside business logic).
- No network calls occur unless `EMBEDDING_PROVIDER=openai` and `OPENAI_API_KEY` is set.

## Verification commands

```powershell
cd pipeline
python -m py_compile dags/career_pipeline_dag.py tasks/*.py
python -m pytest tests/ -v
docker compose up -d
# open http://localhost:8080 (default airflow/airflow), trigger career_pipeline_dag
docker compose down
```

## Human-review HOLD conditions

- Any change that adds a real network crawl of JobKorea or any other job board's live site
  (work24's public Open API is the only approved real data source; see above).
- Any change that stores real personal candidate data (even in `pipeline/data/`).
- Any change that makes this pipeline write into `app/`'s runtime data path or call
  `AnalysisOrchestrator` directly.
- Any change that makes `EMBEDDING_PROVIDER=openai` or `JOB_DATA_SOURCE=work24` the default
  (both must stay opt-in via explicit env vars).

## Relationship to existing docs

- `RAG_EMBEDDING_PLAN.md` and `AI_DATA_STRATEGY.md` remain the source of truth for chunk types,
  vector metadata rules, and when `app/` itself should add RAG. This pipeline reuses their chunk
  type vocabulary (`job_requirement`, etc.) for consistency but is not the same system.
- If/when `app/` adopts RAG for real, the `EmbeddingProvider` interface and chunking rules proven
  here are the intended reference implementation to port in.
- For the phase-by-phase rollout order (what's done, what's next, and the manual-verify-before-
  automate gate every real data source must pass), see
  `docs/integration/PIPELINE_ROLLOUT_PLAN.md`.
