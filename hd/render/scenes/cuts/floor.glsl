// The workshop floor kit: small sprites the game lays out itself (benches, elves, robots, the walk out, the reindeer, drones, lamps)
// and three opaque backdrops. Every sprite is its exact box in the game's units at 4 px per unit: 1 unit = 0.032 here, so 1 px = 0.008
// and ortho = height in px * 0.004. The camera is orthographic, from the front, 12 degrees down: pos = tgt + (0, 4.1582, 19.563).
// A point (x, y, z) lands at  unit x = x / 0.032,  units up from the anchor = (y * 0.97815 - z * 0.20791) / 0.032.
// KIND picks the picture:
//  0 bench (floor at y = 0, top surface at y = 2.944)      1 elf at the bench (HAM 1 = tool down, CON 1 = contractor, CARD 1 = card held up)
//  2 robot (DROID_SWING 1.0 = hammer down)                 3 laid-off elf walking out with a box (FRAME 0/1)
//  4 reindeer (GO 1 = walking with a suitcase, FRAME 0/1)  5 delivery drone (PARCEL 1)          6 pendant lamp (LIT 1)
//  7 window (opaque)                                       8 back wall (opaque)                 9 floor boards (opaque, perspective)
// The reindeer (mDeer / shDeer, ids 300..319) and the drone (mDrone / shDrone, ids 320..339) live in this file, not in models/,
// because shots.mjs renders every file in models/ as a gift unless it is listed in NOT_GIFTS.
//@shot il-bench KIND=0 w=416 h=448 ortho=1.792 pos=0,5.6606,19.2436 tgt=0,1.5024,-0.3194 alpha=1
//@shot il-elf-a KIND=1 w=360 h=624 ortho=2.496 pos=0,6.4745,19.0707 tgt=0,2.3163,-0.4923 alpha=1
//@shot il-elf-b KIND=1 HAM=1 w=360 h=624 ortho=2.496 pos=0,6.4745,19.0707 tgt=0,2.3163,-0.4923 alpha=1
//@shot il-con-a KIND=1 CON=1 w=440 h=624 ortho=2.496 pos=0,6.4745,19.0707 tgt=0,2.3163,-0.4923 alpha=1
//@shot il-con-b KIND=1 CON=1 HAM=1 w=440 h=624 ortho=2.496 pos=0,6.4745,19.0707 tgt=0,2.3163,-0.4923 alpha=1
//@shot il-con-card KIND=1 CON=1 CARD=1 w=440 h=624 ortho=2.496 pos=0,6.4745,19.0707 tgt=0,2.3163,-0.4923 alpha=1
//@shot il-droid-a KIND=2 w=432 h=388 ortho=1.552 pos=-0.128,5.5824,19.2603 tgt=-0.128,1.4242,-0.3027 alpha=1
//@shot il-droid-b KIND=2 DROID_SWING=1.0 w=432 h=388 ortho=1.552 pos=-0.128,5.5824,19.2603 tgt=-0.128,1.4242,-0.3027 alpha=1
//@shot il-walk-a KIND=3 w=400 h=680 ortho=2.72 pos=0.16,6.5058,19.064 tgt=0.16,2.3476,-0.499 alpha=1
//@shot il-walk-b KIND=3 FRAME=1 w=400 h=680 ortho=2.72 pos=0.16,6.5058,19.064 tgt=0.16,2.3476,-0.499 alpha=1
//@shot il-deer KIND=4 w=780 h=808 ortho=3.232 pos=0.72,6.944,18.9709 tgt=0.72,2.7858,-0.5921 alpha=1 spp=200
//@shot il-deer-go-a KIND=4 GO=1 w=780 h=808 ortho=3.232 pos=0.72,6.944,18.9709 tgt=0.72,2.7858,-0.5921 alpha=1 spp=200
//@shot il-deer-go-b KIND=4 GO=1 FRAME=1 w=780 h=808 ortho=3.232 pos=0.72,6.944,18.9709 tgt=0.72,2.7858,-0.5921 alpha=1 spp=200
// in-between frames, so the hammering and the reindeer's walk move instead of jumping between two pictures
// (HAMT 0..1 = how far the tool has come down, DEER_S 1..-1 = how far through its stride, DROID_SWING is already a number)
//@shot il-elf-1 KIND=1 HAMT=0.36 w=360 h=624 ortho=2.496 pos=0,6.4745,19.0707 tgt=0,2.3163,-0.4923 alpha=1
//@shot il-elf-2 KIND=1 HAMT=0.72 w=360 h=624 ortho=2.496 pos=0,6.4745,19.0707 tgt=0,2.3163,-0.4923 alpha=1
//@shot il-con-1 KIND=1 CON=1 HAMT=0.36 w=440 h=624 ortho=2.496 pos=0,6.4745,19.0707 tgt=0,2.3163,-0.4923 alpha=1
//@shot il-con-2 KIND=1 CON=1 HAMT=0.72 w=440 h=624 ortho=2.496 pos=0,6.4745,19.0707 tgt=0,2.3163,-0.4923 alpha=1
//@shot il-droid-1 KIND=2 DROID_SWING=0.36 w=432 h=388 ortho=1.552 pos=-0.128,5.5824,19.2603 tgt=-0.128,1.4242,-0.3027 alpha=1
//@shot il-droid-2 KIND=2 DROID_SWING=0.72 w=432 h=388 ortho=1.552 pos=-0.128,5.5824,19.2603 tgt=-0.128,1.4242,-0.3027 alpha=1
//@shot il-deer-go-1 KIND=4 GO=1 DEER_S=0.6 w=780 h=808 ortho=3.232 pos=0.72,6.944,18.9709 tgt=0.72,2.7858,-0.5921 alpha=1 spp=200
//@shot il-deer-go-2 KIND=4 GO=1 DEER_S=0.0 w=780 h=808 ortho=3.232 pos=0.72,6.944,18.9709 tgt=0.72,2.7858,-0.5921 alpha=1 spp=200
//@shot il-deer-go-3 KIND=4 GO=1 DEER_S=-0.6 w=780 h=808 ortho=3.232 pos=0.72,6.944,18.9709 tgt=0.72,2.7858,-0.5921 alpha=1 spp=200
//@shot il-drone KIND=5 w=272 h=240 ortho=0.96 pos=0,3.8452,19.6295 tgt=0,-0.313,0.0665 alpha=1
//@shot il-drone-gift KIND=5 PARCEL=1 w=272 h=240 ortho=0.96 pos=0,3.8452,19.6295 tgt=0,-0.313,0.0665 alpha=1
//@shot il-lamp-on KIND=6 LIT=1 w=176 h=136 ortho=0.544 pos=0,4.1582,19.563 tgt=0,0,0 alpha=1
//@shot il-lamp-off KIND=6 w=176 h=136 ortho=0.544 pos=0,4.1582,19.563 tgt=0,0,0 alpha=1
//@shot il-window KIND=7 w=368 h=400 ortho=1.6 pos=0,4.1582,19.563 tgt=0,0,0 exposure=1.7
//@shot il-wall KIND=8 w=1600 h=900 spp=160 ortho=3.6 pos=0,4.1582,19.563 tgt=0,0,0 exposure=1.9
//@shot il-boards KIND=9 w=1600 h=600 spp=160 fov=5.5 pos=0,10,60 tgt=0,7.9209,50.2185 exposure=1.3
//@ spp=320 exposure=1.3
// a contractor looks at the robot it is mending, at its left hand (screen right), not at the camera
#ifdef CON
#if CON == 1
#define ELF_YAW -0.6
#endif
#endif
//@include models/elf.glsl
//@include models/droid.glsl
#ifndef KIND
#define KIND 1
#endif
#ifndef HAM
#define HAM 0
#endif
#ifndef CON
#define CON 0
#endif
#ifndef CARD
#define CARD 0
#endif
#ifndef FRAME
#define FRAME 0
#endif
#ifndef GO
#define GO 0
#endif
#ifndef PARCEL
#define PARCEL 0
#endif
#ifndef LIT
#define LIT 0
#endif
#define STEPK 0.7

