# Feature: Mini Project Recommendations

## Purpose

Recommend small projects that fill important job-fit gaps.

## Inputs

- `JobRequirements`.
- `MatchResult`.
- `FitScore`.

## Outputs

- `MiniProjectRecommendation[]`.

## Rules

- Recommend exactly 3 MVP mini projects for the first version.
- Each project must map to one or more missing or weak requirements.
- Projects should be realistic in 1-7 days.
- Each project should produce portfolio evidence.

## Suggested class/service boundary

- `MiniProjectRecommender`: ranks gaps and generates projects.
- `ProjectEvidenceMapper`: explains what evidence each project would create.

## UI contract

- Three project cards.
- Each card shows goal, target gaps, deliverables, and suggested duration.

## Test checks

- Exactly 3 recommendations are shown.
- Each recommendation maps to a gap.
- Project scope is small enough for a job seeker.
