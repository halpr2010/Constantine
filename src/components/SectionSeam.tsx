import type { CSSProperties } from "react";

/**
 * The join between two registers, painted as the new ground RISING INTO the
 * old one rather than as a band laid across the boundary.
 *
 * §5, from the founder-scored Claryo video (10/10): "scrolling far enough
 * should leave the page simply having become white, or black, with NO distinct
 * line across the page separating the two."
 *
 * REBUILT 08 Sep 2026. The previous seam sat at top: 0 inside the incoming
 * section and ramped a hardcoded `from` colour into a hardcoded `to` colour
 * over 11rem. Two things were wrong with that. It had to be TOLD what was
 * behind it, so any mismatch between the declared `from` and the ground
 * actually painted above reappears as exactly the line the rule forbids. And
 * the whole transition happened after the boundary, so the change announced
 * itself at the moment a new section began — which is what makes a page read
 * as a stack of blocks.
 *
 * This starts most of a viewport ABOVE the section's own top edge and
 * dissolves the incoming register's colour in over the outgoing one, reaching
 * full opacity some way INSIDE its own section. The crossing therefore
 * straddles the boundary rather than beginning at it, and the page has mostly
 * become white, or black, by the time the new section's first line arrives —
 * compare design-refs/strips/Claryo_Scroll_Functionality.png frames 4→5, where
 * the dark ground has climbed the white section before any dark-register
 * content shows.
 *
 * `from` is still needed, and it is load-bearing in exactly one place: below
 * the boundary, where the section's own background-color is already the
 * incoming ground, the seam holds `from` underneath so the dissolve has
 * something to dissolve OUT of. Above the boundary nothing is assumed — the
 * dissolve composites over whatever is really painted there. Get `from` wrong
 * and the error appears at the boundary rather than nowhere, so it is stated
 * once per section and matches the register of the section above it.
 *
 * The alpha stops are an eased curve rather than a straight ramp: a linear
 * fade holds its steepest slope across the middle, which on the dark theme's
 * #050505 ↔ #ffffff joins is where "fog bank" was diagnosed twice. The bloom
 * is the other half of that fix — the crossing passes THROUGH the product
 * register's own tint instead of through neutral grey — and it is off-centre
 * and wider than the viewport, so no part of it resolves into a horizontal
 * edge.
 *
 * Register grounds are theme-level variables. [data-register] blocks remap the
 * WORKING tokens and leave these alone, so a seam inside a section can still
 * name a register other than the one it is standing in.
 */
const GROUND = {
  canvas: "var(--c-surf)",
  product: "var(--p-surf)",
  technical: "var(--t-surf)",
} as const;

export type SeamRegister = keyof typeof GROUND;

export default function SectionSeam({
  from,
  to,
}: {
  from: SeamRegister;
  to: SeamRegister;
}) {
  return (
    <div
      aria-hidden
      className="section-seam"
      style={
        { "--seam-a": GROUND[from], "--seam-b": GROUND[to] } as CSSProperties
      }
    />
  );
}
