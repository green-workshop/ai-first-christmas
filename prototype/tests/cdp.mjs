// Minimal zero-dependency Chrome DevTools Protocol client for headless Edge.
// Node 24+: uses the global WebSocket and fetch. No npm installs.
//
//   import { launch } from './cdp.mjs';
//   const b = await launch({ width: 1280, height: 800 });
//   await b.navigate('file:///…/page.html');
//   console.log(await b.evaluate('document.title'));
//   await b.key('ArrowLeft');
//   await b.screenshot('out.png');
//   await b.close();

import { spawn, spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import net from 'node:net';

export const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------------------
// Process registry: every browser we start is killed on any kind of exit.
// ---------------------------------------------------------------------------
const live = new Set();
let handlersInstalled = false;

function killSync(entry) {
  try {
    if (entry.proc && entry.proc.exitCode === null && entry.proc.pid) {
      if (process.platform === 'win32') {
        spawnSync('taskkill', ['/pid', String(entry.proc.pid), '/T', '/F'], { stdio: 'ignore' });
      } else {
        entry.proc.kill('SIGKILL');
      }
    }
  } catch { /* ignore */ }
  try { rmSync(entry.dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); } catch { /* ignore */ }
  if (existsSync(entry.dir) && process.platform === 'win32') {
    // Something still holds the profile: an Edge that detached from the launcher pid. Sweep by profile dir.
    const needle = entry.dir.replace(/'/g, "''");
    spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command',
      `Get-CimInstance Win32_Process -Filter "Name='msedge.exe'" | Where-Object { $_.CommandLine -like '*${needle}*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }`],
      { stdio: 'ignore', timeout: 15000 });
    try { rmSync(entry.dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 }); } catch { /* ignore */ }
  }
  live.delete(entry);
}

export function killAll() {
  for (const e of [...live]) killSync(e);
}

function installExitHandlers() {
  if (handlersInstalled) return;
  handlersInstalled = true;
  process.on('exit', killAll);
  for (const sig of ['SIGINT', 'SIGTERM', 'SIGHUP', 'SIGBREAK']) {
    try {
      process.on(sig, () => { killAll(); process.exit(130); });
    } catch { /* signal not supported on this platform */ }
  }
  process.on('uncaughtException', (err) => {
    console.error('[cdp] uncaught exception:', err && err.stack || err);
    killAll();
    process.exit(1);
  });
  process.on('unhandledRejection', (err) => {
    console.error('[cdp] unhandled rejection:', err && err.stack || err);
    killAll();
    process.exit(1);
  });
}

function freePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.unref();
    srv.on('error', reject);
    srv.listen(0, '127.0.0.1', () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
  });
}

// ---------------------------------------------------------------------------
// Key table for Input.dispatchKeyEvent
// ---------------------------------------------------------------------------
export const KEYS = {
  ArrowLeft: { key: 'ArrowLeft', code: 'ArrowLeft', vk: 37 },
  ArrowRight: { key: 'ArrowRight', code: 'ArrowRight', vk: 39 },
  ArrowUp: { key: 'ArrowUp', code: 'ArrowUp', vk: 38 },
  ArrowDown: { key: 'ArrowDown', code: 'ArrowDown', vk: 40 },
  a: { key: 'a', code: 'KeyA', vk: 65, text: 'a' },
  d: { key: 'd', code: 'KeyD', vk: 68, text: 'd' },
  r: { key: 'r', code: 'KeyR', vk: 82, text: 'r' },
  s: { key: 's', code: 'KeyS', vk: 83, text: 's' },
  Enter: { key: 'Enter', code: 'Enter', vk: 13, text: '\r' },
  Space: { key: ' ', code: 'Space', vk: 32, text: ' ' },
  ' ': { key: ' ', code: 'Space', vk: 32, text: ' ' },
  Escape: { key: 'Escape', code: 'Escape', vk: 27 },
  Tab: { key: 'Tab', code: 'Tab', vk: 9 },
};
KEYS.A = KEYS.a; KEYS.D = KEYS.d; KEYS.R = KEYS.r; KEYS.S = KEYS.s; KEYS.Esc = KEYS.Escape;

