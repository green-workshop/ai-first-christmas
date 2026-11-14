// Title backdrop: the old workshop in the snow at night, lamps lit, the aurora over the mountains.
// The middle of the frame is kept quiet: the logo, the dashboard and the buttons sit there.
// --D PORTRAIT=1 with --w 1080 --h 1920 frames it for a phone.
//@ w=2200 h=1300 spp=260 fov=34 pos=0.6,1.5,15.5 tgt=0.3,3.3,0 aperture=0.03 focus=13 exposure=1.5
#define NL 5
#define STEPK 0.55
#define TMAX 140.0
#define STEPS 300
#define FOG 0.004
#define FOG_LIGHT 1
#ifdef PORTRAIT
const vec3 CABIN = vec3(-0.8, 0.0, -4.0);
#else
const vec3 CABIN = vec3(-5.6, 0.0, -3.5);
#endif
#ifdef PORTRAIT
const vec3 MOONDIR = normalize(vec3(0.2, 0.55, -0.8));
#else
const vec3 MOONDIR = normalize(vec3(0.38, 0.33, -0.86));
#endif

Light getLight(int i) {
  if (i == 0) return omni(MOONDIR * 300.0, 12.0, vec3(0.55, 0.68, 1.0) * 150000.0);                         // moonlight
  if (i == 1) return omni(CABIN + vec3(-0.2, 1.25, 2.6), 0.35, vec3(1.0, 0.62, 0.28) * 9.0);                // light spilling from the windows
  if (i == 2) return omni(CABIN + vec3(1.75, 1.75, 2.35), 0.1, vec3(1.0, 0.66, 0.3) * 3.2);                 // lantern by the door
  if (i == 3) return omni(vec3(2.0, 16.0, 30.0), 6.0, vec3(0.3, 0.42, 0.8) * 1100.0);                          // sky fill from behind the camera
  return omni(CABIN + vec3(-2.9, 1.3, 1.0), 0.3, vec3(1.0, 0.6, 0.26) * 3.0);                               // side window
}
vec3 sky(vec3 rd) {
  float h = sat(rd.y);
  vec3 c = mix(vec3(0.030, 0.055, 0.13), vec3(0.006, 0.012, 0.045), pow(h, 0.55));
  // aurora: two curtains of green, brighter low down
  float a1 = fbm(vec2(rd.x * 2.2 + rd.y * 1.5, rd.y * 0.6 + 2.0)), a2 = fbm(vec2(rd.x * 1.3 - rd.y * 2.0 + 7.0, rd.y * 0.4));
  float band1 = exp(-pow((rd.y - 0.36 - 0.12 * sin(rd.x * 3.0 + 0.6)) * 9.0, 2.0)) * smoothstep(0.3, 0.75, a1);
  float band2 = exp(-pow((rd.y - 0.54 - 0.09 * sin(rd.x * 2.2 + 2.4)) * 11.0, 2.0)) * smoothstep(0.35, 0.8, a2);
  float rays = 0.35 + 0.65 * noise(vec2(rd.x * 60.0 + rd.y * 6.0, 3.0)) * (0.5 + 0.5 * noise(vec2(rd.x * 9.0, 8.0)));
  c += vec3(0.10, 0.75, 0.42) * band1 * rays * 0.26 + vec3(0.12, 0.6, 0.6) * band2 * rays * 0.16;
  // stars
  vec3 g = floor(rd * 1500.0); float st = hash1(g);
  c += vec3(0.9, 0.95, 1.0) * step(0.99955, st) * (0.5 + 1.5 * hash1(g + 3.0)) * smoothstep(0.02, 0.2, rd.y) * 14.0;
  // the moon and its halo
  float m = dot(rd, MOONDIR);
  c += vec3(1.0, 0.97, 0.9) * smoothstep(0.99955, 0.99975, m) * 9.0 + vec3(0.5, 0.62, 0.9) * (pow(sat(m), 300.0) * 0.5 + pow(sat(m), 30.0) * 0.07);
  return c;
}

