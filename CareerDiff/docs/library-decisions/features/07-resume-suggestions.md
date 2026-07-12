# Feature Library Spec: Resume Suggestions

## Needed functionality

- Generate improved bullet points.
- Rewrite project descriptions.
- Suggest skill emphasis order and ATS keywords.
- Avoid fabricating experience.

## Best library choice

- OpenAI Structured Outputs.
- Zod validation.
- No resume-template library in MVP.

## Why

This is language generation, so LLM output is appropriate. Structured output and evidence-grounding rules keep the feature safer and easier to render.

## Implementation boundary

- `ResumeSuggestionGenerator`
- `StarStoryRewriter`
