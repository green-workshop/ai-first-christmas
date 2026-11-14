// A rough pine shipping crate with nobody knows what inside: nailed slats on battens, a plank lid, skids, zinc corner
// plates, rope handles, and a big "?" stencilled on the front in black paint. Material ids 100..106.
const float crateYaw = 0.44;
const vec3 crateO = vec3(0.45, 0.40, 0.34);      // half size over the battens and lid
const float cratePitch = 0.16;                    // one slat and its gap (five slats up each side)
// world -> crate space: origin at the middle of the box, x along its length
vec3 crateLocal(vec3 p) { p.xz = rot(crateYaw) * p.xz; return p - vec3(0.0, crateO.y + 0.045, 0.0); }
float crateSlatK(float y) { return clamp(floor(y / cratePitch + 2.5), 0.0, 4.0); }
// a wall of five slats: q.x along the slats, q.y up, q.z out from the middle of their thickness
float crateSlats(vec3 q, float halfLen, float seed) {
  float k = crateSlatK(q.y), ly = q.y - (k - 2.0) * cratePitch, h = hash1(k * 7.3 + seed), h2 = hash1(k * 3.1 + seed + 5.0);
  float box = sdRBox(vec3(q.x, ly, q.z - 0.007 * (h - 0.5)), vec3(halfLen - 0.008 * h2, 0.5 * cratePitch - 0.007, 0.013), 0.004);
  // chipped and splintered edges
  float chip = smoothstep(0.5, 0.8, noise(vec3(q.x * 11.0 + k * 3.3 + seed, ly * 30.0, seed))) * smoothstep(0.5 * cratePitch - 0.032, 0.5 * cratePitch - 0.008, abs(ly));
  return box + 0.011 * chip;
}
float crateArc(vec2 p, vec2 c, float R, float a0, float a1) {
  p -= c; float mid = 0.5 * (a0 + a1), a = mid + mod(atan(p.y, p.x) - mid + PI, TAU) - PI;
  a = clamp(a, a0, a1);
  return length(p - R * vec2(cos(a), sin(a)));
}
// the stencil: distance to the painted part of a bold "?", cut with square ends and the bridges that hold a stencil together
float crateQ(vec2 p) {
  p = rot(0.045) * p / 1.2; p.y += 0.035;
  vec2 c = vec2(0.0, 0.150); float a0 = radians(-52.0), a1 = radians(172.0);
  vec2 e = c + 0.118 * vec2(cos(a0), sin(a0)), s = c + 0.118 * vec2(cos(a1), sin(a1)), t = vec2(-sin(a1), cos(a1));
  float stroke = min(crateArc(p, c, 0.118, a0, a1), sdBezier(p, e, vec2(0.012, 0.015), vec2(0.0, -0.062))) - 0.041;
  stroke = max(stroke, -max(-dot(p - s, t), p.x + 0.05));                         // square start of the hook
  stroke = max(stroke, -max(p.y + 0.062, -(p.y + 0.14)));                         // square foot of the stem
  stroke = max(stroke, -max(abs(p.x + 0.012) - 0.0075, 0.20 - p.y));              // bridge at the top
  stroke = max(stroke, -max(abs(p.y - 0.050) - 0.0075, 0.02 - p.x));              // bridge at the bend
  float dotd = sdBox2(p - vec2(0.0, -0.185), vec2(0.034)) - 0.008;
  return min(stroke, dotd) * 1.2;
}
void mGift(vec3 p, inout float d) {
  float bb = length(p - vec3(0.0, 0.44, 0.0)) - 0.80;
  if (bb > 0.15) { d = min(d, bb); return; }
  vec3 g = crateLocal(p), a = abs(g), O = crateO;
  add(d, sdBox(g, O - vec3(0.045, 0.02, 0.045)), 104.0);                                                    // the dark inside
  add(d, crateSlats(vec3(g.x, g.y, a.z - (O.z - 0.035)), O.x - 0.002, g.z > 0.0 ? 1.0 : 2.0), 100.0);     // front and back
  add(d, crateSlats(vec3(g.z, g.y, a.x - (O.x - 0.035)), O.z - 0.048, g.x > 0.0 ? 3.0 : 4.0), 101.0);     // ends
  // battens: upright boards nailed over the slats at every corner
  float bat = sdRBox(vec3(a.x - (O.x - 0.052), g.y + 0.015, a.z - (O.z - 0.011)), vec3(0.052, O.y - 0.017, 0.011), 0.004);
  bat = min(bat, sdRBox(vec3(a.x - (O.x - 0.011), g.y + 0.015, a.z - (O.z - 0.022 - 0.047)), vec3(0.011, O.y - 0.017, 0.047), 0.004));
  add(d, bat, 102.0);
  // lid: three planks, not quite level with each other; and two skids underneath
  float lp = 2.0 * O.z / 3.0, k = clamp(floor(g.z / lp + 1.5), 0.0, 2.0), lz = g.z - (k - 1.0) * lp, lh = hash1(k * 5.1 + 2.0);
  float lid = sdRBox(vec3(g.x - 0.006 * (lh - 0.5), g.y - (O.y - 0.016) - 0.004 * (lh - 0.5), lz), vec3(O.x + 0.004, 0.016, 0.5 * lp - 0.005), 0.004);
  lid = min(lid, sdRBox(vec3(a.x - 0.27, g.y + O.y + 0.022, g.z), vec3(0.055, 0.022, O.z - 0.004), 0.005));
  add(d, lid, 103.0);
  // zinc-plated corner plates, three leaves folded round each corner, a dome-headed nail in each leaf
  vec3 c = O + 0.005 - a;
  float plate = max(sdRBox(g, O + 0.005, 0.008), max(max(c.x, max(c.y, c.z)) - 0.125, (c.x + c.y + c.z - 0.19) * 0.5774));
  vec3 n1 = a - vec3(O.x - 0.048, O.y - 0.048, O.z + 0.001), n2 = a - vec3(O.x + 0.001, O.y - 0.048, O.z - 0.048), n3 = a - vec3(O.x - 0.048, O.y + 0.001, O.z - 0.048);
  plate = min(plate, sqrt(min(dot(n1, n1), min(dot(n2, n2), dot(n3, n3)))) - 0.012);
  add(d, plate, 105.0);
  // rope handles: a loop of sisal through two holes in each end
  float xr = a.x - (O.x - 0.022 + 0.020);
  float rope = length(vec2(sdBezier(g.zy, vec2(-0.115, 0.13), vec2(0.0, -0.17), vec2(0.115, 0.13)), xr));
  rope = min(rope, sdCapsule(vec3(xr, g.y, abs(g.z)), vec3(0.0, 0.13, 0.115), vec3(-0.05, 0.135, 0.115), 0.0));
  rope -= 0.0155 + 0.0035 * sin(g.z * 190.0 + g.y * 130.0 + a.x * 210.0);
  rope = min(rope, sdSphere(vec3(xr + 0.004, g.y - 0.132, abs(g.z) - 0.115), 0.024) - 0.003 * sin(g.y * 300.0 + g.z * 200.0));   // stopper knots
  add(d, rope * 0.7, 106.0);
}
bool shGift(float id, vec3 p, inout vec3 n, inout Mat m) {
  if (id < 100.0 || id >= 107.0) return false;
  vec3 g = crateLocal(p), a = abs(g), O = crateO;
  vec3 ax = vec3(cos(crateYaw), 0.0, sin(crateYaw)), az = vec3(-sin(crateYaw), 0.0, cos(crateYaw));       // crate x and z in the world
  if (id < 101.5) {
    // pine slats, rough from the saw
    bool front = id < 100.5;
    vec3 q = front ? vec3(g.x, g.y, g.z) : vec3(g.z, g.y, g.x);
    float seed = front ? (g.z > 0.0 ? 1.0 : 2.0) : (g.x > 0.0 ? 3.0 : 4.0);
    float k = crateSlatK(q.y), ly = q.y - (k - 2.0) * cratePitch, h = hash1(k * 7.3 + seed), h2 = hash1(k * 3.1 + seed + 5.0), h3 = hash1(k * 1.9 + seed + 11.0);
    matWood(m, n, vec3(q.x, ly, q.z) * 1.1 + vec3(k * 3.1, k * 1.7 + seed, seed * 2.3), vec3(1.0, 0.0, 0.02), 0.03 + 0.14 * h, 0.0);
    m.col *= 0.84 + 0.3 * h2;
    m.col = mix(m.col, vec3(lum(m.col)) * vec3(0.95, 0.97, 1.0), 0.35 * h3);                              // some boards have gone grey
    // a knot or two
    vec2 kc = vec2((h3 - 0.5) * 1.1 * O.x, (h - 0.5) * 0.07), kq = (vec2(q.x, ly) - kc) * vec2(0.6, 1.0);
    float kr = length(kq) + 0.004 * noise(q * 60.0);
    if (h2 > 0.3) {
      float ring = 0.5 + 0.5 * sin(kr * 900.0);
      m.col = mix(m.col, srgb(0.27, 0.14, 0.07) * (0.7 + 0.5 * ring), 1.0 - smoothstep(0.016, 0.024, kr));
      m.col *= 0.8 + 0.2 * smoothstep(0.02, 0.05, kr);
    }
    // saw marks across the board, grime in the joints and near the floor
    vec3 along = front ? ax : az;
    n = normalize(n + 0.07 * sin(q.x * 240.0 + 5.0 * noise(vec2(ly * 30.0, k))) * along);
    m.col *= 0.72 + 0.28 * smoothstep(0.0, 0.03, 0.5 * cratePitch - 0.007 - abs(ly));
    m.col *= 0.75 + 0.25 * smoothstep(-O.y, -O.y + 0.3, g.y);
    if (front && g.z > 0.0) {
      // the stencil: black paint, thin on the raised grain, a little fuzzy at the edge, a breath of overspray round it
      float sd = crateQ(g.xy) + 0.006 * (noise(g * 55.0) - 0.5);
      float fibre = noise(vec3(q.x * 30.0, ly * 400.0, 1.0));
      float cover = (1.0 - smoothstep(-0.004, 0.004, sd)) * (0.80 + 0.2 * smoothstep(0.2, 0.5, fibre));
      float mist = 0.35 * exp(-max(sd, 0.0) / 0.022) * (0.4 + 0.6 * noise(g * 160.0));
      m.col = mix(m.col, srgb(0.035, 0.035, 0.04), max(cover, mist));
      m.rough = mix(m.rough, 0.5, cover);
    }
    return true;
  }
  if (id < 102.5) {
    // battens, with the nails that hold each slat
    matWood(m, n, g * 1.1 + vec3(sign(g.x) * 2.0, 0.0, sign(g.z) * 3.0), vec3(0.03, 1.0, 0.0), 0.10, 0.0);
    m.col *= 0.9;
    bool onFront = a.z > O.z - 0.006;
    float cx = onFront ? a.x - (O.x - 0.052) : a.z - (O.z - 0.069);
    float ny = (fract(g.y / (0.5 * cratePitch)) - 0.5) * 0.5 * cratePitch;
    float nd = length(vec2(abs(cx) - 0.022, ny));
    m.col *= 0.8 + 0.2 * smoothstep(0.006, 0.02, nd);                                                    // bruise round the head
    m.col = mix(m.col, srgb(0.30, 0.15, 0.07), 0.3 * (1.0 - smoothstep(0.0, 0.006, abs(abs(cx) - 0.022))) * smoothstep(0.0, -0.035, ny) * step(ny, 0.0));   // rust weeping down
    if (nd < 0.0065) { m.col = srgb(0.20, 0.19, 0.19); m.metal = 0.8; m.rough = 0.45; }
    m.col *= 0.75 + 0.25 * smoothstep(-O.y, -O.y + 0.3, g.y);
    return true;
  }
  if (id < 103.5) {
    bool skid = g.y < -O.y + 0.004;
    float k = clamp(floor(g.z / (2.0 * O.z / 3.0) + 1.5), 0.0, 2.0);
    matWood(m, n, g * 1.1 + vec3(k * 4.0, k, 9.0), skid ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.02, 0.0), skid ? 0.2 : 0.04 + 0.1 * hash1(k + 3.0), 0.0);
    if (skid) m.col *= 0.7;
    n = normalize(n + 0.06 * sin(g.x * 240.0 + 5.0 * noise(g.zz * 30.0)) * ax);
    return true;
  }
  if (id < 104.5) { m.col = srgb(0.035, 0.03, 0.025); m.rough = 0.95; return true; }
  if (id < 105.5) {
    // zinc plate going dull, rust starting at the edges
    matMetal(m, n, g, 0, vec3(0.3, 1.0, 0.2));
    m.col *= 0.80 + 0.25 * noise(g * 25.0); m.rough += 0.12;
    float rust = smoothstep(0.52, 0.72, fbm3(g * 11.0 + 3.0));
    m.col = mix(m.col, srgb(0.36, 0.17, 0.08) * (0.7 + 0.6 * noise(g * 90.0)), rust); m.metal *= 1.0 - 0.8 * rust; m.rough = mix(m.rough, 0.8, rust);
    return true;
  }
  // sisal rope: three twisted strands, hairy
  float strand = 0.5 + 0.5 * sin(g.z * 190.0 + g.y * 130.0 + a.x * 210.0);
  m.col = srgb(0.62, 0.47, 0.27) * (0.45 + 0.6 * strand) * (0.8 + 0.4 * noise(g * 260.0));
  m.rough = 0.95; m.sheen = 0.6; m.sheenCol = srgb(1.0, 0.9, 0.7);
  n = normalize(n + 0.35 * (hash3(g * 700.0) - 0.5));
  return true;
}
