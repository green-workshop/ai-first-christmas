#!/usr/bin/env node
// Scripted regression checks: quick, exact checks for things the persona bots only meet by chance.
// Each scenario gets its own browser and plays with real input through headless Edge.
//
//   node tests/checks.mjs [--parallel 4] [--only name,name] [--slice path/to/slice.html]
//
// Exits 1 if any check fails. Run it through PowerShell, as with the bots (see README).
import { launch, killAll } from './cdp.mjs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { mkdirSync } from 'node:fs';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, 'out', 'checks');
mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : d; };
const SLICE = resolve(opt('slice', join(HERE, '..', 'slice.html')));
const DESKTOP = { width: 1280, height: 800, mobile: false, deviceScaleFactor: 1 };
const PHONE = { width: 375, height: 812, mobile: true, deviceScaleFactor: 2 };

// The progress the game used to save: none of it may be in storage now
const OLD_KEYS = ['played', 'introSeen', 'endingSeen', 'skipCutAuto', 'lastShift'];

class Run {
  constructor(name, b) { this.name = name; this.b = b; this.results = []; this.errors = []; }
  check(what, ok, detail) { this.results.push({ what, ok: !!ok, detail }); }
  q(js) { return this.b.evaluate(js); }
  st() {
    return this.q(`(()=>{const s=__game.state(),$=i=>document.getElementById(i);return {phase:s.phase,round:s.round,child:s.child,repeat:s.repeat,adoption:s.adoption,correct:s.giftCorrect,rejects:s.rejectsThisChild,
      patch:$('hPatch').textContent,toast:!$('toast').hidden,toastText:$('toast').textContent,gifts:$('giftLayer').children.length,brief:!$('briefing').hidden,il:!$('interlude').hidden,
      droid:!$('droid').hidden,title:!$('screen-title').hidden,intro:!$('btnIntro').hidden,ending:!$('btnEnding').hidden,skip:$('setSkipCut').checked,sleigh:$('sleigh').querySelectorAll('.sl-item').length}})()`);
  }
  async open(params = '', vp = DESKTOP) {
    await this.b.setViewport(vp);
    await this.b.navigate(`${pathToFileURL(SLICE).href}?${params}`);
    await sleep(200);
  }
  async storage() { return JSON.parse(await this.q(`JSON.stringify(Object.fromEntries(Object.keys(localStorage).map(k=>[k.replace('np.',''),JSON.parse(localStorage.getItem(k))])))`)); }
  async go() {   // from the briefing, past its short lockout
    await sleep(500);
    await this.b.clickSelector('#btnBriefingGo');
  }
  async start() {
    await this.b.clickSelector('#btnStart'); await sleep(300);
    if ((await this.st()).phase === 'intro') { await this.b.key('s'); await sleep(400); }
    await this.go();
  }
  // Plays until stopAt says so, or to the report. choose(state) returns 'pack', 'right' (get the right gift) or 'wrong' (ship a wrong one)
  async play({ choose = () => 'pack', stopAt = () => false, film = 'skip', reading = null, interlude = null, onPreview = null } = {}) {
    const b = this.b; let seen = -1;
    for (let i = 0; i < 40000; i++) {
      const s = await this.st();
      if (stopAt(s)) return s;
      if (s.phase === 'preview') { if (onPreview) await onPreview(s); await b.key('Space'); await sleep(90); }
      else if (s.phase === 'belt') {
        await sleep(340);
        const t = await this.st();
        if (t.phase === 'belt') {
          const want = choose(t);
          const ok = want === 'pack' || t.rejects >= 4 || (want === 'right' && t.correct) || (want === 'wrong' && !t.correct);
          await b.key(ok ? 'ArrowLeft' : 'ArrowRight');
          await sleep(160);
        }
      } else if (s.phase === 'interlude') {
        if (s.child !== seen) { seen = s.child; if (interlude) await interlude(s); }
        await b.key('s'); await sleep(250);
      } else if (s.phase === 'intro') { await b.key('s'); await sleep(250); }
      else if (s.phase === 'epilogue') {
        if (film === 'skip') { await sleep(300); await b.key('s'); await sleep(400); }
        else if (film === 'read') {
          reading.scenes = [];
          for (let n = 0; n < 40 && (await this.st()).phase === 'epilogue'; n++) {
            reading.scenes.push(await this.q(`(()=>{const c=document.querySelector('#epilogue .il-cap'),k=document.querySelector('#epilogue .ep-sc.on');return {cap:c?c.textContent:'',cls:k?k.className:'',num:k&&k.querySelector('.ep-num')?k.querySelector('.ep-num').textContent:null,sr:(document.querySelector('#epilogue .sr-only')||{}).textContent}})()`));
            await sleep(420); await b.key('Space'); await sleep(150);
          }
        } else return s;
      } else if (s.phase === 'report') { await sleep(1250); return s; }
      else await sleep(50);
    }
    throw new Error('never finished');
  }
  async copyText() {
    await this.q(`Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:t=>{window.__copied=t;return Promise.resolve()}}});1`);
    await this.b.clickSelector('#btnCopy'); await sleep(150);
    return this.q('window.__copied');
  }
  async notes() { return JSON.parse(await this.q(`JSON.stringify([...document.getElementById('reportNotes').children].map(l=>l.textContent))`)); }
  async report() {
    return this.q(`(()=>{const t=i=>document.getElementById(i).textContent;return {title:t('reportTitle'),verdict:t('reportVerdict'),right:t('rRight'),adopt:t('rAdopt'),you:t('rYou'),ai:t('rAi'),chain:t('reportChain')}})()`);
  }
  async pauseAnd(...sels) { await this.b.key('Escape'); await sleep(300); for (const s of sels) { await this.b.clickSelector(s); await sleep(200); } await sleep(500); }
}

