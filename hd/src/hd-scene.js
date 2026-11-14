// HD belt bay and desk bay. Same contract as prototype/src/scene.js (mountBelt / mountDesk and everything they return);
// the pictures are path-traced plates and sprites, the moving and lettered parts are drawn over them in the same units.
// Positions below come from the scene files in hd/render/scenes (belt.glsl, desk.glsl): keep them in step.
var NP = window.NP, HD = NP.hd;
NP.scene = NP.scene || {};
var drawnBelt = NP.scene.mountBelt, drawnDesk = NP.scene.mountDesk;
var NS = 'http://www.w3.org/2000/svg';

function reduced() { return document.documentElement.classList.contains('reduced'); }
function f(n) { return Math.round(n * 10) / 10; }
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function q(root, sel) { return root.querySelector(sel); }
function qa(root, sel) { return Array.prototype.slice.call(root.querySelectorAll(sel)); }
function anim(el, frames, opts) { return el && el.animate ? el.animate(frames, opts) : null; }
function stop(a) { if (a) try { a.cancel(); } catch (e) {} return null; }
function tf(el, v) { if (el) el.style.transform = v || ''; }
function img(file, x, y, w, h, cls) { return '<image' + (cls ? ' class="' + cls + '"' : '') + ' href="' + HD.url(file) + '" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" preserveAspectRatio="none"/>'; }
function rr(x, y, w, h, r) {
  return 'M' + (x + r) + ' ' + y + 'H' + (x + w - r) + 'A' + r + ' ' + r + ' 0 0 1 ' + (x + w) + ' ' + (y + r) + 'V' + (y + h - r) + 'A' + r + ' ' + r + ' 0 0 1 ' + (x + w - r) + ' ' + (y + h) +
    'H' + (x + r) + 'A' + r + ' ' + r + ' 0 0 1 ' + x + ' ' + (y + h - r) + 'V' + (y + r) + 'A' + r + ' ' + r + ' 0 0 1 ' + (x + r) + ' ' + y + 'Z';
}
function measure(t, str) { t.textContent = str; var w = 0; try { w = t.getComputedTextLength(); } catch (e) {} return w || str.length * parseFloat(t.getAttribute('font-size')) * 0.55; }
function wrapWords(words, fits) {
  var lines = [], cur = '';
  words.forEach(function (w) { var t = cur ? cur + ' ' + w : w; if (!cur || fits(t)) cur = t; else { lines.push(cur); cur = w; } });
  if (cur) lines.push(cur);
  return lines;
}
var seed = 7;
function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
// the drawn scene's gradients and text classes (sc-*) are still used for the bubble, notes and lamps
function defs() { try { if (NP.scene.fcArt) NP.scene.fcArt({}); } catch (e) {} }
function mount(el, vb, par, cls, inner) {
  defs();
  el.innerHTML = '<svg xmlns="' + NS + '" class="sc-svg hd-svg ' + cls + '" viewBox="' + vb + '" preserveAspectRatio="' + par + '" aria-hidden="true" focusable="false">' + inner + '</svg>';
  return el.firstChild;
}

/* =====================================================================
   BELT BAY  (lane 800 x 300, drawn from y = -170)
   ===================================================================== */
var SCREEN = { x: 640, y: 153 };          // centre of the AI's screen glass
var LEDS = [609, 629.6, 650.2, 670.9], LED_Y = 99.5;
var PORT = { x: 39.7, y: 264.6 };         // status lamp on the packing cabinet
var BELT_TOP = 206.3, BELT_H = 14.8;      // the visible belt surface

