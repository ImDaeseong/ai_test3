# Feature Documents

This directory keeps each CareerDiff feature separated so implementation, UI work, prompts, and tests do not drift into one large mixed design.

## Feature boundaries

Each feature document must define:

- Purpose.
- Inputs.
- Outputs.
- Main rules.
- Suggested class/service boundary.
- UI contract.
- Test checks.

## MVP feature list

1. Job description input.
2. Candidate profile input.
3. Job requirement extraction.
4. Candidate evidence extraction.
5. Evidence matching.
6. Fit scoring.
7. Resume rewrite suggestions.
8. Mini project recommendations.
9. Interview preparation plan.
10. Analysis dashboard.

## Maintenance rule

A feature should not directly own another feature's logic. Shared contracts belong in `docs/integration/` and shared data types belong in `docs/design/DATA_MODEL.md`.
