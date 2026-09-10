/**
 * variants-sheet.mjs — one image showing every admitted variant, ranked, with
 * the reference strip above them for comparison.
 *
 * The founder is choosing between approaches across up to eight options; eight
 * separate browser tabs is not a way to compare, and the ranking critic's
 * "what makes this different" line has to sit next to the thing it describes.
 */
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const V = process.argv[2] ?? ".loop/variants.json";
const v = JSON.parse(fs.readFileSync(V, "utf8"));
const admitted = (v.admitted ?? []).sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99));
if (!admitted.length) { console.log("no admitted variants"); process.exit(0); }

const uri = (p) => fs.existsSync(p)
  ? "data:image/png;base64," + fs.readFileSync(p).toString("base64") : null;

// Prefer the scroll strip: it shows the whole journey rather than one screen,
// which is what most of these attributes actually change.
const shotFor = (b) => uri(path.resolve(`shots/${b}/motion/scroll.png`))
  ?? uri(path.resolve(`shots/${b}/dark/museums-hero-1440.png`))
  ?? uri(path.resolve(`shots/${b}/strips/A-dark.png`));

const cells = admitted.map((a) => ({ ...a, src: shotFor(a.branch) })).filter((c) => c.src);
const cols = Math.min(4, cells.length);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 420 * cols + 60, height: 1200 } });
await page.setContent(`<!doctype html><meta charset="utf-8"><style>
  body{margin:0;background:#1c1c20;font:13px/1.45 -apple-system,system-ui,sans-serif;color:#fff}
  h1{font-size:17px;margin:18px 20px 2px}
  .sub{margin:0 20px 16px;color:#9a9aa4;font-size:12px}
  .grid{display:grid;grid-template-columns:repeat(${cols},1fr);gap:16px;padding:0 20px 20px}
  figure{margin:0}
  .rank{display:inline-block;background:#1d4ed8;border-radius:4px;padding:2px 8px;font-weight:600;margin-bottom:6px}
  .score{color:#9a9aa4;margin-left:8px;font-weight:400}
  img{width:100%;display:block;border:1px solid #4a4a52;background:#111}
  figcaption{padding:7px 2px;font-size:12px;color:#d2d2d8}
  .gap{color:#9a9aa4;font-size:11px;display:block;margin-top:4px}
</style>
<h1>${v.attribute ?? "variants"} — ${cells.length} option(s) that cleared the bar</h1>
<p class="sub">Ranked by distance from the 10/10 reference. Grey blocks are masked canvas/video, a capture artefact. Each caption says what makes that option DIFFERENT, not what it does.</p>
<div class="grid">${cells.map((c) => `<figure>
  <div><span class="rank">#${c.rank ?? "?"}</span><span class="score">${c.score ?? ""}</span></div>
  <img src="${c.src}">
  <figcaption>${(c.approach ?? "").replace(/</g, "&lt;")}
    <span class="gap">gap: ${(c.gap ?? "").replace(/</g, "&lt;")}</span>
  </figcaption>
</figure>`).join("")}</div>`, { waitUntil: "load" });
fs.mkdirSync("shots", { recursive: true });
await page.screenshot({ path: "shots/variants.png", fullPage: true });
await browser.close();
console.log(`variants sheet → shots/variants.png (${cells.length})`);
