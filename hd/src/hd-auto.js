// The automatic sixth round, made unmistakable (HD only; the drawn game shows it as an ordinary round with the buttons greyed).
// A playtester took it for a new shift and sat waiting to be asked something. So, from the moment the sacking interlude closes:
//   1. a card fills the play area: you have been replaced, the AI's training is complete, it will do the last four children
//      alone, there is nothing to press. A bar drains along its foot, so the wait is seen to be meant;
//   2. the screen is no longer a workplace but a feed of one: the Pack and Reject buttons are gone (an AUTOMATIC strip is where
//      they were, counting what is shipped unchecked and how much of it was right), the elf's mittens are gone from the belt,
//      Father Christmas is gone from his desk (the chair taped off, the bay dimmed), the belt's timer is gone (nobody is on the
//      clock), the letter is stamped as read by nobody, and the workshop is framed as a live picture with no operator.
// The rules are untouched: the engine still runs four children at double speed with both buttons disabled. build.mjs adds a
// few lines to the engine's copy (HOOKS): it calls HD.auto(true) as the sacking interlude closes (in place of its own small
// notice, which the card replaces; the words are still announced to a screen reader) and HD.auto(isAuto) as each child begins,
// asks HD.autoLead() how long to wait before the first of the AI's children (the card's time), and HD.autoHold(last) how long
// to rest on each result (the last one longer, so the finished count can be read before the closing film).
// NB the class this puts on <body> while the card is up must not be a class any rule here hides: "hd-auto-card" on <body>
// once matched ".hd-auto-card { display: none }" and blanked the whole page for as long as the card was meant to show.
var NP = window.NP, HD = NP.hd;
function $(id) { return document.getElementById(id); }
function el(cls, html) { var d = document.createElement('div'); d.className = cls; d.innerHTML = html; return d; }
var on = false, lead = 0, card = null, strip = null, watching = false, hideT = 0, offT = 0;
var CARD_S = 7.5;                                       // 26 words at the game's own reading rate of 200 a minute (SPEC 6)

