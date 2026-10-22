// app.js — page router, progress state, top bar and panel shell.
import CONTENT from '../content/content.js';
import { PAGES, STORE_KEY } from './config.js';
import { el, bi, button, iconButton, checklist, toast, clearToasts, closeModal, openVocab, setLang, plain } from './ui.js';
import { icon } from './icons.js';
import { narrationControl, stopNarration } from './narration.js';
import { startMusic, stopMusic, installClickSounds } from './sound.js';

/* ---------- state ---------- */
const freshState = () => ({
  lang: 'bi', page: 'p01', done: {}, seen: {},
  p08Route: [], p11Sentences: [], badges: [], arAvailable: false, panelCollapsed: false, music: true,
});
function load() {
  try { return { ...freshState(), ...JSON.parse(localStorage.getItem(STORE_KEY) || '{}') }; }
  catch (e) { return freshState(); }
}
const state = load();
function save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* storage blocked: progress just isn't kept */ } }
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
  clearToasts(); closeModal(); stopNarration();
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
      musicButton(),
      iconButton(state.panelCollapsed ? 'sidebar' : 'expand', plain(state.panelCollapsed ? CONTENT.common.showPanel : CONTENT.common.fullScreen),
        () => setPanelCollapsed(!state.panelCollapsed), 'panel-toggle'),
      langBtn),
  );
}

/* ---------- page context ---------- */
function makeCtx(id) {
  let primaryBtn = null, tasksHost = null, completed = !!state.done[id];

  const ctx = {
    id, state, content: CONTENT[id], CONTENT,
    go, next, back, rerender, save, toast, openVocab, cycleLang, musicButton, musicIfOn, resetAll: () => resetAll(),

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
      if (opts.narration !== false && c.narration) body.append(el('div', { class: 'narration' }, bi(c.narration)));
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
        primaryBtn = button(p.text, { variant: 'primary', onClick: p.onClick, disabled: p.alwaysEnabled ? false : !completed });
        nav.append(primaryBtn);
      }
      if (nav.childElementCount) actions.append(nav);
      inner.append(actions);
      $panel.replaceChildren(inner);
    },

    setTasks(items) { if (tasksHost) tasksHost.replaceChildren(checklist(items)); },

    /** Mark this page complete: unlocks the primary button and saves progress. */
    complete() {
      completed = true;
      state.done[id] = true; save();
      if (primaryBtn) primaryBtn.disabled = false;
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
  return ctx;
}

/* ---------- start ---------- */
// Developer shortcuts: open index.html#p04 to jump to a page, #reset to clear progress,
// #reset-p05 to clear one page's progress and open it again (handy for replaying a game).
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

// Expose for "Experience Again" on later pages
export function resetAll() { Object.assign(state, freshState()); save(); setLang(state.lang); go('p01'); }
