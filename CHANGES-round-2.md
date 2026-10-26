# Future: Tense — Round 2 changes (handoff)

Written 27 Oct 2026 from Soham's review of the first build (screenshots + notes).
Two jobs, in this order:

- **Part A — Figma** (a new Claude chat with the Figma connector): redesign the affected v2 frames, then build a new **"Assets — final website"** page. Show Soham screenshots and get approval.
- **Part B — Code** (Claude Code in VS Code): apply the same changes to the site once Part A is approved.

Each change has an ID (R2-xx) so Figma, code and notes can refer to the same thing. "**Decided**" = do it. "**Confirm**" = a recommendation to show Soham in Figma before locking. Only R2-53 is still open; Soham confirmed the rest on 27 Oct.

Project facts:
- Figma file `vtiPJRHhvuKWVSVISilDcR`, v2 page `16:2`. Frame and component IDs are in `HANDOFF-full-spec.md` §5. Call `create_session` first.
- Code lives in `~/Documents/future-tense/future-tense/` (it unzipped one level deep; git repo with one commit `364260e`). Story text is only in `js/story.js`.
- Identity is unchanged: plum `#6c5478`, rust `#8c5b3c`, tan `#d6b98f`, bone `#ece5d8`, night `#141215`, Tomorrow + B612 Mono + Noto Sans Gujarati. It must not look AI-generated.

---

## 1. Global rules (apply everywhere)

**R2-01 · One border language.** *Decided.* Every UI panel uses square corners and a flat fill with a visible border. The border is 1.5px on desktop (1px on phone), bone `#ece5d8` at ~55%, or ink `#221f1d` on paper. No rounded corners, no soft drop shadows and no glows. This covers:
- choice cards and the price board (they already have borders; make them stronger)
- the wallet, the meter strip, messages/alerts and the readout
- the checkpoint bar, the world tag, notices (an ink frame inside the paper edge), the ID card and the receipt (a paper edge plus a thin ink rule inset)

**R2-02 · No widows.** *Decided.* Soham flagged "A tin roof cuts your **leg.**" and "You avoid her **window.**" because the last word sits alone on a line.
- Captions, card titles/"why", after-lines, messages and verdicts must never end with one word on its own line.
- Code: add `text-wrap: pretty` and a small JS helper that joins the last two words with `&nbsp;` for every story string.
- Figma: fix by hand per text box.

**R2-03 · Legibility floor.** *Decided.* No reading text below **14px** on desktop (13px on phone). Secondary text uses bone at ≥85% opacity, never the dim grey. Where small text sits on a sky, give it a dark backing band (`rgba(20,18,21,.6)`). Target contrast is ≥4.5:1.

**R2-04 · Readout line alignment.** *Decided.* "PALDI, AHMEDABAD·JAN 2070CARBON ID REQUIRED" runs together; the same bug is in every world.
- Format: `● PLACE · MON 2070 │ DATA · DATA`.
- One font size, one baseline, 10px gaps around separators, and a thin vertical rule between the place block and the data block.
- Check all frames: K1–K10 plus the transition frame.

**R2-05 · Renames.** *Decided.*
- WORK → **EMPLOYMENT** and MATCH → **PROCREATION**.
- This applies everywhere: hero timeline, world tags, checkpoint bar, readout, receipt month labels, `STORY.WORLDS` tags and `CHECKPOINTS[*].label`.
- Internal ids (`work`, `match`) can stay.
- Check that "⦸ PROCREATION" fits the world tag and the hero timeline at 1440px and 390px.

**R2-06 · Notice order numbers = month.** *Decided.* Soham read 14/2070 as a date.
- Use the month: Employment `ARA · 02/2070`, Water `04/2070`, Food `06/2070`, Health `10/2070`, Procreation app `Order 12/2070`.

**R2-07 · Walker.** *Decided.* Remove the yellow glow circle on the hand. In code, delete the `<circle>` in `assets/svg/walker.svg`; update Figma `20:6`.

---

## 2. Prologue

**R2-10 · Hero small text.** *Decided.* "One year · six crises · about 7 minutes · sound on" and "Your wallet. Always on screen." are too small and too faint.
- New note: **"One year · six crises · about 7 minutes"**. Drop "sound on".
- 15px B612 Mono, bone 90%, on a dark backing band.
- Wallet caption: same style.

**R2-11 · Sound on by default.** *Decided.*
- Browsers won't play audio before the visitor clicks, so start sound on the **STEP INTO 2070** click (it already does that).
- The toggle then reads "Sound on" and the visitor can turn it off.
- Scrolling into the story without clicking should start sound on the first scroll gesture too, where the browser allows it.
- Remove every "sound on" hint text.

