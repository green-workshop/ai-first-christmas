// HD interlude, beat 4: the workshop floor, built from path-traced sprites (hd/assets/cuts/il-*).
// build.mjs adds one line to the prototype's floor() that hands over to HD.floor below. The layout arithmetic is the
// prototype's own (prototype/src/interlude.js, floor() and bench()), copied so every bench, walker and drone lands where it
// did; only the drawing differs. If that layout changes there, change it here too.
// Sprite boxes (in the scene's units, 4 px per unit) are fixed by hd/render/scenes/cuts/floor.glsl.
var NP = window.NP, HD = NP.hd;
var NEED = ['il-bench', 'il-elf-a', 'il-elf-b', 'il-con-a', 'il-con-b', 'il-con-card', 'il-droid-a', 'il-droid-b', 'il-walk-a', 'il-walk-b',
  'il-deer', 'il-deer-go-a', 'il-deer-go-b', 'il-drone', 'il-drone-gift', 'il-lamp-on', 'il-lamp-off', 'il-window', 'il-wall', 'il-boards'];
var HUES = ['red', 'blue', 'yellow', 'green', 'purple', 'pink', 'brown'];
var DARK = '#080a18';                                  // the top of the wall picture, carried on above it

function st(s) { return ' style="' + s + '"'; }
function n1(v) { return Math.round(v * 10) / 10; }
function fx(n) { var X = NP.fx; return X && X[n] ? X[n].apply(X, [].slice.call(arguments, 1)) : ''; }
function img(name, x, y, w, h, ex) {
  return '<image href="' + HD.url('cuts/' + name) + '" x="' + n1(x) + '" y="' + n1(y) + '" width="' + n1(w) + '" height="' + n1(h) + '" preserveAspectRatio="none"' + (ex || '') + '/>';
}
// A sprite that moves: its frames lie one over another and hd.css blends each into the next in turn (kind 'ham' hammering,
// 'gait' walking). The first and last names are the two poses; the ones between are in-between frames, left out if not rendered.
// lastCls goes on the last frame: the prototype's own animation name runs there, which the checks look for.
function cycle(names, x, y, w, h, kind, lastCls) {
  var have = names.filter(function (n) { return HD.has('cuts', n); });
  if (have.length < names.length) have = [names[0], names[names.length - 1]];
  return '<g class="hd-cyc hd-' + kind + ' hd-n' + have.length + '">' + have.map(function (n, i) {
    var last = i === have.length - 1;
    return img(n, x, y, w, h, ' class="hd-f' + i + (last ? ' hd-fl' + (lastCls ? ' ' + lastCls : '') : '') + '"');
  }).join('') + '</g>';
}
function mv(a, b, c) { return st('--wd:' + a.toFixed(2) + 's;--du:' + b.toFixed(2) + 's;--dx:' + c.toFixed(0) + 'px'); }
function ci(v, a, b) { return Math.max(a, Math.min(b, Math.round(+v || 0))); }
function sp(o, c, a) { return '<stop offset="' + o + '"' + st('stop-color:' + c) + (a == null ? '' : ' stop-opacity="' + a + '"') + '/>'; }

// the toy on the bench: a wrapped present in the bench's colour. A rect, as in the drawn version, filled with the photograph
var TOY = 30, TOY_BASE = 0.86;                         // size in units; how far down the sprite the box's base sits
function toy(cx, hue) { return '<rect x="' + n1(cx - TOY / 2) + '" y="' + n1(211 - TOY * TOY_BASE) + '" width="' + TOY + '" height="' + TOY + '" fill="url(#hd-toy-' + hue + ')"/>'; }
function toyDefs() {
  var have = HD.gifts.giftbox || [];
  return HUES.map(function (h) {
    var file = 'gifts/giftbox' + (have.indexOf(h) >= 0 ? '-' + h : '');
    return '<pattern id="hd-toy-' + h + '" width="1" height="1" viewBox="0 0 64 64" preserveAspectRatio="none"><image href="' + HD.url(file) + '" width="64" height="64"/></pattern>';
  }).join('');
}

