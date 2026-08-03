import * as THREE from 'three';

/**
 * GlassMaterial
 * -------------
 * A layered, physically-inspired glass for the AI Core's shell:
 *
 * - Base transmission tint (deep navy).
 * - Fresnel-based specular rim for the "polished" edge.
 * - Scrolling `uAbsorption` deepens the glass as the timeline progresses.
 * - `uOpacity` lets the crew animate the shell fading in/out in the exploded view.
 */
export interface GlassUniforms extends Record<string, THREE.IUniform> {
  uTime: THREE.IUniform<number>;
  uOpacity: THREE.IUniform<number>;
  uAbsorption: THREE.IUniform<number>;
  uTint: THREE.IUniform<THREE.Color>;
  uRimColor: THREE.IUniform<THREE.Color>;
}

const vertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vView = normalize(-mvPosition.xyz);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;

  uniform float uTime;
  uniform float uOpacity;
  uniform float uAbsorption;
  uniform vec3 uTint;
  uniform vec3 uRimColor;

  void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(vView);
    float facing = abs(dot(N, V));

    // Fresnel — the silhouette catches a bright rim, the face stays clear.
    float fresnel = pow(1.0 - facing, 3.0);

    // Iridescence drift: a slow hue shift along the rim.
    float iri = sin(uTime * 0.5 + dot(N, vec3(1.0, 0.3, 0.7)) * 4.0) * 0.5 + 0.5;

    vec3 rim = mix(uRimColor, uTint, iri);
    vec3 base = uTint * (0.15 + uAbsorption * 0.5);

    vec3 color = mix(base, rim, fresnel);

    // Translucency + rim falloff. Scrolled "absorption" steals the light.
    float alpha = clamp((0.05 + fresnel * 0.95) * uOpacity * (1.0 - uAbsorption * 0.4), 0.0, 1.0);

    gl_FragColor = vec4(color, alpha);
  }
`;

export function createGlassMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.NormalBlending,
    uniforms: {
      uTime: { value: 0 },
      uOpacity: { value: 0.85 },
      uAbsorption: { value: 0.25 },
      uTint: { value: new THREE.Color('#1b2740') },
      uRimColor: { value: new THREE.Color('#9db4ff') },
    },
  });
}