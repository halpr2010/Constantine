"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import AmbientField from "@/components/AmbientField";
import VenuePlan, { STEPS } from "@/components/VenuePlan";
import { useVertical } from "@/components/VerticalContext";

/**
 * The atmosphere block: the field, and the object that augments over it.
 *
 * This is the frame design-refs/strips/Claryo_Ambiance_and_Scroll_Functionality_3.png
 * is a picture of — a pinned screen of purple blooms on near-black, a single
 * white hairline plan in the middle of it, and step text accumulating at the
 * side as the drawing gains detail. It sits directly under the hero because
 * both declare the product register, so the atmosphere runs from the first
 * screen into this one with no register change and therefore no seam; the
 * existing product → canvas seam at the top of #problem closes it again.
 *
 * The stage is PINNED while the run scrolls past it, and AmbientField reads
 * the field in document coordinates, so the page scrolls THROUGH the field
 * rather than carrying it along. That is also what makes the field unbounded
 * vertically: there is no bottom of the field to reach, only more of it.
 *
 * The hero is deliberately left alone. §3 makes the demos the brightest and
 * most detailed thing on screen, and they are the site's strongest asset; the
 * atmosphere opens underneath them instead of behind them, and the hero it
 * opens out of is unchanged.
 */

const COPY = {
  museums: {
    lede:
      "Every space Constantine measures starts as geometry: the plan, the zones you care about, and the coverage you already have.",
    steps: [
      {
        word: "Footprint",
        line: "The floor as built. Walls, doors and the boundary of the space, taken from the plan you already hold.",
      },
      {
        word: "Zones",
        line: "The areas you want answers about: a room, a hanging wall, the space in front of one work.",
      },
      {
        word: "Sightlines",
        line: "What each existing camera already covers, checked before a single measurement is taken.",
      },
      {
        word: "Movement",
        line: "Where visitors go, where they stop, and how long they stay, counted zone by zone.",
      },
    ],
  },
  gyms: {
    lede:
      "Every space Constantine measures starts as geometry: the plan, the zones you care about, and the coverage you already have.",
    steps: [
      {
        word: "Footprint",
        line: "The floor as built. Walls, doors and the boundary of the space, taken from the plan you already hold.",
      },
      {
        word: "Zones",
        line: "The areas you want answers about: a rig, a bank of cardio machines, the studio.",
      },
      {
        word: "Sightlines",
        line: "What each existing camera already covers, checked before a single measurement is taken.",
      },
      {
        word: "Movement",
        line: "Where members go, where they queue, and how long a machine is held, counted zone by zone.",
      },
    ],
  },
} as const;

/** Fraction of the run spent before the first step and after the last. */
const LEAD = 0.07;
const TAIL = 0.07;

