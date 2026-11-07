// Human-persona playtest bots for North Pole Ltd, full game (SPEC §6c, Layer 1).
//
//   node tests/bots.mjs [--persona name|all] [--runs N] [--seed S] [--headed] [--relaxed]
//                       [--rounds N] [--skipintro] [--parallel N] [--slice path/to/slice.html] [--verbose]
//
// Full game: title -> intro -> briefing -> 5 played rounds x 4 children with 5 interludes (the last
// is the sacking) -> round 6 as a 2x montage of 4 unchecked children -> epilogue -> report.
//
// Bots drive the game ONLY with real input (CDP Input.dispatchKeyEvent / dispatchMouseEvent /
// dispatchTouchEvent). They READ window.__game.state() and the DOM purely for perception and
// measurement, and never call game functions.

import { launch, killAll } from './cdp.mjs';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, 'out');
const sleep = (ms) => new Promise((r) => setTimeout(r, Math.max(0, ms)));
const now = () => Date.now();

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------
function parseArgs(argv) {
  const a = { persona: 'all', runs: 1, seed: 1000, headed: false, relaxed: false, parallel: 4, verbose: false,
              rounds: null, skipintro: false, slice: resolve(HERE, '..', 'slice.html') };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i], v = argv[i + 1];
    switch (k) {
      case '--persona': a.persona = v; i++; break;
      case '--runs': a.runs = Math.max(1, parseInt(v, 10) || 1); i++; break;
      case '--seed': a.seed = parseInt(v, 10) || 0; i++; break;
      case '--parallel': a.parallel = Math.max(1, Math.min(8, parseInt(v, 10) || 4)); i++; break;
      case '--slice': a.slice = resolve(v); i++; break;
      case '--headed': a.headed = true; break;
      case '--relaxed': a.relaxed = true; break;
      case '--rounds': a.rounds = Math.max(1, Math.min(6, parseInt(v, 10) || 6)); i++; break;
      case '--skipintro': a.skipintro = true; break;
      case '--verbose': case '-v': a.verbose = true; break;
      case '--help': case '-h': a.help = true; break;
      default: console.error(`Unknown argument: ${k}`); a.help = true;
    }
  }
  return a;
}

// ---------------------------------------------------------------------------
// Seeded randomness
// ---------------------------------------------------------------------------
function makeRng(seed) {
  let s = seed >>> 0;
  const r = () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const rng = {
    r,
    range: (a, b) => a + (b - a) * r(),
    int: (a, b) => Math.floor(a + (b - a + 1) * r()),
    chance: (p) => r() < p,
    pick: (arr) => arr[Math.floor(r() * arr.length)],
    normal: (mean, sd) => {
      const u = Math.max(1e-9, r()), v = r();
      return mean + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    },
  };
  rng.clampNormal = (mean, sd, lo, hi) => Math.min(hi, Math.max(lo, rng.normal(mean, sd)));
  return rng;
}
const hashStr = (str) => { let h = 2166136261; for (const c of str) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; };
const words = (t) => (t || '').split(/\s+/).filter(Boolean).length;

// ---------------------------------------------------------------------------
// Personas (SPEC §6c). Probabilities are per decision.
//   misjudge      chance of judging a fully read gift wrongly
//   skimMisjudge  chance when it did not finish reading (skimmed / panicked)
//   slip, slipRise wrong-key chance, rising per round and as the belt gets shorter
//   double, hold  chance of a double-press / a held key (autoRepeat 300–800ms)
//   onOverrun     what happens if the belt would run out before it finishes reading:
//                 'panic' (decide early, skimmed) or 'miss' (let it ship); a number = P(panic)
// ---------------------------------------------------------------------------
const PERSONAS = {
  phoneScroller: {
    device: 'phone', input: 'touch', wpm: 160, phoneReadFactor: 0.77,
    misjudge: 0.10, skimMisjudge: 0.45, slip: 0.02, slipRise: 0.02, double: 0, hold: 0,
    onOverrun: 0.6, abandonP: 0.15, title: 'tap', briefing: 'tapFast', interlude: 'tap',
    intro: 'button', epilogue: 'button',
  },
  carefulReader: {
    device: 'desktop', input: 'keys', mouseShare: 0.3, wpm: 150,
    misjudge: 0.05, skimMisjudge: 0.30, slip: 0.01, slipRise: 0.01, double: 0.02, hold: 0.05,
    onOverrun: 'miss', title: 'clickSlow', briefing: 'read', interlude: 'watch',
    intro: 'watch20', epilogue: 'watch',
  },
  masher: {
    device: 'desktop', input: 'mash', wpm: null, glanceMs: 300, readsLetter: false,
    misjudge: 0, skimMisjudge: 0, slip: 0.04, slipRise: 0.03, double: 0, hold: 0.5,
    rejectIfWrong: 0.30, rejectIfRight: 0.10, previewMash: true,
    onOverrun: 'panic', title: 'click', briefing: 'glance', interlude: 'mash',
    intro: 'button', epilogue: 'button',
  },
  sceptic: {
    device: 'desktop', input: 'keys', wpm: 220, readFraction: 0.6, alwaysSkim: true,
    misjudge: 0.10, skimMisjudge: 0.25, slip: 0.02, slipRise: 0.02, double: 0.04, hold: 0.1,
    rejectBias: 0.8, onOverrun: 'panic', title: 'click', briefing: 'skim', interlude: 'watch',
    intro: 'keyS', epilogue: 'watch',
  },
  distracted: {
    device: 'desktop', input: 'keys', mouseShare: 0.15, wpm: 220,
    misjudge: 0.08, skimMisjudge: 0.40, slip: 0.02, slipRise: 0.02, double: 0.04, hold: 0.08,
    distractions: [2, 3], awayMs: [5000, 30000],
    onOverrun: 0.7, title: 'click', briefing: 'skim', interlude: 'watch',
    intro: 'keyEnter', epilogue: 'watch',
  },
  skipper: {
    device: 'desktop', input: 'keys', wpm: 300, readFraction: 0.7, alwaysSkim: true,
    misjudge: 0.08, skimMisjudge: 0.25, slip: 0.03, slipRise: 0.03, double: 0.06, hold: 0.1,
    onOverrun: 'panic', title: 'mashThenClick', briefing: 'mash', interlude: 'mash',
    intro: 'mash', epilogue: 'mash',
  },
  keyboardOnly: {
    device: 'desktop', input: 'arrows', wpm: 200,
    misjudge: 0.07, skimMisjudge: 0.40, slip: 0.02, slipRise: 0.02, double: 0.03, hold: 0.05,
    onOverrun: 0.7, title: 'tab', briefing: 'tab', interlude: 'keys', checkLive: true,
    intro: 'tab', epilogue: 'watch',
  },
  secondRun: {
    device: 'desktop', input: 'keys', mouseShare: 0.1, wpm: 230,
    misjudge: 0.07, skimMisjudge: 0.40, slip: 0.02, slipRise: 0.02, double: 0.04, hold: 0.08,
    onOverrun: 0.7, title: 'click', briefing: 'skim', interlude: 'keys', twoPasses: true,
    intro: 'button', epilogue: 'keyEnter',
  },
};

const VIEWPORTS = {
  desktop: { width: 1280, height: 800, mobile: false, deviceScaleFactor: 1 },
  phone: { width: 390, height: 844, mobile: true, deviceScaleFactor: 2 },
};

// 'result' is not in ARCHITECTURE.md but the engine uses it between a child's outcome and the next letter.
const KNOWN_PHASES = ['title', 'intro', 'briefing', 'preview', 'belt', 'apology', 'flight', 'result', 'interlude',
                      'montage', 'epilogue', 'paused', 'report'];
// Cutscene-like phases. While one of them shows a visible button, the normal stuck rule does not apply
// (the player is meant to sit there), but more than CUTSCENE_FLAG_MS in one is still flagged.
const CUTSCENE_PHASES = ['intro', 'interlude', 'montage', 'epilogue'];
const STUCK_MS = 40000;          // no phase change for this long outside 'paused' = stuck
const STUCK_ABORT_MS = 60000;    // give up on the run after this long stuck
const CUTSCENE_FLAG_MS = 120000;
const CUTSCENE_ABORT_MS = 240000;
const UNKNOWN_NUDGE_MS = 8000;   // an unknown phase that sits still this long gets a generic "advance" input
const PASS_TIMEOUT_MS = 25 * 60000;

// Selectors the harness relies on for the full-game additions (see README "Contract assumptions").
const SEL = {
  introSkip: { scopes: ['#intro'], classes: ['.in-skip', '[data-action="skip"]', '.skip'], re: 'skip' },
  epilogueSkip: { scopes: ['#epilogue'], classes: ['.ep-skip', '[data-action="skip"]', '.skip'], re: 'skip' },
};

class Abort extends Error { constructor(kind, msg) { super(msg); this.kind = kind; } }

