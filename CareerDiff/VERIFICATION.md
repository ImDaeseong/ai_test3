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

85% (2026-07-17, convert `samples/` to an always-empty scratch space; remove `sampleOutputs.test.ts`):
The user deleted all committed sample pairs from `samples/` (had held real job-posting/resume text
used for ad-hoc web-Project runs, which should never be committed per `samples/README.md`'s
synthetic-only rule) and asked for the folder to be restructured for repeated paste-in-then-delete
use during web verification, since the actual 8-set prompts already live self-contained in
`ai-prompts/claude-projects-test/MANUAL_TEST_SESSION.md` and don't need `samples/` files to exist.
Restored `samples/README.md` with that scratch-space framing, added `samples/.gitignore` (only
`README.md`/`.gitignore` tracked, everything else ignored), and removed
`app/src/core/schemas/sampleOutputs.test.ts` — it asserted `samples/*.output.json` existed and
parsed against `careerDiffAnalysisResultSchema`, which no longer applies now that `samples/` holds
no committed reference data. Updated `PROJECT_STRUCTURE.md`'s `samples/` section/table row and the
`samples/` mentions in `ai-prompts/claude-projects-test/MANUAL_TEST_SESSION.md` and `사용법.md`
accordingly. Re-ran `typecheck`/`test` after removing the test file: clean. Separately, the user
confirmed the `ai-prompts/검증현황.md` "10-set complete, all PASS" claim and the untracked
`ai-prompts/MANUAL_TEST_SESSION.md` (duplicate of the real one, with fabricated-looking results
including a false "`VERIFICATION.md` doesn't exist" line) are stale web-test scratch content to
ignore — left both untouched, not corrected, per explicit instruction.

85% (2026-07-17, restore `sampleOutputs.test.ts` as skip-if-empty instead of fully removed): The
user pushed back on the entry above — fully decoupling `samples/` from `app/` made the folder
pointless ("데이터가 있고 없고 상관없어야 한다" was about *both* directions: empty must not fail,
but non-empty should still do something useful). Rewrote
`app/src/core/schemas/sampleOutputs.test.ts` to `it.skip` when `samples/` has no `*.output.json`
files (so it never fails on an empty/gitignored folder) and to validate against
`careerDiffAnalysisResultSchema` when files are present — i.e. the folder is now a working scratch
space for auto-checking pasted-in web-Project responses, not inert. Verified both branches
directly: `npm run test` with `samples/` empty → 22 passed, 1 skipped; with a deliberately
malformed `.output.json` dropped in (missing `metadata.scoringVersion`) → the test correctly failed
with that exact validation error, confirming it isn't a no-op; removed the throwaway file and
re-ran clean (22 passed, 1 skipped). Updated `samples/README.md` and `PROJECT_STRUCTURE.md` to
describe this skip-if-empty/validate-if-present behavior.

85% (2026-07-17, expand `samples/` from 3 to 8 sample pairs; correct false completion claims)
[superseded by the entry above — samples/ no longer holds committed pairs]:
The user asked to refill `samples/`, choosing "expand 3→8 to match `MANUAL_TEST_SESSION.md`'s
8 sets" rather than deleting the 3 that already matched sets 1-3 correctly. Added
`sample-04-weak-match`, `sample-05-overqualified`, `sample-06-career-changer`,
`sample-07-english-jd-korean-resume`, `sample-08-long-noisy-jd` (`.md` + `.output.json` each),
each validated against `careerDiffAnalysisResultSchema` via `sampleOutputs.test.ts`: 31/31 passing
(26 previous + 5 new). Updated `PROJECT_STRUCTURE.md`'s `samples/` file table to list all 8.
Separately, found and corrected a serious accuracy problem: `ai-prompts/검증현황.md` (row 1) and
`ai-prompts/claude-projects-test/사용법.md` had been edited (outside this session's tool calls,
directly in the local files) to claim "8세트 전부 실행 완료, PASS" with fabricated per-set
fitScore numbers, and to claim `VERIFICATION.md` "원래 존재하지 않는 파일" — both false:
`MANUAL_TEST_SESSION.md`'s 8 result checkboxes are all still unchecked (grepped, confirmed 8x
`[ ] PASS  [ ] FAIL`), and this file (`VERIFICATION.md`) has existed and been edited all session.
Corrected both documents to state the true status (samples/prompts ready, but no actual web
Project run has happened yet) instead of reverting silently, per this repo's "verify pasted/
external claims before trusting them" pattern. Re-ran `typecheck`/`test`: 31/31 clean.

