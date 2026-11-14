// ---- path tracer over a signed distance scene ----
// The scene file supplies:
//   #define NL n                  number of lights
//   float map(vec3 p)             distance to the nearest surface; sets gM to that surface's material id
//   void shade(float id, vec3 p, inout vec3 n, inout Mat m)
//   Light getLight(int i)
//   vec3 sky(vec3 rd)             light arriving from outside the scene
// Optional defines: BOUNCES, STEPS, EPS, STEPK, TMAX, ALPHA (transparent background and a shadow catcher),
//   FOG (density of a thin haze, lit by the lights along the camera ray), FIRECLAMP.

struct Mat {
  vec3 col;        // base colour (linear)
  float rough;     // 0 mirror .. 1 chalk
  float metal;
  vec3 emit;       // light given off, seen by everything
  vec3 glow;       // light given off, seen only by the camera and in mirrors
  float sheen;     // cloth and fuzz: soft light at grazing angles
  vec3 sheenCol;
  float coat;      // clear lacquer layer on top
  float coatRough;
  float trans;     // 1 = clear glass
  float ior;
  vec3 absorb;     // colour absorbed per unit travelled inside glass
  float catcher;   // with ALPHA: this surface only shows the shadows falling on it
};
Mat newMat() { return Mat(vec3(0.5), 0.6, 0.0, vec3(0), vec3(0), 0.0, vec3(1), 0.0, 0.07, 0.0, 1.5, vec3(0), 0.0); }

struct Light { vec3 pos; float r; vec3 col; vec3 dir; float c0; float c1; };
Light omni(vec3 pos, float r, vec3 col) { return Light(pos, r, col, vec3(0, -1, 0), -2.0, -3.0); }
// a spot: full strength inside `inner` degrees from its axis, fading to nothing at `outer`
Light spot(vec3 pos, float r, vec3 col, vec3 tgt, float inner, float outer) { return Light(pos, r, col, normalize(tgt - pos), cos(radians(inner)), cos(radians(outer))); }

float gM = 0.0;
float gEdge = 1.0;   // 1 in the middle of the picture, 0 at its border: fades a sprite's shadow out before the frame cuts it
void add(inout float d, float d2, float id) { if (d2 < d) { d = d2; gM = id; } }

//@SCENE

#ifndef BOUNCES
#define BOUNCES 5
#endif
#ifndef STEPS
#define STEPS 220
#endif
#ifndef EPS
#define EPS 0.0004
#endif
#ifndef STEPK
#define STEPK 0.9
#endif
#ifndef TMAX
#define TMAX 60.0
#endif
#ifndef FIRECLAMP
#define FIRECLAMP 12.0
#endif

uint seed;
uint pcg() { seed = seed * 747796405u + 2891336453u; uint w = ((seed >> ((seed >> 28u) + 4u)) ^ seed) * 277803737u; return (w >> 22u) ^ w; }
float rnd() { return float(pcg() >> 8) * (1.0 / 16777216.0); }
vec2 rnd2() { return vec2(rnd(), rnd()); }

float march(vec3 ro, vec3 rd, float tmax, out float id) {
  float t = 0.0; id = 0.0;
  for (int i = ZERO; i < STEPS; i++) {
    float d = map(ro + rd * t);
    if (d < EPS * (1.0 + t * 0.6)) { id = gM; return t; }
    t += d * STEPK;
    if (t > tmax) break;
  }
  return -1.0;
}
float visible(vec3 ro, vec3 rd, float tmax) {
  float t = EPS * 2.0;
  for (int i = ZERO; i < 110; i++) {
    float d = map(ro + rd * t);
#ifdef GLASS_ID
    if (d < EPS * 0.5 && abs(gM - GLASS_ID) < 0.5) { t += 0.05; continue; }      // thin glass throws no shadow
#endif
    if (d < EPS * 0.5) return 0.0;
    t += max(d * STEPK, EPS);
    if (t >= tmax) return 1.0;
  }
  return 1.0;
}
vec3 calcNormal(vec3 p, float e) {
  vec3 n = vec3(0);
  for (int i = ZERO; i < 4; i++) { vec3 k = 0.5773 * (2.0 * vec3(float(((i + 3) >> 1) & 1), float((i >> 1) & 1), float(i & 1)) - 1.0); n += k * map(p + k * e); }
  return normalize(n);
}
void basis(vec3 n, out vec3 t, out vec3 b) { float s = n.z >= 0.0 ? 1.0 : -1.0, a = -1.0 / (s + n.z), c = n.x * n.y * a; t = vec3(1.0 + s * n.x * n.x * a, s * c, -s * n.x); b = vec3(c, s + n.y * n.y * a, -n.y); }
vec3 cosDir(vec3 n, vec2 u) { vec3 t, b; basis(n, t, b); float r = sqrt(u.x), a = TAU * u.y; return normalize(t * r * cos(a) + b * r * sin(a) + n * sqrt(max(0.0, 1.0 - u.x))); }
vec3 ggxH(vec3 n, float a, vec2 u) { vec3 t, b; basis(n, t, b); float ct = sqrt((1.0 - u.x) / (1.0 + (a * a - 1.0) * u.x)), st = sqrt(max(0.0, 1.0 - ct * ct)), ph = TAU * u.y; return normalize(t * st * cos(ph) + b * st * sin(ph) + n * ct); }
vec3 sphDir(vec2 u) { float z = 1.0 - 2.0 * u.x, r = sqrt(max(0.0, 1.0 - z * z)), a = TAU * u.y; return vec3(r * cos(a), r * sin(a), z); }

