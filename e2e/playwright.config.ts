import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 10 * 60 * 1000,
  retries: 1,
  use: {
    headless: true,
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
});
