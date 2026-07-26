# CareerDiff — Folder Structure

레포 최상위 4개 폴더(`app/`, `docs/`, `jobkorea-ai/`, `ai-prompts/`)가 각각 무엇이고 왜
필요한지 정리한 문서다. 각 폴더는 성격이 다르므로 섞지 않는다 — 무엇을 확인하려는지에 따라 아래
표에서 폴더를 먼저 찾는다.

| 폴더 | 한 줄 요약 | app/ 실행에 필수인가 |
| --- | --- | --- |
| `app/` | 실제 제품(Next.js) | ✅ 이것 자체가 제품 |
| `docs/` | 설계·기획 문서 | 코드는 아니지만 구현 기준의 출처 |
| `jobkorea-ai/` | 잡코리아 공개 채용정보 수집·분류 FastAPI 서브프로젝트 | ❌ `app/`과 독립, 포트폴리오용 서브프로젝트 |
| `ai-prompts/` | 분석 프롬프트 설계 + 무료 웹 검증 자료 | 코드는 아니지만 `OpenAiAnalysisProvider`의 원본 |

## `app/` — 제품 코드

Next.js(App Router) + TypeScript로 만든 실제 CareerDiff 웹앱. `SPEC.md`에 정의된 채용공고-이력서
비교 기능을 구현한다.

- 핵심: `src/core/`(분석 오케스트레이터, 스키마, mock/LLM 프로바이더), `src/features/`(입력·대시보드
  UI), `src/app/`(라우트 + `/api/analyze`), `e2e/`(Playwright).
- **필요성**: 이 프로젝트의 존재 이유 자체. 삭제하면 제품이 없다. `npm run typecheck`/`lint`/`test`
  (26/26)/`build`/`test:e2e`(4/4) 전부 통과 상태로 실제로 동작함을 확인함(2026-07-15).

## `docs/` — 설계 문서

루트의 `SPEC.md`/`ARCHITECTURE.md`/`VERIFICATION.md`가 1차 진입점이고, `docs/`는 그 하위 상세
문서를 기능별·주제별로 나눠 담는다.

| 하위 폴더 | 내용 |
| --- | --- |
| `docs/features/` | 기능 10개 각각의 목적·규칙·UI 계약·테스트 체크 |
| `docs/design/` | 데이터 모델, 모듈 경계, UI 설계, 프로덕션 아키텍처, RAG/데이터 전략, 보안 위협 모델, 접근성 |
| `docs/integration/` | 분석 흐름, API 계약 |
| `docs/library-decisions/` | 라이브러리 선택 기준·전체 스택 결정·기능별 매핑(`features/*.md`) |
| `docs/operations/` | 운영 런북 |
| `docs/INDEX.md`, `docs/DOCUMENTATION_AUDIT.md` | 문서 전체 지도, 문서 완성도 감사 |

**필요성**: 장식용 문서가 아니라 실제로 구현/리뷰 기준으로 계속 참조됨 — 예를 들어
`docs/features/08-mini-project-recommendations.md`의 "정확히 3개" 규칙 위반을 코드(mock 결과)와
앱 스키마 테스트에서 실제로 잡아낸 이력이 있음. 필요함, 유지.

## `jobkorea-ai/` — 잡코리아 채용정보 수집·분류 (별도 서브프로젝트)

`app/`과 완전히 분리된 포트폴리오용 서브프로젝트. 잡코리아의 **공개** 채용목록(`/recruit/joblist`)과
공개 공고 상세(`/Recruit/GI_Read`)만 대상으로 저빈도 수집 후 관심 키워드로 선별·분류해 FastAPI로
제공한다. 로그인·CAPTCHA·접근 제한 우회는 하지 않는다. 기존 `pipeline/`(합성 데이터 기반 Airflow
학습용 파이프라인, 실제 크롤링 영구 HOLD)을 대체하기로 결정(2026-07-24) — 실제 공개 페이지 크롤링으로
전환하는 의도적 선택이며, 실 운영 전 잡코리아 이용약관·robots.txt를 직접 재확인해야 한다.

- 코드: `app/`(FastAPI), `scripts/`(collect_jobs, build_trend_report), `tests/`.
- 문서: `jobkorea-ai/README.md`(설치·실행·API·수집 원칙).
- **필요성**: `app/`(Next.js 제품) 동작에는 불필요(독립 실행). 사용자가 명시적으로 요청한 별도 학습/
  포트폴리오 산출물이라 존재 이유가 다르다. `app/`과 섞이지 않도록 의도적으로 최상위에 분리해 둠 —
  `app/`에 합치지 않는다.

## `ai-prompts/` — 프롬프트 설계 + 무료 검증 자료

**설계/추적 문서**와 **웹 Projects에 그대로 붙여넣을 내용**을 폴더로 분리했다(이번에 재정리).

```
ai-prompts/
  README.md                        - 분석기 프롬프트가 지켜야 할 규칙(설계 원칙)
  검증현황.md                     - 유료 API/실데이터를 쓰는 모든 AI 기능의 검증 상태 레지스트리
  claude-projects-test/
    지침.md                        - Project Instructions에 붙여넣는 지침 (명령형)
    메모리.md                      - 계정 단위 Memory에 붙여넣는 상세/압축 문구 2종
    사용법.md                      - Project 생성부터 3세트 검증까지 실행 절차
    MANUAL_ANALYSIS_PROMPT.md      - 코드(buildAnalysisPrompt.ts)와 동일한, 복붙용 프롬프트+스키마
    MANUAL_TEST_SESSION.md         - 8세트 실행지 + 체크리스트 (AI_EVALUATION_PLAN.md 10유형 중 8개)
    WEB_PROJECT_USAGE.md           - Claude/ChatGPT 플랫폼별 설정 차이 + 상세 검증 절차
```

- **필요성**: `app/src/core/llm/buildAnalysisPrompt.ts`가 소스이고, `MANUAL_ANALYSIS_PROMPT.md`는
  그 복붙판이다. 유료 `OPENAI_API_KEY` 없이 Claude.ai/ChatGPT 웹 구독만으로 같은 프롬프트+스키마의
  결과 품질을 사람이 먼저 확인하기 위해 존재한다(비용 게이트). 필드 단위로 코드와 대조해 일치함을
  확인함(2026-07-15).
- 이전에는 `prompts/PROJECT_TEST_INSTRUCTIONS.md` + 최상위 `web-project/` 폴더가 별도로 존재해 스키마가
  둘로 갈라졌었다(오래된 스키마가 `retrievalContext`/`metadata`/`id` 필드 없이 방치됨) — 삭제하고 이
  단일 트랙으로 통합함.

## 필요성 검증 결과 (2026-07-15)

현재 폴더의 실사용 근거를 확인했다. 불필요하다고 판단해 제거한 것:

- `prompts/PROJECT_TEST_INSTRUCTIONS.md`, 최상위 `web-project/`(구 버전) — 어디서도 링크되지 않는
  고아 문서였고 스키마가 낡아 있었음. 삭제 완료, `prompts/web-project/`로 단일화.

남은 4개 폴더 중 앱 실행에 직접 필요한 것은 `app/`뿐이고, 나머지 3개(`docs/`, `jobkorea-ai/`,
`ai-prompts/`)는 "설계 근거·검증 절차·별도 포트폴리오 산출물"로서
각각 독립적인 존재 이유가 있어 유지한다.
