# Feature: Fit Scoring

## Purpose

Calculate an explainable fit score from the match result.

## Inputs

- `JobRequirements`.
- `MatchResult`.

## Outputs

- `FitScore`.

## Scoring dimensions

- Required skill coverage.
- Preferred skill coverage.
- Domain match.
- Seniority match.
- Delivery/tooling match.
- Collaboration match.
- Evidence quality.

## Rules

- Score must be explainable.
- Required requirements should dominate preferred requirements.
- Score should not imply hiring guarantees.

## Suggested class/service boundary

- `FitScorer`: calculates category and total scores.
- `ScoreExplainer`: generates concise reasons for the score.

## UI contract

- Total score.
- Category breakdown.
- Top reasons increasing/decreasing score.

## Test checks

- Missing required evidence lowers score.
- Preferred skill gaps have smaller impact.
- Score explanation references match data.
