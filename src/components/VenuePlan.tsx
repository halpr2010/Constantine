"use client";

import type { CSSProperties } from "react";

/**
 * The custom object (§5 "Ambient background": "a white technical wireframe
 * sits on top and augments per scroll step").
 *
 * References, both opened before this was written:
 *  - design-refs/strips/Claryo_Ambiance_and_Scroll_Functionality_3.png — a
 *    single white hairline polygon of a building footprint over the purple
 *    field, changing as the step text accumulates. No fill, no shading, no
 *    label on the drawing itself.
 *  - design-refs/strips/Claryo_Ambient_Hero_Page.png — the same line-work
 *    BUILDING: frame 4 is one line, frame 5 is a full wireframe with small
 *    square vertex handles on it. The augmentation reads as drafting, so the
 *    grammar here is stroke-dashoffset (a line drawing itself), never opacity.
 *
 * What it is, for Constantine: the venue geometry the product measures. It
 * augments through the four things Constantine actually establishes about a
 * space, in order — the floor as built, the zones that matter, what each
 * camera can see, and where people go. Museums get rooms and hanging walls,
 * gyms get bays and a studio, so the object is the visitor's own venue rather
 * than a generic diagram.
 *
 * Colour comes from the instrument scale (--instrument-fg*), which is on-stage
 * white in every theme, so the line-work is white over the field in all four
 * palettes exactly as the reference is.
 */

export const STEPS = 4;

type Cone = { x: number; y: number; a: number };

type Geometry = {
  /** The outer boundary. One closed path. */
  footprint: string;
  /** Interior structure. Doorways are gaps between segments, not symbols. */
  walls: string[];
  /** Small rectangles: hanging walls in a gallery, equipment bays in a gym. */
  bays: [number, number, number, number][];
  zones: { x: number; y: number; t: string }[];
  cameras: Cone[];
  /** The path a visitor takes through the zones. */
  flow: string;
  /** Where attention collects. */
  dwell: { x: number; y: number; r: number }[];
};

/**
 * Cropped tight to the drawing rather than to a round number. The founder's
 * note on the first venue object was that it sat as a small diagram inside its
 * frame against a reference polygon filling ~70% of viewport height; padding
 * baked into the viewBox is half of how that happens.
 */
const VIEW = { x: 80, y: 58, w: 740, h: 512 };

const MUSEUM: Geometry = {
  footprint:
    "M120 540 L120 300 L172 300 L172 236 L120 236 L120 88 L432 88 L432 148 " +
    "L504 148 L504 88 L780 88 L780 322 L716 322 L716 392 L780 392 L780 540 Z",
  walls: [
    "M432 88 L432 196",
    "M432 250 L432 322",
    "M120 322 L392 322",
    "M470 322 L780 322",
    "M286 322 L286 430",
    "M286 486 L286 540",
  ],
  bays: [
    [196, 132, 96, 9],
    [316, 210, 9, 76],
    [560, 132, 9, 84],
    [636, 258, 104, 9],
    [352, 386, 9, 88],
    [470, 470, 112, 9],
  ],
  zones: [
    { x: 252, y: 262, t: "Z1" },
    { x: 618, y: 168, t: "Z2" },
    { x: 196, y: 468, t: "Z3" },
    { x: 552, y: 400, t: "Z4" },
  ],
  cameras: [
    { x: 132, y: 100, a: 48 },
    { x: 768, y: 100, a: 132 },
    { x: 768, y: 528, a: 218 },
    { x: 132, y: 528, a: 312 },
    { x: 431, y: 336, a: 90 },
  ],
  flow:
    "M206 534 L206 424 L262 372 L336 344 L430 232 L520 190 L618 208 " +
    "L698 288 L700 400 L640 476",
  dwell: [
    { x: 430, y: 232, r: 30 },
    { x: 618, y: 208, r: 21 },
    { x: 262, y: 372, r: 24 },
  ],
};

const GYM: Geometry = {
  footprint:
    "M110 528 L110 300 L164 300 L164 240 L110 240 L110 96 L520 96 L520 140 " +
    "L600 140 L600 96 L790 96 L790 340 L730 340 L730 404 L790 404 L790 528 Z",
  walls: [
    "M520 140 L520 216",
    "M520 268 L520 340",
    "M110 340 L440 340",
    "M498 340 L790 340",
    "M300 340 L300 528",
  ],
  bays: [
    [150, 154, 44, 22],
    [212, 154, 44, 22],
    [274, 154, 44, 22],
    [336, 154, 44, 22],
    [398, 154, 44, 22],
    [150, 214, 44, 22],
    [212, 214, 44, 22],
    [274, 214, 44, 22],
    [598, 178, 34, 54],
    [648, 178, 34, 54],
    [698, 178, 34, 54],
    [340, 396, 60, 30],
    [420, 396, 60, 30],
    [500, 396, 60, 30],
    [340, 452, 60, 30],
    [420, 452, 60, 30],
    [500, 452, 60, 30],
  ],
  zones: [
    { x: 200, y: 276, t: "Z1" },
    { x: 654, y: 268, t: "Z2" },
    { x: 196, y: 436, t: "Z3" },
    { x: 618, y: 452, t: "Z4" },
  ],
  cameras: [
    { x: 122, y: 108, a: 46 },
    { x: 778, y: 108, a: 134 },
    { x: 778, y: 516, a: 216 },
    { x: 122, y: 516, a: 314 },
    { x: 519, y: 354, a: 90 },
  ],
  flow:
    "M204 522 L204 420 L268 372 L340 300 L420 236 L520 198 L610 214 " +
    "L700 292 L700 400 L620 470",
  dwell: [
    { x: 420, y: 236, r: 28 },
    { x: 700, y: 292, r: 22 },
    { x: 268, y: 372, r: 20 },
  ],
};

