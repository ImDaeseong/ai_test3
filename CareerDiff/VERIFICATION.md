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

60%: `README.md`'s "다음 작업" steps 1-7 are done — Next.js/TypeScript/Tailwind scaffold, shared types transcribed from `docs/design/DATA_MODEL.md` and `docs/integration/API_CONTRACT.md`, a mock `CareerDiffAnalysisResult`, the input screens, the mock-data dashboard, `AnalysisOrchestrator`, and the `/api/analyze` route (Zod-validated). Steps 8 (broader/E2E test coverage) and 9 (LLM integration) are not started.

Important caveat: all "Functional checks for implementation phase" below now pass, but against the **mock pipeline**, not real analysis — `AnalysisOrchestrator.analyze()` validates the request and always returns the same static mock result regardless of input content. Do not read this gate as "real job-fit analysis works." Moving past 60% toward 80%/100% requires either real extraction/matching/scoring services or an explicit decision to ship the mock-only version.

Verified 2026-07-12 (browser session via Playwright, not just unit tests): filled in a real job description and candidate profile, clicked 분석하기, confirmed the dashboard rendered all 6 sections (score, requirements, matches, resume suggestions, exactly 3 mini projects, interview prep) with 0 console errors; confirmed `POST /api/analyze` returns 200 with a valid request and 400 with an empty one; confirmed `npm run typecheck`, `npm run test` (15/15 passing), `npm run build`, and `npm run lint` all pass in `app/`.

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

