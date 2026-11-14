// HD intro: the words and drawings the game puts on the blank surfaces of each still (hd-film.js plays the stills).
// Every rectangle is [x, y, w, h] in the still's own 1600 x 1000 pixels, measured on the render (see hd/render/scenes/cuts).
// A still with no entry here simply has nothing written on it.
var NP = window.NP, HD = NP.hd;
function f(n) { return Math.round(n * 10) / 10; }
function esc(s) { return HD.esc(s); }
function t(x, y, size, str, fill, ex) { return '<text x="' + f(x) + '" y="' + f(y) + '" font-size="' + f(size) + '" class="in-t" text-anchor="middle" fill="' + fill + '"' + (ex || '') + '>' + esc(str) + '</text>'; }
// one line centred in a rectangle, squeezed to fit
function word(r, str, fill, o) {
  o = o || {};
  var size = Math.min(r[3] * (o.k || 0.5), r[2] * 0.88 / (String(str).length * 0.62));
  return t(r[0] + r[2] / 2, r[1] + r[3] / 2 + size * 0.36, size, str, fill, ' style="font-weight:' + (o.w || 900) + ';letter-spacing:' + (o.ls || '.06em') + '"' + (o.rot ? ' transform="rotate(' + o.rot + ' ' + f(r[0] + r[2] / 2) + ' ' + f(r[1] + r[3] / 2) + ')"' : ''));
}
var INK = 'var(--ink)', RED = 'var(--pole-red)', CREAM = 'var(--paper)';
var NAMES = ['CHAIR', 'MEMBER 2', 'MEMBER 3', 'MEMBER 4', 'MEMBER 5'];

function cards(rs) { return (rs || []).map(function (r, i) { return r ? word(r, NAMES[i], INK, { k: 0.46, w: 800, ls: '.04em' }) : ''; }).join(''); }
// the chair's one slide: "AI", and a line going up with a rocket on it
function slide(r) {
  var x = r[0], y = r[1], w = r[2], h = r[3], by = y + h * 0.8, s = h / 300;
  return '<text x="' + f(x + w * 0.08) + '" y="' + f(y + h * 0.72) + '" font-size="' + f(h * 0.5) + '" class="in-t" fill="var(--night-600)" style="font-weight:900;letter-spacing:-.02em">AI</text>' +
    '<path d="M' + f(x + w * 0.42) + ' ' + f(by) + 'C' + f(x + w * 0.66) + ' ' + f(by + 4) + ' ' + f(x + w * 0.8) + ' ' + f(by - 10) + ' ' + f(x + w * 0.88) + ' ' + f(y + h * 0.3) + '" fill="none" stroke="var(--gold-dark)" stroke-width="' + f(h * 0.035) + '" stroke-linecap="round"/>' +
    '<g transform="translate(' + f(x + w * 0.88) + ' ' + f(y + h * 0.25) + ') scale(' + f(s * 100) / 100 + ') rotate(35)">' +
    '<path d="M-14 30C-26 50-10 70 0 84C10 70 26 50 14 30Z" fill="var(--lamp)"/><path d="M-16 36L-30 48V22L-16 8ZM16 36L30 48V22L16 8Z" fill="var(--pole-red-dark)"/>' +
    '<path d="M-16 36V-14C-16-38 0-56 0-56C0-56 16-38 16-14V36Z" fill="var(--pole-red)"/><circle cx="0" cy="-8" r="7" fill="var(--snow-shade)"/></g>';
}
// the edict. top..bottom of the lettering is the part of the scroll the stamp never covers; mark: the stamp's print, once it has lifted
function edict(r, mark) {
  var cx = r[0] + r[2] / 2, y = r[1], h = r[3], w = r[2];
  var s = t(cx, y + h * 0.2, w * 0.17, 'EDICT', INK, ' style="font-weight:900;letter-spacing:.14em"') +
    '<rect x="' + f(cx - w * 0.3) + '" y="' + f(y + h * 0.235) + '" width="' + f(w * 0.6) + '" height="4" rx="2" fill="var(--gold-dark)" opacity=".7"/>' +
    t(cx, y + h * 0.345, w * 0.086, 'CHRISTMAS WILL BE', INK, ' style="font-weight:800;letter-spacing:.04em"') +
    t(cx, y + h * 0.52, w * 0.18, 'AI-FIRST.', RED, ' style="font-weight:900"');
  if (mark) {
    // ("wait": there but not yet seen; the film shows it as the stamp lands)
    var mw = w * 0.56, mh = h * 0.13, mx = cx, my = y + h * 0.86;
    s += '<g class="hd-mark"' + (mark === 'wait' ? ' style="opacity:0"' : '') + '><g transform="rotate(-7 ' + f(mx) + ' ' + f(my) + ')" opacity=".82"><rect x="' + f(mx - mw / 2) + '" y="' + f(my - mh / 2) + '" width="' + f(mw) + '" height="' + f(mh) + '" rx="8" fill="none" stroke="' + RED + '" stroke-width="6"/>' +
      t(mx, my + mh * 0.2, mh * 0.56, 'APPROVED', RED, ' style="font-weight:900;letter-spacing:.1em"') + '</g></g>';
  }
  return s;
}
// (the board celebrates switching it on. It used to read "AI ADOPTION 100%", which made the sacking's reason, "AI adoption has
// reached 100%", old news: the game's own count starts at 8% a minute later.)
function board(r) { return HD.boardText ? HD.boardText(r, 'THE AI IS', 'ON', 100, 'ISSUES REPORTED: 0 · USE CASE: TBC', false) : ''; }

