// Father Christmas's office, where the prompt gets written (four stills), and an empty room in autumn (one still). BEAT picks the still:
//  0 intro-5a  calm, three mugs, two notes                  1 intro-5b  frowning, eight mugs, four notes
//  2 intro-5c  wide-eyed, twelve mugs, six notes            3 intro-5d  spent: eyes shut, head lolling
//  4 epi-4     autumn afternoon: sun through the window, the teddy bear on wheels
// Office world: desk top y = 0, its front edge z = 0, wall z = -5.5; orthographic, 12 degrees down, 80 px a unit.
// Autumn world: floor y = 0, wall z = -4 (a real hole in it for the window, so the sun casts the glazing bars on the floor);
// orthographic, 16 degrees down, 83.3 px a unit.
// --D MASK=1 renders only the blank surfaces (calendar header and page, sticky notes), each in a flat colour and without him.
//@ w=1600 h=1000 spp=260 ortho=6.25 pos=0,7.878,23.475 tgt=0,2.888,0 aperture=0.14 focus=26.5 exposure=2.3
//@shot intro-5a BEAT=0
//@shot intro-5b BEAT=1
//@shot intro-5c BEAT=2
//@shot intro-5d BEAT=3
//@shot epi-4 BEAT=4 NOLEAVES=1 ortho=6.0 pos=0,9.298,19.071 tgt=0,2.684,-4 focus=20.5 exposure=2.6
#ifndef BEAT
#define BEAT 0
#endif
#if BEAT == 4
#define AUTUMN
#define GLASS_ID 60.0
#endif

// ---- Father Christmas's pose for each beat (L and R are screen left and screen right). He sits 0.3 low, so the desk top is y = 0.3 to him ----
#ifndef AUTUMN
#define FC_CUSTOM
#if BEAT == 1          // "why does it keep saying I'm right?"
#define STAGE 1
#define FC_WORN 1
#define FC_SLUMP 0.05
const float FC_YAW = -0.06, FC_ROLL = -0.07, FC_NOD = 0.15; const vec2 FC_BROW = vec2(-0.06, -0.06); const vec2 FC_BROWR = vec2(0.26, 0.26); const int FC_EYES = 1; const vec2 FC_LOOK = vec2(0.0, -0.03);
const vec3 FC_EL = vec3(-1.4, 1.0, 0.8), FC_HL = vec3(-0.35, 0.52, 1.75), FC_ER = vec3(1.5, 1.0, 0.8), FC_HR = vec3(0.65, 0.5, 1.75);
#elif BEAT == 2        // wide-eyed, a hand to his head
#define STAGE 2
#define FC_WORN 2
#define FC_SLUMP 0.08
const float FC_YAW = -0.12, FC_ROLL = 0.08, FC_NOD = 0.02; const vec2 FC_BROW = vec2(0.13, 0.13); const vec2 FC_BROWR = vec2(-0.14, -0.14); const int FC_EYES = 3; const vec2 FC_LOOK = vec2(0.02, -0.01);
const vec3 FC_EL = vec3(-1.95, 2.6, 0.35), FC_HL = vec3(-0.92, 4.1, 0.5), FC_ER = vec3(1.5, 1.0, 0.8), FC_HR = vec3(0.65, 0.5, 1.75);
#elif BEAT == 3        // spent
#define STAGE 3
#define FC_WORN 3
#define FC_SLUMP 0.16
// (eyes 4: the spirals, as in the drawn film's last beat)
const float FC_YAW = 0.0, FC_ROLL = 0.32, FC_NOD = 0.12; const vec2 FC_BROW = vec2(0.03, 0.03); const vec2 FC_BROWR = vec2(-0.2, -0.2); const int FC_EYES = 4; const vec2 FC_LOOK = vec2(0.0);
const vec3 FC_EL = vec3(-1.75, 0.9, 0.7), FC_HL = vec3(-1.95, 0.56, 1.6), FC_ER = vec3(1.8, 0.9, 0.7), FC_HR = vec3(2.1, 0.56, 1.6);   // his hands dropped on the desk either side of it
#else                  // calm, typing
const float FC_YAW = -0.03, FC_ROLL = 0.0, FC_NOD = 0.13; const vec2 FC_BROW = vec2(0.02, 0.02); const vec2 FC_BROWR = vec2(0.0, 0.0); const int FC_EYES = 0; const vec2 FC_LOOK = vec2(0.0, -0.03);
const vec3 FC_EL = vec3(-1.4, 1.0, 0.8), FC_HL = vec3(-0.35, 0.52, 1.75), FC_ER = vec3(1.5, 1.0, 0.8), FC_HR = vec3(0.65, 0.5, 1.75);
#endif
#endif
//@include models/fc.glsl
#ifndef HUE
#define HUE srgb(0.40, 0.23, 0.11)
#endif
//@include models/teddy.glsl

