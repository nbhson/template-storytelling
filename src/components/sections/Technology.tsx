'use client';

/**
 * Technology
 * ----------
 * Story beat 4. The model explodes apart; each component is called out with a
 * numbered label and one-line description. The explosion itself is driven by
 * the master timeline (coreTargets.explode); this section only presents the
 * commentary that fades in alongside it.
 */
const COMPONENTS = [
  { n: '01', title: 'Glass Shell', body: 'Iridescent envelope — reads, refracts and protects context.' },
  { n: '02', title: 'Metal Frame', body: 'Conductive lattice that routes signals between layers.' },
  { n: '03', title: 'Core Glow', body: 'The live reasoning engine — pure, hot, and instant.' },
  { n: '04', title: 'Field Aura', body: 'Ambient memory that surrounds every query.' },
];

export function Technology() {
  return (
    <section
      data-beat="technology"
      className="relative flex min-h-[140svh] items-center px-6"
      aria-label="Technology"
    >
      <div className="mx-auto w-full max-w-7xl">
        <div data-tech-heading className="mb-16 max-w-3xl">
          <div className="mb-6 text-xs font-medium uppercase tracking-[0.5em] text-white/30">
            Inside the Core
          </div>
          <h2 className="text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-6xl">
            Built like a
            <span className="block bg-gradient-to-r from-violet-300 to-indigo-300 bg-clip-text text-transparent">
              precision instrument.
            </span>
          </h2>
        </div>

        <div className="grid gap-y-14 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {COMPONENTS.map((c, i) => (
            <div key={c.n} data-tech-item={i} className="border-t border-white/10 pt-6">
              <div className="mb-3 font-mono text-[11px] tracking-[0.3em] text-sky-300/70">
                {c.n}
              </div>
              <h3 className="text-sm font-medium uppercase tracking-[0.2em] text-white/80">
                {c.title}
              </h3>
              <p className="mt-3 max-w-[220px] text-sm leading-relaxed text-white/40">
                {c.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}