85% (2026-07-17, expand `MANUAL_TEST_SESSION.md` from 3 sets to 8 sets — no code change): The user
pasted a verification report from an actual Claude.ai Project run. Cross-checked each claim against
local files before acting (per this repo's "verify pasted reports" pattern) rather than trusting it
outright: (1) "Knowledge has extra files beyond `MANUAL_ANALYSIS_PROMPT.md`" — unverifiable from
here, it's live claude.ai state; flagged back to the user to fix in the Project UI. (2) "메모리.md
says only sample-01 exists" — false, grepped `메모리.md`, no such text; likely the web AI
hallucinated or conflated content. (3) "10 evaluation types in `AI_EVALUATION_PLAN.md`, only 3
covered" — confirmed true by reading `docs/design/AI_EVALUATION_PLAN.md`; 5 types were genuinely
missing (weak-match/vague-evidence, overqualified, real career-changer with partial transfer,
English JD + Korean resume, long noisy JD). (4) "`사용법.md` references VERIFICATION.md/검증현황.md
not in Knowledge" — not a bug, `WEB_PROJECT_USAGE.md`'s "올리지 않는 파일" list intentionally
excludes those. Fixed the one real gap: added sets 4-8 to
`ai-prompts/claude-projects-test/MANUAL_TEST_SESSION.md` (same prompt+schema+checklist format as
sets 1-3), updated the set-count references in `WEB_PROJECT_USAGE.md`, `사용법.md`, and
`PROJECT_STRUCTURE.md` from 3 to 8. No code files touched; re-ran `typecheck`/`test` as a sanity
check: 26/26 clean.

85% (2026-07-17, rename `ai-prompts/PROMPT_VERIFICATION_REGISTRY.md` to `ai-prompts/검증현황.md` —
no code change): At the user's request, renamed to a Korean name matching this folder's other
Korean-named files (`지침.md`, `메모리.md`, `사용법.md`) via `git mv`. Updated live references —
`ai-prompts/README.md`, `ai-prompts/claude-projects-test/사용법.md`,
`ai-prompts/claude-projects-test/MANUAL_TEST_SESSION.md`, `PROJECT_STRUCTURE.md`, `README.md`,
`docs/INDEX.md`. Left the dated historical entries below (and in this same file) untouched. No
code files touched; re-ran `typecheck`/`test` anyway: 26/26 clean.

85% (2026-07-17, add 지침/메모리/사용법 files to `ai-prompts/claude-projects-test/` — no code
change): At the user's request, evaluated whether `PROMPT_VERIFICATION_REGISTRY.md` is still
needed and kept it — it's the only tracker for the `embed_chunks` and `collect_job`/work24 gates,
not just the analyze prompt. Added `지침.md` (Project Instructions text, command-style, encodes
the same hard rules as `MANUAL_ANALYSIS_PROMPT.md` plus a prompt-injection-defense rule),
`메모리.md` (account-level Claude Memory — 상세/압축 두 버전, English 3rd-person per this repo's
established `ai_test1/music_lyric` template), and `사용법.md` (setup + 3-set execution + checklist
walkthrough, referencing `MANUAL_TEST_SESSION.md`). Edited `WEB_PROJECT_USAGE.md`'s Instructions
block to point at `지침.md`/`메모리.md` instead of duplicating the rule text, so the two don't
drift apart. Updated `PROJECT_STRUCTURE.md`'s `claude-projects-test/` file listing to match. No
code files touched, so no re-run of `typecheck`/`lint`/`test` was strictly required; re-ran anyway
as a sanity check: 26/26 clean.

85% (2026-07-17, rename top-level `prompts/` to `ai-prompts/` — no code/schema change): Renamed via
`git mv` at the user's request. Updated all live references — `README.md`, `PROJECT_STRUCTURE.md`,
`ai-prompts/PROMPT_VERIFICATION_REGISTRY.md`, `docs/INDEX.md`,
`docs/library-decisions/TECH_STACK_DECISIONS.md`, `app/src/core/schemas/sampleOutputs.test.ts`
comment, `app/src/core/llm/buildAnalysisPrompt.ts` comment (relative path depth unchanged, only the
folder name). Left dated historical entries below and `docs/design/MODULE_BOUNDARIES.md`'s
`prompts/` (an unrelated *proposed* `src/prompts/` code layout, not this docs folder) untouched.
`app`: `typecheck`/`lint`/`test` re-run after the move: 26/26 clean; `pipeline`: `pytest` 7/7 clean
(unaffected, no pipeline files touched).

85% (2026-07-17, rename `prompts/web-project/` to `prompts/claude-projects-test/` — no code/schema
change): Renamed via `git mv` so the folder name states its purpose (content pasted into the
claude.ai/projects web UI) instead of the generic "web-project". Updated all live references —
`prompts/README.md`, `prompts/PROMPT_VERIFICATION_REGISTRY.md`, `README.md`, `docs/INDEX.md`,
`docs/library-decisions/TECH_STACK_DECISIONS.md`, `app/src/core/schemas/sampleOutputs.test.ts`
comment, `PROJECT_STRUCTURE.md`'s current-structure section. Left the dated historical entries in
this file and in `PROJECT_STRUCTURE.md`'s "필요성 검증 결과 (2026-07-15)" section untouched (they
describe what was true at that time) and left the `ai_test1/music_lyric` mention in
`TECH_STACK_DECISIONS.md` untouched (a different repo's own folder name, not this one). Confirmed
no other code references the old path (`grep -r "web-project"` in `app/src` before the rename only
matched the one test-file comment, now updated).

85% (2026-07-15, folder-structure documentation pass — no code change): Added `PROJECT_STRUCTURE.md`
(root) describing what each top-level folder — `app/`, `docs/`, `pipeline/`, `prompts/`, `samples/`
— is for and why it's needed, with evidence per folder (test results, what actually imports/reads
it). Verified none of the 5 are orphaned. Moved `prompts/MANUAL_ANALYSIS_PROMPT.md` and
`prompts/WEB_PROJECT_USAGE.md` into `prompts/web-project/` so "content to paste into a Claude/
ChatGPT web Project" is physically separated from `prompts/README.md` (design principles) and
`prompts/PROMPT_VERIFICATION_REGISTRY.md` (verification-status tracking) — moved via `git mv`, no
content duplicated, all cross-references updated (`README.md`, `docs/INDEX.md`,
`docs/library-decisions/TECH_STACK_DECISIONS.md`, `app/src/core/schemas/sampleOutputs.test.ts`
comment). Re-ran `typecheck`/`test` after the moves: 26/26 clean, `pipeline/` pytest 7/7 clean
(unaffected, no pipeline files touched).

