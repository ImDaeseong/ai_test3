# Music Insight Studio

음원 파일과 Suno 등 AI 음악 제작 자료를 분석해 한국어 리포트를 생성하는 로컬 우선 음악 분석 도구입니다.

## One-Sentence Use Case

나는 음악 제작/발매 준비 상황에서 이 도구로 음원 파일을 업로드해서 BPM, Key, 믹싱 상태, AI 음악 자연스러움, 시장성을 분석한 한국어 리포트를 얻는다.

## MVP Goal

1차 버전은 MP3/WAV/FLAC 파일을 입력받아 자동 분석값과 휴리스틱 평가를 결합한 Markdown, 한국어 Markdown, JSON 리포트를 생성합니다.

## Initial Scope

- BPM, Key, 길이, LUFS, RMS, 다이내믹 레인지 추정
- 저음/중음/고음 주파수 밸런스 분석
- 섹션별 에너지 흐름 분석
- 믹싱/마스터링 상태 평가
- AI 음악 자연스러움 평가를 위한 체크리스트 기반 리포트
- 분석값 기반 현재 Suno 스타일 요약과 개선 스타일 제안
- 피크 1.000 같은 헤드룸/클리핑 위험 경고
- 분석 결과 상단의 우선 개선 포인트 자동 요약
- 유튜브/스트리밍/숏폼 적합성 점수 초안
- A/B 곡 비교를 위한 확장 가능 구조

## Reference Sources

로컬 인접 프로젝트(이 저장소 밖, 경로는 비공개)의 로직을 참고해 재구성했습니다. 상세 파일 단위 참고 내역은 `docs/reference_sources.md`를 확인하세요.

- `Analysis_music`: Flask 리포트 생성, Suno 프롬프트 파서, 기본 오디오 분석
- `mp3_daw`: BPM/Key/LUFS/주파수 분석, 파형 피크, 마스터링, stem 분리 엔진

## Non-Goals for MVP

- 저작권 침해 목적의 특정 가수 복제 생성
- 외부 음원 플랫폼 자동 업로드
- 유료 스트리밍 성과 보장
- 완전한 음악학적 채보 또는 전문 마스터링 대체

## Project Status

CLI MVP와 로컬 Web MVP 모두 구현·검증 완료 상태입니다. CLI는 `analysis_report.md`, `analysis_report.ko.md`, `analysis_report.json`을 생성하고, Web MVP는 같은 `AnalysisService`를 호출해 업로드 파일을 분석한 뒤 같은 화면에 한국어 리포트를 인라인으로 표시합니다 (`outputs/web/<request-id>/`에 동일한 3종 리포트 저장). 단위 테스트 20개가 `tests/test_cli_mvp.py`에 있으며 전부 통과합니다.

## Setup

```powershell
python -m venv .venv
.\.venv\Scripts\pip.exe install -r requirements.txt
```

DSP 정확도를 낮춘 대신 표준 라이브러리만으로도 WAV 분석은 동작하지만(`numpy`/`soundfile`/`pyloudnorm` 미설치 시 폴백), 위 설치를 권장합니다. `requirements-optional.txt`는 아직 이 분석 경로에서 쓰지 않는 실험적 MIR 패키지(librosa/demucs/pedalboard, `ARCHITECTURE.md` 참고) 목록이며 기본 설치에는 필요 없습니다.

더블클릭으로 Web UI를 바로 열려면 `run.bat`을 실행하세요 (`.venv`가 있어야 합니다).

## Criteria Docs

1차 평가 기준 문서는 `docs/README.md`에서 읽는 순서와 완료 기준을 확인한다.

## CLI Quick Start

```powershell
.\.venv\Scripts\python.exe -m app.cli analyze .\tests\fixtures\sample.wav --out .\outputs --mode general
```

생성 산출물:

- `outputs/analysis_report.md`: 개발/검토용 영문 Markdown
- `outputs/analysis_report.ko.md`: 사용자 확인용 한국어 Markdown
- `outputs/analysis_report.json`: UI/API 연동용 구조화 데이터

## Web Quick Start

```powershell
.\.venv\Scripts\python.exe -m app.web.server --host 127.0.0.1 --port 8765
```

