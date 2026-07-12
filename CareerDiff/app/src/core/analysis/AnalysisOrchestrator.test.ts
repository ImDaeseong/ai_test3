import { describe, expect, it } from "vitest";
import { mockAnalysisResult } from "@/core/mocks/mockAnalysisResult";
import { AnalysisOrchestrator, AnalysisOrchestratorValidationError } from "./AnalysisOrchestrator";

describe("AnalysisOrchestrator", () => {
  const orchestrator = new AnalysisOrchestrator();
  const validRequest = {
    jobDescription: "a".repeat(40),
    candidateProfile: "b".repeat(40),
  };

  it("rejects a request with an empty job description", () => {
    expect(() => orchestrator.analyze({ jobDescription: "", candidateProfile: "b".repeat(40) })).toThrow(
      AnalysisOrchestratorValidationError,
    );
  });

  it("rejects a request with a too-short candidate profile", () => {
    expect(() => orchestrator.analyze({ jobDescription: "a".repeat(40), candidateProfile: "short" })).toThrow(
      AnalysisOrchestratorValidationError,
    );
  });

  it("rejects a non-object request body", () => {
    expect(() => orchestrator.analyze(null)).toThrow(AnalysisOrchestratorValidationError);
    expect(() => orchestrator.analyze("not json")).toThrow(AnalysisOrchestratorValidationError);
  });

  it("returns the stable mock result for a valid request (mock-first)", () => {
    const result = orchestrator.analyze(validRequest);
    expect(result).toEqual(mockAnalysisResult);
  });

  it("returns MVP retrieval defaults regardless of input", () => {
    const result = orchestrator.analyze(validRequest);
    expect(result.retrievalContext.enabled).toBe(false);
    expect(result.retrievalContext.provider).toBe("none");
  });
});
