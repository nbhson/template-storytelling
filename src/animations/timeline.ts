/**
 * Master scroll timeline — the ONE source of truth for the whole experience.
 *
 * Every single thing you see respond to scroll (camera, model, lights,
 * particles, shader uniforms, rings, connection lines, text, cards, progress
 * bar) is written from this single scrubbed timeline. There are no competing
 * tweens anywhere else.
 *
 * Data flow:
 *   Scroll → ScrollTrigger (scrub) → this timeline → { story object }
 *     → setScrollSnapshot() → 3D rigs read it in useFrame (0 allocations)
 *     → GSAP also tweens DOM [data-*] elements directly
 *
 * Segment map (see src/constants/timeline.ts):
 *   0.00 – 0.13 HERO            idle, reveal, mouse parallax
 *   0.13 – 0.29 DISCOVERY       camera dollies in + orbits 15°, model drifts
 *                               left, content slides in from the right, light
 *                               brightens
 *   0.29 – 0.47 TECHNOLOGY      camera crosses to the opposite side, model
 *                               moves right, inner core briefly opens (the
 *                               surprise glow reveal), particles swell
 *   0.47 – 0.66 DEEP DIVE       camera zooms close & circles, parts separate,
 *                               holographic rings + connection lines fade in,
 *                               labels point at the exposed components
 *   0.66 – 0.85 FEATURE SHOW    parts reassemble, model spins ~90°, camera
 *                               eases back, cards cascade, each card lights
 *                               up its matching component + a light sweep
 *   0.85 – 1.00 CTA             camera pulls back, everything aligns, one
 *                               final elegant rotation, particles calm
 *
 * Choreography rule: NO element animates alone. Every beat sequence moves the
 * camera, model, lights, particles, background and DOM in lockstep.
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
  roll: 0,
  fov: 35,
  targetX: 0,
  targetY: 0,
  rotationY: 0,
  modelX: 0,
  modelY: 0,
  modelScale: 1,
  explode: 0,
  coreReveal: 0,
  lightIntensity: 1,
  environmentIntensity: 1,
  particleSpread: 1,
  particleOpacity: 1,
  fogDensity: 0,
  rings: 0,
  connections: 0,
  sweep: 0,
  highlight: -1,
  motion: 0,
};

/** Pointer to the progress bar / label for the onUpdate write. */
let progressBar: HTMLElement | null = null;
let progressLabel: HTMLElement | null = null;

/** Scroll-velocity tracker — feeds `motion` so particles / CA react to how
 *  fast the user is actually scrolling. */
