# web-project/ — GPT·Claude 웹사이트 프로젝트 전용 폴더

> 이 폴더의 모든 파일은 **로컬 개발 코드가 아니라, ChatGPT/Claude 웹사이트의 "Projects" 기능에 등록해서 RAG/LLM 프롬프트를 테스트하기 위한 문서**입니다. `app/`, `docs/`의 원본 설계 문서와는 별개로, 웹 UI에 그대로 복붙/업로드하기 좋게 정리한 버전입니다.

## 왜 별도 폴더인가

CareerDiff는 아직 실제 분석 코드(API, 파싱 로직)가 구현되지 않은 스캐폴드 단계입니다. 코드 없이도 "분석기가 어떻게 동작해야 하는가"를 검증하려면, LLM이 직접 분석기 역할을 수행하도록 ChatGPT/Claude Projects에 지침과 지식을 등록해 테스트합니다. 이 폴더는 그 등록 작업에 필요한 파일만 모아둔 곳입니다.

## 파일 구성

| 파일 | 용도 |
|---|---|
| `USAGE.md` | GPT/Claude 웹사이트에 등록하는 단계별 사용법 |
| `INSTRUCTIONS.md` | Project instructions 칸에 그대로 붙여넣을 지침(규칙 + 출력 스키마) |
| `MEMORY.md` | 플랫폼별 "메모리" 기능을 이 프로젝트에 쓸지 말지에 대한 안내 |
| `KNOWLEDGE_FILES.md` | 지식 파일(Knowledge/Files)로 업로드해야 할 원본 문서 목록과 경로 |

## 원본 문서와의 관계

- `INSTRUCTIONS.md`는 [`../prompts/PROJECT_TEST_INSTRUCTIONS.md`](../prompts/PROJECT_TEST_INSTRUCTIONS.md)와 내용이 동일합니다. `prompts/`에는 프롬프트 설계 원본을 두고, 이 폴더에는 웹 등록용 사본을 둡니다. 프롬프트 규칙을 바꿀 때는 두 파일을 함께 수정하세요.
- 실제 지식 파일(SPEC.md, DATA_MODEL.md 등)은 원본 위치(`docs/`, 루트)에서 그대로 업로드합니다. 이 폴더에 복사본을 두지 않습니다(중복·구버전 방지).
