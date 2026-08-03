import { link, mkdir, open, unlink } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { AnalysisValidationCase } from "@/core/validation/analysisValidationStore";

export function validationDataDirectory(): string {
  return path.resolve(process.cwd(), "..", "data");
}

export async function saveValidationCaseFile(
  validationCase: AnalysisValidationCase,
): Promise<{ filename: string; created: boolean }> {
  const directory = validationDataDirectory();
  const filename = `${validationCase.id}.json`;
  const destination = path.join(directory, filename);
  const temporary = path.join(directory, `.${validationCase.id}.${process.pid}.${randomUUID()}.tmp`);
  await mkdir(directory, { recursive: true });

  const handle = await open(temporary, "wx");
  try {
    await handle.writeFile(`${JSON.stringify(validationCase, null, 2)}\n`, "utf8");
    await handle.sync();
  } finally {
    await handle.close();
  }

  try {
    await link(temporary, destination);
    return { filename, created: true };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "EEXIST") {
      return { filename, created: false };
    }
    throw error;
  } finally {
    await unlink(temporary).catch(() => undefined);
  }
}
