// The boardroom of North Pole Ltd at night: one set, fourteen stills. BEAT picks the still:
//  0 intro-2a  the meeting                1 intro-2b  FC unimpressed            2 intro-2c  FC wide-eyed
//  3 intro-3a  the edict, stamp pressed   4 intro-3b  stamp put down            5 intro-3c  FC frowning
//  6 intro-6a  the button wheeled in      7 intro-7a  button lit, clapping      8 intro-7b  cheering
//  9 epi-1     year-end meeting           10 epi-2    the sack of returns
//  11 intro-6b as 6a, FC spent            12 epi-2g   good ending: one hand up  13 epi-2b   bad ending: children at the window
// World: table top y = 0, its front edge z = 0 (z = 15.5 in the edict beats, where the table is dressed deep), members behind it
// at z = -5.2, back wall z = -8, carpet y = -3.05. Orthographic camera, 12 degrees down (26 in the edict beats).
// --D MASK=1 renders only the blank surfaces, each in its own flat colour, for measuring their rectangles.
//@ w=1600 h=1000 spp=260 ortho=9.5 pos=0,7.963,22.843 tgt=0,2.974,-0.632 aperture=0.2 focus=28 exposure=2.3
//@shot intro-2a BEAT=0
//@shot intro-2b BEAT=1
//@shot intro-2c BEAT=2
//@shot intro-3a BEAT=3 ortho=8.33 pos=0,15.588,32.401 tgt=0,-1.947,-3.551 aperture=0.07 focus=21.4
//@shot intro-3b BEAT=4 ortho=8.33 pos=0,15.588,32.401 tgt=0,-1.947,-3.551 aperture=0.07 focus=21.4
//@shot intro-3c BEAT=5 ortho=8.33 pos=0,15.588,32.401 tgt=0,-1.947,-3.551 aperture=0.07 focus=21.4
//@shot intro-6a BEAT=6 ortho=11.2 pos=0,9.215,36.890 tgt=0,1.315,-0.279 focus=39 exposure=2.45
//@shot intro-7a BEAT=7 ortho=11.2 pos=0,9.215,36.890 tgt=0,1.315,-0.279 focus=39 exposure=2.45
//@shot intro-7b BEAT=8 ortho=11.2 pos=0,9.215,36.890 tgt=0,1.315,-0.279 focus=39 exposure=2.45
//@shot epi-1 BEAT=9 ortho=8.6 pos=0,7.093,23.029 tgt=0,2.103,-0.447
//@shot epi-2 BEAT=10 ortho=8.6 pos=0,7.093,23.029 tgt=0,2.103,-0.447
//@shot intro-6b BEAT=11 ortho=11.2 pos=0,9.215,36.890 tgt=0,1.315,-0.279 focus=39 exposure=2.45
//@shot epi-2g BEAT=12 ortho=8.6 pos=0,7.093,23.029 tgt=0,2.103,-0.447
//@shot epi-2b BEAT=13 ortho=8.6 pos=0,7.093,23.029 tgt=0,2.103,-0.447
// Pieces the films move (crops of the frames above; "-cut" = only its cut-out is used, mattein = what the matte picks out):
// the room before the trolley is wheeled in, and the trolley with him pushing it; the stamp on the edict; the board with their
// hands apart, to clap; the table before the sack of returns lands on it, and the sack.
//@shot intro-6e BEAT=6 NOFC=1 NOTROLLEY=1 matte=0 ortho=11.2 pos=0,9.215,36.890 tgt=0,1.315,-0.279 focus=39 exposure=2.45
//@shot x6-roll-cut BEAT=6 crop=800,310,640,440 mattein=(mid>19.5&&mid<23.5)||abs(mid-33.0)<0.5||abs(mid-11.0)<0.5||(mid>199.5&&mid<229.5) ortho=11.2 pos=0,9.215,36.890 tgt=0,1.315,-0.279 focus=39 exposure=2.45
// him behind the trolley with a leg lifted (see models/fc.glsl FC_STEP), for the film to step him along: just his half of the picture
//@shot x6-roll-s1-cut BEAT=6 FC_STEP=1 crop=1150,310,290,440 mattein=(mid>19.5&&mid<23.5)||abs(mid-33.0)<0.5||abs(mid-11.0)<0.5||(mid>199.5&&mid<229.5) ortho=11.2 pos=0,9.215,36.890 tgt=0,1.315,-0.279 focus=39 exposure=2.45
//@shot x6-roll-s2-cut BEAT=6 FC_STEP=2 crop=1150,310,290,440 mattein=(mid>19.5&&mid<23.5)||abs(mid-33.0)<0.5||abs(mid-11.0)<0.5||(mid>199.5&&mid<229.5) ortho=11.2 pos=0,9.215,36.890 tgt=0,1.315,-0.279 focus=39 exposure=2.45
//@shot x3-stamp-cut BEAT=3 crop=620,610,420,300 mattein=mid>40.5&&mid<43.5 ortho=8.33 pos=0,15.588,32.401 tgt=0,-1.947,-3.551 aperture=0.07 focus=21.4
//@shot x7-clap BEAT=7 MP=4 crop=220,320,860,230 ortho=11.2 pos=0,9.215,36.890 tgt=0,1.315,-0.279 focus=39 exposure=2.45
// the board again while they cheer, arms drawn down and in (pose 5): shown and hidden over 7b, it is the pump of a cheer
//@shot x7-cheer BEAT=8 MP=5 crop=220,180,860,370 ortho=11.2 pos=0,9.215,36.890 tgt=0,1.315,-0.279 focus=39 exposure=2.45
//@shot x2-nosack BEAT=10 NOSACK=1 crop=500,280,490,360 ortho=8.6 pos=0,7.093,23.029 tgt=0,2.103,-0.447
//@shot x2-sack-cut BEAT=10 crop=500,280,490,360 mattein=(mid>59.5&&mid<65.5)||abs(mid-35.0)<0.5||abs(mid-11.0)<0.5 ortho=8.6 pos=0,7.093,23.029 tgt=0,2.103,-0.447
// the press, close on the button: waiting (unlit), the chair's hand down on it (lit), lit and let go
//@shot intro-7p BEAT=7 UNLIT=1 MP=0 matte=0 ortho=3.9 pos=4.3,8.9,39.869 tgt=4.3,1.0,2.7 aperture=0.25 focus=38 exposure=2.45
//@shot intro-7q BEAT=7 MP=0 HAND=1 PRESSED=1 matte=255,258 ortho=3.9 pos=4.3,8.9,39.869 tgt=4.3,1.0,2.7 aperture=0.25 focus=38 exposure=2.45
//@shot intro-7r BEAT=7 MP=0 matte=0 ortho=3.9 pos=4.3,8.9,39.869 tgt=4.3,1.0,2.7 aperture=0.25 focus=38 exposure=2.45
#ifndef BEAT
#define BEAT 0
#endif
#if BEAT >= 3 && BEAT <= 5
#define EDICT
#endif
#if (BEAT >= 6 && BEAT <= 8) || BEAT == 11
#define BUTTON
#endif
#if BEAT == 9 || BEAT == 10 || BEAT >= 12
#define EPI
#endif
#if (BEAT == 7 || BEAT == 8) && !defined(UNLIT)
#define LIT
#endif
// the press, in close-up (intro-7p, 7q, 7r): UNLIT 1 = the button not yet on, HAND 1 = the chair's hand down on it,
// PRESSED 1 = the dome pushed in, MP n = the members' pose (so they are not yet clapping)
#ifndef PRESSED
#define PRESSED 0
#endif

