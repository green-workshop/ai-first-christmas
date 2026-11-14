// Father Christmas as a hand-made stop-motion puppet: wool-roving beard, felt coat and hat, wire reading glasses.
// Local space: he sits at the origin facing +z, the desk top is y = 0, his head is about 3.3 up. Material ids 200..229.
// POSE 0 idle, 1 look (at the pile, screen left), 2 scratch, 3 type, 4 puzzled (holds a gift up), 5 relief, 6 asleep on the desk is not here.
// STAGE 0..3 how frazzled. FRAME 0/1 second frame of a moving pose. BLINK 1 closes the eyes.
// For any other pose, #define FC_CUSTOM and declare the pose constants yourself before including this file
// (copy the idle block below and change it): FC_YAW/FC_ROLL/FC_NOD turn, tilt and bow the head (radians; +yaw looks screen left),
// FC_BROW / FC_BROWR raise and slant the brows (left, right), FC_EYES 0 open 1 half 2 shut 3 wide, FC_LOOK shifts the pupils,
// FC_EL/FC_HL and FC_ER/FC_HR are the elbow and hand on screen left and screen right.
// #define FC_LEGS gives him the rest of his body for standing shots: coat skirt, trousers and boots, soles at y = -3.05.
#ifndef POSE
#define POSE 0
#endif
#ifndef STAGE
#define STAGE 0
#endif
#ifndef FRAME
#define FRAME 0
#endif
#ifndef BLINK
#define BLINK 0
#endif

