// Child-size violin standing on its end button, its bow leaning across the neck. Arched spruce top with f-holes and purfling,
// flamed maple ribs and scroll, ebony fittings, bridge, four strings. Material ids 100..109.
// violin space: x across the body, y from the bottom edge up to the scroll, z out of the top plate
const vec3 VIOLIN_BASE = vec3(0.175, 0.021, -0.050);
const float VIOLIN_S = 1.12;
vec3 violinLocal(vec3 p) {
  vec3 v = (p - VIOLIN_BASE) / VIOLIN_S;
  v.xy = rot(0.135) * v.xy;        // leans to the left
  v.yz = rot(-0.085) * v.yz;       // and a little back
  v.xz = rot(0.32) * v.xz;         // turned to show its ribs
  return v;
}
// neck space: y from the nut towards the scroll (negative towards the bridge), z up out of the fingerboard
vec3 violinNeck(vec3 v) { vec2 a = vec2(v.y - 0.906, v.z - 0.048); return vec3(v.x, dot(a, vec2(0.9934, -0.1146)), dot(a, vec2(0.1146, 0.9934))); }
// bow: from the screw button on the belt to the tip
const vec3 VIOLIN_BOW0 = vec3(-0.300, 0.016, 0.260), VIOLIN_BOW1 = vec3(0.215, 1.215, -0.150);
const vec3 VIOLIN_BS = normalize(VIOLIN_BOW1 - VIOLIN_BOW0);
const vec3 VIOLIN_BH0 = normalize(cross(vec3(0.0, 0.208, 0.978), VIOLIN_BS));
const vec3 VIOLIN_BE0 = cross(VIOLIN_BS, VIOLIN_BH0);
const vec3 VIOLIN_BH = 0.940 * VIOLIN_BH0 + 0.342 * VIOLIN_BE0, VIOLIN_BE = -0.342 * VIOLIN_BH0 + 0.940 * VIOLIN_BE0;
const float VIOLIN_BL = length(VIOLIN_BOW1 - VIOLIN_BOW0);
// bow space: x along the stick from the button, y from the hair up to the stick, z across the hair
vec3 violinBow(vec3 p) { vec3 v = p - VIOLIN_BOW0; return vec3(dot(v, VIOLIN_BS), dot(v, VIOLIN_BH), dot(v, VIOLIN_BE)); }

