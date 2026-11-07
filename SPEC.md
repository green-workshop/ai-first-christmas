# North Pole Ltd: AI-First Christmas — v2 spec (draft)

Status: **sixth pass done (a consistency sweep), no open questions**. The remaining unknowns, such as the timings and the reading load, can only be settled by playing a build. Items marked ❓ are open questions and ✅ items are decided.

Decided: the intro is an in-page animated SVG (no video file) · the player is the elf · the board are faceless suits · there's no leaderboard, but a round-by-round shift report · the intro storyboard is locked · gift pictures are custom SVG icons · interludes play between rounds, with a layoffs arc that ends with your own job · the AI you trained runs round 6 · the rehire is the closing film's last joke · the player used to design the toys · the game screen is a conveyor belt (left = pack, right = reject) with Father Christmas beside the rejects pile · the belt is the timer · each patch fixes one bug and introduces another.

## 1. Principles

- **Standalone.** One `index.html`, no network, no external fonts/scripts/media. Download it, double-click it, play it. Also works when hosted on GitHub Pages.
- **About 4–5 minutes for a first play:** about 69s of intro, about 45s of interludes, about 2.5 minutes of play and a closing film of about 30s at reading speed. A replay with the cutscenes skipped takes about 2.5 minutes.
- **Works on desktop and phone,** with keyboard, mouse and touch.
- **Generic satire, original art.** North Pole Ltd is invented. Father Christmas is a generic figure drawn by us, with no brands or famous designs. Credit: green-workshop, MIT.
- **Accessibility:** keyboard controls throughout, reduced-motion mode, readable contrast, and captions for everything said in every cutscene. Full details are in §6a.

## 2. Structure (screens)

```
Title ──► Intro cutscene ──► Shift briefing ──► Game (rounds 1–5, an interlude after each; the 5th is your sacking; round 6 runs without you) ──► Epilogue ──► Shift report
  │            (Skip ►)                         │ (Pause: Resume / Restart / Quit)
  └── Replay intro / Settings                   └──────────────────────► Title
```

- **Title screen:** Play, Replay intro (once the intro has been seen), Settings (sound on/off, reduced motion, relaxed belt, untimed belt, skip cutscenes), credits.
- **First play:** the intro runs automatically. Later shifts in the same visit go straight to the game, and the intro can be replayed from the title screen. The Replay intro button only appears after the intro has played. Progress lasts only while the page is open (§7).
- **Pause / Exit:** Esc or a ⏸ button pauses the timer and opens the menu: Resume, Restart shift, Quit to title ("Resign from North Pole Ltd"), with a confirmation before quitting. A browser can't close its own tab, so "exit" means going back to the title screen.

## 3. Intro cutscene (the "trailer")

Built **inside the page** with animated SVG/CSS and a scripted JS timeline rather than an embedded video file. That keeps the file small, makes it work offline, keeps it sharp at any size, and lets it be skipped, paused and captioned. It should look like a short animated film: camera pans, scene cuts, caption bars and simple character animation.

**Skip:** a "Skip ►" button in the corner, or **Enter or S**. Space or a tap advances to the next scene. **Esc always opens the pause menu**, everywhere in the game, and never skips. The first time a player presses skip, show "Press again to skip".

### Storyboard ✅ locked (about 69s; scene 7 extended in the third pass, scene 1 cut to 2s in the fifth)

✅ **Hooking phone players (fifth pass):**
- The **title screen is a joke in itself.** A green "AI ADOPTION: 100%" dashboard shows the use case as "TBC", and the main button is **"Start shift"**.
- A **"Skip to the shift"** button is visible from the first second of the intro.
- Every scene is **framed for portrait as well as landscape**. In portrait, the boardroom is shot from the end of the table, so the five board members aren't tiny.
- The first punchline should land within about 10 seconds of pressing Start.

| # | Scene | What we see | Text / dialogue (captions) | ~s |
|---|-------|-------------|----------------------------|----|
| 1 | Cold open | Snowy night. A quick camera drop to a glass office block with a sign on top: **NORTH POLE LTD**. | *1 December. Quarterly board meeting.* | 2 |
| 2 | The boardroom | A long table and five board members, as identical silhouettes in suits with name cards. A slide shows "AI" with a drawn rocket next to a hockey-stick chart with no axes. Father Christmas sits at the far end of the table. | Chair: "Everyone's doing AI." · Member 2: "Our competitors are doing AI." · FC: "We don't have competitors." · Member 3: "Exactly. Imagine if we did." | 12 |
| 3 | The edict | A scroll unrolls down the table, then a big red stamp comes down on it. | **EDICT: CHRISTMAS WILL BE AI-FIRST.** · FC: "…What will the AI do?" · Chair: "AI." · All: "Use case to follow." | 9 |
| 3b | The drawing office | You at a technical drawing desk, your blueprints pinned to the wall. Father Christmas walks in with his laptop and your designs fly off the wall into an upload. | *You design the toys.* · *Father Christmas uploads your designs to the AI.* | 5 |
| 4 | The grind (montage) | FC at a small desk with a glowing laptop. Through the window, day and night cycle quickly. A wall calendar flips from 2 Dec to 22 Dec. Mugs pile up, sweat drops appear, sticky notes multiply ("prompt", "prompt v2", "PROMPT FINAL final v7"), and the beard gets messier. Typing sounds play. | Captions flash: *Day 3: "What is a token?"* · *Day 9: "Make it better. Please."* · *Day 16: "Why does it keep saying I'm right?"* · *Day 21: (a drawn melting face)* | 12 |
| 5 | The reveal | Back in the boardroom. FC wheels in a trolley with a single **big green button** labelled **TURN ON AI**. | FC (exhausted): "It's… done." | 6 |
| 6 | The press | The chair presses the button. Lights flash, confetti falls, and a dashboard drops in showing **AI ADOPTION: 100%** in green. The board applauds. | Board: "Transformational." "Seamless." "Promotions all round." | 8 |
| 7 | The fallout | A hard cut to silence. A small elf at a desk in the basement. Sacks of letters crash down a chute, and a monitor reads **REVIEW QUEUE: 24**. Muffled cheering comes from upstairs as Father Christmas trudges down the stairs with his laptop and slumps at the desk beside the rejects bay. | *Christmas Eve. The AI is live. Someone has to check it.* · *That someone is you.* · *You used to design the toys. Now you check what the AI does with them.* | 12 |
| 8 | Handover | A title card zooms in: **North Pole Ltd: AI-First Christmas**, then fades into the shift briefing. | — | 3 |

