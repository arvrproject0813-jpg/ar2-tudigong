// app.js — page router, progress state, top bar, the bar + story sheet under the stage, and page changes.
import CONTENT from '../content/content.js';
import { PAGES, STORE_KEY } from './config.js';
import { el, bi, button, iconButton, checklist, toast, clearToasts, closeModal, openVocab, setLang, plain, modal } from './ui.js';
import { icon } from './icons.js';
import { narrationControl, stopNarration } from './narration.js';
import { startMusic, stopMusic, installClickSounds } from './sound.js';
import { playGuide, clearGuide, stopGuide } from './guide.js';
import { curtainClose, curtainOpen } from './curtain.js';

/* ---------- state ---------- */
const freshState = () => ({
  lang: 'bi', page: 'p01', done: {}, seen: {},
  p08Route: [], p11Sentences: [], badges: [], arAvailable: false, music: true, voice: true,
});
// Progress lives only in memory: moving between pages keeps it, but reloading the page (or
// opening the link again) always starts fresh from the welcome page. Nothing is stored on the device.
const state = freshState();
function save() { /* nothing is stored: progress resets on reload */ }
try { localStorage.removeItem(STORE_KEY); } catch (e) { /* clear progress saved by older versions */ }
setLang(state.lang);

const $topbar = document.getElementById('topbar');
const $stage = document.getElementById('stage');
const $panel = document.getElementById('panel');
const LANG_ORDER = ['bi', 'en', 'zh'];

let current = null;     // { id, mod }
let navToken = 0;

/* ---------- navigation ---------- */
const indexOf = (id) => PAGES.findIndex((p) => p.id === id);

async function go(id) {
  if (indexOf(id) < 0) id = 'p01';
  const token = ++navToken;
  const page = PAGES[indexOf(id)];
  // the cloud curtain closes over the old page while the new one loads (not for the welcome page, its walk-in
  // into the shrine, or a re-render after a language switch)
  const fromFullbleed = document.body.classList.contains('is-fullbleed');
  const curtain = !!current && current.id !== id && id !== 'p01' && !fromFullbleed && !window.__noCurtain;
  const loading = import(`./pages/${page.file}.js`);
  if (curtain) { stopGuide(); await curtainClose(stopInfo(id)); }
  let mod;
  try { mod = await loading; }
  catch (e) { console.error('Could not load page', page.file, e); if (curtain) curtainOpen(); return; }
  if (token !== navToken) return;              // a newer navigation started meanwhile
  if (current?.mod?.destroy) { try { current.mod.destroy(); } catch (e) { console.error(e); } }
  clearToasts(); closeModal(); stopNarration(); clearGuide(); clearMore();
  current = { id, mod };
  state.page = id;
  steps = null;
  save();
  renderTopbar();
  $stage.replaceChildren(); $panel.replaceChildren(); $panel.className = 'panel sheet is-none';
  $stage.scrollTop = 0; $stage.scrollLeft = 0;      // (older browsers without overflow: clip could leave it shifted)
  document.body.classList.toggle('is-fullbleed', mod.chrome === false);
  document.body.dataset.page = id;
  mod.render($stage, makeCtx(id));
  if (curtain) curtainOpen();
  requestAnimationFrame(() => { if (token === navToken) watchMore(); });
  // the voice guide (the welcome page starts its own; the map speaks only on the first visit)
  if (id !== 'p01' && !(mod.guideOnce && state.seen[id]?.guided)) {
    state.seen[id] = { ...(state.seen[id] || {}), guided: true };
    setTimeout(() => { if (token === navToken) startGuide(id); }, curtain ? 650 : 0);
  }
}

/** The recommended next stop: the first stop (in order) that isn't finished yet. */
function nextStopId() { return STOP_IDS.find((s) => !state.done[s]) || 'p12'; }
const next = () => { const i = indexOf(current.id); if (i < PAGES.length - 1) go(PAGES[i + 1].id); };
const back = () => { const i = indexOf(current.id); if (i > 0) go(PAGES[i - 1].id); };
const rerender = () => go(current.id);