float violinCirc(vec2 p, float x, float y, float r) { return length(p - vec2(x, y)) - r; }
float violinHorn(vec2 p, vec2 a, vec2 b, float ra, float rb) { vec2 pa = p - a, ba = b - a; float h = sat(dot(pa, ba) / dot(ba, ba)); return length(pa - ba * h) - mix(ra, rb, h * h); }
// the outline of the body, seen from the front: negative inside
float violinOutline(vec2 p) {
  p.x = abs(p.x);
  float lower = smin(violinCirc(p, 0.062, 0.165, 0.132), violinCirc(p, 0.0, 0.200, 0.200), 0.05);
  float upper = smin(violinCirc(p, 0.046, 0.535, 0.111), violinCirc(p, 0.0, 0.500, 0.164), 0.05);
  float d = smin(lower, upper, 0.05);
  // the four corners: the bouts flare out into little horns
  d = smin(d, violinHorn(p, vec2(0.100, 0.225), vec2(0.1640, 0.2770), 0.036, 0.0060), 0.014);
  d = smin(d, violinHorn(p, vec2(0.092, 0.500), vec2(0.1510, 0.4470), 0.034, 0.0060), 0.014);
  // C-bouts, cut in sharply so the corners come to a point
  float cb = (length((p - vec2(0.203, 0.365)) / vec2(0.098, 0.092)) - 1.0) * 0.092;
  return smax(d, -cb, 0.0015);
}
// one f-hole (x already mirrored): negative inside the hole
float violinF(vec2 p) {
  p.x += 0.008;
  float stem = min(sdBezier(p, vec2(0.0655, 0.373), vec2(0.0550, 0.335), vec2(0.0790, 0.302)), sdBezier(p, vec2(0.0790, 0.302), vec2(0.1030, 0.269), vec2(0.0925, 0.231)));
  float w = 0.0024 + 0.0036 * smoothstep(0.07, 0.02, abs(p.y - 0.302));
  float d = stem - w;
  d = min(d, violinCirc(p, 0.0585, 0.3670, 0.0076));        // upper eye
  d = min(d, violinCirc(p, 0.1005, 0.2385, 0.0102));        // lower eye
  d = min(d, sdBox2(p - vec2(0.079, 0.302), vec2(0.0085, 0.0013)));   // nicks
  return d;
}
float violinArch(float o, float zsign) {
  float t = clamp(-o / 0.10, 0.0, 1.0);
  return 0.0345 + (zsign > 0.0 ? 0.031 : 0.027) * (1.0 - (1.0 - t) * (1.0 - t)) - 0.0022 * exp(-pow((-o - 0.013) / 0.007, 2.0));
}
// scroll and pegbox, pegs: n = neck space
float violinHead(vec3 n, out float id) {
  id = 101.0;
  float wpb = mix(0.0265, 0.0195, clamp(n.y / 0.135, 0.0, 1.0));
  float box = sdBox(vec3(n.x, n.y - 0.072, n.z + 0.023), vec3(wpb - 0.006, 0.066 - 0.006, 0.019 - 0.006)) - 0.006;
  float slot = sdBox(vec3(n.x, n.y - 0.070, n.z - 0.004), vec3(0.0120, 0.054, 0.034)) - 0.002;
  float d = smax(box, -slot, 0.003);
  // volute: turns wind in to the eye, which stands proud each side
  vec2 c = vec2(n.y - 0.160, n.z + 0.020); float rho = length(c), al = atan(c.y, c.x);
  float hw = 0.0165 + 0.0125 * (1.0 - smoothstep(0.006, 0.034, rho));
  float turn = 0.0022 * cos(TAU * rho / 0.0135 - al) * smoothstep(0.004, 0.012, rho);
  float vol = smax(rho - 0.0345, abs(n.x) - hw - turn, 0.004);
  vol = smax(vol, -(length(vec2(rho - 0.0345, abs(n.x) - 0.0)) - 0.0), 0.001);
  d = smin(d, vol * 0.6, 0.012);
  // pegs: G and D on one side, E and A on the other
  float pg = 1e9;
  for (int i = 0; i < 4; i++) {
    float fi = float(i), sd = (i == 0 || i == 2) ? -1.0 : 1.0;
    vec3 q = vec3(n.x * sd, n.y - (0.030 + 0.0262 * fi), n.z + 0.023);
    float shaft = sdCone(q, vec3(-0.028, 0.0, 0.0), vec3(0.040, 0.0, 0.0), 0.0042, 0.0062);
    vec3 hq = q - vec3(0.056, 0.0, 0.0); hq.yz = rot(0.6 + 1.3 * fi) * hq.yz;
    float head = sdEllipsoid(hq, vec3(0.0165, 0.0155, 0.0058));
    head = min(head, sdSphere(q - vec3(0.0405, 0.0, 0.0), 0.0078));
    pg = min(pg, smin(shaft, head, 0.004));
  }
  if (pg < d) { d = pg; id = 102.0; }
  return d;
}
void violinStrings(vec3 v, inout float d) {
  float bound = max(abs(v.x) - 0.040, 0.030 - v.z);
  if (bound > 0.03) { add(d, bound, 104.0); return; }
  for (int i = 0; i < 4; i++) {
    float k = float(i) - 1.5, rad = 0.0021 - 0.0003 * float(i);
    vec3 nut = vec3(k * 0.0105, 0.9062, 0.0508), br = vec3(k * 0.0225, 0.300, 0.1285 - k * k * 0.0032), tl = vec3(k * 0.0150, 0.243, 0.1105);
    float yy = 0.030 + 0.0262 * float(i);
    vec3 pegp = vec3(k * 0.004, 0.906 + yy * 0.9934 - 0.019 * 0.1146, 0.048 - yy * 0.1146 - 0.019 * 0.9934);
    float s = min(min(sdCapsule(v, nut, br, rad), sdCapsule(v, br, tl, rad)), sdCapsule(v, nut, pegp, rad));
    add(d, s, 104.0);
  }
}
void violinBowParts(vec3 p, inout float d) {
  float bound = sdCapsule(p, VIOLIN_BOW0, VIOLIN_BOW1, 0.045);
  if (bound > 0.04) { add(d, bound, 105.0); return; }
  vec3 b = violinBow(p);
  // stick: cambered towards the hair, tapering to the head
  float st = sdBezier(b.xy, vec2(0.0, 0.0245), vec2(VIOLIN_BL * 0.52, 0.0035), vec2(VIOLIN_BL - 0.004, 0.0205));
  float rad = mix(0.0086, 0.0052, clamp(b.x / VIOLIN_BL, 0.0, 1.0));
  add(d, length(vec2(st, b.z)) - rad, 105.0);
  // head: a little hatchet of the same wood, faced with ivory where the hair goes in
  vec3 hq = b - vec3(VIOLIN_BL - 0.012, 0.0095, 0.0);
  float head = sdBox(vec3(hq.x - 0.35 * hq.y, hq.y, hq.z), vec3(0.013, 0.0115, 0.0058 - 0.002)) - 0.002;
  add(d, head, 105.0);
  add(d, sdBox(vec3(hq.x + 0.006, hq.y + 0.0128, hq.z), vec3(0.0165, 0.0012, 0.0062)) - 0.0006, 108.0);
  // hair: a flat ribbon of horsehair
  add(d, sdBox(b - vec3(VIOLIN_BL * 0.5 + 0.03, 0.0, 0.0), vec3(VIOLIN_BL * 0.5 - 0.075, 0.0012, 0.0105 + 0.001 * sin(b.x * 40.0))), 106.0);
  // frog: ebony block with a silver ferrule and heel plate; the screw button behind it
  vec3 fq = b - vec3(0.090, 0.0085, 0.0);
  float frog = sdBox(fq, vec3(0.040, 0.0100, 0.0115) - 0.003) - 0.003;
  frog = smax(frog, -(length(vec2(fq.x - 0.047, fq.y - 0.003)) - 0.011), 0.003);              // the thumb curve
  add(d, frog, 102.0);
  float silver = sdBox(b - vec3(0.124, 0.0015, 0.0), vec3(0.008, 0.0035, 0.0122)) - 0.0008;       // ferrule
  silver = min(silver, sdBox(b - vec3(0.0505, 0.0085, 0.0), vec3(0.0015, 0.0105, 0.0122)));        // heel plate
  vec3 sq = vec3(b.y - 0.0245, b.x - 0.022, b.z);
  float btn = sdRCyl(sq, 0.0102, 0.020, 0.002);
  btn += 0.0005 * cos(atan(sq.z, sq.x) * 8.0);
  silver = min(silver, btn);
  add(d, silver, 107.0);
}
void mGift(vec3 p, inout float d) {
  float bb = length(p - vec3(0.0, 0.62, 0.08)) - 0.84;
  if (bb > 0.15) { d = min(d, bb); return; }
  vec3 v = violinLocal(p);
  float d0 = d, m0 = gM; d = 1e9;
  // ---- body: ribs set in from the edges of two arched plates ----
  float o = violinOutline(v.xy), az = abs(v.z);
  float inset = 0.0055 * (1.0 - smoothstep(0.0255, 0.0300, az));
  float body = smax(o + inset, az - violinArch(o, v.z), 0.0045);
  vec2 fp = vec2(abs(v.x), v.y);
  if (v.z > 0.02 && fp.x > 0.028 && fp.x < 0.118 && fp.y > 0.215 && fp.y < 0.39) body = max(body, -max(violinF(fp), 0.036 - v.z));
  add(d, body * 0.8, 100.0);
  // ---- neck, heel, pegbox, scroll ----
  vec3 n = violinNeck(v);
  float wf = mix(0.0225, 0.0390, clamp(-n.y / 0.506, 0.0, 1.0));
  float dn = mix(0.0185, 0.0270, clamp(-n.y / 0.24, 0.0, 1.0));
  float neck = (length(vec2(n.x / (wf - 0.002), min(n.z + 0.010, 0.0) / dn)) - 1.0) * 0.019;
  neck = max(neck, max(n.z + 0.008, abs(n.y + 0.118) - 0.130));
  float heel = sdRBox(v - vec3(0.0, 0.674, -0.012), vec3(0.0175, 0.020, 0.026), 0.012);
  float hid; float headD = 1e9;
  float hb = length(n - vec3(0.0, 0.085, -0.02)) - 0.135;
  if (hb > 0.04) { headD = hb; hid = 101.0; } else headD = violinHead(n, hid);
  add(d, smin(neck, heel, 0.022), 101.0);
  add(d, headD, hid);
  // ---- ebony: fingerboard, nut, tailpiece, chinrest, saddle, end button ----
  vec2 fs = vec2(abs(n.x) - wf, abs(n.z + 0.0055 + n.x * n.x * 5.5) - 0.0055);
  float fb = min(max(fs.x, fs.y), 0.0) + length(max(fs, 0.0)) - 0.0012;
  fb = smax(fb, abs(n.y + 0.253) - 0.253, 0.002);
  float nut = sdRBox(vec3(n.x, n.y - 0.0045, n.z + 0.001), vec3(0.0225, 0.0042, 0.0050), 0.002);
  vec2 ta = vec2(v.y - 0.245, v.z - 0.1085);
  vec3 tq = vec3(v.x, dot(ta, vec2(-0.9815, -0.1913)), dot(ta, vec2(-0.1913, 0.9815)));
  float wt = mix(0.0400, 0.0160, smoothstep(0.0, 0.199, tq.y)) + 0.004 * sin(tq.y * 15.8);
  float tail = sdBox2(vec2(tq.x, tq.z + 0.0045 + tq.x * tq.x * 5.0), vec2(wt, 0.0045) - 0.003) - 0.003;
  tail = smax(tail, abs(tq.y - 0.0995) - 0.0995, 0.004);
  tail = min(tail, sdBox(vec3(tq.x, tq.y - 0.012, tq.z - 0.0015), vec3(wt - 0.004, 0.0018, 0.0015)));     // string fret
  vec3 cq = v - vec3(-0.084, 0.094, 0.060);
  float chin = sdEllipsoid(cq, vec3(0.062, 0.051, 0.0145));
  chin = smax(chin, -sdEllipsoid(cq - vec3(0.004, 0.005, 0.028), vec3(0.052, 0.042, 0.024)), 0.008);
  float button = sdRCyl(vec3(v.x, v.z, v.y + 0.008), 0.0115, 0.009, 0.004);
  float saddle = sdRBox(v - vec3(0.0, 0.004, 0.036), vec3(0.020, 0.005, 0.004), 0.002);
  add(d, min(min(fb, nut), min(min(tail, chin), min(button, saddle))), 102.0);
  // tailgut over the saddle, chinrest clamp, fine tuner on the E string
  float gut = sdCapsule(vec3(abs(v.x), v.y, v.z), vec3(0.006, 0.052, 0.070), vec3(0.006, 0.004, 0.042), 0.0022);
  gut = min(gut, sdCapsule(vec3(abs(v.x), v.y, v.z), vec3(0.006, 0.004, 0.042), vec3(0.004, -0.012, 0.006), 0.0022));
  add(d, gut, 102.0);
  vec3 kq = vec3(length(vec2(v.x, v.y - 0.2)) - 0.2035, v.z - 0.012, abs(atan(-v.x, -(v.y - 0.2)) - 0.44) - 0.10);
  float clampB = max(length(kq.xz * vec2(1.0, 0.2)) - 0.0036, abs(kq.y) - 0.052);
  clampB = min(clampB, sdCapsule(v, vec3(0.0338, 0.236, 0.113), vec3(0.0338, 0.236, 0.127), 0.0042));
  add(d, clampB, 107.0);
  // ---- bridge: thin maple, waisted, pierced ----
  float topb = 0.1290 - v.x * v.x * 3.2;
  float bw = 0.0375 - 0.0085 * exp(-pow((v.z - 0.090) / 0.008, 2.0));
  float b2 = max(max(abs(v.x) - bw, v.z - topb), 0.050 - v.z);
  b2 = max(b2, -violinCirc(vec2(v.x, v.z), 0.0, 0.1000, 0.0072));
  b2 = max(b2, -(length(vec2(v.x, v.z - 0.056) * vec2(1.0, 1.5)) - 0.019));
  float bridge = max(b2, abs(v.y - 0.300) - mix(0.0048, 0.0022, clamp((v.z - 0.06) / 0.067, 0.0, 1.0)));
  add(d, bridge * 0.8, 103.0);
  violinStrings(v, d);
  d *= VIOLIN_S;
  if (d0 < d) { d = d0; gM = m0; }
  violinBowParts(p, d);
}
bool shGift(float id, vec3 p, inout vec3 n, inout Mat m) {
  if (id < 100.0 || id >= 110.0) return false;
  vec3 v = violinLocal(p);
  if (id < 101.5) {
    bool body = id < 100.5;
    float o = body ? violinOutline(v.xy) : -0.05;
    bool top = body && v.z > 0.030 && o < 0.002;
    vec3 col; float gl = 1.0;
    if (top) {
      // spruce: fine straight grain running the length of the body, a centre joint, amber varnish
      float g = v.x * 210.0 + 1.2 * noise(v.y * 4.0 + 3.0) + 0.6 * noise(vec2(v.x * 30.0, v.y * 2.0));
      float line = smoothstep(0.55, 0.95, fract(g)) * (1.0 - smoothstep(0.95, 1.0, fract(g)));
      float wide = noise(v.x * 23.0 + 5.0);
      col = mix(srgb(0.74, 0.37, 0.085), srgb(0.48, 0.19, 0.045), 0.7 * line + 0.2 * wide);
      col *= 0.9 + 0.2 * noise(vec2(v.x * 400.0, v.y * 9.0));
      col *= 1.0 - 0.25 * (1.0 - smoothstep(0.0, 0.0012, abs(v.x)));
      n = normalize(n + 0.03 * (line - 0.5) * vec3(1.0, 0.0, 0.0));
    } else {
      // maple: flame running across the grain, red-brown varnish
      vec3 w = body ? v : violinNeck(v);
      float fl = sin(w.y * 150.0 + 6.0 * noise(w.xz * 9.0 + 2.0) + (body && w.z > -0.03 ? w.x * 0.0 : 0.0) + 14.0 * abs(w.x) * float(body && v.z < -0.03));
      float fig = 0.5 + 0.5 * fl * (0.55 + 0.45 * noise(w * 18.0));
      float fibre = noise(vec3(w.x * 260.0, w.y * 7.0, w.z * 260.0));
      col = mix(srgb(0.44, 0.17, 0.045), srgb(0.72, 0.34, 0.085), fig) * (0.88 + 0.2 * fibre);
    }
    // varnish worn thin and pale on the edges and where it is handled; darker where grime gathers
    float wear = 0.0;
    if (body) {
      wear = smoothstep(-0.008, 0.001, o) * 0.75;
      wear = max(wear, top ? 0.32 * smoothstep(0.12, 0.0, length(v.xy - vec2(0.120, 0.590))) : 0.0);             // shoulder the hand rests on
      wear = max(wear, top ? 0.35 * smoothstep(0.08, 0.0, length((v.xy - vec2(-0.075, 0.150)) * vec2(1.0, 0.8)) - 0.05) : 0.0);
    } else {
      vec3 w = violinNeck(v);
      wear = 0.8 * smoothstep(0.02, -0.20, w.y) * smoothstep(0.0, -0.012, w.z);                                // the neck is bare, oiled wood under the hand
      wear = max(wear, 0.5 * smoothstep(0.028, 0.036, length(vec2(w.y - 0.160, w.z + 0.020))));               // scroll rim
    }
    wear *= 0.6 + 0.5 * fbm3(v * 9.0);
    // antique shading: the varnish lies darker and redder towards the edges and in the waist
    if (body) col *= mix(0.62, 1.08, smoothstep(0.0, 0.085, -o + 0.03 * fbm3(v * 7.0)));
    col = mix(col, mix(col, srgb(0.78, 0.52, 0.22), 0.75), sat(wear));
    gl = 1.0 - 0.5 * sat(wear);
    if (top) {
      // purfling: black, white, black, let in just inside the edge
      float pf = abs(o + 0.0095);
      col = mix(col, srgb(0.74, 0.60, 0.36), 1.0 - smoothstep(0.0016, 0.0022, pf));
      col = mix(col, srgb(0.05, 0.035, 0.03), (1.0 - smoothstep(0.0016, 0.0022, pf)) * smoothstep(0.0004, 0.0008, pf));
      // f-holes open into the dark inside
      float fh = violinF(vec2(abs(v.x), v.y));
      float hole = 1.0 - smoothstep(-0.0004, 0.0006, fh);
      col = mix(col, vec3(0.006, 0.004, 0.003), hole); gl *= 1.0 - hole;
      // rosin dust under the strings between bridge and fingerboard
      float dust = smoothstep(0.045, 0.0, abs(v.x)) * smoothstep(0.30, 0.33, v.y) * smoothstep(0.44, 0.38, v.y) * (0.5 + 0.5 * noise(v.xy * 150.0));
      col = mix(col, srgb(0.86, 0.80, 0.66), 0.38 * dust); gl *= 1.0 - 0.7 * dust;
    }
    m.col = col * 0.72;
    float sm = smudge(p * 2.0);
    m.rough = mix(0.62, 0.34, gl) + 0.1 * sm;
    m.coat = gl * (0.8 + 0.2 * sm); m.coatRough = 0.13 + 0.06 * smudge(p * 1.7);
    return true;
  }
  if (id < 102.5) {
    // ebony: near black with a brown cast, polished by fingers on the board
    vec3 w = violinNeck(v);
    float streak = noise(vec3(v.x * 200.0, v.y * 6.0, v.z * 200.0));
    m.col = mix(srgb(0.085, 0.070, 0.065), srgb(0.17, 0.12, 0.09), 0.5 * streak) * (0.85 + 0.3 * noise(v * 40.0));
    m.rough = 0.30 + 0.16 * smudge(p * 3.0) + 0.1 * streak; m.coat = 0.35; m.coatRough = 0.12 + 0.1 * smudge(p);
    // frog: a mother-of-pearl eye
    vec3 b = violinBow(p);
    if (b.x < 0.14 && abs(b.y - 0.0085) < 0.012) {
      float eye = length(b.xy - vec2(0.086, 0.0085));
      if (eye < 0.0042 && abs(b.z) > 0.010) { m.col = srgb(0.80, 0.84, 0.82) * (0.8 + 0.4 * noise(p * 500.0)); m.rough = 0.15; m.coat = 1.0; }
      else if (eye < 0.0056 && abs(b.z) > 0.010) { m.col = srgb(0.6, 0.6, 0.62); m.metal = 1.0; m.rough = 0.25; }
    }
    return true;
  }
  if (id < 103.5) {
    // bridge: pale unvarnished maple, speckled, darker where it stands on the varnish
    float ray = noise(vec2(v.x * 70.0, v.z * 420.0));
    m.col = srgb(0.74, 0.60, 0.40) * (0.86 + 0.2 * ray) * (1.0 - 0.25 * smoothstep(0.80, 0.9, noise(vec2(v.x * 300.0, v.z * 300.0))));
    m.rough = 0.6;
    return true;
  }
  if (id < 104.5) {
    // strings: the three lower ones wound in silver, the E plain steel
    matMetal(m, n, p, 3, vec3(0, 1, 0));
    float wound = step(v.x, 0.012 + 0.012 * step(0.6, v.y) * 0.0);
    m.col = mix(srgb(0.80, 0.80, 0.82), srgb(0.78, 0.74, 0.66), wound) * (0.75 + 0.25 * wound * step(0.5, fract(v.y * 500.0)));
    m.rough = 0.22;
    // coloured silk wrapping at each end
    float silk = max(1.0 - smoothstep(0.262, 0.266, v.y), smoothstep(0.915, 0.918, v.y));
    if (silk > 0.0) { m.col = mix(m.col, v.x > 0.0 ? srgb(0.55, 0.10, 0.10) : srgb(0.12, 0.25, 0.50), silk); m.metal = 1.0 - silk; m.rough = mix(m.rough, 0.7, silk); }
    return true;
  }
  if (id < 105.5) {
    // pernambuco stick: dark orange-red, French polished; silver wire lapping and a leather thumb grip above the frog
    vec3 b = violinBow(p);
    matWood(m, n, p * 2.0, VIOLIN_BS, 0.62, 1.0);
    m.col = mix(m.col, srgb(0.50, 0.17, 0.06), 0.55) * (0.85 + 0.3 * noise(b.x * 30.0));
    if (b.x > 0.150 && b.x < 0.215) { float wr = fract(b.x * 420.0); m.col = srgb(0.78, 0.78, 0.80) * (0.7 + 0.3 * wr); m.metal = 1.0; m.rough = 0.25; m.coat = 0.0; n = normalize(n + 0.25 * (wr - 0.5) * VIOLIN_BS); }
    if (b.x > 0.132 && b.x <= 0.150) { m.col = srgb(0.09, 0.075, 0.07); m.rough = 0.6; m.coat = 0.1; m.metal = 0.0; }
    return true;
  }
  if (id < 106.5) {
    // horsehair: hundreds of pale strands, dusted with rosin
    vec3 b = violinBow(p);
    float strand = noise(b.z * 900.0 + 3.0 * noise(b.x * 6.0)), clump = noise(b.z * 160.0 + b.x * 2.0);
    m.col = srgb(0.82, 0.77, 0.64) * (0.62 + 0.4 * strand) * (0.8 + 0.25 * clump);
    m.rough = 0.6; m.sheen = 0.5; m.sheenCol = vec3(1.0, 0.95, 0.85);
    n = normalize(n + 0.4 * (strand - 0.5) * VIOLIN_BE);
    return true;
  }
  if (id < 107.5) { matMetal(m, n, p, 3, VIOLIN_BS); m.col = srgb(0.80, 0.80, 0.78); m.rough += 0.1; return true; }
  // ivory face on the bow's head
  m.col = srgb(0.84, 0.80, 0.68); m.rough = 0.35; m.coat = 0.4;
  return true;
}
