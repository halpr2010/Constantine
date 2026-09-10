/**
 * coverage.mjs — how much of each scroll frame is carrying something.
 *
 * §5's first flow requirement, in the founder's words, is that every scroll
 * surfaces something. The flow reviewer measured that by eye off
 * `shots/<side>/motion/scroll.png` and reported 81/95/56/92/43/80/33/82/54 —
 * two frames in nine more than half empty. That number was expensive to
 * produce and impossible to check, so a candidate could only assert an
 * improvement. This script computes it.
 *
 *   node scripts/coverage.mjs [port] [--frames N] [--vertical museums|gyms]
 *
 * THE MEASURE. A row of pixels is CARRYING something if it holds high-frequency
 * detail: at least `EDGE_MIN` places where an adjacent pair of pixels differs by
 * `EDGE_STEP` or more on any channel. That definition, rather than "differs from
 * the page ground", is what makes the number mean anything here — the seam is a
 * full-width vertical ramp with a radial bloom in it, so a ground-difference
 * test scores a lineless crossing as a screenful of content, which is the exact
 * defect being measured. A smooth ramp has per-pixel steps of 0-1; a glyph
 * edge, a card border or a chart rule has tens.
 *
 * Reported per frame: coverage (carrying rows / viewport rows) and the longest
 * unbroken run of empty rows, in CSS px. The second number is the one that
 * matters — 40% coverage spread evenly reads as an airy page, and 40% coverage
 * in one 420px band is a dead scroll.
 */
import { chromium } from "@playwright/test";
import sharp from "sharp";

const port = process.argv[2]?.match(/^\d+$/) ? process.argv[2] : "3000";
const arg = (k, d) => {
  const i = process.argv.indexOf(k);
  return i > 0 ? process.argv[i + 1] : d;
};
const FRAMES = Number(arg("--frames", 9));
const VERTICAL = arg("--vertical", "museums");
/**
 * Settle after each jump, ms. The default matches motion-strip.mjs, so this
 * measures the same frames the critic is shown. Raise it to separate the two
 * things a low number can mean: ground with nothing on it, or content that is
 * on screen and still arriving — a reveal caught at 0.2 has no edges for the
 * detector and none for the reader either, but the fix for it is a scroll
 * grammar question rather than a spacing one.
 */
const SETTLE = Number(arg("--settle", 450));

// Matches scripts/motion-strip.mjs, so a row here is a row there.
const W = 1280;
const H = 760;
const EDGE_STEP = 8;
const EDGE_MIN = 3;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: W, height: H } });
const page = await ctx.newPage();
await page.goto(`http://localhost:${port}`, { waitUntil: "networkidle" });
const pick = page.getByTestId(`select-${VERTICAL}`);
if (await pick.count()) {
  await pick.click();
  await page.waitForTimeout(1600);
}

const pcts = Array.from({ length: FRAMES }, (_, i) =>
  Math.round((i * 96) / (FRAMES - 1))
);

const rows = [];
for (const pct of pcts) {
  const y = await page.evaluate((q) => {
    const top = (document.body.scrollHeight - window.innerHeight) * (q / 100);
    window.scrollTo(0, top);
    return Math.round(top);
  }, pct);
  await page.waitForTimeout(SETTLE);
  const buf = await page.screenshot({
    // The same mask the strip uses: a demo canvas is replaced by a flat
    // rectangle, which still reads as carrying (it has two edges and a fill),
    // so the two measurements stay comparable.
    mask: [
      page.locator("canvas:not([data-ambient-canvas])"),
      page.locator("video"),
    ],
    maskColor: "#1b1b1f",
  });
  const { data, info } = await sharp(buf)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const carrying = new Uint8Array(info.height);
  for (let r = 0; r < info.height; r++) {
    let edges = 0;
    const base = r * info.width * 3;
    for (let c = 1; c < info.width; c++) {
      const i = base + c * 3;
      const d = Math.max(
        Math.abs(data[i] - data[i - 3]),
        Math.abs(data[i + 1] - data[i - 2]),
        Math.abs(data[i + 2] - data[i - 1])
      );
      if (d >= EDGE_STEP && ++edges >= EDGE_MIN) break;
    }
    carrying[r] = edges >= EDGE_MIN ? 1 : 0;
  }

  let n = 0;
  let run = 0;
  let worst = 0;
  let worstAt = 0;
  for (let r = 0; r < info.height; r++) {
    if (carrying[r]) {
      n++;
      run = 0;
    } else if (++run > worst) {
      worst = run;
      worstAt = r - run + 1;
    }
  }
  rows.push({
    pct,
    y,
    coverage: Math.round((100 * n) / info.height),
    band: worst,
    bandAt: worstAt,
  });
}

await ctx.close();
await browser.close();

const cov = rows.map((r) => r.coverage);
const bands = rows.map((r) => r.band);
console.log(
  `coverage — ${VERTICAL}, ${W}x${H}, ${FRAMES} frames, ${SETTLE}ms settle`
);
for (const r of rows)
  console.log(
    `  ${String(r.pct).padStart(3)}%  y=${String(r.y).padStart(6)}  ` +
      `coverage ${String(r.coverage).padStart(3)}%  ` +
      `worst empty band ${String(r.band).padStart(4)}px @ y+${r.bandAt}`
  );
console.log(`  ---`);
console.log(`  coverage: ${cov.join(", ")}`);
console.log(
  `  min coverage ${Math.min(...cov)}%   worst band ${Math.max(...bands)}px`
);
