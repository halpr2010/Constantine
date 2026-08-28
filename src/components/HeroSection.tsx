"use client";

import PaintingWall from "@/components/MonaLisaWall";
import EquipmentWall from "@/components/EquipmentWall";
import { useVertical, type Vertical } from "@/components/VerticalContext";

// Cross-fade through black: the outgoing set fades out, the hero holds black
// for a beat, then the incoming set fades up.
const FADE_MS = 400;
const BLACK_HOLD_MS = 140;

export default function HeroSection() {
  // One source of truth, shared with every section below the hero.
  const { vertical, setVertical } = useVertical();

  // Title, subtitle and chips are deliberately identical on both tabs: the hero
  // states what Constantine does for any physical space, and the demo below it
  // is what changes with the vertical.
  const headline = "AI-powered Behavioural Analytics for Physical Spaces";
  const subtitle =
    "Measure how people actually use physical space: attention, movement and flow, not just footfall.";
  // One chip set across every vertical, per the copy spec.
  const chips = [
    "Edge-processed",
    "Anonymous by design",
    "Works with existing cameras",
  ];

  // Both panels share one grid cell, so they sit in exactly the same place and
  // the hero keeps its natural height. The incoming set waits for the outgoing
  // one to reach full black before it begins fading up, so the two are never
  // both on screen at once. Everything inside a panel — painting or equipment,
  // plaque and metrics alike — fades together, because the panel is what fades.
  // `visibility` is in the transition list on purpose: CSS holds a panel
  // visible for the whole fade and only flips it hidden at the very end.
  const panelStyle = (mine: Vertical) => ({
    opacity: vertical === mine ? 1 : 0,
    visibility: (vertical === mine ? "visible" : "hidden") as "visible" | "hidden",
    transitionDelay: `${vertical === mine ? FADE_MS + BLACK_HOLD_MS : 0}ms`,
  });

  return (
    <section
      className="relative flex min-h-screen w-full flex-col justify-center overflow-x-clip"
      // A wall's card is wider than its column by design (up to ~140px each
      // side). Clip generously so that overhang still shows exactly as it did
      // before the switcher existed, without leaving a horizontal scrollbar.
      style={{ overflowClipMargin: "150px" }}
    >
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 px-6 py-16 pt-24 md:grid-cols-12 md:items-center">
        {/* LEFT */}
        <div className="md:col-span-5 md:pr-2">
          <div className="text-sm font-semibold tracking-wide text-white/70">
            CONSTANTINE
          </div>

          <h1 className="mt-4 max-w-2xl text-balance text-4xl font-semibold leading-[1.08] tracking-tight md:text-5xl">
            {headline}
          </h1>

          <p className="mt-5 max-w-md text-base leading-relaxed text-zinc-400">
            {subtitle}
          </p>

          <div className="mt-7 flex flex-col gap-4">
            <a
              href="#pilot"
              className="inline-flex w-fit min-w-[280px] items-center justify-center rounded-lg bg-white px-8 py-3.5 text-sm font-semibold text-black transition-colors hover:bg-zinc-200"
            >
              Request a pilot
            </a>
            <div className="flex flex-wrap items-center gap-4">
              {chips.map((chip) => (
                <span
                  key={chip}
                  className="flex items-center gap-2 text-sm text-zinc-400"
                >
                  <span className="text-emerald-500">✓</span>
                  {chip}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="md:col-span-7 md:pl-8">
          {/* Slide control */}
          <div className="mb-8 flex justify-center">
            <div className="relative grid grid-cols-2 rounded-full border border-zinc-800 bg-zinc-900/60 p-1 text-sm font-semibold">
              <span
                aria-hidden
                className="pointer-events-none absolute bottom-1 left-1 top-1 w-[calc(50%-0.25rem)] rounded-full bg-white transition-transform duration-500 ease-in-out"
                style={{
                  transform:
                    vertical === "gyms" ? "translateX(100%)" : "translateX(0)",
                }}
              />
              {(
                [
                  ["museums", "Museums & Galleries"],
                  ["gyms", "Gyms"],
                ] as [Vertical, string][]
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setVertical(id)}
                  aria-pressed={vertical === id}
                  className={`relative z-10 rounded-full px-5 py-2 transition-colors ${
                    vertical === id ? "text-black" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Both panels occupy the same grid cell and cross-fade through black. */}
          <div className="grid">
            {/* Museums & Galleries */}
            <div
              className={`col-start-1 row-start-1 ease-in-out ${
                vertical === "museums" ? "" : "pointer-events-none"
              }`}
              style={{
                ...panelStyle("museums"),
                transitionProperty: "opacity, visibility",
                transitionDuration: `${FADE_MS}ms`,
              }}
              aria-hidden={vertical !== "museums"}
            >
              <div className="flex min-h-[480px] w-full flex-col gap-12 overflow-visible md:min-h-[420px] md:flex-row md:gap-12 md:justify-center md:items-center">
                <div className="flex min-w-0 flex-1 justify-center md:max-w-[320px]">
                  <PaintingWall
                    src="/Mona_Lisa.jpg"
                    alt="Mona Lisa"
                    title="Mona Lisa - Leonardo da Vinci"
                    chartColor="rgba(239,68,68,0.8)"
                    compact
                  />
                </div>
                <div className="flex min-w-0 flex-1 justify-center md:ml-32 md:max-w-[320px]">
                  <PaintingWall
                    src="/Monet_Lillies.jpg"
                    alt="The Water Lily Pond"
                    title="The Water Lily Pond - Claude Monet"
                    chartColor="rgba(59,130,246,0.8)"
                    compact
                    minColorFloor={0.40}
                  />
                </div>
              </div>
            </div>

            {/* Gyms */}
            <div
              className={`col-start-1 row-start-1 ease-in-out ${
                vertical === "gyms" ? "" : "pointer-events-none"
              }`}
              style={{
                ...panelStyle("gyms"),
                transitionProperty: "opacity, visibility",
                transitionDuration: `${FADE_MS}ms`,
              }}
              aria-hidden={vertical !== "gyms"}
            >
              <div className="flex min-h-[480px] w-full flex-col gap-12 overflow-visible md:min-h-[420px] md:flex-row md:gap-12 md:justify-center md:items-center">
                <div className="flex min-w-0 flex-1 justify-center md:max-w-[320px]">
                  <EquipmentWall
                    kind="bench"
                    title="Bench Press - Strength"
                    chartColor="rgba(239,68,68,0.8)"
                    compact
                  />
                </div>
                <div className="flex min-w-0 flex-1 justify-center md:ml-32 md:max-w-[320px]">
                  <EquipmentWall
                    kind="stair"
                    title="Stairmaster - Cardio"
                    chartColor="rgba(59,130,246,0.8)"
                    compact
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
