/* =====================================================================
   Future: Tense — story data.
   ALL copy, prices, meter effects, flags and callbacks live here.
   engine.js and ending.js only read this file. Edit the story here.

   Meters: P = Privilege, E = Ethics, W = Personal Welfare, C = Community Welfare
   Captions: keep each one ≤ 18 words. <b>word</b> = highlighted keyword.
   `s` passed to functions is the read-only story state:
     s.has('flag'), s.ccp, s.m.P / s.m.E / s.m.W / s.m.C, s.name
   ===================================================================== */

const STORY = {};

STORY.START = { ccp: 100, meter: 6, max: 12 };

/* No widows (R2-02): joins the last two words of a story string with a
   no-break space, skipping over tags. engine.js and ending.js run every
   caption, card, after-line, message and verdict through this.          */
STORY.tidy = html => {
  if (typeof html !== 'string') return html;
  html = html.trim();
  for (let i = html.length - 1, tag = 0; i > 0; i--) {
    const c = html[i];
    if (c === '>') tag++; else if (c === '<') tag--;
    else if (!tag && c === ' ') return html.slice(0, i) + '\u00a0' + html.slice(i + 1);
  }
  return html;
};
STORY.ID = 'AMD-2070-4417';
STORY.DEFAULT_NAME = 'CITIZEN-4417';

/* ---------- prologue copy ---------- */
STORY.HERO = {
  eyebrow: 'PALDI, AHMEDABAD · 2070',
  caption: 'Carbon is the currency now. You start with <b>100 CCP</b>.<br>Every choice you make spends it.',
  cta: 'STEP INTO 2070',
  note: 'One year · six crises · about 7 minutes',
  wallet: 'Your wallet. Always on screen.'
};
/* shown on the hero (top right) and on the final screen; also in README.md */
STORY.CREDIT = 'Designed by Soham Sharma · Coded in collaboration with Claude Code';
STORY.IDCARD = {
  caption: '<b>No ID, no water.</b> Sign here.',
  authority: 'AHMEDABAD RESOURCE AUTHORITY · ARA',
  city: 'અમદાવાદ',
  zone: 'Paldi · Ward 12',
  fine: 'Every gram of carbon you use is recorded against this ID.',
  button: 'SIGN',
  note: [`Type your name, or leave it blank to stay ${STORY.DEFAULT_NAME}.`, 'Every choice you make is logged against it.']
};
STORY.END_CAPTION_DELAY = 1600;   /* ms after the last caption before the ledger prints */

/* ---------- meters ---------- */
STORY.METERS = [
  { k: 'P', name: 'Privilege',
    icon: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="10" y="2" width="4" height="3"/><rect x="7" y="8" width="10" height="3"/><rect x="4" y="14" width="16" height="3"/><rect x="1" y="20" width="22" height="3"/></svg>',
    ask: 'Some of your choices were only open because you could pay. Who around you never had them?' },
  { k: 'E', name: 'Ethics',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="square"><path d="M3.5 2.5 12 12l8.5-9.5M12 12v10.5"/></svg>',
    ask: 'When surviving meant bending a rule, where did you stop, and why there?' },
  { k: 'W', name: 'Personal Welfare',
    icon: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="17" width="2.6" height="5"/><rect x="8.2" y="4" width="2.6" height="18"/><rect x="13.4" y="14" width="2.6" height="8"/><rect x="18.6" y="19" width="2.6" height="3"/></svg>',
    ask: 'How much of your own health and rest did you give up, and for whom?' },
  { k: 'C', name: 'Community Welfare',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8"><path d="M12 2v20M3.3 7l17.4 10M3.3 17 20.7 7"/></svg>',
    ask: 'Your floor, your pol, Mrs. Patel: are they better or worse off because of you?' }
];

/* ---------- worlds ----------
   sky/ground = images in assets/img. tint/haze = colour grade over the sky.
   flipSky = mirror the sky (the flood photo's rain then slants like the CSS rain).
   water = flood surface image (graded with tint, drifts and breathes).
   silt = a dried-silt wash over the ground (December, after the flood).
   raft = the walker rides the door raft here instead of walking.
   pass = a chip under the wallet while you're in this world, until its checkpoint is answered.
   place/month/data = the readout line next to the logo.
   snd = drone pitch (f), wind level (w), wind filter (wf), rain (r).      */
