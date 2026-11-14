// Wooden chess set: an inlaid board propped up on the set's own storage box, with the 32 turned pieces standing on it
// (boxwood on the left, ebonised on the right, white has played e4). Material ids 100..104.
const float chessS = 0.90, chessTh = 0.038, chessQ = 0.1025, chessTilt = 0.50, chessYaw = 0.32, chessK = 1.09;
// world -> board space: x along the ranks (white at -x), y up from the playing surface, z along the files
vec3 chessLocal(vec3 p) {
  p.xz = rot(chessYaw) * p.xz;
  p.z -= 0.5 * chessS * cos(chessTilt);
  p.yz = rot(chessTilt) * p.yz;
  return p - vec3(0.0, chessTh, -0.5 * chessS);
}
// ---- lathe profiles: q = (distance from the axis, height) ----
float chessCone2(vec2 q, float y0, float y1, float r0, float r1) {
  float h = 0.5 * (y1 - y0); q.y -= 0.5 * (y0 + y1);
  vec2 k1 = vec2(r1, h), k2 = vec2(r1 - r0, 2.0 * h);
  vec2 ca = vec2(q.x - min(q.x, (q.y < 0.0) ? r0 : r1), abs(q.y) - h);
  vec2 cb = q - k1 + k2 * sat(dot(k1 - q, k2) / dot(k2, k2));
  float s = (cb.x < 0.0 && ca.y < 0.0) ? -1.0 : 1.0;
  return s * sqrt(min(dot(ca, ca), dot(cb, cb)));
}
float chessDisc(vec2 q, float y, float r, float h) { return sdBox2(q - vec2(0.0, y), vec2(r - h, 0.0)) - h; }   // a bullnose collar
float chessEll(vec2 q, vec2 c, vec2 r) { q -= c; float k0 = length(q / r), k1 = length(q / (r * r)); return k0 * (k0 - 1.0) / max(k1, 1e-6); }
// the foot every piece shares: plinth, step, a dome, and a stem that flares out of it
float chessFoot(vec2 q, float R, float top, float rt) {
  float d = sdBox2(q - vec2(0.0, 0.0125), vec2(R - 0.006, 0.0035)) - 0.006;
  d = min(d, chessDisc(q, 0.0245, R * 0.80, 0.0035));
  float dome = chessEll(q, vec2(0.0, 0.027), vec2(R * 0.72, 0.017));
  float stem = chessCone2(q, 0.03, top, R * 0.40, rt);
  return min(d, smin(dome, stem, 0.014));
}
float chessKnight(vec3 l) {
  vec2 q = vec2(length(l.xz), l.y); float R = 0.035;
  float d = sdBox2(q - vec2(0.0, 0.0125), vec2(R - 0.006, 0.0035)) - 0.006;
  d = min(d, chessDisc(q, 0.0245, R * 0.80, 0.0035));
  d = min(d, chessEll(q, vec2(0.0, 0.027), vec2(R * 0.74, 0.012)));
  vec3 s = vec3(l.x, l.y, l.z / 0.66);
  float h = sdCone(s, vec3(-0.004, 0.036, 0.0), vec3(-0.003, 0.120, 0.0), 0.027, 0.018);                 // neck
  h = smin(h, sdSphere(s - vec3(0.009, 0.058, 0.0), 0.021), 0.012);                                       // chest
  h = smin(h, sdCone(s, vec3(-0.004, 0.134, 0.0), vec3(0.024, 0.106, 0.0), 0.0190, 0.0115), 0.010);      // head and muzzle
  h = smax(h, -(length(s.xy - vec2(0.037, 0.076)) - 0.019), 0.008);                                       // throat
  vec3 e = vec3(s.x, s.y, abs(s.z));
  h = smin(h, sdCone(e, vec3(-0.008, 0.144, 0.009), vec3(-0.013, 0.172, 0.011), 0.0070, 0.0025), 0.004); // ears
  float mane = sdCapsule(s, vec3(-0.027, 0.05, 0.0), vec3(-0.022, 0.146, 0.0), 0.0075) + 0.0014 * sin(l.y * 420.0);
  h = smin(h, mane, 0.004);
  h = smax(h, -sdSphere(e - vec3(0.002, 0.133, 0.019), 0.0042), 0.002);                                   // eyes
  return min(d, h * 0.66);
}
// type: 0 pawn, 1 rook, 2 knight, 3 bishop, 4 queen, 5 king. l = position relative to the middle of the piece's felt
float chessPiece(vec3 l, int type) {
  vec2 q = vec2(length(l.xz), l.y); float d;
  if (type == 0) {
    d = chessFoot(q, 0.031, 0.085, 0.008);
    d = min(d, chessDisc(q, 0.086, 0.021, 0.004));
    d = min(d, length(q - vec2(0.0, 0.110)) - 0.0195);
  } else if (type == 1) {
    d = chessFoot(q, 0.035, 0.105, 0.017);
    d = min(d, chessDisc(q, 0.108, 0.029, 0.0045));
    float tower = chessCone2(q, 0.114, 0.150, 0.0225, 0.0265) - 0.002;
    float a = mod(atan(l.z, l.x), TAU / 6.0) - TAU / 12.0;
    float notch = max(abs(q.x * sin(a)) - 0.005, 0.137 - l.y);
    float cup = max(q.x - 0.018, 0.134 - l.y);
    tower = smax(tower, -min(notch, cup), 0.002);
    d = min(d, tower);
  } else if (type == 2) {
    d = chessKnight(l);
  } else if (type == 3) {
    d = chessFoot(q, 0.035, 0.118, 0.009);
    d = min(d, chessDisc(q, 0.119, 0.022, 0.0045));
    d = min(d, chessDisc(q, 0.129, 0.014, 0.003));
    float mitre = chessEll(q, vec2(0.0, 0.158), vec2(0.021, 0.030));
    vec3 s = l - vec3(0.0, 0.166, 0.0); s.xy = rot(0.75) * s.xy;
    mitre = smax(mitre, -max(abs(s.y) - 0.003, -s.x - 0.002), 0.0015);                                     // the slit
    d = min(d, mitre);
    d = min(d, length(q - vec2(0.0, 0.193)) - 0.0075);
  } else if (type == 4) {
    d = chessFoot(q, 0.0355, 0.140, 0.010);
    d = min(d, chessDisc(q, 0.142, 0.024, 0.0045));
    d = min(d, chessDisc(q, 0.152, 0.015, 0.003));
    d = min(d, chessCone2(q, 0.157, 0.193, 0.011, 0.024) - 0.002);
    float a = mod(atan(l.z, l.x), TAU / 8.0) - TAU / 16.0;
    d = min(d, length(vec3(q.x * cos(a) - 0.025, q.x * sin(a), l.y - 0.198)) - 0.006);                     // coronet points
    d = min(d, chessEll(q, vec2(0.0, 0.197), vec2(0.019, 0.013)));
    d = min(d, length(q - vec2(0.0, 0.215)) - 0.008);
  } else {
    d = chessFoot(q, 0.036, 0.150, 0.011);
    d = min(d, chessDisc(q, 0.152, 0.025, 0.0045));
    d = min(d, chessDisc(q, 0.162, 0.016, 0.003));
    d = min(d, chessCone2(q, 0.167, 0.203, 0.012, 0.026) - 0.002);
    d = min(d, chessEll(q, vec2(0.0, 0.205), vec2(0.024, 0.009)));
    d = min(d, sdRBox(l - vec3(0.0, 0.238, 0.0), vec3(0.0056, 0.028, 0.005), 0.002));                      // the cross
    d = min(d, sdRBox(l - vec3(0.0, 0.246, 0.0), vec3(0.017, 0.0056, 0.005), 0.002));
  }
  return d;
}
// who stands on the square (rank i, file j): returns the type, or -1 for nobody
int chessWho(float i, float j) {
  if (i > 2.5 && i < 3.5 && j > 3.5 && j < 4.5) return 0;       // the pawn on e4
  if (i > 0.5 && i < 1.5 && j > 3.5 && j < 4.5) return -1;      // has left e2
  if (i > 1.5 && i < 5.5) return -1;
  if (i > 0.5 && i < 6.5) return 0;
  float f = min(j, 7.0 - j);
  if (f < 0.5) return 1; if (f < 1.5) return 2; if (f < 2.5) return 3;
  return j < 3.5 ? 4 : 5;
}
// the piece nearest to board-space point b: returns its distance; l = position in the piece's own space
float chessMen(vec3 b, out float white, out float feltD) {
  float i = clamp(floor(b.x / chessQ) + 4.0, 0.0, 7.0), j = clamp(floor(b.z / chessQ) + 4.0, 0.0, 7.0);
  vec2 f = b.xz - (vec2(i, j) - 3.5) * chessQ;
  // distance to the walls of this square (the outer squares have no outer wall): no other piece is nearer than that
  float wx = i < 0.5 ? 0.5 * chessQ - f.x : i > 6.5 ? 0.5 * chessQ + f.x : 0.5 * chessQ - abs(f.x);
  float wz = j < 0.5 ? 0.5 * chessQ - f.y : j > 6.5 ? 0.5 * chessQ + f.y : 0.5 * chessQ - abs(f.y);
  float cap = min(wx, wz) + 0.009;
  white = i < 3.5 ? 1.0 : 0.0; feltD = cap;
  int type = chessWho(i, j);
  if (type < 0) {
    // the empty middle of the board: step straight to the nearest occupied rank, or to the pawn on e4
    if (i > 1.5 && i < 5.5) cap = min(2.0 * chessQ - abs(b.x), sdBox2(b.xz - vec2(-0.5, 0.5) * chessQ, vec2(0.5 * chessQ))) + 0.009;
    return max(cap, b.y - 0.30);
  }
  vec2 h = hash2(vec2(i, j) + 3.7);
  vec3 l = vec3(f.x - (h.x - 0.5) * 0.004, b.y, f.y - (h.y - 0.5) * 0.004);
  float ang = (h.x - 0.5) * 0.5 + (type == 2 ? 0.0 : h.y * 5.0);
  l.xz = rot(ang) * l.xz; l /= chessK;
  if (type == 2 && white < 0.5) l.x = -l.x;
  float R = type == 0 ? 0.031 : 0.035;
  feltD = min(cap, chessK * sdCyl(l - vec3(0.0, 0.0022, 0.0), R - 0.003, 0.0022));
  return max(min(chessK * chessPiece(l, type), cap), b.y - 0.30);
}
void mGift(vec3 p, inout float d) {
  float bb = length(p - vec3(0.0, 0.3, -0.05)) - 0.85;
  if (bb > 0.15) { d = min(d, bb); return; }
  vec3 u = p; u.xz = rot(chessYaw) * u.xz;
  // the storage box the board leans on
  add(d, sdRBox(u - vec3(0.0, 0.1135, -0.14), vec3(0.42, 0.1135, 0.12), 0.006), 104.0);
  vec3 b = chessLocal(p);
  // the board: a slab with a bevelled top edge
  float e = sdBox2(b.xz, vec2(0.5 * chessS - 0.012)) - 0.012;
  float slab = sdBox2(vec2(e + 1.0, b.y + 0.5 * chessTh), vec2(1.0 - 0.004, 0.5 * chessTh - 0.004)) - 0.004;
  slab = smax(slab, (e + b.y + 0.011) * 0.7071, 0.004);
  add(d, slab, 100.0);
  float white, feltD; float men = chessMen(b, white, feltD);
  add(d, men, white > 0.5 ? 101.0 : 102.0);
  add(d, feltD, 103.0);
}
bool shGift(float id, vec3 p, inout vec3 n, inout Mat m) {
  if (id < 100.0 || id >= 105.0) return false;
  vec3 b = chessLocal(p);
  if (id < 100.5) {
    float fx = max(abs(b.x), abs(b.z)), field = 4.0 * chessQ;
    if (fx < field && b.y > -0.006) {
      // inlaid squares: maple and walnut veneer, each cut from a different part of the sheet
      vec2 c = floor(b.xz / chessQ); float dark = mod(c.x + c.y, 2.0) < 0.5 ? 1.0 : 0.0;
      vec3 wp = b + vec3(hash1(c) * 5.0, hash1(c + 4.3) * 3.0, hash1(c + 9.1) * 5.0);
      matWood(m, n, wp * 1.5, vec3(1.0, 0.0, 0.3 * (hash1(c + 2.2) - 0.5)), dark > 0.5 ? 0.88 : 0.0, 0.9);
      if (dark < 0.5) m.col = m.col * vec3(1.20, 1.22, 1.22); else m.col *= 0.85;
      vec2 eg = 0.5 - abs(fract(b.xz / chessQ) - 0.5);
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
    // the men: lathe-turned, grain running up the piece, lacquered
    float i = clamp(floor(b.x / chessQ) + 4.0, 0.0, 7.0), j = clamp(floor(b.z / chessQ) + 4.0, 0.0, 7.0);
    vec3 l = vec3(b.x - (i - 3.5) * chessQ, b.y, b.z - (j - 3.5) * chessQ) / chessK;
    vec3 wp = l * 0.2 + vec3(i * 1.7, j * 0.9, i * 0.6 + j * 2.3);
    if (id < 101.5) { matWood(m, n, wp, vec3(0.05, 1.0, 0.0), 0.06, 0.85); m.col = m.col * vec3(1.12, 1.0, 0.74); }
    else { matWood(m, n, wp, vec3(0.05, 1.0, 0.0), 1.0, 0.95); m.col *= vec3(0.30, 0.26, 0.27); }
    m.coatRough += 0.15; m.rough += 0.08; m.coat *= 0.7;                                                                      // a satin lacquer, not a mirror
    return true;
  }
  if (id < 103.5) { matFelt(m, n, p, srgb(0.10, 0.30, 0.16)); return true; }
  // storage box: beech, finger-jointed at the corners
  vec3 u = p; u.xz = rot(chessYaw) * u.xz;
  bool endFace = abs(u.x) > 0.414;
  matWood(m, n, u * 1.2 + (endFace ? 5.0 : 0.0), endFace ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0), 0.22, 0.5);
  float finger = step(0.5, fract(u.y / 0.045)) * step(0.094, abs(u.z + 0.14)) * float(endFace);
  m.col *= 1.0 - 0.3 * finger;                                                                   // end grain of the finger joints
  m.col *= 0.5 + 0.5 * smoothstep(0.0, 0.0025, abs(u.y - 0.165));                                // where the lid meets the box
  return true;
}
