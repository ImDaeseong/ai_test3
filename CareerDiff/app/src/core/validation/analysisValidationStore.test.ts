import { beforeEach, describe, expect, it } from "vitest";
import { mockAnalysisResult } from "@/core/mocks/mockAnalysisResult";
import {
  appendValidationCase,
  loadValidationCases,
  VALIDATION_CASES_STORAGE_KEY,
} from "./analysisValidationStore";

describe("analysisValidationStore", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("accumulates input and output pairs for validation", () => {
    appendValidationCase({
      jobDescription: "job description",
      candidateProfile: "candidate profile",
      result: mockAnalysisResult,
    });
    appendValidationCase({
      jobDescription: "second job description",
      candidateProfile: "second candidate profile",
      result: mockAnalysisResult,
    });

    const cases = loadValidationCases();
    expect(cases).toHaveLength(2);
    expect(cases[0].jobDescription).toBe("job description");
    expect(cases[0].result.fitScore).toEqual(mockAnalysisResult.fitScore);
    expect(JSON.parse(window.localStorage.getItem(VALIDATION_CASES_STORAGE_KEY) ?? "[]")).toHaveLength(2);
  });

  it("returns an empty list for corrupted saved data", () => {
    window.localStorage.setItem(VALIDATION_CASES_STORAGE_KEY, "not json");
    expect(loadValidationCases()).toEqual([]);
  });
});
