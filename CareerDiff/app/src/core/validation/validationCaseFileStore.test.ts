import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { validationDataDirectory } from "./validationCaseFileStore";

describe("validationDataDirectory", () => {
  const original = process.env.CAREERDIFF_DATA_DIR;

  afterEach(() => {
    if (original === undefined) delete process.env.CAREERDIFF_DATA_DIR;
    else process.env.CAREERDIFF_DATA_DIR = original;
  });

  it("defaults to the sibling data folder when no override is set", () => {
    delete process.env.CAREERDIFF_DATA_DIR;
    expect(validationDataDirectory().endsWith(`${path.sep}data`)).toBe(true);
  });

  it("honors CAREERDIFF_DATA_DIR so tests and E2E never touch the real data folder", () => {
    const isolated = path.join(process.cwd(), "tmp-test-data");
    process.env.CAREERDIFF_DATA_DIR = isolated;
    expect(validationDataDirectory()).toBe(path.resolve(isolated));
  });
});
