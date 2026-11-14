// Hardback picture book of the planets: cloth boards, rounded spine with raised bands, foil-stamped ringed planet,
// cream page block, striped headband, satin ribbon marker. Stands on y = 0, about 1.12 tall. Material ids 100..104.
// HUE is the cloth colour.
#ifndef HUE
#define HUE srgb(0.085, 0.20, 0.56)
#endif
#ifndef BOOK_TURN
#define BOOK_TURN (-0.58)
#endif
const float BOOK_S = 1.06;       // overall scale
const float BOOK_T = 0.098;      // half the thickness, to the outside of a board
// book space: x across the cover (spine at -x, fore-edge at +x), y up from the middle, z through the pages (front cover +z)
vec3 bookLocal(vec3 p) { p /= BOOK_S; p -= vec3(-0.035, 0.56, 0.0); p.xz = rot(BOOK_TURN) * p.xz; p.x -= 0.012; return p; }
// one cover board, seen face on: a rounded rectangle with its corners knocked about by different amounts
float bookBoard2(vec2 q, float face) {
  vec2 c = q - vec2(0.024, 0.0);
  float d = sdBox2(c, vec2(0.376, 0.56) - 0.014) - 0.014;
  float bump = (c.x > 0.0 ? (c.y > 0.0 ? 0.030 : 0.017) : 0.0) * (face > 0.0 ? 1.0 : 0.6);
  float cut = dot(abs(c) - vec2(0.376, 0.56), vec2(0.7071)) + bump;
  return smax(d, cut, 0.02);
}
float bookStar(vec2 u, float r) { u = abs(u); return (sqrt(u.x) + sqrt(u.y) - sqrt(r)) * sqrt(r); }
float bookSeg(vec2 u, float ax, float ay, float bx, float by) { return sdSeg2(u, vec2(ax, ay), vec2(bx, by)); }
// stamped title: PLANETS in plain capitals, u in letter cells one unit high
float bookTitle(vec2 u) {
  float d = 1e9; vec2 q = u;
  d = min(d, min(min(bookSeg(q, 0.0, 0.0, 0.0, 1.0), bookSeg(q, 0.0, 1.0, 0.45, 1.0)), min(sdBezier(q, vec2(0.45, 1.0), vec2(0.78, 0.74), vec2(0.45, 0.48)), bookSeg(q, 0.45, 0.48, 0.0, 0.48))));   // P
  q.x -= 1.0; d = min(d, min(bookSeg(q, 0.0, 1.0, 0.0, 0.0), bookSeg(q, 0.0, 0.0, 0.55, 0.0)));                                                              // L
  q.x -= 0.85; d = min(d, min(min(bookSeg(q, 0.0, 0.0, 0.36, 1.0), bookSeg(q, 0.36, 1.0, 0.72, 0.0)), bookSeg(q, 0.13, 0.34, 0.59, 0.34)));                   // A
  q.x -= 1.02; d = min(d, min(min(bookSeg(q, 0.0, 0.0, 0.0, 1.0), bookSeg(q, 0.0, 1.0, 0.62, 0.0)), bookSeg(q, 0.62, 0.0, 0.62, 1.0)));                       // N
  q.x -= 0.95; d = min(d, min(min(bookSeg(q, 0.0, 0.0, 0.0, 1.0), bookSeg(q, 0.0, 1.0, 0.55, 1.0)), min(bookSeg(q, 0.0, 0.52, 0.45, 0.52), bookSeg(q, 0.0, 0.0, 0.55, 0.0))));   // E
  q.x -= 0.82; d = min(d, min(bookSeg(q, 0.0, 1.0, 0.7, 1.0), bookSeg(q, 0.35, 1.0, 0.35, 0.0)));                                                             // T
  q.x -= 0.95;                                                                                                                                              // S
  d = min(d, min(min(sdBezier(q, vec2(0.58, 0.84), vec2(0.30, 1.16), vec2(0.04, 0.80)), sdBezier(q, vec2(0.04, 0.80), vec2(-0.06, 0.56), vec2(0.31, 0.50))),
                 min(sdBezier(q, vec2(0.31, 0.50), vec2(0.70, 0.43), vec2(0.58, 0.20)), sdBezier(q, vec2(0.58, 0.20), vec2(0.42, -0.14), vec2(0.0, 0.17)))));
  return d;
}
// the foil on the front board: below zero where there is gold. u = board coordinates
float bookFoil(vec2 u) {
  vec2 c = u - vec2(0.024, 0.0);
  float fr = sdBox2(c, vec2(0.326, 0.510) - 0.02) - 0.02;
  float d = abs(fr) - 0.0045;                                              // outer rule
  d = min(d, abs(fr + 0.016) - 0.0016);                                    // hairline inside it
  vec2 pc = c - vec2(0.0, 0.135);
  vec2 w = rot(0.36) * pc;
  float e = length(w / vec2(0.250, 0.070));
  float ring = min(abs(e - 1.0) * 0.070 - 0.0075, abs(e - 0.80) * 0.070 - 0.0030);
  float disc = length(pc) - 0.122;
  // the ring goes behind the planet at the top and in front of it at the bottom
  float ringVis = (w.y > 0.0 && disc < 0.012) ? 1.0 : ring;
  float planet = max(disc, -(ring - 0.010) * step(w.y, 0.0) + 1.0 * step(0.0, w.y) - 1.0 * step(0.0, w.y));
  planet = (w.y <= 0.0) ? max(disc, -(ring - 0.010)) : disc;
  // cloud bands left bare across the globe
  float bands = min(abs(w.y - 0.052 + 0.25 * w.x * w.x) - 0.006, abs(w.y + 0.060 + 0.3 * w.x * w.x) - 0.0045);
  bands = min(bands, abs(w.y - 0.012 + 0.2 * w.x * w.x) - 0.0025);
  planet = max(planet, -bands);
  d = min(d, min(planet, ringVis));
  // stars
  d = min(d, bookStar(c - vec2(-0.215, 0.365), 0.050));
  d = min(d, bookStar(c - vec2(0.235, 0.300), 0.032));
  d = min(d, bookStar(c - vec2(0.170, 0.415), 0.020));
  d = min(d, bookStar(c - vec2(-0.250, 0.120), 0.022));
  d = min(d, bookStar(c - vec2(0.262, -0.030), 0.026));
  d = min(d, length(c - vec2(-0.105, 0.420)) - 0.006);
  d = min(d, length(c - vec2(0.045, 0.385)) - 0.005);
  d = min(d, length(c - vec2(-0.275, 0.245)) - 0.005);
  d = min(d, length(c - vec2(0.285, 0.170)) - 0.006);
  d = min(d, length(c - vec2(-0.190, -0.050)) - 0.005);
  // title and a small rule under it
  d = min(d, bookTitle((c - vec2(-0.232, -0.265)) / 0.074) * 0.074 - 0.0062);
  d = min(d, sdBox2(c - vec2(0.0, -0.315), vec2(0.105, 0.0018)));
  d = min(d, bookStar(c - vec2(0.0, -0.375), 0.020));
  return d;
}
// height of the raised bands along the spine, 0..1
float bookBands(float y) {
  float b = 0.0;
  for (int i = 0; i < 5; i++) { float c = -0.40 + 0.20 * float(i); b = max(b, 1.0 - smoothstep(0.008, 0.017, abs(y - c))); }
  return b;
}
void mGift(vec3 p, inout float d) {
  float bb = length(p - vec3(0.0, 0.6, 0.05)) - 0.84;
  if (bb > 0.15) { d = min(d, bb); return; }
  vec3 q = bookLocal(p); float d0 = d, m0 = gM; d = 1e9;
  float az = abs(q.z);
  // boards: grey board wrapped in cloth, proud of the pages on three sides
  float board = extrudeR(bookBoard2(q.xy, q.z), az - (BOOK_T - 0.0075), 0.0075, 0.005);
  // spine: a rounded back with raised bands, joined to the boards by a hinge of cloth that dips into a groove
  float bands = bookBands(q.y);
  vec2 sp = vec2(q.x + 0.362, q.z);
  float back = (length(sp / vec2(0.050, BOOK_T + 0.0015)) - 1.0) * 0.050 - 0.0045 * bands;
  back = max(back, sp.x - 0.012);
  float hinge = sdBox2(vec2(q.x + 0.345, q.z), vec2(0.016, BOOK_T - 0.012)) - 0.002;
  float spine = extrudeR(smin(back, hinge, 0.012), q.y, 0.56, 0.006);
  add(d, min(board, spine), 100.0);
  // page block: a hair wavy, hollowed at the fore-edge as a rounded-back book is
  float wav = 0.0012 * sin(q.y * 23.0 + 1.0) * sin(q.x * 9.0);
  float pages = sdBox(q - vec3(0.018, 0.0, 0.0), vec3(0.366, 0.544, BOOK_T - 0.0149 + wav)) - 0.0015;
  pages = max(pages, -(length(vec2(q.x - 0.384 - 0.40, q.z)) - 0.405));
  add(d, pages, 101.0);
  // headband: a striped silk bead at the head and tail of the spine
  vec3 h = vec3(q.x + 0.342, abs(q.y) - 0.5445, q.z);
  add(d, max(length(h.xy) - 0.0085, abs(h.z) - (BOOK_T - 0.02)), 102.0);
  // ribbon marker: comes out from under the pages and lies on the belt
  vec2 rb = q.xz, re = rb - vec2(-0.375, 0.18);
  float along = sdBezier(rb, vec2(0.10, 0.02), vec2(-0.07, 0.29), vec2(-0.375, 0.18));
  float lift = 0.005 + 0.036 * exp(-dot(rb - vec2(-0.235, 0.215), rb - vec2(-0.235, 0.215)) / 0.0042);     // one loop of it stands off the belt
  float rib = max(along - 0.022, abs(q.y + 0.56 - lift) - 0.0022) - 0.0012;
  rib = max(rib, dot(re, normalize(vec2(-0.305, -0.11))) + 0.024 - 1.2 * abs(dot(re, normalize(vec2(0.11, -0.305)))));   // swallow-tail end
  add(d, rib * 0.6, 103.0);
  d *= BOOK_S;
  if (d0 < d) { d = d0; gM = m0; }
}
bool shGift(float id, vec3 p, inout vec3 n, inout Mat m) {
  if (id < 100.0 || id >= 105.0) return false;
  vec3 q = bookLocal(p);
  vec3 ex = vec3(cos(BOOK_TURN), 0.0, sin(BOOK_TURN)), ez = vec3(-sin(BOOK_TURN), 0.0, cos(BOOK_TURN));   // book x and z axes in the world
  if (id < 100.5) {
    bool spine = q.x < -0.352;
    vec2 uv = spine ? vec2(atan(q.z, -(q.x + 0.362)) * 0.07, q.y) : q.xy;
    matCloth(m, n, p, uv, HUE, 0.25); m.sheen = 0.16;
    // buckram: a coarse weave you can see, mottled by handling, the spine a little sun-faded, a few shelf scuffs
    float mott = fbm3(q * vec3(5.0, 4.0, 5.0) + 2.0);
    m.col *= (0.80 + 0.40 * mott) * (0.94 + 0.12 * noise(q * vec3(3.0, 5.0, 3.0)));
    if (spine) m.col = mix(m.col, vec3(lum(m.col)) * 1.15, 0.22);
    m.col = mix(m.col, m.col * 1.5 + 0.03, 0.55 * scratches(q * 0.6) * smoothstep(0.4, 0.6, mott));
    m.rough = 0.80 + 0.12 * mott;
    bumpN(n, q, 300.0, 0.45);
    // rubbed pale where hands and shelves touch it: board edges, corners, the bands and the hinge
    float edge = bookBoard2(q.xy, q.z);
    float rub = spine ? 0.55 * bookBands(q.y) + 0.5 * smoothstep(0.535, 0.56, abs(q.y))
                      : smoothstep(-0.009, -0.001, edge) * 0.5 + smoothstep(0.09, 0.0, length(abs(q.xy - vec2(0.024, 0.0)) - vec2(0.376, 0.56))) * 0.55;
    rub *= 0.45 + 0.9 * noise(q * 60.0);
    m.col = mix(m.col, mix(HUE, srgb(0.72, 0.68, 0.60), 0.45), sat(rub) * 0.7);
    // gold foil
    float foil = 1.0;
    if (!spine && q.z > 0.08) {
      foil = bookFoil(q.xy);
      float e = 0.002, fx = bookFoil(q.xy + vec2(e, 0.0)) - foil, fy = bookFoil(q.xy + vec2(0.0, e)) - foil;
      float rim = 1.0 - smoothstep(0.0, 0.003, abs(foil));
      n = normalize(n + 0.5 * rim * (ex * fx + vec3(0, 1, 0) * fy) / e);          // pressed into the cloth
    } else if (spine) {
      // rules either side of each band, a title panel, and an ornament in each of the other panels
      float a = atan(q.z, -(q.x + 0.362)), s = a * 0.075, y = q.y, f = 1e9;
      for (int i = 0; i < 5; i++) { float c = -0.40 + 0.20 * float(i); f = min(f, abs(abs(y - c) - 0.026) - 0.0028); }
      f = min(f, abs(sdBox2(vec2(s, y - 0.30), vec2(0.060, 0.050))) - 0.0022);
      f = min(f, sdBox2(vec2(s, abs(y - 0.30) - 0.017), vec2(0.040, 0.0065)));
      f = min(f, bookStar(vec2(s, y - 0.10), 0.034));
      f = min(f, min(abs(length(vec2(s, y + 0.10)) - 0.020) - 0.003, length(vec2(s, y + 0.10)) - 0.008));
      f = min(f, bookStar(vec2(s, y + 0.30), 0.034));
      f = min(f, bookStar(vec2(s, abs(y) - 0.49), 0.020));
      foil = max(f, (abs(a) - 1.3) * 0.05);
    }
    float worn = smoothstep(0.62, 0.78, fbm3(q * 34.0)) * 0.7;
    float g = (1.0 - smoothstep(-0.0012, 0.0004, foil)) * (1.0 - worn);
    if (g > 0.0) {
      vec3 gold = srgb(1.0, 0.78, 0.30) * (0.85 + 0.25 * noise(q * 190.0));
      m.col = mix(m.col, gold, g); m.metal = 0.45 * g; m.rough = mix(m.rough, 0.34 + 0.2 * noise(q * 140.0), g); m.sheen *= 1.0 - g;
      n = normalize(n + 0.05 * g * (hash3(floor(q * 380.0)) - 0.5));
    }
    return true;
  }
  if (id < 101.5) {
    // pages: hundreds of leaves, a few standing proud, the edges toned by age
    matPaper(m, n, p, 0, srgb(0.97, 0.94, 0.86));
    float leaf = noise(q.z * 900.0), sig = noise(q.z * 95.0 + 3.0);
    float lines = 0.80 + 0.20 * leaf;
    m.col *= lines * (0.90 + 0.14 * sig) * (0.93 + 0.1 * noise(vec2(q.z * 300.0, (q.x + q.y) * 4.0)));
    m.col *= mix(vec3(1.0), srgb(0.80, 0.70, 0.52), 0.35 * smoothstep(0.045, 0.072, abs(q.z)) + 0.25 * noise(q * 9.0));
    n = normalize(n + 0.30 * (leaf - 0.5) * ez + 0.12 * (sig - 0.5) * ez);
    m.rough = 0.85;
    return true;
  }
  if (id < 102.5) {
    float st = step(0.5, fract(q.z * 55.0));
    matCloth(m, n, p, q.zy * 2.0, mix(srgb(0.75, 0.10, 0.08), srgb(0.93, 0.80, 0.45), st), 0.2);
    n = normalize(n + 0.25 * sin(q.z * 55.0 * TAU) * ez);
    return true;
  }
  // satin ribbon
  float thread = noise(vec3(q.x * 600.0, q.y * 600.0, q.z * 600.0));
  m.col = srgb(0.62, 0.04, 0.06) * (0.8 + 0.3 * thread); m.rough = 0.42 + 0.12 * thread; m.sheen = 1.0; m.sheenCol = srgb(1.0, 0.5, 0.45);
  n = normalize(n + 0.07 * (hash3(q * 900.0) - 0.5));
  return true;
}
