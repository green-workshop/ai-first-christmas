// Quick composite check: gift sprites placed on the belt plate where the engine would put them.  node comp.mjs out/comp.png sprite@x [sprite@x ...]
import { launch } from '../../prototype/tests/cdp.mjs';
import { writeFileSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const [out, ...items] = process.argv.slice(2);
const plate = process.env.PLATE || 'out/belt-prev.png', W = 1200, k = W / 800;
const html = `<body style="margin:0;background:#000"><div style="position:relative;width:${W}px;height:${470 * k}px;overflow:hidden"><img src="${pathToFileURL(resolve(plate)).href}" style="width:100%;display:block">` +
  items.map((it) => { const [f, x] = it.split('@'); const g = 110 * k; return `<img src="${pathToFileURL(resolve(f)).href}" style="position:absolute;width:${g}px;left:${+x * k - g / 2}px;top:${(214 + 170) * k - 0.875 * g}px">`; }).join('') + '</div></body>';
const tmp = resolve(out) + '.html'; writeFileSync(tmp, html);
const b = await launch({ width: W, height: Math.round(470 * k) });
await b.navigate(pathToFileURL(tmp).href); await new Promise((r) => setTimeout(r, 1200));
await b.screenshot(resolve(out)); await b.close(); rmSync(tmp); console.log(out); process.exit(0);
