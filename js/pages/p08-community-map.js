// P08 · Scene 4 — From Kaohsiung to My Neighborhood: a community culture map and a cultural route.
//
//   1. Kaohsiung: a simple schematic map of the city (js/kaohsiung-map.js — not to scale) with "My Neighborhood"
//      marked near downtown. "Open Kaohsiung Community Map" zooms into it.
//   2. The neighbourhood board (js/community-board.js): six empty lots by the harbour. Drag a place card onto any
//      lot (or tap the card, then the lot): the place pops up and a short culture note explains it.
//   3. With four or more places: "Build a Cultural Route". Tap the places in the order you would visit them
//      (at least four stops). The route is drawn as a dashed path with numbered stops and kept in state.p08Route
//      for Scene 6 (P11) and the ending (P12). Badge: Route Builder.
// Rules: maps are schematic and say so ("Simplified map, not to scale"); the route is a learning route, not a
// pilgrimage — the temple is one place among the others.
import { el, bi, chip, toast, clearToasts, plain, notePopover } from '../ui.js';
import { icon } from '../icons.js';
import { createDragGroup } from '../drag.js';
import { playChime, playClick, playFlourish, playEnter } from '../sound.js';
import { earnBadge } from '../badges.js';
import { kaohsiungMap, KMAP } from '../kaohsiung-map.js';
import { communityBoard, NODE_IDS, NODE_ICON, lotPct } from '../community-board.js';

let group = null;
let timers = [];
let closeNote = null;

