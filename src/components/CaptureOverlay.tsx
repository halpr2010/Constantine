/**
 * CaptureOverlay — the pending state of the #scale media slot (§4d rule 2).
 *
 * HOW THIS SLOT STATES ITS OWN EMPTINESS, because it is the whole point of the
 * component and the one thing §9 will not forgive getting wrong. A placeholder
 * has two honest moves available to it. It can show something real, or it can
 * show that there is nothing. This one does the second, by drawing the ONLY
 * layer we can honestly draw: Constantine's own overlay, hanging in an
 * unexposed frame with every value slot left as a blank rule.
 *
 * Nothing here is or resembles footage. There is no still, no render, no
 * simulated feed, no synthetic screen recording, and no figure of any kind:
 * the frame is the register's own ground with crop marks and a thirds grid on
 * it, which is what an empty frame looks like in a camera. The zone outlines
 * and the reading card are real product furniture with no readings in them,
 * so the absence is legible AS DATA rather than as a missing asset. A visitor
 * reads "the instrument is here and it has been given nothing", which is
 * exactly true.
 *
 * The leader entering from the left edge is the section's other job. It runs
 * out of the frame toward the stat standing beside it, so the number reads as
 * a quantity taken OFF this instrument rather than as a headline parked next
 * to a picture.
 *
 * Colour: instrument tokens, as VenuePlan and PrivacyStage use them. The slot
 * sits inside a product-register section, so the on-stage condition in
 * TOKENS.md holds and the marks read identically in all four palettes.
 *
 * Motion: none. Static geometry, so the reduced-motion floor is unaffected.
 */

const ROWS = ["zone", "in zone", "median dwell", "facing"];

export default function CaptureOverlay({
  slate,
  body,
  spec,
}: {
  /** The plain statement that no footage exists. */
  slate: string;
  /** What will go here, and what is being looked at meanwhile. */
  body: string;
  /** The §4d footage spec, rendered where a clip's own slate would sit. */
  spec: string;
}) {
  return (
    <>
      {/* Below md the slot is 3:2 rather than 16:9 (§4d permits a
          mobile-specific shape), so the box and this viewBox differ by about
          18% there. Every stroke carries vector-effect="non-scaling-stroke",
          which is what keeps a hairline a hairline in both boxes and at both
          widths; without it the vertical strokes and the horizontal ones come
          out at different weights. */}
      <svg
        aria-hidden
        viewBox="0 0 640 360"
        preserveAspectRatio="none"
        vectorEffect="non-scaling-stroke"
        className="absolute inset-0 h-full w-full [&_*]:[vector-effect:non-scaling-stroke]"
      >
        {/* Thirds. Faint enough to read as framing rather than as content. */}
        <g stroke="var(--instrument-fg-faint)" strokeWidth="1" opacity="0.22">
          <line x1="213.3" y1="14" x2="213.3" y2="346" />
          <line x1="426.7" y1="14" x2="426.7" y2="346" />
          <line x1="14" y1="120" x2="626" y2="120" />
          <line x1="14" y1="240" x2="626" y2="240" />
        </g>

        {/* Crop marks. The frame's edges are declared by its corners only, so
            nothing here reads as a border around a picture. */}
        <g stroke="var(--instrument-fg-weak)" strokeWidth="1.5" fill="none">
          <path d="M14 40 V14 H48" />
          <path d="M592 14 H626 V40" />
          <path d="M14 320 V346 H48" />
          <path d="M592 346 H626 V320" />
        </g>

        {/* The leader out of the frame toward the stat. It starts at x=0 so it
            is cut by the frame's own edge and reads as continuing past it. */}
        <g stroke="var(--instrument-fg)" strokeWidth="1" fill="none">
          <line x1="0" y1="72" x2="146" y2="72" />
          <rect x="143" y="69" width="6" height="6" fill="var(--instrument-fg)" />
        </g>

        {/* Zones. Dashed, because a zone is authored rather than observed. */}
        <g
          stroke="var(--instrument-fg-weak)"
          strokeWidth="1.25"
          strokeDasharray="6 5"
          fill="none"
        >
          <rect x="146" y="72" width="176" height="124" />
          <rect x="344" y="150" width="146" height="112" className="hidden md:block" />
        </g>
        <g
          fill="var(--instrument-fg)"
          className="font-mono"
          fontSize="11"
          style={{ letterSpacing: "0.08em" }}
        >
          <text x="146" y="64">
            zone 01
          </text>
          <text x="344" y="142" className="hidden md:block">
            zone 02
          </text>
        </g>

        {/* The tally, in the corner a clip's own burn-in would occupy. Both
            numbers are true: nothing has been shot and nothing has been read.
            Stating the emptiness as a count is the same move as the blank
            rules in the card, one register louder. */}
        <text
          x="578"
          y="302"
          textAnchor="end"
          fill="var(--instrument-fg)"
          className="hidden font-mono md:block"
          fontSize="10"
          style={{ letterSpacing: "0.1em" }}
        >
          frames 0 · readings 0
        </text>

        {/* The reading card, with every field left blank. This is the sentence
            the section is making, drawn rather than asserted. */}
        <g className="hidden md:block">
          <rect
            x="502"
            y="46"
            width="124"
            height="166"
            fill="none"
            stroke="var(--instrument-fg-faint)"
            strokeWidth="1"
          />
          <text
            x="514"
            y="68"
            fill="var(--instrument-fg)"
            className="font-mono"
            fontSize="10"
            style={{ letterSpacing: "0.14em" }}
          >
            reading
          </text>
          <line
            x1="502"
            y1="78"
            x2="626"
            y2="78"
            stroke="var(--instrument-fg-faint)"
            strokeWidth="1"
          />
          {ROWS.map((r, i) => (
            <g key={r} transform={`translate(0 ${96 + i * 30})`}>
              <text
                x="514"
                y="0"
                fill="var(--instrument-fg)"
                className="font-mono"
                fontSize="10"
                style={{ letterSpacing: "0.06em" }}
              >
                {r}
              </text>
              {/* Where the value would be. Drawn as a rule rather than written
                  as a dash so no glyph can be misread as a measurement. */}
              <line
                x1="514"
                y1="10"
                x2="614"
                y2="10"
                stroke="var(--instrument-fg-faint)"
                strokeWidth="1"
              />
            </g>
          ))}
        </g>
      </svg>

      {/* The §4d footage spec, sitting where a clip's slate would. It swaps to
          the opposite corner below md, where the top-left is the only band of
          frame the docked statement leaves visible and the zone label already
          has it. */}
      <div className="absolute right-3 top-3 md:left-5 md:right-auto md:top-5">
        <span className="rounded-full border border-line-hairline bg-stage/70 px-2.5 py-1 font-mono text-[10px] tracking-wide text-fg-muted">
          {spec}
        </span>
      </div>

      {/* Full width at the foot on a phone, where the frame is 228px tall and
          an inset card would leave the statement unreadable; a card inside the
          lower left at md+, clear of the reading card in the opposite corner. */}
      <div className="absolute inset-x-0 bottom-0 border-t border-line-hairline bg-stage/85 px-4 py-3.5 backdrop-blur-sm md:inset-x-auto md:bottom-5 md:left-5 md:max-w-[54%] md:rounded-lg md:border md:p-5">
        <p className="text-sm font-semibold text-fg-primary md:text-base">
          {slate}
        </p>
        <p className="mt-1.5 text-[11px] leading-snug text-fg-secondary md:mt-2 md:text-sm">
          {body}
        </p>
      </div>
    </>
  );
}
