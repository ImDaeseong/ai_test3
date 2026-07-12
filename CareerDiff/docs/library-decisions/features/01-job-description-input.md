# Feature Library Spec: Job Description Input

## Needed functionality

- Large text input.
- Character count.
- Empty/minimum-length validation.
- Privacy notice.
- Normalized text output.

## Best library choice

- React controlled component for UI state.
- Zod for validation schema.
- No form library for MVP.

## Why

The input is simple enough that React state and Zod are clearer than adding React Hook Form. Add a form library only if the input screen grows into many fields, saved drafts, and complex validation.

## Implementation boundary

- `JobDescriptionInputController`
- `JobDescriptionNormalizer`
