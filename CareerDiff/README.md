# CareerDiff

잡코리아 채용공고와 후보자 경력을 비교해 적합도, 부족한 역량, 이력서 개선안, 보완 프로젝트와
면접 준비 계획을 만드는 로컬 웹앱입니다.

## 실행

`run-careerdiff.cmd`를 더블클릭하면 서버가 시작되고 기본 브라우저에서
`http://localhost:3000`이 열립니다.

직접 실행하려면:

```powershell
cd app
npm install
npm run dev
```

## 사용

1. 잡코리아 공개 상세공고 URL을 입력하고 `공고 가져오기`를 누릅니다.
2. `candidate-profile-*.json`을 첨부합니다.
3. `분석하기`를 누릅니다.
4. 화면 결과와 JSON을 확인합니다.

분석 검증 케이스는 `data/<UUID>.json`에 누적됩니다. 파일에는 채용공고와 후보자 프로필 원문이
포함되므로 외부 공유 전에 개인정보를 확인해야 합니다.

## 현재 분석 방식

- `OPENAI_API_KEY`가 없으면 입력 공고와 후보자 프로필을 실제로 분석하는 로컬 키워드 분석기(`LocalAnalysisProvider`)를 사용합니다.
- 키가 있으면 OpenAI Structured Outputs를 사용합니다.
- 잡코리아 수집은 공개 상세 페이지 HTML을 직접 읽으며 로그인, CAPTCHA 또는 접근통제를 우회하지 않습니다.

## 문서

- [제품 범위](docs/PRODUCT.md)
- [구조와 보안](docs/ARCHITECTURE.md)
- [검증 방법](docs/VERIFICATION.md)
