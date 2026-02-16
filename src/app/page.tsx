import HeroSection from "@/components/HeroSection";
import PaintingWall from "@/components/MonaLisaWall";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#050505] text-zinc-50">
      {/* Header */}
      <header className="pointer-events-none fixed left-0 right-0 top-0 z-50 border-b border-zinc-800/50 bg-[#050505]/80 backdrop-blur-xl">
        <div className="pointer-events-auto mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <a href="/" className="flex items-center gap-2">
            <Image
              src="/Constantine_logo.png"
              alt="Constantine"
              width={56}
              height={56}
              className="h-14 w-14 object-contain"
            />
            <span className="text-sm font-semibold tracking-wide">
              CONSTANTINE
            </span>
          </a>
          <nav className="hidden items-center gap-8 text-sm text-zinc-400 md:flex">
            <a
              className="transition-colors hover:text-zinc-50"
              href="#how"
            >
              How it works
            </a>
            <a
              className="transition-colors hover:text-zinc-50"
              href="#privacy"
            >
              Privacy
            </a>
            <a
              className="transition-colors hover:text-zinc-50"
              href="#use"
            >
              Use cases
            </a>
          </nav>
          <a
            href="#pilot"
            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-zinc-200"
          >
            Request a pilot
          </a>
        </div>
      </header>

      <HeroSection />

      {/* How it works */}
      <section
        id="how"
        className="border-t border-zinc-800/50 px-6 pt-12 pb-24"
      >
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-semibold leading-tight md:text-4xl">
            How it works
          </h2>
          <p className="mt-4 max-w-2xl text-zinc-400">
            From your existing cameras to artwork-level engagement insights —
            integrate, calibrate, measure, and understand visitor attention in
            real-world space.
          </p>

          <div className="mt-12 space-y-16">
            {/* 1. Integrate */}
            <div className="flex flex-col gap-6 rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 md:flex-row md:items-center md:gap-8 md:p-8">
              <div className="flex-1">
                <span className="text-sm font-medium text-white/60">1.</span>
                <h3 className="mt-1 text-xl font-semibold">Integrate</h3>
                <p className="mt-3 text-zinc-400">
                  Constantine works with your current CCTV or gallery camera setup.
                </p>
                <ul className="mt-4 space-y-2">
                  {[
                    "No new hardware is required in most cases.",
                    "No facial recognition is used.",
                    "No identity profiles are created.",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-zinc-400">
                      <span className="mt-0.5 shrink-0 text-emerald-500">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-sm text-zinc-500">
                  Each camera simply observes how visitors move and orient within
                  the room.
                </p>
              </div>
              <div className="shrink-0 md:w-96">
                <Image
                  src="/CCTV - Integrate2.png"
                  alt="CCTV camera in gallery corner — typical setup Constantine integrates with"
                  width={384}
                  height={384}
                  className="w-full rounded-lg object-contain"
                />
              </div>
            </div>

            {/* 2. Calibrate */}
            <div className="flex flex-col gap-6 rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 md:flex-row md:items-center md:gap-8 md:p-8">
              <div className="flex-1">
                <span className="text-sm font-medium text-white/60">2.</span>
                <h3 className="mt-1 text-xl font-semibold">Calibrate</h3>
                <p className="mt-3 text-zinc-400">
                  Every gallery is mapped to its real-world dimensions.
                </p>
                <p className="mt-2 text-sm text-zinc-500">
                  This allows Constantine to understand:
                </p>
                <ul className="mt-4 space-y-2">
                  {[
                    "Where artworks are located",
                    "Viewing distances",
                    "Movement patterns between works",
                    "Circulation flow between rooms",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-zinc-400">
                      <span className="mt-0.5 shrink-0 text-emerald-500">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-sm text-zinc-500">
                  The system measures in meters, not camera pixels.
                </p>
              </div>
              <div className="shrink-0 md:w-96">
                <Image
                  src="/Calibrate - CCTV.png"
                  alt="Gallery mapped to real-world dimensions — camera field of view calibration"
                  width={384}
                  height={384}
                  className="w-full rounded-lg object-contain"
                />
              </div>
            </div>

            {/* 3. Measure */}
            <div className="flex flex-col gap-6 rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 md:flex-row md:items-center md:gap-8 md:p-8">
              <div className="flex-1">
                <span className="text-sm font-medium text-white/60">3.</span>
                <h3 className="mt-1 text-xl font-semibold">Measure</h3>
                <p className="mt-3 text-zinc-400">
                  Each artwork is assigned an engagement zone, the space where
                  meaningful attention can occur.
                </p>
                <p className="mt-2 text-sm text-zinc-500">
                  When a visitor enters that zone and orients toward the work,
                  Constantine measures:
                </p>
                <ul className="mt-4 space-y-2">
                  {[
                    "How long attention is sustained",
                    "How frequently visitors return",
                    "How engagement shifts across the exhibition",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-zinc-400">
                      <span className="mt-0.5 shrink-0 text-emerald-500">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-sm text-zinc-500">
                  This is not footfall tracking. It is artwork-level attention
                  measurement.
                </p>
              </div>
              <div className="shrink-0 md:w-96">
                <Image
                  src="/Measure.png"
                  alt="Engagement zones — artwork-level attention measurement"
                  width={384}
                  height={384}
                  className="w-full rounded-lg object-contain"
                />
              </div>
            </div>

            {/* 4. Insight */}
            <div className="flex flex-col gap-6 rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 md:flex-row md:items-center md:gap-8 md:p-8">
              <div className="flex-1">
                <span className="text-sm font-medium text-white/60">4.</span>
                <h3 className="mt-1 text-xl font-semibold">Insight</h3>
                <p className="mt-3 text-zinc-400">
                  Curators and directors receive a real-time analytics and
                  AI-powered recommendations:
                </p>
                <ul className="mt-4 space-y-2">
                  {[
                    "Dwell time distributions per artwork",
                    "Engagement comparisons between rooms",
                    "Visitor flow through the exhibition",
                    "Attention drop-off points",
                    "Engagement patterns by hour/day/week",
                    "AI-powered curation and layout recommendations",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-zinc-400">
                      <span className="mt-0.5 shrink-0 text-emerald-500">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-sm text-zinc-500">
                  All outputs are aggregated and privacy-first.
                </p>
              </div>
              <div className="flex shrink-0 flex-row flex-nowrap items-start gap-4 md:gap-6">
                <div className="w-[280px] shrink-0 md:w-[300px]">
                  <div className="h-[440px] w-full">
                    <PaintingWall
                      src="/Pearls.jpg"
                      alt="Girl with a Pearl Earring"
                      title="Girl with a Pearl Earring - Vermeer"
                      chartColor="rgba(239,68,68,0.8)"
                      size="mini"
                      fixedAttentionTime={12.4}
                      rankingInExhibition={1}
                      rankingChange={3}
                      static
                      staticChartValues={[0.38, 0.55, 0.62, 0.48, 0.42, 0.28, 0.35, 0.58, 0.71, 0.78, 0.88, 0.98]}
                    />
                  </div>
                </div>
                <div className="w-[280px] shrink-0 md:w-[300px]">
                  <div className="h-[440px] w-full">
                    <PaintingWall
                      src="/Rothkos.jpg"
                      alt="Rothko"
                      title="Rothko - Mark Rothko"
                      chartColor="rgba(59,130,246,0.8)"
                      size="mini"
                      minColorFloor={0.40}
                      fixedAttentionTime={9.8}
                      rankingInExhibition={6}
                      rankingChange={-1}
                      static
                      staticChartValues={[0.52, 0.68, 0.55, 0.44, 0.58, 0.36, 0.74, 0.52, 0.68, 0.85, 0.78, 0.68]}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy by design */}
      <section
        id="privacy"
        className="border-t border-zinc-800/50 px-6 py-24"
      >
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-semibold leading-tight md:text-4xl">
            Privacy by design
          </h2>
          <p className="mt-4 max-w-2xl text-zinc-400">
            Constantine is built so that personal data cannot exist in the
            system.
          </p>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              "No identity profiles",
              "No facial recognition",
              "Edge processing",
            ].map((item) => (
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
              transmitted, never archived, and never accessible to staff, curators,
              or Constantine.{" "}
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
              tracking, no visitor profiles, and no way to reverse-engineer
              identity from the output.{" "}
              <span className="font-semibold text-zinc-400">
                Even Constantine cannot access visitor-level data - because it
                does not exist.
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section
        id="use"
        className="border-t border-zinc-800/50 px-6 py-24"
      >
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-semibold leading-tight md:text-4xl">
            Use cases
          </h2>
          <p className="mt-4 max-w-2xl text-zinc-400">
            From permanent collections to temporary exhibitions and cultural
            venues.
          </p>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              {
                title: "Museums & Galleries",
                desc: "Curation insights, layout optimization, donor reporting.",
              },
              {
                title: "Temporary Exhibitions",
                desc: "Compare rooms, interpretive text performance, A/B layouts.",
              },
              {
                title: "Cultural Venues",
                desc: "Events, installations, audience flow and crowding.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6"
              >
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-zinc-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pilot */}
      <section
        id="pilot"
        className="border-t border-zinc-800/50 px-6 py-24"
      >
        <div className="mx-auto max-w-xl">
          <h2 className="text-3xl font-semibold leading-tight md:text-4xl">
            Request a pilot
          </h2>
          <p className="mt-4 text-zinc-400">
            We&apos;ll reply with a 15-minute pilot checklist — camera placement,
            calibration, zone authoring.
          </p>
          <form className="mt-8 space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm text-zinc-500"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@museum.org"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-50 placeholder:text-zinc-500 focus:border-zinc-600 focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="venue"
                className="mb-2 block text-sm text-zinc-500"
              >
                Venue name
              </label>
              <input
                id="venue"
                type="text"
                placeholder="e.g. City Art Museum"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-50 placeholder:text-zinc-500 focus:border-zinc-600 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-white px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-zinc-200"
            >
              Request pilot
            </button>
          </form>
        </div>
      </section>

      <footer className="border-t border-zinc-800/50 px-6 py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-6 text-sm text-zinc-500">
            <a href="/" className="hover:text-zinc-400">
              Constantine
            </a>
            <a href="#how" className="hover:text-zinc-400">
              How it works
            </a>
            <a href="#privacy" className="hover:text-zinc-400">
              Privacy
            </a>
          </div>
          <div className="text-xs text-zinc-600">
            © {new Date().getFullYear()} Constantine
          </div>
        </div>
      </footer>
    </main>
  );
}
