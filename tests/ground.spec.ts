/**
 * ground.spec.ts — the floor under §5 requirement 1, ONE GROUND AT A TIME.
 *
 * The requirement was rewritten on 10 Sep 2026 after the founder rejected the
 * per-section seam twice. It is now a structural claim rather than a tuning
 * one: the whole page carries a single ground, and crossing a threshold
 * cross-fades that ground while the foreground inverts with it. A boundary
 * between two grounds must never be able to appear on screen.
 *
 * That claim is testable in a way the old one was not. The old seam could only
 * be measured for softness — worst row-to-row luminance step — and it scored
 * 3/255 while the founder was still looking at a line. What follows asserts the
 * structure instead, in four parts:
 *
 *  1. NOTHING BUT THE PAGE PAINTS A PAGE-SCALE GROUND. If a section ever gets
 *     its background back, a boundary exists again the moment two sections are
 *     on screen together, however the crossing is animated.
 *  2. THE PAGE ACTUALLY CHANGES GROUND, and each change agrees with the section
 *     that declared it. A single ground for the whole document would satisfy
 *     rule 1 trivially and lose the register rhythm §5 is built on.
 *  3. TEXT CLEARS AA ON THE GROUND IT IS ACTUALLY READ ON. This is the floor
 *     the new architecture needs and the old one did not. Content authored for
 *     one register is now read on whichever ground is current, which at a
 *     crossing means the outgoing section's copy is read on the incoming
 *     section's ground. tests/themes.spec.ts samples the page at one scroll
 *     position; this samples what is on screen at each of the page's grounds.
 *  4. UNDER prefers-reduced-motion THE GROUND IS SETTLED, never mid-fade. §5
 *     asks for a static AND complete page, and half a cross-fade is neither.
 */

import { test, expect, Page } from "@playwright/test";

const BASE = process.env.SITE_URL ?? "http://localhost:3000";
const THEMES = ["", "light-canvas", "dark-canvas", "instrument"] as const;
const themeName = (t: string) => t || "dark (variant zero)";

async function enter(page: Page) {
  await page.goto(BASE, { waitUntil: "networkidle" });
  const pick = page.getByTestId("select-museums");
  if (await pick.count()) {
    await pick.click();
    await page.waitForTimeout(1600);
  }
}

/**
 * Scroll to a position where each declared ground is the current one, and hand
 * back the offsets. Read off the live document rather than hardcoded, because
 * the page's length changes with every content edit.
 */
async function groundStops(page: Page) {
  return page.evaluate(() => {
    const decls = Array.from(
      document.querySelectorAll<HTMLElement>('main [data-ground]')
    );
    const stops: Record<string, number> = {};
    for (const el of decls) {
      const g = el.dataset.ground!;
      if (g in stops) continue;
      const r = el.getBoundingClientRect();
      const top = r.top + window.scrollY;
      // Land the section's own middle on the sample line, so the ground is
      // unambiguously this one and the frame is a frame a reader would see.
      stops[g] = Math.max(
        0,
        Math.round(top + Math.min(r.height, window.innerHeight) / 2 - window.innerHeight / 2)
      );
    }
    return stops;
  });
}

test("no section paints a ground of its own", async ({ page }) => {
  await enter(page);
  const painters = await page.evaluate(() => {
    const bad: string[] = [];
    for (const el of Array.from(
      document.querySelectorAll<HTMLElement>("main > section, main > footer")
    )) {
      const bg = getComputedStyle(el).backgroundColor;
      // Anything opaque here is a second ground, and two of them on screen at
      // once is the boundary the founder rejected twice.
      const m = bg.match(/rgba?\(([^)]+)\)/);
      const a = m ? Number(m[1].split(",")[3] ?? 1) : 1;
      if (a > 0.02) bad.push(`${el.id || el.tagName} — ${bg}`);
    }
    return bad;
  });
  expect(painters, "a top-level section is painting its own ground").toEqual([]);
});

