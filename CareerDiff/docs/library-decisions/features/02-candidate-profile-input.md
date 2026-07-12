# Feature Library Spec: Candidate Profile Input

## Needed functionality

- Resume/career/project text input.
- Privacy warning for sensitive data.
- Empty/minimum-length validation.
- Normalized text output.

## Best library choice

- React controlled component.
- Zod for validation.
- No PDF parser in MVP.

## Why

Pasted text keeps the privacy and parsing scope small. PDF parsing can be added after the analyzer and dashboard are stable.

## Implementation boundary

- `CandidateProfileInputController`
- `CandidateProfileNormalizer`
