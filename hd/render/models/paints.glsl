// Watercolour tin, open and propped toward the camera: 24 pans in three rows, the lid behind as a mixing palette,
// one brush leaning into the pans and one lying on the belt in front. Material ids 100..109.
const float PAINTS_W = 0.60, PAINTS_D = 0.48, PAINTS_T = 0.050, PAINTS_T2 = 0.040, PAINTS_PITCH = 0.144;
const float PAINTS_CA = 0.6157, PAINTS_SA = 0.7880;      // base tilt: 52 degrees
const float PAINTS_CB = 0.2079, PAINTS_SB = 0.9781;      // lid: 78 degrees
const vec3 PAINTS_F = vec3(0.0, 0.034, 0.215);           // middle of the base's front rim
const vec3 PAINTS_A0 = vec3(-0.40, 0.009, 0.365), PAINTS_A1 = vec3(0.292, 0.274, 0.031);     // brush leaning into the tin: handle end, hair tip
const vec3 PAINTS_B0 = vec3(0.52, 0.0150, 0.375), PAINTS_B1 = vec3(-0.275, 0.0165, 0.462);    // brush lying on the belt
// tin space: x across, y from the front rim towards the hinge, z out of the open tray
vec3 paintsBase(vec3 p) { vec3 r = p - PAINTS_F; return vec3(r.x, r.y * PAINTS_SA - r.z * PAINTS_CA, r.y * PAINTS_CA + r.z * PAINTS_SA); }
vec3 paintsLid(vec3 p) {
  vec3 r = p - PAINTS_F - PAINTS_D * vec3(0.0, PAINTS_SA, -PAINTS_CA);
  return vec3(r.x, r.y * PAINTS_SB - r.z * PAINTS_CB, r.y * PAINTS_CB + r.z * PAINTS_SB);
}
float paintsRect(vec3 q) { return sdBox2(q.xy - vec2(0.0, PAINTS_D * 0.5), vec2(PAINTS_W, PAINTS_D * 0.5) - 0.035) - 0.035; }
// pressed mixing wells in the lid: height of the floor above the flat, 0..1
float paintsWells(vec3 q) {
  float pw = 0.2875, cu = repLim(q.x - 0.5 * pw, pw, -2.0, 1.0);
  float r = sdBox2(vec2(cu, q.y - PAINTS_D * 0.5), vec2(0.128, 0.208) - 0.035) - 0.035;
  return smoothstep(-0.034, 0.004, r);
}
// an open tray: rect = its outline seen from above (negative inside), z = height with the rim at 0, floor = height of the inside floor
float paintsTray(float rect, float z, float depth, float floorZ) {
  float outer = extrudeR(rect, z + depth * 0.5, depth * 0.5, 0.012);
  float cav = smax(rect + 0.008, floorZ - z, 0.012);
  float tray = smax(outer, -cav, 0.004);
  return min(tray, length(vec2(rect + 0.004, z + 0.001)) - 0.0058);          // the rolled rim
}
vec2 paintsCell(vec3 q, out vec2 ij) {
  float s = PAINTS_PITCH;
  float i = clamp(floor(q.x / s), -4.0, 3.0), j = clamp(floor((q.y - 0.024) / s), 0.0, 2.0);
  ij = vec2(i + 4.0, j);
  return vec2(q.x - (i + 0.5) * s, q.y - 0.024 - (j + 0.5) * s);
}
// how far each cake has been worn down, 0 new .. 1 through to the plastic
float paintsUse(vec2 ij) { float h = hash1(ij * 7.31 + 2.7); return smoothstep(0.25, 1.0, h); }
void paintsBrush(vec3 p, vec3 a, vec3 b, float idH, inout float d) {
  float bound = sdCapsule(p, a, b, 0.019);
  if (bound > 0.03) { add(d, bound, idH); return; }
  vec3 dir = normalize(b - a); float len = length(b - a), tf = len - 0.205;
  float handle = sdCone(p, a + dir * 0.007, a + dir * tf, 0.0062, 0.0142);
  handle = min(handle, sdCone(p, a + dir * (tf - 0.15), a + dir * (tf - 0.05), 0.0150, 0.0160));          // the belly you hold
  handle = smin(handle, sdCone(p, a + dir * (tf - 0.05), a + dir * tf, 0.0160, 0.0128), 0.004);
  float t = dot(p - a, dir);
  float ferr = sdCone(p, a + dir * (tf - 0.004), a + dir * (tf + 0.105), 0.0140, 0.0118) + 0.0007 * smoothstep(0.6, 1.0, sin((t - tf) * 520.0)) * step(t, tf + 0.035);   // crimp rings
  vec3 h0 = a + dir * (tf + 0.10);
  float hair = smin(sdCone(p, h0, h0 + dir * 0.034, 0.0112, 0.0138), sdCone(p, h0 + dir * 0.034, b, 0.0138, 0.0012), 0.006);
  add(d, handle, idH); add(d, ferr, 106.0); add(d, hair * 0.9, 107.0);
}
void mGift(vec3 p, inout float d) {
  float bb = length(p - vec3(0.0, 0.42, 0.10)) - 0.84;
  if (bb > 0.15) { d = min(d, bb); return; }
  // base tray and its pans
  vec3 q = paintsBase(p);
  float rect = paintsRect(q);
  float base = paintsTray(rect, q.z, PAINTS_T, -PAINTS_T + 0.006);
  add(d, base, 100.0);
  if (max(rect, max(q.z - 0.02, -q.z - PAINTS_T)) < 0.03) {
    vec2 ij; vec2 c = paintsCell(q, ij);
    vec3 pc = vec3(c, q.z + 0.027);
    float cup = sdRBox(pc, vec3(0.066, 0.066, 0.0175), 0.009);
    float inner = sdRBox(pc - vec3(0.0, 0.0, 0.012), vec3(0.059, 0.059, 0.022), 0.008);
    add(d, smax(cup, -inner, 0.003), 102.0);
    // the cake of paint: dished where the brush has been, lumpy where it dried
    float use = paintsUse(ij);
    float r2 = dot(c - 0.012 * (hash2(ij) - 0.5), c - 0.012 * (hash2(ij) - 0.5));
    float top = 0.0125 - 0.019 * use * exp(-r2 / 0.0011) + 0.0010 * sin(c.x * 47.0 + ij.x * 2.0) * sin(c.y * 39.0 + ij.y);
    float cake = max(inner + 0.0005, pc.z - top);
    add(d, cake * 0.8, 103.0);
  }
  // lid: the same pressing with mixing wells, standing behind on its hinge
  vec3 l = paintsLid(p);
  float rectL = paintsRect(l);
  float lid = paintsTray(rectL, l.z, PAINTS_T2, -PAINTS_T2 + 0.006 + 0.013 * paintsWells(l));
  add(d, lid * 0.85, 101.0);
  // hinge: a rolled pin along the back edge, in knuckles
  float kn = abs(fract(p.x * 9.0) - 0.5);
  add(d, max(length(vec2(q.y - PAINTS_D - 0.004, q.z + 0.012)) - 0.0105 + 0.0012 * smoothstep(0.44, 0.5, kn), abs(p.x) - 0.50), 108.0);
  // brushes
  paintsBrush(p, PAINTS_A0, PAINTS_A1, 104.0, d);
  paintsBrush(p, PAINTS_B0, PAINTS_B1, 105.0, d);
}
const vec3 PAINTS_PAL[24] = vec3[24](
  vec3(0.80, 0.60, 0.22), vec3(0.72, 0.42, 0.16), vec3(0.58, 0.24, 0.12), vec3(0.36, 0.20, 0.12), vec3(0.24, 0.17, 0.13), vec3(0.24, 0.29, 0.36), vec3(0.07, 0.07, 0.08), vec3(0.95, 0.94, 0.90),
  vec3(0.12, 0.16, 0.62), vec3(0.10, 0.32, 0.78), vec3(0.12, 0.55, 0.85), vec3(0.05, 0.62, 0.66), vec3(0.03, 0.46, 0.36), vec3(0.10, 0.58, 0.22), vec3(0.34, 0.60, 0.12), vec3(0.62, 0.72, 0.12),
  vec3(0.98, 0.90, 0.20), vec3(0.98, 0.72, 0.08), vec3(0.96, 0.46, 0.06), vec3(0.92, 0.25, 0.08), vec3(0.80, 0.08, 0.08), vec3(0.66, 0.05, 0.18), vec3(0.84, 0.16, 0.50), vec3(0.42, 0.14, 0.58));
