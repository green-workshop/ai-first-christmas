// Stills of the interlude in the HD build, for art review.   node hd/tools/ilshot.mjs <outDir> [--phone] [--w 1920 --h 940] [--beat 3]
// PowerShell only (Edge). Saves each of four workshop-floor states, or with --beat 0..2 the memo, the screen or the issues board.
import { launch } from '../../prototype/tests/cdp.mjs';
import { mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const root = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2), flag = (n) => args.includes('--' + n), opt = (n, d) => { const i = args.indexOf('--' + n); return i >= 0 ? args[i + 1] : d; };
const out = resolve(args.find((a, i) => !a.startsWith('--') && !(i && args[i - 1].startsWith('--') && !['--phone'].includes(args[i - 1]))) || join(root, '..', 'render', 'out', 'ilshot'));
const phone = flag('phone'), beat = +opt('beat', 3), tag = opt('tag', phone ? 'phone' : 'desktop');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
mkdirSync(out, { recursive: true });
const b = await launch(phone ? { width: 390, height: 844 } : { width: +opt('w', 1280), height: +opt('h', 800) });
const errs = [];
b.on('Runtime.exceptionThrown', (e) => errs.push(e.exceptionDetails?.exception?.description || e.exceptionDetails?.text));
if (phone) await b.setViewport({ width: 390, height: 844, mobile: true, deviceScaleFactor: 2 });
await b.navigate(`${pathToFileURL(join(root, '..', 'index.html')).href}?seed=7&fresh=1&skipintro=1&untimed=1`);
await sleep(900);
const FLOORS = {
  full: '{benches:8,present:8,leaving:0,reindeer:"present",caption:"Eight elves at eight benches."}',
  leave: '{benches:8,present:5,leaving:3,reindeer:"present",caption:"Three elves are let go."}',
  bots: '{benches:8,present:2,leaving:3,bots:6,reindeer:"leaving",drones:true,caption:"The robots arrive."}',
  fix: '{benches:8,present:0,leaving:0,bots:8,contractors:6,reindeer:"gone",drones:true,caption:"The elves are back, as contractors."}',
};
const issues = '[{kind:"qa",id:"BUG-1",text:"Sent a football to a child who asked for a book. Status: Won\'t fix."},{kind:"return",id:"RET-2",text:"Teddy arrived as a grizzly bear."}]';
for (const [name, floor] of Object.entries(beat === 3 ? FLOORS : { one: FLOORS.full })) {
  await b.evaluate(`(()=>{document.getElementById('screen-title').hidden=true;const el=document.getElementById('interlude');el.hidden=false;
    window.__il=NP.interlude.play(el,{memo:{title:'AI-first, effective immediately',body:'The board has reviewed the numbers and is delighted.',footer:'APPROVED'},patch:{version:'v1.1',fixed:['Stopped sending socks to everyone.']},issues:${issues},boardLine:'Delighted.',floor:${floor}},{});return 1})()`);
  for (let i = 0; i < beat; i++) { await sleep(520); await b.evaluate('__il.next();1'); }
  await sleep(1300);
  await b.screenshot(join(out, `${tag}-${beat === 3 ? name : 'beat' + beat}.png`));
  if (beat === 3 && (name === 'leave' || name === 'bots')) { await sleep(2600); await b.screenshot(join(out, `${tag}-${name}-later.png`)); }
  await b.evaluate('__il.skip();document.getElementById("interlude").innerHTML="";1');
}
await b.close();
console.log('stills in ' + out + (errs.length ? '\nPAGE ERRORS:\n' + errs.slice(0, 8).join('\n') : ''));
process.exit(0);
