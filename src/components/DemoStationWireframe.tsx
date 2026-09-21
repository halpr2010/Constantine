"use client";

import { stillQuery } from "@/lib/motion";
import { useEffect, useRef, useState } from "react";

/**
 * DemoStationWireframe — the retail counterpart to BenchPressWireframe.
 *
 * Drawn rather than photographed. The gym wall composites two PNG layers, but
 * there is no retail equivalent in /public and CLAUDE.md freezes brand assets,
 * so this is line art in the same white-on-black CAD register: a demo table,
 * a screen on a stand, and two product blocks stood on the surface.
 *
 * DELIBERATELY ABSTRACT. The blocks are plain volumes with no spout, handle,
 * cup or category cue of any kind — this vertical is generic experiential
 * retail and the drawing must not resolve into anyone's product.
 *
 * `util` is the same proximity value that drives the metrics beside it, and it
 * drives three things here: how far the screen's scan line travels, how bright
 * the attention arcs over the nearer block are, and how far the block lifts off
 * the surface. An unused station therefore sits perfectly still.
 */

const SCAN_PERIOD_BASE = 5.5; // seconds per sweep when idle
const SCAN_PERIOD_FAST = 1.15; // ...and when fully engaged

export default function DemoStationWireframe({ util }: { util: number }) {
  const [t, setT] = useState(0);
  const utilRef = useRef(util);
  useEffect(() => {
    utilRef.current = util;
  }, [util]);

  // §5 SCOPE, same contract as the bench: under prefers-reduced-motion the
  // clock stops and the graphic answers the pointer through POSITION alone.
  const [still, setStill] = useState(false);
  useEffect(() => {
    const mq = stillQuery();
    if (!mq) return;
    const sync = () => setStill(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (still) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const u = utilRef.current;
      const period = SCAN_PERIOD_BASE + (SCAN_PERIOD_FAST - SCAN_PERIOD_BASE) * u;
      setT((prev) => (prev + dt / period) % 1);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [still]);

  // Still: the sweep is placed straight from utilisation instead of running.
  const sweep = still ? util : t;
  const scanY = 126 + sweep * 40;
  // The nearer block lifts as the station is worked, which is the one piece of
  // travel in the drawing and the reason it reads as in use rather than lit.
  const lift = -util * 5;

  return (
    <svg
      viewBox="0 0 240 320"
      className="absolute inset-0 h-full w-full text-instrument-fg"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="square"
      aria-hidden
      focusable="false"
    >
      {/* The table */}
      <rect x={28} y={186} width={184} height={9} />
      <rect x={42} y={195} width={8} height={96} />
      <rect x={190} y={195} width={8} height={96} />
      <path d="M50 258 H190" strokeWidth={1.2} opacity={0.75} />
      <path d="M20 291 H220" strokeWidth={1.2} opacity={0.5} />

      {/* Screen on a stand */}
      <rect x={56} y={118} width={62} height={52} rx={3} />
      <path d="M87 170 V182" strokeWidth={1.2} />
      <rect x={70} y={182} width={34} height={4} />
      {/* The scan line: the station reading the floor in front of it. */}
      <path
        d={`M60 ${scanY.toFixed(1)} H114`}
        strokeWidth={1.2}
        opacity={0.35 + util * 0.5}
      />

      {/* Two product blocks. Plain volumes, no category cues. */}
      <g transform={`translate(0 ${lift.toFixed(2)})`}>
        <rect x={140} y={140} width={36} height={46} rx={3} />
        <path d="M148 140 V132 H168 V140" strokeWidth={1.2} />
        {/* Attention arcs, brightening with engagement rather than appearing. */}
        <g opacity={0.12 + util * 0.68} strokeWidth={1.2}>
          <path d="M184 152 A18 18 0 0 1 184 174" />
          <path d="M192 146 A26 26 0 0 1 192 180" />
        </g>
      </g>
      <rect x={186} y={160} width={22} height={26} rx={2} opacity={0.8} />

      {/* Dimension witness lines, the CAD tell the venue plan also uses. */}
      <g strokeWidth={1} opacity={0.42}>
        <path d="M28 302 H212" />
        <path d="M28 297 V307" />
        <path d="M212 297 V307" />
      </g>
    </svg>
  );
}
