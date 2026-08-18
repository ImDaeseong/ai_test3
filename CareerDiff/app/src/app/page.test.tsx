import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { mockAnalysisResult } from "@/core/mocks/mockAnalysisResult";
import { VALIDATION_CASES_STORAGE_KEY } from "@/core/validation/analysisValidationStore";
import AnalyzerPage from "./page";

/**
 * Exercises the full handoff this bug crossed: localStorage -> loadValidationCases
 * -> AnalyzerPage's mount effect -> AnalysisDashboard -> RelatedSkillPanel. A
 * unit test on loadValidationCases alone can't catch a broken handoff between
 * those modules; this renders the real page component against seeded storage.
 */
describe("AnalyzerPage mount (validation case auto-load)", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("does not crash and skips the dashboard when the only stored case predates a required field", async () => {
    const staleResult: Record<string, unknown> = { ...mockAnalysisResult };
    delete staleResult.relatedSkillGuidance;
    window.localStorage.setItem(
      VALIDATION_CASES_STORAGE_KEY,
      JSON.stringify([
        {
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          jobDescription: "job description",
          candidateProfile: "candidate profile",
          result: staleResult,
        },
      ]),
    );

    render(<AnalyzerPage />);

    await waitFor(() => {
      expect(screen.queryByText("적합도 점수")).not.toBeInTheDocument();
    });
  });

  it("renders the dashboard, including the related-skill panel, for a valid stored case", async () => {
    window.localStorage.setItem(
      VALIDATION_CASES_STORAGE_KEY,
      JSON.stringify([
        {
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          jobDescription: "job description",
          candidateProfile: "candidate profile",
          result: mockAnalysisResult,
        },
      ]),
    );

    render(<AnalyzerPage />);

    await waitFor(() => {
      expect(screen.getByText("적합도 점수")).toBeInTheDocument();
    });
    expect(screen.getByText("연관 기술 가이드")).toBeInTheDocument();
  });
});
