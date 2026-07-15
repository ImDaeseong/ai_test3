# Pipeline Rollout Plan — 처음부터 끝까지 진행 순서

`pipeline/`(학습용 Airflow RAG 파이프라인)를 어떤 순서로 만들고, 실데이터를 어떤 절차를 거쳐 자동화하는지
정리한 로드맵 문서다. `docs/integration/AIRFLOW_PIPELINE_PLAN.md`가 "무엇을/왜/보안 경계"를 정의한다면,
이 문서는 "몇 단계로/어떤 순서로/각 단계의 통과 조건이 무엇인지"를 정의한다.

## 핵심 원칙 — 수동 검증 없이는 자동화 금지

> **모든 새 실데이터 소스(그리고 모든 새 자동화)는 "별도 수동 실행 → 안전성 검증 → 승인" 게이트를
> 통과해야 자동화(스케줄/DAG 상시 편입)로 넘어갈 수 있다. 예외 없음.**

이유:

- 수집 프로그램이 자동으로 매일 도는 상태에서 문제(개인정보 포함, 잘못된 필드 매핑, ToS 위반 소지,
  쓰레기 데이터가 벡터DB를 오염시키는 것)를 발견하면 이미 여러 번 반복 실행된 뒤다.
- 수동 단계에서는 결과를 사람이 직접 열어보고 "이 데이터를 벡터DB에 넣어도 되는가"를 판단할 수 있다.
- Airflow 자동화(스케줄)는 검증된 절차를 "반복 실행"하는 도구이지, 검증되지 않은 절차를 검증하는
  도구가 아니다.

이 원칙은 work24 Open API뿐 아니라, 나중에 추가되는 모든 데이터 소스·모든 실제 임베딩 프로바이더
(`EMBEDDING_PROVIDER=openai` 등)·모든 새 알림 채널에 동일하게 적용된다.

## 전체 진행 순서 (Phase 0 ~ 5)

| Phase | 이름 | 상태 | 통과 조건 |
| --- | --- | --- | --- |
| 0 | 목적·보안 경계 정의 | ✅ 완료 | `AIRFLOW_PIPELINE_PLAN.md` 작성, HOLD 조건 명시 |
| 1 | 목업 데이터로 파이프라인 뼈대 구축 | ✅ 완료 | 7개 stage 전부 구현, 벡터DB 저장까지 end-to-end 테스트 통과 |
| 2 | 실데이터 소스 후보 조사 (ToS/판례 검토) | ✅ 완료 | JobKorea 크롤링 HOLD 확정, work24 Open API로 대체 결정 |
| 3 | 실데이터 수집 코드 작성 (자동화에는 아직 편입 안 함) | ✅ 완료 | `work24_client.py` 작성, 문서 기반 필드 매핑, fail-closed 처리 |
| **4** | **수집 프로그램 분리 실행 + 수동 안전화 검증** | 🔲 **다음 단계 — 미완료** | 아래 "Phase 4 상세" 체크리스트 전부 통과 + 사람이 승인 |
| 5 | DAG 자동 편입 및 스케줄 자동화 | 🔲 미착수 (Phase 4 승인 전까지 금지) | Phase 4 승인 기록 존재 + `schedule=None` → 실제 cron으로 전환 |

### Phase 0 — 목적·보안 경계 정의 (완료)

- 산출물: `docs/integration/AIRFLOW_PIPELINE_PLAN.md`
- 학습용 파이프라인임을 명시, `app/` 제품과 분리, 임베딩 기본값은 무비용 로컬 fallback으로 확정.

### Phase 1 — 목업 데이터로 파이프라인 뼈대 구축 (완료)

- 산출물: `pipeline/dags/career_pipeline_dag.py`, `pipeline/tasks/*.py`
- `collect_job → clean_data → build_chunks → embed_chunks → store_vectors → update_rag_index →
  notify_complete` 7단계 전부 구현.
- **벡터DB 저장은 이미 포함되어 있다**: `store_vectors`가 SQLite 기반 벡터 저장소에 청크+벡터+메타데이터를
  upsert하고, `update_rag_index`가 저장된 내용을 요약한 매니페스트(`rag_index_manifest.json`)를 갱신한다.
- 검증: `pytest tests/` 전체 통과(목업 데이터 3건 기준 end-to-end).

### Phase 2 — 실데이터 소스 후보 조사 (완료)

- JobKorea `robots.txt` 확인, "잡코리아 vs 사람인" 대법원 판례(무단 크롤링 위법 인정) 확인, JobKorea 공식
  API는 공공기관/학교 전용이라 사용 불가 확인.
