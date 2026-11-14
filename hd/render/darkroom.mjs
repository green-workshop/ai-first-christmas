// The darkroom: path-traces a scene file on the GPU in headless Edge and saves the picture.
//   node darkroom.mjs scenes/teddy.glsl [--out file.png] [--w 800 --h 600 --spp 256 ...] [--D NAME=VALUE ...]
// A scene file is GLSL (see pt.glsl for what it must define). Settings sit in its header as lines like
//   //@ w=1024 h=768 spp=256 fov=30 pos=0,1,5 tgt=0,0.5,0 aperture=0.02 exposure=1.2
// and "//@include models/x.glsl" pulls in another file. Run it from PowerShell (Edge will not start from a sandboxed shell).
import { launch } from '../../prototype/tests/cdp.mjs';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const DEFAULTS = { w: 800, h: 600, spp: 128, inner: 2, tile: 256, fov: 35, pos: [0, 1, 5], tgt: [0, 0, 0], aperture: 0, focus: 0, ortho: 0, roll: 0, shift: [0, 0],
  exposure: 1, bloom: 0, bloomThreshold: 1.2, vignette: 0, contrast: 1.12, saturation: 1.12, curve: 'agx', alpha: 0, crop: 0, tint: [1, 1, 1], type: 'image/png', quality: 0.92, maxSec: 0 };
export const HUES = { red: 'srgb(0.70,0.085,0.075)', blue: 'srgb(0.11,0.29,0.66)', green: 'srgb(0.09,0.40,0.21)', pink: 'srgb(0.88,0.40,0.57)', yellow: 'srgb(0.93,0.69,0.10)', brown: 'srgb(0.40,0.23,0.11)', purple: 'srgb(0.40,0.20,0.62)' };
const num = (v) => (String(v).includes(',') ? String(v).split(',').map(Number) : isNaN(+v) ? v : +v);

export function loadScene(file, seen = new Set()) {
  const path = resolve(file);
  if (seen.has(path)) return { src: '', cfg: {} };
  seen.add(path);
  const cfg = {}; const out = [];
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const inc = line.match(/^\s*\/\/@include\s+(\S+)/);
    if (inc) { const r = loadScene(join(here, inc[1]), seen); Object.assign(cfg, r.cfg, cfg); out.push(r.src); continue; }
    const set = line.match(/^\s*\/\/@\s+(.*)$/);
    if (set) { for (const kv of set[1].trim().split(/\s+/)) { const i = kv.indexOf('='); if (i > 0) cfg[kv.slice(0, i)] = num(kv.slice(i + 1)); } out.push(''); continue; }
    out.push(line);
  }
  return { src: out.join('\n'), cfg };
}

export function assemble(sceneSrc, cfg, defines = {}) {
  const head = ['#version 300 es', 'precision highp float;', 'precision highp int;',
    'uniform sampler2D uPrev; uniform vec2 uRes; uniform int uFrame, uInner; uniform vec3 uCamPos, uCamTgt;',
    'uniform float uFov, uAperture, uFocus, uOrtho, uRoll; uniform vec2 uShift, uOff;', 'out vec4 fragColor;', '#define ZERO min(uFrame, 0)',
    ...(cfg.alpha ? ['#define ALPHA'] : []), ...Object.entries(defines).map(([k, v]) => `#define ${k} ${v}`)].join('\n');
  return head + '\n' + readFileSync(join(here, 'lib.glsl'), 'utf8') + '\n' + readFileSync(join(here, 'pt.glsl'), 'utf8').replace('//@SCENE', () => readFileSync(join(here, 'mat.glsl'), 'utf8') + '\n' + sceneSrc);
}

export async function open() {
  const b = await launch({ width: 640, height: 480, extraArgs: ['--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=' + (process.env.ANGLE || 'vulkan'), '--force_high_performance_gpu', '--disable-gpu-watchdog'] });
  await b.evaluate(readFileSync(join(here, 'page.js'), 'utf8') + '\n0');
  return b;
}

