// Plays the real game through its own keys up to the automatic sixth round, then films that round to the closing film.
//   node hd/tools/auto.mjs [outDir] [--phone] [--reduced] [--reject] [--every=6] [--zoom=0.5] [--keep=5]      PowerShell only (Edge)
// --reject: the player rejects every first gift (a worse-trained AI); default packs everything at once.
// --keep=N: play the last N seconds of interlude 5 before the round, to see the hand-over (default: skip the interlude).
// Out: auto.png (a strip of what Edge painted, with ms since the round began) and auto.txt (the frame times).
import { launch } from '../../prototype/tests/cdp.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const root = dirname(fileURLToPath(import.meta.url)), args = process.argv.slice(2);
const flag = (n) => args.includes('--' + n), opt = (n, d) => +((args.find((a) => a.startsWith('--' + n + '=')) || '').split('=')[1] || d);
const out = resolve(args.find((a) => !a.startsWith('--')) || join(root, '..', 'render', 'out', 'motion', 'auto'));
const phone = flag('phone'), W = phone ? 390 : 800, H = phone ? 844 : 600;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
mkdirSync(out, { recursive: true });
const b = await launch({ width: W, height: H });
const errs = [];
b.on('Runtime.exceptionThrown', (e) => errs.push(e.exceptionDetails?.exception?.description || e.exceptionDetails?.text));
await b.navigate(`${pathToFileURL(join(root, '..', 'index.html')).href}?seed=7&fresh=1&skipintro=1${flag('reduced') ? '&reduced=1' : ''}`);
await sleep(900);
await b.clickSelector('#btnStart'); await sleep(900);
await b.clickSelector('#btnBriefingGo');
const state = async () => JSON.parse(await b.evaluate('JSON.stringify(window.__game.state())'));
// play rounds 1 to 5
let last = '', interludes = 0, t0 = Date.now(), rejected = -1;
for (;;) {
  const s = await state();
  if (s.automated || s.phase === 'montage') break;
  if (Date.now() - t0 > 420000) { console.error('gave up: stuck in ' + s.phase); await b.close(); process.exit(1); }
  if (s.phase === 'briefing') { await sleep(500); await b.clickSelector('#btnBriefingGo').catch(() => {}); }
  else if (s.phase === 'preview') await b.key('ArrowLeft');                       // drop the gift now
  else if (s.phase === 'belt') {
    if (flag('reject') && s.rejectsThisChild === 0 && rejected !== s.child) { rejected = s.child; await b.key('ArrowRight'); }
    else await b.key('ArrowLeft');
  } else if (s.phase === 'interlude') {
    if (last !== 'interlude') interludes++;
    if (interludes === 5 && opt('keep', 0)) { for (let i = 0; i < 3; i++) { await sleep(700); await b.key(' '); } break; }   // to its last beat, then film from there
    await sleep(400); await b.key('s');
  }
  last = s.phase;
  await sleep(120);
}
// film: every frame Edge paints, from here to the closing film
const shots = [];
b.on('Page.screencastFrame', (e) => { shots.push([e.metadata.timestamp * 1000, e.data]); b.send('Page.screencastFrameAck', { sessionId: e.sessionId }).catch(() => {}); });
await b.send('Page.startScreencast', { format: 'jpeg', quality: 80, everyNthFrame: 1 });
const mark = JSON.parse(await b.evaluate('JSON.stringify(Date.now())'));
if (opt('keep', 0)) { await sleep(opt('keep', 0) * 1000); await b.key(' '); }
const seen = []; let blank = 0, cardUp = 0;
for (const f0 = Date.now(); Date.now() - f0 < 40000;) {
  const s = await state();
  if (seen[seen.length - 1] !== s.phase) seen.push(s.phase);
  // (the page itself must never be hidden, and the card must be seen: a class on <body> once hid the whole page while the card was up)
  const v = JSON.parse(await b.evaluate(`JSON.stringify({d:getComputedStyle(document.body).display,c:!!document.querySelector('.hd-auto-card.on')})`));
  if (v.d === 'none') blank++;
  if (v.c) cardUp++;
  if (s.phase === 'epilogue' || s.phase === 'report') { await sleep(1500); break; }
  await sleep(100);
}
await b.send('Page.stopScreencast');
const every = opt('every', 6), zoom = opt('zoom', phone ? 0.45 : 0.5);
const frames = shots.map(([ts, d]) => [Math.round(ts - mark), d]).filter((f, i) => i % every === 0);
const fw = W * zoom, fh = H * zoom, cols = Math.max(2, Math.min(12, Math.floor(1900 / (fw + 2))));
const html = '<body style="margin:0;background:#111;font:11px monospace;color:#ff0"><div style="display:grid;grid-template-columns:repeat(' + cols + ',' + fw + 'px);gap:2px">' +
  frames.map(([t, d]) => '<div style="position:relative;width:' + fw + 'px;height:' + fh + 'px;overflow:hidden"><img src="data:image/jpeg;base64,' + d + '" style="width:' + fw + 'px;height:' + fh + 'px"><span style="position:absolute;left:3px;top:2px;background:#000a">' + t + '</span></div>').join('') + '</div></body>';
await b.setViewport({ width: Math.ceil(cols * (fw + 2)), height: Math.ceil(Math.ceil(frames.length / cols) * (fh + 2)) });
writeFileSync(join(out, 'auto.html'), html);
await b.navigate(pathToFileURL(join(out, 'auto.html')).href);
await sleep(500);
await b.screenshot(join(out, 'auto.png'));
await b.close();
writeFileSync(join(out, 'auto.txt'), frames.map((f) => f[0]).join(' '));
const gaps = shots.slice(1).map((x, i) => Math.round(x[0] - shots[i][0])), worst = Math.max(0, ...gaps);
if (blank) console.log('FAULT: the page was hidden (body display none) at ' + blank + ' of the samples taken');
if (!cardUp) console.log('FAULT: the card that opens the round was never up');
if (worst > 1500) console.log('WARNING: ' + worst + ' ms with nothing painted (a blank or frozen screen?)');
console.log(`${join(out, 'auto.png')}: ${frames.length} frames; phases seen: ${seen.join(' > ')}` + (errs.length ? '\nPAGE ERRORS:\n' + errs.slice(0, 8).join('\n') : ''));
process.exit(0);
