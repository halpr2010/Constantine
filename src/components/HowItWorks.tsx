"use client";

import Image from "next/image";
import PaintingWall from "@/components/MonaLisaWall";
import EquipmentWall from "@/components/EquipmentWall";
import Reveal from "@/components/Reveal";
import SectionSeam from "@/components/SectionSeam";
import { useVertical } from "@/components/VerticalContext";

type Step = {
  n: string;
  title: string;
  /** Opening line. Bold in the gym variant, per the pitch deck. */
  lede: string;
  ledeBold?: boolean;
  sub?: string;
  items: string[];
  closer?: string;
  image?: { src: string; alt: string; w: number; h: number };
  /** Step 4 of the museum flow shows two static painting cards instead. */
  paintings?: boolean;
  /** Gym analogue: two static, ranked equipment cards. */
  equipment?: boolean;
};

const MUSEUM_STEPS: Step[] = [
  {
    n: "1.",
    title: "Integrate",
    lede: "A coverage survey maps your CCTV; standard IP cameras fill any blind spots.",
    items: ["No facial recognition is used.", "No identity profiles are created."],
    closer:
      "Each camera simply observes how visitors move and orient within the room.",
    image: {
      src: "/CCTV - Integrate2.png",
      alt: "CCTV camera in gallery corner — typical setup Constantine integrates with",
      w: 384,
      h: 384,
    },
  },
  {
    n: "2.",
    title: "Calibrate",
    lede: "Every gallery is mapped to its real-world dimensions.",
    sub: "This allows Constantine to understand:",
    items: [
      "Where artworks are located",
      "Viewing distances",
      "Movement patterns between works",
      "Circulation flow between rooms",
    ],
    closer:
      "Because the room is mapped to its real-world distances, Constantine can build true engagement metrics based on a visitor's position, walking speed and orientation.",
    image: {
      src: "/Calibrate - CCTV.png",
      alt: "Gallery mapped to real-world dimensions — camera field of view calibration",
      w: 384,
      h: 384,
    },
  },
  {
    n: "3.",
    title: "Measure",
    lede: "Each artwork is assigned an engagement zone, the space where meaningful attention can occur.",
    sub: "When a visitor enters that zone and orients toward the work, Constantine measures:",
    items: [
      "How long attention is sustained",
      "How frequently visitors return",
      "How engagement shifts across the exhibition",
    ],
    closer:
      "It captures which works hold attention, and for how long. That is a different question from how many people walked past.",
    image: {
      src: "/Measure.png",
      alt: "Engagement zones — artwork-level attention measurement",
      w: 384,
      h: 384,
    },
  },
  {
    n: "4.",
    title: "Insight",
    lede: "Curators, directors, analysts and beyond receive real-time analytics and AI-powered recommendations:",
    items: [
      "Dwell time distributions per artwork",
      "Engagement comparisons between rooms",
      "Visitor flow through the exhibition",
      "Attention drop-off points",
      "Engagement patterns by hour/day/week",
      "AI-powered curation and layout recommendations",
    ],
    closer: "All outputs are aggregated and privacy-first.",
    paintings: true,
  },
];