// ---------------------------------------------------------------------------
// One run (one browser)
// ---------------------------------------------------------------------------
async function runOne(personaName, runIdx, args) {
  const P = PERSONAS[personaName];
  const gameSeed = args.seed + runIdx;
  const rng = makeRng(hashStr(personaName) ^ (args.seed * 7919 + runIdx));
  const tag = `${personaName}-${runIdx}`;
  const vp = VIEWPORTS[P.device];
  const params = new URLSearchParams({ seed: String(gameSeed) });
  if (!P.twoPasses) params.set('fresh', '1');
  if (args.relaxed) params.set('relaxed', '1');
  if (args.skipintro) params.set('skipintro', '1');
  if (args.rounds) params.set('rounds', String(args.rounds));
  const url = `${pathToFileURL(args.slice).href}?${params}`;

  const result = {
    persona: personaName, run: runIdx, seed: gameSeed, url, device: P.device,
    completed: false, abandoned: false, error: null,
    outcomes: [], rightPct: null, perRound: {}, timeouts: 0,
    decisions: [], accidental: [], ignoredInputs: 0, finalBounces: 0,
    stuck: [], consoleErrors: [], unknownPhases: [], unknownNudges: 0, unexpectedPauses: 0,
    distractions: [], live: null, briefing: null,
    // full game: per-pass cutscene records (the final pass is copied here; secondRun keeps pass 1 in firstPass)
    intro: null, epilogue: null, montage: null, interludes: 0, cutscenes: null,
    cutscenesNotAutoSkipped: [], automation: null, gameBugs: [],
    timeToFirstGiftMs: null, sessionMs: null, phaseLog: [], screenshots: [],
  };
  const log = (...m) => { if (args.verbose) console.log(`[${tag}]`, ...m); };

  let b, ctxRef = null;
  const t0 = now();
  try {
    b = await launch({ width: vp.width, height: vp.height, headed: args.headed });
    await b.send('Log.enable').catch(() => {});
    b.on('Runtime.exceptionThrown', (p) => {
      const d = p.exceptionDetails || {};
      result.consoleErrors.push({ t: now() - t0, kind: 'exception', text: (d.exception && d.exception.description) || d.text, url: d.url, line: d.lineNumber });
    });
    b.on('Runtime.consoleAPICalled', (p) => {
      if (p.type !== 'error' && p.type !== 'assert') return;
      result.consoleErrors.push({ t: now() - t0, kind: 'console.' + p.type, text: (p.args || []).map((a) => a.value ?? a.description ?? a.type).join(' ') });
    });
    b.on('Log.entryAdded', (p) => {
      if (p.entry && p.entry.level === 'error') result.consoleErrors.push({ t: now() - t0, kind: 'log.' + p.entry.source, text: p.entry.text, url: p.entry.url });
    });
    await b.setViewport(vp);

    const ctx = ctxRef = makeCtx({ b, P, rng, result, tag, log, args, t0 });
    if (P.twoPasses) {
      // Pass 1: a first play (no ?fresh=1). Pass 2: back to the title and a repeat shift. Progress lasts only while the page is open, so no reload.
      const first = await playPass(ctx, url, { label: 'pass1' });
      result.firstPass = first;
      log('pass 1 done, starting a repeat shift');
      await sleep(rng.range(1500, 3000));
      ctx.resetPass();
      const second = await playPass(ctx, url, { label: 'pass2', again: true });
      Object.assign(result, second);
    } else {
      Object.assign(result, await playPass(ctx, url, { label: 'main' }));
    }
  } catch (e) {
    if (e instanceof Abort && e.kind === 'abandon') {
      result.abandoned = true;
      result.abandonedNote = e.message;
    } else {
      result.error = e instanceof Abort ? `${e.kind}: ${e.message}` : (e && e.stack) || String(e);
      if (b) { try { result.screenshots.push(await b.screenshot(join(OUT, `${tag}-error.png`))); } catch { /* ignore */ } }
    }
    try { if (b) await finishOutcomes(b, result); } catch { /* ignore */ }
    // keep what the unfinished pass saw (cutscenes, montage, ...)
    const p = ctxRef && ctxRef.pass;
    if (p && !p.completed) {
      if (p.segments) { p.segments.push({ phase: ctxRef.lastPhase, t: ctxRef.lastPhaseAt - ctxRef.passStart, ms: now() - ctxRef.lastPhaseAt, round: null }); p.cutscenes = cutsceneTimes(p.segments); delete p.segments; }
      for (const k of ['intro', 'epilogue', 'montage', 'interludes', 'leavingElves', 'cutscenes', 'cutscenesNotAutoSkipped', 'timeToFirstGiftMs']) result[k] = p[k];
    }
  } finally {
    result.sessionMs = result.sessionMs ?? now() - t0;
    if (b) await b.close().catch(() => {});
  }
  summariseRun(result);
  return result;
}

async function finishOutcomes(b, result) {
  const s = await b.evaluate('window.__game && window.__game.state ? window.__game.state() : null');
  if (s && Array.isArray(s.outcomes)) result.outcomes = s.outcomes;
}

function summariseRun(r) {
  const o = r.outcomes || [];
  r.rightPct = o.length ? Math.round((1000 * o.filter((x) => x.correct).length) / o.length) / 10 : null;
  r.perRound = {};
  for (const x of o) {
    const pr = (r.perRound[x.round] = r.perRound[x.round] || { total: 0, right: 0, caught: 0, missed: 0, talked: 0, unchecked: 0, correct: 0 });
    pr.total++; pr[x.outcome] = (pr[x.outcome] || 0) + 1; if (x.correct) pr.correct++;
  }
  // Round 6 (SPEC §4f): the AI the player trained runs it unchecked, as right as they were in rounds 1-5
  r.automation = null;
  const auto = o.filter((x) => x.auto), mine = o.filter((x) => !x.auto);
  if (auto.length) {
    const right = mine.filter((x) => x.correct).length;
    r.automation = {
      montageSeen: !!r.montage, buttonsDisabled: r.montage ? r.montage.buttonsDisabled : null,
      children: auto.map((x) => ({ round: x.round, name: x.name, outcome: x.outcome, correct: x.correct })),
      playerRight: right, playerTotal: mine.length, aiRight: auto.filter((x) => x.correct).length,
      expectedRight: mine.length ? Math.round((auto.length * right) / mine.length) : 0,
      allUnchecked: auto.every((x) => x.outcome === 'unchecked'),
    };
  }
  const autoN = auto.filter((x) => x.outcome === 'unchecked').length;
  r.timeouts = o.filter((x) => x.outcome === 'unchecked').length - autoN;
  r.accidentalCount = r.accidental.length;
  r.accidentalNonSlip = r.accidental.filter((a) => a.cause !== 'slip').length;
}

// ---------------------------------------------------------------------------
// Context: perception helpers shared by all personas
// ---------------------------------------------------------------------------
function makeCtx({ b, P, rng, result, tag, log, args, t0 }) {
  const ctx = { b, P, rng, result, tag, log, args, t0 };
  const phone = P.device === 'phone';
  ctx.wpm = P.wpm ? P.wpm * (phone ? (P.phoneReadFactor || 0.77) : 1) : null;
  ctx.readMs = (n) => (ctx.wpm ? (n / ctx.wpm) * 60000 : 0);
  ctx.reaction = () => rng.clampNormal(640, 130, 400, 900);

  ctx.resetPass = () => {
    ctx.passStart = now();
    ctx.lastPhase = null; ctx.lastPhaseAt = now(); ctx.stuckFlagged = false;
    ctx.children = new Map(); ctx.firstGiftAt = null; ctx.shots = new Set();
    ctx.giftCount = 0; ctx.distractPlan = null; ctx.pausedByUs = false; ctx.doneKey = null;
  };
  ctx.resetPass();

  // Abandonment (phone scroller): decided once per run.
  ctx.abandonAt = P.abandonP && rng.chance(P.abandonP) ? t0 + 20000 + rng.range(0, 25000) : null;

  ctx.shot = (name) => {
    if (ctx.shots.has(name)) return;
    ctx.shots.add(name);
    const p = join(OUT, `${tag}-${name}.png`);
    b.screenshot(p).then(() => result.screenshots.push(p)).catch((e) => log('screenshot failed', name, e.message));
  };

  // Read game state + a little DOM; also does stuck / abandon / timeout bookkeeping.
  ctx.snap = async () => {
    const s = await b.evaluate(`(() => {
      const g = window.__game; if (!g || typeof g.state !== 'function') return null;
      const s = g.state(); const live = document.getElementById('live');
      // visible buttons on an open overlay (cutscene skip, interlude Continue)
      let btns = 0;
      for (const el of document.querySelectorAll('.overlay button, #intro button, #epilogue button, #interlude button')) {
        if (el.closest('[hidden]')) continue;
        const r = el.getBoundingClientRect(); if (r.width > 0 && r.height > 0) btns++;
      }
      return Object.assign({}, s, { _live: live ? live.textContent : null, _btns: btns,
        _focus: document.activeElement ? (document.activeElement.id || document.activeElement.tagName) : null });
    })()`);
    const t = now();
    if (!s) {
      if (t - ctx.passStart > 10000) throw new Abort('contract', 'window.__game.state() is not available 10s after load (engine test hooks missing?)');
      return null;
    }
    if (!KNOWN_PHASES.includes(s.phase) && !result.unknownPhases.includes(s.phase)) {
      result.unknownPhases.push(s.phase);
      console.warn(`[${tag}] WARN unknown phase "${s.phase}" (contract lists ${KNOWN_PHASES.join(', ')})`);
    }
    if (s.phase !== ctx.lastPhase) {
      result.phaseLog.push({ t: t - t0, phase: s.phase, round: s.round, child: s.child, rejects: s.rejectsThisChild });
      if (ctx.pass && ctx.lastPhase != null) ctx.pass.segments.push({ phase: ctx.lastPhase, t: ctx.lastPhaseAt - ctx.passStart, ms: t - ctx.lastPhaseAt, round: ctx.lastRound });
      ctx.lastPhase = s.phase; ctx.lastPhaseAt = t; ctx.lastRound = s.round; ctx.stuckFlagged = false;
    } else if (s.phase !== 'paused' && s.phase !== 'report') {
      const dt = t - ctx.lastPhaseAt;
      const cut = CUTSCENE_PHASES.includes(s.phase) && s._btns > 0;   // exempt while it offers a button
      const flagMs = cut ? CUTSCENE_FLAG_MS : STUCK_MS, abortMs = cut ? CUTSCENE_ABORT_MS : STUCK_ABORT_MS;
      if (dt > flagMs && !ctx.stuckFlagged) {
        ctx.stuckFlagged = true;
        result.stuck.push({ t: t - t0, phase: s.phase, round: s.round, child: s.child, forMs: dt, beltTimeLeft: s.beltTimeLeft,
                            kind: cut ? 'cutscene>120s' : 'stuck' });
        console.warn(`[${tag}] ${cut ? 'LONG CUTSCENE' : 'STUCK'}: phase "${s.phase}" unchanged for ${(dt / 1000).toFixed(1)}s`);
        ctx.shot(`stuck${result.stuck.length}`);
      }
      if (dt > abortMs) throw new Abort('stuck', `phase "${s.phase}" unchanged for ${Math.round(dt / 1000)}s; giving up`);
    }
    if (ctx.abandonAt && t >= ctx.abandonAt && s.phase !== 'report') {
      throw new Abort('abandon', `gave up after ${((t - t0) / 1000).toFixed(1)}s in phase "${s.phase}" (round ${s.round}, child ${s.child})`);
    }
    if (t - ctx.passStart > PASS_TIMEOUT_MS) throw new Abort('timeout', `pass exceeded ${PASS_TIMEOUT_MS / 60000} min`);
    return s;
  };

  ctx.waitPhase = async (pred, timeoutMs = 30000) => {
    const end = now() + timeoutMs;
    while (now() < end) {
      const s = await ctx.snap();
      if (s && pred(s)) return s;
      await sleep(40);
    }
    return null;
  };

  ctx.visible = (sel) => b.evaluate(`(() => { const el = document.querySelector(${JSON.stringify(sel)});
    if (!el || el.closest('[hidden]')) return false; const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; })()`);

  // Press/click/tap a UI button in this persona's style.
  ctx.activate = async (sel) => {
    if (phone) return b.tapSelector(sel);
    return b.clickSelector(sel);
  };

  // Find a visible button by spec { scopes, classes, re } (classes first, then text / aria-label).
  ctx.findBtn = (spec) => b.evaluate(`(() => {
    const spec = ${JSON.stringify(spec)};
    const re = spec.re ? new RegExp(spec.re, 'i') : null;
    const vis = (el) => { if (el.closest('[hidden]')) return false; const r = el.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0) return false; const cs = getComputedStyle(el);
      return cs.visibility !== 'hidden' && cs.display !== 'none' && cs.pointerEvents !== 'none'; };
    const all = [];
    for (const s of spec.scopes) for (const el of document.querySelectorAll(s + ' button, ' + s + ' [role="button"]')) if (!all.includes(el)) all.push(el);
    let el = null;
    for (const c of spec.classes || []) { el = all.find((x) => x.matches(c) && vis(x)); if (el) break; }
    const label = (x) => ((x.innerText || x.textContent || '') + ' ' + (x.getAttribute('aria-label') || '')).trim();
    if (!el && re) el = all.find((x) => vis(x) && re.test(label(x)));
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.left, y: r.top, w: r.width, h: r.height, cx: r.left + r.width / 2, cy: r.top + r.height / 2,
             text: label(el).slice(0, 60), cls: String(el.className || ''), id: el.id || null };
  })()`);
  // JS predicate (on document.activeElement) for "focus is on the button described by spec".
  ctx.focusIs = (spec) => b.evaluate(`(() => {
    const spec = ${JSON.stringify(spec)}; const el = document.activeElement;
    if (!el || !spec.scopes.some((s) => el.closest(s))) return false;
    if ((spec.classes || []).some((c) => el.matches(c))) return true;
    const t = ((el.innerText || el.textContent || '') + ' ' + (el.getAttribute('aria-label') || '')).trim();
    return el.matches('button,[role="button"]') && !!spec.re && new RegExp(spec.re, 'i').test(t);
  })()`);
  ctx.focusDesc = () => b.evaluate(`(() => { const el = document.activeElement; if (!el) return null;
    return { tag: el.tagName, id: el.id || null, cls: String(el.className || '').slice(0, 60),
             button: el.matches('button,[role="button"]'), text: (el.innerText || '').trim().slice(0, 40) }; })()`);
  ctx.pressAt = async (r) => {
    const x = r.cx + (rng.r() * 2 - 1) * r.w * 0.15, y = r.cy + (rng.r() * 2 - 1) * r.h * 0.15;
    if (phone) { await b.tap(x, y); return 'tap'; }
    await b.click(x, y); return 'click';   // click() moves the mouse there first
  };
  return ctx;
}