const smoothstep = (e0: number, e1: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

export default function VenueStage() {
  const { vertical } = useVertical();
  const copy = COPY[vertical] ?? COPY.museums;

  const runRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState<number[]>(() =>
    new Array(STEPS).fill(0)
  );
  const [reached, setReached] = useState(0);
  const frozen = useRef(false);

  /** How far the run has been scrolled through, 0..1, and how far its top edge
   *  has climbed the viewport. Both are read live; nothing is cached. */
  const measure = () => {
    const run = runRef.current;
    if (!run) return { p: 0, enter: 0 };
    const r = run.getBoundingClientRect();
    const vh = window.innerHeight;
    const travel = r.height - vh;
    return {
      p: travel > 0 ? Math.min(1, Math.max(0, -r.top / travel)) : 0,
      enter: Math.min(1, Math.max(0, (vh - r.top) / vh)),
    };
  };

  /**
   * STRENGTH IS WHAT KEEPS THE FIELD EDGELESS, and it reads two different
   * measures because the block has two different boundaries.
   *
   * Entering: while the block's top edge is still on screen, that edge is
   * where the field would visibly start. So the field is at zero until the
   * edge has climbed into the top fifth of the viewport, and reaches its
   * opening value only as the edge passes behind the header. What the reader
   * sees is atmosphere gathering out of the ground, never a line with a field
   * under it.
   *
   * Leaving: the pinned stage releases at the end of the run, so the same edge
   * comes back. The tail takes strength to zero before it does, and the
   * existing product → canvas seam at the top of #problem covers the rest of
   * the crossing.
   *
   * Passed to AmbientField as a function, not a number: it is evaluated inside
   * the draw, so the first frame after a scroll is already right.
   */
  const strengthOf = useCallback(() => {
    if (frozen.current) return 1;
    const { p, enter } = measure();
    return (
      smoothstep(0.8, 1, enter) *
      (0.62 + 0.38 * Math.min(1, p / 0.18)) *
      (1 - smoothstep(0.9, 1, p))
    );
  }, []);

  useEffect(() => {
    const run = runRef.current;
    if (!run) return;
    // §5: static under prefers-reduced-motion, with everything in its final
    // state. The plan is fully drawn and every step is present, so the block
    // says the same thing without moving, and no listener is attached.
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    frozen.current = still;

    let frame = 0;
    let last: number[] = [];
    const update = () => {
      frame = 0;
      const { p } = measure();
      const seg = still
        ? STEPS
        : ((p - LEAD) / (1 - LEAD - TAIL)) * STEPS;
      const next = new Array(STEPS)
        .fill(0)
        .map((_, i) => Math.min(1, Math.max(0, seg - i)));
      // Only re-render on a change big enough to see. A raw scroll binding
      // renders on every frame of every scroll for a drawing that moves by
      // fractions of a pixel.
      const moved =
        last.length !== next.length ||
        next.some((v, i) => Math.abs(v - last[i]) > 0.008);
      if (moved) {
        last = next;
        setProgress(next);
      }
      // Step text LATCHES (§5: "reveals latch; scrolling back up must not
      // un-tell the argument"). The drawing is scroll-linked because it is a
      // diagram and reads correctly in both directions; the prose is not.
      setReached((cur) => Math.max(cur, Math.min(STEPS - 1, Math.floor(seg))));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    if (still) return;
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section id="venue" data-register="product" className="relative">
      {/* The run is scroll length and nothing else; everything visible lives in
          the pinned stage inside it. Shorter at 390, where the same four steps
          cost the reader four times as much thumb travel. */}
      <div ref={runRef} className="h-[250vh] md:h-[330vh]">
        <div className="sticky top-0 h-screen overflow-hidden">
          <AmbientField strengthOf={strengthOf} />

          {/* Two layouts, one DOM. Below lg the three blocks stack and share
              the screen as a flex column; the top padding clears the header,
              which is two rows tall at 390. From lg they are placed against
              the frame the way the reference composes it: claim at the left,
              object in the middle, steps down the right. */}
          <div className="relative z-10 flex h-full flex-col justify-between gap-4 px-6 pb-[3vh] pt-[17vh] lg:block lg:p-0">
            {/* The claim, held for the whole run. */}
            <div className="max-w-[19rem] lg:absolute lg:left-[5vw] lg:top-[15vh] lg:max-w-[17rem]">
              <div className="text-sm font-medium text-fg-muted">The venue</div>
              <h2 className="mt-1.5 text-4xl font-semibold tracking-tight lg:mt-2 lg:text-5xl">
                Geometry
              </h2>
              <p className="mt-2.5 text-[13px] leading-snug text-fg-secondary lg:mt-4 lg:text-sm lg:leading-relaxed">
                {copy.lede}
              </p>
            </div>

            {/* The object, and the subject of the frame. From lg it fills the
                band between the two text columns rather than the whole frame:
                preserveAspectRatio does the fitting, so it is as large as it
                can be at any viewport without ever running under the copy. */}
            <div className="flex min-h-0 shrink justify-center lg:absolute lg:inset-0 lg:items-center lg:py-[14vh] lg:pl-[24%] lg:pr-[23%]">
              <VenuePlan
                vertical={vertical}
                progress={progress}
                className="h-auto w-[82vw] max-w-[26rem] lg:h-full lg:w-full lg:max-w-none"
              />
            </div>

            {/* The steps, accumulating. */}
            <ol className="space-y-2.5 lg:absolute lg:right-[4vw] lg:top-[17vh] lg:w-[15.5rem] lg:space-y-7">
              {copy.steps.map((s, i) =>
                i <= reached ? (
                  <li key={s.word} className="venue-step">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`h-2 w-2 rounded-[1px] ${
                          i === reached ? "bg-fg-primary" : "bg-fg-muted"
                        }`}
                      />
                      <span className="text-base font-semibold lg:text-lg">
                        {s.word}
                      </span>
                    </div>
                    <p className="mt-1 pl-[1.125rem] text-[13px] leading-snug text-fg-secondary lg:mt-2 lg:text-sm lg:leading-relaxed">
                      {s.line}
                    </p>
                  </li>
                ) : null
              )}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
