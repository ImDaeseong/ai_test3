# Feature: Evidence Matching

## Purpose

Compare job requirements against candidate evidence.

## Inputs

- `JobRequirements`.
- `CandidateEvidence`.

## Outputs

- `MatchResult`.

## Match categories

- Strong match: direct and specific evidence exists.
- Weak match: partial, indirect, or vague evidence exists.
- Missing evidence: no convincing evidence exists.
- Risk item: important missing requirement that may hurt the application.

## Rules

- Required skills carry more weight than preferred skills.
- A weak match must not be displayed as a strong match.
- Each match should include a reason and evidence snippet.

## Suggested class/service boundary

- `EvidenceMatcher`: maps requirements to candidate evidence.
- `RiskClassifier`: flags high-impact gaps.

## UI contract

- Four sections: strong, weak, missing, risks.
- Each item has reason and evidence.

## Test checks

- Strong/weak/missing categories are mutually clear.
- Required skill gaps appear in risks when important.
- No candidate experience is invented.
