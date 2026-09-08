/**
 * reveal.spec.ts — floors derived from founder-scored video review, 08 Sep.
 *
 * Each of these asserts something the existing suite was structurally blind to.
 * The palette floor even skipped the first case by design (`opacity < 0.95`
 * → continue), which is how 44 semi-transparent elements passed every gate.
 */

import { test, expect, Page } from "@playwright/test";

const BASE = process.env.SITE_URL ?? "http://localhost:3000";
const TEXT = "h1,h2,h3,p,li,span,a,button,label";

/** Effective opacity: these are dimmed via ancestors, so multiply the chain. */
async function dimTextInView(page: Page) {
  return page.evaluate((sel) => {
    const out: { o: number; t: string }[] = [];
    for (const el of Array.from(document.querySelectorAll(sel))) {
      const t = (el.textContent ?? "").trim();
      if (!t || el.querySelector(sel)) continue;
      // Deliberately hidden content (the inactive vertical panel) is not a bug.
      if (el.closest('[aria-hidden="true"]')) continue;
      // Nor is a demo's resting state: the metric readouts sit dim at 0.45
      // until a pointer engages them, which is interaction feedback rather
      // than a reveal (§5 ambient-vs-interaction). The demos are §3 protected;
      // brightening them permanently to satisfy this test would be a failure,
      // not a fix.
      if (el.closest('[data-testid="exhibit-card"],[data-testid="insight-card"]')) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === "hidden" || cs.display === "none") continue;
      const r = el.getBoundingClientRect();
      // Only judge what is comfortably in view: 80px clear of both edges, so a
      // reveal that is still legitimately mid-transition at the fold is exempt.
      if (r.bottom < 80 || r.top > window.innerHeight - 80 || r.height < 4) continue;
      let o = 1;
      for (let n: Element | null = el; n; n = n.parentElement) {
        const v = parseFloat(getComputedStyle(n).opacity);
        if (!isNaN(v)) o *= v;
      }
      if (o < 0.99) out.push({ o: +o.toFixed(2), t: t.slice(0, 45) });
    }
    return out;
  }, TEXT);
}

test("a reveal ends in a readable state, not a permanent dimmer", async ({ page }) => {
  // Founder verdict on the first scroll-flow candidate: "even when fully
  // visible, some content is still greyed out... we have to have the content at
  // the perfect place in the scroll to read it". Measured there: 44 elements
  // stuck between 0.11 and 0.9 while 80px clear of both edges after a 700ms
  // settle. Scroll-linked opacity must be a transition INTO readability.
  await page.goto(BASE, { waitUntil: "networkidle" });
  const H = await page.evaluate(() => document.body.scrollHeight - window.innerHeight);
  const worst = new Map<string, number>();
  for (let i = 0; i <= 20; i++) {
    await page.evaluate((y) => window.scrollTo(0, y), (H * i) / 20);
    await page.waitForTimeout(700); // generous: a reveal has finished by now
    for (const h of await dimTextInView(page))
      if (!worst.has(h.t) || worst.get(h.t)! > h.o) worst.set(h.t, h.o);
  }
  const rows = [...worst.entries()].sort((a, b) => a[1] - b[1]);
  expect(
    rows.map(([t, o]) => `${o} — "${t}"`),
    `${rows.length} element(s) never reach full opacity while well inside the viewport`
  ).toEqual([]);
});

test("no section is a bare wall of prose", async ({ page }) => {
  // Slingshot scroll, 2/10: "there are times when you are scrolling and all
  // that is on the page is quotes or a block of sheer text". A section carrying
  // a lot of copy must also carry something to look at.
  await page.goto(BASE, { waitUntil: "networkidle" });
  const walls = await page.evaluate(() => {
    const bad: string[] = [];
    for (const sec of Array.from(document.querySelectorAll("main > section, section"))) {
      const text = (sec.textContent ?? "").replace(/\s+/g, " ").trim();
      // 300, not 900. The original threshold was set high enough that every
      // offending section slipped under it — privacy at 811 chars with no
      // visual at all passed, which is precisely the "block text and words
      // with no diagrams" the founder scored 2/10 on Slingshot. A section with
      // a real paragraph of argument needs something to look at.
      if (text.length < 300) continue;
      const visual = sec.querySelector("img,svg,canvas,video,figure,table,[data-visual]");
      if (!visual) bad.push(`${sec.id || sec.className.toString().slice(0, 30)} — ${text.length} chars, no visual`);
    }
    return bad;
  });
  expect(walls, "copy-heavy section with nothing to look at").toEqual([]);
});

test("the closing CTA stands out from its background", async ({ page }) => {
  // Slingshot scroll, 2/10: "the CTA at the bottom of the page almost blends
  // in to the background". 3:1 is the WCAG non-text floor for a UI component.
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(700);
  const ratio = await page.evaluate(() => {
    const cv = document.createElement("canvas");
    cv.width = cv.height = 1;
    const cx = cv.getContext("2d")!;
    cx.globalCompositeOperation = "copy";
    const px = (s: string) => {
      cx.fillStyle = "#000"; cx.fillStyle = s; cx.fillRect(0, 0, 1, 1);
      const d = cx.getImageData(0, 0, 1, 1).data;
      return [d[0], d[1], d[2], d[3] / 255];
    };
    const over = (f: number[], b: number[]) =>
      [0, 1, 2].map((i) => f[i] * f[3] + b[i] * (1 - f[3])).concat(1);
    const ground = (el: Element) => {
      const st: number[][] = [];
      for (let n: Element | null = el; n; n = n.parentElement) {
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
    // The last actionable thing on the page.
    const ctas = Array.from(document.querySelectorAll("a[href='#pilot'],button[type='submit'],a.cta,[data-cta]"));
    const cta = ctas[ctas.length - 1];
    if (!cta) return -1;
    const fill = px(getComputedStyle(cta).backgroundColor);
    const behind = ground(cta.parentElement ?? document.body);
    const c = over(fill, behind);
    const [hi, lo] = [lum(c), lum(behind)].sort((a, b) => b - a);
    return (hi + 0.05) / (lo + 0.05);
  });
  expect(ratio, "no closing CTA found").toBeGreaterThan(0);
  expect(ratio, `closing CTA is ${ratio.toFixed(2)}:1 against its ground`).toBeGreaterThanOrEqual(3);
});
