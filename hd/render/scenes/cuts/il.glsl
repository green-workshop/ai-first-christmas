// Backdrops for the interlude's first two beats. KIND picks the picture:
//  0  il-desk  the board's memo lands here: a desk top seen from straight above, lamp in the corner, mug, pencil
//  1  il-den   the wall behind Father Christmas's desk: brick, pipes, the pendant on the left, the window on the right
//  2  il-kit   what is on his desk in front of the monitor: tickets, keyboard, glasses, mug (a strip with transparent background)
//@shot il-desk KIND=0 w=1600 h=1000 spp=260 ortho=5.0 pos=0,0,12 tgt=0,0,0 exposure=1.7
//@shot il-den KIND=1 w=1600 h=800 spp=240 ortho=4.0 pos=0,0,14 tgt=0,0,0 exposure=2.0 aperture=0.05
//@shot il-kit KIND=2 w=1800 h=260 spp=320 alpha=1 ortho=1.3 pos=0,5.75,13.6 tgt=0,0.8,0 exposure=1.7
#ifndef KIND
#define KIND 0
#endif
#define STEPK 0.8
#define TMAX 60.0

#if KIND == 0
#define NL 3
const vec3 LAMPC = vec3(-7.0, 4.3, 0.0), MUGC = vec3(6.0, 3.2, 0.0), PEN = vec3(-5.6, -3.3, 0.0);
Light getLight(int i) {
  if (i == 0) return spot(vec3(-6.4, 3.8, 2.6), 0.25, vec3(1.0, 0.72, 0.42) * 60.0, vec3(-1.0, -0.2, 0.0), 40.0, 78.0);    // the desk lamp
  if (i == 1) return omni(vec3(19.0, -13.0, 9.0), 3.0, vec3(0.35, 0.48, 0.95) * 190.0);                                   // cold room light, off to one side so its reflection misses the frame
  return omni(vec3(-17.0, 12.0, 9.0), 3.0, vec3(1.0, 0.9, 0.8) * 120.0);
}
vec3 sky(vec3 rd) { return vec3(0.01, 0.014, 0.03); }
float map(vec3 p) {
  float d = 1e9; gM = 0.0;
  add(d, p.z, 1.0);
  // banker's lamp from above: green glass shade, brass cap and arm
  vec3 l = p - LAMPC;
  float bb = length(l) - 3.4;
  if (bb > 0.2) d = min(d, bb); else {
    add(d, sdEllipsoid(l - vec3(0.0, 0.0, 1.5), vec3(1.75, 1.2, 0.55)), 2.0);
    add(d, sdRCyl((l - vec3(0.0, 0.0, 2.02)).xzy, 0.22, 0.1, 0.05), 3.0);
    add(d, sdCapsule(l, vec3(-0.9, 0.9, 1.7), vec3(-2.6, 2.4, 1.2), 0.1), 3.0);
  }
  // mug from above, handle to the right
  vec3 m = p - MUGC;
  bb = length(m) - 1.6;
  if (bb > 0.2) d = min(d, bb); else {
    float cup = sdRCyl(m.xzy - vec3(0.0, 0.5, 0.0), 0.74, 0.5, 0.06);
    cup = max(cup, -sdRCyl(m.xzy - vec3(0.0, 0.62, 0.0), 0.64, 0.5, 0.05));
    add(d, cup, 4.0);
    add(d, sdTorus(m - vec3(0.95, -0.1, 0.5), 0.3, 0.09), 4.0);
    add(d, sdCyl(m.xzy - vec3(0.0, 0.78, 0.0), 0.65, 0.02), 5.0);
  }
  // pencil
  vec3 q = p - PEN; q.xy = rot(-0.42) * q.xy;
  bb = length(q) - 2.4;
  if (bb > 0.2) d = min(d, bb); else {
    vec3 h = q - vec3(0.0, 0.0, 0.09);
    float a = atan(h.z, h.y), hex = max(length(h.yz) * cos(mod(a, 1.0472) - 0.5236) - 0.085, abs(h.x) - 1.5);
    add(d, hex, 6.0);
    add(d, sdCapCone((h - vec3(1.68, 0.0, 0.0)).yxz, 0.18, 0.09, 0.012), 7.0);
    add(d, sdCyl((h - vec3(-1.62, 0.0, 0.0)).yxz, 0.092, 0.12), 3.0);
    add(d, sdRCyl((h - vec3(-1.86, 0.0, 0.0)).yxz, 0.088, 0.12, 0.04), 8.0);
  }
  return d;
}
void shade(float id, vec3 p, inout vec3 n, inout Mat m) {
  if (id < 1.5) {
    matWood(m, n, p * vec3(0.3, 2.2, 2.2) + vec3(0.0, 1.3, 0.0), vec3(1.0, 0.03, 0.0), 0.82, 0.75);
    float ring = (1.0 - smoothstep(0.0, 0.035, abs(length(p.xy - vec2(3.9, 2.2)) - 0.74))) * (0.5 + 0.5 * noise(p.xy * 6.0));
    m.col *= 1.0 - 0.3 * ring; m.coat *= 1.0 - 0.6 * ring;
    return;
  }
  if (id < 2.5) { m.col = srgb(0.03, 0.30, 0.17); m.rough = 0.08; m.coat = 1.0; m.coatRough = 0.03; m.emit = vec3(0.1, 0.55, 0.25) * 0.1; return; }
  if (id < 3.5) { matMetal(m, n, p, 1, vec3(1, 0, 0)); return; }
  if (id < 4.5) { m.col = srgb(0.92, 0.89, 0.82) * (0.94 + 0.08 * fbm3(p * 4.0)); m.rough = 0.2; m.coat = 0.9; m.coatRough = 0.06; return; }
  if (id < 5.5) { m.col = srgb(0.09, 0.045, 0.02); m.rough = 0.06; m.coat = 1.0; return; }
  if (id < 6.5) { matPaint(m, n, p * 3.0, srgb(0.66, 0.07, 0.06), 0.8, 0.25, srgb(0.75, 0.6, 0.4), 0.0); return; }
  if (id < 7.5) { vec3 q = p - PEN; q.xy = rot(-0.42) * q.xy; m.col = q.x > 1.8 ? srgb(0.08, 0.08, 0.09) : srgb(0.82, 0.66, 0.46) * (0.9 + 0.2 * noise(p * 40.0)); m.rough = 0.7; return; }
  m.col = srgb(0.86, 0.45, 0.50); m.rough = 0.7;
}

