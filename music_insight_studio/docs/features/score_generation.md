# Feature: Score Generation and Notation Export

## Purpose

Allow Music Insight Studio to export a basic score or lead sheet from analysis data when enough musical evidence exists.

## Feasibility decision

Current analysis data can support only a limited score export:

- estimated BPM,
- estimated key,
- duration,
- section energy labels,
- optional lyrics/prompt sections.

This is not enough for accurate full transcription. Accurate melody/chord/drum notation requires pitch tracking, onset detection, chord recognition, beat tracking, and possibly source separation.

## MVP notation scope

Start with a simple lead sheet / session chart export, not full automatic transcription.

MVP output:

- MusicXML file.
- Optional MIDI click/guide file later.
- Title, estimated key, estimated tempo.
- Section structure from `section_energies`, sized to track duration (~15s per section, clamped to 4-24 sections; see `AudioAnalyzer.TARGET_SECTION_SECONDS`) rather than a fixed count.
- Section labels and energy annotations.
- Optional lyric section names if provided.
- Confidence notes explaining that melody/chords are not fully transcribed.
- Web MVP renders this MusicXML in-browser on demand (locally vendored OpenSheetMusicDisplay, no CDN), alongside the raw MusicXML text.

## Later advanced notation scope

Later features may add:

- beat grid,
- onset events,
- vocal melody approximation,
- chord estimation,
- bass rhythm hints,
- drum pattern approximation,
- MusicXML + MIDI + PDF export.

## Required data model additions later

```python
@dataclass
class NotationEvent:
    start_sec: float
    duration_sec: float
    pitch: str | None
    velocity: float | None
    label: str
    confidence: str

@dataclass
class ScoreExport:
    title: str
    estimated_key: str
    estimated_bpm: float
    format: str
    path: str
    confidence: str
    limitations: list[str]
```

## Suggested module boundary

```text
app/
  notation/
    __init__.py
    lead_sheet.py
    musicxml_writer.py
    midi_writer.py       (later)
    transcription.py     (later)
```

## Suggested libraries

### MVP

- Standard library XML writer for simple MusicXML.
- No heavy dependency required.

### Later

- `music21` for richer MusicXML manipulation.
- `pretty_midi` or `mido` for MIDI export.
- `librosa` for onset/beat/chroma features.
- `basic-pitch` or similar model only after explicit dependency approval.

## Rules

- Do not claim the generated score is exact transcription.
- Every score export must include confidence and limitations.
- Keep notation export separate from scoring logic.
- Do not require heavy ML dependencies for the MVP lead-sheet export.

## Verification checks

- Given an `EvaluationReport`, MusicXML export includes title, tempo, key, and section labels.
- Export does not crash when BPM/key are unknown.
- Export includes limitation notes.
- Existing analysis tests still pass.

## 2026-07-12 Implementation Update

The score export now has a separate transcription boundary:

- `ScoreTranscriber` first tries optional `basic-pitch` note events when the package is installed.
- If `basic-pitch` is unavailable, it uses a local numpy/soundfile autocorrelation melody guide for rough pitched notes.
- If no pitched events are reliable, `LeadSheetMusicXmlWriter` falls back to the older section-energy session chart.
- The MusicXML output clearly labels generated notes as a transcription guide, not publication-ready sheet music.

Library decision:

- `basic-pitch` is the preferred first upgrade for audio-to-MIDI because it is built for automatic music transcription and returns note events/MIDI from audio.
- `music21` is the preferred later score post-processing layer for quantization, notation cleanup, and richer MusicXML export.
- `librosa.pyin` remains useful for monophonic pitch tracking, but it is weaker than a dedicated AMT model for polyphonic songs.

Acceptance boundary:

- For a full mixed/mastered WAV, automatic notation is still approximate.
- Commercial UI must call this output `악보 가이드` or `transcription guide`, not `정확한 악보`.
- A future production worker should cache model loading and run long audio transcription as a background job.