// a hand tool's own space: x across the handle (in the picture), y along it from the grip to the head, z through it
vec3 flTool(vec3 q, vec3 T, vec3 A) {
  T = normalize(T); A = normalize(A - T * dot(A, T));
  return vec3(dot(q, A), dot(q, T), dot(q, cross(T, A)));
}

#if KIND <= 6
// ---- the kit's lights, the same on every sprite: pendant above and a little in front, cool fill from the right, soft warm fill from the camera
#define NL 3
#if KIND == 0
const vec3 ORG = vec3(0.0, 2.2, 0.0);      // the bench stands on the floor, the elf behind it has its base 2.2 higher: same lamp for both
#else
const vec3 ORG = vec3(0.0, 0.0, 0.0);
#endif
Light getLight(int i) {
  if (i == 0) return omni(ORG + vec3(-1.8, 9.5, 6.0), 0.5, vec3(1.0, 0.74, 0.46) * 900.0);
  if (i == 1) return omni(ORG + vec3(10.0, 4.5, 6.0), 1.6, vec3(0.28, 0.42, 0.95) * 190.0);
  return omni(ORG + vec3(-1.5, 2.5, 13.0), 2.5, vec3(1.0, 0.86, 0.72) * 110.0);
}
vec3 sky(vec3 rd) { return mix(vec3(0.012, 0.016, 0.03), vec3(0.02, 0.028, 0.055), sat(rd.y * 0.5 + 0.5)); }
#endif

#if KIND == 0
// =====================================================================================================================
// the workbench
const float BT = 2.944;
float map(vec3 p) {
  float d = 1e9; gM = 0.0;
  add(d, p.y, 1.0);
  float bb = sdBox(p - vec3(0.0, 1.5, 0.3), vec3(1.6, 1.6, 0.95));
  if (bb > 0.1) return min(d, bb);
  // top: three thick planks glued edge to edge
  vec3 t = p - vec3(0.0, BT - 0.3, 0.0);
  float pl = clamp(floor(t.z / 0.28 + 0.5), -1.0, 1.0);
  add(d, sdRBox(vec3(t.x - 0.012 * pl, t.y, t.z - pl * 0.28), vec3(1.408, 0.3, 0.139), 0.025), 2.0);
  // legs
  vec3 l = vec3(abs(p.x) - 1.13, p.y - 1.17, abs(p.z) - 0.27);
  add(d, sdRBox(l, vec3(0.13, 1.17, 0.13), 0.022), 3.0);
  // aprons under the top, a low stretcher front and back, and one at each end
  float rail = sdRBox(vec3(p.x, p.y - 2.13, abs(p.z) - 0.3), vec3(1.02, 0.21, 0.04), 0.012);
  rail = min(rail, sdRBox(vec3(p.x, p.y - 0.62, abs(p.z) - 0.27), vec3(1.02, 0.1, 0.05), 0.015));
  rail = min(rail, sdRBox(vec3(abs(p.x) - 1.13, p.y - 0.86, p.z), vec3(0.05, 0.09, 0.27), 0.015));
  add(d, rail, 4.0);
  // pegs pinning the joints
  vec3 g = vec3(abs(p.x) - 1.13, p.z - 0.4, abs(p.y - 1.375) - 0.755);
  add(d, sdRCyl(g, 0.036, 0.014, 0.008), 5.0);
  // shavings on the floor
  for (int i = 0; i < 6; i++) {
    float fi = float(i);
    vec3 s = p - vec3(-1.15 + 2.3 * hash1(fi * 3.7 + 0.5), 0.066, 0.5 + 0.55 * hash1(fi * 5.1 + 2.0));
    s.xz = rot(fi * 1.9 + 0.4) * s.xz;
    float curl = max(abs(length(s.xy) - 0.055) - 0.005, abs(s.z) - 0.04 - 0.03 * hash1(fi + 9.0));
    add(d, max(curl, -(s.x + s.y) - 0.062) - 0.003, 6.0);
  }
  return d;
}
void shade(float id, vec3 p, inout vec3 n, inout Mat m) {
  if (id < 1.5) { m.col = vec3(0.1); m.rough = 0.9; m.catcher = 1.0; return; }
  if (id < 2.5) {
    float pl = clamp(floor(p.z / 0.28 + 0.5), -1.0, 1.0);
    float top = smoothstep(0.5, 0.8, n.y), front = smoothstep(0.5, 0.8, n.z);
    matWood(m, n, p * 3.2 + vec3(pl * 3.1, pl * 1.7, 0.0), vec3(1.0, 0.02, 0.0), 0.44 + 0.08 * pl, 0.1);
    m.col *= 0.6 + 0.45 * fbm3(p * vec3(2.0, 6.0, 6.0) + 3.0);                                    // years of work
    float edge = (1.0 - smoothstep(0.0, 0.05, BT - p.y)) * front * (0.4 + 0.6 * noise(p.x * 9.0));
    m.col = mix(m.col, srgb(0.80, 0.64, 0.42), 0.55 * edge);                                       // the front edge rubbed pale
    float cut = scratches(p * 0.5) * max(top, 0.7 * front); m.col *= 1.0 - 0.55 * cut;             // nicks and saw cuts
    float ring = (1.0 - smoothstep(0.0, 0.02, abs(length(p.xz - vec2(-0.95, 0.1)) - 0.13))) * top; m.col *= 1.0 - 0.3 * ring;
    // dried glue run over the front edge, and a blob or two on top
    float run = smoothstep(0.5, 0.62, noise(p.x * 6.0 + 1.3)) * (1.0 - smoothstep(0.0, 0.08 + 0.45 * noise(p.x * 13.0 + 2.0), BT - p.y)) * front;
    run = max(run, top * smoothstep(0.66, 0.72, fbm(p.xz * 4.0 + 5.0)));
    m.col = mix(m.col, srgb(0.90, 0.84, 0.64), 0.8 * run); m.rough = mix(m.rough, 0.22, run); m.coat = max(m.coat, 0.8 * run);
    // small dabs of toy paint
    float dab = smoothstep(0.885, 0.91, noise(p.xy * 13.0 + 7.0)) * front;
    m.col = mix(m.col, hash1(floor(p.x * 3.0) + 4.0) < 0.5 ? srgb(0.62, 0.08, 0.06) : srgb(0.10, 0.36, 0.22), 0.9 * dab);
    return;
  }
  if (id < 3.5) {
    matWood(m, n, p * 3.2 + vec3(sign(p.x) * 2.0, 0.0, sign(p.z) * 3.0), vec3(0.02, 1.0, 0.0), 0.52, 0.1);
    float scuff = (1.0 - smoothstep(0.0, 0.6, p.y)) * fbm3(p * 9.0); m.col *= 1.0 - 0.6 * scuff;        // kicked feet
    m.col *= 0.62 + 0.45 * fbm3(p * vec3(6.0, 2.0, 6.0));
    m.col *= 1.0 - 0.5 * scratches(p * 0.5);
    return;
  }
  if (id < 4.5) {
    vec3 along = abs(p.z) < 0.2 ? vec3(0.0, 0.02, 1.0) : vec3(1.0, 0.02, 0.0);
    matWood(m, n, p * 3.2 + vec3(0.0, floor(p.y * 2.0) * 1.3, 0.0), along, 0.5, 0.1);
    m.col *= 0.6 + 0.45 * fbm3(p * vec3(2.0, 6.0, 6.0) + 8.0);
    return;
  }
  if (id < 5.5) { matWood(m, n, p * 6.0, vec3(0.0, 0.0, 1.0), 0.75, 0.2); return; }
  m.col = srgb(0.90, 0.76, 0.52) * (0.85 + 0.25 * noise(p * 60.0)); m.rough = 0.6;
}

