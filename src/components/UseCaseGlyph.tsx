"use client";

/**
 * UseCaseGlyph — the missing half of the §5 content module on #use.
 *
 * §5's standard card is "eyebrow → title → 1-2 lines of copy → clean product
 * visual". The use-cases section shipped the first three and stopped, which is
 * why it was the flattest block on the page and why tests/reveal.spec.ts scored
 * it as a wall of prose. Each card now ends in the reading that use case
 * actually produces, drawn in the instrument idiom the rest of the site uses.
 *
 * THREE KINDS, NOT SIX DRAWINGS. Both verticals ask the same three shapes of
 * question, so one glyph vocabulary serves both and the museums/gyms switch
 * changes the values and the caption rather than the artwork:
 *
 *   ranked    what is at the top and what is at the bottom of a set
 *   delta     the same thing measured before a change and after it
 *   anomaly   one series leaving the band it normally sits in
 *
 * Values are hand-set constants, not generated: three glyphs at this size want
 * a silhouette that reads at a glance, and a shaped random gives a blur.
 * Nothing here came from a venue, and the section carries the illustrative
 * note once rather than three times.
 *
 * Each glyph is a nested product-register stage, so the instrument scale is
 * on-stage white in all four palettes. Static geometry: nothing to freeze.
 */

const W = 200;
const H = 74;
const PAD = 10;
const FLOOR = H - 16;

export type GlyphKind = "ranked" | "delta" | "anomaly";

/** Ranked: six columns, the leader carrying the handle. */
const RANKED = [1, 0.74, 0.62, 0.44, 0.31, 0.18];

/** Delta: the same three measures before a change and after it. */
const DELTA: [number[], number[]] = [
  [0.42, 0.3, 0.5],
  [0.78, 0.66, 0.71],
];

/** Anomaly: a series that sits in its band, then drops out of it. */
const SERIES = [0.62, 0.68, 0.6, 0.71, 0.66, 0.64, 0.7, 0.63, 0.24, 0.19, 0.22, 0.2];
/** Where the band the series normally holds sits, as a fraction of the plot. */
const BAND: [number, number] = [0.52, 0.8];

const y = (v: number) => FLOOR - v * (FLOOR - PAD);

function Ranked() {
  const n = RANKED.length;
  const step = (W - 2 * PAD) / n;
  return (
    <g>
      {RANKED.map((v, i) => (
        <g key={i}>
          <rect
            x={PAD + i * step}
            y={y(v)}
            width={step - 6}
            height={FLOOR - y(v)}
            fill="var(--instrument-fg-weak)"
            opacity={i === 0 ? 0.95 : 0.34}
          />
          {i === 0 && (
            <rect
              x={PAD + step / 2 - 5}
              y={y(v) - 9}
              width="5"
              height="5"
              fill="var(--instrument-fg-strong)"
            />
          )}
        </g>
      ))}
      <line
        x1={PAD}
        y1={FLOOR}
        x2={W - PAD}
        y2={FLOOR}
        stroke="var(--instrument-fg-faint)"
        strokeWidth="0.8"
      />
    </g>
  );
}

function Delta() {
  const groupW = (W - 3 * PAD) / 2;
  const barW = groupW / 4;
  return (
    <g>
      {DELTA.map((group, g) => {
        const x0 = PAD + g * (groupW + PAD);
        return (
          <g key={g}>
            {group.map((v, i) => (
              <rect
                key={i}
                x={x0 + i * (barW + 5)}
                y={y(v)}
                width={barW}
                height={FLOOR - y(v)}
                fill={g === 0 ? "var(--instrument-fg-weak)" : "var(--instrument-fg-strong)"}
                opacity={g === 0 ? 0.34 : 0.9}
              />
            ))}
          </g>
        );
      })}
      {/* The bracket that says these two groups are the same measurement. */}
      <path
        d={`M${PAD + groupW * 0.5} ${PAD} L${PAD + groupW * 0.5} ${PAD - 4} L${
          PAD * 2 + groupW * 1.5
        } ${PAD - 4} L${PAD * 2 + groupW * 1.5} ${PAD}`}
        fill="none"
        stroke="var(--instrument-fg-faint)"
        strokeWidth="0.8"
      />
      <line
        x1={PAD}
        y1={FLOOR}
        x2={W - PAD}
        y2={FLOOR}
        stroke="var(--instrument-fg-faint)"
        strokeWidth="0.8"
      />
    </g>
  );
}

function Anomaly() {
  const step = (W - 2 * PAD) / (SERIES.length - 1);
  const px = (i: number) => PAD + i * step;
  const drop = SERIES.findIndex((v) => v < BAND[0]);
  return (
    <g>
      {/* The band the series normally holds. */}
      <rect
        x={PAD}
        y={y(BAND[1])}
        width={W - 2 * PAD}
        height={y(BAND[0]) - y(BAND[1])}
        fill="var(--instrument-fg-weak)"
        opacity="0.16"
      />
      {BAND.map((b) => (
        <line
          key={b}
          x1={PAD}
          y1={y(b)}
          x2={W - PAD}
          y2={y(b)}
          stroke="var(--instrument-fg-faint)"
          strokeWidth="0.7"
          strokeDasharray="3 4"
        />
      ))}
      <path
        d={SERIES.map((v, i) => `${i ? "L" : "M"}${px(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ")}
        fill="none"
        stroke="var(--instrument-fg-strong)"
        strokeWidth="1.4"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Where it left the band, flagged the way the product would flag it. */}
      <line
        x1={px(drop)}
        y1={y(SERIES[drop])}
        x2={px(drop)}
        y2={FLOOR}
        stroke="var(--instrument-fg-faint)"
        strokeWidth="0.8"
        strokeDasharray="2 3"
      />
      <rect
        x={px(drop) - 3.5}
        y={y(SERIES[drop]) - 3.5}
        width="7"
        height="7"
        fill="var(--instrument-fg-strong)"
      />
      <line
        x1={PAD}
        y1={FLOOR}
        x2={W - PAD}
        y2={FLOOR}
        stroke="var(--instrument-fg-faint)"
        strokeWidth="0.8"
      />
    </g>
  );
}

export default function UseCaseGlyph({
  kind,
  caption,
}: {
  kind: GlyphKind;
  /** What this reading is, in the product's own words. Two or three words. */
  caption: string;
}) {
  return (
    // mt-auto: the three cards carry different amounts of copy, and a glyph
    // hung directly under the text leaves the row of readings stepped.
    <div className="mt-auto pt-5">
    <div
      data-register="product"
      className="relative overflow-hidden rounded-lg border border-line-hairline"
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        className="block h-auto w-full"
        aria-hidden="true"
        focusable="false"
      >
        {kind === "ranked" && <Ranked />}
        {kind === "delta" && <Delta />}
        {kind === "anomaly" && <Anomaly />}
      </svg>
      <div className="px-3 pb-2 font-mono text-[10px] tracking-wide text-instrument-fg">
        {caption}
      </div>
    </div>
    </div>
  );
}
