"use client";

import { useVertical } from "@/components/VerticalContext";

type Card = { title: string; desc: string };

const MUSEUM = {
  heading: "What you can now answer",
  cards: [
    {
      title: "Which works are actually worth the wall?",
      desc: "See which pieces hold attention and which are walked past, so hangs and loans are evidence-led.",
    },
    {
      title: "Is the new layout working?",
      desc: "Measure a re-hang or exhibition change against a real before-and-after, not a hunch.",
    },
    {
      title: "Where do we lose people?",
      desc: "Find the rooms and transitions where engagement drops, and fix the flow.",
    },
    {
      title: "What do we tell funders?",
      desc: "Turn real engagement into the evidence board reports and grant applications need.",
    },
  ] as Card[],
  closer:
    "Attention, made measurable, so every decision has evidence behind it.",
};

const GYM = {
  heading: "Where the value shows up",
  cards: [
    {
      title: "Which equipment earns its floor space?",
      desc: "See what members actually use, so refresh and buying decisions follow real demand, not guesswork.",
    },
    {
      title: "Where does the floor create friction?",
      desc: "Find the zones and hours where members queue, wait, or give up: the friction that quietly drives cancellations.",
    },
    {
      title: "Is a machine down before members complain?",
      desc: "Catch equipment whose usage drops out of pattern the same day, not a week later.",
    },
    {
      title: "Did the refit actually work?",
      desc: "Measure every layout change and capex decision against a real before-and-after, per club and across the estate.",
    },
  ] as Card[],
  closer:
    "Floor behaviour, made measurable, so you can act on the friction before it becomes churn.",
};

export default function ValueSection() {
  const { vertical } = useVertical();
  const copy = vertical === "gyms" ? GYM : MUSEUM;

  return (
    <section id="value" className="border-t border-zinc-800/50 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        {/* Mirrors ProblemSection's "The problem" eyebrow. The spec's eyebrow
            text was identical to the museum heading, which rendered the same
            line twice. */}
        <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          The value
        </div>
        <h2 className="mt-4 text-3xl font-semibold leading-tight md:text-4xl">
          {copy.heading}
        </h2>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {copy.cards.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6"
            >
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-zinc-500">{item.desc}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 max-w-2xl text-zinc-400">{copy.closer}</p>
      </div>
    </section>
  );
}
