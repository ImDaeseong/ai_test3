# Documentation Index

CareerDiff documentation is split by purpose so the project does not lose direction as features grow.

## Product direction

- `README.md`: project overview and one-sentence use case.
- `SPEC.md`: product scope, users, security boundary, acceptance criteria.
- `ARCHITECTURE.md`: initial technical architecture and HOLD conditions.
- `VERIFICATION.md`: progress gates and verification checks.

## Feature documents

- `docs/features/README.md`: feature documentation rules.
- `docs/features/01-job-description-input.md`
- `docs/features/02-candidate-profile-input.md`
- `docs/features/03-job-requirement-extraction.md`
- `docs/features/04-candidate-evidence-extraction.md`
- `docs/features/05-evidence-matching.md`
- `docs/features/06-fit-scoring.md`
- `docs/features/07-resume-suggestions.md`
- `docs/features/08-mini-project-recommendations.md`
- `docs/features/09-interview-preparation.md`
- `docs/features/10-analysis-dashboard.md`

## Design and integration documents

- `docs/design/DATA_MODEL.md`: shared TypeScript-style data contracts.
- `docs/design/MODULE_BOUNDARIES.md`: source layout, class/service boundaries, dependency direction.
- `docs/design/UI_DESIGN.md`: UI composition and privacy UI notes.
- `docs/integration/ANALYSIS_FLOW.md`: how feature services connect.
- `docs/integration/PROMPT_SERVICE_MAP.md`: prompt/service responsibility split.

- `docs/design/PRODUCTION_ARCHITECTURE.md`: final target structure for real service launch.
- `docs/integration/RUNTIME_EVOLUTION.md`: phase-by-phase migration from MVP to production service.
- `docs/design/AI_DATA_STRATEGY.md`: data layers, privacy rules, vectorization strategy, and service data value.
- `docs/integration/RAG_EMBEDDING_PLAN.md`: when and how to add embeddings, vector search, and RAG.
- `docs/DOCUMENTATION_AUDIT.md`: current design-document audit and remaining launch-readiness gaps.
- `docs/design/SECURITY_THREAT_MODEL.md`: security assets, trust boundaries, prompt-injection risks, and controls.
- `docs/design/AI_EVALUATION_PLAN.md`: synthetic evaluation set and regression criteria for LLM/RAG behavior.
- `docs/integration/API_CONTRACT.md`: first API request/response/error contracts.
- `docs/design/ACCESSIBILITY_I18N_PLAN.md`: accessibility and Korean/English readiness plan.
- `docs/operations/OPERATIONS_RUNBOOK.md`: monitoring, incident, backup, restore, and release checklist.
