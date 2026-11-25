// P10 · Scene 6 — Bogong in Meinong: one belief, different local expressions.
//
//   Left, a travel card: a schematic map from downtown Kaohsiung to Meinong (js/kaohsiung-map.js, not to scale) — tap
//   the Meinong pin for a short note — and three Meinong culture cards made from the team's 3D models: a Hakka
//   settlement, a tobacco-curing barn and a Bogong shrine (assets/img/p10_*.webp, assets/models/p10/*.glb). Each card
//   opens a picture, a short note and "View in AR".
//   Right, the matching task (team script claude/ui_narration_p10_p12.md): tap a concept card (Tudigong, Bogong,
//   Fuchang Case) and then its meaning, or drag it. Right: a green check and a culture note. Not yet: a gentle hint and
//   the card goes back. All three: badge "Local Variation" and "Compare Cultural Expressions" opens the compare card
//   (Tudigong and Bogong side by side, "Did you know?", and the Yong'an fuchang as one local case, with its source).
// Rules: fuchang appears only as the Yong'an case, never as a general name, and is not pictured. The Bogong shrine is
// the team's conceptual 3D model; its card says so ("not a copy of a real shrine").
import { el, bi, chip, toast, clearToasts, plain, modal, notePopover } from '../ui.js';
import { icon } from '../icons.js';
import { createDragGroup } from '../drag.js';
import { playChime, playMiss, playFlourish, playClick } from '../sound.js';
import { earnBadge } from '../badges.js';
import { kaohsiungMap, KMAP } from '../kaohsiung-map.js';
import { openPlaceAR, loadModelViewer, closePlaceAR } from '../ar-place.js';

const IDS = ['tudigong', 'bogong', 'fuchang'];
const MEAN_ORDER = ['bogong', 'fuchang', 'tudigong'];
const ICON = { tudigong: 'temple', bogong: 'fields', fuchang: 'star' };
const VIEW = [40, 110, 470, 420];                 // map units: downtown Kaohsiung up to Meinong
// Meinong culture cards: picture (render of the team's model), its size, the model for AR, an icon
const CARDS = {
  settlement: ['assets/img/p10_settlement.webp', 603, 466, 'assets/models/p10/meinong.glb', 'home'],
  barn: ['assets/img/p10_barn.webp', 588, 356, 'assets/models/p10/barn.glb', 'fields'],
  bogong: ['assets/img/p10_bogong.webp', 623, 379, 'assets/models/p10/bogong.glb', 'tree'],
};

let group = null;
let timers = [];
let closeNote = null;

