"use client";

import { useId, useState, type ReactNode } from "react";
import { useVertical } from "@/components/VerticalContext";

/**
 * Categorised FAQ (§4, Pocket).
 *
 * The Pocket privacy page is the reference: a framing sentence, a row of short
 * factual chips that can be read at a glance, then the longer answers below.
 * Here the chips belong to the selected category, so switching category
 * re-reads the whole claim set without opening anything.
 *
 * Categories are the four gates a venue team actually walks a supplier
 * through before a pilot, in the order they raise them.
 */

type QA = { q: string; a: string };

type Category = {
  id: string;
  label: string;
  hint: string;
  glyph: ReactNode;
  /** Read-at-a-glance claims for the whole category (Pocket's chip row). */
  chips: string[];
  items: QA[];
};

const glyphProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.25,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  className: "h-5 w-5",
};

/** A person inside a camera frame, reduced to a point. */
const GlyphPrivacy = (
  <svg {...glyphProps}>
    <rect x="2.5" y="5" width="19" height="14" rx="2" />
    <circle cx="12" cy="12" r="2.5" />
    <path d="M12 6.5v1.5M12 16v1.5M5.5 12H7M17 12h1.5" />
  </svg>
);

/** An edge unit on a wall, reading the cameras already there. */
const GlyphDeployment = (
  <svg {...glyphProps}>
    <rect x="3" y="7" width="11" height="8" rx="1.5" />
    <circle cx="8.5" cy="11" r="1.5" />
    <path d="M3 19h18" />
    <path d="M17 9.5a4 4 0 0 1 0 5M19.5 7.5a7 7 0 0 1 0 9" />
  </svg>
);

/** Hub and spokes: one source feeding the systems you already report from. */
const GlyphIntegration = (
  <svg {...glyphProps}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 9V4.5M14.6 13.6l3.9 2.3M9.4 13.6l-3.9 2.3" />
    <rect x="9.5" y="2" width="5" height="2.5" rx="0.75" />
    <rect x="18" y="16" width="4.5" height="2.5" rx="0.75" />
    <rect x="1.5" y="16" width="4.5" height="2.5" rx="0.75" />
  </svg>
);

/** Value measured over a pilot period. */
const GlyphCommercial = (
  <svg {...glyphProps}>
    <path d="M3 19.5h18" />
    <rect x="4.5" y="13" width="4" height="6.5" rx="0.75" />
    <rect x="10" y="9" width="4" height="10.5" rx="0.75" />
    <rect x="15.5" y="4.5" width="4" height="15" rx="0.75" />
  </svg>
);

function categories(person: string, venue: string): Category[] {
  return [
    {
      id: "privacy",
      label: "Privacy",
      hint: "What leaves the building",
      glyph: GlyphPrivacy,
      chips: [
        "Processed on site",
        "Footage destroyed",
        "No faces held",
        "Anonymous points",
      ],
      items: [
        {
          q: "What happens to the video?",
          a: `Every frame is read on a device inside your ${venue} and destroyed in the same moment. The stream is never uploaded and never archived, so there is no footage library for anyone to request or lose.`,
        },
        {
          q: `Can Constantine identify a ${person}?`,
          a: `No. The system keeps position, orientation and dwell time as anonymous points on a floor plan. There are no faces, no biometric templates and no route back from a metric to a ${person}.`,
        },
        {
          q: "What does our privacy reviewer get?",
          a: "A written processing description, a data flow showing which fields leave the device, and the retention position for each one. Your DPO gets something concrete to assess before a camera is touched.",
        },
      ],
    },
    {
      id: "deployment",
      label: "Deployment",
      hint: "Cameras, hardware and setup",
      glyph: GlyphDeployment,
      chips: [
        "Existing CCTV",
        "One unit per site",
        "Standard socket",
        "Zones you draw",
      ],
      items: [
        {
          q: "Do we need new cameras?",
          a: `Usually no. Constantine reads the commercial CCTV your ${venue} already runs, provided the coverage takes in the spaces you want measured. We check that against your camera list first.`,
        },
        {
          q: "What gets installed on site?",
          a: "One edge unit, about the size of a small router, on your camera network and a standard power socket. It sends metrics outbound and needs no inbound access to your network.",
        },
        {
          q: "How long does it take to stand up?",
          a: "A pilot site is normally live the day it is mounted. Calibration and zone authoring take an afternoon, and the first week establishes the baseline everything after it is measured against.",
        },
      ],
    },
    {
      id: "integration",
      label: "Integration",
      hint: "Where the numbers end up",
      glyph: GlyphIntegration,
      chips: [
        "Documented API",
        "Scheduled exports",
        "RTSP and ONVIF",
        "Zone time series",
      ],
      items: [
        {
          q: "How do we get the data out?",
          a: "Through a documented API and scheduled exports in open formats. The metrics are built to land in the kinds of system you already report from: BI and dashboard tools, ticketing platforms, CRM.",
        },
        {
          q: "Will it fit the reporting we run?",
          a: "Output is aggregated counts and time series keyed on the zones you defined and the hour they happened in, so it joins your reporting on date and location. Your analysts get a new column rather than a new model.",
        },
        {
          q: "How does it sit with our camera platform?",
          a: "The edge unit reads standard streams over RTSP and ONVIF, so it works alongside your video management system and leaves your recording and retention setup as it is.",
        },
      ],
    },
    {
      id: "commercial",
      label: "Commercial",
      hint: "Pilots, pricing and ownership",
      glyph: GlyphCommercial,
      chips: [
        "Per site pricing",
        "Fixed pilot period",
        "Your data stays yours",
        "Export on request",
      ],
      items: [
        {
          q: "How does a pilot work?",
          a: "One site, a fixed period, and one question you want answered by the end of it. You get live zone reporting throughout and a readout at the close, then you decide whether to widen it.",
        },
        {
          q: "How is it priced?",
          a: "Per site, scaling with how many zones you measure rather than how many people walk through them. Pilot pricing is quoted up front and covers the unit, calibration and reporting.",
        },
        {
          q: "Who owns the data?",
          a: `You do. The metrics from your ${venue} are yours to keep, and they are never sold, shared or pooled with anyone else's. Ask us to export them or delete them and we will.`,
        },
      ],
    },
  ];
}

