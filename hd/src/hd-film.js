// HD films: each beat of a scene is a path-traced still (hd/assets/cuts), cross-faded under the original captions and timing.
// The prototype's players are kept as they are; build.mjs adds one line to each that hands its scene table to the hooks below.
// A scene falls back to its drawn version until every still it needs has been rendered.
var NP = window.NP, HD = NP.hd;
function f(n) { return Math.round(n * 10) / 10; }

// The cast, cut out of each still (hd/render/cutouts.mjs; their boxes are in HD.pups, which build.mjs reads from assets/cuts/pups.json).
// Each cut-out lies exactly over itself in the still, so at rest it cannot be seen. hd.css makes it breathe (it grows a hair
// upwards from where it sits), and HD.speak stretches the one whose caption has come up. Both only ever cover the still beneath.
HD.pupMarkup = function (name) {
  if (/^intro-7[pqr]$/.test(name)) return '';           // the close-up of the press is on screen for a second and a half: nothing breathes
  var walking = name === 'intro-8w';                    // nobody on the stairs: he is the film's own cut-out there (hd-intro.js)
  if (name === 'intro-8a0' || walking) name = 'intro-8a';   // the same frame with the corner empty: the same cast, breathing in step
  return ((HD.pups || {})[name] || []).filter(function (p) { return HD.has('cuts', name + '.' + p[0]) && !(walking && /^fc/.test(p[0])); }).map(function (p, i) {
    return '<g class="hd-pup" data-who="' + p[0] + '"><image class="hd-pup-in" href="' + HD.url('cuts/' + name + '.' + p[0]) + '" x="' + p[1] + '" y="' + p[2] + '" width="' + p[3] + '" height="' + p[4] +
      '" preserveAspectRatio="none" style="animation-delay:-' + ((i * 1.37 + name.length * 0.53) % 3.6).toFixed(2) + 's"/></g>';
  }).join('');
};
// who: the speaker on a caption ("Chair", "Member 2", "Board", "Father Christmas (exhausted)", "Day 9" for his late nights)
HD.speak = function (S, who, kit) {
  who = String(who || '');
  var m = /^member (\d)/i.exec(who);
  var sel = /^(father christmas|day )/i.test(who) ? 'fc' : /^chair/i.test(who) ? 'board0' : m ? 'board' + (m[1] - 1) : /^(all|board)/i.test(who) ? 'board' : /^(elf|you)/i.test(who) ? 'elf' : '';
  if (!sel) return;
  S.qa('.hd-pup').forEach(function (g) {
    var w = g.getAttribute('data-who');
    if (w.indexOf(sel) !== 0) return;
    kit.anim(g, [{ transform: 'scale(1,1)' }, { transform: 'scale(1,1.032)' }, { transform: 'scale(1,1)' }], { duration: 330, iterations: 3, easing: 'ease-in-out', delay: sel === 'board' ? (+w.slice(5) || 0) * 45 : 0, fill: 'none' });
  });
};

