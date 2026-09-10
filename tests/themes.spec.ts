/**
 * themes.spec.ts — the palette floor.
 *
 * The point of the register system is that a feature is built once against the
 * working tokens and renders correctly in EVERY theme and EVERY register. This
 * spec is what makes that claim testable: it walks all four themes, finds every
 * register ground actually painted on the page, and asserts the text on it is
 * legible.
 *
 * A candidate that looks good in dark and washes out in light-canvas fails
 * here, before the critic ever sees it. That is what lets us keep every palette
 * alive instead of pinning one early.
 */

import { test, expect, Page } from "@playwright/test";

const BASE = process.env.SITE_URL ?? "http://localhost:3000";

const THEMES = ["", "light-canvas", "dark-canvas", "instrument"] as const;
const themeName = (t: string) => t || "dark (variant zero)";

/** WCAG contrast between two resolved rgb() strings. */
function contrast(a: number[], b: number[]) {
  const lum = ([r, g, bl]: number[]) => {
    const f = (c: number) => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(bl);
  };
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

/**
 * Collect every (text colour, effective background) pair the page actually
 * paints. Backgrounds are resolved by walking ancestors past transparent fills,
 * and semi-transparent card fills are composited over what sits behind them —
 * otherwise a card whose ground is rgba(...) would be scored against the wrong
 * colour and the check would pass on text that is genuinely unreadable.
 */
async function samples(page: Page) {
  return page.evaluate(() => {
    // Tokens built with color-mix(in oklab, ...) compute to an oklab() string,
    // not rgb(), so a regex reads them as unparseable and silently drops the
    // element. Round-trip through a 1x1 canvas instead: the browser resolves
    // any colour syntax it understands to straight sRGB bytes.
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
    // Every absolutely-positioned painted element, gathered once. A pill or
    // highlight that sits behind text is a sibling, not an ancestor, so an
    // ancestor-only walk scores such text against the wrong ground.
    const floaters = Array.from(document.querySelectorAll("*")).filter((n) => {
      const cs = getComputedStyle(n);
      if (cs.position !== "absolute" && cs.position !== "fixed") return false;
      const c = parse(cs.backgroundColor);
      return !!c && c[3] > 0;
    });

    // Effective background: composite every translucent layer from the root down.
    const ground = (el: Element): number[] => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const stack: number[][] = [];
      // Innermost first: ancestors, plus any floater covering this element's
      // centre that paints beneath it (precedes it in document order).
      for (const f of floaters) {
        if (f.contains(el) || el.contains(f)) continue;
        const fr = f.getBoundingClientRect();
        if (cx < fr.left || cx > fr.right || cy < fr.top || cy > fr.bottom) continue;
        if (!(el.compareDocumentPosition(f) & Node.DOCUMENT_POSITION_PRECEDING)) continue;
        stack.push(parse(getComputedStyle(f).backgroundColor)!);
      }
      for (let n: Element | null = el; n; n = n.parentElement) {
        const c = parse(getComputedStyle(n).backgroundColor);
        if (c && c[3] > 0) stack.push(c);
      }
      let base = [255, 255, 255, 1];
      for (const layer of stack.reverse()) base = over(layer, base);
      return base;
    };

    const out: { text: number[]; bg: number[]; tag: string; register: string;
                 floor: number; sample: string }[] = [];
    const sel = "h1,h2,h3,p,li,span,a,button,label,td,th";
    for (const el of Array.from(document.querySelectorAll(sel))) {
      const text = (el.textContent ?? "").trim();
      if (!text) continue;
      // Only leaf-ish nodes, so we score the element that actually paints glyphs.
      if (el.querySelector(sel)) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === "hidden" || cs.display === "none") continue;
      if (parseFloat(cs.opacity) < 0.95) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 4 || r.height < 4) continue;
      const fg = parse(cs.color);
      if (!fg) continue;
      // Text colour is frequently color-mix(..., transparent), so it resolves
      // to rgba with alpha < 1. Composite it over its own ground rather than
      // skipping it — translucent text is exactly where contrast fails.
      // Which register ground is this sitting on?
      let reg = "base";
      for (let n: Element | null = el; n; n = n.parentElement) {
        const v = n.getAttribute?.("data-register");
        if (v) { reg = v; break; }
      }
      const bg = ground(el);
      // WCAG floors: 4.5:1 for body text, 3:1 for large text (>=24px, or
      // >=18.66px bold) and for non-text glyphs. A lone icon character sitting
      // next to its own text label is decorative, so it takes the 3:1 floor —
      // the label beside it still has to clear 4.5:1 on its own.
      const px = parseFloat(cs.fontSize);
      const bold = parseInt(cs.fontWeight, 10) >= 700;
      const icon = text.length === 1 && !/[\w\d]/.test(text);
      const large = px >= 24 || (px >= 18.66 && bold);
      out.push({
        text: over(fg, bg), bg, tag: el.tagName.toLowerCase(), register: reg,
        floor: large || icon ? 3 : 4.5,
        sample: text.slice(0, 45),
      });
    }
    return out;
  });
}

