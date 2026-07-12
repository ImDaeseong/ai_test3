# Security Threat Model

This document defines the security risks CareerDiff must consider before implementation.

## Assets

- Raw job descriptions.
- Raw resume/career/project text.
- Structured candidate evidence.
- Saved analyses.
- Embeddings derived from private data.
- Prompt and model outputs.
- API keys and provider credentials.
- Billing and account data later.

## Trust boundaries

- Browser UI to API route.
- API route to `AnalysisOrchestrator`.
- Orchestrator to LLM provider.
- Orchestrator to RAG/vector layer later.
- App server to database later.
- App server to billing provider later.

## Main threats

### Sensitive data leakage

Risk:

- Raw resume/JD data appears in logs, errors, analytics, vector metadata, traces, or third-party tools.

Controls:

- Do not log raw input.
- Redact errors.
- Keep raw input session-only by default.
- Store only after explicit save.
- Delete embeddings when source records are deleted.

### Prompt injection

Risk:

- A job description or resume contains instructions that attempt to override system behavior, exfiltrate data, or fabricate claims.

Controls:

- Treat user-provided JD/resume as data, not instructions.
- Keep system prompts separate from user content.
- Require schema validation.
- Do not allow retrieved context to issue tool or policy instructions.

### Hallucinated candidate evidence

Risk:

- LLM invents experience that the candidate does not have.

Controls:

- Require source snippets for evidence.
- Mark missing evidence explicitly.
- Reject resume suggestions that claim missing experience.
- Test with negative examples.

### Unauthorized access later

Risk:

- Saved analyses are visible to the wrong user, coach, or team.

Controls:

- Owner ID on saved records.
- Team/workspace permissions.
- Retrieval filters by owner, visibility, consent, and PII risk.

### Cost abuse

Risk:

- Users repeatedly trigger expensive analyses.

Controls:

- Rate limits.
- Usage quotas.
- Request size limits.
- Job idempotency.

## MVP security requirements

- No persistent storage by default.
- No raw input logs.
- Input length limits.
- Schema validation for API request and analysis result.
- Mock-first UI before provider integration.
- Synthetic sample data only.

## Production security requirements

- Auth and authorization.
- Secret management.
- Privacy-safe observability.
- Rate limits and abuse controls.
- Delete/export workflow.
- Incident response process.
- Dependency update process.