#elif KIND == 1
// =====================================================================================================================
// an elf at the bench, base of the tunic at the origin. Mitten centres:
const vec3 SL = vec3(-0.5, 1.45, 0.05), SR = vec3(0.5, 1.45, 0.05);       // the model's shoulders
// The blow lands on the toy, which the game stands on the bench in front of the elf with its bow at about chest height
// (hd-interlude.js toy(-4)): raised, the tool is up beside the hood; down, the hand is at shoulder height and the head lies
// on the bow, at x -0.1, y 1.63. (Lower than that and the toy, drawn over the elf, hides the tool at the moment it hits.)
const vec3 MR0 = vec3(0.95, 2.35, 0.70), TT0 = vec3(0.25, 0.95, -0.15), TA0 = vec3(1.0, 0.0, 0.0);          // raised
const vec3 MR1 = vec3(0.67, 1.97, 0.80), TT1 = vec3(-0.914, -0.404, -0.024), TA1 = vec3(0.4, -0.9, 0.0);     // down
// A contractor does not hammer: it mends the robot the game stands at its left hand (screen right; hd-interlude.js bench(),
// the robot is 44 units along). The spanner's jaw stays on a bolt on the side of the robot's head, at JAW, and the handle is
// worked up and down about it: so MR, the grip, is 0.874 back along the handle from JAW in both poses. (These sprites are 440
// wide, not 360, so the jaw is inside the picture.)
// (the hand stays below the jaw in both poses: level with it, the tail of the spanner crosses the elf's own face)
const vec3 JAW = vec3(1.35, 1.97, 0.75);
const vec3 CT0 = vec3(0.940, 0.341, 0.0), CT1 = vec3(0.639, 0.769, 0.0), CA = vec3(0.0, 1.0, 0.0);
#if CON == 1
#ifdef HAMT
const vec3 TT = normalize(mix(CT0, CT1, float(HAMT))), MR = JAW - 0.874 * TT, TA = CA;
#elif HAM == 0
const vec3 TT = CT0, MR = JAW - 0.874 * CT0, TA = CA;
#else
const vec3 TT = CT1, MR = JAW - 0.874 * CT1, TA = CA;
#endif
#else
#ifdef HAMT
const vec3 MR = mix(MR0, MR1, float(HAMT)), TT = mix(TT0, TT1, float(HAMT)), TA = mix(TA0, TA1, float(HAMT));
#elif HAM == 0
const vec3 MR = MR0, TT = TT0, TA = TA0;
#else
const vec3 MR = MR1, TT = TT1, TA = TA1;
#endif
#endif
#if CARD == 1
const vec3 ML = vec3(-1.02, 2.66, 0.5);                                   // held up: unit -32, 154
#else
const vec3 ML = vec3(-0.48, 0.97, 0.85);                                  // resting: unit -15, 208
#endif
const vec3 CARDC = vec3(-1.02, 3.0, 0.62);
vec3 flCard(vec3 p) { vec3 c = p - CARDC; return vec3(c.x, c.y * 0.97815 - c.z * 0.20791, c.y * 0.20791 + c.z * 0.97815); }   // facing the camera squarely
float map(vec3 p) {
  float d = 1e9; gM = 0.0;
  mElf(p, d, ML - normalize(ML - SL) * 0.16, MR - normalize(MR - SR) * 0.16, 0.0, float(CON));
#if CON == 1
  add(d, sdRBox(p - vec3(0.0, 1.05, 0.692), vec3(0.34, 0.11, 0.012), 0.02), 238.0);   // the model's badge sinks into the tunic at its lower edge: a second plate just in front of it
#endif
  vec3 c = flTool(p - MR, TT, TA);
  float bb = length(c - vec3(0.0, 0.3, 0.0)) - 0.85;
  if (bb > 0.1) d = min(d, bb); else {
#if CON == 0
    // a small wooden mallet
    vec3 h = c / 1.15;
    add(d, sdCone(h, vec3(0.0, -0.22, 0.0), vec3(0.0, 0.74, 0.0), 0.055, 0.042) * 1.15, 20.0);
    float head = sdRCyl(vec3(h.y - 0.74, h.x, h.z), 0.17, 0.27, 0.035);
    head += 0.008 * (1.0 - smoothstep(0.0, 0.012, abs(abs(h.x) - 0.17)));          // a turned groove near each face
    add(d, head * 1.15, 21.0);
#else
    // a spanner: flat bar, open jaw at the far end, ring at the near end
    vec3 h = c / 1.12;
    float sp = sdRBox(h - vec3(0.0, 0.2, 0.0), vec3(0.052, 0.5, 0.024), 0.018);
    float jaw = sdRCyl(vec3(h.x, h.z, h.y - 0.78), 0.175, 0.032, 0.012);
    jaw = smax(jaw, -sdBox(vec3(h.x, h.y - 0.93, h.z), vec3(0.068, 0.15, 0.1)), 0.015);
    float ring = max(sdRCyl(vec3(h.x, h.z, h.y + 0.34), 0.105, 0.032, 0.012), 0.045 - length(vec2(h.x, h.y + 0.34)));
    add(d, min(sp, min(jaw, ring)) * 1.12, 22.0);
#endif
  }
#if CARD == 1
  vec3 k = flCard(p);
  float card = sdRBox(k, vec3(0.27, 0.19, 0.006), 0.005);
  card = min(card, sdRBox(k - vec3(0.03, -0.028, -0.022), vec3(0.27, 0.19, 0.006), 0.005));      // the back leaf of the fold
  add(d, card, 23.0);
#endif
  return d;
}
void shade(float id, vec3 p, inout vec3 n, inout Mat m) {
  if (shElf(id, p, n, m)) return;
  vec3 c = flTool(p - MR, TT, TA);
  if (id < 20.5) { matWood(m, n, c * 2.0, vec3(0.02, 1.0, 0.0), 0.12, 0.3); return; }
  if (id < 21.5) {
    matWood(m, n, c * 2.2 + 5.0, vec3(1.0, 0.03, 0.0), 0.55, 0.3);
    float face = smoothstep(0.26, 0.3, abs(c.x)); m.col = mix(m.col, m.col * 1.5 + 0.02, 0.6 * face * fbm3(c * 30.0));   // battered striking faces
    m.col *= 1.0 - 0.5 * (1.0 - smoothstep(0.0, 0.016, abs(abs(c.x) - 0.196)));
    return;
  }
  if (id < 22.5) { matMetal(m, n, c, 0, vec3(0.0, 1.0, 0.0)); m.col = min(m.col * 1.45, vec3(0.95)); return; }
  matPaper(m, n, p, 1, srgb(0.95, 0.93, 0.87));
#if CARD == 1
  if (flCard(p).z < -0.01) m.col *= 0.8;
#endif
}

#elif KIND == 2
// =====================================================================================================================
// the robot, turned a little toward screen left. It is 8% smaller than the cast model so that the aerial and the front of
// the tracks both fit the box; the middle of its tracks stands at unit y = 238.2.
const float DS = 0.92, DA = 0.35;
const vec3 PD = vec3(0.0, 0.0589, 0.0);
vec3 flDroid(vec3 p) { vec3 q = (p - PD) / DS; q.xz = rot(DA) * q.xz; return q; }
float map(vec3 p) {
  float d = 1e9; gM = 0.0;
  mDroid(flDroid(p), d, 4.0);
  return d * DS;
}
void shade(float id, vec3 p, inout vec3 n, inout Mat m) {
  vec3 nn = n; nn.xz = rot(DA) * nn.xz;
  shDroid(id, flDroid(p), nn, m);
  nn.xz = rot(-DA) * nn.xz; n = nn;
}

