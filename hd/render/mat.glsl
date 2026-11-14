// ---- material library: every surface in the game is built from these ----
// Each function fills a Mat for a point p (in the object's own space, 1 unit is about 30 cm) and may roughen the normal n.
// They all add the small flaws a photograph has: uneven gloss, dust, scratches, fibres.

// fine random tilt of the normal: scale = size of the grains, amt = strength
void grainN(inout vec3 n, vec3 p, float scale, float amt) { n = normalize(n + amt * (hash3(floor(p * scale)) - 0.5)); }
void bumpN(inout vec3 n, vec3 p, float scale, float amt) {
  float e = 0.35 / scale, h = noise(p * scale);
  vec3 g = vec3(noise((p + vec3(e, 0, 0)) * scale) - h, noise((p + vec3(0, e, 0)) * scale) - h, noise((p + vec3(0, 0, e)) * scale) - h) / e;
  n = normalize(n - amt * (g - n * dot(g, n)) / scale);
}
// smudges and handling marks: returns 0..1, use it to vary roughness
float smudge(vec3 p) { return smoothstep(0.35, 0.75, fbm3(p * 3.1 + 4.0)) * 0.6 + 0.4 * noise(p * 23.0); }
// hairline scratches running every way
float scratches(vec3 p) {
  float s = 0.0;
  for (int i = 0; i < 3; i++) { vec2 q = rot(1.1 * float(i) + 0.4) * (p.xy + p.zx * 0.7) * (60.0 + 37.0 * float(i)); s = max(s, smoothstep(0.985, 1.0, noise(vec2(q.x, q.y * 0.02)))); }
  return s;
}

// --- wood: `along` is the direction of the grain. tone 0 pale pine .. 1 dark walnut. lacquer 0 raw .. 1 glossy varnish
void matWood(inout Mat m, inout vec3 n, vec3 p, vec3 along, float tone, float lacquer) {
  vec3 a = normalize(along), u = normalize(cross(a, vec3(0.31, 0.83, 0.47))), v = cross(a, u);
  vec3 q = vec3(dot(p, u), dot(p, v), dot(p, a));
  q.xy += 0.35 * vec2(noise(q.z * 0.9 + 3.0), noise(q.z * 0.9 + 9.0)) + 0.05 * fbm3(q * vec3(4.0, 4.0, 0.6));
  float r = length(q.xy + vec2(0.9, 0.35)) * 9.0;
  float ring = r + 0.6 * fbm3(vec3(q.xy * 3.0, q.z * 0.35));
  float late = smoothstep(0.55, 0.95, fract(ring)) * (1.0 - smoothstep(0.95, 1.0, fract(ring)));   // dark latewood band
  float fibre = noise(vec3(q.xy * 140.0, q.z * 3.0));
  float pore = smoothstep(0.72, 0.9, noise(vec3(q.xy * 90.0, q.z * 2.2))) * (0.4 + 0.6 * late);
  vec3 pale = mix(srgb(0.80, 0.62, 0.38), srgb(0.36, 0.20, 0.10), tone), dark = mix(srgb(0.55, 0.36, 0.18), srgb(0.17, 0.085, 0.045), tone);
  m.col = mix(pale, dark, late * 0.75 + 0.18 * fbm3(q * vec3(2.0, 2.0, 0.2))) * (0.86 + 0.24 * fibre) * (1.0 - 0.35 * pore);
  m.rough = mix(0.62, 0.36, lacquer) + 0.14 * fibre + 0.1 * pore;
  m.coat = lacquer * (0.9 - 0.5 * pore) * (0.75 + 0.25 * smudge(p)); m.coatRough = 0.09 + 0.1 * smudge(p * 1.7);
  n = normalize(n + (1.0 - 0.7 * lacquer) * 0.07 * (fibre - 0.5) * u + 0.05 * pore * v);
}

