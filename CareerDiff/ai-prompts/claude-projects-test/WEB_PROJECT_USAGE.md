# CareerDiff Web Project 사용 가이드 (수동 무료 검증)

## 목적

유료 OpenAI API를 연동하기 전에, 이미 계정을 갖고 있는 Claude.ai 또는 ChatGPT 웹 UI에서 `MANUAL_ANALYSIS_PROMPT.md`를 직접 실행해 결과 품질을 사람이 먼저 확인한다. 이 문서의 절차로 확인이 끝나고 나서야 `app/src/core/llm/OpenAiAnalysisProvider.ts`(유료 API 경로)를 실제 키로 검증하는 단계로 넘어간다.

이 경로는 앱의 `/api/analyze` 엔드포인트와 무관하다 — 코드를 실행하지 않고, 사람이 프롬프트를 복사해서 웹 채팅에 붙여넣고 결과를 읽는 것뿐이다.

## Claude Project 설정

```text
Project Name: CareerDiff
Project Instructions: 지침.md 내용 전체를 그대로 붙여넣는다
Knowledge 첨부: MANUAL_ANALYSIS_PROMPT.md
계정 메모리(Settings → Memory): 메모리.md 참고
```

지침 전문과 계정 메모리 문구는 각각 `지침.md` / `메모리.md`에 있다 — 두 곳에 같은 규칙을 따로
유지하면 서로 어긋날 수 있어 여기서는 중복하지 않는다. 상세 실행 절차는 `사용법.md` 참고.

## ChatGPT Project 설정

ChatGPT는 화면에 따라 별도 지침 입력칸이 없을 수 있다. 그럴 때는 새 채팅 첫 메시지로 `지침.md`
내용을 그대로 보낸다.

프로젝트 파일로 첨부: `MANUAL_ANALYSIS_PROMPT.md`

## 실행 절차

1. 위 설정을 마친 채팅에서 `MANUAL_ANALYSIS_PROMPT.md`의 "복사할 프롬프트" 블록을 실제 채용공고/이력서로 채워 붙여넣는다.
2. 받은 응답이 JSON 코드블록 하나인지 확인한다(설명 문장이 앞뒤로 붙어 있으면 "JSON만 다시 출력해줘"로 재요청).
3. 아래 검증 체크리스트로 확인한다.
4. 문제가 있으면 `MANUAL_ANALYSIS_PROMPT.md`의 규칙 문구를 조정하고 다시 실행 — 이 조정은 나중에 `buildAnalysisPrompt.ts`에도 동일하게 반영해야 한다(두 파일은 반드시 같은 규칙을 유지).

## 검증 체크리스트

- [ ] 최상위 키가 스키마와 정확히 일치한다(`fitScore`, `summary`, `jobRequirements`, `candidateEvidence`, `retrievalContext`, `matches`, `resumeSuggestions`, `miniProjects`, `interviewPrep`, `metadata`) — 누락/추가 키 없음.
- [ ] `miniProjects` 배열 길이가 정확히 3이다.
- [ ] `retrievalContext.enabled`가 `false`, `provider`가 `"none"`, `items`가 빈 배열이다.
- [ ] `metadata.persisted`가 `false`, `metadata.retrievalUsed`가 `false`다.
- [ ] `summary`, `reason`, `sourceSnippet`, 이력서 문장, 면접 질문 등 자연어 필드가 전부 한국어다(고유명사 제외).
- [ ] `matches.missing`/`matches.risks`에 실제로 이력서에 없는 근거가 "없다"고 명시돼 있고, 지어낸 경험처럼 보이는 문장이 없다 — 입력한 이력서 원문과 대조해서 확인한다.
- [ ] `jobRequirements.requiredSkills`와 `preferredSkills`가 실제 채용공고 원문과 대조했을 때 합리적으로 분리돼 있다.
- [ ] `confidence` 값이 `high`/`medium`/`low` 중 하나로만 채워져 있다.
- [ ] `fitScore.total`이 0~100 범위이고, `categories`의 각 `reason`이 점수와 모순되지 않는다.

체크리스트를 통과하지 못하면 그 실패 사례를 기록해 두고(어떤 항목이, 왜 실패했는지), 프롬프트 규칙을 수정한 뒤 같은 입력으로 재실행해 재확인한다.

## 올리지 않는 파일

```text
app/                (실제 코드 — 채팅 컨텍스트에 불필요)
docs/                (설계 문서 — 필요할 때만 개별 참고)
VERIFICATION.md, ARCHITECTURE.md, SPEC.md  (내부 관리 문서)
```

## 유료 API 단계로 넘어가는 기준

이 수동 검증을 `MANUAL_TEST_SESSION.md`의 8세트(`AI_EVALUATION_PLAN.md`의 10개 평가 유형 중 8개 커버)로 반복해서 위 체크리스트를 안정적으로 통과하면, 그때 `OPENAI_API_KEY`를 발급받아 `OpenAiAnalysisProvider`를 실제로 한 번 호출해 같은 체크리스트로 재확인한다. 이 문서와 `MANUAL_ANALYSIS_PROMPT.md`의 규칙이 `buildAnalysisPrompt.ts`와 어긋나 있으면 그 시점에 먼저 동기화한다.