// ---- pose table ----  (L and R are screen left and screen right)
#ifdef FC_CUSTOM
#elif defined(POSE2)
// an in-between frame: TW (0..1) of the way from POSE to POSE2, so the game can play a move instead of cutting between two poses.
// The tables repeat the poses below (first frame of each); keep them in step.
#ifndef TW
#define TW 0.5
#endif
const float FCT_YAW[6] = float[6](0.0, 0.5, 0.0, -0.38, 0.2, 0.0);
const float FCT_ROLL[6] = float[6](0.0, 0.1, -0.11, -0.04, 0.11, 0.035);
const float FCT_NOD[6] = float[6](0.0, 0.06, 0.04, 0.2, -0.03, 0.12);
const vec2 FCT_BROW[6] = vec2[6](vec2(0.0), vec2(0.07, 0.07), vec2(0.02, 0.02), vec2(-0.045, -0.045), vec2(0.11, -0.01), vec2(0.05, 0.05));
const vec2 FCT_BROWR[6] = vec2[6](vec2(0.0), vec2(0.0), vec2(-0.25, 0.25), vec2(0.22, -0.22), vec2(-0.14, -0.18), vec2(-0.12, 0.12));
const int FCT_EYES[6] = int[6](0, 0, 1, 1, 3, 2);
const vec2 FCT_LOOK[6] = vec2[6](vec2(0.0), vec2(-0.03, 0.0), vec2(0.01, 0.015), vec2(0.03, -0.03), vec2(-0.035, 0.02), vec2(0.0));
const vec3 FCT_EL[6] = vec3[6](vec3(-1.55, 0.95, 0.35), vec3(-1.55, 0.95, 0.35), vec3(-1.55, 0.95, 0.35), vec3(-1.2, 1.0, 0.85), vec3(-1.95, 1.25, 0.5), vec3(-1.6, 0.85, 0.35));
const vec3 FCT_HL[6] = vec3[6](vec3(-0.85, 0.16, 1.15), vec3(-0.85, 0.16, 1.15), vec3(-0.85, 0.16, 1.15), vec3(0.5, 0.42, 1.2), vec3(-2.0, 2.45, 1.0), vec3(-0.85, 0.16, 1.15));
const vec3 FCT_ER[6] = vec3[6](vec3(1.55, 0.95, 0.35), vec3(1.55, 0.95, 0.35), vec3(1.95, 2.55, 0.35), vec3(1.8, 1.0, 0.45), vec3(1.55, 0.95, 0.35), vec3(1.6, 0.85, 0.35));
const vec3 FCT_HR[6] = vec3[6](vec3(1.0, 0.16, 1.2), vec3(1.0, 0.16, 1.2), vec3(0.9, 4.05, 0.45), vec3(1.62, 0.6, 1.0), vec3(1.0, 0.16, 1.2), vec3(1.0, 0.16, 1.2));
const float FCT_SLUMP[6] = float[6](0.0, 0.0, 0.0, 0.04, 0.0, 0.08);
const float FC_TW = float(TW), FC_ARC = sin(3.14159265 * FC_TW);     // hands swing out a little on the way, not in a straight line
const float FC_YAW = mix(FCT_YAW[POSE], FCT_YAW[POSE2], FC_TW), FC_ROLL = mix(FCT_ROLL[POSE], FCT_ROLL[POSE2], FC_TW), FC_NOD = mix(FCT_NOD[POSE], FCT_NOD[POSE2], FC_TW);
const vec2 FC_BROW = mix(FCT_BROW[POSE], FCT_BROW[POSE2], FC_TW); const vec2 FC_BROWR = mix(FCT_BROWR[POSE], FCT_BROWR[POSE2], FC_TW);
const int FC_EYES = FC_TW < 0.5 ? FCT_EYES[POSE] : FCT_EYES[POSE2]; const vec2 FC_LOOK = mix(FCT_LOOK[POSE], FCT_LOOK[POSE2], FC_TW);
const vec3 FC_EL = mix(FCT_EL[POSE], FCT_EL[POSE2], FC_TW) + vec3(0.0, 0.0, 0.1 * distance(FCT_EL[POSE], FCT_EL[POSE2]) * FC_ARC);
const vec3 FC_HL = mix(FCT_HL[POSE], FCT_HL[POSE2], FC_TW) + vec3(0.0, 0.0, 0.14 * distance(FCT_HL[POSE], FCT_HL[POSE2]) * FC_ARC);
const vec3 FC_ER = mix(FCT_ER[POSE], FCT_ER[POSE2], FC_TW) + vec3(0.0, 0.0, 0.1 * distance(FCT_ER[POSE], FCT_ER[POSE2]) * FC_ARC);
const vec3 FC_HR = mix(FCT_HR[POSE], FCT_HR[POSE2], FC_TW) + vec3(0.0, 0.0, 0.14 * distance(FCT_HR[POSE], FCT_HR[POSE2]) * FC_ARC);
#define FC_SLUMP mix(FCT_SLUMP[POSE], FCT_SLUMP[POSE2], FC_TW)
#define FC_POSE_NOW (FC_TW < 0.5 ? POSE : POSE2)
#elif POSE == 1
const float FC_YAW = 0.5, FC_ROLL = 0.1, FC_NOD = 0.06; const vec2 FC_BROW = vec2(0.07, 0.07); const vec2 FC_BROWR = vec2(0.0, 0.0); const int FC_EYES = 0; const vec2 FC_LOOK = vec2(-0.03, 0.0);
const vec3 FC_EL = vec3(-1.55, 0.95, 0.35), FC_HL = vec3(-0.85, 0.16, 1.15), FC_ER = vec3(1.55, 0.95, 0.35), FC_HR = vec3(1.0, 0.16, 1.2);
#elif POSE == 2
const float FC_YAW = 0.0, FC_ROLL = -0.11, FC_NOD = 0.04; const vec2 FC_BROW = vec2(0.02, 0.02); const vec2 FC_BROWR = vec2(-0.25, 0.25); const int FC_EYES = 1; const vec2 FC_LOOK = vec2(0.01, 0.015);
const vec3 FC_EL = vec3(-1.55, 0.95, 0.35), FC_HL = vec3(-0.85, 0.16, 1.15), FC_ER = vec3(1.95, 2.55 + 0.06 * float(FRAME), 0.35), FC_HR = vec3(0.9 - 0.14 * float(FRAME), 4.05 + 0.05 * float(FRAME), 0.45);
#elif POSE == 3
const float FC_YAW = -0.38, FC_ROLL = -0.04, FC_NOD = 0.2; const vec2 FC_BROW = vec2(-0.045, -0.045); const vec2 FC_BROWR = vec2(0.22, -0.22); const int FC_EYES = 1; const vec2 FC_LOOK = vec2(0.03, -0.03);
// (the second frame of typing: one hand up and the other down by enough to see, his elbows working with them)
const vec3 FC_EL = vec3(-1.2, 1.0 + 0.07 * float(FRAME), 0.85), FC_HL = vec3(0.5, 0.42 + 0.22 * float(FRAME), 1.2), FC_ER = vec3(1.8, 1.0 - 0.07 * float(FRAME), 0.45), FC_HR = vec3(1.62, 0.6 - 0.2 * float(FRAME), 1.0);
#elif POSE == 4
const float FC_YAW = 0.2, FC_ROLL = 0.11, FC_NOD = -0.03; const vec2 FC_BROW = vec2(0.11, -0.01); const vec2 FC_BROWR = vec2(-0.14, -0.18); const int FC_EYES = 3; const vec2 FC_LOOK = vec2(-0.035, 0.02);
const vec3 FC_EL = vec3(-1.95, 1.25, 0.5), FC_HL = vec3(-2.0, 2.45, 1.0), FC_ER = vec3(1.55, 0.95, 0.35), FC_HR = vec3(1.0, 0.16, 1.2);
#elif POSE == 5
const float FC_YAW = 0.0, FC_ROLL = 0.035, FC_NOD = 0.12; const vec2 FC_BROW = vec2(0.05, 0.05); const vec2 FC_BROWR = vec2(-0.12, 0.12); const int FC_EYES = 2; const vec2 FC_LOOK = vec2(0.0);
const vec3 FC_EL = vec3(-1.6, 0.85, 0.35), FC_HL = vec3(-0.85, 0.16, 1.15), FC_ER = vec3(1.6, 0.85, 0.35), FC_HR = vec3(1.0, 0.16, 1.2);
#else
const float FC_YAW = 0.0, FC_ROLL = 0.0, FC_NOD = 0.0; const vec2 FC_BROW = vec2(0.0, 0.0); const vec2 FC_BROWR = vec2(0.0, 0.0); const int FC_EYES = 0; const vec2 FC_LOOK = vec2(0.0);
const vec3 FC_EL = vec3(-1.55, 0.95, 0.35), FC_HL = vec3(-0.85, 0.16, 1.15), FC_ER = vec3(1.55, 0.95, 0.35), FC_HR = vec3(1.0, 0.16, 1.2);
#endif
#ifndef FC_SLUMP
#define FC_SLUMP ((POSE == 5) ? 0.08 : (POSE == 3 ? 0.04 : 0.0))
#endif
#ifndef FC_POSE_NOW
#define FC_POSE_NOW POSE
#endif
// FC_WORN 1..3: how worn down he looks, on top of STAGE, for the close shots in the films where it has to read at a glance:
// beads of sweat (more with each step), heavy bags under the eyes, a greyer face, and from 2 a beard coming apart in tufts.
#ifndef FC_WORN
#define FC_WORN 0
#endif
// a bead of sweat on the skull (ellipsoid 0.93 x 0.9 x 0.88 about the head centre): pos is the direction it sits in, s its size
float fcBead(vec3 h, vec3 pos, float s) {
  vec3 c = normalize(pos) * vec3(0.93, 0.9, 0.88) * 1.02;
  vec3 q = h - c;
  float drop = sdEllipsoid(q, vec3(0.075, 0.095, 0.06) * s);
  return smin(drop, sdSphere(q - vec3(0.0, 0.085 * s, 0.0), 0.03 * s), 0.05 * s);        // a teardrop: the small end up
}
const float FC_HATTILT = STAGE >= 3 ? 0.3 : (STAGE >= 2 ? 0.16 : 0.0);
const float FC_FRIZZ = STAGE >= 3 ? 1.0 : (STAGE >= 2 ? 0.6 : (STAGE >= 1 ? 0.2 : 0.0));
const float FC_GLASSROLL = STAGE >= 3 ? 0.2 : (STAGE >= 2 ? 0.1 : 0.0);
const vec3 FC_NECK = vec3(0.0, 2.45, 0.0);

