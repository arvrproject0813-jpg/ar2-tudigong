// P07 · Scene 3 — Cultural Objects and Landscape: a small museum of the four approved objects.
//
//   1. Look closely: four exhibit niches (small temple, offering table, stone lions, old tree) in a carved wood
//      cabinet. The pictures are renders of the app's own 3D models (assets/img/p07_obj_*.webp, made with
//      assets/source-art/render). Tapping an exhibit opens its card: picture, what to notice, "View in AR"
//      (assets/models/p07/*.glb). The niche gets a red 觀 ("observed") seal.
//   2. After three are observed, the meaning cards unlock under the cabinet. Drag each one onto the object it
//      describes (or tap the card, then the object). Right: it becomes the exhibit's brass label. Not yet: a shake
//      and a gentle hint about the right object.
//   3. All four matched: badge "Landscape Observer", and the cabinet turns into one cultural landscape
//      (assets/img/p07_landscape.webp, AR: assets/models/p07/landscape.glb).
// Rules (storyboard): only these four objects are interactive. No deity close-up (the shrine's niche is empty and
// shaded), no incense burner, moon blocks or plaque. The offering table is for observation only (shown empty).
import { el, bi, chip, toast, clearToasts, plain, modal } from '../ui.js';
import { icon } from '../icons.js';
import { createDragGroup } from '../drag.js';
import { playChime, playMiss, playFlourish, playClick } from '../sound.js';
import { openPlaceAR, loadModelViewer, closePlaceAR } from '../ar-place.js';
import { earnBadge } from '../badges.js';

const ORDER = ['temple', 'table', 'lions', 'tree'];
const ICON = { temple: 'temple', table: 'table', lions: 'lion', tree: 'tree' };
const MEAN_ORDER = ['lions', 'tree', 'temple', 'table'];      // the meaning cards come in a different order
const IMG = (id) => `assets/img/p07_obj_${id}.webp`;
const GLB = (id) => `assets/models/p07/${id}.glb`;
// where each object stands in the landscape picture (% of 866 × 650), for its little name tag
const LAND_TAG = { tree: [22, 20], temple: [74, 30], table: [50, 76], lions: [23, 73] };

let group = null;
let timers = [];
let watchers = [];

