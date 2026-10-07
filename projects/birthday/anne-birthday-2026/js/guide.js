/* The kitten guide. She peeks from the lower-left corner, pops up to speak,
   explains what to do next, and gives clearer help when clicked. */
const Guide = (() => {
  const NAME = (CONFIG.guide && CONFIG.guide.name) || 'Pip';
  let root, bubble, textEl, hideTimer = 0, talkTimer = 0;
  let started = false, speakingUntil = 0, pending = null;
  let dim, missionOpen = false, missionQueued = false, nextIntro = null, missionCbs = [];
  let lastKey = null, lastProgress = Date.now(), nudged = 0;
  const now = () => Date.now();

  function kittenSVG(p = "gk") {
    const fur = '#fff4e6', shade = '#f1dcc2', ginger = '#f0a86a', pink = '#f4a7b0', eye = '#2b2230';
    return `<svg viewBox="0 0 160 170" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <radialGradient id="${p}Fur" cx=".45" cy=".35" r=".75"><stop offset="0" stop-color="#fffdf8"/><stop offset=".7" stop-color="${fur}"/><stop offset="1" stop-color="${shade}"/></radialGradient>
        <radialGradient id="${p}Eye" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#6a5a7a"/><stop offset=".55" stop-color="${eye}"/><stop offset="1" stop-color="#140f18"/></radialGradient>
      </defs>
      <ellipse cx="82" cy="164" rx="46" ry="6" fill="#000" opacity=".22"/>
      <g class="gk-tail"><path d="M104 150C140 150 150 118 136 96C130 88 122 92 126 100C136 118 126 138 102 140Z" fill="url(#${p}Fur)" stroke="${shade}" stroke-width="1.5"/><path d="M130 96C134 92 140 96 138 104C134 100 132 98 130 96Z" fill="${ginger}"/></g>
      <path d="M44 162C38 140 46 116 80 112C114 116 122 140 116 162Z" fill="url(#${p}Fur)" stroke="${shade}" stroke-width="1.5"/>
      <path d="M66 126C70 136 90 136 94 126C92 144 68 144 66 126Z" fill="#fff" opacity=".8"/>
      <ellipse cx="64" cy="161" rx="13" ry="8" fill="#fffdf8" stroke="${shade}" stroke-width="1.5"/><ellipse cx="96" cy="161" rx="13" ry="8" fill="#fffdf8" stroke="${shade}" stroke-width="1.5"/>
      <path d="M59 160v4M64 160v4M69 160v4M91 160v4M96 160v4M101 160v4" stroke="${shade}" stroke-width="1.3"/>
      <path d="M62 116Q80 124 98 116" stroke="#e46b7a" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="80" cy="124" r="6" fill="#f3c653" stroke="#c99a2a" stroke-width="1.2"/><path d="M76 125H84" stroke="#a77a1a" stroke-width="1.2"/>
      <g class="gk-head">
        <g class="gk-earL"><path d="M34 62C28 36 34 18 42 14C52 24 62 36 66 46Z" fill="${ginger}" stroke="#d98c52" stroke-width="1.5" stroke-linejoin="round"/><path d="M40 52C37 38 40 28 44 24C50 32 55 38 58 44Z" fill="${pink}"/></g>
        <g class="gk-earR"><path d="M126 62C132 36 126 18 118 14C108 24 98 36 94 46Z" fill="url(#${p}Fur)" stroke="${shade}" stroke-width="1.5" stroke-linejoin="round"/><path d="M120 52C123 38 120 28 116 24C110 32 105 38 102 44Z" fill="${pink}"/></g>
        <ellipse cx="80" cy="76" rx="52" ry="44" fill="url(#${p}Fur)" stroke="${shade}" stroke-width="1.5"/>
        <path d="M38 52C46 40 58 34 70 34C62 44 50 50 38 60Z" fill="${ginger}" opacity=".9"/>
        <path d="M70 36L74 48M80 34V47M90 36L86 48" stroke="${ginger}" stroke-width="3.5" stroke-linecap="round" opacity=".75"/>
        <g class="gk-eyes">
          <ellipse cx="60" cy="80" rx="12" ry="14" fill="url(#${p}Eye)"/><ellipse cx="100" cy="80" rx="12" ry="14" fill="url(#${p}Eye)"/>
          <circle cx="64" cy="74" r="4.6" fill="#fff"/><circle cx="104" cy="74" r="4.6" fill="#fff"/>
          <circle cx="56" cy="86" r="2.2" fill="#fff" opacity=".85"/><circle cx="96" cy="86" r="2.2" fill="#fff" opacity=".85"/>
        </g>
        <g class="gk-lids"><ellipse cx="60" cy="80" rx="13.5" ry="15.5" fill="${fur}"/><ellipse cx="100" cy="80" rx="13.5" ry="15.5" fill="${fur}"/><path d="M48 82Q60 90 72 82M88 82Q100 90 112 82" stroke="${eye}" stroke-width="2.4" fill="none" stroke-linecap="round"/></g>
        <ellipse cx="44" cy="96" rx="9" ry="5.5" fill="${pink}" opacity=".55"/><ellipse cx="116" cy="96" rx="9" ry="5.5" fill="${pink}" opacity=".55"/>
        <path d="M76 92H84L80 97Z" fill="#e88a96"/>
        <path class="gk-smile" d="M80 97Q76 103 71 100M80 97Q84 103 89 100" stroke="#8a5a5a" stroke-width="1.8" fill="none" stroke-linecap="round"/>
        <path class="gk-mouth" d="M73 100Q80 99 87 100Q86 110 80 111Q74 110 73 100Z" fill="#b8505e"/>
        <g stroke="#d9c4ae" stroke-width="1.1" stroke-linecap="round"><path d="M42 92L16 88M42 98L18 102M118 92L144 88M118 98L142 102"/></g>
        <g transform="translate(112 32) rotate(18)"><path d="M0 0C-14 -12 -22 -2 -14 6C-8 10 -4 6 0 0C4 6 8 10 14 6C22 -2 14 -12 0 0Z" fill="#f28aa0" stroke="#d2667e" stroke-width="1.3"/><circle r="4.2" fill="#e46b86"/></g>
      </g>
    </svg>`;
  }

  function build() {
    root = document.createElement('div');
    root.id = 'guide';
    root.className = 'peek';
    root.innerHTML = `<div class="g-bubble" role="status" aria-live="polite"><div class="g-name">${NAME}</div><div class="g-body"><p class="g-text"></p></div><div class="g-foot">Click me if you get stuck</div></div><button class="g-kitten" aria-label="Ask ${NAME} for help">${kittenSVG('gk')}</button>`;
    dim = document.createElement('div');
    dim.id = 'guide-dim';
    const game = document.getElementById('game');
    game.appendChild(dim);
    game.appendChild(root);
    bubble = root.querySelector('.g-bubble');
    textEl = root.querySelector('.g-body');
    root.querySelector('.g-kitten').addEventListener('click', e => { e.stopPropagation(); Sound.unlock(); if (!missionOpen) help(); });
    bubble.addEventListener('click', e => {
      if (e.target.closest('.g-go')) { closeMission(); return; }
      if (!missionOpen) hide(0);
    });
    setInterval(tick, 800);
    // occasional ear twitch while idle
    setInterval(() => { if (root.classList.contains('peek')) { root.classList.remove('twitch'); void root.offsetWidth; root.classList.add('twitch'); } }, 7000);
  }

  function show(html, opts = {}) {
    if (!root) build();
    const wasHidden = root.classList.contains('peek');
    textEl.innerHTML = html;
    root.querySelector('.g-foot').style.display = opts.foot ? '' : 'none';
    root.classList.toggle('mission', !!opts.mission);
    root.classList.remove('peek', 'hide-bubble');
    root.classList.add('up', 'talk');
    bubble.classList.remove('pop'); void bubble.offsetWidth; bubble.classList.add('pop');
    if (opts.mew !== false && wasHidden) Sound.play('meow', 3);
    clearTimeout(talkTimer);
    talkTimer = setTimeout(() => root.classList.remove('talk'), Math.min(2600, 600 + (opts.talkLen || html.length) * 30));
  }

  function say(text, ms, opts = {}) {
    if (missionOpen) return; // the mission briefing has the stage; small remarks are skipped
    const dur = Math.max(ms || 0, 3200 + text.length * 55);
    show(`<p class="g-text">${text}</p>`, opts);
    speakingUntil = now() + dur;
    hide(dur);
  }

  function hide(after) {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      root.classList.add('hide-bubble');
      root.classList.remove('talk');
      setTimeout(() => { if (root.classList.contains('hide-bubble')) { root.classList.remove('up', 'mission'); root.classList.add('peek'); } }, 450);
      speakingUntil = Math.min(speakingUntil, now());
    }, after);
  }

  /* ---------- mission briefings ---------- */
  function currentMission() { return G.mission ? G.mission() : null; }

  function openMission(intro) {
    const m = currentMission();
    if (!m) return false;
    clearTimeout(hideTimer);
    missionOpen = true;
    dim.classList.add('show');
    const html = `${intro ? `<p class="g-hello">${intro}</p>` : ''}
      <div class="g-label">Your mission</div>
      <h3 class="g-title">${m.title}</h3>
      <p class="g-text">${m.text}</p>
      <button class="g-go">${m.button || "Let's go!"}</button>`;
    show(html, { mission: true, talkLen: m.text.length });
    Sound.play('sparkle');
    return true;
  }

  function closeMission() {
    missionOpen = false;
    dim.classList.remove('show');
    Sound.play('pop');
    hide(0);
    speakingUntil = now();
    lastProgress = now(); nudged = 0;
    // right after the briefing, point at the very first step
    const o = objective(1);
    if (o) { lastKey = o.key; pending = o.text; }
    const cbs = missionCbs; missionCbs = [];
    setTimeout(() => cbs.forEach(f => f()), 700);
  }

  /* run something once the current mission card has been dismissed */
  function afterMission(fn) { if (missionOpen || missionQueued) missionCbs.push(fn); else fn(); }

  /* called by the engine whenever a new scene begins */
  function briefing() { missionQueued = true; }

  /* what to do right now (clear, direct wording) */
  function objective(level) {
    const h = G.hints && G.hints();
    if (!h) return null;
    return { key: h.key, text: h.lines[Math.min(level, h.lines.length - 1)] };
  }

  function help() {
    const o = objective(2), m = currentMission();
    if (!o) { say(`Meow! Have fun exploring, ${CONFIG.name}!`, 3000); return; }
    say(`${m ? `<b>Our mission:</b> ${m.title}.<br>` : ''}<b>What to do now:</b> ${o.text}`, 7000);
    lastProgress = now();
  }

  function tick() {
    if (!started || G.busy || G.closeup && missionQueued) return;
    if (missionQueued) { missionQueued = false; if (openMission(nextIntro)) { nextIntro = null; return; } }
    if (missionOpen) return;
    const o = objective(1);
    if (!o) return;
    if (o.key !== lastKey) {
      const first = lastKey === null;
      lastKey = o.key; lastProgress = now(); nudged = 0;
      pending = first ? null : o.text;
    }
    if (pending && now() > speakingUntil + 1200) {
      say(pending, 5200, { foot: true });
      pending = null;
      return;
    }
    // gentle nudges if nothing has happened for a while
    const idle = now() - lastProgress;
    if (!pending && now() > speakingUntil + 1500 && ((nudged === 0 && idle > 30000) || (nudged > 0 && idle > 45000))) {
      const clear = objective(nudged === 0 ? 1 : 2);
      say((nudged === 0 ? 'Psst! ' : 'Let me help: ') + clear.text, 6000, { foot: nudged === 0 });
      nudged++; lastProgress = now();
    }
  }

  /* called after the title card, or when a saved game is resumed */
  function start(fresh, backFromBook) {
    if (!root) build();
    started = true;
    if (backFromBook) {
      const o = objective(1); lastKey = o ? o.key : null;
      say(`Welcome back, ${CONFIG.name}! What a lovely little book.`, 4000);
      return;
    }
    nextIntro = fresh
      ? `Hi ${CONFIG.name}! I'm ${NAME}, and I'll be your guide today.`
      : `Welcome back, ${CONFIG.name}! Here's where we were:`;
    missionQueued = true;
  }

  return { say, help, start, briefing, afterMission, kittenSVG, get name() { return NAME; } };
})();
window.Guide = Guide;
