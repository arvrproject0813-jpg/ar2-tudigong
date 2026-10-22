// P05 · Scene 1 — Street-corner temple: a cultural node in community life.
// Drag Residential Area, Road, Market and Small Temple onto the map (or tap a card, then a circle).
// When all four are placed, tap the small temple to mark it as the Community Node: gold lines join it
// to the homes, the street and the market. Storyboard completion: 4 cards placed + temple selected.
//
// The map is the same 3D neighbourhood as P02/P04 in its street-corner layout, rendered from above
// (assets/img/p05_street_map.webp, 1692×995). Zone centres below are % of that image.
import { el, bi, chip, toast, notePopover, plain } from '../ui.js';
import { icon } from '../icons.js';
import { createDragGroup } from '../drag.js';
import { playChime, playMiss, playFlourish } from '../sound.js';

const MAP = 'assets/img/p05_street_map.webp';
const ZONES = [
  { id: 'residential', icon: 'home', x: 82, y: 28 },
  { id: 'road', icon: 'road', x: 66.5, y: 50 },
  { id: 'market', icon: 'market', x: 25.3, y: 74 },
  { id: 'temple', icon: 'temple', x: 79.4, y: 78, temple: true },
];
const TRAY_ORDER = ['temple', 'residential', 'market', 'road'];   // not the map order, so it is not a give-away

let group = null;
let timers = [];

