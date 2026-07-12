import OpenAI from "openai";
import { z } from "zod";
import type { AnalyzeRequestInput } from "@/core/schemas/analyzeRequest";
import { careerDiffAnalysisResultSchema } from "@/core/schemas/analysisResult";
import type { CareerDiffAnalysisResult } from "@/core/types";
import { buildAnalysisPrompt } from "./buildAnalysisPrompt";
import type { LlmAnalysisProvider } from "./LlmAnalysisProvider";

const DEFAULT_MODEL = "gpt-4o-mini";

/**
 * OpenAI Responses API + Structured Outputs
 * (docs/library-decisions/TECH_STACK_DECISIONS.md).
 *
 * Reads the key from OPENAI_API_KEY (see .env.example, left blank on
 * purpose). isConfigured() gates every call — AnalysisOrchestrator only
 * reaches generate() when a key is present, and falls back to the mock
 * result otherwise (docs/integration/ANALYSIS_FLOW.md "Mock-first
 * implementation rule").
 *
 * Not yet exercised against the real API in this repo: no OPENAI_API_KEY
 * is configured in this environment, so this path has only been verified
 * by type-checking and by dependency-injecting a fake provider in tests
 * (see AnalysisOrchestrator.test.ts). Before relying on this in
 * production, run it once with a real key and confirm the response
 * actually validates against careerDiffAnalysisResultSchema — OpenAI's
 * strict JSON schema mode has constraints (e.g. it treats every property
 * as required) that z.toJSONSchema()'s default output may not fully
 * satisfy for the `.optional()` fields in that schema.
 */
export class OpenAiAnalysisProvider implements LlmAnalysisProvider {
  isConfigured(): boolean {
    return Boolean(process.env.OPENAI_API_KEY);
  }

  async generate(input: AnalyzeRequestInput): Promise<CareerDiffAnalysisResult> {
    if (!this.isConfigured()) {
      throw new Error("OPENAI_API_KEY is not set.");
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const model = process.env.OPENAI_MODEL || DEFAULT_MODEL;
    const jsonSchema = z.toJSONSchema(careerDiffAnalysisResultSchema);

    const response = await client.responses.create({
      model,
      input: buildAnalysisPrompt(input),
      text: {
        format: {
          type: "json_schema",
          name: "career_diff_analysis_result",
          schema: jsonSchema,
          strict: true,
        },
      },
    });

    const raw: unknown = JSON.parse(response.output_text);
    return careerDiffAnalysisResultSchema.parse(raw);
  }
}
