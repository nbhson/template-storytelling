'use client';

import { Button } from '@/components/ui/Button';

/**
 * Technology
 * ----------
 * Story beat 3. The camera orbits to the opposite side, the model moves toward
 * the right of the stage, and the content appears on the left. As we arrive,
 * the core briefly opens to reveal its inner glow (a surprise moment driven by
 * the master timeline's `coreReveal`), and particles surge.
 *
 * Layout mirrors the spec:
 *   Title / Description / Button   ....   [ MODEL ]
 */
export function Technology() {
  return (
    <section
      id="technology"
      data-beat="technology"
      className="relative flex min-h-[110svh] items-center px-6"
      aria-label="Inside the core"
    >
      <div className="mx-auto grid w-full max-w-7xl items-center gap-16 lg:grid-cols-2">
        <div className="flex flex-col items-start lg:max-w-xl">
          <p
            data-tech-eyebrow
            className="mb-6 text-xs font-medium uppercase tracking-[0.5em] text-white/40"
          >
            Inside the Core
          </p>

          <h2
            data-tech-title
            className="text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-6xl"
          >
            Built like a
            <span className="block bg-gradient-to-r from-violet-300 to-indigo-300 bg-clip-text text-transparent">
              precision instrument.
            </span>
          </h2>

          <p
            data-tech-body
            className="mt-8 max-w-lg text-base leading-relaxed text-white/50 sm:text-lg"
          >
            Peek beneath the glass. A conductive metal frame routes signals, a
            hot reasoning core thinks in real time, and an ambient field holds
            the memory around every query. It opens — just for a moment — so you
            can see the intelligence inside.
          </p>

          <div data-tech-items className="mt-10 grid grid-cols-2 gap-6">
            {[
              { n: '01', title: 'Glass Shell' },
              { n: '02', title: 'Metal Frame' },
              { n: '03', title: 'Core Glow' },
              { n: '04', title: 'Field Aura' },
            ].map((item) => (
              <div key={item.n} data-tech-item className="border-l border-white/10 pl-4">
                <div className="mb-1 font-mono text-[11px] tracking-[0.3em] text-sky-300/70">
                  {item.n}
                </div>
                <div className="text-sm font-medium uppercase tracking-[0.2em] text-white/80">
                  {item.title}
                </div>
              </div>
            ))}
          </div>

          <div data-tech-cta className="mt-10">
            <Button variant="ghost" href="#deep-dive">
              Take it apart
            </Button>
          </div>
        </div>

        {/* Spacer column — the 3D model occupies this space on the right. */}
        <div aria-hidden className="hidden lg:block" />
      </div>
    </section>
  );
}