const roundOf = (s) => Math.floor(s.child / 4) + 1;
const SCENARIOS = {};

// Restart or Resign during an interlude must leave nothing of the old shift running (review F1)
function cleanNewShift(r, s, label) {
  r.check(`${label}: briefing shows and the phase agrees`, s.phase === 'briefing' && s.brief, JSON.stringify(s));
  r.check(`${label}: shift is back to child 0 on v1.0`, s.child === 0 && s.patch === 'v1.0', `child ${s.child}, ${s.patch}`);
  r.check(`${label}: no toast from the old shift`, !s.toast, s.toastText);
  r.check(`${label}: no gift behind the briefing`, s.gifts === 0, s.gifts);
}
async function afterRestart(r, label) {
  await sleep(2500);
  cleanNewShift(r, await r.st(), label);
  await r.go(); await sleep(6000);
  const s = await r.st();
  r.check(`${label}: child 1 starts once after Start checking`, s.child === 0 && s.gifts === 1 && s.adoption === 8, JSON.stringify(s));
}
SCENARIOS.restartInterlude = async (r) => {
  await r.open('skipintro=1&seed=3'); await r.start();
  await r.play({ stopAt: (s) => s.phase === 'interlude' });
  await r.pauseAnd('#btnRestart');
  await afterRestart(r, 'restart at interlude 1');
};
SCENARIOS.restartSacking = async (r) => {
  await r.open('skipintro=1&seed=4'); await r.start();
  await r.play({ stopAt: (s) => s.phase === 'interlude' && s.child === 20 });
  await r.pauseAnd('#btnRestart');
  await afterRestart(r, 'restart at the sacking');
};
SCENARIOS.resignInterlude = async (r) => {
  await r.open('skipintro=1&seed=5'); await r.start();
  await r.play({ stopAt: (s) => s.phase === 'interlude' });
  await r.pauseAnd('#btnQuit', '#btnQuitYes');
  const s = await r.st();
  r.check('resign at interlude: on the title, interlude gone', s.phase === 'title' && s.title && !s.il, JSON.stringify(s));
};
SCENARIOS.resignSacking = async (r) => {
  await r.open('skipintro=1&seed=6'); await r.start();
  await r.play({ stopAt: (s) => s.phase === 'interlude' && s.child === 20 });
  await r.pauseAnd('#btnQuit', '#btnQuitYes');
  const s = await r.st();
  r.check('resign at the sacking: on the title, interlude gone', s.phase === 'title' && s.title && !s.il && !s.toast, JSON.stringify(s));
  await r.b.clickSelector('#btnStart'); await sleep(2000);
  cleanNewShift(r, await r.st(), 'next shift after resigning at the sacking');
};

// Resign during the droid (review F2)
SCENARIOS.droidResign = async (r) => {
  await r.open('skipintro=1&seed=7'); await r.start();
  await r.play({ choose: () => 'never', stopAt: (s) => s.phase === 'belt' && s.rejects >= 4 });
  await sleep(350); await r.b.key('ArrowLeft');
  for (let i = 0; i < 200 && !(await r.st()).droid; i++) await sleep(30);
  r.check('droid appears after a 4th reject', (await r.st()).droid);
  await r.pauseAnd('#btnQuit', '#btnQuitYes');
  const s = await r.st();
  r.check('resign during the droid: no droid on the title', s.phase === 'title' && !s.droid && !s.toast, JSON.stringify(s));
};

