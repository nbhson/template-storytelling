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
 * gives every movement a heavy, physical inertia (Apple-style). The camera also
 * ORBITS AROUND A MOVING LOOK-TARGET, which is what makes scrolling feel like
 * directing a film camera around the object rather than just sliding a rig.
 *
 * Timeline → snapshot fields consumed here:
 *   z       — primary push-in / pull-back across the whole journey
 *   camX    — lateral orbit (Discovery left, Technology crosses to the right,
 *             Deep Dive circles around, CTA recenters)
 *   camY    — crane up/down over the model
 *   camZ    — extra depth for the deepest close-ups (Deep Dive)
 *   roll    — subtle cinematic roll (set to 0 during CTA alignment)
 *   fov     — pressure on push-ins, relief on pull-backs
 *   targetX — look-target orbit X (lets the camera circle AROUND the model)
 *   targetY — look-target crane Y (deep-dive arcs look over the top)
 *   motion  — scroll velocity: tiny shake on fast scroll makes movement feel
 *             physical rather than mathematical
 *
 * Hero parallax fades out as the story progresses so the camera can commit to
 * the narrative arcs.
 */

// Fixed base — the timeline encodes all travel as offsets from this.
const BASE = new THREE.Vector3(0, 0, 10);

// Cached scratch — no per-frame allocation.
const targetPos = new THREE.Vector3();
const targetLook = new THREE.Vector3();

export function CameraRig() {
  const { camera } = useThree();
  const persp = camera as TPerspectiveCamera;
  const mouseX = useRef(0);
  const mouseY = useRef(0);

  // Smoothed camera-roll value so roll never jitters (follow-through).
  const rollSmooth = useRef(0);

  useFrame((state, delta) => {
    const snap = getScrollSnapshot();

    // Smooth mouse tracking for hero parallax.
    const t = 1 - Math.exp(-4 * delta);
    mouseX.current += (state.pointer.x - mouseX.current) * t;
    mouseY.current += (state.pointer.y - mouseY.current) * t;

    // -------------------- CAMERA POSITION -------------------------------
    // The timeline encodes every dolly/orbit as an offset from the base.
    targetPos.set(
      BASE.x + snap.camX,
      BASE.y + snap.camY,
      BASE.z + snap.z + snap.camZ,
    );

    // Parallax only matters while the core is centered (hero beat).
    const parallax = 1 - Math.min(1, Math.max(0, snap.progress / 0.18));
    targetPos.x += mouseX.current * 0.6 * parallax;
    targetPos.y += mouseY.current * 0.4 * parallax;

    // -------------------- LOOK TARGET (orbit center) --------------------
    // The camera circles AROUND the model by moving the look-target with the
    // timeline while offsetting our own position — the "directing a camera"
    // feeling. targetX/Y add fly-in arcs over the top.
    targetLook.set(
      snap.targetX + mouseX.current * 0.25 * parallax,
      snap.targetY + mouseY.current * 0.18 * parallax,
      0,
    );

    // Physical inertia — the camera lags behind the timeline slightly.
    const lerp = 1 - Math.exp(-2.2 * delta);
    camera.position.lerp(targetPos, lerp);
    camera.lookAt(targetLook);

    // -------------------- ROLL (subtle cinematic tilt) ------------------
    // Timeline roll + micro mouse roll in hero. Smoothed for follow-through.
    const targetRoll =
      snap.roll + parallax * 0.05 * -mouseX.current;
    rollSmooth.current += (targetRoll - rollSmooth.current) * lerp;
    camera.rotation.z = rollSmooth.current;

    // Micro camera shake on fast scroll — energy follows intent.
    const shake = snap.motion * 0.015;
    camera.position.x += (Math.random() - 0.5) * shake;
    camera.position.y += (Math.random() - 0.5) * shake;

    // -------------------- FOV (cinematic pressure) ----------------------
    // The timeline's fov field controls breathing directly (35 default).
    const fovTarget = snap.fov || 35;
    persp.fov += (fovTarget - persp.fov) * lerp;
    persp.updateProjectionMatrix();
  });

  return null;
}