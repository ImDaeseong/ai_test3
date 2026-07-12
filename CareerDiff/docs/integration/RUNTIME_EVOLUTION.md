# Runtime Evolution Plan

This document explains how CareerDiff should move from document-first MVP to real service without losing feature boundaries.

## Phase gate rule

Do not add production complexity before the current phase needs it.

## Phase 1: Mock-first app

Goal:

- Prove the UI and data contracts.

Build:

- Shared TypeScript types.
- Zod schemas.
- Mock `CareerDiffAnalysisResult`.
- Input screen.
- Dashboard panels.

Do not build yet:

- Auth.
- Database.
- Billing.
- PDF upload.
- GitHub integration.

## Phase 2: Real analysis without storage

Goal:

- Prove job-fit analysis quality while keeping privacy simple.

Build:

- `AnalysisOrchestrator`.
- Feature services.
- OpenAI Structured Outputs provider.
- Privacy-safe request handling.
- Error states.

Do not build yet:

- Saved analyses.
- Team workspaces.
- Payment integration.

## Phase 3: Save and account model

Goal:

- Allow real users to keep analyses intentionally.

Build:

- Auth.
- Database.
- Explicit save button.
- Delete/export controls.
- Usage count.

Rule:

No raw resume or JD is stored unless the user explicitly saves it.

## Phase 4: Paid workflow

Goal:

- Turn the tool into a service.

Build:

- Billing provider.
- Plan limits.
- Analysis quota.
- Team/coach plan if validated.
- Production observability.

## Phase 5: Expansion

Goal:

- Add differentiated premium features.

Build only after the core workflow is useful:

- PDF resume parsing.
- GitHub repository analysis.
- Portfolio evidence library.
- Multi-resume comparison.
- Coach dashboard.
- Bootcamp cohort report.

## Architecture guardrail

Every new feature must answer:

1. Which feature module owns it?
2. Which shared type/schema does it use?
3. Does it require persistence?
4. Does it touch sensitive personal data?
5. Does it belong in UI, API, orchestration, provider, or data layer?
