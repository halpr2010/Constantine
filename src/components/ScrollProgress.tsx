"use client";

import { useEffect, useRef } from "react";

/**
 * §5 scroll progress bar, per the Slingshot reference
 * (design-refs/Slingshot-Scroll-Bar-{1,2}.png).
 *
 * One clean line on the header's bottom edge, growing left to right. The
 * reference has no graduations, no section marks and no read head: the whole
 * effect is a single hairline of ink laid over the header's own rule, and its
 * restraint is the point. An earlier version built this as an engraved
 * measuring rule; it was rejected, and the ticks also hung down into the page
 * and struck through headings at 390w.
 *
 * Scroll position is a direct readout, not ambient motion, so it keeps
 * tracking under prefers-reduced-motion (§5 ambient-vs-interaction scope);
 * only the easing on the growth is dropped there.
 */
export default function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame = 0;

    const update = () => {
      const doc = document.documentElement;
      const range = doc.scrollHeight - doc.clientHeight;
      const p =
        range > 0 ? Math.min(100, Math.max(0, (window.scrollY / range) * 100)) : 0;
      // Written straight to the DOM: a scroll frame must not cost a render.
      el.style.setProperty("--p", `${p}%`);
      el.setAttribute("aria-valuenow", String(Math.round(p)));
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        update();
      });
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    // Images and fonts land after mount and change the scroll range.
    if (document.readyState !== "complete") {
      window.addEventListener("load", onScroll);
    }
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("load", onScroll);
    };
  }, []);

  return (
    <div
      ref={ref}
      data-testid="scroll-progress"
      role="progressbar"
      aria-label="Page position"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={0}
      // Sits ON the header's bottom hairline rather than below it, so the line
      // reads as that rule being inked in rather than as a second border.
      className="pointer-events-none absolute inset-x-0 -bottom-px h-px"
      style={{ "--p": "0%" } as React.CSSProperties}
    >
      <div
        className="h-full bg-fg-primary transition-[width] duration-150 ease-linear motion-reduce:transition-none"
        style={{ width: "var(--p)" }}
      />
    </div>
  );
}
