/* scene.js: belt panel (conveyor, AI hopper, chute, mittens) and desk panel (rejects pile, Father Christmas).
   Contract: ARCHITECTURE.md "scene.js". Art: SPEC §9. Ids/classes prefixed sc-. */
window.NP = window.NP || {};
(function (NP) {
  'use strict';
  var FX = NP.fx;   // shared light and texture (fx.js loads first)

  /* ---------- tiny helpers ---------- */
  function reduced() { return document.documentElement.classList.contains('reduced'); }
  function V(n) { return 'var(--' + n + ')'; }
  function M(a, b, p) { return 'color-mix(in srgb,var(--' + a + ') ' + p + '%,var(--' + b + '))'; }
  function f(n) { return Math.round(n * 10) / 10; }
  function A(o) { var s = ''; for (var k in o) if (o[k] != null) s += ' ' + k + '="' + o[k] + '"'; return s; }
  function T(tag, o, inner) { return '<' + tag + A(o) + (inner == null ? '/>' : '>' + inner + '</' + tag + '>'); }
  function ext(o, b) { o = o || {}; for (var k in b) o[k] = b[k]; return o; }
  function rect(x, y, w, h, r, fill, o) { return T('rect', ext(o, { x: x, y: y, width: w, height: h, rx: r || null, fill: fill })); }
  function circ(cx, cy, r, fill, o) { return T('circle', ext(o, { cx: cx, cy: cy, r: r, fill: fill })); }
  function ell(cx, cy, rx, ry, fill, o) { return T('ellipse', ext(o, { cx: cx, cy: cy, rx: rx, ry: ry, fill: fill })); }
  function path(d, fill, o) { return T('path', ext(o, { d: d, fill: fill })); }
  function line(d, col, w, o) { return T('path', ext(o, { d: d, fill: 'none', stroke: col, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' })); }
  function g(o, inner) { return T('g', o, inner); }
  function rr(x, y, w, h, r) {
    return 'M' + (x + r) + ' ' + y + 'H' + (x + w - r) + 'A' + r + ' ' + r + ' 0 0 1 ' + (x + w) + ' ' + (y + r) + 'V' + (y + h - r) +
      'A' + r + ' ' + r + ' 0 0 1 ' + (x + w - r) + ' ' + (y + h) + 'H' + (x + r) + 'A' + r + ' ' + r + ' 0 0 1 ' + x + ' ' + (y + h - r) +
      'V' + (y + r) + 'A' + r + ' ' + r + ' 0 0 1 ' + (x + r) + ' ' + y + 'Z';
  }
  function cd(cx, cy, r) { return 'M' + (cx - r) + ' ' + cy + 'a' + r + ' ' + r + ' 0 1 0 ' + 2 * r + ' 0a' + r + ' ' + r + ' 0 1 0 ' + -2 * r + ' 0Z'; }
  // soft contact shadow: pre-blurred via radial gradient (no live filter)
  function ao(cx, cy, rx, ry, op, o) { return ell(cx, cy, rx, ry, 'url(#sc-ao)', ext(o, { opacity: op || 0.3 })); }
  // rim light: a --lamp copy of the shape nudged up-left sits behind it, leaving a crescent on the lit edge
  function lit(d, fill, o, k) {
    k = k || 1.8;
    return path(d, V('lamp'), { transform: 'translate(' + -k + ' ' + f(-k * 0.8) + ')', opacity: 0.85 }) + path(d, fill, o);
  }
  function rig(cls, ox, oy, inner, extra) {
    return g(ext({ 'class': 'sc-rig ' + cls, style: 'transform-origin:' + ox + 'px ' + oy + 'px' }, extra), inner);
  }
  function txt(x, y, size, str, o) {
    return T('text', ext({ x: x, y: y, 'font-size': size, 'class': 'sc-txt', fill: V('ink') }, o), str);
  }
  function anim(el, frames, opts) { return el && el.animate ? el.animate(frames, opts) : null; }
  function stop(a) { if (a) try { a.cancel(); } catch (e) {} return null; }
  function q(root, sel) { return root.querySelector(sel); }
  function qa(root, sel) { return Array.prototype.slice.call(root.querySelectorAll(sel)); }
  function op(el, v) { if (el) el.style.opacity = v; }
  function tf(el, v) { if (el) el.style.transform = v || ''; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  var seed = 7;
  function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }

  /* ---------- shared defs (one hidden sprite) ---------- */
  function grad(id, stops, o, radial) {
    var s = '';
    stops.forEach(function (st) { s += T('stop', { offset: st[0], 'stop-color': st[1], 'stop-opacity': st[2] == null ? null : st[2] }); });
    return T(radial ? 'radialGradient' : 'linearGradient', ext({ id: 'sc-' + id }, o), s);
  }
  var DIAG = { x1: 0.1, y1: 0, x2: 0.9, y2: 1 }, VERT = { x1: 0, y1: 0, x2: 0, y2: 1 }, HOR = { x1: 0, y1: 0, x2: 1, y2: 0 };
  function lg(id, a, b, o) { return grad(id, [[0, a], [1, b]], o || DIAG); }

  var DEFS =
    grad('ao', [[0, V('night-900'), 1], [0.55, V('night-900'), 0.55], [1, V('night-900'), 0]], null, 1) +
    grad('glow', [[0, V('lamp'), 1], [0.45, V('lamp'), 0.45], [1, V('lamp'), 0]], null, 1) +
    grad('glowc', [[0, V('snow'), 1], [0.5, V('snow'), 0.4], [1, V('snow'), 0]], null, 1) +
    grad('rgood', [[0, V('good'), 0.9], [0.6, V('good'), 0.35], [1, V('good'), 0]], null, 1) +
    grad('rbad', [[0, V('bad'), 0.9], [0.6, V('bad'), 0.35], [1, V('bad'), 0]], null, 1) +
    lg('wall', V('basement-light'), M('basement', 'night-900', 80)) +
    lg('metal', M('board', 'snow', 72), V('board-dark')) +
    lg('metald', V('board-dark'), M('board-dark', 'night-900', 55)) +
    lg('gold', M('gold', 'lamp', 60), V('gold-dark')) +
    lg('wood', M('wood', 'lamp', 72), V('wood-dark')) +
    lg('woodd', M('wood-dark', 'wood', 85), M('wood-dark', 'night-900', 50)) +
    lg('desktop', M('wood', 'lamp', 62), V('wood'), VERT) +
    lg('rubber', M('board-dark', 'night-900', 70), V('night-900'), VERT) +
    lg('btop', M('board-dark', 'board', 62), M('board-dark', 'night-900', 82), VERT) +
    lg('red', M('pole-red', 'lamp', 84), M('pole-red-dark', 'night-900', 82)) +
    lg('mred', M('pole-red', 'lamp', 86), V('pole-red-dark')) +
    lg('fur', V('snow'), V('snow-shade')) +
    lg('skin', M('paper', 'lamp-deep', 74), M('lamp-deep', 'paper', 66)) +
    lg('nose', M('lamp-deep', 'pole-red', 52), M('pole-red', 'lamp-deep', 74)) +
    lg('paper', V('paper'), V('paper-shade')) +
    lg('sticky', M('lamp', 'paper', 58), M('lamp', 'gold', 62)) +
    lg('screen', V('night-600'), V('night-900'), VERT) +
    lg('pipe', M('board', 'snow', 80), M('board-dark', 'night-900', 70), VERT) +
    lg('pipev', M('board', 'snow', 80), M('board-dark', 'night-900', 70), HOR) +
    lg('sky', V('night-600'), V('night-900'), VERT) +
    lg('floor', M('basement', 'night-900', 55), V('night-900'), VERT) +
    lg('plate', M('board-dark', 'board', 80), M('board-dark', 'night-900', 70)) +
    lg('green', M('pole-green', 'lamp', 80), V('pole-green-dark')) +
    lg('hole', V('night-900'), M('basement', 'night-900', 50), VERT) +
    grad('cone', [[0, V('lamp'), 0.32], [1, V('lamp'), 0]], VERT) +
    grad('aov', [[0, V('night-900'), 0.55], [1, V('night-900'), 0]], VERT) +
    grad('haze', [[0, V('night-600'), 0], [1, V('night-600'), 0.35]], VERT) +
    grad('shadel', [[0, V('lamp'), 0.22], [0.45, V('lamp'), 0], [1, V('night-900'), 0.4]], HOR) +
    grad('bub', [[0, V('paper')], [1, M('paper', 'paper-shade', 30)]], { x1: 0, y1: 8, x2: 0, y2: 104, gradientUnits: 'userSpaceOnUse' }) +
    T('pattern', { id: 'sc-brick', width: 72, height: 30, patternUnits: 'userSpaceOnUse' },
      rect(1, 1, 34, 13, 2, V('basement-light')) + rect(37, 1, 34, 13, 2, V('basement-light')) +
      rect(-17, 16, 34, 13, 2, V('basement-light')) + rect(19, 16, 34, 13, 2, V('basement-light')) + rect(55, 16, 34, 13, 2, V('basement-light'))) +
    T('pattern', { id: 'sc-rib', width: 9, height: 10, patternUnits: 'userSpaceOnUse' },
      rect(0, 0, 4.5, 10, 0, M('pole-red', 'lamp', 90)) + rect(4.5, 0, 4.5, 10, 0, V('pole-red-dark'))) +
    T('pattern', { id: 'sc-knit', width: 11, height: 9, patternUnits: 'userSpaceOnUse' },
      path('M0 1.5L5.5 6 11 1.5V4L5.5 8.5 0 4Z', V('pole-red-dark'), { opacity: 0.5 })) +
    T('pattern', { id: 'sc-haz', width: 20, height: 20, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(40)' },
      rect(0, 0, 10, 20, 0, V('gold')) + rect(10, 0, 10, 20, 0, V('ink'))) +
    T('clipPath', { id: 'sc-beltclip' }, rect(100, 194, 700, 30)) +
    T('filter', { id: 'sc-soft', x: '-20%', y: '-20%', width: '140%', height: '140%' }, T('feGaussianBlur', { stdDeviation: 3 }));

  var CSS =
    '.sc-svg{display:block;width:100%;height:100%;overflow:hidden}' +
    '.sc-rig{transform-box:view-box;transition:transform 300ms cubic-bezier(.2,.8,.2,1)}' +
    '.sc-quick{transition-duration:200ms}' +
    '.sc-slow{transition-duration:420ms}' +
    '.sc-fade{transition:opacity 180ms}' +
    '.reduced .sc-rig{transition:none}.reduced .sc-fade{transition:opacity 120ms}' +
    '.sc-txt{font-family:var(--font-ui);font-weight:700}' +
    '.sc-script{font-family:"Segoe Print","Bradley Hand","Noteworthy","Marker Felt","Chalkboard SE",var(--font-ui);font-weight:400}' +
    '.sc-off{opacity:0}' +
    '@media (max-width:760px){.sc-ceil{transform:translateY(-70px)}}';

  function ensureDefs() {
    FX.ensure();
    if (document.getElementById('sc-defs')) return;
    var d = document.createElement('div');
    d.innerHTML = '<svg id="sc-defs" xmlns="http://www.w3.org/2000/svg" width="0" height="0" aria-hidden="true" focusable="false" ' +
      'style="position:absolute;width:0;height:0;overflow:hidden"><style>' + CSS + '</style><defs>' + DEFS + '</defs></svg>';
    (document.body || document.documentElement).appendChild(d.firstChild);
  }
  function mountSVG(el, vb, inner, cls, par) {
    ensureDefs();
    el.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="sc-svg ' + cls + '" viewBox="' + vb + '" preserveAspectRatio="' + (par || 'xMidYMid meet') + '" aria-hidden="true" focusable="false">' + inner + '</svg>';
    return el.firstChild;
  }
  function measure(t, str) {
    t.textContent = str;
    var w = 0;
    try { w = t.getComputedTextLength(); } catch (e) {}
    return w || str.length * parseFloat(t.getAttribute('font-size')) * 0.55;
  }
  function wrapWords(words, fits) {
    var lines = [], cur = '';
    words.forEach(function (w) {
      var t = cur ? cur + ' ' + w : w;
      if (!cur || fits(t)) cur = t; else { lines.push(cur); cur = w; }
    });
    if (cur) lines.push(cur);
    return lines;
  }

  /* ---------- shared props ---------- */
  function pipeH(x, y, w, h) {
    var s = rect(x, y, w, h, h / 2, 'url(#sc-pipe)');
    for (var bx = x + 70; bx < x + w; bx += 170) s += rect(bx, y - 2, 8, h + 4, 2, 'url(#sc-metald)');
    return s;
  }
  // basement wall from y0 down to the floor: paint, brickwork with every brick its own tone, damp blotches,
  // the ceiling's shadow, and two service pipes. k scales the bricks (the desk bay is drawn in larger units).
  function wallBase(w, y0, k, noCeil) {
    y0 = y0 || 0;
    return rect(0, y0, w, 300 - y0, 0, 'url(#sc-wall)') + FX.tex('brick', 0, y0, w, 262 - y0, 0.5, { scale: k || 1 }) + FX.tex('mottle', 0, y0, w, 262 - y0, 0.55) + (noCeil ? '' : ceil(w, y0));
  }
  function ceil(w, y0) {
    return rect(0, y0 - 80, w, 89, 0, M('basement', 'night-900', 35)) + rect(0, y0 + 9, w, 30, 0, 'url(#sc-aov)') +
      pipeH(0, y0 + 17, w, 11) + rect(0, y0 + 28, w, 5, 0, V('night-900'), { opacity: 0.22 }) + pipeH(0, y0 + 35, w, 7);
  }
  function haze(w, y0) { y0 = y0 || 0; return rect(0, y0, w, 300 - y0, 0, M('night-600', 'basement', 50), { opacity: 0.16 }) + rect(0, 120, w, 142, 0, 'url(#sc-haze)', { opacity: 0.8 }); }
  function floor(w) {
    return rect(0, 262, w, 38, 0, 'url(#sc-floor)') + FX.tex('mottle', 0, 262, w, 38, 0.9) + rect(0, 262, w, 2, 0, V('basement-light'), { opacity: 0.6 }) +
      rect(0, 264, w, 7, 0, 'url(#sc-aov)', { opacity: 0.5 });
  }
  // pendant work lamp: cord, enamel shade, hot bulb. Its beam is drawn by the caller, behind the actors.
  function pendant(x, y, top, sc) {
    sc = sc || 1;
    return rect(x - 1, top, 2, y - top - 22 * sc, 0, M('board-dark', 'night-900', 60)) +
      g({ transform: 'translate(' + x + ' ' + y + ') scale(' + sc + ')' },
        rect(-5, -27, 10, 7, 2, 'url(#sc-metald)') +
        lit('M-25 0C-25-13-15-21 0-21C15-21 25-13 25 0Z', 'url(#sc-green)', null, 1.3) + path('M6-20C17-17 25-11 25 0H13C13-8 10-15 6-20Z', V('night-900'), { opacity: 0.25 }) +
        ell(0, 0, 25, 4.6, M('lamp', 'paper', 70)) + ell(0, 0.5, 17, 3, V('paper'))) +
      FX.bulb(x, y + 2 * sc, 7 * sc, 0.8);
  }
  function tick(s) { return line('M' + -9 * s + ' ' + 1 * s + 'L' + -3 * s + ' ' + 7 * s + 'L' + 9 * s + ' ' + -6 * s, V('ink'), 4.4 * s); }
  function cross(s) { return line('M' + -7 * s + ' ' + -7 * s + 'L' + 7 * s + ' ' + 7 * s + 'M' + 7 * s + ' ' + -7 * s + 'L' + -7 * s + ' ' + 7 * s, V('ink'), 4.4 * s); }
  function plate(x, y, w, h) { return lit(rr(x, y, w, h, 8), 'url(#sc-gold)', null, 1.4) + path(rr(x + 2.5, y + 2.5, w - 5, h - 5, 6), 'url(#sc-plate)'); }
  // background signage: same enamel plate, knocked back (duller bevel, softer lettering) so the gift and the hopper stay loudest
  var SIGN_INK = M('paper', 'board', 64), SIGN_ARROW = M('gold', 'board', 66);
  function plateQuiet(x, y, w, h) {
    return path(rr(x, y, w, h, 8), M('gold-dark', 'board-dark', 72)) + path(rr(x, y, w, 2.2, 1.1), M('gold', 'board', 60), { opacity: 0.8 }) +
      path(rr(x + 2.5, y + 2.5, w - 5, h - 5, 6), 'url(#sc-plate)') + path(rr(x + 2.5, y + 2.5, w - 5, h - 5, 6), V('night-600'), { opacity: 0.18 });
  }

  /* =====================================================================
     BELT PANEL 800x300
     ===================================================================== */
  function mittenMarkup(tx, ty, sc, flip) {
    var body = 'M-32 4C-38-40-30-94 2-96C32-96 38-50 33 4Z';
    var thumb = 'M30-18C50-28 52-60 38-66C26-68 22-44 22-32Z';
    return g({ transform: 'translate(' + tx + ' ' + ty + ') scale(' + (flip ? -sc : sc) + ' ' + sc + ')' },
      rect(-31, 0, 62, 140, 10, 'url(#sc-rib)') + rect(-31, 0, 62, 140, 10, 'url(#sc-shadel)') +
      lit(thumb, 'url(#sc-mred)') + path(thumb, 'url(#sc-knit)') +
      lit(body, 'url(#sc-mred)', null, 2.2) + path(body, 'url(#sc-knit)') +
      path('M-26-30C-28-60-18-84 0-88C-14-78-20-58-20-30Z', V('snow'), { opacity: 0.12 }) +
      rect(-34, -6, 68, 18, 9, 'url(#sc-rib)') + rect(-34, -6, 68, 18, 9, 'url(#sc-shadel)') +
      rect(-34, 6, 68, 5, 0, V('night-900'), { opacity: 0.18 }));
  }

  function beltMarkup() {
    // The bay is drawn above the engine's 800x300 gift lane, so the hopper, the lamp and the gift's tag sit inside the picture:
    // 100 units more on a wide screen, 170 on a phone (where the tag is taller). YT is the top of the art; the ceiling group
    // sits at Y0 and CSS lifts it to YT on a phone.
    var Y0 = -100, YT = -170;
    var s = wallBase(800, YT, 1, true);
    // vertical pipe with valve
    s += rect(248, YT, 13, 224 - YT, 0, 'url(#sc-pipev)') + rect(246, 150, 17, 8, 2, 'url(#sc-metald)') + rect(246, Y0 + 46, 17, 8, 2, 'url(#sc-metald)');
    s += path('M254.5 94m-14 0a14 14 0 1 0 28 0a14 14 0 1 0-28 0Zm5 0a9 9 0 1 1 18 0a9 9 0 1 1-18 0Z', 'url(#sc-pipe)', { 'fill-rule': 'evenodd' }) +
      rect(253, 80, 3, 28, 1, V('board-dark')) + rect(240.5, 92.5, 28, 3, 1, V('board-dark'));
    // the board's slide, taped up down here as a poster (kept dim: it is set dressing)
    s += g({ transform: 'rotate(-2.5 196 -22)', opacity: 0.9 },
      rect(162, -46, 74, 58, 2, V('night-900'), { opacity: 0.35 }) +
      rect(160, -49, 74, 58, 2, M('paper', 'basement', 46)) + rect(160, -49, 74, 58, 2, 'url(#sc-shadel)', { opacity: 0.5 }) +
      txt(168, -8, 30, 'AI', { fill: M('night-600', 'basement', 60), style: 'font-weight:900' }) +
      line('M204 -3C219 -3 225 -17 226 -29', M('gold-dark', 'basement', 70), 3) +
      path('M226 -42l6 12h-12z', M('pole-red', 'basement', 62)) +
      rect(186, -53, 20, 7, 1, M('paper', 'gold', 60), { opacity: 0.55, transform: 'rotate(4 196 -50)' }));
    // air grille and wall clock (five to midnight) on the right, cable run from the AI's cabinet
    s += path(rr(626, -56, 84, 34, 4), 'url(#sc-metald)') + rect(631, -51, 74, 24, 2, V('night-900'), { opacity: 0.55 });
    for (var gi = 0; gi < 5; gi++) s += rect(633, -48.5 + gi * 4.6, 70, 1.6, 0.8, V('board'), { opacity: 0.55 });
    s += circ(752, -30, 21.5, V('night-900'), { opacity: 0.35 }) + lit(cd(751, -32, 20), 'url(#sc-metald)', null, 1.2) + circ(751, -32, 16.5, M('paper', 'basement', 52)) +
      line('M751 -32L745.4 -41.8M751 -32L750.4 -40', V('ink'), 2) + circ(751, -32, 1.8, V('pole-red'));
    s += line('M676 54C676 16 690 4 690 -22', V('night-900'), 4, { opacity: 0.55 }) + line('M684 54C690 20 700 6 700 -22', V('night-900'), 3, { opacity: 0.4 });
    // duct from the ceiling into the hopper
    s += rect(488, YT, 64, 20 - YT, 0, 'url(#sc-pipev)') + rect(497, YT, 5, 20 - YT, 0, V('snow'), { opacity: 0.13 }) +
      rect(481, Y0 + 46, 78, 9, 3, 'url(#sc-metald)') + rect(481, -30, 78, 9, 3, 'url(#sc-metald)');
    s += haze(800, YT);
    // key light: a pendant up and to the left of the hopper. Its beam falls across the belt; dust hangs in it.
    s += FX.pool(420, 96, 400, 230, 0.34) + FX.cone(330, -6, 46, 440, 268, 0.4, { skew: 46 }) + FX.pool(600, 20, 150, 100, 0.28);
    s += FX.motes(250, 6, 280, 180, 12, 5, { r: 1.3 });
    s += pendant(330, -8, YT, 1);
    s += g({ 'class': 'sc-ceil' }, ceil(800, Y0));
    s += floor(800) + FX.pool(396, 282, 250, 20, 0.34);

    // ---- packing chute (x 0..96) ----
    s += ao(50, 297, 66, 6, 0.55);
    s += lit(rr(-4, 104, 104, 200, 12), 'url(#sc-wood)');
    s += FX.texPath('woodv', rr(-4, 104, 104, 200, 12), 0.7) + rect(-4, 104, 104, 200, 0, 'url(#sc-shadel)', { opacity: 0.6 });
    s += path(rr(12, 122, 76, 116, 9), 'url(#sc-hole)');
    s += path('M12 132Q12 122 22 122H30V238H12Z', V('wood-dark'), { opacity: 0.55 });
    for (var i = 0; i < 6; i++) s += rect(15 + i * 12.4, 123, 10.6, 52 - (i % 2) * 6, 2, M('board-dark', 'night-900', 60), { opacity: 0.75 });
    s += rect(12, 122, 76, 8, 0, 'url(#sc-aov)');
    s += path('M10 210H100V219L10 232Z', 'url(#sc-metal)') + path('M10 232L100 219V224L10 238Z', V('night-900'), { opacity: 0.4 });
    s += rect(-4, 238, 104, 3, 0, V('lamp'), { opacity: 0.25 });
    s += g({ 'class': 'sc-chglow sc-off' }, ell(50, 180, 66, 96, 'url(#sc-rgood)', { 'class': 'sc-chg-good' }) + ell(50, 180, 66, 96, 'url(#sc-rbad)', { 'class': 'sc-chg-bad' }));
    // sign
    s += rect(30, YT, 3, 54 - YT, 0, V('board-dark')) + rect(128, YT, 3, 54 - YT, 0, V('board-dark'));
    s += plateQuiet(4, 50, 152, 48);
    s += txt(17, 84, 28, 'PACKING', { fill: SIGN_INK, 'letter-spacing': 1, style: 'font-weight:800' });
    // indicator light on the chute's lower panel, clear of the gift lane and the bubble
    s += circ(50, 270, 24, V('night-900'), { opacity: 0.3 }) + circ(50, 269, 22, 'url(#sc-gold)') + circ(50, 269, 18, 'url(#sc-plate)') + ell(44, 263, 7, 4.5, V('snow'), { opacity: 0.16 });
    s += rig('sc-lamp sc-off', 50, 269, circ(50, 269, 40, 'url(#sc-glow)', { opacity: 0.45 }) +
      g({ 'class': 'sc-lamp-good' }, circ(50, 269, 18, V('good')) + g({ transform: 'translate(50 269) scale(1.15)' }, tick(1))) +
      g({ 'class': 'sc-lamp-bad' }, circ(50, 269, 18, V('bad')) + g({ transform: 'translate(50 269) scale(1.15)' }, cross(1))) +
      ell(44, 262, 7, 4, V('snow'), { opacity: 0.35 }));

    // ---- belt ----
    s += ao(450, 288, 390, 12, 0.6);
    [150, 330, 470, 610, 760].forEach(function (x) { s += rect(x, 256, 14, 40, 2, 'url(#sc-metald)') + rect(x - 4, 292, 22, 6, 2, V('board-dark')); });
    s += lit(rr(92, 220, 712, 40, 6), 'url(#sc-metal)', null, 1.2) + FX.texPath('brush', rr(92, 220, 712, 40, 6), 0.8);
    s += rect(92, 220, 712, 4, 0, 'url(#sc-gold)') + rect(92, 224, 712, 8, 0, 'url(#sc-aov)') + rect(92, 254, 712, 6, 0, V('night-900'), { opacity: 0.3 });
    var rolls = '';
    for (var rx = 128; rx < 800; rx += 66) {
      s += circ(rx, 241, 12.5, V('night-900'), { opacity: 0.35 }) + circ(rx, 241, 10, 'url(#sc-metal)');
      rolls += g({ 'class': 'sc-roll', 'data-c': rx }, rect(rx - 1.4, 233, 2.8, 16, 1.4, V('board-dark')) + circ(rx, 241, 3, V('board-dark')));
    }
    s += rolls;
    // REJECTS sign on the apron
    s += plateQuiet(610, 222, 186, 38);
    s += txt(624, 250.5, 27, 'REJECTS', { fill: SIGN_INK, style: 'font-weight:800', 'letter-spacing': 0.5 });
    s += path('M752 237h16v-7l14 11-14 11v-7h-16z', SIGN_ARROW);
    // rubber belt + treads
    s += rect(100, 196, 700, 18, 0, 'url(#sc-btop)') + rect(100, 214, 700, 9, 0, 'url(#sc-rubber)');
    var tr = '';
    for (var tx = 76; tx < 848; tx += 24) {
      tr += rect(tx, 197, 3, 17, 0, M('board-dark', 'night-900', 50)) + rect(tx + 3, 197, 1.6, 17, 0, V('snow'), { opacity: 0.14 }) +
        rect(tx, 214, 3, 9, 0, V('night-900'), { opacity: 0.6 });
    }
    s += g({ 'clip-path': 'url(#sc-beltclip)' }, g({ 'class': 'sc-treads' }, tr));
    s += rect(100, 196, 700, 2.5, 0, V('night-900'), { opacity: 0.4 }) + rect(100, 212.5, 700, 1.5, 0, V('snow'), { opacity: 0.18 });
    s += FX.pool(450, 205, 250, 13, 0.4);
    s += circ(103, 209, 13.5, 'url(#sc-rubber)') + circ(103, 209, 6, 'url(#sc-metal)') + circ(101, 207, 2, V('snow'), { opacity: 0.4 });
    s += ao(520, 206, 70, 6, 0.35);

    // ---- AI hopper (mouth x=520, y≈118) ----
    var h = '';
    h += rect(492, -6, 56, 16, 3, 'url(#sc-pipev)');
    h += lit(rr(416, -24, 208, 116, 22), 'url(#sc-metal)', null, 2.2) + FX.texPath('brush', rr(416, -24, 208, 116, 22), 0.8) +
      path('M560 -24H602A22 22 0 0 1 624 -2V70A22 22 0 0 1 602 92H560Z', V('night-900'), { opacity: 0.16 });
    h += rect(416, 54, 208, 3, 0, V('board-dark'), { opacity: 0.5 }) + rect(416, 57, 208, 2, 0, V('snow'), { opacity: 0.15 });
    for (var k = 0; k < 8; k++) h += circ(432 + k * 25.5, 66, 2.6, V('board-dark')) + circ(431.4 + k * 25.5, 65.3, 1, V('snow'), { opacity: 0.5 });
    h += lit(rr(482, 10, 76, 38, 8), 'url(#sc-gold)', null, 1.2) + txt(520, 40, 28, 'AI', { 'text-anchor': 'middle', style: 'font-weight:900', 'letter-spacing': 2 });
    h += circ(448, 28, 15, 'url(#sc-metald)') + circ(448, 28, 11.5, 'url(#sc-paper)') + rig('sc-needle', 448, 28, line('M448 28L455 21', V('pole-red'), 2.2)) + circ(448, 28, 2, V('ink'));
    // gear
    var gear = '';
    for (var t = 0; t < 8; t++) gear += rect(589.5, 13, 7, 9, 1.5, 'url(#sc-metald)', { transform: 'rotate(' + t * 45 + ' 593 28)' });
    h += rig('sc-gear', 593, 28, gear + circ(593, 28, 11, 'url(#sc-metald)') + circ(593, 28, 4, V('board')));
    h += circ(494, 80, 4, V('gold')) + circ(510, 80, 4, V('lamp'), { 'class': 'sc-led' }) + circ(526, 80, 4, V('board-dark')) + circ(542, 80, 4, V('board-dark'));
    // funnel + hazard band + mouth
    h += lit('M436 90H604L568 116H472Z', 'url(#sc-metald)', null, 1.4);
    h += path('M447 97H593L585 103H455Z', 'url(#sc-haz)', { opacity: 0.85 });
    h += ell(520, 117, 50, 8, M('board-dark', 'snow', 80)) + ell(520, 117.5, 45, 6, V('night-900'));
    // brain cabinet with the smug screen face
    h += line('M600 40C620 40 630 46 640 56', V('night-900'), 5, { opacity: 0.6 });
    h += lit(rr(604, 52, 112, 124, 18), 'url(#sc-metal)', null, 2) + FX.texPath('brushv', rr(604, 52, 112, 124, 18), 0.8) +
      path('M690 52H698A18 18 0 0 1 716 70V158A18 18 0 0 1 698 176H690Z', V('night-900'), { opacity: 0.18 });
    h += rect(612, 166, 96, 4, 2, V('night-900'), { opacity: 0.35 });
    h += circ(698, 66, 5, V('lamp')) + circ(698, 66, 12, 'url(#sc-glow)', { opacity: 0.6 });
    h += circ(620, 66, 2.5, V('board-dark')) + circ(634, 66, 2.5, V('board-dark'));
    h += path(rr(620, 106, 80, 58, 11), 'url(#sc-screen)');
    h += FX.pool(660, 135, 62, 48, 0.42, null, { 'class': 'fx-add fx-breathe' });
    h += g({ 'class': 'sc-face sc-face-smug sc-fade' },
      path('M638 129A8 8 0 0 0 654 129Z', V('lamp')) + path('M666 129A8 8 0 0 0 682 129Z', V('lamp')) +
      line('M637 126L655 128M665 128L683 125', V('lamp'), 2.4) + line('M647 147Q662 153 676 143', V('lamp'), 3.4));
    h += g({ 'class': 'sc-face sc-face-talk sc-fade sc-off' },
      line('M638 132Q646 121 654 132M666 132Q674 121 682 132', V('lamp'), 3.4) + path('M647 142Q660 158 674 142Z', V('lamp')));
    h += g({ 'class': 'sc-face sc-face-think sc-fade sc-off' },
      circ(645, 135, 4.5, V('lamp'), { 'class': 'sc-dot' }) + circ(660, 135, 4.5, V('lamp'), { 'class': 'sc-dot' }) + circ(675, 135, 4.5, V('lamp'), { 'class': 'sc-dot' }));
    h += path('M626 112Q626 109 630 109H662L640 140H626Z', V('snow'), { opacity: 0.07 });
    s += rig('sc-hopper', 520, 60, h);
    // the room falls away into shadow above and below the lit lane
    s += g({ 'class': 'sc-ceil' }, FX.fall(0, Y0, 800, 150, 0.7, true)) + FX.fall(0, 244, 800, 56, 0.3);

    // ---- barrier (hidden) ----
    var b = '';
    b += rect(470, 220, 3, 6, 0, V('board-dark')) + rect(790, 220, 3, 6, 0, V('board-dark'));
    b += ao(772, 214, 34, 4, 0.5);
    b += rect(744, 100, 8, 116, 3, 'url(#sc-metald)') + rect(790, 100, 8, 116, 3, 'url(#sc-metald)');
    b += lit(rr(746, 112, 50, 92, 7), 'url(#sc-haz)') + path(rr(746, 112, 50, 92, 7), 'url(#sc-shadel)');
    b += circ(748, 96, 7, V('lamp')) + circ(748, 96, 16, 'url(#sc-glow)', { opacity: 0.7 });
    b += lit(rr(466, 222, 330, 76, 8), 'url(#sc-paper)', null, 1.4) + rect(466, 222, 330, 8, 0, V('pole-red'), { 'clip-path': null });
    b += txt(631, 254, 27, 'FINAL.', { 'text-anchor': 'middle', style: 'font-weight:900', 'letter-spacing': 1 });
    b += txt(631, 287, 27, 'NO FURTHER REWORK', { 'text-anchor': 'middle', style: 'font-weight:800' });
    s += rig('sc-barrier sc-off', 630, 100, b);

    // ---- speech bubble (filled on demand) ----
    s += rig('sc-bubble sc-off', 662, 110, '<path class="sc-bshape" fill="url(#sc-bub)"/><text class="sc-txt sc-btxt" fill="var(--ink)" text-anchor="middle" style="font-weight:650"></text>');

    // ---- mittens ----
    s += g({ 'class': 'sc-mpos', transform: 'translate(430 0)' },
      rig('sc-mitts', 0, 300, g({ 'class': 'sc-mflip' }, mittenMarkup(-46, 236, 0.9, true) + mittenMarkup(42, 252, 1, false)), { style: 'transform-origin:0px 300px;transform:translateY(210px)' }));
    return s;
  }

  NP.scene = NP.scene || {};
  NP.scene.mountBelt = function (el) {
    var svg = mountSVG(el, '0 -170 800 470', beltMarkup(), 'sc-belt', 'xMidYMax slice');
    var treads = q(svg, '.sc-treads'), rolls = qa(svg, '.sc-roll').map(function (n) { return { n: n, c: +n.getAttribute('data-c') }; });
    var hop = q(svg, '.sc-hopper'), gear = q(svg, '.sc-gear'), bub = q(svg, '.sc-bubble'), bshape = q(svg, '.sc-bshape'), btxt = q(svg, '.sc-btxt');
    var lamp = q(svg, '.sc-lamp'), chg = q(svg, '.sc-chglow'), bar = q(svg, '.sc-barrier');
    var mpos = q(svg, '.sc-mpos'), mitts = q(svg, '.sc-mitts'), mflip = q(svg, '.sc-mflip');
    var speed = 0, off = 0, raf = 0, last = 0, talking = false, faceT = 0, flashT = 0, mitT = 0, churnA = [];

    function face(kind) { qa(svg, '.sc-face').forEach(function (n) { n.classList.toggle('sc-off', !n.classList.contains('sc-face-' + kind)); }); }
    function draw() {
      treads.setAttribute('transform', 'translate(' + f(-(off % 24)) + ' 0)');
      var a = f((-off / 10) * 57.2958 % 360);
      rolls.forEach(function (r) { r.n.setAttribute('transform', 'rotate(' + a + ' ' + r.c + ' 241)'); });
    }
    function frame(t) {
      raf = 0;
      if (!speed || reduced()) { last = 0; return; }
      var dt = last ? Math.min(0.1, (t - last) / 1000) : 0;
      last = t; off += speed * dt; draw();
      raf = requestAnimationFrame(frame);
    }
    function run() { if (!raf && speed && !reduced()) { last = 0; raf = requestAnimationFrame(frame); } }

    var api = {
      svg: svg,
      setSpeed: function (u) { speed = Math.max(0, +u || 0); run(); },
      hopperTalk: function (text) {
        if (text == null || text === '') {
          talking = false; face('smug');
          bub.classList.add('sc-off'); op(bub, ''); return;
        }
        talking = true; face('talk');
        var words = String(text).split(/\s+/), sizes = [32, 30, 28, 26], fs = 32, lines, maxW;
        var fits = function (t) { return measure(btxt, t) <= maxW; };
        // first try to stay right of the PACKING sign (x >= 164), then use the full width
        [582, 736].some(function (mw) {
          maxW = mw;
          for (var i = 0; i < (mw < 600 ? 2 : sizes.length); i++) {
            fs = sizes[i]; btxt.setAttribute('font-size', fs);
            lines = wrapWords(words, fits);
            if (lines.length <= 2) return true;
          }
        });
        if (lines.length > 2) {
          var rest = lines.slice(1).join(' ').split(' ');
          while (rest.length > 1 && measure(btxt, rest.join(' ') + '…') > maxW) rest.pop();
          lines = [lines[0], rest.join(' ') + '…'];
        } else if (lines.length === 2) {
          // balance the two lines
          for (var w = maxW - 16; w > 200; w -= 16) {
            var tryL = wrapWords(words, function (t) { return measure(btxt, t) <= w; });
            if (tryL.length > 2) break;
            lines = tryL;
          }
        }
        var tw = 0;
        lines.forEach(function (l) { tw = Math.max(tw, measure(btxt, l)); });
        var lh = fs * 1.12, padX = 22, padY = 10, bw = Math.ceil(tw + padX * 2), bh = lines.length * lh + padY * 2;
        var bx = clamp(600 - bw / 2, bw <= 626 ? 164 : 10, 790 - bw), by = 100 - bh, cx = bx + bw / 2;
        var tx = clamp(660, bx + 30, bx + bw - 30);
        bshape.setAttribute('d', rr(f(bx), f(by), bw, f(bh), 18) + 'M' + (tx - 14) + ' 99L662 111L' + (tx + 12) + ' 99Z');
        btxt.textContent = '';
        lines.forEach(function (l, j) {
          var sp = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
          sp.setAttribute('x', f(cx)); sp.setAttribute('y', f(by + padY + fs * 0.84 + j * lh)); sp.textContent = l;
          btxt.appendChild(sp);
        });
        bub.classList.remove('sc-off');
        if (reduced()) anim(bub, [{ opacity: 0 }, { opacity: 1 }], { duration: 120 });
        else anim(bub, [{ opacity: 0, transform: 'scale(.82)' }, { opacity: 1, transform: 'scale(1.04)', offset: 0.7 }, { opacity: 1, transform: 'scale(1)' }],
          { duration: 220, easing: 'cubic-bezier(.34,1.56,.64,1)' });
      },
      hopperChurn: function () {
        face('think');
        churnA.forEach(stop); churnA = [];
        qa(svg, '.sc-dot').forEach(function (d, i) {
          churnA.push(anim(d, [{ opacity: 0.25 }, { opacity: 1 }, { opacity: 0.25 }], { duration: 420, delay: i * 120, iterations: 2 }));
        });
        if (!reduced()) {
          churnA.push(anim(hop, [{ transform: 'translate(0,0)' }, { transform: 'translate(-2px,1px) rotate(-.4deg)' }, { transform: 'translate(2px,-1px) rotate(.4deg)' },
            { transform: 'translate(-2px,0) rotate(-.3deg)' }, { transform: 'translate(1px,1px)' }, { transform: 'translate(0,0)' }], { duration: 160, iterations: 4 }));
          churnA.push(anim(gear, [{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }], { duration: 640, easing: 'cubic-bezier(.4,0,.6,1)' }));
          churnA.push(anim(q(svg, '.sc-needle'), [{ transform: 'rotate(0deg)' }, { transform: 'rotate(70deg)' }, { transform: 'rotate(-20deg)' }, { transform: 'rotate(0deg)' }], { duration: 640 }));
        }
        clearTimeout(faceT);
        faceT = setTimeout(function () { face(talking ? 'talk' : 'smug'); }, 680);
      },
      chuteFlash: function (kind) {
        var good = kind === 'good';
        q(svg, '.sc-lamp-good').style.display = good ? '' : 'none';
        q(svg, '.sc-lamp-bad').style.display = good ? 'none' : '';
        q(svg, '.sc-chg-good').style.display = good ? '' : 'none';
        q(svg, '.sc-chg-bad').style.display = good ? 'none' : '';
        clearTimeout(flashT);
        lamp.classList.remove('sc-off'); chg.classList.remove('sc-off');
        anim(chg, [{ opacity: 0 }, { opacity: 0.9, offset: 0.15 }, { opacity: 0.6, offset: 0.6 }, { opacity: 0 }], { duration: 1100 });
        if (!reduced()) anim(lamp, [{ transform: 'scale(.6)' }, { transform: 'scale(1.18)', offset: 0.5 }, { transform: 'scale(1)' }], { duration: 300, easing: 'cubic-bezier(.34,1.56,.64,1)' });
        chg.classList.add('sc-off');
        flashT = setTimeout(function () { lamp.classList.add('sc-off'); }, 1300);
      },
      barrier: function (on) {
        var was = !bar.classList.contains('sc-off');
        bar.classList.toggle('sc-off', !on);
        if (on && !was) {
          if (reduced()) anim(bar, [{ opacity: 0 }, { opacity: 1 }], { duration: 120 });
          else anim(bar, [{ opacity: 0, transform: 'translateY(-30px)' }, { opacity: 1, transform: 'translateY(4px)', offset: 0.7 }, { opacity: 1, transform: 'translateY(0)' }],
            { duration: 300, easing: 'cubic-bezier(.2,.8,.2,1)' });
        }
      },
      // dir: 'left'|'right'|'idle'. Optional atX = gift centre x in viewBox units (default 380).
      mittens: function (dir, atX) {
        clearTimeout(mitT);
        if (dir !== 'left' && dir !== 'right') { tf(mitts, 'translateY(210px)'); return; }
        var x = atX == null ? 380 : +atX, L = dir === 'left';
        mpos.setAttribute('transform', 'translate(' + f(clamp(L ? x + 92 : x - 92, 90, 720)) + ' 0)');
        mflip.setAttribute('transform', L ? '' : 'scale(-1 1)');
        if (reduced()) { tf(mitts, 'translateY(0)'); }
        else {
          tf(mitts, L ? 'translate(18px,40px) rotate(6deg)' : 'translate(-18px,40px) rotate(-6deg)');
          mitts.getBoundingClientRect();
          tf(mitts, L ? 'translate(-26px,0) rotate(-12deg)' : 'translate(26px,0) rotate(12deg)');
        }
        mitT = setTimeout(function () { tf(mitts, 'translateY(210px)'); }, 700);
      }
    };
    draw();
    return api;
  };

  /* =====================================================================
     DESK PANEL 400x300
     ===================================================================== */
  var EYE = { l: 250, r: 274, y: 101 };
  function eyes(fn) { return fn(EYE.l, EYE.y) + fn(EYE.r, EYE.y); }
  function cloud(cx, cy, rx, ry, a0, a1, n, jag) {
    var pts = [], i, d;
    for (i = 0; i <= n; i++) { var a = (a0 + (a1 - a0) * i / n) * Math.PI / 180; pts.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]); }
    d = 'M' + f(pts[0][0]) + ' ' + f(pts[0][1]);
    for (i = 1; i <= n; i++) {
      var p = pts[i], o = pts[i - 1];
      if (jag) {
        var am = (a0 + (a1 - a0) * (i - 0.5) / n) * Math.PI / 180, k = 1.13 + (i % 3) * 0.04;
        d += 'L' + f(cx + rx * k * Math.cos(am)) + ' ' + f(cy + ry * k * Math.sin(am)) + 'L' + f(p[0]) + ' ' + f(p[1]);
      } else {
        var r = f(Math.hypot(p[0] - o[0], p[1] - o[1]) * 0.6);
        d += 'A' + r + ' ' + r + ' 0 0 0 ' + f(p[0]) + ' ' + f(p[1]);
      }
    }
    return d + 'C292 122 276 129 262 127C248 129 232 122 ' + f(pts[0][0]) + ' ' + f(pts[0][1]) + 'Z';
  }
  function miniNote(x, y, r, s) {
    return g({ transform: 'translate(' + x + ' ' + y + ') rotate(' + r + ') scale(' + s + ')' },
      rect(-8, -7, 16, 14, 1, 'url(#sc-sticky)') + line('M-5-2H4M-5 2H2', V('ink-soft'), 1.1));
  }
  // mugs gather on the left of the desk; the last one is stacked on another (§9.4 frazzle props)
  var MUGS = [[204, 228, 'paper'], [187, 220, 'pole-green'], [222, 229, 'gold'], [205, 219, 'board'], [188, 229, 'pole-red-dark'], [222, 212, 'snow-shade', 1]];
  // back row first, the stacked mug last, so they overlap correctly; data-i keeps the order they appear in
  function mugsMarkup() { return MUGS.map(function (m, i) { return [m[3] ? 999 : m[1], mug(m, i)]; }).sort(function (a, b) { return a[0] - b[0]; }).map(function (a) { return a[1]; }).join(''); }
  function mug(m, i) {
    var x = m[0], y = m[1], c = V(m[2]);
    return rig('sc-mug sc-off', x, y, ao(x + 1, y, 11, 2.6, 0.5) +
      line('M' + (x + 6) + ' ' + (y - 13.5) + 'C' + (x + 13.5) + ' ' + (y - 14) + ' ' + (x + 13.5) + ' ' + (y - 4) + ' ' + (x + 6) + ' ' + (y - 5), M(m[2], 'night-900', 70), 3) +
      rect(x - 7.5, y - 17, 15, 17, 3, c) + path('M' + (x + 1.5) + ' ' + (y - 17) + 'h3a3 3 0 0 1 3 3v11a3 3 0 0 1-3 3h-3Z', V('night-900'), { opacity: 0.22 }) +
      rect(x - 5.6, y - 14.5, 2.2, 11, 1.1, V('snow'), { opacity: 0.35 }) +
      ell(x, y - 17, 7.5, 2.1, M(m[2], 'snow', 70)) + ell(x, y - 16.7, 6, 1.4, V('wood-dark')), { 'data-i': i });
  }

  function fcMarkup() {
    var s = '';
    var body = 'M222 150C232 141 292 141 302 150C320 162 331 182 336 201H188C193 182 204 162 222 150Z';
    var armL = 'M213 155C207 174 215 195 230 207L250 199C240 188 236 170 238 152Z';
    var armR = 'M288 152C289 170 296 188 305 202L322 196C318 178 316 164 311 155Z';
    var hatN = 'M231 76C228 48 256 34 282 39C300 43 313 56 318 72C312 70 305 66 297 64C298 68 297 72 295 76Z';
    var hatC = 'M231 76C226 56 240 46 252 50C258 40 276 39 281 48C291 51 298 62 301 71C306 78 310 86 309 94C303 90 299 84 296 79L295 76Z';
    var head = '';
    // hair puffs + head
    head += circ(232, 96, 10, 'url(#sc-fur)') + circ(292, 96, 10, 'url(#sc-fur)') + circ(229, 109, 9, 'url(#sc-fur)') + circ(295, 109, 9, 'url(#sc-fur)');
    head += lit(cd(262, 104, 30), 'url(#sc-skin)');
    // eyes (variants)
    var look = '';
    look += g({ 'class': 'sc-eye sc-eye-open' }, eyes(function (x, y) { return ell(x, y, 4.3, 5.7, V('ink')); }));
    look += g({ 'class': 'sc-eye sc-eye-wide sc-off' }, eyes(function (x, y) { return ell(x, y - 0.5, 5.1, 6.7, V('ink')); }));
    look += g({ 'class': 'sc-eye sc-eye-half sc-off' }, eyes(function (x, y) { return path('M' + (x - 4.7) + ' ' + (y - 0.3) + 'A4.7 5.4 0 0 0 ' + (x + 4.7) + ' ' + (y - 0.3) + 'Z', V('ink')) + line('M' + (x - 5.6) + ' ' + (y - 0.6) + 'H' + (x + 5.6), V('ink'), 1.6); }));
    look += g({ 'class': 'sc-eye sc-eye-closed sc-off' }, eyes(function (x, y) { return line('M' + (x - 5) + ' ' + y + 'Q' + x + ' ' + (y + 4.5) + ' ' + (x + 5) + ' ' + y, V('ink'), 2.3); }));
    look += g({ 'class': 'sc-eye sc-eye-spiral sc-off' }, eyes(function (x, y) { return line('M' + x + ' ' + y + 'm-1 0a1 1 0 1 1 2 0a2 2 0 1 1-4 0a3 3 0 1 1 6 0a4 4 0 1 1-8 0a5 5 0 1 1 10 0', V('ink'), 1.4); }));
    head += rig('sc-eyes', 262, 101, rig('sc-blink sc-quick', 262, 101, look));
    head += g({ 'class': 'sc-fz sc-fz2' }, eyes(function (x, y) { return line('M' + (x - 6) + ' ' + (y + 7.5) + 'Q' + x + ' ' + (y + 11) + ' ' + (x + 6) + ' ' + (y + 7.5), V('ink-soft'), 1.5, { opacity: 0.6 }); }));
    // brows
    head += rig('sc-brow-l sc-quick', 250, 90, rect(241, 86.5, 18, 7, 3.5, V('snow')) + rect(243, 91, 15, 2.5, 1.2, V('snow-shade')));
    head += rig('sc-brow-r sc-quick', 274, 90, rect(265, 86.5, 18, 7, 3.5, V('snow')) + rect(266, 91, 15, 2.5, 1.2, V('snow-shade')));
    // beard (smooth / jagged), moustache
    head += g({ 'class': 'sc-beard0' }, lit(cloud(262, 131, 39, 47, 200, -20, 10, false), 'url(#sc-fur)', null, 2));
    head += g({ 'class': 'sc-beard2 sc-off' }, lit(cloud(262, 131, 39, 47, 200, -20, 15, true), 'url(#sc-fur)', null, 2));
    head += ell(268, 150, 27, 22, V('snow-shade'), { opacity: 0.2 });
    head += ell(250, 128, 13, 6, V('snow-shade'), { transform: 'rotate(-14 250 128)', opacity: 0.8 }) + ell(274, 128, 13, 6, V('snow-shade'), { transform: 'rotate(14 274 128)', opacity: 0.8 });
    head += ell(250, 125, 13, 7, V('snow'), { transform: 'rotate(-14 250 125)' }) + ell(274, 125, 13, 7, V('snow'), { transform: 'rotate(14 274 125)' });
    // nose + glasses
    head += ell(263, 122, 9, 2.5, V('night-900'), { opacity: 0.12 }) + lit(cd(262, 114, 7.5), 'url(#sc-nose)', null, 1.2);
    head += g({ 'class': 'sc-glasses' },
      eyes(function (x) { return path('M' + (x - 9.5) + ' 104H' + (x + 9.5) + 'A9.5 8.5 0 0 1 ' + (x - 9.5) + ' 104Z', V('snow'), { opacity: 0.2, stroke: V('gold-dark'), 'stroke-width': 1.8 }); }) +
      line('M259.5 105Q262 102 264.5 105M240.5 104.5L232 99.5M283.5 104.5L292 99.5', V('gold-dark'), 1.8) +
      line('M243 107.5Q244 110 247 111', V('snow'), 1.2, { opacity: 0.45 }));
    // frazzle extras
    head += g({ 'class': 'sc-fz sc-fz3' }, miniNote(242, 156, -14, 1) + miniNote(283, 163, 11, 0.9) + miniNote(260, 172, -4, 0.85));
    head += g({ 'class': 'sc-fz sc-fz1' },
      path('M226 92C218 88 214 80 216 72C219 80 224 84 230 86Z', 'url(#sc-fur)') + path('M297 90C306 88 310 80 309 72C306 79 301 83 294 84Z', 'url(#sc-fur)') +
      path('M220 150C211 152 205 148 202 142C209 145 214 144 219 141Z', 'url(#sc-fur)'));
    head += rig('sc-sweat sc-off', 302, 92, path('M302 85C305 90 307 93 307 95.5A5 5 0 0 1 297 95.5C297 93 299 90 302 85Z', M('snow', 'snow-shade', 45)) + ell(300.3, 94, 1.3, 2, V('snow')));
    // hat
    head += rig('sc-hat', 262, 80,
      g({ 'class': 'sc-hat0' }, lit(hatN, 'url(#sc-red)') + path('M282 39C300 43 313 56 318 72C312 70 305 66 297 64C294 52 289 45 282 39Z', V('pole-red-dark'), { opacity: 0.45 }) + lit(cd(318, 75, 8), 'url(#sc-fur)', null, 1.4)) +
      g({ 'class': 'sc-hat3 sc-off' }, lit(hatC, 'url(#sc-red)') + line('M252 50C258 58 262 64 262 74M281 48C283 56 286 64 289 72', V('pole-red-dark'), 2.2, { opacity: 0.7 }) +
        rect(268, 56, 9, 8, 1, V('paper-shade'), { transform: 'rotate(18 272 60)' }) + lit(cd(309, 96, 7), 'url(#sc-fur)', null, 1.4)) +
      lit(rr(226, 70, 72, 17, 8.5), 'url(#sc-fur)', null, 1.5) + rect(230, 82, 64, 4, 2, V('snow-shade'), { opacity: 0.7 }));

    var heldG = '<g class="sc-held-in"></g>';
    s += ao(262, 202, 70, 5, 0.45);
    s += rig('sc-breath', 262, 200, rig('sc-torso', 262, 200,
      lit(body, 'url(#sc-red)', null, 2.2) + path('M302 150C320 162 331 182 336 201H303C306 182 305 164 302 150Z', V('pole-red-dark'), { opacity: 0.5 }) +
      // lit shoulder (key light upper left), fur placket down the front of the plain coat
      path('M211 166C217 154 229 147 243 146C232 152 224 160 219 172Z', V('lamp'), { opacity: 0.28 }) +
      line('M262 176C261 186 262 194 263 202', V('pole-red-dark'), 1.6, { opacity: 0.55 }) +
      rig('sc-arm-l', 227, 152, lit(armL, 'url(#sc-red)', null, 1.6) + path('M229 201C234 194 248 192 253 197L251 204C245 200 237 202 231 208Z', 'url(#sc-fur)') +
        rig('sc-hand-l sc-quick', 245, 206, lit(cd(245, 207, 8), 'url(#sc-skin)', null, 1.3) +
          g({ 'class': 'sc-held sc-off', transform: 'translate(245 205) rotate(-168) translate(-24 -56)' }, heldG))) +
      rig('sc-head', 262, 140, head) +
      ell(262, 152, 42, 26, 'url(#sc-glowc)', { 'class': 'sc-sglow', opacity: 0.12 }) +
      rig('sc-arm-r', 299, 152, lit(armR, 'url(#sc-red)', null, 1.6) + path('M302 199C308 193 320 192 324 196L322 202C316 199 310 201 304 205Z', 'url(#sc-fur)') +
        rig('sc-hand sc-quick', 314, 204, lit(cd(314, 205, 8), 'url(#sc-skin)', null, 1.3)))));
    return s;
  }

  // Father Christmas markup for reuse (intro, cutscenes): the same rig as the desk, in his own units
  // (body bottom centre at 262,201). opts.chair adds his desk chair behind him. Callers toggle the
  // sc-fz*/sc-beard*/sc-hat*/sc-eye-* variant classes themselves; defs are injected here.
  NP.scene = NP.scene || {};
  NP.scene.fcArt = function (opts) {
    opts = opts || {};
    ensureDefs();
    return g({ 'class': 'sc-fc' }, (opts.chair ? lit(rr(206, 112, 112, 100, 26), 'url(#sc-metald)', null, 1.4) + rect(218, 124, 88, 4, 2, V('snow'), { opacity: 0.08 }) : '') + fcMarkup());
  };

  // Father Christmas sits ~16% larger than drawn, pivoting about his head (rig pivots stay in his own units)
  var FC_T = 'translate(252 100) scale(1.16) translate(-262 -104)';
  var LID = { x: 296, y: 146, w: 100, h: 69 };   // laptop lid (back towards us): the newest sticky goes here
  function deskMarkup() {
    var s = wallBase(400, -9, 0.75);
    // high basement window: moonlight outside, snow on the sill, a cool shaft down onto the rejects
    s += g({ transform: 'translate(-10 0)' }, path(rr(109, 19, 72, 56, 5), V('night-900'), { opacity: 0.4 }) + lit(rr(112, 22, 66, 50, 4), 'url(#sc-metald)', null, 1.2) + path(rr(117, 26, 56, 42, 2), 'url(#sc-sky)') +
      circ(160, 38, 5.5, V('snow'), { opacity: 0.9 }) + circ(162.5, 36.5, 5, M('night-600', 'night-900', 60)) +
      path('M117 68V60C122 56 128 58 133 55C140 52 148 57 156 54C162 52 168 56 173 54V68Z', V('snow-shade')) + path('M117 68V62C124 59 130 61 136 59C144 56 150 60 158 58C164 57 169 59 173 58V68Z', V('snow')) +
      rect(143.5, 26, 3, 42, 0, 'url(#sc-metald)') + rect(117, 45, 56, 2.4, 0, 'url(#sc-metald)') +
      circ(127, 36, 1.3, V('snow')) + circ(136, 31, 1, V('snow')) + circ(150, 33, 0.9, V('snow')) + circ(124, 52, 1, V('snow'), { opacity: 0.7 }) +
      path('M109 75H181L183 80H107Z', M('board', 'snow', 70)) + rect(107, 80, 76, 3, 0, V('night-900'), { opacity: 0.4 }));
    s += haze(400);
    s += FX.pool(135, 47, 62, 50, 0.5, 'cool') + FX.cone(135, 74, 60, 170, 190, 0.5, { skew: -58, cool: true }) + FX.pool(74, 276, 110, 22, 0.3, 'cool');
    // key light: pendant lamp up and to the left of him. Its beam falls down and to the right, and he throws a shadow on the wall.
    s += FX.pool(244, 132, 200, 170, 0.42) + FX.cone(193, 30, 30, 260, 184, 0.5, { skew: 66 }) + FX.motes(190, 50, 150, 130, 8, 9, { r: 1.2 });
    s += FX.cast(334, 150, 58, 84, 0.5, 12);
    s += pendant(193, 27, 0, 0.7);
    // REJECTS paper sign (background: kept soft)
    s += g({ transform: 'translate(-30 -44) rotate(-3 82 98)', opacity: 0.86 }, lit(rr(36, 84, 94, 30, 2), 'url(#sc-paper)', null, 1.2) +
      rect(74, 79, 16, 9, 1, V('paper-shade'), { opacity: 0.85, transform: 'rotate(8 82 83)' }) +
      txt(83, 106, 17, 'REJECTS', { 'text-anchor': 'middle', 'class': 'sc-txt sc-script', fill: V('ink-soft'), style: 'font-weight:700', 'letter-spacing': 1 }));
    s += floor(400);
    s += ao(100, 293, 40, 9, 0, { 'class': 'sc-pileao' });
    // desk top, then him (chair included), then the desk front
    s += rect(178, 212, 222, 16, 0, 'url(#sc-desktop)') + FX.tex('wood', 178, 212, 222, 16, 0.6) + rect(178, 212, 222, 4, 0, V('night-900'), { opacity: 0.18 }) + FX.pool(270, 219, 120, 9, 0.5);
    s += g({ transform: FC_T }, lit(rr(206, 112, 112, 100, 26), 'url(#sc-metald)', null, 1.4) + rect(218, 124, 88, 4, 2, V('snow'), { opacity: 0.08 }) + fcMarkup());
    s += rect(178, 228, 222, 2, 0, V('lamp'), { opacity: 0.45 }) + rect(178, 230, 222, 70, 0, 'url(#sc-woodd)') + FX.tex('wood', 178, 230, 222, 70, 0.75, { scale: 0.7 }) + rect(178, 230, 222, 10, 0, 'url(#sc-aov)') +
      rect(178, 212, 2, 88, 0, V('lamp'), { opacity: 0.3 });
    s += path(rr(206, 246, 84, 44, 5), V('night-900'), { opacity: 0.16 }) + rect(208, 289, 80, 1.5, 0, V('lamp'), { opacity: 0.16 }) + rect(238, 260, 24, 4, 2, V('gold-dark'));
    s += path(rr(304, 246, 84, 44, 5), V('night-900'), { opacity: 0.16 }) + rect(306, 289, 80, 1.5, 0, V('lamp'), { opacity: 0.16 }) + rect(334, 260, 24, 4, 2, V('gold-dark'));
    // laptop (lid back towards us)
    var L = LID;
    s += ao(L.x + 50, 223, 62, 4.5, 0.55);
    s += path('M' + (L.x - 6) + ' 214H' + (L.x + L.w) + 'L' + (L.x + L.w + 4) + ' 223H' + (L.x - 10) + 'Z', 'url(#sc-metald)') + rect(L.x - 4, 213.6, L.w + 2, 1.6, 0, V('snow'), { opacity: 0.25 });
    s += lit(rr(L.x, L.y, L.w, L.h, 7), 'url(#sc-metal)', null, 1.6) + rect(L.x + 2, L.y + L.h - 6, L.w - 4, 5, 0, V('board-dark'), { opacity: 0.6 }) +
      path('M' + (L.x + 8) + ' ' + (L.y + 4) + 'H' + (L.x + 44) + 'L' + (L.x + 24) + ' ' + (L.y + 46) + 'H' + (L.x + 8) + 'Z', V('snow'), { opacity: 0.06 });
    s += ell(L.x + 50, L.y - 2, 58, 10, 'url(#sc-glowc)', { 'class': 'sc-sglow2', opacity: 0.3 });
    s += FX.fall(0, 232, 400, 68, 0.4) + FX.fall(0, 0, 400, 70, 0.45, true);
    s += mugsMarkup();
    // warm the sticky-note faces (script regular + UI bold) at mount so the first note measures true
    s += T('text', { x: 2, y: 298, 'class': 'sc-script', 'font-size': 4, 'fill-opacity': 0 }, 'why ?') + T('text', { x: 2, y: 298, 'class': 'sc-txt', 'font-size': 4, 'fill-opacity': 0 }, 'why ?');
    s += g({ 'class': 'sc-notes' });
    s += g({ 'class': 'sc-pile' });
    s += rig('sc-q sc-off', 350, 40, circ(350, 40, 16, 'url(#sc-paper)') + circ(333, 55, 4.5, 'url(#sc-paper)') + circ(325, 62, 2.6, 'url(#sc-paper)') +
      line('M344.5 34.5C344.5 27 355.5 27 355.5 34C355.5 39 350 39.5 350 44.5', V('ink'), 3.6) + circ(350, 50.5, 2.3, V('ink')));
    return s;
  }

  // pile: 24 fixed slots, a low wide heap on the floor, filled from the bottom row up (smaller toys higher up).
  // Every slot is clamped so the tilted toy stays fully inside the panel with a margin.
  var SLOTS = (function () {
    // [count, bottom y, left x, right x, toy size, max tilt]
    var rows = [[7, 297, 30, 214, 50, 10], [6, 281, 42, 194, 48, 22], [5, 265, 52, 166, 46, 26], [3, 250, 64, 136, 44, 26], [2, 236, 80, 120, 42, 24], [1, 223, 99, 99, 40, 16]], out = [];
    seed = 11;
    rows.forEach(function (r) {
      var row = [];
      for (var i = 0; i < r[0]; i++) {
        var x = r[0] > 1 ? r[2] + (r[3] - r[2]) * i / (r[0] - 1) : r[2];
        row.push(clampSlot([x + (rnd() - 0.5) * 8, r[1] + (rnd() - 0.5) * 4, (rnd() - 0.5) * 2 * r[5], r[4]]));
      }
      row.sort(function () { return rnd() - 0.5; });
      out = out.concat(row);
    });
    return out;
  })();
  // slot = [x, bottom y, tilt, size]; the toy's live area is ~0.88 of its box, centred just above the middle
  function clampSlot(sl) {
    var sz = sl[3], c = sz * 0.44, a = sl[2] * Math.PI / 180, ext = c * (Math.abs(Math.cos(a)) + Math.abs(Math.sin(a))), m = 6, dy = sz * 0.53;
    return [f(clamp(sl[0], m + ext, 394 - ext)), f(clamp(sl[1], m + ext + dy, 300 - m - ext + dy)), f(sl[2]), sz];
  }

  function giftMarkup(spec) {
    var str = '';
    try { if (typeof NP.giftSVG === 'function') str = NP.giftSVG(spec) || ''; } catch (e) { str = ''; }
    if (!/<svg/i.test(str)) {
      str = '<svg viewBox="0 0 64 64">' + ao(32, 56, 26, 4, 0.4) + rect(10, 20, 44, 36, 6, 'url(#sc-gold)') + rect(29, 20, 6, 36, 0, V('pole-red')) +
        rect(10, 34, 44, 6, 0, V('pole-red')) + rect(10, 48, 44, 8, 0, V('night-900'), { opacity: 0.15 }) + '</svg>';
    }
    return str;
  }
  function placeGift(gEl, spec, x, y, size) {
    gEl.innerHTML = giftMarkup(spec);
    var sv = gEl.firstElementChild;
    if (sv && sv.tagName.toLowerCase() === 'svg') {
      sv.setAttribute('x', x); sv.setAttribute('y', y); sv.setAttribute('width', size); sv.setAttribute('height', size);
      sv.setAttribute('overflow', 'visible');
      sv.style.width = size + 'px'; sv.style.height = size + 'px'; sv.style.overflow = 'visible';
    }
  }

  var POSE = {
    idle: { eyes: 'open' },
    look: { head: 'translate(-3px,1px) rotate(-7deg)', look: [-3, 1], bl: 'translateY(-3px)', br: 'translateY(-3px)', eyes: 'open' },
    scratch: { head: 'rotate(6deg)', ar: 'rotate(-168deg)', look: [1, -1.5], bl: 'rotate(-14deg)', br: 'rotate(14deg)', eyes: 'half', hard: 1 },
    type: { head: 'translateY(2px) rotate(2deg)', al: 'rotate(-20deg)', look: [2, 2.2], bl: 'translateY(2px) rotate(12deg)', br: 'translateY(2px) rotate(-12deg)', eyes: 'half', hard: 1, sweat: 1 },
    puzzled: { head: 'rotate(-6deg)', al: 'rotate(168deg)', look: [-2.5, -2], bl: 'translateY(-5px) rotate(-8deg)', br: 'translateY(1px) rotate(-10deg)', eyes: 'wide', q: 1, held: 1 },
    relief: { head: 'translateY(1.5px) rotate(-2deg)', torso: 'translateY(2px) scale(1.02,.98)', bl: 'translateY(-2px) rotate(-6deg)', br: 'translateY(-2px) rotate(6deg)', eyes: 'closed' }
  };

  NP.scene.mountDesk = function (el) {
    var svg = mountSVG(el, '0 0 400 300', deskMarkup(), 'sc-desk');
    var P = {};
    ['breath', 'torso', 'head', 'eyes', 'blink', 'brow-l', 'brow-r', 'arm-l', 'arm-r', 'hand', 'hand-l', 'hat', 'sweat', 'q', 'held', 'sglow', 'sglow2', 'notes', 'pile', 'pileao']
      .forEach(function (n) { P[n] = q(svg, '.sc-' + n); });
    var stage = 0, pose = 'idle', loops = [], idleLoops = [], gen = 0, timers = [], count = 0, lastSpec = null, mugN = 0, cur = null, old = [];

    function later(ms, fn) { timers.push(setTimeout(fn, ms)); }
    function clearTimers() { timers.forEach(clearTimeout); timers = []; }
    function eye(kind) { qa(svg, '.sc-eye').forEach(function (n) { n.classList.toggle('sc-off', !n.classList.contains('sc-eye-' + kind)); }); }
    function startIdle() {
      if (idleLoops.length || reduced()) return;
      idleLoops.push(anim(P.breath, [{ transform: 'scale(1,1)' }, { transform: 'scale(1.012,1.022)' }], { duration: 1700, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' }));
      idleLoops.push(anim(P.blink, [{ transform: 'scaleY(1)' }, { transform: 'scaleY(1)', offset: 0.94 }, { transform: 'scaleY(.12)', offset: 0.965 }, { transform: 'scaleY(1)' }], { duration: 4300, iterations: Infinity }));
    }
    function stopIdle() { idleLoops.forEach(stop); idleLoops = []; }

    function setPose(kind) {
      var p = POSE[kind] || POSE.idle;
      pose = POSE[kind] ? kind : 'idle';
      loops.forEach(stop); loops = [];
      if (reduced()) stopIdle(); else startIdle();
      tf(P.head, p.head); tf(P.torso, p.torso); tf(P['arm-l'], p.al); tf(P['arm-r'], p.ar);
      tf(P['brow-l'], p.bl); tf(P['brow-r'], p.br);
      tf(P.eyes, p.look ? 'translate(' + p.look[0] + 'px,' + p.look[1] + 'px)' : '');
      eye(stage >= 3 && p.hard ? 'spiral' : p.eyes);
      P.sweat.classList.toggle('sc-off', !(stage >= 1 || p.sweat || p.hard));
      // held gift + question mark
      if (p.held) {
        placeGift(q(svg, '.sc-held-in'), lastSpec ? ext(ext({}, lastSpec), { broken: false, scale: null }) : { icon: 'giftbox' }, 0, 0, 48);
        P.held.classList.remove('sc-off');
      } else P.held.classList.add('sc-off');
      var qWas = !P.q.classList.contains('sc-off');
      P.q.classList.toggle('sc-off', !p.q);
      if (reduced()) return;
      if (p.q && !qWas) loops.push(anim(P.q, [{ transform: 'scale(0)', opacity: 0 }, { transform: 'scale(0)', opacity: 0, offset: 0.4 }, { transform: 'scale(1.15)', opacity: 1, offset: 0.8 }, { transform: 'scale(1)', opacity: 1 }], { duration: 560, easing: 'cubic-bezier(.34,1.56,.64,1)' }));
      if (pose === 'type') {
        loops.push(anim(P['hand-l'], [{ transform: 'translateY(0)' }, { transform: 'translateY(-3.5px)' }], { duration: 105, iterations: 14, direction: 'alternate', delay: 200 }));
        loops.push(anim(P.hand, [{ transform: 'translateY(-3px)' }, { transform: 'translateY(0)' }], { duration: 120, iterations: 12, direction: 'alternate', delay: 250 }));
        loops.push(anim(P.sglow2, [{ opacity: 0.25 }, { opacity: 0.55 }], { duration: 160, iterations: 10, direction: 'alternate' }));
        loops.push(anim(P.sweat, [{ transform: 'translateY(-2px)', opacity: 1 }, { transform: 'translateY(5px)', opacity: 0.4 }], { duration: 800, iterations: 2 }));
      }
      if (pose === 'scratch') loops.push(anim(P.hand, [{ transform: 'rotate(-20deg)' }, { transform: 'rotate(16deg)' }], { duration: 140, iterations: 6, direction: 'alternate', delay: 280 }));
      if (pose === 'look') loops.push(anim(P.blink, [{ transform: 'scaleY(1)' }, { transform: 'scaleY(.12)', offset: 0.5 }, { transform: 'scaleY(1)' }], { duration: 160, delay: 380 }));
    }

    function frazzle(n) {
      stage = clamp(Math.round(+n || 0), 0, 3);
      qa(svg, '.sc-fz').forEach(function (e) {
        var k = +e.getAttribute('class').match(/sc-fz(\d)/)[1];
        e.classList.toggle('sc-off', stage < k);
      });
      q(svg, '.sc-beard0').classList.toggle('sc-off', stage >= 2);
      q(svg, '.sc-beard2').classList.toggle('sc-off', stage < 2);
      q(svg, '.sc-hat0').classList.toggle('sc-off', stage >= 3);
      q(svg, '.sc-hat3').classList.toggle('sc-off', stage < 3);
      tf(P.hat, stage >= 3 ? 'translate(1px,2px) rotate(9deg)' : stage >= 2 ? 'rotate(8deg)' : '');
      setPose(pose);
    }

    // Older notes shrink to blank scribbles round the laptop and on the wall, clear of his face.
    var OLD = [[384, 128, 9], [362, 104, -8], [389, 84, 5], [338, 240, -4]];
    var stickyT = 0;
    function demote() {
      clearTimeout(stickyT);
      if (!cur) return;
      old.push(cur);
      if (old.length > OLD.length) { var gone = old.shift(); if (gone.parentNode) gone.parentNode.removeChild(gone); }
      old.forEach(function (n, i) {
        var sl = OLD[(old.length - 1 - i) % OLD.length], sc = f(34 / (+n.getAttribute('data-w') || 100));
        n.setAttribute('transform', 'translate(' + sl[0] + ' ' + sl[1] + ') rotate(' + sl[2] + ') scale(' + sc + ')');
        var t = n.querySelector('text');
        if (t) t.parentNode.removeChild(t);
        var s2 = n.querySelector('.sc-scrib');
        if (s2) s2.removeAttribute('style');
      });
      cur = null;
    }
    // px per viewBox unit as rendered (the desk is letterboxed on phones)
    function pxPerUnit() {
      var r = svg.getBoundingClientRect();
      return r.width && r.height ? Math.min(r.width / 400, r.height / 300) : 0;
    }
    function sticky(text) {
      var NSs = 'http://www.w3.org/2000/svg';
      demote();
      if (text == null || text === '') return;
      var note = document.createElementNS(NSs, 'g');
      note.setAttribute('class', 'sc-note');
      note.innerHTML = '<g class="sc-note-pop sc-rig" style="transform-origin:0px 0px"><path class="sc-nbody" fill="url(#sc-sticky)"/><path class="sc-ncurl" fill="' + M('gold', 'lamp', 70) + '"/>' +
        '<rect class="sc-ntape" fill="' + V('gold') + '" opacity=".22"/><path class="sc-scrib" fill="none" stroke="' + V('ink-soft') + '" stroke-width="7" stroke-linecap="round" style="display:none"/>' +
        '<text fill="var(--ink)" text-anchor="middle"></text></g>';
      P.notes.appendChild(note);
      var rot = f((rnd() - 0.5) * 5);
      layoutNote(note, String(text), rot);
      cur = note;
      // system script fonts can finish loading after the first measure: lay it out again once they have
      var relay = function () { if (cur === note) layoutNote(note, String(text), rot); };
      setTimeout(relay, 90); setTimeout(relay, 800); setTimeout(relay, 2000);
      var pop = q(note, '.sc-note-pop');
      if (reduced()) anim(pop, [{ opacity: 0 }, { opacity: 1 }], { duration: 120 });
      else anim(pop, [{ transform: 'scale(.3) rotate(-12deg)', opacity: 0 }, { transform: 'scale(1.08) rotate(3deg)', opacity: 1, offset: 0.65 }, { transform: 'scale(1) rotate(0)', opacity: 1 }],
        { duration: 300, easing: 'cubic-bezier(.34,1.56,.64,1)' });
      // it is a reaction to one toy: after a while it joins the scribbles, so it never outlives its moment
      stickyT = setTimeout(function () { if (cur === note) demote(); }, 9000);
    }
    function layoutNote(note, text, rot) {
      var NSs = 'http://www.w3.org/2000/svg', t = note.querySelector('text'), k = pxPerUnit();
      if (!t) return;
      // the readable note renders at >= 14px: 15 units on desktop, up to 25 on a letterboxed phone desk
      var fs = clamp(Math.ceil(14.4 / (k || 0.95)), 15, 25), maxW = LID.w + 12, lines, w = 0, script = true;
      var words = String(text).split(/\s+/);
      function fit() {
        t.setAttribute('class', script ? 'sc-script' : 'sc-txt');
        t.setAttribute('font-size', fs); t.style.fontSize = fs + 'px';
        lines = wrapWords(words, function (s2) { return measure(t, s2) <= maxW - 14; });
        w = 0; lines.forEach(function (l) { w = Math.max(w, measure(t, l)); });
        return lines.length <= 3 && w <= maxW - 14;
      }
      if (!fit()) { script = false; if (!fit()) { fs = Math.max(14, Math.floor(fs * (maxW - 14) / w)); fit(); } }
      if (lines.length > 4) { lines = lines.slice(0, 4); lines[3] += '…'; }
      t.textContent = '';
      var lh = f(fs * (script ? 1.22 : 1.12)), nw = Math.ceil(clamp(w + 16, 64, maxW)), nh = Math.ceil(lines.length * lh + 14);
      lines.forEach(function (l, i) {
        var sp = document.createElementNS(NSs, 'tspan');
        sp.setAttribute('x', 0); sp.setAttribute('y', f(9 + fs * 0.86 + i * lh)); sp.textContent = l;
        t.appendChild(sp);
      });
      var hw = nw / 2;
      q(note, '.sc-nbody').setAttribute('d', 'M' + -hw + ' 1Q' + -hw + ' 0 ' + (-hw + 1) + ' 0H' + hw + 'V' + (nh - 11) + 'L' + (hw - 11) + ' ' + nh + 'H' + (-hw + 1) + 'Q' + -hw + ' ' + nh + ' ' + -hw + ' ' + (nh - 1) + 'Z');
      q(note, '.sc-ncurl').setAttribute('d', 'M' + hw + ' ' + (nh - 11) + 'L' + (hw - 11) + ' ' + nh + 'Q' + (hw - 9) + ' ' + (nh - 9) + ' ' + hw + ' ' + (nh - 11) + 'Z');
      q(note, '.sc-scrib').setAttribute('d', 'M' + f(-hw + 12) + ' ' + f(nh * 0.38) + 'H' + f(hw - 16) + 'M' + f(-hw + 12) + ' ' + f(nh * 0.66) + 'H' + f(hw * 0.3));
      var tp = q(note, '.sc-ntape'); tp.setAttribute('x', -hw); tp.setAttribute('y', 0); tp.setAttribute('width', nw); tp.setAttribute('height', 7);
      note.setAttribute('data-w', nw);
      // on the laptop lid, right of his beard, kept inside the panel
      var cx = clamp(LID.x + LID.w / 2, LID.x - 4 + hw, 398 - hw), top = LID.y + 3;
      note.setAttribute('transform', 'translate(' + f(cx) + ' ' + top + ') rotate(' + rot + ')');
    }

    var api = {
      svg: svg,
      pileAdd: function (spec) {
        spec = spec || {};
        lastSpec = spec;
        var i = count++, sl = SLOTS[i % SLOTS.length].slice(), lift = Math.floor(i / SLOTS.length);
        if (lift) { sl = SLOTS[11 + (i % 13)].slice(); sl[1] -= 9 * lift; sl[2] = -sl[2]; sl = clampSlot(sl); }
        var NSs = 'http://www.w3.org/2000/svg', outer = document.createElementNS(NSs, 'g'), sz = sl[3], hs = sz / 2;
        outer.setAttribute('transform', 'translate(' + sl[0] + ' ' + sl[1] + ')');
        // grounding shadow under the toy (on the floor or on the toys beneath), untilted
        outer.innerHTML = '<g class="sc-tao">' + (sl[1] > 288 ? ao(0, -sz * 0.11, hs + 3, 5.5, 0.5) + ao(0, -sz * 0.12, hs - 5, 2.6, 0.7) : ao(0, -sz * 0.13, hs - 4, 3.2, 0.42)) + '</g>' +
          '<g class="sc-drop sc-rig" style="transform-origin:0px 0px;transition:none"><g class="sc-gift"></g></g>';
        // a giant toy lands in the pile at normal size (it would bury the heap); the slot sets the tilt
        placeGift(q(outer, '.sc-gift'), ext(ext({}, spec), { broken: true, scale: spec.scale === 'giant' ? null : spec.scale, tilt: sl[2] }), -hs, -sz, sz);
        P.pile.appendChild(outer);
        var pa = P.pileao, nn = Math.min(count, SLOTS.length);
        pa.setAttribute('rx', f(40 + nn * 2.8)); pa.setAttribute('ry', f(8 + nn * 0.25)); pa.setAttribute('cx', f(100 + Math.min(nn, 6) * 1));
        pa.setAttribute('opacity', f(Math.min(0.62, 0.3 + count * 0.03)));
        if (reduced()) return Promise.resolve();
        anim(q(outer, '.sc-drop'), [
          { transform: 'translateY(-330px) scale(.96,1.06)', easing: 'cubic-bezier(.5,0,.75,0)' },
          { transform: 'translateY(0) scale(1,1)', offset: 0.7 },
          { transform: 'translateY(0) scale(1.12,.88)', offset: 0.83 },
          { transform: 'translateY(0) scale(1,1)' }], { duration: 600 });
        anim(q(outer, '.sc-tao'), [{ opacity: 0 }, { opacity: 0, offset: 0.55 }, { opacity: 1 }], { duration: 600 });
        return new Promise(function (res) { setTimeout(res, 420); });
      },
      fc: function (kind) { gen++; clearTimers(); setPose(kind); },
      react: function (isCorrect) {
        var my = ++gen; clearTimers();
        return new Promise(function (res) {
          function step(kind, ms, next) { if (my !== gen) return res(); setPose(kind); later(ms, next); }
          if (isCorrect) step('puzzled', 2300, function () { if (my === gen) setPose('idle'); res(); });
          else step('look', 650, function () { step('scratch', 950, function () { step('type', 1000, function () { if (my === gen) setPose('idle'); res(); }); }); });
        });
      },
      frazzle: frazzle,
      sticky: sticky,
      mugs: function (n) {
        n = clamp(Math.round(+n || 0), 0, MUGS.length);
        qa(svg, '.sc-mug').forEach(function (m) {
          var on = +m.getAttribute('data-i') < n, was = !m.classList.contains('sc-off');
          m.classList.toggle('sc-off', !on);
          if (on && !was && !reduced()) anim(m, [{ transform: 'scale(.2,1.4) translateY(-20px)', opacity: 0 }, { transform: 'scale(1.1,.9)', opacity: 1, offset: 0.7 }, { transform: 'scale(1)', opacity: 1 }], { duration: 360, easing: 'cubic-bezier(.2,.8,.2,1)' });
        });
        mugN = n;
      }
    };
    frazzle(0);
    return api;
  };
})(window.NP);
