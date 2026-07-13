import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/playwright",
  timeout: 30_000,
  fullyParallel: true,
  outputDir: "test-results/playwright",
  reporter: [["list"]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    storageState: process.env.PLAYWRIGHT_AUTH_STATE || undefined,
    trace: "retain-on-failure",
  },
});
