Paste this into Claude Code in VS Code (with this folder open):

---

Read CLAUDE.md and HANDOFF.md fully, then look at every image in docs/frames — those are the locked Figma v2 frames and the visual target. js/story.js, js/audio.js, index.html and all assets are already done; don't rewrite them unless something is broken (story text changes go in story.js only).

Build the rest in this order, showing me progress after each step:

1. css/style.css per HANDOFF §3, and js/engine.js per HANDOFF §4 (camera, gates, worlds with the soft masked morph, parallax props from story.js, walker/raft, HUD: logo FLIP, readout, wallet, stamp, messages, meters, hint, progress, sound). Get the hero → Carbon ID → Work world playable first and tell me to open it with Live Server.
2. Checkpoints and consequences (HANDOFF §4 stages), then all six worlds including flood water/rain and the match phone.
3. js/ending.js per HANDOFF §5: receipt printing, decode notes generated from the run, verdict screen, replay.
4. Add a `?debug` mode (jump to beat N, show state) and play the test paths in HANDOFF §6. Report any numbers that look wrong.
5. Check 1440×900 and 390×844, prefers-reduced-motion, keyboard-only play, contrast.

Rules: keep the original identity, simple and communicative, must not look AI-generated. Ask me before any big direction change. When done, initialise git and make the first commit (don't push yet).
