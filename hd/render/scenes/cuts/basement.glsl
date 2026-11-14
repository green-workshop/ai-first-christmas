// The basement where the player works: one set, four stills. BEAT picks the still:
//  0 intro-8a  Christmas Eve: the elf at the review desk, Father Christmas coming down the stairs with a laptop under his arm
//  1 intro-8b  he stands at the foot of the stairs, holding the laptop, looking at the elf
//  2 intro-8c  he sits behind a crate at the right of the desk, typing, seen from behind the lid
//  3 epi-3     the other end of the room in January: moonlight on an empty patch of floor, him asleep on his desk, the elf with a box
// World: floor y = 0, back wall z = -4. Orthographic camera, 12 degrees down: 62.5 px a unit in the intro, 71.43 in the epilogue.
// A point (x, y, z) lands at  sx = 800 + k x,  sy = 500 - k (0.97815 y - 0.20791 z - U0)  with k, U0 = 62.5, 5.63 (intro) / 71.43, 3.366 (epi).
// --D MASK=1 renders only the blank surfaces, each in its own flat colour, for measuring their rectangles.
//@ w=1600 h=1000 spp=260 ortho=8 pos=0,9.896,19.475 tgt=0,4.906,-4 aperture=0.1 focus=21.7 exposure=2.3 tile=128
//@shot intro-8a BEAT=0
//@shot intro-8b BEAT=1
//@shot intro-8c BEAT=2
//@shot epi-3 BEAT=3 ortho=7 pos=0,7.581,19.475 tgt=0,2.591,-4 focus=18.5
// the sacks dropping in (intro scene 8): the corner under the chute with nothing in it yet, and each sack by itself (matte = its
// material ids, for mattes.mjs). Crops of the intro-8a frame; hd-intro.js lays them back over it.
// him coming down the stairs (intro scene 8): the stairs with nobody on them, him alone with no stairs in the way, and (the
// same crop again) the stringer nearer the camera, to go back over his boots. Then him again at three points on the way down
// (w1..w3, with no bin in the way either), so the light on him changes as he comes into the lamp; and the bin, cut out of 8a,
// to go back over him where he passes behind it
// (x8-nofc is wide enough to take in the shadow he throws on the wall from the top stair: it must go when he does)
//@shot x8-nofc BEAT=0 NOFC=1 crop=960,0,640,700
//@shot x8-fc-cut BEAT=0 NOSTAIRS=1 crop=1140,0,460,700 mattein=(mid>199.5&&mid<229.5)||(mid>25.5&&mid<28.5)
//@shot x8-rail-cut BEAT=0 NOFC=1 crop=960,0,640,700 mattein=mid>20.1&&mid<20.4 copy=x8-nofc
//@shot x8-w1-cut BEAT=0 NOSTAIRS=1 NOBIN=1 WALK=1 crop=960,0,640,900 mattein=(mid>199.5&&mid<229.5)||(mid>25.5&&mid<28.5)
//@shot x8-w2-cut BEAT=0 NOSTAIRS=1 NOBIN=1 WALK=2 crop=960,0,640,900 mattein=(mid>199.5&&mid<229.5)||(mid>25.5&&mid<28.5)
//@shot x8-w3-cut BEAT=0 NOSTAIRS=1 NOBIN=1 WALK=3 crop=960,0,640,900 mattein=(mid>199.5&&mid<229.5)||(mid>25.5&&mid<28.5)
// him again at each of the four points with a leg lifted (FC_STEP 1 the leg at screen left, 2 at screen right), so the film can
// step him down the stairs; tight crops, he is all that is cut out of them
//@shot x8-a-s1-cut BEAT=0 NOSTAIRS=1 NOBIN=1 FC_STEP=1 crop=1208,0,380,584 mattein=(mid>199.5&&mid<229.5)||(mid>25.5&&mid<28.5)
//@shot x8-a-s2-cut BEAT=0 NOSTAIRS=1 NOBIN=1 FC_STEP=2 crop=1208,0,380,584 mattein=(mid>199.5&&mid<229.5)||(mid>25.5&&mid<28.5)
//@shot x8-w1-s1-cut BEAT=0 NOSTAIRS=1 NOBIN=1 WALK=1 FC_STEP=1 crop=1112,128,380,596 mattein=(mid>199.5&&mid<229.5)||(mid>25.5&&mid<28.5)
//@shot x8-w1-s2-cut BEAT=0 NOSTAIRS=1 NOBIN=1 WALK=1 FC_STEP=2 crop=1112,128,380,596 mattein=(mid>199.5&&mid<229.5)||(mid>25.5&&mid<28.5)
//@shot x8-w2-s1-cut BEAT=0 NOSTAIRS=1 NOBIN=1 WALK=2 FC_STEP=1 crop=1020,264,380,596 mattein=(mid>199.5&&mid<229.5)||(mid>25.5&&mid<28.5)
//@shot x8-w2-s2-cut BEAT=0 NOSTAIRS=1 NOBIN=1 WALK=2 FC_STEP=2 crop=1020,264,380,596 mattein=(mid>199.5&&mid<229.5)||(mid>25.5&&mid<28.5)
//@shot x8-w3-s1-cut BEAT=0 NOSTAIRS=1 NOBIN=1 WALK=3 FC_STEP=1 crop=956,288,380,596 mattein=(mid>199.5&&mid<229.5)||(mid>25.5&&mid<28.5)
//@shot x8-w3-s2-cut BEAT=0 NOSTAIRS=1 NOBIN=1 WALK=3 FC_STEP=2 crop=956,288,380,596 mattein=(mid>199.5&&mid<229.5)||(mid>25.5&&mid<28.5)
//@shot x8-bin-cut BEAT=0 mattein=(mid>20.9&&mid<25.5)||(mid>44.5&&mid<45.5)||(mid>99.5&&mid<106.5)||(mid>6.5&&mid<7.5) copy=intro-8a
//@shot x8-nosacks BEAT=0 NOSACKS=1 crop=0,500,540,500
//@shot x8-solo0 BEAT=0 SOLO=0 crop=0,500,540,500 matte=15,17
//@shot x8-solo1 BEAT=0 SOLO=1 crop=0,500,540,500 matte=15,17
//@shot x8-solo2 BEAT=0 SOLO=2 crop=0,500,540,500 matte=15,17
//@shot x8-solo3 BEAT=0 SOLO=3 crop=0,500,540,500 matte=15,17
//@shot x8-solo4 BEAT=0 SOLO=4 crop=0,500,540,500 matte=15,17
#ifndef BEAT
#define BEAT 0
#endif
#if BEAT == 3
#define EPI
#endif

