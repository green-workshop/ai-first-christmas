// TESTING ONLY. Not part of the game: build.mjs puts this in hd/test.html and leaves it out of hd/index.html.
// A strip of buttons on the title screen that plays any cutscene on its own (the intro, each interlude, each ending),
// then comes back to the title. The cutscenes are the game's own players, called the way the engine calls them.
var NP = window.NP;
function $(id) { return document.getElementById(id); }
var cur = null;
function reduced() { return document.documentElement.classList.contains('reduced'); }
function leaveTitle() {
  document.body.classList.remove('on-title');
  $('screen-title').hidden = true;
  var s = $('snow'); if (s) s.style.display = 'none';
}
function run(id, start) {
  if (cur) return;
  leaveTitle();
  var el = $(id); el.hidden = false; el.innerHTML = '';
  cur = start(el);
  cur.done.then(function () { location.reload(); });        // back to a clean title
}
var ISSUES = [{ id: 'BUG-0042', text: 'Teddy bear arrived as a bear.', kind: 'qa' }, { id: 'RET-0007', text: 'Socks: 4,000 pairs. One child.', kind: 'return' },
  { id: 'BUG-0043', text: 'Castle is life-size.', kind: 'qa' }, { id: 'BUG-0051', text: 'Kite is a bird.', kind: 'qa' }];
var PLAYS = [['Intro', function () { run('intro', function (el) { return NP.intro.play(el, { reduced: reduced() }); }); }]];
[1, 2, 3, 4, 5].forEach(function (n) {
  PLAYS.push(['Interlude ' + n, function () {
    run('interlude', function (el) {
      var d = Object.assign({}, NP.content.interludes[n - 1]);
      d.memo = Object.assign({}, d.memo, { body: d.memo.body.replace('{pct}', 62) });
      d.issues = ISSUES.slice(0, n + 1);
      return NP.interlude.play(el, d, { reduced: reduced() });
    });
  }]);
});
[['Ending: good', 95], ['Ending: middling', 62], ['Ending: bad', 20]].forEach(function (e) {
  PLAYS.push([e[0], function () { run('epilogue', function (el) { return NP.epilogue.play(el, { pct: e[1], pileCount: 14, adoption: 112, reduced: reduced() }); }); }]);
});

function mount() {
  var host = $('screen-title');
  if (!host || $('hd-test')) return;
  var box = document.createElement('div');
  box.id = 'hd-test';
  box.style.cssText = 'position:fixed;left:10px;bottom:10px;z-index:50;display:flex;flex-wrap:wrap;gap:6px;align-items:center;max-width:min(96vw,760px);padding:8px 10px;border-radius:10px;' +
    'background:rgba(8,10,28,.82);border:1px dashed rgba(255,205,130,.6);font:600 12px/1.2 system-ui,sans-serif;color:#ffd9a0';
  box.innerHTML = '<span style="margin-right:4px">Testing only: play a cutscene</span>';
  PLAYS.forEach(function (p) {
    var b = document.createElement('button');
    b.type = 'button'; b.textContent = p[0];
    b.style.cssText = 'font:inherit;color:#10142a;background:#ffd9a0;border:0;border-radius:6px;padding:5px 9px;cursor:pointer';
    b.addEventListener('click', p[1]);
    box.appendChild(b);
  });
  host.appendChild(box);
}
// while a cutscene started here is playing, the keys go to it and not to the game underneath (which still thinks it is on the title)
window.addEventListener('keydown', function (e) {
  if (!cur) return;
  e.stopImmediatePropagation(); e.preventDefault();
  if (e.key === ' ' || e.key === 'Enter') { if (cur.next) cur.next(); }
  else if (e.key === 's' || e.key === 'S' || e.key === 'Escape') { if (cur.skip) cur.skip(); }
}, true);
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