STORY.WORLDS = {
  intro:  { sky: 'sky-intro',  ground: 'ground-intro-tile',  tint: '#6f7d64', haze: '#a9b39a', tag: null,
            place: 'PALDI, AHMEDABAD', month: 'JAN 2070', data: ['CARBON ID REQUIRED'], color: '#a9b39a',
            snd: { f: 55, w: .32, wf: 520, r: 0 } },
  work:   { sky: 'sky-city',   ground: 'ground-city-tile',   tint: '#6f8a7c', haze: '#a3b4a5', tag: 'EMPLOYMENT',
            place: 'OLD CITY · ASHRAM ROAD', month: 'FEB 2070', data: ['WINTER 14°C', 'MILLS SHUT 61%'], color: '#7fa08f',
            snd: { f: 51.9, w: .26, wf: 600, r: 0 } },
  water:  { sky: 'sky-water',  ground: 'ground-water-tile',  tint: '#c98c45', haze: '#d9a96a', tag: 'WATER',
            place: 'SABARMATI RIVERBED · PALDI', month: 'APR 2070', data: ['44°C', 'RAIN 0 mm', 'AQI 212'], color: '#d29a55',
            snd: { f: 49, w: .5, wf: 760, r: 0 } },
  food:   { sky: 'sky-food',   ground: 'ground-food-tile',   tint: '#8a5d8f', haze: '#b78aa0', tag: 'FOOD',
            place: 'WHEAT FIELDS · SANAND', month: 'JUN 2070', data: ['48°C', 'AQI 418', 'BURNING STUBBLE'], color: '#b78aa0',
            snd: { f: 46.25, w: .3, wf: 380, r: 0 } },
  flood:  { sky: 'sky-flood',  flipSky: true, ground: null, water: 'sea-repro-tile', rain: true, tint: '#3f6f6a', haze: '#7c8c84', tag: 'FLOOD',
            place: 'RIVERFRONT · PALDI', month: 'AUG 2070', data: ['412 mm / 24 h', 'DHAROI GATES OPEN'], color: '#6f9a92',
            snd: { f: 41.2, w: .5, wf: 900, r: .55 }, raft: true },
  health: { sky: 'sky-health', ground: 'ground-health-tile', tint: '#a7b13a', haze: '#c9cf7c', tag: 'HEALTH',
            place: 'V.S. HOSPITAL · ELLISBRIDGE', month: 'OCT 2070', data: ['AQI 356', 'NEW CASES 4,200 / DAY'], color: '#bcc46a',
            pass: 'HEALTH PASS 2070 · 1 / 1 UNUSED',   /* chip under the wallet until you decide */
            snd: { f: 43.65, w: .22, wf: 450, r: 0 } },
  match:  { sky: 'sky-repro',  ground: 'ground-intro-tile', silt: true, tint: '#b49870', haze: '#d8c7a6', tag: 'PROCREATION',
            place: 'PALDI', month: 'DEC 2070', data: ['WINTER SMOG', 'BIRTH RATE 0.6', 'MICROPLASTICS IN 97% OF BLOOD'], color: '#d8c7a6',
            snd: { f: 55, w: .4, wf: 260, r: 0 } }
};

/* Hero timeline on the ground */
STORY.TIMELINE = [
  ['EMPLOYMENT', 'FEB 2070', 'work'], ['WATER', 'APR 2070', 'water'], ['FOOD', 'JUN 2070', 'food'],
  ['FLOOD', 'AUG 2070', 'flood'], ['HEALTH', 'OCT 2070', 'health'], ['PROCREATION', 'DEC 2070', 'match']
];

/* ---------- people who paid for you / people you held ----------
   Not shown on the site any more (R2-62). Kept for a share card later. */
STORY.PAID_FOR_YOU = {
  bribed:     { who: 'the flat upstairs',        mon: 'Apr', why: 'its pipe ran dry so your tank could fill' },
  tank:       { who: 'the pol below your tower', mon: 'Apr', why: 'its taps stayed dry while the tower tank filled' },
  tower:      { who: 'the pol next door',        mon: 'Aug', why: 'it took the water your tower wall pushed away' },
  tower_boat: { who: 'the lanes below your boat', mon: 'Aug', why: 'they went under while you rode above them' },
  kept_pass:  { who: 'Mrs. Patel',               mon: 'Oct', why: 'she went without a hospital pass' },
  sold_pass:  { who: 'Mrs. Patel',               mon: 'Oct', why: 'her son paid 40 CCP for the pass you held' }
};
STORY.YOU_HELD = {
  rescuer:   { n: 11, who: 'people you pulled from the water', mon: 'Aug' },
  warned:    { n: 40, who: 'families in your pol who left before the wall broke', mon: 'Aug', icons: 6 },
  reported:  { n: 5,  who: 'the flats upstairs who got their water back', mon: 'Apr' },
  gave_pass: { n: 1,  who: 'Mrs. Patel, admitted with your pass', mon: 'Oct' }
};

