// One of the elf's red knitted mittens, reaching up from below the belt to push a gift. Sprite: 100 x 260 belt units,
// the top of the cuff at 112 units down from the top (see mitt() in hd-scene.js). The other hand is this one mirrored.
//@ w=300 h=780 spp=400 alpha=1 ortho=1.891 pos=0,3.89,19.563 tgt=0,-0.268,0 exposure=1.3
//@include rigs/belt.glsl
#define STEPK 0.6
float mittBody(vec3 p) {
  float d = sdEllipsoid(p - vec3(0.0, 0.66, 0.0), vec3(0.46, 0.76, 0.27));
  d = smin(d, sdEllipsoid(p - vec3(0.0, 0.3, 0.0), vec3(0.47, 0.5, 0.29)), 0.2);
  vec3 t = p - vec3(0.5, 0.52, 0.06); t.xy = rot(0.42) * t.xy;
  d = smin(d, sdEllipsoid(t, vec3(0.16, 0.36, 0.17)), 0.12);
  return d;
}
float map(vec3 p) {
  float d = 1e9; gM = 0.0;
  float bb = sdBox(p - vec3(0.05, -0.4, 0.0), vec3(0.85, 2.0, 0.5));
  if (bb > 0.1) return bb;
  float body = mittBody(p) - 0.012 * knit(p.xy, 15.0);
  add(d, body * 0.7, 1.0);
  // ribbed cuff, then the sleeve of his jumper going down out of frame
  float rib = 0.012 * sin(atan(p.x, p.z * 1.6) * 26.0);
  float cuff = sdEllipsoid(vec3(p.x, 0.0, p.z), vec3(0.5, 1.0, 0.31));
  cuff = max(cuff, abs(p.y + 0.02) - 0.13) - 0.03;
  add(d, (cuff - rib) * 0.7, 2.0);
  float sleeve = sdEllipsoid(vec3(p.x, 0.0, p.z), vec3(0.45, 1.0, 0.29));
  sleeve = max(sleeve, max(p.y + 0.12, -p.y - 2.4)) - 0.01 * knit(p.xy, 12.0);
  add(d, sleeve * 0.7, 3.0);
  return d;
}
void shade(float id, vec3 p, inout vec3 n, inout Mat m) {
  if (id < 1.5) { matKnit(m, n, p, p.xy, 15.0, srgb(0.60, 0.04, 0.04), vec3(1, 0, 0), vec3(0, 1, 0)); m.sheen = 0.25; return; }
  if (id < 2.5) { matKnit(m, n, p, vec2(atan(p.x, p.z * 1.6) * 0.5, p.y), 20.0, srgb(0.48, 0.035, 0.04), vec3(1, 0, 0), vec3(0, 1, 0)); m.sheen = 0.25; return; }
  matKnit(m, n, p, p.xy, 12.0, srgb(0.10, 0.36, 0.20), vec3(1, 0, 0), vec3(0, 1, 0));       // his green jumper
}