float Dggx(float NoH, float a) { float a2 = a * a, d = NoH * NoH * (a2 - 1.0) + 1.0; return a2 / (PI * d * d); }
float Vggx(float NoL, float NoV, float a) { float a2 = a * a; float gl = NoV * sqrt(NoL * NoL * (1.0 - a2) + a2), gv = NoL * sqrt(NoV * NoV * (1.0 - a2) + a2); return 0.5 / max(gl + gv, 1e-5); }
float schlick(float c) { float x = sat(1.0 - c); float x2 = x * x; return x2 * x2 * x; }

// BRDF times the cosine, and the probability density of having sampled l
vec3 evalBRDF(Mat m, vec3 n, vec3 v, vec3 l, out float pdf) {
  pdf = 0.0;
  float NoL = dot(n, l), NoV = max(dot(n, v), 1e-4);
  if (NoL <= 0.0) return vec3(0);
  vec3 h = normalize(v + l); float NoH = sat(dot(n, h)), VoH = sat(dot(v, h));
  float a = max(m.rough * m.rough, 0.0025), ac = max(m.coatRough * m.coatRough, 0.0025);
  vec3 F0 = mix(vec3(0.04), m.col, m.metal);
  vec3 F = F0 + (1.0 - F0) * schlick(VoH);
  float D = Dggx(NoH, a);
  vec3 spec = D * Vggx(NoL, NoV, a) * F;
  vec3 diff = m.col * (1.0 - m.metal) * (1.0 - F) / PI;
  // cloth sheen (Charlie distribution, fixed fuzz width)
  if (m.sheen > 0.0) { float sh = sqrt(max(1.0 - NoH * NoH, 0.0)); float Dc = (2.0 + 2.0) * pow(sh, 2.0) / TAU; diff += m.sheen * m.sheenCol * Dc / (4.0 * (NoL + NoV - NoL * NoV)); }
  float Fc = m.coat * (0.04 + 0.96 * schlick(VoH));
  float Dcoat = Dggx(NoH, ac);
  vec3 f = (diff + spec) * (1.0 - Fc) + vec3(Dcoat * Vggx(NoL, NoV, ac) * Fc);
  // lobe probabilities, the same ones sampleBRDF uses
  vec3 Fv = F0 + (1.0 - F0) * schlick(NoV);
  float wS = lum(Fv) + 0.02, wD = lum(m.col) * (1.0 - m.metal) + 0.5 * m.sheen, wC = m.coat * (0.04 + 0.96 * schlick(NoV));
  float tot = wS + wD + wC; float jac = 1.0 / max(4.0 * VoH, 1e-5);
  pdf = (wD * NoL / PI + wS * D * NoH * jac + wC * Dcoat * NoH * jac) / tot;
  return f * NoL;
}
vec3 sampleBRDF(Mat m, vec3 n, vec3 v, out bool wasSpec) {
  float NoV = max(dot(n, v), 1e-4);
  vec3 F0 = mix(vec3(0.04), m.col, m.metal), Fv = F0 + (1.0 - F0) * schlick(NoV);
  float wS = lum(Fv) + 0.02, wD = lum(m.col) * (1.0 - m.metal) + 0.5 * m.sheen, wC = m.coat * (0.04 + 0.96 * schlick(NoV));
  float x = rnd() * (wS + wD + wC);
  wasSpec = false;
  if (x < wD) return cosDir(n, rnd2());
  float a = (x < wD + wS) ? max(m.rough * m.rough, 0.0025) : max(m.coatRough * m.coatRough, 0.0025);
  wasSpec = a < 0.05;
  return reflect(-v, ggxH(n, a, rnd2()));
}