/* ---------- beats: one viewport width each ----------
   say:    captions  {html, x, y, when}      x/y = fraction of screen
   props:  vector illustrations  {src, x, s, layer, sink, cls}
           layer: far (0.55×) · mid (0.85×) · near (1×) · s = scale (1 = Figma size at 982px tall)
           sink = how far below the ground line the base sits (fraction of H), e.g. flooded buildings
   notice: an ARA public notice on a post
   html:   free-form prop (price board, phone)
   gate:   'hero' | 'id' | checkpoint id — you can't scroll past until it's done
   enter:  callbacks run once when you reach the beat                        */
STORY.BEATS = [
  /* ---- PROLOGUE ---- */
  { w: 'intro', gate: 'hero' },
  { w: 'intro', gate: 'id' },
  { w: 'intro',
    say: [{ html: 'The world adapted. It <b>never recovered.</b>', x: .2, y: .26 },
          { html: 'Everything costs carbon. Your wallet shows what’s left.', x: .3, y: .38 }],
    props: [{ src: 'dead-tree', x: .66, s: .75, layer: 'mid' }, { src: 'sapling', x: .88, s: 1, layer: 'near' }] },

  /* ---- 01 · FEB · EMPLOYMENT ---- */
  { w: 'work',
    say: [{ html: 'Export orders are cancelled. The <b>textile mills</b> fall silent.', x: .06, y: .2 }],
    props: [{ src: 'teen-darwaza', x: .52, s: .75, layer: 'far' }, { src: 'jhulta-minar', x: .86, s: .8, layer: 'far' },
            { src: 'pol-ochre', x: .0, s: 1, layer: 'mid' }, { src: 'pol-mint', x: .12, s: .95, layer: 'mid' },
            { src: 'mill', x: .24, s: 1, layer: 'mid' }, { src: 'pol-rose', x: .78, s: .92, layer: 'mid' }] },
  { w: 'work',
    say: [{ html: 'The city still runs. It just doesn’t <b>pay</b> anymore.', x: .1, y: .2 }],
    notice: { x: .38, header: 'PUBLIC NOTICE', order: 'ARA · 02/2070', title: 'WORK FOR SHELTER', big: '8 HRS',
              sub: 'of labour = 1 bed + 6&nbsp;h of power', gu: 'આશ્રય માટે કામ', en: 'Work for shelter' },
    props: [{ src: 'chabutra', x: .66, s: 1, layer: 'mid' }, { src: 'pol-mint', x: .8, s: 1.05, layer: 'mid' },
            { src: 'pol-ochre', x: .92, s: .9, layer: 'mid', cls: 'shade' }] },
  { w: 'work', gate: 'work',
    props: [{ src: 'apartment', x: .2, s: .85, layer: 'mid' }, { src: 'pol-rose', x: .62, s: 1, layer: 'mid' }] },

  /* ---- 02 · APR · WATER ---- */
  { w: 'water',
    say: [{ html: 'Summer comes early. By April the <b>Sabarmati is dust.</b>', x: .12, y: .2 },
          { html: 'Your shift on the river wall ends at 7. <b>The taps close at 6:30.</b>', x: .2, y: .32, when: s => s.has('wall_worker') }],
    props: [{ src: 'apartment', x: .04, s: .62, layer: 'far', sink: -.13 }, { src: 'apartment', x: .55, s: .55, layer: 'far', cls: 'shade', sink: -.13 },
            { src: 'embankment', x: 0, w: 1.02, h: .15, layer: 'mid', sink: -.02 },
            { src: 'dead-tree', x: .7, s: .8, layer: 'near', sink: .03 }] },
  { w: 'water',
    notice: { x: .58, header: 'PUBLIC NOTICE', order: 'ARA · 04/2070', title: 'WATER ALLOCATION', big: '30 MIN',
              sub: 'per household, per day<br>06:00–06:30', gu: 'પાણી બચાવો', en: 'Save water' },
    say: [{ html: 'The riverfront wall still stands. There is <b>no river</b> behind it.', x: .08, y: .2 }],
    props: [{ src: 'apartment', x: .2, s: .58, layer: 'far', sink: -.13 }, { src: 'embankment', x: -.01, w: 1.02, h: .15, layer: 'mid', sink: -.02 }] },
  { w: 'water', gate: 'water',
    props: [{ src: 'apartment', x: .55, s: .6, layer: 'far', sink: -.13 }, { src: 'embankment', x: -.01, w: 1.02, h: .15, layer: 'mid', sink: -.02 },
            { src: 'sapling', x: .8, s: 1, layer: 'near', sink: .04 }] },

  /* ---- 03 · JUN · FOOD ---- */
  { w: 'food',
    say: [{ html: 'The heatwave kills the wheat in Sanand. Farmers <b>burn the fields.</b>', x: .1, y: .2 }],
    props: [{ src: 'dead-tree', x: .12, s: 1, layer: 'mid' }, { src: 'farm-hut', x: .58, s: 1, layer: 'mid' }],
    smoke: [.35, .78],
    enter: [
      { when: s => s.has('bribed'), month: 'JUN', label: 'Building fine', ccp: -5, fx: { C: -1 },
        msg: { from: 'ARA · NOTICE', text: 'Someone reported the valve man. Your building is fined 5 CCP per flat.', kind: 'alert' } },
      { when: s => s.has('reported'), fx: { W: 1 },
        msg: { from: 'MRS. PATEL · 3B', time: '07:40', text: 'Methi at your door. You did that, didn’t you? Here, beta.' } }
    ] },
  { w: 'food',
    notice: { x: .44, header: 'RATION NOTICE', order: 'ARA · 06/2070', title: 'SYN-NUT TABLETS', big: '3 / DAY',
              sub: 'free for every citizen<br>not for long-term use', gu: 'પોષણ ગોળી', en: 'Nutrition tablet' },
    html: [{ x: .74, layer: 'near', cls: 'board',
             html: '<b>SANAND MANDI</b><span>Tomatoes · 1 kg</span><strong>40 CCP</strong><span>Onions · 1 kg</span><strong>28 CCP</strong><em>Imported · The Hague vertical farm</em>' }],
    props: [{ src: 'sapling', x: .2, s: 1.2, layer: 'near', sink: .03 }],
    smoke: [.1] },
  { w: 'food', gate: 'food',
    props: [{ src: 'farm-hut', x: .7, s: .75, layer: 'mid', cls: 'shade' }, { src: 'dead-tree', x: .2, s: .7, layer: 'far' }] },

  /* ---- 04 · AUG · FLOOD ---- */
  { w: 'flood',
    say: [{ html: 'Four months ago this riverbed was dust. Now <b>a year of rain</b> falls in one week.', x: .18, y: .2 }],
    props: [{ src: 'motera', x: .48, s: .75, layer: 'far', sink: .03 },
            { src: 'apartment', x: .16, s: .9, layer: 'mid', sink: .1 }, { src: 'pol-rose', x: .72, s: .9, layer: 'mid', sink: .14 }],
    enter: [{ msg: { from: 'ARA FLOOD ALERT', time: 'now', kind: 'alert',
                     text: '<b>Paldi will submerge in 12 hours.</b> Relief camp: Motera stadium. Carry your Carbon ID.' } }] },
  { w: 'flood',
    say: [{ html: 'The rich built upwards. <b>Their towers have boats.</b>', x: .08, y: .2 },
          { html: 'You built that wall. <b>You know where it cracks.</b>', x: .14, y: .32, when: s => s.has('wall_worker') },
          { html: 'Your tower’s wall holds. The water it pushes away <b>floods the pol next door.</b>', x: .14, y: .32, when: s => s.has('tower') }],
    props: [{ src: 'tower', x: .6, s: 1.05, layer: 'mid', sink: .03 }, { src: 'pol-ochre', x: .3, s: .85, layer: 'mid', sink: .13 },
            { src: 'tower-boat', x: .622, s: 1.4, layer: 'mid', sink: -.027, cls: 'bob' }],
    enter: [{ when: s => s.has('tower'), fx: { E: -1 } }] },
  { w: 'flood', gate: 'flood',
    props: [{ src: 'apartment', x: .55, s: .8, layer: 'mid', sink: .12 }, { src: 'pol-mint', x: .2, s: .9, layer: 'mid', sink: .15 }] },

  /* ---- 05 · OCT · HEALTH ---- */
  { w: 'health',
    say: [{ html: 'The floodwater leaves something behind: a <b>new water-borne disease.</b>', x: .14, y: .2 },
          { html: 'Hospitals fill in a week. The state rations care: <b>one visit per citizen, per year.</b>', x: .2, y: .31 },
          { html: 'Four months of SYN-NUT. <b>You’re anaemic.</b>', x: .3, y: .42, when: s => s.has('tablets') }],
    props: [{ src: 'pol-ochre', x: .02, s: .95, layer: 'mid' }, { src: 'hospital', x: .42, s: 1, layer: 'mid' }],
    enter: [
      { when: s => s.has('tablets'), fx: { W: -1 } },
      { when: s => s.has('tower_boat'), month: 'OCT', label: 'Boat to hospital', ccp: -20,
        msg: { from: 'TOWER CONCIERGE', text: 'From the tower, the hospital is a boat ride. 20 CCP debited.' } }
    ] },
  { w: 'health',
    notice: { x: .56, header: 'HEALTH ORDER', order: 'ARA · 10/2070', title: 'HOSPITAL ACCESS', big: '1 PASS',
              sub: 'per citizen, per year<br>from 1 October', gu: 'એક વ્યક્તિ, એક પાસ', en: 'One person, one pass' },
    /* you're healthy, for now: the stake is the risk of catching it later with no pass */
    say: [{ html: 'The disease is moving through your building <b>floor by floor.</b>', x: .06, y: .2 },
          { html: 'The cut on your leg from August <b>still hasn’t healed.</b>', x: .12, y: .31, when: s => s.has('rescuer') }],
    props: [{ src: 'apartment', x: .02, s: .6, layer: 'far' }, { src: 'pol-mint', x: .84, s: .95, layer: 'mid' }] },
  { w: 'health', gate: 'health',
    props: [{ src: 'pol-rose', x: .66, s: 1, layer: 'mid' }, { src: 'sapling', x: .3, s: 1, layer: 'near', sink: .03 }] },

  /* ---- 06 · DEC · PROCREATION ---- */
  { w: 'match',
    say: [{ html: 'The population is falling. The state says <b>the future needs more of us.</b>', x: .1, y: .2 },
          { html: s => `Your wallet: <b>${s.ccp} CCP.</b>`, x: .16, y: .32, when: s => s.ccp < 20 }],
    props: [{ src: 'tower', x: .74, s: .7, layer: 'far' }, { src: 'apartment', x: .3, s: .55, layer: 'far' }] },
  { w: 'match',
    say: [{ html: 'Citizens who pass a health screen are <b>matched by genes,</b> and paid to have children.', x: .1, y: .2 },
          { html: 'A match that has a child earns <b>300 CCP every year.</b>', x: .16, y: .32 },
          { html: 'Your health record shows an injury that was never treated. <b>Match: 71%.</b>', x: .3, y: .44, when: s => s.has('rescuer') && s.has('gave_pass') }],
    props: [{ src: 'apartment', x: .7, s: .5, layer: 'far' }] },
  { w: 'match', gate: 'match',
    html: [{ x: .62, layer: 'story', cls: 'phone', html: s => STORY.phone(s) }] },

  /* ---- END ---- */
  { w: 'match', end: true,
    say: [{ html: 'December ends. <b>The ledger prints.</b>', x: .3, y: .3 }] }
];

