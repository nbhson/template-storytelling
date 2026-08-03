'use client';

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { getScrollSnapshot } from '@/lib/scroll-state';

/**
 * LightingRig
 * -----------
 * All lights live here. They read the master timeline snapshot and interpolate
 * smoothly so the mood shifts as the story progresses:
 *
 *  - `lightIntensity`       — key/fill strength (brightens in Discovery,
 *                             dims in Deep Dive, settles warm at CTA)
 *  - `environmentIntensity` — rim/silhouette crispness
 *  - `fogDensity`           — scene fog deepens through the story (emotional
 *                             low point in the Deep Dive, then lifts at CTA)
 *  - `sweep`                — a moving "director's light" that travels across
 *                             the dust, matching the model's sweep plane
 *
 * Colors also breathe: the rim warms at the CTA so everything converges on a
 * calm, luminous center.
 */
const colorKey = new THREE.Color('#bcc9ff');
const colorFill = new THREE.Color('#1d274a');
const colorRim = new THREE.Color('#5b6cff');
const colorRimWarm = new THREE.Color('#ffd9a3');

// Cached scratch color — no per-frame allocation.
const rimTarget = new THREE.Color();

export function LightingRig() {
  const keyRef = useRef<THREE.SpotLight | null>(null);
  const fillRef = useRef<THREE.DirectionalLight | null>(null);
  const rimRef = useRef<THREE.DirectionalLight | null>(null);
  const sweepRef = useRef<THREE.SpotLight | null>(null);
  const { scene } = useThree();

  useFrame((state, delta) => {
    const snap = getScrollSnapshot();
    const {
      lightIntensity,
      environmentIntensity,
      fogDensity,
      sweep,
      progress,
    } = snap;
    const time = state.clock.elapsedTime;

    const lerp = 1 - Math.exp(-3 * delta);

    // Key light: brightens through Discovery, recedes as the story deepens.
    if (keyRef.current) {
      keyRef.current.intensity +=
        (80 * lightIntensity - keyRef.current.intensity) * lerp;
    }

    // Fill light warms up slightly during the brighter beats.
    if (fillRef.current) {
      fillRef.current.intensity +=
        (4 + lightIntensity * 2 - fillRef.current.intensity) * lerp;
    }

    // Rim light stays crisp so the silhouette never flattens. At the CTA it
    // picks up a warm tint to converge on that calm, luminous center.
    if (rimRef.current) {
      rimRef.current.intensity +=
        (18 * environmentIntensity - rimRef.current.intensity) * lerp;
      rimTarget.copy(colorRim).lerp(colorRimWarm, progress * 0.5);
      rimRef.current.color.copy(rimTarget);
    }

    // Scene fog — the emotional depth gauge of the whole journey.
    if (!scene.fog) scene.fog = new THREE.FogExp2(0x05060d, 0.02);
    const fog = scene.fog as THREE.FogExp2;
    fog.density += (0.015 + fogDensity * 0.045 - fog.density) * lerp;

    // Director's sweep light — travels across the dust in sync with the
    // model's sweep plane during Technology & Showcase beats.
    if (sweepRef.current) {
      const t = (sweep + time * 0.02) % 1;
      sweepRef.current.position.x = -5 + t * 10;
      sweepRef.current.position.z = 5 - Math.sin(t * Math.PI) * 3;
      sweepRef.current.intensity = Math.min(
        60,
        sweep * Math.max(0, 1 - Math.abs(t - 0.5) * 2.4) * 130,
      );
    }
  });

  return (
    <>
      <ambientLight intensity={0.25} />
      <spotLight
        ref={keyRef}
        position={[6, 8, 8]}
        angle={0.5}
        penumbra={1}
        intensity={80}
        color={colorKey}
        castShadow
        shadow-mapSize={[512, 512]}
      />
      <directionalLight
        ref={fillRef}
        position={[-6, -2, 4]}
        intensity={5}
        color={colorFill}
      />
      <directionalLight
        ref={rimRef}
        position={[0, 3, -8]}
        intensity={18}
        color={colorRim}
      />
      {/* The director's sweep light — hidden until `sweep` rises above zero. */}
      <spotLight
        ref={sweepRef}
        position={[-5, 0, 5]}
        angle={0.4}
        penumbra={1}
        intensity={0}
        color="#8ab4ff"
      />
    </>
  );
}