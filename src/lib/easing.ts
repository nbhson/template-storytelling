/**
 * Shared easing vocabulary.
 *
 * Every scroll-driven animation in the master timeline uses one of these names
 * so the whole experience shares a single, coherent motion language.
 */
export const EASE = {
  /** Smooth, slightly eased — good for camera drift */
  smooth: 'power2.out',
  /** Large, physical movements (camera moves, model rotation) */
  inertia: 'power3.inOut',
  /** Subtle, barely-there easing for micro parallax */
  soft: 'sine.out',
  /** Long cinematic settle — anticipation + follow-through without overshoot */
  cinematic: 'expo.inOut',
} as const;

export type EaseName = keyof typeof EASE;

export const scrub = {
  /** How much the scrub follows the user's scroll (seconds of smoothing) */
  SMOOTH: 0.7,
  /** Slightly snappier for text so copy keeps pace with the camera */
  TEXT: 0.5,
  /** Floaty, heavy response for the 3D stage */
  CAMERA: 0.9,
};