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

CLI MVP와 로컬 Web MVP 모두 구현·검증 완료 상태입니다. CLI는 `analysis_report.md`, `analysis_report.ko.md`, `analysis_report.json`, `analysis_lead_sheet.musicxml`을 생성하고, Web MVP는 같은 `AnalysisService`를 호출해 업로드 파일을 분석한 뒤 같은 화면에 한국어 리포트를 표시합니다 (`outputs/web/<request-id>/`에 동일한 리포트 저장). `JSON`과 `악보 MusicXML` 링크는 둘 다 새 탭에서 열려(`target="_blank"`) 원래 결과 화면을 잃지 않으며, 악보는 새 탭에서 연 `/score` 페이지가 로컬 vendoring된 렌더러로 렌더링합니다. 웹 제출은 `fetch()` 기반 비동기 방식이라 분석 중 페이지 이동이 없고, 선택했던 파일도 결과 표시 후 그대로 유지됩니다. BPM 추정은 `librosa`(설치 시) → 내장 spectral-flux → RMS envelope 순으로 폴백하고, 악보 생성은 `basic-pitch`(설치 시) → 내장 오토코릴레이션 멜로디 가이드 → 구간 에너지 차트 순으로 폴백합니다(둘 다 optional 의존성, 미설치 시 자동으로 다음 provider 사용). 웹 업로드에는 확장자 화이트리스트, 파일 시그니처 검증, 용량 제한이 적용됩니다. 단위 테스트 33개가 `tests/test_cli_mvp.py`에 있으며 전부 통과합니다.

## 개발 프로세스

이 프로젝트는 AI 코딩 에이전트와 협업하되, 구현 전에 스펙·보안 경계·완료 기준·HOLD 조건을 문서로 먼저 정의하는 방식으로 진행했습니다 (`SPEC.md`, `SECURITY_BOUNDARY.md`, `ACCEPTANCE_CRITERIA.md`, `HOLD_CONDITIONS.md`). 이 프로젝트가 실제로 보여주는 역량은 오디오 신호처리 자체의 정교함보다 다음 세 가지입니다.

- **검증 루프**: 결함을 고칠 때 회귀 테스트를 추가하고, 그 수정을 되돌렸을 때 테스트가 실제로 실패하는지(mutation test)까지 확인한 뒤 복원·커밋합니다. `VERIFICATION.md`와 아래 Verification Log가 각 라운드의 근거입니다.
- **보안 감각**: 커밋된 문서에 로컬 절대경로(사용자명 포함)가 노출된 것을 직접 찾아 4개 파일에서 제거했습니다 (Verification Log 2026-07-09 항목).
- **실데이터 검증**: 합성 fixture 통과만으로 끝내지 않고, 실제 마스터링 완료곡 38개를 배치 분석해 점수 분포 이상을 발견하고 원인을 코드 레벨까지 추적해 수정했습니다.

2026-07-09 이전 작업은 커밋 없이 진행되어 초기 커밋에 한 번에 반영됐습니다. 그 이후부터는 기능 단위가 아니라 "검증이 끝난 단위"로 작게 커밋하고, 각 라운드를 Verification Log에 기록하는 방식을 유지합니다.

## Setup

```powershell
python -m venv .venv
.\.venv\Scripts\pip.exe install -r requirements.txt
```

DSP 정확도를 낮춘 대신 표준 라이브러리만으로도 WAV 분석은 동작하지만(`numpy`/`soundfile`/`pyloudnorm` 미설치 시 폴백), 위 설치를 권장합니다. `requirements-optional.txt`는 기본 설치에는 필요 없는 선택 패키지 목록이며 2단으로 나뉩니다 — (1) 실제 코드에 연결된 provider(`librosa`: BPM 추정 우선순위 1순위, `basic-pitch`: 악보 채보 우선순위 1순위, 둘 다 미설치 시 내장 폴백으로 자동 대체)와 (2) 아직 코드 연결이 없는 향후 후보(`music21`/`demucs`/`pedalboard`). 자세한 내용은 `ARCHITECTURE.md`의 "Actual Stack"과 "Librosa BPM Provider" 참고.

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