for (const theme of THEMES) {
  test.describe(`palette floor — ${themeName(theme)}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(BASE, { waitUntil: "networkidle" });
      if (theme) {
        await page.evaluate((t) => document.documentElement.setAttribute("data-theme", t), theme);
      }
      // Settle unconditionally: variant zero sets no attribute, and sampling
      // before first paint returns an empty page rather than a real failure.
      await page.waitForTimeout(400);
    });

    test("every register ground is actually painted", async ({ page }) => {
      // A register that resolves to transparent means its block failed to remap
      // --surface-page, and the section silently inherits the wrong ground.
      const grounds = await page.evaluate(() =>
        Array.from(document.querySelectorAll("[data-register]")).map((el) => ({
          register: el.getAttribute("data-register")!,
          bg: getComputedStyle(el).backgroundColor,
        }))
      );
      expect(grounds.length, "no sections carry data-register").toBeGreaterThan(0);
      for (const g of grounds) {
        expect(g.bg, `register "${g.register}" has no painted ground`).not.toMatch(
          /rgba\(0,\s*0,\s*0,\s*0\)|transparent/
        );
      }
    });

    test("body text clears AA on every register it lands on", async ({ page }) => {
      const all = await samples(page);
      expect(all.length, "no text sampled").toBeGreaterThan(20);
      const failures = all
        .map((s) => ({ ...s, ratio: contrast(s.text, s.bg) }))
        .filter((s) => s.ratio < s.floor)
        .map((s) => `[${s.register}] <${s.tag}> ${s.ratio.toFixed(2)}:1 (needs ${s.floor}) — "${s.sample}"`);
      expect(failures, `${failures.length} element(s) below their WCAG floor`).toEqual([]);
    });

    test("each register carries a distinct ground", async ({ page }) => {
      // If two registers resolve to the same colour the rhythm collapses and
      // the theme is a global recolour again, which is the thing we replaced.
      const byReg = await page.evaluate(() => {
        const m: Record<string, string> = {};
        for (const el of Array.from(document.querySelectorAll("[data-register]"))) {
          m[el.getAttribute("data-register")!] = getComputedStyle(el).backgroundColor;
        }
        return m;
      });
      const seen = Object.values(byReg);
      expect(new Set(seen).size, `registers collapsed to one ground: ${JSON.stringify(byReg)}`)
        .toBe(seen.length);
    });

    test("every button and CTA has a visible shape, not just a legible label", async ({ page }) => {
      // The floor gap that let an invisible CTA ship. This spec checked TEXT
      // contrast, and the hero button's white label passed easily — while the
      // button's own fill measured 1.0:1 against the ground behind it in
      // light-canvas, because --action-* was never in the register remap set.
      // The label read; the button was not there. A control has to have a
      // visible edge, so its FILL is measured against what it sits on.
      const bad = await page.evaluate(() => {
        const cv = document.createElement("canvas");
        cv.width = cv.height = 1;
        const cx = cv.getContext("2d", { willReadFrequently: true })!;
        cx.globalCompositeOperation = "copy";
        const px = (v: string) => {
          cx.fillStyle = "#000"; cx.fillStyle = v; cx.fillRect(0, 0, 1, 1);
          const d = cx.getImageData(0, 0, 1, 1).data;
          return [d[0], d[1], d[2], d[3] / 255];
        };
        const over = (f: number[], b: number[]) =>
          [0, 1, 2].map((i) => f[i] * f[3] + b[i] * (1 - f[3])).concat(1);
        const ground = (el: Element | null) => {
          const st: number[][] = [];
          for (let n = el; n; n = n.parentElement) {
            const c = px(getComputedStyle(n).backgroundColor);
            if (c[3] > 0) st.push(c);
          }
          let base = [255, 255, 255, 1];
          for (const l of st.reverse()) base = over(l, base);
          return base;
        };
        const lum = ([r, g, b]: number[]) => {
          const f = (c: number) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
          return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
        };
        const out: string[] = [];
        for (const el of Array.from(document.querySelectorAll("a[href='#pilot'],button[type='submit'],[data-cta]"))) {
          const cs = getComputedStyle(el);
          const r = el.getBoundingClientRect();
          if (r.width < 8 || r.height < 8 || cs.visibility === "hidden") continue;
          const fill = px(cs.backgroundColor);
          const hasBorder = parseFloat(cs.borderTopWidth) > 0 && px(cs.borderTopColor)[3] > 0;
          // Only judge things that CLAIM a shape. An unfilled, unbordered
          // anchor is an inline text link — "Ask it in the pilot request" is
          // one — and its legibility is the text floor's job, not this one.
          // Measuring it here reports 1.0:1 for every text link on the page.
          if (fill[3] === 0) continue;
          const behind = ground(el.parentElement);
          const c = over(fill, behind);
          const [hi, lo] = [lum(c), lum(behind)].sort((a, b) => b - a);
          const ratio = (hi + 0.05) / (lo + 0.05);
          if (ratio < 3 && !hasBorder)
            out.push(`${(el.textContent ?? "").trim().slice(0, 30)} — ${ratio.toFixed(2)}:1`);
        }
        return out;
      });
      expect(bad, "control has no visible shape against its ground").toEqual([]);
    });

    test("canvas bridge resolves — demos can draw", async ({ page }) => {
      // palette.ts reads tokens off the root at draw time. If a theme leaves any
      // chart token empty the demos draw with "" and vanish.
      const empty = await page.evaluate(() => {
        const cs = getComputedStyle(document.documentElement);
        return ["chart-1", "chart-2", "text-primary", "surface-card", "accent-positive"]
          .filter((t) => !cs.getPropertyValue(`--${t}`).trim());
      });
      expect(empty, `unresolved tokens: ${empty.join(", ")}`).toEqual([]);
    });
  });
}
