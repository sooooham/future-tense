# Future: Tense — Handoff (build phase, for Claude Code)

Updated 24 Oct 2026. Owner: Soham Sharma (portfolio project "DP-2").
This file + `js/story.js` are the source of truth. The design is LOCKED (Figma v2 page). Screenshots of the key frames are in `docs/frames/` — match them.

---

## 1. Build status

| Part | Status |
|---|---|
| `assets/svg/*` — 15 vector illustrations exported from Figma v2 (pols ×3, chabutra, mill, apartment, hospital, tower, dead tree, sapling, farm hut, Jhulta Minar, Teen Darwaza, Motera, embankment) + walker + door raft (with seated figure) + favicon | ✅ done |
| `assets/img/*` — 7 skies, 6 grounds pre-made as **mirror tiles** (`*-tile.webp`, image + flipped copy → seamless with `repeat-x`), footprint | ✅ done (~1 MB) |
| `docs/frames/*.webp` — K1 hero, K2 Carbon ID, K3 work, K5 water checkpoint, K6 consequence, K8 flood, K10 match, K11 verdict, K12 decode | ✅ done |
| `js/story.js` — all copy, worlds, beats, props placement, checkpoints with callbacks, verdicts, people strip data | ✅ done (review numbers while testing) |
| `js/audio.js` — Web Audio: drone/wind per world, rain, steps, duck + clock, debit/credit, stamp, printer | ✅ done |
| `index.html` — skeleton with all HUD / checkpoint / ending containers and IDs | ✅ done |
| `js/engine.js` | ❌ to build (plan in §4) |
| `css/style.css` | ❌ to build (§3) |
| `js/ending.js` | ❌ to build (§5) |
| Testing 3 paths, mobile, reduced motion | ❌ |
| README case-study polish, GitHub Pages, OG image | ❌ |

Known flag: `ground-city-tile.webp` (Work road) comes from a **Shutterstock preview** image — must be replaced before going public (draw a flat asphalt strip in CSS/SVG in the same palette, or a licensed image).

---

## 2. Locked design decisions (from Soham)

- Paldi, Ahmedabad. All in 2070, Feb → Dec: Work (Feb) → Water (Apr) → Food (Jun, Sanand) → Flood (Aug) → Health (Oct) → Match (Dec, repopulation — not romance).
- Protagonist = the player. Onboarding "**No ID, no water.** Sign here." Name prefilled CITIZEN-4417, editable. Every choice is logged and shown back as data.
- CCP wallet always on screen; every option shows its price; options lock if unaffordable ("NEED 60 CCP").
- Identity: plum `#6c5478`, rust `#8c5b3c`, tan band `#d6b98f`, Tomorrow + B612 Mono, Noto Sans Gujarati. Highlight-band captions, world tag "⦸ WATER", purple choice cards, grainy skies. Objects are flat vectors with light grain; skies & grounds stay images.
- No bridge anywhere. Landmarks only as hazed hints (Jhulta Minar, Teen Darwaza, Motera floodlights, riverfront embankment).
- Gujarati always paired with English. Notice order numbers small and light.
- Checkpoint = calm game checkpoint: CHECKPOINT n/6 bar, world dims/desaturates/blurs, question + 3 cards, "Press 1, 2 or 3". **No bracket panel, no clock ellipse.**
- Meters right edge: delta chip **above** icon, segment bar beside it, label under. Deltas inside the strip.
- Messages/alerts small, **under the wallet, top-left**.
- Proper contrast everywhere (readout line has a dark backing).
- Soft morph between worlds, never a hard cut or seam; no repeated identical buildings next to each other; one parallax camera.
- Flood water animates; flood rider sits on a floating door (also in Match, water receding).
- Ending: receipt prints → decode (slow, explained) → verdict + meters + question → replay / essay link.
- Must not look AI-generated.

Small deliberate deviation to confirm with Soham: Figma cards show A/B/C chips but the instruction says "Press 1, 2 or 3" — chips should show **1 / 2 / 3** so they match the keys.

---

## 3. Visual system (css/style.css)

Colours: night `#141215`, bone `#ece5d8`, bone-dim `#bdb8af`, ink `#221f1d`, plum `#6c5478`, rust `#8c5b3c`, tan `#d6b98f`, lit meter `#d8c09a`, debit `#b0573c`, alert `#e05a3a`, notice paper `#e8dcc4`, receipt paper `#f3efe6`.
Fonts: Tomorrow (Light Italic "Future:", ExtraBold "TENSE", Medium/SemiBold UI), B612 Mono (captions/body), Noto Sans Gujarati.

