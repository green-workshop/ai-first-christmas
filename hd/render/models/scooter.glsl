// Two-wheeled folding kick scooter, three-quarter view, bars turned a little. About 0.9 long, 1.24 tall. Material ids 100..115.
// HUE is the anodised deck, the clamp collars, the wheel cores and the foam grips.
#ifndef HUE
#define HUE srgb(0.78, 0.06, 0.05)
#endif
#define SCOOT_YAW 0.55
#define SCOOT_STEER 0.30
const vec3 scootRA = vec3(-0.36, 0.095, 0.0);      // rear axle
const vec3 scootFA = vec3(0.375, 0.095, 0.0);      // front axle (before steering)
const vec3 scootH0 = vec3(0.335, 0.235, 0.0);      // bottom of the head tube
const vec3 scootAx = vec3(-0.0872, 0.9962, 0.0);   // steering axis, pointing up
const vec3 scootFw = vec3(0.9962, 0.0872, 0.0);

vec3 scootSpace(vec3 p) { p.xz = rot(SCOOT_YAW) * p.xz; p.x += 0.02; return p; }
// into the frame of the steered parts, as (forward, up the stem, sideways) from the head tube's foot
vec3 scootStem(vec3 b) {
  vec3 v = b - scootH0; float c = cos(SCOOT_STEER), s = sin(SCOOT_STEER);
  v = v * c + cross(scootAx, v) * s + scootAx * dot(scootAx, v) * (1.0 - c);
  return vec3(dot(v, scootFw), dot(v, scootAx), v.z);
}
// a cast urethane wheel on a spoked plastic core, about the z axis
void scootWheel(vec3 q, inout float d) {
  float r = length(q.xy);
  float bnd = max(r - 0.097, abs(q.z) - 0.05);
  if (bnd > 0.03) { d = min(d, bnd); return; }
  float tyre = sdRCyl(q.xzy, 0.095, 0.027, 0.022);
  tyre = smax(tyre, -(sdRCyl(vec3(q.x, abs(q.z) - 0.030, q.y), 0.061, 0.008, 0.003)), 0.004);        // the core sits in a recess
  float a = atan(q.y, q.x);
  float pocket = smoothstep(0.35, 0.6, cos(a * 6.0)) * smoothstep(0.026, 0.032, r) * (1.0 - smoothstep(0.050, 0.056, r));
  float core = sdRCyl(q.xzy, 0.060, 0.0235, 0.004) + 0.006 * pocket;
  float bearing = sdRCyl(q.xzy, 0.024, 0.0265, 0.003);
  bearing = smax(bearing, -(sdRCyl(vec3(q.x, abs(q.z) - 0.028, q.y), 0.019, 0.004, 0.001)), 0.002);
  add(d, tyre, 103.0);
  add(d, core * 0.8, 108.0);
  add(d, bearing, 107.0);
  // axle bolt: a button head each side, outside the fork
  add(d, sdRCyl(vec3(q.x, abs(q.z) - 0.046, q.y), 0.013, 0.005, 0.004), 107.0);
}
float scootDeckPlan(vec3 q) {
  float hw = mix(0.084, 0.046, smoothstep(0.10, 0.30, q.x));
  float plan = sdBox2(vec2(q.x, q.z * 0.084 / hw), vec2(0.30, 0.084) - 0.032) - 0.032;
  return max(plan, -(sdBox2(vec2(q.x + 0.335, q.z), vec2(0.155, 0.033) - 0.01) - 0.01));             // slot for the rear wheel
}
void mGift(vec3 p, inout float d) {
  float bb = length(p - vec3(0.0, 0.62, 0.0)) - 0.80;
  if (bb > 0.15) { d = min(d, bb); return; }
  vec3 b = scootSpace(p), s = scootStem(b);
  vec3 ba = vec3(b.xy, abs(b.z)), sa = vec3(s.xy, abs(s.z));

  // ---- deck: an aluminium extrusion with a grooved side, grip tape on top ----
  vec3 q = b - vec3(-0.085, 0.118, 0.0);
  float plan = scootDeckPlan(q);
  float deck = extrudeR(plan, q.y, 0.024, 0.007);
  deck += 0.0028 * (1.0 - smoothstep(0.0, 0.004, abs(q.y + 0.004))) + 0.0018 * (1.0 - smoothstep(0.0, 0.003, abs(q.y - 0.010)));
  add(d, deck * 0.8, 100.0);
  float tape = extrudeR(max(plan + 0.013, max(q.x - 0.20, -q.x - 0.175)), q.y - 0.0245, 0.0022, 0.001);
  add(d, tape * 0.8, 102.0);
  // ---- neck and folding joint ----
  vec3 nq = b - vec3(0.215, 0.168, 0.0); nq.xy = rot(0.50) * nq.xy;
  float neck = sdRBox(nq, vec3(0.112, 0.021, 0.030), 0.010);
  add(d, neck, 100.0);
  vec3 hq = b - vec3(0.302, 0.232, 0.0); hq.xy = rot(-0.087) * hq.xy;
  float hinge = sdRBox(hq, vec3(0.030, 0.050, 0.040), 0.010);
  hinge = max(hinge, -(sdBox(hq - vec3(-0.02, -0.03, 0.0), vec3(0.03, 0.012, 0.05)) - 0.004));       // the slot the latch rides in
  add(d, hinge, 101.0);
  float pivot = sdRCyl((hq - vec3(-0.004, 0.012, 0.0)).xzy, 0.013, 0.050, 0.004);
  pivot = min(pivot, sdRCyl((hq - vec3(-0.012, -0.030, 0.0)).xzy, 0.008, 0.047, 0.003));
  add(d, pivot, 107.0);
  // folding lever on the camera side
  float flever = sdCapsule(b, vec3(0.292, 0.203, 0.046), vec3(0.235, 0.238, 0.050), 0.0085);
  flever = smin(flever, sdSphere(b - vec3(0.228, 0.242, 0.050), 0.014), 0.008);
  add(d, flever, 106.0);
  // head tube and its bearing cups (fixed to the joint)
  vec3 hf = vec3(dot(b - scootH0, scootFw), dot(b - scootH0, scootAx), b.z);
  add(d, sdRCyl(hf - vec3(0.0, 0.058, 0.0), 0.038, 0.056, 0.004), 101.0);
  add(d, min(sdRCyl(hf - vec3(0.0, 0.004, 0.0), 0.042, 0.008, 0.004), sdRCyl(hf - vec3(0.0, 0.114, 0.0), 0.042, 0.008, 0.004)), 107.0);

  // ---- rear wheel and fender brake ----
  scootWheel(b - scootRA, d);
  vec3 fq = b - scootRA; fq.xy = rot(1.62) * fq.xy;
  float fa = clamp(atan(fq.y, fq.x), -0.95, 0.80);
  float fd = length(fq.xy - 0.108 * vec2(cos(fa), sin(fa)));
  float fender = length(vec2(fd, max(abs(fq.z) - 0.027, 0.0))) - 0.0042;
  fender += 0.0014 * sin(fa * 60.0) * step(abs(fa + 0.1), 0.6) * step(abs(fq.z), 0.024);              // tread ribs for the foot
  fender = smin(fender, sdCapsule(ba, vec3(-0.268, 0.172, 0.0), vec3(-0.262, 0.146, 0.022), 0.007), 0.008);
  add(d, fender * 0.8, 109.0);
  add(d, sdRCyl((b - vec3(-0.262, 0.148, 0.0)).xzy, 0.006, 0.034, 0.002), 107.0);                    // its hinge pin

  // ---- fork and front wheel (steered) ----
  vec3 w0 = vec3(0.0276, -0.1430, 0.0);                                                              // the front axle in stem coordinates
  scootWheel(s - w0, d);
  float fork = sdRBox(s - vec3(0.0, -0.016, 0.0), vec3(0.026, 0.013, 0.046), 0.008);
  fork = smin(fork, sdCone(sa, vec3(0.0, -0.02, 0.040), w0 + vec3(0.0, 0.0, 0.038), 0.014, 0.012), 0.008);
  fork = max(fork, abs(s.z) - 0.0445);
  add(d, fork - 0.001, 101.0);

  // ---- stem: two telescoping tubes and a quick-release collar ----
  float lower = sdRCyl(s - vec3(0.0, 0.365, 0.0), 0.034, 0.245, 0.004);
  float upper = sdRCyl(s - vec3(0.0, 0.775, 0.0), 0.027, 0.180, 0.004);
  float tee = sdRCyl((s - vec3(0.0, 0.945, 0.0)).xzy, 0.033, 0.060, 0.007);
  float bar = sdRCyl((s - vec3(0.0, 0.945, 0.0)).xzy, 0.022, 0.262, 0.004);
  add(d, min(min(lower, upper), min(tee, bar)), 101.0);
  float collar = sdRCyl(s - vec3(0.0, 0.602, 0.0), 0.044, 0.026, 0.006);
  collar = smin(collar, sdRBox(s - vec3(-0.050, 0.602, 0.0), vec3(0.012, 0.019, 0.016), 0.005), 0.006);
  collar = max(collar, -sdBox(s - vec3(-0.05, 0.602, 0.0), vec3(0.03, 0.03, 0.0025)));               // pinch slit
  add(d, collar, 110.0);
  float qr = sdCapsule(s, vec3(-0.052, 0.602, 0.020), vec3(-0.036, 0.600, 0.054), 0.0085);
  qr = smin(qr, sdCapsule(s, vec3(-0.036, 0.600, 0.054), vec3(0.020, 0.596, 0.064), 0.0075), 0.008);
  add(d, qr, 106.0);
  add(d, sdRCyl((s - vec3(-0.052, 0.602, -0.020)).xzy, 0.009, 0.005, 0.003), 107.0);
  // spring buttons: one on the upper tube, one each side of the tee
  float btn = sdSphere(s - vec3(0.024, 0.690, 0.006), 0.0075);
  btn = min(btn, sdSphere(vec3(s.x - 0.026, s.y - 0.945, abs(s.z) - 0.040), 0.007));
  add(d, btn, 107.0);
  // foam grips with a moulded end cap
  vec3 g = vec3(s.x, abs(s.z) - 0.190, s.y - 0.945);
  float foam = sdRCyl(g, 0.038 - 20.0 * g.y * g.y * 0.05, 0.068, 0.014);
  foam += 0.0012 * sin(g.y * 300.0) * smoothstep(0.0, 0.01, 0.060 - abs(g.y));
  add(d, foam * 0.8, 104.0);
  add(d, sdRCyl(g - vec3(0.0, 0.072, 0.0), 0.033, 0.006, 0.004), 106.0);
  // bell: a pressed chrome dome on a clamp, with a thumb striker
  vec3 bl = s - vec3(0.012, 0.985, 0.098);
  float dome = smax(sdEllipsoid(bl, vec3(0.040, 0.036, 0.040)), -(bl.y + 0.008), 0.004);
  dome = smin(dome, sdSphere(bl - vec3(0.0, 0.036, 0.0), 0.006), 0.004);
  add(d, dome, 105.0);
  float base = sdRCyl(bl - vec3(0.0, -0.014, 0.0), 0.034, 0.008, 0.003);
  base = min(base, sdRCyl((s - vec3(0.0, 0.945, 0.098)).xzy, 0.024, 0.012, 0.004));
  base = min(base, sdCapsule(bl, vec3(0.0, -0.014, 0.030), vec3(-0.018, -0.016, 0.052), 0.006));
  add(d, base, 106.0);
}
bool shGift(float id, vec3 p, inout vec3 n, inout Mat m) {
  if (id < 100.0 || id >= 116.0) return false;
  vec3 b = scootSpace(p), s = scootStem(b);
  if (id < 100.5) {                                              // anodised deck: coloured, satin, brushed along its length
    vec3 n2 = n; matPaint(m, n2, p, HUE, 0.75, 0.04, srgb(0.7, 0.7, 0.72), 1.0); n = normalize(mix(n, n2, 0.25));
    float br = noise(vec3(b.x * 6.0, b.y * 420.0, b.z * 420.0));
    m.col *= 0.86 + 0.24 * br; m.rough += 0.08 * br;
    return true;
  }
  if (id < 101.5) {                                              // bare aluminium tube and castings
    matMetal(m, n, p, 0, scootAx);
    m.col = srgb(0.86, 0.87, 0.89) * (0.9 + 0.1 * noise(p * 240.0)); m.rough += 0.06;
    // a printed sleeve on the lower tube: a band of colour between two cream rings, a little scuffed
    float onTube = step(length(s.xz), 0.037);
    float band = onTube * smoothstep(0.235, 0.238, s.y) * (1.0 - smoothstep(0.462, 0.465, s.y));
    if (band > 0.0) {
      float ring = step(abs(s.y - 0.255), 0.008) + step(abs(s.y - 0.445), 0.008) + step(abs(s.y - 0.425), 0.003);
      vec3 n2 = n; Mat pm = newMat(); matPaint(pm, n2, p, mix(HUE, srgb(0.93, 0.89, 0.78), sat(ring)), 0.7, 0.07, m.col, 1.0);
      m = pm; n = normalize(mix(n, n2, 0.25));
    }
    return true;
  }
  if (id < 102.5) {                                              // grip tape: black grit, with two bars of the deck showing through
    vec3 q = b - vec3(-0.085, 0.118, 0.0);
    float cut = step(abs(q.z), 0.045) * (step(abs(q.x + 0.10), 0.012) + step(abs(q.x + 0.06), 0.012));
    matRubber(m, n, p, srgb(0.10, 0.10, 0.105)); m.rough = 0.95;
    float grit = hash1(floor(p * 900.0));
    m.col *= 0.7 + 0.9 * grit; grainN(n, p, 900.0, 0.9);
    if (grit > 0.97) { m.rough = 0.15; m.coat = 1.0; }
    if (cut > 0.5) { matPlastic(m, n, p, HUE, 0.6); }
    return true;
  }
  if (id < 103.5) {                                              // cast urethane: glossy, a little milky
    matPlastic(m, n, p, srgb(0.86, 0.88, 0.90), 0.95);
    m.coat = 0.8; m.coatRough = 0.05; m.sheen = 0.3; m.sheenCol = vec3(0.9, 0.95, 1.0);
    vec3 q = b - scootRA; if (dot(q, q) > 0.03) q = s - vec3(0.0276, -0.1430, 0.0);
    float r = length(q.xy);
    m.col *= 1.0 - 0.3 * smoothstep(0.086, 0.095, r) * smoothstep(0.3, 0.7, fbm3(p * 30.0));        // road dirt on the running face
    m.col *= 0.93 + 0.07 * sin(r * 900.0) * step(abs(q.z), 0.02);
    return true;
  }
  if (id < 104.5) {                                              // closed-cell foam
    matFelt(m, n, p, mix(HUE, vec3(lum(HUE)), 0.15) * 0.8); m.sheen = 0.3; m.sheenCol = HUE;
    float pore = smoothstep(0.75, 0.9, noise(p * 380.0)); m.col *= 1.0 - 0.5 * pore;
    return true;
  }
  if (id < 105.5) { matMetal(m, n, p, 3, vec3(0.0, 1.0, 0.0)); m.rough += 0.2; return true; }           // bell
  if (id < 106.5) { matPlastic(m, n, p, srgb(0.17, 0.17, 0.18), 0.6); return true; }                     // black mouldings
  if (id < 107.5) { matMetal(m, n, p, 3, vec3(0.0, 0.0, 1.0)); m.rough += 0.2; m.col *= 0.9; return true; }   // bolts, pins, bearings
  if (id < 108.5) { matPlastic(m, n, p, HUE * 0.9, 0.7); return true; }                                  // wheel cores
  if (id < 109.5) {                                              // fender: pressed steel plate
    matMetal(m, n, p, 0, vec3(1.0, 0.0, 0.0)); m.col = srgb(0.84, 0.85, 0.87) * (0.9 + 0.1 * noise(p * 240.0)); m.rough += 0.08;
    return true;
  }
  vec3 n2 = n; matPaint(m, n2, p, HUE, 0.8, 0.03, srgb(0.7, 0.7, 0.72), 1.0); n = normalize(mix(n, n2, 0.25));   // collar
  return true;
}
