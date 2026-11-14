// A real dinosaur: a young tyrannosaur striding, head turned to the camera, jaws a little open. Material ids 100..106.
// Built facing -x in its own space (q), then turned so the head comes toward the camera. h is the head's own space.
#define DINO_SC 1.2
#define DINO_X 0.0
#define DINO_HS 1.25
#define DINO_YAW 0.66
vec3 dinoLocal(vec3 p) { p.x -= DINO_X; p /= DINO_SC; p.xz = rot(-DINO_YAW) * p.xz; return p; }
vec3 dinoHeadSp(vec3 q) { vec3 h = q - vec3(-0.385, 0.845, 0.02); h.xz = rot(-0.35) * h.xz; h.xy = rot(0.20) * h.xy; return h / DINO_HS; }
vec3 dinoJawSp(vec3 h) { vec3 j = h - vec3(-0.015, -0.035, 0.0); j.xy = rot(0.30) * j.xy; return j; }
const vec3 DINO_EYE = vec3(-0.081, 0.029, 0.052);
const vec3 DINO_T0 = vec3(0.22, 0.035, 0.12), DINO_T1 = vec3(0.0, 0.03, -0.12);      // where the toes start: near foot, far foot
float dinoTailZ(float x) { float t = sat((x - 0.14) / 0.56); return -0.16 * t * t; }
float dinoLeg(vec3 p, vec3 hip, vec3 knee, vec3 ank, vec3 toe) {
  float d = sdCone(p, hip, knee, 0.118, 0.072);
  d = smin(d, sdCone(p, knee, mix(knee, ank, 0.55), 0.072, 0.05), 0.03);                // calf
  d = smin(d, sdCone(p, mix(knee, ank, 0.5), ank, 0.05, 0.033), 0.03);
  return smin(d, sdCone(p, ank, toe + vec3(0.0, 0.012, 0.0), 0.033, 0.03), 0.02);       // long foot bones: it walks on its toes
}
float dinoToes(vec3 p, out float claw) {
  vec3 s = vec3(p.xy, abs(p.z));
  float d = sdCapsule(p, vec3(0.0), vec3(-0.105, -0.008, 0.0), 0.02);
  d = smin(d, sdCapsule(s, vec3(0.0, 0.0, 0.004), vec3(-0.078, -0.009, 0.052), 0.019), 0.012);
  d = smin(d, sdCapsule(p, vec3(0.01, 0.01, -0.01), vec3(0.04, 0.012, -0.035), 0.011), 0.01);     // small back toe
  d -= 0.0025 * sin(p.x * 150.0) * step(p.x, -0.01);                                              // knuckles
  claw = sdCone(p, vec3(-0.105, -0.004, 0.0), vec3(-0.152, -0.024, 0.0), 0.0165, 0.003);
  claw = min(claw, sdCone(s, vec3(-0.078, -0.005, 0.052), vec3(-0.115, -0.025, 0.07), 0.0155, 0.003));
  return d;
}
float dinoBody(vec3 q, vec3 h) {
  vec3 t = q - vec3(-0.06, 0.55, 0.0); t.xy = rot(-0.22) * t.xy;
  float d = sdEllipsoid(t, vec3(0.25, 0.15, 0.125));
  d = smin(d, sdEllipsoid(t - vec3(-0.02, -0.05, 0.0), vec3(0.19, 0.14, 0.13)), 0.06);            // deep belly
  d = smin(d, sdEllipsoid(q - vec3(0.10, 0.52, 0.0), vec3(0.15, 0.14, 0.13)), 0.08);              // hips
  float tt = sat((q.x - 0.14) / 0.56);
  float tail = length(vec2(sdBezier(q.xy, vec2(0.14, 0.53), vec2(0.44, 0.50), vec2(0.70, 0.61)), (q.z - dinoTailZ(q.x)) * 1.15)) - mix(0.125, 0.005, pow(tt, 0.8));
  d = smin(d, tail * 0.8, 0.08);
  d = smin(d, sdCone(q, vec3(-0.24, 0.62, 0.0), vec3(-0.335, 0.75, 0.01), 0.115, 0.085), 0.07);   // neck, an S-curve
  d = smin(d, sdCone(q, vec3(-0.335, 0.75, 0.01), vec3(-0.385, 0.84, 0.02), 0.085, 0.07), 0.04);
  // legs: near one planted forward, far one pushing off behind
  d = smin(d, dinoLeg(q, vec3(0.11, 0.50, 0.095), vec3(0.06, 0.31, 0.125), vec3(0.25, 0.20, 0.12), DINO_T0), 0.06);
  d = smin(d, dinoLeg(q, vec3(0.09, 0.50, -0.095), vec3(-0.045, 0.335, -0.125), vec3(0.07, 0.165, -0.12), DINO_T1), 0.06);
  // little two-fingered arms
  vec3 qs = vec3(q.xy, abs(q.z));
  float arm = sdCone(qs, vec3(-0.235, 0.50, 0.095), vec3(-0.20, 0.435, 0.112), 0.027, 0.02);
  arm = smin(arm, sdCone(qs, vec3(-0.20, 0.435, 0.112), vec3(-0.262, 0.40, 0.102), 0.02, 0.014), 0.012);
  d = smin(d, arm, 0.025);
  // head: deep skull, long snout, brow horns over the eyes
  vec3 hs = vec3(h.xy, abs(h.z)), hz = vec3(h.xy, h.z * 1.2);
  float hd = sdEllipsoid(h - vec3(-0.035, 0.004, 0.0), vec3(0.082, 0.064, 0.068));
  hd = smin(hd, sdCone(hz, vec3(-0.07, -0.002, 0.0), vec3(-0.225, -0.014, 0.0), 0.056, 0.039) * 0.83, 0.03);
  hd = smin(hd, sdEllipsoid(hs - vec3(-0.075, 0.058, 0.04), vec3(0.034, 0.015, 0.024)), 0.015);
  hd -= 0.0035 * (0.5 + 0.5 * sin(h.x * 170.0)) * smoothstep(0.02, 0.045, h.y) * smoothstep(-0.23, -0.12, -abs(h.x + 0.15) - 0.1);
  hd = smax(hd, -(h.y + 0.05 + 0.03 * (h.x + 0.07)), 0.008);                                       // the tooth line of the upper jaw
  hd = smax(hd, -sdSphere(hs - vec3(-0.238, 0.012, 0.02), 0.007), 0.004);                        // nostrils
  vec3 j = dinoJawSp(h);
  float jaw = sdCone(vec3(j.xy, j.z * 1.25), vec3(0.0, -0.022, 0.0), vec3(-0.192, -0.024, 0.0), 0.038, 0.021) * 0.8;
  jaw = smax(jaw, j.y + 0.006, 0.008);
  hd = smin(hd, jaw, 0.012);
  return smin(d, hd * DINO_HS, 0.03);
}
// pebbly scales: returns the distance to the edge of the scale (0 in the groove), toC = vector to the scale's middle, id = a random number per scale
float dinoScales(vec3 x, out vec3 toC, out float id) {
  vec3 i = floor(x), f = fract(x); float d1 = 8.0, d2 = 8.0; toC = vec3(0); id = 0.0;
  for (int z = -1; z <= 1; z++) for (int y = -1; y <= 1; y++) for (int k = -1; k <= 1; k++) {
    vec3 g = vec3(k, y, z), r = g + hash3(i + g) - f; float dd = dot(r, r);
    if (dd < d1) { d2 = d1; d1 = dd; toC = r; id = hash1(i + g + 7.7); } else if (dd < d2) d2 = dd;
  }
  return sqrt(d2) - sqrt(d1);
}
void mGift(vec3 p, inout float d) {
  float bb = length(p - vec3(0, 0.5, 0)) - 0.86;
  if (bb > 0.15) { d = min(d, bb); return; }
  vec3 q = dinoLocal(p), h = dinoHeadSp(q);
  float f = dinoBody(q, h);
  if (f < 0.03) f -= 0.008 * (fbm3(q * 14.0) - 0.5) + 0.004 * sin((q.x * 0.8 + q.y) * 95.0 + 3.0 * noise(q * 9.0)) * (1.0 - smoothstep(0.08, 0.2, length(q.xy - vec2(-0.31, 0.72))));   // lumps of muscle, folds at the throat
  else f -= 0.008;
  add(d, f * DINO_SC * 0.9, 100.0);
  // feet
  float c0, c1; float toes = min(dinoToes(q - DINO_T0, c0), dinoToes(q - DINO_T1, c1));
  add(d, toes * DINO_SC * 0.9, 101.0);
  vec3 qs = vec3(q.xy, abs(q.z));
  float claws = min(min(c0, c1), min(sdCone(qs, vec3(-0.262, 0.40, 0.102), vec3(-0.296, 0.372, 0.112), 0.011, 0.002), sdCone(qs, vec3(-0.262, 0.40, 0.102), vec3(-0.292, 0.39, 0.088), 0.010, 0.002)));
  add(d, claws * DINO_SC, 102.0);
  // inside the head's reach: eyes, teeth, mouth
  float hb = length(h - vec3(-0.11, -0.02, 0.0)) - 0.2;
  if (hb > 0.05) { d = min(d, hb * DINO_HS * DINO_SC); return; }
  float hk = DINO_HS * DINO_SC;
  vec3 hs = vec3(h.xy, abs(h.z)), j = dinoJawSp(h);
  add(d, sdSphere(hs - DINO_EYE, 0.012) * hk, 103.0);
  // upper teeth: a row of curved cones of uneven length down each side, and a pair at the front
  float tx = h.x + 0.142, ti = clamp(floor(tx / 0.0205 + 0.5), -3.0, 3.0);
  float len = 0.017 + 0.02 * hash1(ti + 5.0) * (1.0 - 0.1 * abs(ti));
  float ze = mix(0.026, 0.041, sat((h.x + 0.21) / 0.14));
  float teeth = sdCone(vec3(tx - 0.0205 * ti, h.y + 0.047 + 0.03 * (h.x + 0.07), abs(h.z) - ze), vec3(0.0), vec3(0.006, -len, -0.002), 0.0052, 0.0006);
  teeth = min(teeth, sdCone(hs, vec3(-0.236, -0.043, 0.012), vec3(-0.234, -0.064, 0.012), 0.0055, 0.001));
  // lower teeth, smaller
  float lx = j.x + 0.115, li = clamp(floor(lx / 0.019 + 0.5), -3.0, 3.0);
  float zl = mix(0.016, 0.027, sat((j.x + 0.19) / 0.14));
  teeth = min(teeth, sdCone(vec3(lx - 0.019 * li, j.y + 0.008, abs(j.z) - zl), vec3(0.0), vec3(0.003, 0.012 + 0.008 * hash1(li + 2.0), 0.0), 0.005, 0.001));
  add(d, teeth * hk, 104.0);
  add(d, sdEllipsoid(h - vec3(-0.105, -0.058, 0.0), vec3(0.095, 0.02, 0.03)) * hk, 105.0);                 // roof and back of the mouth
  add(d, sdEllipsoid(j - vec3(-0.09, -0.004, 0.0), vec3(0.075, 0.011, 0.017)) * hk, 106.0);                // tongue
}
bool shGift(float id, vec3 p, inout vec3 n, inout Mat m) {
  if (id < 100.0 || id >= 110.0) return false;
  vec3 q = dinoLocal(p), h = dinoHeadSp(q);
  if (id < 101.5) {
    vec3 hs = vec3(h.xy, abs(h.z));
    float onHead = 1.0 - smoothstep(0.16, 0.22, length(h - vec3(-0.10, 0.0, 0.0)));
    float foot = id > 100.5 ? 1.0 : 0.0;
    // two sizes of scale: fine pebbles everywhere, coarser ones on the snout, feet and back
    vec3 toC; float sid; float e = onHead > 0.5 ? dinoScales(h * 92.0, toC, sid) : dinoScales(q * mix(70.0, 54.0, foot), toC, sid);
    if (onHead > 0.5) { toC.xy = rot(-0.20) * toC.xy; toC.xz = rot(0.35) * toC.xz; }
    toC.xz = rot(DINO_YAW) * toC.xz;                                                                              // back into the world's frame
    float under = 1.0 - smoothstep(-0.8, -0.05, n.y + 0.15 * (fbm3(q * 9.0) - 0.5));
    float upper = smoothstep(-0.25, 0.55, n.y);
    float warp = fbm3(q * 5.0 + 3.0);
    float band = smoothstep(0.1, 0.55, sin((q.x + 0.35 * q.y) * 36.0 + 6.0 * warp)) * upper;                       // dark bars across the back and tail
    float blotch = smoothstep(0.52, 0.62, fbm3(q * 17.0 + 8.0));
    vec3 c = mix(srgb(0.37, 0.41, 0.17), srgb(0.36, 0.25, 0.12), smoothstep(0.35, 0.7, warp));                    // olive green drifting to brown
    c = mix(c, srgb(0.10, 0.115, 0.06), 0.88 * band);
    c = mix(c, srgb(0.50, 0.50, 0.22), 0.5 * blotch * (1.0 - band));
    c = mix(c, srgb(0.84, 0.76, 0.52), 0.9 * under);                                                               // pale belly and throat
    float brow = onHead * (1.0 - smoothstep(0.012, 0.036, length(hs - vec3(-0.075, 0.064, 0.04))));
    c = mix(c, srgb(0.56, 0.27, 0.11), 0.45 * brow);                                                               // rusty crests over the eyes
    float eyeRim = 1.0 - smoothstep(0.013, 0.021, length(hs - DINO_EYE));
    float lips = onHead * (1.0 - smoothstep(0.0, 0.012, abs(h.y + 0.052 + 0.03 * (h.x + 0.07)))) * step(h.x, -0.05);
    c = mix(c, srgb(0.07, 0.07, 0.05), max(eyeRim, 0.5 * lips));
    c = mix(c, c * srgb(0.55, 0.5, 0.45), 0.35 * foot);
    float groove = smoothstep(0.02, 0.16, e);
    m.col = c * mix(0.42, 1.0, groove) * mix(0.74, 1.2, sid);
    m.rough = mix(0.72, 0.52, groove); m.coat = 0.08 * groove; m.coatRough = 0.3;
    vec3 tilt = toC - n * dot(toC, n);
    n = normalize(n - 0.7 * tilt * (1.0 - groove * 0.4) + 0.06 * (hash3(p * 600.0) - 0.5));
    return true;
  }
  if (id < 102.5) {   // claws: dark horn, paler and worn toward the point
    float g = noise(q * vec3(90.0, 300.0, 300.0));
    m.col = mix(srgb(0.10, 0.08, 0.06), srgb(0.55, 0.47, 0.36), (1.0 - smoothstep(0.0, 0.03, q.y)) * 0.8 + 0.1) * (0.85 + 0.3 * g);
    m.rough = 0.3; m.coat = 0.5; m.coatRough = 0.12; return true;
  }
  if (id < 103.5) {   // eye: amber iris, round black pupil, wet
    vec3 hs = vec3(h.xy, abs(h.z)); vec3 e = normalize(hs - DINO_EYE);
    float a = dot(e, normalize(vec3(-0.45, 0.05, 1.0)));
    m.col = mix(srgb(0.98, 0.70, 0.12) * (0.75 + 0.45 * noise(e * 24.0)), srgb(0.01, 0.01, 0.01), smoothstep(0.86, 0.90, a));
    m.col = mix(srgb(0.12, 0.07, 0.03), m.col, smoothstep(0.35, 0.5, a));
    m.rough = 0.1; m.coat = 1.0; m.coatRough = 0.06;
    m.glow = vec3(1.6, 1.5, 1.35) * smoothstep(0.945, 0.975, dot(e, normalize(vec3(-0.45, 0.62, 0.64))));       // the lamp caught in the eye
    return true;
  }
  if (id < 104.5) {   // teeth: ivory, stained at the gum
    vec3 j = dinoJawSp(h);
    float root = max(1.0 - smoothstep(0.0, 0.012, -(h.y + 0.047 + 0.03 * (h.x + 0.07))), 1.0 - smoothstep(0.0, 0.008, j.y + 0.008));
    m.col = mix(srgb(0.92, 0.88, 0.74), srgb(0.62, 0.50, 0.32), 0.6 * sat(root)) * (0.9 + 0.15 * noise(p * 250.0)); m.rough = 0.22; m.coat = 0.6; m.coatRough = 0.1; return true;
  }
  if (id < 105.5) { m.col = srgb(0.30, 0.07, 0.07) * (0.8 + 0.4 * noise(p * 120.0)); m.rough = 0.3; m.coat = 0.7; m.coatRough = 0.15; return true; }      // mouth
  m.col = srgb(0.70, 0.33, 0.33) * (0.85 + 0.3 * noise(p * 260.0)); m.rough = 0.3; m.coat = 0.8; m.coatRough = 0.12; bumpN(n, p, 260.0, 0.7);            // tongue
  return true;
}
