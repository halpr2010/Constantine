import type { CSSProperties } from "react";

/**
 * The join between two registers, painted as a transition rather than an edge.
 *
 * §5 (amended 08 Sep 2026): "Register changes must be transitions rather than
 * hard colour edges — today each new section lands as an abrupt block of
 * colour, which is the specific thing being rejected."
 * shots/best/motion/scroll.png is nine frames of exactly that.
 *
 * The seam sits at the very top of the incoming section, inside its own box,
 * and grades from the OUTGOING register's ground into its own over ~11rem. At
 * y=0 it paints the colour that was already there, so there is nothing to line
 * up and nothing overlapping the section above; the new ground simply asserts
 * itself over the section's opening padding instead of at a hairline. A soft
 * bloom in the product register's own tint rides the join, which is the Claryo
 * move (design-refs/Claryo-scroll-3.png) — a lit boundary, not a rule.
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