/** A camera's field of view: two rays and the arc that closes them. */
function cone({ x, y, a }: Cone, reach = 176, half = 25) {
  const r = (d: number) => [
    x + reach * Math.cos(((a + d) * Math.PI) / 180),
    y + reach * Math.sin(((a + d) * Math.PI) / 180),
  ];
  const [ax, ay] = r(-half);
  const [bx, by] = r(half);
  return `M${ax.toFixed(1)} ${ay.toFixed(1)} L${x} ${y} L${bx.toFixed(1)} ${by.toFixed(1)}
          M${ax.toFixed(1)} ${ay.toFixed(1)} A${reach} ${reach} 0 0 1 ${bx.toFixed(1)} ${by.toFixed(1)}`;
}

/**
 * Draw progress as stroke-dashoffset. `--d` is the path's own length in user
 * units, set per element, so every line draws at the same speed regardless of
 * how long it is. Lengths are over-estimates on purpose: a dash pattern longer
 * than the path just means the tail of the range is already fully drawn, which
 * is invisible, whereas an under-estimate leaves a permanent gap.
 */
const drawn = (len: number, f: number): CSSProperties => ({
  strokeDasharray: len,
  strokeDashoffset: len * (1 - f),
});

export default function VenuePlan({
  vertical,
  progress,
  className = "",
}: {
  vertical: "museums" | "gyms";
  /** One 0..1 draw fraction per step, from the stage's scroll position. */
  progress: number[];
  className?: string;
}) {
  const g = vertical === "gyms" ? GYM : MUSEUM;
  const [p0, p1, p2, p3] = progress;
  const ease = (f: number) => (f <= 0 ? 0 : f >= 1 ? 1 : f * f * (3 - 2 * f));

  // Per-step draw fractions. Step 1's footprint is one long path, so it gets
  // a single sweep; the later steps have many short elements and stagger
  // across them, which is what makes an augmentation read as drafting rather
  // than as a layer being switched on.
  const stagger = (f: number, i: number, n: number) =>
    ease(Math.min(1, Math.max(0, f * (n + 2) - i)));

  return (
    <svg
      viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}`}
      className={className}
      fill="none"
      aria-hidden
      // Every line is a hairline at any scale. The reference's polygon is one
      // pixel wide at 1440 and stays one pixel wide; a stroke that thickens
      // with the drawing turns a plan into an illustration.
      style={{ vectorEffect: "non-scaling-stroke" } as CSSProperties}
    >
      <g
        stroke="var(--instrument-fg-strong)"
        strokeWidth={1}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      >
        {/* 1 · FOOTPRINT — the floor as built */}
        <path d={g.footprint} style={drawn(2600, ease(p0))} />

        {/* 2 · ZONES — interior structure, bays, and the zone marks */}
        <g stroke="var(--instrument-fg)" opacity={p1 > 0 ? 1 : 0}>
          {g.walls.map((d, i) => (
            <path key={d} d={d} style={drawn(420, stagger(p1, i, g.walls.length))} />
          ))}
          {g.bays.map(([x, y, w, h], i) => (
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width={w}
              height={h}
              style={drawn(2 * (w + h), stagger(p1, i, g.bays.length))}
            />
          ))}
        </g>
        <g fill="var(--instrument-fg-weak)" stroke="none">
          {g.zones.map((z, i) => (
            <text
              key={z.t}
              x={z.x}
              y={z.y}
              fontSize={17}
              letterSpacing={1.5}
              opacity={ease(Math.max(0, p1 * 2 - 0.9 - i * 0.06))}
            >
              {z.t}
            </text>
          ))}
        </g>

        {/* 3 · SIGHTLINES — what each camera can see. The square handles are
            the reference's vertex marks, reused as camera positions. */}
        <g opacity={p2 > 0 ? 1 : 0}>
          {g.cameras.map((c, i) => {
            const f = stagger(p2, i, g.cameras.length);
            return (
              <g key={`${c.x}-${c.y}`}>
                <path
                  d={cone(c)}
                  stroke="var(--instrument-fg-faint)"
                  style={drawn(700, f)}
                />
                <rect
                  x={c.x - 4}
                  y={c.y - 4}
                  width={8}
                  height={8}
                  fill="var(--instrument-fg-strong)"
                  stroke="none"
                  opacity={f}
                />
              </g>
            );
          })}
        </g>

        {/* 4 · MOVEMENT — the path through the zones, and where attention
            collects. Dashed, because it is measured rather than built. */}
        <g opacity={p3 > 0 ? 1 : 0}>
          <path
            d={g.flow}
            stroke="var(--instrument-fg-strong)"
            strokeWidth={1.5}
            style={{
              // Two dash patterns cannot coexist, so the travelling dash is
              // the reveal: the visible run grows and the trailing gap is the
              // rest of the path.
              strokeDasharray: `${1100 * ease(p3)} 4000`,
            }}
          />
          {g.dwell.map((d, i) => {
            const f = stagger(p3, i, g.dwell.length);
            return (
              <circle
                key={`${d.x}-${d.y}`}
                cx={d.x}
                cy={d.y}
                r={d.r}
                stroke="var(--instrument-fg)"
                style={drawn(2 * Math.PI * d.r, f)}
              />
            );
          })}
        </g>
      </g>
    </svg>
  );
}
