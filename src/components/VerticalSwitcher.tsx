"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  ENTRY_DRIFT_MS,
  useVertical,
  type Vertical,
} from "@/components/VerticalContext";

const CHOICES: [Vertical, string][] = [
  ["museums", "Museums & Galleries"],
  ["gyms", "Gyms"],
];

/**
 * How much smaller the track gets once it has drifted into the header. Frame 4
 * of design-refs/strips/Clary_Selector.png shows the docked tab at roughly
 * two-thirds the entry size; 0.8 is as far as ours can shrink before
 * "Museums & Galleries" stops being comfortably readable at 390w.
 */
const DOCK_SCALE = 0.8;
/** Slow out of the centre, settle into the corner. */
const DRIFT_EASE = "cubic-bezier(0.62, 0.02, 0.15, 1)";

type Geom = Record<Vertical, { x: number; w: number }>;

/** The dock slot that is actually laid out right now (wide header row vs the narrow one). */
function activeSlot(): HTMLElement | null {
  const slots = Array.from(
    document.querySelectorAll<HTMLElement>("[data-dock-slot]")
  );
  return slots.find((s) => s.offsetParent !== null) ?? slots[0] ?? null;
}

/**
 * The site's ONE vertical control (§4). It is the entry view's track and the
 * header's switcher — the same DOM node in both places, not two that hand off,
 * which is what lets the reference's defining move be literal: on selection
 * the track lifts out of the page and DRIFTS to the top right, and the thing
 * that lands in the header is the thing you just clicked.
 *
 * The journey is a FLIP. While the question stands the track is absolutely
 * positioned in the document at the 48vh line the entry view is laid out
 * around, so it scrolls with the page like any other content. On selection it
 * is re-anchored to the viewport at exactly the pixel it already occupies, and
 * then transitions to the header dock slot's rect. Measuring the slot rather
 * than hard-coding a corner is what keeps the landing correct at 390w, where
 * the slot is a second header row, and at 1440w, where it sits between the nav
 * and the pilot CTA.
 *
 * TESTIDS: the harness drives `select-museums` / `select-gyms` (the capture in
 * scripts/screenshot.mjs answers the gate with these, and cannot see past it
 * without them) and the floors drive `hero-tab-museums` / `hero-tab-gyms`. One
 * element cannot carry two, so each choice is a labelled wrapper around its
 * own button; both resolve to the same click.
 */
