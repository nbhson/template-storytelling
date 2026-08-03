import * as THREE from 'three';

/**
 * AuraMaterial
 * -------------
 * Broad volumetric halo behind the AI Core. Purely additive, driven by the
 * scroll timeline via `uBloom` (intensity) and `uPulse` (speed of the idle sway).
 */
export interface AuraUniforms extends Record<string, THREE.IUniform> {
  uTime: THREE.IUniform<number>;
  uBloom: THREE.IUniform<number>;
  uColor: THREE.IUniform<THREE.Color>;
}

const vertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  varying vec2 vUv;

  uniform float uTime;
  uniform float uBloom;
  uniform vec3 uColor;

  void main() {
    // Radial falloff from the center (0, 0).
    vec2 center = vUv - 0.5;
    float dist = length(center);

    // Soft gaussian-ish halo.
    float halo = exp(-dist * dist * 22.0);

    // Slow rotating anisotropy.
    float angle = atan(center.y, center.x);
    float swirl = sin(angle * 3.0 + uTime * 0.35) * 0.5 + 0.5;
    float shaped = halo * (0.7 + swirl * 0.3);

    float alpha = clamp(shaped * uBloom, 0.0, 1.0);
    gl_FragColor = vec4(uColor, alpha);
  }
`;

export function createAuraMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uBloom: { value: 1 },
      uColor: { value: new THREE.Color('#5b6cff') },
    },
  });
}