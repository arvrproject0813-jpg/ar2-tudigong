// P06 · Scene 2 — From Fields to Neighborhoods: how does land use change?
//
// The same piece of land long ago and today, rendered from the same 3D model and camera so the two
// pictures line up exactly (js/ar-diorama.js, buildNeighborhood(THREE, { era: 'past' | 'present' })):
//   assets/img/p06_map_past.webp and p06_map_present.webp (1500 × 1000, 3:2).
//
//   1. Drag the timeline (or the handle on the map) from Past to Present: today's land is revealed from
//      the left. The legend chips follow it: Fields / Settlement fade out, Homes / Local Businesses come in.
//      Scooters ride on today's roads.
//   2. "Compare Land Use" switches to a fixed half-and-half view.
//   3. The small temple and the old tree are marked on both maps and never move: once the timeline has
//      gone all the way from Past (≤ 5) to Present (≥ 95), "Find Cultural Clues" makes them pulse; tapping
//      one opens the culture note. Comparison + clue = page complete, badge 'clue'.
import { el, bi, chip, toast, clearToasts, notePopover, plain } from '../ui.js';
import { icon } from '../icons.js';
import { playChime, playFlourish, playClick } from '../sound.js';

const IMG = { past: 'assets/img/p06_map_past.webp', present: 'assets/img/p06_map_present.webp',
  scooterDown: 'assets/img/p05_scooter_down.webp', scooterLeft: 'assets/img/p05_scooter_left.webp' };
// where the two cultural nodes are (% of the images): the pin floats beside the place, a gold stem points at it
const NODES = [
  { id: 'temple', icon: 'temple', at: [55.2, 46.2], pin: [46.5, 39.5], temple: true },
  { id: 'tree', icon: 'tree', at: [69.5, 28.5], pin: [78, 19.5] },
];
const LAYERS = [
  { id: 'fields', icon: 'fields', era: 'past' }, { id: 'settlement', icon: 'home', era: 'past' },
  { id: 'homes', icon: 'street', era: 'present' }, { id: 'business', icon: 'market', era: 'present' },
];

let cleanup = [];
let timers = [];

