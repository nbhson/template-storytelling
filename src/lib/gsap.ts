'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

/**
 * GSAP is registered exactly once, in this module, and every other module
 * imports the same instance. This keeps the whole app on ONE ticker so the
 * master timeline, ScrollTrigger refreshes and Lenis stay in sync.
 */
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, useGSAP);
}

gsap.defaults({
  ease: 'power2.out',
  duration: 1,
  overwrite: 'auto',
});

export { gsap, ScrollTrigger, useGSAP, ScrollToPlugin };