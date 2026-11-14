// Runs inside headless Edge. window.darkroom(cfg) path-traces one image and returns it as base64.
// cfg: { frag, w, h, spp, inner, tile, cam:{pos,tgt,fov,aperture,focus,ortho,roll,shift}, exposure, look, bloom, alpha, type, quality, vignette }
window.darkroom = async function (cfg) {
  const W = cfg.w, H = cfg.h;
  const canvas = document.createElement('canvas'); canvas.width = W; canvas.height = H; document.body.appendChild(canvas);
  const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: false, preserveDrawingBuffer: true, antialias: false, powerPreference: 'high-performance' });
  if (!gl) return { error: 'no webgl2' };
  if (!gl.getExtension('EXT_color_buffer_float')) return { error: 'no float render targets' };
  gl.getExtension('OES_texture_float_linear');
  const VS = '#version 300 es\nvoid main(){ vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2)); gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0); }';
  function program(fs) {
    const p = gl.createProgram();
    for (const [type, src] of [[gl.VERTEX_SHADER, VS], [gl.FRAGMENT_SHADER, fs]]) {
      const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error('COMPILE ' + gl.getShaderInfoLog(s));
      gl.attachShader(p, s);
    }
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error('LINK ' + gl.getProgramInfoLog(p));
    return p;
  }
  function target(w, h, filter) {
    const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, w, h, 0, gl.RGBA, gl.FLOAT, null);
    for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, filter], [gl.TEXTURE_MAG_FILTER, filter], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v);
    const fbo = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    return { tex, fbo, w, h };
  }
  const t0 = performance.now();
  let pt;
  try { pt = program(cfg.frag); } catch (e) { return { error: String(e.message) }; }
  const compileMs = performance.now() - t0;
  const U = (p, n) => gl.getUniformLocation(p, n);
  let a = target(W, H, gl.NEAREST), b = target(W, H, gl.NEAREST);
  const c = cfg.cam;
  gl.useProgram(pt);
  gl.uniform2f(U(pt, 'uRes'), cfg.full[0], cfg.full[1]); gl.uniform2f(U(pt, 'uOff'), cfg.off[0], cfg.off[1]);
  gl.uniform3fv(U(pt, 'uCamPos'), c.pos); gl.uniform3fv(U(pt, 'uCamTgt'), c.tgt);
  gl.uniform1f(U(pt, 'uFov'), c.fov); gl.uniform1f(U(pt, 'uAperture'), c.aperture || 0);
  const dist = Math.hypot(c.pos[0] - c.tgt[0], c.pos[1] - c.tgt[1], c.pos[2] - c.tgt[2]);
  gl.uniform1f(U(pt, 'uFocus'), c.focus || dist); gl.uniform1f(U(pt, 'uOrtho'), c.ortho || 0); gl.uniform1f(U(pt, 'uRoll'), c.roll || 0);
  gl.uniform2fv(U(pt, 'uShift'), c.shift || [0, 0]);
  gl.uniform1i(U(pt, 'uInner'), cfg.inner);
  gl.uniform1i(U(pt, 'uPrev'), 0);
  const uFrame = U(pt, 'uFrame');
  const px = new Float32Array(4);
  const tile = cfg.tile || 256;
  const passes = Math.ceil(cfg.spp / cfg.inner);
  gl.enable(gl.SCISSOR_TEST);
  let last = performance.now();
  const tStart = performance.now();
  for (let f = 0; f < passes; f++) {
    gl.useProgram(pt); gl.uniform1i(uFrame, f);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, a.tex);
    gl.bindFramebuffer(gl.FRAMEBUFFER, b.fbo); gl.viewport(0, 0, W, H);
    for (let y = 0; y < H; y += tile) for (let x = 0; x < W; x += tile) {
      gl.scissor(x, y, Math.min(tile, W - x), Math.min(tile, H - y));
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.readPixels(x, y, 1, 1, gl.RGBA, gl.FLOAT, px);   // wait for the tile, so no single call runs long
      if (gl.isContextLost()) return { error: 'context lost at pass ' + f };
      if (performance.now() - last > 200) { await new Promise((r) => setTimeout(r, 0)); last = performance.now(); }
    }
    const t = a; a = b; b = t;
    window.__progress = { pass: f + 1, passes, sec: (performance.now() - tStart) / 1000 };
    if (cfg.maxSec && (performance.now() - tStart) / 1000 > cfg.maxSec) { cfg.sppDone = (f + 1) * cfg.inner; break; }
  }
  const done = cfg.sppDone || passes * cfg.inner;
  const renderSec = (performance.now() - tStart) / 1000;
  gl.disable(gl.SCISSOR_TEST);

  // ---- bloom: bright parts spread into three widths of blur ----
  const HEAD = '#version 300 es\nprecision highp float;\nout vec4 o;\n';
  let bloomTex = null;
  if (cfg.bloom > 0 && !cfg.alpha) {
    const bright = program(HEAD + 'uniform sampler2D t; uniform float n, thr; uniform vec2 px; void main(){ vec2 uv = gl_FragCoord.xy * px; vec3 c = texture(t, uv).rgb / n; float l = max(c.r, max(c.g, c.b)); o = vec4(c * max(l - thr, 0.0) / max(l, 1e-4), 1.0); }');
    const blur = program(HEAD + 'uniform sampler2D t; uniform vec2 d, px; void main(){ vec2 uv = gl_FragCoord.xy * px; vec3 s = vec3(0); float ws = 0.0; for (int i = -12; i <= 12; i++) { float w = exp(-float(i * i) / 50.0); s += texture(t, uv + d * float(i)).rgb * w; ws += w; } o = vec4(s / ws, 1.0); }');
    const sum = program(HEAD + 'uniform sampler2D t0, t1, t2; uniform vec2 px; void main(){ vec2 uv = gl_FragCoord.xy * px; o = vec4(texture(t0, uv).rgb * 0.5 + texture(t1, uv).rgb * 0.3 + texture(t2, uv).rgb * 0.2, 1.0); }');
    const draw = (prog, dst, set) => { gl.useProgram(prog); gl.bindFramebuffer(gl.FRAMEBUFFER, dst.fbo); gl.viewport(0, 0, dst.w, dst.h); gl.uniform2f(U(prog, 'px'), 1 / dst.w, 1 / dst.h); set(prog); gl.drawArrays(gl.TRIANGLES, 0, 3); };
    const bind = (prog, name, unit, tex) => { gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, tex); gl.uniform1i(U(prog, name), unit); };
    const levels = [];
    let src = a.tex, first = true;
    for (const div of [2, 4, 8]) {
      const w = Math.max(8, W / div | 0), h = Math.max(8, H / div | 0);
      const x = target(w, h, gl.LINEAR), y = target(w, h, gl.LINEAR);
      if (first) draw(bright, x, (p) => { bind(p, 't', 0, src); gl.uniform1f(U(p, 'n'), done); gl.uniform1f(U(p, 'thr'), cfg.bloomThreshold); });
      else draw(blur, x, (p) => { bind(p, 't', 0, src); gl.uniform2f(U(p, 'd'), 0, 0); });
      first = false;
      for (let k = 0; k < 2; k++) {
        draw(blur, y, (p) => { bind(p, 't', 0, x.tex); gl.uniform2f(U(p, 'd'), 1.2 / w, 0); });
        draw(blur, x, (p) => { bind(p, 't', 0, y.tex); gl.uniform2f(U(p, 'd'), 0, 1.2 / h); });
      }
      levels.push(x); src = x.tex;
    }
    const out = target(W / 2 | 0, H / 2 | 0, gl.LINEAR);
    draw(sum, out, (p) => { bind(p, 't0', 0, levels[0].tex); bind(p, 't1', 1, levels[1].tex); bind(p, 't2', 2, levels[2].tex); });
    bloomTex = out.tex;
  }

  // ---- develop: exposure, film curve, colour grade, straight alpha ----
  const post = program(HEAD + `
uniform sampler2D t, tb; uniform vec2 res; uniform float n, exposure, bloom, alphaOut, vignette, contrast, saturation, curve; uniform vec3 tint;
vec3 agxCurve(vec3 x) { vec3 x2 = x * x, x4 = x2 * x2; return 15.5 * x4 * x2 - 40.14 * x4 * x + 31.96 * x4 - 6.868 * x2 * x + 0.4298 * x2 + 0.1191 * x - 0.00232; }
vec3 agx(vec3 v) {
  const mat3 m = mat3(0.842479062253094, 0.0423282422610123, 0.0423756549057051, 0.0784335999999992, 0.878468636469772, 0.0784336, 0.0792237451477643, 0.0791661274605434, 0.879142973793104);
  v = m * v; v = clamp(log2(max(v, 1e-10)), -12.47393, 4.026069); v = (v + 12.47393) / 16.500999; v = agxCurve(v);
  float l = dot(v, vec3(0.2126, 0.7152, 0.0722));
  v = pow(max(v, 0.0), vec3(contrast)); v = l + saturation * (v - l);
  const mat3 inv = mat3(1.19687900512017, -0.0528968517574562, -0.0529716355144438, -0.0980208811401368, 1.15190312990417, -0.0980434501171241, -0.0990297440797205, -0.0989611768448433, 1.15107367264116);
  return clamp(inv * v, 0.0, 1.0);
}
vec3 aces(vec3 x) {
  const mat3 mi = mat3(0.59719, 0.07600, 0.02840, 0.35458, 0.90834, 0.13383, 0.04823, 0.01566, 0.83777);
  const mat3 mo = mat3(1.60475, -0.10208, -0.00327, -0.53108, 1.10813, -0.07276, -0.07367, -0.00605, 1.07602);
  x = mi * x; vec3 a = x * (x + 0.0245786) - 0.000090537, b = x * (0.983729 * x + 0.4329510) + 0.238081; x = mo * (a / b);
  x = pow(clamp(x, 0.0, 1.0), vec3(1.0 / 2.2)); float l = dot(x, vec3(0.2126, 0.7152, 0.0722));
  x = pow(x, vec3(contrast)); return clamp(l + saturation * (x - l), 0.0, 1.0);
}
void main() {
  vec2 uv = gl_FragCoord.xy / res;
  vec4 s = texture(t, uv) / n;
  vec3 c = s.rgb; float al = clamp(s.a, 0.0, 1.0);
  if (alphaOut > 0.5 && al > 0.0) c /= al;
  if (bloom > 0.0) c += texture(tb, uv).rgb * bloom;
  c *= exposure * tint;
  if (vignette > 0.0) { vec2 q = (uv - 0.5) * vec2(res.x / res.y, 1.0) * 1.15; c *= 1.0 - vignette * smoothstep(0.25, 1.05, length(q)); }
  c = curve > 0.5 ? aces(c) : agx(c);
  o = vec4(c, alphaOut > 0.5 ? al : 1.0);
}`);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, W, H);
  gl.useProgram(post);
  gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, a.tex); gl.uniform1i(U(post, 't'), 0);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  if (bloomTex) { gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, bloomTex); gl.uniform1i(U(post, 'tb'), 1); }
  gl.uniform2f(U(post, 'res'), W, H); gl.uniform1f(U(post, 'n'), done);
  gl.uniform1f(U(post, 'exposure'), cfg.exposure); gl.uniform1f(U(post, 'bloom'), bloomTex ? cfg.bloom : 0);
  gl.uniform1f(U(post, 'alphaOut'), cfg.alpha ? 1 : 0); gl.uniform1f(U(post, 'vignette'), cfg.vignette || 0);
  gl.uniform1f(U(post, 'contrast'), cfg.contrast); gl.uniform1f(U(post, 'saturation'), cfg.saturation);
  gl.uniform1f(U(post, 'curve'), cfg.curve === 'aces' ? 1 : 0); gl.uniform3fv(U(post, 'tint'), cfg.tint || [1, 1, 1]);
  gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  const blob = await new Promise((r) => canvas.toBlob(r, cfg.type || 'image/png', cfg.quality || 0.92));
  const buf = new Uint8Array(await blob.arrayBuffer());
  let s = ''; for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode.apply(null, buf.subarray(i, i + 0x8000));
  canvas.remove();
  const lose = gl.getExtension('WEBGL_lose_context'); if (lose) lose.loseContext();
  return { data: btoa(s), compileMs: Math.round(compileMs), renderSec: +renderSec.toFixed(1), spp: done };
};