vec3 fcHead(vec3 p) {                       // world -> head space
  vec3 q = p - FC_NECK - vec3(0.0, -FC_SLUMP, FC_SLUMP * 1.5);
  q.xz = rot(-FC_YAW) * q.xz; q.yz = rot(-FC_NOD) * q.yz; q.xy = rot(-FC_ROLL) * q.xy;
  return q + FC_NECK;
}
// wool roving: long wavy strands running down
float fcWool(vec3 q, float wild) {
  vec3 s = vec3(q.x * 9.0 + 0.7 * sin(q.y * 5.0 + q.z * 3.0) + wild * 1.2 * sin(q.y * 11.0 + q.x * 7.0), q.y * 1.6, q.z * 9.0 + 0.6 * sin(q.y * 4.0 + q.x * 2.0));
  return (noise(s) - 0.5) * 0.085 + (noise(s * 3.1 + 7.0) - 0.5) * 0.03 + wild * (fbm3(q * 6.0) - 0.5) * 0.12;
}
float fcArm(vec3 p, vec3 sh, vec3 el, vec3 ha, out float part) {
  part = 0.0;
  float d = sdCone(p, sh, el, 0.36, 0.3);
  d = smin(d, sdCone(p, el, ha, 0.3, 0.25), 0.12);
  vec3 dir = normalize(ha - el);
  // wool cuff, then the hand
  vec3 c = ha - dir * 0.05; vec3 q = p - c; float along = dot(q, dir); float rad = length(q - dir * along);
  float cuff = length(vec2(rad - 0.27, along)) - 0.13;
  cuff -= 0.03 * (noise(p * 22.0) - 0.5) + 0.012 * (noise(p * 70.0) - 0.5);
  vec3 hc = ha + dir * 0.3;
  float hand = sdEllipsoid(p - hc, vec3(0.25, 0.22, 0.27));
  hand = smin(hand, sdCapsule(p, hc + vec3(0.0, 0.06, 0.05), hc + vec3(sign(sh.x) * -0.2, 0.18, 0.16), 0.085), 0.07);
  if (cuff < d && cuff < hand) part = 1.0; else if (hand < d) part = 2.0;
  return min(d, min(cuff, hand));
}

