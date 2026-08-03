'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { particleBudget, deviceQuality } from '@/lib/device-quality';
import { getScrollSnapshot } from '@/lib/scroll-state';

/**
 * Particles
 * ---------
 * One InstancedMesh renders the entire floating dust field — no draw calls per
 * particle, so we can afford thousands at 60 FPS.
 *
 * The timeline drives `particleSpread` (the field breathes outward through the
 * story) and the whole group slowly rotates, giving deep parallax as the
 * camera orbits.
 */

const COUNT = particleBudget[deviceQuality];

// Cached scratch objects — avoid per-frame allocation.
const m4 = new THREE.Matrix4();
const p = new THREE.Vector3();
const q = new THREE.Quaternion();
const euler = new THREE.Euler();
const s = new THREE.Vector3(1, 1, 1);

const vertexShader = /* glsl */ `
  attribute float aScale;
  attribute vec3 aColor;

  varying vec3 vColor;

  uniform float uTime;
  uniform float uSpread;
  uniform float uMotion;

  void main() {
    vColor = aColor;

    vec3 pos = position;

    // Slow nebula drift — the dust is alive, not static.
    float drift = sin(uTime * 0.12 + pos.x * 0.02 + pos.y * 0.03) * 0.6;
    pos += vec3(drift, drift * 0.6, -drift * 0.3);

    // Scroll-driven dispersal.
    pos *= 1.0 + uSpread * 0.35;

    // Energy follows intent — fast scroll pushes the dust outward harder so
    // particles visibly react to how quickly the user is moving.
    pos *= 1.0 + uMotion * 0.22;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

    gl_PointSize = aScale * (90.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = /* glsl */ `
  varying vec3 vColor;

  uniform float uOpacity;

  void main() {
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    float alpha = smoothstep(0.5, 0.05, dist) * 0.75 * uOpacity;
    gl_FragColor = vec4(vColor, alpha);
  }
`;

interface ParticleSeed {
  position: THREE.Vector3;
  scale: number;
  color: THREE.Color;
}

function buildGeometry(seeds: ParticleSeed[]): THREE.BufferGeometry {
  const count = seeds.length;
  const geo = new THREE.BufferGeometry();
  geo.setAttribute(
    'position',
    new THREE.InstancedBufferAttribute(new Float32Array(count * 3), 3),
  );
  const scales = new Float32Array(count);
  const colors = new Float32Array(count * 3);
  seeds.forEach((seed, i) => {
    // Instance positions are (0,0,0) — the real position lives in the matrix.
    scales[i] = seed.scale;
    colors[i * 3 + 0] = seed.color.r;
    colors[i * 3 + 1] = seed.color.g;
    colors[i * 3 + 2] = seed.color.b;
  });
  geo.setAttribute('aScale', new THREE.InstancedBufferAttribute(scales, 1));
  geo.setAttribute('aColor', new THREE.InstancedBufferAttribute(colors, 3));
  return geo;
}

export function Particles() {
  const meshRef = useRef<THREE.InstancedMesh | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);

  const seeds = useMemo<ParticleSeed[]>(() => {
    const arr: ParticleSeed[] = [];
    const palette = ['#7c8cff', '#a5b4fc', '#67e8f9', '#a78bfa', '#e2e8f0'];
    for (let i = 0; i < COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 5 + Math.random() * 9;
      const y = (Math.random() - 0.5) * 14;
      arr.push({
        position: new THREE.Vector3(
          Math.cos(angle) * radius,
          y,
          (Math.random() - 0.5) * 10 - 2,
        ),
        scale: 0.8 + Math.random() * 2.5,
        color: new THREE.Color(
          palette[(Math.random() * palette.length) | 0],
        ).multiplyScalar(0.7 + Math.random() * 0.3),
      });
    }
    return arr;
  }, []);

  // One material, one geometry — created once, disposed once.
  const { material, geometry } = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uSpread: { value: 1 },
        uOpacity: { value: 1 },
        uMotion: { value: 0 },
      },
    });
    return { material: mat, geometry: buildGeometry(seeds) };
  }, [seeds]);

  useFrame((state, delta) => {
    const snapshot = getScrollSnapshot();
    const mesh = meshRef.current;
    const group = groupRef.current;

    if (mesh) {
      material.uniforms.uTime.value = state.clock.elapsedTime;
      material.uniforms.uSpread.value = snapshot.particleSpread;
      material.uniforms.uOpacity.value = snapshot.particleOpacity;
      // Smooth the scroll-velocity reaction so it doesn't jitter.
      material.uniforms.uMotion.value +=
        (snapshot.motion * 0.8 - material.uniforms.uMotion.value) *
        (1 - Math.exp(-4 * delta));

      for (let i = 0; i < COUNT; i++) {
        const seed = seeds[i];
        p.copy(seed.position);
        // Individual twinkle — offset in time so it's not uniform.
        p.y += Math.sin(state.clock.elapsedTime * 0.2 + i) * 0.15;
        q.setFromEuler(euler.set(0, 0, 0));
        s.setScalar(seed.scale);
        m4.compose(p, q, s);
        mesh.setMatrixAt(i, m4);
      }
      mesh.instanceMatrix.needsUpdate = true;
    }

    // Whole field slowly counter-rotates against the camera - deep parallax.
    if (group) {
      const lerp = 1 - Math.exp(-2 * delta);
      group.rotation.y +=
        (0.02 - snapshot.progress * 0.3 - group.rotation.y) * lerp;
    }
  });

  // Cleanup — R3F disposes primitives automatically but we own the geometry.
  // (Returned via primitive so disposal is handled; no manual dispose needed.)

  return (
    <group ref={groupRef}>
      <primitive object={geometry} attach="geometry" />
      <instancedMesh
        ref={meshRef}
        args={[geometry, material, COUNT]}
        frustumCulled={false}
      />
    </group>
  );
}