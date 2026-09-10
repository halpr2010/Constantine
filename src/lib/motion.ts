/**
 * The reduced-motion contract for drawing code, in one place.
 *
 * §5's SCOPE note draws the line at AMBIENT vs INTERACTION, and the demos are
 * §3 protected, so "honour the preference" cannot mean "stop drawing". It means
 * the demo's clock becomes the visitor's clock: nothing advances while nobody
 * is touching it, and a pointer starts it again.
 *
 * Two things follow, and both are what these helpers are for.
 *
 * 1. A LOOP THAT PARKS NEEDS A REST FRAME. A canvas that simply stops is blank
 *    or half-drawn, and §5 asks for static AND COMPLETE. Every drawing that
 *    parks under the preference draws its resting state first — for the demo
 *    charts, the ten-second window flat at zero, which is exactly what the live
 *    trace converges to when nobody is near the work.
 * 2. A CANVAS DRAWN ONCE STILL HAS TO RE-THEME. Four palettes are live and the
 *    harness flips `data-theme` on the root AFTER mount
 *    (scripts/screenshot.mjs, tests/themes.spec.ts). Code that redrew every
 *    frame picked that up for free; code that draws once does not, and a
 *    variant screenshot would then show the demo's chart in the previous
 *    theme's ink. `onRedraw` is the replacement for that accident.
 *    EXTENDED 10 Sep 2026: `data-theme` is no longer the only attribute on the
 *    root that changes what a token resolves to. The page ground is one as well
 *    (§5, THE PAGE GROUND), and it changes several times as the visitor
 *    scrolls. The ambient field cached its colour ramp against `data-theme`
 *    alone and rendered the whole atmosphere block white, because the ramp it
 *    happened to be built with at mount was the entry gate's technical one.
 */

/** True when the visitor has asked for reduced motion. */
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** The live query, for code that has to react to the preference changing. */
export function stillQuery(): MediaQueryList | null {
  return typeof window === "undefined"
    ? null
    : window.matchMedia("(prefers-reduced-motion: reduce)");
}

/**
 * Every attribute on the root that changes what a token resolves to. One list,
 * so a canvas cannot subscribe to some of them and miss the rest.
 *
 * `data-ground-fade` is in here for its REMOVAL rather than its arrival:
 * GroundDriver drops it when a crossing finishes, which is the moment
 * getComputedStyle stops returning an interpolated value and starts returning
 * the ground the page has arrived at. Watching the ground alone would redraw
 * once, at the start, with the colour being left behind.
 */
export const PALETTE_ATTRS = ["data-theme", "data-ground", "data-ground-fade"];

/**
 * Everything that invalidates a canvas which is not redrawn every frame: the
 * box changed size, or the palette under it changed. Returns an unsubscribe.
 */
export function onRedraw(draw: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("resize", draw);
  const theme = new MutationObserver(draw);
  theme.observe(document.documentElement, {
    attributes: true,
    attributeFilter: PALETTE_ATTRS,
  });
  return () => {
    window.removeEventListener("resize", draw);
    theme.disconnect();
  };
}
