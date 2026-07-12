# Library Selection Criteria

CareerDiff uses a conservative dependency policy.

## Evaluation criteria

1. Fit to MVP scope.
2. TypeScript support.
3. Maintenance and ecosystem maturity.
4. Small integration surface.
5. Testability.
6. Privacy and security implications.
7. Ability to replace later.
8. Developer portfolio value.

## Preference order

- Use platform/framework capability first.
- Use small, typed libraries for schema validation and UI primitives.
- Use LLM structured output only where deterministic logic is weak.
- Avoid storage, auth, billing, and scraping libraries until the MVP needs them.

## HOLD conditions

Stop before adding a library if:

- It stores user resume data by default.
- It requires broad permissions or external accounts before MVP.
- It makes the app depend on scraping restricted job boards.
- It hides core analysis logic behind an opaque black box.
