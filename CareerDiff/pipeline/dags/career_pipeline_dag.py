"""CareerDiff learning pipeline DAG.

collect_job -> clean_data -> build_chunks -> embed_chunks -> store_vectors
            -> update_rag_index -> notify_complete

See docs/integration/AIRFLOW_PIPELINE_PLAN.md for scope, security boundary, and acceptance
criteria. All business logic lives in tasks/*.py as plain functions so it can be unit-tested
without an Airflow runtime; this file only wires those functions into an Airflow DAG.
"""

from __future__ import annotations

import sys
from datetime import datetime
from pathlib import Path

from airflow import DAG
from airflow.operators.python import PythonOperator

# Airflow ships DAGs standalone, so make the sibling `tasks` package importable.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from tasks.build_chunks import build_chunks
from tasks.clean_data import clean_data
from tasks.collect_job import collect_job
from tasks.embed_chunks import embed_chunks
from tasks.notify_complete import notify_complete
from tasks.store_vectors import store_vectors
from tasks.update_rag_index import update_rag_index

default_args = {
    "owner": "careerdiff",
    "retries": 1,
}

with DAG(
    dag_id="career_pipeline_dag",
    description="Learning pipeline: sample postings -> clean -> chunk -> embed -> vector store -> RAG index",
    default_args=default_args,
    schedule=None,  # manual trigger only for this learning pipeline
    start_date=datetime(2026, 1, 1),
    catchup=False,
    tags=["careerdiff", "learning", "rag"],
) as dag:
    collect = PythonOperator(task_id="collect_job", python_callable=collect_job)
    clean = PythonOperator(task_id="clean_data", python_callable=clean_data)
    chunk = PythonOperator(task_id="build_chunks", python_callable=build_chunks)
    embed = PythonOperator(task_id="embed_chunks", python_callable=embed_chunks)
    store = PythonOperator(task_id="store_vectors", python_callable=store_vectors)
    reindex = PythonOperator(task_id="update_rag_index", python_callable=update_rag_index)
    notify = PythonOperator(task_id="notify_complete", python_callable=notify_complete)

    collect >> clean >> chunk >> embed >> store >> reindex >> notify
