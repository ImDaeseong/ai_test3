# Accessibility and Internationalization Plan

CareerDiff should be usable by job seekers in Korean and English and should not rely only on visual presentation.

## Accessibility requirements

- Use semantic form labels.
- Error messages must be tied to fields.
- The analyze button must have clear loading and disabled states.
- Result sections should have headings.
- Score should include text explanation, not color only.
- Keyboard navigation must work for inputs, buttons, copy actions, and panels.
- Long content must remain readable on mobile.

## Internationalization requirements

MVP can start in Korean, but text should be organized so English can be added later.

Prepare for:

- Korean UI copy.
- English UI copy.
- Korean JD/resume analysis.
- English JD/resume analysis.
- Mixed Korean/English technical terms.

## Content rules

- Avoid hardcoding user-facing strings deep inside analysis services.
- Keep generated resume suggestions in the language most useful to the target application.
- Preserve technical terms like React, TypeScript, Playwright, CI, monitoring.

## Test checks

- Inputs and dashboard work on mobile width.
- Buttons and copy actions are keyboard accessible.
- Score meaning is clear without color.
- Korean long text does not overflow.
