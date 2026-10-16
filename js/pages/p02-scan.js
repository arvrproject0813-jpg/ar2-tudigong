// P02 · Scan Activation — MindAR image target, with a "Continue without AR" fallback.
import { el, bi, button, toast } from '../ui.js';
import { startAR, stopAR } from '../ar.js';
import { registerDiorama } from '../ar-diorama.js';

let timers = [];
let alive = false;

export function render(stage, ctx) {
  alive = true;
  const c = ctx.content;
  const { CONTENT } = ctx;

  /* ---------- stage overlay (above the camera) ---------- */
  const status = el('div', { class: 'scan-status', role: 'status' });
  const setStatus = (key) => {
    status.className = `scan-status is-${key}`;
    status.replaceChildren(el('i', { class: 'dot' }), bi(c.states[key], { layout: 'inline' }));
  };
  const frame = el('div', { class: 'scan-frame', 'aria-hidden': 'true' },
    el('span', { class: 'corner tl' }), el('span', { class: 'corner tr' }),
    el('span', { class: 'corner bl' }), el('span', { class: 'corner br' }),
    el('span', { class: 'sweep' }));
  const overlay = el('div', { class: 'scan-overlay' }, frame, status);
  const errorBox = el('div', { class: 'scan-error', hidden: true });
  stage.append(el('div', { class: 'scan-bg' }), overlay, errorBox);

  /* ---------- panel ---------- */
  const tasks = (done) => ctx.setTasks([{ text: c.task, done }]);
  ctx.panel({
    secondary: [
      button(c.scanAgain, { variant: 'secondary', onClick: () => begin() }),
    ],
  });
  tasks(ctx.isComplete());

  /* ---------- AR flow ---------- */
  const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };

  const showError = (code) => {
    if (!alive) return;
    clearTimers();
    stopAR();
    overlay.hidden = true;
    const msg = code === 'TARGET_MISSING' ? c.targetMissing : (code === 'VIDEO_FAIL' ? CONTENT.p02.cameraError : c.noCamera);
    errorBox.replaceChildren(
      el('div', { class: 'scan-error-card' },
        el('p', {}, bi(msg)),
        el('p', { class: 'code' }, `Code: ${code}`),
        el('div', { class: 'btn-row' },
          button(CONTENT.common.continueNoAR, {
            variant: 'primary',
            onClick: () => {
              ctx.state.arAvailable = false; ctx.save();
              ctx.complete(); tasks(true);
              ctx.next();
            },
          }),
          button(c.scanAgain, { variant: 'secondary', onClick: () => begin() }),
        )));
    errorBox.hidden = false;
  };

  const onFound = (target) => {
    if (!alive) return;
    clearTimers();
    setStatus('found');
    // 3D pop-up neighbourhood rises out of the card (built once, stays while the card is visible)
    if (!target.querySelector('[tdg-diorama]')) {
      registerDiorama();
      const d = document.createElement('a-entity');
      d.setAttribute('tdg-diorama', '');
      target.appendChild(d);
    }
    if (!ctx.isComplete()) toast(c.foundToast, 'success');
    ctx.state.arAvailable = true; ctx.save();
    ctx.complete(); tasks(true);
  };

  const onLost = () => { if (alive) setStatus(ctx.isComplete() ? 'lost' : 'scanning'); };

  async function begin() {
    clearTimers();
    errorBox.hidden = true; overlay.hidden = false;
    setStatus('loading');
    await startAR(stage, {
      onReady: () => {
        if (!alive) return;
        setStatus('scanning');
        timers.push(setTimeout(() => { if (alive && !ctx.isComplete()) toast(c.hintSlow, 'hint', 6000); }, 15000));
      },
      onFound, onLost,
      onError: showError,
    });
    if (!alive) stopAR();          // the user left the page while libraries were loading
  }

  setStatus('idle');
  begin();
}

export function destroy() {
  alive = false;
  timers.forEach(clearTimeout); timers = [];
  stopAR();
}