// The gym flow is three steps, not four — this is the vetted version from the
// operator pitch deck, kept word for word.
const GYM_STEPS: Step[] = [
  {
    n: "1.",
    title: "Integrate",
    lede: "A coverage survey maps your CCTV, standard IP cameras fill any blind spots",
    ledeBold: true,
    items: [
      "Compatible with major CCTV setups (e.g. Hikvision, Axis)",
      "No facial recognition or identity profiles",
      "No per-machine sensors or equipment changes",
    ],
    closer:
      "Video is processed on-site and immediately destroyed, only aggregated counts and metrics leave the venue.",
    image: {
      src: "/gym_integrate.png",
      alt: "Gym floor CCTV coverage survey",
      w: 666,
      h: 468,
    },
  },
  {
    n: "2.",
    title: "Calibrate",
    lede: "Every piece of gym equipment is mapped to its real-world dimensions",
    ledeBold: true,
    items: [
      "Zone boundaries (cardio vs free-weight etc.)",
      "Utilisation of each piece of equipment",
      "Movement patterns between zones",
    ],
    closer:
      "Constantine reads utilisation from the cameras alone. There are no smart sensors, no connected machines and no equipment modifications of any kind.",
    image: {
      src: "/gym_calibrate.png",
      alt: "Gym equipment mapped to real-world dimensions",
      w: 694,
      h: 440,
    },
  },
  {
    n: "3.",
    title: "Measure",
    lede: "Designed for cross-site analysis at scale and delivered via API into your existing stack, with a dashboard for teams acting on the signal directly.",
    ledeBold: true,
    items: [
      "How long the equipment is in active use",
      "How long members wait or queue",
      "How engagement shifts across the day, week, and by site",
    ],
    image: {
      src: "/gym_measure.png",
      alt: "Equipment zones — utilisation and wait time measurement",
      w: 690,
      h: 446,
    },
  },
  {
    n: "4.",
    title: "Insight",
    lede: "Operators, analysts and beyond receive real-time analytics and AI-powered recommendations:",
    items: [
      "Utilisation distributions per equipment type",
      "Wait-time and queue comparisons between zones",
      "Member flow across the floor",
      "Abandoned-attempt hot spots",
      "Utilisation patterns by hour/day/week",
      "AI-powered layout and equipment-mix recommendations",
    ],
    closer: "All outputs are aggregated and privacy-first.",
    equipment: true,
  },
];

