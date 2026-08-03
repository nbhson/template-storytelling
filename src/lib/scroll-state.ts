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
  /** Camera depth offset — drives the cinematic zoom in/out */
  z: number;
  /** Camera orbit X — lateral moves (Solution / Technology beats) */
  camX: number;
  /** Camera height offset */
  camY: number;
  /** Camera forward offset (used for the final pull-back) */
  camZ: number;
  /** Model Y rotation, used by the AiCore group */
  rotationY: number;
  /** Key/intensity light strength */
  lightIntensity: number;
  /** Environment map intensity */
  environmentIntensity: number;
  /** Particle spread multiplier — grows as the story builds */
  particleSpread: number;
  /** 0..1 exploded state for the Technology section */
  explode: number;
}

const initialSnapshot: ScrollSnapshot = {
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