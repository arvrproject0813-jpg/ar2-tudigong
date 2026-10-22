// P05 · Scene 1 — Street-corner temple: a cultural node in community life.
//
// The game (storyboard: place 4 cards in the right zones + select the temple node):
//   1. Riddle cards, one at a time: an English riddle (Chinese below) describes a place.
//      Drag the card to its circle on the map (or tap the card, then the circle).
//   2. The neighbourhood wakes up: the map starts as a misty dawn; each right answer clears the mist
//      around that place and shows it awake (shops open, people, laundry, lanterns lit). Placing the
//      road sends a scooter down the street.
//   3. Neighbourhood passport: each right answer stamps a red seal (住 路 市 廟); a card placed with no
//      mistakes gets a gold seal. Two wrong tries on a card make its circle glow softly (gentle help).
//   4. Meeting point: "Where do the homes, the street and the market all meet?" Tapping the small
//      temple makes it the Community Node: gold lines join it to the other places, neighbours walk along
//      them, and the whole neighbourhood wakes up.
//   5. After that, tapping any place (and a park) opens a dialog: picture, short explanation, View in AR
//      (js/ar-place.js; models in assets/models/p05/).
//
// Art: the 3D neighbourhood (js/ar-diorama.js, street layout) rendered from above twice from the same
// camera: assets/img/p05_dawn.webp and p05_awake.webp (1692 × 995), plus p05_mist.webp and two scooter
// sprites. Positions below are % of those images.
import { el, bi, chip, toast, clearToasts, notePopover, plain, modal } from '../ui.js';
import { icon } from '../icons.js';
import { createDragGroup } from '../drag.js';
import { playChime, playMiss, playFlourish } from '../sound.js';
import { openPlaceAR, loadModelViewer } from '../ar-place.js';

const IMG = { dawn: 'assets/img/p05_dawn.webp', awake: 'assets/img/p05_awake.webp', mist: 'assets/img/p05_mist.webp',
  scooterDown: 'assets/img/p05_scooter_down.webp', scooterLeft: 'assets/img/p05_scooter_left.webp' };
const VW = 1692, VH = 995;                       // image size = SVG viewBox
const ZONES = [
  { id: 'residential', icon: 'home', x: 77.0, y: 28.9, r: 300, seal: '住', tagAbove: true },
  { id: 'road', icon: 'road', x: 66.5, y: 51.8, r: 220, seal: '路' },
  { id: 'market', icon: 'market', x: 26.0, y: 73.1, r: 250, seal: '市' },
  { id: 'temple', icon: 'temple', x: 78.8, y: 77.8, r: 210, seal: '廟', temple: true },
];
const DECK = ['market', 'residential', 'temple', 'road'];   // riddle order
const SVGNS = 'http://www.w3.org/2000/svg';
const svgEl = (tag, attrs = {}) => { const n = document.createElementNS(SVGNS, tag); Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v)); return n; };

let group = null;
let timers = [];
let rafs = [];

