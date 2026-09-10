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
 * two-thirds the entry size, and the reference shrinks it hard: ~98px on the
 * entry screen against ~54px docked.
 *
 * It is per-width because only the desktop step grew on 09 Sep. The header row
 * is 88px (a 56px wordmark plus its padding), so a 95px entry track has to land
 * near 0.68 to sit inside it with air; 0.8 would leave 6px. Below 768 the entry
 * track is still 81px and 0.8 is as far as it can shrink before
 * "Museums & Galleries" stops being comfortably readable.
 */
const dockScale = () => (window.innerWidth >= 768 ? 0.68 : 0.8);
/**
 * The drift is a STRAIGHT DIAGONAL to the corner.
 *
 * It used to run on two clocks — vertical front-loaded, horizontal back-loaded —
 * so the track rose to the header band first and only then ran along it. That
 * was a judgement call made to keep the path off the hero demo, and the founder
 * rejected it: "it has started to swing upwards and then to the top right after
 * being selected. Can we change this to having the selector just move diagonally
 * to the top right." One easing on both axes draws one line.
 */
const DRIFT_EASE = "cubic-bezier(0.32, 0.72, 0.24, 1)";
const DRIFT_Y = DRIFT_EASE;
const DRIFT_X = DRIFT_EASE;

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
 * Constantine measures in that space.
 *
 * REWORKED AGAIN 10 Sep 2026, on two founder notes.
 *
 * THE MUSEUM MARK WAS A BROKEN-IMAGE ICON. It drew a frame with a mountain
 * knocked out of it - which is the universal "this picture failed to load"
 * glyph, and the founder read it exactly that way: "it looks like a placeholder
 * for an image that hasn't rendered." It is now a gallery facade: pediment,
 * four columns, a step. Unmistakable at 17px and impossible to read as a
 * failure state.
 *
 * THE MARKS ARE COLOURED, and fixed rather than tokenised. Founder: "the gym
 * icon should be a pink colour and the museum/gallery should be a blue colour."
 * These identify a VERTICAL the way a logo identifies a vendor, so blue stays
 * blue in all four palettes - the same exception the vendor marks in
 * StackSection take, for the same reason. Both clear 3:1 on every ground they
 * sit on, light or dark.
 *
 * The gym mark keeps its evenodd knockout so the bar and plates are true holes:
 * it sits on the raised pill when lit and on the track when not, and a knockout
 * painted in either ground's colour would be wrong on the other.
 */
const MARK_COLOUR: Record<Vertical, string> = {
  museums: "#3B82F6",
  gyms: "#EC4899",
};

function VerticalMark({ id }: { id: Vertical }) {
  return (
    <svg
      className="vsel-mark"
      viewBox="0 0 18 18"
      aria-hidden
      focusable="false"
      style={{ color: MARK_COLOUR[id] }}
    >
      {id === "museums" ? (
        // A gallery facade: pediment, four columns, a step.
        <path
          fill="currentColor"
          d="M9 2.1 L16.5 7.1 H1.5 Z M2.7 8.4 H4.5 V13.7 H2.7 Z M6.3 8.4 H8.1 V13.7 H6.3 Z M9.9 8.4 H11.7 V13.7 H9.9 Z M13.5 8.4 H15.3 V13.7 H13.5 Z M1.5 14.7 H16.5 V16.1 H1.5 Z"
        />
      ) : (
        // A loaded bar, 15 x 10, with the bar and its two plates knocked out.
        <path
          fillRule="evenodd"
          fill="currentColor"
          d="M1.5 4 H16.5 V14 H1.5 Z M5.1 8.4 H12.9 V9.6 H5.1 Z M3.1 6.5 H4.5 V11.5 H3.1 Z M13.5 6.5 H14.9 V11.5 H13.5 Z"
        />
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
    const scale = dockScale();
    // Reserve the landing space first: the header lays out around the tab, and
    // the slot's rect is only meaningful once it has the docked size.
    const slot = activeSlot();
    let x = Math.max(12, window.innerWidth - w * scale - 24);
    let y = 14;
    if (slot) {
      slot.style.width = `${Math.round(w * scale)}px`;
      slot.style.height = `${Math.round(h * scale)}px`;
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
    lf.style.transform = `translate3d(0, ${y}px, 0) scale(${scale})`;
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
