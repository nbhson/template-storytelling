/**
 * Master timeline segment boundaries.
 *
 * The whole experience is ONE scrubbed timeline running 0 → 1. These constants
 * carve it into the six cinematic story beats so the animation code, camera
 * rig, particle field and section components all agree on where things happen.
 *
 * The values are percentages (0..100) of the entire scroll journey. They are
 * tuned to the section heights in Experience.tsx so each beat's climax lands
 * roughly when its section fills the viewport.
 */
export const SEGMENTS = {
  /** HERO — reveal, idle float, mouse parallax, gentle drift */
  HERO_END: 13,
  /** DISCOVERY — camera dollies in & orbits ~15°, model shifts left,
   *  content slides in from the right, lighting brightens */
  DISCOVERY_END: 29,
  /** TECHNOLOGY — camera orbits to the opposite side, model moves right,
   *  content on the left, the inner glow becomes visible, particles swell */
  TECHNOLOGY_END: 47,
  /** DEEP DIVE — camera zooms close and circles, the object separates into
   *  floating parts, holographic rings + connection lines appear, labels fade in */
  DEEP_DIVE_END: 66,
  /** FEATURE SHOWCASE — parts reassemble, the model spins ~90°, camera eases
   *  back, feature cards cascade in and illuminate their matching component */
  FEATURES_END: 85,
  /** CTA — camera pulls back, everything aligns symmetric, particles calm,
   *  one final elegant rotation, CTA converges on a luminous center */
  CTA_END: 100,
} as const;

export const SEGMENT_CENTER = {
  HERO: SEGMENTS.HERO_END / 2,
  DISCOVERY: (SEGMENTS.HERO_END + SEGMENTS.DISCOVERY_END) / 2,
  TECHNOLOGY: (SEGMENTS.DISCOVERY_END + SEGMENTS.TECHNOLOGY_END) / 2,
  DEEP_DIVE: (SEGMENTS.TECHNOLOGY_END + SEGMENTS.DEEP_DIVE_END) / 2,
  FEATURES: (SEGMENTS.DEEP_DIVE_END + SEGMENTS.FEATURES_END) / 2,
  CTA: (SEGMENTS.FEATURES_END + SEGMENTS.CTA_END) / 2,
} as const;