export default function FaqSection() {
  const { vertical } = useVertical();
  const isGym = vertical === "gyms";
  const cats = categories(isGym ? "member" : "visitor", isGym ? "club" : "museum");

  const uid = useId();
  const [active, setActive] = useState(0);
  // One answer open at a time keeps the whole section inside a single viewport
  // per the §5 viewport-fit rule, which is why this section can be tagged.
  const [open, setOpen] = useState(0);
  const cat = cats[active];

  return (
    <section
      id="faq"
      data-register="canvas"
      data-testid="viewport-section"
      // The header is fixed and ~88px tall; without scroll-mt an anchor jump
      // to #faq lands the eyebrow and heading underneath it.
      className="scroll-mt-24 border-t border-line-hairline px-6 py-12 md:py-16"
    >
      <div className="mx-auto max-w-6xl">
        <div className="text-sm font-medium text-fg-muted">Common questions</div>
        <h2 className="mt-2 text-3xl font-semibold leading-tight md:text-4xl">
          What buyers ask before a pilot
        </h2>
        <p className="mt-3 max-w-2xl text-fg-secondary">
          The four gates a {isGym ? "club" : "museum"} team walks us through
          before saying yes.
        </p>

        <div className="mt-7 flex flex-col gap-4 md:mt-8 md:flex-row md:gap-8">
          {/* Category rail: a 2x2 grid of chips on mobile, a vertical index at
              desktop, so the four gates are visible at once in both layouts. */}
          <div
            role="tablist"
            aria-label="Question categories"
            className="grid shrink-0 grid-cols-2 gap-2 md:w-60 md:grid-cols-1"
          >
            {cats.map((c, i) => {
              const selected = i === active;
              return (
                <button
                  key={c.id}
                  role="tab"
                  id={`${uid}-tab-${c.id}`}
                  aria-selected={selected}
                  aria-controls={`${uid}-panel`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => {
                    setActive(i);
                    setOpen(0);
                  }}
                  className={`flex items-start gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors motion-reduce:transition-none md:py-3 ${
                    selected
                      ? "border-line-card bg-surface-card"
                      : "border-line-hairline hover:border-line-card"
                  }`}
                >
                  <span
                    className={selected ? "text-fg-primary" : "text-fg-muted"}
                  >
                    {c.glyph}
                  </span>
                  <span className="min-w-0">
                    <span
                      className={`block text-sm font-semibold ${
                        selected ? "text-fg-primary" : "text-fg-secondary"
                      }`}
                    >
                      {c.label}
                    </span>
                    <span className="mt-0.5 hidden text-xs leading-snug text-fg-muted md:block">
                      {c.hint}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div
            role="tabpanel"
            id={`${uid}-panel`}
            aria-labelledby={`${uid}-tab-${cat.id}`}
            className="min-w-0 flex-1 rounded-xl border border-line-card bg-surface-card"
          >
            <div className="flex flex-wrap gap-2 border-b border-line-hairline px-4 py-3 md:px-5">
              {cat.chips.map((chip) => (
                <span
                  key={chip}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line-hairline px-2.5 py-1 text-xs text-fg-secondary"
                >
                  <span
                    aria-hidden
                    className="h-1.5 w-1.5 shrink-0 rounded-full bg-marker-weak"
                  />
                  {chip}
                </span>
              ))}
            </div>

            {cat.items.map((item, i) => {
              const isOpen = i === open;
              return (
                <div
                  key={item.q}
                  className={i > 0 ? "border-t border-line-hairline" : ""}
                >
                  <h3>
                    <button
                      id={`${uid}-q-${cat.id}-${i}`}
                      aria-expanded={isOpen}
                      aria-controls={`${uid}-a-${cat.id}-${i}`}
                      onClick={() => setOpen(isOpen ? -1 : i)}
                      className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left md:px-5 md:py-3.5"
                    >
                      <span className="text-[15px] font-medium text-fg-primary">
                        {item.q}
                      </span>
                      {/* Rotated rather than swapped so the control does not
                          reflow; the transition is dropped under reduced motion. */}
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                        className={`h-4 w-4 shrink-0 text-fg-muted transition-transform motion-reduce:transition-none ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      >
                        <path d="M6 9.5l6 6 6-6" />
                      </svg>
                    </button>
                  </h3>
                  <div
                    id={`${uid}-a-${cat.id}-${i}`}
                    role="region"
                    aria-labelledby={`${uid}-q-${cat.id}-${i}`}
                    hidden={!isOpen}
                  >
                    <p className="max-w-prose px-4 pb-4 text-sm leading-relaxed text-fg-secondary md:px-5 md:pb-5">
                      {item.a}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <p className="mt-5 text-sm text-fg-muted md:mt-6">
          Something we have not covered?{" "}
          <a
            href="#pilot"
            className="text-fg-secondary underline underline-offset-4 hover:text-fg-primary"
          >
            Ask it in the pilot request
          </a>
          .
        </p>
      </div>
    </section>
  );
}