// the elf's own linework on a sheet: 0 teddy, 1 rocket, 2 train, 3 the Wobblepod (an egg on a spring, with feelers). Drawn in a 220 x 160 space, fitted to r
var SKETCH = ['M78 72a30 30 0 1 0 60 0a30 30 0 1 0-60 0M84 50a11 11 0 1 1-1 18M132 50a11 11 0 1 0 1 18M70 128a38 28 0 1 0 76 0a38 28 0 1 0-76 0',
  'M110 22C132 44 136 84 128 116H92C84 84 88 44 110 22ZM92 96L68 128H92M128 96L152 128H128M98 116L110 138L122 116M97 62a13 13 0 1 0 26 0a13 13 0 1 0-26 0',
  'M42 110V70H96V110ZM96 110V52H148V110ZM58 70V50H74V70M42 110H162L176 96M64 126a13 13 0 1 0 0.1 0M130 126a13 13 0 1 0 0.1 0',
  'M68 84a42 32 0 1 0 84 0a42 32 0 1 0-84 0M92 78a5 5 0 1 0 10 0a5 5 0 1 0-10 0M118 78a5 5 0 1 0 10 0a5 5 0 1 0-10 0M100 98q10 7 20 0M94 54q-10-16-23-17M126 54q10-16 23-17M93 116q17 6 34 0M93 124q17 6 34 0M93 132q17 6 34 0'];
