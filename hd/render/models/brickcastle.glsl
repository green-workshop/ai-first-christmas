// Toy castle built from interlocking plastic bricks on a green baseplate: four corner towers with flared, crenellated
// tops, a curtain wall with an arched gate, a keep with a slope-brick roof and a flag, a drawbridge on two chains.
// Everything sits on one stud grid (pitch BC_P, course height BC_H). Material ids 100..109.
// HUE is the main brick colour.
#ifndef HUE
#define HUE srgb(0.66, 0.67, 0.68)
#endif
const float BC_P = 0.046, BC_H = 0.055, BC_Y0 = 0.018, BC_A = 0.31, BC_GY = 2.7;
vec3 bcLocal(vec3 p) { p.xz = rot(BC_A) * p.xz; return p; }
float bcY(float r) { return BC_Y0 + r * BC_H; }
float bcStud(vec3 q) { return sdRCyl(q, 0.0122, 0.0125, 0.0035); }
// a block of bricks between stud-grid corners s.xy and s.zw, from height y0 to y1, with a stud on every cell of its top.
// returns (bricks, studs)
vec2 bcBlock(vec3 p, vec4 s, float y0, float y1) {
  vec2 lo = s.xy * BC_P, hi = s.zw * BC_P;
  vec3 c = vec3((lo.x + hi.x) * 0.5, (y0 + y1) * 0.5, (lo.y + hi.y) * 0.5);
  vec3 b = vec3((hi.x - lo.x) * 0.5, (y1 - y0) * 0.5, (hi.y - lo.y) * 0.5);
  vec3 q = p - vec3(lo.x + 0.5 * BC_P, y1, lo.y + 0.5 * BC_P);
  q.x = repLim(q.x, BC_P, 0.0, s.z - s.x - 1.0); q.z = repLim(q.z, BC_P, 0.0, s.w - s.y - 1.0);
  return vec2(sdRBox(p - c, b, 0.0035), bcStud(q));
}
// a corner tower: a 4 x 4 shaft centred on stud c, `rows` courses high, flared out on inverted slopes to a 6 x 6
// fighting platform ringed with merlons; arrow slits in two faces
vec2 bcTower(vec3 p, vec2 c, float rows) {
  vec2 r = bcBlock(p, vec4(c - 2.0, c + 2.0), bcY(0.0), bcY(rows));
  vec3 q = p - vec3(c.x * BC_P, 0.0, c.y * BC_P);
  // arrow slits, round-headed
  float sy = q.y - bcY(floor(rows * 0.62) + 0.5);
  float slit = min(sdRBox(vec3(q.x, sy, q.z - 2.0 * BC_P), vec3(0.012, 0.062, 0.03), 0.011),
                   sdRBox(vec3(q.x - 2.0 * BC_P, sy, q.z), vec3(0.03, 0.062, 0.012), 0.011));
  r.x = smax(r.x, -slit, 0.004);
  float t = (q.y - bcY(rows)) / BC_H;
  float corbel = max(max(abs(q.x), abs(q.z)) - (2.0 + sat(t)) * BC_P, abs(t - 0.5) * BC_H - 0.5 * BC_H) * 0.75;
  r.x = min(r.x, corbel);
  r = min(r, bcBlock(p, vec4(c - 3.0, c + 3.0), bcY(rows + 1.0), bcY(rows + 2.0)));
  vec2 m = abs(q.xz); if (m.x < m.y) m = m.yx;
  float yb = q.y - bcY(rows + 2.5); vec3 hb = vec3(0.5 * BC_P, 0.5 * BC_H, 0.5 * BC_P);
  vec3 m1 = vec3(m.x - 2.5 * BC_P, yb, m.y - 0.5 * BC_P), m2 = vec3(m.x - 2.5 * BC_P, yb, m.y - 2.5 * BC_P);
  r.x = min(r.x, min(sdRBox(m1, hb, 0.0035), sdRBox(m2, hb, 0.0035)));
  r.y = min(r.y, min(bcStud(m1 - vec3(0, 0.5 * BC_H, 0)), bcStud(m2 - vec3(0, 0.5 * BC_H, 0))));
  return r;
}
void mGift(vec3 pw, inout float d) {
  float bb = length(pw - vec3(0, 0.5, 0)) - 0.93;
  if (bb > 0.15) { d = min(d, bb); return; }
  vec3 p = bcLocal(pw); vec3 q = vec3(abs(p.x), p.y, p.z);
  // baseplate
  vec2 pl = bcBlock(p, vec4(-11, -7, 11, 7), 0.0, BC_Y0);
  add(d, pl.x, 101.0); add(d, pl.y, 101.5);
  // front curtain wall with its arched gate, and merlons along the top
  vec2 w = bcBlock(p, vec4(-6, 1, 6, 3), bcY(0.0), bcY(6.0));
  vec2 g = vec2(p.x, p.y - bcY(BC_GY)); float gate = g.y < 0.0 ? abs(g.x) - 2.0 * BC_P : length(g) - 2.0 * BC_P;
  w.x = smax(w.x, -max(gate, abs(p.z - 2.0 * BC_P) - 1.5 * BC_P), 0.004);
  vec3 mq = vec3(repLim(q.x - 1.5 * BC_P, 2.0 * BC_P, 0.0, 1.0), p.y - bcY(6.5), p.z - 2.0 * BC_P);
  w.x = min(w.x, sdRBox(mq, vec3(0.5 * BC_P, 0.5 * BC_H, BC_P), 0.0035));
  w.y = min(w.y, bcStud(vec3(mq.x, mq.y - 0.5 * BC_H, abs(mq.z) - 0.5 * BC_P)));
  // side and back walls
  w = min(w, bcBlock(q, vec4(7, -2, 9, 0), bcY(0.0), bcY(6.0)));
  w = min(w, bcBlock(p, vec4(-6, -5, 6, -3), bcY(0.0), bcY(6.0)));
  // towers: two short ones in front, two tall ones behind
  w = min(w, min(bcTower(q, vec2(8, 2), 8.0), bcTower(q, vec2(8, -4), 12.0)));
  // keep, with two round-headed windows
  vec2 k = bcBlock(p, vec4(-3, -5, 3, -1), bcY(0.0), bcY(13.0));
  k.x = smax(k.x, -sdRBox(vec3(q.x - 1.5 * BC_P, p.y - bcY(9.6), p.z + BC_P), vec3(0.016, 0.07, 0.03), 0.015), 0.004);
  w = min(w, k);
  add(d, w.x, 100.0); add(d, w.y, 100.5);
  // roofs: slope bricks on the keep, moulded cones on the back towers
  vec3 kq = vec3(q.x, p.y - bcY(13.0), abs(p.z + 3.0 * BC_P));
  vec2 sn = normalize(vec2(2.0 * BC_H, BC_P));
  float roof = smax(dot(vec2(kq.x - 3.0 * BC_P, kq.y), sn), dot(vec2(kq.z - 2.0 * BC_P, kq.y), sn), 0.006);
  roof = max(smax(roof, kq.y - 3.5 * BC_H, 0.008), -kq.y);
  vec3 cq = q - vec3(8.0 * BC_P, bcY(14.0), -4.0 * BC_P);
  float cone = min(sdCapCone(cq - vec3(0, 0.125, 0), 0.115, 1.85 * BC_P, 0.4 * BC_P) - 0.004, sdRCyl(cq - vec3(0, 0.008, 0), 1.95 * BC_P, 0.009, 0.004));
  add(d, min(roof, cone), 102.0);
  add(d, bcStud(cq - vec3(0, 0.244, 0)), 102.5);
  // drawbridge lying on the baseplate studs, and its two chains
  vec2 br = bcBlock(p, vec4(-2, 3, 2, 7), BC_Y0 + 0.0125, BC_Y0 + 0.031);
  add(d, br.x, 103.0); add(d, br.y, 103.5);
  vec3 ca = vec3(1.6 * BC_P, bcY(5.3), 3.0 * BC_P + 0.008), cb = vec3(1.6 * BC_P, BC_Y0 + 0.04, 6.5 * BC_P);
  vec3 pa = q - ca, ba = cb - ca; float h = sat(dot(pa, ba) / dot(ba, ba));
  float chain = (length(pa - ba * h) - 0.004 - 0.0028 * abs(sin(h * 13.0 * PI))) * 0.8;
  chain = min(chain, min(sdRBox(q - ca + vec3(0, 0, 0.004), vec3(0.012, 0.012, 0.008), 0.004), sdRCyl(q - cb + vec3(0, 0.008, 0), 0.012, 0.006, 0.003)));
  add(d, chain, 104.0);
  // flagpole on the keep, and the flag
  vec3 fq = p - vec3(0.0, 0.0, -3.0 * BC_P);
  float pole = min(sdCapsule(fq, vec3(0, bcY(16.3), 0), vec3(0, 1.215, 0), 0.0055), sdRCyl(fq - vec3(0, bcY(16.5), 0), 0.0125, 0.012, 0.004));
  add(d, pole, 105.0);
  vec3 fl = fq - vec3(0.095, 1.145, 0.0);
  fl.z -= 0.014 * sin(fl.x * 38.0 + fl.y * 9.0 + 1.0) * smoothstep(-0.09, 0.02, fl.x);
  add(d, sdRBox(fl, vec3(0.09, 0.062, 0.003), 0.0025) * 0.7, 106.0);
}
// running-bond joints on a wall face: u runs along the wall (units), row is the height in courses, len the brick length.
// returns the distance to the nearest joint (units); bid = one random number per brick; g points away from that joint (along u, up)
float bcBond(float u, float row, float len, float rh, out float bid, out vec2 g) {
  float r = floor(row), fr = fract(row);
  float uu = u / len + 0.5 * mod(r, 2.0), k = floor(uu), fu = fract(uu);
  bool jl = hash1(vec2(k, r) + 0.37) > 0.3, jr = hash1(vec2(k + 1.0, r) + 0.37) > 0.3;
  bid = hash1(vec2(jl ? k : k - 1.0, r * 1.7 + 5.0));
  float dl = jl ? fu : 9.0, dr = jr ? 1.0 - fu : 9.0;
  float jx = min(dl, dr) * len, jy = min(fr, 1.0 - fr) * rh;
  if (jx < jy) { g = vec2(dl < dr ? 1.0 : -1.0, 0.0); return jx; }
  g = vec2(0.0, fr < 0.5 ? 1.0 : -1.0); return jy;
}
bool shGift(float id, vec3 pw, inout vec3 n, inout Mat m) {
  if (id < 100.0 || id >= 110.0) return false;
  vec3 p = bcLocal(pw); vec3 nl = n; nl.xz = rot(BC_A) * nl.xz;
  bool studId = fract(id) > 0.25; float base = floor(id + 0.01);
  vec3 col = HUE; float gloss = 0.85;
  if (base == 100.0 || base == 102.0) {
    bool isRoof = base == 102.0;
    vec3 body = isRoof ? srgb(0.74, 0.07, 0.05) : HUE;
    col = body;
    bool cone = isRoof && abs(p.x) > 4.0 * BC_P;
    if (cone) {
      // two stacked cone mouldings: one seam
      float j = abs(p.y - bcY(14.0) - 0.12);
      col *= mix(0.3, 1.0, smoothstep(0.0008, 0.0028, j));
    } else if (!studId && abs(nl.y) < 0.75) {
      bool xface = abs(nl.x) > abs(nl.z);
      float u = xface ? p.z : p.x, row = (p.y - BC_Y0) / BC_H;
      float bid; vec2 g; float j = bcBond(u, isRoof ? row * 0.5 : row, 2.0 * BC_P, isRoof ? 2.0 * BC_H : BC_H, bid, g);
      // the ring of arch bricks round the gate replaces the courses there
      vec2 a = vec2(p.x, p.y - bcY(BC_GY)); float ring = length(a) - 2.0 * BC_P;
      bool arch = !isRoof && p.z > 2.5 * BC_P && a.y > 0.0 && ring < 0.75 * BC_P && abs(p.x) < 3.0 * BC_P;
      if (arch) {
        float an = atan(a.x, a.y) / (PI / 7.0) + 0.5; bid = hash1(floor(an) + 3.0) * 0.5 + 0.5;
        float ja = abs(fract(an) - 0.5); ja = (0.5 - ja) * (PI / 7.0) * length(a);
        j = min(ja, abs(ring - 0.75 * BC_P)); g = vec2(0.0);
        col = body * 0.42;
      } else if (!isRoof) {
        if (nl.y < -0.3) col = body * 0.42;                                  // the inverted slopes under the platforms
        else if (bid < 0.13) col = body * 0.5;                               // a few bricks from the darker bag
        else col = body * (0.93 + 0.14 * hash1(bid * 71.3));
      } else col = body * (0.9 + 0.2 * hash1(bid * 71.3));
      col *= mix(0.22, 1.0, smoothstep(0.0007, 0.0026, j));
      float bev = 1.0 - smoothstep(0.0, 0.0055, j);
      vec3 gu = xface ? vec3(0, 0, g.x) : vec3(g.x, 0, 0);
      nl = normalize(nl - 0.55 * bev * (gu + vec3(0, g.y, 0)) + 0.035 * (hash3(vec3(bid * 91.0, bid * 37.0, floor(row))) - 0.5));
    }
  } else if (base == 101.0) { col = srgb(0.10, 0.46, 0.17); gloss = 0.7; }
  else if (base == 103.0) {
    col = srgb(0.40, 0.19, 0.09);
    if (!studId) { float j = abs(fract(p.x / (2.0 * BC_P)) - 0.5) * 2.0 * BC_P; col *= mix(0.3, 1.0, smoothstep(0.0008, 0.0028, 0.046 - j)); }
  }
  else if (base == 104.0) { n.xz = rot(-BC_A) * nl.xz; matMetal(m, n, pw, 1, vec3(0, 1, 0)); return true; }
  else if (base == 105.0) { col = srgb(0.10, 0.10, 0.11); }
  else {
    // flag: yellow with a red cross
    vec2 f = vec2(p.x - 0.095, p.y - 1.145);
    col = srgb(0.95, 0.74, 0.08);
    if (min(abs(f.x + 0.02), abs(f.y)) < 0.014) col = srgb(0.74, 0.07, 0.05);
    gloss = 0.6;
  }
  n = nl; n.xz = rot(-BC_A) * nl.xz;
  vec3 n0 = n; matPlastic(m, n, pw, col, gloss); n = normalize(mix(n0, n, 0.3));      // moulded faces are flat: keep the peel faint under the raking lamp
  m.coat = 0.75 * gloss; m.coatRough = 0.035 + 0.05 * smudge(pw * 2.0);
  return true;
}
