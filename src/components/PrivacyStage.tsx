"use client";

import { GhostBody, GhostFilter, PoseId, feet } from "@/components/GhostFigure";
import { useVertical } from "@/components/VerticalContext";

/**
 * PrivacyStage — the §5 people treatment used as the ARGUMENT rather than as
 * atmosphere.
 *
 * The founder's note on this section: give it people, anonymised, whose faces
 * never resolve, and let them SHOW the no-tracking claim instead of the prose
 * asserting it. Reference: design-refs/strips/Playvision_People_Movement.png
 * (10/10, "figures with data bound to them"). Read off the strip rather than
 * off prose about it, PlayVision binds data to a body three ways: hairline
 * geometry drawn onto the figure, small mono coordinate readouts floating
 * beside it on leader lines, and a dark stats card in the corner headed by an
 * anonymous player number. All three are here; only the payload differs,
 * because ours has to be an argument about what is NOT held.
 *
 * THE MECHANISM, and the thing that makes this panel different from the
 * Outputs stages it shares a renderer with: the frame is cut by a VERTICAL
 * BOUNDARY — the edge device. Everything left of it is the room, and it is the
 * only place a body exists. Everything right of it is the record, and it holds
 * a floor position, a facing, a dwell and nothing else. The bodies do not stop
 * at the line by being cropped; they DISSOLVE into it, because the mask carries
 * a gradient that eats the figure over the last 70 units before the boundary.
 * The claim "the video is destroyed as it is processed" is therefore drawn
 * rather than stated: you can see where it stops.
 *
 * Data is bound AT THE FEET, not at the head, and that is a content decision.
 * What survives the device is a floor position and an orientation, so the track
 * id, the facing arrow and the leader all attach to the floor mark. Binding
 * them to the body would have drawn a claim the product does not make.
 *
 * FACES. GhostFigure never draws one — a cranial mass and a jaw, and nothing
 * inside that outline, ever (§5, §9). Nothing here adds to the head: the marks
 * this file draws are floor ellipses, square handles, arrows and mono labels.
 *
 * COLOUR. The panel nests `data-register="product"` inside #privacy's technical
 * ground, which is what the Outputs stages do inside their canvas ground: the
 * instrument scale is on-stage white in all four palettes, so the figures read
 * identically in dark, light-canvas, dark-canvas and instrument. `--color-white`
 * and `--color-black` appear only as mask ink — the luminance the mask is read
 * from — and never as a visible paint.
 *
 * MOTION. Static geometry, computed at module scope. Nothing to freeze.
 */

const W = 480;
const H = 330;
/** The edge device. Everything right of it is the record. */
const LINE = 246;
/** How far back from the boundary a body begins to dissolve. */
const FADE = 70;

type Fig = {
  pose: PoseId;
  x: number;
  y: number;
  u: number;
  id: string;
  /** Facing, in degrees clockwise from east — the arrow off the floor mark. */
  facing: number;
};

/**
 * Three people, at three depths. The near figure is large enough that the
 * musculature reads (a deltoid at pictogram scale is three pixels), and the two
 * behind it give the panel a room to be a room. Their floor marks are pulled
 * apart in y so three leaders can run to the boundary without crossing a body.
 */
const CAST: Fig[] = [
  { pose: "gf-regard", x: 74, y: 8, u: 40, id: "t-04", facing: -28 },
  { pose: "gf-walk", x: 158, y: 52, u: 26, id: "t-11", facing: 152 },
  { pose: "gf-stand", x: 200, y: 88, u: 17, id: "t-07", facing: 208 },
];

/** Per-vertical record rows. Illustrative, and the panel says so. */
const RECORDS = {
  museums: [
    { id: "t-04", zone: "zone 3a", dwell: "41s", facing: "NE" },
    { id: "t-11", zone: "zone 3a", dwell: "22s", facing: "SW" },
    { id: "t-07", zone: "zone 3b", dwell: "07s", facing: "SW" },
  ],
  gyms: [
    { id: "t-04", zone: "free weights", dwell: "31m", facing: "NE" },
    { id: "t-11", zone: "cardio", dwell: "18m", facing: "SW" },
    { id: "t-07", zone: "cardio", dwell: "04m", facing: "SW" },
  ],
} as const;

/** What the record does not contain. This is the whole point of the panel. */
const ABSENT: [string, string][] = [
  ["identity", "none"],
  ["face signature", "not computed"],
  ["raw video", "destroyed at source"],
];

function arrow(x: number, y: number, deg: number, len: number) {
  const a = (deg * Math.PI) / 180;
  const tx = x + len * Math.cos(a);
  const ty = y + len * Math.sin(a);
  const wing = (d: number) => {
    const b = a + Math.PI + (d * Math.PI) / 180;
    return `${(tx + len * 0.36 * Math.cos(b)).toFixed(1)} ${(ty + len * 0.36 * Math.sin(b)).toFixed(1)}`;
  };
  return (
    `M${x.toFixed(1)} ${y.toFixed(1)} L${tx.toFixed(1)} ${ty.toFixed(1)}` +
    ` M${tx.toFixed(1)} ${ty.toFixed(1)} L${wing(26)} M${tx.toFixed(1)} ${ty.toFixed(1)} L${wing(-26)}`
  );
}

