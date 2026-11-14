// The elf: a hand-made felt puppet two heads tall. Pointed green hood with a white pompom, round face, bead eyes, red knitted mittens.
// Local space: stands at the origin on y = 0, faces +z, about 3.5 tall (4.6 to the tip of the hood). Material ids 230..249.
// Arguments let one scene hold several elves: hl / hr are the hands (screen left, screen right), eyes 0 open, 1 shut (sad), 2 wide;
// extra 1 adds the gold CONTRACTOR badge. #define ELF_YAW (radians) before including this file turns the head.
float mElf(vec3 p, inout float d, vec3 hl, vec3 hr, float eyes, float extra) {
  float bb = sdBox(p - vec3(0.15, 2.3, 0.1), vec3(1.9, 2.6, 1.4));
  if (bb > 0.2) { d = min(d, bb); return bb; }
  float felt = 0.004 * (noise(p * 130.0) - 0.5) + 0.006 * (fbm3(p * 9.0) - 0.5);
  // bell-shaped tunic
  float body = sdCapCone(p - vec3(0.0, 0.78, 0.0), 0.78, 0.82, 0.5);
  body = smin(body - 0.06, sdEllipsoid(p - vec3(0.0, 1.5, 0.0), vec3(0.56, 0.3, 0.5)), 0.2);
  body += 0.02 * sin(atan(p.x, p.z) * 9.0) * (1.0 - smoothstep(0.0, 1.2, p.y));                  // soft pleats at the hem
  add(d, body - felt, 230.0);
  // white felt collar with points
  float a = atan(p.x, p.z);
  float col = sdCapCone(p - vec3(0.0, 1.5, 0.0), 0.11 + 0.05 * cos(a * 7.0), 0.66, 0.5) - 0.02;
  add(d, col, 233.0);
  // arms: short sleeves, mittens
  vec3 sl = vec3(-0.5, 1.45, 0.05), sr = vec3(0.5, 1.45, 0.05);
  add(d, sdCone(p, sl, hl, 0.2, 0.16) - felt, 230.0); add(d, sdCone(p, sr, hr, 0.2, 0.16) - felt, 230.0);
  vec3 dl = normalize(hl - sl), dr = normalize(hr - sr);
  float ml = sdEllipsoid(p - hl - dl * 0.16, vec3(0.21, 0.24, 0.19)), mr = sdEllipsoid(p - hr - dr * 0.16, vec3(0.21, 0.24, 0.19));
  ml = smin(ml, sdSphere(p - hl - dl * 0.1 - vec3(0.16, 0.08, 0.06), 0.085), 0.05); mr = smin(mr, sdSphere(p - hr - dr * 0.1 - vec3(-0.16, 0.08, 0.06), 0.085), 0.05);
  add(d, min(ml, mr) - 0.012 * knit(p.xy, 26.0), 234.0);
  add(d, min(sdTorus((p - hl).xzy, 0.17, 0.06), sdTorus((p - hr).xzy, 0.17, 0.06)), 235.0);          // ribbed cuffs
  // head
  vec3 h = p - vec3(0.0, 2.3, 0.05);
#ifdef ELF_YAW        // the head turned (the face, the hood and its point with it; the cape on the shoulders stays)
  h.xz = rot(ELF_YAW) * h.xz;
#endif
  vec3 m = h; m.x = abs(m.x);
  float skin = sdEllipsoid(h, vec3(0.76, 0.72, 0.72));
  skin = smin(skin, sdEllipsoid(m - vec3(0.42, -0.2, 0.42), vec3(0.26, 0.22, 0.22)), 0.18);
  add(d, skin, 231.0);
  add(d, sdSphere(h - vec3(0.0, -0.12, 0.74), 0.07), 232.0);                                       // nose
  vec3 e = m - vec3(0.26, 0.04, 0.66);
  if (eyes < 0.5 || eyes > 1.5) add(d, sdSphere(e, eyes > 1.5 ? 0.095 : 0.075), 236.0);
  else add(d, sdCapsule(e, vec3(-0.07, 0.03, 0.045), vec3(0.07, 0.0, 0.03), 0.016), 237.0);          // shut: a short sad line
  // hood: wraps the head, open at the face, the point flops to screen right and ends in a pompom
  float hood = sdEllipsoid(h - vec3(0.0, 0.06, -0.08), vec3(0.88, 0.86, 0.84));
  hood = max(hood, -sdEllipsoid(h - vec3(0.0, -0.12, 0.62), vec3(0.62, 0.6, 0.5)));
  hood = smin(hood, sdCone(h, vec3(0.0, 0.6, -0.1), vec3(0.35, 1.5, -0.1), 0.6, 0.3), 0.25);
  hood = smin(hood, sdCone(h, vec3(0.35, 1.5, -0.1), vec3(0.95, 1.95, -0.05), 0.3, 0.13), 0.2);
  hood = smin(hood, sdEllipsoid(p - vec3(0.0, 1.62, -0.05), vec3(0.6, 0.22, 0.52)), 0.12);          // the cape of the hood, on the shoulders
  add(d, hood - felt, 230.0);
  add(d, (sdSphere(h - vec3(1.08, 2.02, -0.02), 0.2) - 0.05 * (noise(p * 18.0) - 0.5) - 0.02 * (noise(p * 60.0) - 0.5)) * 0.8, 233.0);
  if (extra > 0.5) add(d, sdRBox(p - vec3(0.0, 1.05, 0.66), vec3(0.34, 0.11, 0.012), 0.02), 238.0);
  return bb;
}
bool shElf(float id, vec3 p, inout vec3 n, inout Mat m) {
  if (id < 229.5 || id > 249.5) return false;
  if (id < 230.5) { matFelt(m, n, p, srgb(0.08, 0.36, 0.20)); m.sheen = 0.45; m.sheenCol = srgb(0.5, 1.0, 0.6); return true; }
  if (id < 231.5) {
    vec3 h = p - vec3(0.0, 2.3, 0.05);
#ifdef ELF_YAW
    h.xz = rot(ELF_YAW) * h.xz;
#endif
    h.x = abs(h.x);
    float blush = 1.0 - smoothstep(0.0, 0.34, length(h - vec3(0.44, -0.18, 0.58)));
    m.col = mix(srgb(0.93, 0.72, 0.58), srgb(0.90, 0.48, 0.42), 0.55 * blush) * (0.95 + 0.08 * fbm3(p * 9.0));
    m.rough = 0.52; m.sheen = 0.35; m.sheenCol = srgb(1.0, 0.8, 0.7); bumpN(n, p, 60.0, 0.25);
    return true;
  }
  if (id < 232.5) { m.col = srgb(0.85, 0.36, 0.24); m.rough = 0.4; return true; }
  if (id < 233.5) { m.col = srgb(0.93, 0.925, 0.90) * (0.8 + 0.25 * noise(p * 40.0)); m.rough = 0.9; m.sheen = 0.8; n = normalize(n + 0.5 * (hash3(p * 700.0) - 0.5)); return true; }
  if (id < 234.5) { matKnit(m, n, p, p.xy, 26.0, srgb(0.60, 0.04, 0.04), vec3(1, 0, 0), vec3(0, 1, 0)); m.sheen = 0.25; return true; }
  if (id < 235.5) { matKnit(m, n, p, p.xz, 34.0, srgb(0.52, 0.05, 0.055), vec3(1, 0, 0), vec3(0, 0, 1)); return true; }
  if (id < 236.5) { m.col = srgb(0.025, 0.02, 0.02); m.rough = 0.05; m.coat = 1.0; m.coatRough = 0.02; return true; }
  if (id < 237.5) { m.col = srgb(0.16, 0.10, 0.09); m.rough = 0.6; return true; }
  matMetal(m, n, p, 1, vec3(1, 0, 0)); m.rough = 0.2;
  return true;
}
