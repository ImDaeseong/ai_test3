# Verification

## Verification Loop

Current phase: CLI MVP implementation and report verification.

Completion criteria:

- Required documents exist.
- Purpose, security boundary, acceptance criteria, verification commands, and HOLD conditions are documented.
- Reference-source reuse plan is documented.
- CLI MVP generates Markdown, Korean Markdown, and JSON reports.
- WAV, FLAC, and MP3 fixtures are analyzed through the same CLI path when codecs are available.
- Local Web MVP accepts an audio upload through `app.web.server` and writes the same report set through `AnalysisService`.
- Local Web MVP keeps the first screen to file upload, mode selection, and analyze action, then renders the Korean report inline.
- Korean report includes current Suno style and improved Suno style suggestions based on analysis evidence.
- Full-scale peaks must lower mix/master judgment to `수정 권장` and show headroom/clipping evidence.
- AI/Suno mode without prompt or lyrics must not be scored as release-ready AI naturalness.
- Korean report must show `우선 개선 포인트` before detailed technical sections.

## Design Verification Commands

```powershell
Get-ChildItem -Force .
Get-ChildItem -Force .\docs
Select-String -Path .\README.md -Pattern "One-Sentence Use Case"
Select-String -Path .\SPEC.md -Pattern "MVP Features"
Select-String -Path .\SECURITY_BOUNDARY.md -Pattern "Local-First Policy"
Select-String -Path .\ACCEPTANCE_CRITERIA.md -Pattern "MVP Completion Criteria"
Select-String -Path .\HOLD_CONDITIONS.md -Pattern "HOLD Conditions"
```

## Future Implementation Verification

```powershell
python -m pytest
python -m app.cli analyze .\tests\fixtures\sample.wav --out .\outputs
```

## Evidence Rule

Every verification step must use a real command or file read and must show a concrete pass/fail signal.

## Evaluation Criteria Verification

```powershell
Select-String -Path .\docs\evaluation_criteria.md -Pattern "Score Groups"
Select-String -Path .\docs\evaluation_criteria.md -Pattern "PASS / REVISE / HOLD"
Select-String -Path .\SPEC.md -Pattern "Evaluation Criteria Source"
```

## Specialist Criteria Verification

```powershell
Get-ChildItem -Force .\docs\*_criteria.md
Select-String -Path .\docs\composer_criteria.md -Pattern "Composer Criteria"
Select-String -Path .\docs\lyricist_criteria.md -Pattern "Lyricist Criteria"
Select-String -Path .\docs\producer_criteria.md -Pattern "Producer Criteria"
Select-String -Path .\docs\mixing_criteria.md -Pattern "Mixing Criteria"
Select-String -Path .\docs\mastering_criteria.md -Pattern "Mastering Criteria"
Select-String -Path .\docs\ai_music_criteria.md -Pattern "AI Music Criteria"
Select-String -Path .\docs\market_release_criteria.md -Pattern "Market and Release Criteria"
Select-String -Path .\docs\scoring_model.md -Pattern "Default Score Groups"
Select-String -Path .\docs\evaluation_criteria.md -Pattern "Specialist Criteria Documents"
```

## Docs Index Verification

```powershell
Select-String -Path .\docs\README.md -Pattern "Read Order"
Select-String -Path .\README.md -Pattern "Criteria Docs"
```

## CLI MVP Verification

```powershell
python -m unittest discover -s tests
python -m app.cli analyze .\tests\fixtures\sample.wav --out .\outputs --mode general
```

The unit tests generate their own temporary WAV fixture. The CLI command above requires a real fixture file if run manually.

## Optional DSP Verification

```powershell
python -c "import importlib.util as u; print('numpy', bool(u.find_spec('numpy'))); print('soundfile', bool(u.find_spec('soundfile'))); print('pyloudnorm', bool(u.find_spec('pyloudnorm')))"
python -m unittest discover -s tests
python -m app.cli analyze .\tests\fixtures\sample.wav --out .\outputs --mode general
```

If optional packages are absent, WAV fallback must still pass and MP3/FLAC must return a clear optional-dependency warning.


## Korean Report Verification

