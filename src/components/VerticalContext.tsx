"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Vertical = "museums" | "gyms";

/**
 * FOUNDER DECISION, 09 Sep 2026: the entry question is asked on EVERY load.
 * The choice used to be remembered, which was my call and not a brief - §4's
 * "remember the choice locally so returning visitors are not re-gated" was a
 * line I wrote myself. Founder verdict: "the selector should be mandatory every
 * time". Nothing is persisted; the key survives only to clear stale values.
 */
export const VERTICAL_KEY = "constantine:vertical";

/**
 * The entry choreography, in milliseconds. Held here because three files have
 * to agree on the timing and the drift has to be legible in a 3fps capture
 * strip (scripts/motion-strip.mjs samples 12 frames over 4s). The same two
 * numbers are mirrored as --entry-drift / --entry-out in globals.css.
 *
 * REORDERED 09 Sep 2026, from reference frame 3 of
 * design-refs/strips/Clary_Selector.png: the greyed question is STILL STANDING
 * as the tab reaches the corner. The old order faded the question out at 280ms
 * against a 1000ms drift, so two thirds of the travel ran over a screen that
 * had already emptied. Now the question holds, dimmed, for the whole drift, and
 * the entry ground is what fades afterwards — the sheet lifting off IS the
 * chosen view's fade-in, so there is one crossing rather than two.
 */
export const ENTRY_DRIFT_MS = 1000;
/** How long the entry ground takes to lift once the tab has landed. */
export const ENTRY_FADE_MS = 420;

type VerticalContextValue = {
  vertical: Vertical;
  setVertical: (v: Vertical) => void;
  /** True once the entry question has an answer, or the visitor arrived past it. */
  answered: boolean;
  /** True for the beat between the click and the entry view leaving. */
  leaving: boolean;
  /** Answer the entry question, or switch vertical once it is answered. */
  choose: (v: Vertical) => void;
};

const VerticalCtx = createContext<VerticalContextValue | null>(null);

const isVertical = (v: unknown): v is Vertical => v === "museums" || v === "gyms";

/**
 * Holds the one source of truth for which vertical the page is showing, plus
 * whether the entry question (§4) has been answered.
 *
 * Answered state is deliberately NOT read during render: the server has no
 * localStorage, so reading it in a useState initialiser would make the first
 * client render disagree with the server HTML and React would log a hydration
 * error, which `no console errors on load` treats as a failure. The inline
 * boot script in layout.tsx handles the visual half before first paint by
 * stamping <html data-entry="answered">; this effect handles the React half a
 * frame later.
 */
export function VerticalProvider({ children }: { children: React.ReactNode }) {
  const [vertical, setVertical] = useState<Vertical>("museums");
  const [answered, setAnswered] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    // Clear anything an earlier build stored, so a visitor who already chose is
    // not silently kept out of the gate forever.
    try {
      window.localStorage.removeItem(VERTICAL_KEY);
    } catch {
      // Private mode or a blocked origin: nothing to clear.
    }
    if (window.location.hash) {
      // A deep link must never land behind an unanswered question (§4). The
      // default vertical stands and nothing is written to storage, so the
      // question is still waiting on a later visit to the bare URL.
      setAnswered(true);
    }
    document.documentElement.setAttribute(
      "data-entry",
      window.location.hash ? "answered" : "asking"
    );
  }, []);

  const choose = useCallback(
    (v: Vertical) => {
      setVertical(v);
      // Deliberately NOT persisted: founder decision 09 Sep 2026 - the entry
      // question is asked on every visit.
      if (answered) return; // an ordinary switch, no entry choreography

      const root = document.documentElement;
      const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (still) {
        root.setAttribute("data-entry", "answered");
        setAnswered(true);
        return;
      }
      // "entering" is the beat the tab is travelling in: the header keeps the
      // entry's own register and its nav and CTA stay at zero, so the tab flies
      // into an empty corner the way it does in reference frame 3.
      root.setAttribute("data-entry", "entering");
      setLeaving(true);
      // Everything commits as the tab lands, under a still-opaque entry ground:
      // the hero's crossing seam unmounts here, and the header crosses back to
      // the page's register. Both are invisible at this instant, which is the
      // point of doing them here rather than mid-drift.
      window.setTimeout(() => {
        setAnswered(true);
        root.setAttribute("data-entry", "answered");
      }, ENTRY_DRIFT_MS);
      // Only now does the ground lift, and the chosen view is simply what was
      // behind it. `leaving` is what keeps the entry view mounted through the
      // hold, so it is cleared last — the resting page is never a dimmer, which
      // is what tests/reveal.spec.ts measures.
      window.setTimeout(
        () => setLeaving(false),
        ENTRY_DRIFT_MS + ENTRY_FADE_MS
      );
    },
    [answered]
  );

  const value = useMemo(
    () => ({ vertical, setVertical, answered, leaving, choose }),
    [vertical, answered, leaving, choose]
  );
  return <VerticalCtx.Provider value={value}>{children}</VerticalCtx.Provider>;
}

export function useVertical() {
  const ctx = useContext(VerticalCtx);
  if (!ctx) {
    throw new Error("useVertical must be used inside a VerticalProvider");
  }
  return ctx;
}