// ---- Father Christmas's pose for each beat (L and R are screen left and screen right) ----
// NB the header of models/fc.glsl has the signs the wrong way round: as rendered, NEGATIVE yaw turns his head to screen left
// (towards the members, the scroll, the trolley) and negative roll tips the top of his head to screen left.
#define FC_CUSTOM
#if (BEAT >= 3 && BEAT <= 8) || BEAT == 11
#define FC_LEGS
#endif
#if (BEAT >= 6 && BEAT <= 8) || BEAT == 11
#define STAGE 3
#endif
#if BEAT == 1          // unimpressed
const float FC_YAW = -0.3, FC_ROLL = -0.12, FC_NOD = 0.05; const vec2 FC_BROW = vec2(-0.05, -0.05); const vec2 FC_BROWR = vec2(0.0, 0.0); const int FC_EYES = 1; const vec2 FC_LOOK = vec2(0.0);
const vec3 FC_EL = vec3(-1.55, 0.95, 0.35), FC_HL = vec3(-0.85, 0.16, 1.15), FC_ER = vec3(1.55, 0.95, 0.35), FC_HR = vec3(1.0, 0.16, 1.2);
#elif BEAT == 2        // wide-eyed
const float FC_YAW = -0.22, FC_ROLL = 0.0, FC_NOD = -0.05; const vec2 FC_BROW = vec2(0.13, 0.13); const vec2 FC_BROWR = vec2(-0.1, -0.1); const int FC_EYES = 3; const vec2 FC_LOOK = vec2(0.0);
const vec3 FC_EL = vec3(-1.55, 0.95, 0.35), FC_HL = vec3(-0.85, 0.16, 1.15), FC_ER = vec3(1.55, 0.95, 0.35), FC_HR = vec3(1.0, 0.16, 1.2);
#elif BEAT == 3 || BEAT == 4   // peering at the edict
const float FC_YAW = -0.5, FC_ROLL = -0.06, FC_NOD = -0.04; const vec2 FC_BROW = vec2(0.07, 0.07); const vec2 FC_BROWR = vec2(-0.08, -0.08); const int FC_EYES = 0; const vec2 FC_LOOK = vec2(0.0, 0.01);
const vec3 FC_EL = vec3(-1.5, 0.6, 0.3), FC_HL = vec3(-1.45, -0.6, 0.5), FC_ER = vec3(1.5, 0.6, 0.3), FC_HR = vec3(1.45, -0.6, 0.5);
#elif BEAT == 5        // frowning at it
const float FC_YAW = -0.5, FC_ROLL = -0.08, FC_NOD = 0.0; const vec2 FC_BROW = vec2(-0.07, -0.07); const vec2 FC_BROWR = vec2(0.32, 0.32); const int FC_EYES = 1; const vec2 FC_LOOK = vec2(0.0);
const vec3 FC_EL = vec3(-1.5, 0.6, 0.3), FC_HL = vec3(-1.45, -0.6, 0.5), FC_ER = vec3(1.5, 0.6, 0.3), FC_HR = vec3(1.45, -0.6, 0.5);
#elif BEAT == 6        // exhausted: asleep on his feet, one hand still on the trolley
#define FC_SLUMP 0.14
const float FC_YAW = -0.15, FC_ROLL = 0.13, FC_NOD = 0.3; const vec2 FC_BROW = vec2(0.03, 0.03); const vec2 FC_BROWR = vec2(-0.2, -0.2); const int FC_EYES = 2; const vec2 FC_LOOK = vec2(0.0);
const vec3 FC_EL = vec3(-1.75, 0.8, 0.3), FC_HL = vec3(-2.3, 0.05, 0.6), FC_ER = vec3(1.5, 0.55, 0.2), FC_HR = vec3(1.5, -0.7, 0.35);
#elif BEAT == 11       // spent: head dropped on his chest, shoulders down, both arms hanging
#define FC_SLUMP 0.26
const float FC_YAW = -0.08, FC_ROLL = 0.07, FC_NOD = 0.62; const vec2 FC_BROW = vec2(0.0, 0.0); const vec2 FC_BROWR = vec2(-0.25, -0.25); const int FC_EYES = 2; const vec2 FC_LOOK = vec2(0.0);
const vec3 FC_EL = vec3(-1.5, 0.42, 0.3), FC_HL = vec3(-1.62, -0.9, 0.5), FC_ER = vec3(1.5, 0.42, 0.25), FC_HR = vec3(1.62, -0.9, 0.45);
#elif BEAT == 7 || BEAT == 8   // awake and grumpy
#define FC_SLUMP 0.04
const float FC_YAW = -0.32, FC_ROLL = -0.05, FC_NOD = 0.04; const vec2 FC_BROW = vec2(-0.08, -0.08); const vec2 FC_BROWR = vec2(0.32, 0.32); const int FC_EYES = 0; const vec2 FC_LOOK = vec2(0.0);
const vec3 FC_EL = vec3(-1.75, 0.8, 0.3), FC_HL = vec3(-2.3, 0.05, 0.6), FC_ER = vec3(1.5, 0.55, 0.2), FC_HR = vec3(1.5, -0.7, 0.35);
#else                  // calm
const float FC_YAW = -0.18, FC_ROLL = 0.0, FC_NOD = 0.02; const vec2 FC_BROW = vec2(0.02, 0.02); const vec2 FC_BROWR = vec2(0.0, 0.0); const int FC_EYES = 0; const vec2 FC_LOOK = vec2(0.0);
const vec3 FC_EL = vec3(-1.55, 0.95, 0.35), FC_HL = vec3(-0.85, 0.16, 1.15), FC_ER = vec3(1.55, 0.95, 0.35), FC_HR = vec3(1.0, 0.16, 1.2);
#endif
//@include models/fc.glsl
//@include models/board.glsl

#define STEPK 0.8
#define TMAX 75.0
#define STEPS 250
#ifndef MASK
#ifdef EDICT
#define FOG 0.0035
#define FOG_LIGHT 0
#else
#define FOG 0.003
#define FOG_LIGHT 0
#define FOG_LIGHT2 1
#endif
#endif

// ---- the set ----
const float WALLZ = -8.0, FLOORY = -3.05, ZB = -4.5, DADO = 1.9, MSP = 3.6;
#ifdef EDICT
const float ZF = 15.5, CZ = -2.9;
#else
const float ZF = 0.0, CZ = -0.4;
#endif
#ifdef EPI
const float MX0 = -7.2;
const vec3 TIE = vec3(0.34, 0.012, 0.016);
const vec3 LA = vec3(-3.84, 9.74, 0.5), LB = vec3(4.25, 9.74, 0.5);
const vec2 PORT = vec2(0.2, 6.0), DASH = vec2(8.68, 6.05), DASHH = vec2(3.47, 2.3);
#else
const float MX0 = -10.66;
const vec3 TIE = vec3(0.07, 0.016, 0.15);
#ifdef EDICT
const vec3 LA = vec3(0.0, 8.35, 1.0), LB = vec3(-7.0, 16.0, 30.0);       // the pendant hangs well forward of the members: any nearer and it burns their heads out
#else
const vec3 LA = vec3(-12.2, 9.64, 0.5), LB = vec3(8.63, 9.64, 0.5);     // over the front edge of the table, so the light gets in under his hat brim
#endif
const vec2 PORT = vec2(-12.75, 4.7), DASH = vec2(-3.57, 7.5), DASHH = vec2(4.74, 2.7);
#endif
const vec2 PRES = vec2(-3.62, 6.18), PRESH = vec2(5.45, 3.2);
#if BEAT == 13
const vec2 EWIN = vec2(-8.05, 5.4), EWINH = vec2(3.75, 2.8);     // a fifth wider, to the right, so the children read; its curtain and pole move with it
const float CURR = 3.95, POLER = -2.7;
#else
const vec2 EWIN = vec2(-8.65, 5.55), EWINH = vec2(3.15, 2.65);
const float CURR = 5.15, POLER = -3.9;
#endif
#ifdef MP
const float MPOSE = float(MP);
#elif BEAT == 7
const float MPOSE = 3.0;
#elif BEAT == 8 || BEAT == 9
const float MPOSE = 2.0;
#else
const float MPOSE = 0.0;
#endif
#ifdef EDICT
const vec3 FCP = vec3(9.7, -0.7, 17.2);
#elif defined(BUTTON)
const vec3 FCP = vec3(11.3, 0.0, 2.7);
#else
const vec3 FCP = vec3(8.9, 0.0, -5.1);
#endif
const float CHX = 8.9;
const vec3 TRO = vec3(4.3, 0.0, 2.7);           // the button's trolley
const vec3 SCR = vec3(0.0, 0.0, 14.0);           // the scroll's foot
const vec3 SACK = vec3(0.1, 0.0, -2.4);
const vec3 WARM = vec3(1.0, 0.72, 0.42), COLD = vec3(0.4, 0.55, 1.0);

