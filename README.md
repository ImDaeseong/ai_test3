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

- `C:\Users\cs930\Desktop\ai_test\Analysis_music`: Flask 리포트 생성, Suno 프롬프트 파서, 기본 오디오 분석
- `C:\Users\cs930\Desktop\ai_test\mp3_daw`: BPM/Key/LUFS/주파수 분석, 파형 피크, 마스터링, stem 분리 엔진

## Non-Goals for MVP

- 저작권 침해 목적의 특정 가수 복제 생성
- 외부 음원 플랫폼 자동 업로드
- 유료 스트리밍 성과 보장
- 완전한 음악학적 채보 또는 전문 마스터링 대체

## Project Status

1차 CLI MVP가 구현되어 검증되었습니다. 현재 CLI는 `analysis_report.md`, `analysis_report.ko.md`, `analysis_report.json`을 생성합니다. 로컬 Web MVP도 같은 `AnalysisService`를 호출해 업로드 파일을 분석하고 같은 화면에 한국어 리포트를 표시합니다.

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


