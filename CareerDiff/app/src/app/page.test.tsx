import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockAnalysisResult } from "@/core/mocks/mockAnalysisResult";
import { VALIDATION_CASES_STORAGE_KEY } from "@/core/validation/analysisValidationStore";
import AnalyzerPage from "./page";

/**
 * The accumulated validation-case history only grows and is checked
 * occasionally, not on every visit, so the analyzer page must not fetch or
 * render it on mount — that behavior now lives on /history. This guards
 * against that cost creeping back onto the main page.
 */
describe("AnalyzerPage mount", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("does not fetch the validation-case history on mount", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
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
      expect(screen.getByText("분석 히스토리 보기")).toBeInTheDocument();
    });
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it("does not render a previously stored result or the history panel on mount", () => {
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

    expect(screen.queryByText("적합도 점수")).not.toBeInTheDocument();
    expect(screen.queryByText(/분석 히스토리 \(/)).not.toBeInTheDocument();
  });

  it("links to the /history page for browsing past analyses", () => {
    render(<AnalyzerPage />);
    expect(screen.getByRole("link", { name: "분석 히스토리 보기" })).toHaveAttribute("href", "/history");
  });
});
