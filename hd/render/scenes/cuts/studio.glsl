// The elf's design studio at night: one set, three stills. BEAT picks the still:
//  0 intro-4a  the elf draws, Father Christmas looks on     1 intro-4b  Father Christmas types it into the laptop
//  2 epi-5     a year on: bare painted brick, the elf back on contract, the robot watching
// World: floor y = 0, back wall z = -4. The drawing board leans back 10 degrees on its easel about B0, so its sheet is still a true
// rectangle in the picture. Orthographic camera, 12 degrees down, 80.65 px a unit.
// --D MASK=1 renders only the blank sheets, each in its own flat colour and without the cast, for measuring their rectangles.
//@ w=1600 h=1000 spp=260 ortho=6.2 pos=0,8.185,19.475 tgt=0,3.195,-4 aperture=0.14 focus=21.8 exposure=2.3
//@shot intro-4a BEAT=0
//@shot intro-4b BEAT=1
//@shot epi-5 BEAT=2
#ifndef BEAT
#define BEAT 0
#endif
#if BEAT == 2
#define EPI
#endif

// ---- Father Christmas on his stool (L and R are screen left and screen right) ----
#define FC_CUSTOM
#if BEAT == 1          // head down, typing
const float FC_YAW = 0.06, FC_ROLL = -0.03, FC_NOD = 0.27; const vec2 FC_BROW = vec2(-0.03, -0.03); const vec2 FC_BROWR = vec2(0.1, 0.1); const int FC_EYES = 1; const vec2 FC_LOOK = vec2(0.0, -0.035);
const vec3 FC_EL = vec3(-1.55, 0.95, 0.5), FC_HL = vec3(-0.62, 0.56, 0.8), FC_ER = vec3(1.55, 0.95, 0.5), FC_HR = vec3(0.62, 0.62, 0.85);
#else                  // looking across at the drawing board, one hand on the lid
const float FC_YAW = 0.6, FC_ROLL = 0.05, FC_NOD = 0.0; const vec2 FC_BROW = vec2(0.06, 0.06); const vec2 FC_BROWR = vec2(-0.05, -0.05); const int FC_EYES = 0; const vec2 FC_LOOK = vec2(-0.035, 0.005);
const vec3 FC_EL = vec3(-1.6, 1.0, 0.6), FC_HL = vec3(-0.966, 1.452, 1.44), FC_ER = vec3(1.55, 0.95, 0.5), FC_HR = vec3(0.62, 0.6, 0.85);
#endif
//@include models/fc.glsl
//@include models/elf.glsl
//@include models/droid.glsl

#define STEPK 0.8
#define TMAX 60.0
#define STEPS 250
#ifndef MASK
#define FOG 0.002
#define FOG_LIGHT 0
#endif

// ---- the set ----
const float WALLZ = -4.0, PLANK = 1.25, FPL = 2.0;
const vec3 LAMP = vec3(-2.6, 9.3, 0.3);
const vec3 B0 = vec3(-2.1, 4.75, -2.6);              // middle of the drawing board
const vec3 ELF = vec3(-6.0, 0.9, -1.55);             // he stands on a crate to reach
const float EYAW = -0.45;
const vec3 TIP = vec3(-4.35, 3.83, -2.335);          // where the pencil touches the sheet
const vec3 EHAND = vec3(-4.76, 3.52, -2.0);
const vec3 FCP = vec3(5.6, 1.75, -1.8);
const vec3 DRO = vec3(2.3, 0.0, -1.4);
const float DYAW = 0.55;
const vec2 BPA = vec2(-6.97, 6.49), BPAH = vec2(1.457, 1.085);
const vec2 BPB = vec2(2.753, 7.315), BPBH = vec2(1.085, 0.824);
const vec2 BPC = vec2(5.233, 8.012), BPCH = vec2(1.085, 0.824);
const vec2 TOOLS = vec2(-6.55, 6.77);
const vec3 BENCH = vec3(6.85, 0.0, -3.0);
const vec3 WARM = vec3(1.0, 0.72, 0.42), COLD = vec3(0.4, 0.55, 1.0);

