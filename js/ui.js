// ui.js — bilingual text + shared component helpers. Every visible string goes through bi().
import CONTENT from '../content/content.js';
import { icon } from './icons.js';

let lang = 'bi'; // 'bi' | 'en' | 'zh'
export const setLang = (l) => { lang = l; };
export const getLang = () => lang;

/** Create an element: el('div', {class:'x', onclick:fn}, child1, 'text', ...) */
export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === undefined || v === null || v === false) continue;
    if (k === 'class') node.className = v;
    else if (k === 'html') node.innerHTML = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(node.style, v);
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, v === true ? '' : v);
  }
  for (const c of children.flat()) {
    if (c === null || c === undefined || c === false) continue;
    node.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return node;
}

const isTodo = (s) => typeof s === 'string' && s.startsWith('【待補');

/**
 * Bilingual text. text = {en, zh}.
 * layout 'stack' = EN line, ZH line below. 'inline' = "English 中文" on one line.
 */
export function bi(text, { tag = 'span', layout = 'stack', cls = '' } = {}) {
  const wrap = el(tag, { class: `bi ${layout} ${cls}`.trim() });
  if (!text) return wrap;
  if (lang === 'zh' && isTodo(text.zh) && text.en) {      // Chinese not written yet: show the English instead
    wrap.append(el('span', { class: 'en', lang: 'en' }, text.en));
    return wrap;
  }
  if (lang === 'zh') {
    wrap.append(el('span', { class: `zh solo${isTodo(text.zh) ? ' todo' : ''}`, lang: 'zh-Hant' }, text.zh));
    return wrap;
  }
  wrap.append(el('span', { class: 'en', lang: 'en' }, text.en));
  if (lang === 'bi' && text.zh && text.zh !== text.en && !isTodo(text.zh)) {   // unwritten 【待補】 lines stay hidden
    wrap.append(el('span', { class: `zh${isTodo(text.zh) ? ' todo' : ''}`, lang: 'zh-Hant' }, text.zh));
  }
  return wrap;
}

/** Plain string in the current language (for aria-labels). */
export const plain = (text) => (lang === 'zh' ? text.zh : text.en);

export function button(text, { variant = 'primary', onClick, disabled = false, id } = {}) {
  const b = el('button', { class: `btn btn-${variant}`, type: 'button', id, disabled }, bi(text));
  if (onClick) b.addEventListener('click', onClick);
  return b;
}

export function chip(text, { onClick, selected = false, iconName, cls = '' } = {}) {
  const tag = onClick ? 'button' : 'span';
  const c = el(tag, { class: `chip ${selected ? 'is-selected' : ''} ${cls}`.trim(), type: onClick ? 'button' : undefined });
  if (iconName) c.insertAdjacentHTML('beforeend', icon(iconName));
  c.append(bi(text, { layout: 'inline' }));
  if (onClick) c.addEventListener('click', onClick);
  return c;
}

export function iconButton(name, label, onClick, cls = '') {
  const b = el('button', { class: `icon-btn ${cls}`.trim(), type: 'button', 'aria-label': label, html: icon(name) });
  if (onClick) b.addEventListener('click', onClick);
  return b;
}

/** Checklist rows: [{text, done, count}] */
export function checklist(items) {
  return el('div', { class: 'checklist' },
    items.map((it) => el('div', { class: `row ${it.done ? 'is-done' : ''}` },
      el('span', { class: 'box', 'aria-hidden': 'true' }),
      el('span', {}, bi(it.text, { layout: 'inline' }), it.count ? el('span', { class: 'count' }, it.count) : null),
    )),
  );
}

/** Core-question style info box with a red seal stamp (問 = question, 想 = think, 知 = know) */
export function infoBox(label, text, seal = '問') {
  return el('div', { class: 'qbox' },
    el('span', { class: 'seal', 'aria-hidden': 'true', lang: 'zh-Hant' }, seal),
    el('div', {}, label ? el('span', { class: 'qlabel' }, plain(label)) : null, bi(text, { layout: 'stack' })));
}

/* ---------- toast ---------- */
export function toast(text, type = 'hint', ms = 3500) {
  const layer = document.getElementById('toast-layer');
  const t = el('div', { class: `toast ${type}`, role: 'status', html: icon(type === 'success' ? 'check' : 'bulb') }, bi(text, { layout: 'inline' }));
  layer.append(t);
  while (layer.children.length > 2) layer.firstElementChild.remove();
  setTimeout(() => { t.classList.add('is-leaving'); setTimeout(() => t.remove(), 300); }, ms);
  return t;
}
export function clearToasts() { document.getElementById('toast-layer').replaceChildren(); }