브라우저에서 `http://127.0.0.1:8765`를 열고 WAV/FLAC/MP3 파일을 업로드한 뒤 mode를 선택하면 같은 화면에서 한국어 분석 리포트를 볼 수 있습니다. 화면에는 JSON 링크만 표시하고, `outputs/web/<request-id>/` 아래에는 Markdown, Korean Markdown, JSON 리포트가 함께 생성됩니다.

## Codec Fixtures

검증용 fixture는 `tests/fixtures`에 있습니다.

- `sample.wav`
- `sample.flac`
- `sample.mp3`
- `release_90s.mp3`

세 포맷 모두 현재 `.venv`의 `soundfile/libsndfile` 환경에서 분석 검증이 통과했습니다. `release_90s.mp3`는 발매 길이 구간 점수 검증용 fixture입니다. 다른 PC에서 MP3/FLAC 코덱이 빠져 있으면 테스트는 skip되거나 명확한 코덱 오류를 반환해야 합니다.

```powershell
.\.venv\Scripts\python.exe -m app.cli analyze .\tests\fixtures\sample.wav --out .\outputs\wav --mode general
.\.venv\Scripts\python.exe -m app.cli analyze .\tests\fixtures\sample.flac --out .\outputs\flac --mode general
.\.venv\Scripts\python.exe -m app.cli analyze .\tests\fixtures\sample.mp3 --out .\outputs\mp3 --mode general
```

## Verification Log

| 날짜 | 내용 | 결과 |
|---|---|---|
| 2026-07-09 | 저장소에 커밋이 하나도 없던 상태 확인 — `.gitignore` 추가(`.venv/`, `__pycache__/`, `uploads/`, `outputs/`), 초기 커밋 생성 후 `origin/main` 푸시 | PASS: 53 files, `python -m unittest discover -s tests` 19/19 |
| 2026-07-09 | `requirements-optional.txt`가 `requirements.txt`와 완전 중복되던 것을 발견 — `ARCHITECTURE.md`에 명시된 실험용 의존성(librosa/demucs/pedalboard)만 남기도록 수정 | PASS: 19/19 유지 |
| 2026-07-09 | `VERIFICATION.md`의 "unittest: 11 tests OK"가 실제(19개)와 불일치 — 최신 값으로 갱신, 문서에 적힌 다른 기대 점수(REVISE 57.5, PASS 77)도 실제 CLI 실행으로 재확인 | PASS: 값 일치 확인 |
| 2026-07-09 | 웹 결과 화면에서 `` `code` ``/`**bold**` 인라인 마크다운이 그대로 문자로 노출되던 버그 발견(Suno 스타일 제안, 종합 점수/최종 판단, 기준 문서 참조 전부 영향) — `render_inline_markdown()` 추가로 수정, Playwright로 실제 브라우저 업로드까지 확인 | PASS: 19/19, 실브라우저 렌더링 확인 |
| 2026-07-09 | README/VERIFICATION.md/docs 2개 파일에 로컬 절대경로(사용자명 포함)가 그대로 커밋되어 있던 것 발견 — VERIFICATION.md의 검증 명령 ~22곳을 상대경로로, 참고 프로젝트 경로 언급은 이름만 남기고 경로 비공개로 수정 | PASS: 19/19, `grep -rl cs930` 추적 파일 0건 |
| 2026-07-09 | 실제 마스터링 완료 곡 38개 배치 분석 결과 전곡 REVISE·점수 4종에만 몰리는 현상 발견 — 원인 조사: (1) sample peak=1.000일 때 Mix/Master 점수를 고정 상한(65)으로 묶는 로직은 `test_full_scale_peak_is_flagged_and_not_overrewarded`로 이미 검증된 의도된 동작, (2) Composition/Production evidence가 실제 점수를 가른 신호(구간 에너지 편차)를 누락해 동일 evidence에서 다른 점수가 나오는 투명성 결함 발견 — `energy_label_variety`/`energy_spread` evidence 필드 추가로 수정 | PASS: 20/20 (신규 회귀 테스트 포함), mutation test로 수정 제거 시 신규 테스트 FAIL 확인 후 복원 재확인 |