// A pack-everything shift: the low band, then the whole session lifecycle
SCENARIOS.lowAndSession = async (r) => {
  await r.open('seed=8');
  let s = await r.st();
  r.check('new visit: no Replay buttons, Skip cutscenes off', !s.intro && !s.ending && !s.skip, JSON.stringify(s));
  await r.b.clickSelector('#btnStart'); await sleep(500);
  r.check('new visit: the opening film plays', (await r.st()).phase === 'intro');
  await r.b.key('s'); await sleep(400); await r.go();
  const film = {}, floors = [];
  await r.play({ film: 'read', reading: film, interlude: async () => { floors.push(await r.q(`document.querySelector('#interlude .il-mb').textContent`)); } });
  r.check('first shift is not a repeat', !(await r.st()).repeat && /LetterBot/.test(floors[0]), floors[0]);
  const rep = await r.report(), plate = parseInt(rep.adopt, 10);
  const e1 = film.scenes[0], e2 = film.scenes[1];
  r.check('F4 film: caption, dashboard and report agree on adoption', e1.num === rep.adopt && e1.cap.includes(rep.adopt), `${e1.num} / ${e1.cap} / ${rep.adopt}`);
  r.check('F4 film: overshoot kept', plate > 100, rep.adopt);
  r.check('F9 Chair label on the board meeting caption', /^Chair:/.test(e1.cap), e1.cap);
  r.check('F4 report: chain agrees with the plate', rep.chain.includes(`AI adoption: ${plate}%`), rep.chain);
  r.check('F9 low band line in the film', /Promotion likely/.test(e2.cap), e2.cap);
  r.check('F5 low band report text is true', !/Nobody got/.test(rep.verdict) && parseInt(rep.right, 10) < 40 && parseInt(rep.right, 10) > 0, `${rep.right}: ${rep.verdict}`);
  const copied = await r.copyText();
  r.check('Copy result: no rejects says so', /rejected nothing/.test(copied) && !/0 things/.test(copied), copied);
  r.check('Copy result: first shift says sacked', /sacked/.test(copied), copied);
  const store = await r.storage();
  r.check('nothing about progress is in storage', OLD_KEYS.every((k) => !(k in store)) && !(store.settings && store.settings.skipCut), JSON.stringify(store));

  await r.b.clickSelector('#btnReportTitle'); await sleep(500);
  s = await r.st();
  r.check('same session: both Replay buttons, Skip cutscenes on', s.intro && s.ending && s.skip, JSON.stringify(s));
  // Replay ending uses this session's last shift
  await r.b.clickSelector('#btnEnding'); await sleep(500);
  const rp = await r.q(`({cap:document.querySelector('#epilogue .il-cap').textContent,num:document.querySelector('#epilogue .ep-sc.on .ep-num').textContent})`);
  r.check('Replay ending shows the real adoption', rp.num === rep.adopt && rp.cap.includes(rep.adopt), JSON.stringify(rp));
  await sleep(450); await r.b.key('Space'); await sleep(200);
  const rp2 = await r.q(`document.querySelector('#epilogue .il-cap').textContent`);
  r.check('Replay ending shows the real score', rp2 === e2.cap, rp2);
  await r.b.key('s'); await sleep(600);
  r.check('Replay ending returns to the title', (await r.st()).phase === 'title');

  // Second shift in the same session
  await r.b.clickSelector('#btnStart'); await sleep(500);
  s = await r.st();
  r.check('second shift: no opening film', s.phase === 'briefing', s.phase);
  await r.go();
  floors.length = 0;
  await r.play({ interlude: async () => { floors.push(await r.q(`document.querySelector('#interlude .il-mb').textContent`)); } });
  r.check('second shift is a repeat, with the new memos', (await r.st()).repeat && /supervise the contractors/.test(floors[0]), floors[0]);
  r.check('second shift: the skipped film leaves its story on the report', (await r.notes()).some((n) => /Next autumn/.test(n)));
  const again = await r.copyText();
  r.check('Copy result: repeat shift says the contract ended', /contract ended/.test(again) && !/sacked/.test(again), again);

  // Close and come back
  await r.b.reload(); await sleep(400);
  s = await r.st();
  r.check('reload: first shift again, no buttons, Skip cutscenes off', !s.intro && !s.ending && !s.skip, JSON.stringify(s));
  await r.b.clickSelector('#btnStart'); await sleep(500);
  r.check('reload: the opening film plays', (await r.st()).phase === 'intro');
  await r.b.key('s'); await sleep(400); await r.go();
  await r.play({ stopAt: (t) => t.phase === 'interlude' });
  r.check('reload: original cutscenes', /LetterBot/.test(await r.q(`document.querySelector('#interlude .il-mb').textContent`)) && !(await r.st()).repeat);
};

// 3/4 in rounds 4 and 5, with a miss in each (review F3), and the middle band
SCENARIOS.mid = async (r) => {
  await r.open('skipintro=1&seed=9&untimed=1'); await r.start();
  const film = {};
  await r.play({ film: 'read', reading: film, choose: (s) => {
    const c = s.child, rd = roundOf(s);
    if (rd >= 4) return c % 4 === 0 ? 'wrong' : 'right';
    return 'pack';
  } });
  const notes = await r.notes(), rep = await r.report();
  r.check('mid shift lands in the middle band', parseInt(rep.right, 10) >= 40 && parseInt(rep.right, 10) < 90, rep.right);
  for (const [good, mirror] of [["you read the small print", 'skimmed past'], ["you saw the 'not'", "skipped the 'not'"]]) {
    const g = notes.some((n) => n.includes(good)), m = notes.some((n) => n.includes(mirror));
    r.check(`F3 no contradiction: "${good}"`, m && !g, notes.slice(0, 8).join(' | '));
  }
  r.check('F9 middle band line in the film', /Lessons will be learned/.test(film.scenes[1].cap), film.scenes[1].cap);
};

// All 20 right: the top band and the Copy result's wording (review F9, low items)
SCENARIOS.perfect = async (r) => {
  await r.open('skipintro=1&seed=10&untimed=1'); await r.start();
  const film = {};
  await r.play({ film: 'read', reading: film, choose: () => 'right' });
  const rep = await r.report(), copied = await r.copyText();
  r.check('perfect shift scores 100% with 20/20 and AI 4/4', rep.right === '100%' && rep.you === '20/20' && rep.ai === '4/4', JSON.stringify(rep));
  r.check('F9 top band line in the film', /A lovely result for the AI/.test(film.scenes[1].cap), film.scenes[1].cap);
  r.check('Copy result: no weakest round at 20/20', !/weakest/.test(copied), copied);
};

