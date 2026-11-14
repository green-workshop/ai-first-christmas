// A pair of classic leather football boots, size 4: black calf leather, two white stripes, white moulded sole with red studs.
// One stands side-on, laced; its twin is propped on its heel behind to show the studs.
// Material ids: 100..106 the standing boot, 120..126 the propped boot
// (+0 leather upper, +1 sole plate, +2 studs, +3 tongue, +4 laces, +5 eyelets).
const float BOOTS_S = 1.30;

// outline of the sole seen from above (x along the foot, toe at +x; y here is the boot's z)
float bootsPlan(vec2 p) {
  p.y += 0.022 * smoothstep(-0.10, 0.32, p.x);                                   // the forefoot swings in towards the big toe
  float h1 = sat((p.x + 0.285) / 0.235), h2 = sat((p.x + 0.05) / 0.25);
  float d = length(p - vec2(mix(-0.285, -0.05, h1), 0.0)) - mix(0.108, 0.098, h1);
  d = smin(d, length(p - vec2(mix(-0.05, 0.20, h2), 0.0)) - mix(0.098, 0.135, h2), 0.03);
  return smin(d, length(p - vec2(0.292, 0.006)) - 0.106, 0.06);
}
// height of the top line of the upper along the foot
float bootsTop(float x) {
  float a = (x + 0.21) / 0.085;
  return 0.108 + 0.132 * (1.0 - smoothstep(-0.10, 0.36, x)) - 0.03 * exp(-a * a) + 0.024 * (1.0 - smoothstep(-0.40, -0.30, x));
}
// where the panels of the upper meet: s1 toe cap, s2 heel counter, e2 lace stay, sb the two side stripes (all negative inside)
void bootsSeams(vec3 p, out float s1, out float s2, out float e2, out float sb) {
  s1 = (0.250 - 1.9 * p.z * p.z) - p.x;
  s2 = p.x + 0.262 - 0.24 * (p.y - 0.06);
  e2 = sdSeg2(p.xz, vec2(-0.30, 0.0), vec2(0.150, 0.0)) - 0.062;
  float st = p.x - 0.62 * (p.y - 0.06);
  sb = min(abs(st + 0.150) - 0.019, abs(st + 0.058) - 0.019);
  sb = max(sb, max(0.006 - e2, 0.070 - p.y));
}
float bootsHole(vec3 p) { return sdEllipsoid(p - vec3(-0.205, 0.33, 0.0), vec3(0.135, 0.21, 0.066)); }
void bootsAdd(inout float d, inout float part, float x, float id) { if (x < d) { d = x; part = id; } }
float bootsLoop(vec3 q, vec3 nrm, float R) {
  q.x /= 0.62; float h = dot(q, nrm); float r = length(q - h * nrm) - R;
  return (length(vec2(r, h)) - 0.0048) * 0.62;
}
// one boot in its own space: standing on its studs on y = 0, heel at x = -0.4, toe at x = +0.4. Returns the distance and which part is nearest.
float bootsSd(vec3 p, out float part) {
  part = 0.0;
  float tsp = sat((p.x - 0.12) / 0.28); p.y -= 0.03 * tsp * tsp;               // toe spring
  float pl = bootsPlan(p.xz);
  // ---- upper: a dome over the sole outline, boxy at toe and heel
  float y0 = 0.060, top = bootsTop(p.x), H = top - y0, W = 0.115;
  vec2 k = vec2(max(pl + W, 0.0) / W, max(p.y - y0, 0.0) / H);
  float up = (pow(pow(k.x, 2.7) + pow(k.y, 2.7), 0.37) - 1.0) * min(W, H);
  float s1, s2, e2, sb; bootsSeams(p, s1, s2, e2, sb);
  if (up < 0.03) {
    up -= 0.0030 * (1.0 - smoothstep(-0.002, 0.002, s1));                        // toe cap laid over the vamp
    up -= 0.0030 * (1.0 - smoothstep(-0.002, 0.002, s2));                        // heel counter
    up -= 0.0035 * (1.0 - smoothstep(-0.002, 0.002, e2));                        // lace stay
    up -= 0.0022 * (1.0 - smoothstep(-0.0015, 0.0015, sb));                      // stripes
    up += 0.0022 * sin(p.x * 135.0 + 22.0 * abs(p.z) + 3.0 * sin(p.z * 40.0)) * smoothstep(0.05, 0.11, p.x) * (1.0 - smoothstep(0.17, 0.23, p.x)) * smoothstep(0.3, 0.8, k.y);   // creases where the foot bends
    up += 0.0015 * (fbm3(p * 28.0) - 0.5);
  }
  up = smax(up, y0 - p.y, 0.012);
  float hole = bootsHole(p);
  up = smax(up, -hole, 0.026);                                                   // padded collar round the opening
  float gapw = 0.020 + 0.012 * (1.0 - smoothstep(-0.05, 0.16, p.x));
  float ch = sdSeg2(p.xz, vec2(-0.25, 0.0), vec2(0.150, 0.0)) - gapw;
  up = smax(up, -max(ch, top - 0.024 - p.y), 0.006);                             // the lacing gap
  float d = up;
  // ---- sole plate and moulded studs
  float sb0 = p.y - 0.12;
  if (sb0 < 0.03) {
    float plate = extrudeR(pl - 0.006, p.y - 0.051, 0.013, 0.006);
    float ribs = (1.0 - smoothstep(0.0, 0.5, abs(fract(pl * 42.0) - 0.5) * 2.0)) * step(pl, -0.014) * step(p.y, 0.05);
    plate += 0.0022 * ribs;                                                      // moulded contour ribs under the sole
    float zz = p.z + 0.022 * smoothstep(-0.10, 0.32, p.x), az = abs(zz);
    vec3 sp = vec3(p.x, p.y - 0.021, az);
    float stud = sdCapCone(sp - vec3(-0.325, 0.0, 0.050), 0.021, 0.0115, 0.019);
    stud = min(stud, sdCapCone(sp - vec3(-0.215, 0.0, 0.064), 0.021, 0.0115, 0.019));
    stud = min(stud, sdCapCone(sp - vec3(0.070, 0.0, 0.078), 0.021, 0.0115, 0.019));
    stud = min(stud, sdCapCone(sp - vec3(0.190, 0.0, 0.098), 0.021, 0.0115, 0.019));
    stud = min(stud, sdCapCone(sp - vec3(0.300, 0.0, 0.052), 0.021, 0.0115, 0.019));
    stud -= 0.003;
    float both = smin(plate, stud, 0.012);
    bootsAdd(d, part, both, stud < plate ? 2.0 : 1.0);
  } else d = min(d, sb0);
  // ---- tongue, laces, eyelets
  float lb = sdBox(p - vec3(0.02, 0.22, 0.0), vec3(0.20, 0.12, 0.14));
  if (lb < 0.03) {
    vec2 A = vec2(0.155, 0.151), M = vec2(0.05, 0.194), B = vec2(-0.07, 0.224), C = vec2(-0.118, 0.292);
    float t2 = min(min(sdSeg2(p.xy, A, M), sdSeg2(p.xy, M, B)), sdSeg2(p.xy, B, C)) - 0.010;
    float tongue = extrudeR(t2, p.z, 0.050 + 0.008 * smoothstep(0.22, 0.30, p.y), 0.009);
    tongue += 0.0015 * sin(p.x * 150.0) * step(p.y, 0.24);                       // padding ribs
    bootsAdd(d, part, tongue, 3.0);
    float ty = p.y - (top - 0.004);
    float s = (0.150 - p.x) / 0.047, f = fract(s), zig = 0.046 * (1.0 - 2.0 * f);
    float dA = abs(p.z - zig) * 0.47, dB = abs(p.z + zig) * 0.47;
    float lace = min(sdBox2(vec2(dA, ty - 0.005 - 0.006 * sin(f * PI)), vec2(0.0075, 0.0026)), sdBox2(vec2(dB, ty - 0.005), vec2(0.0075, 0.0026))) - 0.002;
    lace = max(lace, max(max(-s, s - 4.0) * 0.047, abs(p.z) - 0.049));
    lace = min(lace, sdBox(vec3(p.x - 0.152, ty - 0.005, p.z), vec3(0.0075, 0.0026, 0.046)) - 0.002);
    // the bow: a knot, two loops flopped over the sides, two ends hanging down
    vec3 K = vec3(-0.045, 0.247, 0.0);
    lace = min(lace, sdEllipsoid(p - K, vec3(0.013, 0.010, 0.016)));
    lace = min(lace, bootsLoop(p - K - vec3(-0.004, -0.022, 0.046), normalize(vec3(0.25, 0.62, 0.74)), 0.052));
    lace = min(lace, bootsLoop(p - K - vec3(0.004, -0.020, -0.044), normalize(vec3(-0.2, 0.66, -0.72)), 0.048));
    lace = min(lace, min(sdCapsule(p, K, vec3(-0.012, 0.212, 0.060), 0.0048), min(sdCapsule(p, vec3(-0.012, 0.212, 0.060), vec3(0.012, 0.158, 0.103), 0.0048), sdCapsule(p, vec3(0.012, 0.158, 0.103), vec3(0.030, 0.098, 0.121), 0.0048))));
    lace = min(lace, min(sdCapsule(p, K, vec3(-0.030, 0.214, -0.058), 0.0048), sdCapsule(p, vec3(-0.030, 0.214, -0.058), vec3(-0.022, 0.150, -0.104), 0.0048)));
    bootsAdd(d, part, lace, 4.0);
    float xr = repLim(p.x - 0.150, 0.047, -4.0, 0.0);
    bootsAdd(d, part, sdTorus(vec3(xr, ty - 0.001, abs(p.z) - 0.047), 0.0085, 0.0028), 5.0);
  } else d = min(d, lb);
  return d;
}
vec3 bootsLocal(vec3 p, float which) {
  vec3 q;
  if (which < 0.5) { q = p - vec3(0.05, 0.0, 0.15); q.xz = rot(0.24) * q.xz; }
  else {
    q = p - vec3(-0.27, 0.0, -0.07); q.xy = rot(-0.09) * q.xy; q.yz = rot(-0.07) * q.yz; q.xz = rot(-0.20) * q.xz;
    q = vec3(q.y - 0.395 * BOOTS_S, -q.z, q.x);
  }
  return q / BOOTS_S;
}
void mGift(vec3 p, inout float d) {
  float bb = length(p - vec3(0.0, 0.48, -0.05)) - 0.88;
  if (bb > 0.15) { d = min(d, bb); return; }
  for (int i = 0; i < 2; i++) {
    vec3 q = bootsLocal(p, float(i));
    float b = length(q - vec3(0.0, 0.14, 0.0)) - 0.45;
    if (b > 0.08) { d = min(d, b * BOOTS_S); continue; }
    float part; float f = bootsSd(q, part) * BOOTS_S * 0.75;
    add(d, f, 100.0 + 20.0 * float(i) + part);
  }
}
bool shGift(float id, vec3 pw, inout vec3 n, inout Mat m) {
  if (id < 100.0 || id >= 140.0) return false;
  float which = id >= 119.5 ? 1.0 : 0.0, part = id - 100.0 - 20.0 * which;
  vec3 p = bootsLocal(pw, which);
  float tsp = sat((p.x - 0.12) / 0.28); p.y -= 0.03 * tsp * tsp;
  vec3 white = srgb(0.90, 0.89, 0.85), red = srgb(0.74, 0.07, 0.06), black = srgb(0.085, 0.082, 0.085);
  if (part < 0.5) {
    float s1, s2, e2, sb; bootsSeams(p, s1, s2, e2, sb);
    float hole = bootsHole(p);
    if (hole < 0.004) { matFelt(m, n, p, srgb(0.62, 0.46, 0.30)); return true; }               // suede lining
    vec3 col = black; float gloss = 0.75;
    if (sb < 0.0) { col = white; gloss = 0.5; }
    if (p.x < -0.325 && p.y > 0.178) { col = abs(p.y - 0.218) < 0.008 ? red : white; gloss = 0.5; }   // heel tab
    vec3 n0 = n; matLeather(m, n, p * 2.6, col, gloss); n = normalize(mix(n0, n, 0.22));          // fine calf grain, not hide
    m.col = col * (0.82 + 0.18 * smoothstep(0.0, 0.5, voronoi(p * 180.0).x)) * (0.9 + 0.2 * fbm3(p * 9.0));
    // rows of stitching beside every seam
    float dash = step(fract((p.y + abs(p.z)) * 105.0), 0.62), dashx = step(fract(p.x * 105.0), 0.62);
    float th = 0.0;
    th = max(th, (1.0 - smoothstep(0.0008, 0.0016, min(abs(s1 + 0.006), abs(s1 + 0.011)))) * dash);
    th = max(th, (1.0 - smoothstep(0.0008, 0.0016, abs(s2 + 0.006))) * dash * step(hole, 1.0) * step(0.03, hole));
    th = max(th, (1.0 - smoothstep(0.0008, 0.0016, min(abs(e2 + 0.006), abs(e2 + 0.011)))) * (abs(p.z) > 0.03 && p.x < 0.14 ? dashx : dash));
    th = max(th, (1.0 - smoothstep(0.0008, 0.0016, abs(sb + 0.005))) * dash);
    th = max(th, (1.0 - smoothstep(0.0008, 0.0016, abs(hole - 0.034))) * dashx * step(0.15, p.y));
    if (th > 0.0) { vec3 thread = sb < 0.0 ? srgb(0.25, 0.25, 0.27) : srgb(0.80, 0.80, 0.76); m.col = mix(m.col, thread, th); m.rough = mix(m.rough, 0.85, th); m.coat *= 1.0 - th; }
    return true;
  }
  if (part < 1.5) {
    float pl = bootsPlan(p.xz);
    vec3 col = white;
    if (p.y < 0.046) {
      float inlay = length(vec2((p.x + 0.07) / 0.115, p.z / 0.045)) - 1.0;                       // red shank inlay under the arch
      if (inlay < 0.0) col = red;
      col *= 1.0 - 0.22 * (1.0 - smoothstep(0.0, 0.5, abs(fract(pl * 42.0) - 0.5) * 2.0)) * step(pl, -0.014);     // dirt sits in the moulded ribs
      col *= 1.0 - 0.16 * smoothstep(0.45, 0.75, fbm3(p * 9.0));                                    // scuffs from the pitch
    }
    matPlastic(m, n, p, col, 0.55);
    return true;
  }
  if (part < 2.5) { matPlastic(m, n, p, mix(red, red * 0.45 + 0.03, 1.0 - smoothstep(0.002, 0.008, p.y)), 0.5); m.rough += 0.25 * (1.0 - smoothstep(0.002, 0.008, p.y)); return true; }
  if (part < 3.5) {
    vec3 col = srgb(0.11, 0.11, 0.12);
    float lab = sdBox2(vec2(p.z, p.y - 0.262), vec2(0.026, 0.014));
    if (lab < 0.0) col = lab > -0.004 ? white : red;                                             // woven label
    vec3 n0 = n; matLeather(m, n, p * 2.6, col, 0.35); n = normalize(mix(n0, n, 0.25));
    return true;
  }
  if (part < 4.5) { matCloth(m, n, p, vec2(p.x + p.z, p.y + 0.3 * p.z) * 1.6, white, 0.3); m.sheen = 0.2; return true; }
  matMetal(m, n, p, 0, vec3(1.0, 0.0, 0.0));
  return true;
}
