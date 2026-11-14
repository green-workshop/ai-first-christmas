// A wrapped Christmas present: glossy printed paper folded over a box, gold satin ribbon crossed over it, a full bow,
// and a manila tag on baker's twine. Material ids 100..103. HUE is the paper colour.
#ifndef HUE
#define HUE srgb(0.62, 0.05, 0.07)
#endif
const float giftYaw = 0.5;
const vec3 giftH = vec3(0.45, 0.37, 0.33);       // half size of the box
// world -> box space: origin at the middle of the box, x along its length
vec3 giftLocal(vec3 p) { p.xz = rot(giftYaw) * p.xz; return p - vec3(0.0, giftH.y, 0.0); }
// one loop of the bow: a band of ribbon running out along a from the knot and back, pinched where it is tied
float giftLoop(vec3 r, vec3 a, float L, float H, float W) {
  a = normalize(a);
  vec3 w = normalize(vec3(0.0, 0.9, 0.42) - a * dot(vec3(0.0, 0.9, 0.42), a)), c = cross(a, w);
  float s = dot(r, a), t = dot(r, c), v = dot(r, w);
  float open = smoothstep(0.0, 0.5 * L, s);
  vec2 e = vec2(s - 0.5 * L, t / (0.30 + 0.70 * open)), rr = vec2(0.5 * L, H);
  float k0 = length(e / rr), k1 = length(e / (rr * rr));
  float band = abs(k0 * (k0 - 1.0) / max(k1, 1e-6)) - 0.005 + 0.002 * sin(v * 170.0) * (1.0 - open);
  return smax(band, abs(v) - W * (0.5 + 0.5 * open), 0.004) * 0.45;
}
// a tail of the bow: a strip following a curve in the upright plane through the knot that points along dir
float giftTail(vec3 r, vec2 dir, vec2 B, vec2 C, float W, out float h, out float v) {
  h = dot(r.xz, dir); v = dot(r.xz, vec2(-dir.y, dir.x));
  float band = sdBezier(vec2(h, r.y), vec2(0.01, 0.0), B, C) - 0.0045;
  return smax(band, abs(v) - W, 0.004);
}
// the printed pattern: 1 on a gold star, 2 on a cream dot, 0 on plain paper
float giftPrint(vec2 uv) {
  vec2 q = uv / 0.092, f = fract(q) - 0.5;
  float star = pow(abs(f.x), 0.60) + pow(abs(f.y), 0.60);
  if (star < 0.405) return 1.0;
  if (length(abs(f) - 0.5) < 0.07) return 2.0;
  return 0.0;
}
void mGift(vec3 p, inout float d) {
  float bb = length(p - vec3(0.0, 0.50, 0.0)) - 0.80;
  if (bb > 0.15) { d = min(d, bb); return; }
  vec3 g = giftLocal(p);
  // the box under its paper; on the two ends the last flaps lie a paper's thickness proud
  float box = sdRBox(g, giftH, 0.008);
  float tt = (abs(g.y) - (giftH.y - giftH.z) - abs(g.z)) * 0.7071;
  box -= 0.006 * smoothstep(-0.003, 0.003, tt) * smoothstep(giftH.x - 0.03, giftH.x, abs(g.x));
  add(d, box, 100.0);
  // ribbon: one band round the length, one round the width
  float rib = sdRBox(g, vec3(0.042, giftH.y + 0.006, giftH.z + 0.006), 0.005);
  rib = min(rib, sdRBox(g, vec3(giftH.x + 0.006, giftH.y + 0.006, 0.042), 0.005));
  // the bow, tied where they cross
  vec3 r = g - vec3(0.0, giftH.y + 0.035, 0.0);
  float bw = length(r - vec3(0.0, 0.06, 0.03)) - 0.40;
  if (bw < 0.05) {
    float bow = sdRBox(r, vec3(0.036, 0.030, 0.036), 0.016) + 0.002 * sin(r.x * 150.0 + r.z * 90.0);       // knot
    bow = min(bow, giftLoop(r, vec3(0.90, 0.42, 0.12), 0.30, 0.085, 0.060));
    bow = min(bow, giftLoop(r, vec3(-0.88, 0.46, 0.10), 0.28, 0.080, 0.060));
    bow = min(bow, giftLoop(r, vec3(0.42, 0.84, -0.30), 0.22, 0.065, 0.052));
    bow = min(bow, giftLoop(r, vec3(-0.36, 0.88, 0.34), 0.21, 0.062, 0.052));
    float h, v;
    float t1 = giftTail(r, normalize(vec2(-0.50, 0.87)), vec2(0.20, 0.12), vec2(0.405, -0.135), 0.043, h, v);
    t1 = smax(t1, (-0.135 + 0.055 * (1.0 - abs(v) / 0.043) - r.y) * 0.7, 0.003);                           // swallowtail end
    float t2 = giftTail(r, normalize(vec2(0.86, 0.50)), vec2(0.16, 0.13), vec2(0.36, -0.022), 0.043, h, v);
    t2 = smax(t2, (h - 0.36 + 0.055 * (1.0 - abs(v) / 0.043)) * 0.7, 0.003);
    rib = min(rib, min(bow, min(t1, t2)));
  } else rib = min(rib, bw);
  add(d, rib, 101.0);
  // the tag, hanging against the front on its twine
  vec3 hole = vec3(-0.215, 0.17, giftH.z + 0.012);
  vec3 q = g - hole; q.xy = rot(-0.20) * q.xy; q.z += 0.07 * q.y;
  float tag = sdBox2(q.xy - vec2(0.0, -0.105), vec2(0.072, 0.128) - 0.01) - 0.01;
  tag = max(tag, (abs(q.x) + q.y - 0.060) * 0.7071);
  tag = max(tag, 0.011 - length(q.xy));
  add(d, extrude(tag, q.z, 0.0035) - 0.0015, 102.0);
  vec3 edge = vec3(-0.060, giftH.y + 0.009, giftH.z + 0.009);
  float twine = min(sdCapsule(g, hole + vec3(0.004, -0.008, 0.004), edge, 0.0042), sdCapsule(g, hole + vec3(-0.006, -0.006, 0.0), edge + vec3(-0.012, 0.0, 0.0), 0.0042));
  twine = min(twine, sdCapsule(g, edge, vec3(-0.02, giftH.y + 0.03, 0.03), 0.0042));
  add(d, twine, 103.0);
}
bool shGift(float id, vec3 p, inout vec3 n, inout Mat m) {
  if (id < 100.0 || id >= 104.0) return false;
  vec3 g = giftLocal(p);
  if (id < 100.5) {
    // which face are we on? print the pattern flat on each
    vec3 f = abs(g) - giftH; vec2 uv;
    if (f.z > f.x && f.z > f.y) uv = g.xy; else if (f.x > f.y) uv = g.zy + 0.031; else uv = g.xz + 0.017;
    vec3 paper = HUE, n0 = n;
    matPaper(m, n, g, 3, paper);
    n = normalize(mix(n0, n, 0.15));                                              // smooth paper pulled tight, only faintly cockled
    float k = giftPrint(uv + 0.004 * vec2(noise(g * 9.0), noise(g * 9.0 + 5.0)));
    if (k > 1.5) { m.col = srgb(0.93, 0.72, 0.30) * (0.92 + 0.1 * noise(g * 200.0)); m.rough = 0.40; }             // gold ink dots
    else if (k > 0.5) { m.col = srgb(0.97, 0.94, 0.84) * (0.94 + 0.08 * noise(g * 200.0)); m.rough = 0.42; }       // cream stars
    // creases: the box edges show through the paper, a little paler where the ink has cracked
    float e1 = max(f.x, max(f.y, f.z)), e2 = f.x + f.y + f.z - e1 - min(f.x, min(f.y, f.z));
    float edge = smoothstep(-0.012, -0.002, e2);
    m.col = mix(m.col, m.col * 1.25 + 0.03, 0.5 * edge * (0.5 + 0.5 * noise(g * 70.0)));
    m.rough += 0.15 * edge;
    // the folded ends: diagonal creases running in from the corners
    if (f.x > f.y && f.x > f.z) {
      float tt = (abs(g.y) - (giftH.y - giftH.z) - abs(g.z)) * 0.7071;
      m.col *= 1.0 - 0.45 * (1.0 - smoothstep(0.0, 0.008, abs(tt + 0.002)));
      if (tt > 0.0) m.col *= 1.12;                                                 // the last flaps catch a little more light
      // a strip of clear tape holding each flap down
      vec2 tp = vec2(abs(g.z) - 0.105, abs(g.y) - 0.145);
      if (sdBox2(tp, vec2(0.022, 0.05)) < 0.0) { m.rough = 0.08; m.coat = 1.0; m.coatRough = 0.05; m.col = m.col * 0.92 + 0.02; }
    }
    // soft wrinkles where the paper is pulled round the corners
    bumpN(n, g + 0.3 * fbm3(g * 4.0), 14.0, 0.02 + 0.16 * smoothstep(-0.10, 0.0, e2));
    return true;
  }
  if (id < 101.5) {
    // gold satin: fine threads and a streaky sheen, a woven selvedge at each side of the flat bands
    float thread = noise(g * vec3(160.0, 40.0, 160.0)), streak = fbm3(g * vec3(9.0, 3.0, 9.0));
    m.col = srgb(0.88, 0.62, 0.16) * (0.92 + 0.08 * thread) * (0.85 + 0.3 * streak);
    m.rough = 0.27 + 0.10 * thread + 0.12 * streak; m.sheen = 0.8; m.sheenCol = srgb(1.0, 0.86, 0.50); m.metal = 0.45;
    if (g.y < giftH.y + 0.012) {
      float sel = min(abs(abs(g.x) - 0.035), abs(abs(g.z) - 0.035));
      m.col *= 1.0 - 0.3 * (1.0 - smoothstep(0.0015, 0.004, sel));
    }
    n = normalize(n + 0.05 * (noise(g * vec3(300.0, 30.0, 300.0)) - 0.5));
    return true;
  }
  if (id < 102.5) {
    // manila tag: a reinforced eyelet, and "To / From" in a quick hand
    vec3 q = g - vec3(-0.215, 0.17, giftH.z + 0.012); q.xy = rot(-0.20) * q.xy;
    vec3 n0 = n;
    matPaper(m, n, g * 0.3, 1, srgb(0.86, 0.73, 0.50));
    n = normalize(mix(n0, n, 0.3));
    float ring = length(q.xy);
    if (ring < 0.026) m.col = srgb(0.80, 0.26, 0.18) * (0.9 + 0.2 * noise(g * 150.0));
    for (int i = 0; i < 3; i++) {
      float y = -0.085 - 0.045 * float(i), len = i == 2 ? 0.025 : 0.05;
      float wob = 0.007 * sin(q.x * 190.0 + float(i) * 2.1) * noise(q.x * 60.0 + float(i) * 7.0) + 0.004 * sin(q.x * 70.0 + float(i));
      float line = abs(q.y - y - wob) - 0.0042;
      if (line < 0.0 && abs(q.x + 0.008 * float(i)) < len) m.col = mix(m.col, srgb(0.10, 0.10, 0.22), 0.85);
    }
    return true;
  }
  // baker's twine, red and white
  float tw = step(0.5, fract((g.x + g.y * 1.3 + g.z) * 55.0));
  m.col = mix(srgb(0.90, 0.87, 0.80), srgb(0.70, 0.10, 0.10), tw); m.rough = 0.9; m.sheen = 0.5; m.sheenCol = vec3(1.0);
  return true;
}
