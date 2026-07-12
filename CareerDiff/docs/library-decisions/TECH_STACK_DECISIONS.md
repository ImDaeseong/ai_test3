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
