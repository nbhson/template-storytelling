/**
 * Footer
 * ------
 * Quiet end-of-page bar. No scroll animation — the story ends with the CTA.
 */
export function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/5 py-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 text-sm text-white/30 md:flex-row">
        <span className="font-semibold tracking-[0.3em]">
          MORPHIN<span className="text-indigo-300">.</span>
        </span>
        <span>© {new Date().getFullYear()} Morphin Labs — Crafted with intent.</span>
        <span className="font-mono text-[11px] text-white/20">
          60FPS · WebGL · GSAP
        </span>
      </div>
    </footer>
  );
}