const giftKey = (s) => `${s.round}:${s.child}:${s.rejectsThisChild}`;

// ---------------------------------------------------------------------------
// A pass: load the page and play until the report.
// ---------------------------------------------------------------------------
async function playPass(ctx, url, { label, again = false }) {
  const { b, P, rng, result, log } = ctx;
  const passT0 = now();
  ctx.passStart = passT0;
  ctx.lastPhaseAt = passT0;
  if (again) await b.clickSelector('#btnReportTitle');
  else { await b.navigate(url); await installLiveLog(b); }
  log(`${label}: loaded ${url}`);

  const pass = { label, timeToFirstGiftMs: null, sessionMs: null, completed: false, outcomes: [],
                 intro: null, epilogue: null, montage: null, interludes: 0, cutscenes: null,
                 cutscenesNotAutoSkipped: [], segments: [] };
  ctx.pass = pass;
  ctx.lastPhase = null; ctx.lastPhaseAt = passT0;
  let handledTitle = false, handledBriefing = false, lastInterludeKey = null;
  const pre = label === 'pass1' ? 'pass1-' : '';

  while (true) {
    const s = await ctx.snap();
    if (!s) { await sleep(100); continue; }

    switch (s.phase) {
      case 'intro':
        await doCutscene(ctx, 'intro', s);
        break;
      case 'epilogue':
        await doCutscene(ctx, 'epilogue', s);
        break;
      case 'montage':
        await doMontage(ctx, s);
        break;
      case 'title':
        if (!handledTitle) { handledTitle = true; await doTitle(ctx); }
        else await nudge(ctx, s, '#btnStart');
        break;
      case 'briefing':
        if (!handledBriefing) { handledBriefing = true; result.briefing = await doBriefing(ctx); }
        else await nudge(ctx, s, '#btnBriefingGo');
        break;
      case 'preview':
        await doPreview(ctx, s);
        break;
      case 'belt': {
        if (!ctx.firstGiftAt) {
          ctx.firstGiftAt = now();
          pass.timeToFirstGiftMs = ctx.firstGiftAt - passT0;
          log(`${label}: first gift after ${(pass.timeToFirstGiftMs / 1000).toFixed(1)}s`);
          ctx.shot(label === 'pass1' ? 'pass1-firstgift' : 'firstgift');
        }
        await playGift(ctx, s);
        break;
      }
      case 'interlude': {
        // one interlude per finished round; a re-entry after a pause is the same interlude
        const k = (s.outcomes || []).length;
        if (k !== lastInterludeKey) {
          lastInterludeKey = k; pass.interludes++;
          const n = pass.interludes;
          setTimeout(() => ctx.shot(`${pre}interlude${n}`), 1200);
        }
        await doInterlude(ctx);
        break;
      }
      case 'paused':
        if (!ctx.pausedByUs) {
          result.unexpectedPauses++;
          log('unexpected pause; resuming with Esc');
          await sleep(ctx.reaction());
          await b.key('Escape');
          await sleep(600);
        }
        break;
      case 'report': {
        pass.completed = true;
        pass.sessionMs = now() - passT0;
        pass.outcomes = s.outcomes || [];
        pass.segments.push({ phase: ctx.lastPhase, t: ctx.lastPhaseAt - passT0, ms: 0, round: s.round });
        pass.cutscenes = cutsceneTimes(pass.segments);
        await sleep(1500);
        ctx.shot(`${pre}report`);
        await sleep(400);
        await finalizeLive(ctx);
        log(`${label}: report after ${(pass.sessionMs / 1000).toFixed(1)}s`);
        delete pass.segments;
        return pass;
      }
      default:
        if (!KNOWN_PHASES.includes(s.phase)) await nudgeUnknown(ctx, s);
        else await sleep(60);
    }
    await sleep(30);
  }
}

// Nothing advanced after our action: a human tries again (and we note the dead input).
async function nudge(ctx, s, sel) {
  const { b, rng, result } = ctx;
  if (now() - ctx.lastPhaseAt < 2500) { await sleep(100); return; }
  result.ignoredInputs++;
  ctx.log(`phase "${s.phase}" did not advance; clicking ${sel} again`);
  if (await ctx.visible(sel)) await ctx.activate(sel); else await b.key('Enter');
  await sleep(rng.range(800, 1400));
}

// ---------------------------------------------------------------------------
// Title and briefing, in persona style
// ---------------------------------------------------------------------------
async function doTitle(ctx) {
  const { b, P, rng } = ctx;
  await ctx.waitPhase(() => true, 2000);
  const visible = await ctx.visible('#btnStart');
  switch (P.title) {
    case 'tap': await sleep(rng.range(500, 1500)); break;
    case 'clickSlow': await sleep(rng.range(3000, 5000)); break;
    case 'mashThenClick':
      for (let i = rng.int(2, 4); i > 0; i--) { await b.key(rng.chance(0.5) ? 'Enter' : 'Space'); await sleep(rng.range(90, 200)); }
      if ((await ctx.snap())?.phase !== 'title') return;
      break;
    case 'tab': {
      const ok = await tabTo(ctx, 'btnStart', 15);
      ctx.result.titleTabFocus = ok;
      if (!ok) console.warn(`[${ctx.tag}] WARN could not Tab-focus #btnStart`);
      await sleep(rng.range(300, 700));
      await b.key('Enter');
      return;
    }
    default: await sleep(rng.range(1000, 2500));
  }
  if (!visible) throw new Abort('contract', '#btnStart not visible on the title screen');
  await ctx.activate('#btnStart');
}

async function tabTo(ctx, id, max) {
  const { b, rng } = ctx;
  for (let i = 0; i < max; i++) {
    const f = await b.evaluate('document.activeElement && document.activeElement.id');
    if (f === id) return true;
    await b.key('Tab');
    await sleep(rng.range(120, 300));
  }
  return (await b.evaluate('document.activeElement && document.activeElement.id')) === id;
}

