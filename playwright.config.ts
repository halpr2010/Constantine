import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests",
  webServer: {
    command: "npm run build && npm run start",
    url: "http://localhost:3000",
    timeout: 180_000,
    reuseExistingServer: true,
  },
});
