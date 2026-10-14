const cards = document.querySelectorAll(".client-talk-item");
const backBtn = document.querySelector(".back");
const fwdBtn = document.querySelector(".fwd");

let activeIndex = 0;
let autoSlide;

function getIndex(index) {
  if (index < 0) {
    return cards.length + index;
  }

  if (index >= cards.length) {
    return index - cards.length;
  }

  return index;
}

function updateSlider() {
  cards.forEach((card) => {
    card.className = "client-talk-item";
  });

  cards[getIndex(activeIndex)].classList.add("active");
  cards[getIndex(activeIndex - 1)].classList.add("left");
  cards[getIndex(activeIndex + 1)].classList.add("right");
  cards[getIndex(activeIndex - 2)].classList.add("far-left");
  cards[getIndex(activeIndex + 2)].classList.add("far-right");
}

function nextSlide() {
  activeIndex++;

  if (activeIndex >= cards.length) {
    activeIndex = 0;
  }

  updateSlider();
}

function previousSlide() {
  activeIndex--;

  if (activeIndex < 0) {
    activeIndex = cards.length - 1;
  }

  updateSlider();
}

function startAutoSlide() {
  autoSlide = setInterval(nextSlide, 4000);
}

function resetAutoSlide() {
  clearInterval(autoSlide);
  startAutoSlide();
}

fwdBtn.addEventListener("click", () => {
  nextSlide();
  resetAutoSlide();
});

backBtn.addEventListener("click", () => {
  previousSlide();
  resetAutoSlide();
});

updateSlider();
startAutoSlide();

/* ---------- The little star fairies (from the Evelyn birthday project) ----------
   Two fairies, gold and rose. Each drifts toward random spots with a bit of
   momentum, leaves a trail of pastel pixie dust, and spins and says hi when
   clicked. They take turns dodging the mouse cursor: 5 seconds dodging, then
   5 seconds just flying around (while one dodges, the other flies freely).
   About once a minute both fly along the top of the screen for 15 seconds,
   sprinkling confetti down the page, like when the gift boxes appear in the
   Evelyn project, and shout something silly while they do it. */
const dustCanvas = document.getElementById("fairyDust");
const dustCtx = dustCanvas.getContext("2d");
const fairyReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const DODGE_MS = 5000; // dodging the cursor…
const FREE_MS = 5000; // …then just flying around, and repeat
const DODGE_RADIUS = 120;
const fairyStart = performance.now();

// the fairies: the second one starts elsewhere and dodges while the first flies freely
const fairies = [
  { el: document.getElementById("magicFairy"), x: 120, y: 140, vx: 2, vy: 1.5, dodgeOffset: 0, speed: 1 },
  { el: document.getElementById("magicFairy2"), x: 420, y: 320, vx: -2, vy: 1, dodgeOffset: DODGE_MS, speed: 1.1 },
].filter((f) => f.el);
fairies.forEach((f) => {
  f.msg = f.el.querySelector(".fairy-message");
  f.hello = f.msg.textContent; // "Hi 👋" / "Hello ✨", shown when clicked
});
let dust = [];

const mouse = { x: -9999, y: -9999 };
document.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});
document.addEventListener("mouseleave", () => {
  mouse.x = mouse.y = -9999;
});
const dodging = (f) => (performance.now() - fairyStart + f.dodgeOffset) % (DODGE_MS + FREE_MS) < DODGE_MS;

// the confetti shower: 15 seconds, about once a minute (55–65 s apart)
const SHOWER_MS = 15000;
let showerUntil = 0;
let wasShowering = false;
const showering = () => performance.now() < showerUntil;
// what they shout while the confetti falls (each picks two different lines per shower)
const SHOWER_LINES = [
  [
    "Yeah! It's snow time! ❄️",
    "Confetti forecast: 100% 🌦️",
    "Make it rain! 🎉",
    "Who needs a weekend? 🥳",
    "Sprinkles for everyone!",
  ],
  [
    "Wheee! Party mode ON 🎊",
    "Catch them if you can! ✨",
    "Free sprinkles, no refunds!",
    "Dashboards deserve a party too 📊",
    "Plot twist: it's raining fun!",
  ],
];
let talkTimers = [];

