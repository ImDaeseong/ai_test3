# Production Architecture Decision

This document decides whether the current CareerDiff structure can survive a real service launch and what must change before production.

## Decision summary

The current feature-separated documentation structure should be kept.

The MVP runtime structure should evolve before production. The project should keep feature boundaries, shared data contracts, and the orchestrator pattern, but add production-grade layers for persistence, user accounts, privacy controls, background jobs, observability, billing, and provider abstraction.

## What should stay

- Feature documents remain separated by responsibility.
- Shared data contracts remain the center of integration.
- `AnalysisOrchestrator` remains the only coordinator for analysis flow.
- UI remains display-focused and does not own analysis logic.
- Matching and scoring remain deterministic where possible.
- LLM-backed features return schema-validated structured output.
- Privacy-first design remains a hard boundary.

## What must change for real service

### 1. Persistence becomes explicit

MVP uses no storage by default. A real service needs storage for accounts, saved analyses, usage limits, billing status, and user settings.

Required production additions:

- Database schema.
- Data retention policy.
- Delete/export controls.
- Encryption strategy for sensitive fields.
- Audit events that do not include raw resume text.

Recommended direction:

- PostgreSQL for relational data.
- Prisma or Drizzle for typed database access.
- Store raw resume/JD text only when the user explicitly saves it.
- Prefer storing structured summaries and derived analysis over raw input where possible.

### 2. Authentication and authorization are needed

MVP can be anonymous. Production needs users, teams, and plan-based access.

Required production additions:

- User accounts.
- Session management.
- Workspace/team model if career coaches or bootcamps are supported.
- Role-based access control for shared candidate analyses.

Recommended direction:

- Start with a managed auth provider or a well-supported Next.js auth stack.
- Do not build custom password auth unless there is a strong reason.

### 3. LLM provider must be abstracted

MVP can call one provider directly. Production should isolate provider details.

Required production additions:

- `LLMProvider` interface.
- Request timeout and retry policy.
- Token/cost tracking.
- Redaction before logging.
- Prompt versioning.
- Structured output validation and repair/fallback path.

Recommended direction:

- Keep OpenAI Structured Outputs as the first provider.
- Hide provider calls behind `LLMClient` and feature services.
- Store prompt versions, not raw user input.

### 4. Long-running analysis should move to jobs

MVP can analyze synchronously. Production should support background processing for PDF parsing, GitHub analysis, batch coach reports, and retries.

Required production additions:

- Job queue.
- Analysis job status.
- Retry and failure states.
- Idempotency key per analysis request.

Recommended direction:

- Keep synchronous text-only analysis for MVP.
- Add background jobs when adding PDF/GitHub/batch analysis.

### 5. Observability must be privacy-safe

Production needs logs and metrics, but CareerDiff handles sensitive career data.

Required production additions:

- Structured logs without raw resume/JD content.
- Error tracking with input redaction.
- Latency and cost metrics.
- LLM failure rate monitoring.
- Privacy checks in tests.

### 6. Billing and limits must be separate from analysis logic

Monetization should not leak into feature services.

Required production additions:

- Plan model.
- Usage counter.
- Payment provider integration.
- Entitlement checks.

Rule:

Billing checks happen before analysis orchestration. Feature services should not know about payment providers.

## Final target source structure

```text
CareerDiff/
  README.md
  SPEC.md
  ARCHITECTURE.md
  VERIFICATION.md
  docs/
  src/
    app/
      page.tsx
      api/
        analyze/route.ts
        analysis-jobs/route.ts
    features/
      job-description-input/
      candidate-profile-input/
      requirement-extraction/
      evidence-extraction/
      evidence-matching/
      fit-scoring/
      resume-suggestions/
      mini-projects/
      interview-prep/
      analysis-dashboard/
    core/
      analysis/
        AnalysisOrchestrator.ts
        AnalysisJobService.ts
      types/
        analysis.ts
        api.ts
      schemas/
        analysis.schema.ts
        api.schema.ts
      llm/
        LLMProvider.ts
        OpenAIStructuredOutputProvider.ts
      privacy/
        redaction.ts
        retention-policy.ts
      errors/
        AppError.ts
      config/
        env.ts
    server/
      db/
        schema.ts
        client.ts
      auth/
      billing/
      usage/
      jobs/
      observability/
    test/
      fixtures/
      mocks/
```

## Dependency direction

```text
UI components
  -> feature UI contracts
  -> shared types/schemas

API routes
  -> auth/usage checks
  -> AnalysisOrchestrator
  -> feature services
  -> LLMProvider or deterministic services
  -> shared types/schemas

Persistence, billing, auth, jobs, and observability
  -> support orchestration
  -> must not be imported by UI display components
```

## Production service boundaries

### UI layer

Owns forms, dashboard display, loading states, and user actions.

Must not:

- Call LLM providers directly.
- Calculate fit score.
- Access billing providers directly.

### API layer

Owns request validation, auth checks, usage limits, and response shape.

Must not:

- Contain feature-specific analysis logic.
- Log raw sensitive input.

### Orchestration layer

Owns the analysis workflow.

Responsibilities:

- Validate normalized inputs.
- Call feature services in order.
- Enforce schema validation between steps.
- Return `CareerDiffAnalysisResult`.

### Feature service layer

Owns one feature's logic only.

Examples:

- `JobRequirementExtractor`
- `CandidateEvidenceExtractor`
- `EvidenceMatcher`
- `FitScorer`
- `ResumeSuggestionGenerator`
- `MiniProjectRecommender`
- `InterviewPrepGenerator`

### Provider layer

Owns external APIs.

Examples:

- LLM provider.
- PDF parser later.
- GitHub API later.
- Payment provider later.

### Data layer

Owns persistence.

Must enforce:

- explicit save behavior,
- deletion,
- export,
- retention rules,
- no accidental raw input logging.

## MVP-to-production migration stages

### Stage 1: Local MVP

- Text inputs.
- Mock result.
- Dashboard.
- Type and schema contracts.
- Deterministic scoring/matching skeleton.

### Stage 2: LLM MVP

- OpenAI Structured Outputs.
- Schema validation.
- No persistence.
- Privacy-safe error handling.

### Stage 3: Private beta

- Auth.
- Saved analyses with explicit user consent.
- Usage limits.
- Basic observability.
- Prompt versioning.

### Stage 4: Paid service

- Billing.
- Plan entitlements.
- Delete/export controls.
- Background jobs for large analyses.
- Coach/team workspace if needed.

### Stage 5: Advanced product

- GitHub repo analysis.
- PDF resume parsing.
- Multiple resume versions.
- Job-specific preparation tracker.
- Coach/bootcamp reports.

## Final architecture decision

Do not redesign the project away from feature-based structure.

Instead, keep the current feature separation and add production layers around it. This allows the MVP to be built quickly while preserving a path to a real paid service.