// an elf at a bench (box x -45..45, y 80..236), hammering. A contractor has the badge and a spanner, and mends the robot at
// its side: the spanner's jaw is on a bolt on the robot's head and the handle is worked up and down (render/scenes/cuts/floor.glsl
// JAW). Its picture is wider (x -55..55) so the spanner is inside it.
function elf(contractor, d, card) {
  var k = contractor ? 'il-con-' : 'il-elf-', x = contractor ? -55 : -45, w = contractor ? 110 : 90;
  // the one who kept the leaving card holds still: the card is in the picture
  return '<g class="il-elf hd-tap"' + st('--d:-' + d + 's') + '>' + (card ? img('il-con-card', x, 80, w, 156) : cycle([k + 'a', k + '1', k + '2', k + 'b'], x, 80, w, 156, 'ham', 'il-arm')) + '</g>';
}
// The part of a contractor's picture that lies over the robot it is mending: the spanner, from just clear of the elf's own
// body out to its jaw. The same frames in the same time, so it is one spanner, seen in front of the robot's head.
function reach(d, card) {
  return '<g' + st('--d:-' + d + 's') + '><svg x="27" y="80" width="28" height="156" viewBox="27 80 28 156" overflow="hidden">' +
    (card ? img('il-con-card', -55, 80, 110, 156) : cycle(['il-con-a', 'il-con-1', 'il-con-2', 'il-con-b'], -55, 80, 110, 156, 'ham')) + '</svg></g>';
}
// a robot at work (box x -58..50, y 146..243), cut off where the back edge of the bench top hides it
// (mend: a contractor is working on it. It has stopped, hammer up: a robot that went on hammering swung through the spanner.)
function builder(hue, d, mend) {
  var cut = 217 - 146;
  return '<g class="il-bot hd-tap' + (mend ? ' il-mend' : '') + '"' + st('--d:-' + d + 's') + '><svg x="-44" y="136" width="108" height="' + cut + '" viewBox="0 0 108 ' + cut + '" overflow="hidden">' +
    // (the toy sits where the hammer comes down: models/droid.glsl DR_DN puts the head over x = 10, just above the toy's top)
    (mend ? img('il-droid-a', 0, 0, 108, 97) : cycle(['il-droid-a', 'il-droid-1', 'il-droid-2', 'il-droid-b'], 0, 0, 108, 97, 'ham', 'dr-arm')) + '</svg>' + toy(10, hue) + '</g>';
}
function lamp(ly, k, on) {
  return '<g transform="translate(0 ' + ly + ') scale(' + Math.min(k, 1.15).toFixed(2) + ' 1)">' + img(on ? 'il-lamp-on' : 'il-lamp-off', -22, 36, 44, 34) + (on ? fx('bulb', 0, 64, 5, 0.7) : '') + '</g>';
}
// bench s: 0 dark, 1 staffed, 2 leaving (lit until its elf has walked out, at od). b: 0 no robot, 1 at the bench, 2 rolls in at od
function bench(cx, w, k, ly, s, hue, d, hasLamp, od, b, fix, card) {
  var dark = s === 2 && !b;                             // only a bench nobody takes over goes dark
  var out = dark ? '<g class="il-out"' + st('--od:' + od.toFixed(2) + 's') + '>' : '';
  if (b && s !== 1) s = 1.5;                            // lit, but no elf stays here
  var lit = s === 1 || s === 1.5;
  var glow = '<ellipse cx="0" cy="' + n1((ly + 362) / 2) + '" rx="' + n1(w * 0.62) + '" ry="' + n1((238 - ly) / 2 + 20) + '" fill="url(#hd-fg)"' + st('mix-blend-mode:screen') + '/>' +
    (hasLamp ? fx('cone', 0, ly + 62, 20 * k, w * 1.05, 244 - ly, 0.34) : '');
  var man = s === 1 ? elf(false, d) : '', mine = s === 1 ? toy(-4, hue) : '';
  if (fix) man = '<g transform="translate(-30 -12)">' + elf(true, d, card) + '</g>';
  // (a robot being mended stands in front of its contractor like any other, toy and all; the contractor's spanner is then laid
  // back over the robot's head: reach())
  var over = b && fix ? '<g transform="translate(-30 -12)">' + reach(d, card) + '</g>' : '';
  var bot = !b ? '' : fix ? '<g transform="translate(14 0)">' + builder(hue, d, true) + '</g>' : b === 2 ? '<g class="il-botin"' + st('--od:' + od.toFixed(2) + 's') + '>' + builder(hue, d) + '</g>' : builder(hue, d);
  var table = lit ? img('il-bench', -52, 196, 104, 112) : img('il-bench', -52, 196, 104, 112, ' filter="url(#hd-dim)"') + (dark ? out + img('il-bench', -52, 196, 104, 112) + '</g>' : '');
  return '<g transform="translate(' + cx.toFixed(1) + ' 0)">' + (lit ? glow : dark ? out + glow + '</g>' : '') +
    (hasLamp ? '<path d="M0 ' + (ly - 400) + 'V' + (ly + 40) + '" stroke="#05060d" stroke-width="1.6" opacity=".8"/>' + lamp(ly, k, lit) + (dark ? out + lamp(ly, k, true) + '</g>' : '') : '') +
    // the elf stands behind the bench; the robot and the toys are drawn after it, so they sit on the bench top
    '<g transform="scale(' + k.toFixed(2) + ')" transform-origin="0 300">' + man + table + bot + mine + over + '</g></g>';
}
// a laid-off elf carrying a box out (box x -45..55, y -160..10, feet at y = 0)
function walker(tr, sty) {
  return '<g transform="' + tr + '"><g class="il-walk"' + sty + '><g class="il-bob hd-step">' + cycle(['il-walk-a', 'il-walk-b'], -45, -160, 100, 170, 'gait') + '</g></g></g>';
}
// the reindeer (box x -75..120, y -190..12): standing in its collar, or walking out with a suitcase
function reindeer(go, tr, sty) {
  return '<g transform="' + tr + '"><g class="' + (go ? 'il-walk' : 'il-stay') + '"' + sty + '><g class="il-bob hd-step hd-trot">' +
    (go ? cycle(['il-deer-go-a', 'il-deer-go-1', 'il-deer-go-2', 'il-deer-go-3', 'il-deer-go-b'], -75, -190, 195, 202, 'gait') : img('il-deer', -75, -190, 195, 202)) + '</g></g></g>';
}
// The photographed rotor is a still blur. Over each one a pale streak turns in the plane of the disc (seen nearly edge on, so the
// circle it sweeps is squashed flat): at this speed it strobes, as a real rotor does on film.
function rotor(x, d) {
  return '<g transform="translate(' + x + ' -8.3) scale(1 .19)"><rect class="hd-rotor" x="-11.5" y="-1.6" width="23" height="3.2" rx="1.6" fill="#eef2ff" opacity=".5"' + st('animation-delay:-' + ((+d * 0.37) % 0.13).toFixed(3) + 's') + '/></g>';
}
// a delivery drone (box x -34..34, y -20..40), its red light blinking
function drone(x, y, s, d, gift) {
  return '<g transform="translate(' + x.toFixed(1) + ' ' + y + ') scale(' + s + ')"><g class="il-hov"' + st('--d:-' + d + 's') + '>' +
    img(gift ? 'il-drone-gift' : 'il-drone', -34, -20, 68, 60) + rotor(-20.25, d) + rotor(20.25, +d + 0.4) +
    '<circle cx="6" cy="0" r="5" fill="url(#hd-led)" class="il-led"' + st('mix-blend-mode:screen') + '/></g></g>';
}
// a tall night window, cropped to its steel frame
function win(x, wy) {
  return '<ellipse cx="' + x + '" cy="' + (wy + 54) + '" rx="100" ry="104" fill="url(#fx-cool)" opacity=".34"/>' +
    '<svg x="' + (x - 49) + '" y="' + (wy - 8) + '" width="98" height="127" viewBox="52 30 264 342" preserveAspectRatio="none" overflow="hidden">' +
    '<image href="' + HD.url('cuts/il-window') + '" width="368" height="400" preserveAspectRatio="none"/></svg>';
}
// a picture carried on to either side by its mirror image, so there is no edge to see on a wide window
function across(name, x, y, w, h) {
  var flip = function (edge) { return '<g transform="translate(' + n1(2 * edge) + ' 0) scale(-1 1)">' + img(name, x, y, w, h) + '</g>'; };
  return flip(x + 0.4) + flip(x + w - 0.4) + img(name, x, y, w, h);
}