// Never more than three lights, so the tracer samples every one of them at every bounce (with more it picks one at random, and
// the bounce light off the lamp-lit puppets turns to speckle). The soft fill and the cold room tone come from sky() instead.
#if defined(LIT) || defined(EDICT) || defined(EPI)
#define NL 3
#else
#define NL 2
#endif
Light getLight(int i) {
#ifdef MASK
  return omni(vec3(0.0, 50.0, 0.0), 1.0, vec3(0.0));
#else
#ifdef EDICT
  if (i == 0) return spot(LA, 0.12, WARM * 420.0, LA + vec3(0.0, -8.0, -4.5), 40.0, 72.0);               // the pendant over the far end
  if (i == 1) return spot(LB, 0.8, vec3(1.0, 0.80, 0.58) * 2300.0, vec3(1.5, 3.0, 14.0), 22.0, 40.0);      // the second lamp, out of shot, on the scroll
  return spot(vec3(17.0, 5.0, -7.2), 1.0, COLD * 300.0, vec3(4.0, 0.0, 2.0), 55.0, 82.0);                  // city light: off to the side so its reflection in the lacquer misses the table, and a spot so the glass behind it stays dark
#else
  if (i == 0) return spot(LA, 0.12, WARM * 430.0, LA + vec3(0.6, -9.0, -2.2), 50.0, 80.0);                 // brass pendants
  if (i == 1) return spot(LB, 0.12, WARM * 430.0, LB + vec3(-0.6, -9.0, -2.2), 50.0, 80.0);
#ifdef EPI
  return spot(vec3(EWIN.x, EWIN.y, -7.0), 0.8, COLD * 170.0, vec3(-2.0, 1.0, -3.0), 55.0, 82.0);           // snow light from the window, pointing into the room so the glass behind it carries no reflection of it
#else
  // the button, lit: its light, hung just in front of and above the dome so it reaches the carpet, the trolley's face, Father
  // Christmas and, over the dome, the nearest members. It is a spot pointing straight down and opening to just past the
  // horizontal: that takes in all of those but not the upper wall, where its reflection would sit in the window as a green sun
  return spot(TRO + vec3(0.0, 3.2, 2.5), 0.3, vec3(0.16, 1.0, 0.36) * 200.0, TRO + vec3(0.0, -3.0, 2.5), 80.0, 95.0);
#endif
#endif
#endif
}
// what is off the set: a soft warm bounce from the camera side (the fill) in a cold blue room
vec3 sky(vec3 rd) {
#ifdef MASK
  return vec3(0.0);
#else
  float f = max(rd.z, 0.0);
  return vec3(1.0, 0.86, 0.72) * 0.36 * f * f + vec3(0.35, 0.48, 0.95) * 0.12 * (0.65 + 0.35 * rd.y);
#endif
}

vec3 brMember(float i) { return vec3(MX0 + MSP * i, 0.0, -5.2); }
float brNearest(float x) { return clamp(floor((x - MX0) / MSP + 0.5), 0.0, 4.0); }

void brLamp(vec3 p, vec3 L, inout float d) {
  float bb = sdBox(p - vec3(L.x, L.y + 3.0, L.z), vec3(1.0, 3.6, 1.0));
  if (bb > 0.15) { d = min(d, bb); return; }
  vec3 q = p - L - vec3(0.0, 0.12, 0.0);
  float cone = sdCapCone(q, 0.32, 0.84, 0.17);
  add(d, max(abs(cone) - 0.013, -0.295 - q.y), cone < 0.0 ? 26.0 : 11.0);      // open underneath: the cut must clear the cap's own shell
  add(d, sdTorus(q - vec3(0.0, -0.3, 0.0), 0.83, 0.022), 11.0);
  add(d, sdRCyl(q - vec3(0.0, 0.43, 0.0), 0.13, 0.11, 0.025), 11.0);
  add(d, sdCapsule(p, L + vec3(0.0, 0.6, 0.0), L + vec3(0.0, 6.4, 0.0), 0.022), 24.0);
  add(d, sdSphere(p - L - vec3(0.0, 0.03, 0.0), 0.11), 27.0);
}
// a framed panel on the wall: returns the frame, sets `inner` to the flat sheet inside it
float brFramed(vec3 p, vec2 c, vec2 h, float w, float r, out float inner) {
  vec3 q = vec3(p.xy - c, p.z - WALLZ);
  float fr = extrudeR(sdBox2(q.xy, h + w - r) - r, q.z - 0.16, 0.1, 0.03);
  fr = max(fr, -sdBox(q, vec3(h, 1.0)));
  inner = sdBox(q - vec3(0.0, 0.0, 0.17), vec3(h, 0.02));
  return fr;
}
// rubber stamp: the rubber face is y = 0, the handle goes up +y
float brStamp(vec3 q, out float part) {
  float wood = sdRBox(q - vec3(0.0, 0.52, 0.0), vec3(2.5, 0.36, 0.66), 0.09);
  wood = smin(wood, sdCone(q, vec3(0.0, 0.8, 0.0), vec3(0.0, 2.5, 0.0), 0.42, 0.24), 0.25);
  wood = smin(wood, sdEllipsoid(q - vec3(0.0, 3.0, 0.0), vec3(0.66, 0.6, 0.66)), 0.12);
  float rub = sdRBox(q - vec3(0.0, 0.08, 0.0), vec3(2.57, 0.08, 0.73), 0.03);       // the red pad shows as a rim round the block
  part = rub < wood ? 1.0 : 0.0;
  return min(wood, rub);
}
// a wrapped box with a ribbon both ways
float brGift(vec3 q, vec3 h, out float rib) {
  float box = sdRBox(q, h, 0.035);
  float r = min(sdRBox(q, vec3(0.09, h.y + 0.012, h.z + 0.012), 0.01), sdRBox(q, vec3(h.x + 0.012, h.y + 0.012, 0.09), 0.01));
  rib = r < box ? 1.0 : 0.0;
  return min(box, r);
}

