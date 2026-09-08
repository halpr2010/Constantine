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

/** Where the answer is remembered, so a returning visitor is not re-gated (§4). */
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
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(VERTICAL_KEY);
    } catch {
      // Private mode or a blocked origin: the gate simply asks again.
    }
    if (isVertical(stored)) {
      setVertical(stored);
      setAnswered(true);
    } else if (window.location.hash) {
      // A deep link must never land behind an unanswered question (§4). The
      // default vertical stands and nothing is written to storage, so the
      // question is still waiting on a later visit to the bare URL.
      setAnswered(true);
    }
    document.documentElement.setAttribute(
      "data-entry",
      isVertical(stored) || window.location.hash ? "answered" : "asking"
    );
  }, []);

  const choose = useCallback(
    (v: Vertical) => {
      setVertical(v);
      try {
        window.localStorage.setItem(VERTICAL_KEY, v);
      } catch {
        // Remembering is a courtesy; failing to remember is not an error.
      }
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
