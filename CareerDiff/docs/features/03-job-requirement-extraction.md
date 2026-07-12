# Feature: Job Requirement Extraction

## Purpose

Turn a job description into structured requirements.

## Inputs

- `JobDescriptionInput.normalizedText`.

## Outputs

- `JobRequirements`.

## Extracted fields

- Required skills.
- Preferred skills.
- Work domain.
- Expected seniority.
- Collaboration and communication requirements.
- Delivery expectations.
- Testing, monitoring, infrastructure, deployment, and tooling expectations.

## Rules

- Separate required and preferred skills.
- Preserve evidence snippets from the job description.
- Mark uncertainty instead of guessing.

## Suggested class/service boundary

- `JobRequirementExtractor`: converts JD text to structured requirements.
- `RequirementTaxonomy`: normalizes skill/domain labels.

## UI contract

- Requirement section with grouped chips/lists.
- Evidence snippets available for explainability.

## Test checks

- Required and preferred skills are separated.
- Seniority and domain can be empty when not present.
- Output matches the shared schema.
