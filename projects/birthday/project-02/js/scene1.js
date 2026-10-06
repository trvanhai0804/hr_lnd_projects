/* ===================== SCENE 1 — The Mysterious Cottage Door ===================== */
(() => {
  const f = A.f;
  const COMBO = [8, 1, 0]; // sun, moon, star — read from the sundial (8-10: Anne's birthday, 8 October)

  /* ---------- reusable pieces ---------- */
  function win(r, x, y, w, h) {
    let o = '';
    o += `<rect x="${x - 16}" y="${y - 24}" width="${w + 32}" height="20" rx="2" fill="#d9caa9" filter="url(#texStone)"/>`;
    o += `<rect x="${x - 10}" y="${y - 6}" width="${w + 20}" height="${h + 12}" fill="#c8b692"/>`;
    o += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#e6dcc6"/>`;
    const pw = (w - 21) / 2, ph = (h - 21) / 2;
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
      const px = x + 7 + i * (pw + 7), py = y + 7 + j * (ph + 7);
      o += `<rect x="${f(px)}" y="${f(py)}" width="${f(pw)}" height="${f(ph)}" fill="url(#s1glass)"/>`;
      o += `<path d="M${f(px + pw * .15)} ${f(py + ph)}L${f(px + pw * .75)} ${f(py)}H${f(px + pw * .95)}L${f(px + pw * .35)} ${f(py + ph)}Z" fill="#fff" opacity=".13"/>`;
    }
    // lace curtains tied back
    o += `<path d="M${x + 7} ${y + 7}H${x + 7 + pw * .55}Q${x + 7 + pw * .2} ${y + h * .45} ${x + 7 + pw * .35} ${y + h - 10}H${x + 7}Z" fill="#f4ecdb" opacity=".78"/>`;
    o += `<path d="M${x + w - 7} ${y + 7}H${x + w - 7 - pw * .55}Q${x + w - 7 - pw * .2} ${y + h * .45} ${x + w - 7 - pw * .35} ${y + h - 10}H${x + w - 7}Z" fill="#f4ecdb" opacity=".78"/>`;
    o += `<path d="M${x + 7} ${y + 7}H${x + w - 7}V${y + 16}Q${x + w * .75} ${y + 24} ${x + w / 2} ${y + 16}Q${x + w * .25} ${y + 24} ${x + 7} ${y + 16}Z" fill="#f7f0e0" opacity=".85"/>`;
    o += `<rect x="${x + w / 2 - 3.5}" y="${y}" width="7" height="${h}" fill="#e6dcc6"/><rect x="${x}" y="${y + h / 2 - 3.5}" width="${w}" height="7" fill="#e6dcc6"/>`;
    o += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#b9ab8f" stroke-width="2"/>`;
    // shutters
    [[x - 42, 1], [x + w + 4, -1]].forEach(([sx]) => {
      o += `<g filter="url(#woodV)"><rect x="${sx}" y="${y - 2}" width="38" height="${h + 4}" rx="2" fill="#7f9985"/></g>`;
      o += `<path d="M${sx + 12.5} ${y}V${y + h}M${sx + 25.5} ${y}V${y + h}" stroke="#5c7563" stroke-width="1.4"/>`;
      o += `<path d="M${sx + 4} ${y + 22}H${sx + 34}M${sx + 4} ${y + h - 22}H${sx + 34}M${sx + 4} ${y + 22}L${sx + 34} ${y + h - 22}" stroke="#6b8672" stroke-width="5" opacity=".75"/>`;
      o += `<path d="${A.symPath.heart()}" transform="translate(${sx + 19} ${y + h / 2}) scale(.28)" fill="#2c3027"/>`;
      o += `<rect x="${sx}" y="${y - 2}" width="38" height="${h + 4}" rx="2" fill="none" stroke="#51685a" stroke-width="1.5"/>`;
    });
    o += `<rect x="${x - 20}" y="${y + h + 4}" width="${w + 40}" height="14" rx="2" fill="#dccdae" filter="url(#texStone)"/>`;
    o += `<rect x="${x - 20}" y="${y + h + 18}" width="${w + 40}" height="8" fill="#2b1d10" opacity=".25" filter="url(#b2)"/>`;
    o += `<g filter="url(#woodH)"><rect x="${x - 8}" y="${y + h + 18}" width="${w + 16}" height="26" rx="2" fill="#8c6a4a"/></g>`;
    o += `<path d="M${x - 8} ${y + h + 31}H${x + w + 8}" stroke="#6d4f33" stroke-width="1.2" opacity=".6"/>`;
    return o;
  }

  function pot(x, by, w, h, plant, opts = {}) {
    const bw = w * .36, tw = w * .5, rh = h * .17;
    let o = `<g transform="translate(${x} ${by})">`;
    o += `<ellipse cx="3" cy="2" rx="${f(w * .5)}" ry="${f(w * .09)}" fill="#1c1208" opacity=".35" filter="url(#b2)"/>`;
    o += `<g filter="url(#tex)"><path d="M${-bw} 0Q0 5 ${bw} 0L${f(tw * .93)} ${f(-h + rh)}H${f(-tw * .93)}Z" fill="url(#terracotta)"/>`;
    o += `<rect x="${-tw}" y="${-h}" width="${tw * 2}" height="${f(rh)}" rx="3" fill="url(#terracotta)"/></g>`;
    o += `<path d="M${-tw} ${f(-h + rh)}H${tw}" stroke="#5e2b12" stroke-width="1.5" opacity=".5"/>`;
    o += `<path d="M${f(tw * .45)} ${f(-h + rh + 3)}L${f(bw * .5)} -3" stroke="#f1b58a" stroke-width="${f(w * .07)}" opacity=".22" stroke-linecap="round"/>`;
    if (opts.bands) o += `<path d="M${f(-tw * .86)} ${f(-h * .55)}Q0 ${f(-h * .5)} ${f(tw * .86)} ${f(-h * .55)}M${f(-tw * .8)} ${f(-h * .45)}Q0 ${f(-h * .4)} ${f(tw * .8)} ${f(-h * .45)}" stroke="#7a3a1e" stroke-width="1.2" fill="none" opacity=".7"/>`;
    if (opts.salt) o += `<path d="M${-bw} -2Q0 -10 ${bw} -3L${bw} 0Q0 4 ${-bw} 0Z" fill="#e8e2d0" opacity=".45"/><path d="M${f(-tw * .6)} ${f(-h * .6)}q6 8 2 18" stroke="#e8e2d0" stroke-width="3" opacity=".25" fill="none"/>`;
    if (opts.moss) o += `<path d="M${-bw} 0Q${-bw + 8} -8 ${-bw + 18} -3Q${-bw + 14} 2 ${-bw} 0Z" fill="#6f8b3a" opacity=".8"/>`;
    if (opts.moon) o += `<g filter="url(#engrave)"><path d="${A.symPath.moon()}" transform="translate(${f(bw * .2)} ${f(-h * .2)}) scale(.3)" fill="#6d3218" opacity=".9"/></g>`;
    o += `<ellipse cx="0" cy="${f(-h + 2)}" rx="${f(tw * .88)}" ry="4" fill="#3a2517"/>`;
    o += `<g transform="translate(0 ${f(-h + 2)})"><g class="sway${opts.sway ? ' ' + opts.sway : ''}">${plant}</g></g>`;
    o += `</g>`;
    return o;
  }

  const plants = {
    geranium(r) {
      let o = '';
      for (let i = 0; i < 16; i++) { const a = (r() - .5) * 2.6, d = 10 + r() * 16; o += `<circle cx="${f(Math.sin(a) * d)}" cy="${f(-Math.cos(a) * d * .7 - 4)}" r="${f(6 + r() * 4)}" fill="${['#3f6a33', '#4f7a3c', '#5e8a45'][i % 3]}"/>`; }
      for (let i = 0; i < 4; i++) {
        const cx = -22 + i * 15 + r() * 4, cy = -34 - r() * 14;
        o += `<path d="M${f(cx * .4)} -6Q${f(cx * .7)} ${f(cy * .6)} ${f(cx)} ${f(cy)}" stroke="#4f7a3c" stroke-width="1.6" fill="none"/>`;
        for (let k = 0; k < 9; k++) o += `<circle cx="${f(cx + (r() - .5) * 13)}" cy="${f(cy + (r() - .5) * 11)}" r="${f(2.6 + r() * 1.6)}" fill="${['#b8323a', '#d44a4c', '#e46f68', '#9e2a33'][k % 4]}"/>`;
      }
      return o;
    },
    lavender(r) {
      let o = A.bush(r, 0, -8, 26, 9, 14, ['#56704a', '#6d8a5c', '#86a270'], 8, 14, { rot: -90, spread: 140 });
      for (let i = 0; i < 12; i++) o += A.lavender(r, -18 + i * 3.3, -6, 34 + r() * 18, (r() - .5) * 18);
      return o;
    },
    fern(r) {
      let o = '';
      for (let i = 0; i < 9; i++) {
        const a = -2.75 + i * .245 + (r() - .5) * .12, L = 42 + r() * 16;
        const ex = Math.cos(a) * L, ey = Math.sin(a) * L * .8 - 8;
        const cx = Math.cos(a) * L * .45, cy = -L * .55;
        o += `<path d="M0 -2Q${f(cx)} ${f(cy)} ${f(ex)} ${f(ey)}" stroke="#4a6b36" stroke-width="1.4" fill="none"/>`;
        for (let k = 1; k < 9; k++) {
          const t = k / 9, px = (1 - t) * (1 - t) * 0 + 2 * (1 - t) * t * cx + t * t * ex, py = (1 - t) * (1 - t) * -2 + 2 * (1 - t) * t * cy + t * t * ey;
          const s = 9 * (1 - t * .7);
          o += A.leaf(px, py, s, a * 57 - 60, k % 2 ? '#6b8f45' : '#58803c') + A.leaf(px, py, s, a * 57 + 60, k % 2 ? '#7aa052' : '#628a42');
        }
      }
      return o;
    },
    pansy(r) {
      let o = A.bush(r, 0, -6, 22, 8, 14, ['#3f6130', '#557a40', '#6a9050'], 7, 12, { noBase: true });
      for (let i = 0; i < 6; i++) {
        const x = -16 + i * 6.5 + r() * 3, y = -12 - r() * 12;
        o += `<g transform="translate(${f(x)} ${f(y)})"><circle cx="-2.6" cy="-2.4" r="3.2" fill="#5b3c86"/><circle cx="2.6" cy="-2.4" r="3.2" fill="#5b3c86"/><circle cx="-2.8" cy="1.6" r="3" fill="#8a67b8"/><circle cx="2.8" cy="1.6" r="3" fill="#8a67b8"/><circle cy="3.4" r="3" fill="#f1cd4f"/><circle r="1" fill="#2a1a10"/></g>`;
      }
      return o;
    }
  };

  function boxFlowers(r, x, y, w) {
    let o = A.bush(r, x + w / 2, y - 4, w / 2, 12, 60, ['#3a5a30', '#4f7440', '#648c4e', '#7fa35e'], 7, 12, { noBase: true });
    for (let i = 0; i < 26; i++) {
      const px = x + r() * w, py = y - 14 + r() * 26;
      const c = ['#e9a7b7', '#f6e7ee', '#d2688a', '#f3c9d4'][i % 4];
      o += `<g transform="translate(${f(px)} ${f(py)})">${[0, 72, 144, 216, 288].map(a => `<ellipse rx="2.6" ry="1.6" cx="2.2" transform="rotate(${a})" fill="${c}"/>`).join('')}<circle r="1.1" fill="#f3d36a"/></g>`;
    }
    for (let i = 0; i < 5; i++) {
      const px = x + 8 + i * (w - 16) / 4;
      o += `<path d="M${f(px)} ${y + 8}q${f((r() - .5) * 10)} 18 ${f((r() - .5) * 6)} ${f(26 + r() * 16)}" stroke="#4f7440" stroke-width="1.4" fill="none"/>`;
      o += A.leaf(px, y + 26, 8, 70, '#5a7f45') + A.leaf(px + 2, y + 34, 7, 110, '#4f7440');
    }
    return o;
  }

  /* ---------- background (static, rendered once) ---------- */
  function bg() {
    const r = A.rng(20240924);
    let o = `<defs>
      <linearGradient id="s1sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fb3c1"/><stop offset=".42" stop-color="#d4ddcc"/><stop offset=".7" stop-color="#f4dfb4"/></linearGradient>
      <radialGradient id="s1sun" cx="1380" cy="30" r="760" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff7da"/><stop offset=".28" stop-color="#ffe7ab" stop-opacity=".6"/><stop offset="1" stop-color="#ffd98f" stop-opacity="0"/></radialGradient>
      <linearGradient id="s1lawn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8aa35a"/><stop offset=".4" stop-color="#6f8c43"/><stop offset="1" stop-color="#4a6630"/></linearGradient>
      <linearGradient id="s1wallShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1a0c" stop-opacity=".62"/><stop offset=".16" stop-color="#2a1a0c" stop-opacity=".16"/><stop offset=".8" stop-color="#2a1a0c" stop-opacity="0"/><stop offset="1" stop-color="#2a1a0c" stop-opacity=".3"/></linearGradient>
      <linearGradient id="s1wallLight" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1e1208" stop-opacity=".22"/><stop offset=".5" stop-color="#1e1208" stop-opacity="0"/><stop offset="1" stop-color="#ffe2a8" stop-opacity=".16"/></linearGradient>
      <linearGradient id="s1glass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6f878d"/><stop offset="1" stop-color="#2d3b3f"/></linearGradient>
      <linearGradient id="s1roof" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4b3329"/><stop offset="1" stop-color="#7a5343"/></linearGradient>
      <linearGradient id="s1bench" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a89379"/><stop offset="1" stop-color="#7c6852"/></linearGradient>
      <clipPath id="s1wallClip"><rect x="360" y="180" width="880" height="545"/></clipPath>
      <clipPath id="s1roofClip"><path d="M300 192L430 -40H1170L1300 192Z"/></clipPath>
      <clipPath id="s1pathClip"><path d="M672 742H928L1080 905H520Z"/></clipPath>
    </defs>`;
    // sky & light
    o += `<rect width="1600" height="900" fill="url(#s1sky)"/><rect width="1600" height="900" fill="url(#s1sun)"/>`;
    o += `<g filter="url(#b16)" opacity=".7"><ellipse cx="260" cy="120" rx="200" ry="34" fill="#fff"/><ellipse cx="1420" cy="210" rx="170" ry="26" fill="#fff8e8"/><ellipse cx="1300" cy="120" rx="120" ry="20" fill="#fff"/></g>`;
    // far trees
    o += `<g filter="url(#b4)" opacity=".92">`;
    [[120, 360, 190, 130], [330, 330, 170, 150], [1270, 340, 170, 140], [1480, 360, 200, 130], [1600, 300, 150, 160], [0, 300, 140, 160]].forEach(([x, y, rx, ry]) => {
      o += A.bush(r, x, y, rx, ry, 170, ['#6c8a80', '#7a9788', '#8ba793', '#a0b99e', '#b9cdb0'], 16, 30);
    });
    o += `</g>`;
    o += `<g filter="url(#b2)">`;
    [[260, 420, 150, 150], [1340, 420, 150, 160], [1540, 440, 150, 150], [60, 450, 150, 140]].forEach(([x, y, rx, ry]) => {
      o += A.bush(r, x, y, rx, ry, 230, ['#3d5838', '#4a6a42', '#5c7d4d', '#76955d', '#93ad72'], 14, 26);
    });
    o += `</g>`;
    // big tree trunks at the edges
    o += `<path d="M40 900C60 760 70 600 58 430C52 330 70 250 110 190L150 200C118 260 110 330 118 430C128 580 130 760 150 900Z" fill="#5a4636" filter="url(#tex)"/>`;
    o += `<path d="M100 330C160 290 210 260 290 250L292 262C220 274 170 300 112 350Z" fill="#4e3c2e"/>`;
    o += `<path d="M1570 900C1552 760 1548 600 1560 440C1566 350 1552 270 1520 210L1490 220C1514 280 1520 350 1512 440C1500 600 1500 760 1490 900Z" fill="#5c4838" filter="url(#tex)"/>`;
    // roof
    o += `<g clip-path="url(#s1roofClip)"><rect x="300" y="-40" width="1000" height="235" fill="url(#s1roof)"/><g filter="url(#tex)">`;
    for (let y = 186, row = 0; y > -60; y -= 21, row++) {
      for (let x = 290 + (row % 2) * 18; x < 1310; x += 36) {
        const c = ['#7a5444', '#6e4a3c', '#835c4a', '#694537', '#8a6450', '#75503f'][Math.floor(r() * 6)];
        o += `<path d="M${x} ${y - 24}H${x + 34}V${y - 4}Q${x + 17} ${y + 3} ${x} ${y - 4}Z" fill="${c}"/>`;
      }
    }
    o += `</g><rect x="300" y="-40" width="1000" height="235" fill="url(#s1wallShade)" opacity=".5"/>`;
    o += A.bush(r, 470, 150, 60, 18, 40, ['#4e6a38', '#667f45', '#7f9656'], 5, 9, { noBase: true });
    o += A.bush(r, 1120, 120, 70, 16, 40, ['#4e6a38', '#667f45', '#7f9656'], 5, 9, { noBase: true });
    o += `</g>`;
    o += `<rect x="296" y="184" width="1008" height="15" fill="#3f2b1f"/><rect x="296" y="184" width="1008" height="4" fill="#6b4b36"/>`;
    // wall
    o += `<g clip-path="url(#s1wallClip)"><rect x="360" y="180" width="880" height="545" fill="#8a7860"/>`;
    o += `<g filter="url(#texStone)">${A.stones(r, 360, 196, 880, 530, ['#cdbb9c', '#c2ae8e', '#d6c6a8', '#b9a585', '#c9b596', '#bfae93', '#d2c0a0', '#b3a07f'], { rh: 36, wmin: 44, wmax: 100 })}</g>`;
    o += `<rect x="360" y="180" width="880" height="545" fill="url(#s1wallShade)"/><rect x="360" y="180" width="880" height="545" fill="url(#s1wallLight)"/>`;
    o += `</g>`;
    o += `<rect x="352" y="196" width="10" height="530" fill="#2a1a0c" opacity=".3" filter="url(#b4)"/>`;
    // name plaque
    o += `<g transform="translate(800 240)"><ellipse rx="62" ry="22" fill="#2a1a0c" opacity=".3" filter="url(#b2)" cy="3"/><ellipse rx="60" ry="21" fill="#efe6d2" stroke="#6f8a7c" stroke-width="3"/><ellipse rx="54" ry="16" fill="none" stroke="#6f8a7c" stroke-width="1"/><text y="6" text-anchor="middle" font-family="Segoe Script, Segoe Print, cursive" font-size="17" fill="#4d6a5d">Rose Cottage</text></g>`;
    // door arch surround
    o += `<path d="M650 706V440A150 150 0 0 1 950 440V706Z" fill="#8a7860"/>`;
    let arch = '';
    const N = 13, cx = 800, cy = 440;
    for (let i = 0; i < N; i++) {
      const a0 = Math.PI + i * Math.PI / N + .012, a1 = Math.PI + (i + 1) * Math.PI / N - .012;
      const R = i === 6 ? 158 : 146, ri = 106;
      const p = (a, rr) => `${f(cx + Math.cos(a) * rr)} ${f(cy + Math.sin(a) * rr)}`;
      arch += `<path d="M${p(a0, ri)}L${p(a0, R)}A${R} ${R} 0 0 1 ${p(a1, R)}L${p(a1, ri)}A${ri} ${ri} 0 0 0 ${p(a0, ri)}Z" fill="${['#d8c9ab', '#cdbd9d', '#e0d2b6', '#c9b797'][i % 4]}"/>`;
    }
    for (let y = 442, k = 0; y < 700; y += 44, k++) {
      const wl = k % 2 ? 40 : 52;
      arch += `<rect x="${695 - wl}" y="${y}" width="${wl - 2}" height="42" rx="3" fill="${['#d3c4a5', '#dccdb0', '#c8b696'][k % 3]}"/>`;
      arch += `<rect x="${907}" y="${y}" width="${wl - 2}" height="42" rx="3" fill="${['#dccdb0', '#c8b696', '#d3c4a5'][k % 3]}"/>`;
    }
    o += `<g filter="url(#texStone)">${arch}</g>`;
    o += `<path d="M695 706V440A105 105 0 0 1 905 440V706Z" fill="#23170f"/>`;
    // windows
    o += win(r, 400, 330, 140, 160) + win(r, 1060, 330, 140, 160);
    // ivy on wall edges
    o += `<g>`;
    for (let y = 700; y > 260; y -= 26) o += A.bush(r, 372 + r() * 20, y, 26, 20, 16, ['#2f4a2a', '#3e5d33', '#4f7040', '#62834b'], 8, 13, { noBase: true });
    for (let y = 700; y > 380; y -= 28) o += A.bush(r, 1228 - r() * 18, y, 24, 20, 14, ['#2f4a2a', '#3e5d33', '#4f7040', '#62834b'], 8, 13, { noBase: true });
    o += `</g>`;
    // climbing roses around the door
    let vine = '';
    const vp = [];
    for (let y = 706; y > 450; y -= 24) vp.push([638 - r() * 10, y]);
    for (let a = 188; a <= 345; a += 9) { const rad = a * Math.PI / 180, R = 166 + r() * 12; vp.push([800 + Math.cos(rad) * R, 440 + Math.sin(rad) * R]); }
    for (let y = 420; y < 560; y += 26) vp.push([966 + r() * 8, y]);
    vine += `<path d="M${vp.map(p => f(p[0]) + ' ' + f(p[1])).join('L')}" stroke="#5a4430" stroke-width="4" fill="none" opacity=".8"/>`;
    vine += `<g filter="url(#b4)" opacity=".4" transform="translate(8 10)">${vp.map(p => `<ellipse cx="${f(p[0])}" cy="${f(p[1])}" rx="30" ry="20" fill="#1b1208"/>`).join('')}</g>`;
    vp.forEach(p => { vine += A.bush(r, p[0], p[1], 32, 24, 22, ['#2b4527', '#3a5a31', '#4d7040', '#628650', '#7a9c5e'], 9, 15, { noBase: true }); });
    vp.forEach((p, i) => { if (i % 2 === 0 || r() > .5) vine += A.rose(p[0] + (r() - .5) * 30, p[1] + (r() - .5) * 20, .9 + r() * .6, r() > .5 ? ['#a4485a', '#d0737f', '#f2b7bb'] : ['#b86470', '#e08f96', '#f8cdd0']); });
    o += vine;
    // lawn
    o += `<path d="M0 700H1600V900H0Z" fill="url(#s1lawn)"/>`;
    o += `<g filter="url(#b8)" opacity=".5">`;
    for (let i = 0; i < 22; i++) o += `<ellipse cx="${f(r() * 1600)}" cy="${f(740 + r() * 160)}" rx="${f(40 + r() * 80)}" ry="${f(8 + r() * 14)}" fill="${r() > .5 ? '#a7bd6b' : '#3f5a27'}"/>`;
    o += `</g>`;
    o += A.grass(r, 0, 900, 1600, 900, 8, 22, ['#5d7a39', '#6f8d45', '#86a352', '#4e6a30', '#9ab562']);
    o += A.grass(r, 0, 790, 1600, 500, 5, 14, ['#6f8d45', '#86a352', '#9ab562', '#7a9448']);
    // flower beds along the wall
    o += `<path d="M356 700Q500 690 652 700V730Q500 736 356 730Z" fill="#4a3322"/><path d="M948 700Q1100 690 1244 700V730Q1100 736 948 730Z" fill="#4a3322"/>`;
    [[380, 712], [1220, 712]].forEach(([x, y]) => { o += A.foxglove(r, x, y, 150, '#c887b5'); o += A.foxglove(r, x + 22, y + 4, 120, '#e0a8cf'); });
    for (let x = 440; x < 620; x += 11) o += A.lavender(r, x, 722, 40 + r() * 20, (r() - .5) * 12);
    for (let x = 1000; x < 1170; x += 11) o += A.lavender(r, x, 722, 40 + r() * 20, (r() - .5) * 12);
    o += A.bush(r, 612, 712, 34, 20, 40, ['#2f4a2a', '#3e5d33', '#57783f', '#6f914f'], 8, 13);
    o += A.bush(r, 1190, 712, 34, 22, 40, ['#2f4a2a', '#3e5d33', '#57783f', '#6f914f'], 8, 13);
    // hydrangeas at the corners of the house
    [[340, 690, '#9fb3d8', '#c2cfe8'], [1265, 690, '#c7a3cf', '#e2cbe6']].forEach(([x, y, a, b]) => {
      o += A.bush(r, x, y, 60, 45, 90, ['#2f4a2a', '#3e5d33', '#4f7040', '#62834b'], 12, 20);
      for (let i = 0; i < 6; i++) { const hx = x - 40 + r() * 80, hy = y - 30 + r() * 40; for (let k = 0; k < 14; k++) o += `<circle cx="${f(hx + (r() - .5) * 22)}" cy="${f(hy + (r() - .5) * 18)}" r="${f(3 + r() * 2)}" fill="${k % 3 ? a : b}"/>`; }
    });
    // stone path & steps
    o += `<path d="M672 742H928L1080 905H520Z" fill="#5d6a3e"/>`;
    let ps = '';
    for (let y = 745, k = 0; y < 905; k++) {
      const hh = 20 + k * 7, t0 = (y - 742) / 163, t1 = (y + hh - 742) / 163;
      const xl = 672 - 152 * ((t0 + t1) / 2), xr = 928 + 152 * ((t0 + t1) / 2);
      let x = xl - r() * 30;
      while (x < xr) { const w = 60 + r() * 70 + k * 10; ps += A.stone(r, x + 4, y + 3, w - 8, hh - 6, ['#b6ad99', '#a79d88', '#c3baa5', '#9c927e', '#b0a690'][Math.floor(r() * 5)]); x += w; }
      y += hh;
    }
    o += `<g clip-path="url(#s1pathClip)"><g filter="url(#texStone)">${ps}</g></g>`;
    o += A.grass(r, 540, 905, 520, 120, 4, 10, ['#6f8d45', '#86a352']);
    o += `<g filter="url(#texStone)"><path d="M662 706H938L946 724H654Z" fill="#c9bea8"/><path d="M654 724H946V744H654Z" fill="#aca18b"/><path d="M640 724H960L968 744H632Z" fill="#b8ad97"/><path d="M632 744H968V762H632Z" fill="#978c77"/></g>`;
    o += `<path d="M632 762H968" stroke="#2a1d10" stroke-width="3" opacity=".35" filter="url(#b2)"/>`;
    // bench (weathered wood)
    o += `<ellipse cx="365" cy="742" rx="190" ry="16" fill="#1f1508" opacity=".35" filter="url(#b8)"/>`;
    let bench = '';
    bench += `<path d="M226 560L232 740H246L242 560Z" fill="#6b5842"/><path d="M488 560L484 740H498L504 560Z" fill="#6b5842"/>`;
    for (let i = 0; i < 12; i++) bench += `<rect x="${f(250 + i * 20)}" y="570" width="12" height="44" fill="${['#9a8570', '#8e7962', '#a38e76'][i % 3]}"/>`;
    bench += `<path d="M220 548Q365 536 510 548V568Q365 558 220 568Z" fill="url(#s1bench)"/><path d="M220 548Q365 536 510 548" stroke="#c4b297" stroke-width="2" fill="none"/>`;
    bench += `<path d="M236 614H494L508 638H222Z" fill="#8a7560"/>`;
    for (let i = 0; i < 4; i++) bench += `<path d="M${226 + i * 1} ${618 + i * 6}H${504 - i}" stroke="#5c4a37" stroke-width="1.2" opacity=".7"/>`;
    bench += `<path d="M222 638H508V650H222Z" fill="#6f5c47"/>`;
    bench += `<path d="M236 650L232 742H248L252 650ZM478 650L482 742H498L494 650Z" fill="#5d4b39"/>`;
    bench += `<path d="M210 600Q222 590 240 596L244 606Q224 604 214 612Z" fill="#8e7962"/><path d="M520 600Q508 590 490 596L486 606Q506 604 516 612Z" fill="#8e7962"/>`;
    bench += `<path d="M212 606L220 700H232L224 606ZM518 606L510 700H498L506 606Z" fill="#6b5842"/>`;
    o += `<g filter="url(#woodH)">${bench}</g>`;
    for (let i = 0; i < 26; i++) o += `<circle cx="${f(226 + r() * 280)}" cy="${f(548 + r() * 100)}" r="${f(1 + r() * 2.4)}" fill="${r() > .5 ? '#c7cf95' : '#d9d7b4'}" opacity=".7"/>`;
    // round table + chair (right)
    o += `<ellipse cx="1360" cy="728" rx="120" ry="14" fill="#1f1508" opacity=".35" filter="url(#b8)"/>`;
    o += `<g filter="url(#woodV)"><path d="M1420 520L1426 725H1436L1432 520Z" fill="#6b5842"/><path d="M1402 560H1448V600H1402Z" fill="#8a7560"/><path d="M1320 640L1300 726H1312L1334 640ZM1400 640L1420 726H1408L1386 640ZM1356 646L1358 732H1368L1366 646Z" fill="#6b5842"/></g>`;
    o += `<g filter="url(#woodH)"><ellipse cx="1360" cy="628" rx="96" ry="26" fill="#9a8468"/><path d="M1264 628A96 26 0 0 0 1456 628V638A96 26 0 0 1 1264 638Z" fill="#6f5c47"/></g>`;
    o += `<ellipse cx="1360" cy="626" rx="86" ry="21" fill="none" stroke="#b9a68a" stroke-width="1" opacity=".6"/>`;
    // shadows for foreground objects
    o += `<ellipse cx="1190" cy="800" rx="70" ry="10" fill="#1f1508" opacity=".4" filter="url(#b4)"/>`;
    // daisies in the lawn
    for (let i = 0; i < 40; i++) {
      const x = r() * 1600, y = 770 + r() * 125;
      if (x > 520 && x < 1080 && y > 740) continue;
      o += `<g transform="translate(${f(x)} ${f(y)})">${[0, 60, 120, 180, 240, 300].map(a => `<ellipse rx="2.8" ry="1.2" cx="2.6" transform="rotate(${a})" fill="#fbf6ea"/>`).join('')}<circle r="1.3" fill="#f0c23e"/></g>`;
    }
    return o;
  }

  /* ---------- foreground (interactive + animated) ---------- */
  function fg() {
    const r = A.rng(777);
    const H = G.has;
    let o = `<defs>
      <linearGradient id="s1doorShade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0e0a06" stop-opacity=".45"/><stop offset=".25" stop-color="#0e0a06" stop-opacity=".1"/><stop offset=".85" stop-color="#fff0c8" stop-opacity=".08"/><stop offset="1" stop-color="#0e0a06" stop-opacity=".2"/></linearGradient>
      <radialGradient id="s1warm" cx="800" cy="560" r="220" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff5d6"/><stop offset=".45" stop-color="#ffd48a"/><stop offset="1" stop-color="#a45a22"/></radialGradient>
      <linearGradient id="s1ray" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff4cf" stop-opacity=".55"/><stop offset="1" stop-color="#fff4cf" stop-opacity="0"/></linearGradient>
      <radialGradient id="s1spill" cx=".5" cy="0" r="1"><stop offset="0" stop-color="#ffdc98" stop-opacity=".75"/><stop offset="1" stop-color="#ffdc98" stop-opacity="0"/></radialGradient>
      <linearGradient id="s1bronze" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9fb89f"/><stop offset=".4" stop-color="#6f9481"/><stop offset=".7" stop-color="#8a6e3e"/><stop offset="1" stop-color="#557a68"/></linearGradient>
      <clipPath id="s1doorClip"><path d="M697 706V440A103 103 0 0 1 903 440V706Z"/></clipPath>
    </defs>`;
    // doorway (visible once the door swings open)
    o += `<g id="doorway" opacity="${H('doorOpen') ? 1 : 0}"><path d="M697 706V440A103 103 0 0 1 903 440V706Z" fill="url(#s1warm)"/>
      <path d="M740 706V600H860V706" fill="#b97a3c" opacity=".35"/><rect x="760" y="470" width="80" height="70" rx="4" fill="#fff8e0" opacity=".5"/></g>`;
    // the door
    o += `<g id="door" data-hot="door"><g id="doorLeaf" class="${H('doorOpen') ? 'open' : ''}">`;
    o += `<g clip-path="url(#s1doorClip)"><g filter="url(#woodV)">`;
    ['#56776e', '#4f6f67', '#5b7d73', '#4a6961', '#557469', '#50716a'].forEach((c, i) => { o += `<rect x="${697 + i * 34.4}" y="330" width="34.6" height="380" fill="${c}"/>`; });
    o += `</g>`;
    for (let i = 1; i < 6; i++) o += `<path d="M${f(697 + i * 34.4)} 330V706" stroke="#2c3f3a" stroke-width="2"/><path d="M${f(698.5 + i * 34.4)} 330V706" stroke="#86a39a" stroke-width=".8" opacity=".5"/>`;
    for (let i = 0; i < 30; i++) o += `<ellipse cx="${f(700 + r() * 200)}" cy="${f(350 + r() * 350)}" rx="${f(2 + r() * 8)}" ry="${f(1 + r() * 3)}" fill="#a8835c" opacity=".45"/>`;
    o += `<rect x="690" y="330" width="220" height="380" fill="url(#s1doorShade)"/></g>`;
    // iron straps
    const strap = y => `<path d="M699 ${y - 7}H838Q852 ${y} 838 ${y + 7}H699Z" fill="url(#iron)"/><circle cx="848" cy="${y}" r="5" fill="url(#iron)"/>${[712, 742, 772, 802].map(x => `<circle cx="${x}" cy="${y}" r="2.4" fill="#6a645c"/>`).join('')}`;
    o += strap(470) + strap(640);
    // little grille window
    o += `<circle cx="800" cy="404" r="27" fill="#3c2c1e"/><circle cx="800" cy="404" r="22" fill="#1c2527"/><path d="M800 382V426M778 404H822" stroke="url(#iron)" stroke-width="3.5"/><circle cx="800" cy="404" r="22" fill="none" stroke="url(#iron)" stroke-width="3"/><path d="M787 395L798 386" stroke="#fff" stroke-width="3" opacity=".2" stroke-linecap="round"/>`;
    o += `<path d="M697 706V440A103 103 0 0 1 903 440V706" fill="none" stroke="#243632" stroke-width="3"/>`;
    // handle and keyhole
    o += `<rect x="863" y="520" width="20" height="92" rx="9" fill="url(#iron)"/>`;
    o += `<g id="handle"><circle cx="873" cy="545" r="6" fill="#57514a"/><path d="M873 541Q860 540 840 546Q834 550 840 553Q860 551 873 550Z" fill="url(#iron)"/><path d="M842 547Q858 544 870 543" stroke="#8a847a" stroke-width="1" opacity=".7"/></g>`;
    o += `<g transform="translate(873 588)"><circle r="7" fill="#57514a"/><path d="M0 -4A3.4 3.4 0 0 1 2 2L3 10H-3L-2 2A3.4 3.4 0 0 1 0 -4Z" fill="#0c0806"/></g>`;
    o += `</g></g>`;
    // light spill when open
    o += `<path id="spill" d="M697 706H903L1000 860H600Z" fill="url(#s1spill)" opacity="${H('doorOpen') ? .9 : 0}" style="mix-blend-mode:screen;transition:opacity 2s" class="noev"/>`;
    // muddy paw prints on the steps
    o += `<g data-hot="paws">${[[716, 732, -10], [744, 718, 8], [888, 752, -6], [862, 738, 10]].map(([x, y, a]) => `<path d="${A.symPath.paw()}" transform="translate(${x} ${y}) rotate(${a}) scale(.26 .16)" fill="#5b4330" opacity=".55"/>`).join('')}<rect x="700" y="708" width="200" height="54" fill="transparent"/></g>`;
    // wall lantern
    o += `<g data-hot="lantern" transform="translate(985 340)"><path d="M-2 -40H18V-36H2V-6H-2Z" fill="url(#iron)"/><path d="M8 -36Q12 -30 8 -24" stroke="#2c2926" stroke-width="2" fill="none"/>
      <path d="M-4 -24H20L16 -20H0Z" fill="url(#iron)"/><rect x="0" y="-20" width="16" height="28" fill="#f4dca0" opacity=".35"/><ellipse class="flicker" cx="8" cy="-2" rx="3" ry="6" fill="#ffd27a"/><circle class="flicker" cx="8" cy="-4" r="14" fill="#ffcf73" opacity=".25" filter="url(#b4)"/>
      <path d="M0 -20V8M16 -20V8M8 -20V8" stroke="url(#iron)" stroke-width="1.6"/><path d="M-4 8H20L16 13H0Z" fill="url(#iron)"/><path d="M0 -24L8 -32L16 -24" fill="url(#iron)"/></g>`;
    // window hotspots with flowers in the window boxes
    o += `<g data-hot="window"><rect x="400" y="330" width="140" height="160" fill="transparent"/></g><g data-hot="window2"><rect x="1060" y="330" width="140" height="160" fill="transparent"/></g>`;
    o += `<g class="sway b">${boxFlowers(r, 396, 510, 148)}</g><g class="sway c">${boxFlowers(r, 1056, 510, 148)}</g>`;
    // a few swaying roses over the arch
    o += `<g data-hot="roses" class="sway">${[[700, 300], [735, 292], [880, 298], [650, 360]].map(([x, y]) => A.bush(r, x, y, 18, 12, 10, ['#3a5a31', '#4d7040', '#628650'], 8, 13, { noBase: true }) + A.rose(x, y, 1.4, ['#a4485a', '#d0737f', '#f2b7bb'])).join('')}</g>`;
    // pots (A: geranium, B: lavender, C: fern on plinth with the moon, D: pansies)
    o += `<g data-hot="potA">${pot(628, 716, 62, 58, plants.geranium(A.rng(3)), { bands: true })}</g>`;
    o += `<g data-hot="potB">${pot(974, 716, 58, 52, plants.lavender(A.rng(4)), { salt: true, sway: 'b' })}</g>`;
    o += `<g data-hot="potC"><g filter="url(#texStone)"><path d="M526 756H602L606 796H522Z" fill="#b3a88f"/><path d="M522 756H606V762H522Z" fill="#cfc4ab"/></g><path d="M532 770H596V790H532Z" fill="none" stroke="#7e7460" stroke-width=".8" opacity=".5"/>${pot(564, 758, 58, 54, plants.fern(A.rng(5)), { moon: true, moss: true, sway: 'c' })}</g>`;
    o += `<g data-hot="potD">${pot(1098, 800, 48, 42, plants.pansy(A.rng(6)), { salt: true })}</g>`;
    // book on the bench
    o += `<g data-hot="book" filter="url(#dropSm)">
      <path d="M316 626L408 618L422 630L330 639Z" fill="#6b2f2a"/><path d="M322 626L404 619" stroke="#caa35a" stroke-width="1" opacity=".7"/><path d="M330 632L412 624" stroke="#caa35a" stroke-width=".8" opacity=".5"/>
      <path d="M330 639L422 630V640L330 649Z" fill="#eadcc0"/><path d="M332 642L420 633.5M332 645L420 636.5" stroke="#b8a582" stroke-width=".6"/>
      <path d="M316 626L330 639V649L316 636Z" fill="#4c1f1c"/>
      ${H('letter') ? '' : '<path id="envCorner" d="M414 628.5L428 623L423 634.5Z" fill="#f7eedb" stroke="#bda97f" stroke-width=".7"/>'}
      <g transform="translate(372 616) rotate(-6)"><circle cx="-9" r="6" fill="none" stroke="#3a2a1c" stroke-width="1.3"/><circle cx="9" r="6" fill="none" stroke="#3a2a1c" stroke-width="1.3"/><path d="M-3 0Q0 -3 3 0" stroke="#3a2a1c" stroke-width="1.2" fill="none"/><circle cx="-7" cy="-2" r="2" fill="#fff" opacity=".35"/></g>
    </g>`;
    // tartan blanket on the bench
    o += `<g data-hot="blanket"><path d="M232 612Q260 600 300 606L304 640Q296 668 300 690L262 694Q256 664 248 640Q236 632 232 612Z" fill="#8e3b36"/>
      <path d="M244 612L256 692M270 606L280 694M292 606L298 690" stroke="#2f4b3f" stroke-width="5" opacity=".6"/><path d="M236 626Q270 620 302 626M246 652Q274 648 302 652M252 676Q276 674 300 676" stroke="#2f4b3f" stroke-width="4" opacity=".55"/>
      <path d="M244 612L256 692M270 606L280 694" stroke="#e8c867" stroke-width="1" opacity=".6"/><path d="M262 694L266 704M272 694L274 704M282 693L284 703M292 692L294 702" stroke="#8e3b36" stroke-width="2"/></g>`;
    // teapot and cup
    o += `<g data-hot="teapot"><ellipse cx="1340" cy="624" rx="36" ry="6" fill="#2a1a0c" opacity=".3" filter="url(#b2)"/>
      <path d="M1312 596Q1302 580 1292 584Q1290 590 1300 596Q1306 606 1312 612Z" fill="#efe8da" stroke="#b9ae98" stroke-width="1"/><path d="M1368 590Q1386 590 1382 606Q1378 616 1366 614" stroke="#e6dece" stroke-width="5" fill="none"/>
      <ellipse cx="1340" cy="602" rx="30" ry="22" fill="#f3ede1"/><ellipse cx="1332" cy="596" rx="16" ry="11" fill="#fff" opacity=".6"/><path d="M1314 606Q1340 616 1366 606" stroke="#6f8fb8" stroke-width="2" fill="none" opacity=".7"/>
      ${[1326, 1340, 1354].map(x => `<circle cx="${x}" cy="603" r="3.2" fill="#6f8fb8" opacity=".75"/>`).join('')}<ellipse cx="1340" cy="581" rx="14" ry="4" fill="#e6dece"/><circle cx="1340" cy="575" r="4" fill="#e6dece"/>
      <ellipse cx="1400" cy="622" rx="18" ry="5" fill="#ede5d6" stroke="#c1b59e" stroke-width=".8"/><path d="M1390 606H1410Q1410 622 1400 622Q1390 622 1390 606Z" fill="#f3ede1"/><ellipse cx="1400" cy="606" rx="10" ry="3" fill="#8a5a33"/></g>`;
    // sundial
    o += `<g data-hot="sundial"><g filter="url(#texStone)"><path d="M1136 780H1224L1230 800H1130Z" fill="#b2a78f"/><path d="M1158 684H1202L1206 780H1154Z" fill="#c4b99f"/><path d="M1146 668H1214L1208 684H1152Z" fill="#cfc4aa"/></g>
      <path d="M1168 690V776M1180 690V778M1192 690V776" stroke="#8d846e" stroke-width="1.4" opacity=".6"/><rect x="1154" y="684" width="52" height="96" fill="url(#s1wallLight)"/>
      <ellipse cx="1180" cy="664" rx="56" ry="15" fill="url(#s1bronze)" stroke="#4e6a58" stroke-width="1.5"/><ellipse cx="1180" cy="664" rx="44" ry="11" fill="none" stroke="#3f5a49" stroke-width=".8" opacity=".7"/>
      <path d="M1180 664L1180 642L1206 664Z" fill="#6c8b77" stroke="#3f5a49" stroke-width="1"/><path d="M1180 664L1150 669" stroke="#2c3a2e" stroke-width="2" opacity=".35"/>
      ${G.get('moss', [0, 0, 0]).map((m, i) => m ? '' : `<ellipse cx="${[1150, 1178, 1208][i]}" cy="${[663, 670, 662][i]}" rx="9" ry="4" fill="#5f7d32" opacity=".9"/>`).join('')}</g>`;
    // snail on the path
    o += `<g data-hot="snail" class="snail"><g transform="translate(760 842)"><path d="M-14 4Q0 6 16 3L20 -2Q14 -3 12 0Z" fill="#b69f86"/><path d="M16 -1L20 -9M18 -1L24 -7" stroke="#9d876e" stroke-width="1.4"/><circle cx="0" cy="-5" r="9" fill="#8f6440"/><path d="M0 -5m-5 0a5 5 0 1 1 5 5a3 3 0 1 1 -3 -3" fill="none" stroke="#5e3f25" stroke-width="1.4"/></g></g>`;
    // foreground framing: canopy and grass that sway
    o += `<g class="noev">`;
    o += `<g class="swayTop">${A.bush(A.rng(41), 90, 40, 260, 120, 260, ['#2c4526', '#3a5a31', '#4d7040', '#62864f', '#7c9f60'], 16, 30)}</g>`;
    o += `<g class="swayTop" style="animation-delay:-3s">${A.bush(A.rng(42), 1540, 30, 220, 110, 220, ['#2c4526', '#3a5a31', '#4d7040', '#62864f', '#86a868'], 16, 30)}</g>`;
    o += `<g class="sway">${A.grass(A.rng(43), -20, 905, 230, 70, 30, 90, ['#3f5a28', '#4f6d33', '#62823f'], .1)}</g>`;
    o += `<g class="sway b">${A.grass(A.rng(44), 1400, 905, 220, 70, 30, 90, ['#3f5a28', '#4f6d33', '#62823f'], -.1)}</g>`;
    o += `<g class="sway c">${[[60, 830], [120, 850], [1490, 840], [1540, 820]].map(([x, y]) => `<path d="M${x} 905Q${x + 4} ${y + 20} ${x} ${y}" stroke="#4f6d33" stroke-width="2" fill="none"/>` + A.rose(x, y, 1.2, ['#c3874a', '#e8b36a', '#f7dca0'])).join('')}</g>`;
    o += `</g>`;
    // light: sun rays, motes, butterflies
    o += `<g class="noev"><g class="rays"><path d="M1600 0L1250 0L620 900H900Z" fill="url(#s1ray)" opacity=".35"/><path d="M1600 60L1450 0L1000 900H1150Z" fill="url(#s1ray)" opacity=".3"/><path d="M1320 0L1200 0L300 900H430Z" fill="url(#s1ray)" opacity=".18"/></g>`;
    for (let i = 0; i < 18; i++) o += `<circle class="mote" cx="${f(500 + r() * 1000)}" cy="${f(250 + r() * 500)}" r="${f(1 + r() * 1.6)}" fill="#fff6d0" style="animation-delay:${f(-r() * 14)}s;animation-duration:${f(10 + r() * 8)}s"/>`;
    const bfly = (id, c1, c2) => `<g id="${id}" class="bfly"><g class="wing l"><path d="M0 0C-8 -14 -22 -14 -20 -2C-19 5 -8 6 0 0Z" fill="${c1}"/><path d="M0 0C-6 6 -14 12 -9 15C-4 16 -1 8 0 0Z" fill="${c2}"/></g><g class="wing r"><path d="M0 0C8 -14 22 -14 20 -2C19 5 8 6 0 0Z" fill="${c1}"/><path d="M0 0C6 6 14 12 9 15C4 16 1 8 0 0Z" fill="${c2}"/></g><path d="M0 -5V9" stroke="#2a1a10" stroke-width="2" stroke-linecap="round"/></g>`;
    o += bfly('bf1', '#f0c05a', '#e39a3c') + bfly('bf2', '#dfe6f4', '#b8c6e6');
    o += `<rect width="1600" height="900" fill="url(#vignette)"/></g>`;
    return o;
  }

  /* ---------- butterflies ---------- */
  let raf = 0;
  function flutter() {
    cancelAnimationFrame(raf);
    const b1 = document.getElementById('bf1'), b2 = document.getElementById('bf2');
    if (!b1) return;
    const t0 = performance.now();
    const step = now => {
      const t = (now - t0) / 1000;
      const p1 = [520 + Math.sin(t * .23) * 300 + Math.sin(t * 1.3) * 30, 480 + Math.sin(t * .37) * 120 + Math.cos(t * 2.1) * 18];
      const p2 = [1100 + Math.sin(t * .19 + 2) * 260 + Math.sin(t * 1.7) * 26, 560 + Math.cos(t * .31) * 140 + Math.sin(t * 2.3) * 16];
      b1.setAttribute('transform', `translate(${f(p1[0])} ${f(p1[1])}) rotate(${f(Math.cos(t * .23) * 30)}) scale(.9)`);
      b2.setAttribute('transform', `translate(${f(p2[0])} ${f(p2[1])}) rotate(${f(-Math.cos(t * .19) * 30)}) scale(.75)`);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  }

  /* ---------- close-up art ---------- */
  function cuBench(extra) {
    let o = `<defs><linearGradient id="c1plank" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a28c72"/><stop offset="1" stop-color="#7a6650"/></linearGradient>
      <radialGradient id="c1sun" cx=".75" cy=".1" r=".9"><stop offset="0" stop-color="#fff0c4" stop-opacity=".45"/><stop offset="1" stop-color="#fff0c4" stop-opacity="0"/></radialGradient></defs>`;
    o += `<rect width="1000" height="650" fill="#3f3226"/><g filter="url(#woodH)">`;
    for (let i = 0; i < 6; i++) o += `<rect x="-10" y="${i * 112 - 20}" width="1020" height="104" rx="6" fill="url(#c1plank)"/>`;
    o += `</g>`;
    const r = A.rng(8);
    for (let i = 0; i < 60; i++) o += `<circle cx="${f(r() * 1000)}" cy="${f(r() * 650)}" r="${f(2 + r() * 6)}" fill="${r() > .5 ? '#c3cb90' : '#d8d5ae'}" opacity=".45"/>`;
    o += `<rect width="1000" height="650" fill="url(#c1sun)"/>` + extra;
    return o;
  }

  function openBook(between = '') {
    let o = `<g filter="url(#drop)"><path d="M140 150Q500 118 860 150L872 560Q500 540 128 560Z" fill="#5e2824"/></g>` + between;
    o += `<path d="M160 160Q330 128 498 168V548Q330 516 160 548Z" fill="url(#paperG)" filter="url(#texPaper)"/>`;
    o += `<path d="M840 160Q670 128 502 168V548Q670 516 840 548Z" fill="url(#paperG)" filter="url(#texPaper)"/>`;
    o += `<path d="M470 160Q490 170 500 168V548Q490 548 470 536Z" fill="#8a6a44" opacity=".25"/><path d="M530 160Q510 170 500 168V548Q510 548 530 536Z" fill="#8a6a44" opacity=".2"/>`;
    o += `<text x="330" y="208" text-anchor="middle" font-family="Palatino Linotype, Georgia, serif" font-size="22" font-style="italic" fill="#5a3f28">Chapter Eleven</text>`;
    o += `<text x="330" y="236" text-anchor="middle" font-family="Palatino Linotype, Georgia, serif" font-size="15" fill="#7a5c3e" letter-spacing="2">IN WHICH A DOOR IS LOCKED</text>`;
    for (let i = 0; i < 9; i++) o += `<rect x="${196}" y="${268 + i * 26}" width="${f(250 - (i === 8 ? 120 : (i * 37) % 40))}" height="3.5" rx="1.5" fill="#6b5236" opacity=".35"/>`;
    // engraving plate on the right page
    o += `<rect x="560" y="200" width="230" height="170" fill="#efe3c6" stroke="#7a5c3e" stroke-width="1.5"/>`;
    o += `<g stroke="#5a3f28" stroke-width="1.3" fill="none" opacity=".75"><path d="M590 350V290L640 250L690 290V350Z"/><path d="M620 350V315H660V350"/><path d="M700 350Q720 300 760 330Q770 300 740 280"/><path d="M570 350H780"/>${[0, 1, 2, 3, 4].map(i => `<path d="M${580 + i * 42} 360l14 -6"/>`).join('')}</g>`;
    for (let i = 0; i < 5; i++) o += `<rect x="560" y="${400 + i * 26}" width="${f(230 - (i * 29) % 50)}" height="3.5" rx="1.5" fill="#6b5236" opacity=".35"/>`;
    return o;
  }

  function envelope(x, y, rot, s = 1) {
    return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><rect x="-110" y="-70" width="220" height="140" rx="4" fill="#f5ecd6" stroke="#bda97f" stroke-width="1.5" filter="url(#texPaper)"/>
      <path d="M-110 -70L0 10L110 -70" fill="none" stroke="#c9b58c" stroke-width="1.5"/><path d="M-110 70L-20 0M110 70L20 0" stroke="#d9c8a2" stroke-width="1.2"/>
      <circle cy="8" r="17" fill="#9c2f38"/><circle cy="8" r="12" fill="none" stroke="#7a1f27" stroke-width="1.5"/>${A.sym('star', 0, 8, .38, '#7a1f27')}
      <text x="-70" y="-38" font-family="Segoe Script, Segoe Print, cursive" font-size="17" fill="#5a3f28" transform="rotate(0)">for Anne</text></g>`;
  }

  function letterView(lines, sign, opts = {}) {
    let o = cuBench('');
    o += `<g filter="url(#drop)"><path d="M250 70L760 58L772 590L240 598Z" fill="url(#paperG)" filter="url(#texPaper)"/></g>`;
    o += `<path d="M250 70L760 58L766 330L244 336Z" fill="#fff" opacity=".12"/><path d="M244 336L766 330" stroke="#cbb68e" stroke-width="1.2"/>`;
    lines.forEach((l, i) => { o += `<text x="505" y="${170 + i * 64}" text-anchor="middle" font-family="Segoe Script, Segoe Print, Bradley Hand, cursive" font-size="32" fill="#4a3320">${l}</text>`; });
    if (sign) o += `<text x="690" y="${170 + lines.length * 64 + 20}" text-anchor="end" font-family="Segoe Script, Segoe Print, cursive" font-size="22" fill="#6b4c32">${sign}</text>`;
    if (opts.sprig) o += `<g transform="translate(330 520) rotate(-30)" opacity=".8">${A.lavender(A.rng(3), 0, 0, 70, 6)}${A.lavender(A.rng(4), 8, 0, 60, 14)}</g>`;
    return o;
  }

  function cuPot() {
    const open = G.has('compartment');
    let o = `<defs><linearGradient id="c2bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5f7a45"/><stop offset=".6" stop-color="#3f5a2e"/><stop offset="1" stop-color="#2d3f21"/></linearGradient>
      <linearGradient id="c2drawer" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b2a1c"/><stop offset="1" stop-color="#1c130b"/></linearGradient></defs>`;
    o += `<rect width="1000" height="650" fill="url(#c2bg)"/>`;
    const r = A.rng(99);
    o += `<g filter="url(#b8)" opacity=".7">${A.bush(r, 120, 200, 200, 160, 160, ['#2d4526', '#3e5d33', '#57783f', '#7a9a5a'], 20, 40)}${A.bush(r, 900, 180, 200, 170, 160, ['#2d4526', '#3e5d33', '#57783f', '#7a9a5a'], 20, 40)}</g>`;
    o += `<g filter="url(#b2)"><path d="M0 590H1000V650H0Z" fill="#4a6630"/>${A.grass(r, 0, 650, 1000, 260, 14, 40, ['#5d7a39', '#6f8d45', '#86a352'])}</g>`;
    // plinth
    o += `<ellipse cx="505" cy="596" rx="230" ry="22" fill="#12100a" opacity=".45" filter="url(#b8)"/>`;
    o += `<g filter="url(#tex)"><path d="M300 420H700L716 590H284Z" fill="#9d927b"/><path d="M290 404H710L700 420H300Z" fill="#bfb49b"/></g><rect x="284" y="420" width="432" height="170" fill="#2a1a0c" opacity=".12"/>`;
    o += `<path d="M300 420H700" stroke="#7d735f" stroke-width="1.5"/>`;
    // drawer
    if (open) {
      o += `<path d="M372 452H628V560H372Z" fill="#150e08"/>`;
      o += `<g id="drawer" class="drawer-out"><g filter="url(#texStone)"><path d="M360 470H640L660 600H340Z" fill="#a89c82"/></g><path d="M372 470H628L636 500H364Z" fill="url(#c2drawer)"/>`;
      o += `<g data-hot="box" transform="translate(500 488)" filter="url(#dropSm)">${smallBox(G.has('boxOpen'))}</g></g>`;
    } else {
      o += `<path d="M372 452H628V560H372Z" fill="none" stroke="#5e5646" stroke-width="2" opacity=".6"/>`;
      o += `<path d="M374 454H626" stroke="#e1d8c3" stroke-width="1" opacity=".4"/>`;
    }
    // pot
    o += `<g filter="url(#tex)"><path d="M370 400Q505 418 640 400L690 150H320Z" fill="url(#terracotta)"/><rect x="300" y="118" width="410" height="46" rx="8" fill="url(#terracotta)"/></g>`;
    o += `<path d="M320 164H690" stroke="#5e2b12" stroke-width="3" opacity=".45"/><path d="M600 176L585 392" stroke="#f1b58a" stroke-width="30" opacity=".16" stroke-linecap="round"/>`;
    o += `<path d="M372 394Q420 370 450 392Q430 404 372 400Z" fill="#6f8b3a" opacity=".85"/><path d="M640 396Q620 380 600 396" fill="#e8e2d0" opacity=".3"/>`;
    o += `<g data-hot="moon"><circle cx="545" cy="355" r="34" fill="transparent"/><g filter="url(#engrave)">${A.sym('moon', 548, 350, 1.7, '#3f1808', 'stroke="#2a0f04" stroke-width="1.2"')}</g><circle cx="548" cy="350" r="40" fill="none" stroke="#6a2f16" stroke-width="2.5" opacity=".55"/></g>`;
    o += `<ellipse cx="505" cy="124" rx="186" ry="16" fill="#3a2517"/>`;
    o += `<g transform="translate(505 126) scale(2.5)"><g class="sway c">${plants.fern(A.rng(5))}</g></g>`;
    return o;
  }

  function smallBox(opened) {
    // box in the drawer, 1:1 in close-up units, centred
    let o = `<g filter="url(#woodH)"><path d="M-70 0H70V44H-70Z" fill="#6a4225"/><path d="M-70 0L-58 -20H58L70 0Z" fill="#83552f"/></g>`;
    o += `<path d="M-70 0H70" stroke="#3a2412" stroke-width="1.5"/><rect x="-10" y="10" width="20" height="18" rx="2" fill="url(#brass)"/>`;
    if (opened) o += `<path d="M-58 -20L-62 -66H54L58 -20Z" fill="#5c3a20"/><path d="M-54 -24L-56 -60H50L52 -24Z" fill="#7a2230"/>`;
    return o;
  }

  function cuBox() {
    const opened = G.has('boxOpen'), dials = G.get('dials', [0, 0, 0]);
    let o = `<defs><radialGradient id="c3bg" cx=".5" cy=".4" r=".8"><stop offset="0" stop-color="#6a5540"/><stop offset="1" stop-color="#2a1d12"/></radialGradient>
      <linearGradient id="c3front" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7b4c29"/><stop offset="1" stop-color="#4f2f18"/></linearGradient>
      <linearGradient id="c3lid" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8e5c34"/><stop offset="1" stop-color="#6e4424"/></linearGradient>
      <radialGradient id="c3velvet" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="#9a2d3b"/><stop offset="1" stop-color="#4f1119"/></radialGradient></defs>`;
    o += `<rect width="1000" height="650" fill="url(#c3bg)"/>`;
    o += `<g filter="url(#b2)" opacity=".5"><path d="M0 520H1000V650H0Z" fill="#1f160e"/></g>`;
    o += `<ellipse cx="500" cy="585" rx="300" ry="30" fill="#0e0905" opacity=".6" filter="url(#b8)"/>`;
    if (opened) {
      // open lid
      o += `<g filter="url(#woodH)"><path d="M262 250L250 60H750L738 250Z" fill="url(#c3lid)"/></g><path d="M278 240L270 80H730L722 240Z" fill="url(#c3velvet)"/>`;
      o += `<path d="M270 80H730" stroke="#d9b36b" stroke-width="3" opacity=".6"/>`;
    }
    // box body
    o += `<g filter="url(#woodH)"><path d="M250 330H750V570H250Z" fill="url(#c3front)"/>`;
    if (!opened) o += `<path d="M250 330L300 200H700L750 330Z" fill="url(#c3lid)"/>`;
    else o += `<path d="M250 330L300 250H700L750 330Z" fill="#3a2212"/>`;
    o += `</g>`;
    if (opened) {
      o += `<path d="M268 326L310 262H690L732 326Z" fill="url(#c3velvet)"/>`;
      if (!G.has('key')) o += `<g data-hot="key" filter="url(#drop)" transform="translate(500 296) rotate(-6)"><rect x="-130" y="-30" width="260" height="60" fill="transparent"/><circle cx="-80" r="22" fill="none" stroke="url(#brass)" stroke-width="10"/><circle cx="-80" r="7" fill="#7a5118" opacity=".4"/><path d="M-58 -6H100V6H-58Z" fill="url(#brass)"/><path d="M70 6V26H80V6ZM88 6V20H98V6ZM52 6V16H60V6Z" fill="url(#brass)"/><path d="M-50 -3H96" stroke="#fff4c8" stroke-width="2" opacity=".6"/><path d="M-100 -10A22 22 0 0 1 -70 -20" stroke="#fff4c8" stroke-width="3" opacity=".6" fill="none"/></g>`;
    } else {
      // inlaid symbols on the lid
      o += `<g transform="translate(0 265) scale(1 .55) translate(0 -265)">`;
      [['sun', 400], ['moon', 500], ['star', 600]].forEach(([s, x]) => { o += `<circle cx="${x}" cy="265" r="34" fill="#4a2d17" opacity=".5"/>${A.sym(s, x, 265, 1.2, '#e8d7ae', 'stroke="#8a6a3a" stroke-width="1"')}`; });
      o += `</g><path d="M300 200H700" stroke="#b08a52" stroke-width="2" opacity=".5"/>`;
    }
    o += `<path d="M250 330H750" stroke="#2e1b0d" stroke-width="3"/>`;
    // brass corners
    [[250, 330], [750, 330], [250, 570], [750, 570]].forEach(([x, y]) => { const sx = x < 500 ? 1 : -1, sy = y < 400 ? 1 : -1; o += `<path d="M${x} ${y}h${34 * sx}v${6 * sy}h${-28 * sx}v${28 * sy}h${-6 * sx}Z" fill="url(#brass)"/>`; });
    // lock plate
    o += `<rect x="360" y="370" width="280" height="170" rx="14" fill="url(#brass)" stroke="#6b4812" stroke-width="2"/><rect x="372" y="382" width="256" height="146" rx="10" fill="none" stroke="#fff1c4" stroke-width="1" opacity=".5"/>`;
    dials.forEach((d, i) => {
      const x = 420 + i * 80;
      o += `<g data-hot="up${i}"><path d="M${x - 16} 404L${x} 390L${x + 16} 404Z" fill="#6b4812"/><rect x="${x - 26}" y="382" width="52" height="28" fill="transparent"/></g>`;
      o += `<g data-hot="dial${i}"><rect x="${x - 26}" y="414" width="52" height="66" rx="6" fill="#1e140b"/><rect x="${x - 22}" y="418" width="44" height="58" rx="4" fill="#efe3c8"/><rect x="${x - 22}" y="418" width="44" height="14" fill="#000" opacity=".15"/><rect x="${x - 22}" y="462" width="44" height="14" fill="#000" opacity=".15"/><text x="${x}" y="462" text-anchor="middle" font-family="Palatino Linotype, Georgia, serif" font-size="40" fill="#2e1d10">${d}</text></g>`;
      o += `<g data-hot="down${i}"><path d="M${x - 16} 490L${x} 504L${x + 16} 490Z" fill="#6b4812"/><rect x="${x - 26}" y="484" width="52" height="28" fill="transparent"/></g>`;
    });
    if (!opened) o += `<g data-hot="latch" id="latch"><rect x="468" y="540" width="64" height="40" rx="6" fill="transparent"/><path d="M478 542H522V560Q500 574 478 560Z" fill="url(#brass)" stroke="#6b4812" stroke-width="1.5"/><circle cx="500" cy="556" r="4" fill="#6b4812"/></g>`;
    return o;
  }

  function cuSundial() {
    const moss = G.get('moss', [0, 0, 0]);
    let o = `<defs><radialGradient id="c4plate" cx=".42" cy=".38" r=".7"><stop offset="0" stop-color="#b7c9a8"/><stop offset=".5" stop-color="#7b9c84"/><stop offset=".85" stop-color="#8a7348"/><stop offset="1" stop-color="#5a6f5a"/></radialGradient></defs>`;
    o += `<rect width="1000" height="650" fill="#b3a88f" filter="url(#texStone)"/>`;
    o += `<rect width="1000" height="650" fill="#2a1a0c" opacity=".15"/>`;
    o += `<ellipse cx="510" cy="340" rx="300" ry="290" fill="#1a120a" opacity=".45" filter="url(#b16)"/>`;
    o += `<circle cx="500" cy="325" r="280" fill="url(#c4plate)" filter="url(#tex)"/>`;
    o += `<circle cx="500" cy="325" r="280" fill="none" stroke="#4a5e4a" stroke-width="4"/><circle cx="500" cy="325" r="228" fill="none" stroke="#3d4f3d" stroke-width="2" opacity=".7"/><circle cx="500" cy="325" r="190" fill="none" stroke="#3d4f3d" stroke-width="1" opacity=".5"/>`;
    const nums = ['VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'I', 'II', 'III', 'IV', 'V', 'VI'];
    nums.forEach((n, i) => {
      const a = Math.PI + i * Math.PI / 12, x = 500 + Math.cos(a) * 250, y = 325 + Math.sin(a) * 250;
      o += `<text x="${f(x)}" y="${f(y + 8)}" text-anchor="middle" font-family="Palatino Linotype, Georgia, serif" font-size="24" fill="#2e3b2c" transform="rotate(${f(a * 57.3 + 90)} ${f(x)} ${f(y)})" opacity=".85">${n}</text>`;
      o += `<path d="M${f(500 + Math.cos(a) * 228)} ${f(325 + Math.sin(a) * 228)}L${f(500 + Math.cos(a) * 214)} ${f(325 + Math.sin(a) * 214)}" stroke="#2e3b2c" stroke-width="2"/>`;
    });
    o += `<path id="c4motto" d="M320 440A200 200 0 0 0 680 440" fill="none"/><text font-family="Palatino Linotype, Georgia, serif" font-size="19" font-style="italic" fill="#2e3b2c" letter-spacing="3" opacity=".75"><textPath href="#c4motto" startOffset="50%" text-anchor="middle">I count only the sunny hours</textPath></text>`;
    // gnomon
    o += `<path d="M500 325L500 90L520 325Z" fill="#5c7a66" stroke="#2e3b2c" stroke-width="1.5"/><path d="M500 325L360 170" stroke="#1e281e" stroke-width="10" opacity=".25" filter="url(#b4)"/>`;
    o += `<circle cx="500" cy="325" r="10" fill="#3d4f3d"/>`;
    // the three engravings with numbers
    const marks = [['star', 330, 300, '0'], ['sun', 500, 430, '8'], ['moon', 670, 300, '1']];
    const mossAt = [[0, 330, 302], [1, 500, 432], [2, 670, 302]];
    marks.forEach(([s, x, y, n]) => {
      o += `<g filter="url(#engrave)">${A.sym(s, x - 26, y, 1.05, '#27342a', 'opacity=".85"')}<text x="${x + 22}" y="${y + 14}" font-family="Palatino Linotype, Georgia, serif" font-size="44" fill="#27342a" opacity=".85">${n}</text></g>`;
    });
    mossAt.forEach(([i, x, y]) => {
      if (moss[i]) return;
      const rr = A.rng(50 + i);
      let m = `<ellipse cx="${x}" cy="${y}" rx="66" ry="40" fill="#4c6a28"/>`;
      for (let k = 0; k < 70; k++) m += `<circle cx="${f(x + (rr() - .5) * 128)}" cy="${f(y + (rr() - .5) * 74)}" r="${f(4 + rr() * 9)}" fill="${['#4c6a28', '#5f7d32', '#728f3d', '#86a24a', '#3d561f'][k % 5]}"/>`;
      for (let k = 0; k < 18; k++) m += `<circle cx="${f(x + (rr() - .5) * 110)}" cy="${f(y + (rr() - .5) * 60)}" r="1.8" fill="#c9d67a"/>`;
      o += `<g data-hot="moss${i}" class="moss" filter="url(#fuzz)">${m}</g>`;
    });
    return o;
  }

  /* ---------- items ---------- */
  G.item('letter', { name: 'A note from the book', view: 'letter' });
  G.item('key', { name: 'Old brass key', usable: true, hint: 'The brass key is in your hand. Where might it fit?' });

  /* ---------- scene definition ---------- */
  G.register(1, {
    mood: 'garden',
    mission: () => ({ title: 'Open the cottage door', text: `Your birthday surprise is waiting inside this cottage, but the front door is locked! Someone has hidden the key somewhere in this garden. Look closely at the bench, the flowerpots and the garden ornaments, and follow the clues until you find it.` }),
    bg, fg,
    after() {
      flutter();
      if (G.has('doorOpen')) G.$('#doorLeaf').classList.add('open');
    },
    leave() { cancelAnimationFrame(raf); },
    enter(resumed) {},

    click(id, el) {
      const say = G.say;
      switch (id) {
        case 'door': {
          if (G.has('doorOpen')) { G.goScene(2, { zoom: [800, 540] }); return; }
          const h = G.$('#handle');
          h.classList.remove('rattle'); void h.getBBox(); h.classList.add('rattle');
          Sound.play('rattle');
          if (G.hasItem('key')) say('Still locked. That brass key in your bag might fit...');
          else say(G.line('door', ["It's locked. Perhaps there's another way inside...", 'The door rattles, but stays firmly shut.', "Locked tight. Someone must have hidden the key nearby."]));
          return;
        }
        case 'book': G.openCloseup('book'); return;
        case 'potC': G.openCloseup('pot'); return;
        case 'sundial': G.openCloseup('sundial'); return;
        case 'potA': el.classList.remove('wiggle'); void el.getBBox(); el.classList.add('wiggle'); Sound.play('rustle'); say(G.line('potA', ['A cheerful geranium in a plain striped pot. Nothing unusual.', 'Just soil and a very content geranium.'])); return;
        case 'potB': el.classList.remove('wiggle'); void el.getBBox(); el.classList.add('wiggle'); Sound.play('rustle'); say(G.line('potB', ['Lavender, and a bee who would like some privacy.', 'An ordinary pot. It smells wonderful, though.'])); return;
        case 'potD': el.classList.remove('wiggle'); void el.getBBox(); el.classList.add('wiggle'); Sound.play('rustle'); say(G.line('potD', ['A little pot of pansies. Perfectly ordinary.', 'The pansies look up at you innocently.'])); return;
        case 'lantern': say('An old iron lantern. Somebody lit it, even though it is still daylight.'); Sound.play('twinkle'); return;
        case 'window': case 'window2': say(G.line('win', ['Lace curtains. Someone inside is clearly expecting company.', 'You can just make out a warm glow somewhere inside.'])); return;
        case 'roses': Sound.play('rustle'); say('The roses smell wonderful. Somebody takes very good care of this garden.'); return;
        case 'teapot': say(G.line('tea', ['The teapot is still faintly warm. Someone was here not long ago.', 'Two cups were poured... but only one was drunk.'])); return;
        case 'blanket': Sound.play('rustle'); say('A cosy tartan blanket. Suspiciously covered in cat hair.'); return;
        case 'paws': say('Tiny muddy paw prints... leading straight up to the door.'); return;
        case 'snail': say('A snail. It seems to know something, but it is not talking.'); return;
      }
    },

    use(item, id) {
      if (item === 'key' && id === 'door') { unlockDoor(); return true; }
      return false;
    },

    closeups: {
      book: {
        render() {
          return cuBench(openBook(G.has('letter') ? '' : `<g data-hot="envelope" id="env">${envelope(650, 150, -14, .9)}</g>`));
        },
        click(id, el) {
          if (id === 'envelope') {
            el.style.transition = 'transform .7s cubic-bezier(.4,0,.2,1), opacity .7s';
            el.style.transform = 'translate(-140px, 120px) scale(1.2)'; el.style.opacity = '0';
            Sound.play('page');
            G.set('letter');
            setTimeout(() => { G.addItem('letter'); Sound.play('discover'); G.openCloseup('letter', null, { parent: { id: 'book' } }); }, 650);
          }
        }
      },
      letter: {
        render() { return letterView(['Where flowers sleep', 'and secrets grow,', 'the next little surprise', 'waits below.'], '— a friend', { sprig: true }); }
      },
      pot: {
        render: cuPot,
        click(id, el) {
          if (id === 'moon' && !G.has('compartment')) {
            Sound.play('click');
            el.style.transition = 'transform .25s'; el.style.transform = 'translate(1px, 2px)';
            setTimeout(() => {
              Sound.play('stone'); G.set('compartment'); G.refreshCloseup();
              const d = document.getElementById('drawer');
              if (d) { d.style.transform = 'translateY(-44px) scale(.94)'; d.style.transformOrigin = '500px 520px'; d.style.opacity = '.3'; requestAnimationFrame(() => requestAnimationFrame(() => { d.style.transition = 'transform 1s cubic-bezier(.2,.8,.3,1), opacity .6s'; d.style.transform = ''; d.style.opacity = '1'; })); }
              setTimeout(() => { Sound.play('discover'); G.say('A hidden compartment! There is a small wooden box inside.'); }, 900);
            }, 260);
            return;
          }
          if (id === 'moon') { G.say('The little crescent moon. The compartment below is already open.'); return; }
          if (id === 'box') G.openCloseup('box', null, { stack: true });
        }
      },
      box: {
        render: cuBox,
        click(id, el) {
          const d = G.get('dials', [0, 0, 0]).slice();
          const m = id.match(/^(up|down|dial)(\d)$/);
          if (m && !G.has('boxOpen')) {
            const i = +m[2];
            d[i] = (d[i] + (m[1] === 'down' ? 9 : 1)) % 10;
            G.put('dials', d); Sound.play('tick'); G.refreshCloseup();
            return;
          }
          if (id === 'latch') {
            if (d.join('') === COMBO.join('')) {
              Sound.play('unlock');
              G.set('boxOpen');
              setTimeout(() => { Sound.play('boxOpen'); G.refreshCloseup(); }, 350);
              setTimeout(() => { Sound.play('sparkle'); G.say('The lid swings open. An old brass key rests on the velvet.'); }, 1200);
            } else {
              Sound.play('wrong');
              el.classList.remove('jiggle'); void el.getBBox(); el.classList.add('jiggle');
              G.say(G.line('latch', ["The latch won't budge. Not the right numbers.", 'Click-clunk. Still locked.', 'The box stays shut. Those three symbols on the lid must mean something.']), 2600);
            }
            return;
          }
          if (id === 'key') {
            G.set('key'); G.addItem('key'); Sound.play('discover');
            el.style.transition = 'opacity .6s'; el.style.opacity = '0';
            G.say('You found an old brass key! Perhaps it opens the cottage door.');
            setTimeout(() => G.refreshCloseup(), 650);
          }
        }
      },
      sundial: {
        render: cuSundial,
        click(id, el) {
          const m = id.match(/^moss(\d)$/);
          if (!m) return;
          const moss = G.get('moss', [0, 0, 0]).slice();
          moss[+m[1]] = 1; G.put('moss', moss);
          Sound.play('rustle');
          el.style.transition = 'opacity .8s, transform .8s'; el.style.transformBox = 'fill-box'; el.style.transformOrigin = 'center';
          el.style.opacity = '0'; el.style.transform = 'scale(1.15) translate(0, 20px)';
          setTimeout(() => { el.remove(); }, 820);
          if (moss.every(Boolean)) setTimeout(() => { Sound.play('discover'); G.say('A star, a sun and a moon — each engraved beside a number.'); }, 700);
          else G.say(G.line('moss', ['You brush away the moss. Something is engraved underneath.', 'More moss comes away...']), 2400);
        },
        onClose() { G.refresh(); }
      }
    },

    hints() {
      const H = G.has, moss = G.get('moss', [0, 0, 0]);
      if (!H('letter')) return { key: 'letter', lines: ['Perhaps someone left a message nearby.', 'Take a closer look at the garden bench.', "There's something hidden inside the old book on the bench — the corner of an envelope."] };
      if (!H('compartment')) return { key: 'pot', lines: ['The note speaks of where flowers "sleep"...', 'Look closely at the flowerpots. One of them is a little different.', 'The fern pot beside the bench has a tiny crescent moon engraved near its base. Examine it and press the moon.'] };
      if (!H('boxOpen')) {
        if (!moss.every(Boolean)) return { key: 'combo', lines: ['The box wants three numbers. Its lid shows three symbols: a sun, a moon and a star.', 'Something in the garden that tells the time might share those symbols.', 'Examine the sundial and brush away the three patches of moss.'] };
        return { key: 'combo2', lines: ['Match the symbols on the box lid, left to right, with the sundial.', 'The lid reads: sun, moon, star. Which number sits beside each on the sundial?', 'Sun is 8, moon is 1, star is 0. Set the dials to 8-1-0, then press the little latch.'] };
      }
      if (!H('key')) return { key: 'key', lines: ['The box is open...', 'Something shiny is resting on the velvet inside the box.', 'Open the box again (in the fern pot) and click the brass key to take it.'] };
      return { key: 'door', lines: ['That key looks like it belongs to something important.', 'Select the key in your bag, then use it on the front door.', 'Click the brass key at the bottom of the screen, then click the cottage door.'] };
    }
  });

  async function unlockDoor() {
    G.busy = true;
    const h = G.$('#handle');
    Sound.play('unlock');
    G.removeItem('key');
    G.set('doorOpen');
    await G.wait(500);
    h.classList.add('turn');
    await G.wait(500);
    Sound.play('creak', 2.2);
    G.$('#doorLeaf').classList.add('open');
    G.$('#doorway').style.transition = 'opacity 1.2s'; G.$('#doorway').style.opacity = '1';
    G.$('#spill').style.opacity = '.9';
    await G.wait(900);
    Sound.play('discover');
    await G.wait(1300);
    G.busy = false;
    G.goScene(2, { zoom: [800, 540] });
  }
})();