void mFC(vec3 p, inout float d) {
#ifdef FC_LEGS
  float bb = sdBox(p - vec3(0.0, 0.9, 0.3), vec3(2.6, 4.5, 1.7));
#else
  float bb = sdBox(p - vec3(0.0, 2.3, 0.3), vec3(2.6, 3.1, 1.7));
#endif
  if (bb > 0.2) { d = min(d, bb); return; }
  // ---- body: felt coat ----
  vec3 b = p - vec3(0.0, -FC_SLUMP, FC_SLUMP);
  float torso = sdEllipsoid(b - vec3(0.0, 0.85, 0.0), vec3(1.3, 1.5, 1.0));
  torso = smin(torso, sdEllipsoid(b - vec3(0.0, 1.75, 0.0), vec3(1.15, 0.75, 0.85)), 0.3);       // shoulders
#ifdef FC_LEGS
  torso = smin(torso, sdCapCone(b - vec3(0.0, -0.55, 0.0), 0.55, 1.42, 1.22), 0.25);                // coat skirt
  torso = max(torso, -p.y - 1.05);
#else
  torso = max(torso, -p.y - 0.4);
#endif
  float feltN = 0.004 * (noise(p * 130.0) - 0.5) + 0.006 * (fbm3(p * 9.0) - 0.5);
  add(d, torso - feltN, 200.0);
  // wool trim down the front and round the collar, buttons
  float trim = max(sdEllipsoid(b - vec3(0.0, 0.85, 0.06), vec3(1.3, 1.5, 1.0)), abs(b.x) - 0.17);
  trim = max(trim, -b.z);
  float collar = sdTorus(b - vec3(0.0, 2.2, 0.08), 0.72, 0.2);
  float w = min(trim, collar) - 0.03 * (noise(p * 20.0) - 0.5) - 0.014 * (noise(p * 64.0) - 0.5);
  add(d, w, 203.0);
  vec3 bt = b - vec3(0.0, 0.0, 0.0); bt.y = repLim(bt.y - 0.62, 0.52, 0.0, 1.0);
  float bz = sqrt(max(1.0 - pow((b.y - 0.85) / 1.5, 2.0), 0.0)) * 1.0 + 0.1;
  add(d, sdRCyl((bt - vec3(0.0, 0.0, bz)).xzy, 0.1, 0.03, 0.02), 208.0);
#ifdef FC_LEGS
  {
    float hem = sdTorus(p - vec3(0.0, -1.0, 0.0), 1.32, 0.16) - 0.03 * (noise(p * 20.0) - 0.5) - 0.014 * (noise(p * 64.0) - 0.5);
    add(d, hem * 0.8, 203.0);
#ifdef FC_STEP
    // Mid-step: #define FC_STEP 1 lifts the leg at screen left, 2 the one at screen right (the knee comes up under the coat
    // and the boot forward: frames for walking, alternated with the standing pose). Each leg is its own shape here, not a
    // mirror of the other.
    for (int side = 0; side < 2; side++) {
      vec3 lq = vec3(side == 0 ? -p.x : p.x, p.y, p.z);
      if ((side == 0) == (FC_STEP == 1)) lq -= vec3(0.0, 0.46, 0.3);
      add(d, sdCone(lq, vec3(0.5, -1.0, 0.0), vec3(0.52, -2.5, 0.05), 0.4, 0.34) - feltN, 200.0);
      float boot = smin(sdCone(lq, vec3(0.52, -2.35, 0.05), vec3(0.52, -2.85, 0.05), 0.36, 0.34), sdEllipsoid(lq - vec3(0.54, -2.82, 0.32), vec3(0.34, 0.24, 0.52)), 0.12);
      boot = max(boot, -lq.y - 3.05);
      add(d, boot, 211.0);
      add(d, sdTorus(lq - vec3(0.52, -2.33, 0.05), 0.36, 0.09) - 0.02 * (noise(p * 30.0) - 0.5), 203.0);
    }
#else
    vec3 lq = p; lq.x = abs(lq.x);
    add(d, sdCone(lq, vec3(0.5, -1.0, 0.0), vec3(0.52, -2.5, 0.05), 0.4, 0.34) - feltN, 200.0);  // trousers
    float boot = smin(sdCone(lq, vec3(0.52, -2.35, 0.05), vec3(0.52, -2.85, 0.05), 0.36, 0.34), sdEllipsoid(lq - vec3(0.54, -2.82, 0.32), vec3(0.34, 0.24, 0.52)), 0.12);
    boot = max(boot, -p.y - 3.05);
    add(d, boot, 211.0);
    add(d, sdTorus(lq - vec3(0.52, -2.33, 0.05), 0.36, 0.09) - 0.02 * (noise(p * 30.0) - 0.5), 203.0);
#endif
  }
#endif
  // ---- arms ----
  float part;
  float aL = fcArm(p, vec3(-1.05, 1.9 - FC_SLUMP, 0.05), FC_EL, FC_HL, part); add(d, aL - (part < 0.5 ? feltN : 0.0), part < 0.5 ? 200.0 : (part < 1.5 ? 203.0 : 201.0));
  float aR = fcArm(p, vec3(1.05, 1.9 - FC_SLUMP, 0.05), FC_ER, FC_HR, part); add(d, aR - (part < 0.5 ? feltN : 0.0), part < 0.5 ? 200.0 : (part < 1.5 ? 203.0 : 201.0));

  // ---- head ----
  vec3 q = fcHead(p);
  vec3 h = q - vec3(0.0, 3.3, 0.1);
  float hb = length(h) - 2.2;
  if (hb > 0.2) { d = min(d, hb); return; }
  vec3 m = h; m.x = abs(m.x);
  float skull = sdEllipsoid(h, vec3(0.93, 0.9, 0.88));
  skull = smin(skull, sdEllipsoid(m - vec3(0.42, -0.2, 0.55), vec3(0.36, 0.3, 0.3)), 0.2);       // cheeks
  float ear = sdEllipsoid(m - vec3(0.93, -0.02, -0.02), vec3(0.14, 0.24, 0.16));
  ear = smax(ear, -sdEllipsoid(m - vec3(1.02, -0.02, 0.08), vec3(0.09, 0.15, 0.1)), 0.05);
  float skin = smin(skull, ear, 0.06);
  // eyelids as part of the skin when half shut or shut
  int eyes = BLINK == 1 ? 2 : (BLINK == 2 ? 1 : FC_EYES); if (STAGE >= 3 && (FC_POSE_NOW == 2 || FC_POSE_NOW == 3)) eyes = 4;   // BLINK 2: lids half way
  vec3 e = m - vec3(0.33, 0.12, 0.855);
  float er = eyes == 3 ? 0.125 : 0.105;
  if (eyes == 1) skin = smin(skin, max(sdSphere(e, er + 0.03), -(e.y + 0.005)), 0.03);
  if (eyes == 2) skin = smin(skin, sdSphere(e, er + 0.025), 0.03);
#if FC_WORN >= 2
  skin = smin(skin, sdEllipsoid(m - vec3(0.33, -0.085, 0.84), vec3(0.15, 0.065, 0.07)), 0.04);     // puffy lower lids
#endif
  add(d, skin, 201.0);
#if FC_WORN >= 1
  {
    float sw = min(fcBead(h, vec3(0.78, 0.24, 0.6), 1.5), fcBead(h, vec3(-0.6, 0.36, 0.72), 1.2));
    sw = min(sw, fcBead(h, vec3(0.1, 0.5, 0.86), 1.05));
#if FC_WORN >= 2
    sw = min(sw, min(fcBead(h, vec3(0.84, -0.08, 0.54), 1.35), fcBead(h, vec3(-0.82, 0.0, 0.56), 1.4)));
    // and coming off him: two in the air beside his hat
    vec3 f1 = h - vec3(1.35, 0.85, 0.5); f1.xy = rot(-0.7) * f1.xy; sw = min(sw, smin(sdEllipsoid(f1, vec3(0.085, 0.13, 0.07)), sdSphere(f1 + vec3(0.0, 0.12, 0.0), 0.035), 0.06));
    vec3 f2 = h - vec3(-1.3, 0.95, 0.5); f2.xy = rot(0.75) * f2.xy; sw = min(sw, smin(sdEllipsoid(f2, vec3(0.075, 0.115, 0.06)), sdSphere(f2 + vec3(0.0, 0.11, 0.0), 0.03), 0.05));
#endif
#if FC_WORN >= 3
    sw = min(sw, min(fcBead(h, vec3(0.5, 0.46, 0.74), 1.1), fcBead(h, vec3(-0.28, 0.5, 0.84), 1.0)));
    vec3 f3 = h - vec3(1.62, 0.42, 0.5); f3.xy = rot(-1.1) * f3.xy; sw = min(sw, smin(sdEllipsoid(f3, vec3(0.07, 0.11, 0.06)), sdSphere(f3 + vec3(0.0, 0.1, 0.0), 0.03), 0.05));
    vec3 f4 = h - vec3(-1.55, 0.5, 0.5); f4.xy = rot(1.15) * f4.xy; sw = min(sw, smin(sdEllipsoid(f4, vec3(0.07, 0.11, 0.06)), sdSphere(f4 + vec3(0.0, 0.1, 0.0), 0.03), 0.05));
#endif
    add(d, sw, 212.0);
  }
#endif
  // nose
  add(d, sdEllipsoid(h - vec3(0.0, -0.1, 0.93), vec3(0.2, 0.19, 0.2)), 202.0);
  // eyes
  if (eyes == 4) add(d, sdRCyl((e - vec3(0.0, 0.0, 0.06)).xzy, 0.16, 0.02, 0.012), 207.0);
  else if (eyes != 2) add(d, sdSphere(e - vec3(FC_LOOK, 0.0), er), 206.0);
  else add(d, sdTorus((e - vec3(0.0, 0.03, 0.105)).xzy * vec3(1.0, 1.0, 2.2), 0.085, 0.012) * 0.45, 209.0);          // closed: a lash line
  // eyebrows: wool tufts
  vec3 br = m - vec3(0.34, 0.38 + (h.x < 0.0 ? FC_BROW.x : FC_BROW.y), 0.84);
  br.xy = rot((h.x < 0.0 ? FC_BROWR.x : FC_BROWR.y) * 1.0) * br.xy;
  float brow = sdCapsule(br, vec3(-0.17, 0.0, -0.03), vec3(0.17, 0.02, -0.08), 0.075) - 0.03 * (noise(q * 30.0) - 0.5);
  // moustache: two swoops
  vec3 mu = m - vec3(0.33, -0.37, 0.9); mu.xy = rot(0.36) * mu.xy;
  float mous = sdEllipsoid(mu, vec3(0.42, 0.17 - 0.1 * sat(mu.x / 0.42), 0.2));
  // beard: a great cloud of wool
  float beard = sdEllipsoid(h - vec3(0.0, -0.78, 0.42), vec3(0.98, 0.95, 0.62));
  beard = smin(beard, sdEllipsoid(m - vec3(0.72, -0.3, 0.2), vec3(0.34, 0.6, 0.5)), 0.2);         // up to the ears
  beard = smin(beard, sdEllipsoid(h - vec3(0.0, -1.5, 0.5), vec3(0.62, 0.62, 0.45)), 0.3);        // the point
  beard = smax(beard, -sdEllipsoid(h - vec3(0.0, -0.48, 1.0), vec3(0.16, 0.07, 0.2)), 0.05);      // mouth
  // hair round the back and sides, under the hat
  float hair = sdEllipsoid(h - vec3(0.0, 0.05, -0.2), vec3(1.0, 0.8, 0.85));
  hair = max(hair, h.z - 0.25 + 0.5 * abs(h.x) * 0.0);
  float wool = min(min(beard, hair), min(mous, brow));
#if FC_WORN >= 2
  {                                                    // the beard coming apart: wisps working loose all round it, hair out from under the hat
    wool = smin(wool, sdCone(h, vec3(-0.78, -1.2, 0.4), vec3(-1.08, -1.42, 0.5), 0.13, 0.03), 0.12);
    wool = smin(wool, sdCone(h, vec3(0.62, -1.4, 0.45), vec3(0.9, -1.66, 0.52), 0.12, 0.03), 0.12);
    wool = smin(wool, sdCone(h, vec3(0.05, -1.9, 0.5), vec3(0.2, -2.2, 0.62), 0.12, 0.03), 0.12);
    wool = smin(wool, sdCone(h, vec3(0.98, -0.25, 0.2), vec3(1.26, -0.12, 0.22), 0.11, 0.03), 0.1);
    wool = smin(wool, sdCone(h, vec3(-0.96, 0.22, 0.25), vec3(-1.2, 0.4, 0.3), 0.1, 0.025), 0.1);
#if FC_WORN >= 3
    wool = smin(wool, sdCone(h, vec3(-1.0, -0.9, 0.3), vec3(-1.34, -0.82, 0.4), 0.12, 0.03), 0.12);
    wool = smin(wool, sdCone(h, vec3(0.94, 0.3, 0.3), vec3(1.2, 0.52, 0.34), 0.1, 0.025), 0.1);
    wool = smin(wool, sdCone(h, vec3(-0.38, -1.72, 0.55), vec3(-0.6, -2.0, 0.66), 0.11, 0.03), 0.12);
    wool = smin(wool, sdCone(h, vec3(0.9, -0.95, 0.35), vec3(1.22, -1.04, 0.42), 0.12, 0.03), 0.12);
#endif
  }
#endif
  wool -= fcWool(q, FC_FRIZZ);
  if (STAGE >= 1) {                                    // stray tufts
    // (wisps, thick where they leave the beard and thin at the end: a plain capsule reads as a peg)
    vec3 t1 = h - vec3(-0.95, -0.55, 0.3); wool = smin(wool, sdCone(t1, vec3(0), vec3(-0.3, 0.12, 0.05), 0.09 * (1.0 + FC_FRIZZ), 0.025), 0.1);
    vec3 t2 = h - vec3(0.9, -0.9, 0.35); wool = smin(wool, sdCone(t2, vec3(0), vec3(0.28, -0.1, 0.05), 0.08 * (1.0 + FC_FRIZZ), 0.025), 0.1);
  }
  add(d, wool * 0.75, 203.0);
  // ---- glasses: wire rims, glass, low on the nose ----
  vec3 g = h - vec3(0.0, 0.0, 0.0); g.xy = rot(FC_GLASSROLL) * g.xy;
  vec3 gm = g; gm.x = abs(gm.x);
  vec3 lc = gm - vec3(0.34, 0.03, 0.97);
  float rim = sdTorus(lc.xzy, 0.215, 0.017);
  rim = min(rim, sdCapsule(g, vec3(-0.13, 0.08, 0.99), vec3(0.13, 0.08, 0.99), 0.015));
  rim = min(rim, sdCapsule(gm, vec3(0.55, 0.06, 0.95), vec3(0.98, 0.1, 0.05), 0.014));
  add(d, rim, 204.0);
  // ---- hat ----
  vec3 t = h - vec3(0.0, 0.36, 0.0); t.xy = rot(FC_HATTILT) * t.xy; t.yz = rot(-0.12) * t.yz;
  float band = sdTorus(t - vec3(0.0, 0.42, 0.02), 0.86, 0.17) - 0.035 * (noise(q * 18.0) - 0.5) - 0.015 * (noise(q * 60.0) - 0.5);
  float crush = STAGE >= 3 ? 0.08 * sin(t.y * 9.0 + t.x * 4.0) : 0.0;
  float cone = sdCone(t, vec3(0.0, 0.45, 0.0), vec3(0.3, 1.25, -0.1), 0.8, 0.45);
  cone = smin(cone, sdCone(t, vec3(0.3, 1.25, -0.1), vec3(1.05, 1.3, 0.0), 0.45, 0.2), 0.25);
  cone = smin(cone, sdCone(t, vec3(1.05, 1.3, 0.0), vec3(1.42, 0.92, 0.08), 0.2, 0.12), 0.15);
  cone = max(cone, -(t.y - 0.36));
  add(d, cone + crush - 0.004 * (noise(q * 130.0) - 0.5), 200.0);
  add(d, band * 0.8, 203.0);
  add(d, (sdSphere(t - vec3(1.52, 0.74, 0.1), 0.25) - 0.05 * (noise(q * 16.0) - 0.5) - 0.02 * (noise(q * 55.0) - 0.5)) * 0.8, 203.0);
  if (STAGE >= 3) {                                    // a pencil behind the ear
    vec3 pc = h - vec3(-1.0, 0.25, 0.1); pc.yz = rot(0.35) * pc.yz;
    add(d, sdCapsule(pc, vec3(0.0, 0.0, -0.5), vec3(0.0, 0.0, 0.55), 0.035), 210.0);
  }
}