SCENARIOS.oneReject = async (r) => {
  await r.open('skipintro=1&seed=11&rounds=1'); await r.start();
  await r.play({ choose: (s) => (s.child === 1 && s.rejects === 0 ? 'never' : 'pack') });
  const copied = await r.copyText();
  r.check('Copy result: 1 thing, not 1 things', /rejected 1 thing and/.test(copied), copied);
};

// A returning player: the old saved flags are cleared once
SCENARIOS.migrate = async (r) => {
  await r.open('seed=12');
  await r.q(`['played','introSeen','endingSeen','skipCutAuto'].forEach(k=>localStorage.setItem('np.'+k,'true'));localStorage.setItem('np.lastShift',JSON.stringify({pct:90,perRound:[4,4,4,4,4,4]}));localStorage.setItem('np.settings',JSON.stringify({sound:true,skipCut:true}));1`);
  await r.b.reload(); await sleep(400);
  let s = await r.st(), store = await r.storage();
  r.check('old flags cleared', OLD_KEYS.every((k) => !(k in store)), JSON.stringify(store));
  r.check('auto-switched Skip cutscenes cleared, other settings kept', !s.skip && store.settings.skipCut === false && store.settings.sound === true, JSON.stringify(store.settings));
  r.check('returning player gets a first shift', !s.intro && !s.ending, JSON.stringify(s));
  await r.b.clickSelector('#btnStart'); await sleep(500);
  r.check('returning player sees the opening film', (await r.st()).phase === 'intro');

  // A tick made by hand has no skipCutAuto beside it, so it is left alone
  await r.q(`Object.keys(localStorage).forEach(k=>localStorage.removeItem(k));localStorage.setItem('np.played','true');localStorage.setItem('np.settings',JSON.stringify({skipCut:true}));1`);
  await r.b.reload(); await sleep(400);
  s = await r.st(); store = await r.storage();
  r.check('old hand tick survives the clear-out', s.skip && store.settings.skipCut === true && !('played' in store), JSON.stringify(store));
};

// Hand-set Skip cutscenes is saved; the automatic switch-on never is
SCENARIOS.settings = async (r) => {
  await r.open('skipintro=1&seed=13&rounds=1'); await r.start();
  await r.play({});
  await r.b.clickSelector('#btnReportTitle'); await sleep(500);
  r.check('automatic switch-on shows in the box', (await r.st()).skip);
  await r.q(`document.getElementById('setSound').click();1`);
  let store = await r.storage();
  r.check('saving another setting does not save the automatic switch-on', store.settings.sound === true && !store.settings.skipCut, JSON.stringify(store.settings));
  await r.b.reload(); await sleep(400);
  r.check('automatic switch-on is gone after a reload', !(await r.st()).skip);
  await r.q(`document.getElementById('setSkipCut').click();1`);
  await r.b.reload(); await sleep(400);
  r.check('hand tick stays after a reload', (await r.st()).skip);
  await r.q(`document.getElementById('setSkipCut').click();1`);
  await r.b.reload(); await sleep(400);
  r.check('hand untick stays after a reload', !(await r.st()).skip);
  // Unticking the automatic one holds for the rest of the session
  await r.start(); await r.play({});
  await r.b.clickSelector('#btnReportTitle'); await sleep(500);
  await r.q(`document.getElementById('setSkipCut').click();1`);
  await r.start();
  const s = await r.play({ film: 'stop', stopAt: (t) => t.phase === 'report' || t.phase === 'epilogue' });
  r.check('unticked in the session: the closing film plays', s.phase === 'epilogue', s.phase);
};

// Leaving the closing film early must not count as having seen it (review low item)
SCENARIOS.filmInterrupted = async (r) => {
  await r.open('skipintro=1&seed=14&rounds=1'); await r.start();
  await r.play({ film: 'stop', stopAt: (s) => s.phase === 'epilogue' });
  await sleep(300);
  await r.pauseAnd('#btnQuit', '#btnQuitYes');
  let s = await r.st();
  r.check('resign during the film: no Replay ending, Skip cutscenes off', s.phase === 'title' && !s.ending && !s.skip, JSON.stringify(s));
  await r.start();
  s = await r.play({ film: 'stop', stopAt: (t) => t.phase === 'epilogue' || t.phase === 'report' });
  r.check('next shift still gets the closing film', s.phase === 'epilogue' && !s.repeat, JSON.stringify(s));
  await sleep(300);
  await r.pauseAnd('#btnRestart');
  await sleep(300);
  s = await r.st();
  r.check('restart during the film: still not seen', s.phase === 'briefing' && !s.skip, JSON.stringify(s));
};

