/* ==========================================
   "What keeps me going": the tech guy on the stairs.

   Click a step (or a card in the bottom bar) and he walks along the
   tops of the steps and climbs the ladders between them to get there.
   In the middle of that step he plants his red flag: goal reached.
   Before setting off for another step he pulls the flag back out and
   stows it in his backpack.

   Same approach as the Gift #3 climb: everything is drawn in ONE
   coordinate system inside <svg id="climberWorld"> (stage pixels / S),
   his feet are planted on the steps and rungs, and his knees and elbows
   are solved every frame.
   ========================================== */
(() => {
  "use strict";

  const NS = "http://www.w3.org/2000/svg";
  const stage = document.querySelector(".stair-stage");
  const world = document.getElementById("climberWorld");
  const steps = Array.from(document.querySelectorAll(".step"));
  const cards = Array.from(document.querySelectorAll(".bottom-card-item"));
  if (!stage || !world || steps.length < 2) return;

  const REDUCED =
    window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const f1 = (n) => Math.round(n * 10) / 10;
  const E = {
    io: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
    lin: (t) => t,
  };
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  function tween(ms, fn, ease = E.io) {
    return new Promise((res) => {
      const t0 = performance.now();
      (function step(now) {
        const t = Math.min(1, (now - t0) / Math.max(1, ms));
        fn(ease(t), t);
        if (t < 1) requestAnimationFrame(step);
        else res();
      })(t0);
    });
  }
  function el(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  /* =================================================================
     1. GEOMETRY — the steps, measured from the page, in world units
     ================================================================= */
  let S = 2; // screen pixels per world unit
  let G = []; // per step: { l, r, y } (left, right, top)
  function measure() {
    const sr = stage.getBoundingClientRect();
    if (!sr.width || !sr.height) return false;
    S = clamp(sr.height / 210, 1.8, 3.4);
    const vb = `0 0 ${f1(sr.width / S)} ${f1(sr.height / S)}`;
    world.setAttribute("viewBox", vb);
    G = steps.map((s) => {
      const r = s.getBoundingClientRect();
      return {
        l: (r.left - sr.left) / S,
        r: (r.right - sr.left) / S,
        y: (r.top - sr.top) / S,
      };
    });
    return true;
  }

  // the ladder from step g up to step g+1 stands on step g and leans
  // against the top corner of step g+1 (its right rail touches the edge)
  function ladderGeo(g) {
    const y0 = G[g].y,
      y1 = G[g + 1].y;
    const rise = Math.max(1, y0 - y1);
    const n = Math.max(3, Math.round(rise / 5.2));
    const xt = G[g + 1].l - 2.6; // centre of the ladder where it meets the corner
    const run = Math.min(rise * 0.34, (xt - G[g].l) * 0.5); // about 19° from vertical
    const xb = xt - run; // centre of its foot
    return { y0, y1, n, r: rise / n, xb, xt, at: (y) => xb + ((y0 - y) / rise) * run };
  }
  const baseX = (g) => ladderGeo(g).xb - 5.4; // where he starts the climb (on step g)
  const topX = (g) => G[g + 1].l + 4.2; // where he stands after it (on step g+1)
  // where he waits on step i (and plants the flag just ahead of him)
  const spot = (i) => (G[i].l + G[i].r) / 2;

  /* =================================================================
     2. THE LADDERS (rebuilt whenever the layout changes)
     ================================================================= */
  const gLadders = el("g", { class: "ladders" }, world);
  const gClimber = el("g", { class: "climber" }, world);

  function drawLadders() {
    gLadders.innerHTML = "";
    for (let g = 0; g < G.length - 1; g++) {
      const L = ladderGeo(g);
      if (L.y0 - L.y1 < 4) continue;
      const top = L.y1 - 6; // the rails rise above the next step as handrails
      let d = "";
      for (let j = 1; j <= L.n; j++) {
        const y = L.y0 - L.r * j;
        d += `M${f1(L.at(y) - 2.4)} ${f1(y)}H${f1(L.at(y) + 2.4)}`;
      }
      el("path", { d, stroke: "#33fffc", "stroke-opacity": 0.5, "stroke-width": 0.5, "stroke-linecap": "round" }, gLadders);
      const bx = L.xb, tx = L.at(top);
      el(
        "path",
        {
          d: `M${f1(bx - 2.4)} ${f1(L.y0)}L${f1(tx - 2.4)} ${f1(top)}M${f1(bx + 2.4)} ${f1(L.y0)}L${f1(tx + 2.4)} ${f1(top)}`,
          stroke: "#33fffc",
          "stroke-opacity": 0.75,
          "stroke-width": 0.65,
          "stroke-linecap": "round",
        },
        gLadders,
      );
    }
  }

  /* =================================================================
     3. THE TECH GUY — hoodie, glasses, headphones, laptop backpack
     ================================================================= */
  const RIG = { thigh: 6.6, shin: 6.6, torso: 8.6, headR: 2.5, upper: 5.0, fore: 4.9 };
  const LEG = RIG.thigh + RIG.shin;
  const COL = {
    hoodie: "#12807e", hoodieFar: "#0b5a59", hoodieDark: "#094847", lit: "#33fffc",
    pants: "#2c3a5c", pantsFar: "#1d2742", shoe: "#e8edf2", shoeFar: "#aeb8c4", sole: "#6f7b8a",
    skin: "#eab896", skinFar: "#cc9a7a", hair: "#1d1715", pack: "#262c3a", packDark: "#1a1f2b",
  };

  const SHOE = (fill) =>
    `<path d="M-1.5 0L2.9 0Q3.4-.8 2.4-1.3L1-1.7L.7-2.6L-1.2-2.6L-1.5-1.1Z" fill="${fill}"/>` +
    `<path d="M-1.5-.15H3" stroke="${COL.sole}" stroke-width=".5"/>`;

  const farLeg = el("path", { fill: "none", stroke: COL.pantsFar, "stroke-width": 2.4, "stroke-linecap": "round", "stroke-linejoin": "round" }, gClimber);
  const farBoot = el("g", {}, gClimber);
  farBoot.innerHTML = SHOE(COL.shoeFar);
  const farArm = el("path", { fill: "none", stroke: COL.hoodieFar, "stroke-width": 1.8, "stroke-linecap": "round", "stroke-linejoin": "round" }, gClimber);
  const farHand = el("circle", { r: 0.8, fill: COL.skinFar }, gClimber);
  const torsoG = el("g", {}, gClimber);
  // local torso frame: x forward, y down, hip at (0,0), shoulder at (0,-torso)
  torsoG.innerHTML = `
    <path d="M-2.3 1.4L2.1 1.4C2.6-2.4 2.5-5.9 1.7-8.5L-1.7-8.9C-2.5-6-2.7-2.4-2.3 1.4Z" fill="${COL.hoodie}"/>
    <path d="M2.1 1.4C2.6-2.4 2.5-5.9 1.7-8.5" fill="none" stroke="${COL.lit}" stroke-width=".45" stroke-opacity=".6"/>
    <path d="M-2.3.5L2.2.5" stroke="${COL.hoodieDark}" stroke-width=".8"/>
    <path d="M-.1-.3Q.8-2.5 2.35-2.5" fill="none" stroke="${COL.hoodieDark}" stroke-width=".4"/>
    <path d="M-2.2-8.3Q-3.5-9.6-2.5-10.7Q-1-11-.3-9.3Z" fill="${COL.hoodieDark}"/>
    <path d="M1.1-8.4L1.3-6.2M1.6-8.3L1.85-6.6" stroke="#dff7f6" stroke-width=".25"/>
    <path d="M-6.2-8.2Q-6.6-4-6-.6L-2.2-.4L-2-8.4Q-4.4-9-6.2-8.2Z" fill="${COL.pack}"/>
    <path d="M-6.2-8.2Q-6.6-4-6-.6L-5.1-.6Q-5.6-4.2-5.3-8.5Z" fill="${COL.packDark}"/>
    <path d="M-5.5-7.3L-2.6-7.2" stroke="#3c4558" stroke-width=".35"/>
    <circle class="led" cx="-4" cy="-4.4" r=".45" fill="${COL.lit}"/>
    <path d="M-2-8.2Q.3-7.2.8-3.4" fill="none" stroke="#151a24" stroke-width=".7"/>`;
  const nearLeg = el("path", { fill: "none", stroke: COL.pants, "stroke-width": 2.5, "stroke-linecap": "round", "stroke-linejoin": "round" }, gClimber);
  const nearBoot = el("g", {}, gClimber);
  nearBoot.innerHTML = SHOE(COL.shoe);
  const headG = el("g", {}, gClimber);
  // local head frame: x forward, y down, centre (0,0)
  headG.innerHTML = `
    <circle r="2.5" fill="${COL.skin}"/>
    <path d="M2.2-1.3Q2-3.1-.2-3.3Q-2.4-3.4-2.8-1.2Q-2.9.6-2.1 1.6Q-2.2.2-1.6-.4Q.2-1.2 2.2-1.3Z" fill="${COL.hair}"/>
    <path d="M-2-2.5L-1.5-3.8L-.8-2.9L-.1-4L.6-3L1.4-3.7L1.7-2.3Z" fill="${COL.hair}"/>
    <path d="M-.5 0Q-1.6-3.8.7-3.7" fill="none" stroke="${COL.packDark}" stroke-width=".65"/>
    <ellipse cx="-.45" cy=".35" rx=".95" ry="1.2" fill="${COL.packDark}"/>
    <ellipse cx="-.45" cy=".35" rx=".55" ry=".75" fill="none" stroke="${COL.lit}" stroke-width=".25" stroke-opacity=".85"/>
    <path d="M.9-.45L.1-.35" stroke="#11151d" stroke-width=".25"/>
    <rect x=".9" y="-.9" width="1.75" height="1.05" rx=".3" fill="#9ffcfb" fill-opacity=".28" stroke="#11151d" stroke-width=".3"/>
    <circle cx="1.75" cy="-.35" r=".24" fill="#1a1210"/>
    <path d="M2.45-.05Q2.95.4 2.4.7" fill="none" stroke="${COL.skinFar}" stroke-width=".35"/>
    <path d="M1.55 1.3Q1.95 1.45 2.2 1.2" fill="none" stroke="#8a5a48" stroke-width=".25"/>`;
  const nearArm = el("path", { fill: "none", stroke: COL.hoodie, "stroke-width": 1.9, "stroke-linecap": "round", "stroke-linejoin": "round" }, gClimber);
  const nearHand = el("circle", { r: 0.85, fill: COL.skin }, gClimber);

  // pose state
  let lastHand = { x: 0, y: 0 }; // where his near hand was last drawn
  const C = {
    hip: { x: 0, y: 0 }, dir: 1, lean: 0.06, look: -0.08, alpha: 1,
    feet: [{ x: 0, y: 0, pitch: 0 }, { x: 0, y: 0, pitch: 0 }], // [near, far]
    arms: [{ ang: 0.06, bend: 0.35, w: 0, tx: 0, ty: 0 }, { ang: -0.06, bend: 0.35, w: 0, tx: 0, ty: 0 }],
  };

  function ik(ax, ay, tx, ty, l1, l2, bend) {
    let dx = tx - ax, dy = ty - ay, d = Math.hypot(dx, dy);
    const max = l1 + l2 - 0.02, min = Math.abs(l1 - l2) + 0.05;
    if (d > max) { tx = ax + (dx / d) * max; ty = ay + (dy / d) * max; dx = tx - ax; dy = ty - ay; d = max; }
    if (d < min) d = min;
    const a = (l1 * l1 - l2 * l2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
    const mx = ax + (dx / d) * a, my = ay + (dy / d) * a, nx = -dy / d, ny = dx / d;
    const j1 = { x: mx + nx * h, y: my + ny * h }, j2 = { x: mx - nx * h, y: my - ny * h };
    return { j: (j1.x - mx) * bend >= 0 ? j1 : j2, e: { x: tx, y: ty } };
  }
  // where the ankle sits for a foot on the ground (toe pivot for tiptoe)
  function ankleOf(f, d) {
    const p = f.pitch || 0;
    const lx = 0.1 - 2.6, ly = -1.3, c = Math.cos(p), sn = Math.sin(p);
    return { x: f.x + (lx * c - ly * sn + 2.6) * d, y: f.y + lx * sn + ly * c };
  }
  function joints() {
    const d = C.dir, lean = C.lean;
    const u = { x: Math.sin(lean) * d, y: -Math.cos(lean) }; // up the spine
    const n = { x: Math.cos(lean) * d, y: Math.sin(lean) }; // forward
    const torso = RIG.torso + 0.12 * Math.sin(performance.now() / 700);
    const hip = C.hip;
    const sh = { x: hip.x + u.x * torso, y: hip.y + u.y * torso };
    const armRoot = { x: sh.x - u.x * 0.7 - n.x * 0.2, y: sh.y - u.y * 0.7 - n.y * 0.2 };
    const ha = C.look + lean * 0.5;
    const hu = { x: Math.sin(ha * 0.4 + lean * 0.6) * d, y: -Math.cos(ha * 0.4 + lean * 0.6) };
    const head = { x: sh.x + hu.x * (1.2 + RIG.headR), y: sh.y + hu.y * (1.2 + RIG.headR) };
    return { d, u, n, hip, sh, armRoot, ha, head };
  }
  function armPos(J, a, far) {
    const d = J.d;
    const root = { x: J.armRoot.x - J.n.x * (far ? 0.5 : 0), y: J.armRoot.y - J.n.y * (far ? 0.5 : 0) };
    const ang = a.ang + C.lean * 0.3;
    const el1 = { x: root.x + Math.sin(ang) * d * RIG.upper, y: root.y + Math.cos(ang) * RIG.upper };
    const hand = { x: el1.x + Math.sin(ang + a.bend) * d * RIG.fore, y: el1.y + Math.cos(ang + a.bend) * RIG.fore };
    const tx = lerp(hand.x, a.tx, a.w), ty = lerp(hand.y, a.ty, a.w);
    // reaching overhead the elbow drops outward; otherwise it bends back as usual
    const s = ik(root.x, root.y, tx, ty, RIG.upper, RIG.fore, ty < root.y - 3 ? d : -d);
    return { root, elbow: s.j, hand: s.e };
  }
  function render() {
    const J = joints(), d = J.d;
    const sd = Math.abs(d) < 0.12 ? 0.12 * (Math.sign(d) || 1) : d;
    gClimber.setAttribute("opacity", f1(C.alpha * 100) / 100);
    [[nearLeg, nearBoot, C.feet[0], 0], [farLeg, farBoot, C.feet[1], 0.6]].forEach(([leg, boot, f, back]) => {
      const an = ankleOf(f, d);
      const hx = J.hip.x - J.n.x * back * 0.5, hy = J.hip.y;
      const s = ik(hx, hy, an.x, an.y, RIG.thigh, RIG.shin, d);
      leg.setAttribute("d", `M${f1(hx)} ${f1(hy)}L${f1(s.j.x)} ${f1(s.j.y)}L${f1(s.e.x)} ${f1(s.e.y)}`);
      boot.setAttribute("transform", `translate(${f1(f.x)} ${f1(f.y)}) scale(${f1(sd * 100) / 100} 1) rotate(${f1(f.pitch * 57.3)} 2.6 0)`);
    });
    const A0 = armPos(J, C.arms[0], false), A1 = armPos(J, C.arms[1], true);
    farArm.setAttribute("d", `M${f1(A1.root.x)} ${f1(A1.root.y)}L${f1(A1.elbow.x)} ${f1(A1.elbow.y)}L${f1(A1.hand.x)} ${f1(A1.hand.y)}`);
    farHand.setAttribute("cx", f1(A1.hand.x));
    farHand.setAttribute("cy", f1(A1.hand.y));
    nearArm.setAttribute("d", `M${f1(A0.root.x)} ${f1(A0.root.y)}L${f1(A0.elbow.x)} ${f1(A0.elbow.y)}L${f1(A0.hand.x)} ${f1(A0.hand.y)}`);
    nearHand.setAttribute("cx", f1(A0.hand.x));
    nearHand.setAttribute("cy", f1(A0.hand.y));
    torsoG.setAttribute("transform", `matrix(${J.n.x.toFixed(3)} ${J.n.y.toFixed(3)} ${(-J.u.x).toFixed(3)} ${(-J.u.y).toFixed(3)} ${f1(J.hip.x)} ${f1(J.hip.y)})`);
    const fx = Math.cos(J.ha) * sd, fy = Math.sin(J.ha);
    const ux = -Math.sin(J.ha) * sd, uy = Math.cos(J.ha);
    headG.setAttribute("transform", `matrix(${fx.toFixed(3)} ${fy.toFixed(3)} ${ux.toFixed(3)} ${uy.toFixed(3)} ${f1(J.head.x)} ${f1(J.head.y)})`);
    return { J, A0 };
  }

  /* =================================================================
     4. POSING — standing, walking, turning
     ================================================================= */
  function settleHip(targetX, groundY, bob) {
    let y = groundY - 1.3 - LEG * 0.95 - bob;
    C.feet.forEach((f) => {
      if (f.lift) return;
      const a = ankleOf(f, C.dir), dx = targetX - a.x, max = LEG - 0.1;
      if (Math.abs(dx) < max) y = Math.max(y, a.y - Math.sqrt(max * max - dx * dx));
    });
    C.hip.x = targetX;
    C.hip.y = y;
  }
  function stand(x, y, dir) {
    C.dir = dir;
    C.feet[0] = { x: x + 1.1 * dir, y, pitch: 0 };
    C.feet[1] = { x: x - 1.1 * dir, y, pitch: 0 };
    settleHip(x, y, 0);
  }

  // he hurries a little when the target is several steps away
  let level = 0; // the step he is standing on
  let ladder = null; // { g, u } while on the ladder from step g to g+1 (u: 0 bottom .. 1 top)
  let target = 0;
  const hurry = () => {
    const at = ladder ? ladder.g + ladder.u : level;
    return 1 + 0.3 * clamp(Math.abs(target - at) - 1, 0, 3);
  };

  async function turnTo(dir) {
    const from = C.dir;
    if (from === dir) return;
    const x = (C.feet[0].x + C.feet[1].x) / 2, y = Math.min(C.feet[0].y, C.feet[1].y);
    await tween(REDUCED ? 1 : 420, (e) => {
      C.dir = lerp(from, dir, e);
      C.feet[0].x = x + 1.1 * C.dir;
      C.feet[1].x = x - 1.1 * C.dir;
      settleHip(x, y, Math.sin(Math.PI * e) * -0.5);
    });
    C.dir = dir;
  }

  // one foot step toward goalX on the current step
  const STRIDE = 10;
  async function stepToward(goalX) {
    const y = G[level].y;
    const rem = goalX - C.hip.x;
    const h = hurry();
    // close enough: shuffle both feet into place without turning round
    if (Math.abs(rem) < STRIDE * 0.6) {
      const d = C.dir, from = C.feet.map((f) => ({ ...f })), hipFrom = C.hip.x;
      const to = [goalX + 1.1 * d, goalX - 1.1 * d];
      await tween(260 / h, (e, t) => {
        C.feet.forEach((f, k) => {
          const moving = Math.abs(to[k] - from[k].x) > 0.2;
          const ek = clamp(e * 2 - k, 0, 1); // one foot after the other
          f.x = lerp(from[k].x, to[k], ek);
          f.y = y - (moving ? 1.2 * Math.sin(Math.PI * ek) : 0);
          f.lift = moving && ek > 0 && ek < 1;
          f.pitch = 0;
        });
        settleHip(lerp(hipFrom, goalX, e), y, 0);
      });
      C.feet.forEach((f) => { f.lift = false; f.y = y; });
      return;
    }
    const dir = Math.sign(rem);
    if (C.dir !== dir) { await turnTo(dir); return; }
    const sw = C.feet[0].x * dir < C.feet[1].x * dir ? 0 : 1; // the rear foot swings
    const stance = C.feet[1 - sw];
    const D = STRIDE * Math.min(h, 1.3);
    const lim = goalX + dir * 1.1;
    let toX = stance.x + dir * D;
    if ((toX - lim) * dir > 0) toX = lim;
    if (Math.abs(stance.x - lim) < 0.3) toX = goalX - dir * 1.1;
    const fromW = { ...C.feet[sw] }, hipFrom = C.hip.x, hipTo = (stance.x + toX) / 2;
    const dist = Math.abs(toX - fromW.x);
    await tween((120 + dist * 5) / h, (e, t) => {
      const f = C.feet[sw];
      f.x = lerp(fromW.x, toX, e);
      f.y = y - 1.8 * Math.sin(Math.PI * e);
      f.lift = t < 0.92;
      f.pitch = Math.sin(Math.PI * e) * 0.25;
      C.lean = 0.07 + (h - 1) * 0.08;
      C.look = -0.04;
      settleHip(lerp(hipFrom, hipTo, t), y, Math.sin(Math.PI * t) * 0.4);
      // arms swing opposite the legs
      const fwd = clamp(((C.feet[0].x - C.hip.x) * dir) / (D * 0.6), -1, 1);
      C.arms[0].ang = -fwd * 0.5;
      C.arms[1].ang = fwd * 0.5;
      C.arms.forEach((a) => { a.w = Math.max(0, a.w - 0.1); a.bend = 0.4; });
    }, E.lin);
    const f = C.feet[sw];
    f.lift = false; f.x = toX; f.y = y; f.pitch = 0;
  }

  /* =================================================================
     5. THE LADDER — the climb is a list of poses (one per move), and
        u (0..1) blends through them. Climbing down is the same climb
        played backwards, so he can change his mind halfway up.
     ================================================================= */
  function ladderStates(g) {
    const L = ladderGeo(g);
    const rung = (j) => L.y0 - L.r * j;
    const footX = (y) => L.at(y) - 1.4; // the ball of his foot on the rung
    const slant = Math.atan2(L.xt - L.xb, L.y0 - L.y1) * 0.6; // he leans in with the ladder
    const hipX = baseX(g);
    const K = Math.round(21 / L.r); // hands are about this many rungs above his feet
    const hand = (j) => {
      const y = Math.max(L.y1 - 5.5, rung(j));
      return { x: L.at(y) - 0.2, y };
    };
    const tx = topX(g), y1 = L.y1;

    const st = [];
    // 0: standing at the foot of the ladder, facing it
    st.push({
      feet: [{ x: hipX + 1.1, y: L.y0 }, { x: hipX - 1.1, y: L.y0 }],
      hands: [hand(K), hand(1 + K)], hw: 0, hx: hipX, g: L.y0, lean: 0.06, look: -0.1,
    });
    // 1..n-1: one foot up to the next rung, the opposite hand up the rails
    for (let m = 1; m < L.n; m++) {
      const prev = st[st.length - 1];
      const fk = m % 2 ? 0 : 1, hk = 1 - fk;
      const feet = prev.feet.map((f) => ({ ...f }));
      feet[fk] = { x: footX(rung(m)), y: rung(m), rung: true };
      const hands = prev.hands.map((p) => ({ ...p }));
      hands[hk] = hand(m + K);
      if (m === 1) hands[fk] = hand(K);
      // hips follow the slope, a little behind the ladder
      st.push({ feet, hands, hw: 1, hx: L.at(rung(m) - 8) - 4.8, g: rung(m), lean: 0.14 + slant, look: -0.35 });
    }
    // then off the top: one foot onto the next step, then the other
    const last = st[st.length - 1];
    const fk = L.n % 2 ? 0 : 1;
    const feetA = last.feet.map((f) => ({ ...f }));
    feetA[fk] = { x: fk === 0 ? tx + 1.1 : tx - 1.1, y: y1 };
    const top = { x: L.at(y1 - 5.5) - 0.2, y: y1 - 5.5 };
    st.push({
      feet: feetA, hands: [top, { ...top }], hw: 0.7,
      hx: (feetA[0].x + feetA[1].x) / 2, g: y1, lean: 0.2, look: -0.15,
    });
    st.push({
      feet: [{ x: tx + 1.1, y: y1 }, { x: tx - 1.1, y: y1 }], hands: [top, { ...top }], hw: 0,
      hx: tx, g: y1, lean: 0.06, look: -0.1,
    });
    return st;
  }

  function applyLadder(st, u) {
    const M = st.length - 1;
    const x = clamp(u, 0, 1) * M;
    const m = Math.min(M - 1, Math.floor(x)), e = x - m;
    const A = st[m], B = st[m + 1], ee = E.io(e), arc = Math.sin(Math.PI * e);
    C.dir = 1;
    [0, 1].forEach((k) => {
      const a = A.feet[k], b = B.feet[k], f = C.feet[k];
      const moving = Math.abs(a.x - b.x) + Math.abs(a.y - b.y) > 0.1;
      const rungMove = moving && b.rung;
      f.x = lerp(a.x, b.x, ee) - (rungMove ? 1.6 * arc : 0); // swing out from the ladder
      f.y = lerp(a.y, b.y, ee) - (moving ? 1.6 * arc : 0);
      f.lift = moving && e > 0.04 && e < 0.96;
      f.pitch = moving ? 0.2 * arc : 0;
      const ha = A.hands[k], hb = B.hands[k], arm = C.arms[k];
      const hm = Math.abs(ha.y - hb.y) > 0.1;
      arm.tx = lerp(ha.x, hb.x, ee) - (hm ? 0.8 * arc : 0);
      arm.ty = lerp(ha.y, hb.y, ee) - (hm ? 1.2 * arc : 0);
      arm.w = lerp(A.hw, B.hw, ee);
      arm.ang = lerp(arm.ang, k ? -0.06 : 0.06, 0.1);
      arm.bend = 0.35;
    });
    C.lean = lerp(A.lean, B.lean, ee);
    C.look = lerp(A.look, B.look, ee);
    settleHip(lerp(A.hx, B.hx, ee), lerp(A.g, B.g, ee), 0);
  }

  function runLadder() {
    const st = ladderStates(ladder.g);
    const M = st.length - 1;
    return new Promise((res) => {
      let last = performance.now();
      (function frame(now) {
        const dt = Math.min(0.1, (now - last) / 1000); // keeps pace on slow devices too
        last = now;
        const goal = target > ladder.g ? 1 : 0; // follows the latest click
        const speed = hurry() / (M * 0.3); // about 0.3 s per move
        ladder.u = ladder.u < goal ? Math.min(goal, ladder.u + speed * dt) : Math.max(goal, ladder.u - speed * dt);
        applyLadder(st, ladder.u);
        if (ladder.u === goal) {
          level = goal ? ladder.g + 1 : ladder.g;
          ladder = null;
          C.feet.forEach((f) => { f.lift = false; f.pitch = 0; });
          res();
          return;
        }
        requestAnimationFrame(frame);
      })(last);
    });
  }


  /* =================================================================
     6. THE RED FLAG — planted in the middle of the step he reached, or
        stowed in his backpack while he travels, or in his hand between.
     ================================================================= */
  const LP = 30; // pole length (a little taller than him)
  const GRIP = 0.4; // where his hand holds the pole (fraction from the bottom)
  const FLAG_AHEAD = 6.5; // the flag stands this far in front of his spot
  const gFlag = el("g", { class: "flag" });
  const flagPole = el("path", { stroke: "#d8dde4", "stroke-width": 0.65, "stroke-linecap": "round" }, gFlag);
  const flagCloth = el("path", { fill: "#e53935" }, gFlag);
  const flagShade = el("path", { fill: "#a91f1c", "fill-opacity": 0.55 }, gFlag);
  el("circle", { class: "flag-tip", r: 0.9, fill: "#ffd166" }, gFlag);
  const flagTip = gFlag.lastChild;
  const flag = {
    mode: "ground", // "ground" | "pack" | "hand"
    level: 0, // the step it is planted on
    ang: 0, // pole angle in hand (0 = upright)
    plantedAt: -1e9, // for the little wobble after planting
    from: null, // while settling into the ground: where it came from
    settle: 1,
  };
  const groundSpot = (i) => ({ x: spot(i) + FLAG_AHEAD, y: G[i].y + 1.2 }); // sunk a little

  // the flag tucked into his backpack, leaning back a little
  function packFlag(J) {
    const v = { x: J.u.x - J.n.x * 0.28, y: J.u.y - J.n.y * 0.28 };
    const l = Math.hypot(v.x, v.y);
    return {
      B: { x: J.hip.x - 4.6 * J.n.x - 0.2 * J.u.x, y: J.hip.y - 4.6 * J.n.y - 0.2 * J.u.y },
      ang: Math.atan2(v.x / l, -v.y / l),
    };
  }
  // where the flag goes in the drawing: behind him in the pack, in front in his hand,
  // and on the ground behind him (so he walks in front of it)
  function placeFlagLayer() {
    const parent = flag.mode === "ground" ? world : gClimber;
    const before = flag.mode === "ground" ? gClimber : flag.mode === "pack" ? gClimber.firstChild : null;
    if (gFlag.parentNode !== parent || (before && gFlag.nextSibling !== before)) parent.insertBefore(gFlag, before);
  }

  function drawFlag(J, hand) {
    const now = performance.now() / 1000;
    let B, ang;
    if (flag.mode === "pack") ({ B, ang } = packFlag(J));
    else if (flag.mode === "hand") {
      ang = flag.ang;
      B = { x: hand.x - Math.sin(ang) * LP * GRIP, y: hand.y + Math.cos(ang) * LP * GRIP };
    } else {
      const to = groundSpot(flag.level);
      B = flag.from && flag.settle < 1 ? { x: lerp(flag.from.x, to.x, flag.settle), y: lerp(flag.from.y, to.y, flag.settle) } : to;
      // a wobble right after planting, then a gentle sway in the wind
      const since = now - flag.plantedAt;
      ang = 0.16 * Math.sin(since * 14) * Math.exp(-since * 3.5) + 0.02 * Math.sin(now * 1.3);
    }
    flag.lastB = B;
    const vx = Math.sin(ang), vy = -Math.cos(ang);
    const T = { x: B.x + vx * LP, y: B.y + vy * LP };
    const M = { x: T.x - vx * 7.5, y: T.y - vy * 7.5 }; // the cloth hangs from the top 7.5 units
    // the cloth streams away from him (trailing behind while it is in his pack), rippling
    const s = flag.mode === "pack" ? -Math.sign(C.dir || 1) : 1;
    const w = 12, r1 = Math.sin(now * 6) * 1.2, r2 = Math.sin(now * 6 - 1.6) * 1.5;
    const cloth =
      `M${f1(T.x)} ${f1(T.y)}` +
      `Q${f1(T.x + s * w * 0.5)} ${f1(T.y - 1 + r1)} ${f1(T.x + s * w)} ${f1(T.y + 0.6 + r2)}` +
      `L${f1(M.x + s * w)} ${f1(M.y + 0.4 + r2)}` +
      `Q${f1(M.x + s * w * 0.5)} ${f1(M.y - 0.6 + r1)} ${f1(M.x)} ${f1(M.y)}Z`;
    flagPole.setAttribute("d", `M${f1(B.x)} ${f1(B.y)}L${f1(T.x)} ${f1(T.y)}`);
    flagCloth.setAttribute("d", cloth);
    // a darker fold along the ripple
    flagShade.setAttribute(
      "d",
      `M${f1(T.x + s * w * 0.45)} ${f1(T.y - 0.5 + r1)}Q${f1(T.x + s * w * 0.7)} ${f1((T.y + M.y) / 2 + r1)} ${f1(M.x + s * w * 0.45)} ${f1(M.y - 0.2 + r1)}L${f1(M.x + s * w * 0.62)} ${f1(M.y + r2 * 0.5)}Q${f1(T.x + s * w * 0.85)} ${f1((T.y + M.y) / 2 + r2)} ${f1(T.x + s * w * 0.62)} ${f1(T.y + r2 * 0.5)}Z`,
    );
    flagTip.setAttribute("cx", f1(T.x));
    flagTip.setAttribute("cy", f1(T.y));
  }

  // body-relative points for his near hand (the body stands still while he does this)
  const overShoulder = (J) => ({ x: J.sh.x + J.u.x * 2.5 - J.n.x * 2.8, y: J.sh.y + J.u.y * 2.5 - J.n.y * 2.8 });
  const highFront = (J) => ({ x: J.sh.x + J.u.x * 4 + J.n.x * 4, y: J.sh.y + J.u.y * 4 + J.n.y * 4 });
  const overhead = (J) => ({ x: J.sh.x + J.u.x * 9.5 + J.n.x * 1.5, y: J.sh.y + J.u.y * 9.5 + J.n.y * 1.5 });

  // move his near hand from where it is to a point, with the body posed by pose(e)
  async function reach(ms, to, pose, ease) {
    const a = C.arms[0];
    const w0 = a.w, x0 = a.w > 0.01 ? a.tx : null, y0 = a.ty;
    const J = joints();
    const p = typeof to === "function" ? to(J) : to;
    const start = x0 === null ? lastHand : { x: x0, y: y0 };
    await tween(ms, (e) => {
      if (pose) pose(e);
      a.w = lerp(w0, 1, Math.min(1, e * 3));
      a.tx = lerp(start.x, p.x, e);
      a.ty = lerp(start.y, p.y, e);
    }, ease);
  }
  const crouch = (x, y, from, to) => (e) => {
    C.lean = lerp(from.lean, to.lean, e);
    settleHip(x, y, lerp(from.bob, to.bob, e));
  };
  const UP = { lean: 0.05, bob: 0 }, DOWN = { lean: 0.32, bob: -4 };

  // take the flag out of the pack and plant it in front of him: goal reached
  async function plantFlag() {
    const x = C.hip.x, y = G[level].y;
    C.look = -0.15;
    await reach(320, overShoulder);
    flag.ang = packFlag(joints()).ang;
    flag.mode = "hand";
    placeFlagLayer();
    const ang0 = flag.ang;
    await reach(420, highFront, (e) => { flag.ang = lerp(ang0, 0, e); });
    // thrust it down into the ground
    const g = groundSpot(level);
    await reach(340, { x: g.x, y: g.y - LP * GRIP }, crouch(x, y, UP, DOWN), (t) => t * t);
    flag.from = flag.lastB;
    flag.level = level;
    flag.mode = "ground";
    flag.settle = 0;
    flag.plantedAt = performance.now() / 1000;
    placeFlagLayer();
    tween(140, (e) => { flag.settle = e; });
    await wait(120);
    // stand up and punch the air
    await reach(380, overhead, (e) => { crouch(x, y, DOWN, UP)(e); C.look = lerp(-0.15, -0.45, e); });
    await wait(260);
    await rest(360);
  }

  // pull the flag out of the ground and stow it in the pack
  async function pickUpFlag() {
    const x = C.hip.x, y = G[level].y, g = groundSpot(flag.level);
    C.look = 0.1;
    await reach(360, { x: g.x, y: g.y - LP * GRIP }, crouch(x, y, UP, DOWN));
    flag.ang = 0;
    flag.mode = "hand";
    placeFlagLayer();
    await reach(340, highFront, crouch(x, y, DOWN, UP));
    const ang1 = packFlag(joints()).ang;
    await reach(380, overShoulder, (e) => { flag.ang = lerp(0, ang1, e); C.look = lerp(0.1, -0.1, e); });
    flag.mode = "pack";
    placeFlagLayer();
    await rest(300);
  }

  // arms back down by his sides
  async function rest(ms) {
    const arms0 = C.arms.map((a) => ({ ...a }));
    await tween(ms, (e) => {
      C.arms.forEach((a, k) => {
        a.w = lerp(arms0[k].w, 0, e);
        a.ang = lerp(arms0[k].ang, k ? -0.06 : 0.06, e);
        a.bend = lerp(arms0[k].bend, 0.35, e);
      });
      C.lean = lerp(C.lean, 0.05, e);
    });
  }

  /* =================================================================
     7. THE ROUTE — fetch the flag if it is planted, walk to the next
        ladder, climb, repeat; at the goal, plant the flag
     ================================================================= */
  let running = false;
  async function go() {
    if (running) return;
    running = true;
    if (REDUCED) {
      // a calm version: fade out, fade in on the chosen step with the flag planted
      await tween(300, (e) => { C.alpha = 1 - e; });
      level = target;
      stand(spot(level), G[level].y, 1);
      flag.mode = "ground";
      flag.level = level;
      flag.settle = 1;
      placeFlagLayer();
      await tween(400, (e) => { C.alpha = e; });
      running = false;
      if (target !== level) go();
      return;
    }
    for (;;) {
      if (ladder) { await runLadder(); continue; }
      const i = level, t = target;
      // the flag comes along: pick it up before leaving the step it is planted on
      const fetch = flag.mode === "ground" && t !== flag.level;
      const goalX = fetch ? groundSpot(flag.level).x - FLAG_AHEAD : t === i ? spot(i) : t > i ? baseX(i) : topX(i - 1);
      const atGoal = Math.abs(C.hip.x - goalX) < 0.35 && Math.abs(C.feet[0].x - C.feet[1].x) < 2.6;
      if (!atGoal) { await stepToward(goalX); continue; }
      if (fetch) { await turnTo(1); await pickUpFlag(); continue; }
      if (t === i) {
        if (flag.mode === "ground") break; // planted here: done
        await turnTo(1);
        if (target !== level) continue; // changed his mind while turning
        await plantFlag();
        continue;
      }
      await turnTo(1); // he faces the ladder, going up or coming down
      if (target === level) continue;
      ladder = target > level ? { g: level, u: 0 } : { g: level - 1, u: 1 };
    }
    // arrived: a glance up at the next step
    await tween(380, (e) => { C.look = lerp(C.look, level < G.length - 1 ? -0.3 : -0.12, e); });
    running = false;
    if (target !== level) go();
  }

  /* =================================================================
     8. CLICKS, RESIZING AND THE FRAME LOOP
     ================================================================= */
  function setActive(i) {
    steps.forEach((s, k) => s.classList.toggle("active", k === i));
    cards.forEach((c) => c.classList.toggle("active", Number(c.dataset.step) - 1 === i));
    target = i;
    go();
  }
  steps.forEach((s, k) => s.addEventListener("click", () => setActive(k)));
  cards.forEach((c) => c.addEventListener("click", () => setActive(Number(c.dataset.step) - 1)));

  function relayout() {
    if (!measure()) return;
    drawLadders();
    if (!running) stand(spot(level), G[level].y, C.dir);
  }
  if (window.ResizeObserver) new ResizeObserver(relayout).observe(stage);
  else window.addEventListener("resize", relayout);

  let visible = true;
  if (window.IntersectionObserver) {
    new IntersectionObserver((en) => { visible = en[0].isIntersecting; }).observe(stage);
  }
  (function frame() {
    if (visible && G.length) {
      const { J, A0 } = render();
      lastHand = A0.hand;
      drawFlag(J, A0.hand);
    }
    requestAnimationFrame(frame);
  })();

  // he starts on the first step, with the flag planted beside him
  if (measure()) {
    drawLadders();
    stand(spot(0), G[0].y, 1);
    C.look = -0.3;
  }
  placeFlagLayer();
  steps.forEach((s, k) => s.classList.toggle("active", k === 0));
  cards.forEach((c) => c.classList.toggle("active", c.dataset.step === "1"));

  // for checking the timeline in the console: window.__stairs
  window.__stairs = { C, flag, get level() { return level; }, get ladder() { return ladder; }, get target() { return target; } };
})();
