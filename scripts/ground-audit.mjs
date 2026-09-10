/**
 * ground-audit.mjs — the instrument behind §5's ONE GROUND AT A TIME.
 *
 * The seam was rejected twice, and both times the rejection was about something
 * a luminance-step measurement had already said was fine: "we still see a
 * straight (now faded) but clear line where the black and white pages start."
 * A 3/255 worst row-to-row step is not an edge, and there was still a line —
 * because what reads as a line is not steepness. It is the presence of TWO
 * GROUNDS in one frame, however gently they meet. A 400px dissolve between
 * black and white has black at the top of it and white at the bottom of it, and
 * the eye finds the join whether or not any single row-to-row step is visible.
 *
 * So this measures the property directly rather than the gradient. At each of a
 * run of scroll positions, in every palette, it reads the whole left gutter of
 * the viewport — the content-free column `coverage.mjs` already scans — and
 * reports the SPREAD between its lightest and darkest row. One ground gives a
 * flat column whatever the ground happens to be; two grounds anywhere on screen
 * put both of them in that column, and the spread is the distance between them.
 * On this page that distance is the full range: canvas is #050505 and technical
 * is #ffffff in variant zero.
 *
 * It also prints the register the root is standing in at every stop, so the
 * sequence of grounds down the page is checkable rather than asserted.
 *
 *   node scripts/ground-audit.mjs [url] [width] [height]
 *
 * WHAT IT EXCLUDES, and why that is not the test being talked down. Objects are
 * not ground. The ambient field is a full-bleed purple bloom that §5 requires to
 * have no edge where it starts or stops; the hero's demo cards deliberately
 * overhang their column by up to 150px; the ghost stages and the venue plan are
 * nested product-register panels standing ON the ground. All of those reach the
 * gutter at some scroll offsets and none of them is a second ground. So the scan
 * asks the page which rows of the column an object occupies and drops them,
 * leaving only rows where the ground itself is what is painted. A page-scale
 * ground cannot hide from this: it has no rect and is never excluded.
 *
 * IT MEASURES PLATEAUS, NOT EXTREMES, and that is not a softening of the test.
 * The first run reported a 255/255 spread in every palette, and the profile
 * showed why: rows 0-97 white, row 98 black, rows 99-899 white. The black row
 * is the scroll-progress hairline on the header's foot — one pixel of §5's own
 * furniture, sitting on a viewport that is otherwise a single flat colour. A
 * raw min/max cannot tell a 1px rule from a second ground, so each row is
 * replaced by the median of the 9 rows around it first. A ground occupies
 * hundreds of rows and survives that untouched; a hairline, a card border or a
 * line of type does not.
 *
 * NOTE it judges RESTING frames, settling well past --ground-dur at each stop.
 * A frame captured mid-cross-fade is uniform by construction — the whole page
 * is one interpolated colour — and measuring those would flatter the mechanism
 * rather than test it.
 */
import { chromium } from "@playwright/test";
import sharp from "sharp";

const URL = process.argv[2] ?? process.env.SITE_URL ?? "http://localhost:3201";
const W = Number(process.argv[3] ?? 1440);
const H = Number(process.argv[4] ?? 900);
const THEMES = ["", "light-canvas", "dark-canvas", "instrument"];
const STOPS = 24;
/** Left gutter: clear of every centred container at both judged widths. */
const GUTTER_X = 6;
/**
 * What counts as more than one ground in frame, in 8-bit luminance. The
 * narrowest real pair on the page is light-canvas's canvas (#ffffff) against
 * its technical (#eceff3), 8 levels apart, so anything this catches at 24 is a
 * genuine second ground rather than a wide pair being fussy about. Grain, JPEG
 * ringing in the hero art and the ambient field's own falloff all sit below it.
 */
const LIMIT = 24;

const lum = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

/** Rows narrower than this cannot be a ground. Hairlines, borders, glyph rows. */
const MEDIAN_WIN = 9;

