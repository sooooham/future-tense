/* Future: Tense — the ending.
   1. the receipt prints  2. it gets decoded, note by note  3. the verdict.
   Everything printed here is read from the run (S) and worded by story.js.  */

const ENDING = (() => {
  const $ = q => document.querySelector(q);
  const R = STORY.RECEIPT, D = STORY.DECODE, E = STORY.ENDING, MON = STORY.MONTHS, MAX = STORY.START.max;
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sign = n => (n > 0 ? '+' : n < 0 ? '−' : '') + Math.abs(n);
  const logOf = l => STORY.LOG[l.flag] || STORY.LOG[l.label] || { line: l.label, tag: l.label, phrase: l.label };
  const mi = m => MON.indexOf(m);
  let S, api, timers = [], ctx;
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));

  /* ---------- charts ---------- */
  function balanceSvg() {
    const w = 320, h = 104, px = 6, top = 14, bot = 18, ih = h - top - bot;
    const peak = Math.max(100, ...S.bal.map(b => b.ccp));
    const yMax = Math.ceil(peak / 100) * 100;
    const x = m => px + mi(m) / 11 * (w - px * 2), y = v => top + ih - v / yMax * ih;
    let d = `M${x('JAN')} ${y(S.bal[0].ccp)}`, prev = S.bal[0].ccp, dots = '';
    S.bal.slice(1).forEach(b => {
      d += ` L${x(b.mon)} ${y(prev)} L${x(b.mon)} ${y(b.ccp)}`;
      dots += `<circle cx="${x(b.mon)}" cy="${y(b.ccp)}" r="2.6" fill="${b.ccp < prev ? '#a3482e' : '#2a2725'}"/>`;
      prev = b.ccp;
    });
    d += ` L${x('DEC')} ${y(prev)}`;
    let grid = '';
    for (let v = 100; v <= yMax; v += 100) grid += `<line x1="${px}" x2="${w - px}" y1="${y(v)}" y2="${y(v)}" stroke="#2a2725" stroke-opacity=".12"/><text x="${w - px}" y="${y(v) - 2}" text-anchor="end" font-size="6.5" fill="#6d675f">${v}</text>`;
    /* label the biggest fall and the biggest rise */
    const moves = S.log.filter(l => l.ccp);
    const low = moves.filter(l => l.ccp < 0).sort((a, b) => a.ccp - b.ccp)[0], high = moves.filter(l => l.ccp > 0).sort((a, b) => b.ccp - a.ccp)[0];
    const balAfter = l => { let v = STORY.START.ccp; for (const e of S.log) { v = Math.max(0, v + e.ccp); if (e === l) return v; } return v; };
    let labels = '';
    if (low) labels += `<text x="${x(low.mon)}" y="${y(balAfter(low)) - 6}" text-anchor="middle" font-size="7" fill="#a3482e">${sign(low.ccp)} ${logOf(low).tag}</text>`;
    if (high) labels += `<text x="${x(high.mon) - 4}" y="${Math.max(8, y(balAfter(high)) + 3)}" text-anchor="end" font-size="7" fill="#2a2725">${sign(high.ccp)} ${logOf(high).tag}</text>`;
    const months = ['JAN', ...new Set(Object.values(STORY.CHECKPOINTS).map(c => c.month))];
    const ticks = months.map(m => `<text x="${x(m)}" y="${h - 2}" text-anchor="middle" font-size="6.5" fill="#6d675f">${m}</text>`).join('');
    return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${R.balance}: ${S.bal[0].ccp} to ${S.ccp}">
      ${grid}<line x1="${px}" x2="${w - px}" y1="${y(0)}" y2="${y(0)}" stroke="#2a2725" stroke-opacity=".35"/>
      <path d="${d}" fill="none" stroke="#2a2725" stroke-width="1.6" stroke-linejoin="round"/>
      <circle cx="${x('JAN')}" cy="${y(S.bal[0].ccp)}" r="2.6" fill="#2a2725"/>${dots}${labels}${ticks}</svg>`;
  }
  function meterSvg(k) {
    const w = 200, h = 26, x = m => mi(m) / 11 * w, y = v => h - v / MAX * h;
    const pts = S.snaps.map(s => ({ m: s.mon, v: s.m[k] }));
    let d = `M0 ${h} L0 ${y(pts[0].v)}`, prev = pts[0].v;
    pts.slice(1).forEach(p => { d += ` L${x(p.m)} ${y(prev)} L${x(p.m)} ${y(p.v)}`; prev = p.v; });
    d += ` L${w} ${y(prev)} L${w} ${h} Z`;
    return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><path d="${d}" fill="#2a2725" fill-opacity=".16" stroke="#2a2725" stroke-width="1" vector-effect="non-scaling-stroke"/></svg>`;
  }

  /* ---------- receipt ---------- */
  function receipt() {
    const start = S.snaps[0].m;
    const rows = S.log.map(l => `<tr><td>${l.mon}</td><td>${logOf(l).line}</td><td class="${l.ccp < 0 ? 'minus' : ''}">${l.ccp ? sign(l.ccp) : '0'}</td></tr>`);
    return `<div class="rc">
      <div class="rl c"><p class="auth">${R.authority}</p><p class="ttl">${R.title}</p><p class="sm">${R.who(S.name)}</p></div>
      <div class="rl"><hr></div>
      <div class="rl" data-pin="1"><h4>${R.balance}</h4>${balanceSvg()}</div>
      <div class="rl"><hr></div>
      <div class="rl" data-pin="2"><h4>${R.meters}</h4></div>
      ${STORY.METERS.map(m => `<div class="rl mrow"><span>${R.short[m.k]}</span>${meterSvg(m.k)}<b>${start[m.k]} → ${S.m[m.k]}</b></div>`).join('')}
      <div class="rl"><hr></div>
      <div class="rl" data-pin="3"><h4>${R.choices}</h4></div>
      ${rows.map(r => `<div class="rl"><table>${r}</table></div>`).join('')}
      <div class="rl"><hr></div>
      <div class="rl close" data-pin="4"><span>${R.closing}</span><span>${S.ccp} CCP</span></div>
      <div class="rl foot">${R.footer}</div>
      <div class="rstamp" aria-hidden="true"><span>${R.stamp[0]}</span><b>${R.stamp[1]}</b></div>
      ${[1, 2, 3, 4].map(n => `<span class="rpin" data-n="${n}"><span class="pin">${n}</span></span>`).join('')}
    </div>`;
  }
  function placePins() {
    document.querySelectorAll('.rc [data-pin]').forEach(sec => {
      const p = document.querySelector(`.rpin[data-n="${sec.dataset.pin}"]`);
      p.style.top = sec.offsetTop + (sec.dataset.pin === '1' ? 30 : 0) + 'px';
    });
  }
  function print() {
    const lines = [...document.querySelectorAll('.rc .rl')], gap = reduced() ? 0 : 120;
    lines.forEach((l, i) => later(() => { l.classList.add('in'); if (gap) AUDIO.printLine(); }, 500 + i * gap));
    later(() => {
      document.querySelector('.rstamp').classList.add('in'); AUDIO.stamp();
      const b = $('#to-decode'); b.disabled = false; b.focus({ preventScroll: true });
    }, 700 + lines.length * gap);
  }

  /* ---------- decode notes, from the run ---------- */
  function notes() {
    const out = [];
    /* 1 — balance */
    let low = S.bal[0];
    S.bal.forEach(b => { if (b.ccp < low.ccp) low = b; });
    const uniq = a => [...new Set(a)];
    out.push(D.balance({ low: low.ccp, lowMon: low.mon, start: S.bal[0].ccp, close: S.ccp,
      debits: uniq(S.log.filter(l => l.ccp < 0).map(l => logOf(l).phrase)),
      credits: uniq(S.log.filter(l => l.ccp > 0).map(l => logOf(l).phrase)) }));
    /* 2 — meters */
    const st = S.snaps[0].m, name = k => STORY.METERS.find(m => m.k === k).name;
    const ks = STORY.METERS.map(m => m.k);
    out.push(D.meters({ up: ks.filter(k => S.m[k] > st[k]).map(name), down: ks.filter(k => S.m[k] < st[k]).map(name), flat: ks.filter(k => S.m[k] === st[k]).map(name) }));
    /* 3 — who paid for you, or who you held */
    const paid = paidFor(), held = heldBy();
    out.push(paid.length ? D.paid(paid) : D.held(held));
    /* 4 — the match */
    const acc = S.log.find(l => l.flag === 'accepted'), dec = S.log.find(l => l.flag === 'declined');
    if (acc) out.push(D.accepted({ reward: acc.ccp }));
    else if (dec) out.push(D.declined({ cut: -dec.ccp }));
    return out;
  }
  const paidFor = () => Object.entries(STORY.PAID_FOR_YOU).filter(([f]) => S.flags.has(f)).map(([, v]) => v);
  const heldBy = () => Object.entries(STORY.YOU_HELD).filter(([f]) => S.flags.has(f)).map(([, v]) => v);

  function decode() {
    flip(() => $('#end').classList.add('decode'));
    step('decode');
    placePins();
    const ol = $('#notes'); ol.innerHTML = '';
    notes().forEach((t, i) => {
      const li = document.createElement('li');
      li.innerHTML = `<span class="pin" aria-hidden="true">${i + 1}</span><p class="band">${t}</p>`;
      ol.append(li);
      later(() => li.classList.add('in'), reduced() ? 0 : 900 + i * 1900);
    });
    later(() => { const b = $('#to-verdict'); b.classList.add('in'); b.disabled = false; b.focus({ preventScroll: true }); },
      reduced() ? 0 : 900 + ol.children.length * 1900);
  }

  /* ---------- verdict ---------- */
  function verdict() {
    flip(() => $('#end').classList.remove('decode'));
    step('verdict');
    const v = STORY.VERDICTS.find(x => x.when(api));
    $('#v-name').textContent = S.name;
    const h = $('#verdict'); h.innerHTML = `${v.a} <em>${v.b}</em>`; h.tabIndex = -1;
    /* strongest meter: highest value, ties go to the one that grew most */
    const st = S.snaps[0].m;
    const best = STORY.METERS.slice().sort((a, b) => (S.m[b.k] - S.m[a.k]) || ((S.m[b.k] - st[b.k]) - (S.m[a.k] - st[a.k])))[0];
    const box = $('#bigmeters'); box.innerHTML = '';
    STORY.METERS.forEach(m => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'bm'; b.setAttribute('aria-pressed', m === best);
      b.innerHTML = `<span class="bms">${m === best ? E.strongest : ''}</span><span class="bmh">${m.name}${m.icon}</span>
        <span class="bmv">${S.m[m.k]}<small>/ ${MAX}</small></span><span class="bmb"><i></i></span>`;
      b.addEventListener('click', () => pick(m));
      box.append(b);
      later(() => { b.querySelector('.bmb i').style.width = S.m[m.k] / MAX * 100 + '%'; }, 300);
    });
    const pick = m => {
      [...box.children].forEach((b, i) => b.setAttribute('aria-pressed', STORY.METERS[i] === m));
      $('#ask').textContent = m.ask;
    };
    pick(best);
    /* people strip */
    const paid = paidFor(), held = heldBy();
    const who = [...new Map(paid.map(p => [p.who, p])).values()];
    const figs = held.map(x => '<i></i>'.repeat(Math.min(x.icons || x.n, 14))).join('') + who.map(() => '<i class="paid"></i>').join('');
    const lines = held.map(E.heldLine).concat(who.length ? [E.paidLine(who)] : []);
    $('#people').innerHTML = `<p class="eyebrow">${E.people}</p>${figs ? `<div class="figs" aria-hidden="true">${figs}</div>` : ''}
      ${(lines.length ? lines : [E.nobody]).map(l => `<p>${l}</p>`).join('')}`;
    $('#essay').href = STORY.ESSAY_URL;
    later(() => h.focus({ preventScroll: true }), 100);
  }

  /* ---------- helpers ---------- */
  function step(n) {
    ['print', 'decode', 'verdict'].forEach(s => $('#step-' + s).classList.toggle('on', s === n));
    $('#end').classList.toggle('ending-verdict', n === 'verdict');
    $('#end').scrollTop = 0;
  }
  /* move the receipt to its new side smoothly (FLIP) */
  function flip(change) {
    const r = $('#receipt'), a = r.getBoundingClientRect();
    change();
    const b = r.getBoundingClientRect();
    if (reduced()) return;
    r.style.transition = 'none'; r.style.transform = `translate(${a.left - b.left}px, ${a.top - b.top}px)`;
    void r.offsetWidth; r.style.transition = ''; r.style.transform = '';
  }

  function open(state, c) {
    S = state; ctx = c;
    api = { has: f => S.flags.has(f), ccp: S.ccp, m: { ...S.m }, name: S.name };
    const end = $('#end');
    $('#receipt').innerHTML = receipt();
    end.classList.remove('decode'); step('print');
    $('#to-decode').disabled = true; $('#to-verdict').classList.remove('in'); $('#to-verdict').disabled = true;
    end.classList.add('on'); end.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(placePins);
    later(print, reduced() ? 0 : 900);
  }
  function close() {
    timers.forEach(clearTimeout); timers = [];
    const end = $('#end');
    end.style.transition = 'none';
    end.classList.remove('on', 'decode', 'ending-verdict'); end.setAttribute('aria-hidden', 'true');
    void end.offsetWidth; end.style.transition = '';
  }

  $('#to-decode').addEventListener('click', decode);
  $('#to-verdict').addEventListener('click', verdict);
  $('#again').addEventListener('click', () => ctx && ctx.replay());
  $('#end').setAttribute('aria-hidden', 'true');

  return { open, close };
})();

window.ENDING = ENDING;
