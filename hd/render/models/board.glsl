// A board member: a faceless grey resin figure in a tailored suit, the same for all five. Seated behind the table.
// Local space: the table top is y = 0 under them, they face +z, the head is about 3 up. Material ids 250..259.
// pose 0 hands on the table, 1 one hand raised, 2 both arms up (cheering), 3 hands together (clapping), 4 hands apart, 5 arms up and drawn in.
float mBoard(vec3 p, inout float d, float pose) {
  float bb = sdBox(p - vec3(0.0, 2.2, 0.3), vec3(2.2, 3.0, 1.5));
  if (bb > 0.2) { d = min(d, bb); return bb; }
  vec3 q = p; q.x = abs(q.x);
  // jacket: square shoulders, tapering down behind the table
  float jacket = sdRBox(p - vec3(0.0, 1.55, 0.0), vec3(1.05, 0.62, 0.5), 0.42);
  jacket = smin(jacket, sdEllipsoid(p - vec3(0.0, 0.5, 0.0), vec3(1.0, 1.3, 0.62)), 0.3);
  jacket = max(jacket, -p.y - 0.5);
  // the opening of the jacket: a V down to the button
  float vee = max(abs(p.x) * 1.5 - (2.05 - p.y) - 0.02, 0.75 - p.y);
  float open = max(vee, 0.3 - p.z);
  add(d, max(jacket, -open) - 0.003 * (noise(p * 120.0) - 0.5), 250.0);
  add(d, max(jacket + 0.045, vee + 0.02), 251.0);                                                // shirt
  // lapels: folded-back strips along the V
  vec3 lp = q - vec3(0.34, 1.5, 0.52); lp.xy = rot(-0.55) * lp.xy;
  add(d, sdRBox(lp, vec3(0.11, 0.5, 0.012), 0.012), 250.0);
  add(d, sdTorus(p - vec3(0.0, 2.12, 0.05), 0.3, 0.07), 251.0);                                   // shirt collar
  // tie
  vec3 t = p - vec3(0.0, 1.35, 0.6);
  float tie = sdRBox(t, vec3(0.1 + 0.07 * sat((0.5 - t.y) * 0.8), 0.6, 0.02), 0.02);
  tie = min(tie, sdRBox(p - vec3(0.0, 2.02, 0.58), vec3(0.11, 0.09, 0.04), 0.03));
  add(d, tie, 252.0);
  add(d, sdRCyl((p - vec3(0.0, 0.7, 0.66)).xzy, 0.055, 0.015, 0.01), 254.0);                       // jacket button
  // head and neck: smooth, no face
  add(d, smin(sdEllipsoid(p - vec3(0.0, 3.05, 0.02), vec3(0.62, 0.78, 0.66)), sdCyl(p - vec3(0.0, 2.25, 0.0), 0.24, 0.25), 0.12), 253.0);
  // arms
  vec3 sh = vec3(1.0, 1.95, 0.0), el, ha;
  for (int i = 0; i < 2; i++) {
    float s = i == 0 ? -1.0 : 1.0;
    bool up = (pose > 1.5 && pose < 2.5) || (pose > 0.5 && pose < 1.5 && i == 1);
    if (up) { el = vec3(1.55, 2.6, 0.1); ha = vec3(1.35, 3.9, 0.15); }
    else if (pose > 4.5) { el = vec3(1.66, 2.28, 0.2); ha = vec3(1.16, 3.38, 0.28); }             // 5: arms up but drawn down and in, the low point of a cheer
    else if (pose > 3.5) { el = vec3(1.38, 1.0, 0.55); ha = vec3(0.78, 1.5, 1.1); }               // 4: hands apart, between claps
    else if (pose > 2.5) { el = vec3(1.25, 1.0, 0.6); ha = vec3(0.2, 1.5, 1.15); }
    else { el = vec3(1.3, 0.75, 0.3); ha = vec3(0.62, 0.14, 1.05); }
    vec3 a = vec3(p.x * s, p.y, p.z);
    float arm = smin(sdCone(a, sh, el, 0.3, 0.25), sdCone(a, el, ha, 0.25, 0.2), 0.1);
    add(d, arm - 0.003 * (noise(p * 120.0) - 0.5), 250.0);
    vec3 dir = normalize(ha - el);
    add(d, sdCone(a, ha - dir * 0.02, ha + dir * 0.1, 0.17, 0.17), 251.0);                       // shirt cuff
    add(d, sdEllipsoid(a - ha - dir * 0.3, vec3(0.2, 0.17, 0.24)), 253.0);                        // hand
  }
  return bb;
}
bool shBoard(float id, vec3 p, inout vec3 n, inout Mat m, vec3 tie) {
  if (id < 249.5 || id > 259.5) return false;
  if (id < 250.5) { matCloth(m, n, p, p.xy * 0.6, srgb(0.085, 0.10, 0.15), 0.3); m.sheen = 0.12; float pin = smoothstep(0.46, 0.5, abs(fract(p.x * 9.0) - 0.5)); m.col *= 1.0 + 0.35 * pin; return true; }   // pinstripe
  if (id < 251.5) { matCloth(m, n, p, p.xy, srgb(0.86, 0.88, 0.92), 0.0); return true; }
  if (id < 252.5) { float st = step(0.5, fract((p.x + p.y) * 5.0)); m.col = tie * (0.75 + 0.35 * st); m.rough = 0.38; m.sheen = 0.9; m.sheenCol = mix(tie, vec3(1.0), 0.5); return true; }
  if (id < 253.5) { m.col = srgb(0.56, 0.60, 0.66) * (0.96 + 0.06 * fbm3(p * 5.0)); m.rough = 0.3 + 0.1 * smudge(p); m.coat = 0.45; m.coatRough = 0.1; return true; }           // grey resin
  m.col = srgb(0.05, 0.05, 0.06); m.rough = 0.3; m.coat = 0.5;
  return true;
}
