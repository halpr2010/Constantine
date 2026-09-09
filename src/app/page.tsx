import EntryView from "@/components/EntryView";
import HeroSection from "@/components/HeroSection";
import VerticalSwitcher from "@/components/VerticalSwitcher";
import VenueStage from "@/components/VenueStage";
import ProblemSection from "@/components/ProblemSection";
import HowItWorks from "@/components/HowItWorks";
import ValueSection from "@/components/ValueSection";
import PrivacySection from "@/components/PrivacySection";
import UseCases from "@/components/UseCases";
import StackSection from "@/components/StackSection";
import OutputsSection from "@/components/OutputsSection";
import FaqSection from "@/components/FaqSection";
import PilotForm from "@/components/PilotForm";
import ScrollProgress from "@/components/ScrollProgress";
import ScrollStage from "@/components/ScrollStage";
import Reveal from "@/components/Reveal";
import { GhostSprite } from "@/components/GhostFigure";
import { VerticalProvider } from "@/components/VerticalContext";
import Image from "next/image";

export default function Home() {
  return (
    // `relative` is load-bearing: the vertical switcher is positioned against
    // main while the entry question stands, so it scrolls with the entry view.
    <main className="relative min-h-screen bg-surface-page text-fg-primary">
      {/* The three ghost poses, serialised ONCE for the whole document. It
          lives here rather than inside Outputs because #privacy now uses the
          same figures and sits above it: a <use> whose referenced <defs> comes
          later in the document is resolved on the wrong side of first paint,
          and duplicating the sprite would duplicate its element ids. */}
      <GhostSprite />
      {/* The entry selector and every section that swaps copy read one shared
          vertical from this provider. Only those pieces are client components;
          this page stays server-rendered. */}
      <VerticalProvider>
        {/* One driver for every [data-reveal] below. Mounted inside the
            provider so it re-scans when the switcher rebuilds the page. */}
        <ScrollStage />

        {/* Header. NO bottom border: it held the root ground after selection, so
            over a section of opposite polarity it painted a solid band with a
            razor edge — luminance stepping 53 -> 114 -> 255 across 3px, and
            inverted in light-canvas. §5 requires ground changes with no visible
            dividing line, and a permanent rule across the page is the most
            visible one there is. ScrollProgress's filled portion is the only
            rule at the header's foot now. */}
        {/* `data-entry-chrome` hands the header to the entry view's register
            while the question stands, so it disappears into the light ground
            instead of laying a dark bar across it (globals.css, entry block).
            `data-entry-aside` marks everything the reference's entry screen
            does not show: nav, the pilot CTA, and the two dock slots. */}
        <header
          data-entry-chrome=""
          className="pointer-events-none fixed left-0 right-0 top-0 z-50 bg-surface-page/80 backdrop-blur-xl"
        >
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
            <nav
              data-entry-aside=""
              className="hidden items-center gap-8 text-sm text-fg-secondary md:flex"
            >
              <a className="transition-colors hover:text-fg-primary" href="#how">
                How it works
              </a>
              <a className="transition-colors hover:text-fg-primary" href="#privacy">
                Privacy
              </a>
              <a className="transition-colors hover:text-fg-primary" href="#use">
                Use cases
              </a>
            </nav>
            <div data-entry-aside="" className="flex items-center gap-5">
              {/* Where the vertical track lands after the drift (§4). Empty
                  until then: VerticalSwitcher sizes it at the moment of
                  selection, so the header carries no gap while the entry
                  question is still standing. The wide slot is the reference's
                  top-right corner; below lg the header gives it its own row,
                  because logo + pilot CTA + a 300px track do not share 720px. */}
              <div
                data-dock-slot="wide"
                aria-hidden
                className="hidden shrink-0 lg:block"
              />
              <a
                href="#pilot"
                className="rounded-lg bg-action px-4 py-2 text-sm font-semibold text-on-action transition-colors hover:bg-action-hover"
              >
                Request a pilot
              </a>
            </div>
          </div>
          <div data-entry-aside="" className="flex justify-end px-6 lg:hidden">
            <div data-dock-slot="narrow" aria-hidden />
          </div>
          {/* The §5 rule rides the header's own bottom hairline, so page
              position is read off the edge that is already there rather than
              off a second band of chrome. */}
          <ScrollProgress />
        </header>

        {/* The one control, and the question it answers. The track is a
            sibling of the entry view rather than a child: on selection the
            view unmounts and the track has to survive it. */}
        <VerticalSwitcher />

        <EntryView />

        <HeroSection />

        {/* §5 ambient background. It declares the product register, same as
            the hero above it, so the atmosphere opens with no register change
            and therefore no seam; #problem's existing product → canvas seam
            closes it again. */}
        <VenueStage />

        <ProblemSection />

        <HowItWorks />

        <ValueSection />

        <PrivacySection />

        {/* Fit follows trust. A buyer who has just been told the video never
            leaves the building asks next where the numbers go, so the stack
            diagram answers that before the commercial argument starts. It
            declares the technical register, same as #privacy above it, which
            is why neither carries a seam: nothing changes across that
            boundary and the two read as one continuous ground. */}
        <StackSection />

        <UseCases />

        {/* §1's commercial order is use cases -> outputs -> the ask, so the
            three-beat sits between the last argument and the CTA. */}
        <OutputsSection />

        {/* Last objections get answered on the page the buyer is already on,
            immediately above the one CTA that follows from them. Inherits the
            canvas register running unbroken to the footer, so it needs no seam. */}
        <FaqSection />

        {/* Pilot. Claims the canvas register EXPLICITLY, and so does the footer
            below it. Both used to inherit the root theme's ground while Use
            cases above them painted canvas, which put an undeclared register
            change — the one genuine hard edge left on the page — between the
            last section and the closing CTA. No seam is needed now because
            nothing changes: the canvas runs straight through to the bottom.
            The form itself is never wrapped in a reveal — a control that is
            dimmed while it holds focus is a trap. */}
        <section id="pilot" data-register="canvas" className="px-6 pb-24 pt-32">
          <div className="mx-auto max-w-xl">
            <Reveal grammar="focus">
              <h2 className="text-3xl font-semibold leading-tight md:text-4xl">
                Request a pilot
              </h2>
            </Reveal>
            <Reveal grammar="ghost" lag={0.14} className="mt-4">
              <p className="text-fg-secondary">
                We&apos;ll reply with a 15-minute pilot checklist.
              </p>
            </Reveal>
            <PilotForm />
          </div>
        </section>

        <footer data-register="canvas" className="px-6 pb-10 pt-16">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <div className="flex items-center gap-6 text-sm text-fg-muted">
              <a href="/" className="hover:text-fg-secondary">
                Constantine
              </a>
              <a href="#how" className="hover:text-fg-secondary">
                How it works
              </a>
              <a href="#privacy" className="hover:text-fg-secondary">
                Privacy
              </a>
            </div>
            <div className="text-xs text-fg-subtle">
              © {new Date().getFullYear()} Constantine
            </div>
          </div>
        </footer>
      </VerticalProvider>
    </main>
  );
}