#elif KIND == 1
#define NL 4
#define FOG 0.012
#define FOG_LIGHT 0
#define FOG_LIGHT2 1
const vec3 DLAMP = vec3(-5.1, 2.75, 1.4), WIN = vec3(5.5, 2.15, 0.0);
Light getLight(int i) {
  if (i == 0) return spot(DLAMP, 0.1, vec3(1.0, 0.72, 0.42) * 150.0, vec3(-3.6, -2.2, 0.0), 30.0, 58.0);
  if (i == 1) return spot(WIN + vec3(0.0, 0.0, 0.5), 0.12, vec3(0.42, 0.58, 1.0) * 150.0, vec3(1.5, -4.0, 3.0), 12.0, 24.0);
  if (i == 2) return omni(vec3(-2.0, 0.0, 16.0), 3.0, vec3(1.0, 0.86, 0.72) * 260.0);
  return omni(vec3(10.0, 4.0, 6.0), 1.0, vec3(0.4, 0.55, 1.0) * 30.0);
}
vec3 sky(vec3 rd) { return vec3(0.012, 0.016, 0.03); }
float map(vec3 p) {
  float d = 1e9; gM = 0.0;
  float bid; float mortar = brickPattern(p.xy * 0.8, bid);
  add(d, p.z + 0.016 * mortar - 0.007 * bid, 1.0);
  if (p.z < 0.8) {
    float pipe = length(vec2(p.y - 3.55, p.z - 0.2)) - 0.11;
    pipe = min(pipe, max(length(vec2(p.y - 3.55, p.z - 0.2)) - 0.16, abs(repLim(p.x - 0.6, 2.9, -3.0, 3.0)) - 0.04));
    add(d, pipe, 2.0);
    add(d, length(vec2(p.y - 3.22, p.z - 0.12)) - 0.05, 3.0);
    // window
    vec3 w = p - WIN;
    float frame = max(sdRBox(w, vec3(1.06, 0.8, 0.14), 0.03), -sdBox(w, vec3(0.9, 0.64, 0.3)));
    frame = min(frame, min(sdBox(w, vec3(0.035, 0.64, 0.05)), sdBox(w, vec3(0.9, 0.035, 0.05))));
    frame = min(frame, sdRBox(w - vec3(0.0, -0.88, 0.12), vec3(1.18, 0.06, 0.22), 0.02));
    add(d, frame, 4.0);
    add(d, sdBox(w - vec3(0.0, 0.0, 0.04), vec3(0.9, 0.64, 0.012)), 5.0);
    float snow = smin(sdEllipsoid(w - vec3(-0.2, -0.7, 0.05), vec3(0.8, 0.16, 0.1)), sdEllipsoid(w - vec3(0.2, -0.81, 0.2), vec3(1.05, 0.07, 0.18)), 0.08);
    add(d, snow - 0.01 * noise(p * 20.0), 6.0);
    // his wall of notes
    for (int i = 0; i < 7; i++) {
      float fi = float(i); vec3 s = p - vec3(-4.0 + 2.9 * hash1(fi * 3.7 + 1.0), 1.3 - 1.9 * hash1(fi * 5.3 + 2.0), 0.012);
      s.xy = rot((mod(fi * 37.0, 17.0) - 8.0) * 0.03) * s.xy;
      add(d, sdRBox(s - vec3(0.0, 0.0, 0.02 * smoothstep(-0.1, 0.19, -s.y)), vec3(0.19, 0.18, 0.003), 0.002) * 0.8, 7.0 + mod(fi, 2.0));
    }
  }
  // pendant lamp
  float bb = sdBox(p - vec3(DLAMP.x, 5.0, DLAMP.z), vec3(0.75, 3.0, 0.75));
  if (bb > 0.1) d = min(d, bb); else {
    vec3 q = p - DLAMP - vec3(0, 0.1, 0);
    float cone = sdCapCone(q, 0.26, 0.66, 0.13);
    add(d, max(abs(cone) - 0.011, -0.25 - q.y), cone < 0.0 ? 10.0 : 9.0);
    add(d, sdRCyl(q - vec3(0, 0.34, 0), 0.105, 0.09, 0.02), 3.0);
    add(d, sdCapsule(p, DLAMP + vec3(0, 0.5, 0), DLAMP + vec3(0, 6.0, 0), 0.018), 11.0);
    add(d, sdSphere(p - DLAMP - vec3(0, 0.03, 0), 0.09), 12.0);
  }
  return d;
}
void shade(float id, vec3 p, inout vec3 n, inout Mat m) {
  if (id < 1.5) { matBrick(m, n, p * 0.8, p.xy * 0.8, srgb(0.11, 0.155, 0.30), 0.42); float damp = 1.0 - smoothstep(-4.5, -1.0, p.y + 0.8 * fbm(p.xy * 0.5)); m.col *= 1.0 - 0.5 * damp; return; }
  if (id < 2.5) { matPaint(m, n, p * 0.7, srgb(0.16, 0.19, 0.25), 0.4, 0.75, srgb(0.30, 0.16, 0.10), 0.6); return; }
  if (id < 3.5) { matMetal(m, n, p, abs(p.y - 3.22) < 0.08 ? 4 : 1, vec3(1, 0, 0)); return; }      // copper pipe, brass lamp cap
  if (id < 4.5) { matPaint(m, n, p * 0.7, srgb(0.14, 0.16, 0.20), 0.5, 0.6, srgb(0.3, 0.17, 0.1), 0.6); return; }
  if (id < 5.5) {
    vec2 q = p.xy - WIN.xy;
    vec3 skyc = mix(vec3(0.02, 0.035, 0.09), vec3(0.008, 0.012, 0.04), sat(q.y * 0.7 + 0.5));
    float moon = (1.0 - smoothstep(0.15, 0.17, length(q - vec2(0.42, 0.3)))) * smoothstep(0.13, 0.15, length(q - vec2(0.49, 0.34)));
    float star = step(0.985, hash1(floor(q * 28.0))) * step(-0.25, q.y);
    float frost = smoothstep(0.45, 0.8, fbm(q * 5.0 + 3.0)) * (1.0 - smoothstep(0.0, 0.5, min(0.9 - abs(q.x), 0.64 - abs(q.y))));
    m.col = vec3(0.02); m.rough = 0.08; m.coat = 1.0;
    m.emit = skyc * 5.0 + vec3(1.0, 0.96, 0.85) * moon * 20.0 + vec3(0.8, 0.9, 1.0) * star * 4.0 + vec3(0.35, 0.45, 0.6) * frost * 0.9;
    return;
  }
  if (id < 6.5) { matSnow(m, n, p); return; }
  if (id < 8.5) { matPaper(m, n, p, 0, id < 7.5 ? srgb(0.96, 0.82, 0.36) : srgb(0.90, 0.86, 0.76)); float sc = step(abs(fract(p.y * 9.0) - 0.5), 0.06) * step(0.3, noise(p.xy * 3.0)); m.col *= 1.0 - 0.35 * sc; return; }
  if (id < 9.5) { matPaint(m, n, p, srgb(0.05, 0.25, 0.17), 0.9, 0.3, srgb(0.1, 0.1, 0.11), 1.0); return; }
  if (id < 10.5) { m.col = srgb(0.93, 0.90, 0.82); m.rough = 0.35; m.coat = 0.5; return; }
  if (id < 11.5) { matRubber(m, n, p, srgb(0.03, 0.03, 0.033)); return; }
  m.col = vec3(0.0); m.glow = vec3(1.0, 0.72, 0.36) * 28.0;
}