vec3 paintsCol(vec2 ij) { return srgb(PAINTS_PAL[int(clamp(ij.x + 8.0 * ij.y + 0.5, 0.0, 23.0))]); }
void paintsEnamel(inout Mat m, inout vec3 n, vec3 p, float inside, float rim) {
  vec3 white = srgb(0.62, 0.61, 0.57), dark = srgb(0.07, 0.13, 0.30);
  vec3 n2 = n;
  matPaint(m, n2, p, mix(dark, white, inside), 0.85, mix(0.10, 0.08, inside) + 0.25 * rim, srgb(0.42, 0.42, 0.44), 1.0);
  n = normalize(mix(n, n2, 0.12));          // enamel is glass-smooth: only a breath of orange peel
  m.rough = mix(0.22, 0.30, smudge(p)); m.coatRough = 0.08 + 0.06 * smudge(p * 2.0);
  if (inside < 0.5) {
    // outside: deep blue stove enamel, with just a few chips
    float chip = smoothstep(0.80, 0.83, fbm3(p * 9.0) * 0.6 + 0.4 * noise(p * 40.0));
    m.col = mix(dark * (0.85 + 0.3 * fbm3(p * 3.0)), srgb(0.40, 0.40, 0.42), chip); m.metal = chip; m.coat = 0.6 * (1.0 - chip); m.rough = mix(0.26, 0.5, chip);
  }
  // the rolled rim is rubbed through to the steel
  float bare = rim * smoothstep(0.52, 0.72, noise(p * 37.0) * 0.6 + 0.4 * noise(p * 150.0));
  m.col = mix(m.col, srgb(0.56, 0.56, 0.58), bare); m.metal = max(m.metal, bare); m.rough = mix(m.rough, 0.3, bare); m.coat *= 1.0 - bare;
}
// one dried wash in a mixing well: returns coverage, and how close to its edge (pigment gathers there as it dries)
float paintsWash(vec2 u, vec2 c, float size, float seed, out float edge) {
  vec2 v = (u - c) / size; float f = 1.0 - length(v) + 0.75 * (fbm(v * 2.2 + seed) - 0.5);
  edge = smoothstep(0.07, 0.0, abs(f - 0.04));
  return min(1.0, smoothstep(0.0, 0.05, f) * (0.95 + 0.5 * fbm(v * 5.0 + seed * 1.7)) * (0.8 + 0.2 * noise(v * 60.0)) * 1.25);
}
bool shGift(float id, vec3 p, inout vec3 n, inout Mat m) {
  if (id < 100.0 || id >= 110.0) return false;
  if (id < 100.5) {
    vec3 q = paintsBase(p); float rect = paintsRect(q);
    float inside = smoothstep(-0.004, -0.007, rect) * smoothstep(-PAINTS_T + 0.002, -PAINTS_T + 0.005, q.z);
    float rim = smoothstep(-0.012, -0.004, q.z) * (1.0 - smoothstep(-0.011, -0.008, rect) * 0.0);
    paintsEnamel(m, n, p, inside * (1.0 - smoothstep(-0.006, -0.001, q.z)), rim);
    // colour that has run off the pans onto the enamel
    vec2 ij; vec2 c = paintsCell(q, ij);
    float run = inside * smoothstep(0.55, 0.8, fbm3(q * 22.0 + 3.0));
    m.col = mix(m.col, paintsCol(ij) * 0.3, 0.5 * run);
    return true;
  }
  if (id < 101.5) {
    vec3 l = paintsLid(p); float rect = paintsRect(l);
    float inside = smoothstep(-0.004, -0.007, rect) * smoothstep(-PAINTS_T2 + 0.002, -PAINTS_T2 + 0.005, l.z);
    float rim = smoothstep(-0.012, -0.004, l.z);
    inside *= 1.0 - smoothstep(-0.006, -0.001, l.z);
    paintsEnamel(m, n, p, inside, rim);
    if (inside > 0.0) {
      // dried washes left in the wells
      vec2 u = l.xy; float e, a; vec3 col = m.col; float cov = 0.0;
      a = paintsWash(u, vec2(-0.44, 0.20), 0.105, 1.0, e);  col = mix(col, srgb(0.10, 0.30, 0.74) * (1.0 - 0.45 * e), a * (0.55 + 0.4 * e)); cov = max(cov, a);
      a = paintsWash(u, vec2(-0.40, 0.33), 0.060, 7.0, e);  col = mix(col, srgb(0.05, 0.55, 0.50) * (1.0 - 0.45 * e), a * (0.45 + 0.5 * e)); cov = max(cov, a);
      a = paintsWash(u, vec2(-0.15, 0.25), 0.115, 3.0, e);  col = mix(col, srgb(0.90, 0.22, 0.10) * (1.0 - 0.45 * e), a * (0.60 + 0.4 * e)); cov = max(cov, a);
      a = paintsWash(u, vec2(-0.12, 0.12), 0.055, 9.0, e);  col = mix(col, srgb(0.96, 0.62, 0.08) * (1.0 - 0.40 * e), a * (0.60 + 0.4 * e)); cov = max(cov, a);
      a = paintsWash(u, vec2(0.14, 0.22), 0.110, 5.0, e);   col = mix(col, srgb(0.30, 0.56, 0.12) * (1.0 - 0.45 * e), a * (0.50 + 0.5 * e)); cov = max(cov, a);
      a = paintsWash(u, vec2(0.17, 0.35), 0.050, 12.0, e);  col = mix(col, srgb(0.96, 0.86, 0.20) * (1.0 - 0.35 * e), a * (0.60 + 0.4 * e)); cov = max(cov, a);
      a = paintsWash(u, vec2(0.44, 0.17), 0.075, 15.0, e);  col = mix(col, srgb(0.44, 0.16, 0.56) * (1.0 - 0.45 * e), a * (0.45 + 0.5 * e)); cov = max(cov, a);
      float wet = smoothstep(0.3, 0.8, paintsWells(l));
      m.col = mix(m.col, col, inside * (1.0 - wet)); m.rough = mix(m.rough, 0.55, 0.7 * cov * inside); m.coat *= 1.0 - 0.6 * cov;
    }
    return true;
  }
  if (id < 102.5) {
    vec3 q = paintsBase(p); vec2 ij; vec2 c = paintsCell(q, ij);
    matPlastic(m, n, p, srgb(0.58, 0.575, 0.55), 0.3);
    float st = smoothstep(0.35, 0.75, fbm3(q * 60.0 + ij.x)) * smoothstep(-0.022, -0.010, q.z);
    m.col = mix(m.col, paintsCol(ij) * 0.3, 0.75 * st); m.rough += 0.2 * st;
    return true;
  }
  if (id < 103.5) {
    vec3 q = paintsBase(p); vec2 ij; vec2 c = paintsCell(q, ij);
    vec3 col = paintsCol(ij); float use = paintsUse(ij);
    vec2 cc = c - 0.012 * (hash2(ij) - 0.5); float r = length(cc);
    float dish = use * exp(-r * r / 0.0011);
    // dry cake: deep and slightly glossy; where the brush has worked it, paler, matt, swirled
    float swirl = noise(vec3(atan(cc.y, cc.x) * 3.0 + r * 160.0, r * 90.0, ij.x * 3.0 + ij.y));
    float crack = smoothstep(0.06, 0.0, abs(voronoi(q.xy * 55.0 + ij * 3.0).x - 0.5) - 0.0) * (1.0 - use) * 0.0;
    m.col = (pow(col, vec3(1.25)) * 0.97 + 0.003) * mix(0.19, 0.30, sat(dish * 1.3 + 0.25 * use)) * (0.85 + 0.3 * swirl * sat(dish * 2.0 + 0.2));
    m.col = mix(m.col, col * 0.35, crack);
    float through = smoothstep(0.86, 0.97, dish + 0.08 * (swirl - 0.5));           // worn right through to the white plastic
    m.col = mix(m.col, mix(srgb(0.62, 0.61, 0.58), col * 0.4, 0.25 + 0.3 * swirl), through);
    m.rough = mix(0.78, 0.92, sat(dish * 1.6 + 0.3 * swirl * use)) + 0.06 * noise(q * 90.0);
    bumpN(n, q, 60.0, 0.12);
    return true;
  }
  if (id < 105.5) {
    bool A = id < 104.5;
    vec3 a = A ? PAINTS_A0 : PAINTS_B0, b = A ? PAINTS_A1 : PAINTS_B1;
    vec3 dir = normalize(b - a); float t = dot(p - a, dir), tf = length(b - a) - 0.205;
    vec3 lac = A ? srgb(0.72, 0.07, 0.05) : srgb(0.95, 0.70, 0.10);
    vec3 n2 = n;
    matPaint(m, n2, p, lac, 1.0, 0.10, srgb(0.70, 0.52, 0.30), 0.0);
    n = normalize(mix(n, n2, 0.15));
    m.coat = 1.0; m.coatRough = 0.06 + 0.06 * smudge(p * 3.0);
    // dipped end, and a gold size stamp near the ferrule
    float dip = 1.0 - smoothstep(0.085, 0.088, t + 0.003 * sin(atan(p.y - a.y, p.z - a.z) * 3.0));
    m.col = mix(m.col, A ? srgb(0.05, 0.05, 0.06) : srgb(0.06, 0.20, 0.42), dip);
    float band = (1.0 - smoothstep(0.0015, 0.0025, abs(abs(t - (tf - 0.215)) - 0.012))) + (1.0 - smoothstep(0.004, 0.0055, abs(t - (tf - 0.215)))) * step(0.5, noise(vec2(t * 900.0, 3.0)));
    m.col = mix(m.col, srgb(0.95, 0.76, 0.32), sat(band)); m.metal = 0.6 * sat(band);
    return true;
  }
  if (id < 106.5) {
    bool A = distance(p, PAINTS_A1) < distance(p, PAINTS_B1) && sdCapsule(p, PAINTS_A0, PAINTS_A1, 0.03) < sdCapsule(p, PAINTS_B0, PAINTS_B1, 0.03);
    vec3 dir = normalize(A ? PAINTS_A1 - PAINTS_A0 : PAINTS_B1 - PAINTS_B0);
    matMetal(m, n, p, A ? 3 : 1, dir);
    m.rough += 0.08;
    return true;
  }
  if (id < 107.5) {
    bool A = sdCapsule(p, PAINTS_A0, PAINTS_A1, 0.03) < sdCapsule(p, PAINTS_B0, PAINTS_B1, 0.03);
    vec3 a = A ? PAINTS_A0 : PAINTS_B0, b = A ? PAINTS_A1 : PAINTS_B1;
    vec3 dir = normalize(b - a); float t = length(b - a) - dot(p - a, dir);   // distance back from the tip
    vec3 perp = p - a - dir * dot(p - a, dir);
    vec3 u = normalize(cross(dir, vec3(0.3, 0.9, 0.2))), v = cross(dir, u);
    float ang = atan(dot(perp, u), dot(perp, v));
    float strand = noise(vec2(ang * 14.0, t * 30.0)), fine = noise(vec2(ang * 45.0, t * 12.0));
    vec3 sable = mix(srgb(0.30, 0.13, 0.05), srgb(0.72, 0.42, 0.18), smoothstep(0.0, 0.09, t) * 0.6 + 0.4 * strand);
    m.col = sable * (0.7 + 0.5 * fine);
    if (A) m.col = mix(m.col, srgb(0.06, 0.22, 0.62), (1.0 - smoothstep(0.035, 0.07, t + 0.02 * strand)) * 0.9);        // loaded with blue
    m.rough = A ? 0.35 : 0.5; m.sheen = 0.5; m.sheenCol = srgb(1.0, 0.8, 0.55); m.coat = A ? 0.5 * (1.0 - smoothstep(0.035, 0.07, t)) : 0.0;
    n = normalize(n + 0.35 * (strand - 0.5) * normalize(cross(dir, n) + 1e-4));
    return true;
  }
  matMetal(m, n, p, 0, vec3(1, 0, 0));
  return true;
}