// ---------------------------------------------------------------------------
// Connection: one WebSocket to the browser endpoint, flat sessions per target.
// ---------------------------------------------------------------------------
class Connection {
  constructor(ws) {
    this.ws = ws;
    this.nextId = 1;
    this.pending = new Map();
    this.listeners = new Map(); // `${sessionId||''}|${method}` -> Set(fn)
    this.closed = false;
    ws.addEventListener('message', (ev) => this._onMessage(ev));
    ws.addEventListener('close', () => {
      this.closed = true;
      for (const { reject, method } of this.pending.values()) reject(new Error(`CDP connection closed (pending ${method})`));
      this.pending.clear();
    });
  }

  _onMessage(ev) {
    let msg;
    try { msg = JSON.parse(typeof ev.data === 'string' ? ev.data : Buffer.from(ev.data).toString()); } catch { return; }
    if (msg.id !== undefined) {
      const p = this.pending.get(msg.id);
      if (!p) return;
      this.pending.delete(msg.id);
      clearTimeout(p.timer);
      if (msg.error) p.reject(new Error(`${p.method}: ${msg.error.message}${msg.error.data ? ' (' + msg.error.data + ')' : ''}`));
      else p.resolve(msg.result);
      return;
    }
    if (msg.method) {
      const k = `${msg.sessionId || ''}|${msg.method}`;
      const set = this.listeners.get(k);
      if (set) for (const fn of [...set]) { try { fn(msg.params || {}); } catch (e) { console.error('[cdp] listener error', e); } }
      const any = this.listeners.get(`${msg.sessionId || ''}|*`);
      if (any) for (const fn of [...any]) { try { fn(msg); } catch { /* ignore */ } }
    }
  }

  send(method, params = {}, sessionId, timeoutMs = 30000) {
    if (this.closed) return Promise.reject(new Error(`CDP connection closed (${method})`));
    const id = this.nextId++;
    const msg = { id, method, params };
    if (sessionId) msg.sessionId = sessionId;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`CDP timeout after ${timeoutMs}ms: ${method}`));
      }, timeoutMs);
      this.pending.set(id, { resolve, reject, method, timer });
      this.ws.send(JSON.stringify(msg));
    });
  }

  on(method, fn, sessionId) {
    const k = `${sessionId || ''}|${method}`;
    if (!this.listeners.has(k)) this.listeners.set(k, new Set());
    this.listeners.get(k).add(fn);
    return () => this.listeners.get(k)?.delete(fn);
  }
}

// ---------------------------------------------------------------------------
// Browser handle
// ---------------------------------------------------------------------------
class Browser {
  constructor({ proc, dir, port, conn, sessionId, targetId }) {
    Object.assign(this, { proc, dir, port, conn, sessionId, targetId });
    this.entry = { proc, dir };
    this.mouse = { x: 0, y: 0 };
  }