export function render(stage, ctx) {
  const c = ctx.content;
  const { CONTENT } = ctx;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let t = 0;                                   // 0 = past, 100 = present
  let sawPast = true, compared = !!ctx.seen('compared'), clueMode = compared, clue = !!ctx.seen('clue');
  let split = false, lastMark = 0;

  /* ---------- the two maps ---------- */
  const present = el('div', { class: 'p06-present' },
    el('img', { src: IMG.present, alt: '', draggable: 'false' }),
    reduce ? null : el('div', { class: 'p06-traffic', 'aria-hidden': 'true' },
      el('img', { class: 'r1', src: IMG.scooterLeft, alt: '' }), el('img', { class: 'r2', src: IMG.scooterLeft, alt: '' }),
      el('img', { class: 'r3', src: IMG.scooterDown, alt: '' })));
  const tagNow = el('span', { class: 'p06-era is-now' }, bi(c.present, { layout: 'inline' }));
  const tagThen = el('span', { class: 'p06-era is-then' }, bi(c.past, { layout: 'inline' }));
  const knob = el('button', { class: 'p06-knob', type: 'button', 'aria-label': plain(c.timeline), html: icon('slider') });
  const divider = el('div', { class: 'p06-divider' }, tagNow, tagThen);

  // the persistent cultural nodes, with stems
  const stems = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  stems.setAttribute('class', 'p06-stems'); stems.setAttribute('viewBox', '0 0 100 100'); stems.setAttribute('preserveAspectRatio', 'none');
  const pins = {};
  const nodeEls = NODES.map((n) => {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    [['x1', n.pin[0]], ['y1', n.pin[1]], ['x2', n.at[0]], ['y2', n.at[1]]].forEach(([k, v]) => line.setAttribute(k, v));
    line.setAttribute('vector-effect', 'non-scaling-stroke');
    stems.append(line);
    const pin = el('button', { class: `map-pin p06-pin ${n.temple ? 'is-temple' : ''}`, type: 'button', 'data-id': n.id,
      style: { left: `${n.pin[0]}%`, top: `${n.pin[1]}%` }, 'aria-label': plain(c.pins[n.id]), html: icon(n.icon) });
    pin.addEventListener('click', () => pickClue(n));
    pins[n.id] = pin;
    return [el('span', { class: 'p06-dot', style: { left: `${n.at[0]}%`, top: `${n.at[1]}%` } }), pin,
      el('div', { class: 'pin-tag', style: { left: `${n.pin[0]}%`, top: `${n.pin[1]}%` } }, bi(c.pins[n.id], { layout: 'stack' }))];
  });

  const frame = el('div', { class: 'map-frame p06-frame' },
    el('img', { class: 'p06-past', src: IMG.past, alt: '', draggable: 'false' }),
    present, divider, knob, stems, nodeEls.flat(),
    el('div', { class: 'p06-caption' }, bi(CONTENT.common.conceptualMap, { layout: 'inline' })));

  /* ---------- legend chips (top) ---------- */
  const chips = LAYERS.map((L) => el('span', { class: `p06-layer is-${L.era}`, 'data-id': L.id },
    el('span', { class: 'ic', html: icon(L.icon) }), bi(c.layers[L.id], { layout: 'inline' })));
  const legend = el('div', { class: 'p06-legend', role: 'group', 'aria-label': plain(c.pastAndPresent) }, chips);

  /* ---------- timeline (bottom) ---------- */
  const range = el('input', { class: 'p06-range', type: 'range', min: '0', max: '100', step: '1', value: '0', 'aria-label': plain(c.timeline) });
  const compareBtn = el('button', { class: 'chip p06-compare', type: 'button', 'aria-pressed': 'false' },
    el('span', { class: 'ic', html: icon('slider') }), bi(c.compare, { layout: 'inline' }));
  const clueBtn = el('button', { class: 'btn btn-primary p06-clues', type: 'button', hidden: true },
    el('span', { class: 'ic', html: icon('bulb') }), bi(c.findClues, { layout: 'stack' }));
  const timeline = el('div', { class: 'p06-timeline' },
    el('span', { class: 'p06-end is-past' }, bi(c.past, { layout: 'stack' })),
    el('div', { class: 'p06-track' }, range, el('div', { class: 'p06-ticks', 'aria-hidden': 'true' }, [0, 1, 2, 3, 4].map(() => el('span')))),
    el('span', { class: 'p06-end is-present' }, bi(c.present, { layout: 'stack' })),
    compareBtn);

  frame.append(clueBtn);
  stage.append(el('div', { class: 'p06' }, el('div', { class: 'p06-group' }, legend, el('div', { class: 'map-carved' }, frame), timeline)));

  /* ---------- panel ---------- */
  ctx.panel({
    body: [el('div', { class: 'chip-row' }, c.chips.map((v) => chip(v, { iconName: 'book', onClick: () => ctx.openVocab(v.en) })))],
  });
  const progress = () => ctx.setTasks([{ text: c.task1, done: compared }, { text: c.task2, done: clue }]);

  /* ---------- moving the timeline ---------- */
  function setT(v, { user = true } = {}) {
    t = Math.max(0, Math.min(100, v));
    frame.style.setProperty('--t', t);
    range.value = String(Math.round(t));
    range.setAttribute('aria-valuetext', `${Math.round(t)}% · ${plain(t < 50 ? c.past : c.present)}`);
    const k = t / 100;
    chips.forEach((ch, i) => {
      const s = LAYERS[i].era === 'past' ? 1 - k : k;
      ch.style.setProperty('--s', s.toFixed(3));
      ch.classList.toggle('is-strong', s > 0.6);
    });
    divider.classList.toggle('is-start', t < 4);
    divider.classList.toggle('is-end', t > 96);
    if (!user) return;
    const mark = Math.round(t / 25);               // a soft chime at each quarter of the way
    if (mark !== lastMark) { lastMark = mark; playChime(mark); }
    if (t <= 5) sawPast = true;
    if (t >= 95 && sawPast && !compared) reachPresent();
  }

  function reachPresent() {
    compared = true;
    ctx.seen('compared', true);
    progress();
    showClueButton(true);
    clearToasts(); toast(c.reached, 'success', 4500);
  }
  function showClueButton(animate) {
    clueBtn.hidden = false;
    if (animate && !reduce) clueBtn.classList.add('p06-in');
  }
  clueBtn.addEventListener('click', () => {
    clueMode = true;
    Object.values(pins).forEach((p) => { p.classList.remove('is-pulse-loop'); void p.offsetWidth; p.classList.add('is-pulse-loop'); });
    frame.classList.add('is-clues');
    clearToasts(); toast(c.clueHint, 'hint');
  });

  function pickClue(n) {
    if (!compared) { clearToasts(); toast(c.notYet, 'hint'); return; }
    notePopover(frame, { xPct: n.pin[0], yPct: n.pin[1], title: c.pins[n.id], body: c.clueNote });
    Object.values(pins).forEach((p) => p.classList.remove('is-pulse-loop'));
    pins[n.id].classList.add('is-active');
    if (!clue) {
      clue = true;
      ctx.seen('clue', true);
      progress();
      playFlourish();
      ctx.complete();
      if (!ctx.state.badges.includes('clue')) { ctx.state.badges.push('clue'); ctx.save(); }
      timers.push(setTimeout(() => toast(c.complete, 'success'), 900));
    }
  }

  range.addEventListener('input', () => { if (split) toggleSplit(false); setT(+range.value); });

  // drag the handle on the map itself
  const onDown = (e) => {
    e.preventDefault();
    if (split) toggleSplit(false);
    knob.setPointerCapture(e.pointerId);
    const move = (ev) => { const r = frame.getBoundingClientRect(); setT(((ev.clientX - r.left) / r.width) * 100); };
    const up = () => { knob.removeEventListener('pointermove', move); knob.removeEventListener('pointerup', up); knob.removeEventListener('pointercancel', up); divider.classList.remove('is-dragging'); knob.classList.remove('is-dragging'); };
    divider.classList.add('is-dragging'); knob.classList.add('is-dragging');
    knob.addEventListener('pointermove', move); knob.addEventListener('pointerup', up); knob.addEventListener('pointercancel', up);
  };
  knob.addEventListener('pointerdown', onDown);
  knob.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); setT(t + 5); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); setT(t - 5); }
  });

  // Compare Land Use: a fixed half-and-half view
  let before = 0;
  function toggleSplit(on = !split) {
    split = on;
    compareBtn.setAttribute('aria-pressed', String(on));
    compareBtn.classList.toggle('is-selected', on);
    frame.classList.toggle('is-split', on);
    if (on) { before = t; frame.classList.add('is-gliding'); setT(50, { user: false }); playClick(); }
    else { frame.classList.add('is-gliding'); setT(before, { user: false }); }
    timers.push(setTimeout(() => frame.classList.remove('is-gliding'), 650));
  }
  compareBtn.addEventListener('click', () => toggleSplit());

  /* ---------- start or restore ---------- */
  setT(0, { user: false });
  progress();
  if (compared) showClueButton(false);
  if (clue) { ctx.complete(); frame.classList.add('is-clues'); }
  if (!compared) {
    timers.push(setTimeout(() => toast(c.slideHint, 'hint', 4500), 700));
    // a small hint that the handle moves: it nudges right and back once
    if (!reduce) timers.push(setTimeout(() => knob.classList.add('is-hinting'), 1200));
  }
  cleanup.push(() => knob.classList.remove('is-hinting'));
}

export function destroy() {
  timers.forEach(clearTimeout); timers = [];
  cleanup.forEach((f) => f()); cleanup = [];
}
