'use client';

/**
 * Problem
 * -------
 * Story beat 2. The weight of the problem: dark, sparse, text fades in as the
 * camera slowly zooms and the core rotates 20°. Everything is scrubbed by the
 * master timeline via data-problem-* hooks — no local animation.
 */
export function Problem() {
  return (
    <section
      data-beat="problem"
      className="relative flex min-h-[120svh] items-center px-6"
      aria-label="The problem"
    >
      <div className="mx-auto w-full max-w-7xl">
        <div
          data-problem-eyebrow
          className="mb-8 text-xs font-medium uppercase tracking-[0.5em] text-white/30"
        >
          The Problem
        </div>

        <h2
          data-problem-title
          className="max-w-4xl text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-6xl"
        >
          Intelligence is scattered.
          <span className="block text-white/30">
            Decisions are islands.
          </span>
        </h2>

        <p
          data-problem-body
          className="mt-10 max-w-xl text-base leading-relaxed text-white/45 sm:text-lg"
        >
          Your pipeline lives in a dozen tools. Context fragments across
          documents, dashboards and meetings. By the time the signal reaches
          you, it has been flattened into noise.
        </p>

        <div
          data-problem-stat
          className="mt-16 grid max-w-2xl grid-cols-2 gap-8 sm:grid-cols-3"
        >
          {[
            { value: '70%', label: 'of context is lost before decisions are made' },
            { value: '12+', label: 'disconnected tools in the average stack' },
            { value: '40h', label: 'spent weekly hunting for answers' },
          ].map((stat) => (
            <div key={stat.value} className="border-l border-white/10 pl-4">
              <div className="text-3xl font-semibold text-white sm:text-4xl">
                {stat.value}
              </div>
              <div className="mt-2 text-[13px] leading-snug text-white/40">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}