function beltMarkup() {
  var s = img('plates/belt', 0, -170, 800, 470);
  // lettering painted on the enamel plates
  s += '<text class="sc-txt hd-enamel" x="84" y="71" font-size="26" text-anchor="middle" letter-spacing="2">PACKING</text>';
  s += '<text class="sc-txt hd-enamel" x="655" y="279" font-size="25" text-anchor="middle" letter-spacing="1.2">REJECTS</text>' +
    '<path class="hd-enamel" d="M713 266.5h13v-6l12 9.5-12 9.5v-6h-13z"/>';
  s += '<text class="sc-txt hd-stencil" x="640" y="90" font-size="24" text-anchor="middle" letter-spacing="5">AI</text>';
  // the board's slide, taped up as a poster
  s += '<g class="hd-poster" transform="rotate(-3.4 166 -19)"><text class="sc-txt" x="141" y="-8" font-size="27" style="font-weight:900">AI</text>' +
    '<path d="M172 -5C185 -5 190 -17 191 -27" fill="none" stroke-width="2.6" stroke-linecap="round" class="hd-poster-line"/><path d="M191 -38l5.2 10.5h-10.4z" class="hd-poster-tip"/></g>';
  // belt surface: seams and scuffs that travel with it
  var tr = '';
  for (var tx = 52; tx < 872; tx += 24) {
    tr += '<rect x="' + tx + '" y="' + BELT_TOP + '" width="2.2" height="' + BELT_H + '" class="hd-seam"/><rect x="' + (tx + 2.2) + '" y="' + BELT_TOP + '" width="1.2" height="' + BELT_H + '" class="hd-seam-lit"/>';
    if ((tx / 24) % 3 === 0) tr += '<rect x="' + (tx + 8) + '" y="' + (BELT_TOP + 3 + (tx % 7)) + '" width="9" height="1.1" rx=".5" class="hd-scuff"/>';
  }
  s += '<clipPath id="hd-beltclip"><rect x="97" y="' + BELT_TOP + '" width="703" height="' + BELT_H + '"/></clipPath><g clip-path="url(#hd-beltclip)"><g class="sc-treads">' + tr + '</g></g>';
  // packing cabinet: the glow in its window and the status lamp
  s += '<g class="sc-chglow sc-off hd-add"><ellipse cx="' + PORT.x + '" cy="193" rx="52" ry="68" fill="url(#sc-rgood)" class="sc-chg-good"/><ellipse cx="' + PORT.x + '" cy="193" rx="52" ry="68" fill="url(#sc-rbad)" class="sc-chg-bad"/></g>';
  s += '<g class="sc-lamp sc-rig sc-off" style="transform-origin:' + PORT.x + 'px ' + PORT.y + 'px">' +
    '<circle cx="' + PORT.x + '" cy="' + PORT.y + '" r="34" fill="url(#sc-glow)" opacity=".5" class="hd-add"/>' +
    '<g class="sc-lamp-good"><circle cx="' + PORT.x + '" cy="' + PORT.y + '" r="11.6" fill="var(--good)"/><path d="M' + (PORT.x - 6) + ' ' + (PORT.y + 0.6) + 'l3.9 4 7.6 -8.6" fill="none" stroke="var(--snow)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></g>' +
    '<g class="sc-lamp-bad"><circle cx="' + PORT.x + '" cy="' + PORT.y + '" r="11.6" fill="var(--bad)"/><path d="M' + (PORT.x - 4.6) + ' ' + (PORT.y - 4.6) + 'l9.2 9.2m0 -9.2l-9.2 9.2" fill="none" stroke="var(--snow)" stroke-width="3" stroke-linecap="round"/></g>' +
    '<ellipse cx="' + (PORT.x - 3.5) + '" cy="' + (PORT.y - 4.5) + '" rx="4.6" ry="2.6" fill="var(--snow)" opacity=".4"/></g>';
  // the AI: indicator lamps and the face on its screen
  var leds = '';
  LEDS.forEach(function (x, i) { leds += '<g class="hd-led hd-add' + (i === 1 ? ' hd-led-on' : '') + '"><circle cx="' + x + '" cy="' + LED_Y + '" r="9" fill="url(#sc-glow)"/><circle cx="' + x + '" cy="' + LED_Y + '" r="2.6" fill="var(--lamp)"/></g>'; });
  s += leds;
  s += '<g class="hd-face hd-add" transform="translate(' + (SCREEN.x - 660 * 0.9) + ' ' + (SCREEN.y - 138 * 0.9) + ') scale(.9)">' +
    '<ellipse cx="660" cy="138" rx="46" ry="38" fill="url(#sc-glow)" opacity=".16" class="hd-breathe"/>' +
    // (while it works a bar of light sweeps down its screen: hopperChurn)
    '<clipPath id="hd-glass"><ellipse cx="660" cy="138" rx="40" ry="31"/></clipPath><g clip-path="url(#hd-glass)"><rect class="hd-scan" x="616" y="100" width="88" height="9" rx="4" fill="var(--lamp)" opacity="0"/></g>' +
    '<g class="sc-face sc-face-smug sc-fade"><path d="M638 129A8 8 0 0 0 654 129Z"/><path d="M666 129A8 8 0 0 0 682 129Z"/>' +
    '<path d="M637 126L655 128M665 128L683 125" class="hd-face-line" stroke-width="2.4"/><path d="M647 147Q662 153 676 143" class="hd-face-line" stroke-width="3.4"/></g>' +
    '<g class="sc-face sc-face-talk sc-fade sc-off"><path d="M638 132Q646 121 654 132M666 132Q674 121 682 132" class="hd-face-line" stroke-width="3.4"/><path class="hd-mouth" d="M647 142Q660 158 674 142Z" style="transform-box:fill-box;transform-origin:50% 0"/></g>' +
    '<g class="sc-face sc-face-think sc-fade sc-off"><circle cx="645" cy="137" r="4.5" class="sc-dot"/><circle cx="660" cy="137" r="4.5" class="sc-dot"/><circle cx="675" cy="137" r="4.5" class="sc-dot"/></g></g>';
  // barrier at the right end, with its notice over the REJECTS plate
  var b = HD.has('props', 'barrier') ? img('props/barrier', 720, 80, 80, 150) :
    '<rect x="744" y="100" width="8" height="116" rx="3" fill="url(#sc-metald)"/><rect x="790" y="100" width="8" height="116" rx="3" fill="url(#sc-metald)"/><path d="' + rr(746, 112, 50, 92, 7) + '" fill="url(#sc-haz)"/>';
  b += '<circle cx="771" cy="92" r="20" fill="url(#sc-glow)" opacity=".75" class="hd-add hd-breathe"/>';
  b += '<g class="hd-notice"><path d="' + rr(466, 226, 330, 72, 4) + '" class="hd-notice-card"/><rect x="466" y="226" width="330" height="8" class="hd-notice-band"/>' +
    '<text class="sc-txt" x="631" y="258" font-size="26" text-anchor="middle" letter-spacing="1" style="font-weight:900">FINAL.</text>' +
    '<text class="sc-txt" x="631" y="288" font-size="25" text-anchor="middle" style="font-weight:800">NO FURTHER REWORK</text></g>';
  s += '<g class="sc-barrier sc-rig sc-off" style="transform-origin:630px 100px">' + b + '</g>';
  // speech bubble (filled on demand)
  s += '<g class="sc-bubble sc-rig sc-off" style="transform-origin:648px 114px"><path class="sc-bshape hd-bubble"/><text class="sc-txt sc-btxt" fill="var(--ink)" text-anchor="middle" style="font-weight:650"></text></g>';
  // the elf's mittens, up from the bottom edge
  var one = HD.has('props', 'mitten');
  function mitt(tx, ty, sc, flip) {
    return '<g transform="translate(' + tx + ' ' + ty + ') scale(' + (flip ? -sc : sc) + ' ' + sc + ')">' +
      (one ? img('props/mitten', -50, -112, 100, 260) : '<rect x="-31" y="-90" width="62" height="230" rx="26" fill="url(#sc-mred)"/>') + '</g>';
  }
  s += '<g class="sc-mpos" transform="translate(430 0)"><g class="sc-mitts sc-rig" style="transform-origin:0px 300px;transform:translateY(210px)"><g class="sc-mflip">' +
    mitt(-46, 236, 0.9, true) + mitt(42, 252, 1, false) + '</g></g></g>';
  return s;
}

