import type { CareerDiffAnalysisResult } from "@/core/types";
import { careerDiffAnalysisResultSchema } from "@/core/schemas/analysisResult";

export const VALIDATION_CASES_STORAGE_KEY = "careerdiff:validation-cases";

export type AnalysisValidationCase = {
  id: string;
  createdAt: string;
  jobDescription: string;
  candidateProfile: string;
  result: CareerDiffAnalysisResult;
};

function isStoredValidationCase(item: unknown): item is AnalysisValidationCase {
  if (!item || typeof item !== "object") return false;
  const candidate = item as Record<string, unknown>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.createdAt === "string" &&
    typeof candidate.jobDescription === "string" &&
    typeof candidate.candidateProfile === "string" &&
    careerDiffAnalysisResultSchema.safeParse(candidate.result).success
  );
}

/**
 * Cases saved under an older schema version (e.g. before relatedSkillGuidance
 * was added to CareerDiffAnalysisResult) no longer match
 * careerDiffAnalysisResultSchema and are dropped here rather than passed
 * through with `as`, which would surface as a downstream render crash
 * instead of a load-time filter.
 */
export function loadValidationCases(): AnalysisValidationCase[] {
  const saved = window.localStorage.getItem(VALIDATION_CASES_STORAGE_KEY);
  if (!saved) return [];
  try {
    const parsed = JSON.parse(saved) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isStoredValidationCase);
  } catch {
    return [];
  }
}

export type AppendValidationCaseResult = {
  cases: AnalysisValidationCase[];
  /** The newly stored case, or null when an identical case already existed. */
  added: AnalysisValidationCase | null;
};

/**
 * Appends a validation case unless an identical one already exists.
 *
 * A case is a duplicate only when the job description, candidate profile, and
 * full analysis result all match an existing case. Re-analyzing the same inputs
 * with a different result is kept on purpose, so docs/VERIFICATION.md's
 * "반복 실행 시 결과 변동" review still has the data it needs.
 */
export function appendValidationCase(
  input: Omit<AnalysisValidationCase, "id" | "createdAt">,
): AppendValidationCaseResult {
  const existing = loadValidationCases();
  const serializedResult = JSON.stringify(input.result);
  const duplicate = existing.some(
    (existingCase) =>
      existingCase.jobDescription === input.jobDescription &&
      existingCase.candidateProfile === input.candidateProfile &&
      JSON.stringify(existingCase.result) === serializedResult,
  );
  if (duplicate) {
    return { cases: existing, added: null };
  }

  const validationCase: AnalysisValidationCase = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  const cases = [...existing, validationCase];
  window.localStorage.setItem(VALIDATION_CASES_STORAGE_KEY, JSON.stringify(cases));
  return { cases, added: validationCase };
}
