"use client";

import { useVertical } from "@/components/VerticalContext";

/**
 * One privacy section for every vertical. The claims, structure and wording are
 * identical across museums and gyms — only the noun (visitor / member) changes.
 */
const CHIPS = ["No identity profiles", "No facial recognition", "Edge processing"];

export default function PrivacySection() {
  const { vertical } = useVertical();
  const person = vertical === "gyms" ? "member" : "visitor";

  return (
    <section id="privacy" className="border-t border-zinc-800/50 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-semibold leading-tight md:text-4xl">
          Privacy by design
        </h2>
        <p className="mt-4 max-w-2xl text-zinc-400">
          Constantine is built so that personal data cannot exist in the system.
        </p>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CHIPS.map((item) => (
            <div
              key={item}
              className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/40 px-4 py-3"
            >
              <span className="text-emerald-500/80">✓</span>
              <span className="text-sm text-zinc-300">{item}</span>
            </div>
          ))}
        </div>
        <div className="mt-8 max-w-2xl">
          <h3 className="text-base font-semibold text-zinc-300">
            How does video processing work with Constantine?
          </h3>
          <p className="mt-2 text-sm text-zinc-500">
            All video is processed locally on edge devices inside the venue. The
            system converts live pixels into anonymous spatial signals (position,
            orientation, dwell time) in real time. The video stream is never
            transmitted, never archived, and never accessible to your staff or to
            Constantine.{" "}
            <span className="font-semibold text-zinc-400">
              Once processed, the raw footage is immediately destroyed.
            </span>
          </p>
        </div>
        <div className="mt-8 max-w-2xl">
          <h3 className="text-base font-semibold text-zinc-300">
            What leaves the device?
          </h3>
          <p className="mt-2 text-sm text-zinc-500">
            Only aggregated, non-identifiable metrics. There is no biometric
            tracking, no {person} profiles, and no way to reverse-engineer
            identity from the output.{" "}
            <span className="font-semibold text-zinc-400">
              Even Constantine cannot access individual {person}-level tracking
              data, because it does not exist.
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
