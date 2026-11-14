// Contact sheet of PNGs for review: node sheet.mjs <dir> <out.png> [--cols 4] [--cell 400] [--match text]
import { launch } from '../../prototype/tests/cdp.mjs';
import { readdirSync, writeFileSync, rmSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
const args = process.argv.slice(2), opt = (n, d) => { const i = args.indexOf('--' + n); return i >= 0 ? args[i + 1] : d; };
const dir = resolve(args[0]), out = resolve(args[1]), cols = +opt('cols', 4), cell = +opt('cell', 400), match = opt('match', ''), from = +opt('from', 0), count = +opt('count', 999);
const files = readdirSync(dir).filter((f) => /\.(png|webp|jpg)$/i.test(f) && f.includes(match)).sort().slice(from, from + count);
const rows = Math.ceil(files.length / cols), ar = +opt('ar', 0.625), ch = Math.round(cell * ar) + 18;
const html = `<body style="margin:0;background:${opt('bg', '#222')};font:11px sans-serif;color:#ddd"><div style="display:grid;grid-template-columns:repeat(${cols},${cell}px)">` +
  files.map((f) => `<div style="height:${ch}px;overflow:hidden"><img src="${pathToFileURL(join(dir, f)).href}" style="width:${cell}px;height:${ch - 18}px;object-fit:contain;display:block"><div style="height:18px;line-height:18px;padding-left:4px">${f.replace(/\.\w+$/, '')}</div></div>`).join('') + '</div></body>';
const b = await launch({ width: cols * cell, height: rows * ch });
const tmp = out + '.html'; writeFileSync(tmp, html); await b.navigate(pathToFileURL(tmp).href);
await new Promise((r) => setTimeout(r, 1500));
await b.screenshot(out); await b.close(); rmSync(tmp); console.log(out, files.length); process.exit(0);
