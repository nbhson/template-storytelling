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
 * The floating intelligence core — the storyteller of the page. Built purely
 * procedurally so the same scene can be swapped for a GLB without touching
 * the timeline.
 *
 * Layers (back → front):
 *   1. Aura            — wide volumetric halo (component 03)
 *   2. Glass shell     — iridescent fresnel glass, fades open on coreReveal
 *                        so the inner glow can breathe through (component 00)
 *   3. Metallic frame  — brushed-metal torus rings (component 01)
 *   4. Core glow       — hot breathing center (component 02)
 *   5. Holographic rings + connection lines — Deep Dive surprise moments
 *   6. Light sweep     — a band of light traveling across the model
 *
 * Scroll drives (ALL from the master snapshot — never a second timeline):
 *   - group position/scale (modelX / modelY / modelScale)
 *   - group.rotation.y (the entire choreographed spin)
 *   - `explode` — Deep Dive separates shell/frame/glow/aura into floating parts
 *   - `coreReveal` — the "core opening" surprise (Technology beat)
 *   - `rings` / `connections` — Deep Dive holographics
 *   - `highlight` — Feature Showcase: each card lights its matching component
 *   - `sweep` — a light band travels across the model
 *   - shader uniforms (uAbsorption, uOpacity, uIntensity, uBloom)
 *   - idle floating + slow rotation + motion-reactive wobble (always-on motion)
 */

/** Where each part rests when exploded (Deep Dive). [x, y, z] */
const EXPLODED: Record<string, [number, number, number]> = {
  shell: [-2.4, 1.3, 0.6],
  frame: [2.1, 1.5, -0.4],
  glow: [-0.3, -1.9, 0.4],
  aura: [1.1, -0.6, -2.0],
};

/** Connection pairs — index into EXPLODED keys, in [from, to] order. */
const CONNECTION_PAIRS: [string, string][] = [
  ['shell', 'frame'],
  ['frame', 'glow'],
  ['glow', 'aura'],
  ['aura', 'shell'],
];

