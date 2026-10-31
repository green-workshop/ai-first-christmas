# Playable slice: architecture and contracts

The slice is the game screen plus rounds 1–2, one interlude (patch v1.1) and a mini shift report, all in the final art style. The design source of truth is `../SPEC.md`. Art rules are in **SPEC §9**, which every art file follows.

## Layout of files

```
prototype/
  build.mjs          node build.mjs  -> slice.html (one self-contained file)
  slice.html         BUILD OUTPUT, never edit by hand
  src/
    shell.html       page markup with <!-- @css --> and <!-- @js --> placeholders   (owner: lead)
    tokens.css       palette and type tokens from SPEC §9.2 / §9.6                  (owner: lead)
    layout.css       grid and responsive layout of the screens                      (owner: lead)
    ui.css           UI chrome: plates, keycaps, memo, tag, modal, title screen       (owner: UI agent)
    icons.js         NP.icons + NP.giftSVG()                                         (owner: icons agent)
    scene.js         NP.scene.mountBelt() / mountDesk(): belt, hopper, Father Christmas, pile (owner: scene agent)
    ui-art.js        NP.art.logo, NP.art.titleDashboard, NP.art.symbols               (owner: UI agent)
    interlude.js     NP.interlude.play()                                             (owner: UI agent)
    content.js       NP.content: children, lines, interlude data                     (owner: lead)
    engine.js        state machine, belt timer, input, report, test hooks            (owner: lead)
  tests/
    cdp.mjs          zero-dependency Chrome DevTools Protocol client (Node 24 WebSocket)  (owner: test agent)
    bots.mjs         human-persona bots                                               (owner: test agent)
```

The build concatenates CSS in this order: tokens, layout, ui. JS goes in this order: icons, ui-art, scene, interlude, content, engine. Everything hangs off one global, `window.NP = window.NP || {}`, and each file starts with `window.NP = window.NP || {};`. There are no modules, no dependencies, no network, no emoji, and no external fonts.

Only edit files you own. If you need something from another file, code against the contract below and note the assumption in your report.

## Global rules
- Colours only via the CSS custom properties in `tokens.css`. In SVG, use `fill="var(--pole-red)"` or classes. Never use pure #000 or #fff.
- Light comes from the upper left. Use soft contact shadows, no outlines (except icons below 40px), and 2–3 tones per surface (SPEC §9.3).
- Animate only `transform` and `opacity`. Honour `document.documentElement.classList.contains('reduced')`: no movement, crossfades or instant pose swaps only.
- Shared SVG `<defs>` (gradients, the blur filter) live in **one** hidden sprite. Ids are prefixed by owner: icons `g-…` / `gi-…`, scene `sc-…`, ui-art `ui-…`. Shared filter: `#np-soft` (feGaussianBlur stdDeviation 3), defined by icons.js.
- Size budget for the slice: icons.js ≤ 70 KB, scene.js ≤ 70 KB, ui-art.js + interlude.js + ui.css ≤ 60 KB.

## Contracts

### icons.js
```js
NP.icons = {
  sprite: '<svg ...hidden><defs>…shared gradients, #np-soft…</defs><symbol id="g-teddy" viewBox="0 0 64 64">…</symbol>…</svg>',
  ids: ['teddy', …]            // every icon id available
};
// Returns a complete inline SVG string for one gift on the 64x64 grid (§9.5), sized by CSS (width/height 100%).
NP.giftSVG = function (spec) {}
// spec = { icon: 'socks', hue?: 'red'|'blue'|'green'|'pink'|'yellow'|'brown'|'purple', badge?: '×4,000',
//          scale?: 'giant'|'tiny', broken?: true /* for the rejects pile: tilted, cracked, a little desaturated */ }
```
Icon ids needed (see content.js): `teddy grizzly brickcastle castle kite bird pyjamas dino cricketbat bat socks sock boots boot chess pawns jigsaw telescope crate empty giftbox`.
- `crate` is a wooden crate with a stencilled "?" (for hallucinated items).
- `empty` is a dashed placeholder outline with a faint cross, for [INSERT GIFT HERE].
- `giftbox` is a generic wrapped present.
- `scale:'giant'` means the object is cropped and breaks the frame (it overflows the 64 box; use overflow visible). `scale:'tiny'` means a small copy sitting on the baseline.
- `hue` recolours the main body via the `--gift-hue` CSS variable.