/* ---------- the journey: stops on the map, their labels for the top bar and the curtain ---------- */
const STOP_IDS = ['p02', 'p03', 'p04', 'p05', 'p06', 'p07', 'p08', 'p09', 'p10', 'p11', 'p12'];
function stopInfo(id) {
  const J = CONTENT.journey, s = J.stops[id];
  if (id === 'map') return { icon: 'map', kicker: J.mapKicker, title: J.title, seal: '圖' };
  if (!s) return { icon: 'temple', kicker: null, title: CONTENT[id]?.heading || J.title, seal: '街' };
  return { icon: s.icon, kicker: s.kicker, title: s.title, seal: s.seal, num: STOP_IDS.indexOf(id) + 1 };
}
let steps = null;        // the page's step chips in the top bar: { items, active, done:Set, onClick }

/* ---------- background music + button sounds (js/sound.js) ---------- */
// Browsers only allow sound after the first tap, so the music starts on the first touch anywhere.
installClickSounds();
function firstTouch() {
  if (document.querySelector('.welcome.is-waiting')) return;     // the welcome page starts the music after its opening
  document.removeEventListener('pointerdown', firstTouch, true);
  if (state.music) startMusic();
}
document.addEventListener('pointerdown', firstTouch, true);
const musicIfOn = () => { if (state.music) startMusic(); };

/* ---------- "More below": when a page is taller than the screen, a small button at the bottom says so ----------
   (tapping it scrolls down; it goes away near the bottom. The story page, P07, has its own "Scroll down".) */
let more = null;
function clearMore() {
  if (!more) return;
  more.ro.disconnect(); more.sc.removeEventListener('scroll', more.upd); more.btn.remove(); more = null;
}
function watchMore() {
  clearMore();
  const sc = [...$stage.querySelectorAll(':scope > *, :scope > * > *')]
    .find((n) => /(auto|scroll)/.test(getComputedStyle(n).overflowY) && n.clientHeight > 120);
  if (!sc || sc.classList.contains('story') || current?.id === 'map') return;      // (the journey map has its own Continue button)
  const btn = el('button', { class: 'more-below', type: 'button', 'aria-label': plain(CONTENT.common.moreBelow) },
    el('span', { class: 'ic', html: icon('chevDown') }), bi(CONTENT.common.moreBelow, { layout: 'stack' }));
  btn.addEventListener('click', () => sc.scrollBy({ top: Math.round(sc.clientHeight * 0.7), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }));
  const upd = () => btn.classList.toggle('is-on', sc.scrollHeight - sc.clientHeight - sc.scrollTop > 40);
  const ro = new ResizeObserver(upd);
  ro.observe(sc); [...sc.children].forEach((n) => ro.observe(n));
  sc.addEventListener('scroll', upd, { passive: true });
  $stage.append(btn);
  more = { btn, sc, ro, upd };
  upd();
}

/* ---------- voice guide ---------- */
function startGuide(id = current?.id) { if (id) playGuide(id, { host: $stage, lang: state.lang, voiceOn: state.voice !== false }); }
function toggleVoice() {
  state.voice = state.voice === false; save();
  if (state.voice) startGuide(); else stopGuide();
  if (current) { renderTopbar(); document.dispatchEvent(new CustomEvent('voice-changed')); }
}
function voiceButton(cls = '') {
  const on = state.voice !== false;
  const label = plain(on ? CONTENT.common.voiceOff : CONTENT.common.voiceOn);
  const b = iconButton(on ? 'speaker' : 'speakerOff', label, toggleVoice, `voice-btn ${on ? '' : 'is-off'} ${cls}`.trim());
  b.setAttribute('aria-pressed', on ? 'true' : 'false'); b.title = label;
  return b;
}
function toggleMusic() {
  state.music = !state.music; save();
  if (state.music) startMusic(); else stopMusic();
  if (current) { renderTopbar(); document.dispatchEvent(new CustomEvent('music-changed')); }
}
function musicButton(cls = '') {
  const on = state.music;
  const b = iconButton(on ? 'music' : 'musicOff', plain(on ? CONTENT.common.musicOff : CONTENT.common.musicOn), toggleMusic, `music-btn ${on ? '' : 'is-off'} ${cls}`.trim());
  b.setAttribute('aria-pressed', on ? 'true' : 'false');
  b.title = plain(on ? CONTENT.common.musicOff : CONTENT.common.musicOn);
  return b;
}

function cycleLang() {
  state.lang = LANG_ORDER[(LANG_ORDER.indexOf(state.lang) + 1) % LANG_ORDER.length];
  state.relang = current?.id;                       // the welcome page then shows its finished state instead of replaying
  setLang(state.lang); save(); rerender();
}

