// Film strips of the HD game's moving parts, for judging motion frame by frame (a still cannot show a stumble).
//   node hd/tools/motion.mjs <what> [outDir]      PowerShell only (Edge)
// what: wrong   Father Christmas dealing with a wrong gift (look, scratch, type, back to rest)
//       right   a good gift was rejected (he holds it up, puzzled)
//       rest    at rest: breathing and blinking
//       speech  the AI's speech bubble coming, changing and going
//       floor   the workshop floor in the interlude: hammering, robots, elves and the reindeer walking out
//       film N  scene N of the intro (1-8), as it plays (the film is jumped to that scene; with --play it is jumped to three
//               scenes earlier and left to run, so the scene is met as a player meets it, pictures fetched in their turn)
//       end N   scene N of the closing film (2-5) from the moment it comes up; --pct=62 picks the ending (95 good, 62 middling, 20 bad)
// Each strip is every frame Edge painted of the same patch of the screen, in order, with its time in ms. --every=3 keeps one in three.
// Run it when nothing is rendering: a busy graphics card drops frames and the strip shows stumbles that are not the game's.
import { launch } from '../../prototype/tests/cdp.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const root = dirname(fileURLToPath(import.meta.url));
const what = process.argv[2] || 'wrong', out = resolve(process.argv.slice(3).find((a) => !a.startsWith('--') && !/^\d+$/.test(a)) || join(root, '..', 'render', 'out', 'motion'));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
mkdirSync(out, { recursive: true });

// [bay to mount, patch to photograph (x, y, w, h in the 800 x 600 stage), ms to film, what to do at time 0, optional later steps [ms, js]]
const DESK = [310, 70, 340, 380], AI = [400, 270, 400, 260];
const SHOTS = {
  wrong: ['Desk', DESK, 3300, '__bay.pileAdd({icon:"teddy"}); __bay.react(false)'],
  right: ['Desk', DESK, 3000, '__bay.pileAdd({icon:"teddy"}); __bay.react(true)'],
  again: ['Desk', DESK, 3700, '__bay.pileAdd({icon:"teddy"}); __bay.react(true)', [[3000, '__bay.react(true)']]],   // the second time: every frame has been seen once
  rest: ['Desk', DESK, 6500, '0'],
  frazzle: ['Desk', DESK, 3300, '__bay.react(false); __bay.frazzle(2)'],
  speech: ['Belt', AI, 3000, '__bay.hopperTalk("I have optimised this teddy for engagement."); __bay.hopperChurn()',
    [[1300, '__bay.hopperTalk("Rework complete. Probably.")'], [2300, '__bay.hopperTalk(null)']]],
};
const WHOLE = [0, 0, 800, 600], arg = +process.argv.find((a, i) => i > 2 && /^\d+$/.test(a)) || 0;
const INTRO_MS = [2000, 12000, 9000, 5000, 12000, 6000, 8000, 12000];
// the films and the interlude are played by their own players, not mounted in a box
if (what === 'floor') SHOTS.floor = ['', WHOLE, 5600, '__il.next()'];
if (what === 'film') SHOTS.film = ['', WHOLE, INTRO_MS[(arg || 2) - 1] || 8000, `__ix._seek(${(arg || 2) - 1}, 1); __ix.resume()`];
if (what === 'end') SHOTS.end = ['', WHOLE, 6000, '__ep.next()'];
const play = what === 'film' && process.argv.includes('--play');
const spec = SHOTS[what];
if (!spec) { console.error('what: ' + Object.keys(SHOTS).join(', ') + ', floor [interlude 1-5], film [scene 1-8]'); process.exit(2); }
const [bay, clip0, dur, start, later = []] = spec;
// --clip=x,y,w,h films another patch of the 800 x 600 stage (a close-up)
const clipArg = process.argv.find((a) => a.startsWith('--clip=')), clip = clipArg ? clipArg.slice(7).split(',').map(Number) : clip0;