#elif KIND == 3
// =====================================================================================================================
// laid off: walking out to screen right with a box of desk things
const float WA = -0.95;
#if FRAME == 0
const float LEAN = -0.07, LIFT = 0.065;
#else
const float LEAN = -0.02, LIFT = 0.14;
#endif
const vec3 SL = vec3(-0.5, 1.45, 0.05), SR = vec3(0.5, 1.45, 0.05);
const vec3 BX = vec3(0.0, 0.93, 1.08);
const float BS = 1.2;                        // the box and what is in it, a little over life size so it reads
vec3 flWalk(vec3 p) { vec3 q = p - vec3(0.0, LIFT, 0.0); q.xy = rot(LEAN) * q.xy; q.xz = rot(WA) * q.xz; return q; }
float map(vec3 p) {
  float d = 1e9; gM = 0.0;
  add(d, p.y, 1.0);
  vec3 q = flWalk(p);
  float bb = sdBox(q - vec3(0.15, 2.3, 0.3), vec3(1.9, 2.7, 1.6));
  if (bb > 0.2) return min(d, bb);
  vec3 ml = vec3(-0.7, 0.94, 1.02), mr = vec3(0.7, 0.94, 1.02);
  mElf(q, d, ml - normalize(ml - SL) * 0.16, mr - normalize(mr - SR) * 0.16, 1.0, 0.0);
  float gm0 = gM, d0 = d; d = 1e9;
  // the box: open, its end flaps folded out
  vec3 b = (q - BX) / BS;
  float bx = sdRBox(b, vec3(0.5, 0.28, 0.3), 0.012);
  bx = max(bx, -sdBox(b - vec3(0.0, 0.08, 0.0), vec3(0.475, 0.3, 0.275)));
  vec3 f = vec3(abs(b.x) - 0.5, b.y - 0.27, b.z); f.xy = rot(-1.0) * f.xy;
  bx = min(bx, sdRBox(f - vec3(0.0, 0.09, 0.0), vec3(0.012, 0.09, 0.29), 0.008));
  add(d, bx, 10.0);
  // a little plant in a clay pot
  vec3 pp = b - vec3(0.25, 0.2, -0.02);
  add(d, sdCapCone(pp, 0.13, 0.085, 0.125) - 0.012, 11.0);
  add(d, sdCyl(pp - vec3(0.0, 0.11, 0.0), 0.115, 0.012), 12.0);
  float lf = 1e9;
  for (int i = 0; i < 6; i++) {
    float fi = float(i); vec3 l = pp - vec3(0.0, 0.12, 0.0);
    l.xz = rot(fi * 1.047 + 0.4) * l.xz; l.xy = rot(0.5 + 0.3 * mod(fi, 2.0)) * l.xy;
    lf = min(lf, sdEllipsoid(l - vec3(0.0, 0.18, 0.0), vec3(0.065, 0.18, 0.022)));
  }
  add(d, lf * 0.8, 13.0);
  // his mug
  vec3 mg = b - vec3(-0.2, 0.27, 0.07);
  float cup = max(sdRCyl(mg, 0.115, 0.15, 0.02), -sdRCyl(mg - vec3(0.0, 0.05, 0.0), 0.095, 0.15, 0.02));
  cup = min(cup, sdTorus((mg - vec3(-0.13, 0.0, 0.0)).xzy, 0.07, 0.022));
  add(d, cup, 14.0);
  // a folder and some sheets standing at the back
  vec3 pa = b - vec3(-0.04, 0.24, -0.19); pa.yz = rot(0.16) * pa.yz; pa.xy = rot(0.07) * pa.xy;
  add(d, sdRBox(pa, vec3(0.24, 0.31, 0.012), 0.006), 15.0);
  vec3 pb = pa - vec3(0.03, 0.04, 0.022); pb.xy = rot(-0.12) * pb.xy;
  add(d, sdRBox(pb, vec3(0.2, 0.3, 0.004), 0.003), 16.0);
  float gb = gM; gM = gm0; d *= BS;
  if (d < d0) { gM = gb; return d; }
  return d0;
}
void shade(float id, vec3 p, inout vec3 n, inout Mat m) {
  if (id < 1.5) { m.col = vec3(0.1); m.rough = 0.9; m.catcher = 1.0; return; }
  vec3 q = flWalk(p), nn = n; nn.xy = rot(LEAN) * nn.xy; nn.xz = rot(WA) * nn.xz;
  vec3 b = (q - BX) / BS;
  if (shElf(id, q, nn, m)) { }
  else if (id < 10.5) {
    matPaper(m, nn, q, 2, srgb(0.66, 0.49, 0.30));
    float inside = step(sdBox(b - vec3(0.0, 0.08, 0.0), vec3(0.478, 0.3, 0.278)), 0.004); m.col *= 1.0 - 0.3 * inside;
    float tape = (1.0 - smoothstep(0.055, 0.06, abs(b.x))) * step(0.29, b.z);
    m.col = mix(m.col, srgb(0.78, 0.66, 0.44), tape); m.rough = mix(m.rough, 0.3, tape); m.coat = 0.4 * tape;
    m.col *= 0.85 + 0.25 * fbm3(q * 5.0);
  }
  else if (id < 11.5) { m.col = srgb(0.72, 0.36, 0.22) * (0.8 + 0.3 * fbm3(q * 20.0)); m.rough = 0.85; bumpN(nn, q, 90.0, 0.5); }
  else if (id < 12.5) { m.col = srgb(0.09, 0.06, 0.045) * (0.6 + 0.8 * noise(q * 90.0)); m.rough = 0.95; }
  else if (id < 13.5) { m.col = srgb(0.26, 0.56, 0.16) * (0.75 + 0.4 * fbm3(q * 14.0)); m.rough = 0.4; m.coat = 0.35; m.coatRough = 0.15; }
  else if (id < 14.5) {
    float band = 1.0 - smoothstep(0.0, 0.006, abs(b.y - 0.33) - 0.03);
    m.col = mix(srgb(0.93, 0.91, 0.85), srgb(0.66, 0.08, 0.07), band) * (0.94 + 0.08 * fbm3(q * 6.0)); m.rough = 0.2; m.coat = 0.9; m.coatRough = 0.06;
  }
  else if (id < 15.5) { matPaper(m, nn, q, 1, srgb(0.84, 0.68, 0.38)); }
  else { matPaper(m, nn, q, 0, srgb(0.95, 0.93, 0.88)); }
  nn.xz = rot(-WA) * nn.xz; nn.xy = rot(-LEAN) * nn.xy; n = nn;
}

