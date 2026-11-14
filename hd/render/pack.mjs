// Turns the PNG masters in out/final into the WebP files the game loads, in ../assets.   node pack.mjs [word ...] [--force]
// PowerShell only (it uses Edge's encoder).
import { launch } from '../../prototype/tests/cdp.mjs';
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const args = process.argv.slice(2), force = args.includes('--force'), words = args.filter((a) => !a.startsWith('--'));
// --draft packs the quick drafts instead of the finals (for trying the game before the long renders are done)
const here = dirname(fileURLToPath(import.meta.url)), src = join(here, 'out', args.includes('--draft') ? 'draft' : 'final'), dst = join(here, '..', 'assets');
// name prefix -> [folder, longest side in px (0 = as rendered), quality]
const RULES = [['plate-', 'plates', 0, 0.86], ['fc-', 'fc', 0, 0.84], ['gift-', 'gifts', 384, 0.86], ['prop-', 'props', 0, 0.86], ['set-', 'sets', 0, 0.86], ['cut-', 'cuts', 0, 0.85], ['ui-', 'ui', 0, 0.9]];
const b = await launch({ width: 400, height: 300 });
let n = 0, bytes = 0;
for (const f of readdirSync(src).filter((x) => x.endsWith('.png')).sort()) {
  const name = f.slice(0, -4); const rule = RULES.find((r) => name.startsWith(r[0]));
  if (!rule || (words.length && !words.some((w) => name.includes(w)))) continue;
  if (/-(solo\d+|cut)$/.test(name)) continue;         // a prop photographed to be cut out: only its cut-out is used (cutouts.mjs), not the picture
  if (name === 'cut-x8-nosacks' || name === 'cut-x8-nofc') continue;   // patches: only used inside intro-8a0 and intro-8w (MADE, below)
  const out = join(dst, rule[1], name.slice(rule[0].length) + '.webp');
  if (!force && existsSync(out) && statSync(out).mtimeMs > statSync(join(src, f)).mtimeMs) { bytes += statSync(out).size; continue; }
  const data = readFileSync(join(src, f)).toString('base64');
  const r = await b.evaluate(`(async () => { const im = new Image(); im.src = 'data:image/png;base64,${data}'; await im.decode();
    const k = ${rule[2]} ? Math.min(1, ${rule[2]} / Math.max(im.width, im.height)) : 1, c = document.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
    const x = c.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(im, 0, 0, c.width, c.height);
    const bl = await new Promise((res) => c.toBlob(res, 'image/webp', ${rule[3]})); const u = new Uint8Array(await bl.arrayBuffer());
    let s = ''; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); })()`, { timeoutMs: 120000 });
  mkdirSync(dirname(out), { recursive: true }); const buf = Buffer.from(r, 'base64'); writeFileSync(out, buf); n++; bytes += buf.length;
  console.log(`${rule[1]}/${name.slice(rule[0].length)}.webp  ${(buf.length / 1024).toFixed(0)} KB`);
}
// Stills made from two masters: a patch laid into a still, its top and right edges feathered so no line shows.
// intro-8a0 is the cellar before any sack has dropped: intro-8a with the empty corner (x8-nosacks) over its sacks.
// intro-8w is the cellar with nobody on the stairs (x8-nofc); intro-3s the edict with no stamp on it: 3a, with the part of the
// scroll the stamp sits on taken from 3b, where the stamp has been put down (crop: that part of the patch picture only).
// sides: which edges of the patch fade out (t, r, b, l); an edge at the frame's own edge needs none.
const MADE = [{ out: 'cuts/intro-8a0', base: 'cut-intro-8a', patch: 'cut-x8-nosacks', at: [0, 500], feather: 24, sides: 'tr' },
  { out: 'cuts/intro-8w', base: 'cut-intro-8a', patch: 'cut-x8-nofc', at: [960, 0], feather: 24, sides: 'lb' },
  { out: 'cuts/intro-3s', base: 'cut-intro-3a', patch: 'cut-intro-3b', crop: [620, 610, 420, 300], at: [620, 610], feather: 20, sides: 'trbl' }];
for (const m of MADE) {
  const fb = join(src, m.base + '.png'), fp = join(src, m.patch + '.png'), out = join(dst, m.out + '.webp');
  if (!existsSync(fb) || !existsSync(fp)) continue;
  if (words.length && !words.some((w) => m.base.includes(w) || m.patch.includes(w) || m.out.includes(w))) continue;
  await b.evaluate(`window.__a = '${readFileSync(fb).toString('base64')}'; 0`, { timeoutMs: 120000 });
  await b.evaluate(`window.__b = '${readFileSync(fp).toString('base64')}'; 0`, { timeoutMs: 120000 });
  const r = await b.evaluate(`(async () => { const load = async (d) => { const im = new Image(); im.src = 'data:image/png;base64,' + d; await im.decode(); return im; };
    const A = await load(window.__a), B = await load(window.__b), c = document.createElement('canvas'); c.width = A.width; c.height = A.height;
    const x = c.getContext('2d'); x.drawImage(A, 0, 0);
    const K = ${JSON.stringify(m.crop || null)}, pw = K ? K[2] : B.width, ph = K ? K[3] : B.height;
    const p = document.createElement('canvas'); p.width = pw; p.height = ph; const q = p.getContext('2d'); q.drawImage(B, K ? -K[0] : 0, K ? -K[1] : 0);
    const F = ${m.feather}, S = '${m.sides || 'tr'}'; q.globalCompositeOperation = 'destination-in';
    const fade = (x0, y0, x1, y1) => { const g = q.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, '#000'); q.fillStyle = g; q.fillRect(0, 0, pw, ph); };
    if (S.includes('t')) fade(0, 0, 0, F);
    if (S.includes('b')) fade(0, ph, 0, ph - F);
    if (S.includes('l')) fade(0, 0, F, 0);
    if (S.includes('r')) fade(pw, 0, pw - F, 0);
    x.drawImage(p, ${m.at[0]}, ${m.at[1]});
    const bl = await new Promise((res) => c.toBlob(res, 'image/webp', 0.85)); const u = new Uint8Array(await bl.arrayBuffer());
    let s = ''; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); })()`, { timeoutMs: 180000 });
  const buf = Buffer.from(r, 'base64'); writeFileSync(out, buf); n++; bytes += buf.length;
  console.log(`${m.out}.webp  ${(buf.length / 1024).toFixed(0)} KB  (made from ${m.base} and ${m.patch})`);
}
await b.close(); console.log(`${n} packed; assets total ${(bytes / 1048576).toFixed(1)} MB`); process.exit(0);
