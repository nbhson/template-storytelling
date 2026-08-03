/**
 * Master timeline segment boundaries.
 *
 * The whole experience is ONE scrubbed timeline running 0 → 1. These constants
 * carve it into the five story beats so the animation code, camera rig and
 * section components all agree on where things happen.
 *
 * The values are percentages (0..100) of the entire scroll journey.
 */
export const SEGMENTS = {
  /** HERO — reveal, idle float, mouse parallax */
  HERO_END: 18,
  /** PROBLEM — camera pushes in, model rotates 20°, copy fades in */
  PROBLEM_END: 38,
  /** SOLUTION — camera orbits to a new angle, cards appear, particles swell */
  SOLUTION_END: 60,
  /** TECHNOLOGY — exploded view, components separate & highlight */
  TECHNOLOGY_END: 82,
  /** CTA — everything aligns, camera pulls back */
  CTA_END: 100,
} as const;

export const SEGMENT_CENTER = {
  HERO: SEGMENTS.HERO_END / 2,
  PROBLEM: (SEGMENTS.HERO_END + SEGMENTS.PROBLEM_END) / 2,
  SOLUTION: (SEGMENTS.PROBLEM_END + SEGMENTS.SOLUTION_END) / 2,
  TECHNOLOGY: (SEGMENTS.SOLUTION_END + SEGMENTS.TECHNOLOGY_END) / 2,
  CTA: (SEGMENTS.TECHNOLOGY_END + SEGMENTS.CTA_END) / 2,
} as const;