/**
 * GhostFigure — the §5 "people are never identifiable" treatment, rendered as
 * volume rather than as a cut-out.
 *
 * WHY THIS EXISTS. The first Outputs build drew each person as one closed
 * outline filled with a gradient and blurred. Flat. It read as a toilet-door
 * pictogram, which is exactly what §5's CLARIFIED entry (08 Sep 2026) rejects:
 * "silhouette" had been read as a flat icon-like cut-out, and the reference
 * (design-refs/Playvision-design-anoymous-player.png) is nothing of the sort.
 * Read off the image, not off prose about it, the reference is:
 *
 *   · real human proportion and pose, seen close enough to crop at the frame;
 *   · musculature reading as raised form — deltoid, pec, bicep, calf all
 *     legible as separate masses catching the same light;
 *   · a grainy luminous grey-white surface, sensor noise over the whole thing;
 *   · soft glowing edges with no hard silhouette line anywhere;
 *   · NO facial detail. A cranial mass and a jaw, and nothing else.
 *
 * HOW. Nothing here is drawn as an outline. A figure is a stack of overlapping
 * anatomical masses (tapered capsules for limbs, wedges for the trunk, blobs
 * for muscle bellies) painted at partial alpha, so alpha ACCUMULATES where
 * masses overlap. That accumulated alpha is a height field. An SVG filter
 * blurs it, lights it with feDiffuseLighting + feSpecularLighting, modulates
 * it with fractal noise and blooms the edge. Overlap becomes elevation;
 * elevation becomes shading. That is what makes a bicep visible without ever
 * drawing a bicep's outline.
 *
 * SVG rather than canvas, deliberately. scripts/screenshot.mjs, strip.mjs and
 * review.sh all mask `canvas` to a flat rectangle, so a canvas renderer would
 * be invisible in every capture the critic scores — the defect recorded
 * against cycle 20260908-075053-2. This work has to survive the contact sheet.
 *
 * NO PRODUCED IMAGE ASSET IS NEEDED. This is reachable in code; see the commit
 * message for the reasoning.
 *
 * COLOUR. Nothing is painted here. The filter output is used as a luminance
 * mask, and the only visible paint is a token (`--instrument-fg-strong` and
 * friends). `--color-white` appears solely as the light source colour inside
 * the mask, which is the same variable the instrument scale is built from in
 * globals.css and is never itself visible.
 *
 * MOTION. Everything is static geometry computed at module scope. There is no
 * animation to freeze under prefers-reduced-motion.
 */

type P = [number, number];

const rd = (d: number) => (d * Math.PI) / 180;
const sub = (a: P, b: P): P => [a[0] - b[0], a[1] - b[1]];
const mag = (a: P) => Math.hypot(a[0], a[1]) || 1e-6;
const mix = (a: P, b: P, t: number): P => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
/** Three decimals is well under a device pixel at every scale used here. */
const f = (n: number) => Math.round(n * 1000) / 1000;

/**
 * Tapered capsule: straight sides between two round caps. The normal is
 * perp(d) = (-dy, dx), which in SVG's y-down space puts the first vertex on
 * the far side of the axis; both caps therefore sweep in the negative-angle
 * direction, hence sweep-flag 0 on both arcs.
 */
function capsule(p0: P, p1: P, r0: number, r1: number): string {
  const d = sub(p1, p0);
  const L = mag(d);
  const n: P = [-d[1] / L, d[0] / L];
  const A: P = [p0[0] + n[0] * r0, p0[1] + n[1] * r0];
  const B: P = [p1[0] + n[0] * r1, p1[1] + n[1] * r1];
  const C: P = [p1[0] - n[0] * r1, p1[1] - n[1] * r1];
  const D: P = [p0[0] - n[0] * r0, p0[1] - n[1] * r0];
  return (
    `M${f(A[0])},${f(A[1])}L${f(B[0])},${f(B[1])}` +
    `A${f(r1)},${f(r1)} 0 0 0 ${f(C[0])},${f(C[1])}` +
    `L${f(D[0])},${f(D[1])}` +
    `A${f(r0)},${f(r0)} 0 0 0 ${f(A[0])},${f(A[1])}Z`
  );
}

