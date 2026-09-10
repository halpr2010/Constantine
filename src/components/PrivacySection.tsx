"use client";

import PrivacyStage from "@/components/PrivacyStage";
import Reveal from "@/components/Reveal";
import { useVertical } from "@/components/VerticalContext";

/**
 * One privacy section for every vertical. The claims, structure and wording are
 * identical across museums and gyms — only the noun (visitor / member) changes.
 *
 * LAYOUT, 09 Sep 2026. This was 811 characters of argument with nothing to look
 * at, which tests/reveal.spec.ts scores as the Slingshot 2/10 anti-reference
 * ("all that's on the screen is block text and words with no diagrams, people
 * or ambience"). The claims are now made twice, once in prose and once in a
 * picture: PrivacyStage stands beside them and shows where the video stops.
 *
 * The column split is also what keeps the section inside one screen. Stacking a
 * 330px panel under 450px of copy would have put the second Q&A below the fold
 * at 1440x900; running the claim column and the panel side by side leaves the
 * two promise cards visible with the heading, per §5's viewport-fit rule.
 * §3 P5 is untouched: the three guarantees and both Q&As are all still here,
 * and the panel adds a fourth statement of them rather than replacing any.
 */
const CHIPS = ["No identity profiles", "No facial recognition", "Edge processing"];

export default function PrivacySection() {
  const { vertical } = useVertical();
  const person = vertical === "gyms" ? "member" : "visitor";

  return (
    <section
      id="privacy"
      data-register="technical"
      className="section-band relative px-6"
    >
      {/* NO SEAM. #value above now declares the technical register too, so
          nothing changes across this boundary — the ground has been black since
          #how opened it and runs unbroken to the end of #stack. The seam that
          used to sit here was crossing back from a canvas #value that had itself
          crossed away from #how one screen earlier. */}
      <div className="relative mx-auto max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-14">
          <div>
            <Reveal grammar="focus">
              <h2 className="text-3xl font-semibold leading-tight md:text-4xl">
                Privacy by design
              </h2>
            </Reveal>
            <Reveal grammar="ghost" lag={0.14} className="mt-4 max-w-2xl">
              <p className="text-fg-secondary">
                Constantine is built so that personal data cannot exist in the
                system. The panel beside this shows the whole of what a camera
                turns into.
              </p>
            </Reveal>
            {/* The three guarantees are the section's whole claim, so they are
                counted off one at a time rather than presented as a set. Full
                width rows: in a half-width column a three-up grid puts one word
                per line. */}
            <div className="mt-8 space-y-3">
              {CHIPS.map((item, i) => (
                <Reveal
                  key={item}
                  grammar="settle"
                  lag={0.16 * i}
                  className="flex items-center gap-3 rounded-lg border border-line-card bg-surface-card px-4 py-3"
                >
                  <span className="text-accent-positive/80">✓</span>
                  <span className="text-sm text-fg-emphasis">{item}</span>
                </Reveal>
              ))}
            </div>
          </div>
          <Reveal grammar="settle" lag={0.1}>
            <PrivacyStage />
          </Reveal>
        </div>

        {/* The two answers, as Pocket's layered promise cards rather than as a
            run of prose down the page. */}
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <Reveal
            grammar="ghost"
            className="rounded-xl border border-line-card bg-surface-card p-6"
          >
            <h3 className="text-base font-semibold text-fg-emphasis">
              How does video processing work with Constantine?
            </h3>
            <p className="mt-2 text-sm text-fg-muted">
              All video is processed locally on edge devices inside the venue. The
              system converts live pixels into anonymous spatial signals (position,
              orientation, dwell time) in real time. The video stream is never
              transmitted, never archived, and never accessible to your staff or to
              Constantine.{" "}
              <span className="font-semibold text-fg-secondary">
                Once processed, the raw footage is immediately destroyed.
              </span>
            </p>
          </Reveal>
          <Reveal
            grammar="ghost"
            lag={0.12}
            className="rounded-xl border border-line-card bg-surface-card p-6"
          >
            <h3 className="text-base font-semibold text-fg-emphasis">
              What leaves the device?
            </h3>
            <p className="mt-2 text-sm text-fg-muted">
              Only aggregated, non-identifiable metrics. There is no biometric
              tracking, no {person} profiles, and no way to reverse-engineer
              identity from the output.{" "}
              <span className="font-semibold text-fg-secondary">
                Even Constantine cannot access individual {person}-level tracking
                data, because it does not exist.
              </span>
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
