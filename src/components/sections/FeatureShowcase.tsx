'use client';

import { GlassCard } from '@/components/ui/GlassCard';

/**
 * FeatureShowcase
 * ---------------
 * Story beat 5. The exploded parts reassemble, the model spins ~90°, and the
 * camera eases back. Feature cards cascade in sequentially — each card
 * illuminates its matching component of the model (0..3) via the master
 * timeline's `highlight` field.
 *
 * The cards use data-feature-card-index so the 3D scene can count them, and
 * each card carries a matching accent color for the highlighted glow.
 */
const FEATURES = [
  {
    n: '◉',
    title: 'One living context',
    body: 'Every document, metric and signal converges into a single queryable core.',
    color: 'text-sky-200 border-sky-400/30 bg-sky-400/10',
  },
  {
    n: '⟁',
    title: 'Adaptive memory',
    body: 'The core remembers what matters, forgets what doesn’t and evolves with you.',
    color: 'text-violet-200 border-violet-400/30 bg-violet-400/10',
  },
  {
    n: '⌁',
    title: 'Decision streaming',
    body: 'Answers arrive before you ask — piped straight into your workflow.',
    color: 'text-cyan-200 border-cyan-400/30 bg-cyan-400/10',
  },
  {
    n: '⬡',
    title: 'Native synthesis',
    body: 'Fragments become narratives. Meetings become minutes. Noise becomes signal.',
    color: 'text-amber-200 border-amber-400/30 bg-amber-400/10',
  },
];

export function FeatureShowcase() {
  return (
    <section
      data-beat="feature-showcase"
      className="relative flex min-h-[120svh] items-center px-6"
      aria-label="Feature showcase"
    >
      <div className="mx-auto w-full max-w-7xl">
        <div data-feature-heading className="mb-16 max-w-3xl">
          <div className="mb-6 text-xs font-medium uppercase tracking-[0.5em] text-white/30">
            What it does
          </div>
          <h2 className="text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-6xl">
            Every part,
            <span className="block bg-gradient-to-r from-sky-300 to-violet-300 bg-clip-text text-transparent">
              has a purpose.
            </span>
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, i) => (
            <GlassCard
              key={feature.title}
              data-feature-card={i}
              data-feature-card-index={i}
              className="min-h-[220px]"
            >
              <div
                className={`mb-6 flex h-10 w-10 items-center justify-center rounded-xl border text-lg ${feature.color}`}
              >
                {feature.n}
              </div>
              <h3 className="text-lg font-medium text-white">{feature.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/45">
                {feature.body}
              </p>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}