Layout (desktop, from the frames; horizon at **73% of height**, ground strip = bottom 27%):
- **Logo** docked top-left 24px/20px, rust box, ~20px font. Hero state: big plum box at left 10vw, top ~23vh, font `clamp(44px, 6.6vw, 112px)`. On "STEP INTO 2070" it shrinks into the corner (FLIP transform, uniform scale, ~1.1s, background plum → rust).
- **Readout** right of logo: "● PLACE · MON 2070   DATA   DATA" — B612 Mono 11px caps, dark backing `rgba(20,18,21,.72)`.
- **Wallet** under logo (top ~62px): "CARBON WALLET AMD-2070-4417" / big number + "CCP" + delta chip / 10-segment bar (1 seg = 10 CCP). Hero state: sits right (~76vw, 26vh) with caption "Your wallet. Always on screen." then docks with the logo.
- **Stamp** (DEBITED / 30 CCP, or CREDITED) — rust outline, rotated −8°, beside the wallet, punches in (scale 1.6→1) and fades after ~2.5s.
- **Messages** under the wallet: dark cards ~210px wide, header "● FROM · time" (red dot for alerts), body text; max 2, auto-dismiss ~9s.
- **Meters** slim translucent column on the right edge (see K3).
- **World tag** beside the walker's head: plum translucent box with ⦸ + world name (Tomorrow SemiBold, letterspaced).
- **Hint** "KEEP WALKING →" small dark pill bottom-centre; **progress bar** thin line at the very bottom with 6 checkpoint ticks; **sound toggle** bottom-right.
- **Captions**: B612 Mono ~1.35vw (min 15px), tan band `#d6b98f` behind text (inline, `box-decoration-break: clone`), ink text, `<b>` = rust bold. Keep left ≥ 250px on desktop so they never sit under the wallet/messages.
- **Notice**: paper card on a dark post, header band rust ("PUBLIC NOTICE" + small light order no.), title Tomorrow ExtraBold, big number rust ExtraBold, sub mono, Gujarati line in plum + "· English" mono italic. Slight rotation −2°.
- **Checkpoint** (K5): world gets `filter: brightness(.6) saturate(.5) blur(4px)` (~0.8s), dark scrim; bar "CHECKPOINT 2/6 | APR 2070 · WATER ▬▬▭▭▭▭"; question large Tomorrow Medium bone, centred; 3 cards in a row (stack on phone): deep plum `rgba(52,38,64,.92)`, key chip, price tag top-right (0 CCP neutral, debit rust fill, credit tan), title Tomorrow SemiBold, "why" B612 Mono italic. Hover/focus: bone border. Locked: dimmed + "NEED 60 CCP" / "NOT PERMITTED". "Press 1, 2 or 3" under.
- **Consequence** (K6): world colour returns; chosen card holds briefly, then a one-line aftermath in a tan band where the question was; stamp + wallet tween + meter ticks + message; scroll unlocks after ~1.5s and the hint appears.
- **Grain**: one fixed full-screen SVG-turbulence overlay, low opacity (≈.1), `mix-blend-mode: overlay`.
- Phone (≤760px or portrait): captions 90vw, chips/cards stack, meters compact, readout hides the data part.

---

## 4. Engine plan (js/engine.js) — what was designed, ready to implement

State: `S = {name, ccp, m:{P,E,W,C}, flags:Set, answers:{}, log:[{mon,label,ccp}], bal:[{mon:'JAN',ccp:100}], snaps:[{...m}], entered, signed}`; story functions get a read-only API `s = {has(f), ccp, m, name}`.

Camera: native scroll off. Wheel/touch/keys push `target`; `cur` eases to it (`k = 1-(1-.085)^(dt/16.7)`; faster with reduced motion). One beat = one viewport width `W`. `maxX = (N-1)*W`. (The v1 prototype engine in the artifact used the same approach.)

Gates: first beat whose gate isn't done limits `target` (`hero` → entered, `id` → signed, checkpoint id → answered). Pushing against a gate: thud + small shake of the card/ID. Scrolling on the hero = enter without sound (CTA click = enter with sound).

Worlds (soft morph): build one full-screen fixed container per run of beats with the same world. Layers inside, bottom→top: sky (cover image, ~1.3W wide, drifts 0.06×), grade (tint, `mix-blend-mode: color`, .3), far props (0.55×, hazed: lower opacity/contrast), horizon haze band, mid props (0.85×), ground (tile, `background-size: auto 100%`, `background-position-x: -cur`) or flood water / sea, near props + notices (1×), rain (flood).
Prop position: `left = (beat - run.first)*W*f + x*W`, layer `transform: translateX(-(cur - run.first*W)*f)`. Prop height = `svgHeight * s * H/982` (×.8 on phone). Bottom = ground height − `sink*H`. Natural sizes: pol-ochre 300, pol-mint 280, pol-rose 320, chabutra 300, apartment 270, hospital 290, tower 540, dead-tree 420, sapling 90, farm-hut 150, jhulta-minar 320, teen-darwaza 190, motera 160, mill 420; embankment uses explicit `w`/`h` (its SVG has preserveAspectRatio="none").
Morph: for each run after the first, boundary `B = run.first*W - .15W`, screen edge `e = B - cur`, feather `F = .45W`; mask the incoming run with `linear-gradient(90deg, transparent e-F/2, #000 e+F/2)` (also `-webkit-mask-image`). Fully past → mask none and hide the run below; not yet in view → hide. Put a soft haze band (`#join`) at the edge in the incoming world's haze colour.