✅ The board members are faceless suits: identical grey silhouettes with name cards.

### 3a. Closing film ✅ (about 30s at reading speed, skippable, before the shift report)

| # | Scene | What we see | Captions | ~s |
|---|-------|-------------|----------|----|
| E1 | Boxing Day+1 | *27 December. Year-end board meeting.* The same boardroom, with a giant cheque reading **"BONUSES: AI TRANSFORMATION"**, with **"Use case: TBC (next year)"** in large, legible type underneath. | Chair: "112% adoption. A record year." (the real final figure) | 5 |
| E2 | The verdict | One line that changes with your result (below). | | 5 |
| E3 | January | You, out of work and miserable, in the basement beside your cardboard box. Father Christmas is asleep on his tickets with your broken-toy pile behind him, at **the real size of your pile**. | January. Out of work. You kept the box. | Held |
| E4 | Autumn | A letter from the board, with the wrong toy on the floor: a child asked for a Wobblepod, the AI only makes what it learned, so it offered a teddy bear with wheels, and the robots built it perfectly. Please come back and teach it new toys. | Board: "The AI performed at 100%. Unfortunately, the children changed." | Held |
| E5 | Next year | The final image: you as a contractor at your drawing board, a robot beside you taking notes, and the contract: "Role: designing new toys and training the AI on them. Also checking the gifts, since you're there." "All designs remain the property of the AI." "Mittens not provided." | Back as a contractor, on double the day rate. Chair: "We have always believed in people." | Held |

