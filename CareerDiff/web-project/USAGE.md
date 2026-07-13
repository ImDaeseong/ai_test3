# 사용법 — GPT/Claude 웹사이트 프로젝트 등록

> 대상: ChatGPT(chatgpt.com) Projects, Claude(claude.ai) Projects.
> 목적: CareerDiff의 실제 앱 코드 없이, LLM이 SPEC/스키마대로 채용공고·이력서를 분석하는지 웹 UI에서 직접 테스트.

## 1. 프로젝트 생성

- ChatGPT: 좌측 사이드바 "Projects" → 새 프로젝트 생성 → 이름 예: `CareerDiff Test`
- Claude: 좌측 사이드바 "Projects" → 새 프로젝트 생성 → 이름 예: `CareerDiff Test`

## 2. 지침(Instructions) 등록

`INSTRUCTIONS.md` 파일 내용 전체를 복사해서 프로젝트의 "Instructions"(ChatGPT) / "Project instructions"(Claude) 칸에 붙여넣습니다.

## 3. 지식 파일(Knowledge/Files) 업로드

`KNOWLEDGE_FILES.md`에 정리된 파일 목록을 프로젝트의 파일 업로드 영역에 올립니다. 최소 구성은 4개(SPEC.md, DATA_MODEL.md, ANALYSIS_FLOW.md, AI_EVALUATION_PLAN.md)입니다.

## 4. 메모리 여부 결정

`MEMORY.md`를 참고해 계정 전역 메모리에 무언가 남길지 결정합니다. 기본 권장은 "남기지 않음"입니다(이 프로젝트 밖 다른 대화까지 영향을 주기 때문).

## 5. 테스트 실행

1. 새 대화를 프로젝트 안에서 시작합니다(프로젝트 밖에서 시작하면 지침/파일이 적용되지 않습니다).
2. `../samples/sample-01-strong-match.md`에 있는 채용공고와 이력서 텍스트를 대화창에 붙여넣습니다.
3. "위 스키마대로 분석해줘"라고 요청합니다.
4. 나온 결과를 `../samples/sample-01-strong-match.output.json`(기준값)과 대조합니다.

## 6. 확인 포인트

- 출력이 `INSTRUCTIONS.md`에 정의된 JSON 스키마 필드명/구조를 그대로 따르는가.
- 없는 경험(Playwright, 모니터링 등)을 지어내지 않았는가.
- required/preferred 스킬이 명확히 분리되었는가.
- missing evidence 항목이 구체적으로 지목되었는가.

## 주의

- 실제 이력서·개인정보·회사 기밀 데이터는 절대 업로드하지 않습니다. 테스트에는 `samples/`의 합성 데이터만 사용합니다.
- 프로젝트 지침/파일을 수정한 뒤에는 새 대화를 열어 테스트해야 변경 사항이 반영됩니다(기존 대화창은 이전 버전 컨텍스트를 유지할 수 있음).
