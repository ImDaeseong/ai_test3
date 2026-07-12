# UI Design Notes

CareerDiff is a work-focused analysis tool, not a marketing landing page.

## First screen

The first screen should be the usable analyzer:

- Job description input.
- Candidate profile input.
- Analyze button.
- Privacy note.

## Result layout

Use a dense but readable dashboard:

- Top summary and score.
- Requirement extraction panel.
- Match panels.
- Resume suggestion panel.
- Mini project panel.
- Interview prep panel.

## Interaction principles

- Make copyable suggestions easy to copy.
- Keep each feature panel visually separated but not over-decorated.
- Avoid hiding important analysis behind too many tabs in MVP.
- Show evidence snippets for trust.
- Use empty states for missing data.

## UI component boundaries

- `AnalyzerPage`: owns page composition and analysis state.
- `InputPanel`: owns JD/profile input layout.
- `AnalysisDashboard`: owns result layout.
- Feature panels are display-only and receive typed props.

## Privacy UI

Before analysis, show:

> CareerDiff does not store your resume or job description by default. Avoid pasting secrets, private customer data, passwords, tokens, or internal-only identifiers.