NP.scene.mountBelt = function (el) {
  if (!HD.has('plates', 'belt')) return drawnBelt(el);
  var svg = mount(el, '0 -170 800 470', 'xMidYMax slice', 'sc-belt', beltMarkup());
  var treads = q(svg, '.sc-treads'), bub = q(svg, '.sc-bubble'), bshape = q(svg, '.sc-bshape'), btxt = q(svg, '.sc-btxt');
  var lamp = q(svg, '.sc-lamp'), chg = q(svg, '.sc-chglow'), bar = q(svg, '.sc-barrier'), faceG = q(svg, '.hd-face'), leds = qa(svg, '.hd-led');
  var mpos = q(svg, '.sc-mpos'), mitts = q(svg, '.sc-mitts'), mflip = q(svg, '.sc-mflip');
  var speed = 0, off = 0, raf = 0, last = 0, talking = false, faceT = 0, flashT = 0, mitT = 0, churnA = [], bubA = null, bubRaf = 0, mouthA = null, mouth = q(svg, '.hd-mouth'), scan = q(svg, '.hd-scan');

  function face(kind) { qa(svg, '.sc-face').forEach(function (n) { n.classList.toggle('sc-off', !n.classList.contains('sc-face-' + kind)); }); }
  // while it talks its mouth moves, in an uneven rhythm like speech
  function speak(on) {
    stop(mouthA); mouthA = null;
    if (!on || reduced()) return;
    mouthA = anim(mouth, [1, 0.35, 0.9, 0.5, 1, 0.3, 0.75, 0.45, 1].map(function (v) { return { transform: 'scaleY(' + v + ')', easing: 'ease-in-out' }; }), { duration: 1500, iterations: Infinity });
  }
  function draw() { treads.setAttribute('transform', 'translate(' + f(-(off % 72)) + ' 0)'); }
  function frame(t) {
    raf = 0;
    if (!speed || reduced()) { last = 0; return; }
    var dt = last ? Math.min(0.1, (t - last) / 1000) : 0;
    last = t; off += speed * dt; draw();
    raf = requestAnimationFrame(frame);
  }
  function run() { if (!raf && speed && !reduced()) { last = 0; raf = requestAnimationFrame(frame); } }

  var api = {
    svg: svg,
    setSpeed: function (u) { speed = Math.max(0, +u || 0); run(); },
    hopperTalk: function (text) {
      if (text == null || text === '') {
        var was = talking && !bub.classList.contains('sc-off') && !bubRaf;
        talking = false; face('smug'); speak(false);
        bub.classList.add('sc-off'); bub.style.opacity = '';
        cancelAnimationFrame(bubRaf); bubRaf = 0;
        // it goes quickly (the class hides it; while this runs it is still seen): the next gift drops from the hatch
        // behind it straight away, and must not be seen falling through a bubble that is still half there
        if (was && !reduced()) bubA = anim(bub, [{ opacity: 1 }, { opacity: 0 }], { duration: 80, easing: 'ease-out' });
        return;
      }
      var fresh = !talking || bub.classList.contains('sc-off') || !!bubRaf;
      stop(bubA); bubA = null; cancelAnimationFrame(bubRaf); bubRaf = 0;
      talking = true; face('talk'); speak(true);
      var words = String(text).split(/\s+/), sizes = [32, 30, 28, 26], fs = 32, lines, maxW;
      var fits = function (t) { return measure(btxt, t) <= maxW; };
      // first try to stay right of the PACKING sign (x >= 164), then use the full width
      [582, 736].some(function (mw) {
        maxW = mw;
        for (var i = 0; i < (mw < 600 ? 2 : sizes.length); i++) {
          fs = sizes[i]; btxt.setAttribute('font-size', fs);
          lines = wrapWords(words, fits);
          if (lines.length <= 2) return true;
        }
      });
      if (lines.length > 2) {
        var rest = lines.slice(1).join(' ').split(' ');
        while (rest.length > 1 && measure(btxt, rest.join(' ') + '…') > maxW) rest.pop();
        lines = [lines[0], rest.join(' ') + '…'];
      } else if (lines.length === 2) {
        for (var w = maxW - 16; w > 200; w -= 16) {
          var tryL = wrapWords(words, function (t) { return measure(btxt, t) <= w; });
          if (tryL.length > 2) break;
          lines = tryL;
        }
      }
      var tw = 0;
      lines.forEach(function (l) { tw = Math.max(tw, measure(btxt, l)); });
      var lh = fs * 1.12, padX = 22, padY = 10, bw = Math.ceil(tw + padX * 2), bh = lines.length * lh + padY * 2;
      var bx = clamp(600 - bw / 2, bw <= 626 ? 164 : 10, 790 - bw), by = 100 - bh, cx = bx + bw / 2;
      var tx = clamp(646, bx + 30, bx + bw - 30);
      bshape.setAttribute('d', rr(f(bx), f(by), bw, f(bh), 18) + 'M' + (tx - 14) + ' 99L648 113L' + (tx + 12) + ' 99Z');
      btxt.textContent = '';
      lines.forEach(function (l, j) {
        var sp = document.createElementNS(NS, 'tspan');
        sp.setAttribute('x', f(cx)); sp.setAttribute('y', f(by + padY + fs * 0.84 + j * lh)); sp.textContent = l;
        btxt.appendChild(sp);
      });
      bub.classList.remove('sc-off');
      // A new line rises into place. Laying the words out takes the page a moment, and a rise started at once loses its first
      // frames to that: so the bubble waits, unseen, for the page's next two frames and then rises in full.
      // A change of words in a bubble that is already up: the bubble stays, only the words come in again.
      if (reduced()) anim(bub, [{ opacity: 0 }, { opacity: 1 }], { duration: 120 });
      else if (fresh) {
        bub.style.opacity = 0;
        bubRaf = requestAnimationFrame(function () { bubRaf = requestAnimationFrame(function () {
          bubRaf = 0; bub.style.opacity = '';
          bubA = anim(bub, [{ opacity: 0, transform: 'translateY(8px) scale(.98)' }, { opacity: 1, transform: 'translateY(0) scale(1)' }], { duration: 300, easing: 'cubic-bezier(.3,.6,.3,1)' });
        }); });
      } else anim(btxt, [{ opacity: 0.15 }, { opacity: 1 }], { duration: 200, easing: 'ease-out' });
    },
    hopperChurn: function () {
      face('think');
      churnA.forEach(stop); churnA = [];
      qa(svg, '.sc-dot').forEach(function (d, i) { churnA.push(anim(d, [{ opacity: 0.25 }, { opacity: 1 }, { opacity: 0.25 }], { duration: 420, delay: i * 120, iterations: 2, easing: 'ease-in-out' })); });
      // the indicator lamps chase while it works
      leds.forEach(function (d, i) { churnA.push(anim(d, [{ opacity: 0 }, { opacity: 1, offset: 0.4 }, { opacity: 0 }], { duration: 360, delay: i * 90, iterations: 2, easing: 'ease-in-out' })); });
      // and the machine is seen to be at it: a bar of light sweeps down the screen twice, and the glow behind it swells
      if (!reduced()) {
        churnA.push(anim(scan, [{ transform: 'translateY(0)', opacity: 0 }, { opacity: 0.3, offset: 0.2 }, { opacity: 0.3, offset: 0.8 }, { transform: 'translateY(68px)', opacity: 0 }], { duration: 340, iterations: 2, easing: 'linear' }));
        churnA.push(anim(q(svg, '.hd-face .hd-breathe'), [{ opacity: 0.16 }, { opacity: 0.42 }, { opacity: 0.16 }], { duration: 340, iterations: 2, easing: 'ease-in-out' }));
      }
      clearTimeout(faceT);
      faceT = setTimeout(function () { face(talking ? 'talk' : 'smug'); }, 680);
    },
    chuteFlash: function (kind) {
      var good = kind === 'good';
      q(svg, '.sc-lamp-good').style.display = good ? '' : 'none';
      q(svg, '.sc-lamp-bad').style.display = good ? 'none' : '';
      q(svg, '.sc-chg-good').style.display = good ? '' : 'none';
      q(svg, '.sc-chg-bad').style.display = good ? 'none' : '';
      clearTimeout(flashT);
      lamp.classList.remove('sc-off'); chg.classList.remove('sc-off');
      anim(chg, [{ opacity: 0 }, { opacity: 0.9, offset: 0.15 }, { opacity: 0.6, offset: 0.6 }, { opacity: 0 }], { duration: 1100 });
      // (the lamp comes on: it swells to its size and stops there, no bounce)
      if (!reduced()) anim(lamp, [{ transform: 'scale(.7)', opacity: 0.3 }, { transform: 'scale(1)', opacity: 1 }], { duration: 220, easing: 'cubic-bezier(.2,.8,.2,1)' });
      chg.classList.add('sc-off');
      flashT = setTimeout(function () { lamp.classList.add('sc-off'); }, 1300);
    },
    barrier: function (on) {
      var was = !bar.classList.contains('sc-off');
      bar.classList.toggle('sc-off', !on);
      if (on && !was) {
        if (reduced()) anim(bar, [{ opacity: 0 }, { opacity: 1 }], { duration: 120 });
        else anim(bar, [{ opacity: 0, transform: 'translateY(-30px)' }, { opacity: 1, transform: 'translateY(4px)', offset: 0.7 }, { opacity: 1, transform: 'translateY(0)' }], { duration: 300, easing: 'cubic-bezier(.2,.8,.2,1)' });
      }
    },
    // dir: 'left'|'right'|'idle'. Optional atX = gift centre x in viewBox units (default 380).
    mittens: function (dir, atX) {
      clearTimeout(mitT);
      if (dir !== 'left' && dir !== 'right') { tf(mitts, 'translateY(210px)'); return; }
      var x = atX == null ? 380 : +atX, L = dir === 'left';
      mpos.setAttribute('transform', 'translate(' + f(clamp(L ? x + 92 : x - 92, 90, 720)) + ' 0)');
      mflip.setAttribute('transform', L ? '' : 'scale(-1 1)');
      if (reduced()) { tf(mitts, 'translateY(0)'); }
      else {
        tf(mitts, L ? 'translate(18px,40px) rotate(6deg)' : 'translate(-18px,40px) rotate(-6deg)');
        mitts.getBoundingClientRect();
        tf(mitts, L ? 'translate(-26px,0) rotate(-12deg)' : 'translate(26px,0) rotate(12deg)');
      }
      mitT = setTimeout(function () { tf(mitts, 'translateY(210px)'); }, 700);
    }
  };
  draw();
  return api;
};

