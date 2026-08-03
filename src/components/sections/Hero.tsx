import { Button } from '@/components/ui/Button';

/**
 * Hero
 * ----
 * Story beat 1. Giant typography over the centered 3D core.
 * All reveal animation lives in the master timeline — this markup only exposes
 * the hook points (data-hero-*) for GSAP to scrub.
 */
export function Hero() {
  return (
    <section
      data-beat="hero"
      className="relative flex min-h-[100svh] flex-col items-center justify-center px-6 text-center"
      aria-label="Introduction"
    >
      <p
        data-hero-eyebrow
        className="mb-6 text-xs font-medium uppercase tracking-[0.5em] text-white/40"
      >
        The Intelligence Layer
      </p>

      <h1
        data-hero-title
        className="max-w-5xl text-5xl font-semibold leading-[0.95] tracking-tight text-white sm:text-7xl lg:text-8xl"
      >
        Thinking in
        <span className="block bg-gradient-to-r from-indigo-300 via-sky-200 to-violet-300 bg-clip-text text-transparent">
          Three Dimensions
        </span>
      </h1>

      <p
        data-hero-sub
        className="mt-8 max-w-xl text-base leading-relaxed text-white/50 sm:text-lg"
      >
        Morphin distills your data into a living core — a single, continuous
        intelligence that sees, learns and adapts with every scroll.
      </p>

      <div data-hero-cta className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <Button variant="primary" href="#problem">
          Enter the core
        </Button>
        <Button variant="ghost" href="#technology">
          See it explode
        </Button>
      </div>

      <div
        data-hero-scroll
        className="pointer-events-none absolute bottom-20 flex flex-col items-center gap-3"
        aria-hidden
      >
        <span className="text-[10px] uppercase tracking-[0.4em] text-white/30">
          Scroll
        </span>
        <span className="h-10 w-px animate-pulse bg-gradient-to-b from-white/50 to-transparent" />
      </div>
    </section>
  );
}