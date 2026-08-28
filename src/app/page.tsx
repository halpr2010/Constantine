import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import PrivacySection from "@/components/PrivacySection";
import UseCases from "@/components/UseCases";
import PilotForm from "@/components/PilotForm";
import { VerticalProvider } from "@/components/VerticalContext";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#050505] text-zinc-50">
      {/* The hero's switcher and every section that swaps copy read one shared
          vertical from this provider. Only those pieces are client components;
          this page stays server-rendered. */}
      <VerticalProvider>
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
              <a className="transition-colors hover:text-zinc-50" href="#how">
                How it works
              </a>
              <a className="transition-colors hover:text-zinc-50" href="#privacy">
                Privacy
              </a>
              <a className="transition-colors hover:text-zinc-50" href="#use">
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

        <HowItWorks />

        <PrivacySection />

        <UseCases />

        {/* Pilot */}
        <section id="pilot" className="border-t border-zinc-800/50 px-6 py-24">
          <div className="mx-auto max-w-xl">
            <h2 className="text-3xl font-semibold leading-tight md:text-4xl">
              Request a pilot
            </h2>
            <p className="mt-4 text-zinc-400">
              We&apos;ll reply with a 15-minute pilot checklist.
            </p>
            <PilotForm />
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
      </VerticalProvider>
    </main>
  );
}
