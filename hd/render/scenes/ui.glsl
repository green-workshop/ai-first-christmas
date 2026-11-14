// Flat-on material shots for the page chrome. --D KIND=n picks one:
//  0 writing paper   1 manila card   2 brushed steel bezel   3 navy enamel plate   4 green enamel plate
//  5 blue key   6 orange key   7 cream key   8 sticky-note yellow paper   9 the room behind everything, out of focus   10 walnut desk top
//@ w=1200 h=800 spp=300 ortho=1.0 pos=0,0,10 tgt=0,0,0 exposure=1.25
#ifndef KIND
#define KIND 0
#endif
#define NL 3
#define STEPK 0.8
Light getLight(int i) {
#if KIND == 9
  if (i == 0) return spot(vec3(-0.6, 2.6, 3.0), 0.15, vec3(1.0, 0.72, 0.42) * 60.0, vec3(0.0, -0.4, 0.0), 30.0, 62.0);
  if (i == 1) return omni(vec3(6.0, 3.0, 8.0), 1.5, vec3(0.3, 0.45, 0.95) * 60.0);
  return omni(vec3(-6.0, 1.0, 6.0), 1.5, vec3(0.3, 0.4, 0.8) * 20.0);
#else
  if (i == 0) return omni(vec3(-4.5, 5.0, 7.0), 1.6, vec3(1.0, 0.93, 0.84) * 125.0);     // key: upper left, large and soft
  if (i == 1) return omni(vec3(5.0, -1.5, 8.0), 2.5, vec3(0.82, 0.88, 1.0) * 34.0);     // fill
  return omni(vec3(0.5, 6.5, 3.0), 2.2, vec3(1.0, 0.95, 0.9) * 22.0);                   // a grazing light from above, to pick out edges
#endif
}
vec3 sky(vec3 rd) { return vec3(0.05, 0.055, 0.07); }

float map(vec3 p) {
  float d = 1e9; gM = 0.0;
#if KIND <= 1 || KIND == 8
  add(d, p.z - 0.007 * (fbm(p.xy * 0.9 + 3.0) - 0.5), 1.0);        // a sheet, not quite flat
#elif KIND == 2 || KIND == 10
  add(d, p.z, 1.0);
#elif KIND == 3 || KIND == 4
  vec2 h = vec2(uRes.x / uRes.y, 1.0);
  add(d, sdRBox(p - vec3(0, 0, -0.1), vec3(h, 0.1), 0.11), 1.0);
  float fr = max(abs(sdBox2(p.xy, h - 0.11) - 0.06) - 0.035, abs(p.z - 0.005) - 0.022);       // raised brass frame
  add(d, fr - 0.006, 2.0);
  vec3 s = p; s.xy = abs(s.xy) - (h - 0.2);
  add(d, sdEllipsoid(s - vec3(0, 0, 0.012), vec3(0.055, 0.055, 0.028)), 2.0);                 // screws in the corners
  add(d, max(sdBox(s - vec3(0, 0, 0.04), vec3(0.06, 0.009, 0.012)), length(s.xy) - 0.05), 3.0);
#elif KIND >= 5 && KIND <= 7
  vec2 h = vec2(uRes.x / uRes.y, 1.0);
  float cap = sdRBox(p - vec3(0, 0.05, -0.25), vec3(h - 0.09, 0.3), 0.36);
  cap = smax(cap, -(length(p - vec3(0.0, 0.3, 6.08)) - 6.0), 0.2);                           // a shallow dish for the finger
  add(d, cap, 1.0);
  add(d, sdRBox(p - vec3(0, -0.03, -0.42), vec3(h, 0.3), 0.3), 2.0);                          // the skirt it sits in
#else
  float bid; float mortar = brickPattern(p.xy * 0.5, bid);
  add(d, p.z + 3.0 + 0.03 * mortar - 0.01 * bid, 1.0);
#endif
  return d;
}
void shade(float id, vec3 p, inout vec3 n, inout Mat m) {
#if KIND == 0
  float fib = fbm(p.xy * 90.0), speck = smoothstep(0.9, 0.97, noise(p.xy * 420.0));
  m.col = srgb(0.985, 0.96, 0.90) * (0.975 + 0.04 * fib) * (1.0 - 0.07 * speck) * (0.985 + 0.03 * fbm(p.xy * 2.0)); m.rough = 0.82;
  bumpN(n, p, 300.0, 0.16);
#elif KIND == 1
  float fib = fbm(p.xy * 70.0);
  m.col = srgb(0.88, 0.74, 0.52) * (0.95 + 0.08 * fib) * (0.96 + 0.07 * fbm(p.xy * 3.0)); m.rough = 0.72; bumpN(n, p, 260.0, 0.2);
#elif KIND == 8
  m.col = srgb(0.99, 0.86, 0.38) * (0.97 + 0.05 * fbm(p.xy * 60.0)); m.rough = 0.8; bumpN(n, p, 260.0, 0.14);
#elif KIND == 2
  matMetal(m, n, p * 0.35, 0, vec3(1, 0, 0)); m.col *= srgb(0.42, 0.45, 0.52); m.rough += 0.12;
#elif KIND == 10
  matWood(m, n, p * vec3(0.4, 2.4, 2.4), vec3(1.0, 0.03, 0.0), 0.82, 0.5); m.coatRough = 0.3;
#elif KIND == 3 || KIND == 4
  if (id < 1.5) {                                    // vitreous enamel: deep, glassy, very slightly uneven
    m.col = (KIND == 3 ? srgb(0.085, 0.115, 0.23) : srgb(0.05, 0.27, 0.18)) * (0.96 + 0.07 * fbm(p.xy * 1.6));
    m.rough = 0.45; m.coat = 0.85; m.coatRough = 0.24 + 0.04 * smudge(p * 0.7); bumpN(n, p, 70.0, 0.035);   // fine orange peel only: the face is stretched to fit, so nothing coarse
    float chip = smoothstep(0.93, 0.96, fbm(p.xy * 2.2 + 5.0) + 0.5 * smoothstep(0.75, 1.0, max(abs(p.x) / (uRes.x / uRes.y), abs(p.y))) * noise(p.xy * 9.0));
    m.col = mix(m.col, srgb(0.05, 0.04, 0.04), chip); m.coat *= 1.0 - chip;
  }
  else if (id < 2.5) { matMetal(m, n, p * 0.6, 1, vec3(1, 0, 0)); }
  else { m.col = srgb(0.1, 0.07, 0.03); m.metal = 1.0; m.rough = 0.4; }
#elif KIND >= 5 && KIND <= 7
  vec3 c = KIND == 5 ? srgb(0.22, 0.50, 0.86) : (KIND == 6 ? srgb(0.92, 0.47, 0.14) : srgb(0.90, 0.87, 0.80));
  if (id < 1.5) { m.col = c * (0.96 + 0.06 * fbm(p.xy * 1.5)); m.rough = 0.34 + 0.1 * smudge(p * 0.6); m.coat = 0.45; m.coatRough = 0.12; bumpN(n, p, 40.0, 0.12); }
  else { m.col = c * 0.3; m.rough = 0.5; }
#else
  matBrick(m, n, p * 0.5, p.xy * 0.5, srgb(0.11, 0.155, 0.30), 0.4);
#endif
}