export default function VerticalSwitcher() {
  const { vertical, answered, choose } = useVertical();
  const tabRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const choiceRefs = useRef<Partial<Record<Vertical, HTMLSpanElement | null>>>({});
  // Set the instant a choice is made, well before `answered` flips at the end
  // of the fade: the pill must stay under the chosen label for the whole
  // drift, including after the pointer has left.
  const [picked, setPicked] = useState(false);
  const committed = picked || answered;
  const [hovered, setHovered] = useState<Vertical | null>(null);
  const [geom, setGeom] = useState<Geom | null>(null);
  const dockedRef = useRef(false);

  /** Label geometry for the sliding pill. Layout values, so the docked scale never leaks in. */
  const measure = useCallback(() => {
    const next: Partial<Geom> = {};
    for (const [id] of CHOICES) {
      const c = choiceRefs.current[id];
      if (!c) return;
      next[id] = { x: c.offsetLeft, w: c.offsetWidth };
    }
    setGeom(next as Geom);
  }, []);

  /** Re-anchor the track to the viewport without moving it by one pixel. */
  const liftOff = useCallback(() => {
    const el = tabRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.transition = "none";
    el.style.position = "fixed";
    el.style.left = "0px";
    el.style.top = "0px";
    el.style.transformOrigin = "0 0";
    el.style.transform = `translate3d(${r.left}px, ${r.top}px, 0) scale(1)`;
    void el.offsetHeight; // flush, so the transition below has a start value
  }, []);

  const applyDock = useCallback((animate: boolean) => {
    const el = tabRef.current;
    if (!el) return;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    // Reserve the landing space first: the header lays out around the tab, and
    // the slot's rect is only meaningful once it has the docked size.
    const slot = activeSlot();
    let x = Math.max(12, window.innerWidth - w * DOCK_SCALE - 24);
    let y = 14;
    if (slot) {
      slot.style.width = `${Math.round(w * DOCK_SCALE)}px`;
      slot.style.height = `${Math.round(h * DOCK_SCALE)}px`;
      const r = slot.getBoundingClientRect();
      if (r.width > 0) {
        x = r.left;
        y = r.top;
      }
    }
    el.style.transition = animate
      ? `transform ${ENTRY_DRIFT_MS}ms ${DRIFT_EASE}`
      : "none";
    el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${DOCK_SCALE})`;
  }, []);

  // Measuring the DOM and storing the result is the one thing an effect is
  // for; react-hooks/set-state-in-effect flags it anyway, and there is no
  // render-time answer to "how wide is this label".
  useLayoutEffect(() => {
    measure();
    // Geist arrives after first paint and the labels resize under the pill.
    document.fonts?.ready.then(measure).catch(() => {});
  }, [measure]);

  // Arriving already answered — a returning visitor, or a deep link. No drift
  // to play: the track belongs in the header and was never anywhere else.
  useLayoutEffect(() => {
    if (!answered || dockedRef.current) return;
    dockedRef.current = true;
    liftOff();
    applyDock(false);
  }, [answered, liftOff, applyDock]);

  useEffect(() => {
    const onResize = () => {
      measure();
      if (dockedRef.current) applyDock(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [measure, applyDock]);

  const onChoose = (v: Vertical) => {
    const first = !dockedRef.current;
    setPicked(true);
    choose(v);
    if (!first) return;
    dockedRef.current = true;
    liftOff();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      applyDock(false); // §5: the entry freezes, it does not drift
      return;
    }
    requestAnimationFrame(() => applyDock(true));
  };

  // Before the answer the pill previews what the pointer is over; after it,
  // the pill IS the answer and hover no longer moves it.
  const lit = committed ? vertical : hovered;
  const g = geom && lit ? geom[lit] : null;

  return (
    <div ref={tabRef} className="vsel-tab">
      <div
        ref={trackRef}
        role="group"
        aria-label="Choose your space"
        className="relative flex items-center rounded-full border border-line-hairline bg-surface-control p-1.5 shadow-sm"
      >
        {geom && (
          <span
            aria-hidden
            className={`vsel-pill ${
              g ? "bg-action opacity-100" : "bg-transparent opacity-0"
            }`}
            style={{
              transform: `translateX(${(g ?? geom.museums).x}px)`,
              width: (g ?? geom.museums).w,
            }}
          >
            {/* The reference's one spot of colour: a small saturated marker on
                the raised pill. Without it the track reads as disabled chrome. */}
            {g && <span className="vsel-dot bg-accent-positive" />}
          </span>
        )}
        {CHOICES.map(([id, label]) => (
          <span
            key={id}
            ref={(n) => {
              choiceRefs.current[id] = n;
            }}
            data-testid={`select-${id}`}
            className="relative z-10 block"
          >
            <button
              type="button"
              data-testid={`hero-tab-${id}`}
              aria-pressed={committed && vertical === id}
              onClick={() => onChoose(id)}
              onPointerEnter={() => setHovered(id)}
              onPointerLeave={() => setHovered((h) => (h === id ? null : h))}
              onFocus={() => setHovered(id)}
              onBlur={() => setHovered((h) => (h === id ? null : h))}
              className={`block whitespace-nowrap rounded-full py-3 pl-9 pr-7 text-[15px] font-semibold tracking-tight transition-colors motion-reduce:transition-none md:py-3.5 md:pl-11 md:pr-9 md:text-lg ${
                lit === id ? "text-on-action" : "text-fg-primary"
              }`}
            >
              {label}
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
