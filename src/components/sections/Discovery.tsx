'use client';

import { Button } from '@/components/ui/Button';

/**
 * Discovery
 * ---------
 * Story beat 2. The camera dollies in and orbits ~15°, the model shifts toward
 * the left side of the stage, and the copy sweeps in from the right. Lighting
 * brightens — the first emotional lift of the journey.
 *
 * All animation is scrubbed by the master timeline via data-discovery-* hooks.
 * The content column is right-aligned so it mirrors the model on the left,
 * matching the spec's layout:
 *   [ MODEL ] ....  Title / Description / Button
 */
export function Discovery() {
  return (
    <section
      data-beat="discovery"
      className="relative flex min-h-[110svh] items-center px-6"
      aria-label="Discover the core"
    >
      <div className="mx-auto grid w-full max-w-7xl items-center gap-16 lg:grid-cols-2">
        {/* Spacer column — the 3D model occupies this space on the left. */}
        <div aria-hidden className="hidden lg:block" />

        <div className="flex flex-col items-start lg:ml-auto lg:max-w-xl">
          <p
            data-discovery-eyebrow
            className="mb-6 text-xs font-medium uppercase tracking-[0.5em] text-white/40"
          >
            Discover
          </p>

          <h2
            data-discovery-title
            className="text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-6xl"
          >
            One living
            <span className="block bg-gradient-to-r from-sky-300 to-indigo-300 bg-clip-text text-transparent">
              intelligence.
            </span>
          </h2>

          <p
            data-discovery-body
            className="mt-8 max-w-lg text-base leading-relaxed text-white/50 sm:text-lg"
          >
            Every document, metric and signal converges into a single queryable
            core. Morphin distills your scattered context into one continuous,
            breathing intelligence — close enough to touch.
          </p>

          <div data-discovery-cta className="mt-10 flex flex-wrap gap-4">
            <Button variant="primary" href="#technology">
              Look inside
            </Button>
            <Button variant="ghost" href="#deep-dive">
              See the seams
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}