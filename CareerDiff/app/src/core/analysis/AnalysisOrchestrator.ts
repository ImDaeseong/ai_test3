import type { LlmAnalysisProvider } from "@/core/llm/LlmAnalysisProvider";
import { OpenAiAnalysisProvider } from "@/core/llm/OpenAiAnalysisProvider";
import { mockAnalysisResult } from "@/core/mocks/mockAnalysisResult";
import { analyzeRequestSchema } from "@/core/schemas/analyzeRequest";
import type { CareerDiffAnalysisResult } from "@/core/types";

export class AnalysisOrchestratorValidationError extends Error {
  readonly issues: string[];

  constructor(issues: string[]) {
    super("Invalid analyze request.");
    this.name = "AnalysisOrchestratorValidationError";
    this.issues = issues;
  }
}

/** A configured LLM provider failed while generating an analysis. */
export class AnalysisProviderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AnalysisProviderError";
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
 * Mock-first with an optional LLM key (docs/integration/ANALYSIS_FLOW.md
 * "Mock-first implementation rule" + docs/library-decisions/TECH_STACK_DECISIONS.md):
 * - No API key configured (the default — nothing in this repo sets one):
 *   always returns the stable mock result. This is the expected state for
 *   local development and for anyone who clones the repo without an
 *   OpenAI account.
 * - API key configured (OPENAI_API_KEY, see .env.example): calls the real
 *   provider. A failure there is a real error, not silently masked by
 *   falling back to mock data — see AnalysisProviderError.
 *
 * The provider is injected (defaulting to OpenAiAnalysisProvider) so
 * tests can exercise both branches without ever making a real API call.
 */
export class AnalysisOrchestrator {
  constructor(private readonly llmProvider: LlmAnalysisProvider = new OpenAiAnalysisProvider()) {}

  async analyze(rawInput: unknown): Promise<CareerDiffAnalysisResult> {
    const parsed = analyzeRequestSchema.safeParse(rawInput);
    if (!parsed.success) {
      throw new AnalysisOrchestratorValidationError(parsed.error.issues.map((issue) => issue.message));
    }

    if (!this.llmProvider.isConfigured()) {
      return mockAnalysisResult;
    }

    try {
      return await this.llmProvider.generate(parsed.data);
    } catch (error) {
      throw new AnalysisProviderError(error instanceof Error ? error.message : "LLM analysis failed.");
    }
  }
}