  /** Send a CDP command to the page session. */
  send(method, params = {}, timeoutMs) { return this.conn.send(method, params, this.sessionId, timeoutMs); }
  /** Send a CDP command to the browser (no session): Target.*, Browser.* */
  sendBrowser(method, params = {}, timeoutMs) { return this.conn.send(method, params, undefined, timeoutMs); }
  /** Subscribe to a page-session event. Returns an unsubscribe function. */
  on(method, fn) { return this.conn.on(method, fn, this.sessionId); }
  /** Wait for one page event (optionally matching a predicate). */
  once(method, pred = () => true, timeoutMs = 30000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { off(); reject(new Error(`timeout waiting for ${method}`)); }, timeoutMs);
      const off = this.on(method, (p) => { if (pred(p)) { clearTimeout(timer); off(); resolve(p); } });
    });
  }

  /** Evaluate an expression in the page and return its value (JSON-serialisable). */
  async evaluate(expression, { awaitPromise = true, timeoutMs } = {}) {
    const r = await this.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise, userGesture: false }, timeoutMs);
    if (r.exceptionDetails) {
      const d = r.exceptionDetails;
      throw new Error(`evaluate failed: ${d.exception?.description || d.text}`);
    }
    return r.result.value;
  }

  async navigate(url, { waitLoad = true, timeoutMs = 30000 } = {}) {
    const loaded = waitLoad ? this.once('Page.loadEventFired', () => true, timeoutMs) : null;
    const r = await this.send('Page.navigate', { url });
    if (r.errorText) throw new Error(`navigate ${url}: ${r.errorText}`);
    if (loaded) await loaded;
  }

  async reload({ timeoutMs = 30000 } = {}) {
    const loaded = this.once('Page.loadEventFired', () => true, timeoutMs);
    await this.send('Page.reload', { ignoreCache: true });
    await loaded;
  }

  async screenshot(path) {
    const { data } = await this.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false }, 60000);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, Buffer.from(data, 'base64'));
    return path;
  }

  /** Call BEFORE navigate: touch support ('ontouchstart' in window) is decided when the document is created. */
  async setViewport({ width, height, mobile = false, deviceScaleFactor = 1 }) {
    await this.send('Emulation.setDeviceMetricsOverride', { width, height, mobile, deviceScaleFactor, screenWidth: width, screenHeight: height });
    await this.send('Emulation.setTouchEmulationEnabled', mobile ? { enabled: true, maxTouchPoints: 5 } : { enabled: false });
    if (mobile) {
      await this.send('Emulation.setUserAgentOverride', {
        userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36 EdgA/130.0.0.0',
        platform: 'Android',
      }).catch(() => {});
    }
    this.viewport = { width, height, mobile, deviceScaleFactor };
  }

  // ---- input helpers (all produce trusted DOM events) ----

  /** Press a key: keyDown, optional autoRepeat keyDowns for holdMs, keyUp. */
  async key(name, { holdMs = 0, repeatEveryMs = 33, modifiers = 0 } = {}) {
    await this.keyDown(name, { modifiers });
    if (holdMs > 0) {
      const t0 = Date.now();
      while (Date.now() - t0 < holdMs) {
        await sleep(repeatEveryMs);
        await this.keyDown(name, { autoRepeat: true, modifiers });
      }
    } else {
      await sleep(30 + Math.random() * 50);
    }
    await this.keyUp(name, { modifiers });
  }

  async keyDown(name, { autoRepeat = false, modifiers = 0 } = {}) {
    const k = KEYS[name];
    if (!k) throw new Error(`unknown key ${name}`);
    await this.send('Input.dispatchKeyEvent', {
      type: k.text ? 'keyDown' : 'rawKeyDown',
      key: k.key, code: k.code,
      windowsVirtualKeyCode: k.vk, nativeVirtualKeyCode: k.vk,
      text: k.text, unmodifiedText: k.text,
      autoRepeat, isKeypad: false, modifiers,
    });
  }

  async keyUp(name, { modifiers = 0 } = {}) {
    const k = KEYS[name];
    await this.send('Input.dispatchKeyEvent', {
      type: 'keyUp', key: k.key, code: k.code,
      windowsVirtualKeyCode: k.vk, nativeVirtualKeyCode: k.vk, modifiers,
    });
  }

  async mouseMove(x, y, steps = 1) {
    const { x: x0, y: y0 } = this.mouse;
    for (let i = 1; i <= steps; i++) {
      const xi = x0 + ((x - x0) * i) / steps, yi = y0 + ((y - y0) * i) / steps;
      await this.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: xi, y: yi, button: 'none', buttons: 0 });
    }
    this.mouse = { x, y };
  }

  async click(x, y, { holdMs = 60 } = {}) {
    await this.mouseMove(x, y, 4);
    await this.send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', buttons: 1, clickCount: 1 });
    await sleep(holdMs);
    await this.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', buttons: 0, clickCount: 1 });
  }

  /** Centre of an element's bounding box in CSS px, or null if missing / not displayed. */
  async rect(selector) {
    return this.evaluate(`(() => {
      const el = document.querySelector(${JSON.stringify(selector)});
      if (!el) return null;
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) return null;
      return { x: r.left, y: r.top, w: r.width, h: r.height, cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
    })()`);
  }

  async clickSelector(selector, { jitter = 0.15 } = {}) {
    const r = await this.rect(selector);
    if (!r) throw new Error(`clickSelector: ${selector} not visible`);
    const x = r.cx + (Math.random() * 2 - 1) * r.w * jitter;
    const y = r.cy + (Math.random() * 2 - 1) * r.h * jitter;
    await this.click(x, y);
    return { x, y };
  }

  async tap(x, y, { holdMs = 70 } = {}) {
    const pt = { x, y, id: 1, radiusX: 8, radiusY: 8, force: 1 };
    await this.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [pt] });
    await sleep(holdMs);
    await this.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  }

  async tapSelector(selector, { jitter = 0.2 } = {}) {
    const r = await this.rect(selector);
    if (!r) throw new Error(`tapSelector: ${selector} not visible`);
    const x = r.cx + (Math.random() * 2 - 1) * r.w * jitter;
    const y = r.cy + (Math.random() * 2 - 1) * r.h * jitter;
    await this.tap(x, y);
    return { x, y };
  }

  /** Touch swipe along a list of points [{x,y}], spread over durationMs. */
  async swipe(points, durationMs = 180) {
    const id = 1;
    const tp = (p) => ({ x: p.x, y: p.y, id, radiusX: 9, radiusY: 9, force: 1 });
    await this.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [tp(points[0])] });
    const step = durationMs / Math.max(1, points.length - 1);
    for (let i = 1; i < points.length; i++) {
      await sleep(step);
      await this.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [tp(points[i])] });
    }
    await sleep(16);
    await this.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  }

  // ---- focus / visibility ----
  // Findings in headless Edge 156 (see tests/README.md):
  //  * Focus emulation (on by default here) also pins visibilityState to 'visible', so it must be
  //    switched off before hiding the page.
  //  * hidePage('tab') and hidePage('minimize') reliably fire a trusted visibilitychange -> hidden.
  //  * blurPage() fires a trusted window `blur` ONLY if the page has not yet received real input;
  //    once a click/key has landed, headless keeps real focus and no blur fires. There is no CDP way
  //    to produce a pure alt-tab blur (without visibility change) after that.

  /** Window loses focus (works only before the page received input; see above). */
  async blurPage() {
    await this.send('Emulation.setFocusEmulationEnabled', { enabled: false });
  }
  /** Give focus back. */
  async focusPage() {
    await this.send('Emulation.setFocusEmulationEnabled', { enabled: true });
    await this.send('Page.bringToFront').catch(() => {});
  }
  /**
   * Hide the page: mode 'tab' opens and activates another tab (switching tabs),
   * mode 'minimize' minimises the window. Both fire visibilitychange -> hidden.
   */
  async hidePage(mode = 'tab') {
    await this.send('Emulation.setFocusEmulationEnabled', { enabled: false });
    if (mode === 'minimize') {
      const { windowId } = await this.sendBrowser('Browser.getWindowForTarget', { targetId: this.targetId });
      this._minimized = windowId;
      await this.sendBrowser('Browser.setWindowBounds', { windowId, bounds: { windowState: 'minimized' } });
      return;
    }
    const { targetId } = await this.sendBrowser('Target.createTarget', { url: 'about:blank' });
    this._otherTab = targetId;
    await this.sendBrowser('Target.activateTarget', { targetId });
  }
  /** Come back: this page becomes visible (and focused) again; the extra tab is closed. */
  async showPage() {
    if (this._minimized != null) {
      await this.sendBrowser('Browser.setWindowBounds', { windowId: this._minimized, bounds: { windowState: 'normal' } });
      this._minimized = null;
    }
    await this.sendBrowser('Target.activateTarget', { targetId: this.targetId });
    await this.send('Page.bringToFront').catch(() => {});
    if (this._otherTab) {
      await this.sendBrowser('Target.closeTarget', { targetId: this._otherTab }).catch(() => {});
      this._otherTab = null;
    }
    await this.send('Emulation.setFocusEmulationEnabled', { enabled: true });
  }

  async close() {
    try { await this.sendBrowser('Browser.close', {}, 3000); } catch { /* ignore */ }
    try { this.conn.ws.close(); } catch { /* ignore */ }
    // Give Edge a moment to exit on its own, then make sure.
    const t0 = Date.now();
    while (this.proc.exitCode === null && Date.now() - t0 < 3000) await sleep(100);
    killSync(this.entry);
  }
}

