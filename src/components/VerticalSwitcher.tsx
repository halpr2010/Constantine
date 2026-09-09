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
/**
 * The drift is one move on two clocks. Vertical is front-loaded and horizontal
 * is back-loaded, so the track rises to the header band first and only then
 * runs along it to the corner. A single easing on a single transform draws a
 * straight diagonal, which crosses the hero demo on the way — the founder note
 * is "the drift path to the top right", and a diagonal through the middle of
 * the page is not that path.
 */
const DRIFT_Y = "cubic-bezier(0.2, 0.9, 0.25, 1)";
const DRIFT_X = "cubic-bezier(0.75, 0.02, 0.3, 1)";

type Geom = Record<Vertical, { x: number; w: number }>;

/** The dock slot that is actually laid out right now (wide header row vs the narrow one). */
function activeSlot(): HTMLElement | null {
  const slots = Array.from(
    document.querySelectorAll<HTMLElement>("[data-dock-slot]")
  );
  return slots.find((s) => s.offsetParent !== null) ?? slots[0] ?? null;
}

/**
 * The per-vertical marker (founder note (a): the two markers were the same
 * square and had to differentiate the verticals).
 *
 * The reference differentiates by hue — a violet tile for one persona, a lime
 * one for another. We differentiate by FORM instead, and deliberately: the
 * entry screen stands in the technical register, which §5 defines as strict
 * black and white, and a second saturated accent would have to clear AA against
 * four different grounds while still reading as the same brand. A shape does
 * not, and it says something the colour could not — each marker is the thing
 * Constantine measures in that space. Museums get a hung frame; gyms get a
 * loaded bar. Both are one silhouette at 16px, so they separate at a glance
 * before the label is read.
 */
function VerticalMark({ id }: { id: Vertical }) {
  return (
    <svg className="vsel-mark" viewBox="0 0 18 18" aria-hidden focusable="false">
      {id === "museums" ? (
        <>
          <rect
            x="2.6"
            y="2.2"
            width="12.8"
            height="13.6"
            rx="1.4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path d="M5.1 12.6 L8 8.4 L10.1 10.9 L11.9 8.9 L13.1 12.6 Z" fill="currentColor" />
        </>
      ) : (
        <>
          <rect x="5.3" y="7.9" width="7.4" height="2.2" fill="currentColor" />
          <rect x="2.2" y="5" width="3" height="8" rx="1" fill="currentColor" />
          <rect x="12.8" y="5" width="3" height="8" rx="1" fill="currentColor" />
        </>
      )}
    </svg>
  );
}

/**
 * The site's ONE vertical control (§4). It is the entry view's track and the
 * header's switcher — the same DOM node in both places, not two that hand off,
 * which is what lets the reference's defining move be literal: on selection
 * the track lifts out of the page and DRIFTS to the top right, and the thing
 * that lands in the header is the thing you just clicked.
 *
 * The journey is a FLIP. While the question stands the track is absolutely
 * positioned in the document at the 51vh line the entry view is laid out
 * around, so it scrolls with the page like any other content. On selection it
 * is re-anchored to the viewport at exactly the pixel it already occupies, and
 * then transitions to the header dock slot's rect. Measuring the slot rather
 * than hard-coding a corner is what keeps the landing correct at 390w, where
 * the slot is a second header row, and at 1440w, where it sits between the nav
 * and the pilot CTA.
 *
 * The transform is split across two nested elements — the tab moves in X, the
 * lift moves in Y and carries the scale — purely so the two axes can run on
 * different easings. See DRIFT_X / DRIFT_Y.
 *
 * The track declares the technical register itself rather than inheriting one,
 * because it is the one element on the site that has to look the same in two
 * places with different grounds under it (design-refs/Claryo-Tab-Selector.png
 * on white, strip frame 4 docked over black).
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
  const liftRef = useRef<HTMLDivElement>(null);
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
    const lf = liftRef.current;
    if (!el || !lf) return;
    const r = el.getBoundingClientRect();
    el.style.transition = "none";
    el.style.position = "fixed";
    el.style.left = "0px";
    el.style.top = "0px";
    el.style.transform = `translate3d(${r.left}px, 0, 0)`;
    lf.style.transition = "none";
    lf.style.transformOrigin = "0 0";
    lf.style.transform = `translate3d(0, ${r.top}px, 0) scale(1)`;
    void el.offsetHeight; // flush, so the transitions below have a start value
  }, []);

  const applyDock = useCallback((animate: boolean) => {
    const el = tabRef.current;
    const lf = liftRef.current;
    if (!el || !lf) return;
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
      ? `transform ${ENTRY_DRIFT_MS}ms ${DRIFT_X}`
      : "none";
    el.style.transform = `translate3d(${x}px, 0, 0)`;
    lf.style.transition = animate
      ? `transform ${ENTRY_DRIFT_MS}ms ${DRIFT_Y}`
      : "none";
    lf.style.transform = `translate3d(0, ${y}px, 0) scale(${DOCK_SCALE})`;
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
      <div ref={liftRef} className="vsel-lift">
        <div
          ref={trackRef}
          role="group"
          aria-label="Choose your space"
          data-register="technical"
          className="vsel-track"
        >
          {geom && (
            <span
              aria-hidden
              className={`vsel-pill ${g ? "opacity-100" : "opacity-0"}`}
              style={{
                transform: `translateX(${(g ?? geom.museums).x}px)`,
                width: (g ?? geom.museums).w,
              }}
            />
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
                className={`vsel-choice motion-reduce:transition-none ${
                  lit === id ? "text-fg-primary" : "text-fg-muted"
                }`}
              >
                <VerticalMark id={id} />
                {label}
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
