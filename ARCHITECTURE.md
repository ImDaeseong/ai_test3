# Architecture

## Actual Stack

- Python 3.11+
- Web MVP: stdlib `http.server` (`ThreadingHTTPServer`/`BaseHTTPRequestHandler`) — no Flask/FastAPI dependency
- numpy, soundfile (optional DSP path; stdlib WAV fallback when absent)
- optional: pyloudnorm for LUFS; demucs/pedalboard/librosa listed in `requirements-optional.txt` as deferred, unused MIR experiments
- Markdown/JSON report renderer (no HTML templating engine)

## Folder Structure

```text
ai_test3/
├─ README.md
├─ SPEC.md
├─ ARCHITECTURE.md
├─ ACCEPTANCE_CRITERIA.md
├─ SECURITY_BOUNDARY.md
├─ VERIFICATION.md
├─ HOLD_CONDITIONS.md
├─ ROADMAP.md
├─ docs/                      (see docs/README.md for full read order)
│  ├─ evaluation_criteria.md
│  ├─ scoring_model.md
│  ├─ composer_criteria.md / lyricist_criteria.md / producer_criteria.md
│  ├─ mixing_criteria.md / mastering_criteria.md / ai_music_criteria.md
│  ├─ market_release_criteria.md
│  ├─ audio_analysis_scope.md / ai_music_analysis_scope.md / marketability_scoring.md
│  └─ reference_sources.md
├─ app/
│  ├─ core/        (dataclasses/enums only)
│  ├─ analyzers/    (audio + text/prompt feature extraction)
│  ├─ scoring/      (criteria-file-linked scoring classes)
│  ├─ reports/      (Markdown/JSON rendering)
│  ├─ services/     (orchestration used by cli and web)
│  ├─ cli/
│  └─ web/          (stdlib http.server; calls AnalysisService only)
├─ tests/
├─ uploads/    (gitignored, runtime only)
└─ outputs/    (gitignored, runtime only)
```

## Components

### Audio Analyzer

Extracts measurable audio features:

- duration
- BPM
- estimated key
- RMS mean/std
- dynamic range
- spectral centroid/rolloff
- frequency band energy
- LUFS when dependency is available

### Prompt and Lyrics Analyzer

Parses optional Suno prompt or lyrics:

- title, artist, genre, mood, instruments
- section names: Intro, Verse, Pre-Chorus, Chorus, Bridge, Outro
- chord tags and chord progression
- lyric density and repetition clues

### Scoring Engine

Converts raw analysis into practical scores:

- mix balance
- vocal clarity proxy
- low/high frequency balance
- chorus impact
- AI naturalness checklist
- platform fit: YouTube, Spotify, Apple Music, Melon, Shorts/Reels/TikTok

### Report Generator

Builds Markdown/HTML reports:

- executive summary
- technical stats
- strengths and weaknesses
- release recommendation
- improvement checklist

## Data Flow

1. User uploads audio file.
2. File validator checks extension, size, path safety, and readability.
3. Audio analyzer extracts measurable features.
4. Optional prompt/lyrics analyzer extracts structure metadata.
5. Scoring engine evaluates mix, AI feel, and marketability.
6. Report generator writes Markdown/HTML/JSON to `outputs/`.

## Risk Areas

- BPM/Key detection can be wrong for tempo changes, rubato, noisy mixes, or ambiguous harmony.
- Genre and artist similarity cannot be fully reliable without ML models or external metadata.
- AI naturalness is a subjective proxy unless trained classifiers are introduced.
- Demucs and advanced mastering dependencies are heavy and should be optional.

## CLI MVP Code Boundary

The first CLI MVP keeps UI and domain logic separated:

- `app/core`: dataclasses and enums only.
- `app/analyzers`: measurable feature extraction and text/prompt parsing.
- `app/scoring`: criteria-file-linked scoring classes.
- `app/reports`: Markdown/JSON rendering only.
- `app/services`: orchestration layer used by CLI and future web UI.
- `app/cli`: argument parsing and output paths only.
- `app/web`: reserved for future UI; must call `AnalysisService` and must not contain analysis/scoring logic.

## Optional DSP Analysis Boundary

`AudioAnalyzer` has two paths:

- stdlib WAV fallback: always available, used by the CLI MVP and tests.
- optional DSP path: enabled when `numpy` and `soundfile` are installed. It extracts BPM, estimated key, frequency bands, and optional LUFS when `pyloudnorm` is installed.

MP3/FLAC decoding is intentionally dependent on optional audio packages. Without them, the analyzer returns a warning rather than crashing.

