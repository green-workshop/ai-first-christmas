// Changes to the game's words for the HD build, from the independent story review of 14 Nov 2026
// (hd/render/out/review-story/NOTES.md). Loaded after the prototype's content.js and before the engine, so the original game's
// text file is left as it was. Each change says what a first-time player took from the old words.
var C = window.NP && window.NP.content;
// every string in the content that contains `from` gets `to` in its place
function swap(o, from, to) {
  var n = 0;
  (function walk(x) {
    Object.keys(x).forEach(function (k) {
      var v = x[k];
      if (typeof v === 'string') { if (v.indexOf(from) >= 0) { x[k] = v.split(from).join(to); n++; } }
      else if (v && typeof v === 'object') walk(v);
    });
  })(o);
  if (!n && window.console) console.warn('hd-story: text not found: ' + from);
}
if (C) {
  // "The AI performed at 100%" was said thirty seconds after the player watched it ship wrong presents, and was given as the
  // reason for the letter asking them back. This is true in all three endings and points at the real reason.
  swap(C, 'The AI performed at 100%. Unfortunately, the children changed.', 'The AI did exactly what it was trained to do. Unfortunately, the children changed.');
  // The first memo announced, as news, what the player had just spent a round doing.
  swap(C, 'Letters to Father Christmas are now handled by LetterBot 3000.', 'The AI that reads the letters is now called LetterBot 3000. A naming committee has been formed.');
  // (the patch screen adds its own full stop)
  swap(C, 'None detected. Confidence: high.', 'None detected. Confidence: high');
  // Father Christmas's notes are chosen by the kind of toy, so each must be true of every wrong version of it: a one-piece
  // jigsaw got "50,000 pieces??" and a single sock "who has 4000 feet".
  var by = C.sticky && C.sticky.byIcon;
  if (by) { by.sock = ['socks come in twos']; by.jigsaw = ['count the pieces']; by.telescope = ['ONE telescope. whole']; }
  // The report's comment on a round named one particular wrong gift, which the player may not have been sent.
  swap(C, 'Round 1: a real bear got through. It happens. It shouldn\'t.', 'Round 1: something alive got through. It happens. It shouldn\'t.');
  swap(C, 'Round 2: someone is getting 4,000 of something.', 'Round 2: the numbers were wrong and nobody counted.');
  swap(C, 'Round 3: somebody\'s violin is in somebody else\'s stocking.', 'Round 3: somebody\'s present is in somebody else\'s stocking.');
  // A second shift skips the closing film and puts its story on the report instead. That story ended "You're back as a
  // contractor", straight after the same report said the contract had not been renewed, to someone who has seen the film.
  if (C.epilogue) C.epilogue.skippedRepeat = 'Next autumn there will be a new toy the AI has never seen. They know where to find you.';
  // "You trained the AI" paid off at the sacking without ever being set up. Every patch note now carries one more line, which
  // the player watches climb without knowing what it is for (build.mjs adds the line to the patch screen), and the last patch
  // is the AI's own, so its caption says so.
  (C.interludes || []).forEach(function (d, i, all) {
    if (!d.patch) return;
    var n = (i + 1) * 4, total = all.length * 4;
    d.patch.trained = n + '/' + total + '.' + (n === total ? ' Training complete.' : '');     // ("4 of 20." broke across two lines on the screen)
    if (i === all.length - 1) d.patchCaption = 'The AI ships its own patch.';
  });
}
