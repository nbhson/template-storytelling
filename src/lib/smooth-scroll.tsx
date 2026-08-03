'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '@/lib/gsap';

/**
 * Lenis smooth scroll, fused to GSAP ScrollTrigger.
 *
 * Strategy:
 * - Lenis drives the NATIVE scroll position (the page must scroll normally —
 *   visible overflow is the entire point of a scroll-driven site).
 * - ScrollTrigger is synced on every Lenis scroll event.
 * - A single `requestAnimationFrame` (GSAP ticker) keeps both on one clock.
 * - A tiny global event bus publishes raw progress so non-React modules can
 *   listen without triggering rerenders.
 */
const PROGRESS_EVENT = 'morphin:scroll-progress';

type Listener = (progress: number) => void;

const listeners = new Set<Listener>();

export function onScrollProgress(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    // Build Lenis with spring physics — scrolling feels physical, never linear.
    const lenis = new Lenis({
      lerp: 0.09,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    // Keep ScrollTrigger & Lenis on the same rAF clock.
    lenis.on('scroll', ScrollTrigger.update);
    const ticker = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);

    const emitProgress = () => {
      const total =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = total > 0 ? window.scrollY / total : 0;
      listeners.forEach((fn) => fn(progress));
    };

    window.addEventListener('scroll', emitProgress, { passive: true });
    emitProgress();

    return () => {
      gsap.ticker.remove(ticker);
      listeners.clear();
      window.removeEventListener('scroll', emitProgress);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Scroll to top when the route changes — the experience restarts cleanly.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);

  return <>{children}</>;
}