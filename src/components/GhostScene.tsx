/**
 * GhostScene — the stage behind each Outputs beat: a few anonymised people in
 * one room, with the pipeline's own overlay for that beat drawn over them.
 *
 * The figures themselves are GhostFigure's volumetric depth-render; read that
 * file's header for what "anonymised" means here and why it is built the way
 * it is. This file is composition only — where the people stand, how big they
 * are, and which overlay belongs to which beat.
 *
 * COMPOSITION. The reference (design-refs/Playvision-design-anoymous-player.png)
 * puts its subject close enough that the frame cuts through the head and the
 * arm, with the UI fragment lying across the chest. That crop is the whole
 * reason the volume reads: at pictogram scale a deltoid is three pixels. So
 * each stage has ONE near figure at roughly reference scale, cropped by the
 * frame, plus two figures further into the room for depth and for the overlays
 * to attach to. The old build's five same-size figures in a row is what made
 * it a sign field.
 *
 * Static by construction: no animation, so nothing here has to be switched off
 * under prefers-reduced-motion.
 */

import { GhostBody, GhostFilter, PoseId, feet } from "@/components/GhostFigure";

export type SceneVariant = "tracks" | "heat" | "zones";

/**
 * Who is standing where, per beat. Three stages running the same figure in the
 * same spot reads as one image stamped three times; rotating the cast and
 * nudging the marks keeps them three views of one room. The offsets are small
 * on purpose — the near mark is constrained on both axes at both widths (see
 * the placement note below) and there is little room to move.
 */
const CAST: { poses: [PoseId, PoseId, PoseId]; dx: number; dy: number }[] = [
  { poses: ["gf-stand", "gf-walk", "gf-regard"], dx: 0, dy: 0 },
  { poses: ["gf-regard", "gf-stand", "gf-walk"], dx: -8, dy: 3 },
  { poses: ["gf-walk", "gf-regard", "gf-stand"], dx: 7, dy: -2 },
];

const W = 400;
const H = 260;

/**
 * Head-heights in viewBox units per depth layer.
 *
 * Placement is worked against what the frame actually shows, which is not the
 * viewBox. `slice` at 1440 maps this 400x260 box into a 740x400 panel at 1.85x
 * and crops the top and bottom, so only y 22..238 is ever visible; the
 * fragment then covers x 13..277, y 76..184. That leaves ONE column clear
 * across the full height — x 277..400, mirrored to 0..123 when the fragment
 * sits on the right — and two thin bands above and below the fragment.
 *
 * The near figure owns the clear column at 46u: head, shoulders, chest and
 * hips inside the frame, legs running off the bottom edge. That is the
 * reference's crop rather than a shrunken copy of it. The other two stand
 * further into the room and read through the bands, head above and feet below,
 * which is what gives the panel any depth at all.
 *
 * 390 crops the other axis: 1.31x scale leaves only x 69..331 visible. The
 * near figure therefore sits at 306 rather than in the middle of the desktop
 * clear column — the overlap of "clear at 1440" and "on screen at 390" is
 * x 277..331, and the previous build put its largest figure outside it, so
 * mobile got a sliver of one arm.
 */
const NEAR = 46;
const MID = 27;
const FAR = 19;