// Never more than three lights, so the tracer samples every one of them at every bounce.
#ifdef EPI
#define NL 2
#else
#define NL 3
#endif
Light getLight(int i) {
#ifdef MASK
  return omni(vec3(0.0, 50.0, 0.0), 1.0, vec3(0.0));
#else
#ifdef EPI
  if (i == 0) return spot(LAMP, 0.12, vec3(1.0, 0.78, 0.52) * 760.0, LAMP + vec3(0.4, -9.0, -1.2), 26.0, 58.0);     // the same pendant, a whiter bulb
  return spot(vec3(15.0, 9.0, 3.0), 0.9, COLD * 520.0, vec3(4.0, 2.5, -3.5), 30.0, 52.0);                          // night light from a window out of shot
#else
  if (i == 0) return spot(LAMP, 0.12, WARM * 950.0, LAMP + vec3(0.5, -9.0, -1.6), 26.0, 60.0);                      // brass pendant over the board
#if BEAT == 1
  if (i == 1) return omni(FCP + vec3(0.0, 1.05, 1.3), 0.1, vec3(0.62, 0.78, 1.0) * 9.0);                            // the laptop screen on his face
#else
  if (i == 1) return omni(FCP + vec3(0.0, 1.05, 1.3), 0.1, vec3(0.62, 0.78, 1.0) * 4.0);
#endif
  return spot(vec3(15.0, 8.5, 2.0), 0.8, COLD * 520.0, vec3(5.0, 3.0, -3.0), 30.0, 55.0);                           // night light from a window out of shot
#endif
#endif
}
// what is off the set: a soft warm bounce from the camera side (the fill) in a cold blue room
vec3 sky(vec3 rd) {
#ifdef MASK
  return vec3(0.0);
#else
  float f = max(rd.z, 0.0);
#ifdef EPI
  return vec3(0.9, 0.86, 0.84) * 0.14 * f * f + vec3(0.35, 0.48, 0.95) * 0.1 * (0.65 + 0.35 * rd.y);
#else
  return vec3(1.0, 0.86, 0.72) * 0.14 * f * f + vec3(0.35, 0.48, 0.95) * 0.08 * (0.65 + 0.35 * rd.y);
#endif
#endif
}

// world -> the drawing board's own space: x across, y up the board, z out of its face
vec3 stBoard(vec3 p) { vec3 b = p - B0; return vec3(b.x, 0.98558 * b.y - 0.16918 * b.z, 0.16918 * b.y + 0.98558 * b.z); }
vec3 stElfP(vec3 p) { vec3 e = p - ELF; e.xz = rot(EYAW) * e.xz; return e; }
vec3 stDroP(vec3 p) { vec3 e = p - DRO; e.xz = rot(DYAW) * e.xz; return e; }

void stLamp(vec3 p, vec3 L, inout float d) {
  float bb = sdBox(p - vec3(L.x, L.y + 3.0, L.z), vec3(1.0, 3.6, 1.0));
  if (bb > 0.15) { d = min(d, bb); return; }
  vec3 q = p - L - vec3(0.0, 0.12, 0.0);
  float cone = sdCapCone(q, 0.32, 0.84, 0.17);
  add(d, max(abs(cone) - 0.013, -0.295 - q.y), cone < 0.0 ? 26.0 : 11.0);
  add(d, sdTorus(q - vec3(0.0, -0.3, 0.0), 0.83, 0.022), 11.0);
  add(d, sdRCyl(q - vec3(0.0, 0.43, 0.0), 0.13, 0.11, 0.025), 11.0);
  add(d, sdCapsule(p, L + vec3(0.0, 0.6, 0.0), L + vec3(0.0, 6.4, 0.0), 0.022), 24.0);
  add(d, sdSphere(p - L - vec3(0.0, 0.03, 0.0), 0.11), 27.0);
}
// a sheet pinned to the wall by its top edge, the bottom lifting a little
void stPinned(vec3 p, vec2 c, vec2 h, float id, inout float d) {
  vec3 q = vec3(p.xy - c, p.z - WALLZ);
  float lift = 0.045 * sat(0.5 - 0.5 * q.y / h.y) * sat(0.5 - 0.5 * q.y / h.y);
  add(d, sdBox(q - vec3(0.0, 0.0, 0.014 + lift), vec3(h, 0.005)) * 0.8, id);
  add(d, sdSphere(q - vec3(0.0, h.y - 0.13, 0.03), 0.065), 32.0);
}

