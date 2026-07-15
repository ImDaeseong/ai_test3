# Tech Stack Decisions

## Recommended MVP stack

| Area | Choice | Why |
| --- | --- | --- |
| App framework | Next.js App Router + TypeScript | Full-stack React app with route handlers, fast iteration, good portfolio value. |
| Styling | Tailwind CSS | Fast dashboard UI, consistent spacing, minimal custom CSS overhead. |
| Runtime validation | Zod | TypeScript-first schemas, static type inference, JSON Schema support. |
| LLM provider | OpenAI Responses API with Structured Outputs | Schema-adherent JSON output is important for dashboard rendering. |
| Unit tests | Vitest | Fast TypeScript-friendly tests for services and pure functions. |
| UI/component tests | Testing Library | Tests user-visible behavior rather than implementation details. |
| E2E tests | Playwright | Cross-browser testing, traces/reports, strong fit for portfolio. |
| Persistence | None for MVP | Privacy-first. Avoid storing resumes until explicit save/delete features exist. |
| PDF parsing | Defer | MVP uses pasted text. Add `pdf-parse` or a similar parser only when PDF upload is accepted. |
| GitHub analysis | Defer | Add GitHub API/client only after text-only analysis is stable. |

## Best-choice summary

- Next.js is the best first app framework because CareerDiff needs both UI and a small analysis API without separate backend overhead.
- Zod is the best schema library because the project needs shared validation between API input, LLM output, mock data, and UI props.
- OpenAI Structured Outputs are the best first LLM integration pattern because CareerDiff must render analysis as predictable JSON, not free-form prose.
- Playwright is the best E2E test tool because the product is a dashboard workflow and should be verified through real browser behavior.

## Alternatives considered

| Area | Alternative | Reason not first choice |
| --- | --- | --- |
| App framework | Vite + Express | More setup for API and deployment; less integrated for MVP. |
| App framework | FastAPI + React | Good later if analysis backend grows, but slower for first full-stack MVP. |
| Validation | Yup | Less TypeScript-centered than Zod for shared schemas. |
| Validation | io-ts | Powerful but heavier ergonomics for this MVP. |
| E2E | Cypress | Good tool, but Playwright has stronger multi-browser defaults and traces for this workflow. |
| LLM output | Plain JSON mode | Valid JSON alone is not enough; schema adherence matters. |
| Storage | Prisma + Postgres | Useful later, but conflicts with no-retention MVP simplicity. |
| LLM orchestration | RAG (vector store + embeddings) | Analysis pipeline is one job description + one candidate profile pasted directly into the prompt — both fit in context, so there is nothing to retrieve. `ARCHITECTURE.md` already scopes RAG out of the MVP (`retrievalContext.enabled = false`). RAG would also add embedding-API calls, which increase LLM cost rather than reduce it — see 2026-07-13 decision below. |
| LLM orchestration | LangChain / LangGraph | `AnalysisOrchestrator.analyze()` is a single request → single structured-output response (`OpenAiAnalysisProvider.generate()`) — no multi-step tool-calling loop, no cyclic agent state, no chained calls to coordinate. A framework built for orchestrating multi-step LLM workflows would add indirection without solving a problem that exists here. Same criterion `hermes-agents` used to defer pydantic-ai adoption (`ai-workspace/dev/adr/ADR_001_pydantic-ai_framework_adoption.md`): adopt only when a real trigger (tool/MCP integration, multi-agent state, non-native structured output) appears. None of those triggers apply to CareerDiff today. |

## 2026-07-13 decision: verify for free before paying for the API

**Context**: `AnalysisOrchestrator.analyze()` has exactly two paths — return a fixed mock, or call `OpenAiAnalysisProvider` (`AnalysisOrchestrator.ts:55-60`). There is no separate rule-based extraction/matching/scoring stage; the LLM call *is* the entire analysis engine. That means shipping the mock-only path isn't a smaller version of the product — it's a UI shell with no working analysis, since the mock always returns the same static example regardless of what a user pastes in (`mockAnalysisResult.ts`).

**Constraint**: the user wants to avoid paying for OpenAI API calls while the prompt/schema design is still being validated.

**Decision**: instead of adding RAG or LangChain/LangGraph (neither reduces cost — see the table above), validate the exact same prompt and JSON schema for free using an existing Claude.ai / ChatGPT web subscription:

- `../../prompts/web-project/MANUAL_ANALYSIS_PROMPT.md` — a copy-paste version of `buildAnalysisPrompt.ts` + `analysisResult.ts`'s zod schema, kept in sync by hand with the code.
- `../../prompts/web-project/WEB_PROJECT_USAGE.md` — Claude/ChatGPT Project setup steps and a manual JSON-output verification checklist (schema-shape, exactly 3 mini projects, Korean output, no fabricated evidence, `retrievalContext`/`metadata` flags correct).

This mirrors an already-proven pattern from `ai_test1/music_lyric`'s web-project prompt docs (prompt-first, no API cost, human runs it and reads the result).

**Path to 100%** (tracked in `VERIFICATION.md`): run the manual prompt across at least 3 varied job-description/resume pairs and pass the checklist each time, then run `OpenAiAnalysisProvider` once with a real `OPENAI_API_KEY` and confirm the same checklist against a live response — specifically checking that OpenAI's strict `json_schema` mode round-trips the `.optional()` fields in `analysisResult.ts` correctly, per the risk already noted in `OpenAiAnalysisProvider.ts`'s code comment.
