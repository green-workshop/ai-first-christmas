// A live grizzly bear walking on all fours, head turned toward the camera, mouth a little open. Material ids 100..106.
// Built facing -x in its own space (q), then turned so the head comes toward the camera. h is the head's own space.
#define GRZ_SC 1.0
#define GRZ_X 0.045
vec3 grzLocal(vec3 p) { p.x -= GRZ_X; p /= GRZ_SC; p.xz = rot(-0.40) * p.xz; return p; }
vec3 grzHeadSp(vec3 q) { vec3 h = q - vec3(-0.47, 0.53, 0.04); h.xz = rot(-0.45) * h.xz; h.xy = rot(0.22) * h.xy; return h; }
float grzLeg(vec3 p, vec3 a, vec3 b, vec3 c, float ra, float rb, float rc) {
  return smin(sdCone(p, a, b, ra, rb), sdCone(p, b, c, rb, rc), 0.035);
}
// paw centres (front near, front far, hind near, hind far)
const vec3 GRZ_P0 = vec3(-0.335, 0.040, 0.135), GRZ_P1 = vec3(-0.105, 0.040, -0.135), GRZ_P2 = vec3(0.225, 0.036, 0.145), GRZ_P3 = vec3(0.385, 0.036, -0.14);
const vec3 GRZ_EYE = vec3(-0.128, 0.036, 0.083), GRZ_MOUTH = vec3(-0.13, -0.102, 0.0);
float grzBody(vec3 q, vec3 h) {
  // barrel: deep chest, shoulder hump, belly, heavy rump
  float d = sdEllipsoid(q - vec3(-0.20, 0.50, 0), vec3(0.25, 0.235, 0.185));
  d = smin(d, sdEllipsoid(q - vec3(-0.15, 0.715, 0), vec3(0.165, 0.118, 0.12)), 0.10);
  d = smin(d, sdEllipsoid(q - vec3(0.08, 0.495, 0), vec3(0.28, 0.20, 0.19)), 0.10);
  d = smin(d, sdEllipsoid(q - vec3(0.33, 0.50, 0), vec3(0.215, 0.225, 0.185)), 0.10);
  d = smin(d, sdEllipsoid(q - vec3(0.55, 0.56, 0), vec3(0.04, 0.035, 0.035)), 0.03);                       // stub of a tail
  d = smin(d, sdCone(q, vec3(-0.28, 0.60, 0.0), vec3(-0.44, 0.545, 0.03), 0.19, 0.16), 0.08);             // neck
  // front legs: thick columns. near one reaching forward, far one back under the body
  d = smin(d, grzLeg(q, vec3(-0.25, 0.43, 0.115), vec3(-0.235, 0.27, 0.135), vec3(-0.295, 0.09, 0.135), 0.125, 0.10, 0.08), 0.07);
  d = smin(d, grzLeg(q, vec3(-0.18, 0.43, -0.115), vec3(-0.12, 0.27, -0.135), vec3(-0.065, 0.09, -0.135), 0.125, 0.10, 0.08), 0.07);
  d = smin(d, sdEllipsoid(q - GRZ_P0, vec3(0.08, 0.042, 0.068)), 0.03);
  d = smin(d, sdEllipsoid(q - GRZ_P1, vec3(0.08, 0.042, 0.068)), 0.03);
  // hind legs: heavy thigh, knee forward, heel down on the ground (bears walk flat-footed)
  d = smin(d, grzLeg(q, vec3(0.33, 0.44, 0.105), vec3(0.245, 0.26, 0.145), vec3(0.365, 0.085, 0.14), 0.155, 0.11, 0.068), 0.07);
  d = smin(d, grzLeg(q, vec3(0.37, 0.44, -0.105), vec3(0.36, 0.26, -0.145), vec3(0.515, 0.10, -0.14), 0.155, 0.11, 0.068), 0.07);
  d = smin(d, sdCone(q, vec3(0.365, 0.062, 0.14), GRZ_P2 + vec3(0.02, 0, 0), 0.05, 0.04), 0.03);
  d = smin(d, sdCone(q, vec3(0.515, 0.075, -0.14), GRZ_P3 + vec3(0.02, 0, 0), 0.05, 0.04), 0.03);
  d = smin(d, sdEllipsoid(q - GRZ_P2, vec3(0.07, 0.038, 0.06)), 0.03);
  d = smin(d, sdEllipsoid(q - GRZ_P3, vec3(0.07, 0.038, 0.06)), 0.03);
  // head: broad skull, dished face, long muzzle, round ears, cheek ruff
  vec3 hs = vec3(h.xy, abs(h.z));
  float hd = sdEllipsoid(h, vec3(0.15, 0.135, 0.15));
  hd = smin(hd, sdCone(h, vec3(-0.10, -0.03, 0), vec3(-0.245, -0.045, 0), 0.078, 0.052), 0.05);
  hd = smin(hd, sdEllipsoid(hs - vec3(0.03, -0.045, 0.085), vec3(0.10, 0.10, 0.075)), 0.05);
  hd = smin(hd, sdEllipsoid(hs - vec3(-0.105, 0.062, 0.06), vec3(0.04, 0.024, 0.035)), 0.03);            // brow
  vec3 e = hs - vec3(0.03, 0.135, 0.112);
  float ear = sdEllipsoid(e, vec3(0.036, 0.072, 0.064));
  ear = smax(ear, -sdSphere(e - vec3(-0.06, 0.0, 0.012), 0.054), 0.02);
  hd = smin(hd, ear, 0.025);
  hd = smin(hd, sdCone(h, vec3(-0.05, -0.10, 0), vec3(-0.21, -0.147, 0), 0.052, 0.027), 0.018);          // lower jaw, dropped open
  return smin(d, hd, 0.05);
}
// fur: long locks, strands and fine fibres combed along dir. returns the height and the strand value for colouring
float grzStrands(vec3 q, vec3 dir, out float tip) {
  float a = dot(q, dir); vec3 u = q - dir * a * 0.91, u2 = q - dir * a * 0.95;
  float lock = noise(u2 * 66.0 + 3.0) - 0.5, strand = noise(u * 180.0) - 0.5, fine = noise(u * 360.0 + 7.0) - 0.5;
  tip = strand + 0.5 + 0.5 * lock;
  return 0.011 * lock + 0.009 * strand + 0.004 * fine;
}
// the whole coat: direction and length change over the body. tip = per-fibre value, about 0..1
float grzFur(vec3 q, vec3 h, out float tip) {
  float wH = 1.0 - smoothstep(0.17, 0.25, length(h - vec3(-0.06, -0.02, 0)));
  float wL = (1.0 - smoothstep(0.22, 0.36, q.y)) * (1.0 - wH);
  float wB = 1.0 - wH - wL;
  float f = 0.0, t; tip = 0.0;
  if (wB > 0.01) { float len = 1.0 + 0.35 * smoothstep(0.55, 0.75, q.y) * (1.0 - smoothstep(0.0, 0.2, q.x)); f += wB * len * grzStrands(q, normalize(vec3(0.72, -0.69, 0.0)), t); tip += wB * t; }
  if (wL > 0.01) { float len = mix(0.4, 0.95, smoothstep(0.03, 0.2, q.y)); f += wL * len * grzStrands(q, normalize(vec3(0.22, -1.0, 0.0)), t); tip += wL * t; }
  if (wH > 0.01) { float len = mix(0.25, 0.95, smoothstep(-0.2, -0.04, h.x)); f += wH * len * grzStrands(h, normalize(vec3(1.0, -0.35, 0.0)), t); tip += wH * t; }
  return f;
}
float grzClaws(vec3 r, float len) {
  float i = clamp(floor(r.z / 0.026 + 0.5), -2.0, 2.0); r.z -= 0.026 * i; r.x -= 0.007 * i * i;
  float c = sdCone(r, vec3(-0.058, -0.008, 0), vec3(-0.058 - 0.62 * len, -0.022, 0), 0.0105, 0.0075);
  return smin(c, sdCone(r, vec3(-0.058 - 0.6 * len, -0.022, 0), vec3(-0.058 - len, -0.037, 0), 0.0075, 0.0028), 0.006);
}
void mGift(vec3 p, inout float d) {
  float bb = length(p - vec3(0, 0.4, 0)) - 0.82;
  if (bb > 0.15) { d = min(d, bb); return; }
  vec3 q = grzLocal(p), h = grzHeadSp(q);
  float f = grzBody(q, h);
  if (f > 0.05) { d = min(d, (f - 0.022) * GRZ_SC); return; }
  float tip; float fuzz = grzFur(q, h, tip);
  add(d, (f - fuzz) * GRZ_SC * 0.85, 100.0);
  // claws: long and pale on the front feet, shorter behind
  float cl = min(min(grzClaws(q - GRZ_P0, 0.058), grzClaws(q - GRZ_P1, 0.058)), min(grzClaws(q - GRZ_P2, 0.04), grzClaws(q - GRZ_P3, 0.04)));
  add(d, cl * GRZ_SC, 103.0);
  // face
  float hb = length(h - vec3(-0.12, -0.03, 0)) - 0.24;
  if (hb > 0.06) { d = min(d, hb * GRZ_SC); return; }
  vec3 hs = vec3(h.xy, abs(h.z));
  float nose = sdEllipsoid(h - vec3(-0.288, -0.034, 0), vec3(0.03, 0.028, 0.041));
  nose = smax(nose, -sdEllipsoid(hs - vec3(-0.318, -0.04, 0.017), vec3(0.012, 0.008, 0.008)), 0.008);
  add(d, nose * GRZ_SC, 101.0);
  add(d, sdSphere(hs - GRZ_EYE, 0.0135) * GRZ_SC, 102.0);
  // inside the mouth, tongue, canines
  add(d, sdEllipsoid(h - GRZ_MOUTH, vec3(0.085, 0.028, 0.034)) * GRZ_SC, 104.0);
  add(d, sdEllipsoid(h - vec3(-0.15, -0.118, 0), vec3(0.068, 0.012, 0.024)) * GRZ_SC, 105.0);
  float teeth = sdCone(hs, vec3(-0.222, -0.088, 0.03), vec3(-0.227, -0.122, 0.031), 0.0068, 0.002);
  teeth = min(teeth, sdCone(hs, vec3(-0.196, -0.128, 0.021), vec3(-0.20, -0.102, 0.022), 0.007, 0.003));
  teeth = min(teeth, sdRBox(h - vec3(-0.236, -0.094, 0), vec3(0.006, 0.008, 0.02), 0.005));               // incisors
  add(d, teeth * GRZ_SC, 106.0);
}
bool shGift(float id, vec3 p, inout vec3 n, inout Mat m) {
  if (id < 100.0 || id >= 110.0) return false;
  vec3 q = grzLocal(p), h = grzHeadSp(q);
  if (id < 100.5) {
    float tip; grzFur(q, h, tip); tip = sat(tip);
    vec3 hs = vec3(h.xy, abs(h.z));
    float head = 1.0 - smoothstep(0.17, 0.25, length(h - vec3(-0.06, -0.02, 0)));
    float legs = (1.0 - smoothstep(0.12, 0.44, q.y + 0.05 * fbm3(q * 9.0))) * (1.0 - head);
    float top = smoothstep(0.42, 0.66, q.y + 0.08 * fbm3(q * 7.0 + 2.0)) * (1.0 - head);
    float muzzle = head * (1.0 - smoothstep(-0.19, -0.09, h.x));
    vec3 under = srgb(0.19, 0.105, 0.05), tips = srgb(0.42, 0.25, 0.115);
    under = mix(under, srgb(0.15, 0.09, 0.055), 0.85 * legs); tips = mix(tips, srgb(0.34, 0.215, 0.115), 0.8 * legs);
    tips = mix(tips, srgb(0.72, 0.56, 0.35), 0.6 * top);                                     // the grizzled, sun-bleached back and hump
    under = mix(under, srgb(0.44, 0.31, 0.19), muzzle); tips = mix(tips, srgb(0.70, 0.56, 0.38), muzzle);
    tips = mix(tips, srgb(0.60, 0.46, 0.28), 0.5 * head * (1.0 - muzzle));
    float blot = fbm3(q * 5.0 + 9.0);
    m.col = mix(under, tips, smoothstep(0.35, 0.95, tip)) * mix(0.7, 1.15, blot) * mix(0.8, 1.15, noise(q * 400.0));
    // dark bare skin round the eyes, the lips and inside the ears
    float eye = 1.0 - smoothstep(0.016, 0.03, length(hs - GRZ_EYE));
    float lip = 1.0 - smoothstep(0.004, 0.02, sdEllipsoid(h - GRZ_MOUTH, vec3(0.085, 0.028, 0.034)));
    float inear = 1.0 - smoothstep(0.03, 0.05, length(hs - vec3(-0.03, 0.135, 0.124)));
    float pad = 1.0 - smoothstep(0.004, 0.012, q.y);
    m.col = mix(m.col, srgb(0.06, 0.04, 0.035), max(max(eye, lip), max(0.6 * inear, pad)));
    m.rough = 0.85; m.sheen = 0.55 * (1.0 - max(eye, lip)); m.sheenCol = mix(tips, vec3(1.0, 0.86, 0.62), 0.4);
    n = normalize(n + 0.7 * (hash3(p * 913.0) - 0.5) + vec3(0.0, -0.2, 0.0));
    return true;
  }
  if (id < 101.5) {   // wet nose leather
    m.col = srgb(0.05, 0.04, 0.04); m.rough = 0.35; m.coat = 0.9; m.coatRough = 0.1; bumpN(n, p, 120.0, 0.5); return true;
  }
  if (id < 102.5) { m.col = srgb(0.07, 0.035, 0.015); m.rough = 0.05; m.coat = 1.0; m.coatRough = 0.02; return true; }                 // eyes
  if (id < 103.5) {   // claws: pale horn, darker at the root, fine grain along the length
    float g = noise(vec3(q.x * 60.0, q.y * 300.0, q.z * 300.0));
    m.col = mix(srgb(0.30, 0.22, 0.14), srgb(0.80, 0.72, 0.56), smoothstep(0.0, 0.04, 0.045 - q.y)) * (0.85 + 0.3 * g); m.rough = 0.32; m.coat = 0.4; m.coatRough = 0.15; return true;
  }
  if (id < 104.5) { m.col = srgb(0.16, 0.035, 0.035); m.rough = 0.35; m.coat = 0.6; return true; }                                 // mouth
  if (id < 105.5) { m.col = srgb(0.72, 0.36, 0.36) * (0.85 + 0.3 * noise(p * 300.0)); m.rough = 0.3; m.coat = 0.8; m.coatRough = 0.1; bumpN(n, p, 300.0, 0.8); return true; }   // tongue
  m.col = srgb(0.88, 0.82, 0.66) * (0.9 + 0.15 * noise(p * 200.0)); m.rough = 0.25; m.coat = 0.7; m.coatRough = 0.08;               // teeth
  return true;
}