export function render(stage, ctx) {
  const c = ctx.content, k = ctx.CONTENT.common;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const placed = { ...(ctx.seen('placed') || {}) };          // lot → place id
  let phase = ctx.seen('phase') || 'map';                     // map → build → route → done
  let route = (ctx.seen('route') || (ctx.state.p08Route || []).map((r) => r.id)).filter((id) => Object.values(placed).includes(id));
  const count = () => Object.keys(placed).length;

  /* ---------- 1. Kaohsiung (schematic) ---------- */
  const km = kaohsiungMap({ uid: 'p08k' });
  const at = (lonlat, cls, ...kids) => { const [x, y] = km.pct(...lonlat); return el('span', { class: cls, style: { left: `${x}%`, top: `${y}%` } }, ...kids); };
  const hoodPin = el('button', { class: 'map-pin p08-hood is-pulse-loop', type: 'button', 'aria-label': plain(c.myNeighborhood), html: icon('home') });
  { const [x, y] = km.pct(...KMAP.hood); Object.assign(hoodPin.style, { left: `${x}%`, top: `${y}%` }); }
  const kmapBox = el('div', { class: 'p08-kmap' }, km.svg,
    at([120.43, 22.83], 'km-label is-city', bi(c.kaohsiung, { layout: 'stack' })),
    at([120.215, 22.5], 'km-label is-sea', bi(c.strait, { layout: 'stack' })),
    at([120.247, 22.585], 'km-label is-small is-harbor', bi(c.harbor, { layout: 'stack' })),
    at([120.36, 22.715], 'km-label is-small is-river', bi(c.loveRiver, { layout: 'stack' })),
    hoodPin,
    at(KMAP.hood, 'pin-tag p08-hood-tag', bi(c.myNeighborhood, { layout: 'stack' })),
    el('span', { class: 'km-north', 'aria-hidden': 'true' }, 'N'));
  const openBtn = el('button', { class: 'btn btn-primary p08-open', type: 'button' }, el('span', { class: 'ic', html: icon('map') }), bi(c.open, { layout: 'stack' }));
  const legend = el('div', { class: 'p08-legend' },
    el('div', { class: 'board-title' }, el('span', { class: 'board-orn', 'aria-hidden': 'true' }), bi(c.kaohsiung, { layout: 'inline' }), el('span', { class: 'board-orn is-r', 'aria-hidden': 'true' })),
    el('p', { class: 'p08-legend-text' }, bi(c.openPrompt)),
    el('div', { class: 'p08-key' },
      el('span', {}, el('i', { class: 'is-city' }), bi(c.kaohsiung, { layout: 'inline' })),
      el('span', {}, el('i', { class: 'is-river' }), bi(c.rivers, { layout: 'inline' })),
      el('span', {}, el('i', { class: 'is-hood' }), bi(c.myNeighborhood, { layout: 'inline' }))),
    openBtn,
    el('span', { class: 'p08-caption' }, bi(k.simpleMap, { layout: 'inline' })));
  const kview = el('div', { class: 'p08-kview' }, kmapBox, legend);

  /* ---------- 2. the neighbourhood board ---------- */
  const board = communityBoard({ placed, route, interactive: true });
  const locator = el('div', { class: 'p08-locator', 'aria-hidden': 'true' }, kaohsiungMap({ uid: 'p08loc', mountains: false, love: false }).svg, (() => {
    const [x, y] = km.pct(...KMAP.hood); return el('i', { style: { left: `${x}%`, top: `${y}%` } });
  })());
  const boardCaption = el('span', { class: 'p08-board-caption' }, bi(k.simpleMap, { layout: 'inline' }));
  const bview = el('div', { class: 'p08-bview' }, board.root, locator, boardCaption);
  const frameInner = el('div', { class: 'p08-frame' }, kview, bview);

  /* place cards */
  const cards = {};
  NODE_IDS.forEach((id) => {
    cards[id] = el('button', { class: 'node-card p08-card', type: 'button', 'data-id': id, 'aria-label': plain(c.nodes[id]) },
      el('span', { class: `ic${id === 'temple' ? ' is-temple' : ''}`, html: icon(NODE_ICON[id]) }), bi(c.nodes[id], { layout: 'stack' }));
    if (Object.values(placed).includes(id)) cards[id].classList.add('is-placed');
  });
  const buildBtn = el('button', { class: 'btn btn-primary p08-build', type: 'button', hidden: true }, el('span', { class: 'ic', html: icon('route') }), bi(c.buildRoute, { layout: 'stack' }));
  const tray = el('div', { class: 'paper-card p08-tray' },
    el('div', { class: 'p08-tray-head' },
      el('span', { class: 'p08-tray-title' }, el('span', { class: 'ic', html: icon('map') }), bi(c.myNeighborhood, { layout: 'stack' })),
      el('span', { class: 'p08-tray-intro' }, bi(c.placePrompt, { layout: 'stack' }))),
    el('div', { class: 'p08-cards' }, NODE_IDS.map((id) => cards[id])),
    buildBtn);

  /* route bar */
  const stopsRow = el('div', { class: 'p08-stops', role: 'list' });
  const undoBtn = el('button', { class: 'icon-btn p08-undo', type: 'button', 'aria-label': plain(k.undo), title: plain(k.undo), html: icon('undo') });
  const clearBtn = el('button', { class: 'chip p08-clear', type: 'button' }, bi(k.clear, { layout: 'inline' }));
  const finishBtn = el('button', { class: 'btn btn-primary p08-finish', type: 'button' }, el('span', { class: 'ic', html: icon('check') }), bi(c.finishRoute, { layout: 'stack' }));
  const editBtn = el('button', { class: 'chip p08-edit', type: 'button', hidden: true }, el('span', { class: 'ic', html: icon('route') }), bi(c.editRoute, { layout: 'inline' }));
  const routeTitle = el('span', { class: 'p08-tray-title' }, el('span', { class: 'ic', html: icon('route') }), bi(c.buildRoute, { layout: 'stack' }));
  const routeIntro = el('span', { class: 'p08-tray-intro' }, bi(c.routeIntro, { layout: 'stack' }));
  const routeThink = el('span', { class: 'p08-think', hidden: true }, el('span', { class: 'seal', 'aria-hidden': 'true', lang: 'zh-Hant' }, '想'),
    el('span', {}, el('b', {}, bi(c.reflectLabel, { layout: 'inline' })), bi(c.reflect, { layout: 'stack' })));
  const routeBar = el('div', { class: 'paper-card p08-routebar' },
    el('div', { class: 'p08-route-top' }, routeTitle, routeIntro, routeThink,
      el('div', { class: 'p08-route-actions' }, undoBtn, clearBtn, finishBtn, editBtn)),
    stopsRow);

  const titleText = el('span', {});
  const head = el('div', { class: 'p08-head' },
    el('div', { class: 'board-title p08-title' }, el('span', { class: 'board-orn', 'aria-hidden': 'true' }), titleText, el('span', { class: 'board-orn is-r', 'aria-hidden': 'true' })));
  const wrap = el('div', { class: 'p08-wrap' }, head, el('div', { class: 'map-carved p08-carved' }, frameInner), el('div', { class: 'p08-foot' }, tray, routeBar));
  stage.append(el('div', { class: 'scene p08' }, wrap));

  /* ---------- panel ---------- */
  ctx.panel({ body: [el('div', { class: 'chip-row' }, c.chips.map((v) => chip(v, { iconName: 'book', onClick: () => ctx.openVocab(v.en) })))] });
  const progress = () => ctx.setTasks([
    { text: c.task1, done: count() >= 4, count: `${Math.min(count(), 4)}/4` },
    { text: c.task2, done: phase === 'done', count: phase === 'done' ? `${route.length}` : `${Math.min(route.length, 4)}/4` },
  ]);

  function setPhase(p, animate = true) {
    phase = p; ctx.seen('phase', p);
    wrap.classList.remove('is-map', 'is-build', 'is-route', 'is-done', 'is-picking'); wrap.classList.add(`is-${p}`);
    if (animate && !reduce) { wrap.classList.remove('is-switch'); void wrap.offsetWidth; wrap.classList.add('is-switch'); }
    titleText.replaceChildren(bi(p === 'map' ? c.kaohsiung : p === 'done' ? c.myRoute : c.myNeighborhood, { layout: 'inline' }));
    kview.inert = p !== 'map'; bview.inert = p === 'map';
    if (p === 'build') startPlacing(); else { group?.destroy(); group = null; wrap.classList.remove('is-picking'); }
    routeTitle.replaceChildren(el('span', { class: 'ic', html: icon('route') }), bi(p === 'done' ? c.myRoute : c.buildRoute, { layout: 'stack' }));
    routeIntro.hidden = p === 'done'; routeThink.hidden = p !== 'done';
    [undoBtn, clearBtn, finishBtn].forEach((b) => { b.hidden = p === 'done'; });
    editBtn.hidden = p !== 'done';
    board.root.classList.toggle('is-routing', p === 'route');
    renderStops();
    progress();
  }

  /* ---------- open the map: zoom into the neighbourhood ---------- */
  function openMap() {
    if (phase !== 'map') return;
    playEnter?.();
    const [x, y] = km.pct(...KMAP.hood);
    kmapBox.style.setProperty('--ox', `${x}%`); kmapBox.style.setProperty('--oy', `${y}%`);
    if (!reduce) { wrap.classList.add('is-zooming'); timers.push(setTimeout(() => wrap.classList.remove('is-zooming'), 2200)); }
    setPhase('build', false);
    clearToasts();
    timers.push(setTimeout(() => toast(c.placePrompt, 'hint', 4500), reduce ? 0 : 1300));
  }
  openBtn.addEventListener('click', openMap);
  hoodPin.addEventListener('click', openMap);

  /* ---------- 2. place the six places ---------- */
  function startPlacing() {
    group?.destroy();
    group = createDragGroup({
      cards: NODE_IDS.map((id) => cards[id]).filter((cd) => !cd.classList.contains('is-placed')),
      targets: () => board.lots.filter((l) => !l.classList.contains('is-filled')),
      accept: () => true,
      onCorrect: (card, lot) => putPlace(+lot.dataset.lot, card.dataset.id),
    });
  }
  tray.addEventListener('pointerup', () => requestAnimationFrame(() => wrap.classList.toggle('is-picking', !!tray.querySelector('.p08-card.is-selected'))));
  function putPlace(lot, id) {
    placed[lot] = id; ctx.seen('placed', { ...placed });
    board.place(lot, id, !reduce);
    cards[id].classList.add('is-placed'); cards[id].classList.remove('is-selected'); cards[id].disabled = true; cards[id].tabIndex = -1;
    wrap.classList.remove('is-picking');
    playChime(Math.min(count(), 6) - 1);
    const n = count();
    // the culture note for this place, beside its lot
    closeNote?.();
    const [xp, yp] = lotPct(lot);
    timers.push(setTimeout(() => { closeNote = notePopover(bview, { xPct: xp, yPct: yp, title: c.nodes[id], body: c.nodeNotes[id], onClose: () => { closeNote = null; } }); }, reduce ? 0 : 350));
    clearToasts();
    if (n === 4) { toast(c.canRoute, 'success', 3500); buildBtn.hidden = false; buildBtn.classList.add('is-new'); }
    else if (n === 6) toast(c.allPlaced, 'success', 3000);
    progress();
  }
  buildBtn.addEventListener('click', () => { closeNote?.(); playClick(); setPhase('route'); clearToasts(); toast(c.routeIntro, 'hint', 4000); });

  /* ---------- 3. the cultural route ---------- */
  function renderStops() {
    const total = Math.max(4, route.length + (phase === 'route' && route.length < count() ? 1 : 0));
    stopsRow.replaceChildren(...Array.from({ length: total }, (_, i) => {
      const id = route[i];
      const item = el('span', { class: `p08-stop${id ? ' is-set' : ''}`, role: 'listitem' },
        el('b', {}, String(i + 1)),
        id ? bi(c.nodes[id], { layout: 'stack' }) : null);
      return i ? [el('span', { class: 'p08-stop-arrow', 'aria-hidden': 'true', html: icon('chevRight') }), item] : [item];
    }).flat());
    undoBtn.disabled = !route.length; clearBtn.disabled = !route.length;
    finishBtn.disabled = route.length < 4;
    finishBtn.classList.toggle('is-ready', route.length >= 4);
  }
  board.lots.forEach((lot) => lot.addEventListener('click', () => {
    if (phase !== 'route' || !lot.classList.contains('is-filled')) return;
    const id = lot.dataset.id;
    if (route.includes(id)) { clearToasts(); toast(c.routeAlready, 'hint', 2200); return; }
    route.push(id); ctx.seen('route', [...route]);
    board.setRoute(route, !reduce);
    playChime(Math.min(route.length, 6) - 1);
    renderStops(); progress();
    if (route.length === 4) { clearToasts(); toast(c.canFinish, 'success', 3000); }
  }));
  undoBtn.addEventListener('click', () => { route.pop(); ctx.seen('route', [...route]); board.setRoute(route); playClick(); renderStops(); progress(); });
  clearBtn.addEventListener('click', () => { route = []; ctx.seen('route', []); board.setRoute(route); playClick(); renderStops(); progress(); });
  finishBtn.addEventListener('click', () => {
    if (route.length < 4) { clearToasts(); toast(c.routeNeedMore, 'hint'); return; }
    saveRoute();
    setPhase('done');
    ctx.complete();
    playFlourish();
    earnBadge(ctx, 'route');
    board.setRoute(route, !reduce);
    timers.push(setTimeout(() => { clearToasts(); toast(c.complete, 'success', 3000); }, 4100));
  });
  editBtn.addEventListener('click', () => { playClick(); setPhase('route'); });
  function saveRoute() {
    const lotOf = (id) => +Object.keys(placed).find((l) => placed[l] === id);
    ctx.state.p08Route = route.map((id) => { const [x, y] = lotPct(lotOf(id)); return { id, lot: lotOf(id), x: +x.toFixed(2), y: +y.toFixed(2) }; });
    ctx.save();
  }

  /* ---------- start or restore ---------- */
  if (phase !== 'map') {
    const [x, y] = km.pct(...KMAP.hood);
    kmapBox.style.setProperty('--ox', `${x}%`); kmapBox.style.setProperty('--oy', `${y}%`);
  }
  if (count() >= 4) buildBtn.hidden = false;
  setPhase(phase, false);
  if (phase === 'done') ctx.complete();
}

export function destroy() {
  timers.forEach(clearTimeout); timers = [];
  group?.destroy(); group = null;
  closeNote = null;
}