const b = await launch({ width: 800, height: 600 });
const errs = [];
b.on('Runtime.exceptionThrown', (e) => errs.push(e.exceptionDetails?.exception?.description || e.exceptionDetails?.text));
await b.navigate(`${pathToFileURL(join(root, '..', 'index.html')).href}?seed=7&fresh=1&skipintro=1&untimed=1`);
await sleep(800);
if (bay) {
  await b.evaluate(`(()=>{const d=document.createElement('div');d.style.cssText='position:fixed;left:0;top:0;width:800px;height:600px;z-index:99999;background:#0c1022;overflow:hidden';
    const i=document.createElement('div');i.style.cssText='position:absolute;left:0;right:0;bottom:0;height:${bay === 'Desk' ? 560 : 470}px';d.appendChild(i);document.body.appendChild(d);
    window.__bay=NP.scene.mount${bay}(i);const s=i.querySelector('svg');s.style.width='100%';s.style.height='100%';return 1})()`);
} else {
  await b.evaluate(`(()=>{document.body.classList.remove('on-title');document.getElementById('screen-title').hidden=true;const s=document.getElementById('snow');if(s)s.style.display='none';return 1})()`);
  if (what === 'film') await b.evaluate(`(()=>{const el=document.getElementById('intro');el.hidden=false;window.__ix=NP.intro.play(el,{reduced:false});__ix._seek(${play ? Math.max(0, (arg || 2) - 4) : Math.max(0, (arg || 2) - 2)}, 0);${play ? '__ix.resume();' : ''}return 1})()`);
  else if (what !== 'end') await b.evaluate(`(()=>{const el=document.getElementById('interlude');el.hidden=false;el.innerHTML='';const C=NP.content,d=Object.assign({},C.interludes[${(arg || 3) - 1}]);
    d.memo=Object.assign({},d.memo,{body:d.memo.body.replace('{pct}',62)});d.issues=[{id:'BUG-0042',text:'Teddy bear arrived as a bear.',kind:'qa'}];
    window.__il=NP.interlude.play(el,d,{reduced:false});return 1})()`);
  if (what === 'end') { await b.evaluate(`(()=>{document.getElementById('interlude').hidden=true;const el=document.getElementById('epilogue');el.hidden=false;window.__ep=NP.epilogue.play(el,{pct:${+(process.argv.find((a) => a.startsWith('--pct=')) || '--pct=62').slice(6)},pileCount:14,adoption:112,reduced:document.documentElement.classList.contains('reduced')});return 1})()`); for (let i = 0; i < (arg || 2) - 2; i++) { await sleep(1200); await b.evaluate('__ep.next();1'); } }
  if (what === 'floor') for (let i = 0; i < 2; i++) { await sleep(2000); await b.evaluate('__il.next();1'); }      // past the memo and the patch notes, to the issues; the floor is next
}
await sleep(1500);                                   // pictures in, first paint done

// Edge sends each frame it paints, with the time it painted it (a screencast): what the eye would have been shown, in order
const shots = [];
b.on('Page.screencastFrame', (e) => { shots.push([e.metadata.timestamp * 1000, e.data]); b.send('Page.screencastFrameAck', { sessionId: e.sessionId }).catch(() => {}); });
await b.send('Page.startScreencast', { format: 'jpeg', quality: 82, everyNthFrame: 1 });
await sleep(200);
let mark;
if (play) {
  // wait for the scene to come round by itself (up to a minute), and count time from the moment it does
  for (const w0 = Date.now(); Date.now() - w0 < 60000;) { mark = JSON.parse(await b.evaluate(`JSON.stringify(document.querySelector('#intro .in-scene.in-s${arg || 2}') ? Date.now() : 0)`)); if (mark) break; await sleep(15); }
} else mark = JSON.parse(await b.evaluate(`(()=>{${start};return JSON.stringify(Date.now())})()`));
const t0 = Date.now(), todo = later.slice();
while (Date.now() - t0 < dur) {
  if (todo.length && Date.now() - t0 >= todo[0][0]) await b.evaluate(`(()=>{${todo.shift()[1]};return 1})()`);
  await sleep(10);
}
await b.send('Page.stopScreencast');
const every = +(process.argv.find((a) => a.startsWith('--every=')) || '--every=1').slice(8);       // --every=2 keeps one frame in two
const opt = (n, d) => +(process.argv.find((a) => a.startsWith('--' + n + '=')) || '--' + n + '=' + d).split('=')[1];     // --from=ms --to=ms: only that stretch
const frames = shots.map(([ts, d]) => [Math.round(ts - mark), d]).filter(([t]) => t >= opt('from', -40) && t <= opt('to', 1e9)).filter((f, i) => i % every === 0);
// one sheet: every frame in order, cut down to the patch that matters
const zoom = opt('zoom', 0.5), fw = clip[2] * zoom, fh = clip[3] * zoom, cols = Math.max(2, Math.min(12, Math.floor(1900 / (fw + 2))));       // --zoom=1: frames at full size
const html = '<body style="margin:0;background:#111;font:11px monospace;color:#ff0"><div style="display:grid;grid-template-columns:repeat(' + cols + ',' + fw + 'px);gap:2px">' +
  frames.map(([t, d]) => '<div style="position:relative;width:' + fw + 'px;height:' + fh + 'px;overflow:hidden"><img src="data:image/jpeg;base64,' + d + '" style="position:absolute;left:' + -clip[0] * zoom + 'px;top:' + -clip[1] * zoom +
    'px;width:' + 800 * zoom + 'px;height:' + 600 * zoom + 'px"><span style="position:absolute;left:3px;top:2px;background:#000a">' + t + '</span></div>').join('') + '</div></body>';
const rows = Math.ceil(frames.length / cols), W = cols * (fw + 2), H = rows * (fh + 2);
await b.setViewport({ width: Math.ceil(W), height: Math.ceil(H) });
writeFileSync(join(out, what + '.html'), html);
await b.navigate(pathToFileURL(join(out, what + '.html')).href);
await sleep(500);
const file = join(out, what + '.png');
await b.screenshot(file);
await b.close();
const gaps = frames.slice(1).map((f, i) => f[0] - frames[i][0]);
console.log(`${file}: ${frames.length} frames over ${dur} ms, ${Math.round(gaps.reduce((a, c) => a + c, 0) / gaps.length)} ms apart on average` + (errs.length ? '\nPAGE ERRORS:\n' + errs.slice(0, 8).join('\n') : ''));
writeFileSync(join(out, what + '.txt'), frames.map((f) => f[0]).join(' '));
process.exit(0);
