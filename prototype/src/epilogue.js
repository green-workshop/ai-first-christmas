window.NP = window.NP || {};

// Epilogue (SPEC §3a): E1 the year-end board meeting and its giant cheque, E2 the basement, E3 the verdict
// (+ an automation beat). Plays on its own (~15s); reduced motion = still panels that wait for next().
// The engine owns all input; this only exposes next/skip/pause/resume/done.
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
    '</defs>';

  /* ---------- copy ---------- */
  var DEF = {
    date: '27 December · Year-end board meeting',
    chair: 'Chair: "100% adoption. A record year."',
    cheque: 'BONUSES: AI TRANSFORMATION', useCase: 'Use case: TBC (next year)',
    basement: 'Meanwhile, in the basement.',
    automated: 'Chair: "Special thanks to our elf for embracing automation."',
    verdicts: ['A thank-you letter arrives for "the elf". The board credits the AI.',
      'A returns sack thuds onto the table. Board: "Lessons will be learned."',
      'The dashboard is green. The window is full of upset children. Chair: "Promotion likely."']
  };
  function copy(k) { var e = (NP.content && NP.content.epilogue) || {}; return e[k] != null && typeof e[k] !== 'object' ? String(e[k]) : DEF[k]; }
  function band(p) { p = +p || 0; return p >= 90 ? 0 : p >= 40 ? 1 : 2; }
  function bandLine(p) {
    var v = NP.content && NP.content.verdicts, e = (NP.content && NP.content.epilogue) || {};
    if (Array.isArray(e.verdicts) && e.verdicts[band(p)]) return String(e.verdicts[band(p)].line || e.verdicts[band(p)].text || e.verdicts[band(p)]);
    if (Array.isArray(v) && v.length) {
      var hit = v.slice().sort(function (a, b) { return (b.min || 0) - (a.min || 0); }).filter(function (x) { return (+p || 0) >= (x.min || 0); })[0];
      if (hit && (hit.line || hit.text)) return String(hit.line || hit.text);
    }
    return DEF.verdicts[band(p)];
  }
  function verdictLine(o) { o = o || {}; return bandLine(o.pct) + (o.automated ? ' ' + copy('automated') : ''); }

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
      R(x0, y, x1 - x0, 2.5, 0, V('lamp'), op(0.45)) +
      R(x0 - 30, y + depth, x1 - x0 + 60, 400, 0, 'url(#ep-tablef)') + R(x0 - 30, y + depth, x1 - x0 + 60, 3, 0, V('lamp'), op(0.3)) +
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
  function pendant(x, y, gy, shade) {
    return E(x, gy, 300, 170, 'url(#ep-glow)', op(0.34)) + (shade ? R(x - 1, -400, 2, y + 400, 0, V('night-900'), op(0.7)) +
      lit('M' + (x - 34) + ' ' + (y + 30) + 'Q' + x + ' ' + (y - 14) + ' ' + (x + 34) + ' ' + (y + 30) + 'Z', 'url(#ep-gold)', 1.5) +
      E(x, y + 30, 26, 5, V('lamp')) + C(x, y + 34, 26, 'url(#ep-glow)') : '');
  }
  function room(W, H, wide, winInner, wr) {
    var s = R(-400, -400, W + 800, H + 800, 0, 'url(#ep-wall)');
    for (var x = wide ? 40 : 20; x < W; x += wide ? 160 : 110) s += R(x, wide ? 330 : 300, 2, 600, 0, V('night-900'), op(0.25));
    s += R(-400, wide ? 324 : 294, W + 800, 6, 0, V('board'), op(0.4));
    wr = wr || (wide ? [70, 54, 290, 220] : [24, 300, 128, 110]);
    s += win(wr[0], wr[1], wr[2], wr[3], winInner);
    s += wide ? pendant(430, 30, 430, 1) + pendant(790, 30, 430, 1) : pendant(225, 0, 420, 0);
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
  // the rejects pile: real size, stacked bottom-up in rows of 8, 7, 6 …
  function pile(n, S, base0) {
    n = Math.max(0, Math.min(36, Math.round(+n || 0)));
    seed = 11;
    var out = '', i = 0, r = 0, xs = S * 0.74, ys = S * 0.5, base = Math.min(base0 || 8, Math.max(2, n)), items = [];
    while (i < n) {
      var cnt = Math.max(1, base - r), take = Math.min(cnt, n - i);
      for (var j = 0; j < take; j++, i++) items.push([(j - (take - 1) / 2) * xs + (rnd() - 0.5) * S * 0.2, -r * ys + (rnd() - 0.5) * 6, (rnd() - 0.5) * 34, i]);
      r++;
    }
    out += ao(0, 6, (Math.min(n, base) * xs) / 2 + S * 0.6, 16 + r * 3, 0.65);
    items.forEach(function (t) { out += toy(t[3], t[0], t[1], S / 64, f(t[2])); });
    return out;
  }
  function ticket(x, y, r, red, w) {
    w = w || 38;
    return G('translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(r) + ')', R(-w / 2, -w * 0.32, w, w * 0.64, 2.5, 'url(#ep-paper)') +
      R(-w / 2, -w * 0.32, w, w * 0.16, 2, red ? V('pole-red') : V('board')) + R(-w / 2 + 4, -w * 0.06, w * 0.6, 2.2, 1, V('ink-soft'), op(0.55)) + R(-w / 2 + 4, w * 0.06, w * 0.75, 2.2, 1, V('ink-soft'), op(0.45)));
  }
  // Father Christmas asleep face-down on his bug tickets (matches scene.js: cloud beard, reading glasses, plain red coat)
  // local: desk surface back edge y = -30, front edge y = 10
  function fcAsleep() {
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
    s += R(-232, 10, 464, 300, 0, 'url(#ep-woodd)') + R(-232, 10, 464, 3, 0, V('lamp'), op(0.4)) + R(-232, 13, 464, 14, 0, V('night-900'), op(0.2)) +
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
    var s = R(-400, -400, W + 800, H + 800, 0, 'url(#ep-bwall)');
    var fy = wide ? 520 : 470, py = wide ? 548 : 420, px = wide ? 290 : 225, fx = wide ? 850 : 225, dy = wide ? 476 : 640;
    s += R(-400, 22, W + 800, 16, 8, 'url(#ep-metal)') + R(-400, 24, W + 800, 3, 0, V('snow-shade'), op(0.25));
    s += win(wide ? 120 : 280, wide ? 80 : 70, wide ? 150 : 100, wide ? 90 : 70);
    s += E(wide ? 200 : 330, fy, 260, 50, 'url(#ep-cool)', op(0.5));
    s += R(-400, fy, W + 800, 600, 0, 'url(#ep-floor)') + R(-400, fy, W + 800, 2, 0, V('lamp-deep'), op(0.3));
    s += G('translate(' + (px - 70) + ' ' + (wide ? 170 : 112) + ') rotate(-3)', R(0, 0, 140, 40, 3, 'url(#ep-paper)') + R(62, -6, 16, 10, 1, V('paper-shade'), op(0.9)) +
      Tx(70, 28, 22, 'REJECTS', { 'text-anchor': 'middle', fill: V('ink-soft'), 'font-weight': 800, 'letter-spacing': '.08em' }));
    s += G('translate(' + px + ' ' + py + ')', n ? pile(n, wide ? 72 : 52, wide ? 7 : 7) : ao(0, 4, 90, 10, 0.3) + Tx(0, -10, 18, '(empty)', { 'text-anchor': 'middle', fill: V('snow-shade'), 'font-weight': 700 }));
    // the desk lamp: the only warm light down here
    s += E(fx - 40, dy - 50, 400, 230, 'url(#ep-glow)', op(0.5));
    s += G('translate(' + fx + ' ' + dy + ') scale(' + (wide ? 1.22 : 0.88) + ')', fcAsleep() +
      G('translate(184 -30)', ao(0, 0, 40, 6) + R(-4, -96, 8, 96, 4, 'url(#ep-metal)') + lit('M-40 -96Q-34 -134 0 -136Q34 -134 40 -96Z', 'url(#ep-green)', 1.5) + E(0, -96, 34, 6, V('lamp')) +
        C(0, -92, 40, 'url(#ep-glow)') + E(0, 0, 34, 6, 'url(#ep-metal)')) +
      G('translate(-186 -22)', ao(0, 0, 20, 4) + R(-13, -30, 26, 30, 5, V('pole-green')) + R(-13, -30, 9, 30, 4, V('snow'), op(0.12)) + E(0, -30, 13, 3.5, M('pole-green', 'snow', 70)) + E(0, -29.6, 10.5, 2.4, V('wood-dark')) +
        L('M13 -24C24 -24 24 -8 13 -9', M('pole-green', 'night-900', 70), 4.5)));
    return s;
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
  function certificate(w, h) {
    return ao(w / 2, h + 12, w * 0.5, 12, 0.5) + R(0, 0, w, h, 6, 'url(#ep-gold)') + R(10, 10, w - 20, h - 20, 3, 'url(#ep-paper)') +
      Tx(w / 2, 56, 19, 'CERTIFICATE OF', { 'text-anchor': 'middle', 'font-weight': 800, 'letter-spacing': '.14em', fill: V('ink-soft') }) +
      Tx(w / 2, 100, 38, 'AUTOMATION', { 'text-anchor': 'middle', 'font-weight': 900 }) +
      R(w / 2 - 90, 116, 180, 2, 1, V('gold-dark'), op(0.6)) +
      Tx(w / 2, 146, 18, 'awarded to our elf,', { 'text-anchor': 'middle', 'font-weight': 600, 'font-style': 'italic', fill: V('ink-soft') }) +
      Tx(w / 2, 170, 18, 'for not checking', { 'text-anchor': 'middle', 'font-weight': 700, 'font-style': 'italic', fill: V('pole-red-dark') }) +
      G('translate(' + (w - 30) + ' 30)', P('M-12 10L-18 34L-6 28L0 38L4 12Z', V('pole-red')) + P('M8 10L18 34L6 30L2 38L-2 12Z', V('pole-red-dark')) + C(0, 0, 24, 'url(#ep-gold)') + C(-6, -7, 7, V('lamp'), op(0.6)));
  }
  /* ---------- scenes ---------- */
  function svg(W, H, inner) {
    return '<svg class="ep-svg" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g class="ep-cam" style="transform-origin:' + W / 2 + 'px ' + H * 0.55 + 'px">' + inner + '</g></svg>';
  }
  function sceneSVG(k, o, wide) {
    var W = wide ? 1200 : 450, H = wide ? 675 : 800, s = '', ad = Math.round(+o.adoption || 100);
    var xs = wide ? [360, 480, 600, 720, 840] : [65, 145, 225, 305, 385], ty = wide ? 450 : k === 'e1' ? 430 : k === 'bad' ? 610 : 570, ms = wide ? 1 : 0.74;
    var dW = wide ? 310 : 300, dH = wide ? 200 : 186, dpos = wide ? 'translate(830 60)' : 'translate(75 74)';
    if (k === 'e2') return svg(W, H, basement(W, H, wide, o.pileCount));
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
    } else if (k === 'auto') {
      var aw = wide ? 420 : 380, ah = 190;
      s += G('translate(' + (W - aw) / 2 + ' ' + (wide ? 470 : ty + 22) + ') rotate(1.5)', G({ 'class': 'ep-cert' }, certificate(aw, ah)));
    }
    return svg(W, H, s);
  }
  NP.epilogue = {
    verdictLine: verdictLine,
    play: function (el, o) {
      o = o || {};
      var reduced = !!o.reduced || document.documentElement.classList.contains('reduced');
      var wide = (el.clientWidth || window.innerWidth) >= 640 && (el.clientWidth || window.innerWidth) >= (el.clientHeight || window.innerHeight) * 0.85;
      var b = band(o.pct), vk = ['good', 'mid', 'bad'][b], ad = Math.round(+o.adoption || 100), n = Math.max(0, Math.round(+o.pileCount || 0));
      var sc = [
        { k: 'e1', t: 5000, slug: copy('date'), cap: copy('chair'),
          sr: 'The year-end board meeting, 27 December. A giant cheque reads ' + copy('cheque') + '. ' + copy('useCase') + '. The dashboard shows AI adoption at ' + ad + ' percent. ' + copy('chair') },
        { k: 'e2', t: 4000, slug: 'The basement', cap: copy('basement'),
          sr: 'The basement. Father Christmas is asleep face-down on a pile of bug tickets, his glasses askew. Behind him, the pile of broken toys: ' + n + (n === 1 ? ' toy.' : ' toys.') },
        { k: vk, t: 6000, slug: 'The verdict', cap: bandLine(o.pct), sr: bandLine(o.pct) }
      ];
      if (o.automated) sc.push({ k: 'auto', t: 3500, slug: 'One more thing', cap: copy('automated'), sr: 'The board applauds a certificate of automation. ' + copy('automated') });
      var NB = sc.length;
      el.innerHTML = '<div class="il ep' + (reduced ? ' il-reduced' : '') + '"><svg class="ep-defs" width="0" height="0" aria-hidden="true">' + DEFS + '</svg><div class="il-stage">' +
        sc.map(function (s) { return '<section class="il-beat ep-sc ep-' + s.k + '" aria-hidden="true">' + sceneSVG(s.k, o, wide) + '<p class="ep-slug">' + esc(s.slug) + '</p></section>'; }).join('') +
        '</div><div class="il-foot ep-foot"><p class="il-cap" aria-hidden="true"></p><p class="sr-only" aria-live="polite"></p>' +
        '<div class="il-dots" aria-hidden="true">' + sc.map(function () { return '<i></i>'; }).join('') + '</div>' +
        '<p class="il-hint"><span class="kb">' + (reduced ? 'Space or tap: next' : 'Space or tap: next scene') + ' · Enter or S: skip</span><span class="tch">Tap: next</span></p></div>' +
        '<button type="button" class="keycap keycap-plain ep-skip">Skip</button></div>';
      el.hidden = false;
      var root = el.firstChild, beats = root.querySelectorAll('.ep-sc'), dots = root.querySelectorAll('.il-dots i');
      var cap = root.querySelector('.il-cap'), srl = root.querySelector('.sr-only');
      var cur = -1, timer = 0, left = 0, t0 = 0, paused = false, over = false, shownAt = 0, resolve;
      var done = new Promise(function (r) { resolve = r; });
      function arm(ms) { clearTimeout(timer); left = ms; t0 = Date.now(); if (!reduced && !paused) timer = setTimeout(function () { show(cur + 1, true); }, ms); }
      function show(i, auto) {
        if (over) return;
        if (!auto && Date.now() - shownAt < 350) return;          // a double-tap shouldn't skip a scene unseen
        if (i >= NB) return finish();
        cur = i; shownAt = Date.now();
        for (var j = 0; j < NB; j++) {
          beats[j].classList.toggle('on', j === i);
          dots[j].className = j < i ? 'past' : j === i ? 'now' : '';
        }
        cap.textContent = sc[i].cap; srl.textContent = sc[i].sr;
        arm(sc[i].t);
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
        },
        done: done
      };
    }
  };
})(window.NP);
