"use client";

import PaintingWall from "@/components/MonaLisaWall";

export default function HeroSection() {
  return (
    <section className="relative flex min-h-screen w-full flex-col justify-center">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 px-6 py-16 pt-24 md:grid-cols-12 md:items-center">
        {/* LEFT */}
        <div className="md:col-span-5">
          <div className="text-sm font-semibold tracking-wide text-white/70">
            CONSTANTINE
          </div>

          <h1 className="mt-4 text-balance text-4xl font-semibold leading-[1.08] tracking-tight md:text-5xl">
            AI-powered Engagement Analytics for Art Galleries
          </h1>

          <p className="mt-5 max-w-md text-base leading-relaxed text-zinc-400">
            Measure how long visitors truly engage with each artwork, not just
            where they walk.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-4">
            <a
              href="#pilot"
              className="rounded-lg bg-white px-5 py-3 text-sm font-semibold text-black transition-colors hover:bg-zinc-200"
            >
              Request a pilot
            </a>
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-2 text-sm text-zinc-400">
                <span className="text-emerald-500">✓</span>
                Privacy-first
              </span>
              <span className="flex items-center gap-2 text-sm text-zinc-400">
                <span className="text-emerald-500">✓</span>
                Real-World calibration
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="md:col-span-7">
          <div className="flex min-h-[480px] w-full flex-col gap-12 overflow-visible md:min-h-[420px] md:flex-row md:gap-24 md:justify-center md:items-center">
            <div className="flex min-w-0 flex-1 justify-center md:max-w-[400px]">
              <PaintingWall
                src="/Mona_Lisa.jpg"
                alt="Mona Lisa"
                title="Mona Lisa"
                chartColor="rgba(239,68,68,0.8)"
                compact
              />
            </div>
            <div className="flex min-w-0 flex-1 justify-center md:max-w-[400px]">
              <PaintingWall
                src="/Monet_Lillies.jpg"
                alt="Water Lilies and Japanese Bridge"
                title="Water Lilies"
                chartColor="rgba(59,130,246,0.8)"
                compact
                minColorFloor={0.40}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
