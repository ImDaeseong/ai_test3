# Feature Library Spec: Mini Project Recommendations

## Needed functionality

- Recommend exactly 3 small projects.
- Map each project to missing or weak requirements.
- Include deliverables and suggested duration.

## Best library choice

- OpenAI Structured Outputs.
- Plain TypeScript ranking for gap priority before generation.

## Why

Gap ranking should be deterministic, while project wording benefits from LLM generation. This split keeps the recommendations relevant and testable.

## Implementation boundary

- `MiniProjectRecommender`
- `ProjectEvidenceMapper`
