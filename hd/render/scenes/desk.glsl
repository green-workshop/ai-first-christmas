// The desk bay: Father Christmas at his desk with the laptop, the rejects corner under the window.
// Frame = the engine's desk panel 400 x 300 plus 100 units above and 80 each side (desk units x -80..480, y -100..300), at 3 px a unit.
// --D POSE=n --D STAGE=n --D FRAME=n --D BLINK=1 choose his frame; --D NOFC=1 leaves him out.
//@ w=1680 h=1200 spp=300 ortho=6.0 pos=0,8.084,19.563 tgt=0,3.926,0 aperture=0.1 focus=20.3 exposure=2.3
//@include rigs/desk.glsl
// how worn down he looks (sweat, bags under the eyes, a beard coming apart: models/fc.glsl) goes with how frazzled he is
#ifndef FC_WORN
#ifdef STAGE
#define FC_WORN STAGE
#endif
#endif
//@include models/fc.glsl
#ifndef INSPECT
#define FOG 0.011
#define FOG_LIGHT 0
#define FOG_LIGHT2 1
#endif
#define STEPK 0.72
#define TMAX 50.0
#define STEPS 260

const vec3 WIN = vec3(-1.95, 4.49, -5.0);
const vec3 SIGN = vec3(-4.41, 4.24, -4.975);
const vec3 LAP = vec3(4.38, 0.0, -1.2);
const vec3 WREATH = vec3(4.75, 5.35, -4.86);

float deskFairyY(float x) { float u = x / 6.2; return 6.55 - 0.42 * (1.0 - u * u); }

