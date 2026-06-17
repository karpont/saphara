import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 30000,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  // CI'da web+api'yi ayaga kaldir
  webServer: process.env.CI ? {
    command: "pnpm --filter @saphara/web start",
    url: "http://localhost:3000",
    reuseExistingServer: false,
    timeout: 120000,
  } : undefined,
});