/**
 * Capsule without the caps. The trunk segments need this: a cap at the top of
 * the chest has radius ~0.9 head-heights and would dome straight over the
 * neck, giving a hunchback. The shoulder bar and deltoids round that edge
 * instead, the way a trapezius actually does.
 */
function wedge(p0: P, p1: P, r0: number, r1: number): string {
  const d = sub(p1, p0);
  const L = mag(d);
  const n: P = [-d[1] / L, d[0] / L];
  const pt = (p: P, s: number, r: number) => `${f(p[0] + n[0] * r * s)},${f(p[1] + n[1] * r * s)}`;
  return `M${pt(p0, 1, r0)}L${pt(p1, 1, r1)}L${pt(p1, -1, r1)}L${pt(p0, -1, r0)}Z`;
}

/** Rotated ellipse, as a path so every mass is the same kind of element. */
function blob(c: P, rx: number, ry: number, rot = 0): string {
  const a = rd(rot);
  const ca = Math.cos(a);
  const sa = Math.sin(a);
  const at = (dx: number): P => [c[0] + dx * ca, c[1] + dx * sa];
  const L = at(-rx);
  const R = at(rx);
  return (
    `M${f(L[0])},${f(L[1])}` +
    `A${f(rx)},${f(ry)} ${f(rot)} 1 0 ${f(R[0])},${f(R[1])}` +
    `A${f(rx)},${f(ry)} ${f(rot)} 1 0 ${f(L[0])},${f(L[1])}Z`
  );
}

/** A muscle belly lying along a limb: `along` runs with the bone. */
function belly(p0: P, p1: P, t: number, cross: number, along: number): string {
  const d = sub(p1, p0);
  return blob(mix(p0, p1, t), cross, along, (Math.atan2(d[1], d[0]) * 180) / Math.PI - 90);
}

/**
 * A pose is a skeleton in HEAD HEIGHTS, x centred on the body axis, y = 0 at
 * the crown. Seven and a half heads to the sole and two heads across the
 * shoulders is standing adult proportion; the previous build's figure was
 * about five heads with no shoulder width at all, which is half of why it read
 * as a sign rather than a person.
 */
type Pose = {
  skull: [P, number, number, number];
  jaw: [P, number, number, number];
  neck: [P, P];
  shC: P;
  shL: P;
  shR: P;
  elL: P;
  elR: P;
  wrL: P;
  wrR: P;
  waist: P;
  hipC: P;
  pelvis: P;
  hipL: P;
  hipR: P;
  knL: P;
  knR: P;
  anL: P;
  anR: P;
  toeL: P;
  toeR: P;
};

/** Standing at rest, weight slightly off one hip, head turned a few degrees. */
const STAND: Pose = {
  skull: [[0.03, 0.47], 0.335, 0.47, -7],
  jaw: [[0.02, 0.71], 0.26, 0.29, -7],
  neck: [[0.0, 0.88], [0.03, 1.5]],
  shC: [0.02, 1.62],
  shL: [-0.9, 1.63],
  shR: [0.92, 1.58],
  // Arms clear of the ribcage: at the chest the trunk reaches 0.86, so an
  // elbow inside about 1.05 welds the upper arm to the torso and the whole
  // side of the body reads as one slab.
  elL: [-1.09, 2.9],
  elR: [1.14, 2.86],
  wrL: [-1.02, 4.06],
  wrR: [1.22, 4.0],
  waist: [0.02, 2.98],
  hipC: [0.0, 3.6],
  pelvis: [0.0, 3.98],
  hipL: [-0.48, 3.78],
  hipR: [0.5, 3.76],
  knL: [-0.44, 5.52],
  knR: [0.52, 5.56],
  anL: [-0.4, 7.2],
  anR: [0.55, 7.24],
  toeL: [-0.7, 7.46],
  toeR: [0.86, 7.5],
};