function sketch(r, kind, ink, title) {
  var k = Math.min(r[2] / 220, r[3] / 168), ox = r[0] + (r[2] - 220 * k) / 2, oy = r[1] + (r[3] - 168 * k) / 2;
  return '<g transform="translate(' + f(ox) + ' ' + f(oy) + ') scale(' + f(k * 100) / 100 + ')" fill="none" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="' + SKETCH[kind] + '" stroke="' + ink + '" stroke-width="2.6" opacity=".92"/><path d="M20 152H200M20 148V156M200 148V156" stroke="' + (ink === 'var(--snow)' ? 'var(--lamp)' : ink) + '" stroke-width="1.6" opacity=".75"/></g>' +
    (title ? '<text x="' + f(r[0] + r[2] / 2) + '" y="' + f(r[1] + r[3] * 0.12) + '" font-size="' + f(r[3] * 0.055) + '" text-anchor="middle" class="in-t" fill="' + ink + '" opacity=".8" style="letter-spacing:.1em">' + esc(title) + '</text>' :
      '<text text-anchor="end" x="' + f(r[0] + r[2] * 0.96) + '" y="' + f(r[1] + r[3] * 0.95) + '" font-size="' + f(Math.max(9, r[3] * 0.06)) + '" fill="' + ink + '" opacity=".7" style="font-family:var(--font-mono);font-weight:700">DRAWN BY: ELF</text>');
}
HD.sketch = sketch;                                    // the closing film's drawing board uses it too
// handwriting on a sticky note
function note(r, lines) {
  var size = Math.min(r[3] * (lines.length > 1 ? 0.3 : 0.4), r[2] * 0.9 / (Math.max.apply(null, lines.map(function (l) { return l.length * (l === l.toUpperCase() ? 0.72 : 0.56); })))), s = '';
  lines.forEach(function (l, i) { s += '<text x="' + f(r[0] + r[2] / 2) + '" y="' + f(r[1] + r[3] / 2 + size * 0.34 + (i - (lines.length - 1) / 2) * size * 1.2) + '" font-size="' + f(size) + '" text-anchor="middle" class="sc-script" fill="' + INK + '" style="font-weight:700">' + esc(l) + '</text>'; });
  return s;
}
var NOTES = [['prompt'], ['prompt v2'], ['prompt v3 (better)'], ['PROMPT FINAL'], ['FINAL final'], ['PROMPT FINAL', 'final v7']];
// the tear-off calendar: month on the red header, day on the page
function calendar(head, page, day) {
  return word(head, 'DEC', CREAM, { k: 0.56, ls: '.16em' }) +
    '<text x="' + f(page[0] + page[2] / 2) + '" y="' + f(page[1] + page[3] * 0.72) + '" font-size="' + f(page[3] * 0.6) + '" text-anchor="middle" class="in-t" fill="' + INK + '" style="font-weight:900">' + day + '</text>';
}
// the upload panel that hangs in the air over Father Christmas's laptop
function upload(r) {
  var x = r[0], y = r[1], w = r[2], h = r[3];
  return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="12" fill="#0a1030" opacity=".94" stroke="var(--gold)" stroke-width="2.5"/>' +
    t(x + w / 2, y + h * 0.44, h * 0.25, 'UPLOADING DESIGNS', 'var(--snow)', ' style="font-weight:800;letter-spacing:.06em"') +
    '<rect x="' + f(x + w * 0.1) + '" y="' + f(y + h * 0.62) + '" width="' + f(w * 0.8) + '" height="' + f(h * 0.13) + '" rx="' + f(h * 0.065) + '" fill="#04060f"/>' +
    // (the bar is drawn full; the film fills it from empty as the designs go up)
    '<rect class="hd-upb" style="transform-box:fill-box;transform-origin:0 50%" x="' + f(x + w * 0.1) + '" y="' + f(y + h * 0.62) + '" width="' + f(w * 0.8) + '" height="' + f(h * 0.13) + '" rx="' + f(h * 0.065) + '" fill="var(--good)"/>';
}
// A prop photographed to be cut out (render/cutouts.mjs): its biggest piece, put back where its crop came from (off = the crop's
// corner on the still, from its //@shot line).
function piece(name, off) {
  var p = ((HD.pups || {})[name] || []).slice().sort(function (a, b) { return b[3] * b[4] - a[3] * a[4]; })[0];
  return p && HD.has('cuts', name + '.' + p[0]) ? { href: HD.url('cuts/' + name + '.' + p[0]), x: off[0] + p[1], y: off[1] + p[2], w: p[3], h: p[4] } : null;
}
function pieceImg(q, ex) { return '<image href="' + q.href + '" x="' + q.x + '" y="' + q.y + '" width="' + q.w + '" height="' + q.h + '" preserveAspectRatio="none"' + (ex || '') + '/>'; }
// the stamp, waiting above the frame until the film brings it down on the edict
function stamp() {
  var q = piece('x3-stamp-cut', [620, 610]);
  // (with the shadow it throws on the paper: the nearer the stamp, the nearer and sharper its shadow. Without one, a stamp
  // held over the sheet looks as if it is lying on it.)
  if (!q) return '';
  var sh = '<filter id="hd-st-blur" x="-30%" y="-40%" width="160%" height="180%"><feGaussianBlur stdDeviation="9"/></filter>' +
    '<rect class="hd-stamp-sh" x="' + f(q.x + q.w * 0.06) + '" y="' + f(q.y + q.h * 0.3) + '" width="' + f(q.w * 0.88) + '" height="' + f(q.h * 0.62) + '" rx="14" fill="#1a0f06" filter="url(#hd-st-blur)" style="transform-box:fill-box;transform-origin:50% 50%;opacity:0"/>';
  return sh + '<g class="hd-stamp" style="transform-box:fill-box;transform-origin:50% 55%;transform:translateY(-1100px)">' + pieceImg(q) + '</g>';
}
// him and the trolley, off to the right until the film wheels them in; the words on the trolley's plate go with them
function roll(plate) {
  var q = piece('x6-roll-cut', [800, 310]);
  if (!q) return '';
  // The one cut-out is shown as two halves, split where his hand meets the handle (x 1178 on the still): the trolley rolls level
  // and he, behind it, rises a little on each step (the film bobs .hd-roll-bob). Under them, the shadows they throw on the carpet
  // in 6a (the trolley's to the left, his long and to the right), drawn, so they do not arrive from nowhere when the photograph
  // takes over.
  var cut = 1178, half = function (x0, x1, id) { return '<clipPath id="' + id + '"><rect x="' + x0 + '" y="' + (q.y - 20) + '" width="' + (x1 - x0) + '" height="' + (q.h + 40) + '"/></clipPath>'; };
  var shadow = '<filter id="hd-roll-blur" x="-20%" y="-60%" width="140%" height="220%"><feGaussianBlur stdDeviation="7"/></filter>' +
    '<g filter="url(#hd-roll-blur)" opacity=".42"><path d="M716 700H1126V748H716Z" fill="#1c0707"/><path d="M1296 706C1380 702 1520 716 1640 732C1540 762 1400 752 1300 734Z" fill="#1c0707"/></g>';
  return '<g class="hd-roll" style="transform:translateX(900px)">' + half(q.x - 20, cut, 'hd-roll-a') + half(cut, q.x + q.w + 20, 'hd-roll-b') + shadow +
    '<g clip-path="url(#hd-roll-a)">' + pieceImg(q) + '</g><g class="hd-roll-bob"><g clip-path="url(#hd-roll-b)"><g class="hd-roll-v" data-v="0">' + pieceImg(q) + '</g>' +
    // (his half again with each leg lifted, x6-roll-s1 / -s2: the film shows one on each rise, so he steps behind the trolley)
    [1, 2].map(function (v) { var r = piece('x6-roll-s' + v + '-cut', [1150, 310]); return r ? '<g class="hd-roll-v" data-v="' + v + '" style="opacity:.004">' + pieceImg(r) + '</g>' : ''; }).join('') + '</g></g>' +
    (plate ? word(plate, 'TURN ON AI', CREAM, { k: 0.5, ls: '.05em' }) : '') + '</g>';
}
// a copy of a pinned drawing, which the film sends down into the laptop (to: the laptop, on the still)
function fly(r, kind, to) {
  return '<g class="hd-fly" style="opacity:0;transform-box:fill-box;transform-origin:50% 50%" data-x="' + f(to[0] - r[0] - r[2] / 2) + '" data-y="' + f(to[1] - r[1] - r[3] / 2) + '">' +
    '<rect x="' + r[0] + '" y="' + r[1] + '" width="' + r[2] + '" height="' + r[3] + '" rx="3" fill="#7fb0ff" fill-opacity=".3" stroke="#d6e8ff" stroke-opacity=".9" stroke-width="2"/>' + sketch(r, kind, 'var(--snow)') + '</g>';
}
// him coming down the cellar stairs: the cut-out of him alone, where he stands at the top in 8a, with how far the film must
// carry him to where 8b has him standing; and the near stringer of the stairs, drawn back over him
// He is photographed alone at four points on the way, each in the light that falls there: on the top stair (x8-fc-cut, where 8a
// has him), half way down (x8-w1), at the foot (x8-w2) and stepped out to where 8b has him standing (x8-w3). The film carries
// one group down the stairs and out (data-path: how far it has gone at each of those points), and each cut-out comes up over
// the one before as he reaches the place it was taken: so he walks into the lamplight. The near stringer and the rejects bin,
// cut out of photographs with him out of the way, are laid back over him: he goes down behind both.
// (until w1..w3 are rendered: the one cut-out, carried straight to where 8b has him)
function walker() {
  var qs = [piece('x8-fc-cut', [1140, 0]), piece('x8-w1-cut', [960, 0]), piece('x8-w2-cut', [960, 0]), piece('x8-w3-cut', [960, 0])];
  var b = ((HD.pups || {})['intro-8b'] || []).filter(function (p) { return /^fc/.test(p[0]); })[0], q = qs[0];
  if (!q || !b) return '';
  var foot = function (r) { return [r.x + r.w / 2, r.y + r.h]; }, f0 = foot(q), path, ims;
  if (qs[1] && qs[2] && qs[3]) {
    path = qs.map(function (r) { var p = foot(r); return [f(p[0] - f0[0]), f(p[1] - f0[1])]; });
    // (.004, not 0: a picture that is not painted is not unpacked, and the walk would hitch as each first came up)
    var layer = function (list, v) {
      return '<g class="hd-walk-v" data-v="' + v + '"' + (v ? ' style="opacity:.004"' : '') + '>' + list.map(function (r, i) {
        return pieceImg({ href: r.href, x: f(r.x - path[i][0]), y: f(r.y - path[i][1]), w: r.w, h: r.h }, ' class="hd-walk-im"' + (i ? ' style="opacity:.004"' : ''));
      }).join('') + '</g>';
    };
    ims = layer(qs, 0);
    // His legs step: at each of the four points he is photographed twice more, with the leg at screen left lifted and with the
    // one at screen right (x8-<point>-s1 / -s2, models/fc.glsl FC_STEP). Each set is a layer like the standing one; the film
    // shows a lifted leg on each rise of his walk and the standing layer as he comes down on it. (Without them he only bobs.)
    var STEP = [['x8-a', [1208, 0]], ['x8-w1', [1112, 128]], ['x8-w2', [1020, 264]], ['x8-w3', [956, 288]]];
    var s1 = STEP.map(function (p) { return piece(p[0] + '-s1-cut', p[1]); }), s2 = STEP.map(function (p) { return piece(p[0] + '-s2-cut', p[1]); });
    if (s1.concat(s2).every(Boolean)) ims += layer(s1, 1) + layer(s2, 2);
  } else { path = [[0, 0], [f(b[1] + b[3] / 2 - f0[0]), f(b[2] + b[4] - f0[1])]]; ims = pieceImg(q); }
  var s = '<g class="hd-walk" data-path="' + path.map(function (p) { return p.join(','); }).join(';') + '"><g class="hd-walk-bob">' + ims + '</g></g>';
  var over = function (name, ox, oy, keep) {
    ((HD.pups || {})[name] || []).forEach(function (p) {
      if (HD.has('cuts', name + '.' + p[0]) && keep(p)) s += '<image href="' + HD.url('cuts/' + name + '.' + p[0]) + '" x="' + (ox + p[1]) + '" y="' + (oy + p[2]) + '" width="' + p[3] + '" height="' + p[4] + '" preserveAspectRatio="none"/>';
    });
  };
  over('x8-rail-cut', 960, 0, function () { return true; });
  over('x8-bin-cut', 0, 0, function (p) { return p[1] + p[3] > 1250 && p[2] + p[4] > 450; });     // (the matte also takes other plates in the room: only the bin's pieces, at the right)
  return s;
}

