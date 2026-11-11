// Quick stills of the game screen for art review: node prototype/tests/shot.mjs <outDir> [--phone] [--slice path] [--rejects N] [--round N]
// Skips the intro, rejects N gifts (default 1), and saves the belt, the rework and the pack. PowerShell only (Edge).
import { launch } from './cdp.mjs';
import { mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const root = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2), flag = (n) => args.includes('--' + n), opt = (n, d) => { const i = args.indexOf('--' + n); return i >= 0 ? args[i + 1] : d; };
const out = resolve(args.find((a) => !a.startsWith('--')) || join(root, 'out', 'shot'));
const slice = resolve(opt('slice', join(root, '..', 'slice.html'))), phone = flag('phone'), rejects = +opt('rejects', 1), tag = opt('tag', phone ? 'phone' : 'desktop');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
mkdirSync(out, { recursive: true });
const b = await launch(phone ? { width: 390, height: 844 } : { width: +opt('w', 1280), height: +opt('h', 800) });
const errs = [];
b.on('Runtime.exceptionThrown', (e) => errs.push(e.exceptionDetails?.exception?.description || e.exceptionDetails?.text));
if (phone) { await b.setViewport({ width: 390, height: 844, mobile: true, deviceScaleFactor: 2 }); await b.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 }).catch(() => {}); }
const phase = () => b.evaluate('window.__game.state().phase');
const until = async (fn, ms = 20000) => { const end = Date.now() + ms; while (Date.now() < end) { if (await fn()) return true; await sleep(60); } return false; };
const press = (sel) => (phone ? b.tapSelector(sel) : b.clickSelector(sel));
await b.navigate(`${pathToFileURL(slice).href}?seed=7&fresh=1&skipintro=1&untimed=1`);
await sleep(900);
await b.screenshot(join(out, `${tag}-0-title.png`));
await press('#btnStart'); await sleep(700);
await press('#btnBriefingGo');
await until(async () => (await phase()) === 'preview');
await sleep(500); await b.key('ArrowLeft');
await until(async () => (await phase()) === 'belt'); await sleep(900);
await b.screenshot(join(out, `${tag}-1-belt.png`));
for (let i = 0; i < rejects; i++) {
  await b.key('ArrowRight'); await sleep(1900);
  await b.screenshot(join(out, `${tag}-2-reject${i + 1}.png`));
  await until(async () => (await phase()) === 'belt', 9000); await sleep(700);
}
await b.screenshot(join(out, `${tag}-3-rework.png`));
await b.key('ArrowLeft'); await sleep(420);
await b.screenshot(join(out, `${tag}-4-pack.png`));
await b.close();
console.log('stills in ' + out + (errs.length ? '\nPAGE ERRORS:\n' + errs.slice(0, 8).join('\n') : ''));
process.exit(0);
