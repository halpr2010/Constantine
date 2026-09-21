"use client";

import { stillQuery } from "@/lib/motion";
import { useEffect, useRef, useState } from "react";

/**
 * StoreJourney — the retail floor as a zone-flow card, sibling to the demo
 * station beside it in the hero.
 *
 * It answers the question the station cannot: not "is this fixture working"
 * but "where does the floor's attention actually sit, and when". Four zones,
 * one profile per hour, and a walk through the trading day.
 *
 * WEEKDAY AGAINST WEEKEND is the point of the card rather than decoration. The
 * same store runs two different demand mixes — a weekday leans on the product
 * floor and empties by early evening, a weekend fills the experience bar and
 * the lounge and holds late — and a single averaged day hides exactly the
 * thing a store lead needs to staff and merchandise against. The card cycles
 * between the two and says which one it is showing.
 *
 * HONESTY (§9, §4d rule 2). Nothing here came from a store. The two profiles
 * are hand-set below and the card is labelled illustrative. Deterministic, so
 * the server render and the client render agree and the capture harness gets
 * the same bytes twice.
 *
 * COLOUR. Heat is opacity of the instrument scale, not a hue ramp: this is a
 * nested product-register stage and the register is white-on-black in all four
 * palettes, so a monochrome ramp needs no new token and cannot drift between
 * themes.
 */

const HOURS = ["09", "11", "13", "15", "17", "19"] as const;

type Zone = {
  key: string;
  label: string;
  /** Band on the plan, top and bottom in viewBox units. */
  y0: number;
  y1: number;
  /** Share of the zone's capacity in use, one per entry in HOURS. */
  weekday: number[];
  weekend: number[];
};

const ZONES: Zone[] = [
  {
    key: "lounge",
    label: "Lounge",
    y0: 20,
    y1: 88,
    weekday: [0.06, 0.18, 0.34, 0.26, 0.2, 0.1],
    weekend: [0.16, 0.42, 0.68, 0.74, 0.66, 0.44],
  },
  {
    key: "bar",
    label: "Experience bar",
    y0: 88,
    y1: 152,
    weekday: [0.12, 0.3, 0.52, 0.38, 0.3, 0.16],
    weekend: [0.3, 0.62, 0.86, 0.78, 0.7, 0.4],
  },
  {
    key: "floor",
    label: "Product floor",
    y0: 152,
    y1: 236,
    weekday: [0.28, 0.56, 0.74, 0.62, 0.7, 0.34],
    weekend: [0.34, 0.6, 0.72, 0.68, 0.58, 0.3],
  },
  {
    key: "entrance",
    label: "Entrance",
    y0: 236,
    y1: 290,
    weekday: [0.2, 0.44, 0.56, 0.42, 0.62, 0.28],
    weekend: [0.3, 0.64, 0.7, 0.6, 0.52, 0.26],
  },
];

/** Seconds per hour step, and how long the card holds on a full day before
 *  swapping the demand mix. Slow on purpose — §5 keeps hero motion ambient. */
