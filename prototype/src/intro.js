/* intro.js: the ~68s intro film (SPEC §3 storyboard, §9 art). Contract: ARCHITECTURE.md "intro.js".
   NP.intro.play(el, { reduced }) -> { next, skip, pause, resume, done }
   Every scene is one <svg> built at cut time, framed for portrait or landscape by the width at that moment.
   A scene registers cues on its own clock; animations are WAAPI (transform/opacity only) so pause/resume
   and frame seeking are exact. Ids/classes: in-*. Reuses scene.js defs (sc-*) and Father Christmas. */
window.NP = window.NP || {};
(function (NP) {
  'use strict';

  /* ---------- tiny SVG helpers ---------- */
  function V(n) { return 'var(--' + n + ')'; }
  function M(a, b, p) { return 'color-mix(in srgb,var(--' + a + ') ' + p + '%,var(--' + b + '))'; }
  function f(n) { return Math.round(n * 10) / 10; }
  function mg(b, o) { if (o) for (var k in o) b[k] = o[k]; return b; }
  function A(o) { var s = ''; for (var k in o) if (o[k] != null) s += ' ' + k + '="' + o[k] + '"'; return s; }
  function T(t, o, i) { return '<' + t + A(o || {}) + (i == null ? '/>' : '>' + i + '</' + t + '>'); }
  function R(x, y, w, h, r, fl, o) { return T('rect', mg({ x: f(x), y: f(y), width: f(w), height: f(h), rx: r || null, fill: fl }, o)); }
  function C(x, y, r, fl, o) { return T('circle', mg({ cx: f(x), cy: f(y), r: f(r), fill: fl }, o)); }
  function E(x, y, rx, ry, fl, o) { return T('ellipse', mg({ cx: f(x), cy: f(y), rx: f(rx), ry: f(ry), fill: fl }, o)); }
  function Pa(d, fl, o) { return T('path', mg({ d: d, fill: fl }, o)); }
  function G(o, i) { return T('g', o, i || ''); }
  function Ln(d, col, w, o) { return Pa(d, 'none', mg({ stroke: col, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, o)); }
  function Tx(x, y, sz, s, o) { return T('text', mg({ x: f(x), y: f(y), 'font-size': sz, 'class': 'in-t', fill: V('ink') }, o), s); }
  function Tm(x, y, sz, s, o) { return Tx(x, y, sz, s, mg({ 'text-anchor': 'middle' }, o)); }
  function O(v) { return { opacity: v }; }
  function u(n) { return 'url(#sc-' + n + ')'; }
  function at(x, y, s, i) { return G({ transform: 'translate(' + f(x) + ' ' + f(y) + ')' + (s && s !== 1 ? ' scale(' + s + ')' : '') }, i); }
  function rr(x, y, w, h, r) {
    return 'M' + f(x + r) + ' ' + f(y) + 'H' + f(x + w - r) + 'A' + r + ' ' + r + ' 0 0 1 ' + f(x + w) + ' ' + f(y + r) + 'V' + f(y + h - r) +
      'A' + r + ' ' + r + ' 0 0 1 ' + f(x + w - r) + ' ' + f(y + h) + 'H' + f(x + r) + 'A' + r + ' ' + r + ' 0 0 1 ' + f(x) + ' ' + f(y + h - r) +
      'V' + f(y + r) + 'A' + r + ' ' + r + ' 0 0 1 ' + f(x + r) + ' ' + f(y) + 'Z';
  }
  function el(cx, cy, rx, ry) { return 'M' + f(cx - rx) + ' ' + f(cy) + 'a' + rx + ' ' + ry + ' 0 1 0 ' + 2 * rx + ' 0a' + rx + ' ' + ry + ' 0 1 0 ' + -2 * rx + ' 0Z'; }
  // rim light (§9.3): a --lamp copy nudged up-left peeks out on the lit edge
  function lit(d, fl, o, k) { k = k || 2; return Pa(d, V('lamp'), { transform: 'translate(' + -k + ' ' + f(-k * 0.8) + ')', opacity: 0.8 }) + Pa(d, fl, o); }
  function ao(x, y, rx, ry, op) { return E(x, y, rx, ry, u('ao'), { opacity: op || 0.35 }); }
  function glow(x, y, rx, ry, op, cool) { return E(x, y, rx, ry, cool ? u('glowc') : u('glow'), { opacity: op }); }
  var seed = 3;
  function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
  function q(r, s) { return r.querySelector(s); }
  function qa(r, s) { return Array.prototype.slice.call(r.querySelectorAll(s)); }
  function px(x, y) { return 'translate(' + f(x) + 'px,' + f(y) + 'px)'; }
  function camT(cx, cy, s, dx, dy) { return px(f(cx + (dx || 0) - cx * s), f(cy + (dy || 0) - cy * s)) + ' scale(' + s + ')'; }

  /* ---------- own defs (in-*) ---------- */
  var VERT = { x1: 0, y1: 0, x2: 0, y2: 1 };
  function lg(id, a, b, o) { return T('linearGradient', mg({ id: 'in-' + id, x1: 0.1, y1: 0, x2: 0.9, y2: 1 }, o), T('stop', { offset: 0, 'stop-color': a }) + T('stop', { offset: 1, 'stop-color': b })); }
  function rg(id, c, a) { return T('radialGradient', { id: 'in-' + id }, T('stop', { offset: 0, 'stop-color': c, 'stop-opacity': a }) + T('stop', { offset: 1, 'stop-color': c, 'stop-opacity': 0 })); }
  var DEFS =
    lg('suit', M('board', 'snow', 84), V('board-dark')) +
    lg('head', M('board', 'snow', 70), M('board', 'board-dark', 62)) +
    lg('night', V('night-900'), V('night-600'), VERT) +
    lg('room', M('night-600', 'board-dark', 58), M('night-900', 'board-dark', 72), VERT) +
    lg('carpet', M('board-dark', 'night-900', 62), V('night-900'), VERT) +
    lg('tbl', M('wood-dark', 'lamp', 74), M('wood-dark', 'night-900', 52)) +
    lg('tblf', M('wood-dark', 'night-900', 62), V('night-900'), VERT) +
    lg('glass', M('night-600', 'board', 70), M('night-900', 'night-600', 55)) +
    lg('glassd', M('night-900', 'night-600', 50), V('night-900')) +
    lg('win', V('lamp'), V('lamp-deep'), VERT) +
    lg('day', M('snow-shade', 'night-600', 66), V('snow'), VERT) +
    lg('warm', M('wood-dark', 'lamp-deep', 62), M('wood-dark', 'night-900', 42), VERT) +
    lg('sack', M('paper-shade', 'wood', 64), M('wood', 'wood-dark', 40)) +
    lg('btn', M('pole-green', 'lamp', 70), V('pole-green-dark')) +
    lg('rub', M('pole-red', 'lamp', 85), V('pole-red-dark'), VERT) +
    lg('ice', M('snow-shade', 'night-600', 55), M('night-600', 'night-900', 70), VERT) +
    lg('lbox', V('paper'), M('paper', 'lamp', 62), VERT) +
    lg('pine', M('pole-green-dark', 'night-600', 60), M('night-900', 'pole-green-dark', 75)) +
    lg('boot', M('ink', 'board-dark', 55), V('ink')) +
    rg('gg', V('pole-green'), 0.75) + rg('fl', V('lamp'), 1);
  function ensureDefs(root) {
    if (NP.scene && NP.scene.fcArt) NP.scene.fcArt();   // makes sure the shared sc-* defs exist
    if (NP.icons && NP.icons.sprite && !document.getElementById('g-giftbox')) {
      var s = document.createElement('div'); s.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden'; s.innerHTML = NP.icons.sprite; root.appendChild(s);
    }
    if (document.getElementById('in-defs')) return;
    var d = document.createElement('div');
    d.innerHTML = '<svg id="in-defs" xmlns="http://www.w3.org/2000/svg" width="0" height="0" aria-hidden="true" focusable="false" style="position:absolute;width:0;height:0;overflow:hidden"><defs>' + DEFS + '</defs></svg>';
    (document.body || document.documentElement).appendChild(d.firstChild);
  }

  /* ---------- the clock: every animation is created through anim() ---------- */
  var LAG = 0, PAUSED = false, LIVE = [];
  function anim(n, fr, o) {
    if (!n || !n.animate) return null;
    o = mg({ fill: 'both' }, o);
    var a = n.animate(fr, o);
    if (LAG > 0) try { a.currentTime = LAG; } catch (e) {}
    if (PAUSED) { a.pause(); LIVE.push(a); }
    return a;
  }

  /* ---------- characters ---------- */
  // Board member: a faceless grey capsule (§9.4). Returns back (body+head) and front (hands, clap hands, name card).
  function member(x, y, s, name, o) {
    o = o || {};
    var lo = o.tall ? 420 : 0, cx = o.cx || 0, ck = o.ck || 1;
    var body = 'M-62 ' + lo + 'V-116C-62-146-44-160 0-160C44-160 62-146 62-116V' + lo + 'Z';
    var b = lit(body, 'url(#in-suit)', null, 2.6) +
      Pa('M26-157C48-153 62-142 62-116V' + lo + 'H36C42-50 40-118 26-157Z', V('night-900'), O(0.22)) +
      Pa('M-20-158L0-100L20-158Z', u('paper')) + Pa('M-6-153H6L9-114L0-101L-9-114Z', M('night-600', 'pole-red-dark', 70)) +
      Pa('M-34-154L-3-97L-20-160Z', M('board', 'snow', 70)) + Pa('M34-154L3-97L20-160Z', M('board-dark', 'night-900', 75)) +
      E(0, -157, 30, 6, V('night-900'), O(0.28));
    var h = lit(el(0, -198, 34, 40), 'url(#in-head)', null, 2.4) +
      E(-12, -216, 11, 6.5, V('snow'), { opacity: 0.32, transform: 'rotate(-32 -12 -216)' }) +
      E(4, -168, 22, 5, V('snow-shade'), O(0.14));
    var back = at(x, y, s, G({ 'class': 'in-mb' }, b + G({ 'class': 'in-mh', 'data-dir': o.dir || 1 }, h)));
    var hand = function (hx, hy, rx, ry) { return E(hx, hy, rx, ry, 'url(#in-head)') + E(hx - rx * 0.3, hy - ry * 0.35, rx * 0.4, ry * 0.25, V('snow'), O(0.25)); };
    var sleeve = 'M-60-128C-66-98-48-76-22-80L-18-98C-34-100-42-112-42-130Z';
    var front = '';
    if (!o.noRest) front += G({ 'class': 'in-hrest' }, ao(-34, 14, 24, 5, 0.5) + ao(34, 14, 24, 5, 0.5) + R(-58, -2, 28, 12, 5, u('paper')) + R(30, -2, 28, 12, 5, u('paper')) + hand(-36, 6, 16, 10) + hand(36, 6, 16, 10));
    front += G({ 'class': 'in-hclap', opacity: 0 }, lit(sleeve, 'url(#in-suit)', null, 1.6) + Pa(sleeve, 'url(#in-suit)', { transform: 'scale(-1 1)' }) +
      G({ 'class': 'in-hl' }, hand(-17, -94, 14, 18)) + G({ 'class': 'in-hr' }, hand(17, -94, 14, 18)));
    if (name) {
      front += at(cx, 0, ck, ao(0, 58, 56, 6, 0.4) + Pa('M-50 22H50L44 56H-44Z', u('paper')) + R(-50, 20, 100, 5, 2, V('paper-shade')) +
        Tm(0, 47, 17, name, { style: 'font-weight:800;letter-spacing:.06em' }));
    }
    return { b: back, f: at(x, y, s, G({ 'class': 'in-mf' }, front)) };
  }
  function members(list) { var b = '', fr = ''; list.forEach(function (m) { var r = member.apply(null, m); b += r.b; fr += r.f; }); return { b: b, f: fr }; }

  // Father Christmas from scene.js (identical to the game), anchored at his body bottom centre.
  // o.legs adds trousers and boots for walking (anchor = boot soles); o.lap a laptop carried in front; o.chair his chair.
  function fc(x, y, s, o) {
    o = o || {};
    var art = NP.scene && NP.scene.fcArt ? NP.scene.fcArt({ chair: o.chair }) : '';
    var legs = '';
    if (o.legs) {
      var leg = function (lx, c) { return G({ 'class': c }, R(lx - 11, 186, 22, 38, 9, M('pole-red-dark', 'night-900', 78)) + R(lx - 11, 186, 5, 34, 2.5, V('lamp'), O(0.25)) + Pa('M' + (lx - 14) + ' 236V226C' + (lx - 14) + ' 218 ' + (lx + 2) + ' 216 ' + (lx + 10) + ' 220C' + (lx + 22) + ' 224 ' + (lx + 24) + ' 230 ' + (lx + 24) + ' 236Z', 'url(#in-boot)') + R(lx - 10, 220, 14, 3, 1.5, V('lamp'), O(0.45))); };
      legs = ao(262, 236, 64, 6, 0.55) + leg(244, 'in-lg1') + leg(282, 'in-lg2');
    }
    var lap = o.lap ? G({ 'class': 'in-lap' }, lit(rr(268, 160, 76, 50, 6), u('metal'), null, 1.4) + R(270, 203, 72, 5, 2, V('board-dark'), O(0.6)) + C(306, 184, 6, V('snow'), O(0.18))) : '';
    var ay = o.legs ? 236 : 201;
    return G({ 'class': 'in-fcpos ' + (o.cls || '') }, at(x, y, s, G({ transform: 'translate(-262 -' + ay + ')' }, G({ 'class': 'in-fc', style: 'transform-origin:262px ' + ay + 'px' }, legs + art + lap))));
  }
  function fcSet(root, o) {
    var t = function (sel, off) { qa(root, sel).forEach(function (n) { n.classList.toggle('sc-off', off); }); };
    if (o.fz != null) {
      var st = o.fz;
      qa(root, '.sc-fz').forEach(function (n) { var m = /sc-fz(\d)/.exec(n.getAttribute('class')); n.classList.toggle('sc-off', st < +m[1]); });
      t('.sc-beard0', st >= 2); t('.sc-beard2', st < 2); t('.sc-hat0', st >= 3); t('.sc-hat3', st < 3); t('.sc-sweat', st < 1);
      qa(root, '.sc-hat').forEach(function (n) { n.style.transform = st >= 3 ? 'translate(1px,2px) rotate(9deg)' : st >= 2 ? 'rotate(8deg)' : ''; });
    }
    if (o.eyes) qa(root, '.sc-eye').forEach(function (n) { n.classList.toggle('sc-off', !n.classList.contains('sc-eye-' + o.eyes)); });
  }
  function brows(S, up, ms) {
    var a = up > 0 ? ['translateY(-5px) rotate(-10deg)', 'translateY(-5px) rotate(10deg)'] : up < 0 ? ['translateY(2px) rotate(14deg)', 'translateY(2px) rotate(-14deg)'] : ['none', 'none'];
    anim(S.q('.sc-brow-l'), [{ transform: a[0] }], { duration: ms || 200 });
    anim(S.q('.sc-brow-r'), [{ transform: a[1] }], { duration: ms || 200 });
  }

  // Elf: 2 heads tall, pointed green hood, dot eyes (§9.4). Anchor = body bottom centre.
  function elf(x, y, s) {
    var hood = 'M-44-100C-54-150-28-196 8-214C30-226 54-226 66-212C44-210 30-198 34-170C44-148 48-124 44-100Z';
    var e = ao(0, 4, 54, 6, 0.4) +
      lit('M-42 0C-46-42-36-82 0-86C36-82 46-42 42 0Z', u('green'), null, 2.4) +
      Pa('M10-84C34-78 44-44 42 0H22C26-34 22-66 10-84Z', V('night-900'), O(0.2)) +
      Pa('M-30-82L0-60L30-82C20-88-20-88-30-82Z', u('fur')) +
      lit(hood, u('green'), null, 2.4) + Pa('M30-170C34-196 50-212 66-212C54-206 44-196 42-178Z', V('pole-green-dark'), O(0.6)) +
      lit(el(0, -116, 39, 41), M('pole-green', 'pole-green-dark', 45), null, 1.6) +
      lit(el(0, -112, 31, 32), u('skin'), null, 1.4) +
      E(4, -92, 20, 7, M('lamp-deep', 'paper', 30), O(0.25)) +
      G({ 'class': 'in-eeyes' }, C(-11, -114, 4.8, V('ink')) + C(11, -114, 4.8, V('ink')) + C(-12.4, -115.6, 1.3, V('snow')) + C(9.6, -115.6, 1.3, V('snow'))) +
      C(0, -103, 4.2, M('lamp-deep', 'pole-red', 66)) +
      lit(el(66, -212, 10, 10), u('fur'), null, 1.4);
    return G({ 'class': 'in-elf' }, at(x, y, s, G({ 'class': 'in-elfb' }, e)));
  }
  function mitten(x, y, s, flip) {
    return at(x, y, s, G({ transform: flip ? 'scale(-1 1)' : null }, ao(0, 10, 30, 5, 0.5) + R(-34, -4, 26, 20, 8, u('rib')) +
      lit(el(4, 0, 26, 18), u('mred'), null, 1.6) + Pa(el(4, 0, 26, 18), u('knit')) + E(-2, -6, 10, 5, V('snow'), O(0.14))));
  }

  /* ---------- props ---------- */
  function snow(W, H, n) {
    var s = '', dep = [[0.5, 1.2, 46, 0.45], [0.33, 2.2, 90, 0.65], [0.17, 3.6, 170, 0.85]], k = W > 1000 ? 1.2 : 2.1;
    dep.forEach(function (d, li) {
      var fl = '', cnt = Math.round(n * d[0]);
      for (var i = 0; i < cnt; i++) {
        var x = rnd() * W, y = rnd() * H, r = d[1] * k * (0.8 + rnd() * 0.4);
        fl += C(x, y, r, V('snow'), { opacity: d[3] }) + C(x, y - H, r, V('snow'), { opacity: d[3] });
      }
      s += G({ 'class': 'in-sway', 'data-a': 10 + li * 8 }, G({ 'class': 'in-snowl', 'data-d': Math.round(H / d[2] * 1000), 'data-h': H }, fl));
    });
    return G({ 'class': 'in-snow' }, s);
  }
  function snowRun(S) {
    S.at(0, function () {
      S.qa('.in-snowl').forEach(function (l) { anim(l, [{ transform: 'translateY(0)' }, { transform: 'translateY(' + l.getAttribute('data-h') + 'px)' }], { duration: +l.getAttribute('data-d'), iterations: Infinity, fill: 'none' }); });
      S.qa('.in-sway').forEach(function (l, i) { var a = +l.getAttribute('data-a'); anim(l, [{ transform: 'translateX(' + -a + 'px)' }, { transform: 'translateX(' + a + 'px)' }], { duration: 2600 + i * 700, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out', fill: 'none' }); });
    });
  }
  function stars(W, y0, y1, n) { var s = ''; for (var i = 0; i < n; i++) s += C(rnd() * W, y0 + rnd() * (y1 - y0), 0.8 + rnd() * 2, V('snow'), { opacity: f(0.25 + rnd() * 0.6) }); return s; }
  function pendant(x, y, op) {
    return glow(x, y + 60, 300, 230, op || 0.32) + R(x - 1.5, -10, 3, y + 10, 0, V('board-dark')) +
      lit('M' + (x - 46) + ' ' + (y + 30) + 'C' + (x - 40) + ' ' + y + ' ' + (x + 40) + ' ' + y + ' ' + (x + 46) + ' ' + (y + 30) + 'Z', u('gold'), null, 1.4) +
      E(x, y + 30, 40, 7, V('lamp')) + glow(x, y + 34, 70, 30, 0.8);
  }
  function cityWin(x, y, w, h) {
    var s = Pa(rr(x, y, w, h, 6), M('board-dark', 'night-900', 60)) + R(x + 8, y + 8, w - 16, h - 16, 3, 'url(#in-night)');
    seed = 41;
    for (var i = 0; i < 4; i++) {
      var bw = w * (0.18 + rnd() * 0.2), bx = x + 8 + rnd() * (w - 16 - bw), bh = h * (0.25 + rnd() * 0.35);
      s += R(bx, y + h - 8 - bh, bw, bh, 0, 'url(#in-glassd)');
      for (var j = 0; j < 5; j++) s += R(bx + 6 + rnd() * (bw - 16), y + h - 8 - bh + 10 + rnd() * (bh - 26), 6, 9, 1, V('lamp'), O(0.55));
    }
    return s + R(x + 8, y + 8, w - 16, h - 16, 3, V('night-600'), O(0.25)) + Pa('M' + (x + 20) + ' ' + (y + 8) + 'h' + w * 0.3 + 'L' + (x + 8) + ' ' + (y + h * 0.6) + 'V' + (y + 30) + 'Z', V('snow'), O(0.06));
  }
  function slide(x, y, w, h) {
    var cx = x + w * 0.66, by = y + h * 0.8;
    return ao(x + w / 2, y + h + 10, w * 0.5, 10, 0.35) + lit(rr(x, y, w, h, 10), M('board-dark', 'night-900', 60), null, 1.6) +
      Pa(rr(x + 12, y + 12, w - 24, h - 24, 5), 'url(#in-lbox)') + R(x + 12, y + 12, w - 24, h - 24, 5, V('night-600'), O(0.22)) + glow(x + w / 2, y + h / 2, w * 0.6, h * 0.6, 0.18, 1) +
      Tx(x + w * 0.07, y + h * 0.72, h * 0.5, 'AI', { fill: V('night-600'), style: 'font-weight:900;letter-spacing:-.02em' }) +
      Ln('M' + f(x + w * 0.42) + ' ' + f(by) + 'C' + f(cx) + ' ' + f(by + 4) + ' ' + f(x + w * 0.8) + ' ' + f(by - 10) + ' ' + f(x + w * 0.88) + ' ' + f(y + h * 0.3), V('gold-dark'), h * 0.035) +
      // drawn rocket riding the curve
      at(x + w * 0.88, y + h * 0.25, h / 300, G({ transform: 'rotate(35)' },
        Pa('M-14 30C-26 50-10 70 0 84C10 70 26 50 14 30Z', V('lamp')) + Pa('M-6 32C-12 46-4 58 0 66C4 58 12 46 6 32Z', V('paper')) +
        Pa('M-16 36L-30 48V22L-16 8Z', V('pole-red-dark')) + Pa('M16 36L30 48V22L16 8Z', V('pole-red-dark')) +
        lit('M-16 36V-14C-16-38 0-56 0-56C0-56 16-38 16-14V36Z', u('red'), null, 1.4) + C(0, -8, 7, M('night-600', 'snow', 60))));
  }

  /* ---------- the boardroom (scenes 2, 5, 6) ---------- */
  var NAMES = ['CHAIR', 'MEMBER 2', 'MEMBER 3', 'MEMBER 4', 'MEMBER 5'];
  function boardroom(c, o) {
    o = o || {};
    var s = '', P = c.P, m;
    if (!P) {
      s += R(-300, 0, 2200, 720, 0, 'url(#in-room)') + glow(240, 60, 700, 420, 0.22) + cityWin(960, 90, 196, 470) + cityWin(1172, 90, 196, 470) + cityWin(1384, 90, 196, 470);
      s += R(-300, 560, 2200, 8, 0, V('night-900'), O(0.2)) + R(-300, 690, 2200, 14, 0, M('board-dark', 'night-900', 70));
      if (!o.noSlide) s += slide(330, 96, 570, 330);
      s += pendant(1250, 150);
      s += R(-300, 0, 2200, 720, 0, V('night-600'), O(0.1));
      s += R(-300, 700, 2200, 600, 0, 'url(#in-carpet)') + R(-300, 700, 2200, 3, 0, V('lamp'), O(0.12));
      m = members([[300, 614, 1, NAMES[0]], [470, 614, 1, NAMES[1]], [640, 614, 1, NAMES[2]], [810, 614, 1, NAMES[3]], [980, 614, 1, NAMES[4]]].map(function (a) { a.push({ dir: 1 }); return a; }));
      s += m.b;
      s += o.fc ? fc(1250, 622, 1.38, { chair: true }) : at(1250, 622, 1.38, G({ transform: 'translate(-262 -201)' }, lit(rr(206, 112, 112, 100, 26), u('metald'), null, 1.4)));
      s += ao(800, 744, 800, 30, 0.7);
      [150, 1420].forEach(function (lx) { s += R(lx, 720, 34, 100, 6, 'url(#in-tblf)') + ao(lx + 17, 822, 40, 6, 0.6); });
      s += Pa('M140 598H1460L1520 668H80Z', 'url(#in-tbl)') + E(420, 626, 170, 12, V('lamp'), O(0.16)) + E(800, 626, 170, 12, V('lamp'), O(0.16)) + E(1180, 626, 170, 12, V('lamp'), O(0.16)) +
        R(80, 668, 1440, 62, 0, 'url(#in-tblf)') + R(80, 667, 1440, 3, 0, V('lamp'), O(0.4)) + Pa('M140 598H1460L1462 601H138Z', V('lamp'), O(0.3));
      s += m.f;
    } else {
      s += R(0, 0, 900, 680, 0, 'url(#in-room)') + cityWin(30, 110, 150, 470) + cityWin(720, 110, 150, 470);
      if (!o.noSlide) s += slide(205, 70, 490, 300);
      s += pendant(260, 440, 0.3) + pendant(640, 440, 0.3);
      s += R(0, 0, 900, 680, 0, V('night-600'), O(0.1)) + R(0, 660, 900, 1140, 0, 'url(#in-carpet)');
      s += o.fc ? fc(450, 642, 1.25, { chair: true }) : at(450, 642, 1.25, G({ transform: 'translate(-262 -201)' }, lit(rr(206, 112, 112, 100, 26), u('metald'), null, 1.4)));
      s += ao(450, 1420, 470, 40, 0.6) + Pa('M330 620H570L880 1400H20Z', 'url(#in-tbl)') + Pa('M330 620H570L572 624H328Z', V('lamp'), O(0.4)) +
        E(450, 760, 60, 90, V('lamp'), O(0.1)) + E(450, 1100, 120, 170, V('lamp'), O(0.08)) +
        R(20, 1400, 860, 70, 0, 'url(#in-tblf)') + R(20, 1399, 860, 3, 0, V('lamp'), O(0.4));
      // shot from the end of the table: far to near, alternating sides; the chair sits nearest
      var D = [[0.1, -1, 4], [0.28, 1, 3], [0.46, -1, 2], [0.62, 1, 1], [0.8, -1, 0]];
      var list = D.map(function (d) {
        var y = 620 + 780 * d[0], sc = 0.55 + 0.7 * d[0], ex = d[1] < 0 ? 330 - 310 * d[0] - 18 * sc : 570 + 310 * d[0] + 18 * sc;
        return [ex, y + 10, f(sc), NAMES[d[2]], { dir: -d[1], cx: d[1] < 0 ? 96 : -96, ck: 1.35 }];
      });
      m = members(list);
      s += m.b + m.f;
    }
    return s;
  }
  function nod(S, n) { S.qa('.in-mh').forEach(function (h) { anim(h, [{ transform: 'translateY(0)' }, { transform: 'translateY(8px)' }, { transform: 'translateY(0)' }], { duration: 440, iterations: n || 2, easing: 'ease-in-out', fill: 'none' }); }); }
  function turn(S, on) { S.qa('.in-mh').forEach(function (h) { anim(h.parentNode, [{ transform: on ? 'translateX(' + 7 * h.getAttribute('data-dir') + 'px) rotate(' + 2 * h.getAttribute('data-dir') + 'deg)' : 'none' }], { duration: 300, easing: 'ease-out' }); }); }
  function speak(S, i) { var b = S.qa('.in-mb')[i]; anim(b && b.parentNode, [{ transform: 'translateY(0)' }, { transform: 'translateY(-6px)' }, { transform: 'translateY(0)' }], { duration: 320, iterations: 3, fill: 'none' }); }
  function clap(S) {
    S.qa('.in-hrest').forEach(function (n) { anim(n, [O(1), O(0)], { duration: 120 }); });
    S.qa('.in-hclap').forEach(function (n) { anim(n, [O(0), O(1)], { duration: 120 }); });
    S.qa('.in-hl').forEach(function (n) { anim(n, [{ transform: 'translateX(-9px)' }, { transform: 'translateX(4px)' }], { duration: 230, iterations: Infinity, direction: 'alternate', easing: 'ease-in', fill: 'none' }); });
    S.qa('.in-hr').forEach(function (n) { anim(n, [{ transform: 'translateX(9px)' }, { transform: 'translateX(-4px)' }], { duration: 230, iterations: Infinity, direction: 'alternate', easing: 'ease-in', fill: 'none' }); });
  }

  /* =====================================================================
     SCENES (landscape viewBox 1600x1000, portrait 900x1800; captions sit over the bottom ~18%)
     ===================================================================== */
  // 1. Cold open: snowy night, the camera drops to the glass office block
  function s1(c) {
    var P = c.P, W = c.W, bx = P ? 450 : 800, bw = P ? 400 : 440, top = P ? 640 : 400, gy = P ? 1380 : 915, D = P ? 900 : 700;
    seed = 7;
    var l0 = R(-200, -1300, W + 400, 1300 + c.H, 0, 'url(#in-night)') + stars(W, -1250, top + 80, P ? 70 : 90) +
      glow(W * 0.78, -540, 220, 220, 0.3, 1) + C(W * 0.78, -540, 44, V('snow')) + C(W * 0.78 + 14, -548, 38, M('snow', 'snow-shade', 30));
    var my = gy - (P ? 330 : 300);
    var l1 = Pa('M-100 ' + (my + 150) + 'L' + W * 0.08 + ' ' + (my - 10) + 'L' + W * 0.17 + ' ' + (my + 80) + 'L' + W * 0.27 + ' ' + (my - 50) + 'L' + W * 0.38 + ' ' + (my + 90) + 'L' + W * 0.48 + ' ' + my + 'L' + W * 0.57 + ' ' + (my + 80) + 'L' + W * 0.68 + ' ' + (my - 40) + 'L' + W * 0.79 + ' ' + (my + 70) + 'L' + W * 0.89 + ' ' + (my - 20) + 'L' + (W + 100) + ' ' + (my + 110) + 'V' + (c.H + 200) + 'H-100Z', 'url(#in-ice)') +
      R(-100, my - 60, W + 200, c.H, 0, V('night-600'), O(0.4));
    var l2 = '';
    (P ? [[10, 180, 360], [120, 120, 250], [700, 130, 300], [800, 140, 420]] : [[60, 170, 300], [210, 130, 220], [330, 150, 380], [1150, 140, 340], [1290, 160, 250], [1440, 150, 400]]).forEach(function (b) {
      var y = gy - b[2];
      l2 += R(b[0], y, b[1], b[2] + 80, 0, 'url(#in-glassd)') + R(b[0], y - 6, b[1], 8, 3, V('snow-shade'), O(0.7));
      for (var i = 0; i < 6; i++) l2 += R(b[0] + 12 + rnd() * (b[1] - 34), y + 20 + rnd() * (b[2] - 40), 12, 16, 2, V('lamp'), O(0.6));
    });
    l2 += R(-100, gy - 460, W + 200, 600, 0, V('night-600'), O(0.28));
    var x0 = bx - bw / 2, win = '', cols = P ? 5 : 6, cw = (bw - 40) / cols;
    for (var r = 0; top + 50 + r * 64 < gy - 70; r++) for (var k = 0; k < cols; k++) {
      var on = rnd() > 0.28;
      win += R(x0 + 24 + k * cw, top + 44 + r * 64, cw - 16, 40, 3, on ? 'url(#in-win)' : V('night-600'), { opacity: on ? 0.95 : 0.7 });
    }
    var sw = P ? 600 : 560, fs = P ? 58 : 60;
    var l3 = glow(bx, top - 60, sw * 0.8, 200, 0.4) +
      Pa('M' + (x0 + bw) + ' ' + top + 'L' + (x0 + bw + 50) + ' ' + (top + 24) + 'V' + (gy + 40) + 'H' + (x0 + bw) + 'Z', 'url(#in-glassd)') +
      lit(rr(x0, top, bw, gy - top + 60, 6), 'url(#in-glass)', null, 2.4) + win +
      Pa('M' + (x0 + 30) + ' ' + top + 'h' + bw * 0.35 + 'L' + x0 + ' ' + (top + bw * 0.9) + 'V' + (top + 40) + 'Z', V('snow'), O(0.06)) +
      R(bx - 50, gy - 92, 100, 96, 4, 'url(#in-win)') + R(bx - 2, gy - 92, 4, 96, 0, V('lamp-deep')) + glow(bx, gy - 20, 200, 60, 0.6) +
      R(x0 - 8, top - 12, bw + 16, 20, 10, u('fur')) +
      R(bx - sw * 0.33, top - 70, 8, 64, 0, V('board-dark')) + R(bx + sw * 0.33 - 8, top - 70, 8, 64, 0, V('board-dark')) +
      lit(rr(bx - sw / 2, top - 168, sw, 104, 14), u('gold'), null, 2) + Pa(rr(bx - sw / 2 + 9, top - 159, sw - 18, 86, 9), 'url(#in-lbox)') +
      Tm(bx, top - 95, fs, 'NORTH POLE LTD', { fill: V('pole-red'), style: 'font-weight:900;letter-spacing:.03em' }) +
      R(bx - sw / 2 + 14, top - 172, sw - 28, 12, 6, u('fur'));
    var gnd = ao(bx + 20, gy + 8, bw * 0.7, 18, 0.55) + Pa('M-100 ' + (gy + 10) + 'C' + W * 0.25 + ' ' + (gy - 20) + ' ' + W * 0.6 + ' ' + (gy + 4) + ' ' + (W + 100) + ' ' + (gy - 16) + 'V' + (c.H + 300) + 'H-100Z', u('fur')) + glow(bx, gy + 30, 240, 34, 0.5);
    var pine = function (x, y, h) {
      var w = h * 0.42, s = ao(x, y, w * 0.8, 10, 0.5) + R(x - 8, y - 30, 16, 32, 3, V('wood-dark'));
      for (var i = 0; i < 3; i++) { var ty = y - 20 - i * h * 0.28, tw = w * (1 - i * 0.24); s += lit('M' + (x - tw) + ' ' + ty + 'L' + x + ' ' + (ty - h * 0.42) + 'L' + (x + tw) + ' ' + ty + 'Z', 'url(#in-pine)', null, 2.4) + Pa('M' + (x - tw * 0.5) + ' ' + (ty - h * 0.2) + 'L' + x + ' ' + (ty - h * 0.42) + 'L' + (x - tw * 0.1) + ' ' + (ty - h * 0.18) + 'Z', V('snow'), O(0.55)); }
      return s;
    };
    var l4 = P ? pine(40, gy + 70, 380) + pine(860, gy + 90, 300) : pine(140, gy + 80, 380) + pine(1480, gy + 70, 320) + pine(1350, gy + 90, 220);
    return {
      m: G({ 'class': 'in-cam' }, G({ 'class': 'in-l0' }, l0) + G({ 'class': 'in-l1' }, l1) + G({ 'class': 'in-l2' }, l2) + G({ 'class': 'in-l3' }, l3 + gnd) + G({ 'class': 'in-l4' }, l4)) + (c.red ? '' : snow(W, c.H, P ? 60 : 120)),
      run: function (S) {
        S.at(0, function () {
          [['.in-l0', 0.3], ['.in-l1', 0.55], ['.in-l2', 0.78], ['.in-l3', 1], ['.in-l4', 1.25]].forEach(function (l) {
            anim(S.q(l[0]), [{ transform: 'translateY(' + D * l[1] + 'px)' }, { transform: 'translateY(0)' }], { duration: 1850, easing: 'cubic-bezier(.45,0,.2,1)' });
          });
        });
        snowRun(S);
      }
    };
  }

  // 2. The boardroom
  function s2(c) {
    var cx = c.P ? 450 : 800, cy = c.P ? 700 : 480;
    return {
      m: G({ 'class': 'in-cam' }, boardroom(c, { fc: true })),
      run: function (S) {
        S.at(0, function () { fcSet(S.sv, { fz: 0, eyes: 'open' }); anim(S.q('.in-cam'), [{ transform: camT(cx, cy, 1) }, { transform: camT(cx, cy, 1.08) }], { duration: 12000, easing: 'ease-in-out' }); });
        S.at(900, function () { speak(S, 0); });
        S.at(1900, function () { nod(S, 2); });
        S.at(3600, function () { speak(S, 1); });
        S.at(4500, function () { nod(S, 1); });
        S.at(6600, function () { turn(S, 1); fcSet(S.sv, { eyes: 'half' }); brows(S, -1); });
        S.at(9000, function () { turn(S, 0); fcSet(S.sv, { eyes: 'open' }); brows(S, 0); });
        S.at(9300, function () { speak(S, 2); });
        S.at(10300, function () { nod(S, 3); fcSet(S.sv, { eyes: 'wide' }); brows(S, 1); });
      }
    };
  }

  // 3. The edict: the scroll unrolls down the table, the stamp slams
  function s3(c) {
    var P = c.P, W = c.W, H = c.H, s = '', cx = W / 2, wy = P ? 400 : 360;
    s += R(-200, 0, W + 400, wy + 20, 0, 'url(#in-room)') + pendant(P ? 450 : 800, 40, 0.3);
    var row = [];
    for (var i = 0; i < 5; i++) row.push([cx + (i - 2) * (P ? 132 : 150), wy + 14, P ? 0.56 : 0.7, null, { noRest: true }]);
    var m = members(row);
    s += m.b + R(-200, 0, W + 400, wy + 20, 0, V('night-600'), O(0.32));
    s += Pa('M-200 ' + wy + 'H' + (W + 200) + 'V' + (H + 200) + 'H-200Z', 'url(#in-tbl)') + R(0, wy, W, 6, 0, V('lamp'), O(0.3)) +
      E(cx, wy + 70, W * 0.4, 40, V('lamp'), O(0.1)) + R(0, wy + 4, W, 30, 0, V('night-900'), O(0.2));
    // the scroll
    var pw = P ? 600 : 480, ph = P ? 660 : 480, x0 = cx - pw / 2, y0 = wy + 34, k = P ? 1.2 : 1;
    var paper = Pa(rr(x0, y0, pw, ph, 4), u('paper')) + R(x0, y0, pw, ph, 0, u('shadel'), O(0.35)) +
      Tm(cx, y0 + 108 * k, 78 * k, 'EDICT', { style: 'font-weight:900;letter-spacing:.14em' }) +
      R(cx - 120 * k, y0 + 132 * k, 240 * k, 4, 2, V('pole-red'), O(0.8)) +
      Tm(cx, y0 + 196 * k, 40 * k, 'CHRISTMAS WILL BE', { style: 'font-weight:800;letter-spacing:.04em' }) +
      Tm(cx, y0 + 290 * k, 82 * k, 'AI-FIRST.', { fill: V('pole-red'), style: 'font-weight:900' }) +
      Tm(cx, y0 + 344 * k, 24 * k, 'By order of the board', { fill: V('ink-soft'), style: 'font-style:italic;font-weight:600' });
    var sy = y0 + ph - 70 * k;
    var mark = G({ 'class': 'in-mark', opacity: 0 }, at(cx, sy, k, G({ transform: 'rotate(-8)', opacity: 0.88 },
      Pa(rr(-150, -42, 300, 84, 10), 'none', { stroke: V('pole-red'), 'stroke-width': 7 }) + Pa(rr(-138, -30, 276, 60, 6), 'none', { stroke: V('pole-red'), 'stroke-width': 2.5 }) +
      Tm(0, 17, 46, 'APPROVED', { fill: V('pole-red'), style: 'font-weight:900;letter-spacing:.1em' }) +
      C(-90, -10, 5, V('paper')) + C(60, 22, 4, V('paper')) + C(110, -20, 3, V('paper')) + R(-40, 30, 30, 4, 2, V('paper')))));
    var clip = 'in-cl' + c.i;
    s += T('clipPath', { id: clip }, R(x0 - 60, y0 - 4, pw + 120, ph + 60, 0, V('ink')));
    s += ao(cx, y0 + ph + 12, pw * 0.6, 14, 0.4);
    s += G({ 'clip-path': 'url(#' + clip + ')' }, G({ 'class': 'in-unroll' }, ao(cx + 10, y0 + 30, pw * 0.56, 22, 0.25) + paper + mark));
    var roll = function (y) { return ao(cx, y + 26, pw * 0.58, 8, 0.5) + lit(rr(x0 - 26, y - 20, pw + 52, 40, 20), u('paper'), null, 1.6) + R(x0 - 26, y + 4, pw + 52, 14, 7, V('paper-shade'), O(0.8)) + lit(rr(x0 - 46, y - 24, 26, 48, 10), u('gold'), null, 1.2) + lit(rr(x0 + pw + 20, y - 24, 26, 48, 10), u('gold'), null, 1.2); };
    s += G({ 'class': 'in-roll' }, roll(y0 + ph));
    s += roll(y0 - 6);
    // the stamp
    s += G({ 'class': 'in-stsh', opacity: 0 }, ao(cx, sy + 6, 170 * k, 22, 0.7));
    s += G({ 'class': 'in-stamp' }, at(cx, sy + 42 * k, k, G({ 'class': 'in-stsq' },
      R(-150, -34, 300, 34, 8, 'url(#in-rub)') + lit(rr(-140, -96, 280, 66, 14), u('wood'), null, 2) + R(-140, -42, 280, 10, 0, V('wood-dark'), O(0.5)) +
      lit(rr(-26, -230, 52, 140, 16), u('wood'), null, 2) + lit(el(0, -262, 58, 50), u('wood'), null, 2.4) + E(-20, -282, 20, 11, V('lamp'), { opacity: 0.35, transform: 'rotate(-25 -20 -282)' }))));
    // Father Christmas reads it from the end of the table
    var fx = P ? 710 : 1360, fy = P ? 1450 : 935, fsc = P ? 1.55 : 1.7;
    s += glow(fx, fy - 200, 260, 220, 0.3) + fc(fx, fy, fsc, { cls: 'in-fc3' });
    var ey = P ? 1410 : 900;
    s += R(-100, ey, W + 200, 400, 0, 'url(#in-tblf)') + R(-100, ey, W + 200, 4, 0, V('lamp'), O(0.35));
    var pcx = P ? 450 : 800, pcy = P ? 760 : 620;
    return {
      m: G({ 'class': 'in-cam' }, G({ 'class': 'in-shake' }, s)),
      run: function (S) {
        var cam = S.q('.in-cam'), stamp = S.q('.in-stamp');
        S.at(0, function () {
          fcSet(S.sv, { fz: 0, eyes: 'open' });
          anim(S.q('.in-unroll'), [{ transform: 'translateY(' + -ph + 'px)' }, { transform: 'translateY(' + -ph + 'px)', offset: 0.2 }, { transform: 'translateY(0)' }], { duration: 1500, easing: 'cubic-bezier(.3,.1,.3,1)' });
          anim(S.q('.in-roll'), [{ transform: 'translateY(' + -ph + 'px)' }, { transform: 'translateY(' + -ph + 'px)', offset: 0.2 }, { transform: 'translateY(0)' }], { duration: 1500, easing: 'cubic-bezier(.3,.1,.3,1)' });
          anim(stamp, [{ transform: 'translateY(-1400px)' }], { duration: 1 });
          anim(cam, [{ transform: camT(pcx, pcy, 1) }, { transform: camT(pcx, pcy, 1.04) }], { duration: 3300, easing: 'ease-in-out' });
        });
        S.at(1700, function () {
          anim(stamp, [{ transform: 'translateY(-1400px)', easing: 'cubic-bezier(.2,.8,.2,1)' }, { transform: 'translateY(-70px)', offset: 0.55 },
            { transform: 'translateY(-78px)', offset: 0.83, easing: 'cubic-bezier(.5,0,.75,0)' }, { transform: 'translateY(0)' }], { duration: 700 });
          anim(S.q('.in-stsh'), [O(0), { opacity: 0.6, offset: 0.6 }, O(1)], { duration: 700 });
        });
        S.at(2400, function () {
          anim(S.q('.in-mark'), [O(0), O(1)], { duration: 40 });
          anim(S.q('.in-stsq'), [{ transform: 'scale(1.04,.9)' }, { transform: 'scale(1)' }], { duration: 160, easing: 'cubic-bezier(.34,1.56,.64,1)' });
          anim(S.q('.in-shake'), [{ transform: 'translate(3px,-2px)' }, { transform: 'translate(-3px,2px)' }, { transform: 'translate(2px,1px)' }, { transform: 'translate(-1px,-1px)' }, { transform: 'none' }], { duration: 150 });
          nod(S, 1);
        });
        S.at(3000, function () {
          anim(stamp, [{ transform: 'translateY(0)' }, { transform: 'translateY(-1400px)' }], { duration: 520, easing: 'cubic-bezier(.5,0,.75,0)' });
          anim(S.q('.in-stsh'), [O(1), O(0)], { duration: 300 });
        });
        S.at(3400, function () { anim(cam, [{ transform: camT(pcx, pcy, 1.04) }, { transform: camT(pcx, pcy, 1.07, P ? -40 : -110, P ? -110 : -24) }], { duration: 1300, easing: 'cubic-bezier(.45,0,.2,1)' }); });
        S.at(3900, function () {
          fcSet(S.sv, { eyes: 'wide' }); brows(S, 1);
          anim(S.q('.in-fc3 .sc-head'), [{ transform: 'rotate(-7deg) translate(-2px,2px)' }], { duration: 300 });
        });
        S.at(6200, function () { speak(S, 0); fcSet(S.sv, { eyes: 'half' }); brows(S, -1); });
        S.at(7400, function () { nod(S, 2); });
      }
    };
  }

  // 4. The grind: day and night through the window, calendar 2 -> 22 Dec, mugs, sticky notes, frazzle
  var NOTES = ['prompt', 'prompt v2', 'prompt v3 (better)', 'PROMPT FINAL', 'FINAL final', 'PROMPT FINAL final v7'];
  function s4(c) {
    var P = c.P, W = c.W, H = c.H, s = '';
    var wx = P ? 70 : 150, wy = P ? 150 : 110, ww = P ? 380 : 420, wh = P ? 420 : 460;
    var kx = P ? 530 : 1200, ky = P ? 170 : 130, kw = P ? 280 : 240, kh = P ? 320 : 290;
    var dy = P ? 1190 : 712, fx = P ? 410 : 780, fsc = P ? 2.5 : 2.3;
    s += R(0, 0, W, H, 0, 'url(#in-warm)');
    for (var i = 0; i < W; i += 120) s += R(i, 0, 3, dy, 0, V('night-900'), O(0.08));
    s += glow(fx - 120, dy - 360, P ? 520 : 640, P ? 520 : 460, 0.42);
    // window
    var px0 = wx + 20, py0 = wy + 20, pw = ww - 40, ph = wh - 40;
    var roofs = function (col, op) { return Pa('M' + px0 + ' ' + (py0 + ph * 0.72) + 'L' + (px0 + pw * 0.2) + ' ' + (py0 + ph * 0.6) + 'L' + (px0 + pw * 0.4) + ' ' + (py0 + ph * 0.72) + 'V' + (py0 + ph * 0.66) + 'L' + (px0 + pw * 0.62) + ' ' + (py0 + ph * 0.52) + 'L' + (px0 + pw * 0.84) + ' ' + (py0 + ph * 0.66) + 'L' + (px0 + pw) + ' ' + (py0 + ph * 0.6) + 'V' + (py0 + ph) + 'H' + px0 + 'Z', col, { opacity: op }); };
    s += lit(rr(wx, wy, ww, wh, 10), u('wood'), null, 2.2);
    s += R(px0, py0, pw, ph, 3, u('sky'));
    seed = 19;
    for (i = 0; i < 14; i++) s += C(px0 + rnd() * pw, py0 + rnd() * ph * 0.5, 1 + rnd() * 1.5, V('snow'), O(0.7));
    s += C(px0 + pw * 0.75, py0 + ph * 0.2, 22, V('snow')) + C(px0 + pw * 0.75 + 8, py0 + ph * 0.2 - 5, 19, M('snow', 'night-600', 25)) + roofs(M('snow-shade', 'night-600', 55), 1);
    s += G({ 'class': 'in-day', opacity: 0 }, R(px0, py0, pw, ph, 3, 'url(#in-day)') + glow(px0 + pw * 0.3, py0 + ph * 0.25, 120, 120, 0.9) + C(px0 + pw * 0.3, py0 + ph * 0.25, 26, V('lamp')) + roofs(V('snow'), 1));
    s += R(px0 + pw / 2 - 5, py0, 10, ph, 0, V('wood-dark')) + R(px0, py0 + ph / 2 - 5, pw, 10, 0, V('wood-dark')) + Pa('M' + px0 + ' ' + py0 + 'h' + pw * 0.4 + 'L' + px0 + ' ' + (py0 + ph * 0.5) + 'Z', V('snow'), O(0.07));
    s += ao(wx + ww / 2, wy + wh + 30, ww * 0.55, 10, 0.5) + lit(rr(wx - 16, wy + wh - 6, ww + 32, 28, 6), u('wood'), null, 1.6);
    // calendar
    s += ao(kx + kw / 2 + 8, ky + kh + 8, kw * 0.5, 8, 0.4) + C(kx + kw / 2, ky - 12, 7, u('metal'));
    s += lit(rr(kx, ky, kw, kh, 8), u('paper'), null, 2) + Pa('M' + kx + ' ' + (ky + 8) + 'A8 8 0 0 1 ' + (kx + 8) + ' ' + ky + 'H' + (kx + kw - 8) + 'A8 8 0 0 1 ' + (kx + kw) + ' ' + (ky + 8) + 'V' + (ky + 66) + 'H' + kx + 'Z', u('red')) +
      Tm(kx + kw / 2, ky + 48, 38, 'DEC', { fill: V('paper'), style: 'font-weight:900;letter-spacing:.16em' }) +
      C(kx + kw * 0.3, ky + 10, 5, V('pole-red-dark')) + C(kx + kw * 0.7, ky + 10, 5, V('pole-red-dark')) +
      Tx(kx + kw / 2, ky + kh - 46, kh * 0.5, '2', { 'class': 'in-t in-num', 'text-anchor': 'middle', style: 'font-weight:900;letter-spacing:-.03em' });
    s += G({ 'class': 'in-tear', opacity: 0 }, Pa(rr(kx, ky + 66, kw, kh - 66, 6), u('paper')) + Tx(kx + kw / 2, ky + kh - 46, kh * 0.5, '1', { 'class': 'in-t in-tnum', 'text-anchor': 'middle', style: 'font-weight:900;letter-spacing:-.03em' }));
    // notes slots
    var NS_L = [[1050, 300, -5, 1], [660, 200, 4, 1], [1090, 460, -3, 1], [215, 680, 6, 1], [1330, 560, -6, 1], [1040, 616, -2, 1.25]];
    var NS_P = [[720, 560, -5, 1], [220, 650, 4, 1], [640, 700, -3, 1], [178, 740, 6, 1], [730, 860, -4, 1], [660, 1085, -2, 1]];
    // Father Christmas, the laptop (lid back to us), glow on his face
    s += fc(fx, dy, fsc, { cls: 'in-fc4' });
    var lx = P ? 520 : 920, lw = P ? 280 : 240, lh = P ? 190 : 166, ly = dy - lh - 6;
    s += glow(fx + 40, dy - 220 * fsc / 2.3, 220, 190, 0.32, 1).replace('<ellipse', '<ellipse class="in-sglow"');
    s += R(0, dy, W, 28, 0, u('desktop')) + R(0, dy, W, 3, 0, V('lamp'), O(0.4)) + R(0, dy + 28, W, H, 0, u('woodd')) + R(0, dy + 28, W, 18, 0, V('night-900'), O(0.3));
    s += ao(lx + lw / 2, dy + 14, lw * 0.62, 8, 0.6) + Pa('M' + (lx - 14) + ' ' + (dy - 6) + 'H' + (lx + lw + 14) + 'L' + (lx + lw + 22) + ' ' + (dy + 12) + 'H' + (lx - 22) + 'Z', u('metald')) +
      lit(rr(lx, ly, lw, lh, 12), u('metal'), null, 2) + Pa('M' + (lx + 14) + ' ' + (ly + 8) + 'h' + lw * 0.3 + 'L' + (lx + 14) + ' ' + (ly + lh * 0.7) + 'Z', V('snow'), O(0.08)) +
      glow(lx + lw / 2, ly - 6, lw * 0.6, 26, 0.5, 1) + glow(lx + lw / 2, dy + 18, lw * 0.7, 18, 0.35, 1);
    // mugs (a pyramid that grows)
    var mpos = [], mb = P ? [60, 64, 4] : [420, 74, 4], ms = P ? 1.6 : 1.7, cols = ['paper', 'pole-green', 'gold', 'board', 'pole-red-dark', 'snow-shade', 'lamp-deep', 'paper', 'pole-green', 'gold'];
    for (var row = 0; row < 4; row++) for (var j = 0; j < 4 - row; j++) mpos.push([mb[0] + (j + row / 2) * mb[1], dy + 4 - row * 30 * ms]);
    mpos.forEach(function (p, n) {
      var cc = cols[n];
      s += G({ 'class': 'in-mug', opacity: 0 }, at(p[0], p[1], ms, ao(0, 0, 22, 4, 0.55) + Ln('M12-25C24-25 24-8 12-9', M(cc, 'night-900', 70), 5) +
        lit(rr(-15, -30, 30, 30, 5), V(cc), null, 1.2) + Pa('M3-30h7a5 5 0 0 1 5 5v20a5 5 0 0 1-5 5h-7Z', V('night-900'), O(0.22)) +
        R(-11, -25, 4, 18, 2, V('snow'), O(0.32)) + E(0, -30, 15, 4, M(cc, 'snow', 70)) + E(0, -29.5, 12, 2.8, V('wood-dark'))));
    });
    (P ? NS_P : NS_L).forEach(function (n, idx) {
      var t = NOTES[idx], big = idx === 5, w = big ? 210 : Math.max(120, t.length * 15 + 40), h = big ? 124 : 82, lines = big ? ['PROMPT FINAL', 'final v7'] : [t];
      var inner = ao(4, h / 2 + 6, w * 0.5, 5, 0.4) + Pa('M' + -w / 2 + ' ' + -h / 2 + 'H' + w / 2 + 'V' + (h / 2 - 14) + 'L' + (w / 2 - 14) + ' ' + h / 2 + 'H' + -w / 2 + 'Z', u('sticky')) +
        Pa('M' + w / 2 + ' ' + (h / 2 - 14) + 'L' + (w / 2 - 14) + ' ' + h / 2 + 'Q' + (w / 2 - 11) + ' ' + (h / 2 - 11) + ' ' + w / 2 + ' ' + (h / 2 - 14) + 'Z', M('gold', 'lamp', 70)) +
        R(-w / 2, -h / 2, w, 10, 0, V('gold'), O(0.25));
      lines.forEach(function (l, li) { inner += Tm(0, (lines.length === 1 ? 10 : -12 + li * 40), big ? 30 : 27, l, { 'class': 'sc-script', fill: V('ink'), style: 'font-weight:700' }); });
      s += G({ 'class': 'in-note', opacity: 0 }, at(n[0], n[1], n[3] * (P ? 1.1 : 1), G({ transform: 'rotate(' + n[2] + ')' }, inner)));
    });
    var hcx = fx, hcy = dy - 100 * fsc;
    return {
      m: G({ 'class': 'in-cam' }, s),
      run: function (S) {
        var num = S.q('.in-num'), tnum = S.q('.in-tnum'), tear = S.q('.in-tear'), ta = null;
        S.at(0, function () {
          fcSet(S.sv, { fz: 0, eyes: 'open' });
          anim(S.q('.in-cam'), [{ transform: camT(hcx, hcy, 1) }, { transform: camT(hcx, hcy, 1.06) }], { duration: 18000, easing: 'ease-in-out' });
          anim(S.q('.in-day'), [O(0), O(1), O(0)], { duration: 800, iterations: 20, delay: 500, easing: 'ease-in-out' });
          anim(S.q('.in-fc4 .sc-hand'), [{ transform: 'translateY(-4px)' }, { transform: 'translateY(1px)' }], { duration: 130, iterations: Infinity, direction: 'alternate', fill: 'none' });
          anim(S.q('.in-fc4 .sc-hand-l'), [{ transform: 'translateY(1px)' }, { transform: 'translateY(-4px)' }], { duration: 110, iterations: Infinity, direction: 'alternate', fill: 'none' });
          anim(S.q('.in-sglow'), [O(0.22), O(0.4)], { duration: 900, iterations: Infinity, direction: 'alternate', fill: 'none' });
          anim(S.q('.in-fc4 .sc-head'), [{ transform: 'translateY(2px) rotate(2deg)' }], { duration: 300 });
        });
        for (var d = 3; d <= 22; d++) (function (d) {
          S.at(500 + (d - 2) * 800, function () {
            num.textContent = d; tnum.textContent = d - 1;
            if (ta) ta.cancel();
            ta = anim(tear, [{ opacity: 1, transform: 'none' }, { opacity: 1, transform: 'translate(10px,60px) rotate(8deg)', offset: 0.5 }, { opacity: 0, transform: 'translate(30px,170px) rotate(22deg)' }], { duration: 520, easing: 'cubic-bezier(.5,0,.75,0)' });
          });
        })(d);
        S.qa('.in-mug').forEach(function (m, n) {
          S.at(900 + n * 1550, function () { anim(m, [{ opacity: 0, transform: 'translateY(-40px)' }, { opacity: 1, transform: 'translateY(0)', offset: 0.6 }, { opacity: 1, transform: 'translateY(0) scale(1)' }], { duration: 360, easing: 'cubic-bezier(.2,.8,.2,1)' }); });
        });
        S.qa('.in-note').forEach(function (m, n) {
          S.at([2000, 4700, 7500, 10300, 12500, 14600][n], function () { anim(m, [{ opacity: 0, transform: 'scale(.4)' }, { opacity: 1, transform: 'scale(1.08)', offset: 0.65 }, { opacity: 1, transform: 'scale(1)' }], { duration: 300, easing: 'cubic-bezier(.34,1.56,.64,1)' }); });
        });
        S.at(4200, function () { fcSet(S.sv, { fz: 1 }); anim(S.q('.in-fc4 .sc-sweat'), [{ transform: 'translateY(-3px)' }, { transform: 'translateY(8px)' }], { duration: 900, iterations: Infinity, fill: 'none' }); });
        S.at(6200, function () { brows(S, -1); });
        S.at(8800, function () { fcSet(S.sv, { fz: 2, eyes: 'half' }); });
        S.at(11800, function () { fcSet(S.sv, { eyes: 'wide' }); brows(S, 1); });
        S.at(13400, function () { fcSet(S.sv, { fz: 3, eyes: 'half' }); brows(S, -1); });
        S.at(15700, function () { fcSet(S.sv, { eyes: 'spiral' }); anim(S.q('.in-fc4 .sc-head'), [{ transform: 'translateY(6px) rotate(-6deg)' }], { duration: 500 }); });
      }
    };
  }

  // the trolley with the big green button (anchor: floor centre)
  function trolley(x, y, s) {
    var t = ao(0, 0, 210, 14, 0.55);
    [-128, 128].forEach(function (wx) { t += R(wx - 7, -150, 14, 128, 4, u('metald')) + C(wx, -20, 20, M('ink', 'board-dark', 60)) + C(wx, -20, 8, u('metal')); });
    t += R(-160, -66, 320, 14, 6, u('metal')) + Pa('M168-160L182-162L246-92L232-86Z', u('metald')) + E(240, -88, 13, 10, V('ink'));
    t += lit(rr(-172, -178, 344, 112, 12), u('metal'), null, 2) + R(-172, -78, 344, 12, 0, V('night-900'), O(0.25));
    t += lit(rr(-146, -166, 292, 82, 10), u('gold'), null, 1.4) + Pa(rr(-139, -159, 278, 68, 7), M('night-900', 'pole-green-dark', 70)) +
      Tm(0, -112, 42, 'TURN ON AI', { fill: V('paper'), style: 'font-weight:900;letter-spacing:.05em' });
    t += R(-180, -190, 360, 14, 7, M('board', 'snow', 66));
    t += G({ 'class': 'in-gg', opacity: 0.45 }, E(0, -250, 190, 120, 'url(#in-gg)'));
    t += lit(rr(-118, -222, 236, 34, 16), u('gold'), null, 1.6) + E(0, -222, 116, 18, M('gold', 'lamp', 55));
    t += G({ 'class': 'in-btn' }, lit('M-94-220C-94-306 94-306 94-220Z', 'url(#in-btn)', null, 2.6) + Pa('M40-286C70-276 92-252 94-220H66C66-246 58-268 40-286Z', V('night-900'), O(0.18)) +
      E(-38, -268, 28, 13, V('snow'), { opacity: 0.38, transform: 'rotate(-22 -38 -268)' }) + E(0, -220, 94, 10, V('pole-green-dark'), O(0.6)));
    return at(x, y, s, t);
  }
  // scenes 5 and 6 share the composition: boardroom, the trolley in front, Father Christmas pushing it
  function reveal(c, o) {
    var P = c.P, tx = P ? 300 : 1010, ty = P ? 1540 : 880, ts = P ? 1.1 : 1.15, fsc = 1.7;
    var fx = tx + 230 * ts + 150, fy = ty;
    var room = boardroom(c, { noSlide: o.noSlide });
    var s = (P ? at(0, -150, 1, room) : room) + glow(tx + 150, ty - 260, 520, 300, 0.25);
    s += G({ 'class': 'in-walk' }, trolley(tx, ty, ts) + fc(fx, fy, fsc, { legs: true, cls: 'in-fc5' }));
    var by = ty - 250 * ts;
    return { s: s, bx: tx, by: by, top: ty - 306 * ts, ts: ts };
  }
  function s5(c) {
    var r = reveal(c, {});
    var camS = c.P ? null : camT(800, 0, 0.86);
    return {
      m: G({ 'class': 'in-cam', style: camS ? 'transform:' + camS : null }, r.s),
      run: function (S) {
        var walk = S.q('.in-walk');
        S.at(0, function () {
          fcSet(S.sv, { fz: 3, eyes: 'half' });
          anim(S.q('.in-fc5 .sc-arm-l'), [{ transform: 'rotate(80deg)' }], { duration: 1 });
          anim(S.q('.in-fc5 .sc-arm-r'), [{ transform: 'rotate(66deg)' }], { duration: 1 });
          anim(S.q('.in-fc5 .sc-head'), [{ transform: 'translateY(4px) rotate(-4deg)' }], { duration: 1 });
          anim(walk, [{ transform: 'translateX(' + (c.P ? 760 : 900) + 'px)' }, { transform: 'translateX(0)' }], { duration: 2300, easing: 'cubic-bezier(.3,.4,.4,1)' });
          anim(S.q('.in-fc5 .in-fc'), [{ transform: 'translateY(0)' }, { transform: 'translateY(-6px)' }], { duration: 290, iterations: 8, direction: 'alternate', easing: 'ease-in-out', fill: 'none' });
          anim(S.q('.in-fc5 .in-lg1'), [{ transform: 'translate(-4px,0)' }, { transform: 'translate(5px,-6px)' }], { duration: 290, iterations: 8, direction: 'alternate', fill: 'none' });
          anim(S.q('.in-fc5 .in-lg2'), [{ transform: 'translate(5px,-6px)' }, { transform: 'translate(-4px,0)' }], { duration: 290, iterations: 8, direction: 'alternate', fill: 'none' });
        });
        S.at(2300, function () { turn(S, 1); });
        S.at(2600, function () { anim(S.q('.in-fc5 .sc-head'), [{ transform: 'translateY(9px) rotate(-7deg)' }], { duration: 500 }); anim(S.q('.in-fc5 .in-fc'), [{ transform: 'translateY(4px) scale(1.02,.97)' }], { duration: 500 }); fcSet(S.sv, { eyes: 'closed' }); });
        S.at(3800, function () { S.qa('.in-mb').forEach(function (b) { anim(b, [{ transform: 'translateY(5px)' }], { duration: 400, easing: 'ease-out' }); }); });
        S.at(4400, function () { fcSet(S.sv, { eyes: 'half' }); nod(S, 2); });
      }
    };
  }

  // 6. The press: the chair presses the button, lights, confetti, the dashboard drops in, applause
  function s6(c) {
    var P = c.P, W = c.W, H = c.H, r = reveal(c, { noSlide: true });
    var dw = P ? 660 : 520, dh = dw * 320 / 520, dx = (P ? 450 : 615) - dw / 2, dy0 = P ? 150 : 30;
    var dash = (NP.art && NP.art.titleDashboard || '').replace('<svg ', '<svg x="0" y="0" width="' + dw + '" height="' + f(dh) + '" ');
    var d = G({ 'class': 'in-dash' }, Ln('M' + f(dx + dw * 0.2) + ' -1200V' + (dy0 + 20) + 'M' + f(dx + dw * 0.8) + ' -1200V' + (dy0 + 20), M('board-dark', 'night-900', 50), 4) +
      ao(dx + dw / 2, dy0 + dh + 30, dw * 0.45, 16, 0.4) + at(dx, dy0, 1, dash));
    // the chair's hand comes in from above
    var hand = at(r.bx, r.top + 6, r.ts, G({ transform: 'rotate(32)' }, G({ 'class': 'in-press' }, lit(rr(-50, -1400, 100, 1330, 40), 'url(#in-suit)', null, 2.4) + Pa('M20-1400H50V-74H20Z', V('night-900'), O(0.22)) +
      lit(rr(-54, -92, 108, 30, 12), u('paper'), null, 1.4) + R(-54, -70, 108, 8, 0, V('paper-shade')) + lit(el(0, -40, 42, 32), 'url(#in-head)', null, 1.8) + lit(el(-4, -6, 15, 20), 'url(#in-head)', null, 1.4) + E(-14, -52, 14, 8, V('snow'), O(0.25)))));
    seed = 77;
    var conf = '', n = P ? 46 : 80, cc = ['pole-red', 'gold', 'paper', 'pole-green', 'lamp', 'snow-shade'];
    for (var i = 0; i < n; i++) {
      var w = 10 + rnd() * 10;
      conf += G({ 'class': 'in-cf', 'data-x': f(rnd() * W), 'data-dx': f((rnd() - 0.5) * 260), 'data-r': f((rnd() - 0.5) * 1100), 'data-d': Math.round(2600 + rnd() * 1800), 'data-dl': Math.round(rnd() * 2600) },
        R(-w / 2, -w * 0.3, w, w * 0.6, 2, V(cc[i % 6])));
    }
    var camS = P ? 'none' : camT(800, 0, 0.86);
    var zs = P ? 2.2 : 2.1, zoom = px(W / 2 - r.bx * zs, H * 0.42 - r.by * zs) + ' scale(' + zs + ')';
    if (!P) zoom = px(W / 2 - (800 + (r.bx - 800) * 0.86) * zs, H * 0.42 - r.by * 0.86 * zs) + ' scale(' + f(zs * 0.86) + ')';
    return {
      m: G({ 'class': 'in-cam' }, r.s + d + hand + G({ 'class': 'in-conf' }, conf)) +
        R(0, 0, W, H, 0, 'url(#in-fl)', { 'class': 'in-flash', opacity: 0 }),
      run: function (S) {
        var cam = S.q('.in-cam');
        S.at(0, function () {
          fcSet(S.sv, { fz: 3, eyes: 'half' });
          anim(S.q('.in-fc5 .sc-arm-l'), [{ transform: 'rotate(80deg)' }], { duration: 1 });
          anim(S.q('.in-fc5 .sc-arm-r'), [{ transform: 'rotate(66deg)' }], { duration: 1 });
          anim(cam, [{ transform: zoom }, { transform: zoom, offset: 0.52 }, { transform: camS === 'none' ? 'translate(0px,0px) scale(1)' : camS }], { duration: 2200, easing: 'cubic-bezier(.45,0,.2,1)' });
          anim(S.q('.in-press'), [{ transform: 'translateY(-700px)' }, { transform: 'translateY(-700px)', offset: 0.2, easing: 'cubic-bezier(.5,0,.75,0)' }, { transform: 'translateY(0)', offset: 0.55 }, { transform: 'translateY(0)', offset: 0.72, easing: 'cubic-bezier(.5,0,.75,0)' }, { transform: 'translateY(-1100px)' }], { duration: 1500 });
          anim(S.q('.in-dash'), [{ transform: 'translateY(-1300px)' }], { duration: 1 });
        });
        S.at(780, function () {
          anim(S.q('.in-btn'), [{ transform: 'scaleY(.72)' }, { transform: 'scaleY(.72)', offset: 0.5 }, { transform: 'scaleY(1)' }], { duration: 500, easing: 'cubic-bezier(.34,1.56,.64,1)' });
          anim(S.q('.in-gg'), [O(0.45), O(1)], { duration: 200 });
        });
        S.at(1000, function () {
          // 2 flashes a second for 2 seconds (SPEC §6a: under 3 per second)
          anim(S.q('.in-flash'), [O(0), O(0.32), O(0)], { duration: 500, iterations: 4, easing: 'ease-in-out' });
          S.qa('.in-cf').forEach(function (p) {
            var x = +p.getAttribute('data-x'), dx2 = +p.getAttribute('data-dx'), rr2 = +p.getAttribute('data-r');
            anim(p, [{ transform: px(x, -60) + ' rotate(0deg)' }, { transform: px(x + dx2 * 0.5, H * 0.5) + ' rotate(' + rr2 * 0.5 + 'deg)', offset: 0.5 }, { transform: px(x + dx2, H + 60) + ' rotate(' + rr2 + 'deg)' }], { duration: +p.getAttribute('data-d'), delay: +p.getAttribute('data-dl'), easing: 'linear' });
          });
        });
        S.at(1400, function () { anim(S.q('.in-dash'), [{ transform: 'translateY(-1300px)' }, { transform: 'translateY(16px)', offset: 0.7 }, { transform: 'translateY(-6px)', offset: 0.86 }, { transform: 'translateY(0)' }], { duration: 760, easing: 'cubic-bezier(.2,.8,.2,1)' }); });
        S.at(1900, function () { clap(S); fcSet(S.sv, { eyes: 'wide' }); });
        S.at(2600, function () { nod(S, 2); });
        S.at(4300, function () { nod(S, 2); fcSet(S.sv, { eyes: 'half' }); });
        S.at(6000, function () { nod(S, 3); });
      }
    };
  }

  // 7. The fallout: hard cut to the basement
  function sack(sc) {
    return ao(0, 2, 70, 8, 0.6) + lit('M-62 0C-74-44-62-92-30-104L-16-114H16L30-104C62-92 74-44 62 0Z', 'url(#in-sack)', null, 2.2) +
      Pa('M20-104C56-90 70-44 62 0H34C44-40 40-80 20-104Z', V('night-900'), O(0.18)) +
      G({ transform: 'rotate(' + sc + ' 0 -100)' }, R(-30, -132, 40, 28, 3, u('paper')) + R(-4, -138, 38, 26, 3, M('paper', 'paper-shade', 60))) +
      R(-20, -118, 40, 12, 5, V('wood-dark')) + Ln('M-40-60C-20-54 20-54 40-60', V('wood-dark'), 2.5, O(0.4));
  }
  function s7(c) {
    var P = c.P, W = c.W, H = c.H, s = '';
    var fy = P ? 1050 : 830;
    s += R(0, 0, W, fy, 0, u('wall')) + G({ transform: 'scale(2)' }, R(0, 0, W / 2, fy / 2, 0, u('brick'), O(0.3)));
    s += R(0, 40, W, 22, 11, u('pipe')) + R(0, 74, W, 14, 7, u('pipe')) + R(0, 0, W, fy, 0, M('night-600', 'basement', 50), O(0.22));
    s += R(0, fy - 10, W, H, 0, u('floor')) + R(0, fy - 10, W, 3, 0, V('basement-light'), O(0.5));
    // door + stairs (upper right), warm light from the party upstairs
    var dX = P ? 760 : 1450, dY = P ? 110 : 40, dW = P ? 130 : 130, dH = P ? 220 : 230, N = 8, sx0 = P ? 740 : 1440, sy0 = dY + dH, sdx = P ? -27.5 : -35, sdy = ((fy - 10) - sy0) / N;
    s += Pa('M' + dX + ' ' + sy0 + 'H' + (dX + dW) + 'L' + (sx0 + N * sdx + 200) + ' ' + (fy + 40) + 'H' + (sx0 + N * sdx - 160) + 'Z', V('lamp'), O(0.07));
    s += R(dX - 12, dY - 12, dW + 24, dH + 12, 4, V('wood-dark')) + R(dX, dY, dW, dH, 2, 'url(#in-win)') + glow(dX + dW / 2, dY + dH / 2, 220, 200, 0.55) +
      Pa('M' + (dX + dW) + ' ' + dY + 'L' + (dX + dW + 40) + ' ' + (dY + 20) + 'V' + (sy0 + 10) + 'L' + (dX + dW) + ' ' + sy0 + 'Z', u('woodd'));
    s += G({ 'class': 'in-cheer', opacity: 0.6 }, Tx(dX - 24, dY + 150, P ? 34 : 28, '(muffled cheering)', { 'text-anchor': 'end', fill: V('snow-shade'), style: 'font-style:italic;font-weight:600' }) +
      Ln('M' + (dX - 26) + ' ' + (dY + 170) + 'q10 10 0 20M' + (dX - 42) + ' ' + (dY + 164) + 'q16 16 0 32', V('lamp'), 3, O(0.6)));
    // REJECTS bay under the stairs
    var bX = P ? 650 : 1290, bW = P ? 230 : 290, bY = P ? 830 : 600;
    s += ao(bX + bW / 2, fy - 4, bW * 0.6, 12, 0.6) + lit(rr(bX, bY, bW, fy - bY - 6, 10), u('metald'), null, 1.6);
    var gift = function (icon, x, y, sz, tl) { var g = NP.giftSVG ? NP.giftSVG({ icon: icon, broken: true, tilt: tl }) : ''; return g.replace('width="100%" height="100%"', 'x="' + x + '" y="' + y + '" width="' + sz + '" height="' + sz + '"'); };
    s += gift('teddy', bX + 10, bY - 50, 90, -14) + gift('kite', bX + bW * 0.45, bY - 64, 96, 12) + gift('dino', bX + bW * 0.2, bY - 30, 80, 8);
    s += R(bX, bY + 20, bW, 16, 0, V('night-900'), O(0.3)) + lit(rr(bX + 20, bY + 50, bW - 40, 56, 6), u('paper'), null, 1.4) +
      Tm(bX + bW / 2, bY + 90, 32, 'REJECTS', { style: 'font-weight:900;letter-spacing:.08em' });
    s += R(dX - 40, sy0 - 6, W - dX + 80, 18, 4, u('wood'));
    var stx = sx0 + N * sdx;
    s += Pa('M' + (sx0 + 30) + ' ' + sy0 + 'L' + (stx + 10) + ' ' + (fy - 10) + 'H' + (stx + 60) + 'L' + (sx0 + 80) + ' ' + (sy0 + 10) + 'Z', u('woodd'));
    for (var k = 1; k <= N; k++) s += ao(sx0 + k * sdx + 60, sy0 + k * sdy + 8, 70, 5, 0.4) + lit(rr(sx0 + k * sdx - 10, sy0 + k * sdy - 14, 140, 18, 4), u('wood'), null, 1.4);
    s += Ln('M' + (sx0 + 100) + ' ' + (sy0 - 120) + 'L' + (stx + 70) + ' ' + (fy - 130), u('wood'), 10);
    for (k = 1; k < N; k += 2) s += R(sx0 + k * sdx + 64, sy0 + k * sdy - 134, 6, 120, 3, V('wood-dark'));
    // chute and the sacks
    var cX = P ? 50 : 100, cW = P ? 200 : 220, cY = P ? 560 : 300;
    var pile = P ? [[100, fy, 1, -8], [220, fy + 12, 1.05, 6], [320, fy - 2, 0.95, -4], [160, fy - 80, 0.95, 12], [270, fy - 76, 0.9, -10]] : [[160, fy, 1.05, -8], [290, fy + 6, 1.1, 6], [410, fy + 2, 0.95, -4], [220, fy - 84, 0.95, 12], [350, fy - 80, 0.9, -10]];
    pile.forEach(function (p, n) {
      s += G({ 'class': 'in-sk', 'data-h': f(p[1] - cY + 60) }, at(p[0], p[1], p[2] * (P ? 1.15 : 1), G({ 'class': 'in-sq' }, sack(p[3] * 2)) ));
    });
    s += G({ 'class': 'in-envs' }, (function () { var e = ''; seed = 5; for (var i = 0; i < 12; i++) e += at(pile[i % 5][0], pile[i % 5][1] - 30, 1, G({ 'class': 'in-env', 'data-dx': f((rnd() - 0.3) * 320), 'data-dy': f(rnd() * 40), 'data-r': f((rnd() - 0.5) * 140), opacity: 0 }, R(-22, -14, 44, 28, 3, u('paper')) + Pa('M-22-14L0 2L22-14', 'none', { stroke: V('paper-shade'), 'stroke-width': 2 }))); return e; })());
    s += lit(rr(cX, -30, cW, cY + 20, 14), u('metal'), null, 2) + R(cX + cW * 0.62, -30, cW * 0.38, cY + 20, 0, V('night-900'), O(0.2)) +
      R(cX, cY - 70, cW, 26, 0, u('haz'), O(0.8)) + Pa('M' + (cX - 14) + ' ' + (cY - 14) + 'H' + (cX + cW + 14) + 'L' + (cX + cW) + ' ' + (cY + 40) + 'H' + cX + 'Z', u('metald')) +
      E(cX + cW / 2, cY + 40, cW / 2, 12, V('night-900')) +
      lit(rr(cX + 26, cY - 200, cW - 52, 54, 6), u('paper'), null, 1.2) + Tm(cX + cW / 2, cY - 163, 30, 'LETTERS', { style: 'font-weight:900;letter-spacing:.06em' });
    // the elf's desk, lamp, monitor
    var eX0 = P ? 40 : 470, eX1 = P ? 580 : 910, eT = P ? 1170 : 650, ex = P ? 200 : 590, es = P ? 1.3 : 1.25;
    var mX = P ? 320 : 690, mW = P ? 240 : 220, mY = eT - (P ? 210 : 196), mH = P ? 180 : 170;
    s += glow((eX0 + eX1) / 2, eT - 60, 380, 260, 0.35);
    s += elf(ex, eT + 52, es);
    s += glow(mX + 30, mY + mH / 2, 200, 160, 0.3, 1);
    s += ao((eX0 + eX1) / 2, fy + 14, (eX1 - eX0) * 0.56, 16, 0.6) + Pa('M' + eX0 + ' ' + eT + 'H' + eX1 + 'L' + (eX1 + 12) + ' ' + (eT + 22) + 'H' + (eX0 - 12) + 'Z', u('desktop')) +
      R(eX0 - 12, eT + 22, eX1 - eX0 + 24, (P ? 1420 : fy + 10) - eT - 22, 0, u('woodd')) + R(eX0 - 12, eT + 22, eX1 - eX0 + 24, 3, 0, V('lamp'), O(0.4)) + R(eX0 - 12, eT + 25, eX1 - eX0 + 24, 14, 0, V('night-900'), O(0.3));
    s += mitten(ex - 40 * es, eT + 10, es * 0.85, false) + mitten(ex + 44 * es, eT + 12, es * 0.85, true);
    s += ao(mX + mW / 2, eT + 6, mW * 0.4, 6, 0.6) + R(mX + mW / 2 - 14, mY + mH - 4, 28, eT - mY - mH + 6, 3, u('metald')) + E(mX + mW / 2, eT + 2, 60, 8, u('metald')) +
      lit(rr(mX, mY, mW, mH, 14), u('metald'), null, 1.8) + Pa(rr(mX + 12, mY + 12, mW - 24, mH - 24, 8), u('screen')) +
      Tm(mX + mW / 2, mY + 60, P ? 25 : 23, 'REVIEW QUEUE:', { fill: V('snow-shade'), style: 'font-weight:800;letter-spacing:.06em' }) +
      Tx(mX + mW / 2, mY + mH - 28, 76, '0', { 'class': 'in-q', 'text-anchor': 'middle', fill: V('gold'), style: 'font-family:var(--font-mono);font-weight:700' }) +
      glow(mX + mW / 2, mY + mH / 2, mW * 0.5, mH * 0.4, 0.15, 1);
    var lX = P ? 90 : 510;
    s += Pa('M' + (lX - 20) + ' ' + (eT - 70) + 'L' + (lX + 30) + ' ' + (eT - 70) + 'L' + (lX + 200) + ' ' + (eT + 4) + 'H' + (lX - 40) + 'Z', u('cone'), O(0.8)) +
      ao(lX, eT + 4, 40, 6, 0.6) + E(lX, eT + 2, 32, 8, u('metald')) + Ln('M' + lX + ' ' + eT + 'L' + (lX - 14) + ' ' + (eT - 60) + 'L' + (lX + 4) + ' ' + (eT - 92), M('board-dark', 'night-900', 70), 6) +
      lit('M' + (lX - 30) + ' ' + (eT - 70) + 'C' + (lX - 26) + ' ' + (eT - 110) + ' ' + (lX + 30) + ' ' + (eT - 112) + ' ' + (lX + 40) + ' ' + (eT - 72) + 'Z', u('green'), null, 1.4) + E(lX + 5, eT - 71, 34, 6, V('lamp')) + glow(lX + 60, eT, 160, 24, 0.7);
    // Father Christmas: walking (stairs) and, after the cut, slumped at his crate desk by the rejects bay
    var kX0 = P ? 600 : 960, kX1 = P ? 870 : 1180, kT = P ? 1190 : 712, kx = (kX0 + kX1) / 2, fs = P ? 1.3 : 1.25;
    s += G({ 'class': 'in-fcs', opacity: 0 }, fc(kx, kT + 12, fs, { cls: 'in-fc7s' }) +
      ao(kx, P ? 1430 : fy + 10, (kX1 - kX0) * 0.55, 12, 0.6) + lit(rr(kX0, kT, kX1 - kX0, (P ? 1440 : fy + 6) - kT, 6), u('wood'), null, 1.6) +
      R(kX0, kT + 40, kX1 - kX0, 8, 0, V('wood-dark'), O(0.5)) + R(kX0, kT + 100, kX1 - kX0, 8, 0, V('wood-dark'), O(0.5)) +
      ao(kx + 10, kT + 2, 60, 5, 0.6) + Pa('M' + (kx - 44) + ' ' + kT + 'H' + (kx + 64) + 'L' + (kx + 56) + ' ' + (kT - 8) + 'H' + (kx - 36) + 'Z', u('metald')) +
      lit(rr(kx - 34, kT - 78, 86, 70, 7), u('metal'), null, 1.4) + glow(kx, kT - 90, 70, 30, 0.4, 1));
    var path = [];
    for (k = 0; k <= N; k++) path.push([sx0 + k * sdx + 50, sy0 + k * sdy - 14]);
    var wx = P ? 700 : 1120, wy = P ? 1110 : fy;
    s += G({ 'class': 'in-fcw' }, fc(0, 0, fs, { legs: true, lap: true, cls: 'in-fc7' }));
    return {
      m: G({ 'class': 'in-cam' }, s),
      run: function (S) {
        var cam = S.q('.in-cam'), q2 = S.q('.in-q'), fw = S.q('.in-fcw');
        S.at(0, function () {
          fcSet(S.sv, { fz: 3, eyes: 'half' });
          anim(cam, [{ transform: camT(W / 2, H / 2, 1) }, { transform: camT(W / 2, H / 2, 1.03) }], { duration: 6600, easing: 'ease-in-out' });
          anim(S.q('.in-eeyes'), [{ transform: 'translate(6px,1px)' }], { duration: 1 });
          anim(fw, [{ transform: px(path[0][0] + 60, path[0][1]) }], { duration: 1 });
          anim(S.q('.in-fc7 .sc-head'), [{ transform: 'translateY(5px) rotate(4deg)' }], { duration: 1 });
          anim(S.q('.in-cheer'), [O(0.35), O(0.85)], { duration: 650, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out', fill: 'none' });
        });
        S.qa('.in-sk').forEach(function (n, i) {
          var t0 = 400 + i * 620, h = +n.getAttribute('data-h');
          S.at(0, function () { anim(n, [{ transform: 'translateY(' + -h + 'px)' }], { duration: 1 }); });
          S.at(t0, function () {
            anim(n, [{ transform: 'translateY(' + -h + 'px)' }, { transform: 'translateY(0)' }], { duration: 420, easing: 'cubic-bezier(.5,0,.75,0)' });
            anim(n.firstChild.firstChild, [{ transform: 'scale(1,1)' }, { transform: 'scale(1,1)', offset: 0.85 }, { transform: 'scale(1.16,.8)', offset: 0.92 }, { transform: 'scale(1)' }], { duration: 620 });
          });
          S.at(t0 + 400, function () {
            q2.textContent = [5, 10, 15, 20, 24][i];
            if (i < 3) anim(S.q('.in-cam').firstChild, [{ transform: 'translateY(3px)' }, { transform: 'none' }], { duration: 120, fill: 'none' });
            S.qa('.in-env').forEach(function (e, j) {
              if (j % 5 !== i) return;
              anim(e, [{ opacity: 0, transform: 'none' }, { opacity: 1, offset: 0.1 }, { opacity: 1, transform: px(+e.getAttribute('data-dx'), 40 + +e.getAttribute('data-dy')) + ' rotate(' + e.getAttribute('data-r') + 'deg)' }], { duration: 520, easing: 'cubic-bezier(.2,.8,.2,1)' });
            });
          });
        });
        // the trudge: one step every 460ms
        S.at(3200, function () {
          var fr = [];
          path.forEach(function (p, k) { fr.push({ transform: px(p[0], p[1]), offset: k / (N + 1) }); });
          fr.push({ transform: px(wx, wy), offset: 1 });
          anim(fw, fr, { duration: 4300, easing: 'linear' });
          anim(S.q('.in-fc7 .in-fc'), [{ transform: 'translateY(0)' }, { transform: 'translateY(-10px)' }], { duration: 239, iterations: 18, direction: 'alternate', easing: 'ease-out', fill: 'none' });
          anim(S.q('.in-fc7 .in-lg1'), [{ transform: 'translate(-3px,0)' }, { transform: 'translate(4px,-7px)' }], { duration: 239, iterations: 18, direction: 'alternate', fill: 'none' });
          anim(S.q('.in-fc7 .in-lg2'), [{ transform: 'translate(4px,-7px)' }, { transform: 'translate(-3px,0)' }], { duration: 239, iterations: 18, direction: 'alternate', fill: 'none' });
        });
        S.at(7600, function () {
          anim(fw, [O(1), O(0)], { duration: 180 });
          anim(S.q('.in-fcs'), [O(0), O(1)], { duration: 180 });
        });
        S.at(7900, function () {
          anim(S.q('.in-fc7s .sc-head'), [{ transform: 'none' }, { transform: 'translateY(16px) rotate(10deg)' }], { duration: 700, easing: 'cubic-bezier(.5,0,.75,0)' });
          anim(S.q('.in-fc7s .in-fc'), [{ transform: 'none' }, { transform: 'translateY(10px) scale(1.03,.95)' }], { duration: 700, easing: 'cubic-bezier(.5,0,.75,0)' });
          fcSet(S.sv, { eyes: 'closed' });
        });
        S.at(6600, function () {
          anim(cam, [{ transform: camT(W / 2, H / 2, 1.03) }, { transform: P ? camT(W * 0.42, eT - 160, 1.1) : camT(ex, eT - 120, 1.13) }], { duration: 3000, easing: 'cubic-bezier(.45,0,.2,1)' });
          anim(S.q('.in-eeyes'), [{ transform: 'translate(6px,1px)' }, { transform: 'translate(0,0)' }], { duration: 260 });
          anim(S.q('.in-elfb'), [{ transform: 'translateY(0)' }, { transform: 'translateY(-10px)', offset: 0.4 }, { transform: 'translateY(0)' }], { duration: 420, easing: 'ease-out' });
        });
      }
    };
  }

  // 8. Handover: the title card zooms in, then fades to night
  function s8(c) {
    var W = c.W, H = c.H, logo = NP.art && NP.art.logo || '', m = /viewBox="0 0 ([\d.]+) ([\d.]+)"/.exec(logo), lw = m ? +m[1] : 800, lh = m ? +m[2] : 128;
    var tw = c.P ? 700 : 1120, th = tw * lh / lw, cy = c.P ? 760 : 450;
    seed = 23;
    var s = R(0, 0, W, H, 0, 'url(#in-night)') + stars(W, 0, H * 0.7, 60) + glow(W / 2, cy, W * 0.55, H * 0.42, 0.3) +
      Pa('M-50 ' + (H * 0.84) + 'C' + W * 0.3 + ' ' + (H * 0.8) + ' ' + W * 0.7 + ' ' + (H * 0.86) + ' ' + (W + 50) + ' ' + (H * 0.82) + 'V' + (H + 50) + 'H-50Z', u('fur'), O(0.9)) +
      G({ 'class': 'in-logo in-fb' }, at(W / 2 - tw / 2, cy - th / 2, 1, logo.replace('<svg ', '<svg x="0" y="0" width="' + tw + '" height="' + f(th) + '" ')));
    return {
      m: s + (c.red ? '' : snow(W, H, c.P ? 50 : 90)) + R(0, 0, W, H, 0, V('night-900'), { 'class': 'in-out', opacity: 0 }),
      run: function (S) {
        snowRun(S);
        S.at(0, function () { anim(S.q('.in-logo'), [{ transform: 'scale(.55)', opacity: 0 }, { transform: 'scale(1.03)', opacity: 1, offset: 0.25 }, { transform: 'scale(1.1)', opacity: 1 }], { duration: 3000, easing: 'cubic-bezier(.2,.8,.2,1)' }); });
        S.at(2450, function () { anim(S.q('.in-out'), [O(0), O(1)], { duration: 520, easing: 'ease-in' }); });
      }
    };
  }

  /* ---------- storyboard (SPEC §3, locked) ---------- */
  var MELT = '<svg class="in-melt" viewBox="0 0 48 48" role="img" aria-label="a drawn melting face" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="M6 22a18 18 0 0 1 36 0c0 6-1 9 0 14 1 5-3 7-5 3-1-3-3-3-4 0-1 6-6 6-6 0-1-3-3-3-4 1-1 4-6 4-6-1 0-3-3-3-4 0-2 4-6 2-5-3 1-5-2-8-2-14z" fill="var(--gold)"/>' +
    '<path d="M30 6a18 18 0 0 1 12 16c0 6-1 9 0 14 1 5-3 7-5 3 0-8 0-22-7-33z" fill="var(--gold-dark)" opacity=".5"/>' +
    '<path d="M14 20q3-4 6 0M28 21q3-4 6 0" fill="none" stroke="var(--ink)" stroke-width="2.6" stroke-linecap="round"/>' +
    '<path d="M16 31q8 5 16-1" fill="none" stroke="var(--ink)" stroke-width="2.6" stroke-linecap="round"/><ellipse cx="15" cy="12" rx="5" ry="3" fill="var(--lamp)" opacity=".7"/></svg>';
  var SC = [
    { d: 2000, b: s1, still: 1900, caps: [[150, 'nar', '', '1 December. Quarterly board meeting.']] },
    { d: 12000, b: s2, still: 10500, caps: [[900, 'say', 'Chair', '“Everyone’s doing AI.”'], [3600, 'say', 'Member 2', '“Our competitors are doing AI.”'], [6600, 'say', 'Father Christmas', '“We don’t have competitors.”'], [9300, 'say', 'Member 3', '“Exactly. Imagine if we did.”']] },
    { d: 9000, b: s3, still: 7900, caps: [[400, 'big', '', 'EDICT: CHRISTMAS WILL BE AI-FIRST.'], [4000, 'say', 'Father Christmas', '“…What will the AI do?”'], [6200, 'say', 'Chair', '“AI.”'], [7400, 'say', 'All', '“Use case to follow.”']] },
    { d: 18000, b: s4, still: 16700, caps: [[0, 'clear'], [1300, 'flash', 'Day 3', '“What is a token?”', 3600], [6100, 'flash', 'Day 9', '“Make it better. Please.”', 3600], [11700, 'flash', 'Day 16', '“Why does it keep saying I’m right?”', 3600], [15700, 'flash', 'Day 21', MELT, 2300]] },
    { d: 6000, b: s5, still: 4200, caps: [[0, 'clear'], [2600, 'say', 'Father Christmas (exhausted)', '“It’s… done.”']] },
    { d: 8000, b: s6, still: 5000, cut: 'hard', caps: [[0, 'clear'], [2600, 'say', 'Board', '“Transformational.”'], [4300, 'say', 'Board', '“Seamless.”'], [6000, 'say', 'Board', '“Promotions all round.”']] },
    { d: 10000, b: s7, still: 9700, cut: 'hard', caps: [[0, 'clear'], [700, 'nar', '', 'Christmas Eve. The AI is live. Someone has to check it.'], [6600, 'nar', '', 'That someone is you.']] },
    { d: 3000, b: s8, still: 1500, caps: [[0, 'clear']] }
  ];
  var ARROW = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 5.5l7 6.5-7 6.5M12.5 5.5l7 6.5-7 6.5" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  NP.intro = NP.intro || {};
  NP.intro.scenes = SC.length;
  NP.intro.play = function (host, opts) {
    opts = opts || {};
    if (NP.intro._cur) NP.intro._cur.skip();
    var red = !!opts.reduced || document.documentElement.classList.contains('reduced');
    var idx = -1, t = 0, cues = [], ci = 0, ended = false, raf = 0, last = 0, sv = null, held = [], armT = 0, armed = false;
    var resolveDone, done = new Promise(function (r) { resolveDone = r; });
    PAUSED = false; LAG = 0; LIVE = [];
    host.innerHTML = '';
    var root = document.createElement('div');
    root.className = 'in-root' + (red ? ' in-red' : '');
    root.innerHTML = '<div class="in-stage"></div><div class="in-vig"></div><div class="in-grain"></div>' +
      '<div class="in-caps" aria-live="polite"></div>' +
      '<button type="button" class="keycap keycap-plain in-skip"><span class="in-skl">Skip to the shift</span>' + ARROW + '</button>' +
      (red ? '<div class="in-hint"><span class="kb">Tap or Space: next</span><span class="tch">Tap: next</span></div>' : '');
    host.appendChild(root);
    ensureDefs(root);
    var stage = q(root, '.in-stage'), caps = q(root, '.in-caps'), btn = q(root, '.in-skip'), skl = q(root, '.in-skl');
    // the engine owns taps and keys; keep our button's own events from reaching it
    ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'touchstart', 'touchend', 'keydown', 'keyup'].forEach(function (ev) { btn.addEventListener(ev, function (e) { e.stopPropagation(); }); });
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (armed) { api.skip(); return; }
      armed = true; skl.textContent = 'Press again to skip'; clearTimeout(armT);
      armT = setTimeout(function () { armed = false; skl.textContent = 'Skip to the shift'; }, 2600);
    });

    function cap(c) {
      var old = qa(caps, '.in-cap');
      old.forEach(function (o) { var a = anim(o, [O(1), O(0)], { duration: 160 }); if (a) a.onfinish = function () { if (o.parentNode) o.parentNode.removeChild(o); }; else caps.removeChild(o); });
      if (!c || c[1] === 'clear') return;
      caps.appendChild(capEl(c));
      anim(caps.lastChild, c[1] === 'flash' ? [{ opacity: 0, transform: 'scale(.86)' }, { opacity: 1, transform: 'scale(1.04)', offset: 0.6 }, { opacity: 1, transform: 'scale(1)' }] : [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: c[1] === 'flash' ? 260 : 200, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'none' });
    }
    function capEl(c) {
      var d = document.createElement('div');
      d.className = 'in-cap in-k-' + c[1];
      d.innerHTML = (c[2] ? '<span class="in-who">' + c[2] + (c[1] === 'flash' ? ':' : '') + '</span> ' : '') + '<span class="in-line">' + c[3] + '</span>';
      return d;
    }
    function fire(upTo) {
      while (ci < cues.length && cues[ci].t <= upTo) { LAG = upTo - cues[ci].t; try { cues[ci].fn(); } catch (e) { if (window.console) console.error(e); } ci++; }
      LAG = 0;
    }
    function go(i, at0) {
      if (ended) return;
      if (i >= SC.length) { finish(); return; }
      idx = i; t = at0 || 0; ci = 0; cues = [];
      var W = host.clientWidth || window.innerWidth, H = host.clientHeight || window.innerHeight, P = W < H * 0.9;
      var c = { P: P, W: P ? 900 : 1600, H: P ? 1800 : 1000, red: red, i: i };
      var def = SC[i], b = def.b(c);
      var wrap = document.createElement('div');
      wrap.className = 'in-scene in-s' + (i + 1) + (P ? ' in-p' : ' in-l');
      wrap.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + c.W + ' ' + c.H + '" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">' + b.m + '</svg>';
      var olds = qa(stage, '.in-scene');
      stage.appendChild(wrap);
      sv = wrap.firstChild;
      var fade = at0 ? 0 : red ? 200 : (def.cut === 'hard' || i === 0) ? 0 : 340;
      if (fade) {
        anim(wrap, [O(0), O(1)], { duration: fade, fill: 'none' });
        olds.forEach(function (o) { var a = anim(o, [O(1), O(0)], { duration: fade }); if (a) a.onfinish = function () { if (o.parentNode) stage.removeChild(o); }; });
      } else olds.forEach(function (o) { stage.removeChild(o); });
      var S = {
        sv: sv,
        at: function (tt, fn) { cues.push({ t: tt, fn: fn, n: cues.length }); },
        q: function (s) { return q(sv, s); },
        qa: function (s) { return qa(sv, s); }
      };
      b.run(S);
      if (!red) def.caps.forEach(function (cp) {
        S.at(cp[0], function () { cap(cp); });
        if (cp[4]) S.at(cp[0] + cp[4], function () { cap(null); });
      });
      cues.sort(function (a, z) { return a.t - z.t || a.n - z.n; });
      if (red) {
        fire(def.still);
        settle(sv);
        sv.getAnimations && sv.getAnimations({ subtree: true }).forEach(function (a) { a.pause(); });
        qa(caps, '.in-cap').forEach(function (o) { caps.removeChild(o); });
        def.caps.forEach(function (cp) { if (cp[1] !== 'clear') caps.appendChild(capEl(cp)); });
      } else {
        fire(t);
        if (at0) settle(sv);
      }
    }
    // finish CSS transitions (the rig's pose easing) so a seeked or still frame is exact
    function settle(n) { if (n.getAnimations) n.getAnimations({ subtree: true }).forEach(function (a) { if (window.CSSTransition && a instanceof CSSTransition) a.finish(); }); }
    function loop(now) {
      raf = requestAnimationFrame(loop);
      if (PAUSED || red || ended) { last = now; return; }
      var dt = last ? Math.min(1000, now - last) : 16;
      last = now; t += dt;
      fire(t);
      if (t >= SC[idx].d) go(idx + 1);
    }
    function finish() {
      if (ended) return;
      ended = true; cancelAnimationFrame(raf); clearTimeout(armT);
      try { root.getAnimations({ subtree: true }).forEach(function (a) { a.cancel(); }); } catch (e) {}
      host.innerHTML = '';
      PAUSED = false; LIVE = [];
      if (NP.intro._cur === api) NP.intro._cur = null;
      resolveDone();
    }
    var api = {
      next: function () { if (!ended) go(idx + 1); },
      skip: function () { finish(); },
      pause: function () {
        if (ended || PAUSED) return;
        PAUSED = true;
        LIVE = root.getAnimations ? root.getAnimations({ subtree: true }).filter(function (a) { return a.playState === 'running'; }) : [];
        LIVE.forEach(function (a) { a.pause(); });
      },
      resume: function () {
        if (ended || !PAUSED) return;
        PAUSED = false;
        LIVE.forEach(function (a) { try { if (a.playState === 'paused') a.play(); } catch (e) {} });
        LIVE = []; last = 0;
      },
      done: done,
      // test hooks (not part of the contract): jump to scene i (0-based) at ms and freeze there
      _seek: function (i, ms) { PAUSED = false; go(i, ms || 1); api.pause(); },
      _state: function () { return { scene: idx + 1, t: Math.round(t), paused: PAUSED, ended: ended, portrait: !!(sv && sv.parentNode.classList.contains('in-p')) }; }
    };
    NP.intro._cur = api;
    go(0, 0);
    last = 0; raf = requestAnimationFrame(loop);
    return api;
  };
})(window.NP);