float ground(vec2 p) { return 0.16 * (fbm(p * 0.16 + 4.0) - 0.5) * 2.0 + 0.04 * noise(p * 0.9) + 0.9 * smoothstep(8.0, 30.0, -p.y) * fbm(p * 0.05); }
float pine(vec3 p, float h, float seedv) {
  float bb = sdCapCone(p - vec3(0.0, h * 0.5, 0.0), h * 0.52, h * 0.34, 0.05);
  if (bb > 0.4) return bb;
  float d = sdCyl(p - vec3(0.0, h * 0.12, 0.0), h * 0.03, h * 0.14);
  for (int i = 0; i < 5; i++) {
    float f = float(i) / 5.0, y0 = h * (0.16 + 0.17 * f), hh = h * 0.2 * (1.0 - 0.45 * f), r = h * 0.3 * (1.0 - 0.75 * f);
    d = smin(d, sdCapCone(p - vec3(0.0, y0 + hh, 0.0), hh, r, 0.02), 0.03);
  }
  float a = atan(p.x, p.z);
  d += 0.09 * h * 0.3 * (noise(vec3(a * 5.0 + seedv, p.y * 3.0, length(p.xz) * 3.0)) - 0.5) + 0.02 * (noise(p * 14.0) - 0.5);
  return d * 0.5;
}
float logsWall(vec2 q, float halfw) {             // q = (height, depth): a stack of round logs
  float y = q.x; float row = repLim(y - 0.16, 0.32, 0.0, 6.0);
  return length(vec2(row, q.y)) - 0.17;
}

