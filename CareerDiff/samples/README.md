# Samples

임시 검증 공간이다. 웹 Project(Claude/ChatGPT)에서 채용공고·이력서 세트를 테스트할 때만 데이터를
여기에 붙여넣고, 검증이 끝나면 지운다 — 이 폴더는 항상 비어있는 상태로 커밋된다.

- 실제 이력서, 회사 내부 데이터, 고객 정보, API 키, 토큰, 비밀번호, 내부 전용 식별자를 절대
  두지 않는다. 실제 채용공고·본인 이력서를 붙여넣더라도 검증이 끝나면 반드시 지운다.
- 이 폴더에 만든 파일은 `.gitignore`로 커밋되지 않으니, 지우는 걸 잊어도 저장소에는 남지 않는다.
- 세트별 프롬프트 원문 자체는 `ai-prompts/claude-projects-test/MANUAL_TEST_SESSION.md`에 이미
  완성돼 있다 — 이 폴더는 그 프롬프트를 돌릴 때 참고용으로 데이터를 잠깐 두는 용도다.

## 웹 Project 응답 자동 검증

웹 Project(Claude/ChatGPT)에서 받은 JSON 응답을 `*.output.json` 파일로 이 폴더에 저장하면,
`app/src/core/schemas/sampleOutputs.test.ts`가 `npm run test` 실행 시 자동으로
`careerDiffAnalysisResultSchema`에 맞는지 검증한다(최상위 키 누락/추가, `miniProjects` 길이 3,
`retrievalContext`/`metadata` no-retention 필드 등). 파일이 하나도 없으면 이 테스트는
그냥 skip되어 빌드/테스트에 아무 영향이 없다 — 데이터를 넣을 때만 실제로 동작한다.
