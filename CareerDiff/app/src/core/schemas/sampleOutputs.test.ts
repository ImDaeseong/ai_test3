import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { careerDiffAnalysisResultSchema } from "./analysisResult";

/**
 * samples/*.output.json are hand-authored reference outputs used for manual web-prompt grading
 * (prompts/web-project/WEB_PROJECT_USAGE.md). They previously drifted out of sync with this schema (missing
 * retrievalContext/metadata, fewer than 3 miniProjects) without any automated check catching it.
 */
const samplesDir = path.resolve(__dirname, "../../../../samples");
const sampleFiles = readdirSync(samplesDir).filter((f) => f.endsWith(".output.json"));

describe("samples/*.output.json", () => {
  it("found at least one sample output file to check", () => {
    expect(sampleFiles.length).toBeGreaterThan(0);
  });

  for (const file of sampleFiles) {
    it(`${file} validates against careerDiffAnalysisResultSchema`, () => {
      const raw: unknown = JSON.parse(readFileSync(path.join(samplesDir, file), "utf-8"));
      const result = careerDiffAnalysisResultSchema.safeParse(raw);
      if (!result.success) {
        throw new Error(`${file} failed schema validation: ${result.error.message}`);
      }
      expect(result.data.miniProjects).toHaveLength(3);
      expect(result.data.retrievalContext.enabled).toBe(false);
      expect(result.data.metadata.persisted).toBe(false);
    });
  }
});
