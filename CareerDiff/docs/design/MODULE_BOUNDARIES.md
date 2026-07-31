# Module Boundaries

CareerDiff is implemented as a small feature-oriented structure. This document describes the
actual built layout, not a future/aspirational one — see `VERIFICATION.md`'s 2026-08-01 entry for
why the earlier, larger per-stage/RAG plan was dropped in favor of this.

## Actual source layout

```text
src/
  app/
    page.tsx
    api/
      analyze/route.ts
  features/
    job-description-input/
    candidate-profile-input/
    analysis-dashboard/
  core/
    analysis/
      AnalysisOrchestrator.ts
    llm/
      LlmAnalysisProvider.ts      - interface
      OpenAiAnalysisProvider.ts   - real implementation
      buildAnalysisPrompt.ts
    mocks/
      mockAnalysisResult.ts
    schemas/
    types/
```

## Class/service guidance

- `AnalysisOrchestrator`: the only module allowed to call an LLM provider or request
  `RetrievalContext`. Only the API route calls this class; UI components must not import it
  directly.
- `LlmAnalysisProvider`: the interface `OpenAiAnalysisProvider` implements. Exists so
  `AnalysisOrchestrator` can be tested against a fake provider without a real API call, and so a
  future alternate provider doesn't require changing the orchestrator.

Prefer simple pure functions for small formatting, validation, and UI helpers — the codebase does
not have separate extraction/matching/scoring service classes; a single LLM call (via
`buildAnalysisPrompt.ts`) produces the full structured result, validated by
`core/schemas/analysisResult.ts`.

## Dependency direction

- UI components call the API route; they do not call `AnalysisOrchestrator` or any LLM provider
  directly.
- The API route (`app/api/analyze/route.ts`) is the only caller of `AnalysisOrchestrator`.
- `AnalysisOrchestrator` is the only caller of `LlmAnalysisProvider`.

## Maintenance rule

When the analysis output shape changes, update:

1. `core/schemas/analysisResult.ts` (and `core/types/analysis.ts`).
2. `docs/design/DATA_MODEL.md`.
3. `docs/integration/ANALYSIS_FLOW.md`.
4. Dashboard prop types (`features/analysis-dashboard/`).
5. Tests and `core/mocks/mockAnalysisResult.ts`.