✅ **E3 to E5 hold.** From the out-of-work scene on, each scene waits for a clearly visible **Next** button, or Space, Enter or a tap, because the joke needs reading (owner's playtest: it went by too fast). E1 and E2 stay on their timers. The last button reads "See your report", or "Back to title" on Replay ending. S and the Skip button still skip. With reduced motion, every scene holds.

The verdict line in E2 depends on how you did:
- **90% or more right:** a child's thank-you letter arrives addressed to "the elf". The chair reads it out: "'Dear Elf, thank you.' A lovely result for the AI."
- **40–89%:** a returns sack thuds onto the boardroom table. The board says, "Lessons will be learned."
- **Under 40%:** the dashboard is green and the window behind it is full of upset children. The chair says, "Promotion likely."
- ✅ **If the closing film is skipped** (by the button or by Skip cutscenes), the shift report still carries the verdict, the rehire (as a note) and the chain (§5).
- ✅ **Replay ending:** works exactly like Replay intro. The button is on the title screen, hidden until the ending has been shown once in this visit, and returns to the title when finished. It replays with the result of this visit's last shift. Leaving the film by Resign or Restart doesn't count as seeing it.

### Audio
Generated in code with WebAudio, so there are no sound files: typing clicks, the stamp thud, a button "boop", a confetti pop, and a soft looping bell melody during the game (an original tune, not a carol). Sound is off by default. A sound toggle (a drawn speaker icon) is on the title screen and in the pause menu.

### Reduced motion
The intro plays as a sequence of still comic-panel frames with captions that advance on a click or tap, and there's no camera movement.

## 4. Game (the fallout)

The core loop stays the same: letter → AI decision → approve or reject before the timer runs out → the AI says "You're absolutely right!" and revises. Planned v2 improvements:

- **Subtler mistakes later on.** Early mistakes are absurd ("4,000 left socks"). Later ones need a careful read: the wrong size or colour, the wrong child's gift, missing the "not" in "*not* a pink one", or gifts that don't suit the child's age.
- **Two or three wrong variants per child,** so replays feel different.
- **Fair difficulty:** the share of wrong answers is fixed per run rather than left purely to random chance.
- ✅ **An "AI confidence" label** on every decision, always between 97% and 99.9%. The figure is random and has **no link** to whether the AI is right, so it can't be used as a tell.
- **A board dashboard** that gets more absurd as initiatives pile up (adoption, synergies, reindeer redeployed).
- ✅ **Adoption overshoots 100%.** It hits 100% at the sacking, which is the board's reason for it, and ends at about 112%, with the board saying "Above target." The final figure is shown in the epilogue and the shift report.
- ✅ **"Use case to follow" never pays off.** Every interlude memo ends "Use case: to follow." and the epilogue cheque reads "Use case: TBC (next year)".
- **Mid-game events:** the board reviews your rejection rate (as ticker lines), and, after child 20, automates your job (§4f).

### 4a. Gift visuals: see what you're approving

- Every AI decision shows a **picture of the gift** next to its text, on a "gift card" with the AI confidence label.
- ✅ The pictures are **custom SVG icons drawn in code** (about 30, following the gift icon system in §9.5), not emoji, so they look the same on every device.
- Wrong answers get visual jokes, built from one icon set plus modifiers:
  - a count badge (a single sock with **×4,000**)
  - the wrong scale (a tiny toy versus a huge actual castle)
  - the wrong item (a bat with wings instead of a cricket bat)
  - the wrong colour
  - an empty dashed box for `[INSERT GIFT HERE]`
  - a "?" crate for hallucinated items
- **Where the gifts go** is covered in §4d: the conveyor belt.
- At the bottom of the screen, a **sleigh-loading strip** collects shipped gifts during the shift, both right and wrong. The end screen shows the full sleigh, with the wrong gifts highlighted ("Mia: 4,000 left socks").
- Later on, subtle mistakes such as the wrong size or the wrong colour won't always be obvious from the picture, so you still have to read the text. That's deliberate.

### 4b. Between rounds: interludes in the workshop

These replace v1's plain "New initiative" pop-ups. Every 4 children, a short **animated interlude** plays (about 8–10 seconds; skippable with the same controls as the intro), in the same style as the intro. ✅ It is staged in **three beats of about 3s each**, so only one thing is on screen to read at a time: (1) the memo, (2) the patch notes and issues board, (3) the workshop floor. If you skip it, a one-line patch note ("Patch v1.2 installed: fixed quantities") stays in the HUD for the next child. Each interlude shows these three things:

1. **The board's announcement:** the new initiative, shown as a memo or a slide.
2. **Father Christmas's office and the patch release.** A close-up of his screen shows the patch notes (§4e) shipping, along with:
   - ✅ **The issues board** is one combined tracker, merging what were the bug list and the Goods In returns. It's a whiteboard where tickets pile up and grow past the edge of the screen. The tickets come **from your actual shift**, and every wrong decision the AI made becomes one:
     - **Caught in QA (grey):** wrong gifts you rejected. "BUG-0042: child received a fully grown bear. Status: Won't fix. Working as intended."
     - **CUSTOMER RETURN (red, with a sack icon):** wrong gifts that got past you.
     - There's a counter for each. It's satisfying when the red count stays small, and the board fills up anyway.
     - The broken-toy pile on the game screen shows what you caught live. The issues board is the round's summary.
   - **Other things going wrong:** the mug pile, sweat, the beard getting messier, the phone ringing, the fax unrolling across the floor, a drone stuck in the chimney.
3. **The workshop floor:** a row of elves at benches. The **headcount changes** across the shift (see the arc below).

Satirical core: the board never sees any of this. Its dashboard says "No issues reported", because all the issues are reported to Father Christmas.

### 4c. The layoffs arc (across the 5 interludes of your first shift)

✅ The AI reads each letter and writes a build order; the workshop builds exactly what the order says; you check the finished gift against the letter. It never "picks" a gift. Elves build first, then robots replace them (the board calls that AI too), then the same elves come back as contractors to fix the robots.

| After child | Board initiative | Workshop floor | Board line |
|---|---|---|---|
| 4 | Letters now handled by LetterBot 3000 (use case TBC) | All elves present, building exactly what the AI orders. | "Early signs are very promising." |
| 8 | Naughty/Nice list replaced by sentiment analysis | **Layoffs, round 1.** Three elves walk out carrying boxes and robots roll in to their benches. | "AI is working. Building things is no longer a core competency." |
| 12 | Reindeer replaced by a drone swarm ("redeployed") | **Layoffs, round 2: another 40% cut.** Three more elves out, six robots in. The reindeer are seen leaving with a suitcase. | "Synergies realised. Robots are AI now. Headcount is a legacy metric." |
| 16 | AI will now write the AI strategy | Robots at every bench. **The same elves are back as contractors**, with gold CONTRACTOR badges and spanners, fixing the robots. One is still holding their leaving card. | "Strategy is fully automated. Nobody knows what it says." |
| 20 | **Your sacking.** Memo to the elf: "AI adoption has reached 100%. Your role is no longer required. Thank you for helping train the AI. It has your designs, and now it has your judgement: it gets {pct}% right, exactly like you. Please hand in your mittens." The reason is the dashboard, so it fits any score. {pct} is your rounds 1–5 right rate, which is the rate the AI now has. | Robots and contractors stay. **The last real employee, carrying a cardboard box. That's you.** You walk out slowly, so the caption lands while you can still see yourself. | "Thank you for your service. It was used for training." |

✅ **The rehire is the ending.** It used to be this interlude, with a "second checker" who gave back a little time. That made the elf a helper in a game about their replacement, so round 6 now runs without you (§4f) and the rehire closes the film (§3a): the AI only makes what it learned, so you come back to teach it new toys.

✅ **Robots build toys.** A robot at a bench works the same way an elf does: the same toy on the bench and the same hammering. Where a contractor is fixing a robot, the robot keeps building and the contractor has no toy. With reduced motion, the toy still sits on the bench.

✅ **Repeat shifts start where the story ended.** On any shift after a completed one in the same visit, every interlude floor shows the robots at the benches and the contractors maintaining them. No one leaves and the floor doesn't change from one interlude to the next. The interludes keep their patch notes, with five different memos and captions ("The robots will now supervise the contractors."). The sacking becomes the end of your contract: "Your contract has not been renewed. Your work will continue without you." Round 6 still runs at that shift's rate, and the closing film is unchanged.

✅ The original "40% elf cut" initiative merges into round 3 with the drones, and the sacking takes the 5th slot. That makes 5 interludes in total.

### 4d. The game screen: the conveyor belt

```
 ┌──────────────────────────────────────────────────────────────┐
 │ ⏸  Adoption 34% · Right presents 80% · Child 5/24 · Patch v1.1│
 │ Board: "Why are you checking? It's AI."                       │
 │  [letter: "Dear Father Christmas, I would like a bike…"]      │
 │                         ╔═AI HOPPER═╗                         │
 │                         ╚════╤══════╝                         │
 │  📦 PACKING   ◄══════════[ 🎁 gift ]══════════►   REJECTS     │
 │  (to sleigh)        ◄◄◄ belt crawls left ◄◄◄       🧸🔩🧦 pile │
 │                                                  🎅 desk + PC │
 │  [ ◀ Pack ]                                   [ Reject ▶ ]   │
 └──────────────────────────────────────────────────────────────┘
```

- **The gift drops** from the AI hopper onto the middle of a conveyor belt. Its picture and the AI's description are shown on a tag attached to it, with "AI confidence: 98.4%" (a random figure, see §4).
- ✅ **The letter comes first.** Each letter appears before its gift drops, with the belt standing still, so you can read it before the clock starts. How long it shows depends on the letter's length; all the timings are in §6.
- ✅ **Feedback is immediate.** As a packed gift lands, a ✓ or ✗ flashes on the sleigh strip and the Right presents meter updates. The interlude's issues board then sums up the round.
- **Push left = pack** (approve): it slides into the packing chute and on to the sleigh.
- **Push right = reject:** it shoots off the end of the belt and **lands on a pile of broken toys**. The pile really builds up over the shift and stays visible all game. ✅ Toys drop into **fixed stacking slots**, each at a slightly random angle so the pile looks tumbled. There's no physics engine.
- **Father Christmas is on screen** the whole time, at a desk next to the rejects pile with his laptop. **Every time a toy hits the pile**, he reacts:
  - he looks at it, scratches his head and types a bug fix (short typing animation, sweat drop)
  - a sticky note pops up on his monitor ("fix socks??")
  - if you rejected a **correct** gift, he holds it up, puzzled, and the sticky note reads "Not a bug?"
  - he gets visibly more frazzled over the shift (beard, mugs, sweat), so the "office getting worse" storyline now plays out live rather than only in the interludes
- **The AI's revision:** after a reject, the hopper says "You're absolutely right!" in a speech bubble, rewrites the build order, and the workshop's rebuilt gift drops onto the belt. Each child gets at most **5 gifts** (4 rejects), and each reject costs time.
  - ✅ **If you rejected a wrong gift**, each revision is right **50%** of the time, and the 5th gift is always right if it hasn't appeared yet, so every child's 5 gifts include the right one exactly once. Otherwise a revision is a generic AI-ism ([INSERT GIFT HERE], "As a language model…") or another wrong gift of the round's type, and it never repeats a gift already rejected for that child. **If you reject the right gift, it doesn't come back**, and the remaining gifts are all wrong, so a perfect score is never guaranteed. You have to read the revised gift as well.
  - ✅ **A scripted first gift.** On a first play, child 1's gift is always absurd and wrong (a fully grown bear for a teddy-bear letter). It moves at half speed with a pulsing → hint. That way every player rejects at least once and sees "You're absolutely right!" within about 15 seconds. Its revision is always right, and it counts as one of round 1's two wrong gifts.
  - **If you rejected a right gift**, the AI caves to a wrong one of the current round's type (§6). Rejecting that wrong gift then follows the rule above.
- ✅ **The belt is the timer:** the belt slowly carries the gift **left towards packing**. If you do nothing, it falls into packing and ships unchecked with an "UNCHECKED" stamp. Rejecting means pushing **against** the belt, which matches the corporate failure mode: shipping is the default. The belt speeds up slightly each round (§6), and a thin timer bar stays as a backup cue.
- **Controls change from v1** to match the belt directions. **← or A = pack** (approve), and **→, D or R = reject**. v1 had the arrows the other way round, so the README needs updating too. On a phone, you swipe.
- **Phone layout (portrait first):** the same scene, scaled down. The order from top to bottom is: meters, then the letter, then the belt, then Father Christmas and the pile, then the buttons. You **swipe left or right** on the gift, and the buttons stay. The board line shortens to a one-line ticker. On a phone, the sleigh strip becomes a counter (a sleigh icon and "9 packed"), and the full sleigh is shown at the end.
- **The belt never rewinds.** After a reject, the revised gift drops onto the belt where the old one was, and the belt keeps moving while the AI apologises. Rejects therefore eat into the same time budget, which is what stops an endless reject loop.
- **After the 4th reject**, the revised gift arrives stamped **"FINAL. NO FURTHER REWORK."** Pushing it right makes it bounce off a barrier back onto the belt ("Rework budget exhausted"), so it has to be packed or left to ship.
- ✅ **The Reject button wears out, per child.** 2 rejects on one child: a wisp of smoke. 3: heavier smoke and a scorched look. 4th: sparks and a zap, and it shorts out and is really disabled (with a toast and a screen-reader announcement). Keyboard and swipe rejects on the 5th gift still get the barrier refusal above. Wear below 4 clears on the next child.
- ✅ **The repair droid.** If the button shorted, a small droid rolls in after that child's result, swaps in a fresh keycap, leaves with the burnt one, and is gone before the next letter or interlude. With reduced motion there's no droid: the charred button stays for a beat, then it's swapped and a toast says a droid replaced it.

### 4e. Patches: fix one bug, introduce another

During each round, Father Christmas writes fixes for the bugs piling up. **In each interlude his patch ships**, and it really does change the AI:

- The patch **fixes one type of mistake**, which stops appearing for the rest of the game.
- It **introduces a new type of mistake**, which is usually subtler.

This also gives the game its difficulty curve: absurd mistakes early on, then mistakes you can only catch by reading the letter properly. You learn to spot one thing, and the patch takes it away and adds something new.

| Round | Children | Mistakes that appear this round | Patch in the interlude before it |
|---|---|---|---|
| 1 | 1–4 | **Too literal:** a real bear, an actual castle, a red kite (the bird) | — |
| 2 | 5–8 | **Wrong quantity:** 4,000 left socks, 32 pawns, one boot | **v1.1:** "Fixed: AI no longer takes things literally." · Introduced: quantity bugs |
| 3 | 9–12 | **Mixed-up children:** you get a gift another child in this round asked for (the pairs are pre-written, and the names are clearly different) | **v1.2:** "Fixed: quantities normalised." · Introduced: child mix-ups |
| 4 | 13–16 | **Wrong spec:** wrong size, wrong colour, wrong age ("bike" → a 26-inch adult road bike for a 5-year-old) | **v1.3:** "Fixed: gifts now matched to the correct child." · Introduced: spec drift |
| 5 | 17–20 | **Missing the "not":** "a scooter, *not* a pink one" → a pink scooter; "anything *except* socks" → socks | **v1.4:** "Fixed: sizes and colours." · Introduced: negation blindness |
| 6 | 21–24 | **Confidently plausible:** a nearly right gift with a hallucinated detail ("brick castle set, 1,200 pieces, includes a working moat") | **v2.0 ("AI-written"):** "Fixed: everything." · Known issues: "None detected. Confidence: high." |

- **The children are written per round.** ✅ Each round has its own pool of **5 children**, and their letters and wrong answers are written for that round's bug type. Each run draws 4 from each pool, which gives 30 children in total, so replays still vary. Round 3's mix-ups use pre-written pairs: a child's wrong gift is another named child's request, shown within the same round. The names in a pair are clearly different (never Mia and Mya), so the test is reading the gift, not telling similar names apart. That matters for dyslexic players. Each child has 2–3 wrong variants of their round's type. These are used for the first gift, for wrong revisions and for when the AI caves.
- **The letters get more detailed** as the rounds go on, so that the later mistakes can be caught. Early letters are one line ("I would like a bike"). Later ones carry a detail that matters: an age, a size, a colour, a "not", or a "my brother already has one".
- Generic AI-isms (`[INSERT GIFT HERE]`, "As a language model…") can appear in any round, mostly when the AI revises a gift after a reject.
- **The interlude shows the patch notes** on Father Christmas's screen as a short changelog, next to the growing issues board.
- ✅ **The notes only say what was fixed**, like a real changelog. The "Introduced:" column in the table above is for the designers and is never shown to the player. Every changelog ends with "Known issues: none." You find the new bug yourself. The shift report then names each round's bug type.
- **The board's reaction to every patch:** "Another release! Velocity is up."

### 4f. Round 6 runs without you ✅ (after child 20)

The player's job is getting children the right present, so a mid-game offer to stop checking never fitted. Instead the board's dashboard decides for you: you play rounds 1–5, adoption reaches 100%, and interlude 5 is your sacking (§4c).

- **The toast:** after that interlude, even if it's skipped: "Your role has been automated. Round 6 is running without you."
- **The montage:** round 6's 4 children ship unchecked as a **2× speed montage** of about 14 seconds. Pack and Reject are disabled. Each letter and gift whizzes past and into packing while the board cheers, and you can see each ✓ or ✗ as it lands.
- **The AI is exactly as good as you:** its accuracy is your rounds 1–5 right rate, rounded to whole children (`round(4 × right / played)`), so 70% gives 3 of 4. It's decided once, in a shuffled order, on the first automated child, before any gift is picked, so the wrong gifts really ship.
- **The report** shows your score and the AI's side by side (§5).

### Closing note
At the end: "The only skill in this game was a human checking the output."

## 5. Shift report (round by round)

✅ **No leaderboard.** The game is played locally and isn't competitive, so instead of ranking players it tracks **how you did in each round** and shows that on the end screen as a shift report from Father Christmas's desk.

Each round has its own type of mistake (§4e), so the report tells you **which kinds of AI error you catch and which ones get past you**:

Each child gets **exactly one final outcome**, so the columns add up to 4 per round. Round 6's row is labelled as the AI's:

| Round | Bug type | Right first time | Caught & fixed | Missed | Talked out of it | Shipped unchecked |
|---|---|---|---|---|---|---|
| 1 | Too literal | 2 | 2 | 0 | 0 | 0 |
| 2 | Wrong quantity | 2 | 1 | 1 | 0 | 0 |
| … | … | … | … | … | … | … |
| 5 | Missing the "not" | 0 | 1 | 2 | 0 | 1 |

Outcomes are decided in this order, and the first rule that matches wins:
1. **Shipped unchecked:** the final gift timed out, or it was in round 6 (§4f). It shows as ✓ or ✗ depending on whether it happened to be right.
2. **Talked out of it:** the AI's first gift was right, you rejected it, and the gift you finally packed was wrong.
3. **Missed:** the gift you packed was wrong.
4. **Caught & fixed:** the AI's first gift was wrong, and the gift you finally packed was right.
5. **Right first time:** the gift you packed was right, with no wrong gift before it. A right gift you reject never comes back, so that child's outcome is "Talked out of it".
- ✅ **The mirror line:** for a round where you packed a gift that ignored a "not" (or another detail in the letter), the report adds: "You and the AI both skipped the 'not'." It appears once per round at most, and that round then gets its "bad" comment even at 3 of 4, so the two notes can't contradict each other.
- The report also includes "AI confidence on wrong gifts: average 98.8%", plus a selection of Father Christmas's sticky notes from the shift ("Not a bug?"), so the small jokes land even if you missed them during play.
- **The payoff is protected from mashing.** The one-line epilogue verdict always shows, even when cutscenes are skipped. Nothing on the shift report has focus when it opens, and input is ignored for its first second.
- **Weakest round** is the one of yours (rounds 1–5) with the fewest right outcomes. A tie goes to the later round. Four children per round is a small sample, so the report says "Your round 5", not "your skill at negation".
- There's a one-line comment for each of your rounds, in Father Christmas's voice: "Round 5: the 'not' got you. It gets everyone."
- At the top: the overall right-presents %, the board's adoption figure (over 100%, as always), the end verdict, and two plates side by side: **You** (14/20) and **The AI you trained** (3/4). Those two are hidden if `?rounds=` stops before round 6.
- Notes add the AI's score, and the sacking is in the copy-result text.
- ✅ **The chain** closes the report: "Before: elf designs toy → elf builds toy." "After: elf designs toy → AI learns it → AI sends the order → elf programs robot → robot builds toy → elf checks toy." "Headcount: 0. Cost: double. AI adoption: 100%."
- The **sleigh** (§4a) appears next to it, with the wrong gifts highlighted.
- **Last shift, for comparison:** the previous run's per-round results are kept in the browser on this device, so you can see whether you've got better ("Round 5: 1/4 → 3/4"). There are no names and no ranking. If browser storage is blocked, the game still plays and only the comparison is missing.
- The copy-result text summarises the shift, including your weakest round ("I'm fine with fake castles but the 'not' gets me every time").

## 6. Details settled in review
- **Caving uses the current round's bug type.** If you reject a correct gift in round 5, the AI "fixes" it with a negation mistake, and so on for each round.
- **Timing** (fifth pass, from the human-playstyle review; the starting values for tuning):
  - **Letter preview:** 1.2s, plus 0.15s for every word over 8, capped at 4s. A 30-word round 5 letter gets 4s with the belt still. Any input drops the gift early.
  - **Belt, by round:** 9 → 8 → 8.5 → 10 → 10s for rounds 1–5 (raised after playtests: the careful-reader bot was timing out, and the owner found the last rounds too fast). Round 6 is the montage. The belt does **not** keep speeding up while the letters get longer; the subtler bugs carry the difficulty instead.
  - **Repair droid:** a one-off 3.7s after a shorted child's result, in place of the usual 1.8s (2s with reduced motion).
  - **Rejects:** Father Christmas reacts for about 1.1s, then the AI apologises, about 3.3s in all. A revised gift always gets **at least 5s** on the belt (raised from 3.5s after the playtest: re-reading a revised tag takes a 150–200 wpm reader about 4–4.5s).
  - **Multipliers:** phone ×1.15; the Relaxed belt setting ×1.5. There is also an **Untimed belt** setting, where gifts wait for you, for screen-reader users and anyone who wants it.
  - **Design rule:** a careful reader at about 200 wpm must be able to judge every gift in time at default settings. Checking is the skill the game rewards, so it can't be made impossible.
- **Wrong-answer rate per round** is dealt from a shuffled deck rather than rolled at random: exactly 2 of the 4 children in rounds 1–2, and exactly 3 of the 4 in rounds 3–5. Round 6 follows your own rate instead (§4f). Runs are therefore comparable from one shift to the next.
- **Reduced motion in the game:** the belt is drawn but doesn't move, the timer bar does the work, gifts snap to where they're going, and Father Christmas swaps poses instead of animating.
- **Pause** works during the intro and the interludes too (Esc), not just during play.
- **Where's the elf?** You *are* the elf: we see your mittened hands at the edge of the belt pushing gifts. Father Christmas is down in the basement with you, fixing bugs.
- **Shift briefing** (a card shown just before the first child): "← Pack · Reject → · Esc pause". It shows a 3-second animation of the belt carrying a gift into packing, with the line "If you do nothing, it ships." On a first play, it's followed by the scripted first gift (§4d).

### 6a. Behaviour details
- **Input and state:**
  - Input is ignored while a gift is in flight, during the letter preview and during the apology. It is **not** buffered for the next gift.
  - Key auto-repeat (`e.repeat`) is ignored. A key must be released between decisions.
  - For 300ms after a gift lands, input is locked out, so a panicked double-press can't act on a gift nobody has seen.
  - Pause freezes everything, including in-flight animations and the apology.
  - Esc on an open menu resumes; Esc on the quit confirmation cancels it.
  - Hiding the tab **or the window losing focus** (`visibilitychange` and `blur`) auto-pauses the game, because alt-tab often doesn't fire `visibilitychange`. On resume, the letter is shown again with a 3-2-1 countdown.
  - Resizing re-lays-out the screen, and rotating a phone pauses it.
  - Restart re-deals the children and clears the button wear and the droid. Restarting or quitting doesn't save the shift as "last shift".
  - "Press again to skip" applies to the intro. The closing film skips on the first press.
  - If browser storage is blocked, every play counts as a first play.
- **Phone input:**
  - The play area uses `touch-action: none`, and the viewport is fixed so nothing scrolls during play.
  - The **whole belt band** is the swipe zone, inset about 24px from the screen edges so iOS's edge swipe doesn't trigger Back. A `pushState` guard catches a stray Back. The gift tag sits *above* the gift, so a thumb never covers it.
  - A swipe needs about 40px of travel or a quick flick, and its direction is taken from the dominant axis. A tap flashes the hint "Swipe ← or →".
  - The letter stays on screen until the child's final decision, including during revisions.
  - In landscape, the letter and Father Christmas sit side by side with the belt below them.
- **Controls:** D also rejects (A/D pair), alongside R and →.
- **Accessibility:**
  - An aria-live region reads out each letter, the gift tag, the outcome and Father Christmas's sticky note.
  - The play area has `role="application"` so the screen reader doesn't take over the arrow keys, and the briefing mentions the A/D keys as well.
  - Gift tags always **name the colour and size** in text, so colour bugs are never colour-only.
  - The interludes and the epilogue are captioned too.
  - Focus is trapped in the pause menu and the confirmation dialogs, and returned when they close.
  - Reduced motion defaults on when the system setting `prefers-reduced-motion` is set. Interludes and the epilogue then become still frames that you advance with Space or a tap. The "FINAL" bounce shows as a barrier icon plus a text line.
  - Scene 6's flashing stays under 3 flashes per second.
- **No emoji in the art or UI.** Icons such as the rocket, the melting face, the sleigh, pause and sound are drawn in SVG like everything else.
- **Copy result:** use `navigator.clipboard`, and fall back to a selected textarea with "Press Ctrl+C" on `file://` or wherever the clipboard is unavailable.
- **Naming:** no real product names anywhere (no "ChatBot", no brick-toy brands, no real AI assistant names). The credits say "North Pole Ltd is fictional."

### 6b. Build notes
- Keep `window.__game` test hooks (state, plus a way to fast-forward through the cutscenes) so the game can be played through automatically in a headless browser.
- The file is about 455 KB, over the first target of about 400 KB. All the art is drawn in code.
- The README is updated to match: the new controls, how to skip, and how to play offline.

### 6c. Playtesting: test like humans, not robots ✅
v1 was only tested with three robotic playthroughs (perfect play, all timeouts, reject-everything). That proves the code runs, not that people can play it. v2 is tested in two layers.

**Layer 1: simulated human players** (scripted bots in a headless browser, driven through real input events: keys, clicks and touch swipes, never by calling the game's functions directly). Each bot plays several full runs at desktop and phone sizes, and behaves like a person:
- A **reaction time** of 400–900ms with random variance, plus a **reading time** of about 200–250 words per minute (about 30% slower at phone size). The bot can only judge a gift once it has "read" the letter.
- An **error model:**
  - a 5–15% chance of misjudging a gift it has fully read
  - a high chance of missing a "not" when skimming
  - a small chance of pressing the wrong arrow, which rises as the belt speeds up
  - occasional double-presses and held keys
- **Persona profiles:**

| Persona | Behaviour |
|---|---|
| Phone scroller | One thumb, sound off, never reads the briefing, sometimes gives up after 20s. Swipes are sloppy: short, diagonal, and sometimes a scroll. |
| Careful slow reader | Reads every word at about 150 wpm, never rushes, and times out on long letters. |
| Masher | Looks at the picture only and hammers ← with key repeats. |
| Sceptic | Rejects about 80% of gifts, whatever they are. |
| Distracted worker | Alt-tabs mid-gift, comes back after 5–60s, and pauses and resumes. |
| Skipper | Mashes Enter or Space through every cutscene. |
| Keyboard-only / screen reader | Uses Tab, Enter and the arrow keys only, and checks that every announcement happens. |
| Second-run player | Plays a repeat shift in the same visit: cutscenes auto-skipped, plays faster, and knows the jokes. |

- **What the bots measure:**
  - right-presents % per persona
  - timeouts per round
  - accidental inputs (presses or swipes that did something the bot didn't intend)
  - stuck states
  - console errors
  - time to first gift
  - total session length
- **Targets** (tuned during the build):
  - A careful reader averages **70–90%**, and it isn't impossible.
  - A masher averages **30–50%**, so it's possible to lose.
  - Round 5 is noticeably harder than round 1 for every persona.
  - No persona hits a stuck state or a console error.
  - The phone scroller reaches the first gift within **20 seconds** of opening the page, with the intro skipped.

**Layer 2: fresh-eyes reviews of real screenshots and recordings** by independent reviewers who play the build as the personas above. They report confusion, missed jokes, unfair moments and anything that looks cheap. This includes the art checklist (§9, art direction).

Belt timings, letter lengths and the error rates are then tuned from the Layer 1 results, rather than from guesswork.

## 7. Decided in the second pass ✅
1. **Length:** a first play takes about 4–5 minutes, which is fine. A replay takes about 2.5 minutes. Settings has a **"Skip cutscenes"** toggle, which switches itself on after your first complete shift of a visit and can be turned off again. The toggle skips the **intro and the epilogue** only. Interludes always play in full, because the patches are the core mechanic. Each interlude can also be skipped on its own.
2. **Epilogue:** yes. See §3a.
3. **The automation temptation:** dropped. A sacking replaces it, see §4f.
4. **Progress lasts only while the page is open.** A new visit or a reload is a first shift: the opening film plays, the cutscenes are the original ones, and there are no Replay buttons until each film has been seen. A shift started after a completed one in the same visit gets the repeat-shift cutscenes (§4c). Repeat-shift state, the Replay buttons, the last shift's result (and its "last:" figures on the report) and the automatic Skip cutscenes are held in memory. Settings the player sets, including a Skip cutscenes tick made by hand, stay saved. Flags saved by older builds are cleared once.

## 8. Out of scope for now
- Leaderboards of any kind (local or online), and image share cards.
- Multiple languages.

## 9. Art direction ✅ (fifth pass: "nice, not cheap")

### 9.1 Style
The game is **soft-shaded flat vector in a warm, lit diorama**. Shapes are chunky and rounded, with big readable silhouettes. Every surface has at least two tones and is lit by one warm key light from the upper left. The world sits in cool blue night or basement shadow, so warm pools of lamplight carry the eye. It should feel like a premium mobile puzzle game or a polished animated explainer: clean geometry, a few well-chosen textures, and nothing scribbly, photographic or glossy.

**Principles**
1. **One light, every time.** The key light comes from the upper left at about 35°, and cool bounce light comes from below. Every object, icon and character obeys this.
2. **Warm inside, cool outside.** Interiors glow amber and exteriors and shadows go blue.
3. **Shape before detail.** Each element must read as a solid silhouette at 32 px. Detail is added only above that.
4. **Soft edges, no outlines.** Edges come from tone breaks and rim light, not black strokes.
5. **Quiet backgrounds, loud actors.** Backgrounds are hazy and low in contrast. Gifts, buttons and Father Christmas get the highest contrast in the frame.

### 9.2 Palette (CSS custom properties)
| Token | Hex | Use |
|---|---|---|
| `--night-900` | `#0E1530` | sky top, deepest shadow |
| `--night-600` | `#24356B` | sky horizon, distant buildings |
| `--snow` | `#EEF3FA` | snow, highlights |
| `--snow-shade` | `#A9B8D6` | snow shadow side |
| `--lamp` | `#FFC873` | warm light, windows, rim light |
| `--lamp-deep` | `#E8914A` | warm shadow, wood |
| `--board` | `#6B7A90` | suits, boardroom |
| `--board-dark` | `#3B4659` | suit shadows, table |
| `--pole-red` | `#C23B3B` | Father Christmas's coat, stamp, logo |
| `--pole-green` | `#2E7D5B` | elves, foliage, TURN ON AI base |
| `--gold` | `#E6B54A` | brass, trim, adoption meter |
| `--paper` | `#F6EFE1` | memos, tags, cards |
| `--ink` | `#1E1A2E` | all body text |
| `--ink-soft` | `#5A5470` | secondary text |
| `--good` | `#2A7FD4` | correct cue (blue), always with a tick shape |
| `--bad` | `#E5762B` | wrong cue (orange), always with a cross shape or sack icon |

Contrast:
- `--ink` on `--paper` is about 15:1, and `--ink-soft` on `--paper` about 6:1. This is the default text pairing.
- `--snow` on `--night-900` is about 16:1, and `--gold` on `--night-900` about 8:1.
- `--good` and `--bad` are fills only, never text colours, and their labels are always in ink. Blue and orange stay distinct under all common forms of colour blindness.
- Red and green are for the world, never for feedback.

The tick and cross marks are drawn as SVG paths rather than text glyphs, because some platforms render those glyphs as emoji.

### 9.3 Rendering techniques
- **Gradients:** a single 2-stop linear gradient per major surface, running from the lit side (+8% lightness) to the shade side (−10%), angled at 35°. Define about 12 shared gradients in one `<defs>`. Never more than one gradient on an object smaller than 48 px; small parts use flat tone plus a highlight shape.
- **Contact shadows and ambient occlusion:** every grounded object gets an ellipse in `--night-900` at 25–35% opacity, about 1.1× the object's width, using the shared `feGaussianBlur stdDeviation="3"` filter. Do the same in creases, such as under the table and the belt lip. No offset drop shadows.
- **Grain:** generate noise **once** at load with feTurbulence (`baseFrequency 0.9`, 2 octaves) rendered to a 256 px canvas. Apply it as a repeating CSS background on a full-screen overlay at 5–7% opacity with `mix-blend-mode: soft-light`. Never put a live feTurbulence filter on an animating element.
- **Rim light:** a 1.5–2 px `--lamp` crescent path (not a stroke) on the edge facing the light, on characters and hero props only.
- **Outlines:** none. The only exception is a 2 px `--ink` stroke at 60% opacity on gift icons below 40 px, for legibility.
- **Depth:** 3–4 parallax layers per exterior scene. Far layers shift towards `--night-600` with a haze rectangle at 30–50% opacity, and get lower contrast and less detail.
- **Snow:** a canvas layer with 3 depths of flakes (60, 40 and 20 flakes; radius 1, 1.8 and 3 px; speed 15, 30 and 60 px/s) with a sine drift. Cap at 120 flakes, or 60 on screens below 400 px wide.
- **Vignette:** a radial gradient overlay from transparent to `--night-900` at 45% opacity, starting at 60% of the radius.
- **Avoid:** pure single-tone fills on anything large; system-font titles; mixed icon styles; hard black offset shadows; gradient overload; glossy "web 2.0" highlights; pure `#000` or `#FFF`.

### 9.4 Characters
- **Father Christmas:**
  - 2.5 heads tall and pear-shaped. The beard is one big cloud shape that covers the mouth. The face is just two oval eyes, a round nose and eyebrows.
  - Expressions come from the **eyebrows (angle) and eyes (size, half-lid)**, which read at 60 px.
  - Frazzle stages: (0) a smooth beard; (1) 3 stray tufts and a sweat drop; (2) the beard silhouette goes jagged, eye bags appear and the hat tilts; (3) a crumpled hat, a beard full of sticky notes and spiral eyes in hard moments.
  - Generic and original: a plain coat with no belt-buckle motif, no rosy-cheek shine and no twinkle, a muted `--pole-red`, and **reading glasses as his signature**.
- **Board members:**
  - Identical capsules with broad shoulders and no neck. The head is a smooth `--board` oval with a single soft highlight and no features.
  - They stay appealing through tidy tailoring (a lapel V and a tie), synchronised gestures (nodding and clapping in unison) and name cards.
  - Their only emotion is posture.
- **Elves:** 2 heads tall, with big round heads, a pointed `--pole-green` hood and dot eyes. The player's mittens are chunky `--pole-red` knit with a 2-tone rib pattern, entering from the bottom edge.
- **Rig:** each character is a `<g>` holding named child groups (`torso`, `head`, `brow-l`, `brow-r`, `arm-l`, `arm-r`, `hand`) with `transform-box: fill-box` and `transform-origin` set at the joint. Animate only `transform` and `opacity`. Swap expressions by toggling prebuilt brow and eye variants.

### 9.5 Gift icon system
- **Grid:** 64×64 viewBox, 4 px padding and a 56 px live area. Objects sit on a baseline at y=56, with a shared contact-shadow ellipse beneath.
- **Corner radius:** 6 px on boxy forms and 3 px on small parts.
- **Shading:** 3 tones: base, shade (the lower-right half, −15% lightness) and one highlight shape on the upper left (+20%).
- **Template:** `<symbol id="g-bike" viewBox="0 0 64 64"><ellipse class="cast"/><path class="base"/><path class="shade"/><path class="hi"/></symbol>`. Colours come from CSS classes, so a single `--gift-hue` variable recolours an icon.
- **Wrong variants** use the same symbol plus an overlay layer:
  - **×4000:** a `--gold` enamel pill badge in the top right, with ink text.
  - **Wrong scale:** a tiny copy beside a cropped giant one that breaks the frame.
  - **Wrong colour:** a `--gift-hue` swap, with the tag naming the colour in text.
  - **"?" crate:** a wooden box with a stencilled question mark.
  - **[INSERT GIFT HERE]:** an empty dashed outline (2 px, 6/4 dash) with a faint placeholder cross.
- One builder draws all of the icons, about 30, in one pass, for consistency.

### 9.6 Typography
- **Stack:** `ui-rounded, "SF Pro Rounded", "Segoe UI Variable Display", "Segoe UI", system-ui, sans-serif`. Use `ui-monospace, "Cascadia Mono", Consolas, monospace` for patch notes and tickets.
- **Logo and title only:** hand-built SVG lettering paths in a chunky, rounded slab with a `--gold` bevel highlight and a `--pole-red` face. Keep it under about 6 KB and reuse it via `<use>`.
- **Scale** (in rem, at a 16 px base):

| Use | Size | Notes |
|---|---|---|
| Caption | 0.8125 | |
| Body | 1 | |
| Letter | 1.0625 | 1.5 line height |
| Tag | 0.9375 | weight 600 |
| HUD value | 1.5 | weight 800, tabular numbers |
| Heading | 1.75 | weight 800, −0.01em tracking |
| Labels | 0.75 | uppercase, +0.08em tracking |

Nothing smaller than 0.8125 rem on a phone.

### 9.7 Motion
- **Easing:** entrances `cubic-bezier(.2,.8,.2,1)`; exits `cubic-bezier(.5,0,.75,0)`; pops `cubic-bezier(.34,1.56,.64,1)`.
- **Durations:** UI 180 ms, gift drop 420 ms, push 260 ms, stamp 300 ms, scene cut 450 ms.
- **Squash and stretch:** gifts landing go to scale (1.12, 0.88) for 80 ms, then settle. The stamp rises 8 px over 120 ms in anticipation, slams down, and shakes the camera by 3 px for 150 ms.
- **Camera:** each intro scene is a `<g class="cam">`, transformed by translate and scale over 3–6 s with a slow ease-in-out. Scene 1 is a downward drift with parallax. Scene 2 is a slow dolly-in at 1.0→1.08. Use a hard cut into scene 7.
- **Reduced motion:** the same compositions as still panels. Use 200 ms crossfades only, with no translate, scale, shake or snow. Confetti becomes a static burst.

### 9.8 UI chrome: it belongs to the world, not a web form
- **Memos:** `--paper` with grain, a 0.5° tilt, a letterhead rule, and a red rubber-stamp mark (rotated −8°, 85% opacity).
- **HUD meters:** enamel sign plates (a `--board-dark` face, a 2 px `--gold` bevel, 8 px radius) with a recessed fill track.
- **Buttons:** chunky 3D keycaps with a 4 px darker base lip that compresses to 1 px on press. The minimum touch size is 48 px.
- **Modals:** a clipboard or brass-framed panel.
- **Gift tags:** a manila tag with a punched hole and string.

### 9.9 Performance and size
- Put all props in one `<svg hidden>` sprite with `<symbol>` elements, and place them with `<use>`. Share gradients and filters from one `<defs>`.
- **Budget:** art 220 KB, code 120 KB, text 40 KB. Round path coordinates to 1 decimal place.
- Off the hot path on low-end phones: live blur filters (pre-bake the shadows), live grain, and parallax beyond 2 layers.
- Animate `transform` and `opacity` only. Pause the snow canvas when the tab is hidden, and during play on phones.

### 9.10 Art review checklist (yes/no per screenshot; used in §6c Layer 2)
1. Is light visibly coming from the upper left on every object?
2. Does every grounded object have a soft contact shadow?
3. Are there no pure flat single-tone shapes larger than 48 px?
4. Are there no black outlines (except small gift icons)?
5. Is the title in hand-built lettering, not a system font?
6. Is there a clear warm/cool temperature contrast?
7. Is the focal actor the highest-contrast element on screen?
8. Do all icons share the same radius, shading and baseline?
9. Is every good/bad cue paired with a shape, and is text in ink?
10. At 375 px wide, is all text at least 13 px and every silhouette still readable?
11. Is there no emoji, no recognisable brand, and nothing that looks like clip art?
12. Is the background hazier and lower in contrast than the foreground?

## 10. Slice playtest learnings ✅ (author play-throughs and bot runs on the rounds 1–2 slice)
These override earlier sections where they differ.
- **No pause when a gift lands.** The belt pressure starts straight away; that's the game. A reading hold was tried, and it made the game too easy, so it was removed. The letter preview before the drop stays.
- **Belt timings:** rounds 1–2 are 9s and 8s. A revised gift always gets at least 5s.
- **Father Christmas gets his own beat on every reject.** The toy lands on his pile, the belt dims and his panel is spotlit for about 1.1s, and his sticky note also appears as a large caption for about 3.5s. Only then does the AI apologise. The whole apology takes about 3.3s. Without this, nobody saw him.
- **Desktop layout:** the belt and desk panels share the width 3:2, so Father Christmas is big enough to read. Phone layout is unchanged; it already worked well.
- **Pause between children:** about 1.8s, so the result lands.
- **Interludes are user-paced:** four beats (memo → patch notes → issues board → workshop floor). Each waits for Continue, Space, Enter or a tap, and S skips the lot. Timed beats were too dense and too quick.
- **The shift report** waits for the player, as before.
- **Bots:** the carefulReader, masher, phone and accessibility targets pass on the slice. The masher is about 50% there by construction, because rounds 1–2 are half wrong.
