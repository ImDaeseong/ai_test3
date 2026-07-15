"""Stage 7: notify_complete.

Logs a completion summary. No real email/Slack/webhook call — this is a mock notification step
for the learning pipeline (docs/integration/AIRFLOW_PIPELINE_PLAN.md HOLD: no real external
notification integration in this phase).
"""

from __future__ import annotations

import json
from pathlib import Path

from tasks.paths import RAG_INDEX_MANIFEST_PATH


def notify_complete(manifest_path: Path = RAG_INDEX_MANIFEST_PATH) -> str:
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    message = (
        f"[CareerDiff pipeline] RAG index updated at {manifest['updatedAt']}: "
        f"{manifest['totalChunks']} chunks / {manifest['distinctPostings']} posting(s)."
    )
    print(message)
    return message


if __name__ == "__main__":
    notify_complete()
