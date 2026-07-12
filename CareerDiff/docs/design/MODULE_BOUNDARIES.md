# Module Boundaries

CareerDiff should be implemented as feature-oriented modules with shared contracts and RAG-ready service boundaries.

## Recommended source layout

```text
src/
  app/
    page.tsx
    api/
      analyze/route.ts
  features/
    job-description-input/
    candidate-profile-input/
    requirement-extraction/
    evidence-extraction/
    evidence-matching/
    fit-scoring/
    resume-suggestions/
    mini-projects/
    interview-prep/
    analysis-dashboard/
  core/
    analysis/
      AnalysisOrchestrator.ts
    types/
    schemas/
    privacy/
    rag/
      RagContextProvider.ts
      ChunkBuilder.ts
      RetrievalPolicy.ts
      VectorStore.ts
      EmbeddingProvider.ts
  prompts/
```

## Class/service guidance

Use class or service boundaries for stateful, replaceable, or independently testable logic:

- `JobRequirementExtractor`
- `CandidateEvidenceExtractor`
- `EvidenceMatcher`
- `FitScorer`
- `ResumeSuggestionGenerator`
- `MiniProjectRecommender`
- `InterviewPrepGenerator`
- `AnalysisOrchestrator`
- `RagContextProvider`
- `ChunkBuilder`
- `RetrievalPolicy`
- `VectorStore`
- `EmbeddingProvider`

Prefer simple pure functions for small formatting, validation, and UI helpers.

## RAG services

RAG is part of the base module design, but it starts as a disabled or mock provider in MVP.

- `RagContextProvider`: prepares retrieval context for `AnalysisOrchestrator`.
- `ChunkBuilder`: converts structured records into small embeddable chunks.
- `RetrievalPolicy`: enforces consent, visibility, owner, and PII rules.
- `VectorStore`: abstracts pgvector or a managed vector database.
- `EmbeddingProvider`: abstracts embedding generation.

## Dependency direction

- UI depends on feature contracts.
- Feature services depend on core types.
- The orchestrator calls feature services.
- Only the orchestrator requests retrieval context.
- Feature services may consume `RetrievalContext`, but they must not query vector stores directly.
- Feature services should not import UI components.
- UI components should not call LLM providers, vector stores, or embedding providers directly.

## Maintenance rule

When a feature changes its output shape, update:

1. Its feature document.
2. `DATA_MODEL.md`.
3. `ANALYSIS_FLOW.md`.
4. Dashboard prop types.
5. Tests or mock results.
6. RAG chunk/retrieval contracts if the feature becomes retrievable.
