// A pair of classic quad roller skates: cream leather lace-up boots on aluminium plates, red urethane wheels and toe stops.
// One skate in front, side-on; the other behind it, turned to show its laces. Each is about 0.78 long and 0.8 tall.
// Material ids 100..111 (front skate) and 120..131 (back skate).
#define SKATE_RED srgb(0.80, 0.085, 0.12)
vec3 skateLocal(vec3 p, float o) {
  if (o < 10.0) { p -= vec3(0.185, 0.0, 0.16); p.xz = rot(0.30) * p.xz; }
  else { p -= vec3(-0.27, 0.0, -0.17); p.xz = rot(2.22) * p.xz; }
  return p;
}
float skateHb(float x) { return 0.245 + 0.055 * (1.0 - smoothstep(-0.16, 0.04, x)); }       // height of the boot's underside
float skatePlan(vec2 xz) {                                                                    // the foot's outline from above
  float toe = sdEllipsoid(vec3(xz.x - 0.14, 0.0, xz.y), vec3(0.225, 1.0, 0.108));
  float heel = sdEllipsoid(vec3(xz.x + 0.17, 0.0, xz.y), vec3(0.195, 1.0, 0.094));
  return smin(toe, heel, 0.10);
}
// lacing coordinates: x = distance up the front of the boot from the throat, y = distance from that line, z > 0 beyond its ends
vec3 skateLace(vec2 xy) {
  const vec2 A = vec2(0.135, 0.39), B = vec2(-0.05, 0.545), C = vec2(-0.097, 0.775);
  vec2 ab = B - A, bc = C - B;
  float u1 = dot(xy - A, ab) / dot(ab, ab), u2 = dot(xy - B, bc) / dot(bc, bc);
  float d1 = length(xy - A - ab * sat(u1)), d2 = length(xy - B - bc * sat(u2));
  float outside = max(-u1 * 0.2414, (u2 - 1.0) * 0.2347);
  return d1 < d2 ? vec3(sat(u1) * 0.2414, d1, outside) : vec3(0.2414 + sat(u2) * 0.2347, d2, outside);
}
float skateBoot(vec3 q) {
  float toe = sdEllipsoid(q - vec3(0.185, 0.30, 0.0), vec3(0.178, 0.098, 0.104));
  float mid = sdEllipsoid(q - vec3(-0.11, 0.36, 0.0), vec3(0.255, 0.16, 0.098));
  float shaft = sdCone(vec3(q.xy, q.z * 1.08), vec3(-0.19, 0.40, 0.0), vec3(-0.205, 0.80, 0.0), 0.125, 0.108);
  float d = smin(smin(toe, mid, 0.05), shaft, 0.07);
  d = smax(d, q.y - 0.792, 0.012);
  // padded collar round the top
  d = smin(d, length(vec2(length((q.xz - vec2(-0.205, 0.0)) * vec2(1.0, 1.08)) - 0.100, q.y - 0.772)) - 0.021, 0.012);
  d = smax(d, -(q.y - skateHb(q.x)), 0.010);
  return d;
}
const float SKATE_SP = 0.0595, SKATE_ZE = 0.036;
void skateOne(vec3 q, float o, inout float d) {
  float bs = length(q - vec3(0.0, 0.40, 0.0)) - 0.60;
  if (bs > 0.1) { d = min(d, bs); return; }
  float az = abs(q.z);
  // ---- boot ----
  float boot = skateBoot(q);
  vec3 L = skateLace(q.xy);
  float front = (1.0 - smoothstep(0.05, 0.075, L.y)) * (1.0 - smoothstep(-0.01, 0.0, L.z));
  float recess = front * (1.0 - smoothstep(0.020, 0.028, az));                                 // the tongue lies a little below the facings
  float open = sdEllipsoid(q - vec3(-0.205, 0.83, 0.0), vec3(0.080, 0.24, 0.070));
  float seam = (1.0 - smoothstep(0.0, 0.003, abs(L.y - 0.062))) * (1.0 - smoothstep(-0.01, 0.0, L.z));        // edge of the facing panel
  seam = max(seam, 1.0 - smoothstep(0.0, 0.003, abs(q.x - 0.215 + 3.0 * q.z * q.z)));          // toe cap
  seam = max(seam, (1.0 - smoothstep(0.0, 0.003, abs(q.x + 0.225 + 0.22 * (q.y - 0.3) - 1.2 * (q.y - 0.3) * (q.y - 0.3)))) * step(q.y, 0.56) * step(q.x, -0.1));   // heel counter
  add(d, smax(boot + 0.006 * recess + 0.0018 * seam, -open, 0.012) * 0.8, 100.0 + o);
  // tongue sticking up above the collar
  vec3 tq = q - vec3(-0.094, 0.775, 0.0); tq.xy = rot(-0.22) * tq.xy;
  add(d, sdRBox(tq, vec3(0.011, 0.058, 0.046), 0.010), 109.0 + o);
  // laces: flat, crossing from eyelet to eyelet over the tongue
  float f = fract(L.x / SKATE_SP), zz = SKATE_ZE * (1.0 - 2.0 * f);
  float ln = min(abs(q.z - zz), abs(q.z + zz)) * 0.64 - 0.0062;
  float lace = max(max(ln, az - SKATE_ZE - 0.004), abs(boot - 0.004) - 0.0032);
  lace = max(lace, max(L.z + 0.004, L.y - 0.07));
  // the bow: a knot, two loops, two ends of different length lying down the sides
  vec3 kq = q - vec3(-0.083, 0.752, 0.0);
  float bow = sdSphere(kq, 0.013);
  vec3 lq = vec3(kq.x - 0.012, kq.y + 0.012, az - 0.040); lq.yz = rot(-0.55) * lq.yz; lq.xy = rot(0.5) * lq.xy;
  bow = min(bow, sdTorus(lq * vec3(1.0, 1.0, 0.75), 0.030, 0.0058) * 0.75);
  bow = min(bow, sdCapsule(q, vec3(-0.080, 0.748, 0.010), vec3(-0.042, 0.655, 0.074), 0.0055));
  bow = min(bow, sdCapsule(q, vec3(-0.042, 0.655, 0.074), vec3(-0.050, 0.590 - 0.03 * step(10.0, o), 0.098), 0.0055));
  bow = min(bow, sdCapsule(q, vec3(-0.080, 0.748, -0.010), vec3(-0.040, 0.675, -0.072), 0.0055));
  bow = min(bow, sdCapsule(q, vec3(-0.040, 0.675, -0.072), vec3(-0.060, 0.630, -0.094), 0.0055));
  add(d, min(lace * 0.7, bow), 105.0 + o);
  // eyelets
  float fe = (fract(L.x / SKATE_SP + 0.5) - 0.5) * SKATE_SP;
  float ring = abs(length(vec2(fe, az - SKATE_ZE - 0.007)) - 0.0062) - 0.0032;
  ring = max(max(ring, abs(boot - 0.0015) - 0.003), max(L.z - 0.012, L.y - 0.08));
  add(d, ring * 0.8, 106.0 + o);

  // ---- sole and stacked heel ----
  float plan = skatePlan(q.xz), hb = skateHb(q.x);
  float sole = extrudeR(plan - 0.009, q.y - (hb - 0.013), 0.015, 0.004);
  float heel = extrudeR(max(plan - 0.005, q.x + 0.125 + 0.35 * (q.y - 0.21)), q.y - 0.243, 0.037, 0.004);
  add(d, min(sole, heel) * 0.8, 101.0 + o);

  // ---- plate, trucks, toe stop ----
  float plate = sdRBox(q - vec3(-0.005, 0.197, 0.0), vec3(0.275, 0.0125, 0.056), 0.007);
  plate = smin(plate, sdRBox(q - vec3(0.285, 0.190, 0.0), vec3(0.040, 0.020, 0.036), 0.012), 0.01);       // toe-stop boss
  vec3 t = vec3(abs(q.x + 0.005) - 0.205, q.y - 0.095, q.z);                                   // both trucks at once
  float truck = sdRBox(t - vec3(0.0, 0.004, 0.0), vec3(0.024, 0.022, 0.062), 0.012);
  truck = smin(truck, sdCapsule(t, vec3(-0.004, 0.02, 0.0), vec3(-0.052, 0.094, 0.0), 0.017), 0.012);
  truck = smin(truck, sdCapsule(t, vec3(0.018, 0.02, 0.0), vec3(0.052, 0.090, 0.0), 0.011), 0.01);
  add(d, min(plate, truck), 102.0 + o);
  vec3 cu = t - vec3(-0.030, 0.060, 0.0); cu.xy = rot(-0.58) * cu.xy;
  add(d, sdRCyl(cu, 0.030, 0.016, 0.008), 107.0 + o);                                          // urethane cushion on the kingpin
  add(d, sdRCyl(t.xzy, 0.0105, 0.152, 0.003), 108.0 + o);                                      // axle
  // wheels
  vec3 w = vec3(t.x, t.y, az - 0.105);
  float tyre = sdRCyl(w.xzy, 0.095, 0.037, 0.017);
  tyre = smax(tyre, -sdRCyl(vec3(w.x, w.z - 0.043, w.y), 0.052, 0.012, 0.004), 0.004);
  float hub = sdRCyl(vec3(w.x, w.z - 0.004, w.y), 0.050, 0.030, 0.004);
  hub = smax(hub, -sdRCyl(vec3(w.x, w.z - 0.038, w.y), 0.026, 0.008, 0.003), 0.003);
  add(d, min(tyre, hub), 103.0 + o);
  float na = mod(atan(w.y, w.x), TAU / 6.0) - TAU / 12.0; vec2 nh = length(w.xy) * vec2(cos(na), sin(na));
  add(d, smax(nh.x - 0.0135, abs(w.z - 0.036) - 0.008, 0.003), 108.0 + o);
  // toe stop: a rubber bung on a threaded stem
  vec3 ts = q - vec3(0.350, 0.104, 0.0); ts.xy = rot(0.50) * ts.xy;
  float stop = sdRCyl(ts, 0.062, 0.040, 0.022);
  stop = smax(stop, -(sdRCyl(ts - vec3(0.0, -0.045, 0.0), 0.022, 0.012, 0.004)), 0.006);
  add(d, stop, 104.0 + o);
  add(d, sdRCyl(ts - vec3(0.0, 0.055, 0.0), 0.022, 0.022, 0.004), 102.0 + o);
}
void mGift(vec3 p, inout float d) {
  float bb = length(p - vec3(0.0, 0.42, -0.02)) - 0.84;
  if (bb > 0.15) { d = min(d, bb); return; }
  skateOne(skateLocal(p, 0.0), 0.0, d);
  skateOne(skateLocal(p, 20.0), 20.0, d);
}
float skateStitch(float dist, float along) { return (1.0 - smoothstep(0.0016, 0.003, abs(dist))) * step(0.38, fract(along * 120.0)); }
bool shGift(float id, vec3 p, inout vec3 n, inout Mat m) {
  if (id < 100.0 || id >= 140.0) return false;
  float o = id >= 120.0 ? 20.0 : 0.0; id -= o;
  vec3 q = skateLocal(p, o); float az = abs(q.z);
  if (id < 100.5 || abs(id - 109.0) < 0.5) {                     // boot leather
    vec3 L = skateLace(q.xy);
    float inRange = 1.0 - smoothstep(-0.01, 0.0, L.z);
    vec3 col = srgb(0.93, 0.90, 0.83);
    // two stripes swept across the quarter
    float su = dot(q.xy - vec2(-0.06, 0.30), vec2(0.80, 0.60));
    float sideMask = smoothstep(0.045, 0.06, az) * step(q.y, 0.70) * step(0.066, L.y);
    col = mix(col, SKATE_RED, sideMask * step(abs(su - 0.005), 0.020));
    col = mix(col, srgb(0.90, 0.62, 0.10), sideMask * step(abs(su - 0.058), 0.020));
    // padded collar and the tongue's top in tan
    float collar = smoothstep(0.748, 0.752, q.y);
    col = mix(col, srgb(0.74, 0.50, 0.28), collar * step(id, 100.5));
    Mat lm = newMat(); vec3 n2 = n; matLeather(lm, n2, p, col, 0.45);
    m = lm; m.col = mix(m.col, col * (0.9 + 0.15 * fbm3(p * 5.0)), 0.8); n = normalize(mix(n, n2, 0.05)); bumpN(n, p, 300.0, 0.22);
    // seams: a shadow line where panels overlap, and a row of stitches beside it
    float sFace = L.y - 0.062, sToe = q.x - 0.215 + 3.0 * q.z * q.z, sHeel = q.x + 0.225 + 0.22 * (q.y - 0.3) - 1.2 * (q.y - 0.3) * (q.y - 0.3);
    float st = skateStitch(sFace - 0.008, L.x) * inRange + skateStitch(sFace - 0.014, L.x + 0.004) * inRange;
    st += skateStitch(sToe + 0.008, q.z) + skateStitch(sHeel - 0.008, q.y) * step(q.y, 0.56) * step(q.x, -0.1);
    st += skateStitch(q.y - 0.738, atan(q.z, q.x + 0.205) * 0.11) * step(id, 100.5);
    st += skateStitch(az - 0.034, L.x) * inRange * step(L.y, 0.05) * step(id, 100.5);
    float edge = (1.0 - smoothstep(0.0, 0.004, abs(sFace))) * inRange + (1.0 - smoothstep(0.0, 0.004, abs(sToe))) + (1.0 - smoothstep(0.0, 0.004, abs(sHeel))) * step(q.y, 0.56) * step(q.x, -0.1);
    m.col *= 1.0 - 0.5 * sat(edge);
    m.col = mix(m.col, srgb(0.70, 0.64, 0.52), sat(st) * 0.85);
    // creases across the vamp where the foot bends
    float cr = sin((q.x - 0.05 + 0.6 * az) * 150.0 + 3.0 * noise(q * 30.0)) * (1.0 - smoothstep(0.05, 0.12, abs(q.x - 0.10))) * step(0.30, q.y);
    n = normalize(n + vec3(0.10 * cr, 0.0, 0.0)); m.col *= 1.0 - 0.05 * cr;
    // inside: a cloth lining
    float open = sdEllipsoid(q - vec3(-0.205, 0.83, 0.0), vec3(0.080, 0.24, 0.070));
    if (open < 0.008 && id < 100.5) { matFelt(m, n, p, srgb(0.10, 0.07, 0.05)); m.sheen = 0.2; m.coat = 0.0; }
    if (id > 100.5) { m.col = mix(m.col, srgb(0.74, 0.50, 0.28) * (0.9 + 0.15 * fbm3(p * 5.0)), 0.0); }
    // scuffs low on the toe
    float scuff = smoothstep(0.55, 0.8, fbm3(p * 14.0)) * (1.0 - smoothstep(0.26, 0.36, q.y)) * smoothstep(0.1, 0.3, q.x);
    m.col *= 1.0 - 0.3 * scuff; m.rough += 0.2 * scuff;
    return true;
  }
  if (id < 101.5) {                                              // sole and heel: stacked tan leather, stitched round the welt
    float hb = skateHb(q.x);
    vec3 n2 = n; matLeather(m, n2, p, srgb(0.62, 0.40, 0.20), 0.3); n = normalize(mix(n, n2, 0.06)); bumpN(n, p, 260.0, 0.3);
    float layer = fract((q.y - 0.21) * 70.0);
    m.col *= (q.y < hb - 0.03 ? 0.75 + 0.3 * step(0.2, layer) : 1.0);
    m.col = mix(m.col, srgb(0.86, 0.80, 0.66), step(n.y, 0.5) * 0.0);
    return true;
  }
  if (id < 102.5) {                                              // cast aluminium plate and trucks
    matMetal(m, n, p, 0, vec3(1.0, 0.0, 0.0)); m.col = srgb(0.84, 0.85, 0.87) * (0.88 + 0.12 * noise(p * 200.0)); m.rough += 0.10;
    m.rough = 0.42 + 0.1 * noise(p * 200.0);
    return true;
  }
  if (id < 103.5) {                                              // wheels: red urethane on a cream nylon hub, steel bearing
    vec3 w = vec3(abs(q.x + 0.005) - 0.205, q.y - 0.095, az - 0.105); float r = length(w.xy);
    if (r > 0.0515) {
      matPlastic(m, n, p, SKATE_RED, 0.9); m.coat = 0.7; m.coatRough = 0.06;
      m.col *= 1.0 - 0.35 * smoothstep(0.084, 0.095, r) * smoothstep(0.3, 0.7, fbm3(p * 26.0));
      m.rough += 0.25 * smoothstep(0.086, 0.094, r);
    } else if (r > 0.027) {
      float spoke = step(0.55, cos(atan(w.y, w.x) * 5.0 + o));
      matPlastic(m, n, p, srgb(0.92, 0.89, 0.80) * (1.0 - 0.22 * spoke * step(r, 0.045)), 0.6);
    } else { matMetal(m, n, p, 0, vec3(0.0, 0.0, 1.0)); m.col *= 0.5 + 0.5 * step(0.019, r); }
    return true;
  }
  if (id < 104.5) { matRubber(m, n, p, SKATE_RED * 0.9); m.rough = 0.6; return true; }                     // toe stop
  if (id < 105.5) {                                              // laces: flat woven cotton
    matCloth(m, n, p, vec2(q.z + q.y, q.x - q.z) * 1.6, SKATE_RED, 0.5); m.sheen = 0.25; m.sheenCol = SKATE_RED * 1.5;
    return true;
  }
  if (id < 106.5) { matMetal(m, n, p, 1, vec3(0.0, 1.0, 0.0)); m.rough += 0.1; return true; }             // brass eyelets
  if (id < 107.5) { matPlastic(m, n, p, srgb(0.93, 0.70, 0.12), 0.7); return true; }                       // cushions
  matMetal(m, n, p, 3, vec3(0.0, 0.0, 1.0)); m.rough += 0.2;                                               // axles and nuts
  return true;
}