Story layer (`#track`, 1×): captions (fade-up when their beat is within ~.6W), hero block, ID card, phone. Captions with `when`/function `html` are resolved the first time you approach the beat (re-resolved on replay).

Walker fixed ~7vw left, feet ~3% below the horizon, height ~.32H; bobs and leans only while moving; footprints drop every ~.09W into a 1× layer and fade (not on water). In `raft` worlds (flood, match) the walker fades out and the door raft bobs in the water instead. Hero: walker stands at ~66vw and walks to 7vw on enter.

Stages: `hero → walk → cp (choosing) → after (consequence, locked ~1.5s) → walk … → end`.
- Open checkpoint when `cur` reaches the gate beat. Resolve `opts(s)`, locks (`price<0 && !free && ccp < -price`), `because(s)` label.
- Choose (click or 1/2/3): flags, `ccp += price` (min 0), meters `+= fx` clamped 0–12, `log.push`, `bal.push({mon, ccp})`, `snaps.push`. Sounds: pick, debit/credit, stamp, meter ticks. Live-region announcement.
- `enter` callbacks run once when you reach a beat (fines, gifts, alerts) — they log CCP too.
- Readout + world tag + audio world follow the world under the camera centre.
- Last beat (`end: true`): after `END_CAPTION_DELAY` open the ending.
- Replay: keep name/signed, reset everything else, fade, jump to beat 2.

---

## 5. Ending plan (js/ending.js)

Hide the HUD except the logo; dark warm-grey background (K11/K12).
1. **Receipt** (paper `#f3efe6`, zig-zag bottom edge, ~360px wide) prints line by line with `AUDIO.printLine()`: header (AHMEDABAD RESOURCE AUTHORITY / CARBON CITIZEN LEDGER · 2070 / NAME · AMD-2070-4417 · PALDI); CCP balance step-line Jan→Dec (SVG; dots per checkpoint, months with a debit in rust, small labels like "−30 valve man", "+300 match"); four meter step-area charts with "6 → 12"; CHOICES LOGGED (month · choice · ±CCP, incl. fines/boat/callbacks, debits rust); CLOSING BALANCE; footer "Printed on recycled thermal paper · this receipt cost 0.002 CCP"; a rust "SURVIVED 2070" stamp. Button READ YOUR RECEIPT →.
2. **Decode** (K12): receipt left with numbered pins 1–4; right "WHAT YOUR RECEIPT SAYS", notes revealed one at a time, generated from the run: (1) balance story (lowest point and what changed it), (2) which meters rose together / fell together, (3) who paid for you (`STORY.PAID_FOR_YOU`) or, if nobody, who you held (`STORY.YOU_HELD`), (4) the match (one decision vs a year of work) or the 20% cut for declining. Button WHAT IT SAYS ABOUT YOU →.
3. **Verdict** (K11): eyebrow, verdict from `STORY.VERDICTS` (first line regular, second italic light), four big meters filling (strongest highlighted, click to switch), its question in a rust band, people strip (tan figures = people you held, rust = people who paid for you, with one-line captions), LIVE 2070 AGAIN ↻ and WHY 2070 IS CLOSER THAN IT SOUNDS → (`STORY.ESSAY_URL`, placeholder), "Would you live differently next time?".
Nice-to-have for sharing: "Save your receipt" (draw receipt to canvas → PNG).

---

## 6. Test paths

- **Frugal (all 1s):** wall_worker → honest → tablets → camp (option 1) → gave_pass → accept. Check callbacks: water caption "ends at 7", flood option 3 becomes "Warn your pol", health "anaemic".
- **Rich:** tower (−50) → tank (−15, replaces valve man) → imported **locked** (35 < 40) → terrace → tower boat **locked** → kept/sold pass → accept. Check verdict and "who paid for you".
- **Helper:** freelance → shared → terrace (C+2) → rescuer → gave_pass (W−3) → accept at 71% (+200). Verdict "You gave away the pass you needed."
- Decline path: allowance −20% applied and logged.
- No path should reach 0 CCP.

---

## 7. Later (after the build)

- Public URL on GitHub Pages; OG image from the hero frame; favicon done.
- Essay page "Why 2070 is closer than it sounds" with real sources (Chennai Day Zero 2019, Ahmedabad Heat Action Plan, Sabarmati flows, Gujarat floods, AQI, microplastics in blood).
- Reach & impact plan (being discussed with Soham in Claude): goal + one metric, shareable receipt, channels, case-study page, privacy-friendly analytics.
