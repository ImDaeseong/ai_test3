# Architecture

## 기술 스택

- Next.js App Router, React, TypeScript
- Zod 스키마 검증
- Vitest, Testing Library, Playwright
- 선택적 OpenAI Responses API Structured Outputs

## 주요 구조

```text
app/src/
├── app/
│   └── api/
│       ├── analyze/
│       ├── jobs/import/
│       └── validation-cases/
├── core/
│   ├── analysis/
│   ├── job-import/
│   ├── llm/
│   ├── schemas/
│   ├── types/
│   └── validation/
└── features/
    ├── job-description-input/
    ├── candidate-profile-input/
    └── analysis-dashboard/
```

## 데이터 흐름

```text
잡코리아 URL
→ POST /api/jobs/import
→ 공개 HTML 정리
→ 채용공고 본문

채용공고 + 후보자 프로필
→ POST /api/analyze
→ AnalysisOrchestrator
→ 로컬 분석기 또는 OpenAI provider
→ 스키마가 검증된 분석 JSON
→ 화면 렌더링
→ POST /api/validation-cases
→ data/<UUID>.json
```

## API

### `POST /api/jobs/import`

입력: `{ "url": "https://...jobkorea.co.kr/Recruit/GI_Read/..." }`

출력: 출처 URL, 제목, 회사명, 정리된 공고 본문, 수집 시각.

### `POST /api/analyze`

입력: `jobDescription`, `candidateProfile`.

출력: 요구사항, 후보자 근거, 매칭, 점수, 이력서 제안, 미니 프로젝트, 면접 준비와 메타데이터.

### `POST /api/validation-cases`

입력: UUID, 생성 시각, 두 입력 원문과 분석 결과.

출력: 생성 파일명과 신규 생성 여부.

## 저장

- 후보자 첨부와 검증 목록: 브라우저 `localStorage`
- 검증 케이스: 프로젝트 `data/<UUID>.json`
- 파일 저장은 같은 디렉터리의 임시 파일을 완전히 기록·동기화한 뒤 최종 파일로 연결한다.
- 동일 UUID 재시도는 기존 파일을 유지해 중복 효과를 막는다.

## 보안 경계

- 잡코리아 HTTPS 상세공고 호스트와 경로만 허용해 SSRF 범위를 제한한다.
- 응답 크기와 요청 시간을 제한한다.
- 원문을 서버 로그에 기록하지 않는다.
- 입력을 신뢰할 수 없는 데이터로 취급하며 프롬프트 명령으로 실행하지 않는다.
- `data` 파일에는 개인정보가 포함될 수 있으므로 외부 공유와 버전 관리 전에 검토한다.
- 로그인, CAPTCHA, 접근통제 우회가 필요하면 구현하지 않고 HOLD한다.

## 분석 모드

`OPENAI_API_KEY`가 없으면 입력 공고와 후보자 프로필을 실제로 분석하는 결정론적 로컬 키워드
분석기(`LocalAnalysisProvider`)를 사용합니다. 키가 있으면 `OpenAiAnalysisProvider`가 Structured
Outputs 스키마로 실제 분석을 수행합니다. RAG와 retrieval은 MVP에서 비활성화합니다.
