'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getScrollSnapshot } from '@/lib/scroll-state';

/**
 * LightingRig
 * -----------
 * All lights live here. They read the master timeline snapshot
 * (lightIntensity & environmentIntensity) and interpolate smoothly so the
 * mood shifts subtly as the story progresses.
 */
const colorKey = new THREE.Color('#bcc9ff');
const colorFill = new THREE.Color('#1d274a');
const colorRim = new THREE.Color('#5b6cff');

export function LightingRig() {
  const keyRef = useRef<THREE.SpotLight | null>(null);
  const fillRef = useRef<THREE.DirectionalLight | null>(null);
  const rimRef = useRef<THREE.DirectionalLight | null>(null);

  useFrame((_, delta) => {
    const { lightIntensity, environmentIntensity } = getScrollSnapshot();

    const lerp = 1 - Math.exp(-3 * delta);

    // Key light: bright at the hero, recedes as the story deepens.
    if (keyRef.current) {
      keyRef.current.intensity +=
        (80 * lightIntensity - keyRef.current.intensity) * lerp;
    }

    // Fill light warms up slightly during the solution beat.
    if (fillRef.current) {
      fillRef.current.intensity +=
        (4 + lightIntensity * 2 - fillRef.current.intensity) * lerp;
    }

    // Rim light stays crisp so the silhouette never flattens.
    if (rimRef.current) {
      rimRef.current.intensity +=
        (18 * environmentIntensity - rimRef.current.intensity) * lerp;
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
    </>
  );
}