/** Mid-stride. Legs split, arms counter-swung — the walk reads at any size. */
const WALK: Pose = {
  skull: [[0.06, 0.47], 0.33, 0.47, 5],
  jaw: [[0.07, 0.71], 0.255, 0.29, 5],
  neck: [[0.04, 0.88], [0.05, 1.5]],
  shC: [0.04, 1.62],
  shL: [-0.84, 1.6],
  shR: [0.9, 1.64],
  elL: [-1.08, 2.82],
  elR: [0.88, 2.86],
  wrL: [-1.3, 3.9],
  wrR: [0.6, 3.86],
  waist: [0.04, 2.98],
  hipC: [0.02, 3.6],
  pelvis: [0.02, 3.98],
  hipL: [-0.46, 3.76],
  hipR: [0.52, 3.78],
  knL: [-0.68, 5.4],
  knR: [0.66, 5.5],
  anL: [-0.98, 7.02],
  anR: [0.92, 7.16],
  toeL: [-1.28, 7.24],
  toeR: [1.24, 7.4],
};

/** Standing, one forearm raised across the body — looking at something. */
const REGARD: Pose = {
  skull: [[-0.08, 0.47], 0.335, 0.47, 9],
  jaw: [[-0.1, 0.71], 0.26, 0.29, 9],
  neck: [[-0.04, 0.88], [0.0, 1.5]],
  shC: [0.0, 1.62],
  shL: [-0.86, 1.6],
  shR: [0.86, 1.63],
  elL: [-1.02, 2.88],
  elR: [1.02, 2.84],
  wrL: [-0.96, 4.04],
  wrR: [0.4, 3.32],
  waist: [0.0, 2.98],
  hipC: [0.0, 3.6],
  pelvis: [0.0, 3.98],
  hipL: [-0.5, 3.78],
  hipR: [0.48, 3.78],
  knL: [-0.52, 5.54],
  knR: [0.46, 5.52],
  anL: [-0.5, 7.22],
  anR: [0.44, 7.2],
  toeL: [-0.8, 7.48],
  toeR: [0.74, 7.46],
};

type Shape = { d: string; a: number };

/**
 * NESTED SHELLS — the single most important thing in this file.
 *
 * A mass painted at one flat alpha blurs into a PLATEAU: the height field is
 * level right across a chest 80 units wide, its normal points straight at the
 * viewer, and every lamp angle returns the same value. The first build of this
 * renderer did exactly that and the torso came out as a white slab with a soft
 * edge — volume at the outline only, which is a cut-out with extra steps.
 *
 * So every mass is emitted three times at 100%, 66% and 34% of its radius,
 * each adding alpha. Blurred, that staircase becomes a dome, and the surface
 * is curved all the way across rather than only at its rim. Limbs then read as
 * cylinders and the trunk as a barrel, which is what lets the lamp model form
 * instead of just finding a silhouette.
 */
const SHELLS: [number, number][] = [
  [1, 0.4],
  [0.66, 0.2],
  [0.34, 0.16],
];

function shellCapsule(p0: P, p1: P, r0: number, r1: number): Shape[] {
  return SHELLS.map(([s, a]) => ({ d: capsule(p0, p1, r0 * s, r1 * s), a }));
}
function shellWedge(p0: P, p1: P, r0: number, r1: number): Shape[] {
  return SHELLS.map(([s, a]) => ({ d: wedge(p0, p1, r0 * s, r1 * s), a }));
}
function shellBlob(c: P, rx: number, ry: number, rot = 0): Shape[] {
  return SHELLS.map(([s, a]) => ({ d: blob(c, rx * s, ry * s, rot), a }));
}

