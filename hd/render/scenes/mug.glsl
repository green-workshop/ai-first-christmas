// A coffee mug on Father Christmas's desk. Sprite: 28 x 28 desk units, the mug's base 83.9% of the way down.
// --hue recolours it; the plain one is off-white.
//@ w=112 h=112 spp=600 alpha=1 ortho=0.42 pos=0.12,4.4494,18.763 tgt=0.12,0.2914,-0.8 exposure=2.3
//@include rigs/desk.glsl
#ifndef HUE
#define HUE srgb(0.90, 0.87, 0.80)
#endif
#define STEPK 0.8
const vec3 MUG = vec3(0.12, 0.0, -0.8);
float map(vec3 p) {
  float d = 1e9; gM = 0.0;
  add(d, p.y, 1.0);
  vec3 q = p - MUG;
  float cup = sdRCyl(q - vec3(0.0, 0.255, 0.0), 0.215, 0.255, 0.04);
  cup = max(cup, -sdRCyl(q - vec3(0.0, 0.34, 0.0), 0.18, 0.26, 0.04));
  add(d, cup, 2.0);
  vec3 h = q - vec3(0.24, 0.26, 0.0);
  add(d, max(sdTorus(h.xzy, 0.125, 0.035), -h.x - 0.0), 2.0);
  add(d, sdCyl(q - vec3(0.0, 0.4, 0.0), 0.182, 0.02), 3.0);
  return d;
}
void shade(float id, vec3 p, inout vec3 n, inout Mat m) {
  if (id < 1.5) { matWood(m, n, p * vec3(0.35, 2.6, 2.6) + vec3(0.0, 3.0, 1.0), vec3(1.0, 0.02, 0.03), 0.8, 0.8); m.catcher = 1.0; return; }
  if (id < 2.5) {
    vec3 q = p - MUG; float stain = smoothstep(0.42, 0.5, q.y + 0.03 * noise(q * 30.0)) * step(length(q.xz), 0.2);
    m.col = HUE * (0.92 + 0.1 * fbm3(p * 12.0)); m.col = mix(m.col, m.col * srgb(0.6, 0.45, 0.3), 0.5 * stain);
    m.rough = 0.22 + 0.15 * smudge(p * 3.0); m.coat = 0.9; m.coatRough = 0.06;
    return;
  }
  m.col = srgb(0.10, 0.05, 0.025); m.rough = 0.08; m.coat = 1.0;
}
