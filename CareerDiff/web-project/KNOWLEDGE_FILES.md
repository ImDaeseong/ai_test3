# 지식 파일 — GPT/Claude 웹사이트 프로젝트 업로드 목록

> 이 문서는 로컬 코드가 아니라 **ChatGPT/Claude 웹사이트 Projects의 "Knowledge"(Claude) / "Files"(ChatGPT) 업로드 영역에 무엇을 올릴지 정리한 안내 문서**입니다. 아래 경로의 원본 파일을 그대로 업로드하세요(사본을 이 폴더에 만들지 않습니다).

## 최소 구성 (필수 4개)

| 순번 | 경로 | 역할 |
|---|---|---|
| 1 | `../SPEC.md` | 목적, 대상 사용자, MVP 범위, 보안/개인정보 경계, 수용 기준 |
| 2 | `../docs/design/DATA_MODEL.md` | 출력 JSON 스키마 정의(`INSTRUCTIONS.md`가 참조하는 타입) |
| 3 | `../docs/integration/ANALYSIS_FLOW.md` | 기능 서비스 간 처리 흐름 |
| 4 | `../docs/design/AI_EVALUATION_PLAN.md` | 테스트 케이스 시나리오와 평가 기준 |

## 상황별 선택 추가

| 목적 | 추가 파일 |
|---|---|
| RAG 설계 검토 | `../docs/integration/RAG_EMBEDDING_PLAN.md`, `../docs/design/AI_DATA_STRATEGY.md` |
| 프롬프트 인젝션 방어 테스트 | `../docs/design/SECURITY_THREAT_MODEL.md` |
| 특정 기능만 심층 테스트 | `../docs/features/0N-*.md` (해당 번호만) |

## 업로드하지 말 것

- `../app/` 전체 (Next.js 스캐폴드일 뿐 분석 로직 코드 없음, 업로드해도 테스트에 도움 안 됨)
- `node_modules/` (절대 금지, 용량/노이즈만 큼)
- `../samples/`의 실제 테스트 입력은 지식 파일이 아니라 **대화창에 직접 붙여넣는 용도**(`USAGE.md` 5단계 참고)
