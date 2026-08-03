/**
 * Master scroll timeline — the ONE source of truth for the whole experience.
 *
 * Every single thing you see respond to scroll (camera, model, lights,
 * particles, shader uniforms, text, cards, progress bar) is written from this
 * single scrubbed timeline. There are no competing tweens anywhere else.
 *
 * Data flow:
 *   Scroll → ScrollTrigger (scrub) → this timeline → { story object }
 *     → setScrollSnapshot() → 3D rigs read it in useFrame (0 allocations)
 *     → GSAP also tweens DOM [data-*] elements directly
 *
 * Segment map (see src/constants/timeline.ts):
 *   0 – 0.18  HERO        reveal, intro drift
 *   0.18 – 0.38 PROBLEM   camera pushes in, core rotates 20°
 *   0.38 – 0.60 SOLUTION  camera orbits right, cards cascade, particles swell
 *   0.60 – 0.82 TECHNOLOGY exploded view, components separate
 *   0.82 – 1   CTA        everything aligns, camera pulls back
 */
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { setScrollSnapshot, type ScrollSnapshot } from '@/lib/scroll-state';
import { EASE } from '@/lib/easing';
import { SEGMENTS } from '@/constants/timeline';

/** The single animated object — mirrors ScrollSnapshot so the onUpdate writer
 *  can broadcast it to the 3D world verbatim. */
const story: ScrollSnapshot = {
  progress: 0,
  z: 0,
  camX: 0,
  camY: 0,
  camZ: 0,
  rotationY: 0,
  lightIntensity: 1,
  environmentIntensity: 1,
  particleSpread: 1,
  explode: 0,
};

/** Pointer to the progress bar / label for the onUpdate write. */
let progressBar: HTMLElement | null = null;
let progressLabel: HTMLElement | null = null;

/** Convert a SEGMENTS boundary into a timeline fraction. */
const s = (seg: number) => seg / 100;

