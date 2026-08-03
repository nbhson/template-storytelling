'use client';

import { GlassCard } from '@/components/ui/GlassCard';

/**
 * Solution
 * --------
 * Story beat 3. The camera arcs to a new angle, particles multiply and the
 * feature cards cascade in — each stamped with data-solution-card-N so the
 * master timeline can stagger them.
 */
const FEATURES = [
  {
    icon: '◉',
    title: 'One living context',
    body: 'Every document, metric and signal converges into a single queryable core.',
  },
  {
    icon: '⟁',
    title: 'Adaptive memory',
    body: 'The core remembers what matters, forgets what doesn’t and evolves with you.',
  },
  {
    icon: '⌁',
    title: 'Decision streaming',
    body: 'Answers arrive before you ask — piped straight into your workflow.',
  },
  {
    icon: '⬡',
    title: 'Native synthesis',
    body: 'Fragments become narratives. Meetings become minutes. Noise becomes signal.',
  },
];

export function Solution() {
  return (
    <section
      data-beat="solution"
      className="relative flex min-h-[140svh] items-center px-6"
      aria-label="The solution"
    >
      <div className="mx-auto w-full max-w-7xl">
        <div data-solution-heading className="mb-16 max-w-3xl">
          <div className="mb-6 text-xs font-medium uppercase tracking-[0.5em] text-white/30">
            The Solution
          </div>
          <h2 className="text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-6xl">
            One core.
            <span className="block bg-gradient-to-r from-sky-300 to-violet-300 bg-clip-text text-transparent">
              Every answer.
            </span>
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, i) => (
            <GlassCard
              key={feature.title}
              data-solution-card={i}
              className="min-h-[220px]"
            >
              <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lg text-sky-200">
                {feature.icon}
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