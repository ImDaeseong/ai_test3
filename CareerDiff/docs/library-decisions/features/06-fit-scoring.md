# Feature Library Spec: Fit Scoring

## Needed functionality

- Score required skill coverage, preferred skill coverage, domain match, seniority match, delivery/tooling match, collaboration match, and evidence quality.
- Explain score changes.

## Best library choice

- Plain TypeScript class.
- No scoring library.

## Why

The scoring model must be transparent and adjustable. A small custom class is better than a generic ranking library for MVP.

## Implementation boundary

- `FitScorer`
- `ScoreExplainer`
