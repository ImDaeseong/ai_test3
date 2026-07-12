# Prompt and Service Integration

This document maps feature services to prompts or deterministic logic.

## MVP split

### LLM-backed services

- `JobRequirementExtractor`
- `CandidateEvidenceExtractor`
- `ResumeSuggestionGenerator`
- `MiniProjectRecommender`
- `InterviewPrepGenerator`

### Deterministic services

- `JobDescriptionNormalizer`
- `CandidateProfileNormalizer`
- `EvidenceMatcher` where possible.
- `FitScorer`.
- `RiskClassifier`.

## Prompt boundary

Prompts should return JSON that matches `DATA_MODEL.md`. UI copy can be generated after the structured data exists, but the structured result is the source of truth.

## Error handling

- Invalid JSON from an LLM should fail gracefully.
- Missing fields should be filled with empty arrays or explicit unknown values.
- The UI should show a retryable error, not a broken dashboard.

## Privacy rule

Prompts may receive the user's JD and candidate text for analysis, but raw input must not be stored by default and must not be logged.
