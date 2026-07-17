import type { AnalyzeRequestInput } from "@/core/schemas/analyzeRequest";

/**
 * Builds the analyzer prompt sent to the LLM provider.
 * Source of truth for goals/hard rules: ../../../../ai-prompts/README.md —
 * keep both in sync when either changes.
 */
export function buildAnalysisPrompt(input: AnalyzeRequestInput): string {
  return `You compare a job description and a candidate profile without inventing experience.

Hard rules (ai-prompts/README.md):
- Do not fabricate candidate experience.
- If evidence is missing, say it is missing.
- Prefer concrete text that can be copied directly into a resume.
- Keep recommendations tied to the job description.
- Distinguish required skills from preferred skills.
- Recommend exactly 3 mini projects, each mapped to one or more missing or weak requirements (docs/features/08-mini-project-recommendations.md).
- retrievalContext must be enabled=false, provider="none", items=[], query="", filters={ visibility: ["private"], sourceTypes: [], maxPiiRisk: "low" } — retrieval is not implemented yet (docs/integration/ANALYSIS_FLOW.md MVP defaults).
- metadata.persisted must be false and metadata.retrievalUsed must be false.
- Respond in Korean for all natural-language fields (summary, reasons, evidence snippets, resume bullets, project descriptions, mini project text, interview questions, plan steps). Keep proper nouns (language/framework/tool names) as-is.

Job description${input.targetRole ? ` (target role: ${input.targetRole})` : ""}:
"""
${input.jobDescription}
"""

Candidate profile${input.targetSeniority ? ` (target seniority: ${input.targetSeniority})` : ""}:
"""
${input.candidateProfile}
"""

Return one JSON object matching the provided schema: extracted job requirements, candidate evidence, strong/weak/missing/risk matches with reasons and evidence snippets, an explainable fit score with category reasons, resume bullet/project rewrites, skill priority order, ATS keywords, exactly 3 mini project recommendations mapped to gaps, and a 7-day interview preparation plan.`;
}