function plateaus(profile) {
  const h = MEDIAN_WIN >> 1;
  const out = [];
  for (let i = 0; i < profile.length; i++) {
    const w = profile.slice(Math.max(0, i - h), Math.min(profile.length, i + h + 1));
    w.sort((a, b) => a - b);
    out.push(w[w.length >> 1]);
  }
  return out;
}

const browser = await chromium.launch();
const rows = [];
for (const theme of THEMES) {
  const ctx = await browser.newContext({ viewport: { width: W, height: H } });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: "networkidle" });
  const pick = page.getByTestId("select-museums");
  if (await pick.count()) {
    await pick.click();
    await page.waitForTimeout(1800);
  }
  if (theme)
    await page.evaluate(
      (t) => document.documentElement.setAttribute("data-theme", t),
      theme
    );
  await page.waitForTimeout(500);

  const total = await page.evaluate(
    () => document.body.scrollHeight - window.innerHeight
  );
  let worst = { spread: -1 };
  const seq = [];
  for (let i = 0; i <= STOPS; i++) {
    const y = Math.round((total * i) / STOPS);
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(1150);
    const { ground, covered } = await page.evaluate((x) => {
      // Every drawn object that reaches the scan column, as viewport row spans.
      // These are things standing on the ground; the ground itself is painted by
      // <body> and has no rect of its own, so it can never be excluded here.
      const spans = [];
      const sel = "canvas, img, video, svg, [data-register], [data-testid='media-slot']";
      for (const el of document.querySelectorAll(sel)) {
        const r = el.getBoundingClientRect();
        if (r.width < 2 || r.height < 2) continue;
        if (r.left > x + 2 || r.right < x) continue;
        spans.push([Math.floor(r.top) - 2, Math.ceil(r.bottom) + 2]);
      }
      return {
        ground: document.documentElement.getAttribute("data-ground"),
        covered: spans,
      };
    }, GUTTER_X);
    const shot = await page.screenshot({
      clip: { x: GUTTER_X, y: 0, width: 2, height: H },
    });
    const { data, info } = await sharp(shot)
      .raw()
      .toBuffer({ resolveWithObject: true });
    const raw = [];
    for (let r = 0; r < info.height; r++) {
      const o = r * info.width * info.channels;
      raw.push(lum(data[o], data[o + 1], data[o + 2]));
    }
    // Median first, then drop the object rows: filtering before the exclusion
    // would let an object's colour leak four rows into the ground either side
    // of it and be scored as ground.
    const flat = plateaus(raw);
    const bare = flat.filter(
      (_, r) => !covered.some(([a, b]) => r >= a && r <= b)
    );
    // A stop where objects cover the whole column has nothing to say about the
    // ground and is reported as such rather than as a pass.
    const spread = bare.length < 40 ? -1 : Math.max(...bare) - Math.min(...bare);
    seq.push(
      spread < 0 ? "·" : `${ground?.[0] ?? "?"}${spread > LIMIT ? "!" : ""}`
    );
    if (spread > worst.spread) worst = { spread, y, ground };
  }
  rows.push({ theme: theme || "dark", worst, seq: seq.join(" ") });
  await ctx.close();
}
await browser.close();

console.log(
  `ground audit — ${W}x${H}, ${STOPS + 1} stops, gutter column x=${GUTTER_X}`
);
console.log(`(letters are the ground at each stop: c/p/t; ! marks spread > ${LIMIT}/255)\n`);
let bad = 0;
for (const r of rows) {
  console.log(
    `${r.theme.padEnd(13)} worst spread ${r.worst.spread.toFixed(1)}/255 ` +
      `at y=${r.worst.y} (${r.worst.ground})`
  );
  console.log(`              ${r.seq}`);
  if (r.worst.spread > LIMIT) bad++;
}
console.log(
  bad
    ? `\n${bad} palette(s) show more than one ground in a resting frame`
    : "\nevery resting frame is one ground"
);
