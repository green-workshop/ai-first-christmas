// Which of Father Christmas's frames are on show, and how strongly, at every frame the page draws while he reacts.
//   node hd/tools/probe.mjs [right|wrong] [seconds]      PowerShell only (Edge)
// He is made to react at uneven times, so some reactions start at rest, some part way through a breath and some in a blink:
// a move must look the same from all of them. For each reaction it prints the frames on show every 16 ms or so from the
// key press to 800 ms after, and at the end a verdict: the longest time a frame of his REST (idle, breathe, blink) stayed
// more than a fifth visible after a move began. Anything much over 100 ms means the move played under a resting frame.
import { launch } from '../../prototype/tests/cdp.mjs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const root = dirname(fileURLToPath(import.meta.url)), kind = process.argv[2] === 'wrong' ? 'false' : 'true', secs = +process.argv[3] || 30;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await launch({ width: 800, height: 600 });
await b.navigate(`${pathToFileURL(join(root, '..', 'index.html')).href}?seed=7&fresh=1&skipintro=1&untimed=1`);
await sleep(800);
await b.evaluate(`(()=>{const d=document.createElement('div');d.style.cssText='position:fixed;left:0;top:0;width:800px;height:600px;z-index:99999;background:#0c1022;overflow:hidden';
  const i=document.createElement('div');i.style.cssText='position:absolute;left:0;right:0;bottom:0;height:560px';d.appendChild(i);document.body.appendChild(d);
  window.__bay=NP.scene.mountDesk(i);window.__log=[];window.__marks=[];
  (function tick(t){const on=[...i.querySelectorAll('.hd-fc')].map(e=>[e.getAttribute('data-f'),+getComputedStyle(e).opacity]).filter(x=>x[1]>0.05);
    const h=i.querySelector('.sc-held'),hi=i.querySelector('.sc-held-in');
    __log.push([Math.round(t),on.map(x=>x[0]+':'+x[1].toFixed(2)).join(' '),h&&hi?+getComputedStyle(h).opacity*+getComputedStyle(hi).opacity:0]);requestAnimationFrame(tick)})(performance.now());return 1})()`);
await sleep(2500);
// uneven gaps: a reaction lasts about 2.9 s (right) or 3.3 s (wrong), his breath about 4.5 s
const gaps = [3700, 4300, 5100, 3900, 4700, 5600, 4100, 4900];
const t0 = Date.now(); let n = 0;
while (Date.now() - t0 < secs * 1000) {
  await b.evaluate(`(()=>{__marks.push(Math.round(performance.now()));__bay.pileAdd({icon:'teddy'});__bay.react(${kind});return 1})()`);
  await sleep(gaps[n++ % gaps.length]);
}
const { log, marks } = JSON.parse(await b.evaluate('JSON.stringify({log:__log,marks:__marks})'));
await b.close();
let worst = 0, dropped = 0;
for (const m of marks) {
  console.log(`\nreaction at ${m}`);
  let moved = 0, rest = 0;
  for (const [t, s] of log) {
    if (t < m - 20 || t > m + 800) continue;
    console.log(`  +${String(t - m).padStart(4)}  ${s}`);
    const names = s.split(' ').map((x) => x.split(':'));
    const move = names.some(([f, o]) => !/^(idle|breathe|blink1?)-/.test(f) && +o > 0.5);
    if (move && !moved) moved = t;
    if (moved && names.some(([f, o]) => /^(idle|breathe|blink1?)-/.test(f) && +o > 0.2)) rest = t - moved;
  }
  console.log(`  a resting frame stayed over the move for ${rest} ms`);
  worst = Math.max(worst, rest);
  // a good gift rejected: he holds it up, and it must still be in his hand a second later (it once vanished on every such
  // reaction after the first: an animation from the last time he put one down was left running)
  if (kind === 'true') {
    const at = log.find((x) => x[0] >= m + 1200), seen = at ? at[2] : 0;
    console.log(`  the gift in his raised hand, 1.2 s in: ${seen > 0.9 ? 'there' : 'MISSING (opacity ' + seen + ')'}`);
    if (!(seen > 0.9)) dropped++;
  }
}
console.log(`\n${marks.length} reactions; the longest a resting frame lay over a move: ${worst} ms ${worst > 120 ? '(TOO LONG)' : '(fine)'}` +
  (kind === 'true' ? `; the held gift went missing in ${dropped} of them ${dropped ? '(FAULT)' : '(fine)'}` : ''));
process.exit(0);
