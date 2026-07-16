# ai_test3

개인 프로젝트 작업공간입니다. `music_insight_studio`는 2026-07-17에 `ai_test2/`로 이동했습니다(진행할 작업이 많이 남은 `CareerDiff`에 집중하기 위해). 지금은 `CareerDiff` 하나만 유지합니다.

## Projects

### `CareerDiff/`

Job Fit Analyzer입니다. 채용공고와 이력서/커리어/프로젝트 이력을 입력하면 채용 요건을 추출하고 후보자 증거와 매칭해 적합도 점수, 이력서 수정 제안, 소규모 보완 프로젝트 추천, 면접 준비 플랜을 생성합니다.

- 상태: **Mock 기반 UI/흐름 완성, LLM 실분석은 무료 검증 진행 중** — 진행률 게이트 85%(`CareerDiff/VERIFICATION.md`). 채용공고/이력서 입력 → 분석하기 → 대시보드(점수·요건·매칭·이력서 제안·보완 프로젝트 3개·면접 준비) 전체 흐름이 실제로 동작(단위 테스트 26개 + Playwright E2E 4개 전부 통과, 결과 내용 한글화 완료). `AnalysisOrchestrator`는 실제 분석 로직 없이 "키 없으면 고정 mock 반환, 키 있으면 LLM 호출"만 분기하므로, 유료 API 호출 전에 `CareerDiff/prompts/web-project/MANUAL_ANALYSIS_PROMPT.md`로 Claude/ChatGPT 웹에서 같은 프롬프트·스키마를 먼저 무료로 검증 중(비용 문제로 유료 API 연동은 이 검증이 안정화된 뒤로 미룸 — 근거: `CareerDiff/docs/library-decisions/TECH_STACK_DECISIONS.md`의 "2026-07-13 decision"). 3세트 실행지: `CareerDiff/prompts/web-project/MANUAL_TEST_SESSION.md`.
- 스택: Next.js(App Router) + TypeScript + Tailwind CSS, Zod(요청/응답 검증), Vitest/Testing Library(단위·컴포넌트 테스트)/Playwright(E2E). LLM/RAG 기반 분석, provider 연동 전 mock-first UI 원칙. 별도 서브프로젝트 `pipeline/`(Python/Airflow, `app/`과 무관한 독립 학습용 파이프라인).
- 이 프로젝트가 보여주는 것: 기능별 문서(`docs/features/`), 전용 라이브러리 결정 체계(`docs/library-decisions/`), 모듈 경계 규칙(`docs/design/MODULE_BOUNDARIES.md`), 구현 시작 가능 여부를 판단하는 날짜별 문서 감사(`docs/DOCUMENTATION_AUDIT.md`), 유료 API 비용을 최소화하기 위해 무료 경로로 먼저 검증하는 패턴(`prompts/PROMPT_VERIFICATION_REGISTRY.md`).
- 시작점: `CareerDiff/README.md`, 전체 문서 지도는 `CareerDiff/docs/INDEX.md`.

## 공통 관례

- 맨 앞에 한 문장짜리 사용 사례(one-sentence use case) 명시.
- 구현 전 `SPEC.md`/제품 범위 정의.
- `ARCHITECTURE.md`로 기술 방향과 모듈 경계 정의.
- `VERIFICATION.md`로 진행률 게이트와 (코드가 생기면) 구체적인 pass/fail 검증 명령 관리.
- 구현을 멈추고 사람 검토를 요구하는 명시적 HOLD 조건.
- 유료 API/실데이터를 다루는 기능은 무료·저비용 경로로 먼저 검증한 기록 없이는 유료 경로로 전환하지 않음(`CareerDiff/prompts/PROMPT_VERIFICATION_REGISTRY.md`).
