/**
 * rm-audit.mjs — what is still moving under prefers-reduced-motion.
 *
 * The gate samples ONE canvas inside ONE exhibit card, so it can pass while the
 * rest of the page keeps redrawing. This walks the whole document instead: at
 * each scroll offset it takes two viewport screenshots 600ms apart WITHOUT
 * touching anything in between, and reports the ones that differ. Element
 * screenshots are deliberately not used — Playwright scrolls an element into
 * view before shooting it, which moves the page between the two samples and
 * reports every scroll-positioned drawing as moving.
 *
 * It also counts requestAnimationFrame callbacks, which is the half the pixel
 * check cannot see: a loop that spins without painting is still a loop the
 * preference asked us not to run.
 *
 *   node scripts/rm-audit.mjs [url] [width] [museums|gyms]
 */
import { chromium } from "@playwright/test";
import { createHash } from "crypto";

const BASE = process.argv[2] ?? process.env.SITE_URL ?? "http://localhost:3000";
const WIDTH = Number(process.argv[3] ?? 1440);

const browser = await chromium.launch();
const ctx = await browser.newContext({
  reducedMotion: "reduce",
  viewport: { width: WIDTH, height: WIDTH < 500 ? 844 : 900 },
});
const page = await ctx.newPage();
// Installed before any page script, so a loop started at hydration is counted.
await page.addInitScript(() => {
  window.__raf = 0;
  const orig = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = (cb) =>
    orig((t) => {
      window.__raf++;
      return cb(t);
    });
});
await page.goto(BASE, { waitUntil: "networkidle" });

// The gym demos (the bench wireframe and the stairmaster clip) only mount live
// on their own vertical, so both have to be walked.
const VERTICAL = process.argv[4] ?? "museums";
if (VERTICAL === "gyms") {
  await page.getByTestId("hero-tab-gyms").click();
  await page.waitForTimeout(1200); // the tab crossfade is 400/140/400
  await page.mouse.move(4, 4); // out of every card's reach, then left alone
  await page.waitForTimeout(1500);
}

const H = await page.evaluate(() => document.body.scrollHeight);
const step = Math.round(page.viewportSize().height * 0.9);
const offsets = [];
for (let y = 0; y < H - step; y += step) offsets.push(y);

const shot = async () =>
  createHash("sha256").update(await page.screenshot()).digest("hex");

let moving = 0;
for (const y of offsets) {
  await page.evaluate((v) => window.scrollTo(0, v), y);
  await page.waitForTimeout(900);
  const before = await shot();
  const r0 = await page.evaluate(() => window.__raf);
  await page.waitForTimeout(600);
  const r1 = await page.evaluate(() => window.__raf);
  const after = await shot();
  const anims = await page.evaluate(
    () => document.getAnimations().filter((a) => a.playState === "running").length
  );
  const still = before === after;
  if (!still) moving++;
  console.log(
    `y=${String(y).padStart(5)}  frame ${still ? "identical" : "CHANGED  "}` +
      `  rAF/600ms=${String(r1 - r0).padStart(3)}  running-animations=${anims}`
  );
}
console.log(moving ? `${moving} offset(s) still moving` : "page is still");

await browser.close();
