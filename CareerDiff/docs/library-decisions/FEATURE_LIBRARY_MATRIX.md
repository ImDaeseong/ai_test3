# Feature Library Matrix

| Feature | Required library now | Deferred library | Best current choice |
| --- | --- | --- | --- |
| Job description input | React, Zod | none | Native textarea + Zod validation. |
| Candidate profile input | React, Zod | file parser later | Native textarea + Zod validation. |
| Job requirement extraction | OpenAI Structured Outputs, Zod | taxonomy DB later | LLM extraction into Zod schema. |
| Candidate evidence extraction | OpenAI Structured Outputs, Zod | GitHub API later | LLM extraction into Zod schema. |
| Evidence matching | TypeScript service, Zod | vector DB later | Deterministic matcher first. |
| Fit scoring | TypeScript service | analytics later | Deterministic scoring class. |
| Resume suggestions | OpenAI Structured Outputs, Zod | template library later | LLM generation grounded by evidence. |
| Mini projects | OpenAI Structured Outputs, Zod | project template DB later | LLM generation from ranked gaps. |
| Interview prep | OpenAI Structured Outputs, Zod | calendar/task integration later | LLM generation from analysis result. |
| Dashboard | React, Tailwind CSS | chart library later | Custom panels first; no chart dependency. |
| Validation/tests | Vitest, Testing Library, Playwright | visual regression later | Unit + UI + E2E tests. |

## Dependency rule

If a feature can be built clearly with TypeScript, React, Zod, and Tailwind, do not add another library in MVP.