브라우저에서 `http://127.0.0.1:8765`를 열고 WAV/FLAC/MP3 파일을 업로드한 뒤 mode를 선택하면 같은 화면에서 한국어 분석 리포트를 볼 수 있습니다. "분석하기" 클릭 시 페이지 이동 없이 `fetch()`로 비동기 요청을 보내며, 분석 중에는 "분석 중..." 진행 표시가 나오고 완료되면 결과 영역만 갱신됩니다(선택했던 파일은 그대로 유지). 화면에는 JSON 링크만 표시하고, `outputs/web/<request-id>/` 아래에는 Markdown, Korean Markdown, JSON 리포트가 함께 생성됩니다.

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
| 2026-07-10 | 웹 UI에서 "분석하기" 클릭 후 분석이 끝나면 방금 고른 파일 선택이 초기화되는 문제 발견 — 원인: `<form method="post" action="/analyze">`가 매번 브라우저 전체 페이지를 새로 그리는 방식이라 `<input type="file">`이 항상 빈 상태로 재생성됨. `/analyze` 응답을 전체 페이지 대신 결과 조각(fragment)만 반환하도록 바꾸고, 클라이언트는 `fetch()` 기반 비동기 제출 + "분석 중..." 진행 표시로 전환(페이지 이동 없음) | PASS: 20/20 유지, curl로 `/analyze` 응답이 조각만 반환함을 확인, Playwright 실브라우저 테스트로 분석 완료 후에도 파일 선택(`sample_test.wav`)과 URL이 그대로 유지됨을 확인 |
| 2026-07-12 | 웹 UI에 MusicXML 악보를 브라우저에서 바로 렌더링하는 기능 추가(OpenSheetMusicDisplay 로컬 vendoring, "악보 MusicXML" 클릭 시에만 렌더링). 실브라우저 테스트에서 9마디가 한 줄에 겹쳐 보이는 문제 발견 — 원인: OSMD가 `EngravingRules.RenderXMeasuresPerLineAkaSystem` 미설정 시 전체 마디를 한 시스템에 욱여넣음. 설정 한 줄로 해결, 콘솔 에러 0건 확인. 이어서 실제 마스터링 완료곡 38개로 악보 자체가 빈약하다는 지적 재검증 — `AudioAnalyzer`의 구간 수가 곡 길이 무관하게 `total_sections = 8` 고정이던 것을 발견(38곡 전부 정확히 9마디, 5곡은 8구간 전부 "High energy" 동일 레이블). 곡 길이 비례(`TARGET_SECTION_SECONDS = 15`, 4~24 구간 클램프)로 변경 | PASS: 26/26(mutation test 2건 포함), 38곡 재분석 결과 마디 수 11~15로 곡 길이에 비례, 동일 레이블(변별력 0) 곡 5→2로 감소, `VERIFICATION.md` release_90s.mp3 기대 점수 77→72(재측정값)로 갱신 |
| 2026-07-12 | BPM 추정을 spectral-flux 온셋 기반으로 재작성(이전: coarse 그리드 락킹), 이어서 optional `librosa.beat.beat_track` provider를 최우선으로 추가. 별도로 `ScoreTranscriber`(`app/notation/transcription.py`) 신설 — optional `basic-pitch` 노트 이벤트 → 내장 numpy/soundfile 오토코릴레이션 멜로디 가이드 → 구간 에너지 차트 순 폴백. 웹 업로드에 확장자 화이트리스트 + 파일 시그니처 검증 + 용량 제한(`app/web/security.py`) 및 `/healthz`, 보안 응답 헤더 추가. 커밋 전 재검증 과정에서 이전 세션이 `ARCHITECTURE.md`에 적어 둔 "38곡 배치 고유 BPM 12→37개 증가"라는 수치가 실제 재실행 결과(15/38, 에러 0)와 불일치함을 발견해 문서를 실측값으로 정정 | PASS: 32/32(신규 6개 포함, `librosa`/보안/채보 커버), 38곡 실측 재검증(에러 0, 고유 BPM 15/38, 신뢰도 0.83-0.90), 실제 마스터링곡 1곡 CLI 전체 리포트(md/ko.md/json/musicxml) 생성 확인, `basic-pitch` 미설치 상태에서 heuristic 멜로디 가이드로 정상 폴백 확인 |
| 2026-07-12 | 결과 화면의 `JSON`/`악보 MusicXML` 링크 동작 불일치 지적 — JSON은 클릭 시 같은 탭이 그대로 이동(분석 결과 화면을 잃음), 악보 MusicXML은 같은 페이지 안에서 아래로 펼쳐짐. 두 링크 모두 새 탭(`target="_blank" rel="noopener"`)으로 통일 — 악보는 인라인 토글 대신 별도 `/score?src=` 페이지(`render_score_page`)에서 렌더링하도록 변경, `src` 파라미터는 기존 `/reports/` 경로 검증 로직을 `parse_report_path`로 공유 추출해 12자리 hex id + 허용된 파일명(`analysis_lead_sheet.musicxml`)만 통과하도록 검증 | PASS: 33/33(구식 인라인 토글 테스트 3개 교체, 신규 4개 추가), Playwright 실브라우저 검증 — 업로드 후 두 링크 모두 새 탭으로 열리고 원래 결과 화면 유지, 악보 탭에서 실제 SVG 표기 렌더링 + 콘솔 에러 0건, `/score?src=/etc/passwd` 직접 요청 시 404 확인 |

## Commercial Design Notes

The current Web MVP is local-first and should not be treated as production infrastructure. Commercial readiness documents are now organized under `docs/commercial/`:

- `docs/commercial/COMMERCIAL_READINESS.md`
- `docs/commercial/PRODUCTION_ARCHITECTURE.md`
- `docs/commercial/WEB_SECURITY.md`
- `docs/commercial/DATA_RETENTION.md`
- `docs/commercial/COPYRIGHT_POLICY.md`

Commercial launch is currently HOLD until production upload security, data retention, account/billing, copyright policy, and background job architecture are implemented.

## Score Generation Direction

Score generation is planned as a separate feature under `docs/features/score_generation.md`. The first feasible version should be a basic MusicXML lead sheet/session chart based on estimated BPM, key, duration, and section energy. Full automatic transcription requires later pitch/onset/chord analysis and must be labeled with confidence and limitations.