#define STEPK 0.8
#define TMAX 60.0
#define STEPS 250
#ifndef MASK
#ifdef AUTUMN
#define FOG 0.014
#define FOG_LIGHT 0
#else
#define FOG 0.0035
#define FOG_LIGHT 0
#endif
#endif

const vec3 WARM = vec3(1.0, 0.72, 0.42), COLD = vec3(0.4, 0.55, 1.0);
// ---- the office ----
const float WZ = -5.5, PLANK = 1.25;
const vec3 FCP = vec3(0.0, -0.3, -3.3);
const vec3 LAP = vec3(0.15, 0.0, -0.9); const float LH = 0.875;
const vec3 LAMP = vec3(-1.6, 9.25, 2.5);
const vec2 WIN = vec2(-5.5, 3.76), WINH = vec2(2.375, 2.69);          // the opening; the frame is 0.25 wide round it
const vec2 CAL = vec2(6.5, 5.604);                                    // where the header meets the page
const vec3 MUG0 = vec3(-4.75, 0.0, -0.75); const float MSP = 0.86, MH = 0.69;
// sticky notes, in the order they appear: centre and half-size. 0, 1, 2, 4 on the wall, 3 on the desk front, 5 across the laptop lid
const vec2 N0 = vec2(3.125, 4.275), N0H = vec2(0.8125, 0.5125);
const vec2 N1 = vec2(-1.75, 5.553), N1H = vec2(1.094, 0.5125);
const vec2 N2 = vec2(3.625, 2.23), N2H = vec2(1.9375, 0.5125);
const vec2 N3 = vec2(-7.31, -0.64), N3H = vec2(1.375, 0.5125);
const vec2 N4 = vec2(6.625, 0.952), N4H = vec2(1.281, 0.5125);
const vec2 N5H = vec2(1.3, 0.7);
// mugs: each row is (index of its first mug, how many)
#if BEAT == 0
const int MROWS = 1; const vec2 MROW[4] = vec2[4](vec2(0.0, 3.0), vec2(0.0), vec2(0.0), vec2(0.0));
#elif BEAT == 1
const int MROWS = 3; const vec2 MROW[4] = vec2[4](vec2(0.0, 4.0), vec2(0.0, 3.0), vec2(1.0, 1.0), vec2(0.0));
#else
const int MROWS = 4; const vec2 MROW[4] = vec2[4](vec2(-2.0, 6.0), vec2(0.0, 3.0), vec2(0.0, 2.0), vec2(0.0, 1.0));
#endif
// ---- the autumn room ----
const vec2 AWIN = vec2(4.566, 5.462), AWINH = vec2(2.814, 2.653);     // the hole in the wall
const vec3 PLAT = vec3(4.3, 0.0, -0.6); const float TS = 2.1;
const vec3 TED = vec3(4.3, 0.85, -0.65);
const vec3 SUNP = vec3(17.13, 28.79, -21.95);

#ifdef AUTUMN
#define NL 2
#else
#define NL 3
#endif
Light getLight(int i) {
#ifdef MASK
  return omni(vec3(0.0, 50.0, 0.0), 1.0, vec3(0.0));
#else
#ifdef AUTUMN
  if (i == 0) return spot(SUNP, 0.45, vec3(1.0, 0.55, 0.23) * 36000.0, vec3(AWIN, -4.0), 9.0, 13.0);            // the low sun, through the window
  return spot(vec3(3.9, 9.5, 3.2), 1.0, vec3(1.0, 0.86, 0.74) * 900.0, TED + vec3(0.0, 0.8, 0.0), 4.0, 19.0);     // a reflector high in front, bouncing the sun back onto the bear
#else
  if (i == 0) return spot(LAMP, 0.3, WARM * 800.0, vec3(-0.1, 1.5, -3.2), 26.0, 50.0);                         // pendant, in front of him and to the left
  if (i == 1) return omni(LAP + vec3(0.0, 0.95, -0.55), 0.4, vec3(0.62, 0.78, 1.0) * 4.5);                      // the laptop screen, on his face
  return spot(vec3(WIN.x, WIN.y + 0.4, WZ + 0.5), 0.15, COLD * 320.0, vec3(-3.4, 0.0, -0.8), 22.0, 44.0);        // moonlight through the window, onto the mugs
#endif
#endif
}
vec3 sky(vec3 rd) {
#ifdef MASK
  return vec3(0.0);
#else
  float f = max(rd.z, 0.0);
#ifdef AUTUMN
  return vec3(1.0, 0.8, 0.62) * 0.2 * f * f + vec3(0.5, 0.42, 0.5) * 0.05;
#else
  return vec3(1.0, 0.86, 0.72) * 0.2 * f * f + vec3(0.35, 0.48, 0.95) * 0.08 * (0.65 + 0.35 * rd.y);
#endif
#endif
}

