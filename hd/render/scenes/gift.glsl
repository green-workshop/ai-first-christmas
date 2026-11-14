// One gift on the belt, as a sprite: transparent background, its shadow on the belt kept.
// The picture is the gift's square box in the game: 1.6 units wide, the belt top 87.5% of the way down.
// Use:  node darkroom.mjs scenes/gift.glsl --model teddy [--D HUE=srgb(0.8,0.1,0.1)]
// A model file defines  void mGift(vec3 p, inout float d)  and  bool shGift(float id, vec3 p, inout vec3 n, inout Mat m),
// fits inside x -0.62..0.62, y 0..1.25, z -0.5..0.5, stands on y = 0, and uses material ids 100..199.
//@ w=448 h=448 spp=400 alpha=1 ortho=0.8 pos=0,4.7714,19.563 tgt=0,0.6134,0 exposure=1.3
//@include rigs/belt.glsl
#define STEPK 0.7
#define TMAX 45.0
float map(vec3 p) {
  float d = 1e9; gM = 0.0;
  add(d, max(p.y, abs(p.z) - 0.55), 1.0);            // the belt, which only catches the shadow
  mGift(p, d);
  return d;
}
void shade(float id, vec3 p, inout vec3 n, inout Mat m) {
  if (shGift(id, p, n, m)) return;
  matRubber(m, n, p, srgb(0.085, 0.09, 0.10)); m.catcher = 1.0;
}
