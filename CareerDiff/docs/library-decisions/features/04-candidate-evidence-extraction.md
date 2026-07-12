# Feature Library Spec: Candidate Evidence Extraction

## Needed functionality

- Extract skills, projects, responsibilities, achievements, tools, testing evidence, collaboration evidence, and metrics.
- Mark confidence.
- Preserve source snippets.

## Best library choice

- OpenAI Structured Outputs.
- Zod validation.

## Why

Candidate evidence is written in varied natural language. LLM extraction is useful, but Zod validation prevents malformed or incomplete output from leaking into later services.

## Implementation boundary

- `CandidateEvidenceExtractor`
- `EvidenceConfidenceScorer`
