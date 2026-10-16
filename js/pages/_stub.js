// _stub.js — placeholder for pages not built yet (keeps navigation working end to end).
import { el, bi, infoBox } from '../ui.js';

export function stubPage(owner, milestone) {
  return {
    render(stage, ctx) {
      stage.append(el('div', { class: 'stage-paper', 'aria-hidden': 'true' }), el('div', { class: 'stub' },
        el('div', { class: 'stub-card' },
          el('span', { class: 'stub-tag' }, `${ctx.id.toUpperCase()} · ${owner} · Milestone ${milestone}`),
          bi(ctx.content.heading, { tag: 'h2' }),
          bi(ctx.CONTENT.common.comingSoon, { tag: 'p' }))));
      ctx.panel({});
      ctx.complete();
    },
    destroy() {},
  };
}
