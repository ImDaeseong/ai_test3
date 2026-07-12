# Feature: Candidate Profile Input

## Purpose

Collect resume, career history, and project notes from the candidate.

## Inputs

- Resume text.
- Career notes.
- Project descriptions.
- Optional target seniority.

## Outputs

- `CandidateProfileInput` object.
- Normalized candidate text.
- Validation result.

## Rules

- Do not invent missing experience.
- Do not persist raw candidate profile by default.
- Warn users not to paste secrets, private customer data, passwords, tokens, or internal identifiers.

## Suggested class/service boundary

- `CandidateProfileInputController`: UI state and validation.
- `CandidateProfileNormalizer`: prepares candidate text for evidence extraction.

## UI contract

- Text area for resume/career/project notes.
- Optional target role/seniority field.
- Privacy warning.

## Test checks

- Empty profile is blocked.
- Sensitive-data warning is visible.
- Raw profile is not saved unless an explicit save feature exists later.
