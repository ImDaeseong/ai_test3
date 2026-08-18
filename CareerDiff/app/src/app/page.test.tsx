import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mockAnalysisResult } from "@/core/mocks/mockAnalysisResult";
import type { CareerDiffAnalysisResult } from "@/core/types";
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

  it("does not crash and recovers a stored case that predates relatedSkillGuidance", async () => {
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
      expect(screen.getByText("적합도 점수")).toBeInTheDocument();
    });
    expect(screen.getByText("연결된 기술 정보가 없습니다.")).toBeInTheDocument();
  });

  it("does not crash and skips the dashboard when the only stored case is malformed beyond recovery", async () => {
    window.localStorage.setItem(
      VALIDATION_CASES_STORAGE_KEY,
      JSON.stringify([
        {
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          jobDescription: "job description",
          candidateProfile: "candidate profile",
          result: { fitScore: mockAnalysisResult.fitScore },
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

  it("switches the displayed result when a different history entry is selected", async () => {
    const secondResult: CareerDiffAnalysisResult = {
      ...mockAnalysisResult,
      summary: "두 번째 케이스 전용 요약 텍스트입니다.",
      fitScore: { ...mockAnalysisResult.fitScore, total: 12 },
    };
    window.localStorage.setItem(
      VALIDATION_CASES_STORAGE_KEY,
      JSON.stringify([
        {
          id: "case-first",
          createdAt: "2026-08-01T00:00:00.000Z",
          jobDescription: "첫 번째 채용공고 원문입니다.",
          candidateProfile: "candidate profile one",
          result: mockAnalysisResult,
        },
        {
          id: "case-second",
          createdAt: "2026-08-02T00:00:00.000Z",
          jobDescription: "두 번째 채용공고 원문입니다.",
          candidateProfile: "candidate profile two",
          result: secondResult,
        },
      ]),
    );

    render(<AnalyzerPage />);

    await waitFor(() => {
      expect(screen.getByText("분석 히스토리 (2건)")).toBeInTheDocument();
    });
    // The mount effect auto-loads the most recent case (secondResult).
    await waitFor(() => {
      expect(screen.getByText(secondResult.summary)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/첫 번째 채용공고/));

    await waitFor(() => {
      expect(screen.getByText(mockAnalysisResult.summary)).toBeInTheDocument();
    });
  });

  describe("with the server case list (data/*.json, not just this browser's cache)", () => {
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it("shows a case saved on the server even when this browser's localStorage is empty", async () => {
      const serverOnlyResult: CareerDiffAnalysisResult = {
        ...mockAnalysisResult,
        summary: "다른 브라우저에서 저장된 서버 케이스 요약입니다.",
      };
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => ({
            cases: [
              {
                id: "server-case",
                createdAt: "2026-08-03T00:00:00.000Z",
                jobDescription: "server-persisted job description",
                candidateProfile: "server-persisted candidate profile",
                result: serverOnlyResult,
              },
            ],
          }),
        }),
      );

      render(<AnalyzerPage />);

      await waitFor(() => {
        expect(screen.getByText(serverOnlyResult.summary)).toBeInTheDocument();
      });
      expect(screen.getByText("분석 히스토리 (1건)")).toBeInTheDocument();
    });
  });
});