void ofLamp(vec3 p, vec3 L, inout float d) {
  float bb = sdBox(p - vec3(L.x, L.y + 3.0, L.z), vec3(1.0, 3.6, 1.0));
  if (bb > 0.15) { d = min(d, bb); return; }
  vec3 q = p - L - vec3(0.0, 0.12, 0.0);
  float cone = sdCapCone(q, 0.32, 0.84, 0.17);
  add(d, max(abs(cone) - 0.013, -0.295 - q.y), cone < 0.0 ? 26.0 : 8.0);
  add(d, sdTorus(q - vec3(0.0, -0.3, 0.0), 0.83, 0.022), 8.0);
  add(d, sdRCyl(q - vec3(0.0, 0.43, 0.0), 0.13, 0.11, 0.025), 8.0);
  add(d, sdCapsule(p, L + vec3(0.0, 0.6, 0.0), L + vec3(0.0, 6.4, 0.0), 0.022), 24.0);
  add(d, sdSphere(p - L - vec3(0.0, 0.03, 0.0), 0.11), 27.0);
}
// a sticky note. q: x across, y up, z out of the surface it is stuck to; stuck by its top edge, the bottom lifting a little
void ofNote(vec3 q, vec2 h, float id, inout float d) {
  float t = sat(0.5 - 0.5 * q.y / h.y);
  add(d, sdBox(q - vec3(0.0, 0.0, 0.009 + 0.06 * t * t), vec3(h, 0.004)) * 0.8, id);
}
void ofMugs(vec3 p, inout float d) {
  float bb = sdBox(p - vec3(MUG0.x + 0.9, 1.45, MUG0.z + 0.05), vec3(3.3, 1.5, 0.72));
  if (bb > 0.15) { d = min(d, bb); return; }
  for (int r = 0; r < MROWS; r++) {
    float fr = float(r); vec2 row = MROW[r];
    float i0 = floor((p.x - MUG0.x) / MSP - 0.5 * fr + 0.5);
    for (int k = 0; k < 2; k++) {                    // the nearest mug, and the one to its left, whose handle reaches this far
      float i = clamp(i0 - float(k), row.x, row.x + row.y - 1.0);
      vec3 q = p - vec3(MUG0.x + (i + 0.5 * fr) * MSP, fr * MH, MUG0.z);
      q.xz = rot(0.95 * hash1(i * 7.3 + fr * 3.1 + 0.5) - 0.25) * q.xz;      // each handle turned its own way
      float cup = sdRCyl(q - vec3(0.0, 0.345, 0.0), 0.29, 0.345, 0.05);
      cup = max(cup, -sdRCyl(q - vec3(0.0, 0.47, 0.0), 0.243, 0.36, 0.05));
      vec3 h = q - vec3(0.32, 0.35, 0.0);
      cup = min(cup, max(sdTorus(h.xzy, 0.17, 0.047), -h.x));
      add(d, cup, 50.0 + mod(i + 2.0 + 3.0 * fr, 7.0));
      add(d, sdCyl(q - vec3(0.0, 0.5, 0.0), 0.245, 0.03), 49.0);
    }
  }
}

