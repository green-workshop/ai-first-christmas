// Debug: which elements of the game screen cover a point?   node hd/tools/whatsat.mjs <x> <y> [--w 1440 --h 860]
// PowerShell only (Edge). Opens the HD build, starts a shift, rejects one gift, and lists every element whose box contains the point.
import { launch } from '../../prototype/tests/cdp.mjs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const root = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2), opt = (n, d) => { const i = args.indexOf('--' + n); return i >= 0 ? args[i + 1] : d; };
const X = +args[0], Y = +args[1];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await launch({ width: +opt('w', 1440), height: +opt('h', 860) });
const phase = () => b.evaluate('window.__game.state().phase');
const until = async (fn, ms = 20000) => { const end = Date.now() + ms; while (Date.now() < end) { if (await fn()) return true; await sleep(60); } return false; };
await b.navigate(`${pathToFileURL(join(root, '..', 'index.html')).href}?seed=7&fresh=1&skipintro=1&untimed=1`);
await sleep(900);
await b.clickSelector('#btnStart'); await sleep(700);
await b.clickSelector('#btnBriefingGo');
await until(async () => (await phase()) === 'preview');
await sleep(500); await b.key('ArrowLeft');
await until(async () => (await phase()) === 'belt'); await sleep(900);
await b.key('ArrowRight'); await sleep(1900);
const r = await b.evaluate(`(() => { const out = []; for (const e of document.querySelectorAll('body *')) { const r = e.getBoundingClientRect(); if (!r.width || !r.height || r.width > 160 || r.height > 160) continue;
  if (${X} >= r.left && ${X} <= r.right && ${Y} >= r.top && ${Y} <= r.bottom) { const cs = getComputedStyle(e); out.push(e.tagName + '.' + (e.getAttribute('class') || '') + '#' + (e.id || '') + ' ' + Math.round(r.left) + ',' + Math.round(r.top) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height) + ' op=' + cs.opacity + ' filter=' + cs.filter + ' parent=' + (e.parentElement.getAttribute('class') || e.parentElement.tagName) + ' ' + (e.getAttribute('fill') || '') + ' ' + (e.getAttribute('href') || '').slice(-30)); } } return out.join('\\n'); })()`);
console.log(r || 'nothing small covers that point');
await b.close(); process.exit(0);
