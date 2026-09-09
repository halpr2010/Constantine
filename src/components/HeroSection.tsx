"use client";

import PaintingWall from "@/components/MonaLisaWall";
import EquipmentWall from "@/components/EquipmentWall";
import SectionSeam from "@/components/SectionSeam";
import { useVertical, type Vertical } from "@/components/VerticalContext";

// Cross-fade through black: the outgoing set fades out, the hero holds black
// for a beat, then the incoming set fades up.
const FADE_MS = 400;
const BLACK_HOLD_MS = 140;

export default function HeroSection() {
  // One source of truth, shared with every section below the hero. The hero
  // now only reads it; the entry view's track is what writes it (§4).
  const { vertical, answered } = useVertical();

  // Title, subtitle and chips are deliberately identical on both tabs: the hero
  // states what Constantine does for any physical space, and the demo below it
  // is what changes with the vertical.
  const headline = "AI-powered Behavioural Analytics for Physical Spaces";
  const subtitle =
    "Measure how people actually use your space: attention, engagement and movement, beyond the footfall you already count.";
  // One chip set across every vertical, per the copy spec.
  const chips = [
    "Anonymous by design",
    "Edge processing",
    "Works with existing CCTV cameras",
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
      data-register="product"
      // The view the entry question resolves into (§4). It no longer runs a
      // fade of its own: the entry ground is lifted off a hero that has been
      // sitting here, fully rendered, since the click, so the ground going IS
      // this view arriving. The attribute stays because the crossing seam below
      // is sized off it.
      data-entry-target=""
      className="relative flex min-h-screen w-full flex-col justify-center overflow-x-clip"
      // A wall's card is wider than its column by design (up to ~140px each
      // side). Clip generously so that overhang still shows exactly as it did
      // before the switcher existed, without leaving a horizontal scrollbar.
      style={{ overflowClipMargin: "150px" }}
    >
      {/* Only while the gate is up. The entry view paints the technical
          register's light ground (§4), so a visitor who scrolls past the
          question instead of answering it would otherwise meet exactly the hard
          register edge §5 forbids. Once the question is answered the entry view
          is out of flow and the hero is the first thing in the document — a seam
          there would wash the top of the hero with a ground that is no longer
          above it, so it is not rendered. `answered` flips as the tab lands, at
          which point the entry ground is still fully opaque overhead, so this
          unmounts unseen rather than popping mid-drift. */}
      {!answered && <SectionSeam from="technical" to="product" />}

      {/* pt clears the header. Below lg the docked vertical track gets its own
          header row (page.tsx), which takes the fixed header to 138px at 390w
          and would otherwise bury the eyebrow and the top of the H1. */}
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 px-6 py-16 pt-40 md:grid-cols-12 md:items-center lg:pt-24">
        {/* LEFT */}
        <div className="md:col-span-5 md:pr-2">
          <div className="text-sm font-semibold tracking-wide text-instrument-fg-weak">
            CONSTANTINE
          </div>

          <h1 className="mt-4 max-w-2xl text-balance text-4xl font-semibold leading-[1.08] tracking-tight md:text-5xl">
            {headline}
          </h1>

          <p className="mt-5 max-w-md text-base leading-relaxed text-fg-secondary">
            {subtitle}
          </p>

          <div className="mt-7 flex flex-col gap-4">
            <a
              href="#pilot"
              className="inline-flex w-fit min-w-[280px] items-center justify-center rounded-lg bg-action px-8 py-3.5 text-sm font-semibold text-on-action transition-colors hover:bg-action-hover"
            >
              Request a pilot
            </a>
            <div className="flex flex-wrap items-center gap-4">
              {chips.map((chip) => (
                <span
                  key={chip}
                  className="flex items-center gap-2 text-sm text-fg-secondary"
                >
                  <span className="text-accent-positive">✓</span>
                  {chip}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="md:col-span-7 md:pl-8">
          {/* The switcher that used to sit here is retired (§4): the entry
              view's track drifts into the header and stays there as the one
              control, so the hero is now nothing but its demos. */}

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
                    chartToken="chart-1"
                    compact
                    active={vertical === "museums"}
                  />
                </div>
                <div className="flex min-w-0 flex-1 justify-center md:ml-32 md:max-w-[320px]">
                  <PaintingWall
                    src="/Monet_Lillies.jpg"
                    alt="The Water Lily Pond"
                    title="The Water Lily Pond - Claude Monet"
                    chartToken="chart-2"
                    compact
                    minColorFloor={0.40}
                    active={vertical === "museums"}
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
                    chartToken="chart-1"
                    compact
                    active={vertical === "gyms"}
                  />
                </div>
                <div className="flex min-w-0 flex-1 justify-center md:ml-32 md:max-w-[320px]">
                  <EquipmentWall
                    kind="stair"
                    title="Stairmaster - Cardio"
                    chartToken="chart-2"
                    compact
                    active={vertical === "gyms"}
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
