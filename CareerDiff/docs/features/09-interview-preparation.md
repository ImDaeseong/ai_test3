# Feature: Interview Preparation Plan

## Purpose

Create interview preparation guidance from the job-fit analysis.

## Inputs

- `JobRequirements`.
- `MatchResult`.
- `FitScore`.

## Outputs

- `InterviewPrep`.

## Content

- Expected interview questions.
- Weak areas to prepare.
- 7-day preparation plan.

## Rules

- Focus on the target job description.
- Prioritize weak/missing requirements.
- Avoid generic advice when a job-specific recommendation is possible.

## Suggested class/service boundary

- `InterviewPrepGenerator`: generates questions and plan.
- `PreparationPriorityRanker`: orders weak areas by impact.

## UI contract

- Question list.
- Weak-area checklist.
- Seven-day plan timeline.

## Test checks

- Questions reflect the JD.
- Plan prioritizes high-impact gaps.
- Output is actionable within 7 days.
