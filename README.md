# North Pole Ltd: AI-First Christmas

A short browser game about checking AI output on Christmas Eve.

> **Beta test.** Play it at **https://green-workshop.github.io/ai-first-christmas/**. If something is broken, unclear or unfunny, please [open an issue](https://github.com/green-workshop/ai-first-christmas/issues) or tell me directly.

The board of North Pole Ltd has mandated an AI-first Christmas, with the use case to follow. You are the elf who designs the toys, until Father Christmas uploads your designs to the AI. Now the AI reads each letter and writes a build order, the workshop builds exactly that, and you check the finished gift against the letter. You pack it or reject it before the belt carries it off unchecked. If you reject something, the AI tells you you're absolutely right and the workshop rebuilds it.

## Play

Download `index.html` and open it in any modern browser. There is nothing to install and no network is needed, so it works offline. It also runs on GitHub Pages.

| Action | Keyboard | Phone |
|---|---|---|
| Pack the gift (approve) | `←` or `A` | swipe left, or **Pack** |
| Reject it | `→`, `D` or `R` | swipe right, or **Reject** |
| Pause, resign or restart | `Esc` | the pause button |
| Next scene / continue | `Space` or `Enter` | tap |
| Skip a cutscene | `Enter` or `S` | **Skip** |

If you do nothing, the belt ships the gift unchecked. That's the corporate default.

A first play takes about 5 minutes, including a 69-second intro. After your first complete shift, the cutscenes are skipped automatically; you can change this in Settings on the title screen.

## How it works

- 24 children over 6 rounds, of which you check the first 5. Each round has its own kind of AI mistake, and the mistakes get subtler as the shift goes on: too literal, wrong quantity, mixed-up children, wrong size or colour, ignoring the word "not", and confident little hallucinations.
- Between rounds, the board announces an initiative and Father Christmas ships a patch. It fixes one bug and introduces another. Elves are replaced by robots, which the board also calls AI, and then rehired to fix them. Eventually adoption reaches 100%, and that's you gone too.
- Round 6 runs without you, on an AI trained by you. It's exactly as accurate as you were.
- The shift report sets your score beside the AI's and breaks down each round: what you caught, what got past you, and how often you talked the AI out of a right answer. The board measures adoption, which only goes up.

## Settings

- **Relaxed belt:** 50% more time.
- **Untimed belt:** gifts wait for you.
- **Reduced motion:** the cutscenes become still panels. This is on automatically if your system asks for reduced motion.
- **Sound:** generated in the browser; off by default.
- **Skip cutscenes:** skips the opening and closing films. It turns itself on after your first complete shift, until you close the page.

Your settings are kept only in this browser. Your progress lasts only while the page is open: start again and it's a first shift, with the original cutscenes.

## Files

- `index.html`: the whole game in one file.
- `prototype/`: the source. `src/` holds the separate files, and `node build.mjs` inlines them into `index.html`. `tests/` has playtest bots that play like imperfect humans (slow readers, mashers, sloppy phone swipes, people who alt-tab).
- `SPEC.md`: the design.
- `v1/index.html`: the first version.
- `LICENSE`: MIT.

## Credits

Made with AI and checked by a human, which is rather the point. By green-workshop.

North Pole Ltd and everyone in it are fictional. No children received 4,000 left socks.
