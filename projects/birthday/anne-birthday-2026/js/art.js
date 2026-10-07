/* Shared illustration toolkit. All artwork in the game is original vector
   illustration generated here and in the scene files. */
const A = (() => {
  const A = {};
  const f = n => Math.round(n * 10) / 10;
  A.f = f;

  A.rng = seed => {
    let s = seed % 2147483647; if (s <= 0) s += 2147483646;
    return () => (s = (s * 16807) % 2147483647) / 2147483647;
  };

  /* ---------- shared filters & gradients ---------- */
  A.defs = () => `
  <filter id="tex" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="4" seed="4" result="t"/>
    <feDiffuseLighting in="t" surfaceScale="2.2" lighting-color="#ffffff" result="l"><feDistantLight azimuth="225" elevation="58"/></feDiffuseLighting>
    <feComposite in="SourceGraphic" in2="l" operator="arithmetic" k1="1.18" k2="0" k3="0" k4="0" result="m"/>
    <feComposite in="m" in2="SourceGraphic" operator="in"/>
  </filter>
  <filter id="texStone" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="5" seed="9" result="t"/>
    <feDiffuseLighting in="t" surfaceScale="3.2" lighting-color="#ffffff" result="l"><feDistantLight azimuth="235" elevation="50"/></feDiffuseLighting>
    <feComposite in="SourceGraphic" in2="l" operator="arithmetic" k1="1.3" k2="0" k3="0" k4="0" result="m"/>
    <feComposite in="m" in2="SourceGraphic" operator="in"/>
  </filter>
  <filter id="texPaper" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="3" seed="2" result="t"/>
    <feDiffuseLighting in="t" surfaceScale="0.9" lighting-color="#ffffff" result="l"><feDistantLight azimuth="225" elevation="65"/></feDiffuseLighting>
    <feComposite in="SourceGraphic" in2="l" operator="arithmetic" k1="1.1" k2="0" k3="0" k4="0" result="m"/>
    <feComposite in="m" in2="SourceGraphic" operator="in"/>
  </filter>
  <filter id="woodV" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency="0.14 0.007" numOctaves="3" seed="3" result="t"/>
    <feColorMatrix in="t" type="matrix" values="0 0 0 0 0.16  0 0 0 0 0.09  0 0 0 0 0.04  0 0 0 1.5 -0.55" result="g"/>
    <feComposite in="g" in2="SourceGraphic" operator="atop"/>
  </filter>
  <filter id="woodH" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency="0.007 0.14" numOctaves="3" seed="5" result="t"/>
    <feColorMatrix in="t" type="matrix" values="0 0 0 0 0.16  0 0 0 0 0.09  0 0 0 0 0.04  0 0 0 1.5 -0.55" result="g"/>
    <feComposite in="g" in2="SourceGraphic" operator="atop"/>
  </filter>
  <filter id="fuzz" x="-8%" y="-8%" width="116%" height="116%">
    <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="1" seed="1" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="4" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
  <filter id="b1" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1"/></filter>
  <filter id="b2" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2"/></filter>
  <filter id="b4" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="4"/></filter>
  <filter id="b8" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="8"/></filter>
  <filter id="b16" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="16"/></filter>
  <filter id="b30" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="30"/></filter>
  <filter id="drop" x="-25%" y="-25%" width="150%" height="160%">
    <feGaussianBlur in="SourceAlpha" stdDeviation="6"/><feOffset dy="7" result="o"/>
    <feComponentTransfer><feFuncA type="linear" slope="0.45"/></feComponentTransfer>
    <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <filter id="dropSm" x="-25%" y="-25%" width="150%" height="160%">
    <feGaussianBlur in="SourceAlpha" stdDeviation="2.5"/><feOffset dy="3" result="o"/>
    <feComponentTransfer><feFuncA type="linear" slope="0.5"/></feComponentTransfer>
    <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <filter id="engrave" x="-10%" y="-10%" width="120%" height="120%">
    <feOffset in="SourceAlpha" dx="1" dy="1.4" result="o"/>
    <feFlood flood-color="#fff4dc" flood-opacity="0.55"/><feComposite in2="o" operator="in" result="hl"/>
    <feMerge><feMergeNode in="hl"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <linearGradient id="brass" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#f6dc93"/><stop offset=".35" stop-color="#c9973f"/><stop offset=".6" stop-color="#8a5f1f"/><stop offset=".85" stop-color="#d7ab58"/><stop offset="1" stop-color="#7a5118"/>
  </linearGradient>
  <linearGradient id="iron" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#5a5550"/><stop offset=".5" stop-color="#2c2926"/><stop offset="1" stop-color="#46413c"/>
  </linearGradient>
  <linearGradient id="terracotta" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#8a4424"/><stop offset=".3" stop-color="#b8653b"/><stop offset=".62" stop-color="#cf7d4f"/><stop offset="1" stop-color="#7c3b1f"/>
  </linearGradient>
  <linearGradient id="paperG" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#fbf4e2"/><stop offset=".6" stop-color="#f1e5c8"/><stop offset="1" stop-color="#e2d0aa"/>
  </linearGradient>
  <radialGradient id="vignette" cx=".5" cy=".48" r=".75">
    <stop offset=".55" stop-color="#1a0f08" stop-opacity="0"/><stop offset="1" stop-color="#1a0f08" stop-opacity=".55"/>
  </radialGradient>
  <radialGradient id="cuVignette" cx=".5" cy=".5" r=".72">
    <stop offset=".6" stop-color="#140a04" stop-opacity="0"/><stop offset="1" stop-color="#140a04" stop-opacity=".6"/>
  </radialGradient>`;

  /* ---------- foliage ---------- */
  A.leaf = (x, y, s, rot, fill, op) =>
    `<path d="M0 0Q${f(s * .5)} ${f(-s * .36)} ${f(s)} 0Q${f(s * .5)} ${f(s * .36)} 0 0Z" transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)})" fill="${fill}"${op ? ` opacity="${op}"` : ''}/>`;

  /* A lit clump of leaves; cols ordered dark -> light, light comes from upper right */
  A.bush = (r, cx, cy, rx, ry, n, cols, smin, smax, opt = {}) => {
    let o = opt.noBase ? '' : `<ellipse cx="${f(cx)}" cy="${f(cy + ry * .08)}" rx="${f(rx * .92)}" ry="${f(ry * .86)}" fill="${cols[0]}"/>`;
    for (let i = 0; i < n; i++) {
      const a = r() * Math.PI * 2, d = Math.sqrt(r());
      const x = cx + Math.cos(a) * rx * d, y = cy + Math.sin(a) * ry * d;
      const t = 0.5 + 0.38 * ((x - cx) / rx) - 0.42 * ((y - cy) / ry) + (r() - .5) * .45;
      const ci = Math.max(0, Math.min(cols.length - 1, Math.floor(t * cols.length)));
      const s = smin + r() * (smax - smin);
      const rot = opt.rot == null ? r() * 360 : opt.rot + (r() - .5) * (opt.spread || 90);
      o += A.leaf(x, y, s, rot, cols[ci]);
    }
    return o;
  };

  A.grass = (r, x, y, w, n, hmin, hmax, cols, lean = 0) => {
    let o = '';
    for (let i = 0; i < n; i++) {
      const bx = x + r() * w, h = hmin + r() * (hmax - hmin), l = (r() - .5) * h * .6 + lean * h;
      const c = cols[Math.floor(r() * cols.length)], wd = 1.6 + r() * 2.2;
      o += `<path d="M${f(bx - wd)} ${f(y)}Q${f(bx + l * .3)} ${f(y - h * .6)} ${f(bx + l)} ${f(y - h)}Q${f(bx + l * .3 + 1)} ${f(y - h * .55)} ${f(bx + wd)} ${f(y)}Z" fill="${c}"/>`;
    }
    return o;
  };

  A.rose = (x, y, s, c = ['#9c3b4a', '#c85a6a', '#eea0a8']) =>
    `<g transform="translate(${f(x)} ${f(y)}) scale(${f(s * 100) / 100})"><circle r="7" fill="${c[0]}"/><circle r="5.6" cx=".7" cy="-.8" fill="${c[1]}"/><path d="M-3.2 .4a3.2 3.2 0 1 1 3.4 3a2.2 2.2 0 1 1-2.3-2.2" fill="none" stroke="${c[0]}" stroke-width="1"/><circle r="1.7" cx="1.2" cy="-1.6" fill="${c[2]}"/></g>`;

  A.lavender = (r, x, y, h, lean = 0) => {
    let o = `<path d="M${f(x)} ${f(y)}Q${f(x + lean * .4)} ${f(y - h * .5)} ${f(x + lean)} ${f(y - h)}" stroke="#6f8a5a" stroke-width="1.6" fill="none"/>`;
    for (let k = 0; k < 7; k++) {
      const t = .45 + k * .08, px = x + lean * t * t, py = y - h * t;
      o += `<ellipse cx="${f(px - 2)}" cy="${f(py)}" rx="2.6" ry="3.6" fill="${['#7d6aa8', '#937fc0', '#6c5a96'][k % 3]}"/><ellipse cx="${f(px + 2)}" cy="${f(py - 2)}" rx="2.4" ry="3.3" fill="${['#a393cf', '#7d6aa8'][k % 2]}"/>`;
    }
    return o;
  };

  A.foxglove = (r, x, y, h, col) => {
    let o = `<path d="M${f(x)} ${f(y)}L${f(x + 3)} ${f(y - h)}" stroke="#5f7d4a" stroke-width="3"/>`;
    o += A.bush(r, x, y - 12, 26, 12, 12, ['#3f5a36', '#557547', '#6f8f58'], 16, 26, { noBase: true });
    for (let k = 0; k < 9; k++) {
      const t = .3 + k * .075, py = y - h * t, side = k % 2 ? 1 : -1;
      o += `<path d="M${f(x + 2)} ${f(py)}q${6 * side} 2 ${9 * side} 11q${-4 * side} 3 ${-8 * side} 0z" fill="${col}"/><circle cx="${f(x + 2 + 6 * side)}" cy="${f(py + 9)}" r="1.4" fill="#fff" opacity=".6"/>`;
    }
    return o;
  };

  /* ---------- masonry ---------- */
  A.stone = (r, x, y, w, h, col) => {
    const j = () => (r() - .5) * Math.min(w, h) * .22;
    const tl = [x + j(), y + j()], tr = [x + w + j(), y + j()], br = [x + w + j(), y + h + j()], bl = [x + j(), y + h + j()];
    const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
    const mt = mid(tl, tr), mr = mid(tr, br), mb = mid(br, bl), ml = mid(bl, tl);
    const P = p => `${f(p[0])} ${f(p[1])}`;
    return `<path d="M${P(mt)}Q${P(tr)} ${P(mr)}Q${P(br)} ${P(mb)}Q${P(bl)} ${P(ml)}Q${P(tl)} ${P(mt)}Z" fill="${col}"/>`;
  };
  A.stones = (r, x, y, w, h, cols, o = {}) => {
    const rh = o.rh || 34, wmin = o.wmin || 40, wmax = o.wmax || 95, gap = o.gap || 3;
    let s = '';
    for (let yy = y; yy < y + h;) {
      const hh = rh * (0.75 + r() * 0.5);
      let xx = x - r() * wmax * .6;
      while (xx < x + w) {
        const ww = wmin + r() * (wmax - wmin);
        s += A.stone(r, xx + gap, yy + gap, ww - gap * 2, hh - gap * 2, cols[Math.floor(r() * cols.length)]);
        xx += ww;
      }
      yy += hh;
    }
    return s;
  };

  /* ---------- symbols (centred, ~40 units) ---------- */
  const star = (n, R, r0) => {
    let d = '';
    for (let i = 0; i < n * 2; i++) {
      const rr = i % 2 ? r0 : R, a = -Math.PI / 2 + i * Math.PI / n;
      d += (i ? 'L' : 'M') + f(Math.cos(a) * rr) + ' ' + f(Math.sin(a) * rr);
    }
    return d + 'Z';
  };
  A.symPath = {
    sun: () => {
      let d = 'M9 0A9 9 0 1 1 -9 0A9 9 0 1 1 9 0Z';
      for (let i = 0; i < 8; i++) {
        const a = i * Math.PI / 4, c = Math.cos(a), s = Math.sin(a), p = Math.cos(a + .5 * Math.PI) * 2.6, q = Math.sin(a + .5 * Math.PI) * 2.6;
        d += `M${f(c * 12.5 + p)} ${f(s * 12.5 + q)}L${f(c * 20)} ${f(s * 20)}L${f(c * 12.5 - p)} ${f(s * 12.5 - q)}Z`;
      }
      return d;
    },
    moon: () => 'M6 -17A18 18 0 1 0 6 17A22 22 0 0 1 6 -17Z',
    star: () => star(5, 20, 8.5),
    heart: () => 'M0 17C-24 2-21-17-9-17C-4-17 0-13 0-8C0-13 4-17 9-17C21-17 24 2 0 17Z',
    crown: () => 'M-19 13L-21-10L-9 1L0-17L9 1L21-10L19 13ZM-19 15H19V19H-19Z',
    feather: () => 'M15-19C-5-16-15 2-15 14L-11 11C-9 7-3 3 3 1C-2 1-6 2-9 4C-5-2 3-5 8-6C3-7 0-7-3-6C3-11 9-14 15-19Z',
    bell: () => 'M-14 9C-14-5-9-14 0-14C9-14 14-5 14 9L18 13H-18ZM-3 14A3 3 0 0 0 3 14ZM-2-14V-18H2V-14Z',
    leaf: () => 'M-17 16C-18-6 0-19 19-17C17 5 3 18-17 16ZM-17 16L10-9L11-8L-15 17Z',
    key: () => 'M-10-8A8 8 0 1 1-10 8A8 8 0 1 1-10-8ZM-10-3.5A3.5 3.5 0 1 0-10 3.5A3.5 3.5 0 1 0-10-3.5ZM-2-2.5H19V2.5H17V9H13V2.5H10V7H6V2.5H-2Z',
    paw: () => 'M0 2C-9 2-13 11-10 15C-7 18-3 16 0 16C3 16 7 18 10 15C13 11 9 2 0 2ZM-11-4A4 5.5 0 1 0-11 7A4 5.5 0 1 0-11-4ZM11-4A4 5.5 0 1 1 11 7A4 5.5 0 1 1 11-4ZM-5-14A4.2 5.8 0 1 0-5-2A4.2 5.8 0 1 0-5-14ZM5-14A4.2 5.8 0 1 1 5-2A4.2 5.8 0 1 1 5-14Z'
  };
  A.sym = (name, x, y, s, fill, extra = '') =>
    `<path d="${A.symPath[name]()}" transform="translate(${f(x)} ${f(y)}) scale(${s})" fill="${fill}" fill-rule="evenodd" ${extra}/>`;

  /* ---------- the cats ----------
     Sitting cat, origin at bottom centre, about 230 units tall.
     o: {id, hat, bow, frosting, flip, piece} */
  A.cat = (c, o = {}) => {
    const id = o.id, tabby = c.pattern === 'tabby', tux = c.pattern === 'tuxedo', calico = c.pattern === 'calico';
    const bellyOp = tux ? 1 : .78;
    const stripe = (d, w = 4) => `<path d="${d}" stroke="${c.furDark}" stroke-width="${w}" stroke-linecap="round" fill="none" opacity=".8"/>`;
    let s = `<defs>
      <radialGradient id="${id}-b" cx=".62" cy=".28" r=".85"><stop offset="0" stop-color="${c.furLight}"/><stop offset=".5" stop-color="${c.fur}"/><stop offset="1" stop-color="${c.furDark}"/></radialGradient>
      <radialGradient id="${id}-h" cx=".6" cy=".3" r=".8"><stop offset="0" stop-color="${c.furLight}"/><stop offset=".55" stop-color="${c.fur}"/><stop offset="1" stop-color="${c.furDark}"/></radialGradient>
      <radialGradient id="${id}-e" cx=".5" cy=".62" r=".62"><stop offset="0" stop-color="#fff6c8"/><stop offset=".35" stop-color="${c.eye}"/><stop offset="1" stop-color="#2d3a12"/></radialGradient>
      <linearGradient id="${id}-w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.belly}"/><stop offset="1" stop-color="${c.belly}" stop-opacity=".85"/></linearGradient>
    </defs>`;
    s += `<g${o.flip ? ' transform="scale(-1 1)"' : ''}>`;
    s += `<ellipse cx="4" cy="2" rx="86" ry="11" fill="#1a0f06" opacity=".32" filter="url(#b4)"/>`;
    // tail
    s += `<g class="tail"><path d="M38 -10C92 -8 118 -34 106 -80C101 -100 86 -104 80 -95C94 -64 86 -34 38 -26Z" fill="url(#${id}-b)" filter="url(#fuzz)"/>`;
    if (tabby) s += stripe('M88 -40L100 -46') + stripe('M96 -62L108 -62') + stripe('M92 -84L103 -90');
    if (tux) s += `<path d="M84 -96C92 -104 104 -98 104 -86C98 -92 90 -94 84 -96Z" fill="${c.belly}"/>`;
    s += `</g>`;
    // body
    s += `<g filter="url(#fuzz)">`;
    s += `<ellipse cx="-36" cy="-38" rx="38" ry="40" fill="${c.fur}"/><ellipse cx="38" cy="-40" rx="42" ry="42" fill="url(#${id}-b)"/>`;
    s += `<path d="M-54 0C-72 -42 -60 -104 -34 -130C-20 -144 20 -144 34 -130C60 -104 72 -42 54 0Z" fill="url(#${id}-b)"/>`;
    if (tabby) s += stripe('M-50 -60Q-40 -58 -34 -66') + stripe('M-54 -84Q-44 -80 -38 -88') + stripe('M50 -62Q40 -60 34 -68') + stripe('M54 -86Q44 -82 38 -90') + stripe('M44 -30Q54 -40 70 -36', 5);
    if (calico) s += `<path d="M20 -120C50 -110 60 -70 50 -40C36 -60 22 -90 20 -120Z" fill="#d8893f" opacity=".9"/><path d="M-40 -100C-60 -80 -58 -50 -48 -30C-40 -60 -30 -80 -40 -100Z" fill="#2c2622" opacity=".85"/>`;
    s += `<path d="M-24 -122C-35 -92 -31 -42 -17 0H17C31 -42 35 -92 24 -122C10 -130 -10 -130 -24 -122Z" fill="url(#${id}-w)" opacity="${bellyOp}"/>`;
    // front legs
    s += `<path d="M-32 -64C-36 -32 -34 -10 -31 -2H-9C-7 -22 -9 -48 -12 -74Z" fill="${c.fur}"/><path d="M32 -64C36 -32 34 -10 31 -2H9C7 -22 9 -48 12 -74Z" fill="url(#${id}-b)"/>`;
    if (tux) s += `<path d="M-30 -22H-10V-2H-31Z" fill="${c.belly}"/><path d="M30 -22H10V-2H31Z" fill="${c.belly}"/>`;
    if (tabby) s += stripe('M-32 -44H-12', 3.5) + stripe('M-33 -30H-11', 3.5) + stripe('M32 -44H12', 3.5) + stripe('M33 -30H11', 3.5);
    s += `<ellipse cx="-58" cy="-4" rx="18" ry="7" fill="${c.fur}"/><ellipse cx="58" cy="-4" rx="18" ry="7" fill="${c.furLight}"/>`;
    const paw = tux ? c.belly : c.furLight;
    s += `<ellipse cx="-20" cy="-4" rx="14" ry="7" fill="${paw}"/><ellipse cx="20" cy="-4" rx="14" ry="7" fill="${paw}"/>`;
    s += `<path d="M-25 -4v4M-19 -4v4M-13 -4v4M13 -4v4M19 -4v4M25 -4v4" stroke="${c.furDark}" stroke-width="1" opacity=".5"/>`;
    s += `</g>`;
    if (o.bow) s += `<g transform="translate(0 -128)"><path d="M0 0L-20 -10V10ZM0 0L20 -10V10Z" fill="${o.bow}"/><circle r="5" fill="${o.bow}" stroke="#000" stroke-opacity=".25"/></g>`;
    // head
    s += `<g class="head"><g transform="translate(0 -150)">`;
    s += `<g filter="url(#fuzz)">`;
    s += `<path d="M-46 -14Q-50 -48 -40 -72Q-24 -52 -10 -40Z" fill="${c.fur}"/><path d="M46 -14Q50 -48 40 -72Q24 -52 10 -40Z" fill="url(#${id}-h)"/>`;
    s += `<path d="M-52 0C-56 -30 -34 -50 0 -50C34 -50 56 -30 52 0C50 22 28 36 0 36C-28 36 -50 22 -52 0Z" fill="url(#${id}-h)"/>`;
    s += `</g>`;
    s += `<path d="M-40 -22Q-42 -48 -37 -62Q-26 -48 -18 -40Z" fill="#e5a7a0" opacity=".75"/><path d="M40 -22Q42 -48 37 -62Q26 -48 18 -40Z" fill="#e5a7a0" opacity=".75"/>`;
    if (tux) s += `<path d="M-5 -30C-3 -10 -22 4 -24 18C-12 36 12 36 24 18C22 4 3 -10 5 -30Z" fill="${c.belly}"/>`;
    if (tabby) s += stripe('M-10 -46L-7 -30') + stripe('M0 -48V-31') + stripe('M10 -46L7 -30') + stripe('M-50 2Q-40 5 -33 0', 3) + stripe('M-50 12Q-40 13 -34 8', 3) + stripe('M50 2Q40 5 33 0', 3) + stripe('M50 12Q40 13 34 8', 3);
    if (calico) s += `<path d="M-50 -10C-50 -40 -20 -50 -8 -48C-14 -30 -30 -14 -50 -10Z" fill="#d8893f"/><path d="M50 -6C52 -36 30 -48 14 -48C22 -30 34 -14 50 -6Z" fill="#2c2622"/>`;
    s += `<ellipse cx="-10" cy="14" rx="12" ry="9" fill="${c.belly}" opacity="${tux ? 1 : .8}"/><ellipse cx="10" cy="14" rx="12" ry="9" fill="${c.belly}" opacity="${tux ? 1 : .8}"/>`;
    // eyes
    const eye = x => `<g transform="translate(${x} -6)"><path d="M-12 0Q0 -12 12 0Q0 11 -12 0Z" fill="url(#${id}-e)" stroke="#1a130c" stroke-width="1.6"/><ellipse class="pupil" rx="2.6" ry="8" fill="#0e0b08"/><circle cx="3.5" cy="-3.5" r="2.2" fill="#fff" opacity=".9"/><circle cx="-4" cy="3" r="1" fill="#fff" opacity=".5"/></g>`;
    s += eye(-19) + eye(19);
    s += `<g class="lids"><path d="M-31 -6Q-19 -18 -7 -6Q-19 5 -31 -6Z" fill="${tux ? c.fur : c.fur}"/><path d="M7 -6Q19 -18 31 -6Q19 5 7 -6Z" fill="${c.fur}"/></g>`;
    s += `<path d="M-5 6H5L0 12Z" fill="${c.nose}"/><path d="M0 12Q-4 19 -9 16M0 12Q4 19 9 16" stroke="#3a2a22" stroke-width="1.4" fill="none" stroke-linecap="round"/>`;
    s += `<g stroke="#fff" stroke-width=".9" opacity=".75" fill="none"><path d="M-16 14Q-40 6 -64 8M-16 17Q-40 16 -62 22M16 14Q40 6 64 8M16 17Q40 16 62 22"/></g>`;
    if (o.frosting) s += `<path d="M-4 5C-6 1 -1 -1 1 1C4 -1 8 2 5 6C3 9 -2 9 -4 5Z" fill="#fbf1e4" stroke="#e8b9b0" stroke-width=".8"/>`;
    if (o.piece) s += `<g transform="translate(0 22) rotate(-8)"><path d="M-22 -6L20 -9L24 3L16 8L-18 9L-24 2Z" fill="#f4ead2" stroke="#b69d74" stroke-width=".8"/><path d="M-14 -1H12M-12 3H8" stroke="#7a5a3a" stroke-width="1" opacity=".6"/></g>`;
    if (o.hat) {
      const tilt = o.hatTilt || -8;
      s += `<g transform="translate(${o.hatX || 6} -46) rotate(${tilt})"><path d="M-22 0L0 -64L22 0Q0 7 -22 0Z" fill="${o.hat}"/><path d="M-16 -16L14 -8M-10 -34L10 -28M-5 -50L6 -46" stroke="#fff3d6" stroke-width="3" opacity=".7"/><path d="M-22 0L0 -64L22 0" fill="none" stroke="#000" stroke-opacity=".15"/><circle cy="-66" r="7" fill="#fbecc9"/><path d="M-23 1Q0 9 23 1" stroke="#fbecc9" stroke-width="3" fill="none" stroke-dasharray="3 3"/></g>`;
    }
    s += `</g></g></g>`;
    return s;
  };

  /* ---------- inventory item art (60x60) ---------- */
  A.item = id => {
    const W = x => `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">${x}</svg>`;
    switch (id) {
      case 'letter': return W(`<g transform="rotate(-8 30 30)"><rect x="11" y="10" width="38" height="42" rx="2" fill="#f3e8cf" stroke="#b49b72"/><path d="M16 20H44M16 26H42M16 32H40M16 38H36" stroke="#6b5334" stroke-width="1.3" opacity=".55"/><circle cx="41" cy="45" r="4" fill="#a3343c"/></g>`);
      case 'key': return W(`<g transform="rotate(-35 30 30)"><circle cx="16" cy="30" r="9" fill="none" stroke="url(#brass)" stroke-width="4.5"/><path d="M24 28H52V32H24ZM44 32V40H48V32ZM38 32V37H41V32Z" fill="url(#brass)"/><circle cx="16" cy="30" r="3" fill="#8a5f1f" opacity=".4"/></g>`);
      case 'riddle': return W(`<g transform="rotate(6 30 30)"><path d="M10 12H50V50H10Z" fill="#efe2c4" stroke="#a88e62"/><path d="M10 31H50" stroke="#c9b48c"/><circle cx="36" cy="40" r="10" fill="none" stroke="#a07c5a" stroke-width="1.6" opacity=".45"/><path d="M15 19H43M15 24H38" stroke="#5b4630" stroke-width="1.2" opacity=".6"/></g>`);
      case 'giftnote': return W(`<g transform="rotate(-5 30 30)"><rect x="10" y="13" width="40" height="34" rx="2" fill="#fbf2df" stroke="#c7a57c"/><path d="${A.symPath.paw()}" transform="translate(36 34) scale(.42)" fill="#6a4a3a"/><path d="M15 21H38M15 26H32" stroke="#6b5334" stroke-width="1.2" opacity=".6"/></g>`);
      case 'pieces': return W(`<path d="M8 20L26 14L30 30L12 36Z" fill="#efe3c8" stroke="#a88e62"/><path d="M28 12L50 16L46 34L30 30Z" fill="#f6ecd6" stroke="#a88e62"/><path d="M16 38L38 32L44 50L20 52Z" fill="#f1e5cb" stroke="#a88e62"/><path d="M14 24H24M33 20H44M22 42H36" stroke="#6b5334" opacity=".5"/>`);
      case 'invite': return W(`<g transform="rotate(-4 30 30)"><rect x="8" y="14" width="44" height="32" fill="#fbf3df" stroke="#b4914f"/><rect x="11" y="17" width="38" height="26" fill="none" stroke="#c8a55c" stroke-width=".8"/><path d="M16 25H44M19 30H41M22 35H38" stroke="#6b5334" stroke-width="1.2" opacity=".6"/></g>`);
    }
    return W('');
  };

  return A;
})();