**R2-12 · Credit line.** *Decided.* Small text at the top-right of the hero, in the same style as R2-10, that fades out when the story starts. It also appears on the final screen and in README:
**"Experience designed by Soham Sharma · Coded in collaboration with Claude Code"**

**R2-13 · Carbon ID card.** *Decided.*
- Header line: **"AHMEDABAD RESOURCE AUTHORITY · ARA"**.
- Remove the "CARBON CITIZEN ID" title.
- Name field: an empty input with a blinking caret and focus on load. Show a faint `CITIZEN-4417` placeholder.
- On SIGN with an empty field, the name becomes `CITIZEN-4417`.
- Remove "✎ edit" and the pencil.
- "Every gram of carbon you use is recorded against this ID." goes up to 13–14px on the card.

**R2-14 · ID page text hierarchy.** *Decided.* Match the hero note (R2-10): the same size, colour and backing. New copy:
- Line 1 (primary, 15px): **"Type your name, or leave it blank to stay CITIZEN-4417."**
- Line 2 (same style, one line under it): **"Every choice you make is logged against it."**

---

## 3. HUD

**R2-20 · Meters bigger and more active.** *Decided.* Soham's point: the meters are the motivation behind every decision, so they need more presence.
- **Size.** About 1.6× the current strip. Icon 28px, segments 18×5px, labels 12px. Fixed label boxes wide enough for "Community / Welfare" on two lines; that box currently overflows. Add the R2-01 border.
- **At a checkpoint.** The strip stays sharp and un-dimmed while the world blurs, and moves slightly inward so it sits next to the cards.
- **On change.**
  - The delta chip (above the icon) is bigger, 16px.
  - It stays for 3.5s.
  - Segments fill or drain one by one with a tick sound.
  - The whole meter flashes once in tan for a rise, rust for a fall.
  - Callbacks (fines, gifts, anaemia, the tower wall) do the same, so later consequences are visible.
- **Live value.** A small number (e.g. `8`) at the top of each bar.
- **Choice preview (decided).** Hovering or focusing a card shows **↑ / ↓ arrows only** (no numbers) beside the affected meters, in tan for up and rust for down. They clear when the pointer leaves. On touch, the arrows show for the card you tapped before you confirm. This shows what's at stake without turning the choice into maths.

**R2-21 · Messages and alerts.** *Decided.* They're too far to the side, too small, and rounded.
- Move them to **top-centre, under the readout line**, one at a time.
- Square, R2-01 border, about 360px wide.
- Header 12px caps (red square for ARA alerts, plum for people).
- Body 15px.
- Show for about 8s, or until the next one arrives.

**R2-22 · Wallet.** *Decided.* Add the R2-01 border. Everything else stays.

**R2-23 · Checkpoint.** *Decided.*
- Remove "Press 1, 2 or 3". Keys 1–3 still work, and the screen-reader text keeps the hint.
- Card key chips show 1/2/3. Cards get the R2-01 border.

---

## 4. Worlds

### Employment (Feb)
**R2-30 · Bed, not bunk; no meals.** *Decided.*
- Notice sub: **"of labour = 1 bed + 6 h of power"**.
- Option 1 why: **"A bed and power, for building the river wall."**
- Check every other mention ("two meals", "bunk") and remove it.

### Water (Apr)
**R2-31 · Bribe.** *Decided.*
- Option 2 title: **"Bribe the valve man"**.
- Why: **"30 CCP and your tank fills first."**
- After-line stays: "Your tank fills. The pipe upstairs runs dry."
- Receipt line: "Bribed the valve man".
- The tower variant ("Top up from the tower tank") is unchanged.

**R2-32 · Option 3: report the valve man.** *Decided.* It replaces "Share your tank with the floor". The bribe and the report become two sides of the same corrupt valve. Reporting is right, but it costs your whole building first.
- **"Report the valve man to ARA"**
  - Price 0. Meters E+2 C+1 W−2 P−1. Flag `reported`.
  - Why: "He's selling the building's water. Report him, and no one runs the valve for days."
  - After: "He's taken away. Four dry days, then a new operator."
  - Message: `MRS. PATEL · 3B` — "Four days without water. But it comes to everyone now."
