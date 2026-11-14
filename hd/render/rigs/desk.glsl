// Father Christmas's corner of the basement. World: 1 desk unit (the engine's 400-wide panel) = 0.03.
// The desk top is y = 0 and its front edge is z = 0; the camera looks down 12 degrees.
#define DX(u) (((u) - 200.0) * 0.03)
#define DY(u, z) (((228.0 - (u)) * 0.03 + (z) * 0.20791) / 0.97815)
#define NL 5
const vec3 DLAMP = vec3(-0.21, 5.95, -1.0);
const vec3 FCPOS = vec3(1.56, 0.0, -2.9);
Light getLight(int i) {
  if (i == 0) return spot(DLAMP, 0.1, vec3(1.0, 0.72, 0.42) * 300.0, vec3(1.5, 2.4, -2.3), 30.0, 54.0);          // pendant lamp, up and to his right
  if (i == 1) return spot(vec3(-1.95, 4.5, -4.6), 0.12, vec3(0.42, 0.58, 1.0) * 330.0, vec3(-3.7, -2.05, 0.3), 10.0, 19.0);   // moonlight through the window onto the rejects
  if (i == 2) return omni(vec3(-1.0, 3.5, 13.0), 2.6, vec3(1.0, 0.86, 0.72) * 150.0);                              // soft fill from the room
  if (i == 3) return omni(vec3(4.2, 1.2, -1.85), 0.45, vec3(0.62, 0.78, 1.0) * 5.0);                              // the laptop screen
  return omni(vec3(8.5, 6.5, -2.5), 0.8, vec3(0.4, 0.55, 1.0) * 60.0);                                           // cold rim
}
#ifdef INSPECT
vec3 sky(vec3 rd) { return vec3(0.55) * (0.6 + 0.4 * rd.y); }
#else
vec3 sky(vec3 rd) { return mix(vec3(0.012, 0.016, 0.03), vec3(0.02, 0.028, 0.055), sat(rd.y * 0.5 + 0.5)); }
#endif