/** The load-bearing masses: what a body would be if it had no muscles. */
function masses(p: Pose): Shape[] {
  const hand = (el: P, wr: P) => {
    const d = sub(wr, el);
    const L = mag(d);
    return shellCapsule(wr, [wr[0] + (d[0] / L) * 0.3, wr[1] + (d[1] / L) * 0.3], 0.125, 0.085);
  };
  // Base of the neck, where the trapezius starts its run out to the shoulder.
  const yoke: P = [p.shC[0], p.shC[1] - 0.2];
  return [
    // Cranium and jaw. This is the entire head. Nothing is ever added inside
    // this outline — no eyes, no nose, no mouth, no hairline. §5/§9.
    ...shellBlob(...p.skull),
    ...shellBlob(...p.jaw),
    ...shellCapsule(p.neck[0], p.neck[1], 0.22, 0.3),
    // Trapezius, as two tapered runs rather than one straight bar: a bar gives
    // the square-shouldered look of a road sign.
    ...shellCapsule(yoke, p.shL, 0.36, 0.29),
    ...shellCapsule(yoke, p.shR, 0.36, 0.29),
    ...shellWedge(p.shC, p.waist, 0.86, 0.57),
    ...shellWedge(p.waist, p.hipC, 0.57, 0.74),
    ...shellWedge(p.hipC, p.pelvis, 0.74, 0.56),
    ...shellCapsule(p.shL, p.elL, 0.26, 0.175),
    ...shellCapsule(p.elL, p.wrL, 0.175, 0.115),
    ...shellCapsule(p.shR, p.elR, 0.26, 0.175),
    ...shellCapsule(p.elR, p.wrR, 0.175, 0.115),
    ...hand(p.elL, p.wrL),
    ...hand(p.elR, p.wrR),
    ...shellCapsule(p.hipL, p.knL, 0.35, 0.225),
    ...shellCapsule(p.knL, p.anL, 0.225, 0.14),
    ...shellCapsule(p.hipR, p.knR, 0.35, 0.225),
    ...shellCapsule(p.knR, p.anR, 0.225, 0.14),
    ...shellCapsule(p.anL, p.toeL, 0.13, 0.085),
    ...shellCapsule(p.anR, p.toeR, 0.13, 0.085),
  ];
}

/**
 * Muscle bellies — a second, lighter alpha pass. These never change the
 * silhouette; they only raise the surface inside it, so the light breaks over
 * them. This is the layer that separates a person from a mannequin.
 */
function bellies(p: Pose): string[] {
  return [
    blob([-0.4, 2.02], 0.4, 0.27, -14), // pectorals
    blob([0.42, 2.0], 0.4, 0.27, 14),
    blob([0.01, 2.62], 0.29, 0.5), // rectus abdominis
    blob([-0.66, 2.34], 0.2, 0.5, -6), // lats / obliques
    blob([0.68, 2.32], 0.2, 0.5, 6),
    blob([-0.42, 1.6], 0.31, 0.17, -8), // trapezius
    blob([0.44, 1.58], 0.31, 0.17, 8),
    blob(p.shL, 0.3, 0.3), // deltoids
    blob(p.shR, 0.3, 0.3),
    belly(p.shL, p.elL, 0.42, 0.17, 0.36), // biceps
    belly(p.shR, p.elR, 0.42, 0.17, 0.36),
    belly(p.elL, p.wrL, 0.3, 0.135, 0.3), // forearm flexors
    belly(p.elR, p.wrR, 0.3, 0.135, 0.3),
    blob([-0.4, 3.9], 0.3, 0.24), // glutes
    blob([0.42, 3.9], 0.3, 0.24),
    belly(p.hipL, p.knL, 0.45, 0.27, 0.62), // quadriceps
    belly(p.hipR, p.knR, 0.45, 0.27, 0.62),
    belly(p.knL, p.anL, 0.32, 0.185, 0.44), // gastrocnemius
    belly(p.knR, p.anR, 0.32, 0.185, 0.44),
  ];
}

/** Held low: a belly is a swell in the surface, not a plate laid on top. */
const BELLY = 0.16;

export const POSE_IDS = ["gf-stand", "gf-walk", "gf-regard"] as const;
export type PoseId = (typeof POSE_IDS)[number];

/**
 * The sprite. Every figure on the page is a `<use>` of one of these three, so
 * the ~110 mass paths are serialised once for the whole document instead of
 * once per figure per stage.
 *
 * `--color-white` is the height-field ink, not a visible colour: these shapes
 * only ever render inside a filter that discards their RGB and keeps their
 * alpha, and the result is consumed as a luminance mask.
 */