/* The PUNARNIRMAAN phone app (procreation checkpoint beat): a dating app, but bureaucratic */
STORY.matchScore = s => (s.has('rescuer') && s.has('gave_pass')) ? 71 : 94;
STORY.matchReward = s => (s.has('rescuer') && s.has('gave_pass')) ? 200 : 300;
STORY.phone = s => `
  <p class="ph-buzz note-band">Your phone buzzes.</p>
  <div class="ph-status"><span>06:40</span><i class="ph-notch"></i><span>AQI 389</span></div>
  <p class="ph-app">PUNARNIRMAAN</p>
  <p class="ph-sub"><span lang="gu">પુનર્નિર્માણ</span> · Repopulation Programme</p>
  <p class="ph-h">It’s a match.</p>
  <div class="ph-card">
    <div class="ph-face" aria-hidden="true"></div>
    <p class="ph-note">Revealed once you accept</p>
    <p class="ph-tags"><span>Ward 9</span><span>27</span><span>Health screen ✓</span></p>
  </div>
  <p class="ph-pct"><b>${STORY.matchScore(s)}%</b> genetic match</p>
  <div class="ph-bar"><i style="width:${STORY.matchScore(s)}%"></i></div>
  <p class="ph-reward"><b>+${STORY.matchReward(s)} CCP / year</b> while your child is healthy</p>
  <div class="ph-btns"><span class="ph-pass">✕ Pass</span><span class="ph-acc">♥ Accept</span></div>
  <p class="ph-order">Order 12/2070 · ARA</p>`;

