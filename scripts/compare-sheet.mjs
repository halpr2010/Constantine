/**
 * compare-sheet.mjs — compose the pairwise evidence the critic actually needs.
 *
 * capture.sh emits 100 PNGs per candidate; 200 loose files would swamp the
 * critic's context and, worse, invite it to judge images one at a time when
 * the rubric is explicitly comparative. Each sheet here is one view, at one
 * width, in one vertical: four palettes across, best above candidate below.
 * The comparison the critic is asked to make is the one it can see.
 *
 *   node scripts/compare-sheet.mjs            → shots/compare/
 */
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const THEMES = [
  ["A · dark", "dark"],
  ["B · light canvas", "light-canvas"],
  ["C · dark canvas", "dark-canvas"],
  ["D · instrument", "instrument"],
];
const VIEWS = ["hero", "problem", "how", "value", "privacy", "use"];
const OUT = "shots/compare";

const uri = (p) =>
  fs.existsSync(p) ? "data:image/png;base64," + fs.readFileSync(p).toString("base64") : null;

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1800, height: 1200 } });
let n = 0;

for (const vertical of ["museums", "gyms"]) {
  for (const view of VIEWS) {
    for (const width of [1440, 390]) {
      const rows = [];
      for (const side of ["best", "candidate"]) {
        const cells = THEMES.map(([label, dir]) => ({
          label,
          src: uri(path.resolve(`shots/${side}/${dir}/${vertical}-${view}-${width}.png`)),
        }));
        if (cells.some((c) => !c.src)) { rows.length = 0; break; }
        rows.push({ side, cells });
      }
      if (rows.length !== 2) continue;

      const html = `<!doctype html><meta charset="utf-8"><style>
        body{margin:0;background:#232327;font:13px/1.4 -apple-system,system-ui,sans-serif;color:#fff}
        h1{font-size:16px;margin:16px 18px 4px;font-weight:600}
        .sub{margin:0 18px 12px;font-size:12px;color:#9a9aa4}
        .row{padding:0 18px 18px}
        .side{font-size:13px;font-weight:600;margin:10px 0 8px;padding:4px 10px;
              display:inline-block;border-radius:4px}
        .best{background:#3a3a44}.cand{background:#1d4ed8}
        .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
        figure{margin:0}
        figcaption{padding:5px 2px;font-size:11px;color:#c0c0c8}
        img{width:100%;display:block;border:1px solid #4a4a52;background:#111}
      </style>
      <h1>${view} · ${vertical} · ${width}w</h1>
      <p class="sub">Four palettes across. Grey blocks are masked canvas/video — a capture artefact, not a blank element.</p>
      ${rows.map((r) => `<div class="row">
        <div class="side ${r.side === "best" ? "best" : "cand"}">${r.side.toUpperCase()}</div>
        <div class="grid">${r.cells.map((c) =>
          `<figure><img src="${c.src}"><figcaption>${c.label}</figcaption></figure>`).join("")}</div>
      </div>`).join("")}`;

      await page.setContent(html, { waitUntil: "load" });
      await page.screenshot({ path: `${OUT}/${vertical}-${view}-${width}.png`, fullPage: true });
      n++;
    }
  }
}
await browser.close();
console.log(`compare sheets → ${OUT} (${n})`);