let lastProgress = 0;

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

  gsap.set(['[data-discovery-eyebrow]', '[data-discovery-title]', '[data-discovery-body]', '[data-discovery-cta]'], {
    autoAlpha: 0,
    x: 80,
    y: 24,
    filter: 'blur(12px)',
  });

  gsap.set(['[data-tech-eyebrow]', '[data-tech-title]', '[data-tech-body]', '[data-tech-items]', '[data-tech-cta]'], {
    autoAlpha: 0,
    x: -80,
    y: 24,
    filter: 'blur(12px)',
  });
  gsap.set('[data-tech-item]', { autoAlpha: 0, y: 24 });

  gsap.set('[data-deep-heading]', { autoAlpha: 0, y: 44, filter: 'blur(12px)' });
  gsap.set('[data-deep-label]', { autoAlpha: 0, x: 24, filter: 'blur(6px)' });

  gsap.set('[data-feature-heading]', { autoAlpha: 0, y: 44, filter: 'blur(12px)' });
  gsap.set('[data-feature-card]', { autoAlpha: 0, y: 56, scale: 0.94 });

  gsap.set('[data-cta-inner] > *', { autoAlpha: 0, y: 40, filter: 'blur(8px)' });

  // -------------------------------------------------------------------
  // STORY — 3D SNAPSHOT (camera / model / lights / particles / world)
  //
  // Choreography: every beat moves at least 5 synchronized systems.
  // -------------------------------------------------------------------

  // -------------------------------------------------------------------
  // HERO (0 → HERO_END)
  // Gentle breath of the void. Camera stays centered over the idle model.
  // -------------------------------------------------------------------
  tl.to(story, {
    z: 0.45,
    duration: s(SEGMENTS.HERO_END),
    ease: EASE.smooth,
  }, 0);

  // -------------------------------------------------------------------
  // DISCOVERY (HERO_END → DISCOVERY_END)
  // Camera dollies in & orbits ~15° left. Model glides left & grows.
  // Light brightens, particles breathe outward. Content slides in right.
  // -------------------------------------------------------------------
  tl.to(story, {
    z: -1.15,
    camX: 1.15,              // orbit ~15° around the model
    camY: 0.12,
    targetX: 0.18,
    rotationY: 0.26,         // model turns to greet the camera
    modelX: -1.45,           // model shifts toward the left
    modelY: -0.1,
    modelScale: 1.06,
    lightIntensity: 1.2,
    environmentIntensity: 1.1,
    particleSpread: 1.28,
    particleOpacity: 0.95,
    duration: s(SEGMENTS.DISCOVERY_END - SEGMENTS.HERO_END),
    ease: EASE.inertia,
  }, s(SEGMENTS.HERO_END));

  // -------------------------------------------------------------------
  // TECHNOLOGY (DISCOVERY_END → TECHNOLOGY_END)
  // Camera crosses to the opposite side — passing through the model's orbit.
  // Model swings right, rotates a full half-spin, and briefly OPENS to reveal
  // the glowing inner core (the first surprise moment). Particles surge.
  // -------------------------------------------------------------------
  tl.to(story, {
    camX: -2.5,              // opposite side
    camY: 0.05,
    camZ: 0.6,               // camera passes close by the model
    targetX: -0.35,
    modelX: 1.55,            // model swings to the right
    rotationY: Math.PI + 0.42, // ≈ 200° — a new perspective
    modelScale: 1.12,
    coreReveal: 1,           // the core opens as we arrive
    lightIntensity: 1.05,
    environmentIntensity: 1.35,
    particleSpread: 1.75,
    particleOpacity: 1,
    fogDensity: 0.35,
    duration: s(SEGMENTS.TECHNOLOGY_END - SEGMENTS.DISCOVERY_END),
    ease: EASE.cinematic,
  }, s(SEGMENTS.DISCOVERY_END));

  // The core opens (0 → TECHNOLOGY mid), then glows as the section holds.
  tl.to(story, {
    coreReveal: 0.4,         // settle to a warm open glow
    duration: s(SEGMENTS.TECHNOLOGY_END - SEGMENTS.DISCOVERY_END) * 0.4,
    ease: EASE.smooth,
  }, s(SEGMENTS.DISCOVERY_END) + s(SEGMENTS.TECHNOLOGY_END - SEGMENTS.DISCOVERY_END) * 0.6);

  // A dynamic light sweep crosses the model during the reveal.
  tl.fromTo(story, {
    sweep: 0,
  }, {
    sweep: 1,
    duration: s(SEGMENTS.TECHNOLOGY_END - SEGMENTS.DISCOVERY_END),
    ease: EASE.smooth,
  }, s(SEGMENTS.DISCOVERY_END));

  // -------------------------------------------------------------------
  // DEEP DIVE (TECHNOLOGY_END → DEEP_DIVE_END)
  // Camera zooms close, then slowly circles the model. The object separates
  // into floating parts. Holographic rings + glowing connection lines fade in.
  // Fog deepens — the emotional low point, tight and intimate.
  // -------------------------------------------------------------------
  tl.to(story, {
    explode: 1,              // parts separate
    coreReveal: 0,           // inner glow cools as we zoom into the seams
    z: -2.6,
    camZ: -2.7,              // close-up
    camX: 2.1,
    camY: 0.9,
    targetX: 0.0,
    targetY: 0.35,
    modelScale: 1.3,
    rotationY: Math.PI + 1.05,
    rings: 1,
    connections: 1,
    lightIntensity: 0.85,
    environmentIntensity: 1.5,
    particleSpread: 2.05,
    fogDensity: 0.62,
    duration: s(SEGMENTS.DEEP_DIVE_END - SEGMENTS.TECHNOLOGY_END),
    ease: EASE.cinematic,
  }, s(SEGMENTS.TECHNOLOGY_END));

  // The camera circles the exploded model with a two-beat arc.
  tl.to(story, {
    keyframes: [
      { camX: 2.1, camY: 0.9, duration: 0.18, ease: EASE.inertia },
      { camX: 1.15, camY: 1.35, duration: 0.18, ease: EASE.inertia },
      { camX: 0.2, camY: 1.65, duration: 0.18, ease: EASE.inertia },
      { camX: -0.7, camY: 1.3, duration: 0.18, ease: EASE.inertia },
      { camX: -1.85, camY: 0.7, duration: 0.22, ease: EASE.inertia },
    ],
    ease: 'none',
  }, s(SEGMENTS.TECHNOLOGY_END) + 0.01);

  // As the circle completes, ease back toward the front for the reassemble.
  tl.to(story, {
    camX: -0.4,
    camY: 0.5,
    targetY: 0.1,
    duration: s(SEGMENTS.DEEP_DIVE_END - SEGMENTS.TECHNOLOGY_END) * 0.25,
    ease: EASE.inertia,
  }, s(SEGMENTS.DEEP_DIVE_END) - s(SEGMENTS.DEEP_DIVE_END - SEGMENTS.TECHNOLOGY_END) * 0.24);

  // -------------------------------------------------------------------
  // FEATURE SHOWCASE (DEEP_DIVE_END → FEATURES_END)
  // Parts reassemble with a magnetic pull. Model spins ~90° as the camera
  // eases back. Each feature card cascades in and illuminates its matching
  // component — plus a fresh light sweep travels the surface.
  // -------------------------------------------------------------------
  tl.to(story, {
    explode: 0,
    rings: 0.15,             // rings recede to a subtle halo
    connections: 0,
    z: -1.9,
    camZ: -1.1,
    camX: 0.15,
    camY: 0.25,
    targetX: 0,
    targetY: 0,
    modelX: 0.2,
    modelScale: 1.12,
    rotationY: Math.PI + 1.05 + Math.PI / 2, // +90° from the deep dive pose
    lightIntensity: 1.15,
    environmentIntensity: 1.3,
    particleSpread: 1.6,
    particleOpacity: 0.9,
    fogDensity: 0.3,
    duration: s(SEGMENTS.FEATURES_END - SEGMENTS.DEEP_DIVE_END) * 0.5,
    ease: EASE.inertia,
  }, s(SEGMENTS.DEEP_DIVE_END));

  // The four highlight pulses — each card lights its component in sequence.
  tl.to(story, {
    keyframes: [
      { highlight: 0, duration: 0.07, ease: EASE.smooth },
      { highlight: 1, duration: 0.07, ease: EASE.smooth },
      { highlight: 2, duration: 0.07, ease: EASE.smooth },
      { highlight: 3, duration: 0.07, ease: EASE.smooth },
      { highlight: -1, duration: 0.06, ease: EASE.smooth },
    ],
    ease: 'none',
  }, s(SEGMENTS.DEEP_DIVE_END) + 0.045);

  // Second light sweep during the showcase.
  tl.fromTo(story, {
    sweep: 1,
  }, {
    sweep: 1.8,
    duration: s(SEGMENTS.FEATURES_END - SEGMENTS.DEEP_DIVE_END),
    ease: EASE.smooth,
  }, s(SEGMENTS.DEEP_DIVE_END));

  // -------------------------------------------------------------------
  // CTA (FEATURES_END → CTA_END)
  // Camera pulls back. Model glides to center and aligns symmetrically.
  // Particles calm to a whisper. One final, elegant full rotation as the
  // CTA converges on a luminous center.
  // -------------------------------------------------------------------
  tl.to(story, {
    z: 1.1,
    camZ: 0,
    camX: 0,
    camY: 0,
    roll: 0,
    targetX: 0,
    targetY: 0,
    modelX: 0,
    modelY: 0,
    modelScale: 1,
    rotationY: Math.PI + 1.05 + Math.PI / 2 + Math.PI * 2, // final grand rotation
    coreReveal: 0.35,        // a last quiet inner breath
    lightIntensity: 1.18,
    environmentIntensity: 1.2,
    particleSpread: 1.0,
    particleOpacity: 0.45,
    fogDensity: 0.12,
    rings: 0,
    sweep: 1.05,
    duration: s(SEGMENTS.CTA_END - SEGMENTS.FEATURES_END),
    ease: EASE.inertia,
  }, s(SEGMENTS.FEATURES_END));

  // -------------------------------------------------------------------
  // DOM — TEXT / CARDS (same timeline, scrubbed in lockstep with the 3D)
  // -------------------------------------------------------------------

  // HERO reveal — anticipation then settle; classic Apple phrasing.
  tl.to('[data-hero-eyebrow]', { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.045, ease: EASE.soft }, 0.004);
  tl.to('[data-hero-title]', { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.06, ease: EASE.smooth }, 0.012);
  tl.to('[data-hero-sub]', { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.05, ease: EASE.smooth }, 0.038);
  tl.to('[data-hero-cta]', { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.05, ease: EASE.smooth }, 0.048);
  tl.to('[data-hero-scroll]', { autoAlpha: 0, duration: 0.035, ease: EASE.soft }, s(SEGMENTS.HERO_END) - 0.035);

  // DISCOVERY — copy sweeps in from the right as the model slides left.
  tl.to('[data-discovery-eyebrow]', { autoAlpha: 1, x: 0, y: 0, filter: 'blur(0px)', duration: 0.05, ease: EASE.smooth }, s(SEGMENTS.HERO_END) + 0.01);
  tl.to('[data-discovery-title]', { autoAlpha: 1, x: 0, y: 0, filter: 'blur(0px)', duration: 0.06, ease: EASE.inertia }, s(SEGMENTS.HERO_END) + 0.03);
  tl.to('[data-discovery-body]', { autoAlpha: 1, x: 0, y: 0, filter: 'blur(0px)', duration: 0.05, ease: EASE.smooth }, s(SEGMENTS.HERO_END) + 0.062);
  tl.to('[data-discovery-cta]', { autoAlpha: 1, x: 0, y: 0, filter: 'blur(0px)', duration: 0.05, ease: EASE.smooth }, s(SEGMENTS.HERO_END) + 0.085);

  // TECHNOLOGY — copy sweeps in from the left, staggered items.
  tl.to('[data-tech-eyebrow]', { autoAlpha: 1, x: 0, y: 0, filter: 'blur(0px)', duration: 0.05, ease: EASE.smooth }, s(SEGMENTS.DISCOVERY_END) + 0.01);
  tl.to('[data-tech-title]', { autoAlpha: 1, x: 0, y: 0, filter: 'blur(0px)', duration: 0.06, ease: EASE.inertia }, s(SEGMENTS.DISCOVERY_END) + 0.03);
  tl.to('[data-tech-body]', { autoAlpha: 1, x: 0, y: 0, filter: 'blur(0px)', duration: 0.05, ease: EASE.smooth }, s(SEGMENTS.DISCOVERY_END) + 0.062);
  tl.to('[data-tech-items]', { autoAlpha: 1, x: 0, y: 0, filter: 'blur(0px)', duration: 0.05, ease: EASE.smooth }, s(SEGMENTS.DISCOVERY_END) + 0.09);
  tl.to('[data-tech-cta]', { autoAlpha: 1, x: 0, y: 0, filter: 'blur(0px)', duration: 0.05, ease: EASE.smooth }, s(SEGMENTS.DISCOVERY_END) + 0.115);

  const techSeg = 0.035;
  gsap.utils.toArray<HTMLElement>('[data-tech-item]').forEach((item, i) => {
    tl.to(item, { autoAlpha: 1, y: 0, duration: techSeg, ease: EASE.smooth }, s(SEGMENTS.DISCOVERY_END) + 0.12 + i * techSeg);
  });

  // DEEP DIVE — heading, then each floating label fades toward its part.
  tl.to('[data-deep-heading]', { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.06, ease: EASE.inertia }, s(SEGMENTS.TECHNOLOGY_END) + 0.02);

  const labelSeg = 0.045;
  gsap.utils.toArray<HTMLElement>('[data-deep-label]').forEach((label, i) => {
    tl.to(label, { autoAlpha: 1, x: 0, filter: 'blur(0px)', duration: labelSeg, ease: EASE.smooth }, s(SEGMENTS.TECHNOLOGY_END) + 0.09 + i * labelSeg);
  });

  // FEATURE SHOWCASE — heading, then cards cascade with follow-through.
  tl.to('[data-feature-heading]', { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.05, ease: EASE.inertia }, s(SEGMENTS.DEEP_DIVE_END) + 0.02);

  const featureSeg = 0.035;
  gsap.utils.toArray<HTMLElement>('[data-feature-card]').forEach((card, i) => {
    tl.to(card, { autoAlpha: 1, y: 0, scale: 1, duration: featureSeg, ease: EASE.smooth }, s(SEGMENTS.DEEP_DIVE_END) + 0.06 + i * featureSeg);
  });

  // CTA — the final alignment, everything settles in sequence.
  gsap.utils.toArray<HTMLElement>('[data-cta-inner] > *').forEach((el, i) => {
    tl.to(el, {
      autoAlpha: 1,
      y: 0,
      filter: 'blur(0px)',
      duration: 0.05,
      ease: EASE.inertia,
    }, s(SEGMENTS.FEATURES_END) + 0.015 + i * 0.035);
  });

  // -------------------------------------------------------------------
  // THE ONE WRITER — broadcast progress to the 3D world + progress bar.
  // Scroll velocity feeds `story.motion` so particles / post-FX react to how
  // fast the user is actually scrolling (energy follows intent).
  // -------------------------------------------------------------------
  tl.eventCallback('onUpdate', () => {
    const { progress } = story;

    // Velocity = how far progress moved since the last tick.
    const velocity = Math.min(1, Math.abs(progress - lastProgress) * 220);
    lastProgress = progress;
    story.motion = velocity;

    setScrollSnapshot({ ...story, progress });

    if (progressBar) {
      progressBar.style.transform = `scaleX(${progress.toFixed(4)})`;
    }
    if (progressLabel) {
      progressLabel.textContent = `${String(Math.round(progress * 100)).padStart(3, '0')}%`;
    }
  });

  // Wire the whole timeline to scroll: one trigger, one scrub, one story.
  ScrollTrigger.create({
    trigger: document.documentElement,
    start: 'top top',
    end: 'max',
    scrub: 1,
    animation: tl,
  });

  return tl;
}