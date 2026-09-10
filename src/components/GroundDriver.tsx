"use client";

import { useEffect } from "react";
import { useVertical } from "@/components/VerticalContext";

/**
 * THE PAGE HAS ONE GROUND, AND THIS DECIDES WHICH.
 *
 * §5 requirement 1, rewritten 10 Sep 2026 after the founder rejected the seam
 * twice: "we still see a straight (now faded) but clear line where the black and
 * white pages start." The old architecture gave every section its own ground and
 * dissolved between them, so a boundary was always somewhere on screen and
 * softening it only changed what the line looked like.
 *
 * design-refs/Claryo-Ground-Black.png and -White.png are the same heading and
 * the same three cards, once white-on-black and once black-on-white, with
 * nothing moved. The ground under the whole page changed. So there is exactly
 * one ground here, it is carried on <html> as `data-ground`, and the twenty-eight
 * registered colour tokens it selects cross-fade together (globals.css, THE PAGE
 * GROUND). This file's whole job is to answer one question: which register does
 * the page currently stand in.
 *
 * THE SAMPLE POINT, and why it is a point rather than a threshold pair.
 *
 * The ground is the ground of whichever section owns the pixel at the middle of
 * the viewport. That is a pure function of scroll offset: same offset, same
 * answer, coming down the page or going back up, with no hysteresis band to
 * tune and no way for the two directions to disagree. The founder's description
 * is satisfied by construction — "the whole page is black, until a certain point
 * in the scroll where we pass over into the new section" is exactly the moment
 * the incoming section takes the middle of the screen, which is also the moment
 * it owns half of what the reader can see.
 *
 * The alternative, arming a threshold on the way down and a second one on the
 * way up, needs a band wide enough to stop a trackpad flick oscillating and
 * therefore puts the crossing in a different place depending on travel
 * direction. A page whose colour depends on how you arrived is not one ground.
 *
 * THE SCAN walks the ground-declaring elements in document order and keeps the
 * last one whose top edge has passed the line, so the gaps between sections
 * belong to the section above them and no offset is ever unanswered. Elements
 * that have left the flow are skipped: the entry view goes `position: fixed` at
 * the moment of the click (EntryView) and would otherwise hold the sample point
 * at the top of the screen forever, freezing the page on the gate's ground while
 * the hero it is covering is already the page.
 *
 * WHY THE FADE IS ARMED AND DISARMED rather than declared once on the root: the
 * capture harness and tests/themes.spec.ts flip `data-theme` after mount, which
 * changes every token in the transition list. A standing transition would make
 * every one of those samples land mid-crossing. `data-ground-fade` is present
 * only for the length of an actual ground change, so a theme flip is instant and
 * a ground change is not.
 */

/** Where on the screen the page reads its own ground. */
const SAMPLE = 0.5;

/**
 * Mirrors --ground-dur in globals.css. Two files have to agree on it.
 *
 * WHY 500 AND NOT LONGER, measured rather than chosen. A crossing costs one
 * full-document style recalc per frame, because changing ANY custom property on
 * the root invalidates every element that could inherit it — 13ms across this
 * page's 2,015 elements, and the same 13ms for a property nothing reads, so the
 * cost is the invalidation and not the twenty-eight colours. On an idle machine
 * that is free: a rAF counter reads 54 frames in 900ms whether or not a crossing
 * is running. With the gate's four candidates on one machine it is not, and the
 * §3 P1 floor is the thing that notices, because the demo's reveal is a
 * per-frame lerp and dropped frames delay the moment its attention clock starts.
 * At 820ms that floor failed under load and passed with the crossing disabled;
 * at 500ms the whole suite passes under the same load, twice. The crossing is
 * still plainly a crossing — see the six-frame strip in the commit — and the
 * demos are §3 protected, so they get the frames.
 */
const GROUND_MS = 500;

export default function GroundDriver() {
  // The switcher rebuilds the page's sections, so the scan is redone per
  // vertical rather than held in a MutationObserver over the whole document.
  const { vertical, answered } = useVertical();

  useEffect(() => {
    const root = document.documentElement;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");

    let frame = 0;
    let disarm = 0;
    let current = root.getAttribute("data-ground") ?? "";

    const read = (): string => {
      const line = window.innerHeight * SAMPLE;
      const decls = document.querySelectorAll<HTMLElement>(
        // A block that has been taken out of the flow is not part of the
        // document's vertical order any more and cannot own a scroll offset.
        '[data-ground]:not([data-state="leaving"])'
      );
      let ground = decls[0]?.dataset.ground ?? current;
      for (const el of decls) {
        if (el.getBoundingClientRect().top > line) break;
        ground = el.dataset.ground ?? ground;
      }
      return ground;
    };

    const apply = () => {
      frame = 0;
      const next = read();
      if (!next || next === current) return;
      // §5: under the preference the ground resolves instantly, so the page is
      // never photographed mid-fade and there is nothing to freeze.
      //
      // AND NOTHING FADES UNDER THE ENTRY SHEET. Between the click and the
      // sheet lifting, the gate paints an opaque ground over the whole screen
      // (globals.css, ENTRY VIEW), so the technical → product crossing
      // underneath it cannot be seen by anyone. Running it as a fade would buy
      // no picture and would spend half a second of full-document restyling in
      // the exact beat the hero demos are being revealed and first hovered,
      // which §3 protects. It lands in one frame instead, and the sheet lifting
      // is still the only crossing the visitor sees.
      const hidden = root.dataset.entry === "entering";
      if (!still.matches && !hidden) {
        root.setAttribute("data-ground-fade", "");
        window.clearTimeout(disarm);
        // A crossing interrupted by a second one simply retargets — the browser
        // interpolates from wherever each token currently sits — so the timer is
        // pushed out rather than the transition being restarted. Disarming while
        // one is still running would snap it to its end.
        disarm = window.setTimeout(() => {
          root.removeAttribute("data-ground-fade");
        }, GROUND_MS + 80);
      }
      current = next;
      root.setAttribute("data-ground", next);
    };

    const schedule = () => {
      // rAF-coalesced, and only ever scheduled BY an event. An idle page runs no
      // frame callbacks, which is what scripts/rm-audit.mjs measures.
      if (frame) return;
      frame = requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    // Images and webfonts land after mount and move every boundary below them.
    if (document.readyState !== "complete")
      window.addEventListener("load", schedule);
    // The click that answers the entry question takes a viewport of document
    // out of the flow without scrolling anything, so the hero becomes the
    // section under the sample point with no event to notice it by. The ground
    // crosses to product here, under a still-opaque entry sheet, which is the
    // same beat the old build hid the register hand-off in.
    const entry = new MutationObserver(schedule);
    entry.observe(root, { attributes: true, attributeFilter: ["data-entry"] });

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(disarm);
      entry.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("load", schedule);
      root.removeAttribute("data-ground-fade");
    };
  }, [vertical, answered]);

  return null;
}
