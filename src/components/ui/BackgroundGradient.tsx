'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { getScrollSnapshot } from '@/lib/scroll-state';

/**
 * BackgroundGradient
 * ------------------
 * The ambient DOM backdrop behind the 3D canvas. A fixed, layered radial
 * gradient set that the master timeline shifts through the story beats:
 *
 *  - Hero:       deep indigo + faint cyan
 *  - Problem:    cooler, darker (the "weight" of the problem)
 *  - Solution:   warm violet lifts in (hope)
 *  - Technology: electric blue accents (precision)
 *  - CTA:        everything converges on a calm, luminous center
 *
 * It is scrubbed via the GSAP global ticker (no React state) so it follows
 * the exact same progress value as the camera, particles and shaders.
 */
const STOPS: [number, number, number, number, number, number][] = [
  // [r1, g1, b1, r2, g2, b2] — top & bottom colors per beat
  [7, 8, 18, 11, 16, 38],
  [5, 6, 13, 10, 15, 34],
  [8, 11, 28, 20, 15, 46],
  [10, 13, 36, 11, 26, 48],
  [7, 8, 18, 13, 16, 41],
];

function colorAt(t: number): string {
  const scaled = t * (STOPS.length - 1);
  const index = Math.min(Math.floor(scaled), STOPS.length - 2);
  const localT = scaled - index;
  const from = STOPS[index];
  const to = STOPS[index + 1];
  const mix = (a: number, b: number) => Math.round(a + (b - a) * localT);
  const c1 = [mix(from[0], to[0]), mix(from[1], to[1]), mix(from[2], to[2])];
  const c2 = [mix(from[3], to[3]), mix(from[4], to[4]), mix(from[5], to[5])];
  return `linear-gradient(180deg, rgb(${c1.join(',')}) 0%, rgb(${c2.join(',')}) 100%)`;
}

export function BackgroundGradient() {
  const bgRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const update = () => {
      if (!bgRef.current) return;
      const { progress } = getScrollSnapshot();
      bgRef.current.style.background = [
        `radial-gradient(120% 90% at 50% 0%, rgba(91,108,255,${(
          0.16 - progress * 0.05
        ).toFixed(3)}) 0%, transparent 55%)`,
        `radial-gradient(90% 80% at 80% 100%, rgba(56,189,248,${(
          0.1 + progress * 0.06
        ).toFixed(3)}) 0%, transparent 50%)`,
        `radial-gradient(80% 80% at 20% 40%, rgba(167,139,250,${(
          0.08 + progress * 0.04
        ).toFixed(3)}) 0%, transparent 55%)`,
        colorAt(progress),
      ].join(', ');
    };

    gsap.ticker.add(update);
    return () => {
      gsap.ticker.remove(update);
    };
  }, []);

  return (
    <div
      ref={bgRef}
      aria-hidden
      className="fixed inset-0 -z-10 bg-[#070812]"
      style={{ willChange: 'background' }}
    />
  );
}