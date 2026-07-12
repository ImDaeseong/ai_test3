# Analysis Flow Integration

This document defines how separate CareerDiff features connect into one analysis request, including the RAG-ready retrieval context that is part of the base design.

## Flow

```text
JobDescriptionInput
  -> JobDescriptionNormalizer
  -> JobRequirementExtractor

CandidateProfileInput
  -> CandidateProfileNormalizer
  -> CandidateEvidenceExtractor

Structured input context
  -> RagContextProvider
  -> RetrievalContext

JobRequirements + CandidateEvidence + RetrievalContext
  -> EvidenceMatcher
  -> FitScorer
  -> ResumeSuggestionGenerator
  -> MiniProjectRecommender
  -> InterviewPrepGenerator
  -> CareerDiffAnalysisResult
  -> AnalysisDashboard
```

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

`AnalysisOrchestrator` is the only module that should coordinate all analysis services.

Responsibilities:

- Validate inputs.
- Normalize inputs.
- Call extraction services.
- Request `RetrievalContext` from `RagContextProvider` when retrieval is enabled.
- Call matching/scoring/generation services with typed structured data.
- Return one `CareerDiffAnalysisResult`.
- Avoid logging raw sensitive input.

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
- Only the orchestrator calls feature services.
- Only the orchestrator requests retrieval context.
- Feature services return typed data only.
- Dashboard components consume `CareerDiffAnalysisResult` only.
- No feature should parse another feature's rendered UI output.
- RAG retrieves evidence/context; it does not replace schema validation, matching, scoring, or privacy checks.

## Mock-first implementation rule

Before connecting an LLM or vector store, build the UI against a stable mock `CareerDiffAnalysisResult`. This keeps UI work independent from prompt/API/vector instability.