// ---- Father Christmas's pose for each beat (L and R are screen left and screen right) ----
// NB as rendered, NEGATIVE yaw turns his head to screen left and NEGATIVE nod bows it forward.
#define FC_CUSTOM
#if BEAT == 0          // coming down the stairs, the laptop tucked under his arm, looking down at the elf
#define FC_LEGS
const float FC_YAW = -0.7, FC_ROLL = -0.06, FC_NOD = -0.16; const vec2 FC_BROW = vec2(0.03, 0.03); const vec2 FC_BROWR = vec2(0.0, 0.0); const int FC_EYES = 0; const vec2 FC_LOOK = vec2(-0.03, -0.02);
const vec3 FC_EL = vec3(-1.65, 0.85, 0.3), FC_HL = vec3(-1.8, -0.3, 0.75), FC_ER = vec3(1.9, 0.9, 0.35), FC_HR = vec3(1.75, -0.45, 0.75);
#elif BEAT == 1        // standing, the laptop held in both hands, looking at the elf
#define FC_LEGS
const float FC_YAW = -0.55, FC_ROLL = -0.04, FC_NOD = -0.05; const vec2 FC_BROW = vec2(0.05, 0.05); const vec2 FC_BROWR = vec2(0.0, 0.0); const int FC_EYES = 0; const vec2 FC_LOOK = vec2(-0.035, 0.0);
const vec3 FC_EL = vec3(-1.6, 0.8, 0.45), FC_HL = vec3(-0.75, 0.1, 1.2), FC_ER = vec3(1.9, 0.8, 0.45), FC_HR = vec3(1.35, 0.1, 1.2);
#elif BEAT == 2        // typing
const float FC_YAW = -0.08, FC_ROLL = -0.03, FC_NOD = -0.2; const vec2 FC_BROW = vec2(-0.03, -0.03); const vec2 FC_BROWR = vec2(0.1, 0.1); const int FC_EYES = 1; const vec2 FC_LOOK = vec2(0.0, -0.035);
const vec3 FC_EL = vec3(-1.5, 0.8, 0.55), FC_HL = vec3(-0.5, 0.2, 1.0), FC_ER = vec3(1.5, 0.8, 0.55), FC_HR = vec3(0.5, 0.26, 1.02);
#else                  // asleep: the whole puppet is tipped 65 degrees forward over the desk (see bsFC), forehead on his folded arms
const float FC_YAW = -0.25, FC_ROLL = 0.15, FC_NOD = -0.08; const vec2 FC_BROW = vec2(0.0, 0.0); const vec2 FC_BROWR = vec2(-0.1, -0.1); const int FC_EYES = 2; const vec2 FC_LOOK = vec2(0.0);
const vec3 FC_EL = vec3(-1.6, 2.45, 1.14), FC_HL = vec3(-0.1, 2.99, 1.39), FC_ER = vec3(1.6, 2.45, 1.14), FC_HR = vec3(0.2, 3.34, 1.25);
#endif
//@include models/fc.glsl
//@include models/elf.glsl
//@include models/dino.glsl

#define STEPK 0.8
#define TMAX 70.0
#define STEPS 260
#ifndef MASK
#ifdef EPI
#define FOG 0.011
#define FOG_LIGHT 0
#else
#define FOG 0.004
#define FOG_LIGHT 0
#define FOG_LIGHT2 1
#endif
#endif

// ---- the set ----
const float WALLZ = -4.0, BRK = 0.42;
const vec3 WARM = vec3(1.0, 0.72, 0.42), COLD = vec3(0.4, 0.55, 1.0);
#ifdef EPI
const float PIPEY = 9.25, DTOP = 2.6, DLS = 2.0, DLHX = -0.45, LEAN = 1.134;
const vec3 LAMP = vec3(-0.27, 8.3, -1.0);
const vec3 FCP = vec3(4.7, DTOP + 0.3, -2.2);
const vec3 ELFP = vec3(-0.88, 0.0, 3.6);
const vec3 EHL = vec3(-0.78, 0.72, 0.22), EHR = vec3(0.78, 0.72, 0.22);
const float EEYES = 1.0;
const vec3 DLP = vec3(8.8, DTOP, 0.2);
const vec3 WIN = vec3(-7.56, 7.59, WALLZ); const vec2 WINH = vec2(1.45, 0.95);
const vec2 SIGN = vec2(-5.67, 5.64), SIGNH = vec2(1.33, 0.42);
const vec3 BOX = vec3(1.05, 0.0, 3.5);
const vec3 MUG = vec3(0.75, DTOP, 1.3);
// tickets on the desk: x, z, turn
const vec3 TK0 = vec3(1.5, 0.3, 0.3), TK1 = vec3(2.3, 2.0, -0.5), TK2 = vec3(1.7, 1.2, 1.0), TK3 = vec3(3.1, 2.25, 0.2), TK4 = vec3(7.0, 1.8, 0.4),
  TK5 = vec3(7.7, 0.5, -0.3), TK6 = vec3(6.5, 2.3, -0.8), TK7 = vec3(8.2, 2.2, 0.15), TK8 = vec3(0.6, 2.2, -0.2);
#else
const float PIPEY = 12.45, DTOP = 3.2, DLS = 1.0, DLHX = 0.4;
const vec3 LAMP = vec3(-3.1, 11.0, -0.6);
const vec3 ELFP = vec3(-3.44, 2.0, -2.95);
const vec3 EHL = vec3(-0.62, 1.42, 1.0), EHR = vec3(0.62, 1.42, 1.0);
const float EEYES = 0.0;
const vec3 DLP = vec3(-5.0, DTOP, -1.3);
const vec3 MON = vec3(0.0, 4.98, -1.3);
const float CHX = -9.6, CHZ = -2.6;
const vec3 BIN = vec3(10.9, 2.1, -0.25), BINH = vec3(2.8, 2.1, 1.05);
const vec3 DINO = vec3(11.6, 3.7, -0.3);
const vec3 CR = vec3(5.3, 1.0, 0.3);
const vec2 SDIR = vec2(0.5547, 0.8321), SNRM = vec2(-0.8321, 0.5547);
#if BEAT == 0
#ifdef WALK            // on his way down (the film's cut-outs): 1 half way down the stairs, 2 at their foot, 3 stepped out to where 8b has him
const vec3 FCP = WALK == 1 ? vec3(7.8, 5.3, -2.75) : WALK == 2 ? vec3(6.3, 3.05, -2.75) : vec3(5.3, 3.05, -0.8);
#else
const vec3 FCP = vec3(9.3, 7.55, -2.75);
#endif
#elif BEAT == 1
const vec3 FCP = vec3(5.3, 3.05, -0.8);
#else
const vec3 FCP = vec3(5.3, 2.0, -1.3);
#endif
#endif

// Never more than three lights, so the tracer samples every one of them at every bounce.
#define NL 3
Light getLight(int i) {
#ifdef MASK
  return omni(vec3(0.0, 50.0, 0.0), 1.0, vec3(0.0));
#else
#ifdef EPI
  if (i == 0) return spot(WIN + vec3(0.0, 0.0, 0.9), 0.45, COLD * 450.0, vec3(-5.6, 0.0, 0.3), 28.0, 44.0);        // the moon through the window: the shaft in the haze
  if (i == 1) return spot(vec3(-5.6, 21.0, 12.0), 1.2, COLD * 6000.0, vec3(-5.6, 0.0, 0.0), 15.5, 21.0);         // the same moonlight from far off, so the patch is evenly lit
  return omni(DLP + DLS * vec3(DLHX, 1.0, 0.0), 0.17, WARM * 80.0);                                                // the desk lamp
#else
  if (i == 0) return spot(LAMP, 0.12, WARM * 950.0, LAMP + vec3(0.2, -9.0, -0.5), 24.0, 46.0);                    // the green pendant
  if (i == 1) return spot(vec3(15.5, 15.0, 5.0), 0.8, vec3(1.0, 0.82, 0.6) * 2600.0, vec3(7.0, 1.5, -1.5), 16.0, 30.0);   // light from the door at the top of the stairs
  return omni(DLP + DLS * vec3(DLHX, 1.0, 0.0), 0.085, WARM * 10.0);                                               // the desk lamp
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
  return vec3(0.85, 0.86, 1.0) * 0.14 * f * f + vec3(0.35, 0.48, 0.95) * 0.1 * (0.65 + 0.35 * rd.y);
#else
  return vec3(1.0, 0.86, 0.72) * 0.2 * f * f + vec3(0.35, 0.48, 0.95) * 0.19 * (0.65 + 0.35 * rd.y);
#endif
#endif
}

