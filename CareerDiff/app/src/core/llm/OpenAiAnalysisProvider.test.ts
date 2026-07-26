import { describe, expect, it } from "vitest";
import { z } from "zod";
import { careerDiffAnalysisResultSchema } from "@/core/schemas/analysisResult";
import { omitNullObjectFields, toOpenAiStrictSchema } from "./OpenAiAnalysisProvider";

function expectAllObjectPropertiesRequired(node: unknown) {
  if (Array.isArray(node)) {
    node.forEach(expectAllObjectPropertiesRequired);
    return;
  }
  if (!node || typeof node !== "object") return;

  const objectNode = node as Record<string, unknown>;
  const properties = objectNode.properties;
  if (properties && typeof properties === "object" && !Array.isArray(properties)) {
    expect(objectNode.required).toEqual(Object.keys(properties));
  }
  Object.values(objectNode).forEach(expectAllObjectPropertiesRequired);
}

describe("OpenAI structured-output schema", () => {
  it("marks every object property required for strict mode", () => {
    const schema = toOpenAiStrictSchema(z.toJSONSchema(careerDiffAnalysisResultSchema));

    expectAllObjectPropertiesRequired(schema);
  });

  it("makes domain-optional fields nullable and removes returned nulls before validation", () => {
    const schema = toOpenAiStrictSchema(z.toJSONSchema(careerDiffAnalysisResultSchema));
    const senioritySchema = (
      (schema.properties as Record<string, Record<string, unknown>>).jobRequirements.properties as Record<
        string,
        unknown
      >
    ).seniority;

    expect(senioritySchema).toEqual({ anyOf: [{ type: "string" }, { type: "null" }] });
    expect(
      omitNullObjectFields({
        seniority: null,
        nested: { evidenceSnippet: null, label: "TypeScript" },
        values: [{ sourceRecordId: null, id: "req-1" }],
      }),
    ).toEqual({
      nested: { label: "TypeScript" },
      values: [{ id: "req-1" }],
    });
  });
});