#if BEAT == 13
// ---- the children at the window: small felt puppets, woolly hats, mittens on the glass ----
float brKidR(float k) { return 0.48 + 0.08 * hash1(k * 3.7 + 1.0); }      // head radius: they are not all the same age
vec3 brKidPos(float k) {                               // centre of each head; three to each side of the middle glazing bar
  float x = k < 2.5 ? -11.17 + 1.22 * k : -7.37 + 1.22 * (k - 3.0);
  return vec3(x, 3.8 + 0.5 * hash1(k * 7.31 + 2.0), WALLZ - brKidR(k) - 0.06);
}
float brKidAt(float x) { return x < EWIN.x ? clamp(floor((x + 11.17) / 1.22 + 0.5), 0.0, 2.0) : 3.0 + clamp(floor((x + 7.37) / 1.22 + 0.5), 0.0, 2.0); }
vec3 brKidCol(float k) {
  k = mod(k, 6.0);
  return k < 0.5 ? srgb(0.74, 0.10, 0.09) : k < 1.5 ? srgb(0.92, 0.68, 0.12) : k < 2.5 ? srgb(0.12, 0.45, 0.26) : k < 3.5 ? srgb(0.16, 0.36, 0.72) : k < 4.5 ? srgb(0.90, 0.44, 0.60) : srgb(0.46, 0.25, 0.66);
}
void brKid(vec3 q, float s, inout float d) {           // q: from the centre of the head, facing +z; s: size (1 = a head of radius 0.43)
  float bb = length(q - vec3(0.0, -0.3, 0.0) * s) - 1.4 * s;
  if (bb > 0.15) { d = min(d, bb); return; }
  q /= s; const float R = 0.43;
  vec3 m = vec3(abs(q.x), q.y, q.z);
  add(d, sdSphere(q, R) * s, 70.0);
  add(d, sdSphere(m - vec3(0.15, -0.03, sqrt(R * R - 0.0234) - 0.014), 0.06) * s, 74.0);             // bead eyes
  add(d, sdSphere(q - vec3(0.0, -0.13, sqrt(R * R - 0.0169) + 0.01), 0.05) * s, 75.0);               // nose
  float hat = max(sdSphere(q - vec3(0.0, 0.05, -0.02), R + 0.055), 0.2 - q.y) - 0.008 * sin(atan(q.x, q.z) * 22.0);
  hat = min(hat, sdTorus(q - vec3(0.0, 0.24, -0.02), R - 0.01, 0.085));                              // rolled brim
  hat = min(hat, sdSphere(q - vec3(0.0, R + 0.2, -0.02), 0.15) - 0.02 * (noise(q * 40.0) - 0.5));    // bobble
  add(d, hat * 0.8 * s, 71.0);
  vec3 hand = vec3(0.43, -0.24, 0.38);
  float coat = sdEllipsoid(q - vec3(0.0, -R - 0.55, -0.08), vec3(0.56, 0.62, 0.36));
  coat = smin(coat, sdCapsule(m, vec3(0.42, -R - 0.3, 0.0), hand - vec3(0.0, 0.12, 0.08), 0.13), 0.08);
  add(d, coat * s, 72.0);
  float mit = sdEllipsoid(m - hand, vec3(0.17, 0.2, 0.09));
  mit = smin(mit, sdEllipsoid(m - hand - vec3(-0.15, -0.04, 0.0), vec3(0.07, 0.1, 0.07)), 0.04);
  add(d, mit * s, 73.0);
}
#endif

