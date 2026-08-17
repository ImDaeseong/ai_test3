# ai_test3

> 작성일: 2026-07-09 / 최종 수정: 2026-08-17
> 1개 프로젝트 수록. 상세 기능·검증 이력은 [`CareerDiff/docs/`](CareerDiff/docs/README.md)를 참조하세요.

## 저장소 목표

`ai_test3`는 개인 프로젝트 작업공간입니다. 실제 경로는 사용 중인 PC에 따라 다릅니다.

현재 `CareerDiff` 하나만 유지합니다. 각 프로젝트의 상세 기능·모듈 경계·검증 이력은 해당 프로젝트 폴더의 `docs/`를 참조하세요. 이 문서는 전체를 훑어보기 위한 요약 인덱스입니다.

---

## 환경 설정

LLM 실분석을 쓰려면 `.env.example`을 `.env.local`로 복사한 뒤 키를 입력하세요.

```bat
copy CareerDiff\app\.env.example CareerDiff\app\.env.local
```

| 프로젝트 | 필수 환경변수 | 발급처 |
|----------|---------------|--------|
| `CareerDiff` | `OPENAI_API_KEY` (선택 — 미설정 시 mock 분석으로 동작) | [OpenAI Platform](https://platform.openai.com) |

> `.env*` 파일은 `.gitignore`에 등록되어 있으므로 Git에 커밋되지 않습니다.

---

## 프로젝트 목록

| # | 폴더명 | 한 줄 설명 | 언어/스택 | 상태 | 빠른 실행 |
|---|--------|-----------|-----------|------|-----------|
| 1 | [CareerDiff](CareerDiff/docs/README.md) | 채용공고+이력서 → 요건 매칭·적합도 점수·이력서 제안·보완 프로젝트·면접 준비 플랜 생성 (Job Fit Analyzer) | Next.js + TypeScript | Mock 기반 UI/흐름 완성, LLM 실분석 검증 진행 중 | `cd CareerDiff/app && npm run dev` |

상세 기능·API·데이터 흐름은 [`CareerDiff/docs/ARCHITECTURE.md`](CareerDiff/docs/ARCHITECTURE.md), 제품 범위는 [`PRODUCT.md`](CareerDiff/docs/PRODUCT.md)를 참조하세요.

### 주요 미완성/HOLD 항목

- **CareerDiff**: LLM 실분석은 검증 진행 중 — `AnalysisOrchestrator`는 키 없으면 mock, 키 있으면 실제 호출로만 분기하며, 유료 API 호출 전 로컬 검증을 먼저 마쳐야 한다. 자동 채용정보 수집(크롤링)은 법적 리스크로 완전 제거됨 — 당분간 사람이 직접 붙여넣어 수동 누적, 공식 API 경로가 생기면 자동화 재검토.

검증 명령과 게이트, HOLD 조건 전체 목록은 [`CareerDiff/docs/VERIFICATION.md`](CareerDiff/docs/VERIFICATION.md)를 참조하세요(정확한 테스트 개수는 항상 최신이 아닐 수 있으니 `npm run typecheck && npm test`로 직접 확인).

---

## 공통 특징

- 로컬 실행 우선 설계, mock-first 원칙 — provider(LLM) 연동 전 UI/흐름을 mock으로 먼저 완성
- 유료 API·실데이터를 다루는 기능은 무료·저비용 경로(mock/로컬)로 먼저 검증한 기록 없이는 유료 경로로 전환하지 않음
- 세부 기능별 문서·의사결정 로그는 현재 구현과 중복되어 제거하고, 프로젝트별 `docs/`(PRODUCT/ARCHITECTURE/VERIFICATION + 문서 지도)로 통합 — 과거 이력은 Git 로그에서 확인
- 새 프로젝트 추가 시 `CareerDiff/docs/` 구조를 템플릿으로 따른다: 한 문장 사용 사례 → 제품 범위 → 기술/모듈 경계 → 검증 명령과 HOLD 조건
