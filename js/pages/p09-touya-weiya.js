// P09 · Scene 5 — Touya and Weiya: Tudigong culture and the rhythm of everyday life.
//
//   A lunar-year calendar strip (12 months, two ya days in each: the 2nd and the 16th) sits above three date cards.
//   Students drag each term card (Zuoya 做牙, Touya 頭牙, Weiya 尾牙) onto its date (or tap the term, then the date).
//   Right: the term is stamped on the date card, the calendar lights up (zuoya: all 24 ya days; Touya: the 2nd of the
//   2nd month; Weiya: the 16th of the 12th month; both: an arc for the working year) and a story card explains it,
//   with a picture of family shops (Touya) or a year-end company meal (Weiya) — renders of the app's 3D kit.
//   Not yet: a shake and a gentle hint. All three: badge "Calendar Matcher" and two context cards to flip.
// Rules: this is about the calendar and everyday life; no offerings or worship are shown or simulated.
import { el, bi, chip, toast, clearToasts, plain, iconButton } from '../ui.js';
import { icon } from '../icons.js';
import { createDragGroup } from '../drag.js';
import { playChime, playMiss, playFlourish, playClick } from '../sound.js';
import { earnBadge } from '../badges.js';
import { openPlaceAR, loadModelViewer, closePlaceAR } from '../ar-place.js';

const TERMS = ['zuoya', 'touya', 'weiya'];
const DATE_ORDER = ['weiya', 'zuoya', 'touya'];             // the date cards come in a different order
const SEAL = { zuoya: '做牙', touya: '頭牙', weiya: '尾牙' };
// story pictures: renders of the team's 3D models (lunar calendar, storefront, Weiya table); the same models open in AR
const PIC = { zuoya: ['assets/img/p09_calendar.webp', 450, 548], touya: ['assets/img/p09_street.webp', 744, 395], weiya: ['assets/img/p09_meal.webp', 693, 456] };
const MODEL = { zuoya: 'assets/models/p09/calendar.glb', touya: 'assets/models/p09/storefront.glb', weiya: 'assets/models/p09/weiya.glb' };

let group = null;
let timers = [];
let closeStory = null;

