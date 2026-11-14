// The belt bay: packing cabinet on the left, the AI's hopper machine on the right, the conveyor across the middle.
// Frame = the engine's lane 800 x 300 plus 170 units of room above it (viewBox 0 -170 800 470).
//@ w=2000 h=1175 spp=300 ortho=3.418 pos=0,6.3736,19.563 tgt=0,2.2155,0 aperture=0.13 focus=20 exposure=1.9
//@include rigs/belt.glsl
#ifndef INSPECT
#define FOG 0.016
#define FOG_LIGHT 0
#endif
#define STEPK 0.85
#define TMAX 45.0
#define STEPS 260

const vec3 CAB = vec3(-5.31, 0.225, 0.0);      // packing cabinet centre
const vec3 SCR = vec3(3.49, 0.76, -0.70);      // the AI's screen
const vec3 HOOD = vec3(1.745, 2.18, -0.22);    // spout hood over x = 520
const vec3 PORT = vec3(-5.24, -0.55, 0.95);    // status lamp porthole
const vec3 CLOCK = vec3(5.1, 3.0, -2.2);
const vec3 POSTER = vec3(-3.4, 3.0, -2.185);
const vec3 SIGN_PACK = vec3(-4.596, 1.80, -2.16);
const vec3 SIGN_REJ = vec3(3.89, -0.692, 0.665);

float archWin(vec2 q, vec2 h) { return min(sdBox2(q, h), length(q - vec2(0.0, h.y)) - h.x); }
float fairyY(float x) { float u = (x + 0.65) / 1.65; return 3.36 - 0.3 * (1.0 - u * u); }
// an enamel sign plate with a raised brass frame, facing +z
float plate(vec3 q, vec2 h, out float isFrame) {
  float body = sdRBox(q, vec3(h, 0.012), 0.01);
  float fr = max(abs(sdBox2(q.xy, h - 0.03) - 0.02) - 0.014, abs(q.z - 0.012) - 0.01);
  isFrame = fr < body ? 1.0 : 0.0;
  vec3 s = q; s.xy = abs(s.xy) - (h - 0.075);
  float screw = sdEllipsoid(s - vec3(0, 0, 0.016), vec3(0.022, 0.022, 0.012));
  if (screw < min(body, fr)) isFrame = 1.0;
  return min(min(body, fr), screw);
}

