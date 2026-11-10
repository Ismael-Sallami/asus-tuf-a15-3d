# CLAUDE.md

This file provides guidance to Claude Code when working with the ASUS TUF Gaming A15 3D Teardown project.

## Commands

- Dev server: `npm run dev` (starts Vite dev server on port 5173/5174)
- Build: `npm run build` (`tsc && vite build`)
- Preview: `npm run preview -- --port 5173 --host`
- Typecheck: `npx tsc --noEmit`

## Architecture & Code Organization

- `src/main.tsx`: React 18 root entry point.
- `src/App.tsx`: Main orchestrator syncing GSAP ScrollTrigger with the 3D viewport, telemetry metrics, and UI state.
- `src/three/LaptopModel.ts`: Parametric 3D model of the ASUS TUF Gaming A15 (FA507) with decoupled layers (D-Cover honeycomb base, 90Wh battery, stereo speakers, motherboard PCB, Ryzen 7 CPU, RTX 4060 GPU, DDR5 RAM, PCIe 4.0 SSD, Wi-Fi 6E, copper heatpipes, dual 84-blade Arc Flow fans, thermal airflow particles, C-Cover keyboard deck with translucent WASD keys, 144Hz IPS display).
- `src/three/SceneManager.ts`: Three.js lifecycle manager with ACES Filmic tone mapping, TUF studio lights (amber #FFB800, cyan #00E5FF), OrbitControls for 360° free inspection, and Raycaster detection.
- `src/three/proceduralTextures.ts`: 2D canvas texture generators for PCB traces, honeycomb vents, 144Hz display HUD, and battery labels.
- `src/components/ArmouryCrateHUD.tsx`: Tactical floating telemetry HUD with live RPM gauge, silicon temperatures, thermal profiles (Silent, Performance, Turbo), and layer selector.
- `src/components/HeaderNav.tsx`: Top bar with TUF branding, view mode toggles (Normal, Thermal, X-Ray), 360° orbit inspection, and audio toggle.
- `src/components/ComponentModal.tsx`: Technical engineering spec sheet for inspected parts.
- `src/components/ScrollStorySections.tsx`: Scrollytelling track linked to GSAP ScrollTrigger.
- `src/utils/soundEffects.ts`: Procedural Web Audio API sound synthesizer (mechanical clicks, turbine hums, alarms).