#elif KIND == 4
// =====================================================================================================================
// the reindeer: a felt and wool puppet, side-on, facing screen right, hooves on y = 0. Material ids 300..319.
// go 1 = walking (frame 0 / 1) with a little red suitcase in its mouth and no collar.
float deerLeg(vec3 p, inout float d, vec3 hip, vec3 foot, float bend) {
  vec3 knee = mix(hip, foot, 0.48) + vec3(bend, 0.0, 0.0);
  add(d, sdCone(p, knee, foot + vec3(0.0, 0.24, 0.0), 0.135, 0.1) - 0.004 * (noise(p * 130.0) - 0.5), 302.0);
  add(d, sdCapCone(p - foot - vec3(0.03, 0.125, 0.0), 0.11, 0.17, 0.125) - 0.015, 303.0);
  return sdCone(p, hip, knee, 0.3, 0.15);
}
float deerWool(vec3 p) { return 0.05 * (noise(p * 18.0) - 0.5) + 0.02 * (noise(p * 60.0) - 0.5); }
void mDeer(vec3 p, inout float d, float go, float frame) {
  float bb = sdBox(p - vec3(0.65, 3.0, 0.0), vec3(3.2, 3.2, 1.0));
  if (bb > 0.2) { d = min(d, bb); return; }
  float fz = 0.004 * (noise(p * 130.0) - 0.5) + 0.008 * (fbm3(p * 8.0) - 0.5);
  float s = go < 0.5 ? 0.0 : (frame < 0.5 ? 1.0 : -1.0);
#ifdef DEER_S
  s = float(DEER_S);
#endif
  vec3 hFN = vec3(1.2, 2.6, 0.36), hFF = vec3(0.98, 2.6, -0.36), hRN = vec3(-0.9, 2.65, 0.38), hRF = vec3(-0.66, 2.65, -0.38);
  float th = deerLeg(p, d, hFN, vec3(hFN.x + 0.05 + 0.62 * s, 0.0, hFN.z), 0.05 + 0.12 * s);
  th = min(th, deerLeg(p, d, hFF, vec3(hFF.x + 0.05 - 0.62 * s, 0.0, hFF.z), 0.05 - 0.12 * s));
  th = min(th, deerLeg(p, d, hRN, vec3(hRN.x - 0.05 - 0.62 * s, 0.0, hRN.z), -0.16 - 0.08 * s));
  th = min(th, deerLeg(p, d, hRF, vec3(hRF.x - 0.05 + 0.62 * s, 0.0, hRF.z), -0.16 + 0.08 * s));
  // trunk, chest, rump, neck
  float trunk = sdEllipsoid(p - vec3(0.2, 2.95, 0.0), vec3(1.5, 0.8, 0.68));
  trunk = smin(trunk, sdEllipsoid(p - vec3(1.15, 3.08, 0.0), vec3(0.75, 0.86, 0.66)), 0.3);
  trunk = smin(trunk, sdEllipsoid(p - vec3(-0.8, 3.02, 0.0), vec3(0.72, 0.8, 0.66)), 0.3);
  trunk = smin(trunk, sdCone(p, vec3(1.45, 3.35, 0.0), vec3(2.2, 4.4, 0.0), 0.55, 0.36), 0.25);
  add(d, smin(trunk, th, 0.18) - fz, th < trunk ? 315.0 : 300.0);
  // head, muzzle, nose, bead eyes
  vec3 h = p - vec3(2.3, 4.6, 0.0); vec3 hm = vec3(h.x, h.y, abs(h.z));
  add(d, sdEllipsoid(h, vec3(0.56, 0.5, 0.46)) - fz, 300.0);
  vec3 mz = h - vec3(0.5, -0.2, 0.0); mz.xy = rot(-0.22) * mz.xy;
  add(d, sdEllipsoid(mz, vec3(0.46, 0.3, 0.32)) - fz, 301.0);
  add(d, sdEllipsoid(mz - vec3(0.44, 0.06, 0.0), vec3(0.11, 0.1, 0.14)), 305.0);
  add(d, sdSphere(hm - vec3(0.2, 0.1, 0.43), 0.075), 306.0);
  // ears
  vec3 e = hm - vec3(-0.3, 0.36, 0.4); e.xy = rot(0.9) * e.xy; e.yz = rot(-0.5) * e.yz;
  add(d, sdEllipsoid(e - vec3(0.0, 0.2, 0.0), vec3(0.11, 0.27, 0.06)) - fz, 300.0);
  // antlers
  vec3 a0 = vec3(-0.08, 0.4, 0.2), a1 = vec3(-0.36, 0.84, 0.42), a2 = vec3(-0.14, 1.28, 0.55);
  float an = sdCone(hm, a0, a1, 0.1, 0.08);
  an = smin(an, sdCone(hm, a1, a2, 0.08, 0.05), 0.05);
  an = smin(an, sdCone(hm, a0 + vec3(-0.04, 0.1, 0.03), vec3(0.36, 0.74, 0.3), 0.07, 0.04), 0.05);
  an = smin(an, sdCone(hm, a1, vec3(-0.78, 1.08, 0.5), 0.07, 0.04), 0.05);
  an = smin(an, sdCone(hm, mix(a1, a2, 0.5), vec3(0.2, 1.22, 0.6), 0.06, 0.04), 0.05);
  add(d, an - 0.5 * fz, 304.0);
  // woolly tail
  add(d, (sdEllipsoid(p - vec3(-1.52, 3.4, 0.0), vec3(0.2, 0.27, 0.19)) - deerWool(p)) * 0.8, 310.0);
  if (go < 0.5) {
    // red collar with three brass bells
    vec3 c = p - vec3(1.88, 3.95, 0.0); c.xy = rot(-0.63) * c.xy;
    add(d, max(abs(length(c.xz) - 0.48) - 0.035, abs(c.y) - 0.1) - 0.012, 307.0);
    float bell = sdSphere(c - vec3(0.65, -0.18, 0.0), 0.15);
    bell = min(bell, sdSphere(vec3(c.x, c.y, abs(c.z)) - vec3(0.47, -0.16, 0.43), 0.125));
    add(d, bell, 308.0);
  } else {
    // the suitcase, swinging from its handle
    vec3 sc = p - vec3(3.08, 4.12, 0.0); sc.xy = rot(0.09 * s) * sc.xy; sc.y += 0.5;
    add(d, sdRBox(sc, vec3(0.42, 0.3, 0.13), 0.05), 311.0);
    vec3 k = abs(sc) - vec3(0.39, 0.27, 0.10);
    add(d, max(length(k) - 0.13, sdRBox(sc, vec3(0.435, 0.315, 0.145), 0.055)), 308.0);
    add(d, sdTorus((sc - vec3(0.0, 0.3, 0.0)).xzy, 0.16, 0.032), 313.0);
    add(d, sdRBox(vec3(abs(sc.x) - 0.2, sc.y - 0.1, sc.z - 0.135), vec3(0.04, 0.05, 0.012), 0.01), 308.0);
  }
}
bool shDeer(float id, vec3 p, inout vec3 n, inout Mat m) {
  if (id < 299.5 || id > 319.5) return false;
  if (id < 300.5 || id > 314.5) {
    vec3 brown = srgb(0.40, 0.21, 0.10), pale = srgb(0.80, 0.67, 0.48);
    float seam = 2.62 + 0.06 * sin(p.x * 3.0);
    float belly = id < 300.5 ? (1.0 - smoothstep(seam - 0.01, seam + 0.01, p.y)) * step(p.x, 1.75) : 0.0;
    float dark = id > 314.5 ? 1.0 - smoothstep(1.3, 2.2, p.y) : 0.0;                              // the thighs darken toward the knee
    brown *= 1.05 - 0.3 * smoothstep(2.9, 3.7, p.y - 0.9 * max(p.x - 1.2, 0.0));                    // a shade darker along the back
    vec3 fc = mix(mix(brown, pale, belly), srgb(0.12, 0.075, 0.055), dark);
    matFelt(m, n, p, fc); m.sheen = 0.4; m.sheenCol = mix(fc, vec3(1.0, 0.85, 0.7), 0.35);
    float st = (1.0 - smoothstep(0.012, 0.02, abs(p.y - seam - 0.035))) * step(0.5, fract(p.x * 9.0)) * step(p.x, 1.75) * step(id, 300.5) * step(p.y, 2.9);
    m.col = mix(m.col, srgb(0.9, 0.84, 0.7), st);                                                  // the belly patch is stitched on
    return true;
  }
  if (id < 301.5) { matFelt(m, n, p, srgb(0.84, 0.72, 0.55)); m.sheen = 0.5; return true; }
  if (id < 302.5) { matFelt(m, n, p, srgb(0.12, 0.075, 0.055)); m.sheen = 0.3; m.sheenCol = srgb(0.5, 0.35, 0.25); return true; }
  if (id < 303.5) { m.col = srgb(0.045, 0.04, 0.04); m.rough = 0.3; m.coat = 0.6; m.coatRough = 0.1; return true; }
  if (id < 304.5) { matFelt(m, n, p, srgb(0.78, 0.64, 0.42)); m.sheen = 0.5; return true; }
  if (id < 305.5) { m.col = srgb(0.07, 0.04, 0.035); m.rough = 0.12; m.coat = 1.0; m.coatRough = 0.04; return true; }
  if (id < 306.5) { m.col = srgb(0.02, 0.018, 0.018); m.rough = 0.05; m.coat = 1.0; m.coatRough = 0.02; return true; }
  if (id < 307.5) { matLeather(m, n, p, srgb(0.66, 0.06, 0.05), 0.6); return true; }
  if (id < 308.5) { matMetal(m, n, p, 1, vec3(1.0, 0.0, 0.0)); return true; }
  if (id < 310.5) { m.col = srgb(0.93, 0.90, 0.82) * (0.8 + 0.25 * noise(p * 40.0)); m.rough = 0.9; m.sheen = 0.8; n = normalize(n + 0.5 * (hash3(p * 700.0) - 0.5)); return true; }
  if (id < 311.5) {
    matLeather(m, n, p, srgb(0.66, 0.07, 0.06), 0.7);
    return true;
  }
  matLeather(m, n, p, srgb(0.10, 0.06, 0.04), 0.5);
  return true;
}
float map(vec3 p) {
  float d = 1e9; gM = 0.0;
  add(d, p.y, 1.0);
  mDeer(p, d, float(GO), float(FRAME));
  return d;
}
void shade(float id, vec3 p, inout vec3 n, inout Mat m) {
  if (shDeer(id, p, n, m)) return;
  m.col = vec3(0.1); m.rough = 0.9; m.catcher = 1.0;
}

