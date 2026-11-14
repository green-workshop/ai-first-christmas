// A red kite (the bird of prey) perched on a fence post, side-on with the breast turned a little to the camera. Material ids 100..107.
// Spaces: q = the set turned about y; b = the bird's body laid flat (x toward the tail, y toward its back, z sideways); h = the head.
#define BIRD_SC 1.25
#define BIRD_YAW -0.35
vec3 birdQ(vec3 p) { p.x += 0.045; p /= BIRD_SC; p.xz = rot(BIRD_YAW) * p.xz; return p; }
const vec3 BIRD_C = vec3(-0.03, 0.61, 0.0);
const vec2 BIRD_AX = vec2(0.669, -0.743);          // the body's axis in q, pointing to the tail
vec3 birdB(vec3 q) { vec3 r = q - BIRD_C; return vec3(dot(r.xy, BIRD_AX), dot(r.xy, vec2(0.743, 0.669)), r.z); }
vec3 birdH(vec3 q) { vec3 h = q - vec3(-0.225, 0.88, 0.0); h.xz = rot(-0.30) * h.xz; h.xy = rot(0.10) * h.xy; return h; }
const vec3 BIRD_EYE = vec3(-0.05, 0.012, 0.061);
const vec3 BIRD_FOOT = vec3(-0.07, 0.26, 0.052);
// Overlapping feathers lying along +u, one per unit cell, alternate rows shifted half a cell.
// Returns the height (0 at the root .. 1 at the free tip). s = along the feather, t = across (-1..1),
// rim = 0 at the free edge of a tip .. 1 inside, shade = shadow cast by the tip above, fid = a random number per feather.
float birdFeather(vec2 uv, out float s, out float t, out float rim, out float shade, out float fid) {
  float r = floor(uv.x), ro = r - 1.0;
  float va = uv.y + 0.5 * mod(ro, 2.0), vb = uv.y + 0.5 * mod(r, 2.0);
  vec2 fa = vec2(uv.x - ro, fract(va) - 0.5), fb = vec2(uv.x - r, fract(vb) - 0.5);
  float e = sqrt((fa.x - 1.0) * (fa.x - 1.0) + 4.0 * fa.y * fa.y);        // under 1 inside the rounded tip of the feather above
  if (e < 1.0) { s = fa.x * 0.5; t = fa.y * 2.0; rim = 1.0 - e; shade = 0.0; fid = hash1(vec2(ro, floor(va)) + 0.37); }
  else { s = fb.x * 0.5; t = fb.y * 2.0; rim = 1.0; shade = 1.0 - smoothstep(0.0, 0.3, e - 1.0); fid = hash1(vec2(r, floor(vb)) + 0.37); }
  return s - 0.12 * t * t;
}
vec2 birdBodyUV(vec3 b) { return vec2(b.x / 0.05, atan(b.z, -b.y) * 16.0 / TAU); }
// feathers grow longer toward the wing tip: small coverts at the shoulder, long primaries at the end
vec2 birdWingUV(vec3 b) { return vec2(5.5 * log(1.0 + 6.0 * max(b.x + 0.2, 0.0)), (b.y - 0.045 + 0.25 * (abs(b.z) - 0.1)) / 0.037); }
float birdBody(vec3 q, vec3 b, vec3 h) {
  float d = sdEllipsoid(b, vec3(0.25, 0.14, 0.13));
  d = smin(d, sdEllipsoid(b - vec3(-0.09, -0.035, 0.0), vec3(0.16, 0.135, 0.125)), 0.06);          // full breast
  d = smin(d, sdCone(q, vec3(-0.12, 0.75, 0.0), vec3(-0.215, 0.87, 0.0), 0.105, 0.07), 0.05);       // neck
  vec3 qs = vec3(q.xy, abs(q.z));
  d = smin(d, sdEllipsoid(qs - vec3(-0.072, 0.415, 0.055), vec3(0.06, 0.095, 0.055)), 0.04);        // feathered thighs
  vec3 hs = vec3(h.xy, abs(h.z));
  float hd = sdEllipsoid(h, vec3(0.092, 0.069, 0.074));
  hd = smin(hd, sdEllipsoid(hs - vec3(-0.045, 0.036, 0.046), vec3(0.046, 0.014, 0.026)), 0.02);     // brow ridge: the hawk's frown
  return smin(d, hd, 0.04);
}
float birdWing(vec3 b) {
  vec3 w = vec3(b.xy, abs(b.z));
  float d = sdEllipsoid(w - vec3(0.03, 0.045, 0.105), vec3(0.21, 0.12, 0.042));
  return smin(d, sdEllipsoid(w - vec3(0.33, 0.066, 0.062), vec3(0.27, 0.05, 0.022)), 0.04);
}
// tail: a long flat fan, deeply forked, twisted a little toward the camera. tw = (across / half-width, height above the plane)
float birdTail(vec3 b, out vec2 tw) {
  float cs = cos(0.9), sn = sin(0.9);
  float yt = b.y * cs + b.z * sn, w = -b.y * sn + b.z * cs;
  float hw = mix(0.045, 0.105, sat((b.x - 0.2) / 0.55));
  float v = w / hw, av = abs(v);
  float lobe = abs(fract(min(av, 0.999) * 3.0) - 0.5) * 2.0;
  float tipx = 0.76 - 0.14 * (1.0 - sat(av)) - 0.014 * lobe * lobe;
  float d2 = max(max(abs(w) - hw, b.x - tipx), 0.16 - b.x);
  yt += 0.012 * av * av - 0.004;                                                // slight camber
  tw = vec2(v, yt);
  vec2 dd = vec2(d2 + 0.004, abs(yt) - 0.0015);
  return (min(max(dd.x, dd.y), 0.0) + length(max(dd, 0.0)) - 0.004) * 0.6;
}
float birdFeet(vec3 q, out float talon) {
  vec3 qs = vec3(q.xy, abs(q.z)), F = BIRD_FOOT, K = F + vec3(0.0, 0.012, 0.0);
  float d = sdCone(qs, K, vec3(-0.07, 0.35, 0.056), 0.012, 0.015);                                // scaly shank
  vec3 t0 = F + vec3(-0.078, 0.010, 0.002), t1 = F + vec3(-0.062, 0.010, 0.042), t2 = F + vec3(-0.064, 0.010, -0.034), t3 = F + vec3(0.052, 0.010, 0.004);
  d = smin(d, sdCapsule(qs, K, t0, 0.0105), 0.008); d = smin(d, sdCapsule(qs, K, t1, 0.0105), 0.008);
  d = smin(d, sdCapsule(qs, K, t2, 0.0105), 0.008); d = smin(d, sdCapsule(qs, K, t3, 0.0105), 0.008);
  d += 0.0015 * sin(length(qs - K) * 420.0);                                                       // scutes across the toes
  talon = sdCone(qs, t0, t0 + vec3(-0.026, -0.024, 0.0), 0.0085, 0.002);
  talon = min(talon, sdCone(qs, t1, t1 + vec3(-0.02, -0.024, 0.014), 0.0085, 0.002));
  talon = min(talon, sdCone(qs, t2, t2 + vec3(-0.02, -0.024, -0.012), 0.0085, 0.002));
  talon = min(talon, sdCone(qs, t3, t3 + vec3(0.024, -0.022, 0.0), 0.0085, 0.002));
  return d;
}
void mGift(vec3 p, inout float d) {
  float bb = length(p - vec3(0, 0.6, 0)) - 0.82;
  if (bb > 0.15) { d = min(d, bb); return; }
  vec3 q = birdQ(p), b = birdB(q), h = birdH(q);
  float s, t, rim, sh, fid;
  // plumage of body and head
  float f = birdBody(q, b, h);
  if (f < 0.04) {
    float ht = birdFeather(birdBodyUV(b), s, t, rim, sh, fid);
    float head = 1.0 - smoothstep(-0.30, -0.18, b.x);
    float fine = noise(vec3(b.x * 60.0, b.y * 190.0, b.z * 190.0)) - 0.5;
    f -= mix(0.009 * (ht - 0.5), 0.0, head) + 0.004 * fine;
  } else f -= 0.012;
  add(d, f * BIRD_SC * 0.85, 100.0);
  // folded wings
  float w = birdWing(b);
  if (w < 0.04) {
    float ht = birdFeather(birdWingUV(b), s, t, rim, sh, fid);
    w -= 0.011 * (ht - 0.5) * smoothstep(-0.2, 0.1, b.x) + 0.003 * (noise(vec3(b.x * 50.0, b.y * 200.0, b.z * 200.0)) - 0.5);
  } else w -= 0.012;
  add(d, w * BIRD_SC * 0.8, 101.0);
  vec2 tw; add(d, birdTail(b, tw) * BIRD_SC, 102.0);
  // beak: yellow cere, hooked tip
  float hb = length(h - vec3(-0.07, 0.0, 0.0)) - 0.14;
  if (hb > 0.05) d = min(d, hb * BIRD_SC);
  else {
    vec3 hz = vec3(h.xy, h.z * 1.35), hs = vec3(h.xy, abs(h.z));
    float bk = sdCone(hz, vec3(-0.055, -0.002, 0.0), vec3(-0.132, -0.013, 0.0), 0.04, 0.025);
    bk = smin(bk, sdCone(hz, vec3(-0.132, -0.013, 0.0), vec3(-0.160, -0.066, 0.0), 0.024, 0.005), 0.014);
    bk = smax(bk, -(h.y + 0.036 + 0.12 * (h.x + 0.06)), 0.006);                                    // the cutting edge of the upper bill
    float lo = sdCone(hz, vec3(-0.058, -0.04, 0.0), vec3(-0.132, -0.043, 0.0), 0.02, 0.008);
    add(d, min(bk, lo) * 0.74 * BIRD_SC, 103.0);
    add(d, sdSphere(hs - BIRD_EYE, 0.0165) * BIRD_SC, 104.0);
  }
  // feet and post
  float pb = length(q - vec3(-0.065, 0.15, 0.0)) - 0.27;
  if (pb > 0.05) d = min(d, pb * BIRD_SC);
  else {
    float talon; float ft = birdFeet(q, talon);
    add(d, ft * 0.9 * BIRD_SC, 105.0); add(d, talon * BIRD_SC, 106.0);
    vec3 r = q - vec3(-0.065, 0.0, 0.0);
    float post = sdRCyl(r - vec3(0.0, 0.125, 0.0), 0.105, 0.133, 0.012);
    float side = smoothstep(0.0, 0.02, 0.25 - r.y);
    post -= side * 0.02 * (fbm3(vec3(r.x * 24.0, r.y * 3.0, r.z * 24.0)) - 0.5);
    add(d, post * 0.8 * BIRD_SC, 107.0);
  }
}
bool shGift(float id, vec3 p, inout vec3 n, inout Mat m) {
  if (id < 100.0 || id >= 110.0) return false;
  vec3 q = birdQ(p), b = birdB(q), h = birdH(q);
  vec3 tu = vec3(BIRD_AX, 0.0); tu.xz = rot(-BIRD_YAW) * tu.xz;        // the way the feathers lie, in the world
  float s, t, rim, sh, fid;
  vec3 dark = srgb(0.085, 0.06, 0.045);
  if (id < 100.5) {
    birdFeather(birdBodyUV(b), s, t, rim, sh, fid);
    float head = 1.0 - smoothstep(-0.31, -0.17, b.x + 0.04 * (noise(q * 40.0) - 0.5));
    vec3 c = srgb(0.63, 0.29, 0.105) * mix(0.8, 1.2, fid);
    c = mix(c, srgb(0.83, 0.55, 0.30), 1.0 - smoothstep(0.0, 0.4, rim));                     // paler fringe
    float shaft = (1.0 - smoothstep(0.04, 0.2, abs(t))) * smoothstep(0.15, 0.45, s);
    c = mix(c, dark, 0.85 * shaft) * (1.0 - 0.55 * sh);
    // head and neck: pale grey, finely streaked
    float st = noise(vec3(b.x * 38.0, b.y * 250.0, b.z * 250.0)) * 0.75 + 0.25 * noise(vec3(b.x * 14.0, b.y * 60.0, b.z * 60.0));
    vec3 hc = mix(srgb(0.86, 0.84, 0.79), srgb(0.22, 0.18, 0.15), smoothstep(0.52, 0.68, st));
    vec3 hs = vec3(h.xy, abs(h.z));
    hc = mix(hc, srgb(0.16, 0.13, 0.11), 1.0 - smoothstep(0.017, 0.028, length(hs - BIRD_EYE)));  // dark rim of the eye
    c = mix(c, hc, head);
    float fine = noise(vec3(b.x * 60.0, b.y * 190.0, b.z * 190.0));
    m.col = c * mix(0.78, 1.12, fine); m.rough = 0.72; m.sheen = 0.45; m.sheenCol = mix(c, vec3(1.0, 0.9, 0.75), 0.4);
    n = normalize(n + (1.0 - head) * tu * (-0.22 + 0.7 * (1.0 - smoothstep(0.0, 0.2, rim))) + 0.3 * (hash3(p * 800.0) - 0.5));
    return true;
  }
  if (id < 101.5) {   // wings: rufous coverts with dark middles, a pale band, black primaries
    vec2 uv = birdWingUV(b);
    birdFeather(uv, s, t, rim, sh, fid);
    float far = smoothstep(4.6, 6.6, uv.x), band = smoothstep(2.6, 3.6, uv.x) * (1.0 - smoothstep(4.2, 5.2, uv.x));
    vec3 centre = mix(srgb(0.17, 0.10, 0.06), srgb(0.045, 0.04, 0.04), far);
    vec3 edge = mix(mix(srgb(0.70, 0.40, 0.17), srgb(0.84, 0.66, 0.42), band), srgb(0.22, 0.19, 0.17), far);
    float mid = 1.0 - smoothstep(0.25, mix(0.95, 0.6, band), abs(t) + 0.35 * (1.0 - rim) * (1.0 - far));
    vec3 c = mix(edge, centre, mid * mix(0.9, 1.0, far)) * mix(0.8, 1.15, fid);
    c = mix(c, edge * 1.1, (1.0 - smoothstep(0.0, 0.18, rim)) * 0.8);
    c = mix(c, dark * 0.6, 0.6 * (1.0 - smoothstep(0.0, 0.07, abs(t)))) * (1.0 - 0.6 * sh);
    float barb = noise(vec3(b.x * 50.0, b.y * 200.0, b.z * 200.0));
    m.col = c * mix(0.8, 1.12, barb); m.rough = mix(0.7, 0.5, far); m.sheen = 0.4; m.sheenCol = mix(c, vec3(1.0, 0.92, 0.8), 0.35);
    n = normalize(n + tu * (-0.2 + 0.8 * (1.0 - smoothstep(0.0, 0.15, rim))) + 0.22 * (hash3(p * 800.0) - 0.5));
    return true;
  }
  if (id < 102.5) {   // tail: orange-rufous above, pale below, twelve feathers with dark shafts
    vec2 tw; birdTail(b, tw);
    float av = min(abs(tw.x), 0.999) * 3.0, k = floor(av), fr = fract(av);
    float up = step(0.0, tw.y);
    vec3 c = mix(srgb(0.70, 0.58, 0.46), srgb(0.80, 0.36, 0.105), up) * mix(0.85, 1.12, hash1(k + 3.0 + 9.0 * step(0.0, tw.x)));
    c = mix(c, srgb(0.34, 0.16, 0.07), 0.7 * smoothstep(2.2, 3.0, av) * smoothstep(0.45, 0.72, b.x));          // dusky outer corners
    float sd = tw.x < 0.0 ? 1.0 : 0.0;
    c *= 1.0 - 0.38 * smoothstep(0.55, 0.8, noise(vec2((b.x + 0.4 * abs(fr - 0.45) * 0.03) * 44.0 + k * 3.7, k + 7.0 * sd)));   // faint dark bars
    c = mix(c, dark, 0.8 * (1.0 - smoothstep(0.02, 0.1, abs(fr - 0.45))));                                      // shafts
    c *= 1.0 - 0.7 * (1.0 - smoothstep(0.0, 0.22, fr)); c = mix(c, c * 1.3, smoothstep(0.75, 1.0, fr));         // each feather tucked under its neighbour
    c = mix(c, srgb(0.86, 0.62, 0.38), 0.6 * smoothstep(-0.035, 0.0, b.x - (0.76 - 0.14 * (1.0 - sat(abs(tw.x))))));   // pale tips                                                         // each feather tucked under its neighbour
    float barb = noise(vec3(b.x * 40.0, b.y * 260.0, b.z * 260.0));
    m.col = c * mix(0.82, 1.1, barb); m.rough = 0.62; m.sheen = 0.35; m.sheenCol = mix(c, vec3(1.0, 0.9, 0.75), 0.4);
    vec3 wd = vec3(-sin(0.9) * 0.743, -sin(0.9) * 0.669, cos(0.9)); wd.xz = rot(-BIRD_YAW) * wd.xz;              // across the tail, in the world
    n = normalize(n + wd * (fr - 0.45) * 0.7 * sign(tw.x) * (up * 2.0 - 1.0) + 0.2 * (hash3(p * 700.0) - 0.5));  // each vane is cambered
    return true;
  }
  if (id < 103.5) {   // bill: waxy yellow cere and gape, blue-grey horn darkening to a black hook
    float tipw = 1.0 - smoothstep(-0.138, -0.112, h.x);
    vec3 c = mix(srgb(0.93, 0.74, 0.13), mix(srgb(0.42, 0.42, 0.40), srgb(0.05, 0.05, 0.05), 1.0 - smoothstep(-0.162, -0.136, h.x - 0.4 * (h.y + 0.02))), tipw);
    m.col = c * (0.9 + 0.2 * noise(p * 120.0)); m.rough = mix(0.45, 0.22, tipw); m.coat = mix(0.25, 0.8, tipw); m.coatRough = 0.1;
    bumpN(n, p, 160.0, 0.25);
    return true;
  }
  if (id < 104.5) {   // eye: pale amber iris, black pupil, wet
    vec3 hs = vec3(h.xy, abs(h.z)); vec3 e = normalize(hs - BIRD_EYE);
    float a = dot(e, normalize(vec3(-0.35, 0.05, 1.0)));
    m.col = mix(srgb(0.93, 0.80, 0.42) * (0.75 + 0.35 * noise(e * 30.0)), srgb(0.012, 0.01, 0.01), smoothstep(0.80, 0.86, a));
    m.col = mix(srgb(0.10, 0.08, 0.06), m.col, smoothstep(0.30, 0.42, a));
    m.rough = 0.08; m.coat = 1.0; m.coatRough = 0.02;
    return true;
  }
  if (id < 105.5) {   // legs and toes: yellow, scaly
    vec2 c = voronoi(q * 210.0);
    m.col = srgb(0.92, 0.70, 0.12) * (0.72 + 0.34 * smoothstep(0.05, 0.4, c.x)) * (0.9 + 0.2 * c.y); m.rough = 0.42; m.coat = 0.25; m.coatRough = 0.2;
    bumpN(n, p, 210.0, 0.5);
    return true;
  }
  if (id < 106.5) { m.col = srgb(0.035, 0.032, 0.03); m.rough = 0.22; m.coat = 0.8; m.coatRough = 0.08; return true; }   // talons
  // the post: weathered bark, sawn top showing its rings
  vec3 r = q - vec3(-0.065, 0.0, 0.0);
  if (r.y > 0.246) {
    matWood(m, n, vec3(r.x * 0.35 - 0.9, r.z * 0.35 - 0.35, r.y), vec3(0, 0, 1), 0.25, 0.0);
    m.col = mix(m.col, vec3(lum(m.col)) * vec3(1.0, 0.97, 0.9), 0.45) * (0.75 + 0.3 * noise(q * 60.0));
    float saw = noise(vec2(dot(r.xz, vec2(0.8, 0.6)) * 260.0, 1.0)); m.col *= 0.9 + 0.14 * saw;
    return true;
  }
  float ridge = fbm3(vec3(r.x * 24.0, r.y * 3.0, r.z * 24.0)), fine = fbm3(vec3(r.x * 80.0, r.y * 14.0, r.z * 80.0));
  vec3 c = mix(srgb(0.24, 0.19, 0.15), srgb(0.62, 0.56, 0.48), smoothstep(0.3, 0.56, ridge)) * (0.75 + 0.5 * fine);
  float lichen = smoothstep(0.58, 0.68, fbm3(q * 9.0 + 4.0)) * smoothstep(0.42, 0.55, ridge);
  c = mix(c, srgb(0.62, 0.66, 0.50) * (0.8 + 0.3 * fine), 0.7 * lichen);
  m.col = c; m.rough = 0.92; bumpN(n, p, 120.0, 0.9);
  return true;
}
