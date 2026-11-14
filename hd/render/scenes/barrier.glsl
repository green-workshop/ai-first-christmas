// The barrier that drops at the right end of the belt when a gift is FINAL. Sprite: belt units x 720..800, y 80..230.
//@ w=240 h=450 spp=400 alpha=1 ortho=1.0909 pos=5.236,5.035,19.563 tgt=5.236,0.877,0 exposure=1.5
//@include rigs/belt.glsl
#define STEPK 0.8
const float BX = 5.396;
float map(vec3 p) {
  float d = 1e9; gM = 0.0;
  add(d, max(p.y, abs(p.z) - 0.55), 1.0);
  vec3 q = p - vec3(BX, 0.0, 0.0);
  vec3 s = q; s.x = abs(s.x) - 0.36;
  add(d, sdRBox(s - vec3(0.0, 0.84, 0.0), vec3(0.055, 0.86, 0.055), 0.012), 2.0);              // posts
  add(d, sdRBox(s - vec3(0.0, 0.012, 0.0), vec3(0.11, 0.012, 0.11), 0.006), 2.0);              // feet
  add(d, sdRBox(q - vec3(0.0, 0.83, 0.0), vec3(0.32, 0.68, 0.022), 0.02), 3.0);                // striped panel
  vec3 r = q - vec3(0.0, 0.83, 0.026); r.xy = abs(r.xy) - vec2(0.27, 0.63);
  add(d, sdEllipsoid(r, vec3(0.022, 0.022, 0.012)), 2.0);                                      // rivets
  add(d, sdRCyl(q - vec3(-0.36, 1.74, 0.0), 0.075, 0.03, 0.01), 2.0);
  add(d, sdEllipsoid(q - vec3(-0.36, 1.84, 0.0), vec3(0.085, 0.1, 0.085)), 4.0);               // beacon
  return d;
}
void shade(float id, vec3 p, inout vec3 n, inout Mat m) {
  if (id < 1.5) { matRubber(m, n, p, srgb(0.085, 0.09, 0.10)); m.catcher = 1.0; return; }
  if (id < 2.5) { matPaint(m, n, p, srgb(0.13, 0.15, 0.19), 0.5, 0.6, srgb(0.5, 0.48, 0.45), 1.0); return; }
  if (id < 3.5) {
    float st = step(0.5, fract((p.x + p.y) * 2.6));
    matPaint(m, n, p, mix(srgb(0.05, 0.05, 0.055), srgb(0.93, 0.66, 0.08), st), 0.8, 0.4, srgb(0.5, 0.48, 0.45), 1.0);
    return;
  }
  m.col = srgb(0.5, 0.05, 0.03); m.rough = 0.1; m.coat = 1.0; m.emit = vec3(1.0, 0.25, 0.08) * 3.0; m.glow = vec3(1.0, 0.3, 0.1) * 8.0;
}
