/**
 * contact-sheet.mjs — compose the four register themes into one 2x2 sheet per
 * view, so the palette decision is made on interplay rather than on four
 * separate images.  Usage: node scripts/contact-sheet.mjs
 */
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const THEMES = [
  ["A · dark (variant zero)", "theme-a-dark"],
  ["B · white canvas + silver/purple + black technical", "theme-b-light-canvas"],
  ["C · dark canvas + silver/purple + black technical", "theme-c-dark-canvas"],
  ["D · wildcard 'instrument' (steel, inverted technical)", "theme-d-instrument"],
];
const VIEWS = ["hero", "problem", "how", "value", "privacy", "use"];
const OUT = "shots/sheets";
fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1480, height: 1000 } });

for (const vertical of ["museums", "gyms"]) {
  for (const view of VIEWS) {
    const cells = THEMES.map(([label, dir]) => {
      const p = path.resolve(`shots/${dir}/${vertical}-${view}-1440.png`);
      // Inlined as data URIs: setContent gives the page an about:blank
      // origin, which cannot load file:// images.
      if (!fs.existsSync(p)) return null;
      return { label, src: "data:image/png;base64," + fs.readFileSync(p).toString("base64") };
    }).filter(Boolean);
    if (cells.length < 4) continue;
    const html = `<!doctype html><meta charset="utf-8">
      <style>
        body{margin:0;background:#2a2a2e;font:13px/1.4 -apple-system,system-ui,sans-serif;color:#fff}
        h1{font-size:15px;margin:14px 16px 10px;font-weight:600;letter-spacing:.02em}
        .grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;padding:0 16px 16px}
        figure{margin:0}
        figcaption{padding:6px 2px;font-size:12px;color:#c8c8d0}
        img{width:100%;display:block;border:1px solid #444}
      </style>
      <h1>${vertical} · ${view} · 1440w — four register themes</h1>
      <div class="grid">${cells.map(c=>`<figure><figcaption>${c.label}</figcaption><img src="${c.src}"></figure>`).join("")}</div>`;
    await page.setContent(html, { waitUntil: "networkidle" });
    await page.screenshot({ path: `${OUT}/${vertical}-${view}.png`, fullPage: true });
  }
}
await browser.close();
console.log("sheets →", OUT);