// show a line in her speech bubble for a few seconds
function say(f, text, ms) {
  clearTimeout(f.talkTimer);
  f.msg.textContent = text;
  f.el.classList.add("talking");
  f.talkTimer = setTimeout(() => {
    f.el.classList.remove("talking");
    f.msg.textContent = f.hello;
  }, ms);
}

function startShower() {
  showerUntil = performance.now() + SHOWER_MS;
  // they set off from opposite sides of the screen
  fairies.forEach((f, i) => pickFairyTarget(f, i));
  // and take turns shouting, so they never talk over each other
  talkTimers.forEach(clearTimeout);
  talkTimers = [];
  fairies.forEach((f, i) => {
    const lines = SHOWER_LINES[i % SHOWER_LINES.length].slice().sort(() => Math.random() - 0.5);
    talkTimers.push(setTimeout(() => say(f, lines[0], 3000), 1200 + i * 3400));
    talkTimers.push(setTimeout(() => say(f, lines[1], 3000), 8000 + i * 3400));
  });
}
function scheduleShower() {
  if (fairyReduced) return;
  setTimeout(() => {
    startShower();
    setTimeout(scheduleShower, SHOWER_MS);
  }, 40000 + Math.random() * 10000); // 40–50 s after the last one ends
}

function pickFairyTarget(f, side) {
  const w = document.documentElement.clientWidth;
  const h = window.innerHeight;
  if (showering()) {
    // sweep back and forth along the top of the screen
    const goRight = side === undefined ? f.x < w / 2 : side === 0;
    f.targetX = goRight ? w * (0.7 + Math.random() * 0.2) : w * (0.1 + Math.random() * 0.2);
    f.targetY = 60 + Math.random() * Math.min(80, h * 0.12);
  } else {
    f.targetX = Math.random() * (w - 200) + 100;
    f.targetY = Math.random() * (h - 200) + 100;
  }
}

