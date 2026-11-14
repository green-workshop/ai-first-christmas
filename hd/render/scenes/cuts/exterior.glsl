// The head office of North Pole Ltd on a snowy night: one still, intro-1a.
// A miniature street set shot square-on: the office block in the middle with its sign board on the roof (BLANK: the game letters it),
// lower blocks behind, a street lamp, big pines in the foreground, and a painted night backdrop (moon, aurora, stars, mountains).
// World: the block's front is z = 0, the ground y = 0. Orthographic camera, 5 degrees down, 27.78 px a unit:
//   sx = 800 + 27.78 x,  sy = 500 - 27.78 (0.9962 y - 0.0872 z - 12.96).
// --D MASK=1 renders only the blank sign face, flat, for measuring its rectangle.
//@ w=1600 h=1000 spp=260 ortho=18 pos=0,19.55,74.72 tgt=0,13.01,0 exposure=1.7 tile=128
//@shot intro-1a
#define STEPK 0.6
#define TMAX 260.0
#define STEPS 300
#ifndef MASK
#define FOG 0.004
#define FOG_LIGHT 1
#endif

const float BW = 8.0, BH = 16.65, BD = 10.0, FLH = 2.3, BACKZ = -60.0;
const vec3 SIGNC = vec3(0.0, 20.76, -1.0);
const vec3 LAMPP = vec3(-13.35, 0.0, 37.0);          // foot of the street lamp
const vec3 LHEAD = vec3(-12.2, 8.9, 37.0);

#define NL 3
Light getLight(int i) {
#ifdef MASK
  return omni(vec3(0.0, 50.0, 0.0), 1.0, vec3(0.0));
#else
  if (i == 0) return omni(vec3(120.0, 160.0, 140.0), 10.0, vec3(0.55, 0.68, 1.0) * 80000.0);                           // moonlight
  if (i == 1) return spot(LHEAD + vec3(0.0, -0.3, 0.0), 0.14, vec3(1.0, 0.70, 0.36) * 420.0, LHEAD + vec3(0.6, -9.0, 0.8), 26.0, 42.0);   // the street lamp
  return spot(vec3(0.0, 30.0, 60.0), 1.5, vec3(1.0, 0.9, 0.75) * 21000.0, SIGNC, 9.8, 13.5);                           // floodlight on the sign, from the front
#endif
}
vec3 sky(vec3 rd) {
#ifdef MASK
  return vec3(0.0);
#else
  return mix(vec3(0.030, 0.052, 0.12), vec3(0.008, 0.014, 0.05), sat(rd.y));
#endif
}

float exGround(vec2 q) { return 0.14 * (fbm(q * 0.11 + 4.0) - 0.5) * 2.0 + 0.03 * noise(q * 0.7); }
// a snow-laden pine, h tall: five skirts of boughs stacked up a trunk
float exPine(vec3 p, float h, float seedv) {
  float bb = sdCapCone(p - vec3(0.0, h * 0.5, 0.0), h * 0.52, h * 0.3, h * 0.03);
  if (bb > 0.6) return bb;
  float d = sdCyl(p - vec3(0.0, h * 0.07, 0.0), h * 0.022, h * 0.08);
  for (int i = 0; i < 5; i++) {
    float f = float(i), yb = h * (0.1 + 0.18 * f), hh = h * 0.15 * (1.0 - 0.1 * f), r = h * 0.29 * (1.0 - 0.17 * f);
    d = smin(d, sdCapCone(p - vec3(0.0, yb + hh, 0.0), hh, r, r * 0.12), 0.01 * h);
  }
  float a = atan(p.x, p.z);
  d += 0.035 * h * (noise(vec3(a * 5.0 + seedv, p.y * 14.0 / h, length(p.xz) * 14.0 / h)) - 0.5) + 0.006 * h * (noise(p * 90.0 / h) - 0.5);
  return d * 0.5;
}
// a block in the background: x from x0 to x1, height h, front face at z0, 12 deep
float exBlock(vec3 p, float x0, float x1, float h, float z0) {
  return sdBox(p - vec3(0.5 * (x0 + x1), h * 0.5, z0 - 6.0), vec3(0.5 * (x1 - x0), h * 0.5, 6.0)) - 0.03;
}

