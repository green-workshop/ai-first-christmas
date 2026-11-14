// HD gifts: each icon is a path-traced sprite (hd/assets/gifts). The sprite is the icon's 64 x 64 box exactly, with the
// gift standing on the baseline (y = 56) and its own shadow on the belt. Anything not rendered yet falls back to the drawn icon.
var NP = window.NP, HD = NP.hd, drawn = NP.giftSVG;
function r1(n) { return Math.round(n * 10) / 10; }
function pill(x, w, h) {
  return '<rect x="' + x + '" y="2.1" width="' + r1(w) + '" height="' + h + '" rx="' + h / 2 + '" fill="var(--gold-dark)"/>' +
    '<rect x="' + x + '" y="0.5" width="' + r1(w) + '" height="' + h + '" rx="' + h / 2 + '" fill="url(#gi-gold)"/>' +
    '<rect x="' + r1(x + 3) + '" y="1.4" width="' + r1(w - 6) + '" height="' + r1(h * 0.26) + '" rx="' + r1(h * 0.13) + '" fill="var(--snow)" opacity=".45"/>';
}
var FONT = 'style="font-family:var(--font-ui,system-ui,sans-serif);font-variant-numeric:tabular-nums"';
// the same quantity pill as the drawn icons: a count of one (or a half) gets the big ONLY pill
function badge(t) {
  var tx = HD.esc(t), m = /^\s*[×x]\s*(1|½)\s*$/.exec(t);
  if (m) {
    var big = m[1], nw = big === '½' ? 12.4 : 8.6, h = 19, pw = r1(6 + 19 + 2.4 + nw + 6.5), x = r1(63.5 - pw);
    return '<g>' + pill(x, pw, h) +
      '<text x="' + r1(x + 6) + '" y="12.6" font-size="6.6" font-weight="800" fill="var(--ink-soft)" textLength="19" lengthAdjust="spacingAndGlyphs" ' + FONT + '>ONLY</text>' +
      '<text x="' + r1(x + 6 + 19 + 2.4 + nw / 2) + '" y="15.4" text-anchor="middle" font-size="16" font-weight="900" fill="var(--ink)" ' + FONT + '>' + big + '</text></g>';
  }
  var w = 0, i, ch, fs = 10, pw2, tw, x2, h2 = 14;
  for (i = 0; i < t.length; i++) { ch = t.charAt(i); w += /[0-9]/.test(ch) ? 0.58 : /[,.]/.test(ch) ? 0.28 : ch === '×' ? 0.6 : ch === '½' ? 0.82 : /[ ]/.test(ch) ? 0.28 : 0.62; }
  tw = w * fs; pw2 = tw + 10;
  if (pw2 > 63) { fs = fs * 53 / tw; tw = 53; pw2 = 63; }
  x2 = r1(63.5 - pw2);
  return '<g>' + pill(x2, pw2, h2) + '<text x="' + r1(x2 + pw2 / 2) + '" y="' + r1(0.5 + h2 / 2 + fs * 0.36) + '" text-anchor="middle" font-size="' + r1(fs) +
    '" font-weight="800" fill="var(--ink)" textLength="' + r1(tw) + '" lengthAdjust="spacingAndGlyphs" ' + FONT + '>' + tx + '</text></g>';
}
// The "tiny headphones" are the earbuds a child said they did not want. The drawn game shrinks the headphones; here they have
// a picture of their own (a charging case with the two buds on it), shown small but not as small as a shrunken thing.
function buds(spec) { return spec && spec.icon === 'headphones' && spec.scale === 'tiny' && !!HD.gifts.earbuds; }
HD.giftFile = function (spec) {
  if (buds(spec)) return 'gifts/earbuds';
  var set = HD.gifts[spec && spec.icon];
  if (!set) return null;
  return 'gifts/' + spec.icon + (spec.hue && set.indexOf(spec.hue) >= 0 ? '-' + spec.hue : '');
};
NP.giftSVG = function (spec) {
  spec = spec || {};
  var file = HD.giftFile(spec);
  if (!file) return drawn ? drawn(spec) : '';
  var k = buds(spec) ? 0.74 : spec.scale === 'giant' ? 1.7 : spec.scale === 'tiny' ? 0.45 : 1;
  var o = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="100%" height="100%" overflow="visible" aria-hidden="true" class="hd-gift" data-icon="' + HD.esc(spec.icon) + '">';
  var inner = '<image href="' + HD.url(file) + '" x="0" y="0" width="64" height="64" preserveAspectRatio="none"/>';
  if (k !== 1) inner = '<g transform="translate(32 56) scale(' + k + ') translate(-32 -56)">' + inner + '</g>';
  if (spec.outline) inner = '<g class="hd-gift-ol">' + inner + '</g>';
  if (spec.broken) {
    var a = typeof spec.tilt === 'number' ? spec.tilt : (9 + Math.random() * 7) * (Math.random() < 0.5 ? -1 : 1);
    inner = '<g transform="rotate(' + r1(a) + ' 32 46)" class="hd-gift-broken">' + inner + '</g>';
  }
  o += inner;
  if (spec.badge) o += spec.broken ? '<g class="hd-gift-broken" opacity=".8">' + badge(String(spec.badge)) + '</g>' : badge(String(spec.badge));
  return o + '</svg>';
};
// warm the cache with every gift once the page is idle
(window.requestIdleCallback || function (f) { setTimeout(f, 1200); })(function () {
  var all = [];
  Object.keys(HD.gifts).forEach(function (id) { HD.gifts[id].forEach(function (h) { all.push('gifts/' + id + (h ? '-' + h : '')); }); });
  HD.preload(all);
});