export default function HowItWorks() {
  const { vertical } = useVertical();
  const isGym = vertical === "gyms";
  const steps = isGym ? GYM_STEPS : MUSEUM_STEPS;

  return (
    <section
      id="how"
      data-register="technical"
      className="relative px-6 pb-40 pt-40 md:pb-52 md:pt-48"
    >
      <SectionSeam from="canvas" to="technical" />
      <div className="relative mx-auto max-w-6xl">
        <Reveal grammar="focus">
          <h2 className="text-3xl font-semibold leading-tight md:text-4xl">
            How it Works…
          </h2>
        </Reveal>
        <Reveal grammar="ghost" lag={0.16} className="mt-4 max-w-2xl">
          <p className="text-fg-secondary">
            {isGym ? (
              <>
                From the CCTV you already own to equipment-level behavioural insight:
                <br />
                integrate, calibrate, and measure how members use the gym floor.
              </>
            ) : (
              <>
                From a camera coverage survey to artwork-level engagement insights:
                <br />
                Integrate, calibrate, measure, and understand visitor attention in
                real-world space.
              </>
            )}
          </p>
        </Reveal>

        {/* The sequence is the one place on the page where the argument is
            literally ordered, so it gets the one continuous element: a rule
            threading all four steps that inks downward as the block passes
            through the viewport, with each step arriving off it. This is the
            "flowing rather than segmented" device — a reader sees how far
            through Integrate → Calibrate → Measure → Insight they are without
            being told. */}
        <div className="relative mt-12">
          {/* The rule rides the container's own left gutter rather than taking
              a grid column: the Insight step's card rail already overflows a
              390 viewport, and buying 26px of layout for the spine would push
              that leak further. */}
          <div
            aria-hidden
            data-reveal="spine"
            data-reveal-mode="span"
            className="pointer-events-none absolute -left-3 bottom-2 top-2 w-px md:-left-6"
          />

          <div className="space-y-16">
          {steps.map((step, i) => (
            <Reveal
              key={step.n + step.title}
              grammar="advance"
              lag={0.06 * i}
            >
            <div
              data-register={step.paintings || step.equipment ? "product" : undefined}
              className="flex flex-col gap-6 rounded-xl border border-line-card bg-surface-card p-6 md:flex-row md:items-center md:gap-8 md:p-8"
            >
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-semibold text-fg-secondary">
                    {step.n}
                  </span>
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                </div>
                <p
                  className={`mt-3 ${
                    step.ledeBold ? "font-medium text-fg-emphasis" : "text-fg-secondary"
                  }`}
                >
                  {step.lede}
                </p>
                {step.sub && (
                  <p className="mt-2 text-sm text-fg-muted">{step.sub}</p>
                )}
                {/* Nested, so a step is still resolving after its own heading
                    has landed: the ticks arrive under a title that is already
                    sharp, which is the beat the founder described as features
                    "appearing in turn". --r does not inherit, so this reads its
                    own position rather than the card's. */}
                <ul className="mt-4 space-y-2">
                  {step.items.map((item, j) => (
                    <li key={item}>
                      <Reveal
                        grammar="ghost"
                        lag={0.1 * j}
                        className="flex items-start gap-2 text-sm text-fg-muted-list"
                      >
                        <span className="mt-0.5 shrink-0 text-accent-positive">✓</span>
                        {item}
                      </Reveal>
                    </li>
                  ))}
                </ul>
                {step.closer && (
                  <p className="mt-4 text-sm text-fg-muted">{step.closer}</p>
                )}
              </div>

              {step.paintings ? (
                <div className="flex shrink-0 flex-row flex-nowrap items-start gap-4 md:gap-6">
                  <div className="w-[280px] shrink-0 md:w-[300px]">
                    <div className="h-[440px] w-full">
                      <PaintingWall
                        src="/Pearls.jpg"
                        alt="Girl with a Pearl Earring"
                        title="Girl with a Pearl Earring - Vermeer"
                        chartToken="chart-1"
                        size="mini"
                        fixedAttentionTime={12.4}
                        rankingInExhibition={1}
                        rankingChange={3}
                        static
                        staticChartValues={[
                          0.38, 0.55, 0.62, 0.48, 0.42, 0.28, 0.35, 0.58, 0.71,
                          0.78, 0.88, 0.98,
                        ]}
                      />
                    </div>
                  </div>
                  <div className="w-[280px] shrink-0 md:w-[300px]">
                    <div className="h-[440px] w-full">
                      <PaintingWall
                        src="/Rothkos.jpg"
                        alt="No. 61 (Rust and Blue) 1953"
                        title="No. 61 (Rust and Blue) 1953 - Mark Rothko"
                        chartToken="chart-2"
                        size="mini"
                        minColorFloor={0.4}
                        fixedAttentionTime={9.8}
                        rankingInExhibition={6}
                        rankingChange={-1}
                        static
                        staticChartValues={[
                          0.52, 0.68, 0.55, 0.44, 0.58, 0.36, 0.74, 0.52, 0.68,
                          0.85, 0.78, 0.68,
                        ]}
                      />
                    </div>
                  </div>
                </div>
              ) : step.equipment ? (
                <div className="flex shrink-0 flex-row flex-nowrap items-start gap-4 md:gap-6">
                  <div className="w-[280px] shrink-0 md:w-[300px]">
                    <div className="h-[440px] w-full">
                      <EquipmentWall
                        title="Treadmill - Cardio"
                        chartToken="chart-1"
                        size="mini"
                        static
                        imageSrc="/treadmill2.png"
                        imageAlt="Treadmill"
                        fixedUtilisation={92}
                        rankingInGym={1}
                        rankingChange={2}
                        staticChartValues={[
                          0.42, 0.55, 0.6, 0.5, 0.48, 0.32, 0.4, 0.62, 0.74,
                          0.8, 0.9, 0.96,
                        ]}
                      />
                    </div>
                  </div>
                  <div className="w-[280px] shrink-0 md:w-[300px]">
                    <div className="h-[440px] w-full">
                      <EquipmentWall
                        title="Exercise Bike - Cardio"
                        chartToken="chart-2"
                        size="mini"
                        static
                        imageSrc="/bike2.png"
                        imageAlt="Exercise bike"
                        fixedUtilisation={28}
                        rankingInGym={7}
                        rankingChange={-1}
                        staticChartValues={[
                          0.5, 0.62, 0.52, 0.42, 0.55, 0.34, 0.6, 0.48, 0.5,
                          0.44, 0.4, 0.3,
                        ]}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                step.image && (
                  <div className="shrink-0 md:w-96">
                    <Image
                      src={step.image.src}
                      alt={step.image.alt}
                      width={step.image.w}
                      height={step.image.h}
                      className="w-full rounded-lg object-contain"
                    />
                  </div>
                )
              )}
            </div>
            </Reveal>
          ))}
          </div>
        </div>
      </div>
    </section>
  );
}