float map(vec3 p) {
  float d = 1e9; gM = 0.0; float bb;
  add(d, (p.y - exGround(p.xz)) * 0.8, 1.0);
  add(d, p.z - BACKZ, 20.0);                                                             // the painted backdrop

  // ---- the office block ----
  bb = sdBox(p - vec3(0.0, 12.0, -4.5), vec3(11.5, 13.5, 7.5));
  if (bb > 0.5) d = min(d, bb); else {
    float body = sdBox(p - vec3(0.0, BH * 0.5, -BD * 0.5), vec3(BW, BH * 0.5, BD * 0.5)) - 0.03;
    float wx = repLim(p.x - 1.2, 2.4, -3.0, 2.0), wy = repLim(p.y - 1.5, FLH, 0.0, 6.0);
    body = max(body, -sdBox(vec3(wx, wy, p.z), vec3(0.9, 0.72, 0.18)));
    float ly = repLim(p.y - 2.65, FLH, 0.0, 5.0);
    float ledge = sdRBox(vec3(p.x, ly, p.z + BD * 0.5 - 0.1), vec3(BW + 0.14, 0.07, BD * 0.5 + 0.14), 0.02);
    float slab = sdRBox(p - vec3(0.0, BH + 0.12, -BD * 0.5), vec3(BW + 0.4, 0.3, BD * 0.5 + 0.4), 0.04);
    add(d, min(body, min(ledge, slab)), 3.0);
    add(d, sdBox(vec3(wx, wy, p.z + 0.15), vec3(0.9, 0.72, 0.012)), 4.0);                // glass
    add(d, sdBox(vec3(wx, wy, p.z + 0.1), vec3(0.04, 0.72, 0.03)), 5.0);                 // mullion
    // snow: on every ledge, every sill, the roof
    float sn = sdRBox(vec3(p.x, ly - 0.12, p.z - 0.02), vec3(BW + 0.12, 0.06, 0.13), 0.055);
    sn = min(sn, sdEllipsoid(vec3(wx, wy + 0.7, p.z + 0.05), vec3(0.86, 0.1, 0.12)));
    sn = min(sn, sdRBox(p - vec3(0.0, BH + 0.5, -BD * 0.5), vec3(BW + 0.36, 0.16, BD * 0.5 + 0.36), 0.14));
    add(d, (sn - 0.03 * noise(p * vec3(2.0, 9.0, 2.0))) * 0.8, 2.0);
    // the entrance: a glazed portal, a canopy, a step
    float portal = max(sdRBox(p - vec3(0.0, 1.4, 0.05), vec3(2.25, 1.42, 0.22), 0.03), -sdBox(p - vec3(0.0, 1.3, 0.3), vec3(1.95, 1.3, 0.3)));
    portal = min(portal, sdRBox(p - vec3(0.0, 2.97, 0.8), vec3(2.7, 0.1, 0.9), 0.03));
    add(d, portal, 5.0);
    add(d, sdBox(p - vec3(0.0, 1.3, 0.1), vec3(1.95, 1.3, 0.012)), 6.0);
    add(d, sdRBox(p - vec3(0.0, 0.05, 0.9), vec3(2.5, 0.12, 0.9), 0.03), 3.0);
    add(d, (sdRBox(p - vec3(0.0, 3.16, 0.8), vec3(2.66, 0.12, 0.86), 0.1) - 0.03 * noise(p * 3.0)) * 0.8, 2.0);
  }
  // ---- the sign board on its two posts ----
  bb = sdBox(p - vec3(0.0, 20.0, -1.0), vec3(10.6, 3.7, 0.9));
  if (bb > 0.5) d = min(d, bb); else {
    vec3 q = p - SIGNC;
    float fr = max(sdRBox(q, vec3(10.05, 1.9, 0.16), 0.07), -sdBox(q - vec3(0.0, 0.0, 0.3), vec3(9.6, 1.48, 0.25)));
    add(d, fr, 7.0);
    add(d, sdBox(q - vec3(0.0, 0.0, 0.06), vec3(9.6, 1.48, 0.012)), 8.0);                // the BLANK face
    float post = sdRBox(vec3(abs(p.x) - 6.5, p.y - 18.0, p.z + 1.3), vec3(0.15, 1.25, 0.15), 0.02);
    post = min(post, sdCapsule(vec3(abs(p.x) - 6.5, p.y, p.z), vec3(0.0, 16.9, -3.4), vec3(0.0, 19.4, -1.35), 0.07));   // back stays
    add(d, post, 5.0);
    add(d, (sdRBox(q - vec3(0.0, 2.02, 0.0), vec3(9.95, 0.14, 0.2), 0.13) - 0.03 * noise(p * 3.0)) * 0.8, 2.0);
  }
  // ---- lower blocks behind and beside it ----
  bb = p.z + 12.0;
  if (bb > 0.5) d = min(d, bb); else {
    float bl = exBlock(p, -16.9, -11.5, 10.66, -14.0);
    bl = min(bl, exBlock(p, -27.2, -20.6, 7.9, -17.0));
    bl = min(bl, exBlock(p, -21.2, -16.9, 5.0, -14.0));
    bl = min(bl, exBlock(p, 12.6, 17.6, 9.3, -15.0));
    bl = min(bl, exBlock(p, 17.6, 23.2, 6.1, -14.0));
    bl = min(bl, exBlock(p, 23.0, 29.5, 11.6, -18.0));
    add(d, bl, 9.0);
    // aircraft lights on masts
    float mast = min(sdCapsule(p, vec3(26.2, 11.6, -22.0), vec3(26.2, 13.6, -22.0), 0.05), sdCapsule(p, vec3(-14.4, 10.66, -18.0), vec3(-14.4, 12.0, -18.0), 0.05));
    add(d, mast, 5.0);
    add(d, min(sdSphere(p - vec3(26.2, 13.7, -22.0), 0.16), sdSphere(p - vec3(-14.4, 12.1, -18.0), 0.14)), 10.0);
  }
  // ---- the street lamp ----
  bb = sdBox(p - LAMPP - vec3(0.5, 4.8, 0.0), vec3(1.6, 5.2, 0.7));
  if (bb > 0.5) d = min(d, bb); else {
    vec3 q = p - LAMPP;
    float pole = sdCone(q, vec3(0.0), vec3(0.0, 9.2, 0.0), 0.22, 0.13);
    pole = min(pole, sdRCyl(q - vec3(0.0, 0.25, 0.0), 0.26, 0.3, 0.05));
    pole = min(pole, sdCapsule(q, vec3(0.0, 9.2, 0.0), vec3(1.2, 9.25, 0.0), 0.1));
    vec3 h = p - LHEAD;
    pole = min(pole, sdRBox(h - vec3(0.0, 0.1, 0.0), vec3(0.8, 0.16, 0.36), 0.07));
    add(d, pole, 14.0);
    add(d, sdRBox(h - vec3(0.0, -0.04, 0.0), vec3(0.6, 0.05, 0.25), 0.03), 11.0);
    add(d, sdEllipsoid(h - vec3(0.0, 0.26, 0.0), vec3(0.78, 0.13, 0.36)), 2.0);
  }
  // ---- pines in the foreground ----
  add(d, exPine(p - vec3(-23.6, -0.2, 50.0), 16.0, 1.0), 12.0);
  add(d, exPine(p - vec3(24.9, -0.2, 52.0), 13.6, 2.0), 12.0);
  add(d, exPine(p - vec3(19.2, -0.2, 56.0), 9.2, 3.0), 12.0);
  return d;
}