/* ---------- modal ---------- */
export function modal({ title, body = [], actions = [] }) {
  const layer = document.getElementById('modal-layer');
  let closeBtn;
  const close = () => { scrim.remove(); document.removeEventListener('keydown', onKey); };
  const onKey = (e) => { if (e.key === 'Escape') close(); };
  const box = el('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true' },
    title ? el('h2', {}, bi(title)) : null,
    ...body,
    actions.length ? el('div', { class: 'btn-row' }, actions) : null,
  );
  closeBtn = iconButton('close', plain(CONTENT.common.close), close, 'close');
  box.append(closeBtn);
  const scrim = el('div', { class: 'modal-scrim', onclick: (e) => { if (e.target === scrim) close(); } }, box);
  layer.replaceChildren(scrim);
  document.addEventListener('keydown', onKey);
  closeBtn.focus();
  return close;
}

export function closeModal() { document.getElementById('modal-layer').replaceChildren(); }

/** Vocabulary card in a modal. term = English term (case-insensitive) */
export function openVocab(term) {
  const key = String(term).toLowerCase();
  const v = CONTENT.vocab.find((x) => x.en.toLowerCase() === key || x.en.toLowerCase().startsWith(key));
  if (!v) return;
  const card = el('div', { class: 'vocab-card', tabindex: '0', role: 'button', 'aria-label': `${v.en}. Tap to flip.` },
    el('div', { class: 'flip' },
      el('div', { class: 'face front' },
        lang !== 'zh' ? el('div', { class: 'term', lang: 'en' }, v.en) : null,
        lang !== 'en' ? el('div', { class: 'term-zh', lang: 'zh-Hant' }, v.zh) : null,
        el('span', { class: 'level-tag' }, v.level)),
      el('div', { class: 'face back' },
        el('div', {}, v.def),
        el('div', { class: 'example' }, `“${v.ex}”`))));
  const flip = () => card.classList.toggle('is-flipped');
  card.addEventListener('click', flip);
  card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } });
  modal({ body: [card, el('p', { class: 'muted' }, bi(CONTENT.common.readMore, { layout: 'inline' }))] });
}

/**
 * Culture-note popover anchored to a point (x%, y%) inside a positioned container.
 * Returns a close() function.
 */
export function notePopover(container, { xPct, yPct, title, body, onClose }) {
  container.querySelectorAll('.culture-note').forEach((n) => n.__close ? n.__close() : n.remove());
  const note = el('div', { class: 'culture-note', role: 'dialog' },
    el('h3', {}, bi(title)),
    el('p', {}, bi(body)));
  const close = () => {
    note.remove();
    container.removeEventListener('pointerdown', outside, true);
    document.removeEventListener('keydown', onKey);
    onClose && onClose();
  };
  // Tap outside the note (but not on a pin, which opens its own note) or press Escape to close
  const outside = (e) => { if (!note.contains(e.target) && !e.target.closest('.map-pin')) close(); };
  const onKey = (e) => { if (e.key === 'Escape') close(); };
  container.addEventListener('pointerdown', outside, true);
  document.addEventListener('keydown', onKey);
  note.__close = close;
  note.append(iconButton('close', plain(CONTENT.common.close), close, 'close'));
  container.append(note);
  // Place the note beside the pin (right of it if the pin is in the left half, otherwise left),
  // so it rarely covers the other pins. Clamp inside the container.
  const cw = container.clientWidth, ch = container.clientHeight;
  const nw = note.offsetWidth, nh = note.offsetHeight;
  const px = (xPct / 100) * cw, py = (yPct / 100) * ch;
  const toRight = px < cw / 2;
  let left = toRight ? px + 30 : px - nw - 30;
  left = Math.min(Math.max(8, left), cw - nw - 8);
  let top = Math.min(Math.max(8, py - nh / 2), ch - nh - 8);
  note.style.left = `${left}px`;
  note.style.top = `${top}px`;
  note.style.setProperty('--tail-y', `${Math.min(Math.max(18, py - top), nh - 18)}px`);
  note.classList.add(toRight ? 'tail-left' : 'tail-right');
  return close;
}