float map(vec3 p) {
  float d = 1e9; gM = 0.0;
  // ---- room ----
  float bid; float mortar = brickPattern(p.xy, bid);
  add(d, p.z + 2.2 + 0.014 * mortar - 0.006 * bid, 5.0);
  add(d, p.y + 1.3 - 0.004 * noise(p.xz * 3.0), 6.0);

  // ---- conveyor ----
  float bb = sdBox(p - vec3(1.0, -0.55, 0.0), vec3(5.9, 0.8, 0.76));
  if (bb > 0.1) d = min(d, bb); else {
    float belt = sdRBox(p - vec3(1.0, -0.035, 0.0), vec3(5.6, 0.035, 0.55), 0.012);
    belt -= 0.0016 * sin(p.z * 150.0) * smoothstep(0.0, 0.004, p.y + 0.003);      // lengthwise ribbing
    add(d, belt, 1.0);
    vec3 r = p; r.z = abs(r.z) - 0.62;
    float rail = sdRBox(r - vec3(1.0, -0.105, 0.0), vec3(5.5, 0.135, 0.032), 0.012);
    rail = min(rail, sdRBox(r - vec3(1.0, 0.012, 0.012), vec3(5.5, 0.016, 0.05), 0.008));   // top lip
    add(d, rail, 2.0);
    // roller axle caps and bolts along the front rail
    vec3 a = p - vec3(0.0, -0.105, 0.655); a.x = repLim(a.x - 0.25, 0.9, -5.0, 6.0);
    float cap = sdRCyl(a.xzy, 0.062, 0.02, 0.008);
    cap = min(cap, sdCyl(a.xzy - vec3(0, 0.02, 0), 0.022, 0.012));
    add(d, cap, 4.0);
    vec3 b = p - vec3(0.0, -0.2, 0.655); b.x = repLim(b.x - 0.7, 0.9, -5.0, 6.0);
    add(d, sdRCyl(b.xzy, 0.022, 0.012, 0.004), 4.0);
    // legs, stretcher, feet
    vec3 l = p; l.z = abs(l.z) - 0.6; l.x = repLim(l.x - 0.3, 2.4, -2.0, 2.0);
    float leg = sdRBox(l - vec3(0, -0.77, 0), vec3(0.05, 0.55, 0.05), 0.008);
    leg = min(leg, sdRBox(l - vec3(0, -1.285, 0), vec3(0.11, 0.015, 0.11), 0.006));
    vec3 xb = p; xb.x = repLim(xb.x - 0.3, 2.4, -2.0, 2.0);
    leg = min(leg, sdRBox(xb - vec3(0, -0.95, 0), vec3(0.03, 0.03, 0.6), 0.006));
    leg = min(leg, sdRBox(p - vec3(1.0, -0.692, 0.6), vec3(5.5, 0.045, 0.028), 0.006));
    add(d, leg, 3.0);
    // armoured cable clipped under the rail
    float cy = -0.36 - 0.035 * sin(p.x * 2.6);
    add(d, (length(vec2(p.y - cy, p.z - 0.665)) - 0.017 - 0.0025 * sin(p.x * 260.0)) * 0.8, 17.0);
    // REJECTS plate
    float fr; float pl = plate(p - SIGN_REJ, vec2(1.127, 0.223), fr); add(d, pl, fr > 0.5 ? 8.0 : 18.0);
  }

  // ---- packing cabinet ----
  bb = sdBox(p - vec3(-5.3, 0.3, 0.0), vec3(1.0, 1.7, 1.05));
  if (bb > 0.1) d = min(d, bb); else {
    vec3 c = p - CAB;
    float cab = sdRBox(c, vec3(0.89, 1.525, 0.95), 0.03);
    float win2 = archWin(p.xy - vec2(-5.24, 0.5), vec2(0.5, 0.33));
    float cut = sdBox(p - vec3(-5.2, 0.62, 0.0), vec3(0.72, 0.72, 0.85));
    cut = min(cut, max(win2, abs(p.z - 0.9) - 0.2));
    cut = min(cut, sdBox(p - vec3(-4.42, 0.45, 0.0), vec3(0.15, 0.55, 0.68)));
    float groove = max(abs(sdBox2(p.xy - vec2(-5.24, -0.6), vec2(0.6, 0.5)) - 0.03) - 0.012, 0.938 - p.z);
    cab = max(cab, -min(cut, groove));
    add(d, cab, c.z < 0.9 && cut < 0.02 ? 10.0 : 7.0);
    // brass: window surround, edge strap, porthole ring
    float brass = max(abs(win2 - 0.03) - 0.032, abs(p.z - 0.955) - 0.018);
    brass = min(brass, sdRBox(p - vec3(-4.445, 0.225, 0.925), vec3(0.045, 1.53, 0.045), 0.006));
    vec3 rv = p - vec3(-4.445, 0.0, 0.975); rv.y = repLim(rv.y - 0.1, 0.3, -4.0, 5.0);
    brass = min(brass, sdEllipsoid(rv, vec3(0.02, 0.02, 0.012)));
    brass = min(brass, sdTorus((p - PORT).xzy, 0.2, 0.036));
    brass = min(brass, sdRCyl((p - PORT).xzy, 0.235, 0.012, 0.005));
    add(d, brass, 8.0);
    add(d, sdEllipsoid(p - PORT, vec3(0.172, 0.172, 0.06)), 25.0);            // status lamp lens
    // rubber strip curtain
    float sx = p.x + 5.24, si = floor(sx / 0.143 + 0.5);
    float len = 0.34 + 0.07 * hash1(si + 2.0);
    vec3 s = vec3(sx - si * 0.143, p.y - (1.34 - len), p.z - 0.87 - 0.012 * sin(p.y * 7.0 + si * 2.0));
    float strip = sdRBox(s, vec3(0.064, len, 0.007), 0.005);
    add(d, max(strip, win2 - 0.02), 9.0);
  }

  // ---- hopper machine ----
  bb = sdBox(p - vec3(2.7, 3.65, -0.72), vec3(1.78, 5.0, 1.3));
  if (bb > 0.1) d = min(d, bb); else {
    vec3 h = p - vec3(2.7, 1.0, -1.36);
    float body = sdRBox(h, vec3(1.65, 2.3, 0.64), 0.07);
    float seam = min(max(abs(p.x - 2.66) - 0.007, -0.735 - p.z), max(abs(p.y - 1.62) - 0.007, -0.735 - p.z));
    // louvres above the screen
    vec3 lv = p - vec3(3.49, 2.42, -0.72); lv.y = repLim(lv.y, 0.115, -3.0, 3.0);
    float louvre = sdBox(lv, vec3(0.56, 0.03, 0.09));
    body = max(body, -min(seam, louvre));
    add(d, body, 11.0);
    // screen: bakelite bezel, dished glass
    vec3 s = p - SCR;
    float bezel = sdRBox(s, vec3(0.66, 0.6, 0.075), 0.07);
    float recess = sdRBox(s - vec3(0, 0, 0.08), vec3(0.535, 0.475, 0.07), 0.11);
    add(d, max(bezel, -recess), 12.0);
    add(d, max(sdEllipsoid(s - vec3(0, 0, -0.1), vec3(0.9, 0.8, 0.16)), sdRBox(s, vec3(0.535, 0.475, 0.3), 0.11)), 26.0);
    // indicator lamps in chrome rings
    vec3 led = p - vec3(SCR.x, SCR.y + 0.79, -0.715); led.x = repLim(led.x - 0.15, 0.3, -2.0, 1.0);
    add(d, sdEllipsoid(led, vec3(0.045, 0.045, 0.035)), 24.0);
    add(d, sdTorus(led.xzy, 0.052, 0.012), 4.0);
    // rivets down both sides and under the top
    vec3 rv = p - vec3(2.7, 0.0, -0.722); rv.x = abs(rv.x) - 1.55; rv.y = repLim(rv.y - 0.12, 0.31, -1.0, 10.0);
    float riv = sdEllipsoid(rv, vec3(0.024, 0.024, 0.014));
    vec3 rh = p - vec3(0.0, 3.2, -0.722); rh.x = repLim(rh.x - 1.2, 0.31, 0.0, 10.0);
    riv = min(riv, sdEllipsoid(rh, vec3(0.024, 0.024, 0.014)));
    add(d, riv, 11.0);
    // spout hood: a canopy open to the front and below
    vec3 q = p - HOOD;
    float hood = sdRBox(q, vec3(0.8, 0.5, 0.52), 0.05);
    hood = max(hood, -sdBox(q - vec3(0, -0.14, 0.14), vec3(0.68, 0.46, 0.5)));
    add(d, hood, q.y < 0.3 && abs(q.x) < 0.69 && q.z > -0.37 ? 10.0 : 27.0);
    // brass edging round the mouth
    float lip = max(abs(sdBox2(q.xy - vec2(0, -0.14), vec2(0.7, 0.47))) - 0.03, abs(q.z - 0.53) - 0.014);
    add(d, max(lip, -q.y - 0.5), 8.0);
    // rubber flaps hanging in the mouth
    float fx = q.x, fi = floor(fx / 0.17 + 0.5);
    float fl = 0.1 + 0.035 * hash1(fi + 9.0);
    vec3 f = vec3(fx - fi * 0.17, q.y - (0.32 - fl), q.z - 0.47 - 0.01 * sin(fi * 3.0));
    add(d, max(sdRBox(f, vec3(0.078, fl, 0.006), 0.004), abs(q.x) - 0.68), 9.0);
    // feed duct going up to the letter room
    vec3 du = p - vec3(1.745, 5.6, -0.5);
    float duct = sdCyl(du, 0.36, 2.94);
    float ring = max(abs(length(du.xz) - 0.375) - 0.03, abs(repLim(du.y - 0.3, 0.95, -4.0, 4.0)) - 0.035);
    add(d, min(duct, ring), 28.0);
    // collar where the duct meets the hood
    add(d, sdRCyl(p - vec3(1.745, 2.72, -0.5), 0.44, 0.05, 0.02), 8.0);
  }

  // ---- wall dressing ----
  bb = p.z + 1.55;
  if (bb > 0.1) d = min(d, bb); else {
    // steam pipe, copper pipe, flanges, brackets
    float pipe = length(vec2(p.y - 3.95, p.z + 2.03)) - 0.09;
    float fl = max(length(vec2(p.y - 3.95, p.z + 2.03)) - 0.135, abs(repLim(p.x - 0.4, 1.9, -5.0, 5.0)) - 0.03);
    pipe = min(pipe, fl);
    float vert = max(length(vec2(p.x + 1.75, p.z + 2.03)) - 0.075, p.y - 3.95);
    vert = min(vert, max(length(vec2(p.x + 1.75, p.z + 2.03)) - 0.11, abs(abs(p.y - 1.9) - 0.42) - 0.03));
    add(d, min(pipe, vert), 13.0);
    add(d, length(vec2(p.y - 3.66, p.z + 2.1)) - 0.04, 22.0);
    vec3 bk = p - vec3(0.0, 3.82, -2.14); bk.x = repLim(bk.x - 1.35, 1.9, -5.0, 5.0);
    add(d, sdRBox(bk, vec3(0.03, 0.26, 0.06), 0.008), 3.0);
    // valve wheel, painted red
    vec3 v = p - vec3(-1.75, 1.9, -1.8);
    float wheel = sdTorus(v.xzy, 0.17, 0.022);
    wheel = min(wheel, min(sdCapsule(v, vec3(-0.17, 0, 0), vec3(0.17, 0, 0), 0.015), sdCapsule(v, vec3(0, -0.17, 0), vec3(0, 0.17, 0), 0.015)));
    add(d, wheel, 29.0);
    add(d, min(sdCapsule(v, vec3(0, 0, -0.16), vec3(0, 0, 0.03), 0.028), sdRCyl(v.xzy - vec3(0, 0.03, 0), 0.045, 0.015, 0.005)), 8.0);
    // clock
    vec3 c = p - CLOCK;
    add(d, sdTorus(c.xzy - vec3(0, 0.05, 0), 0.265, 0.032), 8.0);
    add(d, sdRCyl(c.xzy - vec3(0, 0.02, 0), 0.262, 0.022, 0.006), 21.0);
    // poster and its tape
    vec3 po = p - POSTER; po.xy = rot(0.06) * po.xy;
    float curl = 0.05 * smoothstep(0.15, 0.5, po.x - po.y * 0.8) * smoothstep(0.0, 0.5, po.x - po.y);
    add(d, sdRBox(po - vec3(0, 0, curl * 0.5), vec3(0.46, 0.34, 0.003), 0.002) * 0.8, 19.0);
    add(d, sdRBox(po - vec3(-0.02, 0.33, 0.006), vec3(0.11, 0.045, 0.002), 0.001), 30.0);
    // PACKING plate
    float fr; float pl = plate(p - SIGN_PACK, vec2(1.047, 0.297), fr); add(d, pl, fr > 0.5 ? 8.0 : 18.0);
    // fairy lights
    float fb = sdBox2(p.xy - vec2(-0.65, 3.15), vec2(1.72, 0.42));
    if (fb > 0.1) d = min(d, fb); else {
      float wy = fairyY(p.x);
      add(d, (length(vec2(p.y - wy, p.z + 2.09)) - 0.008) * 0.7, 17.0);
      float bi = floor(p.x / 0.43 + 0.5), bx = bi * 0.43;
      vec3 bq = p - vec3(bx, fairyY(bx) - 0.07, -2.07);
      add(d, sdEllipsoid(bq, vec3(0.034, 0.05, 0.034)), 40.0 + mod(bi + 40.0, 4.0));
      add(d, sdCyl(bq - vec3(0, 0.05, 0), 0.02, 0.02), 17.0);
    }
  }

  // ---- pendant lamp ----
  bb = sdBox(p - vec3(-0.727, 5.3, 0.25), vec3(0.5, 3.3, 0.5));
  if (bb > 0.1) d = min(d, bb); else {
    vec3 q = p - LAMP - vec3(0, 0.06, 0);
    float shade = abs(sdCapCone(q, 0.17, 0.44, 0.085)) - 0.007;
    shade = max(shade, -0.162 - q.y);
    add(d, shade, sdCapCone(q, 0.17, 0.44, 0.085) < 0.0 ? 15.0 : 14.0);
    add(d, sdTorus(q - vec3(0, -0.162, 0), 0.435, 0.012), 14.0);
    add(d, sdRCyl(q - vec3(0, 0.22, 0), 0.07, 0.06, 0.015), 8.0);
    add(d, sdCapsule(p, LAMP + vec3(0, 0.3, 0), LAMP + vec3(0, 6.0, 0), 0.012), 17.0);
    add(d, sdSphere(p - LAMP - vec3(0, 0.02, 0), 0.06), 16.0);
  }
  return d;
}