export function AiCore() {
  const groupRef = useRef<THREE.Group | null>(null);
  const shellRef = useRef<THREE.Group | null>(null);
  const frameRef = useRef<THREE.Group | null>(null);
  const glowRef = useRef<THREE.Mesh | null>(null);
  const glowMatRef = useRef<THREE.MeshBasicMaterial | null>(null);
  const auraRef = useRef<THREE.Mesh | null>(null);
  const ringsRef = useRef<THREE.Group | null>(null);
  const linesRef = useRef<THREE.Group | null>(null);
  const sweepRef = useRef<THREE.Mesh | null>(null);
  const frameBandMatRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const frameBand2MatRef = useRef<THREE.MeshStandardMaterial | null>(null);

  const shellMaterial = useMemo(() => createGlassMaterial(), []);
  const glowMaterial = useMemo(() => createCoreGlowMaterial(), []);
  const auraMaterial = useMemo(() => createAuraMaterial(), []);

  // Springy per-frame scratch vectors — NO per-frame allocation.
  const scratch = useMemo(() => new THREE.Vector3(), []);
  const fromPos = useMemo(() => new THREE.Vector3(), []);
  const toPos = useMemo(() => new THREE.Vector3(), []);

  useFrame((state) => {
    const group = groupRef.current;
    if (!group) return;

    const snap = getScrollSnapshot();
    const time = state.clock.elapsedTime;

    // ------------------------- GROUP (position / scale / spin) ----------
    // Rotation: the choreographed spin + a glacial idle spin + a tiny
    // motion-reactive wobble so the model never feels mechanical.
    const idleSpin = time * 0.04;
    const motionWobble = Math.sin(time * 3.2) * snap.motion * 0.06;
    group.rotation.y = idleSpin + snap.rotationY + motionWobble;

    // Breathing float — alive even when standing still. Scroll velocity adds
    // a gentle bob so movement feels physical.
    group.position.y =
      Math.sin(time * 0.6) * 0.12 + snap.modelY + snap.motion * 0.08;
    group.position.x = snap.modelX;
    group.scale.setScalar(snap.modelScale * (1 - snap.explode * 0.12));

    // ---------------------- EXPLODE (Deep Dive) -------------------------
    const e = snap.explode;

    // Glass shell — flies to its rest spot. On coreReveal the shader fades
    // the glass out (uOpacity) so the inner glow shines through.
    if (shellRef.current) {
      scratch.set(EXPLODED.shell[0], EXPLODED.shell[1], EXPLODED.shell[2]);
      shellRef.current.position.copy(scratch).multiplyScalar(e);
      shellRef.current.rotation.set(e * 0.3, e * 0.5, e * 0.12);
    }

    // Frame — drifts and tilts.
    if (frameRef.current) {
      scratch.set(EXPLODED.frame[0], EXPLODED.frame[1], EXPLODED.frame[2]);
      frameRef.current.position.copy(scratch).multiplyScalar(e);
      frameRef.current.rotation.set(e * 0.35, 0, e * 0.25);
    }

    // Glow — the reasoning heart. Stays bright, drifts slightly.
    if (glowRef.current) {
      scratch.set(EXPLODED.glow[0], EXPLODED.glow[1], EXPLODED.glow[2]);
      glowRef.current.position.copy(scratch).multiplyScalar(e);
      glowRef.current.scale.setScalar(1 - e * 0.15 + snap.coreReveal * 0.3);
    }

    // Aura — drifts backward into the fog.
    if (auraRef.current) {
      scratch.set(EXPLODED.aura[0], EXPLODED.aura[1], EXPLODED.aura[2]);
      auraRef.current.position.copy(scratch).multiplyScalar(e);
      auraRef.current.scale.setScalar(1 + e * 0.5 + snap.coreReveal * 0.4);
    }

    // ------------------------ CORE OPENING (surprise) -------------------
    // The shell glass recedes and the hot core flares — the moment of reveal.
    const glassOpacity = 0.85 * (1 - snap.coreReveal * 0.72) + e * 0.15;
    (shellMaterial.uniforms as unknown as GlassUniforms).uOpacity.value =
      Math.max(0, glassOpacity);

    // Fade the inner glow hotter while the shell is open.
    (glowMaterial.uniforms as unknown as CoreGlowUniforms).uIntensity.value =
      0.9 + snap.progress * 0.3 + snap.coreReveal * 0.8 + snap.motion * 0.2;

    // ------------------- HOLOGRAPHIC RINGS (Deep Dive) ------------------
    if (ringsRef.current) {
      const s = 1 + snap.rings * 1.6 + e * 0.5;
      ringsRef.current.scale.setScalar(s);
      ringsRef.current.rotation.z = time * 0.12;
      ringsRef.current.rotation.x = Math.sin(time * 0.18) * 0.2;
      ringsRef.current.visible = snap.rings > 0.02;
      ringsRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          (child.material as THREE.MeshBasicMaterial).opacity =
            snap.rings * 0.55;
        }
      });
    }

    // ------------------- CONNECTION LINES (Deep Dive) -------------------
    if (linesRef.current) {
      linesRef.current.visible = snap.connections > 0.02;
      // Stretch the lines live toward the parts' current positions.
      linesRef.current.traverse((child) => {
        if (child instanceof THREE.Line) {
          (child.material as THREE.LineBasicMaterial).opacity =
            snap.connections * 0.7;
        }
      });
    }

    // ------------------- FEATURE HIGHLIGHT (Showcase) -------------------
    const hActive = snap.highlight >= 0;
    const hl = Math.max(0, snap.highlight);

    // Shell highlight (0) — brighten the rim color through the shader.
    const shellRim = hActive && hl === 0 ? '#d2e8ff' : '#9db4ff';
    (shellMaterial.uniforms as unknown as GlassUniforms).uRimColor.value.set(
      shellRim,
    );
    if (hActive && hl === 0) {
      (shellMaterial.uniforms as unknown as GlassUniforms).uOpacity.value =
        Math.max(
          (shellMaterial.uniforms as unknown as GlassUniforms).uOpacity.value,
          0.55,
        );
    }

    // Frame highlight (1) — the metal bands glow.
    if (frameBandMatRef.current) {
      const boost = hActive && hl === 1 ? 0.4 : 0;
      frameBandMatRef.current.emissive.setHex(0x111111);
      frameBandMatRef.current.emissiveIntensity = boost;
    }
    if (frameBand2MatRef.current) {
      const boost = hActive && hl === 1 ? 0.4 : 0;
      frameBand2MatRef.current.emissive.setHex(0x111111);
      frameBand2MatRef.current.emissiveIntensity = boost;
    }

    // Glow highlight (2).
    if (glowMatRef.current) {
      glowMatRef.current.color.set(hActive && hl === 2 ? '#7df5ff' : '#2fd9ff');
      glowMatRef.current.opacity =
        0.9 + snap.coreReveal * 0.2 + (hActive && hl === 2 ? 0.3 : 0);
    }

    // Aura highlight (3) — shift the halo color and bloom through the shader.
    (auraMaterial.uniforms as unknown as AuraUniforms).uColor.value.set(
      hActive && hl === 3 ? '#ffd27a' : '#4f6bff',
    );
    (auraMaterial.uniforms as unknown as AuraUniforms).uBloom.value =
      0.8 +
      snap.progress * 0.4 +
      snap.coreReveal * 0.5 +
      (hActive && hl === 3 ? 0.45 : 0);

    // ------------------- LIGHT SWEEP (Technology + Showcase) ------------
    if (sweepRef.current) {
      // The band travels across X; opacity peaks mid-travel and scales with
      // the scrubbed `sweep` value — follow-through, not a hard cut.
      const band = sweepRef.current;
      const t = (snap.sweep + time * 0.02) % 1;
      band.position.x = -4 + t * 8;
      const mat = band.material as THREE.MeshBasicMaterial;
      mat.opacity =
        Math.min(0.35, snap.sweep * Math.max(0, 1 - Math.abs(t - 0.5) * 2.4));
    }

    // ------------------------- SHADER UNIFORMS --------------------------
    (shellMaterial.uniforms as unknown as GlassUniforms).uTime.value = time;
    (shellMaterial.uniforms as unknown as GlassUniforms).uAbsorption.value =
      0.2 + snap.progress * 0.3 + snap.explode * 0.25;
    (glowMaterial.uniforms as unknown as CoreGlowUniforms).uTime.value = time;
    (auraMaterial.uniforms as unknown as AuraUniforms).uTime.value = time;
  });

  return (
    <group ref={groupRef}>
      {/* Layer 1 — volumetric halo (component 03) */}
      <mesh ref={auraRef} material={auraMaterial}>
        <planeGeometry args={[7.2, 7.2]} />
      </mesh>

      {/* Layer 2 — glass shell (component 00). The glass shader fades it open
          on coreReveal via uOpacity, revealing the hot center. */}
      <group ref={shellRef}>
        <mesh material={shellMaterial} castShadow>
          <icosahedronGeometry args={[1.5, 32]} />
        </mesh>
      </group>

      {/* Layer 3 — metallic frame (component 01) */}
      <group ref={frameRef}>
        <mesh castShadow>
          <torusGeometry args={[1.9, 0.045, 24, 96]} />
          <meshStandardMaterial
            color="#c7d2fe"
            metalness={0.95}
            roughness={0.25}
            envMapIntensity={1.4}
          />
        </mesh>
        <mesh rotation={[Math.PI / 2.2, 0.4, 0]} castShadow>
          <torusGeometry args={[2.1, 0.03, 24, 96]} />
          <meshStandardMaterial
            ref={frameBandMatRef}
            color="#b6c4ff"
            metalness={1}
            roughness={0.35}
            envMapIntensity={1.2}
          />
        </mesh>
        <mesh rotation={[Math.PI / 1.6, -0.3, 0.6]} castShadow>
          <torusGeometry args={[2.3, 0.02, 24, 96]} />
          <meshStandardMaterial
            ref={frameBand2MatRef}
            color="#ffe3a3"
            metalness={0.9}
            roughness={0.3}
            envMapIntensity={1.1}
          />
        </mesh>
      </group>

      {/* Layer 4 — breathing glow center (component 02) */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.85, 64, 64]} />
        <meshBasicMaterial
          ref={glowMatRef}
          color="#2fd9ff"
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Layer 5a — Holographic rings (Deep Dive surprise) */}
      <group ref={ringsRef} visible={false}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.5, 1.62, 96]} />
          <meshBasicMaterial
            color="#67e8f9"
            transparent
            opacity={0}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh rotation={[Math.PI / 2.6, 0.4, 0]}>
          <ringGeometry args={[2.1, 2.24, 96]} />
          <meshBasicMaterial
            color="#a78bfa"
            transparent
            opacity={0}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh rotation={[Math.PI / 1.8, -0.5, 0.3]}>
          <ringGeometry args={[2.8, 2.9, 96]} />
          <meshBasicMaterial
            color="#7c8cff"
            transparent
            opacity={0}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* Layer 5b — Connection lines between exploded parts (Deep Dive) */}
      <group ref={linesRef} visible={false}>
        {CONNECTION_PAIRS.map(([aKey, bKey], i) => {
          const a = EXPLODED[aKey];
          const b = EXPLODED[bKey];
          fromPos.set(a[0], a[1], a[2]);
          toPos.set(b[0], b[1], b[2]);
          const positions = new Float32Array([
            fromPos.x,
            fromPos.y,
            fromPos.z,
            toPos.x,
            toPos.y,
            toPos.z,
          ]);
          return (
            <line key={i}>
              <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
              </bufferGeometry>
              <lineBasicMaterial
                color="#38bdf8"
                transparent
                opacity={0}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </line>
          );
        })}
      </group>

      {/* Layer 6 — Dynamic light sweep (Technology + Showcase surprise) */}
      <mesh ref={sweepRef} position={[-4, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <planeGeometry args={[0.5, 14]} />
        <meshBasicMaterial
          color="#8ab4ff"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
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