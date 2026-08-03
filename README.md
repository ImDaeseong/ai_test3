# ai_test3

개인 프로젝트 작업공간입니다. `music_insight_studio`는 2026-07-17에 `ai_test2/`로 이동했습니다(진행할 작업이 많이 남은 `CareerDiff`에 집중하기 위해). 지금은 `CareerDiff` 하나만 유지합니다.

## Projects

### `CareerDiff/`

Job Fit Analyzer입니다. 채용공고와 이력서/커리어/프로젝트 이력을 입력하면 채용 요건을 추출하고 후보자 증거와 매칭해 적합도 점수, 이력서 수정 제안, 소규모 보완 프로젝트 추천, 면접 준비 플랜을 생성합니다.

- 상태: **Mock 기반 UI/흐름 완성, LLM 실분석은 검증 진행 중** — 진행 상태와 게이트는 `CareerDiff/docs/VERIFICATION.md` 참고(정확한 테스트 개수는 항상 최신이 아닐 수 있으니 `npm run typecheck && npm test`로 직접 확인). 채용공고/이력서 입력 → 분석하기 → 대시보드(점수·요건·매칭·이력서 제안·보완 프로젝트 3개·면접 준비) 전체 흐름이 실제로 동작(단위/컴포넌트 테스트 + Playwright E2E 통과, 결과 내용 한글화 완료). `AnalysisOrchestrator`는 실제 분석 로직 없이 "키 없으면 고정 mock 반환, 키 있으면 LLM 호출"만 분기하므로, 유료 API 호출 전 검증은 로컬에서 먼저 진행한다. API 실호출은 로컬 검증이 끝난 뒤 사람이 수동으로 요청할 때만 진행.
- 스택: Next.js(App Router) + TypeScript + Tailwind CSS, Zod(요청/응답 검증), Vitest/Testing Library(단위·컴포넌트 테스트)/Playwright(E2E). LLM/RAG 기반 분석, provider 연동 전 mock-first UI 원칙. 자동 채용정보 수집(잡코리아 공개 페이지 크롤링)은 법적 리스크 판단으로 완전 제거됨 — 채용정보는 당분간 사람이 직접 읽어 수동으로 누적하고, 나중에 공식 API가 있는 경로로만 자동 수집을 재도입한다.
- 문서 구조: 세부 기능별 문서·의사결정 로그·모듈 경계 문서는 현재 구현과 중복되어 제거하고, `CareerDiff/docs/`(README/PRODUCT/ARCHITECTURE/VERIFICATION 4개 파일)로 통합했다. 과거 이력은 Git 로그에서 확인한다.
- 시작점: `CareerDiff/docs/README.md`(문서 지도 겸 색인).

## 공통 관례

- 맨 앞에 한 문장짜리 사용 사례(one-sentence use case) 명시.
- 구현 전 `SPEC.md`/제품 범위 정의.
- `ARCHITECTURE.md`로 기술 방향과 모듈 경계 정의.
- `VERIFICATION.md`로 진행률 게이트와 (코드가 생기면) 구체적인 pass/fail 검증 명령 관리.
- 구현을 멈추고 사람 검토를 요구하는 명시적 HOLD 조건.
- 유료 API/실데이터를 다루는 기능은 무료·저비용 경로(mock/로컬)로 먼저 검증한 기록 없이는 유료 경로로 전환하지 않음(`CareerDiff/docs/VERIFICATION.md` 참고).
