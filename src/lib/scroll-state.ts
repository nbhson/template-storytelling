/**
 * Single-source scroll state.
 *
 * The master GSAP timeline drives exactly ONE animated object (`story`) and
 * pushes a snapshot here on every tick (`setScrollSnapshot`). Consumers:
 *
 *  - The 3D scene reads the numbers each frame via `getScrollSnapshot()`
 *    (zero allocations, zero rerenders, no event plumbing on the hot path).
 *  - React UI never touches this — DOM is animated directly by GSAP.
 *
 * "One timeline, synchronized everything."
 */

export interface ScrollSnapshot {
  /** 0..1 master timeline progress */
  progress: number;

  // ------------------------- CAMERA -------------------------
  /** Camera depth offset — drives the cinematic zoom in/out */
  z: number;
  /** Camera orbit X — lateral moves around the model */
  camX: number;
  /** Camera height offset */
  camY: number;
  /** Camera forward offset (deep-dive close-ups) */
  camZ: number;
  /** Camera roll (degrees, subtle cinematic tilt) */
  roll: number;
  /** Camera FOV — push-ins tighten, pull-backs relax */
  fov: number;
  /** Look-target X — lets the camera circle AROUND the model */
  targetX: number;
  /** Look-target Y — crane up/down over the model */
  targetY: number;

  // ------------------------- MODEL --------------------------
  /** Model Y rotation */
  rotationY: number;
  /** Model lateral position — Discovery shifts left, Technology shifts right */
  modelX: number;
  /** Model vertical position */
  modelY: number;
  /** Model overall scale */
  modelScale: number;
  /** 0..1 separated / exploded state (Deep Dive) */
  explode: number;
  /** 0..1 inner core glow reveal (the surprise opening) */
  coreReveal: number;

  // -------------------- WORLD / ENVIRONMENT -----------------
  /** Key/intensity light strength */
  lightIntensity: number;
  /** Environment map intensity */
  environmentIntensity: number;
  /** Particle spread multiplier */
  particleSpread: number;
  /** Particle opacity — calms down at the CTA */
  particleOpacity: number;
  /** Fog density — deepens through the story */
  fogDensity: number;
  /** 0..1 holographic rings reveal (Deep Dive surprise) */
  rings: number;
  /** 0..1 connection-line visibility (Deep Dive) */
  connections: number;
  /** 0..1 dynamic light sweep traveling across the model */
  sweep: number;
  /** Which component (0..3) is currently illuminated (Feature Showcase) */
  highlight: number;
  /** Motion blur / chromatic aberration amount by scroll speed */
  motion: number;
}

const initialSnapshot: ScrollSnapshot = {
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

let snapshot: ScrollSnapshot = initialSnapshot;

/** Read the latest snapshot without subscribing (hot path for the 3D loop). */
export function getScrollSnapshot(): ScrollSnapshot {
  return snapshot;
}

/**
 * Called by the master timeline as it ticks. There is exactly ONE writer,
 * so every consumer stays perfectly in sync.
 */
export function setScrollSnapshot(partial: Partial<ScrollSnapshot>): void {
  snapshot = { ...snapshot, ...partial };
}