// The closing film's last three scenes hold for the Next button (owner's playtest)
const scene = (r) => r.q(`(()=>{const k=document.querySelector('#epilogue .ep-sc.on'),n=document.querySelector('#epilogue .ep-next'),c=document.querySelector('#epilogue .il-cap');return k?{k:k.className.match(/ep-(e1|good|mid|bad|jobless|autumn|rehire)/)[1],next:getComputedStyle(n).visibility==='visible',label:n.textContent,aria:n.getAttribute('aria-label'),focused:document.activeElement===n,cap:c.textContent,capOp:getComputedStyle(c).opacity,hint:document.querySelector('#epilogue .il-hint .kb').textContent}:null})()`);
async function waitScene(r, k, ms = 20000) { const end = Date.now() + ms; while (Date.now() < end) { const s = await scene(r); if (s && s.k === k) return s; await sleep(60); } return scene(r); }
async function toFilm(r, params, vp) {
  await r.open(params, vp); await r.start();
  await r.play({ choose: (s) => (s.child === 1 && s.rejects === 0 ? 'never' : 'pack'), film: 'stop', stopAt: (s) => s.phase === 'epilogue' });
}
SCENARIOS.heldScenes = async (r) => {
  for (const [name, vp] of [['desktop', DESKTOP], ['phone', PHONE]]) {
    await toFilm(r, 'skipintro=1&fresh=1&seed=19&rounds=1', vp);
    const t0 = Date.now();
    let s = await scene(r);
    r.check(`${name}: no Next button on the timed scenes`, s.k === 'e1' && !s.next, JSON.stringify(s));
    s = await waitScene(r, 'jobless');
    const took = Date.now() - t0;
    r.check(`${name}: the first two scenes keep their timing`, took > 8500 && took < 12500, took);
    for (const [k, nextK] of [['jobless', 'autumn'], ['autumn', 'rehire'], ['rehire', null]]) {
      s = await waitScene(r, k);
      r.check(`${name} ${k}: Next is visible and focused`, s.k === k && s.next && s.focused, JSON.stringify(s));
      await sleep(8000);
      const later = await scene(r);
      r.check(`${name} ${k}: holds with its text still up`, later.k === k && later.cap === s.cap && later.cap && later.capOp === '1', JSON.stringify(later));
      await r.b.screenshot(join(OUT, `held-${name}-${k}.png`));
      if (nextK) {
        await r.q(`window.__ups=[];addEventListener('click',()=>__ups.push(performance.now()),true);1`);
        const b = await r.b.rect('#epilogue .ep-next');
        if (vp.mobile) { await r.b.tap(b.cx, b.cy); await sleep(90); await r.b.tap(b.cx, b.cy); }
        else { await r.b.key('Space'); await sleep(90); await r.b.key('Space'); }
        await sleep(300);
        const after = (await scene(r)) || {};
        r.check(`${name} ${k}: a double tap moves on one scene`, after.k === nextK, `${after.k}, clicks ${await r.q(`JSON.stringify(__ups)`)}`);
      }
    }
    s = await scene(r);
    r.check(`${name}: the last button leads to the report`, s.label === 'See your report' && s.aria === 'See your report', s.label);
    await r.b.clickSelector('#epilogue .ep-next'); await sleep(900);
    r.check(`${name}: the report follows`, (await r.st()).phase === 'report');
    r.check(`${name}: the story note is not repeated`, !(await r.notes()).some((n) => /Next autumn/.test(n)));
    await sleep(1200); await r.b.clickSelector('#btnReportTitle'); await sleep(500);
    // Replay ending: same holds, and the last button goes back to the title
    await r.b.clickSelector('#btnEnding'); await sleep(400);
    await waitScene(r, 'jobless'); await sleep(700);
    await r.b.key('Enter'); await waitScene(r, 'autumn', 2000); await sleep(700);
    await r.b.key('Enter'); s = await waitScene(r, 'rehire', 2000);
    r.check(`${name}: Enter advances a held scene, and Replay ending ends at the title`, s.k === 'rehire' && s.label === 'Back to title', JSON.stringify(s));
    await sleep(700); await r.b.key('Enter'); await sleep(900);
    r.check(`${name}: back at the title`, (await r.st()).phase === 'title');
  }
};
SCENARIOS.heldControls = async (r) => {
  await toFilm(r, 'skipintro=1&seed=20&rounds=1');
  await waitScene(r, 'jobless'); await sleep(700);
  // Pause holds the scene, and resuming gives the button its focus back
  await r.b.key('Escape'); await sleep(400);
  r.check('pause on a held scene', (await r.st()).phase === 'paused');
  await r.b.key('Escape'); await sleep(500);
  let s = await scene(r);
  r.check('resume: same scene, Next focused', (await r.st()).phase === 'epilogue' && s.k === 'jobless' && s.focused, JSON.stringify(s));
  await r.b.key('s'); await sleep(900);
  r.check('S skips from a held scene', (await r.st()).phase === 'report');
  r.check('skipping leaves the story on the report', (await r.notes()).some((n) => /Next autumn/.test(n)));
  // Tabbing to Skip and pressing Enter skips, rather than advancing
  await toFilm(r, 'skipintro=1&fresh=1&seed=21&rounds=1');
  await waitScene(r, 'jobless'); await sleep(700);
  await r.q(`document.querySelector('#epilogue .ep-skip').focus();1`);
  await r.b.key('Enter'); await sleep(900);
  r.check('Enter on a focused Skip skips', (await r.st()).phase === 'report');
  // Restart and resign from a held scene
  await toFilm(r, 'skipintro=1&fresh=1&seed=22&rounds=1');
  await waitScene(r, 'autumn', 13000).then(async (x) => { if (x.k !== 'autumn') { await sleep(700); await r.b.key('Space'); await waitScene(r, 'autumn', 2000); } });
  await r.pauseAnd('#btnRestart');
  s = await r.st();
  r.check('restart from a held scene', s.phase === 'briefing' && !s.toast, JSON.stringify(s));
  await r.go();
  await r.play({ film: 'stop', stopAt: (t) => t.phase === 'epilogue' });
  await waitScene(r, 'jobless'); await sleep(300);
  await r.pauseAnd('#btnQuit', '#btnQuitYes');
  s = await r.st();
  r.check('resign from a held scene', s.phase === 'title' && !s.ending, JSON.stringify(s));
};
SCENARIOS.heldReduced = async (r) => {
  await toFilm(r, 'skipintro=1&seed=23&rounds=1&reduced=1');
  const seen = [];
  for (let i = 0; i < 5; i++) {
    await sleep(6500 / (i + 1) + 700);
    const s = await scene(r); seen.push(s.k);
    r.check(`reduced scene ${i + 1}: holds with Next visible and focused`, s.next && s.focused, JSON.stringify(s));
    await r.b.key('Enter');
  }
  await sleep(900);
  r.check('reduced motion: every scene in order, then the report', seen.join() === 'e1,bad,jobless,autumn,rehire' || seen.join() === 'e1,mid,jobless,autumn,rehire', seen.join());
  r.check('reduced motion: reaches the report', (await r.st()).phase === 'report');
};

