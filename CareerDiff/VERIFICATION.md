# CareerDiff Verification

## Verification loop

[LOOP-START] goal: create a usable developer job-fit MVP / exit criteria: MVP accepts JD and candidate text, returns structured analysis, and respects no-retention privacy rules / max iterations: 3

## Progress gates

- 0%: purpose and one-sentence use case are not defined.
- 20%: purpose, security boundary, acceptance criteria, verification commands, and HOLD conditions are defined.
- 40%: project analysis is complete and risks are identified.
- 60%: implementation or document changes are complete.
- 80%: verification commands or checks pass, and discovered issues are fixed or recorded.
- 90%: regression check, documentation, and handoff notes are complete.
- 100%: agreed verification criteria pass and no HOLD condition remains.

## Current gate

40%, moving toward 60%: Project analysis and all planning documents remain complete (see the 40% description below). Implementation has started under `app/` but is not yet "complete" in the 60% sense — only `README.md`'s "다음 작업" steps 1-4 are done (Next.js/TypeScript/Tailwind scaffold, shared types transcribed from `docs/design/DATA_MODEL.md` and `docs/integration/API_CONTRACT.md`, a mock `CareerDiffAnalysisResult`, and passing tests for it). Steps 5-9 (input screens, dashboard, `AnalysisOrchestrator`, broader test coverage, LLM integration) are not started, so none of the "Functional checks for implementation phase" below pass yet.

Verified 2026-07-12: `npm run typecheck`, `npm run test` (4/4 passing), `npm run build`, and `npm run lint` all pass in `app/`.

40% (prior state, still true): Project analysis is complete and risks are identified. Purpose, security boundary, acceptance criteria, verification commands, HOLD conditions, feature design, library decisions, production architecture, RAG/data strategy, security threat model, AI evaluation plan, API contract, accessibility/i18n plan, operations runbook, and documentation audit are defined.

## MVP verification checks

### Document checks

- README contains the one-sentence use case.
- SPEC defines MVP scope, non-goals, privacy boundary, and acceptance criteria.
- ARCHITECTURE defines modules, analysis pipeline, result schema, and HOLD conditions.
- VERIFICATION defines gates and concrete checks.

### Functional checks for implementation phase

- App loads locally.
- User can paste job description text.
- User can paste candidate profile text.
- Analyze action returns valid structured JSON.
- UI shows fit score.
- UI shows required skills, preferred skills, domain, seniority, and collaboration expectations.
- UI shows strong, weak, missing, and risk sections.
- UI shows resume bullet rewrites.
- UI shows project description improvements.
- UI shows skill priority order.
- UI shows 3 mini project recommendations.
- UI shows interview questions and a 7-day preparation plan.

### Privacy checks

- Raw resume text is not written to server logs.
- Raw job description text is not written to server logs.
- No persistent storage is used unless explicitly added and documented.
- Sample files do not contain real personal data.

## Suggested commands once app exists

```powershell
npm run lint
npm run test
npm run build
```

If Playwright is added:

```powershell
npm run test:e2e
```

## Exit criteria for MVP loop

[LOOP-END] result: MVP passes document, functional, and privacy checks / gate: 100%

