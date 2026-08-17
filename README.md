# ai_test3

개인 프로젝트 작업공간입니다. `music_insight_studio`는 2026-07-17에 `ai_test2/`로 이동했습니다(진행할 작업이 많이 남은 `CareerDiff`에 집중하기 위해). 지금은 `CareerDiff` 하나만 유지합니다.

## Projects

### `CareerDiff/`

Job Fit Analyzer입니다. 채용공고와 이력서/커리어/프로젝트 이력을 입력하면 채용 요건을 추출하고 후보자 증거와 매칭해 적합도 점수, 이력서 수정 제안, 소규모 보완 프로젝트 추천, 면접 준비 플랜을 생성합니다.

- **상태**: Mock 기반 UI/흐름 완성(단위·컴포넌트·E2E 테스트 전량 통과), LLM 실분석은 검증 진행 중. API 실호출은 로컬 검증이 끝난 뒤 사람이 수동으로만 요청.
- **스택**: Next.js(App Router) + TypeScript + Tailwind CSS + Zod, Vitest/Testing Library + Playwright.
- **채용정보 수집**: 자동 크롤링은 법적 리스크로 제거됨 — 당분간 사람이 직접 붙여넣어 수동 누적, 공식 API 경로가 생기면 자동화 재검토.
- **시작점**: [`CareerDiff/docs/README.md`](CareerDiff/docs/README.md)(문서 지도) → 검증 명령·게이트는 [`VERIFICATION.md`](CareerDiff/docs/VERIFICATION.md)(정확한 테스트 개수는 `npm run typecheck && npm test`로 직접 확인).

## 새 프로젝트 추가 시

`CareerDiff/docs/`(PRODUCT/ARCHITECTURE/VERIFICATION 3파일 + 문서 지도) 구조를 그대로 따른다: 한 문장 사용 사례 → 제품 범위 → 기술/모듈 경계 → 검증 명령과 HOLD 조건. 유료 API·실데이터를 다루는 기능은 무료·저비용 경로(mock/로컬)로 먼저 검증한 기록 없이는 유료 경로로 전환하지 않는다.
