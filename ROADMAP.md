# Roadmap

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
