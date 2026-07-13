# Sample 03: Missing-evidence case (synthetic)

Synthetic data only. Tests whether the analyzer honestly reports near-total mismatch instead of stretching weak signals into false matches.

## Job description (paste as-is for testing)

```
[채용] 데이터 엔지니어 (Data Engineer)

담당 업무
- Airflow 기반 배치 파이프라인 설계 및 운영
- Spark를 활용한 대용량 데이터 처리
- AWS Redshift/S3 기반 데이터 웨어하우스 운영
- dbt를 이용한 데이터 모델링

자격 요건
- Python 실무 경력 3년 이상
- Airflow, Spark 등 분산 데이터 처리 경험
- SQL 고급 활용 능력
- 클라우드 데이터 인프라(AWS) 운영 경험
```

## Candidate profile / resume (paste as-is for testing)

```
경력 2년 iOS 앱 개발자

[프로젝트 A] 소셜 커머스 iOS 앱 (Swift, 1.5년)
- SwiftUI 기반 화면 개발, Core Data로 로컬 캐싱 구현
- App Store 배포 및 크래시 리포트 대응

[프로젝트 B] 사내 재고관리 앱 (Swift, 0.5년)
- REST API 연동, 푸시 알림 구현

보유 스킬: Swift, SwiftUI, Xcode, Core Data, Git
```

## Expected properties

- Required skills correctly list Python, Airflow, Spark, SQL, AWS as required (not softened).
- `matches.strong` is empty or near-empty — there is no genuine overlap between iOS development and data engineering.
- `matches.missing` includes Python, Airflow, Spark, and AWS data infra experience explicitly.
- The model does NOT count "Git" or general "REST API" familiarity as evidence of data engineering skills — no inflated weak-match padding.
- `fitScore.total` is low (well below a strong-match case) and the reasoning explains the domain mismatch, not just a generic low score.
- `miniProjects` recommends genuinely foundational starting points (e.g., a small Python + SQL + Airflow pipeline project), not something implying prior expertise.
- `resumeSuggestions` does not repackage iOS experience as data engineering experience — it may suggest transferable soft skills (e.g., API integration experience) but must not claim data pipeline work that didn't happen.