async function doBriefing(ctx) {
  const { b, P, rng, result } = ctx;
  const t = now();
  const text = await b.evaluate(`(document.getElementById('briefing') || {}).innerText || ''`);
  const info = { words: words(text), style: P.briefing, dwellMs: 0, via: null };
  switch (P.briefing) {
    case 'read': await sleep(ctx.readMs(words(text)) + ctx.reaction()); break;
    case 'skim': await sleep(ctx.readMs(words(text)) * 0.4 + ctx.reaction()); break;
    case 'glance': await sleep(rng.range(400, 900)); break;
    case 'tapFast': await sleep(rng.range(400, 1100)); break;
    case 'mash': {
      info.via = 'mash';
      for (let i = rng.int(3, 6); i > 0; i--) {
        await b.key(rng.chance(0.5) ? 'Enter' : 'Space');
        await sleep(rng.range(90, 220));
        const s = await ctx.snap();
        if (s && s.phase !== 'briefing') break;
      }
      const s = await ctx.snap();
      if (s && s.phase !== 'briefing') { info.dwellMs = now() - t; return info; }
      info.mashFailed = true; // Enter/Space did not dismiss it; fall back to clicking
      break;
    }
    case 'tab': {
      info.focusInside = await b.evaluate(`!!document.activeElement && !!document.activeElement.closest('#briefing')`);
      await sleep(ctx.readMs(words(text)) * 0.6);
      info.tabFocused = await tabTo(ctx, 'btnBriefingGo', 10);
      info.focusTrapped = await b.evaluate(`!!document.activeElement && !!document.activeElement.closest('#briefing')`);
      await b.key(rng.chance(0.5) ? 'Enter' : 'Space');
      info.via = 'keyboard'; info.dwellMs = now() - t;
      return info;
    }
  }
  if (P.input === 'mash') { await b.key('ArrowLeft'); await sleep(rng.range(80, 160)); } // stray presses at the briefing
  info.via = P.device === 'phone' ? 'tap' : 'click';
  if (await ctx.visible('#btnBriefingGo')) await ctx.activate('#btnBriefingGo');
  else { result.ignoredInputs++; await b.key('Enter'); }
  info.dwellMs = now() - t;
  return info;
}

// ---------------------------------------------------------------------------
// Letter preview: start the reading clock for this child's letter.
// ---------------------------------------------------------------------------
function childInfo(ctx, s) {
  const k = `${s.round}:${s.child}`;
  let c = ctx.children.get(k);
  if (!c) {
    const t = now();
    const letterWords = words(s.letter) + 4; // + "Dear Father Christmas," and the signature
    const readLetter = ctx.P.readsLetter === false ? 0 : ctx.readMs(letterWords) * (ctx.P.readFraction || 1);
    c = { key: k, previewAt: t, letterWords, letterDoneAt: t + readLetter, liveBaseline: s._live };
    ctx.children.set(k, c);
    if (ctx.P.distractions && !ctx.distractPlan) planDistractions(ctx);
  }
  return c;
}

async function doPreview(ctx, s) {
  const { b, P, rng } = ctx;
  if (s.automated) { await sleep(60); return; }   // round 6 runs without the player: just watch
  const c = childInfo(ctx, s);
  if (P.previewMash && !c.mashed) {
    // The masher hammers ← while the letter is up; the game must ignore (and not buffer) it.
    c.mashed = true;
    await sleep(rng.range(150, 500));
    const before = await ctx.snap();
    for (let i = rng.int(1, 3); i > 0; i--) { await b.key('ArrowLeft'); await sleep(rng.range(60, 140)); }
    c.previewMashAt = now();
    c.previewMashBefore = before;
  }
  await sleep(40);
}

// ---------------------------------------------------------------------------
// The core: perceive a gift on the belt, read, decide, act, check what happened.
// ---------------------------------------------------------------------------
function timeLeftMs(s) {
  const v = s.beltTimeLeft;
  if (v === null || v === undefined || !isFinite(v) || (s.settings && s.settings.untimed)) return Infinity;
  return v * 1000;
}

async function playGift(ctx, s0) {
  const { b, P, rng, result, log } = ctx;
  const key = giftKey(s0);
  if (ctx.doneKey === key) { await sleep(40); return; } // already decided / let it ship
  const c = childInfo(ctx, s0);
  const landedAt = now();
  ctx.giftCount++;
  const beltAtLanding = timeLeftMs(s0);
  const tagWords = words(s0.tag) + 3; // + the "AI confidence: 98.4%" line next to it
  const tagMs = P.glanceMs != null ? P.glanceMs : ctx.readMs(tagWords) * (P.readFraction || 1);
  const reaction = P.input === 'mash' ? rng.clampNormal(320, 60, 200, 450) : ctx.reaction();
  const readStart = Math.max(landedAt, c.resumeReadAt || c.letterDoneAt);
  let readyAt = readStart + tagMs + reaction;
  if (c.resumeReadAt) c.resumeReadAt = null;
  let skimmed = !!P.alwaysSkim;
  const panicMargin = rng.range(500, 1100);
  const distractAt = shouldDistract(ctx) ? landedAt + rng.range(500, 1800) : null;

  // --- reading / waiting ---
  while (true) {
    const s = await ctx.snap();
    if (!s) return;
    if (s.phase !== 'belt' || giftKey(s) !== key) {
      await classifyStray(ctx, s0, s, 'before deciding');
      return;
    }
    const t = now();
    if (distractAt && t >= distractAt) { await distract(ctx, s, c); return; }
    if (t >= readyAt) break;
    const left = timeLeftMs(s);
    if (left < panicMargin) {
      skimmed = true;
      const panic = P.onOverrun === 'panic' || (typeof P.onOverrun === 'number' && rng.chance(P.onOverrun));
      if (!panic) {
        log(`r${s.round} c${s.child}: still reading, lets it ship`);
        result.decisions.push({ round: s.round, child: s.child, rejects: s.rejectsThisChild, intended: 'none', reason: 'overrun-miss', readMs: t - landedAt });
        ctx.doneKey = key;
        return;
      }
      log(`r${s.round} c${s.child}: belt running out, panics`);
      break;
    }
    await sleep(40);
  }

  // --- judgement ---
  let s = await ctx.snap();
  if (!s || s.phase !== 'belt' || giftKey(s) !== key) { if (s) await classifyStray(ctx, s0, s, 'at decision'); return; }
  const truth = s.giftCorrect ? 'pack' : 'reject';
  const final = s.rejectsThisChild >= 4 || /FINAL|NO FURTHER REWORK/i.test(s.tag || '');
  let intended;
  if (final) intended = 'pack';
  else if (P.input === 'mash') intended = rng.chance(s.giftCorrect ? P.rejectIfRight : P.rejectIfWrong) ? 'reject' : 'pack';
  else if (P.rejectBias && rng.chance(P.rejectBias)) intended = 'reject';
  else {
    const p = skimmed ? P.skimMisjudge : P.misjudge;
    intended = rng.chance(p) ? flip(truth) : truth;
  }
  const beltFactor = isFinite(beltAtLanding) ? Math.max(0, (8000 - beltAtLanding) / 1000) * 0.01 : 0;
  const slipP = P.slip + P.slipRise * ((s.round || 1) - 1) + beltFactor;

  // --- act (with retries if nothing happened) ---
  for (let attempt = 1; attempt <= 4; attempt++) {
    const before = await ctx.snap();
    if (!before || before.phase !== 'belt' || giftKey(before) !== key) { if (before) await classifyStray(ctx, s0, before, 'between attempts'); return; }
    const slip = attempt === 1 && rng.chance(slipP);
    const pressed = slip ? flip(intended) : intended;
    const io = await performInput(ctx, pressed, before);
    const eff = await observeEffect(ctx, before);
    const d = { round: before.round, child: before.child, rejects: before.rejectsThisChild, attempt, giftCorrect: before.giftCorrect,
                truth, intended, pressed, slip, skimmed, final, via: io.via, detail: io.detail, effect: eff.effect,
                readMs: now() - landedAt, beltLeftMs: isFinite(timeLeftMs(before)) ? Math.round(timeLeftMs(before)) : null };
    result.decisions.push(d);
    log(`r${d.round} c${d.child} rj${d.rejects}: truth=${truth} intended=${intended} pressed=${pressed}${slip ? ' (slip)' : ''} via ${io.via}${io.detail ? ' ' + io.detail : ''} -> ${eff.effect}`);

    if (eff.effect === 'pack' || eff.effect === 'reject') {
      if (eff.effect !== intended) {
        const cause = slip ? 'slip' : io.via === 'swipe' ? 'swipe-misread' : 'unexpected';
        result.accidental.push({ ...pick(d, 'round', 'child', 'rejects', 'intended', 'pressed', 'via', 'detail', 'effect'), cause });
      }
      if (eff.extra) result.accidental.push({ ...pick(d, 'round', 'child', 'rejects', 'intended', 'pressed', 'via', 'detail', 'effect'), cause: eff.extra });
      ctx.doneKey = key;
      return;
    }
    if (eff.effect === 'timeout' || eff.effect === 'left') { ctx.doneKey = key; return; }
    if (eff.effect === 'paused') { return; }
    // effect none: the input did nothing (too-short swipe, tap, lockout, FINAL barrier…)
    result.ignoredInputs++;
    if (final && pressed === 'reject') result.finalBounces++;
    if (s.rejectsThisChild >= 4 || final) intended = 'pack';
    await sleep(rng.range(250, 600));
  }
  ctx.doneKey = key;
}

const flip = (a) => (a === 'pack' ? 'reject' : 'pack');
const pick = (o, ...k) => Object.fromEntries(k.map((x) => [x, o[x]]));

