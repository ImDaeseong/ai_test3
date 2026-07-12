# CareerDiff

CareerDiff is a developer-focused Job Fit Analyzer for comparing a job description with a candidate resume, career history, and project evidence.

## One-sentence use case

나는 이직 준비 중에 CareerDiff로 채용공고와 내 이력서/프로젝트를 비교해서 부족한 역량, 이력서 수정안, 보완 프로젝트를 얻는다.

## MVP

1. Paste a job description.
2. Paste resume, career notes, and project descriptions.
3. Extract job requirements.
4. Match requirements against candidate evidence.
5. Produce a fit score, strong matches, weak matches, missing evidence, resume rewrite suggestions, skill priority, mini project recommendations, and a 7-day preparation plan.

## First version

- Next.js web app.
- Job description input.
- Resume/career/project input.
- Analyze button.
- Dashboard-style result view.
- Local-first or no-retention data policy for MVP.

## Why this project matters

This project is useful for the creator's own job search and also works as a portfolio project. It demonstrates LLM/RAG usage, document parsing, skill extraction, scoring/ranking, prompt design, privacy-aware product design, dashboard UI, and practical problem solving.

## Folder guide

```text
CareerDiff/
  README.md
  SPEC.md
  ARCHITECTURE.md
  VERIFICATION.md
  app/
  docs/
    INDEX.md
    design/
    features/
    integration/
  prompts/
  samples/
```

## Document guide

- `README.md`: project entrance document. It explains the purpose, MVP, folder map, and next work.
- `SPEC.md`: product direction, target users, MVP scope, non-goals, privacy boundary, monetization ideas, and acceptance criteria.
- `ARCHITECTURE.md`: initial technical architecture, analysis pipeline, schema direction, future integrations, and human-review HOLD conditions.
- `VERIFICATION.md`: progress gates, verification loop, document checks, functional checks, privacy checks, and exit criteria.
- `docs/INDEX.md`: full documentation index.
- `docs/features/README.md`: feature-document rules and feature list.
- `docs/features/01-job-description-input.md`: job description input rules, UI contract, and validation checks.
- `docs/features/02-candidate-profile-input.md`: resume/career/project input rules and privacy checks.
- `docs/features/03-job-requirement-extraction.md`: required/preferred skill extraction and job requirement structure.
- `docs/features/04-candidate-evidence-extraction.md`: candidate evidence extraction rules and confidence handling.
- `docs/features/05-evidence-matching.md`: strong, weak, missing, and risk matching logic.
- `docs/features/06-fit-scoring.md`: explainable fit score dimensions and scoring boundaries.
- `docs/features/07-resume-suggestions.md`: resume bullet, project description, ATS keyword, and STAR rewrite rules.
- `docs/features/08-mini-project-recommendations.md`: 3 small project recommendations tied to missing evidence.
- `docs/features/09-interview-preparation.md`: expected questions, weak areas, and 7-day preparation plan.
- `docs/features/10-analysis-dashboard.md`: result dashboard sections and display-only UI boundaries.
- `docs/design/DATA_MODEL.md`: shared TypeScript-style data contracts between features.
- `docs/design/MODULE_BOUNDARIES.md`: source layout, class/service boundaries, and dependency direction.
- `docs/design/UI_DESIGN.md`: first-screen UI, result dashboard layout, interaction principles, and privacy UI.
- `docs/integration/ANALYSIS_FLOW.md`: how inputs, feature services, orchestrator, and dashboard connect.
- `docs/integration/PROMPT_SERVICE_MAP.md`: which parts are LLM-backed, deterministic, and privacy-sensitive.
- `prompts/README.md`: analyzer prompt goals and hard rules.
- `samples/README.md`: synthetic sample data rules and sensitive-data restrictions.

## Maintenance direction

- Keep each feature's logic separate.
- Share data through `docs/design/DATA_MODEL.md` instead of passing unstructured text across unrelated modules.
- Let `AnalysisOrchestrator` coordinate feature services.
- Keep UI components display-focused; UI should not own analysis logic.
- Use class or service boundaries for analysis modules that are stateful, replaceable, or independently testable.
- Use small pure functions for validation, formatting, and simple UI helpers.

## Next work

1. Confirm the MVP implementation stack: Next.js, TypeScript, and a mock-first analyzer.
2. Scaffold the actual app structure under `app/` or replace it with a standard Next.js project layout.
3. Create shared TypeScript types from `docs/design/DATA_MODEL.md`.
4. Build a mock `CareerDiffAnalysisResult` so UI can be developed before LLM integration.
5. Build the first usable analyzer screen: job description input, candidate profile input, analyze button, and privacy notice.
6. Build the dashboard using mock data: score, requirements, matches, resume suggestions, mini projects, and interview prep.
7. Add `AnalysisOrchestrator` and service class skeletons.
8. Add tests for input validation, mock result rendering, and privacy boundaries.
9. Connect an LLM provider only after the mock UI and data contracts are stable.

## Current status

- Product purpose and one-sentence use case are defined.
- Security boundary, acceptance criteria, verification checks, and HOLD conditions are documented.
- Feature-level design documents are split by responsibility.
- Shared data model, module boundaries, UI design, and integration flow are documented.
- Current progress gate: 40% in `VERIFICATION.md`.

## Library decision documents

- `docs/library-decisions/README.md`: dependency decision rules and document map.
- `docs/library-decisions/SELECTION_CRITERIA.md`: criteria for choosing or rejecting libraries.
- `docs/library-decisions/TECH_STACK_DECISIONS.md`: project-wide recommended stack and alternatives considered.
- `docs/library-decisions/FEATURE_LIBRARY_MATRIX.md`: feature-to-library map.
- `docs/library-decisions/features/`: per-feature implementation and library choice documents.

## Production architecture

The current feature-based structure should be kept if CareerDiff becomes a real service. The runtime architecture must evolve by adding auth, persistence, privacy controls, provider abstraction, background jobs, observability, and billing around the existing feature modules. See `docs/design/PRODUCTION_ARCHITECTURE.md` and `docs/integration/RUNTIME_EVOLUTION.md`.

## AI data and RAG strategy

CareerDiff's service value depends on structured, privacy-safe analysis data. The MVP should not add a vector database first. It should create stable structured data contracts now, then add embeddings/RAG later for saved evidence libraries, job taxonomies, GitHub project retrieval, and historical analysis lookup. See `docs/design/AI_DATA_STRATEGY.md` and `docs/integration/RAG_EMBEDDING_PLAN.md`.

## RAG in the base design

RAG is included in the base architecture through `RetrievalContext`, `RagContextProvider`, `EmbeddingProvider`, `VectorStore`, `ChunkBuilder`, and `RetrievalPolicy`. The first MVP can keep retrieval disabled while still building types and UI contracts that will support saved evidence, public skill taxonomy, GitHub evidence, and historical analysis retrieval later.

