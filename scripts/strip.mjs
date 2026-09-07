// One full-page strip per theme, so the register rhythm down the scroll is visible.
import { chromium } from "@playwright/test";
import fs from "node:fs";
fs.mkdirSync("shots/strips", { recursive: true });
const browser = await chromium.launch();
for (const [label, theme] of [["A-dark",""],["B-light-canvas","light-canvas"],["C-dark-canvas","dark-canvas"],["D-instrument","instrument"]]) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  if (theme) { await page.evaluate(t => document.documentElement.setAttribute("data-theme", t), theme); await page.waitForTimeout(300); }
  await page.screenshot({ path: `shots/strips/${label}.png`, fullPage: true,
    mask: [page.locator("canvas"), page.locator("video")], maskColor: "#1b1b1f", animations: "disabled" });
  await ctx.close();
}
await browser.close();
console.log("strips → shots/strips");
