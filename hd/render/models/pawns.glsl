// A chess set that is all pawns: the same inlaid board propped on its storage box, with 16 boxwood and 16 ebonised pawns
// drawn up in four ranks (one has stepped out to e4). Material ids 100..104.
const float pawnsS = 0.90, pawnsTh = 0.038, pawnsQ = 0.1025, pawnsTilt = 0.50, pawnsYaw = 0.32, pawnsK = 1.26;
// world -> board space: x along the ranks (white at -x), y up from the playing surface, z along the files
vec3 pawnsLocal(vec3 p) {
  p.xz = rot(pawnsYaw) * p.xz;
  p.z -= 0.5 * pawnsS * cos(pawnsTilt);
  p.yz = rot(pawnsTilt) * p.yz;
  return p - vec3(0.0, pawnsTh, -0.5 * pawnsS);
}
// ---- lathe profiles: q = (distance from the axis, height) ----
float pawnsCone2(vec2 q, float y0, float y1, float r0, float r1) {
  float h = 0.5 * (y1 - y0); q.y -= 0.5 * (y0 + y1);
  vec2 k1 = vec2(r1, h), k2 = vec2(r1 - r0, 2.0 * h);
  vec2 ca = vec2(q.x - min(q.x, (q.y < 0.0) ? r0 : r1), abs(q.y) - h);
  vec2 cb = q - k1 + k2 * sat(dot(k1 - q, k2) / dot(k2, k2));
  float s = (cb.x < 0.0 && ca.y < 0.0) ? -1.0 : 1.0;
  return s * sqrt(min(dot(ca, ca), dot(cb, cb)));
}
float pawnsDisc(vec2 q, float y, float r, float h) { return sdBox2(q - vec2(0.0, y), vec2(r - h, 0.0)) - h; }   // a bullnose collar
float pawnsEll(vec2 q, vec2 c, vec2 r) { q -= c; float k0 = length(q / r), k1 = length(q / (r * r)); return k0 * (k0 - 1.0) / max(k1, 1e-6); }
// one pawn: plinth, step, dome, a stem that flares out of it, a collar and the ball. l = position relative to the middle of its felt
float pawnsPawn(vec3 l) {
  vec2 q = vec2(length(l.xz), l.y); float R = 0.031;
  float d = sdBox2(q - vec2(0.0, 0.0125), vec2(R - 0.006, 0.0035)) - 0.006;
  d = min(d, pawnsDisc(q, 0.0245, R * 0.80, 0.0035));
  float dome = pawnsEll(q, vec2(0.0, 0.027), vec2(R * 0.72, 0.017));
  float stem = pawnsCone2(q, 0.03, 0.085, R * 0.40, 0.008);
  d = min(d, smin(dome, stem, 0.014));
  d = min(d, pawnsDisc(q, 0.086, 0.021, 0.004));
  d = min(d, length(q - vec2(0.0, 0.110)) - 0.0195);
  return d;
}
// is there a pawn on the square (rank i, file j)?
bool pawnsWho(float i, float j) {
  if (i > 2.5 && i < 3.5 && j > 3.5 && j < 4.5) return true;        // the pawn on e4
  if (i > 0.5 && i < 1.5 && j > 3.5 && j < 4.5) return false;       // has left e2
  return i < 1.5 || i > 5.5;
}
// the pawn nearest to board-space point b
float pawnsMen(vec3 b, out float white, out float feltD) {
  float i = clamp(floor(b.x / pawnsQ) + 4.0, 0.0, 7.0), j = clamp(floor(b.z / pawnsQ) + 4.0, 0.0, 7.0);
  vec2 f = b.xz - (vec2(i, j) - 3.5) * pawnsQ;
  // distance to the walls of this square (the outer squares have no outer wall): no other pawn is nearer than that
  float wx = i < 0.5 ? 0.5 * pawnsQ - f.x : i > 6.5 ? 0.5 * pawnsQ + f.x : 0.5 * pawnsQ - abs(f.x);
  float wz = j < 0.5 ? 0.5 * pawnsQ - f.y : j > 6.5 ? 0.5 * pawnsQ + f.y : 0.5 * pawnsQ - abs(f.y);
  float cap = min(wx, wz) + 0.009;
  white = i < 3.5 ? 1.0 : 0.0; feltD = cap;
  if (!pawnsWho(i, j)) {
    // the empty middle of the board: step straight to the nearest occupied rank, or to the pawn on e4
    if (i > 1.5 && i < 5.5) cap = min(2.0 * pawnsQ - abs(b.x), sdBox2(b.xz - vec2(-0.5, 0.5) * pawnsQ, vec2(0.5 * pawnsQ))) + 0.009;
    return max(cap, b.y - 0.19);
  }
  vec2 h = hash2(vec2(i, j) + 3.7);
  vec3 l = vec3(f.x - (h.x - 0.5) * 0.005, b.y, f.y - (h.y - 0.5) * 0.005) / pawnsK;
  feltD = min(cap, pawnsK * sdCyl(l - vec3(0.0, 0.0022, 0.0), 0.028, 0.0022));
  return max(min(pawnsK * pawnsPawn(l), cap), b.y - 0.19);
}
void mGift(vec3 p, inout float d) {
  float bb = length(p - vec3(0.0, 0.26, -0.03)) - 0.80;
  if (bb > 0.15) { d = min(d, bb); return; }
  vec3 u = p; u.xz = rot(pawnsYaw) * u.xz;
  // the storage box the board leans on
  add(d, sdRBox(u - vec3(0.0, 0.1135, -0.14), vec3(0.42, 0.1135, 0.12), 0.006), 104.0);
  vec3 b = pawnsLocal(p);
  // the board: a slab with a bevelled top edge
  float e = sdBox2(b.xz, vec2(0.5 * pawnsS - 0.012)) - 0.012;
  float slab = sdBox2(vec2(e + 1.0, b.y + 0.5 * pawnsTh), vec2(1.0 - 0.004, 0.5 * pawnsTh - 0.004)) - 0.004;
  slab = smax(slab, (e + b.y + 0.011) * 0.7071, 0.004);
  add(d, slab, 100.0);
  float white, feltD; float men = pawnsMen(b, white, feltD);
  add(d, men, white > 0.5 ? 101.0 : 102.0);
  add(d, feltD, 103.0);
}
bool shGift(float id, vec3 p, inout vec3 n, inout Mat m) {
  if (id < 100.0 || id >= 105.0) return false;
  vec3 b = pawnsLocal(p);
  if (id < 100.5) {
    float fx = max(abs(b.x), abs(b.z)), field = 4.0 * pawnsQ;
    if (fx < field && b.y > -0.006) {
      // inlaid squares: maple and walnut veneer, each cut from a different part of the sheet
      vec2 c = floor(b.xz / pawnsQ); float dark = mod(c.x + c.y, 2.0) < 0.5 ? 1.0 : 0.0;
      vec3 wp = b + vec3(hash1(c) * 5.0, hash1(c + 4.3) * 3.0, hash1(c + 9.1) * 5.0);
      matWood(m, n, wp * 1.5, vec3(1.0, 0.0, 0.3 * (hash1(c + 2.2) - 0.5)), dark > 0.5 ? 0.88 : 0.0, 0.9);
      if (dark < 0.5) m.col = m.col * vec3(1.20, 1.22, 1.22); else m.col *= 0.85;
      vec2 eg = 0.5 - abs(fract(b.xz / pawnsQ) - 0.5);
      m.col *= 0.55 + 0.45 * smoothstep(0.0, 0.012, min(eg.x, eg.y));                      // hairline joints
    } else {
      // frame: four mitred lengths of dark walnut, with a boxwood and ebony stringing line round the field
      bool sideX = abs(b.x) > abs(b.z);
      matWood(m, n, b * 1.3 + (sideX ? 3.0 : 7.0), sideX ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0), 0.93, 0.9);
      m.col *= 0.55 + 0.45 * smoothstep(0.0, 0.0016, abs(abs(b.x) - abs(b.z)));              // mitre joints
      if (b.y > -0.006) {
        float s = fx - field;
        if (s < 0.0045) m.col = srgb(0.86, 0.72, 0.45) * (0.85 + 0.3 * noise(b * 300.0));
        else if (s < 0.0075) m.col = srgb(0.05, 0.04, 0.035);
      }
    }
    m.col *= 0.35 + 0.65 * smoothstep(0.0008, 0.0026, abs(b.x));                               // the board folds in half here
    return true;
  }
  if (id < 102.5) {
    // the pawns: lathe-turned, grain running up the piece, satin lacquer
    float i = clamp(floor(b.x / pawnsQ) + 4.0, 0.0, 7.0), j = clamp(floor(b.z / pawnsQ) + 4.0, 0.0, 7.0);
    vec3 l = vec3(b.x - (i - 3.5) * pawnsQ, b.y, b.z - (j - 3.5) * pawnsQ) / pawnsK;
    vec3 wp = l * 0.2 + vec3(i * 1.7, j * 0.9, i * 0.6 + j * 2.3);
    if (id < 101.5) { matWood(m, n, wp, vec3(0.05, 1.0, 0.0), 0.06, 0.85); m.col = m.col * vec3(1.12, 1.0, 0.74); }
    else { matWood(m, n, wp, vec3(0.05, 1.0, 0.0), 1.0, 0.95); m.col *= vec3(0.30, 0.26, 0.27); }
    m.coatRough += 0.15; m.rough += 0.08; m.coat *= 0.7;
    return true;
  }
  if (id < 103.5) { matFelt(m, n, p, srgb(0.10, 0.30, 0.16)); return true; }
  // storage box: beech, finger-jointed at the corners
  vec3 u = p; u.xz = rot(pawnsYaw) * u.xz;
  bool endFace = abs(u.x) > 0.414;
  matWood(m, n, u * 1.2 + (endFace ? 5.0 : 0.0), endFace ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0), 0.22, 0.5);
  float finger = step(0.5, fract(u.y / 0.045)) * step(0.094, abs(u.z + 0.14)) * float(endFace);
  m.col *= 1.0 - 0.3 * finger;                                                                   // end grain of the finger joints
  m.col *= 0.5 + 0.5 * smoothstep(0.0, 0.0025, abs(u.y - 0.165));                                // where the lid meets the box
  return true;
}
