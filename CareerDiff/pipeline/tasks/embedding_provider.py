"""EmbeddingProvider interface, mirroring app's docs/integration/RAG_EMBEDDING_PLAN.md contract.

Default provider is a local, deterministic, zero-cost fallback (hash-based) so the pipeline
runs end-to-end with no network calls and no API key. A real OpenAI provider is opt-in via
EMBEDDING_PROVIDER=openai, matching how app/ gates OPENAI_API_KEY.
"""

from __future__ import annotations

import hashlib
import os
from typing import Protocol

EMBEDDING_DIM = 16


class EmbeddingProvider(Protocol):
    def embed(self, text: str) -> list[float]: ...
    def embed_batch(self, texts: list[str]) -> list[list[float]]: ...


class LocalHashEmbeddingProvider:
    """Deterministic, dependency-free stand-in for a real embedding model.

    Not semantically meaningful — only used so the rest of the pipeline (vector store,
    RAG index) has real numeric vectors to store and count without any external call.
    """

    def embed(self, text: str) -> list[float]:
        digest = hashlib.sha256(text.encode("utf-8")).digest()
        return [digest[i] / 255.0 for i in range(EMBEDDING_DIM)]

    def embed_batch(self, texts: list[str]) -> list[list[float]]:
        return [self.embed(t) for t in texts]


class OpenAiEmbeddingProvider:
    """Optional real provider. Only imported/used when EMBEDDING_PROVIDER=openai."""

    def __init__(self, api_key: str, model: str = "text-embedding-3-small") -> None:
        self._api_key = api_key
        self._model = model

    def embed(self, text: str) -> list[float]:
        return self.embed_batch([text])[0]

    def embed_batch(self, texts: list[str]) -> list[list[float]]:
        from openai import OpenAI  # imported lazily so it's not a hard dependency

        client = OpenAI(api_key=self._api_key)
        response = client.embeddings.create(model=self._model, input=texts)
        return [item.embedding for item in response.data]


def get_embedding_provider() -> EmbeddingProvider:
    provider_name = os.environ.get("EMBEDDING_PROVIDER", "local").lower()
    if provider_name == "openai":
        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key:
            raise RuntimeError(
                "EMBEDDING_PROVIDER=openai requires OPENAI_API_KEY to be set"
            )
        return OpenAiEmbeddingProvider(api_key=api_key)
    return LocalHashEmbeddingProvider()
