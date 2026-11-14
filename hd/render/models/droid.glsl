// The workshop robot: a small tracked machine in white enamel with a dark visor and two amber eyes.
// Local space: stands at the origin on y = 0, faces +z, about 2.9 tall with its aerial. Material ids 260..279.
// carry 0 nothing, 1 a brass key, 2 a clipboard, 3 a spanner, 4 a hammer (held in its one arm, screen right).
// #define DROID_SWING 1.0 brings the hand down (the second frame of hammering); 0 is raised.
#ifndef DROID_SWING
#define DROID_SWING 0.0
#endif
// the hammer swing: where the hand is and how the hammer leans, raised and down (see mDroid)
#ifndef DR_UP
#define DR_UP 1.15, 2.0, 0.7
#define DR_DN 1.15, 1.70, 0.85
#define DR_AUP -0.3
#define DR_ADN 1.75
#endif
float mDroid(vec3 p, inout float d, float carry) {
  float bb = sdBox(p - vec3(0.2, 1.65, 0.15), vec3(1.7, 1.9, 1.25));
  if (bb > 0.2) { d = min(d, bb); return bb; }
  vec3 q = p; q.x = abs(q.x);
  // tracks
  vec3 t = q - vec3(0.66, 0.3, 0.0);
  float pod = sdRBox(t, vec3(0.2, 0.3, 0.72), 0.26);
  float rib = 0.018 * sin((abs(t.y) > 0.2 ? t.z : t.y) * 34.0);
  add(d, (pod - rib * step(0.24, max(abs(t.y), abs(t.z) - 0.42))) * 0.8, 262.0);
  vec3 w = t - vec3(0.21, -0.02, 0.0); w.z = repLim(w.z, 0.42, -1.0, 1.0);
  add(d, sdRCyl(w.yxz, 0.17, 0.02, 0.012), 263.0);                                            // wheels showing on the side of the track
  // body
  float body = sdRBox(p - vec3(0.0, 1.2, 0.0), vec3(0.6, 0.56, 0.5), 0.3);
  body = max(body, -max(abs(p.y - 1.02) - 0.006, 0.44 - p.z));                                 // panel line
  add(d, body, 260.0);
  add(d, sdRBox(p - vec3(-0.2, 1.3, 0.5), vec3(0.16, 0.09, 0.012), 0.02), 264.0);                // badge
  vec3 v = p - vec3(0.25, 1.3, 0.5); v.y = repLim(v.y, 0.07, -1.0, 1.0);
  add(d, sdBox(v, vec3(0.13, 0.014, 0.02)), 262.0);                                           // vent
  add(d, sdRCyl(p - vec3(0.0, 1.84, 0.0), 0.3, 0.06, 0.02), 264.0);                              // brass neck ring
  // head: a dome with a visor
  vec3 h = p - vec3(0.0, 2.2, 0.0);
  float head = max(sdEllipsoid(h, vec3(0.56, 0.5, 0.52)), -h.y - 0.3);
  add(d, head, 260.0);
  float visor = max(sdEllipsoid(h - vec3(0.0, 0.02, 0.06), vec3(0.5, 0.2, 0.5)), 0.2 - h.z);
  add(d, visor, 261.0);
  vec3 e = vec3(abs(h.x) - 0.19, h.y - 0.03, h.z - 0.5);
  add(d, sdEllipsoid(e, vec3(0.075, 0.075, 0.05)), 265.0);
  add(d, sdCapsule(h, vec3(0.2, 0.42, 0.0), vec3(0.26, 0.86, 0.0), 0.014), 263.0);
  add(d, sdSphere(h - vec3(0.26, 0.9, 0.0), 0.06), 266.0);
  // arm (screen right) with a two-finger grip
  vec3 sh = vec3(0.72, 1.45, 0.05), el = vec3(1.05, 1.0, 0.35), ha = vec3(1.0, 1.4 - 0.5 * DROID_SWING, 0.72 + 0.12 * DROID_SWING);
  float ta = -0.5, ts = 1.0;                             // how the tool leans in the hand, and its size
  if (carry > 3.5) {
    // hammering: a real swing. Raised, the hammer stands up over its shoulder; down, it lies across in front of its chest with the
    // head on the toy (the game puts the toy there: hd-interlude.js builder()). DROID_SWING runs from one to the other.
    float sw = float(DROID_SWING);
    el = mix(vec3(1.2, 1.25, 0.3), vec3(1.2, 1.3, 0.55), sw);
    ha = mix(vec3(DR_UP), vec3(DR_DN), sw);
    ta = mix(float(DR_AUP), float(DR_ADN), sw); ts = 1.45;
  }
  add(d, sdSphere(p - sh, 0.13), 263.0);
  add(d, min(sdCapsule(p, sh, el, 0.065), sdCapsule(p, el, ha, 0.055)), 263.0);
  add(d, sdSphere(p - el, 0.085), 264.0);
  vec3 g = p - ha;
  add(d, min(sdCapsule(g, vec3(-0.07, 0.0, 0.0), vec3(-0.08, 0.14, 0.04), 0.03), sdCapsule(g, vec3(0.07, 0.0, 0.0), vec3(0.08, 0.14, 0.04), 0.03)), 263.0);
  if (carry > 0.5 && carry < 1.5) {                                                           // key
    float key = min(sdTorus((g - vec3(0.0, 0.36, 0.02)).xzy, 0.1, 0.03), sdCapsule(g, vec3(0.0, 0.06, 0.02), vec3(0.0, 0.26, 0.02), 0.028));
    add(d, min(key, sdBox(g - vec3(0.05, 0.08, 0.02), vec3(0.05, 0.03, 0.02))), 264.0);
  } else if (carry > 1.5 && carry < 2.5) {                                                    // clipboard with a sheet
    vec3 c = g - vec3(-0.05, 0.3, 0.06); c.xy = rot(0.15) * c.xy;
    add(d, sdRBox(c, vec3(0.26, 0.34, 0.015), 0.02), 267.0);
    add(d, sdRBox(c - vec3(0.0, -0.02, 0.02), vec3(0.22, 0.28, 0.004), 0.004), 268.0);
    add(d, sdRBox(c - vec3(0.0, 0.3, 0.03), vec3(0.1, 0.035, 0.02), 0.01), 263.0);
  } else if (carry > 2.5) {                                                                   // spanner or hammer
    vec3 c = g - vec3(0.0, 0.1, 0.02); c.xy = rot(ta) * c.xy; c /= ts;
    float tool = sdRBox(c - vec3(0.0, 0.3, 0.0), vec3(0.035, 0.36, 0.02), 0.015);
    if (carry < 3.5) tool = min(tool, max(sdRCyl((c - vec3(0.0, 0.7, 0.0)).xzy, 0.11, 0.02, 0.008), -sdBox(c - vec3(0.0, 0.78, 0.0), vec3(0.045, 0.08, 0.1))));
    else tool = min(tool, sdRBox(c - vec3(0.0, 0.68, 0.0), vec3(0.16, 0.075, 0.07), 0.02));
    add(d, tool * ts, carry < 3.5 ? 263.0 : 262.0);
  }
  return bb;
}
bool shDroid(float id, vec3 p, inout vec3 n, inout Mat m) {
  if (id < 259.5 || id > 279.5) return false;
  if (id < 260.5) { matPaint(m, n, p, srgb(0.88, 0.89, 0.90), 0.9, 0.3, srgb(0.4, 0.4, 0.42), 1.0); return true; }
  if (id < 261.5) { m.col = srgb(0.02, 0.025, 0.035); m.rough = 0.06; m.coat = 1.0; m.coatRough = 0.03; return true; }
  if (id < 262.5) { matRubber(m, n, p, srgb(0.05, 0.05, 0.055)); return true; }
  if (id < 263.5) { matMetal(m, n, p, 0, vec3(0, 1, 0)); return true; }
  if (id < 264.5) { matMetal(m, n, p, 1, vec3(1, 0, 0)); return true; }
  if (id < 265.5) { m.col = vec3(0.1, 0.05, 0.0); m.rough = 0.1; m.coat = 1.0; m.emit = vec3(1.0, 0.62, 0.2) * 3.0; m.glow = vec3(1.0, 0.65, 0.25) * 6.0; return true; }
  if (id < 266.5) { m.col = srgb(0.6, 0.05, 0.04); m.rough = 0.15; m.coat = 1.0; m.emit = vec3(1.0, 0.1, 0.05) * 0.6; return true; }
  if (id < 267.5) { matWood(m, n, p * 3.0, vec3(0, 1, 0), 0.5, 0.3); return true; }
  matPaper(m, n, p, 0, srgb(0.94, 0.92, 0.86));
  return true;
}
