# Feature: Candidate Evidence Extraction

## Purpose

Extract structured evidence from the candidate profile without fabricating experience.

## Inputs

- `CandidateProfileInput.normalizedText`.

## Outputs

- `CandidateEvidence`.

## Extracted fields

- Skills.
- Projects.
- Responsibilities.
- Achievements.
- Tools and infrastructure.
- Testing/QA evidence.
- Collaboration evidence.
- Metrics and measurable outcomes.

## Rules

- Every extracted item should point to source evidence.
- If evidence is vague, mark confidence as low.
- Do not upgrade weak claims into strong claims.

## Suggested class/service boundary

- `CandidateEvidenceExtractor`: converts candidate text to structured evidence.
- `EvidenceConfidenceScorer`: marks confidence based on specificity.

## UI contract

- Evidence list grouped by category.
- Confidence indicator.

## Test checks

- Missing evidence remains missing.
- Source snippets are preserved.
- Output matches the shared schema.
