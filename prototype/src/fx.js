/* fx.js: shared lighting, atmosphere and material textures for every scene (ids and classes prefixed fx-).
   Textures are baked once at load on a small canvas and used as SVG pattern fills, so nothing here runs a live
   filter (SPEC §9.3, §9.9). Light is additive (screen blend); shade is multiplied. Only opacity and transform animate. */
window.NP = window.NP || {};
(function (NP) {
  'use strict';

  function V(n) { return 'var(--' + n + ')'; }
  function f(n) { return Math.round(n * 10) / 10; }
  function A(o) { var s = ''; for (var k in o) if (o[k] != null) s += ' ' + k + '="' + o[k] + '"'; return s; }
  function T(t, o, i) { return '<' + t + A(o || {}) + (i == null ? '/>' : '>' + i + '</' + t + '>'); }
  function mg(a, b) { a = a || {}; if (b) for (var k in b) a[k] = b[k]; return a; }

  /* ---------- seeded noise ---------- */
  function rng(seed) { var s = seed || 1; return function () { s = (s * 16807) % 2147483647; return s / 2147483647; }; }
  // value noise that tiles over a gx-by-gy lattice
  function lattice(gx, gy, r) {
    var g = [], i;
    for (i = 0; i < gx * gy; i++) g.push(r());
    return function (u, v) {
      var x = u * gx, y = v * gy, x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0;
      fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy);
      var a = g[(y0 % gy) * gx + (x0 % gx)], b = g[(y0 % gy) * gx + ((x0 + 1) % gx)],
        c = g[((y0 + 1) % gy) * gx + (x0 % gx)], d = g[((y0 + 1) % gy) * gx + ((x0 + 1) % gx)];
      return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
    };
  }
  var DARK = [14, 21, 48], LIGHT = [255, 226, 176];
  // bake(w, h, fn): fn(u, v, x, y) returns a signed tone, negative = shade, positive = light, magnitude = alpha
  function bake(w, h, fn) {
    var c = document.createElement('canvas'), x, y, d, im, i, t, col;
    c.width = w; c.height = h;
    var ctx = c.getContext && c.getContext('2d');
    if (!ctx) return '';
    im = ctx.createImageData(w, h); d = im.data;
    for (y = 0; y < h; y++) for (x = 0; x < w; x++) {
      t = fn(x / w, y / h, x, y); col = t < 0 ? DARK : LIGHT; i = (y * w + x) * 4;
      d[i] = col[0]; d[i + 1] = col[1]; d[i + 2] = col[2]; d[i + 3] = Math.max(0, Math.min(255, Math.abs(t) * 255));
    }
    ctx.putImageData(im, 0, 0);
    try { return c.toDataURL('image/png'); } catch (e) { return ''; }
  }

  /* ---------- textures ---------- */
  var TEX = {
    // fine print grain: stippled shade and light
    grain: [160, 160, 160, 160, function () {
      var r = rng(31);
      return function () { var v = r() - 0.5; return v * Math.abs(v) * 1.5; };
    }],
    // soft blotches for plaster, concrete and painted walls
    mottle: [256, 256, 512, 512, function () {
      var a = lattice(4, 4, rng(5)), b = lattice(9, 9, rng(9)), c = lattice(23, 23, rng(13)), r = rng(17);
      return function (u, v) { return ((a(u, v) - 0.5) * 0.26 + (b(u, v) - 0.5) * 0.18 + (c(u, v) - 0.5) * 0.1) + (r() - 0.5) * 0.05; };
    }],
    // long wood grain, running left to right
    wood: [512, 128, 512, 128, function () {
      var a = lattice(3, 40, rng(3)), b = lattice(2, 13, rng(7)), w = lattice(5, 3, rng(11)), r = rng(19);
      return function (u, v) {
        var vv = (v + (w(u, v) - 0.5) * 0.045 + 1) % 1, t = (a(u, vv) - 0.5) * 0.34 + (b(u, vv) - 0.5) * 0.2;
        return (t < -0.09 ? t * 1.5 : t) + (r() - 0.5) * 0.035;
      };
    }],
    // brushed metal: finer and fainter than wood
    brush: [256, 64, 256, 64, function () {
      var a = lattice(2, 32, rng(23)), r = rng(29);
      return function (u, v) { return (a(u, v) - 0.5) * 0.22 + (r() - 0.5) * 0.05; };
    }],
    // brickwork: four courses, a half-brick offset, every brick its own tone, mortar in the joints
    brick: [288, 120, 144, 60, function () {
      var r = rng(41), tone = [], i, m = lattice(6, 4, rng(43));
      for (i = 0; i < 16; i++) tone.push((r() - 0.5) * 0.3);
      return function (u, v, x, y) {
        var row = Math.floor(y / 30), off = row % 2 ? 36 : 0, bx = (x + off) % 288, col = Math.floor(bx / 72), lx = bx % 72, ly = y % 30;
        if (ly < 3 || lx < 3) return -0.34 + (r() - 0.5) * 0.06;                 // mortar
        var t = tone[(row * 4 + col) % 16] + (m(u, v) - 0.5) * 0.14 + (r() - 0.5) * 0.07;
        if (ly < 5.5) t += 0.1;                                                  // top edge catches the light
        if (ly > 26.5 || lx > 68.5) t -= 0.1;
        return t;
      };
    }],
    // floorboards: plank joints across wood grain
    planks: [512, 192, 512, 192, function () {
      var a = lattice(3, 48, rng(51)), r = rng(53), tone = [], i;
      for (i = 0; i < 8; i++) tone.push((r() - 0.5) * 0.2);
      return function (u, v, x, y) {
        var row = Math.floor(y / 48), ly = y % 48, lx = (x + row * 170) % 256;
        if (ly < 2.5) return -0.3;
        if (lx < 2) return -0.24;
        return tone[(row * 2 + Math.floor(((x + row * 170) % 512) / 256)) % 8] + (a(u, v) - 0.5) * 0.24 + (ly < 5 ? 0.07 : 0) + (r() - 0.5) * 0.03;
      };
    }]
  };

  function gradient(id, radial, o, stops) {
    var s = '';
    stops.forEach(function (st) { s += T('stop', { offset: st[0], 'stop-color': st[1], 'stop-opacity': st[2] }); });
    return T(radial ? 'radialGradient' : 'linearGradient', mg({ id: 'fx-' + id }, o), s);
  }
  var VERT = { x1: 0, y1: 0, x2: 0, y2: 1 };
  var GRADS =
    gradient('warm', 1, null, [[0, V('lamp'), 0.95], [0.3, V('lamp'), 0.5], [0.65, V('lamp-deep'), 0.16], [1, V('lamp-deep'), 0]]) +
    gradient('cool', 1, null, [[0, V('snow'), 0.8], [0.4, V('snow-shade'), 0.32], [1, V('night-600'), 0]]) +
    gradient('green', 1, null, [[0, '#9CF0C0', 0.85], [0.45, V('pole-green'), 0.3], [1, V('pole-green'), 0]]) +
    gradient('red', 1, null, [[0, V('bad'), 0.8], [0.5, V('pole-red'), 0.25], [1, V('pole-red'), 0]]) +
    gradient('hot', 1, null, [[0, V('paper'), 1], [0.35, V('lamp'), 0.9], [1, V('lamp'), 0]]) +
    gradient('beam', 0, VERT, [[0, V('lamp'), 0.62], [0.5, V('lamp'), 0.2], [1, V('lamp-deep'), 0]]) +
    gradient('beamc', 0, VERT, [[0, V('snow'), 0.42], [0.55, V('snow-shade'), 0.12], [1, V('snow-shade'), 0]]) +
    gradient('dark', 1, null, [[0, V('night-900'), 0], [0.55, V('night-900'), 0.12], [1, V('night-900'), 0.72]]) +
    gradient('darkv', 0, VERT, [[0, V('night-900'), 0.6], [0.4, V('night-900'), 0], [0.75, V('night-900'), 0], [1, V('night-900'), 0.55]]) +
    gradient('fall', 0, VERT, [[0, V('night-900'), 0], [1, V('night-900'), 0.6]]) +
    gradient('rise', 0, VERT, [[0, V('night-900'), 0.6], [1, V('night-900'), 0]]) +
    gradient('cast', 1, null, [[0, V('night-900'), 0.62], [0.6, V('night-900'), 0.3], [1, V('night-900'), 0]]);

  var CSS =
    '.fx-add{mix-blend-mode:screen}.fx-mul{mix-blend-mode:multiply}.fx-soft{mix-blend-mode:soft-light}' +
    '@keyframes fx-drift{0%{transform:translate(0,0);opacity:0}15%{opacity:var(--o,.6)}85%{opacity:var(--o,.6)}100%{transform:translate(var(--dx,10px),var(--dy,-40px));opacity:0}}' +
    '@keyframes fx-flick{0%,100%{opacity:1}42%{opacity:.86}47%{opacity:.97}58%{opacity:.8}63%{opacity:1}}' +
    '@keyframes fx-breathe{0%,100%{opacity:.72}50%{opacity:1}}' +
    '.fx-mote{animation:fx-drift var(--t,9s) linear infinite;animation-delay:var(--d,0s);opacity:0}' +
    '.fx-flick{animation:fx-flick 5.3s linear infinite}.fx-breathe{animation:fx-breathe 4.6s ease-in-out infinite}' +
    '.reduced .fx-mote{animation:none;opacity:var(--o,.5)}.reduced .fx-flick,.reduced .fx-breathe{animation:none}';

  var ready = false;
  function ensure() {
    if (ready || document.getElementById('fx-defs')) { ready = true; return; }
    var pats = '';
    Object.keys(TEX).forEach(function (k) {
      var t = TEX[k], url = bake(t[0], t[1], t[4]());
      if (url) document.documentElement.style.setProperty('--fx-' + k, 'url(' + url + ')');   // the same tiles for CSS backgrounds
      pats += T('pattern', { id: 'fx-' + k, width: t[2], height: t[3], patternUnits: 'userSpaceOnUse' },
        url ? T('image', { href: url, width: t[2], height: t[3], preserveAspectRatio: 'none' }) : '');
      if (k === 'wood' || k === 'brush') pats += T('pattern', { id: 'fx-' + k + 'v', width: t[2], height: t[3], patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(90)' },
        url ? T('image', { href: url, width: t[2], height: t[3], preserveAspectRatio: 'none' }) : '');
    });
    var d = document.createElement('div');
    d.innerHTML = '<svg id="fx-defs" xmlns="http://www.w3.org/2000/svg" width="0" height="0" aria-hidden="true" focusable="false" ' +
      'style="position:absolute;width:0;height:0;overflow:hidden"><style>' + CSS + '</style><defs>' + GRADS + pats + '</defs></svg>';
    (document.body || document.documentElement).appendChild(d.firstChild);
    ready = true;
  }

  /* ---------- markup builders (all return SVG strings in the caller's viewBox units) ---------- */
  // tex('wood', x, y, w, h, opacity, { scale, rotate, clip }): a texture laid over a surface
  function tex(name, x, y, w, h, op, o) {
    o = o || {};
    var at = { x: f(x), y: f(y), width: f(w), height: f(h), fill: 'url(#fx-' + name + ')', opacity: op == null ? 1 : op, 'pointer-events': 'none' };
    if (o.rx) at.rx = o.rx;
    if (o.clip) at['clip-path'] = 'url(#' + o.clip + ')';
    if (o.cls) at['class'] = o.cls;
    if (!o.scale && !o.vertical) return T('rect', at);
    // scale the tile (not the surface), or stand the grain upright
    var k = o.scale || 1;
    var clip = at['clip-path'];
    delete at.rx; delete at['clip-path'];
    if (o.vertical) { at.x = 0; at.y = f(-w / k); at.width = f(h / k); at.height = f(w / k); }
    else { at.x = 0; at.y = 0; at.width = f(w / k); at.height = f(h / k); }
    var inner = T('g', { transform: 'translate(' + f(x) + ' ' + f(y) + ')' + (o.vertical ? ' rotate(90)' : '') + ' scale(' + k + ')' }, T('rect', at));
    return clip ? T('g', { 'clip-path': clip }, inner) : inner;
  }
  // texPath('wood', d, opacity): a texture clipped to a path, no clipPath needed
  function texPath(name, d, op, o) { return T('path', mg({ d: d, fill: 'url(#fx-' + name + ')', opacity: op == null ? 1 : op, 'pointer-events': 'none' }, o)); }
  // pool(cx, cy, rx, ry, opacity, kind): a pool of light. kind: 'warm' (default) | 'cool' | 'green' | 'red' | 'hot'
  function pool(cx, cy, rx, ry, op, kind, o) {
    return T('ellipse', mg({ cx: f(cx), cy: f(cy), rx: f(rx), ry: f(ry), fill: 'url(#fx-' + (kind || 'warm') + ')', opacity: op == null ? 0.6 : op, 'class': 'fx-add', 'pointer-events': 'none' }, o));
  }
  // cone(x, y, w0, w1, h, opacity, { skew, cool }): a beam from a lamp at (x, y), w0 wide at the lamp and w1 wide h below it
  function cone(x, y, w0, w1, h, op, o) {
    o = o || {};
    var sk = o.skew || 0;
    return T('path', { d: 'M' + f(x - w0 / 2) + ' ' + f(y) + 'H' + f(x + w0 / 2) + 'L' + f(x + sk + w1 / 2) + ' ' + f(y + h) + 'H' + f(x + sk - w1 / 2) + 'Z',
      fill: 'url(#fx-' + (o.cool ? 'beamc' : 'beam') + ')', opacity: op == null ? 0.5 : op, 'class': 'fx-add' + (o.cls ? ' ' + o.cls : ''), 'pointer-events': 'none' });
  }
  // bulb(x, y, r): the hot core of a lamp with its bloom
  function bulb(x, y, r, op) {
    return T('circle', { cx: f(x), cy: f(y), r: f(r * 3.4), fill: 'url(#fx-warm)', opacity: op == null ? 0.75 : op, 'class': 'fx-add' }) +
      T('circle', { cx: f(x), cy: f(y), r: f(r), fill: 'url(#fx-hot)' });
  }
  // shade(x, y, w, h, opacity): darkens the edges of a room so the lit middle carries the eye
  function shade(x, y, w, h, op, o) { return T('rect', mg({ x: f(x), y: f(y), width: f(w), height: f(h), fill: 'url(#fx-dark)', opacity: op == null ? 0.8 : op, 'class': 'fx-mul', 'pointer-events': 'none' }, o)); }
  // fall(x, y, w, h, opacity, up): a straight falloff, dark at the bottom (or at the top when up is true)
  function fall(x, y, w, h, op, up) { return T('rect', { x: f(x), y: f(y), width: f(w), height: f(h), fill: 'url(#fx-' + (up ? 'rise' : 'fall') + ')', opacity: op == null ? 0.6 : op, 'class': 'fx-mul', 'pointer-events': 'none' }); }
  // cast(cx, cy, rx, ry, opacity, rotate): a soft cast shadow on a wall or floor
  function cast(cx, cy, rx, ry, op, rot) {
    return T('ellipse', { cx: f(cx), cy: f(cy), rx: f(rx), ry: f(ry), fill: 'url(#fx-cast)', opacity: op == null ? 0.6 : op, 'class': 'fx-mul', transform: rot ? 'rotate(' + rot + ' ' + f(cx) + ' ' + f(cy) + ')' : null, 'pointer-events': 'none' });
  }
  // motes(x, y, w, h, n, seed, { r, dx, dy, t }): dust drifting in a beam. Still, and fewer, with reduced motion.
  function motes(x, y, w, h, n, seed, o) {
    o = o || {};
    var r = rng(seed || 3), s = '', i;
    for (i = 0; i < n; i++) {
      var rad = (o.r || 1.6) * (0.5 + r()), t = (o.t || 9) * (0.7 + r() * 0.8);
      s += T('circle', { cx: f(x + r() * w), cy: f(y + r() * h), r: f(rad), fill: V('lamp'), 'class': 'fx-mote fx-add',
        style: '--o:' + f(0.25 + r() * 0.5) + ';--dx:' + f((r() - 0.5) * (o.dx || 30)) + 'px;--dy:' + f(-(o.dy || 36) * (0.4 + r())) + 'px;--t:' + f(t) + 's;--d:' + f(-r() * t) + 's' });
    }
    return T('g', { 'class': 'fx-motes', 'pointer-events': 'none' }, s);
  }

  NP.fx = { ensure: ensure, tex: tex, texPath: texPath, pool: pool, cone: cone, bulb: bulb, shade: shade, fall: fall, cast: cast, motes: motes, rng: rng };
})(window.NP);
