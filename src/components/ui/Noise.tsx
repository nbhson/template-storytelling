'use client';

/**
 * Noise
 * -----
 * Fixed film-grain overlay that sits above the canvas but below the UI chrome.
 * It softens gradient banding and adds a tactile, premium film feel.
 * Created with an inline SVG feTurbulence data-URI — zero network cost.
 */
export function Noise() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-30 opacity-[0.07] mix-blend-overlay"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='128'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.7'/%3E%3C/svg%3E")`,
        backgroundSize: '128px 128px',
      }}
    />
  );
}