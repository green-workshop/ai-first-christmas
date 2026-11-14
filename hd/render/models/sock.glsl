// One single chunky hand-knitted wool sock (a left one), standing on its own with a slouch in the leg.
// Ribbed fold-over cuff, cream heel, toe and stripes, a little leather maker's tag.
// Material ids 100 (wool), 102 (leather tag), 103 (tag thread). HUE is the main wool colour.
#ifndef HUE
#define HUE srgb(0.12, 0.36, 0.66)
#endif
const float LSOCK_G = 39.0;      // stitches per unit: chunky yarn
const float LSOCK_TILT = 0.27;   // how far it leans back
const float LSOCK_S = 1.15;      // size
const float LSOCK_SD = 0.9;      // which way it happens to have slumped

// ---- one sock, lying flat in its own xy plane: heel at the origin corner, cuff up at y = 1, toe out along +x ----
// 2D outline. p is bent in place, so later lookups use the same bent coordinates.
float lsockOutline(inout vec2 p, float sd) {
  p.x += (0.05 * sin(p.y * 2.3 + sd * 2.0 + 0.6) + 0.018 * sin(p.y * 7.0 + sd * 4.0)) * smoothstep(0.2, 1.0, p.y);   // the leg sways and kinks
  float leg = sdSeg2(p, vec2(0.0, 0.16), vec2(0.0, 1.3)) - mix(0.148, 0.168, smoothstep(0.25, 0.75, p.y));
  vec2 a = vec2(0.0, 0.15), b = vec2(0.50, 0.14), pa = p - a, ba = b - a; float h = sat(dot(pa, ba) / dot(ba, ba));
  float foot = length(pa - ba * h) - mix(0.15, 0.122, h);
  float d = smin(leg, foot, 0.09);
  return smin(d, length(p - vec2(-0.07, 0.07)) - 0.115, 0.05);                              // the heel pocket
}
// knit coordinates: uv.x across the stitches, uv.y along them; pc = centre of this stitch, back in sock coordinates
void lsockKnitUV(vec2 p, out vec2 uv, out vec2 pc, out float foot) {
  foot = step(p.y, 0.97 * p.x + 0.155);                                                     // below the mitre line the stitches turn to run along the foot
  uv = foot > 0.5 ? vec2(p.y - 0.155, p.x + 0.155) : p;
  vec2 q = vec2(uv.x * LSOCK_G, uv.y * LSOCK_G * 1.3);
  float row = floor(q.y - abs(fract(q.x) - 0.5) * 1.8);                                     // rows follow the V of each stitch
  vec2 c = vec2((floor(q.x) + 0.5) / LSOCK_G, (row + 0.5) / (LSOCK_G * 1.3));
  pc = foot > 0.5 ? vec2(c.y - 0.155, c.x + 0.155) : c;
}
// height of the knitted surface, 0..1. Stocking stitch: two fat strands to a stitch leaning into a V, a deep channel between
// the columns. On the cuff (rib > 0): knit one, purl one, so every other column sinks into a channel of small purl bumps.
float lsockStitch(vec2 uv, float cuff) {
  vec2 q = vec2(uv.x * LSOCK_G, uv.y * LSOCK_G * 1.3);
  float ax = abs(fract(q.x) - 0.5) * 2.0;
  float strand = pow(sin(PI * fract(q.y - ax * 0.9)), 0.6);
  float h = strand * (0.25 + 0.75 * smoothstep(0.0, 0.16, ax) * (1.0 - 0.9 * smoothstep(0.66, 1.0, ax)));
  if (cuff > 0.0) {
    float rib = smoothstep(-0.35, 0.35, sin(PI * q.x));
    float purl = 0.5 + 0.5 * sin(TAU * q.y) * sin(TAU * q.x);
    h = mix(h, rib * (0.62 + 0.38 * h) + (1.0 - rib) * 0.12 * purl, cuff);
  }
  return h;
}
float lsockSd(vec3 q, float sd) {
  vec2 p = q.xy; float d2 = lsockOutline(p, sd);
  float cuff = smoothstep(0.752, 0.772, p.y);
  // slouch: the leg gathers into soft folds above the ankle, and a crease or two across the instep
  float fm = smoothstep(0.20, 0.34, p.y) * (1.0 - smoothstep(0.50, 0.74, p.y));
  float fold = sin(p.y * 33.0 + 2.4 * sin(p.x * 6.0 + sd * 9.0) + sd * 5.0) * fm;
  float im = smoothstep(0.10, 0.22, p.x) * (1.0 - smoothstep(0.26, 0.40, p.x)) * (1.0 - cuff) * step(p.y, 0.4);
  fold += 0.6 * sin(p.x * 44.0 - p.y * 20.0 + sd * 3.0) * im;
  d2 -= 0.016 * cuff + 0.011 * fold;
  d2 = smax(d2, p.y - 1.0 - 0.012 * sin(p.x * 11.0 + sd * 4.0) - 0.07 * p.x * cos(sd * 2.0), 0.035);
  float lump = fbm3(vec3(p * 4.5, sd * 3.0)) - 0.5;
  float h = 0.048 + 0.024 * sat(-d2 / 0.13) + 0.015 * cuff + 0.008 * fold + 0.022 * lump;
  float d = length(vec2(max(d2 + h, 0.0), q.z)) - h;                                        // a flattened tube with a fully rounded edge
  if (d < 0.035) {
    vec2 uv, pc; float foot; lsockKnitUV(p, uv, pc, foot);
    d -= (0.0055 + 0.004 * cuff) * lsockStitch(uv, cuff) + 0.003 * (noise(q * 210.0) - 0.5) + 0.003 * (noise(q * 90.0) - 0.5);
    // the open top of the tube
    d = smax(d, -sdEllipsoid(vec3(p.x, p.y - 1.01, q.z), vec3(0.128, 0.075, 0.024)), 0.012);
  }
  return d * 0.6;
}
vec3 lsocksLocal(vec3 p) {
  vec3 q = p - vec3(-0.25, 0.0, 0.14); q.yz = rot(-LSOCK_TILT) * q.yz;
  return q / LSOCK_S;
}
void mGift(vec3 p, inout float d) {
  float bb = length(p - vec3(0.0, 0.58, 0.0)) - 0.84;
  if (bb > 0.15) { d = min(d, bb); return; }
  vec3 qa = lsocksLocal(p);
  add(d, lsockSd(qa, LSOCK_SD) * LSOCK_S, 100.0);
  // maker's tag: a scrap of tan leather sewn to the cuff with two cross stitches
  vec3 t = qa - vec3(0.075, 0.865, 0.090); t.xy = rot(0.08) * t.xy;
  add(d, sdRBox(t, vec3(0.05, 0.03, 0.006), 0.005) * LSOCK_S, 102.0);
  vec3 ts = vec3(abs(t.x) - 0.038, t.y, t.z - 0.006); ts.xy = rot(0.785) * ts.xy; ts.xy = abs(ts.xy);
  add(d, sdCapsule(ts, vec3(0.0), vec3(0.011, 0.0, 0.0), 0.0028) * LSOCK_S, 103.0);
}
bool shGift(float id, vec3 p, inout vec3 n, inout Mat m) {
  if (id < 100.0 || id >= 110.0) return false;
  if (id > 102.5) { matFelt(m, n, p, srgb(0.92, 0.88, 0.76)); return true; }
  if (id > 101.5) { vec3 n0 = n; matLeather(m, n, p * 2.0, srgb(0.62, 0.38, 0.18), 0.3); n = normalize(mix(n0, n, 0.35)); return true; }
  float sd = LSOCK_SD;
  vec3 q = lsocksLocal(p);
  float t = LSOCK_TILT, b = 0.0;
  vec3 ex = vec3(cos(b), -sin(b) * cos(t), sin(b) * sin(t)), ey = vec3(sin(b), cos(b) * cos(t), -cos(b) * sin(t));
  vec2 pl = q.xy; lsockOutline(pl, sd);
  vec2 uv, pc; float foot; lsockKnitUV(pl, uv, pc, foot);
  vec3 wool = HUE, cream = srgb(0.90, 0.84, 0.70);
  vec3 col = wool;
  float cuff = smoothstep(0.752, 0.772, pl.y);
  if (length(pc - vec2(-0.17, -0.03)) < 0.265) col = cream;                                  // heel
  if (pc.x > 0.485) col = cream;                                                            // toe
  if (foot < 0.5 && pc.y > 0.585 && pc.y < 0.73 && abs(pc.y - 0.6575) > 0.022) col = cream;  // two stripes on the leg
  if (cuff > 0.5) col = pl.y > 0.955 ? cream : wool;
  // heathered yarn: each stitch a little different, with paler flecks spun in
  float st = hash1(floor(vec2(uv.x * LSOCK_G, uv.y * LSOCK_G * 1.3)) + sd * 17.0);
  col *= 0.90 + 0.18 * st;
  col = mix(col, vec3(0.75, 0.73, 0.68), 0.16 * smoothstep(0.7, 0.85, noise(q * 140.0 + sd)));
  vec3 tu = foot > 0.5 ? ey : ex, tv = foot > 0.5 ? ex : ey;
  // knitted wool, after matKnit in the library but following this sock's own stitches (which are also in the geometry)
  float e = 0.1 / LSOCK_G, h = lsockStitch(uv, cuff);
  float hx = lsockStitch(uv + vec2(e, 0.0), cuff) - h, hy = lsockStitch(uv + vec2(0.0, e), cuff) - h;
  n = normalize(n - 0.02 * (hx * tu + hy * tv) / e);
  m.col = col * (0.42 + 0.66 * h) * (0.85 + 0.25 * noise(p * 260.0)) * (0.9 + 0.2 * fbm3(p * 5.0));
  m.rough = 0.93; m.sheen = 0.35; m.sheenCol = mix(col, vec3(1.0), 0.25);                    // matt wool: the colour stays deep under the lamp
  n = normalize(n + 0.3 * (hash3(p * 700.0) - 0.5));
  return true;
}
