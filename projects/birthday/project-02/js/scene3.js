/* ===================== SCENE 3 — The Cats' Secret ===================== */
(() => {
  const f = A.f;
  const C1 = CONFIG.cats.one, C2 = CONFIG.cats.two;
  const PIECES = ['cushion', 'books', 'basket', 'soil', 'rug', 'cat'];
  const WHERE = {
    cushion: 'under the floor cushions', books: 'between the toppled books', basket: 'in the yarn basket',
    soil: 'in the soil of the knocked-over pot', rug: 'under the curled-up corner of the rug', cat: 'with the cat in the cardboard box (ask twice)'
  };

  /* ---------- the invitation (500 x 350) ---------- */
  function inviteArt() {
    const sc = 'font-family="Segoe Script, Segoe Print, Bradley Hand, cursive" fill="#4a3320"';
    let o = `<rect width="500" height="350" fill="url(#paperG)" filter="url(#texPaper)"/>`;
    o += `<rect x="14" y="14" width="472" height="322" fill="none" stroke="#b4914f" stroke-width="2"/><rect x="20" y="20" width="460" height="310" fill="none" stroke="#c8a55c" stroke-width=".8"/>`;
    [[24, 24, 0], [476, 24, 90], [476, 326, 180], [24, 326, 270]].forEach(([x, y, a]) => { o += `<path d="M0 0Q18 2 22 18M0 0Q2 18 18 22" transform="translate(${x} ${y}) rotate(${a})" stroke="#b4914f" stroke-width="1.5" fill="none"/>`; });
    o += `<text x="250" y="62" text-anchor="middle" ${sc} font-size="26">Dear ${CONFIG.name},</text>`;
    o += `<text x="250" y="100" text-anchor="middle" font-family="Palatino Linotype, Georgia, serif" font-style="italic" font-size="17" fill="#4a3320">You are cordially invited to a</text>`;
    o += `<text x="250" y="126" text-anchor="middle" font-family="Palatino Linotype, Georgia, serif" font-style="italic" font-size="17" fill="#4a3320">very special birthday celebration.</text>`;
    o += `<path d="M170 144H330" stroke="#c8a55c" stroke-width="1"/>`;
    o += `<text x="250" y="176" text-anchor="middle" ${sc} font-size="16">Your hosts: Two extremely innocent cats.</text>`;
    o += `<text x="250" y="210" text-anchor="middle" ${sc} font-size="16">Location: Just behind the next door.</text>`;
    o += `<text x="250" y="244" text-anchor="middle" ${sc} font-size="16">Dress code: Optional.</text>`;
    o += `<text x="250" y="274" text-anchor="middle" ${sc} font-size="16">Cat hair: Mandatory.</text>`;
    o += A.sym('paw', 210, 306, .55, '#6a4a3a', 'opacity=".75"') + A.sym('paw', 290, 300, .55, '#6a4a3a', 'opacity=".75"');
    return o;
  }

  const cuts = (() => {
    const r = A.rng(606);
    const v = [167, 333].map(x => { const p = []; for (let y = -30; y <= 380; y += 22) p.push([x + (r() - .5) * 20, y]); return p; });
    const h = []; for (let x = -30; x <= 530; x += 22) h.push([x, 175 + (r() - .5) * 20]);
    return { v, h };
  })();
  function pieceClip(c, rw) {
    const L = c === 0 ? [[-30, -30], [-30, 380]] : cuts.v[c - 1];
    const R = c === 2 ? [[530, -30], [530, 380]] : cuts.v[c];
    const col = L.concat(R.slice().reverse());
    const T = rw === 0 ? [[-30, -30], [530, -30]] : cuts.h;
    const B = rw === 1 ? [[-30, 380], [530, 380]] : cuts.h;
    const row = T.concat(B.slice().reverse());
    const P = pts => 'M' + pts.map(p => f(p[0]) + ' ' + f(p[1])).join('L') + 'Z';
    return { col: P(col), row: P(row) };
  }
  function tornEdges() {
    const P = pts => 'M' + pts.map(p => f(Math.max(1, Math.min(499, p[0]))) + ' ' + f(Math.max(1, Math.min(349, p[1])))).join('L');
    return cuts.v.map(P).concat([P(cuts.h)]).map(d => `<path d="${d}" stroke="#fffaf0" stroke-width="3" fill="none" opacity=".9"/><path d="${d}" stroke="#b69d74" stroke-width=".8" fill="none" opacity=".6"/>`).join('');
  }

  /* ---------- background ---------- */
  function bg() {
    const r = A.rng(3131);
    let o = `<defs>
      <linearGradient id="s3wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7f9278"/><stop offset=".6" stop-color="#a3b394"/><stop offset="1" stop-color="#94a585"/></linearGradient>
      <pattern id="s3damask" width="80" height="100" patternUnits="userSpaceOnUse"><path d="M40 10C52 30 60 40 40 60C20 40 28 30 40 10ZM40 60C46 72 56 78 40 92C24 78 34 72 40 60ZM0 50C10 60 12 70 0 80M80 50C70 60 68 70 80 80" fill="none" stroke="#dfe6cf" stroke-width="2"/><circle cx="40" cy="35" r="3" fill="#dfe6cf"/></pattern>
      <linearGradient id="s3floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a27a50"/><stop offset="1" stop-color="#c49a68"/></linearGradient>
      <linearGradient id="s3sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bcd6de"/><stop offset="1" stop-color="#f4e3b8"/></linearGradient>
      <linearGradient id="s3carpet" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d8c7a8"/><stop offset="1" stop-color="#b3a07f"/></linearGradient>
    </defs>`;
    o += `<rect width="1600" height="650" fill="url(#s3wall)" filter="url(#texPaper)"/><rect width="1600" height="620" fill="url(#s3damask)" opacity=".42"/>`;
    o += `<rect width="1600" height="90" fill="#2a1a0c" opacity=".22" filter="url(#b16)"/>`;
    o += `<rect x="0" y="0" width="1600" height="24" fill="#e8dcc4"/><rect x="0" y="24" width="1600" height="8" fill="#b9a988"/>`;
    // skirting
    o += `<rect x="0" y="598" width="1600" height="46" fill="#ece2cc"/><rect x="0" y="598" width="1600" height="6" fill="#fffaf0" opacity=".6"/><rect x="0" y="640" width="1600" height="6" fill="#8a7a5a"/>`;
    // floor
    o += `<rect x="0" y="644" width="1600" height="256" fill="url(#s3floor)"/><g filter="url(#woodH)"><rect x="0" y="644" width="1600" height="256" fill="#b48a5a" opacity=".55"/></g>`;
    for (let i = -16; i <= 16; i++) o += `<path d="M${800 + i * 44} 644L${800 + i * 120} 900" stroke="#7a5430" stroke-width="1.4" opacity=".45"/>`;
    // window
    o += `<rect x="388" y="118" width="224" height="314" fill="#e8dcc4"/><rect x="400" y="130" width="200" height="290" fill="url(#s3sky)"/>`;
    o += `<g filter="url(#b2)">${A.bush(r, 450, 360, 80, 70, 70, ['#4a6a42', '#5c7d4d', '#76955d', '#93ad72'], 12, 20)}${A.bush(r, 570, 330, 70, 90, 70, ['#4a6a42', '#5c7d4d', '#76955d', '#93ad72'], 12, 20)}</g>`;
    o += `<path d="M500 130V420M400 275H600" stroke="#e8dcc4" stroke-width="8"/><rect x="380" y="420" width="240" height="18" rx="2" fill="#f1e8d4"/>`;
    o += `<path d="M396 110H470Q450 260 470 430H392Z" fill="#f7f2e4" opacity=".55"/><path d="M604 110H530Q550 260 530 430H608Z" fill="#f7f2e4" opacity=".55"/><rect x="380" y="104" width="240" height="10" rx="5" fill="#8a6a44"/>`;
    // wall shelf with frames
    o += `<rect x="660" y="300" width="210" height="12" fill="#8a6a44"/><path d="M680 312L690 340H700L692 312ZM850 312L840 340H830L838 312Z" fill="#6a4a2c"/>`;
    o += `<g transform="translate(690 300)"><rect x="0" y="-60" width="46" height="60" fill="#c9a46a"/><rect x="5" y="-55" width="36" height="50" fill="#dcd0b0"/>${A.sym('heart', 23, -30, .45, '#b86a72')}</g>`;
    o += `<g transform="translate(790 300) rotate(80)"><rect x="-44" y="-4" width="44" height="34" fill="#7a5a3a"/><rect x="-40" y="0" width="36" height="26" fill="#cfd8c0"/></g>`;
    o += `<g transform="translate(830 300)">${A.bush(r, 0, -24, 18, 16, 20, ['#2f4a2a', '#3e5d33', '#57783f'], 6, 10)}<path d="M-10 0L-8 -12H8L10 0Z" fill="#e8dcc4"/></g>`;
    // little gallery of frames
    [[672, 130, 54, 70, '#8a6a44'], [742, 112, 70, 90, '#c9a46a'], [826, 138, 48, 60, '#6a4a2c']].forEach(([x, y, w, h, c], i) => {
      o += `<rect x="${x + 3}" y="${y + 5}" width="${w}" height="${h}" fill="#2a1a0c" opacity=".25" filter="url(#b2)"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/><rect x="${x + 5}" y="${y + 5}" width="${w - 10}" height="${h - 10}" fill="${['#e9dcc4', '#cfd8c0', '#e8d0c8'][i]}"/>`;
      if (i === 0) o += A.sym('paw', x + w / 2, y + h / 2, .7, '#8a6a44', 'opacity=".8"');
      if (i === 1) o += `<g transform="translate(${x + w / 2} ${y + h - 8}) scale(.28)">${A.cat(C1, { id: 'g1' })}</g>`;
      if (i === 2) o += A.sym('heart', x + w / 2, y + h / 2, .5, '#b86a72');
    });
    // tall plant against the wall
    o += `<ellipse cx="905" cy="646" rx="44" ry="7" fill="#1a0f06" opacity=".35" filter="url(#b2)"/>`;
    const pl = A.rng(77);
    for (let i = 0; i < 9; i++) {
      const a = -90 + (i - 4) * 16 + (pl() - .5) * 10, L = 150 + pl() * 90, ex = 905 + Math.cos(a * Math.PI / 180) * L, ey = 580 + Math.sin(a * Math.PI / 180) * L;
      o += `<path d="M905 590Q${f((905 + ex) / 2)} ${f(ey + 40)} ${f(ex)} ${f(ey)}" stroke="#4a6a3a" stroke-width="3" fill="none"/>`;
      o += A.leaf(ex - 20, ey + 6, 58, a + 170 - (i - 4) * 8, ['#3e5d33', '#4f7040', '#62864f'][i % 3]) + A.leaf(ex, ey, 40, a, ['#57783f', '#6f914f'][i % 2]);
    }
    o += `<path d="M872 560H938L930 642H880Z" fill="#e8dcc4" filter="url(#tex)"/><path d="M872 560H938V570H872Z" fill="#d6c8ab"/>`;
    // floor lamp
    o += `<path d="M1116 640V300" stroke="#3a3228" stroke-width="5"/><ellipse cx="1116" cy="642" rx="26" ry="5" fill="#3a3228"/><path d="M1080 300L1092 250H1140L1152 300Z" fill="#f1e2c0"/><ellipse cx="1116" cy="300" rx="36" ry="6" fill="#ffe6a8" opacity=".8"/><ellipse cx="1116" cy="330" rx="80" ry="60" fill="#ffe2a0" opacity=".18" filter="url(#b16)"/>`;
    // door frame
    o += `<rect x="1188" y="208" width="184" height="436" fill="#e8dcc4"/><rect x="1200" y="220" width="160" height="424" fill="#1a110a"/>`;
    // cat tree
    o += `<ellipse cx="280" cy="770" rx="140" ry="16" fill="#1a0f06" opacity=".4" filter="url(#b8)"/>`;
    const sisal = (x, y1, y2) => { let s = `<rect x="${x - 14}" y="${y1}" width="28" height="${y2 - y1}" fill="#c9ad7a"/>`; for (let y = y1 + 4; y < y2; y += 6) s += `<path d="M${x - 14} ${y}Q${x} ${y + 3} ${x + 14} ${y}" stroke="#a88c5a" stroke-width="1.6" fill="none"/>`; return s + `<rect x="${x + 6}" y="${y1}" width="8" height="${y2 - y1}" fill="#000" opacity=".15"/>`; };
    o += sisal(220, 568, 750) + sisal(340, 568, 750) + sisal(280, 452, 552);
    o += `<g filter="url(#tex)"><path d="M160 748H400L410 770H150Z" fill="url(#s3carpet)"/><path d="M180 552H380L386 570H174Z" fill="url(#s3carpet)"/><rect x="198" y="330" width="164" height="124" rx="10" fill="url(#s3carpet)"/><path d="M182 318H378L384 334H176Z" fill="url(#s3carpet)"/></g>`;
    o += `<path d="M280 570V620" stroke="#c9ad7a" stroke-width="1.4"/>`;
    o += `<ellipse cx="280" cy="395" rx="44" ry="40" fill="#1a1008"/><ellipse cx="280" cy="395" rx="44" ry="40" fill="none" stroke="#9a8766" stroke-width="4"/>`;
    // food bowls with names
    [[1165, 692, C1], [1250, 700, C2]].forEach(([x, y, c]) => {
      o += `<ellipse cx="${x}" cy="${y + 6}" rx="40" ry="8" fill="#1a0f06" opacity=".35" filter="url(#b2)"/><path d="M${x - 36} ${y - 14}H${x + 36}L${x + 28} ${y + 6}H${x - 28}Z" fill="#e9e1d0"/><ellipse cx="${x}" cy="${y - 14}" rx="36" ry="8" fill="#8a5a3a"/><text x="${x}" y="${y}" text-anchor="middle" font-family="Palatino Linotype, Georgia, serif" font-size="11" fill="#5a4a3a" letter-spacing="1">${c.name.toUpperCase()}</text>`;
    });
    // rug
    o += `<path d="M470 690H1110L1200 862H380Z" fill="#6f8aa0"/><path d="M490 700H1092L1170 850H410Z" fill="none" stroke="#e6d6b0" stroke-width="5"/><path d="M520 716H1066L1128 832H452Z" fill="#7f99ae"/>`;
    for (let i = 0; i < 9; i++) o += `<path d="M${f(560 + i * 60)} 716L${f(505 + i * 76)} 832" stroke="#e6d6b0" stroke-width="2" opacity=".4"/>`;
    o += `<path d="M470 690H1110L1200 862H380Z" fill="none" stroke="#3e5566" stroke-width="2"/>`;
    // yarn trail across the floor
    o += `<path d="M560 740Q620 800 720 790Q820 780 860 830Q900 870 1000 850Q1060 836 1040 760" stroke="#c8545a" stroke-width="2.5" fill="none" opacity=".9"/>`;
    return o;
  }

  /* ---------- foreground ---------- */
  function fg() {
    const r = A.rng(17);
    const H = G.has, got = G.get('pieces', []);
    const pieceShape = (id, x, y, rot, s = 1) => got.includes(id) ? '' : `<g data-hot="p-${id}" transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><path d="M-22 -10L6 -14L20 -9L24 6L10 12L-18 10L-24 0Z" fill="#f4ead2" stroke="#b69d74" stroke-width="1"/><path d="M-14 -3H12M-12 3H8" stroke="#7a5a3a" stroke-width="1.1" opacity=".55"/></g>`;
    let o = `<defs>
      <linearGradient id="s3sunbeam" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff2c8" stop-opacity=".45"/><stop offset="1" stop-color="#fff2c8" stop-opacity="0"/></linearGradient>
      <linearGradient id="s3box" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c79a62"/><stop offset="1" stop-color="#a47a48"/></linearGradient>
      <linearGradient id="s3door" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e2d6bc"/><stop offset=".5" stop-color="#f1e8d4"/><stop offset="1" stop-color="#d9cbae"/></linearGradient>
      <radialGradient id="s3party" cx=".5" cy=".5" r=".7"><stop offset="0" stop-color="#ffe6a8"/><stop offset="1" stop-color="#8a4a2a"/></radialGradient>
      <clipPath id="s3boxclip"><rect x="880" y="0" width="300" height="750"/></clipPath>
      <linearGradient id="s3basket" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b98a52"/><stop offset="1" stop-color="#8a5f32"/></linearGradient>
    </defs>`;
    // sunlight patch on the floor
    o += `<path class="noev rays" d="M400 130H600L780 760H420Z" fill="url(#s3sunbeam)" opacity=".55"/>`;
    // party door
    const open = H('partyDoor');
    o += `<g data-hot="door"><g id="beyond3" opacity="${open ? 1 : 0}"><rect x="1200" y="220" width="160" height="424" fill="url(#s3party)"/>${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<circle cx="${1220 + i * 18}" cy="${260 + Math.sin(i) * 10}" r="3" fill="#fff3c0"/>`).join('')}</g>`;
    o += `<g id="partyLeaf" class="${open ? 'open' : ''}"><rect x="1200" y="220" width="160" height="424" fill="url(#s3door)" filter="url(#texPaper)"/><rect x="1218" y="240" width="124" height="170" rx="3" fill="none" stroke="#b9a988" stroke-width="3"/><rect x="1218" y="430" width="124" height="190" rx="3" fill="none" stroke="#b9a988" stroke-width="3"/>`;
    o += `<circle cx="1344" cy="440" r="9" fill="url(#brass)"/><rect x="1256" y="566" width="50" height="46" rx="6" fill="#b9a988"/><rect x="1260" y="570" width="42" height="38" rx="4" fill="#8a7a5a"/>`;
    o += `<g transform="translate(1280 318) rotate(-4)"><path d="M0 -60V-40" stroke="#8a6a44"/><rect x="-54" y="-40" width="108" height="66" fill="#fbf3df" stroke="#a88e62"/><text y="-16" text-anchor="middle" font-family="Segoe Print, Segoe Script, cursive" font-size="13" fill="#8a2a2a">DO NOT ENTER</text><text y="4" text-anchor="middle" font-family="Segoe Print, Segoe Script, cursive" font-size="10" fill="#4a3320">(surprise in</text><text y="18" text-anchor="middle" font-family="Segoe Print, Segoe Script, cursive" font-size="10" fill="#4a3320">progress)</text></g></g></g>`;
    // kit-cat wall clock
    o += `<g data-hot="clock" transform="translate(1030 170)"><g class="clocktail"><path d="M0 70Q-6 100 0 124Q6 100 0 70" fill="#2a2a2e" stroke="#2a2a2e" stroke-width="8" stroke-linejoin="round"/></g><path d="M-26 -60L-20 -86L-6 -64M26 -60L20 -86L6 -64" fill="#2a2a2e"/><rect x="-28" y="-66" width="56" height="140" rx="26" fill="#2a2a2e"/><circle cy="10" r="20" fill="#f3ead6"/><path d="M0 10V-4M0 10L9 14" stroke="#2a2a2e" stroke-width="2"/><ellipse class="clockeyes" cx="-10" cy="-38" rx="7" ry="8" fill="#f3ead6"/><ellipse class="clockeyes" cx="10" cy="-38" rx="7" ry="8" fill="#f3ead6"/><circle class="clockpupil" cx="-10" cy="-38" r="3.5" fill="#2a2a2e"/><circle class="clockpupil" cx="10" cy="-38" r="3.5" fill="#2a2a2e"/><path d="M-8 -22Q0 -16 8 -22" stroke="#f3ead6" stroke-width="2" fill="none"/><path d="M-20 50H20" stroke="#f3ead6" stroke-width="3" stroke-dasharray="4 4"/></g>`;
    // cat 1 — in the cubby (eyes) or on top of the cat tree
    if (!H('cat1Out')) o += `<g data-hot="cubby"><ellipse cx="280" cy="395" rx="42" ry="38" fill="transparent"/><g class="cubbyeyes"><ellipse cx="266" cy="398" rx="6" ry="4.5" fill="${C1.eye}"/><ellipse cx="294" cy="398" rx="6" ry="4.5" fill="${C1.eye}"/><ellipse cx="266" cy="398" rx="1.3" ry="4" fill="#000"/><ellipse cx="294" cy="398" rx="1.3" ry="4" fill="#000"/></g></g>`;
    else o += `<g data-hot="cat1" id="cat1"><g transform="translate(280 322) scale(.62)"><g class="catwrap"><g class="cat c1 smug">${A.cat(C1, { id: 'k1' })}</g></g></g></g>`;
    // dangling pom-pom
    o += `<g class="swayTop" data-hot="pompom"><path d="M360 570V650" stroke="#e9e1d0" stroke-width="1.5"/><circle cx="360" cy="656" r="10" fill="#d96b6b"/></g>`;
    // yarn basket
    o += `<g data-hot="basket"><ellipse cx="540" cy="772" rx="64" ry="10" fill="#1a0f06" opacity=".4" filter="url(#b4)"/>`;
    o += `<circle cx="516" cy="706" r="20" fill="#c8545a"/><path d="M500 698Q516 690 532 704M498 712Q516 704 534 716" stroke="#9e3a40" stroke-width="1.4" fill="none"/><circle cx="556" cy="702" r="18" fill="#6f8fb8"/><path d="M542 694Q556 688 570 700M540 708Q556 700 572 712" stroke="#4f6f98" stroke-width="1.4" fill="none"/><circle cx="536" cy="690" r="15" fill="#e8c867"/>`;
    o += pieceShape('basket', 572, 684, -30, .9);
    o += `<path d="M480 700H600L588 770H492Z" fill="url(#s3basket)"/>`;
    for (let y = 708; y < 770; y += 9) o += `<path d="M${f(482 + (y - 700) * .15)} ${y}H${f(598 - (y - 700) * .15)}" stroke="#6e4a26" stroke-width="1.5" opacity=".6"/>`;
    for (let x = 490; x < 600; x += 12) o += `<path d="M${x} 700L${f(x + (540 - x) * .1)} 770" stroke="#d7a86c" stroke-width="1" opacity=".5"/>`;
    o += `<path d="M478 698H602" stroke="#6e4a26" stroke-width="5" stroke-linecap="round"/></g>`;
    // knocked-over flowerpot with spilled soil
    o += `<g data-hot="pot"><ellipse cx="700" cy="690" rx="90" ry="12" fill="#1a0f06" opacity=".3" filter="url(#b4)"/>`;
    o += `<path d="M600 682Q640 664 690 672Q700 690 690 694Q640 696 600 690Z" fill="#4a3322"/>${[0, 1, 2, 3, 4, 5, 6].map(i => `<circle cx="${f(610 + r() * 70)}" cy="${f(684 + r() * 8)}" r="${f(2 + r() * 3)}" fill="#3a2517"/>`).join('')}`;
    o += `</g>`;
    o += pieceShape('soil', 648, 680, 12, .85);
    o += `<g data-hot="pot"><g transform="translate(730 668) rotate(-80)"><g filter="url(#tex)"><path d="M-22 0Q0 4 22 0L30 -52H-30Z" fill="url(#terracotta)"/><rect x="-34" y="-62" width="68" height="12" rx="3" fill="url(#terracotta)"/></g><ellipse cy="-62" rx="30" ry="6" fill="#3a2517"/></g>`;
    for (let i = 0; i < 9; i++) { const a = -170 + i * 16; o += `<path d="M676 666Q${f(676 + Math.cos(a * Math.PI / 180) * 40)} ${f(666 + Math.sin(a * Math.PI / 180) * 30)} ${f(676 + Math.cos(a * Math.PI / 180) * 70)} ${f(666 + Math.sin(a * Math.PI / 180) * 26 + 20)}" stroke="${i % 2 ? '#7fa35e' : '#dfe6c0'}" stroke-width="3" fill="none"/>`; }
    o += `</g>`;
    // floor cushions
    const moved = H('cushionMoved');
    o += pieceShape('cushion', 900, 752, -8);
    o += `<g data-hot="cushion" id="cushion" style="transition:transform .8s cubic-bezier(.3,1.3,.5,1);transform:${moved ? 'translate(-46px,-6px)' : 'none'}"><ellipse cx="832" cy="768" rx="80" ry="10" fill="#1a0f06" opacity=".35" filter="url(#b4)"/>`;
    o += `<path d="M760 700Q830 680 902 700Q916 736 900 764Q830 780 762 764Q748 736 760 700Z" fill="#8fa487" filter="url(#tex)"/><path d="M760 700Q830 716 902 700" stroke="#62785c" stroke-width="2" fill="none"/><circle cx="831" cy="732" r="5" fill="#62785c"/><circle cx="795" cy="728" r="3" fill="#62785c"/><circle cx="867" cy="728" r="3" fill="#62785c"/>`;
    o += `<path d="M780 694Q830 660 884 690Q892 700 880 704Q830 716 784 706Q772 700 780 694Z" fill="#efe2c8"/><path d="M800 690Q830 700 866 690" stroke="#c9848c" stroke-width="3" fill="none" stroke-dasharray="6 5"/><path d="M790 694Q830 680 874 692" stroke="#fff" stroke-width="2" opacity=".35" fill="none"/></g>`;
    // toppled books
    o += `<g transform="translate(250 -40)">`;
    o += `<g data-hot="bookpile"><ellipse cx="920" cy="826" rx="80" ry="9" fill="#1a0f06" opacity=".35" filter="url(#b4)"/><g transform="translate(880 812) rotate(-6)"><rect x="-40" y="-14" width="84" height="16" fill="#6b2f2a"/><rect x="-40" y="-14" width="84" height="3" fill="#d9b36b" opacity=".6"/></g><g transform="translate(962 816) rotate(18)"><rect x="-36" y="-16" width="72" height="18" fill="#3d5a34"/><rect x="-36" y="-2" width="72" height="4" fill="#f1e8d4"/></g></g>`;
    o += pieceShape('books', 920, 806, 6, .9);
    o += `<g data-hot="bookpile"><g transform="translate(918 822) rotate(-24)"><rect x="-34" y="-12" width="68" height="16" fill="#27345c"/><rect x="-34" y="0" width="68" height="4" fill="#f1e8d4"/></g></g>`;
    o += `</g>`;
    // curled rug corner
    o += pieceShape('rug', 470, 846, -6, .9);
    o += `<g data-hot="rug"><path d="M380 862L460 862Q430 840 424 812Q400 830 380 862Z" fill="#e6d6b0"/><path d="M424 812Q402 832 380 862" stroke="#3e5566" stroke-width="2" fill="none"/><path d="M424 812Q434 842 460 862" stroke="#b9a988" stroke-width="1.4" fill="none"/></g>`;
    // toy mouse
    o += `<g data-hot="mouse" transform="translate(700 830)"><ellipse rx="16" ry="9" fill="#9a9aa0"/><circle cx="-14" cy="-4" r="5" fill="#b4b4ba"/><circle cx="-18" cy="-2" r="1.3" fill="#222"/><path d="M16 0Q30 4 36 -6" stroke="#c8545a" stroke-width="1.5" fill="none"/></g>`;
    // cardboard box with cat 2
    const out2 = H('cat2Out');
    o += `<g data-hot="box"><ellipse cx="1030" cy="752" rx="96" ry="12" fill="#1a0f06" opacity=".4" filter="url(#b4)"/><path d="M958 650L1100 650L1090 664H968Z" fill="#6e4f2a"/>`;
    if (!out2) o += `<g class="boxtail"><path d="M1098 660Q1130 640 1120 600Q1116 586 1106 592Q1116 620 1096 648Z" fill="${C2.fur}"/><path d="M1116 612L1106 610M1120 626L1110 626" stroke="${C2.furDark}" stroke-width="3"/></g>`;
    o += `</g>`;
    o += `<g data-hot="${out2 ? 'cat2' : 'box'}" id="cat2" clip-path="url(#s3boxclip)"><g transform="translate(1030 ${out2 ? 716 : 790}) scale(.64)"><g class="catwrap" id="cat2wrap"><g class="cat c2 ${out2 ? '' : 'peek'}">${A.cat(C2, { id: 'k2', piece: out2 && !G.get('pieces', []).includes('cat') && !H('cat2Dropped') })}</g></g></g></g>`;
    o += `<g data-hot="${out2 ? 'cat2' : 'box'}" class="boxfront"><path d="M950 660H1110L1104 756H956Z" fill="url(#s3box)" filter="url(#tex)"/><path d="M950 660L932 626L1000 640Z" fill="#b98c56"/><path d="M1110 660L1134 630L1064 642Z" fill="#b98c56"/><path d="M990 700H1070" stroke="#8a6238" stroke-width="2" opacity=".6"/><path d="M1000 720H1060M1004 730H1040" stroke="#8a6238" stroke-width="1.5" opacity=".4"/><text x="1030" y="714" text-anchor="middle" font-family="Palatino Linotype, Georgia, serif" font-size="11" fill="#6a4a2a" opacity=".7" letter-spacing="1">FRAGILE</text></g>`;
    if (H('cat2Dropped') && !got.includes('cat')) o += pieceShape('cat', 1004, 790, 16, 1);
    // light & vignette
    for (let i = 0; i < 14; i++) o += `<circle class="mote noev" cx="${f(430 + r() * 300)}" cy="${f(250 + r() * 400)}" r="${f(1 + r() * 1.5)}" fill="#fff6d0" style="animation-delay:${f(-r() * 14)}s"/>`;
    o += `<rect class="noev" width="1600" height="900" fill="url(#vignette)"/>`;
    return o;
  }

  function foundPiece(id) {
    const got = G.get('pieces', []);
    if (got.includes(id)) return;
    got.push(id); G.put('pieces', got);
    if (!G.hasItem('pieces')) G.addItem('pieces'); else { Sound.play('collect'); G.renderInv(); }
    G.refresh();
    G.say(got.length === 1 ? 'Looks like someone tried to hide this.' : got.length < 6 ? `Looks like someone tried to hide this. (${got.length} of 6)` : 'That is the last piece! Time to put the invitation back together.', 3200);
    if (got.length === 6) { Sound.play('discover'); setTimeout(() => { if (!G.closeup) G.openCloseup('assemble'); }, 1600); }
  }

  /* ---------- assembly close-up ---------- */
  function cuAssemble() {
    const placed = G.get('placed', []);
    let o = `<defs><radialGradient id="c8bg" cx=".5" cy=".45" r=".8"><stop offset="0" stop-color="#8a6a48"/><stop offset="1" stop-color="#3a2616"/></radialGradient><g id="inviteArt">${inviteArt()}${tornEdges()}</g>`;
    for (let c = 0; c < 3; c++) for (let rw = 0; rw < 2; rw++) { const p = pieceClip(c, rw); o += `<clipPath id="pc${c}${rw}"><path d="${p.col}"/></clipPath><clipPath id="pr${c}${rw}"><path d="${p.row}"/></clipPath>`; }
    o += `</defs>`;
    o += `<rect width="1000" height="650" fill="url(#c8bg)" filter="url(#woodH)"/>`;
    o += `<rect x="250" y="150" width="500" height="350" fill="#2a1a0e" opacity=".35"/><rect x="250" y="150" width="500" height="350" fill="none" stroke="#e8d7ae" stroke-width="2" stroke-dasharray="8 6" opacity=".5"/>`;
    o += `<g transform="translate(250 150)" opacity=".12">${tornEdges()}</g>`;
    o += `<text x="500" y="560" text-anchor="middle" font-family="Palatino Linotype, Georgia, serif" font-style="italic" font-size="20" fill="#f1dfb4" opacity=".75">Drag the pieces into place</text>`;
    const slots = [[30, 40], [30, 240], [30, 440], [806, 40], [806, 240], [806, 440]];
    const order = [4, 0, 2, 5, 1, 3];
    let k = 0;
    for (let c = 0; c < 3; c++) for (let rw = 0; rw < 2; rw++) {
      const id = c * 2 + rw, homeX = c * 167, homeY = rw * 175;
      const s = slots[order[k++]];
      const isP = placed.includes(id);
      const dx = isP ? 0 : s[0] - (250 + homeX) + (c === 0 ? 10 : 0), dy = isP ? 0 : s[1] - (150 + homeY);
      const rot = isP ? 0 : ((id * 37) % 13) - 6;
      o += `<g class="piece${isP ? ' placed' : ''}" data-piece="${id}" data-dx="${f(dx)}" data-dy="${f(dy)}" data-rot="${rot}" data-cx="${250 + homeX + 83}" data-cy="${150 + homeY + 87}" transform="translate(${f(dx)} ${f(dy)}) rotate(${rot} ${250 + homeX + 83} ${150 + homeY + 87})" filter="url(#dropSm)"><g transform="translate(250 150)"><g clip-path="url(#pc${c}${rw})"><g clip-path="url(#pr${c}${rw})"><use href="#inviteArt"/></g></g></g></g>`;
    }
    return o;
  }

  function dragPieces(svg) {
    svg.querySelectorAll('.piece:not(.placed)').forEach(p => {
      p.addEventListener('pointerdown', e => {
        if (G.busy) return;
        e.preventDefault(); Sound.unlock();
        p.parentNode.appendChild(p);
        try { p.setPointerCapture(e.pointerId); } catch (err) {}
        const toSvg = ev => { const pt = svg.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY; return pt.matrixTransform(svg.getScreenCTM().inverse()); };
        const start = toSvg(e), sdx = +p.dataset.dx, sdy = +p.dataset.dy;
        const cx = +p.dataset.cx, cy = +p.dataset.cy;
        p.classList.add('dragging'); Sound.play('page');
        const move = ev => {
          const q = toSvg(ev), dx = sdx + q.x - start.x, dy = sdy + q.y - start.y;
          p.dataset.dx = dx; p.dataset.dy = dy;
          p.setAttribute('transform', `translate(${f(dx)} ${f(dy)}) rotate(${p.dataset.rot} ${cx} ${cy})`);
        };
        const up = ev => {
          if (ev && ev.clientX != null) move(ev);
          window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up);
          p.classList.remove('dragging');
          const dx = +p.dataset.dx, dy = +p.dataset.dy;
          if (Math.hypot(dx, dy) < 42) {
            p.dataset.dx = 0; p.dataset.dy = 0; p.dataset.rot = 0;
            p.setAttribute('transform', `translate(0 0) rotate(0 ${cx} ${cy})`);
            p.classList.add('placed', 'snap');
            Sound.play('click'); Sound.play('collect');
            const placed = G.get('placed', []); placed.push(+p.dataset.piece); G.put('placed', placed);
            if (placed.length === 6) finishInvite();
          }
        };
        window.addEventListener('pointermove', move); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
      });
    });
  }

  async function finishInvite() {
    G.busy = true;
    await G.wait(500);
    Sound.play('discover');
    const svg = document.querySelector('#cu-content svg');
    if (svg) svg.insertAdjacentHTML('beforeend', `<rect x="250" y="150" width="500" height="350" fill="#fff8e0" opacity="0" class="noev"><animate attributeName="opacity" values="0;.8;0" dur="1.2s" fill="freeze"/></rect>`);
    await G.wait(1300);
    G.set('assembled');
    G.removeItem('pieces'); G.addItem('invite');
    G.busy = false;
    G.openCloseup('invite', null, { parent: null });
  }

  G.item('pieces', { name: 'Torn invitation pieces', art: 'pieces', view: 'assemble', count: () => G.get('pieces', []).length + '/6' });
  G.item('invite', { name: 'Birthday invitation', view: 'invite' });

  const catLines1 = ['Meow. (I have absolutely no idea what happened here.)', 'Meow. (Paper? What paper? I have never seen paper.)', 'Meow. (I was asleep the whole time. Ask anyone.)', 'Mrrp. (Have you tried looking under things? Not that I would know.)', 'Purrr. (You may pet me. Briefly.)'];
  const catLines2 = ['Meow! (Can I play with the yarn now?)', 'Meow! (I did not tear it. I just... helped.)', 'MEOW! (Did somebody say treats?)', 'Mrrp! (The box is MINE.)'];

  G.register(3, {
    mood: 'cats',
    mission: () => ({ title: 'Catch the troublemakers', text: `This is the cats' room, and what a mess! Two cats are hiding in here, and they tore up a birthday invitation. Find both cats and all <b>6 torn pieces</b> hidden around the room, then put the invitation back together.` }),
    bg, fg,
    after() {},
    enter(resumed) {
      if (G.has('assembled') && !G.has('partyDoor')) { openPartyDoor(); return; }
      if (!resumed && !G.has('s3seen')) {
        G.set('s3seen');
        setTimeout(() => Sound.play('meow', 2), 2600);
      }
    },
    click(id, el) {
      const say = G.say, H = G.has;
      if (id.startsWith('p-')) { foundPiece(id.slice(2)); return; }
      switch (id) {
        case 'cubby': {
          Sound.play('meow', 1);
          G.set('cat1Out'); G.refresh();
          const w = G.$('#cat1 .catwrap'); if (w) w.classList.add('hop');
          setTimeout(() => G.bubble(280, 150, catLines1[0], 'c1'), 350);
          return;
        }
        case 'cat1': {
          const w = el.querySelector('.catwrap'); w.classList.remove('hop', 'stretch'); void w.getBBox();
          const line = G.line('c1', catLines1);
          w.classList.add(line.startsWith('Purr') ? 'stretch' : 'hop');
          Sound.play(line.startsWith('Purr') ? 'purr' : 'meow', 1);
          G.bubble(280, 150, line, 'c1');
          return;
        }
        case 'box': {
          if (H('cat2Out')) return;
          Sound.play('rustle'); Sound.play('meow', 2);
          G.set('cat2Out'); G.refresh();
          const w = G.$('#cat2wrap'); if (w) { w.classList.add('popup'); }
          setTimeout(() => G.bubble(1030, 580, 'Mrrp?! (Oh. Hello.)', 'c2', 2600), 400);
          return;
        }
        case 'cat2': {
          const w = G.$('#cat2wrap'); w.classList.remove('hop'); void w.getBBox(); w.classList.add('hop');
          Sound.play('meow', 2);
          if (!H('cat2Dropped') && !G.get('pieces', []).includes('cat')) {
            G.bubble(1030, 580, 'Meow! (IT WASN\'T ME! ...Mostly.)', 'c2');
            G.set('cat2Dropped');
            setTimeout(() => { G.refresh(); Sound.play('page'); G.say('Something papery just fell out of that cat\'s mouth.', 2800); }, 700);
            return;
          }
          G.bubble(1030, 580, G.line('c2', catLines2), 'c2');
          return;
        }
        case 'pot': Sound.play('rustle'); say('Someone has clearly been very busy.'); return;
        case 'cushion':
          Sound.play('rustle');
          if (!H('cushionMoved')) { G.set('cushionMoved'); G.$('#cushion').style.transform = 'translate(-46px,-6px)'; say('You nudge the cushions aside...'); }
          else say('Very soft. Very round. Slightly flattened in the shape of a cat.');
          return;
        case 'bookpile': Sound.play('thump'); say('A toppled stack of books. Somebody jumped on them.'); return;
        case 'basket': Sound.play('rustle'); say('A basket of yarn, thoroughly unravelled.'); return;
        case 'rug': Sound.play('rustle'); say('The corner of the rug is curled up, as if someone hid something beneath it.'); return;
        case 'mouse': Sound.play('pop'); say('A toy mouse. It has seen things.'); return;
        case 'pompom': Sound.play('pop'); say('A pom-pom on a string. Irresistible, apparently.'); return;
        case 'clock': Sound.play('tick'); say('Tick. Tock. Even the clock looks guilty.'); return;
        case 'door':
          if (H('partyDoor')) { G.goScene(4, { zoom: [1280, 430], color: 'warm' }); return; }
          Sound.play('rattle');
          say(H('assembled') ? 'The door is opening...' : G.line('pd', ['"DO NOT ENTER (surprise in progress)". The door is locked.', 'Locked. You hear a faint rustle of paper on the other side.']));
          return;
      }
    },
    onCloseupClosed(id) {
      if (id === 'invite' && G.has('assembled') && !G.has('partyDoor')) openPartyDoor();
    },
    closeups: {
      assemble: {
        wide: true,
        render() {
          if (G.get('pieces', []).length < 6) {
            const n = G.get('pieces', []).length;
            let o = `<rect width="1000" height="650" fill="#4a3220" filter="url(#woodH)"/>`;
            const r = A.rng(5);
            for (let i = 0; i < n; i++) o += `<g transform="translate(${260 + i * 95} ${300 + (r() - .5) * 60}) rotate(${f((r() - .5) * 40)}) scale(3)" filter="url(#dropSm)"><path d="M-22 -10L6 -14L20 -9L24 6L10 12L-18 10L-24 0Z" fill="#f4ead2" stroke="#b69d74" stroke-width=".5"/><path d="M-14 -3H12M-12 3H8" stroke="#7a5a3a" stroke-width=".6" opacity=".55"/></g>`;
            o += `<text x="500" y="520" text-anchor="middle" font-family="Palatino Linotype, Georgia, serif" font-style="italic" font-size="24" fill="#f1dfb4">${n} of 6 pieces. The rest must still be hidden somewhere in the room.</text>`;
            return o;
          }
          return cuAssemble();
        },
        after(svg) { if (G.get('pieces', []).length >= 6) dragPieces(svg); }
      },
      invite: {
        render() {
          let o = `<rect width="1000" height="650" fill="#4a3220" filter="url(#woodH)"/>`;
          o += `<g transform="translate(500 325) scale(1.55) translate(-250 -175)" filter="url(#drop)">${inviteArt()}<g opacity=".35">${tornEdges()}</g></g>`;
          return o;
        }
      }
    },
    hints() {
      const H = G.has, got = G.get('pieces', []);
      if (got.length < 6) {
        if (got.length === 0 && !H('cat1Out') && !H('cat2Out')) return { key: 'p0', lines: ['What a mess! Someone has been busy — and something papery has been torn up.', 'Search the room: cushions, books, baskets, rugs... and anything with whiskers.', 'A good start: the cardboard box is wiggling, and there are glowing eyes in the cat tree.'] };
        const missing = PIECES.filter(p => !got.includes(p)).map(p => WHERE[p]);
        return { key: 'p' + got.length, lines: ['Scraps of a torn invitation are hidden around this room.', `You have found ${got.length} of 6. Look under, behind and inside things — and ask the cats.`, 'Still missing: ' + missing.join('; ') + '.'] };
      }
      if (!H('assembled')) return { key: 'a', lines: ['You have all six pieces!', 'Open the torn invitation from your bag.', 'Drag each piece onto the dotted card. Pieces with straight edges go on the outside.'] };
      return { key: 'e', lines: ['The invitation mentions the next door.', 'The door with the little sign is open now.', 'Click the open door on the right to enter.'] };
    }
  });

  async function openPartyDoor() {
    G.busy = true;
    await G.wait(400);
    Sound.play('unlock');
    await G.wait(600);
    Sound.play('creak', 1.8);
    G.set('partyDoor');
    const leaf = G.$('#partyLeaf'), b = G.$('#beyond3');
    if (leaf) leaf.classList.add('open');
    if (b) { b.style.transition = 'opacity 1.2s'; b.style.opacity = '1'; }
    await G.wait(900);
    Sound.play('sparkle');
    G.say('A soft click — the door with the sign swings open. Warm light spills out.', 4200);
    const w = G.$('#cat1 .catwrap'); if (w) { w.classList.remove('hop'); void w.getBBox(); w.classList.add('hop'); }
    G.busy = false;
  }
})();
