# Prompt / AI-Feature Verification Registry

이 문서는 CareerDiff(그리고 `pipeline/`) 안에서 **유료 API 비용이 들거나, 실데이터를 다루는 모든
AI 의존 기능**을 한곳에 모아, 각각이 "무료/로컬 검증을 통과했는지"를 추적하는 단일 레지스트리다.

## 핵심 원칙

> **유료 API 비용이 드는 기능이든, 실데이터를 다루는 기능이든, "완벽하게 검증"되기 전까지는
> 반드시 무료/저비용 경로(웹 UI 프로젝트, 로컬 mock, 소량 수동 실행)로 먼저 확인한다. 검증
> 통과 기록이 없으면 유료/실전 경로로 전환하지 않는다.**

예: 채용공고와 이력서를 비교하는 CareerDiff의 핵심 분석 기능은, OpenAI API를 직접 호출하지
않고도 이미 계정을 갖고 있는 ChatGPT/Claude 웹사이트의 "Projects" 기능에 같은 프롬프트+스키마를
등록해서 무료로 결과 품질을 확인할 수 있다(`web-project/MANUAL_ANALYSIS_PROMPT.md` +
`web-project/WEB_PROJECT_USAGE.md`). 이 방식으로 검증이 끝나기 전까지는 유료 `OPENAI_API_KEY` 경로를 켜지
않는다. 이 문서는 이 패턴을 CareerDiff 전체(앱 + 파이프라인)의 다른 모든 AI 기능에도 동일하게
적용하기 위한 목록이다.

## 게이트 종류

| 게이트 종류 | 의미 | 무엇을 막는가 |
| --- | --- | --- |
| 비용 게이트 (💰) | 실행할 때마다 유료 API 요금이 발생 | 검증 안 된 프롬프트로 돈을 쓰는 것 |
| 안전성 게이트 (🔒) | 무료 API/공개 데이터라도 실데이터·개인정보·ToS 리스크가 있음 | 검증 안 된 채로 실데이터가 자동화(스케줄)에 들어가는 것 |

## 레지스트리

| # | 기능 | 위치 | 트리거 | 게이트 종류 | 무료/로컬 검증 경로 | 현재 상태 | 유료/실전 전환 조건 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 채용공고-이력서 적합도 분석 (`/api/analyze`) | `app/src/core/llm/OpenAiAnalysisProvider.ts` | `OPENAI_API_KEY` 설정 시 | 💰 비용 | `prompts/web-project/MANUAL_ANALYSIS_PROMPT.md` + `prompts/web-project/WEB_PROJECT_USAGE.md` (Claude/ChatGPT Projects에서 무료 실행) | 프롬프트+스키마가 코드와 필드 단위로 일치함을 확인(2026-07-15). **다양한 입력 조합 반복 검증은 아직 미실시** | `WEB_PROJECT_USAGE.md` 체크리스트를 서로 다른 JD/이력서 조합 최소 3세트 이상 통과 → 그때 실키로 `OpenAiAnalysisProvider` 1회 실행해 같은 체크리스트로 재확인 |
| 2 | 청크 임베딩 생성 (`embed_chunks`) | `pipeline/tasks/embedding_provider.py` | `EMBEDDING_PROVIDER=openai` + `OPENAI_API_KEY` | 💰 비용 | 기본값(`local`)이 무비용 결정론적 fallback — 대화형 프롬프트가 아니라 별도 웹 UI 검증 경로는 해당 없음 | 로컬 fallback이 기본, 옵트인 경로는 아직 사용 안 함 | `app/`이 실제로 RAG를 채택하기 전까지는 전환 불필요(`docs/integration/RAG_EMBEDDING_PLAN.md`) |
| 3 | 채용공고 실데이터 수집 (`collect_job`) | `pipeline/tasks/work24_client.py` | `JOB_DATA_SOURCE=work24` + `WORK24_API_KEY` | 🔒 안전성 (API 자체는 무료지만 개인정보·필드매핑 미검증) | `docs/integration/PIPELINE_ROLLOUT_PLAN.md` Phase 4 (DAG 밖에서 수동 실행 → 사람이 원본 검토 → 체크리스트 통과) | 코드는 존재하나 실키로 검증한 적 없음(fail-closed 처리됨) | Phase 4 체크리스트 전부 통과 + `PIPELINE_ROLLOUT_PLAN.md` 승인 로그에 기록 |

## 새 AI 기능을 추가할 때

새로운 프롬프트/모델 호출/실데이터 API를 추가하면, 코드를 작성하기 *전에* 이 표에 행을 하나
추가한다 — 트리거, 게이트 종류, 무료 검증 경로, 전환 조건을 먼저 정의하고 나서 구현한다
(`AGENTS.md`의 "구현 전 목적·보안 경계·검증 기준·HOLD 조건을 먼저 정의" 원칙과 동일).

## 관련 문서

- `prompts/README.md` — 프롬프트 설계 원칙(무엇을 요구하는가), 이 문서는 "검증 상태"를 추적.
- `prompts/web-project/` — 항목 1의 실제 무료 검증 절차(웹 Projects에 그대로 붙여넣는 내용).
- `docs/integration/PIPELINE_ROLLOUT_PLAN.md` — 항목 3의 단계별 절차와 승인 로그.
- `docs/integration/AIRFLOW_PIPELINE_PLAN.md` — 파이프라인 전체의 보안 경계·HOLD 조건.
