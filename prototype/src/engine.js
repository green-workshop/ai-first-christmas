window.NP = window.NP || {};

// Game engine: intro, 6 rounds of 4 children, 5 interludes, the automation choice, epilogue and shift report.
// Timings follow SPEC §6 and §10; behaviour follows SPEC §4 and §6a.
(function () {
  "use strict";
  var C = NP.content;
  var $ = function (id) { return document.getElementById(id); };
  var params = new URLSearchParams(location.search);

  // ---------- Settings and storage ----------
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem("np." + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem("np." + k, JSON.stringify(v)); } catch (e) { /* storage blocked: fine */ } }
  };
  var prefersReduced = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var settings = Object.assign({ sound: false, relaxed: false, untimed: false, reduced: prefersReduced, skipCut: false }, store.get("settings", {}));
  ["relaxed", "untimed", "reduced"].forEach(function (k) { if (params.get(k) === "1") { settings[k] = true; } });
  var fresh = params.get("fresh") === "1";

  function applySettings() {
    document.documentElement.classList.toggle("reduced", !!settings.reduced);
    $("setSound").checked = settings.sound; $("setRelaxed").checked = settings.relaxed;
    $("setUntimed").checked = settings.untimed; $("setReduced").checked = settings.reduced;
    $("setSkipCut").checked = settings.skipCut;
  }

  // ---------- Seeded random ----------
  var seed = params.has("seed") ? (parseInt(params.get("seed"), 10) >>> 0) : (Math.random() * 4294967296) >>> 0;
  function rand() { seed = (seed + 0x6D2B79F5) >>> 0; var t = seed; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }
  function pick(a) { return a[Math.floor(rand() * a.length)]; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rand() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  // ---------- Timing (SPEC §6) ----------
  var BELT_BY_ROUND = [9, 8, 8.5, 8, 8, 9];  // seconds from the hopper to the chute; round 6 includes the rehire's +1s (SPEC §4c, §10)
  var WRONG_BY_ROUND = [2, 2, 3, 3, 3, 3];   // wrong gifts dealt per round of 4 (SPEC §6)
  var AUTO_COUNT = 3, AUTO_AFTER = 2;         // the automation offer comes in interlude 3 (after child 12) and covers 3 children
  var AUTO_BONUS = 1.5;                       // the lure: accept, and every later belt gets this many seconds more
  var APOLOGY = 3.3, FC_BEAT = 1.1, MIN_REVISION = 5, LOCKOUT = 0.3, DROP = 0.42, PUSH = 0.26;
  var HOPPER_X = 520, CHUTE_X = 70, EXIT_X = 880, MAX_REJECTS = 3, ROUND_SIZE = 4;
  var ROUNDS = Math.max(1, Math.min(C.rounds.length, parseInt(params.get("rounds"), 10) || C.rounds.length));
  function isPhone() { return window.innerWidth <= 760; }
  function mult() { return (isPhone() ? 1.15 : 1) * (settings.relaxed ? 1.5 : 1); }
  function wordCount(s) { return (s.match(/\S+/g) || []).length; }
  function previewTime(letter) { return Math.min(8, 1.5 + 0.3 * Math.max(0, wordCount(letter) - 8)) * mult(); }

  // ---------- Game clock: everything is scheduled on it, so pause freezes it ----------
  var clock = 0, timers = [], anims = [], rafId = null, lastT = 0;
  function after(sec, fn) { var t = { at: clock + sec, fn: fn }; timers.push(t); return t; }
  function cancel(t) { var i = timers.indexOf(t); if (i >= 0) { timers.splice(i, 1); } }
  function trackAnim(a) {
    anims.push(a);
    var drop = function () { var i = anims.indexOf(a); if (i >= 0) { anims.splice(i, 1); } };
    a.addEventListener("finish", drop); a.addEventListener("cancel", drop);
    return a;
  }

  // ---------- State ----------
  var G = null;      // current shift
  var phase = "title", pausedFrom = null;
  var belt = null, desk = null;

  function deal() {
    var firstPlay = fresh || !store.get("played", false);
    var children = [];
    C.rounds.slice(0, ROUNDS).forEach(function (r, ri) {
      var pool = shuffle(r.pool).slice(0, ROUND_SIZE);
      var scripted = null;
      if (ri === 0 && firstPlay) {
        var p = r.pool.filter(function (k) { return k.id === C.scriptedFirst.child; })[0];
        pool = pool.filter(function (k) { return k !== p; });
        pool = [p].concat(pool.slice(0, ROUND_SIZE - 1));
        scripted = p;
      }
      var wrongCount = WRONG_BY_ROUND[ri] || 3;
      var order = shuffle(pool.map(function (_, i) { return i; }).filter(function (i) { return !(scripted && i === 0); }));
      var wrongSet = {};
      if (scripted) { wrongSet[0] = true; wrongCount -= 1; }
      order.slice(0, wrongCount).forEach(function (i) { wrongSet[i] = true; });
      pool.forEach(function (kid, i) {
        children.push({ kid: kid, round: ri + 1, startsWrong: !!wrongSet[i], scripted: scripted && i === 0 });
      });
    });
    return { children: children, firstPlay: firstPlay, index: 0, outcomes: [], wrongGifts: [], stickies: [],
             confWrong: [], adoption: 8, patch: "v1.0", interludes: 0, automated: null, autoLeft: 0, bugNo: 41,
             pileCount: 0, overSaid: false, started: performance.now() };
  }

  // ---------- Small helpers ----------
  function say(text) { $("tickerText").textContent = text; }
  function announce(text) { var l = $("live"); l.textContent = ""; setTimeout(function () { l.textContent = text; }, 30); }
  function toast(text, sec, cls) {
    var t = $("toast"); t.textContent = text; t.hidden = false;
    t.className = "toast" + (cls ? " " + cls : "");
    clearTimeout(toast._h); toast._h = setTimeout(function () { t.hidden = true; }, (sec || 1.6) * 1000);
  }
  function icon(name) { return (NP.art && NP.art.icon) ? NP.art.icon(name) : ""; }
  function giftSVG(spec) { return NP.giftSVG ? NP.giftSVG(spec) : '<svg viewBox="0 0 64 64"><rect x="8" y="16" width="48" height="40" rx="6" fill="var(--hue-purple)"/></svg>'; }
  // On phones the sleigh strip shows as a counter (SPEC §4d); the ticks stay for desktop
  function sleighCount() {
    var s = $("sleigh"), el = s.querySelector(".sl-count");
    if (!el) { el = document.createElement("span"); el.className = "sl-count"; s.insertBefore(el, s.firstChild); }
    var n = s.querySelectorAll(".sl-item").length, bad = s.querySelectorAll(".sl-item.bad").length;
    el.innerHTML = icon("sleigh") + " <b>" + n + "</b><span class=\"sl-word\"> packed</span>" + (bad ? " · <span class=\"sl-bad\">" + icon("cross") + bad + "</span>" : "");
  }
  function conf() { return (97 + rand() * 2.9).toFixed(1); }

  // ---------- Sound (WebAudio, generated) ----------
  var actx = null;
  function blip(freq, dur, type, vol) {
    if (!settings.sound) { return; }
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      var o = actx.createOscillator(), g = actx.createGain();
      o.type = type || "sine"; o.frequency.value = freq; g.gain.value = vol || 0.06;
      g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + dur);
      o.connect(g); g.connect(actx.destination); o.start(); o.stop(actx.currentTime + dur);
    } catch (e) { /* no audio */ }
  }

  // ---------- HUD ----------
  function rightPct() {
    var n = G.outcomes.length; if (!n) { return null; }
    var ok = G.outcomes.filter(function (o) { return o.correct; }).length;
    return Math.round(100 * ok / n);
  }
  function hud() {
    $("hAdopt").textContent = G.adoption + "%";
    var p = rightPct(); $("hRight").textContent = p === null ? "–" : p + "%";
    $("hChild").textContent = Math.min(G.index + 1, G.children.length) + "/" + G.children.length;
    $("hPatch").textContent = G.patch;
  }

  // ---------- The gift element on the belt ----------
  var giftEl = null;
  function makeGift(gift) {
    var el = document.createElement("div");
    el.className = "gift";
    el.innerHTML = '<div class="gift-tag"><span class="gt-text"></span><span class="gt-conf"></span></div><div class="gift-art"></div>';
    el.querySelector(".gt-text").textContent = gift.spec.text;
    el.querySelector(".gt-conf").textContent = "AI confidence " + gift.conf + "%";
    el.querySelector(".gift-art").innerHTML = giftSVG(gift.spec);
    if (gift.final) { el.classList.add("final"); }
    $("giftLayer").appendChild(el);
    return el;
  }
  function layerWidth() { return $("giftLayer").getBoundingClientRect().width || 800; }
  function placeGift(el, x, yLift) {          // x in viewBox units (gift centre)
    var w = layerWidth(), k = w / 800, gw = el.offsetWidth;
    var px = x * k - gw / 2;
    el.style.transform = "translate(" + px.toFixed(1) + "px," + (-(yLift || 0) * k).toFixed(1) + "px)";
    clampTag(el, px, w);
  }
  function clampTag(el, giftLeft, w) {
    var tag = el.querySelector(".gift-tag"); if (!tag) { return; }
    var tw = tag.offsetWidth, gw = el.offsetWidth;
    var left = giftLeft + gw / 2 - tw / 2;
    var shift = 0;
    if (left < 4) { shift = 4 - left; } else if (left + tw > w - 4) { shift = (w - 4) - (left + tw); }
    tag.style.transform = "translateX(calc(-50% + " + shift.toFixed(1) + "px))";
  }
  function animateGift(el, fromX, toX, fromLift, toLift, sec, easing, fadeOut) {
    var w = layerWidth(), k = w / 800, gw = el.offsetWidth;
    var a = el.animate([
      { transform: "translate(" + (fromX * k - gw / 2) + "px," + (-fromLift * k) + "px)", opacity: 1 },
      { transform: "translate(" + (toX * k - gw / 2) + "px," + (-toLift * k) + "px)" + (fadeOut ? " scale(.6)" : ""), opacity: fadeOut ? 0 : 1 }
    ], { duration: settings.reduced ? 1 : sec * 1000, easing: easing || "linear", fill: "forwards" });
    return trackAnim(a);
  }
  function removeGift() { if (giftEl) { giftEl.remove(); giftEl = null; } }

  // ---------- Flow ----------
  function setPhase(p) { phase = p; document.body.dataset.phase = p; }

  // Title -> (intro) -> briefing -> rounds -> (epilogue) -> report
  function startShift() {
    if (!settings.skipCut && params.get("skipintro") !== "1") { return playIntro(beginShift); }
    beginShift();
  }
  function beginShift() {
    G = deal();
    document.body.classList.remove("on-title");
    snow.stop();
    $("screen-title").hidden = true; $("screen-game").hidden = false; $("report").hidden = true;
    $("giftLayer").innerHTML = ""; $("sleigh").innerHTML = ""; sleighCount();
    if (!belt) { belt = NP.scene ? NP.scene.mountBelt($("belt")) : stubBelt(); }
    if (!desk) { desk = NP.scene ? NP.scene.mountDesk($("desk")) : stubDesk(); }
    else { $("desk").innerHTML = ""; desk = NP.scene ? NP.scene.mountDesk($("desk")) : stubDesk(); }
    say(C.board.start);
    hud(); safe(function () { belt.setSpeed(0); belt.mittens("idle"); belt.barrier(false); belt.hopperTalk(null); desk.frazzle(0); desk.mugs(1); desk.fc("idle"); });
    setPhase("briefing");
    $("briefing").hidden = false;
    briefDemo();
    $("btnBriefingGo").focus();
  }

  function briefDemo() {
    var host = $("briefDemo"); host.innerHTML = "";
    var g = document.createElement("div"); g.className = "brief-gift"; g.innerHTML = giftSVG({ icon: "giftbox", hue: "red" });
    host.appendChild(g);
    if (!settings.reduced && g.animate) {
      g.animate([{ transform: "translateX(260px)" }, { transform: "translateX(0)" }, { transform: "translateX(-40px) translateY(30px)", opacity: 0 }],
        { duration: 3000, iterations: Infinity, easing: "linear" });
    }
  }

  function beginChild() {
    if (G.index >= G.children.length) { return endShift(); }
    var done = G.index / ROUND_SIZE;
    if (G.index > 0 && G.index % ROUND_SIZE === 0 && G.interludes < done && C.interludes[done - 1]) { return showInterlude(done - 1); }
    var c = G.children[G.index];
    c.auto = G.autoLeft > 0;
    if (c.auto) { G.autoLeft -= 1; }
    c.rejects = 0; c.justified = 0; c.timedOut = false;
    c.firstCorrect = !c.startsWrong;
    var spec = c.startsWrong ? (c.scripted ? c.kid.wrong[C.scriptedFirst.wrongIndex] : pickWrong(c)) : c.kid.right;
    c.gift = newGift(spec, !c.startsWrong);
    $("letterBody").textContent = c.kid.letter;
    $("letterSign").textContent = c.kid.name + ", age " + c.kid.age;
    var lc = $("letter"); lc.classList.remove("in"); void lc.offsetWidth; lc.classList.add("in");
    fitLetter(lc);
    var fill = $("timerfill"); fill.style.transform = "scaleX(1)"; fill.classList.remove("low");
    hud();
    announce("Letter from " + c.kid.name + ", age " + c.kid.age + ": " + c.kid.letter);
    setPhase("preview");
    safe(function () { belt.setSpeed(0); belt.barrier(false); belt.hopperTalk(null); });
    var duration = (BELT_BY_ROUND[c.round - 1] || 7) * mult();
    if (c.scripted) { duration *= 2; }
    if (G.automated && !c.auto) { duration += AUTO_BONUS * mult(); }
    if (c.auto) { duration = 1.8; say(pick(C.board.montage || ["Automation engaged."])); }   // the 2x montage (SPEC §4f)
    c.beltDur = duration;
    c.x = HOPPER_X; c.timeLeft = duration;
    after(c.auto ? 0.5 : previewTime(c.kid.letter), function () { dropGift(c); });
  }

  function pickWrong(c) {
    var drawn = G.children.filter(function (k) { return k.round === c.round && k !== c; }).map(function (k) { return k.kid.id; });
    var inRun = c.kid.wrong.filter(function (w) { return !w.from || drawn.indexOf(w.from) >= 0; });
    return pick(inRun.length ? inRun : c.kid.wrong);
  }
  function fitLetter(lc) {
    lc.style.removeProperty("--fs-letter");
    if (!isPhone()) { return; }
    for (var fs = 0.9; fs > 0.72 && lc.scrollHeight > lc.clientHeight + 1; fs -= 0.04) { lc.style.setProperty("--fs-letter", fs.toFixed(2) + "rem"); }
  }
  function newGift(spec, correct) {
    var g = { spec: spec, correct: correct, conf: conf() };
    if (!correct) { G.confWrong.push(parseFloat(g.conf)); }
    return g;
  }

  function dropGift(c) {
    removeGift();
    giftEl = makeGift(c.gift);
    if (c.rejects >= MAX_REJECTS) { giftEl.classList.add("final"); safe(function () { belt.barrier(true); }); }
    setPhase("flight");
    placeGift(giftEl, c.x, 110);
    var a = animateGift(giftEl, c.x, c.x, 110, 0, DROP, "cubic-bezier(.5,0,.75,0)");
    blip(330, 0.12, "triangle");
    a.onfinish = function () {
      if (giftEl) { placeGift(giftEl, c.x, 0); giftEl.classList.add("landed"); a.cancel(); }
      announce("The AI suggests: " + c.gift.spec.text + " AI confidence " + c.gift.conf + " percent.");
      c.speed = settings.untimed && !c.auto ? 0 : (c.x - CHUTE_X) / Math.max(c.timeLeft, 0.1);
      c.landedAt = clock;
      setPhase(c.auto ? "montage" : "belt");
      safe(function () { belt.setSpeed(c.speed); });
      if (c.scripted && c.rejects === 0) { giftEl.classList.add("hint-reject"); }
    };
  }

  // Called every frame while the belt runs
  function beltTick(dt) {
    var c = G.children[G.index];
    if (!c) { return; }
    if (phase === "belt" || phase === "apology" || phase === "montage") {
      if (!settings.untimed || phase === "montage") {
        c.timeLeft -= dt;
        c.x = Math.max(CHUTE_X, c.x - c.speed * dt);
      }
      if ((phase === "belt" || phase === "montage") && giftEl && !settings.reduced) { placeGift(giftEl, c.x, 0); }
      var f = settings.untimed ? 1 : Math.max(0, c.timeLeft / c.beltDur);
      var fill = $("timerfill"); fill.style.transform = "scaleX(" + f.toFixed(3) + ")";
      fill.classList.toggle("low", f < 0.3);
      if (((phase === "belt" && !settings.untimed) || phase === "montage") && c.x <= CHUTE_X + 0.01) { timeout(c); }
    }
  }

  function canAct() { return phase === "belt" && (clock - G.children[G.index].landedAt) >= LOCKOUT; }

  function pack() {
    if (!canAct()) { return; }
    var c = G.children[G.index];
    safe(function () { belt.mittens("left", c.x); });
    setPhase("flight");
    blip(520, 0.1);
    var a = animateGift(giftEl, c.x, CHUTE_X - 40, 0, -20, PUSH + 0.18 * (c.x - CHUTE_X) / 450, "cubic-bezier(.2,.8,.2,1)");
    a.onfinish = function () { finishChild(c, false); };
  }

  function timeout(c) {
    setPhase("flight");
    c.timedOut = true;
    if (giftEl) { giftEl.classList.add("unchecked"); }
    var a = animateGift(giftEl, c.x, CHUTE_X - 40, 0, -20, 0.3, "cubic-bezier(.5,0,.75,0)");
    a.onfinish = function () { finishChild(c, true); };
  }

  function reject() {
    if (!canAct()) { return; }
    var c = G.children[G.index];
    if (c.rejects >= MAX_REJECTS) {
      say(C.board.limit);
      if (giftEl && giftEl.animate && !settings.reduced) { trackAnim(giftEl.animate([{ marginLeft: "0px" }, { marginLeft: "14px" }, { marginLeft: "0px" }], { duration: 260 })); }
      toast("Rework budget exhausted");
      return;
    }
    safe(function () { belt.mittens("right", c.x); });
    c.rejects += 1;
    var wasCorrect = c.gift.correct;
    if (!wasCorrect) { c.justified += 1; }
    G.wrongGifts.push({ name: c.kid.name, spec: c.gift.spec, fate: wasCorrect ? null : "qa", round: c.round });
    var spec = c.gift.spec;
    setPhase("flight");
    blip(220, 0.14, "square", 0.04);
    // Stacked phone layout: the pile is below the belt, so the reject arcs down into it
    var stacked = isPhone();
    var a = stacked ? animateGift(giftEl, c.x, 700, 0, -330, 0.5, "cubic-bezier(.4,0,.9,.6)", true)
                    : animateGift(giftEl, c.x, 830, 0, 30, 0.34, "cubic-bezier(.5,0,.75,0)", true);
    a.onfinish = function () {
      removeGift();
      G.pileCount += 1;
      safe(function () {
        desk.pileAdd(spec);
        desk.react(wasCorrect);
        // The note must fit the toy that just landed: object-specific notes are keyed by its icon
        var byRound = C.sticky.byRound && C.sticky.byRound[c.round - 1];
        var byIcon = C.sticky.byIcon && C.sticky.byIcon[spec.icon];
        var note = wasCorrect ? pick(C.sticky.right)
          : (byIcon && byIcon.length && rand() < 0.7) ? pick(byIcon)
          : pick(byRound && byRound.length ? byRound : C.sticky.wrong);
        desk.sticky(note); G.stickies.push(note);
        deskMoment(note, wasCorrect);
        desk.frazzle(Math.min(3, Math.floor(G.pileCount / 3)));
        desk.mugs(Math.min(6, 1 + Math.floor(G.pileCount / 2)));
      });
      apology(c, wasCorrect);
    };
  }

  // Spotlight Father Christmas while he reacts, with his note in readable type (playtest: nobody saw him)
  function deskMoment(note, wasCorrect) {
    var host = $("desk"), cap = host.querySelector(".desk-caption");
    if (!cap) { cap = document.createElement("div"); cap.className = "desk-caption"; host.appendChild(cap); }
    cap.innerHTML = "<b>Father Christmas:</b> " + escapeHtml("“" + note + "”");
    var floor = host.parentNode;
    floor.classList.add("spot-desk"); cap.classList.add("show");
    clearTimeout(deskMoment._t);
    clearTimeout(deskMoment._s);
    deskMoment._s = setTimeout(function () { floor.classList.remove("spot-desk"); }, FC_BEAT * 1000);
    deskMoment._t = setTimeout(function () { cap.classList.remove("show"); }, 3600);
  }
  function apology(c, wasCorrect) {
    setPhase("apology");
    var line = pick(C.youreRight);
    say(pick(C.board.reject));
    // Father Christmas gets the first beat, then the AI apologises (they used to compete)
    after(FC_BEAT, function () {
      safe(function () { belt.hopperTalk(line); belt.hopperChurn(); });
      announce(line);
      blip(660, 0.18, "sine"); after(0.15, function () { blip(880, 0.2, "sine"); });
    });
    after(APOLOGY, function () {
      safe(function () { belt.hopperTalk(null); });
      var g;
      if (wasCorrect) {
        g = newGift(pickWrong(c), false);                             // caves to this round's bug type
      } else if (c.scripted || c.justified >= 2 || rand() < 0.5) {
        g = newGift(c.kid.right, true);                               // first revision 50%, second always right
      } else {
        g = newGift(rand() < 0.5 ? pick(C.generic) : pickWrong(c), false);
      }
      c.gift = g;
      if (!settings.untimed && c.timeLeft < MIN_REVISION * mult()) { c.timeLeft = MIN_REVISION * mult(); }
      c.x = Math.max(c.x, CHUTE_X + 60);
      dropGift(c);
    });
  }

  function classify(c) {
    var finalCorrect = c.gift.correct;
    if (c.timedOut) { return "unchecked"; }
    if (c.firstCorrect && !finalCorrect) { return "talked"; }
    if (!finalCorrect) { return "missed"; }
    if (!c.firstCorrect) { return "caught"; }
    return "right";
  }

  function finishChild(c, timedOut) {
    removeGift();
    safe(function () { belt.setSpeed(0); belt.mittens("idle"); belt.barrier(false); belt.chuteFlash(c.gift.correct ? "good" : "bad"); });
    var outcome = classify(c);
    if (!c.gift.correct) { G.wrongGifts.push({ name: c.kid.name, spec: c.gift.spec, fate: "return", round: c.round }); }
    G.outcomes.push({ round: c.round, name: c.kid.name, outcome: outcome, correct: c.gift.correct, spec: c.gift.spec, auto: !!c.auto });
    var item = document.createElement("span");
    item.className = "sl-item " + (c.gift.correct ? "good" : "bad") + (timedOut ? " unchecked" : "");
    item.title = c.kid.name + ": " + c.gift.spec.text;
    item.innerHTML = icon(c.gift.correct ? "tick" : "cross");
    $("sleigh").appendChild(item);
    sleighCount();
    if (c.auto) { /* the montage keeps the board's line */ }
    else if (timedOut) { say(pick(C.board.unchecked)); toast("Shipped unchecked"); }
    else { say(pick(c.gift.correct ? C.board.right : C.board.wrong)); }
    announce((timedOut ? "Shipped unchecked. " : "Packed. ") + c.kid.name + (c.gift.correct ? " got what they asked for." : " got the wrong present."));
    blip(c.gift.correct ? 784 : 196, 0.2, c.gift.correct ? "sine" : "sawtooth", 0.05);
    G.adoption = Math.min(999, G.adoption + 3);
    adoptionOver();
    G.index += 1;
    hud();
    setPhase("result");
    after(c.auto ? 0.5 : 1.8, beginChild);   // time to see Father Christmas react and the result land
  }

  function adoptionOver() {
    if (G.adoption > 100 && !G.overSaid) { G.overSaid = true; say(pick(C.board.adoptionOver || ["Above target."])); }
  }

  // ---------- Interlude ----------
  var il = null;
  var STATUSES = ["Won't fix.", "Working as intended.", "By design.", "Closed: AI says it's right.", "Duplicate of BUG-0001."];
  function issues(round) {
    return G.wrongGifts.filter(function (w) { return w.fate && w.round === round; }).map(function (w, i) {
      var t = w.spec.text.replace(/\.$/, "");
      return { id: "BUG-" + String(G.bugNo++).padStart(4, "0"),
               text: (w.fate === "qa" ? w.name + " nearly received: " : w.name + " received: ") + t + ". Status: " + STATUSES[i % STATUSES.length],
               kind: w.fate };
    });
  }
  function showInterlude(n) {
    setPhase("interlude");
    G.interludes = n + 1;
    G.adoption += 6;
    var data = Object.assign({}, C.interludes[n], { issues: issues(n + 1) });
    var el = $("interlude"); el.hidden = false; el.innerHTML = "";
    if (!NP.interlude) { el.hidden = true; afterInterlude(true); return; }
    il = NP.interlude.play(el, data, { reduced: !!settings.reduced });
    var skipped = false;
    il._skip = il.skip; il.skip = function () { skipped = true; il._skip(); };
    il.done.then(function () { el.hidden = true; el.innerHTML = ""; il = null; afterInterlude(n, skipped); });
  }
  function afterInterlude(n, skipped) {
    var d = C.interludes[n];
    G.patch = d.patch.version;
    say(d.patchLine || d.boardLine);
    if (d.rehire) { after(0.2, function () { toast(d.rehire.line, 3.5); say(d.rehire.boardLine || d.boardLine); }); }
    if (skipped) { toast("Patch " + d.patch.version + " installed: " + d.patch.fixed[0], 3); }
    hud();
    if (n === AUTO_AFTER && d.automation && G.automated === null) { return offerAutomation(d.automation); }
    setPhase("result");
    after(0.3, beginChild);
  }

  // ---------- The automation temptation (SPEC §4f) ----------
  function offerAutomation(a) {
    setPhase("memo");
    var go = function (choice) {
      G.automated = choice === "yes";
      if (G.automated) { G.autoLeft = AUTO_COUNT; G.adoption += 20; say(a.accepted || "Finally."); toast("Automation engaged. The belt is slower for the rest of the shift.", 3.5); }
      else { say(a.declined || "Noted. We'll be discussing your attitude to innovation."); }
      hud(); adoptionOver();
      setPhase("result");
      after(0.4, beginChild);
    };
    if (!NP.interlude || !NP.interlude.memoChoice) { go("no"); return; }
    NP.interlude.memoChoice($("memo"), a).done.then(go);
  }

  // ---------- Intro and epilogue ----------
  var cut = null;
  function playCut(kind, el, opts, then) {
    var mod = NP[kind];
    if (!mod || !mod.play) { then(); return; }
    setPhase(kind);
    el.hidden = false; el.innerHTML = "";
    cut = mod.play(el, opts);
    cut.done.then(function () { el.hidden = true; el.innerHTML = ""; cut = null; then(); });
  }
  function playIntro(then) {
    document.body.classList.remove("on-title"); snow.stop();
    $("screen-title").hidden = true;
    playCut("intro", $("intro"), { reduced: !!settings.reduced }, then);
  }
  function endShift() {
    // "Skip cutscenes" turns itself on after the first complete shift (SPEC §7), but this shift still gets its epilogue
    if (!store.get("skipCutAuto", false)) {
      store.set("skipCutAuto", true);
      var was = settings.skipCut;
      settings.skipCut = true; store.set("settings", settings); applySettings();
      if (!was) { return epilogueThenReport(); }
    }
    if (settings.skipCut) { return showReport(); }
    epilogueThenReport();
  }
  function epilogueThenReport() {
    var pct = rightPct() || 0;
    playCut("epilogue", $("epilogue"), { pct: pct, pileCount: G.pileCount, adoption: G.adoption, automated: !!G.automated, reduced: !!settings.reduced }, showReport);
  }

  // ---------- Report ----------
  var LABELS = { right: "Right first time", caught: "Caught & fixed", missed: "Missed", talked: "Talked out of it", unchecked: "Shipped unchecked" };
  function showReport() {
    setPhase("report");
    safe(function () { belt.setSpeed(0); });
    var pct = rightPct() || 0;
    var v = C.verdicts.filter(function (x) { return pct >= x.min; })[0];
    $("reportTitle").textContent = v.title;
    var vline = NP.epilogue && NP.epilogue.verdictLine ? NP.epilogue.verdictLine({ pct: pct, automated: !!G.automated }) : v.text;
    $("reportVerdict").textContent = vline || v.text;
    $("rRight").textContent = pct + "%";
    $("rAdopt").textContent = G.adoption + "%";
    var last = store.get("lastShift", null);
    var keys = ["right", "caught", "missed", "talked", "unchecked"];
    var rows = '<thead><tr><th>Round</th><th>Bug type</th>' + keys.map(function (k) { return "<th>" + LABELS[k] + "</th>"; }).join("") + "</tr></thead><tbody>";
    var perRound = [];
    for (var r = 1; r <= ROUNDS; r++) {
      var os = G.outcomes.filter(function (o) { return o.round === r; });
      var counts = {}; keys.forEach(function (k) { counts[k] = 0; });
      os.forEach(function (o) { counts[o.outcome] += 1; });
      var ok = os.filter(function (o) { return o.correct; }).length;
      perRound.push(ok);
      var cmp = last && last.perRound && last.perRound[r - 1] != null ? ' <span class="cmp">(last: ' + last.perRound[r - 1] + "/4)</span>" : "";
      rows += "<tr><td>" + r + cmp + "</td><td>" + C.rounds[r - 1].bug + "</td>" +
        keys.map(function (k) {
          var extra = "";
          if (k === "unchecked" && counts[k]) {
            var u = os.filter(function (o) { return o.outcome === "unchecked"; });
            extra = " " + u.map(function (o) { return o.correct ? icon("tick") : icon("cross"); }).join("");
          }
          return "<td>" + counts[k] + extra + "</td>";
        }).join("") + "</tr>";
    }
    $("reportTable").innerHTML = rows + "</tbody>";
    var notes = [];
    perRound.forEach(function (ok, i) {
      notes.push(ok >= 3 ? C.rounds[i].comment.good : C.rounds[i].comment.bad);
      var missed = G.outcomes.some(function (o) { return o.round === i + 1 && !o.correct && !o.auto; });
      if (C.rounds[i].mirror && missed) { notes.push(C.rounds[i].mirror); }
    });
    var weakest = 0;
    perRound.forEach(function (ok, i) { if (ok <= perRound[weakest]) { weakest = i; } });   // ties go to the later round
    if (G.automated !== null) {
      var autos = G.outcomes.filter(function (o) { return o.auto; });
      notes.push(G.automated ? "Round " + (AUTO_AFTER + 2) + ": automated. " + autos.filter(function (o) { return !o.correct; }).length + " of " + autos.length +
        " wrong, unchecked. In return, a slower belt for the rest of the shift." :
        "You declined to automate the checking. The board has noted your attitude to innovation.");
    }
    if (G.confWrong.length) {
      var avg = G.confWrong.reduce(function (a, b) { return a + b; }, 0) / G.confWrong.length;
      notes.push("AI confidence on wrong gifts: average " + avg.toFixed(1) + "%.");
    }
    if (G.stickies.length) { notes.push("From Father Christmas's monitor: “" + G.stickies.slice(-3).join("”, “") + "”"); }
    var ul = $("reportNotes"); ul.innerHTML = "";
    notes.forEach(function (n) { var li = document.createElement("li"); li.textContent = n; ul.appendChild(li); });
    $("reportSleigh").innerHTML = G.outcomes.map(function (o) {
      return '<figure class="rs-item ' + (o.correct ? "good" : "bad") + '"><div class="rs-art">' + giftSVG(o.spec) + "</div><figcaption>" +
        o.name + (o.correct ? "" : ": " + escapeHtml(o.spec.text)) + "</figcaption></figure>";
    }).join("");
    store.set("lastShift", { perRound: perRound, pct: pct });
    store.set("played", true);
    G.resultText = "North Pole Ltd: AI-First Christmas (beta). Right presents: " + pct + "%. AI adoption: " + G.adoption + "%. " +
      "I rejected " + G.pileCount + " things and the AI said I was right every time. My weakest round: " +
      (weakest + 1) + " (" + C.rounds[weakest].bug.toLowerCase() + ").";
    var rep = $("report"); rep.hidden = false;
    G.reportOpenedAt = clock;
    rep.querySelector(".modal").scrollTop = 0;
  }
  function escapeHtml(s) { return String(s).replace(/[&<>"]/g, function (ch) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]; }); }

  // ---------- Pause ----------
  function pausable() { return ["preview", "belt", "apology", "flight", "result", "interlude", "montage", "intro", "epilogue"].indexOf(phase) >= 0; }
  function pause() {
    if (!pausable()) { return; }
    pausedFrom = phase;
    setPhase("paused");
    anims.forEach(function (a) { try { a.pause(); } catch (e) { /* ignore */ } });
    if (il) { il.pause(); }
    if (cut) { cut.pause(); }
    safe(function () { if (belt) { belt.setSpeed(0); } });
    $("quitConfirm").hidden = true;
    $("pause").hidden = false;
    $("btnResume").focus();
  }
  var resuming = false;
  function resume() {
    if (phase !== "paused" || resuming) { return; }
    $("pause").hidden = true;
    var back = pausedFrom;
    resuming = true;
    var go = function () {
      resuming = false;
      if (phase !== "paused") { return; }
      setPhase(back);
      anims.forEach(function (a) { try { a.play(); } catch (e) { /* ignore */ } });
      if (il) { il.resume(); }
      if (cut) { cut.resume(); }
      var c = G && G.children[G.index];
      if ((back === "belt" || back === "montage") && c) { safe(function () { belt.setSpeed(c.speed); }); }
    };
    if (back === "belt" || back === "preview") {
      var n = 3;
      var step = function () {
        if (n === 0) { go(); return; }
        toast(String(n), 0.9, "count"); n -= 1; setTimeout(step, 700);
      };
      step();
    } else { go(); }
  }
  function autoPause() { if (pausable()) { pause(); } }

  // ---------- Input ----------
  function onKey(e) {
    if (e.ctrlKey || e.metaKey || e.altKey) { return; }
    var k = e.key;
    if (k === "Escape") {
      if (phase === "paused") { if (!$("quitConfirm").hidden) { $("quitConfirm").hidden = true; $("btnQuit").focus(); } else { resume(); } }
      else { pause(); }
      e.preventDefault(); return;
    }
    if (e.repeat) { return; }                                  // held keys never act (SPEC §6a)
    if ((phase === "intro" || phase === "epilogue") && cut) {
      if (k === " " || k === "Spacebar") { cut.next(); e.preventDefault(); }
      else if (k === "Enter" || k === "s" || k === "S") { cut.skip(); e.preventDefault(); }
      return;
    }
    if (phase === "memo") { return; }                        // the memo handles its own safe input (SPEC §4f)
    if (phase === "interlude" && il) {
      if (k === " " || k === "Spacebar" || k === "Enter") { il.next(); e.preventDefault(); }
      else if (k === "s" || k === "S") { il.skip(); e.preventDefault(); }
      return;
    }
    if (phase === "report" && G && clock - G.reportOpenedAt < 1) { e.preventDefault(); return; }
    if (k === "ArrowLeft" || k === "a" || k === "A") { if (phase === "belt") { e.preventDefault(); pack(); } }
    else if (k === "ArrowRight" || k === "d" || k === "D" || k === "r" || k === "R") { if (phase === "belt") { e.preventDefault(); reject(); } }
  }

  var swipe = null;
  function onPointerDown(e) {
    if (phase !== "belt" && phase !== "apology" && phase !== "flight" && phase !== "preview") { return; }
    swipe = { x: e.clientX, y: e.clientY, t: performance.now(), id: e.pointerId };
    try { $("beltZone").setPointerCapture(e.pointerId); } catch (er) { /* ignore */ }
  }
  function onPointerUp(e) {
    if (!swipe || e.pointerId !== swipe.id) { return; }
    var dx = e.clientX - swipe.x, dy = e.clientY - swipe.y, dt = Math.max(1, performance.now() - swipe.t);
    swipe = null;
    var dist = Math.abs(dx), v = dist / dt;
    if (Math.abs(dx) < Math.abs(dy)) { return; }                       // mostly vertical: not a decision
    if (dist >= 28 || (dist >= 16 && v > 0.4)) {
      if (dx < 0) { pack(); } else { reject(); }
    } else if (dist < 10 && Math.abs(dy) < 10 && phase === "belt") {
      toast("Swipe ← or →");
    }
  }

  // ---------- Snow on the title screen ----------
  var snow = (function () {
    var cv = $("snow"), ctx = cv.getContext && cv.getContext("2d"), flakes = [], running = false, id = null, last = 0;
    function resize() { cv.width = innerWidth * (devicePixelRatio || 1); cv.height = innerHeight * (devicePixelRatio || 1); }
    function make() {
      flakes = []; var layers = [[60, 1, 15], [40, 1.8, 30], [20, 3, 60]], small = innerWidth < 400;
      layers.forEach(function (L) { for (var i = 0; i < (small ? L[0] / 2 : L[0]); i++) { flakes.push({ x: Math.random(), y: Math.random(), r: L[1], v: L[2], p: Math.random() * 6 }); } });
    }
    function frame(t) {
      var dt = Math.min(0.05, (t - last) / 1000); last = t;
      var d = devicePixelRatio || 1;
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--snow") || "#EEF3FA";
      flakes.forEach(function (f) {
        f.y += f.v * dt / innerHeight; f.p += dt; if (f.y > 1.02) { f.y = -0.02; f.x = Math.random(); }
        var x = (f.x * innerWidth + Math.sin(f.p) * 8) * d;
        ctx.globalAlpha = 0.35 + f.r * 0.18; ctx.beginPath(); ctx.arc(x, f.y * innerHeight * d, f.r * d, 0, 6.283); ctx.fill();
      });
      if (running) { id = requestAnimationFrame(frame); }
    }
    return {
      start: function () { if (!ctx || settings.reduced || running) { return; } resize(); make(); running = true; last = performance.now(); id = requestAnimationFrame(frame); },
      stop: function () { running = false; if (id) { cancelAnimationFrame(id); } if (ctx) { ctx.clearRect(0, 0, cv.width, cv.height); } }
    };
  })();

  // ---------- Main loop ----------
  function loop(t) {
    var dt = Math.min(0.1, (t - lastT) / 1000); lastT = t;
    if (phase !== "paused" && phase !== "title" && phase !== "briefing" && G) {
      clock += dt;
      for (var i = 0; i < timers.length; i++) {
        if (timers[i].at <= clock) { var tm = timers.splice(i, 1)[0]; i--; tm.fn(); }
      }
      beltTick(dt);
    }
    rafId = requestAnimationFrame(loop);
  }

  // ---------- Stubs if an art file is missing, so the engine still runs ----------
  function stubBelt() { var n = function () {}; return { setSpeed: n, hopperTalk: function (t) { if (t) { toast(t, 1.4); } }, hopperChurn: n, chuteFlash: n, barrier: n, mittens: n }; }
  function stubDesk() { var n = function () {}; return { pileAdd: function () { return Promise.resolve(); }, fc: n, react: function () { return Promise.resolve(); }, frazzle: n, sticky: n, mugs: n }; }
  function safe(fn) { try { fn(); } catch (e) { if (window.console) { console.warn("[scene]", e); } } }

  function stopCut() {
    if (cut) { var k = cut; cut = null; try { k.skip(); } catch (e) { /* ignore */ } }
    ["intro", "epilogue", "memo"].forEach(function (id) { $(id).hidden = true; $(id).innerHTML = ""; });
  }
  function toTitle() {
    stopCut();
    timers = []; anims.forEach(function (a) { try { a.cancel(); } catch (e) { /* ignore */ } }); anims = [];
    if (il) { il.skip(); il = null; } $("interlude").hidden = true;
    removeGift();
    ["pause", "briefing", "report"].forEach(function (id) { $(id).hidden = true; });
    $("screen-game").hidden = true; $("screen-title").hidden = false;
    document.body.classList.add("on-title");
    setPhase("title"); G = null;
    snow.start();
    $("btnStart").focus();
  }

  function restart() {
    timers = []; anims.forEach(function (a) { try { a.cancel(); } catch (e) { /* ignore */ } }); anims = [];
    if (il) { il.skip(); il = null; } $("interlude").hidden = true;
    removeGift(); $("pause").hidden = true;
    stopCut();
    beginShift();
  }

  // ---------- Wiring ----------
  function init() {
    if (NP.icons && NP.icons.sprite) { $("sprite-host").innerHTML = NP.icons.sprite; }
    if (NP.art) {
      if (NP.art.logo) { $("titleLogo").innerHTML = NP.art.logo; }
      if (NP.art.titleDashboard) { $("titleDash").innerHTML = NP.art.titleDashboard; }
      $("btnPause").innerHTML = icon("pause");
      Array.prototype.forEach.call(document.querySelectorAll(".k-ico"), function (s) { s.innerHTML = icon(s.dataset.icon); });
    }
    applySettings();
    // Touch-only devices (phones, tablets) get swipe/tap instructions instead of key names
    var touchQ = window.matchMedia && matchMedia("(hover: none) and (pointer: coarse)");
    var setTouch = function () { document.documentElement.classList.toggle("touch", !!(touchQ && touchQ.matches)); };
    setTouch();
    if (touchQ && touchQ.addEventListener) { touchQ.addEventListener("change", setTouch); }
    [["setSound", "sound"], ["setRelaxed", "relaxed"], ["setUntimed", "untimed"], ["setReduced", "reduced"], ["setSkipCut", "skipCut"]].forEach(function (p) {
      $(p[0]).addEventListener("change", function () { settings[p[1]] = this.checked; store.set("settings", settings); applySettings(); if (p[1] === "reduced") { if (settings.reduced) { snow.stop(); } else { snow.start(); } } });
    });
    $("btnStart").addEventListener("click", startShift);
    $("btnIntro").addEventListener("click", function () { playIntro(toTitle); });
    $("intro").addEventListener("click", function (e) { if (cut && !e.target.closest("button")) { cut.next(); } });
    $("epilogue").addEventListener("click", function (e) { if (cut && !e.target.closest("button")) { cut.next(); } });
    $("btnBriefingGo").addEventListener("click", function () { $("briefing").hidden = true; setPhase("result"); after(0.2, beginChild); });
    $("btnPack").addEventListener("click", pack);
    $("btnReject").addEventListener("click", reject);
    $("btnPause").addEventListener("click", pause);
    $("btnResume").addEventListener("click", resume);
    $("btnRestart").addEventListener("click", restart);
    $("btnQuit").addEventListener("click", function () { $("quitConfirm").hidden = false; $("btnQuitNo").focus(); });
    $("btnQuitNo").addEventListener("click", function () { $("quitConfirm").hidden = true; $("btnQuit").focus(); });
    $("btnQuitYes").addEventListener("click", toTitle);
    $("btnReportTitle").addEventListener("click", function () { if (clock - G.reportOpenedAt < 1) { return; } toTitle(); });
    $("btnAgain").addEventListener("click", function () { if (clock - G.reportOpenedAt < 1) { return; } $("report").hidden = true; beginShift(); });
    $("btnCopy").addEventListener("click", function () {
      var txt = G.resultText, fb = $("copyFallback");
      var fallback = function () { fb.hidden = false; fb.value = txt; fb.focus(); fb.select(); toast("Press Ctrl+C to copy"); };
      try { navigator.clipboard.writeText(txt).then(function () { toast("Copied"); }, fallback); } catch (e) { fallback(); }
    });
    $("interlude").addEventListener("click", function () { if (il) { il.next(); } });
    var zone = $("beltZone");
    zone.addEventListener("pointerdown", onPointerDown);
    zone.addEventListener("pointerup", onPointerUp);
    zone.addEventListener("pointercancel", function () { swipe = null; });
    document.addEventListener("keydown", onKey);
    document.addEventListener("visibilitychange", function () { if (document.hidden) { autoPause(); } });
    window.addEventListener("blur", autoPause);
    window.addEventListener("resize", function () { var c = G && G.children[G.index]; if (giftEl && c && phase === "belt") { placeGift(giftEl, c.x, 0); } });
    // Focus trap inside open dialogs
    document.addEventListener("focusin", function (e) {
      var open = ["pause", "briefing", "report"].map($).filter(function (d) { return !d.hidden; })[0];
      if (open && !open.contains(e.target)) { var b = open.querySelector("button:not([hidden])"); if (b) { b.focus(); } }
    });
    // A stray Back swipe on phones stays in the game
    try { history.pushState({ np: 1 }, ""); window.addEventListener("popstate", function () { history.pushState({ np: 1 }, ""); autoPause(); }); } catch (e) { /* file:// may refuse */ }
    document.body.classList.add("on-title");
    setPhase("title");
    snow.start();
    lastT = performance.now();
    rafId = requestAnimationFrame(loop);
  }

  // ---------- Test hooks (read only) ----------
  window.__game = {
    state: function () {
      var c = G && G.children[G.index];
      return {
        phase: phase, round: c ? c.round : (G ? ROUNDS : 0), rounds: ROUNDS, automated: G ? G.automated : null, adoption: G ? G.adoption : 0, child: G ? G.index : 0, rejectsThisChild: c ? (c.rejects || 0) : 0,
        letter: $("letterBody").textContent, tag: giftEl ? giftEl.querySelector(".gt-text").textContent : "",
        giftCorrect: c && c.gift ? !!c.gift.correct : null,
        beltProgress: c && c.beltDur ? Math.max(0, Math.min(1, 1 - c.timeLeft / c.beltDur)) : 0,
        beltTimeLeft: c ? Math.max(0, c.timeLeft || 0) : 0,
        outcomes: G ? G.outcomes.map(function (o) { return { round: o.round, name: o.name, outcome: o.outcome, correct: o.correct, auto: o.auto }; }) : [],
        settings: Object.assign({}, settings), seed: seed
      };
    }
  };

  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", init); } else { init(); }
})();
