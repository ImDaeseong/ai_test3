# Feature: Analysis Dashboard

## Purpose

Render the complete analysis in a clear dashboard without mixing analysis logic into UI components.

## Inputs

- `CareerDiffAnalysisResult`.

## Outputs

- User-facing dashboard.

## Sections

- Fit score and summary.
- Requirement extraction.
- Strong matches.
- Weak matches.
- Missing evidence.
- Risk items.
- Resume suggestions.
- Mini projects.
- Interview preparation plan.

## Rules

- UI should display data from the shared result object.
- UI components must not recalculate analysis logic.
- Empty sections should show clear empty states.

## Suggested class/service boundary

- `AnalysisDashboard`: page-level composition.
- `ScorePanel`, `RequirementPanel`, `MatchPanel`, `SuggestionPanel`, `MiniProjectPanel`, `InterviewPrepPanel`: display-only components.

## UI contract

- Dashboard must work with mock result data before LLM integration.
- Each panel receives typed props.

## Test checks

- Mock result renders all MVP sections.
- Long text does not overflow panels.
- Empty result sections do not break layout.
