// Children's flannel pyjamas with a dinosaur print, folded as they come from the shop: the buttoned top lies on the
// folded trousers, one sleeve brought round to the front, the stack propped up to face the room.
// Material ids: 100 top, 101 collar, 102 piping, 103 buttons, 104 button thread, 105 sleeve, 106 trousers, 107 drawstring.
// HUE is the colour of the cloth.
#ifndef HUE
#define HUE srgb(0.20, 0.42, 0.74)
#endif
const float PJ_S = 1.07;
float pjSq(float x) { return x * x; }
float pjTri(vec2 p, vec2 p0, vec2 p1, vec2 p2) {
  vec2 e0 = p1 - p0, e1 = p2 - p1, e2 = p0 - p2, v0 = p - p0, v1 = p - p1, v2 = p - p2;
  vec2 q0 = v0 - e0 * sat(dot(v0, e0) / dot(e0, e0)), q1 = v1 - e1 * sat(dot(v1, e1) / dot(e1, e1)), q2 = v2 - e2 * sat(dot(v2, e2) / dot(e2, e2));
  float s = sign(e0.x * e2.y - e0.y * e2.x);
  vec2 d = min(min(vec2(dot(q0, q0), s * (v0.x * e0.y - v0.y * e0.x)), vec2(dot(q1, q1), s * (v1.x * e1.y - v1.y * e1.x))), vec2(dot(q2, q2), s * (v2.x * e2.y - v2.y * e2.x)));
  return -sqrt(d.x) * sign(d.y);
}
// ---- the print: little dinosaurs, two kinds, walking in rows ----
float pjDinoA(vec2 p) {                                                           // long-neck
  float d = (length(p / vec2(0.036, 0.021)) - 1.0) * 0.021;
  vec2 a = vec2(0.022, 0.006), b = vec2(0.047, 0.046), pa = p - a, ba = b - a; float h = sat(dot(pa, ba) / dot(ba, ba));
  d = smin(d, length(pa - ba * h) - mix(0.010, 0.0055, h), 0.008);
  d = min(d, (length((p - vec2(0.054, 0.049)) / vec2(0.012, 0.0075)) - 1.0) * 0.0075);
  a = vec2(-0.026, 0.002); b = vec2(-0.068, -0.014); pa = p - a; ba = b - a; h = sat(dot(pa, ba) / dot(ba, ba));
  d = smin(d, length(pa - ba * h) - mix(0.011, 0.0015, h), 0.008);
  vec2 l = vec2(abs(p.x - 0.002) - 0.017, p.y);
  d = min(d, sdSeg2(l, vec2(0.0, -0.010), vec2(0.0, -0.033)) - 0.0075);
  return max(d, 0.0028 - length(p - vec2(0.057, 0.051)));                          // eye
}
float pjDinoB(vec2 p) {                                                           // plated one
  float d = (length((p - vec2(0.0, -0.002)) / vec2(0.038, 0.023)) - 1.0) * 0.023;
  vec2 a = vec2(0.030, -0.004), b = vec2(0.058, -0.016), pa = p - a, ba = b - a; float h = sat(dot(pa, ba) / dot(ba, ba));
  d = smin(d, length(pa - ba * h) - mix(0.011, 0.0068, h), 0.008);
  a = vec2(-0.030, 0.0); b = vec2(-0.070, 0.013); pa = p - a; ba = b - a; h = sat(dot(pa, ba) / dot(ba, ba));
  d = smin(d, length(pa - ba * h) - mix(0.011, 0.002, h), 0.008);
  vec2 l = vec2(abs(p.x) - 0.018, p.y);
  d = min(d, sdSeg2(l, vec2(0.0, -0.012), vec2(0.0, -0.036)) - 0.0075);
  for (int i = 0; i < 4; i++) {
    float x = -0.027 + 0.018 * float(i), y = 0.021 * sqrt(max(1.0 - x * x / (0.038 * 0.038), 0.0)) + 0.005;
    vec2 q = abs(p - vec2(x, y)); d = min(d, (q.x + 0.6 * q.y - 0.0078) * 0.8);
  }
  return max(d, 0.0026 - length(p - vec2(0.056, -0.013)));
}
vec3 pjPrint(vec2 uv, vec3 ground) {
  vec2 cs = vec2(0.188, 0.150);
  vec2 g = uv / cs; float row = floor(g.y); g.x += 0.5 * mod(row, 2.0) + 0.13 * row;
  vec2 cell = floor(g), f = (fract(g) - 0.5) * cs;
  float hsh = hash1(cell + 3.1), kind = mod(cell.x + row, 2.0);
  vec2 fd = f; fd.x *= mod(row, 2.0) < 0.5 ? 1.0 : -1.0; fd = rot((hsh - 0.5) * 0.35) * fd;
  float dd = kind < 0.5 ? pjDinoA(fd) : pjDinoB(fd);
  vec3 ink = kind < 0.5 ? srgb(0.99, 0.87, 0.42) : srgb(0.96, 0.44, 0.20);
  vec3 c = mix(ink, ground, 0.06 + 0.94 * smoothstep(-0.0012, 0.0012, dd));
  // three little leaves in the gaps
  vec2 fc = (fract(g + 0.5) - 0.5) * cs; fc = rot(hsh * 6.0) * fc;
  float dots = min(length(fc - vec2(0.010, 0.0)), min(length(fc - vec2(-0.006, 0.009)), length(fc - vec2(-0.005, -0.010)))) - 0.0042;
  return mix(srgb(0.96, 0.94, 0.86), c, 0.1 + 0.9 * smoothstep(-0.001, 0.001, dots));
}
// ---- geometry, in the stack's own space: x across, y from the hem end (0) up to the collar (1.05), z up out of the stack ----
vec3 pjLocal(vec3 p) { vec3 q = p - vec3(0.0, 0.0, 0.27); q.yz = rot(-0.58) * q.yz; q /= PJ_S; q.y -= 0.12; return q; }
// soft creases: thin wandering lines where the cloth has been pressed
float pjCrease(vec2 p, float sd) { return 1.0 - smoothstep(0.0, 0.10, abs(noise(p * 3.6 + sd) - 0.5)); }
float pjShirt2(vec2 p) {
  float d = sdBox2(p - vec2(0.0, 0.56), vec2(0.485, 0.48) - 0.045) - 0.045 + 0.007 * sin(p.y * 17.0 + 1.0) * sin(p.x * 3.0) + 0.006 * sin(p.x * 13.0 + 2.0);
  return smax(d, (p.y - 1.05 + 0.14 * abs(p.x)) * 0.99, 0.04);
}
const vec2 PJ_P1 = vec2(0.035, 1.05), PJ_P2 = vec2(0.26, 0.90), PJ_P3 = vec2(0.010, 0.69);
float pjLeaf2(vec2 cu) {
  float leaf = pjTri(cu, PJ_P1, PJ_P2, PJ_P3) - 0.012;
  return max(leaf, -pjTri(cu, vec2(0.171, 0.814), vec2(0.151, 0.796), vec2(0.139, 0.831)));   // the notch between collar and lapel
}
const vec2 PJ_S0 = vec2(-0.52, 0.52), PJ_SD = vec2(0.8944, -0.4472);
const float PJ_SL = 0.43;
vec2 pjSleeveUV(vec2 p) { vec2 sp = p - PJ_S0; return vec2(dot(sp, PJ_SD), dot(sp, vec2(-PJ_SD.y, PJ_SD.x))); }
void mGift(vec3 p, inout float d) {
  float bb = length(p - vec3(0.0, 0.50, -0.05)) - 0.92;
  if (bb > 0.15) { d = min(d, bb); return; }
  vec3 q = pjLocal(p); float u = q.x, v = q.y, w = q.z, K = PJ_S * 0.8;
  float lumps = fbm3(vec3(q.xy * 2.6, 1.0)) - 0.5, crease = pjCrease(q.xy, 2.0);
  // trousers, folded in three underneath; the gathered waistband lies at the front
  vec3 tq = q - vec3(0.012, 0.44, 0.0625); tq.xy = rot(0.03) * tq.xy;
  float tr = sdRBox(tq, vec3(0.505, 0.56, 0.0625), 0.055);
  float front = 1.0 - smoothstep(-0.10, 0.0, v), side = smoothstep(0.44, 0.50, abs(tq.x));
  tr += max(front, side) * 0.008 * (exp(-pjSq((w - 0.042) / 0.006)) + exp(-pjSq((w - 0.086) / 0.006)));   // the layers of the fold
  float band = (1.0 - smoothstep(-0.03, -0.015, v)) * smoothstep(0.075, 0.095, w);
  tr -= band * (0.005 * sin(u * 150.0 + 2.5 * sin(u * 23.0)) + 0.004);                               // elastic gathers in the waistband
  tr -= 0.012 * (fbm3(vec3(q.xy * 3.5, 4.0)) - 0.5) - 0.004 * pjCrease(q.xy, 9.0);
  add(d, tr * K, 106.0);
  // the top
  float s2 = pjShirt2(q.xy);
  float sh = extrudeR(s2, w - 0.1625, 0.0375, 0.035);
  float topm = smoothstep(0.16, 0.19, w);
  sh -= topm * (0.022 * lumps + 0.006 * exp(-pjSq((abs(u) - 0.34) / 0.03)) + 0.005 * sin(v * 9.0 + u * 5.0) - 0.008 * crease + 0.006 * exp(-pjSq((v - 0.40 - 0.03 * sin(u * 5.0)) / 0.02)));
  sh += 0.007 * exp(-pjSq((w - 0.160) / 0.005)) * smoothstep(-0.03, -0.01, s2);                      // it is folded double: a line round the edge
  sh -= 0.004 * (1.0 - smoothstep(0.033, 0.038, abs(u - 0.002))) * (1.0 - smoothstep(0.69, 0.72, v));   // button band
  float po2 = sdBox2(q.xy - vec2(0.27, 0.50), vec2(0.105, 0.11) - 0.02) - 0.02;
  sh -= 0.004 * (1.0 - smoothstep(-0.003, 0.003, po2));                                              // breast pocket
  float vt = pjTri(q.xy, vec2(-0.04, 1.07), vec2(0.04, 1.07), vec2(0.0, 0.70));
  sh = smax(sh, -max(vt, 0.184 - w), 0.008);                                                        // open neck
  add(d, sh * K, 100.0);
  // collar and lapels
  vec2 cu = vec2(abs(u), v);
  float leaf2 = pjLeaf2(cu);
  float lw = 0.006 * lumps + 0.007 * sat(-leaf2 / 0.04) + 0.010 * (1.0 - smoothstep(0.0, 0.035, sdSeg2(cu, PJ_P1, PJ_P3)));   // fuller along the roll line
  float leaf = extrudeR(leaf2, w - 0.209 - lw, 0.010, 0.008);
  leaf = smin(leaf, sdCapsule(q, vec3(-0.045, 1.044, 0.206), vec3(0.045, 1.044, 0.206), 0.024), 0.014);
  add(d, leaf * K, 101.0);
  float pipe = length(vec2(leaf2 - 0.0005, w - 0.214 - lw)) - 0.0046;
  pipe = smax(pipe, 0.022 - sdSeg2(cu, PJ_P1, PJ_P3), 0.005);
  pipe = min(pipe, sdCapsule(q, vec3(0.172, 0.607, 0.204), vec3(0.368, 0.607, 0.204), 0.0046));      // pocket top
  // sleeve brought round from the side, with its turned cuff
  vec2 sl = pjSleeveUV(q.xy);
  float cuffm = smoothstep(PJ_SL - 0.094, PJ_SL - 0.084, sl.x);
  float hw = mix(0.118, 0.090, sat(sl.x / PJ_SL)) + 0.006 * cuffm;
  float sl2 = sdBox2(sl - vec2(PJ_SL * 0.5 - 0.06, 0.0), vec2(PJ_SL * 0.5 + 0.06, hw) - 0.03) - 0.03;
  sl2 = max(sl2, s2 - 0.012);
  float slv = extrudeR(sl2, w - 0.214, 0.018 + 0.005 * cuffm, 0.016);
  slv -= (1.0 - cuffm) * (0.006 * sin(sl.x * 36.0 + sl.y * 22.0 + 2.0 * sin(sl.y * 19.0)) - 0.004 * pjCrease(q.xy, 5.0)) + 0.012 * (fbm3(vec3(q.xy * 4.0, 7.0)) - 0.5);
  slv = smax(slv, -sdEllipsoid(vec3(sl.x - PJ_SL, sl.y, w - 0.217), vec3(0.022, 0.066, 0.0065)), 0.004);
  add(d, slv * K, 105.0);
  float cp = length(vec2(sl.x - (PJ_SL - 0.089), w - 0.2345)) - 0.0048;
  pipe = min(pipe, smax(cp, abs(sl.y) - hw + 0.008, 0.004));
  add(d, pipe * K, 102.0);
  // buttons, sewn on with a cross of thread
  float vr = repLim(v - 0.61, 0.155, -3.0, 0.0);
  vec3 bq = vec3(u - 0.002, w - 0.2125, vr);
  float bt = sdRCyl(bq, 0.027, 0.006, 0.004);
  bt = smax(bt, -(length(bq - vec3(0.0, 0.037, 0.0)) - 0.034), 0.003);
  add(d, bt * K, 103.0);
  vec3 th = vec3(abs(bq.x), bq.y - 0.0045, abs(bq.z));
  add(d, sdCapsule(th, vec3(0.0), vec3(0.0072, 0.0, 0.0072), 0.0027) * K, 104.0);
  // drawstring bow on the waistband
  vec3 k = q - vec3(0.03, -0.060, 0.134);
  float cord = sdEllipsoid(k, vec3(0.012, 0.010, 0.009));
  vec3 lp = vec3(abs(k.x) - 0.038, k.y - 0.006, k.z - 0.002); lp.xy = rot(0.35) * lp.xy;
  cord = min(cord, length(vec2((length(lp.xy / vec2(1.0, 0.55)) - 0.034) * 0.55, lp.z)) - 0.0052);
  cord = min(cord, min(sdCapsule(k, vec3(-0.006, -0.004, 0.0), vec3(-0.030, -0.040, -0.004), 0.0052), sdCapsule(k, vec3(-0.030, -0.040, -0.004), vec3(-0.042, -0.060, -0.045), 0.0052)));
  cord = min(cord, min(sdCapsule(k, vec3(0.006, -0.004, 0.0), vec3(0.040, -0.036, -0.003), 0.0052), sdCapsule(k, vec3(0.040, -0.036, -0.003), vec3(0.046, -0.056, -0.030), 0.0052)));
  add(d, cord * K, 107.0);
}
void pjCloth(inout Mat m, inout vec3 n, vec3 pw, vec2 uv, float shade) {
  vec3 c = pjPrint(uv, HUE) * shade;
  c *= 0.86 + 0.28 * fbm3(pw * 55.0);                                                               // brushed nap, never quite even
  matCloth(m, n, pw, uv, c, 0.8);
  n = normalize(n + 0.22 * (hash3(floor(pw * 380.0)) - 0.5));
  m.sheen = 0.35; m.sheenCol = mix(c, vec3(1.0), 0.3);
}
bool shGift(float id, vec3 pw, inout vec3 n, inout Mat m) {
  if (id < 100.0 || id >= 110.0) return false;
  vec3 q = pjLocal(pw); float u = q.x, v = q.y, w = q.z;
  vec3 cream = srgb(0.93, 0.90, 0.80);
  if (id < 100.5) {
    float sh = 1.0;
    float vt = pjTri(q.xy, vec2(-0.04, 1.07), vec2(0.04, 1.07), vec2(0.0, 0.70));
    vec2 uv = q.xy;
    float po2 = sdBox2(q.xy - vec2(0.27, 0.50), vec2(0.105, 0.11) - 0.02) - 0.02;
    if (po2 < 0.0) uv += vec2(0.047, 0.031);                                                       // the pocket is a separate piece, its print does not line up
    if (abs(u - 0.002) < 0.036 && v < 0.705) uv += vec2(0.0, 0.021);
    if (vt < 0.0 && w < 0.196) { uv = vec2(-u, v) + 0.07; sh = 0.8; }                                 // inside of the back, seen through the open neck
    pjCloth(m, n, pw, uv, sh);
    if (vt < 0.0 && w < 0.196 && sdBox2(q.xy - vec2(0.0, 0.985), vec2(0.026, 0.016)) < 0.0) { matCloth(m, n, pw, q.xy * 1.5, srgb(0.92, 0.92, 0.88), 0.1); return true; }   // neck label
    // top-stitching: each side of the button band, round the pocket
    float dash = step(fract(v * 120.0), 0.6), dashu = step(fract(u * 120.0), 0.6);
    float st = (1.0 - smoothstep(0.001, 0.002, abs(abs(u - 0.002) - 0.028))) * dash * step(v, 0.70);
    st = max(st, (1.0 - smoothstep(0.001, 0.002, abs(po2 + 0.008))) * (abs(u - 0.27) > 0.09 ? dash : dashu) * step(v, 0.60));
    m.col = mix(m.col, HUE * 0.55, st * 0.8);
    return true;
  }
  if (id < 101.5) { vec2 uv = rot(u > 0.0 ? 0.75 : -0.75) * q.xy + vec2(0.05, u > 0.0 ? 0.03 : 0.11); pjCloth(m, n, pw, uv, 1.0);
    float e = pjLeaf2(vec2(abs(u), v)); m.col = mix(m.col, HUE * 0.55, (1.0 - smoothstep(0.001, 0.002, abs(e + 0.016))) * step(fract((u + v) * 120.0), 0.6) * 0.8);
    return true; }
  if (id < 102.5) { matCloth(m, n, pw, q.xy * 2.0, cream, 0.3); m.sheen = 0.5; return true; }
  if (id < 103.5) {
    float vr = repLim(v - 0.61, 0.155, -3.0, 0.0); vec2 b = vec2(u - 0.002, vr);
    float holes = length(abs(b) - 0.0072) - 0.0042;
    matPlastic(m, n, pw, cream * (0.92 + 0.1 * noise(q * 60.0)) * (0.35 + 0.65 * smoothstep(0.0, 0.002, holes)), 0.75);
    m.coat = 0.5; return true;
  }
  if (id < 104.5) { matFelt(m, n, pw, HUE * 0.6 + 0.02); return true; }
  if (id < 105.5) {
    vec2 sl = pjSleeveUV(q.xy);
    bool cuff = sl.x > PJ_SL - 0.089;
    pjCloth(m, n, pw, cuff ? vec2(-sl.y, sl.x) + 0.04 : sl + vec2(0.03, 0.05), 1.0);
    float st = (1.0 - smoothstep(0.001, 0.002, abs(sl.x - (PJ_SL - 0.012)))) * step(fract(sl.y * 120.0), 0.6);
    m.col = mix(m.col, HUE * 0.55, st * 0.8);
    return true;
  }
  if (id < 106.5) {
    vec3 tq = q - vec3(0.012, 0.44, 0.0625); tq.xy = rot(0.03) * tq.xy;
    pjCloth(m, n, pw, vec2(tq.y, -tq.x) + vec2(0.02, 0.06), 1.0);
    // waistband: two rows of stitching hold the elastic
    float st = (1.0 - smoothstep(0.001, 0.0022, min(abs(v + 0.022), abs(v + 0.100)))) * step(0.09, w) * step(fract(u * 120.0), 0.6);
    m.col = mix(m.col, HUE * 0.55, st * 0.8);
    return true;
  }
  // cotton cord
  float tw = sin((u + v * 0.7 + w) * 900.0);
  matCloth(m, n, pw, q.xy * 2.0, cream * (0.85 + 0.15 * tw), 0.4);
  return true;
}