void shade(float id, vec3 p, inout vec3 n, inout Mat m) {
  if (id < 1.5) {                                    // belt
    matRubber(m, n, p, srgb(0.085, 0.09, 0.10));
    float worn = (1.0 - smoothstep(0.0, 0.35, abs(p.z))) * fbm(p.xz * vec2(1.3, 30.0));
    m.rough = 0.5 + 0.3 * fbm(p.xz * 9.0) - 0.18 * worn; m.col *= 1.0 + 0.5 * worn;
    return;
  }
  if (id < 2.5) { matMetal(m, n, p, 0, vec3(1, 0, 0)); float grime = (1.0 - smoothstep(-0.24, -0.05, p.y)) * fbm3(p * 9.0); m.col *= 1.0 - 0.55 * grime; m.rough += 0.3 * grime; return; }
  if (id < 3.5) { matPaint(m, n, p, srgb(0.10, 0.12, 0.16), 0.5, 0.7, srgb(0.42, 0.40, 0.38), 1.0); return; }
  if (id < 4.5) { matMetal(m, n, p, 3, vec3(1, 0, 0)); m.rough += 0.12; return; }
  if (id < 5.5) {
    matBrick(m, n, p, p.xy, srgb(0.11, 0.155, 0.30), 0.42);
    float damp = (1.0 - smoothstep(-1.2, 0.2, p.y + 0.5 * fbm(p.xy * 0.8))); m.col *= 1.0 - 0.5 * damp; m.rough -= 0.25 * damp;
    float soot = smoothstep(3.2, 4.6, p.y + 0.4 * fbm(p.xy * 1.3)); m.col *= 1.0 - 0.45 * soot;
    return;
  }
  if (id < 6.5) { matConcrete(m, n, p, srgb(0.20, 0.20, 0.215)); return; }
  if (id < 7.5) {                                    // cabinet: old red lacquer over wood, worn at the edges
    float edge = smoothstep(0.80, 0.93, max(abs(p.z) / 0.95, abs(p.y - CAB.y) / 1.525));
    matPaint(m, n, p, srgb(0.42, 0.045, 0.04), 0.8, 0.3 + 0.35 * edge, srgb(0.42, 0.28, 0.16), 0.0);
    float plank = abs(fract(p.x * 2.3 + 0.2) - 0.5); m.col *= 0.82 + 0.18 * smoothstep(0.0, 0.03, plank);
    m.col *= 0.8 + 0.3 * fbm3(p * vec3(2.0, 0.5, 2.0));
    return;
  }
  if (id < 8.5) { matMetal(m, n, p, 1, vec3(1, 0, 0)); return; }
  if (id < 9.5) { matRubber(m, n, p, srgb(0.035, 0.036, 0.04)); m.rough = 0.42; m.coat = 0.25; return; }
  if (id < 10.5) { m.col = srgb(0.02, 0.02, 0.024); m.rough = 0.9; return; }   // inside the cabinet and hood
  if (id < 11.5 || (id > 26.5 && id < 27.5)) {       // hopper enamel
    vec3 col = srgb(0.19, 0.33, 0.34);
    if (p.y < -0.2) col = srgb(0.10, 0.12, 0.15);
    if (id > 26.5) {                                // hood: cream, with a hazard band along its lower front edge
      col = srgb(0.80, 0.74, 0.60);
      vec3 q = p - HOOD;
      if (q.z > 0.5 && q.y > 0.36) { float st = step(0.5, fract((q.x + q.y) * 3.2)); col = mix(srgb(0.06, 0.06, 0.065), srgb(0.85, 0.60, 0.10), st); }
    }
    matPaint(m, n, p, col, 0.75, id > 26.5 ? 0.5 : 0.38, srgb(0.36, 0.33, 0.30), 1.0);
    float streak = smoothstep(0.55, 0.9, fbm(vec2(p.x * 9.0, p.y * 0.7))) * (1.0 - smoothstep(1.0, 3.3, p.y));
    m.col *= 1.0 - 0.3 * streak; m.rough += 0.2 * streak;
    return;
  }
  if (id < 12.5) { matPlastic(m, n, p, srgb(0.045, 0.04, 0.038), 0.7); return; }                 // bakelite bezel
  if (id < 13.5) { matPaint(m, n, p, srgb(0.16, 0.19, 0.25), 0.4, 0.75, srgb(0.30, 0.16, 0.10), 0.6); return; }
  if (id < 14.5) { matPaint(m, n, p, srgb(0.05, 0.25, 0.17), 0.9, 0.3, srgb(0.1, 0.1, 0.11), 1.0); return; }   // lamp shade outside
  if (id < 15.5) { m.col = srgb(0.93, 0.90, 0.82) * (0.85 + 0.2 * fbm3(p * 14.0)); m.rough = 0.35; m.coat = 0.5; return; }   // shade inside
  if (id < 16.5) { m.col = vec3(0.0); m.glow = vec3(1.0, 0.72, 0.36) * 28.0; return; }             // bulb
  if (id < 17.5) { matRubber(m, n, p, srgb(0.03, 0.03, 0.033)); m.rough = 0.5; return; }
  if (id < 18.5) {                                   // enamel plate: deep navy, glossy, a little chipped at the edges
    matPaint(m, n, p, srgb(0.055, 0.085, 0.18), 1.0, 0.22, srgb(0.08, 0.07, 0.07), 1.0);
    return;
  }
  if (id < 19.5) { matPaper(m, n, p, 0, srgb(0.86, 0.82, 0.70)); m.col *= 0.9 + 0.12 * fbm3(p * 5.0); return; }
  if (id < 21.5) {                                   // clock face
    vec2 q = p.xy - CLOCK.xy; float r = length(q), a = atan(q.x, q.y);
    vec3 c = srgb(0.90, 0.88, 0.80);
    float tick = step(0.2, r) * step(r, 0.235) * step(abs(fract(a / TAU * 12.0 + 0.5) - 0.5), 0.045);
    float hands = min(sdSeg2(q, vec2(0), 0.21 * vec2(sin(-0.52), cos(-0.52))) - 0.008, sdSeg2(q, vec2(0), 0.14 * vec2(sin(-0.6), cos(-0.6))) - 0.012);
    hands = min(hands, r - 0.022);
    c = mix(c, srgb(0.05, 0.05, 0.06), max(tick, 1.0 - smoothstep(0.0, 0.004, hands)));
    m.col = c * (0.9 + 0.1 * fbm3(p * 20.0)); m.rough = 0.25; m.coat = 0.8;
    return;
  }
  if (id < 22.5) { matMetal(m, n, p, 4, vec3(1, 0, 0)); return; }
  if (id < 24.5) { m.col = srgb(0.10, 0.02, 0.02); m.rough = 0.08; m.coat = 1.0; m.coatRough = 0.03; return; }      // indicator lenses, unlit
  if (id < 25.5) { m.col = srgb(0.07, 0.045, 0.02); m.rough = 0.06; m.coat = 1.0; m.coatRough = 0.03; return; }     // status lens, unlit
  if (id < 26.5) {                                   // CRT glass: nearly black, faint phosphor glow so the drawn face sits in light
    m.col = srgb(0.012, 0.016, 0.014); m.rough = 0.05; m.coat = 1.0; m.coatRough = 0.025;
    m.emit = vec3(1.0, 0.62, 0.25) * 0.006;
    return;
  }
  if (id < 28.5) { matMetal(m, n, p, 0, vec3(0, 1, 0)); float sm = fbm3(p * 3.0); m.col *= 0.55 + 0.4 * sm; m.rough += 0.2; return; }   // galvanised duct
  if (id < 29.5) { matPaint(m, n, p, srgb(0.55, 0.05, 0.04), 0.8, 0.5, srgb(0.2, 0.2, 0.2), 1.0); return; }
  if (id < 30.5) { m.col = srgb(0.78, 0.70, 0.48); m.rough = 0.35; m.coat = 0.3; return; }                       // masking tape
  // fairy lights
  float k = id - 40.0;
  vec3 c = k < 0.5 ? vec3(1.0, 0.16, 0.08) : k < 1.5 ? vec3(1.0, 0.62, 0.12) : k < 2.5 ? vec3(0.12, 0.9, 0.25) : vec3(0.15, 0.4, 1.0);
  m.col = c * 0.2; m.rough = 0.15; m.coat = 1.0; m.emit = c * 1.4; m.glow = c * 5.0;
}