/* =====================================================================
   DESK BAY  (panel 400 x 300; the plate carries 100 units above it and 80 each side)
   ===================================================================== */
var LID = { x: 296, y: 146, w: 100, h: 69 };   // laptop lid (back towards us): the newest sticky note goes here
var FCBOX = { x: 160, y: 20, w: 244, h: 212 };  // the cropped frames of Father Christmas (shots.mjs FC_CROP / 3)
var HELD = { x: 161, y: 72, size: 48 };         // the gift he holds up when puzzled
var MUGS = [[204, 228, 'white'], [187, 220, 'green'], [222, 229, 'yellow'], [205, 219, 'blue'], [188, 229, 'red'], [222, 212, 'white', 1]];
var POSES = { idle: 1, look: 1, scratch: 1, type: 1, puzzled: 1, relief: 1 };

// One photographed frame of him. Every frame of a stage sits in the same box, one over another, and only their opacity changes:
// swapping the picture inside a single element can show a blank frame while the new one decodes.
function fcFrame(name, stage, on) {
  return '<image class="hd-fc" data-f="' + name + '-' + stage + '" href="' + HD.url('fc/' + name + '-' + stage) + '" x="' + FCBOX.x + '" y="' + FCBOX.y + '" width="' + FCBOX.w + '" height="' + FCBOX.h +
    '" preserveAspectRatio="none" decoding="sync" style="opacity:' + (on ? 1 : 0) + '"/>';
}
// The moves that have in-between frames (hd/render/shots.mjs FC_MOVES): fc/<from>_<to>_<1..3>-<stage>. The way back plays them in reverse.
var FC_STEP = 55;                               // ms from one frame of a move to the next; each is blended into the one after

function mugMarkup(m, i) {
  var file = 'props/mug-' + m[2], x = m[0], y = m[1];
  var art = HD.has('props', 'mug-' + m[2]) ? img(file, x - 14, y - 23.5, 28, 28) :
    '<rect x="' + (x - 7.5) + '" y="' + (y - 17) + '" width="15" height="17" rx="3" fill="var(--paper)"/><ellipse cx="' + x + '" cy="' + (y - 17) + '" rx="7.5" ry="2.1" fill="var(--wood-dark)"/>';
  return '<g class="sc-mug sc-rig sc-off" data-i="' + i + '" style="transform-origin:' + x + 'px ' + y + 'px">' + art + '</g>';
}
function deskMarkup() {
  var s = img('plates/desk', -80, -100, 560, 400);
  s += '<text class="sc-script hd-ink" x="53" y="61" font-size="15.5" text-anchor="middle" letter-spacing="1" transform="rotate(3 53 55)" style="font-weight:700">REJECTS</text>';
  s += '<ellipse class="sc-pileao" cx="100" cy="293" rx="40" ry="9" fill="url(#sc-ao)" opacity="0"/>';
  s += '<g class="hd-fcs">' + fcFrame('idle', 0, 1) + '</g>';
  s += '<ellipse class="sc-sglow2 hd-add" cx="' + (LID.x + 50) + '" cy="' + (LID.y - 2) + '" rx="58" ry="10" fill="url(#sc-glowc)" opacity=".25"/>';
  s += MUGS.map(function (m, i) { return [m[3] ? 999 : m[1], mugMarkup(m, i)]; }).sort(function (a, b) { return a[0] - b[0]; }).map(function (a) { return a[1]; }).join('');
  // warm the sticky-note faces at mount so the first note measures true
  s += '<text x="2" y="298" class="sc-script" font-size="4" fill-opacity="0">why ?</text><text x="2" y="298" class="sc-txt" font-size="4" fill-opacity="0">why ?</text>';
  s += '<g class="sc-notes"></g><g class="sc-pile"></g>';
  // the automatic round (hd-auto.js, hd.css): nobody is at the desk; his chair is taped off
  s += '<g class="hd-gone" transform="rotate(-7 252 140)"><rect x="170" y="127" width="164" height="26" fill="#0a0c18" opacity=".45" transform="translate(2 3)"/>' +
    '<rect x="170" y="127" width="164" height="26" fill="var(--gold)"/><path d="M170 127h164M170 153h164" stroke="var(--ink)" stroke-width="2.4" stroke-dasharray="9 7"/>' +
    '<text class="sc-txt" x="252" y="146.5" font-size="17" text-anchor="middle" letter-spacing="1.5" fill="var(--ink)" style="font-weight:900">UNATTENDED</text></g>';
  s += '<g class="sc-held sc-off" transform="translate(' + HELD.x + ' ' + HELD.y + ')"><g class="sc-held-in"></g></g>';
  s += '<g class="sc-q sc-rig sc-off" style="transform-origin:350px 40px"><circle cx="350" cy="40" r="16" fill="url(#sc-paper)"/><circle cx="333" cy="55" r="4.5" fill="url(#sc-paper)"/><circle cx="325" cy="62" r="2.6" fill="url(#sc-paper)"/>' +
    '<path d="M344.5 34.5C344.5 27 355.5 27 355.5 34C355.5 39 350 39.5 350 44.5" fill="none" stroke="var(--ink)" stroke-width="3.6" stroke-linecap="round"/><circle cx="350" cy="50.5" r="2.3" fill="var(--ink)"/></g>';
  return s;
}

