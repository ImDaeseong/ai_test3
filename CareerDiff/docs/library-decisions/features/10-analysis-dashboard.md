# Feature Library Spec: Analysis Dashboard

## Needed functionality

- Render score, requirements, matches, suggestions, projects, and interview prep.
- Support long text and empty states.
- Keep UI display-only.

## Best library choice

- React components.
- Tailwind CSS.
- Lucide React for icons if icons are needed.
- No chart library in MVP.

## Why

The MVP dashboard needs clear panels and lists more than complex charts. Avoiding chart dependencies keeps implementation fast and maintainable.

## Implementation boundary

- `AnalysisDashboard`
- `ScorePanel`
- `RequirementPanel`
- `MatchPanel`
- `SuggestionPanel`
- `MiniProjectPanel`
- `InterviewPrepPanel`
