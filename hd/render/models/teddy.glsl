// Classic sitting teddy bear in honey mohair, about 1.2 units tall, sitting on y = 0. Material ids 100..109.
// HUE is the fur colour.
#ifndef HUE
#define HUE srgb(0.56, 0.31, 0.11)
#endif
float teddyBase(vec3 p, out float part) {
  part = 0.0;
  vec3 q = p; q.x = abs(q.x);
  float d = sdEllipsoid(p - vec3(0, 0.40, 0), vec3(0.30, 0.36, 0.27));
  d = smin(d, sdEllipsoid(p - vec3(0, 0.30, 0.03), vec3(0.32, 0.27, 0.29)), 0.08);                 // tummy
  float head = sdEllipsoid(p - vec3(0, 0.93, 0.04), vec3(0.265, 0.235, 0.245));
  d = smin(d, head, 0.045);
  d = smin(d, sdCone(q, vec3(0.25, 0.63, 0.04), vec3(0.40, 0.33, 0.20), 0.085, 0.10), 0.035);     // arms
  d = smin(d, sdCone(q, vec3(0.17, 0.15, 0.10), vec3(0.27, 0.125, 0.47), 0.115, 0.118), 0.04);    // legs
  // ears: a rounded disc with a dished front
  vec3 e = q - vec3(0.205, 1.125, 0.02); e.xy = rot(-0.5) * e.xy;
  float ear = sdEllipsoid(e, vec3(0.095, 0.095, 0.045));
  ear = smax(ear, -sdSphere(e - vec3(0, -0.005, 0.085), 0.075), 0.03);
  d = smin(d, ear, 0.03);
  float muzzle = sdEllipsoid(p - vec3(0, 0.865, 0.235), vec3(0.125, 0.095, 0.105));
  if (muzzle < d + 0.01) part = 1.0;
  d = smin(d, muzzle, 0.03);
  // paw and foot pads
  float pad = sdEllipsoid(q - vec3(0.275, 0.13, 0.585), vec3(0.085, 0.09, 0.02));
  if (pad < 0.004) part = 2.0;
  if (sdSphere(e - vec3(0, -0.005, 0.03), 0.062) < 0.0 && e.z > 0.0) part = 1.0;
  // stitched seams: a shallow crease down the middle of head and tummy
  d += 0.006 * exp(-abs(p.x) * 90.0) * step(0.0, p.z);
  return d;
}
void mGift(vec3 p, inout float d) {
  float bb = length(p - vec3(0, 0.6, 0.1)) - 0.85;
  if (bb > 0.15) { d = min(d, bb); return; }
  float part; float f = teddyBase(p, part);
  // plush: tufts and fine fibres pushed out of the surface
  // plush pile: short fibres combed downwards, clumped into soft tufts
  vec3 fq = vec3(p.x, p.y * 0.22, p.z);
  float strand = noise(fq * 170.0) - 0.5, strand2 = noise(fq * 330.0 + 5.0) - 0.5;
  float clump = fbm3(p * 13.0) - 0.5;
  float fuzz = part > 1.5 ? 0.0012 * strand2 : 0.010 * strand + 0.005 * strand2 + 0.012 * clump;
  add(d, f - fuzz, 100.0 + part);
  // nose, eyes
  add(d, sdEllipsoid(p - vec3(0, 0.905, 0.335), vec3(0.042, 0.03, 0.024)), 103.0);
  vec3 q = p; q.x = abs(q.x);
  add(d, sdSphere(q - vec3(0.092, 0.975, 0.245), 0.027), 104.0);
  // satin ribbon round the neck with a bow
  vec3 r = p - vec3(0, 0.735, 0.03);
  float band = max(abs(length(r.xz * vec2(1.0, 1.08)) - 0.215) - 0.012, abs(r.y + 0.02 * sin(atan(r.z, r.x) * 2.0)) - 0.045);
  vec3 bw = q - vec3(0.0, 0.725, 0.255);
  // each loop: a pillow of ribbon pinched at the knot, with creases fanning out from it
  vec3 lp = bw - vec3(0.02, 0.0, 0.0); lp.xy = rot(0.22) * lp.xy;
  float open = smoothstep(0.0, 0.11, lp.x);
  float crease = sin(atan(lp.y, lp.x + 0.03) * 13.0) * (1.0 - open) * 0.006;
  float loop = sdEllipsoid(lp - vec3(0.075, 0.0, 0.0), vec3(0.082, 0.016 + 0.05 * open, 0.012 + 0.022 * open)) + crease;
  float knot = sdRBox(bw, vec3(0.028, 0.034, 0.026), 0.012);
  vec3 tl = bw - vec3(0.05, -0.11, 0.01); tl.xy = rot(-0.35) * tl.xy;
  float tail = sdRBox(tl + vec3(0.0, 0.0, 0.006 * sin(tl.y * 38.0)), vec3(0.03, 0.085, 0.0022), 0.0015);
  add(d, min(min(band - 0.002, loop), min(knot + 0.003 * sin(bw.x * 140.0), tail)), 105.0);
}
bool shGift(float id, vec3 p, inout vec3 n, inout Mat m) {
  if (id < 100.0 || id >= 110.0) return false;
  if (id < 102.5) {
    vec3 fur = HUE;
    if (id > 100.5) fur = mix(fur, srgb(0.86, 0.72, 0.50), 0.75);                 // muzzle and inner ears
    if (id > 101.5) fur = srgb(0.50, 0.33, 0.20);                                // pads: short felt
    vec3 fq = vec3(p.x, p.y * 0.22, p.z);
    float v = fbm3(p * 7.0), tips = noise(fq * 170.0), fine = noise(fq * 420.0);
    m.col = fur * mix(0.55, 1.1, v) * mix(0.55, 1.25, tips) * mix(0.8, 1.15, fine);
    m.rough = 0.9; m.sheen = id > 101.5 ? 0.25 : 0.7; m.sheenCol = mix(fur, vec3(1.0, 0.85, 0.6), 0.45);
    n = normalize(n + (id > 101.5 ? 0.2 : 0.75) * (hash3(p * 913.0) - 0.5) + vec3(0.0, -0.25, 0.0) * float(id < 101.5));
    return true;
  }
  if (id < 103.5) { m.col = srgb(0.07, 0.05, 0.045); m.rough = 0.42; n = normalize(n + 0.12 * (hash3(floor(p * 420.0)) - 0.5)); return true; }   // stitched nose
  if (id < 104.5) { m.col = srgb(0.03, 0.02, 0.015); m.rough = 0.04; m.coat = 1.0; m.coatRough = 0.02; return true; }                          // glass eyes
  // satin: fine threads, a soft streaked sheen
  float thread = noise(vec3(p.x * 700.0, p.y * 40.0, p.z * 700.0));
  m.col = srgb(0.50, 0.025, 0.04) * (0.8 + 0.3 * thread); m.rough = 0.46 + 0.12 * thread; m.sheen = 1.0; m.sheenCol = srgb(1.0, 0.5, 0.45);
  n = normalize(n + 0.07 * (hash3(vec3(p.x * 900.0, p.y * 60.0, p.z * 900.0)) - 0.5));
  return true;
}
