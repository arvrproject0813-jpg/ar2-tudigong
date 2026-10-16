// P02 · Scan Activation — MindAR image target, with a "Continue without AR" fallback.
import { el, bi, button, toast } from '../ui.js';
import { startAR, stopAR } from '../ar.js';

let timers = [];
let alive = false;

// "Map light points" that pop up on the card when it is found (card = 1 unit wide, 3:2)
const LIGHT_POINTS = [
  [-0.32, 0.18, '#2F8C88'], [0.05, 0.22, '#2F8C88'], [0.34, 0.12, '#D9A93F'],
  [-0.18, -0.14, '#2F8C88'], [0.12, -0.05, '#B5523B'], [0.3, -0.2, '#2F8C88'],
];

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
      button(CONTENT.common.back, { variant: 'secondary', onClick: () => ctx.back() }),
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
    if (!target.querySelector('.light-point')) {
      LIGHT_POINTS.forEach(([x, y, color], i) => {
        const p = document.createElement('a-circle');
        p.setAttribute('class', 'light-point');
        p.setAttribute('radius', '0.035');
        p.setAttribute('color', color);
        p.setAttribute('position', `${x} ${y} 0.01`);
        p.setAttribute('scale', '0 0 0');
        p.setAttribute('animation', `property: scale; to: 1 1 1; dur: 300; delay: ${i * 70}; easing: easeOutBack`);
        p.setAttribute('animation__pulse', `property: scale; from: 1 1 1; to: 1.25 1.25 1; dur: 900; delay: ${600 + i * 70}; dir: alternate; loop: true; easing: easeInOutSine`);
        target.appendChild(p);
      });
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
