// A recruiting poster picture, not used by the game: Father Christmas, worn out, pointing straight at you, against a plain navy
// board, upright for a poster's round medallion. The pointing finger exists only here (models/fc.glsl FC_POINT).
// node darkroom.mjs scenes/poster.glsl --spp 220 --w 1000 --h 1040 --out out/poster/point.png
//@ w=1200 h=1250 spp=400 fov=27 pos=0,3.3,10.5 tgt=0,2.85,0 exposure=1.55 aperture=0.05 focus=8.4
#define FC_CUSTOM
const float FC_YAW = 0.0, FC_ROLL = 0.025, FC_NOD = -0.05; const vec2 FC_BROW = vec2(-0.03, -0.03); const vec2 FC_BROWR = vec2(0.26, -0.26); const int FC_EYES = 0; const vec2 FC_LOOK = vec2(0.0, 0.005);
const vec3 FC_EL = vec3(-1.4, 1.75, 1.45), FC_HL = vec3(-0.35, 2.3, 2.95), FC_ER = vec3(1.55, 0.95, 0.35), FC_HR = vec3(1.1, 0.1, 1.0);
#define FC_POINT vec3(0.2, 0.03, 1.0)
#define FC_WORN 1
//@include models/fc.glsl
#define NL 4
#define GLASS_ID 205.0
#define STEPK 0.7
Light getLight(int i) {
  if (i == 0) return spot(vec3(-2.6, 7.6, 8.0), 0.9, vec3(1.0, 0.76, 0.5) * 230.0, vec3(0.0, 2.5, 0.5), 28.0, 46.0);
  if (i == 1) return omni(vec3(6.5, 4.0, 9.0), 1.6, vec3(0.32, 0.45, 0.95) * 75.0);
  if (i == 2) return omni(vec3(1.5, 0.6, 6.0), 0.6, vec3(0.9, 0.8, 0.7) * 10.0);
  return omni(vec3(-5.0, 5.5, -2.0), 0.5, vec3(0.5, 0.65, 1.0) * 55.0);
}
vec3 sky(vec3 rd) { return vec3(0.015, 0.02, 0.04); }
float map(vec3 p) {
  float d = 1e9; gM = 0.0;
  add(d, p.z + 3.0, 1.0);
  mFC(p, d);
  return d;
}
void shade(float id, vec3 p, inout vec3 n, inout Mat m) {
  if (shFC(id, p, n, m)) return;
  matFelt(m, n, p, srgb(0.13, 0.18, 0.36));
}