export function render(stage, ctx) {
  const c = ctx.content, k = ctx.CONTENT.common;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const matched = new Set(ctx.seen('matched') || []);
  let done = !!ctx.seen('done');
  let goodI = 0;

  /* ---------- the trip: downtown Kaohsiung → Meinong ---------- */
  const km = kaohsiungMap({ uid: 'p10k', view: VIEW, love: false });
  const [dx, dy] = km.xy(...KMAP.downtown), [mx, my] = km.xy(...KMAP.meinong);
  const trip = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  trip.setAttribute('class', 'km-trip');
  trip.setAttribute('d', `M${dx.toFixed(1)} ${dy.toFixed(1)} Q ${(dx + 150).toFixed(1)} ${(dy - 60).toFixed(1)} ${mx.toFixed(1)} ${(my + 6).toFixed(1)}`);
  km.svg.append(trip);
  const pos = (lonlat) => { const [x, y] = km.pct(...lonlat); return { left: `${x}%`, top: `${y}%` }; };
  const meinongPin = el('button', { class: `map-pin is-temple p10-pin${ctx.seen('meinong') ? ' is-done' : ' is-pulse-loop'}`, type: 'button', 'aria-label': plain(c.place), style: pos(KMAP.meinong), html: icon('fields') });
  const mapBox = el('div', { class: 'p10-map' }, km.svg,
    el('span', { class: 'km-label is-city p10-city', style: pos([120.33, 22.8]) }, bi(c.kaohsiung, { layout: 'stack' })),
    el('span', { class: 'p10-start', style: pos(KMAP.downtown) }),
    el('span', { class: 'pin-tag p10-start-tag', style: pos(KMAP.downtown) }, bi(c.downtown, { layout: 'stack' })),
    meinongPin,
    el('span', { class: 'pin-tag p10-pin-tag', style: pos(KMAP.meinong) }, bi(c.place, { layout: 'stack' })),
    el('span', { class: 'km-north', 'aria-hidden': 'true' }, 'N'));
  meinongPin.addEventListener('click', () => {
    closeNote?.();
    playClick();
    ctx.seen('meinong', true);
    meinongPin.classList.remove('is-pulse-loop'); meinongPin.classList.add('is-done');
    const r = meinongPin.getBoundingClientRect(), box = tripCard.getBoundingClientRect();
    const x = ((r.left + r.width / 2 - box.left) / box.width) * 100, y = ((r.top + r.height / 2 - box.top) / box.height) * 100;
    closeNote = notePopover(tripCard, { xPct: x, yPct: y, title: c.meinongTitle, body: c.meinongNote, onClose: () => { closeNote = null; } });
  });
  const tripCard = el('div', { class: 'paper-card p10-trip' },
    el('div', { class: 'p10-trip-head' }, el('span', { class: 'ic', html: icon('map') }), bi(c.place, { layout: 'stack' })),
    el('div', { class: 'map-carved p10-carved' }, mapBox),
    el('div', { class: 'p10-prompt' }, el('span', { class: 'ic', html: icon('tap') }),
      el('span', {}, bi(c.mapPrompt, { layout: 'stack' }), el('span', { class: 'p10-map-caption' }, bi(k.simpleMap, { layout: 'inline' })))),
    el('div', { class: 'p10-cards' },
      el('span', { class: 'p10-cards-title' }, bi(c.cardsTitle, { layout: 'inline' })),
      el('div', { class: 'p10-cards-row' }, Object.keys(CARDS).map((id) => {
        const [img, w, h] = CARDS[id];
        const b = el('button', { class: `p10-mcard is-${id}`, type: 'button', 'aria-label': plain(c.cards[id].title) },
          el('span', { class: 'p10-mcard-pic' }, el('img', { src: img, alt: '', width: w, height: h, draggable: 'false' })),
          el('span', { class: 'p10-mcard-name' }, bi(c.cards[id].title, { layout: 'stack' })),
          el('span', { class: 'p10-mcard-ar', 'aria-hidden': 'true', html: icon('camera') }));
        b.addEventListener('click', () => { closeNote?.(); playClick(); openCard(id); });
        return b;
      }))));

  // a Meinong culture card: picture, note (and for the Bogong shrine, that it is an illustration), View in AR
  function openCard(id) {
    const [img, w, h, glb, ic] = CARDS[id], cd = c.cards[id];
    const ar = el('button', { class: 'btn btn-primary info-ar', type: 'button' }, el('span', { class: 'ic', html: icon('camera') }), bi(c.viewAR, { layout: 'stack' }));
    const close = modal({
      title: cd.title,
      body: [el('div', { class: 'info-body' },
        el('div', { class: 'info-pic p10-info-pic' }, el('img', { src: img, alt: '', width: w, height: h })),
        el('div', { class: 'info-text' },
          el('span', { class: 'info-tag' }, el('span', { class: 'ic', html: icon(ic) }), bi(c.place, { layout: 'inline' })),
          el('p', {}, bi(cd.note)),
          cd.caption ? el('p', { class: 'p10-model-note' }, el('span', { class: 'ic', html: icon('info') }), bi(cd.caption, { layout: 'stack' })) : null,
          ar))],
    });
    ar.addEventListener('click', () => { close(); openPlaceAR({ id, title: cd.title, fact: cd.caption || cd.note, src: glb }); });
    document.querySelector('#modal-layer .modal')?.classList.add('info-dialog');
    loadModelViewer().catch(() => {});
  }

  /* ---------- matching: concepts → meanings ---------- */
  const concepts = {}, meanings = {};
  IDS.forEach((id) => {
    concepts[id] = el('button', { class: `node-card p10-concept is-${id}`, type: 'button', 'data-id': id, 'aria-label': plain(c.concepts[id].label) },
      el('span', { class: `ic${id === 'tudigong' ? ' is-temple' : ''}`, html: icon(ICON[id]) }), bi(c.concepts[id].label, { layout: 'stack' }));
  });
  MEAN_ORDER.forEach((id, i) => {
    meanings[id] = el('div', { class: 'p10-meaning', 'data-id': id, style: { '--i': i } },
      el('p', {}, bi(c.concepts[id].meaning, { layout: 'stack' })),
      el('span', { class: 'p10-slot' },
        el('span', { class: 'p10-slot-empty', 'aria-hidden': 'true' }, '?'),
        el('span', { class: 'p10-slot-done' }, el('span', { class: 'ic', html: icon('check') }), bi(c.concepts[id].label, { layout: 'stack' }))));
    meanings[id].addEventListener('click', () => { if (matched.has(id) && !conceptsCol.querySelector('.is-selected')) showNote(id); });
  });
  const conceptsCol = el('div', { class: 'p10-col p10-concepts' }, el('h3', {}, bi(c.conceptsTitle, { layout: 'inline' })), IDS.map((id) => concepts[id]));
  const meaningsCol = el('div', { class: 'p10-col p10-meanings' }, el('h3', {}, bi(c.meaningsTitle, { layout: 'inline' })), MEAN_ORDER.map((id) => meanings[id]));
  conceptsCol.addEventListener('pointerup', () => requestAnimationFrame(picking));
  const compareBtn = el('button', { class: 'btn btn-primary p10-compare', type: 'button' }, el('span', { class: 'ic', html: icon('compare') }), bi(c.compare, { layout: 'stack' }));
  compareBtn.addEventListener('click', () => { closeNote?.(); playClick(); openCompare(); });
  const after = el('div', { class: 'p10-after' }, el('p', {}, bi(c.comparePrompt, { layout: 'stack' })), compareBtn);
  const matchCard = el('div', { class: 'paper-card p10-match' },
    el('div', { class: 'p10-match-head' },
      el('span', { class: 'p10-match-title' }, el('span', { class: 'ic', html: icon('puzzle') }), bi(c.localCulture, { layout: 'stack' })),
      el('span', { class: 'p10-match-intro' }, bi(c.matchIntro, { layout: 'stack' }))),
    el('div', { class: 'p10-cols' }, conceptsCol, el('span', { class: 'p10-arrow', 'aria-hidden': 'true', html: icon('chevRight') }), meaningsCol),
    after);

  const wrap = el('div', { class: 'p10-wrap' }, tripCard, matchCard);
  stage.append(el('div', { class: 'scene p10' }, wrap));

  /* ---------- panel: the chips say "Local Culture" and "Fuchang" (team script) and open the Bogong / Fuchang cards ---------- */
  ctx.panel({ body: [el('div', { class: 'chip-row' }, c.chips.map((v, i) => chip(c.chipLabels?.[i] || v, { iconName: 'book', onClick: () => ctx.openVocab(v.en) })))] });
  const progress = () => ctx.setTasks([{ text: c.task, done: matched.size === 3, count: `${matched.size}/3` }]);

  function picking() { matchCard.classList.toggle('is-picking', !!conceptsCol.querySelector('.p10-concept.is-selected')); }
  function startMatching() {
    group?.destroy();
    group = createDragGroup({
      cards: IDS.map((id) => concepts[id]).filter((cd) => !matched.has(cd.dataset.id)),
      targets: () => MEAN_ORDER.filter((id) => !matched.has(id)).map((id) => meanings[id]),
      accept: (card, target) => card.dataset.id === target.dataset.id,
      onCorrect: (card) => match(card.dataset.id, true),
      onWrong: (card) => { playMiss(); clearToasts(); toast(c.hints[card.dataset.id], 'hint'); card.classList.remove('is-selected'); group.clearSelection(); picking(); },
    });
  }
  function show(id, animate) {
    meanings[id].classList.add('is-matched');
    if (animate && !reduce) { meanings[id].classList.remove('is-fixing'); void meanings[id].offsetWidth; meanings[id].classList.add('is-fixing'); }
    concepts[id].classList.add('is-placed'); concepts[id].classList.remove('is-selected'); concepts[id].disabled = true; concepts[id].tabIndex = -1;
  }
  function showNote(id) {
    closeNote?.();
    // anchor at the meaning's right edge: the note opens over the meanings, so the concept cards stay free to drag
    const r = meanings[id].getBoundingClientRect(), box = matchCard.getBoundingClientRect();
    const x = ((r.right - box.left - 6) / box.width) * 100, y = ((r.top - box.top + r.height / 2) / box.height) * 100;
    closeNote = notePopover(matchCard, { xPct: x, yPct: y, title: c.concepts[id].label, body: c.notes[id], onClose: () => { closeNote = null; } });
  }
  function match(id, animate) {
    matched.add(id); ctx.seen('matched', [...matched]);
    show(id, animate);
    picking();
    playChime(matched.size - 1);
    clearToasts(); toast(k.goodMatch[goodI++ % k.goodMatch.length], 'success', 1800);
    progress();
    timers.push(setTimeout(() => showNote(id), reduce ? 0 : 450));
    if (matched.size === 3) timers.push(setTimeout(finish, 600));
  }
  function finish() {
    if (done) return;
    done = true; ctx.seen('done', true);
    group?.destroy(); group = null;
    matchCard.classList.add('is-done');
    ctx.complete();
    playFlourish();
    earnBadge(ctx, 'local');
    timers.push(setTimeout(() => { clearToasts(); toast(c.complete, 'success', 3000); }, 4100));
  }

  /* ---------- the compare card ---------- */
  function openCompare() {
    const head = el('div', { class: 'cmp-row is-head' }, el('span'),
      el('span', { class: 'cmp-name' }, el('span', { class: 'ic is-temple', html: icon('temple') }), bi(c.concepts.tudigong.label, { layout: 'stack' })),
      el('span', { class: 'cmp-name' }, el('span', { class: 'ic', html: icon('fields') }), bi(c.concepts.bogong.label, { layout: 'stack' })));
    const rows = c.rows.map((r) => el('div', { class: 'cmp-row' },
      el('span', { class: 'cmp-q' }, bi(r.q, { layout: 'stack' })), el('span', {}, bi(r.tudigong, { layout: 'stack' })), el('span', {}, bi(r.bogong, { layout: 'stack' }))));
    const link = el('a', { class: 'cmp-link', href: c.creditUrl, target: '_blank', rel: 'noopener noreferrer' }, bi(c.creditLink, { layout: 'inline' }), el('span', { class: 'ic', html: icon('link') }));
    modal({
      title: c.compare,
      body: [
        el('p', { class: 'cmp-sub' }, bi(c.compareSub, { layout: 'inline' })),
        el('div', { class: 'cmp-table', role: 'table' }, head, rows),
        el('p', { class: 'cmp-both' }, el('span', { class: 'ic', html: icon('link') }), bi(c.bothLine, { layout: 'stack' })),
        el('div', { class: 'cmp-box is-know' }, el('span', { class: 'seal', 'aria-hidden': 'true', lang: 'zh-Hant' }, '知'),
          el('div', {}, el('b', {}, bi(c.didYouKnow, { layout: 'inline' })), bi(c.didYouKnowText, { layout: 'stack' }))),
        el('div', { class: 'cmp-box is-case' },
          el('b', { class: 'cmp-case-title' }, el('span', { class: 'ic', html: icon('star') }), bi(c.caseTitle, { layout: 'inline' })),
          el('p', {}, bi(c.caseText, { layout: 'stack' })),
          el('p', { class: 'cmp-status' }, bi(c.caseStatus, { layout: 'stack' })),
          el('p', { class: 'cmp-remind' }, bi(c.caseReminder, { layout: 'stack' }))),
        el('p', { class: 'cmp-credit' }, bi(c.credit, { layout: 'inline' }), link),
      ],
    });
    document.querySelector('#modal-layer .modal')?.classList.add('compare-dialog');
  }

  /* ---------- start or restore ---------- */
  matched.forEach((id) => show(id, false));
  if (done) { matchCard.classList.add('is-done'); ctx.complete(); }
  else startMatching();
  progress();
}

export function destroy() {
  closeNote?.(); closeNote = null;
  closePlaceAR();
  timers.forEach(clearTimeout); timers = [];
  group?.destroy(); group = null;
}