/* ---------- checkpoints ----------
   price: CCP change (negative = cost). Options lock if you can't afford them.
   fx: meter changes. flag: remembered for callbacks and the ending.
   why: one line on the card. after: one line once chosen. msg: text under the wallet.
   opts(s) can swap options based on earlier flags (callbacks).
   because(s) / lead(s): a label and tan-band lines above the question.
   wait: ms to hold at the gate before the checkpoint opens (pushing on opens it). */
STORY.CHECKPOINTS = {
  work: {
    n: 1, month: 'FEB', label: 'EMPLOYMENT',
    q: 'Your mill just shut. Rent is due in CCP. What now?',
    opts: s => [
      { title: 'Sign a Work-for-Shelter contract', price: 0, fx: { P: -2, E: 1, C: 1, W: -1 }, flag: 'wall_worker',
        why: 'A bed and power, for building the river wall.',
        after: 'Contract WFS-88213. You pour concrete on the riverfront.',
        msg: { from: 'ARA · WORK-FOR-SHELTER', text: 'Contract WFS-88213 active. Report 06:00, Riverfront Block C.' } },
      { title: 'Rent a flat in a walled tower', price: -50, fx: { P: 2, W: 1, C: -1 }, flag: 'tower',
        why: 'Filtered air. Guarded gates. Real sleep.',
        after: 'The gate closes behind you.',
        msg: { from: 'SABARMATI HEIGHTS · GATE', text: 'Welcome, resident. Air filters at 100%.' } },
      { title: 'Live off your savings', price: -10, fx: { P: 1, C: -1 }, flag: 'freelance',
        why: 'Stay independent and hope something turns up.',
        after: 'Three interviews. No callbacks.' }
    ]
  },
  water: {
    n: 2, month: 'APR', label: 'WATER',
    q: 'You work nights. By the time you’re home, the taps are dry.',
    opts: s => [
      { title: 'Stick to the 30 minutes', price: 0, fx: { E: 1, C: 1, W: -1 }, flag: 'honest',
        why: 'Wake at 5:45, sleep less, follow the rules.',
        after: 'You learn to bathe with one bucket.' },
      s.has('tower')
        ? { title: 'Top up from the tower tank', price: -15, fx: { P: 1, W: 2, E: -1, C: -1 }, flag: 'tank',
            why: 'Residents get a reserve. Nobody asks where it comes from.',
            after: 'Your bucket fills. The pol taps below stay dry.' }
        : { title: 'Bribe the valve man', price: -30, fx: { P: 1, W: 2, E: -2, C: -1 }, flag: 'bribed',
            why: '30 CCP and your tank fills first.',
            after: 'Your tank fills. <b>The pipe upstairs runs dry.</b>',
            msg: { from: 'MRS. PATEL · 3B', time: '06:14', text: 'Is your water running? Ours stopped at 6:12.' } },
      /* the other side of the same corrupt valve: right, but the whole building pays first */
      { title: 'Report the valve man to ARA', price: 0, fx: { E: 2, C: 1, W: -2, P: -1 }, flag: 'reported',
        why: 'He’s selling the building’s water. Report him, and no one runs the valve for days.',
        after: 'He’s taken away. <b>Four dry days,</b> then a new operator.',
        msg: { from: 'MRS. PATEL · 3B', text: 'Four days without water. But it comes to everyone now.' } }
    ]
  },
  food: {
    n: 3, month: 'JUN', label: 'FOOD',
    q: 'Real tomatoes cost 40 CCP a kilo. What do you eat?',
    opts: s => [
      { title: 'Live on SYN-NUT tablets', price: 0, fx: { E: 1, C: 1, W: -1 }, flag: 'tablets',
        why: 'Free, filling, and nobody knows what’s in them.',
        after: 'Day 60. Your gums bleed when you brush.' },
      { title: 'Buy imported vegetables', price: -40, fx: { P: 1, W: 2, E: -1, C: -1 }, flag: 'imported',
        why: 'You haven’t tasted real food in a month.',
        after: 'It tastes like before.' },
      { title: 'Grow food on the terrace', price: -10, fx: { E: 1, C: s.has('reported') ? 2 : 1, W: -1, P: -1 }, flag: 'terrace',
        why: 'The soil is contaminated, but it’s yours.',
        after: s.has('reported') ? 'Your floor helps carry the soil. Three tomatoes. Small, bitter, yours.'
                               : 'Three tomatoes. Small, bitter, yours.' }
    ]
  },
  flood: {
    n: 4, month: 'AUG', label: 'FLOOD',
    q: 'The water is at your knees. Twelve hours left. Where do you go?',
    opts: s => [
      { title: 'Go to the Motera relief camp', price: 0, fx: { E: 1, C: 1, P: -1, W: -1 }, flag: 'camp',
        why: 'Forty thousand people, one stadium, but it’s dry.',
        after: 'Tent 1142. You sleep on a stadium seat.' },
      { title: 'Buy a seat on a tower boat', price: -60, fx: { P: 2, W: 2, E: -1, C: -2 }, flag: 'tower_boat',
        why: 'Dry, safe, and above it all.',
        after: 'Below you, the lanes go under.' },
      s.has('wall_worker')
        ? { title: 'Warn your pol before the wall breaks', price: 0, fx: { E: 2, C: 3, W: -2 }, flag: 'warned',
            why: 'Forty families in your pol don’t know yet.',
            after: 'The wall breaks at 2 a.m. Your pol is already out.' }
        : { title: 'Stay and help the rescue boats', price: 0, fx: { E: 2, C: 2, W: -2, P: -1 }, flag: 'rescuer',
            why: 'You know these lanes better than the boats do.',
            after: 'You pull eleven people out. A tin roof cuts your leg.' }
    ]
  },
  health: {
    n: 5, month: 'OCT', label: 'HEALTH',
    q: 'One pass. Keep it for yourself, or give it to her?',
    because: s => s.has('reported') ? 'BECAUSE YOU REPORTED THE VALVE MAN IN APRIL' : '',
    /* lead: lines in tan bands above the question */
    lead: s => ['A knock at 2 a.m. <b>Mrs. Patel</b> has it too.', 'Her pass went on her first visit.',
                s.has('reported') && 'She once left <b>methi</b> at your door.'].filter(Boolean),
    opts: s => [
      { title: 'Keep it for yourself', price: 0, fx: { P: 1, W: 1, E: -1, C: -1 }, flag: 'kept_pass',
        why: s.has('rescuer') ? 'Get the leg seen while you still can.' : 'Half your floor has it. You could be next.',
        after: 'The pass stays in your wallet. You avoid her window.' },
      { title: 'Give it to her', price: 0, fx: { E: 2, C: 2, W: s.has('rescuer') ? -3 : -2 }, flag: 'gave_pass',
        why: s.has('rescuer') ? 'Your leg will have to heal on its own.' : 'If you catch it, you’re on your own.',
        after: s.has('rescuer') ? 'She’s admitted. Your leg takes two months to close.'
                                : 'She’s admitted. In November you catch it, and get through it at home.',
        msg: { from: 'V.S. HOSPITAL', text: 'Pass AMD-4417 transferred. Patient admitted: Patel, H.' } },
      { title: 'Sell it to her son', price: 40, fx: { P: 2, W: 1, E: -2, C: -2 }, flag: 'sold_pass',
        why: 'He offers 40 CCP. Medicine at the chemist costs 30.',
        after: 'Her son doesn’t look at you.' }
    ]
  },
  match: {
    n: 6, month: 'DEC', label: 'PROCREATION',
    wait: 3000,   /* ms at the gate before the checkpoint opens, so you can read the phone */
    q: 'Would you bring a child into this city?',
    opts: s => [
      { title: 'Accept the match', price: STORY.matchReward(s), priceLabel: `+${STORY.matchReward(s)} CCP / yr`,
        fx: { P: 2, W: 1, C: 1, E: -1 }, flag: 'accepted',
        why: `${STORY.matchReward(s)} CCP a year, and the city gets the child it’s asking for.`,
        after: 'Your first appointment is in January.' },
      /* R2-53: no penalty for passing, for now. To bring one back, give this a price
         (e.g. price: -Math.round(s.ccp * .2), free: true, priceLabel: '−20% CCP') and a new after-line. */
      { title: 'Pass', price: 0, fx: { E: 1, P: -1 }, flag: 'declined',
        why: 'Not into this air. Not for money.',
        after: 'The app shows you another match tomorrow.' }
    ]
  }
};