float map(vec3 p) {
  float d = 1e9; gM = 0.0; float bb;
  float wz = p.z - WALLZ;
#ifdef EPI
  float bid; float mortar = brickPattern(p.xy * 0.62, bid);
  add(d, wz + 0.02 * mortar - 0.008 * bid, 5.0);
#else
  float gx = (0.5 - abs(fract(p.x / PLANK) - 0.5)) * PLANK;                    // boards with a V joint between them
  add(d, (wz + 0.028 * (1.0 - smoothstep(0.0, 0.045, gx))) * 0.8, 5.0);
#endif
  float gz = (0.5 - abs(fract(p.z / FPL) - 0.5)) * FPL;
  add(d, (p.y + 0.012 * (1.0 - smoothstep(0.0, 0.025, gz))) * 0.9, 6.0);

  // ---- on the wall ----
  bb = wz - 1.15;
  if (bb > 0.15) d = min(d, bb); else {
    add(d, sdBox2(vec2(p.y - 0.3, wz), vec2(0.3, 0.06)) - 0.025, 9.0);          // skirting
#ifdef EPI
    // tool board: a sheet of ply with a hammer, a tenon saw and a spanner hung on it
    vec3 t = vec3(p.xy - TOOLS, wz);
    add(d, sdRBox(t - vec3(0.0, 0.0, 0.05), vec3(2.0, 1.39, 0.05), 0.02), 40.0);
    vec3 hq = t - vec3(-1.3, 0.0, 0.16);
    add(d, sdRBox(hq - vec3(0.0, -0.2, 0.0), vec3(0.065, 0.78, 0.05), 0.03), 8.0);
    add(d, sdRBox(hq - vec3(0.02, 0.62, 0.0), vec3(0.36, 0.14, 0.11), 0.03), 12.0);
    vec3 sq = t - vec3(0.15, 0.2, 0.13); sq.xy = rot(-0.12) * sq.xy;
    float blade = max(sdBox(sq - vec3(0.25, 0.0, 0.0), vec3(0.85, 0.3, 0.012)), sq.y - 0.26 + 0.16 * (sq.x + 0.6));
    add(d, blade, 12.0);
    add(d, sdRBox(sq - vec3(-0.78, 0.02, 0.0), vec3(0.22, 0.3, 0.055), 0.05), 8.0);
    vec3 wq = t - vec3(1.42, -0.05, 0.13);
    float span = sdRBox(wq, vec3(0.055, 0.6, 0.022), 0.015);
    span = min(span, max(sdRCyl((wq - vec3(0.0, 0.68, 0.0)).xzy, 0.19, 0.03, 0.01), -sdBox(wq - vec3(0.0, 0.84, 0.0), vec3(0.075, 0.14, 0.1))));
    span = min(span, sdRCyl((wq - vec3(0.0, -0.66, 0.0)).xzy, 0.12, 0.03, 0.01));
    add(d, span, 12.0);
    add(d, sdSphere(vec3(abs(t.x) - 1.85, abs(t.y) - 1.24, t.z - 0.1), 0.045), 11.0);    // screws
#else
    stPinned(p, BPA, BPAH, 21.0, d);
    stPinned(p, BPB, BPBH, 22.0, d);
    stPinned(p, BPC, BPCH, 23.0, d);
    // the shelf of painted blocks
    vec3 s = p - vec3(9.0, 4.35, WALLZ);
    add(d, sdRBox(s - vec3(0.0, 0.0, 0.5), vec3(1.2, 0.06, 0.5), 0.02), 9.0);
    add(d, sdRBox(vec3(abs(s.x + 0.1) - 0.75, s.y + 0.3, s.z - 0.3), vec3(0.045, 0.26, 0.28), 0.02), 9.0);
    vec3 c1 = s - vec3(-0.68, 0.42, 0.5); c1.xz = rot(0.25) * c1.xz;
    add(d, sdRBox(c1, vec3(0.36), 0.04), 41.0);
    vec3 c2 = s - vec3(-0.62, 1.06, 0.5); c2.xz = rot(-0.4) * c2.xz;
    add(d, sdRBox(c2, vec3(0.28), 0.035), 42.0);
    add(d, sdSphere(s - vec3(0.2, 0.46, 0.5), 0.4), 43.0);
    add(d, sdCapCone(s - vec3(0.86, 0.56, 0.52), 0.5, 0.36, 0.04) - 0.02, 45.0);
#endif
  }

  // ---- the easel and its board ----
  bb = sdBox(p - vec3(B0.x, 3.8, -2.7), vec3(4.0, 4.0, 1.5));
  if (bb > 0.15) d = min(d, bb); else {
    vec3 b = stBoard(p);
    add(d, sdRBox(b, vec3(3.5, 2.2, 0.07), 0.03), 47.0);                                        // the board
    add(d, sdBox(b - vec3(0.0, 0.0, 0.082), vec3(3.22, 1.95, 0.008)), 20.0);                    // the sheet
    add(d, sdRBox(b - vec3(0.0, -2.3, 0.2), vec3(3.62, 0.075, 0.3), 0.025), 7.0);               // the ledge it stands on
    add(d, sdRBox(b - vec3(0.0, -2.2, 0.47), vec3(3.62, 0.13, 0.03), 0.02), 7.0);
    float legs = sdRBox(vec3(abs(b.x) - 2.6, b.y + 1.3, b.z + 0.2), vec3(0.13, 3.75, 0.1), 0.03);
    legs = min(legs, sdRBox(b - vec3(0.0, -3.55, -0.2), vec3(2.6, 0.1, 0.07), 0.025));
    legs = min(legs, sdRBox(b - vec3(0.0, 2.32, -0.2), vec3(2.6, 0.1, 0.07), 0.025));
    legs = min(legs, sdCapsule(p, vec3(B0.x, 7.0, -3.2), vec3(B0.x, 0.0, -3.85), 0.1));         // the back leg
    add(d, legs, 7.0);
    add(d, sdSphere(vec3(abs(b.x) - 3.3, abs(b.y) - 2.0, b.z - 0.07), 0.04), 11.0);             // brass screws in the corners
    vec3 pn = b - vec3(1.9, -2.2, 0.28);
    add(d, sdCapsule(pn, vec3(-0.45, 0.0, 0.0), vec3(0.45, 0.02, 0.0), 0.035), 30.0);           // a spare pencil and a rubber on the ledge
    add(d, sdRBox(b - vec3(0.9, -2.17, 0.28), vec3(0.17, 0.055, 0.09), 0.03), 46.0);
  }

  // ---- the elf, on a crate, drawing ----
#ifndef MASK
  {
    vec3 e = stElfP(p);
    vec3 hr = EHAND - ELF; hr.xz = rot(EYAW) * hr.xz;
#ifdef EPI
    mElf(e, d, vec3(-0.74, 0.78, 0.22), hr, 0.0, 1.0);
#else
    mElf(e, d, vec3(-0.74, 0.78, 0.22), hr, 0.0, 0.0);
#endif
    vec3 pd = normalize(TIP - EHAND);
    add(d, sdCapsule(p, EHAND + pd * 0.02, TIP - pd * 0.1, 0.032), 30.0);
    add(d, sdCone(p, TIP - pd * 0.1, TIP, 0.03, 0.006), 31.0);
  }
#endif
  {
    vec3 c = p - vec3(ELF.x, 0.45, ELF.z);
    bb = sdBox(c, vec3(1.05, 0.5, 0.8));
    if (bb > 0.15) d = min(d, bb); else {
      float crate = sdRBox(c, vec3(1.0, 0.45, 0.75), 0.03);
      crate = max(crate, -max(abs(repLim(c.y, 0.3, -1.0, 1.0)) - 0.02, 0.72 - c.z));           // gaps between the slats
      add(d, crate, 8.0);
      add(d, sdSphere(vec3(abs(c.x) - 0.82, repLim(c.y, 0.3, -1.0, 1.0) - 0.15, c.z - 0.75), 0.03), 12.0);
    }
  }

#ifdef EPI
  // ---- the robot, clipboard in hand ----
#ifndef MASK
  mDroid(stDroP(p), d, 2.0);
#endif
  // ---- a low bench of half-made toys ----
  vec3 t = p - BENCH;
  bb = sdBox(t - vec3(0.0, 1.45, 0.0), vec3(2.55, 1.5, 0.85));
  if (bb > 0.15) d = min(d, bb); else {
    float bench = sdRBox(t - vec3(0.0, 2.05, 0.0), vec3(2.4, 0.09, 0.75), 0.03);
    bench = min(bench, sdRBox(vec3(abs(t.x) - 2.15, t.y - 1.0, abs(t.z) - 0.55), vec3(0.1, 1.0, 0.1), 0.02));
    bench = min(bench, sdRBox(vec3(t.x, t.y - 0.62, abs(t.z) - 0.55), vec3(2.15, 0.07, 0.05), 0.02));
    add(d, bench, 8.0);
    vec3 u = t - vec3(0.0, 2.14, 0.1);
    add(d, sdSphere(u - vec3(-1.5, 0.34, 0.0), 0.34), 41.0);                                    // a ball
    vec3 h1 = u - vec3(-0.55, 0.0, 0.0); h1.xz = rot(0.3) * h1.xz;
    add(d, sdRBox(h1 - vec3(0.0, 0.2, 0.0), vec3(0.26, 0.2, 0.26), 0.025), 42.0);               // a house without its door
    vec3 rf = h1 - vec3(0.0, 0.4, 0.0); rf.xy = rot(0.7854) * rf.xy;
    add(d, max(sdRBox(rf, vec3(0.2, 0.2, 0.27), 0.02), 0.4 - h1.y), 43.0);
    vec3 b1 = u - vec3(0.2, 0.2, 0.05); b1.xz = rot(-0.5) * b1.xz;
    add(d, sdRBox(b1, vec3(0.2), 0.03), 44.0);
    add(d, sdRBox(u - vec3(1.1, 0.28, 0.0), vec3(0.36, 0.28, 0.3), 0.03), 7.0);                 // a bare wooden body
    add(d, sdRCyl((u - vec3(1.75, 0.2, 0.26)).xzy, 0.2, 0.055, 0.02), 7.0);                     // and one of its wheels
  }
#else
  // ---- Father Christmas on a stool, the laptop on his knees ----
  vec3 f = p - FCP;
#ifndef MASK
  mFC(f, d);
  bb = sdBox(f - vec3(0.0, -0.4, 0.75), vec3(1.5, 1.5, 1.85));
  if (bb > 0.15) d = min(d, bb); else {
    // the model has no seated legs: thighs forward, shins down, boots on the floor
    vec3 lq = f; lq.x = abs(lq.x);
    float felt = 0.004 * (noise(f * 130.0) - 0.5) + 0.006 * (fbm3(f * 9.0) - 0.5);
    float leg = smin(sdCone(lq, vec3(0.5, -0.3, 0.1), vec3(0.62, -0.25, 1.4), 0.46, 0.37), sdCone(lq, vec3(0.62, -0.25, 1.4), vec3(0.62, -1.2, 1.5), 0.37, 0.33), 0.15);
    add(d, leg - felt, 200.0);
    float boot = smin(sdCone(lq, vec3(0.62, -1.12, 1.5), vec3(0.62, -1.5, 1.5), 0.36, 0.34), sdEllipsoid(lq - vec3(0.64, -1.5, 1.82), vec3(0.34, 0.25, 0.52)), 0.12);
    add(d, max(boot, -f.y - 1.75), 211.0);
    add(d, sdTorus(lq - vec3(0.62, -1.1, 1.5), 0.36, 0.09) - 0.02 * (noise(f * 30.0) - 0.5), 203.0);
  }
#endif
  bb = sdBox(f - vec3(0.0, -1.1, -0.05), vec3(1.4, 0.8, 1.4));
  if (bb > 0.15) d = min(d, bb); else {
    float stool = sdRCyl(f - vec3(0.0, -0.53, -0.05), 1.15, 0.12, 0.05);
    vec3 sq = vec3(abs(f.x), f.y, abs(f.z + 0.05));
    stool = min(stool, sdCapsule(sq, vec3(0.62, -0.6, 0.62), vec3(0.88, -1.75, 0.88), 0.09));
    stool = min(stool, sdTorus(f - vec3(0.0, -1.3, -0.05), 1.14, 0.045));
    add(d, stool, 9.0);
  }
  vec3 l = f - vec3(0.0, 0.2, 1.25);            // (the hand on its lid must stay inside the model's bounding box, z < 2)
  bb = sdBox(l - vec3(0.0, 0.7, -0.1), vec3(1.1, 0.85, 0.75));
  if (bb > 0.15) d = min(d, bb); else {
    add(d, sdRBox(l - vec3(0.0, 0.0, -0.5), vec3(1.0, 0.04, 0.5), 0.03), 10.0);
    vec3 q = l - vec3(0.0, 0.03, 0.0); q.yz = rot(0.3) * q.yz;
    float lid = sdRBox(q - vec3(0.0, 0.7, 0.0), vec3(1.0, 0.7, 0.025), 0.022);
    add(d, lid, q.z < 0.0 && abs(q.x) < 0.9 && abs(q.y - 0.7) < 0.6 ? 13.0 : 10.0);
    add(d, sdRCyl((q - vec3(0.0, 0.72, 0.026)).xzy, 0.14, 0.004, 0.003), 11.0);
    add(d, sdCapsule(l, vec3(-0.85, 0.03, 0.0), vec3(0.85, 0.03, 0.0), 0.035), 14.0);
  }
#endif

  stLamp(p, LAMP, d);
  return d;
}

