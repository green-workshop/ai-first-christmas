// Seaside jigsaw: the printed box standing on end (a lighthouse on the lid, "100" in a yellow roundel), with five loose
// pieces of thick card round its foot, one of them face down. Material ids 100..102. HUE is the colour of the box.
#ifndef HUE
#define HUE srgb(0.05, 0.38, 0.60)
#endif
const float jigYaw = 0.30;
const vec3 jigB = vec3(0.36, 0.49, 0.085);        // half size of the box
vec3 jigLocal(vec3 p) { p -= vec3(-0.10, jigB.y, -0.28); p.xz = rot(jigYaw) * p.xz; return p; }
// ---- the picture on the lid and on the pieces: u runs 0..1 across and up ----
vec3 jigPic(vec2 u) {
  vec3 col = mix(srgb(0.80, 0.90, 0.94), srgb(0.20, 0.52, 0.86), smoothstep(0.42, 1.0, u.y));                // sky
  float sun = length(u - vec2(0.20, 0.83));
  col += 0.14 * exp(-sun * 9.0) * vec3(1.0, 0.9, 0.6);
  col = mix(col, srgb(1.0, 0.92, 0.50), 1.0 - smoothstep(0.066, 0.074, sun));
  float cl = min(min(length((u - vec2(0.60, 0.905)) * vec2(1.0, 1.6)) - 0.060, length((u - vec2(0.70, 0.890)) * vec2(1.0, 1.6)) - 0.080), length((u - vec2(0.81, 0.905)) * vec2(1.0, 1.6)) - 0.055);
  cl = min(cl, min(length((u - vec2(0.33, 0.640)) * vec2(1.0, 1.7)) - 0.055, length((u - vec2(0.42, 0.635)) * vec2(1.0, 1.7)) - 0.045));
  col = mix(col, srgb(0.98, 0.98, 0.97), 1.0 - smoothstep(0.0, 0.008, cl));
  for (int i = 0; i < 2; i++) {                                                                               // gulls
    vec2 g = u - (i == 0 ? vec2(0.40, 0.80) : vec2(0.50, 0.74));
    if (abs(g.x) < 0.032 && abs(g.y - 0.45 * abs(g.x) + 0.3 * g.x * g.x * 30.0 * 0.0) < 0.0055) col = srgb(0.16, 0.18, 0.22);
  }
  if (u.y < 0.44) {                                                                                           // sea
    col = mix(srgb(0.16, 0.62, 0.70), srgb(0.04, 0.33, 0.56), smoothstep(0.22, 0.44, u.y));
    float row = floor(u.y * 24.0), w = abs(fract(u.y * 24.0 + 0.25 * sin(u.x * 26.0 + row * 2.0)) - 0.5);
    if (w < 0.09 && sin(u.x * 15.0 + row * 4.7) > 0.25) col = mix(col, srgb(0.93, 0.97, 0.98), 0.8);
    // a sailing boat
    vec2 s = u - vec2(0.25, 0.365);
    if (s.y > 0.0 && s.y < 0.062 && s.x > -0.034 * (1.0 - s.y / 0.062) && s.x < 0.022 * (1.0 - s.y / 0.062)) col = srgb(0.97, 0.96, 0.92);
    if (abs(s.x + 0.004) < 0.045 - 0.6 * abs(s.y + 0.008) && abs(s.y + 0.008) < 0.007) col = srgb(0.74, 0.13, 0.10);
  }
  float shore = 0.235 + 0.03 * sin(u.x * 7.0 + 1.0);
  if (u.y < shore + 0.012) col = srgb(0.96, 0.97, 0.95);                                                      // foam
  if (u.y < shore) col = mix(srgb(0.93, 0.80, 0.52), srgb(0.80, 0.64, 0.38), smoothstep(0.03, 0.0, shore - u.y) * 0.0 + 0.6 * (1.0 - smoothstep(0.0, 0.03, shore - u.y))) * (0.95 + 0.08 * hash1(floor(u * 260.0)));
  // the headland and its lighthouse
  vec2 hd = (u - vec2(0.72, 0.265)) / vec2(0.36, 0.085);
  if (dot(hd, hd) < 1.0) col = mix(srgb(0.40, 0.38, 0.36), srgb(0.33, 0.56, 0.24), smoothstep(0.2, 0.6, hd.y + 0.3 * sin(u.x * 40.0) * 0.2)) * (0.9 + 0.2 * hash1(floor(u * 90.0)));
  vec2 t = u - vec2(0.66, 0.33); float ty = t.y / 0.37, hw = mix(0.072, 0.044, ty);
  if (ty > 0.0 && ty < 1.0 && abs(t.x) < hw) {
    col = mod(floor(ty * 5.0), 2.0) < 0.5 ? srgb(0.82, 0.12, 0.10) : srgb(0.97, 0.96, 0.93);
    col *= 1.0 - 0.28 * smoothstep(-0.2, 1.0, t.x / hw);
    if (abs(t.x) < 0.017 && t.y < 0.05) col = srgb(0.15, 0.17, 0.22);                                          // door
  }
  if (t.y > 0.37 && t.y < 0.39 && abs(t.x) < 0.064) col = srgb(0.16, 0.18, 0.24);                              // gallery
  if (t.y > 0.39 && t.y < 0.45 && abs(t.x) < 0.035) col = abs(fract(t.x / 0.0233) - 0.5) > 0.4 ? srgb(0.16, 0.18, 0.24) : srgb(1.0, 0.93, 0.55);   // lantern
  if (t.y > 0.45 && t.y < 0.51 && abs(t.x) < 0.048 * (1.0 - (t.y - 0.45) / 0.06)) col = srgb(0.70, 0.10, 0.09);                                     // roof
  // a beach umbrella
  vec2 um = u - vec2(0.24, 0.125);
  if (abs(um.x) < 0.005 && um.y < 0.0 && um.y > -0.085) col = srgb(0.35, 0.25, 0.16);
  if (um.y > 0.0 && length(um * vec2(1.0, 1.35)) < 0.095) col = mod(floor(atan(um.x, um.y) * 2.6 + 4.0), 2.0) < 0.5 ? srgb(0.86, 0.14, 0.12) : srgb(0.98, 0.97, 0.93);
  return col;
}
// ---- the pieces ----
float jigTab(vec2 p) {            // a knob growing along +y from an edge at y = 0
  return smin(length(p - vec2(0.0, 0.058)) - 0.040, sdBox2(p - vec2(0.0, 0.012), vec2(0.018, 0.026)), 0.014);
}
// outline of a piece: a square of half-side 0.13 with a knob (+1), a socket (-1) or a straight edge (0) on its top, right, bottom and left
float jigShape(vec2 p, vec4 s) {
  float d = sdBox2(p, vec2(0.13 - 0.014)) - 0.014;
  for (int i = 0; i < 4; i++) {
    float k = i == 0 ? s.x : i == 1 ? s.y : i == 2 ? s.z : s.w;
    vec2 q = i == 0 ? vec2(p.x - 0.012, p.y - 0.13) : i == 1 ? vec2(p.y + 0.010, p.x - 0.13) : i == 2 ? vec2(p.x + 0.008, -p.y - 0.13) : vec2(p.y - 0.014, -p.x - 0.13);
    if (k > 0.5) d = min(d, jigTab(q));
    else if (k < -0.5) d = smax(d, 0.004 - jigTab(vec2(q.x, -q.y)), 0.006);
  }
  return d;
}
// piece i: its distance, and l = the point in the piece's own space (xy in its plane, +z its printed face)
float jigOne(vec3 p, int i, out vec3 l, out vec4 sides, out vec2 uvc) {
  vec3 c; vec3 r;               // r = yaw, lean back from upright, spin in its own plane
  if (i == 0) { c = vec3(0.020, 0.130, -0.100); r = vec3(0.30, 0.30, 0.0); sides = vec4(1, -1, 0, -1); uvc = vec2(0.66, 0.56); }        // lighthouse, leaning on the box
  else if (i == 1) { c = vec3(-0.365, 0.124, -0.190); r = vec3(0.30, 0.50, 0.0); sides = vec4(1, -1, 0, 1); uvc = vec2(0.44, 0.84); }   // sky, leaning on the box
  else if (i == 2) { c = vec3(0.365, 0.120, -0.020); r = vec3(-0.22, 0.55, 0.0); sides = vec4(-1, 1, 0, 1); uvc = vec2(0.27, 0.38); }   // sea, propped on the first
  else if (i == 3) { c = vec3(0.090, 0.012, 0.230); r = vec3(-0.40, 1.5708, 0.0); sides = vec4(1, -1, 1, -1); uvc = vec2(0.24, 0.15); } // sand, lying flat
  else { c = vec3(-0.340, 0.012, 0.190); r = vec3(0.65, -1.5708, 0.0); sides = vec4(-1, 1, 1, -1); uvc = vec2(0.5, 0.5); }              // face down
  l = p - c;
  float bs = length(l) - 0.27;
  if (bs > 0.06) return bs;
  l.xz = rot(r.x) * l.xz; l.yz = rot(-r.y) * l.yz; l.xy = rot(r.z) * l.xy;
  return extrudeR(jigShape(l.xy, sides), l.z, 0.011, 0.003);
}
float jigAll(vec3 p, out vec3 l, out vec4 sides, out vec2 uvc, out float which) {
  float d = 1e9; which = 0.0;
  for (int i = 0; i < 5; i++) {
    vec3 li; vec4 si; vec2 ui; float di = jigOne(p, i, li, si, ui);
    if (di < d) { d = di; l = li; sides = si; uvc = ui; which = float(i); }
  }
  return d;
}
void mGift(vec3 p, inout float d) {
  float bb = length(p - vec3(0.0, 0.48, -0.03)) - 0.86;
  if (bb > 0.15) { d = min(d, bb); return; }
  vec3 b = jigLocal(p), B = jigB;
  // the lid, with a thumb notch in each side, and the tray it slides over showing at the back
  float lid = sdRBox(b - vec3(0.0, 0.0, 0.013), vec3(B.x, B.y, B.z - 0.013), 0.006);
  lid = smax(lid, 0.036 - length(vec2(b.z + B.z - 0.026, b.y)), 0.004);
  add(d, lid, 100.0);
  add(d, sdRBox(b + vec3(0.0, 0.0, 0.01), vec3(B.x - 0.006, B.y - 0.006, B.z - 0.01), 0.005), 101.0);
  vec3 l; vec4 sides; vec2 uvc; float which;
  add(d, jigAll(p, l, sides, uvc, which), 102.0);
}
bool shGift(float id, vec3 p, inout vec3 n, inout Mat m) {
  if (id < 100.0 || id >= 103.0) return false;
  vec3 b = jigLocal(p), B = jigB;
  if (id < 100.5) {
    vec3 f = abs(b) - B; f.z = abs(b.z - 0.013) - (B.z - 0.013);
    vec3 col = HUE;
    if (f.z > f.x && f.z > f.y && b.z > 0.0) {
      // the front of the lid
      vec2 q = b.xy - vec2(0.0, -0.065), ph = vec2(0.305, 0.375);
      float panel = sdBox2(q, ph);
      if (panel < 0.0) col = jigPic((q + ph) / (2.0 * ph));
      else if (panel < 0.010) col = srgb(0.96, 0.96, 0.93);
      // a white name strip above the picture, with the title in dark capitals
      vec2 tq = b.xy - vec2(-0.105, 0.405);
      if (sdBox2(tq, vec2(0.185, 0.034)) < 0.012) col = srgb(0.96, 0.96, 0.93);
      vec2 lq = vec2(tq.x / 0.050 + 3.5, tq.y / 0.048 + 0.5);                       // seven letter cells: S E A S I D E
      if (lq.x > 0.0 && lq.x < 7.0 && lq.y > 0.0 && lq.y < 1.0) {
        int li = int(floor(lq.x));
        int glyph = (li == 0 || li == 3) ? 16267326 : (li == 1 || li == 6) ? 33061407 : li == 2 ? 15269425 : li == 4 ? 32641183 : 32032318;
        vec2 cell = vec2(fract(lq.x) / 0.76, 1.0 - lq.y) * 5.0;                    // five dots across (then a gap) and five down
        if (cell.x < 5.0 && ((glyph >> ((4 - int(cell.y)) * 5 + 4 - int(cell.x))) & 1) == 1) col = mix(HUE, vec3(0.0), 0.5);
      }
      // the roundel: 100
      vec2 r = b.xy - vec2(0.225, 0.365); float rd = length(r);
      if (rd < 0.105) col = srgb(0.80, 0.12, 0.10);
      if (rd < 0.094) col = srgb(0.99, 0.80, 0.16);
      vec2 dg = r - vec2(0.0, 0.008);
      float num = min(sdBox2(dg + vec2(0.052, 0.0), vec2(0.0065, 0.030)), min(abs(sdBox2(dg + vec2(0.008, 0.0), vec2(0.007, 0.018)) - 0.011) - 0.0065, abs(sdBox2(dg - vec2(0.043, 0.0), vec2(0.007, 0.018)) - 0.011) - 0.0065));
      num = min(num, sdBox2(r + vec2(0.0, 0.052), vec2(0.036, 0.0045)));
      if (num < 0.0) col = srgb(0.13, 0.16, 0.30);
    } else if (f.x > f.y) {
      // the sides: the name again, running up the edge
      vec2 tq = vec2(b.y - 0.05, b.z - 0.015);
      if (sdBox2(tq, vec2(0.21, 0.022)) < 0.0) col = mix(col, srgb(0.96, 0.96, 0.93), abs(fract(tq.x / 0.06) - 0.5) < 0.36 ? 1.0 : 0.0);
    }
    vec3 n0 = n;
    matPaper(m, n, b, 3, col * (0.96 + 0.06 * noise(b * 180.0)));
    n = normalize(mix(n0, n, 0.12));                                              // laminated board: flat, with the faintest ripple
    // rubbed corners and edges where the print has gone to bare card
    float e1 = max(f.x, max(f.y, f.z)), e2 = f.x + f.y + f.z - e1 - min(f.x, min(f.y, f.z));
    float wear = smoothstep(-0.012, -0.001, e2) * smoothstep(0.35, 0.65, noise(b * 35.0) + 0.6 * smoothstep(-0.02, 0.0, e1 + e2 + min(f.x, min(f.y, f.z)) + 0.02));
    m.col = mix(m.col, srgb(0.86, 0.84, 0.78), 0.8 * wear); m.rough += 0.3 * wear; m.coat *= 1.0 - wear;
    return true;
  }
  if (id < 101.5) { matPaper(m, n, b, 1, srgb(0.83, 0.82, 0.78)); return true; }
  // a piece: print on the face, grey board everywhere else
  vec3 l; vec4 sides; vec2 uvc; float which; jigAll(p, l, sides, uvc, which);
  float edge = jigShape(l.xy, sides);
  if (l.z > 0.0075 && edge < -0.0015) {
    vec3 col = jigPic(uvc + l.xy / 0.86), n0 = n;
    matPaper(m, n, p, 3, col * (0.96 + 0.06 * noise(p * 180.0)));
    n = normalize(mix(n0, n, 0.12));
    m.rough += 0.1; m.coat = 0.35;
    float lip = smoothstep(-0.008, -0.002, edge);                                 // the die presses the edge down and cracks the ink
    m.col = mix(m.col, m.col * 0.8 + 0.12, 0.6 * lip);
  } else {
    float ply = 0.5 + 0.5 * sin(l.z * 900.0);
    vec3 grey = l.z < -0.0075 ? srgb(0.58, 0.62, 0.66) : srgb(0.60, 0.59, 0.56) * (0.8 + 0.25 * ply);
    matPaper(m, n, p, 2, grey);
  }
  return true;
}
