// A diamond kite, stood on its tail tip and leaning back: ripstop nylon sail with stitched hems and white corner pockets
// over two crossed dowels, the bridle and flying line running down to a wooden reel, and a long tail of cloth bows on the belt.
// Material ids: 100 sail, 101 dowels, 102 end caps, 103 tow ring, 105 tail cord, 106 reel cheeks, 107 reel handles,
// 108 line and bridle, 110..113 tail bows. HUE is the colour of the sail.
#ifndef HUE
#define HUE srgb(0.74, 0.07, 0.055)
#endif
const vec3 KITE_O = vec3(-0.10, 0.014, -0.03);            // where the bottom tip stands
const vec2 KITE_R = vec2(0.44, 0.85);                     // wing tip (the cross spar is at this height)
const float KITE_T = 1.18;                                // top tip
const vec3 KITE_REEL = vec3(-0.43, 0.117, 0.27);
float kiteSq(float x) { return x * x; }
vec3 kiteLocal(vec3 p) { vec3 q = p - KITE_O; q.xz = rot(-0.30) * q.xz; q.yz = rot(-0.25) * q.yz; q.xy = rot(-0.07) * q.xy; return q; }
vec3 kiteWorld(vec3 l) { l.xy = rot(0.07) * l.xy; l.yz = rot(0.25) * l.yz; l.xz = rot(0.30) * l.xz; return l + KITE_O; }
// the sail's outline: a diamond whose hems pull in a little between the tips
float kiteSail2(vec2 p) {
  p.x = abs(p.x);
  vec2 e1 = KITE_R, e2 = vec2(-KITE_R.x, KITE_T - KITE_R.y);
  float d1 = dot(p, normalize(vec2(e1.y, -e1.x))) + 0.012 * sin(PI * sat(dot(p, e1) / dot(e1, e1)));
  float d2 = dot(p - KITE_R, normalize(vec2(e2.y, -e2.x))) + 0.008 * sin(PI * sat(dot(p - KITE_R, e2) / dot(e2, e2)));
  return smax(d1, d2, 0.015);
}
// where the sail sits: the cross spar is bowed back at the tips, the cloth rides over the sticks and bellies forward between them
float kiteBow(vec2 p) {
  float w = -0.115 * kiteSq(p.x / KITE_R.x);
  w += 0.004 * exp(-kiteSq(p.x / 0.009)) + 0.004 * exp(-kiteSq((p.y - KITE_R.y) / 0.009)) * step(abs(p.x), KITE_R.x);
  float slack = sin(PI * sat(abs(p.x) / KITE_R.x)) * sin(PI * sat(p.y / KITE_T)) * (1.0 - exp(-kiteSq((p.y - KITE_R.y) / 0.12)));
  w += 0.020 * slack * (0.5 + noise(p * 4.0 + 3.0));
  vec2 tp = vec2(abs(p.x), p.y) - KITE_R;
  w += 0.0035 * sin(atan(tp.y, tp.x) * 16.0) * exp(-length(tp) * 5.0) * smoothstep(0.03, 0.10, length(tp));        // pull lines fanning from the wing tips
  w += 0.0030 * sin(atan(p.x, p.y) * 22.0) * exp(-length(p) * 5.0) * smoothstep(0.03, 0.10, length(p));
  return w;
}
float kiteTieBow(vec3 b) {
  b /= 1.25;
  float ax = abs(b.x), prof = 0.011 + 0.56 * ax;
  float d2 = smax(abs(b.y) - prof, ax - 0.062, 0.012) * 0.85;
  float pleat = 0.0045 * sin(b.y / prof * 8.0) * smoothstep(0.0, 0.03, ax);
  float d = extrudeR(d2, b.z - pleat - 0.25 * ax, 0.0045, 0.003);
  return min(d * 0.65, sdEllipsoid(b, vec3(0.012, 0.015, 0.013))) * 1.25;
}
vec3 kiteBowAt(vec3 p, vec3 c, float yaw, float roll) { vec3 b = p - c; b.xz = rot(yaw) * b.xz; b.xy = rot(roll) * b.xy; return b; }
float kiteLine(vec3 p, vec3 a, vec3 b, vec3 c, float r) {          // a string along a bent path a..b..c
  float d = 1e9; vec3 prev = a;
  for (int i = 1; i <= 6; i++) { float t = float(i) / 6.0; vec3 q = mix(mix(a, b, t), mix(b, c, t), t); d = min(d, sdCapsule(p, prev, q, r)); prev = q; }
  return d;
}
vec3 kiteReelLocal(vec3 p) { vec3 r = p - KITE_REEL; r.xz = rot(-0.5) * r.xz; return r; }
const vec3 KITE_B1 = vec3(0.04, 0.050, 0.25), KITE_B2 = vec3(0.21, 0.050, 0.15), KITE_B3 = vec3(0.37, 0.050, 0.28), KITE_B4 = vec3(0.53, 0.050, 0.17);
void mGift(vec3 p, inout float d) {
  float bb = length(p - vec3(0.0, 0.55, 0.0)) - 0.90;
  if (bb > 0.15) { d = min(d, bb); return; }
  vec3 q = kiteLocal(p);
  const float LR = 0.0032;                                 // kite string
  // ---- the kite itself
  float kb = sdBox(q - vec3(0.0, 0.59, -0.05), vec3(0.47, 0.62, 0.09));
  if (kb < 0.04) {
    float s2 = kiteSail2(q.xy), wz = kiteBow(q.xy);
    float hem = smoothstep(-0.026, -0.022, s2);
    float sail = extrudeR(s2, q.z - wz, 0.0032 + 0.0014 * hem, 0.0025);
    add(d, sail * 0.6, 100.0);
    float wb = -0.115 * kiteSq(q.x / KITE_R.x) - 0.0105;
    float spar = sdCapsule(q, vec3(0.0, -0.012, -0.0105), vec3(0.0, KITE_T + 0.012, -0.0105), 0.0075);
    spar = min(spar, max(length(vec2(q.y - KITE_R.y, q.z - wb)) - 0.0075, abs(q.x) - KITE_R.x - 0.012) * 0.85);
    add(d, spar, 101.0);
    vec3 qa = vec3(abs(q.x), q.yz);
    float cap = min(min(sdCapsule(q, vec3(0.0, -0.016, -0.010), vec3(0.0, 0.012, -0.010), 0.012), sdCapsule(q, vec3(0.0, KITE_T - 0.012, -0.010), vec3(0.0, KITE_T + 0.016, -0.010), 0.012)),
                    sdCapsule(qa, vec3(KITE_R.x - 0.012, KITE_R.y, -0.124), vec3(KITE_R.x + 0.016, KITE_R.y, -0.132), 0.012));
    add(d, cap, 102.0);
    // bridle: lies slack on the sail from the cross down to the tow ring, and back up from the lower knot
    vec3 qs = vec3(q.xy, q.z - wz);
    vec3 ring = vec3(-0.085, 0.31, 0.008);
    float br = min(kiteLine(qs, vec3(0.0, KITE_R.y, 0.008), vec3(-0.115, 0.60, 0.006), ring + vec3(0.0, 0.012, 0.0), LR),
                   kiteLine(qs, ring + vec3(0.008, -0.010, 0.0), vec3(-0.035, 0.27, 0.006), vec3(0.0, 0.18, 0.008), LR));
    br = min(br, sdCapsule(qs, ring - vec3(0.004, 0.012, 0.0), vec3(-0.128, 0.212, 0.004), LR));                     // the flying line leaves over the hem
    br = min(br, min(sdSphere(qs - vec3(0.0, KITE_R.y, 0.008), 0.008), sdSphere(qs - vec3(0.0, 0.18, 0.008), 0.008)));   // knots through the sail
    add(d, br * 0.8, 108.0);
    vec3 rg = qs - ring; add(d, sdTorus(rg.xzy, 0.013, 0.0032) * 0.8, 103.0);
  } else d = min(d, kb);
  // ---- flying line: drops to the belt and wanders over to the reel
  vec3 E = kiteWorld(vec3(-0.128, 0.212, kiteBow(vec2(-0.128, 0.212)) + 0.004));
  vec3 F = vec3(E.x - 0.04, 0.005, E.z + 0.14), G = vec3(-0.22, 0.005, 0.42);
  float ln = kiteLine(p, E, vec3(E.x - 0.01, 0.03, E.z + 0.05), F, LR);
  ln = min(ln, kiteLine(p, F, vec3(F.x - 0.06, 0.005, F.z + 0.14), G, LR));
  ln = min(ln, kiteLine(p, G, vec3(-0.34, 0.005, 0.47), KITE_REEL + vec3(0.03, 0.050, 0.062), LR));
  // ---- wooden reel with the line wound on
  vec3 r = kiteReelLocal(p);
  float rb = length(r) - 0.22;
  if (rb < 0.04) {
    float rad = length(r.yz);
    float cheek = sdRCyl(vec3(r.y, abs(r.x) - 0.066, r.z), 0.117, 0.0075, 0.004);
    add(d, cheek, 106.0);
    float handle = sdCapsule(vec3(abs(r.x), r.yz), vec3(0.06, 0.0, 0.0), vec3(0.168, 0.0, 0.0), 0.021 + 0.004 * sin(abs(r.x) * 60.0));
    add(d, smin(handle, sdSphere(vec3(abs(r.x) - 0.172, r.yz), 0.026), 0.01) * 0.9, 107.0);
    float wound = max(rad - (0.074 + 0.007 * cos(r.x * 24.0) + 0.0012 * sin(r.x * 700.0 + 6.0 * atan(r.y, r.z))), abs(r.x) - 0.060);
    ln = min(ln, wound * 0.8);
  } else d = min(d, rb);
  add(d, ln, 108.0);
  // ---- the tail: a cord with cloth bows tied along it, lying where it fell
  if (p.y < 0.17) {
    vec3 T0 = KITE_O + vec3(0.0, -0.004, 0.0);
    float cord = kiteLine(p, T0, vec3(-0.09, -0.02, 0.20), KITE_B1, 0.0055);
    cord = min(cord, kiteLine(p, KITE_B1, vec3(0.13, -0.035, 0.24), KITE_B2, 0.0055));
    cord = min(cord, kiteLine(p, KITE_B2, vec3(0.28, -0.035, 0.17), KITE_B3, 0.0055));
    cord = min(cord, kiteLine(p, KITE_B3, vec3(0.46, -0.035, 0.27), KITE_B4, 0.0055));
    cord = min(cord, kiteLine(p, KITE_B4, vec3(0.585, 0.0, 0.14), vec3(0.595, 0.006, 0.24), 0.0055));
    add(d, cord, 105.0);
    add(d, kiteTieBow(kiteBowAt(p, KITE_B1, 0.35, 0.45)), 110.0);
    add(d, kiteTieBow(kiteBowAt(p, KITE_B2, -0.25, -0.30)), 111.0);
    add(d, kiteTieBow(kiteBowAt(p, KITE_B3, 0.10, 0.25)), 112.0);
    add(d, kiteTieBow(kiteBowAt(p, KITE_B4, -0.30, -0.50)), 113.0);
  } else d = min(d, p.y - 0.13);
}
bool shGift(float id, vec3 p, inout vec3 n, inout Mat m) {
  if (id < 100.0 || id >= 120.0) return false;
  vec3 cream = srgb(0.90, 0.86, 0.74);
  if (id < 100.5) {
    vec3 q = kiteLocal(p); vec2 uv = q.xy;
    float s2 = kiteSail2(uv);
    vec3 col = HUE;
    // four panels, cut two ways from the roll, so alternate ones take the light differently
    float alt = (uv.x > 0.0) == (uv.y > KITE_R.y) ? 1.0 : 0.0;
    col *= mix(0.84, 1.0, alt);
    vec2 g = alt > 0.5 ? uv : rot(0.785) * uv;
    vec2 gr = abs(fract(g * 46.0) - 0.5);                                           // the ripstop grid of heavier threads
    float rip = 1.0 - smoothstep(0.03, 0.10, min(gr.x, gr.y));
    float weave = 0.5 + 0.5 * sin(g.x * 2600.0) * sin(g.y * 2600.0);
    col *= (1.0 + 0.25 * rip) * (0.93 + 0.1 * weave);
    // corner pockets of white sailcloth
    float tip = min(min(length(uv), length(uv - vec2(0.0, KITE_T))), length(vec2(abs(uv.x), uv.y) - KITE_R));
    float pocket = 1.0 - smoothstep(0.086, 0.089, tip);
    col = mix(col, srgb(0.93, 0.92, 0.88) * (0.92 + 0.08 * rip), pocket);
    // doubled cloth: hems, the sleeve down the spine; the sticks behind show through as shadows
    float hem = smoothstep(-0.026, -0.023, s2);
    float sleeve = 1.0 - smoothstep(0.018, 0.020, abs(uv.x));
    col *= 1.0 - 0.20 * max(hem, sleeve) * (1.0 - pocket);
    col *= 1.0 - 0.38 * (1.0 - smoothstep(0.004, 0.013, abs(uv.y - KITE_R.y))) * (1.0 - pocket) - 0.30 * (1.0 - smoothstep(0.003, 0.011, abs(uv.x)));
    // stitching
    float dash = step(fract((uv.x * 0.6 + uv.y) * 90.0), 0.62);
    float st = (1.0 - smoothstep(0.0012, 0.0024, abs(s2 + 0.021))) * dash;
    st = max(st, (1.0 - smoothstep(0.0012, 0.0024, abs(abs(uv.x) - 0.019))) * dash);
    st = max(st, (1.0 - smoothstep(0.0012, 0.0024, abs(tip - 0.080))) * step(fract(tip * 40.0 + uv.y * 80.0 + uv.x * 50.0), 0.6) * step(s2, -0.004));
    vec3 thread = pocket > 0.5 ? HUE * 0.8 : srgb(0.95, 0.93, 0.86);
    col = mix(col, thread, st);
    m.col = col * (0.94 + 0.10 * fbm3(q * 6.0)); m.rough = 0.70 + 0.10 * weave + 0.1 * st; m.sheen = 0.25; m.sheenCol = col;      // soft-finish nylon: keeps its colour under the lamp
    n = normalize(n + 0.05 * rip * vec3(sign(fract(g * 46.0) - 0.5), 0.0) + 0.04 * (hash3(p * 500.0) - 0.5));
    bumpN(n, q, 16.0, 0.22);                                                        // crinkles in the nylon
    return true;
  }
  if (id < 101.5) { vec3 q = kiteLocal(p); matWood(m, n, q, abs(q.x) < 0.02 ? vec3(0, 1, 0) : vec3(1, 0, 0), 0.15, 0.1); return true; }
  if (id < 102.5) { matPlastic(m, n, p, srgb(0.10, 0.10, 0.11), 0.6); return true; }
  if (id < 103.5) { matMetal(m, n, p, 3, vec3(1, 0, 0)); return true; }
  if (id < 105.5) { float tw = sin((p.x + p.z * 1.3 + p.y) * 1100.0); matCloth(m, n, p, p.xz * 2.0, cream * (0.8 + 0.2 * tw), 0.5); return true; }
  if (id < 106.5) { vec3 r = kiteReelLocal(p); matWood(m, n, r + vec3(sign(r.x) * 3.0, 0.0, 0.0), vec3(0.2, 1.0, 0.1), 0.25, 0.55); m.col *= 1.0 - 0.25 * smoothstep(0.108, 0.117, length(r.yz)); return true; }
  if (id < 107.5) { vec3 r = kiteReelLocal(p); matWood(m, n, r, vec3(1.0, 0.0, 0.0), 0.45, 0.6); return true; }
  if (id < 108.5) {
    vec3 r = kiteReelLocal(p); float onReel = step(length(r), 0.13) * step(abs(r.x), 0.062);
    float tw = onReel > 0.5 ? sin(r.x * 700.0 + 6.0 * atan(r.y, r.z)) : sin((p.x + p.y + p.z * 1.3) * 1300.0);
    matCloth(m, n, p, p.xy * 2.0, cream * (0.78 + 0.22 * tw) * (1.0 - 0.15 * onReel * noise(r * 40.0)), 0.4);
    if (onReel > 0.5) n = normalize(n + 0.25 * tw * normalize(vec3(cos(0.5), 0.0, sin(0.5))));
    return true;
  }
  // tail bows: scraps of bright cotton
  vec3 bc = id < 110.5 ? srgb(0.96, 0.74, 0.12) : id < 111.5 ? srgb(0.16, 0.50, 0.82) : id < 112.5 ? srgb(0.93, 0.92, 0.86) : srgb(0.20, 0.62, 0.36);
  matCloth(m, n, p, p.xy + p.zx * 0.5, bc, 0.5);
  return true;
}
