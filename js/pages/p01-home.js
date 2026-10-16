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
    el('button', { class: 'w-lang', type: 'button', onclick: (e) => { e.stopPropagation(); ctx.cycleLang(); }, html: icon('lang') },
      { bi: '雙語', en: 'EN', zh: '中文' }[lang]));

  const skip = el('button', { class: 'w-skip', type: 'button' }, bi(CONTENT.common.skip, { layout: 'inline' }));

  const root = el('div', { class: 'welcome is-playing' }, scene, title, corner, skip);
  const finish = () => {
    if (!root.classList.contains('is-playing')) return;
    root.classList.remove('is-playing'); root.classList.add('is-done');
  };
  root.addEventListener('click', (e) => { if (!e.target.closest('.w-start, .w-corner')) finish(); });
  timers.push(setTimeout(finish, 6500));
  stage.append(root);
  ctx.complete();
}

export function destroy() { timers.forEach(clearTimeout); timers = []; }