### scene.js
The belt panel and the desk panel are two separate SVGs, so they can sit side by side on desktop or stacked on a phone.
```js
var belt = NP.scene.mountBelt(el);   // el: the empty div#belt. Inserts an <svg viewBox="0 0 800 300" preserveAspectRatio="xMidYMid meet">
// Geometry (viewBox units; the engine relies on these numbers):
//   belt top surface y = 214; the gift sits with its bottom at y = 214
//   hopper mouth centre x = 520 (the gift drops from y ≈ 120 to the belt here)
//   packing chute opening x = 0..96 on the left (a gift whose centre passes x = 70 has fallen in)
//   right end of the belt x = 800 (rejected gifts fly off past it)
belt.setSpeed(unitsPerSec)    // tread animation speed, 0 = stopped; the engine passes the real belt speed
belt.hopperTalk(text|null)    // speech bubble from the AI hopper ("You're absolutely right! …"); null hides it
belt.hopperChurn()            // short shake/whirr while it "thinks"
belt.chuteFlash('good'|'bad') // packing chute light: blue with a tick shape, or orange with a cross shape (§9.2)
belt.barrier(bool)            // the "FINAL. NO FURTHER REWORK" barrier at the right end
belt.mittens(dir)             // 'left'|'right'|'idle': the elf's red knit mittens entering from the bottom edge and pushing

var desk = NP.scene.mountDesk(el);   // el: the empty div#desk. Inserts an <svg viewBox="0 0 400 300">
// Contains: basement wall, the rejects pile on the left (fixed stacking slots, about 24 slots, random slight tilt),
// and Father Christmas at a desk with a laptop on the right.
desk.pileAdd(giftSpec)        // drops a broken toy (NP.giftSVG({...spec, broken:true})) into the next slot. Returns a Promise resolving on landing (≈420ms; instant if reduced)
desk.fc(kind)                 // 'idle' | 'look' (looks at the pile) | 'scratch' (head scratch) | 'type' (types a fix) | 'puzzled' (holds up a good gift) | 'relief'
desk.react(isCorrectGift)     // convenience: the full reaction to a toy landing. Wrong gift: look -> scratch -> type (≈2.5s). Right gift: puzzled. Returns a Promise
desk.frazzle(n)               // 0..3 frazzle stage (SPEC §9.4)
desk.sticky(text)             // a sticky note pops up on his monitor
desk.mugs(n)                  // number of mugs on the desk (0..6)
```
Father Christmas: generic and original (SPEC §9.4: reading glasses, plain coat, no belt-buckle motif, no rosy shine). Rigged with groups and transform-origin pivots.

### ui-art.js and interlude.js
```js
NP.art.logo            // SVG string: hand-built lettering "NORTH POLE LTD" with "AI-First Christmas" underneath (§9.6)
NP.art.titleDashboard  // SVG string: the title-screen joke, a green enamel dashboard "AI ADOPTION 100%", "Use case: TBC"
NP.art.icon(name)      // small UI icons as SVG strings: 'pause','sound-on','sound-off','sleigh','tick','cross','arrow-left','arrow-right','sack'

var il = NP.interlude.play(el, data, { reduced: bool });   // el: the empty div#interlude (full-screen overlay)
// data = NP.content.interludes[0] (see content.js), plus data.issues = [{ id:'BUG-0042', text:'…', kind:'qa'|'return' }]
// Three beats of about 3s each: (1) the board memo, (2) the patch notes on Father Christmas's screen next to the issues board, (3) the workshop floor (elves at benches; data.floor tells how many).
il.next()     // advance to the next beat now
il.skip()     // jump to the end
il.pause(); il.resume();
il.done       // Promise that resolves when finished or skipped
```
The engine owns all keyboard and touch handling. The interlude only exposes these methods, but it can show a "Tap or Space: next · Enter: skip" hint.

### ui.css (styles the classes used in shell.html)
`.plate` (an HUD enamel sign plate with `.plate-label` and `.plate-value`), `.keycap` (chunky 3D button; variants `.keycap-pack`, `.keycap-reject`, `.keycap-plain`), `.letter-card` (paper with grain and a letterhead), `.gift` (the gift on the belt), `.gift-tag` (manila tag with a punched hole and string), `.memo`, `.modal` (brass or clipboard panel), `.ticker` (the board line), `.screen-title`, `.report-table`, `.toast`. See shell.html for the exact structure.

### engine.js test hooks (read only, used by bots for measurement)
```js
window.__game.state() -> {
  phase: 'title'|'briefing'|'preview'|'belt'|'apology'|'flight'|'interlude'|'paused'|'report',
  round: 1|2, child: 0..7, rejectsThisChild: n,
  letter: '…', tag: '…',               // what's on screen
  giftCorrect: bool,                  // ground truth for the bots' "perception" model
  beltProgress: 0..1, beltTimeLeft: s,
  outcomes: [{ round, name, outcome: 'right'|'caught'|'missed'|'talked'|'unchecked', correct: bool }],
  settings: { relaxed, untimed, reduced, sound }
}
```
URL params: `?seed=N` gives a deterministic run, `?fresh=1` ignores storage (always a first play), and `?relaxed=1`, `?untimed=1` and `?reduced=1` turn on those settings.

