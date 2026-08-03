'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom, DepthOfField, Vignette, Noise } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { postEffectsBudget, deviceQuality } from '@/lib/device-quality';
import { getScrollSnapshot } from '@/lib/scroll-state';

/**
 * Effects
 * -------
 * The cinematic grade: bloom makes the core glow, depth-of-field keeps the
 * foreground dust soft, vignette focuses the eye, and a whisper of film grain
 * prevents banding on gradients.
 *
 * On low-end devices the heavy passes are skipped (reduced-motion / weak GPUs)
 * for a guaranteed 60 FPS.
 *
 * Bloom strength is scrubbed every frame from the master timeline snapshot,
 * so the glow breathes EXACTLY with the story.
 */
export function Effects() {
  const high = postEffectsBudget[deviceQuality];
  const bloomRef = useRef<any>(null);

  useFrame(() => {
    const { progress } = getScrollSnapshot();
    if (bloomRef.current) {
      // Hero: hot bloom. Solution: softer. CTA: re-focus.
      bloomRef.current.intensity = 1.35 - progress * 0.45;
    }
  });

  if (!high) {
    // Lightweight grade only — vignette, zero expensive passes.
    return (
      <EffectComposer>
        <Vignette eskil={false} offset={0.25} darkness={0.75} />
      </EffectComposer>
    );
  }

  return (
    <EffectComposer multisampling={4}>
      <Bloom
        ref={bloomRef}
        intensity={1.2}
        luminanceThreshold={0.25}
        luminanceSmoothing={0.9}
        mipmapBlur
        radius={0.8}
      />
      <DepthOfField
        focusDistance={0}
        focalLength={0.06}
        bokehScale={2.4}
        height={480}
      />
      <Vignette eskil={false} offset={0.25} darkness={0.72} />
      <Noise premultiply blendFunction={BlendFunction.ADD} opacity={0.18} />
    </EffectComposer>
  );
}