// --- painted wood or metal with chips at random spots showing what is underneath. wear 0 new .. 1 battered
void matPaint(inout Mat m, inout vec3 n, vec3 p, vec3 col, float gloss, float wear, vec3 under, float underMetal) {
  float peel = fbm3(p * 5.0) * 0.6 + 0.4 * noise(p * 31.0);
  float chip = smoothstep(1.0 - 0.42 * wear, 1.0 - 0.42 * wear + 0.02, peel);
  float orange = noise(p * 85.0);
  m.col = col * (0.9 + 0.16 * fbm3(p * 2.3)) * (0.97 + 0.06 * orange);
  m.rough = mix(0.5, 0.16, gloss) + 0.14 * smudge(p) + 0.25 * scratches(p);
  m.coat = gloss * 0.6; m.coatRough = 0.06 + 0.08 * smudge(p * 2.0);
  bumpN(n, p, 70.0, 0.25 * (1.0 - chip));
  if (chip > 0.0) { m.col = mix(m.col, under * (0.7 + 0.5 * noise(p * 60.0)), chip); m.metal = underMetal * chip; m.rough = mix(m.rough, 0.55, chip); m.coat *= 1.0 - chip; }
}

// --- moulded toy plastic
void matPlastic(inout Mat m, inout vec3 n, vec3 p, vec3 col, float gloss) {
  m.col = col * (0.95 + 0.08 * fbm3(p * 3.0));
  m.rough = mix(0.5, 0.12, gloss) + 0.16 * smudge(p) + 0.3 * scratches(p);
  m.coat = 0.35 * gloss; m.coatRough = 0.05;
  bumpN(n, p, 120.0, 0.12);
}

// --- bare metal. kind: 0 brushed steel, 1 polished brass, 2 dark cast iron, 3 chrome, 4 copper
void matMetal(inout Mat m, inout vec3 n, vec3 p, int kind, vec3 brushDir) {
  vec3 a = normalize(brushDir); float along = dot(p, a); vec3 across = p - a * along;
  float brush = noise(vec3(across * 520.0 + 3.0) + a * along * 4.0);
  float sm = smudge(p), tarnish = smoothstep(0.45, 0.8, fbm3(p * 2.6 + 11.0));
  m.metal = 1.0;
  if (kind == 0) { m.col = srgb(0.62, 0.63, 0.66) * (0.88 + 0.2 * brush); m.rough = 0.28 + 0.16 * brush + 0.12 * sm; n = normalize(n + 0.05 * (brush - 0.5) * normalize(cross(a, n) + 1e-4)); }
  else if (kind == 1) { m.col = mix(srgb(0.93, 0.70, 0.30), srgb(0.55, 0.38, 0.16), 0.6 * tarnish); m.rough = 0.16 + 0.2 * tarnish + 0.12 * sm + 0.25 * scratches(p); }
  else if (kind == 2) { m.col = srgb(0.10, 0.105, 0.115) * (0.8 + 0.5 * noise(p * 40.0)); m.rough = 0.55 + 0.2 * noise(p * 90.0); m.metal = 0.85; bumpN(n, p, 150.0, 0.5); }
  else if (kind == 3) { m.col = srgb(0.86, 0.87, 0.89); m.rough = 0.05 + 0.1 * sm + 0.2 * scratches(p); }
  else { m.col = mix(srgb(0.90, 0.50, 0.33), srgb(0.42, 0.50, 0.40), 0.5 * tarnish); m.rough = 0.2 + 0.25 * tarnish + 0.1 * sm; }
}

// --- rubber and soft matt things
void matRubber(inout Mat m, inout vec3 n, vec3 p, vec3 col) {
  float dust = smoothstep(0.5, 0.85, fbm3(p * 6.0));
  m.col = mix(col, col + 0.05, 0.5 * dust) * (0.85 + 0.3 * noise(p * 50.0)); m.rough = 0.62 + 0.25 * dust;
  bumpN(n, p, 160.0, 0.3);
}

