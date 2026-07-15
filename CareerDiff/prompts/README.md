# CareerDiff Prompt Notes

이 폴더는 프롬프트 **설계 원칙**(무엇을 요구하는가)을 담는다. 각 AI 기능이 지금 "무료 검증을
통과했는지, 유료 API를 써도 되는지"는 여기가 아니라
[`PROMPT_VERIFICATION_REGISTRY.md`](./PROMPT_VERIFICATION_REGISTRY.md)에서 추적한다 — 새 프롬프트를
추가하거나 검증 상태를 확인하려면 그 문서를 먼저 본다.

| 파일/폴더 | 역할 |
| --- | --- |
| `README.md` (이 문서) | 분석기 프롬프트가 지켜야 할 목표/규칙(설계 원칙) |
| `PROMPT_VERIFICATION_REGISTRY.md` | 프로젝트 전체 AI 기능 목록 + 무료 검증 상태 + 유료 전환 조건 |
| `web-project/` | **Claude/ChatGPT 웹사이트 Projects에 그대로 붙여넣거나 업로드할 내용만 모은 폴더** — 설계/추적 문서와 분리 |

`web-project/` 안의 파일:

| 파일 | 역할 |
| --- | --- |
| `web-project/MANUAL_ANALYSIS_PROMPT.md` | 실제 코드와 동일한, 복붙용 프롬프트+스키마 |
| `web-project/WEB_PROJECT_USAGE.md` | Claude/ChatGPT 웹 Projects에 등록해 무료로 실행하는 절차 + 검증 체크리스트 |

## Analyzer prompt goals

The analyzer should compare a job description and a candidate profile without inventing experience.

It should return:

- Extracted job requirements.
- Candidate evidence map.
- Strong matches.
- Weak matches.
- Missing evidence.
- Risk items.
- Fit score with reasons.
- Resume bullet rewrites.
- Project description rewrites.
- Skill emphasis order.
- Mini project recommendations.
- Interview preparation plan.

## Hard rules

- Do not fabricate candidate experience.
- If evidence is missing, say it is missing.
- Prefer concrete text that can be copied into a resume.
- Keep recommendations tied to the job description.
- Distinguish required skills from preferred skills.
