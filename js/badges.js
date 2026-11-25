// badges.js — the seven learning badges (shown together on P12) and the little "Badge earned" pop-up.
// Badge shape: a map-pin medallion (teal, gold ring, icon), never a charm, amulet or seal (component spec 14).
import CONTENT from '../content/content.js';
import { el, bi } from './ui.js';
import { icon } from './icons.js';

export const BADGES = ['node', 'clue', 'landscape', 'route', 'calendar', 'local', 'speaker'];
export const BADGE_ICON = { node: 'temple', clue: 'bulb', landscape: 'tree', route: 'route', calendar: 'calendar', local: 'fields', speaker: 'speaker' };

/** A badge medallion: <span class="medal"> with the pin shape, a gold ring and the badge's icon. */
export function medal(id, { earned = true, cls = '' } = {}) {
  return el('span', { class: `medal ${earned ? 'is-earned' : 'is-locked'} ${cls}`.trim(), 'aria-hidden': 'true' },
    el('span', { class: 'medal-pin', html: icon('medal') }),
    el('span', { class: 'medal-ic', html: icon(BADGE_ICON[id] || 'star') }));
}

/** Give the badge once; the first time, show a short pop-up at the top of the stage. Returns true if new. */
export function earnBadge(ctx, id) {
  if (ctx.state.badges.includes(id)) return false;
  ctx.state.badges.push(id); ctx.save();
  showBadge(id);
  return true;
}

let popTimer = 0;
export function showBadge(id) {
  const name = CONTENT.p12.badges[id];
  document.querySelector('.badge-pop')?.remove();
  clearTimeout(popTimer);
  const dots = el('span', { class: 'badge-dots', 'aria-hidden': 'true' }, Array.from({ length: 6 }, (_, i) => el('i', { style: { '--a': `${i * 60}deg` } })));
  const pop = el('div', { class: 'badge-pop', role: 'status' },
    el('span', { class: 'badge-pop-medal' }, medal(id), dots),
    el('span', { class: 'badge-pop-text' }, bi(CONTENT.common.badgeEarned, { layout: 'inline', cls: 'badge-pop-eyebrow' }), bi(name, { layout: 'stack', cls: 'badge-pop-name' })));
  (document.getElementById('toast-layer') || document.body).append(pop);
  popTimer = setTimeout(() => { pop.classList.add('is-leaving'); setTimeout(() => pop.remove(), 400); }, 3600);
}