export function render(stage, ctx) {
  const c = ctx.content, k = ctx.CONTENT.common;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const matched = new Set(ctx.seen('matched') || []);
  let done = !!ctx.seen('done');
  let goodI = 0;

  /* ---------- the lunar year ---------- */
  const months = c.months.map((m, i) => el('div', { class: 'p09-month', 'data-m': i + 1, style: { '--i': i } },
    el('span', { class: 'p09-m-name' }, el('b', {}, m.en), el('span', { class: 'zh', lang: 'zh-Hant' }, m.zh)),
    el('span', { class: 'p09-days' }, el('i', { class: 'p09-dot is-2' }), el('i', { class: 'p09-dot is-16' })),
    i === 1 ? el('span', { class: 'p09-mark is-touya' }, el('b', { lang: 'zh-Hant' }, '頭'), bi(c.terms.touya.label, { layout: 'stack' })) : null,
    i === 11 ? el('span', { class: 'p09-mark is-weiya' }, el('b', { lang: 'zh-Hant' }, '尾'), bi(c.terms.weiya.label, { layout: 'stack' })) : null));
  const arc = el('div', { class: 'p09-arc', 'aria-hidden': 'true', html: '<svg viewBox="0 0 100 20" preserveAspectRatio="none"><path d="M0 19 C 20 -4, 80 -4, 100 19"/></svg>' },
    el('span', { class: 'p09-arc-label' }, bi(c.yearArc, { layout: 'inline' })));
  const cal = el('div', { class: 'paper-card p09-cal' },
    el('div', { class: 'p09-cal-head' },
      el('span', { class: 'p09-cal-title' }, el('span', { class: 'ic', html: icon('calendar') }), bi(c.calendarTitle, { layout: 'stack' })),
      el('span', { class: 'p09-legend' },
        el('span', {}, el('i', { class: 'p09-dot is-2' }), bi(c.day2, { layout: 'inline' })),
        el('span', {}, el('i', { class: 'p09-dot is-16' }), bi(c.day16, { layout: 'inline' })),
        el('span', { class: 'is-ya' }, el('i', { class: 'p09-dot is-lit' }), bi(c.yaDay, { layout: 'inline' })))),
    el('div', { class: 'p09-strip' }, arc, months));

  /* ---------- the three date cards (targets) ---------- */
  const dates = {};
  const dateHead = { zuoya: c.everyMonth, touya: { en: `${c.monthWord.en} 2`, zh: c.months[1].zh }, weiya: { en: `${c.monthWord.en} 12`, zh: c.months[11].zh } };
  const dateDay = { zuoya: { en: `${c.day2.en} · ${c.day16.en}`, zh: `${c.day2.zh} · ${c.day16.zh}` }, touya: c.day2, weiya: c.day16 };
  DATE_ORDER.forEach((id, i) => {
    const stamp = el('span', { class: 'p09-stamp' },
      el('span', { class: 'p09-stamp-slot', 'aria-hidden': 'true' }, el('b', {}, '?'), bi(c.dropHere, { layout: 'stack' })),
      el('span', { class: 'p09-stamp-seal', lang: 'zh-Hant' }, SEAL[id]),
      el('span', { class: 'p09-stamp-name' }, bi(c.terms[id].label, { layout: 'stack' })));
    dates[id] = el('div', { class: `p09-date is-${id}`, 'data-id': id, style: { '--i': i } },
      el('div', { class: 'p09-date-top' }, el('i'), el('i'), bi(dateHead[id], { layout: 'inline' })),
      el('div', { class: 'p09-date-day' }, bi(dateDay[id], { layout: 'stack' })),
      el('p', { class: 'p09-date-text' }, bi(c.terms[id].answer, { layout: 'stack' })),
      stamp);
    dates[id].addEventListener('click', () => { if (matched.has(id) && !tray.querySelector('.is-selected')) openStory(id); });
  });

  /* ---------- the term cards ---------- */
  const terms = {};
  TERMS.forEach((id) => {
    terms[id] = el('button', { class: 'node-card p09-term', type: 'button', 'data-id': id, 'aria-label': plain(c.terms[id].label) },
      el('span', { class: 'p09-term-seal', lang: 'zh-Hant' }, SEAL[id]), bi(c.terms[id].label, { layout: 'stack' }));
    if (matched.has(id)) terms[id].classList.add('is-placed');
  });
  const tray = el('div', { class: 'paper-card p09-tray' },
    el('div', { class: 'p09-tray-head' },
      el('span', { class: 'p09-tray-title' }, el('span', { class: 'ic', html: icon('cards') }), bi(c.termsTitle, { layout: 'stack' })),
      el('span', { class: 'p09-tray-intro' }, bi(c.matchIntro, { layout: 'stack' }))),
    el('div', { class: 'p09-terms' }, TERMS.map((id) => terms[id])));
  tray.addEventListener('pointerup', () => requestAnimationFrame(picking));

  /* ---------- context cards (after the match) ---------- */
  const ctxCards = ['business', 'language'].map((key) => {
    const card = el('button', { class: 'p09-ctx', type: 'button', 'aria-pressed': 'false' },
      el('span', { class: 'p09-ctx-in' },
        el('span', { class: 'p09-ctx-face is-front' }, el('span', { class: 'ic', html: icon(key === 'business' ? 'market' : 'chat') }), bi(c.context[key].title, { layout: 'stack' }), el('span', { class: 'p09-ctx-tap', html: icon('tap') })),
        el('span', { class: 'p09-ctx-face is-back' }, el('b', {}, bi(c.context[key].title, { layout: 'inline' })), bi(c.context[key].text, { layout: 'stack' }))));
    card.addEventListener('click', () => { const on = card.classList.toggle('is-flipped'); card.setAttribute('aria-pressed', String(on)); playClick(); });
    return card;
  });
  const context = el('div', { class: 'p09-context' },
    el('span', { class: 'p09-context-prompt' }, el('span', { class: 'ic', html: icon('bulb') }), bi(c.contextPrompt, { layout: 'stack' })),
    ctxCards);

  const story = el('div', { class: 'p09-story-layer' });
  const wrap = el('div', { class: 'p09-wrap' },
    cal,
    el('div', { class: 'p09-dates' }, DATE_ORDER.map((id) => dates[id])),
    el('div', { class: 'p09-foot' }, tray, context),
    story);
  stage.append(el('div', { class: 'scene p09' }, wrap));

  /* ---------- panel ---------- */
  ctx.panel({ body: [el('div', { class: 'chip-row' }, c.chips.map((v) => chip(v, { iconName: 'book', onClick: () => ctx.openVocab(v.en) })))] });
  const progress = () => ctx.setTasks([{ text: c.task, done: matched.size === 3, count: `${matched.size}/3` }]);

  /* ---------- matching ---------- */
  function startMatching() {
    group?.destroy();
    group = createDragGroup({
      cards: TERMS.map((id) => terms[id]).filter((t) => !matched.has(t.dataset.id)),
      targets: () => DATE_ORDER.filter((id) => !matched.has(id)).map((id) => dates[id]),
      accept: (card, target) => card.dataset.id === target.dataset.id,
      onCorrect: (card) => match(card.dataset.id, true),
      onWrong: (card) => { playMiss(); clearToasts(); toast(c.hints[card.dataset.id], 'hint'); picking(); },
    });
  }
  function picking() { wrap.classList.toggle('is-picking', !!tray.querySelector('.p09-term.is-selected')); }
  function light(id, animate) {
    dates[id].classList.add('is-matched');
    if (animate && !reduce) { dates[id].classList.remove('is-stamping'); void dates[id].offsetWidth; dates[id].classList.add('is-stamping'); }
    cal.classList.add(`is-${id}`);
    if (animate && !reduce) cal.classList.add(`anim-${id}`);
    cal.classList.toggle('is-year', matched.has('touya') && matched.has('weiya'));
    terms[id].classList.add('is-placed'); terms[id].classList.remove('is-selected'); terms[id].disabled = true; terms[id].tabIndex = -1;
  }
  function match(id, animate) {
    matched.add(id); ctx.seen('matched', [...matched]);
    light(id, animate);
    picking();
    playChime(matched.size - 1);
    clearToasts(); toast(k.goodMatch[goodI++ % k.goodMatch.length], 'success', 1800);
    progress();
    timers.push(setTimeout(() => openStory(id), reduce ? 0 : 900));
    if (matched.size === 3) timers.push(setTimeout(finish, 700));
  }
  function finish() {
    if (done) return;
    done = true; ctx.seen('done', true);
    group?.destroy(); group = null;
    wrap.classList.add('is-done');
    ctx.complete();
    playFlourish();
    earnBadge(ctx, 'calendar');
    timers.push(setTimeout(() => { clearToasts(); toast(c.complete, 'success', 3000); }, 4100));
  }

  /* ---------- the story card: what this day is, with a picture ---------- */
  function openStory(id) {
    closeStory?.();
    const pic = PIC[id];
    const x = iconButton('close', plain(k.close), () => close(), 'close');
    const ar = el('button', { class: 'btn btn-primary info-ar p09-story-ar', type: 'button' }, el('span', { class: 'ic', html: icon('camera') }), bi(c.viewAR, { layout: 'stack' }));
    ar.addEventListener('click', () => { close(); openPlaceAR({ id, title: c.terms[id].label, fact: c.captions[id], src: MODEL[id] }); });
    // zuoya: the calendar's page shows the two ya days of every month
    const page = id === 'zuoya' ? el('span', { class: 'p09-cal-page', 'aria-hidden': 'true' }, bi(c.day2, { layout: 'stack' }), el('i'), bi(c.day16, { layout: 'stack' })) : null;
    const card = el('div', { class: `p09-story is-${id} has-pic`, role: 'dialog', 'aria-label': plain(c.terms[id].label) },
      el('figure', { class: `p09-story-pic is-${id}` }, el('span', { class: 'p09-story-img' }, el('img', { src: pic[0], alt: '', width: pic[1], height: pic[2] }), page),
        el('figcaption', {}, bi(c.captions[id], { layout: 'inline' }))),
      el('div', { class: 'p09-story-text' },
        el('span', { class: 'p09-story-seal', lang: 'zh-Hant' }, SEAL[id]),
        el('h3', {}, bi(c.terms[id].label, { layout: 'inline' })),
        el('p', { class: 'p09-story-date' }, bi(c.terms[id].answer, { layout: 'stack' })),
        el('p', {}, bi(c.notes[id], { layout: 'stack' })),
        ar),
      x);
    loadModelViewer().catch(() => {});
    story.replaceChildren(card);
    wrap.classList.add('has-story');
    const outside = (e) => { if (!card.contains(e.target)) close(); };
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    timers.push(setTimeout(() => { document.addEventListener('pointerdown', outside, true); }, 50));
    document.addEventListener('keydown', onKey);
    function close() {
      document.removeEventListener('pointerdown', outside, true); document.removeEventListener('keydown', onKey);
      card.classList.add('is-leaving'); wrap.classList.remove('has-story');
      timers.push(setTimeout(() => card.remove(), 250));
      if (closeStory === close) closeStory = null;
    }
    closeStory = close;
  }

  /* ---------- start or restore ---------- */
  matched.forEach((id) => light(id, false));
  if (done) { wrap.classList.add('is-done'); ctx.complete(); }
  else startMatching();
  progress();
}

export function destroy() {
  closeStory?.(); closeStory = null;
  closePlaceAR();
  timers.forEach(clearTimeout); timers = [];
  group?.destroy(); group = null;
}