bool shFC(float id, vec3 p, inout vec3 n, inout Mat m) {
  if (id < 199.5 || id > 229.5) return false;
  vec3 q = fcHead(p), h = q - vec3(0.0, 3.3, 0.1);
  if (id < 200.5) { matFelt(m, n, p, srgb(0.50, 0.03, 0.035)); m.sheen = 0.4; m.sheenCol = srgb(1.0, 0.35, 0.3); return true; }                    // coat and hat
  if (id < 201.5) {                                                                           // skin: soft silicone, a little colour in the cheeks
    vec3 mm = h; mm.x = abs(mm.x);
    float blush = 1.0 - smoothstep(0.0, 0.42, length(mm - vec3(0.45, -0.2, 0.75)));
    float bags = STAGE >= 1 ? (1.0 - smoothstep(0.0, 0.2, length(mm - vec3(0.33, -0.06, 0.86)))) * (0.25 + 0.2 * float(STAGE)) : 0.0;
    m.col = mix(srgb(0.90, 0.66, 0.53), srgb(0.86, 0.45, 0.40), 0.5 * blush) * (0.95 + 0.08 * fbm3(p * 9.0));
    vec3 bagCol = srgb(0.55, 0.40, 0.48);
#if FC_WORN >= 1
    // the colour going out of his face, and bags you can see from across the room
    m.col = mix(m.col, srgb(0.80, 0.75, 0.72), 0.17 * float(FC_WORN));
#if FC_WORN >= 2
    m.col = mix(m.col, srgb(0.80, 0.36, 0.36), 0.55 * (1.0 - smoothstep(0.13, 0.2, length(mm.xy - vec2(0.33, 0.12)))) * step(0.5, mm.z));   // red-rimmed eyes
#endif
    bags = max(bags, (1.0 - smoothstep(0.03, 0.28, length((mm - vec3(0.33, -0.11, 0.86)) * vec3(1.0, 1.45, 1.0)))) * (0.42 + 0.17 * float(FC_WORN)));
    bagCol = mix(bagCol, srgb(0.36, 0.25, 0.40), 0.33 * float(FC_WORN));
#endif
    m.col = mix(m.col, bagCol, bags);
    m.rough = 0.52 + 0.1 * noise(p * 30.0); m.sheen = 0.35; m.sheenCol = srgb(1.0, 0.8, 0.7);
    bumpN(n, p, 60.0, 0.25);
    return true;
  }
  if (id < 202.5) { m.col = srgb(0.80, 0.30, 0.27) * (0.95 + 0.1 * noise(p * 20.0)); m.rough = 0.42; m.sheen = 0.3; m.sheenCol = srgb(1.0, 0.7, 0.6); bumpN(n, p, 70.0, 0.3); return true; }
  if (id < 203.5) {                                                                           // wool: beard, trim, pompom
    float strand = noise(vec3(q.x * 34.0 + sin(q.y * 6.0), q.y * 5.0, q.z * 34.0)), fine = noise(p * 160.0);
    float grey = STAGE >= 2 ? 0.06 * FC_FRIZZ : 0.0;
    m.col = srgb(0.93 - grey, 0.925 - grey, 0.90 - grey) * (0.72 + 0.3 * strand) * (0.88 + 0.16 * fine);
    m.rough = 0.9; m.sheen = 0.8; m.sheenCol = vec3(1.0, 0.98, 0.94);
    n = normalize(n + 0.6 * (hash3(p * 700.0) - 0.5));
    return true;
  }
  if (id < 204.5) { matMetal(m, n, p, 1, vec3(1, 0, 0)); m.rough = 0.22; return true; }           // gold wire
  if (id < 205.5) { matGlass(m, vec3(0.97, 0.99, 1.0), 0.5); return true; }
  if (id < 206.5) { m.col = srgb(0.025, 0.02, 0.02); m.rough = 0.05; m.coat = 1.0; m.coatRough = 0.02; return true; }      // glass bead eyes
  if (id < 207.5) {                                                                           // spiral eyes: printed discs
    vec3 mm = h; mm.x = abs(mm.x); vec2 e = mm.xy - vec2(0.33, 0.12);
    float r = length(e), a = atan(e.y, e.x);
    float sp = smoothstep(0.35, 0.5, abs(fract(r * 16.0 - a / TAU) - 0.5) * 2.0);
    m.col = mix(srgb(0.06, 0.05, 0.06), srgb(0.95, 0.94, 0.9), sp); m.rough = 0.4;
    return true;
  }
  if (id < 208.5) { matMetal(m, n, p, 1, vec3(1, 0, 0)); return true; }                          // brass buttons
  if (id < 209.5) { m.col = srgb(0.20, 0.12, 0.10); m.rough = 0.6; return true; }
  if (id < 210.5) { matPaint(m, n, p, srgb(0.90, 0.68, 0.10), 0.7, 0.3, srgb(0.7, 0.55, 0.35), 0.0); return true; }   // pencil
  if (id > 211.5) { m.col = srgb(0.42, 0.74, 1.0); m.rough = 0.04; m.coat = 1.0; m.coatRough = 0.02; m.emit = vec3(0.25, 0.6, 1.0) * 0.3; return true; }   // sweat: glassy, a little brighter than it should be so it reads
  matLeather(m, n, p, srgb(0.045, 0.04, 0.04), 0.7);                                             // boots
  return true;
}
