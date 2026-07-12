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

85% (2026-07-13, reopens the 100%/descoped decision below after further discussion): The "ship mock-only, descope step 9" call was reconsidered. Root reason: `AnalysisOrchestrator.analyze()` has no processing path other than "return a fixed static mock" or "call the LLM" (`AnalysisOrchestrator.ts:55-60`) — there is no separate rule-based extraction/matching/scoring stage. That means the LLM call *is* the entire analysis engine, and shipping without ever validating it isn't really shipping a working analyzer, just a UI shell. Cost was raised as the reason to avoid the paid OpenAI API during this stabilization stage, so the plan is now: verify prompt/schema correctness for free first, using an existing Claude/ChatGPT web subscription instead of the metered API, then move to a real `OPENAI_API_KEY` test only once that's stable. Added `prompts/MANUAL_ANALYSIS_PROMPT.md` (copy-paste version of `buildAnalysisPrompt.ts` + `analysisResult.ts`'s schema) and `prompts/WEB_PROJECT_USAGE.md` (Claude/ChatGPT Project setup + a manual verification checklist). No code changed; `npm run typecheck`/`lint`/`test` (22/22)/`build` re-confirmed clean since these are docs-only additions, and `git status --short` shows only the two new `prompts/` files plus the `README.md`/`VERIFICATION.md` edits from this pass.

**Remaining before 100%**: run the manual web-based prompt across at least 3 varied job-description/resume pairs, confirm each output against `WEB_PROJECT_USAGE.md`'s checklist, then run `OpenAiAnalysisProvider` once with a real `OPENAI_API_KEY` and confirm its output validates against `careerDiffAnalysisResultSchema` under OpenAI's strict-mode constraints. Do not assume the API path works untested just because it type-checks.

80% (2026-07-12, historical — see 85% above for the current plan): All 9 "다음 작업" steps in `README.md` have at least a first pass — steps 1-8 are fully done (scaffold, shared types, mock result, input screens, mock-data dashboard, `AnalysisOrchestrator`, `/api/analyze`, unit + E2E test coverage), and step 9 (LLM integration) has real, type-checked, unit-tested plumbing (`OpenAiAnalysisProvider`, Structured Outputs schema, key-presence branching) but has never been exercised against the real OpenAI API in this repo.

Important caveat, unchanged in spirit from the 60% note: all "Functional checks for implementation phase" below pass **with no `OPENAI_API_KEY` configured**, i.e. against the mock pipeline. `AnalysisOrchestrator` now branches on `OPENAI_API_KEY`'s presence — unset (the default, and the only state ever run in this repo) returns the stable mock result; set, it calls `OpenAiAnalysisProvider`, which has not been run with a real key. Do not read this gate as "real LLM-backed job-fit analysis has been verified." Moving to 100% requires either running the real provider once against a live account and confirming its output validates against `careerDiffAnalysisResultSchema`, or an explicit decision to ship the mock-only version and close out step 9 as descoped.

Verified 2026-07-12: unit/component tests 22/22 (Vitest — includes `AnalysisOrchestrator` branching against a dependency-injected fake `LlmAnalysisProvider`, never a real network call, plus a schema round-trip test asserting the mock validates against `careerDiffAnalysisResultSchema`); Playwright E2E 4/4 (`app/e2e/analyzer.spec.ts` — privacy notice visible, analyze button gating, full flow renders all 6 dashboard sections with exactly 3 mini project cards and 0 console errors, empty request returns `400`/`VALIDATION_ERROR`); `npm run typecheck`, `npm run build`, `npm run lint` all pass.

Found and fixed during this round: (1) the mock result only had 1 mini project, violating docs/features/08's "exactly 3" rule — added 2 more, each mapped to a real gap; (2) `vitest.setup.ts` never registered Testing Library's per-test DOM cleanup, so a second component test file's `render()` calls accumulated stale DOM and made a text query match multiple elements — fixed by registering `afterEach(cleanup)`; (3) `next dev` (Turbopack) fails to hydrate under this environment's Playwright Chromium (input events reach the DOM but React never attaches, so no re-render ever happens) while a production build (`next build && next start`) hydrates correctly in the same browser — confirmed directly by checking for `__react*` fiber keys on DOM elements before/after, not just symptom-guessing; worked around by pointing `playwright.config.ts`'s `webServer` at a production build instead of `next dev`. Manual interactive testing via `npm run dev` in a normal browser was unaffected.

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

## Verification commands

```powershell
cd app
npm run typecheck
npm run lint
npm run test        # Vitest unit/component tests
npm run build
npm run test:e2e    # Playwright — runs against a production build, see README.md "알려진 이슈"
```

## Exit criteria for MVP loop

[LOOP-END] result: MVP passes document, functional, and privacy checks / gate: 100%