/* ---------- verdicts (first match wins) ---------- */
/* direct and reflective, not dramatic (R2-61). a = regular line, b = italic line */
STORY.VERDICTS = [
  { when: s => (s.has('sold_pass') || (s.has('bribed') && s.has('tower_boat'))) && s.m.C <= 4,
    a: 'You got through the year.', b: 'Other people paid part of the cost.' },
  { when: s => s.has('rescuer') && s.has('gave_pass'),
    a: 'You gave more than you kept.', b: 'Your leg is still healing.' },
  { when: s => s.m.E >= 9 && s.m.W <= 4,
    a: 'You held on to your values.', b: 'Your health paid for them.' },
  { when: s => s.m.C >= 9,
    a: 'You looked after the people around you.', b: 'Some of them looked after you.' },
  { when: () => true,
    a: 'You got through the year,', b: 'one trade-off at a time.' }
];

/* ---------- interface words (engine.js) ---------- */
STORY.UI = {
  checkpoint: 'CHECKPOINT',
  keys: n => n === 2 ? 'Press 1 or 2.' : 'Press 1, 2 or 3.',   /* screen readers only */
  tapAgain: 'Tap again to choose',
  need: n => `NEED ${n} CCP`,
  debited: 'DEBITED', credited: 'CREDITED',
  hint: 'Keep walking',
  soundOn: 'Sound on', soundOff: 'Sound off',
  card: { name: 'NAME', id: 'ID', zone: 'ZONE', balance: 'OPENING BALANCE', signed: 'SIGNED' },
  signedAs: n => `Carbon ID signed: ${n}.`,
  meterMoves: d => d.map(x => `${x.name} ${x.d > 0 ? 'up' : 'down'} ${Math.abs(x.d)}`).join(', '),
  wallet: (ccp, d) => `Wallet ${ccp} CCP${d ? (d < 0 ? `, ${-d} debited` : `, ${d} credited`) : ''}.`,
  chosen: t => `You chose: ${t}.`
};

