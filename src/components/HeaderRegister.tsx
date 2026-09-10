"use client";

import { useEffect } from "react";
import { useVertical } from "@/components/VerticalContext";

/**
 * The header takes the register of the section it is standing on.
 *
 * §4 already built half of this: while the entry question stands, the header
 * joins the entry's technical register so it disappears into the light ground
 * "instead of laying a dark bar across it" (page.tsx). After selection it
 * reverted to the ROOT ground and held it for the whole page, which is the same
 * defect with the fix switched off — over #how or #privacy in a light palette,
 * or over #problem in a dark one, it painted a band of the opposite polarity
 * across the top of every frame. The flow review measured its edge stepping
 * 53 → 114 → 255 across 3 CSS px. Removing the border took the edge; this takes
 * the band.
 *
 * Nothing here animates: the attribute flips, and the 400ms colour transition
 * on [data-entry-chrome] does the crossing. That is deliberate — a header
 * whose ground is bound continuously to scroll position is a dimmer, which is
 * the mistake §5 records against the first scroll-flow build.
 *
 * THE SWITCH LINE is the header's own foot, and it is chosen rather than
 * inherited. The seam that paints the crossing is weighted 56% above the
 * section boundary, so its alpha passes half at very nearly the boundary
 * itself: switching when the boundary passes the header's bottom edge puts the
 * header's change at the same moment as the ground's, in the same place on
 * screen. Switching at the viewport top would run it a header-height early, and
 * at the section's midpoint a screen late.
 *
 * Only top-level sections are read. Every register on this page nests —
 * FloorLedger, PrivacyStage and the #stack hub all declare `product` inside a
 * section that declares something else — and a header that took its ink from a
 * nested stage would flicker its way down the page.
 */
export default function HeaderRegister() {
  // The switcher rebuilds the page's sections, so the scan is redone per
  // vertical rather than held in a MutationObserver.
  const { vertical, answered } = useVertical();

  useEffect(() => {
    const header = document.querySelector<HTMLElement>("[data-entry-chrome]");
    if (!header) return;

    // While the question stands the entry view owns the header's register
    // (globals.css). Setting one here would win on source order and put the
    // page's ground back across the gate.
    if (!answered) {
      delete header.dataset.register;
      return;
    }

    let frame = 0;
    let last = "";

    const update = () => {
      frame = 0;
      const line = header.getBoundingClientRect().height + 1;
      const sections = document.querySelectorAll<HTMLElement>(
        "main > section[data-register], main > footer[data-register]"
      );
      // Document order, so the last section whose top has passed the line is
      // the one under it. Above the first section — which only happens if the
      // page is scrolled above the hero — the first section's register stands.
      let reg = sections[0]?.dataset.register ?? "";
      for (const sec of sections) {
        if (sec.getBoundingClientRect().top > line) break;
        reg = sec.dataset.register ?? reg;
      }
      if (reg === last) return;
      last = reg;
      if (reg) header.dataset.register = reg;
      else delete header.dataset.register;
    };

    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    // Images and webfonts land after mount and move every boundary below them.
    if (document.readyState !== "complete")
      window.addEventListener("load", schedule);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("load", schedule);
      // Hand the header back with no register of its own, so a rebuild starts
      // from the page ground rather than from whichever section was last read.
      delete header.dataset.register;
    };
  }, [vertical, answered]);

  return null;
}