export function render(stage, ctx) {
  const c = ctx.content;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const placed = new Set(ctx.seen('placed') || []);
  const clean = new Set(ctx.seen('clean') || []);
  let nodeDone = !!ctx.seen('node');
  let goldToastShown = false;
  const misses = {};
  const Z = Object.fromEntries(ZONES.map((z) => [z.id, z]));

  /* ---------- the scene: dawn picture, awake picture revealed through a mask, mist on top ---------- */
  const uid = `p05${Date.now().toString(36)}`;
  const scene = svgEl('svg', { class: 'p05-scene', viewBox: `0 0 ${VW} ${VH}`, 'aria-hidden': 'true' });
  const defs = svgEl('defs');
  const soft = svgEl('radialGradient', { id: `${uid}-w` });
  soft.append(svgEl('stop', { offset: '0.55', 'stop-color': '#fff', 'stop-opacity': '1' }), svgEl('stop', { offset: '1', 'stop-color': '#fff', 'stop-opacity': '0' }));
  const softK = svgEl('radialGradient', { id: `${uid}-k` });
  softK.append(svgEl('stop', { offset: '0.55', 'stop-color': '#000', 'stop-opacity': '1' }), svgEl('stop', { offset: '1', 'stop-color': '#000', 'stop-opacity': '0' }));
  const reveal = svgEl('mask', { id: `${uid}-reveal`, maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: VW, height: VH });
  reveal.append(svgEl('rect', { width: VW, height: VH, fill: '#000' }));
  const clear = svgEl('mask', { id: `${uid}-clear`, maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: VW, height: VH });
  clear.append(svgEl('rect', { width: VW, height: VH, fill: '#fff' }));
  defs.append(soft, softK, reveal, clear);
  const lines = svgEl('g', { class: 'p05-lines' });
  scene.append(defs,
    svgEl('image', { href: IMG.dawn, width: VW, height: VH }),
    svgEl('image', { href: IMG.awake, width: VW, height: VH, mask: `url(#${uid}-reveal)` }),
    svgEl('image', { class: 'p05-mist', href: IMG.mist, width: VW, height: VH, preserveAspectRatio: 'none', mask: `url(#${uid}-clear)` }),
    lines);

  // one pair of circles per opening (white in the reveal mask, black in the mist mask), grown with a tween
  const openings = [];
  const openAt = (x, y, r, animate, ms = 900) => {
    const cx = x / 100 * VW, cy = y / 100 * VH;
    const a = svgEl('circle', { cx, cy, r: 0, fill: `url(#${uid}-w)` });
    const b = svgEl('circle', { cx, cy, r: 0, fill: `url(#${uid}-k)` });
    reveal.append(a); clear.append(b); openings.push(a, b);
    if (!animate || reduce) { a.setAttribute('r', r); b.setAttribute('r', r); return; }
    const t0 = performance.now();
    const step = (now) => {
      const k = Math.min(1, Math.max(0, (now - t0) / ms)), e = 1 - Math.pow(1 - k, 3);
      a.setAttribute('r', r * e); b.setAttribute('r', r * e);
      if (k < 1) rafs.push(requestAnimationFrame(step));
    };
    rafs.push(requestAnimationFrame(step));
  };

  const frame = el('div', { class: 'map-frame p05-frame' }, scene);

  // the scooter that drives down the street once the road is placed
  const scooters = el('div', { class: 'p05-scooters', 'aria-hidden': 'true', hidden: true },
    el('img', { class: 'down', src: IMG.scooterDown, alt: '' }),
    el('img', { class: 'left', src: IMG.scooterLeft, alt: '' }));
  frame.append(scooters);
  const startScooter = () => { if (!reduce) scooters.hidden = false; };

  /* ---------- drop circles and pins ---------- */
  const zones = {}, tags = {};
  ZONES.forEach((z) => {
    const zone = el('div', { class: 'p05-zone', 'data-id': z.id, style: { left: `${z.x}%`, top: `${z.y}%` }, role: 'button', 'aria-label': '?' },
      el('span', { class: 'q', 'aria-hidden': 'true' }, '?'));
    zones[z.id] = zone;
    frame.append(zone);
  });
  const fillZone = (id, animate) => {
    const z = Z[id], zone = zones[id];
    zone.classList.remove('is-glow');
    zone.classList.add('is-filled');
    zone.replaceChildren(el('span', { class: `map-pin is-done ${z.temple ? 'is-temple' : ''} ${animate && !reduce ? 'p05-pop' : ''}`, html: icon(z.icon) }));
    zone.setAttribute('aria-label', plain(c.cards[id]));
    const tag = el('div', { class: `pin-tag ${z.tagAbove ? 'is-above' : ''} ${z.temple || z.id === 'road' ? 'p05-tag-left' : ''}`, style: { left: `${z.x}%`, top: `${z.y}%` } }, bi(c.cards[id], { layout: 'stack' }));
    tags[id] = tag; frame.append(tag);
    openAt(z.x, z.y, z.r, animate);
    if (id === 'road') startScooter();
  };

  /* ---------- tray: riddle deck + passport ---------- */
  const deckSlot = el('div', { class: 'p05-deckslot' });
  const deckCount = el('div', { class: 'p05-deckcount', 'aria-hidden': 'true' });
  const seals = {}, rows = {};
  ZONES.forEach((z) => {
    seals[z.id] = el('span', { class: 'p05-seal', 'data-id': z.id, lang: 'zh-Hant', 'aria-hidden': 'true' }, z.seal);
    rows[z.id] = el('li', { class: 'p05-pp-row', 'aria-label': '?' }, seals[z.id], el('span', { class: 'p05-pp-name' }, el('span', { class: 'blank', 'aria-hidden': 'true' })));
  });
  const passport = el('div', { class: 'p05-passport' },
    el('div', { class: 'p05-pp-spine', lang: 'zh-Hant', 'aria-hidden': 'true' }, c.passport.zh),   // narrow strip: written downwards
    el('div', { class: 'p05-pp-title' }, bi(c.passport, { layout: 'stack' })),
    el('ol', { class: 'p05-seals' }, ZONES.map((z) => rows[z.id])));
  const stamp = (id, gold, animate) => {
    const s = seals[id];
    rows[id].classList.add('is-stamped');
    rows[id].setAttribute('aria-label', plain(c.cards[id]));
    rows[id].querySelector('.p05-pp-name').replaceChildren(bi(c.cards[id], { layout: 'stack' }));
    s.classList.add('is-stamped');
    if (gold) s.classList.add('is-gold');
    if (animate && !reduce) { s.classList.remove('p05-stamp'); void s.offsetWidth; s.classList.add('p05-stamp'); }
  };
  const tray = el('div', { class: 'p05-tray' }, deckSlot, deckCount, passport);


  // tray and map travel together as one group, centred in the stage (they slide over when the panel closes)
  stage.append(el('div', { class: 'p05' }, el('div', { class: 'p05-group' }, el('div', { class: 'p05-traywrap' }, tray), el('div', { class: 'map-carved' }, frame))));

  /* ---------- panel ---------- */
  ctx.panel({
    body: [el('div', { class: 'chip-row' },
      c.chips.map((v) => chip(v, { iconName: 'book', onClick: () => ctx.openVocab(v.en) })))],
  });
  const progress = () => ctx.setTasks([
    { text: c.task1, done: placed.size >= ZONES.length, count: `${placed.size}/${ZONES.length}` },
    { text: c.task2, done: nodeDone },
  ]);

  /* ---------- the riddle deck ---------- */
  const nextId = () => DECK.find((id) => !placed.has(id));
  function deal() {
    group?.destroy(); group = null;
    const id = nextId();
    const left = DECK.filter((d) => !placed.has(d)).length;
    deckCount.textContent = left > 1 ? `+${left - 1}` : '';
    deckCount.hidden = left <= 1;
    if (!id) { deckSlot.replaceChildren(); deckSlot.classList.add('is-empty'); return; }
    const card = el('button', { class: 'node-card p05-riddle', type: 'button', 'data-id': id, 'aria-label': plain(c.riddles[id]) },
      el('span', { class: 'p05-riddle-head' }, el('span', { class: 'q', 'aria-hidden': 'true' }, '?'), bi(c.riddle, { layout: 'inline' })),
      bi(c.riddles[id], { layout: 'stack', cls: 'p05-riddle-text' }));
    deckSlot.replaceChildren(card);
    if (!reduce) card.classList.add('p05-deal');
    group = createDragGroup({
      cards: [card],
      targets: () => ZONES.map((z) => zones[z.id]).filter((zn) => !zn.classList.contains('is-filled')),
      accept: (cd, zone) => cd.dataset.id === zone.dataset.id,
      onCorrect: (cd) => place(cd.dataset.id),
      onWrong: (cd, zone) => {
        const cid = cd.dataset.id;
        misses[cid] = (misses[cid] || 0) + 1;
        playMiss();
        clearToasts();
        toast(c.hints[cid], 'hint');
        if (misses[cid] >= 2) zones[cid].classList.add('is-glow');        // gentle help after two tries
      },
    });
  }

  function place(id) {
    const gold = !misses[id];
    placed.add(id);
    if (gold) clean.add(id);
    ctx.seen('placed', [...placed]);
    ctx.seen('clean', [...clean]);
    fillZone(id, true);
    stamp(id, gold, true);
    playChime(placed.size - 1);
    if (gold && !goldToastShown) { goldToastShown = true; toast(c.goldSeal, 'success'); }
    progress();
    timers.push(setTimeout(deal, reduce ? 0 : 450));
    if (placed.size === ZONES.length) timers.push(setTimeout(askMeetingPoint, 900));
  }

  /* ---------- the meeting point ---------- */
  function askMeetingPoint() {
    if (nodeDone) return;
    // the question takes the place of the riddle deck
    const card = el('div', { class: 'node-card p05-riddle p05-meetcard', role: 'note' },
      el('span', { class: 'p05-riddle-head' }, el('span', { class: 'q seal', 'aria-hidden': 'true', lang: 'zh-Hant' }, '問')),
      bi(c.meetQ, { layout: 'stack', cls: 'p05-riddle-text' }));
    if (!reduce) card.classList.add('p05-deal');
    deckSlot.classList.remove('is-empty'); deckSlot.classList.add('is-question');
    deckSlot.replaceChildren(card);
    ZONES.forEach((z) => {
      const zone = zones[z.id];
      zone.classList.add('is-ask');
      zone.onclick = () => (z.temple ? makeNode() : (playMiss(), clearToasts(), toast(c.meetWrong, 'hint'), shake(zone)));
    });
  }
  const shake = (zone) => { zone.classList.remove('is-hint'); void zone.offsetWidth; zone.classList.add('is-hint'); };

  function drawNode(animate) {
    const t = Z.temple, tx = t.x / 100 * VW, ty = t.y / 100 * VH;
    lines.replaceChildren();
    ZONES.filter((z) => !z.temple).forEach((z, i) => {
      const x = z.x / 100 * VW, y = z.y / 100 * VH;
      const l = svgEl('line', { x1: tx, y1: ty, x2: x, y2: y, pathLength: 1, class: animate && !reduce ? '' : 'is-drawn' });
      if (animate && !reduce) l.style.animationDelay = `${i * 0.18}s`;
      lines.append(l);
      if (!reduce) {                 // neighbours walking from each place to the small temple
        [0, 1].forEach((k) => {
          const dur = `${4.2 + i * 0.4}s`, begin = `${1 + k * 2.1 + i * 0.3}s`;
          const w = svgEl('g', { class: `p05-walker w${(i + k) % 3}`, opacity: 0 });
          w.append(svgEl('ellipse', { cx: 0, cy: -22, rx: 15, ry: 22 }), svgEl('circle', { cx: 0, cy: -56, r: 12.5 }));
          w.append(svgEl('animateMotion', { dur, begin, repeatCount: 'indefinite', path: `M${x} ${y} L${tx} ${ty}` }),
            svgEl('animate', { attributeName: 'opacity', values: '0;1;1;0', keyTimes: '0;0.12;0.85;1', dur, begin, repeatCount: 'indefinite' }));
          lines.append(w);
        });
      }
    });
    zones.temple.classList.add('is-node');
    tags.temple?.replaceChildren(bi(c.node, { layout: 'stack' }));
    tags.temple?.classList.add('is-node');
  }

  function makeNode() {
    if (nodeDone) return;
    nodeDone = true;
    ctx.seen('node', true);
    deckSlot.replaceChildren(); deckSlot.classList.remove('is-question'); deckSlot.classList.add('is-empty');
    tray.classList.add('is-done');
    ZONES.forEach((z) => { zones[z.id].classList.remove('is-ask'); zones[z.id].onclick = null; });
    drawNode(true);
    playFlourish();
    // the whole neighbourhood wakes up from the temple outwards
    timers.push(setTimeout(() => openAt(Z.temple.x, Z.temple.y, 2400, true, 1800), 500));
    timers.push(setTimeout(() => notePopover(frame, { xPct: Z.temple.x, yPct: Z.temple.y, title: c.node, body: c.nodeNote }), reduce ? 600 : 3400));
    progress();
    if (!ctx.isComplete()) {
      ctx.complete();
      if (!ctx.state.badges.includes('node')) { ctx.state.badges.push('node'); ctx.save(); }
      timers.push(setTimeout(() => toast(c.complete, 'success'), 1100));
    }
    timers.push(setTimeout(() => { enableAR(true); toast(c.arTry, 'hint', 5000); }, reduce ? 800 : 4600));
  }

  /* ---------- after the game: every place opens in the AR camera ---------- */
  const PARK = { id: 'park', icon: 'tree', x: 50.5, y: 61.5 };
  let arOn = false;
  const placeTitle = (id) => (id === 'temple' ? c.node : id === 'park' ? c.park : c.cards[id]);
  // tapping a place: a small dialog with a picture, a short explanation and a "View in AR" button
  const openAR = (id) => {
    const title = placeTitle(id);
    let close = null;
    const go = el('button', { class: 'btn btn-primary p05-info-ar', type: 'button' },
      el('span', { class: 'ic', html: icon('camera') }), bi(c.arOpen, { layout: 'stack' }));
    go.addEventListener('click', () => { close?.(); openPlaceAR({ id, title, fact: c.arFacts[id] }); });
    close = modal({
      title,
      body: [el('div', { class: 'p05-info-body' },
        el('div', { class: 'p05-info-pic' }, el('img', { src: `assets/img/p05_place_${id}.webp`, alt: '', width: 520, height: 400 })),
        el('div', { class: 'p05-info-text' }, el('p', {}, bi(c.arFacts[id])), go))],
    });
    document.querySelector('#modal-layer .modal')?.classList.add('p05-info');
    go.focus();
  };
  function enableAR(animate) {
    if (arOn) return;
    arOn = true;
    ZONES.forEach((z) => {
      const zone = zones[z.id];
      zone.classList.add('is-ar');
      zone.setAttribute('aria-label', `${plain(z.temple ? c.node : c.cards[z.id])} · ${plain(c.arOpen)}`);
      zone.tabIndex = 0;
      zone.onclick = () => openAR(z.id);
      zone.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openAR(z.id); } };
    });
    const park = el('div', { class: 'p05-zone is-filled is-ar p05-park', role: 'button', tabindex: '0', 'aria-label': `${plain(c.park)} · ${plain(c.arOpen)}`, style: { left: `${PARK.x}%`, top: `${PARK.y}%` },
      onclick: () => openAR('park'), onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openAR('park'); } } },
      el('span', { class: `map-pin is-done ${animate && !reduce ? 'p05-pop' : ''}`, html: icon(PARK.icon) }));
    frame.append(park, el('div', { class: 'pin-tag is-above', style: { left: `${PARK.x}%`, top: `${PARK.y}%` } }, bi(c.park, { layout: 'stack' })));
    loadModelViewer().catch(() => {});        // warm up the 3D viewer
  }

  /* ---------- start or restore ---------- */
  placed.forEach((id) => { fillZone(id, false); stamp(id, clean.has(id), false); });
  deal();
  if (nodeDone) { drawNode(false); openAt(Z.temple.x, Z.temple.y, 2400, false); enableAR(false); tray.classList.add('is-done'); }
  else if (placed.size === ZONES.length) askMeetingPoint();
  progress();
  if (nodeDone) ctx.complete();
  if (!placed.size) timers.push(setTimeout(() => toast(c.dragHint, 'hint'), 600));
}

export function destroy() {
  timers.forEach(clearTimeout); timers = [];
  rafs.forEach(cancelAnimationFrame); rafs = [];
  group?.destroy(); group = null;
}
