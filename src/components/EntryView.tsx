"use client";

import { useLayoutEffect, useRef } from "react";
import { useVertical } from "@/components/VerticalContext";

/**
 * The site's entry view (§4, Claryo 10/10 — design-refs/strips/Clary_Selector.png).
 *
 * Frames 1–2 of that strip are the whole brief, and
 * design-refs/Claryo-Tab-Selector.png is the same screen at full resolution:
 * a clean LIGHT ground, the question sitting high on the screen at display
 * scale, the track just under it, and nothing else. The emptiness is the
 * effect, so this component carries no product imagery and, since 08 Sep 2026,
 * no explanatory subline either — the reference screen holds the question and
 * the pills and nothing more, and the track's two labelled markers already say
 * that a choice is being asked for.
 *
 * The ground is the technical register, which is the one register defined light
 * in all four live palettes; see the entry block in globals.css for why that is
 * the honest reading of §5 rather than a palette fix.
 *
 * The track itself is NOT a child of this element. On selection it drifts to
 * the header while this block fades out and unmounts, and a control living
 * inside the thing being removed cannot survive the journey; see
 * VerticalSwitcher, which floats over this view at the same 48vh line the
 * layout below reserves for it.
 *
 * Nothing here gates anything. The hero and every section below it are in the
 * document one scroll away, and a deep link or a crawler skips this view
 * entirely (VerticalContext). That is also why this block stays IN FLOW while
 * the question stands rather than being a fixed overlay: an unanswered visitor
 * can scroll straight past it, and tests/reveal.spec.ts walks the whole page
 * without ever answering.
 */
export default function EntryView() {
  const { answered, leaving } = useVertical();
  const ref = useRef<HTMLDivElement>(null);

  /**
   * The 100vh block leaves the FLOW on the click, and leaves the SCREEN a
   * second later. Those used to be the same event, which is what made holding
   * the question expensive: the unmount removes a viewport of document from
   * above the hero, and landing that shift inside the 1500ms hover window of
   * `P2 — equipment hover drives the timer` is what discarded candidate
   * 20260908-173122-1 (DESIGN.md §4).
   *
   * Taking the block out of flow at the instant of the click moves the shift to
   * a moment when nothing is being pointed at yet, and the view is re-anchored
   * to the pixel it already occupies so nothing appears to move. The hero then
   * sits at document top for the whole drift, fully laid out, behind an opaque
   * ground — and revealing it is a matter of lifting that ground.
   */
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !leaving) return;
    // Measured while the element is still in flow: no rule below changes its
    // position, so this runs before the browser has painted the new state.
    const { top } = el.getBoundingClientRect();
    el.style.position = "fixed";
    el.style.top = `${top}px`;
    el.style.left = "0";
    el.style.right = "0";
    // The hero is live underneath from here on. Nothing in this view is
    // clickable, so it must not stand between the visitor and the demos.
    el.style.pointerEvents = "none";
  }, [leaving]);

  if (answered && !leaving) return null;

  return (
    <div
      ref={ref}
      data-testid="vertical-selector"
      data-entry-view=""
      // BOTH, and they do different jobs. `data-ground` declares that while the
      // gate owns the middle of the screen the whole page stands in the
      // technical register, so a visitor who scrolls past the question rather
      // than answering it crosses to the hero's product ground the same way
      // every other boundary crosses. `data-register` paints: this sheet has to
      // stay opaquely technical through the drift, after the page ground below
      // it has already become product, which is exactly what makes the crossing
      // invisible. GroundDriver stops reading this element once `data-state` is
      // "leaving", because by then it is out of the flow and owns no scroll
      // offset.
      data-ground="technical"
      data-register="technical"
      data-state={leaving ? "leaving" : "asking"}
      className="entry-view"
    >
      {/* Measured off the reference still: the question is ~64px on a 1410px
          viewport, roughly a third larger than the 48px it was set at here,
          and that weight is most of what made ours read as a caption over a
          control rather than as the screen's one question.

          It does not leave with the click. Reference frame 3 has it standing,
          greyed, while the tab is still travelling; the grey is applied in the
          entry block of globals.css off this element's data-state. */}
      <p
        id="entry-question"
        className="entry-question text-balance text-5xl font-semibold tracking-tight text-fg-primary md:text-6xl"
      >
        What kind of space do you run?
      </p>
    </div>
  );
}
