// Every final picture the HD game uses, rendered in one browser session.
//   node shots.mjs                 everything that is missing
//   node shots.mjs gifts fc-       only shots whose name contains one of these words
//   node shots.mjs --force gifts   render again even if the file exists
//   node shots.mjs --list          just list the names
//   node shots.mjs --draft ...     a quarter of the samples, into out/draft (for checking poses and framing)
// Masters go to out/final/<name>.png; pack.mjs turns them into the WebP files the game loads. PowerShell only.
import { open, render } from './darkroom.mjs';
import { existsSync, readdirSync, readFileSync, copyFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));

// which colours each gift is needed in (the plain one is always made)
export const GIFT_HUES = {
  teddy: ['brown'], brickcastle: ['blue'], kite: ['red'], socks: ['red', 'green'], sock: ['red'], scooter: ['red', 'pink', 'blue', 'green'],
  pyjamas: ['green'], jigsaw: ['blue'], helmet: ['purple', 'yellow', 'pink'], giftbox: ['red', 'purple', 'green', 'blue', 'yellow', 'pink', 'brown'], book: ['brown'],
};
const NOT_GIFTS = new Set(['fc', 'elf', 'board', 'droid', 'mitten']);

// Father Christmas at his desk: one cropped frame per pose and frazzle stage. Crop is in pixels of the 1680 x 1200 desk plate.
export const FC_CROP = [720, 360, 732, 636];           // desk units x 160..404, y 20..232
export const FC_FRAMES = [['idle', { POSE: 0 }], ['blink', { POSE: 0, BLINK: 1 }], ['look', { POSE: 1 }], ['scratch', { POSE: 2 }], ['scratch2', { POSE: 2, FRAME: 1 }],
  ['type', { POSE: 3 }], ['type2', { POSE: 3, FRAME: 1 }], ['puzzled', { POSE: 4 }]];   // the engine never asks for the relief pose
// His moves: three in-between frames for each change of pose the game plays (and the lids half way, for the blink), so he moves
// instead of jumping. fc-<from>_<to>_<1..3>-<stage>; the game plays them backwards for the way back. Half size: each is on screen
// for a twentieth of a second.
export const FC_MOVES = [['idle', 'look', 0, 1], ['look', 'scratch', 1, 2], ['scratch', 'type', 2, 3], ['type', 'idle', 3, 0], ['idle', 'puzzled', 0, 4]];
export const FC_TW = [0.16, 0.5, 0.84];                // eased: slow out of the first pose, slow into the second
const FC_HALF = { w: 840, h: 600, crop: FC_CROP.map((v) => v / 2) };

export function shots() {
  const list = [];
  list.push({ name: 'plate-belt', scene: 'scenes/belt.glsl', spp: 360 });
  list.push({ name: 'plate-desk', scene: 'scenes/desk.glsl', spp: 300, defines: { NOFC: 1 } });
  for (let st = 0; st < 4; st++) for (const [n, d] of FC_FRAMES) list.push({ name: `fc-${n}-${st}`, scene: 'scenes/desk.glsl', spp: 80, crop: FC_CROP, defines: { ...d, STAGE: st } });
  for (let st = 0; st < 4; st++) {
    list.push({ name: `fc-blink1-${st}`, scene: 'scenes/desk.glsl', spp: 80, ...FC_HALF, defines: { POSE: 0, BLINK: 2, STAGE: st } });
    // at rest he sinks a little and comes back: the game blends slowly between idle and this, so he breathes
    list.push({ name: `fc-breathe-${st}`, scene: 'scenes/desk.glsl', spp: 80, crop: FC_CROP, defines: { POSE: 0, FC_SLUMP: '0.05', STAGE: st } });
    for (const [a, z, pa, pz] of FC_MOVES) FC_TW.forEach((tw, k) => list.push({ name: `fc-${a}_${z}_${k + 1}-${st}`, scene: 'scenes/desk.glsl', spp: 80, ...FC_HALF, defines: { POSE: pa, POSE2: pz, TW: tw.toFixed(2), STAGE: st } }));
  }
  for (const f of readdirSync(join(here, 'models')).filter((x) => x.endsWith('.glsl')).map((x) => x.slice(0, -5)).sort()) {
    if (NOT_GIFTS.has(f)) continue;
    list.push({ name: `gift-${f}`, scene: 'scenes/gift.glsl', model: f, spp: 320 });
    for (const h of GIFT_HUES[f] || []) list.push({ name: `gift-${f}-${h}`, scene: 'scenes/gift.glsl', model: f, hue: h, spp: 320 });
  }
  for (const s of ['barrier', 'mitten']) list.push({ name: `prop-${s}`, scene: `scenes/${s}.glsl` });
  list.push({ name: 'prop-mug-white', scene: 'scenes/mug.glsl' });
  for (const h of ['green', 'yellow', 'blue', 'red']) list.push({ name: `prop-mug-${h}`, scene: 'scenes/mug.glsl', hue: h });
  list.push({ name: 'plate-title', scene: 'scenes/title.glsl', spp: 260 });
  list.push({ name: 'plate-title-tall', scene: 'scenes/title.glsl', w: 1080, h: 1920, spp: 220, fov: 62, tgt: [0.3, 5.4, 0], defines: { PORTRAIT: 1 } });
  // stills and sprites for the films: every "//@shot name key=value DEFINE=value" line in scenes/cuts/*.glsl is one picture, cut-<name>.
  // lower-case keys override header settings (w, h, spp, alpha, crop, exposure ...), upper-case ones become #defines.
  const cuts = join(here, 'scenes', 'cuts');
  if (existsSync(cuts)) for (const f of readdirSync(cuts).filter((x) => x.endsWith('.glsl')).sort()) {
    for (const line of readFileSync(join(cuts, f), 'utf8').split(/\r?\n/)) {
      const mm = line.match(/^\s*\/\/@shot\s+(\S+)\s*(.*)$/); if (!mm) continue;
      const o = { name: 'cut-' + mm[1], scene: 'scenes/cuts/' + f, defines: {} };
      for (const kv of mm[2].trim().split(/\s+/).filter(Boolean)) {
        const i = kv.indexOf('='), k = i < 0 ? kv : kv.slice(0, i), v = i < 0 ? '1' : kv.slice(i + 1);
        if (/^[a-z]/.test(k)) o[k] = v.includes(',') ? v.split(',').map(Number) : isNaN(+v) ? v : +v; else o.defines[k] = v;
      }
      list.push(o);
    }
  }
  // page chrome: flat-on material shots
  const UI = [['paper', 0, 1200, 800, 0, 1.0, 0], ['manila', 1, 600, 400, 0, 1.0, 0], ['steel', 2, 800, 800, 0, 1.0, 0], ['plate-navy', 3, 540, 180, 1, 1.0, 0], ['plate-green', 4, 540, 180, 1, 1.0, 0],
    ['key-blue', 5, 420, 168, 1, 1.0, 0], ['key-orange', 6, 420, 168, 1, 1.0, 0], ['key-cream', 7, 420, 168, 1, 1.0, 0], ['sticky', 8, 400, 400, 0, 1.0, 0], ['room', 9, 1600, 1000, 0, 2.6, 1.4], ['wood', 10, 1200, 600, 0, 1.0, 0]];
  const EXPO = { paper: 3.7, manila: 2.0, sticky: 2.4, room: 3.6, 'key-blue': 1.5, 'key-orange': 1.5, 'key-cream': 1.5 };
  for (const [n, kind, w, h, alpha, ortho, ap] of UI) list.push({ name: 'ui-' + n, scene: 'scenes/ui.glsl', w, h, alpha, ortho, aperture: ap, exposure: EXPO[n], defines: { KIND: kind }, spp: n === 'room' ? 200 : 300 });
  return list;
}

