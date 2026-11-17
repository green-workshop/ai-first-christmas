# North Pole Ltd: AI-First Christmas, HD

The same game as `../prototype` (same engine, same content, same rules), with every picture replaced by a photograph
of a miniature film set: path-traced toys, felt puppets and real materials. Nothing in `../prototype` is changed.

    node hd/build.mjs        ->  hd/index.html, and ../index.html: the same page, loading its pictures from hd/assets/

`../index.html` is the page the public link opens: this is the game now. The drawn version is `../v2/index.html`
(`node prototype/build.mjs`). Unlike the drawn version, the HD game is not a single file: it needs its `assets/` folder.

## How it fits together

| Part | What it is |
| --- | --- |
| `build.mjs` | Takes the prototype's `shell.html`, CSS, `content.js` and `engine.js` unchanged, loads the prototype's art modules, then loads `src/hd-*.js` over them. It also lists what is in `assets/` so the art code knows which pictures exist. |
| `src/hd-core.js` | Helpers: picture URLs, "has this been rendered?", preloading. |
| `src/hd-icons.js` | Gifts: `NP.giftSVG` returns the photographed sprite (and its colour variant) instead of the drawn icon. |
| `src/hd-scene.js` | The game screen: the belt bay and the desk bay as backplates, with everything that moves or carries text laid over them (belt seams, lamps, signs, the speech bubble, Father Christmas's pose frames, mugs, notes, the rejects pile). |
| `src/hd-ui.js`, `src/hd.css` | The title backdrop and the interface chrome (paper, enamel plates, keys) cut from rendered materials. |
| `src/hd-film.js` | The intro, told in stills: one picture per beat, cross-faded under the original captions and timing. |
| `src/hd-intro.js` | The words and drawings the intro puts on each still's blank surfaces (name cards, the edict, sketches, sticky notes, signs, the review queue), by measured rectangle. |
| `src/hd-epilogue.js` | The closing film: one still per scene, with the game's own cheque, letters, contract, dashboard and rejects heap laid over it. |
| `src/hd-interlude.js` | The interlude's workshop floor, laid out by the prototype's arithmetic and drawn with sprites. |
| `render/` | The darkroom: the offline path tracer and every scene. See `render/README.md`. |
| `tools/ilshot.mjs`, `tools/epshot.mjs` | Screenshots of the interlude and of the closing film's verdicts, for art review. The prototype's `tests/shot.mjs` and `tests/cuts.mjs` cover the rest with `--slice hd/index.html`. |
| `tools/motion.mjs` | Film strips: every frame Edge paints of one moving thing (Father Christmas reacting, the AI speaking, the workshop floor, an intro scene), in order on one sheet. Stills cannot show a stumble; this can. |
| `tools/serve.mjs` | Serves this folder at `http://localhost:4173/` for trying the game by link. With `--site` it serves the whole repository, as GitHub Pages does, so the top page (`index.html`, the one the public link opens) can be tried as players get it: `node hd/tools/serve.mjs 4174 --site`. Try that page before publishing; this folder's own page can look right while the top one does not. |
| `src/hd-test.js`, `test.html` | Testing only. `build.mjs` also writes `test.html`: the game with a strip of buttons on the title that plays any cutscene by itself (the intro, each interlude, each ending). It is not part of the game; do not publish it. |

## How things move

Photographs do not bend, so everything that moves is one of three things:

1. **Frames with in-betweens.** Father Christmas at his desk is a pile of frames in one box. A change of pose plays three rendered
   in-between frames (`fc/<from>_<to>_<1..3>-<stage>`, backwards for the way back), each blended into the next, so he moves his arm
   instead of jumping to the new pose. At rest he blends slowly to a second frame and back (`fc/breathe-*`), which reads as breathing,
   and blinks through a half-closed frame. The workshop's hammering and the reindeer's walk are the same idea in CSS (`hd.css`,
   `cycle()` in `hd-interlude.js`): the frames' opacities always add up to one and are added with `plus-lighter`. A tool must
   land on something: the elves' mallets on the bow of the toy, the robots' hammers likewise, and a contractor's spanner on a
   bolt on the head of the robot beside it (the jaw stays there and the handle is worked: `JAW` in `floor.glsl`). The
   contractor looks at the robot (`ELF_YAW` turns the elf's head), and a robot being mended has stopped, hammer up
   (`.il-mend`): one that went on hammering swung through the spanner. The prototype's `robotsBuild` check allows for that.
2. **Cut-outs over a still.** In the films each puppet is cut out of its finished still (`render/mattes.mjs`, then
   `render/cutouts.mjs`) and laid exactly over itself. It breathes, and stretches a little when its caption comes up. A cut-out
   may only ever grow from where it sits: anything that uncovered the still beneath would show the puppet twice. To travel, it
   must be laid over a photograph that does not have it in (the same shot taken again without it), and the film goes to the
   photograph with it in once it has arrived, so its shadow and the light it catches are real again.
3. **Things drawn by the game** (the speech bubble, the AI's face, lamps, notes, snow, leaves, confetti): eased, no bounce. A
   photographed world makes a cartoon spring look like a glitch.

These moments in the films use cut-outs for more than breathing (each opens on a photograph without the thing that moves):

- **The stamp** (intro scene 3). `intro-3s` is the scroll with no stamp on it (`pack.mjs` makes it from `3a` and `3b`). The stamp
  is cut out of `x3-stamp-cut`. Held over the paper it is larger and throws a drawn shadow down and to the right; it shrinks
  onto that shadow as it comes down (a cut-out with no shadow looks as if it is lying on the sheet, and one that only slides
  looks as if it is slipping down it). It prints APPROVED, and is lifted off and laid where `3b` has it lying.
- **The trolley** (scene 6). `intro-6e` is the room without it; Father Christmas and the trolley are one cut-out
  (`x6-roll-cut`) rolled in from the right, shown as two halves so that he rises on each step while the trolley runs level,
  over drawn copies of the shadows they throw in `6a`; then the film goes to `6a`.
- **The applause** (scene 7). `x7-clap` is the board again with their hands apart; it comes and goes over `7a` (`hd.css`),
  each pose held and the change quick, so hands are seen to meet. `x7-cheer` is the board with their raised arms drawn down
  and in; it comes and goes over `7b`, so the arms pump. Flashes and falling paper are drawn.
- **The stairs** (scene 8). `intro-8w` is the cellar with nobody on the stairs. He is photographed alone, with no stairs or
  bin in the way, at four points: the top stair (`x8-fc-cut`), half way down, the foot, and stepped out to where `8b` has him
  (`x8-w1..3-cut`, `WALK` in `basement.glsl`). The film carries one group down that path and brings each cut-out up over the
  one before as he reaches the place it was taken, so the lamplight comes onto him as he descends. At each point he is
  photographed twice more with a leg lifted (`FC_STEP` in `models/fc.glsl`, shots `x8-<point>-s1/-s2-cut`); the film cuts to
  a lifted leg on each rise of his walk and back to the standing picture as he comes down (`stepLegs()` in `hd-film.js`), so
  he steps. The trolley scene does the same with `x6-roll-s1/-s2-cut`. The near stringer
  (`x8-rail-cut`) and the rejects bin (`x8-bin-cut`, cut out of `8a`) are laid back over him: he goes down behind both.
- **The sack of returns** (closing film, middling ending). `x2-nosack` is the table without it, laid over that part of `epi-2`
  until the sack (`x2-sack-cut`) has landed.

- **The sacks in the cellar** (scene 8). The scene opens on `intro-8a0`, which `render/pack.mjs` makes by laying the empty corner
  (`x8-nosacks`) into `intro-8a`. Each sack is photographed alone (`x8-solo0..4`), cut out with its own matte, and dropped in
  from the chute's mouth; then the film goes to `intro-8a`, where the sacks and their shadows are in the photograph.
- **The press** (scene 7). Three close-ups of the button: waiting (`7p`), pressed and lit with the chair's hand on it (`7q`), lit
  and let go (`7r`). The hand is cut out of `7q` (it has material ids of its own, 255..258, so its matte does not take the
  member behind it) and slid down its own arm over `7p`, then back up over `7r`.
- **The office** (scene 5). His worn-down look is in the photographs (`FC_WORN` in `render/models/fc.glsl`: sweat, bags, a
  ragged beard); the drop running down from each temple is drawn (`sweat()` in `hd-intro.js`). The game's own frames of him use
  the same look, one step per frazzle stage.

A scene whose extra pictures are missing plays its plain version (`plain:` in `hd-film.js`), not the drawn film.

Two rules keep the two versions in step:

1. **Fallback.** Every HD module checks that its pictures exist and otherwise leaves the drawn version in place, so a
   half-rendered build still plays from start to finish.
2. **Hooks, not forks.** Where the prototype's own code has to hand over (the intro's scene table, the interlude's
   floor, the closing film's scenes), `build.mjs` inserts one line at a named point and fails loudly if that point has
   moved. The list is `HOOKS` at the top of `build.mjs`.

## Where the HD game departs from the original

The HD build is to replace the drawn game, so two things are now changed on purpose, both without touching `prototype/`:

- **The automatic sixth round** (`src/hd-auto.js`, with five lines added to the engine's copy by `HOOKS`). A playtester took
  it for a new shift and sat waiting. As the sacking interlude closes a card says the player has been replaced and the AI will
  do the last four children alone (7.5 s, with a bar draining); then the screen has no buttons, no mittens, no Father
  Christmas (his chair is taped off) and no timer, an AUTOMATIC strip counts what is shipped unchecked and how much of it was
  right, and the last count is held two seconds before the closing film. The rules of the round are the engine's.
  `node hd/tools/auto.mjs` plays the real game to that round and films it, and says so if the page is ever hidden or the card
  never shows (a class on `<body>` once blanked the page for exactly as long as the card was meant to be up).
- **The story's words** (`src/hd-story.js`, loaded after `content.js`, and a few `HOOKS`), from an independent story review
  (`render/out/review-story/NOTES.md`): lines that contradicted what the player had just seen, notes and report comments that
  named a gift the player was not sent, and a "Trained on elf decisions: 4 of 20" line on every patch note, so that "you
  trained it" is set up before it pays off. All five closing-film scenes wait for a press (the drawn game times the first
  two), and a second shift's report has an ending of its own. `prototype/tests/checks.mjs` checks either behaviour: it looks
  at whether the first scene shows a Next button, and finds the verdict scene by its class, not by its place.
- **Presses that arrive late.** A lock-out against a double press must count from when the new screen is painted, not from
  the code that opens it: a photographed screen can take longer to put up than the lock-out lasts, and a press that was
  waiting is then handled after it. The briefing takes no press until it has been painted (`G.briefingSeen`), and nor does a
  closing-film scene (`hdLock`); both are `HOOKS`. They showed only with four browsers competing, and would show on a slow phone.
- **On a phone** the workshop floor's rows stand further apart (`hd-interlude.js`), and a gift's tag is a little wider and
  is hidden while the gift is in the air, so it does not reach over the letter (`hd.css`).

The prototype's layout checks measure the closing film's basement by class name (`.ep-pile`, `.ep-sign`, `.ep-flr`,
`.ep-desk`, `.ep-keep .ep-br`). In the HD scene the floor, desk and elf are in the photograph, so `hd-epilogue.js`
puts an unpainted rectangle with that class where each one is. Re-measure them if `epi-3` is re-shot from a new camera.

Text is never rendered into a picture. Signs, screens, cards and documents are photographed blank and the game draws
the words over them, so wording, translation and accessibility stay in `content.js`.

## Making the pictures

From PowerShell (the renderer drives Edge, which cannot start from a sandboxed shell):

    cd hd/render
    node shots.mjs --list                 # every final picture and whether it exists
    node shots.mjs gift- fc-              # render the ones whose names contain these words (skips finished ones)
    node shots.mjs --draft --force cut-   # quick drafts into out/draft
    node pack.mjs                         # PNG masters -> WebP in hd/assets (add --draft to pack drafts)
    node mattes.mjs                       # where the cast is in each film still (quick: no light is followed)
    node cutouts.mjs                      # cuts each puppet out of its still -> hd/assets/cuts/<still>.<who>.webp and pups.json
    node ../build.mjs

Re-run `mattes.mjs --force` and `cutouts.mjs` for any film still that is re-shot, or its cut-outs will no longer sit on it.

`render/out/` holds the masters and is not committed. A full set is about 330 pictures (14 MB as WebP), half of them the
in-between frames and cut-outs that make things move; on a GTX 1050 Ti the big backplates take 15 to 25 minutes each, a film still
3 to 30, a pose frame two to four and an in-between frame under one.

Render one thing at a time, with no other page using the graphics card (close the game if it is open in a browser): a second user
makes the renderer lose its context mid-compile. `shots.mjs` retries, but a frame can still fail and need re-running.

## Testing

The prototype's own checks and bots run against this build:

    node prototype/tests/checks.mjs --slice hd/index.html
    node prototype/tests/bots.mjs   --slice hd/index.html

Run them when nothing is rendering: a busy graphics card makes page loads time out.

`hd/tools/motion.mjs` films one moving part into a strip of every frame Edge painted, with times (`wrong`, `right`, `speech`,
`floor N`, `film N`, `end N --pct=62`; `--clip=x,y,w,h --zoom= --from= --to= --every=`). A still cannot show a stumble.
`film N --play` lets the intro run into scene N from three scenes back, as a player meets it; plain `film N` jumps straight
there, which fetches a scene's pictures all at once and can show a photograph arriving late that a player never sees late.
`hd/tools/auto.mjs` plays the real game to the automatic sixth round and films it.
`hd/tools/probe.mjs [right|wrong]` makes Father Christmas react at uneven times (at rest, mid-breath, mid-blink) and prints
which of his frames were on show at every frame drawn: a move must clear his resting frames within a few frames however it
starts. (A bay filmed alone always starts its move at the top of a breath, and hid exactly that fault once.)

Reduced motion: the game's own rule gives every style change a transition of a thousandth of a second, so in the two bays a
size or a place that has just been set is not yet in force when the next line measures it. `hd.css` turns transitions off
inside the bays' pictures for that reason; keep it if the bays are reworked.
