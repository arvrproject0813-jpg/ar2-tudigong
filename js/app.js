// app.js — page router, progress state, top bar and panel shell.
import CONTENT from '../content/content.js';
import { PAGES, STORE_KEY } from './config.js';
import { el, bi, button, iconButton, checklist, toast, clearToasts, closeModal, openVocab, setLang, plain, modal } from './ui.js';
import { icon } from './icons.js';
import { narrationControl, stopNarration } from './narration.js';
import { startMusic, stopMusic, installClickSounds } from './sound.js';
import { playGuide, clearGuide, stopGuide } from './guide.js';

/* ---------- state ---------- */
const freshState = () => ({
  lang: 'bi', page: 'p01', done: {}, seen: {},
  p08Route: [], p11Sentences: [], badges: [], arAvailable: false, panelCollapsed: false, music: true, voice: true,
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
  if (current?.mod?.destroy) { try { current.mod.destroy(); } catch (e) { console.error(e); } }
  clearToasts(); closeModal(); stopNarration(); clearGuide();
  const page = PAGES[indexOf(id)];
  let mod;
  try { mod = await import(`./pages/${page.file}.js`); }
  catch (e) { console.error('Could not load page', page.file, e); return; }
  if (token !== navToken) return;              // a newer navigation started meanwhile
  const fromFullbleed = document.body.classList.contains('is-fullbleed');
  current = { id, mod };
  state.page = id;
  // P02 always opens with the side panel showing: it slides in from the right
  const slidePanel = id === 'p02' && mod.chrome !== false && (state.panelCollapsed || fromFullbleed || !prevId);
  if (id === 'p02' && state.panelCollapsed) { state.panelCollapsed = false; applyPanelState(); }
  prevId = id;
  save();
  renderTopbar();
  $stage.replaceChildren(); $panel.replaceChildren();
  $stage.scrollTop = 0;
  document.body.classList.toggle('is-fullbleed', mod.chrome === false);
  mod.render($stage, makeCtx(id));
  if (slidePanel) playPanelEnter();
  if (id !== 'p01') startGuide(id);                 // the welcome page starts its own guide once the title is written
}
let prevId = null;

/** Slide the side panel (and its edge tab) in from the right edge, then let its contents fade in. */
function playPanelEnter() {
  const b = document.body;
  clearTimeout(playPanelEnter.t);
  b.classList.remove('panel-enter');
  b.classList.add('panel-pre', 'panel-collapsed');          // start fully closed, without a transition
  void $panel.offsetWidth;
  b.classList.remove('panel-pre');
  requestAnimationFrame(() => requestAnimationFrame(() => {
    b.classList.add('panel-enter');
    b.classList.toggle('panel-collapsed', !!state.panelCollapsed);   // open -> transitions to full width
  }));
  playPanelEnter.t = setTimeout(() => { b.classList.remove('panel-enter'); window.dispatchEvent(new Event('resize')); }, 1500);
}
const next = () => { const i = indexOf(current.id); if (i < PAGES.length - 1) go(PAGES[i + 1].id); };
const back = () => { const i = indexOf(current.id); if (i > 0) go(PAGES[i - 1].id); };
const rerender = () => go(current.id);

/* ---------- full-screen stage: hide / show the side panel ---------- */
// Edge tab on the panel's left side (created once, lives outside the page content)
const $handle = el('button', { id: 'panel-handle', type: 'button', onclick: () => setPanelCollapsed(!state.panelCollapsed) });
document.querySelector('.layout').append($handle);

function applyPanelState() {
  document.body.classList.toggle('panel-collapsed', !!state.panelCollapsed);
  $handle.innerHTML = icon(state.panelCollapsed ? 'chevLeft' : 'chevRight');
  const label = plain(state.panelCollapsed ? CONTENT.common.showPanel : CONTENT.common.fullScreen);
  $handle.setAttribute('aria-label', label); $handle.title = label;
  $panel.setAttribute('aria-hidden', state.panelCollapsed ? 'true' : 'false');
  // let layouts and the AR camera re-measure once the slide animation has finished
  setTimeout(() => window.dispatchEvent(new Event('resize')), 420);
}
function setPanelCollapsed(v) {
  state.panelCollapsed = v; save();
  applyPanelState();
  if (current) renderTopbar();
}

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
  setLang(state.lang); save(); rerender();
}

