import { defineConfig } from "@playwright/test";

// Port is parameterised so candidates can be gated in parallel, each in its own
// git worktree on its own port. Everything hardcoded 3000, which forced the
// whole burst to run one candidate at a time — ~50 minutes each, while the
// builders sit waiting on the model rather than on CPU.
const PORT = process.env.PORT ?? "3000";

export default defineConfig({
  testDir: "tests",
  webServer: {
    command: `npm run build && npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    timeout: 180_000,
    reuseExistingServer: true,
  },
});
