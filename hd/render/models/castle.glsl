// A real castle, seen small: a limestone keep with a corner turret and a flag, a curtain wall with four round towers
// (three under slate cones), a gatehouse with a portcullis, a tiled hall in the bailey, all on its own plot of turf and
// rock with a few firs for scale. Material ids 110..119.
const float CS_A = 0.5, CS_G = 0.055;        // turn about y; ground level inside the walls
const vec2 CS_W = vec2(0.36, 0.26);          // half-size of the curtain wall's plan
const vec2 CS_K = vec2(-0.07, -0.085);       // centre of the keep
const vec2 CS_KH = vec2(0.125, 0.107);       // half-size of the keep
// round towers: axis x, z, radius, height above the ground
const vec4 CS_T0 = vec4(0.36, 0.26, 0.088, 0.35), CS_T1 = vec4(-0.36, 0.26, 0.076, 0.43), CS_T2 = vec4(0.36, -0.26, 0.076, 0.47),
           CS_T3 = vec4(-0.36, -0.26, 0.076, 0.40), CS_T4 = vec4(-0.195, 0.022, 0.05, 0.80), CS_T5 = vec4(0.105, 0.325, 0.043, 0.44);
vec3 csLocal(vec3 p) { p.xz = rot(CS_A) * p.xz; return p; }
// a round tower: battered foot, a corbelled parapet, then merlons or (cone > 0) a conical roof of that height
float csTower(vec3 p, vec4 t, float cone, inout float roof) {
  vec3 q = vec3(p.x - t.x, p.y - CS_G, p.z - t.y);
  float rad = length(q.xz), r = t.z, h = t.w;
  float body = max(rad - r - 0.03 * (1.0 - smoothstep(-0.06, 0.13, q.y)), q.y - h);
  float st = smin(body, max(abs(rad - r - 0.001) - 0.013, abs(q.y - h - 0.002) - 0.024), 0.014);
  if (cone > 0.0) {
    float c = sdCapCone(q - vec3(0, h + 0.026 + 0.5 * cone, 0), 0.5 * cone, r + 0.028, 0.004) - 0.003;
    roof = min(roof, c);
  } else {
    float n = floor(TAU * r / 0.05 + 0.5), sec = TAU / n;
    float a = (fract(atan(q.z, q.x) / sec) - 0.5) * sec * rad;
    st = min(st, smax(max(abs(rad - r - 0.001) - 0.013, abs(q.y - h - 0.044) - 0.02), abs(a) - 0.3 * sec * r, 0.004));
  }
  return st;
}
// model-railway fir: tiers of flock on a short trunk. q from its foot, h its height
float csFir(vec3 q, float h) {
  float yy = q.y / h;
  float c = sdCapCone(q - vec3(0, 0.57 * h, 0), 0.43 * h, 0.27 * h, 0.01) - 0.035 * h * abs(sin(yy * 14.0));
  if (c < 0.03) c -= 0.012 * (noise(q * 95.0) - 0.5); else c -= 0.006;
  return min(c * 0.6, sdCyl(q - vec3(0, 0.08 * h, 0), 0.03 * h, 0.1 * h));

}
void mGift(vec3 pw, inout float d) {
  float bb = length(pw - vec3(0, 0.5, 0)) - 0.95;
  if (bb > 0.15) { d = min(d, bb); return; }
  vec3 p = csLocal(pw); float y = p.y - CS_G;
  // the plot: turf on top, a rocky bank round the edge
  float plot = sdBox2(pw.xz, vec2(0.40, 0.30)) - 0.19;
  float mound = smax(plot + 0.75 * pw.y, pw.y - 0.05, 0.035) - 0.02;
  if (mound < 0.04) mound = smax(plot + 0.75 * pw.y, pw.y - 0.05 - 0.02 * (fbm3(pw * 11.0) - 0.5), 0.035) + 0.014 * (fbm3(pw * 27.0) - 0.5);
  add(d, mound * 0.65, 113.0);
  // curtain wall: battered foot, wall-walk, parapet and merlons on the outer edge
  float f2 = sdBox2(p.xz, CS_W);
  float cur = max(abs(f2) - 0.028 - 0.022 * (1.0 - smoothstep(-0.06, 0.12, y)), y - 0.25);
  bool alongX = abs(abs(p.z) - CS_W.y) < abs(abs(p.x) - CS_W.x);
  float u = alongX ? p.x : p.z, strip = abs(f2 - 0.019) - 0.011;
  cur = min(cur, max(strip, abs(y - 0.262) - 0.02));
  cur = min(cur, smax(max(strip, abs(y - 0.30) - 0.02), abs(fract(u / 0.05) - 0.5) * 0.05 - 0.015, 0.004));
  // gatehouse standing out of the front wall
  vec3 gq = vec3(p.x, y, p.z - CS_W.y);
  float gf = sdBox2(gq.xz - vec2(0, 0.012), vec2(0.105, 0.055));
  float gh = max(gf - 0.003, gq.y - 0.36);
  float gstrip = abs(gf - 0.002) - 0.011;
  gh = smin(gh, max(gstrip, abs(gq.y - 0.372) - 0.022), 0.01);
  float gu = (abs(gq.x) - 0.105 > abs(gq.z - 0.012) - 0.055) ? gq.z + 0.01 : gq.x;
  gh = min(gh, smax(max(gstrip, abs(gq.y - 0.412) - 0.02), abs(fract(gu / 0.042) - 0.5) * 0.042 - 0.0125, 0.004));
  float flat_ = min(cur, gh);
  // pointed gate arch right through
  float gate = gq.y < 0.085 ? abs(gq.x) - 0.048 : length(vec2(abs(gq.x) + 0.048, gq.y - 0.085)) - 0.096;
  flat_ = smax(flat_, -max(gate, abs(gq.z) - 0.13), 0.006);
  // keep
  vec3 kq = vec3(p.x - CS_K.x, y, p.z - CS_K.y);
  float kf = sdBox2(kq.xz, CS_KH);
  float keep = max(kf - 0.004 - 0.024 * (1.0 - smoothstep(-0.06, 0.22, kq.y)), kq.y - 0.66);
  float kstrip = abs(kf - 0.005) - 0.012;
  keep = smin(keep, max(kstrip, abs(kq.y - 0.672) - 0.024), 0.012);
  bool kx = abs(kq.x) - CS_KH.x > abs(kq.z) - CS_KH.y;
  float kper = kx ? 0.0428 : 0.0363, ku = (kx ? kq.z : kq.x) / kper;
  keep = min(keep, smax(max(kstrip, abs(kq.y - 0.716) - 0.02), abs(fract(ku) - 0.5) * kper - 0.3 * kper, 0.004));
  // its windows: two by two in front, two on the side, each with a pane set back in the wall
  float wy = repLim(kq.y - 0.33, 0.17, 0.0, 1.0);
  float winF = sdBox2(vec2(abs(kq.x) - 0.055, wy), vec2(0.007, 0.024)) - 0.012, winS = sdBox2(vec2(kq.z, wy), vec2(0.007, 0.024)) - 0.012;
  float holes = min(max(winF, abs(kq.z - CS_KH.y) - 0.024), max(winS, abs(kq.x - CS_KH.x) - 0.024));
  keep = smax(keep, -holes, 0.005);
  add(d, min(max(winF - 0.004, abs(kq.z - CS_KH.y + 0.014) - 0.003), max(winS - 0.004, abs(kq.x - CS_KH.x + 0.014) - 0.003)), 115.0);
  flat_ = min(flat_, keep);
  // hall against the east wall, with a chimney
  vec3 hq = vec3(p.x - 0.215, y, p.z + 0.04);
  vec2 rn = normalize(vec2(0.12, 0.10));
  float rp = dot(vec2(abs(hq.x), hq.y - 0.44), rn);
  flat_ = min(flat_, max(sdBox2(hq.xz, vec2(0.08, 0.155)), rp + 0.008));
  flat_ = min(flat_, sdRBox(hq - vec3(0.0, 0.45, -0.11), vec3(0.016, 0.06, 0.016), 0.004));
  add(d, max(max(abs(rp) - 0.008, abs(hq.z) - 0.168), 0.33 - hq.y), 119.0);
  // the stone's own unevenness, only worked out close to it
  float rough = flat_ < 0.03 ? 0.0045 * (noise(p * 36.0) - 0.5) + 0.0022 * (noise(p * 95.0) - 0.5) : 0.0;
  add(d, flat_ + rough, 110.0);
  // towers
  float roofs = 1e9;
  float tw = csTower(p, CS_T0, 0.0, roofs);
  tw = min(tw, csTower(p, CS_T1, 0.21, roofs));
  tw = min(tw, csTower(p, CS_T2, 0.22, roofs));
  tw = min(tw, csTower(p, CS_T3, 0.20, roofs));
  tw = min(tw, csTower(p, CS_T4, 0.17, roofs));
  tw = min(tw, csTower(vec3(abs(p.x), p.yz), CS_T5, 0.0, roofs));
  if (tw < 0.03 && rough == 0.0) rough = 0.0045 * (noise(p * 36.0) - 0.5) + 0.0022 * (noise(p * 95.0) - 0.5);
  add(d, tw + rough, 111.0);
  add(d, roofs, 112.0);
  // portcullis, let most of the way down
  vec3 pq = vec3(gq.x, gq.y, gq.z - 0.04);
  float bars = min(length(vec2(repLim(pq.x, 0.031, -1.0, 1.0), pq.z)), length(vec2(repLim(pq.y - 0.07, 0.034, 0.0, 2.0), pq.z))) - 0.003;
  add(d, max(bars, max(gate - 0.004, 0.04 - pq.y)), 114.0);
  // flag on the keep's turret
  vec3 fq = p - vec3(CS_T4.x, CS_G + CS_T4.w + 0.19, CS_T4.y);
  add(d, min(sdCapsule(fq, vec3(0), vec3(0, 0.17, 0), 0.0035), sdSphere(fq - vec3(0, 0.005, 0), 0.01)), 117.0);
  vec3 fl = fq - vec3(0.05, 0.135, 0.0);
  fl.z -= 0.012 * sin(fl.x * 55.0 + 1.5) * smoothstep(-0.05, 0.02, fl.x);
  float pen = max(sdBox(fl, vec3(0.05, 0.03, 0.0025)), abs(fl.y) - 0.03 * (0.5 - fl.x / 0.1) - 0.004);
  add(d, pen * 0.7, 116.0);
  // firs on the turf outside the walls
  float firs = min(csFir(pw - vec3(-0.50, 0.04, 0.30), 0.21), min(csFir(pw - vec3(-0.40, 0.04, 0.42), 0.14), csFir(pw - vec3(0.50, 0.04, 0.22), 0.17)));
  add(d, firs, 118.0);
}
// coursed limestone: uv along the wall and up, in units. returns the distance to the nearest mortar joint;
// id = one random number per block, g = direction away from that joint (along u, up)
float csBlocks(vec2 uv, out float id, out vec2 g) {
  float ch = 0.027, yy = uv.y / ch + 0.3 * sin(uv.y / ch * 2.3);
  float r = floor(yy), fy = fract(yy);
  float bw = ch * mix(1.5, 2.7, hash1(r * 3.1 + 1.0));
  float xx = uv.x / bw + 7.0 * hash1(r * 7.7), k = floor(xx);
  float b0 = k + 0.3 * (hash1(vec2(k, r)) - 0.5), b1 = k + 1.0 + 0.3 * (hash1(vec2(k + 1.0, r)) - 0.5);
  if (xx < b0) { b1 = b0; k -= 1.0; b0 = k + 0.3 * (hash1(vec2(k, r)) - 0.5); }
  else if (xx > b1) { b0 = b1; k += 1.0; b1 = k + 1.0 + 0.3 * (hash1(vec2(k + 1.0, r)) - 0.5); }
  id = hash1(vec2(k, r) + 2.9);
  float dl = (xx - b0) * bw, dr = (b1 - xx) * bw, jx = min(dl, dr);
  float jy = min(fy, 1.0 - fy) * ch / (1.0 + 0.69 * cos(uv.y / ch * 2.3));
  if (jx < jy) { g = vec2(dl < dr ? 1.0 : -1.0, 0.0); return jx; }
  g = vec2(0.0, fy < 0.5 ? 1.0 : -1.0); return jy;
}
// weathered limestone ashlar. uv on the wall (u along, v = height above the ground), tu = the direction of u
void csStone(inout Mat m, inout vec3 n, vec3 p, vec2 uv, vec3 tu) {
  float id; vec2 g; float j = csBlocks(uv, id, g);
  j += 0.0014 * (noise(p * 240.0) - 0.5);
  float mortar = 1.0 - smoothstep(0.0010, 0.0026, j);
  vec3 lime = mix(srgb(0.80, 0.73, 0.60), srgb(0.63, 0.61, 0.56), smoothstep(0.2, 0.9, id));
  lime = mix(lime, srgb(0.76, 0.60, 0.40), smoothstep(0.80, 0.95, hash1(id * 13.7)));           // the odd ironstone block
  float face = fbm3(p * 55.0), pit = smoothstep(0.6, 0.8, noise(p * 170.0));
  vec3 c = lime * (0.84 + 0.32 * face) * (1.0 - 0.22 * pit) * (0.88 + 0.24 * hash1(id * 5.3));
  c = mix(c, srgb(0.52, 0.49, 0.43) * (0.75 + 0.4 * face), mortar);
  // rain streaks down the face, soot and damp
  float streak = smoothstep(0.5, 0.85, noise(vec2(uv.x * 60.0, uv.y * 5.0))) * smoothstep(0.3, 0.7, fbm3(p * 6.0 + 2.0));
  c *= 1.0 - 0.32 * streak;
  c *= 0.86 + 0.28 * fbm3(p * 8.0 + 5.0);
  // moss climbing from the ground and lying on ledges, lichen higher up
  float low = 1.0 - smoothstep(0.0, 0.16, uv.y);
  float moss = smoothstep(0.56, 0.76, fbm3(p * 20.0 + 3.0) * 0.75 + 0.5 * low + 0.25 * sat(n.y) + 0.2 * mortar);
  c = mix(c, srgb(0.27, 0.34, 0.12) * (0.55 + 0.9 * noise(p * 210.0)), 0.85 * moss);
  float lichen = smoothstep(0.80, 0.86, noise(p * 70.0)) * (1.0 - moss);
  c = mix(c, srgb(0.82, 0.74, 0.40), 0.45 * lichen);
  m.col = c; m.rough = 0.92 - 0.1 * streak;
  float bev = (1.0 - smoothstep(0.0, 0.006, j)) * (1.0 - mortar * 0.5);
  n = normalize(n - 0.65 * bev * (g.x * tu + vec3(0, g.y, 0)) + 0.06 * (hash3(vec3(id * 91.0, id * 37.0, 1.0)) - 0.5));
  bumpN(n, p, 130.0, 1.1); bumpN(n, p, 400.0, 0.5);
  if (moss > 0.3) { m.sheen = 0.6 * moss; m.sheenCol = srgb(0.5, 0.6, 0.25); }
}
// an arrow loop painted into the stone at (du, dv) from its centre
void csLoop(inout Mat m, vec2 dv) {
  float slit = max(abs(dv.x) - 0.0032, abs(dv.y) - 0.03), cross_ = max(abs(dv.x) - 0.01, abs(dv.y - 0.006) - 0.003);
  float s = 1.0 - smoothstep(-0.001, 0.0012, min(slit, cross_));
  m.col = mix(m.col, vec3(0.012, 0.011, 0.01), s);
}
// overlapping slates or tiles: fx, fy = position inside one (fy up the roof), sid = a random number for it
void csTiles(inout Mat m, inout vec3 n, vec3 p, float fx, float fy, float sid, vec3 ca, vec3 cb) {
  vec3 c = mix(ca, cb, sid) * (0.75 + 0.45 * fbm3(p * 45.0));
  c *= 1.0 - 0.65 * smoothstep(0.72, 0.97, fy);                                    // tucked under the course above
  c *= mix(0.4, 1.0, smoothstep(0.02, 0.09, min(fx, 1.0 - fx)));                   // gap to its neighbour
  c *= 1.0 + 0.25 * (1.0 - smoothstep(0.0, 0.12, fy));                             // the cut lower edge catches the light
  float lichen = smoothstep(0.74, 0.84, fbm3(p * 30.0 + 9.0));
  c = mix(c, srgb(0.62, 0.60, 0.36), 0.5 * lichen);
  m.col = c; m.rough = 0.48 + 0.3 * sid + 0.2 * lichen;
  n = normalize(n + 0.16 * (hash3(vec3(sid * 51.0, sid * 17.0, 3.0)) - 0.5) + vec3(0, 0.22 * (fy - 0.5), 0));
  bumpN(n, p, 160.0, 0.6);
}
bool shGift(float id, vec3 pw, inout vec3 n, inout Mat m) {
  if (id < 110.0 || id >= 120.0) return false;
  vec3 p = csLocal(pw); vec3 nl = n; nl.xz = rot(CS_A) * n.xz;
  float y = p.y - CS_G;
  if (id < 110.5) {
    // flat walls: the courses follow whichever way the face looks
    bool xface = abs(nl.x) > abs(nl.z);
    float u = xface ? p.z : p.x; vec3 tu = xface ? vec3(0, 0, 1) : vec3(1, 0, 0);
    if (nl.y > 0.8) u = p.x + p.z * 0.37;
    csStone(m, nl, p, vec2(u, nl.y > 0.8 ? p.z * 1.3 : y), tu);
    // arrow loops along the curtain wall, on its outer faces only
    float f2 = sdBox2(p.xz, CS_W);
    if (f2 > 0.015 && f2 < 0.06 && abs(nl.y) < 0.5) csLoop(m, vec2((fract(u / 0.12 + 0.25) - 0.5) * 0.12, y - 0.15));
    // one on the gatehouse over the arch, and two up the keep's blind faces
    if (p.z > CS_W.y + 0.04 && abs(nl.y) < 0.5) csLoop(m, vec2(p.x, y - 0.27));
  } else if (id < 111.5) {
    vec4 t = CS_T0; vec2 q = p.xz - t.xy; float best = length(q) - t.z, dd;
    dd = length(p.xz - CS_T1.xy) - CS_T1.z; if (dd < best) { best = dd; t = CS_T1; }
    dd = length(p.xz - CS_T2.xy) - CS_T2.z; if (dd < best) { best = dd; t = CS_T2; }
    dd = length(p.xz - CS_T3.xy) - CS_T3.z; if (dd < best) { best = dd; t = CS_T3; }
    dd = length(p.xz - CS_T4.xy) - CS_T4.z; if (dd < best) { best = dd; t = CS_T4; }
    dd = length(vec2(abs(p.x), p.z) - CS_T5.xy) - CS_T5.z; if (dd < best) { best = dd; t = vec4(sign(p.x) * CS_T5.x, CS_T5.yzw); }
    q = p.xz - t.xy; float ang = atan(q.y, q.x), u = ang * t.z;
    vec3 tu = normalize(vec3(-q.y, 0.0, q.x));
    if (nl.y > 0.8) csStone(m, nl, p, p.xz * 1.2, vec3(1, 0, 0)); else csStone(m, nl, p, vec2(u + t.x, y), tu);
    if (abs(nl.y) < 0.5) {
      float sec = TAU / 5.0, du = (fract(ang / sec + 0.31) - 0.5) * sec * t.z;
      float lv = mod(floor(ang / sec + 0.31), 2.0);
      csLoop(m, vec2(du, y - t.w * (0.5 + 0.22 * lv)));
    }
  } else if (id < 112.5) {
    // slate cones
    float r = p.y / 0.0165, ang = atan(nl.z, nl.x);
    float xx = ang / TAU * 26.0 + 0.5 * mod(floor(r), 2.0) + 0.3 * hash1(floor(r));
    csTiles(m, nl, p, fract(xx), fract(r), hash1(vec2(floor(xx), floor(r))), srgb(0.20, 0.25, 0.34), srgb(0.38, 0.41, 0.48));
  } else if (id < 113.5) {
    // the plot: turf above, rock and earth on the bank, a worn track to the gate, beaten earth in the bailey
    float top = smoothstep(0.55, 0.8, n.y + 0.25 * (fbm3(pw * 30.0) - 0.5));
    Mat g = m; vec3 ng = n;
    vec3 turf = mix(srgb(0.13, 0.30, 0.07), srgb(0.33, 0.42, 0.11), smoothstep(0.3, 0.7, fbm3(pw * 9.0)));
    matFelt(g, ng, pw, turf * (0.8 + 0.5 * noise(pw * 140.0))); g.sheen = 0.35; g.sheenCol = srgb(0.5, 0.6, 0.2);
    float track = (1.0 - smoothstep(0.02, 0.05, abs(p.x + 0.02 * sin(p.z * 22.0)))) * step(CS_W.y, p.z);
    float bailey = 1.0 - smoothstep(-0.03, 0.0, sdBox2(p.xz, CS_W));
    float earth = max(track, bailey) * smoothstep(0.3, 0.5, fbm3(pw * 25.0) + 0.25);
    matConcrete(m, n, pw, mix(srgb(0.36, 0.33, 0.29), srgb(0.24, 0.20, 0.16), smoothstep(0.4, 0.6, fbm3(pw * vec3(6.0, 40.0, 6.0)))));
    if (earth > 0.0) { g.col = mix(g.col, srgb(0.40, 0.31, 0.20) * (0.7 + 0.6 * noise(pw * 90.0)), earth); g.sheen *= 1.0 - earth; }
    m.col = mix(m.col, g.col, top); m.rough = mix(m.rough, g.rough, top); m.sheen = g.sheen * top; m.sheenCol = g.sheenCol;
    n = normalize(mix(n, ng, top));
    return true;
  } else if (id < 114.5) {
    matWood(m, nl, p * 3.0, vec3(0, 1, 0), 0.75, 0.0); m.col *= 0.8;
    // iron nail heads where the bars cross
    vec2 c = vec2(repLim(p.x, 0.031, -1.0, 1.0), repLim(y - 0.07, 0.034, 0.0, 2.0));
    if (length(c) < 0.004) { m.col = srgb(0.12, 0.12, 0.13); m.metal = 0.8; m.rough = 0.5; }
  } else if (id < 115.5) {
    // leaded panes: some rooms are lit
    vec3 kq = vec3(p.x - CS_K.x, y, p.z - CS_K.y);
    bool side = kq.x > CS_KH.x - 0.03 && abs(kq.z) < 0.03;
    float which = hash1(vec2(side ? 7.0 : sign(kq.x), floor((kq.y - 0.245) / 0.17)));
    vec2 w = vec2(side ? kq.z : abs(kq.x) - 0.055, repLim(kq.y - 0.33, 0.17, 0.0, 1.0));
    float lead = step(abs(w.x), 0.0022) + step(abs(fract(w.y / 0.016) - 0.5), 0.07);
    m.col = vec3(0.02, 0.022, 0.03); m.rough = 0.12; m.coat = 0.8; m.coatRough = 0.05;
    if (which > 0.42 && lead < 0.5) m.emit = srgb(1.0, 0.66, 0.26) * 4.0 * (0.7 + 0.5 * noise(p * 150.0));
  } else if (id < 116.5) {
    vec2 f = vec2(p.x - CS_T4.x, p.y);
    matCloth(m, nl, p, f, srgb(0.72, 0.06, 0.07), 0.3);
    if (abs(fract(f.x / 0.036) - 0.5) < 0.16) m.col = srgb(0.92, 0.72, 0.16) * (0.8 + 0.3 * noise(p * 300.0));
  } else if (id < 117.5) { matMetal(m, nl, p, 1, vec3(0, 1, 0)); }
  else if (id < 118.5) {
    matFelt(m, nl, p, mix(srgb(0.05, 0.17, 0.08), srgb(0.13, 0.27, 0.08), noise(pw * 60.0)) * (0.6 + 0.8 * noise(pw * 190.0)));
    m.sheen = 0.3; m.sheenCol = srgb(0.3, 0.5, 0.2);

  } else {
    // hall roof: clay tiles in courses down each slope
    vec3 hq = vec3(p.x - 0.215, y, p.z + 0.04);
    float v = (0.44 - hq.y) / 0.02, xx = hq.z / 0.017 + 0.5 * mod(floor(v), 2.0);
    csTiles(m, nl, p, fract(xx), 1.0 - fract(v), hash1(vec2(floor(xx), floor(v) + sign(hq.x) * 9.0)), srgb(0.66, 0.30, 0.15), srgb(0.48, 0.22, 0.13));
  }
  n = nl; n.xz = rot(-CS_A) * nl.xz;
  return true;
}