/**
 * The record card. PlayVision's corner stats panel, headed by an anonymous
 * track rather than a player name, and ending in the three fields that do not
 * exist.
 *
 * Rendered twice, and only ever one of them is displayed. Over the room at
 * sm+, where there is width for it beside the figures; docked underneath below
 * that, because at 390 a 46%-wide card truncated every column to an ellipsis
 * and the payload of the whole panel was three rows of "zon…". The right of
 * the boundary being empty on a phone is not a loss: it is the argument.
 */
function RecordCard({
  rows,
  className,
}: {
  rows: readonly { id: string; zone: string; dwell: string; facing: string }[];
  className: string;
}) {
  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-2">
        <div className="truncate text-[13px] font-medium text-instrument-fg-strong">
          Leaves the device
        </div>
        <span className="shrink-0 rounded-full border border-line-hairline px-1.5 py-0.5 font-mono text-[9px] text-instrument-fg">
          Illustrative
        </span>
      </div>
      <div className="mt-3 space-y-1.5">
        {rows.map((r) => (
          <div key={r.id} className="flex items-baseline gap-2 font-mono text-[11px]">
            <span className="w-9 shrink-0 text-instrument-fg-strong">{r.id}</span>
            <span className="min-w-0 flex-1 truncate text-instrument-fg">{r.zone}</span>
            <span className="shrink-0 text-instrument-fg-strong">{r.dwell}</span>
            <span className="w-6 shrink-0 text-right text-instrument-fg">{r.facing}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 space-y-1 border-t border-line-hairline pt-3">
        {ABSENT.map(([k, v]) => (
          <div key={k} className="flex items-baseline justify-between gap-3">
            <span className="text-[11px] text-instrument-fg">{k}</span>
            <span className="font-mono text-[11px] text-instrument-fg-strong">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PrivacyStage() {
  const { vertical } = useVertical();
  const gym = vertical === "gyms";
  const rows = RECORDS[gym ? "gyms" : "museums"];
  const room = gym ? "gym floor" : "gallery";
  const where = gym ? "On the gym floor" : "In the gallery";

  const fNear = "pv-near";
  const fBack = "pv-back";
  const mask = "pv-mask";
  const erase = "pv-erase";
  const wash = "pv-wash";
  // One lamp for the whole room, above and inboard of the near figure, so the
  // three depth layers agree about where the light comes from.
  const lamp: [number, number, number] = [150, -70, 170];

  return (
    <div
      data-register="product"
      className="w-full overflow-hidden rounded-xl border border-line-card"
    >
      <div className="relative aspect-[16/11] w-full sm:aspect-[16/10]">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <GhostFilter id={fNear} u={40} light={lamp} seed={11} />
          <GhostFilter id={fBack} u={24} light={lamp} seed={29} />
          <radialGradient id={wash}>
            <stop offset="0%" stopColor="var(--instrument-fg-weak)" stopOpacity="0.42" />
            <stop offset="100%" stopColor="var(--instrument-fg-weak)" stopOpacity="0" />
          </radialGradient>
          {/* Mask ink, never a visible paint: black at full alpha subtracts
              luminance from the figure mask, so the bodies are eaten as they
              approach the device rather than clipped by a straight edge. */}
          <linearGradient
            id={erase}
            gradientUnits="userSpaceOnUse"
            x1={LINE - FADE}
            y1="0"
            x2={LINE}
            y2="0"
          >
            <stop offset="0%" stopColor="var(--color-black)" stopOpacity="0" />
            <stop offset="55%" stopColor="var(--color-black)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="var(--color-black)" stopOpacity="1" />
          </linearGradient>
          <mask id={mask} maskUnits="userSpaceOnUse" x="0" y="0" width={W} height={H}>
            <g filter={`url(#${fBack})`} opacity={0.44}>
              <GhostBody {...CAST[2]} />
            </g>
            <g filter={`url(#${fBack})`} opacity={0.74}>
              <GhostBody {...CAST[1]} />
            </g>
            <g filter={`url(#${fNear})`}>
              <GhostBody {...CAST[0]} />
            </g>
            <rect
              x={LINE - FADE}
              y="0"
              width={W - LINE + FADE}
              height={H}
              fill={`url(#${erase})`}
            />
          </mask>
        </defs>

        {/* Engagement pools at the feet, the way the pipeline layers it. */}
        {CAST.map((f) => (
          <ellipse
            key={`w${f.id}`}
            cx={f.x}
            cy={feet(f.y, f.u)}
            rx={2.2 * f.u}
            ry={0.5 * f.u}
            fill={`url(#${wash})`}
          />
        ))}

        {/* One rect, one token: every visible pixel of every body is
            --instrument-fg-strong at some luminance, so the treatment
            re-themes with the instrument scale and cannot drift to a literal. */}
        <rect x="0" y="0" width={W} height={H} fill="var(--instrument-fg-strong)" mask={`url(#${mask})`} />

        {/* THE RECORD, bound at the floor. Square handle, facing arrow, track
            id, and a leader carrying it across the boundary. */}
        <g fontFamily="var(--font-mono)">
          {CAST.map((f, i) => {
            const fy = feet(f.y, f.u);
            const dim = i === 0 ? 1 : 0.72;
            return (
              <g key={f.id} opacity={dim}>
                <ellipse
                  cx={f.x}
                  cy={fy}
                  rx={0.9 * f.u}
                  ry={0.24 * f.u}
                  fill="none"
                  stroke="var(--instrument-fg-faint)"
                  strokeWidth="0.8"
                  strokeDasharray="3 3"
                />
                <rect
                  x={f.x - 2.5}
                  y={fy - 2.5}
                  width="5"
                  height="5"
                  fill="var(--instrument-fg-strong)"
                />
                <path
                  d={arrow(f.x, fy, f.facing, 0.7 * f.u)}
                  fill="none"
                  stroke="var(--instrument-fg)"
                  strokeWidth="1"
                  strokeLinecap="round"
                />
                {/* The leader runs level from the floor mark to the boundary,
                    so the three tracks arrive at the device at three different
                    heights and never cross. */}
                <line
                  x1={f.x}
                  y1={fy}
                  x2={LINE + 18}
                  y2={fy}
                  stroke="var(--instrument-fg-faint)"
                  strokeWidth="0.8"
                />
                {/* The leader crosses the boundary and terminates in a handle:
                    the position DOES get through, and it is all that does. */}
                <rect
                  x={LINE + 16}
                  y={fy - 2}
                  width="4"
                  height="4"
                  fill="var(--instrument-fg)"
                />
                {/* Ids sit against the boundary rather than beside the body:
                    against the body they landed on a thigh and were unreadable,
                    and stacked at the line they read as three tracks arriving. */}
                <text
                  x={LINE - 8}
                  y={fy - 6}
                  textAnchor="end"
                  fill="var(--instrument-fg)"
                  fontSize="11"
                  letterSpacing="0.6"
                >
                  {f.id}
                </text>
              </g>
            );
          })}

          {/* THE EDGE DEVICE. Two hairlines and a handle at each end, in the
              drafting vocabulary the venue plan already uses for cameras. */}
          <g stroke="var(--instrument-fg)" fill="none">
            <path d={`M${LINE} 10 L${LINE} ${H - 10}`} strokeWidth="1" />
            <path
              d={`M${LINE + 6} 10 L${LINE + 6} ${H - 10}`}
              strokeWidth="0.8"
              opacity="0.4"
              strokeDasharray="4 5"
            />
          </g>
          {[10, H - 10].map((y) => (
            <rect
              key={y}
              x={LINE - 3.5}
              y={y - 3.5}
              width="7"
              height="7"
              fill="var(--instrument-fg-strong)"
            />
          ))}
          {/* Set on the line itself, reading up it: this is the only label in
              the panel that names a boundary rather than a thing. Held high
              rather than centred, because the three track leaders arrive in
              the lower half and a centred label sits across t-07's. */}
          <text
            x={-84}
            y={LINE - 10}
            transform="rotate(-90)"
            textAnchor="middle"
            fill="var(--instrument-fg)"
            fontSize="11"
            letterSpacing="1.6"
          >
            EDGE DEVICE
          </text>
        </g>
      </svg>

      {/* Top-left: what the left half is. Kept as HTML so it stays legible at
          390, where a 10px viewBox label would render at 7px. */}
      <div className="absolute left-3 top-3 font-mono text-[10px] uppercase tracking-[0.14em] text-instrument-fg sm:left-4 sm:top-4">
        {where}
      </div>

      <RecordCard
        rows={rows}
        className="absolute right-4 top-1/2 hidden w-[44%] -translate-y-1/2 rounded-lg border border-line-hairline bg-stage/90 p-4 backdrop-blur-sm sm:block"
      />
      </div>

      <RecordCard rows={rows} className="border-t border-line-hairline p-4 sm:hidden" />

      <p className="sr-only">
        Illustration: three anonymised depth-rendered figures standing in a
        synthetic {room}. No facial detail is rendered on any of them. A vertical
        line marks the edge device; the figures dissolve as they reach it, and to
        its right sits the record that leaves the building, holding a track
        number, a zone, a dwell time and a facing, with identity, face signature
        and raw video all recorded as absent.
      </p>
    </div>
  );
}
