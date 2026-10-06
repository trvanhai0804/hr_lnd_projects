/* ==========================================
   Gift #3: The Climb
   A night climb to the moon before the cake-and-wish scene.

   The mountain, the trail, the climber, the footholds and the moon are all
   drawn in ONE world coordinate system inside <svg id="world">. The camera
   only changes that SVG's viewBox, so everything stays aligned at any window
   size. When the moon is touched, window.Gift3.startCelebration() (in
   gift3_script.js) starts the cake timeline.

   Texts you may want to change:
   ========================================== */
const CLIMB_TEXT = {
    opening: "Some wishes begin with a climb.",
    summit: "Here’s to every summit ahead, Anne.",
    moonHint: "Touch the moon."
};

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    const NS = 'http://www.w3.org/2000/svg';
    const G3 = window.Gift3 || {};
    const REDUCED = !!G3.reduced;
    const IN_FRAME = window.parent && window.parent !== window;

    const $ = s => document.querySelector(s);
    const world = $('#world');
    const veil = $('#veil');
    const caption = $('#climb-caption');
    const keepBtn = $('#keep-climbing');
    const moonBtn = $('#moon-btn');
    const moonHint = $('#moon-hint');
    const replayBtn = $('#replay');
    const domMoon = $('.moon-container');

    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const lerp = (a, b, t) => a + (b - a) * t;
    const f1 = n => Math.round(n * 10) / 10;
    const E = {
        io: t => (t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
        out: t => 1 - Math.pow(1 - t, 3),
        sine: t => .5 - Math.cos(Math.PI * t) / 2,
        lin: t => t
    };
    const wait = ms => new Promise(r => setTimeout(r, ms));
    function tween(ms, fn, ease = E.io) {
        return new Promise(res => {
            const t0 = performance.now();
            (function step(now) {
                const t = Math.min(1, (now - t0) / Math.max(1, ms));
                fn(ease(t), t);
                if (t < 1) requestAnimationFrame(step); else res();
            })(t0);
        });
    }
    function el(tag, attrs, parent) {
        const e = document.createElementNS(NS, tag);
        for (const k in attrs) e.setAttribute(k, attrs[k]);
        if (parent) parent.appendChild(e);
        return e;
    }
    // seeded random, so the mountain is the same every time
    let seed = 20281008;
    const rnd = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
    const rr = (a, b) => a + (b - a) * rnd();
    const P = pts => pts.map((p, i) => (i ? 'L' : 'M') + f1(p[0]) + ' ' + f1(p[1])).join('');
    const PZ = pts => P(pts) + 'Z';

    /* =================================================================
       1. THE TRAIL — four stages from the base to the summit.
          The climber's feet are placed on exactly these points, and the
          worn path in the artwork is drawn from the same points.
       ================================================================= */
    const SUMMIT = { x: 810, y: 566.5 };
    const COARSE = [
        [[650, 893], [690, 880], [730, 864], [770, 849], [805, 836]],
        [[805, 836], [790, 826], [750, 808], [710, 790], [672, 772], [640, 757]],
        [[640, 757], [662, 741], [704, 719], [748, 697], [792, 676], [830, 657], [858, 640]],
        // the final scramble climbs steadily up and to the left along the ridge
        [[858, 640], [851, 627], [843, 613], [835, 600], [827, 588], [818, 576], [SUMMIT.x, SUMMIT.y]]
    ];
    const FACING = [1, -1, 1, -1];
    // subdivide with a little jitter so the path looks trodden, not ruled
    function fineTrail(pts, jit) {
        const out = [pts[0].slice()];
        for (let i = 1; i < pts.length; i++) {
            const a = pts[i - 1], b = pts[i];
            const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
            const n = Math.max(1, Math.round(len / 5));
            const nx = -(b[1] - a[1]) / len, ny = (b[0] - a[0]) / len;
            for (let k = 1; k < n; k++) {
                const t = k / n, j = (rnd() - .5) * jit;
                out.push([lerp(a[0], b[0], t) + nx * j, lerp(a[1], b[1], t) + ny * j]);
            }
            out.push(b.slice());
        }
        return out;
    }
    function mkPath(pts) {
        const cum = [0];
        for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
        const L = cum[cum.length - 1];
        function seg(s) {
            s = clamp(s, 0, L);
            let i = 1;
            while (i < cum.length - 1 && cum[i] < s) i++;
            return { i, t: (s - cum[i - 1]) / Math.max(1e-6, cum[i] - cum[i - 1]) };
        }
        return {
            pts, L,
            at(s) {
                const { i, t } = seg(s);
                return { x: lerp(pts[i - 1][0], pts[i][0], t), y: lerp(pts[i - 1][1], pts[i][1], t) };
            },
            slope(s) {   // uphill angle along the direction of travel (radians, + = up)
                const a = this.at(s - 3), b = this.at(s + 3);
                return Math.atan2(a.y - b.y, Math.abs(b.x - a.x) + 1e-3);
            }
        };
    }
    const PATHS = COARSE.map((c, i) => mkPath(fineTrail(c, i === 3 ? .5 : 1.1)));
    const TOTAL = PATHS.reduce((s, p) => s + p.L, 0);
    const STAGE_START = PATHS.map((p, i) => PATHS.slice(0, i).reduce((s, q) => s + q.L, 0));

    /* =================================================================
       2. THE MOUNTAIN ARTWORK (drawn once)
       ================================================================= */
    const defs = el('defs', {}, world);
    defs.innerHTML = `
        <linearGradient id="faceC" gradientUnits="userSpaceOnUse" x1="0" y1="560" x2="0" y2="960">
            <stop offset="0" stop-color="#34425f"/><stop offset=".55" stop-color="#222c44"/><stop offset="1" stop-color="#121a2b"/></linearGradient>
        <linearGradient id="faceL" gradientUnits="userSpaceOnUse" x1="0" y1="560" x2="0" y2="960">
            <stop offset="0" stop-color="#1f2940"/><stop offset="1" stop-color="#0c1321"/></linearGradient>
        <linearGradient id="faceR" gradientUnits="userSpaceOnUse" x1="0" y1="560" x2="0" y2="960">
            <stop offset="0" stop-color="#55648a"/><stop offset=".45" stop-color="#34405e"/><stop offset="1" stop-color="#18203a"/></linearGradient>
        <linearGradient id="rimR" gradientUnits="userSpaceOnUse" x1="0" y1="560" x2="0" y2="880">
            <stop offset="0" stop-color="#e6ecfa" stop-opacity=".75"/><stop offset="1" stop-color="#e6ecfa" stop-opacity="0"/></linearGradient>
        <linearGradient id="rimL" gradientUnits="userSpaceOnUse" x1="0" y1="560" x2="0" y2="820">
            <stop offset="0" stop-color="#c8d3ea" stop-opacity=".35"/><stop offset="1" stop-color="#c8d3ea" stop-opacity="0"/></linearGradient>
        <radialGradient id="mist"><stop offset="0" stop-color="#8ea3c9" stop-opacity=".16"/><stop offset="1" stop-color="#8ea3c9" stop-opacity="0"/></radialGradient>
        <radialGradient id="wash"><stop offset="0" stop-color="#dfe8ff" stop-opacity=".22"/><stop offset=".45" stop-color="#b9c9ee" stop-opacity=".07"/><stop offset="1" stop-color="#b9c9ee" stop-opacity="0"/></radialGradient>
        <radialGradient id="mHalo"><stop offset="0" stop-color="#e3ebff" stop-opacity=".42"/><stop offset=".22" stop-color="#c9d6f5" stop-opacity=".16"/><stop offset=".55" stop-color="#a9bbe6" stop-opacity=".05"/><stop offset="1" stop-color="#a9bbe6" stop-opacity="0"/></radialGradient>
        <radialGradient id="mHaloW"><stop offset="0" stop-color="#fff6d8" stop-opacity=".5"/><stop offset=".3" stop-color="#ffe7b0" stop-opacity=".16"/><stop offset="1" stop-color="#ffe7b0" stop-opacity="0"/></radialGradient>
        <radialGradient id="mDisc" cx=".4" cy=".36" r=".7"><stop offset="0" stop-color="#fdfcf6"/><stop offset=".55" stop-color="#eceee9"/><stop offset="1" stop-color="#c6cdda"/></radialGradient>
        <radialGradient id="mLimb"><stop offset=".72" stop-color="#6c7a9c" stop-opacity="0"/><stop offset="1" stop-color="#6c7a9c" stop-opacity=".32"/></radialGradient>
        <radialGradient id="mWarm" cx=".42" cy=".38" r=".7"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#fffde7"/><stop offset="1" stop-color="#e6dfa7"/></radialGradient>
        <linearGradient id="lampBeam" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stop-color="#fff4d6" stop-opacity=".55"/><stop offset="1" stop-color="#fff4d6" stop-opacity="0"/></linearGradient>`;

    const gRanges = el('g', {}, world);
    const gMoon = el('g', {}, world);          // behind the mountain
    const gMount = el('g', {}, world);
    const gWash = el('g', {}, world);          // moonlight on the rock, follows the moon
    const gTrail = el('g', {}, world);
    const gFore = el('g', {}, world);
    const gDim = el('g', { opacity: 0 }, world); // darkens the land when the cake arrives
    const gHolds = el('g', {}, world);
    const gClimber = el('g', {}, world);
    const gFx = el('g', {}, world);

    // --- distant ranges: layered, lighter with distance, with a thin moonlit edge
    function midpoint(pts, rough, depth) {
        let a = pts;
        for (let d = 0; d < depth; d++) {
            const b = [a[0]];
            for (let i = 1; i < a.length; i++) {
                const p = a[i - 1], q = a[i];
                const len = Math.hypot(q[0] - p[0], q[1] - p[1]);
                const off = (rnd() - .5) * len * rough;
                b.push([(p[0] + q[0]) / 2 - (q[1] - p[1]) / len * off, (p[1] + q[1]) / 2 + (q[0] - p[0]) / len * off], q);
            }
            a = b;
        }
        return a;
    }
    function range(ctrl, fill, rim, rimOp) {
        const top = midpoint(ctrl, .32, 5);
        const shape = top.concat([[top[top.length - 1][0], 3200], [top[0][0], 3200]]);
        el('path', { d: PZ(shape), fill }, gRanges);
        el('path', { d: P(top), fill: 'none', stroke: rim, 'stroke-opacity': rimOp, 'stroke-width': .9, 'stroke-linejoin': 'round' }, gRanges);
        return shape;
    }
    const RANGE_SHAPES = [
        range([[-2400, 720], [-1500, 650], [-900, 690], [-420, 612], [0, 668], [300, 640], [560, 700], [1000, 690], [1300, 626], [1700, 660], [2200, 606], [2800, 680], [3600, 650]], '#1b2440', '#a7b6d6', .16),
        range([[-2400, 800], [-1600, 740], [-900, 780], [-300, 716], [250, 760], [520, 772], [1100, 770], [1420, 712], [1900, 756], [2500, 720], [3600, 790]], '#141c33', '#93a4c8', .14),
        range([[-2400, 870], [-1500, 836], [-700, 858], [-100, 812], [360, 850], [1250, 852], [1640, 812], [2200, 846], [3600, 830]], '#0f162a', '#8494bb', .12)
    ];
    [[-600, 820, 900, 40], [1900, 800, 900, 40], [420, 872, 700, 30], [1300, 880, 700, 30]].forEach(m =>
        el('ellipse', { cx: m[0], cy: m[1], rx: m[2], ry: m[3], fill: 'url(#mist)' }, gRanges));

    // --- the main mountain
    const SIL_KEYS = [
        [-600, 3200], [-600, 962], [60, 905], [180, 880], [300, 842], [380, 800], [450, 770], [505, 735], [548, 712], [575, 722],
        [612, 700], [650, 672], [690, 640], [725, 612], [752, 596], [772, 583], [787, 574], [798, 567], [824, 566],
        [838, 578], [846, 592], [858, 604], [872, 622], [890, 634], [915, 660], [948, 684], [990, 712], [1040, 742],
        [1072, 738], [1110, 760], [1180, 800], [1260, 838], [1350, 870], [1480, 900], [1700, 925], [2200, 962], [2200, 3200]
    ];
    function silhouette() {
        const out = [SIL_KEYS[0], SIL_KEYS[1]];
        let iL = 0, iR = 0;
        for (let i = 2; i < SIL_KEYS.length - 1; i++) {
            const p = SIL_KEYS[i - 1], q = SIL_KEYS[i];
            const nearTop = q[1] < 700 && p[1] < 700 && q[0] > 770 && p[0] > 770 && q[0] < 960;
            const flat = p[0] === 798 && q[0] === 824;
            let seg = [p, q];
            if (!flat) {
                // near the scramble the rock may only bulge outwards, never over the path
                const sub = midpoint([p, q], nearTop ? .14 : .42, 4);
                seg = nearTop ? sub.map((m, k) => {
                    if (k === 0 || k === sub.length - 1) return m;
                    const lx = lerp(p[0], q[0], k / (sub.length - 1)), ly = lerp(p[1], q[1], k / (sub.length - 1));
                    return m[1] < ly ? m : [lx, ly - (m[1] - ly) * .5];
                }) : sub;
            }
            for (let k = 1; k < seg.length; k++) out.push(seg[k]);
            if (q[0] === 798) iL = out.length - 1;
            if (q[0] === 824) iR = out.length - 1;
        }
        out.push(SIL_KEYS[SIL_KEYS.length - 1]);
        return { pts: out, iL, iR };
    }
    const SIL = silhouette();
    const spurA = midpoint([[798, 567], [776, 612], [742, 660], [700, 722], [640, 800], [575, 880], [520, 960], [500, 3200]], .22, 3);
    const spurB = midpoint([[824, 566], [852, 626], [884, 692], [928, 762], [986, 842], [1040, 920], [1080, 3200]], .22, 3);
    const faceL = SIL.pts.slice(0, SIL.iL + 1).concat(spurA.slice(1));
    const faceR = SIL.pts.slice(SIL.iR).concat(spurB.slice().reverse().slice(0, -1));
    const silD = PZ(SIL.pts);
    el('path', { id: 'mainSil', d: silD, fill: 'url(#faceC)' }, gMount);
    el('path', { d: PZ(faceL), fill: 'url(#faceL)' }, gMount);
    el('path', { d: PZ(faceR), fill: 'url(#faceR)' }, gMount);
    el('clipPath', { id: 'clipMount' }, defs).appendChild(el('path', { d: silD }));

    function inside(pt, poly) {
        let c = false;
        for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
            const a = poly[i], b = poly[j];
            if ((a[1] > pt[1]) !== (b[1] > pt[1]) && pt[0] < (b[0] - a[0]) * (pt[1] - a[1]) / (b[1] - a[1]) + a[0]) c = !c;
        }
        return c;
    }
    // rock texture: faceted shards along the fall line (shadowed and moonlit),
    // cliff bands following the contours, and long couloirs from the ridges
    const tex = el('g', {}, gMount);
    const trailNear = (x, y, r) => PATHS.some(p => p.pts.some(q => Math.abs(q[0] - x) < r && Math.abs(q[1] - y) < r));
    let shadeD = '', shadeD2 = '', litD = '', litD2 = '';
    function shards(poly, n, fall, litShare) {
        let placed = 0, tries = 0;
        while (placed < n && tries++ < n * 40) {
            const x = rr(-100, 1700), y = rr(570, 960);
            if (!inside([x, y], poly) || !inside([x, y], SIL.pts)) continue;
            placed++;
            const hi = y < 660 ? .6 : 1;
            const ang = Math.atan2(1, fall) + rr(-.3, .3);
            const len = rr(5, 20) * hi, wid = rr(1, 3.4) * hi;
            const ax = Math.cos(ang), ay = Math.sin(ang), px = -ay, py = ax;
            const q = [[x, y], [x + ax * len * .45 + px * wid, y + ay * len * .45 + py * wid],
                       [x + ax * len, y + ay * len], [x + ax * len * .5 - px * wid * .35, y + ay * len * .5 - py * wid * .35]];
            const d = PZ(q);
            if (rnd() < litShare) { if (rnd() < .5) litD += d; else litD2 += d; }
            else if (rnd() < .5) shadeD += d; else shadeD2 += d;
        }
    }
    shards(faceL, 420, -.55, .06);
    shards(SIL.pts, 460, .1, .3);
    shards(faceR, 520, .62, .45);
    el('path', { d: shadeD, fill: '#060a15', 'fill-opacity': .32 }, tex);
    el('path', { d: shadeD2, fill: '#0b1122', 'fill-opacity': .22 }, tex);
    el('path', { d: litD, fill: '#b2c1e0', 'fill-opacity': .09 }, tex);
    el('path', { d: litD2, fill: '#d6e0f5', 'fill-opacity': .06 }, tex);
    // cliff bands: broken contour lines with a dark underside and a lit lip
    let bandD = '', lipD = '';
    for (let b = 0; b < 16; b++) {
        const y0 = rr(600, 900), x0 = rr(300, 1250), len = rr(40, 150) * (y0 < 680 ? .5 : 1);
        const pts = [];
        for (let x = x0; x < x0 + len; x += rr(4, 9)) {
            const y = y0 + (x - x0) * rr(-.18, .22) * .4 + rr(-1.4, 1.4);
            if (!inside([x, y - 4], SIL.pts) || trailNear(x, y, 7)) { if (pts.length > 2) break; else continue; }
            pts.push([x, y]);
        }
        if (pts.length < 3) continue;
        bandD += P(pts.map(p => [p[0], p[1] + 1.4]));
        lipD += P(pts);
    }
    el('path', { d: bandD, fill: 'none', stroke: '#050912', 'stroke-opacity': .45, 'stroke-width': 2.4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, tex);
    el('path', { d: lipD, fill: 'none', stroke: '#b9c7e4', 'stroke-opacity': .16, 'stroke-width': .7, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, tex);
    // couloirs: long shallow gullies running down from the ridge
    let coulD = '', coulLit = '';
    [[760, 600, -.7, 150], [720, 640, -.9, 190], [650, 690, -.8, 160], [560, 725, -.6, 150], [860, 610, .5, 170], [900, 650, .7, 190],
     [960, 700, .8, 150], [1060, 750, .9, 110], [820, 600, .05, 120], [470, 780, -.5, 110]].forEach(([x, y, dx, len]) => {
        const pts = [[x, y]];
        let cx = x, cy = y;
        for (let s = 0; s < len; s += 8) { cx += dx * 8 * rr(.6, 1.2) + rr(-1.5, 1.5); cy += 8 * rr(.8, 1.1); pts.push([cx, cy]); }
        coulD += P(pts);
        coulLit += P(pts.map(p => [p[0] + 1.2 * Math.sign(dx || 1), p[1] - .4]));
    });
    el('path', { d: coulD, fill: 'none', stroke: '#060a14', 'stroke-opacity': .35, 'stroke-width': 1.6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, tex);
    el('path', { d: coulLit, fill: 'none', stroke: '#aebddb', 'stroke-opacity': .1, 'stroke-width': .6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, tex);
    // crags: small outcrops with a moonlit upper edge
    const crag = el('g', {}, gMount);
    let cragD = '', cragLit = '';
    for (let n = 0, tries = 0; n < 46 && tries < 2000; tries++) {
        const cx = rr(250, 1400), cy = rr(600, 930);
        if (!inside([cx, cy], SIL.pts) || !inside([cx, cy - 10], SIL.pts)) continue;
        // keep the trail clear
        if (trailNear(cx, cy + 12, 16) || trailNear(cx, cy, 34)) continue;
        n++;
        const r = rr(3, 9) * (cy < 680 ? .7 : 1), k = 5 + (rnd() * 3 | 0), pts = [];
        for (let i = 0; i < k; i++) {
            const a = Math.PI * 2 * i / k + rr(-.3, .3);
            pts.push([cx + Math.cos(a) * r * rr(.7, 1.2), cy + Math.sin(a) * r * .6 * rr(.7, 1.2)]);
        }
        cragD += PZ(pts);
        const topPts = pts.filter(q => q[1] < cy).sort((a, b) => a[0] - b[0]);
        if (topPts.length > 1) cragLit += P(topPts);
    }
    el('path', { d: cragD, fill: '#0c1322', 'fill-opacity': .75 }, crag);
    el('path', { d: cragLit, fill: 'none', stroke: '#c3cfe8', 'stroke-opacity': .3, 'stroke-width': .7, 'stroke-linejoin': 'round' }, crag);
    // frost glints high on the moonlit face
    let frost = '';
    for (let n = 0, tries = 0; n < 16 && tries < 600; tries++) {
        const x = rr(812, 920), y = rr(572, 660);
        if (!inside([x, y], faceR) || !inside([x, y - 3], SIL.pts)) continue;
        if (PATHS[3].pts.some(q => Math.hypot(q[0] - x, q[1] - y) < 7)) continue;
        n++;
        const w = rr(2, 6);
        frost += PZ([[x, y], [x + w, y + w * .35], [x + w * .6, y + w * .7], [x - w * .2, y + w * .4]]);
    }
    el('path', { d: frost, fill: '#c9d5ec', 'fill-opacity': .3 }, gMount);
    // ridge spurs and the moonlit rim of the mountain
    el('path', { d: P(spurA.slice(0, -1)), fill: 'none', stroke: '#050912', 'stroke-opacity': .45, 'stroke-width': 1.2 }, gMount);
    el('path', { d: P(spurB.slice(0, -1)), fill: 'none', stroke: '#b4c2de', 'stroke-opacity': .22, 'stroke-width': .9 }, gMount);
    el('path', { d: P(SIL.pts.slice(SIL.iR, SIL.pts.length - 1)), fill: 'none', stroke: 'url(#rimR)', 'stroke-width': 1.5, 'stroke-linejoin': 'round' }, gMount);
    el('path', { d: P(SIL.pts.slice(2, SIL.iR + 1)), fill: 'none', stroke: 'url(#rimL)', 'stroke-width': 1.1, 'stroke-linejoin': 'round' }, gMount);

    // moonlight on the rock (clipped to the mountain, moves with the moon)
    const washG = el('g', { 'clip-path': 'url(#clipMount)' }, gWash);
    const wash = el('ellipse', { rx: 420, ry: 300, fill: 'url(#wash)' }, washG);

    // --- the trail: a worn ledge with pebbles, rock steps on the final scramble
    const all = PATHS.reduce((a, p, i) => a.concat(i ? p.pts.slice(1) : p.pts), []);
    // (kept low-contrast: a worn ledge in the rock, not a marked route)
    el('path', { d: P(all.map(p => [p[0], p[1] + 1.5])), fill: 'none', stroke: '#050912', 'stroke-opacity': .5, 'stroke-width': 3.2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, gTrail);
    el('path', { d: P(all), fill: 'none', stroke: '#48536d', 'stroke-opacity': .5, 'stroke-width': 2.6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, gTrail);
    el('path', { d: P(all.map(p => [p[0], p[1] - 1])), fill: 'none', stroke: '#b3bfd8', 'stroke-opacity': .1, 'stroke-width': .5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, gTrail);
    let pebbles = '', pebShade = '';
    for (let i = 1; i < all.length; i += 1) {
        if (rnd() < .35) continue;
        const x = all[i][0] + rr(-2, 2), y = all[i][1] + rr(1.6, 3.2), rx = rr(.5, 1.3), ry = rx * rr(.5, .75);
        pebbles += `M${f1(x - rx)} ${f1(y)}a${f1(rx)} ${f1(ry)} 0 1 0 ${f1(rx * 2)} 0a${f1(rx)} ${f1(ry)} 0 1 0 ${f1(-rx * 2)} 0`;
        pebShade += `M${f1(x - rx)} ${f1(y + .4)}h${f1(rx * 2)}`;
    }
    el('path', { d: pebShade, stroke: '#04070f', 'stroke-opacity': .5, 'stroke-width': .5 }, gTrail);
    el('path', { d: pebbles, fill: '#76819b', 'fill-opacity': .55 }, gTrail);
    // the scramble: uneven rock steps where her feet land, not a ladder
    COARSE[3].slice(1, -1).forEach(([x, y], i) => {
        const l = rr(2.5, 4.5), r = rr(2.5, 4.5), sk = rr(-.6, .6), dx = (i % 2 ? 1 : -1) * rr(.5, 1.5);
        const q = [[x - l + dx, y + sk + .3], [x + dx - l * .3, y - .5], [x + r + dx, y - sk], [x + r * .8 + dx, y + rr(2, 3.5)], [x - l * .7 + dx, y + rr(2.5, 4)]];
        el('path', { d: PZ(q), fill: '#2b3651' }, gTrail);
        el('path', { d: P(q.slice(0, 3)), fill: 'none', stroke: '#c7d2ea', 'stroke-opacity': .3, 'stroke-width': .5, 'stroke-linejoin': 'round' }, gTrail);
    });

    // cairns beside the three resting footholds
    function cairn(x, y) {
        const g = el('g', { transform: `translate(${x} ${y})` }, gTrail);
        [[0, 0, 4.2, 1.7], [-.3, -2.9, 3.2, 1.4], [.4, -5.2, 2.3, 1.1], [0, -6.9, 1.3, .8]].forEach(([cx, cy, rx, ry]) => {
            el('ellipse', { cx, cy, rx, ry, fill: '#3d4964' }, g);
            el('path', { d: `M${cx - rx * .8} ${cy - ry * .45}Q${cx} ${cy - ry * 1.15} ${cx + rx * .85} ${cy - ry * .3}`, fill: 'none', stroke: '#cdd7ee', 'stroke-opacity': .45, 'stroke-width': .5 }, g);
        });
    }
    const endOf = i => COARSE[i][COARSE[i].length - 1];
    cairn(endOf(0)[0] + 8, endOf(0)[1] + .6);
    cairn(endOf(1)[0] - 8, endOf(1)[1] + .6);
    cairn(endOf(2)[0] + 7, endOf(2)[1] + .6);

    // --- foreground: dark meadow, conifers and boulders at the foot of the mountain
    const foreTop = midpoint([[-2400, 930], [-900, 915], [0, 925], [380, 906], [560, 918], [700, 928], [860, 916], [1200, 922], [1600, 905], [2400, 930], [3600, 915]], .12, 4);
    el('path', { d: PZ(foreTop.concat([[3600, 3400], [-2400, 3400]])), fill: '#070b15' }, gFore);
    el('path', { d: P(foreTop), fill: 'none', stroke: '#7385ab', 'stroke-opacity': .22, 'stroke-width': .8 }, gFore);
    function tree(x, y, h, fill) {
        const w = h * .34, tiers = 5 + (h > 30 ? 2 : 0), pts = [[x, y - h]];
        for (let i = 1; i <= tiers; i++) {
            const t = i / tiers, yy = y - h + h * .86 * t, ww = w * (.25 + .75 * t);
            pts.push([x + ww, yy + rr(0, 1.6)], [x + ww * .45, yy - h * .03]);
        }
        const right = pts.slice(), left = right.slice(1).map(p => [2 * x - p[0] + rr(-.6, .6), p[1] + rr(-.4, .4)]).reverse();
        const body = right.concat([[x + 1, y], [x - 1, y]], left);
        el('path', { d: PZ(body), fill }, gFore);
        el('path', { d: P(right.slice(0, 5)), fill: 'none', stroke: '#9fb0d6', 'stroke-opacity': .18, 'stroke-width': .6 }, gFore);
    }
    for (let i = 0; i < 70; i++) {
        let x = rr(-900, 2300);
        if (x > 520 && x < 800) continue;   // keep the trailhead open
        const y = foreTop.reduce((b, p) => Math.abs(p[0] - x) < Math.abs(b[0] - x) ? p : b)[1] + rr(2, 10);
        tree(x, y, rr(16, 44), rnd() < .5 ? '#0a101d' : '#0c1322');
    }
    let grass = '';
    for (let x = -900; x < 2300; x += rr(1.5, 4)) {
        const y = foreTop.reduce((b, p) => Math.abs(p[0] - x) < Math.abs(b[0] - x) ? p : b)[1] + 1;
        grass += `M${f1(x)} ${f1(y)}q${f1(rr(-1, 1))} ${f1(-rr(2, 5) / 2)} ${f1(rr(-2, 2))} ${f1(-rr(2, 6))}`;
    }
    el('path', { d: grass, fill: 'none', stroke: '#1a2440', 'stroke-width': .6, 'stroke-linecap': 'round' }, gFore);
    [[610, 900, 9], [598, 904, 5], [705, 902, 7], [742, 898, 4]].forEach(([x, y, r]) => {
        el('path', { d: `M${x - r} ${y + 2}Q${x - r * .9} ${y - r * .7} ${x} ${y - r * .8}Q${x + r} ${y - r * .6} ${x + r} ${y + 2}Z`, fill: '#1a2338' }, gFore);
        el('path', { d: `M${x - r * .4} ${y - r * .75}Q${x + r * .5} ${y - r * .75} ${x + r * .9} ${y - r * .1}`, fill: 'none', stroke: '#c3cfe8', 'stroke-opacity': .35, 'stroke-width': .6 }, gFore);
    });

    // the "dim" overlay: the land's shapes in night blue, faded in behind the cake
    RANGE_SHAPES.forEach(s => el('path', { d: PZ(s), fill: '#050814' }, gDim));
    el('path', { d: silD, fill: '#050814' }, gDim);
    el('path', { d: PZ(foreTop.concat([[3600, 3400], [-2400, 3400]])), fill: '#050814' }, gDim);

    /* =================================================================
       3. THE MOON (world coordinates; drawn at radius 50, then scaled)
       ================================================================= */
    const moonG = el('g', {}, gMoon);
    const moonHalo = el('circle', { r: 280, fill: 'url(#mHalo)' }, moonG);
    const moonHaloW = el('circle', { r: 220, fill: 'url(#mHaloW)', opacity: 0 }, moonG);
    el('circle', { r: 50, fill: 'url(#mDisc)' }, moonG);
    el('path', { d: 'M-30-14c6-10 20-12 26-4 5 7-2 15-11 16-9 1-18-3-15-12zM4 10c8-5 21-2 23 7 2 8-9 12-17 9-7-2-11-11-6-16zM-24 16c4-3 10-1 10 4 0 5-6 7-10 5-3-2-3-6 0-9zM10-30c6-3 15 0 14 6-1 5-9 6-14 3-3-2-3-7 0-9z', fill: '#a9b2c4', 'fill-opacity': .38 }, moonG);
    [[-12, -30, 4], [22, -8, 5], [-34, 6, 3], [14, 30, 3.5], [-6, 24, 2.5], [30, 16, 2.2], [-20, -2, 2.8]].forEach(([x, y, r]) => {
        el('circle', { cx: x, cy: y, r, fill: '#b8c0cf', 'fill-opacity': .42 }, moonG);
        el('path', { d: `M${x - r * .8} ${y + r * .5}a${r} ${r} 0 0 0 ${r * 1.6} 0`, fill: 'none', stroke: '#f3f5f9', 'stroke-opacity': .55, 'stroke-width': .7 }, moonG);
    });
    el('circle', { r: 50, fill: 'url(#mLimb)' }, moonG);
    const moonWarm = el('circle', { r: 50, fill: 'url(#mWarm)', opacity: 0 }, moonG);
    const moonBright = el('circle', { r: 50, fill: '#ffffff', opacity: 0 }, moonG);

    const moon = { x: 905, y: 470, R: 34, bright: 0, warm: 0, op: 1 };
    const MOON0 = { x: 905, y: 470, R: 34 };
    let MOONF = null;          // final position, worked out from the climber's reach below

    /* =================================================================
       4. THE CLIMBER — a small articulated figure. Feet are placed on the
          trail; hips, knees and elbows are solved each frame.
       ================================================================= */
    const RIG = { thigh: 6.6, shin: 6.6, torso: 8.6, headR: 2.5, upper: 5.0, fore: 4.9 };
    const COL = {
        jacket: '#b9573c', jacketFar: '#8a3d2b', lit: '#e58e67', pants: '#34405a', pantsFar: '#252e42',
        boot: '#4b3326', sole: '#1c130e', skin: '#e3b192', skinFar: '#c79478', hair: '#2b1c17',
        pack: '#5d6a4b', packDark: '#434e36', roll: '#b0915a', strap: '#2b2f25'
    };
    const beamG = el('g', {}, gClimber);
    el('path', { d: 'M0-.6L58-11Q62 0 58 11L0 .6Z', fill: 'url(#lampBeam)' }, beamG);
    const farLeg = el('path', { fill: 'none', stroke: COL.pantsFar, 'stroke-width': 2.4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, gClimber);
    const BOOT = 'M-1.4 0L2.6 0Q3.1-.8 2.1-1.3L.9-1.6L.7-2.6L-1.1-2.6L-1.4-1.1Z';
    const farBoot = el('path', { d: BOOT, fill: '#3a281e' }, gClimber);
    const farArm = el('path', { fill: 'none', stroke: COL.jacketFar, 'stroke-width': 1.8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, gClimber);
    const farHand = el('circle', { r: .8, fill: COL.skinFar }, gClimber);
    const torsoG = el('g', {}, gClimber);
    // local torso frame: x forward, y down, hip at (0,0), shoulder at (0,-torso)
    torsoG.innerHTML = `
        <path d="M-2.1 1.3L1.9 1.3C2.4-2.5 2.3-5.8 1.6-8.5L-1.6-8.9C-2.3-6-2.5-2.5-2.1 1.3Z" fill="${COL.jacket}"/>
        <path d="M1.9 1.3C2.4-2.5 2.3-5.8 1.6-8.5" fill="none" stroke="${COL.lit}" stroke-width=".55" stroke-opacity=".8"/>
        <path d="M-2.1 .2L1.95 .2" stroke="#7b3526" stroke-width=".5"/>
        <path d="M-1.2-8.7L1.3-8.3L1-9.6L-.9-9.9Z" fill="#7b3526"/>
        <path d="M-6.6-7.4Q-6.9-2.8-5.8.2L-2.2.4L-1.9-7.9Q-4.6-8.6-6.6-7.4Z" fill="${COL.pack}"/>
        <path d="M-6.6-7.4Q-6.9-2.8-5.8.2L-4.9.2Q-5.8-3.5-5.4-7.8Z" fill="${COL.packDark}"/>
        <path d="M-5.6-2.6L-2.6-2.4L-2.7-.6L-5.4-.8Z" fill="${COL.packDark}"/>
        <rect x="-6.9" y="-10" width="5.2" height="2.6" rx="1.3" fill="${COL.roll}"/>
        <path d="M-6.4-9.2h4.2" stroke="#8a6f41" stroke-width=".4"/>
        <path d="M-2-7.9Q.4-7 .9-3.2" fill="none" stroke="${COL.strap}" stroke-width=".7"/>`;
    const nearLeg = el('path', { fill: 'none', stroke: COL.pants, 'stroke-width': 2.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, gClimber);
    const nearBoot = el('path', { d: BOOT, fill: COL.boot }, gClimber);
    const headG = el('g', {}, gClimber);
    // local head frame: x forward, y down, centre (0,0)
    headG.innerHTML = `
        <path class="pony" d="M-2.1-1Q-4.4-.6-4.9 1.8Q-5 3.6-4 4.6Q-3.7 2.4-2.6 1Z" fill="${COL.hair}"/>
        <circle r="2.5" fill="${COL.skin}"/>
        <path d="M2.3-1.2Q1.4-3.2-.6-3.1Q-2.6-3-2.7-.6Q-2.6 1.4-1.4 2.2Q-1.8.4-1.1-.3Q.4-.9 2.3-1.2Z" fill="${COL.hair}"/>
        <path d="M-2.6-1.1Q-.2-2.5 2.45-1.6" fill="none" stroke="#1d2330" stroke-width=".55"/>
        <rect x="1.7" y="-2.25" width="1.3" height="1.05" rx=".35" fill="#eef0f2"/>
        <circle class="lamp" cx="2.9" cy="-1.72" r=".45" fill="#fff6dc"/>
        <ellipse cx="-.5" cy=".25" rx=".55" ry=".7" fill="#c98f72"/>
        <circle cx="1.45" cy="-.15" r=".28" fill="#2a1a14"/>
        <path d="M2.45.1Q2.95.5 2.4.8" fill="none" stroke="#c98f72" stroke-width=".35"/>`;
    const pony = headG.querySelector('.pony');
    const nearArm = el('path', { fill: 'none', stroke: COL.jacket, 'stroke-width': 1.9, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, gClimber);
    const nearHand = el('circle', { r: .85, fill: COL.skin }, gClimber);
    const lampGlow = el('circle', { r: 1.1, fill: '#fff4d6', opacity: .35 }, gClimber);

    // pose state
    const C = {
        hip: { x: 0, y: 0 }, dir: 1, lean: .08, look: 0,
        feet: [{ x: 0, y: 0, pitch: 0 }, { x: 0, y: 0, pitch: 0 }],   // [near, far]
        arms: [{ ang: .1, bend: .35, w: 0, tx: 0, ty: 0 }, { ang: -.1, bend: .35, w: 0, tx: 0, ty: 0 }],
        pony: 0, lamp: 1, alpha: 1, tiptoe: 0, breath: 1
    };

    function ik(ax, ay, tx, ty, l1, l2, bend) {
        let dx = tx - ax, dy = ty - ay, d = Math.hypot(dx, dy);
        const max = l1 + l2 - .02, min = Math.abs(l1 - l2) + .05;
        if (d > max) { tx = ax + dx / d * max; ty = ay + dy / d * max; dx = tx - ax; dy = ty - ay; d = max; }
        if (d < min) d = min;
        const a = (l1 * l1 - l2 * l2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
        const mx = ax + dx / d * a, my = ay + dy / d * a, nx = -dy / d, ny = dx / d;
        const j1 = { x: mx + nx * h, y: my + ny * h }, j2 = { x: mx - nx * h, y: my - ny * h };
        return { j: ((j1.x - mx) * bend >= 0) ? j1 : j2, e: { x: tx, y: ty } };
    }
    // where the ankle sits for a foot resting on the ground (with toe pivot for tiptoe)
    function ankleOf(f, d) {
        const p = f.pitch || 0;
        // ankle local (0.1,-1.3) rotated by pitch about the toe (2.6,0), then mirrored by facing
        const lx = .1 - 2.6, ly = -1.3, c = Math.cos(p), sn = Math.sin(p);
        const rx = lx * c - ly * sn + 2.6, ry = lx * sn + ly * c;
        return { x: f.x + rx * d, y: f.y + ry };
    }
    function joints() {
        const d = C.dir, lean = C.lean;
        const u = { x: Math.sin(lean) * d, y: -Math.cos(lean) };          // up the spine
        const n = { x: Math.cos(lean) * d, y: Math.sin(lean) };           // forward
        const torso = RIG.torso + .12 * Math.sin(performance.now() / 700) * C.breath;
        const hip = C.hip;
        const sh = { x: hip.x + u.x * torso, y: hip.y + u.y * torso };
        const armRoot = { x: sh.x - u.x * .7 - n.x * .2, y: sh.y - u.y * .7 - n.y * .2 };
        const ha = C.look + lean * .5;                                    // head angle
        const hu = { x: Math.sin(ha * .4 + lean * .6) * d, y: -Math.cos(ha * .4 + lean * .6) };
        const head = { x: sh.x + hu.x * (1.2 + RIG.headR), y: sh.y + hu.y * (1.2 + RIG.headR) };
        return { d, u, n, hip, sh, armRoot, ha, head };
    }
    function armPos(J, a, far) {
        const d = J.d, root = { x: J.armRoot.x - J.n.x * (far ? .5 : 0), y: J.armRoot.y - J.n.y * (far ? .5 : 0) };
        const ang = a.ang + C.lean * .3;
        const el1 = { x: root.x + Math.sin(ang) * d * RIG.upper, y: root.y + Math.cos(ang) * RIG.upper };
        const hand = { x: el1.x + Math.sin(ang + a.bend) * d * RIG.fore, y: el1.y + Math.cos(ang + a.bend) * RIG.fore };
        const tx = lerp(hand.x, a.tx, a.w), ty = lerp(hand.y, a.ty, a.w);
        // reaching overhead the elbow drops outward; otherwise it bends back as usual
        const s = ik(root.x, root.y, tx, ty, RIG.upper, RIG.fore, ty < root.y - 3 ? d : -d);
        return { root, elbow: s.j, hand: s.e };
    }
    function renderClimber(dt) {
        const J = joints(), d = J.d;
        const sd = Math.abs(d) < .12 ? .12 * (Math.sign(d) || 1) : d;
        gClimber.setAttribute('opacity', f1(C.alpha * 100) / 100);
        // legs
        [[nearLeg, nearBoot, C.feet[0], 0], [farLeg, farBoot, C.feet[1], .6]].forEach(([leg, boot, f, back]) => {
            const an = ankleOf(f, d);
            const hx = J.hip.x - J.n.x * back * .5, hy = J.hip.y;
            const s = ik(hx, hy, an.x, an.y, RIG.thigh, RIG.shin, d);
            leg.setAttribute('d', `M${f1(hx)} ${f1(hy)}L${f1(s.j.x)} ${f1(s.j.y)}L${f1(s.e.x)} ${f1(s.e.y)}`);
            boot.setAttribute('transform', `translate(${f1(f.x)} ${f1(f.y)}) scale(${f1(sd * 100) / 100} 1) rotate(${f1(f.pitch * 57.3)} 2.6 0)`);
        });
        // arms
        const A0 = armPos(J, C.arms[0], false), A1 = armPos(J, C.arms[1], true);
        farArm.setAttribute('d', `M${f1(A1.root.x)} ${f1(A1.root.y)}L${f1(A1.elbow.x)} ${f1(A1.elbow.y)}L${f1(A1.hand.x)} ${f1(A1.hand.y)}`);
        farHand.setAttribute('cx', f1(A1.hand.x)); farHand.setAttribute('cy', f1(A1.hand.y));
        nearArm.setAttribute('d', `M${f1(A0.root.x)} ${f1(A0.root.y)}L${f1(A0.elbow.x)} ${f1(A0.elbow.y)}L${f1(A0.hand.x)} ${f1(A0.hand.y)}`);
        nearHand.setAttribute('cx', f1(A0.hand.x)); nearHand.setAttribute('cy', f1(A0.hand.y));
        // torso and pack
        torsoG.setAttribute('transform', `matrix(${J.n.x.toFixed(3)} ${J.n.y.toFixed(3)} ${(-J.u.x).toFixed(3)} ${(-J.u.y).toFixed(3)} ${f1(J.hip.x)} ${f1(J.hip.y)})`);
        // head: looks along C.look (negative = up)
        // local x = forward (fx,fy), local y = down (ux,uy); mirrored when facing left
        const fx = Math.cos(J.ha) * sd, fy = Math.sin(J.ha);
        const ux = -Math.sin(J.ha) * sd, uy = Math.cos(J.ha);
        headG.setAttribute('transform', `matrix(${fx.toFixed(3)} ${fy.toFixed(3)} ${ux.toFixed(3)} ${uy.toFixed(3)} ${f1(J.head.x)} ${f1(J.head.y)})`);
        pony.setAttribute('transform', `rotate(${f1(C.pony * 57.3)} -2.2 -.8)`);
        // headlamp: at head-local (2.9, -1.72), shining where she looks
        const lamp = { x: J.head.x + 2.9 * fx - 1.72 * ux, y: J.head.y + 2.9 * fy - 1.72 * uy };
        beamG.setAttribute('transform', `translate(${f1(lamp.x)} ${f1(lamp.y)}) rotate(${f1((Math.atan2(fy, fx) + .14 * Math.sign(sd)) * 57.3)})`);
        beamG.setAttribute('opacity', f1(C.lamp * 100) / 100);
        lampGlow.setAttribute('cx', f1(lamp.x)); lampGlow.setAttribute('cy', f1(lamp.y));
        lampGlow.setAttribute('opacity', f1(C.lamp * 55) / 100);
        return { J, A0 };
    }

    /* =================================================================
       5. POSING — standing, walking and scrambling
       ================================================================= */
    const LEG = RIG.thigh + RIG.shin;
    function settleHip(targetX, groundY, bob) {
        let y = groundY - 1.3 - LEG * .95 - bob;
        const d = C.dir;
        C.feet.forEach(f => {
            if (f.lift) return;
            const a = ankleOf(f, d), dx = targetX - a.x, max = LEG - .1;
            if (Math.abs(dx) < max) y = Math.max(y, a.y - Math.sqrt(max * max - dx * dx));
        });
        C.hip.x = targetX; C.hip.y = y;
    }
    function stand(pt, dir) {
        C.dir = dir;
        C.feet[0] = { x: pt.x + 1.1 * dir, y: pt.y, pitch: 0 };
        C.feet[1] = { x: pt.x - 1.1 * dir, y: pt.y, pitch: 0 };
        settleHip(pt.x, pt.y, 0);
    }
    function slopePitch(path, s, dir) {
        const a = path.at(s - 2.5), b = path.at(s + 2.5);
        const dx = (b.x - a.x) * dir;
        return clamp(Math.atan2(b.y - a.y, Math.abs(dx) < .01 ? .01 : dx), -.5, .5) * .7;
    }

    // sounds (shared audio context from gift3_script.js; follows the game's mute)
    const Snd = (() => {
        let noise = null, wind = null;
        const ctx = () => { try { return (!G3.muted || !G3.muted()) && G3.audio ? G3.audio() : null; } catch (e) { return null; } };
        function buf(c) {
            if (noise) return noise;
            noise = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
            const d = noise.getChannelData(0);
            for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
            return noise;
        }
        return {
            step(v = 1) {
                const c = ctx(); if (!c) return;
                const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(), t = c.currentTime;
                s.buffer = buf(c); f.type = 'bandpass'; f.frequency.value = rr(700, 1300); f.Q.value = 1.2;
                g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(.05 * v, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + .13);
                s.connect(f); f.connect(g); g.connect(c.destination); s.start(t, rr(0, 1.5), .15);
            },
            chime(notes, vol = .06, gap = .12, len = 1.6) {
                const c = ctx(); if (!c) return;
                notes.forEach((fr, i) => {
                    const o = c.createOscillator(), g = c.createGain(), t = c.currentTime + i * gap;
                    o.type = 'sine'; o.frequency.value = fr;
                    g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(vol, t + .02); g.gain.exponentialRampToValueAtTime(.0001, t + len);
                    o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + len + .05);
                });
            },
            windOn() {
                const c = ctx(); if (!c || wind) return;
                const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(), lfo = c.createOscillator(), lg = c.createGain();
                s.buffer = buf(c); s.loop = true; f.type = 'lowpass'; f.frequency.value = 380; f.Q.value = .6;
                lfo.frequency.value = .09; lg.gain.value = 160; lfo.connect(lg); lg.connect(f.frequency);
                g.gain.setValueAtTime(.0001, c.currentTime); g.gain.linearRampToValueAtTime(.035, c.currentTime + 3);
                s.connect(f); f.connect(g); g.connect(c.destination); s.start(); lfo.start();
                wind = { g, c };
            },
            windOff() {
                if (!wind) return;
                const t = wind.c.currentTime;
                wind.g.gain.cancelScheduledValues(t); wind.g.gain.setValueAtTime(wind.g.gain.value, t); wind.g.gain.linearRampToValueAtTime(.0001, t + 4);
            }
        };
    })();

    let progress = 0;   // 0..1 along the whole trail: brings the moon closer
    let stage = 0;      // next stage to climb
    let phase = 'intro';
    let camMode = 'wide';

    async function turnTo(dir) {
        const from = C.dir;
        if (from === dir) return;
        const pt = { x: (C.feet[0].x + C.feet[1].x) / 2, y: Math.min(C.feet[0].y, C.feet[1].y) };
        await tween(REDUCED ? 1 : 520, e => {
            C.dir = lerp(from, dir, e);
            C.feet[0].x = pt.x + 1.1 * C.dir; C.feet[1].x = pt.x - 1.1 * C.dir;
            settleHip(pt.x, pt.y, Math.sin(Math.PI * e) * -.5);
        });
        C.dir = dir;
    }

    async function lookAtMoon(on, ms = 800) {
        const from = C.look;
        await tween(ms, e => {
            const J = joints();
            const to = on ? clamp(Math.atan2(moon.y - J.head.y, Math.abs(moon.x - J.head.x) + 1) , -1.05, .2) : -.12;
            C.look = lerp(from, to, e);
        });
    }

    async function walkStage(i) {
        const path = PATHS[i], dir = FACING[i];
        await turnTo(dir);
        const scramble = i === 3;
        const stepLen = scramble ? 9.5 : 12.5, dur = scramble ? 470 : 380;
        const n = Math.max(2, Math.round(path.L / stepLen)), st = path.L / n;
        // one short breather on the second stage and before the final scramble
        const pauseAt = i === 1 ? Math.floor(n * .55) : i === 3 ? Math.floor(n * .4) : -1;
        const feetS = [Math.min(1.5, path.L), 0];
        const startW = [{ ...C.feet[0] }, { ...C.feet[1] }];
        for (let k = 1; k <= n; k++) {
            const sw = k % 2 ? 1 : 0, sc = 1 - sw;
            const fromW = { ...C.feet[sw] }, toS = k * st, to = path.at(toS);
            const stanceS = feetS[sc];
            const hipFromS = (feetS[0] + feetS[1]) / 2, hipToS = (stanceS + toS) / 2;
            const hipFrom = C.hip.x, dist = Math.abs(toS - feetS[sw]);
            const ms = dur * clamp(dist / (2 * st), .55, 1.1);
            const pitchTo = slopePitch(path, toS, dir);
            let stepped = false;
            await tween(ms, (e, t) => {
                const sF = C.feet[sw];
                const lift = (2.2 + Math.max(0, fromW.y - to.y) * .35) * Math.sin(Math.PI * e);
                sF.x = lerp(fromW.x, to.x, e); sF.y = lerp(fromW.y, to.y, e) - lift;
                sF.lift = t < .92; sF.pitch = lerp(fromW.pitch || 0, pitchTo, e) + Math.sin(Math.PI * e) * .25;
                const hs = lerp(hipFromS, hipToS, t);
                const hp = path.at(hs);
                const hx = lerp(hipFrom, hp.x + dir * .6, t);
                const sl = path.slope(hs);
                C.lean = scramble ? .42 + Math.sin(Math.PI * t) * .06 : .07 + clamp(sl, 0, .6) * .5;
                C.look = scramble ? -.25 : -clamp(sl, 0, .6) * .5;
                settleHip(hx, hp.y, Math.sin(Math.PI * t) * .45);
                // arms: swing opposite the legs, or reach for the rock on the scramble
                const fwd = clamp(((C.feet[0].x - C.hip.x) * dir) / (st * .6), -1, 1);
                if (scramble) {
                    const phase = (k + t) * Math.PI;
                    [0, 1].forEach(a => {
                        const hold = path.at(hs + 6 + 2.6 * Math.sin(phase + a * Math.PI));
                        C.arms[a].w = Math.min(1, C.arms[a].w + .08);
                        C.arms[a].tx = hold.x + dir * (a ? -.6 : .6); C.arms[a].ty = hold.y - 1.4 - Math.max(0, Math.cos(phase + a * Math.PI)) * 1.6;
                    });
                } else {
                    C.arms[0].ang = -fwd * .5; C.arms[1].ang = fwd * .5;
                    C.arms.forEach(a => { a.w = Math.max(0, a.w - .08); a.bend = .35 + clamp(sl, 0, .6) * .5; });
                }
                // the whole-trail position moves the moon closer
                progress = (STAGE_START[i] + hs) / TOTAL;
                if (!stepped && t > .9) { stepped = true; Snd.step(scramble ? .7 : 1); }
            }, E.lin);
            C.feet[sw].lift = false;
            C.feet[sw].x = to.x; C.feet[sw].y = to.y; C.feet[sw].pitch = pitchTo;
            feetS[sw] = toS;
            if (k === pauseAt) await breather(i);
        }
        // close the trailing foot beside the leading one
        const lead = n % 2 ? 1 : 0, tr = 1 - lead, end = path.at(path.L);
        const fromW = { ...C.feet[tr] }, to = { x: end.x - dir * 1.2, y: path.at(path.L - 1.2).y };
        await tween(scramble ? 480 : 380, (e, t) => {
            const f = C.feet[tr];
            f.x = lerp(fromW.x, to.x, e); f.y = lerp(fromW.y, to.y, e) - Math.sin(Math.PI * e) * 1.6;
            f.lift = t < .9; f.pitch = lerp(fromW.pitch || 0, 0, e);
            C.lean = lerp(C.lean, .06, .08);
            C.look = lerp(C.look, -.1, .08);
            C.arms.forEach(a => { a.w = lerp(a.w, 0, .12); a.ang = lerp(a.ang, (a === C.arms[0] ? .06 : -.06), .12); a.bend = lerp(a.bend, .35, .1); });
            settleHip(lerp(C.hip.x, end.x, .12), end.y, 0);
        });
        C.feet[tr].lift = false; C.feet[tr].pitch = 0; C.feet[lead].pitch = 0;
        Snd.step(.6);
        progress = (STAGE_START[i] + path.L) / TOTAL;
        void startW;
    }

    // a short pause on the way: catch a breath and look up at the moon
    async function breather() {
        const hx = C.hip.x, gy = (C.feet[0].y + C.feet[1].y) / 2;
        const lean0 = C.lean;
        C.arms.forEach(a => { a.w = 0; });
        await tween(360, e => {
            C.lean = lerp(lean0, .02, e);
            C.arms[0].ang = lerp(C.arms[0].ang, .08, e); C.arms[1].ang = lerp(C.arms[1].ang, -.05, e);
            settleHip(hx, gy, 0);
        });
        await lookAtMoon(true, 600);
        await wait(450);
        await lookAtMoon(false, 420);
    }

    /* =================================================================
       6. THE CAMERA — one viewBox over the world; eases between framings
       ================================================================= */
    const cam = { cx: 825, cy: 637, k: 1 };
    let W = innerWidth, H = innerHeight;
    function rectCam(x0, y0, x1, y1) {
        return { cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, k: Math.min(W / (x1 - x0), H / (y1 - y0)) };
    }
    function cakePlate() {
        const r = document.getElementById('cake').getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height * (477 / 500), s: r.width / 220 };
    }
    // where Anne stands in the cake scene: just behind and to the left of the cake,
    // so the cake is in front of her and never covers her
    const CHEST = .7;   // the cake's plate is level with her chest (fraction of her height above her feet)
    const GAP = 70;     // extra space between Anne and the cake, in screen pixels
    function anneSpot() {
        const p = cakePlate();
        // her height on screen (px); the cake's plate sits at her chest, so her feet are
        // below it — she must still fit above the bottom edge
        const tall = clamp(Math.min(H * .32, 190, (H - 18 - p.y) / CHEST), 60, 190);
        return { x: p.x - 99 * p.s - GAP - tall * .12, y: p.y + tall * CHEST, k: clamp(tall / 26, 1.2, 8) };
    }
    function camTarget() {
        if (camMode === 'cake') {
            const a = anneSpot();
            return { cx: SUMMIT.x + (W / 2 - a.x) / a.k, cy: SUMMIT.y + (H / 2 - a.y) / a.k, k: a.k };
        }
        if (camMode === 'wide') return W < H ? rectCam(470, 400, 1150, 945) : rectCam(215, 318, 1435, 948);
        if (camMode === 'follow') {
            let w = [700, 620, 540, 470][Math.min(stage, 3)];
            if (W < H) w *= .62;
            const h = w * .6;
            const cx = C.hip.x + C.dir * w * .07, cy = C.hip.y - h * .14;
            return { cx, cy, k: Math.min(W / w, H / h) };
        }
        // summit / cake: the summit sits exactly where the cake's plate is on screen
        const p = cakePlate();
        const k = clamp(Math.min((p.y - H * .27) / 128, (W - p.x - 16) / 92, p.x / 60, 3.4), .45, 3.4);
        return { cx: SUMMIT.x + (W / 2 - p.x) / k, cy: SUMMIT.y + (H / 2 - p.y) / k, k };
    }
    const toScreen = (x, y) => ({ x: (x - cam.cx) * cam.k + W / 2, y: (y - cam.cy) * cam.k + H / 2 });
    const toWorld = (x, y) => ({ x: (x - W / 2) / cam.k + cam.cx, y: (y - H / 2) / cam.k + cam.cy });

    /* =================================================================
       7. THE MOON
       ================================================================= */
    function renderMoon() {
        if (MOONF && phase !== 'glide' && phase !== 'cake') {
            const e = E.sine(clamp(progress, 0, 1));
            const fx = lerp(MOONF.hx, MOONF.x, moonSettle), fy = lerp(MOONF.hy, MOONF.y, moonSettle);
            moon.x = lerp(MOON0.x, fx, e); moon.y = lerp(MOON0.y, fy, e); moon.R = lerp(MOON0.R, MOONF.R, e);
        }
        const s = moon.R / 50;
        moonG.setAttribute('transform', `translate(${moon.x.toFixed(2)} ${moon.y.toFixed(2)}) scale(${s.toFixed(4)})`);
        moonG.setAttribute('opacity', moon.op.toFixed(3));
        moonBright.setAttribute('opacity', (moon.bright * .55).toFixed(3));
        moonWarm.setAttribute('opacity', moon.warm.toFixed(3));
        moonHalo.setAttribute('opacity', (1 - moon.warm * .6 + moon.bright * .6).toFixed(3));
        moonHaloW.setAttribute('opacity', (moon.bright * .9 + moon.warm * .3).toFixed(3));
        wash.setAttribute('cx', f1(moon.x)); wash.setAttribute('cy', f1(moon.y + moon.R * 2.2));
        wash.setAttribute('opacity', (.8 + moon.bright).toFixed(2));
    }

    /* =================================================================
       8. FOOTHOLDS — a faint glint on the next resting place, clickable
       ================================================================= */
    const HOLDS = COARSE.map(c => c[c.length - 1]);
    const holdEls = HOLDS.map(([x, y]) => {
        const g = el('g', { class: 'hold', transform: `translate(${x} ${y - 5})`, opacity: 0, style: 'transition:opacity 1s ease' }, gHolds);
        el('circle', { r: 20, fill: '#000', 'fill-opacity': 0 }, g);
        const s = el('g', { class: 'glint' }, g);
        el('circle', { r: 4, fill: 'url(#mHalo)' }, s);
        el('path', { d: 'M0-3.2L.55-.55L3.2 0L.55.55L0 3.2L-.55.55L-3.2 0L-.55-.55Z', fill: '#eef3ff', 'fill-opacity': .85 }, s);
        g.addEventListener('click', e => { e.stopPropagation(); if (holdEls.indexOf(g) === stage) climb(); });
        return g;
    });
    function showHold(i, on) {
        holdEls.forEach((g, k) => { g.setAttribute('opacity', on && k === i ? 1 : 0); g.style.pointerEvents = on && k === i ? 'auto' : 'none'; });
    }

    /* =================================================================
       9. THE STORY
       ================================================================= */
    const TIPTOE = .5;          // heel lift when she stretches for the moon
    const HOVER = 3;            // how far the moon floats above her reach before the touch
    let moonSettle = 0;         // 0 = hovering, 1 = resting on her fingertips
    let moonFollow = false;     // after its glide the moon sits exactly on the page's own moon
    function computeMoonFinal() {
        // stand at the summit on tiptoe facing the moon; the moon sits so that the
        // fully stretched hand just meets its lower-left edge
        stand(SUMMIT, 1);
        C.tiptoe = 1; C.feet.forEach(f => { f.pitch = TIPTOE; });
        C.lean = -.06;
        settleHip(SUMMIT.x, SUMMIT.y, 0);
        const J = joints();
        const ang = -1.1, R = 46, reach = RIG.upper + RIG.fore - .35;
        const ux = Math.cos(ang), uy = Math.sin(ang);
        MOONF = { x: J.armRoot.x + ux * (reach + R), y: J.armRoot.y + uy * (reach + R), R, ang };
        // until she touches it, the moon hovers just out of reach
        MOONF.hx = MOONF.x + ux * HOVER; MOONF.hy = MOONF.y + uy * HOVER;
        C.tiptoe = 0; C.feet.forEach(f => { f.pitch = 0; });
    }

    function setControls(on) {
        keepBtn.classList.toggle('on', on);
        showHold(stage, on);
        if (on && !REDUCED) { try { keepBtn.focus({ preventScroll: true }); } catch (e) {} }
    }

    let busy = false;
    async function climb() {
        if (phase !== 'ready' || busy || stage > 3) return;
        busy = true; phase = 'moving';
        setControls(false);
        keepBtn.blur();
        caption.classList.remove('on');
        Snd.windOn();
        if (camMode === 'wide' && !REDUCED) camMode = 'follow';   // reduced motion keeps the still, wide view
        const i = stage;
        if (REDUCED) await calmStage(i); else await walkStage(i);
        stage++;
        if (stage > 3) { busy = false; summit(); return; }
        await wait(REDUCED ? 200 : 350);
        phase = 'ready'; busy = false;
        setControls(true);
    }

    // reduced motion: fade to the next resting place instead of walking
    async function calmStage(i) {
        const path = PATHS[i], end = path.at(path.L);
        await tween(380, e => { C.alpha = 1 - e; });
        stand(end, i === 3 ? 1 : FACING[i]);   // at the summit she faces the moon
        C.lean = .05; C.look = -.1; C.arms.forEach(a => { a.w = 0; });
        progress = (STAGE_START[i] + path.L) / TOTAL;
        await tween(520, e => { C.alpha = e; });
    }

    async function fadeWorld(change) {
        world.style.transition = 'opacity .6s ease';
        world.style.opacity = '0';
        await wait(650);
        change();
        await wait(60);
        world.style.opacity = '1';
    }

    async function summit() {
        phase = 'summit';
        if (REDUCED) await fadeWorld(() => { camMode = 'summit'; });   // one soft fade instead of a camera move
        else camMode = 'summit';
        // she arrives climbing leftwards, then turns round to face the moon
        await wait(REDUCED ? 0 : 250);
        await turnTo(1);
        stand(SUMMIT, 1);
        await wait(REDUCED ? 300 : 900);
        if (G3.showMessage) G3.showMessage(CLIMB_TEXT.summit, false);
        Snd.chime([392, 523.25, 659.25], .045, .16, 2.2);
        await wait(REDUCED ? 600 : 1500);
        // she looks up and reaches toward the moon (not quite touching)
        const J = joints();
        // an almost straight arm toward the moon; the touch adds the tiptoe and last stretch
        const a = C.arms[0], reachPre = RIG.upper + RIG.fore - 1.1;
        const pre = { x: J.armRoot.x + Math.cos(MOONF.ang) * reachPre, y: J.armRoot.y + Math.sin(MOONF.ang) * reachPre };
        if (REDUCED) {
            C.look = -.9; C.lean = -.04; a.w = 1; a.tx = pre.x; a.ty = pre.y; C.arms[1].ang = .25;
        } else {
            lookAtMoon(true, 900);
            await wait(500);
            const tx0 = a.tx, ty0 = a.ty;
            await tween(1300, e => {
                a.w = e; a.tx = lerp(tx0 || pre.x, pre.x, e); a.ty = lerp(ty0 || pre.y, pre.y, e);
                C.lean = lerp(.06, -.04, e); C.arms[1].ang = lerp(C.arms[1].ang, .25, e * .5);
                settleHip(SUMMIT.x, SUMMIT.y, 0);
            });
        }
        await wait(REDUCED ? 200 : 500);
        phase = 'moon';
        moonHint.textContent = CLIMB_TEXT.moonHint;
        moonHint.classList.add('on');
        moonBtn.classList.add('on');
        try { moonBtn.focus({ preventScroll: true }); } catch (e) {}
    }

    async function touchMoon() {
        if (phase !== 'moon') return;
        phase = 'touch';
        moonBtn.classList.remove('on');
        moonHint.classList.remove('on');
        const a = C.arms[0];
        const J0 = joints();
        const tx0 = a.tx, ty0 = a.ty;
        // she rises onto her toes and her fingertips meet the moon
        await tween(REDUCED ? 300 : 1050, e => {
            C.feet.forEach(f => { f.pitch = TIPTOE * e; });
            C.lean = lerp(-.04, -.06, e);
            moonSettle = E.io(clamp(e * 1.15, 0, 1));
            settleHip(SUMMIT.x, SUMMIT.y, 0);
            const J = joints();
            const reach = RIG.upper + RIG.fore - .35;
            const tgt = { x: J.armRoot.x + Math.cos(MOONF.ang) * reach, y: J.armRoot.y + Math.sin(MOONF.ang) * reach };
            a.tx = lerp(tx0, tgt.x, e); a.ty = lerp(ty0, tgt.y, e);
        }, E.io);
        void J0;
        const contact = { x: MOONF.x - Math.cos(MOONF.ang) * MOONF.R, y: MOONF.y - Math.sin(MOONF.ang) * MOONF.R };
        ripple(contact.x, contact.y);
        Snd.chime([659.25, 783.99, 987.77, 1318.51], .06, .1, 2.6);
        if (G3.hideMessage) G3.hideMessage();
        Snd.windOff();

        // 1. the moon brightens softly
        await tween(REDUCED ? 700 : 1300, e => { moon.bright = e; C.lamp = 1 - e * .7; });

        // 2. the view draws in close to Anne while the moon rises to its place in the sky;
        //    she lowers her arm and turns her eyes to the rock just in front of her
        phase = 'glide';
        const fromS = toScreen(moon.x, moon.y), fromPx = moon.R * cam.k;
        if (REDUCED) await fadeWorld(() => { camMode = 'cake'; moonFollow = true; moon.bright = .3; moon.warm = 1; });
        else camMode = 'cake';
        tween(REDUCED ? 1 : 1700, e => {
            C.feet.forEach(f => { f.pitch = TIPTOE * (1 - e); });
            a.w = 1 - e; C.lean = lerp(-.06, .05, e); C.look = lerp(-.9, .02, E.io(e)); C.lamp = .3 * (1 - e);
            C.arms[1].ang = lerp(.25, -.05, e);
            settleHip(SUMMIT.x, SUMMIT.y, 0);
        });
        if (!REDUCED) {
            await tween(3000, e => {
                const r = domMoon.getBoundingClientRect();
                const tS = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
                const w = toWorld(lerp(fromS.x, tS.x, e), lerp(fromS.y, tS.y, e));
                moon.x = w.x; moon.y = w.y; moon.R = lerp(fromPx, 50, e) / cam.k;
                moon.bright = 1 - e * .5; moon.warm = e;
            });
            moonFollow = true;
        }

        // 3. the cake appears beside her (its whole timeline starts now);
        //    the mountain dims into the night, Anne stays with her cake
        if (G3.startCelebration) G3.startCelebration();
        world.classList.add('quiet');
        tween(REDUCED ? 1500 : 3600, e => { gDim.setAttribute('opacity', (e * .62).toFixed(3)); }, E.lin);
        await wait(REDUCED ? 1200 : 2000);

        // 4. the page's own moon takes over at exactly the same place
        domMoon.classList.add('handover', 'visible');
        await tween(1600, e => { moon.op = 1 - e; });
        phase = 'cake';
        moonG.setAttribute('display', 'none');
    }

    function ripple(x, y) {
        if (REDUCED) return;
        const c = el('circle', { cx: x, cy: y, r: 1, fill: 'none', stroke: '#fffbe8', 'stroke-width': .8 }, gFx);
        const d = el('circle', { cx: x, cy: y, r: 2.5, fill: '#fffbe8' }, gFx);
        tween(1400, e => {
            c.setAttribute('r', f1(1 + e * 16)); c.setAttribute('stroke-opacity', (1 - e).toFixed(2));
            d.setAttribute('opacity', (1 - e).toFixed(2));
        }, E.out).then(() => { c.remove(); d.remove(); });
    }

    /* =================================================================
       10. MAIN LOOP
       ================================================================= */
    let last = performance.now(), ponyV = 0, lastHipX = 0;
    function frame(now) {
        const dt = Math.min(.05, (now - last) / 1000); last = now;
        W = innerWidth; H = innerHeight;
        const t = camTarget();
        if (REDUCED || !frame.started) { cam.cx = t.cx; cam.cy = t.cy; cam.k = t.k; frame.started = true; }
        else {
            const a = 1 - Math.exp(-dt / .75), b = 1 - Math.exp(-dt / 1.1);
            cam.cx = lerp(cam.cx, t.cx, a); cam.cy = lerp(cam.cy, t.cy, a);
            cam.k = Math.exp(lerp(Math.log(cam.k), Math.log(t.k), b));
        }
        if (moonFollow) {
            const r = domMoon.getBoundingClientRect(), w = toWorld(r.left + r.width / 2, r.top + r.height / 2);
            moon.x = w.x; moon.y = w.y; moon.R = 50 / cam.k;
        }
        world.setAttribute('viewBox', `${f1(cam.cx - W / 2 / cam.k)} ${f1(cam.cy - H / 2 / cam.k)} ${f1(W / cam.k)} ${f1(H / cam.k)}`);
        // ponytail swings with her movement
        const v = (C.hip.x - lastHipX) / Math.max(dt, .001); lastHipX = C.hip.x;
        ponyV += ((-v * .012 * Math.sign(C.dir || 1) - C.pony) * 28 - ponyV * 5) * dt;
        C.pony = clamp(C.pony + ponyV * dt, -.5, .6);
        renderMoon();
        renderClimber(dt);
        // keep the moon's button and hint on the moon
        if (phase === 'moon' || phase === 'summit') {
            const s = toScreen(moon.x, moon.y), r = moon.R * cam.k;
            moonBtn.style.transform = `translate(${f1(s.x - r)}px, ${f1(s.y - r)}px)`;
            moonBtn.style.width = moonBtn.style.height = f1(r * 2) + 'px';
            const hw = moonHint.offsetWidth || 120;
            const hx = clamp(s.x + r + 14, 12, W - hw - 12), hy = clamp(s.y - 10, 12, H - 40);
            const left = s.x + r + 14 + hw > W - 12;
            moonHint.style.transform = `translate(${f1(left ? clamp(s.x - hw / 2, 12, W - hw - 12) : hx)}px, ${f1(left ? Math.max(12, s.y - r - 34) : hy)}px)`;
        }
        requestAnimationFrame(frame);
    }

    // input: buttons, footholds, the moon and the keyboard
    keepBtn.addEventListener('click', climb);
    moonBtn.addEventListener('click', touchMoon);
    document.addEventListener('keydown', e => {
        if (e.repeat) return;
        const k = e.key;
        if (e.target && e.target.closest && e.target.closest('button')) return;   // the button handles it
        if (phase === 'ready' && (k === 'Enter' || k === ' ' || k === 'ArrowUp' || k === 'ArrowRight')) { e.preventDefault(); climb(); }
        else if (phase === 'moon' && (k === 'Enter' || k === ' ' || k === 'ArrowUp')) { e.preventDefault(); touchMoon(); }
    });
    replayBtn.addEventListener('click', () => {
        replayBtn.classList.remove('on');
        veil.classList.remove('off');
        setTimeout(() => location.reload(), 900);
    });

    /* =================================================================
       11. OPENING — beneath the stars
       ================================================================= */
    computeMoonFinal();
    stand(PATHS[0].at(0), 1);
    C.look = -.08;
    moon.x = MOON0.x; moon.y = MOON0.y; moon.R = MOON0.R;
    requestAnimationFrame(frame);
    if (IN_FRAME) { try { window.parent.postMessage({ type: 'WANT_FOCUS' }, '*'); } catch (e) {} }

    (async () => {
        await wait(60);
        veil.classList.add('off');                     // stars first
        await wait(REDUCED ? 400 : 1100);
        world.classList.add('on');                     // then the mountain, the moon and Anne
        await wait(REDUCED ? 900 : 2000);
        caption.textContent = CLIMB_TEXT.opening;
        caption.classList.add('on');
        await wait(REDUCED ? 1200 : 2200);
        phase = 'ready';
        setControls(true);
    })();

    // for checking the timeline: window.__climb
    window.__climb = { C, cam, moon, get phase() { return phase; }, get stage() { return stage; }, MOONF: () => MOONF, SUMMIT, PATHS, toScreen };
});