float map(vec3 p) {
  float d = 1e9; gM = 0.0;
  // ---- room ----
  float bid; float mortar = brickPattern(p.xy * 0.62, bid);
  add(d, p.z + 5.0 + 0.02 * mortar - 0.008 * bid, 5.0);
  add(d, p.y + 2.05 - 0.005 * noise(p.xz * 2.0), 6.0);

  // ---- desk ----
  float bb = sdBox(p - vec3(2.97, -1.05, -1.15), vec3(3.75, 1.1, 1.3));
  if (bb > 0.1) d = min(d, bb); else {
    float top = sdRBox(p - vec3(2.97, -0.08, -1.15), vec3(3.66, 0.08, 1.17), 0.03);
    float carc = sdRBox(p - vec3(2.97, -1.12, -1.05), vec3(3.55, 0.93, 0.98), 0.02);
    // drawer fronts: a routed groove round each, sitting a hair proud
    vec2 dq = vec2(abs(p.x - 2.91) - 1.47, p.y + 1.22);
    float dr2 = sdBox2(dq, vec2(1.2, 0.62));
    carc = max(carc, -max(abs(dr2) - 0.018, -0.045 - p.z));
    add(d, min(top, carc), 7.0);
    // brass bar pulls
    vec3 hq = vec3(abs(p.x - 2.91) - 1.47, p.y + 1.0, p.z - 0.07);
    float pull = sdCapsule(hq, vec3(-0.36, 0.0, 0.0), vec3(0.36, 0.0, 0.0), 0.035);
    vec3 hp = hq; hp.x = abs(hp.x) - 0.3;
    pull = min(pull, sdCapsule(hp, vec3(0.0, 0.0, -0.08), vec3(0.0), 0.03));
    add(d, pull, 8.0);
  }

  // ---- chair: tall buttoned leather back ----
  vec3 c = p - vec3(FCPOS.x, 1.55, -3.85);
  bb = sdBox(c, vec3(2.0, 2.4, 0.5));
  if (bb > 0.1) d = min(d, bb); else {
    float back = sdRBox(c, vec3(1.78, 2.15, 0.16), 0.5);
    vec2 g = vec2(c.x, c.y); g.x += 0.3 * step(1.0, mod(floor(g.y / 0.6), 2.0));
    vec2 cell = vec2(repLim(g.x, 0.6, -3.0, 3.0), repLim(g.y, 0.6, -3.0, 3.0));
    float tuft = length(cell);
    back += 0.05 * exp(-tuft * tuft * 22.0) * step(0.0, c.z) - 0.02 * (1.0 - exp(-tuft * tuft * 5.0)) * step(0.0, c.z);
    add(d, back * 0.8, 9.0);
    vec3 bt = vec3(cell, c.z - 0.13);
    add(d, sdEllipsoid(bt, vec3(0.045, 0.045, 0.03)), 8.0);
    // studs round the edge
    float edge = abs(sdBox2(c.xy, vec2(1.78 - 0.5, 2.15 - 0.5)) - 0.42);
    float ang = atan(c.y, c.x);
    add(d, max(length(vec2(edge, c.z - 0.15)) - 0.035, abs(fract((c.x + c.y * 1.7 + ang * 0.6) * 4.0) - 0.5) - 0.3), 8.0);
  }

  // ---- him ----
#ifndef NOFC
  mFC(p - FCPOS, d);
#endif

  // ---- laptop: lid back towards us, leaning a little ----
  vec3 l = p - LAP;
  bb = sdBox(l - vec3(0.0, 1.05, -0.3), vec3(1.6, 1.15, 0.8));
  if (bb > 0.1) d = min(d, bb); else {
    add(d, sdRBox(l - vec3(0.0, 0.045, -0.52), vec3(1.5, 0.045, 0.55), 0.03), 10.0);
    vec3 q = l - vec3(0.0, 0.07, 0.0); q.yz = rot(0.14) * q.yz;
    float lid = sdRBox(q - vec3(0.0, 1.05, 0.0), vec3(1.5, 1.05, 0.03), 0.028);
    add(d, lid, q.z < 0.0 && abs(q.x) < 1.38 && abs(q.y - 1.05) < 0.93 ? 11.0 : 10.0);
    add(d, sdRCyl((q - vec3(0.0, 1.1, 0.031)).xzy, 0.2, 0.004, 0.003), 12.0);                 // inlaid emblem
    add(d, sdCapsule(l, vec3(-1.3, 0.07, 0.0), vec3(1.3, 0.07, 0.0), 0.045), 13.0);            // hinge
  }

  // ---- wall dressing ----
  bb = p.z + 4.2;
  if (bb > 0.1) d = min(d, bb); else {
    // window: steel frame, four panes, snow on the sill
    vec3 w = p - WIN;
    float frame = sdRBox(w, vec3(1.2, 0.98, 0.14), 0.03);
    frame = max(frame, -sdBox(w, vec3(1.02, 0.8, 0.3)));
    float bars = min(sdBox(w, vec3(0.04, 0.8, 0.05)), sdBox(w, vec3(1.02, 0.04, 0.05)));
    add(d, min(frame, bars), 14.0);
    add(d, sdBox(w - vec3(0.0, 0.0, 0.05), vec3(1.02, 0.8, 0.012)), 15.0);                    // the night outside
    float sill = sdRBox(w - vec3(0.0, -1.06, 0.12), vec3(1.34, 0.07, 0.26), 0.02);
    add(d, sill, 14.0);
    float snow = sdEllipsoid(w - vec3(-0.3, -0.84, 0.0), vec3(0.9, 0.2, 0.12));
    snow = smin(snow, sdEllipsoid(w - vec3(0.55, -0.82, 0.0), vec3(0.6, 0.16, 0.12)), 0.1);
    snow = smin(snow, sdEllipsoid(w - vec3(0.1, -0.97, 0.2), vec3(1.2, 0.08, 0.2)), 0.08);
    add(d, snow - 0.012 * noise(p * 20.0), 16.0);
    // REJECTS: a sheet of card taped up, not quite straight
    vec3 s = p - SIGN; s.xy = rot(0.052) * s.xy;
    add(d, sdRBox(s - vec3(0.0, 0.0, 0.012 * sin(s.x * 2.2)), vec3(1.41, 0.45, 0.006), 0.004) * 0.8, 17.0);
    add(d, sdRBox(s - vec3(0.1, 0.44, 0.016), vec3(0.24, 0.09, 0.003), 0.002), 18.0);
    // pipes
    float pipe = length(vec2(p.y - 7.35, p.z + 4.78)) - 0.13;
    pipe = min(pipe, max(length(vec2(p.y - 7.35, p.z + 4.78)) - 0.19, abs(repLim(p.x - 0.8, 3.1, -3.0, 3.0)) - 0.045));
    float vert = max(length(vec2(p.x - 0.35, p.z + 4.8)) - 0.1, p.y - 7.35);
    add(d, min(pipe, vert), 19.0);
    add(d, length(vec2(p.y - 6.95, p.z + 4.86)) - 0.055, 20.0);
    // wreath: fir, berries, a bow
    vec3 wr = p - WREATH;
    float wb = length(wr) - 1.2;
    if (wb > 0.1) d = min(d, wb); else {
      float ring = sdTorus(wr.xzy, 0.72, 0.24);
      float a = atan(wr.y, wr.x);
      float needles = (noise(vec3(a * 9.0, length(wr.xy) * 14.0, wr.z * 14.0)) - 0.5) * 0.16 + (noise(p * 60.0) - 0.5) * 0.05;
      add(d, (ring - needles) * 0.6, 21.0);
      float ba = floor(a / 0.7 + 0.5) * 0.7;
      vec3 bp = wr - vec3(cos(ba) * 0.72, sin(ba) * 0.72, 0.24);
      add(d, sdSphere(bp - vec3(0.06 * sin(ba * 7.0), 0.05 * cos(ba * 5.0), 0.0), 0.075), 22.0);
      vec3 bw = wr - vec3(0.0, -0.74, 0.3); bw.x = abs(bw.x);
      float bow = sdEllipsoid(bw - vec3(0.22, 0.03, 0.0), vec3(0.24, 0.05 + 0.4 * bw.x, 0.07));
      bow = min(bow, sdRBox(bw, vec3(0.07, 0.08, 0.07), 0.03));
      vec3 tl = bw - vec3(0.14, -0.3, 0.0); tl.xy = rot(-0.3) * tl.xy;
      bow = min(bow, sdRBox(tl, vec3(0.075, 0.26, 0.012), 0.008));
      add(d, bow, 23.0);
    }
    // fairy lights
    float fb = abs(p.y - 6.35) - 0.45;
    if (fb > 0.1) d = min(d, fb); else {
      float wy = deskFairyY(p.x);
      add(d, (length(vec2(p.y - wy, p.z + 4.85)) - 0.012) * 0.7, 24.0);
      float bi = floor(p.x / 0.68 + 0.5), bx = bi * 0.68;
      vec3 bq = p - vec3(bx, deskFairyY(bx) - 0.11, -4.82);
      add(d, sdEllipsoid(bq, vec3(0.055, 0.08, 0.055)), 40.0 + mod(bi + 40.0, 4.0));
      add(d, sdCyl(bq - vec3(0, 0.08, 0), 0.032, 0.03), 24.0);
    }
  }

  // ---- pendant lamp ----
  bb = sdBox(p - vec3(DLAMP.x, 9.0, DLAMP.z), vec3(0.75, 3.7, 0.75));
  if (bb > 0.1) d = min(d, bb); else {
    vec3 q = p - DLAMP - vec3(0, 0.1, 0);
    float cone = sdCapCone(q, 0.26, 0.66, 0.13);
    float shade = max(abs(cone) - 0.011, -0.25 - q.y);
    add(d, shade, cone < 0.0 ? 26.0 : 25.0);
    add(d, sdTorus(q - vec3(0, -0.25, 0), 0.655, 0.018), 25.0);
    add(d, sdRCyl(q - vec3(0, 0.34, 0), 0.105, 0.09, 0.02), 8.0);
    add(d, sdCapsule(p, DLAMP + vec3(0, 0.5, 0), DLAMP + vec3(0, 8.0, 0), 0.018), 24.0);
    add(d, sdSphere(p - DLAMP - vec3(0, 0.03, 0), 0.09), 27.0);
  }
  return d;
}

