# Operations Runbook

This document defines operational expectations for CareerDiff once it becomes a real service.

## MVP operations

- Local development only.
- No persistent user data.
- No production incident process required yet.
- Document any failed verification in `VERIFICATION.md`.

## Production operations

### Monitoring

Track:

- API latency.
- LLM provider latency.
- LLM failure rate.
- Schema validation failures.
- Rate-limit events.
- Cost per analysis.
- Error rate by API route.

Never track:

- Raw resume text.
- Raw job description text.
- Private project details.
- Secrets or tokens.

### Incident response

Create an incident note when:

- Sensitive data may have been logged.
- Saved analysis is visible to the wrong user.
- Deletion/export fails.
- LLM provider returns unsafe or ungrounded content repeatedly.
- Billing or quota enforcement fails.

### Backup and restore

When persistence is added:

- Back up relational records.
- Document restore procedure.
- Ensure delete requests also remove derived embeddings and object files.

### Release checklist

Before production release:

- Build passes.
- Tests pass.
- Privacy checks pass.
- Prompt/evaluation set passes.
- Error logging is redacted.
- Rate limits are configured.
- API keys are in environment variables only.
