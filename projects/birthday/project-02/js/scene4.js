/* ===================== SCENE 4 — The Birthday Surprise ===================== */
(() => {
  const f = A.f;
  const C1 = CONFIG.cats.one, C2 = CONFIG.cats.two;

  /* ---------- confetti on the fx canvas ---------- */
  const Confetti = (() => {
    const cv = document.getElementById('fx'), ctx = cv.getContext('2d');
    let parts = [], running = false;
    const cols = ['#e7c46a', '#d98f98', '#9fb59a', '#f4ead2', '#b7a0cf', '#e9a86a'];
    function size() { cv.width = innerWidth * devicePixelRatio; cv.height = innerHeight * devicePixelRatio; }
    addEventListener('resize', size); size();
    function burst(n = 140, fromTop = true) {
      for (let i = 0; i < n; i++) parts.push({
        x: Math.random() * innerWidth, y: fromTop ? -20 - Math.random() * innerHeight * .5 : innerHeight * .45,
        vx: (Math.random() - .5) * (fromTop ? 1.2 : 9), vy: fromTop ? 1 + Math.random() * 2 : -6 - Math.random() * 7,
        w: 5 + Math.random() * 7, h: 3 + Math.random() * 4, r: Math.random() * 6, vr: (Math.random() - .5) * .25,
        c: cols[Math.floor(Math.random() * cols.length)], sway: Math.random() * 6, life: 0
      });
      if (!running) { running = true; requestAnimationFrame(tick); }
    }
    function tick() {
      const d = devicePixelRatio;
      ctx.clearRect(0, 0, cv.width, cv.height);
      parts.forEach(p => {
        p.life++; p.vy = Math.min(p.vy + .12, 2.6); p.vx *= .985;
        p.x += p.vx + Math.sin(p.life * .05 + p.sway) * .6; p.y += p.vy; p.r += p.vr;
        ctx.save(); ctx.translate(p.x * d, p.y * d); ctx.rotate(p.r); ctx.scale(1, Math.abs(Math.cos(p.life * .08 + p.sway)) + .15);
        ctx.fillStyle = p.c; ctx.globalAlpha = .92; ctx.fillRect(-p.w * d / 2, -p.h * d / 2, p.w * d, p.h * d); ctx.restore();
      });
      parts = parts.filter(p => p.y < innerHeight + 30);
      if (parts.length) requestAnimationFrame(tick); else { running = false; ctx.clearRect(0, 0, cv.width, cv.height); }
    }
    return { burst, clear() { parts = []; } };
  })();

  /* ---------- photo slideshow for the wall frame ----------
     Pictures come from assets/photos. A page opened from disk cannot list a
     folder, so the photos are found either from CONFIG.photos (a list of file
     names) or by trying the numbered names 1.jpg, 2.jpg, 3.png ... */
  const Photos = (() => {
    const DIR = 'assets/photos/', EXT = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'JPG', 'JPEG', 'PNG', 'WEBP'];
    const SECONDS = (CONFIG.photoSeconds || 2) * 1000;
    let list = null, loading = null, idx = 0, front = 0, timer = 0, run = 0;
    const tryLoad = src => new Promise(res => { const im = new Image(); im.onload = () => res(src); im.onerror = () => res(null); im.src = src; });
    async function numbered(n) { for (const e of EXT) { const s = await tryLoad(`${DIR}${n}.${e}`); if (s) return s; } return null; }
    function load() {
      if (loading) return loading;
      loading = (async () => {
        const named = (CONFIG.photos || []).map(p => (p.includes('/') ? p : DIR + p));
        if (named.length) list = (await Promise.all(named.map(tryLoad))).filter(Boolean);
        if (!list || !list.length) {
          list = [];
          for (let n = 1, miss = 0; n <= 300 && miss < 3; n++) {
            const s = await numbered(n);
            if (s) { list.push(s); miss = 0; } else miss++;
          }
        }
        return list;
      })();
      return loading;
    }
    function show(src) {
      const cur = document.getElementById('ph' + front), next = document.getElementById('ph' + (1 - front));
      if (!cur || !next) return;
      next.setAttribute('href', src);
      next.style.opacity = '1'; cur.style.opacity = '0';
      front = 1 - front;
    }
    async function start() {
      stop();
      const me = ++run;
      await load();
      if (me !== run) return;
      const empty = document.getElementById('phEmpty');
      if (!list.length) { if (empty) empty.style.display = ''; return; }
      if (empty) empty.style.display = 'none';
      front = 0;
      show(list[idx % list.length]);
      if (list.length > 1) timer = setInterval(() => { idx = (idx + 1) % list.length; show(list[idx]); }, SECONDS);
    }
    function stop() { clearInterval(timer); timer = 0; run++; }
    return { start, stop };
  })();

  /* ---------- the three gifts ----------
     Each cat walks in carrying a present. Opening it plays an HTML page from
     assets/gift in a pop-up window; then the cat takes its seat by the cake and
     the next one arrives. Pip, the kitten guide, comes last. */
  const GIFTS = (CONFIG.gifts && CONFIG.gifts.length ? CONFIG.gifts : [
    { file: 'gift1_garden.html', from: 'one' },
    { file: 'gift2_clover.html', from: 'two' },
    { file: 'gift3_wish.html', from: 'pip' }
  ]).slice(0, 3);
  const WHO = ['one', 'two', 'pip'];
  const catName = w => (w === 'pip' ? Guide.name : CONFIG.cats[w].name);
  const SPOT_CAT = [690, 884, .62], SPOT_GIFT = [850, 888, 1], START = [1790, 884, .62];
  const SEATS = { one: [610, 560, .7], two: [992, 562, .7], pip: [512, 568, .72] };
  // opened boxes rest on the floor right of the table: gifts 1 and 2 in the front row, gift 3 behind them
  const SHELF = [[1250, 878, .82], [1402, 878, .82], [1326, 816, .7]];
  const GIFT_COLS = [['#c47a86', '#f6e3b0'], ['#7f9fb8', '#fbeec9'], ['#e9c886', '#d2667e']];
  const ARRIVE = {
    one: 'Meow. (This present was entirely my idea.)',
    two: 'Meow! (I carried it ALL by myself! Open it! Open it!)',
    pip: `Mew! And this last one is from me, ${CONFIG.name}!`
  };
  const tf = p => `translate(${p[0]}px, ${p[1]}px) scale(${p[2]})`;

  function catArt(w) {
    if (w === 'pip') return `<g class="catwrap"><g transform="translate(-69 -142)">${Guide.kittenSVG('pk').replace('<svg ', '<svg width="138" height="147" ')}</g></g>`;
    const one = w === 'one';
    return `<g class="catwrap"><g class="cat ${one ? 'c1' : 'c2'}">${one
      ? A.cat(C1, { id: 'm1', hat: '#d9a54a', hatTilt: -8, bow: '#8a2a34' })
      : A.cat(C2, { id: 'm2', hat: '#c8687a', hatTilt: 22, hatX: 14, bow: '#3f6a78', frosting: true })}</g></g>`;
  }

  function giftArt(i, done) {
    const [c, r] = GIFT_COLS[i % 3];
    let o = done ? '' : `<g class="gb-glow"><ellipse cx="0" cy="-50" rx="90" ry="72" fill="#ffe6a8" opacity=".4" filter="url(#b16)"/></g>`;
    o += `<ellipse cx="0" cy="2" rx="64" ry="9" fill="#1a0f06" opacity=".38" filter="url(#b4)"/><g class="gb-body">`;
    o += `<rect x="-55" y="-80" width="110" height="80" rx="4" fill="${c}" filter="url(#tex)"/><rect x="33" y="-80" width="22" height="80" fill="#000" opacity=".12"/>`;
    for (let k = 0; k < 6; k++) o += A.sym(i === 1 ? 'star' : i === 2 ? 'heart' : 'paw', -38 + (k % 3) * 38, -58 + Math.floor(k / 3) * 34, .32, '#fff', 'opacity=".45"');
    o += `<rect x="-9" y="-80" width="18" height="80" fill="${r}"/><rect x="-55" y="-46" width="110" height="12" fill="${r}"/>`;
    if (done) {
      o += `<path d="M-44 -80Q-30 -104 -12 -86Q0 -108 14 -86Q32 -104 46 -80Z" fill="#fbeef0" stroke="#e9c2c8" stroke-width="2"/>`;
      o += `<g transform="translate(70 -8) rotate(-78)"><rect x="-62" y="-24" width="124" height="24" rx="4" fill="${c}"/><rect x="-9" y="-24" width="18" height="24" fill="${r}"/></g>`;
    } else o += `<g class="gb-lid"><rect x="-62" y="-100" width="124" height="24" rx="4" fill="${c}"/><rect x="-62" y="-80" width="124" height="4" fill="#000" opacity=".15"/><rect x="-9" y="-100" width="18" height="24" fill="${r}"/>`;
    if (!done) o += `<path d="M0 -100C-34 -134 -62 -108 -20 -100C-62 -88 -30 -70 0 -100C30 -70 62 -88 20 -100C62 -108 34 -134 0 -100Z" fill="${r}" stroke="#000" stroke-opacity=".15" stroke-width="1.5"/><circle cy="-100" r="8" fill="${r}" stroke="#000" stroke-opacity=".2"/></g>`;
    o += `<g transform="translate(40 -60) rotate(10)"><rect x="-15" y="-11" width="30" height="22" rx="3" fill="#fbf3df" stroke="#a88e62"/><text y="6" text-anchor="middle" font-family="Palatino Linotype, Georgia, serif" font-size="15" fill="#8a3b36">${i + 1}</text></g>`;
    o += `</g>`;
    if (!done) for (let k = 0; k < 5; k++) o += `<path class="gb-spark" style="animation-delay:${k * .35}s" d="${A.symPath.star()}" transform="translate(${[-70, 64, -40, 52, 0][k]} ${[-92, -110, -130, -40, -150][k]}) scale(.3)" fill="#fff3c0"/>`;
    return o;
  }

  /* pop-up window that plays a gift page */
  const GiftWin = (() => {
    let onClose = null;
    const win = () => document.getElementById('giftwin');
    function open(gift, i, cb, opts = {}) {
      const w = win();
      onClose = cb;
      w.querySelector('.gw-title').textContent = opts.title || `Gift ${i + 1} of ${GIFTS.length}  ·  from ${catName(gift.from || WHO[i])}`;
      w.querySelector('iframe').src = opts.src || 'assets/gift/' + gift.file;
      w.hidden = false;
      requestAnimationFrame(() => w.classList.add('open'));
      Sound.hush(true);
    }
    function close() {
      const w = win();
      if (w.hidden) return;
      w.classList.remove('open');
      Sound.hush(false);
      Sound.play('pop');
      setTimeout(() => { w.hidden = true; w.querySelector('iframe').src = 'about:blank'; }, 450);
      const cb = onClose; onClose = null;
      if (cb) cb();
    }
    win().querySelector('.gw-close').addEventListener('click', close);
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !win().hidden) close(); });
    return { open, close };
  })();

  async function bringNext() {
    const i = G.get('giftsOpened', 0);
    if (i >= GIFTS.length || G.get('giftArrived', -1) === i || G.busy) return;
    const c = G.$('#gc' + i), g = G.$('#giftbox');
    if (!c || !g) return;
    G.busy = true;
    c.style.opacity = '1'; g.style.opacity = '1';
    c.classList.add('walking'); g.classList.add('walking');
    Sound.play('rustle');
    await G.wait(60);
    c.style.transform = tf(SPOT_CAT); g.style.transform = tf(SPOT_GIFT);
    await G.wait(2500);
    c.classList.remove('walking'); g.classList.remove('walking'); g.classList.add('ready');
    G.put('giftArrived', i);
    const w = GIFTS[i].from || WHO[i];
    Sound.play('meow', w === 'pip' ? 3 : w === 'one' ? 1 : 2);
    G.bubble(SPOT_CAT[0], 700, ARRIVE[w] || 'Meow! (A present for you!)', 'arrive', 4200);
    G.busy = false;
  }

  async function openGift() {
    const i = G.get('giftsOpened', 0);
    if (G.get('giftArrived', -1) !== i) return;
    G.busy = true;
    const g = G.$('#giftbox');
    g.classList.remove('ready'); g.classList.add('opening');
    Sound.play('rustle'); Sound.play('sparkle');
    Confetti.burst(50, false);
    await G.wait(900);
    G.busy = false;
    GiftWin.open(GIFTS[i], i, () => afterGift(i));
  }

  async function afterGift(i) {
    G.put('giftsOpened', i + 1);
    G.busy = true;
    const c = G.$('#gc' + i), g = G.$('#giftbox');
    if (g) { g.classList.add('shelving'); g.style.transform = tf(SHELF[i]); }
    const w = GIFTS[i].from || WHO[i];
    await G.wait(300);
    if (c) { c.classList.add('walking'); c.style.transform = tf(SEATS[w]); }
    await G.wait(2300);
    if (c) c.classList.remove('walking');
    G.busy = false;
    G.refresh();
    if (i + 1 < GIFTS.length) { await G.wait(500); bringNext(); }
    else { Sound.play('discover'); Confetti.burst(90); }
  }

  /* ---------- background ---------- */
  function bg() {
    const r = A.rng(8080);
    let o = `<defs>
      <pattern id="s4stripe" width="60" height="10" patternUnits="userSpaceOnUse"><rect width="60" height="10" fill="#dcbfa8"/><rect width="26" height="10" fill="#e6cdb8"/><rect x="28" width="2" height="10" fill="#c9a58a" opacity=".5"/></pattern>
      <linearGradient id="s4sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1f2c4f"/><stop offset=".55" stop-color="#5a4e78"/><stop offset=".85" stop-color="#d88a6a"/><stop offset="1" stop-color="#f0b77a"/></linearGradient>
      <linearGradient id="s4floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a3a24"/><stop offset="1" stop-color="#7a5234"/></linearGradient>
      <linearGradient id="s4curtain" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5e6f5a"/><stop offset=".35" stop-color="#7f9278"/><stop offset=".6" stop-color="#65785f"/><stop offset="1" stop-color="#899c80"/></linearGradient>
      <radialGradient id="s4wallglow" cx="800" cy="420" r="800" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffcf8a" stop-opacity=".35"/><stop offset="1" stop-color="#ffcf8a" stop-opacity="0"/></radialGradient>
    </defs>`;
    o += `<rect width="1600" height="800" fill="url(#s4stripe)"/><rect width="1600" height="800" fill="#b89a86" opacity=".2" filter="url(#tex)"/>`;
    o += `<rect width="1600" height="800" fill="url(#s4wallglow)"/>`;
    o += `<rect x="0" y="0" width="1600" height="30" fill="#efe2cc"/><rect x="0" y="30" width="1600" height="10" fill="#c7ad8e"/>`;
    // dado rail & panelling
    o += `<rect x="0" y="600" width="1600" height="200" fill="#e9dcc4"/><rect x="0" y="596" width="1600" height="10" fill="#c7ad8e"/>`;
    for (let x = 30; x < 1600; x += 150) o += `<rect x="${x}" y="626" width="120" height="150" rx="3" fill="none" stroke="#cdb99a" stroke-width="3"/>`;
    // arched window at night
    o += `<path d="M990 480V230A130 130 0 0 1 1250 230V480Z" fill="#efe2cc"/><path d="M1004 470V232A116 116 0 0 1 1236 232V470Z" fill="url(#s4sky)"/>`;
    for (let i = 0; i < 30; i++) o += `<circle cx="${f(1010 + r() * 220)}" cy="${f(130 + r() * 250)}" r="${f(.6 + r() * 1.4)}" fill="#fff8e0" opacity="${f(.4 + r() * .6)}"/>`;
    o += `<path d="M1180 170A26 26 0 1 0 1196 214A20 20 0 1 1 1180 170Z" fill="#fdf1c8"/><circle cx="1180" cy="190" r="40" fill="#fdf1c8" opacity=".12" filter="url(#b8)"/>`;
    o += `<g opacity=".85">${A.bush(r, 1060, 460, 70, 40, 60, ['#1e2a26', '#26352e', '#2e4036'], 12, 20)}${A.bush(r, 1190, 450, 70, 50, 60, ['#1e2a26', '#26352e', '#2e4036'], 12, 20)}</g>`;
    o += `<path d="M1120 116V470M1004 330H1236" stroke="#efe2cc" stroke-width="8"/><rect x="980" y="470" width="280" height="18" rx="2" fill="#dccbb0"/>`;
    o += `<g filter="url(#tex)"><path d="M950 90H1020Q1010 300 1034 400Q990 500 966 560H944Q960 360 950 90Z" fill="url(#s4curtain)"/><path d="M1290 90H1220Q1230 300 1206 400Q1250 500 1274 560H1296Q1280 360 1290 90Z" fill="url(#s4curtain)"/></g>`;
    o += `<rect x="930" y="80" width="380" height="14" rx="7" fill="url(#brass)"/>`;
    // small framed portrait of the cats (to the right of the photo frame)
    o += `<g transform="translate(280 -50)"><g filter="url(#drop)"><rect x="140" y="250" width="170" height="130" fill="#8a6a44"/></g><rect x="150" y="260" width="150" height="110" fill="#e9dcc4"/>`;
    o += `<g transform="translate(200 360) scale(.3)">${A.cat(C1, { id: 'fp1' })}</g><g transform="translate(252 362) scale(.28)">${A.cat(C2, { id: 'fp2' })}</g></g>`;
    // floor
    o += `<rect x="0" y="790" width="1600" height="110" fill="url(#s4floor)"/><g filter="url(#woodH)"><rect x="0" y="790" width="1600" height="110" fill="#6a4428" opacity=".6"/></g><rect x="0" y="786" width="1600" height="8" fill="#3a2414"/>`;
    o += `<ellipse cx="800" cy="850" rx="520" ry="46" fill="#7a3a3e"/><ellipse cx="800" cy="850" rx="490" ry="38" fill="none" stroke="#d9b36b" stroke-width="4"/>`;
    // table shadow
    o += `<ellipse cx="800" cy="800" rx="420" ry="18" fill="#1a0f06" opacity=".5" filter="url(#b8)"/>`;
    return o;
  }

  function swag(x1, y1, x2, y2, sag, n) {
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n, x = x1 + (x2 - x1) * t, y = y1 + (y2 - y1) * t + Math.sin(t * Math.PI) * sag;
      pts.push([x, y]);
    }
    return pts;
  }

  /* ---------- foreground ---------- */
  function fg() {
    const r = A.rng(55);
    const H = G.has, lit = G.get('candles', 'out') === 'lit';
    let o = `<defs>
      <linearGradient id="s4cloth" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbf5e8"/><stop offset="1" stop-color="#e0d2b8"/></linearGradient>
      <linearGradient id="s4frost" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e8d9c4"/><stop offset=".4" stop-color="#fdf6ea"/><stop offset=".8" stop-color="#f4e9d8"/><stop offset="1" stop-color="#d9c8b0"/></linearGradient>
      <linearGradient id="s4stand" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b9b0a2"/><stop offset=".5" stop-color="#f4efe6"/><stop offset="1" stop-color="#a39a8c"/></linearGradient>
      <radialGradient id="s4bulb" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff6c8"/><stop offset=".4" stop-color="#ffd878" stop-opacity=".7"/><stop offset="1" stop-color="#ffb850" stop-opacity="0"/></radialGradient>
      <clipPath id="s4photoClip"><rect x="354" y="184" width="200" height="154"/></clipPath>
      <radialGradient id="s4cakeglow" cx="800" cy="420" r="380" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffe2a0" stop-opacity=".55"/><stop offset="1" stop-color="#ffe2a0" stop-opacity="0"/></radialGradient>
      ${['#c9a3b0', '#9fb59a', '#e9c886', '#b7c4d8', '#d9a0a0'].map((c, i) => `<radialGradient id="s4bal${i}" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#fff" stop-opacity=".7"/><stop offset=".25" stop-color="${c}"/><stop offset="1" stop-color="${c}" stop-opacity=".85"/></radialGradient>`).join('')}
    </defs>`;
    // photo frame on the wall: a slideshow of the pictures in assets/photos
    o += `<g transform="translate(-180 90)"><g data-hot="photos" filter="url(#drop)">
      <rect x="330" y="160" width="248" height="202" rx="4" fill="url(#brass)"/>
      <rect x="337" y="167" width="234" height="188" rx="2" fill="none" stroke="#7a5118" stroke-width="2" opacity=".55"/>
      <rect x="344" y="174" width="220" height="174" fill="#f6ecd8"/>
      <g clip-path="url(#s4photoClip)">
        <g id="phEmpty"><rect x="354" y="184" width="200" height="154" fill="#f3d9d6"/>${A.sym('heart', 430, 238, .9, '#e9a3a8')}${A.sym('heart', 478, 250, .6, '#f0bcc0')}${A.sym('paw', 454, 290, .6, '#d99a9a')}<text x="454" y="326" text-anchor="middle" font-family="Palatino Linotype, Georgia, serif" font-style="italic" font-size="13" fill="#a0616a">Happy memories</text></g>
        <image id="ph0" class="photo" x="354" y="184" width="200" height="154" preserveAspectRatio="xMidYMid slice" style="opacity:0"/>
        <image id="ph1" class="photo" x="354" y="184" width="200" height="154" preserveAspectRatio="xMidYMid slice" style="opacity:0"/>
        <path d="M354 184H430L380 338H354Z" fill="#fff" opacity=".1" pointer-events="none"/>
      </g>
      <rect x="354" y="184" width="200" height="154" fill="none" stroke="#c9b58c" stroke-width="1.5"/>
      <rect x="424" y="351" width="60" height="10" rx="2" fill="#e8c77a" stroke="#8a5f1f" stroke-width=".8"/>
    </g></g>`;
    // balloons
    o += `<g data-hot="balloons">`;
    [[1340, 250, 0], [1420, 210, 1], [1390, 320, 2], [1460, 300, 3], [1310, 350, 4], [1440, 400, 0]].forEach(([x, y, c], i) => {
      o += `<path d="M${x} ${y + 50}Q${x + (1380 - x) * .5 + 10} ${y + 250} 1380 780" stroke="#e7d9b8" stroke-width="1.2" fill="none"/>`;
      o += `<g class="bob" style="animation-delay:${-i * 1.1}s;animation-duration:${5 + i * .7}s"><ellipse cx="${x}" cy="${y}" rx="42" ry="52" fill="url(#s4bal${c})"/><path d="M${x - 5} ${y + 51}L${x + 5} ${y + 51}L${x} ${y + 58}Z" fill="#b89a8a"/><ellipse cx="${x - 14}" cy="${y - 20}" rx="9" ry="15" fill="#fff" opacity=".3"/></g>`;
    });
    o += `<path d="M1366 770H1394L1390 790H1370Z" fill="url(#brass)"/></g>`;
    // presents on the floor
    const present = (x, y, w, h, c, rb, pat) => {
      let p = `<g transform="translate(${x} ${y})"><rect x="${-w / 2}" y="${-h}" width="${w}" height="${h}" fill="${c}" filter="url(#tex)"/>`;
      if (pat === 'dots') for (let i = 0; i < 10; i++) p += `<circle cx="${f(-w / 2 + 8 + (i % 5) * (w - 16) / 4)}" cy="${f(-h + 12 + Math.floor(i / 5) * (h - 24))}" r="3.5" fill="#fbf3df" opacity=".8"/>`;
      if (pat === 'stripe') for (let i = 0; i < 6; i++) p += `<path d="M${f(-w / 2 + i * w / 6)} ${-h}l${w / 6} ${h}" stroke="#fbf3df" stroke-width="3" opacity=".35"/>`;
      p += `<rect x="-6" y="${-h}" width="12" height="${h}" fill="${rb}"/><rect x="${-w / 2}" y="${-h * .55}" width="${w}" height="10" fill="${rb}"/>`;
      p += `<path d="M0 ${-h}C-24 ${-h - 26} -34 ${-h - 4} 0 ${-h}C34 ${-h - 4} 24 ${-h - 26} 0 ${-h}Z" fill="${rb}" stroke="#000" stroke-opacity=".15"/><rect x="${w / 2 - 8}" y="${-h}" width="8" height="${h}" fill="#000" opacity=".15"/></g>`;
      return p;
    };
    o += `<g data-hot="presents"><ellipse cx="330" cy="796" rx="130" ry="12" fill="#1a0f06" opacity=".45" filter="url(#b4)"/>${present(290, 790, 120, 92, '#7f9278', '#f1e3c4', 'stripe')}${present(390, 792, 90, 70, '#d9a55a', '#b8545e', 'dots')}${present(320, 698, 80, 60, '#c47a86', '#e8c877')}</g>`;
    // table with cloth
    o += `<path d="M430 540H1170L1196 582H404Z" fill="url(#s4cloth)"/><path d="M404 582H1196Q1202 690 1190 792H410Q398 690 404 582Z" fill="url(#s4cloth)" filter="url(#texPaper)"/>`;
    for (let x = 440; x < 1180; x += 60) o += `<path d="M${x} 590Q${x + 8} 690 ${x - 4} 790" stroke="#d6c7aa" stroke-width="2" fill="none" opacity=".7"/>`;
    for (let x = 410; x < 1190; x += 20) o += `<path d="M${x} 792q10 14 20 0" fill="#fbf6ea" stroke="#d8ccb4" stroke-width="1"/>`;
    o += `<path d="M404 582H1196" stroke="#d6c7aa" stroke-width="2"/>`;
    // flowers
    o += `<g transform="translate(-668 0)"><g data-hot="flowers"><path d="M1110 566Q1092 536 1100 506H1136Q1144 536 1126 566Z" fill="#9fb5c4" opacity=".9"/><path d="M1106 510H1130" stroke="#fff" opacity=".4"/><g class="sway">${A.bush(r, 1118, 470, 50, 40, 50, ['#3e5d33', '#57783f', '#7a9a5a'], 8, 14, { noBase: true })}${[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => A.rose(1082 + r() * 72, 440 + r() * 60, 1.5 + r() * .6, i % 2 ? ['#b86470', '#e08f96', '#f8cdd0'] : ['#c9a36a', '#f0d49a', '#fbecc6'])).join('')}</g></g></g>`;
    // cake glow
    o += `<rect id="cakeglow" class="noev" width="1600" height="900" fill="url(#s4cakeglow)" opacity="${H('revealed') ? 1 : 0}" style="transition:opacity 2s"/>`;
    // cake
    o += `<g data-hot="cake" id="cake">`;
    o += `<ellipse cx="800" cy="574" rx="80" ry="10" fill="#1a0f06" opacity=".3" filter="url(#b2)"/><path d="M750 572Q800 560 850 572L842 562Q800 556 758 562Z" fill="url(#s4stand)"/><path d="M788 562L784 530H816L812 562Z" fill="url(#s4stand)"/><ellipse cx="800" cy="526" rx="150" ry="20" fill="url(#s4stand)"/><ellipse cx="800" cy="522" rx="144" ry="16" fill="#f7f3ec"/>`;
    o += `<path d="M690 432V516Q800 540 910 516V432Z" fill="url(#s4frost)"/><ellipse cx="800" cy="432" rx="110" ry="18" fill="#fdf8ef"/>`;
    for (let i = 0; i < 12; i++) { const x = 696 + i * 18.5, dl = 12 + ((i * 7) % 5) * 6; o += `<path d="M${f(x - 9)} ${f(436 + Math.sin(i) * 2)}Q${f(x - 9)} ${f(440 + dl)} ${f(x)} ${f(440 + dl)}Q${f(x + 9)} ${f(440 + dl)} ${f(x + 9)} 436Z" fill="#e7a9a4"/>`; }
    o += `<ellipse cx="800" cy="432" rx="110" ry="18" fill="none" stroke="#e7a9a4" stroke-width="5"/>`;
    for (let i = 0; i < 13; i++) { const a = i / 13 * Math.PI, x = 800 - Math.cos(a) * 104, y = 514 + Math.sin(a) * 12; o += `<circle cx="${f(x)}" cy="${f(y)}" r="5" fill="#fbf2e2" stroke="#e6d7c0"/>`; }
    o += A.sym('paw', 760, 486, .5, '#e7a9a4', 'opacity=".9"') + A.sym('paw', 840, 486, .5, '#e7a9a4', 'opacity=".9"');
    o += `<path d="M898 452Q912 462 906 480Q896 470 892 458Z" fill="#fbf6ea"/>`;
    o += `<path d="M735 360V428Q800 444 865 428V360Z" fill="url(#s4frost)"/><ellipse cx="800" cy="360" rx="65" ry="12" fill="#fdf8ef"/><ellipse cx="800" cy="360" rx="65" ry="12" fill="none" stroke="#e7a9a4" stroke-width="4"/>`;
    for (let i = 0; i < 8; i++) { const x = 740 + i * 17; o += `<path d="M${x - 7} 364Q${x - 7} ${374 + (i % 3) * 7} ${x} ${374 + (i % 3) * 7}Q${x + 7} ${374 + (i % 3) * 7} ${x + 7} 364Z" fill="#e7a9a4"/>`; }
    [[740, 428], [860, 428], [700, 516], [900, 516]].forEach(([x, y]) => { o += `<circle cx="${x}" cy="${y - 8}" r="7" fill="#b8323a"/><circle cx="${x + 6}" cy="${y - 4}" r="6" fill="#9e2a33"/><path d="M${x} ${y - 15}l3 -6" stroke="#4f7a3c" stroke-width="2"/>`; });
    o += A.rose(724, 436, 1.3, ['#c9a36a', '#f0d49a', '#fbecc6']) + A.rose(878, 432, 1.2, ['#b86470', '#e08f96', '#f8cdd0']);
    const cands = [770, 785, 800, 815, 830];
    cands.forEach((x, i) => { const y = 358 + Math.abs(i - 2) * 2; o += `<rect x="${x - 3}" y="${y - 38}" width="6" height="38" rx="2" fill="${['#f1d6db', '#dfe8d6', '#f5e5bf', '#d8e0ee', '#f1d6db'][i]}"/><path d="M${x - 3} ${y - 30}l6 -4M${x - 3} ${y - 20}l6 -4M${x - 3} ${y - 10}l6 -4" stroke="#fff" opacity=".7"/><path d="M${x} ${y - 38}v-5" stroke="#3a2a1c" stroke-width="1.3"/>`; });
    o += `<g id="flames" style="opacity:${lit ? 1 : 0};transition:opacity .4s">`;
    cands.forEach((x, i) => { const y = 358 + Math.abs(i - 2) * 2 - 44; o += `<circle cx="${x}" cy="${y}" r="16" fill="#ffd27a" opacity=".35" filter="url(#b4)"/><path class="flame ${'abc'[i % 3]}" d="M${x - 4} ${y + 3}C${x - 5} ${y - 4} ${x - 1} ${y - 10} ${x} ${y - 16}C${x + 1} ${y - 10} ${x + 5} ${y - 4} ${x + 4} ${y + 3}Q${x} ${y + 7} ${x - 4} ${y + 3}Z" fill="#ffb347"/><path class="flame ${'bca'[i % 3]}" d="M${x - 2} ${y + 2}C${x - 2.5} ${y - 3} ${x} ${y - 6} ${x} ${y - 9}C${x} ${y - 6} ${x + 2.5} ${y - 3} ${x + 2} ${y + 2}Q${x} ${y + 4} ${x - 2} ${y + 2}Z" fill="#fff4c8"/>`; });
    o += `</g><g id="smoke"></g></g>`;
    // a single soft-black book on the table, next to the orange cat (opens CONFIG.book.file)
    o += `<g data-hot="book" filter="url(#dropSm)" transform="translate(1104 559)">
      <path d="M-54 -10L40 -17L60 -3L-34 5Z" fill="#35333a"/>
      <path d="M-34 5L60 -3V9L-34 17Z" fill="#efe6d2"/><path d="M-32 8L58 0M-32 11L58 3M-32 14L58 6" stroke="#cfc2a4" stroke-width=".7"/>
      <path d="M-54 -10L-34 5V17L-54 2Z" fill="#232127"/><path d="M-51 -6L-36 5M-51 0L-36 11" stroke="#c9a45a" stroke-width="1" opacity=".8"/>
      <path d="M-44 -9L34 -15L49 -4L-29 2Z" fill="none" stroke="#c9a45a" stroke-width="1" opacity=".75"/>
      <path d="M-50 -10L40 -17" stroke="#56535c" stroke-width="1.2"/>
      <text x="4" y="-3" text-anchor="middle" font-family="Palatino Linotype, Georgia, serif" font-style="italic" font-size="8.5" fill="#e3c27a" transform="rotate(-4) skewX(-18)">For ${CONFIG.name}</text>
      <path d="M26 7L27 24L31 19L35 23L34 6Z" fill="#b8323a"/>
    </g>`;
    // opened presents rest on the floor to the right of the table; click one to see it again
    const shelved = [...Array(Math.min(G.get('giftsOpened', 0), GIFTS.length)).keys()].sort((a, b) => SHELF[a][1] - SHELF[b][1]); // back row first
    for (const i of shelved) {
      o += `<g data-hot="regift${i}" class="gdone"><g transform="translate(${SHELF[i][0]} ${SHELF[i][1]}) scale(${SHELF[i][2]})">${giftArt(i, true)}</g></g>`;
    }
    // the gift-bearing cats: seated by the cake once their present is opened
    const opened = G.get('giftsOpened', 0), arrived = G.get('giftArrived', -1);
    GIFTS.forEach((gift, i) => {
      const w = gift.from || WHO[i];
      const pos = i < opened ? SEATS[w] : (i === opened && arrived === i ? SPOT_CAT : START);
      const hidden = i > opened || (i === opened && arrived !== i);
      o += `<g data-hot="gcat${i}" id="gc${i}" class="gcat" data-who="${w}" style="transform:${tf(pos)};opacity:${hidden ? 0 : 1}">${catArt(w)}</g>`;
    });
    if (opened < GIFTS.length) {
      const here = arrived === opened;
      o += `<g data-hot="gift" id="giftbox" class="gbox${here ? ' ready' : ''}" style="transform:${tf(here ? SPOT_GIFT : [START[0] + 160, SPOT_GIFT[1], 1])};opacity:${here ? 1 : 0}">${giftArt(opened)}</g>`;
    }
    // fairy lights (drawn last so they glow over everything)
    o += `<g data-hot="lights" id="lights">`;
    [[60, 70, 560, 80, 100], [560, 80, 1040, 70, 120], [1040, 70, 1540, 80, 100]].forEach(([x1, y1, x2, y2, sag], s) => {
      const pts = swag(x1, y1, x2, y2, sag, 17);
      o += `<path d="M${pts.map(p => f(p[0]) + ' ' + f(p[1])).join('L')}" stroke="#3a3228" stroke-width="1.6" fill="none"/>`;
      pts.slice(1, -1).forEach((p, i) => {
        const on = H('revealed');
        o += `<g class="bulb${on ? ' on' : ''}" data-i="${s * 20 + i}" style="--tw:${f(1.5 + ((i * 7 + s * 3) % 10) / 5)}s"><circle class="glow" cx="${f(p[0])}" cy="${f(p[1] + 9)}" r="18" fill="url(#s4bulb)"/><path d="M${f(p[0] - 1.5)} ${f(p[1])}v4h3v-4z" fill="#3a3228"/><ellipse class="core" cx="${f(p[0])}" cy="${f(p[1] + 9)}" rx="4" ry="6" fill="#6a5a3a"/></g>`;
      });
    });
    o += `</g>`;
    // darkness that lifts during the reveal
    o += `<rect id="dim" class="noev" width="1600" height="900" fill="#0d0710" opacity="${H('revealed') ? .06 : .82}"/>`;
    o += `<rect class="noev" width="1600" height="900" fill="url(#vignette)"/>`;
    return o;
  }

  /* ---------- the reveal ---------- */
  async function reveal() {
    G.busy = true;
    const W = G.wait;
    await W(1200);
    const bulbs = [...document.querySelectorAll('#lights .bulb')];
    bulbs.sort((a, b) => a.dataset.i - b.dataset.i);
    G.$('#dim').style.transition = 'opacity 3s'; G.$('#dim').style.opacity = '.45';
    for (let i = 0; i < bulbs.length; i++) {
      bulbs[i].classList.add('on');
      if (i % 4 === 0) Sound.play('twinkle');
      await W(55);
    }
    await W(600);
    G.$('#cakeglow').style.opacity = '1'; G.$('#dim').style.opacity = '.15';
    Sound.play('sparkle');
    await W(1400);
    await W(400);
    G.$('#dim').style.opacity = '.06';
    Confetti.burst(160);
    Sound.play('discover');
    Sound.setMood('party');
    await W(500);
    G.$('#finale').classList.add('show');
    G.set('revealed');
    G.busy = false;
    setTimeout(() => G.$('#finale').classList.add('settle'), 9000);
    Guide.afterMission(() => bringNext());
  }

  async function lightCandles() {
    Sound.play('strike');
    G.put('candles', 'lit');
    await G.wait(250);
    G.$('#flames').style.opacity = '1';
    G.say(`Make a wish, ${CONFIG.name}!`, 4500);
    Sound.duck(5);
  }

  async function blowCandles() {
    G.busy = true;
    Sound.play('blow');
    G.put('candles', 'out');
    G.$('#flames').style.opacity = '0';
    const smoke = G.$('#smoke');
    smoke.innerHTML = [770, 785, 800, 815, 830].map((x, i) => `<path class="smoke" style="animation-delay:${i * .08}s" d="M${x} 310Q${x - 6} 296 ${x} 282T${x} 254" stroke="#e8e0d8" stroke-width="3" fill="none" stroke-linecap="round"/>`).join('');
    await G.wait(500);
    Confetti.burst(120, false);
    Sound.play('discover');
    document.querySelectorAll('.gcat .catwrap').forEach(w => { w.classList.remove('hop'); void w.getBBox(); w.classList.add('hop'); });
    Sound.duck(13);
    Sound.play('birthdaySong');
    G.set('wished');
    await G.wait(900);
    Sound.play('meow', 1);
    G.bubble(610, 400, 'Meow. (We made this cake ourselves. Please don\'t ask how.)', 'c1', 4200);
    await G.wait(2600);
    Sound.play('meow', 2);
    G.bubble(992, 400, 'Meow! (Can we eat it now?)', 'c2', 3800);
    await G.wait(2400);
    Sound.play('meow', 3);
    G.bubble(512, 440, `Mew! Happy birthday, ${CONFIG.name}!`, 'pip', 3800);
    G.$('#replay').classList.add('show');
    G.busy = false;
  }

  const lines1 = ['Meow. (You\'re welcome, by the way.)', 'Meow. (The confetti was my idea. The mess was hers.)', 'Meow. (I planned everything. Down to the last crumb.)', 'Purrr. (Happy birthday, human.)', 'Meow. (Do not look at the cake too closely. Just enjoy it.)'];
  const linesPip = ['Mew! I hope you liked my present!', 'Purrr. This is the best party ever.', `Mew! I'm so glad I got to be your guide, ${CONFIG.name}!`];
  const lines2 = ['Meow! (Is it cake time? It\'s cake time.)', 'Meow! (I only licked ONE corner!)', 'MEOW! (I LOVE PARTIES!)', 'Mrrp! (Happy birthday!! Can I have your ribbon?)', 'Meow! (Wait — is that frosting on my nose?)'];

  G.register(4, {
    mood: 'party',
    mission: () => ({ title: 'Celebrate!', text: `Surprise! This whole party is for you, ${CONFIG.name}. Three friends are bringing you <b>presents</b>, one at a time. Click each gift box to open it. After that, light the candles on the cake and make a wish.`, button: 'Yay!' }),
    bg, fg,
    after() { Photos.start(); },
    enter(resumed) {
      if (!G.has('revealed')) { Sound.setMood('interior'); reveal(); }
      else {
        G.$('#finale').classList.add('show', 'settle');
        if (G.has('wished')) G.$('#replay').classList.add('show');
        setTimeout(() => Guide.afterMission(() => bringNext()), 1500);
      }
    },
    leave() { Photos.stop(); G.$('#finale').classList.remove('show', 'settle'); G.$('#replay').classList.remove('show'); Confetti.clear(); },
    click(id, el) {
      const say = G.say;
      switch (id) {
        case 'gift': openGift(); return;
        case 'book': {
          const book = CONFIG.book || {};
          Sound.play('page');
          if (book.file) GiftWin.open(null, 0, null, { src: 'assets/book/' + book.file, title: book.title || `A book for ${CONFIG.name}` });
          else say('This little black book is still being written... check back soon!', 3200);
          return;
        }
        case 'regift0': case 'regift1': case 'regift2': {
          const i = +id.slice(6);
          Sound.play('sparkle');
          GiftWin.open(GIFTS[i], i, null);
          return;
        }
        case 'cake':
          if (G.get('giftsOpened', 0) < GIFTS.length) { say('Presents first! The cake can wait a tiny bit longer.', 3000); return; }
          if (G.get('candles', 'out') === 'lit') blowCandles();
          else { if (G.has('wished')) say('Another wish? Why not!', 2600); lightCandles(); }
          return;
        case 'gcat0': case 'gcat1': case 'gcat2': {
          const i = +id.slice(4), who = el.dataset.who;
          const w = el.querySelector('.catwrap'); w.classList.remove('hop', 'stretch'); void w.getBBox();
          const waiting = i === G.get('giftsOpened', 0);
          const pool = who === 'pip' ? linesPip : who === 'one' ? lines1 : lines2;
          const line = waiting ? (who === 'pip' ? 'Mew! Go on, open it!' : 'Meow! (Open the present! Open it!)') : G.line(id + 'p', pool);
          const purr = line.startsWith('Purr');
          w.classList.add(purr ? 'stretch' : 'hop');
          Sound.play(purr ? 'purr' : 'meow', who === 'pip' ? 3 : who === 'one' ? 1 : 2);
          const p = waiting ? SPOT_CAT : SEATS[who];
          G.bubble(p[0], p[1] - (who === 'pip' ? 130 : 165), line, id);
          return;
        }
        case 'presents': Sound.play('rustle'); el.classList.remove('wiggle'); void el.getBBox(); el.classList.add('wiggle'); say(G.line('pr', ['The tag reads: "From the cats. Paid for by you."', 'It rattles. It sounds suspiciously like cat treats.', 'This one has tiny tooth marks on the ribbon.'])); return;
        case 'balloons': Sound.play('pop'); say(G.line('bal', ['The balloons bob politely.', 'One balloon has a small claw-shaped dent. It is holding on bravely.'])); return;
        case 'flowers': Sound.play('rustle'); say('Fresh roses — and only slightly nibbled.'); return;
        case 'lights': Sound.play('twinkle'); say('The fairy lights twinkle warmly.'); return;
        case 'photos': Sound.play('sparkle'); say(G.line('ph', ['A little frame full of happy memories.', 'Every picture here is a reason to smile.'])); return;
      }
    },
    closeups: {},
    hints() {
      const H = G.has, opened = G.get('giftsOpened', 0);
      if (opened < GIFTS.length) {
        const who = catName(GIFTS[opened].from || WHO[opened]);
        return G.get('giftArrived', -1) === opened
          ? { key: 'g' + opened + 'a', lines: ['A present, just for you!', `Click the gift box that ${who} brought you.`, `Click the wrapped gift box on the floor next to ${who} to open gift ${opened + 1}.`] }
          : { key: 'g' + opened + 'w', lines: ['Someone is on the way with a present...', 'Another friend is bringing you a gift. Watch the right side of the room!', 'Wait a moment: the next present is on its way.'] };
      }
      if (!H('wished')) return { key: 'w' + G.get('candles', 'out'), lines: G.get('candles', 'out') === 'lit'
        ? ['Make a wish... and then blow!', 'The candles are burning — blow them out.', 'Click the cake again to blow out the candles.']
        : ['Every birthday needs a wish.', 'The cake is waiting for its candles to be lit.', 'Click the cake to light the candles, then click again to blow them out.'] };
      return { key: 'end', lines: ['That is the whole adventure — happy birthday!', 'Your three presents are on the floor to the right of the table. Click any of them to enjoy it again.', 'You can replay the adventure with the small link in the top-left corner.'] };
    }
  });

  document.getElementById('replay').addEventListener('click', () => G.restart());
})();