// world -> Father Christmas's own space
vec3 bsFC(vec3 p) {
  vec3 v = p - FCP;
#ifdef EPI
  v.yz = rot(LEAN) * v.yz;
#endif
  return v;
}
#ifndef EPI
vec3 bsDino(vec3 p) { vec3 q = p - DINO; q.xy = rot(0.3) * q.xy; return q / 1.5; }
#endif

// the pendant: green enamel shade, brass cap, bulb underneath (from the studio set)
void bsPendant(vec3 p, vec3 L, inout float d) {
  float bb = sdBox(p - vec3(L.x, L.y + 3.0, L.z), vec3(1.0, 3.6, 1.0));
  if (bb > 0.15) { d = min(d, bb); return; }
  vec3 q = p - L - vec3(0.0, 0.12, 0.0);
  float cone = sdCapCone(q, 0.32, 0.84, 0.17);
  add(d, max(abs(cone) - 0.013, -0.295 - q.y), cone < 0.0 ? 9.0 : 8.0);
  add(d, sdTorus(q - vec3(0.0, -0.3, 0.0), 0.83, 0.022), 8.0);
  add(d, sdRCyl(q - vec3(0.0, 0.43, 0.0), 0.13, 0.11, 0.025), 7.0);
  add(d, sdCapsule(p, L + vec3(0.0, 0.6, 0.0), L + vec3(0.0, 6.4, 0.0), 0.022), 11.0);
#ifdef EPI
  add(d, sdSphere(p - L - vec3(0.0, 0.03, 0.0), 0.11), 44.0);
#else
  add(d, sdSphere(p - L - vec3(0.0, 0.03, 0.0), 0.11), 10.0);
#endif
}
// a small green desk lamp, foot at the origin, the shade hung out to one side
void bsDeskLamp(vec3 q, float hx, inout float d, float sc) {
  float bb = sdBox(q - vec3(hx * 0.5, 0.7, 0.0), vec3(0.9, 0.8, 0.55));
  if (bb > 0.15) { d = min(d, bb * sc); return; }
  add(d, sdRCyl(q - vec3(0.0, 0.05, 0.0), 0.36, 0.05, 0.02) * sc, 8.0);
  float arm = sdCapsule(q, vec3(0.0, 0.08, 0.0), vec3(0.0, 1.0, 0.0), 0.035);
  arm = min(arm, sdCapsule(q, vec3(0.0, 1.0, 0.0), vec3(hx, 1.42, 0.0), 0.035));
  add(d, arm * sc, 7.0);
  vec3 h = q - vec3(hx, 1.2, 0.0);
  float cone = sdCapCone(h, 0.17, 0.46, 0.2);
  add(d, max(abs(cone) - 0.014, -0.155 - h.y) * sc, cone < 0.0 ? 9.0 : 8.0);
  add(d, sdSphere(h - vec3(0.0, -0.2, 0.0), 0.07) * sc, 42.0);
}
// a plank desk: centre x, half width, height of the top, back and front edges
void bsDesk(vec3 p, float cx, float hw, float top, float zb, float zf, inout float d) {
  float zc = 0.5 * (zb + zf), hz = 0.5 * (zf - zb);
  float bb = sdBox(p - vec3(cx, top * 0.5, zc), vec3(hw + 0.1, top * 0.5 + 0.1, hz + 0.1));
  if (bb > 0.15) { d = min(d, bb); return; }
  float slab = sdRBox(p - vec3(cx, top - 0.11, zc), vec3(hw, 0.11, hz), 0.035);
  float carc = sdRBox(p - vec3(cx, (top - 0.2) * 0.5, zc), vec3(hw - 0.16, (top - 0.2) * 0.5, hz - 0.12), 0.025);
  float s = (top - 0.2) / 4.0;
  float gy = p.y - s * clamp(floor(p.y / s + 0.5), 1.0, 3.0);
  carc = max(carc, -max(abs(gy) - 0.016, zf - 0.155 - p.z));
  add(d, min(slab, carc), 6.0);
}
// an enamel plate with a raised brass frame, facing +z (from the belt bay, larger)
float bsPlate(vec3 q, vec2 h, out float isFrame) {
  float body = sdRBox(q, vec3(h, 0.02), 0.015);
  float fr = max(abs(sdBox2(q.xy, h - 0.05) - 0.03) - 0.025, abs(q.z - 0.02) - 0.018);
  isFrame = fr < body ? 1.0 : 0.0;
  vec3 s = q; s.xy = abs(s.xy) - (h - 0.14);
  float screw = sdEllipsoid(s - vec3(0.0, 0.0, 0.03), vec3(0.035, 0.035, 0.02));
  if (screw < min(body, fr)) isFrame = 1.0;
  return min(min(body, fr), screw);
}
#ifdef EPI
void bsTicket(vec3 p, vec3 k, inout float d) {
  vec3 q = p - vec3(k.x, DTOP + 0.012, k.y); q.xz = rot(k.z) * q.xz;
  add(d, sdBox(q, vec3(0.32, 0.005, 0.22)) - 0.004, 35.0);
}
float bsBand(vec3 p, vec3 k) { vec2 q = rot(k.z) * (p.xz - k.xy); return abs(q.x) < 0.34 && abs(q.y) < 0.24 && q.y < -0.11 ? 1.0 : 0.0; }
#endif
#ifndef EPI
// a hessian sack stuffed with letters, base on y = 0, about 2.3 across and 2.5 tall. part: 0 hessian, 1 the tie, 2 letters
float bsSack(vec3 s, float seed, out float part) {
  float body = sdEllipsoid(s - vec3(0.0, 1.05, 0.0), vec3(1.15, 1.15, 1.0));
  body = smin(body, sdEllipsoid(s - vec3(0.0, 0.5, 0.0), vec3(1.25, 0.6, 1.05)), 0.3);
  body = smin(body, sdCone(s, vec3(0.0, 1.85, 0.0), vec3(0.06, 2.45, 0.0), 0.46, 0.62), 0.35);
  body = smax(body, -sdCone(s, vec3(0.04, 2.2, 0.0), vec3(0.08, 3.0, 0.0), 0.4, 0.62), 0.06);
  body = max(body, -s.y);
  body -= 0.08 * (fbm3(s * 1.7 + seed) - 0.5) + 0.005 * sin(s.x * 60.0) * sin(s.y * 60.0);
  body *= 0.7;
  float tie = sdTorus(s - vec3(0.02, 1.98, 0.0), 0.5, 0.055);
  vec3 l1 = s - vec3(-0.18, 2.55, 0.08); l1.xy = rot(0.4) * l1.xy; l1.xz = rot(0.3) * l1.xz;
  vec3 l2 = s - vec3(0.24, 2.5, -0.06); l2.xy = rot(-0.45) * l2.xy;
  vec3 l3 = s - vec3(0.02, 2.4, 0.26); l3.xy = rot(0.1) * l3.xy; l3.yz = rot(0.3) * l3.yz;
  float let = min(sdBox(l1, vec3(0.36, 0.26, 0.012)), min(sdBox(l2, vec3(0.36, 0.26, 0.012)), sdBox(l3, vec3(0.36, 0.26, 0.012)))) - 0.006;
  part = 0.0; if (tie < body && tie < let) part = 1.0; else if (let < body) part = 2.0;
  return min(body, min(tie, let));
}
// k = x, z, size, turn
void bsSackAt(vec3 p, vec4 k, inout float d) {
  vec3 s = (p - vec3(k.x, 0.0, k.y)) / k.z; s.xz = rot(k.w) * s.xz;
  float part; float ds = bsSack(s, k.w * 7.0 + 2.0, part) * k.z;
  add(d, ds, part < 0.5 ? 15.0 : (part < 1.5 ? 16.0 : 17.0));
}
// a letter on the floor: k = x, z, turn, how far one edge is propped up
void bsLetter(vec3 p, vec4 k, inout float d) {
  vec3 q = p - vec3(k.x, 0.022 + 0.42 * abs(sin(k.w)), k.y); q.xz = rot(k.z) * q.xz; q.xy = rot(k.w) * q.xy;
  add(d, sdBox(q, vec3(0.42, 0.006, 0.28)) - 0.006, 17.0);
}
#endif

