# job-collection-manual — 채용정보 수동 수집 (jobkorea-ai 대체)

## 왜 이 폴더가 생겼나

`jobkorea-ai/`(잡코리아 공개 페이지를 코드로 자동 크롤링하던 FastAPI 서브프로젝트)를 2026-08-01
법적 리스크 판단으로 완전히 제거했다(`../../VERIFICATION.md` 게이트 로그 참고). 자동 수집 스크립트를
다시 만들지 않고, 대신:

1. **사람이 채용 사이트에서 직접 공고를 읽는다**(자동화 없음 — 봇/스크립트로 접근하지 않는다).
2. 읽은 공고 원문을 아래 `COLLECT_PROMPT.md`로 Claude/ChatGPT 웹 Project에 붙여넣어 구조화된 JSON을
   받는다.
3. 결과를 `collected-jobs/`에 누적한다.
4. 나중에 공식 API(예: 잡코리아 제휴 API, 워크넷 Open API 등)가 확보되면, 이 폴더의 수동 절차는
   그 공식 API 연동으로 대체한다 — 그 전환은 사람이 명시적으로 요청할 때만 진행한다.

CareerDiff 앱(`app/`)의 분석 기능(`/api/analyze`)과는 무관하다. 저 기능은 JD-이력서 적합도를
비교하고(2026-08-01부터 로컬 검증으로 전환, 웹 Project를 쓰지 않는다), 이 폴더는 채용공고 자체를
구조화해서 모으는 것이 목적이다 — 둘을 같은 Project/프롬프트/파일로 섞지 않는다.

## 절대 원칙

- **자동화 금지**: 목록을 스크립트로 순회하거나, 스케줄러로 반복 호출하거나, 로그인/CAPTCHA/접근
  제한을 우회하지 않는다. 사람이 브라우저로 이미 보고 있는 공고 하나씩만 다룬다.
- **원문 재배포 금지**: 공고 전문을 그대로 커밋하지 않는다 — `collected-jobs/`는 git에 커밋되지
  않고(`.gitignore`), 커밋되는 로그(`COLLECT_LOG.md`)에는 회사명·직무·URL·분류 태그만 남긴다.
- 실제 운영 전 각 채용 사이트의 이용약관을 사람이 직접 확인한다(이 원칙은 `jobkorea-ai/README.md`가
  갖고 있던 원칙을 그대로 계승한다).

## 이 폴더의 파일

| 파일 | 역할 | 웹 Project에 등록? |
| --- | --- | --- |
| `README.md` (이 문서) | 목적·원칙 | ❌ |
| `지침.md` | Project Instructions | ✅ Instructions에 붙여넣기 |
| `메모리.md` | 계정 단위 Memory 문구 | ✅ Settings → Memory에 붙여넣기 |
| `COLLECT_PROMPT.md` | 복붙용 프롬프트 + 출력 스키마 | ✅ Knowledge에 첨부 |
| `사용법.md` | Project 생성부터 실행까지 절차 | ❌ |
| `COLLECT_LOG.md` | 수집 메타데이터 로그(공고 전문 없음) | ❌ (git 추적) |
| `collected-jobs/` | 구조화된 JSON 누적 폴더 | ❌ (git 미추적) |
