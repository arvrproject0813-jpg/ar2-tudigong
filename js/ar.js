// ar.js — start/stop MindAR image tracking inside a container. Libraries load on demand.
import { AR_SCRIPTS, ASSETS } from './config.js';

let loading = null;
let session = null;   // { wrap, scene, target }

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement('script');
    s.src = src; s.async = false;
    s.onload = resolve;
    s.onerror = () => reject(new Error(`SCRIPT_FAIL ${src}`));
    document.head.appendChild(s);
  });
}

/** Load A-Frame then MindAR (in order). Rejects after 20 s. */
export function loadARLibraries() {
  if (window.AFRAME && window.MINDAR?.IMAGE) return Promise.resolve();
  if (!loading) {
    const chain = AR_SCRIPTS.reduce((p, src) => p.then(() => loadScript(src)), Promise.resolve());
    const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error('SCRIPT_TIMEOUT')), 20000));
    loading = Promise.race([chain, timeout]).catch((e) => { loading = null; throw e; });
  }
  return loading;
}

/** Why AR cannot run here, or null if it can try. */
export function arBlocker() {
  if (!window.isSecureContext) return 'NOT_SECURE';
  if (!navigator.mediaDevices?.getUserMedia) return 'NO_CAMERA_API';
  return null;
}

async function targetExists() {
  try {
    const r = await fetch(ASSETS.target, { method: 'GET', cache: 'no-store' });
    return r.ok;
  } catch (e) { return false; }
}

/**
 * Start AR in `container` (the stage). Handlers: onReady, onFound, onLost, onError(code).
 * Error codes: NOT_SECURE, NO_CAMERA_API, TARGET_MISSING, SCRIPT_FAIL, SCRIPT_TIMEOUT, VIDEO_FAIL
 */
export async function startAR(container, { onReady, onFound, onLost, onError } = {}) {
  stopAR();
  const blocker = arBlocker();
  if (blocker) { onError?.(blocker); return null; }
  if (!(await targetExists())) { onError?.('TARGET_MISSING'); return null; }
  try { await loadARLibraries(); }
  catch (e) { onError?.(String(e.message).startsWith('SCRIPT_TIMEOUT') ? 'SCRIPT_TIMEOUT' : 'SCRIPT_FAIL'); return null; }
  patchMindAR();

  // MindAR puts its <video> into the scene's parent at z-index -2, so the wrapper must be
  // positioned and the stage must create a stacking context (see #stage { isolation: isolate }).
  const wrap = document.createElement('div');
  wrap.className = 'ar-wrap';
  wrap.innerHTML = `
    <a-scene embedded
      mindar-image="imageTargetSrc: ${ASSETS.target}; maxTrack: 1; uiScanning: no; uiLoading: no; uiError: no; filterMinCF: 0.0001; filterBeta: 0.001"
      color-space="sRGB" renderer="colorManagement: true; alpha: true; antialias: true"
      vr-mode-ui="enabled: false" xr-mode-ui="enabled: false" device-orientation-permission-ui="enabled: false"
      loading-screen="enabled: false" light="defaultLightsEnabled: false">
      <a-camera position="0 0 0" look-controls="enabled: false" cursor="rayOrigin: mouse" raycaster="objects: .clickable"></a-camera>
      <a-entity id="ar-target-0" mindar-image-target="targetIndex: 0"></a-entity>
    </a-scene>`;
  container.prepend(wrap);
  const scene = wrap.querySelector('a-scene');
  const target = wrap.querySelector('#ar-target-0');
  session = { wrap, scene, target };

  scene.addEventListener('arReady', () => onReady?.());
  scene.addEventListener('arError', (e) => onError?.(e.detail?.error || 'VIDEO_FAIL'));
  target.addEventListener('targetFound', () => onFound?.(target));
  target.addEventListener('targetLost', () => onLost?.(target));
  return session;
}

/** MindAR 1.2.5 keeps a window resize listener after stop(); make it harmless. */
function patchMindAR() {
  const S = window.AFRAME?.systems?.['mindar-image-system'];
  if (!S || S.prototype.__ar2Patched) return;
  const resize = S.prototype._resize;
  S.prototype._resize = function () {
    if (!this.video || !this.video.isConnected) return;
    try { resize.call(this); } catch (e) { /* scene already removed */ }
  };
  S.prototype.__ar2Patched = true;
}

/** The anchor entity for the card (add a-entities to it to show content on the card). */
export const getTarget = () => session?.target || null;

/** Stop camera + tracking and remove the scene. Safe to call any time. */
export function stopAR() {
  if (!session) return;
  const { wrap, scene } = session;
  session = null;
  // Stop once, and make the component's own remove() → stop() a no-op (it throws if the camera never started)
  const sys = scene.systems?.['mindar-image-system'];
  if (sys) {
    const original = sys.stop.bind(sys);
    let stopped = false;
    sys.stop = () => { if (stopped) return; stopped = true; try { original(); } catch (e) { /* camera never started */ } };
    sys.stop();
  }
  wrap.querySelectorAll('video').forEach((v) => {
    try { v.srcObject?.getTracks().forEach((t) => t.stop()); } catch (e) { /* ignore */ }
  });
  // MindAR appends its video to the wrapper's parent in some versions; clean those too
  wrap.parentElement?.querySelectorAll(':scope > video').forEach((v) => {
    try { v.srcObject?.getTracks().forEach((t) => t.stop()); } catch (e) { /* ignore */ }
    v.remove();
  });
  wrap.remove();
}