#elif KIND == 5
// =====================================================================================================================
// the delivery drone, body centred on the origin. Material ids 320..339. Its rotors are a blur: each frame of the
// render keeps or drops the disc for the whole picture element, so the average is see-through.
void mDrone(vec3 p, inout float d, float parcel) {
  float bb = sdBox(p - vec3(0.0, -0.4, 0.0), vec3(1.15, 0.95, 0.6));
  if (bb > 0.1) { d = min(d, bb); return; }
  vec3 q = vec3(abs(p.x), p.y, p.z);
  float body = sdRBox(p, vec3(0.34, 0.14, 0.28), 0.11);
  body = smin(body, sdEllipsoid(p - vec3(0.0, 0.11, -0.03), vec3(0.26, 0.13, 0.22)), 0.06);
  body = max(body, -max(abs(p.y + 0.02) - 0.006, 0.27 - length(p.xz)));          // the seam between the two shells
  add(d, body, 320.0);
  // camera ball under the nose, its lens, the red light
  add(d, sdSphere(p - vec3(0.0, -0.15, 0.17), 0.115), 321.0);
  add(d, sdRCyl(vec3(p.x, p.z - 0.27, p.y + 0.16), 0.062, 0.03, 0.01), 322.0);
  add(d, sdSphere(p - vec3(0.2, 0.04, 0.262), 0.055), 323.0);
  // arms, motors, hubs
  add(d, sdCapsule(q, vec3(0.3, 0.03, 0.0), vec3(0.64, 0.09, 0.0), 0.042), 324.0);
  add(d, sdRCyl(q - vec3(0.64, 0.1, 0.0), 0.09, 0.1, 0.025), 325.0);
  add(d, sdRCyl(q - vec3(0.64, 0.23, 0.0), 0.03, 0.035, 0.012), 324.0);
  // skids
  float skid = sdCapsule(vec3(q.x, p.y, abs(p.z)), vec3(0.2, -0.1, 0.14), vec3(0.3, -0.36, 0.2), 0.018);
  skid = min(skid, sdCapsule(q, vec3(0.3, -0.36, -0.26), vec3(0.3, -0.36, 0.3), 0.022));
  add(d, skid, 325.0);
  // rotor blur
  float hsh = hash1(vec3(gl_FragCoord.xy + uOff, float(uFrame) + 0.5));
  if (hsh < 0.55) add(d, sdRCyl(q - vec3(0.64, 0.25, 0.0), mix(0.4, 0.27, hsh / 0.55), 0.008, 0.006), 326.0);
  if (parcel > 0.5) {
    add(d, sdCapsule(p, vec3(0.0, -0.2, 0.0), vec3(0.0, -0.74, 0.0), 0.011), 328.0);
    vec3 b = p - vec3(0.0, -0.95, 0.0); b.xz = rot(0.55) * b.xz;
    add(d, sdRBox(b, vec3(0.25, 0.19, 0.2), 0.02), 329.0);
    float rib = max(sdRBox(b, vec3(0.257, 0.197, 0.207), 0.022), min(abs(b.x), abs(b.z)) - 0.04);
    vec3 bw = vec3(abs(b.x) - 0.1, b.y - 0.24, b.z); bw.xy = rot(-0.5) * bw.xy;
    rib = min(rib, sdEllipsoid(bw, vec3(0.1, 0.05, 0.045)));
    rib = min(rib, sdSphere(b - vec3(0.0, 0.215, 0.0), 0.04));
    add(d, rib, 330.0);
  }
}
bool shDrone(float id, vec3 p, inout vec3 n, inout Mat m) {
  if (id < 319.5 || id > 339.5) return false;
  if (id < 320.5) { matPlastic(m, n, p, p.y < -0.02 ? srgb(0.36, 0.38, 0.42) : srgb(0.70, 0.72, 0.75), 0.6); return true; }
  if (id < 321.5) { matPlastic(m, n, p, srgb(0.05, 0.055, 0.065), 0.7); return true; }
  if (id < 322.5) { m.col = srgb(0.01, 0.015, 0.03); m.rough = 0.04; m.coat = 1.0; m.coatRough = 0.02; return true; }
  if (id < 323.5) { m.col = srgb(0.6, 0.05, 0.04); m.rough = 0.15; m.coat = 1.0; m.emit = vec3(1.0, 0.06, 0.03) * 2.0; m.glow = vec3(1.0, 0.05, 0.02) * 2.2; return true; }
  if (id < 324.5) { matMetal(m, n, p, 0, vec3(1.0, 0.0, 0.0)); return true; }
  if (id < 325.5) { matPlastic(m, n, p, srgb(0.07, 0.075, 0.085), 0.5); return true; }
  if (id < 326.5) {
    float a = atan(p.z, abs(p.x) - 0.64);
    m.col = vec3(0.30, 0.31, 0.34) * (0.7 + 0.5 * sin(a * 2.0 + 0.8)); m.rough = 0.5;
    return true;
  }
  if (id < 328.5) { m.col = srgb(0.72, 0.62, 0.44) * (0.7 + 0.5 * step(0.5, fract(p.y * 40.0))); m.rough = 0.9; return true; }
  if (id < 329.5) { matPaper(m, n, p, 3, srgb(0.70, 0.07, 0.07)); return true; }
  m.col = srgb(0.93, 0.70, 0.26); m.metal = 0.8; m.rough = 0.32 + 0.15 * noise(p * 50.0);
  return true;
}
float map(vec3 p) {
  float d = 1e9; gM = 0.0;
  mDrone(p, d, float(PARCEL));
  return d;
}
void shade(float id, vec3 p, inout vec3 n, inout Mat m) { shDrone(id, p, n, m); }