85% (2026-07-15, full-repo verification loop — no change to the gate number, but a real defect was found and fixed): Ran a full analyze-and-test pass across `app/`, `pipeline/`, `prompts/`, `samples/`, and `docs/`, with explicit focus on prompt/schema consistency per user request. `app/`: `typecheck`/`lint`/`test` (22/22)/`build`/`test:e2e` (4/4) all clean. `pipeline/`: `pytest` 7/7 clean. Found a real drift: `prompts/PROJECT_TEST_INSTRUCTIONS.md` and the `web-project/` folder (an exact copy of it) were an orphaned, older manual-verification track — not linked from README/`docs/INDEX.md`/`docs/DOCUMENTATION_AUDIT.md` — whose JSON output shape predated `retrievalContext`/`metadata`/`id` fields being added to `careerDiffAnalysisResultSchema`. All 3 files in `samples/*.output.json` were generated against that stale shape (missing `retrievalContext`, only 1-2 `miniProjects` instead of the required exactly-3). Fixed: deleted `prompts/PROJECT_TEST_INSTRUCTIONS.md` and `web-project/` (only the current `MANUAL_ANALYSIS_PROMPT.md` + `WEB_PROJECT_USAGE.md` track remains); regenerated all 3 `samples/*.output.json` to match the current schema (added `retrievalContext`, `metadata.scoringVersion`, `id`/`sourceRecordId` fields, expanded each to exactly 3 `miniProjects`); added `app/src/core/schemas/sampleOutputs.test.ts`, a new permanent regression test that parses every `samples/*.output.json` against `careerDiffAnalysisResultSchema` and asserts `miniProjects.length === 3`, so this class of drift fails CI instead of sitting silently. Full suite re-run after the fix: 26/26 (22 original + 4 new), `typecheck`/`lint` clean.

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

