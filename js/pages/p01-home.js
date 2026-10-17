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
import { playRise, soundUnlocked } from '../sound.js';

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
    // everything that rises is clipped at the ground line
    el('div', { class: 'w-rise', 'aria-hidden': 'true' },
      el('img', { class: 'w-banyan', src: ASSETS.banyan, alt: '' }),
      el('img', { class: 'w-shrine', src: ASSETS.shrine, alt: '' })),
    el('div', { class: 'w-mound', 'aria-hidden': 'true' }),
    el('div', { class: 'w-dust', 'aria-hidden': 'true' }, el('i'), el('i'), el('i')),
    soil,
  );

  const start = el('button', { class: 'btn btn-primary w-start', type: 'button', onclick: (e) => { e.stopPropagation(); ctx.go('p02'); } },
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
  };
  root.addEventListener('click', (e) => {
    if (e.target.closest('.w-start, .w-corner')) return;
    if (root.classList.contains('is-waiting')) begin(); else finish();
  });
  if (!waitForTouch) {
    if (reduce) { root.classList.remove('is-playing'); root.classList.add('is-done'); }
    else begin();
  }
  // keep the corner music button in sync when it is toggled
  const syncMusic = () => corner.querySelector('.w-music')?.replaceChildren(ctx.musicButton('w-round'));
  document.addEventListener('music-changed', syncMusic);
  timers.push({ off: () => document.removeEventListener('music-changed', syncMusic) });
  stage.append(root);
  ctx.complete();
}

export function destroy() { timers.forEach((t) => (t && t.off ? t.off() : clearTimeout(t))); timers = []; }