Bots must drive the game through **real input events** (CDP `Input.dispatchKeyEvent`, `Input.dispatchMouseEvent`, `Input.dispatchTouchEvent`), and never by calling game functions.

### DOM ids the engine and the bots use
`#app`, `#screen-title`, `#btnStart`, `#screen-game`, `#hud`, `#ticker`, `#letter`, `#belt`, `#beltZone` (the swipe area overlaying the belt), `#desk`, `#btnPack`, `#btnReject`, `#btnPause`, `#interlude`, `#briefing`, `#btnBriefingGo`, `#pause`, `#report`, `#btnAgain`, `#live` (aria-live).

---

# Full game: additions to the contracts

The full game is built from the same `src/`. `build.mjs` writes `slice.html` and also the deliverable `../index.html`. The v1 game is archived at `../v1/index.html`. SPEC.md §10 (slice playtest learnings) overrides earlier SPEC sections.

## New files and owners
```
src/intro.js       NP.intro.play()       the 8-scene intro (SPEC §3)                 (owner: intro agent)
src/epilogue.js    NP.epilogue.play()    the 3-scene epilogue (SPEC §3a)             (owner: cutscene agent)
src/intro.css      intro styles, .in-* classes                                     (owner: intro agent)
src/cutscene.css   epilogue and automation memo styles, .ep-* and .am-*           (owner: cutscene agent)
```
The build order becomes: CSS tokens, layout, ui, cutscene; JS icons, ui-art, scene, interlude, intro, epilogue, content, engine.

### intro.js
```js
var ix = NP.intro.play(el, { reduced: bool });   // el = #intro (full-screen overlay, the engine un-hides it)
// About 68s, 8 scenes, captions always on screen as text. Plays on its own like a short film (it does not wait for clicks).
// A visible "Skip to the shift" button from the first second calls ix.skip() itself.
ix.next()    // jump to the next scene now (engine: Space / tap)
ix.skip()    // end now (engine: Enter / S, or the button)
ix.pause(); ix.resume();
ix.done      // Promise, resolves when finished or skipped
```
Reduced motion: still comic-panel frames that **do** wait for next(), plus the skip button. Portrait and landscape framings (SPEC §3).

### epilogue.js
```js
var ep = NP.epilogue.play(el, { pct, pileCount, adoption, automated: bool, reduced: bool });   // el = #epilogue
// E1 cheque, E2 basement with a pile of `pileCount` toys, E3 verdict line (SPEC §3a). Plays on its own (~15s). Same next/skip/pause/resume/done.
NP.epilogue.verdictLine({ pct, automated }) -> string   // also shown on the report even when cutscenes are skipped
```

### interlude.js additions (cutscene agent)
- `data.floor` = `{ benches, present, leaving, contractors, reindeer: 'present'|'leaving'|'gone', drones: bool, caption }`
  - `leaving` elves are walked out carrying boxes (they walk off during the floor beat)
  - `contractors` elves wear gold CONTRACTOR badges
- `NP.interlude.memoChoice(el, { title, body, yes, no })` returns `{ done: Promise<'yes'|'no'> }`. This is the automation temptation (SPEC §4f).
  - For the first 1s, input is ignored.
  - The player answers by clicking or tapping a button, or with Enter on the focused button. Arrow keys only move focus.
  - Neither button is focused by default. Instead, focus goes to the memo container.

### content.js (content agent): the schema is unchanged, extended to 6 rounds
- `rounds[0..5]`: `{ bug, comment: { good, bad }, mirror?: string, pool: [5 children] }`.
  - Round 3 is mix-ups (pre-written pairs inside the round). Round 4 is wrong spec (size, colour or age). Round 5 is negation. Round 6 is confidently plausible.
  - Letters get longer and more detailed in later rounds (SPEC §4e).
- `interludes[0..4]`: one after each of rounds 1–5. Each has memo, patch, boardLine and floor (SPEC §4c table), plus an optional `automation: { title, body, yes, no }` on interludes[2].
- `epilogue` copy, `verdicts`, `board`, `sticky` (per round is allowed: `sticky.byRound[r]`) and `youreRight`.
- Icons: use existing ids where possible. New icon ids must be listed in `NP.content.newIcons` with a one-line description each.

### engine.js additions (lead)
- Phases are added: `intro`, `epilogue`, `memo` (the automation choice) and `montage` (the 2× automated children). Bots should treat these like interludes.
- Settings: "Skip cutscenes" turns itself on after the first complete shift. It skips the intro and the epilogue, but the E3 verdict line is still shown. Interludes are never skipped automatically.
- `?skipintro=1` skips the intro in tests. `?rounds=N` stops after N rounds, for quick tests.
