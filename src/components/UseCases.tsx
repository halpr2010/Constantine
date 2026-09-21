"use client";

import Reveal from "@/components/Reveal";
import UseCaseGlyph, { GlyphKind } from "@/components/UseCaseGlyph";
import { useVertical, type Vertical } from "@/components/VerticalContext";

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

const RETAIL_CARDS: Card[] = [
  {
    title: "Experiential retail",
    desc: "Flagship and concept stores built for brand engagement: measure dwell, journey and engagement by zone, and price the store's attention like any other channel.",
    signals: "Zone dwell, engagement share, cost per attentive minute.",
    glyph: "ranked",
    caption: "zones ranked by dwell, this week",
  },
  {
    title: "Floor and fixture decisions",
    desc: "Every floor move, fixture change and installation gets a baseline before it and a measurement after, per store and across the estate.",
    signals: "Zone engagement, journey completion, walk-past rate.",
    glyph: "delta",
    caption: "the same zone before and after a floor move",
  },
  {
    title: "Quiet-floor detection",
    desc: "Zones whose engagement falls outside their own normal pattern raise a same-day flag to the store team, with no fixture sensors of any kind.",
    signals: "Engagement anomalies, abandoned approaches.",
    glyph: "anomaly",
    caption: "engagement leaving its normal band",
  },
];

const CARDS: Record<Vertical, Card[]> = {
  museums: MUSEUM_CARDS,
  gyms: GYM_CARDS,
  retail: RETAIL_CARDS,
};

const HEADING: Record<Vertical, string> = {
  museums: "Museum & Gallery Use Cases",
  gyms: "Fitness Space Use Cases",
  retail: "Retail & Flagship Use Cases",
};

const LEDE: Record<Vertical, string> = {
  museums:
    "From permanent collections to temporary exhibitions and cultural venues.",
  gyms: "Three ways an operator turns floor-level behaviour into decisions: inside a club, across the estate, and in members' hands.",
  retail:
    "Three ways an operator turns floor-level behaviour into decisions: inside a store, across the estate, and in the media plan.",
};

export default function UseCases() {
  const { vertical } = useVertical();
  const cards = CARDS[vertical];

  return (
    <section
      id="use"
      data-ground="canvas"
      className="section-band relative px-6"
    >
      <div className="relative mx-auto max-w-6xl">
        <Reveal grammar="focus">
          <h2 className="text-3xl font-semibold leading-tight md:text-4xl">
            {HEADING[vertical]}
          </h2>
        </Reveal>
        <Reveal grammar="ghost" lag={0.14} className="mt-4 max-w-2xl">
          <p className="text-fg-secondary">
            {LEDE[vertical]}{" "}
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
