/* Procedural sound: every effect and the music are synthesised with the
   Web Audio API, so the game needs no audio files and works offline. */
const Sound = (() => {
  let ctx = null, master, sfx, musicBus, verb, noiseBuf;
  let muted = false;
  try { muted = localStorage.getItem('anne-muted') === '1'; } catch (e) {}

  function init() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = muted ? 0 : 1; master.connect(ctx.destination);
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 3;
    comp.connect(master);
    sfx = ctx.createGain(); sfx.gain.value = 0.9; sfx.connect(comp);
    musicBus = ctx.createGain(); musicBus.gain.value = 0; musicBus.connect(comp);
    verb = ctx.createConvolver(); verb.buffer = impulse(3.2, 2.6);
    const vg = ctx.createGain(); vg.gain.value = 0.42; verb.connect(vg); vg.connect(comp);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    startMusic();
  }

  function impulse(dur, decay) {
    const len = Math.floor(ctx.sampleRate * dur), b = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const ch = b.getChannelData(c);
      for (let i = 0; i < len; i++) ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return b;
  }

  const now = () => ctx.currentTime;
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);

  function out(node, rev, dest) {
    node.connect(dest || sfx);
    if (rev) { const g = ctx.createGain(); g.gain.value = rev; node.connect(g); g.connect(verb); }
  }

  function tone(o) {
    if (!ctx) return;
    const t = now() + (o.t || 0), a = o.a || 0.005, d = o.d || 0.4, vol = o.vol || 0.2;
    const osc = ctx.createOscillator(), g = ctx.createGain();
    osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(o.f, t);
    if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + (o.glide || d));
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
    osc.connect(g); out(g, o.rev, o.dest);
    osc.start(t); osc.stop(t + a + d + 0.05);
  }

  function noise(o) {
    if (!ctx) return;
    const t = now() + (o.t || 0), a = o.a || 0.003, d = o.d || 0.1;
    const src = ctx.createBufferSource(); src.buffer = noiseBuf;
    src.playbackRate.value = o.rate || 1;
    const f = ctx.createBiquadFilter(); f.type = o.type || 'bandpass';
    f.frequency.setValueAtTime(o.f || 2000, t); f.Q.value = o.q || 1;
    if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t + a + d);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(o.vol || 0.2, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
    src.connect(f); f.connect(g); out(g, o.rev, o.dest);
    src.start(t, Math.random() * 1.5); src.stop(t + a + d + 0.05);
  }

  /* A soft bell / music-box note */
  function bell(m, t = 0, vol = 0.12, dest, rev = 0.5, len = 1.6) {
    tone({ f: mtof(m), t, a: 0.004, d: len, vol, rev, dest });
    tone({ f: mtof(m) * 2.01, t, a: 0.003, d: len * 0.45, vol: vol * 0.35, rev, dest });
    tone({ f: mtof(m) * 3.98, t, a: 0.002, d: len * 0.18, vol: vol * 0.12, rev, dest });
  }

  const fx = {
    click() { noise({ f: 3200, q: 4, d: 0.03, vol: 0.25 }); tone({ f: 1800, d: 0.04, vol: 0.05, type: 'triangle' }); },
    tick() { noise({ f: 4200, q: 6, d: 0.02, vol: 0.18 }); },
    rattle() {
      for (let i = 0; i < 6; i++) {
        noise({ t: i * 0.055 + Math.random() * 0.02, f: 1400 + Math.random() * 900, q: 7, d: 0.05, vol: 0.32 });
        tone({ t: i * 0.055, f: 320 + Math.random() * 60, d: 0.05, vol: 0.05, type: 'square' });
      }
    },
    wrong() {
      noise({ f: 380, q: 2, d: 0.14, vol: 0.4, type: 'lowpass' });
      tone({ f: 150, to: 110, d: 0.18, vol: 0.12, type: 'triangle' });
    },
    unlock() {
      noise({ f: 2600, q: 6, d: 0.04, vol: 0.35 });
      noise({ t: 0.16, f: 1800, q: 5, d: 0.05, vol: 0.4 });
      tone({ t: 0.18, f: 1320, d: 0.5, vol: 0.06, rev: 0.4 });
      tone({ t: 0.18, f: 2640, d: 0.3, vol: 0.02, rev: 0.4 });
    },
    creak(len = 1.6) {
      if (!ctx) return;
      const t = now(), osc = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(90, t);
      for (let i = 1; i < 10; i++) osc.frequency.linearRampToValueAtTime(70 + Math.random() * 70, t + (len * i) / 10);
      f.type = 'bandpass'; f.frequency.value = 900; f.Q.value = 6;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.1, t + 0.2);
      g.gain.exponentialRampToValueAtTime(0.0001, t + len);
      osc.connect(f); f.connect(g); out(g, 0.3);
      osc.start(t); osc.stop(t + len + 0.1);
    },
    stone() {
      noise({ f: 300, to: 120, q: 1.5, a: 0.05, d: 0.7, vol: 0.45, type: 'lowpass' });
      noise({ t: 0.72, f: 900, q: 3, d: 0.08, vol: 0.3 });
    },
    boxOpen() {
      fx.creak(0.8);
      noise({ t: 0.7, f: 500, q: 2, d: 0.1, vol: 0.3, type: 'lowpass' });
    },
    page() { noise({ f: 5000, to: 2500, q: 0.7, a: 0.03, d: 0.22, vol: 0.18, type: 'highpass' }); noise({ t: 0.12, f: 4000, q: 0.6, a: 0.02, d: 0.14, vol: 0.12, type: 'highpass' }); },
    collect() { [79, 84, 88].forEach((m, i) => bell(m, i * 0.07, 0.07, null, 0.5, 0.9)); },
    discover() { [72, 76, 79, 84, 88, 91].forEach((m, i) => bell(m, i * 0.085, 0.06, null, 0.7, 1.4)); },
    sparkle() { for (let i = 0; i < 5; i++) bell(88 + Math.floor(Math.random() * 10), i * 0.06, 0.03, null, 0.8, 0.7); },
    pop() { tone({ f: 600, to: 1300, d: 0.08, vol: 0.12, type: 'sine' }); },
    thump() { tone({ f: 120, to: 60, d: 0.2, vol: 0.25 }); noise({ f: 300, d: 0.08, vol: 0.2, type: 'lowpass' }); },
    rustle() { for (let i = 0; i < 4; i++) noise({ t: i * 0.07, f: 3000 + Math.random() * 2000, q: 0.8, a: 0.02, d: 0.09, vol: 0.12, type: 'highpass' }); },
    scratch() { for (let i = 0; i < 5; i++) noise({ t: i * 0.13, f: 2500, to: 1500, q: 2, a: 0.02, d: 0.09, vol: 0.2 }); },
    strike() {
      noise({ f: 3000, to: 900, q: 1, a: 0.01, d: 0.25, vol: 0.35, type: 'bandpass' });
      noise({ t: 0.15, f: 600, q: 0.5, a: 0.1, d: 0.6, vol: 0.18, type: 'lowpass' });
    },
    blow() { noise({ f: 900, to: 300, q: 0.6, a: 0.12, d: 0.7, vol: 0.4, type: 'bandpass' }); },
    twinkle() { bell(96 + Math.floor(Math.random() * 7), 0, 0.02, null, 0.9, 0.6); },
    meow(kind = 1) {
      if (!ctx) return;
      const t = now(), hi = kind === 2;
      const tiny = kind === 3;
      const dur = tiny ? 0.3 : hi ? 0.48 : 0.72;
      const base = tiny ? 880 : hi ? 620 : 470;
      const osc = ctx.createOscillator(); osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(base * 0.85, t);
      osc.frequency.linearRampToValueAtTime(base * 1.35, t + dur * 0.35);
      osc.frequency.linearRampToValueAtTime(base * 0.8, t + dur);
      const vib = ctx.createOscillator(), vg = ctx.createGain();
      vib.frequency.value = 7; vg.gain.value = 12; vib.connect(vg); vg.connect(osc.frequency);
      const f1 = ctx.createBiquadFilter(); f1.type = 'bandpass'; f1.Q.value = 5;
      f1.frequency.setValueAtTime(700, t);
      f1.frequency.linearRampToValueAtTime(1500, t + dur * 0.4);
      f1.frequency.linearRampToValueAtTime(800, t + dur);
      const f2 = ctx.createBiquadFilter(); f2.type = 'bandpass'; f2.Q.value = 8;
      f2.frequency.setValueAtTime(2400, t); f2.frequency.linearRampToValueAtTime(3000, t + dur * 0.4);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(tiny ? 0.22 : 0.5, t + 0.05);
      g.gain.setValueAtTime(tiny ? 0.22 : 0.5, t + dur * 0.6);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      const mix = ctx.createGain(); mix.gain.value = 0.55;
      osc.connect(f1); osc.connect(f2); f1.connect(g); f2.connect(mix); mix.connect(g);
      out(g, 0.25);
      osc.start(t); vib.start(t); osc.stop(t + dur + 0.05); vib.stop(t + dur + 0.05);
    },
    purr(len = 1.8) {
      if (!ctx) return;
      const t = now(), src = ctx.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
      const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 260;
      const am = ctx.createGain(); am.gain.value = 0;
      const lfo = ctx.createOscillator(); lfo.frequency.value = 24;
      const lg = ctx.createGain(); lg.gain.value = 0.5; lfo.connect(lg); lg.connect(am.gain);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.9, t + 0.3);
      g.gain.setValueAtTime(0.9, t + len - 0.4); g.gain.exponentialRampToValueAtTime(0.0001, t + len);
      src.connect(f); f.connect(am); am.connect(g); out(g);
      src.start(t); lfo.start(t); src.stop(t + len + 0.1); lfo.stop(t + len + 0.1);
    },
    fire() { for (let i = 0; i < 6; i++) noise({ t: Math.random() * 0.8, f: 1500 + Math.random() * 3000, q: 3, d: 0.02, vol: 0.12 }); },
    birthdaySong() {
      if (!ctx) return;
      const C4 = 72; // one octave up, music-box register
      const N = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, Bb: 10, C5: 12 };
      const song = [
        ['C', .75], ['C', .25], ['D', 1], ['C', 1], ['F', 1], ['E', 2],
        ['C', .75], ['C', .25], ['D', 1], ['C', 1], ['G', 1], ['F', 2],
        ['C', .75], ['C', .25], ['C5', 1], ['A', 1], ['F', 1], ['E', 1], ['D', 2],
        ['Bb', .75], ['Bb', .25], ['A', 1], ['F', 1], ['G', 1], ['F', 2.5]
      ];
      const beat = 0.42; let t = 0.1;
      song.forEach(([n, d]) => { bell(C4 - 7 + N[n], t, 0.1, null, 0.6, 1.3); t += d * beat; });
    }
  };

  /* ------- gentle generative music ------- */
  const moods = {
    garden:   { bpm: 66, chords: [[53, 57, 60, 64], [50, 53, 57, 60], [46, 50, 53, 57], [48, 52, 55, 58]], density: 0.55, vol: 0.5 },
    interior: { bpm: 60, chords: [[50, 53, 57, 60], [46, 50, 53, 57], [53, 57, 60, 64], [48, 52, 55, 60]], density: 0.45, vol: 0.45 },
    cats:     { bpm: 84, chords: [[55, 59, 62, 66], [52, 55, 59, 62], [48, 52, 55, 59], [50, 54, 57, 60]], density: 0.7, vol: 0.45 },
    party:    { bpm: 76, chords: [[53, 57, 60, 64], [46, 50, 53, 57], [48, 52, 55, 60], [53, 57, 60, 65], [50, 53, 57, 62], [46, 50, 53, 58], [48, 52, 55, 58], [53, 57, 60, 64]], density: 0.75, vol: 0.5 }
  };
  let mood = moods.garden, moodName = 'garden', nextBar = 0, bar = 0, timer = null;

  function pad(notes, t, len) {
    notes.slice(0, 3).forEach((m, i) => {
      [0, 4].forEach(det => {
        const osc = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
        osc.type = i === 0 ? 'triangle' : 'sine';
        osc.frequency.value = mtof(m); osc.detune.value = det - 2;
        f.type = 'lowpass'; f.frequency.value = 1100;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(0.022, t + len * 0.35);
        g.gain.linearRampToValueAtTime(0.0001, t + len * 1.1);
        osc.connect(f); f.connect(g); g.connect(musicBus);
        const s = ctx.createGain(); s.gain.value = 0.5; g.connect(s); s.connect(verb);
        osc.start(t); osc.stop(t + len * 1.15);
      });
    });
  }

  function scheduleBar(t) {
    const m = mood, beat = 60 / m.bpm, chord = m.chords[bar % m.chords.length], len = beat * 4;
    pad(chord.map(n => n - 12), t, len);
    // bass
    const b = ctx.createOscillator(), bg = ctx.createGain();
    b.type = 'sine'; b.frequency.value = mtof(chord[0] - 12);
    bg.gain.setValueAtTime(0.0001, t); bg.gain.exponentialRampToValueAtTime(0.06, t + 0.05);
    bg.gain.exponentialRampToValueAtTime(0.0001, t + len * 0.9);
    b.connect(bg); bg.connect(musicBus); b.start(t); b.stop(t + len);
    // music box arpeggio
    const pool = chord.map(n => n + 12).concat(chord.map(n => n + 24));
    for (let i = 0; i < 8; i++) {
      if (Math.random() < m.density || i === 0) {
        const note = pool[(i * 3 + bar + Math.floor(Math.random() * 3)) % pool.length];
        bell(note, t - now() + i * beat / 2 + Math.random() * 0.012, i === 0 ? 0.05 : 0.032, musicBus, 0.8, 1.6);
      }
    }
    bar++;
  }

  function startMusic() {
    if (timer) return;
    nextBar = now() + 0.3;
    timer = setInterval(() => {
      if (!ctx) return;
      while (nextBar < now() + 0.6) { scheduleBar(nextBar); nextBar += 4 * 60 / mood.bpm; }
    }, 150);
    musicBus.gain.setTargetAtTime(mood.vol, now(), 2.5);
  }

  return {
    unlock: init,
    play(name, ...args) { if (!ctx) return; if (fx[name]) fx[name](...args); },
    setMood(name) {
      if (!moods[name] || name === moodName) return;
      moodName = name; mood = moods[name]; bar = 0;
      if (ctx) musicBus.gain.setTargetAtTime(mood.vol, now(), 1.5);
    },
    hush(on) {
      if (!ctx) return;
      musicBus.gain.setTargetAtTime(on ? 0 : mood.vol, now(), on ? 0.3 : 1.5);
    },
    duck(sec = 4) {
      if (!ctx) return;
      musicBus.gain.setTargetAtTime(0.08, now(), 0.3);
      musicBus.gain.setTargetAtTime(mood.vol, now() + sec, 1.2);
    },
    get muted() { return muted; },
    toggleMute() {
      muted = !muted;
      try { localStorage.setItem('anne-muted', muted ? '1' : '0'); } catch (e) {}
      if (ctx) master.gain.setTargetAtTime(muted ? 0 : 1, now(), 0.1);
      return muted;
    }
  };
})();
