window.NP = window.NP || {};

// Between-round interlude: three beats of about 3s (SPEC §4b). The engine owns input; this only exposes controls.
(function (NP) {
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function ico(n) { return NP.art && NP.art.icon ? NP.art.icon(n) : ''; }
  function st(s) { return ' style="' + s + '"'; }
  function F(c) { return st('fill:var(--' + c + ')'); }
  function K(c) { return st('stroke:var(--' + c + ')'); }
  // c: a palette token, a color-mix() or a url(#…)
  function fl(c) { return c.charAt(0) === 'u' ? ' fill="' + c + '"' : c.indexOf('(') > 0 ? st('fill:' + c) : F(c); }
  function Rc(x, y, w, h, r, c, o, ex) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '"' + (r ? ' rx="' + r + '"' : '') + fl(c) + (o ? ' opacity="' + o + '"' : '') + (ex || '') + '/>'; }
  function Ci(x, y, r, c, ex) { return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '"' + fl(c) + (ex || '') + '/>'; }
  function El(x, y, rx, ry, c, ex) { return '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '"' + fl(c) + (ex || '') + '/>'; }
  function Pa(d, c, o) { return '<path d="' + d + '"' + fl(c) + (o ? ' opacity="' + o + '"' : '') + '/>'; }
  function Ln(d, c, w) { return '<path d="' + d + '" fill="none" stroke-width="' + w + '" stroke-linecap="round"' + K(c) + '/>'; }
  function mx(a, b, p) { return 'color-mix(in srgb,var(--' + a + ') ' + p + '%,var(--' + b + '))'; }
  function lg(id, x2, a, b) { return '<linearGradient id="ui-' + id + '" x1="0" y1="0" x2="' + x2 + '" y2="1">' + sp('0', a) + sp('1', b) + '</linearGradient>'; }
  function tx(x, y, s, t, c, ex) { return '<text x="' + x + '" y="' + y + '" text-anchor="middle" font-size="' + s + '" font-weight="800"' + st('fill:var(--' + c + ');font-family:var(--font-ui)') + (ex || '') + '>' + t + '</text>'; }
  function sp(o, c, a) { return '<stop offset="' + o + '"' + st('stop-color:' + c) + (a ? ' stop-opacity="' + a + '"' : '') + '/>'; }

  // Beat 1: the board memo
  function memo(m) {
    return '<section class="il-beat il-b1" aria-hidden="true"><div class="il-memo">' +
      '<div class="il-lh"><span class="il-seal" aria-hidden="true">NP</span><span>NORTH POLE LTD · BOARD OFFICE</span></div>' +
      '<div class="il-meta"><span><b>To</b> ' + esc(m.to || 'All workshop staff') + '</span><span><b>From</b> The Board</span></div>' +
      '<h2 class="il-mt">' + esc(m.title) + '</h2><p class="il-mb">' + esc(m.body) + '</p>' +
      '<div class="il-sig">pp. The Board</div>' +
      '<div class="il-stamp"><span>' + esc(m.footer) + '</span></div></div></section>';
  }

  // Beat 2: Father Christmas's screen and the issues board
  function screen(d) {
    var p = d.patch || {}, v = esc(p.version || 'v1.1'), fixed = p.fixed || [], iss = d.issues || [];
    var nq = 0, nr = 0, k = 0;
    var lines = [['il-dim', 'fc@workshop:~$ ship letterbot ' + v], ['il-hd', 'Patch ' + v + ' released'], ['', 'Fixed:']];
    fixed.forEach(function (f) { lines.push(['il-in', '- ' + esc(f)]); });
    lines.push(['il-kn', 'Known issues: ' + esc(p.known || 'none') + '.']);
    // every line is on screen within about 0.6s, so a quick Space still shows the whole patch note
    var scr = lines.map(function (l) {
      return '<div class="il-ln ' + l[0] + '"' + st('--d:' + (0.1 + 0.08 * k++).toFixed(2) + 's') + '>' + l[1] + '</div>';
    }).join('');
    var n = iss.length, size = n <= 2 ? ' il-few' : n <= 4 ? ' il-mid' : n <= 9 ? '' : ' il-many';
    var tix = iss.map(function (it, i) {
      var ret = it.kind === 'return';
      if (ret) nr++; else nq++;
      // full text, and the Status punchline always gets its own line
      var raw = String(it.text || ''), at = raw.search(/\s*Status:/i), body = at < 0 ? raw : raw.slice(0, at);
      var stat = at < 0 ? 'Status: ' + (ret ? 'Shipped. Closed.' : "Won't fix.") : raw.slice(at).trim();
      var rot = (((i * 37) % 9 - 4) * 0.6 + (i > 8 ? (i % 2 ? 4 : -5) : 0)) * (n > 2 ? 1 : 0.4);
      return '<div class="il-tk ' + (ret ? 'il-ret' : 'il-qa') + '"' + st('--r:' + rot.toFixed(1) + 'deg;--d:' + (0.2 + Math.min(i, 10) * 0.05).toFixed(2) + 's') + '>' +
        '<div class="il-tkh">' + (ret ? ico('sack') + 'CUSTOMER RETURN' : 'CAUGHT IN QA') + '</div>' +
        '<p><b>' + esc(it.id || 'BUG') + ':</b> ' + esc(body) + '<i class="il-st">' + esc(stat) + '</i></p></div>';
    }).join('');
    return '<section class="il-beat il-b2 ' + (d._part || '') + '" aria-hidden="true"><div class="il-desk">' +
      '<div class="il-mon"><div class="il-scr">' + scr + '<span class="il-cur"></span></div><div class="il-neck"></div></div>' +
      '<div class="il-board' + size + '"><div class="il-bh"><span class="il-bt">Issues</span>' +
      '<span class="il-cnt il-cq"><i>Caught in </i>QA <b>' + nq + '</b></span>' +
      '<span class="il-cnt il-cr">' + ico('sack') + '<i>Customer </i>return <b>' + nr + '</b></span></div>' +
      '<div class="il-tix">' + (tix || '<p class="il-none">No tickets. Suspiciously quiet.</p>') + '</div></div>' +
      '</div></section>';
  }

  // Beat 3: the workshop floor (SVG). Elves: 2 heads tall, round heads, pointed green hood, dot eyes (SPEC §9.4)
  // Wide: one row of benches. Narrow (portrait): rows of up to 3 receding in depth, big elves filling the frame
  // bench s: 0 dark, 1 staffed, 2 leaving (lit until its elf has walked out, at od)
  // bot b: 0 none, 1 at the bench, 2 rolls in at od. fix: a contractor is working on it. card: they kept their leaving card
  function lampG(ly, k, on) {
    return '<g transform="translate(0 ' + ly + ') scale(' + Math.min(k, 1.15).toFixed(2) + ' 1)">' + Pa('M-16 62L-8 44H8L16 62Z', on ? 'pole-green' : 'board-dark') +
      Pa('M-16 62L-8 44H-2L-6 62Z', 'snow', '.18') + El(0, 62, 10, 3.2, on ? 'lamp' : 'basement') + '</g>';
  }
  function robot(ex, carry) {
    var a = NP.art && NP.art.droidSVG ? NP.art.droidSVG(carry || 'tool') : '';
    return a.replace('<svg ', '<svg x="-58" y="146" width="108" height="97" ' + (ex || ''));
  }
  // the toy on the bench, the same one an elf builds
  function toy(x, hue) { return Rc(x, 194, 16, 16, 3, 'hue-' + hue) + Ln('M' + (x + 8) + ' 194V210M' + x + ' 201H' + (x + 16), 'gold', 2.6); }
  // a robot at work: same toy and same hammering as the elf it replaced
  function builder(hue, d) { return '<g class="il-bot"' + st('--d:-' + d + 's') + '><g transform="translate(14 -10)">' + robot('', 'build') + '</g>' + toy(-24, hue) + '</g>'; }
  function bench(cx, w, k, ly, s, hue, d, lamp, od, b, fix, card) {
    var dark = s === 2 && !b;                   // only a bench nobody takes over goes dark
    var out = dark ? '<g class="il-out"' + st('--od:' + od.toFixed(2) + 's') + '>' : '';
    if (b && s !== 1) s = 1.5;                  // lit, but no elf stays here
    var glow = El(0, (ly + 362) / 2, (w * 0.62).toFixed(1), (238 - ly) / 2 + 20, 'url(#ui-fg)', st('mix-blend-mode:screen'));
    var top = function (o) { return Rc(-44, 210, 88, 3.5, 1.75, 'lamp', o); };
    var lit = s === 1 || s === 1.5, man = s === 1 ? elf(false, d, hue) : '';
    // a contractor stands behind the robot, so its toy and hammer stay in view, and reaches over it with the spanner
    var at = '<g transform="translate(-30 -12)">', reach = '';
    if (fix) { man = at + elf(true, d, hue, card, 'body') + '</g>'; reach = at + elf(true, d, hue, card, 'arm') + '</g>'; }
    var bot = !b ? '' : fix ? '<g transform="translate(14 0)">' + builder(hue, d) + '</g>' : b === 2 ? '<g class="il-botin"' + st('--od:' + od.toFixed(2) + 's') + '>' + builder(hue, d) + '</g>' : builder(hue, d);
    return '<g transform="translate(' + cx.toFixed(1) + ' 0)">' + (lit ? glow : dark ? out + glow + '</g>' : '') +
      (lamp ? '<path d="M0 ' + (ly - 400) + 'V' + (ly + 44) + '" stroke-width="2"' + K('night-900') + ' opacity=".6"/>' + lampG(ly, k, lit) + (dark ? out + lampG(ly, k, true) + '</g>' : '') : '') +
      // contact shadow + bench
      El(0, 300, (46 * k).toFixed(1), 7, 'night-900', ' opacity=".4" filter="url(#ui-fb)"') +
      '<g transform="scale(' + k.toFixed(2) + ')" transform-origin="0 300">' + man + bot + reach +
      Rc(-38, 226, 7, 72, 2, 'wood-dark') + Rc(31, 226, 7, 72, 2, 'wood-dark') + Rc(-44, 210, 88, 20, 4, 'url(#ui-fw)') +
      top(lit ? '.7' : '.15') + (dark ? out + top('.55') + '</g>' : '') + Rc(-40, 230, 80, 8, 2, 'wood-dark') + '</g></g>';
  }
  function mv(a, b, c) { return st('--wd:' + a.toFixed(2) + 's;--du:' + b.toFixed(2) + 's;--dx:' + c.toFixed(0) + 'px'); }
  function ci(v, a, b) { return Math.max(a, Math.min(b, Math.round(+v || 0))); }
  function floor(f, narrow, red) {
    var n = ci(f.benches || 8, 1, 12), here = ci(f.present == null ? n : f.present, 0, n), leave = ci(f.leaving, 0, n - here);
    var rd = f.reindeer, lane = leave > 0 || rd === 'present' || rd === 'leaving';
    var nb = ci(f.bots, 0, n), con = ci(f.contractors, 0, nb), hues = ['red', 'blue', 'yellow', 'green', 'purple', 'pink', 'brown'];
    var W = narrow ? 400 : 800, per = narrow ? Math.min(3, n) : n, R = Math.ceil(n / per);
    var w = (W - 40) / per, k = Math.min(narrow ? 1.4 : 1.15, w / 92), ly = narrow ? Math.floor(222 - 214 * k) : 0;
    var TOP = f.drones ? (narrow ? 88 : 92) : 0, LANE = lane ? (narrow ? 150 : 112) : 0;
    // rows from the back (r = 0) to the front; back rows are smaller and higher (depth)
    var rows = [], y = 0, r, i = 0, out = '', walk = [];
    for (r = R - 1; r >= 0; r--) {
      var s = R > 1 ? 0.72 + 0.28 * r / (R - 1) : 1;
      if (r < R - 1) y -= k * (214 * rows[r + 1].s - 90 * s) * 0.92;
      rows[r] = { s: s, y: y, m: Math.floor(n / R) + (r < n % R ? 1 : 0) };
    }
    var top = rows[0].y - (300 - ly + 34) * rows[0].s, shift = narrow ? 24 + TOP - top : 300 + TOP;
    var H = narrow ? Math.round(shift + 40 + LANE) : 330 + TOP + LANE, floorY = narrow ? Math.round(rows[0].y + shift - 70 * k * rows[0].s) : 250 + TOP;
    var laneY = H - (narrow ? 24 : 20), kw = narrow ? k * 0.95 : k * 0.9, spd = (narrow ? 250 : 430) * (f.pace || 1);
    for (r = 0; r < R; r++) {
      var o = rows[r], Y = o.y + shift, stag = narrow && o.m === per ? (r % 2 ? 0.16 : -0.16) * w : 0, ox = W / 2 * (1 - o.s);
      out += '<g transform="translate(' + ox.toFixed(1) + ' ' + (Y - 300 * o.s).toFixed(1) + ') scale(' + o.s.toFixed(3) + ')">';
      for (var j = 0; j < o.m; j++, i++) {
        var bx = W / 2 + (j - (o.m - 1) / 2) * w + stag, sb = i < here ? 1 : i < here + leave ? 2 : 0, od = 0;
        var hasBot = i >= n - nb, botB = hasBot ? (sb === 2 && !red ? 2 : 1) : 0, fixed = i >= n - con;
        if (sb === 2) {
          // this bench's elf walks out along the front lane with a box
          var q = walk.length, wx = narrow ? (rd ? 160 : 80) + q * 84 : ox + bx * o.s, dx = W * 1.6 + 320 - wx, wd = 0.6 + (leave - 1 - q) * 0.42, du = dx / spd;
          od = wd + du * 0.55;
          walk.push(walker(hues[i % hues.length], 'translate(' + (red ? wx + Math.min(70, dx * 0.3) : wx).toFixed(1) + ' ' + laneY + ') scale(' + kw.toFixed(2) + ')',
            mv(wd, du, (dx / kw))));
          if (red) sb = 0;
        }
        out += bench(bx, w, k, ly, sb, hues[i % hues.length], ((i * 0.37) % 1).toFixed(2), !narrow || r === 0, od, botB, fixed, i === n - con);
      }
      out += '</g>';
    }
    // the reindeer: at the front, or leaving with a suitcase
    if (rd === 'present' || rd === 'leaving') {
      var kr = kw * (narrow ? 0.8 : 0.95), rx0 = narrow ? 62 : 96, rdx = W * 1.6 + 400 - rx0;
      walk.unshift(reindeer(rd === 'leaving', 'translate(' + rx0 + ' ' + laneY + ') scale(' + kr.toFixed(2) + ')',
        mv((0.5 + leave * 0.42), (rdx / (narrow ? 230 : 400)), (rdx / kr))));
    }
    var dr = '';
    if (f.drones) for (i = 0; i < 7; i++) {
      dr += drone(W * (0.1 + 0.8 * i / 6) + (i % 2 ? 14 : -10), 40 + (i % 3) * 15, narrow ? 0.85 : 0.95, (i * 0.29 % 1).toFixed(2), i === 2 || i === 5);
    }
    var wins = narrow ? [110, 290] : [140, 400, 660], wy = narrow ? Math.max(20 + TOP, floorY - 250) : 48 + TOP;
    return '<section class="il-beat il-b3" aria-hidden="true"><svg class="il-floor" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYM' + (narrow ? 'ax' : 'id') + ' meet" xmlns="http://www.w3.org/2000/svg"><defs>' +
      lg('fwall', '0', 'var(--night-900)', 'var(--basement-light)') +
      '<linearGradient id="ui-ffl" x1="0" y1="0" x2="0" y2="1">' + sp('0', 'color-mix(in srgb,var(--wood-dark) 85%,var(--lamp-deep))') + sp('.35', 'var(--wood-dark)') + sp('1', 'var(--basement)') + '</linearGradient>' +
      lg('fw', '.3', 'var(--wood)', 'var(--wood-dark)') +
      lg('fh', '.7', mx('pole-green', 'lamp', 80), 'var(--pole-green-dark)') +
      lg('fk', '.6', 'var(--paper)', mx('paper-shade', 'lamp-deep', 80)) +
      lg('fgd', '.4', mx('gold', 'lamp', 60), 'var(--gold-dark)') +
      lg('fbx', '.7', mx('paper-shade', 'wood', 55), mx('wood', 'wood-dark', 70)) +
      lg('frd', '.5', mx('hue-brown', 'lamp', 75), mx('wood-dark', 'night-900', 80)) +
      lg('fsc', '.5', mx('pole-red', 'lamp', 80), 'var(--pole-red-dark)') +
      lg('fm', '.4', mx('board', 'snow', 70), 'var(--board-dark)') +
      '<radialGradient id="ui-fg">' + sp('0', 'var(--lamp)', '.42') + sp('.55', 'var(--lamp-deep)', '.14') + sp('1', 'var(--lamp-deep)', '0') + '</radialGradient>' +
      '<filter id="ui-fb" x="-20%" y="-100%" width="140%" height="300%"><feGaussianBlur stdDeviation="3"/></filter></defs>' +
      '<g class="il-cam"' + st('transform-origin:' + W / 2 + 'px ' + Math.round(H * 0.6) + 'px') + '><rect x="-900" y="-600" width="2600" height="' + (floorY + 600) + '" fill="url(#ui-fwall)"/>' +
      wins.map(function (x) {
        return '<rect x="' + (x - 46) + '" y="' + wy + '" width="92" height="96" rx="8"' + F('night-600') + ' opacity=".5"/><path d="M' + x + ' ' + wy + 'v96M' + (x - 46) + ' ' + (wy + 48) + 'h92" stroke-width="5"' + K('basement') + ' opacity=".7"/>';
      }).join('') +
      '<rect x="-900" y="' + floorY + '" width="2600" height="1400" fill="url(#ui-ffl)"/>' +
      '<path d="M-900 ' + (floorY + 1) + 'H1700" stroke-width="2"' + K('lamp-deep') + ' opacity=".35"/>' +
      out + walk.join('') + dr + '</g></svg></section>';
  }

  function head(ex, ey, cls) {
    return '<g' + (cls ? ' class="' + cls + '"' : '') + '>' + Pa('M-17 150L-28 140L-16 160Z M17 150L28 140L16 160Z', 'paper-shade') + Ci(0, 152, 21, 'url(#ui-fk)') +
      Ci(ex - 7, 157 + ey, 2.8, 'ink') + Ci(ex + 7, 157 + ey, 2.8, 'ink') +
      Pa('M-23 153C-26 126-10 112 4 110C14 104 24 92 34 86C30 102 27 118 23 153C17 138-17 138-23 153Z', 'url(#ui-fh)') +
      Pa('M-23 150C-25 128-12 115-1 112C-11 120-18 134-19 150Z', 'lamp', '.45') + Ci(34, 86, 5, 'snow') + '</g>';
  }
  function elf(contractor, d, hue, card, part) {
    var hand = card
      // still holding the leaving card the team signed for them
      ? Ln('M-14 192C-24 186-29 178-30 170', 'pole-green-dark', 9) +
        '<g transform="rotate(-9 -34 150)">' + Rc(-50, 132, 32, 27, 2, 'url(#ui-fk)') + Ln('M-34 132V159', 'paper-shade', 1.2) +
        Pa('M-27 140c-2-3-6-1-4 2l4 4 4-4c2-3-2-5-4-2Z', 'pole-red') + tx(-27, 152, 3.6, 'SORRY YOU\'RE', 'ink-soft') + tx(-27, 156.5, 3.6, 'LEAVING!', 'ink-soft') + '</g>' +
        Ci(-30, 168, 5.5, 'paper-shade')
      : Ci(-15, 208, 5.5, 'paper-shade');
    // a contractor's spanner where the hammer was
    var tool = contractor
      ? '<g transform="rotate(34 22 208)">' + Rc(19.5, 176, 7, 36, 3, 'lamp') + Rc(20.5, 176, 5, 36, 2.5, 'url(#ui-fgd)') + Pa('M11 178V163H18V172H28V163H35V178Q35 183 30 183H16Q11 183 11 178Z', 'url(#ui-fgd)') + '</g>'
      : Rc(21, 186, 4, 26, 2, 'wood', 0, ' transform="rotate(-50 22 208)"') + Rc(16, 179, 14, 9, 2.5, 'board', 0, ' transform="rotate(-50 22 208)"');
    var arm = '<g class="il-arm">' + Ln('M12 186C22 192 25 202 22 208', 'pole-green-dark', 9) + tool + Ci(22, 208, 5.5, 'paper-shade') + '</g>';
    if (part === 'arm') return '<g class="il-elf"' + st('--d:-' + d + 's') + '>' + arm + '</g>';
    return '<g class="il-elf"' + st('--d:-' + d + 's') + '>' +
      Pa('M-20 232C-21 196-13 174 0 174S21 196 20 232Z', 'url(#ui-fh)') + Pa('M-20 228C-21 196-13 176-2 174C-10 184-14 204-13 228Z', 'lamp', '.35') +
      (contractor ? Ln('M-12 174L-8 183M4 174L-2 183', 'pole-red-dark', 1.6) + Rc(-27, 180, 42, 15, 3, 'url(#ui-fgd)') + Rc(-25, 180.6, 38, 1.6, 0.8, 'lamp', '.7') +
        tx(-6, 190.6, 7.8, 'CONTRACTOR', 'ink', ' textLength="37" lengthAdjust="spacingAndGlyphs"') : '') +
      (part === 'body' ? '' : arm) + hand +
      (contractor ? '' : toy(-12, hue)) + head(0, 0, 'il-head') + '</g>';
  }
  // a laid-off elf, standing, facing right, carrying a cardboard box of desk things; feet at y = 0
  // a laid-off elf, standing, facing right, carrying a cardboard box of desk things; feet at y = 0
  function walker(hue, tr, sty) {
    var leg = function (x, c) { return '<g class="' + c + '">' + Rc(x, -27, 9, 24, 4, 'pole-green-dark') + Pa('M' + (x - 1) + ' -5h10c5 0 8 2 8 5h-18Z', 'wood-dark') + '</g>'; };
    return '<g transform="' + tr + '"><g class="il-walk"' + sty + '>' + El(3, 0, 28, 5, 'night-900', ' opacity=".45" filter="url(#ui-fb)"') +
      '<g class="il-bob">' + leg(-11, 'il-lg1') + leg(3, 'il-lg2') +
      Pa('M-19 -20C-20 -58-12 -82 0 -82S20 -58 19 -20Z', 'url(#ui-fh)') + Pa('M-19 -24C-20 -58-12 -80-2 -82C-10 -72-14 -50-13 -24Z', 'lamp', '.35') +
      '<g transform="translate(2 -256)">' + head(4, 3) + '</g>' +
      El(-6, -70, 4, 6.5, 'pole-green', ' transform="rotate(-30 -6 -70)"') + El(0, -72, 3.5, 7, 'pole-green-dark', ' transform="rotate(10 0 -72)"') +
      Rc(15, -75, 10, 11, 2, 'hue-' + hue) + Ln('M24 -72h3v4h-3', 'hue-' + hue, 1.8) +
      Pa('M-17 -66L-26 -75L-6 -74L-2 -66Z', 'paper-shade') + Pa('M33 -66L41 -74L22 -74L19 -66Z', mx('wood', 'paper-shade', 70)) +
      Rc(-17, -67, 50, 34, 3, 'url(#ui-fbx)') + Rc(-17, -67, 50, 4, 2, 'wood-dark', '.55') + Rc(-17, -54, 50, 5, 0, 'paper', '.3') + Rc(-16, -63, 2.5, 28, 1.2, 'lamp', '.4') +
      Ci(-18, -46, 5.5, 'paper-shade') + Ci(34, -46, 5.5, 'paper-shade') + '</g></g></g>';
  }
  // reindeer, side view facing right, feet at y = 0. Leaving: walking out with a suitcase in its mouth
  // reindeer, side view facing right, feet at y = 0. Leaving: walking out with a suitcase in its mouth
  function reindeer(go, tr, sty) {
    var leg = function (x, c, far) { return '<g class="' + c + '">' + Rc(x, -50, 8, 48, 4, far ? mx('wood-dark', 'night-900', 70) : 'wood-dark') + Rc(x - 0.5, -7, 9, 7, 2, 'night-900') + '</g>'; };
    var ant = 'M-4 -12C-8 -30-3 -42 7 -50M-6 -28C-15 -31-19 -38-20 -46M1 -40C9 -40 13 -45 15 -51';
    return '<g transform="' + tr + '"><g class="' + (go ? 'il-walk' : 'il-stay') + '"' + sty + '>' + El(4, 0, 66, 6, 'night-900', ' opacity=".45" filter="url(#ui-fb)"') +
      '<g class="il-bob">' + leg(-34, 'il-lg2', 1) + leg(34, 'il-lg1', 1) + El(-52, -70, 9, 7, 'snow') +
      Pa('M30 -84C36 -104 44 -116 56 -126L72 -114C64 -102 56 -88 52 -70Z', 'url(#ui-frd)') +
      Pa('M-50 -62C-52 -86-30 -94 0 -92C26 -94 52 -86 54 -64C56 -46 42 -40 0 -40C-36 -40-50 -44-50 -62Z', 'url(#ui-frd)') +
      Pa('M-48 -66C-48 -84-30 -90-8 -90C-26 -86-38 -80-42 -64Z', 'lamp', '.4') + Pa('M-36 -46C-20 -52 20 -52 40 -46C30 -41-24 -41-36 -46Z', 'paper-shade', '.45') +
      leg(-22, 'il-lg1') + leg(44, 'il-lg2') +
      (go ? '' : Ln('M34 -86C42 -80 56 -84 64 -100', 'pole-red-dark', 5) + Ci(44, -80, 4.5, 'url(#ui-fgd)') + Ci(56, -86, 4.5, 'url(#ui-fgd)')) +
      '<g transform="translate(66 -126) rotate(16)"><g class="il-rh"><g transform="translate(10 0)">' + Ln(ant, 'snow-shade', 4.5) + '</g>' +
      Pa('M-14 -6C-22 -12-24 -18-22 -22C-16 -20-10 -14-8 -8Z', 'url(#ui-frd)') + El(0, 0, 18, 14, 'url(#ui-frd)') + El(15, 5, 12, 9, mx('hue-brown', 'paper-shade', 55)) +
      Ci(25, 3, 4.2, 'night-900') + Ci(3, -3, 2.6, 'ink') + Ln(ant, 'paper', 4.5) + '</g></g>' +
      (go ? Ln('M78 -108V-98M92 -106V-98M76 -110h18', 'night-900', 3.5) + Rc(62, -99, 46, 34, 5, 'url(#ui-fsc)') + Rc(62, -99, 46, 3, 1.5, 'lamp', '.5') +
        Rc(73, -99, 5, 34, 0, 'gold', '.85') + Rc(92, -99, 5, 34, 0, 'gold', '.85') + Rc(80, -90, 10, 9, 2, 'paper', 0, ' transform="rotate(-12 85 -86)"') : '') +
      '</g></g></g>';
  }
  // drone swarm: hovering, a red light blinking; some carry a parcel
  // drone swarm: hovering, a red light blinking; some carry a parcel
  function drone(x, y, s, d, gift) {
    var rot = function (cx) { return Rc(cx - 1.5, -11, 3, 7, 0, 'board-dark') + El(cx, -11, 14, 2.6, 'snow', ' class="il-rot" opacity=".4"'); };
    return '<g transform="translate(' + x.toFixed(1) + ' ' + y + ') scale(' + s + ')"><g class="il-hov"' + st('--d:-' + d + 's') + '>' +
      (gift ? Ln('M0 6V22', 'night-900', 1.4) + Rc(-7, 21, 14, 12, 2, 'hue-red') + Ln('M0 21V33M-7 26H7', 'gold', 2) : '') +
      Rc(-25, -5, 50, 4, 2, 'board-dark') + rot(-23) + rot(23) + Rc(-13, -9, 26, 15, 7, 'url(#ui-fm)') + Rc(-9, -7, 11, 2.4, 1.2, 'snow', '.45') +
      Ci(0, 7, 4, 'night-900') + Ci(-1, 6, 1.3, 'good') + Ci(9, -3, 2, 'pole-red', ' class="il-led"') + '</g></g>';
  }
  NP.interlude = {
    play: function (el, data, opts) {
      var D = data || {}, m = D.memo || {}, f = D.floor || {}, iss = D.issues || [];
      var reduced = !!(opts && opts.reduced) || document.documentElement.classList.contains('reduced');
      var nr = iss.filter(function (x) { return x.kind === 'return'; }).length;
      var here = f.present == null ? f.benches : f.present;
      // Four beats, each one waits for the player (playtest: three timed beats were too dense and too quick)
      var caps = ['Upstairs, the board sends a memo.', "Father Christmas ships his patch.",
                  'Board: ' + (D.boardLine || ''), f.caption || ''];
      var sr = [
        'Memo from the board. ' + [m.title, m.body, m.footer].join(' '),
        "Father Christmas's screen: Patch " + ((D.patch || {}).version || '') + ' released. Fixed: ' + ((D.patch || {}).fixed || []).join(' ') +
          ' Known issues: ' + ((D.patch || {}).known || 'none') + '.',
        'Issues board: ' + (iss.length - nr) + ' caught in QA, ' + nr + ' customer returns. ' +
          iss.map(function (x) { return x.text; }).join(' ') + ' ' + caps[2],
        'The workshop floor: ' + here + ' of ' + f.benches + ' benches staffed by elves. ' + (f.bots ? f.bots + ' robots at the benches, building toys. ' : '') +
          (f.contractors ? f.contractors + ' elves are back, wearing gold contractor badges and fixing the robots with spanners. One still holds a leaving card. ' : '') +
          (f.leaving === 1 ? 'One elf is walked out carrying a cardboard box, and the bench goes dark. ' :
            f.leaving ? f.leaving + ' elves are walked out carrying cardboard boxes, and their benches go dark. ' : '') +
          (f.reindeer === 'leaving' ? 'The reindeer leave with a suitcase. ' : '') + (f.drones ? 'A drone swarm hovers overhead. ' : '') + caps[3]
      ];
      var NB = 4;
      el.innerHTML = '<div class="il' + (reduced ? ' il-reduced' : '') + '">' +
        '<div class="il-stage">' + memo(m) + screen(Object.assign({}, D, { _part: 'il-only-mon' })) +
        screen(Object.assign({}, D, { _part: 'il-only-board' })) + floor(f, (el.clientWidth || window.innerWidth) < 640, reduced) + '</div>' +
        '<div class="il-foot"><p class="il-cap" aria-hidden="true"></p><p class="sr-only il-sr" aria-live="polite"></p>' +
        '<div class="il-dots" aria-hidden="true"><i></i><i></i><i></i><i></i></div>' +
        '<button type="button" class="keycap keycap-pack il-next">Continue</button>' +
        '<p class="il-hint"><span class="kb">Space, Enter or tap: continue · S: skip</span><span class="tch">Tap to continue</span></p></div></div>';
      el.hidden = false;
      var root = el.firstChild, beats = root.querySelectorAll('.il-beat'), dots = root.querySelectorAll('.il-dots i');
      var cap = root.querySelector('.il-cap'), srl = root.querySelector('.il-sr');
      var cur = -1, timer = 0, left = 0, t0 = 0, paused = false, over = false, resolve;
      var done = new Promise(function (r) { resolve = r; });

      var nextBtn = root.querySelector('.il-next'), shownAt = 0;
      function show(n) {
        if (over) return;
        if (Date.now() - shownAt < 450) return;          // a double-tap shouldn't skip a beat unseen
        if (n >= NB) return finish();
        cur = n; shownAt = Date.now();
        for (var i = 0; i < NB; i++) {
          beats[i].classList.toggle('on', i === n);
          beats[i].setAttribute('aria-hidden', i === n ? 'false' : 'true');
          dots[i].className = i < n ? 'past' : i === n ? 'now' : '';
        }
        cap.textContent = caps[n];
        setTimeout(function () { if (cur === n) srl.textContent = sr[n]; }, 60);   // a live region announces changes, so not the text it was inserted with
        nextBtn.textContent = n === NB - 1 ? (D.leaveLabel || 'Back to the belt') : 'Continue';
        try { nextBtn.focus({ preventScroll: true }); } catch (e) { nextBtn.focus(); }
      }
      function finish() {
        if (over) return;
        over = true; clearTimeout(timer);
        root.classList.add('il-end');
        resolve();
      }
      show(0);
      return {
        next: function () { if (!paused) show(cur + 1); },
        skip: finish,
        pause: function () {
          if (paused || over) return;
          paused = true;
          root.classList.add('il-paused');
        },
        resume: function () {
          if (!paused || over) return;
          paused = false; root.classList.remove('il-paused');
        },
        done: done
      };
    }
  };
})(window.NP);
