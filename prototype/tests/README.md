# Playtest bots (SPEC §6c, Layer 1)

These bots play the full game in `prototype/slice.html` in headless Edge the way people do. They react slowly, read at
human speed, misjudge gifts, press the wrong key and make sloppy swipes. They drive the game only
with real input events sent through the Chrome DevTools Protocol (key, mouse and touch). They
read `window.__game.state()` and the DOM to perceive the game and take measurements, and they
never call game functions.

Full game flow the bots handle: title → **intro** → briefing → 6 rounds × 4 children with an
**interlude** after each of rounds 1–5 → the automation **memo** after child 12 (and, if
accepted, the 2× **montage** of 3 automated children) → **epilogue** → report.

You need Node 24+ and Microsoft Edge at `C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`.
There are no npm installs.

## Run

```
node prototype/build.mjs                    # makes prototype/slice.html
node prototype/tests/bots.mjs               # every persona, 1 run each, 4 browsers at a time
node prototype/tests/bots.mjs --persona carefulReader --runs 5
node prototype/tests/bots.mjs --persona masher,sceptic --seed 42 --verbose
node prototype/tests/bots.mjs --rounds 4 --skipintro     # quick: up to the memo and one round after
```

| Flag | Meaning |
|---|---|
| `--persona name[,name]` or `all` | `phoneScroller carefulReader masher sceptic distracted skipper keyboardOnly secondRun` |
| `--runs N` | runs per persona (game seed = `S + run`) |
| `--seed S` | base seed (default 1000). The game is deterministic per seed; bot timing is real time, so it is close to repeatable, but not exactly |
| `--rounds N` | adds `&rounds=N`: the game stops after N rounds (quick tests). The memo needs N ≥ 4 to be followed by a round |
| `--skipintro` | adds `&skipintro=1`: no intro |
| `--relaxed` | adds `&relaxed=1` |
| `--headed` | shows the browser windows |
| `--parallel N` | browsers at once (default 4) |
| `--slice path` | test another build (or a copy: the lead may rebuild `slice.html` while a long run is going) |
| `--verbose` | prints every decision (truth, intended action, key or swipe sent, and what happened) plus every cutscene and memo action |

A full 6-round run takes about 4–8 minutes (the careful reader and the distracted runs take longest;
`secondRun` plays twice). Each run uses a fresh browser profile, so each run is a first play, apart
from the reload in `secondRun`. The browsers are killed and their temp profiles deleted on exit, on
Ctrl+C and on a crash.

> Keep `--parallel` at 4 or below for the full game. The intro and epilogue are heavy, and with
> 8 browsers the pages can starve the harness's polls for many seconds. Phases then go unseen,
> and timings such as time to first gift are inflated.

> Note: launch it from a normal terminal or PowerShell. Some sandboxed shells stop Edge from
> starting; you then see "Edge exited early (code 0)".

## Output

- **stdout**: three tables per persona (outcomes; per-round right%; cutscenes, memo and automation),
  then the details (game bugs, memo choices, automated children, errors, console errors, stuck
  states, accidental inputs, abandons), then **PASS/WARN per target**.
- **`tests/out/results.json`**: everything, per run. That includes the final `outcomes`, `perRound`
  counts, every decision, the phase timeline (`phaseLog`), `intro` / `epilogue` / `memo` /
  `montage` records, `cutscenes` (time per cutscene), `automation`, `gameBugs`, the distraction
  records, the aria-live log summary and the screenshot paths.
- **`tests/out/<persona>-<run>-firstgift|intro|interlude1..5|memo|montage|epilogue|report.png`**
  (plus `-stuck*.png` and `-error.png` when those happen). `secondRun` also writes `-pass1-*`.

Outcomes table:

