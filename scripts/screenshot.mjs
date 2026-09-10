/**
 * screenshot.mjs — capture the §7 views for the critic and for variant-zero
 * proof.  Usage: node scripts/screenshot.mjs <label>   → shots/<label>/
 *
 * Canvases and the video are MASKED. Their content is rAF-driven and changes
 * every frame, so an unmasked capture can never be byte-comparable. Canvas
 * colour is proved separately by value, via the token bridge.
 *
 * ONE EXCEPTION, added with the §5 ambient field: [data-ambient-canvas] is NOT
 * masked. The field is a full-bleed canvas, so masking it replaces the entire
 * ambience with a flat grey rectangle and the critic scores the site's
 * atmosphere on a photograph of a box. A candidate whose evidence is masked is
 * unpromotable however good it is (experiments.md, 20260908-075053-2). The
 * cost is that frames carrying the field are no longer byte-comparable, which
 * is the correct trade: byte-identity was a one-off exit criterion for the
 * tokenisation session, and the ambience is a standing feature.
 */
import { chromium } from "@playwright/test";
import fs from "node:fs";
import { settleReveals } from "./settle.mjs";

const label = process.argv[2] ?? "current";
const theme = process.argv[3] ?? "";   // "" = variant zero (dark)
const BASE = process.env.SITE_URL ?? "http://localhost:3000";
const OUT = `shots/${label}`;
const name0 = "entry"; // capture the gate screen alongside the six §7 views
const VIEWS = [
  ["hero", "section"],
  ["problem", "#problem"],
  ["how", "#how"],
  ["value", "#value"],
  ["privacy", "#privacy"],
  ["use", "#use"],
  // §7 lists "integrations" among the six views the critic scores. It was
  // missing here because the section did not exist when the list was written.
  ["stack", "#stack"],
  ["outputs", "#outputs"],
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
    // The entry selector (§4) sits ahead of the hero, so every view below it is
    // unreachable until a vertical is chosen. Capture the gate itself once,
    // then answer it — otherwise the critic sees one screen and scores the
    // whole site on it, which is what happened on the first attempt.
    const gate = page.getByTestId("vertical-selector");
    if (await gate.count()) {
      if (name0 === "entry") {
        await page.screenshot({ path: `${OUT}/${vertical}-entry-${w}.png`,
          maskColor: "#1b1b1f", animations: "disabled" });
      }
      const pick = page.getByTestId(`select-${vertical}`);
      if (await pick.count()) {
        await pick.click();
      } else {
        // A candidate may name its controls differently; fall back to the
        // hero tabs so an unconventional selector still yields captures.
        const alt = page.getByTestId(`hero-tab-${vertical}`);
        if (await alt.count()) await alt.click();
      }
      await page.waitForTimeout(1600); // drift + fade must finish
    } else if (vertical === "gyms") {
      await page.getByTestId("hero-tab-gyms").click();
      await page.waitForTimeout(1400);
    }
    // After the tab click: the switcher rebuilds the sections below the hero,
    // so settling before it would settle DOM that no longer exists.
    await settleReveals(page);
    const mask = [page.locator("canvas:not([data-ambient-canvas])"), page.locator("video")];
    for (const [name, sel] of VIEWS) {
      const el = page.locator(sel).first();
      if (!(await el.count())) continue;
      // Neutral mask: Playwright's default is magenta, which reads as a design
      // choice on a contact sheet and drags the critic's D2 score.
      await el.screenshot({ path: `${OUT}/${vertical}-${name}-${w}.png`, mask,
        maskColor: "#1b1b1f", animations: "disabled" });
    }
    // The ambience is a pinned stage inside a run three viewports long, so an
    // element capture of #venue is a 3000px column of the same frame repeated.
    // Photograph the FRAME instead, at the scroll position where the object
    // has augmented twice and the field is at full strength — that is the one
    // view of this feature worth scoring. Done after the element captures,
    // which do not depend on scroll position.
    if (await page.locator("#venue").count()) {
      await page.evaluate(() => {
        const s = document.querySelector("#venue");
        window.scrollTo({
          top: s.offsetTop + (s.offsetHeight - window.innerHeight) * 0.55,
          behavior: "instant",
        });
      });
      await page.waitForTimeout(700);
      await page.screenshot({ path: `${OUT}/${vertical}-venue-${w}.png`, mask,
        maskColor: "#1b1b1f" });
    }
    await ctx.close();
  }
}
await browser.close();
console.log(`captured → ${OUT}`);