- Callbacks move from `shared` to `reported`:
  - June: Mrs. Patel leaves methi ("You did that, didn't you? Here, beta."), W+1.
  - Food terrace bonus: "Your floor helps carry the soil." C+1.
  - Health: "BECAUSE YOU REPORTED THE VALVE MAN IN APRIL" label above the question, and the Mrs. Patel caption mentions the methi.
- Bribers' June fine now reads: "Someone reported the valve man. Your building is fined 5 CCP per flat." It applies on every path where `bribed` is set.
- Ending data: `YOU_HELD.reported` = "the flats upstairs who got their water back".

**R2-33 · Water notice.** *Decided.* Order no. `ARA · 04/2070` (R2-06) and the R2-01 frame.

### Food (Jun)
**R2-34 · Price board.** *Decided.*
- "Imported · Rotterdam vertical farm" → **"Imported · The Hague vertical farm"**.
- Stronger border (R2-01).
- Ration notice gets the R2-01 frame and order `06/2070`.

### Flood (Aug)
**R2-35 · Water = a real image.** *Decided.*
- Use the `sea-repro` photo (tile already exists: `assets/img/sea-repro-tile.webp`) as the flood surface, graded brown-green with the flood tint.
- Animate gently: a slow horizontal drift (~8px/s) plus a 2–3px vertical breathing.
- Remove the CSS ripple streaks and floating debris dashes.
- Under reduced motion: static.

**R2-36 · Rain.** *Decided.* It's too fancy, and its angle is wrong: the sky photo's rain slants down-left, about 135°, while the CSS rain slants the other way, 45°.
- Match the sky's direction.
- Fewer, thinner streaks (1px, bone at ~25%), slower, one layer.
- No splashes and no lightning. Static under reduced motion.

**R2-37 · Boat by the tower.** *Decided.*
- New small vector: a flat motorboat, about 90×36 at Figma scale, same palette as the tower (`#CDD2D0` hull, `#4A4640` trim, tiny figure).
- Place it at the base of the walled tower in the far/mid layer, bobbing slightly.
- Add it to the Figma components and export it as `assets/svg/tower-boat.svg`.

**R2-38 · Rescue after-line.** *Decided.* Fix the widow (R2-02): "You pull eleven people out. A tin roof cuts your&nbsp;leg."

### Health (Oct): new story
**R2-40 · Disease, then the pass rule.** *Decided.* No more "fever". The floods spread a new water-borne disease, and that's **when** the state brings in one hospital pass per person per year.
- Beat 1 caption: **"The floodwater leaves something behind: a new water-borne disease."**
- Beat 1 second caption: **"Hospitals fill in a week. The state rations care: one visit per citizen, per year."**
- Health notice: `HEALTH ORDER · ARA · 10/2070` / HOSPITAL ACCESS / **1 PASS** / "per citizen, per year · from 1 October" / એક વ્યક્તિ, એક પાસ · One person, one pass.
- Readout: `V.S. HOSPITAL · ELLISBRIDGE · OCT 2070 │ AQI 356 · NEW CASES 4,200 / DAY`.

