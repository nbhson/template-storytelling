'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom, DepthOfField, Vignette, Noise } from '@react-three/postprocessing';
import { BlendFunction, DepthOfFieldEffect } from 'postprocessing';
import { postEffectsBudget, deviceQuality } from '@/lib/device-quality';
import { getScrollSnapshot } from '@/lib/scroll-state';

/**
 * Effects
 * -------
 * The cinematic grade — read straight from the master timeline snapshot so the
 * whole image breathes with the story:
 *
 *   Bloom  — swells on the core reveal (Technology), tightens through the Deep
 *            Dive, then relaxes into a calm glow at the CTA.
 *   DoF    — the Deep Dive tightens focus (close-up intimacy) while the camera
 *            pulls back to wide, softer focus elsewhere.
 *   Noise  — film grain rises with scroll velocity so motion feels physical.
 *   Vignette — keeps the eye on the model while the sides melt into fog.
 *
 * On low-end devices the heavy passes are skipped (reduced-motion / weak GPUs)
 * for a guaranteed 60 FPS.
 */

export function Effects() {
  const high = postEffectsBudget[deviceQuality];
  const bloomRef = useRef<any>(null);
  const dofRef = useRef<DepthOfFieldEffect | null>(null);
  const noiseRef = useRef<any>(null);

  useFrame(() => {
    const snap = getScrollSnapshot();
    const { progress, coreReveal, motion } = snap;

    // Bloom —— emotional arc through the whole journey.
    // Hero: hot. Solution: softer. CTA: re-focus.
    if (bloomRef.current) {
      const base = 1.35 - progress * 0.45;
      // The core reveal pushes a flare of light through the model.
      const revealFlare = coreReveal * 0.5;
      bloomRef.current.intensity = base + revealFlare;
    }

    // DoF —— Deep Dive zooms in tight and intimate; pull-backs relax.
    if (dofRef.current) {
      const deepFocus = snap.explode;
      const targetBokeh = 2.4 - deepFocus * 0.9;
      dofRef.current.bokehScale +=
        (targetBokeh - dofRef.current.bokehScale) * 0.08;
    }

    // Film grain —— energy follows intent; heavy scroll feels like a
    // photographer advancing the reel.
    if (noiseRef.current) {
      noiseRef.current.opacity = 0.12 + motion * 0.25;
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
        ref={dofRef}
        focusDistance={0}
        focalLength={0.06}
        bokehScale={2.4}
        height={480}
      />
      <Vignette eskil={false} offset={0.25} darkness={0.72} />
      <Noise
        ref={noiseRef}
        premultiply
        blendFunction={BlendFunction.ADD}
        opacity={0.18}
      />
    </EffectComposer>
  );
}