/* Future: Tense — sound. Everything is generated live with Web Audio (no files).
   Drone + wind per world, rain in the flood, footsteps, checkpoint duck + clock,
   debit/credit blips, stamp thud, receipt printer.                            */

const AUDIO = {
  ctx: null, on: false, n: null, world: null, base: { wind: 0, drone: .032 }, last: { step: 0, thud: 0 }, clock: null,

  init() {
    if (this.ctx) return true;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    const c = this.ctx = new AC();
    const master = c.createGain(); master.gain.value = 0; master.connect(c.destination);
    const comp = c.createDynamicsCompressor(); comp.threshold.value = -18; comp.connect(master);
    const bed = c.createGain(); bed.gain.value = 1; bed.connect(comp);         // ambience bus (ducks at checkpoints)

    // noise buffers: white (w) and brown (b)
    const len = c.sampleRate * 3, wb = c.createBuffer(1, len, c.sampleRate), bb = c.createBuffer(1, len, c.sampleRate);
    const w = wb.getChannelData(0), b = bb.getChannelData(0); let l = 0;
    for (let i = 0; i < len; i++) { const r = Math.random() * 2 - 1; w[i] = r; l = (l + .02 * r) / 1.02; b[i] = l * 3.5; }
    const loop = buf => { const s = c.createBufferSource(); s.buffer = buf; s.loop = true; s.start(); return s; };

    // wind
    const wbp = c.createBiquadFilter(); wbp.type = 'bandpass'; wbp.frequency.value = 500; wbp.Q.value = .7;
    const wg = c.createGain(); wg.gain.value = 0; loop(bb).connect(wbp).connect(wg).connect(bed);
    const lfo = c.createOscillator(); lfo.frequency.value = .07; const lg = c.createGain(); lg.gain.value = 160;
    lfo.connect(lg).connect(wbp.frequency); lfo.start();
    // rain
    const rh = c.createBiquadFilter(); rh.type = 'highpass'; rh.frequency.value = 1500;
    const rl = c.createBiquadFilter(); rl.type = 'lowpass'; rl.frequency.value = 6500;
    const rg = c.createGain(); rg.gain.value = 0; loop(wb).connect(rh).connect(rl).connect(rg).connect(bed);
    // drone
    const dl = c.createBiquadFilter(); dl.type = 'lowpass'; dl.frequency.value = 260; dl.Q.value = 3;
    const dg = c.createGain(); dg.gain.value = 0; dl.connect(dg).connect(bed);
    const o1 = c.createOscillator(), o2 = c.createOscillator(), o3 = c.createOscillator();
    o1.type = o2.type = 'sawtooth'; o3.type = 'sine';
    [o1, o2, o3].forEach(o => { o.frequency.value = 55; o.connect(dl); o.start(); });
    const dlfo = c.createOscillator(); dlfo.frequency.value = .045; const dlg = c.createGain(); dlg.gain.value = 90;
    dlfo.connect(dlg).connect(dl.frequency); dlfo.start();

    this.n = { master, comp, bed, wbp, wg, rg, dg, dl, o1, o2, o3, wb };
    return true;
  },

  toggle(force) {
    if (!this.init()) return this.on;
    const want = force === undefined ? !this.on : force;
    this.ctx.resume && this.ctx.resume();
    this.on = want;
    this.n.master.gain.setTargetAtTime(want ? .85 : 0, this.ctx.currentTime, .4);
    if (want && this.world) this.setWorld(this.world, true);
    return this.on;
  },

  setWorld(id, force) {
    if (id === this.world && !force) return;
    this.world = id;
    if (!this.ctx) return;
    const s = STORY.WORLDS[id].snd, t = this.ctx.currentTime, n = this.n;
    n.o1.frequency.setTargetAtTime(s.f, t, 1.2); n.o2.frequency.setTargetAtTime(s.f * 1.006, t, 1.2); n.o3.frequency.setTargetAtTime(s.f * 2, t, 1.2);
    n.wbp.frequency.setTargetAtTime(s.wf, t, 1); n.dg.gain.setTargetAtTime(this.base.drone, t, 1.5);
    n.wg.gain.setTargetAtTime(s.w * .55, t, 1.2); n.rg.gain.setTargetAtTime(s.r * .22, t, 1.2);
    this.base.wind = s.w * .55;
  },

  speed(v) { if (!this.on) return; this.n.wg.gain.setTargetAtTime(this.base.wind + Math.min(v, 30) * .006, this.ctx.currentTime, .25); },

  /* checkpoint: ambience ducks, a slow clock ticks */
  duck(on) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.n.bed.gain.setTargetAtTime(on ? .32 : 1, t, .5);
    this.n.dl.frequency.setTargetAtTime(on ? 160 : 260, t, .6);
    clearInterval(this.clock); this.clock = null;
    if (on) { let k = 0; this.clock = setInterval(() => { if (this.on) this.tone(k++ % 2 ? 1900 : 1500, 1400, .03, .035, 'square'); }, 1000); }
  },

  burst(f, q, dur, vol, type = 'lowpass', at = 0) {
    if (!this.on) return;
    const c = this.ctx, t = c.currentTime + at, s = c.createBufferSource(); s.buffer = this.n.wb;
    const fl = c.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q;
    const g = c.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .008); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    s.connect(fl).connect(g).connect(this.n.comp); s.start(t, Math.random() * 2, dur + .05);
  },
  tone(f1, f2, dur, vol, type = 'sine', at = 0) {
    if (!this.on) return;
    const c = this.ctx, t = c.currentTime + at, o = c.createOscillator(), g = c.createGain(); o.type = type;
    o.frequency.setValueAtTime(f1, t); o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g).connect(this.n.comp); o.start(t); o.stop(t + dur + .05);
  },

  step(kind) {
    if (!this.on) return;
    const now = performance.now(); if (now - this.last.step < 140) return; this.last.step = now;
    kind === 'wade' ? this.burst(900, 1.2, .32, .14, 'bandpass') : this.burst(520 + Math.random() * 160, .8, .09, .2);
  },
  pick() { this.tone(520, 520, .18, .12, 'triangle'); this.tone(780, 780, .3, .1, 'triangle', .09); },
  meter(up) { this.tone(up ? 1400 : 420, up ? 1600 : 360, .05, .05, 'square'); },
  debit() { this.tone(620, 300, .22, .12, 'triangle'); this.tone(410, 210, .3, .08, 'triangle', .08); },
  credit() { this.tone(500, 900, .16, .1, 'triangle'); this.tone(760, 1300, .22, .08, 'triangle', .1); },
  stamp() { this.tone(120, 48, .35, .32); this.burst(300, .6, .12, .25); },
  thud() {
    const now = performance.now(); if (now - this.last.thud < 1100) return; this.last.thud = now;
    this.tone(90, 45, .4, .3);
  },
  msg() { this.tone(1320, 1320, .07, .05, 'sine'); this.tone(1760, 1760, .09, .045, 'sine', .09); },
  printLine() { this.burst(2600, 2.5, .07, .09, 'bandpass'); this.burst(1800, 3, .05, .06, 'bandpass', .06); },
  end() { this.tone(220, 110, 2.4, .12); }
};

window.AUDIO = AUDIO;
