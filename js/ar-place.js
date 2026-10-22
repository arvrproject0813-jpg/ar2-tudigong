// ar-place.js — "See it in AR": one place of the neighbourhood standing in front of the camera.
//
//   openPlaceAR({ id: 'temple', title: {en, zh}, fact: {en, zh} })
//
// Opens a full-screen camera view (rear camera on tablets and phones, the webcam on laptops) with the
// place's 3D model on top. Students drag to turn it and pinch to zoom. On devices that support real AR
// (iPad / iPhone Quick Look, Android Chrome with ARCore) a "Place it in the room" button puts the model
// on the real table or floor. With no camera, the model shows on warm paper instead.
//
// The models are assets/models/p05/<id>.glb, made from the same builder as the map (js/ar-diorama.js,
// buildNeighborhood(THREE, { place: id })), about 40 cm across in AR. 3D viewer: <model-viewer> (Google),
// loaded from the CDN the first time it is needed.
import { el, bi, plain } from './ui.js';
import { icon } from './icons.js';
import CONTENT from '../content/content.js';

const MV_URL = 'https://cdn.jsdelivr.net/npm/@google/model-viewer@3.5.0/dist/model-viewer.min.js';
export const PLACE_MODELS = (id) => `assets/models/p05/${id}.glb`;

let mvReady = null;
/** Load <model-viewer> once (call early to warm it up). */
export function loadModelViewer() {
  if (!mvReady) {
    mvReady = customElements.get('model-viewer') ? Promise.resolve() : new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.type = 'module'; s.src = MV_URL;
      s.onload = () => customElements.whenDefined('model-viewer').then(resolve);
      s.onerror = () => { mvReady = null; reject(new Error('model-viewer failed to load')); };
      document.head.append(s);
    });
  }
  return mvReady;
}

let current = null;

export function openPlaceAR({ id, title, fact }) {
  closePlaceAR();
  const c = CONTENT.p05;
  const opener = document.activeElement;
  let stream = null, closed = false;

  const video = el('video', { class: 'arv-cam', autoplay: true, playsinline: true, muted: true, 'aria-hidden': 'true' });
  video.muted = true;
  const loading = el('div', { class: 'arv-loading', role: 'status' }, el('span', { class: 'arv-spin', 'aria-hidden': 'true' }), bi(c.arLoading, { layout: 'inline' }));
  const stage = el('div', { class: 'arv-stage' });
  const placeBtn = el('button', { class: 'btn btn-primary arv-place', type: 'button', hidden: true },
    el('span', { class: 'ic', html: icon('scan') }), bi(c.arPlace, { layout: 'stack' }));
  const note = el('div', { class: 'arv-note', role: 'status', hidden: true }, bi(c.arNoCam, { layout: 'inline' }));
  const closeBtn = el('button', { class: 'icon-btn arv-close', type: 'button', 'aria-label': plain(CONTENT.common.close), html: icon('close') });

  const root = el('div', { class: 'arv', role: 'dialog', 'aria-modal': 'true', 'aria-label': plain(title) },
    video, el('div', { class: 'arv-shade', 'aria-hidden': 'true' }), stage, loading,
    el('div', { class: 'arv-top' },
      el('div', { class: 'arv-title' }, el('span', { class: 'arv-badge', html: icon('camera') }), bi(title, { layout: 'stack' })),
      closeBtn),
    el('div', { class: 'arv-bottom' },
      el('div', { class: 'arv-fact' }, bi(fact, { layout: 'stack' }), el('div', { class: 'arv-hint' }, bi(c.arHint, { layout: 'inline' }))),
      placeBtn),
    note);
  document.body.append(root);
  document.body.classList.add('arv-open');
  closeBtn.focus();

  /* camera */
  const startCamera = async () => {
    if (closed || stream) return;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
      if (closed) { stopCamera(); return; }
      video.srcObject = stream;
      const facing = stream.getVideoTracks()[0]?.getSettings?.().facingMode;
      video.classList.toggle('is-mirror', facing === 'user' || !facing);   // laptop webcams: mirror like a mirror
      await video.play().catch(() => {});
      root.classList.add('has-cam');
      note.hidden = true;
    } catch (e) {
      root.classList.remove('has-cam');
      note.hidden = false;
    }
  };
  const stopCamera = () => { stream?.getTracks().forEach((t) => t.stop()); stream = null; video.srcObject = null; root.classList.remove('has-cam'); };
  if (navigator.mediaDevices?.getUserMedia) startCamera(); else note.hidden = false;

  /* model */
  let mv = null;
  loadModelViewer().then(() => {
    if (closed) return;
    mv = el('model-viewer', {
      class: 'arv-mv', src: PLACE_MODELS(id), alt: plain(title),
      'camera-controls': true, 'touch-action': 'none', 'interaction-prompt': 'none',
      autoplay: true, 'auto-rotate': true, 'auto-rotate-delay': '2500', 'rotation-per-second': '14deg',
      'camera-orbit': `24deg 62deg ${matchMedia('(max-height: 500px)').matches ? 150 : 125}%`, 'min-camera-orbit': 'auto 15deg auto', 'max-camera-orbit': 'auto 88deg auto',
      'field-of-view': '30deg', 'shadow-intensity': '1', 'shadow-softness': '0.8', exposure: '1.05',
      'environment-image': 'neutral', ar: true, 'ar-modes': 'webxr scene-viewer quick-look', 'ar-placement': 'floor', 'ar-scale': 'auto',
    });
    mv.addEventListener('load', () => {
      loading.hidden = true;
      if (mv.canActivateAR) placeBtn.hidden = false;
    });
    mv.addEventListener('error', () => { loading.replaceChildren(bi(c.arNoCam, { layout: 'inline' })); });
    mv.addEventListener('ar-status', (e) => { if (e.detail.status === 'not-presenting' || e.detail.status === 'failed') startCamera(); });
    stage.append(mv);
  }).catch(() => { loading.replaceChildren(bi(c.arNoCam, { layout: 'inline' })); });

  placeBtn.addEventListener('click', () => {
    if (!mv?.canActivateAR) return;
    stopCamera();                                  // real AR needs the camera for itself
    mv.activateAR();
  });
  const onVisible = () => { if (document.visibilityState === 'visible' && !closed) startCamera(); };   // back from Quick Look
  document.addEventListener('visibilitychange', onVisible);

  const onKey = (e) => { if (e.key === 'Escape') closePlaceAR(); };
  document.addEventListener('keydown', onKey);
  closeBtn.addEventListener('click', () => closePlaceAR());

  current = () => {
    closed = true;
    stopCamera();
    document.removeEventListener('visibilitychange', onVisible);
    document.removeEventListener('keydown', onKey);
    root.remove();
    document.body.classList.remove('arv-open');
    if (opener && document.contains(opener)) opener.focus?.();
  };
}

export function closePlaceAR() { if (current) { const f = current; current = null; f(); } }
