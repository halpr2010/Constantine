"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/**
 * BenchPressWireframe — two stacked wireframe layers: a static bench with an
 * empty rack, and a loaded barbell on top that presses down and back up.
 *
 * The barbell's plates are opaque in the source PNG, so they occlude the bench
 * lines behind them as the bar travels. No masking needed.
 *
 * Tempo and travel are both driven by `util` (the same proximity value that
 * feeds the Utilisation metric), so an unused bench sits perfectly still and a
 * fully utilised one works through a complete rep.
 */

// Placement of the barbell over the bench, as percentages of the container.
// Nudge these if the bar doesn't sit exactly on the rack hooks.
const BARBELL_WIDTH_PCT = 85.1;
const BARBELL_LEFT_PCT = 2.3;
const BARBELL_REST_TOP_PCT = 15.0; // where the bar sits racked, when unused

// The rep is centred on the racked position: the bar rises LIFT_UP_PCT above it
// and presses PRESS_DOWN_PCT below it, both in percent of container height.
// PRESS_DOWN_PCT sets the low point over the chest — leave it alone to keep the
// bottom of the rep where it is. LIFT_UP_PCT sets how high the bar returns.
// The bench render is landscape inside a portrait card. The bench artwork plus
// the barbell spans 91.4% of the frame width, so zooming past ~109% starts
// cutting the plates and the end of the bench. 108% is the largest zoom that
// still shows the whole thing.
const BENCH_ZOOM_PCT = 108;
const BENCH_LEFT_PCT = -1.8;

const PRESS_DOWN_PCT = 16;
const LIFT_UP_PCT = 64;

// Rep tempo, in half-reps per second: TEMPO_BASE when idle, rising to
// TEMPO_BASE + TEMPO_UTIL at full utilisation. A full rep at 100% takes about
// 1.5s; at 50% utilisation nearer 3s, so the pace visibly tracks the metric.
const TEMPO_BASE = 0.12;
const TEMPO_UTIL = 1.2;

// Dwell at the top and bottom of every rep, in seconds. Held in real time
// rather than scaled by utilisation, so the pause reads the same at any pace.
const HOLD_S = 0.3;

export default function BenchPressWireframe({ util }: { util: number }) {
  const [dy, setDy] = useState(0);
  // A rep is four segments: press down, hold at the chest, lift, hold at the top.
  const segRef = useRef<"down" | "holdBottom" | "up" | "holdTop">("down");
  const segTRef = useRef(0);
  const utilRef = useRef(util);

  useEffect(() => {
    utilRef.current = util;
  }, [util]);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      const u = utilRef.current;
      // Rep tempo scales with utilisation; the holds do not.
      const moveDur = 1 / (TEMPO_BASE + u * TEMPO_UTIL); // seconds per direction

      segTRef.current += dt;
      let seg = segRef.current;
      for (let guard = 0; guard < 4; guard++) {
        const dur = seg === "down" || seg === "up" ? moveDur : HOLD_S;
        if (segTRef.current < dur) break;
        segTRef.current -= dur;
        seg =
          seg === "down"
            ? "holdBottom"
            : seg === "holdBottom"
              ? "up"
              : seg === "up"
                ? "holdTop"
                : "down";
      }
      segRef.current = seg;

      // press: 0 at the top of the range, 1 at the chest. Eased so the bar
      // decelerates into each hold rather than stopping dead.
      const t = Math.min(1, segTRef.current / moveDur);
      const press =
        seg === "down"
          ? 0.5 - 0.5 * Math.cos(Math.PI * t)
          : seg === "up"
            ? 0.5 + 0.5 * Math.cos(Math.PI * t)
            : seg === "holdBottom"
              ? 1
              : 0;

      // press 0 -> LIFT_UP_PCT above the rack, press 1 -> PRESS_DOWN_PCT below.
      // The whole swing is scaled by utilisation, so the bar eases back onto the
      // hooks when nobody is using the bench rather than freezing mid-rep.
      setDy(u * (press * (PRESS_DOWN_PCT + LIFT_UP_PCT) - LIFT_UP_PCT));

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      className="absolute"
      style={{
        width: `${BENCH_ZOOM_PCT}%`,
        left: `${BENCH_LEFT_PCT}%`,
        top: "50%",
        transform: "translateY(-50%)",
        aspectRatio: "1402 / 1122",
      }}
    >
      <Image
        src="/bench2.png"
        alt=""
        width={1402}
        height={1122}
        className="absolute inset-0 h-full w-full object-contain"
      />
      <Image
        src="/bp_barbell.png"
        alt=""
        width={1056}
        height={373}
        className="absolute object-contain"
        style={{
          width: `${BARBELL_WIDTH_PCT}%`,
          height: "auto",
          left: `${BARBELL_LEFT_PCT}%`,
          top: `${BARBELL_REST_TOP_PCT}%`,
          transform: `translateY(${dy}%)`,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
