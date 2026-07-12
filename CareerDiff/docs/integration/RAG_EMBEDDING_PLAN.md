# RAG and Embedding Integration Plan

This document explains when and how CareerDiff should use embeddings, vector search, and RAG.

## Decision summary

Do not add vector search to the first MVP.

CareerDiff should first build reliable structured extraction, matching, scoring, and dashboard rendering. Add embeddings only when there is saved user data or reusable knowledge that benefits from semantic retrieval.

## Why not vector-first

Vector search is useful for retrieval, but CareerDiff's first problem is not search. The first problem is trustworthy structured comparison:

- What does the job require?
- What evidence does the candidate have?
- What is missing?
- What should be rewritten or built next?

These should be solved with schemas, feature services, and deterministic matching before adding vector infrastructure.

## When to add embeddings

Add embeddings when one of these becomes true:

- Users save multiple analyses.
- Users maintain a reusable project evidence library.
- The app compares many job descriptions against one candidate profile.
- The app retrieves relevant GitHub project evidence.
- The app supports career coaches or bootcamp cohorts.
- The app uses a job/skill taxonomy knowledge base.

## RAG architecture

```text
Saved source data
  -> privacy filter / redaction check
  -> structured extraction
  -> chunk creation
  -> embedding generation
  -> vector store
  -> retrieval
  -> reranking / filtering
  -> analysis prompt context
  -> schema-validated result
```

## Retrieval boundaries

RAG should retrieve evidence. It should not decide final truth alone.

The final analysis should still pass through:

- `EvidenceMatcher`,
- `FitScorer`,
- schema validation,
- privacy-safe response handling.

## Chunking strategy

Prefer small, typed chunks:

- one requirement per chunk,
- one project evidence item per chunk,
- one achievement or responsibility per chunk,
- one taxonomy entry per chunk.

Avoid huge chunks:

- whole resume,
- whole job description,
- whole GitHub README,
- whole analysis report.

## Search filters

Every retrieval query must filter by:

- `ownerUserId` or public taxonomy scope,
- visibility,
- source type,
- consent basis,
- PII risk if needed.

## Suggested retrieval use cases

### Candidate evidence retrieval

Query:

> Find saved project evidence related to Playwright, CI, testing, monitoring, and frontend QA.

Used for:

- stronger resume bullets,
- better evidence matching,
- mini project gap comparison.

### Job taxonomy retrieval

Query:

> Find public taxonomy information for frontend platform engineer requirements.

Used for:

- normalizing skill names,
- avoiding inconsistent labels,
- explaining why a skill matters.

### Historical analysis retrieval

Query:

> Find previous analyses where this candidate had similar missing evidence.

Used for:

- longitudinal preparation plan,
- progress tracking,
- repeated gap detection.

## Vector store choice

### First choice: PostgreSQL + pgvector

Best when:

- CareerDiff already uses PostgreSQL.
- Data volume is modest.
- Simplicity and privacy control matter.
- Relational filtering is important.

### Later choice: managed vector DB

Consider later if:

- vector volume grows heavily,
- latency becomes a bottleneck,
- hybrid search/reranking requirements grow,
- operational needs exceed PostgreSQL.

## Embedding provider boundary

Use an `EmbeddingProvider` interface.

```ts
export interface EmbeddingProvider {
  embed(input: string): Promise<number[]>;
  embedBatch(inputs: string[]): Promise<number[][]>;
}
```

Do not call an embedding provider directly from UI components or feature UI modules.

## Data deletion rule

If a source record is deleted, delete:

- normalized text,
- structured extraction tied to that source,
- analysis results tied to that source if requested,
- all vector chunks derived from that source,
- object-storage files derived from that source.

## MVP instruction

For the next implementation phase, create data contracts that allow embeddings later, but do not implement vector search yet.

Required now:

- stable IDs for structured items,
- source record references,
- confidence fields,
- schema version fields,
- source snippets kept separate from display text.

Deferred:

- embedding generation,
- vector DB,
- RAG retrieval,
- long-term saved evidence library.
