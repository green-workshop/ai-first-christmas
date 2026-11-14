// Portrait test of the Father Christmas puppet.
//@ w=900 h=1000 spp=120 ortho=3.0 pos=0,6.9,19.563 tgt=0,2.75,0 exposure=1.5 aperture=0.05 focus=20
//@include models/fc.glsl
#define NL 4
#define GLASS_ID 205.0
#define STEPK 0.7
Light getLight(int i) {
  if (i == 0) return spot(vec3(-3.2, 7.5, 3.0), 0.25, vec3(1.0, 0.74, 0.46) * 190.0, vec3(0.0, 2.6, 0.0), 26.0, 44.0);
  if (i == 1) return omni(vec3(6.0, 4.0, 8.0), 1.6, vec3(0.3, 0.45, 0.95) * 70.0);
  if (i == 2) return omni(vec3(3.5, 1.0, 1.5), 0.5, vec3(0.6, 0.75, 1.0) * 5.0);
  return omni(vec3(-5.0, 5.5, -3.0), 0.5, vec3(0.5, 0.65, 1.0) * 55.0);
}
vec3 sky(vec3 rd) { return vec3(0.015, 0.02, 0.04); }
float map(vec3 p) {
  float d = 1e9; gM = 0.0;
  add(d, p.z + 3.0, 1.0);
  add(d, sdRBox(p - vec3(0.0, -0.1, 1.6), vec3(6.0, 0.1, 1.6), 0.02), 2.0);
  mFC(p, d);
  return d;
}
void shade(float id, vec3 p, inout vec3 n, inout Mat m) {
  if (shFC(id, p, n, m)) return;
  if (id < 1.5) { matBrick(m, n, p, p.xy, srgb(0.11, 0.155, 0.30), 0.4); return; }
  matWood(m, n, p, vec3(1, 0, 0), 0.6, 0.6);
}