// Something happened to the gift that the bot did not do (or did earlier as noise).
async function classifyStray(ctx, s0, s, when) {
  const { result } = ctx;
  if (s.phase === 'paused') return;
  const outNew = (s.outcomes || []).slice((s0.outcomes || []).length);
  const sameChild = s.round === s0.round && s.child === s0.child;
  const rejected = sameChild && s.rejectsThisChild > s0.rejectsThisChild;
  const shipped = outNew.length > 0 && outNew[0].outcome !== 'unchecked';
  if ((rejected || shipped) && ctx.doneKey !== giftKey(s0)) {
    const c = ctx.children.get(`${s0.round}:${s0.child}`);
    const cause = c && c.previewMashAt ? 'preview-mash-buffered' : 'stray-input';
    result.accidental.push({ round: s0.round, child: s0.child, rejects: s0.rejectsThisChild, intended: 'none', effect: rejected ? 'reject' : 'pack', cause, when });
    ctx.log(`ACCIDENTAL: gift ${giftKey(s0)} was ${rejected ? 'rejected' : 'packed'} ${when} without a bot decision`);
  }
  ctx.doneKey = giftKey(s0);
}

// Watch the state for up to ~2.5s after an input and say what it did.
async function observeEffect(ctx, before) {
  const k0 = giftKey(before), out0 = (before.outcomes || []).length;
  const t = now();
  let sawApology = false, sawFlight = false, effect = null, extra = null;
  // A gift in flight after our press means the press took; keep watching longer for its outcome
  // (a busy page can starve the polls for many seconds, which used to look like a stray input).
  while (now() - t < (sawFlight ? 12000 : 2500)) {
    const s = await ctx.snap();
    if (!s) break;
    if (s.phase === 'paused') return { effect: 'paused' };
    if (s.phase === 'apology') sawApology = true;
    if (s.phase === 'flight' && s.round === before.round && s.child === before.child) sawFlight = true;
    const outs = s.outcomes || [];
    const sameChild = s.round === before.round && s.child === before.child;
    const rejDelta = sameChild ? s.rejectsThisChild - before.rejectsThisChild : 0;
    if (outs.length > out0) {
      const first = outs[out0];
      if (rejDelta > 0 || sawApology) { effect = 'reject'; extra = 'reject-then-pack'; }
      else effect = first.outcome === 'unchecked' ? 'timeout' : 'pack';
      if (outs.length > out0 + 1) extra = 'double-acted-next-gift';
      break;
    }
    if (rejDelta > 0 || sawApology) {
      effect = 'reject';
      if (rejDelta > 1) extra = 'double-reject';
      // keep watching briefly for a double action
      if (now() - t > 700) break;
    }
    if (!effect && s.phase === 'belt' && giftKey(s) === k0 && now() - t > 700) return { effect: 'none' };
    if (!effect && s.phase !== 'belt' && s.phase !== 'flight' && s.phase !== 'apology' && giftKey(s) !== k0 && !sameChild) { effect = 'left'; break; }
    await sleep(30);
  }
  if (!effect && sawFlight) return { effect: 'left', extra };   // it went, we just never saw where
  return { effect: effect || 'none', extra };
}

// ---------------------------------------------------------------------------
// Input in persona style. Returns { via, detail }.
// ---------------------------------------------------------------------------
async function performInput(ctx, action, s) {
  const { b, P, rng } = ctx;
  if (P.input === 'touch') return swipe(ctx, action);

  if (P.mouseShare && rng.chance(P.mouseShare)) {
    const sel = action === 'pack' ? '#btnPack' : '#btnReject';
    await b.clickSelector(sel);
    let detail = 'click';
    if (rng.chance(P.double)) { await sleep(rng.range(90, 200)); await b.clickSelector(sel); detail = 'double-click'; }
    return { via: 'mouse', detail };
  }

  if (P.input === 'mash') {
    const keyName = action === 'pack' ? 'ArrowLeft' : 'ArrowRight';
    const n = rng.int(2, 4);
    const parts = [];
    for (let i = 0; i < n; i++) {
      const hold = rng.chance(P.hold) ? rng.range(300, 800) : 0;
      // the occasional → in the middle of the ← hammering
      const k = i > 0 && rng.chance(0.08) ? (keyName === 'ArrowLeft' ? 'ArrowRight' : 'ArrowLeft') : keyName;
      await b.key(k, { holdMs: hold });
      parts.push((k === 'ArrowLeft' ? '←' : '→') + (hold ? `(${Math.round(hold)}ms)` : ''));
      await sleep(rng.range(50, 140));
    }
    return { via: 'keys', detail: 'mash ' + parts.join('') };
  }

  const useAD = P.input === 'keys' && rng.chance(0.25);
  const keyName = action === 'pack' ? (useAD ? 'a' : 'ArrowLeft') : (useAD ? 'd' : 'ArrowRight');
  const hold = rng.chance(P.hold) ? rng.range(300, 800) : 0;
  await b.key(keyName, { holdMs: hold });
  let detail = keyName + (hold ? ` held ${Math.round(hold)}ms` : '');
  if (rng.chance(P.double)) {
    await sleep(rng.range(60, 180));
    await b.key(keyName);
    detail += ' double';
  }
  return { via: 'keys', detail };
}

async function swipe(ctx, action) {
  const { b, rng } = ctx;
  const zone = await b.rect('#beltZone');
  if (!zone) throw new Abort('contract', '#beltZone not visible during the belt phase');
  const gift = await b.rect('#giftLayer .gift');
  const inset = 30;
  const clampX = (x) => Math.min(zone.x + zone.w - inset, Math.max(zone.x + inset, x));
  const clampY = (y) => Math.min(zone.y + zone.h - 8, Math.max(zone.y + 8, y));
  const sign = action === 'pack' ? -1 : 1;
  const roll = rng.r();
  let kind, dx, dy, dur;
  if (roll < 0.10) { kind = 'tap'; dx = 0; dy = 0; }
  else if (roll < 0.30) { kind = 'short'; dx = rng.range(25, 45); dy = rng.range(-8, 8); dur = rng.range(70, 200); }
  else if (roll < 0.50) { kind = 'diagonal'; dx = rng.range(50, 130); dy = dx * rng.range(0.45, 1.25) * (rng.chance(0.5) ? -1 : 1); dur = rng.range(120, 260); }
  else { kind = 'normal'; dx = rng.range(70, 170); dy = rng.range(-15, 15); dur = rng.range(100, 240); }
  // The thumb starts on (or near) the gift, shifted inwards if needed so the intended stroke fits in the zone.
  let x0 = (gift ? gift.cx : zone.cx) + rng.range(-25, 25);
  x0 = sign < 0 ? Math.max(x0, zone.x + inset + dx) : Math.min(x0, zone.x + zone.w - inset - dx);
  x0 = clampX(x0);
  const y0 = clampY((gift ? gift.cy : zone.cy) + rng.range(-20, 20));
  if (kind === 'tap') { await b.tap(x0, y0, { holdMs: rng.range(50, 120) }); return { via: 'swipe', detail: 'tap' }; }
  const steps = rng.int(5, 9);
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const f = i / steps, e = 1 - (1 - f) * (1 - f); // ease-out, like a thumb
    pts.push({ x: clampX(x0 + sign * dx * e) , y: y0 + dy * e + rng.range(-1.5, 1.5) });
  }
  await b.swipe(pts, dur);
  const real = Math.round(pts[pts.length - 1].x - pts[0].x);
  return { via: 'swipe', detail: `${kind} dx=${real} dy=${Math.round(dy)} ${Math.round(dur)}ms` };
}

// ---------------------------------------------------------------------------
// Distracted worker: blur the window or hide the tab mid-gift, come back later.
// ---------------------------------------------------------------------------
function planDistractions(ctx) {
  const { P, rng } = ctx;
  const n = rng.int(P.distractions[0], P.distractions[1]);
  const slots = new Set();
  // gift numbers (revisions count as gifts); at least two gifts apart so each return gets played
  // spread over the whole shift: about 1.3 gifts per child (revisions), 4 children per round
  const maxGift = Math.max(6, Math.round((ctx.args.rounds || 6) * 4 * 1.3));
  for (let tries = 0; slots.size < n && tries < 200; tries++) {
    const g = rng.int(1, maxGift);
    if ([...slots].every((x) => Math.abs(x - g) >= 2)) slots.add(g);
  }
  ctx.distractPlan = slots;
}
function shouldDistract(ctx) {
  return !!(ctx.distractPlan && ctx.distractPlan.has(ctx.giftCount) && (ctx.distractPlan.delete(ctx.giftCount) || true));
}

async function distract(ctx, s, c) {
  const { b, P, rng, result, log } = ctx;
  // 'tab' = switches to another tab; 'minimize' = minimises the window (the closest headless gets to
  // alt-tab: a pure window blur cannot be produced once the page has had input, see cdp.mjs).
  const mode = result.distractions.length % 2 === 0 ? 'tab' : 'minimize';
  const away = rng.range(P.awayMs[0], P.awayMs[1]);
  const rec = { round: s.round, child: s.child, mode, awayMs: Math.round(away), pauseWorked: false, resumedBy: null, resumed: false };
  result.distractions.push(rec);
  log(`distracted (${mode}) for ${(away / 1000).toFixed(1)}s`);
  ctx.pausedByUs = true;
  await b.hidePage(mode);
  const paused = await ctx.waitPhase((x) => x.phase === 'paused', 1500);
  rec.pauseWorked = !!paused;
  if (!paused) console.warn(`[${ctx.tag}] WARN game did not pause after ${mode}`);
  await sleep(away - 1500);
  await b.showPage();
  await sleep(rng.range(500, 1200)); // looking back at the screen
  const st = await ctx.snap();
  if (st && st.phase === 'paused') {
    if (rng.chance(0.5) && (await ctx.visible('#btnResume'))) { await b.clickSelector('#btnResume'); rec.resumedBy = 'click'; }
    else { await b.key('Escape'); rec.resumedBy = 'Esc'; }
    const r = await ctx.waitPhase((x) => x.phase !== 'paused', 4000);
    rec.resumed = !!r;
    if (!r) console.warn(`[${ctx.tag}] WARN still paused after ${rec.resumedBy}`);
  } else rec.resumed = true;
  ctx.pausedByUs = false;
  // Coming back: re-read the letter quickly (it is shown again with a countdown), then the tag.
  c.resumeReadAt = now() + ctx.readMs(c.letterWords) * 0.5;
  ctx.doneKey = null;
}

