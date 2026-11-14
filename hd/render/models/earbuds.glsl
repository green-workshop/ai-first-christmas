// Wireless earbuds: a little white charging case, lid shut, with the two buds lying on top of it and a pair of spare ear tips
// beside it on the belt. A plain, generic design: no maker's mark. Material ids 100..109.
// The game shows this for the "tiny" headphones (the earbuds a child said they did not want): hd/src/hd-icons.js.
const float EB_TURN = 0.42;
vec3 ebLocal(vec3 p) { p.xz = rot(EB_TURN) * p.xz; return p; }
// one bud lying on its side: c = where its body sits, a = which way its stem points along the case top, s = +1 / -1 mirrors it
float ebBud(vec3 l, vec3 c, float a, out float part) {
  const float K = 1.22;
  vec3 q = l - c; q.xz = rot(a) * q.xz; q /= K;
  float body = sdEllipsoid(q, vec3(0.105, 0.085, 0.095));
  float stem = sdCapsule(q, vec3(0.04, -0.012, 0.0), vec3(0.3, -0.03, 0.0), 0.036);
  float shell = smin(body, stem, 0.05);
  // the silicone tip, on the side of the body, pointing up and a little forward
  vec3 t = q - vec3(-0.04, 0.085, 0.03); t.xy = rot(0.35) * t.xy;
  float tip = max(sdEllipsoid(t, vec3(0.075, 0.07, 0.075)), -t.y - 0.02);
  tip = max(tip, -(length(t.xz) - 0.028));                                   // the hole down its middle
  float foot = sdCyl((q - vec3(0.3, -0.03, 0.0)).yxz, 0.037, 0.012);          // the metal end of the stem
  part = 0.0; if (tip < shell && tip < foot) part = 1.0; else if (foot < shell) part = 2.0;
  return min(shell, min(tip, foot)) * K;
}
void mGift(vec3 p, inout float d) {
  float bb = length(p - vec3(0.0, 0.42, 0.05)) - 0.82;
  if (bb > 0.15) { d = min(d, bb); return; }
  vec3 l = ebLocal(p);
  // ---- the case: a pebble of a box, the lid a third of the way down ----
  vec3 c = l - vec3(0.0, 0.31, 0.0);
  float box = sdRBox(c, vec3(0.44, 0.31, 0.24), 0.17);
  box = max(box, -max(abs(c.y - 0.1) - 0.004, -box - 0.012));                        // the seam where the lid meets the body
  add(d, box, 100.0);
  add(d, sdRBox(c - vec3(0.0, 0.1, -0.235), vec3(0.16, 0.035, 0.012), 0.008), 103.0);                      // hinge, at the back
  add(d, sdSphere(c - vec3(0.0, -0.06, 0.238), 0.014), 104.0);                                            // charge light
  // ---- the buds, lying on the lid ----
  float part;
  // (bodies towards the middle, stems pointing out to either end, so each reads as a bud and not as one lump)
  float b1 = ebBud(l, vec3(-0.07, 0.725, 0.07), 3.3, part); add(d, b1, part < 0.5 ? 100.0 : (part < 1.5 ? 101.0 : 103.0));
  float b2 = ebBud(l, vec3(0.1, 0.725, -0.07), 0.16, part); add(d, b2, part < 0.5 ? 100.0 : (part < 1.5 ? 101.0 : 103.0));
  // ---- two spare ear tips on the belt, a bigger and a smaller ----
  vec3 s1 = p - vec3(0.5, 0.05, 0.3), s2 = p - vec3(0.36, 0.04, 0.4);
  float sp = max(sdEllipsoid(s1, vec3(0.07, 0.065, 0.07)), -s1.y - 0.045); sp = max(sp, -(length(s1.xz) - 0.026));
  float sq = max(sdEllipsoid(s2, vec3(0.052, 0.05, 0.052)), -s2.y - 0.035); sq = max(sq, -(length(s2.xz) - 0.02));
  add(d, min(sp, sq), 101.0);
}
bool shGift(float id, vec3 p, inout vec3 n, inout Mat m) {
  if (id < 100.0 || id >= 110.0) return false;
  if (id < 100.5) { m.col = srgb(0.90, 0.90, 0.88); m.rough = 0.14; m.coat = 0.8; m.coatRough = 0.05; return true; }                        // white gloss plastic, smooth
  if (id < 101.5) { m.col = srgb(0.60, 0.63, 0.68) * (0.94 + 0.08 * noise(p * 60.0)); m.rough = 0.5; m.sheen = 0.3; m.sheenCol = vec3(1.0); return true; }   // silicone, a shade greyer so the tips read
  if (id < 103.5) { matMetal(m, n, p, 0, vec3(1, 0, 0)); m.rough = 0.25; return true; }
  m.col = vec3(0.02, 0.1, 0.03); m.rough = 0.2; m.emit = vec3(0.2, 1.0, 0.35) * 2.5;                                                      // the light
  return true;
}