// match the canvas to the space it is shown in (the window minus the scrollbar),
// so the dust and confetti come out exactly under each fairy, and sharp on high-DPI screens
let dustW = 0, dustH = 0;
function resizeDust() {
  const dpr = window.devicePixelRatio || 1;
  dustW = dustCanvas.clientWidth;
  dustH = dustCanvas.clientHeight;
  dustCanvas.width = Math.round(dustW * dpr);
  dustCanvas.height = Math.round(dustH * dpr);
  dustCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

const DUST_HUES = [340, 275, 195, 48, 130]; // pink, violet, sky blue, gold, mint
const dustColor = () =>
  `hsla(${DUST_HUES[Math.floor(Math.random() * DUST_HUES.length)]}, 100%, ${Math.random() * 15 + 65}%, `;

// a pastel spark that drifts down and fades
function addDust(x, y) {
  dust.push({
    x: x + (Math.random() * 6 - 3),
    y: y + (Math.random() * 6 - 3),
    vx: Math.random() * 1.2 - 0.6,
    vy: Math.random() * 1.5 + 0.6,
    size: Math.random() * 2.2 + 0.8,
    color: dustColor(),
    life: 1,
    fade: Math.random() * 0.015 + 0.01,
  });
}

// a piece of confetti that flutters all the way down the screen
function addConfetti(x, y) {
  const size = Math.random() * 5 + 3.5;
  dust.push({
    confetti: true,
    x: x + (Math.random() * 10 - 5),
    y: y + (Math.random() * 6 - 3),
    vx: Math.random() * 1.6 - 0.8,
    vy: Math.random() * 1.2 + 1.8,
    w: size,
    h: size * (Math.random() * 0.4 + 0.65),
    rot: Math.random() * 360,
    spin: Math.random() * 4 - 2,
    flutter: Math.random() * Math.PI * 2,
    flutterSpeed: Math.random() * 0.08 + 0.04,
    color: dustColor(),
    life: 1,
    fade: Math.random() * 0.0035 + 0.0018,
  });
}

function flyOne(f, shower, w, h) {
  const dx = f.targetX - f.x;
  const dy = f.targetY - f.y;
  if (Math.hypot(dx, dy) < 40) pickFairyTarget(f);

  // while dodging, the cursor pushes her away when it comes close (not during a shower)
  let escaping = false;
  if (dodging(f) && !shower && !fairyReduced) {
    const mx = f.x - mouse.x;
    const my = f.y - mouse.y;
    const md = Math.hypot(mx, my);
    if (md < DODGE_RADIUS) {
      escaping = true;
      const push = (DODGE_RADIUS - md) * 0.06;
      const ma = Math.atan2(my, mx);
      f.vx += Math.cos(ma) * push;
      f.vy += Math.sin(ma) * push;
    }
  }

  // pulled toward the target, with friction and a top speed
  const a = Math.atan2(dy, dx);
  const pull = fairyReduced ? 0.05 : 0.18;
  f.vx = (f.vx + Math.cos(a) * pull) * 0.95;
  f.vy = (f.vy + Math.sin(a) * pull) * 0.95;
  const speed = Math.hypot(f.vx, f.vy);
  const max = (fairyReduced ? 1.2 : escaping ? 9 : shower ? 5 : 4.2) * f.speed; // a quick dart when escaping
  if (speed > max) {
    f.vx = (f.vx / speed) * max;
    f.vy = (f.vy / speed) * max;
  }
  f.x = Math.min(Math.max(f.x + f.vx, 40), w - 40);
  f.y = Math.min(Math.max(f.y + f.vy, 40), h - 40);

  f.el.style.left = `${f.x}px`;
  f.el.style.top = `${f.y}px`;

  // her trail: confetti during a shower, pixie dust the rest of the time
  if (shower) {
    for (let i = 0; i < 2; i++) addConfetti(f.x, f.y + 12); // from under the middle of her star
  } else if (!fairyReduced && Math.random() < 0.6) {
    addDust(f.x, f.y + 6);
  }
}

function flyFairies() {
  const w = document.documentElement.clientWidth;
  const h = window.innerHeight;
  const shower = showering();
  // a shower has just ended: back to the middle of the screen
  if (wasShowering && !shower) fairies.forEach((f) => pickFairyTarget(f));
  wasShowering = shower;

  fairies.forEach((f) => flyOne(f, shower, w, h));

  dustCtx.clearRect(0, 0, dustW, dustH);
  dust = dust.filter((p) => p.life > 0 && p.y < dustH + 20);
  for (const p of dust) {
    p.life -= p.fade;
    const alpha = Math.max(0, p.life);
    if (p.confetti) {
      p.flutter += p.flutterSpeed;
      p.x += p.vx + Math.sin(p.flutter) * 0.7;
      p.y += p.vy;
      p.rot += p.spin;
      dustCtx.save();
      dustCtx.translate(p.x, p.y);
      dustCtx.rotate((p.rot * Math.PI) / 180);
      dustCtx.fillStyle = p.color + alpha + ")";
      dustCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      dustCtx.restore();
    } else {
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.98;
      dustCtx.beginPath();
      dustCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      dustCtx.fillStyle = p.color + alpha + ")";
      dustCtx.shadowBlur = 6;
      dustCtx.shadowColor = p.color + "0.9)";
      dustCtx.fill();
      dustCtx.shadowBlur = 0;
    }
  }

  requestAnimationFrame(flyFairies);
}

fairies.forEach((f) => {
  f.el.addEventListener("click", () => {
    clearTimeout(f.talkTimer);
    f.el.classList.remove("talking");
    f.msg.textContent = f.hello;
    f.el.classList.remove("caught");
    void f.el.offsetWidth; // restart the spin
    f.el.classList.add("caught");
    for (let i = 0; i < 18; i++) addDust(f.x, f.y);
    setTimeout(() => f.el.classList.remove("caught"), 1400);
  });
});

window.addEventListener("resize", resizeDust);
resizeDust();
fairies.forEach((f) => pickFairyTarget(f));
scheduleShower();
flyFairies();

// for trying the shower without waiting: window.__fairyShower()
window.__fairyShower = startShower;
