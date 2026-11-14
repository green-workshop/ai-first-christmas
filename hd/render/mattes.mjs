// Mattes of the cast in the film stills: for every cut-intro-* and cut-epi-* shot, a picture whose alpha is "a puppet is seen here"
// (see MATTE_LO in pt.glsl). cutouts.mjs uses them to cut each puppet out of the finished still, so the films can move them.
//   node mattes.mjs [word ...] [--force]      -> out/matte/<name>.png      PowerShell only. A matte takes seconds: it follows no light.
import { open, render } from './darkroom.mjs';
import { shots } from './shots.mjs';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2), force = args.includes('--force'), words = args.filter((a) => !a.startsWith('--'));
// a shot can ask for a matte of something else with "matte=lo,hi" on its //@shot line (the sacks that drop into the cellar do)
// ("matte=0" = this still needs none: nothing in it is moved)
// ("mattein=<test on mid>" = a matte of whatever ids pass the test, for things that are not one run of ids)
const todo = shots().filter((s) => s.matte !== 0 && (/^cut-(intro|epi)-/.test(s.name) || s.matte || s.mattein) && (!words.length || words.some((w) => s.name.includes(w))));
let b = await open(), done = 0, failed = 0;
for (const s of todo) {
  const out = join(here, 'out', 'matte', s.name.slice(4) + '.png');
  if (!force && existsSync(out)) continue;
  const o = { ...s, scene: join(here, s.scene), out, spp: 32, alpha: 1, exposure: 1, bloom: 0, defines: { ...s.defines, MATTE_LO: s.matte ? s.matte[0] : 200, MATTE_HI: s.matte ? s.matte[1] : 279, ...(s.mattein ? { MATTE_IN: s.mattein } : {}) } };
  for (let attempt = 1; ; attempt++) {
    const t = Date.now();
    try { await render(b, o); console.log(`${s.name}  matte  ${((Date.now() - t) / 1000).toFixed(0)}s`); done++; break; }
    catch (e) {
      const msg = String(e.message || e);
      if (attempt < 4) { console.error(`${s.name}  retrying (${msg.slice(0, 60)})`); try { await b.close(); } catch {} await new Promise((r) => setTimeout(r, 4000 * attempt)); b = await open(); continue; }
      console.error(`${s.name}  FAILED: ${msg.slice(0, 400)}`); failed++; break;
    }
  }
}
await b.close();
console.log(`done: ${done} mattes, ${failed} failed`);
process.exit(failed ? 1 : 0);
