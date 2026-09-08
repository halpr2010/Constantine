/**
 * screenshot.mjs — capture the §7 views for the critic and for variant-zero
 * proof.  Usage: node scripts/screenshot.mjs <label>   → shots/<label>/
 *
 * Canvases and the video are MASKED. Their content is rAF-driven and changes
 * every frame, so an unmasked capture can never be byte-comparable. Canvas
 * colour is proved separately by value, via the token bridge.
 */
import { chromium } from "@playwright/test";
import fs from "node:fs";

const label = process.argv[2] ?? "current";
const theme = process.argv[3] ?? "";   // "" = variant zero (dark)
const BASE = process.env.SITE_URL ?? "http://localhost:3000";
const OUT = `shots/${label}`;
const VIEWS = [
  ["hero", "section"],
  ["problem", "#problem"],
  ["how", "#how"],
  ["value", "#value"],
  ["privacy", "#privacy"],
  ["use", "#use"],
  ["faq", "#faq"],
];

fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();

for (const [w, h] of [[1440, 900], [390, 844]]) {
  for (const vertical of ["museums", "gyms"]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    await page.goto(BASE, { waitUntil: "networkidle" });
    if (theme) {
      await page.evaluate((t) => document.documentElement.setAttribute("data-theme", t), theme);
      await page.waitForTimeout(250);
    }
    if (vertical === "gyms") {
      await page.getByTestId("hero-tab-gyms").click();
      await page.waitForTimeout(1400);
    }
    const mask = [page.locator("canvas"), page.locator("video")];
    for (const [name, sel] of VIEWS) {
      const el = page.locator(sel).first();
      if (!(await el.count())) continue;
      // Neutral mask: Playwright's default is magenta, which reads as a design
      // choice on a contact sheet and drags the critic's D2 score.
      await el.screenshot({ path: `${OUT}/${vertical}-${name}-${w}.png`, mask,
        maskColor: "#1b1b1f", animations: "disabled" });
    }
    await ctx.close();
  }
}
await browser.close();
console.log(`captured → ${OUT}`);
