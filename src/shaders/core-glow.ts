import * as THREE from 'three';

/**
 * CoreGlowMaterial
 * ----------------
 * A pulsating spherical glow that sits inside the AI Core's transparent center.
 * The scroll timeline drives `uIntensity`; the breathing `uTime` keeps it alive.
 */
export interface CoreGlowUniforms extends Record<string, THREE.IUniform> {
  uTime: THREE.IUniform<number>;
  uIntensity: THREE.IUniform<number>;
  uColorA: THREE.IUniform<THREE.Color>;
  uColorB: THREE.IUniform<THREE.Color>;
}

const vertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  varying float vNoise;

  uniform float uTime;
  uniform float uIntensity;

  // Cheap 3D value noise, good enough for a soft breathing pulse.
  float hash(vec3 p) {
    return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453123);
  }

  float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x),
          mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
      mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
          mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
      f.z);
  }

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vView = normalize(-mvPosition.xyz);

    // Spherical breathing wobble — subtle, alive.
    float pulse = sin(uTime * 1.6 + length(position) * 6.0) * 0.5 + 0.5;
    vec3 displaced = position * (1.0 + pulse * 0.04 * uIntensity);
    vNoise = noise(position * 3.0 + uTime * 0.4);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  varying float vNoise;

  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uIntensity;

  void main() {
    // Fresnel rim — brightest at the silhouette, transparent in the middle.
    float fresnel = pow(1.0 - abs(dot(normalize(vNormal), normalize(vView))), 3.0);

    float body = smoothstep(0.3, 0.8, vNoise);
    vec3 tint = mix(uColorB, uColorA, body);

    vec3 color = tint * (fresnel * 1.6 + body * 0.4);
    float alpha = clamp((fresnel * 0.85 + body * 0.25) * uIntensity, 0.0, 1.0);

    gl_FragColor = vec4(color * uIntensity, alpha);
  }
`;

export function createCoreGlowMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uIntensity: { value: 1 },
      uColorA: { value: new THREE.Color('#7c8cff') },
      uColorB: { value: new THREE.Color('#a78bfa') },
    },
  });
}