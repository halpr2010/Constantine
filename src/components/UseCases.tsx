"use client";

import { useVertical } from "@/components/VerticalContext";

type Card = {
  title: string;
  /** Where this sits in the operation — gym variant only. */
  tag?: string;
  desc: string;
  signals?: string;
};

const MUSEUM_CARDS: Card[] = [
  {
    title: "Museums & Galleries",
    desc: "Curation insights, layout optimization, donor reporting.",
  },
  {
    title: "Temporary Exhibitions",
    desc: "Compare rooms, wall-text and label engagement, and A/B layouts.",
  },
  {
    title: "Cultural Venues",
    desc: "Events, installations, audience flow and crowding.",
  },
];

const GYM_CARDS: Card[] = [
  {
    title: "Optimised configuration",
    desc: "Every refresh, layout change and class schedule gets a baseline before and a measurement after.",
    signals: "Equipment and zone utilisation, wait times, capacity saturation.",
  },
  {
    title: "Retention decomposition",
    desc: "The behavioural covariates existing churn models don't have; separates clubs underperforming their catchment from those at their ceiling.",
    signals: "Club friction levels, unexplained retention gap.",
  },
  {
    title: "Automated machine-fault detection",
    desc: "Machines whose usage falls outside their normal pattern raise a same-day alert to the club team, without any per-machine sensors.",
    signals: "Broken-machine flagging, abandoned attempts.",
  },
];

export default function UseCases() {
  const { vertical } = useVertical();
  const isGym = vertical === "gyms";
  const cards = isGym ? GYM_CARDS : MUSEUM_CARDS;

  return (
    <section id="use" className="border-t border-zinc-800/50 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-semibold leading-tight md:text-4xl">
          {isGym ? "Fitness Space Use Cases" : "Museum & Gallery Use Cases"}
        </h2>
        <p className="mt-4 max-w-2xl text-zinc-400">
          {isGym
            ? "Three ways an operator turns floor-level behaviour into decisions: inside a club, across the estate, and in members' hands."
            : "From permanent collections to temporary exhibitions and cultural venues."}
        </p>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {cards.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6"
            >
              {item.tag && (
                <div className="mb-2 text-xs tracking-wide text-zinc-500">
                  {item.tag}
                </div>
              )}
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-zinc-500">{item.desc}</p>
              {item.signals && (
                <p className="mt-4 text-sm text-zinc-400">
                  <span className="text-emerald-500">New signals: </span>
                  {item.signals}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
