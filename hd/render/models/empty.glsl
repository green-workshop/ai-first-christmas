// "[INSERT GIFT HERE]": a brushed-steel display plinth with nothing on it. Where the gift should be stands the outline of a
// box, made of white-enamelled sleeves threaded on thin steel wire so it reads as a dashed line, and in the middle a small
// white cross on a pin. The card holder on the front of the plinth is blank. Material ids 100..106.
const float emptyYaw = 0.42;
const vec3 emptyP = vec3(0.50, 0.05, 0.335);      // half size of the plinth top
const vec3 emptyF = vec3(0.40, 0.415, 0.245);     // half size of the outlined box
const float emptyTop = 0.125;                     // height of the plinth's top face
vec3 emptyLocal(vec3 p) { p.xz = rot(emptyYaw) * p.xz; return p; }
// one family of four parallel edges: a = along the edge, c = the other two coordinates measured from the edge
// returns the sleeves; wire = the wire they are threaded on
float emptyEdge(float a, vec2 c, float halfLen, float n, out float wire) {
  wire = max(length(c) - 0.0065, abs(a) - halfLen);
  float period = 2.0 * halfLen / n, ar = a - period * clamp(floor(a / period + 0.5 * mod(n, 2.0)) + 0.5 * (1.0 - mod(n, 2.0)), -0.5 * (n - 1.0), 0.5 * (n - 1.0));
  return sdRBox(vec3(ar, c), vec3(0.31 * period, 0.019, 0.019), 0.007);
}
void mGift(vec3 p, inout float d) {
  float bb = length(p - vec3(0.0, 0.50, 0.0)) - 0.80;
  if (bb > 0.15) { d = min(d, bb); return; }
  vec3 g = emptyLocal(p), a = abs(g), P = emptyP, F = emptyF;
  // plinth: a steel slab with a chamfered top edge, floating on a darker recessed foot
  float e = sdBox2(g.xz, P.xz - 0.02) - 0.02;
  float slab = sdBox2(vec2(e + 1.0, g.y - (emptyTop - P.y)), vec2(1.0 - 0.004, P.y - 0.004)) - 0.004;
  slab = smax(slab, (e + g.y - emptyTop + 0.012) * 0.7071, 0.004);
  add(d, slab, 100.0);
  add(d, sdRBox(g - vec3(0.0, 0.0125, 0.0), vec3(P.x - 0.035, 0.0125, P.z - 0.035), 0.004), 101.0);
  // four screws let into the top
  vec3 sc = vec3(a.x - (P.x - 0.045), g.y - emptyTop, a.z - (P.z - 0.045));
  add(d, sdEllipsoid(sc, vec3(0.014, 0.005, 0.014)), 101.0);
  // card holder on the front edge: a brass frame with a blank card in it
  vec3 ch = g - vec3(-0.02, emptyTop - P.y - 0.002, P.z);
  add(d, sdRBox(ch, vec3(0.135, 0.031, 0.006), 0.003), 102.0);
  add(d, sdRBox(ch - vec3(0.0, 0.0, 0.004), vec3(0.122, 0.021, 0.004), 0.002), 103.0);
  // the outline of the box that is not there
  vec3 f = vec3(g.x, g.y - emptyTop - F.y - 0.019, g.z), fa = abs(f) - F;
  float w1, w2, w3;
  float sl = emptyEdge(f.x, fa.yz, F.x - 0.035, 5.0, w1);
  sl = min(sl, emptyEdge(f.y, fa.xz, F.y - 0.035, 5.0, w2));
  sl = min(sl, emptyEdge(f.z, fa.xy, F.z - 0.035, 3.0, w3));
  add(d, sl, 104.0);
  add(d, sdRBox(fa, vec3(0.027), 0.008), 104.0);                                     // corner blocks
  add(d, min(w1, min(w2, w3)), 105.0);
  // the cross on its pin
  vec3 x = f - vec3(0.0, -0.03, 0.0);
  add(d, sdCapsule(f, vec3(0.0, -F.y - 0.02, 0.0), vec3(0.0, -0.03, -0.006), 0.0075), 105.0);
  vec3 x1 = x, x2 = x - vec3(0.0, 0.0, 0.012); x1.xy = rot(0.80) * x1.xy; x2.xy = rot(-0.76) * x2.xy;
  float cross = min(sdRBox(x1, vec3(0.155, 0.026, 0.006), 0.004), sdRBox(x2, vec3(0.155, 0.026, 0.006), 0.004));
  add(d, cross, 106.0);
  add(d, sdSphere(x - vec3(0.0, 0.0, 0.019), 0.011), 102.0);                          // the brass pin through both
}
bool shGift(float id, vec3 p, inout vec3 n, inout Mat m) {
  if (id < 100.0 || id >= 107.0) return false;
  vec3 g = emptyLocal(p);
  if (id < 100.5) {
    // brushed stainless: the brushing runs along the length, with fingermarks and a few scuffs
    matMetal(m, n, g, 0, vec3(1.0, 0.0, 0.0));
    m.col *= 1.12; m.rough += 0.22 + 0.2 * scratches(g * 0.7);
    return true;
  }
  if (id < 101.5) { matMetal(m, n, g, 2, vec3(1.0, 0.0, 0.0)); if (g.y > 0.05) { m.col = srgb(0.30, 0.30, 0.32); m.rough = 0.35; if (abs(g.x - sign(g.x) * (emptyP.x - 0.045) + 0.002 * sign(g.z)) < 0.0022) m.col *= 0.3; } return true; }
  if (id < 102.5) { matMetal(m, n, g, 1, vec3(1.0, 0.0, 0.0)); return true; }
  if (id < 103.5) { vec3 n0 = n; matPaper(m, n, g * 0.25, 0, srgb(0.93, 0.91, 0.84)); n = normalize(mix(n0, n, 0.3)); return true; }
  if (id < 104.5) {
    // white stove enamel, chipped here and there to the steel
    vec3 n0 = n;
    matPaint(m, n, g * 0.5, srgb(0.95, 0.94, 0.90), 0.6, 0.10, srgb(0.35, 0.35, 0.37), 0.8);
    n = normalize(mix(n0, n, 0.35));
    return true;
  }
  if (id < 105.5) { matMetal(m, n, g, 0, vec3(0.0, 1.0, 0.0)); m.col *= 0.75; return true; }
  // the cross: two painted wooden slats, brush marks along each
  vec3 n0 = n;
  matPaint(m, n, g * 0.5, srgb(0.95, 0.94, 0.90), 0.3, 0.16, srgb(0.62, 0.47, 0.30), 0.0);
  n = normalize(mix(n0, n, 0.35));
  return true;
}
