import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { careerDiffAnalysisResultSchema } from "./analysisResult";

/**
 * samples/*.output.json is a scratch space (ai-prompts/claude-projects-test/사용법.md) where the
 * user pastes ad-hoc web-Project outputs to check them against the schema. It is gitignored and
 * normally empty, so this suite must pass with zero files and only validate whatever is dropped in.
 */
const samplesDir = path.resolve(__dirname, "../../../../samples");
const sampleFiles = existsSync(samplesDir)
  ? readdirSync(samplesDir).filter((f) => f.endsWith(".output.json"))
  : [];

describe("samples/*.output.json", () => {
  if (sampleFiles.length === 0) {
    it.skip("no sample output files present — nothing to validate", () => {});
    return;
  }

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
