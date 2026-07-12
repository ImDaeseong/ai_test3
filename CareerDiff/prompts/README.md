# CareerDiff Prompt Notes

## Analyzer prompt goals

The analyzer should compare a job description and a candidate profile without inventing experience.

It should return:

- Extracted job requirements.
- Candidate evidence map.
- Strong matches.
- Weak matches.
- Missing evidence.
- Risk items.
- Fit score with reasons.
- Resume bullet rewrites.
- Project description rewrites.
- Skill emphasis order.
- Mini project recommendations.
- Interview preparation plan.

## Hard rules

- Do not fabricate candidate experience.
- If evidence is missing, say it is missing.
- Prefer concrete text that can be copied into a resume.
- Keep recommendations tied to the job description.
- Distinguish required skills from preferred skills.
