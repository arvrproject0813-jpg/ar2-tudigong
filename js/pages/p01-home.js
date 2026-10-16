// P01 · Home / Entry Page
import { el, bi, chip, infoBox, modal, button } from '../ui.js';
import { ASSETS } from '../config.js';
import { icon } from '../icons.js';

// Decorative medallions on the hero art, in % of the 3:2 image (they follow the image when it is cropped).
const HERO_PINS = [
  { x: 43.3, y: 49, temple: true, icon: 'temple' },  // street-corner shrine
  { x: 22, y: 34, icon: 'tree' },                     // banyan
  { x: 8, y: 66, icon: 'fields' },                    // rice fields
  { x: 86, y: 76, icon: 'market' },                   // market stalls
  { x: 70, y: 38, icon: 'home' },                     // qilou houses
];

export function render(stage, ctx) {
  const c = ctx.content;
  const { CONTENT } = ctx;
  const compact = window.matchMedia('(max-height: 500px)').matches;

  const openInfo = (key) => {
    const body = [el('p', {}, bi(c.info[key]))];
    if (key === 'about') body.push(el('p', { class: 'muted' }, bi(CONTENT.meta.statement)));
    modal({ title: c.menu[key], body, actions: [button(CONTENT.common.close, { variant: 'secondary', onClick: () => document.getElementById('modal-layer').replaceChildren() })] });
  };

  stage.append(
    el('div', { class: 'p01-art' },
      el('img', { class: 'p01-hero', src: ASSETS.p01Hero, alt: '' }),
      el('div', { class: 'p01-sky', 'aria-hidden': 'true' }),
      ...HERO_PINS.map((p) => el('span', {
        class: `map-pin is-pulse ${p.temple ? 'is-temple' : ''}`,
        style: { left: `${p.x}%`, top: `${p.y}%`, cursor: 'default' },
        'aria-hidden': 'true',
        html: icon(p.icon),
      }))),
    el('div', { class: 'p01-shade', 'aria-hidden': 'true' }),
    el('div', { class: 'p01-tags stage-pad' }, c.tags.map((t) => chip(t, { cls: 'on-art' }))),
    el('nav', { class: 'p01-menu stage-pad', 'aria-label': 'Menu' },
      // Phones (short screens) get the short labels so the menu stays on one row
      ...[['about', 'info'], ['map', 'map'], ['objects', 'temple'], ['howTo', 'book']].map(([k, ic]) =>
        chip(compact ? c.menuShort[k] : c.menu[k], { cls: 'on-art', iconName: ic, onClick: () => (k === 'howTo' ? ctx.go('p03') : openInfo(k)) })),
    ),
  );

  ctx.panel({
    title: CONTENT.meta.shortTitle,
    display: true,
    narration: false,
    body: [
      bi(CONTENT.meta.subtitle, { tag: 'div', cls: 'subtitle', layout: 'inline' }),
      infoBox(CONTENT.common.coreInquiry, CONTENT.meta.coreQuestion),
    ],
    primary: { text: c.start, onClick: () => ctx.go('p02'), alwaysEnabled: true },
  });
  ctx.complete();
}

export function destroy() {}
