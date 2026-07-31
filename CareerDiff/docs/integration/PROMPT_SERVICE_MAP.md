# Prompt and Service Integration

This document maps how prompts and validation fit together in the built code (2026-08-01 rewrite —
see `docs/design/MODULE_BOUNDARIES.md`; the earlier plan to split requirement-extraction,
evidence-matching, fit-scoring, etc. into separate deterministic/LLM services was never built).

## Actual split

- **One LLM call** (`buildAnalysisPrompt.ts` -> `OpenAiAnalysisProvider`) produces the entire
  structured result: job requirements, candidate evidence, matches, fit score, resume suggestions,
  mini projects, and interview prep together.
- **Zod validation** (`analyzeRequestSchema` on the way in, `analysisResult.ts`'s schema on the way
  out via OpenAI Structured Outputs) is the only deterministic layer — there is no separate
  rule-based matcher or scorer.

## Prompt boundary

Prompts should return JSON that matches `DATA_MODEL.md`. UI copy can be generated after the structured data exists, but the structured result is the source of truth.

## Error handling

- Invalid JSON from an LLM should fail gracefully.
- Missing fields should be filled with empty arrays or explicit unknown values.
- The UI should show a retryable error, not a broken dashboard.

## Privacy rule

Prompts may receive the user's JD and candidate text for analysis, but raw input must not be stored by default and must not be logged.
