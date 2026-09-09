"use client";

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
 * entirely (VerticalContext).
 */
export default function EntryView() {
  const { answered, leaving } = useVertical();
  if (answered) return null;

  return (
    <div
      data-testid="vertical-selector"
      data-entry-view=""
      data-register="technical"
      data-state={leaving ? "leaving" : "asking"}
      className="entry-view"
    >
      {/* Measured off the reference still: the question is ~64px on a 1410px
          viewport, roughly a third larger than the 48px it was set at here,
          and that weight is most of what made ours read as a caption over a
          control rather than as the screen's one question. */}
      <p
        id="entry-question"
        className="entry-question text-balance text-5xl font-semibold tracking-tight text-fg-primary md:text-6xl"
      >
        Are you a…
      </p>
    </div>
  );
}