// the painted night: q = picture coordinates, x -1.6..1.6, y -1..1
vec3 exNight(vec2 q) {
  vec3 c = mix(vec3(0.050, 0.080, 0.19), vec3(0.010, 0.018, 0.065), sat(q.y * 0.6 + 0.45));
  // aurora: one faint green curtain rising to the right
  float yb = 0.40 + 0.12 * q.x + 0.05 * sin(q.x * 2.3 + 0.6);
  float band = exp(-pow((q.y - yb) * 7.5, 2.0)) * smoothstep(0.25, 0.7, fbm(vec2(q.x * 1.6 + 2.0, q.y * 0.6)));
  float rays = 0.45 + 0.55 * noise(vec2(q.x * 26.0 + q.y * 3.0, 3.0));
  c += vec3(0.10, 0.75, 0.42) * band * rays * 0.1;
  // stars
  vec2 g = floor(q * 46.0), f = fract(q * 46.0) - 0.5;
  float st = step(0.965, hash1(g)) * (1.0 - smoothstep(0.05, 0.16, length(f - 0.6 * (hash2(g) - 0.5))));
  c += vec3(0.9, 0.95, 1.0) * st * (0.4 + 1.6 * hash1(g + 3.0)) * 1.6;
  // the crescent moon and its halo
  vec2 mq = q - vec2(0.824, 0.608);
  float disc = (1.0 - smoothstep(0.079, 0.083, length(mq))) * smoothstep(0.070, 0.074, length(mq - vec2(0.040, 0.014)));
  c = c * (1.0 - 0.6 * (1.0 - smoothstep(0.070, 0.074, length(mq - vec2(0.040, 0.014))))) + vec3(1.0, 0.97, 0.9) * disc * 5.0 + vec3(0.4, 0.52, 0.8) * 0.09 * exp(-length(mq) * 7.0);
  // mountains along the horizon
  float rh = -0.40 + 0.26 * fbm(vec2(q.x * 1.3 + 2.0, 1.0)) + 0.05 * noise(vec2(q.x * 5.0, 3.0));
  if (q.y < rh) {
    float up = (q.y + 0.43) / max(rh + 0.43, 0.01);
    float snowy = smoothstep(0.45, 0.7, up + 0.3 * (fbm(q * 9.0) - 0.5));
    c = mix(vec3(0.030, 0.045, 0.10), vec3(0.11, 0.15, 0.28), snowy) * (0.8 + 0.4 * fbm(q * 14.0));
  }
  return c;
}