// pile: 24 fixed slots, a low wide heap on the floor, filled from the bottom row up (the same slots as the drawn game)
function clampSlot(sl) {
  var sz = sl[3], c = sz * 0.44, a = sl[2] * Math.PI / 180, ext = c * (Math.abs(Math.cos(a)) + Math.abs(Math.sin(a))), m = 6, dy = sz * 0.53;
  return [f(clamp(sl[0], m + ext, 394 - ext)), f(clamp(sl[1], m + ext + dy, 300 - m - ext + dy)), f(sl[2]), sz];
}
var SLOTS = (function () {
  var rows = [[7, 297, 30, 214, 50, 10], [6, 281, 42, 194, 48, 22], [5, 265, 52, 166, 46, 26], [3, 250, 64, 136, 44, 26], [2, 236, 80, 120, 42, 24], [1, 223, 99, 99, 40, 16]], out = [];
  seed = 11;
  rows.forEach(function (r) {
    var row = [];
    for (var i = 0; i < r[0]; i++) {
      var x = r[0] > 1 ? r[2] + (r[3] - r[2]) * i / (r[0] - 1) : r[2];
      row.push(clampSlot([x + (rnd() - 0.5) * 8, r[1] + (rnd() - 0.5) * 4, (rnd() - 0.5) * 2 * r[5], r[4]]));
    }
    row.sort(function () { return rnd() - 0.5; });
    out = out.concat(row);
  });
  return out;
})();
function placeGift(gEl, spec, x, y, size) {
  var str = '';
  try { str = NP.giftSVG(spec) || ''; } catch (e) { str = ''; }
  gEl.innerHTML = str;
  var sv = gEl.firstElementChild;
  if (sv && sv.tagName.toLowerCase() === 'svg') {
    sv.setAttribute('x', x); sv.setAttribute('y', y); sv.setAttribute('width', size); sv.setAttribute('height', size);
    sv.setAttribute('overflow', 'visible');
    sv.style.width = size + 'px'; sv.style.height = size + 'px'; sv.style.overflow = 'visible';
  }
}