if (process.argv[1] && process.argv[1].endsWith('shots.mjs')) {
  const args = process.argv.slice(2), force = args.includes('--force'), draft = args.includes('--draft'), words = args.filter((a) => !a.startsWith('--'));
  const todo = shots().filter((s) => !words.length || words.some((w) => s.name.includes(w)));
  if (args.includes('--list')) { console.log(todo.map((s) => s.name).join('\n')); process.exit(0); }
  const dir = join(here, 'out', draft ? 'draft' : 'final');
  let b = await open();
  let done = 0, failed = 0;
  for (const s of todo) {
    const out = join(dir, s.name + '.png');
    if (!force && existsSync(out)) continue;
    // "copy=<shot>" on a //@shot line: the same picture as that shot, wanted under a second name (for a second matte of it)
    if (s.copy) { const from = join(dir, 'cut-' + s.copy + '.png'); if (existsSync(from)) { copyFileSync(from, out); console.log(`${s.name}  copied from cut-${s.copy}`); done++; } else { console.error(`${s.name}  FAILED: cut-${s.copy} is not rendered yet`); failed++; } continue; }
    const o = { ...s, scene: join(here, s.scene), out };
    if (draft) o.spp = Math.max(24, Math.round((s.spp || 200) / 6));
    // the GPU sometimes drops the context when other jobs are rendering too: start a fresh browser and try again
    for (let attempt = 1; ; attempt++) {
      const t = Date.now();
      try {
        const r = await render(b, o);
        console.log(`${s.name}  ${r.w}x${r.h}  ${r.spp} spp  ${((Date.now() - t) / 1000).toFixed(0)}s`); done++; break;
      } catch (e) {
        // an empty compile log means the GPU context went, not that the shader is wrong
        const msg = String(e.message || e), lost = /context lost|no webgl2|no float render|timed out|CDP timeout|WebSocket|closed/i.test(msg) || /COMPILE\s*($|\n\s+at )/.test(msg);
        // (something else is using the card: wait longer each time, and ask for smaller tiles, so each piece of work is done
        // before the driver's two-second watchdog gives up on it)
        if (lost && attempt < 9) {
          o.tile = Math.max(48, Math.round((o.tile || 256) / 2));
          console.error(`${s.name}  lost the GPU (${msg.slice(0, 60)}), retrying with tiles of ${o.tile}`);
          try { await b.close(); } catch {} await new Promise((r) => setTimeout(r, Math.min(30000, 5000 * attempt))); b = await open(); continue;
        }
        console.error(`${s.name}  FAILED: ${msg.slice(0, 600)}`); failed++; break;
      }
    }
  }
  await b.close();
  console.log(`done: ${done} rendered, ${failed} failed, ${todo.length - done - failed} already there`);
  process.exit(failed ? 1 : 0);
}
