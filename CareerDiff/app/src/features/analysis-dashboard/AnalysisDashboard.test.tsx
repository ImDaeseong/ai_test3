import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { mockAnalysisResult } from "@/core/mocks/mockAnalysisResult";
import type { CareerDiffAnalysisResult } from "@/core/types";
import { AnalysisDashboard } from "./AnalysisDashboard";

describe("AnalysisDashboard", () => {
  it("renders all MVP sections for the mock result (docs/features/10)", () => {
    render(<AnalysisDashboard result={mockAnalysisResult} />);

    expect(screen.getByText("적합도 점수")).toBeInTheDocument();
    expect(screen.getByText("채용 요건")).toBeInTheDocument();
    expect(screen.getByText("매칭 결과")).toBeInTheDocument();
    expect(screen.getByText("이력서 개선 제안")).toBeInTheDocument();
    expect(screen.getByText("보완 프로젝트 추천")).toBeInTheDocument();
    expect(screen.getByText("면접 준비")).toBeInTheDocument();
  });

  it("does not break layout when result sections are empty", () => {
    const emptyResult: CareerDiffAnalysisResult = {
      ...mockAnalysisResult,
      fitScore: { total: 0, categories: [] },
      jobRequirements: {
        requiredSkills: [],
        preferredSkills: [],
        domain: [],
        collaboration: [],
        deliveryExpectations: [],
      },
      matches: { strong: [], weak: [], missing: [], risks: [] },
      resumeSuggestions: { bullets: [], projectDescriptions: [], skillPriority: [], atsKeywords: [] },
      miniProjects: [],
      interviewPrep: { questions: [], weakAreas: [], sevenDayPlan: [] },
    };

    render(<AnalysisDashboard result={emptyResult} />);

    expect(screen.getAllByText(/없습니다\.?$/).length).toBeGreaterThan(0);
  });
});
