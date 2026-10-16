// app.js — page router, progress state, top bar and panel shell.
import CONTENT from '../content/content.js';
import { PAGES, STORE_KEY } from './config.js';
import { el, bi, button, iconButton, checklist, toast, clearToasts, closeModal, openVocab, setLang, plain } from './ui.js';
import { icon } from './icons.js';
import { narrationControl, stopNarration } from './narration.js';

/* ---------- state ---------- */
const freshState = () => ({
  lang: 'bi', page: 'p01', done: {}, seen: {},
  p08Route: [], p11Sentences: [], badges: [], arAvailable: false, panelCollapsed: false,
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
const $dock = document.getElementById('dock');
const LANG_ORDER = ['bi', 'en', 'zh'];

let current = null;     // { id, mod }
let dockInfo = { primary: null, completed: false };   // what the floating dock mirrors from the panel
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
  current = { id, mod };
  state.page = id; save();
  renderTopbar();
  $stage.replaceChildren(); $panel.replaceChildren();
  $stage.scrollTop = 0;
  dockInfo = { primary: null, completed: !!state.done[id] };
  mod.render($stage, makeCtx(id));
  renderDock();
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
  $dock.hidden = !state.panelCollapsed;
  $panel.setAttribute('aria-hidden', state.panelCollapsed ? 'true' : 'false');
  // let layouts and the AR camera re-measure once the slide animation has finished
  setTimeout(() => window.dispatchEvent(new Event('resize')), 420);
}
function setPanelCollapsed(v) {
  state.panelCollapsed = v; save();
  applyPanelState();
  if (current) { renderTopbar(); renderDock(); }
}

/* floating dock shown in full-screen mode: narration · show panel · next */
function renderDock() {
  if (!current) return;
  const C = CONTENT.common;
  const p = dockInfo.primary;
  const kids = [];
  if (CONTENT[current.id]?.narration) kids.push(narrationControl(current.id, state.lang, 'mini'));
  kids.push(el('button', { class: 'dock-btn', type: 'button', onclick: () => setPanelCollapsed(false), html: icon('chevLeft') }, bi(C.showPanel, { layout: 'inline' })));
  if (p) {
    const b = button(p.text, { variant: 'primary', onClick: p.onClick, disabled: p.alwaysEnabled ? false : !dockInfo.completed });
    b.classList.add('dock-primary');
    kids.push(b);
  }
  $dock.replaceChildren(...kids);
}

/* ---------- top bar ---------- */
function renderTopbar() {
  const i = indexOf(current.id);
  const langLabel = { bi: '雙語', en: 'EN', zh: '中文' }[state.lang];
  const langBtn = el('button', {
    class: 'icon-btn lang-btn', type: 'button',
    'aria-label': `${plain(CONTENT.common.language)}: ${langLabel}`,
    html: icon('lang'),
    onclick: () => {
      state.lang = LANG_ORDER[(LANG_ORDER.indexOf(state.lang) + 1) % LANG_ORDER.length];
      setLang(state.lang); save(); rerender();
    },
  }, langLabel);
  $topbar.replaceChildren(
    el('div', { class: 'tb-left' },
      i > 0 ? iconButton('back', plain(CONTENT.common.back), back) : null,
      el('span', { class: 'tb-count' }, `P${String(i + 1).padStart(2, '0')} / 12`)),
    el('div', { class: 'tb-mid' },
      el('div', { class: 'progress-dots', role: 'progressbar', 'aria-valuemin': '1', 'aria-valuemax': '12', 'aria-valuenow': String(i + 1) },
        PAGES.map((p, j) => el('span', { class: j < i ? 'is-done' : j === i ? 'is-current' : '' })))),
    el('div', { class: 'tb-right' },
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
    go, next, back, rerender, save, toast, openVocab, resetAll: () => resetAll(),

    /**
     * Build the right-hand panel.
     * opts: { title?, display?, narration? (default true), body?: Node[], tasks?: [], secondary?: Node[], primary?: {text, onClick} | false }
     */
    panel(opts = {}) {
      const c = CONTENT[id] || {};
      const title = opts.title || c.heading;
      const inner = el('div', { class: 'panel-inner' });
      if (c.eyebrow) {
        // "P04 · Introduction" + "P04 · 導論" → "P04 · INTRODUCTION · 導論" (page number only once)
        const zhPart = c.eyebrow.zh.split('·').pop().trim();
        const text = state.lang === 'zh' ? c.eyebrow.zh : state.lang === 'en' ? c.eyebrow.en : `${c.eyebrow.en} · ${zhPart}`;
        inner.append(el('div', { class: 'panel-eyebrow' }, text));
      }
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
      if (opts.primary !== false) {
        const p = opts.primary || { text: CONTENT.common.next, onClick: next };
        primaryBtn = button(p.text, { variant: 'primary', onClick: p.onClick, disabled: p.alwaysEnabled ? false : !completed });
        dockInfo.primary = p;
        actions.append(primaryBtn);
      }
      inner.append(actions);
      $panel.replaceChildren(inner);
      renderDock();
    },

    setTasks(items) { if (tasksHost) tasksHost.replaceChildren(checklist(items)); },

    /** Mark this page complete: unlocks the primary button and saves progress. */
    complete() {
      completed = true;
      state.done[id] = true; save();
      if (primaryBtn) primaryBtn.disabled = false;
      if (!dockInfo.completed) { dockInfo.completed = true; renderDock(); }
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
// Developer shortcuts: open index.html#p04 to jump to a page, #reset to clear progress.
function fromHash() {
  const h = location.hash.replace('#', '');
  if (h === 'reset') { Object.assign(state, freshState()); save(); setLang(state.lang); return 'p01'; }
  return indexOf(h) >= 0 ? h : null;
}
window.addEventListener('hashchange', () => { const h = fromHash(); if (h) go(h); });
applyPanelState();
go(fromHash() || state.page || 'p01');

// Expose for "Experience Again" on later pages
export function resetAll() { Object.assign(state, freshState()); save(); setLang(state.lang); go('p01'); }