export function render(stage, ctx) {
  const c = ctx.content;
  const { CONTENT } = ctx;
  const placed = new Set(ctx.seen('placed') || []);
  let nodeDone = !!ctx.seen('node');

  /* ---------- map with drop circles ---------- */
  const frame = el('div', { class: 'map-frame p05-frame' }, el('img', { src: MAP, alt: '' }));
  const lines = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  // same proportions as the map image, so the lines scale evenly
  lines.setAttribute('class', 'p05-lines'); lines.setAttribute('viewBox', '0 0 1692 995');
  lines.setAttribute('aria-hidden', 'true');
  frame.append(lines);

  const zones = {};
  const tags = {};
  ZONES.forEach((z) => {
    const zone = el('div', { class: 'p05-zone', 'data-id': z.id, style: { left: `${z.x}%`, top: `${z.y}%` }, role: 'button', 'aria-label': `${plain(c.explore)}: ?` },
      el('span', { class: 'q', 'aria-hidden': 'true' }, '?'));
    zones[z.id] = zone;
    frame.append(zone);
  });

  // a placed zone becomes a medallion pin with its label (the same pins as P04)
  const fillZone = (id, animate) => {
    const z = ZONES.find((x) => x.id === id);
    const zone = zones[id];
    zone.classList.add('is-filled');
    zone.replaceChildren();
    zone.setAttribute('aria-label', plain(c.cards[id]));
    const pin = el('span', { class: `map-pin is-done ${z.temple ? 'is-temple' : ''} ${animate ? 'p05-pop' : ''}`, html: icon(z.icon) });
    zone.append(pin);
    const tag = el('div', { class: 'pin-tag', style: { left: `${z.x}%`, top: `${z.y}%` } }, bi(c.cards[id], { layout: 'stack' }));
    tags[id] = tag;
    frame.append(tag);
  };

  /* ---------- card tray ---------- */
  const cards = TRAY_ORDER.map((id) => {
    const z = ZONES.find((x) => x.id === id);
    return el('button', { class: `node-card ${placed.has(id) ? 'is-placed' : ''}`, type: 'button', 'data-id': id, 'aria-label': plain(c.cards[id]) },
      el('span', { class: `ic ${z.temple ? 'is-temple' : ''}`, html: icon(z.icon) }),
      bi(c.cards[id], { layout: 'stack' }),
      el('span', { class: 'p05-check', 'aria-hidden': 'true', html: icon('check') }));
  });
  const tray = el('div', { class: 'p05-tray' }, cards);

  stage.append(el('div', { class: 'p05' },
    tray,
    el('div', { class: 'p05-mapwrap' }, el('div', { class: 'map-carved' }, frame))));

  /* ---------- the Community Node ---------- */
  const drawLines = (animate) => {
    const t = ZONES.find((z) => z.temple);
    lines.replaceChildren();
    ZONES.filter((z) => !z.temple).forEach((z, i) => {
      const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      l.setAttribute('x1', t.x * 16.92); l.setAttribute('y1', t.y * 9.95); l.setAttribute('x2', z.x * 16.92); l.setAttribute('y2', z.y * 9.95);
      l.setAttribute('pathLength', '1');
      if (animate) l.style.animationDelay = `${i * 0.18}s`; else l.classList.add('is-drawn');
      lines.append(l);
    });
  };
  const markNode = (animate) => {
    const zone = zones.temple;
    zone.classList.add('is-node');
    zone.querySelector('.map-pin')?.classList.remove('is-pulse-loop');
    tags.temple?.replaceChildren(bi(c.node, { layout: 'stack' }));
    tags.temple?.classList.add('is-node');
    drawLines(animate);
  };
  const askForNode = () => {
    const zone = zones.temple;
    zone.classList.add('is-ask');
    zone.querySelector('.map-pin')?.classList.add('is-pulse-loop');
    zone.addEventListener('click', onTempleTap);
  };
  function onTempleTap() {
    if (nodeDone || placed.size < ZONES.length) return;
    nodeDone = true;
    ctx.seen('node', true);
    zones.temple.removeEventListener('click', onTempleTap);
    zones.temple.classList.remove('is-ask');
    markNode(true);
    playFlourish();
    // let the gold lines draw first, then explain what they mean
    timers.push(setTimeout(() => notePopover(frame, { xPct: 79.4, yPct: 78, title: c.node, body: c.nodeNote }), 1400));
    progress();
    if (!ctx.isComplete()) {
      ctx.complete();
      if (!ctx.state.badges.includes('node')) { ctx.state.badges.push('node'); ctx.save(); }
      timers.push(setTimeout(() => toast(c.complete, 'success'), 1000));
    }
  }

  /* ---------- panel ---------- */
  ctx.panel({
    body: [el('div', { class: 'chip-row' },
      c.chips.map((v) => chip(v, { iconName: 'book', onClick: () => ctx.openVocab(v.en) })))],
  });
  const progress = () => ctx.setTasks([
    { text: c.task1, done: placed.size >= ZONES.length, count: `${placed.size}/${ZONES.length}` },
    { text: c.task2, done: nodeDone },
  ]);

  /* ---------- drag / tap-to-place ---------- */
  group = createDragGroup({
    cards: cards.filter((card) => !placed.has(card.dataset.id)),
    targets: () => Object.values(zones).filter((z) => !z.classList.contains('is-filled')),
    accept: (card, zone) => card.dataset.id === zone.dataset.id,
    onCorrect: (card, zone) => {
      const id = card.dataset.id;
      card.classList.add('is-placed');
      card.classList.remove('is-selected');
      fillZone(id, true);
      placed.add(id);
      ctx.seen('placed', [...placed]);
      playChime(placed.size - 1);
      progress();
      group.refreshTargets?.();
      if (placed.size === ZONES.length) {
        timers.push(setTimeout(() => { toast(c.tapTemple, 'hint'); askForNode(); }, 500));
      }
    },
    onWrong: (card) => {
      playMiss();
      toast(c.hints[card.dataset.id], 'hint');
    },
  });

  /* ---------- restore a return visit ---------- */
  placed.forEach((id) => fillZone(id, false));
  if (placed.size === ZONES.length) {
    if (nodeDone) markNode(false); else askForNode();
  }
  progress();
  if (placed.size === ZONES.length && nodeDone) ctx.complete();
  if (!placed.size) timers.push(setTimeout(() => toast(c.dragHint, 'hint'), 500));
}

export function destroy() {
  timers.forEach(clearTimeout); timers = [];
  group?.destroy(); group = null;
}