float map(vec3 p) {
  float d = 1e9; gM = 0.0; float bb;
  float wz = p.z - WALLZ;
#if BEAT == 13
  // here the wall is a thin skin with the window cut through it: the children stand outside it, in front of the snow backdrop
  add(d, max(max(wz, -wz - 0.15), -sdBox2(p.xy - EWIN, EWINH)), 5.0);
  add(d, wz + 2.4, 16.0);
#else
  add(d, wz, 5.0);
#endif
  add(d, p.y - FLOORY, 6.0);

  // ---- the back wall: panelling, pictures, windows ----
  bb = wz - 0.75;
  if (bb > 0.15) d = min(d, bb); else {
    float mould = sdBox2(vec2(p.y - DADO, wz), vec2(0.1, 0.09)) - 0.03;                            // dado rail
    mould = min(mould, sdBox2(vec2(p.y - FLOORY - 0.32, wz), vec2(0.3, 0.05)) - 0.03);              // skirting
    mould = min(mould, sdBox2(vec2(p.y - 10.5, wz), vec2(0.09, 0.07)) - 0.03);                      // picture rail
    float sx = (p.x - 2.5) - 4.2 * floor((p.x - 2.5) / 4.2 + 0.5);
    float stile = max(sdBox2(vec2(sx, wz), vec2(0.15, 0.04)) - 0.025, max(DADO - p.y, p.y - 10.5));
#if BEAT == 13
    stile = max(stile, -sdBox2(p.xy - EWIN, EWINH + 0.1));                                          // none across the open window
#endif
    mould = min(mould, stile);
    add(d, mould, 5.0);
    float inner, fr;
#ifndef EDICT
    fr = brFramed(p, PORT, vec2(1.35, 1.7), 0.3, 0.06, inner);                                      // the founder, faceless
    add(d, fr, 11.0); add(d, inner, 12.0);
#endif
#if BEAT <= 2 || BEAT == 6 || BEAT == 11
    fr = brFramed(p, PRES, PRESH, 0.13, 0.04, inner);                                               // presentation board
    add(d, fr, 10.0); add(d, inner, 30.0);
#endif
#if BEAT >= 7 && BEAT != 11
    fr = brFramed(p, DASH, DASHH, 0.24, 0.2, inner);                                                // the dashboard's enamel board
    add(d, fr, 11.0); add(d, inner, 34.0);
#endif
#ifdef EPI
    vec3 w = vec3(p.xy - EWIN, wz);
    float frame = max(sdRBox(w - vec3(0.0, 0.0, 0.13), vec3(EWINH + 0.22, 0.13), 0.03), -sdBox(w, vec3(EWINH, 1.0)));
    frame = min(frame, min(sdBox(w - vec3(0.0, 0.0, 0.14), vec3(0.055, EWINH.y, 0.06)), sdBox(w - vec3(0.0, 0.0, 0.14), vec3(EWINH.x, 0.055, 0.06))));
    frame = min(frame, sdRBox(w - vec3(0.0, -EWINH.y - 0.3, 0.22), vec3(EWINH.x + 0.45, 0.08, 0.24), 0.02));
    add(d, frame, 14.0);
#if BEAT == 13
    bb = sdBox(w - vec3(0.0, -1.2, -0.5), vec3(EWINH.x + 0.4, 2.6, 1.0));
    if (bb > 0.15) d = min(d, bb); else for (int k = 0; k < 6; k++) { float fk = float(k); brKid(p - brKidPos(fk), brKidR(fk) / 0.43, d); }
#else
    add(d, sdBox(w - vec3(0.0, 0.0, 0.1), vec3(EWINH, 0.02)), 16.0);
#endif
    // red curtains drawn back, on a brass pole
    float cx = p.x < -9.0 ? p.x + 12.45 : p.x + CURR;
    float cur = sdRBox(vec3(cx, p.y - 5.25, wz - 0.42 - 0.11 * sin(cx * 13.0 + 0.6 * sin(p.y * 0.8))), vec3(0.62, 3.65, 0.07), 0.05);
    add(d, cur * 0.6, 17.0);
    float pole = sdCapsule(p, vec3(-13.6, 8.98, WALLZ + 0.45), vec3(POLER, 8.98, WALLZ + 0.45), 0.075);
    float pm = 0.5 * (POLER - 13.6);
    pole = min(pole, sdSphere(vec3(abs(p.x - pm) - (POLER - pm) - 0.1, p.y - 8.98, wz - 0.45), 0.17));
    add(d, pole, 11.0);
#else
    float wi = clamp(floor((p.x - 5.0) / 4.1 + 0.5), 0.0, 2.0);
    vec3 w = vec3(p.x - 5.0 - 4.1 * wi, p.y - 4.93, wz);
    float frame = max(sdRBox(w - vec3(0.0, 0.0, 0.13), vec3(1.92, 4.72, 0.13), 0.03), -sdBox(w, vec3(1.8, 4.6, 1.0)));
    frame = min(frame, sdBox(w - vec3(0.0, 1.6, 0.14), vec3(1.8, 0.05, 0.06)));
    frame = min(frame, sdRBox(vec3(p.x - 9.1, p.y - 0.14, wz - 0.22), vec3(6.25, 0.07, 0.24), 0.02));
    add(d, frame, 14.0);
    add(d, sdBox(w - vec3(0.0, 0.0, 0.1), vec3(1.8, 4.6, 0.02)), 15.0);
#endif
  }

  // ---- the table ----
  float tz = 0.5 * (ZF + ZB), th = 0.5 * (ZF - ZB);
  bb = sdBox(p - vec3(0.0, -1.5, tz), vec3(14.2, 1.7, th + 0.2));
  if (bb > 0.15) d = min(d, bb); else {
    add(d, sdRBox(p - vec3(0.0, -0.16, tz), vec3(14.0, 0.16, th), 0.05), 7.0);
    float pan = sdRBox(p - vec3(0.0, -1.6, ZF - 0.4), vec3(13.3, 1.3, 0.07), 0.02);
    vec2 g = vec2(repLim(p.x, 5.32, -2.0, 2.0), p.y + 1.6);
    pan = max(pan, -max(abs(sdBox2(g, vec2(2.4, 0.98))) - 0.022, ZF - 0.37 - p.z));
    add(d, pan, 8.0);
    vec3 lq = vec3(abs(p.x) - 13.45, p.y + 1.67, abs(p.z - tz) - (th - 0.4));
    add(d, sdRBox(lq, vec3(0.3, 1.37, 0.3), 0.04), 7.0);
#if BEAT == 10
    vec3 pl = p - vec3(0.0, -1.6, ZF - 0.33);
    add(d, extrudeR(sdBox2(pl.xy, vec2(2.1, 0.55) - 0.06) - 0.06, pl.z, 0.035, 0.012), 36.0);
    add(d, sdSphere(vec3(abs(pl.x) - 1.95, abs(pl.y) - 0.4, pl.z - 0.03), 0.035), 11.0);
#endif
  }
  // tent name cards
  {
    vec3 c = p - vec3(MX0 + MSP * brNearest(p.x), 0.0, CZ);
    bb = sdBox(c - vec3(0.0, 0.3, 0.0), vec3(1.0, 0.33, 0.24));
    if (bb > 0.15) d = min(d, bb); else {
      vec3 f = vec3(c.x, c.y - 0.287, abs(c.z) - 0.089); f.yz = rot(-0.3) * f.yz;
      add(d, sdBox(f, vec3(0.95, 0.3, 0.011)) * 0.9, 31.0);
    }
  }

  // ---- the board ----
#if BEAT == 12
  { float mi = brNearest(p.x); mBoard(p - brMember(2.0), d, 1.0); if (abs(mi - 2.0) > 0.5) mBoard(p - brMember(mi), d, 0.0); }   // the middle one has a hand up
#else
  mBoard(p - brMember(brNearest(p.x)), d, MPOSE);      // five identical figures, each inside its own 3.6-wide cell: only the nearest one counts
#endif

  // ---- Father Christmas and his chair ----
#if !defined(EPI) && !defined(NOFC)
  mFC(p - FCP, d);
#endif
#ifndef EDICT
#ifndef EPI
  {
    vec3 c = p - vec3(CHX, 1.55, -6.1);
    bb = sdBox(c, vec3(2.0, 2.4, 0.5));
    if (bb > 0.15) d = min(d, bb); else {
      float back = sdRBox(c, vec3(1.78, 2.15, 0.16), 0.5);
      vec2 g = vec2(c.x, c.y); g.x += 0.3 * step(1.0, mod(floor(g.y / 0.6), 2.0));
      vec2 cell = vec2(repLim(g.x, 0.6, -3.0, 3.0), repLim(g.y, 0.6, -3.0, 3.0));
      float tuft = length(cell);
      back += 0.05 * exp(-tuft * tuft * 22.0) * step(0.0, c.z) - 0.02 * (1.0 - exp(-tuft * tuft * 5.0)) * step(0.0, c.z);
      add(d, back * 0.8, 9.0);
      add(d, sdEllipsoid(vec3(cell, c.z - 0.13), vec3(0.045, 0.045, 0.03)), 11.0);
    }
  }
#endif
#endif

  // ---- pendant lamps ----
  brLamp(p, LA, d);
#ifndef EDICT
  brLamp(p, LB, d);
#endif

#ifdef EDICT
  // ---- the edict: a parchment scroll on wooden rollers, held up on two brass posts ----
  vec3 s = p - SCR;
  bb = sdBox(s - vec3(0.0, 4.8, 0.0), vec3(5.3, 5.2, 0.7));
  if (bb > 0.15) d = min(d, bb); else {
    add(d, sdBox(s - vec3(0.0, 4.85, 0.0), vec3(4.15, 4.45, 0.018)), 32.0);
    vec3 r = vec3(s.x, abs(s.y - 4.85) - 4.45, s.z + 0.3);
    add(d, sdRCyl(r.yxz, 0.36, 4.15, 0.03), 32.0);                                                 // the paper rolled on each roller
    float rol = sdRCyl(r.yxz, 0.2, 4.75, 0.04);
    vec3 e = vec3(abs(s.x) - 4.78, r.y, r.z);
    rol = smin(rol, sdEllipsoid(e, vec3(0.3, 0.3, 0.3)), 0.1);
    add(d, rol, 40.0);
    add(d, sdTorus(vec3(e.y, e.x + 0.42, e.z), 0.24, 0.06), 11.0);
    vec3 po = vec3(abs(s.x) - 4.45, s.y, s.z + 0.3);
    float post = sdCapsule(po, vec3(0.0, 0.0, -0.36), vec3(0.0, 9.3, -0.36), 0.07);
    post = min(post, sdRCyl(po - vec3(0.0, 0.06, -0.36), 0.42, 0.06, 0.03));
    add(d, post, 11.0);
  }
  // the stamp
  {
#if BEAT == 3
    vec3 q = vec3(p.x - 0.3, p.z - SCR.z - 0.022, -(p.y - 3.0));
    bb = sdBox(p - vec3(0.3, 3.0, SCR.z + 1.9), vec3(2.8, 1.0, 2.1));
#else
    vec3 c = p - vec3(-8.9, 0.66, 10.0); vec3 ax = normalize(vec3(-0.42, 0.0, -0.91));
    vec3 q = vec3(dot(c, vec3(ax.z, 0.0, -ax.x)), dot(c, ax) + 1.5, c.y);
    bb = length(c) - 3.4;
#endif
    if (bb > 0.15) d = min(d, bb); else { float part; float st = brStamp(q, part); add(d, st, 41.0 + part); }
  }
#endif

#if defined(BUTTON) && !defined(NOTROLLEY)
  // ---- the button on its trolley ----
  vec3 t = p - TRO;
  bb = sdBox(t - vec3(0.3, -0.4, 0.0), vec3(4.6, 2.9, 2.6));
  if (bb > 0.15) d = min(d, bb); else {
    float body = sdRBox(t - vec3(0.0, -1.05, 0.0), vec3(3.4, 1.15, 2.1), 0.08);
    body = min(body, sdRBox(t - vec3(0.0, 0.17, 0.0), vec3(3.55, 0.09, 2.25), 0.05));
    body = min(body, sdRBox(t - vec3(0.0, -2.3, 0.0), vec3(3.5, 0.08, 2.2), 0.04));
    vec3 c = vec3(abs(t.x) - 2.9, t.y + 2.73, abs(t.z) - 1.7);
    body = min(body, sdRBox(vec3(abs(c.x) - 0.19, c.y - 0.14, c.z), vec3(0.03, 0.26, 0.13), 0.012));      // castor forks
    // push handle on the right-hand end
    vec3 hq = vec3(t.x - 3.4, t.y, abs(t.z) - 1.5);
    float han = sdCapsule(hq, vec3(0.0, -0.4, 0.0), vec3(0.85, 0.3, 0.0), 0.07);
    han = min(han, sdCapsule(t, vec3(4.25, 0.3, -1.5), vec3(4.25, 0.3, 1.5), 0.085));
    add(d, min(body, han), 20.0);
    add(d, sdRCyl(vec3(c.y, c.x, c.z), 0.32, 0.13, 0.05), 22.0);
    add(d, sdRCyl(vec3(c.y, c.x, c.z), 0.09, 0.2, 0.02), 11.0);
    add(d, sdRCyl(t - vec3(0.0, 0.5, 0.0), 2.2, 0.26, 0.09), 11.0);                                 // brass collar
    add(d, max(sdEllipsoid(t - vec3(0.0, 0.72 - 0.24 * float(PRESSED), 0.0), vec3(1.95, 1.55, 1.95)), 0.7 - t.y), 23.0);    // the dome (it sinks into its collar when pressed)
    vec3 pl = t - vec3(0.0, -1.05, 2.1);
    float fr = extrudeR(sdBox2(pl.xy, vec2(3.12, 1.0) - 0.1) - 0.1, pl.z, 0.07, 0.025);
    fr = max(fr, -sdBox(pl, vec3(2.9, 0.78, 1.0)));
    add(d, fr, 11.0);
    add(d, sdBox(pl - vec3(0.0, 0.0, 0.02), vec3(2.9, 0.78, 0.02)), 33.0);
  }
#ifdef HAND
  {
    // the chair's hand, come down from above to press it: a sleeve, a cuff and a hand in the members' own cloth and resin,
    // far bigger than they are, as a hand reaching in close to the camera would be
    vec3 hc = vec3(-0.1, 2.27 - 0.24 * float(PRESSED) + 0.34, 0.3), far = vec3(-5.4, 12.6, 1.0), dir = normalize(hc - far), wr = hc - dir * 0.8;
    add(d, sdCone(t, far, wr - dir * 0.25, 0.78, 0.6) - 0.003 * (noise(p * 120.0) - 0.5), 255.0);
    add(d, sdCone(t, wr - dir * 0.34, wr + dir * 0.08, 0.66, 0.64), 256.0);
    vec3 hq = t - hc;
    float hand = sdEllipsoid(hq, vec3(0.68, 0.4, 0.62));
    hand = smin(hand, sdEllipsoid(hq - vec3(0.52, -0.06, 0.4), vec3(0.3, 0.2, 0.22)), 0.15);
    add(d, hand, 258.0);
  }
#endif
#endif

#if BEAT == 10 && !defined(NOSACK)
  // ---- the sack of returns, dumped on the table ----
  vec3 s = p - SACK;
  bb = sdBox(s - vec3(-0.5, 2.4, 0.0), vec3(3.9, 2.7, 2.2));
  if (bb > 0.15) d = min(d, bb); else {
    float body = sdEllipsoid(s - vec3(0.0, 1.55, 0.0), vec3(2.35, 1.75, 1.6));
    body = smin(body, sdEllipsoid(s - vec3(-0.25, 0.7, 0.0), vec3(2.55, 0.85, 1.65)), 0.4);
    body = smin(body, sdCone(s, vec3(0.2, 2.8, 0.0), vec3(0.5, 3.7, 0.0), 0.95, 1.08), 0.5);
    body = smax(body, -sdCone(s, vec3(0.38, 3.3, 0.0), vec3(0.62, 4.3, 0.0), 0.82, 1.0), 0.08);
    body = max(body, -s.y);
    body -= 0.09 * (fbm3(s * 1.5 + 2.0) - 0.5) + 0.006 * sin(s.x * 60.0) * sin(s.y * 60.0);
    add(d, body * 0.7, 60.0);
    vec3 tq = s - vec3(0.24, 2.95, 0.0); tq.xy = rot(0.3) * tq.xy;
    add(d, (sdTorus(tq, 0.98, 0.075) - 0.012 * sin(atan(tq.z, tq.x) * 40.0)) * 0.8, 61.0);         // the drawstring
    add(d, sdBox(s - vec3(0.15, 1.5, 1.66), vec3(1.05, 0.5, 0.014)), 35.0);                        // sewn-on label
    float rib; float gb;
    vec3 b1 = s - vec3(0.95, 4.1, 0.1); b1.xy = rot(0.5) * b1.xy; b1.xz = rot(0.4) * b1.xz;
    gb = brGift(b1, vec3(0.52, 0.45, 0.48), rib); add(d, gb, rib > 0.5 ? 11.0 : 62.0);
    vec3 b2 = s - vec3(-3.4, 0.42, 1.0); b2.xz = rot(-0.5) * b2.xz;
    gb = brGift(b2, vec3(0.55, 0.42, 0.5), rib); add(d, gb, rib > 0.5 ? 11.0 : 63.0);
    // a teddy's arm, reaching out of the top
    float arm = sdCone(s, vec3(0.3, 3.5, 0.35), vec3(-1.15, 4.55, 0.6), 0.38, 0.34);
    arm = smin(arm, sdSphere(s - vec3(-1.3, 4.66, 0.62), 0.4), 0.15);
    float fur = 0.02 * (noise(s * 34.0) - 0.5);
    add(d, (arm - fur) * 0.8, 64.0);
    add(d, sdEllipsoid(s - vec3(-1.36, 4.7, 0.95), vec3(0.24, 0.24, 0.1)), 65.0);
  }
#endif
  return d;
}

