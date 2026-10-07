/* ===================== SCENE 2 — The Cozy Cottage ===================== */
(() => {
  const f = A.f;
  const SYMS = ['heart', 'crown', 'feather', 'bell', 'leaf', 'key'];
  const SOLUTION = [1, 2, 0]; // crown, feather, heart
  const SPECIAL = {
    sea: { title: 'Tales of the Sea', sym: 'crown', col: '#2f6a6e', row: 1, idx: 2 },
    oak: { title: 'The Whispering Oak', sym: 'feather', col: '#3d5a34', row: 2, idx: 8 },
    sky: { title: 'Atlas of the Night Sky', sym: 'heart', col: '#27345c', row: 0, idx: 7 }
  };
  const DECOYS = ['Knitting for Beginners', 'The Art of the Nap', 'Cats, Vol. 1', 'Cats, Vol. 2', 'Cats, Vol. 3', 'A Brief History of Tea',
    'Houseplants I Have Known', 'Collected Poems', 'Cooking with Butter', 'The Missing Sock', 'Garden Birds', 'Letters Home', 'Rainy Day Puzzles',
    'The Quiet Village', 'Sensible Shoes', 'Ghost Stories', 'French for Travellers', 'Advanced Napping', 'Birthday Cakes', 'Jam & Jelly',
    'A Year of Walks', 'Old Recipes', 'Clocks & Watches', 'The Red Umbrella', 'Needlepoint', 'Village Tales', 'Pressed Flowers', 'Etiquette',
    'Mystery at Noon', 'Tea for Two', 'The Blue Kettle', 'Buttons', 'Almanac 1987', 'Stitches', 'Hats', 'On Biscuits', 'Kettles', 'Recipes II', 'A Long Winter', 'Letters', 'Scones', 'Wool', 'Umbrellas', 'Attic Finds', 'Old Songs', 'Crumbs', 'Sonnets', 'The Pantry', 'Lace', 'Marmalade', 'Diary', 'Jigsaws', 'Scarves'];
  const DECOY_LINES = {
    'Cats, Vol. 1': 'Volume one of forty-seven. Someone has chewed the corner.',
    'Cats, Vol. 2': 'Volume two. A paw print marks chapter three: "Knocking Things Off Tables".',
    'Cats, Vol. 3': 'Volume three is suspiciously warm. Someone was sleeping on it.',
    'Birthday Cakes': 'A page is folded at "Cakes Cats Can Help With". Worrying.',
    'The Art of the Nap': 'Heavily annotated. In paw prints.',
    'Advanced Napping': 'The sequel. Even more annotated.'
  };

  /* ---------- background ---------- */
  function bg() {
    const r = A.rng(4242);
    let o = `<defs>
      <linearGradient id="s2wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b89a74"/><stop offset=".5" stop-color="#d9c29c"/><stop offset="1" stop-color="#c9ad86"/></linearGradient>
      <radialGradient id="s2warm" cx="380" cy="600" r="900" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffb05a" stop-opacity=".35"/><stop offset=".5" stop-color="#ff9a40" stop-opacity=".08"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
      <linearGradient id="s2floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6d4526"/><stop offset="1" stop-color="#9a6a40"/></linearGradient>
      <linearGradient id="s2beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a2618"/><stop offset="1" stop-color="#5e3f27"/></linearGradient>
      <linearGradient id="s2outside" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfe1e4"/><stop offset=".55" stop-color="#f6e6bf"/><stop offset="1" stop-color="#9fb46d"/></linearGradient>
      <linearGradient id="s2curtain" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7e3f44"/><stop offset=".3" stop-color="#a45a5c"/><stop offset=".55" stop-color="#8a474b"/><stop offset=".8" stop-color="#b06a69"/><stop offset="1" stop-color="#733a3e"/></linearGradient>
      <linearGradient id="s2oak" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5a3a22"/><stop offset=".5" stop-color="#7a5232"/><stop offset="1" stop-color="#5a3a22"/></linearGradient>
      <linearGradient id="s2sofa" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7f9676"/><stop offset="1" stop-color="#4d6148"/></linearGradient>
      <linearGradient id="s2soot" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0c0806"/><stop offset="1" stop-color="#3a2014"/></linearGradient>
    </defs>`;
    // walls
    o += `<rect width="1600" height="720" fill="url(#s2wall)" filter="url(#tex)"/>`;
    o += `<rect width="1600" height="720" fill="url(#s2warm)"/>`;
    // ceiling beams
    o += `<g filter="url(#woodH)"><rect x="0" y="0" width="1600" height="54" fill="url(#s2beam)"/><rect x="0" y="54" width="1600" height="12" fill="#2a1a0f"/></g>`;
    for (let x = 60; x < 1600; x += 260) o += `<path d="M${x} 0H${x + 44}V54H${x}Z" fill="#2e1d12" opacity=".6"/>`;
    o += `<rect x="0" y="66" width="1600" height="60" fill="#2a1a0c" opacity=".25" filter="url(#b8)"/>`;
    // wainscot
    o += `<g filter="url(#woodV)"><rect x="0" y="560" width="1600" height="160" fill="#6e4a2e"/></g><rect x="0" y="556" width="1600" height="10" fill="#4a2f1b"/><rect x="0" y="556" width="1600" height="3" fill="#8e6645"/>`;
    for (let x = 20; x < 1600; x += 120) o += `<rect x="${x}" y="584" width="96" height="112" rx="3" fill="none" stroke="#4a2f1b" stroke-width="3" opacity=".7"/><rect x="${x + 2}" y="586" width="96" height="112" rx="3" fill="none" stroke="#9a7250" stroke-width="1" opacity=".4"/>`;
    // floor
    o += `<rect x="0" y="716" width="1600" height="184" fill="url(#s2floor)"/><g filter="url(#woodH)"><rect x="0" y="716" width="1600" height="184" fill="#8a5a33" opacity=".6"/></g>`;
    for (let i = -14; i <= 14; i++) o += `<path d="M${800 + i * 40} 716L${800 + i * 110} 900" stroke="#4a2c16" stroke-width="1.6" opacity=".55"/>`;
    [740, 772, 812, 862].forEach(y => { o += `<path d="M0 ${y}H1600" stroke="#4a2c16" stroke-width="1" opacity=".25"/>`; });
    o += `<rect x="0" y="712" width="1600" height="10" fill="#3a2414"/>`;
    // chimney breast + fireplace
    o += `<rect x="210" y="66" width="340" height="300" fill="#cdb28a" filter="url(#tex)"/><rect x="205" y="66" width="8" height="300" fill="#2a1a0c" opacity=".2" filter="url(#b4)"/>`;
    o += `<g filter="url(#texStone)">${A.stones(r, 188, 362, 384, 346, ['#b8a78a', '#a8977a', '#c4b394', '#9e8d71', '#b3a283'], { rh: 42, wmin: 50, wmax: 110 })}</g>`;
    o += `<path d="M270 700V510A105 64 0 0 1 480 510V700Z" fill="url(#s2soot)"/>`;
    o += `<g opacity=".55">`;
    for (let y = 520; y < 700; y += 16) for (let x = 280 + ((y / 16) % 2) * 14; x < 470; x += 28) o += `<rect x="${x}" y="${y}" width="25" height="13" fill="#5a2c18"/>`;
    o += `</g><path d="M270 700V510A105 64 0 0 1 480 510V700Z" fill="url(#s2soot)" opacity=".55"/>`;
    o += `<g filter="url(#texStone)"><path d="M180 700H580L600 730H160Z" fill="#9e9079"/></g>`;
    o += `<g filter="url(#woodH)"><rect x="168" y="330" width="424" height="34" rx="3" fill="#5c3a22"/></g><rect x="168" y="330" width="424" height="5" fill="#8a603e"/><rect x="176" y="364" width="408" height="12" fill="#1c1008" opacity=".35" filter="url(#b4)"/>`;
    // painting above the mantel (the garden)
    o += `<g filter="url(#drop)"><rect x="286" y="136" width="188" height="150" fill="#6b4a22"/></g><rect x="296" y="146" width="168" height="130" fill="url(#brass)"/>`;
    o += `<rect x="304" y="154" width="152" height="114" fill="#b9cbbf"/><path d="M304 230Q360 206 456 222V268H304Z" fill="#6f8d4a"/><path d="M344 268V214L380 190L416 214V268Z" fill="#c9b596"/><path d="M340 216L380 184L420 216" fill="#7a5444"/><path d="M372 268V238H388V268Z" fill="#4f6f67"/>${A.bush(r, 320, 236, 18, 18, 18, ['#3a5a31', '#4d7040', '#628650'], 6, 10)}${A.bush(r, 440, 238, 16, 16, 16, ['#3a5a31', '#4d7040', '#628650'], 6, 10)}`;
    // mantel items
    o += `<g><rect x="200" y="290" width="10" height="40" fill="#efe6d4"/><path d="M196 330H214V325H196Z" fill="url(#brass)"/><rect x="545" y="296" width="10" height="34" fill="#efe6d4"/><path d="M541 330H559V325H541Z" fill="url(#brass)"/></g>`;
    o += `<g transform="translate(250 330)">${A.bush(r, 0, -14, 22, 16, 30, ['#2f4a2a', '#3e5d33', '#57783f', '#7a9a5a'], 6, 10)}<path d="M-12 0L-9 -14H9L12 0Z" fill="url(#terracotta)"/></g>`;
    o += `<g transform="translate(502 330)"><rect x="-16" y="-44" width="30" height="42" rx="2" fill="#6b4a22"/><rect x="-12" y="-40" width="22" height="30" fill="#e8dcc0"/><circle cx="-1" cy="-28" r="6" fill="#b0826a" opacity=".6"/></g>`;
    // window
    o += `<rect x="606" y="140" width="248" height="330" fill="#8a6a48"/><rect x="620" y="152" width="220" height="306" fill="url(#s2outside)"/>`;
    o += `<g filter="url(#b2)">${A.bush(r, 660, 400, 70, 60, 60, ['#4a6a42', '#5c7d4d', '#76955d', '#93ad72'], 12, 20)}${A.bush(r, 800, 380, 80, 70, 60, ['#4a6a42', '#5c7d4d', '#76955d', '#93ad72'], 12, 20)}`;
    for (let i = 0; i < 14; i++) o += A.rose(630 + r() * 200, 330 + r() * 110, 1, ['#b86470', '#e08f96', '#f8cdd0']);
    o += `</g><rect x="620" y="152" width="220" height="306" fill="#fff4d8" opacity=".25"/>`;
    o += `<path d="M727 152V458M620 305H840" stroke="#e8dcc4" stroke-width="8"/><rect x="620" y="152" width="220" height="306" fill="none" stroke="#e8dcc4" stroke-width="8"/>`;
    o += `<rect x="598" y="458" width="264" height="20" rx="2" fill="#a07a55"/>`;
    // curtains
    o += `<g filter="url(#tex)"><path d="M586 110H646Q640 300 666 380Q622 470 596 520H578Q592 360 586 110Z" fill="url(#s2curtain)"/><path d="M874 110H814Q820 300 794 380Q838 470 864 520H882Q868 360 874 110Z" fill="url(#s2curtain)"/></g>`;
    o += `<path d="M650 380Q640 392 628 384" stroke="#d9b36b" stroke-width="5" fill="none"/><path d="M810 380Q820 392 832 384" stroke="#d9b36b" stroke-width="5" fill="none"/>`;
    o += `<rect x="572" y="100" width="316" height="16" rx="8" fill="url(#brass)"/><circle cx="572" cy="108" r="11" fill="url(#brass)"/><circle cx="888" cy="108" r="11" fill="url(#brass)"/>`;
    // sideboard
    o += `<ellipse cx="730" cy="714" rx="160" ry="10" fill="#1a0f06" opacity=".5" filter="url(#b4)"/>`;
    o += `<g filter="url(#woodV)"><rect x="600" y="534" width="260" height="170" fill="url(#s2oak)"/></g><g filter="url(#woodH)"><rect x="590" y="518" width="280" height="18" rx="3" fill="#6e4a2d"/></g>`;
    o += `<rect x="612" y="546" width="236" height="34" fill="none" stroke="#3e2615" stroke-width="2"/><path d="M730 546V580" stroke="#3e2615" stroke-width="2"/><circle cx="671" cy="563" r="4" fill="url(#brass)"/><circle cx="789" cy="563" r="4" fill="url(#brass)"/>`;
    o += `<rect x="612" y="590" width="60" height="104" fill="none" stroke="#3e2615" stroke-width="2"/><rect x="788" y="590" width="60" height="104" fill="none" stroke="#3e2615" stroke-width="2"/><path d="M606 704V716M854 704V716" stroke="#3e2615" stroke-width="8"/>`;
    o += `<rect x="676" y="586" width="108" height="112" fill="#1f130a"/>`;
    // vase on sideboard
    o += `<g transform="translate(640 518)"><path d="M-10 0Q-16 -20 -8 -34H8Q16 -20 10 0Z" fill="#7a95a8"/><path d="M-6 -30H6" stroke="#fff" opacity=".4"/>${A.bush(r, 0, -52, 26, 22, 30, ['#3e5d33', '#57783f', '#7a9a5a'], 6, 11, { noBase: true })}${[0, 1, 2, 3, 4, 5].map(i => `<circle cx="${f(-16 + r() * 32)}" cy="${f(-66 + r() * 26)}" r="4" fill="${['#e9c46a', '#f4e1a4', '#e8a0a8'][i % 3]}"/>`).join('')}</g>`;
    o += `<g transform="translate(820 518)"><rect x="-22" y="-6" width="44" height="6" fill="#5a3a22"/><rect x="-20" y="-18" width="40" height="12" fill="#8a3b36"/><rect x="-18" y="-28" width="36" height="10" fill="#3d5a34"/></g>`;
    // door frame for the side door
    o += `<rect x="878" y="236" width="176" height="480" fill="#5a3a22"/><rect x="886" y="244" width="160" height="472" fill="#140c07"/>`;
    // bookshelf
    o += `<ellipse cx="1250" cy="728" rx="200" ry="12" fill="#1a0f06" opacity=".5" filter="url(#b4)"/>`;
    o += `<g filter="url(#woodV)"><rect x="1080" y="80" width="340" height="646" fill="#5e3d24"/></g><rect x="1096" y="96" width="308" height="618" fill="#2a190e"/>`;
    const shelvesY = [96, 222, 348, 474, 600, 714];
    for (let s = 0; s < 5; s++) {
      const y0 = shelvesY[s], y1 = shelvesY[s + 1] - 14;
      let x = 1100;
      while (x < 1396) {
        if (r() < .08 && x < 1340) { // ornament
          const k = Math.floor(r() * 3);
          if (k === 0) o += `<g transform="translate(${x + 20} ${y1})"><circle cy="-22" r="18" fill="#6f8fa8"/><path d="M-18 -22H18M0 -40V-4" stroke="#e8dcc0" stroke-width="1" opacity=".6"/><path d="M-10 0H10L6 -6H-6Z" fill="url(#brass)"/></g>`;
          if (k === 1) o += `<g transform="translate(${x + 18} ${y1})">${A.bush(r, 0, -26, 18, 16, 20, ['#2f4a2a', '#3e5d33', '#57783f'], 6, 10)}<path d="M-10 0L-8 -14H8L10 0Z" fill="#c7b8a0"/></g>`;
          if (k === 2) o += `<g transform="translate(${x + 18} ${y1})"><path d="M-10 0V-20Q-10 -34 0 -34Q10 -34 10 -20V0Z" fill="#3a3d44"/><path d="M-9 -30L-12 -40L-4 -34M9 -30L12 -40L4 -34" fill="#3a3d44"/></g>`;
          x += 40; continue;
        }
        const w = 12 + r() * 16, h = (y1 - y0) * (.62 + r() * .33);
        const c = ['#6b2f2a', '#3d5a34', '#27345c', '#8a6a2a', '#5a3a5a', '#2f6a6e', '#7a4a2a', '#b89a6a', '#4a2a1a', '#8a3b36'][Math.floor(r() * 10)];
        if (r() < .1 && x < 1360) { o += `<g transform="rotate(-14 ${x} ${y1})"><rect x="${f(x)}" y="${f(y1 - h)}" width="${f(w)}" height="${f(h)}" fill="${c}"/></g>`; x += w + 14; continue; }
        o += `<rect x="${f(x)}" y="${f(y1 - h)}" width="${f(w)}" height="${f(h)}" fill="${c}"/><rect x="${f(x)}" y="${f(y1 - h * .85)}" width="${f(w)}" height="2" fill="#d9b36b" opacity=".5"/><rect x="${f(x)}" y="${f(y1 - h * .2)}" width="${f(w)}" height="2" fill="#d9b36b" opacity=".4"/><rect x="${f(x + w - 3)}" y="${f(y1 - h)}" width="3" height="${f(h)}" fill="#000" opacity=".25"/>`;
        x += w + .8;
      }
      o += `<g filter="url(#woodH)"><rect x="1090" y="${y1}" width="320" height="14" fill="#6e4a2d"/></g><rect x="1090" y="${y1}" width="320" height="3" fill="#8a603e"/>`;
    }
    o += `<rect x="1096" y="96" width="308" height="618" fill="#000" opacity=".12"/><rect x="1072" y="70" width="356" height="16" fill="#6e4a2d"/>`;
    // rug
    o += `<ellipse cx="800" cy="808" rx="420" ry="76" fill="#6a2a2a"/><ellipse cx="800" cy="808" rx="392" ry="64" fill="none" stroke="#c9a46a" stroke-width="6"/><ellipse cx="800" cy="808" rx="360" ry="54" fill="#7e3a34"/><ellipse cx="800" cy="808" rx="250" ry="34" fill="none" stroke="#2f4a5a" stroke-width="10"/><ellipse cx="800" cy="808" rx="150" ry="20" fill="#c9a46a" opacity=".7"/>`;
    for (let a = 0; a < 24; a++) { const t = a / 24 * Math.PI * 2; o += `<circle cx="${f(800 + Math.cos(t) * 305)}" cy="${f(808 + Math.sin(t) * 46)}" r="5" fill="#d9b36b" opacity=".8"/>`; }
    o += `<ellipse cx="800" cy="808" rx="420" ry="76" fill="none" stroke="#3a1818" stroke-width="2" filter="url(#tex)"/>`;
    return o;
  }

  /* ---------- foreground ---------- */
  function fg() {
    const r = A.rng(99);
    const H = G.has;
    let o = `<defs>
      <radialGradient id="s2fireglow" cx=".5" cy=".7" r=".6"><stop offset="0" stop-color="#ffcf73" stop-opacity=".9"/><stop offset="1" stop-color="#ff7a20" stop-opacity="0"/></radialGradient>
      <radialGradient id="s2roomglow" cx="375" cy="620" r="700" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffa550" stop-opacity=".32"/><stop offset=".6" stop-color="#ff8a30" stop-opacity=".06"/><stop offset="1" stop-color="#ff8a30" stop-opacity="0"/></radialGradient>
      <linearGradient id="s2beamlight" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff2cc" stop-opacity=".35"/><stop offset="1" stop-color="#fff2cc" stop-opacity="0"/></linearGradient>
      <linearGradient id="s2door" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6d808a"/><stop offset=".5" stop-color="#859aa3"/><stop offset="1" stop-color="#6a7c86"/></linearGradient>
      <radialGradient id="s2beyond" cx=".5" cy=".6" r=".7"><stop offset="0" stop-color="#e7c894"/><stop offset="1" stop-color="#5a5a3e"/></radialGradient>
      <linearGradient id="s2sofa" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7f9676"/><stop offset="1" stop-color="#4d6148"/></linearGradient>
      <linearGradient id="s2cloth" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6efe0"/><stop offset="1" stop-color="#d8ccb4"/></linearGradient>
      <radialGradient id="s2balloon" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#f7d99a"/><stop offset=".5" stop-color="#d9a54a"/><stop offset="1" stop-color="#9a6a22"/></radialGradient>
    </defs>`;
    // fire
    o += `<g data-hot="fire"><path d="M280 700V520A95 58 0 0 1 470 520V700Z" fill="transparent"/>`;
    o += `<ellipse class="flicker" cx="375" cy="650" rx="120" ry="70" fill="url(#s2fireglow)" filter="url(#b16)"/>`;
    o += `<g transform="translate(375 686)"><path d="M-80 0Q-40 -18 10 -10L70 -2Q60 12 0 10Z" fill="#3a2214"/><path d="M-70 4Q0 -12 76 6Q40 16 -60 14Z" fill="#4e2e1a"/><ellipse cx="-72" cy="4" rx="8" ry="10" fill="#8a603e"/><ellipse cx="74" cy="6" rx="7" ry="9" fill="#8a603e"/>`;
    const flame = (x, h, w, c, cls, d) => `<path class="flame ${cls}" style="animation-delay:${d}s" d="M${x - w} -4C${x - w} ${-h * .4} ${x - w * .3} ${-h * .6} ${x} ${-h}C${x + w * .3} ${-h * .6} ${x + w} ${-h * .4} ${x + w} -4Z" fill="${c}"/>`;
    o += flame(-30, 90, 26, '#d45d1c', 'a', 0) + flame(20, 110, 30, '#d45d1c', 'b', -.4) + flame(50, 70, 22, '#d45d1c', 'c', -.8);
    o += flame(-26, 70, 18, '#f39a34', 'b', -.2) + flame(16, 88, 22, '#f39a34', 'a', -.6) + flame(46, 52, 15, '#f39a34', 'c', -.3);
    o += flame(-20, 42, 11, '#ffe08a', 'c', -.1) + flame(14, 56, 13, '#ffe08a', 'a', -.5) + flame(42, 30, 9, '#ffe08a', 'b', -.7);
    for (let i = 0; i < 8; i++) o += `<circle class="ember" cx="${f(-50 + r() * 100)}" cy="-30" r="1.8" fill="#ffc870" style="animation-delay:${f(-r() * 3)}s;animation-duration:${f(2 + r() * 2)}s"/>`;
    o += `</g></g>`;
    // clock on the mantel
    o += `<g data-hot="clock" transform="translate(440 330)"><path d="M-30 0V-40Q-30 -66 0 -66Q30 -66 30 -40V0Z" fill="#5c3a22"/><circle cy="-38" r="20" fill="#f3ead6" stroke="url(#brass)" stroke-width="3"/><path id="hand1" d="M0 -38V-52" stroke="#2a1a0f" stroke-width="2" class="clockhand"/><path d="M0 -38L9 -33" stroke="#2a1a0f" stroke-width="2"/><circle cy="-38" r="2" fill="#2a1a0f"/></g>`;
    // bunting along the mantel
    o += `<g data-hot="bunting" class="swayTop"><path d="M180 366Q380 400 580 366" stroke="#e7d9b8" stroke-width="1.5" fill="none"/>`;
    for (let i = 0; i < 11; i++) {
      const t = (i + .5) / 11, x = 180 + t * 400, y = 366 + Math.sin(t * Math.PI) * 26;
      o += `<path d="M${f(x - 14)} ${f(y)}L${f(x + 14)} ${f(y)}L${f(x)} ${f(y + 30)}Z" fill="${['#d99a9a', '#e9d3a4', '#9fb59a', '#b7c4d8'][i % 4]}"/><path d="M${f(x - 14)} ${f(y)}L${f(x + 14)} ${f(y)}" stroke="#fff" opacity=".4"/>`;
    }
    o += `</g>`;
    // sunbeam from the window
    o += `<path class="noev rays" d="M620 160L840 160L1180 900H760Z" fill="url(#s2beamlight)" opacity=".5"/>`;
    // window hotspot
    o += `<g data-hot="window"><rect x="620" y="152" width="220" height="306" fill="transparent"/></g>`;
    // the locked cabinet in the sideboard
    const open = H('cabinetOpen');
    o += `<g data-hot="cabinet"><rect x="676" y="586" width="108" height="112" fill="#140b05"/>`;
    if (open) {
      o += `<rect x="684" y="640" width="92" height="4" fill="#3a2414"/>`;
      if (!H('gift')) o += `<g transform="translate(730 690)"><rect x="-24" y="-30" width="48" height="30" fill="#efe3c8"/><rect x="-4" y="-30" width="8" height="30" fill="#b86a72"/><path d="M0 -30C-14 -44 -22 -30 0 -30C22 -30 14 -44 0 -30Z" fill="#b86a72"/></g>`;
    }
    o += `<g id="cabDoor" class="${open ? 'open' : ''}"><g filter="url(#woodV)"><rect x="678" y="588" width="104" height="108" fill="#6a4428"/></g><rect x="688" y="598" width="84" height="88" fill="none" stroke="#3e2615" stroke-width="2"/>`;
    [704, 730, 756].forEach(x => { o += `<circle cx="${x}" cy="642" r="10" fill="url(#brass)" stroke="#5a3a12"/><circle cx="${x}" cy="642" r="5" fill="#8a5f1f" opacity=".5"/>`; });
    o += `<rect x="722" y="664" width="16" height="10" rx="2" fill="url(#brass)"/></g></g>`;
    // the side door (to the cats' room)
    const cd = H('catDoorOpen');
    o += `<g data-hot="catdoor"><g id="beyond" opacity="${cd ? 1 : 0}"><rect x="886" y="244" width="160" height="472" fill="url(#s2beyond)"/><rect x="886" y="600" width="160" height="116" fill="#8a6a44" opacity=".6"/><circle cx="950" cy="690" r="12" fill="#c8545a"/><path d="M950 690Q990 700 1010 680" stroke="#c8545a" stroke-width="2" fill="none"/><rect x="900" y="300" width="60" height="80" fill="#fff4d0" opacity=".35"/></g>`;
    o += `<g id="catDoorLeaf" class="${cd ? 'open' : ''}"><rect x="886" y="244" width="160" height="472" fill="url(#s2door)" filter="url(#tex)"/>`;
    o += `<rect x="904" y="266" width="124" height="180" rx="3" fill="none" stroke="#56666f" stroke-width="3"/><rect x="904" y="470" width="124" height="220" rx="3" fill="none" stroke="#56666f" stroke-width="3"/><rect x="906" y="268" width="124" height="180" rx="3" fill="none" stroke="#a9bcc4" stroke-width="1" opacity=".5"/>`;
    o += `<circle cx="1028" cy="468" r="9" fill="url(#brass)"/><rect x="1022" y="480" width="12" height="20" rx="3" fill="url(#brass)"/>`;
    o += `<path d="M920 700L926 666M928 702L934 670M936 702L940 674M990 704L994 676M998 704L1000 680" stroke="#4a5860" stroke-width="1.6" opacity=".7"/>`;
    o += `<rect x="886" y="244" width="160" height="472" fill="#000" opacity=".08"/></g></g>`;
    // portrait of two very distinguished cats above the door
    o += `<g data-hot="portrait"><ellipse cx="966" cy="150" rx="62" ry="72" fill="url(#brass)" filter="url(#dropSm)"/><ellipse cx="966" cy="150" rx="52" ry="62" fill="#3c4a3a"/>`;
    o += `<g transform="translate(944 204) scale(.3)">${A.cat(CONFIG.cats.one, { id: 'pc1', bow: '#8a2a34' })}</g><g transform="translate(990 206) scale(.28)">${A.cat(CONFIG.cats.two, { id: 'pc2', bow: '#2f4a6a' })}</g>`;
    o += `<ellipse cx="966" cy="150" rx="52" ry="62" fill="none" stroke="#5a3a12" stroke-width="2"/></g>`;
    // bookshelf hotspot = the bookshelf itself
    o += `<g data-hot="shelf"><rect x="1080" y="80" width="340" height="646" fill="transparent"/></g>`;
    // a single balloon tied to the shelf
    o += `<g data-hot="balloon"><path d="M1086 520Q1070 420 1062 260" stroke="#d8cbb0" stroke-width="1.4" fill="none"/><g class="bob"><ellipse cx="1060" cy="214" rx="34" ry="42" fill="url(#s2balloon)"/><path d="M1056 256L1064 256L1060 262Z" fill="#9a6a22"/><ellipse cx="1048" cy="198" rx="8" ry="13" fill="#fff" opacity=".35"/></g></g>`;
    // sofa (foreground left)
    o += `<g data-hot="sofa"><path d="M0 760Q30 720 120 716H470Q520 716 530 760V900H0Z" fill="url(#s2sofa)" filter="url(#tex)"/><path d="M0 800H540" stroke="#3d4f39" stroke-width="3" opacity=".6"/>`;
    o += `<path d="M40 760Q20 700 60 680Q130 666 190 690Q210 720 200 764Z" fill="#c9a24a"/><path d="M60 684Q120 676 186 694" stroke="#fff" opacity=".25" fill="none" stroke-width="3"/>${[[50, 760], [196, 764]].map(([x, y]) => `<path d="M${x} ${y}l-6 16M${x + 3} ${y}l0 16" stroke="#9a7a2a" stroke-width="2"/>`).join('')}`;
    o += `<path d="M220 760Q210 700 250 688Q320 676 380 700Q392 730 386 766Z" fill="#8a5a6a"/>`;
    for (let i = 0; i < 12; i++) o += `<circle cx="${f(240 + r() * 130)}" cy="${f(700 + r() * 56)}" r="${f(3 + r() * 3)}" fill="${['#e9c4c4', '#f4e6c8', '#a7bc98'][i % 3]}" opacity=".85"/>`;
    o += `<path d="M300 716Q380 704 470 716Q500 780 480 900H330Q350 800 300 716Z" fill="#e7dcc4" opacity=".95"/>`;
    for (let y = 730; y < 900; y += 12) o += `<path d="M${f(320 + (y - 716) * .1)} ${y}H${f(478 + Math.sin(y) * 4)}" stroke="#c9b89a" stroke-width="2" stroke-dasharray="4 3" opacity=".7"/>`;
    o += `</g>`;
    // tea table (foreground right)
    o += `<g><path d="M1050 800Q1060 900 1050 900H1460Q1450 900 1460 800Z" fill="url(#s2cloth)"/>`;
    for (let x = 1058; x < 1456; x += 18) o += `<path d="M${x} 900q9 -12 18 0" fill="#fbf6ea" stroke="#d8ccb4" stroke-width="1"/>`;
    o += `<ellipse cx="1255" cy="800" rx="206" ry="42" fill="#f6efe0"/><ellipse cx="1255" cy="800" rx="196" ry="36" fill="none" stroke="#e2d6be" stroke-width="2" stroke-dasharray="3 5"/></g>`;
    // note under the saucer
    if (!H('note2')) o += `<g data-hot="note"><path d="M1112 792L1170 780L1178 808L1120 820Z" fill="#efe2c4" stroke="#a88e62" stroke-width="1"/><path d="M1122 798L1156 790M1126 806L1152 800" stroke="#5b4630" stroke-width="1" opacity=".55"/></g>`;
    o += `<g data-hot="teacup"><ellipse cx="1198" cy="790" rx="40" ry="11" fill="#f3ede1" stroke="#c1b59e"/><ellipse cx="1198" cy="788" rx="26" ry="6" fill="#e8e0d0"/><path d="M1178 766H1218Q1218 790 1198 790Q1178 790 1178 766Z" fill="#f7f2e7"/><ellipse cx="1198" cy="766" rx="20" ry="5" fill="#9a6a3a"/><path d="M1218 770Q1232 770 1228 780Q1224 786 1214 784" stroke="#e8e0d0" stroke-width="4" fill="none"/>${[1186, 1198, 1210].map(x => `<circle cx="${x}" cy="778" r="2.4" fill="#b86a72" opacity=".7"/>`).join('')}<path class="steam" d="M1192 758Q1186 744 1194 732Q1200 720 1194 706" stroke="#fff" stroke-width="3" fill="none" opacity=".35"/></g>`;
    o += `<g data-hot="cookie"><ellipse cx="1300" cy="796" rx="34" ry="9" fill="#e8e0d0" stroke="#c1b59e"/><ellipse cx="1296" cy="791" rx="14" ry="5" fill="#c68a4a"/><path d="M1282 790A14 5 0 0 1 1290 787L1289 791L1293 788L1292 793Z" fill="#e8e0d0"/><circle cx="1312" cy="793" r="3" fill="#c68a4a"/><circle cx="1320" cy="796" r="2" fill="#c68a4a"/></g>`;
    o += `<g data-hot="vase"><path d="M1360 800Q1346 780 1354 758H1378Q1386 780 1372 800Z" fill="#7a95a8"/><g class="sway">${A.bush(r, 1366, 738, 28, 24, 30, ['#3e5d33', '#57783f', '#7a9a5a'], 6, 11, { noBase: true })}${[0, 1, 2, 3, 4, 5, 6].map(i => `<circle cx="${f(1346 + r() * 40)}" cy="${f(716 + r() * 36)}" r="5" fill="${['#e8a0b8', '#c9a6d8', '#f4d6de'][i % 3]}"/>`).join('')}</g></g>`;
    // light & vignette
    o += `<rect class="noev flicker" width="1600" height="900" fill="url(#s2roomglow)" style="mix-blend-mode:screen"/>`;
    for (let i = 0; i < 14; i++) o += `<circle class="mote noev" cx="${f(700 + r() * 300)}" cy="${f(300 + r() * 400)}" r="${f(1 + r() * 1.5)}" fill="#fff6d0" style="animation-delay:${f(-r() * 14)}s"/>`;
    o += `<rect class="noev" width="1600" height="900" fill="url(#vignette)"/>`;
    return o;
  }

  /* ---------- close-ups ---------- */
  function spine(x, y, w, h, col, title, extra = '') {
    const tx = x + w / 2, ty = y + h - 14;
    return `<g ${extra}><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="${col}"/>
      <rect x="${x}" y="${y + 12}" width="${w}" height="4" fill="#d9b36b" opacity=".7"/><rect x="${x}" y="${y + h - 18}" width="${w}" height="4" fill="#d9b36b" opacity=".6"/>
      <rect x="${x + w - 6}" y="${y}" width="6" height="${h}" fill="#000" opacity=".25"/><rect x="${x + 2}" y="${y}" width="4" height="${h}" fill="#fff" opacity=".08"/>
      <text transform="translate(${f(tx + 5)} ${f(ty - 10)}) rotate(-90)" font-family="Palatino Linotype, Georgia, serif" font-size="${f(Math.min(w > 50 ? 16 : 14, (h - 30) / (title.length * .55)))}" fill="#f1dfb4" opacity=".92">${title}</text></g>`;
  }

  function cuShelf() {
    const found = G.get('books', []);
    const r = A.rng(31);
    let o = `<defs><linearGradient id="c5wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a5232"/><stop offset="1" stop-color="#5a3a22"/></linearGradient></defs>`;
    o += `<rect width="1000" height="650" fill="#24160c"/>`;
    const rows = [[36, 200], [236, 400], [436, 600]];
    let di = 0;
    rows.forEach(([top, bottom], ri) => {
      let x = 40, idx = 0;
      while (x < 950) {
        const sp = Object.entries(SPECIAL).find(([, s]) => s.row === ri && s.idx === idx);
        if (!sp && ri === 1 && idx === 6) { // ornament: little brass cat & candle
          o += `<g data-hot="ornament" transform="translate(${x + 40} ${bottom})"><path d="M-22 0V-40Q-22 -66 0 -66Q22 -66 22 -40V0Z" fill="url(#brass)"/><path d="M-20 -58L-24 -80L-8 -64M20 -58L24 -80L8 -64" fill="url(#brass)"/><circle cx="-8" cy="-46" r="3" fill="#3a2a10"/><circle cx="8" cy="-46" r="3" fill="#3a2a10"/><path d="M22 -10Q44 -14 40 -40" stroke="url(#brass)" stroke-width="6" fill="none"/></g>`;
          x += 90; idx++; continue;
        }
        const w = sp ? 58 : 36 + Math.floor(r() * 22);
        const h = sp ? (bottom - top) * .9 : (bottom - top) * (.7 + r() * .26);
        if (sp) {
          const [key, s] = sp;
          o += spine(x, bottom - h, w, h, s.col, s.title, `data-hot="book-${key}" class="bk"`);
          if (key === 'sky') for (let k = 0; k < 6; k++) o += `<circle cx="${f(x + 8 + r() * (w - 16))}" cy="${f(bottom - h + 24 + r() * 20)}" r="1.6" fill="#f1dfb4" class="noev"/>`;
          if (found.includes(key)) o += `<path class="noev" d="M${x + 16} ${bottom - h}V${bottom - h - 26}L${x + 22} ${bottom - h - 20}L${x + 28} ${bottom - h - 26}V${bottom - h}Z" fill="#b8323a"/>`;
        } else {
          const title = DECOYS[di++ % DECOYS.length];
          const col = ['#6b2f2a', '#5a3a5a', '#8a6a2a', '#7a4a2a', '#4a2a1a', '#8a3b36', '#6a5a3a', '#3a3a4a', '#b89a6a', '#5a4a2a'][Math.floor(r() * 10)];
          o += spine(x, bottom - h, w, h, col, title, `data-hot="decoy" data-title="${title}" class="bk"`);
        }
        x += w + 2; idx++;
      }
      o += `<g filter="url(#woodH)"><rect x="0" y="${bottom}" width="1000" height="26" fill="url(#c5wood)"/></g><rect x="0" y="${bottom}" width="1000" height="4" fill="#9a7050"/><rect x="0" y="${bottom + 26}" width="1000" height="12" fill="#000" opacity=".35" filter="url(#b4)"/>`;
    });
    o += `<rect width="1000" height="650" fill="#ffb060" opacity=".06" pointer-events="none"/>`;
    return o;
  }

  function cuPage(key) {
    const s = SPECIAL[key];
    let o = `<rect width="1000" height="650" fill="#3a2718" filter="url(#woodH)"/>`;
    o += `<g filter="url(#drop)"><path d="M120 110Q500 80 880 110L892 570Q500 548 108 570Z" fill="${s.col}"/></g>`;
    o += `<path d="M140 120Q320 92 498 130V548Q320 520 140 552Z" fill="url(#paperG)" filter="url(#texPaper)"/><path d="M860 120Q680 92 502 130V548Q680 520 860 552Z" fill="url(#paperG)" filter="url(#texPaper)"/>`;
    o += `<path d="M470 124Q490 132 500 130V548Q490 548 470 538Z" fill="#8a6a44" opacity=".25"/>`;
    o += `<text x="320" y="176" text-anchor="middle" font-family="Palatino Linotype, Georgia, serif" font-size="26" font-style="italic" fill="#4a3320">${s.title}</text>`;
    o += `<path d="M230 196H410" stroke="#8a6a44" stroke-width="1"/>`;
    // little engraved illustration
    o += `<g transform="translate(320 330)" stroke="#4a3320" stroke-width="1.6" fill="none" opacity=".8">`;
    if (key === 'sea') o += `<path d="M-120 40Q-100 28 -80 40T-40 40T0 40T40 40T80 40T120 40M-120 60Q-100 48 -80 60T-40 60T0 60T40 60T80 60T120 60"/><path d="M-50 30H50L36 50H-36Z"/><path d="M0 30V-70M0 -64L44 10H0M0 -50L-36 10H0"/>`;
    if (key === 'oak') o += `<path d="M-10 70Q-6 20 -12 -10M10 70Q6 20 14 -10M-60 70H60"/><path d="M-12 -10Q-90 -10 -70 -50Q-90 -100 -30 -100Q0 -130 40 -100Q100 -100 76 -50Q100 -10 14 -10"/><path d="M-40 -40Q-20 -60 0 -40M10 -70Q30 -80 40 -60"/>`;
    if (key === 'sky') o += `<circle cx="-60" cy="-40" r="26"/><path d="M-10 -80L20 -50L60 -70L90 -20L50 10M20 -50L10 0"/>${[[-10, -80], [20, -50], [60, -70], [90, -20], [50, 10], [10, 0]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="#4a3320"/>`).join('')}<path d="M-120 60Q0 30 120 60"/>`;
    o += `</g>`;
    for (let i = 0; i < 5; i++) o += `<rect x="190" y="${430 + i * 20}" width="${f(260 - (i * 37) % 60)}" height="3" rx="1.5" fill="#6b5236" opacity=".35"/>`;
    // the hidden mark on the right page
    o += `<rect x="580" y="170" width="220" height="220" fill="none" stroke="#8a6a44" stroke-width="1" stroke-dasharray="3 5" opacity=".6"/>`;
    o += A.sym(s.sym, 690, 280, 3.6, '#3a2616', 'opacity=".88"');
    o += `<text x="690" y="440" text-anchor="middle" font-family="Segoe Script, Segoe Print, cursive" font-size="22" fill="#5a3a22">Remember my sign.</text>`;
    o += `<path d="M602 470Q690 490 790 466" stroke="#5a3a22" stroke-width="1" fill="none" opacity=".4"/>`;
    return o;
  }

  function cuCabinet() {
    const meds = G.get('meds', [4, 0, 3]), open = G.has('cabinetOpen');
    let o = `<defs><radialGradient id="c6bg" cx=".5" cy=".45" r=".75"><stop offset="0" stop-color="#7a5232"/><stop offset="1" stop-color="#3a2414"/></radialGradient>
      <radialGradient id="c6med" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#f9e3a2"/><stop offset=".5" stop-color="#c9973f"/><stop offset="1" stop-color="#7a5118"/></radialGradient>
      <radialGradient id="c6inside" cx=".5" cy=".5" r=".7"><stop offset="0" stop-color="#4a2e1a"/><stop offset="1" stop-color="#1a0f07"/></radialGradient></defs>`;
    o += `<rect width="1000" height="650" fill="url(#c6bg)" filter="url(#woodV)"/>`;
    if (open) {
      o += `<rect x="150" y="80" width="700" height="500" fill="url(#c6inside)"/><rect x="150" y="440" width="700" height="12" fill="#5a3a22"/>`;
      if (!G.has('gift')) o += `<g data-hot="gift" transform="translate(500 440)" filter="url(#drop)">${giftBox(false, 1)}</g>`;
      else o += `<text x="500" y="300" text-anchor="middle" font-family="Palatino Linotype, Georgia, serif" font-style="italic" font-size="22" fill="#c9a46a" opacity=".6">Only a few stray cat hairs remain.</text>`;
      o += `<g transform="translate(150 80) scale(.16 1)"><rect width="700" height="500" fill="#6a4428" filter="url(#woodV)"/></g>`;
      return o;
    }
    o += `<rect x="150" y="80" width="700" height="500" rx="6" fill="#6a4428" filter="url(#woodV)"/>`;
    o += `<rect x="190" y="120" width="620" height="420" rx="4" fill="none" stroke="#3e2615" stroke-width="4"/><rect x="194" y="124" width="620" height="420" rx="4" fill="none" stroke="#9a7250" stroke-width="1.5" opacity=".5"/>`;
    // carved vines
    o += `<g stroke="#3e2615" stroke-width="3" fill="none" opacity=".6"><path d="M220 520Q300 480 380 520T540 520T700 520T790 500"/><path d="M220 150Q300 190 380 150T540 150T700 150T790 170"/></g>`;
    meds.forEach((m, i) => {
      const x = 300 + i * 200;
      o += `<g data-hot="med${i}"><circle cx="${x}" cy="320" r="84" fill="#2e1c0f"/><circle cx="${x}" cy="320" r="76" fill="url(#c6med)" stroke="#5a3a12" stroke-width="3"/><circle cx="${x}" cy="320" r="62" fill="none" stroke="#7a5118" stroke-width="2" opacity=".6"/>`;
      for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6; o += `<circle cx="${f(x + Math.cos(a) * 69)}" cy="${f(320 + Math.sin(a) * 69)}" r="2.4" fill="#7a5118"/>`; }
      o += `<g class="medsym" id="medsym${i}"><g filter="url(#engrave)">${A.sym(SYMS[m], x, 320, 2.1, '#5a3508')}</g></g></g>`;
      o += `<text x="${x}" y="450" text-anchor="middle" font-family="Palatino Linotype, Georgia, serif" font-size="30" fill="#e8c77a" opacity=".85">${['I', 'II', 'III'][i]}</text>`;
    });
    o += `<rect x="470" y="490" width="60" height="30" rx="5" fill="url(#brass)"/><path d="M500 498A5 5 0 0 1 503 507L505 514H495L497 507A5 5 0 0 1 500 498Z" fill="#2a1a0a"/>`;
    return o;
  }

  function giftBox(opened, s) {
    let o = `<g transform="scale(${s})">`;
    o += `<ellipse cx="0" cy="4" rx="150" ry="16" fill="#000" opacity=".3" filter="url(#b8)"/>`;
    o += `<g filter="url(#texPaper)"><path d="M-120 0V-150H120V0Z" fill="#efe3c8"/></g><path d="M-120 -150H120" stroke="#c9b58c" stroke-width="2"/>`;
    for (let k = 0; k < 14; k++) o += A.sym('paw', -100 + (k % 5) * 50, -130 + Math.floor(k / 5) * 50, .45, '#c9a58a', 'opacity=".5"');
    o += `<rect x="-14" y="-150" width="28" height="150" fill="#b86a72"/><rect x="-14" y="-150" width="6" height="150" fill="#fff" opacity=".2"/>`;
    if (!opened) {
      o += `<g id="giftLid"><path d="M-132 -150V-192H132V-150Z" fill="#f4e9d2"/><rect x="-14" y="-192" width="28" height="42" fill="#b86a72"/>`;
      o += `<path d="M0 -192C-60 -250 -110 -200 -30 -190C-110 -170 -40 -140 0 -192C40 -140 110 -170 30 -190C110 -200 60 -250 0 -192Z" fill="#c47a82" stroke="#9a4e58" stroke-width="2"/><circle cy="-192" r="12" fill="#a4545e"/>`;
      o += `<g transform="translate(70 -170) rotate(12)"><rect x="-40" y="-18" width="80" height="36" rx="3" fill="#fbf2df" stroke="#a88e62"/><circle cx="-32" r="3" fill="#a88e62"/><text x="4" y="7" text-anchor="middle" font-family="Segoe Script, Segoe Print, cursive" font-size="15" fill="#5a3a22">for Anne</text></g></g>`;
    }
    o += `</g>`;
    return o;
  }

  function cuGift() {
    const opened = G.has('gift');
    let o = `<defs><radialGradient id="c7bg" cx=".5" cy=".45" r=".8"><stop offset="0" stop-color="#8a5a36"/><stop offset="1" stop-color="#2e1c10"/></radialGradient></defs>`;
    o += `<rect width="1000" height="650" fill="url(#c7bg)"/><rect x="0" y="470" width="1000" height="180" fill="#4a2e1a" filter="url(#woodH)"/>`;
    o += `<g data-hot="giftbox" transform="translate(500 520)">${giftBox(opened, 1.35)}</g>`;
    if (opened) o += `<g data-hot="readnote" transform="translate(500 250)">${noteCard(.75)}</g>`;
    return o;
  }

  function noteCard(s) {
    return `<g transform="scale(${s})" filter="url(#drop)"><rect x="-260" y="-150" width="520" height="300" rx="4" fill="url(#paperG)" filter="url(#texPaper)"/><rect x="-244" y="-134" width="488" height="268" fill="none" stroke="#c9a46a" stroke-width="1.5"/>
      <text y="-58" text-anchor="middle" font-family="Segoe Script, Segoe Print, cursive" font-size="25" fill="#4a3320">Congratulations, ${CONFIG.name}!</text>
      <text y="-16" text-anchor="middle" font-family="Segoe Script, Segoe Print, cursive" font-size="19" fill="#4a3320">You've found your first birthday surprise.</text>
      <text y="36" text-anchor="middle" font-family="Segoe Script, Segoe Print, cursive" font-size="21" fill="#4a3320">But someone has been causing</text>
      <text y="68" text-anchor="middle" font-family="Segoe Script, Segoe Print, cursive" font-size="21" fill="#4a3320">trouble around here...</text>
      ${A.sym('paw', 200, 100, 1.1, '#5a3a2a', 'opacity=".8" transform-origin="0 0"')}</g>`;
  }

  /* ---------- items ---------- */
  G.item('riddle', { name: 'A note from under the saucer', view: 'riddle' });
  G.item('giftnote', { name: 'A note with a paw print', view: 'giftnote' });

  const S2 = {
    mood: 'interior',
    mission: () => ({ title: 'Find the hidden gift', text: `We're in! Somebody has been getting this cottage ready for a celebration. A little locked cabinet in this room has a gift inside. Find the clues that tell you how to open it: start by looking around the tea table and the bookshelf.` }),
    bg, fg,
    after() {},
    enter(resumed) {
      if (G.has('gift') && !G.has('catDoorOpen')) { openCatDoor(); return; }
      if (!resumed && !G.has('s2seen')) {
        G.set('s2seen');
      }
    },
    click(id, el) {
      const say = G.say, H = G.has;
      switch (id) {
        case 'note': Sound.play('page'); G.set('note2'); G.addItem('riddle'); G.refresh(); G.openCloseup('riddle'); return;
        case 'shelf': G.openCloseup('shelf'); return;
        case 'cabinet': G.openCloseup('cabinet'); return;
        case 'catdoor':
          if (H('catDoorOpen')) { G.goScene(3, { zoom: [966, 480] }); return; }
          Sound.play('rattle');
          if (H('gift')) say('Something is scratching on the other side...');
          else say(G.line('cd', ['Locked. You hear a faint scratching on the other side.', 'The door will not open. Something small thumps against it from within.']));
          return;
        case 'fire': Sound.play('fire'); say(G.line('fire', ['The fire crackles happily. Someone lit it not long ago.', 'Lovely and warm. There is a single cat hair on the hearthstone.'])); return;
        case 'clock': Sound.play('tick'); say('Tick, tock. It is exactly the right time for a surprise.'); return;
        case 'bunting': Sound.play('rustle'); say('Paper bunting. Someone is definitely planning a celebration.'); return;
        case 'window': say('The garden looks lovely from in here.'); return;
        case 'portrait': say(G.line('portrait', ['A portrait of two very distinguished cats. They look suspiciously pleased with themselves.', 'The cats in the painting seem to follow you with their eyes.'])); return;
        case 'balloon': Sound.play('pop'); el.classList.remove('wiggle'); void el.getBBox(); el.classList.add('wiggle'); say('A single golden balloon. Somebody is definitely planning something.'); return;
        case 'sofa': Sound.play('rustle'); say('Soft cushions — and one suspiciously cat-shaped dent.'); return;
        case 'teacup': say('Still warm. Whoever made this tea left in a hurry.'); return;
        case 'cookie': say('Tiny bite marks. Far too small for a person.'); return;
        case 'vase': Sound.play('rustle'); say('Sweet peas, freshly picked. One stem looks nibbled.'); return;
      }
    },
    onCloseupClosed(id) {
      if (G.has('gift') && !G.has('catDoorOpen') && !G.closeup) openCatDoor();
    },
    closeups: {
      riddle: {
        render() {
          const lines = ['Three stories guard this little door:', 'first, the tale that sails the sea;', 'then the one where old oaks sigh;', 'last, the map of the night-time sky.', 'Mark each sign, and turn them true —', 'a gift is waiting there for you.'];
          let o = `<rect width="1000" height="650" fill="#5a3a22" filter="url(#woodH)"/>`;
          o += `<g filter="url(#drop)"><path d="M210 50L790 40L800 610L200 616Z" fill="url(#paperG)" filter="url(#texPaper)"/></g>`;
          o += `<circle cx="690" cy="500" r="64" fill="none" stroke="#a07c5a" stroke-width="5" opacity=".25"/>`;
          lines.forEach((l, i) => { o += `<text x="500" y="${130 + i * 72}" text-anchor="middle" font-family="Segoe Script, Segoe Print, cursive" font-size="${i === 0 ? 27 : 26}" fill="#4a3320">${l}</text>`; });
          return o;
        }
      },
      shelf: {
        render: cuShelf,
        after(svg) {
          svg.querySelectorAll('.bk').forEach(b => { b.style.transition = 'transform .25s'; });
        },
        click(id, el) {
          if (id === 'decoy') {
            const t = el.dataset.title;
            el.style.transform = 'translateY(-14px)'; setTimeout(() => { el.style.transform = ''; }, 900);
            Sound.play('page');
            G.say(DECOY_LINES[t] || G.line('decoy', [`"${t}". Not this one.`, `"${t}". Interesting, but not what the riddle meant.`, `"${t}". Nothing hidden inside.`]), 2600);
            return;
          }
          if (id === 'ornament') { G.say('A little brass cat. It looks awfully smug.'); return; }
          const m = id.match(/^book-(\w+)$/);
          if (m) {
            const key = m[1], found = G.get('books', []);
            el.style.transform = 'translateY(-30px)';
            setTimeout(() => {
              if (!found.includes(key)) { found.push(key); G.put('books', found); Sound.play('discover'); }
              G.openCloseup('page', key, { stack: true });
            }, 300);
          }
        }
      },
      page: {
        backToParent: true,   // closing a book returns to the bookshelf, not to the room
        render: cuPage,
        after(svg, key) {
          const n = G.get('books', []).length;
          if (n === 3) setTimeout(() => G.say('Three books, three signs. Now, where might signs be turned?', 3600), 500);
        }
      },
      cabinet: {
        render: cuCabinet,
        click(id, el) {
          const m = id.match(/^med(\d)$/);
          if (m && !G.has('cabinetOpen')) {
            const i = +m[1], meds = G.get('meds', [4, 0, 3]).slice();
            meds[i] = (meds[i] + 1) % SYMS.length; G.put('meds', meds);
            Sound.play('click');
            const g = document.getElementById('medsym' + i);
            g.style.transition = 'transform .25s, opacity .25s'; g.style.transformBox = 'fill-box'; g.style.transformOrigin = 'center'; g.style.transform = 'rotate(90deg) scale(.6)'; g.style.opacity = '0';
            setTimeout(() => {
              G.refreshCloseup();
              const g2 = document.getElementById('medsym' + i);
              g2.style.transformBox = 'fill-box'; g2.style.transformOrigin = 'center'; g2.style.transform = 'rotate(-90deg) scale(.6)'; g2.style.opacity = '0';
              requestAnimationFrame(() => requestAnimationFrame(() => { g2.style.transition = 'transform .3s, opacity .3s'; g2.style.transform = ''; g2.style.opacity = '1'; }));
              if (meds.every((v, k) => v === SOLUTION[k])) {
                G.busy = true;
                setTimeout(() => { Sound.play('unlock'); }, 400);
                setTimeout(() => { Sound.play('creak', 1.2); G.set('cabinetOpen'); G.refreshCloseup(); G.refresh(); G.busy = false; G.say('With a soft click, the little cabinet swings open.'); }, 1100);
              }
            }, 230);
            return;
          }
          if (id === 'gift') G.openCloseup('gift', null, { stack: true });
        }
      },
      gift: {
        render: cuGift,
        click(id) {
          if (id === 'giftbox' && !G.has('gift')) {
            const lid = document.getElementById('giftLid');
            Sound.play('rustle');
            lid.style.transition = 'transform 1s cubic-bezier(.3,0,.2,1), opacity 1s';
            lid.style.transform = 'translate(-60px,-120px) rotate(-18deg)'; lid.style.opacity = '0';
            setTimeout(() => { G.set('gift'); G.addItem('giftnote'); Sound.play('discover'); G.refreshCloseup(); }, 900);
            setTimeout(() => G.say('A paw print? It seems two cats may be involved in this mystery...', 4200), 1600);
            return;
          }
          if (id === 'readnote') G.openCloseup('giftnote', null, { stack: true });
        }
      },
      giftnote: {
        render() {
          return `<rect width="1000" height="650" fill="#5a3a22" filter="url(#woodH)"/><g transform="translate(500 325)">${noteCard(1.3)}</g>`;
        }
      }
    },
    hints() {
      const H = G.has, books = G.get('books', []);
      if (!H('note2')) return { key: 'n', lines: ['Someone set a table for tea — and left in a hurry.', 'Look at the little tea table on the right.', 'A folded note is tucked under the teacup saucer. Click it.'] };
      if (books.length < 3 && !H('cabinetOpen')) {
        const missing = Object.keys(SPECIAL).filter(k => !books.includes(k)).map(k => `"${SPECIAL[k].title}"`).join(', ');
        return { key: 'b' + books.length, lines: ['The riddle names three stories.', 'Search the bookshelf for a book about the sea, one about old oaks, and one about the night sky.', `Open ${missing} on the bookshelf. Each hides a sign.`] };
      }
      if (!H('cabinetOpen')) return { key: 'c', lines: ['Each book held a sign. Somewhere, signs can be turned.', 'The small cabinet in the sideboard, under the window, has three brass medallions.', 'Set medallion I to the crown, II to the feather and III to the heart (sea, oak, sky).'] };
      if (!H('gift')) return { key: 'g', lines: ['The cabinet is open...', 'There is a gift inside the cabinet.', 'Open the cabinet and click the gift box to unwrap it.'] };
      return { key: 'd', lines: ['Something is scratching at a door...', 'The painted door beside the bookshelf is open now.', 'Click the open door to go through.'] };
    }
  };

  async function openCatDoor() {
    G.busy = true;
    G.refresh();
    await G.wait(500);
    Sound.play('scratch');
    G.say('Scratch, scratch... thump.', 2200);
    await G.wait(1600);
    Sound.play('meow', 2);
    await G.wait(700);
    Sound.play('creak', 1.8);
    G.set('catDoorOpen');
    const leaf = G.$('#catDoorLeaf'), bey = G.$('#beyond');
    if (leaf) leaf.classList.add('open');
    if (bey) { bey.style.transition = 'opacity 1.2s'; bey.style.opacity = '1'; }
    await G.wait(1400);
    G.say('The painted door creaks open by itself. Someone meowed...', 4000);
    G.busy = false;
  }

  G.register(2, S2);
})();
