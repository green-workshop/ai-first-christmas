// Beginner's refractor on a wooden tripod: white enamelled tube, brass dew shield, a real glass objective, rack focuser with a
// star diagonal and eyepiece, finder scope, fork mount with clamp knobs, three two-part ash legs and an accessory tray.
// Stands on y = 0, about 1.15 tall. Material ids 100..111.
const vec3 TS_A = vec3(0.668, 0.530, 0.522);     // along the tube, towards the sky
const vec3 TS_B = vec3(-0.417, 0.848, -0.326);   // across the tube, upwards
const vec3 TS_C = vec3(-0.616, 0.0, 0.788);      // across the tube, level: the side the camera sees
const vec3 TS_O = vec3(-0.03, 0.795, 0.0);       // where the tube axis crosses the mount's pivot
const float TS_S = 1.08;                         // overall scale
const float TS_LEG0 = 1.745;                    // direction of the first leg round the tripod, radians
// tube space: x = level across, y = along the tube, z = up across
vec3 tsTube(vec3 p) { vec3 v = p - TS_O; return vec3(dot(v, TS_C), dot(v, TS_A), dot(v, TS_B)); }
// tripod space, folded so one leg does for three: x out along the leg's direction, z across it
vec3 tsFold(vec3 p, out float sector) {
  vec2 h = p.xz - TS_O.xz; float ang = atan(h.y, h.x) - TS_LEG0;
  sector = floor(ang / 2.0944 + 0.5); ang -= sector * 2.0944;
  return vec3(length(h) * cos(ang), p.y, length(h) * sin(ang));
}
// leg space: x down the leg from its hinge, y outwards, z across
vec3 tsLeg(vec3 f) { vec2 a = vec2(f.x - 0.065, f.y - 0.560); return vec3(dot(a, vec2(0.5547, -0.8321)), dot(a, vec2(0.8321, 0.5547)), f.z); }
void mGift(vec3 p, inout float d) {
  float bb = length(p - vec3(0.0, 0.58, 0.02)) - 0.84;
  if (bb > 0.15) { d = min(d, bb); return; }
  float d0 = d, m0 = gM; d = 1e9; p /= TS_S;
  vec3 q = tsTube(p);
  float r = length(q.xz), t = q.y;
  // ---- tube and dew shield, bored out at the front for the lens ----
  float tube = sdRCyl(q - vec3(0.0, 0.01, 0.0), 0.072, 0.37, 0.006);
  float cav = min(max(r - 0.066, 0.20 - t), max(r - 0.0762, 0.462 - t));
  float shield = sdRCyl(q - vec3(0.0, 0.445, 0.0), 0.0835, 0.075, 0.005);
  shield = min(shield, length(vec2(r - 0.0835, abs(t - 0.445) - 0.066)) - 0.0048);            // rolled beads at each end
  add(d, smax(tube, -cav, 0.003), 100.0);
  add(d, smax(shield, -cav, 0.003), 101.0);
  // objective: one piece of glass, bulging forwards
  add(d, max(max(length(q - vec3(0.0, 0.385, 0.0)) - 0.120, 0.4645 - t), r - 0.0745), 103.0);
  // ---- focuser: a casting that necks the tube down, chrome drawtube, a knob each side ----
  float casting = sdCapCone(q - vec3(0.0, -0.386, 0.0), 0.026, 0.043, 0.0725) - 0.004;
  casting = min(casting, sdRBox(q - vec3(0.0, -0.392, -0.048), vec3(0.034, 0.022, 0.022), 0.007));
  float knobs = sdRCyl(vec3(q.z + 0.058, abs(q.x) - 0.086, q.y + 0.392), 0.025, 0.012, 0.004);
  knobs += 0.0008 * sin(atan(q.z + 0.058, q.y + 0.392) * 26.0) * step(0.02, length(vec2(q.z + 0.058, q.y + 0.392)));
  float chrome = sdCyl(q - vec3(0.0, -0.45, 0.0), 0.030, 0.045);
  chrome = min(chrome, sdCyl(vec3(q.z + 0.058, q.x, q.y + 0.392), 0.007, 0.086));
  // star diagonal and eyepiece
  vec3 g = q - vec3(0.0, -0.520, 0.006);
  float diag = sdRBox(g, vec3(0.031, 0.034, 0.036), 0.008);
  diag = smax(diag, dot(g.yz, vec2(-0.7071, -0.7071)) - 0.024, 0.006);
  vec3 e = vec3(q.x, q.z - 0.006, q.y + 0.520);                                               // y = up out of the diagonal
  chrome = min(chrome, sdCyl(e - vec3(0.0, 0.045, 0.0), 0.021, 0.014));
  float eye = sdRCyl(e - vec3(0.0, 0.092, 0.0), 0.030, 0.036, 0.006);
  eye = smax(eye, -(length(e - vec3(0.0, 0.150, 0.0)) - 0.034), 0.004);                       // the dished eye lens
  eye += 0.0010 * sin(atan(e.z, e.x) * 30.0) * smoothstep(0.012, 0.0, abs(e.y - 0.085));      // knurled grip
  add(d, min(min(casting, diag), min(knobs, eye)), 102.0);
  add(d, chrome, 104.0);
  // ---- finder scope on two ring brackets ----
  vec3 f = q - vec3(0.050, 0.0, 0.110);
  float fr = length(f.xz);
  float finder = sdRCyl(f - vec3(0.0, -0.07, 0.0), 0.0185, 0.125, 0.004);
  add(d, finder, 100.0);
  float fend = min(sdRCyl(f - vec3(0.0, 0.075, 0.0), 0.0255, 0.028, 0.005), sdRCyl(f - vec3(0.0, -0.212, 0.0), 0.0165, 0.022, 0.004));
  fend = max(fend, -max(fr - 0.020, 0.085 - f.y));
  float ft = abs(f.y + 0.085) - 0.070;
  float brk = length(vec2(fr - 0.0245, ft)) - 0.0058;
  brk = min(brk, sdCapsule(vec3(q.x, ft, q.z), vec3(0.029, 0.0, 0.064), vec3(0.036, 0.0, 0.084), 0.0085));
  add(d, min(fend, brk), 102.0);
  // ---- mount: cradle band round the tube, fork with a clamp knob each side, turntable on the tripod head ----
  vec3 v = p - TS_O;
  vec3 mq = vec3(dot(v.xz, vec2(0.788, 0.616)), v.y, dot(v.xz, vec2(-0.616, 0.788)));
  float cradle = sdRCyl(q, 0.0768, 0.034, 0.004);
  float arms = sdRBox(vec3(mq.x, mq.y + 0.085, abs(mq.z) - 0.0935), vec3(0.036, 0.115, 0.0085), 0.007);
  arms = smax(arms, length(vec2(mq.x, max(mq.y, 0.0))) - 0.036, 0.004);                       // rounded tops
  float base = sdRCyl(vec3(mq.x, mq.y + 0.195, mq.z), 0.108, 0.013, 0.005);
  float head = sdRCyl(vec3(mq.x, mq.y + 0.240, mq.z), 0.066, 0.034, 0.008);
  add(d, min(min(cradle, arms), min(base, head)), 105.0);
  float clampK = sdRCyl(vec3(q.y, abs(q.x) - 0.116, q.z), 0.038, 0.012, 0.005);
  clampK += 0.0015 * sin(atan(q.z, q.y) * 16.0) * step(0.025, length(q.yz));
  clampK = min(clampK, sdCyl(vec3(q.y, abs(q.x) - 0.095, q.z), 0.012, 0.02));
  add(d, clampK, 102.0);
  // ---- tripod ----
  float sector; vec3 fo = tsFold(p, sector);
  vec3 lg = tsLeg(fo);
  float slats = sdRBox(vec3(lg.x - 0.205, lg.y, abs(lg.z) - 0.0215), vec3(0.205, 0.0105, 0.0085), 0.003);
  slats = min(slats, sdRBox(vec3(lg.x - 0.475, lg.y, lg.z), vec3(0.170, 0.0095, 0.0105), 0.003));
  add(d, slats, 106.0);
  float brass = sdRBox(vec3(lg.x - 0.385, lg.y, lg.z), vec3(0.017, 0.0145, 0.0345), 0.004);    // the clamp that locks the sliding part
  brass = min(brass, sdRCyl(vec3(lg.x - 0.385, lg.y - 0.034, lg.z), 0.017, 0.009, 0.003));
  brass = min(brass, sdCyl(vec3(lg.x - 0.385, lg.y - 0.018, lg.z), 0.005, 0.012));
  brass = min(brass, sdRBox(vec3(lg.x - 0.012, lg.y, lg.z), vec3(0.022, 0.015, 0.0345), 0.005));   // hinge at the head
  brass = min(brass, sdCyl(vec3(lg.x - 0.010, lg.z, lg.y), 0.0065, 0.040));                         // its pin
  brass = min(brass, sdCapCone(vec3(lg.y, -(lg.x - 0.650), lg.z), 0.016, 0.0125, 0.0045));          // ferrule at the foot
  add(d, brass, 101.0);
  add(d, sdCapsule(lg, vec3(0.662, 0.0, 0.0), vec3(0.668, 0.0, 0.0), 0.0095), 108.0);               // rubber tip
  // accessory tray: a three-cornered plate hung between the legs, with holes for eyepieces
  float tri = 0.5 * fo.x + 0.866 * abs(fo.z) - 0.108;
  float tray = extrudeR(tri - 0.012, fo.y - 0.300, 0.0065, 0.003);
  tray = max(tray, -(length(vec2(fo.x - 0.105, fo.z)) - 0.026));
  tray = min(tray, extrudeR(max(tri - 0.012, -(tri - 0.006)), fo.y - 0.308, 0.011, 0.003));        // a turned-up lip
  tray = min(tray, sdRBox(vec3(fo.x - 0.232, fo.y - 0.300, fo.z), vec3(0.022, 0.005, 0.012), 0.003)); // tab to the leg
  add(d, tray, 107.0);
  add(d, sdRCyl(vec3(fo.x, fo.y - 0.316, fo.z), 0.022, 0.012, 0.004), 102.0);                       // tray knob
  d *= TS_S;
  if (d0 < d) { d = d0; gM = m0; }
}
bool shGift(float id, vec3 p, inout vec3 n, inout Mat m) {
  if (id < 100.0 || id >= 112.0) return false;
  p /= TS_S;
  vec3 q = tsTube(p);
  float r = length(q.xz), t = q.y, phi = atan(q.z, q.x);
  bool bore = (r < 0.0700 && t > 0.19) || (r < 0.0780 && t > 0.452);
  if (id < 101.5 && bore) {
    // inside: dead-black flocking, with baffle rings
    m.col = vec3(0.012) * (0.7 + 0.6 * noise(p * 300.0)); m.rough = 0.95;
    m.col *= 1.0 + 1.5 * (1.0 - smoothstep(0.0, 0.004, abs(fract(t * 22.0) - 0.5) / 22.0));
    return true;
  }
  if (id < 100.5) {
    // white stove enamel; navy trim bands, and a maker's plate by the focuser
    vec3 n2 = n; matPaint(m, n2, p, srgb(0.66, 0.66, 0.635), 0.9, 0.10, srgb(0.3, 0.3, 0.32), 1.0); n = normalize(mix(n, n2, 0.12));
    m.rough = 0.26 + 0.1 * smudge(p); m.coatRough = 0.10 + 0.06 * smudge(p * 2.0);
    bool finder = length((q - vec3(0.050, 0.0, 0.110)).xz) < 0.03;
    if (!finder) {
      float bandT = min(abs(t - 0.338), abs(t + 0.322));
      float band = 1.0 - smoothstep(0.009, 0.0105, bandT);
      m.col = mix(m.col, srgb(0.05, 0.09, 0.24), band);
      float pin = 1.0 - smoothstep(0.0012, 0.002, abs(bandT - 0.016));
      m.col = mix(m.col, srgb(0.80, 0.60, 0.25), pin); m.metal = 0.6 * pin;
      // plate: enamelled badge with gold edge and two lines of lettering
      vec2 u = vec2((phi - 0.95) * 0.072, t + 0.215);
      float pl = sdBox2(u, vec2(0.030, 0.050) - 0.006) - 0.006;
      if (pl < 0.0) {
        m.col = srgb(0.05, 0.09, 0.24); m.coat = 0.8;
        float gold = 1.0 - smoothstep(0.0, 0.0015, abs(pl + 0.005) - 0.0012);
        gold = max(gold, step(abs(abs(u.x) - 0.008) , 0.0028) * step(abs(u.y), 0.032) * step(0.35, noise(u.y * 260.0 + step(0.0, u.x) * 9.0)));
        m.col = mix(m.col, srgb(0.90, 0.70, 0.30), gold); m.metal = 0.7 * gold;
      }
      // faint drips of old polish and handling near the focuser end
      m.col *= 0.93 + 0.07 * smoothstep(0.3, 0.7, fbm3(p * 5.0));
    }
    return true;
  }
  if (id < 101.5) {
    // lacquered brass, spun round its axis on the tube, drawn along the legs
    bool onTube = r < 0.095 && t > 0.3;
    matMetal(m, n, p, 1, onTube ? cross(TS_A, normalize(p - TS_O - TS_A * t)) : vec3(0.3, 0.9, 0.2));
    m.rough += 0.10; m.col *= 0.92;
    if (onTube) { float spun = noise(t * 1400.0); m.col *= 0.9 + 0.2 * spun; m.rough += 0.08 * spun; }
    return true;
  }
  if (id < 102.5) {
    // black crackle paint on the castings and knobs: lifted to charcoal so it does not vanish
    m.col = srgb(0.125, 0.125, 0.135) * (0.9 + 0.2 * fbm3(p * 6.0));
    m.rough = 0.40 + 0.12 * smudge(p * 2.0); m.coat = 0.25; m.coatRough = 0.22;
    bumpN(n, p, 420.0, 0.12);
    // worn to bright metal on the corners you touch
    float worn = smoothstep(0.66, 0.74, fbm3(p * 16.0));
    m.col = mix(m.col, srgb(0.42, 0.42, 0.44), 0.6 * worn); m.metal = 0.6 * worn;
    return true;
  }
  if (id < 103.5) {
    // coated crown glass: mostly looks through into the dark tube, and throws back a blue-green bloom
    m.col = srgb(0.62, 0.86, 0.80); m.trans = 0.72; m.ior = 1.52; m.rough = 0.045; m.metal = 1.0;
    m.absorb = vec3(0.6, 0.15, 0.3);
    return true;
  }
  if (id < 104.5) { matMetal(m, n, p, 3, TS_A); m.rough += 0.06; return true; }
  if (id < 105.5) {
    // mount: hammered grey enamel over casting alloy
    vec3 n2 = n; matPaint(m, n2, p, srgb(0.36, 0.40, 0.43), 0.6, 0.22, srgb(0.55, 0.55, 0.57), 1.0); n = normalize(mix(n, n2, 0.2));
    bumpN(n, p, 55.0, 0.22);
    return true;
  }
  if (id < 106.5) {
    // ash legs, varnished, the grain running down each leg
    float sector; vec3 fo = tsFold(p, sector); vec3 lg = tsLeg(fo);
    float a = TS_LEG0 + sector * 2.0944;
    vec3 along = vec3(cos(a) * 0.5547, -0.8321, sin(a) * 0.5547);
    matWood(m, n, p + sector * 0.7 + step(0.0, lg.z) * 0.3, along, 0.16, 0.75);
    m.col *= 0.80;
    // bruised and dirty towards the feet, edges rubbed
    m.col *= 1.0 - 0.3 * smoothstep(0.45, 0.66, lg.x) * noise(p * 30.0);
    // centimetre marks burnt into the sliding part
    float mark = (1.0 - smoothstep(0.0, 0.0012, abs(fract(lg.x * 40.0) - 0.5) / 40.0 - 0.0006)) * step(0.41, lg.x) * step(lg.x, 0.62) * step(abs(lg.z), 0.005) * step(0.0, lg.y);
    m.col = mix(m.col, srgb(0.10, 0.06, 0.03), 0.7 * mark);
    return true;
  }
  if (id < 107.5) {
    matMetal(m, n, p, 0, vec3(1, 0, 0));
    m.col *= 0.75; m.rough += 0.12;
    return true;
  }
  matRubber(m, n, p, srgb(0.08, 0.08, 0.085));
  return true;
}
