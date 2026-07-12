# Feature Library Spec: Evidence Matching

## Needed functionality

- Compare requirements against candidate evidence.
- Classify strong, weak, missing, and risk items.
- Explain each classification.

## Best library choice

- Plain TypeScript service first.
- Zod only at input/output boundaries.

## Why

Matching rules should be inspectable for portfolio and debugging. A deterministic first version is easier to test than an opaque LLM-only matcher.

## Implementation boundary

- `EvidenceMatcher`
- `RiskClassifier`
