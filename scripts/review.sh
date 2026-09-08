#!/usr/bin/env bash
# review.sh — one full-page strip per candidate branch, for human review.
set -uo pipefail
cd "$(dirname "$0")/.."
mkdir -p shots/review
for B in "$@"; do
  git checkout -q "$B" 2>/dev/null || { echo "  skip $B"; continue; }
  npm run build > /dev/null 2>&1 || { echo "  build failed: $B"; continue; }
  pkill -f 'next-server' 2>/dev/null; sleep 1
  nohup npx next start -p 3000 > /dev/null 2>&1 &
  for i in $(seq 1 60); do curl -sf -m 5 -o /dev/null http://localhost:3000/ && break; sleep 1; done
  node -e '
    const { chromium } = require("@playwright/test");
    (async () => {
      const b = await chromium.launch();
      const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
      await p.goto("http://localhost:3000", { waitUntil: "networkidle" });
      await p.waitForTimeout(600);
      await p.screenshot({ path: `shots/review/${process.env.B}.png`, fullPage: true,
        mask: [p.locator("canvas"), p.locator("video")], maskColor: "#1b1b1f", animations: "disabled" });
      await b.close();
    })();
  ' && echo "  captured $B"
done
git checkout -q best