export function GhostSprite() {
  return (
    <svg
      width="0"
      height="0"
      aria-hidden="true"
      focusable="false"
      style={{ position: "absolute", pointerEvents: "none" }}
    >
      <defs>
        {([STAND, WALK, REGARD] as const).map((pose, i) => (
          <g id={POSE_IDS[i]} key={POSE_IDS[i]} fill="var(--color-white)">
            {masses(pose).map((s, j) => (
              <path key={`m${j}`} d={s.d} fillOpacity={s.a} />
            ))}
            {bellies(pose).map((d, j) => (
              <path key={`b${j}`} d={d} fillOpacity={BELLY} />
            ))}
          </g>
        ))}
      </defs>
    </svg>
  );
}

/**
 * The depth-render filter. One instance serves a whole depth layer, so every
 * figure in that layer is lit by the same lamp — which is what makes them read
 * as being in one room.
 *
 * `u` is the layer's head-height in viewBox units; every length below is
 * expressed against it so a near and a far layer get the same surface
 * character at different scales rather than the same absolute blur.
 */
export function GhostFilter({
  id,
  u,
  light,
  seed,
}: {
  id: string;
  u: number;
  /** Lamp position in viewBox units. z is height above the picture plane. */
  light: [number, number, number];
  seed: number;
}) {
  // Measured against the reference at 1440w: the surface reads as skin at
  // roughly u/10 of blur — tighter and the muscle bellies show their own edges
  // and the body plates like armour, looser and they dissolve and it is a
  // mannequin again.
  const blur = u / 10;
  // Height in the same units as the picture. Above about u/4 the shell
  // staircase starts showing its own steps as contour bands.
  const scale = u / 4.4;
  // Grain is specified per viewBox unit; the reference's noise is fine enough
  // that it never resolves into texture, about a cycle every two device px.
  const grain = 0.72;
  // The height dither runs several times finer, near the device pixel, because
  // its job is to randomise quantisation rather than to be seen.
  const dgrain = 3.2;
  const bloom = u / 5.5;
  return (
    <filter
      id={id}
      x="-30%"
      y="-30%"
      width="160%"
      height="160%"
      colorInterpolationFilters="sRGB"
    >
      {/* Accumulated alpha, blurred, IS the height field. */}
      <feGaussianBlur in="SourceAlpha" stdDeviation={f(blur)} result="h" />
      {/* The same field steepened into a clip. Interior alpha tops out around
          0.5–0.9 because the masses are painted below full opacity, so using h
          directly to clip would leave the whole body semi-transparent; the
          slope saturates the interior while the edge still ramps to nothing.
          Taken from the UNDITHERED field so the silhouette edge stays clean. */}
      <feComponentTransfer in="h" result="clip">
        <feFuncA type="linear" slope="2.1" intercept="0" />
      </feComponentTransfer>

      {/* DITHER THE HEIGHT, don't just texture the render. The blurred alpha is
          8-bit, so across a gently curving chest the height quantises into flat
          terraces one level apart and the lighting pass draws every boundary
          between them — a topographic contour map over the torso, plainly
          visible at 3x. Multiplying the height by a fine noise randomises which
          side of a level each pixel falls on and the contours break up.

          AMPLITUDE IS THE WHOLE CRAFT HERE. One quantisation step is 1/255 of
          the height, so ±1.5% is already four levels of jitter and kills the
          banding outright. The first attempt used ±8% and the body came back
          as poured concrete: an orange-peel relief that the specular lit like
          stucco. Stay just above the quantum.

          The modulation is read off feTurbulence's OWN alpha channel through
          feFuncA. Deriving it from the RGB channels via feColorMatrix does not
          work: that primitive un-premultiplies first, turbulence RGB divided by
          its own low alpha clamps at 1, and the "dither" comes out a constant. */}
      <feTurbulence
        type="fractalNoise"
        baseFrequency={f(dgrain)}
        numOctaves="2"
        seed={seed + 1}
        result="dn"
      />
      <feComponentTransfer in="dn" result="dither">
        <feFuncA type="linear" slope="0.03" intercept="0.972" />
      </feComponentTransfer>
      <feComposite in="h" in2="dither" operator="arithmetic" k1="1" k2="0" k3="0" k4="0" result="hd" />

      <feDiffuseLighting
        in="hd"
        surfaceScale={f(scale)}
        // Below 1 on purpose. At 1 the lit side clips to white and every
        // modelled form inside the silhouette is lost in the highlight; the
        // reference body sits in the greys with the highlights on top.
        diffuseConstant="0.72"
        style={{ lightingColor: "var(--color-white)" }}
        result="dif"
      >
        <fePointLight x={light[0]} y={light[1]} z={light[2]} />
      </feDiffuseLighting>
      <feSpecularLighting
        in="hd"
        surfaceScale={f(scale)}
        specularConstant="0.45"
        // A tight lobe rings hard over any residual terracing; 14 is wide
        // enough to read as a sheen rather than a contour map.
        specularExponent="14"
        style={{ lightingColor: "var(--color-white)" }}
        result="spc"
      >
        <fePointLight x={light[0]} y={light[1]} z={light[2]} />
      </feSpecularLighting>

      {/* BOTH lighting primitives return a full-region plane — outside the
          body the height field is flat, which is a surface facing the lamp
          dead-on and therefore the brightest specular in the picture. Clipping
          only the diffuse pass leaves the filter region drawn as a lit grey
          rectangle. Clip both; that is also what gives the soft, unlined edge. */}
      <feComposite in="dif" in2="clip" operator="in" result="difc" />
      <feComposite in="spc" in2="clip" operator="in" result="spcc" />
      <feComposite in="difc" in2="spcc" operator="arithmetic" k1="0" k2="1" k3="0.8" k4="0" result="raw" />

      {/* Tone. A single lamp with no bounce puts the shadow side at zero, and
          the reference has no black inside its figure at all — the whole body
          is luminous and the modelling happens in the top half of the range.
          The intercept is the room's fill light; the slope keeps the specular
          from clipping to a flat white patch once the fill is added. */}
      <feComponentTransfer in="raw" result="lit">
        <feFuncR type="linear" slope="0.78" intercept="0.21" />
        <feFuncG type="linear" slope="0.78" intercept="0.21" />
        <feFuncB type="linear" slope="0.78" intercept="0.21" />
      </feComponentTransfer>

      {/* Sensor noise on top of the relief. Lighter than it would be on its own
          because the dithered height already carries most of the grain. */}
      <feTurbulence type="fractalNoise" baseFrequency={grain} numOctaves="4" seed={seed} result="n" />
      <feColorMatrix
        in="n"
        type="matrix"
        values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0.22 0.22 0.22 0 0.44"
        result="grain"
      />
      <feComposite in="lit" in2="grain" operator="arithmetic" k1="1.05" k2="0.44" k3="0" k4="0" result="skin" />

      {/* The glow the reference has around every edge: the height field again,
          blown out wide and recoloured white. */}
      <feGaussianBlur in="h" stdDeviation={f(bloom)} result="hb" />
      <feColorMatrix
        in="hb"
        type="matrix"
        values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.34 0"
        result="halo"
      />

      <feMerge>
        <feMergeNode in="halo" />
        <feMergeNode in="skin" />
      </feMerge>
    </filter>
  );
}

/**
 * One figure. `u` is head-height in viewBox units and `y` is the crown, so a
 * figure can be positioned by where its head lands and allowed to run off the
 * bottom of the frame — the reference crops its subject hard, and a person
 * scaled to fit inside the panel is a pictogram again.
 */
export function GhostBody({ pose, x, y, u }: { pose: PoseId; x: number; y: number; u: number }) {
  return <use href={`#${pose}`} transform={`translate(${f(x)} ${f(y)}) scale(${f(u)})`} />;
}

/** Foot position in viewBox units, for overlays that sit on the floor. */
export function feet(y: number, u: number) {
  return y + 7.5 * u;
}