/* ---------- top bar ---------- */
function renderTopbar() {
  const id = current.id, J = CONTENT.journey;
  const langLabel = { bi: '雙語', en: 'EN', zh: '中文' }[state.lang];
  const langBtn = el('button', {
    class: 'icon-btn lang-btn', type: 'button',
    'aria-label': `${plain(CONTENT.common.language)}: ${langLabel}`,
    html: icon('lang'),
    onclick: cycleLang,
  }, langLabel);
  const mid = el('div', { class: 'tb-mid' });
  if (id === 'map') {
    const n = STOP_IDS.filter((s) => state.done[s]).length;
    // the same shape as every stop's title: a round gold medallion (here with the map icon) and two lines of text
    mid.append(el('span', { class: 'tb-title is-map' }, el('b', { class: 'tb-num is-icon', 'aria-hidden': 'true', html: icon('map') }),
      el('span', { class: 'tb-title-text' }, el('small', {}, bi(J.mapKicker, { layout: 'inline' })), bi(J.title, { layout: 'inline' }))),
      el('span', { class: 'tb-meter', title: `${n} / ${STOP_IDS.length}` }, el('i', { style: { width: `${(n / STOP_IDS.length) * 100}%` } })),
      el('span', { class: 'tb-count' }, `${n}/${STOP_IDS.length}`));
  } else {
    const info = stopInfo(id);
    mid.append(el('button', { class: 'tb-map', type: 'button', onclick: () => go('map'), 'aria-label': plain(J.mapButton) },
      el('span', { class: 'ic', html: icon('map') }), bi(J.mapButton, { layout: 'stack' })));
    mid.append(el('span', { class: 'tb-title' },
      info.num ? el('b', { class: 'tb-num' }, String(info.num)) : null,
      el('span', { class: 'tb-title-text' }, info.kicker ? el('small', {}, bi(info.kicker, { layout: 'inline' })) : null, bi(info.title, { layout: 'inline' }))));
    if (steps) {
      mid.append(el('div', { class: 'tb-steps', role: 'tablist' }, steps.items.map((t, i) => {
        const b = el('button', { class: `tb-step${i === steps.active ? ' is-on' : ''}${steps.done.has(i) ? ' is-done' : ''}`, type: 'button', role: 'tab', 'aria-selected': String(i === steps.active) },
          el('b', {}, steps.done.has(i) ? el('span', { class: 'ic', html: icon('check') }) : String(i + 1)), bi(t, { layout: 'inline' }));
        b.addEventListener('click', () => steps.onClick?.(i));
        return b;
      })));
    }
  }
  $topbar.classList.toggle('has-steps', !!steps && id !== 'map');     // (portrait: the steps take the title's place)
  $topbar.replaceChildren(
    el('div', { class: 'tb-left' },
      el('button', { class: 'tb-logo', type: 'button', onclick: () => go('p01'), 'aria-label': 'Tudigong — back to the welcome page' },
        el('span', { class: 'cal', lang: 'zh-Hant' }, '土地公'),
        el('span', { class: 'lat' }, 'Tudigong'))),
    mid,
    el('div', { class: 'tb-right' }, voiceButton(), musicButton(), langBtn),
  );
}

