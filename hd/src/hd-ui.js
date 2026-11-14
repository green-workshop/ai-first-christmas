// HD title screen: the backdrop is a path-traced plate (wide, and a tall one for phones held upright).
var NP = window.NP, HD = NP.hd;
NP.art = NP.art || {};
var drawnTitle = NP.art.titleScene;
if (HD.has('plates', 'title')) {
  NP.art.titleScene = function () {
    var tall = HD.has('plates', 'title-tall');
    return '<picture class="hd-title">' + (tall ? '<source media="(max-aspect-ratio: 4/5)" srcset="' + HD.url('plates/title-tall') + '">' : '') +
      '<img src="' + HD.url('plates/title') + '" alt="" decoding="async"></picture>';
  };
}
