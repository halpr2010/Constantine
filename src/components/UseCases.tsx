"use client";

import Reveal from "@/components/Reveal";
import SectionSeam from "@/components/SectionSeam";
import UseCaseGlyph, { GlyphKind } from "@/components/UseCaseGlyph";
import { useVertical } from "@/components/VerticalContext";

type Card = {
  title: string;
  /** Where this sits in the operation — gym variant only. */
  tag?: string;
  desc: string;
  signals?: string;
  /** The shape of reading this use case produces (§5's card visual). */
  glyph: GlyphKind;
  caption: string;
};

const MUSEUM_CARDS: Card[] = [
  {
    title: "Museums & Galleries",
    desc: "Curation insights, layout optimization, donor reporting.",
    glyph: "ranked",
    caption: "attention per work, this week",
  },
  {
    title: "Temporary Exhibitions",
    desc: "Compare rooms, wall-text and label engagement, and A/B layouts.",
    glyph: "delta",
    caption: "the same room before and after a re-hang",
  },
  {
    title: "Cultural Venues",
    desc: "Events, installations, audience flow and crowding.",
    glyph: "anomaly",
    caption: "crowding leaving its comfort band",
  },
];

const GYM_CARDS: Card[] = [
  {
    title: "Optimised configuration",
    desc: "Every refresh, layout change and class schedule gets a baseline before and a measurement after.",
    signals: "Equipment and zone utilisation, wait times, capacity saturation.",
    glyph: "delta",
    caption: "the same zone before and after a refit",
  },
  {
    title: "Retention decomposition",
    desc: "The behavioural covariates existing churn models don't have; separates clubs underperforming their catchment from those at their ceiling.",
    signals: "Club friction levels, unexplained retention gap.",
    glyph: "ranked",
    caption: "clubs ranked against their catchment",
  },
  {
    title: "Automated machine-fault detection",
    desc: "Machines whose usage falls outside their normal pattern raise a same-day alert to the club team, without any per-machine sensors.",
    signals: "Broken-machine flagging, abandoned attempts.",
    glyph: "anomaly",
    caption: "usage leaving its normal band",
  },
];

export default function UseCases() {
  const { vertical } = useVertical();
  const isGym = vertical === "gyms";
  const cards = isGym ? GYM_CARDS : MUSEUM_CARDS;

  return (
    <section
      id="use"
      data-register="canvas"
      className="section-band relative px-6"
    >
      <SectionSeam from="technical" to="canvas" />
      <div className="relative mx-auto max-w-6xl">
        <Reveal grammar="focus">
          <h2 className="text-3xl font-semibold leading-tight md:text-4xl">
            {isGym ? "Fitness Space Use Cases" : "Museum & Gallery Use Cases"}
          </h2>
        </Reveal>
        <Reveal grammar="ghost" lag={0.14} className="mt-4 max-w-2xl">
          <p className="text-fg-secondary">
            {isGym
              ? "Three ways an operator turns floor-level behaviour into decisions: inside a club, across the estate, and in members' hands."
              : "From permanent collections to temporary exhibitions and cultural venues."}{" "}
            Each card ends in the reading it produces. The readings are
            illustrative.
          </p>
        </Reveal>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {cards.map((item, i) => (
            <Reveal
              key={item.title}
              grammar="settle"
              lag={0.15 * i}
              className="flex flex-col rounded-xl border border-line-card bg-surface-card p-6"
            >
              {item.tag && (
                <div className="mb-2 text-xs tracking-wide text-fg-muted">
                  {item.tag}
                </div>
              )}
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-fg-muted">{item.desc}</p>
              {item.signals && (
                <p className="mt-4 text-sm text-fg-secondary">
                  <span className="text-accent-positive">New signals: </span>
                  {item.signals}
                </p>
              )}
              {/* §5's card module ends in a product visual. Without one these
                  three were the flattest thing on the page. */}
              <UseCaseGlyph kind={item.glyph} caption={item.caption} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