float map(vec3 p) {
  float d = 1e9; gM = 0.0;
  add(d, (p.y - ground(p.xz)) * 0.6, 1.0);
  // mountains far away
  float mz = p.z + 75.0;
  float ridge = p.y + 3.0 - (12.0 + 13.0 * fbm(vec2(p.x * 0.035 + 2.0, 1.0)) + 5.0 * noise(vec2(p.x * 0.11, 3.0)) + 2.5 * noise(vec2(p.x * 0.4, 5.0))) * (1.0 - smoothstep(0.0, 26.0, abs(mz)));
  add(d, ridge * 0.35, 2.0);
  // ---- the workshop ----
  vec3 c = p - CABIN;
  float bb = sdBox(c - vec3(0.0, 2.6, 0.0), vec3(4.4, 3.6, 3.4));
  if (bb > 0.3) d = min(d, bb); else {
    // log walls: front and back (logs along x), the two ends (logs along z)
    float body = sdBox(c - vec3(0.0, 1.2, 0.0), vec3(3.0, 1.25, 2.0));
    float logsF = max(logsWall(vec2(c.y, abs(c.z) - 2.0), 3.0), abs(c.x) - 3.25);
    float logsS = max(logsWall(vec2(c.y - 0.16, abs(c.x) - 3.0), 2.0), abs(c.z) - 2.25);
    float walls = min(max(body, -sdBox(c - vec3(0.0, 1.2, 0.0), vec3(2.8, 1.4, 1.8))), min(logsF, logsS));
    // gable ends up under the roof
    float gable = max(max(abs(c.x) - 3.0, abs(c.z) * 0.78 + (c.y - 2.3) - 1.56), 2.3 - c.y);
    gable = max(gable, -(abs(c.x) - 2.85));
    walls = min(walls, gable);
    // openings: door and windows
    float door = sdBox(c - vec3(1.0, 0.95, 2.0), vec3(0.48, 0.95, 0.4));
    float win = sdBox(vec3(abs(c.x + 1.1) - 0.85, c.y - 1.3, c.z - 2.0), vec3(0.5, 0.48, 0.4));
    float winS = sdBox(c - vec3(-3.0, 1.3, 0.3), vec3(0.4, 0.48, 0.55));
    float round = length(c.xy - vec2(0.0, 2.95)) - 0.33;
    walls = max(walls, -min(min(door, win), min(winS, max(round, abs(c.z - 2.0) - 0.4))));
    add(d, walls, 3.0);
    // window glass (lit from inside), frames and bars
    add(d, sdBox(vec3(abs(c.x + 1.1) - 0.85, c.y - 1.3, c.z - 1.93), vec3(0.5, 0.48, 0.02)), 4.0);
    add(d, sdBox(c - vec3(-2.93, 1.3, 0.3), vec3(0.02, 0.48, 0.55)), 4.0);
    add(d, max(length(c.xy - vec2(0.0, 2.95)) - 0.33, abs(c.z - 1.93) - 0.02), 4.0);
    vec3 wq = vec3(abs(c.x + 1.1) - 0.85, c.y - 1.3, c.z - 2.03);
    float fr = max(abs(sdBox2(wq.xy, vec2(0.5, 0.48))) - 0.06, abs(wq.z) - 0.07);
    fr = min(fr, min(sdBox(wq, vec3(0.03, 0.48, 0.04)), sdBox(wq, vec3(0.5, 0.03, 0.04))));
    fr = min(fr, sdRBox(wq - vec3(0.0, -0.56, 0.1), vec3(0.62, 0.04, 0.12), 0.02));
    add(d, fr, 5.0);
    add(d, sdEllipsoid(wq - vec3(0.0, -0.49, 0.12), vec3(0.6, 0.07, 0.12)), 7.0);              // snow on the sills
    // door, its wreath, the lantern
    add(d, sdRBox(c - vec3(1.0, 0.95, 1.95), vec3(0.46, 0.93, 0.05), 0.02), 6.0);
    add(d, sdSphere(c - vec3(0.68, 0.92, 2.03), 0.045), 9.0);
    vec3 wr = c - vec3(1.0, 1.38, 2.05);
    add(d, (sdTorus(wr.xzy, 0.2, 0.07) - 0.035 * (noise(c * 40.0) - 0.5)) * 0.6, 10.0);
    add(d, sdRBox(wr - vec3(0.0, -0.2, 0.06), vec3(0.07, 0.05, 0.03), 0.02), 6.0);
    vec3 la = c - vec3(1.75, 1.75, 2.22);
    add(d, sdRBox(la, vec3(0.09, 0.13, 0.09), 0.02), 11.0);
    add(d, min(sdRBox(la - vec3(0.0, 0.17, 0.0), vec3(0.12, 0.03, 0.12), 0.02), sdCapsule(la, vec3(0.0, 0.2, 0.0), vec3(0.0, 0.3, -0.2), 0.015)), 9.0);
    // roof: boards under a thick cap of snow that sags over the eaves
    float pitch = abs(c.z) * 0.78 + (c.y - 2.3);
    float roof = max(max(abs(pitch - 1.72) - 0.07, abs(c.x) - 3.45), 2.25 - c.y - abs(c.z) * 0.0);
    roof = max(roof, abs(c.z) - 2.75);
    add(d, roof, 8.0);
    float cap = max(max(pitch - 1.72 - 0.34 - 0.12 * fbm(c.xz * 1.4) + 0.2 * smoothstep(2.2, 2.75, abs(c.z)), abs(c.x) - 3.55 - 0.05 * sin(c.z * 3.0)), abs(c.z) - 2.85 - 0.07 * sin(c.x * 2.3));
    cap = max(cap, 1.72 + 0.02 - pitch);
    float drip = sdEllipsoid(vec3(repLim(c.x, 0.5, -6.0, 6.0), c.y - 2.02 + 0.05 * sin(c.x * 4.0), abs(c.z) - 2.82), vec3(0.2, 0.12, 0.13));
    add(d, smin(cap, drip, 0.12) * 0.7, 7.0);
    // chimney with its own cap of snow
    vec3 ch = c - vec3(-1.5, 3.95, -0.4);
    add(d, sdRBox(ch, vec3(0.38, 0.75, 0.38), 0.03), 12.0);
    add(d, sdEllipsoid(ch - vec3(0.0, 0.8, 0.0), vec3(0.46, 0.16, 0.46)), 7.0);
    // snow banked against the walls, a cleared path to the door
    float bank = sdEllipsoid(c - vec3(-1.3, 0.0, 2.3), vec3(2.2, 0.45, 0.7));
    bank = smin(bank, sdEllipsoid(c - vec3(2.6, 0.0, 2.2), vec3(1.1, 0.4, 0.7)), 0.3);
    add(d, bank * 0.7, 1.0);
  }
  // ---- pines ----
#ifdef PORTRAIT
  add(d, pine(p - vec3(3.6, ground(vec2(3.6, 1.0)), 1.0), 6.5, 1.0), 13.0);
  add(d, pine(p - vec3(5.6, ground(vec2(5.6, -3.0)), -3.0), 8.0, 2.0), 13.0);
  add(d, pine(p - vec3(-6.5, ground(vec2(-6.5, -4.0)), -4.0), 7.5, 3.0), 13.0);
  add(d, pine(p - vec3(2.3, ground(vec2(2.3, 6.5)), 6.5), 2.6, 4.0), 13.0);
#else
  add(d, pine(p - vec3(8.2, ground(vec2(8.2, 1.5)), 1.5), 7.5, 1.0), 13.0);
  add(d, pine(p - vec3(11.5, ground(vec2(11.5, -2.0)), -2.0), 9.0, 2.0), 13.0);
  add(d, pine(p - vec3(5.4, ground(vec2(5.4, -6.0)), -6.0), 6.0, 3.0), 13.0);
  add(d, pine(p - vec3(-12.5, ground(vec2(-12.5, -5.0)), -5.0), 8.5, 4.0), 13.0);
  add(d, pine(p - vec3(-2.6, ground(vec2(-2.6, -9.0)), -9.0), 5.5, 5.0), 13.0);
  add(d, pine(p - vec3(6.6, ground(vec2(6.6, 6.5)), 6.5), 2.8, 6.0), 13.0);
  add(d, pine(p - vec3(-3.6, ground(vec2(-3.6, 5.5)), 5.5), 2.2, 7.0), 13.0);
  add(d, pine(p - vec3(1.8, ground(vec2(1.8, -16.0)), -16.0), 7.0, 8.0), 13.0);
  add(d, pine(p - vec3(-7.5, ground(vec2(-7.5, -18.0)), -18.0), 9.0, 9.0), 13.0);
  add(d, pine(p - vec3(14.5, ground(vec2(14.5, -12.0)), -12.0), 10.0, 10.0), 13.0);
#endif
  return d;
}