```powershell
.\.venv\Scripts\python.exe -m unittest discover -s tests
.\.venv\Scripts\python.exe -m compileall app tests
.\.venv\Scripts\python.exe -m app.cli analyze .\tests\fixtures\sample.wav --out .\outputs --mode general
Select-String -Path .\outputs\analysis_report.ko.md -Pattern "음악 분석 리포트|핵심 오디오 근거|세부 평가|기술적 오디오 품질"
```

Expected output files:

- `outputs/analysis_report.md`
- `outputs/analysis_report.ko.md`
- `outputs/analysis_report.json`
## Codec Format Verification

```powershell
.\.venv\Scripts\python.exe -c "import soundfile as sf; print(sf.__libsndfile_version__); print('MP3' in sf.available_formats()); print('FLAC' in sf.available_formats())"
.\.venv\Scripts\python.exe -m unittest discover -s tests
.\.venv\Scripts\python.exe -m app.cli analyze .\tests\fixtures\sample.wav --out .\outputs\wav --mode general
.\.venv\Scripts\python.exe -m app.cli analyze .\tests\fixtures\sample.flac --out .\outputs\flac --mode general
.\.venv\Scripts\python.exe -m app.cli analyze .\tests\fixtures\sample.mp3 --out .\outputs\mp3 --mode general
Select-String -Path .\outputs\wav\analysis_report.ko.md,.\outputs\flac\analysis_report.ko.md,.\outputs\mp3\analysis_report.ko.md -Pattern "BPM:|추정 Key:|LUFS:|주파수 밴드"
```

Expected current environment signal:

- libsndfile: `1.2.2`
- MP3 codec: `True`
- FLAC codec: `True`
- unittest: `19 tests OK`
- each short-fixture CLI run: `verdict=REVISE score=57.5` and three report files

## Scoring Calibration Verification

```powershell
.\.venv\Scripts\python.exe -m unittest discover -s tests
.\.venv\Scripts\python.exe -m app.cli analyze .\tests\fixtures\sample.wav --out .\outputs\calibrated_wav --mode general
Select-String -Path .\outputs\calibrated_wav\analysis_report.ko.md -Pattern "REVISE|duration_too_short_for_music_judgment|종합 점수"
```

Expected short-fixture signal:

- CLI verdict: `REVISE`
- score: around `57.5`
- evidence includes `duration_too_short_for_music_judgment`

## Release-Length Verification

```powershell
.\.venv\Scripts\python.exe -m unittest discover -s tests
.\.venv\Scripts\python.exe -m app.cli analyze .\tests\fixtures\release_90s.mp3 --out .\outputs\release_90s --mode general --target spotify
Select-String -Path .\outputs\release_90s\analysis_report.ko.md -Pattern "PASS|일반 발매 길이 구간|종합 점수|시장성"
```

Expected release-length fixture signal:

- CLI verdict: `PASS`
- score: around `77`
- evidence includes `일반 발매 길이 구간`
- generated reports: Markdown, Korean Markdown, JSON

## Web MVP Verification

```powershell
.\.venv\Scripts\python.exe -m unittest discover -s tests
.\.venv\Scripts\python.exe -m compileall app tests
.\.venv\Scripts\python.exe -m app.web.server --host 127.0.0.1 --port 8765
```

Expected web signal:

- unittest includes Web MVP helper coverage.
- server prints `Music Insight Studio web UI: http://127.0.0.1:8765`.
- browser upload creates Markdown, Korean Markdown, and JSON reports under `outputs/web/<request-id>/`.
- result page renders Korean report content inline and shows only the JSON link.
- visible judgment labels are user-facing Korean labels such as `수정 권장`, not raw internal labels such as `REVISE / 수정 권장`.

## Simplified Web UI Verification

```powershell
.\.venv\Scripts\python.exe -m unittest discover -s tests
```

Expected simplified UI signal:

- Web form renders file upload and `mode`.
- Web form does not render `target`, `prompt`, or `lyrics` fields.
- Web upload helper returns Korean report text for inline rendering.

## Suno Style Suggestion Verification

```powershell
.\.venv\Scripts\python.exe -m unittest discover -s tests
```

Expected style signal:

- Korean report includes `Suno 스타일 제안`.
- Korean report includes `현재 스타일` and `개선 스타일`.


