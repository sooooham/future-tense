/* Future: Tense — the ending.
   1. the receipt prints  2. the verdict, with your four meters and one question.
   Everything printed here is read from the run (S) and worded by story.js.  */

const ENDING = (() => {
  const $ = q => document.querySelector(q);
  const R = STORY.RECEIPT, E = STORY.ENDING, MON = STORY.MONTHS, MAX = STORY.START.max, T = STORY.tidy;
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sign = n => (n > 0 ? '+' : n < 0 ? '−' : '') + Math.abs(n);
  const logOf = l => STORY.LOG[l.flag] || STORY.LOG[l.label] || { line: l.label, tag: l.label };
  const amount = l => (l.ccp ? sign(l.ccp) : '0') + (logOf(l).unit && l.ccp ? ' ' + logOf(l).unit : '');
  const mi = m => MON.indexOf(m);
  const INK = '#2a2725', RUST = '#a3482e', GREY = '#6d675f';
  let S, api, timers = [], ctx;
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));

  /* ---------- charts ---------- */
  /* chart labels sit beside a step, never on it: try a few spots, keep the first that
     touches no segment, no other label and stays inside the chart */
  function placeLabel(text, X, ya, yb, segs, taken, box) {
    const wd = text.length * 6.3 + 2, top = Math.min(ya, yb), bot = Math.max(ya, yb), mid = (ya + yb) / 2 + 4;
    const spots = [['end', X - 5, top - 5], ['start', X + 5, top - 5], ['end', X - 5, mid], ['start', X + 5, mid],
                   ['end', X - 5, bot + 14], ['start', X + 5, bot + 14], ['end', X - 5, top + 12], ['start', X + 5, top + 12]];
    const rect = ([a, x, y]) => ({ x0: a === 'end' ? x - wd : x, x1: a === 'end' ? x : x + wd, y0: y - 10, y1: y + 2 });
    const hit = (r, q) => r.x0 < q.x1 && r.x1 > q.x0 && r.y0 < q.y1 && r.y1 > q.y0;
    const ok = s => { const r = rect(s); return r.x0 >= 0 && r.x1 <= box.w && r.y0 >= 0 && r.y1 <= box.h && !segs.some(q => hit(r, q)) && !taken.some(q => hit(r, q)); };
    const s = spots.find(ok) || spots[0];
    taken.push(rect(s));
    return s;
  }
  function balanceSvg() {
    const w = 400, h = 116, px = 8, top = 14, bot = 18, ih = h - top - bot, right = 26;
    const peak = Math.max(100, ...S.bal.map(b => b.ccp)), yMax = Math.ceil(peak / 100) * 100;
    const x = m => px + mi(m) / 11 * (w - px - right), y = v => top + ih - v / yMax * ih;
    const pts = [[x('JAN'), y(S.bal[0].ccp)]];
    let prev = S.bal[0].ccp, dots = `<circle cx="${pts[0][0]}" cy="${pts[0][1]}" r="3" fill="${INK}"/>`;
    S.bal.slice(1).forEach(b => {
      pts.push([x(b.mon), y(prev)], [x(b.mon), y(b.ccp)]);
      dots += `<circle cx="${x(b.mon)}" cy="${y(b.ccp)}" r="3" fill="${b.ccp < prev ? RUST : INK}"/>`;
      prev = b.ccp;
    });
    pts.push([x('DEC'), y(prev)]);
    const segs = pts.slice(1).map(([x1, y1], i) => { const [x0, y0] = pts[i]; return { x0: Math.min(x0, x1) - 2, x1: Math.max(x0, x1) + 2, y0: Math.min(y0, y1) - 2, y1: Math.max(y0, y1) + 2 }; });
    let grid = ''; const taken = [];
    for (let v = 100; v <= yMax; v += 100) {
      grid += `<line x1="${px}" x2="${w - right + 4}" y1="${y(v)}" y2="${y(v)}" stroke="${INK}" stroke-opacity=".12"/><text x="${w}" y="${y(v) + 3}" text-anchor="end" font-size="9" fill="${GREY}">${v}</text>`;
      taken.push({ x0: w - 22, x1: w, y0: y(v) - 7, y1: y(v) + 5 });
    }
    /* label the biggest fall and the biggest rise */
    const moves = S.log.filter(l => l.ccp);
    const low = moves.filter(l => l.ccp < 0).sort((a, b) => a.ccp - b.ccp)[0], high = moves.filter(l => l.ccp > 0).sort((a, b) => b.ccp - a.ccp)[0];
    const balAround = l => { let v = STORY.START.ccp; for (const e of S.log) { const was = v; v = Math.max(0, v + e.ccp); if (e === l) return [was, v]; } return [v, v]; };
    let labels = '';
    [low, high].filter(Boolean).forEach(l => {
      const [b0, b1] = balAround(l), text = `${sign(l.ccp)} ${logOf(l).tag}`;
      const [anchor, lx, ly] = placeLabel(text, x(l.mon), y(b0), y(b1), segs, taken, { w, h: h - bot + 4 });
      labels += `<text x="${lx}" y="${ly}" text-anchor="${anchor}" font-size="10.5" fill="${l.ccp < 0 ? RUST : INK}">${text}</text>`;
    });
    const months = ['JAN', ...new Set(Object.values(STORY.CHECKPOINTS).map(c => c.month))];
    const ticks = months.map(m => `<text x="${x(m)}" y="${h - 3}" text-anchor="middle" font-size="9" fill="${GREY}">${m}</text>`).join('');
    return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${R.balance}: ${S.bal[0].ccp} to ${S.ccp}">
      ${grid}<line x1="${px}" x2="${w - right + 4}" y1="${y(0)}" y2="${y(0)}" stroke="${INK}" stroke-opacity=".35"/>
      <path d="M${pts.map(p => p.join(' ')).join(' L')}" fill="none" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>
      ${dots}${labels}${ticks}</svg>`;
  }
  function meterSvg(k) {
    const w = 240, h = 26, x = m => mi(m) / 11 * (w - 4), y = v => 3 + (h - 6) - v / MAX * (h - 6);
    const pts = S.snaps.map(s => ({ m: s.mon, v: s.m[k] }));
    let d = `M0 ${y(pts[0].v)}`, prev = pts[0].v;
    pts.slice(1).forEach(p => { d += ` L${x(p.m)} ${y(prev)} L${x(p.m)} ${y(p.v)}`; prev = p.v; });
    d += ` L${w - 4} ${y(prev)}`;
    const end = prev < pts[0].v ? RUST : prev > pts[0].v ? INK : GREY;
    return `<svg viewBox="0 0 ${w} ${h}" aria-hidden="true"><line x1="0" x2="${w - 4}" y1="${h - 1}" y2="${h - 1}" stroke="${INK}" stroke-opacity=".15"/>
      <path d="${d}" fill="none" stroke="${INK}" stroke-width="1.4"/><rect x="${w - 7}" y="${y(prev) - 3}" width="6" height="6" fill="${end}"/></svg>`;
  }

  /* ---------- receipt ---------- */
  function receipt() {
    const start = S.snaps[0].m;
    const rows = S.log.map(l => `<tr><td>${l.mon}</td><td>${logOf(l).line}</td><td class="${l.ccp < 0 ? 'minus' : ''}">${amount(l)}</td></tr>`);
    return `<div class="rc">
      <div class="rl c"><p class="auth">${R.authority}</p><p class="ttl">${R.title}</p><p class="sm">${R.who(S.name)}</p></div>
      <div class="rl"><hr></div>
      <div class="rl bal"><h4>${R.balance}</h4>${balanceSvg()}
        <div class="rstamp" aria-hidden="true"><span>${R.stamp[0]}</span><b>${R.stamp[1]}</b></div></div>
      <div class="rl"><hr></div>
      <div class="rl"><h4>${R.meters}</h4></div>
      ${STORY.METERS.map(m => `<div class="rl mrow"><span>${R.short[m.k]}</span>${meterSvg(m.k)}<b>${start[m.k]} → ${S.m[m.k]}</b></div>`).join('')}
      <div class="rl"><hr></div>
      <div class="rl"><h4>${R.choices}</h4></div>
      ${rows.map(r => `<div class="rl"><table>${r}</table></div>`).join('')}
      <div class="rl"><hr></div>
      <div class="rl close"><span>${R.closing}</span><span>${S.ccp} CCP</span></div>
      <div class="rl foot">${R.footer}</div>
    </div>`;
  }
  function print() {
    const lines = [...document.querySelectorAll('.rc .rl')], gap = reduced() ? 0 : 120;
    lines.forEach((l, i) => later(() => { l.classList.add('in'); if (gap) AUDIO.printLine(); }, 500 + i * gap));
    later(() => {
      document.querySelector('.rstamp').classList.add('in'); AUDIO.stamp();
      const b = $('#to-verdict'); b.disabled = false; b.classList.add('in'); b.focus({ preventScroll: true });
    }, 700 + lines.length * gap);
  }

  /* ---------- verdict ---------- */
  function verdict() {
    step('verdict');
    const v = STORY.VERDICTS.find(x => x.when(api));
    const h = $('#verdict'); h.innerHTML = `${T(v.a)} <em>${T(v.b)}</em>`; h.tabIndex = -1;
    /* strongest meter: highest value, ties go to the one that grew most */
    const st = S.snaps[0].m;
    const best = STORY.METERS.slice().sort((a, b) => (S.m[b.k] - S.m[a.k]) || ((S.m[b.k] - st[b.k]) - (S.m[a.k] - st[a.k])))[0];
    const box = $('#bigmeters'); box.innerHTML = ''; box.setAttribute('aria-label', E.meters);
    STORY.METERS.forEach(m => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'bm'; b.setAttribute('aria-pressed', m === best);
      b.setAttribute('aria-label', `${m.name} ${S.m[m.k]} / ${MAX}`);
      b.innerHTML = `<span class="v" aria-hidden="true">${S.m[m.k]}</span><span class="ic" aria-hidden="true">${m.icon}</span>
        <span class="bar" aria-hidden="true">${'<i></i>'.repeat(MAX)}</span><span class="l" aria-hidden="true">${m.name}</span>`;
      b.addEventListener('click', () => pick(m));
      box.append(b);
      const segs = b.querySelectorAll('.bar i');
      for (let j = 0; j < S.m[m.k]; j++) later(() => segs[j].classList.add('on'), reduced() ? 0 : 400 + j * 70);
    });
    const pick = m => {
      [...box.children].forEach((b, i) => b.setAttribute('aria-pressed', STORY.METERS[i] === m));
      $('#ask .ask-h').textContent = m === best ? E.strongest(m.name) : E.meter(m.name);
      $('#ask .ask-q').textContent = T(m.ask);
    };
    pick(best);
    later(() => h.focus({ preventScroll: true }), 100);
  }

  /* ---------- helpers ---------- */
  function step(n) {
    ['print', 'verdict'].forEach(s => $('#step-' + s).classList.toggle('on', s === n));
    $('#end').classList.toggle('ending-verdict', n === 'verdict');
    $('#end').scrollTop = 0;
  }

  function open(state, c) {
    S = state; ctx = c;
    api = { has: f => S.flags.has(f), ccp: S.ccp, m: { ...S.m }, name: S.name };
    const end = $('#end');
    $('#receipt').innerHTML = receipt();
    step('print');
    const b = $('#to-verdict'); b.disabled = true; b.classList.remove('in');
    end.classList.add('on'); end.setAttribute('aria-hidden', 'false');
    later(print, reduced() ? 0 : 900);
  }
  function close() {
    timers.forEach(clearTimeout); timers = [];
    const end = $('#end');
    end.style.transition = 'none';
    end.classList.remove('on', 'ending-verdict'); end.setAttribute('aria-hidden', 'true');
    void end.offsetWidth; end.style.transition = '';
  }

  /* words from story.js */
  document.querySelectorAll('#end .end-eyebrow').forEach(e => { e.textContent = E.eyebrow; });
  $('#end .end-lede').innerHTML = E.lede;
  $('#to-verdict').innerHTML = `${E.toVerdict} <span aria-hidden="true">→</span>`;
  $('#end .end-q').textContent = E.question;
  $('#again').innerHTML = `${E.again} <span aria-hidden="true">↻</span>`;
  $('#end .credit').textContent = STORY.CREDIT;

  $('#to-verdict').addEventListener('click', verdict);
  $('#again').addEventListener('click', () => ctx && ctx.replay());
  $('#end').setAttribute('aria-hidden', 'true');

  return { open, close };
})();

window.ENDING = ENDING;