/* ---------- page context ---------- */
function makeCtx(id) {
  let primaryBtn = null, tasksHost = null, taskPill = null, completed = !!state.done[id], tasks = [];

  const ctx = {
    id, state, content: CONTENT[id], CONTENT,
    go, next, back, rerender, save, toast, openVocab, cycleLang, musicButton, voiceButton, musicIfOn, resetAll: () => resetAll(),
    openSheet: () => {}, nextStop: () => nextStopId(),
    guide: () => startGuide(id),

    /**
     * Build the bar under the stage and its slide-up sheet ("Story and words": title, narration, words, tasks).
     * opts: { title?, display?, narration? (default true), body?: Node[], tasks?: [], secondary?: Node[] (shown in the bar),
     *         primary?: {text, onClick, alwaysEnabled} | false, sheetLabel?: {en, zh}, sheetOpen? }
     */
    panel(opts = {}) {
      const c = CONTENT[id] || {}, J = CONTENT.journey;
      const title = opts.title || c.heading;
      const inner = el('div', { class: 'panel-inner' });
      if (title) inner.append(el('h1', { class: `panel-title ${opts.display ? 'display' : ''}`, style: { margin: 0 } }, bi(title)));
      if (c.narration) inner.append(narrationControl(id, state.lang, 'full'));
      const body = el('div', { class: 'panel-body' });
      if (opts.narration !== false && c.narration) body.append(markKeywords(el('div', { class: 'narration' }, bi(c.narration)), c.chips));
      (opts.body || []).forEach((n) => body.append(n));
      inner.append(body);
      tasksHost = el('div', { class: 'panel-tasks' });
      inner.append(tasksHost);
      // the bar under the stage: "Story and words" (opens the sheet), task progress, and Next
      const sheetPanel = el('div', { class: 'sheet-panel', role: 'dialog', 'aria-label': plain(opts.sheetLabel || J.sheet) },
        el('div', { class: 'sheet-grip' }, el('span', { class: 'sheet-handle', 'aria-hidden': 'true' }),
          iconButton('close', plain(CONTENT.common.close), () => setSheet(false), 'sheet-close')),
        inner);
      taskPill = el('span', { class: 'sheet-tasks', hidden: true });
      const toggle = el('button', { class: 'sheet-toggle', type: 'button', 'aria-expanded': 'false' },
        el('span', { class: 'ic', html: icon('book') }),
        el('span', { class: 'sheet-label' }, bi(opts.sheetLabel || J.sheet, { layout: 'stack' })),
        taskPill,
        el('span', { class: 'sheet-chev', html: icon('chevLeft') }));
      toggle.addEventListener('click', () => setSheet(!$panel.classList.contains('is-open')));
      // (portrait phones: the Map button sits here, in the bar under the thumb, instead of in the top bar)
      const mapBtn = el('button', { class: 'sheet-map', type: 'button', 'aria-label': plain(J.mapButton), onclick: () => go('map') },
        el('span', { class: 'ic', html: icon('map') }), bi(J.mapButton, { layout: 'stack' }));
      const bar = el('div', { class: 'sheet-bar' }, mapBtn, toggle);
      if (opts.secondary?.length) bar.append(el('div', { class: 'sheet-extra' }, opts.secondary));   // extra page actions sit in the bar
      if (opts.primary !== false) {
        const nextId = PAGES[indexOf(id) + 1]?.id;
        const p = opts.primary || { text: nextId && nextId !== 'map' && J.stops[nextId] ? { en: `Next: ${J.stops[nextId].title.en}`, zh: `下一站：${J.stops[nextId].title.zh}` } : CONTENT.common.next, onClick: next };
        // Next always works: if the page isn't finished yet, a small dialog asks whether to stay or move on
        primaryBtn = button(p.text, { variant: 'primary', onClick: () => (completed || p.alwaysEnabled ? p.onClick() : askSkip(p.onClick)) });
        primaryBtn.classList.add('sheet-next');
        primaryBtn.classList.toggle('is-pending', !completed && !p.alwaysEnabled);
        bar.append(primaryBtn);
      }
      const scrim = el('div', { class: 'sheet-scrim', onclick: () => setSheet(false) });
      $panel.className = `panel sheet${opts.sheet === false && opts.primary === false ? ' is-none' : ''}`;
      $panel.replaceChildren(scrim, sheetPanel, bar);
      if (opts.tasks) ctx.setTasks(opts.tasks);
      function setSheet(open) {
        $panel.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', String(open));
        if (open) stopGuide();
      }
      ctx.openSheet = () => setSheet(true);
      if (opts.sheetOpen) setSheet(true);
    },

    /** Step chips in the top bar (e.g. Learn · Do · Badge). Returns { setActive(i), setDone(i) }. */
    steps(items, { onClick } = {}) {
      steps = { items, active: 0, done: new Set(), onClick };
      renderTopbar();
      const sync = () => { if (current?.id === id) renderTopbar(); };
      return {
        setActive(i) { if (steps && steps.active !== i) { steps.active = i; sync(); } },
        setDone(i) { if (steps && !steps.done.has(i)) { steps.done.add(i); sync(); } },
      };
    },

    setTasks(items) {
      tasks = items || [];
      if (tasksHost) tasksHost.replaceChildren(checklist(items));
      if (taskPill) {                                  // the bar shows how many tasks are done
        const n = tasks.filter((t) => t.done).length;
        taskPill.hidden = !tasks.length;
        taskPill.classList.toggle('is-done', !!tasks.length && n === tasks.length);
        taskPill.replaceChildren(el('span', { class: 'ic', html: icon('check') }), `${n}/${tasks.length}`);
      }
    },

    /** Mark this page complete: unlocks the primary button and saves progress. */
    complete() {
      const first = !completed;
      completed = true;
      state.done[id] = true; save();
      if (primaryBtn) { primaryBtn.classList.remove('is-pending'); if (first) primaryBtn.classList.add('is-ready'); }
    },
    isComplete: () => completed,

    /** Per-page memory that survives language switches and revisits */
    seen(key, value) {
      state.seen[id] = state.seen[id] || {};
      if (value === undefined) return state.seen[id][key];
      state.seen[id][key] = value; save();
      return value;
    },
  };
  // "You haven't finished this page yet": keep going here, or go on anyway
  /* "Not finished yet" pop-up: a friendly stop sign before leaving an unfinished page.
     Left: the page's badge with a ring showing how much is done (e.g. 1 / 2). Right: the checklist,
     and two big choices: stay and finish (main), or go on anyway. */
  function askSkip(goOn) {
    const c = CONTENT[id] || {}, k = CONTENT.common;
    const all = tasks.length ? tasks : [{ text: k.skipTitle, done: false }];
    const done = all.filter((t) => t.done).length, total = all.length;
    const layer = document.getElementById('modal-layer');
    const opener = document.activeElement;
    const R = 50, C = 2 * Math.PI * R;
    const ring = el('div', { class: 'skd-ring', html: `<svg viewBox="0 0 120 120" aria-hidden="true">
        <circle class="skd-track" cx="60" cy="60" r="${R}"/>
        <circle class="skd-arc" cx="60" cy="60" r="${R}" style="--c:${C.toFixed(1)};--to:${(C * (1 - done / total)).toFixed(1)}"/>
      </svg>` },
      el('span', { class: 'skd-badge', html: icon(PAGE_ICON[id] || 'check') }));
    const stay = el('button', { class: 'btn btn-primary skd-stay', type: 'button' },
      el('span', { class: 'ic', html: icon(PAGE_ICON[id] || 'check') }), bi(c.skipStay || k.skipStay, { layout: 'stack' }));
    const goBtn = el('button', { class: 'btn btn-secondary skd-go', type: 'button' },
      bi(k.skipGo, { layout: 'stack' }), el('span', { class: 'ic', html: icon('chevRight') }));
    const x = el('button', { class: 'skd-x', type: 'button', 'aria-label': plain(k.close), html: icon('close') });
    const titleId = `skd-t-${Date.now()}`;
    const card = el('div', { class: 'skd', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': titleId },
      el('div', { class: 'skd-hero' },
        el('span', { class: 'skd-spark s1', 'aria-hidden': 'true' }), el('span', { class: 'skd-spark s2', 'aria-hidden': 'true' }), el('span', { class: 'skd-spark s3', 'aria-hidden': 'true' }),
        ring,
        el('div', { class: 'skd-count' }, el('b', {}, `${done}`), el('span', {}, ` / ${total}`)),
        el('div', { class: 'skd-done' }, bi(k.skipDone, { layout: 'inline' }))),
      el('div', { class: 'skd-main' },
        el('div', { class: 'skd-eyebrow' }, bi(k.skipEyebrow, { layout: 'inline' })),
        el('h2', { class: 'skd-title', id: titleId }, bi(c.skipTitle || k.skipTitle)),
        el('ul', { class: 'skd-list', 'aria-label': plain(k.skipProgress) }, all.map((t, i) =>
          el('li', { class: t.done ? 'is-done' : 'is-todo', style: { '--i': i } },
            el('span', { class: 'skd-tick', html: t.done ? icon('check') : '' }), bi(t.text, { layout: 'inline' })))),
        el('p', { class: 'skd-body' }, bi(c.skipBody || k.skipBody)),
        el('div', { class: 'skd-actions' }, goBtn, stay)),
      x);
    const scrim = el('div', { class: 'skd-scrim' }, card);
    let closed = false;
    const close = (after) => {
      if (closed) return; closed = true;
      document.removeEventListener('keydown', onKey);
      scrim.classList.add('is-closing');
      setTimeout(() => { scrim.remove(); if (after) after(); else if (opener && document.contains(opener)) opener.focus?.(); }, 200);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') close();
      if (e.key === 'Tab') {                         // keep focus inside the pop-up
        const f = [x, goBtn, stay]; const i = f.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); stay.focus(); } else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); x.focus(); }
      }
    };
    scrim.addEventListener('click', (e) => { if (e.target === scrim) close(); });
    x.addEventListener('click', () => close());
    stay.addEventListener('click', () => close());
    goBtn.addEventListener('click', () => close(goOn));
    layer.replaceChildren(scrim);
    document.addEventListener('keydown', onKey);
    stay.focus({ preventScroll: true });
  }
  return ctx;
}

