# MORPHIN · template-storytelling

A cinematic, scroll-driven landing page template. The whole page is **one continuous animated experience** — scrolling drives the camera, the 3D model, lighting, particles, and every text element through a **single GSAP master timeline**.

Built with the modern AI-product aesthetic (Linear / Stripe / Apple / Vercel): dark, minimal, glassmorphism where appropriate, large typography, and buttery 60 FPS.

![Stack](https://img.shields.io/badge/Next.js%2015-000000?logo=nextdotjs&logoColor=white) ![React 19](https://img.shields.io/badge/React%2019-61DAFB?logo=react&logoColor=black) ![Three.js](https://img.shields.io/badge/Three.js-000000?logo=threedotjs) ![GSAP](https://img.shields.io/badge/GSAP-88CE02) ![Tailwind](https://img.shields.io/badge/TailwindCSS-06B6D4?logo=tailwindcss&logoColor=white)

---

## ✨ Highlights

- **One timeline, one story** — GSAP ScrollTrigger scrub drives a single animated `story` object; every consumer (camera rig, model, lights, particles, DOM text, progress bar) reads the same progress value. No competing timelines.
- **Scroll-driven 3D** — React Three Fiber scene with a glass + metal "AI core", HDR environment, bloom, depth of field, soft shadows, instanced particles, and custom GLSL shaders (glass / core glow / aura) with scroll-uniforms.
- **Cinematic motion** — Lenis smooth scroll fused to the GSAP ticker; physical inertia on the camera, eased non-linear movement, anticipation and follow-through, overlapped transitions (Apple-product-page feel).
- **60 FPS by design** — no React state in the render loop, pooled math objects, memoized materials, `InstancedMesh`, dynamic DPR, device-quality budget for post-processing, lazy-loaded code-split 3D chunk.
- **Accessible & responsive** — reduced-motion support, focus rings, semantic sections, mobile-friendly.

## 🎬 Story beats

| Segment | Scroll progress | What happens |
|---|---|---|
| Hero | `0 – 18%` | Core centered, huge typography reveal, mouse parallax |
| Problem | `18 – 38%` | Camera pushes in, core rotates ~20°, copy fades in |
| Solution | `38 – 60%` | Camera orbits right, feature cards cascade, particle field swells |
| Technology | `60 – 82%` | Exploded view — components separate & highlight, camera rises |
| CTA | `82 – 100%` | Everything aligns, camera pulls back, final call-to-action |

## 🧱 Tech stack

- React 19 · Next.js 15 (App Router) · TypeScript
- TailwindCSS
- Three.js · React Three Fiber · Drei · @react-three/postprocessing
- GSAP · ScrollTrigger · Lenis
- Framer Motion (UI micro-interactions only)

## 🚀 Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and scroll.

Production build:

```bash
npm run build
npm start
```

## 🗂 Project structure

```
src/
├─ animations/timeline.ts     ← THE master scroll timeline (sole source of truth)
├─ constants/timeline.ts      ← segment boundaries
├─ lib/
│  ├─ gsap.ts                 ← GSAP registered once, shared instance
│  ├─ easing.ts               ← cinematic easing curves
│  ├─ scroll-state.ts         ← module snapshot store (zero-alloc reads)
│  ├─ smooth-scroll.tsx       ← Lenis fused with GSAP ticker
│  ├─ device-quality.ts       ← GPU/pixel budget detection
│  └─ progress-ui.tsx         ← scroll-progress event bus
├─ shaders/                   ← custom GLSL: glass, core-glow, aura
├─ components/
│  ├─ 3d/                     ← Scene, AiCore, CameraRig, LightingRig, Particles, Effects
│  ├─ sections/               ← Hero · Problem · Solution · Technology · CTA
│  ├─ ui/                     ← Button, GlassCard, ProgressIndicator, Noise, BackgroundGradient
│  ├─ layout/                 ← Navbar, Footer
│  └─ hooks/                  ← ErrorBoundary
└─ app/                       ← App Router layout + page
```

## 🎨 Customizing

- **Story timing** — edit segment boundaries in `src/constants/timeline.ts`.
- **The 3D object** — `src/components/3d/AiCore.tsx` builds the core from primitives (torus, icosahedron, ring, core). Swap in your own GLB (with Draco/KTX2) by replacing the contents of `StageLoader` in `src/components/3d/Scene.tsx`.
- **Camera / lights / particles** — each has its own rig that reads the snapshot; tweak the `tl.to(story, {...})` tweens in `src/animations/timeline.ts`.
- **Effects budget** — `src/components/3d/Effects.tsx` + `src/lib/device-quality.ts` for low-power devices.

## 📄 License

MIT — free to use, fork, and remix for your own products and portfolios.