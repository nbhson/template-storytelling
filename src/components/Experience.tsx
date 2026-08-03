'use client';

/**
 * Experience
 * ----------
 * The orchestrator. Composes the entire cinematic journey into a single mount:
 *
 *  - Lenis smooth scroll (native scroll + GSAP ticker fusion)
 *  - The 3D stage — code-split & SSR-disabled so three.js never touches the
 *    server and the initial HTML stays light
 *  - All six story beats as stacked sections (transparent backgrounds, so the
 *    fixed 3D canvas reads through them)
 *  - The master GSAP timeline — created exactly once inside the GSAP context,
 *    so it is automatically reverted on unmount
 *
 * The six beats:
 *   1. Hero              — the model floats, breathing, alone in the dark
 *   2. Discovery         — camera dolly-in, model slips left, content slides right
 *   3. Technology        — orbit to the far side; the inner core is revealed
 *   4. Deep Dive         — exploded technical view, camera circles close
 *   5. Feature Showcase  — reassembly + 90° spin, feature cards sequence
 *   6. CTA               — calm convergence, one final elegant rotation
 *
 * Scroll architecture (one timeline, one progress value):
 *   Lenis → native scroll → ScrollTrigger (scrub) → master timeline
 *     ├─ tween `story` object → setScrollSnapshot() → 3D reads it per-frame
 *     └─ tween DOM [data-*] elements (text/cards) in the same timeline
 */
import dynamic from 'next/dynamic';
import { useGSAP } from '@gsap/react';
import { createMasterTimeline } from '@/animations/timeline';
import { SmoothScroll } from '@/lib/smooth-scroll';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ProgressIndicator } from '@/components/ui/ProgressIndicator';
import { BackgroundGradient } from '@/components/ui/BackgroundGradient';
import { Noise } from '@/components/ui/Noise';
import { Hero } from '@/components/sections/Hero';
import { Discovery } from '@/components/sections/Discovery';
import { Technology } from '@/components/sections/Technology';
import { DeepDive } from '@/components/sections/DeepDive';
import { FeatureShowcase } from '@/components/sections/FeatureShowcase';
import { CTA } from '@/components/sections/CTA';

/**
 * The 3D stage is the heaviest chunk. It is loaded lazily, after paint, and
 * only on the client. Suspense inside <Scene> guards the drei environment.
 */
const Scene = dynamic(() => import('@/components/3d/Scene').then((m) => m.Scene), {
  ssr: false,
  loading: () => null,
});

export function Experience() {
  useGSAP(() => {
    // Build the ONE scrubbed timeline that narrates the whole page.
    createMasterTimeline();
  }, []);

  return (
    <>
      <SmoothScroll>
        <BackgroundGradient />

        {/* Fixed 3D stage — transparent, non-interactive DOM-wise. Pointer
            events are captured by R3F's eventSource (document body), so the
            hero parallax tracks the cursor anywhere without blocking UI. */}
        <div className="pointer-events-none fixed inset-0 z-0">
          <Scene />
        </div>

        <Navbar />

        <main className="relative z-10">
          <Hero />
          <Discovery />
          <Technology />
          <DeepDive />
          <FeatureShowcase />
          <CTA />
        </main>

        <Footer />

        <Noise />
      </SmoothScroll>

      <ProgressIndicator />
    </>
  );
}