/* Make the page's vocabulary words stand out in the panel text: bold, with a gold underline; tapping one
   opens its vocabulary card (the same as the word chips below). chips = [{en, zh}] (zh may list
   alternatives split by ／). English matches also catch plurals ("cultural landscapes"). */
function markKeywords(root, chips) {
  if (!chips?.length) return root;
  const esc = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const enTerms = chips.map((v) => v.en).sort((a, b) => b.length - a.length);
  const zhTerms = chips.flatMap((v) => (v.zh || '').split(/[／/]/)).map((t) => t.trim()).filter(Boolean).sort((a, b) => b.length - a.length);
  const reEn = new RegExp(`\\b(${enTerms.map(esc).join('|')})(e?s)?\\b`, 'gi');
  const reZh = zhTerms.length ? new RegExp(`(${zhTerms.map(esc).join('|')})`, 'g') : null;
  const termFor = (hit, zh) => (zh ? chips.find((v) => (v.zh || '').split(/[／/]/).map((t) => t.trim()).includes(hit)) : chips.find((v) => hit.toLowerCase().startsWith(v.en.toLowerCase())))?.en;
  const walk = (node, re, zh) => {
    [...node.childNodes].forEach((n) => {
      if (n.nodeType !== 3) { if (n.nodeType === 1 && !n.classList.contains('kw')) walk(n, re, zh); return; }
      const text = n.nodeValue; re.lastIndex = 0;
      if (!re.test(text)) return;
      re.lastIndex = 0;
      const frag = document.createDocumentFragment(); let last = 0, m;
      while ((m = re.exec(text))) {
        frag.append(text.slice(last, m.index));
        const term = termFor(m[0], zh);
        const kw = el('b', { class: 'kw', role: 'button', tabindex: '0', title: term || '' }, m[0]);
        const open = () => term && openVocab(term);
        kw.addEventListener('click', open);
        kw.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
        frag.append(kw); last = m.index + m[0].length;
      }
      frag.append(text.slice(last));
      n.replaceWith(frag);
    });
  };
  root.querySelectorAll('.en').forEach((n) => walk(n, reEn, false));
  if (reZh) root.querySelectorAll('.zh').forEach((n) => walk(n, reZh, true));
  return root;
}