void shade(float id, vec3 p, inout vec3 n, inout Mat m) {
#ifdef MASK
  m.col = vec3(0.0); m.rough = 1.0;
  if (id > 7.5 && id < 8.5) m.emit = vec3(0.45);
  return;
#else
  if (id < 1.5) { matSnow(m, n, p * 0.25); m.col *= srgb(0.86, 0.90, 1.0); return; }
  if (id < 2.5) { matSnow(m, n, p * 0.4); return; }
  if (id < 3.5) {                                    // the block: painted concrete panels
    matConcrete(m, n, p * 0.35, srgb(0.27, 0.32, 0.50));
    float joint = smoothstep(0.47, 0.5, abs(fract(p.x / 2.4) - 0.5)) * step(-0.05, p.z);
    m.col *= 1.0 - 0.35 * joint;
    float dust = smoothstep(0.6, 0.9, n.y); m.col = mix(m.col, srgb(0.86, 0.90, 1.0), 0.8 * dust);
    return;
  }
  if (id < 4.5) {                                    // windows: most lit warm, some dim, a few dark
    float ix = floor((p.x - 1.2) / 2.4 + 0.5), iy = floor((p.y - 1.5) / FLH + 0.5);
    float h = hash1(vec2(ix * 7.3 + 1.7, iy * 3.1 + 0.4));
    float lit = h < 0.2 ? 0.0 : (h < 0.42 ? 0.4 : 1.0);
    vec2 w = vec2(p.x - 1.2 - ix * 2.4, p.y - 1.5 - iy * FLH);
    float v = (0.7 + 0.6 * fbm(p.xy * 1.6 + ix * 3.0)) * (0.8 + 0.2 * smoothstep(-0.7, 0.3, w.y));
    float blind = step(0.5, hash1(vec2(ix + 9.0, iy))) * smoothstep(0.25, 0.3, w.y) * 0.35;      // a blind half down in some
    m.col = srgb(0.03, 0.04, 0.07); m.rough = 0.1; m.coat = 1.0;
    m.emit = vec3(1.0, 0.47, 0.13) * 0.95 * lit * v * (1.0 - blind);
    return;
  }
  if (id < 5.5) { matPaint(m, n, p, srgb(0.10, 0.12, 0.17), 0.5, 0.3, srgb(0.4, 0.4, 0.42), 1.0); return; }
  if (id < 6.5) {                                    // the lit glass entrance
    float bar = max(max(step(abs(p.x), 0.05), step(abs(abs(p.x) - 0.98), 0.035)), step(abs(p.y - 2.02), 0.035));
    m.col = vec3(0.03); m.rough = 0.1; m.coat = 1.0;
    m.emit = vec3(1.0, 0.55, 0.18) * 1.7 * (1.0 - 0.92 * bar) * (0.8 + 0.3 * fbm(p.xy * 2.0));
    return;
  }
  if (id < 7.5) { matMetal(m, n, p * 0.4, 1, vec3(1, 0, 0)); m.rough = max(m.rough, 0.3); return; }              // gold frame
  if (id < 8.5) { matPaint(m, n, p * 0.25, srgb(0.93, 0.88, 0.76), 0.3, 0.0, vec3(0.3), 0.0); return; }           // BLANK sign face: cream
  if (id < 9.5) {                                    // background blocks: dark, a few small lit windows, snow on the roofs
    m.col = srgb(0.09, 0.115, 0.21) * (0.8 + 0.3 * fbm3(p * 0.7)); m.rough = 0.85;
    if (n.y > 0.6) { matSnow(m, n, p * 0.4); return; }
    if (n.z > 0.6) {
      vec2 g = vec2(p.x / 1.15, p.y / 1.3), gi = floor(g), gf = fract(g);
      float lit = step(0.88, hash1(gi + 11.0)) * step(0.3, gf.x) * step(gf.x, 0.7) * step(0.3, gf.y) * step(gf.y, 0.72) * step(1.0, p.y);
      m.emit = vec3(1.0, 0.58, 0.24) * 0.9 * lit;
    }
    return;
  }
  if (id < 10.5) { m.col = vec3(0.02, 0.0, 0.0); m.emit = vec3(1.0, 0.06, 0.03) * 1.6; m.glow = vec3(1.0, 0.05, 0.02) * 1.5; return; }
  if (id < 11.5) { m.col = vec3(0.0); m.glow = vec3(1.0, 0.74, 0.40) * 22.0; return; }
  if (id < 12.5) {                                   // pines: dark needles, snow lying on every bough
    float v = noise(p * 1.1 + 3.0), tip = noise(p * 18.0);
    float snowy = smoothstep(0.5, 0.72, n.y + 0.45 * (v - 0.5));
    m.col = mix(srgb(0.02, 0.10, 0.07), srgb(0.06, 0.22, 0.13), v) * (0.6 + 0.6 * tip); m.rough = 0.7; m.sheen = 0.3; m.sheenCol = srgb(0.4, 0.8, 0.6);
    n = normalize(n + 0.5 * (hash3(p * 60.0) - 0.5));
    m.col = mix(m.col, srgb(0.86, 0.90, 1.0), snowy); m.rough = mix(m.rough, 0.9, snowy);
    return;
  }
  if (id < 14.5) { matPaint(m, n, p, srgb(0.07, 0.08, 0.10), 0.5, 0.4, srgb(0.3, 0.3, 0.32), 1.0); return; }
  // the backdrop: a painted night, lit from behind
  vec2 q = vec2(p.x / 18.0, (0.9962 * p.y - 0.0872 * p.z - 12.96) / 18.0);
  m.col = vec3(0.0); m.rough = 1.0; m.emit = exNight(q) * 1.25;
#endif
}