// ---- where things are on each still ----
var AT = HD.introAt = {
  'intro-2a': { cards: [[188, 625, 102, 33], [378, 625, 101, 33], [567, 625, 102, 33], [757, 625, 101, 33], [946, 625, 102, 33]], slide: [335, 104, 549, 305] },
  // the scroll's flat sheet (the stamp covers x 665..975, y 655..850 of it in 3a); the scroll hides cards 3 to 5
  'intro-3a': { scroll: [550, 365, 500, 445], cards: [[102, 380, 116, 37], [318, 380, 116, 37]] },
  'intro-3b': { scroll: [550, 365, 500, 445], cards: [[102, 380, 116, 37], [318, 380, 116, 37]], mark: 1 },
  'intro-6a': { cards: [[281, 530, 86, 28], [441, 530, 87, 28], [602, 530, 87, 28], [763, 530, 87, 28]], slide: [405, 89, 467, 259], plate: [862, 617, 259, 68] },
  'intro-7a': { cards: [[281, 530, 86, 28], [441, 530, 87, 28], [602, 530, 87, 28], [763, 530, 87, 28]], board: [429, 43, 423, 235], plate: [862, 617, 259, 68] },
  // the studio: the big sheet on the drawing board (the elf covers its lower-left corner) and three pinned blueprints
  'intro-4a': { sheets: [[[395, 262, 472, 280], 0, 'var(--night-600)'], [[120, 154, 236, 173], 0, 'var(--snow)'], [[934, 109, 176, 133], 1, 'var(--snow)'], [[1134, 54, 176, 133], 2, 'var(--snow)']] },
  'intro-4b': { sheets: [[[395, 262, 472, 280], 0, 'var(--night-600)'], [[120, 154, 236, 173], 0, 'var(--snow)'], [[934, 109, 176, 133], 1, 'var(--snow)'], [[1134, 54, 176, 133], 2, 'var(--snow)']], upload: [1020, 210, 330, 104] },
  // the office: calendar header and page, then the sticky notes in the order they go up
  'intro-5a': { cal: [[1200, 130, 240, 69], [1199, 199, 242, 223], 3], notes: [[984, 259, 132, 83], [571, 159, 178, 83]] },
  'intro-5b': { cal: [[1200, 130, 240, 69], [1199, 199, 242, 223], 9], notes: [[984, 259, 132, 83], [571, 159, 178, 83], [934, 419, 312, 83], [104, 740, 222, 78]] },
  'intro-5c': { cal: [[1200, 130, 240, 69], [1199, 199, 242, 223], 16], notes: [[984, 259, 132, 83], [571, 159, 178, 83], [934, 419, 312, 83], [104, 740, 222, 78], [1226, 519, 208, 83], [707, 585, 210, 110]] },
  'intro-5d': { cal: [[1200, 130, 240, 69], [1199, 199, 242, 223], 21], notes: [[984, 259, 132, 83], [571, 159, 178, 83], [934, 419, 312, 83], [104, 740, 222, 78], [1226, 519, 208, 83], [707, 585, 210, 110]] },
  // head office: the cream face of the roof sign
  'intro-1a': { sign: [534, 243, 532, 81] },
  // the basement: the plate on the letters chute, the monitor's screen, the plate on the rejects bin.
  // count: what the queue reads when the still comes up (hd-film.js counts it up as the sacks land)
  'intro-8a': { letters: [117, 93, 166, 50], queue: [701, 460, 198, 139], rejects: [1340, 655, 232, 49], count: 0 },
  'intro-8b': { letters: [117, 93, 166, 50], queue: [701, 460, 198, 139], rejects: [1340, 655, 232, 49], count: 24 }
};
AT['intro-8c'] = AT['intro-8b'];
// (8a0: the same frame before the sacks have dropped; by the time 8a itself is shown the queue has reached 24)
AT['intro-8a0'] = { letters: AT['intro-8a'].letters, queue: AT['intro-8a'].queue, rejects: AT['intro-8a'].rejects, count: 0, sacks: 1 };
if (HD.has('cuts', 'intro-8a0')) AT['intro-8a'] = Object.assign({}, AT['intro-8a'], { count: 24 });
// the press, close on the button: the plate on the trolley's face; the chair's hand coming down ("in") and going back up ("out")
AT['intro-7p'] = { plate: [428, 716, 744, 195], hand: 'in' };
AT['intro-7q'] = { plate: [428, 716, 744, 195] };
AT['intro-7r'] = { plate: [428, 716, 744, 195], hand: 'out' };
// the edict before the stamp comes down (3s: the scroll bare, its print waiting); the room before the trolley is wheeled in (6e);
// the cellar stairs with nobody on them (8w); the board clapping (7a only: in 7b their arms are up); snow outside head office;
// in the studio, where the laptop is (the pinned drawings fly to it)
AT['intro-3s'] = { scroll: AT['intro-3a'].scroll, cards: AT['intro-3a'].cards, mark: 'wait', stamp: 1 };
AT['intro-6e'] = { cards: AT['intro-6a'].cards, slide: AT['intro-6a'].slide, roll: AT['intro-6a'].plate };
AT['intro-8w'] = { letters: AT['intro-8b'].letters, queue: AT['intro-8b'].queue, rejects: AT['intro-8b'].rejects, count: 24, walk: 1 };
AT['intro-7b'] = AT['intro-7a'];
AT['intro-7a'] = Object.assign({}, AT['intro-7a'], { clap: [220, 320, 860, 230] });
// (and cheering in 7b: the same board with their arms drawn down and in, x7-cheer, comes and goes over the still)
AT['intro-7b'] = Object.assign({}, AT['intro-7b'], { cheer: [220, 180, 860, 370] });
AT['intro-1a'].snow = 1;
AT['intro-4b'].laptop = [1250, 600];
// the office: where a drop of sweat runs down his face (x, y of where it starts), once he has started to sweat
AT['intro-5b'].sweat = [[858, 408]];
AT['intro-5c'].sweat = [[874, 424], [728, 422]];
AT['intro-5d'].sweat = [[896, 446], [740, 420]];

