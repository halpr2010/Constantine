/**
 * copy.spec.ts — §5 copy floors measured on RENDERED text.
 *
 * copy-lint.sh handles the "X, not Y" ban on source, because its ratchet keys
 * on the file an agent edits. The rules here are stated per visible page, and
 * source cannot distinguish rendered copy from an email subject line or a
 * comment, so they are measured on what the browser actually paints — both
 * verticals, since the switcher swaps most of the page's copy.
 */

import { test, expect, Page } from "@playwright/test";

const BASE = process.env.SITE_URL ?? "http://localhost:3000";

/** Visible text only: hidden panels carry the other vertical's copy. */
async function visibleText(page: Page) {
  return page.evaluate(() => {
    const parts: string[] = [];
    const walk = (n: Element) => {
      const cs = getComputedStyle(n);
      if (cs.display === "none" || cs.visibility === "hidden") return;
      if (parseFloat(cs.opacity) === 0) return;
      if (n.getAttribute("aria-hidden") === "true") return;
      for (const c of Array.from(n.childNodes)) {
        if (c.nodeType === Node.TEXT_NODE) parts.push(c.textContent ?? "");
        else if (c.nodeType === Node.ELEMENT_NODE) walk(c as Element);
      }
    };
    walk(document.body);
    return parts.join(" ").replace(/\s+/g, " ");
  });
}

for (const vertical of ["museums", "gyms"] as const) {
  test.describe(`§5 copy floors — ${vertical}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(BASE, { waitUntil: "networkidle" });
      if (vertical === "gyms") await page.getByTestId("hero-tab-gyms").click();
      await page.waitForTimeout(700); // the cross-fade holds both panels briefly
    });

    test("at most 2 em-dashes in visible copy", async ({ page }) => {
      const text = await visibleText(page);
      const found = text.match(/—/g) ?? [];
      // Report context, not just a count: a bare number tells an agent nothing
      // about which pivot to rewrite.
      const ctx = [...text.matchAll(/(.{0,40}—.{0,40})/g)].map((m) => m[1].trim());
      expect(found.length, `em-dashes:\n${ctx.map((c) => `  "${c}"`).join("\n")}`)
        .toBeLessThanOrEqual(2);
    });

    test("no 'That's why...' conclusion sentences", async ({ page }) => {
      const text = await visibleText(page);
      const hits = [...text.matchAll(/[^.!?]*\bthat['’]s why\b[^.!?]*/gi)].map((m) => m[0].trim());
      expect(hits).toEqual([]);
    });

    test("no fabricated clients, logos or testimonials (§9 honesty guard)", async ({ page }) => {
      // §9 is a hard prohibition, so this is an absolute gate, not a ratchet:
      // it starts green and must stay green.
      const text = await visibleText(page);
      const claims = [
        /trusted by/i, /our (?:clients|customers|partners)/i,
        /\bcase study\b/i, /testimonial/i, /\b\d+\+? (?:museums|gyms|venues) (?:use|trust)/i,
      ];
      const hits = claims.filter((c) => c.test(text)).map(String);
      expect(hits, "unsupported social proof on the page").toEqual([]);
    });

    test("privacy claims survive in both verticals (§9)", async ({ page }) => {
      // §9 forbids weakening privacy copy for layout convenience. These three
      // are the load-bearing claims and must appear whatever the layout does.
      const text = await visibleText(page);
      for (const claim of [/no identity profiles/i, /no facial recognition/i, /edge processing/i]) {
        expect(text, `privacy claim missing: ${claim}`).toMatch(claim);
      }
    });
  });
}