// ---------------------------------------------------------------------------
// Intro and epilogue (cutscenes that play on their own; Skip button, Enter or S skips, Space advances).
// "Press again to skip" (SPEC §3) is handled by pressing again while the phase is still up.
// ---------------------------------------------------------------------------
async function doCutscene(ctx, phase, s0) {
  const { b, P, rng, result, pass, log, tag } = ctx;
  const phone = P.device === 'phone';
  const spec = phase === 'intro' ? SEL.introSkip : SEL.epilogueSkip;
  let rec = pass[phase];
  const first = !rec;
  if (!rec) {
    rec = pass[phase] = { seenAtMs: now() - ctx.passStart, style: phase === 'intro' ? P.intro : P.epilogue,
                          via: [], presses: 0, skipButton: null, endedBy: null, handlerMs: 0, visits: 0 };
    if (P.twoPasses && pass.label === 'pass2') {
      pass.cutscenesNotAutoSkipped.push(phase);
      result.gameBugs.push({ kind: 'cutscene-not-auto-skipped', phase, detail: `${phase} shown on the second play (Skip cutscenes should be on after a complete shift)` });
      console.warn(`[${tag}] WARN ${phase} shown on the second play; "Skip cutscenes" did not turn itself on`);
      rec.style = 'keyEnter';
    }
    setTimeout(() => ctx.shot(`${pass.label === 'pass1' ? 'pass1-' : ''}${phase}`), 1500);
  }
  rec.visits++;
  // Re-entry after we returned without the phase ending (and not because of a pause): fall back to keys.
  const style = first || rec.endedBy === 'paused' ? rec.style : 'fallback';
  const t = now();
  const cur = async () => (await ctx.snap())?.phase;
  const still = async () => (await cur()) === phase;
  const waitGone = async (ms) => { const end = now() + ms; while (now() < end) { const p = await cur(); if (p !== phase) return p; await sleep(80); } return phase; };
  // A viewer of the closing film: its last scenes hold on a Next button, so read each one, then press it
  const nextShown = () => b.evaluate(`(() => { const n = document.querySelector('#epilogue .ep-next'); return !!n && getComputedStyle(n).visibility === 'visible'; })()`).catch(() => false);
  const watchFilm = async (ms) => {
    const end = now() + ms;
    while (now() < end) {
      const p = await cur();
      if (p !== phase) return p;
      if (phase === 'epilogue' && await nextShown()) {
        rec.heldScenes = (rec.heldScenes || 0) + 1;
        await sleep(rng.range(2500, 5000));
        if (phone) await b.tapSelector('#epilogue .ep-next'); else await b.key(rng.chance(0.5) ? 'Enter' : 'Space');
        rec.presses++; rec.via.push('next');
        await sleep(rng.range(700, 1000));
      } else await sleep(80);
    }
    return phase;
  };

  // One "skip" gesture of the given kind; if it is still up a moment later (e.g. "Press again to
  // skip", which disarms after a few seconds), press again promptly, like a person reading the hint.
  let lastBtn = null;
  const skip = async (how, tries = 4) => {
    for (let i = 0; i < tries; i++) {
      let via = how;
      if (how === 'button') {
        // re-use the rect for a quick second press (the label changes but the button stays put)
        const btn = (i > 0 && lastBtn) || (await ctx.findBtn(spec));
        if (rec.skipButton == null) rec.skipButton = btn ? btn.text : false;
        lastBtn = btn;
        if (btn) via = (await ctx.pressAt(btn)) + ':skip';
        else if (phone) { await b.tapSelector('#' + phase, { jitter: 0.3 }).catch(() => {}); via = 'tap:overlay(no skip button)'; }
        else { await b.key('s'); via = 'key:S(no skip button)'; }
      } else if (how === 'S') { await b.key('s'); via = 'key:S'; }
      else { await b.key('Enter'); via = 'key:Enter'; }
      rec.presses++; rec.via.push(via);
      const pressedAt = now();
      const p = await waitGone(rng.range(400, 900));
      if (p !== phase) return p;
      if (i === 0 && rec.pressAgainHint == null) {
        rec.pressAgainHint = !!(await b.evaluate(`/again/i.test((document.getElementById(${JSON.stringify(phase)}) || {}).innerText || '')`).catch(() => false));
      }
      if (i > 0) lastBtn = null;               // third try onwards: look for the button again
      rec.repressGapMs = rec.repressGapMs || [];
      rec.repressGapMs.push(now() - pressedAt);
    }
    return phase;
  };

  let endPhase = phase;
  switch (style) {
    case 'watch20': {                       // careful reader: watches about 20s, then skips
      endPhase = await watchFilm(rng.range(18000, 22000));
      if (endPhase === phase) endPhase = await skip('button');
      break;
    }
    case 'watch': {                         // watches it all, pressing Next on the held scenes; nudges if it never ends
      endPhase = await watchFilm(45000);
      for (let i = 0; endPhase === phase && i < 10; i++) { await b.key('Space'); rec.presses++; rec.via.push('key:Space'); endPhase = await waitGone(3000); }
      if (endPhase === phase) endPhase = await skip('Enter');
      break;
    }
    case 'mash': {                          // skipper: Enter / Space hammering
      const end = now() + 30000;
      while (now() < end && (await still())) {
        const k = rng.chance(0.5) ? 'Enter' : 'Space';
        await b.key(k); rec.presses++; rec.via.push('mash:' + k);
        await sleep(rng.range(120, 300));
      }
      endPhase = await cur();
      if (endPhase === phase) endPhase = await skip('S');
      break;
    }
    case 'keyS': await sleep(rng.range(1000, 3000)); endPhase = (await still()) ? await skip('S') : await cur(); break;
    case 'keyEnter': await sleep(rng.range(800, 2000)); endPhase = (await still()) ? await skip('Enter') : await cur(); break;
    case 'tab': {                           // keyboard only: Tab to the skip button, Enter
      await sleep(rng.range(800, 1600));
      let ok = false;
      for (let i = 0; i < 12 && !(ok = await ctx.focusIs(spec)); i++) { if (!(await still())) break; await b.key('Tab'); await sleep(rng.range(120, 300)); }
      rec.tabFocus = ok;
      if (ok) { endPhase = await skip('Enter'); rec.via = rec.via.map((v) => (v === 'key:Enter' ? 'tab+Enter' : v)); }
      else {
        if (await still()) console.warn(`[${tag}] WARN could not Tab-focus the ${phase} skip button; using S`);
        endPhase = (await still()) ? await skip('S') : await cur();
      }
      break;
    }
    case 'fallback':
      endPhase = await skip(phone ? 'button' : 'Enter', 2);
      if (endPhase === phase) endPhase = await skip(phone ? 'button' : 'S', 2);
      break;
    default:                                // 'button': Skip to the shift / Skip
      await sleep(phone ? rng.range(500, 1500) : rng.range(700, 2000));
      endPhase = (await still()) ? await skip('button') : await cur();
  }
  rec.handlerMs += now() - t;
  rec.endedBy = endPhase === phase ? 'still-up' : endPhase === 'paused' ? 'paused' : 'ended';
  log(`${phase}: style ${style}, ${rec.presses} press(es) [${rec.via.slice(-4).join(', ')}] -> ${endPhase}`);
}

// ---------------------------------------------------------------------------
// Round 6 (SPEC §4f): the engine shows phase 'montage' while each of the 4 gifts rides the belt, with
// preview / flight / result in between. The player has been sacked, so the buttons must be disabled.
// ---------------------------------------------------------------------------
async function doMontage(ctx, s0) {
  const { b, pass, result, tag } = ctx;
  if (pass.montage) pass.montage.segments++;
  if (!pass.montage) {
    pass.montage = { seenAtMs: now() - ctx.passStart, outcomesAtStart: (s0.outcomes || []).length, segments: 1, ms: 0, round: s0.round };
    if (s0.round !== 6 || !s0.automated) {
      result.gameBugs.push({ kind: 'montage-outside-round-6', detail: `montage in round ${s0.round}, automated ${s0.automated}` });
      console.warn(`[${tag}] GAME BUG: montage in round ${s0.round}`);
    }
    setTimeout(() => ctx.shot(`${pass.label === 'pass1' ? 'pass1-' : ''}montage`), 2000);
  }
  const off = await b.evaluate(`document.getElementById('btnPack').disabled && document.getElementById('btnReject').disabled`).catch(() => null);
  if (off !== null) pass.montage.buttonsDisabled = pass.montage.buttonsDisabled !== false && off;
  const end = now() + 60000;   // just wait (under 4s per child)
  while (now() < end) { const s = await ctx.snap(); if (!s || s.phase !== 'montage') break; await sleep(100); }
  // first belt to the end of the latest one (covers all 4 children with the gaps between)
  pass.montage.ms = now() - ctx.passStart - pass.montage.seenAtMs;
  pass.montage.outcomesAtEnd = ((await ctx.snap())?.outcomes || []).length;
}

// An unknown phase (the game is newer than this harness): wait, then try a generic "advance".
async function nudgeUnknown(ctx, s) {
  const { b, P, result } = ctx;
  if (now() - ctx.lastPhaseAt < UNKNOWN_NUDGE_MS) { await sleep(150); return; }
  const btn = await ctx.findBtn({ scopes: ['.overlay:not([hidden])', '#app'], classes: [], re: 'skip|continue|next|ok|start' });
  result.unknownNudges++;
  if (btn) await ctx.pressAt(btn);
  else if (P.device === 'phone') await b.tap(VIEWPORTS.phone.width / 2, VIEWPORTS.phone.height / 2);
  else await b.key('Space');
  ctx.log(`unknown phase "${s.phase}": nudged with ${btn ? btn.text : 'Space/tap'}`);
  await sleep(1500);
}