void shade(float id, vec3 p, inout vec3 n, inout Mat m) {
  vec3 c = p - CABIN;
  if (id < 1.5) { matSnow(m, n, p * 0.5); m.col *= srgb(0.86, 0.90, 1.0); return; }
  if (id < 2.5) {                                    // mountains: rock with snow on anything that is not steep
    float snowy = smoothstep(0.35, 0.6, n.y + 0.25 * fbm(p.xy * 0.2)) * smoothstep(6.0, 14.0, p.y + 4.0 * fbm(p.xz * 0.1));
    m.col = mix(srgb(0.10, 0.12, 0.18) * (0.6 + 0.8 * fbm(p.xy * 0.4)), srgb(0.80, 0.86, 0.98), snowy); m.rough = 0.9;
    return;
  }
  if (id < 3.5) {                                    // logs: bark-brown, grain along each log, snow dusted on top
    vec3 along = abs(abs(c.z) - 2.0) < 0.3 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 0.0, 1.0);
    matWood(m, n, p * 1.6, along, 0.8, 0.05);
    m.col *= srgb(0.75, 0.6, 0.5) * (0.6 + 0.6 * fbm3(p * 5.0));
    float dust = smoothstep(0.55, 0.9, n.y) * 0.8; m.col = mix(m.col, srgb(0.85, 0.9, 1.0), dust); m.rough = mix(m.rough, 0.9, dust);
    return;
  }
  if (id < 4.5) {                                    // lit windows: warm, uneven, a hint of what is inside
    float v = fbm(p.xy * 2.5 + 3.0), frost = smoothstep(0.5, 0.85, fbm(p.xy * 7.0)) * 0.5;
    m.col = vec3(0.05); m.rough = 0.1; m.coat = 1.0;
    m.emit = vec3(1.0, 0.63, 0.24) * (2.2 + 2.6 * v) * (1.0 - 0.4 * frost) + vec3(0.5, 0.6, 0.8) * frost * 0.3;
    return;
  }
  if (id < 5.5) { matPaint(m, n, p * 2.0, srgb(0.82, 0.80, 0.74), 0.4, 0.5, srgb(0.4, 0.28, 0.18), 0.0); return; }
  if (id < 6.5) { matPaint(m, n, p * 2.0, srgb(0.55, 0.06, 0.06), 0.6, 0.35, srgb(0.4, 0.28, 0.18), 0.0); return; }
  if (id < 7.5) { matSnow(m, n, p * 0.8); return; }
  if (id < 8.5) { matWood(m, n, p * 2.0, vec3(0.0, 0.6, 0.8), 0.9, 0.0); m.col *= 0.5; return; }
  if (id < 9.5) { matMetal(m, n, p, 1, vec3(1, 0, 0)); return; }
  if (id < 10.5) { float v = noise(p * 60.0); m.col = mix(srgb(0.03, 0.14, 0.07), srgb(0.10, 0.33, 0.14), v); m.rough = 0.6; n = normalize(n + 0.6 * (hash3(p * 400.0) - 0.5)); return; }
  if (id < 11.5) { m.col = vec3(0.05); m.rough = 0.1; m.coat = 1.0; m.emit = vec3(1.0, 0.62, 0.22) * 9.0; return; }
  if (id < 12.5) { float bid; float mo = brickPattern(vec2(p.x + p.z, p.y) * 2.2, bid); m.col = mix(srgb(0.36, 0.16, 0.12) * (0.6 + 0.6 * bid), srgb(0.3, 0.3, 0.3), mo); m.rough = 0.9; return; }
  // pines: dark needles, snow lying on every bough
  float v = noise(p * 9.0), tip = noise(p * 40.0);
  float snowy = smoothstep(0.25, 0.6, n.y + 0.3 * (v - 0.5));
  m.col = mix(srgb(0.02, 0.10, 0.07), srgb(0.06, 0.22, 0.13), v) * (0.6 + 0.6 * tip); m.rough = 0.7; m.sheen = 0.3; m.sheenCol = srgb(0.4, 0.8, 0.6);
  n = normalize(n + 0.5 * (hash3(p * 120.0) - 0.5));
  m.col = mix(m.col, srgb(0.86, 0.90, 1.0), snowy); m.rough = mix(m.rough, 0.9, snowy);
}
