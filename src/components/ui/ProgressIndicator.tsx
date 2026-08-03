'use client';

/**
 * ProgressIndicator
 * -----------------
 * Thin scroll-progress bar + percentage readout. Purely visual; the master
 * timeline writes into the data-progress-* elements via its `onUpdate` hook,
 * so it can never drift from the 3D story.
 */
export function ProgressIndicator() {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-40 flex items-center justify-center px-6">
      <div className="flex w-full max-w-md items-center gap-4">
        <span
          className="w-12 text-right font-mono text-[11px] tabular-nums text-white/40"
          data-progress-label
        >
          000%
        </span>
        <div
          className="relative h-px flex-1 overflow-hidden rounded-full bg-white/10"
          role="progressbar"
          aria-label="Scroll progress"
        >
          <div
            data-progress-bar
            className="absolute inset-y-0 left-0 w-full origin-left scale-x-0 rounded-full bg-gradient-to-r from-indigo-400 via-sky-300 to-white"
          />
        </div>
        <span className="font-mono text-[11px] text-white/25">MORPHIN</span>
      </div>
    </div>
  );
}