// Belt times by round (owner's playtest: rounds 4 and 5 gained 2s)
SCENARIOS.beltTimes = async (r) => {
  await r.open('skipintro=1&fresh=1&seed=24'); await r.start();
  const got = {};
  await r.play({ stopAt: (s) => {
    return s.child > 16;
  }, interlude: null, choose: () => 'pack', onPreview: async (s) => { if ([1, 5, 9, 13, 17].includes(s.child + 1) || s.child === 1) got[s.child] = await r.q('__game.state().beltTimeLeft'); } });
  r.check('belt seconds by round are 9, 8, 8.5, 10, 10', got[1] === 9 && got[4] === 8 && got[8] === 8.5 && got[12] === 10 && got[16] === 10, JSON.stringify(got));
};

// The fifth gift. Rejects everything on every child, first shifts and repeat shifts, with reduced motion and a sped-up clock.
// Rule under test: each child's five gifts hold the right one exactly once, so if it hasn't been shown, the fifth is it.
const FIFTH = { children: 0, rightFifth: 0, rightSeenWrongFifth: 0, genericFifth: 0, seen: new Set(), firstRight: 0, scripted: 0, repeat: 0, byRightAt: {} };
const FAST_CLOCK = `(()=>{const r=window.requestAnimationFrame.bind(window);let t=performance.now();window.requestAnimationFrame=f=>r(()=>{t+=100;f(t)})})()`;
const REJECT_ALL = `(()=>new Promise((done,fail)=>{
  const key=k=>document.dispatchEvent(new KeyboardEvent('keydown',{key:k,bubbles:true})),kids={},t0=Date.now();
  const tick=()=>{
    const s=__game.state();
    if(Date.now()-t0>280000)return fail(new Error('timed out at '+s.phase));
    if(s.phase==='briefing')document.getElementById('btnBriefingGo').click();
    else if(s.phase==='preview')key(' ');
    else if(s.phase==='belt'){const k=kids[s.child]=kids[s.child]||{name:s.letter,round:s.round,gifts:[]};
      if(k.gifts.length===s.rejectsThisChild)k.gifts.push({tag:s.tag,right:s.giftCorrect});
      key(s.rejectsThisChild>=4?'ArrowLeft':'ArrowRight');}
    else if(s.phase==='interlude'||s.phase==='epilogue')key('s');
    else if(s.phase==='report')return done(Object.values(kids));
    setTimeout(tick,12);
  };tick();
}))()`;
function fifthGift(seeds) {
  return async (r) => {
    await r.b.send('Page.addScriptToEvaluateOnNewDocument', { source: FAST_CLOCK });
    const generic = await (async () => { await r.open('reduced=1'); return JSON.parse(await r.q(`JSON.stringify(NP.content.generic.map(g=>g.text))`)); })();
    for (const seed of seeds) {
      await r.open(`skipintro=1&reduced=1&untimed=1&rounds=5&seed=${seed}`);
      await r.q(`document.getElementById('btnStart').click();1`);
      for (const shift of ['first', 'repeat']) {
        await sleep(600);
        const kids = await r.b.evaluate(REJECT_ALL, { timeoutMs: 300000 });
        r.check(`seed ${seed} ${shift} shift: 20 children played to five gifts`, kids.length === 20 && kids.every((k) => k.gifts.length === 5), kids.map((k) => k.gifts.length).join());
        if (shift === 'first') { const p = kids[0], at = p.gifts.findIndex((g) => g.right); FIFTH.scripted++; r.check(`seed ${seed}: the scripted first child is right on the first revision`, /teddy bear/.test(p.name) && at === 1, `${p.name} right at gift ${at + 1}`); }
        for (const k of kids) {
          const at = k.gifts.findIndex((g) => g.right), rights = k.gifts.filter((g) => g.right).length, fifth = k.gifts[4], tags = k.gifts.map((g) => g.tag);
          const who = `${k.name.slice(0, 30)} [${tags.join(' | ')}]`;
          FIFTH.children++; FIFTH.seen.add(k.name); FIFTH.byRightAt[at + 1] = (FIFTH.byRightAt[at + 1] || 0) + 1;
          if (at === 0) FIFTH.firstRight++;
          if (shift === 'repeat') FIFTH.repeat++;
          if (fifth.right) FIFTH.rightFifth++; else FIFTH.rightSeenWrongFifth++;
          if (generic.includes(fifth.tag)) FIFTH.genericFifth++;
          if (rights !== 1) r.check('the right gift appears exactly once', false, who);
          if (!k.gifts.slice(0, 4).some((g) => g.right) && !fifth.right) r.check('right gift unseen, so the fifth is right', false, who);
          if (generic.includes(fifth.tag) && !k.gifts.slice(0, 4).some((g) => g.right)) r.check('a generic fifth only after the right gift was rejected', false, who);
          if (new Set(tags).size !== 5) r.check('no gift repeats for a child', false, who);
        }
        if (shift === 'first') { await sleep(1000); await r.q(`document.getElementById('btnAgain').click();1`); }
      }
    }
  };
}
SCENARIOS.fifthGiftA = fifthGift([31, 32]);
SCENARIOS.fifthGiftB = fifthGift([33, 34]);
SCENARIOS.fifthGiftC = fifthGift([35, 36]);
SCENARIOS.fifthGiftD = fifthGift([37, 38]);

