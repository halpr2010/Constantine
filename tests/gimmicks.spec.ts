/**
 * gimmicks.spec.ts — Protected-elements + design-floor tests (v2).
 *
 * Hard floor of the build loop: the critic judges taste; these assert the
 * demos WORK and the v2 constitution's mechanical rules hold. Red test =
 * candidate discarded before the critic sees it.
 *
 * SETUP (once): add stable data-testids, decoupled from styling the loop
 * may change:
 *   hero-tab-museums | hero-tab-gyms
 *   exhibit-card, attention-value, engagement-value   (both hero tabs)
 *   insight-card, ranking-value                       (Insight section)
 *   scroll-progress                                   (progress bar, §5)
 *   viewport-section                                  (each scroll-step
 *     section subject to the §5 viewport-fit rule)
 */

import { test, expect, Page } from "@playwright/test";
import { createHash } from "crypto";

const BASE = process.env.SITE_URL ?? "http://localhost:3000";

async function attentionValue(card: ReturnType<Page["locator"]>) {
  const el = card.getByTestId("attention-value");
  return parseFloat((await el.innerText()).replace(/[^\d.]/g, ""));
}

test.describe("P1 — Museums hero demo", () => {
  test("hover starts the attention timer", async ({ page }) => {
    await page.goto(BASE);
    const card = page.getByTestId("exhibit-card").first();
    expect(await attentionValue(card)).toBe(0);
    await card.hover();
    await page.waitForTimeout(1500);
    expect(await attentionValue(card)).toBeGreaterThan(0.5);
  });

  test("hover raises engagement intensity within (0,100]", async ({ page }) => {
    await page.goto(BASE);
    const card = page.getByTestId("exhibit-card").first();
    await card.hover();
    await page.waitForTimeout(1000);
    const pct = parseFloat(
      (await card.getByTestId("engagement-value").innerText()).replace(/[^\d.]/g, "")
    );
    expect(pct).toBeGreaterThan(0);
    expect(pct).toBeLessThanOrEqual(100);
  });

  test("cards track independently", async ({ page }) => {
    await page.goto(BASE);
    const cards = page.getByTestId("exhibit-card");
    await cards.nth(0).hover();
    await page.waitForTimeout(1200);
    expect(await attentionValue(cards.nth(0))).toBeGreaterThan(0);
    expect(await attentionValue(cards.nth(1))).toBe(0);
  });
});

test.describe("P2 — Gyms hero demo", () => {
  test("tab switch reveals gym metrics", async ({ page }) => {
    await page.goto(BASE);
    await page.getByTestId("hero-tab-gyms").click();
    // Scoped to the hero card: both gym cards carry these labels, and
    // "Utilisation" also appears in the Insight leaderboard, so an unscoped
    // getByText is a strict-mode violation rather than a real failure.
    const card = page.getByTestId("exhibit-card").first();
    await expect(card).toContainText(/Workout Time/i);
    await expect(card).toContainText(/Utilisation/i);
  });

  test("stairmaster video present and loadable", async ({ page }) => {
    await page.goto(BASE);
    await page.getByTestId("hero-tab-gyms").click();
    const video = page.locator("video").first();
    await expect(video).toBeVisible();
    expect(
      await video.evaluate((v: HTMLVideoElement) => v.readyState)
    ).toBeGreaterThanOrEqual(1);
  });

  test("equipment hover drives the timer", async ({ page }) => {
    await page.goto(BASE);
    await page.getByTestId("hero-tab-gyms").click();
    const card = page.getByTestId("exhibit-card").first();
    await card.hover();
    await page.waitForTimeout(1500);
    expect(await attentionValue(card)).toBeGreaterThan(0.5);
  });
});

