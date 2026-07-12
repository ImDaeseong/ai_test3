# AI Evaluation Plan

CareerDiff needs an evaluation plan before relying on LLM outputs in a real service.

## Purpose

Verify that extraction, matching, scoring, suggestions, and RAG behavior are useful, grounded, and safe.

## Evaluation datasets

Use synthetic or consented data only.

Initial test sets:

- Clear strong-match JD/resume pair.
- Weak-match pair with vague evidence.
- Missing-evidence pair.
- Prompt-injection JD.
- Prompt-injection resume.
- Overqualified candidate.
- Career-changer candidate.
- Korean JD and Korean resume.
- English JD and Korean resume.
- Long noisy JD.

## Evaluation dimensions

- Requirement extraction accuracy.
- Required/preferred skill separation.
- Candidate evidence grounding.
- No fabricated experience.
- Strong/weak/missing classification quality.
- Fit score explainability.
- Resume suggestions grounded in evidence.
- Mini projects tied to real gaps.
- Interview questions tied to the JD.
- RAG context relevance when enabled.
- Privacy behavior.

## Golden outputs

For each evaluation case, define expected properties rather than exact prose.

Example:

- Required skills include React and TypeScript.
- Missing evidence includes monitoring.
- Suggestions do not claim monitoring experience if absent.
- Mini project includes monitoring or observability deliverable.

## Regression rule

Any prompt, schema, scoring, or retrieval change must run the evaluation set.

## MVP requirement

Before LLM integration, create mock fixtures that match the final schema. Before production, create the first synthetic evaluation dataset.
