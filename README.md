# ai_test3

개인 프로젝트 작업공간입니다. 각 하위 폴더는 독립적인 프로젝트로, 각자 목적·문서·(있는 경우) 코드를 갖고 있으며 서로 의존성이나 런타임을 공유하지 않습니다.

## Projects

### `music_insight_studio/`

로컬 우선 음악 분석 도구입니다. MP3/WAV/FLAC 파일을 업로드하면 BPM/Key/LUFS/주파수 밸런스 분석과 규칙 기반 믹싱/마스터링/AI 자연스러움/시장성 평가를 결합해 한국어 리포트와 MusicXML 세션 차트를 생성합니다.

- 상태: **구현·검증 완료** — CLI MVP와 로컬 Web MVP 모두 동작, 단위 테스트 33개 통과.
- 스택: Python, stdlib `http.server`(Flask/FastAPI 미사용), 선택적 `numpy`/`soundfile`/`pyloudnorm`(DSP), 선택적 `librosa`/`basic-pitch`(정확도 업그레이드 provider, 내장 폴백 있음).
- 이 프로젝트가 보여주는 것: 코드 작성 전에 문서(SPEC/ARCHITECTURE/ACCEPTANCE_CRITERIA/SECURITY_BOUNDARY/HOLD_CONDITIONS)부터 정의하는 개발 방식, mutation test까지 포함한 실제 검증 루프, 합성 fixture뿐 아니라 실제 마스터링 완료곡으로 버그를 찾고 고친 이력 — 라운드별 근거는 `music_insight_studio/VERIFICATION.md`의 Verification Log 참고.
- 시작점: `music_insight_studio/README.md`, 전체 문서 지도는 `music_insight_studio/docs/INDEX.md`.

### `CareerDiff/`

Job Fit Analyzer입니다. 채용공고와 이력서/커리어/프로젝트 이력을 입력하면 채용 요건을 추출하고 후보자 증거와 매칭해 적합도 점수, 이력서 수정 제안, 소규모 보완 프로젝트 추천, 면접 준비 플랜을 생성합니다.

- 상태: **문서 설계 완료, 앱 스캐폴딩 진행 중** — `app/`에 Next.js/TypeScript/Tailwind 프로젝트, `DATA_MODEL.md` 기반 공유 타입, mock `CareerDiffAnalysisResult`, 테스트 4개까지 구축(`CareerDiff/VERIFICATION.md` 기준 진행률 게이트 40%→60% 사이). 실제 화면·오케스트레이터·LLM 연동은 아직 없음.
- 스택: Next.js(App Router) + TypeScript + Tailwind CSS, Zod, Vitest/Testing Library/Playwright. LLM/RAG 기반 분석, provider 연동 전 mock-first UI 원칙.
- 이 프로젝트가 보여주는 것: `music_insight_studio`보다 더 격식을 갖춘 문서 체계 — 기능별 문서(`docs/features/`), 전용 라이브러리 결정 체계(`docs/library-decisions/`), 모듈 경계 규칙(`docs/design/MODULE_BOUNDARIES.md`), 구현 시작 가능 여부를 판단하는 날짜별 문서 감사(`docs/DOCUMENTATION_AUDIT.md`).
- 시작점: `CareerDiff/README.md`, 전체 문서 지도는 `CareerDiff/docs/INDEX.md`.

## 공통 관례

`CareerDiff`가 아직 MVP 기능 구현 단계에 이르지 않았어도, 두 프로젝트는 같은 "문서 먼저, 코드는 그다음" 원칙을 따릅니다.

- 맨 앞에 한 문장짜리 사용 사례(one-sentence use case) 명시.
- 구현 전 `SPEC.md`/제품 범위 정의.
- `ARCHITECTURE.md`로 기술 방향과 모듈 경계 정의.
- `VERIFICATION.md`로 진행률 게이트와 (코드가 생기면) 구체적인 pass/fail 검증 명령 관리.
- 구현을 멈추고 사람 검토를 요구하는 명시적 HOLD 조건.

`music_insight_studio`는 여기에 더해, 코드가 실제로 존재할 때 이 원칙이 어떤 모습인지 보여줍니다 — 실제 테스트 개수, 실제 CLI/브라우저 검증 근거, 그리고 무엇이 왜 깨졌고 어떻게 고쳤는지를 기록한 Verification Log까지. 문서에 적혀 있던 이전 주장이 재검증에서 재현되지 않았을 때 그대로 두지 않고 바로잡은 라운드들도 포함됩니다.