float map(vec3 p) {
  float d = 1e9; gM = 0.0; float bb;
  float wz = p.z - WALLZ;
  // ---- room ----
  float bid; float mortar = brickPattern(p.xy * BRK, bid);
  add(d, wz + 0.024 * mortar - 0.01 * bid, 1.0);
  add(d, p.y - 0.006 * noise(p.xz * 1.5), 2.0);

  // ---- pipes under the ceiling ----
  bb = wz - 0.85;
  if (bb > 0.15) d = min(d, bb); else {
    float pr = length(vec2(p.y - PIPEY, wz - 0.42));
    float pipe = min(pr - 0.2, max(pr - 0.28, abs(repLim(p.x - 1.3, 4.6, -4.0, 4.0)) - 0.06));
    pipe = min(pipe, length(vec2(p.y - PIPEY + 0.62, wz - 0.3)) - 0.11);
    add(d, pipe, 3.0);
    add(d, length(vec2(p.y - PIPEY + 1.0, wz - 0.2)) - 0.055, 4.0);
    vec3 bk = vec3(repLim(p.x + 1.0, 4.6, -4.0, 4.0), p.y - PIPEY + 0.35, wz - 0.1);
    add(d, sdRBox(bk, vec3(0.05, 0.78, 0.1), 0.015), 5.0);
#ifdef EPI
    // a pipe down the wall with a valve wheel
    float vr = length(vec2(p.x - 1.9, wz - 0.3));
    float vert = max(vr - 0.12, p.y - PIPEY);
    vert = min(vert, max(vr - 0.18, abs(abs(p.y - 4.5) - 0.6) - 0.05));
    add(d, vert, 3.0);
    vec3 v = p - vec3(1.9, 4.5, WALLZ + 0.72);
    float wheel = sdTorus(v.xzy, 0.3, 0.035);
    wheel = min(wheel, min(sdCapsule(v, vec3(-0.3, 0.0, 0.0), vec3(0.3, 0.0, 0.0), 0.024), sdCapsule(v, vec3(0.0, -0.3, 0.0), vec3(0.0, 0.3, 0.0), 0.024)));
    add(d, wheel, 43.0);
    add(d, sdCapsule(v, vec3(0.0, 0.0, -0.3), vec3(0.0, 0.0, 0.05), 0.045), 7.0);
    // the window: steel frame, four panes, snow on the sill
    vec3 w = p - WIN;
    float frame = max(sdRBox(w, vec3(WINH + 0.26, 0.2), 0.04), -sdBox(w, vec3(WINH, 0.5)));
    frame = min(frame, min(sdBox(w, vec3(0.055, WINH.y, 0.07)), sdBox(w, vec3(WINH.x, 0.055, 0.07))));
    frame = min(frame, sdRBox(w - vec3(0.0, -WINH.y - 0.36, 0.1), vec3(WINH.x + 0.45, 0.09, 0.3), 0.03));
    add(d, frame, 30.0);
    add(d, sdBox(w - vec3(0.0, 0.0, 0.06), vec3(WINH, 0.015)), 31.0);
    float snow = sdEllipsoid(w - vec3(-0.4, -WINH.y - 0.22, 0.18), vec3(1.3, 0.2, 0.2));
    snow = smin(snow, sdEllipsoid(w - vec3(0.8, -WINH.y - 0.24, 0.16), vec3(0.9, 0.15, 0.2)), 0.1);
    add(d, snow - 0.012 * noise(p * 14.0), 32.0);
    // the blank sign: a sheet of card taped up under the window
    vec3 s = vec3(p.xy - SIGN, wz);
    add(d, sdBox(s - vec3(0.0, 0.0, 0.03), vec3(SIGNH, 0.008)), 33.0);
    add(d, sdRBox(s - vec3(0.15, SIGNH.y, 0.045), vec3(0.3, 0.1, 0.004), 0.003), 34.0);
#endif
  }

  bsPendant(p, LAMP, d);
  { vec3 q = (p - DLP) / DLS; bsDeskLamp(q, DLHX, d, DLS); }

#ifdef EPI
  // ---- his desk, the chair behind it, what is on it ----
  bsDesk(p, 4.9, 5.07, DTOP, -1.0, 2.6, d);
  {
    vec3 c = p - vec3(4.7, DTOP + 1.2, -3.35);
    bb = sdBox(c, vec3(2.1, 2.1, 0.5));
    if (bb > 0.15) d = min(d, bb); else {
      float back = sdRBox(c, vec3(1.9, 1.9, 0.18), 0.5);
      vec2 g = vec2(c.x, c.y); g.x += 0.3 * step(1.0, mod(floor(g.y / 0.6), 2.0));
      vec2 cell = vec2(repLim(g.x, 0.6, -3.0, 3.0), repLim(g.y, 0.6, -3.0, 3.0));
      float tuft = length(cell);
      back += 0.05 * exp(-tuft * tuft * 22.0) * step(0.0, c.z) - 0.02 * (1.0 - exp(-tuft * tuft * 5.0)) * step(0.0, c.z);
      add(d, back * 0.8, 39.0);
      add(d, sdEllipsoid(vec3(cell, c.z - 0.15), vec3(0.045, 0.045, 0.03)), 7.0);
    }
  }
  bb = sdBox(p - vec3(4.9, DTOP + 0.4, 0.8), vec3(5.2, 0.5, 2.0));
  if (bb > 0.15) d = min(d, bb); else {
    bsTicket(p, TK0, d); bsTicket(p, TK1, d); bsTicket(p, TK2, d); bsTicket(p, TK3, d); bsTicket(p, TK4, d);
    bsTicket(p, TK5, d); bsTicket(p, TK6, d); bsTicket(p, TK7, d); bsTicket(p, TK8, d);
    vec3 m = p - MUG;
    float mug = max(sdRCyl(m - vec3(0.0, 0.31, 0.0), 0.27, 0.31, 0.04), -sdCyl(m - vec3(0.0, 0.4, 0.0), 0.225, 0.3));
    vec3 hn = m - vec3(-0.3, 0.31, 0.0);
    mug = min(mug, max(length(vec2(length(hn.xy) - 0.16, hn.z)) - 0.04, hn.x - 0.06));
    add(d, mug, 36.0);
    add(d, sdCyl(m - vec3(0.0, 0.5, 0.0), 0.23, 0.01), 37.0);
  }
  {
    // two tickets stuck to the front of the desk
    vec3 q = p - vec3(2.4, 1.5, 2.495); q.xy = rot(0.12) * q.xy;
    add(d, sdBox(q, vec3(0.32, 0.22, 0.005)) - 0.004, 35.0);
    q = p - vec3(7.4, 1.8, 2.495); q.xy = rot(-0.09) * q.xy;
    add(d, sdBox(q, vec3(0.32, 0.22, 0.005)) - 0.004, 35.0);
  }
  // ---- the elf's box of belongings ----
  {
    vec3 q = p - BOX;
    bb = sdBox(q - vec3(0.0, 0.95, 0.0), vec3(1.5, 1.15, 1.2));
    if (bb > 0.15) d = min(d, bb); else {
      float box = max(sdRBox(q - vec3(0.0, 0.55, 0.0), vec3(0.95, 0.55, 0.65), 0.02), -sdBox(q - vec3(0.0, 0.7, 0.0), vec3(0.91, 0.6, 0.61)));
      vec3 f = vec3(q.x, q.y - 1.1, abs(q.z) - 0.65); f.yz = rot(0.7) * f.yz;
      box = min(box, sdBox(f - vec3(0.0, 0.22, 0.0), vec3(0.93, 0.22, 0.012)) - 0.006);
      vec3 g = vec3(abs(q.x) - 0.95, q.y - 1.1, q.z); g.xy = rot(-0.8) * g.xy;
      box = min(box, sdBox(g - vec3(0.0, 0.22, 0.0), vec3(0.012, 0.22, 0.63)) - 0.006);
      add(d, box, 38.0);
      add(d, sdRCyl(q - vec3(-0.45, 0.85, 0.05), 0.24, 0.3, 0.03), 41.0);                          // a pot plant
      vec3 lf = q - vec3(-0.45, 1.45, 0.05);
      float leaf = sdEllipsoid(lf - vec3(-0.16, 0.12, 0.0), vec3(0.13, 0.36, 0.07));
      leaf = min(leaf, sdEllipsoid(lf - vec3(0.14, 0.2, 0.05), vec3(0.12, 0.42, 0.07)));
      leaf = min(leaf, sdEllipsoid(lf - vec3(0.0, 0.05, 0.12), vec3(0.11, 0.3, 0.07)));
      add(d, leaf, 40.0);
      add(d, sdCapsule(q, vec3(0.5, 0.5, -0.2), vec3(0.78, 1.75, -0.32), 0.1), 17.0);               // a rolled drawing
      vec3 bk = q - vec3(0.2, 1.05, 0.2); bk.xy = rot(0.15) * bk.xy;
      add(d, sdRBox(bk, vec3(0.24, 0.34, 0.07), 0.02), 24.0);                                      // a red book
    }
  }
#else
  // ---- the elf's desk, the monitor, the stool ----
  bsDesk(p, -1.78, 3.78, DTOP, -2.2, 0.0, d);
  add(d, sdRCyl(p - vec3(ELFP.x, 1.0, ELFP.z), 0.6, 1.0, 0.05), 20.0);
  {
    vec3 m = p - MON;
    bb = sdBox(m - vec3(0.0, -0.3, 0.0), vec3(2.0, 1.9, 0.7));
    if (bb > 0.15) d = min(d, bb); else {
      float body = sdRBox(m, vec3(1.8, 1.4, 0.16), 0.09);
      body = max(body, -sdRBox(m - vec3(0.0, 0.04, 0.2), vec3(1.6, 1.15, 0.08), 0.03));
      body = min(body, sdRBox(m - vec3(0.0, -1.55, -0.1), vec3(0.3, 0.25, 0.08), 0.03));
      body = min(body, sdEllipsoid(m - vec3(0.0, -1.76, 0.0), vec3(0.95, 0.07, 0.5)));
      add(d, body, 18.0);
      add(d, sdBox(m - vec3(0.0, 0.04, 0.11), vec3(1.6, 1.15, 0.012)), 19.0);
    }
  }
  // ---- the letter chute ----
  {
    vec3 c = p - vec3(CHX, 0.0, CHZ);
    bb = sdBox(c - vec3(0.0, 12.4, 0.1), vec3(2.3, 4.2, 1.8));
    if (bb > 0.15) d = min(d, bb); else {
      float duct = sdRBox(c - vec3(0.0, 13.2, 0.0), vec3(1.8, 4.0, 1.4), 0.05);
      duct = min(duct, sdRBox(vec3(c.x, repLim(c.y - 10.72, 2.1, 0.0, 2.0), c.z), vec3(1.87, 0.07, 1.47), 0.03));
      vec3 rv = vec3(abs(c.x) - 1.6, repLim(c.y - 9.75, 0.6, 0.0, 9.0), c.z - 1.4);
      duct = min(duct, sdEllipsoid(rv, vec3(0.045, 0.045, 0.03)));
      add(d, duct, 12.0);
      vec3 l = c - vec3(0.0, 8.95, 0.1);
      float lip = max(sdRBox(l, vec3(2.1, 0.42, 1.6), 0.06), -sdBox(l - vec3(0.0, -0.3, 0.0), vec3(1.95, 0.5, 1.45)));
      add(d, lip, abs(l.x) < 1.96 && abs(l.z) < 1.46 && l.y < 0.21 ? 45.0 : 13.0);
      float fr; float pl = bsPlate(c - vec3(0.0, 11.76, 1.42), vec2(1.38, 0.45), fr); add(d, pl, fr > 0.5 ? 7.0 : 14.0);
    }
  }
  // ---- sacks of letters under it, and the ones that fell out ----
  // For the film, where they drop out of the chute one at a time: NOSACKS leaves the sacks and the loose letters out (the floor
  // before any has fallen), SOLO n (0..4, back row first) leaves just that sack, to be cut out and dropped in by the game.
#ifndef NOSACKS
  bb = sdBox(p - vec3(-8.85, 2.0, -1.8), vec3(3.7, 2.2, 2.5));
  if (bb > 0.15) d = min(d, bb); else {
#ifdef SOLO
    vec4 sk = SOLO == 0 ? vec4(-9.9, -2.7, 1.3, 0.3) : SOLO == 1 ? vec4(-7.6, -2.8, 1.25, -0.4) : SOLO == 2 ? vec4(-10.9, -1.0, 1.0, 0.9) : SOLO == 3 ? vec4(-8.75, -0.8, 1.05, -0.2) : vec4(-6.8, -1.1, 0.95, 0.5);
    bsSackAt(p, sk, d);
#else
    bsSackAt(p, vec4(-9.9, -2.7, 1.3, 0.3), d); bsSackAt(p, vec4(-7.6, -2.8, 1.25, -0.4), d);
    bsSackAt(p, vec4(-10.9, -1.0, 1.0, 0.9), d); bsSackAt(p, vec4(-8.75, -0.8, 1.05, -0.2), d); bsSackAt(p, vec4(-6.8, -1.1, 0.95, 0.5), d);
#endif
  }
#ifndef SOLO
  bb = sdBox(p - vec3(-9.3, 0.3, 2.2), vec3(3.6, 0.5, 2.2));
  if (bb > 0.15) d = min(d, bb); else {
    bsLetter(p, vec4(-11.6, 1.5, 0.5, 0.0), d); bsLetter(p, vec4(-10.3, 2.8, -0.3, 0.0), d); bsLetter(p, vec4(-9.3, 1.3, 1.0, 0.0), d);
    bsLetter(p, vec4(-8.2, 2.3, 0.2, 0.0), d); bsLetter(p, vec4(-7.2, 1.2, -0.7, 0.0), d); bsLetter(p, vec4(-6.7, 2.6, 0.45, 0.0), d);
    bsLetter(p, vec4(-12.2, 3.6, -0.2, 0.0), d); bsLetter(p, vec4(-8.9, 3.9, 0.9, 0.0), d); bsLetter(p, vec4(-10.0, 0.45, 0.2, 0.5), d);
  }
#endif
#endif
  // ---- the stairs: two stringers, open treads, a handrail on the near side ----
  // (NOSTAIRS leaves them out, for photographing him alone to be cut out and walked down them by the film. The stringer nearer
  // the camera has an id of its own, 20.25, shaded like the rest: a matte of it is laid back over him so his boots go behind it.)
#ifndef NOSTAIRS
  {
    vec2 r = p.xy - vec2(6.3, 0.0); float along = dot(r, SDIR), perp = dot(r, SNRM), sz = p.z + 2.75;
    bb = max(max(abs(perp - 0.75) - 1.2, abs(sz) - 1.35), -along - 0.8);
    if (bb > 0.15) d = min(d, bb); else {
      float ar = along - 1.0817 * clamp(floor(along / 1.0817 + 0.5), 1.0, 15.0);
      vec2 w = ar * SDIR + perp * SNRM;
      float st = sdRBox(vec3(w, sz), vec3(0.4, 0.07, 1.2), 0.02);
      st = min(st, sdRBox(vec3(along - 8.2, perp + 0.05, abs(sz) - 1.0), vec3(8.9, 0.25, 0.06), 0.02));
      float ap = along - 1.0817 - 3.2451 * clamp(floor((along - 1.0817) / 3.2451 + 0.5), 0.0, 4.0);
      vec2 wp = ap * SDIR + perp * SNRM;
      st = min(st, sdRBox(vec3(wp.x, wp.y - 1.45, sz + 1.12), vec3(0.06, 1.45, 0.06), 0.02));
      st = min(st, sdRBox(vec3(along - 8.2, perp - 1.609, sz + 1.12), vec3(8.9, 0.07, 0.07), 0.03));
      add(d, st, 20.0);
      add(d, sdRBox(vec3(along - 8.2, perp + 0.05, sz - 1.0), vec3(8.9, 0.25, 0.06), 0.02) - 0.0006, 20.25);
    }
  }
#endif
  // ---- the rejects bin and the broken toys in it ----
  // (NOBIN leaves it out: he goes down behind it, and a cut-out of him must be whole; the film lays the bin back over him)
#ifndef NOBIN
  {
    vec3 b = p - BIN;
    bb = sdBox(b - vec3(0.0, 1.0, 0.0), vec3(3.0, 3.4, 1.3));
    if (bb > 0.15) d = min(d, bb); else {
      float shell = max(sdRBox(b, BINH, 0.06), -sdBox(b - vec3(0.0, 0.4, 0.0), BINH - vec3(0.1, 0.0, 0.1)));
      shell = min(shell, max(abs(sdBox2(b.xz, BINH.xz - 0.02)) - 0.09, abs(b.y - BINH.y) - 0.07) - 0.02);
      shell = min(shell, sdRBox(vec3(abs(b.x) - 2.62, b.y, b.z - BINH.z), vec3(0.09, 1.9, 0.07), 0.03));
      add(d, shell, 21.0);
      add(d, sdBox(b - vec3(0.0, 1.5, 0.0), vec3(2.68, 0.2, 0.93)) - 0.03 * noise(p * 5.0), 45.0);
      float fr; float pl = bsPlate(p - vec3(10.5, 3.0, BIN.z + BINH.z + 0.02), vec2(1.9, 0.45), fr); add(d, pl, fr > 0.5 ? 7.0 : 22.0);
      // a kite with a snapped spar
      vec3 k = p - vec3(10.45, 5.1, -0.75); k.xy = rot(0.45) * k.xy; k.yz = rot(0.2) * k.yz;
      float rh = (abs(k.x) * 0.8 + abs(k.y) * 0.55 - 0.44) / 0.971;
      add(d, max(rh, abs(k.z) - 0.015) - 0.006, 24.0);
      add(d, min(sdCapsule(k, vec3(0.0, -1.3, 0.03), vec3(0.0, 0.8, 0.03), 0.03), sdCapsule(k, vec3(-0.55, 0.0, 0.03), vec3(0.3, 0.0, 0.03), 0.03)), 25.0);
      // a teddy bear's arm
      vec3 t = p - vec3(12.3, 3.7, 0.15);
      float arm = smin(sdCone(t, vec3(0.0), vec3(0.3, 1.25, 0.1), 0.34, 0.3), sdSphere(t - vec3(0.34, 1.4, 0.12), 0.36), 0.15);
      add(d, (arm - 0.02 * (noise(p * 34.0) - 0.5)) * 0.8, 23.0);
      // the dinosaur, dumped on its side
      float dg = 1e9; float gs = gM; mGift(bsDino(p), dg); float gid = gM; gM = gs; add(d, dg * 1.5, gid);
    }
  }
#endif
#if BEAT == 2
  // ---- the crate he uses for a desk ----
  {
    vec3 c = p - CR;
    bb = sdBox(c, vec3(2.15, 1.1, 0.85));
    if (bb > 0.15) d = min(d, bb); else {
      float cr = sdRBox(c, vec3(2.0, 1.0, 0.7), 0.03);
      cr = max(cr, -max(abs(repLim(c.x, 0.8, -2.0, 2.0)) - 0.016, 0.67 - c.z));
      cr = min(cr, sdRBox(vec3(c.x, abs(c.y) - 0.76, c.z - 0.72), vec3(2.03, 0.17, 0.04), 0.015));
      cr = min(cr, sdRBox(vec3(abs(c.x) - 1.86, c.y, c.z - 0.72), vec3(0.17, 0.6, 0.04), 0.015));
      add(d, cr, 29.0);
    }
  }
#endif
#endif

  // ---- the cast ----
  mElf(p - ELFP, d, EHL, EHR, EEYES, 0.0);
#ifndef NOFC
  vec3 f = bsFC(p);
  mFC(f, d);
#ifndef EPI
  // his laptop
  bb = sdBox(f - vec3(0.6, 0.4, 1.3), vec3(2.2, 1.4, 1.2));
  if (bb > 0.15) d = min(d, bb); else {
#if BEAT == 0
    vec3 q = f - vec3(1.75, 0.2, 0.9); q.xy = rot(0.12) * q.xy;
    add(d, sdRBox(q, vec3(0.85, 0.6, 0.05), 0.03), 26.0);
    add(d, sdRCyl((q - vec3(0.0, 0.0, 0.051)).xzy, 0.14, 0.004, 0.003), 28.0);
#elif BEAT == 1
    vec3 q = f - vec3(0.3, 0.15, 1.3); q.yz = rot(-0.2) * q.yz;
    add(d, sdRBox(q, vec3(0.95, 0.65, 0.05), 0.03), 26.0);
    add(d, sdRCyl((q - vec3(0.0, 0.0, 0.051)).xzy, 0.15, 0.004, 0.003), 28.0);
#else
    add(d, sdRBox(f - vec3(0.0, 0.045, 1.45), vec3(1.0, 0.04, 0.5), 0.03), 26.0);
    vec3 q = f - vec3(0.0, 0.07, 1.97); q.yz = rot(0.18) * q.yz;
    float lid = sdRBox(q - vec3(0.0, 0.7, 0.0), vec3(1.0, 0.7, 0.025), 0.022);
    add(d, lid, q.z < 0.0 && abs(q.x) < 0.9 && abs(q.y - 0.7) < 0.6 ? 27.0 : 26.0);
    add(d, sdRCyl((q - vec3(0.0, 0.75, 0.026)).xzy, 0.15, 0.004, 0.003), 28.0);
    add(d, sdCapsule(f, vec3(-0.85, 0.07, 1.97), vec3(0.85, 0.07, 1.97), 0.04), 18.0);
#endif
  }
#endif
#endif
  return d;
}

