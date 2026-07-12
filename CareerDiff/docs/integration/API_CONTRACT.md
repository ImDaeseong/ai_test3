# API Contract

This document defines the first API contracts before implementation.

## POST /api/analyze

Runs one job-fit analysis request.

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

### Validation rules

- `jobDescription` is required.
- `candidateProfile` is required.
- Input length limits must be enforced.
- Retrieval defaults to disabled in MVP.
- Request and response must be validated with Zod.

### Error response

```ts
export type ApiErrorResponse = {
  error: {
    code: 'VALIDATION_ERROR' | 'ANALYSIS_FAILED' | 'PROVIDER_TIMEOUT' | 'RATE_LIMITED' | 'PRIVACY_BLOCKED';
    message: string;
    retryable: boolean;
  };
};
```

## Privacy requirements

- Do not log raw request body.
- Do not persist request body in MVP.
- Do not include raw sensitive input in error responses.

## Future APIs

- `POST /api/analysis-jobs`: start background analysis.
- `GET /api/analysis-jobs/:id`: check job status.
- `POST /api/saved-analyses`: explicit save.
- `DELETE /api/saved-analyses/:id`: delete saved analysis and derived embeddings.
- `GET /api/export`: export saved user data.