// --- wool felt: matt, fuzzy at the edge, fibres visible close up
void matFelt(inout Mat m, inout vec3 n, vec3 p, vec3 col) {
  float f = noise(p * 210.0), g = fbm3(p * 14.0);
  m.col = col * (0.72 + 0.4 * g) * (0.82 + 0.3 * f); m.rough = 0.95;
  m.sheen = 0.9; m.sheenCol = mix(col, vec3(1.0), 0.55);
  n = normalize(n + 0.42 * (hash3(p * 811.0) - 0.5));
}

// --- knitted wool. uv are coordinates on the cloth: u across the rows, v along the columns; `gauge` = stitches per unit
// returns the height of the stitch (0..1) so a model can also push the surface out by it
float knit(vec2 uv, float gauge) {
  vec2 q = uv * gauge; q.y *= 1.35;
  float col = floor(q.x), row = q.y + 0.5 * mod(col, 2.0) * 0.0;
  vec2 f = vec2(fract(q.x) - 0.5, fract(row) - 0.5);
  float v = abs(f.x) * 1.9 - f.y;                       // the V of a stocking stitch
  float leg = 1.0 - smoothstep(0.0, 0.42, abs(fract(v) - 0.5) * 2.0 - 0.1);
  float gap = smoothstep(0.42, 0.5, abs(f.x));
  return leg * (1.0 - 0.75 * gap);
}
void matKnit(inout Mat m, inout vec3 n, vec3 p, vec2 uv, float gauge, vec3 col, vec3 tu, vec3 tv) {
  float e = 0.12 / gauge, h = knit(uv, gauge);
  float hx = knit(uv + vec2(e, 0), gauge) - h, hy = knit(uv + vec2(0, e), gauge) - h;
  n = normalize(n - 0.55 * (hx * tu + hy * tv) / (e * gauge) * 0.35);
  float fz = noise(p * 260.0);
  m.col = col * (0.5 + 0.6 * h) * (0.85 + 0.25 * fz) * (0.9 + 0.2 * fbm3(p * 5.0));
  m.rough = 0.93; m.sheen = 0.8; m.sheenCol = mix(col, vec3(1.0), 0.5);
  n = normalize(n + 0.3 * (hash3(p * 700.0) - 0.5));
}

// --- woven cloth (cotton, flannel): fine over-and-under threads
void matCloth(inout Mat m, inout vec3 n, vec3 p, vec2 uv, vec3 col, float fuzz) {
  vec2 q = uv * 190.0; float w = 0.5 + 0.5 * sin(q.x * TAU) * sin(q.y * TAU);
  m.col = col * (0.78 + 0.3 * w) * (0.9 + 0.18 * fbm3(p * 7.0)); m.rough = 0.88;
  m.sheen = 0.35 + 0.6 * fuzz; m.sheenCol = mix(col, vec3(1.0), 0.5);
  n = normalize(n + (0.1 + 0.3 * fuzz) * (hash3(p * 650.0) - 0.5));
}

// --- paper and card. kind: 0 writing paper, 1 manila card, 2 corrugated cardboard, 3 glossy wrapping paper
void matPaper(inout Mat m, inout vec3 n, vec3 p, int kind, vec3 col) {
  float fib = fbm3(p * vec3(60.0, 60.0, 60.0)), speck = smoothstep(0.86, 0.95, noise(p * 300.0));
  m.col = col * (0.93 + 0.1 * fib) * (1.0 - 0.12 * speck * float(kind != 3)); m.rough = 0.8;
  if (kind == 1) { m.rough = 0.7; }
  if (kind == 2) { m.col *= 0.9 + 0.16 * noise(p * vec3(8.0, 240.0, 8.0)); m.rough = 0.86; }
  if (kind == 3) { m.rough = 0.24 + 0.12 * smudge(p); m.coat = 0.5; m.coatRough = 0.1; }
  bumpN(n, p, kind == 3 ? 30.0 : 140.0, kind == 3 ? 0.5 : 0.35);
}

