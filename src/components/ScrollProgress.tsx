"use client";

import { useEffect, useRef, useState } from "react";

/**
 * §5 scroll progress bar, built as the rule the page is measured against
 * rather than a tube that fills up.
 *
 * Three parts, all in the demos' data-overlay idiom (thin ink, small square
 * markers, no chrome): a fine graduated scale rising off the header's
 * hairline, a major mark descending from the top at every section's real
 * scroll offset, and a read head that inks the scale it has already crossed.
 * The section marks are what make it an instrument instead of a loading strip
 * — they are measured from the live document, so the rule is calibrated to
 * this page rather than decorated with evenly-spaced notches.
 *
 * Scroll position is a direct readout, not ambient motion, so it keeps
 * tracking under prefers-reduced-motion; only the damping on the head is
 * dropped there (§5 ambient-vs-interaction scope).
 */

/** One fine graduation per 4% of the rule: still a readable scale at 390px. */
const FINE_STEP = "4%";

/**
 * The engraved scale, drawn twice — once unmeasured, once inked and clipped to
 * the read head. Colours arrive as token references so both copies re-theme.
 */
function Scale({
  fine,
  major,
  marks,
}: {
  fine: string;
  major: string;
  marks: number[];
}) {
  return (
    <>
      <div
        className="absolute inset-x-0 bottom-0 h-[3px]"
        // 25 hairlines as one paint rather than 25 elements. Tailwind has no
        // utility for a repeating gradient; the colour is still a token.
        style={{
          backgroundImage: `repeating-linear-gradient(to right, ${fine} 0 1px, transparent 1px ${FINE_STEP})`,
        }}
      />
      {marks.map((m) => (
        <div
          key={m}
          className="absolute top-0 h-[5px] w-px"
          style={{ left: `${m}%`, backgroundColor: major }}
        />
      ))}
    </>
  );
}

export default function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  const [marks, setMarks] = useState<number[]>([]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let frame = 0;
    // Scroll range at the last remeasure. The vertical switcher swaps whole
    // sections in and out, so section offsets go stale; the range is already
    // read to compute progress, which makes it a free staleness check.
    let measuredRange = -1;

    const update = () => {
      const doc = document.documentElement;
      const range = doc.scrollHeight - doc.clientHeight;
      const p =
        range > 0 ? Math.min(100, Math.max(0, (window.scrollY / range) * 100)) : 0;
      el.style.setProperty("--p", `${p}%`);
      // Written straight to the DOM: a scroll frame must not cost a render.
      el.setAttribute("aria-valuenow", String(Math.round(p)));

      if (range > 0 && range !== measuredRange) {
        measuredRange = range;
        setMarks(
          Array.from(document.querySelectorAll("main > section"))
            .map((s) => ((s as HTMLElement).offsetTop / range) * 100)
            // A section starting past the last scrollable pixel would pin to
            // the far end and stack on its neighbour, reading as one thicker
            // graduation rather than two sections.
            .filter((m) => m > 1 && m < 99)
        );
      }
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
    // Images and fonts land after mount and move every section offset.
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
      className="pointer-events-none absolute inset-x-0 bottom-0 h-2.5"
      style={{ "--p": "0%" } as React.CSSProperties}
    >
      {/* Unmeasured: the scale sits quietly under the header's own hairline. */}
      <Scale fine="var(--text-subtle)" major="var(--text-muted)" marks={marks} />

      {/* Measured: the same scale in full ink, revealed as far as the head. */}
      <div
        className="absolute inset-0 transition-[clip-path] duration-150 ease-linear motion-reduce:transition-none"
        style={{ clipPath: "inset(0 calc(100% - var(--p)) 0 0)" }}
      >
        <Scale fine="var(--text-primary)" major="var(--text-primary)" marks={marks} />
      </div>

      {/* The head, and the baseline it has laid down behind it. */}
      <div
        className="absolute bottom-0 left-0 top-0 transition-[width] duration-150 ease-linear motion-reduce:transition-none"
        style={{ width: "var(--p)" }}
      >
        <div className="absolute inset-x-0 bottom-0 h-px bg-fg-primary" />
        <div className="absolute bottom-0 right-0 top-0 w-px bg-fg-primary" />
        <div className="absolute right-0 top-0 h-[3px] w-[3px] bg-fg-primary" />
      </div>
    </div>
  );
}
