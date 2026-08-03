'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { AiCore } from '@/components/3d/AiCore';
import { CameraRig } from '@/components/3d/CameraRig';
import { LightingRig } from '@/components/3d/LightingRig';
import { Particles } from '@/components/3d/Particles';
import { Effects } from '@/components/3d/Effects';
import { deviceQuality } from '@/lib/device-quality';

/**
 * Scene
 * -----
 * The full 3D stage. Everything scroll-synced lives here:
 *
 *  - HDR environment (drei <Environment> preset for premium reflections).
 *  - AiCore (glass + metal + glow) — the core owns its own idle float, so we
 *    deliberately don't double-wrap it in drei <Float>.
 *  - LightingRig (scrubbed by the master timeline via the snapshot).
 *  - Particles (instanced, spread-driven, scrubbed).
 *  - CameraRig (the only component that owns the camera; reads the snapshot).
 *  - Effects (bloom/DoF/vignette/grain, budget-aware).
 *
 * `eventSource` is the document body so the cursor is tracked across the whole
 * viewport (the wrapper DOM node is pointer-events-none), which lets the hero
 * parallax work even when the pointer is over text or buttons.
 *
 * The scroll pipeline NEVER touches React state here — everything reads
 * `getScrollSnapshot()` inside `useFrame`, so the loop holds 60 FPS even
 * while scrubbing.
 */

function StageLoader() {
  return (
    <>
      {/* HDR environment — studio reflections for glass + brushed metal. */}
      <Environment preset="city" />

      <ContactShadows
        position={[0, -2.4, 0]}
        opacity={0.5}
        scale={18}
        blur={2.8}
        far={4}
        color="#04060c"
      />

      <group position={[0, 0, 0]}>
        <AiCore />
      </group>
    </>
  );
}

export function Scene() {
  const softShadows = deviceQuality !== 'low';

  return (
    <Canvas
      camera={{ position: [0, 0, 10], fov: 35, near: 0.1, far: 100 }}
      shadows={softShadows}
      dpr={[1, 2]}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      }}
      eventSource={document.body}
      eventPrefix="client"
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
    >
      <fog attach="fog" args={['#05060a', 14, 30]} />

      <Suspense fallback={null}>
        <StageLoader />
        <LightingRig />
        <Particles />
        <CameraRig />
      </Suspense>

      {/* Post-processing sits in its own Suspense so the composer stays mounted
          independently of the content chunk. */}
      <Suspense fallback={null}>
        <Effects />
      </Suspense>
    </Canvas>
  );
}