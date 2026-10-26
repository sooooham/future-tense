/* Future: Tense — engine.
   One horizontal camera over STORY.BEATS (one beat = one viewport width).
   Worlds morph softly into each other, gates hold you at the ID card and the
   six checkpoints, and every choice is written into S for the receipt.
   All words come from story.js.                                           */

(() => {
  const $ = (q, r = document) => r.querySelector(q);
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const sign = n => (n > 0 ? '+' : n < 0 ? '−' : '') + Math.abs(n);
  const T = STORY.tidy;

  const B = STORY.BEATS, N = B.length, CPS = STORY.CHECKPOINTS, UI = STORY.UI, MAX = STORY.START.max;
  const CP_TOTAL = Object.keys(CPS).length;
  const NAT = { 'pol-ochre': 300, 'pol-mint': 280, 'pol-rose': 320, chabutra: 300, apartment: 270, hospital: 290, tower: 540,
    'dead-tree': 420, sapling: 90, 'farm-hut': 150, 'jhulta-minar': 320, 'teen-darwaza': 190, motera: 160, mill: 420 };
  const PAR = { far: .55, mid: .85, near: 1 };
  const SKY_DRIFT = .06;
  const params = new URLSearchParams(location.search);
  const DEBUG = params.has('debug');

  const mq = matchMedia('(prefers-reduced-motion: reduce)');
  let reduced = mq.matches; mq.addEventListener && mq.addEventListener('change', e => { reduced = e.matches; });
  const phoneQ = matchMedia('(max-width: 760px), (orientation: portrait)');

  const body = document.body, hud = { logo: $('#logo'), readout: $('#readout'), wallet: $('#wallet'), stamp: $('#stamp'),
    msgs: $('#msgs'), meters: $('#meters'), sound: $('#sound'), hint: $('#hint'), prog: $('#prog') };
  const actor = { prints: $('#prints'), walker: $('#walker'), raft: $('#raft'), tag: $('#tag') };
  const cpEl = $('#cp'), live = $('#live'), fade = $('#fade');

  /* ---------- state ---------- */
  let S;
  function fresh(keep = {}) {
    const m = { P: STORY.START.meter, E: STORY.START.meter, W: STORY.START.meter, C: STORY.START.meter };
    S = { name: keep.name || STORY.DEFAULT_NAME, ccp: STORY.START.ccp, m, flags: new Set(), answers: {},
      log: [], bal: [{ mon: 'JAN', ccp: STORY.START.ccp }], snaps: [{ mon: 'JAN', m: { ...m } }],
      entered: !!keep.entered, signed: !!keep.signed, seen: new Set(), resolved: new Set() };
  }
  const api = () => ({ has: f => S.flags.has(f), ccp: S.ccp, m: { ...S.m }, name: S.name });
  const monOf = i => STORY.WORLDS[B[i].w].month.slice(0, 3);
  fresh();

  /* ---------- geometry ---------- */
  let W = innerWidth, H = innerHeight, G, F, phone;
  const cam = { cur: 0, target: 0 };
  let stage = 'hero';                // hero → id → walk → cp → after → walk … → end
  const walk = { x: 0, target: 0, phase: 0, dist: 0, foot: 0, v: 0, idle: 0 };

  /* runs: consecutive beats in the same world share one full-screen container */
  const runs = [];
  B.forEach((b, i) => { const r = runs[runs.length - 1]; if (r && r.w === b.w) r.last = i; else runs.push({ w: b.w, first: i, last: i }); });
  const runOf = i => runs.findIndex(r => i >= r.first && i <= r.last);

  const placed = [];   // {el, kind, spec, beat, run, layer}
  const dyn = [];      // things resolved when you first approach a beat: {beat, el, spec, kind}
  const caps = [];     // {el, beat}

  /* ---------- build: worlds ---------- */
  function buildWorlds() {
    const host = $('#worlds');
    runs.forEach((r, k) => {
      const w = STORY.WORLDS[r.w], d = el('div', 'run');
      d.dataset.w = r.w;
      r.sky = el('div', 'sky'); r.sky.style.backgroundImage = `url(assets/img/${w.sky}.webp)`;
      const grade = el('div', 'grade'); grade.style.background = w.tint;
      r.far = el('div', 'layer far'); r.mid = el('div', 'layer mid'); r.near = el('div', 'layer near');
      const haze = el('div', 'haze'); haze.style.background = `linear-gradient(transparent, ${w.haze} 55%, transparent)`;
      d.append(r.sky, grade, r.far, haze, r.mid);
      if (w.water) {
        r.ground = el('div', 'water', '<div class="rip"></div><div class="rip b"></div><div class="bits"></div>');
        const bits = r.ground.querySelector('.bits');
        for (let j = 0; j < 14; j++) { const b = el('i'); b.dataset.x = Math.random(); b.dataset.y = .12 + Math.random() * .8; b.style.width = (8 + Math.random() * 18) + 'px'; bits.append(b); }
        r.rips = r.ground.querySelectorAll('.rip'); r.bits = [...bits.children];
      } else if (w.sea) {
        r.ground = el('div', 'sea'); r.ground.style.backgroundImage = `url(assets/img/${w.ground}.webp)`;
      } else {
        r.ground = el('div', 'ground'); r.ground.style.backgroundImage = `url(assets/img/${w.ground}.webp)`;
      }
      d.append(r.ground, r.near);
      if (w.rain) { r.rain = el('div', 'rain', '<i></i><i class="b"></i>'); d.append(r.rain); }
      r.el = d; r.haze = w.haze; r.k = k;
      host.append(d);

      for (let i = r.first; i <= r.last; i++) {
        const b = B[i];
        (b.props || []).forEach(p => {
          const img = el('img', 'prop' + (p.cls ? ' ' + p.cls : ''));
          img.src = `assets/svg/${p.src}.svg`; img.alt = ''; img.decoding = 'async';
          r[p.layer || 'mid'].append(img);
          placed.push({ el: img, kind: 'prop', spec: p, beat: i, run: r, layer: p.layer || 'mid' });
        });
        (b.smoke || []).forEach(x => {
          const s = el('div', 'smoke', '<i></i><i></i><i></i>');
          r.mid.append(s);
          placed.push({ el: s, kind: 'smoke', spec: { x }, beat: i, run: r, layer: 'mid' });
        });
        (b.html || []).filter(h => h.layer !== 'story').forEach(h => {
          const e = el('div', 'html ' + (h.cls || ''));
          r[h.layer || 'near'].append(e);
          placed.push({ el: e, kind: 'html', spec: h, beat: i, run: r, layer: h.layer || 'near' });
          if (typeof h.html === 'function') dyn.push({ beat: i, el: e, spec: h, kind: 'html' }); else e.innerHTML = h.html;
        });
      }
    });
  }

  /* ---------- build: story layer ---------- */
  const strip = el('div'); strip.id = 'strip';
  let heroEl, idEl, nameInput, signBtn, cardEl;
  function buildTrack() {
    $('#track').append(strip);
    B.forEach((b, i) => {
      const bt = el('section', 'beat'); bt.dataset.i = i; b.el = bt; strip.append(bt);
      if (b.gate === 'hero') bt.append(heroEl = buildHero());
      if (b.gate === 'id') bt.append(idEl = buildId());
      (b.say || []).forEach(c => {
        const e = el('p', 'cap'); bt.append(e);
        caps.push({ el: e, beat: i, spec: c });
        if (typeof c.html === 'function' || c.when) dyn.push({ beat: i, el: e, spec: c, kind: 'cap' }); else e.innerHTML = `<span>${T(c.html)}</span>`;
      });
      if (b.notice) bt.append(buildNotice(b.notice, i));
      (b.html || []).filter(h => h.layer === 'story').forEach(h => {
        const e = el('div', h.cls || ''); bt.append(e);
        placed.push({ el: e, kind: 'story', spec: h, beat: i });
        caps.push({ el: e, beat: i, spec: h });
        if (typeof h.html === 'function') dyn.push({ beat: i, el: e, spec: h, kind: 'html' }); else e.innerHTML = h.html;
      });
    });
  }

  function buildHero() {
    const h = STORY.HERO, d = el('div', 'hero');
    d.innerHTML = `<p class="credit note-band">${STORY.CREDIT}</p>
      <p class="eyebrow">${h.eyebrow}</p>
      <p class="cap"><span>${T(h.caption)}</span></p>
      <button class="btn cta" type="button">${h.cta} <span aria-hidden="true">→</span></button>
      <p class="note note-band">${h.note}</p>
      <div class="timeline">${STORY.TIMELINE.map(([n, m, w]) => `<div><i style="background:${STORY.WORLDS[w].color}"></i>${n}<small>${m}</small></div>`).join('')}</div>`;
    d.querySelector('.cta').addEventListener('click', enter);
    return d;
  }

  function buildId() {
    const c = STORY.IDCARD, L = UI.card, d = el('div', 'idc');
    d.innerHTML = `<p class="cap"><span>${c.caption}</span></p>
      <div class="card">
        <div class="hd"><p>${c.authority}</p><span class="gu" lang="gu">${c.city}</span></div>
        <div class="bd">
          <div><div class="ph"></div><div class="bars"></div></div>
          <div>
            <label for="nm">${L.name}</label>
            <div class="nm"><input id="nm" maxlength="20" autocomplete="off" spellcheck="false" placeholder="${STORY.DEFAULT_NAME}"></div>
            <dl><dt>${L.id}</dt><dd>${STORY.ID}</dd><dt>${L.zone}</dt><dd>${c.zone}</dd><dt>${L.balance}</dt><dd>${STORY.START.ccp} CCP</dd></dl>
          </div>
        </div>
        <p class="fine">${c.fine}</p>
        <div class="sig" aria-hidden="true">${L.signed}</div>
      </div>
      <button class="btn sign" type="button">${c.button} <span aria-hidden="true">→</span></button>
      <p class="idc-note">${c.note.map(t => `<span class="note-band">${t}</span>`).join('')}</p>`;
    nameInput = d.querySelector('input'); signBtn = d.querySelector('.sign'); cardEl = d.querySelector('.card');
    signBtn.addEventListener('click', doSign);
    nameInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); doSign(); } });
    return d;
  }

  function buildNotice(n, i) {
    const d = el('div', 'notice');
    d.innerHTML = `<div class="post"></div><div class="sheet"><div class="frame">
      <p class="nh">${n.header}<small>${n.order}</small></p>
      <div class="nb"><h3>${n.title}</h3><p class="big">${n.big}</p><p class="sub">${n.sub}</p>
      <p class="lang"><span class="gu" lang="gu">${n.gu}</span> · <em>${n.en}</em></p></div></div></div>`;
    placed.push({ el: d, kind: 'notice', spec: n, beat: i });
    return d;
  }

  /* ---------- build: HUD ---------- */
  const meterEls = {};
  function buildHud() {
    STORY.METERS.forEach(mt => {
      const d = el('div', 'mt');
      d.innerHTML = `<span class="v"></span><span class="d"></span><span class="pv" aria-hidden="true"></span><span class="ic">${mt.icon}</span><span class="bar">${'<i></i>'.repeat(MAX)}</span><span class="l">${mt.name}</span>`;
      d.setAttribute('role', 'meter'); d.setAttribute('aria-label', mt.name);
      d.setAttribute('aria-valuemin', 0); d.setAttribute('aria-valuemax', MAX);
      hud.meters.append(d);
      meterEls[mt.k] = { el: d, d: d.querySelector('.d'), v: d.querySelector('.v'), pv: d.querySelector('.pv'), segs: [...d.querySelectorAll('.bar i')] };
    });
    $('#hint span').textContent = UI.hint;
    $('.wl-h span').textContent = STORY.ID;
    $('.wl-cap').textContent = STORY.HERO.wallet;
    const p = hud.prog;
    B.forEach((b, i) => { if (CPS[b.gate]) { const t = el('i'); t.dataset.cp = b.gate; t.dataset.i = i; p.append(t); } });
    hud.sound.addEventListener('click', () => setSound(!soundWanted));
    soundUi();
  }
  /* sound is on by default (R2-11). Browsers only allow it after a gesture, so it
     starts on entering the story; if that was a scroll, the next click or key resumes it. */
  let soundWanted = true;
  function setSound(on) {
    soundWanted = on;
    if (S.entered || AUDIO.ctx) AUDIO.toggle(on);
    soundUi();
  }
  function soundUi() {
    hud.sound.setAttribute('aria-pressed', soundWanted);
    hud.sound.querySelector('span').textContent = soundWanted ? UI.soundOn : UI.soundOff;
  }
  const resumeAudio = () => { if (AUDIO.on && AUDIO.ctx && AUDIO.ctx.state !== 'running') AUDIO.ctx.resume(); };
  ['pointerdown', 'keydown', 'touchend'].forEach(ev => addEventListener(ev, resumeAudio, true));

  /* ---------- layout (on load + resize) ---------- */
  function layout() {
    const oldW = W;
    W = innerWidth; H = innerHeight; G = H * .27; F = W * .45; phone = phoneQ.matches;
    cam.cur *= W / oldW; cam.target *= W / oldW;
    strip.style.width = N * W + 'px';
    B.forEach((b, i) => { b.el.style.left = i * W + 'px'; b.el.style.width = W + 'px'; });

    runs.forEach(r => {
      const n = r.last - r.first + 2;
      r.sky.style.width = W * (1 + SKY_DRIFT * n + .12) + 'px';
      r.sky.style.left = -W * .06 + 'px';
    });

    const ps = phone ? .8 : 1, edge = phone ? 66 : 28;
    placed.forEach(p => {
      const s = p.spec, e = p.el;
      if (p.kind === 'prop') {
        const f = PAR[p.layer], left = (p.beat - p.run.first) * W * f + s.x * W;
        if (s.w) { e.style.width = s.w * W + 'px'; e.style.height = s.h * H + 'px'; }
        else { e.style.height = NAT[s.src] * (s.s || 1) * H / 982 * ps + 'px'; e.style.width = 'auto'; }
        e.style.left = left + 'px'; e.style.bottom = G - (s.sink || 0) * H + 'px';
      } else if (p.kind === 'smoke' || p.kind === 'html') {
        const f = PAR[p.layer];
        e.style.left = (p.beat - p.run.first) * W * f + s.x * W + 'px';
        e.style.bottom = G + (p.kind === 'html' ? H * .14 : 0) + 'px';
      } else if (p.kind === 'notice') {
        const top = H * (phone ? .36 : .27);
        e.style.top = top + 'px';
        e.style.left = Math.min(s.x * W, W - e.offsetWidth - edge) + 'px';
        const post = e.querySelector('.post');
        post.style.top = '60px'; post.style.height = Math.max(0, H * .745 - top - 60) + 'px';
      } else if (p.kind === 'story') {
        e.style.top = H * (phone ? .2 : .14) + 'px';
        e.style.left = Math.min(s.x * W, W - e.offsetWidth - edge) + 'px';
      }
    });
    caps.forEach(c => {
      if (!c.el.classList.contains('cap')) return;
      const s = c.spec;
      c.el.style.left = (phone ? W * .05 : Math.max(s.x * W, 250)) + 'px';
      c.el.style.top = (phone ? (s.y - .2) * H * .9 + H * .3 : s.y * H) + 'px';
    });

    /* hero: caption, CTA and note stack under the big logo */
    const L = hud.logo;
    const lt = L.offsetTop, lh = L.offsetHeight;
    const hc = heroEl.querySelector('.cap'), cta = heroEl.querySelector('.cta'), note = heroEl.querySelector('.note');
    heroEl.querySelector('.eyebrow').style.top = lt - 34 + 'px';
    hc.style.top = lt + lh + 24 + 'px';
    cta.style.top = lt + lh + 24 + hc.offsetHeight + 34 + 'px';
    note.style.top = lt + lh + 24 + hc.offsetHeight + 34 + cta.offsetHeight + 12 + 'px';
    /* phone: the credit line sits under the note instead of top-right (the wallet is there) */
    heroEl.querySelector('.credit').style.top = phone ? note.offsetTop + note.offsetHeight + 10 + 'px' : '';

    /* the logo docks with one uniform scale (FLIP-style, stays crisp at both ends) */
    const fs = parseFloat(getComputedStyle(L).fontSize), sc = 20 / fs, dockX = phone ? 16 : 28, dockY = phone ? 14 : 22;
    L.style.setProperty('--dock', `translate(${dockX - L.offsetLeft}px, ${dockY - lt}px) scale(${sc})`);
    hud.readout.style.left = dockX + L.offsetWidth * sc + 12 + 'px';
    hud.readout.style.top = dockY + (lh * sc - hud.readout.offsetHeight) / 2 + 'px';
    const ww = hud.wallet.offsetWidth;
    const hx = phone ? W - ww - 16 : W * .76, hy = phone ? 14 : H * .26;
    hud.wallet.style.setProperty('--hero', `translate(${hx - hud.wallet.offsetLeft}px, ${hy - hud.wallet.offsetTop}px)`);
    hud.stamp.style.left = hud.wallet.offsetLeft + ww + 14 + 'px';
    hud.msgs.style.top = phone ? '' : hud.readout.offsetTop + hud.readout.offsetHeight + 16 + 'px';

    [...hud.prog.querySelectorAll('i')].forEach(t => { t.style.left = (t.dataset.i / (N - 1)) * 100 + '%'; });

    /* walker / raft size */
    const wh = H * (phone ? .2 : .32);
    walk.h = wh; walk.w = wh * 167 / 311;
    actor.walker.style.width = walk.w + 'px';
    actor.walker.style.top = H * .76 - wh + 'px';
    const rh = H * (phone ? .15 : .2), rw = rh * 380 / 230;
    walk.rh = rh; walk.rw = rw;
    actor.raft.style.width = rw + 'px';
    actor.raft.style.top = H * .755 - rh * .84 + 'px';
    actor.raft.style.left = W * (phone ? .02 : .04) + 'px';
    walk.target = S.entered ? W * (phone ? .05 : .07) : W * (phone ? .62 : .66);
    if (!walk.moving) walk.x = walk.target;
    render(0, 0, performance.now(), true);
  }
  const styleLogo = () => {
    hud.logo.style.transform = body.classList.contains('docked') ? 'var(--dock)' : 'none';
    hud.wallet.style.transform = body.classList.contains('at-hero') ? 'var(--hero)' : 'none';
  };

  /* ---------- gates ---------- */
  function gateDone(g) {
    if (g === 'hero') return S.entered;
    if (g === 'id') return S.signed;
    if (CPS[g]) return g in S.answers;
    return true;
  }
  function limitX() {
    for (let i = 0; i < N; i++) if (B[i].gate && !gateDone(B[i].gate)) return i * W;
    return (N - 1) * W;
  }
  const minX = () => (S.signed ? 2 : S.entered ? 1 : 0) * W;

  let lastNudge = 0;
  function nudge() {
    AUDIO.thud();
    const now = performance.now(); if (now - lastNudge < 500) return; lastNudge = now;
    const t = stage === 'cp' ? cpEl.querySelector('.cp-opts') : !S.signed ? cardEl : null;
    if (!t || reduced) return;
    t.classList.remove('shake'); void t.offsetWidth; t.classList.add('shake');
  }

  /* ---------- input ---------- */
  let lastInput = performance.now();
  function push(d) {
    if (stage === 'end') return;
    if (stage === 'hero') { if (d > 0) enter(); return; }
    if (stage === 'cp') { if (Math.abs(d) > 2) nudge(); return; }
    const lim = limitX(), mn = minX();
    let t = cam.target + d;
    if (t > lim) { if (d > 0 && cam.target >= lim - 2) nudge(); t = lim; }
    cam.target = clamp(t, mn, lim);
    lastInput = performance.now();
  }
  addEventListener('wheel', e => {
    if (stage === 'end') return;
    e.preventDefault();
    const k = e.deltaMode === 1 ? 36 : e.deltaMode === 2 ? W : 1;
    const d = (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY) * k;
    push(clamp(d, -140, 140) * 1.15);
  }, { passive: false });
  let touch = null;
  addEventListener('touchstart', e => { const t = e.touches[0]; touch = { x: t.clientX, y: t.clientY }; }, { passive: true });
  addEventListener('touchmove', e => {
    if (!touch || stage === 'end' || e.target.closest('#cp.on:not(.after), #end')) return;
    const t = e.touches[0], dx = touch.x - t.clientX, dy = touch.y - t.clientY;
    touch = { x: t.clientX, y: t.clientY };
    e.cancelable && e.preventDefault();
    push((Math.abs(dx) > Math.abs(dy) ? dx : dy) * 1.8);
  }, { passive: false });
  addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const tag = e.target.tagName, inField = tag === 'INPUT' || tag === 'TEXTAREA';
    const onControl = tag === 'BUTTON' || tag === 'A';
    if (inField) return;
    if (stage === 'cp') {
      if (['1', '2', '3'].includes(e.key)) { e.preventDefault(); choose(+e.key - 1); return; }
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const bs = [...cpEl.querySelectorAll('.opt')], j = bs.indexOf(document.activeElement);
        const dir = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1;
        bs[(j + dir + bs.length) % bs.length].focus();
        return;
      }
      if (e.key === ' ' && !onControl) { e.preventDefault(); nudge(); }
      return;
    }
    if (stage === 'end') return;
    const fwd = ['ArrowRight', 'ArrowDown', 'PageDown', 'd', 'D'].includes(e.key) || (e.key === ' ' && !onControl);
    const back = ['ArrowLeft', 'ArrowUp', 'PageUp', 'a', 'A'].includes(e.key);
    if (stage === 'hero' && (fwd || (e.key === 'Enter' && !onControl))) { e.preventDefault(); enter(); return; }
    if (fwd) { e.preventDefault(); push(W * (e.key === 'PageDown' ? .6 : .22)); }
    else if (back) { e.preventDefault(); push(-W * (e.key === 'PageUp' ? .6 : .22)); }
    else if (e.key === 'm' || e.key === 'M') setSound(!soundWanted);
  });

  /* ---------- prologue ---------- */
  function enter() {
    if (S.entered) return;
    S.entered = true; stage = 'id';
    if (soundWanted && !AUDIO.on) setSound(true);
    body.classList.remove('at-hero'); body.classList.add('docked'); styleLogo();
    walk.target = W * (phone ? .05 : .07);
    cam.target = W;
    setTimeout(() => nameInput.focus({ preventScroll: true }), 1100);
  }
  function doSign() {
    if (S.signed) return;
    S.name = (nameInput.value.trim() || STORY.DEFAULT_NAME).toUpperCase().slice(0, 20);
    nameInput.value = S.name; nameInput.readOnly = true;
    S.signed = true; stage = 'walk';
    cardEl.classList.add('signed'); body.classList.add('signed');
    AUDIO.stamp();
    say(`${UI.signedAs(S.name)} ${UI.wallet(S.ccp)}`);
    setTimeout(() => { cam.target = Math.max(cam.target, 2 * W); }, 650);
    signBtn.blur();
  }

  /* ---------- wallet, stamp, meters, messages ---------- */
  let shownCcp = S.ccp, ccpTween = null;
  const wN = $('.wl-n b'), wChip = $('.wl-n .chip'), wSegs = [...document.querySelectorAll('.wl-bar i')];
  function walletUi(delta, instant) {
    const from = shownCcp, to = S.ccp, t0 = performance.now(), dur = instant || reduced ? 0 : 900;
    cancelAnimationFrame(ccpTween);
    const step = t => {
      const k = dur ? clamp((t - t0) / dur, 0, 1) : 1, e = 1 - Math.pow(1 - k, 3);
      shownCcp = Math.round(from + (to - from) * e); wN.textContent = shownCcp;
      if (k < 1) ccpTween = requestAnimationFrame(step);
    };
    step(t0);
    const lit = Math.min(10, Math.ceil(to / 10)), was = Math.min(10, Math.ceil(from / 10));
    wSegs.forEach((s, j) => { s.classList.toggle('on', j < lit); s.classList.toggle('lost', !instant && j >= lit && j < was); });
    if (!instant) setTimeout(() => wSegs.forEach(s => s.classList.remove('lost')), 2600);
    if (delta) {
      wChip.textContent = sign(delta); wChip.className = 'chip on ' + (delta < 0 ? 'minus' : 'plus');
      clearTimeout(wChip.t); wChip.t = setTimeout(() => wChip.classList.remove('on'), 3600);
    } else if (instant) wChip.className = 'chip';
  }
  function stamp(delta) {
    if (!delta) return;
    const s = hud.stamp;
    s.querySelector('span').textContent = delta < 0 ? UI.debited : UI.credited;
    s.querySelector('b').textContent = `${Math.abs(delta)} CCP`;
    s.classList.toggle('credit', delta > 0);
    s.classList.remove('on'); void s.offsetWidth; s.classList.add('on');
    clearTimeout(s.t); s.t = setTimeout(() => s.classList.remove('on'), 2900);
    AUDIO.stamp(); delta < 0 ? AUDIO.debit() : AUDIO.credit();
  }
  /* meters (R2-20): the delta chip shows for 3.5s, segments fill or drain one at a
     time with a tick, and the whole meter flashes once (tan up, rust down) */
  function metersUi(deltas = {}, instant) {
    let n = 0;
    STORY.METERS.forEach(mt => {
      const M = meterEls[mt.k], v = S.m[mt.k], d = deltas[mt.k] || 0;
      M.el.setAttribute('aria-valuenow', v);
      const paint = k => { M.v.textContent = k; M.segs.forEach((s, j) => s.classList.toggle('on', j < k)); };
      clearTimeout(M.t0); clearInterval(M.iv);
      if (!d || instant) {
        paint(v);
        if (instant) { clearTimeout(M.t); M.d.className = 'd'; M.el.classList.remove('up', 'down'); M.segs.forEach(s => s.classList.remove('flash', 'drop')); }
        return;
      }
      M.t0 = setTimeout(() => {
        M.d.textContent = sign(d); M.d.className = 'd on ' + (d > 0 ? 'plus' : 'minus');
        M.el.classList.remove('up', 'down'); void M.el.offsetWidth; M.el.classList.add(d > 0 ? 'up' : 'down');
        M.segs.forEach(s => s.classList.remove('flash', 'drop'));
        let k = v - d;
        const tick = () => {
          k += Math.sign(d); paint(k); AUDIO.meter(d > 0);
          M.segs[d > 0 ? k - 1 : k].classList.add(d > 0 ? 'flash' : 'drop');
          if (k === v) clearInterval(M.iv);
        };
        if (reduced) { M.segs.forEach((s, j) => { if (d > 0 ? j >= v - d && j < v : j >= v && j < v - d) s.classList.add(d > 0 ? 'flash' : 'drop'); }); paint(v); AUDIO.meter(d > 0); }
        else { tick(); if (k !== v) M.iv = setInterval(tick, 150); }
        clearTimeout(M.t); M.t = setTimeout(() => { M.d.className = 'd'; M.el.classList.remove('up', 'down'); M.segs.forEach(s => s.classList.remove('flash', 'drop')); }, 3500);
      }, reduced ? 0 : 250 + n++ * 220);
    });
  }
  /* choice preview: ↑ / ↓ beside the meters a card would move, no numbers */
  function preview(o) {
    STORY.METERS.forEach(mt => {
      const d = o ? (o.fx[mt.k] || 0) : 0, pv = meterEls[mt.k].pv;
      pv.textContent = d > 0 ? '↑' : d < 0 ? '↓' : '';
      pv.className = 'pv' + (d > 0 ? ' up' : d < 0 ? ' down' : '');
    });
  }
  /* one message at a time, top-centre under the readout (R2-21) */
  function message(m) {
    [...hud.msgs.children].forEach(o => { o.classList.add('out'); setTimeout(() => o.remove(), 400); });
    const d = el('div', 'msg' + (m.kind === 'alert' ? ' alert' : ''));
    d.innerHTML = `<p>${m.from}${m.time ? ` · ${m.time}` : ''}</p><p>${T(m.text)}</p>`;
    hud.msgs.append(d);
    AUDIO.msg();
    setTimeout(() => { d.classList.add('out'); setTimeout(() => d.remove(), 600); }, 8000);
  }
  const say = t => { live.textContent = ''; setTimeout(() => { live.textContent = t.replace(/<[^>]+>/g, ''); }, 60); };

  /* apply a change to S — used by checkpoints and `enter` callbacks */
  function apply({ ccp = 0, fx = {}, flag, mon, label, logIt }) {
    if (flag) S.flags.add(flag);
    const before = S.ccp;
    S.ccp = Math.max(0, S.ccp + ccp);
    const delta = S.ccp - before, deltas = {};
    Object.entries(fx).forEach(([k, d]) => { const v = clamp(S.m[k] + d, 0, MAX); if (v !== S.m[k]) deltas[k] = v - S.m[k]; S.m[k] = v; });
    if (logIt) S.log.push({ mon, label, flag, ccp: delta });
    if (delta || logIt) S.bal.push({ mon, ccp: S.ccp });
    if (Object.keys(deltas).length || logIt) S.snaps.push({ mon, m: { ...S.m } });
    return { delta, deltas };
  }
  function consequence({ delta, deltas }, msg, text, instant) {
    if (instant) { walletUi(0, true); metersUi({}, true); return; }
    stamp(delta); walletUi(delta); metersUi(deltas);
    if (msg) setTimeout(() => message(msg), 700);
    const moves = STORY.METERS.filter(m => deltas[m.k]).map(m => ({ name: m.name, d: deltas[m.k] }));
    say([text, UI.wallet(S.ccp, delta), moves.length ? UI.meterMoves(moves) + '.' : ''].filter(Boolean).join(' '));
  }

  /* `enter` callbacks: once per beat, the first time you reach it */
  function runEnter(i, instant) {
    if (S.seen.has(i)) return; S.seen.add(i);
    (B[i].enter || []).forEach((e, j) => {
      const s = api();
      if (e.when && !e.when(s)) return;
      const r = apply({ ccp: e.ccp || 0, fx: e.fx, mon: e.month || monOf(i), label: e.label, logIt: e.ccp != null });
      if (instant) return;
      setTimeout(() => consequence(r, e.msg, e.msg ? e.msg.text : ''), j * 900);
    });
  }

  /* captions / phone that depend on your story so far */
  function resolve(i) {
    if (S.resolved.has(i)) return; S.resolved.add(i);
    const s = api();
    dyn.filter(d => d.beat === i).forEach(d => {
      const sp = d.spec, ok = !sp.when || sp.when(s);
      const html = typeof sp.html === 'function' ? sp.html(s) : sp.html;
      if (d.kind === 'cap') { d.el.hidden = !ok; d.el.innerHTML = `<span>${T(html)}</span>`; }
      else d.el.innerHTML = html;
    });
  }

  /* ---------- checkpoints ---------- */
  let cpNow = null;
  const priceText = o => o.priceLabel || (o.price === 0 ? '0 CCP' : `${sign(o.price)} CCP`);
  const lockOf = o => o.locked || (o.price < 0 && !o.free && S.ccp < -o.price ? UI.need(-o.price) : null);

  function openCP(i) {
    const id = B[i].gate, cp = CPS[id], s = api(), opts = cp.opts(s), w = STORY.WORLDS[B[i].w];
    stage = 'cp'; cpNow = { id, cp, opts, beat: i, ready: false };
    cpEl.querySelector('.cp-n').textContent = `${cp.n}/${CP_TOTAL}`;
    cpEl.querySelector('.cp-l').textContent = UI.checkpoint;
    cpEl.querySelector('.cp-m').textContent = `${w.month} · ${cp.label}`;
    cpEl.querySelector('.cp-dots').innerHTML = Array.from({ length: CP_TOTAL }, (_, j) => `<i class="${j < cp.n ? 'on' : ''}"></i>`).join('');
    cpEl.querySelector('.cp-because').textContent = cp.because ? cp.because(s) : '';
    cpEl.querySelector('.cp-q').textContent = T(cp.q);
    const box = cpEl.querySelector('.cp-opts'); box.innerHTML = ''; box.setAttribute('aria-label', cp.q);
    box.style.setProperty('--n', opts.length);
    let armed = -1, lastPointer = '';
    opts.forEach((o, j) => {
      const lock = lockOf(o), p = o.price;
      const b = el('button', 'opt');
      b.type = 'button'; b.disabled = !!lock; b.setAttribute('aria-keyshortcuts', String(j + 1));
      b.innerHTML = `<span class="top"><span class="k" aria-hidden="true">${j + 1}</span><span class="p ${p < 0 ? 'minus' : p > 0 ? 'plus' : ''}">${priceText(o)}</span></span>
        <span class="ti">${T(o.title)}</span><span class="wy">${T(o.why)}</span>${lock ? `<span class="lk">${lock}</span>` : `<span class="ta" aria-hidden="true">${UI.tapAgain}</span>`}`;
      b.addEventListener('pointerdown', e => { lastPointer = e.pointerType; });
      const held = () => { const f = [...box.children].findIndex(c => c.matches(':focus-visible')); return opts[armed >= 0 ? armed : f] || null; };
      b.addEventListener('pointerenter', e => { if (e.pointerType !== 'touch') preview(o); });
      b.addEventListener('pointerleave', e => { if (e.pointerType !== 'touch') preview(held()); });
      b.addEventListener('focus', () => { if (b.matches(':focus-visible')) preview(o); });
      b.addEventListener('blur', () => setTimeout(() => preview(held()), 0));
      /* touch: the first tap shows what's at stake, the second one chooses */
      b.addEventListener('click', () => {
        if (lastPointer === 'touch' && armed !== j) {
          armed = j; preview(o);
          [...box.children].forEach((c, i) => c.classList.toggle('armed', i === j));
          lastPointer = ''; return;
        }
        choose(j);
      });
      box.append(b);
    });
    /* the meter strip slides in next to the cards so the arrows sit beside them */
    if (!phone) {
      const r = box.lastElementChild.getBoundingClientRect().right, m = hud.meters.getBoundingClientRect().left;
      hud.meters.style.setProperty('--cp-shift', Math.max(0, m - r - 48) + 'px');
    }
    const after = cpEl.querySelector('.cp-after'); after.className = 'cp-after';
    cpEl.className = 'on'; body.classList.add('cp-on');
    AUDIO.duck(true); hud.hint.classList.remove('on');
    setTimeout(() => {
      if (cpNow?.id !== id) return;
      cpEl.classList.add('show'); cpNow.ready = true;
      say(`${UI.checkpoint} ${cp.n}/${CP_TOTAL}. ${cp.q} ${UI.keys(opts.length)}`);
      const first = box.querySelector('.opt:not(:disabled)'); first && first.focus({ preventScroll: true });
    }, reduced ? 100 : 800);
  }

  function choose(j, silent) {
    if (!cpNow || (!silent && (stage !== 'cp' || !cpNow.ready))) return;
    const o = cpNow.opts[j]; if (!o) return;
    const btn = cpEl.querySelectorAll('.opt')[j];
    if (lockOf(o)) { if (!silent) { AUDIO.thud(); if (!reduced) { btn.classList.remove('shake'); void btn.offsetWidth; btn.classList.add('shake'); } } return; }
    const { id, cp } = cpNow;
    S.answers[id] = j;
    const r = apply({ ccp: o.price, fx: o.fx, flag: o.flag, mon: cp.month, label: o.title, logIt: true });
    if (silent) { cpNow = null; return r; }
    stage = 'after';
    AUDIO.pick(); btn.classList.add('sel'); cpEl.classList.add('chose'); preview(null);
    const after = cpEl.querySelector('.cp-after');
    after.querySelector('span').innerHTML = T(o.after || '');
    setTimeout(() => {
      cpEl.classList.add('after'); after.classList.add('on'); body.classList.remove('cp-on'); AUDIO.duck(false);
      document.activeElement && document.activeElement.blur();
      consequence(r, o.msg, `${UI.chosen(o.title)} ${o.after || ''}`);
      progressUi();
    }, reduced ? 200 : 650);
    setTimeout(() => { stage = 'walk'; cpNow.done = true; lastInput = 0; }, reduced ? 600 : 2150);
  }
  function closeAfter() {
    const after = cpEl.querySelector('.cp-after');
    after.classList.add('gone');
    setTimeout(() => { if (stage !== 'cp') cpEl.className = ''; }, 600);
    cpNow = null;
  }
  function progressUi() {
    [...hud.prog.querySelectorAll('i')].forEach(t => t.classList.toggle('done', t.dataset.cp in S.answers));
  }

  /* ---------- the camera, every frame ---------- */
  let last = performance.now(), worldNow = null, tagNow = null, endTimer = null;
  function frame(t) {
    const dt = Math.min(50, t - last); last = t;
    const k = 1 - Math.pow(1 - (reduced ? .3 : .085), dt / 16.7);
    const prev = cam.cur;
    cam.cur += (cam.target - cam.cur) * k;
    if (Math.abs(cam.target - cam.cur) < .3) cam.cur = cam.target;
    const v = cam.cur - prev;
    render(v, dt, t);
    logic(t);
    requestAnimationFrame(frame);
  }

  function coverage(k, x) {
    if (k === 0) return 1;
    const e = runs[k].first * W - .15 * W - cam.cur;
    return clamp((x - (e - F / 2)) / F, 0, 1);
  }
  /* how much of each run is visible at screen x (later runs cover earlier ones) */
  function shares(x) {
    const out = []; let rest = 1;
    for (let k = runs.length - 1; k >= 0; k--) { const c = coverage(k, x); out[k] = c * rest; rest *= 1 - c; }
    return out;
  }
  function worldAt(x) {
    for (let k = runs.length - 1; k >= 0; k--) if (coverage(k, x) >= .5) return k;
    return 0;
  }

  function render(v, dt, t, force) {
    const cur = cam.cur;
    strip.style.transform = `translate3d(${-cur}px,0,0)`;

    /* worlds + soft morph */
    let full = 0;
    runs.forEach((r, k) => { if (k && r.first * W - .15 * W - cur + F / 2 < 0) full = k; });
    let join = null;
    runs.forEach((r, k) => {
      const e = r.first * W - .15 * W - cur;
      const hidden = k < full || (k > 0 && e - F / 2 > W);
      if (r.hidden !== hidden) { r.el.style.display = hidden ? 'none' : ''; r.hidden = hidden; }
      if (hidden) return;
      if (k === 0 || e + F / 2 < 0) { if (r.masked) { r.el.style.maskImage = r.el.style.webkitMaskImage = 'none'; r.masked = false; } }
      else {
        const m = `linear-gradient(90deg, transparent ${e - F / 2}px, #000 ${e + F / 2}px)`;
        r.el.style.maskImage = r.el.style.webkitMaskImage = m; r.masked = true;
        join = { e, haze: r.haze };
      }
      const o = cur - r.first * W;
      r.sky.style.transform = `translate3d(${-o * SKY_DRIFT}px,0,0)`;
      r.far.style.transform = `translate3d(${-o * PAR.far}px,0,0)`;
      r.mid.style.transform = `translate3d(${-o * PAR.mid}px,0,0)`;
      r.near.style.transform = `translate3d(${-o}px,0,0)`;
      const drift = reduced ? 0 : t / 1000;
      if (r.rips) {
        r.rips[0].style.backgroundPositionX = `${-o * 1.05 + drift * 18}px`;
        r.rips[1].style.backgroundPositionX = `${40 - o * 1.2 - drift * 26}px`;
        r.bits.forEach((b, j) => {
          const span = W * 1.4, x = ((+b.dataset.x * span - o - drift * (6 + j % 4 * 3)) % span + span) % span - W * .2;
          b.style.transform = `translate3d(${x}px, ${+b.dataset.y * G + Math.sin(drift * 1.3 + j) * 2}px, 0)`;
        });
      } else r.ground.style.backgroundPositionX = `${-o + (r.ground.classList.contains('sea') ? drift * 9 : 0)}px`;
    });
    const J = $('#join');
    if (join) {
      const p = 1 - Math.abs(join.e / W - .5) * 1.4;
      J.style.width = F + 'px'; J.style.transform = `translate3d(${join.e - F / 2}px,0,0)`;
      J.style.background = `linear-gradient(90deg, transparent, ${join.haze} 50%, transparent)`;
      J.style.opacity = clamp(p, 0, 1) * .38;
    } else J.style.opacity = 0;

    /* walker / raft */
    const moving = Math.abs(v) > .4 || Math.abs(walk.target - walk.x) > .5;
    const wx0 = walk.x;
    walk.x += (walk.target - walk.x) * (1 - Math.pow(1 - .03, (dt || 16.7) / 16.7));
    const dist = Math.abs(v) + Math.abs(walk.x - wx0);
    walk.moving = moving;
    const raftK = shares(walk.x + walk.w * .5).reduce((a, c, k) => a + (STORY.WORLDS[runs[k].w].raft ? c : 0), 0);
    if (moving && !reduced) walk.phase += dist / (walk.h * .3) * Math.PI;
    const bob = moving && !reduced ? Math.abs(Math.sin(walk.phase)) * walk.h * .022 : 0;
    const lean = reduced ? 0 : clamp(v * .12, -3, 4);
    actor.walker.style.transform = `translate3d(${walk.x}px, ${-bob}px, 0) rotate(${lean}deg)`;
    actor.walker.style.opacity = 1 - raftK;
    const rt = t / 1000, rb = reduced ? 0 : Math.sin(rt * 1.6) * 4, rr = reduced ? 0 : Math.sin(rt * 1.1) * 1.2;
    actor.raft.style.transform = `translate3d(0, ${rb}px, 0) rotate(${rr}deg)`;
    actor.raft.style.opacity = raftK;

    /* footprints on land */
    actor.prints.style.transform = `translate3d(${-cur}px,0,0)`;
    if (moving && raftK < .1 && S.entered) {
      walk.dist += dist;
      if (walk.dist > W * .09) {
        walk.dist = 0; walk.foot ^= 1;
        const p = el('img'); p.src = 'assets/img/footprint.webp'; p.alt = '';
        p.style.left = cur + walk.x + walk.w * (walk.foot ? .28 : .5) + 'px';
        p.style.top = H * .76 - 6 + (walk.foot ? 3 : 0) + 'px';
        actor.prints.append(p);
        requestAnimationFrame(() => requestAnimationFrame(() => { p.style.opacity = 0; }));
        setTimeout(() => p.remove(), 2600);
        AUDIO.step();
      }
    }
    AUDIO.speed(Math.abs(v));

    /* world tag beside your head */
    const wk = worldAt(walk.x + walk.w * .5), tag = STORY.WORLDS[runs[wk].w].tag;
    if (tag !== tagNow) { tagNow = tag; if (tag) actor.tag.querySelector('span').textContent = tag; }
    const showTag = !!tag && S.signed && stage !== 'end' && stage !== 'cp';
    actor.tag.classList.toggle('on', showTag);
    if (raftK > .5) actor.tag.style.transform = `translate3d(${W * (phone ? .02 : .04) + walk.rw * .42}px, ${parseFloat(actor.raft.style.top) - 34}px, 0)`;
    else actor.tag.style.transform = `translate3d(${walk.x + walk.w * .92}px, ${H * .76 - walk.h * 1.01}px, 0)`;

    /* readout + sound follow the world under the camera centre */
    const ck = worldAt(W / 2), cw = runs[ck].w;
    if (cw !== worldNow) {
      worldNow = cw; const w = STORY.WORLDS[cw];
      hud.readout.querySelector('.place').textContent = w.place;
      hud.readout.querySelector('.mon').textContent = w.month;
      hud.readout.querySelector('.data').innerHTML = w.data.map(d => `<span>${d}</span>`).join('<span class="sep">·</span>');
      AUDIO.setWorld(cw);
    }

    /* captions fade up as you approach */
    caps.forEach(c => {
      const inn = cur > c.beat * W - W * .6;
      if (c.in !== inn) { c.in = inn; c.el.classList.toggle('in', inn); c.el.setAttribute('aria-hidden', !inn); }
    });

    hud.prog.querySelector('b').style.width = (cur / ((N - 1) * W)) * 100 + '%';
  }

  function logic(t) {
    const cur = cam.cur;
    const lim = limitX();
    for (let i = 0; i < N; i++) {
      if (lim < i * W) break;                       /* nothing past an open gate is decided yet */
      if (cur > i * W - W * 1.25) resolve(i);
      if (S.signed && cur >= i * W - W * .4) runEnter(i);
    }
    if (stage === 'walk') {
      for (let i = 0; i < N; i++) {
        const g = B[i].gate;
        if (CPS[g] && !gateDone(g) && cur >= i * W - 2) { openCP(i); break; }
      }
      if (cpNow && cpNow.done && Math.abs(cur - cpNow.beat * W) > W * .18) closeAfter();
      const endI = B.findIndex(b => b.end);
      if (endI >= 0 && cur >= endI * W - 2 && !endTimer) endTimer = setTimeout(openEnding, STORY.END_CAPTION_DELAY);
      const canGo = cam.target < limitX() - 4;
      hud.hint.classList.toggle('on', S.signed && canGo && Math.abs(cam.target - cur) < 2 && t - lastInput > 2600);
    } else hud.hint.classList.remove('on');
  }

  /* ---------- ending + replay ---------- */
  function openEnding() {
    if (stage === 'end') return;
    stage = 'end'; body.classList.add('ending');
    if (cpNow) closeAfter();
    AUDIO.end();
    ENDING.open(S, { replay });
  }
  function replay() {
    fade.classList.add('on');
    setTimeout(() => {
      fresh({ name: S.name, entered: true, signed: true });
      ENDING.close();
      body.classList.remove('ending', 'cp-on'); cpEl.className = ''; cpNow = null;
      hud.msgs.innerHTML = ''; actor.prints.innerHTML = ''; clearTimeout(endTimer); endTimer = null;
      shownCcp = S.ccp; walletUi(0, true); metersUi({}, true); progressUi();
      cam.cur = cam.target = 2 * W; stage = 'walk'; lastInput = performance.now();
      render(0, 0, performance.now(), true);
      fade.classList.remove('on');
    }, 750);
  }

  /* ---------- debug: ?debug  ·  ?debug&beat=12&path=1,2,1 ---------- */
  function jump(n, path = []) {
    fresh({ name: S.name, entered: true, signed: true });
    cpNow = null; cpEl.className = ''; body.classList.remove('cp-on', 'ending', 'at-hero'); body.classList.add('docked', 'signed');
    nameInput.value = S.name; cardEl.classList.add('signed');
    let c = 0;
    for (let i = 0; i < Math.min(n, N); i++) {
      runEnter(i, true);
      const g = B[i].gate;
      if (CPS[g] && i < n) {
        const opts = CPS[g].opts(api()); cpNow = { id: g, cp: CPS[g], opts, beat: i };
        let j = (path[c++] || 1) - 1;
        if (!opts[j] || lockOf(opts[j])) j = opts.findIndex(o => !lockOf(o));
        choose(j, true);
      }
    }
    for (let i = 0; i < n; i++) S.resolved.delete(i);
    ENDING.close(); clearTimeout(endTimer); endTimer = null;
    styleLogo(); walk.target = walk.x = W * (phone ? .05 : .07);
    shownCcp = S.ccp; walletUi(0, true); metersUi({}, true); progressUi();
    cam.cur = cam.target = Math.min(n, N - 1) * W; stage = 'walk';
  }
  function debugPanel() {
    const d = el('div'); d.id = 'dbg'; document.body.append(d);
    const ctl = el('div', '', `beat <input id="dbg-b" type="number" min="2" max="${N - 1}" value="2"> path <input id="dbg-p" value="1,1,1,1,1,1" style="width:90px"> <button id="dbg-go">go</button>`);
    const out = el('div'); d.append(ctl, out);
    $('#dbg-go').onclick = () => jump(+$('#dbg-b').value, $('#dbg-p').value.split(',').map(Number));
    setInterval(() => {
      out.textContent = `\nstage ${stage} · beat ${(cam.cur / W).toFixed(2)} · ${worldNow}\nccp ${S.ccp}  P${S.m.P} E${S.m.E} W${S.m.W} C${S.m.C}\nflags ${[...S.flags].join(' ')}\n` +
        S.log.map(l => `${l.mon} ${l.label} ${l.ccp}`).join('\n');
    }, 300);
  }

  /* ---------- go ---------- */
  body.classList.add('notrans');
  buildWorlds(); buildTrack(); buildHud();
  walletUi(0, true); metersUi({}, true);
  layout(); styleLogo();
  let rz; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { layout(); styleLogo(); }, 120); });
  if (DEBUG) {
    debugPanel();
    window.FT = { get S() { return S; }, jump, choose: j => choose(j), push, stage: () => stage, api, openEnding };
    if (params.has('beat')) {
      body.classList.add('notrans');
      jump(+params.get('beat'), (params.get('path') || '').split(',').filter(Boolean).map(Number));
      setTimeout(() => body.classList.remove('notrans'), 300);
    }
  }
  document.fonts && document.fonts.ready.then(() => { layout(); styleLogo(); });
  requestAnimationFrame(frame);
  if (!params.has('beat')) setTimeout(() => body.classList.remove('notrans'), 400);
})();
