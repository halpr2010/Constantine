/**
 * motion-strip.mjs — motion evidence for the critic.
 *
 * The rubric is comparative and the evidence was static, so a feature whose
 * entire value is movement could never win: an ambient field that drifts and
 * one that is frozen produce identical screenshots. Two candidates were
 * rejected on five ties before this existed.
 *
 * Two strips per side:
 *   drift-*  — six frames over six seconds with NO input. Autonomous motion.
 *   scroll-* — frames indexed by SCROLL POSITION, not time, because
 *              scroll-linked reveals bind to position; a time-based capture
 *              mixes the recorder's scrolling speed into the evidence.
 *
 *   node scripts/motion-strip.mjs <label> <port>
 */
import { chromium } from "@playwright/test";
import { execFileSync } from "node:child_process";
import fs from "node:fs";

const label = process.argv[2] ?? "candidate";
const port = process.argv[3] ?? "3000";
const OUT = `shots/${label}/motion`;
const TMP = `${OUT}/.raw`;
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(TMP, { recursive: true });

const browser = await chromium.launch();

// 1 · autonomous drift, no input at all
{
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 760 },
    recordVideo: { dir: TMP, size: { width: 1280, height: 760 } },
  });
  const p = await ctx.newPage();
  await p.goto(`http://localhost:${port}`, { waitUntil: "networkidle" });
  await p.waitForTimeout(6000);
  await ctx.close();
  const v = fs.readdirSync(TMP).find((f) => f.endsWith(".webm"));
  execFileSync("ffmpeg", ["-y", "-v", "error", "-i", `${TMP}/${v}`,
    "-vf", "fps=6/6,scale=520:-1,crop=520:210:0:60,tile=2x3:padding=6:margin=6:color=0x232327",
    "-frames:v", "1", `${OUT}/drift.png`]);
  fs.rmSync(`${TMP}/${v}`);
}

// 2 · the entry selection transition, if a selector exists. The reference's
//     defining behaviour is the tab drifting to the top right while the chosen
//     view fades in, and neither a still nor a scroll strip can show it.
{
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 760 },
    recordVideo: { dir: TMP, size: { width: 1280, height: 760 } },
  });
  const p = await ctx.newPage();
  await p.goto(`http://localhost:${port}`, { waitUntil: "networkidle" });
  const gate = p.getByTestId("vertical-selector");
  let recorded = false;
  if (await gate.count()) {
    await p.waitForTimeout(700);
    const pick = p.getByTestId("select-museums");
    if (await pick.count()) { await pick.hover(); await p.waitForTimeout(500); await pick.click(); }
    await p.waitForTimeout(2600);
    recorded = true;
  }
  await ctx.close();
  const v = fs.readdirSync(TMP).find((f) => f.endsWith(".webm"));
  if (v && recorded) {
    execFileSync("ffmpeg", ["-y", "-v", "error", "-i", `${TMP}/${v}`,
      "-vf", "fps=12/4,scale=420:-1,tile=3x4:padding=6:margin=6:color=0x232327",
      "-frames:v", "1", `${OUT}/select.png`]);
  }
  if (v) fs.rmSync(`${TMP}/${v}`);
}

// 3 · scroll-indexed reveal
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 760 } });
  const p = await ctx.newPage();
  await p.goto(`http://localhost:${port}`, { waitUntil: "networkidle" });
  const g = p.getByTestId("vertical-selector");
  if (await g.count()) {
    const pick = p.getByTestId("select-museums");
    if (await pick.count()) await pick.click();
    await p.waitForTimeout(1600);
  }
  const shots = [];
  for (const pct of [0, 12, 24, 36, 48, 60, 72, 84, 96]) {
    await p.evaluate((q) => {
      window.scrollTo(0, (document.body.scrollHeight - window.innerHeight) * (q / 100));
    }, pct);
    // Long enough for a reveal to play, short enough to catch a stagger.
    await p.waitForTimeout(450);
    const f = `${TMP}/s${String(pct).padStart(3, "0")}.png`;
    await p.screenshot({ path: f, mask: [p.locator("canvas"), p.locator("video")], maskColor: "#1b1b1f" });
    shots.push(f);
  }
  await ctx.close();
  execFileSync("ffmpeg", ["-y", "-v", "error", "-pattern_type", "glob", "-i", `${TMP}/s*.png`,
    "-vf", "scale=420:-1,tile=3x3:padding=6:margin=6:color=0x232327",
    "-frames:v", "1", `${OUT}/scroll.png`]);
  for (const f of shots) fs.rmSync(f);
}

await browser.close();
fs.rmSync(TMP, { recursive: true, force: true });
console.log(`motion strips → ${OUT}`);
