/**
 * GhostScene — the §5 silhouette treatment, drawn rather than filmed.
 *
 * PlayVision's people are luminous grey-white ghosts on black with no facial
 * detail (design-refs/Playvision-design-anoymous-player.png). §5 elevates that
 * to a hard site rule, so this is the one place the Outputs section shows a
 * person: an abstract mask, no features, no photography.
 *
 * It is deliberately a diagram and not footage. §9 forbids anything implying
 * pilot footage exists, so the shapes stay obviously synthetic and the panel
 * that hosts them carries an "Illustrative" marker.
 *
 * Static by construction: no animation, so nothing here has to be switched
 * off under prefers-reduced-motion.
 */

export type SceneVariant = "tracks" | "heat" | "zones";

/** Local figure height, in viewBox units, for the shared body path below. */
const H = 106;

/**
 * Layout is composed against the fragment that floats over it, because a
 * centred panel hides whatever sits behind it. Measured at both widths:
 * the panel covers roughly y 70–191 at 1440 and y 53–206 at 390, so the two
 * tall figures are scaled to clear it at BOTH ends (head above, feet below)
 * and the small ones deliberately show only a head or only legs. `x` is the
 * figure's centre; 390 crops the field to x 70–330, which is why the hero
 * figure at 340 is the one allowed to fall off the mobile edge.
 */
const FIGURES = [
  { id: "t-04", x: 340, y: 28, s: 1.95, o: 1 },
  { id: "t-11", x: 206, y: 24, s: 1.86, o: 0.6 },
  { id: "t-07", x: 96, y: 28, s: 1.78, o: 0.78 },
  { id: "t-02", x: 272, y: 4, s: 0.8, o: 0.4 },
  { id: "t-09", x: 150, y: 150, s: 0.95, o: 0.45 },
];

/**
 * One closed outline: shoulders, arms hanging at the sides, torso, two legs.
 * A single path rather than a union of shapes, because every fill here is a
 * translucent token and overlapping shapes would seam where they cross.
 * No features, by rule and by design — under the blur it reads as the
 * segmentation mask the pipeline actually produces.
 */
const BODY =
  "M -8,21 C -13,23 -16,28 -17.5,36 L -20,62 L -15.5,63 L -12.8,40 L -12,44 " +
  "C -12.4,56 -12.6,70 -12,84 L -10,106 L -2.6,106 L 0,80 L 2.6,106 L 10,106 " +
  "L 12,84 C 12.6,70 12.4,56 12,44 L 12.8,40 L 15.5,63 L 20,62 L 17.5,36 " +
  "C 16,28 13,23 8,21 Z";

function Figure({ x, y, s, o }: { x: number; y: number; s: number; o: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
      <circle cx={0} cy={11} r={8} />
      <path d={BODY} />
    </g>
  );
}

export default function GhostScene({
  variant,
  idPrefix,
  mirror = false,
}: {
  variant: SceneVariant;
  idPrefix: string;
  /** Flip the field so the full-height figure lands opposite the fragment. */
  mirror?: boolean;
}) {
  // Filter ids are document-global, so three scenes on one page would
  // otherwise all resolve to the first one's blur radius.
  const halo = `${idPrefix}-halo`;
  const core = `${idPrefix}-core`;
  const wash = `${idPrefix}-wash`;
  const body = `${idPrefix}-body`;
  // Mirrored by coordinate rather than by transform: a scaleX(-1) on the root
  // would reverse the track ids and the zone label with it.
  const figures = FIGURES.map((f) => ({ ...f, x: mirror ? 400 - f.x : f.x }));

  return (
    <svg
      viewBox="0 0 400 260"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <filter id={halo} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="3.2" />
        </filter>
        <filter id={core} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="0.9" />
        </filter>
        <radialGradient id={wash}>
          <stop offset="0%" stopColor="var(--instrument-fg-weak)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="var(--instrument-fg-weak)" stopOpacity="0" />
        </radialGradient>
        {/* userSpaceOnUse resolves inside each figure's own transform, so 0–106
            is that figure's height: the mask is brightest at the head and falls
            away toward the feet rather than sitting as one flat cut-out. */}
        <linearGradient
          id={body}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="0"
          x2="0"
          y2={H}
        >
          <stop offset="0%" stopColor="var(--instrument-fg-strong)" stopOpacity="0.95" />
          <stop offset="55%" stopColor="var(--instrument-fg-weak)" stopOpacity="0.8" />
          <stop offset="100%" stopColor="var(--instrument-fg-faint)" stopOpacity="0.45" />
        </linearGradient>
      </defs>

      {/* Engagement heat pools at the feet, the way the pipeline layers it. */}
      {variant === "heat" &&
        figures.map((f) => (
          <ellipse
            key={`h-${f.id}`}
            cx={f.x}
            cy={f.y + H * f.s}
            rx={40 * f.s}
            ry={11 * f.s}
            fill={`url(#${wash})`}
            opacity={f.o}
          />
        ))}

      <g filter={`url(#${halo})`} fill="var(--instrument-fg-faint)" opacity={0.45}>
        {figures.map((f) => (
          <Figure key={`a-${f.id}`} {...f} />
        ))}
      </g>
      {/* Held well below full white: §5 makes the hero demo the protagonist,
          and a bright cut-out here would out-shout the fragment it sits under. */}
      <g filter={`url(#${core})`} fill={`url(#${body})`} opacity={0.72}>
        {figures.map((f) => (
          <Figure key={`b-${f.id}`} {...f} />
        ))}
      </g>

      {/* Detection boxes: the raw stage, so only the three nearest figures
          carry one and the ids are anonymous counters. */}
      {variant === "tracks" && (
        <g opacity={0.85}>
          {figures.slice(0, 3).map((f) => (
            <g key={`r-${f.id}`}>
              <rect
                x={f.x - 21 * f.s}
                y={f.y - 3}
                width={42 * f.s}
                height={H * f.s + 6}
                rx={2}
                fill="none"
                stroke="var(--instrument-fg-faint)"
                strokeWidth="0.8"
                strokeDasharray="4 4"
              />
              <text
                x={f.x - 21 * f.s}
                y={f.y - 7}
                fill="var(--instrument-fg)"
                fontSize={8}
                fontFamily="var(--font-mono)"
              >
                {f.id}
              </text>
            </g>
          ))}
        </g>
      )}

      {/* Zone outline: where a count turns into a decision about a room. */}
      {variant === "zones" && (
        <g opacity={0.9}>
          {/* Kept inside y 6–248: at 1440 the panel is wider than the field's
              aspect, so slice crops roughly four units off each edge. */}
          <path
            d="M 18 240 L 150 198 L 384 236 L 384 248 L 18 248 Z"
            fill="none"
            stroke="var(--instrument-fg-faint)"
            strokeWidth="0.8"
          />
          <path
            d="M 150 198 L 162 200 M 150 198 L 150 206"
            stroke="var(--instrument-fg)"
            strokeWidth="1.4"
            fill="none"
          />
          <text
            x={156}
            y={194}
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