test.describe("P3/P4/P5 — structure and substance", () => {
  test("insight cards keep ranking + movement", async ({ page }) => {
    await page.goto(BASE);
    const cards = page.getByTestId("insight-card");
    expect(await cards.count()).toBeGreaterThanOrEqual(2);
    await expect(cards.first().getByTestId("ranking-value")).toContainText(/#\d/);
    await expect(cards.first()).toContainText(/[↑↓].*\d/);
  });

  test("four-step sequence intact and ordered", async ({ page }) => {
    await page.goto(BASE);
    // Scoped to #how: "Measure" also opens the hero subtitle ("Measure how
    // people actually use your space"), which sits ~875 characters before
    // "Integrate" and inverts a whole-body ordering check.
    const body = await page.locator("#how").innerText();
    const order = ["Integrate", "Calibrate", "Measure", "Insight"].map((s) =>
      body.indexOf(s)
    );
    order.forEach((i) => expect(i).toBeGreaterThan(-1));
    expect([...order]).toEqual([...order].sort((a, b) => a - b));
  });

  test("privacy guarantees all present", async ({ page }) => {
    await page.goto(BASE);
    for (const claim of [/no identity profiles/i, /no facial recognition/i, /edge processing/i]) {
      await expect(page.getByText(claim).first()).toBeVisible();
    }
  });
});

test.describe("§5 design floors (v2 constitution)", () => {
  test("scroll progress bar exists, starts empty, completes at page end", async ({ page }) => {
    await page.goto(BASE);
    const bar = page.getByTestId("scroll-progress");
    await expect(bar).toBeVisible();
    const progressOf = () =>
      bar.evaluate((el) => {
        // Contract: element exposes progress via aria-valuenow (0–100)
        // or scaleX width ratio. aria preferred.
        const aria = el.getAttribute("aria-valuenow");
        if (aria !== null) return parseFloat(aria);
        const r = el.getBoundingClientRect();
        const p = el.parentElement!.getBoundingClientRect();
        return (r.width / p.width) * 100;
      });
    expect(await progressOf()).toBeLessThanOrEqual(2);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(600);
    expect(await progressOf()).toBeGreaterThanOrEqual(98);
  });

  test("viewport-fit: tagged sections compose within one screen (desktop)", async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(BASE);
    const sections = page.getByTestId("viewport-section");
    const n = await sections.count();
    expect(n).toBeGreaterThan(0); // rule must actually be adopted
    for (let i = 0; i < n; i++) {
      const h = await sections.nth(i).evaluate((el) => el.getBoundingClientRect().height);
      expect(h, `viewport-section[${i}] exceeds 900px`).toBeLessThanOrEqual(900);
    }
    await ctx.close();
  });

  test("viewport-fit: tagged sections compose within one screen (mobile)", async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    await page.goto(BASE);
    const sections = page.getByTestId("viewport-section");
    const n = await sections.count();
    expect(n).toBeGreaterThan(0); // rule must actually be adopted
    for (let i = 0; i < n; i++) {
      const h = await sections.nth(i).evaluate((el) => el.getBoundingClientRect().height);
      expect(h, `viewport-section[${i}] exceeds 844px on mobile`).toBeLessThanOrEqual(844);
    }
    await ctx.close();
  });

  test("reduced motion: page is static and complete", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await page.goto(BASE, { waitUntil: "networkidle" });
    // Covers the future liquid background, which will be Web-Animations
    // visible. It cannot see canvas work, hence the pixel check below.
    expect(
      await page.evaluate(
        () => document.getAnimations().filter((a) => a.playState === "running").length
      )
    ).toBe(0);

    // The demos are requestAnimationFrame driving a canvas, invisible to
    // getAnimations(). Sample the same canvas twice with no interaction: if
    // ambient/idle drawing is still running the bytes differ.
    // SCOPE: this asserts IDLE motion freezes. User-initiated response
    // (hover/tap driving the timer) is interaction feedback and may still
    // animate — see §5. A candidate must not kill the demos to pass this.
    const demoCanvas = page.getByTestId("exhibit-card").first().locator("canvas").first();
    const hashOf = async () =>
      createHash("sha256").update(await demoCanvas.screenshot()).digest("hex");
    const first = await hashOf();
    await page.waitForTimeout(500);
    expect(
      await hashOf(),
      "idle canvas animation must freeze under prefers-reduced-motion"
    ).toBe(first);
    // One canvas in one card is a narrow window on a page that also carries an
    // ambient field, a venue wireframe and a looping clip. Photograph the whole
    // viewport twice instead, at the block where the atmosphere lives, touching
    // nothing in between: anything on screen that is still running its own
    // clock shows up as a changed frame.
    // Element screenshots are deliberately not used for this — Playwright
    // scrolls an element into view first, which moves the page between the two
    // samples and reports every scroll-positioned drawing as moving.
    await page.evaluate(() => {
      document.querySelector("#venue")?.scrollIntoView();
    });
    await page.waitForTimeout(800);
    const frame = async () =>
      createHash("sha256").update(await page.screenshot()).digest("hex");
    const before = await frame();
    await page.waitForTimeout(500);
    expect(
      await frame(),
      "the ambient field and the venue wireframe must be still under prefers-reduced-motion"
    ).toBe(before);
    // Scrollytelling degrades: key content reachable by plain scroll
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    for (const t of [/Integrate/i, /no facial recognition/i]) {
      expect(await page.getByText(t).count()).toBeGreaterThan(0);
    }
    await ctx.close();
  });

  test("reduced motion: the demos still answer the pointer", async ({ browser }) => {
    // The other half of the §5 SCOPE rule, and the reason the test above cannot
    // stand alone: the cheapest way to pass a stillness check is to stop the
    // demos, which is a §3 P1/P2 failure rather than a fix. Ambient motion
    // freezes; user-initiated response does not.
    const ctx = await browser.newContext({ reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await page.goto(BASE, { waitUntil: "networkidle" });

    const card = page.getByTestId("exhibit-card").first();
    expect(await attentionValue(card)).toBe(0); // idle: nothing accruing
    await card.hover();
    await page.waitForTimeout(1500);
    expect(
      await attentionValue(card),
      "hover must still drive the attention timer under prefers-reduced-motion"
    ).toBeGreaterThan(0.5);
    const pct = parseFloat(
      (await card.getByTestId("engagement-value").innerText()).replace(/[^\d.]/g, "")
    );
    expect(pct).toBeGreaterThan(0);

    await page.getByTestId("hero-tab-gyms").click();
    const gymCard = page.getByTestId("exhibit-card").first();
    await gymCard.hover();
    await page.waitForTimeout(1500);
    expect(
      await attentionValue(gymCard),
      "tap/hover must still drive workout time under prefers-reduced-motion"
    ).toBeGreaterThan(0.5);
    await ctx.close();
  });

  test("ambient field moves on its own, with no cursor input", async ({ page }) => {
    // The floor that was missing. Two candidates satisfied every stated §5
    // constraint and were rejected as "completely static": one had no
    // autonomous animation at all, the other drifted too slowly to see. The
    // gate could not tell either from a working field, so it passed both.
    //
    // Sample the field twice, 900ms apart, touching nothing. A field that is
    // genuinely drifting changes; one that only answers the cursor does not.
    await page.goto(BASE, { waitUntil: "networkidle" });
    const field = page.getByTestId("ambient-field").first();
    await expect(field).toBeAttached();
    const hashOf = async () =>
      createHash("sha256").update(await field.screenshot()).digest("hex");
    const first = await hashOf();
    await page.waitForTimeout(900);
    expect(
      await hashOf(),
      "ambient field is static: §5 requires continuous autonomous drift, " +
        "with cursor reactivity modulating it rather than replacing it"
    ).not.toBe(first);
  });

  test("ambient field is visible, not imperceptible", async ({ page }) => {
    // "Low intensity" produced two fields indistinguishable from each other
    // and from no field at all. §5 now requires the field to be clearly
    // present as atmosphere, so assert it actually paints a spread of tones
    // rather than one flat ground colour.
    await page.goto(BASE, { waitUntil: "networkidle" });
    const field = page.getByTestId("ambient-field").first();
    await expect(field).toBeAttached();
    const spread = await field.screenshot().then((buf) => {
      // Cheap proxy for "there is a gradient here": distinct byte values
      // across the PNG. A flat fill compresses to very few.
      return new Set(buf).size;
    });
    expect(spread, "ambient field renders as a flat fill").toBeGreaterThan(64);
  });

  test("touch: demos start via tap (hover is not the only path)", async ({ browser }) => {
    const ctx = await browser.newContext({
      viewport: { width: 390, height: 844 },
      hasTouch: true,
    });
    const page = await ctx.newPage();
    await page.goto(BASE);
    const card = page.getByTestId("exhibit-card").first();
    await card.tap();
    await page.waitForTimeout(1500);
    expect(await attentionValue(card)).toBeGreaterThan(0);
    await ctx.close();
  });

  test("no console errors on load", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    await page.goto(BASE, { waitUntil: "networkidle" });
    expect(errors).toEqual([]);
  });
});
