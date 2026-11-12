// P01 · Welcome — a full-screen opening.
// The earth trembles, soil bursts up and the street-corner Tudigong shrine rises out of the ground
// (Tudigong is the guardian of the land, so his shrine comes from the earth). A banyan grows beside it,
// then 土地公 is written in gold brush calligraphy and the Start button appears.
// No deity figure, no rays, no smoke: the shrine and the land carry the meaning (storyboard rules).
// Tap anywhere during the animation to skip to the end.
import { el, bi } from '../ui.js';
import { ASSETS } from '../config.js';
import { narrationControl } from '../narration.js';
import { icon } from '../icons.js';
import { playRise, playEnter, soundUnlocked } from '../sound.js';
import { clearGuide } from '../guide.js';

export const chrome = false;      // no top bar / side panel on this page

let timers = [];

export function render(stage, ctx) {
  const { CONTENT } = ctx;
  const c = ctx.content;
  const lang = ctx.state.lang;

  // soil particles: a ring of clods thrown up and falling back
  const soil = el('div', { class: 'w-soil', 'aria-hidden': 'true' },
    Array.from({ length: 16 }, (_, i) => {
      const a = -160 + (i / 15) * 140;             // spread of launch angles (degrees, upward)
      const dist = 40 + (i % 4) * 22;
      return el('i', { style: { '--a': `${a}deg`, '--d': `${dist}%`, '--s': `${0.6 + (i % 3) * 0.35}`, '--t': `${(i % 5) * 0.04}s` } });
    }));

  const scene = el('div', { class: 'w-art' },
    el('img', { class: 'w-bg', src: ASSETS.welcomeBg, alt: '' }),
    el('div', { class: 'w-clouds far', 'aria-hidden': 'true' }),
    el('div', { class: 'w-clouds near', 'aria-hidden': 'true' }),
    // contact shadows on the ground (under the shrine's steps and the banyan's trunk)
    el('div', { class: 'w-ground shrine', 'aria-hidden': 'true' }),
    el('div', { class: 'w-ground tree', 'aria-hidden': 'true' }),
    // everything that rises is clipped at the ground line
    el('div', { class: 'w-rise', 'aria-hidden': 'true' },
      el('img', { class: 'w-banyan', src: ASSETS.banyan, alt: '' }),
      el('img', { class: 'w-shrine', src: ASSETS.shrine, alt: '' })),
    el('div', { class: 'w-mound', 'aria-hidden': 'true' }),
    el('div', { class: 'w-dust', 'aria-hidden': 'true' }, el('i'), el('i'), el('i')),
    soil,
  );

  const start = el('button', { class: 'btn btn-primary w-start', type: 'button', onclick: (e) => { e.stopPropagation(); enterShrine(); } },
    bi(c.start));

  const title = el('div', { class: 'w-title' },
    el('h1', { class: 'w-brush', lang: 'zh-Hant' }, el('span', {}, '土地公')),
    el('div', { class: 'w-name' }, lang === 'zh' ? CONTENT.meta.shortTitle.zh : CONTENT.meta.shortTitle.en),
    lang === 'bi' ? el('div', { class: 'w-name-zh', lang: 'zh-Hant' }, CONTENT.meta.title.zh) : null,
    el('div', { class: 'w-sub' }, bi(CONTENT.meta.subtitle, { layout: 'inline' })),
    el('div', { class: 'w-question' },
      el('span', { class: 'seal', 'aria-hidden': 'true', lang: 'zh-Hant' }, '問'),
      bi(CONTENT.meta.coreQuestion, { layout: 'stack' })),
    start,
  );

  const corner = el('div', { class: 'w-corner' },
    c.narration ? narrationControl('p01', lang, 'mini') : null,
    el('span', { class: 'w-voice' }, ctx.voiceButton('w-round')),
    el('span', { class: 'w-music' }, ctx.musicButton('w-round')),
    el('button', { class: 'w-lang', type: 'button', onclick: (e) => { e.stopPropagation(); ctx.cycleLang(); }, html: icon('lang') },
      { bi: '雙語', en: 'EN', zh: '中文' }[lang]));

  const skip = el('button', { class: 'w-skip', type: 'button' }, bi(CONTENT.common.skip, { layout: 'inline' }));

  // First visit: the browser only allows sound after a tap, so the scene waits with a "Touch the earth" button
  // and the shrine rises (with its sound) when it is tapped. Coming back later (sound already allowed), it plays at once.
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const waitForTouch = !soundUnlocked() && !reduce;
  const gate = waitForTouch
    ? el('button', { class: 'w-gate', type: 'button', 'data-no-click-sound': '' },
        el('span', { class: 'w-gate-ring', 'aria-hidden': 'true', lang: 'zh-Hant' }, '土'),
        bi(CONTENT.common.touchEarth, { layout: 'stack' }))
    : null;
  const root = el('div', { class: `welcome is-playing ${waitForTouch ? 'is-waiting' : ''}` }, scene, title, corner, skip, gate);
  let stopSound = () => {};
  const begin = () => {
    if (!root.classList.contains('is-waiting') && gate) return;
    root.classList.remove('is-waiting');
    gate?.remove();
    stopSound = playRise();
    timers.push(setTimeout(finish, 6500));
    timers.push(setTimeout(() => ctx.musicIfOn(), 5600));      // the music comes in once the title is written
  };
  const finish = () => {
    if (root.classList.contains('is-waiting')) return;
    if (!root.classList.contains('is-playing')) return;
    root.classList.remove('is-playing'); root.classList.add('is-done');
    stopSound();
    ctx.musicIfOn();
    timers.push(setTimeout(() => ctx.guide(), 700));           // then the voice guide says what to do
  };
  root.addEventListener('click', (e) => {
    if (e.target.closest('.w-start, .w-corner')) return;
    if (root.classList.contains('is-waiting')) begin(); else finish();
  });
  if (!waitForTouch) {
    if (reduce) { root.classList.remove('is-playing'); root.classList.add('is-done'); ctx.guide(); }
    else begin();
  }
  // keep the corner music button in sync when it is toggled
  const syncMusic = () => corner.querySelector('.w-music')?.replaceChildren(ctx.musicButton('w-round'));
  document.addEventListener('music-changed', syncMusic);
  timers.push({ off: () => document.removeEventListener('music-changed', syncMusic) });
  const syncVoice = () => corner.querySelector('.w-voice')?.replaceChildren(ctx.voiceButton('w-round'));
  document.addEventListener('voice-changed', syncVoice);
  timers.push({ off: () => document.removeEventListener('voice-changed', syncVoice) });
  stage.append(root);
  ctx.complete();

  /* Start → we walk into the shrine.
     1. The view glides toward the shrine and stops for a breath at its doorway, warm lamplight glowing inside.
     2. We pass through: the doorway opens around us (the scene is cut by an arch-shaped hole that grows past
        the screen) and P02 is waiting inside, settling into place as the warm light fades.
     For a smooth ride the scene is moved into its own layer first and only transformed (no repainting),
     and its own animations are paused. */
  let entering = false;
  const doorCut = new Image();
  doorCut.src = 'assets/img/shrine_doorcut.webp'; doorCut.alt = '';
  doorCut.decode?.().catch(() => {});
  function enterShrine() {
    if (entering) return;
    entering = true;
    if (reduce || !root.animate) { ctx.go('p02'); return; }
    finish();
    clearGuide();
    const img = root.querySelector('.w-shrine');
    const box = root.getBoundingClientRect(), r = img.getBoundingClientRect();
    // the doorway in the shrine picture (fractions of the sprite)
    const D = { l: 0.3995, r: 0.6005, top: 0.4267, bottom: 0.6562 };
    const X = (f) => r.left - box.left + r.width * f, Y = (f) => r.top - box.top + r.height * f;
    const dl = X(D.l), dr = X(D.r), dt = Y(D.top), db = Y(D.bottom);
    const cx = (dl + dr) / 2, cy = (dt + db) / 2 + (db - dt) * 0.08;
    const W = box.width, H = box.height;
    // the scene gets a rectangular hole behind the doorway; a sharp copy of the shrine with its doorway cut out
    // exactly (assets/img/shrine_doorcut.webp) sits on top, so the edge of the opening is the shrine's own gold frame
    const hole = `M${X(D.l - 0.006)} ${Y(D.top - 0.008)}H${X(D.r + 0.006)}V${Y(D.bottom + 0.003)}H${X(D.l - 0.006)}Z`;   // a little larger than the doorway: the sharp copy covers the rest
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><path fill-rule="evenodd" d="M0 0H${W}V${H}H0Z ${hole}"/></svg>`;
    // how far to zoom: a doorway about 45% of the screen tall, then far enough that it covers everything
    const sMid = Math.max(2.2, (H * 0.45) / (db - dt));
    const sEnd = 1.35 * Math.max(cx / ((dr - dl) / 2), (W - cx) / ((dr - dl) / 2), cy / ((db - dt) / 2), (H - cy) / ((db - dt) / 2));

    // lift the scene into a layer above everything; the warm light of the shrine's inside goes behind it
    const host = el('div', { class: 'enter-host', 'aria-hidden': 'true' });
    const glow = el('div', { class: 'enter-glow' });
    glow.style.setProperty('--x', `${cx}px`); glow.style.setProperty('--y', `${cy}px`);
    const front = doorCut;
    front.className = 'enter-shrine';
    Object.assign(front.style, { left: `${r.left - box.left}px`, top: `${r.top - box.top}px`, width: `${r.width}px`, height: `${r.height}px`,
      transformOrigin: `${cx - (r.left - box.left)}px ${cy - (r.top - box.top)}px` });
    host.append(glow);
    document.body.append(host);
    root.classList.add('is-entering');
    host.append(root, front);
    const url = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
    root.style.webkitMaskImage = url; root.style.maskImage = url;
    root.style.transformOrigin = `${cx}px ${cy}px`;
    playEnter();

    const T = 1950;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const frames = [
        { transform: 'scale(1)', easing: 'cubic-bezier(.4, 0, .45, .95)' },
        { offset: 0.5, transform: `scale(${sMid.toFixed(3)})`, easing: 'cubic-bezier(.5, .12, .9, .5)' },
        { transform: `scale(${sEnd.toFixed(3)})` },
      ];
      const walk = root.animate(frames, { duration: T, fill: 'forwards' });
      front.animate(frames, { duration: T, fill: 'forwards' });
      // P02 is made inside, behind the light, while we step over the threshold
      setTimeout(() => {
        ctx.go('p02');
        const app = document.getElementById('app');
        setTimeout(() => {
          glow.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 750, easing: 'ease-out', fill: 'forwards' });
          app.animate([{ transform: 'scale(1.09)' }, { transform: 'scale(1)' }], { duration: 1300, easing: 'cubic-bezier(.2, .7, .2, 1)' });
        }, 380);
      }, T * 0.55);
      walk.finished.then(() => setTimeout(() => host.remove(), 600)).catch(() => host.remove());
    }));
  }
}

export function destroy() { timers.forEach((t) => (t && t.off ? t.off() : clearTimeout(t))); timers = []; }