// The chair's hand over the close-up of the button. It is the hand photographed in intro-7q, cut out (render/cutouts.mjs), so in
// 7p and 7r, where the photograph has no hand, the film can slide it down its own arm and back (hd-film.js).
function hand(way) {
  var p = ((HD.pups || {})['intro-7q'] || []).filter(function (q) { return q[2] <= 2; }).sort(function (a, b) { return b[4] - a[4]; })[0];
  if (!p || !HD.has('cuts', 'intro-7q.' + p[0])) return '';
  return '<image class="hd-hand hd-hand-' + way + '" href="' + HD.url('cuts/intro-7q.' + p[0]) + '" x="' + p[1] + '" y="' + p[2] + '" width="' + p[3] + '" height="' + p[4] +
    '" preserveAspectRatio="none"' + (way === 'in' ? ' style="transform:translate(-300px,-564px)"' : '') + '/>';
}
// The sacks of letters in the cellar. The scene opens on intro-8a0, the still with its corner under the chute empty (render/pack.mjs
// makes it from intro-8a and a patch). Each sack, photographed by itself and cut out (x8-solo0..4), waits unseen until the film
// drops it in from the chute's mouth; then the film goes to intro-8a, where the sacks are in the photograph, shadows and all.
// The cut-outs are crops of the frame at SK below (the crop= on their //@shot lines in render/scenes/cuts/basement.glsl).
var SK = [0, 500, 540, 500];
function sacks(c) {
  if (c && c.red) return '';
  var each = '';
  for (var k = 0; k < 5; k++) {
    ((HD.pups || {})['x8-solo' + k] || []).forEach(function (p) {
      if (!HD.has('cuts', 'x8-solo' + k + '.' + p[0])) return;
      each += '<g class="hd-sk" style="opacity:0;transform-box:fill-box;transform-origin:50% 100%"><image href="' + HD.url('cuts/x8-solo' + k + '.' + p[0]) + '" x="' + (SK[0] + p[1]) + '" y="' + (SK[1] + p[2]) +
        '" width="' + p[3] + '" height="' + p[4] + '" preserveAspectRatio="none"/></g>';
    });
  }
  if (!each) return '';
  // a sack is only seen once it is below the chute's mouth
  return '<g class="hd-sacks"><defs><clipPath id="hd-sk-clip"><rect x="-300" y="322" width="1300" height="760"/></clipPath></defs>' +
    '<g clip-path="url(#hd-sk-clip)">' + each + '</g></g>';
}
// a drop of sweat running down: drawn, small, the blue of the beads in the photograph
function sweat(list) {
  return list.map(function (p, i) {
    return '<g transform="translate(' + p[0] + ' ' + p[1] + ')"><g class="hd-sweat" style="animation-delay:-' + (i * 0.47).toFixed(2) + 's">' +
      '<path d="M0 -10C5 -3 7 1 7 5A7 7 0 1 1 -7 5C-7 1 -5 -3 0 -10Z" fill="#7cc4f6"/><ellipse cx="-2.4" cy="3" rx="1.8" ry="3" fill="#fff" opacity=".75"/></g></g>';
  }).join('');
}
['intro-2b', 'intro-2c'].forEach(function (n) { AT[n] = AT['intro-2a']; });
AT['intro-3c'] = AT['intro-3b']; AT['intro-6b'] = AT['intro-6a'];
HD.nameCards = cards;                                  // the closing film names the same cards (hd-epilogue.js)

