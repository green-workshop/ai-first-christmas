// Builds the HD game: the same engine and content as ../prototype, with the photographed-miniature art on top.
//   node hd/build.mjs   ->  hd/index.html, which loads its pictures from hd/assets/
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url)), proto = join(here, '..', 'prototype', 'src');
// The films keep the prototype's players. One line is added to each so the HD stills can take over its scene table (see src/hd-film.js).
const HOOKS = {
  'intro.js': [["NP.intro.play = function (host, opts) {", "NP.intro.play = function (host, opts) { if (NP.hd && NP.hd.introScenes && !SC.hd) { SC.hd = 1; NP.hd.introScenes(SC, { anim: anim }); }"],
    ["    function cap(c) {", "    function cap(c) { if (NP.hd && NP.hd.caption) return NP.hd.caption(caps, c, capEl, anim);"]],
  'epilogue.js': [["function sceneSVG(k, o, wide) {", "function sceneSVG(k, o, wide) { if (NP.hd && NP.hd.epScene) { var hdEp = NP.hd.epScene(k, o, wide, { cheque: cheque, letter: letter, notice: notice, contract: contract, dash: dash, pile: pile, TERMS: TERMS }); if (hdEp) return hdEp; }"]],
  'interlude.js': [["function floor(f, narrow, red) {", "function floor(f, narrow, red) { if (NP.hd && NP.hd.floor) { var hdFloor = NP.hd.floor(f, narrow, red); if (hdFloor) return hdFloor; }"]],
  // The automatic sixth round (src/hd-auto.js): the engine says when one of the AI's own children begins, waits for the card
  // before the first, and leaves the sacking to the card (it is still announced). The rules of the round are not changed.
  'engine.js': [["    $(\"btnPack\").disabled = $(\"btnReject\").disabled = c.auto;", "    $(\"btnPack\").disabled = $(\"btnReject\").disabled = c.auto; if (NP.hd && NP.hd.auto) NP.hd.auto(c.auto);"],
    ["c.previewTimer = after(c.auto ? 0.5 : previewTime(c.kid.letter),", "c.previewTimer = after(c.auto ? (NP.hd && NP.hd.autoLead ? NP.hd.autoLead() : 0.5) : previewTime(c.kid.letter),"],
    ["    if (d.sacked) { toast(d.sacked, 3.5); announce(d.sacked); }", "    if (d.sacked) { if (NP.hd && NP.hd.auto) NP.hd.auto(true); else toast(d.sacked, 3.5); announce(d.sacked); }"],
    ["after(c.auto ? 0.5 : shorted ? droidTime() : RESULT_BEAT, beginChild);", "after(c.auto ? (NP.hd && NP.hd.autoHold ? NP.hd.autoHold(G.index >= G.children.length) : 0.5) : shorted ? droidTime() : RESULT_BEAT, beginChild);"],
    // (a second shift's report does not tell a returning contractor they are "back as a contractor": src/hd-story.js)
    ["    if (!G.sawRehire) { notes.push(C.epilogue.skipped); }", "    if (!G.sawRehire) { notes.push(!G.firstPlay && C.epilogue.skippedRepeat ? C.epilogue.skippedRepeat : C.epilogue.skipped); }"],
    ["    setPhase(\"briefing\");", "    setPhase(\"briefing\"); if (NP.hd && NP.hd.auto) NP.hd.auto(false);"],
    // The briefing ignores "Start checking" for 0.4 s after it opens, so a second tap on Start cannot dismiss it unread. The
    // clock started before the game screen had been drawn, and the photographed screen can take longer than that to put up on
    // a slow or busy device: the waiting tap was then handled after the 0.4 s and the briefing was gone before it was seen.
    // So the briefing also takes no press until it has been painted.
    ["    G.briefingAt = performance.now();", "    G.briefingAt = performance.now(); G.briefingSeen = false; (function (g) { var seen = function () { g.briefingSeen = true; }; requestAnimationFrame(function () { requestAnimationFrame(seen); }); setTimeout(seen, 1500); })(G);"],   // (the timer: a page that is shown but draws no frames, as in some embedded previews, must not be left unable to start)
    ["if (performance.now() - G.briefingAt < BRIEFING_LOCKOUT) { return; }", "if (performance.now() - G.briefingAt < BRIEFING_LOCKOUT || G.briefingSeen === false) { return; }"]],
};
// Changes to the story's words and timing for the HD build, from the independent story review (hd/render/out/review-story;
// the words themselves are in src/hd-story.js, which changes content.js's text once it has loaded):
// the patch screen shows how much the AI has been trained on the elf's decisions, and the last patch is captioned as the AI's own
HOOKS['interlude.js'].push(["    lines.push(['il-kn', 'Known issues: ' + esc(p.known || 'none') + '.']);", "    lines.push(['il-kn', 'Known issues: ' + esc(p.known || 'none') + '.']); if (p.trained) lines.push(['il-dim', 'Trained on elf decisions: ' + esc(p.trained)]);"],
  ["\"Father Christmas ships his patch.\",", "(D.patchCaption || \"Father Christmas ships his patch.\"),"]);
