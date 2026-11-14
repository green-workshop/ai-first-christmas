// Child's 14-inch bike with stabilisers: drive side to the camera, turned a little towards it, front wheel steered.
// About 1.22 units long and 0.9 tall. Material ids 100..119. HUE is the frame paint.
#ifndef HUE
#define HUE srgb(0.80, 0.055, 0.045)
#endif
#define BIKE_YAW 0.35
#define BIKE_STEER 0.20
const vec3 bikeRA = vec3(-0.39, 0.215, 0.0);     // rear axle
const vec3 bikeFA = vec3(0.405, 0.215, 0.0);     // front axle (before steering)
const vec3 bikeBB = vec3(-0.08, 0.205, 0.0);     // bottom bracket
const vec3 bikeH0 = vec3(0.275, 0.48, 0.0);      // bottom of the head tube
const vec3 bikeAx = vec3(-0.330, 0.944, 0.0);    // steering axis, pointing up
const vec3 bikeFw = vec3(0.944, 0.330, 0.0);     // square to it, pointing forward

vec3 bikeSpace(vec3 p) { p.xz = rot(BIKE_YAW) * p.xz; p.x -= 0.02; return p; }
// into the frame of the steered parts (fork, front wheel, bars)
vec3 bikeSteer(vec3 b) {
  vec3 v = b - bikeH0; float c = cos(BIKE_STEER), s = sin(BIKE_STEER);
  return bikeH0 + v * c + cross(bikeAx, v) * s + bikeAx * dot(bikeAx, v) * (1.0 - c);
}
// a point given along the fork axis: u forward, w up the axis, z sideways
vec3 bikeL(float u, float w, float z) { return bikeH0 + bikeFw * u + bikeAx * w + vec3(0.0, 0.0, z); }

