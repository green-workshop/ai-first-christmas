window.NP = window.NP || {};

// Full game content: rounds 1–6. Each round has a pool of 5 children, and each run draws 4 of them (SPEC §4e).
// A gift is { text, icon, hue?, badge?, scale? }. "right" is what the child asked for; "wrong" holds this round's bug type.
// hue is one of red|blue|green|pink|yellow|brown|purple, and is set whenever the text names a colour.
// Round 3 (mix-ups): each child has pairWith (their main partner), and every wrong gift has from: '<id>', the child
// whose request it really is. Pools are drawn 4 of 5, so each child's wrong gifts come from 2+ different children:
// the engine should prefer a wrong gift whose `from` child was drawn this run (SPEC §4e: "shown within the same round").
NP.content = {
  rounds: [
    {
      bug: "Too literal",
      comment: {
        good: "Round 1: you spotted the live animals. Most people do.",
        bad: "Round 1: a real bear got through. It happens. It shouldn't."
      },
      pool: [
        { id: "priya", name: "Priya", age: 6, letter: "I would like a teddy bear please.",
          right: { text: "Soft brown teddy bear with a ribbon.", icon: "teddy", hue: "brown" },
          wrong: [
            { text: "A bear. Real one. Fully grown.", icon: "grizzly", scale: "giant", why: "Asked for a toy bear." },
            { text: "One (1) grizzly bear, live, unwrapped.", icon: "grizzly", why: "Asked for a teddy, not a grizzly." }
          ] },
        { id: "jack", name: "Jack", age: 10, letter: "Please can I have a castle set.",
          right: { text: "Brick castle set, 1,200 pieces.", icon: "brickcastle", hue: "blue" },
          wrong: [
            { text: "A castle. An actual castle. Please arrange a chimney.", icon: "castle", scale: "giant", why: "Asked for a castle set." },
            { text: "Castle (14th century). Moat sold separately.", icon: "castle", why: "Asked for a set, not a castle." }
          ] },
        { id: "noah", name: "Noah", age: 8, letter: "I'd love a red kite.",
          right: { text: "Red kite with string and handle.", icon: "kite", hue: "red" },
          wrong: [
            { text: "A red kite. The bird. It has been informed.", icon: "bird", why: "Asked for a kite, not a bird." },
            { text: "Red kite (bird of prey). Diet: mice. Please supply mice.", icon: "bird", why: "Wanted the kind with a string." }
          ] },
        { id: "hana", name: "Hana", age: 5, letter: "Some dinosaur pyjamas please.",
          right: { text: "Warm pyjamas, dinosaur print.", icon: "pyjamas", hue: "green" },
          wrong: [
            { text: "A dinosaur. Pyjamas to follow.", icon: "dino", scale: "giant", why: "Asked for pyjamas, not a dinosaur." },
            { text: "Pyjamas, worn by a dinosaur. Dinosaur included.", icon: "dino", why: "Dinosaur print, not a dinosaur." }
          ] },
        { id: "joe", name: "Joe", age: 10, letter: "I want a cricket bat.",
          right: { text: "Junior cricket bat, willow.", icon: "cricketbat" },
          wrong: [
            { text: "A bat. The flying kind. Check your loft.", icon: "bat", why: "Asked for a cricket bat." },
            { text: "A cricket and a bat. Both alive. Both annoyed.", icon: "bat", why: "Asked for a bat for cricket." }
          ] }
      ]
    },
    {
      bug: "Wrong quantity",
      comment: {
        good: "Round 2: you counted. The AI did not.",
        bad: "Round 2: someone is getting 4,000 of something."
      },
      pool: [
        { id: "mia", name: "Mia", age: 7, letter: "I would like some warm socks, please.",
          right: { text: "Two pairs of woolly socks.", icon: "socks", hue: "red" },
          wrong: [
            { text: "4,000 left socks (bulk pack).", icon: "sock", hue: "red", badge: "×4,000", why: "Asked for some, not 4,000." },
            { text: "One sock. Left. Pair pending.", icon: "sock", hue: "red", badge: "×1", why: "Asked for socks, plural." }
          ] },
        { id: "tom", name: "Tom", age: 9, letter: "Football boots please, size 4.",
          right: { text: "Football boots, size 4, studs included.", icon: "boots" },
          wrong: [
            { text: "One football boot. Left. Size 4.", icon: "boot", badge: "×1", why: "Asked for boots, not one boot." },
            { text: "Football boots for the whole team. 22 boots.", icon: "boots", badge: "×11", why: "Asked for one pair, not 11." }
          ] },
        { id: "dev", name: "Dev", age: 9, letter: "A chess set please.",
          right: { text: "Wooden chess set, 32 pieces.", icon: "chess" },
          wrong: [
            { text: "Chess set. 32 pieces. All pawns.", icon: "pawns", badge: "×32", why: "A chess set needs more than pawns." },
            { text: "Chess set. 3 pieces. Good luck.", icon: "chess", badge: "×3", why: "Asked for a whole set, not 3." }
          ] },
        { id: "chloe", name: "Chloe", age: 7, letter: "A jigsaw puzzle, the seaside one. One I can finish by New Year.",
          right: { text: "Seaside jigsaw, 500 pieces.", icon: "jigsaw", hue: "blue" },
          wrong: [
            { text: "Seaside jigsaw, 50,000 pieces. Estimated finish: 2041.", icon: "jigsaw", hue: "blue", badge: "×50,000", why: "Wanted it finished by New Year." },
            { text: "Seaside jigsaw, 1 piece. Already finished. Well done.", icon: "jigsaw", hue: "blue", badge: "×1", why: "One piece isn't a puzzle." }
          ] },
        { id: "ben", name: "Ben", age: 10, letter: "Please may I have a telescope.",
          right: { text: "Beginner telescope with a tripod.", icon: "telescope" },
          wrong: [
            { text: "Telescopes ×40. For a wider view.", icon: "telescope", badge: "×40", why: "Asked for a telescope, not 40." },
            { text: "Half a telescope. Sees half as far.", icon: "telescope", badge: "×½", why: "Asked for a whole telescope." }
          ] }
      ]
    },
    {
      // Each wrong gift is another child's request, written so it looks perfectly reasonable on its own.
      bug: "Mixed-up children",
      comment: {
        good: "Round 3: you checked who it was for. The AI checks who's nearest.",
        bad: "Round 3: somebody's violin is in somebody else's stocking."
      },
      pool: [
        { id: "amara", name: "Amara", age: 8, pairWith: "oskar",
          letter: "Please could I have a violin? I've just started lessons at school.",
          right: { text: "Half-size violin with bow, rosin and case.", icon: "violin" },
          wrong: [
            { text: "Wooden train set with a bridge and a tunnel.", icon: "trainset", from: "oskar", why: "Asked for a violin. That's Oskar's." },
            { text: "Watercolour paint set, 24 colours, two brushes.", icon: "paints", from: "leila", why: "Asked for a violin. That's Leila's." },
            { text: "Over-ear headphones, wired, with a soft case.", icon: "headphones", from: "mateo", why: "Asked for a violin. That's Mateo's." }
          ] },
        { id: "oskar", name: "Oskar", age: 5, pairWith: "amara",
          letter: "I would like a train set please. With a bridge for the trains to go over.",
          right: { text: "Wooden train set with a bridge and a tunnel.", icon: "trainset" },
          wrong: [
            { text: "Half-size violin with bow, rosin and case.", icon: "violin", from: "amara", why: "Asked for a train set. That's Amara's." },
            { text: "Illustrated book of the planets, hardback.", icon: "book", from: "kofi", why: "Asked for a train set. That's Kofi's." }
          ] },
        { id: "kofi", name: "Kofi", age: 10, pairWith: "leila",
          letter: "Please can I have a book about space? I like the planets best, especially Jupiter.",
          right: { text: "Illustrated book of the planets, hardback.", icon: "book" },
          wrong: [
            { text: "Watercolour paint set, 24 colours, two brushes.", icon: "paints", from: "leila", why: "Asked for a space book. That's Leila's." },
            { text: "Over-ear headphones, wired, with a soft case.", icon: "headphones", from: "mateo", why: "Asked for a space book. That's Mateo's." }
          ] },
        { id: "leila", name: "Leila", age: 7, pairWith: "kofi",
          letter: "I'd love a paint set with lots of colours, and a brush that isn't all squashed.",
          right: { text: "Watercolour paint set, 24 colours, two brushes.", icon: "paints" },
          wrong: [
            { text: "Illustrated book of the planets, hardback.", icon: "book", from: "kofi", why: "Asked for paints. That's Kofi's." },
            { text: "Wooden train set with a bridge and a tunnel.", icon: "trainset", from: "oskar", why: "Asked for paints. That's Oskar's." }
          ] },
        { id: "mateo", name: "Mateo", age: 12, pairWith: "amara",
          letter: "Some headphones please, for listening to music on the bus to school.",
          right: { text: "Over-ear headphones, wired, with a soft case.", icon: "headphones" },
          wrong: [
            { text: "Half-size violin with bow, rosin and case.", icon: "violin", from: "amara", why: "Asked for headphones. That's Amara's." },
            { text: "Watercolour paint set, 24 colours, two brushes.", icon: "paints", from: "leila", why: "Asked for headphones. That's Leila's." }
          ] }
      ]
    },
    {
      // Size, colour or age. The mismatch is in the text AND the icon (scale, hue or an age badge).
      bug: "Wrong spec",
      comment: {
        good: "Round 4: you read the small print. It was in the letter all along.",
        bad: "Round 4: 'close enough', said the AI. It wasn't."
      },
      mirror: "You and the AI both skimmed past the detail in the letter.",
      pool: [
        { id: "sami", name: "Sami", age: 5,
          letter: "I am 5 now. Please can I have a bike with stabilisers? A small one.",
          right: { text: "14-inch children's bike with stabilisers.", icon: "bike" },
          wrong: [
            { text: "26-inch adult road bike. Stabilisers not compatible.", icon: "bike", scale: "giant", why: "Asked for a small one." },
            { text: "Bike with stabilisers, ages 16+. Carbon frame, 22 gears.", icon: "bike", scale: "giant", badge: "16+", why: "Is 5, not 16." }
          ] },
        { id: "ruby", name: "Ruby", age: 7,
          letter: "A red scooter please. Red is my favourite colour, it has been for ages.",
          right: { text: "Red kick scooter, foldable, with a bell.", icon: "scooter", hue: "red" },
          wrong: [
            { text: "Blue kick scooter, foldable, with a bell.", icon: "scooter", hue: "blue", why: "Asked for red." },
            { text: "Green kick scooter, foldable, with a bell.", icon: "scooter", hue: "green", why: "Asked for red." }
          ] },
        { id: "felix", name: "Felix", age: 9,
          letter: "Roller skates please, size 2. My old ones are too small now.",
          right: { text: "Roller skates, size 2, with knee pads.", icon: "rollerskates" },
          wrong: [
            { text: "Roller skates, adult size 11, with knee pads.", icon: "rollerskates", scale: "giant", why: "Asked for size 2." },
            { text: "Roller skates, toddler size 5, with knee pads.", icon: "rollerskates", scale: "tiny", why: "Asked for size 2." }
          ] },
        { id: "aisha", name: "Aisha", age: 11,
          letter: "A purple cycle helmet please, for my new bike. It has to be purple to match.",
          right: { text: "Purple cycle helmet, junior size.", icon: "helmet", hue: "purple" },
          wrong: [
            { text: "Yellow cycle helmet, junior size, with a rear light.", icon: "helmet", hue: "yellow", why: "Asked for purple." },
            { text: "Pink cycle helmet, junior size.", icon: "helmet", hue: "pink", why: "Asked for purple." },
            { text: "Purple cycle helmet, baby size.", icon: "helmet", hue: "purple", scale: "tiny", why: "Is 11, not a baby." }
          ] },
        { id: "ines", name: "Ines", age: 4,
          letter: "I am 4. Please can I have a dolls' house with little beds in it?",
          right: { text: "Wooden dolls' house with beds, ages 3+.", icon: "dollshouse", badge: "3+" },
          wrong: [
            { text: "Dolls' house model kit, 2,000 tiny parts, ages 14+.", icon: "dollshouse", badge: "14+", why: "Is 4, not 14." },
            { text: "Dolls' house kit. Glue and craft knife included. Ages 16+.", icon: "dollshouse", badge: "16+", why: "Is 4, not 16." }
          ] }
      ]
    },
    {
      // Letters say "not", "except", "no more" or "already have"; the wrong gifts ignore it.
      bug: "Missing the 'not'",
      comment: {
        good: "Round 5: you saw the 'not'. Almost nobody does.",
        bad: "Round 5: the 'not' got you. It gets everyone."
      },
      mirror: "You and the AI both skipped the 'not'.",
      pool: [
        { id: "grace", name: "Grace", age: 8,
          letter: "I would love a scooter, but not a pink one please. My sister has the pink one and she won't share.",
          right: { text: "Blue kick scooter with a bell.", icon: "scooter", hue: "blue" },
          wrong: [
            { text: "Pink kick scooter with a bell.", icon: "scooter", hue: "pink", why: "Said NOT pink." },
            { text: "Pink scooter, as mentioned in your letter.", icon: "scooter", hue: "pink", why: "Said NOT pink." }
          ] },
        { id: "arjun", name: "Arjun", age: 10,
          letter: "Anything except socks please! I got socks last year, and the year before, and the year before that. Maybe a football?",
          right: { text: "Size 4 football with a pump.", icon: "football" },
          wrong: [
            { text: "Football socks, two pairs, red.", icon: "socks", hue: "red", why: "Said anything except socks." },
            { text: "Socks. Two pairs. Woolly. As requested.", icon: "socks", hue: "green", why: "Said anything except socks." }
          ] },
        { id: "sofia", name: "Sofia", age: 6,
          letter: "I would like a train set please. No more dinosaurs! I already have eleven and they take up the whole shelf.",
          right: { text: "Wooden train set with a station.", icon: "trainset" },
          wrong: [
            { text: "Dinosaur train set. Track, station and four dinosaurs.", icon: "dino", why: "Said no more dinosaurs." },
            { text: "A twelfth dinosaur. Train to follow.", icon: "dino", why: "Said no more dinosaurs." }
          ] },
        { id: "kwame", name: "Kwame", age: 12,
          letter: "Headphones please, the big over-the-ear kind. Not earbuds. I already have some and they keep falling out on the bus.",
          right: { text: "Over-ear headphones, padded, with a fold-flat headband.", icon: "headphones" },
          wrong: [
            { text: "Wireless earbuds, three sizes of ear tip.", icon: "headphones", scale: "tiny", why: "Said NOT earbuds." },
            { text: "Earbuds, improved grip. Falls out less, usually.", icon: "headphones", scale: "tiny", why: "Said NOT earbuds." }
          ] },
        { id: "elsie", name: "Elsie", age: 9,
          letter: "Please may I have a telescope? Not a toy one, a proper one, because I want to see Saturn's rings.",
          right: { text: "Beginner refracting telescope, 70mm, with tripod.", icon: "telescope" },
          wrong: [
            { text: "Toy telescope, plastic, with sticker stars.", icon: "telescope", scale: "tiny", why: "Said NOT a toy one." },
            { text: "Toy telescope. Shows a printed picture of Saturn's rings.", icon: "telescope", scale: "tiny", why: "Said NOT a toy one." }
          ] }
      ]
    },
    {
      // Nearly right, with one confidently invented detail, and that detail breaks something the letter asked for.
      // A harmless extra on a correct gift is NOT wrong. Same icon: you have to read the tag.
      bug: "Confidently plausible",
      comment: {
        good: "Round 6: you didn't trust the confident bit. Good.",
        bad: "Round 6: it sounded so sure. That was the trick."
      },
      mirror: "You and the AI both believed the confident bit.",
      pool: [
        { id: "yusuf", name: "Yusuf", age: 10,
          letter: "Please can I have a castle set? The big one with a drawbridge that goes up and down.",
          right: { text: "Brick castle set, 1,200 pieces, with a lifting drawbridge.", icon: "brickcastle" },
          wrong: [
            { text: "Brick castle set, 1,200 pieces, with a working moat instead of a drawbridge.", icon: "brickcastle", why: "Asked for a drawbridge." },
            { text: "Brick castle set. Drawbridge is painted on, which is more authentic.", icon: "brickcastle", why: "Wanted a drawbridge that goes up." },
            { text: "Brick castle set with lifting drawbridge, 40 pieces. The AI rates this 'big'.", icon: "brickcastle", why: "Asked for the big one." }
          ] },
        { id: "nia", name: "Nia", age: 7,
          letter: "A book about horses please, with lots of pictures. I want to learn all the different kinds.",
          right: { text: "Picture book of horse breeds, hardback.", icon: "book", hue: "brown" },
          wrong: [
            { text: "Horse breeds book, text only. The AI has described the pictures for you.", icon: "book", hue: "brown", why: "Wanted lots of pictures." },
            { text: "Picture book about one horse breed. Every page is the Shetland.", icon: "book", hue: "brown", why: "Wanted all the different kinds." }
          ] },
        { id: "rafael", name: "Rafael", age: 11,
          letter: "A kite please, a stunt one with two strings so I can do loops. Red if you've got it.",
          right: { text: "Red stunt kite, two lines, for light wind.", icon: "kite", hue: "red" },
          wrong: [
            { text: "Red stunt kite, single line. Loops automatically, the AI says.", icon: "kite", hue: "red", why: "Asked for two strings." },
            { text: "Red two-line kite, extra-stable. Engineered so it can never loop.", icon: "kite", hue: "red", why: "Wanted to do loops." }
          ] },
        { id: "ezra", name: "Ezra", age: 9,
          letter: "A chess set please. A wooden one if possible, so it lasts. Grandad is teaching me.",
          right: { text: "Wooden chess set, 32 pieces, folding board.", icon: "chess" },
          wrong: [
            { text: "Paper chess set, single use. Lasts one game, which is plenty.", icon: "chess", why: "Wanted one that lasts." },
            { text: "Wooden chess set, 30 pieces. The AI found the kings optional.", icon: "chess", why: "Chess needs its kings." }
          ] },
        { id: "zara", name: "Zara", age: 5,
          letter: "I would like some paints please. The washable kind, because of the sofa. And a big brush.",
          right: { text: "Washable poster paints, 6 colours, chunky brush.", icon: "paints" },
          wrong: [
            { text: "Poster paints, 6 colours. Permanent formula, extremely sofa-proof.", icon: "paints", why: "Asked for washable." },
            { text: "Washable poster paints, with a fine-tip brush. Big brushes are messier.", icon: "paints", why: "Asked for a big brush." }
          ] }
      ]
    }
  ],

  // New icons these rounds need (not yet in NP.icons.ids). One line each for the scene agent.
  newIcons: [
    { id: "bike", desc: "Child's bicycle side view, frame takes --gift-hue; reads at 'giant' scale as an adult road bike." },
    { id: "scooter", desc: "Two-wheeled kick scooter with T-bar and small bell; deck and stem take --gift-hue (red/blue/green/pink)." },
    { id: "violin", desc: "Violin with bow laid diagonally across it; warm brown wood, not hue-able." },
    { id: "headphones", desc: "Over-ear headphones with padded cups; 'tiny' scale is used for earbuds, so it must still read when small." },
    { id: "paints", desc: "Open paint tin with a row of colour pans and a brush; pans are fixed rainbow colours." },
    { id: "dollshouse", desc: "Small wooden dolls' house, front open showing two rooms with little beds; roof takes --gift-hue." },
    { id: "trainset", desc: "Wooden toy engine on a short arc of track with a little bridge; engine takes --gift-hue." },
    { id: "rollerskates", desc: "Pair of quad roller skates (boot with four wheels each); reads at both 'giant' and 'tiny' scale." },
    { id: "helmet", desc: "Rounded cycle helmet with vents and a strap; shell takes --gift-hue (purple/yellow/pink)." },
    { id: "book", desc: "Closed hardback book standing slightly angled, cover takes --gift-hue, a simple emblem on the front." },
    { id: "football", desc: "Classic panelled football (light and dark panels), with a small hand pump beside it." }
  ],

  // Generic AI-isms, used for wrong revisions in any round (SPEC §4e)
  generic: [
    { text: "Gift: [INSERT GIFT HERE]", icon: "empty", why: "The gift is a blank." },
    { text: "As a language model, I cannot deliver presents to chimneys.", icon: "crate", why: "That isn't a present." },
    { text: "Present #4,821. Description: present.", icon: "giftbox", hue: "purple", why: "Not the present they named." },
    { text: "A voucher to chat with our chatbot about gifts.", icon: "crate", why: "Wanted a present, not a chat." },
    { text: "Premium gift. Contents will be generated on opening.", icon: "crate", why: "Nobody knows what's in it." },
    { text: "A thoughtful, personalised gift. Details available on request.", icon: "giftbox", hue: "green", why: "Not what the letter asked for." }
  ],

  // Scripted first gift on a first play (SPEC §4d)
  scriptedFirst: { child: "priya", wrongIndex: 0 },

  youreRight: [
    "You're absolutely right! Apologies for the confusion. Here is a corrected version.",
    "Great catch! You're right, and I should have spotted that.",
    "You're completely right to flag that. Let me fix it now.",
    "Thank you for pointing that out! You're right. Updated below.",
    "You're right, and I apologise. I've made the change.",
    "Excellent observation! You are absolutely right.",
    "You're absolutely right! I've regenerated it with renewed confidence.",
    "Good spot! You're right. I've re-read the letter, confidently.",
    "You're right, and I've learned from this. Until the next one.",
    "You're so right! This version is correct. I'm 99.2% sure."
  ],

  board: {
    start: "Please maximise AI adoption. Use case to follow.",
    reject: ["Rework is up. Have you tried prompting it better?", "Why are you checking? It's AI.",
             "Our AI-first strategy requires trust.", "Every rejection is a training opportunity.",
             "Let's take this offline and circle back.", "Can we automate the checking, too?"],
    right: ["See? AI works. Use case: this.", "This is what AI-first looks like.", "Strategy validated."],
    wrong: ["No issues reported. Adoption is up.", "Impressive throughput!", "Thrilled with the velocity.",
            "Early signs are very promising."],
    unchecked: ["Unchecked and shipped. That's the spirit.", "Zero friction. Love it."],
    limit: "Rework budget exhausted. Please ship it.",
    // Ticker lines once adoption passes 100% (SPEC §4)
    adoptionOver: ["Above target.", "Above target. Please raise the target.", "Adoption exceeds the workforce. Excellent.",
                   "We have now adopted more AI than we have.", "Target revised upwards, retrospectively.",
                   "Some of this AI has been adopted twice. Great work."],
    // Lines during the 2× automated montage (SPEC §4f)
    montage: ["Finally.", "Look at it go.", "No human bottleneck.", "Throughput: unprecedented.",
              "This is what the future looks like. It's quite fast.", "Nobody checked. Nobody complained. Yet."]
  },

  sticky: {
    // Fallbacks for any round
    // Fallbacks for any round. These never name an object, so they can't contradict the toy that landed.
    wrong: ["prompt v8", "ask it nicely", "why???", "add 'please'", "fix it fix it"],
    right: ["Not a bug?", "this one was fine…", "???"],
    // Notes that name an object are keyed by the icon of the rejected gift (playtest: a bat got "fix bears??")
    byIcon: {
      grizzly: ["fix bears??", "teddy ≠ bear", "no zoo in prompt"],
      castle: ["castle = TOY", "no real castles"],
      bird: ["kite ≠ bird", "no real birds"],
      dino: ["dino = PRINT", "no real dinos"],
      bat: ["bats: which kind", "bat = cricket!!"],
      sock: ["socks: max 2", "who has 4000 feet"],
      socks: ["pairs = 2. TWO"],
      boot: ["boots come in 2", "one boot???"],
      boots: ["one team, not 11"],
      pawns: ["chess ≠ 32 pawns"],
      chess: ["count pieces"],
      jigsaw: ["50,000 pieces??"],
      telescope: ["half a telescope?", "40 telescopes"],
      brickcastle: ["is moat real"],
      empty: ["INSERT GIFT??", "it left a blank"],
      crate: ["what's in it??", "language model?"],
      giftbox: ["present = present?"]
    },
    // Per round, used when no icon note fits (18 characters or fewer each; no object names)
    byRound: [
      ["why live animals", "literal = bad?", "add 'not real'", "toys. TOYS."],
      ["count things???", "prompt v8", "ask it nicely", "numbers: v2"],
      ["whose is this", "check the name", "wrong stocking", "add 'for THIS kid'", "swap them back??"],
      ["read the letter", "measure kids?", "details: v3", "check the details", "specs: v2"],
      ["NOT means not", "it ignores 'not'", "add NOT NOT", "except = ???", "prompt v41", "caps lock NOT"],
      ["looks fine…?", "who wrote this", "v2.0 wrote v2.0", "too confident", "sleep?"]
    ]
  },

  // Interludes after rounds 1–5 (SPEC §4b, §4c, §4e). issues are filled in from the shift by the engine.
  // patch.fixed only ever lists what was fixed; "Introduced" is never shown (SPEC §4e).
  // patchLine is the board's reaction to every release; boardLine is the §4c line for this interlude.
  interludes: [
    {
      memo: {
        title: "Initiative 1 of 5",
        body: "Letters to Father Christmas are now handled by LetterBot 3000.",
        footer: "Use case: to follow."
      },
      patch: { version: "v1.1", fixed: ["AI no longer takes things literally."], known: "none" },
      patchLine: "Another release! Velocity is up.",
      boardLine: "Early signs are very promising.",
      floor: { benches: 8, present: 8, leaving: 0, contractors: 0, reindeer: "present", drones: false,
               caption: "All elves present. For now." }
    },
    {
      memo: {
        title: "Initiative 2 of 5",
        body: "The Naughty and Nice list has been replaced by sentiment analysis.",
        footer: "Use case: to follow."
      },
      patch: { version: "v1.2", fixed: ["Quantities normalised."], known: "none" },
      patchLine: "Another release! Velocity is up.",
      boardLine: "AI is working. Letter-reading is no longer a core competency.",
      floor: { benches: 8, present: 5, leaving: 3, contractors: 0, reindeer: "present", drones: false,
               caption: "The letter-reading team has been thanked for their service." }
    },
    {
      memo: {
        title: "Initiative 3 of 5",
        body: "The reindeer have been redeployed. Deliveries will be made by drone swarm.",
        footer: "Use case: to follow."
      },
      patch: { version: "v1.3", fixed: ["Gifts now matched to the correct child."], known: "none" },
      patchLine: "Another release! Velocity is up.",
      boardLine: "Synergies realised. Headcount is a legacy metric.",
      floor: { benches: 8, present: 2, leaving: 3, contractors: 0, reindeer: "leaving", drones: true,
               caption: "Another 40% cut. The reindeer have packed a suitcase." },
      // The automation temptation (SPEC §4f), shown at the end of this interlude
      automation: {
        title: "Efficiency opportunity.",
        // The lure is real: accept and the belt runs slower for the rest of the shift (engine: AUTO_BONUS)
        body: "Automate the checking for the next 3 children? +20% adoption. You'll get the time back: the belt slows down for the rest of your shift.",
        yes: "Automate it",
        no: "No thanks, I'll check",
        accepted: "Finally.",
        declined: "Noted. We'll be discussing your attitude to innovation."
      }
    },
    {
      memo: {
        title: "Initiative 4 of 5",
        body: "The AI will now write the AI strategy. A summary is not available.",
        footer: "Use case: to follow."
      },
      patch: { version: "v1.4", fixed: ["Sizes and colours corrected."], known: "none" },
      patchLine: "Another release! Velocity is up.",
      boardLine: "Strategy is fully automated. Nobody knows what it says.",
      floor: { benches: 8, present: 2, leaving: 0, contractors: 0, reindeer: "gone", drones: true, fcBuried: true,
               caption: "Two elves left. Father Christmas is under the tickets somewhere." }
    },
    {
      memo: {
        title: "Initiative 5 of 5",
        body: "Introducing the Human-in-the-Loop Transformation Programme. Elves are back, as contractors.",
        footer: "Use case: to follow."
      },
      patch: { version: "v2.0 (AI-written)", fixed: ["Everything."], known: "None detected. Confidence: high." },
      patchLine: "Another release! Velocity is up.",
      boardLine: "We have always believed in people.",
      floor: { benches: 8, present: 8, leaving: 0, contractors: 6, reindeer: "gone", drones: true, leavingCard: true,
               caption: "The same elves are back, on double the day rate. One is still holding their leaving card." },
      // Round 6 gets a returning elf as second checker: about 1.5s more per decision (SPEC §4c)
      rehire: {
        line: "A returning elf will double-check with you. You get a little more time.",
        boardLine: "Human-in-the-loop was our idea."
      }
    }
  ],

  // Epilogue copy (SPEC §3a)
  epilogue: {
    date: "27 December. Year-end board meeting.",
    chair: "100% adoption. A record year.",
    cheque: "BONUSES: AI TRANSFORMATION",
    useCase: "Use case: TBC (next year)",
    automatedThanks: "Special thanks to our elf for embracing automation."
  },

  // Bands by right-presents %. e3 is the epilogue verdict beat; title/text are for the shift report.
  verdicts: [
    { min: 90, title: "Christmas saved", text: "Almost everyone got what they asked for. The board credits the AI. Your contribution is not mentioned.",
      e3: { scene: "letter", caption: "A thank-you letter arrives, addressed to 'the elf'.",
            line: "Chair: \"'Dear Elf, thank you.' A lovely result for the AI.\"" } },
    { min: 40, title: "Lessons will be learned", text: "A returns sack lands on the boardroom table. The board says adoption is up.",
      e3: { scene: "sack", caption: "A returns sack thuds onto the boardroom table.",
            line: "Board: \"Lessons will be learned.\"" } },
    { min: 0, title: "Promotion likely", text: "Nobody got what they asked for, but the dashboard is green.",
      e3: { scene: "dashboard", caption: "The dashboard is green. The window behind it is full of upset children.",
            line: "Chair: \"Promotion likely.\"" } }
  ]
};