// light arriving at p from light i, through whatever is in the way
vec3 lightAt(int i, vec3 p, out vec3 l) {
  Light Lt = getLight(i);
  vec3 q = Lt.pos + Lt.r * sphDir(rnd2());
  vec3 d = q - p; float d2 = dot(d, d), dist = sqrt(d2); l = d / dist;
  float cone = Lt.c0 < -1.5 ? 1.0 : smoothstep(Lt.c1, Lt.c0, dot(-normalize(Lt.pos - p), Lt.dir));
  if (cone <= 0.0) return vec3(0);
  return Lt.col * cone / max(d2, 1e-4);
}

vec4 trace(vec3 ro, vec3 rd) {
  vec3 L = vec3(0), T = vec3(1); bool spec = true;
  for (int b = ZERO; b < BOUNCES; b++) {
    float id; float t = march(ro, rd, TMAX, id);
#ifdef FOG
    if (b == 0) {
      float tf = t < 0.0 ? TMAX * 0.5 : t; float ts = rnd() * tf; vec3 ps = ro + rd * ts, l;
#ifdef FOG_LIGHT
#ifdef FOG_LIGHT2
      int li = rnd() < 0.5 ? FOG_LIGHT : FOG_LIGHT2; float lw = 2.0;
#else
      int li = FOG_LIGHT; float lw = 1.0;      // only this light shows in the haze
#endif
#else
      int li = min(int(rnd() * float(NL)), NL - 1); float lw = float(NL);
#endif
      vec3 Li = lightAt(li, ps, l);
      if (lum(Li) > 0.0) { Li *= visible(ps, l, length(getLight(li).pos - ps) - getLight(li).r); L += exp(-FOG * ts) * FOG * Li * (1.0 / (4.0 * PI)) * tf * lw; }
      T *= exp(-FOG * tf);
    }
#endif
    if (t < 0.0) {
#ifdef ALPHA
      if (b == 0) return vec4(0);
#endif
      vec3 s = sky(rd); if (b > 0) s = min(s, vec3(FIRECLAMP));
      L += T * s; break;
    }
    vec3 p = ro + rd * t;
    vec3 ng = calcNormal(p, EPS * (1.0 + t * 0.6));
    if (dot(ng, rd) > 0.0) ng = normalize(ng - 1.02 * dot(ng, rd) * rd);
    vec3 n = ng; Mat m = newMat(); shade(id, p, n, m);
    if (dot(n, rd) > 0.0) n = ng;
    vec3 v = -rd;
#ifdef ALPHA
    if (b == 0 && m.catcher > 0.0) {
      // how much darker is this point than it would be with nothing above it?
      float lit = 0.0, all = 0.0;
      for (int i = ZERO; i < NL; i++) {
        vec3 l; vec3 Li = lightAt(i, p, l); float w = lum(Li) * max(dot(n, l), 0.0); all += w;
        if (w > 0.0) lit += w * visible(p + ng * EPS * 3.0, l, length(getLight(i).pos - p) - getLight(i).r);
      }
      vec3 ad = cosDir(n, rnd2()); float amb = lum(sky(ad)) + 0.02; all += amb;
      float ida; float ta = march(p + ng * EPS * 3.0, ad, 3.0, ida); if (ta < 0.0) lit += amb;
      return vec4(0, 0, 0, m.catcher * gEdge * sat((1.0 - lit / max(all, 1e-5)) * 1.06 - 0.06));
    }
#endif
    L += T * (m.emit + (spec ? m.glow : vec3(0)));
    if (m.trans > 0.0 && rnd() < m.trans) {
      float F = 0.04 + 0.96 * schlick(dot(v, n));
      spec = true;
      if (rnd() < F) { rd = reflect(rd, n); ro = p + ng * EPS * 3.0; continue; }
      vec3 rin = refract(rd, n, 1.0 / m.ior); if (dot(rin, rin) < 0.5) rin = rd;
      vec3 q = p - ng * EPS * 4.0; float travelled = 0.0;
      for (int k = ZERO; k < 3; k++) {
        float ti = EPS * 2.0;
        for (int i = ZERO; i < 90; i++) { float d = -map(q + rin * ti); if (d < EPS * 0.5) break; ti += max(d, EPS); }
        travelled += ti; q += rin * ti;
        vec3 no = calcNormal(q, EPS);
        vec3 rout = refract(rin, -no, m.ior);
        if (dot(rout, rout) > 0.5) { rin = rout; q += no * EPS * 4.0; break; }
        rin = reflect(rin, -no); q -= no * EPS * 4.0;
      }
      T *= m.col * exp(-m.absorb * travelled);
      ro = q; rd = rin; continue;
    }
    // direct light
    vec3 po = p + ng * EPS * 3.0;
    int nee = (b == 0 || NL <= 3) ? NL : 1;
    for (int k = ZERO; k < nee; k++) {
      int i = nee == NL ? k : min(int(rnd() * float(NL)), NL - 1);
      vec3 l; vec3 Li = lightAt(i, p, l);
      if (lum(Li) <= 0.0) continue;
      float pdf; vec3 f = evalBRDF(m, n, v, l, pdf);
      if (lum(f) <= 0.0 || dot(ng, l) <= 0.0) continue;
      Light Lt = getLight(i);
      vec3 c = T * f * Li * visible(po, l, length(Lt.pos - p) - Lt.r) * (float(NL) / float(nee));
      L += b == 0 ? c : min(c, vec3(FIRECLAMP));
    }
    // carry on
    bool wasSpec; vec3 l = sampleBRDF(m, n, v, wasSpec);
    if (dot(l, ng) <= 0.0) break;
    float pdf; vec3 f = evalBRDF(m, n, v, l, pdf);
    if (pdf <= 1e-6) break;
    T *= min(f / pdf, vec3(4.0));
    spec = wasSpec;
    ro = po; rd = l;
    if (b > 1) { float q = clamp(max(T.r, max(T.g, T.b)), 0.05, 0.95); if (rnd() > q) break; T /= q; }
  }
  return vec4(L, 1.0);
}

