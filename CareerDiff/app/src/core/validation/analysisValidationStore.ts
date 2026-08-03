import type { CareerDiffAnalysisResult } from "@/core/types";

export const VALIDATION_CASES_STORAGE_KEY = "careerdiff:validation-cases";

export type AnalysisValidationCase = {
  id: string;
  createdAt: string;
  jobDescription: string;
  candidateProfile: string;
  result: CareerDiffAnalysisResult;
};

export function loadValidationCases(): AnalysisValidationCase[] {
  const saved = window.localStorage.getItem(VALIDATION_CASES_STORAGE_KEY);
  if (!saved) return [];
  try {
    const parsed = JSON.parse(saved) as unknown;
    return Array.isArray(parsed) ? (parsed as AnalysisValidationCase[]) : [];
  } catch {
    return [];
  }
}

export function appendValidationCase(
  input: Omit<AnalysisValidationCase, "id" | "createdAt">,
): AnalysisValidationCase[] {
  const validationCase: AnalysisValidationCase = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  const cases = [...loadValidationCases(), validationCase];
  window.localStorage.setItem(VALIDATION_CASES_STORAGE_KEY, JSON.stringify(cases));
  return cases;
}