// Content: every gift has its own art, and every mix-up is really another child's gift
SCENARIOS.content = async (r) => {
  await r.open('seed=39');
  const c = JSON.parse(await r.q(`(()=>{const R=NP.content.rounds,ids=NP.icons.ids,bad=[],all=[];R.forEach(x=>x.pool.forEach(k=>{all.push(k);[k.right].concat(k.wrong).forEach(g=>{if(!ids.includes(g.icon)||(g.icon==='giftbox'))bad.push(k.id+':'+g.icon)})}));const mix=R[2].pool,mixBad=[];mix.forEach(k=>k.wrong.forEach(w=>{const o=mix.filter(m=>m.id===w.from)[0];if(!o||o.right.text!==w.text||o.right.icon!==w.icon)mixBad.push(k.id+':'+w.text)}));const same=all.filter(k=>k.wrong.some(w=>w.text===k.right.text)).map(k=>k.id);return JSON.stringify({bad,mixBad,same,n:all.length})})()`));
  r.check('no gift falls back to a plain gift box', !c.bad.length, c.bad.join());
  r.check('every mix-up matches the other child\'s right gift exactly', !c.mixBad.length, c.mixBad.join());
  r.check('no right gift is also a wrong gift for that child', !c.same.length, c.same.join());
};

// Robots build toys on the workshop floor (owner's playtest)
SCENARIOS.robotsBuild = async (r) => {
  for (const [name, vp] of [['desktop', DESKTOP], ['phone', PHONE]]) {
    for (const reduced of [0, 1]) {
      await r.open(`seed=40${reduced ? '&reduced=1' : ''}`, vp);
      for (const [label, floor] of [['bots', '{benches:8,present:2,leaving:3,bots:6,reindeer:"leaving",drones:true,caption:"x"}'], ['repeat', '{benches:8,present:0,leaving:0,bots:8,contractors:6,reindeer:"gone",drones:true,caption:"x"}']]) {
        await r.q(`(()=>{document.getElementById('screen-title').hidden=true;const el=document.getElementById('interlude');el.hidden=false;window.__il=NP.interlude.play(el,{memo:{title:'t',body:'b',footer:'f'},patch:{version:'v',fixed:['x']},issues:[],floor:${floor}},{reduced:${!!reduced}});return 1})()`);
        for (let i = 0; i < 3; i++) { await sleep(520); await r.q('__il.next();1'); }
        await sleep(reduced ? 500 : 3800);
        const g = await r.q(`(()=>{const f=[...document.querySelectorAll('#interlude .il-bot')],a=f.map(b=>getComputedStyle(b.querySelector('.dr-arm')).animationName),t=f.filter(b=>b.querySelector(':scope > rect')).length;return {n:f.length,toys:t,anim:a.filter(x=>x==='il-tap').length,conToys:0}})()`);
        const want = label === 'bots' ? 6 : 8;
        r.check(`${name} ${label}${reduced ? ' reduced' : ''}: every robot has a toy on the bench`, g.n === want && g.toys === want, JSON.stringify(g));
        r.check(`${name} ${label}${reduced ? ' reduced' : ''}: robots hammer, or hold still with reduced motion`, g.anim === (reduced ? 0 : want), JSON.stringify(g));
        await r.b.screenshot(join(OUT, `robots-${name}-${label}${reduced ? '-reduced' : ''}.png`));
        await r.q('__il.skip();document.getElementById("interlude").innerHTML="";1');
      }
    }
  }
};

