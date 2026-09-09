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
 * The entry choreography, in milliseconds. The question fades, the entry view
 * unmounts on the same beat, and the hero animation (globals.css) picks up
 * exactly where it leaves off. Held here because three files have to agree on
 * the timing and the drift has to be legible in a 3fps capture strip
 * (scripts/motion-strip.mjs samples 12 frames over 4s).
 */
export const ENTRY_FADE_MS = 280;
export const ENTRY_DRIFT_MS = 1000;

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
      // "entering" is what arms the hero's fade-in rule. It is cleared once
      // the animation has finished so the resting page is never a dimmer —
      // tests/reveal.spec.ts measures exactly that.
      root.setAttribute("data-entry", "entering");
      setLeaving(true);
      window.setTimeout(() => setAnswered(true), ENTRY_FADE_MS);
      window.setTimeout(
        () => root.setAttribute("data-entry", "answered"),
        ENTRY_FADE_MS + ENTRY_DRIFT_MS + 200
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