void shade(float id, vec3 p, inout vec3 n, inout Mat m) {
  if (shFC(id, p - FCPOS, n, m)) return;
  if (id < 5.5) {
    matBrick(m, n, p * 0.62, p.xy * 0.62, srgb(0.11, 0.155, 0.30), 0.42);
    float damp = 1.0 - smoothstep(-2.2, 0.3, p.y + 0.8 * fbm(p.xy * 0.5)); m.col *= 1.0 - 0.5 * damp; m.rough -= 0.25 * damp;
    return;
  }
  if (id < 6.5) { matConcrete(m, n, p * 0.6, srgb(0.21, 0.21, 0.225)); return; }
  if (id < 7.5) {                                    // desk: dark walnut, grain along its length, lacquered and a bit worn
    matWood(m, n, p * vec3(0.35, 2.6, 2.6) + vec3(0.0, 3.0, 1.0), vec3(1.0, 0.02, 0.03), 0.8, 0.8);
    float ring = smoothstep(0.02, 0.0, abs(length(p.xz - vec2(0.1, -0.9)) - 0.2)) * step(-0.01, p.y);   // a coffee ring
    m.col *= 1.0 - 0.35 * ring;
    return;
  }
  if (id < 8.5) { matMetal(m, n, p, 1, vec3(1, 0, 0)); return; }
  if (id < 9.5) { matLeather(m, n, p * 0.7, srgb(0.06, 0.20, 0.13), 0.6); return; }
  if (id < 10.5) { matMetal(m, n, p * 0.6, 0, vec3(1, 0, 0)); m.col = srgb(0.70, 0.71, 0.74) * (0.92 + 0.1 * noise(p * 300.0)); m.rough = 0.36; return; }   // aluminium
  if (id < 11.5) { m.col = srgb(0.02, 0.025, 0.035); m.rough = 0.12; m.coat = 1.0; m.emit = vec3(0.62, 0.78, 1.0) * 2.2; return; }      // his screen, lit
  if (id < 12.5) { matMetal(m, n, p, 3, vec3(1, 0, 0)); m.rough = 0.12; return; }
  if (id < 13.5) { matPlastic(m, n, p, srgb(0.05, 0.05, 0.055), 0.4); return; }
  if (id < 14.5) { matPaint(m, n, p * 0.6, srgb(0.14, 0.16, 0.20), 0.5, 0.6, srgb(0.3, 0.17, 0.1), 0.6); return; }
  if (id < 15.5) {                                   // night sky through frosted glass: a crescent moon, stars
    vec2 q = p.xy - WIN.xy;
    vec3 skyc = mix(vec3(0.02, 0.035, 0.09), vec3(0.008, 0.012, 0.04), sat(q.y * 0.6 + 0.5));
    float moon = (1.0 - smoothstep(0.17, 0.19, length(q - vec2(0.48, 0.38)))) * smoothstep(0.15, 0.17, length(q - vec2(0.56, 0.42)));
    float star = step(0.985, hash1(floor(q * 26.0))) * step(-0.3, q.y);
    float frost = smoothstep(0.45, 0.8, fbm(q * 5.0 + 3.0)) * (1.0 - smoothstep(0.0, 0.6, min(1.02 - abs(q.x), 0.8 - abs(q.y))));
    m.col = vec3(0.02); m.rough = 0.08; m.coat = 1.0;
    m.emit = skyc * 5.0 + vec3(1.0, 0.96, 0.85) * moon * 20.0 + vec3(0.8, 0.9, 1.0) * star * 4.0 + vec3(0.35, 0.45, 0.6) * frost * 0.9;
    return;
  }
  if (id < 16.5) { matSnow(m, n, p); return; }
  if (id < 17.5) { matPaper(m, n, p, 1, srgb(0.85, 0.80, 0.66)); m.col *= 0.9 + 0.14 * fbm3(p * 3.0); return; }
  if (id < 18.5) { m.col = srgb(0.78, 0.70, 0.48); m.rough = 0.35; m.coat = 0.3; return; }
  if (id < 19.5) { matPaint(m, n, p * 0.6, srgb(0.16, 0.19, 0.25), 0.4, 0.75, srgb(0.30, 0.16, 0.10), 0.6); return; }
  if (id < 20.5) { matMetal(m, n, p, 4, vec3(1, 0, 0)); return; }
  if (id < 21.5) {                                   // fir needles
    float v = noise(p * 40.0), tip = noise(p * 130.0);
    m.col = mix(srgb(0.03, 0.14, 0.07), srgb(0.10, 0.33, 0.14), v) * (0.7 + 0.5 * tip); m.rough = 0.6; m.sheen = 0.4; m.sheenCol = srgb(0.5, 0.9, 0.6);
    n = normalize(n + 0.6 * (hash3(p * 500.0) - 0.5));
    return;
  }
  if (id < 22.5) { m.col = srgb(0.62, 0.03, 0.04); m.rough = 0.12; m.coat = 1.0; return; }
  if (id < 23.5) { m.col = srgb(0.55, 0.03, 0.045) * (0.8 + 0.3 * noise(vec3(p.x * 300.0, p.y * 30.0, p.z * 300.0))); m.rough = 0.42; m.sheen = 1.0; m.sheenCol = srgb(1.0, 0.5, 0.45); return; }
  if (id < 24.5) { matRubber(m, n, p, srgb(0.03, 0.03, 0.033)); m.rough = 0.5; return; }
  if (id < 25.5) { matPaint(m, n, p, srgb(0.05, 0.25, 0.17), 0.9, 0.3, srgb(0.1, 0.1, 0.11), 1.0); return; }
  if (id < 26.5) { m.col = srgb(0.93, 0.90, 0.82) * (0.85 + 0.2 * fbm3(p * 9.0)); m.rough = 0.35; m.coat = 0.5; return; }
  if (id < 27.5) { m.col = vec3(0.0); m.glow = vec3(1.0, 0.72, 0.36) * 28.0; return; }
  float k = id - 40.0;
  vec3 c = k < 0.5 ? vec3(1.0, 0.16, 0.08) : k < 1.5 ? vec3(1.0, 0.62, 0.12) : k < 2.5 ? vec3(0.12, 0.9, 0.25) : vec3(0.15, 0.4, 1.0);
  m.col = c * 0.2; m.rough = 0.15; m.coat = 1.0; m.emit = c * 1.4; m.glow = c * 5.0;
}
