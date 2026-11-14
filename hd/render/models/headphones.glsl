// Over-ear headphones standing on their cups: cream shells with a chrome ring, tan leatherette cushions and headband pad
// with stitched seams, steel yokes and sliders, a braided cable curling away to its jack. Material ids 100..109.
const float HP_TURN = 0.56;
const float HP_CX = 0.40, HP_CY = 0.247;                 // ear-cup centres (mirrored in x), in headphone space
const vec2 HP_ARC = vec2(0.69, 0.46);                    // headband: height of the arc's centre, its radius
vec3 hpLocal(vec3 p) { p.x -= 0.03; p.xz = rot(HP_TURN) * p.xz; return p; }
// cup space: x out along the ear axis from the middle of the housing, y and z across the round face. Each cup swivels a little differently.
vec3 hpCupSpace(vec3 l) {
  vec2 a = rot(l.x > 0.0 ? 0.07 : -0.15) * vec2(abs(l.x) - HP_CX, l.y - HP_CY);
  return vec3(a, l.z);
}
float hpCable(vec3 p, out float along) {
  // on the belt, in the world: two curves, then the plug
  vec2 A = vec2(-0.425, -0.13), B = vec2(-0.66, 0.37), C = vec2(-0.20, 0.385), D = vec2(-0.09, 0.389), E = vec2(0.02, 0.405);
  float d1 = sdBezier(p.xz, A, B, C), d2 = sdBezier(p.xz, C, D, E);
  float dA = length(p.xz - A);
  float h = 0.0105 + 0.075 * (1.0 - smoothstep(0.0, 0.16, dA)) + 0.004 * sin(p.x * 19.0) * smoothstep(0.1, 0.3, dA);      // rises to the cup it comes out of
  along = p.x * 60.0 + p.z * 60.0;
  return length(vec2(min(d1, d2), p.y - h)) - 0.0095;
}
void mGift(vec3 p, inout float d) {
  float bb = length(p - vec3(0.0, 0.58, 0.05)) - 0.86;
  if (bb > 0.15) { d = min(d, bb); return; }
  vec3 l = hpLocal(p);
  vec3 q = hpCupSpace(l);
  float r = length(q.yz);
  // ---- ear cup ----
  float house = sdRCyl(vec3(q.y, q.x - 0.025, q.z), 0.236, 0.036, 0.014);
  float cap = smax(sdEllipsoid(q - vec3(0.050, 0.0, 0.0), vec3(0.072, 0.214, 0.214)), 0.052 - q.x, 0.008);
  cap = max(cap, -(length(vec2(r - 0.150, q.x - 0.098)) - 0.004));                     // a turned groove in the dome
  add(d, min(house, cap), 100.0);
  add(d, length(vec2(r - 0.224, q.x - 0.060)) - 0.0125, 103.0);                         // chrome trim ring
  add(d, sdRCyl(vec3(q.y, q.x - 0.118, q.z), 0.082, 0.006, 0.003), 107.0);              // badge
  // cushion: a fat oval ring of leatherette, seamed round the outside, puckered where it tucks in
  vec2 t = vec2(r - 0.166, q.x + 0.062);
  float ang = atan(q.z, q.y);
  float cush = (length(t / vec2(0.074, 0.056)) - 1.0) * 0.056;
  cush += 0.0035 * exp(-pow((t.y - 0.012) / 0.007, 2.0)) * step(0.0, t.x);             // seam
  cush += 0.0018 * sin(ang * 46.0) * smoothstep(0.02, -0.05, t.x) + 0.0015 * sin(ang * 7.0 + 1.0);
  add(d, cush * 0.8, 101.0);
  add(d, sdRCyl(vec3(q.y, q.x + 0.030, q.z), 0.105, 0.010, 0.004), 104.0);              // cloth over the driver
  // ---- yoke: a steel fork over the top half of the cup, on a pivot each side ----
  vec3 y = vec3(abs(l.x) - HP_CX - 0.028, l.y - HP_CY, l.z);
  float fork = sdBox2(vec2(length(y.yz) - 0.266, y.x), vec2(0.0055, 0.021)) - 0.004;
  fork = smax(fork, -(y.y + 0.012), 0.01);
  float pivot = sdCapsule(vec3(y.x, y.y, abs(y.z)), vec3(0.0, 0.0, 0.232), vec3(0.0, 0.0, 0.276), 0.017);
  // slider: a flat steel strip from the top of the fork up into the end of the headband
  vec3 s = vec3(abs(l.x), l.y, l.z);
  vec2 sa = vec2(HP_CX + 0.028, HP_CY + 0.262), sb = vec2(HP_ARC.y, HP_ARC.x + 0.02);
  float strip = extrudeR(sdSeg2(s.xy, sa, sb) - 0.0045, s.z, 0.026, 0.004);
  float boss = sdRBox(s - vec3(sa.x, sa.y + 0.012, 0.0), vec3(0.016, 0.026, 0.036), 0.008);
  add(d, min(min(fork, pivot), min(strip, boss)), 103.0);
  // ---- headband ----
  float th = atan(l.x, l.y - HP_ARC.x);                                                 // 0 at the top
  float rr = (l.y > HP_ARC.x ? length(vec2(l.x, l.y - HP_ARC.x)) : abs(l.x)) - HP_ARC.y;
  float cut = HP_ARC.x - 0.075 - l.y;
  float band = smax(sdBox2(vec2(rr, l.z), vec2(0.009, 0.050)) - 0.006, cut, 0.01);
  add(d, band, 102.0);
  // moulded end sleeves the sliders run in
  add(d, sdRBox(s - vec3(HP_ARC.y - 0.001, HP_ARC.x - 0.015, 0.0), vec3(0.021, 0.072, 0.058), 0.014), 100.0);
  // padding underneath, quilted across
  float fade = smoothstep(0.80, 1.12, abs(th));
  float quilt = abs(fract(th * 3.3 + 0.5) - 0.5);
  float pad = sdBox2(vec2(rr + 0.030, l.z), vec2(0.004, 0.026)) - 0.021 + 0.03 * fade + 0.005 * (1.0 - smoothstep(0.0, 0.07, quilt));
  pad = max(pad, cut);
  add(d, pad * 0.85, 101.0);
  // ---- cable and plug ----
  if (p.y > 0.2) { d = min(d, p.y - 0.1); return; }
  float along; float cab = hpCable(p, along);
  add(d, cab * 0.85, 105.0);
  vec3 e0 = vec3(0.02, 0.0155, 0.405), dir = normalize(vec3(0.11, 0.0, 0.016));
  float grip = sdCone(p, e0 - dir * 0.01, e0 + dir * 0.075, 0.0115, 0.0150);
  grip += 0.0012 * sin(dot(p - e0, dir) * 420.0) * step(0.03, dot(p - e0, dir));
  add(d, grip, 108.0);
  add(d, min(sdCapsule(p, e0 + dir * 0.075, e0 + dir * 0.135, 0.0062), sdCyl(vec3(0.0) + vec3(length(cross(p - e0, dir)), dot(p - e0, dir) - 0.090, 0.0), 0.0095, 0.004)), 106.0);
}
bool shGift(float id, vec3 p, inout vec3 n, inout Mat m) {
  if (id < 100.0 || id >= 110.0) return false;
  vec3 l = hpLocal(p);
  vec3 q = hpCupSpace(l);
  float r = length(q.yz), ang = atan(q.z, q.y);
  if (id < 100.5) {
    // shells: warm ivory plastic, a mould line, a darker gasket where shell meets housing
    matPlastic(m, n, p, srgb(0.72, 0.66, 0.53), 0.75);
    float gasket = (1.0 - smoothstep(0.003, 0.006, abs(q.x - 0.052))) * step(0.15, r) * step(l.y, HP_ARC.x - 0.2);
    m.col = mix(m.col, srgb(0.10, 0.09, 0.08), 0.8 * gasket);
    // three cross-head screws round the dome
    if (q.x > 0.06 && l.y < HP_ARC.x - 0.2) {
      float sa = floor(ang / 2.0944 + 0.5) * 2.0944 + 0.5; vec2 sp = vec2(r * cos(ang - sa) - 0.186, r * sin(ang - sa));
      float scr = length(sp);
      if (scr < 0.014) { m.col = srgb(0.45, 0.45, 0.47); m.metal = 1.0; m.rough = 0.3; m.coat = 0.0; if (min(abs(sp.x), abs(sp.y)) < 0.0022 && scr < 0.010) m.col = srgb(0.05, 0.05, 0.05); }
      else if (scr < 0.018) m.col *= 0.35;
    }
    return true;
  }
  if (id < 101.5) {
    // leatherette, tan: fine grain, stitches along the seams
    vec3 tan = srgb(0.50, 0.25, 0.10);
    vec3 n2 = n; matLeather(m, n2, p * 3.2, tan, 0.45); n = normalize(mix(n, n2, 0.35));
    m.col = mix(m.col, tan * (0.85 + 0.25 * fbm3(p * 4.0)), 0.45);
    bool pad = l.y > HP_ARC.x - 0.09 && abs(abs(l.x) - 0.0) < 0.44 && length(vec2(l.x, l.y - HP_ARC.x)) < HP_ARC.y + 0.01;
    float st = 0.0;
    if (pad) {
      float th = atan(l.x, l.y - HP_ARC.x);
      st = (1.0 - smoothstep(0.003, 0.0055, abs(abs(l.z) - 0.034))) * step(0.42, fract(th * 34.0));
      float q2 = abs(fract(th * 3.3 + 0.5) - 0.5);
      st = max(st, (1.0 - smoothstep(0.004, 0.008, abs(q2 - 0.035) / 3.3 * 1.0)) * step(0.45, fract(l.z * 60.0)) * step(abs(l.z), 0.034));
    } else {
      vec2 t = vec2(r - 0.166, q.x + 0.062);
      st = (1.0 - smoothstep(0.003, 0.0055, abs(t.y - 0.012 - 0.013))) * step(0.0, t.x) * step(0.45, fract(ang * 26.0));
      m.col *= 0.80 + 0.2 * smoothstep(-0.07, 0.03, t.x);                                   // darker down in the fold
    }
    m.col = mix(m.col, srgb(0.80, 0.66, 0.42), st); m.rough = mix(m.rough, 0.8, st);
    return true;
  }
  if (id < 102.5) {
    // outside of the headband: the same leatherette, wrapped over a spring-steel strip
    vec3 tan = srgb(0.44, 0.21, 0.085);
    vec3 n2 = n; matLeather(m, n2, p * 3.2, tan, 0.5); n = normalize(mix(n, n2, 0.35));
    m.col = mix(m.col, tan * (0.85 + 0.25 * fbm3(p * 4.0)), 0.45);
    float th = atan(l.x, l.y - HP_ARC.x);
    float st = (1.0 - smoothstep(0.003, 0.0055, abs(abs(l.z) - 0.040))) * step(0.42, fract(th * 34.0)) * step(HP_ARC.x, l.y + 0.2);
    m.col = mix(m.col, srgb(0.80, 0.66, 0.42), st);
    // rubbed paler along the edges
    m.col = mix(m.col, m.col * 1.5 + 0.02, 0.5 * smoothstep(0.046, 0.056, abs(l.z)) * noise(p * 50.0));
    return true;
  }
  if (id < 103.5) {
    bool ring = length(vec2(r - 0.224, q.x - 0.060)) < 0.02;
    if (ring) { matMetal(m, n, p, 3, vec3(0, 0, 1)); return true; }
    matMetal(m, n, p, 0, vec3(0, 1, 0));
    // click-stop marks on the sliders
    vec3 s = vec3(abs(l.x), l.y, l.z);
    float tick = (1.0 - smoothstep(0.15, 0.3, abs(fract(l.y * 55.0) - 0.5))) * step(abs(l.z), 0.014) * step(HP_CY + 0.30, l.y) * step(l.y, HP_ARC.x - 0.05);
    m.col = mix(m.col, srgb(0.10, 0.10, 0.11), 0.8 * tick); m.rough += 0.2 * tick;
    return true;
  }
  if (id < 104.5) {
    matCloth(m, n, p, vec2(q.y, q.z) * 0.7, srgb(0.13, 0.11, 0.10), 0.3);
    return true;
  }
  if (id < 105.5) {
    // braided cloth cable, coral red with a paler fleck
    float along; hpCable(p, along);
    float a1 = fract(along * 1.7 + p.y * 150.0), a2 = fract(along * 1.7 - p.y * 150.0);
    float weave = smoothstep(0.3, 0.5, abs(a1 - 0.5)) * smoothstep(0.3, 0.5, abs(a2 - 0.5));
    m.col = mix(srgb(0.60, 0.11, 0.07), srgb(0.80, 0.50, 0.36), weave) * (0.8 + 0.3 * noise(p * 300.0));
    m.rough = 0.85; m.sheen = 0.5; m.sheenCol = srgb(1.0, 0.6, 0.5);
    n = normalize(n + 0.25 * (hash3(floor(p * 500.0)) - 0.5));
    return true;
  }
  if (id < 106.5) { matMetal(m, n, p, 1, vec3(1, 0, 0)); return true; }
  if (id < 107.5) {
    // badge: spun aluminium, with a ring pressed into it
    matMetal(m, n, p, 0, normalize(vec3(-q.z, q.y, 0.0) + 1e-4));
    float spun = noise(r * 900.0);
    m.col = srgb(0.70, 0.70, 0.72) * (0.85 + 0.25 * spun); m.rough = 0.26 + 0.12 * spun;
    float ringm = 1.0 - smoothstep(0.002, 0.004, abs(r - 0.058));
    m.col = mix(m.col, srgb(0.12, 0.11, 0.10), ringm);
    return true;
  }
  matRubber(m, n, p, srgb(0.10, 0.10, 0.11));
  return true;
}
