# AI Data Strategy

CareerDiff's long-term value depends on how analysis data is structured, protected, reused, and improved. This document defines the data strategy before implementation.

## Decision summary

CareerDiff should not treat raw resumes and job descriptions as the main reusable asset.

The durable service asset should be structured, consent-aware, privacy-safe analysis data:

- normalized job requirements,
- candidate evidence maps,
- match results,
- gap categories,
- scoring signals,
- accepted/rejected user feedback,
- anonymized aggregate skill trends,
- prompt/version/evaluation metadata.

Embeddings and vector search are useful, but they should be applied selectively to derived or consented data, not blindly to every raw resume.

## Data layers

### 1. Raw input layer

Examples:

- pasted job description,
- pasted resume/career/project notes,
- uploaded PDF later,
- GitHub README or project text later.

MVP rule:

- Do not persist raw input by default.

Production rule:

- Persist raw input only when the user explicitly saves it.
- Allow delete and export.
- Apply retention policy.
- Avoid logging raw input.

### 2. Normalized text layer

Examples:

- whitespace-normalized JD text,
- cleaned candidate text,
- extracted PDF text later.

Rule:

- Treat normalized text with the same sensitivity as raw input.
- Do not store by default unless the user explicitly saves.

### 3. Structured extraction layer

Examples:

- `JobRequirements`,
- `CandidateEvidence`,
- skill taxonomy labels,
- evidence snippets,
- confidence levels.

Rule:

- This is the first useful durable layer.
- It is easier to search, compare, test, and improve than raw prose.
- It may still contain personal data, so it requires the same privacy policy when tied to a user.

### 4. Analysis result layer

Examples:

- fit score,
- strong/weak/missing/risk matches,
- resume suggestions,
- mini project recommendations,
- interview prep plan.

Rule:

- Store only when the user explicitly saves or has an account setting that allows saved analyses.
- Keep analysis result linked to prompt version, schema version, and scoring version.

### 5. Embedding/vector layer

Examples:

- embedded job requirement chunks,
- embedded candidate evidence chunks,
- embedded project evidence library,
- embedded anonymized skill labels,
- embedded public job taxonomy documents.

Rule:

- Embeddings are not automatically anonymous.
- Treat embeddings derived from personal resume text as sensitive data.
- Prefer embedding small structured chunks over whole raw documents.
- Store references to source record IDs, not raw source text inside vector metadata.

### 6. Feedback and learning layer

Examples:

- user marks a suggestion as useful,
- user edits a generated bullet,
- user accepts/rejects a mini project,
- user says a match was wrong,
- eventual outcome if the user voluntarily records interview/application progress.

Rule:

- This is high-value product data.
- Keep feedback separate from raw resume data.
- Use it to improve ranking, prompts, scoring, and recommendation templates.

### 7. Aggregate analytics layer

Examples:

- most common missing skills by target role,
- frequent weak evidence categories,
- common ATS keyword gaps,
- common project recommendations.

Rule:

- Aggregate only after removing direct personal identifiers.
- Never expose individual user career data in aggregate reports.

## What should be vectorized

Good candidates:

- job requirement chunks,
- candidate evidence chunks with consent,
- saved project evidence library,
- public skill taxonomy documents,
- public job family descriptions,
- generated analysis summaries with consent,
- anonymized gap patterns.

Bad candidates for default vectorization:

- entire raw resume,
- entire raw JD with company/internal details,
- private notes,
- emails,
- customer names,
- private company project descriptions,
- secrets, tokens, passwords, internal identifiers.

## Recommended embedding chunk types

```ts
export type EmbeddableChunk = {
  id: string;
  ownerUserId?: string;
  sourceType: 'job_requirement' | 'candidate_evidence' | 'project_evidence' | 'skill_taxonomy' | 'analysis_summary';
  visibility: 'private' | 'team' | 'public_taxonomy' | 'anonymized_aggregate';
  textForEmbedding: string;
  sourceRecordId: string;
  sourceField: string;
  piiRisk: 'low' | 'medium' | 'high';
  consentBasis: 'session_only' | 'explicit_save' | 'public_data' | 'anonymized';
  schemaVersion: string;
  createdAt: string;
};
```

## Vector metadata rule

Vector metadata should contain only routing and filtering data:

- source type,
- owner ID,
- visibility,
- source record ID,
- schema version,
- coarse tags,
- PII risk level.

Do not store raw resume text, private project details, or sensitive snippets in vector metadata.

## RAG use cases

### MVP

No vector DB is required for MVP.

Use structured extraction and deterministic matching first.

### Useful after MVP

Add RAG when CareerDiff needs:

- saved candidate evidence library,
- multiple resume versions,
- GitHub project evidence retrieval,
- job-family skill taxonomy retrieval,
- coach/bootcamp candidate comparison,
- historical analysis lookup,
- personalized preparation plans across many saved analyses.

## Recommended production data stores

| Data | Store | Notes |
| --- | --- | --- |
| Users, plans, analyses | PostgreSQL | Primary relational source of truth. |
| Structured JSON results | PostgreSQL JSONB or typed tables | Start with JSONB, normalize if reporting grows. |
| Vector chunks | pgvector or managed vector DB | Start simple if already using PostgreSQL. |
| Large uploaded files | Object storage | Add only when PDF upload exists. |
| Logs/metrics | Observability tool | Must redact raw sensitive input. |

## Initial recommendation

For a real service, start with PostgreSQL plus pgvector if vector search is needed. This keeps relational records and embeddings close together and avoids adding a separate vector vendor too early.

Use a managed vector database only if scale, latency, hybrid search, or team operations outgrow PostgreSQL.

## Versioning

Every saved analysis should include:

- schema version,
- prompt version,
- model/provider version,
- scoring version,
- extraction version,
- matching version.

This allows old analyses to remain explainable after prompts and scoring rules change.

## Privacy guardrails

- Raw input is session-only by default.
- Explicit save is required before persistence.
- User can delete saved raw input and derived analysis.
- Embeddings derived from private data are deleted with the source record.
- Logs must not contain raw JD/resume text.
- Synthetic sample data only in repository.

## Business value of data

The strongest long-term product data is not raw resumes. It is the structured map of:

- what jobs require,
- what candidates can prove,
- where evidence is weak,
- which suggestions users accept,
- which mini projects close common gaps,
- which preparation plans are useful.

This data can improve recommendations without turning CareerDiff into a privacy-risky resume warehouse.
