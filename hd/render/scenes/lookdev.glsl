// Look test: one teddy on the belt under the workshop's lamp.
//@ w=1100 h=820 spp=96 fov=20 pos=-0.55,0.95,5.0 tgt=0.02,0.60,0 aperture=0.035 focus=4.85 exposure=1.5 bloom=0.25 vignette=0.35
//@include models/teddy.glsl
#define NL 3
#define STEPK 0.62
#define FOG 0.012
Light getLight(int i) {
  if (i == 0) return spot(vec3(-2.2, 3.4, 2.2), 0.16, vec3(1.0, 0.74, 0.46) * 95.0, vec3(0.0, 0.5, 0.0), 22.0, 34.0);   // the pendant lamp
  if (i == 1) return omni(vec3(3.6, 1.5, 2.8), 0.9, vec3(0.30, 0.46, 0.95) * 9.0);                                      // cold window fill
  return omni(vec3(1.8, 2.4, -2.2), 0.3, vec3(0.75, 0.85, 1.0) * 16.0);                                                // rim
}
vec3 sky(vec3 rd) { return vec3(0.010, 0.014, 0.026); }

float map(vec3 p) {
  float d = 1e9; gM = 0.0;
  // belt: rubber slats with gaps
  float slat = abs(repLim(p.x + 0.11, 0.42, -40.0, 40.0)) - 0.2;
  float belt = max(p.y - 0.008 * smoothstep(0.0, 0.012, -slat), -p.y - 0.3);
  belt = max(belt, abs(p.z) - 0.95);
  add(d, belt, 10.0);
  // steel side rail in front of and behind the belt
  vec3 r = p - vec3(0, -0.07, 1.0); add(d, sdRBox(r, vec3(40.0, 0.085, 0.03), 0.012), 12.0);
  r = p - vec3(0, -0.07, -1.0); add(d, sdRBox(r, vec3(40.0, 0.085, 0.03), 0.012), 12.0);
  // back wall
  float bid; add(d, p.z + 3.4 + 0.012 * brickPattern(p.xy, bid), 11.0);
  mGift(p, d);
  return d;
}
void shade(float id, vec3 p, inout vec3 n, inout Mat m) {
  if (shGift(id, p, n, m)) return;
  if (id < 10.5) { matRubber(m, n, p, srgb(0.06, 0.063, 0.07)); float sc = fbm(p.xz * vec2(3.0, 90.0)); m.rough -= 0.25 * smoothstep(0.6, 0.8, sc); return; }
  if (id < 11.5) { matBrick(m, n, p, p.xy, srgb(0.13, 0.17, 0.30), 0.5); return; }
  matMetal(m, n, p, 0, vec3(1, 0, 0));
}
