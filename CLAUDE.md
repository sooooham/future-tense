# Future: Tense — project guide for Claude Code

Interactive scroll story (portfolio). Paldi, Ahmedabad, 2070. Plain HTML/CSS/JS, no build step.
Run: open index.html with a local server (VS Code "Live Server" or `npx serve .`).

Files: index.html · css/style.css · js/story.js (ALL copy, prices, meter effects, flags, callbacks — edit story here) · js/engine.js (scroll camera, stages, state, gates) · js/ending.js (receipt charts, decode, verdict) · js/audio.js (generated sound) · assets/img (skies, mirror-tiled grounds .webp) · assets/svg (vector illustrations, walker, door raft) · docs/frames (Figma key frames = visual targets).

Design source: Figma file vtiPJRHhvuKWVSVISilDcR, page "v2 · Redesign — Ahmedabad 2070". HANDOFF.md has the full spec and current build status. Read it before changing anything.

Rules: keep the identity (plum/rust/tan, Tomorrow + B612 Mono, highlight-band captions, purple choice cards, grain). Vector illustrations for objects, images only for skies/grounds. Gujarati always with English. No hard cuts between worlds. Captions ≤ 18 words. Must not look AI-generated (no glow-everything, no glossy gradients, no generic dashboard look). Check contrast (≥ 4.5:1). Respect prefers-reduced-motion. Test at 1440×900 and 390×844.

Story logic lives only in story.js — never hard-code copy in engine.js or ending.js.

Before committing: play three paths (frugal, rich, helper) and check locks, callbacks, receipt totals and verdict. A `?debug` URL flag that jumps to a beat and prints state is welcome.

Working style: show progress early, ask Soham before big direction changes, keep it simple and communicative.

Deploy: GitHub Pages from main branch root.
