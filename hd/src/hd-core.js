// HD art: shared helpers. NP.hd is the list of rendered pictures, written by build.mjs.
window.NP = window.NP || {};
var NP = window.NP, HD = NP.hd = NP.hd || { base: 'assets/', gifts: {}, fc: [], plates: [], props: [], sets: [], cuts: [], ui: [] };
HD.url = function (path) { return HD.base + path + '.webp'; };
HD.has = function (kind, name) { return (HD[kind] || []).indexOf(name) >= 0; };
// fetch pictures ahead of need, so nothing pops in mid-game
var kept = {};
HD.preload = function (paths) {
  (paths || []).forEach(function (p) {
    if (kept[p]) return;
    var im = new Image(); im.decoding = 'async'; im.src = HD.url(p); kept[p] = im;
    if (im.decode) im.decode().catch(function () {});
  });
};
HD.esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); };
document.documentElement.classList.add('hd');
