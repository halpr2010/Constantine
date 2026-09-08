"use client";

import { useVertical } from "@/components/VerticalContext";

/**
 * The site's entry view (§4, Claryo 10/10 — design-refs/strips/Clary_Selector.png).
 *
 * Frames 1–2 of that strip are the whole brief: a clean ground, the question
 * sitting high on the screen, the track just under it, and nothing else. The
 * emptiness is the effect, so this component carries no product imagery — the
 * distance being judged is distance from that frame.
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
      data-register="canvas"
      data-state={leaving ? "leaving" : "asking"}
      className="entry-view"
    >
      <p
        id="entry-question"
        className="entry-question text-balance text-4xl font-semibold tracking-tight text-fg-primary md:text-5xl"
      >
        Are you a…
      </p>
      <p className="entry-hint text-sm text-fg-muted">
        Choose one and every section below is set up for that space. You can
        switch at any time.
      </p>
    </div>
  );
}
