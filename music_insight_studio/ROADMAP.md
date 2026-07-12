# Roadmap

## Status Summary

| Phase | Status |
|---|---|
| 0: Design | Done |
| 1: Local CLI MVP | Done |
| 2: Web MVP | Done |
| 3: AI Music and Suno Analysis | Partially done (style suggestion + basic text analysis; deeper vocal artifact detection not started) |
| 4: Comparison and Release Strategy | Not started |
| 5: Advanced Audio Processing | Not started |
| 6: Commercialization Readiness | Not started (planning docs only, see `docs/commercial/`) |
| 7: Score Generation | Partially done (MusicXML lead sheet export + in-browser rendering; beat/onset/chord/melody extraction not started) |

## Phase 0: Design

- Define purpose, security boundary, acceptance criteria, verification, and HOLD conditions.
- Document reusable code from `Analysis_music` and `mp3_daw`.

## Phase 1: Local CLI MVP

- Build a command-line analyzer for one audio file.
- Generate JSON and Markdown reports.
- Add tests for file validation, audio feature extraction, and scoring rules.

## Phase 2: Web MVP

- Add upload UI. Done: local stdlib web server accepts WAV/FLAC/MP3 uploads.
- Show report in browser. Done: result page shows user-friendly judgment, score, JSON link, and inline Korean report content.
- Allow report download. Done: JSON link is visible; Markdown files are still generated on disk for review/history.

## Phase 3: AI Music and Suno Analysis

- Add Suno prompt/lyrics input. CLI accepts prompt/lyrics files; Web keeps this as a later advanced option so the first screen stays simple.
- Score AI naturalness, vocal clarity, repetition, chorus strength, and lyric delivery. First text-analysis path exists; deeper vocal artifact detection remains later.
- Suggest Suno-ready style tags. Done: report shows current style and improved style from BPM, key, frequency balance, energy movement, duration, and score.

## Phase 4: Comparison and Release Strategy

- Compare A/B songs.
- Recommend which track to release first.
- Add platform-specific scoring profiles.

## Phase 5: Advanced Audio Processing

- Optional stem separation.
- Optional mastering preview.
- Optional waveform and spectral visualizations.

## Phase 6: Commercialization Readiness

- Add production API and worker architecture.
- Add upload size/duration limits.
- Add data retention and cleanup behavior.
- Add copyright/content policy before public launch.
- Add account, quota, and billing only after usage costs are measurable.

## Phase 7: Score Generation

- Add basic MusicXML lead sheet/session chart export from existing analysis data. Done: CLI and Web both generate `analysis_lead_sheet.musicxml`.
- Add confidence and limitation notes to every generated score. Done: every export includes a "Limitations" measure.
- Show the score without requiring a download. Done: Web MVP renders it in-browser on demand (click "악보 MusicXML") using a locally vendored renderer, alongside the raw MusicXML text.
- Scale section resolution to track length. Done: section count is duration-proportional (~15s/section, 4-24 range) instead of a fixed count.
- Later: add beat/onset/chord/melody extraction for richer transcription.
