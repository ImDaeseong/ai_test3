# JobKorea AI Job Intelligence

잡코리아의 **공개 채용목록 및 공개 공고 상세 페이지**에서 필요한 공고만 선별하는
개인 연구·포트폴리오용 예제 프로젝트입니다.

## 중요

- `/recruit/joblist`, `/Recruit/GI_Read` 공개 경로만 대상으로 합니다.
- 로그인, CAPTCHA, 접근 제한, 403, 429를 우회하지 않습니다.
- CSS 선택자는 잡코리아 HTML 변경 시 수정이 필요할 수 있습니다.
- 기본값은 SQLite이며 PostgreSQL로 변경할 수 있습니다.
- 실제 운영 전 잡코리아 이용약관과 robots.txt를 직접 확인하십시오.

## 설치

```bash
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate

pip install -e ".[dev]"
copy .env.example .env
```

## 실행

```bash
uvicorn app.main:app --reload
```

브라우저:

- API 문서: http://127.0.0.1:8000/docs
- 공고 목록: http://127.0.0.1:8000/api/v1/jobs

## 수동 수집

```bash
python -m scripts.collect_jobs
```

처음에는 `MAX_LIST_PAGES=1`로 테스트하십시오.

## 테스트

```bash
pytest
```

## 주요 API

```text
GET  /health
GET  /api/v1/jobs
GET  /api/v1/jobs/{id}
GET  /api/v1/statistics
POST /api/v1/admin/collect
```

## 수집 원칙

1. 목록 페이지를 저빈도로 조회합니다.
2. 목록 텍스트에서 관심 키워드가 확인된 공고만 상세 조회합니다.
3. 403, 429, CAPTCHA 감지 시 즉시 중단합니다.
4. 공고 ID와 본문 해시로 중복 및 변경을 판정합니다.
5. 공고 전문 재배포가 아니라 요약·분류·원문 링크 제공을 목적으로 합니다.
