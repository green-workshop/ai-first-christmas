// Junior cricket bat standing on its toe at a lean, face turned three-quarters to the camera, with a red leather ball beside it.
// Pale willow blade with a bowed face and a spined back, cane handle spliced in, twine binding, ribbed rubber grip, two sticker chevrons.
// Bat about 1.36 long. Material ids 100..105.
#define CBAT_S 1.06
#define CBAT_GRIP srgb(0.05, 0.42, 0.40)
const vec3 cbatBallC = vec3(0.37, 0.083, 0.24);
// bat space: x across the blade, y from the toe up to the top of the handle (1.28), z through the blade, face towards +z
vec3 cbatLocal(vec3 p) {
  vec3 q = (p - vec3(-0.335, 0.026, -0.02)) / CBAT_S;
  q.xy = rot(-0.45) * q.xy; q.yz = rot(-0.13) * q.yz; q.xz = rot(-0.55) * q.xz;
  return q;
}
float cbatBow(float y) { float t = 1.0 - clamp(y, 0.0, 0.84) / 0.84; return 0.034 * t * t; }
float cbatBlade(vec3 q) {
  q.z -= cbatBow(q.y);
  float hw = 0.095;
  float o = sdBox2(vec2(q.x, q.y - 0.43), vec2(hw, 0.43) - 0.036) - 0.036;                    // outline: rounded toe
  o = smax(o, (abs(q.x) * 0.78 + q.y - 0.868) * 0.78, 0.03);                                   // sloping shoulders
  float swell = mix(0.022, 0.050, smoothstep(0.0, 0.24, q.y)) - 0.034 * smoothstep(0.32, 0.82, q.y);
  float front = q.z - (0.016 - 1.1 * q.x * q.x);                                               // a gently rounded face
  float back = (-q.z - 0.030 - swell * (1.0 - abs(q.x) / hw)) * 0.86;                          // the spine: a ridge down the middle of the back
  return smax(smax(front, back, 0.010), o, 0.012);
}
vec3 cbatBallLocal(vec3 p) { vec3 q = p - cbatBallC; q.xy = rot(0.5) * q.xy; q.yz = rot(-0.95) * q.yz; return q; }
void cbatAll(vec3 p, inout float d) {
  vec3 q = cbatLocal(p);
  float bnd = sdBox(q - vec3(0.0, 0.64, 0.0), vec3(0.11, 0.66, 0.09));
  if (bnd > 0.06) { d = min(d, bnd); return; }
  float blade = cbatBlade(q);
  // the handle: round cane, let into the blade
  vec3 hq = q - vec3(0.0, 0.0, -0.014);
  float handle = sdCapsule(vec3(hq.x, hq.y, hq.z * 1.08), vec3(0.0, 0.76, 0.0), vec3(0.0, 1.262, 0.0), 0.0285);
  add(d, smin(blade, handle, 0.022) * 0.8, 100.0);
  // twine binding between the shoulders and the grip
  float tw = sdRCyl(hq - vec3(0.0, 0.868, 0.0), 0.0312 + 0.0009 * sin(hq.y * 1100.0), 0.030, 0.003);
  add(d, tw * 0.8, 102.0);
  // rubber grip: ringed, with a rolled lower edge and a domed cap
  float gr = 0.0345 + 0.0017 * sin(hq.y * 680.0) * smoothstep(0.0, 0.012, hq.y - 0.905) * (1.0 - smoothstep(1.24, 1.255, hq.y));
  float grip = sdCapsule(hq, vec3(0.0, 0.905, 0.0), vec3(0.0, 1.262, 0.0), gr);
  grip = smin(grip, sdTorus(hq - vec3(0.0, 0.900, 0.0), 0.033, 0.0058), 0.004);
  add(d, grip * 0.75, 101.0);
}
void mGift(vec3 p, inout float d) {
  float bb = length(p - vec3(0.0, 0.62, 0.05)) - 0.78;
  if (bb > 0.15) { d = min(d, bb); return; }
  float ds = d / CBAT_S; cbatAll(p, ds); d = ds * CBAT_S;
  // ---- ball: two leather halves, a raised seam with six rows of stitching ----
  vec3 b = cbatBallLocal(p); float r = length(b);
  if (r > 0.13) { d = min(d, r - 0.09); return; }
  float lat = abs(b.y);
  float seam = 0.0042 * (1.0 - smoothstep(0.006, 0.019, lat));
  float a = atan(b.z, b.x);
  float rows = (1.0 - smoothstep(0.0, 0.0022, abs(lat - 0.0035))) + (1.0 - smoothstep(0.0, 0.0022, abs(lat - 0.0085))) + (1.0 - smoothstep(0.0, 0.0022, abs(lat - 0.0135)));
  seam += 0.0013 * rows * (0.5 + 0.5 * sin(a * 70.0 + lat * 600.0));
  seam -= 0.0012 * (1.0 - smoothstep(0.0, 0.002, lat));                                        // the join itself
  seam -= 0.0010 * (1.0 - smoothstep(0.0, 0.0025, abs(b.x))) * step(0.02, lat) * step(0.0, b.y) + 0.0010 * (1.0 - smoothstep(0.0, 0.0025, abs(b.z))) * step(0.02, lat) * step(b.y, 0.0);   // quarter seams
  add(d, (r - 0.083 - seam) * 0.8, 103.0);
}
bool shGift(float id, vec3 p, inout vec3 n, inout Mat m) {
  if (id < 100.0 || id >= 106.0) return false;
  if (id < 102.5) {
    vec3 q = cbatLocal(p); vec3 hq = q - vec3(0.0, 0.0, -0.014);
    // the bat's long axis and face direction in world space, for the grain
    vec3 ay = vec3(0.0, 1.0, 0.0); ay.yz = rot(0.13) * ay.yz; ay.xy = rot(0.45) * ay.xy;
    if (id < 100.5) {
      float zf = q.z - cbatBow(q.y) - (0.016 - 1.1 * q.x * q.x);                               // 0 on the face
      float onFace = smoothstep(-0.008, -0.003, zf);
      float inHandle = smoothstep(0.80, 0.84, q.y);
      // willow: very pale, with straight narrow grain running the length of the blade
      matWood(m, n, p, ay, 0.0, 0.10);
      float gx = q.x * 58.0 + 1.3 * noise(q.y * 1.7 + 3.0) + 0.5 * noise(vec2(q.x * 21.0, q.y * 2.5)) + 2.0 * q.z;
      float line = smoothstep(0.22, 0.5, abs(fract(gx) - 0.5)) * (0.55 + 0.45 * noise(floor(gx) * 7.3 + q.y * 3.0));
      vec3 willow = srgb(0.92, 0.84, 0.67) * (0.93 + 0.10 * fbm3(q * vec3(9.0, 1.5, 9.0)));
      m.col = mix(m.col, willow, 0.72) * (1.0 - 0.34 * line);
      m.col *= 0.94 + 0.08 * noise(vec2(q.x * 400.0, q.y * 12.0));
      // cane handle, and the V of the splice where it is let into the blade
      float vy = (q.y - 0.635) / 0.215, vw = 0.036 * vy;
      float splice = step(0.0, vy) * step(abs(q.x), vw) * onFace;
      float cane = max(inHandle, splice);
      vec3 caneCol = srgb(0.74, 0.55, 0.30) * (0.85 + 0.25 * noise(vec2(q.x * 260.0, q.y * 9.0)));
      caneCol *= 1.0 - 0.6 * step(abs(abs(q.x) - 0.011), 0.0022) * step(0.74, q.y);            // rubber springs glued between the cane
      m.col = mix(m.col, caneCol, cane);
      float vline = step(0.0, vy) * (1.0 - smoothstep(0.0, 0.003, abs(abs(q.x) - vw))) * onFace * (1.0 - inHandle);
      m.col *= 1.0 - 0.55 * vline;
      // maker's stickers: two vinyl chevrons across the face, and a band of the same on the edge
      float chev = q.y + 0.42 * abs(q.x);
      float s1 = step(abs(chev - 0.575), 0.026), s2 = step(abs(chev - 0.505), 0.026);
      float border = step(abs(chev - 0.540), 0.068);
      float stick = border * step(abs(q.x), 0.088) * onFace;
      if (stick > 0.5) {
        vec3 sc = mix(srgb(0.95, 0.93, 0.86), srgb(0.80, 0.10, 0.10), s1); sc = mix(sc, CBAT_GRIP, s2);
        sc = mix(sc, srgb(0.85, 0.66, 0.20), step(abs(abs(chev - 0.540) - 0.062), 0.004));
        Mat sm = newMat(); vec3 n2 = n; matPlastic(sm, n2, p, sc, 0.8); m = sm;
        m.col *= 1.0 - 0.10 * line;                                                            // the grain telegraphs through
      }
      // ball marks on the middle of the face, a grubby toe
      float mark = smoothstep(0.60, 0.74, fbm3(vec3(q.x * 26.0, q.y * 19.0, 3.0))) * (1.0 - smoothstep(0.05, 0.085, abs(q.x))) * smoothstep(0.10, 0.18, q.y) * (1.0 - smoothstep(0.36, 0.44, q.y)) * onFace;
      m.col = mix(m.col, srgb(0.62, 0.16, 0.12), 0.33 * mark);
      m.col *= 1.0 - 0.3 * (1.0 - smoothstep(0.0, 0.05, q.y)) * (0.5 + 0.5 * noise(q * 60.0));
      return true;
    }
    if (id < 101.5) {                                            // grip
      matRubber(m, n, p, CBAT_GRIP); m.rough = 0.5;
      m.col *= 0.82 + 0.25 * smoothstep(-0.3, 0.6, sin(hq.y * 680.0));
      return true;
    }
    // twine: waxed thread wound tight, with one band of red
    float turn = fract(hq.y * 175.0);
    matCloth(m, n, p, vec2(hq.y, atan(hq.z, hq.x) * 0.03), mix(srgb(0.88, 0.84, 0.72), srgb(0.75, 0.10, 0.10), step(abs(hq.y - 0.868), 0.007)), 0.2);
    m.col *= 0.75 + 0.3 * smoothstep(0.0, 0.5, turn) * (1.0 - smoothstep(0.5, 1.0, turn)) * 2.0;
    return true;
  }
  // ball: glossy red leather, white linen stitching
  vec3 b = cbatBallLocal(p); float lat = abs(b.y), a = atan(b.z, b.x);
  vec3 red = srgb(0.56, 0.035, 0.04);
  Mat lm = newMat(); vec3 n2 = n; matLeather(lm, n2, p, red, 0.9);
  m = lm; m.col = mix(m.col, red * (0.9 + 0.2 * fbm3(p * 9.0)), 0.7); n = normalize(mix(n, n2, 0.08));
  m.coat = 0.55; m.coatRough = 0.08 + 0.1 * smudge(p * 6.0);
  float rows = (1.0 - smoothstep(0.0013, 0.0026, abs(lat - 0.0035))) + (1.0 - smoothstep(0.0013, 0.0026, abs(lat - 0.0085))) + (1.0 - smoothstep(0.0013, 0.0026, abs(lat - 0.0135)));
  float st = sat(rows) * step(0.0, sin(a * 70.0 + lat * 600.0));
  m.col = mix(m.col, srgb(0.90, 0.86, 0.74), 0.9 * st); m.rough = mix(m.rough, 0.8, st); m.coat *= 1.0 - st;
  float scuff = smoothstep(0.55, 0.75, fbm3(b * 40.0)) * step(0.02, lat);
  m.col = mix(m.col, srgb(0.40, 0.10, 0.08), 0.4 * scuff); m.rough += 0.25 * scuff; m.coat *= 1.0 - 0.6 * scuff;
  return true;
}