function build() {
  var play = document.querySelector('#screen-game .play'), controls = play && play.querySelector('.controls'), floor = play && play.querySelector('.floor');
  if (!play || strip) return !!strip;
  strip = el('hd-auto-strip', '<span class="hd-auto-lamp"></span><b class="hd-auto-word">AUTOMATIC</b><span class="hd-auto-sub">No human in the loop</span>' +
    '<span class="hd-auto-count"><span class="hd-auto-x">Shipped </span>unchecked <b class="hd-auto-n">0</b><i>/4</i><span class="hd-auto-tally"><span class="hd-auto-ok">✓ <b>0</b></span><span class="hd-auto-no">✗ <b>0</b></span></span></span>');
  strip.setAttribute('aria-hidden', 'true');
  controls.appendChild(strip);
  var feed = el('hd-auto-feed', '<i class="hd-c hd-tl"></i><i class="hd-c hd-tr"></i><i class="hd-c hd-bl"></i><i class="hd-c hd-br"></i>' +
    '<span class="hd-auto-live"><span class="hd-auto-lamp"></span>LIVE <em>workshop, no operator</em></span>');
  feed.setAttribute('aria-hidden', 'true');
  floor.appendChild(feed);
  var letter = $('letter'), stamp = el('hd-auto-stamp', 'Read by nobody');
  stamp.setAttribute('aria-hidden', 'true');
  if (letter) letter.appendChild(stamp);
  card = el('hd-auto-card', '<div class="hd-auto-panel"><p class="hd-auto-kick"></p><h2>The AI’s training is complete</h2>' +
    '<p class="hd-auto-body">It learned from every gift you checked.<br>It will do the last 4 children alone.</p>' +
    '<p class="hd-auto-foot"><span class="hd-auto-lamp"></span>No human in the loop. Nothing to press. Just watch.</p><div class="hd-auto-bar"><i></i></div></div>');
  card.setAttribute('aria-hidden', 'true');
  card.hidden = true;
  play.appendChild(card);
  return true;
}
function reducedMotion() { return document.documentElement.classList.contains('reduced'); }
// what the AI has shipped so far in this round, and how much of it was right (the game's own record)
function count() {
  if (!strip) return;
  var st = window.__game && window.__game.state ? window.__game.state() : null, mine = st ? st.outcomes.filter(function (o) { return o.auto; }) : [];
  var ok = mine.filter(function (o) { return o.correct; }).length, set = function (sel, v) {
    var n = strip.querySelector(sel);
    if (!n || n.textContent === String(v)) return;
    n.textContent = v;
    if (v && n.animate && !reducedMotion()) n.animate([{ transform: 'scale(1.5)' }, { transform: 'scale(1)' }], { duration: 320, easing: 'cubic-bezier(.2,.8,.2,1)' });
  };
  set('.hd-auto-n', mine.length); set('.hd-auto-ok b', ok); set('.hd-auto-no b', mine.length - ok);
}
function hideCard() {
  clearTimeout(hideT);
  if (!card || card.hidden) return;
  card.classList.remove('on');
  document.body.classList.remove('hd-auto-open');
  hideT = setTimeout(function () { card.hidden = true; }, 320);
}
// The engine writes the phase it is in on <body>. In this round: preview (the card, then the letter), flight (the gift drops),
// montage (it rides the belt), flight (into the chute), result. The card goes as the first gift drops, and each result is
// one more shipped with nobody having looked. (Paused, the phase is "paused" and nothing here moves on.)
function watch() {
  if (watching || !window.MutationObserver) return;
  watching = true;
  new MutationObserver(function () {
    if (!on) return;
    var p = document.body.dataset.phase;
    if (p === 'flight' || p === 'montage') hideCard();
    if (p === 'result') count();
    if (p === 'epilogue' || p === 'report' || p === 'title' || p === 'briefing') HD.auto(false);
  }).observe(document.body, { attributes: true, attributeFilter: ['data-phase'] });
}
// called by the engine as the sacking interlude closes (true), as each child begins (is it one of the AI's own?) and when a
// shift starts (false)
HD.auto = function (auto) {
  if (!auto) {
    if (!on) return;
    on = false; lead = 0;
    document.body.classList.remove('hd-auto', 'hd-auto-open');
    clearTimeout(hideT); clearTimeout(offT);
    if (card) { card.classList.remove('on'); card.hidden = true; }
    return;
  }
  if (on || !build()) return;
  on = true; lead = CARD_S;
  var st = window.__game && window.__game.state ? window.__game.state() : null;
  card.querySelector('.hd-auto-kick').textContent = st && st.repeat ? 'Your contract has ended' : 'You have been replaced';
  ['.hd-auto-n', '.hd-auto-ok b', '.hd-auto-no b'].forEach(function (s) { strip.querySelector(s).textContent = 0; });
  watch();
  document.body.classList.add('hd-auto', 'hd-auto-open');
  card.style.setProperty('--card-s', CARD_S + 's');
  card.hidden = false;
  void card.offsetWidth;                                // so the fade-in and the bar run from the start
  card.classList.add('on');
  // the card is taken off a moment before the first gift drops, not as it drops (it used to fade with the gift already falling
  // behind it); if the game is paused just then, it waits for the drop as before
  clearTimeout(offT);
  offT = setTimeout(function () { if (on && document.body.dataset.phase !== 'paused') hideCard(); }, CARD_S * 1000 - 150);
};
// seconds before the gift of the child that has just begun is dropped: the card's time for the first, the engine's half second after
HD.autoLead = function () { var l = lead; lead = 0; return l || 0.5; };
// seconds to rest on a result of the AI's: the engine's half second, and two for the last, so "4/4" and its ticks can be read
HD.autoHold = function (last) { return last ? 2 : 0.5; };
