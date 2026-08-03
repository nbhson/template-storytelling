'use client';

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { getScrollSnapshot } from '@/lib/scroll-state';
import type { PerspectiveCamera as TPerspectiveCamera } from 'three';

/**
 * CameraRig
 * ---------
 * The camera is the narrator. It never gets its own competing tweens — it reads
 * the master timeline's snapshot every frame and interpolates toward it, which
 * gives every movement a heavy, physical inertia (Apple-style).
 *
 * Timeline → snapshot fields consumed here:
 *   z    — primary push-in / pull-back (Problem, Solution, CTA)
 *   camX — lateral orbit (Solution moves right, Technology recenters)
 *   camY — height shift (Technology rises for the exploded view)
 *   camZ — extra depth for the deepest Technology close-up
 *
 * Hero parallax fades out as the story progresses so the camera can commit to
 * the narrative arcs. A gentle FOV "breath" adds cinematic pressure on zooms.
 */
const base = new THREE.Vector3(0, 0, 10);
const look = new THREE.Vector3(0, 0, 0);

// Cached scratch — no per-frame allocation.
const targetPos = new THREE.Vector3();

export function CameraRig() {
  const { camera } = useThree();
  const persp = camera as TPerspectiveCamera;
  const mouseX = useRef(0);
  const mouseY = useRef(0);

  useFrame((state, delta) => {
    const snap = getScrollSnapshot();

    // Smooth mouse tracking for hero parallax.
    const t = 1 - Math.exp(-4 * delta);
    mouseX.current += (state.pointer.x - mouseX.current) * t;
    mouseY.current += (state.pointer.y - mouseY.current) * t;

    // Base position from the timeline snapshot.
    targetPos.set(
      base.x + snap.camX,
      base.y + snap.camY,
      base.z + snap.z + snap.camZ,
    );

    // Parallax only matters while the core is centered (hero beat).
    const parallax = 1 - Math.min(1, Math.max(0, snap.progress / 0.18));
    targetPos.x += mouseX.current * 0.6 * parallax;
    targetPos.y += mouseY.current * 0.4 * parallax;

    // Physical inertia — the camera lags behind the timeline slightly.
    const lerp = 1 - Math.exp(-2.2 * delta);
    camera.position.lerp(targetPos, lerp);

    camera.lookAt(look);

    // Micro z-tilt from the mouse while in the hero.
    camera.rotation.z = parallax * 0.05 * -mouseX.current;

    // FOV breathing — subtle pressure on push-ins, relief on pull-backs.
    const targetFov = 35 - snap.progress * 3;
    persp.fov += (targetFov - persp.fov) * lerp;
    persp.updateProjectionMatrix();
  });

  return null;
}