// the city across the road: two rows of blocks with a few offices still lit
vec3 brCity(vec2 q) {
  vec3 col = mix(vec3(0.034, 0.055, 0.15), vec3(0.008, 0.014, 0.05), sat((q.y - 0.5) / 8.0));
  for (int L = 0; L < 2; L++) {
    float fl = float(L), w = L == 0 ? 1.9 : 1.3;
    float u = q.x / w + fl * 0.37, xi = floor(u), fx = fract(u);
    float h = (L == 0 ? 3.4 : 1.2) + (L == 0 ? 4.2 : 3.4) * hash1(xi * 7.3 + fl * 19.0);
    if (q.y < h && fx > 0.05 && fx < 0.95) {
      col = L == 0 ? vec3(0.024, 0.04, 0.11) : vec3(0.012, 0.02, 0.062);
      vec2 g = vec2(fx * (L == 0 ? 6.0 : 5.0), q.y * 3.0), gi = floor(g), gf = fract(g);
      float lit = step(0.86, hash1(gi + vec2(xi * 13.1, fl * 5.0)));
      float win = step(0.28, gf.x) * step(gf.x, 0.72) * step(0.25, gf.y) * step(gf.y, 0.75) * step(q.y, h - 0.35);
      col += vec3(1.0, 0.70, 0.36) * lit * win * (L == 0 ? 0.6 : 1.1);
    }
  }
  return col;
}
vec3 brSnow(vec2 q) {
  vec3 col = mix(vec3(0.03, 0.05, 0.14), vec3(0.008, 0.014, 0.05), sat(q.y * 0.3 + 0.5));
  float hill = -0.9 + 0.75 * sin(q.x * 0.55 + 1.0) + 0.25 * sin(q.x * 1.7);
  float hill2 = -1.6 + 0.5 * sin(q.x * 0.8 + 4.0);
  if (q.y < hill) col = vec3(0.20, 0.25, 0.42) * (0.85 + 0.2 * noise(q * 3.0));
  if (q.y < hill2) col = vec3(0.30, 0.36, 0.55);
  for (int k = 0; k < 2; k++) {                      // falling flakes, round, near ones and far ones
    float fk = float(k);
    vec2 f = q * (1.9 + 1.6 * fk) + fk * 7.3; vec2 fi = floor(f); vec2 o = hash2(fi + fk * 31.0) - 0.5;
    float r = 0.07 + 0.06 * hash1(fi + 3.3);
    col += vec3(0.75, 0.85, 1.0) * (1.0 - smoothstep(r * 0.55, r, length(fract(f) - 0.5 - 0.7 * o))) * step(0.4, hash1(fi + 9.1)) * (0.8 - 0.3 * fk);
  }
  return col;
}

