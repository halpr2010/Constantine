/**
 * settle.mjs — put a scroll-linked page into its final composed state before
 * photographing it.
 *
 * The §7 sheets and the full-page strips are COMPOSITION evidence: they answer
 * "does this section hold together at 1440 and at 390, in four palettes". They
 * are captured with page.screenshot({fullPage}) or element.screenshot(), both
 * of which capture past the fold without ever scrolling there. Since 08 Sep
 * reaching a scroll position is what STARTS a reveal, so an unsettled capture
 * would photograph everything below the first viewport in its ghosted state —
 * and the critic would score the reveal system as washed-out design.
 *
 * MOTION evidence is the other strip's job. scripts/motion-strip.mjs
 * deliberately does NOT settle: it indexes frames by scroll position precisely
 * to catch the page mid-reveal. The two are complementary, and conflating them
 * is how the last two cycles ended in five ties.
 *
 * html { scroll-behavior: smooth } makes a bare scrollTo animate, so every hop
 * here is explicitly instant — otherwise the loop outruns the scroller and
 * lands somewhere arbitrary.
 */
export async function settleReveals(page) {
  await page.evaluate(async () => {
    const frame = () =>
      new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const step = Math.max(200, Math.round(window.innerHeight * 0.6));
    const end = document.documentElement.scrollHeight;
    for (let y = 0; y < end; y += step) {
      window.scrollTo({ top: y, behavior: "instant" });
      await frame();
    }
    window.scrollTo({ top: end, behavior: "instant" });
    await frame();
    window.scrollTo({ top: 0, behavior: "instant" });
    await frame();
  });
  // Reveals latch, so one downward pass is enough — but since 08 Sep the pass
  // only STARTS them, and each runs 420ms plus its authored lag on its own
  // clock. The pass hops every couple of frames, so the last reveals it trips
  // are still mid-transition when it finishes; wait out the longest chain
  // (~620ms) before photographing, or the tail of the page is captured part
  // way through arriving. Also covers late layout shifts from images that only
  // decoded during the pass.
  await page.waitForTimeout(900);
}