const STEP_S = 1.35;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export default function StoreJourney({ active = true }: { active?: boolean }) {
  const [phase, setPhase] = useState(0); // hours travelled, continuous
  const [still, setStill] = useState(false);

  useEffect(() => {
    const mq = stillQuery();
    if (!mq) return;
    const sync = () => setStill(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const raf = useRef(0);
  useEffect(() => {
    // Parked on a hidden vertical, or frozen by the reduced-motion setting: the
    // card holds its opening hour rather than running a clock nobody sees.
    if (!active || still) return;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      setPhase((p) => (p + dt / STEP_S) % (HOURS.length * 2));
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, [active, still]);

  // The first pass through HOURS is the weekday, the second the weekend.
  const weekend = phase >= HOURS.length;
  const local = phase % HOURS.length;
  const i = Math.floor(local);
  const f = local - i;
  const j = (i + 1) % HOURS.length;

  const level = (z: Zone) => {
    const series = weekend ? z.weekend : z.weekday;
    return lerp(series[i], series[j], f);
  };

  const now = ZONES.map((z) => ({ z, v: level(z) }));
  const busiest = now.reduce((a, b) => (b.v > a.v ? b : a));

  return (
    <div className="relative h-full w-full flex-shrink-0 overflow-visible rounded-3xl min-h-[480px] md:min-h-[600px]">
      <div
        className="absolute inset-0 rounded-3xl"
        style={{ background: "var(--wall-backdrop)" }}
      />
      <div className="absolute inset-0 flex items-center justify-center overflow-visible">
        <div className="relative">
          <div
            data-register="product"
            data-testid={active ? "exhibit-card" : undefined}
            className="relative flex flex-col items-center rounded-[20px] p-5"
          >
            <div className="rounded-[16px] bg-transparent p-3">
              <div className="rounded-[12px] p-3">
                <div
                  className="relative overflow-hidden rounded-[10px] h-[300px] w-[225px] md:h-[380px] md:w-[285px]"
                  aria-label={`Store floor: four zones, ${
                    weekend ? "weekend" : "weekday"
                  } at ${HOURS[i]}:00, busiest zone ${busiest.z.label}`}
                >
                  <svg
                    viewBox="0 0 200 310"
                    className="absolute inset-0 h-full w-full text-instrument-fg"
                    fill="none"
                    stroke="currentColor"
                    aria-hidden
                    focusable="false"
                  >
                    {/* Zone heat, painted before the line-work so the hairlines
                        stay crisp on top of it. */}
                    {now.map(({ z, v }) => (
                      <rect
                        key={z.key}
                        x={20}
                        y={z.y0}
                        width={160}
                        height={z.y1 - z.y0}
                        fill="currentColor"
                        stroke="none"
                        opacity={0.05 + v * 0.42}
                      />
                    ))}

                    {/* Footprint and the zone divisions. */}
                    <path d="M20 20 H180 V290 H20 Z" strokeWidth={1.6} />
                    {ZONES.slice(0, -1).map((z) => (
                      <path
                        key={z.key}
                        d={`M20 ${z.y1} H180`}
                        strokeWidth={1}
                        opacity={0.45}
                      />
                    ))}

                    {/* The one door, and the journey up through the floor. */}
                    <path d="M86 290 H114" strokeWidth={3} />
                    <path
                      d="M100 286 L100 262 L62 226 L108 190 L142 160 L96 124 L120 96 L100 62"
                      strokeWidth={1.2}
                      strokeDasharray="3 4"
                      opacity={0.55}
                    />

                    {/* Where attention collects right now: one ring per zone,
                        sized by that zone's current level. */}
                    {now.map(({ z, v }) => (
                      <circle
                        key={z.key}
                        cx={150}
                        cy={(z.y0 + z.y1) / 2}
                        r={3 + v * 9}
                        strokeWidth={1.1}
                        opacity={0.3 + v * 0.6}
                      />
                    ))}

                    {ZONES.map((z) => (
                      <text
                        key={z.key}
                        x={30}
                        y={(z.y0 + z.y1) / 2 + 3.5}
                        fill="currentColor"
                        stroke="none"
                        fontSize={9}
                        letterSpacing={0.6}
                      >
                        {z.label.toUpperCase()}
                      </text>
                    ))}
                  </svg>
                </div>
              </div>
            </div>

            {/* The plaque, laid out exactly like the demo station's beside it. */}
            <div className="mt-0.5 w-full min-w-[240px] space-y-3 px-2 py-3 text-sm text-instrument-fg">
              <div className="pb-4 text-center">
                <div className="font-medium text-instrument-fg-strong">
                  Store journey
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="whitespace-nowrap">Demand mix</span>
                <span data-testid="journey-mix">
                  {weekend ? "Weekend" : "Weekday"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="whitespace-nowrap">Hour</span>
                <span>{HOURS[i]}:00</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="whitespace-nowrap">Busiest zone</span>
                <span data-testid="journey-busiest">{busiest.z.label}</span>
              </div>
              <div className="pt-1 text-center text-xs font-medium text-instrument-fg">
                Engagement by zone
              </div>
              {/* Four rails, one per zone, filled to this hour's level. The
                  same geometry the ledger in #problem uses, at card scale. */}
              <div className="space-y-1.5 pt-1">
                {now.map(({ z, v }) => (
                  <div key={z.key} className="flex items-center gap-2">
                    <span className="w-[86px] shrink-0 truncate text-[10px] text-instrument-fg">
                      {z.label}
                    </span>
                    <span className="h-1.5 flex-1 rounded-sm bg-instrument-well">
                      <span
                        className="block h-full rounded-sm bg-instrument-fg"
                        style={{ width: `${Math.round(v * 100)}%` }}
                      />
                    </span>
                  </div>
                ))}
              </div>
              <div className="pt-1 text-center text-[10px] text-instrument-fg">
                Illustrative
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
