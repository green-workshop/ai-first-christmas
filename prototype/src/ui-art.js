window.NP = window.NP || {};

// UI art: logo lettering, title dashboard, small UI icons (SPEC §9.6, §9.8). Ids are prefixed ui-.
(function (NP) {
  var art = NP.art = NP.art || {};
  function st(s) { return ' style="' + s + '"'; }
  function sp(o, c, a) { return '<stop offset="' + o + '"' + st('stop-color:' + c) + (a ? ' stop-opacity="' + a + '"' : '') + '/>'; }
  var FUI = 'font-family:var(--font-ui);';

  // ---- Hand-built lettering. Each glyph: [ink width, centre-line path]. Rendered as fat round strokes.
  // Caps: height 40, slab feet at the stems.
  var CAP = {
    N: [26, 'M0 40V0L26 40V0M-5 40H5M21 0H31'],
    O: [28, 'M9 0H19A9 9 0 0 1 28 9V31A9 9 0 0 1 19 40H9A9 9 0 0 1 0 31V9A9 9 0 0 1 9 0Z'],
    R: [26, 'M0 40V0H15A10 10 0 0 1 15 20H0M13 20L26 40M-6 40H6'],
    T: [26, 'M0 5V0H26V5M13 0V40M6 40H20'],
    H: [26, 'M0 0V40M26 0V40M0 20H26M-5 0H3M-5 40H3M23 0H31M23 40H31'],
    P: [24, 'M0 40V0H14A10 10 0 0 1 14 20H0M-6 40H6'],
    L: [17, 'M0 0V40H21V35M-6 0H6'],
    E: [22, 'M22 5V0H0V40H22V35M0 20H15'],
    D: [27, 'M0 0V40H10A17 17 0 0 0 27 23V17A17 17 0 0 0 10 0ZM-6 0H0M-6 40H0']
  };
  // Small monoline script for the strapline: cap 0..20, x-height 7.
  var LOW = {
    A: [16, 'M0 20L8 0L16 20M3.5 13.5H12.5'], I: [0, 'M0 0V20'], '-': [7, 'M0 12H7'],
    F: [11, 'M11 0H0V20M0 10H9'], i: [0, 'M0 8V20M0 2.5V2.6'], r: [8, 'M0 20V7M0 13C0 9 3 7 8 7'],
    s: [9, 'M9 9C7.5 7 0 6.5 0 10.5C0 14 9 13 9 16.8C9 21 1.5 21 0 18.5'],
    t: [7, 'M2.5 2V16.5C2.5 19.5 4.5 20.5 7 19.8M0 8H7'], C: [15, 'M15 3.5A10 10 0 1 0 15 16.5'],
    h: [10, 'M0 0V20M0 13C0 6 10 6 10 13V20'],
    m: [15, 'M0 20V7M0 12.5C0 6 7.5 6 7.5 12.5V20M7.5 12.5C7.5 6 15 6 15 12.5V20'],
    a: [10, 'M10 7V20M10 13.5C10 6 0 6 0 13.5C0 21 10 21 10 13.5']
  };
  function word(tbl, str, gap, space) {
    var x = 0, out = '';
    for (var i = 0; i < str.length; i++) {
      var c = str[i];
      if (c === ' ') { x += space; continue; }
      var g = tbl[c];
      out += '<path transform="translate(' + x + ' 0)" d="' + g[1] + '"/>';
      x += g[0] + gap;
    }
    return { g: out, w: x - gap };
  }

  art.logo = (function () {
    var big = word(CAP, 'NORTH POLE LTD', 21, 16), sm = word(LOW, 'AI-First Christmas', 4.6, 8);
    var W = big.w + 40, ox = 20, oy = 12;
    var pw = sm.w * 1.2 + 84, px = (W - pw) / 2, py = 78;
    var star = function (x) { return '<path transform="translate(' + x + ' ' + (py + 19.5) + ')" d="M0-6.5L1.6-1.6L6.5 0L1.6 1.6L0 6.5L-1.6 1.6L-6.5 0L-1.6-1.6Z" fill="url(#ui-lb)"/>'; };
    var txt = function (dy, sw, paint) { return '<g transform="translate(' + (px + 42) + ' ' + (py + 8 + dy) + ') scale(1.2)" fill="none" stroke-width="' + sw + '" stroke-linecap="round" stroke-linejoin="round"' + st('stroke:' + paint) + '>' + sm.g + '</g>'; };
    var use = function (dx, dy, sw, paint, extra) {
      return '<use href="#ui-lw" transform="translate(' + (ox + dx) + ' ' + (oy + dy) + ')" stroke-width="' + sw + '"' + st('stroke:' + paint) + (extra || '') + '/>';
    };
    return '<svg class="np-logo" viewBox="0 0 ' + W + ' 128" role="img" aria-label="North Pole Ltd. AI-First Christmas" xmlns="http://www.w3.org/2000/svg">' +
      '<defs><g id="ui-lw" fill="none" stroke-linecap="round" stroke-linejoin="round">' + big.g + '</g>' +
      '<linearGradient id="ui-lf" x1="0" y1="-4" x2="0" y2="44" gradientUnits="userSpaceOnUse">' + sp('0', 'color-mix(in srgb,var(--pole-red) 78%,var(--lamp))') + sp('.55', 'var(--pole-red)') + sp('1', 'var(--pole-red-dark)') + '</linearGradient>' +
      '<linearGradient id="ui-lb" x1="0" y1="-6" x2="20" y2="46" gradientUnits="userSpaceOnUse">' + sp('0', 'var(--lamp)') + sp('.5', 'var(--gold)') + sp('1', 'var(--gold-dark)') + '</linearGradient>' +
      '<linearGradient id="ui-lp" x1="0" y1="0" x2=".25" y2="1">' + sp('0', 'color-mix(in srgb,var(--pole-green) 85%,var(--lamp))') + sp('.5', 'var(--pole-green-dark)') + sp('1', 'color-mix(in srgb,var(--pole-green-dark) 70%,var(--night-900))') + '</linearGradient>' +
      '<filter id="ui-lbl" x="-5%" y="-30%" width="110%" height="160%"><feGaussianBlur stdDeviation="3"/></filter></defs>' +
      use(2, 9, 14, 'var(--night-900)', ' opacity=".4" filter="url(#ui-lbl)"') +
      use(0, 6.5, 14, 'var(--pole-red-dark)') + use(0, 4.5, 14, 'var(--pole-red-dark)') + use(0, 2.5, 14, 'color-mix(in srgb,var(--pole-red-dark) 70%,var(--pole-red))') +
      use(0, 0, 14, 'url(#ui-lb)') + use(.9, 1.2, 9.6, 'url(#ui-lf)') +
      // strapline plate
      '<rect x="' + (px + 1) + '" y="' + (py + 4) + '" width="' + pw + '" height="40" rx="20"' + st('fill:var(--night-900)') + ' opacity=".35" filter="url(#ui-lbl)"/>' +
      '<rect x="' + px + '" y="' + py + '" width="' + pw + '" height="40" rx="20"' + st('fill:var(--gold-dark)') + '/>' +
      '<rect x="' + px + '" y="' + py + '" width="' + pw + '" height="38.5" rx="19.3" fill="url(#ui-lb)"/>' +
      // enamel badge: deep green enamel, gold pinstripe, sheen, gold sparkles, raised cream lettering
      '<rect x="' + (px + 3) + '" y="' + (py + 3) + '" width="' + (pw - 6) + '" height="33" rx="16.5" fill="url(#ui-lp)"/>' +
      '<path d="M' + (px + 19) + ' ' + (py + 4.5) + 'H' + (px + pw - 19) + 'A15 15 0 0 1 ' + (px + pw - 5) + ' ' + (py + 15) + 'C' + (px + pw * 0.6) + ' ' + (py + 11) + ' ' + (px + pw * 0.3) + ' ' + (py + 12) + ' ' + (px + 5) + ' ' + (py + 17) + 'A15 15 0 0 1 ' + (px + 19) + ' ' + (py + 4.5) + 'Z"' + st('fill:var(--snow)') + ' opacity=".1"/>' +
      '<rect x="' + (px + 6.5) + '" y="' + (py + 6.5) + '" width="' + (pw - 13) + '" height="26" rx="13" fill="none" stroke-width="1.3"' + st('stroke:var(--gold)') + ' opacity=".75"/>' +
      star(px + 22) + star(px + pw - 22) +
      txt(1.6, 3.4, 'color-mix(in srgb,var(--night-900) 70%,transparent)') + txt(.6, 3.2, 'var(--gold-dark)') + txt(0, 3.2, 'var(--paper)') +
      '</svg>';
  })();

  // ---- Title dashboard: green enamel board, gauge pegged at 100%, stamped USE CASE: TBC
  art.titleDashboard = (function () {
    var cx = 178, cy = 214, r = 112, t = '';
    for (var i = 0; i <= 10; i++) {
      var a = Math.PI * (1 - i / 10), c = Math.cos(a), s = Math.sin(a), r1 = r - 26, r2 = r - (i % 5 ? 34 : 38);
      t += 'M' + (cx + c * r1).toFixed(1) + ' ' + (cy - s * r1).toFixed(1) + 'L' + (cx + c * r2).toFixed(1) + ' ' + (cy - s * r2).toFixed(1);
    }
    var arc = 'M' + (cx - r) + ' ' + cy + 'A' + r + ' ' + r + ' 0 0 1 ' + (cx + r) + ' ' + cy;
    function lcd(y, label, val, extra) {
      return '<rect x="340" y="' + y + '" width="150" height="62" rx="9"' + st('fill:var(--night-900)') + ' opacity=".55"/>' +
        '<rect x="340" y="' + (y + 59) + '" width="150" height="3" rx="1.5"' + st('fill:var(--lamp)') + ' opacity=".18"/>' +
        '<text x="352" y="' + (y + 20) + '"' + st(FUI + 'font-weight:700;font-size:11px;letter-spacing:.1em;fill:var(--snow-shade)') + '>' + label + '</text>' +
        '<text x="352" y="' + (y + 50) + '"' + st('font-family:var(--font-mono);font-weight:700;font-size:26px;fill:var(--gold)') + '>' + val + '</text>' + (extra || '');
    }
    return '<svg class="np-dash" viewBox="0 0 520 320" role="img" aria-label="Dashboard: AI adoption 100 percent. Issues reported: 0. Use case: TBC." xmlns="http://www.w3.org/2000/svg"><defs>' +
      '<linearGradient id="ui-dg" x1="0" y1="0" x2=".6" y2="1">' + sp('0', 'color-mix(in srgb,var(--pole-green) 80%,var(--lamp))') + sp('.45', 'var(--pole-green)') + sp('1', 'var(--pole-green-dark)') + '</linearGradient>' +
      '<linearGradient id="ui-db" x1="0" y1="0" x2=".5" y2="1">' + sp('0', 'var(--lamp)') + sp('.4', 'var(--gold)') + sp('1', 'var(--gold-dark)') + '</linearGradient>' +
      '<linearGradient id="ui-da" x1="0" y1="0" x2="1" y2="0">' + sp('0', 'var(--gold-dark)') + sp('.7', 'var(--gold)') + sp('1', 'var(--lamp)') + '</linearGradient>' +
      '<filter id="ui-dbl" x="-10%" y="-10%" width="120%" height="130%"><feGaussianBlur stdDeviation="6"/></filter>' +
      '<filter id="ui-dn"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="2" seed="3"/><feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 -3 2.6"/></filter>' +
      '<mask id="ui-dm"><rect x="280" y="170" width="240" height="120" filter="url(#ui-dn)"' + st('fill:var(--snow)') + '/></mask></defs>' +
      '<ellipse cx="262" cy="306" rx="250" ry="12"' + st('fill:var(--night-900)') + ' opacity=".45" filter="url(#ui-dbl)"/>' +
      '<rect x="8" y="8" width="504" height="290" rx="22" fill="url(#ui-db)"/>' +
      '<rect x="14" y="14" width="492" height="278" rx="17"' + st('fill:var(--pole-green-dark)') + '/>' +
      '<rect x="15" y="15" width="490" height="275" rx="16" fill="url(#ui-dg)"/>' +
      '<path d="M31 15H489A16 16 0 0 1 505 31V60C380 40 160 36 15 64V31A16 16 0 0 1 31 15Z"' + st('fill:var(--snow)') + ' opacity=".07"/>' +
      [[34, 34], [486, 34], [34, 270], [486, 270]].map(function (p) {
        return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="6.5" fill="url(#ui-db)"/><path d="M' + (p[0] - 3.5) + ' ' + (p[1] + 2) + 'L' + (p[0] + 3.5) + ' ' + (p[1] - 2) + '" stroke-width="1.6"' + st('stroke:var(--gold-dark)') + '/>';
      }).join('') +
      '<text x="52" y="58"' + st(FUI + 'font-weight:800;font-size:22px;letter-spacing:.12em;fill:var(--paper)') + '>AI ADOPTION</text>' +
      '<rect x="52" y="68" width="150" height="3" rx="1.5"' + st('fill:var(--gold)') + '/>' +
      // gauge
      '<path d="' + arc + '" fill="none" stroke-width="30" stroke-linecap="round"' + st('stroke:var(--night-900)') + ' opacity=".5"/>' +
      '<path d="' + arc + '" fill="none" stroke-width="20" stroke-linecap="round" stroke="url(#ui-da)"/>' +
      '<path d="M' + (cx - r + 6) + ' ' + (cy - 30) + 'A' + (r - 6) + ' ' + (r - 6) + ' 0 0 1 ' + (cx - 30) + ' ' + (cy - r + 8) + '" fill="none" stroke-width="2.5" stroke-linecap="round"' + st('stroke:var(--lamp)') + ' opacity=".6"/>' +
      '<path d="' + t + '" stroke-width="3" stroke-linecap="round"' + st('stroke:var(--paper)') + ' opacity=".75"/>' +
      '<text x="' + cx + '" y="' + (cy - 22) + '" text-anchor="middle"' + st(FUI + 'font-weight:800;font-size:40px;letter-spacing:-.02em;fill:var(--paper)') + '>100%</text>' +
      '<text x="' + (cx - r) + '" y="' + (cy + 30) + '" text-anchor="middle"' + st(FUI + 'font-weight:700;font-size:13px;fill:var(--snow-shade)') + '>0</text>' +
      '<text x="' + (cx + r) + '" y="' + (cy + 30) + '" text-anchor="middle"' + st(FUI + 'font-weight:700;font-size:13px;fill:var(--gold)') + '>MAX</text>' +
      // needle pegged past the stop
      '<g transform="rotate(8 ' + cx + ' ' + cy + ')"><path d="M' + cx + ' ' + (cy - 6) + 'L' + (cx + r - 4) + ' ' + (cy - 1) + 'L' + (cx + r - 4) + ' ' + (cy + 1) + 'L' + cx + ' ' + (cy + 6) + 'Z"' + st('fill:var(--night-900)') + ' opacity=".3" transform="translate(2 4)"/>' +
      '<path d="M' + cx + ' ' + (cy - 6) + 'L' + (cx + r - 4) + ' ' + (cy - 1) + 'L' + (cx + r - 4) + ' ' + (cy + 1) + 'L' + cx + ' ' + (cy + 6) + 'Z"' + st('fill:var(--paper)') + '/>' +
      '<path d="M' + (cx + r - 34) + ' ' + (cy - 2.5) + 'L' + (cx + r - 4) + ' ' + (cy - 1) + 'L' + (cx + r - 4) + ' ' + (cy + 1) + 'L' + (cx + r - 34) + ' ' + (cy + 2.5) + 'Z"' + st('fill:var(--pole-red)') + '/></g>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="13" fill="url(#ui-db)"/><circle cx="' + (cx - 3) + '" cy="' + (cy - 3) + '" r="4"' + st('fill:var(--lamp)') + ' opacity=".8"/>' +
      '<circle cx="' + (cx + r + 6) + '" cy="' + (cy + 14) + '" r="4.5"' + st('fill:var(--gold-dark)') + '/>' +
      // side readouts
      lcd(42, 'ISSUES REPORTED', '0') +
      lcd(114, 'TARGET', '100%', '<path d="M452 150l7 7 13-14" fill="none" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"' + st('stroke:var(--gold)') + '/>') +
      // the stamp
      '<g mask="url(#ui-dm)"><g transform="rotate(-8 404 232)" opacity=".85"' + st('fill:none;stroke:var(--pole-red)') + '>' +
      '<rect x="310" y="204" width="188" height="56" rx="7" stroke-width="4.5"/><rect x="317" y="211" width="174" height="42" rx="4" stroke-width="1.8"/>' +
      '<text x="404" y="241" text-anchor="middle"' + st(FUI + 'font-weight:900;font-size:21px;letter-spacing:.05em;fill:var(--pole-red);stroke:none') + '>USE CASE: TBC</text></g></g>' +
      '</svg>';
  })();

  // ---- The robot: faces left, treads on y = 118. The arm's tip is about 8% in from the left edge (engine: sendDroid)
  // carry: 'key' the repair droid's keycaps, 'pad' a notepad, 'tool' a workbench screwdriver
  art.droidSVG = function (carry) {
    function F(c, o) { return st('fill:' + c) + (o ? ' opacity="' + o + '"' : ''); }
    var LIP = 'color-mix(in srgb,var(--pole-red-dark) 75%,var(--night-900))';
    function cap(cls, top, bot, lip, face) {
      return '<g class="' + cls + '"><rect x="-1" y="53" width="34" height="23" rx="6"' + F(lip) + '/><rect x="-1" y="49" width="34" height="23" rx="6" fill="url(#' + top + ')"/>' +
        '<rect x="2" y="51" width="28" height="3" rx="1.5"' + F(face, '.5') + '/>' + bot + '</g>';
    }
    var wheels = [46, 67, 88, 109].map(function (x) {
      return '<circle cx="' + x + '" cy="104" r="9"' + F('var(--board-dark)') + '/><circle cx="' + x + '" cy="104" r="5.5" fill="url(#ui-drm)"/><circle cx="' + x + '" cy="104" r="1.8"' + F('var(--night-900)') + '/>';
    }).join('');
    return '<svg viewBox="0 0 136 122" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><defs>' +
      '<linearGradient id="ui-drb" x1="0" y1="0" x2=".7" y2="1">' + sp('0', 'var(--snow)') + sp('.42', 'color-mix(in srgb,var(--board) 45%,var(--snow))') + sp('1', 'var(--board-dark)') + '</linearGradient>' +
      '<linearGradient id="ui-drm" x1="0" y1="0" x2=".6" y2="1">' + sp('0', 'var(--snow-shade)') + sp('1', 'var(--board-dark)') + '</linearGradient>' +
      '<linearGradient id="ui-drv" x1="0" y1="0" x2="1" y2="1">' + sp('0', 'var(--night-600)') + sp('1', 'var(--night-900)') + '</linearGradient>' +
      '<linearGradient id="ui-drc" x1="0" y1="0" x2=".3" y2="1">' + sp('0', 'color-mix(in srgb,var(--pole-red) 78%,var(--lamp))') + sp('1', 'var(--pole-red)') + '</linearGradient>' +
      '<linearGradient id="ui-drk" x1="0" y1="0" x2=".3" y2="1">' + sp('0', 'var(--board-dark)') + sp('1', 'var(--night-900)') + '</linearGradient>' +
      '<radialGradient id="ui-dre">' + sp('0', 'var(--snow)') + sp('.35', 'var(--lamp)') + sp('1', 'var(--lamp-deep)', '0') + '</radialGradient></defs>' +
      '<ellipse cx="78" cy="117" rx="52" ry="4.5"' + F('var(--night-900)', '.45') + '/>' +
      '<g class="dr-bob">' +
      // antenna, behind the dome
      '<path d="M84 22C86 14 90 10 96 8" fill="none" stroke-width="3" stroke-linecap="round"' + st('stroke:var(--board-dark)') + '/>' +
      '<circle class="dr-led" cx="97" cy="7.5" r="4.5"' + F('var(--pole-red)') + '/><circle cx="95.6" cy="6" r="1.4"' + F('var(--snow)', '.8') + '/>' +
      // dome body
      '<path d="M40 92V58C40 34 56 20 78 20S116 34 116 58V92Z" fill="url(#ui-drb)"/>' +
      '<path d="M46 86V58C46 40 58 27 74 25C60 32 53 44 53 60V86Z"' + F('var(--snow)', '.55') + '/>' +
      '<rect x="38" y="84" width="80" height="10" rx="4"' + F('var(--board-dark)') + '/><rect x="42" y="85.5" width="72" height="2"  rx="1"' + F('var(--snow-shade)', '.5') + '/>' +
      // visor with its glowing eye
      '<rect x="42" y="38" width="62" height="24" rx="12"' + F('var(--board-dark)') + '/><rect x="45" y="41" width="56" height="18" rx="9" fill="url(#ui-drv)"/>' +
      '<rect x="50" y="43" width="30" height="2.4" rx="1.2"' + F('var(--snow)', '.2') + '/>' +
      '<circle cx="62" cy="50" r="12" fill="url(#ui-dre)" opacity=".75"/><circle class="dr-eye" cx="62" cy="50" r="4.4"' + F('var(--lamp)') + '/><circle cx="61" cy="49" r="1.5"' + F('var(--snow)') + '/>' +
      // the company plate
      '<rect x="84" y="67" width="24" height="12" rx="3"' + F('var(--gold-dark)') + '/><rect x="85" y="68" width="22" height="9.5" rx="2.5"' + F('var(--gold)') + '/>' +
      '<text x="96" y="76" text-anchor="middle"' + st(FUI + 'font-weight:900;font-size:8px;letter-spacing:.06em;fill:var(--ink)') + '>NP</text>' +
      '</g>' +
      // treads
      '<rect x="32" y="90" width="92" height="28" rx="14"' + F('var(--night-900)') + '/>' +
      '<rect class="dr-tread" x="34" y="92" width="88" height="24" rx="12" fill="none" stroke-width="3.5" stroke-dasharray="4 5"' + st('stroke:var(--board)') + '/>' + wheels +
      // the arm, with the new keycap going out and the burnt one coming back
      '<g class="dr-arm">' +
      '<path d="' + (carry === 'build' ? 'M66 72C58 74 54 72 46 68' : 'M66 72C54 76 46 72 32 66') + '" fill="none" stroke-width="7" stroke-linecap="round"' + st('stroke:var(--board-dark)') + '/>' +
      '<path d="' + (carry === 'build' ? 'M66 71C58 73 54 71 46 67' : 'M66 71C54 75 46 71 32 65') + '" fill="none" stroke-width="2.4" stroke-linecap="round"' + st('stroke:var(--snow-shade)') + '/>' +
      '<circle cx="67" cy="72" r="6.5" fill="url(#ui-drm)"/><circle cx="67" cy="72" r="2"' + F('var(--night-900)') + '/>' +
      (carry === 'pad' ? '<g transform="rotate(-6 16 62)"><rect x="-4" y="42" width="38" height="46" rx="3"' + F('var(--paper-shade)') + '/><rect x="-4" y="40" width="38" height="46" rx="3"' + F('var(--paper)') + '/><rect x="8" y="37" width="14" height="6" rx="2"' + F('var(--gold-dark)') + '/>' +
          '<path d="M2 52h24M2 60h26M2 68h20M2 76h12" fill="none" stroke-width="1.8" stroke-linecap="round"' + st('stroke:var(--ink-soft)') + '/></g>' :
        // a hammer, for the bench: the head lands on the toy just below it
        carry === 'build' ? '<g transform="rotate(-62 46 68)"><rect x="43.5" y="42" width="5" height="28" rx="2.5"' + F('var(--wood)') + '/><rect x="36" y="32" width="20" height="12" rx="3"' + F('var(--board)') + '/><rect x="36" y="32" width="20" height="3.5" rx="1.75"' + F('var(--snow-shade)', '.6') + '/></g>' :
        carry === 'tool' ? '<rect x="4" y="62" width="30" height="7" rx="3.5"' + F('var(--pole-red)') + '/><rect x="-14" y="64" width="20" height="3" rx="1.5"' + F('var(--snow-shade)') + '/>' :
        cap('dr-new', 'ui-drc', '<path d="M11 61h10M17 57l4 4-4 4"  fill="none" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"' + st('stroke:var(--paper)') + '/>', LIP, 'var(--lamp)') +
        cap('dr-old', 'ui-drk', '<path d="M8 66l6-9 3 6 7-8" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"' + st('stroke:var(--lamp-deep)') + '/>', 'var(--night-900)', 'var(--board)')) +
      '<path d="M32 56h6v18h-6" fill="none" stroke-width="4" stroke-linejoin="round"' + st('stroke:var(--board-dark)') + '/>' +
      '</g></svg>';
  };
  art.droid = art.droidSVG('key');

  // ---- Small UI icons (24 grid, currentColor). Strokes are allowed below 40px.
  var SW = ' fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width=';
  var SPK = '<path d="M3 9.2h3.6L11.3 5v14l-4.7-4.2H3a1 1 0 0 1-1-1v-3.6a1 1 0 0 1 1-1z"/>';
  var ICONS = {
    pause: '<rect x="5.5" y="4" width="4.8" height="16" rx="1.6"/><rect x="13.7" y="4" width="4.8" height="16" rx="1.6"/>',
    'sound-on': SPK + '<path d="M14.6 9.2a4 4 0 0 1 0 5.6M17.3 6.4a8 8 0 0 1 0 11.2"' + SW + '"2.2"/>',
    'sound-off': SPK + '<path d="M15 9.5l5 5M20 9.5l-5 5"' + SW + '"2.4"/>',
    sleigh: '<path d="M3.2 5.5h3.6c1 0 1.7.6 1.9 1.6l.7 3.4h9.3c1 0 1.6.9 1.3 1.8l-.7 2.4c-.4 1.3-1.5 2.1-2.8 2.1H7.4c-1.4 0-2.5-1-2.8-2.4L3.1 6.6c-.1-.6 0-1.1.1-1.1z"/><path d="M2.5 19.6h15.8c1.6 0 2.7-.8 3.2-2.4M8 16.8v2.8M15.5 16.8v2.8"' + SW + '"1.8"/>',
    tick: '<path d="M5 12.6l4.4 4.4L19 7.4"' + SW + '"3.4"/>',
    cross: '<path d="M6.8 6.8l10.4 10.4M17.2 6.8L6.8 17.2"' + SW + '"3.4"/>',
    'arrow-left': '<path d="M10.5 5L3.6 12l6.9 7M4.6 12h15.8"' + SW + '"3.2"/>',
    'arrow-right': '<path d="M13.5 5l6.9 7-6.9 7M19.4 12H3.6"' + SW + '"3.2"/>',
    sack: '<path d="M8.6 2.8c1.2.7 2.2.9 3.4.9s2.2-.2 3.4-.9l-1.2 3.7H9.8z"/><path d="M10 7.6h4c3.6 1.7 6.4 5.3 6.4 9.1 0 2.9-2.5 4.5-8.4 4.5s-8.4-1.6-8.4-4.5c0-3.8 2.8-7.4 6.4-9.1z"/>'
  };
  art.icon = function (name) {
    var b = ICONS[name];
    if (!b) return '';
    return '<svg class="ico ico-' + name + '" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">' + b + '</svg>';
  };
  art.symbols = Object.keys(ICONS);

  // ---- Title backdrop: the workshop at night, under an aurora. Full-bleed behind the title screen (ids ui-ts-*).
  // The middle is kept calm for the logo and buttons; the workshop and the pines sit out at the sides.
  art.titleScene = function () {
    var FX = NP.fx, W = 1600, H = 1000, s = '', seed = 77, i;
    if (FX) FX.ensure();
    function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
    function f(n) { return Math.round(n * 10) / 10; }
    function mix(a, b, p) { return 'color-mix(in srgb,var(--' + a + ') ' + p + '%,var(--' + b + '))'; }
    function P(d, fill, x) { return '<path d="' + d + '" fill="' + fill + '"' + (x || '') + '/>'; }
    function pool(cx, cy, rx, ry, op, kind) { return FX ? FX.pool(cx, cy, rx, ry, op, kind) : ''; }
    function pine(x, y, h, dim) {
      var w = h * 0.4, p = '<ellipse cx="' + f(x + w * 0.5) + '" cy="' + y + '" rx="' + f(w * 1.1) + '" ry="' + f(h * 0.045) + '" fill="url(#ui-ts-ao)"/>' +
        '<rect x="' + f(x - h * 0.025) + '" y="' + f(y - h * 0.1) + '" width="' + f(h * 0.05) + '" height="' + f(h * 0.1) + '" fill="var(--wood-dark)"/>';
      for (var k = 0; k < 3; k++) {
        var ty = y - h * 0.06 - k * h * 0.27, tw = w * (1 - k * 0.24), top = ty - h * 0.42;
        p += P('M' + f(x - tw) + ' ' + f(ty) + 'L' + f(x) + ' ' + f(top) + 'L' + f(x + tw) + ' ' + f(ty) + 'Z', 'url(#ui-ts-pine)') +
          P('M' + f(x) + ' ' + f(top) + 'L' + f(x + tw) + ' ' + f(ty) + 'H' + f(x + tw * 0.2) + 'Z', 'var(--night-900)', ' opacity=".28"') +
          P('M' + f(x - tw * 0.62) + ' ' + f(ty - h * 0.15) + 'L' + f(x) + ' ' + f(top) + 'L' + f(x + tw * 0.3) + ' ' + f(ty - h * 0.2) + 'L' + f(x - tw * 0.05) + ' ' + f(ty - h * 0.13) + 'L' + f(x - tw * 0.3) + ' ' + f(ty - h * 0.19) + 'Z', 'var(--snow)', ' opacity=".8"');
      }
      return '<g' + (dim ? ' opacity="' + dim + '"' : '') + '>' + p + '</g>';
    }
    var defs = '<defs>' +
      '<linearGradient id="ui-ts-sky" x1="0" y1="0" x2="0" y2="1">' + sp('0', 'var(--night-900)') + sp('.5', mix('night-600', 'night-900', 62)) + sp('.8', 'var(--night-600)') + sp('1', mix('night-600', 'snow-shade', 72)) + '</linearGradient>' +
      '<linearGradient id="ui-ts-aur" x1="0" y1="0" x2="0" y2="1">' + sp('0', '#8DF0C2', '0') + sp('.45', '#8DF0C2', '.5') + sp('.8', 'var(--pole-green)', '.2') + sp('1', 'var(--pole-green)', '0') + '</linearGradient>' +
      '<linearGradient id="ui-ts-snow" x1="0" y1="0" x2="0" y2="1">' + sp('0', mix('snow-shade', 'snow', 70)) + sp('1', mix('night-600', 'snow-shade', 62)) + '</linearGradient>' +
      '<linearGradient id="ui-ts-far" x1="0" y1="0" x2="0" y2="1">' + sp('0', mix('night-600', 'snow-shade', 70)) + sp('1', mix('night-600', 'night-900', 80)) + '</linearGradient>' +
      '<linearGradient id="ui-ts-pine" x1=".1" y1="0" x2=".9" y2="1">' + sp('0', mix('pole-green', 'night-600', 62)) + sp('1', mix('pole-green-dark', 'night-900', 55)) + '</linearGradient>' +
      '<linearGradient id="ui-ts-wall" x1=".1" y1="0" x2=".9" y2="1">' + sp('0', mix('wood', 'night-600', 48)) + sp('1', mix('wood-dark', 'night-900', 44)) + '</linearGradient>' +
      '<linearGradient id="ui-ts-win" x1="0" y1="0" x2="0" y2="1">' + sp('0', 'var(--paper)') + sp('.4', 'var(--lamp)') + sp('1', 'var(--lamp-deep)') + '</linearGradient>' +
      '<radialGradient id="ui-ts-ao">' + sp('0', 'var(--night-900)', '.5') + sp('1', 'var(--night-900)', '0') + '</radialGradient>' +
      '<radialGradient id="ui-ts-vig" cx=".5" cy=".42" r=".75">' + sp('.5', 'var(--night-900)', '0') + sp('1', 'var(--night-900)', '.6') + '</radialGradient></defs>';
    s += '<rect width="' + W + '" height="' + H + '" fill="url(#ui-ts-sky)"/>';
    // stars, thinning towards the horizon
    for (i = 0; i < 110; i++) { var sy = rnd() * rnd() * 620; s += '<circle cx="' + f(rnd() * W) + '" cy="' + f(sy) + '" r="' + f(0.7 + rnd() * 1.7) + '" fill="var(--snow)" opacity="' + f(0.25 + rnd() * 0.6) + '"/>'; }
    // aurora: two soft curtains, breathing slowly
    s += '<g class="fx-add"><path class="fx-breathe" d="M-40 250C240 120 520 300 800 190C1080 90 1360 250 1640 150V330C1360 420 1080 280 800 370C520 470 240 300 -40 430Z" fill="url(#ui-ts-aur)" opacity=".42"/>' +
      '<path class="fx-breathe" style="animation-delay:-2.3s" d="M-40 120C300 40 560 170 860 90C1160 20 1400 120 1640 60V190C1400 250 1160 150 860 220C560 300 300 180 -40 250Z" fill="url(#ui-ts-aur)" opacity=".26"/></g>';
    // moon with its halo
    s += pool(1300, 170, 230, 230, 0.5, 'cool') + '<circle cx="1300" cy="170" r="44" fill="var(--snow)"/><circle cx="1284" cy="158" r="9" fill="var(--snow-shade)" opacity=".35"/><circle cx="1314" cy="188" r="6" fill="var(--snow-shade)" opacity=".3"/><circle cx="1310" cy="152" r="4" fill="var(--snow-shade)" opacity=".25"/>';
    // far range with snow caps, then haze
    s += P('M-20 700L130 560L250 640L420 500L560 620L700 540L860 650L1010 520L1150 610L1290 500L1440 620L1620 540V760H-20Z', 'url(#ui-ts-far)') +
      P('M420 500L470 545L440 552L405 590L380 566L350 590L390 526Z', 'var(--snow)', ' opacity=".5"') + P('M1010 520L1060 566L1030 570L1000 604L972 578L945 598L980 548Z', 'var(--snow)', ' opacity=".5"') +
      P('M1290 500L1344 548L1312 556L1286 592L1256 562L1230 586L1262 530Z', 'var(--snow)', ' opacity=".5"') + P('M130 560L172 600L146 606L120 634L98 612L80 628L104 586Z', 'var(--snow)', ' opacity=".45"') +
      '<rect y="560" width="' + W + '" height="220" fill="' + mix('night-600', 'snow-shade', 80) + '" opacity=".3"/>';
    // back hill, with a far stand of pines
    s += P('M-20 760C240 690 520 720 800 742C1080 764 1340 700 1620 736V1000H-20Z', mix('snow-shade', 'night-600', 62));
    [[560, 742, 70], [610, 746, 92], [660, 748, 64], [960, 752, 80], [1010, 750, 58], [760, 745, 52]].forEach(function (p) { s += pine(p[0], p[1], p[2], 0.55); });
    // the workshop, lit from inside, on the left
    var bx = 14, by = 836;
    s += pool(bx + 150, by + 20, 330, 90, 0.5) + '<ellipse cx="' + (bx + 160) + '" cy="' + (by + 4) + '" rx="210" ry="16" fill="url(#ui-ts-ao)"/>';
    s += '<rect x="' + (bx + 214) + '" y="' + (by - 250) + '" width="34" height="80" fill="' + mix('wood-dark', 'night-900', 60) + '"/><rect x="' + (bx + 208) + '" y="' + (by - 258) + '" width="46" height="12" rx="4" fill="var(--snow)"/>';
    [[236, -292, 20, 0.34], [252, -334, 28, 0.24], [276, -384, 38, 0.15]].forEach(function (p) { s += '<circle cx="' + (bx + p[0]) + '" cy="' + (by + p[1]) + '" r="' + p[2] + '" fill="var(--snow-shade)" opacity="' + p[3] + '"/>'; });
    s += '<rect x="' + bx + '" y="' + (by - 150) + '" width="300" height="150" fill="url(#ui-ts-wall)"/>' + (FX ? FX.tex('wood', bx, by - 150, 300, 150, 0.5) : '') +
      '<rect x="' + (bx + 210) + '" y="' + (by - 150) + '" width="90" height="150" fill="var(--night-900)" opacity=".28"/>';
    s += P('M' + (bx - 30) + ' ' + (by - 140) + 'L' + (bx + 150) + ' ' + (by - 256) + 'L' + (bx + 330) + ' ' + (by - 140) + 'L' + (bx + 318) + ' ' + (by - 124) + 'L' + (bx + 150) + ' ' + (by - 232) + 'L' + (bx - 18) + ' ' + (by - 124) + 'Z', 'var(--snow)') +
      P('M' + (bx + 150) + ' ' + (by - 256) + 'L' + (bx + 330) + ' ' + (by - 140) + 'L' + (bx + 318) + ' ' + (by - 124) + 'L' + (bx + 150) + ' ' + (by - 232) + 'Z', 'var(--snow-shade)', ' opacity=".7"') +
      P('M' + (bx - 2) + ' ' + (by - 134) + 'L' + (bx + 150) + ' ' + (by - 232) + 'L' + (bx + 302) + ' ' + (by - 134) + 'Z', 'url(#ui-ts-wall)') +
      '<circle cx="' + (bx + 150) + '" cy="' + (by - 176) + '" r="17" fill="url(#ui-ts-win)"/><rect x="' + (bx + 148.5) + '" y="' + (by - 193) + '" width="3" height="34" fill="var(--wood-dark)"/><rect x="' + (bx + 133) + '" y="' + (by - 177.5) + '" width="34" height="3" fill="var(--wood-dark)"/>';
    [[34, 0], [108, 0], [232, 0]].forEach(function (w) {
      var wx = bx + w[0], wy = by - 112;
      s += '<rect x="' + (wx - 5) + '" y="' + (wy - 5) + '" width="54" height="64" rx="3" fill="var(--wood-dark)"/><rect x="' + wx + '" y="' + wy + '" width="44" height="54" fill="url(#ui-ts-win)"/>' +
        '<rect x="' + (wx + 20.5) + '" y="' + wy + '" width="3" height="54" fill="var(--wood-dark)"/><rect x="' + wx + '" y="' + (wy + 24) + '" width="44" height="3" fill="var(--wood-dark)"/>' +
        '<rect x="' + (wx - 8) + '" y="' + (wy + 56) + '" width="60" height="7" rx="3.5" fill="var(--snow)"/>' + pool(wx + 22, wy + 27, 70, 76, 0.55);
    });
    s += '<rect x="' + (bx + 168) + '" y="' + (by - 96) + '" width="48" height="96" rx="4" fill="var(--wood-dark)"/><rect x="' + (bx + 173) + '" y="' + (by - 91) + '" width="38" height="91" fill="' + mix('pole-red', 'night-900', 62) + '"/>' +
      '<circle cx="' + (bx + 204) + '" cy="' + (by - 44) + '" r="3" fill="var(--gold)"/><circle cx="' + (bx + 192) + '" cy="' + (by - 72) + '" r="11" fill="none" stroke="' + mix('pole-green', 'lamp', 70) + '" stroke-width="5"/>';
    // front snow, drifts and near pines
    s += P('M-20 850C200 800 430 836 640 860C900 890 1180 820 1620 846V1000H-20Z', 'url(#ui-ts-snow)') +
      P('M-20 850C200 800 430 836 640 860C520 862 300 838 -20 880Z', 'var(--snow)', ' opacity=".55"') + P('M1620 846C1400 826 1180 842 1000 870C1200 852 1420 848 1620 872Z', 'var(--snow)', ' opacity=".4"');
    s += pool(bx + 190, by + 40, 280, 60, 0.42);
    s += pine(1250, 872, 210) + pine(1392, 900, 330) + pine(1520, 880, 250) + pine(1150, 884, 130, 0.9) + pine(430, 884, 150, 0.9) + pine(1090, 868, 90, 0.8);
    s += P('M-20 940C260 900 520 950 800 934C1080 918 1340 960 1620 926V1000H-20Z', mix('snow', 'snow-shade', 60)) + '<rect y="900" width="' + W + '" height="100" fill="' + mix('night-600', 'night-900', 60) + '" opacity=".25"/>';
    s += '<rect width="' + W + '" height="' + H + '" fill="url(#ui-ts-vig)"/>';
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' + defs + s + '</svg>';
  };
})(window.NP);
