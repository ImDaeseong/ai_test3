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
│  ├─ reference_sources.md
│  ├─ commercial/    (COMMERCIAL_READINESS.md, PRODUCTION_ARCHITECTURE.md, WEB_SECURITY.md, DATA_RETENTION.md, COPYRIGHT_POLICY.md)
│  └─ features/      (score_generation.md)
├─ app/
│  ├─ core/        (dataclasses/enums only)
│  ├─ analyzers/    (audio + text/prompt feature extraction)
│  ├─ scoring/      (criteria-file-linked scoring classes)
│  ├─ reports/      (Markdown/JSON rendering)
│  ├─ notation/     (MusicXML lead-sheet export; see Notation Export Boundary)
│  ├─ services/     (orchestration used by cli and web)
│  ├─ cli/
│  └─ web/          (stdlib http.server; calls AnalysisService only)
│     └─ static/vendor/  (vendored browser JS, e.g. OpenSheetMusicDisplay; no CDN calls)
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
- `app/web`: calls `AnalysisService` and must not contain analysis/scoring logic. It may serve vendored, build-free static JS assets (`app/web/static/vendor/`) for browser-side rendering (e.g. MusicXML notation); this is UI presentation, not analysis logic.

## Optional DSP Analysis Boundary

`AudioAnalyzer` has two paths:

- stdlib WAV fallback: always available, used by the CLI MVP and tests.
- optional DSP path: enabled when `numpy` and `soundfile` are installed. It extracts BPM, estimated key, frequency bands, and optional LUFS when `pyloudnorm` is installed.

MP3/FLAC decoding is intentionally dependent on optional audio packages. Without them, the analyzer returns a warning rather than crashing.


## Commercial Architecture Note

The current stdlib `http.server` web layer is local-only. A commercial service should introduce a production API layer, upload service, analysis job queue, background worker, object storage, database, auth/quota checks, and privacy-safe report delivery. See `docs/commercial/PRODUCTION_ARCHITECTURE.md`.

## Notation Export Boundary

Score generation must be a separate export module, not part of the scoring engine. The initial feasible version is a MusicXML lead sheet/session chart based on current analysis metadata. Full melody/chord transcription is a later feature that requires additional pitch, onset, beat, and chord evidence. See `docs/features/score_generation.md`.

Section count scales with track duration (`AudioAnalyzer.TARGET_SECTION_SECONDS = 15s`, clamped to 4-24 sections) instead of a fixed count, so the chart's resolution matches the song's length. The Web MVP renders this MusicXML in-browser on demand (click "악보 MusicXML") using a locally vendored renderer (`app/web/static/vendor/opensheetmusicdisplay.min.js`), showing both the rendered staff and the raw MusicXML text; no CDN request is made at runtime, consistent with `SECURITY_BOUNDARY.md`'s local-first policy.

## 2026-07-12 BPM Estimation Update

BPM estimation now uses a lightweight beat-tracking proxy in the optional DSP path:

- Downsample/limit audio for local performance.
- Build a spectral-flux onset envelope from short FFT frames.
- Score autocorrelation tempo candidates with harmonic support and a mild tempo prior.
- Fall back to RMS-envelope tempo estimation when onset confidence is low.

This is still not a full beat tracker with downbeat, meter, and tempo-change handling, but it reduces coarse BPM grid locking on mastered WAV files.

## 2026-07-12 Librosa BPM Provider

Added an optional `librosa.beat.beat_track` provider ahead of the built-in spectral-flux estimator:

1. `librosa.beat.beat_track` (used when `librosa` is installed and returns confidence >= 0.05)
2. Built-in spectral-flux onset autocorrelation (previous section)
3. RMS-envelope fallback

`librosa` is documented as optional in `requirements-optional.txt`; the analyzer imports it lazily inside a try/except so its absence never breaks analysis. Verified directly (not just via the unit test's fake-librosa patch): a synthetic 120 BPM click track returns a different BPM/confidence pair with `librosa` importable (117.45 BPM, confidence 0.877) versus with the `librosa` import blocked (120.08 BPM, confidence 0.836), confirming both code paths actually execute.

Re-running the 38-file real mastered WAV batch (local verification set, not checked into this repository) with `librosa` installed (0.11.0) gives **15 unique BPM values across 38 files, 0 errors, BPM confidence 0.83-0.90**. The previously recorded "12 to 37 unique BPM" figure for this update was not reproducible on re-verification and has been removed; 15/38 is the measured value as of this update.
