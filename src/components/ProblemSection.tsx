"use client";

import { useVertical } from "@/components/VerticalContext";

const MUSEUM = {
  heading: "You can measure who came in. Not what held them.",
  lede: "Ticketing and footfall tell you how many people walked through. They can't tell you which works held attention, which rooms lost it, or where a layout quietly fails. That signal lives in the space itself, and today it goes unrecorded.",
  points: [
    "Footfall counts visits, not engagement.",
    "Surveys are sparse, late, and self-reported.",
    "The room's own behaviour is never captured.",
  ],
};

const GYM = {
  heading: "Your CRM records who cancelled. Not the friction that made them.",
  lede: "Turnstiles and CRM tell you who joined and who left. They can't see the full floor at 6pm, the equipment members queue for, the machine that's been dead for days, or the friction that quietly pushes people towards cancelling. That signal lives on the floor, and today it goes unrecorded.",
  points: [
    "Turnstile counts entries, not what happens inside.",
    "Churn models see the outcome, not the cause.",
    "Floor friction is invisible until it shows up as cancellations.",
  ],
};

export default function ProblemSection() {
  const { vertical } = useVertical();
  const copy = vertical === "gyms" ? GYM : MUSEUM;

  return (
    <section id="problem" className="border-t border-line-hairline px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="text-xs font-semibold uppercase tracking-wider text-fg-muted">
          The problem
        </div>
        <h2 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight md:text-4xl">
          {copy.heading}
        </h2>
        <p className="mt-4 max-w-2xl text-fg-secondary">{copy.lede}</p>
        <ul className="mt-8 space-y-3">
          {copy.points.map((point) => (
            <li
              key={point}
              className="flex items-start gap-3 text-sm text-fg-muted-list"
            >
              <span
                aria-hidden
                className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-marker-weak"
              />
              {point}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
