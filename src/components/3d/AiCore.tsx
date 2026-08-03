'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getScrollSnapshot } from '@/lib/scroll-state';
import { createGlassMaterial, type GlassUniforms } from '@/shaders/glass-material';
import { createCoreGlowMaterial, type CoreGlowUniforms } from '@/shaders/core-glow';
import { createAuraMaterial, type AuraUniforms } from '@/shaders/aura';

/**
 * AiCore
 * ------
 * The floating intelligence core, built purely procedurally (Draco/GLB-ready:
 * the same scene can be swapped for a compressed GLB with an <UseGLTF> hook
 * without touching the timeline).
 *
 * Layers (back → front):
 *   1. Aura            — wide volumetric halo
 *   2. Glass shell     — iridescent fresnel glass
 *   3. Metallic frame  — brushed-metal torus rings (the "details")
 *   4. Core glow       — hot breathing center via ShaderMaterial
 *
 * Scroll drives (ALL from the master snapshot — never a second timeline):
 *   - group.rotation.y (20° in the Problem beat)
 *   - `explode` — Technology section separates shell/frame/glow
 *   - shader uniforms (uAbsorption, uIntensity, uBloom)
 *   - idle floating + slow rotation (the only "always-on" motion)
 */

export function AiCore() {
  const groupRef = useRef<THREE.Group | null>(null);
  const shellRef = useRef<THREE.Mesh | null>(null);
  const frameRef = useRef<THREE.Group | null>(null);
  const glowRef = useRef<THREE.Mesh | null>(null);
  const auraRef = useRef<THREE.Mesh | null>(null);

  const shellMaterial = useMemo(() => createGlassMaterial(), []);
  const frameMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#c7d2fe',
        metalness: 0.95,
        roughness: 0.25,
        envMapIntensity: 1.4,
      }),
    [],
  );
  const glowMaterial = useMemo(() => createCoreGlowMaterial(), []);
  const auraMaterial = useMemo(() => createAuraMaterial(), []);

  useFrame((state) => {
    const group = groupRef.current;
    if (!group) return;

    const snap = getScrollSnapshot();
    const time = state.clock.elapsedTime;

    // Rotation from the timeline + an infinitely slow idle spin.
    const idleSpin = time * 0.04;
    group.rotation.y = idleSpin + snap.rotationY;

    // Breathing float — the core is alive even when standing still.
    group.position.y = Math.sin(time * 0.6) * 0.12;

    // Explode — Technology section separates the layers.
    const explode = snap.explode;
    const shellOffset = explode * 0.9;
    const frameOffset = explode * 0.6;
    const glowScale = 1 - explode * 0.15;

    if (shellRef.current) {
      shellRef.current.position.set(0, shellOffset * 0.15, shellOffset);
      shellRef.current.scale.setScalar(1 + explode * 0.06);
    }
    if (frameRef.current) {
      frameRef.current.position.y = -frameOffset * 0.2;
      frameRef.current.position.z = -frameOffset * 0.35;
      frameRef.current.rotation.x = explode * 0.35;
    }
    if (glowRef.current) {
      glowRef.current.position.set(0, -shellOffset * 0.1, -shellOffset * 0.4);
      glowRef.current.scale.setScalar(glowScale);
    }
    if (auraRef.current) {
      auraRef.current.scale.setScalar(1 + explode * 0.5);
    }

    // Shader uniform live-update.
    (shellMaterial.uniforms as unknown as GlassUniforms).uTime.value = time;
    (shellMaterial.uniforms as unknown as GlassUniforms).uAbsorption.value =
      0.2 + snap.progress * 0.25;
    (glowMaterial.uniforms as unknown as CoreGlowUniforms).uTime.value = time;
    (glowMaterial.uniforms as unknown as CoreGlowUniforms).uIntensity.value =
      0.9 + snap.progress * 0.4;
    (auraMaterial.uniforms as unknown as AuraUniforms).uTime.value = time;
    (auraMaterial.uniforms as unknown as AuraUniforms).uBloom.value =
      0.8 + snap.progress * 0.6;
  });

  return (
    <group ref={groupRef}>
      {/* Layer 1 — volumetric halo */}
      <mesh ref={auraRef} material={auraMaterial}>
        <planeGeometry args={[7.2, 7.2]} />
      </mesh>

      {/* Layer 2 — glass shell with fresnel rim */}
      <mesh ref={shellRef} material={shellMaterial} castShadow>
        <icosahedronGeometry args={[1.5, 32]} />
      </mesh>

      {/* Layer 3 — metallic frame (brushed rings) */}
      <group ref={frameRef}>
        <mesh castShadow>
          <torusGeometry args={[1.9, 0.045, 24, 96]} />
          <primitive object={frameMaterial} attach="material" />
        </mesh>
        <mesh rotation={[Math.PI / 2.2, 0.4, 0]} castShadow>
          <torusGeometry args={[2.1, 0.03, 24, 96]} />
          <meshStandardMaterial
            color="#b6c4ff"
            metalness={1}
            roughness={0.35}
            envMapIntensity={1.2}
          />
        </mesh>
        <mesh rotation={[Math.PI / 1.6, -0.3, 0.6]} castShadow>
          <torusGeometry args={[2.3, 0.02, 24, 96]} />
          <meshStandardMaterial
            color="#ffe3a3"
            metalness={0.9}
            roughness={0.3}
            envMapIntensity={1.1}
          />
        </mesh>
      </group>

      {/* Layer 4 — breathing glow center */}
      <mesh ref={glowRef} material={glowMaterial}>
        <sphereGeometry args={[0.85, 64, 64]} />
      </mesh>

      {/* Scattered micro spheres for "component" detail */}
      <mesh position={[0.6, 0.9, 1.1]} castShadow>
        <sphereGeometry args={[0.09, 24, 24]} />
        <meshStandardMaterial color="#d6e4ff" metalness={0.9} roughness={0.3} />
      </mesh>
      <mesh position={[-0.8, -0.7, 0.9]} castShadow>
        <sphereGeometry args={[0.07, 24, 24]} />
        <meshStandardMaterial color="#ffd9a3" metalness={0.9} roughness={0.3} />
      </mesh>
    </group>
  );
}