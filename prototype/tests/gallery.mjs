// Art-review gallery: plays one shift with real key presses and saves a still of every screen and scene.
// Usage (PowerShell, not the sandboxed Bash tool): node prototype/tests/gallery.mjs [--view desktop|phone|both] [--out dir] [--slice path] [--only title,intro,game,interlude,epilogue,report]
import { launch } from './cdp.mjs';
import { mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 ? process.argv[i + 1] : d; };
const SLICE = resolve(arg('slice', join(root, '..', 'slice.html')));
const OUT = resolve(arg('out', join(root, 'out', 'gallery')));
const ONLY = arg('only', '').split(',').filter(Boolean);
const want = (k) => !ONLY.length || ONLY.includes(k);
const VIEWS = { desktop: { width: 1280, height: 800 }, phone: { width: 390, height: 844, mobile: true, deviceScaleFactor: 2 } };
const views = arg('view', 'both') === 'both' ? ['desktop', 'phone'] : [arg('view')];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
mkdirSync(OUT, { recursive: true });

async function run(view) {
  const v = VIEWS[view];
  const b = await launch({ width: v.width, height: v.height });
  const errs = [];
  b.on('Runtime.exceptionThrown', (e) => errs.push(e.exceptionDetails?.exception?.description || e.exceptionDetails?.text));
  if (v.mobile) {
    await b.setViewport(v);
    await b.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 }).catch(() => {});
  }
  let n = 0;
  const shot = async (name) => { await b.screenshot(join(OUT, `${view}-${String(++n).padStart(2, '0')}-${name}.png`)); };
  const phase = () => b.evaluate('window.__game.state().phase');
  const until = async (fn, ms = 60000) => { const end = Date.now() + ms; while (Date.now() < end) { if (await fn()) return true; await sleep(80); } return false; };
  const press = (sel) => (v.mobile ? b.tapSelector(sel) : b.clickSelector(sel));

  await b.navigate(`${pathToFileURL(SLICE).href}?seed=7&fresh=1`);
  await sleep(1200);
  if (want('title')) await shot('title');
  await press('#btnStart');

  // Intro: two stills per scene (early and late), then on to the next
  await until(async () => (await phase()) === 'intro');
  const scenes = await b.evaluate('NP.intro.scenes');
  const durs = [2000, 12000, 9000, 5000, 12000, 6000, 8000, 12000, 3000];
  for (let i = 1; i <= scenes; i++) {
    const st = () => b.evaluate('NP.intro._cur ? NP.intro._cur._state() : null');
    await until(async () => { const s = await st(); return !s || s.scene >= i; }, 20000);
    if (want('intro')) {
      const d = durs[i - 1] || 6000;
      for (const [tag, frac] of [['a', 0.35], ['b', 0.86]]) {
        await until(async () => { const s = await st(); return !s || s.scene !== i || s.t >= d * frac; }, 15000);
        const s = await st();
        if (s && s.scene === i) await shot(`intro${i}${tag}`);
      }
    }
    if (i < scenes) { const s = await st(); if (s && s.scene === i) await b.key('Space'); }
  }
  await until(async () => (await phase()) !== 'intro', 20000);
  await sleep(700);
  if (want('game')) await shot('briefing');
  await press('#btnBriefingGo');

  // The shift: reject the first gift of each round once, pack everything else
  let lastChild = -1, interludes = 0, montage = false;
  const end = Date.now() + 12 * 60000;
  while (Date.now() < end) {
    const s = await b.evaluate('(function(){var s=window.__game.state();return {phase:s.phase,round:s.round,child:s.child,rej:s.rejectsThisChild,auto:!!s.automated,n:s.outcomes.length}})()');
    if (s.phase === 'report') break;
    if (s.phase === 'preview') {
      if (s.n !== lastChild && want('game') && (s.n === 0 || s.n === 13)) { await sleep(500); await shot(`preview-child${s.n + 1}`); }
      await b.key('ArrowLeft'); await sleep(120);
    } else if (s.phase === 'belt' && !s.auto) {
      const first = s.n !== lastChild; lastChild = s.n;
      await sleep(650);
      if (want('game') && first && [0, 1, 5, 9, 13, 17].includes(s.n)) await shot(`belt-child${s.n + 1}`);
      if (first && s.n % 4 < 2 && s.rej === 0) {
        await b.key('ArrowRight');
        if (want('game') && [0, 9, 17].includes(s.n)) { await sleep(450); await shot(`reject-child${s.n + 1}-a`); await sleep(1300); await shot(`reject-child${s.n + 1}-b`); }
        await until(async () => (await phase()) === 'belt', 8000);
        await sleep(500);
        if (want('game') && [0, 17].includes(s.n)) await shot(`rework-child${s.n + 1}`);
      }
      await b.key('ArrowLeft');
      if (want('game') && [0, 9, 17].includes(s.n)) { await sleep(380); await shot(`pack-child${s.n + 1}`); }
      await sleep(200);
    } else if ((s.phase === 'belt' || s.phase === 'montage') && s.auto) {
      if (!montage && want('game')) { montage = true; await sleep(900); await shot('montage'); }
      await sleep(300);
    } else if (s.phase === 'interlude') {
      interludes++;
      for (let beat = 1; beat <= 4; beat++) {
        await sleep(2600);
        if ((await phase()) !== 'interlude') break;
        if (want('interlude')) await shot(`interlude${interludes}-beat${beat}`);
        await b.key('Space');
        await sleep(300);
      }
      await until(async () => (await phase()) !== 'interlude', 6000);
    } else if (s.phase === 'epilogue') {
      for (let sc = 1; sc <= 5; sc++) {
        await sleep(3800);
        if ((await phase()) !== 'epilogue') break;
        if (want('epilogue')) await shot(`epilogue${sc}`);
        await b.key('Space');
        await sleep(500);
      }
      await until(async () => (await phase()) !== 'epilogue', 15000);
    } else await sleep(150);
  }
  await sleep(1500);
  if (want('report')) await shot('report');
  await b.close();
  console.log(`${view}: ${n} stills` + (errs.length ? `\nPAGE ERRORS:\n${errs.slice(0, 8).join('\n')}` : ''));
}

for (const view of views) await run(view);
console.log('gallery in ' + OUT);
process.exit(0);