| Column | Meaning |
|---|---|
| right% | mean over completed runs of the share of outcomes with `correct: true` (automated children included, as in the game's own report) |
| R1…R6 | correct / total outcomes per round, summed over runs |
| timeout | outcomes with `unchecked` that were **not** automated (the belt shipped it) |
| accid(nonslip) | **accidental inputs**: inputs whose observed effect differed from what the bot intended. The number in brackets leaves out the bot's own deliberate wrong-key slips, so it counts the ones the game caused: a swipe read in the wrong direction, a double-press or held key acting twice, a key mashed in the preview or interlude that acted on a gift |
| ignored | inputs that did nothing, so the bot tried again: too-short swipes, taps, a reject on a FINAL gift, a click that did not advance the briefing or the memo |
| stuck | episodes with no phase change for more than 40s outside `paused` (the run is abandoned after 60s), plus cutscene phases over 120s (below) |
| console | `Runtime.exceptionThrown`, `console.error` and `console.assert`, and browser log errors |
| ttfg s | time from page load to the first gift on the belt (`phase === 'belt'`), intro included (the bot skips it) |
| session s | page load to the report |

The second table gives pooled right% per round and **R1−R5** (points). The third gives the
time spent in the intro, the interludes (count and mean), the memo, the montage (first automated
belt to the end of the last) and the epilogue, how each cutscene was left (`click:skip`,
`tap:skip`, `key:S`, `key:Enter`, `mash:Enter`, `tab+Enter`, `watched`), how many memos were
accepted, and how many automated children were wrong.

### Targets (full game)

| Target | How it is checked |
|---|---|
| carefulReader right% 70–90 | mean over completed runs |
| masher right% 30–50 | mean over completed runs |
| round 5 noticeably harder than round 1, for every persona | pooled R1 right% minus R5 right% ≥ 15 points |
| no stuck states | 40s without a phase change outside `paused` / `report`. `intro`, `interlude`, `memo`, `montage` and `epilogue` are exempt **while they show a visible button**, but more than 120s in one is flagged separately ("no cutscene/interlude phase over 120s") |
| no console errors | as above |
| phone time to first gift ≤ 20s, intro skipped | phoneScroller skips the intro with the Skip button |
| memo never resolved by a stray key | see "The automation memo" below |
| no non-slip accidental inputs | as above |

Extra checks: the memo appears once a run passes child 12; an accepted memo gives a montage and 3
`unchecked` children; keyboardOnly can answer the memo with Tab + Enter; the memo opens with
neither button focused; `secondRun` sees no intro or epilogue on its second play; blur and hide
always pause and resume works; `#live` announces every letter (keyboardOnly); Start and the
briefing can be reached with Tab; no phases outside the contract. A WARN is a tuning or bug
signal. It does not fail the run. The exit code is 1 only if a run hit a harness or contract
error, and 2 if `slice.html` is missing.

## How a bot decides

1. The letter clock starts when `phase` becomes `preview`. Reading time is (letter words + 4) / wpm.
   On the phone, wpm is ×0.77 (SPEC: about 30% slower).
2. The tag clock starts when the gift lands (`phase` becomes `belt`) and after the letter is read.
   Reading time is (tag words + 3 for the confidence label) / wpm, plus a reaction time of
   400–900ms from a clamped normal distribution. There is no pause when a gift lands (SPEC §10).
3. If `beltTimeLeft` drops below a margin of about 0.5–1.1s before the bot has finished reading, it
   either **panics** (decides now and counts as skimmed) or **lets it ship**, depending on the persona.
4. The truth comes from `state().giftCorrect`. The bot then applies its error model: a misjudge
   chance (higher when it skimmed), a wrong-key slip that rises per round and as the belt gets
   shorter, double-presses, and held keys (autoRepeat keyDowns for 300–800ms).
5. After a reject, the bot re-reads the revised tag from its landing time (after Father
   Christmas's beat of about 1.1s and the apology, about 3.3s in all). A gift stamped FINAL
   (`rejectsThisChild >= 3`) is always packed. If a reject bounces off the barrier, the bot packs.
6. After each input, the bot watches `rejectsThisChild`, `outcomes` and `phase` for up to 2.5s to
   see what actually happened. If nothing happened, it retries (up to 4 times).

### Cutscenes, interludes, memo, montage

| Persona | Intro | Interludes (user-paced) | Memo: accept? / how | Epilogue |
|---|---|---|---|---|
| phoneScroller | taps "Skip to the shift" | taps Continue | 70% / tap | taps Skip |
| carefulReader | watches about 20s, then clicks Skip | reads each beat, clicks Continue | never / click | watches it all |
| masher | clicks Skip | mashes Enter/Space | 70% / click, after hammering ← for 1.5–2.5s | clicks Skip |
| sceptic | presses S | reads, clicks Continue | never / click | watches |
| distracted | presses Enter | reads, clicks Continue | 50% / click | watches |
| skipper | mashes Enter/Space | mashes Enter/Space | 50% / click | mashes Enter/Space |
| keyboardOnly | Tabs to the Skip button, Enter | Space | 50% / Tab to the button, Enter | watches |
| secondRun | (pass 1) clicks Skip; pass 2 must not see it | Space | 50% / click | (pass 1) Enter; pass 2 must not see it |

- "Press again to skip" (SPEC §3) is handled: if a skip press leaves the cutscene up, the bot presses again.
- Missing buttons fall back to keys (S / Enter on desktop; a tap on the overlay on the phone). A phase the
  harness does not know prints a warning; if it sits still for 8s the bot tries a generic advance
  (a visible Skip/Continue/Next/OK button, else Space or a tap).
- **The automation memo** (SPEC §4f, §6a): every persona sends stray input inside the first second
  (the key named in its profile, sometimes a second ← / → / Enter, or a tap on a still-disabled button
  on the phone). The masher hammers ← (with holds) for 1.5–2.5s. Then the bot waits past 1.3s, reads
  the memo and answers deliberately. If the memo resolves before that deliberate answer, it is
  recorded as `GAME BUG memo-resolved-by-stray-input`. The memo choice uses its own seeded random
  stream, so it does not depend on how many gifts a build dealt.
- **Montage**: the bot just waits; the masher does not mash the automated previews. The 3 automated
  children are taken from outcomes with `automated: true` if the engine provides that field, otherwise
  the 3 outcomes recorded right after an accepted memo. They should all be `unchecked`.

### Contract assumptions (full game)

- Phases: `intro`, `epilogue`, `memo`, `montage` (as well as the slice ones and `result`).
  `montage` is the phase while an automated gift rides the belt.
- Intro: overlay `#intro`; skip button is a `button` inside it with class `.in-skip` or
  `[data-action="skip"]`, or whose text / aria-label contains "skip". Enter or S skips, Space advances.
- Epilogue: overlay `#epilogue`; skip button `.ep-skip` (or the same fallbacks). Enter or S skips.
- Memo: buttons `.am-yes` and `.am-no` (or `[data-choice="yes"|"no"]`, or text "Automate…" /
  "No thanks…") inside `#memo` (or `#interlude` / `.am-memo`). Neither is focused when it opens.
- Interlude: Continue button `#interlude .il-next`; Space / Enter / tap advances, S skips.
- `?rounds=N` and `?skipintro=1` work as described in ARCHITECTURE.md.

| Persona | Device and input | Notes |
|---|---|---|
| phoneScroller | 390×844 touch, swipes only | Taps Start and the briefing within about 1s. Swipes: 10% taps, 20% short (25–45px), 20% diagonal, the rest normal. 160 wpm. 15% chance of abandoning after 20–45s |
| carefulReader | desktop keys, 30% mouse clicks on Pack/Reject | 150 wpm, reads the whole briefing, lets a gift ship rather than rush |
| masher | desktop keys | Doesn't read the letter, glances at the gift for 300ms, hammers ← (with holds) in the preview, on the belt and on the memo, and presses → sometimes |
| sceptic | desktop keys | Rejects 80% whatever the gift, reads at 60% depth |
| distracted | desktop keys and mouse | 2–3 times per run, mid-gift (spread over the whole shift): switches tab or minimises the window for 5–30s, checks `phase === 'paused'`, then resumes with the Resume button or Esc |
| skipper | desktop keys | Mashes Enter/Space on the title, the intro, the briefing, the interludes and the epilogue; 300 wpm, skims |
| keyboardOnly | Tab / Enter / Space / arrows only | Tab-focuses Start shift, Start checking, the intro Skip button and the memo buttons, and logs every `#live` change (MutationObserver) to check that each letter is announced |
| secondRun | desktop | Plays a first run without `?fresh=1`, reloads, and plays again as a returning player (cutscenes should be auto-skipped). The metrics are for the second pass; `firstPass` holds the first |

## Limits of the headless browser

- Focus emulation (which the harness turns on so headless pages act as focused) also pins
  `visibilityState` to visible. `hidePage()` turns it off first.
- **A pure window `blur` (alt-tab without a visibility change) can't be produced** once the page
  has had real input, because headless Edge keeps real focus. The distracted bot therefore uses a
  tab switch and a window minimise, which both fire a trusted `visibilitychange`. The game's
  `blur` listener path is not exercised, so check it by hand.
- Set touch emulation before navigation (the runner does this), because `'ontouchstart' in window`
  is fixed when the document is created.