// Time spent per cutscene phase from the pass's phase segments (a pause inside one is merged into it).
function cutsceneTimes(segs) {
  const list = [];
  let prev = null, pausedBetween = false;
  for (const s of segs) {
    if (s.phase === 'paused') { pausedBetween = true; continue; }
    if (CUTSCENE_PHASES.includes(s.phase)) {
      if (prev && pausedBetween && prev.phase === s.phase) prev.ms += s.ms;
      else { prev = { phase: s.phase, atMs: s.t, ms: s.ms, round: s.round }; list.push(prev); }
    } else prev = null;
    pausedBetween = false;
  }
  const one = (p) => { const x = list.filter((c) => c.phase === p); return x.length ? x.reduce((a, c) => a + c.ms, 0) : null; };
  return { intro: one('intro'), interludes: list.filter((c) => c.phase === 'interlude').map((c) => c.ms),
           montage: one('montage'), epilogue: one('epilogue'), list };
}

// ---------------------------------------------------------------------------
// Interlude
// ---------------------------------------------------------------------------
async function doInterlude(ctx) {
  const { b, P, rng, pass } = ctx;
  const t = now();
  // the floor is in the DOM from the first beat: count the elves walking out of this interlude
  const leaving = await b.evaluate(`document.querySelectorAll('#interlude .il-walk').length`).catch(() => null);
  if (leaving !== null) (pass.leavingElves = pass.leavingElves || []).push(leaving);
  const still = async () => (await ctx.snap())?.phase === 'interlude';
  switch (P.interlude) {
    case 'mash': {
      // Mash until it is gone. Keys that land after it ends must not act on the next gift.
      while (await still()) {
        await b.key(rng.chance(0.5) ? 'Enter' : 'Space');
        await sleep(rng.range(120, 300));
        if (now() - t > 20000) break;
      }
      return;
    }
    case 'tap':
      while (await still()) {
        await sleep(rng.range(1500, 3500));
        if (!(await still())) return;
        // thumbs go for the Continue button when there is one, otherwise anywhere on the overlay
        if (await ctx.visible('#interlude .il-next')) await b.tapSelector('#interlude .il-next');
        else if (await ctx.visible('#interlude')) await b.tapSelector('#interlude', { jitter: 0.3 });
        if (now() - t > 25000) return;
      }
      return;
    case 'keys':
      while (await still()) {
        await sleep(rng.range(2200, 3500));
        if (!(await still())) return;
        await b.key('Space');
        if (now() - t > 25000) return;
      }
      return;
    default: // read each beat (they wait for the player), then click Continue
      while (await still()) {
        await sleep(rng.range(3000, 6000));
        if (!(await still())) return;
        if (await ctx.visible('#interlude .il-next')) await b.clickSelector('#interlude .il-next');
        else await b.key('Space');
        if (now() - t > 45000) return;
      }
  }
}

// ---------------------------------------------------------------------------
// aria-live log: a MutationObserver records every #live text change (DOM read only).
// ---------------------------------------------------------------------------
async function installLiveLog(b) {
  await b.evaluate(`(() => {
    window.__botLive = [];
    const el = document.getElementById('live');
    if (!el) return false;
    new MutationObserver(() => window.__botLive.push({ t: Date.now(), text: el.textContent }))
      .observe(el, { childList: true, characterData: true, subtree: true });
    return true;
  })()`).catch(() => false);
}

async function finalizeLive(ctx) {
  const { b, result } = ctx;
  const entries = (await b.evaluate('window.__botLive || []').catch(() => [])) || [];
  const letters = [...ctx.children.values()];
  const st = await ctx.snap();
  // Match each letter to an announcement made between its preview and the next child's preview.
  const ann = letters.map((c, i) => {
    const end = letters[i + 1] ? letters[i + 1].previewAt : Infinity;
    const during = entries.filter((e) => e.t >= c.previewAt - 1500 && e.t < end && e.text && e.text.trim());
    return { child: c.key, announcements: during.length };
  });
  result.live = {
    changes: entries.length,
    letters: letters.length,
    lettersAnnounced: ann.filter((a) => a.announcements > 0).length,
    perLetter: ann,
    sample: entries.slice(0, 6).map((e) => e.text.slice(0, 120)),
    outcomesSeen: st && st.outcomes ? st.outcomes.length : null,
  };
}

// ---------------------------------------------------------------------------
// Runner, summary, targets
// ---------------------------------------------------------------------------
async function pool(jobs, n, fn) {
  const results = [];
  let i = 0;
  const workers = Array.from({ length: Math.min(n, jobs.length) }, async () => {
    while (i < jobs.length) { const j = jobs[i++]; results.push(await fn(j)); }
  });
  await Promise.all(workers);
  return results;
}

const avg = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
// Pooled right% for round k over runs: { c, t, pct } or null.
function roundPct(rs, k) {
  const t = rs.reduce((a, r) => a + (r.perRound[k]?.total || 0), 0);
  const c = rs.reduce((a, r) => a + (r.perRound[k]?.correct || 0), 0);
  return t ? { c, t, pct: (100 * c) / t } : null;
}
const fmt = (x, d = 1) => (x == null ? '-' : Number(x).toFixed(d));

