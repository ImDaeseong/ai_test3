import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // Runs against a production build, not `next dev`: in this repo's dev
  // environment, Next.js 16.2.10's Turbopack dev server fails to hydrate
  // under Playwright's Chromium (confirmed directly — the DOM updates from
  // input events but no React fiber ever attaches, so no re-render ever
  // happens; a production build with the same browser hydrates correctly).
  // Manual interactive testing via `npm run dev` was unaffected, so this
  // looks like a dev-mode/HMR-specific interaction rather than an app bug,
  // but it made `next dev` unusable for automated E2E here.
  webServer: {
    command: "npm run build && npm run start -- --port 3100",
    url: "http://127.0.0.1:3100",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
