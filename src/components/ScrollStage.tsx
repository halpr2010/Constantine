"use client";

import { useEffect } from "react";
import { useVertical } from "@/components/VerticalContext";

/**
 * The scroll driver behind every [data-reveal] on the page.
 *
 * A REVEAL IS A TRANSITION INTO A READABLE STATE (§5, added 08 Sep 2026).
 * The previous driver bound opacity continuously to where an element sat in
 * the viewport, which meant the page only read correctly at one exact scroll
 * position: 29 text elements were still between 0.16 and 0.97 while sitting
 * 80px clear of both viewport edges, headings among them. Scroll position now
 * decides only WHEN a reveal starts. Once started it runs to completion on its
 * own clock and LATCHES, so anything you can comfortably see is fully legible
 * and stays that way whichever direction you scroll.
 *
 * FAIL-OPEN, AND NO FLASH. --r is a registered custom property whose initial
 * value is 1, so before this component runs — and if it never runs, and under
 * prefers-reduced-motion — every element is already in its final revealed
 * state. This driver only ever dims an element that is BELOW the fold at the
 * moment it first sees it; content that is already on screen is marked
 * revealed untouched, so hydration cannot darken anything the visitor is
 * looking at.
 */

/** Reveal duration, ms. Mirrors --reveal-dur in globals.css. */
const DUR = 420;
/**
 * One unit of authored `lag` in ms. Reveal's lag values run to about 0.5, and
 * the reveal floor samples 700ms after a scroll lands, so the worst chain
 * (0.5 * 320 + 420 = 580ms) has to finish inside that window with room for a
 * slow frame. Clamped rather than trusted, so a future lag of 3 cannot quietly
 * push the last card past the settle.
 */
const LAG_MS = 320;
const LAG_MAX = 0.6;
/**
 * Trigger line, in px up from the bottom of the viewport. tests/reveal.spec.ts
 * judges any text sitting 80px clear of both edges, so the trigger must fire
 * strictly EARLIER than that line or an element could be judged while still
 * arming. 56 < 80 by enough to survive a fractional-pixel rect.
 */
const TRIGGER = 56;

/** Element top at this fraction of viewport height ⇒ span progress 0. */
const SPAN_START = 0.62;

export default function ScrollStage() {
  // The switcher rebuilds most of the page's DOM, so the scan is re-run per
  // vertical rather than watching the whole body for mutations — the hero
  // demos rewrite their metric text every frame and would drown a
  // MutationObserver in churn.
  const { vertical } = useVertical();

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) return;

    /** Armed: dimmed, waiting for the trigger line. */
    const armed = new Set<HTMLElement>();
    /** Spans: the #how spine, which is a rule being inked rather than content
     *  being made readable, so it stays bound to scroll position. */
    const spans = new Set<HTMLElement>();
    const timers = new Set<ReturnType<typeof setTimeout>>();
    let frame = 0;
    let pending: HTMLElement[] = [];

    /** Done: drop the inline value so --r returns to its registered 1, which
     *  also clears the blur and transform layers rather than leaving forty
     *  elements pinned at an identity transform for the rest of the session. */
    const clear = (el: HTMLElement) => {
      el.style.removeProperty("--r");
      el.style.removeProperty("--reveal-delay");
      el.style.removeProperty("--reveal-ms");
      delete el.dataset.revealArmed;
    };

    const finish = (el: HTMLElement) => {
      clear(el);
      el.dataset.revealed = "";
      armed.delete(el);
    };

    const start = (el: HTMLElement) => {
      const delay = Number(el.style.getPropertyValue("--reveal-ms")) || 0;
      el.style.setProperty("--r", "1");
      armed.delete(el);
      const t = setTimeout(() => {
        timers.delete(t);
        finish(el);
      }, DUR + delay + 80);
      timers.add(t);
    };

    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      const line = vh - TRIGGER;
      const doc = document.documentElement;
      // At the very end of the document there is no scroll left for the last
      // elements to travel through, so everything is resolved by definition —
      // otherwise the footer would sit under permanently dimmed copy.
      const atEnd = window.scrollY + vh >= doc.scrollHeight - 2;
      // Read every rect before writing anything: interleaving forces a layout
      // per element on a scroll frame.
      const due: HTMLElement[] = [];
      for (const el of armed) {
        const r = el.getBoundingClientRect();
        if (atEnd || (r.top < line && r.bottom > -1)) due.push(el);
      }
      const inked: [HTMLElement, number][] = [];
      for (const el of spans) {
        const r = el.getBoundingClientRect();
        // A rule that threads a whole block cannot key off its own top edge:
        // that finishes while the block is still arriving. Key off how far the
        // block has passed through the viewport, so the rule inks in step with
        // the steps it connects and completes as the last one lands.
        const p = (vh * SPAN_START - r.top) / Math.max(1, r.height - vh * 0.28);
        inked.push([el, atEnd ? 1 : p < 0 ? 0 : p > 1 ? 1 : p]);
      }
      for (const el of due) start(el);
      for (const [el, p] of inked) {
        if (p >= 1) {
          el.style.removeProperty("--r");
          el.dataset.revealed = "";
          spans.delete(el);
        } else el.style.setProperty("--r", p.toFixed(3));
      }
    };

    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    const scan = () => {
      const vh = window.innerHeight;
      const line = vh - TRIGGER;
      const found: [HTMLElement, DOMRect][] = [];
      for (const el of document.querySelectorAll<HTMLElement>(
        "[data-reveal]:not([data-revealed])"
      )) {
        if (armed.has(el) || spans.has(el) || el.style.getPropertyValue("--r"))
          continue;
        found.push([el, el.getBoundingClientRect()]);
      }
      for (const [el, r] of found) {
        if (el.dataset.revealMode === "span") {
          spans.add(el);
          continue;
        }
        // Already on screen when we first see it: leave it alone. Dimming what
        // the visitor is looking at is the flash this driver exists to avoid,
        // and a reveal the visitor never scrolled to is not a reveal.
        if (r.top < line) {
          el.dataset.revealed = "";
          continue;
        }
        const lag = Math.min(
          Math.max(parseFloat(el.dataset.revealLag ?? "0") || 0, 0),
          LAG_MAX
        );
        const ms = Math.round(lag * LAG_MS);
        el.style.setProperty("--reveal-ms", String(ms));
        el.style.setProperty("--reveal-delay", `${ms}ms`);
        el.style.setProperty("--r", "0");
        armed.add(el);
        pending.push(el);
      }
      // Arm the transition a frame after the dim value lands. Setting both in
      // one style recalc would give the transition nothing to run from, and
      // the element would snap instead of arriving.
      if (pending.length) {
        const batch = pending;
        pending = [];
        requestAnimationFrame(() => {
          for (const el of batch) if (armed.has(el)) el.dataset.revealArmed = "";
          schedule();
        });
      }
      schedule();
    };

    scan();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    // Images and webfonts land after mount and move everything below them.
    if (document.readyState !== "complete") window.addEventListener("load", scan);

    return () => {
      cancelAnimationFrame(frame);
      for (const t of timers) clearTimeout(t);
      // Hand anything still mid-flight back in its undimmed default state. The
      // vertical switcher tears this effect down and rebuilds it; an element
      // left holding --r: 0 would be skipped by the next scan (it looks
      // managed) and stay grey for the rest of the session.
      for (const el of armed) clear(el);
      for (const el of spans) el.style.removeProperty("--r");
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("load", scan);
    };
  }, [vertical]);

  return null;
}
