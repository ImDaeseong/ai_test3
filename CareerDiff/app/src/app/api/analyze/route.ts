import { NextResponse } from "next/server";
import { AnalysisOrchestrator, AnalysisOrchestratorValidationError } from "@/core/analysis/AnalysisOrchestrator";
import type { AnalyzeResponse, ApiErrorResponse } from "@/core/types";

// Per docs/integration/ANALYSIS_FLOW.md: only this route calls AnalysisOrchestrator.
const orchestrator = new AnalysisOrchestrator();

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    // Do not log the raw body (docs/integration/API_CONTRACT.md privacy requirements).
    return NextResponse.json<ApiErrorResponse>(
      { error: { code: "VALIDATION_ERROR", message: "Request body must be valid JSON.", retryable: false } },
      { status: 400 },
    );
  }

  try {
    const result = orchestrator.analyze(body);
    const response: AnalyzeResponse = {
      result,
      privacy: {
        persisted: false,
        rawInputLogged: false,
        retrievalUsed: result.metadata.retrievalUsed,
      },
    };
    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof AnalysisOrchestratorValidationError) {
      return NextResponse.json<ApiErrorResponse>(
        { error: { code: "VALIDATION_ERROR", message: error.issues.join(" "), retryable: false } },
        { status: 400 },
      );
    }
    return NextResponse.json<ApiErrorResponse>(
      { error: { code: "ANALYSIS_FAILED", message: "Analysis failed unexpectedly.", retryable: true } },
      { status: 500 },
    );
  }
}
