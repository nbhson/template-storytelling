import { Button } from '@/components/ui/Button';

/**
 * CTA
 * ---
 * Story beat 5. The camera pulls back, the core settles into alignment and
 * everything converges on a single luminous request. Fades in last via the
 * master timeline (data-cta-* hooks).
 */
export function CTA() {
  return (
    <section
      data-beat="cta"
      className="relative flex min-h-[110svh] flex-col items-center justify-center px-6 text-center"
      aria-label="Call to action"
    >
      <div data-cta-inner className="mx-auto max-w-3xl">
        <p
          data-cta-eyebrow
          className="mb-6 text-xs font-medium uppercase tracking-[0.5em] text-white/40"
        >
          The Future is One Core
        </p>

        <h2
          data-cta-title
          className="text-5xl font-semibold leading-[0.95] tracking-tight text-white sm:text-7xl"
        >
          Enter the
          <span className="block bg-gradient-to-r from-indigo-300 via-sky-200 to-violet-300 bg-clip-text text-transparent">
            intelligence.
          </span>
        </h2>

        <p
          data-cta-sub
          className="mx-auto mt-8 max-w-xl text-base leading-relaxed text-white/50 sm:text-lg"
        >
          Stop managing tools. Start thinking in three dimensions. Morphin is
          available to a small number of teams today.
        </p>

        <div data-cta-actions className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Button variant="primary" href="#">
            Request early access
          </Button>
          <Button variant="ghost" href="#deep-dive">
            Watch the core
          </Button>
        </div>

        <p data-cta-note className="mt-8 font-mono text-[11px] text-white/25">
          No credit card · Private beta · SOC 2 ready
        </p>
      </div>
    </section>
  );
}