import { expect, test } from "@playwright/test";

const JOB_DESCRIPTION =
  "우리는 TypeScript와 Node.js로 백엔드 서비스를 구축할 백엔드 엔지니어를 찾고 있습니다. PostgreSQL과 AWS 경험이 필요합니다.";
const CANDIDATE_PROFILE =
  "2년간 TypeScript와 Node.js로 백엔드 서비스를 운영했습니다. PostgreSQL 기반 리포팅 서비스의 스키마를 설계했습니다.";

test.describe("CareerDiff analyzer flow", () => {
  test("shows the privacy notice and per-field sensitive-data warning before any input", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("CareerDiff는 기본적으로 이력서나 채용공고를 저장하지 않습니다.")).toBeVisible();
    await expect(page.getByText("비밀번호, 토큰, 사내 전용 식별자 등 민감 정보는 붙여넣지 마세요.")).toBeVisible();
  });

  test("blocks the analyze button until both fields have enough text (docs/features/01, 02)", async ({ page }) => {
    await page.goto("/");
    const analyzeButton = page.getByRole("button", { name: "분석하기" });
    await expect(analyzeButton).toBeDisabled();

    await page.getByLabel("채용공고").fill("short");
    await expect(analyzeButton).toBeDisabled();

    await page.getByLabel("채용공고").fill(JOB_DESCRIPTION);
    await expect(analyzeButton).toBeDisabled();

    await page.getByLabel("이력서 / 커리어 / 프로젝트").fill(CANDIDATE_PROFILE);
    await expect(analyzeButton).toBeEnabled();
  });

  test("runs a full analysis and renders all MVP dashboard sections (docs/features/10)", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });

    await page.goto("/");
    await page.getByLabel("채용공고").fill(JOB_DESCRIPTION);
    await page.getByLabel("이력서 / 커리어 / 프로젝트").fill(CANDIDATE_PROFILE);
    await page.getByRole("button", { name: "분석하기" }).click();

    await expect(page.getByRole("heading", { name: "적합도 점수" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "채용 요건" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "매칭 결과" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "이력서 개선 제안" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "보완 프로젝트 추천" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "면접 준비" })).toBeVisible();

    // docs/features/08: exactly 3 mini project recommendations.
    const miniProjectCards = page.locator("article");
    await expect(miniProjectCards).toHaveCount(3);

    expect(consoleErrors).toEqual([]);
  });

  test("shows a validation error for an empty API request without crashing the UI", async ({ page, request }) => {
    const response = await request.post("/api/analyze", { data: { jobDescription: "", candidateProfile: "" } });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error.code).toBe("VALIDATION_ERROR");

    // The page itself should still be usable after a failed request path exists.
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "CareerDiff" })).toBeVisible();
  });
});
