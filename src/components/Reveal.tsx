import type { CSSProperties, ReactNode } from "react";

/**
 * One revealed unit of the scroll argument (§5 "Motion carries information",
 * amended 08 Sep 2026).
 *
 * The grammar names are roles, not effects. §5 lifted the entrance-animation
 * ban but kept its intent as a quality bar: "motion must feel authored and
 * sequenced ... rather than a uniform fade-and-slide applied indiscriminately
 * to every block". So a heading never travels, body copy never moves at all,
 * and only panels are allowed to arrive:
 *
 *   focus    headings — defocused to sharp, the claim resolving. Blur rather
 *            than travel, because this is what the product itself does.
 *   ghost    body copy and list items — dim to full, in place. Claryo's
 *            un-revealed state (design-refs/Claryo-scroll-2.png): the item is
 *            present and readable-as-shape before it resolves, so the page
 *            never reads as empty.
 *   ink      rules and eyebrows — drawn left to right.
 *   settle   cards and panels — travel up and come to rest.
 *   advance  the #how steps — arrive laterally off the spine that threads them.
 *   spine    the rule itself, inked by scroll across the whole step sequence.
 *
 * `lag` offsets the start within a group, in units of the reveal's own travel.
 * A row of cards sharing one top edge has no natural stagger, so the lag is
 * what turns it into a wipe across the row.
 *
 * WRAPPER DISCIPLINE — the motion always lives on a <div> that carries no text
 * of its own. tests/themes.spec.ts skips any element whose OWN opacity is
 * below 0.95, so putting data-reveal on an <h2>, <p> or <li> would quietly
 * drop most of the page out of the palette floor. Ancestor opacity does not
 * change a child's computed opacity, so wrapping keeps that floor honest.
 */
export type RevealGrammar = "focus" | "ghost" | "ink" | "settle" | "advance";

export default function Reveal({
  grammar,
  lag = 0,
  className,
  style,
  children,
}: {
  grammar: RevealGrammar;
  lag?: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <div
      data-reveal={grammar}
      data-reveal-lag={lag ? lag.toFixed(2) : undefined}
      className={className}
      style={style}
    >
      {children}
    </div>
  );
}
