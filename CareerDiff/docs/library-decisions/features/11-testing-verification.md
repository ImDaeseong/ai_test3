# Feature Library Spec: Testing and Verification

## Needed functionality

- Unit test service classes and pure functions.
- Test UI rendering with mock data.
- Test the full browser workflow.
- Check privacy boundaries.

## Best library choice

- Vitest for unit tests.
- Testing Library for component behavior.
- Playwright for E2E workflow tests.

## Why

CareerDiff is a dashboard workflow. Unit tests prove analysis logic, component tests prove rendering behavior, and Playwright proves the user can complete the main flow in a browser.

## Initial test targets

- Input validation.
- Mock result renders all sections.
- Long text does not break layout.
- Analyze request does not log or persist raw resume data.