void shade(float id, vec3 p, inout vec3 n, inout Mat m) {
#ifdef MASK
  m.col = vec3(0.0); m.rough = 1.0;
  if (id > 19.5 && id < 23.5) { float k = id - 20.0; m.emit = 0.45 * (k < 0.5 ? vec3(1, 0, 0) : k < 1.5 ? vec3(0, 1, 0) : k < 2.5 ? vec3(0, 0, 1) : vec3(1, 1, 0)); }
  return;
#else
#ifndef EPI
  if (shFC(id, p - FCP, n, m)) return;
#endif
  if (shElf(id, stElfP(p), n, m)) return;
  if (shDroid(id, stDroP(p), n, m)) return;
  if (id < 5.5) {
#ifdef EPI
    matBrick(m, n, p * 0.62, p.xy * 0.62, srgb(0.12, 0.165, 0.31), 0.42);
#else
    float bi = floor(p.x / PLANK);                 // warm boards, grain running up
    matWood(m, n, p * vec3(2.3, 0.3, 2.3) + vec3(bi * 3.7, bi * 1.3, 0.0), vec3(0.02, 1.0, 0.03), 0.8, 0.4);
    float gx = (0.5 - abs(fract(p.x / PLANK) - 0.5)) * PLANK;
    m.col *= (0.72 + 0.3 * hash1(bi + 2.0)) * (1.0 - 0.55 * (1.0 - smoothstep(0.0, 0.035, gx)));
#endif
    return;
  }
  if (id < 6.5) {                                    // plank floor, boards running across the picture
    float bz = p.z / FPL, bi = floor(bz);
    matWood(m, n, p * vec3(0.3, 2.4, 2.4) + vec3(bi * 5.3, 3.0, 1.0), vec3(1.0, 0.02, 0.03), 0.86, 0.28);
    m.rough = max(m.rough, 0.5); m.coatRough = 0.3;       // a worn, waxed floor: no mirror of the wall in it
    float joint = 1.0 - smoothstep(0.0, 0.03, (0.5 - abs(fract(bz) - 0.5)) * FPL);
    float bx = (p.x + 13.0 * hash1(bi + 1.0)) / 7.0; float butt = 1.0 - smoothstep(0.0, 0.015, (0.5 - abs(fract(bx) - 0.5)) * 7.0);
    m.col *= (0.8 + 0.3 * hash1(bi * 3.1 + floor(bx))) * (1.0 - 0.6 * max(joint, butt));
#ifdef EPI
    m.col = mix(m.col, vec3(lum(m.col)), 0.35) * 0.85;
#endif
    return;
  }
  if (id < 7.5) { matWood(m, n, p * vec3(2.4, 0.5, 2.4), vec3(0.03, 1.0, 0.1), 0.3, 0.6); return; }                   // easel: oiled beech
  if (id < 8.5) { matWood(m, n, p * vec3(0.5, 2.6, 2.6) + 4.0, vec3(1.0, 0.03, 0.02), 0.1, 0.15); return; }           // pine
  if (id < 9.5) { matWood(m, n, p * vec3(0.5, 2.6, 2.6) + 9.0, vec3(1.0, 0.03, 0.02), 0.95, 0.6); return; }           // dark stained wood
  if (id < 10.5) { matMetal(m, n, p * 0.6, 0, vec3(1, 0, 0)); m.col = srgb(0.70, 0.71, 0.74) * (0.92 + 0.1 * noise(p * 300.0)); m.rough = 0.36; return; }
  if (id < 11.5) { matMetal(m, n, p, 1, vec3(1, 0, 0)); return; }
  if (id < 12.5) { matMetal(m, n, p, 0, vec3(0, 1, 0)); return; }
  if (id < 13.5) { m.col = srgb(0.02, 0.025, 0.035); m.rough = 0.12; m.coat = 1.0; m.emit = vec3(0.62, 0.78, 1.0) * 2.2; return; }
  if (id < 14.5) { matPlastic(m, n, p, srgb(0.05, 0.05, 0.055), 0.4); return; }
  if (id < 23.5) {                                   // blueprint paper, blank
    matPaper(m, n, p, 0, srgb(0.10, 0.25, 0.60));
    m.col *= 0.86 + 0.26 * fbm3(p * 1.4 + id);
    return;
  }
  if (id < 24.5) { matRubber(m, n, p, srgb(0.03, 0.03, 0.033)); m.rough = 0.5; return; }
  if (id < 26.5) { m.col = srgb(0.93, 0.90, 0.82) * (0.85 + 0.2 * fbm3(p * 9.0)); m.rough = 0.35; m.coat = 0.5; return; }
  if (id < 27.5) { m.col = vec3(0.0); m.glow = vec3(1.0, 0.72, 0.36) * 28.0; return; }
  if (id < 30.5) { matPaint(m, n, p, srgb(0.90, 0.66, 0.10), 0.7, 0.3, srgb(0.7, 0.55, 0.35), 0.0); return; }         // pencil
  if (id < 31.5) { m.col = mix(srgb(0.78, 0.62, 0.42), srgb(0.08, 0.08, 0.09), step(length(p - TIP), 0.04)); m.rough = 0.6; return; }
  if (id < 32.5) { m.col = srgb(0.62, 0.05, 0.05); m.rough = 0.15; m.coat = 1.0; return; }                            // drawing pins
  if (id < 40.5) { matWood(m, n, p * vec3(0.6, 2.2, 2.2) + 2.0, vec3(1.0, 0.05, 0.0), 0.45, 0.2); m.col *= 0.8; return; }   // tool board
  if (id < 41.5) { matPaint(m, n, p, srgb(0.62, 0.07, 0.06), 0.7, 0.35, srgb(0.75, 0.6, 0.4), 0.0); return; }
  if (id < 42.5) { matPaint(m, n, p, srgb(0.90, 0.66, 0.12), 0.7, 0.35, srgb(0.75, 0.6, 0.4), 0.0); return; }
  if (id < 43.5) { matPaint(m, n, p, srgb(0.10, 0.40, 0.22), 0.7, 0.35, srgb(0.75, 0.6, 0.4), 0.0); return; }
  if (id < 44.5) { matPaint(m, n, p, srgb(0.11, 0.29, 0.62), 0.7, 0.35, srgb(0.75, 0.6, 0.4), 0.0); return; }
  if (id < 45.5) { matPaint(m, n, p, srgb(0.50, 0.56, 0.66), 0.7, 0.35, srgb(0.75, 0.6, 0.4), 0.0); return; }
  if (id < 46.5) { matRubber(m, n, p, srgb(0.80, 0.42, 0.40)); return; }                                              // the rubber
  matWood(m, n, p * vec3(0.4, 2.4, 2.4) + 6.0, vec3(1.0, 0.04, 0.02), 0.22, 0.5);                                      // the drawing board: birch ply
#endif
}