#else
#define NL 3
Light getLight(int i) {
  if (i == 0) return spot(vec3(-6.0, 7.0, 3.0), 0.3, vec3(1.0, 0.74, 0.46) * 240.0, vec3(-1.0, 0.0, 0.0), 30.0, 60.0);
  if (i == 1) return omni(vec3(8.0, 4.0, 8.0), 2.0, vec3(0.35, 0.48, 0.95) * 80.0);
  return omni(vec3(0.0, 4.0, 14.0), 3.0, vec3(1.0, 0.9, 0.8) * 60.0);
}
vec3 sky(vec3 rd) { return vec3(0.012, 0.016, 0.03); }
float map(vec3 p) {
  float d = 1e9; gM = 0.0;
  add(d, p.y, 1.0);
  // a pile of tickets, the top one with a red band
  vec3 t = p - vec3(-5.8, 0.0, 0.2);
  for (int i = 0; i < 3; i++) { float fi = float(i); vec3 s = t - vec3(0.25 * fi, 0.03 + 0.045 * fi, -0.22 * fi); s.xz = rot(0.1 - 0.12 * fi) * s.xz; add(d, sdRBox(s, vec3(1.3, 0.016, 0.72), 0.008), 2.0 + fi); }
  // keyboard
  vec3 k = p - vec3(0.0, 0.0, 0.1);
  float base = sdRBox(k - vec3(0.0, 0.07, 0.0), vec3(3.1, 0.07, 0.75), 0.04);
  add(d, base, 5.0);
  vec3 kk = k - vec3(0.0, 0.16, 0.0); kk.x = repLim(kk.x, 0.36, -8.0, 8.0); kk.z = repLim(kk.z, 0.36, -1.0, 1.0);
  add(d, max(sdRBox(kk, vec3(0.15, 0.05, 0.15), 0.03), abs(k.x) - 3.0), 6.0);
  // folded reading glasses
  vec3 g = p - vec3(4.05, 0.12, 0.25); vec3 gm = g; gm.x = abs(gm.x) - 0.27;
  add(d, min(sdTorus(gm, 0.2, 0.018), sdCapsule(g, vec3(-0.08, 0.0, 0.0), vec3(0.08, 0.0, 0.0), 0.016)), 7.0);
  // mug
  vec3 m = p - vec3(6.2, 0.0, 0.1);
  float cup = max(sdRCyl(m - vec3(0.0, 0.55, 0.0), 0.44, 0.55, 0.05), -sdRCyl(m - vec3(0.0, 0.68, 0.0), 0.37, 0.56, 0.04));
  add(d, cup, 8.0);
  add(d, sdTorus((m - vec3(0.52, 0.55, 0.0)).xzy, 0.24, 0.07), 8.0);
  add(d, sdCyl(m - vec3(0.0, 0.9, 0.0), 0.37, 0.02), 9.0);
  return d;
}
void shade(float id, vec3 p, inout vec3 n, inout Mat m) {
  if (id < 1.5) { matWood(m, n, p * vec3(0.3, 2.2, 2.2), vec3(1.0, 0.03, 0.0), 0.8, 0.75); m.catcher = 1.0; return; }
  if (id < 4.5) { matPaper(m, n, p, 0, srgb(0.95, 0.92, 0.85)); if (id > 3.5 && p.z > 0.2) m.col = mix(m.col, srgb(0.66, 0.12, 0.10), step(0.55, p.z + 0.44)); return; }
  if (id < 5.5) { matPlastic(m, n, p, srgb(0.06, 0.065, 0.08), 0.5); return; }
  if (id < 6.5) { matPlastic(m, n, p, srgb(0.11, 0.12, 0.15), 0.4); return; }
  if (id < 7.5) { matMetal(m, n, p, 1, vec3(1, 0, 0)); return; }
  if (id < 8.5) { m.col = srgb(0.07, 0.36, 0.22) * (0.94 + 0.08 * fbm3(p * 4.0)); m.rough = 0.2; m.coat = 0.9; m.coatRough = 0.06; return; }
  m.col = srgb(0.09, 0.045, 0.02); m.rough = 0.06; m.coat = 1.0;
}
#endif