HD.introOver = HD.introOver || {};
Object.keys(AT).forEach(function (name) {
  HD.introOver[name] = function (c) {
    var a = AT[name], s = '', still = !!(c && c.red);     // still: reduced motion, where nothing is moved in
    if (a.sacks) s += sacks(c);
    if (a.hand) s += hand(a.hand);
    if (a.sweat && !still) s += sweat(a.sweat);
    if (a.snow && !still && HD.snow) s += HD.snow(1600, 1000, 70);
    // (the board with their hands apart: under the lettering, which the patch would otherwise cover)
    if (a.clap && !still && HD.has('cuts', 'x7-clap')) s += '<image class="hd-clap" href="' + HD.url('cuts/x7-clap') + '" x="' + a.clap[0] + '" y="' + a.clap[1] + '" width="' + a.clap[2] + '" height="' + a.clap[3] + '" preserveAspectRatio="none"/>';
    if (a.cheer && !still && HD.has('cuts', 'x7-cheer')) s += '<image class="hd-cheer2" href="' + HD.url('cuts/x7-cheer') + '" x="' + a.cheer[0] + '" y="' + a.cheer[1] + '" width="' + a.cheer[2] + '" height="' + a.cheer[3] + '" preserveAspectRatio="none"/>';
    if (a.cards) s += cards(a.cards);
    if (a.slide) s += slide(a.slide);
    if (a.scroll) s += edict(a.scroll, a.mark === 'wait' && still ? 1 : a.mark);
    if (a.stamp && !still) s += stamp();
    if (a.roll && !still) s += roll(a.roll);
    if (a.walk && !still) s += walker();
    if (a.plate) s += word(a.plate, 'TURN ON AI', CREAM, { k: 0.5, ls: '.05em' });
    if (a.board) s += board(a.board);
    if (a.sign) s += word(a.sign, 'NORTH POLE LTD', RED, { k: 0.66, ls: '.03em' });
    if (a.letters) s += word(a.letters, 'LETTERS', INK, { k: 0.55 });
    if (a.rejects) s += word(a.rejects, 'REJECTS', INK, { k: 0.55, ls: '.08em' });
    if (a.queue) s += word([a.queue[0], a.queue[1] + a.queue[3] * 0.12, a.queue[2], a.queue[3] * 0.3], 'REVIEW QUEUE:', 'var(--snow-shade)', { k: 0.6, w: 800 }) +
      '<text x="' + f(a.queue[0] + a.queue[2] / 2) + '" y="' + f(a.queue[1] + a.queue[3] * 0.82) + '" font-size="' + f(a.queue[3] * 0.46) + '" text-anchor="middle" class="' + (a.count ? '' : 'in-q') + '" fill="var(--gold)" style="font-family:var(--font-mono);font-weight:700">' + (a.count || 0) + '</text>';
    if (a.sheets) a.sheets.forEach(function (b) { s += sketch(b[0], b[1], b[2]); });
    if (a.sheets && a.laptop && !still) a.sheets.slice(1).forEach(function (b) { s += fly(b[0], b[1], a.laptop); });
    if (a.upload) s += upload(a.upload);
    if (a.cal) s += calendar(a.cal[0], a.cal[1], a.cal[2]);
    if (a.notes) a.notes.forEach(function (r, i) { s += note(r, NOTES[i]); });
    return s;
  };
});
