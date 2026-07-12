# CareerDiff

채용공고와 후보자 이력서/커리어/프로젝트 증거를 비교하는 개발자 대상 Job Fit Analyzer.

## 정의

- **목적**: 나는 이직 준비 중에 CareerDiff로 채용공고와 내 이력서/프로젝트를 비교해서 부족한 역량, 이력서 수정안, 보완 프로젝트를 얻는다.
- **입력**: 채용공고 텍스트, 이력서/커리어/프로젝트 설명 (붙여넣기)
- **출력**: 적합도 점수, 강한/약한/누락 매칭, 이력서 재작성 제안, 역량 우선순위, 소규모 보완 프로젝트 3개, 7일 준비 플랜
- **상태**: Mock 기반 MVP 완성 + LLM 연동 배관 완료 — 진행률 게이트 80% (`VERIFICATION.md`). 채용공고/이력서 입력 → 분석하기 → 대시보드(점수/요건/매칭/이력서 제안/보완 프로젝트 3개/면접 준비) 전체 흐름이 실제로 동작(단위 테스트 22개 + Playwright E2E 4개 전부 통과). 결과 내용은 한글. `OPENAI_API_KEY`가 없으면(기본 상태) `AnalysisOrchestrator`가 mock을 반환하고, 키가 설정되면 OpenAI Responses API로 실제 분석을 시도 — 이 저장소에는 실제 키가 없어 후자는 아직 실제 호출로 검증되지 않음(`.env.example` 참고).
- **의의**: 본인 이직 준비용이자 포트폴리오 — LLM/RAG, 문서 파싱, 스킬 추출, 스코어링/랭킹, 프롬프트 설계, 프라이버시 인지 제품 설계, 대시보드 UI를 보여줌

## 스택

`app/`에 확정·설치됨: Next.js(App Router) + TypeScript + Tailwind CSS, 검증용 Zod, 테스트용 Vitest + Testing Library + Playwright(`docs/library-decisions/TECH_STACK_DECISIONS.md` 기준). mock-first 분석기(LLM 연동 전 목업 데이터로 UI 먼저 구축), 로컬 우선/무보관 데이터 정책(MVP) 원칙 유지.

```powershell
cd app
npm install
npm run dev        # http://localhost:3000 — mock 결과만 (기본, 키 불필요)
npm run typecheck
npm run test        # 단위/컴포넌트 테스트 (Vitest)
npm run build
npm run lint
npm run test:e2e    # Playwright E2E — 프로덕션 빌드 기준으로 실행됨(아래 참고)
```

실제 LLM 분석을 켜려면 `.env.example`을 `.env.local`로 복사하고 `OPENAI_API_KEY`를 채운다. 비워두면(기본 상태) mock 결과로 동작한다.

**알려진 이슈**: 이 개발 환경에서 Next.js 16.2.10 Turbopack `next dev` 서버가 Playwright Chromium과 조합될 때 하이드레이션이 되지 않는 현상을 확인했다(입력 이벤트는 DOM에 반영되지만 React가 전혀 리렌더링하지 않음 — `npm run dev`로 직접 브라우저에서 수동 조작할 때는 재현되지 않았다). 그래서 `playwright.config.ts`의 E2E `webServer`는 `next dev` 대신 `npm run build && npm run start`로 프로덕션 서버를 띄우도록 설정했다.

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
4. ~~Mock `CareerDiffAnalysisResult`로 LLM 연동 전에 UI부터 구축~~ — 완료 (`app/src/core/mocks/`).
5. ~~첫 사용 가능한 화면 구축~~ — 완료 (`app/src/app/page.tsx`: 채용공고 입력, 후보자 정보 입력, 분석 버튼, 프라이버시 안내).
6. ~~Mock 데이터 기반 대시보드 구축~~ — 완료 (`app/src/features/analysis-dashboard/`: 점수/요건/매칭/이력서 제안/보완 프로젝트 3개/면접 준비 6개 패널).
7. ~~`AnalysisOrchestrator`와 API 라우트 추가~~ — 완료 (`app/src/core/analysis/AnalysisOrchestrator.ts`, `app/src/app/api/analyze/route.ts`). 아직 mock만 반환하며, 요청 검증은 Zod(`app/src/core/schemas/analyzeRequest.ts`).
8. ~~테스트 확충~~ — 완료. 단위/컴포넌트 테스트 22개(오케스트레이터의 provider 분기 로직 포함, 가짜 provider로 검증해 실제 API 호출 없음) + Playwright E2E 4개(`app/e2e/analyzer.spec.ts`, 입력 검증·전체 분석 흐름·보완 프로젝트 정확히 3개·API 400 응답 확인). `requirement-extraction`/`evidence-extraction`/`evidence-matching`/`fit-scoring`/`resume-suggestions`/`mini-projects`/`interview-prep` 서비스 폴더(`docs/design/MODULE_BOUNDARIES.md`)는 실제 로직이 생기기 전까지 계속 비워둠.
9. ~~LLM provider 연동~~ — 배관 완료, 실호출 미검증. `app/src/core/llm/OpenAiAnalysisProvider.ts`가 OpenAI Responses API + Structured Outputs(`docs/library-decisions/TECH_STACK_DECISIONS.md`)로 구현되어 있고, `AnalysisOrchestrator`가 `OPENAI_API_KEY` 유무로 mock/실분석을 분기한다. API 키 입력란은 `.env.example`에 빈 값으로만 존재하며 이 저장소 어디에도 실제 키는 없다. 실제 키로 한 번도 호출해 본 적이 없으므로, structured output 스키마가 OpenAI strict 모드 제약(모든 필드 required 취급 등)을 완전히 만족하는지는 실제 계정으로 검증 필요(`OpenAiAnalysisProvider.ts` 코드 주석 참고).
