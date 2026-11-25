// P07 · Scene 3 — Cultural Objects and Landscape, as a scrolling story page (js/story.js):
//   Hero   the whole landscape (assets/img/p07_landscape.webp) and the three things you will do
//   Learn  three cards that stack as you scroll: look beyond the deity image · objects make a landscape · words
//   Do     four exhibits on stands (small temple, offering table, stone lions, old tree). Tapping one opens its card
//          (picture, what to notice, "View in AR": assets/models/p07/*.glb) and stamps it 觀 ("observed").
//          Below them, the meaning cards wait face down in a fan; after three objects they turn over. Drag each one
//          onto the object it describes (or tap the card, then the object). Right: it becomes the exhibit's brass
//          label. Not yet: a shake and a gentle hint.
//   Badge  all four matched: the landscape with its four name tags, the takeaway, AR of the whole landscape,
//          the "Landscape Observer" badge, and Back to the map / Next stop.
// Rules (storyboard): only these four objects are interactive. No deity close-up (the shrine's niche is empty and
// shaded), no incense burner, moon blocks or plaque. The offering table is for observation only (shown empty).
import { el, bi, chip, toast, clearToasts, plain, modal } from '../ui.js';
import { icon } from '../icons.js';
import { createDragGroup } from '../drag.js';
import { playChime, playMiss, playFlourish, playClick } from '../sound.js';
import { openPlaceAR, loadModelViewer, closePlaceAR } from '../ar-place.js';
import { earnBadge } from '../badges.js';
import { createStory } from '../story.js';

const ORDER = ['temple', 'table', 'lions', 'tree'];
const ICON = { temple: 'temple', table: 'table', lions: 'lion', tree: 'tree' };
const MEAN_ORDER = ['lions', 'tree', 'temple', 'table'];      // the meaning cards come in a different order
const IMG = (id) => `assets/img/p07_obj_${id}.webp`;
const GLB = (id) => `assets/models/p07/${id}.glb`;
// where each object stands in the landscape picture (% of 862 × 642), for its little name tag
const LAND_TAG = { tree: [22, 20], temple: [74, 30], table: [50, 76], lions: [23, 73] };