// opts: { scene, out, defines, ...overrides of the scene's header settings }
export async function render(b, opts) {
  let { src, cfg: fileCfg } = loadScene(opts.scene);
  if (opts.model) src = loadScene(join(here, 'models', opts.model + '.glsl')).src + '\n' + src;   // a gift model for scenes/gift.glsl
  const cfg = { ...DEFAULTS, ...fileCfg };
  for (const [k, v] of Object.entries(opts)) if (k in DEFAULTS && v !== undefined) cfg[k] = v;
  const defines = { ...(opts.defines || {}) };
  if (opts.hue) defines.HUE = HUES[opts.hue] || opts.hue;      // --hue red  recolours a gift model
  const frag = assemble(src, cfg, defines);
  const crop = Array.isArray(cfg.crop) ? cfg.crop : null;   // x, y from the top-left, w, h in full-frame pixels
  const job = { frag, w: crop ? crop[2] : cfg.w, h: crop ? crop[3] : cfg.h, full: [cfg.w, cfg.h], off: crop ? [crop[0], cfg.h - crop[1] - crop[3]] : [0, 0], spp: cfg.spp, inner: cfg.inner, tile: cfg.tile, maxSec: cfg.maxSec,
    cam: { pos: cfg.pos, tgt: cfg.tgt, fov: cfg.fov, aperture: cfg.aperture, focus: cfg.focus, ortho: cfg.ortho, roll: cfg.roll, shift: cfg.shift },
    exposure: cfg.exposure, bloom: cfg.bloom, bloomThreshold: cfg.bloomThreshold, vignette: cfg.vignette, contrast: cfg.contrast, saturation: cfg.saturation,
    curve: cfg.curve, alpha: cfg.alpha, tint: cfg.tint, type: cfg.type, quality: cfg.quality };
  await b.evaluate(`window.__result = null; window.__progress = null; window.darkroom(${JSON.stringify(job)}).then((r) => { window.__result = r; }, (e) => { window.__result = { error: String(e && e.stack || e) }; }); 0`);
  let said = 0;
  for (;;) {
    await sleep(400);
    const st = JSON.parse(await b.evaluate('JSON.stringify({ done: !!window.__result, p: window.__progress })'));
    if (st.done) break;
    if (opts.verbose && st.p && Date.now() - said > 15000) { said = Date.now(); console.log(`  pass ${st.p.pass}/${st.p.passes}  ${st.p.sec.toFixed(0)}s`); }
  }
  const r = JSON.parse(await b.evaluate('JSON.stringify(window.__result)', { timeoutMs: 120000 }));
  await b.evaluate('window.__result = null; 0');
  if (r.error) {
    const lines = frag.split('\n'); const hits = [...r.error.matchAll(/ERROR: \d+:(\d+)/g)].map((m) => +m[1]);
    let msg = r.error;
    for (const n of [...new Set(hits)].slice(0, 6)) msg += `\n   ${n}: ${lines[n - 1]}`;
    throw new Error(msg);
  }
  if (opts.out) { mkdirSync(dirname(resolve(opts.out)), { recursive: true }); writeFileSync(opts.out, Buffer.from(r.data, 'base64')); }
  return { ...r, data: undefined, bytes: Math.round(r.data.length * 0.75), w: cfg.w, h: cfg.h };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2); const opts = { defines: {}, verbose: true };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--D') { const [k, v = '1'] = args[++i].split('='); opts.defines[k] = v; }
    else if (a.startsWith('--')) opts[a.slice(2)] = num(args[++i]);
    else opts.scene = a;
  }
  if (!opts.scene) { console.error('usage: node darkroom.mjs scene.glsl [--out file.png] [--spp N] [--D NAME=VALUE]'); process.exit(2); }
  opts.out = opts.out || join(here, 'out', basename(opts.scene).replace(/\.glsl$/, '') + '.png');
  const b = await open();
  try { const r = await render(b, opts); console.log(`${opts.out}  ${r.w}x${r.h}  ${r.spp} spp  compile ${r.compileMs}ms  render ${r.renderSec}s  ${(r.bytes / 1024).toFixed(0)} KB`); }
  catch (e) { console.error(String(e.message || e)); process.exitCode = 1; }
  await b.close(); process.exit();
}
