// P03 · How to Use — six gesture tiles; tapping a tile plays a short demo.
import { el, bi } from '../ui.js';
import { icon, TILE_ICON } from '../icons.js';

let timer = null;

export function render(stage, ctx) {
  const c = ctx.content;
  const done = () => { if (!ctx.isComplete()) { ctx.complete(); ctx.setTasks([{ text: c.task, done: true }]); } };

  const tiles = c.tiles.map((t, i) => {
    const demo = ['tap', 'map', 'drag', 'slide', 'match', 'match'][i];
    const tile = el('button', { class: `howto-tile demo-${demo}`, type: 'button' },
      el('span', { class: 'ic', html: icon(TILE_ICON[t.icon]) }),
      bi(t.label, { cls: 'label' }),
      bi(t.desc, { tag: 'p', cls: 'desc', layout: 'stack' }),
      el('span', { class: 'demo-hand', 'aria-hidden': 'true', html: icon('hand') }));
    tile.addEventListener('click', () => {
      tile.classList.remove('is-playing'); void tile.offsetWidth;
      tile.classList.add('is-playing');
      setTimeout(() => tile.classList.remove('is-playing'), 1600);
      done();
    });
    return tile;
  });

  stage.append(el('div', { class: 'stage-paper', 'aria-hidden': 'true' }), el('div', { class: 'howto-wrap stage-pad' },
    el('p', { class: 'howto-hint' }, bi(c.tapHint, { layout: 'inline' })),
    el('div', { class: 'howto-grid' }, tiles)));

  ctx.panel({
    tasks: [{ text: c.task, done: ctx.isComplete() }],
    primary: { text: c.gotIt, onClick: () => ctx.next() },
  });
  timer = setTimeout(done, 3000);
}

export function destroy() { clearTimeout(timer); }