// One scene as stills. c = { W, H, P } from the player (1600 x 1000, or 900 x 1800 held upright).
// shots = [{ t: ms, file: 'cuts/intro-2a', over: '<svg markup in the still's own 1600 x 1000 units>' }, ...]
// kit = { anim } the player's own animate(), so pausing and seeking carry on working.
HD.stills = function (c, shots, kit, o) {
  o = o || {};
  var m = '';
  shots.forEach(function (s, i) {
    var url = HD.url(s.file), inner, cast = c.red ? '' : HD.pupMarkup(s.file.replace(/^cuts\//, ''));
    if (c.P) {
      // upright phone: the still is a band across the middle, over a blurred, darkened copy of itself that fills the frame
      // (four fifths of its width, centred on the still's point of interest, s.fx)
      var k = c.W / 1280, bh = 1000 * k, by = (c.H - bh) * 0.4, bx = Math.max(c.W - 1600 * k, Math.min(0, c.W / 2 - (s.fx || 800) * k));
      inner = '<image class="hd-shot-fill" href="' + url + '" x="' + f((c.W - c.H * 1.6) / 2) + '" y="0" width="' + f(c.H * 1.6) + '" height="' + c.H + '" preserveAspectRatio="none"/>' +
        '<rect class="hd-shot-dim" x="0" y="0" width="' + c.W + '" height="' + c.H + '"/>' +
        // (clipped to the photograph: a cut-out on its way in from outside the frame, like the chair's hand, must not be seen
        // hanging in the margin above it)
        '<g transform="translate(' + f(bx) + ' ' + f(by) + ') scale(' + f(k * 1000) / 1000 + ')" clip-path="url(#hd-still-clip)"><image href="' + url + '" x="0" y="0" width="1600" height="1000" preserveAspectRatio="none"/>' + cast + (s.over || '') + '</g>';
    } else {
      inner = '<image href="' + url + '" x="0" y="0" width="1600" height="1000" preserveAspectRatio="none"/>' + cast + (s.over || '');
    }
    m += '<g class="hd-shot" data-shot="' + s.file.replace(/^cuts\//, '') + '" style="opacity:' + (i ? 0 : 1) + '">' + inner + '</g>';
  });
  return {
    m: '<defs><clipPath id="hd-still-clip"><rect x="0" y="0" width="1600" height="1000"/></clipPath></defs>' +
      '<g class="in-cam hd-cam" style="transform-box:view-box;transform-origin:' + (c.W / 2) + 'px ' + (c.H * 0.45) + 'px">' + m + '</g>' + (o.fx || ''),
    run: function (S) {
      var els = [].slice.call(S.qa('.hd-shot')), cam = S.q('.hd-cam'), cur = 0, total = o.d || 8000;
      function show(i) {
        if (i === cur || !els[i]) return;
        var a = els[cur], b = els[i]; cur = i;
        b.style.opacity = 1; a.style.opacity = 0;
        var fade = shots[i].fade != null ? shots[i].fade : o.fade == null ? 260 : o.fade;      // a shot can have a fade of its own
        // The new still comes up over the old one, which stays solid beneath it until it is covered (stills only ever go
        // forwards, and a later one lies over an earlier). Fading both at once lets the dark behind show through half way.
        if (!c.red) { kit.anim(b, [{ opacity: 0 }, { opacity: 1 }], { duration: fade }); kit.anim(a, i > els.indexOf(a) ? [{ opacity: 1 }, { opacity: 1, offset: 0.85 }, { opacity: 0 }] : [{ opacity: 1 }, { opacity: 0 }], { duration: fade + 60 }); }
      }
      // a slow push-in, as a rostrum camera would do over a photograph
      S.at(0, function () { if (!c.red && !c.P) kit.anim(cam, [{ transform: 'scale(1)' }, { transform: 'scale(' + (o.push || 1.05) + ')' }], { duration: total, easing: 'ease-in-out', fill: 'forwards' }); });
      shots.forEach(function (s, i) { if (i) S.at(s.t, function () { show(i); }); });
      // whoever a caption names moves as it comes up
      if (!c.red) (o.caps || []).forEach(function (cp) { if (cp[2]) S.at(cp[0] + 140, function () { HD.speak(S, cp[2], kit); }); });
      if (o.run) o.run(S, show, kit, c);
    }
  };
};
HD.stillsReady = function (shots) { return shots.every(function (s) { return HD.has('cuts', s.file.replace(/^cuts\//, '')); }); };
// (only pictures that exist: a missing one would be a failed request)
HD.preloadShots = function (shots) { HD.preload(shots.map(function (s) { return s.file; }).filter(function (p) { return HD.has('cuts', p.slice(5)); })); };

// Walking legs. layers: the pictures of one walker, each a <g data-v>: 0 standing, 1 with the leg at screen left lifted, 2 with
// the one at screen right (hd-intro.js walker() and roll()). For n steps of `each` ms a lifted leg shows for the first half of
// the step (while the film is raising him) and the standing picture for the second, left and right in turn. The changes are
// cuts, not blends: a blend shows both legs at once. (A layer not on show is at .004, not 0, so it stays unpacked.)
function stepLegs(kit, layers, n, each) {
  if (!layers || layers.length < 3) return;
  [].forEach.call(layers, function (g) {
    var v = +g.getAttribute('data-v'), k = [];
    for (var i = 0; i < n; i++) {
      k.push({ opacity: v ? (i % 2 === v - 1 ? 1 : 0.004) : 0.004, offset: i / n, easing: 'step-end' }, { opacity: v ? 0.004 : 1, offset: (i + 0.5) / n, easing: 'step-end' });
    }
    k.push({ opacity: v ? 0.004 : 1, offset: 1 });
    kit.anim(g, k, { duration: n * each, fill: 'none' });
  });
}

// ---- intro: which stills play in each of its nine scenes, and when (ms from the start of the scene) ----
// A third number is the x an upright phone centres on (the still is wider than the phone shows).
var INTRO = [
  { shots: [[0, 'intro-1a']] },
  { shots: [[0, 'intro-2a', 765], [6600, 'intro-2b', 765], [10300, 'intro-2c', 765]] },
  // The edict. It opens on 3s, the scroll with no stamp on it yet (render/pack.mjs makes it from 3a and 3b). The stamp is a
  // cut-out: it comes down out of the top of the frame and slams, its print shows, and it is lifted off and laid on the table,
  // where 3b has it lying. Times are the drawn film's.
  { shots: [[0, 'intro-3s', 880], [3640, 'intro-3b', 880, 200], [6200, 'intro-3c', 880]], need: ['x3-stamp-cut'],
    plain: [[0, 'intro-3a', 880], [2300, 'intro-3b', 880], [6200, 'intro-3c', 880]],
    run: function (S, show, kit, c) {
      var st = S.q('.hd-stamp'), ss = S.q('.hd-stamp-sh'), mk = S.q('.hd-mark'), sh = S.q('.hd-shot');
      if (!st || c.red) return;
      // It is held over the paper (seen from above, so nearer the lens and larger, its shadow thrown down and to the right),
      // drawn back a little, and brought down hard: it shrinks onto its own shadow. It does not slide down the page.
      S.at(1700, function () {
        kit.anim(st, [{ transform: 'translate(-40px,-1000px) scale(1.5)', easing: 'cubic-bezier(.2,.8,.2,1)' }, { transform: 'translate(-12px,-30px) scale(1.3)', offset: 0.5 },
          { transform: 'translate(-14px,-38px) scale(1.34)', offset: 0.82, easing: 'cubic-bezier(.6,0,.9,.4)' }, { transform: 'translate(0px,0px) scale(1)' }], { duration: 700 });
        if (ss) kit.anim(ss, [{ transform: 'translate(120px,-700px) scale(1.5)', opacity: 0, easing: 'cubic-bezier(.2,.8,.2,1)' }, { transform: 'translate(46px,58px) scale(1.22)', opacity: 0.3, offset: 0.5 },
          { transform: 'translate(50px,64px) scale(1.25)', opacity: 0.28, offset: 0.82, easing: 'cubic-bezier(.6,0,.9,.4)' }, { transform: 'translate(0px,0px) scale(1)', opacity: 0.55 }], { duration: 700 });
      });
      S.at(2400, function () {
        kit.anim(sh, [{ transform: 'translate(3px,-2px)' }, { transform: 'translate(-3px,2px)' }, { transform: 'translate(2px,1px)' }, { transform: 'translate(-1px,-1px)' }, { transform: 'none' }], { duration: 150, fill: 'none' });
      });
      S.at(3000, function () {
        // (the print is not seen until the stamp starts to come off it: shown sooner, it stuck out from under the stamp)
        if (mk) kit.anim(mk, [{ opacity: 0 }, { opacity: 1 }], { duration: 90 });
        kit.anim(st, [{ transform: 'translate(0px,0px) rotate(0deg) scale(1)', easing: 'cubic-bezier(.4,0,.6,1)' }, { transform: 'translate(-170px,-150px) rotate(-18deg) scale(1.2)', offset: 0.45, easing: 'cubic-bezier(.4,0,.7,.6)' },
          { transform: 'translate(-520px,-6px) rotate(-72deg) scale(1)' }], { duration: 640 });
        if (ss) kit.anim(ss, [{ transform: 'translate(0px,0px) scale(1)', opacity: 0.55 }, { transform: 'translate(-120px,-60px) scale(1.15)', opacity: 0.22, offset: 0.45 }, { transform: 'translate(-420px,40px) scale(1)', opacity: 0 }], { duration: 640 });
      });
    } },
  // The studio. When the upload panel comes up its bar fills, and a copy of each pinned drawing flies down into the laptop.
  { shots: [[0, 'intro-4a'], [1900, 'intro-4b']],
    run: function (S, show, kit, c) {
      if (c.red) return;
      var bar = S.q('.hd-upb');
      if (bar) S.at(1900, function () { kit.anim(bar, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 2300, easing: 'linear' }); });
      S.qa('.hd-fly').forEach(function (n, i) {
        S.at(2100 + i * 600, function () {
          var to = 'translate(' + n.getAttribute('data-x') + 'px,' + n.getAttribute('data-y') + 'px)';
          kit.anim(n, [{ transform: 'translate(0px,0px) scale(1)', opacity: 0.95 }, { transform: to + ' scale(.16)', opacity: 0.9, offset: 0.92 }, { transform: to + ' scale(.1)', opacity: 0 }], { duration: 620, easing: 'cubic-bezier(.5,0,.75,0)' });
        });
      });
    } },
  { shots: [[0, 'intro-5a'], [3800, 'intro-5b'], [6900, 'intro-5c'], [10400, 'intro-5d']] },
  // Wheeling the button in. It opens on 6e, the room without it; he and the trolley are one cut-out, rolled in from the right
  // (the "TURN ON AI" on its plate with them), then the film goes to 6a, where they stand in the photograph.
  { shots: [[0, 'intro-6e', 880], [2330, 'intro-6a', 880, 200], [2800, 'intro-6b', 880]], need: ['x6-roll-cut'],
    plain: [[0, 'intro-6a', 880], [2400, 'intro-6b', 880]],
    run: function (S, show, kit, c) {
      var roll = S.q('.hd-roll');
      if (!roll || c.red) return;
      S.at(0, function () {
        kit.anim(roll, [{ transform: 'translateX(900px)' }, { transform: 'translateX(0px)' }], { duration: 2300, easing: 'cubic-bezier(.3,.4,.4,1)' });
        // eight steps, shorter as he slows; he ends standing level, as the photograph has him
        var bob = S.q('.hd-roll-bob');
        if (bob) kit.anim(bob, [{ transform: 'translateY(0px)' }, { transform: 'translateY(-5px)' }], { duration: 144, iterations: 16, direction: 'alternate', easing: 'ease-in-out', fill: 'none' });
        stepLegs(kit, S.qa('.hd-roll-v'), 8, 288);
      });
    } },
  // The press. Close on the button: the chair's hand comes down out of the top of the frame (a cut-out, laid over the still by
  // hd-intro.js), the dome gives and lights (7q, where the hand is in the photograph), the hand goes back up (7r), then the room.
  // (until the three close-ups have been rendered, "plain" is shown: the room alone)
  { shots: [[0, 'intro-7p', 800], [800, 'intro-7q', 800], [1120, 'intro-7r', 800], [1600, 'intro-7a', 880], [2600, 'intro-7b', 880]], fade: 120,
    plain: [[0, 'intro-7a', 880], [2300, 'intro-7b', 880]],
    run: function (S, show, kit, c) {
      if (c.red) return;
      var hin = S.q('.hd-hand-in'), hout = S.q('.hd-hand-out'), AWAY = 'translate(-300px,-564px)', TOUCH = 'translate(0px,-30px)', DOWN = 'translate(0px,0px)';
      // down fast, then the last of the way with the dome as it sinks
      if (hin) S.at(280, function () { kit.anim(hin, [{ transform: AWAY, easing: 'cubic-bezier(.5,0,.8,.5)' }, { transform: TOUCH, offset: 0.86, easing: 'linear' }, { transform: DOWN }], { duration: 600 }); });
      if (hout) S.at(1150, function () { kit.anim(hout, [{ transform: DOWN, easing: 'linear' }, { transform: TOUCH, offset: 0.14, easing: 'cubic-bezier(.4,0,.9,.5)' }, { transform: AWAY }], { duration: 430 }); });
      // the room: two flashes a second for two seconds (under three a second: SPEC 6a) and paper falling, as in the drawn film.
      // The board clap in 7a (a second photograph of them, hands apart, comes and goes: hd.css) and bounce in 7b.
      var fl = S.q('.hd-flash');
      if (fl) S.at(1700, function () { kit.anim(fl, [{ opacity: 0 }, { opacity: 0.26 }, { opacity: 0 }], { duration: 500, iterations: 4, easing: 'ease-in-out' }); });
      S.at(1700, function () {
        S.qa('.hd-cf').forEach(function (p) {
          var x = +p.getAttribute('data-x'), dx = +p.getAttribute('data-dx'), r = +p.getAttribute('data-r');
          kit.anim(p, [{ opacity: 1, transform: 'translate(' + x + 'px,-60px) rotate(0deg) scaleY(1)' },
            { opacity: 1, transform: 'translate(' + f(x + dx * 0.5) + 'px,' + f(c.H * 0.5) + 'px) rotate(' + f(r * 0.5) + 'deg) scaleY(-1)', offset: 0.5 },
            { opacity: 1, transform: 'translate(' + f(x + dx) + 'px,' + (c.H + 60) + 'px) rotate(' + r + 'deg) scaleY(1)' }], { duration: +p.getAttribute('data-d'), delay: +p.getAttribute('data-dl'), easing: 'linear' });
        });
      });
    },
    fx: function (c) {
      if (c.red) return '';
      var cols = ['var(--pole-red)', 'var(--gold)', 'var(--paper)', 'var(--pole-green)', 'var(--lamp)', 'var(--snow-shade)'], n = c.P ? 46 : 80, s = '', sd = 77;
      var rnd = function () { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
      for (var i = 0; i < n; i++) {
        var w = 10 + rnd() * 10;
        s += '<g class="hd-cf" style="opacity:0" data-x="' + f(rnd() * c.W) + '" data-dx="' + f((rnd() - 0.5) * 260) + '" data-r="' + f((rnd() - 0.5) * 1100) + '" data-d="' + Math.round(2600 + rnd() * 1800) + '" data-dl="' + Math.round(rnd() * 2600) + '">' +
          '<rect x="' + f(-w / 2) + '" y="' + f(-w * 0.3) + '" width="' + f(w) + '" height="' + f(w * 0.6) + '" rx="1.5" fill="' + cols[i % 6] + '"/><rect x="' + f(-w / 2) + '" y="' + f(-w * 0.3) + '" width="' + f(w) + '" height="' + f(w * 0.22) + '" rx="1.5" fill="#fff" opacity=".28"/></g>';
      }
      return '<g class="hd-conf">' + s + '</g><rect class="hd-flash" x="0" y="0" width="' + c.W + '" height="' + c.H + '" fill="#f4fff6" opacity="0" style="pointer-events:none"/>';
    } },
  // The cellar. It opens on 8a0, the corner under the chute still empty; the sacks drop out of the chute one at a time (cut-outs:
  // hd-intro.js sacks()), and the review queue on the monitor climbs as each lands, at the drawn film's own times. Once the last
  // is down the film goes to 8a, the photograph with the sacks in it.
  // (on an upright phone the band first sits over the chute and the sacks, then moves across to him on the stairs)
  // Then he comes down the stairs: 8w is the same frame with nobody on them, and he is a cut-out (photographed alone, with no
  // stairs in the way) walked down their slope a step at a time to where 8b has him standing, the near stringer laid back
  // over his boots.
  // (8a comes up slowly: the letters on the floor and the sacks' shadows are only in the photograph, and must not snap on)
  { shots: [[0, 'intro-8a0', 640], [3750, 'intro-8a', 960, 380], [4150, 'intro-8w', 960, 200], [7400, 'intro-8b', 940], [8200, 'intro-8c', 940]], need: ['x8-fc-cut'],
    plain: [[0, 'intro-8a0', 640], [3750, 'intro-8a', 960], [6000, 'intro-8b', 940], [8200, 'intro-8c', 940]],
    run: function (S, show, kit, c) {
      [5, 10, 15, 20, 24].forEach(function (v, i) { S.at(800 + i * 620, function () { var q = S.q('.in-q'); if (q) q.textContent = v; }); });
      var walk = S.q('.hd-walk'), bob = S.q('.hd-walk-bob');
      if (walk && !c.red) S.at(4350, function () {
        // down the stairs (most of the time), then the step out to where he stands; with four cut-outs of him (hd-intro.js
        // walker()), each comes up over the one before as he gets to where it was photographed, and the one before then goes
        var path = walk.getAttribute('data-path').split(';'), n = path.length - 1, AT = n === 3 ? [0, 0.42, 0.82, 1] : [0, 1], D = 2950;
        kit.anim(walk, path.map(function (p, i) { return { transform: 'translate(' + p.replace(',', 'px,') + 'px)', offset: AT[i], easing: !i ? 'cubic-bezier(.4,0,.8,.8)' : i === n - 1 ? 'cubic-bezier(.2,.6,.4,1)' : 'linear' }; }), { duration: D });
        [].forEach.call(S.qa('.hd-walk-im'), function (im, all) {
          var k = [], i = all % (n + 1);                 // (each layer of him, standing or mid-step, has one picture for each point on the way)
          if (i) k.push({ opacity: 0.004, offset: 0 }, { opacity: 0.004, offset: AT[i - 1] });      // (see walker(): painted, so unpacked)
          k.push({ opacity: 1, offset: AT[i] });
          if (i < n) k.push({ opacity: 1, offset: AT[i + 1] }, { opacity: 0, offset: Math.min(1, AT[i + 1] + 0.03) });
          if (k[k.length - 1].offset < 1) k.push({ opacity: k[k.length - 1].opacity, offset: 1 });
          kit.anim(im, k, { duration: D });
        });
        // one step every half second or so: up on each, as in the drawn film's trudge
        if (bob) kit.anim(bob, [{ transform: 'translateY(0px)' }, { transform: 'translateY(-9px)' }], { duration: 246, iterations: 12, direction: 'alternate', easing: 'ease-out', fill: 'none' });
        stepLegs(kit, S.qa('.hd-walk-v'), 6, 492);       // six steps: a leg up on each rise
      });
      var grp = S.q('.hd-sacks');
      if (!grp || c.red) return;
      S.qa('.hd-sk').forEach(function (n, i) {
        var im = n.firstChild, x = +im.getAttribute('x'), y = +im.getAttribute('y'), w = +im.getAttribute('width'), h = +im.getAttribute('height');
        // from inside the chute's mouth (x 200, y 320 on the still), a little to one side of where it lands
        var from = 'translate(' + f((200 - (x + w / 2)) * 0.8) + 'px,' + f(300 - (y + h)) + 'px)', t0 = 400 + i * 620;
        S.at(t0, function () {
          kit.anim(n, [{ opacity: 1, transform: from + ' scale(1,1)', easing: 'cubic-bezier(.5,0,.75,0)' }, { opacity: 1, transform: 'translate(0px,0px) scale(1,1)', offset: 0.68 },
            { opacity: 1, transform: 'translate(0px,0px) scale(1.1,.86)', offset: 0.8 }, { opacity: 1, transform: 'translate(0px,0px) scale(1,1)' }], { duration: 620 });
        });
      });
    } },
  null                                                  // the title card: HD.titleCard below
];
// The intro's last scene: the game's own logo zooming up, as drawn, but over the photographed title backdrop it then hands over to
// (the drawn card has flat pines and a painted sky, after eight photographed scenes).
HD.titleCard = function (c, kit) {
  var art = NP.art && NP.art.logo || '', m = /viewBox="0 0 ([\d.]+) ([\d.]+)"/.exec(art), lw = m ? +m[1] : 800, lh = m ? +m[2] : 128;
  var tw = c.P ? 700 : 1120, th = tw * lh / lw, cy = c.P ? 760 : 450, plate = c.P && HD.has('plates', 'title-tall') ? 'plates/title-tall' : 'plates/title';
  return {
    m: '<image href="' + HD.url(plate) + '" x="0" y="0" width="' + c.W + '" height="' + c.H + '" preserveAspectRatio="xMidYMid slice"/>' +
      '<defs><radialGradient id="hd-tc-sh"><stop offset="0" stop-color="#050818" stop-opacity=".7"/><stop offset="1" stop-color="#050818" stop-opacity="0"/></radialGradient></defs>' +
      '<ellipse cx="' + c.W / 2 + '" cy="' + cy + '" rx="' + f(tw * 0.62) + '" ry="' + f(th * 1.5) + '" fill="url(#hd-tc-sh)"/>' +
      (c.red ? '' : HD.snow(c.W, c.H, c.P ? 46 : 80)) +
      '<g class="in-logo hd-tc-logo" style="transform-box:fill-box;transform-origin:50% 50%"><g transform="translate(' + f(c.W / 2 - tw / 2) + ' ' + f(cy - th / 2) + ')">' +
      art.replace('<svg ', '<svg x="0" y="0" width="' + tw + '" height="' + f(th) + '" ') + '</g></g>' +
      '<rect class="in-out" x="0" y="0" width="' + c.W + '" height="' + c.H + '" fill="var(--night-900)" opacity="0"/>',
    run: function (S) {
      S.at(0, function () { kit.anim(S.q('.hd-tc-logo'), [{ transform: 'scale(.55)', opacity: 0 }, { transform: 'scale(1.03)', opacity: 1, offset: 0.25 }, { transform: 'scale(1.1)', opacity: 1 }], { duration: 3000, easing: 'cubic-bezier(.2,.8,.2,1)' }); });
      S.at(2450, function () { kit.anim(S.q('.in-out'), [{ opacity: 0 }, { opacity: 1 }], { duration: 520, easing: 'ease-in' }); });
    }
  };
};
// Falling snow, for scenes out of doors: soft flakes at three depths, each drifting down for ever (hd.css hd-fall).
HD.snow = function (W, H, n) {
  var s = '<defs><radialGradient id="hd-flk"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".5" stop-color="#fff" stop-opacity=".5"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs><g class="hd-snow">', sd = 23;
  var rnd = function () { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
  for (var i = 0; i < n; i++) {
    var near = rnd(), r = 2 + near * 5, t = 11 - near * 6 + rnd() * 2;
    s += '<circle class="hd-flake" cx="' + f(rnd() * W) + '" cy="0" r="' + f(r) + '" fill="url(#hd-flk)" opacity="' + f(0.35 + near * 0.55) + '" style="--t:' + f(t) + 's;--d:-' + f(rnd() * t) + 's;--dx:' + f((rnd() - 0.4) * 160) + 'px;--dy:' + (H + 80) + 'px"/>';
  }
  return s + '</g>';
};
// the first photograph of each film is fetched while the title is up, so the film does not open on a dark screen
HD.preload(['cuts/intro-1a', 'cuts/intro-2a', 'cuts/epi-1'].filter(function (p) { return HD.has('cuts', p.slice(5)); }));
// The caption cards under the opening film (called from the film's own cap(), see build.mjs HOOKS). The card that is going fades
// quickly and the one that is coming waits for it, so two cards are never read through each other; and a card comes up to its
// size and stops there (the day cards in the office used to overshoot and settle back).
HD.caption = function (caps, c, capEl, anim) {
  var old = [].slice.call(caps.querySelectorAll('.in-cap'));
  old.forEach(function (o) {
    var a = anim(o, [{ opacity: getComputedStyle(o).opacity }, { opacity: 0 }], { duration: 110, fill: 'forwards' });
    if (a) a.onfinish = function () { if (o.parentNode) o.parentNode.removeChild(o); }; else caps.removeChild(o);
  });
  if (!c || c[1] === 'clear') return;
  var d = capEl(c), flash = c[1] === 'flash';
  caps.appendChild(d);
  anim(d, flash ? [{ opacity: 0, transform: 'rotate(.8deg) scale(.93)' }, { opacity: 1, transform: 'rotate(.8deg) scale(1)' }] : [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }],
    { duration: 220, delay: old.length ? 100 : 0, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' });
};
HD.introOver = HD.introOver || {};                     // lettering over a still, by still name (see hd-intro.js)
HD.introScenes = function (SC, kit) {
  // The cut-outs a scene moves about (the stamp, the trolley, the chair's hand, the sacks, him on the stairs) are wanted the
  // moment it starts, so each is fetched as the scene two before it is built. (All forty at the start of the film was too
  // much: a player who skips the film on a phone was kept waiting for the first gift while they unpacked.)
  // (EXTRA: by the scene, counted from 0, that needs them. Each lot is fetched during an earlier, quiet scene, never two lots
  // at once and never as its own scene starts: FETCH says during which. The cellar's is the big one, some thirty pictures, and
  // goes during the long office scene. A scene reached out of turn, by a test seeking to it, fetches its own as it is built.)
  var EXTRA = { 2: /^x3-stamp-cut\./, 5: /^x6-roll-(s\d-)?cut\./, 6: /^(intro-7q\.|x7-(clap|cheer)$)/, 7: /^(x8-solo\d\.|x8-(fc|w\d|rail|bin)-cut\.|x8-(a|w\d)-s\d-cut\.)/ };
  var FETCH = { 0: [2], 2: [5], 3: [6], 4: [7] };
  var extra = function (i) { (FETCH[i] || []).concat([i]).forEach(function (j) { var re = EXTRA[j]; if (re) { EXTRA[j] = null; HD.preload((HD.cuts || []).filter(function (n) { return re.test(n); }).map(function (n) { return 'cuts/' + n; })); } }); };
  SC.forEach(function (def, i) {
    var spec = INTRO[i], drawn = def.b;
    if (!spec) {
      // the last scene, the title card
      if (i === SC.length - 1) def.b = function (c) { return HD.has('plates', 'title') && NP.art && NP.art.logo ? HD.titleCard(c, kit) : drawn(c); };
      return;
    }
    def.b = function (c) {
      // a row is [ms, still, the x an upright phone centres on, a fade of its own in ms]
      var list = function (rows) { return rows.map(function (s) { return { t: s[0], file: 'cuts/' + s[1], fx: s[2], fade: s[3], over: HD.introOver[s[1]] ? HD.introOver[s[1]](c) : '' }; }); };
      // "need": cut-outs the full version cannot do without (their still is not one the film shows)
      var shots = list(spec.shots), full = HD.stillsReady(shots) && (spec.need || []).every(function (n) { return ((HD.pups || {})[n] || []).length; });
      if (!full && spec.plain) shots = list(spec.plain);
      if (!HD.stillsReady(shots)) return drawn(c);
      extra(i);
      if (INTRO[i + 1]) HD.preloadShots(INTRO[i + 1].shots.map(function (s) { return { file: 'cuts/' + s[1] }; }));
      else HD.preload(['plates/title', 'plates/title-tall'].filter(function (p) { return HD.has('plates', p.slice(7)); }));
      // (run always: each looks for the pieces it moves and does nothing where the plain version has none)
      return HD.stills(c, shots, kit, { d: def.d, fade: spec.fade, push: spec.push, run: spec.run, caps: def.caps, fx: spec.fx ? spec.fx(c) : '' });
    };
  });
};