test("the page changes ground, and only where a section declares it", async ({
  page,
}) => {
  await enter(page);
  const seen = await page.evaluate(async () => {
    const out: { ground: string; declared: string }[] = [];
    const H = document.body.scrollHeight - window.innerHeight;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    for (let i = 0; i <= 16; i++) {
      window.scrollTo(0, (H * i) / 16);
      await wait(1000); // clear of --ground-dur, so nothing is mid-fade
      // Re-derive the expected answer independently of the driver: the last
      // in-flow declaration whose top edge has passed the middle of the screen.
      const line = window.innerHeight * 0.5;
      let declared = "";
      for (const el of Array.from(
        document.querySelectorAll<HTMLElement>('[data-ground]:not([data-state="leaving"])')
      )) {
        if (el.getBoundingClientRect().top > line) break;
        declared = el.dataset.ground ?? declared;
      }
      out.push({
        ground: document.documentElement.getAttribute("data-ground") ?? "",
        declared,
      });
    }
    return out;
  });
  const disagree = seen
    .map((s, i) => ({ ...s, i }))
    .filter((s) => s.declared && s.ground !== s.declared);
  expect(disagree, "the root ground disagrees with the section under the sample line").toEqual([]);
  expect(
    new Set(seen.map((s) => s.ground)).size,
    `the page never changes ground: ${seen.map((s) => s.ground).join(",")}`
  ).toBeGreaterThan(1);
});

test("the ground is settled, not mid-fade, under prefers-reduced-motion", async ({
  browser,
}) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await enter(page);
  const state = await page.evaluate(async () => {
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const H = document.body.scrollHeight - window.innerHeight;
    const armed: string[] = [];
    for (let i = 0; i <= 8; i++) {
      window.scrollTo(0, (H * i) / 8);
      // Deliberately short: under the preference the ground must already be
      // resolved on the next frame, with nothing to wait out.
      await wait(120);
      if (document.documentElement.hasAttribute("data-ground-fade"))
        armed.push(`stop ${i}`);
      const running = document.documentElement
        .getAnimations()
        .filter((a) => a.playState === "running");
      if (running.length) armed.push(`stop ${i}: ${running.length} running`);
    }
    return armed;
  });
  expect(state, "the ground animates under prefers-reduced-motion").toEqual([]);
  await ctx.close();
});

/**
 * The AA sampler, narrowed to what is on screen.
 *
 * The floors are tests/themes.spec.ts's — 4.5:1 for body copy, 3:1 for large
 * text and lone glyphs, translucent fills composited rather than skipped —
 * because the two have to agree about what "legible" means.
 *
 * The effective background is resolved differently, and it has to be. That spec
 * walks ancestors and then adds any absolutely-positioned element whose box
 * covers the sample point, which cannot tell what is in front of what: the
 * docked vertical track is a FIXED sibling of the header, painted above it at
 * z-index 60, and an ancestors-plus-boxes model scores its black label against
 * the dark header ground behind it at 1.09:1 while the reader is looking at
 * black on white. This asks the browser for its own paint order with
 * elementsFromPoint and composites everything at or below the element, so
 * z-index, stacking contexts and transforms are the engine's problem rather
 * than a model's. Nothing here is more forgiving — a genuinely hidden ground
 * still resolves to what is actually painted.
 */
