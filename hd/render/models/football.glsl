// Classic 32-panel football (white hexagons, black pentagons, stitched seams) with a small hand pump lying in front of it.
// Ball radius 0.45. Material ids 100..106.
#define BALL_R 0.45
#define PUMP_S 1.15
const vec3 ballC = vec3(-0.085, 0.452, -0.09);
vec3 ballLocal(vec3 p) { vec3 q = p - ballC; q.yz = rot(0.42) * q.yz; q.xz = rot(-0.38) * q.xz; q.xy = rot(0.2) * q.xy; return q; }
void ballCand(vec3 av, vec3 c, float w, inout float s1, inout float s2, inout vec3 g1, inout vec3 g2) {
  float sc = dot(av, c) * w;
  if (sc > s1) { s2 = s1; g2 = g1; s1 = sc; g1 = c * w; }
  else if (sc > s2) { s2 = sc; g2 = c * w; }
}
// truncated icosahedron on the unit sphere: x = angle to the nearest seam, y = 1 on a pentagon, z = a coordinate running along that seam
vec3 ballPanels(vec3 v) {
  const float WP = 0.97418;            // pentagon faces sit a little further out than hexagon faces
  const vec3 P1 = vec3(0.0, 0.525731, 0.850651), P2 = vec3(0.525731, 0.850651, 0.0), P3 = vec3(0.850651, 0.0, 0.525731);
  const vec3 H0 = vec3(0.57735), H1 = vec3(0.356822, 0.0, 0.934172), H2 = vec3(0.0, 0.934172, 0.356822), H3 = vec3(0.934172, 0.356822, 0.0);
  const vec3 MX = vec3(-1.0, 1.0, 1.0), MY = vec3(1.0, -1.0, 1.0), MZ = vec3(1.0, 1.0, -1.0);
  vec3 av = abs(v), g1 = vec3(0), g2 = vec3(0); float s1 = -9.0, s2 = -9.0;
  ballCand(av, P1, WP, s1, s2, g1, g2); ballCand(av, P1 * MY, WP, s1, s2, g1, g2); ballCand(av, P1 * MZ, WP, s1, s2, g1, g2);
  ballCand(av, P2, WP, s1, s2, g1, g2); ballCand(av, P2 * MX, WP, s1, s2, g1, g2); ballCand(av, P2 * MY, WP, s1, s2, g1, g2);
  ballCand(av, P3, WP, s1, s2, g1, g2); ballCand(av, P3 * MX, WP, s1, s2, g1, g2); ballCand(av, P3 * MZ, WP, s1, s2, g1, g2);
  ballCand(av, H0, 1.0, s1, s2, g1, g2); ballCand(av, H0 * MX, 1.0, s1, s2, g1, g2); ballCand(av, H0 * MY, 1.0, s1, s2, g1, g2); ballCand(av, H0 * MZ, 1.0, s1, s2, g1, g2);
  ballCand(av, H1, 1.0, s1, s2, g1, g2); ballCand(av, H1 * MX, 1.0, s1, s2, g1, g2); ballCand(av, H1 * MZ, 1.0, s1, s2, g1, g2);
  ballCand(av, H2, 1.0, s1, s2, g1, g2); ballCand(av, H2 * MY, 1.0, s1, s2, g1, g2); ballCand(av, H2 * MZ, 1.0, s1, s2, g1, g2);
  ballCand(av, H3, 1.0, s1, s2, g1, g2); ballCand(av, H3 * MX, 1.0, s1, s2, g1, g2); ballCand(av, H3 * MY, 1.0, s1, s2, g1, g2);
  return vec3((s1 - s2) / length(g1 - g2), step(dot(g1, g1), 0.97), dot(av, normalize(cross(g1, g2))));
}
vec3 pumpLocal(vec3 p) {
  vec3 q = (p - vec3(-0.36, 0.0426, 0.425)) / PUMP_S;
  q.xz = rot(-0.35) * q.xz; q.xy = rot(0.086) * q.xy;
  return q;
}
void pumpAll(vec3 p, inout float d);
void mGift(vec3 p, inout float d) {
  float bb = length(p - vec3(0.0, 0.42, 0.05)) - 0.80;
  if (bb > 0.15) { d = min(d, bb); return; }
  // ---- ball: domed panels, seams sunk between them ----
  vec3 q = ballLocal(p); float r = length(q);
  if (r - BALL_R > 0.04) d = min(d, r - BALL_R - 0.01);
  else {
    vec3 pn = ballPanels(q / r); float e = pn.x * BALL_R;
    float sink = 1.0 - smoothstep(0.0, 0.055, e);
    float dome = 0.012 * sink * sink + 0.0035 * (1.0 - smoothstep(0.0, 0.005, e));
    dome += 0.0012 * (1.0 - smoothstep(0.0025, 0.005, abs(e - 0.011))) * step(0.5, fract(pn.z * BALL_R * 75.0));       // stitch holes
    add(d, (r - BALL_R + dome) * 0.8, 100.0);
  }
  float dp = d / PUMP_S; pumpAll(p, dp); d = dp * PUMP_S;
}
// ---- pump: x runs from the needle tip to the handle ----
void pumpAll(vec3 p, inout float d) {
  vec3 u = pumpLocal(p);
  float pb = max(length(u.yz) - 0.17, abs(u.x - 0.40) - 0.44);
  if (pb > 0.05) { d = min(d, pb); return; }
  float rr = length(u.yz), ang = atan(u.z, u.y);
  // needle and its threaded base
  add(d, sdCapsule(u, vec3(0.004, 0.0, 0.0), vec3(0.11, 0.0, 0.0), 0.0058), 103.0);
  float hx = mod(ang, TAU / 6.0) - TAU / 12.0;
  float nut = smax(rr * cos(hx) - 0.017, abs(u.x - 0.118) - 0.012, 0.003);
  nut = min(nut, sdRCyl((u - vec3(0.137, 0.0, 0.0)).yxz, 0.012, 0.010, 0.002));
  add(d, nut, 104.0);
  // nose cone and rear cap, ribbed for the fingers
  float nose = sdCapCone((u - vec3(0.180, 0.0, 0.0)).yxz, 0.036, 0.021, 0.050) - 0.004;
  nose = smin(nose, sdRCyl((u - vec3(0.232, 0.0, 0.0)).yxz, 0.058, 0.018, 0.006), 0.006);
  float rib = 0.0018 * sin(ang * 26.0);
  float cap = sdRCyl((u - vec3(0.650, 0.0, 0.0)).yxz, 0.059 + rib, 0.026, 0.007);
  cap = min(cap, sdRCyl((u - vec3(0.682, 0.0, 0.0)).yxz, 0.026, 0.010, 0.004));
  add(d, min(nose, cap) * 0.85, 102.0);
  // barrel, with two moulded rings
  float barrel = sdRCyl((u - vec3(0.44, 0.0, 0.0)).yxz, 0.052, 0.20, 0.004);
  barrel = smin(barrel, sdRCyl(vec3(u.y, abs(u.x - 0.44) - 0.165, u.z), 0.055, 0.006, 0.003), 0.004);
  add(d, barrel, 101.0);
  // piston rod and T-handle, tipped over so one end rests on the belt
  add(d, sdRCyl((u - vec3(0.72, 0.0, 0.0)).yxz, 0.013, 0.05, 0.002), 103.0);
  vec3 h = u - vec3(0.775, 0.0, 0.0); h.yz = rot(0.62) * h.yz;
  float grip = sdCapsule(h, vec3(0.0, 0.0, -0.105), vec3(0.0, 0.0, 0.105), 0.027 + 0.006 * smoothstep(0.03, 0.10, abs(h.z)) - 0.0025 * cos(h.z * 62.0) * step(abs(h.z), 0.10));
  grip = smin(grip, sdRCyl(h.yxz - vec3(0.0, -0.022, 0.0), 0.022, 0.016, 0.006), 0.012);
  add(d, grip * 0.8, 105.0);
}
bool shGift(float id, vec3 p, inout vec3 n, inout Mat m) {
  if (id < 100.0 || id >= 107.0) return false;
  if (id < 100.5) {
    vec3 q = ballLocal(p); vec3 pn = ballPanels(normalize(q)); float e = pn.x * BALL_R;
    vec3 col = pn.y > 0.5 ? srgb(0.085, 0.085, 0.095) : srgb(0.94, 0.93, 0.89);
    vec3 n2 = n; Mat lm = newMat(); matLeather(lm, n2, p, col, 0.55);
    m = lm; m.col = mix(m.col, col * (0.92 + 0.12 * fbm3(p * 4.0)), 0.75); n = normalize(mix(n, n2, 0.06));
    bumpN(n, p, 330.0, 0.25);                                                        // fine pebble grain
    // play wear: grime rubbed into the seams, grey scuffs, a grass stain or two
    float grime = (1.0 - smoothstep(0.0, 0.03, e)) * (0.5 + 0.5 * noise(p * 20.0));
    float scuff = smoothstep(0.52, 0.72, fbm3(q * 5.0 + 3.0)) * (0.5 + 0.5 * noise(q * 60.0));
    float streak = smoothstep(0.78, 0.9, noise(vec3(q.x * 9.0, q.y * 90.0, q.z * 9.0) + 5.0)) * smoothstep(0.4, 0.7, fbm3(q * 3.0));
    float grass = smoothstep(0.66, 0.8, fbm3(q * 3.3 + 9.0));
    if (pn.y > 0.5) { m.col = mix(m.col, srgb(0.30, 0.29, 0.28), 0.5 * scuff + 0.35 * streak + 0.3 * grime); }
    else {
      m.col = mix(m.col, srgb(0.50, 0.46, 0.38), 0.45 * grime + 0.30 * scuff + 0.25 * streak);
      m.col = mix(m.col, srgb(0.45, 0.52, 0.22), 0.22 * grass);
    }
    m.rough += 0.25 * scuff; m.coat *= 1.0 - 0.7 * scuff;
    // thread: short stitches crossing into each seam
    float th = (1.0 - smoothstep(0.004, 0.0075, abs(e - 0.007))) * step(fract(pn.z * BALL_R * 75.0), 0.5);
    m.col = mix(m.col, srgb(0.80, 0.78, 0.72), (pn.y > 0.5 ? 0.4 : 0.7) * th);
    // the valve: a small black hole in one white panel
    float valve = length(normalize(q) - normalize(vec3(-0.5, 0.62, 0.6))) * BALL_R;
    if (valve < 0.014) { m.col = srgb(0.03, 0.03, 0.03); m.rough = 0.4; }
    else if (valve < 0.022) m.col *= 0.75;
    return true;
  }
  vec3 u = pumpLocal(p);
  if (id < 101.5) {                                              // barrel: bright moulded plastic with a printed band
    float band = smoothstep(0.335, 0.338, u.x) * (1.0 - smoothstep(0.542, 0.545, u.x));
    vec3 col = srgb(0.96, 0.73, 0.06);
    float t = (u.x - 0.34) / 0.205, a = atan(u.z, u.y);
    vec3 lab = srgb(0.93, 0.92, 0.88);
    lab = mix(lab, srgb(0.10, 0.10, 0.11), step(abs(t - 0.5), 0.42) * step(0.36, abs(t - 0.5)));                     // two thin black lines
    lab = mix(lab, srgb(0.10, 0.28, 0.62), step(abs(abs(fract(a * 3.0 / TAU * 2.0 + t * 0.0) - 0.5) - 0.25) * 0.5 + abs(t - 0.5) * 0.6, 0.12));   // a row of blue diamonds
    matPlastic(m, n, p, mix(col, lab, band), mix(0.85, 0.5, band));
    return true;
  }
  if (id < 102.5) { matPlastic(m, n, p, srgb(0.14, 0.36, 0.74), 0.6); return true; }                    // nose and cap
  if (id < 103.5) { matMetal(m, n, p, 3, vec3(1.0, 0.0, 0.0)); m.rough += 0.18; return true; }           // needle and rod
  if (id < 104.5) { matMetal(m, n, p, 1, vec3(1.0, 0.0, 0.0)); return true; }                            // brass thread
  matRubber(m, n, p, srgb(0.14, 0.36, 0.74)); m.rough = 0.5;                                            // handle
  return true;
}