/* ---------- receipt (ending.js) ----------
   LOG: per choice / callback — line = printed on the receipt, tag = tiny chart label,
   unit = printed after the amount. Missing entries fall back to the card title. */
STORY.LOG = {
  wall_worker: { line: 'Signed Work-for-Shelter',    tag: 'shelter' },
  tower:       { line: 'Rented a walled tower flat', tag: 'tower flat' },
  freelance:   { line: 'Lived off savings',          tag: 'savings' },
  honest:      { line: 'Kept to the 30 minutes',     tag: 'rules' },
  tank:        { line: 'Topped up from tower tank',  tag: 'tower tank' },
  bribed:      { line: 'Bribed the valve man',       tag: 'bribe' },
  reported:    { line: 'Reported the valve man',     tag: 'report' },
  tablets:     { line: 'SYN-NUT tablets',            tag: 'tablets' },
  imported:    { line: 'Bought imported vegetables', tag: 'vegetables' },
  terrace:     { line: 'Grew food on the terrace',   tag: 'terrace' },
  camp:        { line: 'Went to the Motera camp',    tag: 'camp' },
  tower_boat:  { line: 'Bought a tower boat seat',   tag: 'boat' },
  warned:      { line: 'Warned your pol',            tag: 'warned' },
  rescuer:     { line: 'Stayed to help rescue',      tag: 'rescue' },
  kept_pass:   { line: 'Used the pass',              tag: 'pass' },
  gave_pass:   { line: 'Gave the pass',              tag: 'pass' },
  sold_pass:   { line: 'Sold the pass',              tag: 'sold pass' },
  accepted:    { line: 'Accepted the match',         tag: '/ yr', unit: '/ yr' },
  declined:    { line: 'Passed on the match',        tag: 'passed' },
  'Building fine':    { line: 'Building fine',       tag: 'fine' },
  'Boat to hospital': { line: 'Boat to hospital',    tag: 'boat' }
};
STORY.MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
STORY.RECEIPT = {
  authority: 'AHMEDABAD RESOURCE AUTHORITY',
  title: 'CARBON CITIZEN LEDGER · 2070',
  who: name => `${name} · ${STORY.ID} · PALDI`,
  balance: 'CCP BALANCE',
  meters: 'YOUR FOUR METERS · FEB → DEC',
  short: { P: 'PRIVILEGE', E: 'ETHICS', W: 'PERSONAL', C: 'COMMUNITY' },
  choices: 'CHOICES LOGGED',
  closing: 'CLOSING BALANCE',
  footer: 'Printed on recycled thermal paper · this receipt cost 0.002 CCP',
  stamp: ['SURVIVED', '2070']
};

/* ---------- ending screen (ending.js) ---------- */
STORY.ENDING = {
  eyebrow: 'DECEMBER 2070 · THE LEDGER PRINTS',
  lede: 'Every choice was logged against your ID.<br>This is your year, in data.',
  toVerdict: 'WHAT IT SAYS ABOUT YOU',
  strongest: name => `YOUR STRONGEST METER · ${name}`,
  meter: name => name,
  meters: 'Your four meters. Choose one to read its question.',
  question: 'Would you live differently next time?',
  again: 'LIVE 2070 AGAIN'
};

window.STORY = STORY;
