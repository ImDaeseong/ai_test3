# ai_test3

Personal project workspace. Each subfolder is an independent project with its own purpose, documents, and (where applicable) code — they do not share dependencies or runtime.

## Projects

### `music_insight_studio/`

Local-first music analysis tool: upload an MP3/WAV/FLAC file, get BPM/Key/LUFS/frequency-balance analysis combined with rule-based mix/master/AI-naturalness/market-fit scoring, delivered as a Korean-language report plus a MusicXML session chart.

- Status: **implemented and verified** — CLI MVP and local Web MVP both work, 33 unit tests passing.
- Stack: Python, stdlib `http.server` (no Flask/FastAPI), optional `numpy`/`soundfile`/`pyloudnorm` for DSP, optional `librosa`/`basic-pitch` as accuracy-upgrade providers with built-in fallbacks.
- What it demonstrates: a doc-driven build process (SPEC/ARCHITECTURE/ACCEPTANCE_CRITERIA/SECURITY_BOUNDARY/HOLD_CONDITIONS written before code), a real verification loop with mutation testing, and bugs found and fixed against real mastered audio files, not just synthetic fixtures — see `music_insight_studio/README.md`'s Verification Log for the round-by-round evidence.
- Start here: `music_insight_studio/README.md`, then `music_insight_studio/docs/INDEX.md` for the full document map.

### `CareerDiff/`

Job Fit Analyzer: paste a job description plus a resume/career/project history, extract job requirements, match them against candidate evidence, and produce a fit score, resume rewrite suggestions, mini-project recommendations, and an interview-prep plan.

- Status: **document-planning stage, no application code yet** — product scope, architecture, feature-level specs, module boundaries, and library decisions are documented; implementation has not started (progress gate 40% in `CareerDiff/VERIFICATION.md`).
- Planned stack: Next.js, TypeScript, LLM/RAG-backed analysis, mock-first UI before provider integration.
- What it demonstrates: a more formal documentation system than `music_insight_studio` — per-feature docs (`docs/features/`), a dedicated library-decision system (`docs/library-decisions/`), module boundary rules (`docs/design/MODULE_BOUNDARIES.md`), and a dated documentation audit (`docs/DOCUMENTATION_AUDIT.md`) that gates when implementation is allowed to start.
- Start here: `CareerDiff/README.md`, then `CareerDiff/docs/INDEX.md` for the full document map.

## Shared conventions

Both projects follow the same doc-before-code discipline, even though `CareerDiff` hasn't reached the code stage yet:

- A one-sentence use case stated up front.
- `SPEC.md` / product scope before implementation.
- `ARCHITECTURE.md` for technical direction and module boundaries.
- `VERIFICATION.md` for progress gates and (once code exists) concrete pass/fail verification commands.
- Explicit HOLD conditions that stop implementation and require human review.

`music_insight_studio` additionally shows what this discipline looks like once code exists: real test counts, real CLI/browser verification evidence, and a Verification Log that records what broke, why, and how it was confirmed fixed — including rounds where a prior claim in the docs didn't reproduce on re-verification and was corrected rather than left standing.
