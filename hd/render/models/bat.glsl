// A real bat (a small brown long-eared kind) just landed on a log, facing the camera with both wings spread. Material ids 100..107.
// The wing is drawn flat in xy as a skeleton (shoulder, elbow, wrist, four fingers) with skin stretched between; x is mirrored.
vec3 batSp(vec3 p) { p.xz = rot(0.13) * p.xz; p.xy = rot(-0.035) * p.xy; return p; }
const vec2 BAT_S = vec2(0.075, 0.66), BAT_E = vec2(0.23, 0.60), BAT_W = vec2(0.40, 0.98), BAT_T2 = vec2(0.50, 0.93), BAT_J3 = vec2(0.545, 0.83), BAT_T3 = vec2(0.61, 0.66);
const vec2 BAT_J4 = vec2(0.475, 0.70), BAT_T4 = vec2(0.50, 0.40), BAT_J5 = vec2(0.385, 0.66), BAT_T5 = vec2(0.32, 0.32), BAT_A = vec2(0.075, 0.25), BAT_TAIL = vec2(0.0, 0.285);
const vec2 BAT_P[9] = vec2[9](vec2(0.0, 0.72), BAT_W, BAT_T2, BAT_J3, BAT_T3, BAT_T4, BAT_T5, BAT_A, BAT_TAIL);
const vec3 BAT_EYE = vec3(0.041, 0.819, 0.1175), BAT_HEAD = vec3(0.0, 0.805, 0.04), BAT_NOSE = vec3(0.0, 0.787, 0.158);
float batOutline(vec2 p) {
  float d = dot(p - BAT_P[0], p - BAT_P[0]), s = 1.0; int j = 8;
  for (int i = 0; i < 9; i++) {
    vec2 e = BAT_P[j] - BAT_P[i], w = p - BAT_P[i];
    vec2 b = w - e * clamp(dot(w, e) / dot(e, e), 0.0, 1.0);
    d = min(d, dot(b, b));
    bvec3 c = bvec3(p.y >= BAT_P[i].y, p.y < BAT_P[j].y, e.x * w.y > e.y * w.x);
    if (all(c) || all(not(c))) s = -s;
    j = i;
  }
  return s * sqrt(d);
}
// the skin sags inward between two finger tips: a circle through a and b, bulging h into the wing
float batScallop(vec2 p, vec2 a, vec2 b, float h) {
  vec2 t = b - a; float c = length(t), R = (c * c * 0.25 + h * h) / (2.0 * h);
  return length(p - (0.5 * (a + b) + vec2(-t.y, t.x) / c * (R - h))) - R;
}
float batFingers(vec2 p) {
  float d = sdSeg2(p, BAT_W, BAT_T2);
  d = min(d, min(sdSeg2(p, BAT_W, BAT_J3), sdSeg2(p, BAT_J3, BAT_T3)));
  d = min(d, min(sdSeg2(p, BAT_W, BAT_J4), sdSeg2(p, BAT_J4, BAT_T4)));
  return min(d, min(sdSeg2(p, BAT_W, BAT_J5), sdSeg2(p, BAT_J5, BAT_T5)));
}
// the outline of the stretched skin: negative inside
float batSkin(vec2 w) {
  float o = batOutline(w);
  o = max(o, -batScallop(w, BAT_T3, BAT_T4, 0.05)); o = max(o, -batScallop(w, BAT_T4, BAT_T5, 0.038));
  o = max(o, -batScallop(w, BAT_T5, BAT_A, 0.055)); o = max(o, -batScallop(w, BAT_A, BAT_TAIL, 0.012));
  return max(o, -batScallop(w, BAT_P[0], BAT_W, 0.05));
}
float batArm(vec2 p) { return min(sdSeg2(p, BAT_S, BAT_E), sdSeg2(p, BAT_E, BAT_W)); }
float batZ(vec2 p) { return 0.11 * p.x * p.x - 0.022; }                        // the wings cup forward a little toward the tips
// creases in the slack skin, fanning from the wrist
float batCrease(vec2 p) { vec2 r = p - BAT_W; return sin(atan(r.y, r.x) * 30.0 + 5.0 * noise(p * 7.0)); }
float batBody(vec3 p) {
  float d = sdEllipsoid(p - vec3(0, 0.55, 0.01), vec3(0.10, 0.17, 0.09));
  d = smin(d, sdEllipsoid(p - vec3(0, 0.66, 0.02), vec3(0.128, 0.095, 0.09)), 0.05);            // chest and shoulders
  float hd = sdEllipsoid(p - BAT_HEAD, vec3(0.098, 0.088, 0.09));
  hd = smin(hd, sdEllipsoid(p - vec3(0, 0.778, 0.115), vec3(0.05, 0.038, 0.046)), 0.03);         // short muzzle
  return smin(d, hd, 0.04);
}
vec3 batEarSp(vec3 ps) { vec3 e = ps - vec3(0.094, 0.945, 0.008); e.xy = rot(-0.44) * e.xy; e.yz = rot(-0.12) * e.yz; return e; }
void mGift(vec3 p, inout float d) {
  float bb = length(p - vec3(0, 0.6, 0)) - 0.80;
  if (bb > 0.15) { d = min(d, bb); return; }
  p = batSp(p);
  vec3 ps = vec3(abs(p.x), p.yz);
  // fur: short and velvety, combed down the body
  float f = batBody(p);
  if (f < 0.04) {
    vec3 fq = vec3(p.x, p.y * 0.2, p.z);
    float bare = 1.0 - smoothstep(0.03, 0.06, length(p - vec3(0, 0.777, 0.142)));
    f -= (1.0 - bare) * (0.007 * (noise(fq * 190.0) - 0.5) + 0.004 * (noise(fq * 380.0 + 5.0) - 0.5) + 0.010 * (fbm3(p * 16.0) - 0.5));
  } else f -= 0.012;
  add(d, f * 0.85, 100.0);
  // wing skin
  vec2 w = ps.xy;
  float o = batSkin(w);
  float fd = batFingers(w), ad = batArm(w), z0 = batZ(w);
  float leg = sdSeg2(w, vec2(0.05, 0.42), BAT_A), tl = sdSeg2(w, vec2(0.0, 0.42), BAT_TAIL);
  float near = min(min(fd, ad), min(leg, tl));
  float slack = smoothstep(0.008, 0.05, near);
  float zs = z0 - 0.4 * min(near, 0.06) + 0.003 * slack * sat(length(w - BAT_W) / 0.3) * batCrease(w);
  add(d, extrudeR(o, p.z - zs, 0.0032, 0.003) * 0.6, 101.0);
  // bones under the skin: arm, fingers with their knuckles, thumb, legs, tail
  float zb = p.z - z0;
  float bones = length(vec2(fd, zb)) - mix(0.0062, 0.0036, smoothstep(0.1, 0.45, length(w - BAT_W)));
  bones = smin(bones, min(length(vec3(w - BAT_J3, zb)), min(length(vec3(w - BAT_J4, zb)), length(vec3(w - BAT_J5, zb)))) - 0.0078, 0.006);
  bones = smin(bones, length(vec3(w - BAT_W, zb)) - 0.013, 0.01);
  vec3 th = vec3(w - BAT_W, zb);
  bones = smin(bones, sdCone(th, vec3(0), vec3(-0.012, 0.045, 0.012), 0.009, 0.006), 0.006);                       // thumb
  bones = min(bones, length(vec2(tl, zb - 0.004)) - 0.006);
  add(d, bones * 0.8, 102.0);
  float claw = sdCone(th, vec3(-0.012, 0.045, 0.012), vec3(-0.004, 0.066, 0.02), 0.0055, 0.0015);
  // arms and legs, lightly furred near the body
  float arm = length(vec2(ad, zb)) - mix(0.02, 0.009, smoothstep(0.02, 0.2, length(w - BAT_S)));
  float lg = sdCone(ps, vec3(0.05, 0.42, 0.0), vec3(0.076, 0.262, 0.012), 0.017, 0.009);
  vec3 ft = ps - vec3(0.078, 0.247, 0.036);
  float foot = sdEllipsoid(ft, vec3(0.02, 0.012, 0.032)) + 0.002 * sin(ft.x * 520.0) * smoothstep(0.0, 0.02, ft.z);
  add(d, min(arm * 0.8, min(lg, foot * 0.8)), 103.0);
  float toe = sdCone(vec3(repLim(ft.x, 0.0095, -1.5, 1.5) , ft.yz), vec3(0.0, 0.0, 0.028), vec3(0.0, -0.016, 0.04), 0.004, 0.0012);
  add(d, min(claw, toe), 106.0);
  // ears: tall thin shells, dished, ribbed across
  float hb = length(p - vec3(0, 0.90, 0.04)) - 0.22;
  if (hb > 0.05) d = min(d, hb);
  else {
    vec3 e = batEarSp(ps);
    // leaf-shaped: two overlapping ovals give a blunt point at the tip
    float ear = smax(sdEllipsoid(e - vec3(0.034, -0.01, 0.0), vec3(0.088, 0.135, 0.016)), sdEllipsoid(e + vec3(0.034, 0.01, 0.0), vec3(0.088, 0.135, 0.016)), 0.008);
    ear = smax(ear, -sdEllipsoid(e - vec3(0.0, -0.005, 0.03), vec3(0.04, 0.095, 0.03)), 0.007);
    ear = min(ear, sdCone(e, vec3(0.012, -0.085, 0.01), vec3(0.016, -0.03, 0.014), 0.009, 0.003));                // tragus
    add(d, ear * 0.75, 104.0);
    add(d, sdSphere(ps - BAT_EYE, 0.0105), 105.0);
    float nose = sdEllipsoid(p - BAT_NOSE, vec3(0.02, 0.014, 0.012));
    nose = smax(nose, -sdSphere(ps - BAT_NOSE - vec3(0.009, 0.001, 0.013), 0.005), 0.003);
    add(d, nose, 107.0);
    add(d, sdCone(ps, vec3(0.012, 0.764, 0.148), vec3(0.012, 0.747, 0.15), 0.0045, 0.001), 106.5);              // two needle teeth
  }
  // the log it has landed on, lying across the belt
  vec3 l = p - vec3(0.0, 0.12, -0.012); l.xz = rot(-0.38) * l.xz;
  float lb = length(l) - 0.34;
  if (lb > 0.05) d = min(d, lb);
  else {
    float lg2 = sdRCyl(vec3(l.y, l.x, l.z), 0.118, 0.29, 0.012);
    float side = smoothstep(0.0, 0.02, 0.28 - abs(l.x));
    lg2 -= side * 0.012 * (fbm3(vec3(l.x * 9.0, l.y * 22.0, l.z * 22.0)) - 0.5);
    lg2 = smin(lg2, sdCone(l, vec3(0.14, 0.09, 0.03), vec3(0.19, 0.19, 0.07), 0.03, 0.022), 0.02);              // stub of a side branch
    add(d, lg2 * 0.8, 108.0);
  }
}
bool shGift(float id, vec3 p, inout vec3 n, inout Mat m) {
  if (id < 100.0 || id >= 110.0) return false;
  vec3 pw = p; p = batSp(p);
  vec3 ps = vec3(abs(p.x), p.yz); vec2 w = ps.xy;
  vec3 skin = srgb(0.50, 0.37, 0.31);
  if (id < 100.5) {   // fur: warm brown above and at the sides, pale buff down the front, bare skin on the muzzle
    vec3 fq = vec3(p.x, p.y * 0.2, p.z);
    float tips = noise(fq * 190.0), fine = noise(fq * 420.0), v = fbm3(p * 8.0);
    float front = smoothstep(0.02, 0.07, p.z - 0.5 * abs(p.x) + 0.03 * v) * (1.0 - smoothstep(0.69, 0.75, p.y));
    vec3 fur = mix(srgb(0.40, 0.25, 0.13), srgb(0.74, 0.64, 0.50), 0.85 * front);
    m.col = fur * mix(0.6, 1.1, v) * mix(0.55, 1.25, tips) * mix(0.8, 1.15, fine);
    float bare = 1.0 - smoothstep(0.034, 0.066, length((p - vec3(0, 0.782, 0.14)) * vec3(0.8, 1.0, 1.0)) + 0.012 * (tips - 0.5));
    float mouth = (1.0 - smoothstep(0.002, 0.005, abs(p.y - 0.766 + 4.0 * p.x * p.x))) * step(abs(p.x), 0.038) * step(0.105, p.z);
    float rim = 1.0 - smoothstep(0.012, 0.019, length(ps - BAT_EYE));
    m.col = mix(m.col, srgb(0.27, 0.18, 0.16) * (0.85 + 0.3 * fine), 0.9 * bare);
    m.col = mix(m.col, srgb(0.06, 0.04, 0.04), max(mouth, rim));
    m.rough = 0.9; m.sheen = 0.7 * (1.0 - bare); m.sheenCol = mix(fur, vec3(1.0, 0.88, 0.7), 0.45);
    n = normalize(n + mix(0.7, 0.2, bare) * (hash3(pw * 913.0) - 0.5) + vec3(0.0, -0.2, 0.0) * (1.0 - bare));
    return true;
  }
  if (id < 101.5) {   // wing skin: thin, a lighter grey-brown, creased, veined, darker along the bones and the hem
    float fd = batFingers(w), ad = batArm(w);
    float near = min(fd, ad), slack = smoothstep(0.006, 0.05, near);
    float cr = batCrease(w);
    float vein = 1.0 - smoothstep(0.0, 0.035, abs(fbm3(vec3(w * 9.0, 2.0)) - 0.5));
    float fine = noise(vec3(w * 260.0, 1.0)), blot = fbm3(vec3(w * 6.0, 5.0));
    vec3 c = mix(srgb(0.25, 0.195, 0.165), srgb(0.46, 0.39, 0.35), slack) * mix(0.78, 1.14, blot);
    c = mix(c, srgb(0.58, 0.44, 0.39), 0.35 * slack * smoothstep(0.4, 0.7, blot));
    c *= mix(0.6, 1.0, smoothstep(0.0, 0.022, -batSkin(w)));                                  // the hem is thicker and darker          // thinner, pinker where it is stretched
    c *= 1.0 - 0.16 * slack * (0.5 - 0.5 * cr); c = mix(c, srgb(0.26, 0.14, 0.12), 0.6 * vein * slack);
    m.col = c * (0.9 + 0.2 * fine); m.rough = 0.55; m.sheen = 0.3; m.sheenCol = vec3(1.0, 0.85, 0.75);
    m.glow = srgb(0.62, 0.30, 0.18) * 0.02 * slack;                                        // a little light coming through the skin
    bumpN(n, pw, 230.0, 0.18); n = normalize(n + 0.05 * (hash3(pw * 700.0) - 0.5));
    return true;
  }
  if (id < 102.5) {   // finger bones under tight skin: paler, a little shiny at the knuckles
    float kn = min(length(w - BAT_J3), min(length(w - BAT_J4), min(length(w - BAT_J5), length(w - BAT_W))));
    m.col = mix(srgb(0.70, 0.58, 0.51), srgb(0.56, 0.44, 0.38), smoothstep(0.0, 0.03, kn)) * (0.88 + 0.2 * noise(p * 200.0));
    m.rough = 0.42; m.coat = 0.15; m.coatRough = 0.3; bumpN(n, pw, 200.0, 0.4);
    return true;
  }
  if (id < 103.5) {   // forearms and legs: skin with a little fur near the body
    float furry = 1.0 - smoothstep(0.03, 0.14, length(w - BAT_S)); if (p.y < 0.45) furry = 0.0;
    vec3 fq = vec3(p.x * 0.4, p.y, p.z);
    m.col = mix(srgb(0.44, 0.34, 0.29), srgb(0.42, 0.27, 0.15) * mix(0.6, 1.2, noise(fq * 200.0)), furry) * (0.85 + 0.25 * noise(p * 150.0));
    m.rough = mix(0.5, 0.9, furry); m.sheen = 0.6 * furry; m.sheenCol = vec3(1.0, 0.85, 0.65);
    n = normalize(n + mix(0.12, 0.6, furry) * (hash3(pw * 900.0) - 0.5));
    return true;
  }
  if (id < 104.5) {   // ears: bare skin, pinker and paler inside
    vec3 e = batEarSp(ps);
    float inside = smoothstep(0.0, 0.012, e.z + 0.004) * (1.0 - smoothstep(0.7, 1.0, length(e.xy / vec2(0.052, 0.118))));
    float rib = 0.5 + 0.5 * sin(e.y * 250.0);
    m.col = mix(srgb(0.34, 0.25, 0.21), srgb(0.58, 0.44, 0.39) * (0.86 + 0.16 * rib), inside) * (0.88 + 0.22 * noise(p * 180.0));
    m.rough = 0.55; m.sheen = 0.35; m.sheenCol = vec3(1.0, 0.85, 0.75); m.glow = srgb(0.62, 0.28, 0.18) * 0.02 * inside;
    bumpN(n, pw, 180.0, 0.4);
    return true;
  }
  if (id < 105.5) { m.col = srgb(0.02, 0.015, 0.012); m.rough = 0.04; m.coat = 1.0; m.coatRough = 0.02; return true; }                 // eyes
  if (id < 106.25) { m.col = srgb(0.16, 0.13, 0.11); m.rough = 0.3; m.coat = 0.5; return true; }                                      // claws
  if (id < 106.75) { m.col = srgb(0.92, 0.88, 0.78); m.rough = 0.25; m.coat = 0.6; return true; }                                     // teeth
  if (id < 107.5) { m.col = srgb(0.10, 0.07, 0.065); m.rough = 0.35; m.coat = 0.8; m.coatRough = 0.12; bumpN(n, pw, 150.0, 0.4); return true; }   // nose
  // log: pale silver-birch bark with dark fissures, sawn ends showing the rings
  vec3 l = p - vec3(0.0, 0.12, -0.012); l.xz = rot(-0.38) * l.xz;
  if (abs(l.x) > 0.279 && length(l.yz) < 0.125) {
    matWood(m, n, vec3(l.y, l.z, l.x) * 0.5 - vec3(0.9, 0.35, 0.0), vec3(0, 0, 1), 0.3, 0.0);
    m.col *= 0.8 + 0.3 * noise(l * 70.0);
    return true;
  }
  float ang = atan(l.z, l.y), fine = fbm3(l * 60.0);
  float dash = smoothstep(0.60, 0.72, fbm(vec2(l.x * 55.0, ang * 2.6)));                       // birch lenticels: short dark dashes running round the trunk
  float scar = smoothstep(0.55, 0.66, fbm3(vec3(l.x * 7.0, l.y * 15.0, l.z * 15.0) + 3.0));    // black scars where the bark has split
  float peel = fbm3(vec3(l.x * 30.0, l.y * 6.0, l.z * 6.0));
  vec3 c = mix(srgb(0.70, 0.66, 0.58), srgb(0.86, 0.83, 0.76), smoothstep(0.35, 0.65, peel)) * (0.8 + 0.35 * fine);
  c = mix(c, srgb(0.15, 0.12, 0.10) * (0.7 + 0.6 * fine), max(0.8 * dash, scar));
  float moss = smoothstep(0.6, 0.72, fbm3(l * 8.0 + 2.0)) * smoothstep(0.0, 0.08, l.y);
  m.col = mix(c, srgb(0.34, 0.42, 0.16) * (0.7 + 0.5 * fine), 0.75 * moss); m.rough = 0.9;
  bumpN(n, pw, 110.0, 0.9);
  return true;
}
