# CareerDiff Learning Pipeline (Airflow)

A standalone, learning/portfolio-oriented Airflow DAG that demonstrates the crawl → clean →
embed → vector store → RAG index data flow described in the root `README.md`'s Airflow
explanation. It does not connect to the `app/` product — see
[`docs/integration/AIRFLOW_PIPELINE_PLAN.md`](../docs/integration/AIRFLOW_PIPELINE_PLAN.md) for
full scope, security boundary, and HOLD conditions. For the step-by-step rollout order (what's
done, what's next, and the manual-verification gate before any real data source gets automated),
see [`docs/integration/PIPELINE_ROLLOUT_PLAN.md`](../docs/integration/PIPELINE_ROLLOUT_PLAN.md).

**Important**: `collect_job` defaults to local synthetic sample data
(`data/sample_postings/*.json`). It never crawls JobKorea or any other job board's live site —
that was reviewed and stays closed permanently (a Korean court has already ruled unauthorized
JobKorea crawling unlawful in a directly on-point case; see
`docs/integration/AIRFLOW_PIPELINE_PLAN.md`). The only real-data opt-in is the government-run
고용24 (work24.go.kr) Open API — see "Opting into real job data" below.

## Pipeline stages

```
collect_job -> clean_data -> build_chunks -> embed_chunks -> store_vectors -> update_rag_index -> notify_complete
```

| Stage | What it does |
| --- | --- |
| `collect_job` | Reads mock postings from `data/sample_postings/` (default), or work24 Open API (opt-in) |
| `clean_data` | Strips HTML, normalizes whitespace, dedupes by `postingId` |
| `build_chunks` | Splits each posting into small typed chunks (title/skill/description) |
| `embed_chunks` | Embeds chunks via `EmbeddingProvider` (local, zero-cost, by default) |
| `store_vectors` | Upserts vectors + metadata into a local SQLite vector store |
| `update_rag_index` | Rebuilds `data/work/rag_index_manifest.json` with chunk/posting counts |
| `notify_complete` | Logs a completion summary (no real email/webhook call) |

## Run tests (no Docker/Airflow required)

Task logic lives in `tasks/*.py` as plain functions, independently testable:

```powershell
cd pipeline
pip install -r requirements.txt   # or: pip install pytest
python -m py_compile dags/career_pipeline_dag.py tasks/*.py
python -m pytest tests/ -v
```

## Run the DAG in Airflow (Docker Compose)

Requires Docker Desktop.

```powershell
cd pipeline
docker compose up -d
# wait for airflow-init to finish seeding the DB/admin user
```

Open http://localhost:8080 (login: `airflow` / `airflow`), find `career_pipeline_dag`, and
trigger it manually (`schedule=None` — this pipeline is not on a cron schedule by design, since
it is a learning artifact, not a production job).

Or trigger from the CLI:

```powershell
docker compose exec airflow-scheduler airflow dags trigger career_pipeline_dag
```

Check results:

```powershell
docker compose exec airflow-scheduler python -c "import json,sys; print(json.load(open('/opt/airflow/data/work/rag_index_manifest.json')))"
```

Tear down:

```powershell
docker compose down
```

## Opting into a real embedding provider

By default `EMBEDDING_PROVIDER=local` uses a deterministic, dependency-free fallback — no network
calls, no API key. To use OpenAI embeddings instead:

```powershell
cp .env.example .env
# edit .env: EMBEDDING_PROVIDER=openai, OPENAI_API_KEY=sk-...
pip install openai
```

`docker-compose.yaml` reads `.env` automatically if present.

## Opting into real job data (work24 Open API)

By default `JOB_DATA_SOURCE=sample` reads local mock postings only. To pull real postings from
고용24's public Open API instead, follow **Phase 4** of
[`PIPELINE_ROLLOUT_PLAN.md`](../docs/integration/PIPELINE_ROLLOUT_PLAN.md) in full — run it as a
standalone script and manually review the output before this ever runs inside the scheduled DAG.
Summary:

1. Register for an auth key at the [work24 Open API center](https://www.work24.go.kr/cm/e/a/0110/selectOpenApiSvcInfo.do).
2. `cp .env.example .env` and set `JOB_DATA_SOURCE=work24` and `WORK24_API_KEY=<your key>`.
3. **Before trusting the output**: `tasks/work24_client.py`'s field mapping was built from public
   docs, not a live test call (no key was available while writing this). Run
   `python -c "from tasks.work24_client import fetch_postings_xml; print(fetch_postings_xml('<key>', display=1))"`
   once, save the output as `tests/fixtures/work24_sample_response.xml`, and re-run
   `pytest tests/test_work24_client.py -v` to confirm the field names in `parse_work24_xml` still
   match the real response — adjust the parser if they don't.
4. Missing `WORK24_API_KEY` while `JOB_DATA_SOURCE=work24` fails closed with a clear
   `RuntimeError` — it will not silently fall back to mock data.

This pipeline will never add a real crawler for JobKorea or any other job board directly; see the
HOLD conditions in `docs/integration/AIRFLOW_PIPELINE_PLAN.md`.

## Relationship to `app/`

This pipeline is intentionally decoupled from the Next.js app in `app/`. It does not write into
any database the app reads, and it does not call `AnalysisOrchestrator`. If `app/` later adopts
RAG for real (see `docs/integration/RAG_EMBEDDING_PLAN.md`), the chunk shape and
`EmbeddingProvider` interface proven here are the intended reference to port in — that is a
separate, explicit decision, not an automatic consequence of this pipeline existing.
