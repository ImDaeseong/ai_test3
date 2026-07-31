# Analysis Flow Integration

This document defines how the analysis request actually flows through the built code (2026-08-01
rewrite — see `docs/design/MODULE_BOUNDARIES.md` for why the earlier per-stage/RAG service plan
below was dropped in favor of a single LLM call).

## Flow

```text
JobDescriptionInput + CandidateProfileInput
  -> POST /api/analyze (app/api/analyze/route.ts)
  -> AnalysisOrchestrator.analyze()
       -> analyzeRequestSchema (Zod validation)
       -> LlmAnalysisProvider.isConfigured()?
            no  -> mockAnalysisResult
            yes -> LlmAnalysisProvider.generate()   (OpenAiAnalysisProvider,
                     buildAnalysisPrompt.ts -> one LLM call -> CareerDiffAnalysisResult,
                     validated by core/schemas/analysisResult.ts)
  -> CareerDiffAnalysisResult
  -> AnalysisDashboard
```

There are no separate extraction/matching/scoring service classes — one LLM call produces the
full structured result (`requiredSkills`, `matches`, `fitScore`, resume suggestions, mini projects,
interview prep all in one response), per `core/schemas/analysisResult.ts`.

## MVP retrieval behavior

The first MVP includes the `RetrievalContext` contract but does not need a vector database.

MVP defaults:

```ts
const retrievalContext = {
  enabled: false,
  query: '',
  items: [],
  provider: 'none',
  filters: {
    visibility: ['private'],
    sourceTypes: [],
    maxPiiRisk: 'low'
  }
};
```

## Orchestrator

`AnalysisOrchestrator` is the only module that calls an LLM provider.

Responsibilities:

- Validate the raw request against `analyzeRequestSchema`.
- Branch on `LlmAnalysisProvider.isConfigured()` — mock if not configured, real call if it is.
- Return one `CareerDiffAnalysisResult`.
- Avoid logging raw sensitive input.

`retrievalContext` is part of the response schema but is always `{ enabled: false, provider: "none", items: [] }` — retrieval/RAG is not implemented (see `VERIFICATION.md`'s 2026-08-01 entry for why the RAG plan was dropped).

## API contract

### Request

```ts
export type AnalyzeRequest = {
  jobDescription: string;
  candidateProfile: string;
  targetRole?: string;
  targetSeniority?: string;
  retrieval?: {
    enabled: boolean;
    includeSavedEvidence?: boolean;
    includePublicTaxonomy?: boolean;
    includeHistoricalAnalyses?: boolean;
  };
};
```

### Response

```ts
export type AnalyzeResponse = {
  result: CareerDiffAnalysisResult;
  privacy: {
    persisted: false;
    rawInputLogged: false;
    retrievalUsed: boolean;
  };
};
```

## Integration rules

- Only the API route calls `AnalysisOrchestrator`.
- Only the orchestrator calls `LlmAnalysisProvider`.
- Dashboard components consume `CareerDiffAnalysisResult` only.
- No feature should parse another feature's rendered UI output.

## Mock-first implementation rule

Before connecting an LLM or vector store, build the UI against a stable mock `CareerDiffAnalysisResult`. This keeps UI work independent from prompt/API/vector instability.