export function render(stage, ctx) {
  const c = ctx.content, k = ctx.CONTENT.common;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const seen = new Set(ctx.seen('observed') || []);
  const matched = new Set(ctx.seen('matched') || []);
  let done = !!ctx.seen('done');
  let goodI = 0;
  const no = (id) => String(ORDER.indexOf(id) + 1).padStart(2, '0');

  /* ---------- the four exhibit niches ---------- */
  const ex = {};
  const exhibits = ORDER.map((id, i) => {
    const o = c.objects[id];
    const status = el('span', { class: 'p07-ex-tap' }, el('span', { class: 'ic', html: icon('tap') }), bi(c.tapToLook, { layout: 'stack' }));
    const holder = el('span', { class: 'p07-ex-holder', 'aria-hidden': 'true' }, el('b', {}, '?'), bi(c.dropHere, { layout: 'stack' }));
    const plaque = el('span', { class: 'p07-plaque' }, bi(o.meaning, { layout: 'stack' }));
    const card = el('div', { class: `p07-ex is-${id}`, 'data-id': id, role: 'button', tabindex: '0', 'aria-label': plain(o.label), style: { '--i': i } },
      el('div', { class: 'p07-ex-case' },
        el('span', { class: 'p07-ex-no', 'aria-hidden': 'true' }, no(id)),
        el('img', { class: 'p07-ex-img', src: IMG(id), alt: '', draggable: 'false', width: 600, height: 600 }),
        el('span', { class: 'p07-ex-seal', 'aria-hidden': 'true', lang: 'zh-Hant' }, '觀')),
      el('div', { class: 'p07-ex-label' },
        el('div', { class: 'p07-ex-name' }, bi(o.label, { layout: 'stack' })),
        el('div', { class: 'p07-ex-slot' }, status, holder, plaque)));
    // a tap opens the exhibit, unless a meaning card is waiting to be placed (then drag.js places it)
    card.addEventListener('click', () => { if (!tray.querySelector('.is-selected')) openExhibit(id); });
    card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openExhibit(id); } });
    ex[id] = { card, status, plaque };
    return card;
  });

  /* ---------- the meaning cards: brass label plates waiting to be fixed to the right exhibit ---------- */
  const means = {};
  MEAN_ORDER.forEach((id) => {
    means[id] = el('button', { class: 'node-card p07-mean', type: 'button', 'data-id': id, 'aria-label': plain(c.objects[id].meaning) },
      bi(c.objects[id].meaning, { layout: 'stack' }));
  });
  const lockDots = el('span', { class: 'p07-lock-dots', 'aria-hidden': 'true' }, [0, 1, 2].map(() => el('i')));
  const lockText = el('span', { class: 'p07-lock-text' });
  const lock = el('div', { class: 'p07-lock' }, el('span', { class: 'p07-lock-ic', html: icon('puzzle') }), lockText, lockDots);
  const tray = el('div', { class: 'paper-card p07-tray' },
    el('div', { class: 'p07-tray-head' },
      el('span', { class: 'p07-tray-title' }, el('span', { class: 'ic', html: icon('puzzle') }), bi(c.meaningTitle, { layout: 'stack' })),
      el('span', { class: 'p07-tray-intro' }, bi(c.matchIntro, { layout: 'stack' }))),
    el('div', { class: 'p07-means' }, MEAN_ORDER.map((id) => means[id])));
  tray.addEventListener('pointerup', () => requestAnimationFrame(picking));

  /* ---------- together: the cultural landscape (shown in the cabinet when everything is matched) ---------- */
  const landAR = el('button', { class: 'btn btn-primary info-ar', type: 'button' }, el('span', { class: 'ic', html: icon('camera') }), bi(c.arLandscape, { layout: 'stack' }));
  landAR.addEventListener('click', () => openPlaceAR({ id: 'landscape', title: c.landscapeTitle, fact: c.landscapeNote, src: GLB('landscape') }));
  const land = el('div', { class: 'p07-land', 'aria-hidden': 'true' },
    el('div', { class: 'p07-land-pic' },
      el('img', { src: 'assets/img/p07_landscape.webp', alt: '', width: 862, height: 642, draggable: 'false' }),
      ORDER.map((id, i) => el('span', { class: 'p07-land-tag', style: { left: `${LAND_TAG[id][0]}%`, top: `${LAND_TAG[id][1]}%`, '--i': i } },
        el('span', { class: 'ic', html: icon(ICON[id]) }), bi(c.objects[id].label, { layout: 'stack' })))),
    el('div', { class: 'paper-card p07-land-card' },
      el('span', { class: 'p07-land-seal', 'aria-hidden': 'true', lang: 'zh-Hant' }, '景'),
      el('h2', {}, bi(c.landscapeTitle)),
      el('p', {}, bi(c.landscapeNote)),
      landAR));

  const viewBtn = el('button', { class: 'chip p07-view', type: 'button', hidden: true });
  const setView = (landView, animate = true) => {
    cabinet.classList.toggle('is-land', landView);
    land.setAttribute('aria-hidden', String(!landView));
    exWrap.setAttribute('aria-hidden', String(landView));
    exWrap.inert = landView; land.inert = !landView;
    cabinet.classList.toggle('no-anim', !animate);
    viewBtn.replaceChildren(el('span', { class: 'ic', html: icon(landView ? 'back' : 'tree') }), bi(landView ? c.backToExhibits : c.seeLandscape, { layout: 'inline' }));
  };
  viewBtn.addEventListener('click', () => { playClick(); setView(!cabinet.classList.contains('is-land')); });

  const exWrap = el('div', { class: 'p07-exhibits' }, exhibits);
  const cabinet = el('div', { class: 'p07-cabinet' }, exWrap, land);
  const hall = el('div', { class: 'p07-hall' },
    el('div', { class: 'p07-head' },
      el('div', { class: 'board-title p07-banner' }, el('span', { class: 'board-orn', 'aria-hidden': 'true' }), bi(c.gallery, { layout: 'inline' }), el('span', { class: 'board-orn is-r', 'aria-hidden': 'true' })),
      viewBtn),
    el('div', { class: 'map-carved p07-frame' }, cabinet),
    el('div', { class: 'p07-foot' }, lock, tray));
  stage.append(el('div', { class: 'scene p07' }, hall));
  setView(false, false);
  land.inert = true;

  /* ---------- panel ---------- */
  ctx.panel({ body: [el('div', { class: 'chip-row' }, c.chips.map((v) => chip(v, { iconName: 'book', onClick: () => ctx.openVocab(v.en) })))] });
  const progress = () => {
    ctx.setTasks([
      { text: c.task1, done: seen.size >= 3, count: `${Math.min(seen.size, 3)}/3` },
      { text: c.task2, done: matched.size === 4, count: `${matched.size}/4` },
    ]);
    lockText.replaceChildren(bi(seen.size === 2 ? c.moreToSee : c.unlockHint, { layout: 'stack' }));
    [...lockDots.children].forEach((d, i) => d.classList.toggle('is-on', i < seen.size));
  };

  /* ---------- 1. look closely ---------- */
  function markSeen(id, animate) {
    const e = ex[id];
    e.card.classList.add('is-seen');
    e.status.replaceChildren(el('span', { class: 'ic', html: icon('check') }), bi(k.observed, { layout: 'stack' }));
    if (animate && !reduce) { e.card.classList.remove('is-stamping'); void e.card.offsetWidth; e.card.classList.add('is-stamping'); }
  }
  function openExhibit(id) {
    const o = c.objects[id];
    const first = !seen.has(id);
    if (first) {
      seen.add(id); ctx.seen('observed', [...seen]);
      markSeen(id, true);
      playChime(Math.min(seen.size, 4) - 1);
      progress();
    } else playClick();
    const ar = el('button', { class: 'btn btn-primary info-ar', type: 'button' }, el('span', { class: 'ic', html: icon('camera') }), bi(c.arOpen, { layout: 'stack' }));
    const close = modal({
      title: o.label,
      body: [el('div', { class: 'info-body' },
        el('div', { class: 'info-pic p07-info-pic' }, el('img', { src: IMG(id), alt: '', width: 600, height: 600 })),
        el('div', { class: 'info-text' },
          el('span', { class: 'info-tag' }, el('span', { class: 'ic', html: icon(ICON[id]) }), bi(c.exhibit, { layout: 'inline' }), el('b', {}, no(id))),
          el('p', {}, bi(o.note)), ar))],
    });
    ar.addEventListener('click', () => { close(); openPlaceAR({ id, title: o.label, fact: o.note, src: GLB(id) }); });
    document.querySelector('#modal-layer .modal')?.classList.add('info-dialog');
    loadModelViewer().catch(() => {});
    if (first && seen.size === 3 && !hall.classList.contains('is-matching')) whenClosed(() => openTray(true));
  }
  // run once the exhibit card (modal) has been closed
  function whenClosed(cb) {
    const layer = document.getElementById('modal-layer');
    const mo = new MutationObserver(() => { if (!layer.querySelector('.modal-scrim')) { mo.disconnect(); cb(); } });
    mo.observe(layer, { childList: true });
    watchers.push(mo);
  }

  /* ---------- 2. match the meanings ---------- */
  function openTray(animate) {
    if (hall.classList.contains('is-matching') || done) return;
    hall.classList.add('is-matching');
    if (animate && !reduce) { hall.classList.add('is-unlocking'); timers.push(setTimeout(() => hall.classList.remove('is-unlocking'), 900)); }
    if (animate) { clearToasts(); toast(c.matchUnlock, 'success', 4000); playClick(); }
    group?.destroy();
    group = createDragGroup({
      cards: Object.values(means).filter((m) => !matched.has(m.dataset.id)),
      targets: () => ORDER.filter((id) => !matched.has(id)).map((id) => ex[id].card),
      accept: (card, target) => card.dataset.id === target.dataset.id,
      onCorrect: (card) => match(card.dataset.id, true),
      onWrong: (card) => { playMiss(); clearToasts(); toast(c.objects[card.dataset.id].hint, 'hint'); picking(); },
    });
  }
  // a meaning card is selected: the exhibits that can still take one glow softly
  function picking() { hall.classList.toggle('is-picking', !!tray.querySelector('.p07-mean.is-selected')); }
  function showPlaque(id, animate) {
    const e = ex[id];
    e.card.classList.add('is-matched');
    if (animate && !reduce) { e.card.classList.remove('is-fixing'); void e.card.offsetWidth; e.card.classList.add('is-fixing'); }
    means[id].classList.add('is-placed'); means[id].classList.remove('is-selected'); means[id].disabled = true; means[id].tabIndex = -1;
  }
  function match(id, animate) {
    matched.add(id); ctx.seen('matched', [...matched]);
    if (!seen.has(id)) { seen.add(id); ctx.seen('observed', [...seen]); markSeen(id, animate); }
    showPlaque(id, animate);
    picking();
    playChime(matched.size - 1);
    clearToasts(); toast(k.goodMatch[goodI++ % k.goodMatch.length], 'success', 1800);
    progress();
    if (matched.size === 4) timers.push(setTimeout(finish, 650));
  }

  /* ---------- 3. together: a cultural landscape ---------- */
  function finish() {
    if (done) return;
    done = true; ctx.seen('done', true);
    group?.destroy(); group = null;
    hall.classList.remove('is-matching', 'is-picking');
    hall.classList.add('is-done');
    ctx.complete();
    playFlourish();
    earnBadge(ctx, 'landscape');
    viewBtn.hidden = false;
    timers.push(setTimeout(() => { clearToasts(); toast(c.complete, 'success', 3000); }, 3900));    // after the badge pop-up
    timers.push(setTimeout(() => setView(true), reduce ? 200 : 1100));
  }

  /* ---------- start or restore (language switch, coming back) ---------- */
  seen.forEach((id) => markSeen(id, false));
  matched.forEach((id) => showPlaque(id, false));
  if (done) { hall.classList.add('is-done'); viewBtn.hidden = false; setView(true, false); ctx.complete(); }
  else if (seen.size >= 3 || matched.size) openTray(false);
  progress();
}

export function destroy() {
  timers.forEach(clearTimeout); timers = [];
  watchers.forEach((m) => m.disconnect()); watchers = [];
  group?.destroy(); group = null;
  closePlaceAR();
}