- 결론: JobKorea 실크롤링은 영구 HOLD. 고용24(work24.go.kr) Open API로 대체.

### Phase 3 — 실데이터 수집 코드 작성 (완료, 단 미검증 상태)

- 산출물: `pipeline/tasks/work24_client.py`, `pipeline/tasks/collect_job.py`의
  `JOB_DATA_SOURCE=work24` 옵트인 분기.
- **주의**: 이 코드는 공개 문서 기반으로 작성됐고, 실제 인증키로 호출해 검증한 적이 없다. 그래서 Phase 4
  없이 이 코드를 자동화(Airflow 스케줄)에 편입하면 안 된다.

### Phase 4 — 수집 프로그램 분리 실행 + 수동 안전화 검증 (다음 단계, 미완료)

이 단계가 지금 남은 작업이다. **DAG에 자동 편입하지 않고**, 아래 절차를 별도 스크립트로 수동 실행한다.

1. **인증키 발급**: work24 Open API 센터에서 `WORK24_API_KEY` 신청·발급 (사용자가 직접 진행).
2. **분리 실행**: `pipeline/tasks/work24_client.py`를 DAG 밖에서 단독 실행해 소량(예: 5~10건)만
   가져온다.
   ```powershell
   cd pipeline
   python -c "from tasks.work24_client import fetch_postings_xml; open('review_raw_response.xml','w',encoding='utf-8').write(fetch_postings_xml('<key>', display=10))"
   ```
3. **원본 검토(사람이 직접 열어봄)**:
   - [ ] 개인정보(이름, 연락처, 주민번호 등)가 포함되어 있지 않은가?
   - [ ] `parse_work24_xml`의 필드 매핑(`title`, `company`, `region`, `career` 등)이 실제 응답 태그명과
     일치하는가? 다르면 `work24_client.py`를 수정한다.
   - [ ] 응답에 예상치 못한 민감 필드(회사 내부 식별자, 담당자 개인 이메일 등)가 없는가?
4. **픽스처 교체 및 재테스트**: 검토를 마친 실응답(개인정보 제거 후)을
   `tests/fixtures/work24_sample_response.xml`로 교체하고 `pytest tests/test_work24_client.py -v` 재실행.
5. **소량 파이프라인 전체 실행(수동)**: `JOB_DATA_SOURCE=work24`로 `collect_job → ... → store_vectors →
   update_rag_index`까지 수동으로 한 번 실행하고, `rag_index_manifest.json`과 SQLite 내용을 직접 확인한다.
   - [ ] 벡터DB에 들어간 `text_for_embedding` 값이 실제로 의미 있는 텍스트인가(빈 문자열/깨진 인코딩 아님)?
   - [ ] 청크 수가 posting 수에 비례해 합리적인가(폭증/누락 없음)?
6. **승인 기록**: 위 체크리스트가 전부 통과하면, 이 문서의 "승인 로그" 섹션에 날짜와 함께 한 줄 기록한다.
   승인 기록이 없으면 Phase 5로 넘어가지 않는다.

### Phase 5 — DAG 자동 편입 및 스케줄 자동화 (Phase 4 승인 전까지 금지)

Phase 4 승인 후에만 진행:

1. `career_pipeline_dag.py`의 `schedule=None`을 실제 주기(예: 매일 새벽 2시 `"0 2 * * *"`)로 변경.
2. Airflow UI에서 DAG를 unpause하고 스케줄 실행이 실제로 도는지 1회 이상 관찰.
3. `notify_complete`가 실패를 제대로 로그로 남기는지 의도적으로 한 번 실패시켜 확인(예: DB 파일 잠금).
4. 이 시점부터 "매일 새벽 → 자동 실행 → 오류 시 중지 → 로그 저장 → 재실행 가능"이라는, 사용자가 원래
   설명한 Airflow의 목표 동작이 실제로 재현된다.

## 승인 로그 (Phase 4 통과 기록)

> Phase 4 체크리스트를 통과할 때마다 아래에 한 줄씩 추가한다. 비어있으면 Phase 5 진행 금지.

- (아직 없음)

## 다른 문서와의 관계

- `docs/integration/AIRFLOW_PIPELINE_PLAN.md`: 무엇을/왜/보안 경계·HOLD 조건 (변경 없음, 그대로 유효).
- `pipeline/README.md`: 각 Phase에서 실제로 실행하는 명령어(테스트/Docker Compose/work24 연동) 상세.
- 이 문서(`PIPELINE_ROLLOUT_PLAN.md`): 순서와 게이트 — "지금 몇 단계고 다음에 뭘 해야 하는가"에 대한 단일
  참조 지점.
