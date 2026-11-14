// Cuts each puppet out of a finished film still, using the matte from mattes.mjs, so the films can move them a little
// (breathing, a bob when they speak) over the still they came from.
//   node cutouts.mjs [word ...]      PowerShell only (it uses Edge's canvas and encoder)
// out/final/cut-<still>.png + out/matte/<still>.png  ->  ../assets/cuts/<still>.<who>.webp  and  ../assets/cuts/pups.json
// who = fc0, elf0, board0..4, droid0: numbered from screen left within each kind. pups.json lists each one's box in the still.
import { launch } from '../../prototype/tests/cdp.mjs';
import { readdirSync, readFileSync, writeFileSync, existsSync, unlinkSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url)), words = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const mdir = join(here, 'out', 'matte'), fdir = join(here, 'out', 'final'), dst = join(here, '..', 'assets', 'cuts'), listFile = join(dst, 'pups.json');
const pups = existsSync(listFile) ? JSON.parse(readFileSync(listFile, 'utf8')) : {};
const b = await launch({ width: 400, height: 300 });

// in the page: find the separate puppets in the matte, and for each one return its box, its kind and the cut-out picture
const WORK = `(async () => {
  const load = async (d) => { const im = new Image(); im.src = 'data:image/png;base64,' + d; await im.decode(); return im; };
  const still = await load(window.__still), matte = await load(window.__matte), W = still.width, H = still.height;
  const cv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const mc = cv(W, H), mx = mc.getContext('2d'); mx.drawImage(matte, 0, 0, W, H); const M = mx.getImageData(0, 0, W, H).data;
  // label connected patches of matte on a grid of 4 px cells
  const S = 4, gw = Math.ceil(W / S), gh = Math.ceil(H / S), on = new Uint8Array(gw * gh), lab = new Int32Array(gw * gh);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (M[(y * W + x) * 4 + 3] > 110) on[(y >> 2) * gw + (x >> 2)] = 1;
  const parts = [];
  for (let i = 0; i < on.length; i++) {
    if (!on[i] || lab[i]) continue;
    const id = parts.length + 1, q = [i]; lab[i] = id; let n = 0, x0 = gw, y0 = gh, x1 = 0, y1 = 0;
    while (q.length) {
      const c = q.pop(), cx = c % gw, cy = (c - cx) / gw; n++;
      if (cx < x0) x0 = cx; if (cx > x1) x1 = cx; if (cy < y0) y0 = cy; if (cy > y1) y1 = cy;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const nx = cx + dx, ny = cy + dy; if (nx < 0 || ny < 0 || nx >= gw || ny >= gh) continue;
        const k = ny * gw + nx; if (on[k] && !lab[k]) { lab[k] = id; q.push(k); }
      }
    }
    parts.push({ id, n, x0, y0, x1, y1 });
  }
  const out = [];
  for (const p of parts) {
    if (p.n < 90) continue;                                             // specks (under about 1400 px)
    const x = Math.max(0, p.x0 * S - 6), y = Math.max(0, p.y0 * S - 6), w = Math.min(W, (p.x1 + 1) * S + 6) - x, h = Math.min(H, (p.y1 + 1) * S + 6) - y;
    const c = cv(w, h), cx = c.getContext('2d'); cx.drawImage(still, -x, -y);
    const im = cx.getImageData(0, 0, w, h), D = im.data; let r = 0, g = 0, bl = 0;
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const X = x + i, Y = y + j, m = (Y * W + X) * 4, L = lab[(Y >> 2) * gw + (X >> 2)];
      const a = L && L !== p.id ? 0 : M[m + 3];                         // not a neighbour's arm that reaches into this box
      D[(j * w + i) * 4 + 3] = a;
      if (a > 200) { r += M[m]; g += M[m + 1]; bl += M[m + 2]; }
    }
    cx.putImageData(im, 0, 0);
    const kind = Math.min(r, g, bl) > 0.7 * Math.max(r, g, bl) ? 'prop' : bl > r && bl > g ? 'board' : g > r * 1.5 ? 'elf' : r > g * 1.5 ? 'fc' : 'droid';
    const blob = await new Promise((res) => c.toBlob(res, 'image/webp', 0.88)), u = new Uint8Array(await blob.arrayBuffer());
    let s = ''; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000));
    out.push({ kind, x, y, w, h, data: btoa(s) });
  }
  return JSON.stringify(out);
})()`;

let n = 0;
for (const f of readdirSync(mdir).filter((x) => x.endsWith('.png')).sort()) {
  const name = f.slice(0, -4);
  if (words.length && !words.some((w) => name.includes(w))) continue;
  const still = join(fdir, 'cut-' + name + '.png');
  if (!existsSync(still)) { console.error(name + ': no finished still'); continue; }
  await b.evaluate(`window.__still = '${readFileSync(still).toString('base64')}'; 0`, { timeoutMs: 120000 });
  await b.evaluate(`window.__matte = '${readFileSync(join(mdir, f)).toString('base64')}'; 0`, { timeoutMs: 120000 });
  const found = JSON.parse(await b.evaluate(WORK, { timeoutMs: 180000 }));
  // clear this still's old cut-outs (<still>.<who>.webp), never the still itself (<still>.webp)
  for (const old of readdirSync(dst).filter((x) => x.startsWith(name + '.') && x.endsWith('.webp') && x !== name + '.webp')) unlinkSync(join(dst, old));
  const count = {}, list = [];
  for (const p of found.sort((a, z) => a.x + a.w / 2 - (z.x + z.w / 2))) {
    count[p.kind] = (count[p.kind] || 0) + 1;
    const id = p.kind + (count[p.kind] - 1);
    writeFileSync(join(dst, name + '.' + id + '.webp'), Buffer.from(p.data, 'base64')); n++;
    list.push([id, p.x, p.y, p.w, p.h]);
  }
  pups[name] = list;
  console.log(name + ': ' + (list.map((l) => l[0] + ' ' + l[3] + 'x' + l[4]).join(', ') || 'no puppets'));
}
writeFileSync(listFile, JSON.stringify(pups, null, 1));
await b.close();
console.log(n + ' cut-outs written');
process.exit(0);
