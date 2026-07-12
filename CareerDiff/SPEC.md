# CareerDiff SPEC

## Purpose

CareerDiff helps developer job seekers compare a target job description against their resume, career history, and project evidence. The product should show what already matches, what is weak, what evidence is missing, and what concrete edits or projects would improve the application.

## Product positioning

CareerDiff is not a generic resume beautifier. It is a developer-focused Job Fit Analyzer.

Core promise:

> Paste a job description and your resume/project notes. CareerDiff returns a structured gap analysis, resume rewrite suggestions, and small portfolio projects that directly target the job.

## Target users

- Developers preparing for a job change.
- Junior/mid-level developers trying to tailor resumes to each posting.
- Career coaches who help multiple developer candidates.
- Bootcamp or academy operators reviewing student readiness.

## MVP scope

### Inputs

- Job description pasted as text.
- Resume/career/project notes pasted as text.
- Optional links in later versions: GitHub repo, README, portfolio URL, Notion resume, PDF resume.

### Job requirement extraction

The analyzer must extract:

- Required skills.
- Preferred skills.
- Work domain.
- Expected seniority level.
- Collaboration and communication requirements.
- Delivery responsibilities.
- Tooling, infrastructure, testing, monitoring, and deployment expectations.

### Candidate matching

The analyzer must classify evidence into:

- Strong matches: clear experience or project evidence exists.
- Weak matches: partial or indirect evidence exists.
- Missing evidence: no convincing evidence is present.
- Risk items: important job requirements that are not reflected in the resume.

### Resume improvement suggestions

The result must suggest:

- Improved resume bullet points.
- Improved project descriptions.
- Recommended skill stack emphasis order.
- ATS keyword coverage improvements.
- STAR-format project story rewrites.

### Mini project recommendations

The result must recommend 3 small projects that fill the most important gaps.

Example:

> This job expects Playwright, CI, and monitoring evidence. Build a 3-day frontend QA automation project with Playwright test reports, GitHub Actions, and basic error monitoring.

### Interview preparation

The result should include:

- Expected interview questions.
- Weak areas to prepare.
- A 7-day preparation plan tailored to the job description.

## Non-goals for MVP

- Automatic job application submission.
- Scraping job boards without permission.
- Storing sensitive resumes by default.
- Claiming legal, HR, or hiring guarantees.
- Replacing human review.

## Security and privacy boundary

CareerDiff handles sensitive personal career data. MVP rules:

- Do not store user input unless the user explicitly saves it.
- Do not log raw resumes, job descriptions, private notes, tokens, or API keys.
- Show a clear privacy note before analysis.
- Keep sample data synthetic.
- If persistence is added later, encrypt sensitive records and provide delete/export controls.

## Monetization hypotheses

- Individual job seeker plan: first 5 analyses free, then monthly subscription around KRW 9,900.
- Career coach plan: manage multiple candidates and job descriptions for KRW 30,000-100,000/month.
- Bootcamp/academy plan: cohort readiness reports.
- Developer-focused premium plan: GitHub repository analysis and portfolio gap recommendations.

## Acceptance criteria for MVP

- A user can paste a job description and candidate profile.
- The app returns structured requirement extraction.
- The app returns strong/weak/missing match sections.
- The app returns resume bullet rewrite suggestions.
- The app returns 3 mini project recommendations.
- The app shows a fit score with an explainable basis.
- The app does not persist sensitive input by default.