// the film's last caption is the sentence that hands the player the game: 15 words had 3.8 s; the scene runs 1.5 s longer
HOOKS['intro.js'].push(["{ d: 12000, b: s7, still: 9700,", "{ d: 13500, b: s7, still: 9700,"]);
// the thank-you letter and the chair who reads it out agree on how it opens; the first two scenes (the cheque, the verdict)
// wait for a press like the last three: the cheque scene has the most to read of any
// (wait: on those two the cheque, the letter or the sack arrives about a second in; Next is not shown, and a press does nothing,
// until it has. With reduced motion nothing arrives late, and they behave like the others.)
HOOKS['epilogue.js'].push(["'Dear the elf,'", "'Dear Elf,'"], ["{ k: 'e1', t: 5000,", "{ k: 'e1', hold: true, wait: 1300, t: 5000,"], ["{ k: vk, t: 5000,", "{ k: vk, hold: true, wait: 1300, t: 5000,"],
  ["if (!auto && Date.now() - shownAt < (held() ? 600 : 350)) return;", "if (!auto && (hdLock || Date.now() - shownAt < (sc[cur].wait && !reduced ? sc[cur].wait : held() ? 600 : 350))) return;"],
  // A double tap must move on one scene, not two. The film counts its lock-out from when the new scene is painted, but a
  // photographed scene can take a second to put up on a slow phone, and the second tap, waiting all that time, was handled
  // before the clock was reset: it counted, and a scene was skipped unseen. So no press counts until the new scene is painted.
  ["      var cur = -1, timer = 0, left = 0, t0 = 0, paused = false, over = false, shownAt = 0, resolve;", "      var cur = -1, timer = 0, left = 0, t0 = 0, paused = false, over = false, shownAt = 0, hdLock = false, resolve;"],
  ["requestAnimationFrame(function () { requestAnimationFrame(function () { if (cur === i) shownAt = Date.now(); }); });", "hdLock = true; setTimeout(function () { if (cur === i) hdLock = false; }, 1500); requestAnimationFrame(function () { requestAnimationFrame(function () { if (cur === i) { shownAt = Date.now(); hdLock = false; } }); });"],   // (the timer, as for the briefing: never locked for good where no frames are drawn)
  ["        nextBtn.classList.toggle('show', held());", "        nextBtn.classList.toggle('show', held() && !(sc[i].wait && !reduced)); if (held() && sc[i].wait && !reduced) setTimeout(function () { if (cur === i && !over) { nextBtn.classList.add('show'); focusNext(); } }, sc[i].wait - 150);"]);
// Father Christmas's notes are chosen by the kind of toy, and were written for the faults of rounds 1 and 2. Round 5 sends some
// of the same toys for a different reason (the child said NOT), where "pairs = 2. TWO" or "no real dinos" is beside the point:
// there the round's own notes are used.
HOOKS['engine.js'].push(["        var byIcon = C.sticky.byIcon && C.sticky.byIcon[spec.icon];", "        var byIcon = (c.round <= 2 || /^(empty|crate|giftbox)$/.test(spec.icon)) && C.sticky.byIcon && C.sticky.byIcon[spec.icon];"]);
const P = (f) => { let s = readFileSync(join(proto, f), 'utf8'); for (const [a, z] of HOOKS[f] || []) { if (!s.includes(a)) throw new Error('hook point missing in ' + f + ': ' + a); s = s.replace(a, () => z); } return s; }, H = (f) => (existsSync(join(here, 'src', f)) ? readFileSync(join(here, 'src', f), 'utf8') : '');
// a typo in an HD module must stop the build, not ship a page whose art silently falls back to the drawn version
for (const f of readdirSync(join(here, 'src')).filter((x) => x.endsWith('.js'))) { try { new Function(H(f)); } catch (e) { throw new Error('hd/src/' + f + ': ' + e.message); } }
const ls = (d) => (existsSync(join(here, 'assets', d)) ? readdirSync(join(here, 'assets', d)).filter((f) => f.endsWith('.webp')).map((f) => f.slice(0, -5)) : []);

