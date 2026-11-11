// Fast art-review stills of the cutscenes, by calling each player directly (no playthrough).
// Usage (PowerShell, not the sandboxed Bash tool):
//   node prototype/tests/cuts.mjs <outDir> [--only intro,interlude,epilogue,title] [--scene N] [--view desktop|phone|both] [--reduced] [--slice path]
// --scene N limits the intro to scene N (1-9), the interludes to interlude N (1-5) and the closing film to scene N (1-5).
import { launch } from './cdp.mjs';
import { mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const root = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2), flag = (n) => args.includes('--' + n), opt = (n, d) => { const i = args.indexOf('--' + n); return i >= 0 ? args[i + 1] : d; };
const out = resolve(args.find((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1].startsWith('--') && !['--reduced'].includes(args[i - 1]))) || join(root, 'out', 'cuts'));
const slice = resolve(opt('slice', join(root, '..', 'slice.html'))), only = opt('only', 'intro,interlude,epilogue').split(','), one = +opt('scene', 0), reduced = flag('reduced');
const views = opt('view', 'both') === 'both' ? ['desktop', 'phone'] : [opt('view')];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
mkdirSync(out, { recursive: true });

for (const view of views) {
  const phone = view === 'phone';
  const b = await launch(phone ? { width: 390, height: 844 } : { width: +opt('w', 1280), height: +opt('h', 800) });
  const errs = [];
  b.on('Runtime.exceptionThrown', (e) => errs.push(e.exceptionDetails?.exception?.description || e.exceptionDetails?.text));
  if (phone) { await b.setViewport({ width: 390, height: 844, mobile: true, deviceScaleFactor: 2 }); await b.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 }).catch(() => {}); }
  await b.navigate(`${pathToFileURL(slice).href}?seed=7&fresh=1${reduced ? '&reduced=1' : ''}`);
  await sleep(900);
  const shot = (name) => b.screenshot(join(out, `${view}-${name}${reduced ? '-reduced' : ''}.png`));
  if (only.includes('title')) await shot('title');
  // leave the title the way the engine does
  await b.evaluate(`(()=>{document.body.classList.remove('on-title');document.getElementById('screen-title').hidden=true;const s=document.getElementById('snow');if(s)s.style.display='none';return 1})()`);

  if (only.includes('intro')) {
    await b.evaluate(`(()=>{const el=document.getElementById('intro');el.hidden=false;window.__ix=NP.intro.play(el,{reduced:${reduced}});return 1})()`);
    const durs = [2000, 12000, 9000, 5000, 12000, 6000, 8000, 12000, 3000];
    for (let i = 1; i <= 9; i++) {
      if (one && one !== i) continue;
      for (const [tag, frac] of reduced ? [['a', 0.9]] : [['a', 0.3], ['b', 0.62], ['c', 0.93]]) {
        await b.evaluate(`(()=>{__ix._seek(${i - 1}, ${Math.round(durs[i - 1] * frac)});return 1})()`);
        await sleep(350);
        await shot(`intro${i}${tag}`);
      }
    }
    await b.evaluate(`(()=>{__ix.skip();document.getElementById('intro').hidden=true;return 1})()`);
  }

  if (only.includes('interlude')) {
    for (let n = 1; n <= 5; n++) {
      if (one && one !== n) continue;
      await b.evaluate(`(()=>{const el=document.getElementById('interlude');el.hidden=false;el.innerHTML='';const C=NP.content,d=Object.assign({},C.interludes[${n - 1}]);
        d.memo=Object.assign({},d.memo,{body:d.memo.body.replace('{pct}',62)});
        d.issues=[{id:'BUG-0042',text:'Teddy bear arrived as a bear.',kind:'qa'},{id:'RET-0007',text:'Socks: 4,000 pairs. One child.',kind:'return'},{id:'BUG-0043',text:'Castle is life-size.',kind:'qa'},{id:'BUG-0051',text:'Kite is a bird.',kind:'qa'}].slice(0,${n + 1});
        window.__il=NP.interlude.play(el,d,{reduced:${reduced}});return 1})()`);
      for (let beat = 1; beat <= 3; beat++) {
        await sleep(beat === 3 ? 3200 : 2200);
        await shot(`interlude${n}-beat${beat}`);
        await b.evaluate(`(()=>{__il.next();return 1})()`);
        await sleep(250);
      }
      await b.evaluate(`(()=>{__il.skip();const el=document.getElementById('interlude');el.hidden=true;el.innerHTML='';return 1})()`);
    }
  }

  if (only.includes('epilogue')) {
    await b.evaluate(`(()=>{const el=document.getElementById('epilogue');el.hidden=false;window.__ep=NP.epilogue.play(el,{pct:62,pileCount:14,adoption:112,reduced:${reduced}});return 1})()`);
    // E1 and E2 move on by themselves after 5s, so step to each scene by its index and take both stills inside that window
    const cur = () => b.evaluate(`[...document.querySelectorAll('#epilogue .ep-sc')].findIndex((e)=>e.classList.contains('on'))+1`);
    for (let sc = 1; sc <= 5; sc++) {
      for (let g = 0; g < 12 && (await cur()) < sc; g++) { await b.evaluate(`(()=>{__ep.next();return 1})()`); await sleep(400); }
      if (one && one !== sc) continue;
      const timed = sc <= 2 && !reduced;
      await sleep(timed ? 2000 : 3600); await shot(`epilogue${sc}`);
      if (timed && !one) { await sleep(1200); await shot(`epilogue${sc}b`); }
    }
    await b.evaluate(`(()=>{__ep.skip();document.getElementById('epilogue').hidden=true;return 1})()`);
  }
  await b.close();
  if (errs.length) console.log(`${view} PAGE ERRORS:\n` + errs.slice(0, 8).join('\n'));
}
console.log('stills in ' + out);
process.exit(0);
