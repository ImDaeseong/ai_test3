# Feature Library Spec: Interview Preparation

## Needed functionality

- Generate expected interview questions.
- Identify weak areas.
- Create a 7-day plan.

## Best library choice

- OpenAI Structured Outputs.
- Zod validation.

## Why

Interview questions and study plans need job-specific natural language, but they must still fit the dashboard schema.

## Implementation boundary

- `InterviewPrepGenerator`
- `PreparationPriorityRanker`