NP.scene.mountDesk = function (el) {
  if (!HD.has('plates', 'desk') || !HD.has('fc', 'idle-0')) return drawnDesk(el);
  var svg = mount(el, '0 0 400 300', 'xMidYMax meet', 'sc-desk hd-desk', deskMarkup());
  var P = {};
  ['q', 'held', 'sglow2', 'notes', 'pile', 'pileao'].forEach(function (n) { P[n] = q(svg, '.sc-' + n); });
  var fcs = q(svg, '.hd-fcs'), heldIn = q(svg, '.sc-held-in'), top = q(svg, '.hd-fc'), frames = { 'idle-0': top };
  var stage = 0, pose = 'idle', at = 'idle', shownName = 'idle', moveEnd = 0, loops = [], gen = 0, timers = [], frameT = [], blinkT = 0, count = 0, lastSpec = null, cur = null, old = [];

  function later(ms, fn) { timers.push(setTimeout(fn, ms)); }
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }
  function has(name) { return HD.has('fc', name + '-' + stage); }
  function warm(st) { var list = []; HD.fc.forEach(function (n) { if (n.slice(-2) === '-' + st) list.push('fc/' + n); }); HD.preload(list); }
  function stopFrames() { frameT.forEach(clearTimeout); frameT = []; clearTimeout(blinkT); blinkT = 0; cancelAnimationFrame(moveRaf); }
  function soon(ms, fn) { frameT.push(setTimeout(fn, ms)); }

  // ---- his frames: a pile of pictures in one box; the one on show is opaque, a change is a blend from one to the next ----
  function frameEl(name, st) {
    if (st == null) st = stage;
    var key = name + '-' + st, e = frames[key];
    if (!e) { var g = document.createElementNS(NS, 'g'); g.innerHTML = fcFrame(name, st, 0); e = frames[key] = g.firstChild; }
    return e;
  }
  // Have every frame of a stage loaded and decoded before it is wanted: a frame first met in the middle of a move arrives late and
  // the move stalls. Each goes to the bottom of the pile at an opacity too small to see (so the browser still paints it, which is
  // what makes it decode), and is cleared once that is done.
  function prime(st) {
    var fresh = [];
    HD.fc.forEach(function (n) {
      if (+n.slice(-1) !== st || n.charAt(n.length - 2) !== '-') return;
      var e = frameEl(n.slice(0, -2), st);
      if (e.parentNode !== fcs) { e.style.opacity = 0.02; fcs.insertBefore(e, fcs.firstChild); fresh.push(e); }
    });
    if (fresh.length) setTimeout(function () { fresh.forEach(function (e) { if (e !== top && !e._a && e.parentNode === fcs && +e.style.opacity < 0.05) e.style.opacity = 0; }); }, 1600);
  }
  function fadeOut(o, ms, ease) {
    var was = o.parentNode === fcs ? +getComputedStyle(o).opacity : 0;
    stop(o._a); o._a = null; o.style.opacity = 0; o._end = 0;
    if (ms && was > 0) { o._a = anim(o, [{ opacity: was }, { opacity: 0 }], { duration: ms, easing: ease || 'linear' }); o._end = performance.now() + ms; if (o._a) o._a.onfinish = function () { o._a = null; }; }
  }
  // bring one frame up over whatever is showing, blended over ms (0, or reduced motion: a cut)
  function show(name, ms, ease) {
    if (!has(name)) name = 'idle';
    var e = frameEl(name);
    shownName = name;
    if (e === top) return;
    ms = reduced() ? 0 : ms || 0;
    // once it is fully up, everything under it can go (and the frames of an earlier stage with it)
    var settle = function () {
      if (top !== e) return;
      qa(fcs, '.hd-fc').forEach(function (o) {
        if (o === e) return;
        stop(o._a); o._a = null; o.style.opacity = 0;
        var key = o.getAttribute('data-f');
        var st = +key.slice(-1);
        if (st !== stage && st !== stage + 1) { fcs.removeChild(o); delete frames[key]; }
      });
    };
    if (e.parentNode !== fcs) { e.style.opacity = 0; fcs.insertBefore(e, fcs.firstChild); }
    // The frames never change places in the pile: moving a picture makes the browser load it again, and it turns up a few frames
    // late. So, if the frame on show lies over the new one, the new one is simply made solid and the old one fades off it;
    // if it lies under, the new one fades in over it. Either way the eye sees the one blend into the other.
    var all = qa(fcs, '.hd-fc'), here = all.indexOf(e), under = all.indexOf(top) > here;
    // (only what is still solid: a frame already fading is left to finish. Starting its fade again each time, from wherever it
    // had got to, kept a ghost of every earlier frame of a move on screen: four or five poses at once.
    // But only if it will be gone by the time this frame is up. The slow blends of his breathing take nearly two seconds, and a
    // resting frame left to finish one of those lay over the whole of the next move: the gift rose beside a man sitting still.)
    var now = performance.now();
    for (var i = here + 1; i < all.length; i++) if (+all[i].style.opacity > 0 || (all[i]._a && all[i]._end - now > ms + 16)) fadeOut(all[i], ms, ease);
    var from = under ? 1 : +getComputedStyle(e).opacity;
    stop(e._a); e._a = null; e.style.opacity = 1; top = e;
    if (ms && from < 1) { e._a = anim(e, [{ opacity: from }, { opacity: 1 }], { duration: ms, easing: ease || 'linear' }); if (e._a) e._a.onfinish = function () { e._a = null; }; }
    if (ms) setTimeout(settle, ms + 30); else settle();
  }
  // the in-between frames from one pose to another, if they were rendered (in either direction)
  function between(a, b) {
    var out = [], i;
    if (has(a + '_' + b + '_1')) for (i = 1; i <= 3; i++) out.push(a + '_' + b + '_' + i);
    else if (has(b + '_' + a + '_1')) for (i = 3; i >= 1; i--) out.push(b + '_' + a + '_' + i);
    return out.filter(has);
  }
  // Move from the pose he is in to another; returns how long the move takes. The frames are stepped off the page's own frame
  // clock, not timers: after a stall (the first time a move is seen, the pictures are still being decoded) timers all fire at
  // once and every frame of the move lands on screen together; the clock just moves on to the frame that is due. Each blend is
  // a little shorter than a step, so one is done before the next starts. onStart(ms) is called as the first frame goes up:
  // whatever must keep time with the move (the gift in his hand) starts there, not when the move was asked for.
  var moveRaf = 0;
  function moveTo(name, onStart) {
    var seq = reduced() || at === name ? [] : between(at, name), same = at === name;
    at = name;
    cancelAnimationFrame(moveRaf);
    if (!seq.length) { var ms = same || reduced() ? 0 : 180; show(name, same ? 120 : 180, 'ease-in-out'); if (onStart) onStart(ms); return ms; }
    seq.push(name);
    var t0 = 0, on = -1, total = seq.length * FC_STEP;
    moveEnd = Date.now() + total + 120;
    moveRaf = requestAnimationFrame(function tick(t) {
      if (!t0) { t0 = t; if (onStart) onStart(total); }
      var i = Math.min(seq.length - 1, Math.floor((t - t0) / FC_STEP));
      if (i > on) { on = i; show(seq[i], FC_STEP - 12); }
      if (i < seq.length - 1) moveRaf = requestAnimationFrame(tick);
    });
    return total;
  }
  // a pose that keeps moving: two frames, each blended into the other and back
  // (blend: how long each change takes. Left out, it is the whole interval, one frame melting into the other; for typing it is
  // short and each frame is held, so the fingers are seen to go down and come up and not as two hands at once)
  function alternate(a, b, every, times, delay, blend) {
    if (reduced() || !has(b)) return;
    for (var i = 0; i < times; i++) (function (i) { soon(delay + i * every, function () { show(i % 2 ? a : b, blend || every, 'ease-in-out'); }); })(i);
    soon(delay + times * every, function () { show(a, blend || every, 'ease-in-out'); });
  }
  function blink() {
    if (has('blink1')) {
      show('blink1', 40); soon(45, function () { show('blink', 40); });
      soon(125, function () { show('blink1', 45); }); soon(175, function () { show('idle', 55); });
    } else { show('blink', 30); soon(130, function () { show('idle', 60); }); }
  }
  // at rest he breathes (a slow blend to a second frame and back) and blinks now and then
  function idleLoop(delay) {
    clearTimeout(blinkT);
    if (reduced()) return;
    blinkT = setTimeout(function tick() {
      if (pose !== 'idle') return;
      var t = 0;
      if (has('blink') && Math.random() < 0.6) { blink(); t = 300; }
      if (has('breathe')) {
        soon(t + 400, function () { show('breathe', 1700, 'ease-in-out'); });
        soon(t + 2200, function () { show('idle', 1900, 'ease-in-out'); });
        blinkT = setTimeout(tick, t + 4300 + Math.random() * 900);
      } else blinkT = setTimeout(tick, 3200 + Math.random() * 2400);
    }, delay);
  }
  // what a pose does once he is in it
  function settleIn(took) {
    if (pose === 'idle') idleLoop(took + 900 + Math.random() * 900);
    if (reduced()) return;
    if (pose === 'type') {
      alternate('type', 'type2', 120, 8, Math.max(200, took + 30), 40);
      loops.push(anim(P.sglow2, [{ opacity: 0.25 }, { opacity: 0.6 }], { duration: 160, iterations: 10, direction: 'alternate' }));
    }
    if (pose === 'scratch') alternate('scratch', 'scratch2', 140, 6, Math.max(280, took + 30));
  }

  // the gift he holds up when puzzled travels with his hand: HELD is where it ends, RISE how far below (and right) the hand starts
  var RISE = [45, 87], EASED = [0, 0.16, 0.5, 0.84, 1];
  function heldPath(up) {
    return EASED.map(function (v, i) {
      var k = up ? 1 - v : v;
      return { transform: 'translate(' + f(RISE[0] * k) + 'px,' + f(RISE[1] * k) + 'px)', opacity: up ? Math.min(1, v * 2.4) : Math.max(0, 1 - v * 1.6), offset: i / 4 };
    });
  }

  function setPose(kind) {
    var was = pose;
    pose = POSES[kind] ? kind : 'idle';
    loops.forEach(stop); loops = []; stopFrames();
    var mine = pose, rising = pose === 'puzzled' && was !== 'puzzled', falling = pose !== 'puzzled' && was === 'puzzled';
    // held gift: it goes up and comes down with his hand, starting when the move's first frame goes up (see moveTo)
    if (pose === 'puzzled') {
      // (held at normal size whatever size it was on the belt, except the earbuds, which are a picture of their own)
      var hs = lastSpec ? Object.assign({}, lastSpec, { broken: false, scale: lastSpec.icon === 'headphones' && lastSpec.scale === 'tiny' ? 'tiny' : null }) : { icon: 'giftbox' };
      placeGift(heldIn, hs, 0, 0, HELD.size);
      if (rising && !reduced()) heldIn.style.opacity = 0;      // not seen until it starts to rise
      P.held.classList.remove('sc-off');
    } else if (!falling || reduced()) P.held.classList.add('sc-off');
    var took = moveTo(pose, function (ms) {
      if (pose !== mine) return;
      heldIn.style.opacity = '';
      // (a touch behind the frames, which each take a moment to come up: the gift must never get ahead of the hand)
      if (rising && ms) loops.push(anim(heldIn, heldPath(true), { duration: ms, delay: 25, fill: 'backwards' }));
      if (falling) {
        // (the class hides it; while these run it is still seen, going back down with his hand)
        P.held.classList.add('sc-off');
        // (both are ended at the next change of pose, with the rest of this pose's motion. Left running, the second kept the
        // gift faded out and down for good: the next time he held one up it rose with his hand and then vanished.)
        if (ms) { loops.push(anim(P.held, [{ opacity: 1 }, { opacity: 1 }], { duration: ms + 25 })); loops.push(anim(heldIn, heldPath(false), { duration: ms, delay: 25, fill: 'both' })); }
      }
    });
    // the question mark over his head: it grows to its size once his hand is on its way up (no bounce), and fades when he
    // gives up wondering (the class hides it; while the fade runs it is still seen)
    var qWas = !P.q.classList.contains('sc-off');
    P.q.classList.toggle('sc-off', pose !== 'puzzled');
    if (pose === 'puzzled' && !qWas && !reduced()) loops.push(anim(P.q, [{ transform: 'scale(.5)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], { duration: 320, delay: 220, fill: 'backwards', easing: 'cubic-bezier(.2,.8,.2,1)' }));
    if (pose !== 'puzzled' && qWas && !reduced()) anim(P.q, [{ opacity: 1 }, { opacity: 0 }], { duration: 220, easing: 'ease-in' });
    settleIn(took);
  }

  function frazzle(n) {
    var st = clamp(Math.round(+n || 0), 0, 3), changed = st !== stage;
    stage = st;
    warm(stage); if (stage < 3) warm(stage + 1);
    prime(stage); if (stage < 3) setTimeout(function () { if (stage === st) prime(st + 1); }, 2500);
    if (!changed) return;
    // more frazzled: the same frame at the new stage. Mid-move nothing needs doing, the frames still to come are the new stage's.
    if (Date.now() < moveEnd) return;
    stopFrames();
    show(pose, 260, 'ease-in-out');
    settleIn(260);
  }

  // Older notes shrink to blank scribbles round the laptop and on the wall, clear of his face.
  var OLD = [[384, 128, 9], [362, 104, -8], [389, 84, 5], [338, 240, -4]];
  var stickyT = 0;
  function demote() {
    clearTimeout(stickyT);
    if (!cur) return;
    old.push(cur);
    if (old.length > OLD.length) { var gone = old.shift(); if (gone.parentNode) gone.parentNode.removeChild(gone); }
    old.forEach(function (n, i) {
      var sl = OLD[(old.length - 1 - i) % OLD.length], sc = f(34 / (+n.getAttribute('data-w') || 100));
      var from = n._at, to = [sl[0], sl[1], sl[2], sc];
      n.setAttribute('transform', 'translate(' + sl[0] + ' ' + sl[1] + ') rotate(' + sl[2] + ') scale(' + sc + ')');
      n._at = to;
      // it glides to its new place, shrinking on the way (it does not jump there), and keeps its words until it is small: turned
      // to scribble at full size, it showed two grey bars across the laptop for a moment
      var blank = function () { var t = n.querySelector('text'), s2 = n.querySelector('.sc-scrib'); if (t) t.parentNode.removeChild(t); if (s2) s2.removeAttribute('style'); };
      if (from && !reduced() && n.querySelector('text')) { anim(n, [{ transform: cssAt(from) }, { transform: cssAt(to) }], { duration: 300, easing: 'ease-in-out' }); setTimeout(blank, 240); }
      else { blank(); if (from && !reduced()) anim(n, [{ transform: cssAt(from) }, { transform: cssAt(to) }], { duration: 300, easing: 'ease-in-out' }); }
    });
    cur = null;
  }
  function cssAt(a) { return 'translate(' + a[0] + 'px,' + a[1] + 'px) rotate(' + a[2] + 'deg) scale(' + a[3] + ')'; }
  function pxPerUnit() { var r = svg.getBoundingClientRect(); return r.width && r.height ? Math.min(r.width / 400, r.height / 300) : 0; }
  function sticky(text) {
    demote();
    if (text == null || text === '') return;
    var note = document.createElementNS(NS, 'g');
    note.setAttribute('class', 'sc-note');
    note.innerHTML = '<g class="sc-note-pop sc-rig" style="transform-origin:0px 0px"><path class="hd-nshadow"/><path class="sc-nbody" fill="url(#sc-sticky)"/><path class="sc-ncurl hd-ncurl"/>' +
      '<rect class="sc-ntape" fill="var(--gold)" opacity=".22"/><path class="sc-scrib" fill="none" stroke="var(--ink-soft)" stroke-width="7" stroke-linecap="round" style="display:none"/>' +
      '<text fill="var(--ink)" text-anchor="middle"></text></g>';
    P.notes.appendChild(note);
    var rot = f((rnd() - 0.5) * 5);
    layoutNote(note, String(text), rot);
    cur = note;
    var relay = function () { if (cur === note) layoutNote(note, String(text), rot); };
    setTimeout(relay, 90); setTimeout(relay, 800); setTimeout(relay, 2000);
    var pop = q(note, '.sc-note-pop');
    if (reduced()) anim(pop, [{ opacity: 0 }, { opacity: 1 }], { duration: 120 });
    // (slapped onto the lid: it comes down to its size and stays, no bounce)
    else anim(pop, [{ transform: 'scale(1.18) rotate(-5deg)', opacity: 0 }, { transform: 'scale(1) rotate(0)', opacity: 1 }], { duration: 240, easing: 'cubic-bezier(.2,.8,.2,1)' });
    stickyT = setTimeout(function () { if (cur === note) demote(); }, 9000);
  }
  function layoutNote(note, text, rot) {
    var t = note.querySelector('text'), k = pxPerUnit();
    if (!t) return;
    var fs = clamp(Math.ceil(14.4 / (k || 0.95)), 15, 25), maxW = LID.w + 12, lines, w = 0, script = true;
    var words = String(text).split(/\s+/);
    function fit() {
      t.setAttribute('class', script ? 'sc-script' : 'sc-txt');
      t.setAttribute('font-size', fs); t.style.fontSize = fs + 'px';
      lines = wrapWords(words, function (s2) { return measure(t, s2) <= maxW - 14; });
      w = 0; lines.forEach(function (l) { w = Math.max(w, measure(t, l)); });
      return lines.length <= 3 && w <= maxW - 14;
    }
    if (!fit()) { script = false; if (!fit()) { fs = Math.max(14, Math.floor(fs * (maxW - 14) / w)); fit(); } }
    if (lines.length > 4) { lines = lines.slice(0, 4); lines[3] += '…'; }
    t.textContent = '';
    var lh = f(fs * (script ? 1.22 : 1.12)), nw = Math.ceil(clamp(w + 16, 64, maxW)), nh = Math.ceil(lines.length * lh + 14);
    lines.forEach(function (l, i) {
      var sp = document.createElementNS(NS, 'tspan');
      sp.setAttribute('x', 0); sp.setAttribute('y', f(9 + fs * 0.86 + i * lh)); sp.textContent = l;
      t.appendChild(sp);
    });
    var hw = nw / 2, body = 'M' + -hw + ' 1Q' + -hw + ' 0 ' + (-hw + 1) + ' 0H' + hw + 'V' + (nh - 11) + 'L' + (hw - 11) + ' ' + nh + 'H' + (-hw + 1) + 'Q' + -hw + ' ' + nh + ' ' + -hw + ' ' + (nh - 1) + 'Z';
    q(note, '.sc-nbody').setAttribute('d', body);
    q(note, '.hd-nshadow').setAttribute('d', body);
    q(note, '.sc-ncurl').setAttribute('d', 'M' + hw + ' ' + (nh - 11) + 'L' + (hw - 11) + ' ' + nh + 'Q' + (hw - 9) + ' ' + (nh - 9) + ' ' + hw + ' ' + (nh - 11) + 'Z');
    q(note, '.sc-scrib').setAttribute('d', 'M' + f(-hw + 12) + ' ' + f(nh * 0.38) + 'H' + f(hw - 16) + 'M' + f(-hw + 12) + ' ' + f(nh * 0.66) + 'H' + f(hw * 0.3));
    var tp = q(note, '.sc-ntape'); tp.setAttribute('x', -hw); tp.setAttribute('y', 0); tp.setAttribute('width', nw); tp.setAttribute('height', 7);
    note.setAttribute('data-w', nw);
    var cx = clamp(LID.x + LID.w / 2, LID.x - 4 + hw, 398 - hw), top = LID.y + 3;
    note.setAttribute('transform', 'translate(' + f(cx) + ' ' + top + ') rotate(' + rot + ')');
    note._at = [f(cx), top, rot, 1];
  }

  var api = {
    svg: svg,
    pileAdd: function (spec) {
      spec = spec || {};
      lastSpec = spec;
      var i = count++, sl = SLOTS[i % SLOTS.length].slice(), lift = Math.floor(i / SLOTS.length);
      if (lift) { sl = SLOTS[11 + (i % 13)].slice(); sl[1] -= 9 * lift; sl[2] = -sl[2]; sl = clampSlot(sl); }
      var outer = document.createElementNS(NS, 'g'), sz = sl[3], hs = sz / 2;
      outer.setAttribute('transform', 'translate(' + sl[0] + ' ' + sl[1] + ')');
      outer.innerHTML = '<g class="sc-drop sc-rig" style="transform-origin:0px 0px;transition:none"><g class="sc-gift"></g></g>';
      // a giant toy lands in the pile at normal size (it would bury the heap); the slot sets the tilt
      placeGift(q(outer, '.sc-gift'), Object.assign({}, spec, { broken: true, scale: spec.scale === 'giant' ? null : spec.scale, tilt: sl[2] }), -hs, -sz, sz);
      P.pile.appendChild(outer);
      var pa = P.pileao, nn = Math.min(count, SLOTS.length);
      pa.setAttribute('rx', f(40 + nn * 2.8)); pa.setAttribute('ry', f(8 + nn * 0.25)); pa.setAttribute('cx', f(100 + Math.min(nn, 6) * 1));
      pa.setAttribute('opacity', f(Math.min(0.62, 0.3 + count * 0.03)));
      if (reduced()) return Promise.resolve();
      anim(q(outer, '.sc-drop'), [
        { transform: 'translateY(-330px) scale(.96,1.06)', easing: 'cubic-bezier(.5,0,.75,0)' },
        { transform: 'translateY(0) scale(1,1)', offset: 0.7 },
        { transform: 'translateY(0) scale(1.12,.88)', offset: 0.83 },
        { transform: 'translateY(0) scale(1,1)' }], { duration: 600 });
      return new Promise(function (res) { setTimeout(res, 420); });
    },
    fc: function (kind) { gen++; clearTimers(); setPose(kind); },
    react: function (isCorrect) {
      var my = ++gen; clearTimers();
      return new Promise(function (res) {
        function step(kind, ms, next) { if (my !== gen) return res(); setPose(kind); later(ms, next); }
        if (isCorrect) step('puzzled', 2300, function () { if (my === gen) setPose('idle'); res(); });
        else step('look', 650, function () { step('scratch', 950, function () { step('type', 1000, function () { if (my === gen) setPose('idle'); res(); }); }); });
      });
    },
    frazzle: frazzle,
    sticky: sticky,
    mugs: function (n) {
      n = clamp(Math.round(+n || 0), 0, MUGS.length);
      qa(svg, '.sc-mug').forEach(function (m) {
        var on = +m.getAttribute('data-i') < n, was = !m.classList.contains('sc-off');
        m.classList.toggle('sc-off', !on);
        // (set down on the desk: it is china, it does not squash)
        if (on && !was && !reduced()) anim(m, [{ transform: 'translateY(-9px)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }], { duration: 260, easing: 'cubic-bezier(.3,.7,.4,1)' });
      });
    }
  };
  frazzle(0); settleIn(0);
  return api;
};

HD.preload(['plates/belt', 'plates/desk', 'props/barrier', 'props/mitten','fc/idle-0', 'fc/blink-0', 'fc/look-0', 'fc/scratch-0', 'fc/scratch2-0', 'fc/type-0', 'fc/type2-0', 'fc/puzzled-0', 'fc/relief-0'].filter(function (p) { var a = p.split('/'); return HD.has(a[0], a[1]); }));