void shade(float id, vec3 p, inout vec3 n, inout Mat m) {
#ifdef MASK
  m.col = vec3(0.0); m.rough = 1.0;
  if (id > 29.5 && id < 36.5) {
    float k = id - 30.0;
    m.emit = 0.45 * (k < 0.5 ? vec3(1, 0, 0) : k < 1.5 ? vec3(0, 1, 0) : k < 2.5 ? vec3(0, 0, 1) : k < 3.5 ? vec3(1, 1, 0) : k < 4.5 ? vec3(0, 1, 1) : k < 5.5 ? vec3(1, 0, 1) : vec3(1, 1, 1));
  }
  return;
#else
#ifndef EPI
  if (shFC(id, p - FCP, n, m)) return;
#endif
  if (id > 249.5) {
    // (255, 256, 258: the chair's hand over the button, in the same cloth, cuff and resin as the members but with ids of its
    // own, so a matte can pick it out from the member it passes in front of)
    shBoard(id > 254.5 && id < 258.5 ? id - 5.0 : id, p - brMember(brNearest(p.x)), n, m, TIE);
    if (id < 250.5) m.col *= 1.7;                   // the model's suit is near black: lifted here so the figures stand off the navy wall
    return;
  }
  if (id < 5.5) {                                    // painted panelling: navy above the rail, boarded below
    float low = step(p.y, DADO - 0.05);
    matPaint(m, n, p * 0.5, mix(srgb(0.08, 0.14, 0.36), srgb(0.07, 0.11, 0.26), low), 0.3, 0.0, vec3(0.2), 0.0);
    float joint = smoothstep(0.46, 0.5, abs(fract(p.x / 0.82) - 0.5)) * low;
    m.col *= (1.0 - 0.55 * joint) * (0.92 + 0.16 * hash1(floor(p.x / 0.82 + 0.5) + 3.0) * low);
    return;
  }
  if (id < 6.5) {                                    // deep red carpet
    float pile = noise(p.xz * 90.0), blot = fbm(p.xz * 0.9);
    m.col = srgb(0.235, 0.03, 0.05) * (0.7 + 0.5 * pile) * (0.8 + 0.4 * blot); m.rough = 1.0; m.sheen = 0.45; m.sheenCol = srgb(0.92, 0.55, 0.52);
    n = normalize(n + 0.5 * (hash3(p * 400.0) - 0.5));
#ifdef EPI
    m.col *= 0.68; m.sheen = 0.3;                    // both pendants hang right over it in this dressing: keep it deep red
#endif
    return;
  }
  if (id < 7.5) {                                    // the table: polished walnut boards running its length
    float bz = p.z / 2.3 + 0.37, bi = floor(bz);
#ifdef EDICT
    matWood(m, n, p * vec3(0.22, 1.3, 1.3) + vec3(bi * 5.3, 3.0, 1.0), vec3(1.0, 0.02, 0.03), 0.86, 0.9);
#else
    matWood(m, n, p * vec3(0.3, 2.4, 2.4) + vec3(bi * 5.3, 3.0, 1.0), vec3(1.0, 0.02, 0.03), 0.88, 0.92);
#endif
    float joint = smoothstep(0.488, 0.5, abs(fract(bz) - 0.5)) * step(-0.01, p.y);
    m.col *= (0.86 + 0.26 * hash1(bi + 5.0)) * (1.0 - 0.5 * joint);
    return;
  }
  if (id < 8.5) { matWood(m, n, p * vec3(2.2, 0.35, 2.2), vec3(0.03, 1.0, 0.02), 1.0, 0.55); m.col *= 0.5; return; }
  if (id < 9.5) { matLeather(m, n, p * 0.7, srgb(0.06, 0.20, 0.13), 0.6); return; }
  if (id < 10.5) { matPaint(m, n, p, srgb(0.16, 0.16, 0.18), 0.6, 0.1, srgb(0.5, 0.5, 0.52), 1.0); return; }
  if (id < 11.5) { matMetal(m, n, p, 1, vec3(1, 0, 0)); return; }
  if (id < 12.5) {                                   // the portrait: oils, a grey figure with no face
    vec2 q = p.xy - PORT;
    vec3 c = mix(srgb(0.20, 0.23, 0.32), srgb(0.08, 0.095, 0.15), sat(length(q * vec2(0.6, 0.5)) * 0.9));
    float sh = length((q - vec2(0.0, -1.75)) / vec2(1.12, 1.25)) - 1.0;
    float hd = length((q - vec2(0.0, 0.42)) / vec2(0.5, 0.62)) - 1.0;
    c = mix(c, srgb(0.25, 0.28, 0.36), 1.0 - smoothstep(-0.03, 0.03, sh));
    c = mix(c, srgb(0.50, 0.035, 0.05), (1.0 - smoothstep(0.0, 0.03, abs(q.x) - 0.1 + 0.04 * (q.y + 1.2))) * step(q.y, -0.58) * step(sh, 0.0));
    c = mix(c, srgb(0.52, 0.55, 0.62) * (0.8 + 0.3 * sat(0.5 - q.x + q.y * 0.5)), 1.0 - smoothstep(-0.03, 0.03, hd));
    m.col = c * (0.88 + 0.24 * fbm3(vec3(q * 7.0, 1.0))); m.rough = 0.4; m.coat = 0.5; m.coatRough = 0.15;
    bumpN(n, p, 40.0, 0.5);
    return;
  }
  if (id < 14.5) { matPaint(m, n, p * 0.6, srgb(0.15, 0.17, 0.22), 0.5, 0.25, srgb(0.3, 0.2, 0.12), 0.8); return; }
  // the glass is a little dull on purpose: a clean pane throws a ghost of his hat above his head
  if (id < 15.5) { m.col = vec3(0.02); m.rough = 0.3; m.coat = 0.5; m.coatRough = 0.3; m.emit = brCity(p.xy) * 1.8; return; }
#if BEAT == 13
  // the backdrop stands 2.5 behind the pane: shifted up by what the 12-degree camera takes off, so the snow sits where it does in epi-1
  if (id < 16.5) { m.col = vec3(0.02); m.rough = 0.6; m.emit = brSnow(p.xy - vec2(-8.65, 5.55) + vec2(0.0, 0.53)) * 5.0; return; }
#else
  if (id < 16.5) { m.col = vec3(0.02); m.rough = 0.3; m.coat = 0.5; m.coatRough = 0.3; m.emit = brSnow(p.xy - EWIN) * 5.0; return; }
#endif
  if (id < 17.5) {                                   // velvet
    float cx = p.x < -9.0 ? p.x + 12.45 : p.x + CURR;
    m.col =srgb(0.46, 0.045, 0.06) * (0.75 + 0.25 * sin(cx * 13.0 + 0.6 * sin(p.y * 0.8))) * (0.85 + 0.3 * noise(p * 60.0));
    m.rough = 0.9; m.sheen = 1.0; m.sheenCol = srgb(1.0, 0.45, 0.42);
    n = normalize(n + 0.3 * (hash3(p * 600.0) - 0.5));
    return;
  }
  if (id < 20.5) { matMetal(m, n, p, 0, vec3(1, 0, 0)); float seam = smoothstep(0.03, 0.0, abs(abs((p - TRO).x) - 2.86)) * step(p.z - TRO.z, 2.2); m.col *= 1.0 - 0.4 * seam; return; }
  if (id < 22.5) { matRubber(m, n, p, srgb(0.035, 0.035, 0.04)); return; }
  if (id < 23.5) {                                   // the button: a moulded green dome
    m.col = srgb(0.04, 0.34, 0.13); m.rough = 0.1 + 0.1 * smudge(p); m.coat = 1.0; m.coatRough = 0.04;
#ifdef LIT
    float f = sat(dot(n, normalize(vec3(0.0, 0.25, 1.0))));
    m.col = vec3(0.0, 0.02, 0.006);                  // lit from inside: the colour is its own light, not the lamp's on its skin
    m.emit = vec3(0.04, 1.0, 0.22) * (0.3 + 0.65 * f * f);
#endif
    return;
  }
  if (id < 24.5) { matRubber(m, n, p, srgb(0.03, 0.03, 0.033)); m.rough = 0.5; return; }
  if (id < 26.5) { m.col = srgb(0.93, 0.90, 0.82) * (0.85 + 0.2 * fbm3(p * 9.0)); m.rough = 0.35; m.coat = 0.5; return; }
  if (id < 27.5) { m.col = vec3(0.0); m.glow = vec3(1.0, 0.72, 0.36) * 28.0; return; }
  if (id < 30.5) { matPaper(m, n, p, 0, srgb(0.93, 0.89, 0.79)); m.col *= 0.96 + 0.06 * fbm3(p * 0.8); return; }      // presentation board
  if (id < 31.5) { matPaper(m, n, p, 1, srgb(0.95, 0.94, 0.90)); return; }                                           // name cards
  if (id < 32.5) {                                   // parchment
    matPaper(m, n, p, 0, srgb(0.91, 0.85, 0.70));
    vec2 q = abs(p.xy - vec2(SCR.x, 4.85));
    float edge = min(4.15 - q.x, 4.9 - q.y) + 0.25 * (fbm3(p * 2.0) - 0.5);
    m.col *= (0.9 + 0.14 * fbm3(p * 1.1 + 5.0)) * mix(vec3(0.80, 0.70, 0.52), vec3(1.0), smoothstep(0.0, 0.55, edge));
    return;
  }
  if (id < 33.5) { m.col = srgb(0.035, 0.06, 0.075); m.rough = 0.16 + 0.14 * smudge(p); m.coat = 1.0; m.coatRough = 0.05; bumpN(n, p, 60.0, 0.12); return; }   // trolley plate: dark enamel
  if (id < 34.5) { m.col = srgb(0.045, 0.22, 0.13) * (0.94 + 0.1 * fbm3(p * 1.5)); m.rough = 0.2 + 0.14 * smudge(p); m.coat = 0.9; m.coatRough = 0.06; bumpN(n, p, 60.0, 0.12); return; }   // dashboard board: green enamel
  if (id < 35.5) { matPaper(m, n, p, 1, srgb(0.93, 0.88, 0.74)); return; }                                           // sack label
  if (id < 36.5) {                                   // table plate: satin brass with an engraved border line
    matMetal(m, n, p, 1, vec3(1, 0, 0)); m.rough = max(m.rough, 0.3);
    vec2 q = abs(p.xy - vec2(0.0, -1.6)); float e = min(2.1 - q.x, 0.55 - q.y);
    m.col *= 1.0 - 0.5 * (1.0 - smoothstep(0.0, 0.016, abs(e - 0.1)));
    return;
  }
  if (id < 40.5) { matWood(m, n, p * vec3(0.5, 2.5, 2.5), vec3(1.0, 0.02, 0.03), 0.55, 0.8); return; }
  if (id < 41.5) { matWood(m, n, p * 1.6, vec3(0.03, 0.3, 1.0), 0.62, 0.75); return; }
  if (id < 42.5) { matRubber(m, n, p, srgb(0.62, 0.07, 0.06)); return; }
  if (id < 60.5) {                                   // hessian
    float w = 0.5 + 0.5 * sin(p.x * 60.0) * sin(p.y * 60.0);
    m.col = srgb(0.66, 0.48, 0.27) * (0.62 + 0.45 * w) * (0.8 + 0.4 * fbm3(p * 2.5)); m.rough = 0.95; m.sheen = 0.5; m.sheenCol = srgb(1.0, 0.85, 0.6);
    n = normalize(n + 0.45 * (hash3(p * 300.0) - 0.5));
    return;
  }
  if (id < 61.5) { m.col = srgb(0.80, 0.70, 0.50) * (0.8 + 0.3 * noise(p * 50.0)); m.rough = 0.9; return; }
  if (id < 62.5) { matPaper(m, n, p, 3, srgb(0.70, 0.07, 0.08)); return; }
  if (id < 63.5) { matPaper(m, n, p, 3, srgb(0.08, 0.38, 0.22)); return; }
  if (id < 64.5) { matFelt(m, n, p, srgb(0.36, 0.19, 0.08)); return; }
#if BEAT == 13
  if (id > 69.5) {                                   // the children
    float k = brKidAt(p.x); vec3 q = (p - brKidPos(k)) * (0.43 / brKidR(k)); float ax = abs(q.x);
    if (id < 70.5) {                                 // felt face: cold cheeks, worried brows, a turned-down mouth
      matFelt(m, n, p, srgb(0.88, 0.67, 0.53));
      m.col = mix(m.col, srgb(0.86, 0.40, 0.40), 0.55 * (1.0 - smoothstep(0.0, 0.15, length(vec2(ax - 0.24, q.y + 0.13)))));
      float mouth = (1.0 - smoothstep(0.02, 0.034, abs(length(q.xy - vec2(0.0, -0.38)) - 0.11))) * step(-0.34, q.y);
      float brow = 1.0 - smoothstep(0.02, 0.034, sdSeg2(vec2(ax, q.y), vec2(0.06, 0.12), vec2(0.23, 0.045)));
      m.col = mix(m.col, srgb(0.22, 0.09, 0.07), max(mouth, brow) * step(0.0, q.z));
      return;
    }
    if (id < 71.5) {                                 // woolly hat: ribbed, cream bobble
      vec3 c = q.y > 0.53 ? srgb(0.93, 0.91, 0.85) : brKidCol(k);
      matFelt(m, n, p, c * (0.82 + 0.22 * sin(atan(q.x, q.z) * 22.0)));
      return;
    }
    if (id < 72.5) { matFelt(m, n, p, brKidCol(k + 3.0) * 0.55); return; }
    if (id < 73.5) { matFelt(m, n, p, brKidCol(k + 1.0)); return; }
    if (id < 74.5) { m.col = srgb(0.03, 0.025, 0.025); m.rough = 0.08; m.coat = 1.0; m.coatRough = 0.03; return; }
    m.col = srgb(0.86, 0.45, 0.42); m.rough = 0.7; return;
  }
#endif
  m.col = srgb(0.80, 0.62, 0.42); m.rough = 0.8;
#endif
}
