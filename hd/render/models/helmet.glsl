// Child's cycle helmet, three-quarter view, propped nose-up on its fit cradle so the chin straps hang clear.
// In-mould shell over white EPS foam, long vents, snap-on visor, webbing straps with a side-release buckle, rear adjuster dial.
// About 1.0 long, 0.72 tall. Material ids 100..108. HUE is the shell.
#ifndef HUE
#define HUE srgb(0.37, 0.15, 0.62)
#endif
#define HELM_YAW -0.35
#define HELM_S 1.15
#define HELM_PITCH 0.22
#define HELM_CREAM srgb(0.93, 0.91, 0.85)
vec3 helmGround(vec3 p) { p /= HELM_S; p.xz = rot(HELM_YAW) * p.xz; p.x += 0.03; return p; }            // turned, still upright: the straps hang in this frame
vec3 helmLocal(vec3 g) { g.y -= 0.244; g.xy = rot(HELM_PITCH) * g.xy; return g; }          // the helmet's own frame: x forward, y up, rim near y = 0
float helmRim(float x) { return 0.035 * smoothstep(0.10, 0.44, x) - 0.05 * (1.0 - smoothstep(-0.46, -0.12, x)); }
// outer surface: an egg, longer at the back, with shallow channels along the vent rows. uv = (x, angle round the long axis from the crown)
float helmOuter(vec3 q, out vec2 uv) {
  vec3 r = vec3(q.x > 0.0 ? 0.43 : 0.47, 0.46, 0.355);
  float d = sdEllipsoid(q - vec3(0.0, 0.02, 0.0), r);
  float phi = atan(abs(q.z), q.y - 0.02);
  uv = vec2(q.x, phi);
  float a0 = phi / 0.15, a1 = (phi - 0.52) / 0.15, a2 = (phi - 1.03) / 0.15;
  float ch = exp(-a0 * a0) + exp(-a1 * a1) + exp(-a2 * a2);
  return d + 0.013 * ch * (1.0 - smoothstep(0.30, 0.43, abs(q.x + 0.02)));
}
float helmVents(vec2 uv) {
  vec2 v0 = vec2(uv.x, uv.y * 0.36), v1 = vec2(uv.x, (uv.y - 0.52) * 0.36), v2 = vec2(uv.x, (uv.y - 1.03) * 0.36);
  float d = min(sdSeg2(v0, vec2(0.09, 0.0), vec2(0.285, 0.0)) - 0.040, sdSeg2(v0, vec2(-0.32, 0.0), vec2(-0.07, 0.0)) - 0.040);
  d = min(d, min(sdSeg2(v1, vec2(0.04, 0.0), vec2(0.265, 0.0)), sdSeg2(v1, vec2(-0.33, 0.0), vec2(-0.10, 0.0))) - 0.043);
  d = min(d, min(sdSeg2(v2, vec2(0.01, 0.0), vec2(0.20, 0.0)), sdSeg2(v2, vec2(-0.29, 0.0), vec2(-0.09, 0.0))) - 0.038);
  return d;
}
// a flat strap from a to b, its face to the side of the helmet
float helmBand(vec3 p, vec3 a, vec3 b, float hw, out vec2 uv) {
  vec3 ab = b - a; float l = length(ab); vec3 u = ab / l, v = normalize(cross(vec3(0.0, 0.0, 1.0), u)), w = cross(u, v);
  vec3 q = p - (a + b) * 0.5; uv = vec2(dot(q, u), dot(q, v));
  return sdRBox(vec3(uv, dot(q, w)), vec3(l * 0.5, hw, 0.0042), 0.003);
}
const vec3 helmAf = vec3(0.159, 0.3155, 0.285), helmAr = vec3(-0.156, 0.2155, 0.295), helmDv = vec3(0.060, 0.150, 0.340);
const vec3 helmBt = vec3(0.066, 0.127, 0.348), helmBb = vec3(0.088, 0.013, 0.398);
void helmAll(vec3 p, inout float d);
void mGift(vec3 p, inout float d) {
  float bb = length(p - vec3(0.0, 0.40, 0.0)) - 0.82;
  if (bb > 0.15) { d = min(d, bb); return; }
  float ds = d / HELM_S; helmAll(p, ds); d = ds * HELM_S;       // the model is built at one size and scaled up to fill its box
}
void helmAll(vec3 p, inout float d) {
  vec3 g = helmGround(p), q = helmLocal(g);
  // ---- shell: foam between an outer and an inner egg, cut along the rim, slotted by the vents ----
  vec2 uv; float outer = helmOuter(q, uv);
  float inner = sdEllipsoid(q, vec3(q.x > 0.0 ? 0.365 : 0.405, 0.392, 0.295));
  float sh = smax(outer, -inner, 0.02);
  sh = smax(sh, -(q.y - helmRim(q.x)), 0.018);
  sh = smax(sh, -helmVents(uv) * 0.8, 0.013);
  add(d, sh * 0.75, 100.0);
  // ---- visor: a thin peak clipped on over the brow ----
  float ys = 0.128 - 0.30 * (q.x - 0.36) - 0.45 * q.z * q.z;
  float visor = smax(sdEllipsoid(vec3(q.x - 0.28, 0.0, q.z), vec3(0.285, 1.0, 0.31)), abs(q.y - ys) - 0.0075, 0.008);
  visor = smax(visor, -(outer + 0.012), 0.008);
  visor = max(visor, 0.15 - q.x);
  add(d, visor * 0.7, 101.0);
  add(d, sdRCyl(vec3(q.x - 0.335, abs(q.z) - 0.232, q.y - 0.118).xzy, 0.015, 0.012, 0.005), 107.0);        // its two snap studs
  // ---- fit cradle and adjuster dial at the back ----
  vec3 cq = q - vec3(-0.08, -0.088, 0.0);
  float ring = abs(length(cq.xz * vec2(1.0, 1.14)) - 0.322) - 0.006;
  float cradle = smax(smax(ring, abs(cq.y) - 0.030, 0.006), cq.x + 0.10, 0.01);
  cradle = smin(cradle, sdRBox(q - vec3(-0.415, -0.095, 0.0), vec3(0.024, 0.042, 0.075), 0.012), 0.01);
  add(d, cradle * 0.85, 104.0);
  vec3 dq = (q - vec3(-0.452, -0.098, 0.0)).yxz;                                                        // dial: a ribbed wheel facing backwards
  float da = atan(dq.z, dq.x);
  add(d, (sdRCyl(dq, 0.050 + 0.0024 * sin(da * 22.0), 0.015, 0.005)) * 0.8, 105.0);
  // ---- pads seen under the brow ----
  add(d, sdEllipsoid(vec3(q.x - 0.325, q.y - 0.08, abs(q.z) - 0.07), vec3(0.022, 0.05, 0.06)), 106.0);
  // ---- straps, hanging in the upright frame, mirrored left and right ----
  vec3 gm = vec3(g.xy, abs(g.z)); vec2 su;
  float strap = helmBand(gm, helmAf, helmDv, 0.027, su);
  strap = min(strap, helmBand(gm, helmAr, helmDv + vec3(-0.012, 0.004, -0.008), 0.027, su));
  strap = min(strap, helmBand(gm, helmDv, helmBt, 0.025, su));
  // the anchors run on up inside the shell
  strap = min(strap, helmBand(gm, helmAf, helmAf + vec3(0.02, 0.10, -0.02), 0.027, su));
  strap = min(strap, helmBand(gm, helmAr, helmAr + vec3(-0.03, 0.09, -0.02), 0.027, su));
  add(d, strap, 102.0);
  // strap divider under the ear
  float fit = sdRBox(gm - helmDv - vec3(0.0, 0.004, 0.0), vec3(0.040, 0.017, 0.011), 0.006);
  // buckle: the pronged half on the near side, the socket half on the far side
  vec3 bu = normalize(helmBb - helmBt), bv = normalize(cross(vec3(0.0, 0.0, 1.0), bu)), bw = cross(bu, bv);
  vec3 bq0 = gm - (helmBt + helmBb) * 0.5; vec3 bq = vec3(dot(bq0, bu), dot(bq0, bv), dot(bq0, bw));
  float buckle;
  if (g.z > 0.0) {
    float base = sdRBox(bq - vec3(-0.036, 0.0, 0.0), vec3(0.024, 0.040, 0.011), 0.007);
    base = max(base, -(sdBox(bq - vec3(-0.043, 0.0, 0.0), vec3(0.0055, 0.027, 0.03)) - 0.002));        // strap slot
    float prong = sdRBox(bq - vec3(0.022, 0.0, 0.0), vec3(0.042, 0.0075, 0.006), 0.004);
    vec3 sq = vec3(bq.x, abs(bq.y), bq.z);
    prong = min(prong, sdRBox(sq - vec3(0.016, 0.028, 0.0), vec3(0.034, 0.0065, 0.007), 0.004));
    prong = smin(prong, sdRBox(sq - vec3(0.048, 0.033, 0.0), vec3(0.012, 0.0095, 0.007), 0.004), 0.006);
    buckle = min(base, prong);
  } else {
    buckle = sdRBox(bq, vec3(0.060, 0.042, 0.013), 0.009);
    buckle = max(buckle, -(sdBox(vec3(bq.x - 0.012, abs(bq.y) - 0.042, bq.z), vec3(0.016, 0.010, 0.03)) - 0.003));
    buckle = max(buckle, -(sdBox(bq - vec3(-0.045, 0.0, 0.0), vec3(0.0055, 0.027, 0.03)) - 0.002));
  }
  add(d, min(fit, buckle), 103.0);
}
bool shGift(float id, vec3 p, inout vec3 n, inout Mat m) {
  if (id < 100.0 || id >= 109.0) return false;
  vec3 g = helmGround(p), q = helmLocal(g);
  if (id < 100.5) {
    vec2 uv; float outer = helmOuter(q, uv); float hgt = q.y - helmRim(q.x);
    if (outer > -0.0075 && hgt > 0.004) {                        // the moulded skin: glossy, two-tone, with a pinstripe
      float wave = 0.022 * sin(q.x * 9.0 + 0.6);
      float low = 1.0 - smoothstep(0.094, 0.097, hgt + wave);
      float pin = step(abs(hgt + wave - 0.122), 0.0075);
      vec3 col = mix(HUE, HELM_CREAM, max(low, pin));
      vec3 n2 = n; matPlastic(m, n2, p, col, 0.9); n = normalize(mix(n, n2, 0.2));
      m.coat = 0.6; m.coatRough = 0.05 + 0.06 * smudge(p * 2.0);
      float edge = 1.0 - smoothstep(0.0, 0.006, hgt - 0.004);    // the skin's taped edge at the rim
      m.col *= 1.0 - 0.3 * edge;
      float vd = helmVents(uv);                                  // and its edge turned in round each vent
      m.col *= 1.0 - 0.28 * (1.0 - smoothstep(0.004, 0.012, vd));
    } else if (sdEllipsoid(q, vec3(q.x > 0.0 ? 0.365 : 0.405, 0.392, 0.295)) < 0.007) {   // inside: a dark padded liner
      matFelt(m, n, p, srgb(0.11, 0.11, 0.13));
    } else {                                                     // expanded polystyrene: fused white beads
      vec2 c = voronoi(p * 105.0);
      m.col = srgb(0.93, 0.93, 0.90) * (0.90 + 0.10 * c.y) * (1.0 - 0.12 * smoothstep(0.34, 0.60, c.x));
      m.rough = 0.9; m.sheen = 0.2;
      n = normalize(n + 0.10 * (hash3(vec3(c.y * 91.0, c.y * 37.0, c.y * 13.0)) - 0.5));
    }
    return true;
  }
  if (id < 101.5) { matPlastic(m, n, p, HELM_CREAM, 0.7); return true; }                                  // visor
  if (id < 102.5) {                                              // nylon webbing: a herringbone weave with a bound edge
    vec2 uv = vec2(g.x + g.y, g.x - g.y);
    matCloth(m, n, p, uv, srgb(0.62, 0.64, 0.68), 0.15);
    m.col *= 0.78 + 0.3 * step(0.5, fract((g.y + abs(fract(g.x * 40.0) - 0.5) * 0.02) * 130.0));
    m.rough = 0.7; m.sheen = 0.5;
    return true;
  }
  if (id < 103.5) { matPlastic(m, n, p, HELM_CREAM * 0.95, 0.75); return true; }                           // buckle and divider
  if (id < 104.5) { matPlastic(m, n, p, srgb(0.50, 0.52, 0.55), 0.5); return true; }                       // cradle
  if (id < 105.5) {                                              // dial: cream, with a coloured cap
    vec3 dq = q - vec3(-0.452, -0.098, 0.0);
    matPlastic(m, n, p, mix(HELM_CREAM, HUE, step(length(dq.yz), 0.030) * step(dq.x, -0.008)), 0.7);
    return true;
  }
  if (id < 106.5) { matFelt(m, n, p, srgb(0.16, 0.16, 0.18)); return true; }                               // pads
  matPlastic(m, n, p, HUE * 0.8, 0.8);                                                                     // studs
  return true;
}