#ifndef AUTUMN
float map(vec3 p) {
  float d = 1e9; gM = 0.0; float bb;
  float wz = p.z - WZ;
  float gx = (0.5 - abs(fract(p.x / PLANK) - 0.5)) * PLANK;                    // boards with a V joint between them
  add(d, (wz + 0.028 * (1.0 - smoothstep(0.0, 0.045, gx))) * 0.8, 5.0);
  add(d, p.y + 3.8, 6.0);

  // ---- the desk: a wide top, a panelled front ----
  bb = max(p.y - 0.05, abs(p.z + 1.15) - 1.3);
  if (bb > 0.15) d = min(d, bb); else {
    float top = sdRBox(p - vec3(0.0, -0.09, -1.15), vec3(12.0, 0.09, 1.19), 0.03);
    float carc = sdRBox(p - vec3(0.0, -2.3, -1.1), vec3(11.8, 2.15, 1.05), 0.02);
    vec2 g = vec2(repLim(p.x, 6.4, -1.0, 1.0), p.y + 2.75);
    carc = max(carc, -max(abs(sdBox2(g, vec2(2.9, 1.45))) - 0.022, -0.09 - p.z));
    add(d, min(top, carc), 7.0);
#if BEAT >= 1
    ofNote(vec3(p.xy - N3, p.z + 0.05), N3H, 35.0, d);
#endif
  }

  // ---- him ----
#ifndef MASK
  mFC(p - FCP, d);
#endif

  // ---- laptop: in front of him, where he types on it; lid back towards us, leaning a little. LH is half the lid's height:
  // low enough that his face and beard show over the top of it ----
  vec3 l = p - LAP;
  bb = sdBox(l - vec3(0.0, LH, -0.3), vec3(1.7, LH + 0.1, 0.8));
  if (bb > 0.15) d = min(d, bb); else {
    add(d, sdRBox(l - vec3(0.0, 0.045, -0.52), vec3(1.5, 0.045, 0.55), 0.03), 10.0);
    vec3 q = l - vec3(0.0, 0.07, 0.0); q.yz = rot(0.14) * q.yz;
    float lid = sdRBox(q - vec3(0.0, LH, 0.0), vec3(1.5, LH, 0.03), 0.028);
    add(d, lid, q.z < 0.0 && abs(q.x) < 1.38 && abs(q.y - LH) < LH - 0.12 ? 11.0 : 10.0);
    add(d, sdRCyl((q - vec3(0.0, LH + 0.05, 0.031)).xzy, 0.2, 0.004, 0.003), 12.0);
    add(d, sdCapsule(l, vec3(-1.3, 0.07, 0.0), vec3(1.3, 0.07, 0.0), 0.045), 13.0);
#if BEAT >= 2
    ofNote(q - vec3(0.0, LH + 0.02, 0.03), N5H, 37.0, d);
#endif
  }

  ofMugs(p, d);

  // ---- on the wall ----
  bb = wz - 0.75;
  if (bb > 0.15) d = min(d, bb); else {
    // window: a wooden frame, four panes
    vec3 w = vec3(p.xy - WIN, wz);
    float frame = max(sdRBox(w - vec3(0.0, 0.0, 0.08), vec3(WINH + 0.25, 0.14), 0.04), -sdBox2(w.xy, WINH));
    float bars = min(sdBox(w - vec3(0.0, 0.0, 0.08), vec3(0.05, WINH.y, 0.045)), sdBox(w - vec3(0.0, 0.0, 0.08), vec3(WINH.x, 0.05, 0.045))) - 0.015;
    frame = min(min(frame, bars), sdRBox(w - vec3(0.0, -WINH.y - 0.42, 0.24), vec3(WINH.x + 0.45, 0.17, 0.3), 0.04));
    add(d, frame, 14.0);
    add(d, sdBox(w - vec3(0.0, 0.0, 0.03), vec3(WINH, 0.012)), 15.0);                               // the night outside
    // tear-off calendar: a red header band over the pad
    vec3 c = vec3(p.xy - CAL, wz);
    add(d, sdRBox(c - vec3(0.0, -1.4315, 0.06), vec3(1.5, 1.4315, 0.05), 0.012), 31.0);
    add(d, sdRBox(c - vec3(0.0, 0.4215, 0.08), vec3(1.5, 0.4215, 0.07), 0.012), 30.0);
    add(d, sdSphere(vec3(abs(c.x) - 0.6, c.y - 0.7, c.z - 0.14), 0.05), 13.0);                      // the two studs that hold the pad
    add(d, min(sdCapsule(c, vec3(0.0, 1.0, 0.0), vec3(0.0, 1.0, 0.16), 0.035), sdSphere(c - vec3(0.0, 1.0, 0.17), 0.07)), 16.0);   // its nail
    ofNote(vec3(p.xy - N0, wz), N0H, 32.0, d);
    ofNote(vec3(p.xy - N1, wz), N1H, 33.0, d);
#if BEAT >= 1
    ofNote(vec3(p.xy - N2, wz), N2H, 34.0, d);
#endif
#if BEAT >= 2
    ofNote(vec3(p.xy - N4, wz), N4H, 36.0, d);
#endif
  }
  ofLamp(p, LAMP, d);
  return d;
}
#else
float map(vec3 p) {
  float d = 1e9; gM = 0.0; float bb;
  float wz = p.z + 4.0;
  vec3 w = vec3(p.xy - AWIN, wz);
  add(d, max(abs(wz + 0.25) - 0.25, -sdBox2(w.xy, AWINH)), 5.0);                 // the wall, with a real hole for the window
  float gz = (0.5 - abs(fract(p.z / 1.6) - 0.5)) * 1.6;
  add(d, (p.y + 0.012 * (1.0 - smoothstep(0.0, 0.025, gz))) * 0.9, 6.0);
  add(d, abs(p.z + 5.3) - 0.008, 60.0);                                            // the painted view outside: lets the sun through

  bb = abs(wz - 0.15) - 0.8;
  if (bb > 0.15) d = min(d, bb); else {
    // casement in the reveal, glazing bars, an architrave on the wall, the sill
    float fr = max(sdBox(w - vec3(0.0, 0.0, -0.14), vec3(AWINH, 0.1)), -sdBox2(w.xy, AWINH - 0.2));
    float bars = min(sdBox(w - vec3(0.0, 0.0, -0.14), vec3(0.055, AWINH.y, 0.06)), sdBox(w - vec3(0.0, 0.1, -0.14), vec3(AWINH.x, 0.055, 0.06)));
    add(d, min(fr, bars) - 0.014, 14.0);
    add(d, max(sdBox(w - vec3(0.0, 0.0, 0.03), vec3(AWINH + 0.22, 0.04)) - 0.025, -sdBox2(w.xy, AWINH - 0.02)), 14.0);
    add(d, sdRBox(w - vec3(0.0, -AWINH.y - 0.1, 0.24), vec3(AWINH.x + 0.42, 0.085, 0.34), 0.03), 67.0);
    add(d, sdBox2(vec2(p.y - 0.32, wz), vec2(0.32, 0.06)) - 0.025, 66.0);                          // skirting
    // red curtains drawn back, on a brass rail
    float cx = abs(w.x) - 3.3;
    float fold = 0.11 * sin(cx * 13.0 + 0.6 * sin(p.y * 0.8) + 2.0 * step(0.0, w.x));
    float hem = 0.07 * sin(cx * 13.0 + 1.0);
    add(d, sdRBox(vec3(cx, p.y - 5.2 - hem, wz - 0.5 - fold), vec3(0.48, 3.29, 0.07), 0.05) * 0.55, 65.0);
    float pole = sdCapsule(p, vec3(AWIN.x - 4.0, 8.56, -3.5), vec3(AWIN.x + 4.0, 8.56, -3.5), 0.065);
    pole = min(pole, sdSphere(vec3(abs(w.x) - 4.05, p.y - 8.56, wz - 0.5), 0.15));
    pole = min(pole, sdCapsule(vec3(abs(w.x) - 3.86, p.y - 8.56, wz), vec3(0.0), vec3(0.0, 0.0, 0.5), 0.04));
    add(d, pole, 8.0);
  }

  // ---- the teddy bear on wheels ----
  vec3 t = p - PLAT;
  bb = sdBox(t - vec3(-0.4, 1.75, 0.2), vec3(2.6, 1.95, 1.6));
  if (bb > 0.15) d = min(d, bb); else {
    float deck = sdRBox(t - vec3(0.0, 0.72, 0.0), vec3(1.6, 0.13, 0.85), 0.04);
    deck = min(deck, sdRBox(vec3(abs(t.x) - 1.1, t.y - 0.52, t.z), vec3(0.13, 0.1, 0.8), 0.03));
    add(d, deck, 61.0);
    vec3 wq = vec3(abs(t.x) - 1.1, t.y - 0.42, abs(t.z) - 0.98);
    add(d, sdRCyl(vec3(wq.x, wq.z, wq.y), 0.42, 0.1, 0.04), 62.0);                                 // four steel wheels
    add(d, sdRCyl(vec3(wq.x, wq.z - 0.1, wq.y), 0.13, 0.05, 0.02), 63.0);
    add(d, sdCapsule(vec3(abs(t.x) - 1.1, t.y - 0.42, t.z), vec3(0.0, 0.0, -0.98), vec3(0.0, 0.0, 0.98), 0.05), 62.0);
    add(d, sdTorus((t - vec3(-1.64, 0.72, 0.3)).yxz, 0.07, 0.022), 62.0);                          // screw eye and a pull string
    float cord = sdBezier(vec2(t.x, t.y), vec2(-1.7, 0.7), vec2(-2.0, 0.0), vec2(-2.75, 0.03));
    add(d, (length(vec2(cord, t.z - 0.3 - 0.25 * sat(-t.x - 1.7))) - 0.022) * 0.7, 64.0);
    add(d, sdSphere(t - vec3(-2.8, 0.1, 0.56), 0.1), 68.0);
    float dd = d / TS; mGift((p - TED) / TS, dd); d = dd * TS;
  }
  return d;
}
#endif

