window.NP = window.NP || {};

// Closing film (SPEC §3a): E1 the year-end board meeting and its giant cheque, E2 the verdict, E3 out of work,
// E4 the autumn letter, E5 the contract. E1 and E2 play on their own; E3 to E5 hold for the Next button, because the joke needs reading.
// Reduced motion = still panels that all hold. The engine owns the keys; this only exposes next/skip/pause/resume/held/done.
(function (NP) {
  'use strict';
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function f(n) { return Math.round(n * 10) / 10; }
  function V(n) { return 'var(--' + n + ')'; }
  function M(a, b, p) { return 'color-mix(in srgb,var(--' + a + ') ' + p + '%,var(--' + b + '))'; }
  function A(o) { var s = ''; for (var k in o) if (o[k] != null) s += ' ' + k + '="' + o[k] + '"'; return s; }
  function T(t, o, inner) { return '<' + t + A(o) + (inner == null ? '/>' : '>' + inner + '</' + t + '>'); }
  function X(o, b) { o = o || {}; for (var k in b) o[k] = b[k]; return o; }
  function R(x, y, w, h, r, fill, o) { return T('rect', X(o, { x: f(x), y: f(y), width: f(w), height: f(h), rx: r || null, fill: fill })); }
  function E(cx, cy, rx, ry, fill, o) { return T('ellipse', X(o, { cx: f(cx), cy: f(cy), rx: f(rx), ry: f(ry), fill: fill })); }
  function C(cx, cy, r, fill, o) { return T('circle', X(o, { cx: f(cx), cy: f(cy), r: f(r), fill: fill })); }
  function P(d, fill, o) { return T('path', X(o, { d: d, fill: fill })); }
  function L(d, col, w, o) { return T('path', X(o, { d: d, fill: 'none', stroke: col, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' })); }
  function G(o, inner) { return T('g', typeof o === 'string' ? { transform: o } : o, inner); }
  function Tx(x, y, size, str, o) { return T('text', X({ x: f(x), y: f(y), 'font-size': size, 'class': 'ep-tx', fill: V('ink') }, o), esc(str)); }
  function op(v) { return { opacity: v }; }
  function ao(cx, cy, rx, ry, o) { return E(cx, cy, rx, ry, 'url(#ep-ao)', op(o || 0.5)); }
  function lg(id, a, b, x2, y2) {
    return '<linearGradient id="ep-' + id + '" x1="0" y1="0" x2="' + (x2 == null ? 0.7 : x2) + '" y2="' + (y2 == null ? 1 : y2) + '"><stop offset="0" stop-color="' + a + '"/><stop offset="1" stop-color="' + b + '"/></linearGradient>';
  }
  function rg(id, c, a) { return '<radialGradient id="ep-' + id + '"><stop offset="0" stop-color="' + c + '" stop-opacity="' + a + '"/><stop offset=".55" stop-color="' + c + '" stop-opacity="' + a * 0.45 + '"/><stop offset="1" stop-color="' + c + '" stop-opacity="0"/></radialGradient>'; }
  function rr(x, y, w, h, r) { return 'M' + (x + r) + ' ' + y + 'H' + (x + w - r) + 'Q' + (x + w) + ' ' + y + ' ' + (x + w) + ' ' + (y + r) + 'V' + (y + h - r) + 'Q' + (x + w) + ' ' + (y + h) + ' ' + (x + w - r) + ' ' + (y + h) + 'H' + (x + r) + 'Q' + x + ' ' + (y + h) + ' ' + x + ' ' + (y + h - r) + 'V' + (y + r) + 'Q' + x + ' ' + y + ' ' + (x + r) + ' ' + y + 'Z'; }
  // rim light: a lamp-coloured copy nudged up-left peeks out on the lit edge (SPEC §9.3)
  function lit(d, fill, k, o) { k = k || 2; return P(d, V('lamp'), { transform: 'translate(' + -k + ' ' + f(-k * 0.8) + ')', opacity: 0.8 }) + P(d, fill, o); }
  // bumpy cloud (beard), clockwise bumps around an ellipse
  function cloud(cx, cy, rx, ry, n, a0, a1) {
    a0 = a0 == null ? 0 : a0; a1 = a1 == null ? 360 : a1;
    var pts = [], i, d;
    for (i = 0; i <= n; i++) { var a = (a0 + (a1 - a0) * i / n) * Math.PI / 180; pts.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]); }
    d = 'M' + f(pts[0][0]) + ' ' + f(pts[0][1]);
    for (i = 1; i <= n; i++) { var r = f(Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]) * 0.62); d += 'A' + r + ' ' + r + ' 0 0 1 ' + f(pts[i][0]) + ' ' + f(pts[i][1]); }
    return d + 'Z';
  }
  // shared light, shade and material textures (fx.js): beams and pools are additive, shade multiplies, nothing runs a live filter
  var FX = NP.fx;
  // a wall or floor from y0 down: its gradient, then a baked material over it (k scales the tile)
  function surf(y0, h, grad, tex, k, o, cls) {
    return R(-400, y0, 2000, h, 0, grad, cls ? { 'class': cls } : null) + FX.tex(tex, -400, y0, 2000, h, o, { scale: k }) + (tex === 'brick' ? FX.tex('mottle', -400, y0, 2000, h, 0.55) : '');
  }
  // a band right across the frame
  function B(y, h, fill, o) { return R(-400, y, 2000, h, 0, fill, o && op(o)); }
  function shadeP(x, y) { return 'M' + (x - 34) + ' ' + (y + 30) + 'Q' + x + ' ' + (y - 14) + ' ' + (x + 34) + ' ' + (y + 30) + 'Z'; }
  // a heavy curtain: folds are tone breaks, the hem scallops
  function drape(x, y, w, h) {
    return P('M' + x + ' ' + y + 'h' + w + 'v' + h + 'q' + f(-w / 6) + ' 9 ' + f(-w / 3) + ' 0t' + f(-w / 3) + ' 0t' + f(-w / 3) + ' 0Z', 'url(#ep-drape)') +
      R(x + w * 0.24, y, w * 0.12, h, 0, V('night-900'), op(0.24)) + R(x + w * 0.6, y, w * 0.14, h, 0, V('night-900'), op(0.24)) + R(x + w * 0.06, y, w * 0.08, h, 0, V('lamp'), op(0.1)) + R(x + w * 0.44, y, w * 0.07, h, 0, V('lamp'), op(0.08));
  }
  var seed = 11;
  function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }

  var DEFS = '<defs>' +
    rg('ao', V('night-900'), 1) + rg('glow', V('lamp'), 0.85) + rg('cool', V('snow-shade'), 0.5) +
    lg('wall', M('board-dark', 'board', 78), M('board-dark', 'night-900', 55), 0, 1) +
    lg('bwall', V('basement-light'), M('basement', 'night-900', 75), 0, 1) +
    lg('sky', V('night-900'), V('night-600'), 0, 1) +
    lg('suit', M('board', 'snow', 82), M('board-dark', 'board', 70)) +
    lg('head', M('board', 'snow', 74), M('board', 'board-dark', 60)) +
    lg('table', M('board-dark', 'lamp', 78), M('board-dark', 'night-900', 70), 0, 1) +
    lg('tablef', M('board-dark', 'night-900', 80), V('night-900'), 0, 1) +
    lg('paper', V('paper'), V('paper-shade')) +
    lg('cheque', M('paper', 'pole-green', 92), M('paper-shade', 'pole-green', 84)) +
    lg('gold', M('gold', 'lamp', 60), V('gold-dark')) +
    lg('green', M('pole-green', 'lamp', 80), V('pole-green-dark')) +
    lg('red', M('pole-red', 'lamp', 84), M('pole-red-dark', 'night-900', 82)) +
    lg('fur', V('snow'), V('snow-shade')) +
    lg('skin', M('paper', 'lamp-deep', 74), M('lamp-deep', 'paper', 66)) +
    lg('wood', M('wood', 'lamp', 72), V('wood'), 0, 1) +
    lg('woodd', M('wood-dark', 'wood', 85), M('wood-dark', 'night-900', 50)) +
    lg('floor', M('wood-dark', 'basement', 70), V('night-900'), 0, 1) +
    lg('metal', V('board'), M('board-dark', 'night-900', 70)) +
    lg('sack', M('wood', 'paper-shade', 55), M('wood-dark', 'wood', 70)) +
    lg('tag', M('bad', 'lamp', 70), M('bad', 'pole-red-dark', 75)) +
    lg('bp', M('good', 'night-600', 42), M('night-600', 'night-900', 62)) +
    lg('autumn', M('lamp', 'lamp-deep', 60), M('lamp-deep', 'pole-red-dark', 70), 0, 1) +
    lg('box', M('paper-shade', 'wood', 55), M('wood', 'wood-dark', 70)) +
    lg('drape', M('pole-red-dark', 'board-dark', 52), M('pole-red-dark', 'night-900', 36), 1, 0) +
    '</defs>';

  /* ---------- copy ---------- */
  var DEF = {
    date: '27 December · Year-end board meeting',
    chair: 'Chair: "{adoption}% adoption. A record year."',
    cheque: 'BONUSES: AI TRANSFORMATION', useCase: 'Use case: TBC (next year)',
    jobless: 'January. Out of work. You kept the box.',
    autumn: 'Board: "The AI performed at 100%. Unfortunately, the children changed."',
    rehire: 'Back as a contractor, on double the day rate. Chair: "We have always believed in people."',
    verdicts: ['A thank-you letter arrives for "the elf". The board credits the AI.',
      'A returns sack thuds onto the table. Board: "Lessons will be learned."',
      'The dashboard is green. The window is full of upset children. Chair: "Promotion likely."']
  };
  function copy(k) { var e = (NP.content && NP.content.epilogue) || {}; return e[k] != null && typeof e[k] !== 'object' ? String(e[k]) : DEF[k]; }
  function band(p) { p = +p || 0; return p >= 90 ? 0 : p >= 40 ? 1 : 2; }
  function verdict(p) { var v = NP.content && NP.content.verdicts; return (Array.isArray(v) && v[band(p)] && v[band(p)].e3) || { caption: '', line: DEF.verdicts[band(p)] }; }

  /* ---------- the boardroom ---------- */
  var NAMES = ['CFO', 'VP SYNERGY', 'CHAIR', 'HEAD OF AI', 'NON-EXEC'];
  // a faceless board member, seated: table top at y = 0 (SPEC §9.4: capsule, broad shoulders, no neck, one soft highlight)
  function member(name, pose) {
    var arm = pose === 'hold' ? '' :
      G({ 'class': 'ep-arm' }, lit('M38 -96C54 -96 62 -84 60 -66L56 -14C55 -6 41 -6 40 -14L36 -66Z', 'url(#ep-suit)', 1.5) + E(48, -12, 11, 9, V('snow-shade')));
    return G({ 'class': 'ep-bm' },
      G({ 'class': 'ep-bmb' },
        lit('M-56 0V-70C-56 -106-34 -120 0 -120S56 -106 56 -70V0Z', 'url(#ep-suit)', 2.2) +
        P('M56 -70C56 -100 42 -116 18 -119C36 -104 46 -90 46 -70V0H56Z', V('night-900'), op(0.22)) +
        P('M-17 -118L0 -76L17 -118Z', V('paper')) + P('M-24 -116L0 -68L-9 -112Z', V('board-dark')) + P('M24 -116L0 -68L9 -112Z', V('board-dark')) +
        P('M-5 -114H5L7 -88L0 -78L-7 -88Z', V('pole-red-dark')) +
        lit('M-38 -96C-54 -96-62 -84-60 -66L-56 -14C-55 -6-41 -6-40 -14L-36 -66Z', 'url(#ep-suit)', 1.5) + E(-48, -12, 11, 9, V('snow-shade')) +
        G({ 'class': 'ep-hd' }, lit('M0 -186C18 -186 30 -170 30 -150S18 -114 0 -114S-30 -130-30 -150S-18 -186 0 -186Z', 'url(#ep-head)', 1.8) +
          E(-11, -166, 9, 6, V('snow'), { opacity: 0.32, transform: 'rotate(-30 -11 -166)' }))) +
      arm +
      // tent name card on the table
      G('translate(0 18)', P('M-44 0L-40 -24H40L44 0Z', 'url(#ep-paper)') + R(-40, -24, 80, 2, 0, V('lamp'), op(0.6)) +
        Tx(0, -7.5, name.length > 6 ? 11 : 13, name, { 'text-anchor': 'middle', 'font-weight': 800, 'letter-spacing': '.06em' })));
  }
  function members(xs, y, s, poses) {
    return xs.map(function (x, i) { return G('translate(' + x + ' ' + y + ') scale(' + s + ')', member(NAMES[i], poses && poses[i])); }).join('');
  }
  function table(x0, x1, y, depth, W) {
    return ao((x0 + x1) / 2, y + depth + 6, (x1 - x0) * 0.55, 18, 0.6) +
      P('M' + x0 + ' ' + y + 'H' + x1 + 'L' + (x1 + 30) + ' ' + (y + depth) + 'H' + (x0 - 30) + 'Z', 'url(#ep-table)') +
      R(x0, y, x1 - x0, 2.5, 0, V('lamp'), op(0.45)) + FX.pool(W / 2 - (W > 600 ? 180 : 0), y + depth * 0.55, W > 600 ? 210 : 190, depth * 0.8, 0.5) + (W > 600 ? FX.pool(W / 2 + 180, y + depth * 0.55, 210, depth * 0.8, 0.5) : '') +
      R(x0 - 30, y + depth, x1 - x0 + 60, 400, 0, 'url(#ep-tablef)') + FX.tex('woodv', x0 - 30, y + depth, x1 - x0 + 60, 400, 0.3) + R(x0 - 30, y + depth, x1 - x0 + 60, 3, 0, V('lamp'), op(0.3)) +
      R(x0 - 30, y + depth + 3, x1 - x0 + 60, 16, 0, V('night-900'), op(0.25)) +
      // brass company plaque on the table front
      G('translate(' + W / 2 + ' ' + (y + depth + 74) + ')', R(-130, -26, 260, 52, 10, 'url(#ep-gold)') + R(-124, -20, 248, 40, 6, M('board-dark', 'gold-dark', 80)) +
        Tx(0, 7, 19, 'NORTH POLE LTD', { 'text-anchor': 'middle', fill: V('gold'), 'font-weight': 800, 'letter-spacing': '.16em' }) + R(-124, -20, 248, 2, 1, V('lamp'), op(0.35)));
  }
  function win(x, y, w, h, inner) {
    var s = R(x - 10, y - 10, w + 20, h + 20, 12, 'url(#ep-metal)') + R(x, y, w, h, 4, 'url(#ep-sky)');
    for (var i = 0; i < 9; i++) s += C(x + w * ((i * 0.37 + 0.1) % 1), y + h * ((i * 0.23 + 0.08) % 0.5), i % 3 ? 1.2 : 1.8, V('snow'), op(0.7));
    s += P('M' + x + ' ' + (y + h * 0.78) + 'Q' + (x + w * 0.3) + ' ' + (y + h * 0.62) + ' ' + (x + w * 0.6) + ' ' + (y + h * 0.74) + 'T' + (x + w) + ' ' + (y + h * 0.7) + 'V' + (y + h) + 'H' + x + 'Z', V('snow-shade'), op(0.85));
    s += (inner || '');
    s += P('M' + (x + w * 0.1) + ' ' + y + 'L' + (x + w * 0.35) + ' ' + y + 'L' + x + ' ' + (y + h * 0.6) + 'V' + (y + h * 0.25) + 'Z', V('snow'), op(0.06));
    s += R(x + w / 2 - 4, y, 8, h, 0, 'url(#ep-metal)') + R(x, y + h * 0.48, w, 8, 0, 'url(#ep-metal)');
    return s;
  }
  // a pendant lamp: its pool, its beam (drawn here, so call it behind the actors), then the brass shade and the bulb
  function pendant(x, y, gy, shade, o) {
    o = o || {};
    var top = shade ? y + 31 : y;
    return FX.pool(x, gy, 310, 200, 0.4) + FX.cone(x, top, shade ? 50 : 90, o.w || 520, (o.h || gy + 90) - top, o.op || 0.36, { skew: o.skew == null ? 30 : o.skew }) +
      (shade ? R(x - 1, -400, 2, y + 400, 0, V('night-900'), op(0.7)) + lit(shadeP(x, y), 'url(#ep-gold)', 1.5) +
        P('M' + (x + 10) + ' ' + (y + 10) + 'Q' + (x + 26) + ' ' + (y + 18) + ' ' + (x + 34) + ' ' + (y + 30) + 'H' + (x + 16) + 'Z', V('night-900'), op(0.22)) +
        E(x, y + 30, 26, 5, V('lamp')) + FX.bulb(x, y + 33, 8, 0.8) : '');
  }
  function room(W, H, wide, winInner, wr) {
    // plaster above the rail, upright panelling below it
    var ry = wide ? 324 : 294, s = surf(-400, H + 800, 'url(#ep-wall)', 'mottle', 1, 0.6) + FX.tex('woodv', -400, ry, W + 800, H, 0.32);
    for (var x = wide ? 40 : 20; x < W; x += wide ? 160 : 110) s += R(x, ry + 6, 2, 600, 0, V('night-900'), op(0.3)) + R(x + 2, ry + 6, 1.5, 600, 0, V('snow'), op(0.05));
    s += B(ry, 6, V('board'), 0.4) + B(ry, 1.5, V('snow-shade'), 0.3) + B(ry + 6, 14, 'url(#fx-rise)', 0.7);
    wr = wr || (wide ? [70, 54, 290, 220] : [24, 300, 128, 110]);
    var wcx = wr[0] + wr[2] / 2;
    // moonlight: a cool wash around the window and a shaft off it
    s += FX.pool(wcx, wr[1] + wr[3] / 2, wr[2] * 0.85, wr[3] * 0.9, 0.42, 'cool') + win(wr[0], wr[1], wr[2], wr[3], winInner);
    if (wide) {
      // curtains on a brass pole, and the founder's portrait (a board member, naturally)
      s += R(wr[0] - 58, wr[1] - 36, wr[2] + 116, 8, 4, 'url(#ep-gold)', op(0.8)) + drape(wr[0] - 50, wr[1] - 30, 56, wr[3] + 78) + drape(wr[0] + wr[2] - 6, wr[1] - 30, 56, wr[3] + 78) +
        G({ opacity: 0.82 }, ao(612, 226, 70, 12, 0.5) + R(552, 80, 116, 140, 5, 'url(#ep-gold)') + R(561, 89, 98, 122, 2, M('board-dark', 'night-900', 50)) +
          P('M574 211V190C574 170 590 162 610 162S646 170 646 190V211Z', M('board', 'board-dark', 45)) + P('M604 164H616L613 186L610 190L607 186Z', V('pole-red-dark')) +
          E(610, 138, 18, 21, M('board', 'snow', 72)) + E(604, 129, 6, 4, V('snow'), op(0.3)) + R(561, 89, 98, 3, 1, V('night-900'), op(0.4)));
    }
    s += FX.cone(wcx, wr[1] + wr[3] + 10, wr[2], wr[2] * 1.5, 280, 0.2, { skew: wr[2] * 0.5, cool: true }) + FX.shade(-80, -60, W + 160, H + 120, 0.75);
    s += wide ? pendant(430, 30, 430, 1) + pendant(790, 30, 430, 1) + FX.motes(330, 90, 560, 300, 10, 3) : pendant(225, -40, 420, 0, { w: 470 }) + FX.motes(90, 60, 270, 320, 7, 3);
    return s;
  }
  // green enamel dashboard: big value, a meter that overruns past 100% (SPEC §9.8 plates)
  function dash(w, h, label, value, pct, sub, ok) {
    var mw = w - 56, fill = mw * 0.75 * Math.min(140, Math.max(5, pct)) / 100, fs = Math.round(Math.min(h * 0.3, (w - (ok ? 120 : 64)) / (String(value).length * 0.6)));
    return ao(w / 2, h + 14, w * 0.5, 14, 0.55) +
      R(0, 0, w, h, 20, 'url(#ep-gold)') + R(7, 7, w - 14, h - 14, 14, V('pole-green-dark')) + R(8, 8, w - 16, h - 17, 13, 'url(#ep-green)') +
      P('M22 8H' + (w - 22) + 'Q' + (w - 8) + ' 8 ' + (w - 8) + ' 22V' + h * 0.3 + 'C' + w * 0.6 + ' ' + h * 0.18 + ' ' + w * 0.3 + ' ' + h * 0.2 + ' 8 ' + h * 0.34 + 'V22Q8 8 22 8Z', V('snow'), op(0.07)) +
      Tx(28, 46, 19, label, { fill: V('paper'), 'font-weight': 800, 'letter-spacing': '.12em' }) +
      R(28, 56, Math.min(170, w - 60), 3, 1.5, V('gold')) +
      Tx(28, h * 0.6, fs, value, { fill: V('paper'), 'font-weight': 800, 'class': 'ep-tx ep-num' }) +
      (ok ? G('translate(' + (w - 52) + ' ' + h * 0.42 + ')', C(0, 0, 22, V('pole-green-dark')) + C(0, 0, 18, M('pole-green', 'snow', 60)) + L('M-8 1L-2 7L9 -6', V('paper'), 4.5)) : '') +
      R(28, h - 60, mw, 14, 7, V('night-900'), op(0.45)) + R(28, h - 58, fill, 10, 5, 'url(#ep-gold)', { 'class': 'ep-meter' }) +
      R(28 + mw * 0.75 - 1.5, h - 64, 3, 22, 1.5, V('paper'), op(0.75)) +
      Tx(28, h - 20, 15, sub, { fill: V('snow'), 'font-weight': 700, 'letter-spacing': '.06em' });
  }
  function cheque(w, h, wide) {
    var big = copy('cheque'), uc = copy('useCase'), s = '';
    s += ao(w / 2, h + 10, w * 0.52, 18, 0.6) + R(0, 0, w, h, 12, 'url(#ep-cheque)') +
      R(12, 12, w - 24, h - 24, 7, 'none', { stroke: V('gold-dark'), 'stroke-width': 2, 'stroke-dasharray': '2 5', opacity: 0.6 }) +
      P('M12 ' + (h - 60) + 'Q' + w * 0.3 + ' ' + (h - 90) + ' ' + w * 0.6 + ' ' + (h - 70) + 'T' + (w - 12) + ' ' + (h - 84) + 'V' + (h - 12) + 'H12Z', V('pole-green'), op(0.06)) +
      R(0, 0, w, 5, 2.5, V('snow'), op(0.5));
    s += Tx(30, 44, wide ? 20 : 17, 'NORTH POLE LTD', { fill: V('pole-red-dark'), 'font-weight': 800, 'letter-spacing': '.14em' }) +
      Tx(w - 30, 44, wide ? 19 : 16, '27 DEC', { 'text-anchor': 'end', fill: V('ink-soft'), 'font-weight': 700, 'class': 'ep-tx ep-mono' });
    if (wide) {
      s += Tx(30, 96, 16, 'PAY', { fill: V('ink-soft'), 'font-weight': 800, 'letter-spacing': '.1em' }) +
        Tx(78, 100, 44, big, { 'font-weight': 900, 'letter-spacing': '-.01em', textLength: Math.min(w - 108, big.length * 27), lengthAdjust: 'spacingAndGlyphs' }) +
        R(78, 112, w - 108, 2.5, 1, V('ink-soft'), op(0.5)) +
        Tx(30, 160, 38, uc, { 'font-weight': 800, fill: V('pole-red-dark') });
    } else {
      var sp = big.indexOf(': '), a = sp > 0 ? big.slice(0, sp + 1) : big, b = sp > 0 ? big.slice(sp + 2) : '';
      var up = uc.indexOf(' ('), c = up > 0 ? uc.slice(0, up) : uc, d = up > 0 ? uc.slice(up + 1) : '';
      s += Tx(30, 84, 15, 'PAY', { fill: V('ink-soft'), 'font-weight': 800, 'letter-spacing': '.1em' }) +
        Tx(30, 124, 38, a, { 'font-weight': 900 }) + Tx(30, 164, 36, b, { 'font-weight': 900, textLength: Math.min(w - 60, b.length * 21.5), lengthAdjust: 'spacingAndGlyphs' }) +
        R(30, 178, w - 60, 2.5, 1, V('ink-soft'), op(0.5)) +
        Tx(30, 222, 33, c, { 'font-weight': 800, fill: V('pole-red-dark') }) + Tx(30, 260, 33, d, { 'font-weight': 800, fill: V('pole-red-dark') });
    }
    s += L('M' + (w - (wide ? 210 : 140)) + ' ' + (h - 36) + 'c14-22 22-20 18-4s10-18 18-10-4 14 8 8 14-12 22-6 6 8 30 2', V('night-600'), 2.6) +
      Tx(w - 30, h - 20, 13, 'pp. The Board', { 'text-anchor': 'end', fill: V('ink-soft'), 'font-style': 'italic', 'font-weight': 600 });
    return s;
  }

  /* ---------- the basement ---------- */
  var TOYS = ['teddy', 'castle', 'kite', 'dino', 'socks', 'boots', 'chess', 'jigsaw', 'telescope', 'crate', 'bat', 'bird', 'pyjamas', 'giftbox', 'grizzly', 'brickcastle'];
  var HUES = [null, 'blue', null, 'green', 'purple', null, 'pink', null, 'yellow'];
  function toy(i, x, y, s, tilt) {
    var g = NP.giftSVG ? NP.giftSVG({ icon: TOYS[i % TOYS.length], hue: HUES[i % HUES.length] || undefined, broken: true, tilt: tilt }) : '';
    g = g ? g.replace('width="100%" height="100%"', 'x="-32" y="-56" width="64" height="64"') :
      R(-22, -40, 44, 40, 6, M('pole-red', 'paper-shade', 70)) + R(-4, -40, 8, 40, 0, V('gold'));
    return G('translate(' + f(x) + ' ' + f(y) + ') scale(' + s + ')', g);
  }
  // the rejects pile: real size, stacked bottom-up in rows of 8, 7, 6 … and never narrower than 3, so a big pile is a heap and not a spire. Squashes to fit maxH
  function pile(n, S, base0, maxH) {
    n = Math.max(0, Math.min(36, Math.round(+n || 0)));
    seed = 11;
    var out = '', i = 0, r = 0, xs = S * 0.74, base = Math.min(base0 || 8, Math.max(2, n)), rows = [], items = [];
    while (i < n) { var take = Math.min(Math.max(3, base - rows.length), n - i); rows.push(take); i += take; }
    var ys = Math.min(S * 0.5, (maxH - S) / Math.max(1, rows.length - 1));
    i = 0;
    for (r = 0; r < rows.length; r++) {
      for (var j = 0; j < rows[r]; j++, i++) items.push([(j - (rows[r] - 1) / 2) * xs + (rnd() - 0.5) * S * 0.2, -r * ys + (rnd() - 0.5) * 6, (rnd() - 0.5) * 34, i]);
    }
    out += ao(0, 6, (Math.min(n, base) * xs) / 2 + S * 0.6, 16 + r * 3, 0.65);
    return out + G({ 'class': 'ep-pile' }, items.map(function (t) { return toy(t[3], t[0], t[1], S / 64, f(t[2])); }).join(''));
  }
  function ticket(x, y, r, red, w) {
    w = w || 38;
    return G('translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(r) + ')', R(-w / 2, -w * 0.32, w, w * 0.64, 2.5, 'url(#ep-paper)') +
      R(-w / 2, -w * 0.32, w, w * 0.16, 2, red ? V('pole-red') : V('board')) + R(-w / 2 + 4, -w * 0.06, w * 0.6, 2.2, 1, V('ink-soft'), op(0.55)) + R(-w / 2 + 4, w * 0.06, w * 0.75, 2.2, 1, V('ink-soft'), op(0.45)));
  }
  // Father Christmas asleep face-down on his bug tickets (matches scene.js: cloud beard, reading glasses, plain red coat)
  // local: desk surface back edge y = -30, front edge y = 10. front = how far the desk's front runs down
  function fcAsleep(front) {
    var s = '', i;
    s += lit(rr(-86, -200, 172, 174, 36), 'url(#ep-metal)', 1.5) + R(-70, -188, 140, 5, 2.5, V('snow'), op(0.08));
    // hunched shoulders, plain red coat
    s += G({ 'class': 'ep-br' }, lit('M-114 -26C-118 -98-78 -152 0 -154C78 -152 118 -98 114 -26Z', 'url(#ep-red)', 2.4) +
      P('M114 -26C118 -98 80 -148 24 -153C72 -130 94 -88 92 -26Z', V('night-900'), op(0.24)) +
      P('M-98 -76C-88 -116-56 -142-16 -148C-56 -130-80 -104-88 -72Z', V('lamp'), op(0.25)));
    // desk surface and the bug tickets he fell asleep on
    s += P('M-210 -30H210L232 10H-232Z', 'url(#ep-wood)') + R(-210, -30, 420, 2, 0, V('lamp'), op(0.5));
    seed = 5;
    for (i = 0; i < 13; i++) s += ticket(-176 + i * 28 + (rnd() - 0.5) * 18, -12 + (rnd() - 0.5) * 22, (rnd() - 0.5) * 50, i % 4 === 1);
    // desk front, with tickets hanging over the edge
    s += ao(0, 10 + front, 250, 14, 0.6) + R(-232, 10, 464, front, 0, 'url(#ep-woodd)') + R(-232, 10, 464, 3, 0, V('lamp'), op(0.4)) + R(-232, 13, 464, 14, 0, V('night-900'), op(0.2)) +
      ticket(150, 24, 8, true, 40) + ticket(-110, 28, -14, false, 40);
    // folded arms, head down on them; the hat's point has flopped onto the desk
    s += G({ 'class': 'ep-br' },
      lit('M-146 -2C-150 -36-118 -58-66 -54L-14 -50L-18 -2Z', 'url(#ep-red)', 1.8) + P('M146 -2C150 -36 118 -58 66 -54L14 -50L18 -2Z', 'url(#ep-red)') +
      P('M146 -2C148 -24 136 -42 108 -50C122 -34 128 -18 126 -2Z', V('night-900'), op(0.22)) +
      E(-140, -4, 13, 10, 'url(#ep-skin)') + E(140, -4, 13, 10, 'url(#ep-skin)') +
      lit(cloud(-56, -66, 22, 20, 7), 'url(#ep-fur)', 1.4) + lit(cloud(56, -66, 22, 20, 7), 'url(#ep-fur)', 1.4) +
      E(0, -74, 76, 18, V('night-900'), op(0.28)) +
      lit('M-48 -76C-52 -122-14 -146 18 -142C50 -138 72 -114 82 -84C90 -60 98 -40 106 -22L90 -26C82 -48 70 -68 52 -80Z', 'url(#ep-red)', 2) +
      P('M18 -142C50 -138 72 -114 82 -84C90 -60 98 -40 106 -22L96 -24C86 -64 64 -112 18 -142Z', V('night-900'), op(0.25)) +
      // the beard: one big cloud, spilling from under the brim over his arms and the tickets
      lit(cloud(0, -4, 84, 44, 12, -12, 192).replace(/Z$/, '') + 'C-72 -48-40 -64 0 -64C40 -64 72 -48 82 -21Z', 'url(#ep-fur)', 2) +
      E(12, 24, 62, 14, V('snow-shade'), op(0.4)) + L('M-46 4Q-34 14-20 8M8 18Q22 26 36 16M40 -10Q52 0 62 -8', V('snow-shade'), 2.4, op(0.8)) + P('M-56 -6C-40 8-12 14 10 12C-16 20-44 16-62 2Z', V('snow-shade'), op(0.55)) +
      lit(rr(-58, -90, 116, 28, 14), 'url(#ep-fur)', 1.6) + R(-50, -70, 100, 5, 2.5, V('snow-shade'), op(0.7)) +
      lit(cloud(108, -18, 15, 14, 7), 'url(#ep-fur)', 1.4));
    // his reading glasses, knocked askew on the desk
    s += G('translate(-150 4) rotate(-24) scale(1.35)', E(-13, 0, 12, 9, V('snow'), { opacity: 0.3, stroke: V('gold-dark'), 'stroke-width': 2.4 }) +
      E(13, 0, 12, 9, V('snow'), { opacity: 0.3, stroke: V('gold-dark'), 'stroke-width': 2.4 }) +
      L('M-2 -2Q0 -5 2 -2M25 -3L44 -16', V('gold-dark'), 2.4) + L('M-19 -3Q-16 -6-12 -5M7 -3Q10 -6 14 -5', V('snow'), 1.6, op(0.8)));
    for (i = 0; i < 3; i++) s += Tx(120 + i * 22, -150 - i * 34, 24 + i * 9, 'z', { 'class': 'ep-tx ep-z', fill: V('snow-shade'), 'font-weight': 800, style: '--d:' + i * 0.6 + 's' });
    return s;
  }
  function basement(W, H, wide, n) {
    var fy = wide ? 520 : 470, py = wide ? 548 : 506, px = wide ? 290 : 128, fx = wide ? 850 : 225, dy = wide ? 476 : 590, ds = wide ? 1.22 : 0.72;
    var wx = wide ? 120 : 280, wy = wide ? 80 : 70, ww = wide ? 150 : 100, wh = wide ? 90 : 70, lx = fx + 184 * ds, ly = dy - 126 * ds, i;
    // the desk bay from the shift: brick, damp, service pipes under the ceiling, all of it gone cold and blue
    var s = surf(-400, fy + 400, 'url(#ep-bwall)', 'brick', wide ? 0.8 : 0.62, 0.5) + B(-400, fy + 400, V('night-600'), 0.16) + B(0, 96, 'url(#fx-rise)', 0.85);
    s += R(-400, 22, W + 800, 16, 8, 'url(#ep-metal)') + FX.tex('brush', -400, 22, W + 800, 16, 0.6) + B(24, 3, V('snow-shade'), 0.25) + R(-400, 46, W + 800, 8, 4, M('board', 'night-900', 42));
    for (i = 70; i < W; i += 230) s += R(i, 19, 10, 38, 2, M('board-dark', 'night-900', 60));
    // a riser with its valve, and the shift lamp, switched off
    var rx = wide ? 694 : 408, ux = wide ? 586 : 196, uy = wide ? 92 : 236, pc = M('board', 'night-900', 40);
    s += R(rx, 54, 15, fy - 54, 0, pc) + R(rx + 2, 54, 3.5, fy - 54, 0, V('snow'), op(0.14)) + R(rx + 10.5, 54, 4.5, fy - 54, 0, V('night-900'), op(0.3)) +
      L('M' + (rx - 9) + ' ' + f(fy * 0.56) + 'h33M' + (rx + 7.5) + ' ' + f(fy * 0.56 - 16) + 'v32', M('board-dark', 'night-900', 70), 3.2) + C(rx + 7.5, fy * 0.56, 16, 'none', { stroke: pc, 'stroke-width': 5 }) +
      R(ux - 1, 54, 2, uy - 46, 0, V('night-900'), op(0.7)) + P(shadeP(ux, uy), M('pole-green-dark', 'night-900', 46)) + E(ux, uy + 30, 26, 5, M('board-dark', 'night-900', 55));
    // the moon through the high window: a cold shaft down onto the rejects
    s += FX.pool(wx + ww / 2, wy + wh / 2, ww * 1.05, wh * 1.2, 0.55, 'cool') +
      win(wx, wy, ww, wh, C(wx + ww * 0.74, wy + wh * 0.3, 9, V('snow'), op(0.9)) + C(wx + ww * 0.74 + 4.5, wy + wh * 0.3 - 2.5, 8.4, M('night-600', 'night-900', 42))) +
      FX.cone(wx + ww / 2, wy + wh + 10, ww, wide ? 480 : 330, fy + 50 - wy - wh, 0.5, { skew: px - wx - ww / 2 + (wide ? 60 : 20), cool: true }) + FX.shade(-60, -40, W + 120, H + 80, 0.8);
    s += surf(fy, 600, 'url(#ep-floor)', 'mottle', 1.3, 0.9, 'ep-flr') + B(fy, 2, V('snow-shade'), 0.22) + B(fy + 2, 14, 'url(#fx-rise)', 0.6) +
      FX.pool(px + (wide ? 30 : 0), fy + 40, wide ? 310 : 190, 44, 0.42, 'cool') + FX.cast(px + (wide ? 150 : 90), py - 70, wide ? 170 : 110, wide ? 90 : 64, 0.5);
    s += G({ 'class': 'ep-sign', transform: 'translate(' + (px - 70) + ' ' + (wide ? 170 : 112) + ') rotate(-3)' }, R(0, 0, 140, 40, 3, 'url(#ep-paper)') + R(62, -6, 16, 10, 1, V('paper-shade'), op(0.9)) +
      Tx(70, 28, 22, 'REJECTS', { 'text-anchor': 'middle', fill: V('ink-soft'), 'font-weight': 800, 'letter-spacing': '.08em' }));
    s += G('translate(' + px + ' ' + py + ')', n ? pile(n, wide ? 72 : 52, 7, py - (wide ? 222 : 164)) : ao(0, 4, 90, 10, 0.3) + Tx(0, -10, 18, '(empty)', { 'text-anchor': 'middle', fill: V('snow-shade'), 'font-weight': 700 }));
    // the desk lamp, the only warm light down here: on the wall behind him, then down across his back and the tickets
    s += FX.pool(lx - 70 * ds, ly + 50 * ds, 330 * ds, 240 * ds, wide ? 0.55 : 0.4) + FX.cast(fx - 120 * ds, dy + 96 * ds, 300 * ds, 22 * ds, 0.55);
    s += G({ 'class': 'ep-desk', transform: 'translate(' + fx + ' ' + dy + ') scale(' + ds + ')' }, fcAsleep(wide ? 100 : 92) +
      G('translate(184 -30)', ao(0, 0, 40, 6) + R(-4, -96, 8, 96, 4, 'url(#ep-metal)') + lit('M-40 -96Q-34 -134 0 -136Q34 -134 40 -96Z', 'url(#ep-green)', 1.5) + E(0, -96, 34, 6, V('lamp')) +
        C(0, -92, 40, 'url(#ep-glow)') + E(0, 0, 34, 6, 'url(#ep-metal)')) +
      G('translate(-186 -22)', ao(0, 0, 20, 4) + R(-13, -30, 26, 30, 5, V('pole-green')) + R(-13, -30, 9, 30, 4, V('snow'), op(0.12)) + E(0, -30, 13, 3.5, M('pole-green', 'snow', 70)) + E(0, -29.6, 10.5, 2.4, V('wood-dark')) +
        L('M13 -24C24 -24 24 -8 13 -9', M('pole-green', 'night-900', 70), 4.5)));
    return s + FX.cone(lx - 6 * ds, ly + 2 * ds, 56 * ds, 300 * ds, 124 * ds, 0.34, { skew: -150 * ds }) + FX.pool(lx - 100 * ds, dy - 12 * ds, 200 * ds, 30 * ds, 0.5) + FX.bulb(lx, ly + 2 * ds, 7 * ds, 0.7);
  }
  /* ---------- E3 props ---------- */
  function letter(w, h) {
    var s = ao(w / 2, h + 8, w * 0.5, 10, 0.5) + R(0, 0, w, h, 4, 'url(#ep-paper)') + R(0, 0, w, 4, 2, V('snow'), op(0.6));
    for (var y = 46; y < h - 10; y += 30) s += R(16, y, w - 32, 1.5, 0, V('good'), op(0.25));
    s += Tx(18, 40, Math.round(w * 0.105), 'Dear the elf,', { 'class': 'ep-tx ep-hand', fill: V('pole-red-dark'), 'font-weight': 700 }) +
      Tx(18, 40 + w * 0.17, Math.round(w * 0.14), 'THANK YOU!!', { 'class': 'ep-tx ep-hand', fill: V('pole-green-dark'), 'font-weight': 900 }) +
      Tx(18, 40 + w * 0.28, Math.round(w * 0.08), 'You got it right.', { 'class': 'ep-tx ep-hand', fill: V('ink-soft'), 'font-weight': 700 });
    // crayon doodle: a heart and a little elf
    s += P('M' + (w - 46) + ' ' + (h - 34) + 'c-8-12-26-4-16 8l16 16 16-16c10-12-8-20-16-8Z', V('pole-red'), op(0.85)) +
      G('translate(' + (w - 96) + ' ' + (h - 16) + ')', P('M-10 0C-10-18-5-24 0-24S10-18 10 0Z', V('pole-green')) + C(0, -30, 9, M('paper-shade', 'lamp-deep', 70)) + P('M-10-32C-8-44 6-46 14-52C10-44 10-38 10-32Z', V('pole-green')));
    return s;
  }
  function sack(wide) {
    var s = ao(0, 0, 120, 14, 0.7) +
      lit('M-96 -4C-112 -50-92 -112-40 -132L-26 -150C-10 -158 10 -158 26 -150L40 -132C92 -112 112 -50 96 -4C40 8-40 8-96 -4Z', 'url(#ep-sack)', 2.4) +
      P('M96 -4C112 -50 92 -112 40 -132C70 -100 80 -50 66 0C80 -1 90 -2 96 -4Z', V('night-900'), op(0.25)) +
      L('M-34 -136Q0 -126 34 -136', V('wood-dark'), 6) + L('M-60 -70Q-40 -60-20 -76M30 -40Q50 -30 70 -46', V('wood-dark'), 2, op(0.5));
    // returns tag (orange, with the sack shape and a cross: never colour alone)
    s += G('translate(36 -128) rotate(14)', L('M0 0C10 10 14 18 16 26', V('paper-shade'), 2) + R(-6, 24, 116, 46, 6, 'url(#ep-tag)') + C(4, 34, 4, V('wood-dark')) +
      Tx(46, 54, 19, 'RETURNS', { 'text-anchor': 'middle', 'font-weight': 900, 'letter-spacing': '.04em' }) + L('M90 40l9 9M99 40l-9 9', V('ink'), 2.8));
    s += toy(0, -128, 6, 1.05, -24) + toy(6, 132, 8, 0.95, 18) + toy(9, -70, 26, 0.8, 70);
    return G({ 'class': 'ep-sack' }, s) + G({ 'class': 'ep-dust' }, E(-130, -4, 40, 12, V('snow-shade'), op(0.35)) + E(140, -2, 46, 12, V('snow-shade'), op(0.35)));
  }
  function kid(x, y, s, hue, tear) {
    return G('translate(' + x + ' ' + y + ') scale(' + s + ')', C(0, 0, 30, 'url(#ep-skin)') + C(-30, 30, 9, M('paper-shade', 'lamp-deep', 75)) + C(30, 32, 9, M('paper-shade', 'lamp-deep', 75)) +
      P('M-31 -6C-31 -34-14 -42 0 -42S31 -34 31 -6Z', V('hue-' + hue)) + P('M-31 -6C-31 -30-16 -40-4 -42C-18 -34-24 -22-24 -6Z', V('snow'), op(0.2)) + R(-33, -10, 66, 10, 5, M('hue-' + hue, 'snow', 70)) + C(0, -44, 7, V('snow')) +
      R(-17, 3, 12, 3.4, 1.7, V('ink'), { transform: 'rotate(-18 -11 4)' }) + R(5, 3, 12, 3.4, 1.7, V('ink'), { transform: 'rotate(18 11 4)' }) +
      C(-10, 12, 3, V('ink')) + C(10, 12, 3, V('ink')) + L('M-9 25Q0 18 9 25', V('ink'), 2.8) + (tear ? P('M14 17c2 4 3 6 3 7.5a3 3 0 0 1-6 0c0-1.5 1-3.5 3-7.5Z', V('good'), op(0.8)) : ''));
  }
  /* ---------- the elf: the same figure as the intro film (intro.js elf). Feet at y = 0 ---------- */
  function el(cx, cy, rx, ry) { return 'M' + f(cx - rx) + ' ' + f(cy) + 'a' + rx + ' ' + ry + ' 0 1 0 ' + 2 * rx + ' 0a' + rx + ' ' + ry + ' 0 1 0 ' + -2 * rx + ' 0Z'; }
  function elf(x, y, s, o) {
    o = o || {};
    var hood = 'M-44-100C-54-150-28-196 8-214C30-226 54-226 66-212C44-210 30-198 34-170C44-148 48-124 44-100Z';
    var eyes = o.sad ? L('M-17 -112q6 5 12 0M5 -112q6 5 12 0', V('ink'), 3.2) + L('M-19 -122l12 -4M19 -122l-12 -4', V('ink'), 2.4, op(0.7)) :
      C(-11 + (o.look || 0), -114, 4.8, V('ink')) + C(11 + (o.look || 0), -114, 4.8, V('ink')) + C(-12.4 + (o.look || 0), -115.6, 1.3, V('snow')) + C(9.6 + (o.look || 0), -115.6, 1.3, V('snow'));
    var e = ao(0, 4, 54, 6, 0.5) +
      lit('M-42 0C-46-42-36-82 0-86C36-82 46-42 42 0Z', 'url(#ep-green)', 2.4) +
      P('M10-84C34-78 44-44 42 0H22C26-34 22-66 10-84Z', V('night-900'), op(0.2)) +
      P('M-30-82L0-60L30-82C20-88-20-88-30-82Z', 'url(#ep-fur)') +
      (o.badge ? R(-31, -58, 62, 17, 3, 'url(#ep-gold)') + R(-29, -57.4, 58, 1.8, 0.9, V('lamp'), op(0.7)) + Tx(0, -45, 10.4, 'CONTRACTOR', { 'text-anchor': 'middle', 'font-weight': 900, textLength: 54, lengthAdjust: 'spacingAndGlyphs' }) : '') +
      lit(hood, 'url(#ep-green)', 2.4) + P('M30-170C34-196 50-212 66-212C54-206 44-196 42-178Z', V('pole-green-dark'), op(0.6)) +
      lit(el(0, -116, 39, 41), M('pole-green', 'pole-green-dark', 45), 1.6) +
      lit(el(0, -112, 31, 32), 'url(#ep-skin)', 1.4) +
      E(4, -92, 20, 7, M('lamp-deep', 'paper', 30), op(0.25)) + eyes +
      C(0, -103, 4.2, M('lamp-deep', 'pole-red', 66)) +
      lit(el(66, -212, 10, 10), 'url(#ep-fur)', 1.4);
    return G('translate(' + x + ' ' + y + ') scale(' + s + ')', G({ 'class': 'ep-br' }, e));
  }
  function mitten(x, y, s) {
    return G('translate(' + x + ' ' + y + ') scale(' + s + ')', ao(0, 12, 30, 5, 0.4) + R(8, -4, 26, 20, 8, V('snow-shade')) + lit(el(-4, 0, 26, 18), 'url(#ep-red)', 1.6) + E(-8, -6, 10, 5, V('snow'), op(0.16)));
  }
  // the cardboard box from the sacking, with what was on the desk
  function box(x, y, s) {
    return G('translate(' + x + ' ' + y + ') scale(' + s + ')', ao(0, 2, 62, 7, 0.55) +
      E(-16, -66, 5, 9, V('pole-green'), { transform: 'rotate(-20 -16 -66)' }) + E(-6, -68, 5, 9, V('pole-green-dark'), { transform: 'rotate(10 -6 -68)' }) + R(14, -72, 16, 16, 3, V('hue-red')) +
      P('M-50 -58L-64 -72L-30 -70L-24 -58Z', 'url(#ep-paper)') + P('M50 -58L64 -72L30 -70L24 -58Z', M('wood', 'paper-shade', 70)) +
      lit(rr(-50, -58, 100, 58, 4), 'url(#ep-box)', 1.6) + R(-50, -58, 100, 6, 2, V('wood-dark'), op(0.5)) + R(-50, -36, 100, 8, 0, V('paper'), op(0.28)));
  }
  // a drawing board, facing us, floor at y = 0, with a new toy on it
  function drawingBoard(x, y, s) {
    return ao(x, y + 3, 250 * s, 11, 0.6) + G('translate(' + x + ' ' + y + ') scale(' + s + ')',
      R(-150, -176, 16, 176, 5, 'url(#ep-woodd)') + R(134, -176, 16, 176, 5, 'url(#ep-woodd)') + R(-160, -96, 320, 12, 5, 'url(#ep-woodd)') +
      lit('M-226 -160L226 -160L190 -430L-190 -430Z', 'url(#ep-wood)', 2.4) + P('M-204 -176L204 -176L172 -414L-172 -414Z', 'url(#ep-bp)') +
      // the Wobblepod: an egg on a spring, with feelers
      L('M-58 -296a58 44 0 1 0 116 0a58 44 0 1 0-116 0M-26 -304a7 7 0 1 0 14 0a7 7 0 1 0-14 0M12 -304a7 7 0 1 0 14 0a7 7 0 1 0-14 0M-14 -276q14 10 28 0' +
        'M-22 -338q-14 -22 -32 -24M22 -338q14 -22 32 -24M-24 -252q24 8 48 0M-24 -242q24 8 48 0M-24 -232q24 8 48 0', V('snow'), 3) +
      L('M-132 -224H132M-132 -230V-218M132 -230V-218', V('lamp'), 2) +
      Tx(0, -378, 15, 'NEW TOY · REV 1', { 'text-anchor': 'middle', fill: V('snow-shade'), 'font-weight': 800, 'letter-spacing': '.1em' }) +
      lit(rr(-190, -212, 380, 16, 4), 'url(#ep-metal)', 1.2));
  }
  function bot(x, y, w, carry) {
    var a = NP.art && NP.art.droidSVG ? NP.art.droidSVG(carry) : '';
    return a.replace('<svg ', '<svg x="' + x + '" y="' + f(y - w * 118 / 136) + '" width="' + w + '" height="' + f(w * 122 / 136) + '" ');
  }
  // E4's letter: why they want you back
  function notice(w, h) {
    var k = w / 520, x = 34 * k, line = function (i, t, o) { return Tx(x, (116 + i * 46) * k, 23.5 * k, t, X({ 'font-weight': 600 }, o)); };
    return ao(w / 2, h + 10, w * 0.52, 12, 0.55) + R(0, 0, w, h, 4, 'url(#ep-paper)') + R(0, 0, w, 4, 2, V('snow'), op(0.6)) +
      G('translate(' + (x + 16 * k) + ' ' + 34 * k + ')', C(0, 0, 17 * k, V('pole-red')) + C(-5 * k, -6 * k, 5 * k, V('lamp'), op(0.45)) + Tx(0, 5.4 * k, 14 * k, 'NP', { 'text-anchor': 'middle', fill: V('paper'), 'font-weight': 900 })) +
      Tx(x + 46 * k, 40 * k, 16 * k, 'NORTH POLE LTD · THE BOARD', { 'font-weight': 800, 'letter-spacing': '.1em', fill: V('pole-red-dark') }) +
      R(x, 60 * k, w - 2 * x, 2, 1, V('pole-red'), op(0.5)) +
      line(0, 'Dear Elf,', { 'font-weight': 800 }) + line(1, 'A child asked for a Wobblepod. The AI', {}) + line(2, 'only makes what it learned, so it', {}) +
      line(3, 'offered a teddy bear with wheels.', {}) + line(4, 'The robots built it perfectly.', { fill: V('pole-red-dark'), 'font-weight': 800 }) +
      line(5, 'Please come back and teach it new toys.', {});
  }
  // the wrong answer, beautifully made
  function wheelyBear(x, y, s) {
    var g = NP.giftSVG ? NP.giftSVG({ icon: 'teddy', hue: 'brown' }) : '';
    g = g.replace('width="100%" height="100%"', 'x="-32" y="-60" width="64" height="64"');
    var w = function (wx) { return C(wx, 3, 8.5, 'url(#ep-metal)') + C(wx, 3, 3, V('night-900')) + C(wx - 2.4, 0.6, 1.8, V('snow'), op(0.5)); };
    return G('translate(' + x + ' ' + y + ') scale(' + s + ')', ao(0, 16, 46, 5, 0.6) + g + R(-34, -6, 68, 8, 4, 'url(#ep-red)') + R(-34, -6, 68, 2, 1, V('lamp'), op(0.5)) + w(-23) + w(23));
  }
  // the deal: same gold frame and seal as every award the board gives itself
  function contract(w, lines) {
    var k = w / 400, h = (118 + lines.length * 27 + 62) * k, row = function (t, i) { return Tx(26 * k, (120 + i * 27) * k, 18.5 * k, t, { 'font-weight': 600 }); };
    return ao(w / 2, h + 12, w * 0.5, 12, 0.5) + R(0, 0, w, h, 6, 'url(#ep-gold)') + R(9, 9, w - 18, h - 18, 3, 'url(#ep-paper)') +
      Tx(w / 2, 46 * k, 14.5 * k, 'HUMAN-IN-THE-LOOP PROGRAMME', { 'text-anchor': 'middle', 'font-weight': 800, 'letter-spacing': '.08em', fill: V('ink-soft') }) +
      Tx(w / 2, 82 * k, 30 * k, 'CONTRACT OFFER', { 'text-anchor': 'middle', 'font-weight': 900 }) +
      R(w / 2 - 90 * k, 94 * k, 180 * k, 2, 1, V('gold-dark'), op(0.6)) + lines.map(row).join('') +
      Tx(26 * k, h - 26 * k, 17 * k, 'Sign here:', { 'font-weight': 600, 'font-style': 'italic', fill: V('ink-soft') }) + R(112 * k, h - 24 * k, w - 200 * k, 1.6, 0.8, V('ink')) +
      G('translate(' + (w - 46 * k) + ' ' + (h - 44 * k) + ') scale(' + 0.68 * k + ')', P('M-12 10L-18 34L-6 28L0 38L4 12Z', V('pole-red')) + P('M8 10L18 34L6 30L2 38L-2 12Z', V('pole-red-dark')) + C(0, 0, 24, 'url(#ep-gold)') + C(-6, -7, 7, V('lamp'), op(0.6)));
  }
  var TERMS = ['Role: designing new toys and training', 'the AI on them. Also checking the gifts,', "since you're there.", 'All designs remain the property of the AI.', 'Mittens not provided.'];
  /* ---------- scenes ---------- */
  function svg(W, H, inner) {
    return '<svg class="ep-svg ' + (W > H ? 'ep-wd' : 'ep-nr') + '" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g class="ep-cam" style="transform-origin:' + W / 2 + 'px ' + H * 0.55 + 'px">' + inner + '</g></svg>';
  }
  function sceneSVG(k, o, wide) {
    var W = wide ? 1200 : 450, H = wide ? 675 : 800, s = '', ad = Math.round(+o.adoption || 100);
    var xs = wide ? [360, 480, 600, 720, 840] : [65, 145, 225, 305, 385], ty = wide ? 450 : k === 'e1' ? 430 : k === 'bad' ? 610 : 570, ms = wide ? 1 : 0.74;
    var dW = wide ? 310 : 300, dH = wide ? 200 : 186, dpos = wide ? 'translate(830 60)' : 'translate(75 74)';
    if (k === 'jobless') return svg(W, H, basement(W, H, wide, o.pileCount) + (wide ? FX.cast(470, 626, 120, 15, 0.6) + FX.cast(600, 616, 96, 12, 0.5) : FX.cast(70, 736, 84, 12, 0.6) + FX.cast(308, 732, 80, 10, 0.5)) + G({ 'class': 'ep-keep' }, wide ? box(650, 612, 1.1) + elf(536, 620, 1.2, { sad: 1 }) : box(344, 728, 0.9) + elf(116, 730, 0.92, { sad: 1 })));
    if (k === 'autumn') {
      var fyA = wide ? 560 : 610, wa = wide ? [720, 70, 330, 300] : [70, 432, 310, 124], acx = wa[0] + wa[2] / 2, aby = wa[1] + wa[3], pa = acx - wa[2] * 0.95, pb = acx + wa[2] * 0.1;
      // a plaster wall going dark, and the low sun: it washes the wall round the frame before anything else
      s = surf(-400, H + 800, 'url(#ep-bwall)', 'mottle', 1, 0.45) + FX.shade(-80, -60, W + 160, H + 120, 0.7) + FX.pool(acx, wa[1] + wa[3] / 2, wa[2] * (wide ? 2 : 1.4), wa[3] * (wide ? 1.8 : 3), 0.8) + FX.pool(acx - wa[2] * 0.3, aby, wa[2] * 2.2, wa[3] * (wide ? 1.5 : 3), 0.3);
      if (wide) s += R(wa[0] - 76, wa[1] - 38, wa[2] + 152, 8, 4, 'url(#ep-gold)', op(0.85)) + drape(wa[0] - 70, wa[1] - 32, 58, wa[3] + 92) + drape(wa[0] + wa[2] + 12, wa[1] - 32, 58, wa[3] + 92);
      s += R(wa[0] - 14, wa[1] - 6, wa[2] + 34, wa[3] + 30, 14, V('night-900'), op(0.3)) + R(wa[0] - 10, wa[1] - 10, wa[2] + 20, wa[3] + 20, 12, 'url(#ep-metal)') + R(wa[0], wa[1], wa[2], wa[3], 4, 'url(#ep-autumn)') +
        C(wa[0] + wa[2] * 0.24, wa[1] + wa[3] * 0.8, wa[3] * 0.34, 'url(#fx-hot)', { opacity: 0.8, 'clip-path': 'url(#ep-wclip)' }) +
        P('M' + wa[0] + ' ' + aby + 'v' + f(-wa[3] * 0.14) + 'q' + f(wa[2] * 0.2) + ' ' + f(-wa[3] * 0.1) + ' ' + f(wa[2] * 0.45) + ' ' + f(-wa[3] * 0.03) + 't' + f(wa[2] * 0.55) + ' ' + f(-wa[3] * 0.05) + 'V' + aby + 'Z', M('pole-red-dark', 'lamp-deep', 60), op(0.55));
      s += L('M' + (wa[0] + wa[2] * 0.3) + ' ' + (wa[1] + wa[3]) + 'C' + (wa[0] + wa[2] * 0.32) + ' ' + (wa[1] + wa[3] * 0.6) + ' ' + (wa[0] + wa[2] * 0.2) + ' ' + (wa[1] + wa[3] * 0.4) + ' ' + (wa[0] + wa[2] * 0.1) + ' ' + (wa[1] + wa[3] * 0.2) + 'M' + (wa[0] + wa[2] * 0.3) + ' ' + (wa[1] + wa[3] * 0.6) + 'C' + (wa[0] + wa[2] * 0.4) + ' ' + (wa[1] + wa[3] * 0.4) + ' ' + (wa[0] + wa[2] * 0.5) + ' ' + (wa[1] + wa[3] * 0.25) + ' ' + (wa[0] + wa[2] * 0.56) + ' ' + (wa[1] + wa[3] * 0.1), V('wood-dark'), 7);
      s += '<clipPath id="ep-wclip"><rect x="' + wa[0] + '" y="' + wa[1] + '" width="' + wa[2] + '" height="' + wa[3] + '"/></clipPath><g clip-path="url(#ep-wclip)">';
      for (var li = 0; li < 7; li++) s += G('translate(' + f(wa[0] + wa[2] * (0.1 + li * 0.13)) + ' ' + f(wa[1] + wa[3] * 0.3) + ')', P('M0 -7C6 -5 8 2 0 8C-8 2 -6 -5 0 -7Z', li % 2 ? V('lamp-deep') : V('pole-red'), { 'class': 'ep-leaf', style: '--d:-' + (li * 0.57).toFixed(2) + 's' }));
      s += '</g>';
      s += R(wa[0] + wa[2] / 2 - 4, wa[1], 8, wa[3], 0, 'url(#ep-metal)') + R(wa[0], wa[1] + wa[3] * 0.48, wa[2], 8, 0, 'url(#ep-metal)');
      s += R(wa[0] - 24, aby + 10, wa[2] + 48, 11, 3, 'url(#ep-wood)') + R(wa[0] - 24, aby + 10, wa[2] + 48, 2, 1, V('lamp'), op(0.7)) + R(wa[0] - 16, aby + 21, wa[2] + 32, 8, 0, 'url(#fx-rise)', op(0.6));
      // boards, a skirting, then the shaft and the window's own shape thrown across the floor
      s += B(fyA - 14, 14, M('wood-dark', 'night-900', 50)) + B(fyA - 14, 1.6, V('lamp-deep'), 0.35) +
        surf(fyA, 600, 'url(#ep-floor)', 'planks', wide ? 1.1 : 0.8, 0.42) + B(fyA, 2, V('lamp-deep'), 0.3) + B(fyA + 2, 14, 'url(#fx-rise)', 0.6) +
        FX.cone(acx, aby, wa[2], wa[2] * 1.5, H - aby + 60, 0.42, { skew: -wa[2] * 0.6 }) +
        P('M' + f(pa) + ' ' + (fyA + 8) + 'H' + f(pb) + 'L' + f(pb - 90) + ' ' + (H + 30) + 'H' + f(pa - 190) + 'Z', V('lamp'), { opacity: 0.3, 'class': 'fx-add' }) +
        L('M' + f((pa + pb) / 2) + ' ' + (fyA + 8) + 'L' + f((pa + pb) / 2 - 140) + ' ' + (H + 30) + 'M' + f(pa - 60) + ' ' + f(fyA + (H - fyA) * 0.42) + 'H' + f(pb - 30), M('wood-dark', 'night-900', 45), 9, op(0.5)) +
        FX.motes(acx - wa[2] * 0.8, aby - (wide ? 150 : 20), wa[2] * 1.1, wide ? 300 : 170, 10, 8, { r: 1.5 });
      var nw = wide ? 540 : 400, nh = nw * 0.74;
      s += G('translate(' + (wide ? 120 : 25) + ' ' + (wide ? 100 : 104) + ') rotate(-1.5 ' + nw / 2 + ' ' + nh / 2 + ')', G({ 'class': 'ep-letter' }, notice(nw, nh)));
      s += (wide ? FX.cast(790, fyA + 58, 190, 20, 0.6) + wheelyBear(890, fyA + 34, 3.2) : FX.cast(280, fyA + 72, 110, 13, 0.6) + wheelyBear(340, fyA + 58, 1.9));
      return svg(W, H, s);
    }
    if (k === 'rehire') {
      var fyR = wide ? 568 : 708, cw = wide ? 370 : 400;
      // the workshop: brick, a tool board, a bench of half-made toys, and one pendant over the drawing board
      var tc = M('board', 'basement', 52), th = M('wood', 'basement', 48), bx = 880, by = fyR - 94, bw = M('wood-dark', 'night-900', 55);
      s = surf(-400, fyR + 400, 'url(#ep-bwall)', 'brick', wide ? 0.8 : 0.62, 0.5) + B(0, 90, 'url(#fx-rise)', 0.8);
      if (wide) s += G('translate(62 96)', R(4, 6, 252, 172, 6, V('night-900'), op(0.35)) + R(0, 0, 252, 172, 6, M('wood-dark', 'basement', 52)) + FX.tex('wood', 0, 0, 252, 172, 0.6, { rx: 6 }) + R(0, 0, 252, 2.5, 1, V('lamp'), op(0.2)) +
          R(38, 40, 9, 96, 3, th) + R(20, 30, 46, 19, 4, tc) + P('M100 42H184L196 72H100Z', tc) + R(80, 38, 24, 40, 7, th) + L('M222 52V138', tc, 9) + C(222, 44, 13, tc) + C(222, 37, 5.5, M('wood-dark', 'basement', 52))) +
        ao(bx + 150, fyR + 3, 180, 10, 0.55) + R(bx + 14, by, 12, 94, 2, bw) + R(bx + 274, by, 12, 94, 2, bw) + R(bx + 10, fyR - 34, 280, 8, 2, bw) + R(bx, by, 300, 13, 3, M('wood', 'basement', 46)) + R(bx, by, 300, 2, 1, V('lamp'), op(0.28)) +
        C(bx + 52, by - 17, 17, M('pole-red', 'basement', 46)) + R(bx + 92, by - 28, 28, 28, 4, M('gold', 'basement', 44)) + R(bx + 124, by - 20, 24, 20, 3, M('good', 'basement', 44)) +
        P('M' + (bx + 92) + ' ' + (by - 28) + 'l14 -16l14 16Z', M('pole-green', 'basement', 46)) + R(bx + 196, by - 34, 44, 34, 5, M('wood', 'basement', 44));
      s += E(wide ? 420 : 225, wide ? 300 : 560, 520, 330, 'url(#ep-glow)', op(0.26)) + FX.shade(-80, -60, W + 160, H + 120, 0.8);
      s += surf(fyR, 600, 'url(#ep-floor)', 'planks', wide ? 1.1 : 0.7, 0.42) + B(fyR, 2, V('lamp'), 0.3) + B(fyR + 2, 14, 'url(#fx-rise)', 0.6);
      s += wide ? FX.cast(540, fyR - 210, 250, 200, 0.42) + pendant(420, 20, 430, 1, { h: fyR + 40, w: 660, op: 0.44 }) + FX.pool(450, fyR + 30, 360, 36, 0.5) + FX.motes(300, 110, 280, 320, 9, 6) :
        pendant(225, 430, 610, 1, { h: fyR + 50, w: 450, op: 0.44, skew: 12 }) + FX.pool(225, fyR + 30, 210, 30, 0.5) + FX.motes(120, 480, 210, 200, 7, 6);
      s += G('translate(' + (wide ? 782 : 25) + ' ' + (wide ? 78 : 122) + ') rotate(' + (wide ? 1.5 : -0.8) + ')', G({ 'class': 'ep-cert' }, contract(cw, TERMS)));
      var sleeve = function (a, b, c, d, k) { return L('M' + a + ' ' + b + 'Q' + ((a + c) / 2 + 12 * k) + ' ' + ((b + d) / 2 + 8 * k) + ' ' + c + ' ' + d, V('pole-green-dark'), 19 * k) + L('M' + a + ' ' + (b - 2) + 'Q' + ((a + c) / 2 + 11 * k) + ' ' + ((b + d) / 2 + 5 * k) + ' ' + c + ' ' + (d - 2), V('pole-green'), 13 * k); };
      s += wide ? drawingBoard(450, fyR, 0.86) + elf(232, fyR + 4, 1.24, { badge: 1, look: 5 }) + sleeve(278, fyR - 80, 344, fyR - 196, 1.5) + mitten(362, fyR - 200, 0.8) + bot(640, fyR + 6, 190, 'pad') :
        drawingBoard(224, fyR, 0.44) + elf(100, fyR + 4, 0.8, { badge: 1, look: 5 }) + sleeve(130, fyR - 52, 166, fyR - 104, 0.9) + mitten(176, fyR - 108, 0.46) + bot(304, fyR + 6, 130, 'pad');
      return svg(W, H, s);
    }
    var kids = '', wr = null;
    if (k === 'bad') {
      var hs = ['red', 'blue', 'yellow', 'green', 'purple', 'pink'];
      if (!wide) wr = [36, 320, 378, 150];
      for (var i = 0; i < (wide ? 6 : 5); i++) kids += kid(wide ? 100 + i * 46 + (i % 2) * 6 : 76 + i * 74, wide ? 190 + (i % 2) * 34 : 400 + (i % 2) * 24, wide ? 0.85 : 0.72, hs[i], i === 1 || i === 4);
    }
    s += room(W, H, wide, kids, wr);
    var dash1 = k === 'good' ? dash(dW, dH, 'CREDIT', 'THANK YOU, AI', 100, 'CONTRIBUTORS: 1 (AI)', false) :
      k === 'bad' ? dash(dW, dH, 'ALL GREEN', ad + '%', ad, 'ISSUES REPORTED: 0', true) :
      dash(dW, dH, 'AI ADOPTION', ad + '%', ad, 'ISSUES REPORTED: 0', false);
    if (k === 'bad' && !wide) { dW = 360; dH = 210; dpos = 'translate(45 70)'; dash1 = dash(dW, dH, 'ALL GREEN', ad + '%', ad, 'ISSUES REPORTED: 0', true); }
    s += G({ transform: dpos }, dash1);
    s += members(xs, ty, ms, k === 'good' ? [0, 0, 'hold'] : null);
    s += table(wide ? 150 : -10, wide ? 1050 : 460, ty, wide ? 30 : 22, W);
    if (k === 'e1') {
      var cw = wide ? 860 : 400, ch = wide ? 176 : 306;
      s += G('translate(' + (W - cw) / 2 + ' ' + (ty + (wide ? 22 : 30)) + ') rotate(-1.5 ' + cw / 2 + ' ' + ch / 2 + ')', G({ 'class': 'ep-cheque' }, cheque(cw, ch, wide)));
    } else if (k === 'good') {
      var lw = wide ? 270 : 260, lh = wide ? 190 : 184;
      s += G('translate(' + (W / 2 - lw / 2) + ' ' + (wide ? 236 : ty - 262) + ') rotate(-4 ' + lw / 2 + ' ' + lh / 2 + ')', G({ 'class': 'ep-letter' },
        letter(lw, lh) + E(16, lh - 18, 14, 11, V('snow-shade')) + E(lw - 16, lh - 22, 14, 11, V('snow-shade'))));
    } else if (k === 'mid') {
      s += G('translate(' + W / 2 + ' ' + (ty + 18) + ')' + (wide ? '' : ' scale(.86)'), sack(wide));
    }
    return svg(W, H, s);
  }
  NP.epilogue = {
    play: function (el, o) {
      o = o || {};
      FX.ensure();
      var reduced = !!o.reduced || document.documentElement.classList.contains('reduced');
      var wide = (el.clientWidth || window.innerWidth) >= 640 && (el.clientWidth || window.innerWidth) >= (el.clientHeight || window.innerHeight) * 0.85;
      var b = band(o.pct), vk = ['good', 'mid', 'bad'][b], ad = Math.round(+o.adoption || 100), n = Math.max(0, Math.round(+o.pileCount || 0));
      var chair = copy('chair').replace('{adoption}', ad), vd = verdict(o.pct);
      var sc = [
        { k: 'e1', t: 5000, slug: copy('date'), cap: chair,
          sr: 'The year-end board meeting, 27 December. A giant cheque reads ' + copy('cheque') + '. ' + copy('useCase') + '. The dashboard shows AI adoption at ' + ad + ' percent. ' + chair },
        { k: vk, t: 5000, slug: 'The verdict', cap: vd.line, sr: vd.caption + ' ' + vd.line },
        { k: 'jobless', hold: true, slug: 'January', cap: copy('jobless'),
          sr: 'The basement. You stand miserably beside your cardboard box. Father Christmas is asleep on a pile of bug tickets, and behind him is the pile of broken toys: ' + n + (n === 1 ? ' toy. ' : ' toys. ') + copy('jobless') },
        { k: 'autumn', hold: true, slug: 'Autumn', cap: copy('autumn'),
          sr: 'A letter from the board: A child asked for a Wobblepod. The AI only makes what it learned, so it offered a teddy bear with wheels. The robots built it perfectly. Please come back and teach it new toys. ' + copy('autumn') },
        { k: 'rehire', hold: true, slug: 'Next year', cap: copy('rehire'),
          sr: 'You are back at your drawing board wearing a contractor badge, with a robot beside you taking notes. The contract reads: ' + TERMS.join(' ') + ' ' + copy('rehire') }
      ];
      var NB = sc.length;
      el.innerHTML = '<div class="il ep' + (reduced ? ' il-reduced' : '') + '"><svg class="ep-defs" width="0" height="0" aria-hidden="true">' + DEFS + '</svg><div class="il-stage">' +
        sc.map(function (s) { return '<section class="il-beat ep-sc ep-' + s.k + '" aria-hidden="true">' + sceneSVG(s.k, o, wide) + '<p class="ep-slug">' + esc(s.slug) + '</p></section>'; }).join('') +
        '</div><div class="il-foot ep-foot"><p class="il-cap" aria-hidden="true"></p><p class="sr-only" aria-live="polite"></p>' +
        '<div class="il-dots" aria-hidden="true">' + sc.map(function () { return '<i></i>'; }).join('') + '</div>' +
        '<button type="button" class="keycap keycap-pack il-next ep-next">Next</button>' +
        '<p class="il-hint"><span class="kb"></span><span class="tch">Tap: next</span></p></div>' +
        '<button type="button" class="keycap keycap-plain ep-skip">Skip</button></div>';
      el.hidden = false;
      var root = el.firstChild, beats = root.querySelectorAll('.ep-sc'), dots = root.querySelectorAll('.il-dots i');
      var cap = root.querySelector('.il-cap'), srl = root.querySelector('.sr-only');
      var cur = -1, timer = 0, left = 0, t0 = 0, paused = false, over = false, shownAt = 0, resolve;
      var done = new Promise(function (r) { resolve = r; });
      var nextBtn = root.querySelector('.ep-next'), hint = root.querySelector('.il-hint .kb');
      function held() { return reduced || !!sc[cur].hold; }
      function focusNext() { if (held()) try { nextBtn.focus({ preventScroll: true }); } catch (e) { nextBtn.focus(); } }
      function arm(ms) { clearTimeout(timer); left = ms; t0 = Date.now(); if (!held() && !paused) timer = setTimeout(function () { show(cur + 1, true); }, ms); }
      function show(i, auto) {
        if (over) return;
        if (!auto && Date.now() - shownAt < (held() ? 600 : 350)) return;          // a double-tap shouldn't skip a scene unseen
        if (i >= NB) return finish();
        cur = i; shownAt = Date.now();
        requestAnimationFrame(function () { requestAnimationFrame(function () { if (cur === i) shownAt = Date.now(); }); });   // a heavy scene change can delay the second tap of a double-tap: count from the paint
        for (var j = 0; j < NB; j++) {
          beats[j].classList.toggle('on', j === i);
          dots[j].className = j < i ? 'past' : j === i ? 'now' : '';
        }
        cap.textContent = sc[i].cap;
        setTimeout(function () { if (cur === i) srl.textContent = sc[i].sr; }, 60);   // a live region announces changes, so not the text it was inserted with
        if (i === NB - 1 && o.onFinal) o.onFinal();
        var last = i === NB - 1;
        nextBtn.classList.toggle('show', held());              // it keeps its space while hidden, so the scene doesn't jump
        nextBtn.textContent = last ? (o.lastLabel || 'See your report') : 'Next';
        nextBtn.setAttribute('aria-label', last ? nextBtn.textContent : 'Next scene');
        hint.textContent = held() ? 'Space, Enter or tap: next · S: skip' : 'Space or tap: next scene · Enter or S: skip';
        arm(sc[i].t);
        focusNext();
      }
      function finish() {
        if (over) return;
        over = true; clearTimeout(timer);
        root.classList.add('il-end', 'ep-end');
        resolve();
      }
      var skipBtn = root.querySelector('.ep-skip');
      ['pointerdown', 'touchstart', 'mousedown'].forEach(function (t) { skipBtn.addEventListener(t, function (e) { e.stopPropagation(); }, { passive: true }); });
      skipBtn.addEventListener('click', function (e) { e.stopPropagation(); finish(); });
      nextBtn.addEventListener('click', function (e) { e.stopPropagation(); if (!paused) show(cur + 1); });
      show(0, true);
      return {
        next: function () { if (!paused) show(cur + 1); },
        skip: finish,
        pause: function () {
          if (paused || over) return;
          paused = true; clearTimeout(timer); left = Math.max(0, left - (Date.now() - t0));
          root.classList.add('il-paused');
        },
        resume: function () {
          if (!paused || over) return;
          paused = false; root.classList.remove('il-paused');
          arm(Math.max(600, left));
          focusNext();
        },
        held: held,
        done: done
      };
    }
  };
})(window.NP);
