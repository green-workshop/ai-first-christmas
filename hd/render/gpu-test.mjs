// Which GPU and limits does headless Edge give WebGL2?  node gpu-test.mjs [angle-backend]
import { launch } from '../../prototype/tests/cdp.mjs';
const backend = process.argv[2] || 'd3d11';
const b = await launch({ width: 800, height: 600, extraArgs: ['--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=' + backend, '--force_high_performance_gpu', '--enable-unsafe-swiftshader'] });
const r = await b.evaluate(`(() => { const c = document.createElement('canvas'); const gl = c.getContext('webgl2'); if (!gl) return 'no webgl2';
  const d = gl.getExtension('WEBGL_debug_renderer_info');
  return JSON.stringify({ renderer: d && gl.getParameter(d.UNMASKED_RENDERER_WEBGL), vendor: d && gl.getParameter(d.UNMASKED_VENDOR_WEBGL),
    float: !!gl.getExtension('EXT_color_buffer_float'), linear: !!gl.getExtension('OES_texture_float_linear'), maxTex: gl.getParameter(gl.MAX_TEXTURE_SIZE) }); })()`);
console.log(backend, r);
await b.close(); process.exit(0);
