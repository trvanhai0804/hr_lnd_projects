/* A Few Chapters Along the Way — the memory book.
   Everything you may want to change (photos, captions, years, texts, and
   RETURN_PAGE) lives in js/memories-data.js. This file builds the book. */
(() => {
  const $ = s => document.querySelector(s);
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const NAME = (window.CONFIG && CONFIG.name) || 'Anne';
  const CAT_CFG = window.CONFIG && CONFIG.cats ? [CONFIG.cats.one, CONFIG.cats.two] : [];
  const book = $('#book'), leavesEl = $('#leaves'), baseEl = $('#base');

  /* ================= sound (synthesised, no files needed) ================= */
  const Snd = (() => {
    let ctx = null, nb = null;
    function init() {
      if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      ctx = new AC();
      nb = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const d = nb.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    function noise({ t = 0, d = .25, f = 2000, to, q = 1, vol = .2, type = 'bandpass', a = .02 }) {
      if (!ctx) return;
      const s = ctx.currentTime + t, src = ctx.createBufferSource(); src.buffer = nb;
      const fl = ctx.createBiquadFilter(); fl.type = type; fl.frequency.setValueAtTime(f, s); fl.Q.value = q;
      if (to) fl.frequency.exponentialRampToValueAtTime(to, s + d);
      const g = ctx.createGain(); g.gain.setValueAtTime(.0001, s); g.gain.exponentialRampToValueAtTime(vol, s + a); g.gain.exponentialRampToValueAtTime(.0001, s + d);
      src.connect(fl); fl.connect(g); g.connect(ctx.destination); src.start(s, Math.random() * .5); src.stop(s + d + .05);
    }
    function tone(f, t = 0, d = .6, vol = .06) {
      if (!ctx) return;
      const s = ctx.currentTime + t, o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.value = f; g.gain.setValueAtTime(.0001, s); g.gain.exponentialRampToValueAtTime(vol, s + .01); g.gain.exponentialRampToValueAtTime(.0001, s + d);
      o.connect(g); g.connect(ctx.destination); o.start(s); o.stop(s + d + .05);
    }
    return {
      unlock: init,
      turn() { noise({ d: .42, f: 4200, to: 1400, q: .7, vol: .16, type: 'highpass', a: .08 }); noise({ t: .32, d: .18, f: 380, q: 1, vol: .12, type: 'lowpass' }); },
      pick() { noise({ d: .14, f: 3200, q: .8, vol: .1, type: 'highpass' }); },
      pop() { tone(880, 0, .12, .05); tone(1320, .05, .1, .03); },
      chime() { [72, 76, 79, 84].forEach((m, i) => tone(440 * Math.pow(2, (m - 69) / 12), i * .09, 1.1, .035)); },
      scratch(sec) { for (let t = 0; t < sec; t += .09) noise({ t, d: .07, f: 5200 + Math.random() * 1500, q: 2.5, vol: .03 + Math.random() * .02, type: 'bandpass', a: .01 }); },
      mew() {
        if (!ctx) return;
        const s = ctx.currentTime, o = ctx.createOscillator(), fl = ctx.createBiquadFilter(), g = ctx.createGain();
        o.type = 'sawtooth'; o.frequency.setValueAtTime(760, s); o.frequency.linearRampToValueAtTime(1150, s + .12); o.frequency.linearRampToValueAtTime(700, s + .32);
        fl.type = 'bandpass'; fl.frequency.value = 1500; fl.Q.value = 4;
        g.gain.setValueAtTime(.0001, s); g.gain.exponentialRampToValueAtTime(.12, s + .04); g.gain.exponentialRampToValueAtTime(.0001, s + .34);
        o.connect(fl); fl.connect(g); g.connect(ctx.destination); o.start(s); o.stop(s + .4);
      }
    };
  })();
  document.addEventListener('pointerdown', () => Snd.unlock());

  /* ================= little drawings ================= */
  const PAW = 'M0 2C-9 2-13 11-10 15C-7 18-3 16 0 16C3 16 7 18 10 15C13 11 9 2 0 2ZM-11-4A4 5.5 0 1 0-11 7A4 5.5 0 1 0-11-4ZM11-4A4 5.5 0 1 1 11 7A4 5.5 0 1 1 11-4ZM-5-14A4.2 5.8 0 1 0-5-2A4.2 5.8 0 1 0-5-14ZM5-14A4.2 5.8 0 1 1 5-2A4.2 5.8 0 1 1 5-14Z';
  const pawSVG = (fill = 'currentColor') => `<svg viewBox="-16 -16 32 34"><path d="${PAW}" fill="${fill}"/></svg>`;
  const flowerSVG = (petal = '#d98fa0', centre = '#e8b64a') => `<svg viewBox="-40 -40 80 120"><path d="M0 10C-2 40 4 60 -3 78" stroke="#6f8a5a" stroke-width="2.4" fill="none"/><path d="M-1 44C-18 36 -24 44 -30 40C-20 54 -8 52 -1 48Z" fill="#7f9a66"/><path d="M1 60C16 52 22 60 28 56C18 70 8 68 1 64Z" fill="#8aa672"/>${[0, 72, 144, 216, 288].map(a => `<ellipse rx="9" ry="16" cy="-14" transform="rotate(${a})" fill="${petal}" opacity=".88"/>`).join('')}<circle r="7" fill="${centre}"/></svg>`;
  const clipSVG = `<svg viewBox="0 0 30 70"><path d="M20 62V14A8 8 0 0 0 4 14V56A5 5 0 0 0 14 56V20" fill="none" stroke="#9aa3ad" stroke-width="3.2" stroke-linecap="round"/><path d="M20 62V14A8 8 0 0 0 4 14" fill="none" stroke="#e4e9ee" stroke-width="1.1" stroke-linecap="round"/></svg>`;
  const coffeeSVG = `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="none" stroke="#a9794a" stroke-width="5" opacity=".55"/><circle cx="50" cy="50" r="36" fill="none" stroke="#a9794a" stroke-width="1.5" opacity=".35"/><path d="M14 58A38 38 0 0 1 30 20" stroke="#8a5a30" stroke-width="3" fill="none" opacity=".35"/><circle cx="84" cy="30" r="3" fill="#a9794a" opacity=".4"/></svg>`;
  const DOODLES = {
    laptop: `<svg viewBox="0 0 120 80" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M22 8H98V56H22Z"/><path d="M8 66H112L104 74H16Z"/><path d="M40 28L50 36L40 44M58 44H74"/></svg>`,
    mug: `<svg viewBox="0 0 90 90" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M18 34H62V70Q62 80 52 80H28Q18 80 18 70Z"/><path d="M62 42Q78 42 76 54Q74 64 62 62"/><path d="M30 26Q26 18 32 12M42 26Q38 16 44 8M54 26Q50 18 56 12"/></svg>`,
    plane: `<svg viewBox="0 0 120 70" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"><path d="M8 34L110 8L60 62L48 42Z"/><path d="M48 42L110 8"/><path d="M4 58Q20 46 34 54" stroke-dasharray="4 5"/></svg>`,
    sun: `<svg viewBox="0 0 90 90" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="45" cy="45" r="15"/>${[0, 45, 90, 135, 180, 225, 270, 315].map(a => `<path d="M45 20V10" transform="rotate(${a} 45 45)"/>`).join('')}</svg>`,
    clock: `<svg viewBox="0 0 90 90" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="45" cy="48" r="30"/><path d="M45 48V30M45 48L58 56"/><path d="M22 18L32 24M68 18L58 24"/></svg>`,
    heart: `<svg viewBox="0 0 80 70" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M40 62C10 42 6 22 20 12C30 6 38 12 40 20C42 12 50 6 60 12C74 22 70 42 40 62Z"/></svg>`
  };
  const smileSVG = `<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><circle cx="40" cy="40" r="30"/><g class="eyes-happy"><path d="M28 34q3 -4 6 0M46 34q3 -4 6 0"/></g><g class="eyes-wow" style="display:none"><circle cx="31" cy="33" r="3.5"/><circle cx="49" cy="33" r="3.5"/></g><path class="mouth-happy" d="M28 48Q40 58 52 48"/><circle class="mouth-wow" cx="40" cy="52" r="5" style="display:none"/></svg>`;
  const penSVG = `<svg viewBox="0 0 400 44"><defs><linearGradient id="penBody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a5a8a"/><stop offset=".45" stop-color="#2d3a6a"/><stop offset="1" stop-color="#1c2548"/></linearGradient><linearGradient id="penGold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6dc93"/><stop offset=".5" stop-color="#c9973f"/><stop offset="1" stop-color="#8a5f1f"/></linearGradient></defs><path d="M0 22L40 14H44V30H40Z" fill="url(#penGold)"/><path d="M4 22L30 19V25Z" fill="#3a2a10"/><rect x="44" y="12" width="240" height="20" rx="4" fill="url(#penBody)"/><rect x="284" y="10" width="14" height="24" fill="url(#penGold)"/><rect x="298" y="10" width="96" height="24" rx="10" fill="url(#penBody)"/><rect x="310" y="6" width="70" height="5" rx="2" fill="url(#penGold)"/><path d="M50 16H280" stroke="#fff" stroke-width="2" opacity=".25"/></svg>`;
  const landscapeSVG = `<svg viewBox="0 0 100 70" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"><rect x="4" y="4" width="92" height="62" rx="4"/><circle cx="70" cy="22" r="7"/><path d="M4 56L32 30L52 48L64 38L96 62"/></svg>`;

  function fallbackHTML(src, i) {
    const name = src.split('/').slice(-2).join(' / ');
    const hues = ['linear-gradient(160deg,#f3d9c9,#e3cfe6)', 'linear-gradient(160deg,#d9e6d0,#f3e3c4)', 'linear-gradient(160deg,#d6e2ee,#f0d8dc)', 'linear-gradient(160deg,#f2e6c6,#d9d0ea)'];
    return `<div class="ph-fallback" style="--ph-bg:${hues[i % hues.length]}">${landscapeSVG}<span>${esc(name)}</span></div>`;
  }
  function catFallbackHTML(i) {
    const c = CAT_CFG[i];
    if (!c || typeof A === 'undefined') return fallbackHTML(CATS[i].src, i + 2);
    return `<div class="ph-fallback" style="--ph-bg:linear-gradient(160deg,${i ? '#f6e3cc,#f2d6c0' : '#e3e6ec,#d6dbe6'})"><svg viewBox="-125 -245 250 262" style="width:88%">${A.cat(c, { id: 'mcat' + i })}</svg></div>`;
  }

  /* ================= photo layout ================= */
  // [left %, top %, width %, rotation deg] inside one page
  const SLOTS = {
    L: { 1: [[22, 29, 56, -2]], 2: [[5, 27, 50, -5], [44, 49, 50, 4]], 3: [[5, 24, 38, -5], [51, 27, 38, 5], [7, 59, 38, -3]],
         4: [[4, 24, 40, -4], [53, 25, 40, 4], [6, 61, 40, 3], [53, 62, 40, -3]] },
    R: { 1: [[20, 11, 60, 2]], 2: [[6, 5, 50, 3], [42, 37, 52, -4]], 3: [[4, 4, 46, 4], [50, 9, 46, -5], [40, 50, 50, 2]],
         4: [[4, 4, 40, 4], [53, 6, 40, -4], [6, 52, 40, 3], [53, 54, 40, -3]] }
  };
  // three wide (landscape) photos on one page step down it, alternating sides
  const WIDE3 = [[4, 2, 54, -2], [42, 34.8, 54, 2], [6, 67, 54, -1.5]];
  // ...and below the year heading on a left page they zig-zag
  const WIDE3L = [[3, 23, 48, -3], [49, 45, 48, 3], [5, 71, 48, -2]];
  const MAX_PER_PAGE = 4;
  const TAPES = ['top', 'corner-l', 'clip', 'corner-r', 'top pink', 'corner-l'];

  function polaroidHTML(p, slot, key, opts = {}) {
    const [l, t, w, r] = slot;
    const tape = opts.tape || 'top';
    const deco = tape === 'clip' ? `<div class="clip">${clipSVG}</div>` : `<div class="tape ${tape}"></div>`;
    const fb = opts.fallback || fallbackHTML(p.src, key.length);
    const dnc = opts.dnc ? `<div class="dnc-note"><b>DO NOT<br>CLICK</b><small>(seriously)</small></div>` : '';
    // ratio (width / height): the frame takes the photo's own shape, so nothing is cropped
    const fitted = p.ratio ? ` fitted" data-ratio="${p.ratio}` : '';
    const phStyle = p.ratio ? ` style="aspect-ratio:${p.ratio}"` : '';
    return `<figure class="polaroid ${p.wide && !p.ratio ? 'wide ' : ''}${opts.cls || ''}${fitted}" data-key="${key}" style="left:${l}%;top:${t}%;width:${w}%;--r:${r}deg;z-index:${opts.z || 2}">
      ${deco}${dnc}<div class="ph"${phStyle}><img data-src="${esc(p.src)}" alt="" decoding="async" draggable="false">${fb}</div>
      <figcaption${p.smallCaption ? ' class="small"' : ''}>${esc(p.caption)}</figcaption></figure>`;
  }

  function splitPhotos(photos, leftCount) {
    const groups = [];
    photos.slice(0, 16).forEach(p => {
      if (p.hidden && groups.length) groups[groups.length - 1].hidden = p;
      else if (groups.length < MAX_PER_PAGE * 2) groups.push({ main: p });
    });
    const nL = Math.min(MAX_PER_PAGE, leftCount != null ? leftCount : Math.min(3, Math.floor(groups.length / 2)), groups.length);
    return { left: groups.slice(0, nL), right: groups.slice(nL, nL + MAX_PER_PAGE) };
  }

  function photosHTML(groups, side, y, custom) {
    if (!groups.length) return '';
    const slots = SLOTS[side][groups.length];
    const wides = groups.filter(g => g.main.wide).length;
    return groups.map((g, k) => {
      let slot = slots[k];
      const key = `${y}-${side}${k}`;
      // a year can place its photos by hand (see "slots" in memories-data.js)
      if (custom && custom[k]) slot = custom[k];
      // wide (landscape) photos get broad frames: one sits along the bottom of the
      // page; two stack top and bottom; three step down the page
      else if (g.main.wide) {
        const w = 74, h = w * .6, wi = groups.slice(0, k).filter(x => x.main.wide).length;
        const top = wides > 1 && wi === 0;
        if (wides >= 3) slot = (side === 'L' ? WIDE3L : WIDE3)[Math.min(wi, 2)]; else
        slot = [top ? 9 : (wides > 1 ? 17 : (side === 'R' ? 13 : 12)), top ? 4 : 96 - h - 1, w, top ? -2 : (wides > 1 ? 2 : (slot[3] > 0 ? 1.5 : -1.5))];
      }
      const tape = TAPES[(k + (side === 'R' ? 3 : 0) + y.length) % TAPES.length];
      let o = '';
      if (g.hidden) {
        const hs = [slot[0] + 8, slot[1] + 6, slot[2] * .94, slot[3] + 7];
        o += polaroidHTML(g.hidden, hs, key + 'h', { cls: 'hidden-photo', z: 1, tape: 'corner-r' });
      }
      o += polaroidHTML(g.main, slot, key, { cls: (g.hidden ? 'cover-photo ' : '') + (g.main.doNotClick ? 'dnc' : ''), dnc: g.main.doNotClick, tape, z: g.hidden ? 3 : 2 });
      return o;
    }).join('');
  }

  /* ================= pages ================= */
  const warmOf = i => (MEMORIES.length > 1 ? i / (MEMORIES.length - 1) : 0) * .09;

  function coverFace() {
    return `<div class="spine">${[12, 20, 80, 88].map(t => `<i style="top:${t}%"></i>`).join('')}</div>
      <div class="cover-frame"><i></i><i></i><i></i><i></i></div>
      <div class="cover-paw">${pawSVG('#1e1c22')}</div>
      <div class="cover-title">${esc(BOOK_TEXT.coverTitle)}</div>
      <div class="cover-rule"></div>
      <div class="cover-sub">${esc(BOOK_TEXT.coverSubtitle)}</div>
      <div class="cover-flower">${flowerSVG('#caa0a8', '#d9b36b')}</div>
      <div class="cover-for">for ${esc(NAME)}</div>`;
  }
  function introLeft() {
    // her portrait stands just above the label; the label overlaps it
    const photo = BOOK_TEXT.ownerPhoto ? `<img class="owner-photo" src="${esc(BOOK_TEXT.ownerPhoto)}" alt="" draggable="false" onerror="this.remove()">` : '';
    return `<div class="endpaper"></div>
      ${photo}
      <div class="belongs"><small>this book belongs to</small><span>${esc(NAME)}</span></div>
      <div class="flower" style="left:60%;top:72%;width:18%;--r:24deg">${flowerSVG()}</div>
      <div class="pawmark on" style="left:26%;top:80%;opacity:.25">${pawSVG()}</div>`;
  }
  function introRight() {
    return `<div class="intro">${BOOK_TEXT.intro.map(l => `<p>${esc(l)}</p>`).join('')}<p class="last">${esc(BOOK_TEXT.introEnd)}</p></div>
      <div class="turn-hint">Turn the page &rarr;</div>`;
  }
  const stickyHTML = (m, i, l, t, small) => `<div class="sticky${small ? ' ' + (small === true ? 'small' : small) : ''}" style="left:${l}%;top:${t}%;--r:${i % 2 ? -4 : 5}deg"><span class="st-front">${esc(m.note)}</span><span class="st-back">${esc(m.noteBack || m.note)}</span></div>`;
  function yearLeft(m, i) {
    const { left } = splitPhotos(m.photos, m.leftPhotos);
    const doodle = ['laptop', 'mug', 'plane', 'sun'][i % 4];
    // a 2x2 grid, or three wide photos, leave only the top-right corner free
    const full = left.length >= 4 || (left.length === 3 && left.every(g => g.main.wide)) || !!(m.slots && m.slots.left);
    const noteLeft = m.note && m.notePage === 'left';
    return `<div class="warm" style="--warm:${warmOf(i)}"></div>
      ${full && noteLeft ? '' : `<div class="coffee" style="left:74%;top:13%;width:20%" data-paw="1">${coffeeSVG}</div>`}
      <div class="yhead">${esc(m.year)}</div>
      <div class="ytitle">${esc(m.title)}</div>
      ${photosHTML(left, 'L', m.year, m.slots && m.slots.left)}
      ${noteLeft ? (m.slots && m.slots.note ? stickyHTML(m, i, ...m.slots.note) : full ? stickyHTML(m, i, 70, 2, true) : stickyHTML(m, i, left.length === 3 ? 56 : 62, left.length === 3 ? 65 : 73)) : ''}
      ${full ? '' : `<div class="doodle" style="${left.length === 3 ? 'left:50%;top:90%;width:11%' : 'left:5%;top:86%;width:13%'}">${DOODLES[doodle]}</div>`}
      ${i % 2 && left.length < 3 ? `<div class="flower" style="left:22%;top:77%;width:12%;--r:-28deg">${flowerSVG(i === 3 ? '#e6b35a' : '#d98fa0')}</div>` : ''}
      ${i === 2 && left.length < 3 ? `<div class="ticket" style="left:22%;top:88%;--r:-8deg">ADMIT ONE<b>Friday lunch</b></div>` : ''}`;
  }
  // an empty frame waiting for a future photo, with a handwritten label inside
  function blankFrameHTML(b, k) {
    const [l, t, w, r] = b.slot;
    return `<figure class="polaroid fitted blank" style="left:${l}%;top:${t}%;width:${w}%;--r:${r}deg;z-index:2">
      <div class="tape ${k ? 'corner-r' : 'top pink'}"></div>
      <div class="ph blank-ph" style="aspect-ratio:${b.ratio || 4 / 3}"><span>${esc(b.label)}</span></div><figcaption></figcaption></figure>`;
  }
  // a right page of things still to come (see "rightPage" in memories-data.js)
  function comingPage(m, i) {
    const p = m.rightPage;
    return `<div class="warm" style="--warm:${warmOf(i)}"></div>
      ${(p.frames || []).map(blankFrameHTML).join('')}
      ${p.note ? stickyHTML({ note: p.note }, i + 1, ...(p.notePos || [6, 66]), 'wide') : ''}
      <div class="doodle live smile" style="left:${p.smilePos ? p.smilePos[0] : 74}%;top:${p.smilePos ? p.smilePos[1] : 79}%;width:9%">${smileSVG}</div>
      <div class="doodle" style="left:${p.sunPos ? p.sunPos[0] : 86}%;top:${p.sunPos ? p.sunPos[1] : 70}%;width:8%">${DOODLES.sun}</div>`;
  }
  function yearRight(m, i) {
    if (m.rightPage) return comingPage(m, i);
    const { right } = splitPhotos(m.photos, m.leftPhotos);
    const extra = ['clock', 'heart', 'mug', 'heart'][i % 4];
    return `<div class="warm" style="--warm:${warmOf(i)}"></div>
      ${photosHTML(right, 'R', m.year, m.slots && m.slots.right)}
      ${m.note && m.notePage !== 'left' ? stickyHTML(m, i, ...(m.slots && m.slots.note || [6, 62])) : ''}
      ${right.filter(g => g.main.wide).length > 2
        ? `<div class="doodle live smile" style="left:72%;top:10%;width:9%">${smileSVG}</div><div class="doodle" style="left:78%;top:80%;width:9%">${DOODLES[extra]}</div>`
        : right.filter(g => g.main.wide).length > 1
        ? `<div class="doodle live smile" style="left:88%;top:42%;width:9%">${smileSVG}</div><div class="doodle" style="left:2%;top:88%;width:9%">${DOODLES[extra]}</div>`
        : right.some(g => g.main.wide)
        ? `<div class="doodle live smile" style="left:70%;top:22%;width:9%">${smileSVG}</div><div class="doodle" style="left:83%;top:36%;width:9%">${DOODLES[extra]}</div>`
        : `<div class="doodle live smile" style="left:8%;top:88%;width:9%">${smileSVG}</div><div class="doodle" style="left:22%;top:89%;width:9%">${DOODLES[extra]}</div>`}
      ${i === 0 && right.filter(g => g.main.wide).length < 2 ? `<div class="stamp" style="left:64%;top:4%;--r:-10deg">APPROVED</div>` : ''}`;
  }
  function futureLeft() {
    return `<div class="warm" style="--warm:.1"></div><div class="fhead">${esc(FUTURE.year)} &mdash; ?</div><div class="paws paws-l"></div>`;
  }
  function futureRight() {
    const slots = [[5, 19, 44, -5], [51, 24, 44, 5]];
    const cats = CATS.slice(0, 2).map((c, i) => polaroidHTML(
      { src: c.src, caption: c.caption || (CAT_CFG[i] && CAT_CFG[i].name) || '' }, slots[i], 'cat' + i,
      { cls: 'catpol', tape: i ? 'corner-r' : 'corner-l', fallback: catFallbackHTML(i), z: 3 })).join('');
    return `<div class="warm" style="--warm:.1"></div><div class="paws paws-r"></div>
      <div class="arrival fl">${esc(FUTURE.arrival)}</div>
      ${cats}
      <div class="future-lines"><div class="fl l1">${esc(FUTURE.line1)}</div><div class="fl l2">${esc(FUTURE.line2)} <span class="small-paw">${pawSVG()}</span></div></div>`;
  }
  function finalLeft() {
    return `<div class="warm" style="--warm:.1"></div>
      <div class="fin"><h2>${esc(FINAL.heading)}</h2>${FINAL.lines.map((l, i) => `<p class="${i >= 2 ? 'soft' : ''}">${esc(l)}</p>`).join('')}</div>
      <div class="fin-bottom">${esc(FINAL.bottom)}</div>`;
  }
  function finalRight() {
    return `<div class="warm" style="--warm:.1"></div><div class="lines"></div>
      <div class="pen-line">${esc(FINAL.pen)}</div>
      <div class="paws paws-pen"></div>
      <div class="pen" title="Pick up the pen">${penSVG}</div>
      <div class="pen-hint">(the pen is for you)</div>
      <div class="close-book">Close the book</div>`;
  }

  /* faces in reading order: cover | introL introR | yearL yearR ... | futureL futureR | finalL finalR */
  const faces = [{ html: coverFace(), cover: true }, { html: introLeft() }, { html: introRight(), intro: true }];
  MEMORIES.forEach((m, i) => { faces.push({ html: yearLeft(m, i) }, { html: yearRight(m, i) }); });
  // the "next year" spread is optional (FUTURE.show in memories-data.js)
  const SHOW_FUTURE = FUTURE.show !== false;
  if (SHOW_FUTURE) faces.push({ html: futureLeft(), future: true }, { html: futureRight(), future: true });
  faces.push({ html: finalLeft(), final: true }, { html: finalRight(), final: true });

  const LEAVES = (faces.length - 1) / 2;
  const SPREAD = { intro: 1, future: SHOW_FUTURE ? MEMORIES.length + 2 : -1, final: MEMORIES.length + (SHOW_FUTURE ? 3 : 2) };
  const leaves = [];
  for (let k = 0; k < LEAVES; k++) {
    const f = faces[2 * k], b = faces[2 * k + 1];
    const leaf = document.createElement('div');
    leaf.className = 'leaf';
    leaf.innerHTML = `<div class="face front ${f.cover ? 'cover' : 'paper'}" data-spread="${Math.ceil((2 * k) / 2)}"><div class="face-in">${f.html}</div></div>
      <div class="face back paper" data-spread="${k + 1}"><div class="face-in">${b.html}</div></div>`;
    leavesEl.appendChild(leaf);
    leaves.push(leaf);
  }
  baseEl.classList.add('paper');
  baseEl.dataset.spread = LEAVES;
  baseEl.innerHTML = `<div class="face-in">${faces[faces.length - 1].html}</div>`;
  if (typeof A !== 'undefined') { const d = document.createElement('div'); d.innerHTML = `<svg width="0" height="0" style="position:absolute"><defs>${A.defs()}</defs></svg>`; document.body.prepend(d.firstChild); }

  /* ================= sizing: keep the book's shape and fit the window ================= */
  function fit() {
    const bw = Math.min(innerWidth * .9, innerHeight * .82 * 1.5, 1700);
    book.style.setProperty('--bw', bw + 'px');
    book.style.setProperty('--bh', bw / 1.5 + 'px');
    book.style.setProperty('--fs', bw / 64 + 'px');
  }
  addEventListener('resize', fit); fit();

  /* ================= images: load the nearby spreads only ================= */
  function loadAround(s) {
    document.querySelectorAll('[data-spread]').forEach(face => {
      if (Math.abs(+face.dataset.spread - s) > 1) return;
      face.querySelectorAll('img[data-src]').forEach(img => {
        const ph = img.parentNode;
        img.onload = () => img.classList.add('ok');
        img.onerror = () => ph.classList.add('missing');
        img.src = img.dataset.src; img.removeAttribute('data-src');
      });
    });
  }

  /* ================= page turning ================= */
  let spread = 0, busy = false;
  function stackOrder() {
    leaves.forEach((lf, k) => { lf.style.zIndex = k < spread ? 10 + k : 100 + (LEAVES - k); });
    // only the two pages you can actually see respond to clicks; every other page
    // (including the hidden side of turned leaves) is switched off completely
    leaves.forEach((lf, k) => {
      lf.querySelector('.face.front').classList.toggle('off', k !== spread);
      lf.querySelector('.face.back').classList.toggle('off', k !== spread - 1);
    });
    baseEl.classList.toggle('off', spread !== LEAVES);
  }
  function updateBook() {
    book.classList.toggle('closed', spread === 0);
    book.classList.toggle('at-end', spread === LEAVES);
    $('.curl').classList.toggle('hint', spread === SPREAD.intro && !introTurned);
  }
  let introTurned = false;

  async function turn(dir) {
    const target = spread + dir;
    if (busy || zoomOpen || target < 0 || target > LEAVES) return;
    busy = true;
    const lf = leaves[dir > 0 ? spread : spread - 1];
    lf.style.zIndex = 500;
    lf.classList.add('turning');
    if (spread === 0) book.classList.remove('closed');
    if (spread === SPREAD.intro && dir > 0) introTurned = true;
    loadAround(target);
    lf.style.transform = '';
    lf.classList.toggle('flipped', dir > 0);
    Snd.turn();
    if (target === 0) setTimeout(() => book.classList.add('closed'), 350);
    await wait(1180);
    lf.classList.remove('turning');
    spread = target;
    stackOrder(); updateBook();
    busy = false;
    entered(spread);
  }

  /* click or drag the page edges */
  document.querySelectorAll('.zone').forEach(zone => {
    const dir = +zone.dataset.dir;
    zone.addEventListener('pointerdown', e => {
      if (busy || zoomOpen) return;
      if (spread === 0) return; // the closed cover opens on click
      const k = dir > 0 ? spread : spread - 1;
      const lf = leaves[k]; if (!lf) return;
      const pageW = book.getBoundingClientRect().width / 2;
      const x0 = e.clientX; let dragging = false, angle = dir > 0 ? 0 : -180;
      zone.setPointerCapture(e.pointerId);
      const move = ev => {
        const dx = ev.clientX - x0;
        if (!dragging && Math.abs(dx) > 6) { dragging = true; lf.style.zIndex = 500; lf.classList.add('turning'); lf.style.transition = 'none'; }
        if (!dragging) return;
        const p = Math.max(0, Math.min(1, (dir > 0 ? -dx : dx) / (pageW * 1.1)));
        angle = dir > 0 ? -180 * p : -180 + 180 * p;
        lf.style.transform = `rotateY(${angle}deg)`;
      };
      const up = () => {
        zone.removeEventListener('pointermove', move); zone.removeEventListener('pointerup', up); zone.removeEventListener('pointercancel', up);
        if (!dragging) { turn(dir); return; }
        lf.style.transition = '';
        const progress = dir > 0 ? -angle / 180 : (angle + 180) / 180;
        if (progress > .28) turn(dir);
        else { lf.style.transform = ''; setTimeout(() => { lf.classList.remove('turning'); stackOrder(); }, 700); }
      };
      zone.addEventListener('pointermove', move); zone.addEventListener('pointerup', up); zone.addEventListener('pointercancel', up);
    });
    zone.addEventListener('click', () => { if (spread === 0 && dir > 0) turn(1); });
  });
  addEventListener('keydown', e => {
    if (e.key === 'Escape' && zoomOpen) dropPhoto();
    else if (e.key === 'ArrowRight' || e.key === 'PageDown') turn(1);
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') turn(-1);
  });

  /* ================= what happens on each spread ================= */
  const played = {};
  async function entered(s) {
    if (s === SPREAD.intro && !played.intro) {
      played.intro = true;
      const ps = document.querySelectorAll('.intro p');
      for (const p of ps) { await wait(650); p.classList.add('on'); }
      await wait(700); document.querySelector('.turn-hint').classList.add('on');
      updateBook();
    }
    if (s === SPREAD.future && !played.future) { played.future = true; runFuture(); }
  }

  function placePaws(container, points, delay, cls = '') {
    return points.map(([x, y, rot], i) => {
      const el = document.createElement('div');
      el.className = 'pawmark ' + cls;
      el.style.cssText = `left:${x}%;top:${y}%;transform:rotate(${rot}deg)`;
      el.innerHTML = pawSVG();
      container.appendChild(el);
      return el;
    });
  }
  async function walk(prints, gap) {
    for (const p of prints) { p.classList.add('on'); Snd.pick(); await wait(gap); }
    prints.forEach((p, i) => setTimeout(() => p.classList.add('fadeout'), 900 + i * 120));
  }

  async function runFuture() {
    const L = document.querySelector('.paws-l'), R = document.querySelector('.paws-r');
    const ptsL = [], ptsR = [];
    for (let i = 0; i < 7; i++) ptsL.push([10 + i * 12.5, 84 - (i % 2) * 5 - i * 1.2, 80]);
    for (let i = 0; i < 6; i++) ptsR.push([2 + i * 12, 70 - (i % 2) * 5 - i * 1.5, 70]);
    const pl = placePaws(L, ptsL), pr = placePaws(R, ptsR);
    await wait(1100);
    await walk(pl, 520);
    await walk(pr, 520);
    await wait(500);
    document.querySelector('.arrival').classList.add('on');
    await wait(1300);
    const cats = document.querySelectorAll('.catpol');
    for (const c of cats) { c.classList.add('in'); Snd.mew(); await wait(750); }
    await wait(900);
    document.querySelector('.future-lines .l1').classList.add('on');
    await wait(1300);
    document.querySelector('.future-lines .l2').classList.add('on');
    Snd.chime();
  }

  /* the pen on the last page */
  let penDone = false;
  async function writeWithPen() {
    if (penDone) return; penDone = true;
    const pen = document.querySelector('.pen'), line = document.querySelector('.pen-line'), hint = document.querySelector('.pen-hint');
    hint.style.opacity = '0';
    const page = baseEl.getBoundingClientRect(), lr = line.getBoundingClientRect();
    // measure exactly where the nib ends up in the writing pose (it is the pen's left
    // edge, half-way down), and where the sentence's baseline starts
    const nib = document.createElement('i');
    nib.style.cssText = 'position:absolute;left:0;top:50%;width:0;height:0';
    pen.appendChild(nib);
    pen.style.transform = 'rotate(-38deg)';
    const tip = nib.getBoundingClientRect();
    pen.style.transform = ''; nib.remove();
    const mark = document.createElement('span');
    mark.style.cssText = 'display:inline-block;width:0;height:0';
    line.prepend(mark);
    const baseline = mark.getBoundingClientRect(); mark.remove();
    const fs = parseFloat(getComputedStyle(line).fontSize);
    // the nib rides just above the baseline, where the letters are drawn
    const dx = baseline.left - tip.left, dy = baseline.top - fs * .3 - tip.top;
    const base = 'rotate(-22deg)';
    await pen.animate([{ transform: base }, { transform: `translate(${dx}px, ${dy - page.height * .05}px) rotate(-40deg)` }, { transform: `translate(${dx}px, ${dy}px) rotate(-38deg)` }], { duration: 900, easing: 'ease-in-out', fill: 'forwards' }).finished;
    const dur = 3200;
    Snd.scratch(dur / 1000);
    line.animate([{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: dur, easing: 'linear', fill: 'forwards' });
    const wob = [];
    for (let i = 0; i <= 16; i++) wob.push({ transform: `translate(${dx + lr.width * i / 16}px, ${dy + (i % 2 ? -.18 : .12) * fs}px) rotate(-38deg)` });
    await pen.animate(wob, { duration: dur, easing: 'linear', fill: 'forwards' }).finished;
    await pen.animate([{ transform: `translate(${dx + lr.width}px, ${dy}px) rotate(-38deg)` }, { transform: `translate(${dx + lr.width * .55}px, ${dy + page.height * .2}px) rotate(-12deg)` }], { duration: 900, easing: 'ease-in-out', fill: 'forwards' }).finished;
    // two little paw prints trot across the sentence
    const box = document.querySelector('.paws-pen');
    const lx = (lr.left - page.left) / page.width * 100, ly = (lr.top - page.top) / page.height * 100, lw = lr.width / page.width * 100;
    const pts = [];
    for (let i = 0; i < 6; i++) pts.push([lx - 2 + i * lw / 5.4, ly + 6 - (i % 2) * 4, 80]);
    const prints = placePaws(box, pts, 0);
    await wait(500);
    await walk(prints, 430);
    Snd.chime();
    await wait(900);
    document.querySelector('.close-book').classList.add('on');
  }

  let closing = false;
  async function closeBook() {
    if (closing) return; closing = true;
    if (zoomOpen) { dropPhoto(); await wait(600); }
    while (busy) await wait(80);            // let a page that is turning finish first
    busy = true;
    $('#close-top').classList.add('gone');
    Snd.turn();
    for (let k = spread - 1; k >= 0; k--) {
      const lf = leaves[k];
      lf.classList.add('fast', 'turning');
      lf.style.zIndex = 600 + (LEAVES - k);
      lf.classList.remove('flipped');
      if (k % 2 === 0) Snd.turn();
      await wait(170);
    }
    await wait(650);
    spread = 0; book.classList.add('closed');
    await wait(1200);
    $('#fade').classList.add('on');
    await wait(1300);
    location.href = RETURN_PAGE + (RETURN_PAGE.includes('?') ? '&' : '?') + 'from=memories';
  }

  /* ================= lifting a photo off the page ================= */
  let zoomOpen = null;
  function liftPhoto(pol) {
    if (zoomOpen) return;
    const rect = pol.getBoundingClientRect();
    const zoom = $('#zoom');
    const card = pol.cloneNode(true);
    card.className = 'zoom-card' + (pol.classList.contains('wide') ? ' wide' : '');
    card.removeAttribute('style');
    const img = card.querySelector('img'), orig = pol.querySelector('img');
    if (orig && orig.src) img.src = orig.src; img.classList.toggle('ok', orig && orig.classList.contains('ok'));
    const cap = card.querySelector('figcaption'); cap.textContent = pol.querySelector('figcaption').textContent;
    const ratio = parseFloat(pol.dataset.ratio);
    const w = ratio ? Math.min(innerWidth * .7, (innerHeight * .8 - 90) * ratio + 40, 920)   // whole photo, whatever its shape
      : pol.classList.contains('wide') ? Math.min(innerWidth * .66, innerHeight * .7 / .78, 920) : Math.min(innerWidth * .46, innerHeight * .78 * .86, 620);
    card.style.width = w + 'px';
    zoom.innerHTML = ''; zoom.appendChild(card); zoom.hidden = false;
    const h = card.getBoundingClientRect().height;
    const left = (innerWidth - w) / 2, top = Math.max(16, (innerHeight - h) / 2);
    card.style.left = left + 'px'; card.style.top = top + 'px';
    const s = rect.width / w, rot = parseFloat(pol.style.getPropertyValue('--r')) || 0;
    const from = `translate(${rect.left - left}px, ${rect.top - top}px) scale(${s}) rotate(${rot}deg)`;
    card.style.transition = 'none'; card.style.transform = from;
    pol.style.visibility = 'hidden';
    void card.offsetWidth;
    card.style.transition = ''; card.style.transform = 'rotate(-1.5deg)';
    requestAnimationFrame(() => zoom.classList.add('show'));
    Snd.pick();
    zoomOpen = { pol, card, from };
  }
  function dropPhoto() {
    if (!zoomOpen) return;
    const { pol, card, from } = zoomOpen;
    const zoom = $('#zoom');
    zoom.classList.remove('show');
    card.style.transform = from;
    Snd.pick();
    setTimeout(() => { pol.style.visibility = ''; zoom.hidden = true; zoom.innerHTML = ''; zoomOpen = null; }, 560);
  }
  $('#zoom').addEventListener('click', dropPhoto);
  // "Close the book" in the corner: back to the birthday room at any time
  $('#close-top').addEventListener('click', closeBook);

  /* a scrap of paper with a remark, near something */
  let scrapTimer = 0;
  function remark(text, el) {
    const s = $('#scrap'), r = el.getBoundingClientRect();
    s.textContent = text;
    s.style.left = Math.max(12, Math.min(innerWidth - 320, r.left + r.width / 2 - 140)) + 'px';
    s.style.top = Math.min(innerHeight - 80, r.bottom + 10) + 'px';
    s.classList.add('show');
    clearTimeout(scrapTimer); scrapTimer = setTimeout(() => s.classList.remove('show'), 3200);
  }

  /* ================= clicks inside the pages ================= */
  let suppressClick = false;
  book.addEventListener('click', e => {
    if (suppressClick) { suppressClick = false; return; }
    if (busy || zoomOpen) return;
    const t = e.target;
    if (t.closest('.face.cover')) { turn(1); return; }
    if (t.closest('.turn-hint')) { turn(1); return; }
    const clip = t.closest('.clip');
    if (clip) { clip.classList.remove('wiggle'); void clip.offsetWidth; clip.classList.add('wiggle'); Snd.pop(); return; }
    const pol = t.closest('.polaroid');
    if (pol && pol.classList.contains('blank')) return;   // empty frames have nothing to pick up yet
    if (pol) {
      if (pol.classList.contains('dnc') && !pol.classList.contains('peeled')) {
        pol.classList.add('peeled'); Snd.pick();
        setTimeout(() => remark('I specifically said not to click it.', pol), 350);
        return;
      }
      if (pol.classList.contains('cover-photo') && !pol.classList.contains('aside')) { setAside(pol); return; }
      if (pol.classList.contains('hidden-photo') && !pol.classList.contains('found')) return;
      if (pol.classList.contains('catpol') && !pol.classList.contains('in')) return;
      liftPhoto(pol); return;
    }
    const sticky = t.closest('.sticky');
    if (sticky) {
      sticky.classList.remove('flip'); void sticky.offsetWidth; sticky.classList.add('flip'); Snd.pick();
      setTimeout(() => sticky.classList.toggle('back'), 250); return;
    }
    const smile = t.closest('.smile');
    if (smile) {
      const sv = smile.querySelector('svg'); const show = (sel, on) => sv.querySelectorAll(sel).forEach(n => { n.style.display = on ? '' : 'none'; });
      show('.eyes-happy', false); show('.mouth-happy', false); show('.eyes-wow', true); show('.mouth-wow', true); Snd.pop();
      setTimeout(() => { show('.eyes-happy', true); show('.mouth-happy', true); show('.eyes-wow', false); show('.mouth-wow', false); }, 1600);
      return;
    }
    const flower = t.closest('.flower');
    if (flower) { flower.classList.add('nudge'); Snd.pick(); setTimeout(() => flower.classList.remove('nudge'), 900); return; }
    const coffee = t.closest('.coffee');
    if (coffee) {
      const page = coffee.parentNode, paw = document.createElement('div');
      paw.className = 'pawmark'; paw.style.cssText = `left:${parseFloat(coffee.style.left) - 4}%;top:${parseFloat(coffee.style.top) + 12}%;transform:rotate(-20deg);width:5%`;
      paw.innerHTML = pawSVG('#8a5a30'); page.appendChild(paw);
      requestAnimationFrame(() => paw.classList.add('on')); Snd.pop();
      setTimeout(() => { paw.classList.remove('on'); setTimeout(() => paw.remove(), 700); }, 1500);
      return;
    }
    if (t.closest('.pen')) { writeWithPen(); return; }
    if (t.closest('.close-book')) { closeBook(); return; }
  });

  /* the photo with a secret underneath: drag it (or click it) aside */
  function setAside(pol) {
    pol.style.transform = '';
    pol.classList.remove('dragging');
    pol.classList.add('aside');
    Snd.pick();
    const hidden = pol.parentNode.querySelector(`.polaroid[data-key="${pol.dataset.key}h"]`);
    if (hidden) { hidden.classList.add('found'); setTimeout(() => remark('Oh? Something was hiding under there.', hidden), 500); }
  }
  book.addEventListener('pointerdown', e => {
    const pol = e.target.closest('.polaroid.cover-photo:not(.aside)');
    if (!pol || busy || zoomOpen) return;
    const x0 = e.clientX, y0 = e.clientY; let moved = false;
    pol.setPointerCapture(e.pointerId);
    const move = ev => {
      const dx = ev.clientX - x0, dy = ev.clientY - y0;
      if (!moved && Math.hypot(dx, dy) > 5) { moved = true; pol.classList.add('dragging'); }
      if (moved) pol.style.transform = `translate(${dx}px, ${dy}px) rotate(var(--r))`;
    };
    const up = () => {
      pol.removeEventListener('pointermove', move); pol.removeEventListener('pointerup', up); pol.removeEventListener('pointercancel', up);
      if (moved) { suppressClick = true; setAside(pol); }
    };
    pol.addEventListener('pointermove', move); pol.addEventListener('pointerup', up); pol.addEventListener('pointercancel', up);
  });

  /* ================= start ================= */
  stackOrder(); updateBook(); loadAround(0); loadAround(1);
  setTimeout(() => $('#fade').classList.remove('on'), 200);
})();