// the badge shown on each page's "not finished yet" pop-up
const PAGE_ICON = { map: 'map', p02: 'scan', p03: 'tap', p04: 'map', p05: 'corner', p06: 'fields', p07: 'lion', p08: 'route', p09: 'calendar', p10: 'compare', p11: 'chat', p12: 'star' };

/* ---------- start ---------- */
// Developer shortcuts: open index.html#p04 to jump to a page, #reset to clear progress,
// #reset-p05 to clear one page's progress and open it again (handy for replaying a game).
// (A reload already starts everything fresh; these also work without reloading.)
function fromHash() {
  const h = location.hash.replace('#', '');
  if (h === 'reset') { Object.assign(state, freshState()); save(); setLang(state.lang); return 'p01'; }
  const one = h.match(/^reset-(p\d\d|map)$/);
  if (one && indexOf(one[1]) >= 0) {
    delete state.seen[one[1]]; delete state.done[one[1]]; save();
    history.replaceState(null, '', `#${one[1]}`);
    return one[1];
  }
  return indexOf(h) >= 0 ? h : null;
}
window.addEventListener('hashchange', () => { const h = fromHash(); if (h) go(h); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && $panel.classList.contains('is-open')) $panel.classList.remove('is-open'); });
go(fromHash() || state.page || 'p01');
// download the 3D models in the background while students are on the first pages (P02 AR, P04 map)
setTimeout(() => import('./ar-diorama.js').then((m) => m.prefetchKit()).catch(() => {}), 2500);

// Expose for "Experience Again" on later pages
export function resetAll() { Object.assign(state, freshState()); save(); setLang(state.lang); go('p01'); }