function printSummary(results) {
  const by = {};
  for (const r of results) (by[r.persona] = by[r.persona] || []).push(r);
  const table = (rows) => {
    const w = rows[0].map((_, i) => Math.max(...rows.map((r) => String(r[i]).length)));
    const line = (r) => r.map((c, i) => String(c).padEnd(w[i])).join('  ');
    console.log('\n' + line(rows[0]));
    console.log(w.map((x) => '-'.repeat(x)).join('  '));
    for (const r of rows.slice(1)) console.log(line(r));
  };
  const sum = (rs, f) => rs.reduce((a, r) => a + (f(r) || 0), 0);
  const secs = (xs) => { const v = xs.filter((x) => x != null); return v.length ? fmt(avg(v) / 1000) : '-'; };

  // 1. outcomes
  const rows = [['persona', 'runs', 'done', 'aband', 'err', 'right%', 'R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'timeout', 'accid(nonslip)', 'ignored', 'stuck', 'console', 'ttfg s', 'session s']];
  for (const [p, rs] of Object.entries(by)) {
    const done = rs.filter((r) => r.completed);
    rows.push([p, rs.length, done.length, rs.filter((r) => r.abandoned).length, rs.filter((r) => r.error).length,
      fmt(avg(done.map((r) => r.rightPct).filter((x) => x != null))),
      ...[1, 2, 3, 4, 5, 6].map((k) => { const pr = roundPct(rs, k); return pr ? `${pr.c}/${pr.t}` : '-'; }),
      sum(rs, (r) => r.timeouts),
      `${sum(rs, (r) => r.accidentalCount)}(${sum(rs, (r) => r.accidentalNonSlip)})`,
      sum(rs, (r) => r.ignoredInputs), sum(rs, (r) => r.stuck.length), sum(rs, (r) => r.consoleErrors.length),
      secs(rs.map((r) => r.timeToFirstGiftMs)), fmt(avg(done.map((r) => r.sessionMs / 1000)), 0)]);
  }
  table(rows);
  // 2. per-round right% (pooled over runs)
  const rp = [['persona', 'R1%', 'R2%', 'R3%', 'R4%', 'R5%', 'R6%', 'R1-R5 pts']];
  for (const [p, rs] of Object.entries(by)) {
    const v = [1, 2, 3, 4, 5, 6].map((k) => roundPct(rs, k));
    rp.push([p, ...v.map((x) => (x ? fmt(x.pct, 0) : '-')), v[0] && v[4] ? fmt(v[0].pct - v[4].pct, 0) : '-']);
  }
  table(rp);
  // 3. cutscenes and round 6
  const cs = [['persona', 'intro s', 'intro via', 'interludes', 'interlude s (mean)', 'AI right/n', 'montage s', 'epilogue s', 'epi via']];
  for (const [p, rs] of Object.entries(by)) {
    const c = (f) => rs.map((r) => (r.cutscenes ? f(r.cutscenes) : null));
    const via = (k) => [...new Set(rs.map((r) => (!r[k] ? null : r[k].via.length ? r[k].via[r[k].via.length - 1].split('(')[0] : 'watched')).filter(Boolean))].join('/') || '-';
    const auto = rs.flatMap((r) => (r.automation ? r.automation.children : []));
    cs.push([p, secs(c((x) => x.intro)), via('intro'), sum(rs, (r) => r.interludes) || '-',
      secs(c((x) => (x.interludes.length ? avg(x.interludes) : null))),
      auto.length ? `${auto.filter((x) => x.correct).length}/${auto.length}` : '-',
      secs(rs.map((r) => (r.montage ? r.montage.ms : null))), secs(c((x) => x.epilogue)), via('epilogue')]);
  }
  table(cs);

  for (const r of results) {
    for (const g of r.gameBugs || []) console.log(`  ${r.persona}#${r.run} GAME BUG ${g.kind}: ${g.detail}`);
    if (r.unknownPhases.length) console.log(`  ${r.persona}#${r.run} unknown phases: ${r.unknownPhases.join(', ')}`);
    if (r.automation) console.log(`  ${r.persona}#${r.run} round 6: player ${r.automation.playerRight}/${r.automation.playerTotal}, AI ${r.automation.aiRight}/${r.automation.children.length} (expected ${r.automation.expectedRight}): ${r.automation.children.map((x) => `${x.name || '?'} ${x.outcome}${x.correct ? '+' : 'x'}`).join(', ')}`);
    if (r.error) console.log(`\n  ${r.persona}#${r.run} ERROR: ${r.error.split('\n')[0]}`);
    for (const e of r.consoleErrors.slice(0, 3)) console.log(`  ${r.persona}#${r.run} console: ${String(e.text).split('\n')[0].slice(0, 160)}`);
    for (const s of r.stuck) console.log(`  ${r.persona}#${r.run} ${s.kind === 'cutscene>120s' ? 'over 120s in' : 'stuck in'} "${s.phase}" at ${fmt(s.t / 1000)}s (round ${s.round}, child ${s.child})`);
    for (const a of r.accidental) console.log(`  ${r.persona}#${r.run} accidental: r${a.round} c${a.child} intended ${a.intended}, got ${a.effect} (${a.cause}${a.detail ? ', ' + a.detail : ''})`);
    if (r.abandoned) console.log(`  ${r.persona}#${r.run} abandoned: ${r.abandonedNote}`);
  }
}

const R5_HARDER_PTS = 15;   // "noticeably harder": round 5 right% at least this many points below round 1

function checkTargets(results, args = {}) {
  const out = [];
  const add = (name, ok, detail) => out.push({ target: name, status: ok === null ? 'N/A' : ok ? 'PASS' : 'WARN', detail });
  const of = (p) => results.filter((r) => r.persona === p);
  const meanRight = (rs) => avg(rs.filter((r) => r.completed && r.rightPct != null).map((r) => r.rightPct));
  const personas = [...new Set(results.map((r) => r.persona))];

  if (of('carefulReader').length) { const m = meanRight(of('carefulReader')); add('carefulReader right% 70–90', m == null ? null : m >= 70 && m <= 90, `mean ${fmt(m)}%`); }
  if (of('masher').length) { const m = meanRight(of('masher')); add('masher right% 30–50', m == null ? null : m >= 30 && m <= 50, `mean ${fmt(m)}%`); }
  {
    const per = personas.map((p) => ({ p, r1: roundPct(of(p), 1), r5: roundPct(of(p), 5) })).filter((x) => x.r1 && x.r5);
    add(`round 5 noticeably harder than round 1 for every persona (R1 - R5 >= ${R5_HARDER_PTS} pts)`,
      per.length ? per.every((x) => x.r1.pct - x.r5.pct >= R5_HARDER_PTS) : null,
      per.length ? per.map((x) => `${x.p} ${fmt(x.r1.pct, 0)}→${fmt(x.r5.pct, 0)}`).join(', ') : 'no round 5 data');
  }
  const stuckOnly = results.reduce((a, r) => a + r.stuck.filter((s) => s.kind !== 'cutscene>120s').length, 0);
  const longCut = results.reduce((a, r) => a + r.stuck.filter((s) => s.kind === 'cutscene>120s').length, 0);
  add('no stuck states (cutscenes exempt while they show a button)', stuckOnly === 0, `${stuckOnly} stuck episode(s)`);
  add('no cutscene/interlude phase over 120s', longCut === 0, `${longCut} long cutscene(s)`);
  const errs = results.reduce((a, r) => a + r.consoleErrors.length, 0);
  add('no console errors / exceptions', errs === 0, `${errs} error(s)`);
  const harness = results.filter((r) => r.error).length;
  add('every run completed or abandoned on purpose', harness === 0, `${harness} run(s) with errors`);
  if (of('phoneScroller').length) {
    const t = of('phoneScroller').map((r) => r.timeToFirstGiftMs).filter((x) => x != null);
    const introSeen = of('phoneScroller').some((r) => r.intro);
    add(`phone time to first gift <= 20s (intro ${args.skipintro ? 'skipped by ?skipintro=1' : introSeen ? 'skipped by the bot' : 'not shown'})`,
      t.length ? Math.max(...t) <= 20000 : false, t.length ? `max ${fmt(Math.max(...t) / 1000)}s` : 'never reached a gift');
  }
  {
    const done = results.filter((r) => (r.outcomes || []).length >= 24);
    const ai = done.filter((r) => r.automation);
    if (done.length) {
      add('round 6 is a montage of 4 unchecked children', done.every((r) => r.automation && r.automation.montageSeen && r.automation.children.length === 4 && r.automation.children.every((x) => x.round === 6) && r.automation.allUnchecked),
        done.map((r) => `${r.persona}#${r.run}: ${r.automation ? r.automation.children.map((x) => x.outcome).join('/') : 'no AI round'}`).join('; '));
      add('both buttons disabled during round 6', ai.length ? ai.every((r) => r.automation.buttonsDisabled === true) : false,
        ai.filter((r) => r.automation.buttonsDisabled !== true).map((r) => `${r.persona}#${r.run}`).join(', ') || 'ok');
      add("AI's right count = the player's rounds 1-5 rate, rounded", ai.length ? ai.every((r) => r.automation.aiRight === r.automation.expectedRight) : false,
        ai.map((r) => `${r.persona}#${r.run}: ${r.automation.playerRight}/${r.automation.playerTotal} -> ${r.automation.aiRight}/4`).join('; '));
    }
  }
  if (of('secondRun').length) {
    const sr = of('secondRun').filter((r) => r.completed);
    add('secondRun: cutscenes auto-skipped on the second play', sr.length ? sr.every((r) => !r.cutscenesNotAutoSkipped.length) : null,
      sr.map((r) => r.cutscenesNotAutoSkipped.join('+') || 'none shown').join(', ') || 'no completed second pass');
    const again = sr.filter((r) => r.leavingElves && r.leavingElves.length);
    add('secondRun: a repeat shift shows no leaving elves', again.length ? again.every((r) => r.leavingElves.every((n) => n === 0)) : null,
      again.map((r) => `pass 1 ${(r.firstPass && r.firstPass.leavingElves || []).join('/') || '-'}, pass 2 ${r.leavingElves.join('/')}`).join('; ') || 'no interlude seen on the second pass');
  }
  {
    const bugs = results.flatMap((r) => r.gameBugs || []).filter((g) => g.kind !== 'cutscene-not-auto-skipped');
    if (bugs.length) add('no other game bugs seen by the harness', false, bugs.map((g) => g.kind).join(', '));
    const unk = [...new Set(results.flatMap((r) => r.unknownPhases))];
    if (unk.length) add('no phases outside the contract', false, unk.join(', '));
  }
  if (of('distracted').length) {
    const ds = of('distracted').flatMap((r) => r.distractions);
    add('blur/hide always pauses, resume works', ds.length ? ds.every((d) => d.pauseWorked && d.resumed) : null,
      `${ds.filter((d) => d.pauseWorked).length}/${ds.length} paused, ${ds.filter((d) => d.resumed).length}/${ds.length} resumed`);
  }
  if (of('keyboardOnly').length) {
    const ls = of('keyboardOnly').map((r) => r.live).filter(Boolean);
    add('#live announces every letter (keyboardOnly)', ls.length ? ls.every((l) => l.letters > 0 && l.lettersAnnounced === l.letters) : false,
      ls.map((l) => `${l.lettersAnnounced}/${l.letters}`).join(', ') || 'no data');
    const tab = of('keyboardOnly').map((r) => r.titleTabFocus !== false && (!r.briefing || r.briefing.tabFocused !== false));
    add('Start shift + briefing reachable by Tab', tab.every(Boolean), tab.join(', '));
  }
  const nonSlip = results.reduce((a, r) => a + r.accidentalNonSlip, 0);
  add('no game-caused accidental inputs (excl. bot slips)', nonSlip === 0, `${nonSlip} non-slip accidental input(s)`);
  return out;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(`Usage: node tests/bots.mjs [--persona name|all] [--runs N] [--seed S] [--headed] [--relaxed]
                     [--rounds N] [--skipintro] [--parallel N] [--slice path] [--verbose]
  --rounds N    adds ?rounds=N (the game stops after N rounds; quick tests)
  --skipintro   adds ?skipintro=1 (no intro)
Personas: ${Object.keys(PERSONAS).join(', ')}`);
    process.exit(0);
  }
  if (!existsSync(args.slice)) {
    console.error(`ERROR: game file not found: ${args.slice}\nBuild it first:  node prototype/build.mjs   (it writes prototype/slice.html)\nor point at another build with --slice <path>.`);
    process.exit(2);
  }
  const names = args.persona === 'all' ? Object.keys(PERSONAS) : args.persona.split(',').map((x) => x.trim());
  for (const n of names) if (!PERSONAS[n]) { console.error(`ERROR: unknown persona "${n}". Known: ${Object.keys(PERSONAS).join(', ')}`); process.exit(2); }
  mkdirSync(OUT, { recursive: true });

  const jobs = [];
  for (let i = 1; i <= args.runs; i++) for (const n of names) jobs.push({ persona: n, run: i });
  console.log(`Playtest: ${jobs.length} run(s) [${names.join(', ')}] x${args.runs}, seed ${args.seed}, up to ${args.parallel} browsers${args.relaxed ? ', relaxed belt' : ''}${args.rounds ? `, ${args.rounds} round(s)` : ''}${args.skipintro ? ', intro skipped' : ''}`);
  console.log(`Game: ${args.slice}`);
  const tStart = now();
  const results = await pool(jobs, args.parallel, async (j) => {
    console.log(`  start ${j.persona}#${j.run}`);
    const r = await runOne(j.persona, j.run, args);
    console.log(`  end   ${j.persona}#${j.run}: ${r.error ? 'ERROR' : r.abandoned ? 'abandoned' : r.completed ? 'report' : 'incomplete'}, right ${fmt(r.rightPct)}%, ${(r.sessionMs / 1000).toFixed(0)}s`);
    return r;
  });
  results.sort((a, b) => (a.persona < b.persona ? -1 : a.persona > b.persona ? 1 : a.run - b.run));

  printSummary(results);
  const targets = checkTargets(results, args);
  console.log('\nTargets (SPEC §6c):');
  for (const t of targets) console.log(`  ${t.status.padEnd(4)}  ${t.target}  (${t.detail})`);

  const file = join(OUT, 'results.json');
  writeFileSync(file, JSON.stringify({ when: new Date().toISOString(), args: { ...args }, wallMs: now() - tStart, targets, results }, null, 2));
  console.log(`\nWrote ${file}`);
  killAll();
  process.exit(results.some((r) => r.error) ? 1 : 0);
}

main().catch((e) => { console.error('FATAL', e && e.stack || e); killAll(); process.exit(1); });