float bikeSpokes(vec3 q, float side) {
  const float n = 10.0, sec = TAU / 10.0, lead = 0.62;
  float a = atan(q.y, q.x) - side * lead * 0.5 + (side > 0.0 ? 0.0 : sec * 0.5);
  float i0 = floor(a / sec + 0.5), d = 1e9;
  for (int k = -1; k <= 1; k++) {
    float ai = (i0 + float(k)) * sec - (side > 0.0 ? 0.0 : sec * 0.5);
    vec3 A = vec3(0.027 * cos(ai), 0.027 * sin(ai), side * 0.031), B = vec3(0.137 * cos(ai + side * lead), 0.137 * sin(ai + side * lead), side * 0.006);
    d = min(d, sdCapsule(q, A, B, 0.0026));
  }
  return d;
}
// a wheel about the z axis, centred on q = 0
void bikeWheel(vec3 q, float tyreId, inout float d) {
  float r = length(q.xy);
  float bnd = max(r - 0.224, abs(q.z) - 0.07);
  if (bnd > 0.04) { d = min(d, bnd); return; }
  float a = atan(q.y, q.x);
  // tyre with knobbly tread: a centre row and two staggered shoulder rows of blocks
  vec2 cs = vec2(r - 0.180, q.z);
  float psi = atan(abs(cs.y), cs.x);
  float row = step(0.5, psi);
  float kn = smoothstep(-0.1, 0.45, cos(a * 44.0 + row * PI)) * smoothstep(0.05, 0.16, abs(psi - 0.5)) * (1.0 - smoothstep(1.0, 1.25, psi));
  float ty = length(cs) - 0.0295 - 0.0055 * kn;
  ty = smin(ty, length(vec2(r - 0.158, abs(q.z) - 0.019)) - 0.006, 0.008);   // bead
  add(d, ty * 0.7, tyreId);
  // chrome rim, hub, spokes
  float rim = sdBox2(vec2(r - 0.1465, q.z), vec2(0.0075, 0.021)) - 0.0045;
  rim = smax(rim, -(length(vec2(r - 0.134, q.z)) - 0.008), 0.004);
  float hub = sdRCyl(q.xzy, 0.016, 0.05, 0.005);
  hub = smin(hub, sdRCyl(vec3(q.x, abs(q.z) - 0.031, q.y), 0.031, 0.0035, 0.0015), 0.004);
  float sp = min(bikeSpokes(q, 1.0), bikeSpokes(q, -1.0));
  add(d, min(min(rim, hub), sp), 101.0);
  // axle nuts and the valve
  vec3 nq = vec3(q.xy, abs(q.z) - 0.064);
  float na = mod(atan(nq.y, nq.x), TAU / 6.0) - TAU / 12.0; vec2 nh = length(nq.xy) * vec2(cos(na), sin(na));
  add(d, max(smax(nh.x - 0.0115, abs(nq.z) - 0.007, 0.003), -(length(nq.xy) - 0.005)), 106.0);
  add(d, sdCapsule(q, vec3(-0.036, 0.130, 0.0), vec3(-0.031, 0.112, 0.0), 0.0042), 110.0);
}
// mudguard: a band rolled round the wheel between two angles
float bikeGuard(vec3 q, float mid, float hw, float R) {
  q.xy = rot(mid) * q.xy;
  float a = clamp(atan(q.y, q.x), -hw, hw);
  float Rz = R - 5.0 * q.z * q.z;
  float d2 = length(q.xy - Rz * vec2(cos(a), sin(a)));
  return (length(vec2(d2, max(abs(q.z) - 0.040, 0.0))) - 0.0035) * 0.85;
}
float bikeFrame(vec3 b) {
  vec3 q = vec3(b.xy, abs(b.z));
  float d = sdCapsule(b, bikeBB, vec3(-0.175, 0.52, 0.0), 0.024);                                         // seat tube
  d = smin(d, sdCapsule(b, vec3(0.262, 0.515, 0.0), bikeBB + vec3(0.012, 0.012, 0.0), 0.027), 0.012);    // down tube
  d = smin(d, sdCapsule(b, vec3(0.232, 0.612, 0.0), vec3(-0.148, 0.432, 0.0), 0.0225), 0.012);           // top tube
  d = smin(d, sdCapsule(b, bikeH0 + bikeAx * 0.012, bikeH0 + bikeAx * 0.158, 0.030), 0.012);             // head tube
  d = smin(d, sdRCyl((b - bikeBB).xzy, 0.034, 0.046, 0.006), 0.01);                                      // bottom bracket shell
  d = smin(d, sdCapsule(q, vec3(-0.166, 0.493, 0.024), bikeRA + vec3(0.0, 0.0, 0.055), 0.0125), 0.01);   // seat stays
  d = smin(d, sdCapsule(q, bikeBB + vec3(-0.02, 0.0, 0.04), bikeRA + vec3(0.0, 0.0, 0.055), 0.013), 0.01); // chain stays
  d = smin(d, sdRBox(q - bikeRA - vec3(0.004, 0.0, 0.055), vec3(0.024, 0.018, 0.0045), 0.003), 0.008);   // dropouts
  return d;
}
float bikeSaddle(vec3 b) {
  vec3 q = b - vec3(-0.212, 0.646, 0.0); q.xy = rot(-0.07) * q.xy;
  float t = sat((q.x + 0.13) / 0.27);
  float w = mix(0.080, 0.027, smoothstep(0.12, 0.9, t));
  q.y -= 0.022 * (1.0 - smoothstep(-0.14, -0.02, q.x));
  float d = sdEllipsoid(vec3(q.x, q.y, q.z * 0.080 / w), vec3(0.142, 0.036, 0.080));
  d = smax(d, -(q.y + 0.014), 0.014);
  return d * 0.55;
}
void mGift(vec3 p, inout float d) {
  float bb = length(p - vec3(0.0, 0.45, 0.0)) - 0.78;
  if (bb > 0.15) { d = min(d, bb); return; }
  vec3 b = bikeSpace(p), s = bikeSteer(b);
  vec3 q = vec3(b.xy, abs(b.z));
  vec3 sq = vec3(s.xy, abs(s.z));

  // ---- frame ----
  add(d, bikeFrame(b), 100.0);
  // head badge
  add(d, sdEllipsoid(b - bikeL(0.030, 0.092, 0.0), vec3(0.006, 0.026, 0.017)), 111.0);

  // ---- wheels ----
  bikeWheel(b - bikeRA, 102.0, d);
  bikeWheel(s - bikeFA, 112.0, d);
  add(d, bikeGuard(b - bikeRA, 2.02, 1.22, 0.2365), 109.0);
  add(d, bikeGuard(s - bikeFA, 1.50, 0.95, 0.2365), 109.0);
  // mudguard stays
  float stay = sdCapsule(q, bikeRA + vec3(0.0, 0.0, 0.062), bikeRA + vec3(-0.228, -0.048, 0.040), 0.0035);
  stay = min(stay, sdCapsule(sq, bikeFA + vec3(0.0, 0.0, 0.060), bikeFA + vec3(0.150, 0.178, 0.040), 0.0035));
  add(d, stay, 101.0);

  // ---- seat post and saddle ----
  float post = sdCapsule(b, vec3(-0.175, 0.52, 0.0), vec3(-0.199, 0.602, 0.0), 0.014);
  vec3 cq = b - vec3(-0.176, 0.523, 0.0); cq.xy = rot(-0.29) * cq.xy;
  float clampRing = sdRCyl(cq, 0.0295, 0.012, 0.004);
  clampRing = min(clampRing, sdRCyl((cq - vec3(-0.036, 0.0, 0.0)).xzy, 0.007, 0.022, 0.002));            // pinch bolt
  // saddle rails and clamp
  float rails = sdCapsule(q, vec3(-0.285, 0.622, 0.022), vec3(-0.125, 0.612, 0.018), 0.005);
  rails = min(rails, sdRBox(b - vec3(-0.202, 0.612, 0.0), vec3(0.022, 0.012, 0.03), 0.005));
  add(d, min(min(post, clampRing), rails), 101.0);
  add(d, bikeSaddle(b), 103.0);

  // ---- drivetrain (drive side is +z) ----
  vec3 cr = b - bikeBB;
  float chain = extrudeR(abs(sdCone(vec3(b.xy, 0.0), bikeBB, bikeRA, 0.060, 0.027)) - 0.0048, b.z - 0.052, 0.0055, 0.002);
  add(d, chain, 106.0);
  // chainring with five holes, and the rear sprocket
  float ca = mod(atan(cr.y, cr.x) + 0.3, TAU / 5.0) - TAU / 10.0; vec2 ch = length(cr.xy) * vec2(cos(ca), sin(ca));
  float ring = max(length(cr.xy) - 0.056, abs(cr.z - 0.052) - 0.0028);
  ring = smax(ring, -(length(ch - vec2(0.035, 0.0)) - 0.0125), 0.003);
  float sprocket = max(length((b - bikeRA).xy) - 0.024, abs(b.z - 0.052) - 0.0028);
  // cranks: right one forward and down, left one opposite
  vec2 cdir = vec2(cos(-0.62), sin(-0.62));
  vec3 pr = vec3(cdir * 0.092, 0.084), pl = vec3(-cdir * 0.092, -0.084);
  float crank = sdCone(cr, vec3(0.0, 0.0, 0.080), pr, 0.0145, 0.0105);
  crank = min(crank, sdCone(cr, vec3(0.0, 0.0, -0.080), pl, 0.0145, 0.0105));
  crank = min(crank, sdRCyl(cr.xzy, 0.011, 0.088, 0.003));                                               // axle
  crank = min(crank, sdCapsule(cr, pr, pr + vec3(0.0, 0.0, 0.022), 0.006));
  crank = min(crank, sdCapsule(cr, pl, pl - vec3(0.0, 0.0, 0.022), 0.006));
  add(d, min(min(ring, sprocket), crank), 101.0);
  // pedals: a ribbed block with reflectors front and back
  vec3 p1 = cr - pr - vec3(0.0, 0.0, 0.050), p2 = cr - pl + vec3(0.0, 0.0, 0.050);
  p1.xy = rot(0.12) * p1.xy; p2.xy = rot(-0.2) * p2.xy;
  float ped = min(sdRBox(p1, vec3(0.043, 0.012, 0.030), 0.006) + 0.0015 * sin(p1.z * 420.0), sdRBox(p2, vec3(0.043, 0.012, 0.030), 0.006) + 0.0015 * sin(p2.z * 420.0));
  add(d, ped * 0.8, 107.0);
  // chainguard: a pressed plate over the top run and the front of the chainring
  float g2 = sdCone(vec3(b.xy, 0.0), bikeBB, bikeRA + vec3(0.03, 0.0, 0.0), 0.080, 0.046);
  float cut = b.y - 0.202 + 0.75 * max(b.x - (bikeBB.x - 0.035), 0.0);
  g2 = smax(g2, -cut, 0.025);
  float guard = extrudeR(g2, b.z - 0.064, 0.0045, 0.003);
  guard -= 0.0025 * (1.0 - smoothstep(0.0, 0.006, abs(g2 + 0.014)));                                     // pressed rib near the edge
  add(d, guard * 0.8, 105.0);

  // ---- stabilisers ----
  vec3 sb = q - bikeRA;
  float arm = sdCapsule(sb, vec3(0.0, 0.0, 0.068), vec3(0.0, -0.080, 0.100), 0.0085);
  arm = smin(arm, sdCapsule(sb, vec3(0.0, -0.080, 0.100), vec3(0.0, -0.157, 0.152), 0.0085), 0.008);
  arm = min(arm, sdCapsule(sb, vec3(0.0, -0.060, 0.092), vec3(0.085, 0.0, 0.058), 0.0055));              // brace to the chain stay
  arm = min(arm, sdRCyl((sb - vec3(0.0, -0.157, 0.175)).xzy, 0.007, 0.034, 0.002));                      // little axle
  add(d, arm, 101.0);
  vec3 w = sb - vec3(0.0, -0.157, 0.180);
  float wr = length(w.xy);
  float sw = sdRCyl(w.xzy, 0.058, 0.021, 0.013);
  sw = smax(sw, -(sdRCyl(vec3(w.x, abs(w.z) - 0.024, w.y), 0.038, 0.009, 0.003)), 0.004);                // dished both sides
  sw = min(sw, sdRCyl(w.xzy, 0.015, 0.024, 0.004));
  add(d, sw, 108.0);

  // ---- fork, headset, stem, bars (steered) ----
  float fork = sdRBox(vec3(dot(s - bikeH0, bikeFw), dot(s - bikeH0, bikeAx) + 0.018, s.z), vec3(0.021, 0.014, 0.060), 0.011);
  fork = smin(fork, sdCone(sq, bikeL(0.0, -0.022, 0.051), bikeFA + vec3(0.0, 0.0, 0.056), 0.0165, 0.0115), 0.01);
  fork = smin(fork, sdRBox(sq - bikeFA - vec3(0.0, 0.0, 0.056), vec3(0.016, 0.02, 0.004), 0.003), 0.006);
  add(d, fork, 100.0);
  vec3 hl = vec3(dot(s - bikeH0, bikeFw), dot(s - bikeH0, bikeAx), s.z);                                 // u, w, z
  float cups = min(sdRCyl(hl.xyz - vec3(0.0, 0.004, 0.0), 0.034, 0.010, 0.004), sdRCyl(hl - vec3(0.0, 0.166, 0.0), 0.034, 0.010, 0.004));
  cups = min(cups, sdRCyl(hl - vec3(0.0, 0.182, 0.0), 0.024, 0.008, 0.003));                             // lock nut
  float stem = sdCapsule(hl, vec3(0.0, 0.17, 0.0), vec3(0.0, 0.262, 0.0), 0.0145);
  stem = smin(stem, sdCapsule(hl, vec3(0.0, 0.262, 0.0), vec3(0.040, 0.268, 0.0), 0.016), 0.008);
  stem = smin(stem, sdRCyl((hl - vec3(0.044, 0.268, 0.0)).xzy, 0.021, 0.026, 0.005), 0.006);
  stem = min(stem, sdRCyl(hl - vec3(0.0, 0.282, 0.0), 0.008, 0.006, 0.002));                             // expander bolt
  vec3 ha = vec3(hl.xy, abs(hl.z));
  float bar = sdCapsule(ha, vec3(0.044, 0.268, 0.0), vec3(0.044, 0.268, 0.066), 0.0125);
  bar = smin(bar, sdCapsule(ha, vec3(0.044, 0.268, 0.066), vec3(0.020, 0.418, 0.150), 0.0125), 0.012);
  bar = smin(bar, sdCapsule(ha, vec3(0.020, 0.418, 0.150), vec3(-0.012, 0.424, 0.262), 0.0125), 0.012);
  bar = min(bar, sdCapsule(ha, vec3(0.033, 0.338, 0.105), vec3(0.033, 0.338, 0.0), 0.010));              // crossbar
  // brake levers: a clamp, and a blade reaching out in front of each grip
  float lever = sdRCyl((ha - vec3(0.010, 0.421, 0.168)).xzy, 0.018, 0.009, 0.004);
  lever = smin(lever, sdCapsule(ha, vec3(0.022, 0.414, 0.168), vec3(0.046, 0.404, 0.176), 0.008), 0.006);
  lever = smin(lever, sdCone(ha, vec3(0.046, 0.404, 0.176), vec3(0.050, 0.398, 0.262), 0.0065, 0.0055), 0.006);
  lever = min(lever, sdSphere(ha - vec3(0.050, 0.398, 0.264), 0.0085));
  add(d, min(min(cups, stem), min(bar, lever)), 101.0);
  // grips: ribbed rubber with a flange
  vec3 gd = normalize(vec3(-0.032, 0.006, 0.112));
  vec3 g0 = vec3(0.016, 0.4188, 0.182);
  float gt = dot(ha - g0, gd);
  float grip = sdCapsule(ha, g0, g0 + gd * 0.092, 0.0205) + 0.0016 * sin(gt * 520.0) * step(0.006, gt);
  grip = min(grip, sdCapsule(ha, g0 - gd * 0.004, g0 + gd * 0.002, 0.0275));
  add(d, grip * 0.8, 104.0);
  // front brake: a side-pull caliper under the fork crown, and its cable up to the right lever
  vec3 bq = vec3(hl.x - 0.030, hl.y + 0.052, abs(hl.z));
  float cal = sdCapsule(bq, vec3(0.0, 0.020, 0.0), vec3(0.0, 0.006, 0.040), 0.0065);
  cal = smin(cal, sdCapsule(bq, vec3(0.0, 0.006, 0.040), vec3(0.0, -0.050, 0.036), 0.006), 0.006);
  add(d, cal, 101.0);
  add(d, sdRBox(bq - vec3(0.0, -0.052, 0.029), vec3(0.016, 0.006, 0.006), 0.003), 110.0);
  float cable = sdCapsule(hl, vec3(0.030, 0.405, 0.170), vec3(0.0938, 0.3197, 0.1294), 0.0038);
  cable = min(cable, sdCapsule(hl, vec3(0.0938, 0.3197, 0.1294), vec3(0.115, 0.2188, 0.0875), 0.0038));
  cable = min(cable, sdCapsule(hl, vec3(0.115, 0.2188, 0.0875), vec3(0.0938, 0.1022, 0.0444), 0.0038));
  cable = min(cable, sdCapsule(hl, vec3(0.0938, 0.1022, 0.0444), vec3(0.030, -0.030, 0.0), 0.0038));
  add(d, cable, 104.0);
  // white front reflector on the crossbar
  add(d, sdRCyl((hl - vec3(0.050, 0.338, 0.0)).yxz, 0.023, 0.007, 0.003), 113.0);
}
bool shGift(float id, vec3 p, inout vec3 n, inout Mat m) {
  if (id < 100.0 || id >= 120.0) return false;
  vec3 b = bikeSpace(p);
  if (id < 100.5) {                                              // frame enamel, with a cream panel on the down tube and bands on the seat tube
    vec3 col = HUE;
    vec3 a0 = vec3(0.262, 0.515, 0.0), ab = bikeBB - a0; float t = dot(b - a0, ab) / dot(ab, ab);
    float onDown = step(abs(dot(b.xy - a0.xy, normalize(vec2(-ab.y, ab.x)))), 0.03) * step(abs(b.z), 0.04);
    float panel = smoothstep(0.24, 0.25, t) * (1.0 - smoothstep(0.74, 0.75, t)) * onDown;
    float line = panel * (step(abs(t - 0.285), 0.012) + step(abs(t - 0.705), 0.012));
    col = mix(col, srgb(0.93, 0.88, 0.74), panel); col = mix(col, srgb(0.78, 0.58, 0.16), sat(line));
    float sy = (b.y - 0.205) / 0.315;                            // up the seat tube
    float onSeat = step(abs(b.x - mix(-0.08, -0.175, sy)), 0.03) * step(abs(b.z), 0.03);
    col = mix(col, srgb(0.93, 0.88, 0.74), onSeat * (step(abs(sy - 0.34), 0.035) + step(abs(sy - 0.52), 0.035)));
    vec3 n2 = n; matPaint(m, n2, p, col, 0.92, 0.05, srgb(0.5, 0.5, 0.52), 1.0); n = normalize(mix(n, n2, 0.3));
    return true;
  }
  if (id < 101.5) { matMetal(m, n, p, 3, vec3(1.0, 0.0, 0.0)); m.rough += 0.22; return true; }
  if (id < 102.5 || abs(id - 112.0) < 0.5) {                     // tyres: black tread, white wall
    vec3 q = id < 103.0 ? b - bikeRA : bikeSteer(b) - bikeFA;
    float r = length(q.xy);
    float wall = smoothstep(0.161, 0.165, r) * (1.0 - smoothstep(0.189, 0.193, r)) * step(0.008, abs(q.z));
    matRubber(m, n, p, mix(srgb(0.09, 0.088, 0.085), srgb(0.90, 0.88, 0.82), wall));
    m.col *= 1.0 - 0.25 * wall * smoothstep(0.4, 0.8, fbm3(p * 9.0));      // scuffs on the white
    m.rough = 0.7;
    return true;
  }
  if (id < 103.5) {                                              // saddle: black vinyl with a cream band round the skirt
    vec3 q = b - vec3(-0.212, 0.646, 0.0); q.xy = rot(-0.07) * q.xy;
    float skirt = 1.0 - smoothstep(-0.004, -0.001, q.y - 0.022 * (1.0 - smoothstep(-0.14, -0.02, q.x)));
    vec3 n2 = n; matPlastic(m, n2, p, mix(srgb(0.085, 0.085, 0.09), srgb(0.90, 0.87, 0.78), skirt), 0.45); n = normalize(mix(n, n2, 0.3));
    m.rough = 0.42 + 0.1 * smudge(p * 3.0); m.coat = 0.25; m.coatRough = 0.25;
    return true;
  }
  if (id < 104.5) { matRubber(m, n, p, srgb(0.88, 0.86, 0.80)); m.rough = 0.55; return true; }             // grips
  if (id < 105.5) {                                              // chainguard: cream plastic with a painted stripe
    float g2 = sdCone(vec3(b.xy, 0.0), bikeBB, bikeRA + vec3(0.03, 0.0, 0.0), 0.080, 0.046);
    float stripe = step(abs(g2 + 0.036), 0.009) * step(0.062, b.z);
    matPlastic(m, n, p, mix(srgb(0.92, 0.89, 0.80), HUE, stripe), 0.7);
    return true;
  }
  if (id < 106.5) {                                              // chain and nuts: oiled dark steel
    matMetal(m, n, p, 0, vec3(1.0, 0.0, 0.0));
    float t = atan(b.y - bikeBB.y, b.x - bikeBB.x);
    m.col *= 0.75 + 0.3 * step(0.5, fract((b.x + 0.4 * t) * 60.0));
    m.rough = 0.4;
    return true;
  }
  if (id < 107.5) {                                              // pedals: grey plastic, amber reflectors on the long edges
    vec3 cr = b - bikeBB; vec2 cdir = vec2(cos(-0.62), sin(-0.62));
    vec3 pr = vec3(cdir * 0.092, 0.084), pl = vec3(-cdir * 0.092, -0.084);
    vec3 p1 = cr - pr - vec3(0.0, 0.0, 0.050), p2 = cr - pl + vec3(0.0, 0.0, 0.050);
    p1.xy = rot(0.12) * p1.xy; p2.xy = rot(-0.2) * p2.xy;
    vec3 q = dot(p1, p1) < dot(p2, p2) ? p1 : p2;
    float refl = step(0.036, abs(q.x)) * step(abs(q.z), 0.020) * step(abs(q.y), 0.008);
    refl = max(refl, step(0.026, abs(q.z)) * step(abs(q.x), 0.028) * step(abs(q.y), 0.008));
    matPlastic(m, n, p, mix(srgb(0.20, 0.20, 0.21), srgb(0.95, 0.42, 0.04), refl), 0.6);
    if (refl > 0.5) { m.coat = 1.0; m.coatRough = 0.03; grainN(n, p, 300.0, 0.5); }
    return true;
  }
  if (id < 108.5) {                                              // stabiliser wheels: white hub, grey tyre moulded on
    vec3 w = vec3(b.xy, abs(b.z)) - bikeRA - vec3(0.0, -0.157, 0.180);
    float wr = length(w.xy);
    float tyre = smoothstep(0.040, 0.042, wr);
    float web = step(0.016, wr) * (1.0 - tyre) * step(0.75, cos(atan(w.y, w.x) * 5.0));
    matPlastic(m, n, p, mix(srgb(0.90, 0.89, 0.85) * (1.0 - 0.25 * web), srgb(0.16, 0.16, 0.165), tyre), 0.5);
    if (tyre > 0.5) { m.rough = 0.7; m.coat = 0.0; }
    return true;
  }
  if (id < 109.5) { matMetal(m, n, p, 0, vec3(1.0, 0.0, 0.0)); m.col = srgb(0.88, 0.89, 0.91) * (0.92 + 0.08 * noise(p * 300.0)); m.rough += 0.10; return true; }             // mudguards
  if (id < 110.5) { matRubber(m, n, p, srgb(0.10, 0.10, 0.10)); return true; }
  if (id < 111.5) { matMetal(m, n, p, 1, vec3(0.0, 1.0, 0.0)); return true; }
  // reflector: prismatic plastic
  matPlastic(m, n, p, srgb(0.95, 0.95, 0.93), 1.0); m.coat = 1.0; m.coatRough = 0.03; grainN(n, p, 260.0, 0.6);
  return true;
}
