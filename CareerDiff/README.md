# CareerDiff

채용공고와 후보자 이력서/커리어/프로젝트 증거를 비교하는 개발자 대상 Job Fit Analyzer.

## 정의

- **목적**: 나는 이직 준비 중에 CareerDiff로 채용공고와 내 이력서/프로젝트를 비교해서 부족한 역량, 이력서 수정안, 보완 프로젝트를 얻는다.
- **입력**: 채용공고 텍스트, 이력서/커리어/프로젝트 설명 (붙여넣기)
- **출력**: 적합도 점수, 강한/약한/누락 매칭, 이력서 재작성 제안, 역량 우선순위, 소규모 보완 프로젝트 3개, 7일 준비 플랜
- **상태**: 문서 설계 완료, 앱 스캐폴딩 진행 중 — 진행률 게이트 40%→60% 사이 (`VERIFICATION.md`). `app/`에 Next.js/TypeScript/Tailwind 프로젝트, `DATA_MODEL.md`/`API_CONTRACT.md` 기반 공유 타입, mock `CareerDiffAnalysisResult`, 테스트 4개까지 구축됨. 실제 화면·오케스트레이터·LLM 연동은 아직 없음.
- **의의**: 본인 이직 준비용이자 포트폴리오 — LLM/RAG, 문서 파싱, 스킬 추출, 스코어링/랭킹, 프롬프트 설계, 프라이버시 인지 제품 설계, 대시보드 UI를 보여줌

## 스택

`app/`에 확정·설치됨: Next.js(App Router) + TypeScript + Tailwind CSS, 검증용 Zod, 테스트용 Vitest + Testing Library + Playwright(`docs/library-decisions/TECH_STACK_DECISIONS.md` 기준). mock-first 분석기(LLM 연동 전 목업 데이터로 UI 먼저 구축), 로컬 우선/무보관 데이터 정책(MVP) 원칙 유지.

```powershell
cd app
npm install
npm run dev        # http://localhost:3000
npm run typecheck
npm run test
npm run build
npm run lint
```

## 문서 지도

전체 문서는 `docs/INDEX.md` 참고. 핵심만 요약:

| 문서 | 용도 |
|---|---|
| `SPEC.md` | 제품 범위, 대상 사용자, 보안/프라이버시 경계, 완료 기준 |
| `ARCHITECTURE.md` | 초기 기술 아키텍처, 분석 파이프라인, HOLD 조건 |
| `VERIFICATION.md` | 진행률 게이트, 검증 루프, 문서/기능/프라이버시 체크 |
| `docs/features/` | 기능 10개 각각의 목적·규칙·UI 계약·테스트 체크 |
| `docs/design/` | 데이터 모델, 모듈 경계, UI 설계, 프로덕션 아키텍처, RAG/데이터 전략, 보안 위협 모델, 접근성 계획 |
| `docs/integration/` | 분석 흐름, 프롬프트/서비스 분리, API 계약, 런타임 진화 |
| `docs/library-decisions/` | 라이브러리 선택 기준, 전체 스택 결정, 기능별 매핑 |
| `docs/operations/` | 운영 런북 |
| `docs/DOCUMENTATION_AUDIT.md` | 문서 완성도 감사 — 구현 착수 가능 여부 게이트 |

## 유지보수 원칙

- 기능별 로직을 분리하고 `AnalysisOrchestrator`가 feature service를 조율한다.
- 모듈 간에는 비정형 텍스트 대신 `docs/design/DATA_MODEL.md`의 공유 데이터 계약으로 전달한다.
- UI 컴포넌트는 표시 전용이며 분석 로직을 갖지 않는다.
- 상태를 갖거나 교체 가능하거나 독립 테스트가 필요한 로직만 class/service 경계를 쓴다. 그 외 단순 포맷팅/검증/UI 헬퍼는 순수 함수로 둔다.

## 다음 작업

1. ~~MVP 구현 스택 확정 (Next.js + TypeScript + mock-first 분석기)~~ — 완료.
2. ~~`app/` 실제 구조 스캐폴딩~~ — 완료 (`create-next-app`, App Router + `src/` + Tailwind).
3. ~~`DATA_MODEL.md` 기반 공유 TypeScript 타입 생성~~ — 완료 (`app/src/core/types/`, `API_CONTRACT.md`의 요청/응답 타입 포함).
4. ~~Mock `CareerDiffAnalysisResult`로 LLM 연동 전에 UI부터 구축~~ — mock 데이터·검증 테스트까지 완료 (`app/src/core/mocks/`). UI는 아직.
5. 첫 사용 가능한 화면 구축: 채용공고 입력, 후보자 정보 입력, 분석 버튼, 프라이버시 안내.
6. Mock 데이터 기반 대시보드 구축(점수/요건/매칭/이력서 제안/보완 프로젝트/면접 준비).
7. `AnalysisOrchestrator`와 서비스 클래스 스켈레톤 추가.
8. 입력 검증, mock 결과 렌더링, 프라이버시 경계에 대한 테스트 추가(Playwright E2E 포함 — 브라우저 바이너리는 아직 미설치, `npx playwright install` 필요).
9. Mock UI와 데이터 계약이 안정된 뒤에만 LLM provider 연동.