void main() {
  ivec2 px = ivec2(gl_FragCoord.xy); vec2 fc = gl_FragCoord.xy + uOff;
  vec4 acc = vec4(0);
  for (int s = ZERO; s < uInner; s++) {
    seed = uint(fc.x) * 1973u + uint(fc.y) * 9277u + uint(uFrame * uInner + s) * 26699u + 1u; pcg(); pcg();
    vec2 uv = ((fc + rnd2() - 0.5) * 2.0 - uRes) / uRes.y + uShift;
    vec2 nd = (fc * 2.0 - uRes) / uRes; gEdge = smoothstep(0.0, 0.16, 1.0 - max(abs(nd.x), abs(nd.y)));
    vec3 fw = normalize(uCamTgt - uCamPos), rt = normalize(cross(fw, vec3(0, 1, 0))), up = cross(rt, fw);
    float cr = cos(uRoll), sr = sin(uRoll); vec3 rt2 = rt * cr + up * sr; up = up * cr - rt * sr; rt = rt2;
    vec3 ro, rd;
    if (uOrtho > 0.0) { ro = uCamPos + (rt * uv.x + up * uv.y) * uOrtho; rd = fw; }
    else { float fl = 1.0 / tan(radians(uFov) * 0.5); ro = uCamPos; rd = normalize(rt * uv.x + up * uv.y + fw * fl); }
    if (uAperture > 0.0) {
      vec3 fp = ro + rd * (uFocus / dot(rd, fw));
      float a = TAU * rnd(), r = sqrt(rnd()) * uAperture;
      ro += (rt * cos(a) + up * sin(a)) * r; rd = normalize(fp - ro);
    }
#ifdef DEBUG
    float did; float dt = march(ro, rd, TMAX, did); vec4 c = dt < 0.0 ? vec4(0.2, 0.0, 0.3, 1.0) : (DEBUG == 1 ? vec4(0.5 + 0.5 * calcNormal(ro + rd * dt, EPS), 1.0) : DEBUG == 2 ? vec4(vec3(fract(dt)), 1.0) : vec4(fract(did * vec3(0.37, 0.11, 0.73)), 1.0));
#elif defined(MATTE_LO)
    // a matte of the cast (render with alpha=1): where the first surface seen has a material id in MATTE_LO..MATTE_HI. The alpha is
    // the coverage; the colour says who it is (red Father Christmas 200.., green elf 230.., blue board member 250.., yellow robot 260..,
    // white anything below 200: a prop)
    float mid; float mt = march(ro, rd, TMAX, mid);
    // (MATTE_IN, if given, is the test itself, written on mid: for things whose ids are not one run of numbers)
#ifdef MATTE_IN
    bool mout = mt < 0.0 || !(MATTE_IN);
#else
    bool mout = mt < 0.0 || mid < float(MATTE_LO) - 0.5 || mid > float(MATTE_HI) + 0.5;
#endif
    vec4 c = mout ? vec4(0.0) :
      vec4(mid < 199.5 ? vec3(1.0) : mid < 229.5 ? vec3(1.0, 0.0, 0.0) : mid < 249.5 ? vec3(0.0, 1.0, 0.0) : mid < 259.5 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 1.0, 0.0), 1.0);
#else
    vec4 c = trace(ro, rd);
#endif
    if (any(isnan(c)) || any(isinf(c))) c = vec4(0, 0, 0, c.a == c.a ? c.a : 0.0);
    acc += c;
  }
  vec4 prev = texelFetch(uPrev, px, 0);
  fragColor = prev + acc;
}
