'use client';

/**
 * Detects the rendering budget on the client so the 3D scene can scale
 * its cost to the device:
 *
 * - `high`   → desktop / high-DPI laptops (max particles, full post FX)
 * - `medium` → tablets & average laptops (fewer particles, lighter FX)
 * - `low`    → phones & weak GPUs (minimal particles, no heavy post)
 *
 * The page still renders the full story on every tier — this only tunes
 * quality, never the content.
 */
export type DeviceQuality = 'high' | 'medium' | 'low';

const STORAGE_KEY = 'morphin:quality';

function baseQuality(): DeviceQuality {
  if (typeof window === 'undefined') return 'high';

  // Respect the user's OS-level preference for reduced motion first —
  // the experience gracefully degrades to a calm, static-friendly mode.
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) return 'low';

  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const cpuCores = navigator.hardwareConcurrency ?? 8;

  // Weak phones → lowest budget.
  if (coarsePointer && cpuCores <= 4) return 'low';
  // Any other touch/tablet device → medium.
  if (coarsePointer) return 'medium';
  // Desktops and powerful laptops → full experience.
  return 'high';
}

export function getDeviceQuality(): DeviceQuality {
  if (typeof window === 'undefined') return 'high';
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === 'high' || saved === 'medium' || saved === 'low') return saved;
  } catch {
    /* localStorage can throw in private mode — fall through */
  }
  return baseQuality();
}

/** Expose the quality to non-React modules (e.g. the 3D scene). */
export const deviceQuality: DeviceQuality =
  typeof window !== 'undefined' ? getDeviceQuality() : 'high';

/** Number of floating particles to render on this device. */
export const particleBudget: Record<DeviceQuality, number> = {
  high: 900,
  medium: 450,
  low: 120,
};

/** Whether depth-of-field and bloom should run at full strength. */
export const postEffectsBudget: Record<DeviceQuality, boolean> = {
  high: true,
  medium: true,
  low: false,
};