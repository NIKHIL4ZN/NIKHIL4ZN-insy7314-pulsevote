import { defineConfig } from "@playwright/test";

export default defineConfig({
  workers: 1,
  testDir: "./tests/e2e",
  fullyParallel: true,
  reporter: [["html", { open: "never" }]],

  use: {
    baseURL: "https://localhost:5173",
    ignoreHTTPSErrors: true,
    trace: "on-first-retry"
  },

  webServer: {
    command: "npm run dev -- --host 0.0.0.0",
    url: "https://localhost:5173",
    reuseExistingServer: true,
    ignoreHTTPSErrors: true,
    timeout: 120000
  }
});