"use client";

import { useEffect } from "react";
import { useVertical } from "@/components/VerticalContext";

/**
 * The scroll driver behind every [data-reveal] on the page.
 *
 * Position-linked, not time-linked. A reveal that fires on an
 * IntersectionObserver and then plays a 500ms transition is a clock the
 * visitor does not control: scroll fast and you arrive after the motion is
 * over, scroll slowly and nothing is happening. Binding progress to where the
 * element sits in the viewport makes the page respond to the scroll itself,
 * which is what §5 means by content arriving as you move. It also makes the
 * evidence reproducible — scripts/motion-strip.mjs indexes its frames by
 * scroll position precisely because "scroll-linked reveals bind to position".
 *
 * The observer exists only to keep the measured set small: an element is
 * measured while it is near the viewport, and dropped once it has resolved.
 *
 * FAIL-OPEN. --r is a registered custom property whose initial value is 1, so
 * before this component runs — and if it never runs, and under
 * prefers-reduced-motion — every element is already in its final revealed
 * state. Nothing is trapped behind a trigger.
 */

/** Element top at this fraction of viewport height ⇒ progress 0. */
const START = 0.94;
/** Fraction of viewport height the top travels through while resolving. */
const TRAVEL = 0.34;
/** Observe a little before the fold so an element is ghosted before it is seen. */
const ROOT_MARGIN = "0px 0px 30% 0px";

export default function ScrollStage() {
  // The switcher rebuilds most of the page's DOM, so the scan is re-run per
  // vertical rather than watching the whole body for mutations — the hero
  // demos rewrite their metric text every frame and would drown a
  // MutationObserver in churn.
  const { vertical } = useVertical();

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) return;

    const active = new Set<HTMLElement>();
    let frame = 0;

    const progress = (el: HTMLElement, rect: DOMRect, vh: number) => {
      if (el.dataset.revealMode === "span") {
        // A rule that threads a whole block cannot key off its own top edge:
        // that finishes while the block is still arriving. Key off how far the
        // block has passed through the viewport, so the rule inks in step with
        // the steps it connects and completes as the last one lands.
        return (vh * 0.62 - rect.top) / Math.max(1, rect.height - vh * 0.28);
      }
      const lag = parseFloat(el.dataset.revealLag ?? "0");
      return (vh * START - rect.top) / (vh * TRAVEL) - lag;
    };

    /**
     * Latch. Scrolling back up must not un-tell the argument, and the capture
     * scripts rely on one downward pass leaving the page in its final composed
     * state. Dropping the inline value returns --r to its registered initial 1,
     * which also drops the blur and transform layers rather than leaving forty
     * elements pinned at an identity transform for the rest of the session.
     */
    const latch = (el: HTMLElement) => {
      el.style.removeProperty("--r");
      el.dataset.revealed = "";
      active.delete(el);
      io.unobserve(el);
    };

    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      const doc = document.documentElement;
      // The last elements on the page cannot travel far enough to resolve on
      // their own — there is no scroll left. At the end of the document
      // everything is resolved by definition, or the footer would sit under
      // permanently dimmed copy.
      const atEnd = window.scrollY + vh >= doc.scrollHeight - 2;
      // Read every rect before writing anything: interleaving would force a
      // layout per element on a scroll frame.
      const measured: [HTMLElement, number][] = [];
      for (const el of active) {
        const p = atEnd ? 1 : progress(el, el.getBoundingClientRect(), vh);
        measured.push([el, p < 0 ? 0 : p > 1 ? 1 : p]);
      }
      for (const [el, p] of measured) {
        if (p >= 1) latch(el);
        else el.style.setProperty("--r", p.toFixed(3));
      }
    };

    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const el = e.target as HTMLElement;
          if (e.isIntersecting) active.add(el);
          // Left the band upward: it has been read past, so resolve it. Without
          // this an element that clears the top between two measurements is
          // dropped mid-reveal and stays dim for the rest of the session —
          // which is how two tick lines survived a full settle pass at 390.
          else if (e.boundingClientRect.top < 0) latch(el);
          else active.delete(el);
        }
        schedule();
      },
      { rootMargin: ROOT_MARGIN }
    );

    const scan = () => {
      for (const el of document.querySelectorAll<HTMLElement>(
        "[data-reveal]:not([data-revealed])"
      )) {
        io.observe(el);
      }
      schedule();
    };

    scan();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    // Images and webfonts land after mount and move everything below them.
    if (document.readyState !== "complete") window.addEventListener("load", scan);

    return () => {
      cancelAnimationFrame(frame);
      io.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("load", scan);
    };
  }, [vertical]);

  return null;
}
