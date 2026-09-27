/* Game engine: state, scenes, close-up views, inventory, hints, captions.
   Every scene is drawn in a fixed 1600x900 coordinate system and scaled with
   preserveAspectRatio="xMidYMid slice", so hotspots are the artwork itself
   and stay aligned at any window size. */
const G = (() => {
  const KEY = 'anne-small-adventure-v1';
  const fresh = () => ({ scene: 1, flags: {}, inv: [], n: {} });
  let S;
  try { S = JSON.parse(localStorage.getItem(KEY)); } catch (e) { S = null; }
  if (!S || !S.flags || !S.inv) S = fresh();
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };

  const $ = s => document.querySelector(s);
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const scenes = {}, items = {};
  let cur = null, curN = 0, selected = null, cu = null, busy = false;
  const bgUrls = {};
  let captionTimer = null, hintKey = null, hintLvl = 0;

  /* ---------------- state helpers ---------------- */
  const has = f => !!S.flags[f];
  const set = (f, v = true) => { S.flags[f] = v; save(); };
  const get = (k, d) => (k in S.n ? S.n[k] : d);
  const put = (k, v) => { S.n[k] = v; save(); };

  /* ---------------- scene rendering ---------------- */
  function bgUrl(n) {
    if (!bgUrls[n]) {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" width="1600" height="900"><defs>${A.defs()}</defs>${scenes[n].bg()}</svg>`;
      bgUrls[n] = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
    }
    return bgUrls[n];
  }
  function loadImg(url) {
    return new Promise(res => {
      const im = new Image(); im.onload = () => res(); im.onerror = () => res(); im.src = url;
      if (im.decode) im.decode().then(res, res);
    });
  }

  async function renderScene(n) {
    if (cur && cur.leave) cur.leave();
    cur = scenes[n]; curN = n; S.scene = n; save();
    const url = bgUrl(n);
    await loadImg(url);
    $('#scene').innerHTML = `<div class="scene-backdrop" style="background-image:url('${url}')"></div><svg id="svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice"><image href="${url}" x="0" y="0" width="1600" height="900" preserveAspectRatio="none"/><g id="fg"></g></svg>`;
    document.body.dataset.scene = n;
    fit();
    refresh();
    Sound.setMood(cur.mood);
    renderInv();
    closeHint();
  }
  /* Fit the 1600x900 scene to the window. Tall or normal windows fill the
     screen and trim a little from the sides. Wide windows (laptops, where the
     browser bars eat height) may only lose 20 units top and bottom; beyond
     that the whole scene is shown and the sides get a soft blurred backdrop,
     so nothing near the floor is ever cut off. */
  function fit() {
    const svg = $('#svg'); if (!svg) return;
    const aspect = innerWidth / innerHeight;
    if (aspect > 1600 / 860) { svg.setAttribute('viewBox', '0 20 1600 860'); svg.setAttribute('preserveAspectRatio', 'xMidYMid meet'); }
    else { svg.setAttribute('viewBox', '0 0 1600 900'); svg.setAttribute('preserveAspectRatio', 'xMidYMid slice'); }
  }
  function refresh() {
    const fg = $('#fg'); if (!fg) return;
    fg.innerHTML = cur.fg();
    if (cur.after) cur.after($('#svg'));
  }

  /* ---------------- click routing ---------------- */
  function onSceneClick(e) {
    Sound.unlock();
    if (busy) return;
    const hot = e.target.closest('[data-hot]');
    if (!hot) { if (selected) select(null); return; }
    const id = hot.dataset.hot;
    if (selected) {
      const it = selected;
      select(null);
      if (!(cur.use && cur.use(it, id, hot, e))) say(pick(["That doesn't seem to fit here.", "Hmm. Not there.", 'Nothing happens.']));
      return;
    }
    cur.click && cur.click(id, hot, e);
  }
  function onCuClick(e) {
    Sound.unlock();
    if (busy || !cu) return;
    const hot = e.target.closest('[data-hot]');
    if (!hot) { if (selected) select(null); return; }
    const def = cur.closeups[cu.id];
    if (selected) {
      const it = selected; select(null);
      if (!(def.use && def.use(it, hot.dataset.hot, hot, cu.arg))) say(pick(["That doesn't seem to fit here.", 'Nothing happens.']));
      return;
    }
    def.click && def.click(hot.dataset.hot, hot, cu.arg, e);
  }

  /* ---------------- close-up views ---------------- */
  function openCloseup(id, arg, opts = {}) {
    const def = cur.closeups[id];
    if (!def) return;
    const parent = opts.parent === undefined ? (cu && opts.stack ? cu : null) : opts.parent;
    cu = { id, arg, parent };
    const box = $('#closeup');
    const content = $('#cu-content');
    box.className = 'cu' + (def.html ? ' cu-html' : '') + (def.wide ? ' cu-wide' : '');
    content.innerHTML = renderCu(def, arg);
    box.hidden = false;
    requestAnimationFrame(() => box.classList.add('open'));
    if (def.after) def.after(content.firstElementChild, arg);
    Sound.play('page');
  }
  function renderCu(def, arg) {
    if (def.html) return def.render(arg);
    return `<svg class="cu-svg" viewBox="0 0 1000 650" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">${def.render(arg)}<rect x="0" y="0" width="1000" height="650" fill="url(#cuVignette)" pointer-events="none"/></svg>`;
  }
  function refreshCloseup() {
    if (!cu) return;
    const def = cur.closeups[cu.id];
    const content = $('#cu-content');
    content.innerHTML = renderCu(def, cu.arg);
    if (def.after) def.after(content.firstElementChild, cu.arg);
  }
  function closeCloseup(all) {
    if (!cu) return;
    const def = cur.closeups[cu.id];
    const closing = cu;
    if (!all && cu.parent) {
      const p = cu.parent; cu = null;
      openCloseup(p.id, p.arg, { parent: p.parent });
      if (def && def.onClose) def.onClose(closing.arg);
      return;
    }
    cu = null;
    const box = $('#closeup');
    box.classList.remove('open');
    setTimeout(() => { if (!cu) { box.hidden = true; $('#cu-content').innerHTML = ''; } }, 380);
    if (def && def.onClose) def.onClose(closing.arg);
    if (cur.onCloseupClosed) cur.onCloseupClosed(closing.id, closing.arg);
  }

  /* ---------------- inventory ---------------- */
  function item(id, def) { items[id] = def; }
  function addItem(id, quiet) {
    if (!S.inv.includes(id)) S.inv.push(id);
    save(); renderInv(id);
    if (!quiet) Sound.play('collect');
  }
  function removeItem(id) {
    S.inv = S.inv.filter(i => i !== id);
    if (selected === id) select(null);
    save(); renderInv();
  }
  const hasItem = id => S.inv.includes(id);
  function renderInv(flash) {
    const inv = $('#inventory');
    const list = S.inv.filter(i => items[i]);
    inv.classList.toggle('empty', list.length === 0);
    inv.innerHTML = list.map(id => {
      const d = items[id];
      const count = d.count ? d.count() : '';
      return `<button class="slot${selected === id ? ' sel' : ''}${flash === id ? ' new' : ''}" data-item="${id}" aria-label="${d.name}">${A.item(d.art || id)}${count ? `<span class="count">${count}</span>` : ''}<span class="tip">${d.name}</span></button>`;
    }).join('');
  }
  function onInvClick(e) {
    Sound.unlock();
    const b = e.target.closest('[data-item]');
    if (!b || busy) return;
    const id = b.dataset.item, d = items[id];
    if (d.usable) { select(selected === id ? null : id); if (selected) say(d.hint || 'Now choose where to use it.', 2200); return; }
    if (d.view) { select(null); openCloseup(d.view, d.viewArg, { parent: null }); }
  }
  function select(id) {
    selected = id;
    const held = $('#held');
    if (id) { held.innerHTML = A.item(items[id].art || id); held.classList.add('on'); document.body.classList.add('holding'); }
    else { held.classList.remove('on'); document.body.classList.remove('holding'); }
    renderInv();
  }

  /* ---------------- text ---------------- */
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  function say(text, ms = 3400) {
    if (window.Guide) { Guide.say(text, ms); return; }
    const c = $('#caption');
    c.innerHTML = `<span>${text}</span>`;
    c.classList.remove('show'); void c.offsetWidth; c.classList.add('show');
    clearTimeout(captionTimer);
    captionTimer = setTimeout(() => c.classList.remove('show'), ms);
  }
  const lastLine = {};
  /* cycle through lines without immediate repeats */
  function line(key, arr) {
    const i = ((lastLine[key] == null ? -1 : lastLine[key]) + 1) % arr.length;
    lastLine[key] = i; return arr[i];
  }
  function toScreen(x, y) {
    const svg = $('#svg'); const pt = svg.createSVGPoint(); pt.x = x; pt.y = y;
    return pt.matrixTransform(svg.getScreenCTM());
  }
  function bubble(x, y, text, who = 'a', ms = 3600) {
    const p = toScreen(x, y);
    const layer = $('#bubbles');
    const old = layer.querySelector(`[data-who="${who}"]`); if (old) old.remove();
    const b = document.createElement('div');
    b.className = 'bubble'; b.dataset.who = who;
    b.innerHTML = text;
    const vw = window.innerWidth;
    b.style.left = Math.max(150, Math.min(vw - 150, p.x)) + 'px';
    b.style.top = Math.max(90, p.y) + 'px';
    layer.appendChild(b);
    requestAnimationFrame(() => b.classList.add('show'));
    setTimeout(() => { b.classList.remove('show'); setTimeout(() => b.remove(), 400); }, ms);
  }

  /* ---------------- hints ---------------- */
  function toggleHint() {
    const box = $('#hintbox');
    if (box.classList.contains('show')) { closeHint(); return; }
    showHint();
  }
  function showHint(advance) {
    const h = cur.hints ? cur.hints() : null;
    const box = $('#hintbox');
    if (!h) return;
    if (h.key !== hintKey) { hintKey = h.key; hintLvl = 0; }
    else if (advance) hintLvl = Math.min(h.lines.length - 1, hintLvl + 1);
    const more = hintLvl < h.lines.length - 1;
    box.innerHTML = `<div class="hint-label">Hint ${hintLvl + 1} of ${h.lines.length}</div><p>${h.lines[hintLvl]}</p>${more ? '<button class="hint-more">A clearer hint</button>' : ''}`;
    box.classList.add('show');
  }
  function closeHint() { $('#hintbox').classList.remove('show'); }

  /* ---------------- transitions ---------------- */
  async function goScene(n, opts = {}) {
    busy = true;
    closeCloseup(true); select(null); closeHint();
    const stage = $('#stage'), fade = $('#fade');
    const p = opts.zoom ? toScreen(opts.zoom[0], opts.zoom[1]) : { x: innerWidth / 2, y: innerHeight / 2 };
    stage.style.transformOrigin = `${p.x}px ${p.y}px`;
    stage.classList.add('zooming');
    fade.className = 'on ' + (opts.color || 'warm');
    await wait(1700);
    await renderScene(n);
    stage.classList.remove('zooming');
    stage.classList.add('arrive');
    stage.style.transformOrigin = '50% 50%';
    void stage.offsetWidth;
    stage.classList.remove('arrive');
    await wait(80);
    fade.className = opts.color || 'warm';
    await wait(900);
    busy = false;
    if (cur.enter) cur.enter(false);
    if (window.Guide) Guide.briefing();
  }

  async function intro() {
    const t = $('#title-card');
    t.classList.add('show');
    let done = false;
    const end = () => {
      if (done) return; done = true;
      t.classList.remove('show'); t.classList.add('hide');
      set('intro');
      if (window.Guide) setTimeout(() => Guide.start(true), 900);
      setTimeout(() => { t.classList.remove('hide'); }, 1600);
    };
    t.onclick = () => { Sound.unlock(); end(); };
    await wait(6500); end();
  }

  function restart() {
    try { localStorage.removeItem(KEY); } catch (e) {}
    S = fresh(); save(); selected = null; hintKey = null;
    Object.keys(lastLine).forEach(k => delete lastLine[k]);
    $('#menu').classList.remove('show');
    $('#finale').classList.remove('show');
    goScene(1, { color: 'dark' }).then(() => intro());
  }

  /* ---------------- welcome screen ---------------- */
  function welcome() {
    return new Promise(resolve => {
      const w = $('#welcome');
      const saved = has('intro');
      $('#w-start').textContent = saved ? 'Continue the adventure' : 'Start the adventure';
      $('#w-restart').hidden = !saved;
      if (window.Guide && Guide.kittenSVG) $('#w-kitten').innerHTML = Guide.kittenSVG('wk');
      w.classList.add('show');
      const go = choice => {
        Sound.unlock();
        Sound.play('discover');
        w.classList.remove('show'); w.classList.add('leave');
        setTimeout(() => { w.hidden = true; }, 1200);
        resolve(choice);
      };
      $('#w-start').addEventListener('click', () => go('start'), { once: true });
      $('#w-restart').addEventListener('click', () => go('restart'), { once: true });
    });
  }

  /* ---------------- boot ---------------- */
  async function boot() {
    const holder = document.createElement('div');
    holder.innerHTML = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>${A.defs()}</defs></svg>`;
    document.body.prepend(holder.firstChild);

    $('#scene').addEventListener('click', onSceneClick);
    $('#cu-content').addEventListener('click', onCuClick);
    $('#cu-back').addEventListener('click', () => closeCloseup());
    $('#closeup').addEventListener('click', e => { if (e.target.id === 'closeup') closeCloseup(); });
    $('#inventory').addEventListener('click', onInvClick);
    $('#btn-hint').addEventListener('click', () => { Sound.unlock(); $('#menu').classList.remove('show'); if (window.Guide) Guide.help(); else toggleHint(); });
    $('#hintbox').addEventListener('click', e => { if (e.target.classList.contains('hint-more')) showHint(true); });
    $('#btn-sound').addEventListener('click', () => {
      Sound.unlock(); const m = Sound.toggleMute();
      $('#btn-sound').classList.toggle('muted', m);
    });
    $('#btn-sound').classList.toggle('muted', Sound.muted);
    $('#btn-menu').addEventListener('click', () => { Sound.unlock(); closeHint(); $('#menu').classList.toggle('show'); });
    $('#menu-restart').addEventListener('click', restart);
    $('#menu-cancel').addEventListener('click', () => $('#menu').classList.remove('show'));
    document.addEventListener('pointerdown', () => Sound.unlock(), { once: false });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') { if (cu) closeCloseup(); else if (selected) select(null); closeHint(); }
    });
    document.addEventListener('pointermove', e => {
      const h = $('#held'); h.style.transform = `translate(${e.clientX + 14}px, ${e.clientY + 10}px)`;
    });
    document.addEventListener('contextmenu', e => { if (selected) { e.preventDefault(); select(null); } });
    window.addEventListener('resize', () => { $('#bubbles').innerHTML = ''; fit(); });

    await renderScene(S.scene || 1);
    $('#fade').className = 'dark';
    const choice = await welcome();
    if (choice === 'restart') {
      try { localStorage.removeItem(KEY); } catch (e) {}
      S = fresh(); save();
      await renderScene(1);
    }
    if (!has('intro')) { await wait(700); intro(); }
    else { if (cur.enter) cur.enter(true); if (window.Guide) setTimeout(() => Guide.start(false), 800); }
  }

  return {
    get S() { return S; }, has, set, get, put, save,
    register: (n, def) => { scenes[n] = def; },
    item, addItem, removeItem, hasItem, select, get selected() { return selected; },
    refresh, openCloseup, closeCloseup, refreshCloseup, get closeup() { return cu; },
    say, bubble, line, pick, wait, goScene, restart, toScreen,
    set busy(v) { busy = v; }, get busy() { return busy; },
    hints: () => (cur && cur.hints ? cur.hints() : null),
    mission: () => (cur && cur.mission ? (typeof cur.mission === 'function' ? cur.mission() : cur.mission) : null),
    renderInv, boot, $
  };
})();
