/* =====================================================================
   Gift 2 — Special Delivery
   A claw machine in the party room. Anne steers the claw, catches the
   sealed envelope, collects it from the prize slot, breaks the seal and
   reads the birthday letter.

   The letter's words are edited in gift2_claw.html (the LETTER block).
   Names and cat colours come from js/config.js.

   Everything in the machine is drawn in one fixed coordinate system
   (1600 x 1000 units). The four SVG layers share the same viewBox, so the
   claw, prizes and catch detection stay aligned at any window size.
   ===================================================================== */
(() => {
  'use strict';

  const CFG = window.CONFIG || {};
  const L = window.LETTER || {};
  const NAME = L.recipient || CFG.name || 'Anne';
  const CATS = {
    one: Object.assign({ name: 'Pepper', pattern: 'tuxedo', fur: '#4a4d54', furLight: '#747a85', furDark: '#26282d', belly: '#f1ede4', eye: '#a8cf5c', nose: '#d99a96' }, CFG.cats && CFG.cats.one),
    two: Object.assign({ name: 'Biscuit', pattern: 'tabby', fur: '#d88a47', furLight: '#f2bd7c', furDark: '#9e5723', belly: '#f7e6cb', eye: '#e6aa2e', nose: '#e79c92' }, CFG.cats && CFG.cats.two)
  };
  const IN_FRAME = window.parent && window.parent !== window;

  const $ = s => document.querySelector(s);
  const f = n => Math.round(n * 10) / 10;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const frame = () => new Promise(r => requestAnimationFrame(r));
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const E = {
    io: t => (t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
    out: t => 1 - Math.pow(1 - t, 3),
    in: t => t * t,
    lin: t => t,
    // a motor that spins up, runs, and brakes: mostly constant speed
    motor: t => (t < .15 ? (t * t) / .3 : t > .85 ? 1 - ((1 - t) * (1 - t)) / .3 : (t - .075) / .85)
  };
  async function tween(ms, fn, ease = E.io) {
    const t0 = performance.now();
    for (;;) {
      const t = Math.min(1, (performance.now() - t0) / ms);
      fn(ease(t), t);
      if (t >= 1) return;
      await frame();
    }
  }
  const rng = seed => { let s = seed % 2147483647; if (s <= 0) s += 2147483646; return () => (s = (s * 16807) % 2147483647) / 2147483647; };
  const PAW = 'M0 2C-9 2-13 11-10 15C-7 18-3 16 0 16C3 16 7 18 10 15C13 11 9 2 0 2ZM-11-4A4 5.5 0 1 0-11 7A4 5.5 0 1 0-11-4ZM11-4A4 5.5 0 1 1 11 7A4 5.5 0 1 1 11-4ZM-5-14A4.2 5.8 0 1 0-5-2A4.2 5.8 0 1 0-5-14ZM5-14A4.2 5.8 0 1 1 5-2A4.2 5.8 0 1 1 5-14Z';
  const SCRIPT = "'Segoe Script', 'Segoe Print', 'Bradley Hand', 'Lucida Handwriting', cursive";
  const SERIF = "'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif";

  /* =================================================================
     SOUND — synthesised with Web Audio, starts after the first click
     or key press, and follows the game's mute setting.
     ================================================================= */
  const Snd = (() => {
    let ctx = null, master = null, nb = null, muted = false, motorN = null, whirrN = null;
    try { muted = localStorage.getItem('anne-muted') === '1'; } catch (e) {}
    function unlock() {
      if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
      master = ctx.createGain(); master.gain.value = muted ? 0 : .9; master.connect(ctx.destination);
      nb = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const d = nb.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    const now = () => ctx.currentTime;
    const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
    function tone(o) {
      const t = now() + (o.t || 0), a = o.a || .005, d = o.d || .3;
      const osc = ctx.createOscillator(), g = ctx.createGain();
      osc.type = o.type || 'sine';
      osc.frequency.setValueAtTime(o.f, t);
      if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + a + d);
      g.gain.setValueAtTime(.0001, t);
      g.gain.exponentialRampToValueAtTime(o.vol || .1, t + a);
      g.gain.exponentialRampToValueAtTime(.0001, t + a + d);
      osc.connect(g); g.connect(master); osc.start(t); osc.stop(t + a + d + .05);
    }
    function noise(o) {
      const t = now() + (o.t || 0), a = o.a || .003, d = o.d || .1;
      const src = ctx.createBufferSource(); src.buffer = nb;
      const fl = ctx.createBiquadFilter(); fl.type = o.type || 'bandpass';
      fl.frequency.setValueAtTime(o.f || 2000, t); fl.Q.value = o.q || 1;
      if (o.to) fl.frequency.exponentialRampToValueAtTime(o.to, t + a + d);
      const g = ctx.createGain();
      g.gain.setValueAtTime(.0001, t);
      g.gain.exponentialRampToValueAtTime(o.vol || .1, t + a);
      g.gain.exponentialRampToValueAtTime(.0001, t + a + d);
      src.connect(fl); fl.connect(g); g.connect(master);
      src.start(t, Math.random() * 1.5); src.stop(t + a + d + .05);
    }
    const bell = (m, t, vol, len) => { tone({ f: mtof(m), t, d: len, vol }); tone({ f: mtof(m) * 2.01, t, d: len * .4, vol: vol * .3 }); };
    const fx = {
      click() { noise({ f: 3000, q: 4, d: .03, vol: .16 }); tone({ f: 1500, d: .03, vol: .03, type: 'triangle' }); },
      clack() { noise({ f: 2600, q: 5, d: .05, vol: .26 }); tone({ f: 820, to: 480, d: .07, vol: .05, type: 'square' }); noise({ t: .06, f: 1700, q: 6, d: .04, vol: .16 }); },
      thud() { tone({ f: 96, to: 58, d: .2, vol: .12 }); noise({ f: 280, d: .09, vol: .12, type: 'lowpass' }); },
      thump() { tone({ f: 140, to: 72, d: .22, vol: .18 }); noise({ f: 420, d: .1, vol: .16, type: 'lowpass' }); noise({ t: .02, f: 3000, q: 1, d: .06, vol: .05, type: 'highpass' }); },
      chime() { [76, 79, 84, 88, 91].forEach((m, i) => bell(m, i * .09, .05, 1.3)); },
      boop() { tone({ f: 440, to: 330, d: .2, vol: .05, type: 'triangle' }); tone({ t: .14, f: 370, to: 290, d: .22, vol: .04, type: 'triangle' }); },
      rustle() { for (let i = 0; i < 3; i++) noise({ t: i * .07, f: 3200 + Math.random() * 1500, q: .8, a: .02, d: .09, vol: .08, type: 'highpass' }); },
      page() { noise({ f: 5000, to: 2400, q: .7, a: .03, d: .24, vol: .12, type: 'highpass' }); noise({ t: .13, f: 4000, q: .6, a: .02, d: .15, vol: .08, type: 'highpass' }); },
      crack() { noise({ f: 1900, q: 2, d: .05, vol: .26 }); noise({ t: .045, f: 950, q: 3, d: .08, vol: .18 }); tone({ f: 240, to: 130, d: .08, vol: .04 }); },
      slide() { noise({ f: 2800, to: 1300, q: .6, a: .12, d: .8, vol: .06 }); },
      scratch() { noise({ f: 3000 + Math.random() * 1200, q: 3, a: .004, d: .028, vol: .014 }); },
      // typewriter: a key strike (sharp click + a little body), the space bar, and the bell + carriage return
      key() {
        const v = .8 + Math.random() * .4;
        noise({ f: 2600 + Math.random() * 1400, q: 2.5, a: .002, d: .022, vol: .06 * v });
        noise({ t: .004, f: 900 + Math.random() * 300, q: 1.2, a: .002, d: .035, vol: .045 * v, type: 'lowpass' });
        tone({ f: 170 + Math.random() * 40, to: 110, d: .035, vol: .02 * v, type: 'triangle' });
      },
      space() {
        noise({ f: 700, q: 1, a: .003, d: .05, vol: .06, type: 'lowpass' });
        tone({ f: 120, to: 80, d: .05, vol: .025, type: 'triangle' });
      },
      ding() {
        bell(96, 0, .022, .9);
        noise({ t: .12, f: 2400, to: 900, q: .7, a: .04, d: .32, vol: .035 });
      },
      pat() { tone({ f: 180, to: 120, d: .08, vol: .05 }); noise({ f: 900, q: 1, d: .05, vol: .04, type: 'lowpass' }); },
      sparkle() { for (let i = 0; i < 4; i++) bell(91 + Math.floor(Math.random() * 8), i * .07, .02, .6); }
    };
    function loop(kind) {
      const t = now(), g = ctx.createGain(), fl = ctx.createBiquadFilter(), nodes = [];
      g.gain.setValueAtTime(.0001, t);
      if (kind === 'motor') {
        fl.type = 'lowpass'; fl.frequency.value = 420;
        [58, 116.5].forEach((fr, i) => { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = fr; const og = ctx.createGain(); og.gain.value = i ? .4 : 1; o.connect(og); og.connect(fl); nodes.push(o); });
        const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 14; lg.gain.value = .012; lfo.connect(lg); lg.connect(g.gain); nodes.push(lfo);
        g.gain.exponentialRampToValueAtTime(.04, t + .08);
      } else {
        fl.type = 'bandpass'; fl.frequency.value = 900; fl.Q.value = 1.4;
        const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = 210; o.connect(fl); nodes.push(o);
        const src = ctx.createBufferSource(); src.buffer = nb; src.loop = true; const ng = ctx.createGain(); ng.gain.value = .35; src.connect(ng); ng.connect(fl); nodes.push(src);
        g.gain.exponentialRampToValueAtTime(.03, t + .06);
      }
      fl.connect(g); g.connect(master);
      nodes.forEach(n => n.start(t));
      return { stop() { const s = now(); g.gain.cancelScheduledValues(s); g.gain.setValueAtTime(Math.max(.0001, g.gain.value), s); g.gain.exponentialRampToValueAtTime(.0001, s + .12); nodes.forEach(n => n.stop(s + .15)); } };
    }
    return {
      unlock,
      play(n) { if (ctx && fx[n]) try { fx[n](); } catch (e) {} },
      motor(on) {
        if (!ctx) return;
        if (on && !motorN) motorN = loop('motor');
        else if (!on && motorN) { motorN.stop(); motorN = null; }
      },
      whirr(on) {
        if (!ctx) return;
        if (on && !whirrN) whirrN = loop('whirr');
        else if (!on && whirrN) { whirrN.stop(); whirrN = null; }
      },
      setMuted(m) {
        muted = !!m;
        if (master) master.gain.setTargetAtTime(muted ? 0 : .9, now(), .05);
      }
    };
  })();

  /* =================================================================
     SHARED ARTWORK: gradients, filters and the envelope
     ================================================================= */
  function defs() {
    const lin = (id, stops, x2 = 1, y2 = 0, extra = '') =>
      `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}"${extra}>${stops.map(([o, c, op]) => `<stop offset="${o}" stop-color="${c}"${op != null ? ` stop-opacity="${op}"` : ''}/>`).join('')}</linearGradient>`;
    const rad = (id, stops, cx = .5, cy = .5, r = .5) =>
      `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stops.map(([o, c, op]) => `<stop offset="${o}" stop-color="${c}"${op != null ? ` stop-opacity="${op}"` : ''}/>`).join('')}</radialGradient>`;
    return `
    <filter id="tex" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="4" seed="4" result="t"/>
      <feDiffuseLighting in="t" surfaceScale="2" lighting-color="#ffffff" result="l"><feDistantLight azimuth="225" elevation="60"/></feDiffuseLighting>
      <feComposite in="SourceGraphic" in2="l" operator="arithmetic" k1="1.16" k2="0" k3="0" k4="0" result="m"/>
      <feComposite in="m" in2="SourceGraphic" operator="in"/>
    </filter>
    <filter id="texPaper" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="2" result="t"/>
      <feDiffuseLighting in="t" surfaceScale="0.32" lighting-color="#ffffff" result="l"><feDistantLight azimuth="225" elevation="70"/></feDiffuseLighting>
      <feComposite in="SourceGraphic" in2="l" operator="arithmetic" k1="1.04" k2="0" k3="0" k4="0" result="m"/>
      <feComposite in="m" in2="SourceGraphic" operator="in"/>
    </filter>
    <filter id="woodH" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.006 0.12" numOctaves="3" seed="5" result="t"/>
      <feColorMatrix in="t" type="matrix" values="0 0 0 0 0.16  0 0 0 0 0.09  0 0 0 0 0.05  0 0 0 1.5 -0.55" result="g"/>
      <feComposite in="g" in2="SourceGraphic" operator="atop"/>
    </filter>
    <filter id="fuzz" x="-8%" y="-8%" width="116%" height="116%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="1" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="3" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
    <filter id="b1" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1"/></filter>
    <filter id="b2" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2"/></filter>
    <filter id="b4" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="4"/></filter>
    <filter id="b8" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8"/></filter>
    <filter id="b16" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="16"/></filter>
    <filter id="b30" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="30"/></filter>
    <filter id="engrave" x="-10%" y="-10%" width="120%" height="120%">
      <feOffset in="SourceAlpha" dx=".8" dy="1.1" result="o"/>
      <feFlood flood-color="#fff4dc" flood-opacity=".5"/><feComposite in2="o" operator="in" result="hl"/>
      <feMerge><feMergeNode in="hl"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    ${lin('brass', [[0, '#f6dc93'], [.35, '#c9973f'], [.6, '#8a5f1f'], [.85, '#d7ab58'], [1, '#7a5118']], 1, 1)}
    ${lin('brassV', [[0, '#f3d68a'], [.45, '#c28f3a'], [.55, '#9a6a24'], [1, '#d6aa56']], 0, 1)}
    ${lin('chrome', [[0, '#f6f3ee'], [.35, '#b7b1a8'], [.55, '#6a655e'], [.8, '#d9d4cc'], [1, '#8d877f']], 1, 1)}
    ${lin('chromeV', [[0, '#faf7f2'], [.5, '#a39d94'], [1, '#5f5a53']], 0, 1)}
    ${lin('iron', [[0, '#5a5550'], [.5, '#2c2926'], [1, '#46413c']], 1, 1)}
    ${lin('lac', [[0, '#6a2c39'], [.28, '#a24b5b'], [.5, '#bd6474'], [.72, '#94404f'], [1, '#62283a']])}
    ${lin('lacV', [[0, '#b25a6a'], [1, '#6c2e3c']], 0, 1)}
    ${lin('lacD', [[0, '#5a2531'], [.35, '#8e4251'], [.6, '#9a4b5a'], [1, '#56222e']])}
    ${lin('creamG', [[0, '#fbf2dd'], [1, '#e8d4ad']], 0, 1)}
    ${lin('deck', [[0, '#f6ead0'], [.6, '#e6d1a8'], [1, '#cdb285']], 0, 1)}
    ${lin('wallBlue', [[0, '#7590aa'], [.55, '#566f89'], [1, '#3d4f68']], 0, 1)}
    ${lin('wash', [[0, '#ffe8c4', .34], [.5, '#ffe8c4', .08], [1, '#ffe8c4', 0]], 0, 1)}
    ${lin('glassBand', [[0, '#ffffff', 0], [.5, '#ffffff', .13], [1, '#ffffff', 0]])}
    ${lin('slotDark', [[0, '#0e0709'], [.6, '#241519'], [1, '#3a2328']], 0, 1)}
    ${lin('envPaper', [[0, '#fbf4e2'], [.6, '#f2e6c9'], [1, '#e6d4ae']], 1, 1)}
    ${lin('flapPaper', [[0, '#fdf7e8'], [1, '#efe1c1']], 0, 1)}
    ${lin('liningShade', [[0, '#000', .28], [.35, '#000', .06], [1, '#000', 0]], 0, 1)}
    ${lin('kraft', [[0, '#d9b27a'], [1, '#a9824e']], 1, 1)}
    ${lin('foil', [[0, '#fff0b8'], [.4, '#e3b54e'], [.7, '#a87a22'], [1, '#f0cf7a']], 1, 1)}
    ${lin('capTop', [[0, '#ffffff', .55], [1, '#ffffff', 0]], 0, 1)}
    ${rad('wax', [[0, '#d25a63'], [.55, '#a52f3c'], [1, '#6e1a26']], .38, .32, .75)}
    ${rad('bulb', [[0, '#fff8dc'], [.35, '#ffe39a', .9], [1, '#ffcf70', 0]])}
    ${rad('ledGlow', [[0, '#fff1d0', .75], [1, '#fff1d0', 0]])}
    ${rad('spot', [[0, '#ffdcaa', .22], [.6, '#ffc890', .07], [1, '#ffc890', 0]])}
    ${rad('lampGlow', [[0, '#ffe2a8', .5], [1, '#ffcf80', 0]])}
    ${rad('domeCream', [[0, '#fffaf0'], [.6, '#f1e2c2'], [1, '#c8ae80']], .4, .3, .75)}
    ${rad('domeRose', [[0, '#f29aa4'], [.5, '#c4495a'], [1, '#7e2332']], .4, .3, .75)}
    ${rad('lampRose', [[0, '#ff8f9c', .8], [1, '#ff8f9c', 0]])}
    ${rad('lampWarm', [[0, '#ffe7b0', .8], [1, '#ffe7b0', 0]])}
    ${rad('vig', [[.55, '#140a06', 0], [1, '#140a06', .6]], .5, .45, .75)}
    ${rad('yarnG', [[0, '#f4b8c2'], [.6, '#d98a9a'], [1, '#a95a6c']], .38, .32, .7)}
    ${rad('yarnG2', [[0, '#f8e2a8'], [.6, '#e0b85e'], [1, '#a57f2c']], .38, .32, .7)}
    <pattern id="stripes" width="64" height="64" patternUnits="userSpaceOnUse"><rect width="32" height="64" fill="#ffffff" opacity=".035"/><rect x="31" width="1.5" height="64" fill="#000" opacity=".06"/></pattern>
    <pattern id="pawWall" width="46" height="46" patternUnits="userSpaceOnUse"><path d="${PAW}" transform="translate(12 12) scale(.36)" fill="#fff" opacity=".09"/><path d="${PAW}" transform="translate(35 35) scale(.3) rotate(18)" fill="#fff" opacity=".07"/></pattern>
    <pattern id="lining" width="22" height="22" patternUnits="userSpaceOnUse"><rect width="22" height="22" fill="#7f9fb8"/><path d="${PAW}" transform="translate(6 6) scale(.2)" fill="#fbeec9" opacity=".45"/><path d="${PAW}" transform="translate(17 17) scale(.18) rotate(20)" fill="#fbeec9" opacity=".35"/></pattern>
    <pattern id="grille" width="9" height="9" patternUnits="userSpaceOnUse"><circle cx="4.5" cy="4.5" r="2.1" fill="#2d1418" opacity=".55"/><circle cx="4" cy="4" r="1" fill="#000" opacity=".4"/></pattern>
    <clipPath id="glassClip"><rect x="564" y="216" width="472" height="426"/></clipPath>
    <clipPath id="slotClip"><rect x="588" y="786" width="98" height="76" rx="6"/></clipPath>`;
  }

  /* The sealed envelope, drawn in a 300 x 200 box. The same drawing is used
     inside the machine, in the prize slot and in the close-up. */
  const nameSize = clamp(30 - Math.max(0, NAME.length - 6) * 1.6, 17, 30);
  const ENV = {
    back: () => `<rect x="1" y="1" width="298" height="198" rx="7" fill="#e3d2ae"/><rect x="8" y="8" width="284" height="184" rx="4" fill="url(#lining)"/><rect x="8" y="8" width="284" height="184" rx="4" fill="url(#liningShade)"/>`,
    pocket: () => `<path d="M1 8Q1 1 8 1L150 108L292 1Q299 1 299 8V192Q299 199 292 199H8Q1 199 1 192Z" fill="url(#envPaper)" filter="url(#texPaper)"/>
      <path d="M2 10L136 102L4 197Z" fill="#7a5a30" opacity=".05"/><path d="M298 10L164 102L296 197Z" fill="#fff" opacity=".14"/>
      <path d="M4 197L136 102M296 197L164 102" stroke="#b89a6c" stroke-width="1.1" opacity=".5"/>
      <path d="M1 8Q1 1 8 1L150 108L292 1Q299 1 299 8V192Q299 199 292 199H8Q1 199 1 192Z" fill="none" stroke="#b89a6c" stroke-opacity=".6" stroke-width="1.2"/>
      <text x="150" y="172" text-anchor="middle" font-family="${esc(SCRIPT)}" font-size="${nameSize}" fill="#4f3522">${esc(NAME)}</text>
      <path d="M110 182Q150 190 192 179" stroke="#4f3522" stroke-width="1.3" fill="none" opacity=".55" stroke-linecap="round"/>
      <path d="M197 177c-2.5-3 1-6 3-3.5c2-2.5 5.5.5 3 3.5l-3 3z" fill="#a52f3c" opacity=".75"/>`,
    flapOuter: () => `<path d="M3 9L138 115Q150 124 162 115L297 9" fill="none" stroke="#5a3f28" stroke-opacity=".25" stroke-width="3.5" filter="url(#b1)" transform="translate(0 2.5)"/>
      <path d="M8 1H292Q300 1 297 8L162 113Q150 122 138 113L3 8Q0 1 8 1Z" fill="url(#flapPaper)" filter="url(#texPaper)"/>
      <path d="M8 1H292Q300 1 297 8L162 113Q150 122 138 113L3 8Q0 1 8 1Z" fill="none" stroke="#b89a6c" stroke-opacity=".6" stroke-width="1.1"/>
      <path d="M12 6L150 112" stroke="#fff" stroke-opacity=".35" stroke-width="1"/>`,
    flapInner: () => `<g transform="translate(0 124) scale(1 -1)"><path d="M8 1H292Q300 1 297 8L162 113Q150 122 138 113L3 8Q0 1 8 1Z" fill="#e8d8b6"/><path d="M18 7H282L158 104Q150 110 142 104Z" fill="url(#lining)"/><path d="M18 7H282L158 104Q150 110 142 104Z" fill="#000" opacity=".12"/></g>`,
    seal: () => {
      const r = rng(77); let d = '';
      const pts = [];
      for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, rr = 20.5 + (r() - .5) * 3.4; pts.push([Math.cos(a) * rr, Math.sin(a) * rr]); }
      pts.forEach((p, i) => { const q = pts[(i + 1) % 16], m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]; d += (i ? '' : `M${f((pts[15][0] + p[0]) / 2)} ${f((pts[15][1] + p[1]) / 2)}`) + `Q${f(p[0])} ${f(p[1])} ${f(m[0])} ${f(m[1])}`; });
      return `<path d="${d}Z" fill="#5e1520" opacity=".45" transform="translate(.8 1.6)" filter="url(#b1)"/>
        <path d="${d}Z" fill="url(#wax)"/>
        <circle r="14.5" fill="none" stroke="#6a1a24" stroke-opacity=".55" stroke-width="1.8"/>
        <circle r="14.5" fill="none" stroke="#f08d96" stroke-opacity=".35" stroke-width=".8" transform="translate(.5 .7)"/>
        <path d="${PAW}" transform="translate(.6 .4) scale(.5)" fill="#ee9aa2" opacity=".5"/>
        <path d="${PAW}" transform="translate(0 -.4) scale(.5)" fill="#76202d"/>
        <ellipse cx="-8" cy="-11" rx="6" ry="2.6" fill="#fff" opacity=".28" transform="rotate(-32 -8 -11)"/>`;
    }
  };
  const envFront = () => `${ENV.pocket()}${ENV.flapOuter()}<g transform="translate(150 114)">${ENV.seal()}</g>`;

  /* =================================================================
     PRIZES
     ================================================================= */
  function plush(id, c, bow) {
    const tux = c.pattern === 'tuxedo', tabby = c.pattern === 'tabby', calico = c.pattern === 'calico';
    const fur = `url(#${id}f)`, bel = c.belly, dark = c.furDark;
    const st = (d, w = 2.6) => `<path d="${d}" stroke="${dark}" stroke-width="${w}" stroke-linecap="round" fill="none" opacity=".7"/>`;
    let s = `<defs><radialGradient id="${id}f" cx=".36" cy=".3" r=".85"><stop offset="0" stop-color="${c.furLight}"/><stop offset=".55" stop-color="${c.fur}"/><stop offset="1" stop-color="${dark}"/></radialGradient></defs>`;
    s += `<ellipse cx="0" cy="-1" rx="40" ry="6.5" fill="#0d1420" opacity=".5" filter="url(#b2)"/>`;
    s += `<g filter="url(#fuzz)">`;
    // tail curled round the side
    s += `<path d="M24 -8C46 -6 54 -28 45 -42C41 -48 34 -46 36 -40C42 -29 36 -17 21 -19Z" fill="${fur}"/>`;
    if (tabby) s += st('M40 -24L47 -27') + st('M43 -35L49 -38');
    if (tux) s += `<path d="M40 -44C43 -48 48 -45 46 -40C44 -42 42 -43 40 -44Z" fill="${bel}"/>`;
    // body
    s += `<path d="M-33 -2C-41 -26 -33 -57 0 -59C33 -57 41 -26 33 -2Q0 4 -33 -2Z" fill="${fur}"/>`;
    if (tabby) s += st('M-31 -30Q-25 -29 -22 -34') + st('M-34 -18Q-27 -17 -24 -22') + st('M31 -30Q25 -29 22 -34') + st('M34 -18Q27 -17 24 -22');
    if (calico) s += `<path d="M10 -56C30 -52 36 -30 30 -14C22 -26 14 -40 10 -56Z" fill="#d8893f" opacity=".85"/>`;
    s += `<path d="M-16 -4C-22 -22 -16 -45 0 -47C16 -45 22 -22 16 -4Q0 0 -16 -4Z" fill="${bel}" opacity="${tux ? 1 : .72}"/>`;
    // arms and feet
    s += `<ellipse cx="-19" cy="-24" rx="8" ry="13" transform="rotate(14 -19 -24)" fill="${fur}"/><ellipse cx="19" cy="-24" rx="8" ry="13" transform="rotate(-14 19 -24)" fill="${fur}"/>`;
    const paw = tux ? bel : c.furLight;
    s += `<ellipse cx="-17" cy="-15" rx="6" ry="4.5" fill="${paw}"/><ellipse cx="17" cy="-15" rx="6" ry="4.5" fill="${paw}"/>`;
    s += `<ellipse cx="-15" cy="-4" rx="12" ry="7" fill="${paw}"/><ellipse cx="15" cy="-4" rx="12" ry="7" fill="${paw}"/>`;
    s += `</g>`;
    s += `<g fill="#e7a3a0" opacity=".85"><ellipse cx="-15" cy="-3" rx="3.4" ry="2.4"/><ellipse cx="15" cy="-3" rx="3.4" ry="2.4"/></g>`;
    s += `<path d="M0 -46V-6" stroke="#000" stroke-opacity=".2" stroke-width="1" stroke-dasharray="2 2"/>`;
    // bow at the neck
    if (bow) s += `<g transform="translate(0 -55)"><path d="M0 0L-15 -7V7ZM0 0L15 -7V7Z" fill="${bow}"/><path d="M0 0L-15 -7V7Z" fill="#000" opacity=".12"/><circle r="4" fill="${bow}" stroke="#000" stroke-opacity=".25" stroke-width=".8"/></g>`;
    // head
    s += `<g filter="url(#fuzz)">`;
    s += `<path d="M-32 -84Q-35 -109 -26 -116Q-14 -105 -8 -97Z" fill="${fur}"/><path d="M32 -84Q35 -109 26 -116Q14 -105 8 -97Z" fill="${fur}"/>`;
    s += `<ellipse cx="0" cy="-79" rx="35" ry="29" fill="${fur}"/>`;
    if (calico) s += `<path d="M-33 -84C-30 -102 -14 -108 -6 -106C-12 -94 -22 -86 -33 -84Z" fill="#d8893f"/><path d="M33 -80C32 -98 18 -108 8 -107C16 -94 24 -86 33 -80Z" fill="#2c2622"/>`;
    s += `</g>`;
    s += `<path d="M-28 -90Q-29 -104 -25 -109Q-18 -102 -14 -96Z" fill="#e7a3a0" opacity=".85"/><path d="M28 -90Q29 -104 25 -109Q18 -102 14 -96Z" fill="#e7a3a0" opacity=".85"/>`;
    if (tux) s += `<path d="M-5 -94C-4 -82 -17 -74 -19 -65C-10 -53 10 -53 19 -65C17 -74 4 -82 5 -94Z" fill="${bel}"/>`;
    if (tabby) s += st('M-8 -106L-6 -96') + st('M0 -108V-97') + st('M8 -106L6 -96') + st('M-34 -80Q-29 -79 -26 -82', 2.2) + st('M34 -80Q29 -79 26 -82', 2.2);
    s += `<ellipse cx="-7.5" cy="-68" rx="9" ry="6.5" fill="${bel}" opacity="${tux ? 1 : .8}"/><ellipse cx="7.5" cy="-68" rx="9" ry="6.5" fill="${bel}" opacity="${tux ? 1 : .8}"/>`;
    s += `<ellipse cx="-22" cy="-71" rx="5" ry="3" fill="#f0a0a0" opacity=".5"/><ellipse cx="22" cy="-71" rx="5" ry="3" fill="#f0a0a0" opacity=".5"/>`;
    // embroidered eyes, nose, mouth, whisker stitches
    s += `<g><circle cx="-13" cy="-81" r="5" fill="#1d1512"/><circle cx="13" cy="-81" r="5" fill="#1d1512"/><circle cx="-11.3" cy="-82.8" r="1.7" fill="#fff"/><circle cx="14.7" cy="-82.8" r="1.7" fill="#fff"/><circle cx="-14.4" cy="-79.2" r=".8" fill="#fff" opacity=".6"/><circle cx="11.6" cy="-79.2" r=".8" fill="#fff" opacity=".6"/></g>`;
    s += `<path d="M-3.6 -73.5H3.6L0 -69.5Z" fill="${c.nose}"/><path d="M0 -69.5Q-3 -64.5 -6.5 -66.5M0 -69.5Q3 -64.5 6.5 -66.5" stroke="#3a2a22" stroke-width="1.1" fill="none" stroke-linecap="round"/>`;
    s += `<g stroke="${tux ? '#e8e2d6' : '#7a4a22'}" stroke-width=".9" opacity=".6" stroke-linecap="round"><path d="M-17 -68H-27M-17 -65L-26 -62M17 -68H27M17 -65L26 -62"/></g>`;
    s += `<path d="M0 -108Q1.5 -100 0 -96" stroke="#000" stroke-opacity=".2" stroke-width="1" stroke-dasharray="2 2" fill="none"/>`;
    // the little sewn-in tag
    s += `<g transform="translate(-31 -13) rotate(-22)"><rect x="-4.5" y="0" width="9" height="11" rx="1" fill="#fbf6ea" stroke="#c9b48c" stroke-width=".6"/><path d="M0 7.6l-2.2-2.2a1.3 1.3 0 0 1 2.2-1.6a1.3 1.3 0 0 1 2.2 1.6z" fill="#b8434f"/></g>`;
    return s;
  }

  function box(w, h, c, r, sym) {
    const hw = w / 2;
    let s = `<ellipse cx="0" cy="-1" rx="${hw + 7}" ry="4.5" fill="#0d1420" opacity=".5" filter="url(#b2)"/>`;
    s += `<rect x="${-hw}" y="${-h}" width="${w}" height="${h}" rx="2" fill="${c}" filter="url(#tex)"/>`;
    s += `<rect x="${hw - w * .24}" y="${-h}" width="${w * .24}" height="${h}" fill="#000" opacity=".14"/>`;
    if (sym) for (let k = 0; k < 4; k++) s += `<path d="${PAW}" transform="translate(${f(-hw * .55 + (k % 2) * hw * 1.1)} ${f(-h * .72 + Math.floor(k / 2) * h * .45)}) scale(.22)" fill="#fff" opacity=".35"/>`;
    s += `<rect x="-3.5" y="${-h}" width="7" height="${h}" fill="${r}"/>`;
    s += `<rect x="${-hw - 2.5}" y="${-h - 9}" width="${w + 5}" height="10" rx="2" fill="${c}"/><rect x="${-hw - 2.5}" y="${-h}" width="${w + 5}" height="2" fill="#000" opacity=".18"/><rect x="${hw - w * .22}" y="${-h - 9}" width="${w * .24 + 2.5}" height="10" fill="#000" opacity=".12"/>`;
    s += `<rect x="-3.5" y="${-h - 9}" width="7" height="10" fill="${r}"/>`;
    s += `<path d="M0 ${-h - 9}C-10 ${-h - 22} -21 ${-h - 12} -5 ${-h - 9}C-19 ${-h - 3} -9 ${-h + 2} 0 ${-h - 9}C9 ${-h + 2} 19 ${-h - 3} 5 ${-h - 9}C21 ${-h - 12} 10 ${-h - 22} 0 ${-h - 9}Z" fill="${r}" stroke="#000" stroke-opacity=".18" stroke-width=".8"/>`;
    s += `<circle cy="${-h - 9}" r="3.2" fill="${r}" stroke="#000" stroke-opacity=".2" stroke-width=".8"/>`;
    return s;
  }
  function yarn(rad, grad) {
    let s = `<ellipse cx="0" cy="-1" rx="${rad + 5}" ry="4" fill="#0d1420" opacity=".5" filter="url(#b2)"/>`;
    s += `<circle cy="${-rad}" r="${rad}" fill="url(#${grad})"/>`;
    const r = rng(rad * 13);
    for (let i = 0; i < 7; i++) s += `<ellipse cx="0" cy="${-rad}" rx="${f(rad * (.55 + r() * .4))}" ry="${f(rad * (.2 + r() * .25))}" transform="rotate(${f(r() * 180)} 0 ${-rad})" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="1"/>`;
    s += `<path d="M${f(rad * .7)} ${f(-rad * .35)}C${rad + 8} ${-4} ${rad + 2} 2 ${rad + 14} 0" stroke="${grad === 'yarnG' ? '#d98a9a' : '#e0b85e'}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
    return s;
  }
  function capsule(rad, col) {
    return `<ellipse cx="0" cy="-1" rx="${rad + 3}" ry="3" fill="#0d1420" opacity=".45" filter="url(#b1)"/>
      <circle cy="${-rad}" r="${rad}" fill="#e8eef5" opacity=".38"/>
      <path d="M${-rad} ${-rad}A${rad} ${rad} 0 0 1 ${rad} ${-rad}Z" fill="${col}"/>
      <path d="M${-rad} ${-rad}H${rad}" stroke="#fff" stroke-opacity=".5" stroke-width="1.2"/>
      <ellipse cx="${-rad * .35}" cy="${-rad * 1.55}" rx="${rad * .35}" ry="${rad * .18}" fill="#fff" opacity=".55"/>
      <circle cy="${-rad}" r="${rad}" fill="none" stroke="#fff" stroke-opacity=".3"/>`;
  }
  function pouch() {
    return `<ellipse cx="0" cy="-1" rx="22" ry="4" fill="#0d1420" opacity=".5" filter="url(#b2)"/>
      <path d="M-17 0L-14 -38H14L17 0Z" fill="url(#kraft)" filter="url(#tex)"/>
      <path d="M-14 -38L-11 -42L-8 -38L-5 -42L-2 -38L1 -42L4 -38L7 -42L10 -38L13 -42L14 -38Z" fill="#b8915c"/>
      <ellipse cx="0" cy="-20" rx="10" ry="8" fill="#fbf2dd"/>
      <path d="M-6 -20Q-1 -25 4 -20Q-1 -15 -6 -20ZM4 -20L8.5 -23.5V-16.5Z" fill="#b8603e"/>
      <circle cx="-3" cy="-20.8" r=".8" fill="#fbf2dd"/>`;
  }
  function bonbon() {
    return `<ellipse cx="0" cy="-1" rx="20" ry="3.6" fill="#0d1420" opacity=".5" filter="url(#b2)"/>
      <path d="M-9 -9L-20 -16L-18 -9L-21 -2Z" fill="#e0b85e"/><path d="M9 -9L20 -16L18 -9L21 -2Z" fill="#c9973f"/>
      <ellipse cx="0" cy="-9" rx="11" ry="8.5" fill="url(#foil)"/>
      <ellipse cx="-3.5" cy="-12.5" rx="4" ry="1.8" fill="#fff" opacity=".6"/>`;
  }
  function crinkle(seed, n, x0, x1, y0, y1, op) {
    const r = rng(seed), cols = ['#f3e6c9', '#e9c886', '#d98a9a', '#fbeec9', '#c47a86', '#e7d3a6'];
    let s = '';
    for (let i = 0; i < n; i++) {
      const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), dx = (r() - .5) * 26, dy = (r() - .5) * 9;
      s += `<path d="M${f(x)} ${f(y)}q${f(dx * .5)} ${f(dy - 5)} ${f(dx)} ${f(dy)}" stroke="${cols[Math.floor(r() * cols.length)]}" stroke-width="${f(1.8 + r() * 1.4)}" fill="none" stroke-linecap="round" opacity="${f(op * (.6 + r() * .4))}"/>`;
    }
    return s;
  }

  /* =================================================================
     WORLD LAYOUT (machine units)
     ================================================================= */
  const DRUM_Y = 268;          // centre of the cable drum on the carriage: the claw swings from here
  const CABLE_Y = 276;         // where the cable leaves the drum
  const REST_Y = 300;          // top of the claw hub when fully raised
  const HOME_X = 628;          // above the prize chute
  const MIN_X = 628, MAX_X = 1008;
  const CLAW_K = 1.25;         // the claw is drawn at this scale
  const OPEN_A = 45, REST_A = 12, GRIP_A = 25;
  const TIP_OPEN = 61.6 * CLAW_K;   // hub top -> prong tips with the claw open
  const TIP_GRIP = 73 * CLAW_K;     // hub top -> prong tips when gripping the envelope
  const MAXV = 240, ACC = 1100, BRAKE = 1700;

  // the envelope as it rests in the machine (centre, size, tilt)
  const PRIZE = { cx: 884, cy: 590, w: 90, h: 60, r: -4 };
  PRIZE.top = PRIZE.cy - PRIZE.h / 2;
  const ENV_S = PRIZE.w / 300;
  const SLOT = { cx: 637, cy: 830, r: -3 };

  // front-row prizes that the claw can bump into (hw = half width, top = highest point)
  const ITEMS = [
    { id: 'bonbon', cx: 710, by: 630, hw: 18, top: 612, art: () => bonbon() },
    { id: 'plushA', cx: 766, by: 633, hw: 40, top: 517, cat: 'one', art: () => plush('pa', CATS.one, '#8a2a34') },
    { id: 'boxRose', cx: 830, by: 631, hw: 28, top: 562, art: () => box(52, 46, '#c47a86', '#f6e3b0', true) },
    { id: 'plushB', cx: 976, by: 633, hw: 40, top: 517, cat: 'two', art: () => plush('pb', CATS.two, '#3f6a78') }
  ];

  /* ---------- layer 0: the room and the inside of the machine ---------- */
  function layer0() {
    let s = '';
    // wall, wainscot, floor
    s += `<rect x="-1400" y="-700" width="4400" height="1590" fill="#46302f"/>`;
    s += `<rect x="-1400" y="-700" width="4400" height="1590" fill="url(#stripes)"/>`;
    s += `<rect x="-1400" y="704" width="4400" height="10" fill="#6a5249"/>`;
    s += `<rect x="-1400" y="714" width="4400" height="166" fill="#54403a"/>`;
    for (let x = -1380; x < 3000; x += 190) s += `<rect x="${x}" y="738" width="160" height="118" rx="3" fill="none" stroke="#6a544c" stroke-width="3"/><rect x="${x + 3}" y="741" width="154" height="112" fill="none" stroke="#3e2d28" stroke-width="1.2" opacity=".6"/>`;
    s += `<rect x="-1400" y="872" width="4400" height="12" fill="#3a2823"/>`;
    s += `<rect x="-1400" y="884" width="4400" height="900" fill="#3b261c" filter="url(#woodH)"/>`;
    s += `<rect x="-1400" y="884" width="4400" height="40" fill="#000" opacity=".25"/>`;
    // warm light on the machine
    s += `<ellipse cx="800" cy="470" rx="760" ry="620" fill="url(#spot)"/>`;
    // a floor lamp on the left and balloons on the right, soft with distance
    s += `<g opacity=".8"><ellipse cx="250" cy="320" rx="260" ry="260" fill="url(#lampGlow)"/>
      <rect x="246" y="330" width="7" height="560" fill="#2a1a12"/><ellipse cx="250" cy="886" rx="46" ry="9" fill="#1e120c"/><ellipse cx="250" cy="880" rx="38" ry="7" fill="#3b2a1f"/>
      <path d="M196 330L220 250H280L304 330Z" fill="#f1ddb6"/><path d="M196 330L220 250H232L214 330Z" fill="#fff4dc" opacity=".5"/><path d="M196 330H304" stroke="#c9a46a" stroke-width="3"/>
      <ellipse cx="250" cy="332" rx="52" ry="7" fill="#fff0c8" opacity=".75" filter="url(#b4)"/></g>`;
    const bal = [[1330, 300, '#c47a86'], [1400, 250, '#e9c886'], [1450, 330, '#7f9fb8'], [1370, 380, '#d98a9a'], [1480, 230, '#c9a0c0']];
    s += `<g opacity=".55" filter="url(#b2)">`;
    bal.forEach(([x, y, c]) => { s += `<path d="M${x} ${y + 60}Q${x - 14} ${y + 200} ${1400} ${880}" stroke="#d9c7a4" stroke-width="1.4" fill="none" opacity=".6"/><ellipse cx="${x}" cy="${y}" rx="44" ry="54" fill="${c}"/><ellipse cx="${x - 14}" cy="${y - 20}" rx="10" ry="16" fill="#fff" opacity=".35"/><path d="M${x - 5} ${y + 54}h10l-5 7z" fill="${c}"/>`; });
    s += `</g>`;
    // string lights along the top
    let bulbs = '', wire = 'M-600 40';
    for (let x = -600; x < 2400; x += 400) { wire += `Q${x + 200} 150 ${x + 400} 40`; }
    for (let x = -600; x < 2400; x += 400) for (let k = 1; k < 10; k++) {
      const t = k / 10, bx = x + 400 * t, by = (1 - t) * (1 - t) * 40 + 2 * (1 - t) * t * 150 + t * t * 40;
      bulbs += `<circle cx="${f(bx)}" cy="${f(by + 9)}" r="14" fill="url(#bulb)" opacity=".7"/><ellipse cx="${f(bx)}" cy="${f(by + 8)}" rx="3" ry="4.4" fill="#fff4cf"/><rect x="${f(bx - 2.2)}" y="${f(by)}" width="4.4" height="4" fill="#3a2a22"/>`;
    }
    s += `<path d="${wire}" stroke="#241712" stroke-width="2" fill="none"/>${bulbs}`;
    // bokeh
    const br = rng(9);
    for (let i = 0; i < 26; i++) {
      const x = br() < .5 ? -300 + br() * 780 : 1120 + br() * 780, y = 120 + br() * 560;
      s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(10 + br() * 26)}" fill="${br() < .5 ? '#ffd9a0' : '#f3a9b4'}" opacity="${f(.04 + br() * .07)}" filter="url(#b4)"/>`;
    }
    // shadow and glow under the machine
    s += `<ellipse cx="800" cy="992" rx="440" ry="56" fill="#f0a8a0" opacity=".09" filter="url(#b16)"/>`;
    s += `<ellipse cx="800" cy="970" rx="318" ry="20" fill="#000" opacity=".6" filter="url(#b8)"/>`;

    // inside the glass: back wall, side walls, ceiling, floor
    s += `<rect x="564" y="216" width="472" height="426" fill="url(#wallBlue)"/>`;
    s += `<rect x="564" y="216" width="472" height="426" fill="url(#pawWall)"/>`;
    s += `<path d="M564 216L596 240V610L564 642Z" fill="#26344a" opacity=".6"/><path d="M1036 216L1004 240V610L1036 642Z" fill="#26344a" opacity=".45"/>`;
    s += `<path d="M564 216H1036L1004 240H596Z" fill="#1d2636" opacity=".75"/>`;
    s += `<path d="M596 610H1004L1036 642H564Z" fill="#303e55"/>`;
    s += `<rect x="564" y="216" width="472" height="426" fill="url(#wash)"/>`;
    // warm light strip under the ceiling
    s += `<ellipse cx="800" cy="250" rx="250" ry="42" fill="url(#ledGlow)"/><rect x="606" y="232" width="388" height="4" rx="2" fill="#fff5dc"/>`;
    // gantry: back rail and end brackets
    s += `<rect x="572" y="240" width="456" height="5" rx="2" fill="url(#chromeV)"/>`;
    s += `<rect x="566" y="234" width="16" height="28" rx="3" fill="url(#iron)"/><rect x="1018" y="234" width="16" height="28" rx="3" fill="url(#iron)"/>`;
    s += `<circle cx="574" cy="248" r="2.2" fill="url(#brass)"/><circle cx="1026" cy="248" r="2.2" fill="url(#brass)"/>`;
    // prize chute: the dark inside
    s += `<rect x="572" y="470" width="112" height="172" fill="#141c2a" opacity=".6"/><path d="M572 470H684L676 480H580Z" fill="#000" opacity=".3"/>`;
    // back-row prizes, a little further away
    s += crinkle(3, 190, 598, 1004, 586, 624, .75);
    const back = [
      [700, 600, capsule(13, '#9fc48a')], [790, 598, capsule(12, '#e9c886')], [936, 598, capsule(12, '#c47a86')],
      [712, 608, capsule(14, '#e9c886')], [748, 610, box(40, 34, '#7f9fb8', '#fbeec9', false)], [800, 606, capsule(13, '#c47a86')],
      [856, 609, pouch()], [912, 609, yarn(16, 'yarnG2')], [952, 606, capsule(13, '#9fc48a')], [992, 610, box(36, 30, '#f3e6c9', '#c47a86', false)],
      [1004, 624, yarn(15, 'yarnG')]
    ];
    s += `<g>`;
    back.forEach(([x, y, a]) => { s += `<g transform="translate(${x} ${y}) scale(.95)">${a}</g>`; });
    s += `</g><rect x="596" y="556" width="408" height="64" fill="#23324a" opacity=".2"/>`;
    s += crinkle(5, 120, 598, 1004, 612, 632, .85);
    return s;
  }

  /* ---------- layer 1: everything that moves ---------- */
  const PRONG = `<path d="M-3 -1C5 3 15 15 16 31C17 42 11 51 3 58C1 60 -2 58 -1 56C6 48 10 40 9 31C8 19 2 10 -5 5Z" fill="url(#chrome)" stroke="#3e3934" stroke-width=".8"/>
    <path d="M2 4C9 11 13 20 13.4 30" stroke="#fff" stroke-opacity=".55" stroke-width="1.1" fill="none" stroke-linecap="round"/>
    <path d="M3 58C1 60 -2 58 -1 56L2.4 52.5L6.2 54.8Z" fill="#3a3330"/>
    <circle r="3.2" fill="url(#brass)" stroke="#5a3f16" stroke-width=".7"/>`;
  function layer1() {
    let s = '';
    s += `<ellipse id="cshadow" cx="${HOME_X}" cy="620" rx="26" ry="5" fill="#0b1220" opacity=".2" filter="url(#b2)"/>`;
    ITEMS.forEach(it => {
      s += `<g transform="translate(${it.cx} ${it.by})${it.s ? ` scale(${it.s})` : ''}"><g id="it-${it.id}">${it.art()}</g></g>`;
    });
    // the envelope prize
    s += `<g id="env"><ellipse cx="150" cy="208" rx="170" ry="16" fill="#0d1420" opacity=".45" filter="url(#b8)"/>${envFront()}
      <g class="glintAt" transform="translate(284 22)"><path class="glint" d="M0 -18L4 -4L18 0L4 4L0 18L-4 4L-18 0L-4 -4Z" fill="#fffbe8"/></g></g>`;
    s += crinkle(11, 60, 690, 1030, 626, 640, .95);
    // carriage on its rails
    s += `<g id="car">
      <rect x="-30" y="235" width="60" height="6" rx="2" fill="url(#brass)"/>
      <rect x="-28" y="239" width="56" height="25" rx="4" fill="url(#iron)"/>
      <circle cx="-18" cy="242.5" r="5" fill="url(#chrome)" stroke="#2a2724" stroke-width=".8"/><circle cx="18" cy="242.5" r="5" fill="url(#chrome)" stroke="#2a2724" stroke-width=".8"/>
      <rect x="-20" y="249" width="40" height="11" rx="2" fill="#221f1c"/><circle cx="-14" cy="254.5" r="1.6" fill="url(#brass)"/><circle cx="14" cy="254.5" r="1.6" fill="url(#brass)"/>
      <g transform="translate(0 ${DRUM_Y})"><g id="drum"><circle r="8.5" fill="url(#chrome)" stroke="#3e3934" stroke-width=".8"/><path d="M-8 0H8M0 -8V8" stroke="#5d5852" stroke-width="1.5"/></g><circle r="2.4" fill="url(#brass)"/></g>
    </g>`;
    s += `<rect x="572" y="252" width="456" height="5" rx="2" fill="url(#chromeV)"/>`;
    // swinging claw
    s += `<g id="sw">
      <line id="cab" stroke="#bdb6ac" stroke-width="2.8" stroke-linecap="round"/>
      <line id="cab2" stroke="#6f6860" stroke-width="1.3" stroke-dasharray="2.4 2.4"/>
      <g id="hub">
        <g id="pB"><path d="M-2.6 0H2.6L3.2 46Q0 52 -3.2 46Z" fill="#6a655e"/></g>
        <path d="M-12 5Q-12 0 -7 0H7Q12 0 12 5V19Q12 24 7 24H-7Q-12 24 -12 19Z" fill="url(#chrome)" stroke="#4a4540" stroke-width=".8"/>
        <rect x="-12" y="8" width="24" height="3.6" fill="url(#brass)"/>
        <path d="M-9 3V21" stroke="#fff" stroke-opacity=".45" stroke-width="1.4"/>
        <ellipse cx="0" cy=".6" rx="5.5" ry="1.8" fill="#6f6860"/>
        <ellipse cx="0" cy="23.5" rx="14" ry="3.6" fill="url(#chromeV)" stroke="#4a4540" stroke-width=".6"/>
        <g id="pR">${PRONG}</g>
        <g id="pL">${PRONG}</g>
      </g>
    </g>`;
    return s;
  }

  /* ---------- layer 2: glass, cabinet, control deck ---------- */
  function layer2() {
    let s = '';
    // chute front: acrylic with a brass lip
    s += `<rect x="570" y="470" width="116" height="172" fill="#cfe2ff" opacity=".1"/><rect x="570" y="470" width="116" height="172" fill="none" stroke="#fff" stroke-opacity=".32" stroke-width="1.5"/>`;
    s += `<path d="M578 480V634" stroke="#fff" stroke-opacity=".3" stroke-width="2.2"/><path d="${PAW}" transform="translate(628 562) scale(.9)" fill="#fff" opacity=".16"/>`;
    s += `<rect x="566" y="462" width="124" height="9" rx="3" fill="url(#brassV)"/>`;
    // glass
    s += `<g clip-path="url(#glassClip)">
      <rect x="564" y="216" width="472" height="426" fill="#dbe8ff" opacity=".035"/>
      <path d="M654 216H724L598 642H528Z" fill="url(#glassBand)"/>
      <path d="M742 216H756L630 642H616Z" fill="#fff" opacity=".05"/>
      <path d="M958 216H980L900 642H878Z" fill="url(#glassBand)" opacity=".7"/>
      <ellipse cx="1000" cy="250" rx="46" ry="18" fill="#fff" opacity=".07" filter="url(#b4)"/>
      ${[[640, 300], [700, 318], [900, 306], [960, 292]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6" fill="#ffe7b8" opacity=".1" filter="url(#b2)"/>`).join('')}
      <rect x="564" y="216" width="472" height="2" fill="#fff" opacity=".22"/>
    </g>`;
    // crown with cat ears, and the sign
    s += `<path d="M570 98Q562 52 588 30Q606 44 642 80Z" fill="url(#lacV)" stroke="#8a5f1f" stroke-width="2"/><path d="M583 88Q581 60 594 45Q605 58 626 80Z" fill="#e7a3a0" opacity=".75"/>`;
    s += `<path d="M1030 98Q1038 52 1012 30Q994 44 958 80Z" fill="url(#lacV)" stroke="#8a5f1f" stroke-width="2"/><path d="M1017 88Q1019 60 1006 45Q995 58 974 80Z" fill="#e7a3a0" opacity=".75"/>`;
    s += `<path d="M540 206V118Q540 76 582 76H1018Q1060 76 1060 118V206Z" fill="url(#lac)" filter="url(#tex)"/>`;
    s += `<path d="M540 118Q540 76 582 76H1018Q1060 76 1060 118" fill="none" stroke="url(#brass)" stroke-width="5"/>`;
    s += `<path d="M548 118Q548 84 584 84H1016Q1052 84 1052 118" fill="none" stroke="#fff" stroke-opacity=".18" stroke-width="1.5"/>`;
    s += `<rect x="584" y="98" width="432" height="88" rx="16" fill="url(#creamG)" filter="url(#tex)"/>`;
    s += `<rect x="584" y="98" width="432" height="88" rx="16" fill="none" stroke="url(#brass)" stroke-width="3"/>`;
    s += `<rect x="593" y="107" width="414" height="70" rx="11" fill="none" stroke="#c9a46a" stroke-opacity=".55"/>`;
    s += `<text x="801" y="152" text-anchor="middle" font-family="${esc(SCRIPT)}" font-size="44" fill="#fff" opacity=".7">Special Delivery</text>`;
    s += `<text x="800" y="150.5" text-anchor="middle" font-family="${esc(SCRIPT)}" font-size="44" fill="#8a2a34">Special Delivery</text>`;
    s += `<text x="800" y="175" text-anchor="middle" font-family="${esc(SERIF)}" font-size="12" letter-spacing="4" fill="#9a6d4c">FOR ${esc(NAME.toUpperCase())}</text>`;
    s += `<path d="${PAW}" transform="translate(634 142) scale(.62)" fill="#c47a86" opacity=".55"/><path d="${PAW}" transform="translate(966 142) scale(.62)" fill="#c47a86" opacity=".55"/>`;
    // header bar and pillars
    s += `<rect x="540" y="200" width="520" height="17" fill="url(#brassV)"/><rect x="540" y="216" width="520" height="2" fill="#000" opacity=".3"/>`;
    s += `<rect x="540" y="217" width="25" height="426" fill="url(#lacV)" filter="url(#tex)"/><rect x="1035" y="217" width="25" height="426" fill="url(#lacV)" filter="url(#tex)"/>`;
    s += `<rect x="540" y="217" width="4" height="426" fill="#fff" opacity=".12"/><rect x="1056" y="217" width="4" height="426" fill="#000" opacity=".2"/>`;
    s += `<rect x="562" y="217" width="3" height="426" fill="url(#brassV)"/><rect x="1035" y="217" width="3" height="426" fill="url(#brassV)"/>`;
    // control deck
    s += `<rect x="530" y="640" width="540" height="11" rx="2" fill="url(#brassV)"/>`;
    s += `<path d="M532 650H1068L1080 742H520Z" fill="url(#deck)" filter="url(#tex)"/>`;
    s += `<path d="M540 656H1060L1070 736H530Z" fill="none" stroke="#b8955c" stroke-opacity=".5"/>`;
    s += `<rect x="518" y="742" width="564" height="11" rx="3" fill="url(#brassV)"/>`;
    // coin plate
    s += `<rect x="566" y="664" width="130" height="64" rx="8" fill="url(#brass)"/><rect x="572" y="670" width="118" height="52" rx="5" fill="none" stroke="#6a4814" stroke-opacity=".5"/>`;
    s += `<rect x="619" y="676" width="24" height="26" rx="4" fill="#2a1a0c"/><rect x="629" y="680" width="4" height="18" rx="2" fill="#000"/><path d="M621 700H641" stroke="#f6dc93" stroke-opacity=".5"/>`;
    s += `<text x="631" y="717" text-anchor="middle" font-family="${esc(SERIF)}" font-size="10.5" letter-spacing="2.4" fill="#4f3510" filter="url(#engrave)">FREE PLAY</text>`;
    // button sockets and engraved labels
    [[836, 694, 31, 21], [916, 694, 31, 21], [1000, 692, 37, 24]].forEach(([x, y, rx, ry]) => {
      s += `<ellipse cx="${x}" cy="${y + 3}" rx="${rx + 2}" ry="${ry + 2}" fill="#000" opacity=".22" filter="url(#b2)"/><ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="url(#brass)"/><ellipse cx="${x}" cy="${y + 1}" rx="${rx - 5}" ry="${ry - 4}" fill="#2b1a12"/>`;
    });
    s += `<text x="876" y="734" text-anchor="middle" font-family="${esc(SERIF)}" font-size="10.5" letter-spacing="3" fill="#6b4a2a" filter="url(#engrave)">MOVE</text>`;
    s += `<text x="1000" y="734" text-anchor="middle" font-family="${esc(SERIF)}" font-size="10.5" letter-spacing="3" fill="#6b4a2a" filter="url(#engrave)">DROP</text>`;
    // lower cabinet
    s += `<rect x="540" y="753" width="520" height="198" fill="url(#lacD)" filter="url(#tex)"/>`;
    s += `<rect x="540" y="753" width="520" height="3" fill="#000" opacity=".3"/><rect x="552" y="762" width="496" height="176" rx="10" fill="none" stroke="url(#brass)" stroke-width="2"/>`;
    // prize slot
    s += `<rect x="578" y="776" width="118" height="96" rx="10" fill="url(#brass)"/><rect x="584" y="782" width="106" height="84" rx="8" fill="#5a3f16" opacity=".35"/>`;
    s += `<rect x="588" y="786" width="98" height="76" rx="6" fill="url(#slotDark)"/><rect x="588" y="850" width="98" height="12" rx="3" fill="#4a2e33" opacity=".7"/><path d="M592 850H682" stroke="#fff" stroke-opacity=".08"/>`;
    s += `<rect x="606" y="880" width="62" height="18" rx="4" fill="url(#brass)"/><text x="637" y="893" text-anchor="middle" font-family="${esc(SERIF)}" font-size="10" letter-spacing="2.5" fill="#4f3510" filter="url(#engrave)">PRIZE</text>`;
    // right panel: speaker grilles and a paw medallion
    s += `<rect x="726" y="780" width="306" height="144" rx="12" fill="url(#creamG)" filter="url(#tex)"/><rect x="726" y="780" width="306" height="144" rx="12" fill="none" stroke="url(#brass)" stroke-width="2.5"/>`;
    s += `<rect x="748" y="804" width="84" height="96" rx="8" fill="url(#grille)"/><rect x="926" y="804" width="84" height="96" rx="8" fill="url(#grille)"/>`;
    s += `<circle cx="879" cy="852" r="38" fill="url(#brass)"/><circle cx="879" cy="852" r="30" fill="#7a3443"/><circle cx="879" cy="852" r="30" fill="none" stroke="#000" stroke-opacity=".25" stroke-width="2"/>`;
    s += `<path d="${PAW}" transform="translate(879 850) scale(1.05)" fill="url(#brass)"/>`;
    // plinth and feet
    s += `<rect x="532" y="949" width="536" height="17" rx="4" fill="#2a1812"/><rect x="532" y="949" width="536" height="3" fill="url(#brassV)"/>`;
    s += `<rect x="552" y="964" width="26" height="9" rx="2" fill="url(#brass)"/><rect x="1022" y="964" width="26" height="9" rx="2" fill="url(#brass)"/>`;
    return s;
  }

  /* ---------- layer 3: lights, buttons and the prize slot ---------- */
  function domeBtn(id, x, y, rx, ry, grad, lamp, glyph, label) {
    return `<g id="${id}" class="btn hot" role="button" aria-label="${label}">
      <ellipse class="lamp" cx="${x}" cy="${y - 3}" rx="${rx + 14}" ry="${ry + 12}" fill="url(#${lamp})"/>
      <g class="dome">
        <ellipse cx="${x}" cy="${y - 1}" rx="${rx}" ry="${ry}" fill="#000" opacity=".35"/>
        <ellipse cx="${x}" cy="${y - 5}" rx="${rx}" ry="${ry}" fill="url(#${grad})"/>
        <ellipse cx="${x - rx * .3}" cy="${y - 5 - ry * .45}" rx="${rx * .42}" ry="${ry * .26}" fill="#fff" opacity=".55"/>
        ${glyph}
      </g>
      <ellipse cx="${x}" cy="${y - 2}" rx="${rx + 8}" ry="${ry + 8}" fill="#000" opacity="0"/>
    </g>`;
  }
  function layer3() {
    let s = '';
    // chasing marquee bulbs
    const pts = [];
    const x0 = 572, x1 = 1028, y0 = 90, y1 = 194, step = 28.5;
    for (let x = x0; x <= x1 + .1; x += (x1 - x0) / 16) pts.push([x, y0]);
    for (let y = y0 + (y1 - y0) / 4; y < y1 - .1; y += (y1 - y0) / 4) pts.push([x1, y]);
    for (let x = x1; x >= x0 - .1; x -= (x1 - x0) / 16) pts.push([x, y1]);
    for (let y = y1 - (y1 - y0) / 4; y > y0 + .1; y -= (y1 - y0) / 4) pts.push([x0, y]);
    pts.forEach(([x, y], i) => { s += `<g class="bulb k${i % 3}"><circle cx="${f(x)}" cy="${f(y)}" r="10" fill="url(#bulb)"/><circle cx="${f(x)}" cy="${f(y)}" r="3.6" fill="#fffaf0"/></g>`; });
    void step;
    // control buttons
    const arrow = (x, y, dir) => `<path d="M${x - dir * 7} ${y - 5}L${x + dir * 6} ${y - 5}M${x + dir * 1} ${y - 11}L${x + dir * 7} ${y - 5}L${x + dir * 1} ${y + 1}" stroke="#9c3d4c" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
    s += domeBtn('bL', 836, 694, 25, 16, 'domeCream', 'lampWarm', arrow(836, 694, -1), 'Move the claw left');
    s += domeBtn('bR', 916, 694, 25, 16, 'domeCream', 'lampWarm', arrow(916, 694, 1), 'Move the claw right');
    const claw = `<g transform="translate(1000 687)" stroke="#fbe6dc" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".9"><path d="M0 -9V-2"/><path d="M-3 -2H3"/><path d="M-3 -2Q-9 3 -5 8M3 -2Q9 3 5 8"/></g>`;
    s += domeBtn('bD', 1000, 692, 30, 19, 'domeRose', 'lampRose', claw, 'Drop the claw');
    // prize slot: glow, the envelope once it arrives, and the smoked flap
    s += `<rect id="slotGlow" x="582" y="780" width="110" height="88" rx="9" fill="none" stroke="#ffe2a0" stroke-width="3" filter="url(#b2)"/>`;
    s += `<g clip-path="url(#slotClip)"><g id="envSlot" opacity="0"><ellipse cx="150" cy="206" rx="150" ry="14" fill="#000" opacity=".5" filter="url(#b8)"/>${envFront()}</g></g>`;
    s += `<g id="slotFlap" class="flap"><rect x="588" y="786" width="98" height="58" rx="5" fill="#2a1a1e" opacity=".32"/><path d="M592 790H682" stroke="#fff" stroke-opacity=".3" stroke-width="1.5"/><path d="M596 796L620 840" stroke="#fff" stroke-opacity=".1" stroke-width="6"/></g>`;
    s += `<rect id="slotHit" class="hot" x="578" y="776" width="118" height="96" rx="10" fill="#000" opacity="0" style="pointer-events:none" aria-label="Collect the envelope"/>`;
    return s;
  }

  /* =================================================================
     BUILD
     ================================================================= */
  $('#defsInner').innerHTML = defs();
  const LAY = ['L0', 'L1', 'L2', 'L3'].map(id => document.getElementById(id));
  LAY[0].innerHTML = layer0();
  LAY[1].innerHTML = layer1();
  LAY[2].innerHTML = layer2();
  LAY[3].innerHTML = layer3();
  // close-up envelope uses the same drawing
  document.querySelector('.cu-back').innerHTML = ENV.back();
  document.querySelector('.cu-pocket').innerHTML = ENV.pocket();
  document.querySelector('.cu-flap-out').innerHTML = ENV.flapOuter();
  document.querySelector('.cu-flap-in').innerHTML = ENV.flapInner();
  document.querySelectorAll('.cu-seal svg').forEach(sv => { sv.innerHTML = ENV.seal(); });

  const el = {
    car: $('#car'), drum: $('#drum'), sw: $('#sw'), cab: $('#cab'), cab2: $('#cab2'), hub: $('#hub'),
    pR: $('#pR'), pL: $('#pL'), pB: $('#pB'), shadow: $('#cshadow'), env: $('#env'),
    envSlot: $('#envSlot'), slotFlap: $('#slotFlap'), slotHit: $('#slotHit'),
    bL: $('#bL'), bR: $('#bR'), bD: $('#bD'),
    cap: $('#cap'), capText: $('#capText'), capBtn: $('#capBtn'),
    cu: $('#cu'), cuWrap: $('#cuWrap'), cuEnv: $('#cuEnv'), cuPaper: $('#cuPaper'), cuSeal: $('#cuSeal'),
    fold: $('#fold'), letter: $('#letter'), ltBody: $('#ltBody'), ltCtrl: $('#ltCtrl'),
    btnFull: $('#btnFull'), btnAgain: $('#btnAgain'), btnBack: $('#btnBack')
  };
  const itemEl = {};
  ITEMS.forEach(it => { itemEl[it.id] = document.getElementById('it-' + it.id); });

  /* ---------- fit the machine to the window ---------- */
  const CORE = { x: 470, y: -46, w: 660, h: 1032 };
  function fit() {
    const W = window.innerWidth || 1, H = window.innerHeight || 1, a = W / H;
    let vw, vh;
    if (a > CORE.w / CORE.h) { vh = CORE.h; vw = vh * a; } else { vw = CORE.w; vh = vw / a; }
    const vb = `${f(800 - vw / 2)} ${f(CORE.y + CORE.h / 2 - vh / 2)} ${f(vw)} ${f(vh)}`;
    LAY.forEach(l => l.setAttribute('viewBox', vb));
  }
  fit();
  window.addEventListener('resize', fit);

  /* =================================================================
     STATE AND RENDERING
     ================================================================= */
  const S = {
    state: 'intro',            // intro | idle | busy | won | collect | sealed | opening | letter
    x: HOME_X, y: REST_Y, a: REST_A,
    vel: 0, sway: 0, swayV: 0, lastX: HOME_X, lastV: 0, lockSway: false,
    held: false, heldDx: 0, heldR: 0,
    env: { x: PRIZE.cx, y: PRIZE.cy, r: PRIZE.r, show: true },
    shadowY: 620, misses: 0, moved: false, dropped: false
  };

  function surfaceAt(x) {
    if (x < 692) return 466;                            // the chute's brass lip
    let top = 628;
    ITEMS.forEach(it => { if (Math.abs(x - it.cx) < it.hw + 18) top = Math.min(top, it.top + 8); });
    if (S.env.show && !S.held && Math.abs(x - PRIZE.cx) < PRIZE.w / 2 + 12) top = Math.min(top, PRIZE.top + 4);
    return top;
  }
  const itemAt = x => ITEMS.find(it => Math.abs(x - it.cx) < it.hw + 14);

  function setEnv(x, y, r) {
    el.env.setAttribute('transform', `translate(${f(x)} ${f(y)}) rotate(${f(r)}) scale(${ENV_S}) translate(-150 -100)`);
  }
  function setSlotEnv(x, y, r) {
    el.envSlot.setAttribute('transform', `translate(${f(x)} ${f(y)}) rotate(${f(r)}) scale(${ENV_S}) translate(-150 -100)`);
  }

  function render() {
    el.car.setAttribute('transform', `translate(${f(S.x)} 0)`);
    el.drum.setAttribute('transform', `rotate(${f(S.y * 3.2)})`);
    el.sw.setAttribute('transform', `rotate(${f(S.sway)} ${f(S.x)} ${DRUM_Y})`);
    el.cab.setAttribute('x1', f(S.x)); el.cab.setAttribute('x2', f(S.x));
    el.cab.setAttribute('y1', CABLE_Y); el.cab.setAttribute('y2', f(S.y + 1));
    el.cab2.setAttribute('x1', f(S.x)); el.cab2.setAttribute('x2', f(S.x));
    el.cab2.setAttribute('y1', CABLE_Y); el.cab2.setAttribute('y2', f(S.y + 1));
    el.cab2.setAttribute('stroke-dashoffset', f(-S.y));
    el.hub.setAttribute('transform', `translate(${f(S.x)} ${f(S.y)}) scale(${CLAW_K})`);
    el.pR.setAttribute('transform', `translate(10 22) rotate(${f(-S.a)})`);
    el.pL.setAttribute('transform', `translate(-10 22) scale(-1 1) rotate(${f(-S.a)})`);
    el.pB.setAttribute('transform', `translate(0 22) scale(1 ${f(.62 + .38 * Math.cos(S.a * Math.PI / 90))})`);
    // soft shadow of the claw on whatever lies beneath it
    const sy = surfaceAt(S.x) + 3;
    S.shadowY += (sy - S.shadowY) * .25;
    const gap = Math.max(0, S.shadowY - (S.y + TIP_OPEN));
    el.shadow.setAttribute('cx', f(S.x)); el.shadow.setAttribute('cy', f(S.shadowY));
    el.shadow.setAttribute('rx', f(20 + gap * .05)); el.shadow.setAttribute('opacity', f(clamp(.34 - gap / 900, .1, .34)));
    // the envelope follows the claw only while it is really held
    if (S.held) {
      const px = S.x + S.heldDx, py = S.y + TIP_GRIP, a = S.sway * Math.PI / 180;
      const dx = px - S.x, dy = py - DRUM_Y;
      S.env.x = S.x + dx * Math.cos(a) - dy * Math.sin(a);
      S.env.y = DRUM_Y + dx * Math.sin(a) + dy * Math.cos(a);
      S.env.r = S.heldR + S.sway;
    }
    if (S.env.show) setEnv(S.env.x, S.env.y, S.env.r);
    // a prize the claw has picked up (it never makes it to the chute)
    const h = S.heldItem;
    if (h) {
      const px = S.x + h.dx, py = S.y + TIP_GRIP + h.oy, a = S.sway * Math.PI / 180;
      const dx = px - S.x, dy = py - DRUM_Y;
      h.x = S.x + dx * Math.cos(a) - dy * Math.sin(a);
      h.y = DRUM_Y + dx * Math.sin(a) + dy * Math.cos(a);
      h.rot = h.r + S.sway;
      itemEl[h.it.id].setAttribute('transform', `translate(${f(h.x - h.it.cx)} ${f(h.y - h.it.by)}) rotate(${f(h.rot)} 0 ${f(-h.oy)})`);
    }
  }

  /* ---------- input ---------- */
  const keys = { l: 0, r: 0 };
  let ptrDir = 0;
  const holdDir = () => (ptrDir || (keys.r - keys.l));
  function setPressed() {
    const d = S.state === 'idle' ? holdDir() : 0;
    el.bL.classList.toggle('down', d < 0);
    el.bR.classList.toggle('down', d > 0);
  }
  function setReady(on) { document.body.classList.toggle('ready', on); }

  function bindHold(btn, dir) {
    btn.addEventListener('pointerdown', e => {
      e.preventDefault(); Snd.unlock();
      if (S.state !== 'idle') { Snd.play('click'); return; }
      try { btn.setPointerCapture(e.pointerId); } catch (err) {}
      ptrDir = dir; Snd.play('click'); setPressed(); onMoveStart();
    });
    const up = () => { if (ptrDir === dir) { ptrDir = 0; setPressed(); } };
    btn.addEventListener('pointerup', up);
    btn.addEventListener('pointercancel', up);
    btn.addEventListener('lostpointercapture', up);
  }
  bindHold(el.bL, -1);
  bindHold(el.bR, 1);
  el.bD.addEventListener('pointerdown', e => { e.preventDefault(); Snd.unlock(); drop(); });
  el.slotHit.addEventListener('click', () => { Snd.unlock(); collect(); });
  el.cuSeal.addEventListener('click', () => { Snd.unlock(); openEnvelope(); });

  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') { requestClose(); return; }
    const inMachine = ['intro', 'idle', 'busy', 'won'].includes(S.state);
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      if (!inMachine) return;
      e.preventDefault(); Snd.unlock();
      if (e.repeat) return;
      keys[e.key === 'ArrowLeft' ? 'l' : 'r'] = 1;
      if (S.state === 'idle') { setPressed(); onMoveStart(); }
    } else if (e.key === ' ' || e.key === 'Spacebar' || e.key === 'ArrowDown') {
      if (!inMachine) return;
      e.preventDefault(); Snd.unlock();
      if (!e.repeat) { flashBtn(el.bD); drop(); }
    } else if ((e.key === 'Enter') && S.state === 'won' && document.activeElement === document.body) {
      collect();
    }
  });
  window.addEventListener('keyup', e => {
    if (e.key === 'ArrowLeft') keys.l = 0;
    if (e.key === 'ArrowRight') keys.r = 0;
    setPressed();
  });
  window.addEventListener('blur', () => { keys.l = keys.r = 0; ptrDir = 0; setPressed(); });
  document.addEventListener('pointerdown', () => Snd.unlock(), true);

  async function flashBtn(b) { b.classList.add('down'); await wait(140); b.classList.remove('down'); }

  /* ---------- the physics loop: carriage movement and claw sway ---------- */
  let tPrev = performance.now();
  function loop(t) {
    const dt = Math.min(.05, (t - tPrev) / 1000); tPrev = t;
    if (S.state === 'idle') {
      const target = holdDir() * MAXV;
      const rate = target === 0 || Math.sign(target) !== Math.sign(S.vel) ? BRAKE : ACC;
      S.vel += clamp(target - S.vel, -rate * dt, rate * dt);
      S.x += S.vel * dt;
      if (S.x <= MIN_X || S.x >= MAX_X) { S.x = clamp(S.x, MIN_X, MAX_X); S.vel = 0; }
      Snd.motor(Math.abs(S.vel) > 6);
    }
    if (dt > 0) {
      const v = (S.x - S.lastX) / dt, acc = (v - S.lastV) / dt;
      S.lastX = S.x; S.lastV = v;
      if (!S.lockSway) {
        S.swayV += (-42 * S.sway - 4.2 * S.swayV + clamp(acc, -3000, 3000) * .1) * dt;
        S.sway = clamp(S.sway + S.swayV * dt, -8, 8);
      }
    }
    render();
    requestAnimationFrame(loop);
  }

  /* ---------- captions ---------- */
  let capTimer = 0;
  function caption(html, ms = 0, btn = null) {
    clearTimeout(capTimer);
    el.capText.innerHTML = html;
    if (btn) { el.capBtn.textContent = btn.label; el.capBtn.onclick = btn.onClick; el.capBtn.hidden = false; }
    else { el.capBtn.hidden = true; el.capBtn.onclick = null; }
    el.cap.classList.add('on');
    if (ms) capTimer = setTimeout(hideCaption, ms);
  }
  function hideCaption() { clearTimeout(capTimer); el.cap.classList.remove('on'); }
  const TOUCH = window.matchMedia && matchMedia('(hover: none) and (pointer: coarse)').matches;
  const HINT_MOVE = TOUCH
    ? 'Hold the arrow buttons to move the claw, then press <b>Drop</b>.'
    : 'Move with the arrow buttons or <kbd>←</kbd> <kbd>→</kbd>, then <b>Drop</b> (or <kbd>Space</kbd>)';
  const HINT_AIM = 'Line the claw up over the envelope, then drop it.';
  function onMoveStart() {
    if (!S.moved) { S.moved = true; if (!S.dropped) caption(HINT_AIM); }
  }

  /* ---------- catching ---------- */
  // Generous but not automatic: ±14 units to begin with, widening gently after misses.
  const tolerance = () => [14, 14, 22, 30, 38][Math.min(S.misses, 4)];
  const MISS_LINES = ['Not quite. Line the claw up over the envelope.', 'The claw had other plans. Try again!', 'So close… to something else.'];
  let missLine = 0;

  async function drop() {
    if (S.state !== 'idle') return;
    S.state = 'busy'; setReady(false); setPressed();
    S.dropped = true; hideCaption();
    Snd.play('click'); flashBtn(el.bD);
    Snd.motor(false);
    // brake the carriage, then let the swing settle so the claw hangs straight
    S.vel = 0;
    await wait(120);
    S.lockSway = true;
    const s0 = S.sway;
    await tween(Math.abs(s0) > .3 ? 300 : 80, t => { S.sway = s0 * (1 - t); S.swayV = 0; }, E.out);

    const x = S.x, d = x - PRIZE.cx, tol = tolerance();
    const hit = Math.abs(d) <= tol;
    const touch = !hit && Math.abs(d) <= PRIZE.w / 2 + 16;
    // the other prizes can be picked up too, when the claw lands squarely on one
    const near = !hit && !touch && x >= 692 ? itemAt(x) : null;
    const grab = near && Math.abs(x - near.cx) <= near.hw * .7 + 6 ? near : null;
    const gripY = grab ? grab.top + (grab.by - grab.top) * .45 : 0;
    let yT;
    if (hit) yT = PRIZE.cy - TIP_GRIP;
    else if (touch) yT = PRIZE.top + 4 - TIP_OPEN;
    else if (grab) yT = gripY - TIP_GRIP;
    else yT = surfaceAt(x) + 6 - TIP_OPEN;
    yT = Math.max(REST_Y + 10, yT);

    // 1-2: cable pays out, the open claw descends
    Snd.whirr(true);
    const y0 = S.y, a0 = S.a;
    await tween(Math.max(520, (yT - y0) / 235 * 1000), (t, raw) => {
      S.y = y0 + (yT - y0) * t;
      S.a = a0 + (OPEN_A - a0) * E.out(Math.min(1, raw * 2.5));
    }, E.motor);
    Snd.whirr(false);
    await wait(200);

    // 3: the claw closes
    Snd.play('clack');
    const aEnd = hit || grab ? GRIP_A : touch ? 19 : 5;
    const it = !hit && !touch ? itemAt(x) : null;
    const closing = tween(430, t => { S.a = OPEN_A + (aEnd - OPEN_A) * t; }, E.out);
    if (hit) {
      await closing;
      S.heldDx = PRIZE.cx - x; S.heldR = PRIZE.r; S.held = true;
      el.env.querySelector('.glint').style.display = 'none';
      Snd.play('rustle');
    } else if (grab) {
      await closing;
      S.heldItem = { it: grab, dx: grab.cx - x, oy: grab.by - gripY, r: 0, x: grab.cx, y: grab.by, rot: 0 };
      Snd.play('rustle');
    } else if (touch) {
      await Promise.all([closing, nudgeEnvelope(Math.sign(d) || 1)]);
    } else {
      await Promise.all([closing, it ? squish(it) : null]);
    }
    await wait(280);

    // 4-5: the cable retracts (with the envelope, if it was caught)
    Snd.whirr(true);
    const y1 = S.y, r0 = S.heldR, rT = clamp(-S.heldDx * .1, -3, 3);
    const iT = grab ? clamp(-S.heldItem.dx * .25, -7, 7) : 0;   // an off-centre grip hangs a little crooked
    await tween(Math.max(520, (y1 - REST_Y) / 200 * 1000), t => {
      S.y = y1 + (REST_Y - y1) * t;
      if (hit) S.heldR = r0 + (rT - r0) * Math.min(1, t * 2);
      if (grab) S.heldItem.r = iT * Math.min(1, t * 2);
    }, E.motor);
    Snd.whirr(false);
    S.lockSway = false;

    if (grab) { await carryAndSlip(grab); return; }

    if (!hit) {
      S.misses++;
      await tween(320, t => { S.a = aEnd + (REST_A - aEnd) * t; });
      Snd.play('boop');
      let msg;
      if (touch) msg = 'Almost. That envelope has somewhere to be.';
      else if (x < 692) msg = 'That’s the prize chute. The envelope is waiting to the right.';
      else { msg = MISS_LINES[missLine % MISS_LINES.length]; missLine++; }
      if (S.misses === 3) msg += ' <i>Tip: the claw’s shadow shows where it will land.</i>';
      caption(msg, S.misses === 3 ? 4600 : 3000);
      S.state = 'idle'; setReady(true); setPressed();
      return;
    }

    // 6: the carriage carries the envelope to the chute
    await wait(260);
    const xs = S.x;
    Snd.motor(true);
    await tween(Math.max(700, Math.abs(xs - HOME_X) / 190 * 1000), t => { S.x = xs + (HOME_X - xs) * t; }, E.motor);
    Snd.motor(false);
    await wait(650);
    S.lockSway = true;
    const s1 = S.sway;
    await tween(260, t => { S.sway = s1 * (1 - t); S.swayV = 0; }, E.out);

    // 7: the claw opens and lets go
    Snd.play('clack');
    const openT = tween(300, t => { S.a = GRIP_A + (OPEN_A - GRIP_A) * t; }, E.out);
    await wait(110);
    S.held = false;
    const ex = S.env.x, ey = S.env.y, er = S.env.r;
    await Promise.all([openT, tween(430, t => { S.env.y = ey + (712 - ey) * t; S.env.r = er + 12 * t; S.env.x = ex + (HOME_X - ex) * .5 * t; }, E.in)]);
    S.env.show = false; el.env.style.display = 'none';
    Snd.play('thud');
    S.lockSway = false;
    tween(420, t => { S.a = OPEN_A + (REST_A - OPEN_A) * t; });

    // 8: it slides out into the prize slot
    await wait(220);
    await slotArrive();
    S.state = 'won';
    document.body.classList.add('won', 'win');
    el.slotHit.style.pointerEvents = 'auto';
    Snd.play('chime');
    caption('A little something, just for you.', 2600);
    setTimeout(() => document.body.classList.remove('win'), 2400);
    await wait(2900);
    if (S.state === 'won') caption('Click the envelope in the prize slot.');
  }

  async function slotArrive() {
    el.envSlot.setAttribute('opacity', '1');
    el.slotFlap.classList.add('bump');
    await tween(340, t => setSlotEnv(SLOT.cx + 4 * (1 - t), 752 + (SLOT.cy - 752) * t, SLOT.r + 10 * (1 - t)), E.in);
    Snd.play('thump');
    el.slotFlap.classList.remove('bump');
    await tween(220, t => setSlotEnv(SLOT.cx, SLOT.cy - Math.sin(t * Math.PI) * 5, SLOT.r), E.lin);
  }

  // Any other prize: it is carried part of the way to the chute, then slips out of
  // the claw and drops back onto the pile. Only the envelope ever makes it out.
  const SLIP_LINES = [
    'Whoops! It slipped. Classic claw machine.',
    'So close… and it’s back in the pile. Only the envelope holds on.',
    'That one wanted to stay. Try the envelope!'
  ];
  let slipLine = 0;
  async function carryAndSlip(it) {
    await wait(260);
    // set off toward the chute...
    const xs = S.x, slipX = xs + (HOME_X - xs) * .45;
    Snd.motor(true);
    await tween(Math.max(420, Math.abs(xs - slipX) / 150 * 1000), t => { S.x = xs + (slipX - xs) * t; }, E.in);
    // ...the claw shudders and loosens, and the prize slips out
    Snd.motor(false);
    Snd.play('clack');
    S.swayV += (HOME_X < xs ? -1 : 1) * 30;
    await tween(260, t => { S.a = GRIP_A - 9 * Math.sin(t * Math.PI * 1.5); });
    const h = S.heldItem; S.heldItem = null;
    const g = itemEl[it.id], fx0 = h.x, fy0 = h.y, r0 = h.rot, oy = h.oy;
    const pose = (x, y, r) => g.setAttribute('transform', `translate(${f(x - it.cx)} ${f(y - it.by)}) rotate(${f(r)} 0 ${f(-oy)})`);
    tween(380, t => { S.a = GRIP_A - 9 + (OPEN_A - GRIP_A + 9) * t; }, E.out);
    // it falls back onto its spot in the pile, turning a little as it drops
    const spin = (Math.random() < .5 ? -1 : 1) * 14;
    await tween(Math.max(380, (it.by - fy0) / 280 * 1000), t => {
      pose(fx0 + (it.cx - fx0) * t, fy0 + (it.by - fy0) * t, r0 + (spin - r0) * t - spin * t * t);
    }, E.in);
    g.removeAttribute('transform');
    Snd.play('thud');
    squish(it);
    S.misses++;
    caption(SLIP_LINES[slipLine % SLIP_LINES.length], 3200); slipLine++;
    // the empty claw closes back to rest; Anne can try again
    await tween(320, t => { S.a = OPEN_A + (REST_A - OPEN_A) * t; });
    S.state = 'idle'; setReady(true); setPressed();
  }

  // a near miss: one prong catches the edge, the envelope rocks and settles back where it was
  async function nudgeEnvelope(side) {
    Snd.play('rustle');
    await tween(900, (t, raw) => {
      const damp = Math.exp(-raw * 4);
      S.env.r = PRIZE.r + side * -7 * Math.sin(raw * Math.PI * 3) * damp;
      S.env.y = PRIZE.cy - 5 * Math.sin(Math.min(1, raw * 2) * Math.PI) * damp;
      S.env.x = PRIZE.cx;
    }, E.lin);
    S.env.r = PRIZE.r; S.env.y = PRIZE.cy;
  }
  async function squish(it) {
    const g = itemEl[it.id];
    Snd.play('rustle');
    await tween(700, (t, raw) => {
      const k = Math.sin(raw * Math.PI * 2.5) * Math.exp(-raw * 3);
      g.setAttribute('transform', `translate(0 ${f(-Math.max(0, k) * 5)}) scale(${f(1 + k * .05)} ${f(1 - k * .06)})`);
    }, E.lin);
    g.removeAttribute('transform');
  }

  /* =================================================================
     COLLECT, OPEN, READ
     ================================================================= */
  function worldToScreen(x, y) {
    const m = LAY[3].getScreenCTM();
    return { x: m.a * x + m.c * y + m.e, y: m.b * x + m.d * y + m.f, s: m.a };
  }

  async function collect() {
    if (S.state !== 'won') return;
    S.state = 'collect';
    hideCaption();
    document.body.classList.remove('won');
    el.slotHit.style.pointerEvents = 'none';
    el.slotFlap.classList.add('lift');
    Snd.play('rustle');
    await wait(300);
    // the envelope lifts out of the slot and comes up close; the machine fades behind it
    const p = worldToScreen(SLOT.cx, SLOT.cy);
    el.envSlot.setAttribute('opacity', '0');
    document.body.classList.add('cu-on');
    el.cu.classList.add('on');
    const w = el.cuWrap;
    w.style.transition = 'none'; w.style.transform = 'none';
    const r = w.getBoundingClientRect();
    const sc = (PRIZE.w * p.s) / r.width;
    w.style.transform = `translate(${f(p.x - (r.left + r.width / 2))}px, ${f(p.y - (r.top + r.height / 2))}px) rotate(${SLOT.r}deg) scale(${sc.toFixed(4)})`;
    w.getBoundingClientRect();
    w.style.transition = 'transform 1.3s cubic-bezier(.3, .1, .2, 1)';
    w.style.transform = '';
    Snd.play('page');
    await wait(1350);
    S.state = 'sealed';
    el.cu.classList.add('sealed');
    el.cuSeal.focus({ preventScroll: true });
    caption('Click the seal to open it.');
  }

  async function openEnvelope() {
    if (S.state !== 'sealed') return;
    S.state = 'opening';
    el.cu.classList.remove('sealed');
    hideCaption();
    el.cuSeal.classList.add('broken');
    Snd.play('crack');
    await wait(420);
    el.cuEnv.classList.add('open');          // the flap swings open
    Snd.play('page');
    await wait(1100);
    el.cuEnv.classList.add('pull');          // the letter slides out
    Snd.play('slide');
    await wait(1300);

    // hand over to the folded letter: it leaves the envelope and comes to the centre
    const pr = el.cuPaper.getBoundingClientRect();
    const fo = el.fold;
    fo.style.transition = 'none'; fo.style.transform = 'none';
    const fr = fo.getBoundingClientRect();
    const sx = pr.width / fr.width, sy = pr.height / (fr.height / 3);
    fo.style.transform = `translate(${f(pr.left + pr.width / 2 - (fr.left + fr.width / 2))}px, ${f(pr.top + pr.height / 2 - (fr.top + fr.height / 2))}px) scale(${sx.toFixed(4)}, ${sy.toFixed(4)})`;
    fo.classList.add('on');
    el.cuPaper.style.visibility = 'hidden';
    fo.getBoundingClientRect();
    fo.style.transition = 'transform 1.1s cubic-bezier(.3, .1, .25, 1)';
    fo.style.transform = '';
    el.cuWrap.classList.add('away');
    await wait(1150);
    fo.classList.add('u1'); Snd.play('page');   // top third unfolds
    await wait(760);
    fo.classList.add('u2'); Snd.play('page');   // bottom third unfolds
    await wait(1050);
    el.letter.classList.add('on');
    await wait(500);
    fo.classList.remove('on');
    el.cuWrap.style.visibility = 'hidden';
    S.state = 'letter';
    el.ltCtrl.classList.add('on');
    reveal();
  }

  /* ---------- the letter ---------- */
  const mk = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  const chars = s => Array.from(s || '');
  const LT = { greet: null, blocks: [], sign: null, ps: null };

  function buildLetter() {
    const b = el.ltBody; b.textContent = '';
    LT.greet = mk('p', 'lt-greet', L.greeting || `Dear ${NAME},`);
    b.appendChild(LT.greet);
    LT.blocks = [];
    const typed = (cls, text) => { const p = mk('p', cls); p.append(mk('span', 't'), mk('span', 'r', text)); p._t = chars(text); b.appendChild(p); LT.blocks.push(p); };
    if (L.title) typed('lt-title', L.title);
    (L.paragraphs || []).forEach(t => typed('lt-p', t));
    const sig = L.signature || {};
    LT.sign = mk('div', 'lt-sign');
    const c1 = CATS.one.fur, c2 = CATS.two.fur;
    LT.sign.innerHTML = `<svg class="lt-paws" viewBox="0 0 72 52" aria-hidden="true">
        <g transform="translate(18 32) rotate(-16) scale(.78)"><path class="pw pw1" d="${PAW}" fill="${c1}"/></g>
        <g transform="translate(50 18) rotate(10) scale(.78)"><path class="pw pw2" d="${PAW}" fill="${c2}"/></g></svg>`;
    const st = mk('div', 'lt-sign-text');
    if (sig.closing) st.append(document.createTextNode(sig.closing), document.createElement('br'));
    if (sig.name) st.appendChild(mk('strong', null, sig.name));
    LT.sign.appendChild(st);
    b.appendChild(LT.sign);
    LT.ps = null;
    if (L.postscript && (L.postscript.text || L.postscript.from)) {
      LT.ps = mk('div', 'lt-ps');
      if (L.postscript.text) LT.ps.appendChild(mk('span', null, L.postscript.text));
      if (L.postscript.from) LT.ps.appendChild(mk('span', 'from', L.postscript.from));
      b.appendChild(LT.ps);
    }
  }

  let tok = 0;
  function keepInView(node) {
    const box = el.letter, nb = node.getBoundingClientRect(), bb = box.getBoundingClientRect();
    const over = nb.bottom - (bb.bottom - 30);
    if (over > 0) box.scrollTop += over;
  }
  function resetLetter() {
    LT.greet.classList.remove('on');
    LT.blocks.forEach(p => { p.firstChild.textContent = ''; p.lastChild.textContent = p._t.join(''); });
    LT.sign.classList.remove('on', 'paws');
    if (LT.ps) LT.ps.classList.remove('on');
    el.letter.scrollTop = 0;
    el.btnFull.hidden = false; el.btnAgain.hidden = true; el.btnBack.hidden = true;
  }
  // shrink the letter's text just enough that the whole letter fits on the page without scrolling
  function fitLetter() {
    const box = el.letter;
    box.style.fontSize = '';
    let fs = parseFloat(getComputedStyle(box).fontSize);
    for (let i = 0; i < 40 && box.scrollHeight > box.clientHeight + 1 && fs > 11; i++) {
      fs -= .5; box.style.fontSize = fs + 'px';
    }
  }
  window.addEventListener('resize', () => { if (S.state === 'letter') fitLetter(); });

  async function reveal() {
    const my = ++tok;
    resetLetter();
    fitLetter();
    const alive = () => my === tok;
    await wait(450); if (!alive()) return;
    LT.greet.classList.add('on');
    for (let i = 0; i < 8; i++) setTimeout(() => { if (alive()) Snd.play('scratch'); }, i * 160);
    await wait(1700); if (!alive()) return;
    for (const p of LT.blocks) {
      const t = p._t;
      for (let i = 1; i <= t.length; i++) {
        if (!alive()) return;
        p.firstChild.textContent = t.slice(0, i).join('');
        p.lastChild.textContent = t.slice(i).join('');
        const ch = t[i - 1];
        let d = ch === ' ' ? 18 : 26 + Math.random() * 20;
        if (',;:'.includes(ch)) d += 120;
        if ('.!?'.includes(ch)) d += 240;
        Snd.play(ch === ' ' ? 'space' : 'key');      // a typewriter sound for every letter
        if (i % 12 === 0) keepInView(p);
        await wait(d);
      }
      keepInView(p);
      if (alive()) Snd.play('ding');                  // end of the paragraph: bell and carriage return
      await wait(p.classList.contains('lt-title') ? 550 : 850);
    }
    if (!alive()) return;
    LT.sign.classList.add('on'); keepInView(LT.sign);
    await wait(1100); if (!alive()) return;
    LT.sign.classList.add('paws'); Snd.play('pat'); setTimeout(() => { if (alive()) Snd.play('pat'); }, 450);
    await wait(1100); if (!alive()) return;
    if (LT.ps) { LT.ps.classList.add('on'); keepInView(LT.ps); await wait(700); }
    if (alive()) finished();
  }
  function showFull() {
    tok++;
    LT.greet.classList.add('on');
    LT.blocks.forEach(p => { p.firstChild.textContent = p._t.join(''); p.lastChild.textContent = ''; });
    LT.sign.classList.add('on', 'paws');
    if (LT.ps) LT.ps.classList.add('on');
    finished();
  }
  function finished() {
    el.btnFull.hidden = true;
    el.btnAgain.hidden = false;
    el.btnBack.hidden = !IN_FRAME;
  }
  el.btnFull.addEventListener('click', showFull);
  el.btnAgain.addEventListener('click', () => { Snd.play('page'); reveal(); });
  el.btnBack.addEventListener('click', requestClose);

  function requestClose() {
    if (IN_FRAME) try { window.parent.postMessage({ type: 'CLOSE_GIFT' }, '*'); } catch (e) {}
  }

  /* ---------- messages from the party room ---------- */
  window.addEventListener('message', e => {
    const d = e.data;
    if (d && d.type === 'SET_MUTE') Snd.setMuted(!!d.muted);
  });

  /* =================================================================
     START
     ================================================================= */
  buildLetter();
  setEnv(PRIZE.cx, PRIZE.cy, PRIZE.r);
  render();
  requestAnimationFrame(t => { tPrev = t; requestAnimationFrame(loop); });
  if (IN_FRAME) try { window.parent.postMessage({ type: 'WANT_FOCUS' }, '*'); } catch (e) {}

  function playAgain() {
    // put the envelope back among the prizes for another go
    hideCaption();
    document.body.classList.remove('won');
    el.slotHit.style.pointerEvents = 'none';
    el.envSlot.setAttribute('opacity', '0');
    S.env = { x: PRIZE.cx, y: PRIZE.cy, r: PRIZE.r, show: true };
    el.env.style.display = '';
    el.env.querySelector('.glint').style.display = '';
    S.misses = 0;
    S.state = 'idle'; setReady(true);
    caption(HINT_MOVE, 5000);
  }

  (async () => {
    await wait(700);
    document.body.classList.remove('intro');
    await wait(900);
    // every opening (also again from the party-room shelf) starts a fresh game:
    // the envelope is back in the machine and has to be caught again
    S.state = 'idle'; setReady(true);
    caption(HINT_MOVE);
  })();
})();
