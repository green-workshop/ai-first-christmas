// Wooden train set: a beech hump-back bridge with routed wheel grooves and a painted arch, a painted engine at the top
// with a wagon of logs hanging on by its magnet on the way up, two turned wooden trees behind.
// The line runs towards the camera and to the right. Material ids 130..139.
// HUE is the engine's paint.
#ifndef HUE
#define HUE srgb(0.80, 0.085, 0.06)
#endif
const float TS_A = 0.61, TS_S = 1.1, TS_L = 0.57, TS_H = 0.2, TS_TH = 0.055, TS_FLAT = 0.1, TS_XE = 0.04, TS_XW = -0.287;
vec3 tsLocal(vec3 p) { p.xz = rot(TS_A) * p.xz; p /= TS_S; p.x += 0.041; return p; }
// paint over beech, with the library's orange peel calmed down: these faces are lit at a grazing angle
void tsPaint(inout Mat m, inout vec3 n, vec3 p, vec3 col, float gloss, float wear) {
  vec3 n0 = n; matPaint(m, n, p, col, gloss, wear, srgb(0.80, 0.62, 0.40), 0.0); n = normalize(mix(n0, n, 0.12));
}
// height of the running surface along the bridge, and its slope
float tsH(float x) { float t = clamp((abs(x) - TS_FLAT) / (TS_L - TS_FLAT), 0.0, 1.0); return TS_TH + TS_H * 0.5 * (1.0 + cos(PI * t)); }
float tsSlope(float x) { float t = clamp((abs(x) - TS_FLAT) / (TS_L - TS_FLAT), 0.0, 1.0); return -sign(x) * TS_H * 0.5 * PI / (TS_L - TS_FLAT) * sin(PI * t); }
// into the frame of a vehicle standing in the grooves at x0: x forward, y up from the bottom of the groove
vec3 tsOnTrack(vec3 p, float x0, float sink) {
  vec3 q = p - vec3(x0, tsH(x0) - 0.012 - sink, 0.0); q.xy = rot(atan(tsSlope(x0))) * q.xy; return q;
}
// a pair of axles' worth of wheels at +-ax, with their steel pins. returns (wheels, pins)
vec2 tsWheels(vec3 q, float ax) {
  vec3 w = vec3(abs(q.x) - ax, q.y - 0.05, abs(q.z) - 0.06);
  return vec2(sdRCyl(w.xzy, 0.05, 0.0125, 0.005), sdEllipsoid(w - vec3(0, 0, 0.012), vec3(0.011, 0.011, 0.007)));
}
float tsMagnet(vec3 q, float x) { return sdRCyl(vec3(q.y - 0.07, abs(q.x) - x, q.z), 0.017, 0.006, 0.003); }
void mGift(vec3 pw, inout float d) {
  float bb = length(pw - vec3(0, 0.3, 0)) - 0.85;
  if (bb > 0.15) { d = min(d, bb); return; }
  vec3 p = tsLocal(pw); float ds = d / TS_S;
  // ---- the bridge: one block of beech, the arch sawn out, two grooves routed along the top, a peg to join the next piece
  float h = tsH(p.x), k = inversesqrt(1.0 + tsSlope(p.x) * tsSlope(p.x)), top = (p.y - h) * k;
  float body = smax(smax(top, abs(p.z) - 0.1, 0.008), abs(p.x) - TS_L, 0.006);
  float arch = (length(vec2(p.x / 0.27, p.y / 0.19)) - 1.0) * 0.19;
  body = smax(body, -arch, 0.01);
  float groove = max(abs(abs(p.z) - 0.06) - 0.0145, -(top + 0.012));
  body = smax(body, -groove, 0.005);
  vec3 e = p - vec3(TS_L, 0.5 * TS_TH, 0.0);
  float peg = min(sdRBox(e - vec3(0.015, 0, 0), vec3(0.03, 0.5 * TS_TH, 0.016), 0.004), sdRCyl(e - vec3(0.052, 0, 0), 0.03, 0.5 * TS_TH, 0.004));
  add(ds, min(body, peg), 130.0);
  // ---- the engine, level on the crown
  vec3 q = tsOnTrack(p, TS_XE, 0.004);
  float chassis = sdRBox(q - vec3(0, 0.0675, 0), vec3(0.2, 0.0275, 0.042), 0.006);
  float plate = sdRBox(q - vec3(0, 0.109, 0), vec3(0.205, 0.008, 0.074), 0.005);
  float boiler = sdRCyl(vec3(q.y - 0.18, q.x - 0.085, q.z), 0.062, 0.107, 0.014);
  boiler = min(boiler, sdRBox(q - vec3(0.085, 0.128, 0), vec3(0.09, 0.016, 0.04), 0.005));
  float cab = sdRBox(q - vec3(-0.115, 0.2, 0), vec3(0.085, 0.086, 0.07), 0.007);
  cab = smax(cab, -(sdBox2(vec2(q.x + 0.115, q.y - 0.228), vec2(0.026, 0.022)) - 0.012), 0.005);
  cab = smax(cab, -sdRBox(q - vec3(-0.115, 0.215, 0), vec3(0.07, 0.066, 0.056), 0.004), 0.004);        // hollow, so the windows see through
  float paint = min(min(boiler, cab), sdRBox(q - vec3(0.207, 0.08, 0), vec3(0.008, 0.022, 0.07), 0.004));
  add(ds, paint, 131.0);
  vec3 r = q - vec3(-0.115, 0.295 - 1.4 * q.z * q.z, 0.0);
  float black = min(min(chassis, plate), sdRBox(r, vec3(0.102, 0.009, 0.082), 0.007) * 0.9);
  vec3 f = q - vec3(0.14, 0.0, 0.0);
  black = min(black, min(sdCapCone(f - vec3(0, 0.28, 0), 0.042, 0.02, 0.029) - 0.003, sdTorus(f - vec3(0, 0.322, 0), 0.029, 0.007)));
  add(ds, black, 132.0);
  add(ds, min(sdEllipsoid(q - vec3(0.035, 0.243, 0), vec3(0.03, 0.028, 0.03)), sdSphere(q - vec3(0.195, 0.18, 0), 0.012)), 138.0);
  vec2 wh = tsWheels(q, 0.11); float metal = min(wh.y, tsMagnet(q, 0.219));
  // ---- the wagon, climbing
  vec3 g = tsOnTrack(p, TS_XW, 0.0);
  add(ds, sdRBox(g - vec3(0, 0.0675, 0), vec3(0.125, 0.0275, 0.042), 0.006), 132.0);
  float tub = sdRBox(g - vec3(0, 0.137, 0), vec3(0.12, 0.036, 0.074), 0.006);
  tub = smax(tub, -sdRBox(g - vec3(0, 0.165, 0), vec3(0.108, 0.045, 0.062), 0.004), 0.005);
  add(ds, tub, 135.0);
  float logs = min(sdRCyl(vec3(g.y - 0.148, g.x - 0.004, abs(g.z) - 0.03), 0.028, 0.1, 0.004), sdRCyl(vec3(g.y - 0.196, g.x + 0.006, g.z - 0.003), 0.027, 0.094, 0.004));
  add(ds, logs, 136.0);
  vec2 wg = tsWheels(g, 0.062);
  add(ds, min(wh.x, wg.x), 133.0);
  add(ds, min(metal, min(wg.y, tsMagnet(g, 0.139))), 134.0);
  // ---- trees: turned on a lathe, a cone and a ball, each on a little trunk and foot
  vec3 t1 = p - vec3(0.30, 0.0, -0.33), t2 = p - vec3(-0.42, 0.0, -0.15);

  float trunks = min(min(sdRCyl(t1 - vec3(0, 0.012, 0), 0.06, 0.012, 0.005), sdCyl(t1 - vec3(0, 0.08, 0), 0.02, 0.07)),
                     min(sdRCyl(t2 - vec3(0, 0.012, 0), 0.045, 0.012, 0.005), sdCyl(t2 - vec3(0, 0.2, 0), 0.016, 0.19)));
  add(ds, trunks, 136.5);
  float cone = min(sdCapCone(t1 - vec3(0, 0.27, 0), 0.13, 0.125, 0.06) - 0.006, sdCapCone(t1 - vec3(0, 0.50, 0), 0.13, 0.095, 0.012) - 0.006);
  add(ds, min(cone, sdEllipsoid(t2 - vec3(0, 0.46, 0), vec3(0.082, 0.092, 0.082))), 137.0);

  d = ds * TS_S;
}
bool shGift(float id, vec3 pw, inout vec3 n, inout Mat m) {
  if (id < 130.0 || id >= 140.0) return false;
  vec3 p = tsLocal(pw); vec3 nl = n; nl.xz = rot(TS_A) * n.xz;
  vec3 beech = srgb(0.80, 0.62, 0.40);
  bool yellowish = HUE.r > 0.25 && HUE.g > 0.12 && HUE.b < 0.1;
  vec3 trim = yellowish ? srgb(0.80, 0.085, 0.06) : srgb(0.95, 0.70, 0.08);
  if (id < 130.5) {
    float h = tsH(p.x), under = h - p.y;
    float arch = (length(vec2(p.x / 0.27, p.y / 0.19)) - 1.0) * 0.19;
    bool side = abs(nl.z) > 0.6 && under > 0.034, soffit = arch < 0.012 && abs(p.z) < 0.097;
    if ((side || soffit) && abs(p.x) < TS_L - 0.002) {
      bool greenish = HUE.g > HUE.r && HUE.g > HUE.b;
      tsPaint(m, nl, p, greenish ? srgb(0.12, 0.32, 0.66) : srgb(0.12, 0.50, 0.24), 0.6, 0.08);

      m.col *= mix(0.55, 1.0, smoothstep(0.034, 0.038, under) + float(soffit));           // the glue line under the deck
    } else {
      matWood(m, nl, p, vec3(1, 0.04, 0.02), 0.06, 0.45);
      // routed grooves: burnished by the wheels, with a little dust in the corners
      float gz = abs(abs(p.z) - 0.06);
      if (gz < 0.0155 && nl.y > 0.3 && under > 0.004) { m.col *= 0.72 + 0.2 * noise(p * vec3(30.0, 30.0, 400.0)); m.rough = 0.3; }
      if (abs(nl.x) > 0.8 && abs(p.x) > TS_L - 0.004) m.col *= 0.82 + 0.25 * noise(p * vec3(8.0, 260.0, 260.0));   // end grain
    }
  } else if (id < 131.5) {
    vec3 q = tsOnTrack(p, TS_XE, 0.004);
    vec3 c = HUE;
    bool onBoiler = q.x > -0.028 && q.y > 0.135;
    if (onBoiler && (abs(q.x - 0.012) < 0.008 || abs(q.x - 0.105) < 0.008)) c = trim;                 // boiler bands
    if (onBoiler && q.x > 0.16) c = srgb(0.05, 0.05, 0.055);                                           // smokebox
    if (q.x < -0.03 && abs(nl.z) > 0.7) {
      float fr = abs(sdBox2(vec2(q.x + 0.115, q.y - 0.228), vec2(0.026, 0.022)) - 0.012 - 0.01);       // lining round the cab window
      if (fr < 0.0035 || abs(q.y - 0.150) < 0.0035) c = trim;
    }
    tsPaint(m, nl, p, c, 0.8, 0.05);
  } else if (id < 132.5) {
    tsPaint(m, nl, p, srgb(0.055, 0.055, 0.06), 0.7, 0.07);
  } else if (id < 133.5) {
    // wheels: painted, a ring routed into each face
    vec3 q = tsOnTrack(p, TS_XE, 0.004); float ax = 0.11;
    vec3 g = tsOnTrack(p, TS_XW, 0.0);
    if (length(vec2(abs(g.x) - 0.062, g.y - 0.05)) < length(vec2(abs(q.x) - ax, q.y - 0.05))) { q = g; ax = 0.062; }
    float rr = length(vec2(abs(q.x) - ax, q.y - 0.05));
    tsPaint(m, nl, p, trim, 0.7, 0.12);
    float ring = abs(rr - 0.034);
    if (abs(nl.z) > 0.6) { m.col *= mix(0.45, 1.0, smoothstep(0.0015, 0.004, ring)); m.coat *= smoothstep(0.0, 0.004, ring); }
    else { m.col = mix(m.col, beech * (0.7 + 0.3 * noise(p * 80.0)), 0.75); m.coat = 0.1; m.rough = 0.5; }        // the tread wears back to wood
  } else if (id < 134.5) {
    matMetal(m, nl, p, 3, vec3(1, 0, 0)); m.rough += 0.08;
  } else if (id < 135.5) {
    vec3 g = tsOnTrack(p, TS_XW, 0.0);
    vec3 c = HUE.gbr * 0.9 + 0.012;
    if (abs(nl.y) < 0.6 && abs(g.y - 0.150) < 0.004) c = srgb(0.93, 0.90, 0.80);
    tsPaint(m, nl, p, c, 0.75, 0.06);
  } else if (id < 136.25) {
    // logs: bark left on, sawn ends showing their rings
    vec3 g = tsOnTrack(p, TS_XW, 0.0);
    vec2 c = vec2(g.y - (g.y > 0.176 ? 0.196 : 0.148), g.y > 0.176 ? g.z - 0.003 : abs(g.z) - 0.03);
    if (abs(nl.x) > 0.5 && abs(g.x) > 0.085) {
      float rr = length(c); m.col = mix(srgb(0.86, 0.70, 0.46), srgb(0.62, 0.44, 0.24), 0.5 + 0.5 * sin(rr * 900.0 + 3.0 * noise(p * 60.0)));
      m.col *= mix(1.0, 0.45, smoothstep(0.02, 0.026, rr)) * (0.9 + 0.2 * noise(p * 200.0)); m.rough = 0.8;
    } else {
      // peeled poles: pale sapwood, a few knots
      matWood(m, nl, g + vec3(0.0, 0.0, 3.0 * step(0.176, g.y)), vec3(1, 0.03, 0.02), 0.0, 0.2);
      float knot = smoothstep(0.80, 0.9, noise(vec3(g.x * 22.0, atan(c.y, c.x) * 2.0, 4.0 + step(0.176, g.y))));
      m.col = mix(m.col * 1.08, srgb(0.36, 0.22, 0.12), knot);
    }

  } else if (id < 136.75) {
    matWood(m, nl, p * 1.5, vec3(0.03, 1, 0.02), 0.1, 0.5);
  } else if (id < 137.5) {
    bool ball = p.x < 0.0;
    vec3 c = ball ? srgb(0.42, 0.62, 0.12) : srgb(0.07, 0.42, 0.20);
    tsPaint(m, nl, p, c, 0.65, 0.06);

    // lathe marks: faint rings round the axis
    float lathe = noise(p.y * 700.0); m.col *= 0.94 + 0.1 * lathe; m.rough += 0.08 * lathe;
    nl = normalize(nl + vec3(0, 0.05 * (lathe - 0.5), 0));
  } else {
    matMetal(m, nl, p, 1, vec3(0, 1, 0));
  }
  n = nl; n.xz = rot(-TS_A) * nl.xz;
  return true;
}
