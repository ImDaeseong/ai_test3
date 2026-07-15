"""Stage 4: embed_chunks.

Calls the configured EmbeddingProvider (default: local, zero-cost, no network) for every chunk.
"""

from __future__ import annotations

import json
from pathlib import Path

from tasks.embedding_provider import EmbeddingProvider, get_embedding_provider
from tasks.paths import CHUNKS_DIR, EMBEDDINGS_DIR


def embed_chunks(
    input_dir: Path = CHUNKS_DIR,
    output_dir: Path = EMBEDDINGS_DIR,
    provider: EmbeddingProvider | None = None,
) -> list[Path]:
    provider = provider or get_embedding_provider()
    output_dir.mkdir(parents=True, exist_ok=True)
    written: list[Path] = []

    for chunk_file in sorted(input_dir.glob("*.json")):
        chunks = json.loads(chunk_file.read_text(encoding="utf-8"))
        texts = [c["textForEmbedding"] for c in chunks]
        vectors = provider.embed_batch(texts)

        embedded = [
            {**chunk, "vector": vector} for chunk, vector in zip(chunks, vectors, strict=True)
        ]

        out_path = output_dir / chunk_file.name
        out_path.write_text(json.dumps(embedded, ensure_ascii=False, indent=2), encoding="utf-8")
        written.append(out_path)

    return written


if __name__ == "__main__":
    files = embed_chunks()
    print(f"embed_chunks: wrote embeddings for {len(files)} posting(s)")