// what has been rendered so far: the art modules fall back to the drawn version for anything missing
const gifts = {};
for (const n of ls('gifts')) { const m = n.match(/^([a-z]+)(?:-([a-z]+))?$/); if (m) (gifts[m[1]] = gifts[m[1]] || []).push(m[2] || ''); }
// the cast cut out of the film stills (render/cutouts.mjs): still -> [[who, x, y, w, h], ...]
const pupFile = join(here, 'assets', 'cuts', 'pups.json'), pups = existsSync(pupFile) ? JSON.parse(readFileSync(pupFile, 'utf8')) : {};
const manifest = { base: 'assets/', gifts, fc: ls('fc'), plates: ls('plates'), props: ls('props'), sets: ls('sets'), cuts: ls('cuts'), ui: ls('ui'), pups };

const css = [['p', 'tokens.css'], ['p', 'layout.css'], ['p', 'ui.css'], ['p', 'intro.css'], ['p', 'cutscene.css'], ['h', 'hd.css']]
  .map(([w, f]) => `/* ---- ${f} ---- */\n` + (w === 'p' ? P(f) : H(f))).join('\n');
// the prototype's art modules load first (the cutscenes still use their helpers); each hd-* file then replaces what it has pictures for
const js = [['p', 'icons.js'], ['p', 'fx.js'], ['p', 'ui-art.js'], ['p', 'scene.js'], ['p', 'interlude.js'], ['p', 'intro.js'], ['p', 'epilogue.js'],
  ['m', ''], ['h', 'hd-core.js'], ['h', 'hd-icons.js'], ['h', 'hd-scene.js'], ['h', 'hd-ui.js'], ['h', 'hd-film.js'], ['h', 'hd-interlude.js'], ['h', 'hd-intro.js'], ['h', 'hd-epilogue.js'], ['h', 'hd-auto.js'],
  ['p', 'content.js'], ['h', 'hd-story.js'], ['p', 'engine.js']]
  .map(([w, f]) => (w === 'm' ? `window.NP = window.NP || {}; window.NP.hd = ${JSON.stringify(manifest)};` : `/* ---- ${f} ---- */\n;(function(){\n${w === 'p' ? P(f) : H(f)}\n})();`)).join('\n');
const html = P('shell.html').replace('<title>North Pole Ltd: AI-First Christmas</title>', '<title>North Pole Ltd: AI-First Christmas (HD)</title>')
  .replace('<!-- @css -->', () => css).replace('<!-- @js -->', () => js.replace(/<\/script/gi, '<\/script'));
writeFileSync(join(here, 'index.html'), html);
// The same page again as ../index.html, the one the public link opens: it loads its pictures from hd/assets/, and is the game
// proper, so its title does not say HD. (hd/index.html stays, for anyone who has that address.)
const base = '"base":"assets/"';
if (html.split(base).length !== 2) throw new Error('expected the manifest to give the picture folder exactly once');
writeFileSync(join(here, '..', 'index.html'), html.replace(base, '"base":"hd/assets/"').replace('<title>North Pole Ltd: AI-First Christmas (HD)</title>', '<title>North Pole Ltd: AI-First Christmas</title>'));
// For testing only: the same page with a strip of buttons on the title that plays any cutscene by itself (src/hd-test.js).
// The game proper (index.html) does not have it; do not publish test.html.
writeFileSync(join(here, 'test.html'), html.replace('</body>', () => `<script>\n;(function(){\n${H('hd-test.js').replace(/<\/script/gi, '<\\/script')}\n})();\n</script>\n</body>`));
console.log('hd/index.html', (Buffer.byteLength(html) / 1024).toFixed(1) + ' KB;', Object.keys(gifts).length, 'gifts,', manifest.fc.length, 'Father Christmas frames,', manifest.plates.length, 'plates');