/* ---------- top bar ---------- */
function renderTopbar() {
  const i = indexOf(current.id);
  const langLabel = { bi: '雙語', en: 'EN', zh: '中文' }[state.lang];
  const langBtn = el('button', {
    class: 'icon-btn lang-btn', type: 'button',
    'aria-label': `${plain(CONTENT.common.language)}: ${langLabel}`,
    html: icon('lang'),
    onclick: cycleLang,
  }, langLabel);
  $topbar.replaceChildren(
    el('div', { class: 'tb-left' },
      el('button', { class: 'tb-logo', type: 'button', onclick: () => go('p01'), 'aria-label': 'Tudigong — back to the welcome page', title: `P${String(i + 1).padStart(2, '0')} / 12` },
        el('span', { class: 'cal', lang: 'zh-Hant' }, '土地公'),
        el('span', { class: 'lat' }, 'Tudigong'))),
    el('div', { class: 'tb-mid' },
      el('div', { class: 'progress-dots', role: 'progressbar', 'aria-valuemin': '1', 'aria-valuemax': '12', 'aria-valuenow': String(i + 1) },
        PAGES.map((p, j) => el('span', { class: j < i ? 'is-done' : j === i ? 'is-current' : '' })))),
    el('div', { class: 'tb-right' },
      voiceButton(),
      musicButton(),
      iconButton(state.panelCollapsed ? 'sidebar' : 'expand', plain(state.panelCollapsed ? CONTENT.common.showPanel : CONTENT.common.fullScreen),
        () => setPanelCollapsed(!state.panelCollapsed), 'panel-toggle'),
      langBtn),
  );
}

/* ---------- page context ---------- */
function makeCtx(id) {
  let primaryBtn = null, tasksHost = null, completed = !!state.done[id], tasks = [];

  const ctx = {
    id, state, content: CONTENT[id], CONTENT,
    go, next, back, rerender, save, toast, openVocab, cycleLang, musicButton, voiceButton, musicIfOn, resetAll: () => resetAll(),
    guide: () => startGuide(id),

    /**
     * Build the right-hand panel.
     * opts: { title?, display?, narration? (default true), body?: Node[], tasks?: [], secondary?: Node[], primary?: {text, onClick} | false }
     */
    panel(opts = {}) {
      const c = CONTENT[id] || {};
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
      if (opts.tasks) ctx.setTasks(opts.tasks);
      const actions = el('div', { class: 'panel-actions' });
      if (opts.secondary?.length) actions.append(el('div', { class: 'btn-row' }, opts.secondary));
      // bottom row: a small round Back button + the wide primary (Next) button
      const nav = el('div', { class: 'nav-row' });
      if (indexOf(id) > 0) nav.append(iconButton('back', plain(CONTENT.common.back), back, 'nav-back'));
      if (opts.primary !== false) {
        const p = opts.primary || { text: CONTENT.common.next, onClick: next };
        // Next always works: if the page isn't finished yet, a small dialog asks whether to stay or move on
        primaryBtn = button(p.text, { variant: 'primary', onClick: () => (completed || p.alwaysEnabled ? p.onClick() : askSkip(p.onClick)) });
        primaryBtn.classList.toggle('is-pending', !completed && !p.alwaysEnabled);
        nav.append(primaryBtn);
      }
      if (nav.childElementCount) actions.append(nav);
      inner.append(actions);
      $panel.replaceChildren(inner);
    },

    setTasks(items) { tasks = items || []; if (tasksHost) tasksHost.replaceChildren(checklist(items)); },

    /** Mark this page complete: unlocks the primary button and saves progress. */
    complete() {
      completed = true;
      state.done[id] = true; save();
      if (primaryBtn) primaryBtn.classList.remove('is-pending');
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
const PAGE_ICON = { p02: 'scan', p03: 'tap', p04: 'map', p05: 'corner', p06: 'fields', p07: 'cards', p08: 'map', p09: 'temple', p10: 'fields', p11: 'puzzle', p12: 'check' };

/* ---------- start ---------- */
// Developer shortcuts: open index.html#p04 to jump to a page, #reset to clear progress,
// #reset-p05 to clear one page's progress and open it again (handy for replaying a game).
// (A reload already starts everything fresh; these also work without reloading.)
function fromHash() {
  const h = location.hash.replace('#', '');
  if (h === 'reset') { Object.assign(state, freshState()); save(); setLang(state.lang); return 'p01'; }
  const one = h.match(/^reset-(p\d\d)$/);
  if (one && indexOf(one[1]) >= 0) {
    delete state.seen[one[1]]; delete state.done[one[1]]; save();
    history.replaceState(null, '', `#${one[1]}`);
    return one[1];
  }
  return indexOf(h) >= 0 ? h : null;
}
window.addEventListener('hashchange', () => { const h = fromHash(); if (h) go(h); });
applyPanelState();
go(fromHash() || state.page || 'p01');
// download the 3D models in the background while students are on the first pages (P02 AR, P04 map)
setTimeout(() => import('./ar-diorama.js').then((m) => m.prefetchKit()).catch(() => {}), 2500);

// Expose for "Experience Again" on later pages
export function resetAll() { Object.assign(state, freshState()); save(); setLang(state.lang); go('p01'); }
