# CareerDiff Architecture

## Initial architecture

CareerDiff starts as a small web application with a narrow, testable analysis pipeline.

Recommended stack:

- Frontend: Next.js with TypeScript.
- Styling: Tailwind CSS or a small component system.
- Analysis API: Next.js route handler for MVP, separable into FastAPI later if needed.
- LLM provider: configurable through environment variables.
- Storage: none by default for MVP; optional local browser state for drafts.

## Main modules

### Input UI

Collects:

- Job description text.
- Resume/career/project text.
- Optional role target and seniority target.

### Analysis pipeline

1. Normalize input text.
2. Extract job requirements into structured JSON.
3. Extract candidate evidence into structured JSON.
4. Match requirements to evidence.
5. Score fit by category.
6. Generate resume rewrites, skill priority, mini projects, and preparation plan.
7. Render an explainable dashboard.

## Suggested result schema

```json
{
  "fitScore": 0,
  "summary": "",
  "jobRequirements": {
    "requiredSkills": [],
    "preferredSkills": [],
    "domain": [],
    "seniority": "",
    "collaboration": [],
    "deliveryExpectations": []
  },
  "matches": {
    "strong": [],
    "weak": [],
    "missing": [],
    "risks": []
  },
  "resumeSuggestions": {
    "bullets": [],
    "projectDescriptions": [],
    "skillPriority": [],
    "atsKeywords": []
  },
  "miniProjects": [],
  "interviewPrep": {
    "questions": [],
    "weakAreas": [],
    "sevenDayPlan": []
  }
}
```

## LLM/RAG direction

RAG is part of the base architecture, but it is not required for the first mock-first MVP.

MVP behavior:

- Include `RetrievalContext` in the shared result schema.
- Set `retrievalContext.enabled` to `false`.
- Use no vector database.
- Keep structured extraction, matching, scoring, and dashboard rendering stable first.

RAG-enabled behavior later:

- Retrieve saved candidate evidence.
- Retrieve public skill taxonomy context.
- Retrieve GitHub project evidence after GitHub analysis exists.
- Retrieve historical analyses when users explicitly save them.
- Pass retrieved context into matching, suggestions, mini projects, and interview prep.

RAG must not be used to store or retrieve raw resumes by default. It should retrieve small, typed, consent-aware chunks such as job requirements, candidate evidence, project evidence, skill taxonomy items, and analysis summaries.

## RAG base modules

- `RagContextProvider`: returns retrieval context for an analysis request.
- `EmbeddingProvider`: embeds approved chunks after explicit save or public-data ingestion.
- `VectorStore`: stores and retrieves vectors with owner, visibility, source type, consent, and PII filters.
- `ChunkBuilder`: creates small embeddable chunks from structured data.
- `RetrievalPolicy`: blocks unsafe retrieval or vectorization.

## Prompt design principles

- Require evidence-based matching.
- Do not invent candidate experience.
- Separate strong, weak, and missing evidence.
- Explain why each missing item matters.
- Prefer concrete rewrites over generic advice.
- Return machine-readable JSON before UI rendering.

## Future integrations

- PDF resume parsing.
- GitHub repo/README analysis.
- Notion resume import.
- LinkedIn profile import if allowed.
- Job posting URL parsing where terms allow it.
- Export to Markdown/PDF.

## Human-review HOLD conditions

Stop and ask for human review if:

- The app would store or transmit sensitive resume data without a clear policy.
- The design requires scraping job boards without checking terms.
- The analysis starts making hiring guarantees.
- The project scope expands into a broad applicant tracking system before MVP is usable.

## Production architecture note

The current feature-based structure is intended to survive production, but the runtime architecture must gain additional service layers before launch. See `docs/design/PRODUCTION_ARCHITECTURE.md` and `docs/integration/RUNTIME_EVOLUTION.md` for the final target structure and migration stages.

## AI data strategy note

CareerDiff should not vectorize and store raw resumes or job descriptions by default. The long-term data asset should be structured, consent-aware analysis data: job requirements, candidate evidence, match results, scoring signals, user feedback, and anonymized aggregate trends. See `docs/design/AI_DATA_STRATEGY.md` and `docs/integration/RAG_EMBEDDING_PLAN.md`.

