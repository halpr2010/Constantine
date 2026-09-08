import HeroSection from "@/components/HeroSection";
import ProblemSection from "@/components/ProblemSection";
import HowItWorks from "@/components/HowItWorks";
import ValueSection from "@/components/ValueSection";
import PrivacySection from "@/components/PrivacySection";
import UseCases from "@/components/UseCases";
import PilotForm from "@/components/PilotForm";
import ScrollProgress from "@/components/ScrollProgress";
import ScrollStage from "@/components/ScrollStage";
import Reveal from "@/components/Reveal";
import { VerticalProvider } from "@/components/VerticalContext";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-surface-page text-fg-primary">
      {/* The hero's switcher and every section that swaps copy read one shared
          vertical from this provider. Only those pieces are client components;
          this page stays server-rendered. */}
      <VerticalProvider>
        {/* One driver for every [data-reveal] below. Mounted inside the
            provider so it re-scans when the switcher rebuilds the page. */}
        <ScrollStage />

        {/* Header */}
        <header className="pointer-events-none fixed left-0 right-0 top-0 z-50 border-b border-line-hairline bg-surface-page/80 backdrop-blur-xl">
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
            <nav className="hidden items-center gap-8 text-sm text-fg-secondary md:flex">
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
            <a
              href="#pilot"
              className="rounded-lg bg-action px-4 py-2 text-sm font-semibold text-on-action transition-colors hover:bg-action-hover"
            >
              Request a pilot
            </a>
          </div>
          {/* The §5 rule rides the header's own bottom hairline, so page
              position is read off the edge that is already there rather than
              off a second band of chrome. */}
          <ScrollProgress />
        </header>

        <HeroSection />

        <ProblemSection />

        <HowItWorks />

        <ValueSection />

        <PrivacySection />

        <UseCases />

        {/* Pilot. No rule above it: the canvas register runs straight through
            from Use cases, so a border here would be the one remaining hard
            edge on the page. The form itself is never wrapped in a reveal —
            a control that is dimmed while it holds focus is a trap. */}
        <section id="pilot" className="px-6 pb-24 pt-32">
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

        <footer className="border-t border-line-hairline px-6 py-8">
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