**R2-41 · Your own stake: risk, not symptoms.** *Decided.* You are healthy, for now. The risk is what happens if you catch it later with no pass. Nobody is sick or infected at the moment of the choice.
- Everyone: "The disease is moving through your building **floor by floor.**"
- Rescuer only: "The cut on your leg from August **still hasn't healed.**" (It's slow to close, not infected.)
- The anaemia callback for `tablets` stays: "Four months of SYN-NUT. **You're anaemic.**" It raises your risk.
- Going without the pass means getting through it at home, slowly. Nobody dies.

**R2-42 · Mrs. Patel.** *Decided.*
- Caption: "A knock at 2 a.m. **Mrs. Patel** has it too. Her pass went on her first visit."
- The R2-32 callback line goes above the question when it applies.

**R2-43 · Health choice.** *Decided.* Question: **"One pass. Keep it for yourself, or give it to her?"**

| Opt | Price | Meters | Flag | Why | After |
|---|---|---|---|---|---|
| Keep it for yourself | 0 | P+1 W+1 E−1 C−1 | kept_pass | Rescuer: "Get the leg seen while you still can." Others: "Half your floor has it. You could be next." | "The pass stays in your wallet. You avoid her&nbsp;window." |
| Give it to her | 0 | E+2 C+2 W−2 (rescuer W−3) | gave_pass | Rescuer: "Your leg will have to heal on its own." Others: "If you catch it, you're on your own." | Rescuer: "She's admitted. Your leg takes two months to close." Others: "She's admitted. In November you catch it, and get through it at&nbsp;home." |
| Sell it to her son | +40 | P+2 W+1 E−2 C−2 | sold_pass | "He offers 40 CCP. Medicine at the chemist costs 30." | "Her son doesn't look at you." |

### Procreation (Dec): new story
**R2-50 · Ground, not water.** *Decided.*
- Dec uses a land ground: `ground-intro-tile` graded with the Dec tint plus a dried-silt overlay.
- The walker walks again; no door raft in Dec. The raft is flood only.

**R2-51 · New premise.** *Decided.* Captions:
1. **"The population is falling. The state says the future needs more of us."**
2. **"Citizens who pass a health screen are matched by genes, and paid to have children."**
3. **"A match that has a child earns 300 CCP every year."**
4. Callback when ccp < 20: "Your wallet: **12 CCP**." (real number)
5. Callback for rescuer + gave_pass: "Your health record shows an injury that was never treated. **Match: 71%.**" Reward 200/year.

Remove "Meeting first is not allowed" everywhere.

**R2-52 · The phone as a dating app.** *Decided.* A real phone shape at 9:19.5 (about 300×650 on desktop, 260×560 on phone), with notch and status bar. The **PUNARNIRMAAN** app (પુનર્નિર્માણ · Repopulation Programme) is styled like a dating app, but bureaucratic:
- Header: "It's a match." in Tomorrow SemiBold.
- A profile card with a blurred photo and three tags: `Ward 9 · 27 · Health screen ✓`.
- A big **94%** "genetic match" with a bar.
- A reward strip: "**+300 CCP / year** while your child is healthy".
- Two buttons in dating-app positions: ✕ **Pass** (outline) and ♥ **Accept** (plum).
- Tiny footer: "Order 12/2070 · ARA".
- No "Meet first" anywhere.

**R2-53 · The dilemma.** *Decided.* Money and the city's future, against the life your child would have. Question: **"Would you bring a child into this city?"**

| Opt | Price | Meters | Flag | Why | After |
|---|---|---|---|---|---|
| Accept the match | +300 (+200 at 71%) | P+2 W+1 C+1 E−1 | accepted | "300 CCP a year, and the city gets the child it's asking for." | "Your first appointment is in January." |
| Pass | 0 | E+1 P−1 | declined | "Not into this air. Not for money." | "The app shows you another match tomorrow." |

The "Meet them first" option and the 20% cut are both removed. This is an incentive now, not a punishment. *Confirm the no-penalty choice with Soham.*

---

## 5. Ending

**R2-60 · Remove the decode page.** *Decided.* The flow is receipt prints → button **"WHAT IT SAYS ABOUT YOU →"** → verdict. Delete "WHAT YOUR RECEIPT SAYS", the numbered pins and the notes. (Figma K12 `47:2150`: move it to a "Removed" section, don't delete it.)

**R2-61 · Simpler verdicts.** *Decided.* They should be direct and reflective, not dramatic. The first match wins; line A is regular, line B is italic.
1. sold_pass OR (bribed AND tower_boat), AND C ≤ 4 → "You got through the year." / *"Other people paid part of the cost."*
2. rescuer AND gave_pass → "You gave more than you kept." / *"Your leg is still healing."*
3. E ≥ 9 AND W ≤ 4 → "You held on to your values." / *"Your health paid for them."*
4. C ≥ 9 → "You looked after the people around you." / *"Some of them looked after you."*
5. else → "You got through the year," / *"one trade-off at a time."*

**R2-62 · Remove the people strip.** *Decided.* No "11 people you pulled from the water / 2 who paid for you" and no figures row. Keep that data in story.js for later (a share card), just don't render it.

**R2-63 · Clearer meter questions.** *Decided.* Shown for the strongest meter; clicking any big meter switches.
- **Privilege:** "Some of your choices were only open because you could pay. Who around you never had them?"
- **Ethics:** "When surviving meant bending a rule, where did you stop, and why there?"
- **Personal Welfare:** "How much of your own health and rest did you give up, and for whom?"
- **Community Welfare:** "Your floor, your pol, Mrs. Patel: are they better or worse off because of you?"

**R2-64 · Buttons.** *Decided.* Remove "WHY 2070 IS CLOSER THAN IT SOUNDS". Keep **LIVE 2070 AGAIN ↻** and "Would you live differently next time?". Add the R2-12 credit line small at the bottom.

**R2-65 · Receipt.** *Decided.*
- New labels: EMPLOYMENT/PROCREATION, Bribed the valve man, Used the pass / Gave the pass / Sold the pass, Accepted / Passed on the match.
- Pass +200/+300 shown as "+300 / yr".
- Move the "SURVIVED 2070" stamp so it never covers the header text; it currently overlaps "CARBON CITIZEN LEDGER". Put it lower right, over the balance chart.
- The CCP chart label "−40 vegetables" collides with the line. Labels sit above or below the step, never on it.

---

## 6. Part A — Figma tasks (new chat)

1. `create_session` on `vtiPJRHhvuKWVSVISilDcR`. Duplicate the v2 page as **"v2.1 · Round 2"** and work there; keep v2 untouched for the case study.
2. Update the components first so every frame inherits:
   - Wallet `19:67`, meter set `19:214` (bigger, live number, border, label fit)
   - Message `19:121` (square, bordered, larger), notice `30:973` (frame, order numbers)
   - Choice token `19:115` (stronger border), checkpoint bar `30:1013`, world tag `19:127` (fits PROCREATION)
   - Readout `19:5` (alignment), walker `20:6` (no glow)
   - New: tower boat, phone (dating-app layout)
3. Update frames: K1 hero, K2 ID, K3 employment, K4–K6 water (bribe, option 3, messages top-centre), K7 transition, K8 flood (photo water, rain angle, boat), K9 health (new copy/options), K10 procreation (ground, phone), K11 verdict (no strip, no essay button, new copy). Move K12 decode to "Removed".
4. Screenshot each updated frame. Send Soham the batch, confirm the last open item (R2-53, no penalty for declining), and lock his answers back into this file.
5. **New page "Assets — final website"**: every asset the live site uses, laid out in labelled sections on a neutral grid, each with its name, file name in the repo, size and where it's used:
   1. **Brand** — logo hero and docked states, favicon, colour swatches with hex, type specimens (Tomorrow, B612 Mono, Noto Sans Gujarati).
   2. **Characters** — walker, seated figure on the door raft, door raft, tower boat.
   3. **Architecture** — pol houses ×3, chabutra, Paldi apartment, shut textile mill, V.S. Hospital, walled tower, Sanand farm hut.
   4. **Landmarks** — Jhulta Minar, Teen Darwaza, Motera stadium, riverfront embankment.
   5. **Nature** — dead tree, dry sapling.
   6. **Skies** — 7 images, labelled by world and month.
   7. **Grounds & water** — the 5 land grounds as used, plus the flood water (sea photo). Mark the Employment road **"placeholder — Shutterstock preview, replace before public"**.
   8. **HUD** — readout, wallet (idle/debit/credit), stamp, meter strip (states + delta), world tag, message (person/alert), hint, progress bar, sound toggle.
   9. **Story objects** — the 4 notices with final copy, the Sanand price board, the Carbon ID card, the PUNARNIRMAAN phone.
   10. **Checkpoint** — bar, question, card states (default/hover/selected/locked).
   11. **Ending** — receipt, big meters, verdict layout, buttons.
   12. **Sound** — a small text list of the generated sounds (no files).

   Build with auto-layout sections. Reuse components and instances, don't make copies. This page is for documentation, so label it clearly.
6. Update `HANDOFF-full-spec.md` in the Claude project with the new frame IDs.

## 7. Part B — Code tasks (Claude Code, after Part A is approved)

Prompt to paste:
> Read CLAUDE.md, HANDOFF.md and CHANGES-round-2.md. Apply every R2 item marked Decided, plus the Confirm items with the answers recorded in the file. Use the Figma v2.1 frames as the visual target (screenshots in docs/frames/round-2/). Story text changes go in js/story.js only. Then:
> - play the frugal, rich, helper and "report" paths and check locks, callbacks, receipt totals and verdicts
> - check 1440×900 and 390×844, keyboard-only play and reduced motion
>
> Show me after each section and commit per section.

Files touched: `js/story.js` (most copy, options, callbacks, verdicts, questions), `css/style.css` (R2-01, -03, -04, -20, -21, -23), `js/engine.js` (sound default, ID input, meters, messages, flood water, rain, Dec ground and walker), `js/ending.js` (remove decode and people strip, verdict copy, receipt fixes), `assets/svg/walker.svg`, new `assets/svg/tower-boat.svg`, `index.html` (credit line, decode markup removed), `README.md` (credit).

Housekeeping:
- The project sits one folder deep (`Documents/future-tense/future-tense/`), with an old `future-tense.zip` and `HANDOFF-full-spec.md` beside it. Ask Soham before flattening.
- Copy `HANDOFF-full-spec.md` into the repo.
