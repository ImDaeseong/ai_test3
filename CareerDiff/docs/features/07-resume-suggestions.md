# Feature: Resume Suggestions

## Purpose

Generate concrete resume and project description improvements tailored to the job description.

## Inputs

- `JobRequirements`.
- `CandidateEvidence`.
- `MatchResult`.

## Outputs

- `ResumeSuggestions`.

## Suggestions

- Improved bullet points.
- Improved project descriptions.
- Skill stack emphasis order.
- ATS keyword coverage improvements.
- STAR-format project story rewrites.

## Rules

- Do not fabricate experience.
- Suggestions must be grounded in existing evidence.
- Missing evidence should become a recommendation, not a fake resume bullet.

## Suggested class/service boundary

- `ResumeSuggestionGenerator`: creates rewrites and keyword suggestions.
- `StarStoryRewriter`: rewrites project evidence in STAR format.

## UI contract

- Copyable bullet suggestions.
- Before/after style where possible.
- Skill priority list.

## Test checks

- Suggestions cite source evidence.
- Missing skills are not inserted as claimed experience.
- Output includes practical copy-ready text.
