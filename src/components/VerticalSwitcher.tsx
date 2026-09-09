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
 * Constantine measures in that space.
 *
 * REWORKED 09 Sep 2026. The first pass drew two hairline glyphs, and hairlines
 * of the same weight in the same box carry the same visual mass: at 17px the
 * two choices still read as a pair of small dark ticks and the difference only
 * arrived once the label had been read, which is the note being answered. The
 * founder's word is TILE, and the reference mark is a solid swatch, so these are
 * solid now — and the differentiator is the tile's own OUTLINE, which is legible
 * before any interior detail resolves: museums get a PORTRAIT tile (a hung
 * frame), gyms a LANDSCAPE one (a loaded bar).
 *
 * Each is a single evenodd path so the interior is a true hole rather than a
 * second fill. The mark sits on the raised pill when its choice is lit and on
 * the track when it is not, and those are two different grounds; a knockout
 * painted in either colour would be wrong on the other.
 */
function VerticalMark({ id }: { id: Vertical }) {
  return (
    <svg className="vsel-mark" viewBox="0 0 18 18" aria-hidden focusable="false">
      {id === "museums" ? (
        // A hung frame, 11 x 14, with the picture knocked out of it.
        <path
          fillRule="evenodd"
          fill="currentColor"
          d="M3.5 2 H14.5 V16 H3.5 Z M5.4 12.9 L8.2 8.3 L10.2 10.9 L11.6 9.1 L13 12.9 Z"
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
