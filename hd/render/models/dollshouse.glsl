// Wooden dolls' house, open at the front: four papered rooms on two floors (a double bed, a single bed, bunk beds, the
// stairs), plywood walls with their raw edges showing, a painted pitched roof with a chimney, standing on a wooden plinth.
// Turned a little so the left gable shows. Material ids 120..129.
// HUE is the roof paint.
#ifndef HUE
#define HUE srgb(0.70, 0.085, 0.06)
#endif
const float DH_A = -0.24, DH_W = 0.52, DH_D = 0.235, DH_T = 0.022, DH_XD = -0.06, DH_RY = 1.135;
vec3 dhLocal(vec3 p) { p.xz = rot(DH_A) * p.xz; return p; }
// height above the top face of the roof boards (negative underneath)
float dhRoofP(vec3 p) { return dot(vec2(abs(p.z), p.y - DH_RY), normalize(vec2(0.335, 0.275))); }
// a bed lying along x with its head at -x, standing on y = 0. L, B = half length and width. returns (frame, linen, quilt)
vec3 dhBed(vec3 q, float L, float B) {
  float az = abs(q.z) - B;
  float fr = sdRBox(vec3(q.x + L, q.y - 0.085, az), vec3(0.011, 0.085, 0.011), 0.004);                   // head posts
  fr = min(fr, sdRBox(vec3(q.x - L, q.y - 0.055, az), vec3(0.011, 0.055, 0.011), 0.004));               // foot posts
  fr = min(fr, sdRBox(vec3(q.x + L, q.y - 0.115, q.z), vec3(0.006, 0.04, B), 0.004));                   // headboard
  fr = min(fr, sdRBox(vec3(q.x - L, q.y - 0.072, q.z), vec3(0.006, 0.024, B), 0.004));                  // footboard
  fr = min(fr, sdRBox(vec3(q.x, q.y - 0.052, az), vec3(L, 0.013, 0.006), 0.004));                       // side rails
  fr = min(fr, sdBox(q - vec3(0, 0.05, 0), vec3(L, 0.005, B)));                                         // slats
  float li = sdRBox(q - vec3(0, 0.074, 0), vec3(L - 0.01, 0.02, B - 0.006), 0.012);                     // mattress
  vec3 pq = q - vec3(-L + 0.052, 0.106, 0.0);
  li = min(li, sdEllipsoid(pq, vec3(0.04, 0.019 - 0.2 * pq.x * pq.x / 0.04, B * 0.8)));                 // pillow, dented by nothing much
  vec3 qq = q - vec3(0.05, 0.076, 0.0);
  float puff = 0.0025 * cos(qq.x * TAU / 0.03) * cos((qq.z + qq.y) * TAU / 0.03);
  float qu = sdRBox(qq, vec3(L - 0.062, 0.027, B + 0.007), 0.015) - puff;                               // quilt, hanging over both sides
  return vec3(fr, li, qu * 0.85);
}
void mGift(vec3 pw, inout float d) {
  float bb = length(pw - vec3(0, 0.6, 0)) - 0.9;
  if (bb > 0.15) { d = min(d, bb); return; }
  vec3 p = dhLocal(pw);
  float rp = dhRoofP(p), sx = abs(p.x) - (DH_W - 0.5 * DH_T), bz = p.z + DH_D - 0.5 * DH_T;
  // side walls running up into the gables, a window in each storey
  float side = max(sdRBox(vec3(sx, p.y - 0.6, p.z), vec3(0.5 * DH_T, 0.57, DH_D), 0.004), rp + 0.02);
  vec2 wq = vec2(p.z, repLim(p.y - 0.225, 0.39, 0.0, 1.0));
  float win = sdBox2(wq, vec2(0.05, 0.065)) - 0.004;
  side = smax(side, -win, 0.004);
  // back wall with one window over the double bed
  float back = sdRBox(vec3(p.x, p.y - 0.415, bz), vec3(DH_W, 0.385, 0.5 * DH_T), 0.004);
  vec2 bq2 = p.xy - vec2(0.2, 0.655);
  float bwin = sdBox2(bq2, vec2(0.06, 0.055)) - 0.004;
  back = smax(back, -bwin, 0.004);
  float shell = min(side, back);
  shell = min(shell, sdRBox(vec3(p.x, repLim(p.y - 0.411, 0.39, 0.0, 1.0), p.z), vec3(DH_W - 0.002, 0.011, DH_D), 0.004));   // floor and ceiling
  shell = min(shell, sdRBox(p - vec3(DH_XD, 0.415, 0.0), vec3(0.5 * DH_T, 0.385, DH_D), 0.004));                          // party wall
  shell = min(shell, sdRBox(p - vec3(0, 0.015, 0), vec3(DH_W + 0.022, 0.015, DH_D + 0.022), 0.006));                      // plinth
  add(d, shell, 120.0);
  // window joinery: a moulded surround and a cross of glazing bars
  float fr = max(max(min(abs(wq.x), abs(wq.y)) - 0.0045, win), abs(sx) - 0.006);
  fr = min(fr, max(abs(win - 0.004) - 0.008, abs(sx) - 0.016));
  fr = min(fr, max(max(min(abs(bq2.x), abs(bq2.y)) - 0.0045, bwin), abs(bz) - 0.006));
  fr = min(fr, max(abs(bwin - 0.004) - 0.008, abs(bz) - 0.016));
  add(d, fr - 0.002, 126.0);
  // roof: two painted boards and a ridge roll
  float roof = max(max(abs(rp + 0.011) - 0.008, abs(p.x) - 0.55), 0.798 - p.y) - 0.003;
  roof = min(roof, sdCapsule(p, vec3(-0.552, DH_RY - 0.008, 0), vec3(0.552, DH_RY - 0.008, 0), 0.013));
  add(d, roof, 121.0);
  // chimney: stack, cap and pot
  vec3 cq = p - vec3(0.30, 1.10, -0.075);
  float chim = min(sdRBox(cq, vec3(0.038, 0.105, 0.034), 0.004), sdRBox(cq - vec3(0, 0.108, 0), vec3(0.046, 0.009, 0.042), 0.004));
  add(d, chim, 122.0);
  add(d, sdRCyl(cq - vec3(0, 0.13, 0), 0.02, 0.018, 0.004), 122.5);
  // beds
  vec3 beds = dhBed(p - vec3(0.21, 0.422, -0.09), 0.15, 0.085);
  beds = min(beds, dhBed(p - vec3(-0.29, 0.422, -0.105), 0.135, 0.06));
  vec3 bk = p - vec3(0.27, 0.03, -0.115); bk.x = -bk.x;
  beds = min(beds, min(dhBed(bk, 0.135, 0.06), dhBed(bk - vec3(0, 0.155, 0), 0.135, 0.06)));
  float wood = min(beds.x, sdRBox(vec3(abs(bk.x) - 0.135, bk.y - 0.13, abs(bk.z) - 0.06), vec3(0.011, 0.13, 0.011), 0.004));
  // bunk ladder at the foot
  vec3 lq = bk - vec3(-0.06, 0.1, 0.075);
  wood = min(wood, sdRBox(vec3(abs(lq.x) - 0.022, lq.y, lq.z), vec3(0.005, 0.1, 0.005), 0.003));
  wood = min(wood, sdRBox(vec3(lq.x, repLim(lq.y, 0.04, -2.0, 2.0), lq.z), vec3(0.022, 0.004, 0.004), 0.003));
  // stairs: a solid flight up the back of the hall, with a newel and a handrail
  vec3 sq = vec3(-(p.x + 0.14), p.y - 0.03, p.z + 0.157);
  float si = clamp(floor(sq.x / 0.044), 0.0, 7.0), st = 1e9;
  for (int k = 0; k < 2; k++) {
    float j = min(si + float(k), 7.0), hh = (j + 1.0) * 0.02313;
    st = min(st, sdRBox(vec3(sq.x - (j + 0.5) * 0.044, sq.y - hh, sq.z), vec3(0.024, hh, 0.056), 0.004));
  }
  wood = min(wood, st);
  wood = min(wood, sdRBox(p - vec3(-0.128, 0.115, -0.094), vec3(0.009, 0.085, 0.009), 0.004));
  wood = min(wood, sdCapsule(p, vec3(-0.128, 0.19, -0.094), vec3(-0.40, 0.19 + 0.272 * 1.051, -0.094), 0.007));
  add(d, wood, 123.0);
  add(d, beds.y, 124.0);
  add(d, beds.z, 125.0);
  // wardrobe upstairs, toy chest downstairs
  float ward = sdRBox(p - vec3(0.44, 0.545, -0.17), vec3(0.05, 0.123, 0.04), 0.005);
  ward = min(ward, sdRBox(p - vec3(0.44, 0.672, -0.168), vec3(0.055, 0.006, 0.045), 0.004));
  ward = min(ward, sdRBox(p - vec3(0.03, 0.062, -0.15), vec3(0.048, 0.032, 0.036), 0.006));
  add(d, ward, 127.0);
  // a framed picture over the single bed, another downstairs
  vec3 fq = vec3(p.x, p.y, p.z + DH_D - DH_T - 0.004);
  float pic = min(sdRBox(fq - vec3(-0.27, 0.665, 0), vec3(0.05, 0.036, 0.004), 0.003), sdRBox(fq - vec3(0.03, 0.26, 0), vec3(0.033, 0.042, 0.004), 0.003));
  add(d, pic, 128.0);
}
// a patterned wallpaper for each room. uv on the wall, in units
vec3 dhPaper(int room, vec2 uv, vec3 p) {
  vec3 c;
  if (room == 0) {                                  // hall: sage with cream pinstripes
    c = srgb(0.60, 0.71, 0.54);
    float f = fract(uv.x / 0.032);
    c = mix(c, srgb(0.90, 0.88, 0.74), step(f, 0.14) + step(abs(f - 0.5), 0.035));
  } else if (room == 1) {                           // bunk room: sunny yellow, white spots
    c = srgb(0.95, 0.77, 0.36);
    vec2 g = uv / 0.036; g.x += 0.5 * mod(floor(g.y), 2.0);
    c = mix(c, srgb(0.98, 0.95, 0.86), 1.0 - smoothstep(0.2, 0.26, length(fract(g) - 0.5)));
  } else if (room == 2) {                           // single room: sky blue, broad white stripes with a pin line
    c = srgb(0.56, 0.72, 0.87);
    float f = fract(uv.x / 0.05);
    c = mix(c, srgb(0.93, 0.95, 0.96), step(f, 0.42));
    c = mix(c, srgb(0.30, 0.47, 0.72), step(abs(f - 0.71), 0.03));
  } else {                                          // best bedroom: pink with rosebuds on a trellis
    c = srgb(0.95, 0.77, 0.76);
    vec2 g = uv / 0.042; g.x += 0.5 * mod(floor(g.y), 2.0); vec2 f = fract(g) - 0.5;
    c = mix(c, srgb(0.98, 0.90, 0.88), step(abs(abs(f.x) - abs(f.y)), 0.035));
    c = mix(c, srgb(0.30, 0.52, 0.26), 1.0 - smoothstep(0.10, 0.14, length(f - vec2(0.1, -0.09))));
    c = mix(c, srgb(0.80, 0.16, 0.30), 1.0 - smoothstep(0.13, 0.17, length(f)));
  }
  return c * (0.96 + 0.06 * noise(p * 60.0)) * (1.0 - 0.18 * step(abs(fract(uv.x / 0.17) - 0.5), 0.006));   // a seam between drops
}
// paint over plywood, with the library's orange peel calmed down: these faces are lit at a grazing angle
void dhPaint(inout Mat m, inout vec3 n, vec3 p, vec3 col, float gloss, float wear) {
  vec3 n0 = n; matPaint(m, n, p, col, gloss, wear, srgb(0.74, 0.56, 0.34), 0.0); n = normalize(mix(n0, n, 0.12));
}
// brush marks dragged along  `dir` through thick paint
void dhBrush(inout Mat m, inout vec3 n, vec3 p, vec3 dir) {
  vec3 a = normalize(dir), b = p - a * dot(p, a);
  float s = noise(b * 240.0 + a * dot(p, a) * 6.0), s2 = noise(b * 90.0 + a * dot(p, a) * 3.0 + 7.0);
  m.col *= 0.93 + 0.1 * s2 + 0.05 * s; m.rough += 0.1 * (s - 0.5);
  n = normalize(n + 0.09 * (s - 0.5) * normalize(cross(a, n) + 1e-4));
}
bool shGift(float id, vec3 pw, inout vec3 n, inout Mat m) {
  if (id < 120.0 || id >= 130.0) return false;
  vec3 p = dhLocal(pw); vec3 nl = n; nl.xz = rot(DH_A) * n.xz;
  vec3 wood = srgb(0.74, 0.56, 0.34);
  if (id < 120.5) {
    bool inside = abs(p.x) < DH_W - DH_T + 0.003 && p.z > -DH_D + DH_T - 0.003 && p.y > 0.028 && p.y < 0.792;
    bool slab = abs(repLim(p.y - 0.411, 0.39, 0.0, 1.0)) < 0.013;
    if (p.y < 0.0285 || (p.y < 0.032 && nl.y > 0.7 && !inside)) {
      matWood(m, nl, p, vec3(1, 0, 0.05), 0.12, 0.7);                              // plinth: clear-varnished beech
    } else if (nl.z > 0.6 && p.z > DH_D - 0.008) {
      // raw plywood edges: the plies show as stripes across the thickness of each board
      float t = slab ? p.y : p.x, ply = fract(t / 0.0046 + 0.25);
      matWood(m, nl, p * vec3(1.0, 1.0, 6.0), slab ? vec3(1, 0, 0) : vec3(0, 1, 0), 0.1, 0.25);
      m.col *= mix(0.62, 1.05, smoothstep(0.35, 0.5, abs(ply - 0.5) * 2.0 * (0.8 + 0.4 * noise(p * 150.0))));
    } else if (inside) {
      int room = (p.x > DH_XD ? 1 : 0) + (p.y > 0.411 ? 2 : 0);
      float fy = p.y - (p.y > 0.411 ? 0.422 : 0.03);
      if (nl.y > 0.7) {
        // floorboards, and a rug in each bedroom
        matWood(m, nl, p + vec3(0, 0, floor(p.z / 0.038) * 0.7), vec3(1, 0, 0), room == 0 ? 0.45 : 0.25, 0.55);
        float jb = 0.019 - abs(fract(p.z / 0.038) - 0.5) * 0.038; m.col *= mix(0.5, 1.0, smoothstep(0.0, 0.0025, jb));
        vec2 rc = room == 3 ? vec2(0.21, 0.09) : room == 2 ? vec2(-0.29, 0.07) : vec2(0.13, 0.08);
        vec2 rq = (p.xz - rc) / (room == 3 ? vec2(0.17, 0.085) : vec2(0.12, 0.075));
        float rr = length(rq);
        if (room > 0 && rr < 1.0) {
          vec3 a = room == 3 ? srgb(0.62, 0.12, 0.14) : room == 2 ? srgb(0.16, 0.30, 0.55) : srgb(0.18, 0.45, 0.30);
          vec3 c = mix(a, srgb(0.93, 0.87, 0.72), step(0.5, fract(rr * 3.5 + 0.25)));
          matCloth(m, nl, p, p.xz, c * (0.8 + 0.3 * noise(p * 300.0)), 0.8); m.coat = 0.0;
        }
      } else if (nl.y < -0.7) {
        dhPaint(m, nl, p, srgb(0.93, 0.92, 0.88), 0.2, 0.0); dhBrush(m, nl, p, vec3(1, 0, 0));
        m.emit = srgb(1.0, 0.84, 0.62) * 2.0;        // film-set trick: the ceilings, which the camera never sees, light the rooms
      } else {
        vec2 uv = abs(nl.z) > abs(nl.x) ? vec2(p.x, fy) : vec2(p.z + 0.011, fy);
        if (fy < 0.026) { dhPaint(m, nl, p, srgb(0.95, 0.94, 0.90), 0.6, 0.05); m.col *= mix(0.6, 1.0, smoothstep(0.0, 0.003, 0.026 - fy)); }
        else matPaper(m, nl, p, 0, dhPaper(room, uv, p));
      }
    } else {
      // outside: cream paint brushed on over the grain, rubbed through at the corners
      dhPaint(m, nl, p, srgb(0.94, 0.89, 0.74), 0.4, 0.07);
      dhBrush(m, nl, p, vec3(0.05, 1, 0));
      // grain telegraphing through the paint
      float gr = noise(vec3(p.x * 14.0, p.y * 320.0, p.z * 14.0)); m.col *= 0.96 + 0.07 * gr;
      // a round attic light painted on each gable
      float att = length(vec2(p.z, p.y - 0.925));
      if (abs(nl.x) > 0.7 && att < 0.05) { m.col = att < 0.038 && min(abs(p.z), abs(p.y - 0.925)) > 0.004 ? srgb(0.16, 0.22, 0.30) : srgb(0.96, 0.95, 0.92); if (att < 0.038) { m.rough = 0.15; m.coat = 0.8; } }

    }
  } else if (id < 121.5) {
    // roof: fish-scale shingles routed into the board and painted
    float s = dot(vec2(abs(p.z), p.y - DH_RY), normalize(vec2(0.275, -0.335)));
    float rh = 0.062, w = 0.066, r = floor(s / rh), fy = fract(s / rh);
    float xx = p.x / w + 0.5 * mod(r, 2.0), fx = fract(xx), k = floor(xx);
    vec2 e = vec2((fx - 0.5) * w, max(fy * rh - (rh - 0.5 * w), 0.0));
    float line = abs(length(e) - 0.5 * w);
    bool top = dhRoofP(p) > -0.006;
    float sid = hash1(vec2(k, r));
    vec3 c = HUE * (0.44 + 0.13 * sid);
    dhPaint(m, nl, p, c, 0.1, top ? 0.1 : 0.05);
    m.coat *= 0.4; m.rough = max(m.rough, 0.55);           // matt milk paint: a satin roof washes out pink under the lamp

    dhBrush(m, nl, p, vec3(0.1, 0.77, sign(p.z) * -0.63));
    if (top && abs(p.x) < 0.546) {
      float g = 1.0 - smoothstep(0.0015, 0.0045, line);
      m.col *= 1.0 - 0.6 * g; m.coat *= 1.0 - g;
      m.col *= 1.0 - 0.3 * smoothstep(0.6, 1.0, fy) * step(length(e), 0.5 * w);                 // each scale shades the one below
      float outward = length(e) < 0.5 * w ? 1.0 : -1.0;
      vec3 dir = normalize(vec3(e.x, 0.0, 0.0) + vec3(0.0, -0.77, sign(p.z) * 0.63) * e.y + 1e-5);
      nl = normalize(nl + 0.5 * outward * dir * (1.0 - smoothstep(0.0, 0.008, line)));
    }
  } else if (id < 122.25) {
    // chimney: cream stack with a painted band, a darker cap
    vec3 c = p.y > 1.2 ? HUE * 0.55 : srgb(0.94, 0.89, 0.74);
    if (abs(p.y - 1.165) < 0.014) c = HUE;
    dhPaint(m, nl, p, c, 0.4, 0.25); dhBrush(m, nl, p, vec3(0, 1, 0));
  } else if (id < 122.75) {
    dhPaint(m, nl, p, srgb(0.62, 0.30, 0.17), 0.3, 0.2);
    if (nl.y > 0.8 && length(p.xz - vec2(0.30, -0.075)) < 0.012) m.col = vec3(0.01);
  } else if (id < 123.5) {
    matWood(m, nl, p * 2.2, vec3(1, 0.02, 0), 0.32, 0.65);
  } else if (id < 124.5) {
    // mattress ticking and pillows
    matCloth(m, nl, p, p.xz + p.y, srgb(0.93, 0.92, 0.88), 0.4);
    if (nl.y < 0.5) m.col *= mix(vec3(1.0), srgb(0.45, 0.55, 0.75), step(abs(fract(p.x / 0.012) - 0.5), 0.12));
  } else if (id < 125.5) {
    // patchwork quilts, one palette for each bed
    int bed = p.y > 0.42 ? (p.x > DH_XD ? 0 : 1) : (p.y > 0.24 ? 3 : 2);
    vec2 g = vec2(p.x, p.z + p.y) / 0.03 + 0.5;
    float h = hash1(floor(g) + float(bed) * 13.0);
    vec3 a, b, c2, d2;
    if (bed == 0) { a = srgb(0.74, 0.10, 0.12); b = srgb(0.95, 0.90, 0.80); c2 = srgb(0.90, 0.50, 0.55); d2 = srgb(0.20, 0.42, 0.26); }
    else if (bed == 1) { a = srgb(0.14, 0.30, 0.62); b = srgb(0.93, 0.92, 0.86); c2 = srgb(0.50, 0.70, 0.86); d2 = srgb(0.93, 0.72, 0.20); }
    else if (bed == 2) { a = srgb(0.16, 0.48, 0.28); b = srgb(0.95, 0.90, 0.72); c2 = srgb(0.93, 0.70, 0.18); d2 = srgb(0.55, 0.75, 0.45); }
    else { a = srgb(0.90, 0.42, 0.10); b = srgb(0.95, 0.91, 0.80); c2 = srgb(0.20, 0.45, 0.66); d2 = srgb(0.80, 0.18, 0.16); }
    vec3 c = h < 0.3 ? a : h < 0.55 ? b : h < 0.8 ? c2 : d2;
    // a small print on some patches, stitching along every seam
    vec2 f = fract(g) - 0.5;
    if (fract(h * 7.3) > 0.5) c *= 0.82 + 0.3 * step(0.5, fract((f.x + f.y) * 4.0));
    matCloth(m, nl, p, g * 0.03, c, 0.5);
    float seam = 0.5 - max(abs(f.x), abs(f.y));
    m.col *= mix(0.55, 1.0, smoothstep(0.0, 0.08, seam));

    nl = normalize(nl + 0.25 * vec3(f.x, 0.0, f.y) * smoothstep(0.25, 0.5, max(abs(f.x), abs(f.y))));
  } else if (id < 126.5) {
    dhPaint(m, nl, p, srgb(0.96, 0.95, 0.92), 0.7, 0.08);
  } else if (id < 127.5) {
    // wardrobe (mint) and toy chest (red): door and lid lines, wooden knobs
    bool chest = p.y < 0.4;
    vec3 c = chest ? srgb(0.76, 0.15, 0.12) : srgb(0.55, 0.78, 0.70);
    dhPaint(m, nl, p, c, 0.5, 0.2); dhBrush(m, nl, p, vec3(0, 1, 0));
    if (nl.z > 0.6) {
      if (chest) { m.col *= mix(0.45, 1.0, smoothstep(0.0, 0.003, abs(p.y - 0.078))); if (length(p.xy - vec2(0.03, 0.068)) < 0.006) { m.col = srgb(0.85, 0.65, 0.25); m.metal = 1.0; m.rough = 0.3; } }
      else {
        m.col *= mix(0.45, 1.0, smoothstep(0.0, 0.003, abs(p.x - 0.44)));
        m.col *= mix(0.7, 1.0, smoothstep(0.0, 0.003, abs(sdBox2(vec2(abs(p.x - 0.44) - 0.025, p.y - 0.545), vec2(0.014, 0.09)))));
        if (length(vec2(abs(p.x - 0.44) - 0.008, p.y - 0.54)) < 0.005) m.col = wood;
      }
    }
  } else {
    // pictures: a gilt frame round a little landscape, and a portrait
    bool land = p.y > 0.42;
    vec2 q = land ? (p.xy - vec2(-0.27, 0.665)) / vec2(0.05, 0.036) : (p.xy - vec2(0.03, 0.26)) / vec2(0.033, 0.042);
    if (max(abs(q.x), abs(q.y)) > 0.76 || nl.z < 0.5) { matMetal(m, nl, p, 1, vec3(1, 0, 0)); m.rough += 0.15; }
    else {
      vec3 c;
      if (land) { c = mix(srgb(0.55, 0.75, 0.90), srgb(0.95, 0.85, 0.65), smoothstep(-0.2, 0.5, -q.y)); if (q.y < -0.1 + 0.25 * sin(q.x * 4.0 + 1.0)) c = srgb(0.25, 0.50, 0.22); if (length(q - vec2(0.3, 0.35)) < 0.16) c = srgb(1.0, 0.9, 0.5); }
      else { c = srgb(0.30, 0.22, 0.30); if (length(q - vec2(0.0, 0.15)) < 0.3) c = srgb(0.90, 0.70, 0.58); if (q.y < -0.2 && abs(q.x) < 0.45 + 0.3 * q.y) c = srgb(0.20, 0.35, 0.60); }
      matPaper(m, nl, p, 3, c);
    }
  }
  n = nl; n.xz = rot(-DH_A) * nl.xz;
  return true;
}
