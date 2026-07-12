import { mockAnalysisResult } from "@/core/mocks/mockAnalysisResult";
import { analyzeRequestSchema, type AnalyzeRequestInput } from "@/core/schemas/analyzeRequest";
import type { CareerDiffAnalysisResult } from "@/core/types";

export class AnalysisOrchestratorValidationError extends Error {
  readonly issues: string[];

  constructor(issues: string[]) {
    super("Invalid analyze request.");
    this.name = "AnalysisOrchestratorValidationError";
    this.issues = issues;
  }
}

/**
 * Coordinates one job-fit analysis request.
 *
 * Per docs/integration/ANALYSIS_FLOW.md, this is the only module allowed to
 * call extraction/matching/scoring/generation services and the only module
 * allowed to request RetrievalContext. Only the API route should call this
 * class; it must not be imported directly by UI components.
 *
 * Mock-first (docs/integration/ANALYSIS_FLOW.md "Mock-first implementation
 * rule"): no extraction/matching/scoring/LLM services exist yet, so
 * `analyze()` validates the request and always returns the stable mock
 * result. When real services exist, replace the body of
 * `runMockPipeline` with real calls — callers and the return type stay
 * the same.
 */
export class AnalysisOrchestrator {
  analyze(rawInput: unknown): CareerDiffAnalysisResult {
    const parsed = analyzeRequestSchema.safeParse(rawInput);
    if (!parsed.success) {
      throw new AnalysisOrchestratorValidationError(parsed.error.issues.map((issue) => issue.message));
    }
    return this.runMockPipeline(parsed.data);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- input is intentionally unused until real extraction/matching/scoring services exist
  private runMockPipeline(input: AnalyzeRequestInput): CareerDiffAnalysisResult {
    return mockAnalysisResult;
  }
}
