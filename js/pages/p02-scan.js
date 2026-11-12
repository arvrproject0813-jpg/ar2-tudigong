// P02 · Scan Activation — first a short camera setup (allow camera, fit the card, light, safety),
// then the MindAR image target, with a "Continue without AR" fallback.
import { el, bi, button, toast } from '../ui.js';
import { icon } from '../icons.js';
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
    cleanupSetup?.(); stage.querySelector('.scan-setup')?.remove();
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

  /* ---------- camera setup first ----------
     Left: a little animated scene (a tablet framing the culture card) that acts out the step in focus.
     Right: the four steps; they light up one after another (tap one to see it), then Start Camera. */
  const S = c.setup;
  const scene = el('div', { class: 'cs-scene', 'data-step': '0', 'aria-hidden': 'true' },
    el('div', { class: 'cs-sun' }, el('span', { html: icon('bulb') })),
    el('div', { class: 'cs-safe' }),
    el('div', { class: 'cs-tablet' },
      el('div', { class: 'cs-screen' },
        el('img', { src: 'assets/img/card_thumb.webp', alt: '' }),
        el('i', { class: 'cs-br tl' }), el('i', { class: 'cs-br tr' }), el('i', { class: 'cs-br bl' }), el('i', { class: 'cs-br br' }),
        el('i', { class: 'cs-beam' }),
        el('div', { class: 'cs-allow' }, el('span', { html: icon('camera') }), bi(S.allow, { layout: 'inline' })),
        el('i', { class: 'cs-tap' }))),
    el('div', { class: 'cs-dist' }, el('i'), el('b', {}, '30–50 cm'), el('i')));
  const rows = S.steps.map((st, i) => el('button', { class: 'cs-step', type: 'button', 'data-i': String(i) },
    el('span', { class: 'cs-num' }, String(i + 1)),
    el('span', { class: 'cs-ic', html: icon(st.icon) }),
    el('span', { class: 'cs-txt' }, el('span', { class: 'cs-t' }, bi(st.title, { layout: 'inline' })), el('span', { class: 'cs-d' }, bi(st.text)))));
  const startBtn = button(S.start, { variant: 'primary', onClick: () => { clearInterval(cycle); setup.remove(); begin(); } });
  startBtn.prepend(el('span', { class: 'ic', html: icon('camera'), 'aria-hidden': 'true' }));
  startBtn.classList.add('setup-start');
  const setup = el('div', { class: 'scan-setup' },
    el('div', { class: 'cs-card', role: 'region', 'aria-label': S.title.en },
      scene,
      el('div', { class: 'cs-main' },
        el('div', { class: 'cs-eyebrow' }, bi(S.eyebrow, { layout: 'inline' })),
        el('div', { class: 'cs-head' }, el('h2', {}, bi(S.title, { layout: 'stack' })), el('div', { class: 'cs-voice', 'data-guide-host': '' })),
        el('p', { class: 'cs-intro' }, bi(S.intro)),
        el('div', { class: 'cs-steps' }, rows),
        el('div', { class: 'cs-go' }, el('div', { class: 'cs-ready' }, bi(S.ready, { layout: 'inline' })), startBtn))));
  let step = 0, cycle = 0, resume = 0;
  const show = (i) => {
    step = i;
    scene.dataset.step = String(i);
    rows.forEach((r, k) => { r.classList.toggle('is-on', k === i); r.classList.toggle('is-past', k < i); r.setAttribute('aria-pressed', String(k === i)); });
  };
  const auto = () => { clearInterval(cycle); cycle = setInterval(() => show((step + 1) % rows.length), 3400); };
  rows.forEach((r, i) => r.addEventListener('click', () => { show(i); clearInterval(cycle); clearTimeout(resume); resume = setTimeout(auto, 9000); }));
  show(0);
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) auto();
  cleanupSetup = () => { clearInterval(cycle); clearTimeout(resume); };
  overlay.hidden = true;
  setStatus('idle');
  stage.append(setup);
  startBtn.focus();
}

let cleanupSetup = null;
export function destroy() {
  alive = false;
  cleanupSetup?.(); cleanupSetup = null;
  timers.forEach(clearTimeout); timers = [];
  stopAR();
}