/**
 * Launch headless Edge and attach to a page.
 * opts: { width, height, headed, edgePath, extraArgs, launchTimeoutMs }
 */
export async function launch(opts = {}) {
  installExitHandlers();
  const edgePath = opts.edgePath || EDGE_PATH;
  if (!existsSync(edgePath)) throw new Error(`Edge not found at ${edgePath}`);
  const width = opts.width || 1280, height = opts.height || 800;
  const port = await freePort();
  const dir = mkdtempSync(join(tmpdir(), 'np-cdp-'));
  const args = [
    ...(opts.headed ? [] : ['--headless=new']),
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${dir}`,
    `--window-size=${width},${height}`,
    '--no-first-run', '--no-default-browser-check', '--disable-extensions',
    '--disable-sync', '--disable-default-apps', '--disable-popup-blocking',
    '--disable-background-timer-throttling', '--disable-renderer-backgrounding',
    '--disable-backgrounding-occluded-windows',
    '--disable-features=Translate,EdgeCollections,msEdgeSidebarV2,msShowShoppingOnPage,msHubApps',
    '--allow-file-access-from-files', '--mute-audio', '--hide-scrollbars',
    ...(opts.extraArgs || []),
    'about:blank',
  ];
  const proc = spawn(edgePath, args, { stdio: ['ignore', 'ignore', 'pipe'], windowsHide: true });
  let stderr = '';
  proc.stderr.on('data', (d) => { if (stderr.length < 4000) stderr += d; });
  const entry = { proc, dir };
  live.add(entry);

  try {
    // Wait for the DevTools HTTP endpoint.
    const deadline = Date.now() + (opts.launchTimeoutMs || 20000);
    let version;
    while (Date.now() < deadline) {
      if (proc.exitCode !== null) throw new Error(`Edge exited early (code ${proc.exitCode}). stderr: ${stderr.slice(0, 800)}`);
      try {
        const r = await fetch(`http://127.0.0.1:${port}/json/version`);
        if (r.ok) { version = await r.json(); break; }
      } catch { /* not up yet */ }
      await sleep(150);
    }
    if (!version) throw new Error(`Edge DevTools endpoint did not come up on port ${port}. stderr: ${stderr.slice(0, 800)}`);

    const ws = new WebSocket(version.webSocketDebuggerUrl);
    await new Promise((res, rej) => {
      ws.addEventListener('open', res, { once: true });
      ws.addEventListener('error', () => rej(new Error('WebSocket connect failed')), { once: true });
    });
    const conn = new Connection(ws);

    // Find (or create) a page target and attach with a flat session.
    const { targetInfos } = await conn.send('Target.getTargets');
    let page = targetInfos.find((t) => t.type === 'page');
    let targetId = page ? page.targetId : (await conn.send('Target.createTarget', { url: 'about:blank' })).targetId;
    const { sessionId } = await conn.send('Target.attachToTarget', { targetId, flatten: true });

    const b = new Browser({ proc, dir, port, conn, sessionId, targetId });
    b.entry = entry;
    b.version = version.Browser;
    await b.send('Page.enable');
    await b.send('Runtime.enable');
    await b.send('Page.setLifecycleEventsEnabled', { enabled: true }).catch(() => {});
    await b.setViewport({ width, height, mobile: false, deviceScaleFactor: 1 });
    // Headless windows don't reliably own focus; emulate a focused page so the
    // game's blur auto-pause only fires when a bot deliberately removes focus.
    await b.send('Emulation.setFocusEmulationEnabled', { enabled: true }).catch(() => {});
    return b;
  } catch (e) {
    killSync(entry);
    throw e;
  }
}
