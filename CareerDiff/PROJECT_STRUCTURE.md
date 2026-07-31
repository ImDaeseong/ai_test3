# CareerDiff — Folder Structure

레포 최상위 3개 폴더(`app/`, `docs/`, `ai-prompts/`)가 각각 무엇이고 왜
필요한지 정리한 문서다. 각 폴더는 성격이 다르므로 섞지 않는다 — 무엇을 확인하려는지에 따라 아래
표에서 폴더를 먼저 찾는다. (자동 크롤러 서브프로젝트였던 `jobkorea-ai/`는 2026-08-01 법적 리스크
판단으로 제거됨 — 아래 "채용정보 수집" 절 참고.)

| 폴더 | 한 줄 요약 | app/ 실행에 필수인가 |
| --- | --- | --- |
| `app/` | 실제 제품(Next.js) | ✅ 이것 자체가 제품 |
| `docs/` | 설계·기획 문서 | 코드는 아니지만 구현 기준의 출처 |
| `ai-prompts/` | 분석 프롬프트 설계 원칙 + 채용정보 수동 수집 절차 | 코드는 아니지만 `OpenAiAnalysisProvider`의 원본 |

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
| `docs/design/` | 데이터 모델, 모듈 경계, UI 설계, 보안 위협 모델, 접근성 |
| `docs/integration/` | 분석 흐름, API 계약 |
| `docs/library-decisions/` | 라이브러리 선택 기준·전체 스택 결정·기능별 매핑(`FEATURE_LIBRARY_MATRIX.md` 표 하나로 통합, 2026-08-01) |
| `docs/operations/` | 운영 런북 |
| `docs/INDEX.md` | 문서 전체 지도 |

**필요성**: 장식용 문서가 아니라 실제로 구현/리뷰 기준으로 계속 참조됨 — 예를 들어
`docs/features/08-mini-project-recommendations.md`의 "정확히 3개" 규칙 위반을 코드(mock 결과)와
앱 스키마 테스트에서 실제로 잡아낸 이력이 있음. 필요함, 유지.

## 채용정보 수집 — `jobkorea-ai/` 제거(2026-08-01)와 수동 대체

`jobkorea-ai/`(잡코리아 공개 페이지를 코드로 자동 수집하던 FastAPI 서브프로젝트)는 사용자가 자동
크롤링 자체를 법적 리스크로 판단해 완전히 제거했다(코드·테스트·문서·DB 전부 삭제, `git rm`으로
이력엔 남아 있음 — `../../VERIFICATION.md` 게이트 로그 참고). 이전에는 `pipeline/`(합성 데이터
학습용, 2026-07-24 `jobkorea-ai/`로 대체)이 있었고, 이번엔 자동 수집 자체를 접었다 — 다음
자동화 재도입은 공식 API가 확보된 뒤에만, 사람이 명시적으로 요청할 때만 진행한다.

대체 수단은 `ai-prompts/job-collection-manual/`이다: 사람이 채용 사이트에서 직접 읽은 공고 1건을
Claude/ChatGPT 웹 Project에 붙여넣어 구조화된 JSON으로 받는다(자동화 없음, 스크립트 없음). 아래
`ai-prompts/` 절 참고.

## `ai-prompts/` — 프롬프트 설계 원칙 + 채용정보 수동 수집

**설계/추적 문서**와 **웹 Projects에 그대로 붙여넣을 내용**을 폴더로 분리했다(이번에 재정리).

```
ai-prompts/
  README.md                        - 분석기 프롬프트가 지켜야 할 규칙(설계 원칙)
  검증현황.md                     - 유료 API/실데이터를 쓰는 모든 AI 기능의 검증 상태 레지스트리
  job-collection-manual/
    README.md                      - 이 트랙이 왜 존재하는지(jobkorea-ai 대체) + 절대 원칙
    지침.md                        - Project Instructions (JobCollect Project용, CareerDiff와 별개)
    메모리.md                      - 계정 단위 Memory 문구
    사용법.md                      - Project 생성부터 공고 1건 수집까지 절차
    COLLECT_PROMPT.md              - 복붙용 프롬프트 + 채용정보 구조화 스키마
    COLLECT_LOG.md                 - 수집 메타데이터 로그(공고 본문 제외, git 추적)
    collected-jobs/                 - 구조화된 결과 JSON 누적 폴더(git 미추적)
```

- **채용공고-이력서 적합도 분석(fitScore 등) 검증은 2026-08-01부터 로컬에서 진행한다.** 이전에는
  이 폴더에 `claude-projects-test/`(Claude/ChatGPT 웹 Project에 붙여넣는 프롬프트+스키마+8세트
  실행지+실데이터 누적 트랙)가 있었으나, 사용자가 웹 Project 경로가 더 이상 필요 없다고 판단해
  전체 삭제했다 — "수집, 비교 데이터를 로컬에서 비교한다"는 방향으로 전환. 로컬 검증의 구체 방법은
  아직 이 저장소 문서에 정의돼 있지 않다(사용자가 직접 진행 예정). 이력은
  `docs/library-decisions/TECH_STACK_DECISIONS.md`의 "2026-07-13 decision"(왜 웹 Project 방식을
  택했는지)과 "2026-08-01 update"(왜 폐기했는지), `VERIFICATION.md`의 같은 날짜 게이트 로그 참고.
- **2026-08-01 추가**: `jobkorea-ai/` 자동 크롤러 제거에 맞춰 `job-collection-manual/`을 신설 —
  채용정보 자체를 모으는 역할(별도 `JobCollect` Project)이다. 위에서 제거한 분석 검증 트랙과는
  전혀 다른 목적이라 애초에 분리해 뒀던 덕에, 분석 트랙 삭제가 이 폴더에는 영향을 주지 않았다.

## 필요성 검증 결과 (2026-07-15)

현재 폴더의 실사용 근거를 확인했다. 불필요하다고 판단해 제거한 것:

- `prompts/PROJECT_TEST_INSTRUCTIONS.md`, 최상위 `web-project/`(구 버전) — 어디서도 링크되지 않는
  고아 문서였고 스키마가 낡아 있었음. 삭제 완료, `prompts/web-project/`로 단일화.

남은 3개 폴더 중 앱 실행에 직접 필요한 것은 `app/`뿐이고, 나머지 2개(`docs/`, `ai-prompts/`)는
"설계 근거·검증 절차·채용정보 수동 수집 절차"로서 각각 독립적인 존재 이유가 있어 유지한다.