export function createMasterTimeline() {
  const tl = gsap.timeline({
    paused: true,
    defaults: { ease: 'none' },
  });

  progressBar = document.querySelector('[data-progress-bar]');
  progressLabel = document.querySelector('[data-progress-label]');

  // -------------------------------------------------------------------
  // INITIAL DOM STATES — everything starts hidden / staged, ready to be
  // scrubbed in. (Applied synchronously so no content flashes before the
  // first scroll tick.)
  // -------------------------------------------------------------------
  gsap.set(
    ['[data-hero-eyebrow]', '[data-hero-title]', '[data-hero-sub]', '[data-hero-cta]'],
    { autoAlpha: 0, y: 46, filter: 'blur(14px)' },
  );
  gsap.set('[data-hero-scroll]', { autoAlpha: 0.7 });

  gsap.set(['[data-problem-title]', '[data-problem-body]'], {
    autoAlpha: 0,
    y: 44,
    filter: 'blur(10px)',
  });

  gsap.set('[data-solution-heading]', { autoAlpha: 0, y: 44, filter: 'blur(10px)' });
  gsap.set('[data-scroll-card]', { autoAlpha: 0, y: 56, scale: 0.96 });

  gsap.set('[data-tech-heading]', { autoAlpha: 0, y: 44, filter: 'blur(10px)' });
  gsap.set('[data-tech-item]', { autoAlpha: 0, y: 40 });

  gsap.set('[data-cta-inner] > *', { autoAlpha: 0, y: 40, filter: 'blur(8px)' });

  // -------------------------------------------------------------------
  // STORY — 3D SNAPSHOT (camera / model / lights / particles / explode)
  // -------------------------------------------------------------------

  // HERO — gentle drift out of the void. Camera starts centered.
  tl.to(story, {
    z: 0.6,
    duration: s(SEGMENTS.HERO_END),
    ease: EASE.smooth,
  }, 0);

  // PROBLEM — push in + rotate the core 20°.
  tl.to(story, {
    z: -1.4,
    rotationY: 0.35, // ≈ 20°
    duration: s(SEGMENTS.PROBLEM_END - SEGMENTS.HERO_END),
    ease: EASE.inertia,
  }, s(SEGMENTS.HERO_END));

  // SOLUTION — orbit right, drop slightly, swell the particle field.
  tl.to(story, {
    camX: 2.6,
    camY: -0.25,
    z: -2.1,
    particleSpread: 1.9,
    duration: s(SEGMENTS.SOLUTION_END - SEGMENTS.PROBLEM_END),
    ease: EASE.inertia,
  }, s(SEGMENTS.PROBLEM_END));

  // TECHNOLOGY — exploded view. Camera rises and closes in; lights shift.
  tl.to(story, {
    explode: 1,
    rotationY: 0.6,
    camX: 1.4,
    camY: 0.85,
    camZ: -3.4,
    lightIntensity: 0.72,
    environmentIntensity: 1.35,
    duration: s(SEGMENTS.TECHNOLOGY_END - SEGMENTS.SOLUTION_END),
    ease: EASE.cinematic,
  }, s(SEGMENTS.SOLUTION_END));

  // CTA — everything aligns. Camera pulls back, explode reassembles,
  // warmth returns to the light.
  tl.to(story, {
    explode: 0,
    rotationY: 0,
    camX: 0,
    camY: 0,
    camZ: -1.1,
    z: -0.35,
    particleSpread: 1.15,
    lightIntensity: 1.05,
    environmentIntensity: 1.25,
    duration: s(SEGMENTS.CTA_END - SEGMENTS.TECHNOLOGY_END),
    ease: EASE.inertia,
  }, s(SEGMENTS.TECHNOLOGY_END));

  // -------------------------------------------------------------------
  // DOM — TEXT / CARDS (same timeline, scrubbed in lockstep with the 3D)
  // -------------------------------------------------------------------

  // HERO reveal — anticipation then settle; classic Apple phrasing.
  tl.to('[data-hero-eyebrow]', {
    autoAlpha: 1,
    y: 0,
    filter: 'blur(0px)',
    duration: 0.05,
    ease: EASE.soft,
  }, 0.005);
  tl.to('[data-hero-title]', {
    autoAlpha: 1,
    y: 0,
    filter: 'blur(0px)',
    duration: 0.07,
    ease: EASE.smooth,
  }, 0.015);
  tl.to('[data-hero-sub]', {
    autoAlpha: 1,
    y: 0,
    filter: 'blur(0px)',
    duration: 0.05,
    ease: EASE.smooth,
  }, 0.045);
  tl.to('[data-hero-cta]', {
    autoAlpha: 1,
    y: 0,
    filter: 'blur(0px)',
    duration: 0.05,
    ease: EASE.smooth,
  }, 0.055);
  // Scroll hint exits as the story begins.
  tl.to('[data-hero-scroll]', {
    autoAlpha: 0,
    duration: 0.04,
    ease: EASE.soft,
  }, s(SEGMENTS.HERO_END) - 0.04);

  // PROBLEM — copy fades in as the camera pushes forward.
  tl.to('[data-problem-title]', {
    autoAlpha: 1,
    y: 0,
    filter: 'blur(0px)',
    duration: 0.05,
    ease: EASE.smooth,
  }, s(SEGMENTS.HERO_END) + 0.015);
  tl.to('[data-problem-body]', {
    autoAlpha: 1,
    y: 0,
    filter: 'blur(0px)',
    duration: 0.05,
    ease: EASE.smooth,
  }, s(SEGMENTS.HERO_END) + 0.045);

  // SOLUTION — heading first, then each card cascades with follow-through.
  tl.to('[data-solution-heading]', {
    autoAlpha: 1,
    y: 0,
    filter: 'blur(0px)',
    duration: 0.05,
    ease: EASE.smooth,
  }, s(SEGMENTS.PROBLEM_END) + 0.01);

  const cardSeg = 0.04;
  gsap.utils.toArray<HTMLElement>('[data-scroll-card]').forEach((card, i) => {
    tl.to(card, {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      duration: cardSeg,
      ease: EASE.smooth,
    }, s(SEGMENTS.PROBLEM_END) + 0.05 + i * cardSeg);
  });

  // TECHNOLOGY — heading, then the four component call-outs.
  tl.to('[data-tech-heading]', {
    autoAlpha: 1,
    y: 0,
    filter: 'blur(0px)',
    duration: 0.05,
    ease: EASE.smooth,
  }, s(SEGMENTS.SOLUTION_END) + 0.01);

  const techSeg = 0.04;
  gsap.utils.toArray<HTMLElement>('[data-tech-item]').forEach((item, i) => {
    tl.to(item, {
      autoAlpha: 1,
      y: 0,
      duration: techSeg,
      ease: EASE.smooth,
    }, s(SEGMENTS.SOLUTION_END) + 0.05 + i * techSeg);
  });

  // CTA — the final alignment, everything settles in sequence.
  gsap.utils.toArray<HTMLElement>('[data-cta-inner] > *').forEach((el, i) => {
    tl.to(el, {
      autoAlpha: 1,
      y: 0,
      filter: 'blur(0px)',
      duration: 0.05,
      ease: EASE.inertia,
    }, s(SEGMENTS.TECHNOLOGY_END) + 0.015 + i * 0.035);
  });

  // -------------------------------------------------------------------
  // THE ONE WRITER — broadcast progress to the 3D world + progress bar.
  // -------------------------------------------------------------------
  tl.eventCallback('onUpdate', () => {
    const { progress } = story;
    setScrollSnapshot({ ...story, progress });

    if (progressBar) {
      progressBar.style.transform = `scaleX(${progress.toFixed(4)})`;
    }
    if (progressLabel) {
      progressLabel.textContent = `${String(Math.round(progress * 100)).padStart(3, '0')}%`;
    }
  });

  // Wire the whole timeline to scroll: one trigger, one scrub, one story.
  // `end: 'max'` keeps the timeline pinned to the true scrollable height, and
  // (importantly) without an onRefresh jump so window resizes never yank the
  // user back to the top.
  ScrollTrigger.create({
    trigger: document.documentElement,
    start: 'top top',
    end: 'max',
    scrub: 1,
    animation: tl,
  });

  return tl;
}