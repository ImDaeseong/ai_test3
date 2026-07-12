# CareerDiff Manual Analysis Prompt

복사해서 Claude.ai 또는 ChatGPT 웹 UI(Project 권장, `WEB_PROJECT_USAGE.md` 참고)에 붙여넣고 실행하는 검증용 프롬프트다. `app/src/core/llm/buildAnalysisPrompt.ts`가 실제 코드에서 만드는 프롬프트와 규칙·출력 스키마가 동일하다 — 유료 API 호출 전에 결과 품질을 사람이 먼저 확인하기 위한 무료 경로다.

## 사용법

1. 아래 "복사할 프롬프트" 블록 전체를 복사한다.
2. `{{채용공고}}`와 `{{이력서/커리어/프로젝트 설명}}` 자리에 실제 텍스트를 넣는다(둘 다 최소 30자 이상 — 코드의 `analyzeRequestSchema` 기준과 동일).
3. 필요하면 `{{목표 직무}}` / `{{목표 시니어리티}}`를 채우고, 없으면 그 줄을 지운다.
4. Claude.ai 또는 ChatGPT에 붙여넣고 실행한다.
5. 받은 JSON을 `WEB_PROJECT_USAGE.md`의 검증 체크리스트로 확인한다.

## 복사할 프롬프트

```
You compare a job description and a candidate profile without inventing experience.

Hard rules:
- Do not fabricate candidate experience.
- If evidence is missing, say it is missing.
- Prefer concrete text that can be copied directly into a resume.
- Keep recommendations tied to the job description.
- Distinguish required skills from preferred skills.
- Recommend exactly 3 mini projects, each mapped to one or more missing or weak requirements.
- retrievalContext must be enabled=false, provider="none", items=[], query="", filters={ visibility: ["private"], sourceTypes: [], maxPiiRisk: "low" } — retrieval is not implemented yet.
- metadata.persisted must be false and metadata.retrievalUsed must be false.
- Respond in Korean for all natural-language fields (summary, reasons, evidence snippets, resume bullets, project descriptions, mini project text, interview questions, plan steps). Keep proper nouns (language/framework/tool names) as-is.

Job description (target role: {{목표 직무, 없으면 이 줄 삭제}}):
"""
{{채용공고 텍스트}}
"""

Candidate profile (target seniority: {{목표 시니어리티, 없으면 이 줄 삭제}}):
"""
{{이력서/커리어/프로젝트 설명 텍스트}}
"""

Return one JSON object with exactly this shape (no extra top-level keys, no missing keys):

{
  "fitScore": {
    "total": 0,
    "categories": [{ "label": "", "score": 0, "reason": "" }]
  },
  "summary": "",
  "jobRequirements": {
    "requiredSkills": [{ "id": "", "label": "", "category": "", "evidenceSnippet": "", "confidence": "high|medium|low", "sourceRecordId": "" }],
    "preferredSkills": [/* same item shape */],
    "domain": [/* same item shape */],
    "seniority": "",
    "collaboration": [/* same item shape */],
    "deliveryExpectations": [/* same item shape */]
  },
  "candidateEvidence": {
    "skills": [{ "id": "", "label": "", "sourceSnippet": "", "confidence": "high|medium|low", "sourceRecordId": "" }],
    "projects": [/* same item shape */],
    "responsibilities": [/* same item shape */],
    "achievements": [/* same item shape */],
    "collaboration": [/* same item shape */]
  },
  "retrievalContext": {
    "enabled": false,
    "query": "",
    "items": [],
    "provider": "none",
    "filters": { "visibility": ["private"], "sourceTypes": [], "maxPiiRisk": "low" }
  },
  "matches": {
    "strong": [{ "requirement": "", "status": "strong", "reason": "", "evidenceSnippet": "", "sourceRequirementId": "", "sourceEvidenceId": "" }],
    "weak": [/* status: "weak" */],
    "missing": [/* status: "missing" */],
    "risks": [/* status: "risk" */]
  },
  "resumeSuggestions": {
    "bullets": [""],
    "projectDescriptions": [""],
    "skillPriority": [""],
    "atsKeywords": [""]
  },
  "miniProjects": [
    { "title": "", "goal": "", "targetGaps": [""], "deliverables": [""], "suggestedDurationDays": 0 }
  ],
  "interviewPrep": {
    "questions": [""],
    "weakAreas": [""],
    "sevenDayPlan": [""]
  },
  "metadata": {
    "schemaVersion": "1.0.0",
    "promptVersion": "manual-1",
    "modelVersion": "",
    "scoringVersion": "1.0.0",
    "retrievalUsed": false,
    "persisted": false
  }
}

Exactly 3 items in miniProjects. Every id/sourceRecordId/sourceEvidenceId/sourceRequirementId field may be an empty string if not applicable — do not omit the key.
```

## 코드와 동기화 원칙

이 프롬프트와 스키마는 `app/src/core/llm/buildAnalysisPrompt.ts` + `app/src/core/schemas/analysisResult.ts`에서 파생됐다. 둘 중 하나가 바뀌면 이 문서도 같이 갱신한다 — 안 그러면 사람이 수동 검증한 결과와 실제 API가 나중에 만들 결과가 서로 다른 기준으로 검증된다.
