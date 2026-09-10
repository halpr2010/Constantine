"use client";

import FloorLedger from "@/components/FloorLedger";
import Reveal from "@/components/Reveal";
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
      desc: "Measure a re-hang or exhibition change against a real before-and-after, so you know whether it worked.",
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
      desc: "See what members actually use, so refresh and buying decisions follow real demand.",
    },
    {
      title: "Where does the floor create friction?",
      desc: "Find the zones and hours where members queue, wait, or give up: the friction that quietly drives cancellations.",
    },
    {
      title: "Is a machine down before members complain?",
      desc: "Catch equipment whose usage drops out of pattern on the same day it happens.",
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
    <section
      id="value"
      // TECHNICAL, not canvas, and no seam. This section used to declare canvas
      // between #how and #privacy, which both declare technical: the page went
      // black, white, black across three consecutive sections, and the two
      // crossings cost 403px of empty ramp in and 406px out for 489px of
      // content. Claryo changes ground when the ARGUMENT changes — problem to
      // solution, solution to applications — never for one beat inside a run.
      // #how, #value, #privacy and #stack are one run: what the system does,
      // what it answers, what it refuses to hold, where it plugs in. The page
      // now crosses into that ground once, at #how, and out of it once, at #use.
      data-register="technical"
      className="section-band relative px-6"
    >
      <div className="relative mx-auto max-w-6xl">
        {/* The answer to #problem, drawn on the same object. The ledger there
            has one track carrying data and four empty rails; here it is the
            identical day with every rail written on and each zone's peak
            marked. The heading and the closing line share the row with it so
            the four cards below still land inside 1440x900. */}
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-14">
          <div>
            {/* Mirrors ProblemSection's "The problem" eyebrow. The spec's
                eyebrow text was identical to the museum heading, which
                rendered the same line twice. */}
            <Reveal
              grammar="ink"
              className="w-fit text-xs font-semibold uppercase tracking-wider text-fg-muted"
            >
              The value
            </Reveal>
            <Reveal grammar="focus" lag={0.06} className="mt-4">
              <h2 className="text-3xl font-semibold leading-tight md:text-4xl">
                {copy.heading}
              </h2>
            </Reveal>
            <Reveal grammar="ghost" lag={0.2} className="mt-4 max-w-2xl">
              <p className="text-fg-secondary">{copy.closer}</p>
            </Reveal>
          </div>
          <Reveal grammar="settle" lag={0.1}>
            <FloorLedger mode="measured" />
          </Reveal>
        </div>
        {/* Four answers on one baseline have no natural stagger, so the lag
            supplies one: the row wipes left to right, which reads as results
            landing rather than as four blocks appearing together. */}
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {copy.cards.map((item, i) => (
            <Reveal
              key={item.title}
              grammar="settle"
              lag={0.13 * i}
              className="rounded-xl border border-line-card bg-surface-card p-6"
            >
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-fg-muted">{item.desc}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