let group = null;
let story = null;
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

  story = createStory(stage, ctx);

  /* ---------- hero + learn ---------- */
  story.hero({ img: 'assets/img/p07_landscape.webp', imgW: 862, imgH: 642, intro: c.intro, plan: c.plan, planIcons: ['book', 'tap', 'medal'] });
  story.learn({ title: c.learnTitle, cards: c.learn });

  /* ---------- do: the four exhibits ---------- */
  const ex = {};
  const exhibits = ORDER.map((id, i) => {
    const o = c.objects[id];
    const status = el('span', { class: 'st-ex-tap' }, el('span', { class: 'ic', html: icon('tap') }), bi(c.tapToLook, { layout: 'stack' }));
    const holder = el('span', { class: 'st-ex-holder', 'aria-hidden': 'true' }, el('b', {}, '?'), bi(c.dropHere, { layout: 'stack' }));
    const plaque = el('span', { class: 'st-plaque' }, bi(o.meaning, { layout: 'stack' }));
    const card = el('div', { class: `st-ex is-${id}`, 'data-id': id, role: 'button', tabindex: '0', 'aria-label': plain(o.label), style: { '--i': i } },
      el('div', { class: 'st-ex-case' },
        el('span', { class: 'st-ex-no', 'aria-hidden': 'true' }, no(id)),
        el('img', { class: 'st-ex-img', src: IMG(id), alt: '', draggable: 'false', width: 600, height: 600 }),
        el('span', { class: 'st-ex-seal', 'aria-hidden': 'true', lang: 'zh-Hant' }, '觀')),
      el('div', { class: 'st-ex-label' },
        el('div', { class: 'st-ex-name' }, bi(o.label, { layout: 'stack' })),
        el('div', { class: 'st-ex-slot' }, status, holder, plaque)));
    // a tap opens the exhibit, unless a meaning card is waiting to be placed (then drag.js places it)
    card.addEventListener('click', () => { if (!fan.querySelector('.is-selected')) openExhibit(id); });
    card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openExhibit(id); } });
    ex[id] = { card, status, plaque };
    return card;
  });

  /* ---------- do: the meaning cards, face down in a fan until three objects are observed ---------- */
  const means = {};
  MEAN_ORDER.forEach((id, n) => {
    means[id] = el('button', { class: 'fan-card', type: 'button', 'data-id': id, 'aria-label': plain(c.objects[id].meaning), style: { '--n': n } },
      el('span', { class: 'fan-inner' },
        el('span', { class: 'fan-face fan-back', 'aria-hidden': 'true' },
          el('span', { class: 'fan-back-seal', lang: 'zh-Hant' }, '義'),
          bi(c.cardBack, { layout: 'stack', cls: 'fan-back-label' })),
        el('span', { class: 'fan-face fan-front' },
          el('span', { class: 'fan-grip', html: icon('grab') }),
          bi(c.objects[id].meaning, { layout: 'stack' }))));
  });
  const lockDots = el('span', { class: 'fan-lock-dots', 'aria-hidden': 'true' }, [0, 1, 2].map(() => el('i')));
  const lockText = el('span', { class: 'fan-lock-text' });
  const lock = el('div', { class: 'fan-lock' }, el('span', { class: 'fan-lock-ic', html: icon('puzzle') }), lockText, lockDots);
  const fanCards = el('div', { class: 'fan-cards' }, MEAN_ORDER.map((id) => means[id]));
  const fan = el('div', { class: 'st-fan' },
    el('div', { class: 'fan-title' }, el('span', { class: 'ic', html: icon('cards') }), bi(c.meaningTitle, { layout: 'inline' })),
    fanCards, lock);
  fan.addEventListener('pointerup', () => requestAnimationFrame(picking));
  const board = el('div', { class: 'st-exhibits' }, exhibits);
  const doSec = story.doSection({ title: c.doTitle, intro: c.doIntro, body: [board, fan] });

  // spread the cards that are still in the fan
  function layoutFan() {
    const left = MEAN_ORDER.filter((id) => !matched.has(id));
    left.forEach((id, j) => {
      const kk = j - (left.length - 1) / 2;
      means[id].style.setProperty('--k', kk.toFixed(2));
      means[id].style.setProperty('--k2', (kk * kk).toFixed(2));
    });
  }

  /* ---------- badge: the whole landscape ---------- */
  const landAR = el('button', { class: 'btn btn-primary info-ar', type: 'button' }, el('span', { class: 'ic', html: icon('camera') }), bi(c.arLandscape, { layout: 'stack' }));
  landAR.addEventListener('click', () => openPlaceAR({ id: 'landscape', title: c.landscapeTitle, fact: c.landscapeNote, src: GLB('landscape') }));
  const pic = el('div', { class: 'st-land' },
    el('img', { src: 'assets/img/p07_landscape.webp', alt: '', width: 862, height: 642, draggable: 'false' }),
    ORDER.map((id, i) => el('span', { class: 'st-land-tag', style: { left: `${LAND_TAG[id][0]}%`, top: `${LAND_TAG[id][1]}%`, '--i': i } },
      el('span', { class: 'ic', html: icon(ICON[id]) }), bi(c.objects[id].label, { layout: 'stack' }))));
  const badge = story.badgeSection({
    title: c.badgeTitle, badgeId: 'landscape', pic,
    takeTitle: c.landscapeTitle, takeText: c.landscapeNote, extra: [landAR], lockedText: c.badgeLocked,
  });

  /* ---------- the bar: story and words ---------- */
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
    if (first && seen.size === 3 && !doSec.classList.contains('is-matching')) whenClosed(() => openFan(true));
  }
  // run once the exhibit card (modal) has been closed
  function whenClosed(cb) {
    const layer = document.getElementById('modal-layer');
    const mo = new MutationObserver(() => { if (!layer.querySelector('.modal-scrim')) { mo.disconnect(); cb(); } });
    mo.observe(layer, { childList: true });
    watchers.push(mo);
  }

  /* ---------- 2. match the meanings: the cards turn over ---------- */
  function openFan(animate) {
    if (doSec.classList.contains('is-matching') || done) return;
    doSec.classList.add('is-matching');
    fan.classList.toggle('is-flipping', animate && !reduce);
    if (animate) {
      timers.push(setTimeout(() => fan.classList.remove('is-flipping'), 1400));
      clearToasts(); toast(c.matchUnlock, 'success', 4000); playClick();
      // bring the cards into view if they are below the screen
      const r = fan.getBoundingClientRect(), sr = story.scroller.getBoundingClientRect();
      if (r.bottom > sr.bottom - 8) story.scroller.scrollBy({ top: r.bottom - sr.bottom + 16, behavior: reduce ? 'auto' : 'smooth' });
    }
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
  function picking() { doSec.classList.toggle('is-picking', !!fan.querySelector('.fan-card.is-selected')); }
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
    layoutFan();
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
    doSec.classList.remove('is-matching', 'is-picking');
    doSec.classList.add('is-done');
    ctx.complete();
    story.steps.setDone(1);
    playFlourish();
    earnBadge(ctx, 'landscape');
    badge.unlock(true);
    timers.push(setTimeout(() => story.scrollTo('badge'), reduce ? 200 : 1400));
    timers.push(setTimeout(() => { clearToasts(); toast(c.complete, 'success', 3000); }, 3900));    // after the badge pop-up
  }

  /* ---------- start or restore (language switch, coming back) ---------- */
  story.ready();
  seen.forEach((id) => markSeen(id, false));
  matched.forEach((id) => showPlaque(id, false));
  layoutFan();
  if (done) { doSec.classList.add('is-done'); badge.unlock(false); story.steps.setDone(0); story.steps.setDone(1); ctx.complete(); }
  else if (seen.size >= 3 || matched.size) openFan(false);
  progress();
}

export function destroy() {
  timers.forEach(clearTimeout); timers = [];
  watchers.forEach((m) => m.disconnect()); watchers = [];
  group?.destroy(); group = null;
  story?.destroy(); story = null;
  closePlaceAR();
}
