/**
 * media.spec.ts — §4d rule 5, the media-slot floor.
 *
 * CONDITIONAL, NOT AN ADOPTION FLOOR, and DESIGN.md is explicit that this must
 * never be "fixed" to match the viewport-fit test: slots are discretionary, so
 * a page carrying zero of them passes legitimately and the rule reads "if you
 * build a slot, it must meet these floors". The n > 0 guard belongs on
 * viewport-fit, where §5 mandates adoption, and nowhere near this file.
 *
 * What it asserts, all of it from §4d rule 1 and rule 5:
 *   - the slot occupies its declared aspect ratio, in BOTH states, which is
 *     the whole of "no layout shift on swap: poster and video share
 *     dimensions". It is checked against the ratio the slot itself publishes,
 *     so the assertion holds after a clip lands without the test being edited.
 *   - no broken players: any <video> in a slot has a real source.
 *   - no 404s: any <img> in a slot actually decoded.
 *   - the slot stays inside the viewport at 390. A slot that bleeds to the
 *     right edge on a wide screen is the easy way to give a phone a sideways
 *     scrollbar, so its own right edge is measured there. Deliberately scoped
 *     to the slot: the page ALREADY scrolls sideways at 390 (the hero demo
 *     rail is 595px wide against a 390px viewport, which is the viewport-fit
 *     backlog's problem and not this floor's), and asserting the document
 *     width here would fail every candidate for someone else's defect.
 */

import { test, expect, Page } from "@playwright/test";

const BASE = process.env.SITE_URL ?? "http://localhost:3000";

/** Answer the entry question: everything below it is what this file measures. */
async function enter(page: Page) {
  await page.goto(BASE, { waitUntil: "networkidle" });
  const pick = page.getByTestId("select-museums");
  if (await pick.count()) {
    await pick.click();
    await page.waitForTimeout(1600);
  }
}

async function slots(page: Page) {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll('[data-testid="media-slot"]')).map((el) => {
      const r = el.getBoundingClientRect();
      const declared = el.getAttribute("data-aspect") ?? "";
      const [w, h] = declared.split("/").map((p) => parseFloat(p.trim()));
      const videos = Array.from(el.querySelectorAll("video")).map((v) => ({
        src: v.getAttribute("src") ?? "",
        sources: v.querySelectorAll("source").length,
      }));
      const images = Array.from(el.querySelectorAll("img")).map((i) => ({
        src: i.getAttribute("src") ?? "",
        ok: i.naturalWidth > 0,
      }));
      return {
        id: el.closest("section")?.id || "unnamed section",
        state: el.getAttribute("data-slot-state") ?? "",
        width: r.width,
        height: r.height,
        right: r.right,
        declared,
        ratio: w && h ? w / h : NaN,
        videos,
        images,
      };
    })
  );
}

test("every media slot holds its declared box in whichever state it is in", async ({
  page,
}) => {
  await enter(page);
  const found = await slots(page);
  // Deliberately no n > 0 guard. See the header.
  for (const s of found) {
    expect(s.declared, `${s.id}: slot publishes no data-aspect`).toMatch(/\d+\s*\/\s*\d+/);
    expect(s.width, `${s.id}: slot has no width`).toBeGreaterThan(100);
    const measured = s.width / s.height;
    // 2% covers sub-pixel layout rounding and nothing else.
    expect(
      Math.abs(measured - s.ratio) / s.ratio,
      `${s.id}: slot renders ${measured.toFixed(3)} against a declared ${s.declared} (${s.state})`
    ).toBeLessThan(0.02);
  }
});

test("no media slot renders a broken player or a missing still", async ({ page }) => {
  await enter(page);
  const found = await slots(page);
  const bad: string[] = [];
  for (const s of found) {
    for (const v of s.videos)
      if (!v.src && v.sources === 0) bad.push(`${s.id}: <video> with no source`);
    for (const i of s.images) if (!i.ok) bad.push(`${s.id}: <img> failed to load — ${i.src}`);
  }
  expect(bad, "§4d rule 5: a pending slot must render, not break").toEqual([]);
});

test("a bleeding media slot does not widen the page at 390", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enter(page);
  const found = await slots(page);
  for (const s of found) {
    expect(s.right, `${s.id}: slot reaches ${s.right}px on a 390px viewport`).toBeLessThanOrEqual(
      391
    );
  }
});