void shade(float id, vec3 p, inout vec3 n, inout Mat m) {
#ifdef MASK
  m.col = vec3(0.0); m.rough = 1.0;
  if (id > 13.5 && id < 14.5) m.emit = vec3(0.45, 0.0, 0.0);
  if (id > 18.5 && id < 19.5) m.emit = vec3(0.0, 0.45, 0.0);
  if (id > 21.5 && id < 22.5) m.emit = vec3(0.0, 0.0, 0.45);
  if (id > 32.5 && id < 33.5) m.emit = vec3(0.45, 0.45, 0.0);
  return;
#else
  if (id > 229.5) { shElf(id, p - ELFP, n, m); return; }
  if (id > 199.5) { shFC(id, bsFC(p), n, m); return; }
#ifndef EPI
  if (id > 99.5) { shGift(id, bsDino(p), n, m); return; }
#endif
  if (id < 1.5) {                                    // painted brick: damp at the foot, soot under the pipes
    matBrick(m, n, p * BRK, p.xy * BRK, srgb(0.11, 0.155, 0.30), 0.42);
    float damp = 1.0 - smoothstep(0.0, 2.2, p.y + 0.8 * fbm(p.xy * 0.5)); m.col *= 1.0 - 0.45 * damp; m.rough -= 0.25 * damp;
    float soot = smoothstep(PIPEY - 2.2, PIPEY + 0.3, p.y + 0.6 * fbm(p.xy * 0.8)); m.col *= 1.0 - 0.45 * soot;
    return;
  }
  if (id < 2.5) { matConcrete(m, n, p * 0.5, srgb(0.21, 0.21, 0.225)); return; }
  if (id < 3.5) { matPaint(m, n, p * 0.6, srgb(0.16, 0.19, 0.25), 0.4, 0.75, srgb(0.30, 0.16, 0.10), 0.6); return; }
  if (id < 4.5) { matMetal(m, n, p, 4, vec3(1, 0, 0)); return; }
  if (id < 5.5) { matMetal(m, n, p, 2, vec3(1, 0, 0)); return; }
  if (id < 6.5) {                                    // the desks: walnut planks, lacquered and a bit worn
    float s = (DTOP - 0.2) / 4.0, bi = floor(p.y / s + 0.5);
    matWood(m, n, p * vec3(0.3, 2.2, 2.2) + vec3(bi * 3.7, 3.0, 1.0), vec3(1.0, 0.02, 0.03), 0.72, 0.6);
    m.col *= 0.84 + 0.3 * hash1(bi + 2.0);
    return;
  }
  if (id < 7.5) { matMetal(m, n, p, 1, vec3(1, 0, 0)); return; }
  if (id < 8.5) { matPaint(m, n, p, srgb(0.05, 0.27, 0.17), 0.9, 0.3, srgb(0.1, 0.1, 0.11), 1.0); return; }
  if (id < 9.5) { m.col = srgb(0.93, 0.90, 0.82) * (0.85 + 0.2 * fbm3(p * 9.0)); m.rough = 0.35; m.coat = 0.5; return; }
  if (id < 10.5) { m.col = vec3(0.0); m.glow = vec3(1.0, 0.72, 0.36) * 28.0; return; }
  if (id < 11.5) { matRubber(m, n, p, srgb(0.03, 0.03, 0.033)); m.rough = 0.5; return; }
#ifndef EPI
  if (id < 12.5) {                                   // the chute: grey-blue enamelled steel, streaked
    matPaint(m, n, p * 0.6, srgb(0.27, 0.33, 0.42), 0.6, 0.45, srgb(0.36, 0.33, 0.30), 1.0);
    float streak = smoothstep(0.5, 0.9, fbm(vec2(p.x * 5.0, p.y * 0.4))); m.col *= 1.0 - 0.3 * streak; m.rough += 0.2 * streak;
    return;
  }
  if (id < 13.5) {                                   // its lip: hazard stripes
    float u = p.z > CHZ + 1.68 ? p.x : p.z;
    float st = step(0.5, fract((u + p.y) * 1.25));
    matPaint(m, n, p * 0.6, mix(srgb(0.06, 0.06, 0.065), srgb(0.88, 0.62, 0.10), st), 0.6, 0.5, srgb(0.36, 0.33, 0.30), 1.0);
    return;
  }
  if (id < 14.5) { matPaint(m, n, p * 0.5, srgb(0.86, 0.80, 0.66), 0.5, 0.0, vec3(0.3), 0.0); return; }             // BLANK plate on the chute
#endif
  if (id < 15.5) {                                   // hessian
    float w = 0.5 + 0.5 * sin(p.x * 46.0) * sin(p.y * 46.0);
    m.col = srgb(0.66, 0.48, 0.27) * (0.62 + 0.45 * w) * (0.8 + 0.4 * fbm3(p * 2.5)); m.rough = 0.95; m.sheen = 0.5; m.sheenCol = srgb(1.0, 0.85, 0.6);
    n = normalize(n + 0.45 * (hash3(p * 300.0) - 0.5));
    return;
  }
  if (id < 16.5) { m.col = srgb(0.42, 0.26, 0.13) * (0.8 + 0.3 * noise(p * 50.0)); m.rough = 0.9; return; }
  if (id < 17.5) { matPaper(m, n, p, 0, srgb(0.93, 0.90, 0.82)); m.col *= 0.86 + 0.14 * hash1(floor(p.x * 1.7) + 7.0 * floor(p.z * 1.3)); return; }   // letters
  if (id < 18.5) { matPlastic(m, n, p, srgb(0.055, 0.055, 0.065), 0.5); return; }
  if (id < 19.5) {                                   // BLANK monitor screen: dark, a little dull so it carries no reflections, faintly alive
    m.col = srgb(0.02, 0.03, 0.05); m.rough = 0.35; m.coat = 0.2; m.coatRough = 0.3; m.emit = vec3(0.2, 0.34, 0.8) * 0.03;
    return;
  }
  if (id < 20.5) {                                   // stairs: pine, grain along each piece
    vec3 al = abs(n.z) > 0.6 || abs(n.x * 0.83 - n.y * 0.55) > 0.8 ? vec3(0.5547, 0.8321, 0.0) : vec3(0.0, 0.0, 1.0);
    matWood(m, n, p * 1.3, al, 0.3, 0.25); m.col *= srgb(1.0, 0.82, 0.62);
    return;
  }
#ifndef EPI
  if (id < 21.5) {                                   // the bin: brushed steel, grimy low down
    matMetal(m, n, p * 0.5, 0, vec3(1, 0, 0)); m.col *= srgb(0.52, 0.56, 0.66);
    float grime = (1.0 - smoothstep(0.2, 2.6, p.y)) * fbm3(p * 4.0); m.col *= 1.0 - 0.5 * grime; m.rough += 0.25 + 0.3 * grime;
    return;
  }
  if (id < 22.5) { matPaint(m, n, p * 0.5, srgb(0.86, 0.80, 0.66), 0.5, 0.0, vec3(0.3), 0.0); return; }             // BLANK plate on the bin
#endif
  if (id < 23.5) { matFelt(m, n, p, srgb(0.42, 0.24, 0.11)); return; }
  if (id < 24.5) { matPaper(m, n, p, 3, srgb(0.72, 0.08, 0.07)); return; }
  if (id < 25.5) { matWood(m, n, p * 2.0, vec3(0.3, 1.0, 0.0), 0.15, 0.2); return; }
  if (id < 26.5) { matMetal(m, n, p * 0.6, 0, vec3(1, 0, 0)); m.col = srgb(0.70, 0.71, 0.74) * (0.92 + 0.1 * noise(p * 300.0)); m.rough = 0.36; return; }   // aluminium
  if (id < 27.5) { m.col = srgb(0.02, 0.025, 0.035); m.rough = 0.12; m.coat = 1.0; m.emit = vec3(0.62, 0.78, 1.0) * 5.0; return; }      // his screen, lit
  if (id < 28.5) { matMetal(m, n, p, 3, vec3(1, 0, 0)); m.rough = 0.12; return; }
  if (id < 29.5) { matWood(m, n, p * 1.2, vec3(0.03, 1.0, 0.02), 0.22, 0.1); m.col *= 0.8 + 0.3 * hash1(floor(p.x / 0.8 + 0.5) + 4.0); return; }
#ifdef EPI
  if (id < 30.5) { matPaint(m, n, p * 0.6, srgb(0.14, 0.16, 0.20), 0.5, 0.6, srgb(0.3, 0.17, 0.1), 0.6); return; }
  if (id < 31.5) {                                   // the night outside: a crescent moon, stars, a snowy rise
    vec2 q = p.xy - WIN.xy;
    vec3 skyc = mix(vec3(0.03, 0.05, 0.13), vec3(0.01, 0.016, 0.05), sat(q.y * 0.6 + 0.5));
    float moon = (1.0 - smoothstep(0.24, 0.26, length(q - vec2(0.62, 0.36)))) * smoothstep(0.22, 0.24, length(q - vec2(0.73, 0.42)));
    float star = step(0.985, hash1(floor(q * 18.0))) * step(-0.2, q.y);
    float hill = 1.0 - smoothstep(-0.02, 0.02, q.y + 0.52 - 0.14 * sin(q.x * 1.6 + 0.8));
    m.col = vec3(0.02); m.rough = 0.08; m.coat = 1.0;
    m.emit = mix(skyc * 5.0 + vec3(1.0, 0.96, 0.85) * moon * 22.0 + vec3(0.8, 0.9, 1.0) * star * 4.0, vec3(0.30, 0.38, 0.62) * 1.6, hill);
    return;
  }
  if (id < 32.5) { matSnow(m, n, p); return; }
  if (id < 33.5) { matPaper(m, n, p, 1, srgb(0.90, 0.85, 0.72)); m.col *= 0.94 + 0.08 * fbm3(p * 2.0); return; }     // BLANK sign
  if (id < 34.5) { m.col = srgb(0.78, 0.70, 0.48); m.rough = 0.35; m.coat = 0.3; return; }
  if (id < 35.5) {                                   // tickets: card with a red band along the top edge
    matPaper(m, n, p, 1, srgb(0.93, 0.90, 0.80));
    float band = 0.0;
    if (p.z > 2.45) {
      vec2 q = p.xy - vec2(2.4, 1.5); q = rot(0.12) * q; if (abs(q.x) < 0.34 && abs(q.y) < 0.24 && q.y > 0.11) band = 1.0;
      q = p.xy - vec2(7.4, 1.8); q = rot(-0.09) * q; if (abs(q.x) < 0.34 && abs(q.y) < 0.24 && q.y > 0.11) band = 1.0;
    } else band = max(max(max(bsBand(p, TK0), bsBand(p, TK1)), max(bsBand(p, TK2), bsBand(p, TK3))), max(max(bsBand(p, TK4), bsBand(p, TK5)), max(bsBand(p, TK6), max(bsBand(p, TK7), bsBand(p, TK8)))));
    m.col = mix(m.col, srgb(0.70, 0.10, 0.09), band);
    return;
  }
  if (id < 36.5) { matPaint(m, n, p, srgb(0.06, 0.30, 0.19), 0.9, 0.2, srgb(0.1, 0.1, 0.11), 1.0); return; }
  if (id < 37.5) { m.col = srgb(0.10, 0.05, 0.025); m.rough = 0.1; m.coat = 1.0; return; }
  if (id < 38.5) { matPaper(m, n, p, 2, srgb(0.62, 0.45, 0.27)); return; }
  if (id < 39.5) { matLeather(m, n, p * 0.7, srgb(0.16, 0.20, 0.28), 0.6); return; }
  if (id < 40.5) { m.col = mix(srgb(0.05, 0.22, 0.09), srgb(0.12, 0.40, 0.16), noise(p * 20.0)); m.rough = 0.45; m.coat = 0.3; return; }
  if (id < 41.5) { m.col = srgb(0.58, 0.27, 0.16) * (0.85 + 0.3 * noise(p * 40.0)); m.rough = 0.85; return; }
#endif
  if (id < 42.5) { m.col = vec3(0.0); m.glow = vec3(1.0, 0.72, 0.36) * 20.0; return; }
  if (id < 43.5) { matPaint(m, n, p, srgb(0.55, 0.05, 0.04), 0.8, 0.5, srgb(0.2, 0.2, 0.2), 1.0); return; }
  if (id < 44.5) { m.col = srgb(0.5, 0.5, 0.48); m.rough = 0.1; m.coat = 1.0; return; }
  m.col = srgb(0.02, 0.02, 0.024); m.rough = 0.9;                                                // inside the chute and the bin
#endif
}
