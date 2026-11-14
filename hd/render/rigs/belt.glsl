// The belt bay's lights, shared by the set and by every gift sprite so they match.
// World: 1 belt unit (the engine's 800-wide lane) = 0.0145455. Belt top is y = 0, the gift lane is z = 0, the camera looks down 12 degrees.
#define UX(u) (((u) - 400.0) * 0.0145455)
#define UY(u, z) ((214.0 - (u)) * 0.014871 + (z) * 0.21256)
#define NL 6
const vec3 LAMP = vec3(-0.727, 3.45, 0.25);
Light getLight(int i) {
  if (i == 0) return spot(LAMP, 0.07, vec3(1.0, 0.72, 0.42) * 150.0, LAMP + vec3(0.05, -1.0, 0.06), 32.0, 54.0);   // pendant work lamp
  if (i == 1) return omni(vec3(7.5, 5.0, 9.0), 1.6, vec3(0.28, 0.42, 0.95) * 170.0);                              // moonlight from the stairwell
  if (i == 2) return omni(vec3(-6.5, 4.6, -0.6), 0.5, vec3(0.45, 0.6, 1.0) * 40.0);                              // cold rim from the back left
  if (i == 3) return omni(vec3(-1.0, 2.2, 11.0), 2.2, vec3(1.0, 0.86, 0.72) * 60.0);                             // big soft fill from the room in front
  if (i == 4) return spot(vec3(2.2, 5.4, 1.6), 0.2, vec3(1.0, 0.8, 0.55) * 52.0, vec3(2.3, 0.0, -0.6), 16.0, 30.0);
  return spot(vec3(-4.3, 3.6, 3.2), 0.3, vec3(1.0, 0.66, 0.36) * 34.0, vec3(-5.2, 0.2, 0.6), 18.0, 34.0);                   // warm wash on the packing cabinet          // small spot on the hopper
}
#ifdef INSPECT
vec3 sky(vec3 rd) { return vec3(0.55) * (0.6 + 0.4 * rd.y); }
#else
vec3 sky(vec3 rd) { return mix(vec3(0.012, 0.016, 0.03), vec3(0.02, 0.028, 0.055), sat(rd.y * 0.5 + 0.5)); }
#endif
