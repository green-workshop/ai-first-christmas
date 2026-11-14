// HD closing film: each scene is one path-traced still (hd/assets/cuts/epi-*), with the game's own documents and
// lettering laid over it. build.mjs adds one line to the prototype's sceneSVG() that hands over to HD.epScene below, with
// the prototype's own builders for the cheque, the letters, the contract and the rejects pile (so their words stay in
// content.js and the pile still shows exactly what the player rejected).
// A scene keeps its drawn version until its still has been rendered.
// Coordinates: everything is placed in the still's own 1600 x 1000 pixels. A wide window shows the middle 1600 x 900 of
// it. An upright phone shows the middle of the still as a band, over a blurred copy, with the scene's document large beneath it.
var NP = window.NP, HD = NP.hd;
function f(n) { return Math.round(n * 10) / 10; }
function esc(s) { return HD.esc(s == null ? '' : s); }
function tx(x, y, size, str, fill, ex) { return '<text x="' + f(x) + '" y="' + f(y) + '" font-size="' + f(size) + '" class="ep-tx" fill="' + fill + '"' + (ex || '') + '>' + esc(str) + '</text>'; }
// the prototype's documents are drawn on a gradient "paper": print them on the photographed paper instead
// (one pattern per scene: a pattern inside a hidden scene draws nothing, so scenes cannot share one)
function mark(r, cls) { return '<rect' + (cls ? ' class="' + cls + '"' : '') + ' x="' + r[0] + '" y="' + r[1] + '" width="' + r[2] + '" height="' + r[3] + '" fill="none"/>'; }
function onPaper(m, k) { return m.replace(/url\(#ep-(paper|cheque)\)/g, 'url(#hd-ep-paper-' + k + ')'); }

// Lettering on the photographed enamel board. r = [x, y, w, h] of its face in the still.
function boardText(r, label, value, pct, sub, ok) {
  var x = r[0], y = r[1], w = r[2], h = r[3], p = w * 0.085, mw = w - 2 * p, fill = mw * 0.75 * Math.min(140, Math.max(5, pct)) / 100;
  var fs = Math.min(h * 0.32, (w - (ok ? w * 0.4 : w * 0.2)) / (String(value).length * 0.6)), cream = 'var(--paper)';
  return '<g transform="translate(' + f(x) + ' ' + f(y) + ')">' +
    tx(p, h * 0.22, h * 0.095, label, cream, ' font-weight="800" letter-spacing=".12em"') +
    '<rect x="' + f(p) + '" y="' + f(h * 0.27) + '" width="' + f(Math.min(w * 0.55, mw)) + '" height="' + f(h * 0.016) + '" rx="2" fill="var(--gold)"/>' +
    '<text x="' + f(p) + '" y="' + f(h * 0.6) + '" font-size="' + f(fs) + '" class="ep-tx ep-num" fill="' + cream + '" font-weight="800">' + esc(value) + '</text>' +
    (ok ? '<g transform="translate(' + f(w - p - h * 0.12) + ' ' + f(h * 0.44) + ') scale(' + f(h / 200) + ')"><circle r="22" fill="var(--pole-green-dark)"/><circle r="18" fill="color-mix(in srgb,var(--pole-green) 60%,var(--snow))"/><path d="M-8 1L-2 7L9 -6" fill="none" stroke="var(--paper)" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/></g>' : '') +
    '<rect x="' + f(p) + '" y="' + f(h * 0.7) + '" width="' + f(mw) + '" height="' + f(h * 0.07) + '" rx="' + f(h * 0.035) + '" fill="#040612" opacity=".5"/>' +
    '<rect class="ep-meter" x="' + f(p) + '" y="' + f(h * 0.71) + '" width="' + f(fill) + '" height="' + f(h * 0.05) + '" rx="' + f(h * 0.025) + '" fill="var(--gold)"/>' +
    '<rect x="' + f(p + mw * 0.75 - 2) + '" y="' + f(h * 0.68) + '" width="4" height="' + f(h * 0.11) + '" rx="2" fill="' + cream + '" opacity=".75"/>' +
    tx(p, h * 0.9, h * 0.075, sub, 'var(--snow)', ' font-weight="700" letter-spacing=".06em"') + '</g>';
}
// a word or two on a blank plate or label: centred in r, squeezed to fit
function plateText(r, str, fill, o) {
  o = o || {};
  var size = Math.min(r[3] * (o.k || 0.5), r[2] * 0.86 / (String(str).length * 0.62));
  return '<g' + (o.rot ? ' transform="rotate(' + o.rot + ' ' + f(r[0] + r[2] / 2) + ' ' + f(r[1] + r[3] / 2) + ')"' : '') + '>' +
    tx(r[0] + r[2] / 2, r[1] + r[3] / 2 + size * 0.35, size, str, fill, ' text-anchor="middle" font-weight="' + (o.w || 800) + '" letter-spacing="' + (o.ls || '.08em') + '"') + '</g>';
}

// ---- the scenes. Rectangles are measured on the stills (see hd/render/scenes/cuts). ----
// board: the dashboard's enamel face. label / plate: blank surfaces that take a word. doc: where a wide window puts the scene's document (x, y, scale, turn).
var BOARD = [1103, 57, 403, 260], CARDS = [[325, 586, 112, 37], [535, 586, 112, 37], [744, 586, 112, 37], [953, 586, 112, 37], [1163, 586, 112, 37]];
var EP = {
  e1: { still: 'epi-1', fx: 880, board: BOARD, cards: CARDS, doc: [227, 668, 1.333, -1.5] },
  good: { still: 'epi-2g', fx: 880, board: BOARD, cards: CARDS, doc: [620, 306, 1.333, -4] },
  // (drop: the crop the table without its sack, and the sack by itself, were photographed in: render/scenes/cuts/boardroom.glsl x2-*)
  mid: { still: 'epi-2', fx: 880, board: BOARD, cards: CARDS, label: [753, 501, 123, 59], plate: [677, 680, 246, 64], drop: [500, 280, 490, 360] },
  bad: { still: 'epi-2b', fx: 880, board: BOARD, cards: CARDS },
  // the basement: the heap stands in the moonlight on the clear floor at the left, under its taped-up sign.
  // pile: x and y of its foot, and the tallest it may grow. floor, elf, desk: where those are in the
  // photograph. panels: an upright phone shows these two crops, one above the other (Father Christmas, then you and the heap)
  // zz: where his sleeping head is (the z's drift up from it)
  jobless: { still: 'epi-3', pile: [400, 772, 400], sign: [300, 262, 190, 55], floor: [0, 681, 1600, 319], elf: [665, 480, 140, 325], desk: [785, 545, 720, 232], zz: [1185, 445],
    panels: [[900, 270, 640, 420], [120, 60, 840, 780]] },
  // (panes: the four panes of the window, which the falling leaves are seen through)
  autumn: { still: 'epi-4', fx: 1000, doc: [120, 140, 1.333, -1.5], panes: [[962, 80, 213, 178], [1188, 80, 210, 178], [962, 272, 213, 198], [1188, 272, 210, 198]] },
  rehire: { still: 'epi-5', fx: 760, sheet: [395, 262, 472, 280], doc: [1030, 96, 1.333, 1.5] }
};
HD.epLayout = EP;
HD.boardText = boardText; HD.plateText = plateText;      // the intro letters the same board and plates (hd-intro.js)

HD.epScene = function (k, o, wide, kit) {
  var sc = EP[k];
  if (!sc || !HD.has('cuts', sc.still)) return '';
  var url = HD.url('cuts/' + sc.still), ad = Math.round(+o.adoption || 100), over = '', doc = '', dw = 0, dh = 0, tall = '';
  // what the board says in this scene (the same three boards as the drawn film)
  var say = k === 'good' ? ['CREDIT', 'THANK YOU, AI', 100, 'CONTRIBUTORS: 1 (AI)', false] : k === 'bad' ? ['ALL GREEN', ad + '%', ad, 'ISSUES REPORTED: 0', true] : ['AI ADOPTION', ad + '%', ad, 'ISSUES REPORTED: 0', false];
  if (sc.board) over += boardText(sc.board, say[0], say[1], say[2], say[3], say[4]);
  if (sc.cards && HD.nameCards) over += HD.nameCards(sc.cards);
  if (sc.sheet && HD.sketch) over += HD.sketch(sc.sheet, 3, 'var(--night-600)', 'NEW TOY · REV 1');     // the Wobblepod, on the drawing board
  // The sack of returns lands on the table, as in the drawn film (its own classes: ep-sack drops and squashes, the camera jolts).
  // Until it does, the table is shown without it (a second photograph over that part of the still, which then fades away), and
  // the sack is a cut-out of itself (the cover lies over two of the name cards, so it carries their names). Without those two pictures, or with reduced motion, it is simply there.
  var label = sc.label ? plateText(sc.label, 'RETURNS', 'var(--ink)', { w: 900, ls: '.04em' }) : '';
  var sack = sc.drop && !o.reduced && HD.has('cuts', 'x2-nosack') ? ((HD.pups || {})['x2-sack-cut'] || []).slice().sort(function (a, b) { return b[3] * b[4] - a[3] * a[4]; })[0] : null;
  if (sack && HD.has('cuts', 'x2-sack-cut.' + sack[0])) {
    var dr = sc.drop;
    over += '<clipPath id="hd-ep-in-' + k + '"><rect x="0" y="0" width="1600" height="1000"/></clipPath>' +
      '<g class="hd-ep-cover"><image href="' + HD.url('cuts/x2-nosack') + '" x="' + dr[0] + '" y="' + dr[1] + '" width="' + dr[2] + '" height="' + dr[3] + '" preserveAspectRatio="none" mask="url(#hd-ep-soft-' + k + ')"/>' +
      (HD.nameCards ? HD.nameCards([null, sc.cards[1], sc.cards[2], null, null]) : '') + '</g>' +
      '<g clip-path="url(#hd-ep-in-' + k + ')"><g class="ep-sack" style="transform-box:view-box;transform-origin:' + f(dr[0] + sack[1] + sack[3] / 2) + 'px ' + f(dr[1] + sack[2] + sack[4]) + 'px"><image href="' + HD.url('cuts/x2-sack-cut.' + sack[0]) + '" x="' + (dr[0] + sack[1]) + '" y="' + (dr[1] + sack[2]) + '" width="' + sack[3] + '" height="' + sack[4] + '" preserveAspectRatio="none"/>' + label + '</g></g>';
    label = '';
  }
  over += label;
  // January: he is asleep at the desk; the drawn film's z's drift up from him (with reduced motion they are there, and still)
  if (sc.zz) for (var zi = 0; zi < 3; zi++) over += '<text class="ep-tx ep-z" x="' + (sc.zz[0] + zi * 26) + '" y="' + (sc.zz[1] - zi * 40) + '" font-size="' + (30 + zi * 11) + '" fill="var(--snow-shade)" font-weight="800" style="--d:' + (zi * 0.6) + 's">z</text>';
  // autumn: leaves come down past the window (the drawn film's leaves, falling a little slower: hd.css), seen through its
  // panes. The photograph has none of its own (NOLEAVES in office.glsl); with reduced motion these hang where they start.
  if (sc.panes) {
    var lv = '', x0 = sc.panes[0][0], x1 = sc.panes[1][0] + sc.panes[1][2], y0 = sc.panes[0][1];
    for (var li = 0; li < 7; li++) lv += '<g transform="translate(' + f(x0 + (x1 - x0) * (0.04 + li * 0.14)) + ' ' + f(y0 + 40 + (li % 3) * 50) + ') scale(1.6)"><path d="M0 -7C6 -5 8 2 0 8C-8 2 -6 -5 0 -7Z" fill="' + (li % 2 ? '#a34a12' : '#8d1a0c') + '" class="ep-leaf" style="--d:-' + (li * 0.57).toFixed(2) + 's"/></g>';
    over += '<clipPath id="hd-ep-panes-' + k + '">' + sc.panes.map(function (r) { return '<rect x="' + r[0] + '" y="' + r[1] + '" width="' + r[2] + '" height="' + r[3] + '"/>'; }).join('') + '</clipPath><g clip-path="url(#hd-ep-panes-' + k + ')">' + lv + '</g>';
  }
  if (sc.plate) over += plateText(sc.plate, 'NORTH POLE LTD', 'var(--night-900)', { k: 0.42, ls: '.12em' });
  if (sc.sign) over += '<g class="ep-sign">' + mark(sc.sign) + plateText(sc.sign, 'REJECTS', 'var(--ink-soft)') + '</g>';
  if (sc.pile) {
    // the toys are the game's own photographs, so they are cooled and dimmed to sit in the moonlight
    var n = Math.max(0, Math.round(+o.pileCount || 0)), pl = sc.pile;
    var sz = n <= 12 ? [120, 5] : n <= 24 ? [106, 6] : [92, 7];      // a bigger heap is made of smaller toys on a wider foot, so it stays a heap
    over += '<g transform="translate(' + pl[0] + ' ' + pl[1] + ')" filter="url(#hd-ep-moon-' + k + ')">' + (n ? kit.pile(n, sz[0], sz[1], pl[2]) : tx(0, -22, 34, 'Nothing rejected', 'var(--paper)', ' text-anchor="middle" font-weight="700"')) + '</g>';
  }
  // where the photographed floor, elf and desk are (nothing is drawn: the film's layout checks measure against them)
  if (sc.floor) over += mark(sc.floor, 'ep-flr');
  if (sc.desk) over += mark(sc.desk, 'ep-desk');
  if (sc.elf) over += '<g class="ep-keep">' + mark(sc.elf, 'ep-br') + '</g>';
  // the scene's document, at the size the drawn film gives it in each framing
  if (k === 'e1') { dw = wide ? 860 : 400; dh = wide ? 176 : 306; doc = '<g class="ep-cheque">' + onPaper(kit.cheque(dw, dh, wide), k) + '</g>'; }
  else if (k === 'good') { dw = wide ? 270 : 260; dh = wide ? 190 : 184; doc = '<g class="ep-letter">' + onPaper(kit.letter(dw, dh), k) + '</g>'; }
  else if (k === 'autumn') { dw = wide ? 540 : 400; dh = dw * 0.74; doc = '<g class="ep-letter">' + onPaper(kit.notice(dw, dh), k) + '</g>'; }
  else if (k === 'rehire') { dw = wide ? 370 : 400; dh = (118 + kit.TERMS.length * 27 + 62) * dw / 400; doc = '<g class="ep-cert">' + onPaper(kit.contract(dw, kit.TERMS), k) + '</g>'; }
  else if (!wide && sc.board) { dw = 320; dh = 198; tall = kit.dash(dw, dh, say[0], say[1], say[2], say[3], say[4]); }      // a phone gets the board again, close up
  var defs = '<defs><pattern id="hd-ep-paper-' + k + '" patternUnits="userSpaceOnUse" width="640" height="640"><image href="' + HD.url('ui/paper') + '" width="640" height="640" preserveAspectRatio="none"/></pattern>' +
    '<filter id="hd-ep-moon-' + k + '" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values=".6 0 0 0 0  0 .68 0 0 .01  0 0 .92 0 .05  0 0 0 1 0"/></filter>' +
    // (the picture of the table without its sack fades out at its edges, so no line shows where it lies over the still)
    (sc.drop ? '<filter id="hd-ep-blur-' + k + '" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="9"/></filter><mask id="hd-ep-soft-' + k + '" maskUnits="userSpaceOnUse" x="' + (sc.drop[0] - 20) + '" y="' + (sc.drop[1] - 20) + '" width="' + (sc.drop[2] + 40) + '" height="' + (sc.drop[3] + 40) + '">' +
      '<rect x="' + (sc.drop[0] + 22) + '" y="' + (sc.drop[1] + 22) + '" width="' + (sc.drop[2] - 44) + '" height="' + (sc.drop[3] - 44) + '" fill="#fff" filter="url(#hd-ep-blur-' + k + ')"/></mask>' : '') + '</defs>';
  // every still of the closing film is fetched as soon as its first scene is built, so no scene opens on an empty frame
  if (!HD.epWarm) { HD.epWarm = 1; HD.preload((HD.cuts || []).filter(function (n) { return /^(epi-|x2-)/.test(n); }).map(function (n) { return 'cuts/' + n; })); }
  var pic = '<image href="' + url + '" x="0" y="0" width="1600" height="1000" preserveAspectRatio="none"/>' + (o.reduced ? '' : HD.pupMarkup(sc.still));   // the cast breathes (hd-film.js)
  if (wide) {
    var d = sc.doc, placed = doc && d ? '<g transform="translate(' + d[0] + ' ' + d[1] + ') scale(' + d[2] + ') rotate(' + d[3] + ' ' + f(dw / 2) + ' ' + f(dh / 2) + ')">' + doc + '</g>' : '';
    return '<svg class="ep-svg ep-wd hd-ep" viewBox="0 50 1600 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' + defs +
      '<g class="ep-cam" style="transform-origin:800px 545px">' + pic + over + placed + '</g></svg>';
  }
  var fill = '<image class="hd-shot-fill" href="' + url + '" x="-830" y="0" width="2560" height="1600" preserveAspectRatio="none"/><rect class="hd-shot-dim" x="0" y="0" width="900" height="1600"/>';
  // upright, a scene with no document: two crops of the still, stacked. The lettering goes on the last one
  if (sc.panels) {
    var pw = 840, gap = 16, hs = sc.panels.map(function (p) { return p[3] * pw / p[2]; }), py = (1600 - hs.reduce(function (a, b) { return a + b; }, 0) - gap * (hs.length - 1)) / 2 + 20, body = '';
    sc.panels.forEach(function (p, i) {
      body += '<svg x="30" y="' + f(py) + '" width="' + pw + '" height="' + f(hs[i]) + '" viewBox="' + p.join(' ') + '" preserveAspectRatio="none">' + pic + (i === sc.panels.length - 1 ? over : '') + '</svg>' +
        '<rect x="30" y="' + f(py) + '" width="' + pw + '" height="' + f(hs[i]) + '" fill="none" stroke="var(--snow)" stroke-opacity=".16" stroke-width="2"/>';
      py += hs[i] + gap;
    });
    return '<svg class="ep-svg ep-nr hd-ep" viewBox="0 0 900 1600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' + defs + fill +
      '<g class="ep-cam" style="transform-origin:450px 880px">' + body + '</g></svg>';
  }
  // upright: viewBox 900 x 1600. The band is the still at three quarters size, centred on sc.fx; the document sits beneath it at about twice the drawn film's size
  var below = doc || tall, bk = 0.75, bandH = 1000 * bk, by = below ? 96 : 330, bx = Math.max(900 - 1600 * bk, Math.min(0, 450 - (sc.fx || 800) * bk));
  var s = below ? Math.min(2.1, 820 / dw, (1600 - by - bandH - 130) / dh) : 1;
  var dx = (900 - dw * s) / 2, dy = by + bandH + (1600 - by - bandH - 60 - dh * s) / 2;
  return '<svg class="ep-svg ep-nr hd-ep" viewBox="0 0 900 1600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' + defs + fill +
    '<g class="ep-cam" style="transform-origin:450px 880px"><g transform="translate(' + f(bx) + ' ' + by + ') scale(' + bk + ')">' + pic + over + '</g>' +
    (below ? '<g transform="translate(' + f(dx) + ' ' + f(dy) + ') scale(' + f(s * 100) / 100 + ')' + (doc ? ' rotate(-1.2 ' + f(dw / 2) + ' ' + f(dh / 2) + ')' : '') + '">' + below + '</g>' : '') + '</g></svg>';
};