#elif KIND == 6
// =====================================================================================================================
// the pendant lamp: green enamel shade, brass cap (its top, where the cord goes in, is at unit y = 39), bulb underneath
float map(vec3 p) {
  float d = 1e9; gM = 0.0;
  vec3 q = p - vec3(0.0, 0.07, 0.0);
  float cone = sdCapCone(q, 0.23, 0.6, 0.115);
  add(d, max(abs(cone) - 0.01, -0.212 - q.y), cone < 0.0 ? 31.0 : 30.0);
  add(d, sdTorus(q - vec3(0.0, -0.212, 0.0), 0.588, 0.017), 30.0);
  add(d, sdRCyl(q - vec3(0.0, 0.3, 0.0), 0.095, 0.08, 0.02), 32.0);
  add(d, sdTorus(q - vec3(0.0, 0.235, 0.0), 0.118, 0.016), 32.0);
  add(d, sdCyl(q - vec3(0.0, -0.08, 0.0), 0.07, 0.12), 34.0);
  add(d, sdEllipsoid(q - vec3(0.0, -0.3, 0.0), vec3(0.15, 0.17, 0.15)), 33.0);
  return d;
}
void shade(float id, vec3 p, inout vec3 n, inout Mat m) {
  if (id < 30.5) { matPaint(m, n, p * 0.8, srgb(0.055, 0.29, 0.19), 0.9, 0.3, srgb(0.1, 0.1, 0.11), 1.0); return; }
  if (id < 31.5) { m.col = srgb(0.93, 0.90, 0.82) * (0.85 + 0.2 * fbm3(p * 14.0)); m.rough = 0.35; m.coat = 0.5; return; }
  if (id < 32.5) { matMetal(m, n, p, 1, vec3(0.0, 1.0, 0.0)); return; }
  if (id < 33.5) {
#if LIT == 1
    m.col = vec3(0.0); m.emit = vec3(1.0, 0.72, 0.36) * 9.0; m.glow = vec3(1.0, 0.70, 0.34) * 3.0;
#else
    m.col = srgb(0.74, 0.73, 0.68); m.rough = 0.12; m.coat = 1.0; m.coatRough = 0.04;
#endif
    return;
  }
  matRubber(m, n, p, srgb(0.03, 0.03, 0.033));
}

#elif KIND == 7
// =====================================================================================================================
// a tall basement window in the painted brick: steel frame, four panes, a painted night behind, snow drifted on the outer sill
#define NL 3
const vec3 WC = vec3(0.0, 0.08, 0.0);
Light getLight(int i) {
  if (i == 0) return omni(vec3(-3.0, 3.5, 5.5), 0.5, vec3(1.0, 0.74, 0.46) * 85.0);
  if (i == 1) return omni(vec3(8.0, 3.0, 7.0), 1.5, vec3(0.28, 0.42, 0.95) * 130.0);
  return omni(vec3(-1.0, 0.0, 14.0), 2.5, vec3(1.0, 0.86, 0.72) * 60.0);
}
vec3 sky(vec3 rd) { return vec3(0.012, 0.016, 0.03); }
float map(vec3 p) {
  float d = 1e9; gM = 0.0;
  vec3 w = p - WC;
  float bid; float mortar = brickPattern(p.xy + vec2(0.11, 0.05), bid);
  float hole = sdBox(w, vec3(1.03, 1.27, 0.62)) - 0.015;
  add(d, max(p.z + 0.014 * mortar - 0.006 * bid, -hole), 1.0);
  float bb = sdBox(w, vec3(1.4, 1.6, 0.7));
  if (bb > 0.1) return min(d, bb);
  add(d, sdBox(w - vec3(0.0, 0.0, -0.56), vec3(1.1, 1.32, 0.04)), 5.0);              // the night, painted on a board behind
  // steel frame and glazing bars
  float fr = max(sdBox2(w.xy, vec2(1.045, 1.285)), -sdBox2(w.xy, vec2(0.9, 1.14)));
  fr = min(fr, min(sdBox2(w.xy, vec2(0.035, 1.2)), sdBox2(w.xy, vec2(0.95, 0.035))));
  add(d, extrudeR(fr, w.z + 0.12, 0.05, 0.012), 4.0);
  vec3 rv = vec3(abs(w.x) - 0.97, abs(w.y) - 1.21, w.z + 0.07);
  float riv = sdEllipsoid(rv, vec3(0.03, 0.03, 0.018));
  riv = min(riv, sdEllipsoid(vec3(abs(w.x) - 0.97, w.y, w.z + 0.07), vec3(0.03, 0.03, 0.018)));
  riv = min(riv, sdEllipsoid(vec3(w.x, abs(w.y) - 1.21, w.z + 0.07), vec3(0.03, 0.03, 0.018)));
  add(d, riv, 4.0);
  // latch on the middle bar
  float latch = sdRBox(w - vec3(0.0, -0.3, -0.05), vec3(0.03, 0.09, 0.02), 0.012);
  latch = min(latch, sdCapsule(w, vec3(0.0, -0.3, -0.04), vec3(0.12, -0.38, -0.02), 0.022));
  add(d, latch, 8.0);
  // snow drifted against the glass outside
  float snow = smin(sdEllipsoid(w - vec3(-0.25, -1.25, -0.36), vec3(0.85, 0.3, 0.2)), sdEllipsoid(w - vec3(0.45, -1.28, -0.34), vec3(0.75, 0.2, 0.2)), 0.1);
  snow = smin(snow, sdEllipsoid(w - vec3(0.0, 0.05, -0.3), vec3(0.92, 0.035, 0.1)), 0.03);    // and a line of it on the middle bar
  add(d, snow - 0.012 * noise(p * 18.0), 6.0);
  // inner sill
  add(d, sdRBox(w - vec3(0.0, -1.36, 0.07), vec3(1.2, 0.055, 0.15), 0.02), 7.0);
  return d;
}
void shade(float id, vec3 p, inout vec3 n, inout Mat m) {
  if (id < 1.5) {
    if (p.z < -0.03) { matPaint(m, n, p, srgb(0.10, 0.14, 0.27), 0.15, 0.5, srgb(0.5, 0.48, 0.44), 0.0); m.col *= 0.75 + 0.3 * fbm3(p * 4.0); return; }
    matBrick(m, n, p, p.xy + vec2(0.11, 0.05), srgb(0.11, 0.155, 0.30), 0.42);
    return;
  }
  if (id < 4.5) { matPaint(m, n, p * 0.7, srgb(0.20, 0.23, 0.27), 0.5, 0.65, srgb(0.34, 0.18, 0.1), 0.6); return; }
  if (id < 5.5) {
    vec2 q = p.xy - WC.xy; q.y += 0.094;                                // line the painted sky up with the bars in front of it
    vec3 skyc = mix(vec3(0.03, 0.05, 0.13), vec3(0.008, 0.014, 0.05), sat(q.y * 0.42 + 0.5));
    float lm = length(q - vec2(0.45, 0.62));
    float moon = 1.0 - smoothstep(0.15, 0.165, lm);
    float mare = 0.75 + 0.25 * smoothstep(0.35, 0.6, fbm(q * 9.0 + 2.0));
    vec2 g = q * 24.0; float star = step(0.955, hash1(floor(g) + 3.0)) * (1.0 - smoothstep(0.05, 0.2, length(fract(g) - 0.5)));
    vec2 pc = abs(q) - vec2(0.4675, 0.5875);
    float cd = length(vec2(0.4325, 0.5525) - abs(pc));
    float frost = (1.0 - smoothstep(0.04, 0.26, cd + 0.2 * (fbm(q * 7.0 + 3.0) - 0.5))) * (0.7 + 0.3 * fbm(q * 30.0));
    m.col = vec3(0.01); m.rough = 0.5;
    m.emit = skyc * 1.3 + vec3(1.0, 0.95, 0.82) * (moon * mare * 2.6 + 0.06 * exp(-lm * 5.0)) + vec3(0.8, 0.9, 1.0) * star * 1.8 * (1.0 - moon) + vec3(0.42, 0.52, 0.68) * frost * 0.42;
    return;
  }
  if (id < 6.5) { matSnow(m, n, p); return; }
  if (id < 7.5) { matPaint(m, n, p, srgb(0.56, 0.54, 0.50), 0.3, 0.6, srgb(0.42, 0.28, 0.16), 0.0); return; }
  matMetal(m, n, p, 1, vec3(1.0, 0.0, 0.0));
}