HD.floorReady = function () { return NEED.every(function (n) { return HD.has('cuts', n); }); };
HD.floor = function (f, narrow, red) {
  if (!HD.floorReady()) return '';
  // every picture the floor is made of is fetched and unpacked as soon as an interlude is built, three beats before the floor is seen
  if (!HD.floorWarm) { HD.floorWarm = 1; HD.preload((HD.cuts || []).filter(function (c) { return /^il-/.test(c); }).map(function (c) { return 'cuts/' + c; })); }
  var n = ci(f.benches || 8, 1, 12), here = ci(f.present == null ? n : f.present, 0, n), leave = ci(f.leaving, 0, n - here);
  var rd = f.reindeer, lane = leave > 0 || rd === 'present' || rd === 'leaving';
  var nb = ci(f.bots, 0, n), con = ci(f.contractors, 0, nb);
  var W = narrow ? 400 : 800, per = narrow ? Math.min(3, n) : n, R = Math.ceil(n / per);
  var w = (W - 40) / per, k = Math.min(narrow ? 1.4 : 1.15, w / 92), ly = narrow ? Math.floor(222 - 214 * k) : 0;
  var TOP = f.drones ? (narrow ? 88 : 92) : 0, LANE = lane ? (narrow ? 150 : 112) : 0;
  // rows from the back (r = 0) to the front; back rows are smaller and higher (depth)
  var rows = [], y = 0, r, i = 0, out = '', walk = [];
  for (r = R - 1; r >= 0; r--) {
    var s = R > 1 ? 0.72 + 0.28 * r / (R - 1) : 1;
    // (on a phone the rows stand further apart than in the drawn game: a photographed elf's hood is tall and solid, and at the
    // drawn spacing each row hid the benches, toys and robots of the row behind it. Here a hood's tip comes just short of the
    // bench top behind.)
    if (r < R - 1) y -= k * (214 * rows[r + 1].s - 90 * s) * (narrow ? 1.24 : 0.92);
    rows[r] = { s: s, y: y, m: Math.floor(n / R) + (r < n % R ? 1 : 0) };
  }
  var top = rows[0].y - (300 - ly + 34) * rows[0].s, shift = narrow ? 24 + TOP - top : 300 + TOP;
  var H = narrow ? Math.round(shift + 40 + LANE) : 330 + TOP + LANE, floorY = narrow ? Math.round(rows[0].y + shift - 70 * k * rows[0].s) : 250 + TOP;
  // (walking pace: slower than the drawn film's 250 / 430, whose elves run. At that speed a photographed elf with no legs to
  // run on slides across the floor; at this one each step covers about its own width)
  var laneY = H - (narrow ? 24 : 20), kw = narrow ? k * 0.95 : k * 0.9, spd = (narrow ? 150 : 230) * (f.pace || 1);
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
        walk.push(walker('translate(' + (red ? wx + Math.min(70, dx * 0.3) : wx).toFixed(1) + ' ' + laneY + ') scale(' + kw.toFixed(2) + ')', mv(wd, du, (dx / kw))));
        if (red) sb = 0;
      }
      out += bench(bx, w, k, ly, sb, HUES[i % HUES.length], ((i * 0.37) % 1).toFixed(2), !narrow || r === 0, od, botB, fixed, i === n - con);
    }
    out += '</g>';
  }
  // the reindeer: at the front, or leaving with a suitcase
  if (rd === 'present' || rd === 'leaving') {
    var kr = kw * (narrow ? 0.8 : 0.95), rx0 = narrow ? 62 : 96, rdx = W * 1.6 + 400 - rx0;
    walk.unshift(reindeer(rd === 'leaving', 'translate(' + rx0 + ' ' + laneY + ') scale(' + kr.toFixed(2) + ')', mv((0.5 + leave * 0.42), (rdx / (narrow ? 150 : 230)), (rdx / kr))));   // (was 230 / 400) a body length to a stride: hd.css hd-g*
  }
  var dr = '';
  if (f.drones) for (i = 0; i < 7; i++) dr += drone(W * (0.1 + 0.8 * i / 6) + (i % 2 ? 14 : -10), 40 + (i % 3) * 15, narrow ? 0.85 : 0.95, (i * 0.29 % 1).toFixed(2), i === 2 || i === 5);
  var wins = narrow ? [110, 290] : [140, 400, 660], wy = narrow ? Math.max(20 + TOP, floorY - 250) : 48 + TOP;
  // the back wall: one photograph, its skirting board on the floor line; the floor: boards under everything, twice over for tall windows
  var wh = narrow ? 640 : 520, ww = wh * 16 / 9, bw = 1066, bh = 400;
  var set = '<rect x="-900" y="-600" width="2600" height="' + (floorY + 600) + '" fill="' + DARK + '"/>' + across('il-wall', W / 2 - ww / 2, floorY - wh, ww, wh) +
    '<rect x="-900" y="' + (floorY - wh - 2) + '" width="2600" height="' + n1(wh * 0.12) + '" fill="url(#hd-top)"/>' +
    wins.map(function (x) { return win(x, wy); }).join('') +
    fx('pool', W / 2, floorY - (narrow ? 90 : 60), W * 0.7, narrow ? 150 : 170, 0.22) +
    '<rect x="-900" y="' + floorY + '" width="2600" height="1400" fill="#150d08"/>' + across('il-boards', W / 2 - bw / 2, floorY, bw, bh) +
    '<g transform="translate(0 ' + (2 * (floorY + bh) - 0.4) + ') scale(1 -1)">' + across('il-boards', W / 2 - bw / 2, floorY, bw, bh) + '</g>' +
    '<rect x="-900" y="' + (floorY + 1) + '" width="2600" height="16" fill="url(#fx-rise)" opacity=".7"/>' +
    '<rect x="-900" y="' + (floorY + (narrow ? 120 : 70)) + '" width="2600" height="' + (H - floorY + 200) + '" fill="url(#fx-fall)" opacity=".8"/>' +
    '<rect x="-900" y="' + (H + 60) + '" width="2600" height="1400" fill="#06070f" opacity=".8"/>' +
    fx('motes', W * 0.08, wy - 10, W * 0.84, 150, narrow ? 8 : 12, 7, { r: narrow ? 1.5 : 1.3 });
  return '<section class="il-beat il-b3 hd-b3" aria-hidden="true"><svg class="il-floor" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYM' + (narrow ? 'ax' : 'id') + ' meet" xmlns="http://www.w3.org/2000/svg"><defs>' +
    '<radialGradient id="hd-fg">' + sp('0', 'var(--lamp)', '.34') + sp('.55', 'var(--lamp-deep)', '.11') + sp('1', 'var(--lamp-deep)', '0') + '</radialGradient>' +
    '<radialGradient id="hd-led">' + sp('0', '#ff6a50', '1') + sp('.35', '#ff2a1a', '.55') + sp('1', '#ff2a1a', '0') + '</radialGradient>' +
    '<linearGradient id="hd-top" x1="0" y1="0" x2="0" y2="1">' + sp('0', DARK, '1') + sp('1', DARK, '0') + '</linearGradient>' +
    // an unlit bench: the same photograph, printed down and cooled
    '<filter id="hd-dim" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values=".34 0 0 0 0  0 .36 0 0 0  0 0 .46 0 0  0 0 0 1 0"/></filter>' +
    toyDefs() + '</defs>' +
    '<g class="il-cam"' + st('transform-origin:' + W / 2 + 'px ' + Math.round(H * 0.6) + 'px') + '>' + set + out + walk.join('') + dr + '</g></svg></section>';
};