// Screen-reader announcements (review F8)
SCENARIOS.live = async (r) => {
  await r.open('skipintro=1&seed=15&rounds=1');
  await r.q(`window.__live=[];new MutationObserver(()=>{const t=document.getElementById('live').textContent;if(t)__live.push(t)}).observe(document.getElementById('live'),{childList:true,characterData:true,subtree:true});1`);
  await r.start();
  await r.play({ choose: () => 'never', stopAt: (s) => s.phase === 'belt' && s.rejects >= 4 });
  await sleep(350);
  await r.b.key('r'); await sleep(250);
  await r.play({ film: 'skip' });
  const live = JSON.parse(await r.q('JSON.stringify(__live)'));
  r.check('F8 the refusal is announced', live.some((l) => /Rework budget exhausted/.test(l)), live.length);
  r.check("F8 Father Christmas's notes are announced", live.some((l) => /^Father Christmas: /.test(l)), live.length);
  const why = await r.q(`JSON.stringify([...document.querySelectorAll('#reportSleigh .rs-why')].map(e=>e.textContent))`);
  const reasons = JSON.parse(why);
  r.check('F8 the reason a gift was wrong is announced', reasons.length > 0 && reasons.every((w) => live.some((l) => l.includes(w))), why);
};

// The January scene (review F6)
SCENARIOS.pile = async (r) => {
  for (const [name, vp] of [['phone', PHONE], ['desktop', DESKTOP]]) {
    await r.open('seed=16', vp);
    for (const n of [4, 12, 30, 36]) {
      await r.q(`(()=>{const el=document.getElementById('epilogue');document.getElementById('screen-title').hidden=true;window.__cut&&__cut.skip();window.__cut=NP.epilogue.play(el,{pct:50,pileCount:${n},adoption:112,reduced:true});return 1})()`);
      await sleep(250);
      for (let i = 0; i < 8 && !(await r.q(`!!document.querySelector('#epilogue .ep-jobless.on')`)); i++) { await sleep(420); await r.q('__cut.next();1'); }
      await sleep(600);
      r.check(`F6 ${name} ${n} toys: the January scene is showing`, await r.q(`!!document.querySelector('#epilogue .ep-jobless.on')`));
      const g = await r.q(`(()=>{const k=document.querySelector('#epilogue .ep-jobless'),b=s=>{const e=k.querySelector(s).getBoundingClientRect();return {t:e.top,b:e.bottom,l:e.left,r:e.right}};return {pile:b('.ep-pile'),sign:b('.ep-sign'),floor:b('.ep-flr'),elf:b('.ep-keep .ep-br'),desk:b('.ep-desk')}})()`);
      const shot = await r.b.screenshot(join(OUT, `pile-${name}-${n}.png`)).catch(() => null);
      r.check(`F6 ${name} ${n} toys: pile stands on the floor`, g.pile.b >= g.floor.t, JSON.stringify(g));
      r.check(`F6 ${name} ${n} toys: pile stays below the sign`, g.pile.t >= g.sign.b - 1, JSON.stringify(g));
      r.check(`F6 ${name} ${n} toys: the elf stands in front of the desk`, g.elf.b >= g.desk.b - 2, JSON.stringify(g));
      void shot;
    }
  }
};

SCENARIOS.rotate = async (r) => {
  await r.open('skipintro=1&seed=17', PHONE); await r.start();
  await r.play({ stopAt: (s) => s.phase === 'belt' });
  await r.q(`window.dispatchEvent(new Event('orientationchange'));1`); await sleep(200);
  r.check('rotating a phone pauses', (await r.st()).phase === 'paused');
};

SCENARIOS.briefingLockout = async (r) => {
  await r.open('skipintro=1&seed=18');
  await r.q(`document.getElementById('btnStart').click();document.getElementById('btnBriefingGo').click();1`);
  await sleep(150);
  r.check('a key landing as the briefing opens does not dismiss it', (await r.st()).phase === 'briefing');
  await sleep(500); await r.b.key('Enter'); await sleep(200);
  r.check('the briefing dismisses after the lockout', (await r.st()).phase !== 'briefing');
};

async function runScenario(name) {
  const b = await launch({ width: 1280, height: 800 });
  const r = new Run(name, b);
  b.on('Runtime.exceptionThrown', (p) => { const d = p.exceptionDetails || {}; r.errors.push((d.exception && d.exception.description) || d.text); });
  try {
    await SCENARIOS[name](r);
    r.check('no uncaught errors', !r.errors.length, r.errors.join(' | ').slice(0, 300));
  } catch (e) {
    r.check('scenario finished', false, (e && e.stack) || String(e));
  }
  await b.close().catch(() => {});
  return r;
}

const only = opt('only', null);
const names = only ? only.split(',') : Object.keys(SCENARIOS);
const parallel = parseInt(opt('parallel', '4'), 10);
const queue = names.slice(), done = [];
await Promise.all(Array.from({ length: Math.min(parallel, names.length) }, async () => {
  while (queue.length) { const n = queue.shift(); const t = Date.now(); const r = await runScenario(n); r.ms = Date.now() - t; done.push(r); console.log(`… ${n} (${Math.round(r.ms / 1000)}s)`); }
}));
let fails = 0, total = 0;
for (const n of names) {
  const r = done.find((x) => x.name === n);
  console.log(`\n${n}`);
  for (const c of r.results) { total++; if (!c.ok) fails++; console.log(`  ${c.ok ? 'PASS' : 'FAIL'}  ${c.what}${c.ok ? '' : `\n        ${String(c.detail).slice(0, 400)}`}`); }
}
if (FIFTH.children) {
  const { seen, ...f } = FIFTH;
  console.log(`\nfifth gift: ${JSON.stringify(f)}, ${seen.size} different children`);
}
console.log(`\n${total - fails}/${total} checks passed`);
killAll();
process.exit(fails ? 1 : 0);