// the night through the office window: moon, stars, snowy mountains. q = -1..1 across the opening
float ofRidge(float x) {
  if (x < 0.2) return mix(0.28, 0.40, x / 0.2);
  if (x < 0.4) return mix(0.40, 0.28, (x - 0.2) / 0.2);
  if (x < 0.62) return mix(0.34, 0.48, (x - 0.4) / 0.22);
  if (x < 0.84) return mix(0.48, 0.34, (x - 0.62) / 0.22);
  return mix(0.34, 0.40, (x - 0.84) / 0.16);
}
vec3 ofNight(vec2 q) {
  vec2 u = q * 0.5 + 0.5;
  vec3 col = mix(vec3(0.03, 0.055, 0.16), vec3(0.008, 0.015, 0.055), u.y);
  vec2 sc = q * vec2(13.0, 15.0), si = floor(sc);
  col += vec3(0.8, 0.9, 1.0) * step(0.84, hash1(si + 5.0)) * (1.0 - smoothstep(0.05, 0.13, length(fract(sc) - 0.15 - 0.7 * hash2(si)))) * 1.2;
  vec2 mq = (q - vec2(0.5, 0.6)) * WINH;
  float moon = (1.0 - smoothstep(0.26, 0.29, length(mq))) * smoothstep(0.23, 0.26, length(mq - vec2(0.14, 0.08)));
  col += vec3(1.0, 0.96, 0.85) * moon * 3.2 + vec3(0.25, 0.35, 0.6) * 0.3 * exp(-length(mq) * 1.5);
  float far = 0.5 + 0.09 * sin(u.x * 9.0 + 1.0) + 0.05 * sin(u.x * 23.0);
  if (u.y < far) col = vec3(0.035, 0.055, 0.13);
  float near = ofRidge(u.x);
  if (u.y < near) col = vec3(0.13, 0.18, 0.33) * (0.75 + 0.5 * sat((near - u.y) * 5.0)) * (0.88 + 0.2 * noise(q * 9.0));
  return col;
}
// the view outside in autumn. q in units from the middle of the window
vec3 ofAutumn(vec2 q) {
  float h = q.y / AWINH.y;
  vec3 col = mix(vec3(1.0, 0.28, 0.04), vec3(1.0, 0.47, 0.10), sat(h * 0.6 + 0.5));
  col = mix(col, vec3(0.85, 0.46, 0.24), 0.6 * sat(h - 0.3));
  float cl = smoothstep(0.5, 0.75, fbm(vec2(q.x * 0.45, q.y * 2.4) + 3.0)) * sat(h + 0.4);
  col = mix(col, vec3(1.0, 0.42, 0.26), 0.45 * cl);
  vec2 sq = q - vec2(1.2, -0.8);
  col += vec3(1.0, 0.62, 0.22) * (1.5 * exp(-dot(sq, sq) * 0.9) + 5.0 * (1.0 - smoothstep(0.33, 0.37, length(sq))));
  float h1 = -1.4 + 0.3 * sin(q.x * 0.7 + 0.6) + 0.06 * sin(q.x * 2.3);
  float h2 = -2.05 + 0.24 * sin(q.x * 0.9 + 3.5);
  if (q.y < h1) col = vec3(0.50, 0.14, 0.04) * (0.9 + 0.2 * noise(q * 6.0));
  if (q.y < h2) col = vec3(0.24, 0.07, 0.03) * (0.9 + 0.2 * noise(q * 9.0));
  float br = sdBezier(q, vec2(-1.2, -3.4), vec2(-0.6, -0.3), vec2(-2.3, 2.0)) - mix(0.09, 0.03, sat((q.y + 3.0) / 5.0));
  br = min(br, sdBezier(q, vec2(-1.02, -0.2), vec2(-0.4, 0.9), vec2(0.45, 2.2)) - 0.035);
  br = min(br, sdBezier(q, vec2(-1.55, 0.75), vec2(-2.2, 1.0), vec2(-2.62, 0.7)) - 0.022);
  col = mix(col, vec3(0.09, 0.04, 0.018), 1.0 - smoothstep(0.0, 0.025, br));
  const vec3 LEAF[7] = vec3[7](vec3(-2.28, 1.98, 0.6), vec3(0.47, 2.2, -0.4), vec3(-0.3, 1.1, 0.9), vec3(-2.62, 0.66, 0.2), vec3(1.3, 0.5, 1.2), vec3(2.05, -0.95, -0.7), vec3(-0.2, -1.05, 0.4));
  // (NOLEAVES: the game draws the leaves itself, falling: painted here they hang in mid-air)
#ifndef NOLEAVES
  for (int i = 0; i < 7; i++) {
    vec2 l = rot(LEAF[i].z) * (q - LEAF[i].xy);
    col = mix(col, vec3(0.62, 0.07, 0.03), 1.0 - smoothstep(-0.12, 0.12, length(l / vec2(0.17, 0.085)) - 1.0));
  }
#endif
  return col;
}

