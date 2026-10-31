/* icons.js: gift icon sprite + NP.giftSVG (SPEC §9.5). Owner: icons agent.
   64x64 grid, 4px padding, baseline y=56, light from the upper left.
   Main bodies of hue-able icons use var(--gift-hue, <default>). */
window.NP = window.NP || {};
(function (NP) {
  'use strict';

  /* ---------- tiny SVG helpers ---------- */
  function V(n) { return 'var(--' + n + ')'; }
  function H(d) { return 'var(--gift-hue,var(--hue-' + d + '))'; }
  function M(c, p, w) { return 'color-mix(in srgb,' + c + ' ' + p + '%,' + (w || V('ink')) + ')'; }
  function r1(n) { return Math.round(n * 10) / 10; }
  var INK = V('ink'), SNOW = V('snow'), PAPER = V('paper'), GOLD = V('gold'), GOLDD = V('gold-dark'),
    WOOD = V('wood'), WOODD = V('wood-dark'), RED = V('pole-red'), NIGHT = V('night-900'),
    TONE = 'url(#gi-tone)';
  function at(x) { return x ? ' ' + x : ''; }
  function p(d, f, x) { return '<path d="' + d + '" fill="' + f + '"' + at(x) + '/>'; }
  function c(cx, cy, r, f, x) { return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + f + '"' + at(x) + '/>'; }
  function e(cx, cy, rx, ry, f, x) { return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="' + f + '"' + at(x) + '/>'; }
  function r(x, y, w, h, rr, f, xa) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '"' + (rr ? ' rx="' + rr + '"' : '') + ' fill="' + f + '"' + at(xa) + '/>'; }
  /* toned versions: base fill + shared 35deg lit/shade overlay */
  function pt(d, f, x) { return p(d, f, x) + p(d, TONE, x); }
  function ct(cx, cy, rr, f, x) { return c(cx, cy, rr, f, x) + c(cx, cy, rr, TONE, x); }
  function et(cx, cy, rx, ry, f, x) { return e(cx, cy, rx, ry, f, x) + e(cx, cy, rx, ry, TONE, x); }
  function rt(x, y, w, h, rr, f, xa) { return r(x, y, w, h, rr, f, xa) + r(x, y, w, h, rr, TONE, xa); }
  function hi(d, o) { return p(d, SNOW, 'opacity="' + (o || 0.35) + '"'); }
  function ln(d, col, w, x) { return '<path d="' + d + '" fill="none" stroke="' + col + '" stroke-width="' + w + '" stroke-linecap="round" stroke-linejoin="round"' + at(x) + '/>'; }
  function g(tr, s, x) { return '<g' + (tr ? ' transform="' + tr + '"' : '') + at(x) + '>' + s + '</g>'; }
  function stop(o, col, op) { return '<stop offset="' + o + '" style="stop-color:' + col + ';stop-opacity:' + op + '"/>'; }

  /* ---------- shared defs ---------- */
  var DEFS =
    '<filter id="np-soft" x="-40%" y="-150%" width="180%" height="400%"><feGaussianBlur stdDeviation="3"/></filter>' +
    '<filter id="gi-desat"><feColorMatrix type="saturate" values=".5"/></filter>' +
    '<filter id="gi-white"><feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0"/></filter>' +
    '<filter id="gi-ol" x="-15%" y="-15%" width="130%" height="130%"><feMorphology in="SourceAlpha" operator="dilate" radius="2" result="d"/>' +
    '<feFlood style="flood-color:var(--ink)" flood-opacity=".6"/><feComposite in2="d" operator="in"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
    '<linearGradient id="gi-tone" x1=".15" y1="0" x2=".85" y2="1">' + stop(0, SNOW, 0.24) + stop(0.42, SNOW, 0) + stop(0.56, INK, 0) + stop(1, INK, 0.3) + '</linearGradient>' +
    '<linearGradient id="gi-wood" x1=".1" y1="0" x2=".9" y2="1">' + stop(0, M(WOOD, 70, V('lamp')), 1) + stop(1, M(WOOD, 80), 1) + '</linearGradient>' +
    '<linearGradient id="gi-gold" x1=".1" y1="0" x2=".9" y2="1">' + stop(0, M(GOLD, 60, SNOW), 1) + stop(1, GOLDD, 1) + '</linearGradient>' +
    '<linearGradient id="gi-glass" x1="0" y1="0" x2="1" y2="1">' + stop(0, SNOW, 1) + stop(1, V('night-600'), 1) + '</linearGradient>' +
    '<path id="gi-dm" d="M0 6C.5 3.4 2.4 2.2 4.6 2.6L5.4.8C6 0 7.6 0 8 1C8.4 1.8 7.8 2.6 6.8 2.8L6.8 6H5.6L5.2 4.4H3L2.6 6Z"/>' +
    /* giant: soft fade across the top so an oversize toy reads as cropped by the belt band, not boxed in */
    '<linearGradient id="gi-gfade" gradientUnits="userSpaceOnUse" x1="0" y1="-10" x2="0" y2="-3">' + stop(0, SNOW, 0) + stop(0.6, SNOW, 0.8) + stop(1, SNOW, 1) + '</linearGradient>' +
    '<mask id="gi-giant" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="-48" y="-60" width="160" height="132"><rect x="-48" y="-60" width="160" height="132" fill="url(#gi-gfade)"/></mask>' +
    /* pre-baked contact shadow (no live blur on the belt) */
    '<radialGradient id="gi-ao">' + stop(0, NIGHT, 0.95) + stop(0.5, NIGHT, 0.6) + stop(1, NIGHT, 0) + '</radialGradient>';

  /* ---------- icons ---------- */
  var I = {};

  /* teddy: seated, soft, with a bow */
  (function () {
    var B = H('brown'), Bd = M(B, 80), Bl = M(B, 55, PAPER), Bll = M(B, 35, PAPER);
    I.teddy =
      c(19, 13.5, 6.5, B) + c(19.5, 14, 3.3, Bl) + c(45, 13.5, 6.5, Bd) + c(44.5, 14, 3.3, Bl) +
      et(32, 43, 14.5, 12.5, B) + e(32, 45.5, 8.5, 8, Bll) +
      e(17.5, 40, 5.5, 8.5, B, 'transform="rotate(28 17.5 40)"') + hi('M13 37C14 34 16 32.5 18 32.5C16.5 34.5 15.5 36.5 15 39Z', 0.25) +
      e(46.5, 40, 5.5, 8.5, Bd, 'transform="rotate(-28 46.5 40)"') +
      e(21, 51.5, 7.5, 5, B) + e(21, 52, 4.2, 3, Bl) + e(43, 51.5, 7.5, 5, Bd) + e(43, 52, 4.2, 3, Bl) +
      ct(32, 23, 13.5, B) + hi('M21.5 18.5C23.5 13 27.5 10.5 32 10.5C28 12.5 25 15.5 23.8 20Z', 0.22) +
      e(32, 28.5, 6.6, 5, Bll) + e(32, 26.6, 2.8, 2, INK) + c(31.2, 26, 0.7, SNOW, 'opacity=".7"') +
      ln('M32 28.6V30.2M29.6 30.4Q32 32.4 34.4 30.4', INK, 1.1) +
      c(26, 21.5, 2, INK) + c(38, 21.5, 2, INK) + c(26.7, 20.8, 0.7, SNOW) + c(38.7, 20.8, 0.7, SNOW) +
      p('M32 37L24.5 33Q22.5 37 24.5 41Z', RED) + p('M32 37L39.5 33Q41.5 37 39.5 41Z', M(RED, 80)) + c(32, 37, 2.6, M(RED, 70));
  })();

  /* grizzly: a real bear on all fours, facing left. Small ears, hump, snout, claws. */
  (function () {
    var F = M(V('hue-brown'), 66), Fd = M(V('hue-brown'), 48), Fl = M(V('hue-brown'), 60, V('lamp')), Mz = M(V('hue-brown'), 45, V('paper-shade'));
    var claw = V('paper-shade');
    I.grizzly =
      r(24, 40, 8, 16, 4, Fd) + r(48, 40, 8, 15.5, 4, Fd) +
      p('M29 17.5l1.8-3.6 1.4 3 2.2-4 1.2 3.6 2.4-3.8 1 3.8 2.4-3.2.6 3.6Z', F) +
      pt('M12 33C13 24 21 17.5 31 16.5C35 13.5 43 12.8 48 16C55 18 60 25 60 34C60 41 57 46 52 47.5H22C15 47.5 11.5 41 12 33Z', F) +
      p('M21 21C26 17 31 16.5 35 14.5C40 12.5 46 13.5 49 16.3C44 16 39 17.5 35 19.5C30 21.5 25.5 21.5 21 23Z', Fl, 'opacity=".75"') +
      ln('M21.5 21.4C26 18 30.5 17.2 34 15.4C38.5 13 44.5 13.2 48.6 16.2', V('lamp'), 1.1, 'opacity=".5"') +
      pt('M41 36C47 32.5 56 35 56 42V53a3 3 0 0 1-3 3H45a3 3 0 0 1-3-3V46C40 43 39.5 38.5 41 36Z', F) +
      e(43.5, 55, 1, 1.6, claw) + e(46, 55.2, 1, 1.6, claw) + e(48.5, 55.2, 1, 1.6, claw) +
      pt('M14 39H26V53a3 3 0 0 1-3 3H15a3 3 0 0 1-3-3V42C12 40.5 13 39 14 39Z', F) +
      e(12.8, 55, 1, 1.7, claw) + e(15.3, 55.2, 1, 1.7, claw) + e(17.8, 55.2, 1, 1.7, claw) +
      c(13, 22.5, 3.7, F) + c(13.2, 22.8, 1.7, Fd) + c(21.5, 21.8, 3.4, Fd) +
      et(17, 31, 10, 9.5, F) + hi('M9.5 27C11 23.5 14 22 17.5 22C14.5 23.5 12.5 25.5 11.5 28.5Z', 0.25) +
      p('M11.5 27.5C7 27.5 3.5 30.5 3.5 34.5C3.5 38 6.5 40 10 40C14 40 16.5 37 16.5 33Z', Mz) +
      p('M5 38.2C8 42.6 13.5 43 16.2 39C12.5 40.4 8.5 40 5 38.2Z', M(RED, 40)) +
      p('M8 39.4l1 2.4 1-2.1Z', PAPER) + p('M12.6 40l.9 2.2 1-2.3Z', PAPER) +
      e(4.8, 33, 2.5, 2, INK) + c(4.1, 32.4, 0.6, SNOW, 'opacity=".6"') +
      p('M10.8 25.6L18 24.6L17.4 26.6L11.6 27.2Z', Fd) +
      c(14.8, 28.6, 1.8, INK) + c(15.3, 28.1, 0.6, SNOW);
  })();

  /* castle: an actual stone castle with a flag */
  (function () {
    var S = M(V('snow-shade'), 55, V('paper-shade')), Sd = M(S, 82), Sb = M(S, 70), win = NIGHT;
    function mer(x0, y, n, w, gp, h, f) { var s = '', i; for (i = 0; i < n; i++) s += r(r1(x0 + i * (w + gp)), y, w, h + 1, 1, f); return s; }
    I.castle =
      r(31.4, 1.5, 1.2, 14, 0.6, V('board-dark')) +
      p('M32.6 2.2C37 .9 39.5 4.3 44.5 3V10C39.5 11.3 37 7.9 32.6 9.2Z', RED) + p('M38.5 7.2C40.5 8.2 42.2 8.7 44.5 8.2V10C42 10.7 40 10.1 38.5 9.2Z', M(RED, 75)) +
      mer(14, 26, 6, 4, 2.4, 4, Sd) + rt(14, 30, 36, 26, 1.5, Sd) +
      mer(25, 12, 3, 3.6, 1.6, 4, S) + rt(25, 16, 14, 16, 1, S) + r(30.6, 20, 2.8, 6, 1.4, win) +
      mer(6, 15, 3, 4, 1.5, 5, S) + rt(6, 20, 15, 36, 1.5, S) +
      mer(43, 15, 3, 4, 1.5, 5, Sd) + rt(43, 20, 15, 36, 1.5, Sd) +
      hi('M7.5 21.5H19.5V23H9V54H7.5Z', 0.3) + hi('M26.5 17.5H37.5V18.6H27.6V30H26.5Z', 0.3) +
      r(12.3, 27, 2.4, 7, 1.2, win) + r(49.3, 27, 2.4, 7, 1.2, win) +
      r(8, 38, 6, 2.6, 1.2, Sb) + r(14, 45, 5, 2.6, 1.2, Sb) + r(9, 50, 6, 2.6, 1.2, Sb) +
      r(45, 37, 6, 2.6, 1.2, Sb) + r(50, 46, 6, 2.6, 1.2, Sb) + r(15.5, 34, 4, 2.4, 1.2, Sb) +
      p('M25.5 56V46.5A6.5 6.5 0 0 1 38.5 46.5V56Z', win) +
      p('M27.3 56V46.8A4.7 4.7 0 0 1 36.7 46.8V56Z', WOODD) +
      ln('M30.2 43.5V56M33.8 43.5V56M27.4 48.5H36.6', M(WOODD, 60), 0.9);
  })();

  /* brickcastle: a toy built from studded bricks on a baseplate */
  (function () {
    var B = H('blue'), Bd = M(B, 72), Bs = M(B, 62), Bl = M(B, 55, SNOW);
    function stud(x, y, f) { return r(x, y - 3, 5.6, 3.4, 1.2, M(f, 80)) + e(x + 2.8, y - 3, 2.8, 1.2, M(f, 65, SNOW)); }
    function seam(x, y, w) { return r(x, y, w, 0.9, 0, Bs, 'opacity=".9"'); }
    I.brickcastle =
      pt('M4 50.5H60V54a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z', V('pole-green')) +
      e(10, 50.6, 2.4, 0.9, M(V('pole-green'), 70, SNOW)) + e(54, 50.6, 2.4, 0.9, M(V('pole-green'), 70, SNOW)) +
      stud(22.2, 33, Bd) + stud(29.2, 33, Bd) + stud(36.2, 33, Bd) + rt(21, 33, 22, 17.5, 1.5, Bd) +
      seam(21, 41.5, 22) + r(31.5, 33, 0.9, 8.5, 0, Bs) +
      p('M27 50.5V45a5 5 0 0 1 10 0V50.5Z', NIGHT) +
      stud(8.2, 20, B) + stud(15.2, 20, B) + rt(7, 20, 15, 30.5, 1.5, B) +
      stud(43.2, 20, Bd) + stud(50.2, 20, Bd) + rt(42, 20, 15, 30.5, 1.5, Bd) +
      seam(7, 28, 15) + seam(7, 36, 15) + seam(7, 44, 15) + seam(42, 28, 15) + seam(42, 36, 15) + seam(42, 44, 15) +
      r(14, 20, 0.9, 8, 0, Bs) + r(11, 36.9, 0.9, 7.1, 0, Bs) + r(17.5, 36.9, 0.9, 7.1, 0, Bs) + r(49, 20, 0.9, 8, 0, Bs) + r(46, 36.9, 0.9, 7.1, 0, Bs) + r(52.5, 36.9, 0.9, 7.1, 0, Bs) +
      r(11.5, 29.6, 6, 5, 1, GOLD) + r(46.5, 29.6, 6, 5, 1, GOLDD) +
      hi('M8.5 21.5H20.5V22.7H9.7V48H8.5Z', 0.35) + hi('M22.5 34.5H34V35.5H23.5V40H22.5Z', 0.25) +
      r(12.3, 30.2, 2.2, 1.2, 0.6, SNOW, 'opacity=".5"');
  })();

  /* kite: diamond toy kite, bow tail, wooden handle */
  (function () {
    var K = H('red'), Kd = M(K, 72), Kl = M(K, 55, SNOW);
    function bow(x, y, f) { return p('M' + x + ' ' + y + 'l-4.4-2.8v5.6Z', f) + p('M' + x + ' ' + y + 'l4.4-2.8v5.6Z', M(f, 80)) + c(x, y, 1.3, M(f, 70)); }
    I.kite =
      ln('M31 18C41 28 47 36 49 48', V('ink-soft'), 0.8, 'opacity=".8"') +
      ln('M33 40C30 46 23 44 20.5 49.5C18.5 54 13.5 54.5 9.5 52.5', V('ink-soft'), 1.1) +
      bow(31, 44.6, GOLD) + bow(20.4, 50, SNOW) + bow(11.2, 53.2, GOLD) +
      p('M30 4L11 19.5L31 18Z', Kl) + p('M30 4L51 16.5L31 18Z', K) + p('M11 19.5L33 41L31 18Z', K) + p('M51 16.5L33 41L31 18Z', Kd) +
      p('M30 4L11 19.5L33 41L51 16.5Z', TONE) +
      ln('M30 4L33 41M11 19.5L51 16.5', M(WOODD, 80), 1, 'opacity=".55"') +
      hi('M29.5 7.5L16 18.5L19 18.3L29.6 10Z', 0.35) +
      rt(43, 47.5, 13, 8.5, 3, WOOD) + r(46.5, 47.5, 6, 8.5, 0, V('paper-shade')) + ln('M46.5 50H52.5M46.5 52.5H52.5', M(V('paper-shade'), 75), 0.6);
  })();

  /* bird: a red kite, the bird of prey. Rufous, pale head, forked tail, hooked beak. */
  (function () {
    var Ru = M(V('lamp-deep'), 50, RED), Rud = M(Ru, 70), Pr = M(V('hue-brown'), 35), Hd = M(V('snow-shade'), 62, V('paper-shade')), Hs = M(Hd, 62);
    I.bird =
      p('M37 38L55.5 56.5L54 50L61 47.5L44 35Z', Ru) + p('M37 38L55.5 56.5L54 50L61 47.5L44 35Z', TONE) + p('M53.4 52.6L55.5 56.5L56.3 51.8Z', Pr) + p('M56 49L61 47.5L57.6 46.4Z', Pr) +
      rt(4, 50.5, 56, 4.6, 2.3, WOODD) +
      pt('M21 22C29 17.5 40 21 44 31C47 39 45.5 47 39 50.5C31 53 23.5 48.5 21 40.5C19.5 34 18.5 26.5 21 22Z', Ru) +
      ln('M24 33.5l1.2 1.6M23.4 38.5l1.4 1.6M27 41l1.3 1.6M25.5 45l1.3 1.5', Rud, 0.9) +
      pt('M28 27C37.5 25 46 32.5 48 42.5C49 47.5 47 51 44 52C40 46 33 41 28.3 35C26 32 26 28 28 27Z', Rud) +
      p('M41 45C43.5 47.5 45 50 44 52C47 51 49 47.5 48 42.5C46.5 44 43.8 44.7 41 45Z', Pr) +
      p('M30 29.5C36 28.5 41 32 43 37C38.5 34 34 33 30.3 33Z', M(Ru, 70, V('lamp')), 'opacity=".7"') +
      r(26.2, 46, 2.6, 5.5, 1.3, GOLD) + r(31.2, 46.5, 2.6, 5, 1.3, GOLDD) +
      e(27.2, 51.3, 2.6, 1.4, GOLD) + e(32.4, 51.5, 2.6, 1.4, GOLDD) + c(25, 52, 0.7, INK) + c(30.2, 52.2, 0.7, INK) +
      ct(21.5, 19.5, 7.8, Hd) + p('M27 24C29.5 21 30 17.5 29.5 15C31 19 30.5 24 27 26.5Z', Hs) +
      ln('M22 23.6l2 .5M24.6 21.4l2 .4M18.4 24.6l1.8.3M25.4 18l1.8.1M21.6 26l1.6.3', Hs, 1) +
      hi('M14.5 15C16 11.8 19 10.4 22 10.6C19 11.8 17 13.6 16.2 16Z', 0.45) +
      p('M15.5 15.6C11.5 15.4 8.6 18 9 22.6C10.2 20.8 12 20.2 14.6 21.2Z', GOLD) + p('M9 22.6C8.6 20.7 9.3 19.4 10.4 18.9L11.2 20.8Z', INK) +
      c(19.6, 17, 2.4, GOLD) + c(19.2, 17.1, 1.3, INK) + c(18.8, 16.5, 0.45, SNOW) +
      p('M15.8 14.2L23.4 13L22.4 15.2L16.6 15.6Z', Hs);
  })();

  /* pyjamas: folded set, dinosaur print, contrast piping */
  (function () {
    var P = H('green'), Pd = M(P, 80), Pk = M(P, 62), Pl = M(P, 45, PAPER), Pp = M(P, 30, PAPER);
    function dm(x, y, f) { return '<use href="#gi-dm" fill="' + f + '" transform="translate(' + x + ' ' + y + ') scale(1.2)"/>'; }
    I.pyjamas =
      rt(7, 39, 50, 17, 5, Pd) + r(7, 47, 50, 1, 0, Pk) +
      dm(12, 48.6, Pl) + dm(28, 48.6, Pl) + dm(45, 48.6, Pl) +
      rt(10, 15.5, 44, 27, 6, P) + r(11, 38.4, 42, 2, 1, Pp) +
      ln('M17.5 22V39M46.5 22V39', Pk, 1, 'opacity=".7"') +
      p('M24.5 15.5H39.5L32 24Z', Pk) +
      p('M22 15.5H26L32 25L26.8 30Z', Pl) + p('M42 15.5H38L32 25L37.2 30Z', M(P, 60, PAPER)) +
      ln('M22 15.6L26.8 30L32 25L37.2 30L42 15.6', Pp, 0.9) +
      c(32, 30.5, 1.6, Pp) + c(32, 36, 1.6, Pp) +
      dm(12.5, 20, Pl) + dm(40.5, 22, Pl) + dm(20, 31, Pl) + dm(40, 32, Pl) +
      hi('M12 26C12 20.5 14 17.5 18 17V19C15.5 19.5 13.5 21.5 13.2 26Z', 0.35);
  })();

  /* dino: friendly chubby green dinosaur facing right */
  (function () {
    var D = H('green'), Dd = M(D, 74), Dl = M(D, 45, PAPER), Pt = M(GOLD, 75, D);
    function plate(x, y, a) { return p('M-3.2 .5Q0-8 3.2.5Z', Pt, 'transform="translate(' + x + ' ' + y + ') rotate(' + a + ')"'); }
    I.dino =
      plate(13, 47, -45) + plate(19, 39.5, -38) + plate(26, 31.5, -22) + plate(33.5, 26.5, -8) + plate(40.5, 11.5, -10) + plate(36.5, 18, -30) +
      rt(36, 44, 10, 12, 4.5, Dd) +
      pt('M23 37C15 40 9.5 47 4 54.5C11 56 20 53.5 28 49Z', D) +
      pt('M20 44C20 34 26 27 34 27C42 27 47 34 47 42.5C47 50 41 54.5 33.5 54.5C25.5 54.5 20 50 20 44Z', D) +
      pt('M31 31C30 22 32.5 12 41.5 8.5C47 6.5 56 7.5 58.6 13.5C60.6 18.5 58 23.5 52 24.5C48 25.2 46 27 45 31Z', D) +
      hi('M35 17C37 11.5 41 9 46 9C42 10.8 39 13.5 37.4 18Z', 0.35) +
      p('M30.5 34C36 32.5 41 36.5 42 43C43 49 39 53.5 33.5 53.5C28.5 53.5 26.5 48.5 27 42.5C27.5 38 28.5 35 30.5 34Z', Dl) +
      ln('M28.6 40H40M28 45H41.8M29 50H40', M(Dl, 82), 0.8, 'opacity=".8"') +
      rt(22.5, 45, 11.5, 11, 4.5, D) + c(25, 55, 1.5, Dl) + c(28.2, 55.3, 1.5, Dl) + c(31.4, 55, 1.5, Dl) +
      p('M41.5 35.5C44.5 35 47.5 36.2 47.6 38.4C47.7 40 45.8 40.2 44.4 39.3L41 38.8Z', Dd) +
      c(24, 36.5, 1.6, Dd) + c(21.5, 41.5, 1.2, Dd) + c(13, 49.5, 1.3, Dd) +
      c(49.5, 14.5, 3, INK) + c(50.6, 13.4, 1.1, SNOW) + c(56.6, 12.6, 0.7, INK) +
      ln('M50.5 19.6Q54.4 21.6 57.8 18.6', INK, 1.3);
  })();

  /* cricketbat: willow blade, red grip, with a ball */
  (function () {
    var W = M(V('lamp'), 50, PAPER), Wd = M(W, 75, WOOD), G = RED;
    var bat =
      c(32, 3.6, 3.2, M(G, 75)) +
      rt(29, 4, 6, 18, 3, G) + ln('M29.4 8.5H34.6M29.4 12.5H34.6M29.4 16.5H34.6', M(G, 70), 0.9) +
      r(30, 20, 4, 4, 1, Wd) +
      pt('M25.5 25C25.5 22 28 21 32 21C36 21 38.5 22 38.5 25V54.5C38.5 57.5 36 58.5 32 58.5C28 58.5 25.5 57.5 25.5 54.5Z', W) +
      p('M35.5 22.3C37.6 23 38.5 23.8 38.5 25V54.5C38.5 56.8 37 58 35.5 58.3Z', Wd, 'opacity=".75"') +
      hi('M27.5 26C27.5 24 28.5 23.2 30 23V53H27.5Z', 0.45) +
      r(26.5, 30, 11, 1, 0.5, Wd, 'opacity=".5"') + r(26.5, 33, 11, 1, 0.5, Wd, 'opacity=".5"');
    I.cricketbat =
      g('translate(-13 -1.5) rotate(34 32 58)', bat) +
      ct(48, 50, 6, RED) + ln('M44.6 45.4C47.5 48 48.5 51.5 47.8 55.6', SNOW, 0.8, 'stroke-dasharray="1.2 1.3" opacity=".8"') +
      hi('M44 48.5C44.5 46.2 46.3 44.6 48.5 44.4C46.6 45.6 45.4 47 45 49Z', 0.5);
  })();

  /* bat: the flying animal, wings spread */
  (function () {
    var Wg = M(V('hue-purple'), 82), Wgd = M(V('hue-purple'), 64), Bd = M(V('hue-purple'), 70), Bn = M(V('hue-purple'), 70, V('snow-shade'));
    var wing = 'M30 27C24 18 13 15.5 3.5 21C7 23.5 8 27 7.5 31.5C11.5 29.5 15.5 30.5 17.5 34.5C20 31.5 24.5 31.5 27.5 35.5Z';
    I.bat =
      pt(wing, Wg) + ln('M29 27L9 21.5M27.5 30L13.5 27.5M27.5 33L21 31', Bn, 0.8, 'opacity=".5"') +
      g('matrix(-1 0 0 1 64 0)', p(wing, Wgd) + ln('M29 27L9 21.5M27.5 30L13.5 27.5M27.5 33L21 31', Bn, 0.8, 'opacity=".35"')) +
      hi('M5.5 21.2C12 18 21 18.5 27 24C20 21 12 20.5 7 22.2Z', 0.3) +
      ln('M28.6 25C23 18.6 13.5 16.6 5 20.8', V('lamp'), 0.9, 'opacity=".6"') +
      et(32, 32, 6.5, 9.5, Bd) + e(32, 34, 3.6, 5.6, Bn, 'opacity=".5"') +
      p('M27 21L25.5 11.5L31 17Z', Bd) + p('M37 21L38.5 11.5L33 17Z', M(Bd, 80)) + p('M27.2 18.5L26.4 14L29 16.8Z', Bn, 'opacity=".6"') +
      ct(32, 22.5, 6.6, Bd) + ln('M26.6 20.6C27.4 18.4 29.2 16.8 31.4 16.4', V('lamp'), 0.9, 'opacity=".55"') +
      e(29.4, 22, 1.9, 2.2, SNOW) + e(34.6, 22, 1.9, 2.2, SNOW) + c(29.8, 22.4, 1.1, INK) + c(35, 22.4, 1.1, INK) +
      p('M30.2 26l.7 1.8.7-1.8Z', SNOW) + p('M32.4 26l.7 1.8.7-1.8Z', SNOW) +
      ln('M30 41.5V43.5M34 41.5V43.5', Bd, 1.2);
  })();

  /* sock / socks: woolly sock with cuff, stripes, heel and toe */
  function sockBody(f) {
    var Fp = M(f, 30, PAPER), Fd = M(f, 72);
    return pt('M18 10a4 4 0 0 1 4-4H36a4 4 0 0 1 4 4V36C40 38.5 42 40 46 40H50C55 40 58 44 58 48C58 53 54 56 49 56H30C22.5 56 18 50.5 18 44Z', f) +
      r(18, 22, 22, 3.2, 0, Fp) + r(18, 29, 22, 3.2, 0, Fp) +
      p('M18 42C18 50.5 22.5 56 30 56H32.5C27 54 25 48.5 26.5 42Z', Fp) + p('M50 40C55 40 58 44 58 48C58 53 54 56 49 56C51.5 52 51.6 44.5 50 40Z', Fp) +
      rt(17, 6, 24, 10.5, 4, Fp) + ln('M21.5 8.5V14M25.5 8.5V14M29.5 8.5V14M33.5 8.5V14M37.5 8.5V14', M(Fp, 85), 1) +
      hi('M20 19H22.5V38C22 40 21.5 41 20 42Z', 0.28) + p('M40 36C40 38.5 42 40 46 40H50C55 40 58 44 58 48C56 45 53 44 49 44H44C41.5 44 39.5 42 40 36Z', Fd, 'opacity=".25"');
  }
  (function () {
    var S = H('red');
    I.sock = sockBody(S);
    I.socks = g('translate(-12 -3)', sockBody(S) + p('M18 10a4 4 0 0 1 4-4H36a4 4 0 0 1 4 4V36C40 38.5 42 40 46 40H50C55 40 58 44 58 48C58 53 54 56 49 56H30C22.5 56 18 50.5 18 44Z', INK, 'opacity=".2"')) +
      g('translate(2 0)', sockBody(S));
  })();

  /* boot / boots: football boot with studs, laces, heel counter */
  function bootBody(f) {
    var Fd = M(f, 72), Fl = M(f, 55, SNOW);
    return r(10, 50.5, 4, 5.5, 1.5, V('board')) + r(20, 50.5, 4, 5.5, 1.5, V('board')) + r(38, 50.5, 4, 5.5, 1.5, V('board')) + r(50, 50.5, 4, 5.5, 1.5, V('board')) +
      pt('M8 29C8 25 10.5 23.6 14 24L21 25.2C24 25.8 26.5 28 29.5 30.2C35 34 43 35 50 36.2C56 37.2 59.5 40.8 59.5 45.5V48H8Z', f) +
      p('M8.6 27.6C9.4 25.4 11.4 24.4 14.2 24.9L20.6 26C17.8 27.6 13.4 28.6 8.6 29.2Z', NIGHT, 'opacity=".8"') +
      p('M8 33C12.5 33 15.5 36 15.5 40.5V48H8Z', 'url(#gi-gold)') + p('M26 39.4C32 38.6 38 39.8 43.5 42.4C37.5 41.8 31.5 41.8 26 42.4Z', SNOW, 'opacity=".25"') +
      p('M44 34.5C52 35 59.5 39 59.5 46V48H50C50 42 48 37.5 44 34.5Z', Fd, 'opacity=".6"') +
      r(6, 46, 54.5, 5.2, 2.6, V('snow-shade')) + r(6, 46, 54.5, 2, 1, SNOW, 'opacity=".55"') +
      p('M20.6 26.4C24 26.9 26.6 29.4 29.6 31.6C33.4 34.4 38 35.4 41 35.8L39.4 38C35 37.6 30.6 35.8 27 33.2C24.5 31.4 22.4 29.4 19.6 28.4Z', Fl, 'opacity=".55"') +
      ln('M23.4 28.6l2.4-2.6M27 31.4l2.4-2.6M31 33.8l2.2-2.6M35.2 35.6l2-2.6', SNOW, 1.4) +
      hi('M10 30.5C10.4 29.5 11.5 29.2 13 29.4L13.2 30.6C12 30.6 11 31 10 32Z', 0.4);
  }
  (function () {
    var B = H('blue');
    I.boot = bootBody(B);
    I.boots = g('translate(-5 -7)', bootBody(M(B, 78))) + g('translate(2 0)', bootBody(B));
  })();

  /* pawn helper, centred on x=0, base at y=0 */
  function pawn(f) {
    var Fd = M(f, 78);
    return rt(-8, -5, 16, 5, 2.5, f) + r(-6.5, -7.5, 13, 3, 1.5, Fd) +
      pt('M-5-7.5C-4-12-2.6-15-2.3-18H2.3C2.6-15 4-12 5-7.5Z', f) +
      e(0, -18.5, 4.6, 1.6, Fd) + ct(0, -23.5, 4.8, f) + c(-1.7, -25.2, 1.4, SNOW, 'opacity=".55"') +
      p('M-3.4-9C-2.8-12-1.8-14.5-1.4-16.5H-.4C-.8-14-1.6-11.5-2-9Z', SNOW, 'opacity=".4"');
  }

  /* chess: wooden board with a king and a knight */
  (function () {
    var Lt = M(V('lamp'), 45, PAPER), Dk = M(WOODD, 78), sq = '', i, j;
    function q(t0, t1, j0, j1) {
      function X(t, j) { var L = 10 - 6 * t, R = 54 + 6 * t; return r1(L + (R - L) * j / 6); }
      function Y(t) { return r1(40 + 8 * t); }
      return 'M' + X(t0, j0) + ' ' + Y(t0) + 'L' + X(t0, j1) + ' ' + Y(t0) + 'L' + X(t1, j1) + ' ' + Y(t1) + 'L' + X(t1, j0) + ' ' + Y(t1) + 'Z';
    }
    for (i = 0; i < 2; i++) for (j = 0; j < 6; j++) if ((i + j) % 2) sq += q(i / 2, (i + 1) / 2, j, j + 1);
    I.chess =
      p('M10 40H54L60 48H4Z', M(WOOD, 60, V('lamp'))) + p(sq, WOODD, 'opacity=".75"') +
      pt('M4 48H60V53a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3Z', WOODD) + r(4, 48, 56, 1.2, 0, V('lamp'), 'opacity=".35"') +
      /* king (dark) */
      rt(14, 40.5, 14, 5, 2.5, Dk) + r(15.5, 38, 11, 3, 1.5, M(Dk, 80)) +
      pt('M17.5 38L19 23.5H23L24.5 38Z', Dk) + e(21, 23.5, 5.6, 1.8, M(Dk, 70)) +
      pt('M16.6 22C16.6 17.5 18.8 15.4 21 15.4C23.2 15.4 25.4 17.5 25.4 22Z', Dk) +
      r(17.2, 20, 7.6, 1.4, 0.7, GOLD, 'opacity=".9"') +
      r(20, 9.4, 2, 6.6, 1, Dk) + r(18.3, 11, 5.4, 2, 1, Dk) +
      p('M18.6 35L19.8 25H21L20 35Z', SNOW, 'opacity=".25"') + c(19.2, 18, 1.2, SNOW, 'opacity=".3"') +
      /* knight (light) */
      rt(35, 40.5, 16, 5, 2.5, Lt) + r(36.5, 38, 13, 3, 1.5, M(Lt, 82)) +
      pt('M38.2 38.5C37 33.5 38.5 30 41 27.5C38.5 28.6 35.6 29.6 34.4 27.6C33.4 25.6 35.6 22.2 38.4 19.6C40 18.1 41 16.4 41.4 14.4L43.6 16.4C47.8 16.8 51 21 51 27.2C51 32 49.4 35.8 49.8 38.5Z', Lt) +
      p('M43.6 16.4C47.8 16.8 51 21 51 27.2C51 32 49.4 35.8 49.8 38.5H47.6C47.5 34 48.5 30 48 25.5C47.6 21.6 46 18.6 43.6 16.4Z', M(Lt, 75, WOOD)) +
      c(41.2, 21.4, 1, INK) + c(36, 25.9, 0.6, INK) +
      hi('M37 23C38.5 20.8 40 19.8 41 18.4L41.6 19.6C40.6 21 39.3 22.3 37.9 24.3Z', 0.5);
  })();

  /* pawns: a crowd of identical pawns */
  (function () {
    var Lt = M(V('lamp'), 45, PAPER), Ld = M(Lt, 86);
    I.pawns =
      g('translate(22 47) scale(.88)', pawn(Ld)) + g('translate(42 47) scale(.88)', pawn(Ld)) + g('translate(32 44) scale(.8)', pawn(M(Lt, 78))) +
      g('translate(13.5 56)', pawn(Lt)) + g('translate(32 56)', pawn(Lt)) + g('translate(50.5 56)', pawn(Lt));
  })();

  /* jigsaw: one big seaside piece, standing slightly tilted */
  (function () {
    var J = H('blue'), Jd = M(J, 70), Sky = M(J, 40, SNOW), Sand = M(GOLD, 55, PAPER);
    var piece = 'M10 18H23.5C23.5 18 21.6 14 23.6 11C25.6 8 34.4 8 36.4 11C38.4 14 36.5 18 36.5 18H50V31C50 31 54 29 57 31C60 33 60 41 57 43C54 45 50 43 50 43V56H10V43C10 43 14 45 16.5 43C19.5 41 19.5 33 16.5 31C14 29 10 31 10 31Z';
    I.jigsaw =
      '<clipPath id="gi-jc"><path d="' + piece + '"/></clipPath>' +
      g('rotate(-5 30 56)',
        p(piece, Jd, 'transform="translate(1.6 1.4)"') +
        g('', r(0, 0, 64, 64, 0, Sky) + c(41, 23, 5, GOLD) + c(41, 23, 7.5, GOLD, 'opacity=".25"') +
          p('M0 36C6 33.5 11 38 17 35.5C23 33 28 38 34 35.5C40 33 45 38 51 35.5C55 34 58 35 64 36V64H0Z', J) +
          ln('M14 41.5C17 40 19.5 42.5 22.5 41M34 44C37 42.5 39.5 45 42.5 43.5', SNOW, 1.1, 'opacity=".6"') +
          p('M0 50C12 47.5 30 48 64 51V64H0Z', Sand) + c(20.5, 52, 1.1, M(Sand, 80)) + c(39, 53, 0.9, M(Sand, 80)),
          'clip-path="url(#gi-jc)"') +
        p(piece, TONE) + hi('M11.5 19.5H22V20.8H12.8V29.5H11.5Z', 0.5) + hi('M25 12.2C26.3 10.4 29 9.8 31 10C28.8 10.8 27.2 11.8 26.2 13.4Z', 0.5));
  })();

  /* telescope: tube on a wooden tripod */
  (function () {
    var T = H('blue'), Td = M(T, 70);
    var tube =
      r(6, 26, 8, 7, 1.5, M(V('board-dark'), 90)) +
      rt(13, 24.5, 32, 10, 3, T) + r(13, 31.5, 32, 3, 1.5, Td, 'opacity=".6"') +
      rt(44, 22, 11, 15, 3, T) + r(44, 33.5, 11, 3.5, 1.5, Td, 'opacity=".6"') +
      r(23, 24.5, 3, 10, 0, 'url(#gi-gold)') + r(44, 22, 2.6, 15, 0, 'url(#gi-gold)') +
      e(55, 29.5, 1.8, 7.3, 'url(#gi-glass)') +
      hi('M15 26H43V27.4H15Z', 0.4) + hi('M46 23.5H53V25H46Z', 0.4);
    I.telescope =
      ln('M31 37L31.5 55', M(WOODD, 80), 3) +
      ln('M30 37L18 55.5M32 37L44 55.5', WOODD, 3.2) +
      g('rotate(-24 30 30)', tube) +
      c(30.5, 35.5, 3.4, 'url(#gi-gold)');
  })();

  /* crate: wooden crate with a stencilled question mark */
  (function () {
    var Wl = M(WOOD, 65, V('lamp')), Wd = M(WOODD, 85), St = NIGHT;
    I.crate =
      p('M6 26L18 19H56L44 26Z', Wl) + ln('M10.5 23.4H48.5M14.5 21H52.5', M(WOOD, 80), 0.8, 'opacity=".7"') +
      p('M44 26L56 19V49L44 56Z', Wd) + ln('M44 36.5L56 29.5M44 46.5L56 39.5', M(WOODD, 70), 0.8) +
      r(6, 26, 38, 30, 1.5, 'url(#gi-wood)') +
      r(6, 36, 38, 0.9, 0, WOODD, 'opacity=".6"') + r(6, 46, 38, 0.9, 0, WOODD, 'opacity=".6"') +
      rt(6, 26, 5, 30, 1.2, WOOD) + rt(39, 26, 5, 30, 1.2, M(WOOD, 85)) +
      c(8.5, 29, 0.7, WOODD) + c(8.5, 53, 0.7, WOODD) + c(41.5, 29, 0.7, WOODD) + c(41.5, 53, 0.7, WOODD) +
      hi('M6.8 27H10V28.4H8.2V54H6.8Z', 0.35) + p('M6 26L18 19H20L8.2 26Z', SNOW, 'opacity=".25"') +
      ln('M19.4 35.4C19.4 31.6 22 29.8 25 29.8C28.2 29.8 30.6 31.8 30.6 34.8C30.6 38.2 26.2 38.6 25 41.6V43.2', St, 3.6, 'stroke-linecap="butt" stroke-dasharray="7.5 1.6 7 1.6 30" opacity=".78"') +
      r(23.2, 46, 3.6, 3.6, 0.6, St, 'opacity=".78"');
  })();

  /* empty: the [INSERT GIFT HERE] placeholder */
  I.empty =
    '<rect x="8" y="8" width="48" height="48" rx="6" fill="var(--board)" fill-opacity=".08" stroke="var(--board)" stroke-width="2" stroke-dasharray="6 4"/>' +
    ln('M20 20L44 44M44 20L20 44', V('board'), 2, 'opacity=".3"');

  /* giftbox: wrapped present, 3/4 view, ribbon and bow */
  (function () {
    var G = H('red'), Gd = M(G, 68), Gt = M(G, 70, SNOW), Gs = M(G, 58);
    I.giftbox =
      rt(8, 30, 34, 26, 2, G) + p('M42 30L54 24V50.5L42 56Z', Gd) +
      p('M6 22L18 16H56L44 22Z', Gt) + rt(6, 22, 38, 9, 2, G) + p('M44 22L56 16V24.5L44 31Z', Gs) +
      r(8, 31, 34, 1.4, 0, INK, 'opacity=".18"') +
      r(22, 22, 6, 34, 0, 'url(#gi-gold)') + p('M46 28.9L50 26.9V52.4L46 54.4Z', GOLDD) + p('M46 21L50 19V22.9L46 24.9Z', GOLDD) +
      p('M22 22H28L40 16H34Z', M(GOLD, 70, SNOW)) + p('M10.8 19.6H48.8L51.2 18.4H13.2Z', M(GOLD, 70, SNOW)) +
      hi('M9.5 32.5H11V54H9.5Z', 0.3) + hi('M7.5 23.2H20V24.4H7.5Z', 0.4) +
      p('M31 18C26 10 18 9 17.5 13.5C17 18 25 19.5 31 18Z', GOLD) + p('M31 18C25 15.5 20.5 14 19.6 14.4C21.6 16.4 26 17.6 31 18Z', GOLDD, 'opacity=".7"') +
      p('M31 18C36 10 44 9 44.5 13.5C45 18 37 19.5 31 18Z', M(GOLD, 85)) + p('M31 18C37 15.5 41.5 14 42.4 14.4C40.4 16.4 36 17.6 31 18Z', GOLDD, 'opacity=".7"') +
      p('M30 18.5L25.5 25.5L28 25L29 27.8L31.5 19Z', GOLDD) + p('M32 18.5L37.5 24.5L35 24.5L34.5 27.2L30.5 19Z', GOLDD) +
      e(31, 18, 3, 2.5, M(GOLD, 85)) + e(30.2, 17.2, 1.2, 0.8, SNOW, 'opacity=".55"') +
      hi('M19 12.5C20 11 22.5 11 25 12.5C22.5 12.3 21 12.6 19.8 13.6Z', 0.5);
  })();

  /* ---------- round 3 icons ---------- */
  var RIM = V('snow-shade'), TYRE = V('board-dark'), LAMP = V('lamp');
  function ring(cx, cy, rr, col, w, x) { return '<circle cx="' + cx + '" cy="' + cy + '" r="' + rr + '" fill="none" stroke="' + col + '" stroke-width="' + w + '"' + at(x) + '/>'; }
  function rim(d, o) { return ln(d, LAMP, 0.9, 'opacity="' + (o || 0.55) + '"'); }

  /* bike: child's bicycle with stabilisers, side view facing right */
  (function () {
    var F = H('red'), Fd = M(F, 72);
    function wheel(x) {
      var s = '', i, a;
      for (i = 0; i < 4; i++) { a = i * Math.PI / 4; s += 'M' + r1(x + 6.6 * Math.cos(a)) + ' ' + r1(46 + 6.6 * Math.sin(a)) + 'L' + r1(x - 6.6 * Math.cos(a)) + ' ' + r1(46 - 6.6 * Math.sin(a)); }
      return ring(x, 46, 8.6, TYRE, 2.8) + ring(x, 46, 6.9, RIM, 1) + ln(s, RIM, 0.5, 'opacity=".75"') + c(x, 46, 1.7, GOLD) +
        ln('M' + r1(x - 8.9) + ' 44A9 9 0 0 1 ' + r1(x - 2) + ' 37.3', SNOW, 0.8, 'opacity=".35"');
    }
    I.bike =
      ln('M2.1 42A11.6 11.6 0 0 1 17 35.1', Fd, 2) + ln('M43.5 37.1A11.6 11.6 0 0 1 61 40.2', Fd, 2) +
      wheel(13) + wheel(51) +
      ln('M13 46L6.5 51.5', RIM, 1.4) + ring(6.5, 52.2, 2.8, TYRE, 1.6) + c(6.5, 52.2, 1.6, RIM) +
      ln('M13 46H31M13 46L25 30', Fd, 2.3) +
      ln('M24.6 29L24 25.6', RIM, 1.8) +
      ln('M31 46L24.6 28M25 30L45.2 28.2M31 46L46.6 33', F, 3.6) + ln('M45 26.4L47 34', F, 3.8) + ln('M47 33L51 46', Fd, 2.6) +
      ln('M26 28.8L44.6 27.2M24.4 31L29.6 45', SNOW, 0.8, 'opacity=".45"') + ln('M32 44.4L45.6 33.2', SNOW, 0.7, 'opacity=".3"') +
      c(31, 46, 3.6, M(RIM, 70)) + c(31, 46, 1.5, GOLD) + ln('M31 46L34.4 51.2', RIM, 1.6) + r(32, 50.6, 5, 1.9, 0.9, TYRE) +
      p('M18.6 25.8C20.6 24.2 26 24 29.2 25.2C29.6 26.6 28 27.4 26 27.4L21.4 27.6C19.8 27.6 18.4 27 18.6 25.8Z', TYRE) + hi('M20.4 25.4C22.6 24.6 25.6 24.5 28 25C25.4 25.3 23 25.6 20.9 26.2Z', 0.4) +
      ln('M45.4 26.6L44.6 22.4', RIM, 2) + ln('M44.8 22.6C42.6 21.2 39.8 21.2 37.8 22.4', TYRE, 2.6) +
      rim('M4 39.4A11.6 11.6 0 0 1 15.4 34.6', 0.4) + rim('M45.4 35.6A11.6 11.6 0 0 1 56 35.6', 0.4);
  })();

  /* scooter: two-wheeled kick scooter with T-bar and bell, facing right */
  (function () {
    var S = H('red'), Sd = M(S, 72);
    function wh(x) { return ct(x, 51, 5, TYRE) + c(x, 51, 2.6, RIM) + c(x, 51, 1, GOLDD) + ln('M' + r1(x - 4.2) + ' 49.2A4.6 4.6 0 0 1 ' + r1(x - 1) + ' 46.6', SNOW, 0.7, 'opacity=".4"'); }
    I.scooter =
      wh(13) + wh(51) +
      p('M6.5 47.6C7.4 45 9.8 43.6 12.6 43.6C15 43.6 17 44.6 18 46.2V47.6Z', Sd) +
      ln('M51 51L48.6 40.5', RIM, 2.6) +
      ln('M48.8 41L45 12.6', S, 4.6) + ln('M50.2 40.4L46.6 13.4', Sd, 1.2, 'opacity=".8"') + ln('M47.4 40L43.9 14', SNOW, 0.9, 'opacity=".45"') +
      p('M43.5 44L47.4 38.4L51.2 39.6L49.2 49.6H43.5Z', Sd) + r(46.6, 37, 4.8, 3.2, 1.2, TYRE, 'transform="rotate(-8 49 38.6)"') +
      rt(9, 44, 40, 5.6, 2.8, S) + r(9, 47.9, 40, 1.7, 0.85, Sd, 'opacity=".8"') + r(11.4, 44, 33, 1.5, 0.75, TYRE, 'opacity=".85"') +
      hi('M11 45.6H30V46.6H11Z', 0.3) +
      ln('M35.6 12.6H54.4', RIM, 2.4) + ln('M35 12.6H40M50 12.6H55', TYRE, 3.8) + c(45, 12.8, 2.2, S) +
      ct(42.2, 9.6, 2.1, GOLD) + c(41.6, 9, 0.6, SNOW, 'opacity=".7"');
  })();

  /* violin: warm wood, leaning, with the bow across it */
  (function () {
    var Wv = M(V('lamp-deep'), 70, WOODD), Wvd = M(Wv, 72), Eb = M(INK, 82, WOODD);
    var body = 'M32 21C25.5 21 22.5 24 22.5 28.5C22.5 32 26 33.5 26 36.5C26 39 21 40.5 21 47C21 53 26 56 32 56C38 56 43 53 43 47C43 40.5 38 39 38 36.5C38 33.5 41.5 32 41.5 28.5C41.5 24 38.5 21 32 21Z';
    var v =
      r(30.4, 3.5, 3.2, 6, 1.2, Wvd) + r(26.8, 5, 3.6, 1.5, 0.75, Eb) + r(33.6, 6.8, 3.6, 1.5, 0.75, Eb) + ct(32, 2.8, 2.6, Wv) + c(32.4, 2.8, 1.1, Wvd) +
      r(30.2, 8, 3.6, 15, 1.5, Wvd) +
      pt(body, Wv) + p(body, 'none', 'stroke="' + Wvd + '" stroke-width=".7" transform="translate(32 38.5) scale(.9) translate(-32 -38.5)" opacity=".7"') +
      hi('M24.5 27.5C24.8 24.5 27 22.8 30 22.6C27.8 23.8 26.3 25.6 25.9 28.5Z', 0.4) + hi('M23.2 46C23.6 43 25 41.6 26.8 41C25.4 42.8 24.8 44.4 24.6 46.8Z', 0.35) +
      ln('M27.6 39.4C26.6 41 28.6 43 27.6 45.6M36.4 39.4C37.4 41 35.4 43 36.4 45.6', INK, 0.9) +
      p('M30.4 8H33.6L34.8 38.8a1 1 0 0 1-1 1.2H30.2a1 1 0 0 1-1-1.2Z', Eb) +
      p('M28 44.4H36L35 46.6H29Z', M(LAMP, 50, PAPER)) + p('M30 47.6H34L33.4 53.6a1.4 1.4 0 0 1-2.8 0Z', Eb) +
      ln('M31.1 8.5L30.4 47.6M31.8 8.5L31.6 47.6M32.4 8.5L32.6 47.6M33 8.5L33.6 47.6', RIM, 0.4, 'opacity=".85"') +
      rim('M23 28.4C23 24.5 26 21.6 31 21.4');
    I.violin =
      g('rotate(20 32 55) translate(0 -1.6)', v) +
      ln('M6.6 21.4L56 47.6', WOODD, 1.5) + ln('M8.4 24L52.4 47.6', RIM, 0.9) + ln('M6.6 21.4L8.4 24', WOODD, 1.2) +
      g('rotate(28 53 48)', r(48.6, 46.4, 7.4, 3.6, 1, Eb) + c(51.4, 48.2, 0.9, GOLD) + r(55.6, 46.8, 1.6, 2.8, 0.6, RIM));
  })();

  /* headphones: over-ear, padded cups, no markings */
  (function () {
    var Y = H('yellow'), Yr = M(Y, 85), Bn = M(V('board'), 55, TYRE), Pd = M(TYRE, 80);
    I.headphones =
      ln('M14.5 38V30A17.5 17.5 0 0 1 49.5 30V38', Bn, 4.4) + ln('M19 18.3A17.5 17.5 0 0 1 45 18.3', TYRE, 6) +
      ln('M19.6 17.4A16.6 16.6 0 0 1 30 13.6', SNOW, 0.9, 'opacity=".3"') + rim('M13.4 29.4A18.6 18.6 0 0 1 18.4 16.6') +
      r(12.6, 32, 3.8, 6, 1.5, RIM) + r(47.6, 32, 3.8, 6, 1.5, M(RIM, 85)) +
      rt(17.5, 38, 5.5, 15, 2.5, Pd) + rt(41, 38, 5.5, 15, 2.5, Pd) +
      rt(6, 36, 14, 19, 6, Y) + rt(44, 36, 14, 19, 6, Yr) +
      hi('M7.6 42C7.6 39 9 37.6 11.5 37.4V39C10 39.4 9.2 40.6 9.2 42.6V50H7.6Z', 0.4) + hi('M45.6 42C45.6 39 47 37.6 49.5 37.4V39C48 39.4 47.2 40.6 47.2 42.6V50H45.6Z', 0.3);
  })();

  /* paints: open tin, six colour pans, brush */
  (function () {
    var Tn = V('board'), Tl = M(Tn, 70, SNOW), En = SNOW, cols = ['hue-red', 'lamp-deep', 'hue-yellow', 'hue-green', 'hue-blue', 'hue-purple'], pans = '', i, x;
    for (i = 0; i < 6; i++) { x = r1(10.4 + i * 7.4); pans += r(x, 35.4, 6.4, 4.8, 1.2, V(cols[i])) + r(x, 38.6, 6.4, 1.6, 0.8, INK, 'opacity=".18"') + r(r1(x + 0.8), 36, 2.8, 1.1, 0.55, SNOW, 'opacity=".55"'); }
    I.paints =
      pt('M8 34L12.5 11H51.5L56 34Z', Tn) + p('M10.8 32.4L14.6 13.4H49.4L53.2 32.4Z', En) +
      e(22, 21, 5, 2.2, V('hue-blue'), 'opacity=".55" transform="rotate(-10 22 21)"') + e(39, 26.5, 5.4, 2, V('hue-red'), 'opacity=".5"') + e(43, 18, 3.4, 1.8, V('hue-yellow'), 'opacity=".7"') +
      p('M10.8 32.4L14.6 13.4H49.4L53.2 32.4Z', TONE) +
      p('M8 33.5H56L58.5 42H5.5Z', Tl) + p('M9.6 34.6H54.4L56 40.8H8Z', En) + pans +
      pt('M5.5 42H58.5V53a3 3 0 0 1-3 3H8.5a3 3 0 0 1-3-3Z', Tn) + r(5.5, 42, 53, 1.4, 0, SNOW, 'opacity=".3"') + r(5.5, 46, 53, 1, 0, GOLD, 'opacity=".75"') +
      hi('M7 43.6H20V44.6H8.2V53H7Z', 0.3) +
      g('rotate(-12 34 50)', rt(12, 49, 31, 3, 1.5, WOOD) + r(43, 48.6, 6, 3.8, 0.9, RIM) + p('M49 48.6C53 48.8 56.6 49.6 58.4 50.5C56.6 51.4 53 52.2 49 52.4Z', M(WOODD, 80)) + p('M53.6 49.1C55.6 49.5 57.4 50 58.4 50.5C57.4 51 55.6 51.5 53.6 51.9Z', V('hue-blue')) + hi('M13.5 49.6H42V50.4H13.5Z', 0.4));
  })();

  /* dollshouse: open front, two rooms with little beds, roof takes the hue */
  (function () {
    var R = H('red'), Rd = M(R, 72), Fl = M(WOOD, 80), Win = M(V('night-600'), 70, SNOW);
    function room(y, h, wall) { return r(13.5, y, 37, h, 0.8, wall) + r(13.5, y, 37, 2, 0, INK, 'opacity=".2"') + r(13.5, y, 2, h, 0, INK, 'opacity=".12"'); }
    function bed(x, y, f, flip) {
      var hb = flip ? x + 12 : x - 1.6;
      return r(r1(hb), y - 6, 2, 8, 0.8, WOODD) + r(x, y - 1, 12, 3, 0.8, WOOD) + r(x, y - 3.6, 12, 3, 1.2, f) +
        e(flip ? r1(x + 9.4) : r1(x + 2.6), y - 3.4, 2.4, 1.3, SNOW) + r(x, y - 3.6, 12, 1, 0.5, SNOW, 'opacity=".3"');
    }
    I.dollshouse =
      rt(42.5, 9, 5.5, 12, 1, Rd) + r(41.8, 8, 7, 2.4, 1, M(Rd, 85)) +
      rt(10, 27, 44, 29, 1.5, WOOD) +
      room(30.5, 11, M(V('hue-pink'), 30, PAPER)) + room(44.5, 9.5, M(V('hue-blue'), 25, PAPER)) +
      r(39, 32.6, 7, 5.6, 1, Win) + ln('M42.5 32.6V38.2M39 35.4H46', WOOD, 0.8) +
      bed(19.6, 39.6, V('hue-blue'), 0) + bed(31.4, 53, V('hue-green'), 1) +
      c(18.6, 48.6, 1.8, LAMP) + c(18.6, 48.6, 3.4, LAMP, 'opacity=".25"') + r(18.1, 50, 1, 4, 0.5, WOODD) +
      hi('M11.2 28.4H13V54.6H11.2Z', 0.3) +
      r(5, 27.6, 54, 3, 1.5, Rd) + pt('M5 29L32 7.5L59 29Z', R) +
      ln('M14.6 22.4H49.4M21.4 17H42.6', Rd, 0.9, 'opacity=".6"') +
      c(32, 21, 3.4, WOODD) + c(32, 21, 2.3, Win) +
      hi('M8.6 27.4L31.6 9.3V11.8L11.8 27.4Z', 0.3) + rim('M6.4 28L31.4 8');
  })();

  /* trainset: wooden engine on an arched bridge of track */
  (function () {
    var E = H('green'), Ed = M(E, 72), Ch = M(TYRE, 90), Win = M(V('night-600'), 70, SNOW);
    var br = 'M3 46.5Q32 42 61 46.5V56H46V55C46 51.4 40 49.6 32 49.6C24 49.6 18 51.4 18 55V56H3Z';
    function wh(x) { return ct(x, 41, 3.9, RED) + c(x, 41, 1.3, WOODD) + c(x - 1.2, 39.8, 0.8, SNOW, 'opacity=".4"'); }
    I.trainset =
      p(br, 'url(#gi-wood)') + p(br, TONE) +
      ln('M18.6 54.6C18.8 51.6 24.4 50.2 32 50.2C39.6 50.2 45.2 51.6 45.4 54.6', WOODD, 1.2, 'opacity=".6"') +
      ln('M4.5 48.4Q32 44 59.5 48.4', WOODD, 0.8, 'opacity=".7"') + rim('M3.4 46.6Q32 42.1 60.6 46.6', 0.5) +
      rt(12, 34.5, 41, 4.5, 1.6, WOOD) +
      rt(25, 24.5, 24, 10.5, 4, E) + r(31, 24.5, 1.4, 10.5, 0, Ed) + r(40, 24.5, 1.4, 10.5, 0, Ed) + hi('M27.5 26H46V27.2H27.5Z', 0.4) +
      rt(41, 15.5, 5, 9.5, 1.2, Ch) + r(40, 13.8, 7, 2.6, 1.3, M(Ch, 85)) + e(35.6, 24.6, 3, 2.2, GOLD) + c(34.8, 23.8, 0.7, SNOW, 'opacity=".6"') +
      rt(13, 19.5, 13, 15.5, 2, E) + rt(11.4, 16.6, 16.2, 3.6, 1.6, Ed) + r(16, 22.2, 7, 6, 1.2, Win) + hi('M14.4 21H15.6V33.6H14.4Z', 0.35) +
      c(53.6, 36.8, 1.9, RED) + wh(19) + wh(29.5) + wh(42.5) +
      c(47, 9.8, 2.6, SNOW, 'opacity=".5"') + c(51, 6.6, 1.9, SNOW, 'opacity=".35"') + rim('M11.6 18.4C11.8 17.4 12.6 16.8 14 16.8H26');
  })();

  /* rollerskates: a pair of quad skates, toe to the right */
  function skate(f) {
    var Fd = M(f, 72), Fc = M(f, 62, SNOW);
    function wh(x) { return ct(x, 51.2, 4.8, GOLD) + c(x, 51.2, 1.7, GOLDD) + c(x - 1.6, 49.6, 0.9, SNOW, 'opacity=".45"'); }
    return r(46.5, 44, 5.5, 5.6, 2, M(RED, 75)) + p('M17 46H25L23.2 49H18.8Z', RIM) + p('M37 46H45L43.2 49H38.8Z', RIM) + wh(21) + wh(41) +
      r(12.5, 43.4, 37, 3.2, 1.6, TYRE) +
      pt('M14 16a3.5 3.5 0 0 1 3.5-3.5H29a3.5 3.5 0 0 1 3.5 3.5V29C32.5 31.5 34.5 32.8 37.5 33.2L44 34.2C48 34.8 50.5 37.5 50.5 41V44.5H14Z', f) +
      p('M14 32C18 32 21.5 35 21.5 39.5V44.5H14Z', Fd, 'opacity=".55"') + r(13.4, 41.6, 37.6, 2.8, 1.4, RIM) + r(13.4, 41.6, 37.6, 1, 0.5, SNOW, 'opacity=".5"') +
      rt(13, 10.6, 20.5, 6, 3, Fc) + ln('M27.4 19.6H32M27.4 23.4H32M27.4 27.2H32M30.4 31L33.6 33', SNOW, 1.3) +
      hi('M16 18H18V39H16Z', 0.3);
  }
  (function () {
    var K = H('pink');
    I.rollerskates = g('translate(-5 -6)', skate(M(K, 78))) + g('translate(4 0)', skate(K));
  })();

  /* helmet: rounded cycle helmet with vents and a strap, facing left */
  (function () {
    var Hh = H('purple'), Hd = M(Hh, 72);
    var vents = 'M21 22.2C24.6 19.4 28.4 18 32 17.6M37.4 17.8C41.4 18.4 45 20 48 22.6M14.6 32C17 27.6 21 24.6 25.4 23.2M30.6 22.2C35 21.8 39.4 22.8 43.4 25.4M48.4 28.4C50.8 30.6 52.6 33.4 53.6 36.6M18.4 39C20.4 35 23.8 32.2 28.2 30.6M33.4 29.6C37.4 29.6 41.4 31 44.6 34';
    I.helmet =
      ln('M15 49C11.5 52.5 12.5 55.6 17 55.6H28.5M41 49C41 52.6 39 55.6 35 55.6', TYRE, 1.7) + rt(28.2, 54, 6, 3.4, 1.3, RIM) +
      rt(7, 44.5, 50, 6.5, 3, TYRE) +
      pt('M5 45C5 27 17 14 34 14C49 14 58.6 22.6 60.6 34.6C61.4 39.6 60.4 44 57.4 46.4L53 47H9C6.5 47 5 46.4 5 45Z', Hh) +
      p('M53 44.6C56.6 43.6 59 41 60.4 37.4C60.8 41.6 59.8 44.8 57.4 46.4L53 47Z', Hd, 'opacity=".8"') +
      p('M2.4 39.6C1.4 42.6 2.8 45.4 6 45.8L16 46.6C14.4 42.6 9.4 39.8 2.4 39.6Z', Hd) +
      ln(vents, NIGHT, 2.8, 'opacity=".72"') + ln(vents, Hd, 0.8, 'opacity=".5" transform="translate(.6 .9)"') +
      hi('M9.5 36C11 26 18.5 18.5 28 16.6C21 20.5 15 27 12.5 37Z', 0.35) + rim('M6 40.5C7 28 17 16.6 31 15');
  })();

  /* book: standing hardback, 3/4 view, cover takes the hue, gold emblem */
  (function () {
    var B = H('blue'), Bd = M(B, 66), Ps = V('paper-shade');
    I.book =
      p('M19 6.4H49a2 2 0 0 1 2 2V50.4a2 2 0 0 1-2 2L45 56H19Z', Bd) +
      p('M15.6 10.2L20.4 7.2H49L44.6 10.2Z', PAPER) + p('M44.6 10.6L49.4 7.6V50.6L44.6 54Z', Ps) +
      ln('M45.8 14.6L48.4 12.8M45.8 22L48.4 20.2M45.8 29.4L48.4 27.6M45.8 36.8L48.4 35M45.8 44.2L48.4 42.4', M(Ps, 82), 0.6) +
      pt('M14 12a2 2 0 0 1 2-2H43a2.5 2.5 0 0 1 2.5 2.5V53.5A2.5 2.5 0 0 1 43 56H16a2 2 0 0 1-2-2Z', B) +
      r(14, 10, 4.2, 46, 2, Bd, 'opacity=".55"') + r(18.8, 10, 0.8, 46, 0, Bd) +
      r(22.4, 16.5, 17, 10.5, 1.5, 'url(#gi-gold)') + r(23.8, 17.9, 14.2, 7.7, 1, B) + ln('M26.6 20.6H35.2M27.8 23H34', GOLD, 1) +
      p('M30.9 32L35 38.5L30.9 45L26.8 38.5Z', 'url(#gi-gold)') + p('M30.9 35.4L32.8 38.5L30.9 41.6L29 38.5Z', B, 'opacity=".7"') +
      hi('M20.6 11.6H42V12.8H21.8V53H20.6Z', 0.3) + rim('M14.7 53V12.4C14.7 11.4 15.2 10.7 16.4 10.7H30');
  })();

  /* football: generic panelled ball with a hand pump */
  (function () {
    var BC = [26, 42, 14], P0 = [24.4, 40.2], pan = '', seam = '', k, a, oc, ov = [];
    function pg(cx, cy, R, rot) {
      var s = '', i, t, pts = [];
      for (i = 0; i < 5; i++) { t = (rot + 72 * i - 90) * Math.PI / 180; pts.push([r1(cx + R * Math.cos(t)), r1(cy + R * Math.sin(t))]); s += (i ? 'L' : 'M') + pts[i][0] + ' ' + pts[i][1]; }
      return { d: s + 'Z', v: pts };
    }
    var cen = pg(P0[0], P0[1], 5.2, 0);
    pan += cen.d;
    for (k = 0; k < 5; k++) {
      a = (72 * k - 90) * Math.PI / 180;
      oc = pg(r1(P0[0] + 12.8 * Math.cos(a)), r1(P0[1] + 12.8 * Math.sin(a)), 4.6, 72 * k + 180);
      ov.push(oc); pan += oc.d;
      seam += 'M' + cen.v[k][0] + ' ' + cen.v[k][1] + 'L' + oc.v[0][0] + ' ' + oc.v[0][1];
    }
    for (k = 0; k < 5; k++) seam += 'M' + ov[k].v[1][0] + ' ' + ov[k].v[1][1] + 'L' + ov[(k + 1) % 5].v[4][0] + ' ' + ov[(k + 1) % 5].v[4][1];
    I.football =
      '<clipPath id="gi-fb"><circle cx="' + BC[0] + '" cy="' + BC[1] + '" r="' + BC[2] + '"/></clipPath>' +
      rt(44, 53, 14, 3, 1.5, TYRE) + ln('M47.6 50.5C44 50.5 42 49 40.2 46.6', TYRE, 1.3) +
      r(50.2, 15, 1.6, 10, 0.8, RIM) + rt(45, 12.6, 12, 3.4, 1.7, WOOD) +
      rt(47.5, 23.5, 7, 30, 3.5, RED) + r(47.5, 27, 7, 1, 0, M(RED, 70)) + hi('M48.8 25.5H50V51H48.8Z', 0.4) +
      c(BC[0], BC[1], BC[2], SNOW) +
      g('', p(pan, INK) + ln(seam, V('snow-shade'), 0.8), 'clip-path="url(#gi-fb)"') +
      c(BC[0], BC[1], BC[2], TONE) + e(19.5, 33.8, 4.4, 2.4, SNOW, 'opacity=".5" transform="rotate(-38 19.5 33.8)"') +
      rim('M12.6 39.4A13.6 13.6 0 0 1 22.6 28.6', 0.5);
  })();

  /* ---------- sprite + contracts ---------- */
  var IDS = ['teddy', 'grizzly', 'brickcastle', 'castle', 'kite', 'bird', 'pyjamas', 'dino', 'cricketbat', 'bat', 'socks', 'sock', 'boots', 'boot', 'chess', 'pawns', 'jigsaw', 'telescope', 'crate', 'empty', 'giftbox',
    'bike', 'scooter', 'violin', 'headphones', 'paints', 'dollshouse', 'trainset', 'rollerskates', 'helmet', 'book', 'football'];
  /* contact shadow per icon: [cx, rx, opacity] (none for the placeholder) */
  var SH = {
    teddy: [32, 17], grizzly: [33, 27], brickcastle: [32, 29], castle: [32, 27], kite: [42, 14, 0.25], bird: [32, 28],
    pyjamas: [32, 26], dino: [32, 26], cricketbat: [36, 20], bat: [32, 13, 0.18], socks: [34, 25], sock: [38, 21],
    boots: [34, 28], boot: [34, 27], chess: [32, 29], pawns: [32, 25], jigsaw: [31, 22], telescope: [31, 15],
    crate: [31, 27], giftbox: [31, 26],
    bike: [32, 28, 0.26], scooter: [32, 24], violin: [34, 18], headphones: [32, 25], paints: [32, 28], dollshouse: [32, 26],
    trainset: [32, 29], rollerskates: [33, 26], helmet: [31, 27], book: [31, 19], football: [36, 23]
  };

  var sprite = '<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" style="position:absolute;width:0;height:0;overflow:hidden"><defs>' + DEFS + '</defs>';
  IDS.forEach(function (id) { sprite += '<symbol id="g-' + id + '" viewBox="0 0 64 64" overflow="visible">' + I[id] + '</symbol>'; });
  sprite += '</svg>';

  NP.icons = { sprite: sprite, ids: IDS.slice() };

  var CRACK = ln('M33 8L29.5 18L35 25L28.5 33L34.5 40L30 48L33 58', INK, 1.6, 'opacity=".75"') +
    ln('M34 8.2L30.6 18L36 25L29.6 33L35.5 40L31 48', SNOW, 0.7, 'opacity=".55"') +
    ln('M35 25L41 27.5M28.5 33L22.5 31.5', INK, 1.1, 'opacity=".6"');

  function pill(x, w, h) {
    return r(x, 2.1, r1(w), h, h / 2, GOLDD) + r(x, 0.5, r1(w), h, h / 2, 'url(#gi-gold)') +
      r(r1(x + 3), 1.4, r1(w - 6), r1(h * 0.26), r1(h * 0.13), SNOW, 'opacity=".45"');
  }
  var FONT = 'style="font-family:var(--font-ui,system-ui,sans-serif);font-variant-numeric:tabular-nums"';
  function badge(t) {
    var tx = String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;');
    /* a count of one (or half) is the joke: a bigger pill that says ONLY, so it reads as a quantity, not a sticker */
    var m = /^\s*[×x]\s*(1|½)\s*$/.exec(t);
    if (m) {
      var big = m[1], nw = big === '½' ? 12.4 : 8.6, h = 19, pw = r1(6 + 19 + 2.4 + nw + 6.5), x = r1(63.5 - pw);
      return '<g>' + pill(x, pw, h) +
        '<text x="' + r1(x + 6) + '" y="12.6" font-size="6.6" font-weight="800" fill="var(--ink-soft)" textLength="19" lengthAdjust="spacingAndGlyphs" ' + FONT + '>ONLY</text>' +
        '<text x="' + r1(x + 6 + 19 + 2.4 + nw / 2) + '" y="15.4" text-anchor="middle" font-size="16" font-weight="900" fill="var(--ink)" ' + FONT + '>' + big + '</text></g>';
    }
    var w = 0, i, ch, fs = 10, pw2, tw, x2, h2 = 14;
    for (i = 0; i < t.length; i++) {
      ch = t.charAt(i);
      w += /[0-9]/.test(ch) ? 0.58 : /[,.]/.test(ch) ? 0.28 : ch === '×' ? 0.6 : ch === '½' ? 0.82 : /[ ]/.test(ch) ? 0.28 : 0.62;
    }
    tw = w * fs; pw2 = tw + 10;
    if (pw2 > 63) { fs = fs * 53 / tw; tw = 53; pw2 = 63; }
    x2 = r1(63.5 - pw2);
    return '<g>' + pill(x2, pw2, h2) +
      '<text x="' + r1(x2 + pw2 / 2) + '" y="' + r1(0.5 + h2 / 2 + fs * 0.36) + '" text-anchor="middle" font-size="' + r1(fs) +
      '" font-weight="800" fill="var(--ink)" textLength="' + r1(tw) + '" lengthAdjust="spacingAndGlyphs" ' + FONT + '>' + tx + '</text></g>';
  }

  var uid = 0;
  /* spec = { icon, hue?, badge?, scale?: 'giant'|'tiny', broken?: true, tilt?: deg, outline?: true (for <40px use) } */
  NP.giftSVG = function (spec) {
    spec = spec || {};
    var id = I[spec.icon] ? spec.icon : 'giftbox';
    var k = spec.scale === 'giant' ? 1.7 : spec.scale === 'tiny' ? 0.45 : 1;
    var sh = SH[id];
    var o = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%" overflow="visible" aria-hidden="true"' +
      (spec.hue ? ' style="--gift-hue:var(--hue-' + String(spec.hue).replace(/[^a-z]/g, '') + ')"' : '') + '>';
    if (sh) {
      /* contact shadow: a wide soft pool plus a tight dark core, so it still reads on the dark belt */
      var kk = Math.max(0.6, Math.min(k, 1.3)), sx = r1(32 + (sh[0] - 32) * k), w0 = Math.min(sh[1] * k, 50), so = (sh[2] || 0.3) / 0.3;
      /* sits slightly above the baseline so it lands on the lit belt top, not the black rubber edge */
      o += e(sx, 52.8, r1(w0 * 1.35), r1(5.6 * kk), 'url(#gi-ao)', 'opacity="' + r1(Math.min(1, 0.8 * so) * 100) / 100 + '"') +
        e(sx, 54.6, r1(w0 * 1.05), r1(3 * kk), 'url(#gi-ao)', 'opacity="' + r1(Math.min(1, so) * 100) / 100 + '"');
    }
    var inner = '<use href="#g-' + id + '"/>';
    if (spec.broken) {
      var m = 'gim' + (++uid);
      inner += '<mask id="' + m + '" maskUnits="userSpaceOnUse" x="-32" y="-32" width="128" height="128"><use href="#g-' + id + '" filter="url(#gi-white)"/></mask><g mask="url(#' + m + ')">' + CRACK + '</g>';
    }
    if (k !== 1) {
      inner = '<g transform="translate(32 56) scale(' + k + ') translate(-32 -56)">' + inner + '</g>';
      if (k > 1) inner = '<g mask="url(#gi-giant)">' + inner + '</g>';
    }
    if (spec.outline && id !== 'empty') inner = '<g filter="url(#gi-ol)">' + inner + '</g>';
    if (spec.broken) {
      var a = typeof spec.tilt === 'number' ? spec.tilt : (9 + Math.random() * 7) * (Math.random() < 0.5 ? -1 : 1);
      inner = '<g transform="rotate(' + r1(a) + ' 32 46)" filter="url(#gi-desat)">' + inner + '</g>';
    }
    o += inner;
    if (spec.badge) o += spec.broken ? '<g filter="url(#gi-desat)" opacity=".8">' + badge(String(spec.badge)) + '</g>' : badge(String(spec.badge));
    return o + '</svg>';
  };
})(window.NP);