export default function GhostScene({
  variant,
  idPrefix,
  mirror = false,
  cast = 0,
}: {
  variant: SceneVariant;
  idPrefix: string;
  /** Flip the room so the near figure lands opposite the fragment. */
  mirror?: boolean;
  /** Which beat this is; picks the arrangement from CAST. */
  cast?: number;
}) {
  const c = CAST[cast % CAST.length];
  // Filter and mask ids are document-global; three scenes on one page would
  // otherwise all resolve to the first one's blur radius and lamp.
  const fNear = `${idPrefix}-near`;
  const fFar = `${idPrefix}-far`;
  const mask = `${idPrefix}-mask`;
  const wash = `${idPrefix}-wash`;

  // Mirrored by coordinate rather than by transform: scaleX(-1) on the root
  // would reverse the track ids and the zone label with them.
  const mx = (x: number) => (mirror ? W - x : x);

  // Base coordinates assume the fragment on the LEFT; mirror flips the room.
  const near = { x: mx(306 + c.dx), y: 24 + c.dy, u: NEAR };
  const mid = { x: mx(118 - c.dx), y: 30 - c.dy, u: MID };
  const far = { x: mx(206 + c.dx), y: 46, u: FAR };
  // One lamp for the whole room, above and inboard of the near figure so the
  // light direction agrees across the depth layers and the three read as being
  // in the same space. z is deliberately low relative to the frame: a lamp
  // directly overhead lights every surface head-on and flattens the modelling
  // back out, so it rakes across instead.
  const lamp: [number, number, number] = [mx(210), -60, 150];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      /* At 1440 the panel's aspect makes `slice` crop the y axis only, so this
         alignment does nothing there. At 390 it crops 158 units off the x axis
         instead, and centring that crop cuts the near figure in half at the
         frame edge. Biasing the crop toward the figure's own side keeps its
         head and shoulders in the one band the fragment does not cover. */
      preserveAspectRatio={mirror ? "xMinYMid slice" : "xMaxYMid slice"}
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <GhostFilter id={fNear} u={NEAR} light={lamp} seed={7} />
        <GhostFilter id={fFar} u={MID} light={lamp} seed={19} />
        <radialGradient id={wash}>
          <stop offset="0%" stopColor="var(--instrument-fg-weak)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="var(--instrument-fg-weak)" stopOpacity="0" />
        </radialGradient>

        {/* The depth render, consumed as luminance. Opacity is applied to each
            filtered group AFTER lighting, so a distant figure is dimmer
            without its surface also being flatter. */}
        <mask id={mask} maskUnits="userSpaceOnUse" x="0" y="0" width={W} height={H}>
          <g filter={`url(#${fFar})`} opacity={0.45}>
            <GhostBody pose={c.poses[2]} {...far} />
          </g>
          <g filter={`url(#${fFar})`} opacity={0.72}>
            <GhostBody pose={c.poses[1]} {...mid} />
          </g>
          <g filter={`url(#${fNear})`}>
            <GhostBody pose={c.poses[0]} {...near} />
          </g>
        </mask>
      </defs>

      {/* Engagement heat pools at the feet, the way the pipeline layers it. */}
      {variant === "heat" && (
        <g>
          <ellipse
            cx={near.x}
            cy={feet(near.y, near.u)}
            rx={2.1 * near.u}
            ry={0.5 * near.u}
            fill={`url(#${wash})`}
            opacity={0.85}
          />
          <ellipse
            cx={mid.x}
            cy={feet(mid.y, mid.u)}
            rx={2.1 * mid.u}
            ry={0.5 * mid.u}
            fill={`url(#${wash})`}
            opacity={0.6}
          />
          <ellipse
            cx={far.x}
            cy={feet(far.y, far.u)}
            rx={2.1 * far.u}
            ry={0.5 * far.u}
            fill={`url(#${wash})`}
            opacity={0.4}
          />
        </g>
      )}

      {/* One rect, one token. Every visible pixel of every figure is
          --instrument-fg-strong at some luminance, so the whole treatment
          re-themes with the instrument scale and cannot drift to a literal. */}
      <rect
        x="0"
        y="0"
        width={W}
        height={H}
        fill="var(--instrument-fg-strong)"
        mask={`url(#${mask})`}
      />

      {/* Detection boxes: the raw stage. Only the two figures standing clear of
          the frame edge carry one, since a box round a cropped body is a box
          round nothing. Ids are anonymous counters. */}
      {variant === "tracks" && (
        <g opacity={0.85}>
          {[
            { id: "t-11", ...mid },
            { id: "t-07", ...far },
          ].map((t) => (
            <g key={t.id}>
              <rect
                x={t.x - 1.5 * t.u}
                y={t.y - 0.2 * t.u}
                width={3 * t.u}
                height={7.9 * t.u}
                rx={2}
                fill="none"
                stroke="var(--instrument-fg-faint)"
                strokeWidth="0.8"
                strokeDasharray="4 4"
              />
              <text
                x={t.x - 1.5 * t.u}
                y={t.y - 0.2 * t.u - 4}
                fill="var(--instrument-fg)"
                fontSize={8}
                fontFamily="var(--font-mono)"
              >
                {t.id}
              </text>
            </g>
          ))}
          {/* The near figure is tracked too. Its box would be larger than the
              frame, so the id alone sits under it — y 228 is the one strip
              clear of the fragment at BOTH widths (below 218 at 390, above the
              238 crop line at 1440). */}
          <text
            x={near.x}
            textAnchor="middle"
            y={228}
            fill="var(--instrument-fg)"
            fontSize={9}
            fontFamily="var(--font-mono)"
          >
            t-04
          </text>
        </g>
      )}

      {/* Zone outline: where a count turns into a decision about a room. */}
      {variant === "zones" && (
        <g opacity={0.9}>
          <path
            d="M 18 238 L 150 200 L 384 234 L 384 250 L 18 250 Z"
            fill="none"
            stroke="var(--instrument-fg-faint)"
            strokeWidth="0.8"
          />
          <path
            d="M 150 200 L 164 202 M 150 200 L 150 210"
            stroke="var(--instrument-fg)"
            strokeWidth="1.4"
            fill="none"
          />
          {/* Below the corner, not above it: at 1440 the fragment's bottom edge
              lands on y 184 and a label set above the corner is clipped by it. */}
          <text
            x={158}
            y={216}
            fill="var(--instrument-fg)"
            fontSize={8}
            fontFamily="var(--font-mono)"
          >
            zone 3a
          </text>
        </g>
      )}
    </svg>
  );
}