async function viewportSamples(page: Page) {
  return page.evaluate(() => {
    const cv = document.createElement("canvas");
    cv.width = cv.height = 1;
    const cx = cv.getContext("2d", { willReadFrequently: true })!;
    cx.globalCompositeOperation = "copy";
    const parse = (s: string): number[] | null => {
      if (!s || s === "none") return null;
      cx.fillStyle = "#000";
      cx.fillStyle = s;
      cx.fillRect(0, 0, 1, 1);
      const d = cx.getImageData(0, 0, 1, 1).data;
      return [d[0], d[1], d[2], d[3] / 255];
    };
    const over = (fg: number[], bg: number[]) => {
      const a = fg[3];
      return [0, 1, 2].map((i) => fg[i] * a + bg[i] * (1 - a)).concat(1);
    };
    /** The centre of the part of `el` that is actually on screen. */
    const point = (r: DOMRect) => [
      Math.min(Math.max((Math.max(r.left, 0) + Math.min(r.right, innerWidth)) / 2, 1), innerWidth - 1),
      Math.min(Math.max((Math.max(r.top, 0) + Math.min(r.bottom, innerHeight)) / 2, 1), innerHeight - 1),
    ];

    const ground = (el: Element, r: DOMRect): number[] => {
      const [px, py] = point(r);
      // Topmost first. Everything from the far end up to and including `el` is
      // painted at or beneath it; anything above `el` in this list is in front
      // of the glyphs and is not their background.
      const hit = document.elementsFromPoint(px, py);
      let cut = hit.indexOf(el);
      // The point can land on a child (an inline mark, a nested span). The
      // element itself is then still in the list further down.
      if (cut < 0) cut = hit.findIndex((n) => n.contains(el));
      if (cut < 0) cut = hit.length - 1;
      let base = [255, 255, 255, 1];
      for (let i = hit.length - 1; i >= cut; i--) {
        const c = parse(getComputedStyle(hit[i]).backgroundColor);
        if (c && c[3] > 0) base = over(c, base);
      }
      return base;
    };

    const out: { ratio: number; floor: number; tag: string; sample: string }[] = [];
    const sel = "h1,h2,h3,p,li,span,a,button,label,td,th";
    const lum = ([r, g, b]: number[]) => {
      const f = (c: number) => {
        const s = c / 255;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
      };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    for (const el of Array.from(document.querySelectorAll(sel))) {
      const text = (el.textContent ?? "").trim();
      if (!text || el.querySelector(sel)) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === "hidden" || cs.display === "none") continue;
      if (parseFloat(cs.opacity) < 0.95) continue;
      if (el.closest('[aria-hidden="true"]')) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 4 || r.height < 4) continue;
      // On screen. elementsFromPoint only answers for the viewport, and "read
      // on this ground" only means anything for something the reader can see.
      if (r.bottom < 2 || r.top > window.innerHeight - 2) continue;
      if (r.right < 2 || r.left > window.innerWidth - 2) continue;
      const fg = parse(cs.color);
      if (!fg) continue;
      const bg = ground(el, r);
      const px = parseFloat(cs.fontSize);
      const bold = parseInt(cs.fontWeight, 10) >= 700;
      const icon = text.length === 1 && !/[\w\d]/.test(text);
      const large = px >= 24 || (px >= 18.66 && bold);
      const [hi, lo] = [lum(over(fg, bg)), lum(bg)].sort((a, b) => b - a);
      out.push({
        ratio: (hi + 0.05) / (lo + 0.05),
        floor: large || icon ? 3 : 4.5,
        tag: el.tagName.toLowerCase(),
        sample: text.slice(0, 45),
      });
    }
    return out;
  });
}

for (const theme of THEMES) {
  test(`text clears AA on every ground it is read on — ${themeName(theme)}`, async ({
    page,
  }) => {
    await enter(page);
    if (theme)
      await page.evaluate(
        (t) => document.documentElement.setAttribute("data-theme", t),
        theme
      );
    await page.waitForTimeout(400);
    const stops = await groundStops(page);
    expect(
      Object.keys(stops).length,
      "the page declares fewer than two grounds"
    ).toBeGreaterThan(1);

    const failures: string[] = [];
    for (const [g, y] of Object.entries(stops)) {
      await page.evaluate((v) => window.scrollTo(0, v), y);
      await page.waitForTimeout(1200); // past --ground-dur and the reveal latch
      const here = await page.evaluate(() =>
        document.documentElement.getAttribute("data-ground")
      );
      for (const s of await viewportSamples(page))
        if (s.ratio < s.floor)
          failures.push(
            `[${here} @${y}] <${s.tag}> ${s.ratio.toFixed(2)}:1 (needs ${s.floor}) — "${s.sample}"`
          );
      void g;
    }
    expect(failures, `${failures.length} element(s) below their WCAG floor`).toEqual([]);
  });
}