#elif KIND == 8
// =====================================================================================================================
// the back wall: painted brick, a pipe run near the top, the lamps' warm wash across the middle, a skirting board along the bottom edge
#define NL 5
Light getLight(int i) {
  if (i < 3) { float x = -3.2 + 3.2 * float(i); return spot(vec3(x, 2.4, 3.6), 0.35, vec3(1.0, 0.66, 0.32) * 125.0, vec3(x, -0.7, 0.0), 18.0, 53.0); }
  if (i == 3) return omni(vec3(18.0, 5.0, 12.0), 2.5, vec3(0.28, 0.42, 0.95) * 300.0);
  return omni(vec3(-3.0, 0.0, 18.0), 3.0, vec3(1.0, 0.86, 0.72) * 45.0);
}
vec3 sky(vec3 rd) { return vec3(0.012, 0.016, 0.03); }
float map(vec3 p) {
  float d = 1e9; gM = 0.0;
  float bid; float mortar = brickPattern(p.xy, bid);
  add(d, p.z + 0.014 * mortar - 0.006 * bid, 1.0);
  float bb = p.z - 0.45;
  if (bb > 0.1) return min(d, bb);
  // steam pipe with flanges, a copper pipe under it, brackets
  vec2 pq = vec2(p.y - 2.75, p.z - 0.17);
  float pipe = length(pq) - 0.09;
  pipe = min(pipe, max(length(pq) - 0.135, abs(repLim(p.x - 0.4, 2.6, -3.0, 3.0)) - 0.03));
  add(d, pipe, 2.0);
  add(d, length(vec2(p.y - 2.46, p.z - 0.1)) - 0.04, 3.0);
  vec3 bk = vec3(repLim(p.x - 1.7, 2.6, -4.0, 3.0), p.y - 2.62, p.z - 0.06);
  add(d, sdRBox(bk, vec3(0.03, 0.27, 0.06), 0.008), 4.0);
  // skirting board
  float sk = sdBox2(vec2(p.y + 3.63, p.z - 0.02), vec2(0.3, 0.03)) - 0.012;
  sk = min(sk, length(vec2(p.y + 3.34, p.z - 0.04)) - 0.035);
  sk = max(sk, -(abs(repLim(p.x - 1.3, 4.7, -2.0, 1.0)) - 0.004));
  add(d, sk, 5.0);
  return d;
}
void shade(float id, vec3 p, inout vec3 n, inout Mat m) {
  if (id < 1.5) {
    matBrick(m, n, p, p.xy, srgb(0.11, 0.155, 0.30), 0.42);
    float damp = 1.0 - smoothstep(-3.6, -2.0, p.y + 0.6 * fbm(p.xy * 0.8)); m.col *= 1.0 - 0.45 * damp; m.rough -= 0.2 * damp;
    float soot = smoothstep(2.3, 3.4, p.y + 0.4 * fbm(p.xy * 1.3)); m.col *= 1.0 - 0.4 * soot;
    return;
  }
  if (id < 2.5) { matPaint(m, n, p, srgb(0.16, 0.19, 0.25), 0.4, 0.75, srgb(0.30, 0.16, 0.10), 0.6); return; }
  if (id < 3.5) { matMetal(m, n, p, 4, vec3(1.0, 0.0, 0.0)); return; }
  if (id < 4.5) { matPaint(m, n, p, srgb(0.10, 0.12, 0.16), 0.5, 0.7, srgb(0.42, 0.40, 0.38), 1.0); return; }
  matWood(m, n, p * vec3(0.8, 2.6, 2.6) + vec3(floor((p.x - 1.3) / 4.7 + 0.5) * 2.3, 0.0, 0.0), vec3(1.0, 0.02, 0.0), 0.9, 0.45);
  m.col *= 0.42 + 0.26 * fbm3(p * vec3(0.7, 4.0, 4.0));
  float scuff = fbm3(p * vec3(1.5, 9.0, 3.0)) * (1.0 - smoothstep(-3.75, -3.45, p.y)); m.col = mix(m.col, m.col * 1.8 + 0.01, 0.4 * scuff); m.coat *= 1.0 - 0.6 * scuff;
}

#else
// =====================================================================================================================
// the plank floor, seen by a long lens 12 degrees down: boards run left to right and grow toward the bottom of the picture
#define NL 4
#define TMAX 150.0
const float BW = 1.5, BL = 26.0;
Light getLight(int i) {
  if (i < 3) { float x = -13.0 + 13.0 * float(i); return spot(vec3(x, 11.0, -5.0), 1.5, vec3(1.0, 0.74, 0.46) * 620.0, vec3(x, 0.0, -2.0), 30.0, 62.0); }   // lamps over the far boards
  return omni(vec3(30.0, 30.0, 40.0), 4.0, vec3(0.28, 0.42, 0.95) * 150.0);
}
vec3 sky(vec3 rd) { return vec3(0.012, 0.016, 0.03); }
// x = distance to the nearest edge of the board under p, y = the board's row
vec2 flBoard(vec3 p) {
  float row = floor(p.z / BW), fz = p.z - (row + 0.5) * BW;
  float u = mod(p.x + hash1(row * 3.1 + 1.7) * BL, BL);
  return vec2(min(0.5 * BW - abs(fz), 2.5 * min(u, BL - u)), row);          // butt joints are tighter than the gaps between boards
}
float map(vec3 p) {
  gM = 1.0;
  if (p.y > 0.4) return p.y - 0.15;
  vec2 b = flBoard(p);
  float h = 0.03 * (hash1(b.y * 7.3) - 0.5);
  return (p.y - h + 0.07 * (1.0 - smoothstep(0.012, 0.05, b.x))) * 0.7;
}
void shade(float id, vec3 p, inout vec3 n, inout Mat m) {
  vec2 b = flBoard(p);
  float row = b.y, fz = p.z - (row + 0.5) * BW;
  float u = mod(p.x + hash1(row * 3.1 + 1.7) * BL, BL), piece = floor((p.x + hash1(row * 3.1 + 1.7) * BL) / BL);
  float k = hash1(vec2(row, piece) + 0.5);
  matWood(m, n, vec3(p.x, p.y, fz) * 0.3 + vec3(k * 9.0, 0.0, row * 0.7 + k * 5.0), vec3(1.0, 0.0, 0.015), 0.55 + 0.3 * k, 0.22);
  m.col *= 0.8 + 0.3 * fbm3(p * vec3(0.15, 1.0, 0.9));
  m.coat = 0.0; m.rough = max(m.rough, 0.7);                                                                 // a dull, dry floor: no glints from the lamps
  float tread = smoothstep(0.4, 0.75, fbm(p.xz * vec2(0.12, 0.3) + 4.0)); m.col = mix(m.col, m.col * 1.35 + 0.01, 0.5 * tread);   // worn pale where feet go
  m.col *= 0.25 + 0.75 * smoothstep(0.0, 0.07, b.x);                                                        // dirt in the gaps
  // two nails at each end of a board
  float nail = length(vec2(min(u, BL - u) - 0.3, abs(fz) - 0.42));
  if (nail < 0.05) { m.col = srgb(0.09, 0.085, 0.085); m.metal = 0.0; m.rough = 0.7; m.coat = 0.0; }
}
#endif
