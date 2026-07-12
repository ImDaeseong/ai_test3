# Feature: Job Description Input

## Purpose

Collect the target job description as raw text and prepare it for analysis.

## Inputs

- Raw job description text.
- Optional target role title.
- Optional company/domain note.

## Outputs

- `JobDescriptionInput` object.
- Normalized text for extraction.
- Basic validation result.

## Rules

- Do not persist raw text by default.
- Reject empty or extremely short input.
- Do not scrape job boards in MVP.
- Keep source text available only during the current analysis request.

## Suggested class/service boundary

- `JobDescriptionInputController`: UI state and validation.
- `JobDescriptionNormalizer`: trims, normalizes whitespace, detects obvious missing content.

## UI contract

- Large text area.
- Character count.
- Privacy notice.
- Validation message.

## Test checks

- Empty input is blocked.
- Long text does not break the UI.
- Raw text is not written to logs or persistent storage.
