// Line-up of the supporting cast, to check the models: elf, board member, robot.
//@ w=1200 h=640 spp=80 ortho=2.9 pos=0,6.2,19.563 tgt=0,2.05,0 exposure=1.6
//@include models/elf.glsl
//@include models/board.glsl
//@include models/droid.glsl
#define NL 3
#define STEPK 0.7
Light getLight(int i) {
  if (i == 0) return spot(vec3(-4.0, 8.0, 5.0), 0.3, vec3(1.0, 0.76, 0.5) * 260.0, vec3(0.0, 1.5, 0.0), 28.0, 46.0);
  if (i == 1) return omni(vec3(7.0, 4.0, 9.0), 1.8, vec3(0.3, 0.45, 0.95) * 90.0);
  return omni(vec3(-6.0, 5.5, -3.0), 0.5, vec3(0.5, 0.65, 1.0) * 60.0);
}
vec3 sky(vec3 rd) { return vec3(0.02, 0.025, 0.045); }
const vec3 PE = vec3(-3.4, 0.0, 0.0), PB = vec3(0.0, 1.0, 0.0), PD = vec3(3.4, 0.0, 0.0);
float map(vec3 p) {
  float d = 1e9; gM = 0.0;
  add(d, p.z + 3.0, 1.0); add(d, p.y, 2.0);
  add(d, sdRBox(p - vec3(0.0, 0.5, 0.9), vec3(1.8, 0.5, 0.7), 0.03), 3.0);
  mElf(p - PE, d, vec3(-0.75, 0.9, 0.3), vec3(0.8, 1.9, 0.5), 0.0, 1.0);
  mBoard(p - PB, d, 1.0);
  mDroid(p - PD, d, 3.0);
  return d;
}
void shade(float id, vec3 p, inout vec3 n, inout Mat m) {
  if (shElf(id, p - PE, n, m)) return;
  if (shBoard(id, p - PB, n, m, srgb(0.35, 0.12, 0.45))) return;
  if (shDroid(id, p - PD, n, m)) return;
  if (id < 1.5) { matBrick(m, n, p, p.xy, srgb(0.11, 0.155, 0.30), 0.4); return; }
  if (id < 2.5) { matConcrete(m, n, p, srgb(0.2, 0.2, 0.22)); return; }
  matWood(m, n, p * 2.0, vec3(1, 0, 0), 0.75, 0.8);
}
