'use client';

/**
 * DeepDive
 * --------
 * Story beat 4. The camera zooms close and begins circling while the object
 * separates into floating parts. Holographic rings and glowing connection
 * lines appear in the 3D scene; here, floating labels fade in and point toward
 * each exposed component.
 *
 * The labels are positioned toward the edges of each part's resting location
 * (the parts spread out in AiCore), and are scrubbed in by the master timeline
 * via data-deep-label hooks.
 */
const LABELS = [
  { n: '01', title: 'Glass Shell', body: 'Reads, refracts & protects the context layer.' },
  { n: '02', title: 'Metal Frame', body: 'Conductive lattice routing signals between layers.' },
  { n: '03', title: 'Core Glow', body: 'The live reasoning engine — pure, hot, instant.' },
  { n: '04', title: 'Field Aura', body: 'Ambient memory surrounding every query.' },
];

export function DeepDive() {
  return (
    <section
      id="deep-dive"
      data-beat="deep-dive"
      className="relative flex min-h-[130svh] items-center px-6"
      aria-label="Exploded view of the core"
    >
      <div className="mx-auto w-full max-w-7xl">
        <div data-deep-heading className="mb-16 max-w-3xl">
          <div className="mb-6 text-xs font-medium uppercase tracking-[0.5em] text-white/30">
            Deep Dive
          </div>
          <h2 className="text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-6xl">
            Every part,
            <span className="block bg-gradient-to-r from-indigo-300 to-sky-300 bg-clip-text text-transparent">
              on its own.
            </span>
          </h2>
        </div>

        <div className="grid gap-y-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {LABELS.map((label, i) => (
            <div
              key={label.n}
              data-deep-label={i}
              className="group border-t border-white/10 pt-6 transition-colors duration-500"
            >
              <div className="mb-3 flex items-center gap-3">
                <span className="font-mono text-[11px] tracking-[0.3em] text-sky-300/70">
                  {label.n}
                </span>
                <span className="h-px flex-1 bg-gradient-to-r from-sky-400/40 to-transparent" />
              </div>
              <h3 className="text-sm font-medium uppercase tracking-[0.2em] text-white/80">
                {label.title}
              </h3>
              <p className="mt-3 max-w-[220px] text-sm leading-relaxed text-white/40">
                {label.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}