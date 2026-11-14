// Stills of the closing film's three verdicts (good, middle, bad) in the HD build.   node hd/tools/epshot.mjs <outDir> [--phone] [--all]
// PowerShell only (Edge). --all also saves the other four scenes (from the "good" run).
import { launch } from '../../prototype/tests/cdp.mjs';
import { mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const root = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2), flag = (n) => args.includes('--' + n);
const out = resolve(args.find((a) => !a.startsWith('--')) || join(root, '..', 'render', 'out', 'epshot'));
const phone = flag('phone'), tag = phone ? 'phone' : 'desktop';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
mkdirSync(out, { recursive: true });
const b = await launch(phone ? { width: 390, height: 844 } : { width: 1280, height: 800 });
const errs = [];
b.on('Runtime.exceptionThrown', (e) => errs.push(e.exceptionDetails?.exception?.description || e.exceptionDetails?.text));
if (phone) await b.setViewport({ width: 390, height: 844, mobile: true, deviceScaleFactor: 2 });
await b.navigate(`${pathToFileURL(join(root, '..', 'index.html')).href}?seed=7&fresh=1&skipintro=1&untimed=1`);
await sleep(900);
for (const [name, pct] of [['good', 95], ['mid', 62], ['bad', 20]]) {
  await b.evaluate(`(()=>{document.getElementById('screen-title').hidden=true;const el=document.getElementById('epilogue');el.hidden=false;window.__ep=NP.epilogue.play(el,{pct:${pct},pileCount:14,adoption:112,reduced:false});return 1})()`);
  await sleep(900); await b.evaluate('__ep.next();1'); await sleep(2200);
  await b.screenshot(join(out, `${tag}-verdict-${name}.png`));
  if (flag('all') && name === 'good') {
    for (const sc of ['jobless', 'autumn', 'rehire']) { await sleep(700); await b.evaluate('__ep.next();1'); await sleep(2600); await b.screenshot(join(out, `${tag}-${sc}.png`)); }
  }
  await b.evaluate(`(()=>{__ep.skip();const el=document.getElementById('epilogue');el.innerHTML='';el.hidden=true;return 1})()`);
  await sleep(300);
}
await b.close();
console.log('stills in ' + out + (errs.length ? '\nPAGE ERRORS:\n' + errs.slice(0, 8).join('\n') : ''));
process.exit(0);
