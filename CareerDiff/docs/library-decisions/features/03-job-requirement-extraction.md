# Feature Library Spec: Job Requirement Extraction

## Needed functionality

- Extract required skills, preferred skills, domain, seniority, collaboration requirements, and delivery expectations.
- Return schema-valid structured data.
- Preserve evidence snippets.

## Best library choice

- OpenAI Responses API with Structured Outputs.
- Zod schemas converted to JSON Schema where possible.

## Why

Requirement extraction is semantic and varies by company wording. LLM extraction is appropriate, but the output must be constrained to a schema so the dashboard can trust it.

## Implementation boundary

- `JobRequirementExtractor`
- `RequirementTaxonomy`