void shade(float id, vec3 p, inout vec3 n, inout Mat m) {
#ifdef MASK
  m.col = vec3(0.0); m.rough = 1.0;
  if (id > 29.5 && id < 37.5) {
    float k = id - 30.0;
    m.emit = 0.45 * (k < 0.5 ? vec3(1, 0, 0) : k < 1.5 ? vec3(0, 1, 0) : k < 2.5 ? vec3(0, 0, 1) : k < 3.5 ? vec3(1, 1, 0) : k < 4.5 ? vec3(0, 1, 1) : k < 5.5 ? vec3(1, 0, 1) : k < 6.5 ? vec3(1, 1, 1) : vec3(1.0, 0.5, 0.0));
  }
  return;
#else
#ifdef AUTUMN
  if (shGift(id, (p - TED) / TS, n, m)) return;
  if (id < 5.5) {                                    // pale plaster
    m.col = srgb(0.80, 0.76, 0.70) * (0.88 + 0.16 * fbm3(p * 1.1)) * (0.96 + 0.07 * noise(p * 45.0)); m.rough = 0.92;
    bumpN(n, p, 6.0, 0.3); bumpN(n, p, 110.0, 0.35);
    return;
  }
  if (id < 6.5) {                                    // oak boards running across the picture
    float bz = p.z / 1.6, bi = floor(bz);
    matWood(m, n, p * vec3(0.3, 2.4, 2.4) + vec3(bi * 5.3, 3.0, 1.0), vec3(1.0, 0.02, 0.03), 0.42, 0.3);
    m.rough = max(m.rough, 0.48); m.coatRough = 0.28;     // waxed, not varnished: a soft sheen, no mirror
    float joint = 1.0 - smoothstep(0.0, 0.03, (0.5 - abs(fract(bz) - 0.5)) * 1.6);
    float bx = (p.x + 13.0 * hash1(bi + 1.0)) / 7.0; float butt = 1.0 - smoothstep(0.0, 0.015, (0.5 - abs(fract(bx) - 0.5)) * 7.0);
    m.col *= (0.8 + 0.3 * hash1(bi * 3.1 + floor(bx))) * (1.0 - 0.6 * max(joint, butt));
    return;
  }
  if (id < 8.5) { matMetal(m, n, p, 1, vec3(1, 0, 0)); return; }
  if (id < 14.5) { matPaint(m, n, p * 0.6, srgb(0.33, 0.40, 0.50), 0.5, 0.3, srgb(0.55, 0.45, 0.33), 0.0); return; }   // window: grey-blue paint
  if (id < 60.5) { m.col = vec3(0.0); m.rough = 1.0; m.emit = ofAutumn(p.xy - AWIN) * 0.5; return; }
  if (id < 61.5) { matPaint(m, n, p, srgb(0.66, 0.075, 0.065), 0.8, 0.4, srgb(0.72, 0.56, 0.36), 0.0); return; }       // the platform: red gloss on wood
  if (id < 62.5) { matMetal(m, n, p, 0, vec3(0, 0, 1)); return; }
  if (id < 63.5) { matMetal(m, n, p, 2, vec3(1, 0, 0)); return; }
  if (id < 64.5) { m.col = srgb(0.80, 0.72, 0.56) * (0.8 + 0.3 * noise(p * 90.0)); m.rough = 0.9; return; }
  if (id < 65.5) {                                   // velvet
    float cx = abs(p.x - AWIN.x) - 3.3;
    m.col = srgb(0.46, 0.045, 0.06) * (0.75 + 0.25 * sin(cx * 13.0 + 0.6 * sin(p.y * 0.8) + 2.0 * step(AWIN.x, p.x))) * (0.85 + 0.3 * noise(p * 60.0));
    m.rough = 0.9; m.sheen = 1.0; m.sheenCol = srgb(1.0, 0.45, 0.42);
    n = normalize(n + 0.3 * (hash3(p * 600.0) - 0.5));
    return;
  }
  if (id < 66.5) { matPaint(m, n, p * 0.6, srgb(0.74, 0.72, 0.68), 0.45, 0.2, srgb(0.5, 0.42, 0.3), 0.0); return; }
  if (id < 67.5) { matWood(m, n, p * vec3(0.4, 2.6, 2.6), vec3(1.0, 0.03, 0.02), 0.35, 0.6); return; }
  matPaint(m, n, p, srgb(0.10, 0.36, 0.22), 0.8, 0.2, srgb(0.72, 0.56, 0.36), 0.0);                                    // the green bead on the string
#else
  if (shFC(id, p - FCP, n, m)) return;
  if (id < 5.5) {                                    // warm boards, grain running up
    float bi = floor(p.x / PLANK);
    matWood(m, n, p * vec3(2.3, 0.3, 2.3) + vec3(bi * 3.7, bi * 1.3, 0.0), vec3(0.02, 1.0, 0.03), 0.8, 0.4);
    float gx = (0.5 - abs(fract(p.x / PLANK) - 0.5)) * PLANK;
    m.col *= (0.72 + 0.3 * hash1(bi + 2.0)) * (1.0 - 0.55 * (1.0 - smoothstep(0.0, 0.035, gx)));
    return;
  }
  if (id < 6.5) { matConcrete(m, n, p * 0.6, srgb(0.2, 0.2, 0.21)); return; }
  if (id < 7.5) {                                    // the desk: dark walnut, grain along its length, lacquered and a bit worn
    matWood(m, n, p * vec3(0.35, 2.6, 2.6) + vec3(0.0, 3.0, 1.0), vec3(1.0, 0.02, 0.03), 0.8, 0.8);
    float ring = smoothstep(0.03, 0.0, abs(length(p.xz - vec2(-1.2, -0.6)) - 0.26)) * step(-0.01, p.y);      // a coffee ring
    m.col *= 1.0 - 0.35 * ring;
    return;
  }
  if (id < 8.5) { matMetal(m, n, p, 1, vec3(1, 0, 0)); return; }
  if (id < 10.5) { matMetal(m, n, p * 0.6, 0, vec3(1, 0, 0)); m.col = srgb(0.70, 0.71, 0.74) * (0.92 + 0.1 * noise(p * 300.0)); m.rough = 0.36; return; }
  if (id < 11.5) { m.col = srgb(0.02, 0.025, 0.035); m.rough = 0.12; m.coat = 1.0; m.emit = vec3(0.62, 0.78, 1.0) * 2.2; return; }
  if (id < 12.5) { matMetal(m, n, p, 3, vec3(1, 0, 0)); m.rough = 0.12; return; }
  if (id < 13.5) { matPlastic(m, n, p, srgb(0.05, 0.05, 0.055), 0.4); return; }
  if (id < 14.5) { matWood(m, n, p * vec3(2.4, 2.4, 2.4) * vec3(1.0, 0.35, 1.0), vec3(0.03, 1.0, 0.02), 0.45, 0.7); return; }   // window frame: oak
  if (id < 15.5) {
    m.col = vec3(0.02); m.rough = 0.1; m.coat = 1.0; m.coatRough = 0.05;
    m.glow = ofNight((p.xy - WIN) / WINH) * 1.5;
    return;
  }
  if (id < 16.5) { matMetal(m, n, p, 0, vec3(0, 1, 0)); return; }
  if (id < 24.5) { matRubber(m, n, p, srgb(0.03, 0.03, 0.033)); m.rough = 0.5; return; }
  if (id < 26.5) { m.col = srgb(0.93, 0.90, 0.82) * (0.85 + 0.2 * fbm3(p * 9.0)); m.rough = 0.35; m.coat = 0.5; return; }
  if (id < 27.5) { m.col = vec3(0.0); m.glow = vec3(1.0, 0.72, 0.36) * 28.0; return; }
  if (id < 30.5) { matPaper(m, n, p, 1, srgb(0.66, 0.09, 0.08)); m.col *= 0.92 + 0.12 * fbm3(p * 2.0); return; }      // calendar header: red card
  if (id < 31.5) { matPaper(m, n, p, 0, srgb(0.93, 0.90, 0.82)); m.col *= 0.95 + 0.07 * fbm3(p * 1.3); return; }      // the day's page
  if (id < 37.5) {                                   // sticky notes: yellow paper, a shade deeper along the gummed edge
    matPaper(m, n, p, 0, srgb(0.97, 0.80, 0.30));
    m.col *= 0.93 + 0.1 * fbm3(p * 2.2 + id);
    return;
  }
  if (id < 49.5) { m.col = srgb(0.10, 0.05, 0.025); m.rough = 0.08; m.coat = 1.0; return; }                           // cold coffee
  float k = id - 50.0;
  vec3 c = k < 0.5 ? srgb(0.90, 0.87, 0.80) : k < 1.5 ? srgb(0.09, 0.40, 0.21) : k < 2.5 ? srgb(0.93, 0.69, 0.10) : k < 3.5 ? srgb(0.30, 0.38, 0.52) : k < 4.5 ? srgb(0.60, 0.07, 0.07) : k < 5.5 ? srgb(0.64, 0.72, 0.84) : srgb(0.88, 0.45, 0.15);
  m.col = c * (0.92 + 0.1 * fbm3(p * 12.0)); m.rough = 0.22 + 0.15 * smudge(p * 3.0); m.coat = 0.9; m.coatRough = 0.06;
#endif
#endif
}