// --- leather
void matLeather(inout Mat m, inout vec3 n, vec3 p, vec3 col, float gloss) {
  vec2 c = voronoi(p * 70.0); float crack = smoothstep(0.0, 0.5, c.x);
  m.col = col * (0.6 + 0.4 * crack) * (0.85 + 0.25 * fbm3(p * 4.0)); m.rough = mix(0.6, 0.3, gloss) + 0.15 * (1.0 - crack);
  m.coat = 0.4 * gloss; m.coatRough = 0.14;
  bumpN(n, p, 70.0, 0.9);
}

// --- brick wall facing +z, painted. uv = wall coordinates in units; returns mortar amount 0..1 (use it to sink the joints)
float brickPattern(vec2 uv, out float id) {
  vec2 q = uv * vec2(2.6, 6.2); float row = floor(q.y); q.x += 0.5 * mod(row, 2.0) + 0.13 * hash1(row);
  vec2 f = fract(q) - 0.5; id = hash1(floor(q) + 3.3);
  vec2 e = (0.5 - abs(f)) * vec2(1.0 / 2.6, 1.0 / 6.2);
  return 1.0 - smoothstep(0.004, 0.011, min(e.x, e.y) + 0.004 * (noise(uv * 40.0) - 0.5));
}
void matBrick(inout Mat m, inout vec3 n, vec3 p, vec2 uv, vec3 paint, float wear) {
  float id; float mortar = brickPattern(uv, id);
  float face = fbm3(p * 22.0), pit = smoothstep(0.62, 0.8, noise(p * 60.0));
  float peel = smoothstep(1.0 - 0.5 * wear, 1.02 - 0.5 * wear, fbm3(p * 3.4 + id * 9.0) * 0.7 + 0.3 * noise(p * 19.0));
  vec3 clay = mix(srgb(0.52, 0.24, 0.16), srgb(0.38, 0.19, 0.14), id) * (0.75 + 0.5 * face);
  vec3 c = mix(paint * (0.72 + 0.5 * id) * (0.85 + 0.3 * face), clay, peel);
  m.col = mix(c * (1.0 - 0.3 * pit), srgb(0.33, 0.32, 0.31) * (0.6 + 0.6 * face), mortar);
  m.rough = mix(0.62, 0.92, max(mortar, peel)) + 0.1 * face;
  bumpN(n, p, 45.0, 1.3); bumpN(n, p, 190.0, 0.6);
}

// --- poured concrete / cement floor
void matConcrete(inout Mat m, inout vec3 n, vec3 p, vec3 col) {
  float a = fbm3(p * 3.0), b = fbm3(p * 28.0), stain = smoothstep(0.5, 0.8, fbm3(p * 1.3 + 7.0));
  m.col = col * (0.72 + 0.5 * a) * (0.85 + 0.3 * b) * (1.0 - 0.35 * stain); m.rough = 0.78 - 0.3 * stain + 0.1 * b;
  bumpN(n, p, 60.0, 0.8); bumpN(n, p, 240.0, 0.5);
}

// --- clear glass, optionally tinted
void matGlass(inout Mat m, vec3 tint, float density) { m.col = vec3(1.0); m.trans = 1.0; m.ior = 1.5; m.rough = 0.02; m.absorb = (1.0 - tint) * density; }

// --- fresh snow
void matSnow(inout Mat m, inout vec3 n, vec3 p) {
  m.col = srgb(0.93, 0.95, 0.99) * (0.9 + 0.12 * fbm3(p * 9.0)); m.rough = 0.85; m.sheen = 0.5; m.sheenCol = vec3(0.9, 0.95, 1.0);
  bumpN(n, p, 70.0, 0.9);
  float gl = step(0.992, hash1(floor(p * 260.0))); m.rough = mix(m.rough, 0.08, gl); m.coat = gl;   // glints
}
