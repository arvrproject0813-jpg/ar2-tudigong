// narration.js — one shared audio player for page narration.
// Files: assets/audio/p01.mp3 … p12.mp3 (one per page). Optional language versions:
//   p01_zh.mp3 is used in 中文 mode, p01_en.mp3 in English mode; otherwise p01.mp3 is used.
// Until a file is uploaded the button shows "Narration coming soon" and is disabled.
import CONTENT from '../content/content.js';
import { AUDIO_DIR } from './config.js';
import { el, bi } from './ui.js';
import { icon } from './icons.js';

const audio = new Audio();
audio.preload = 'none';
const exists = new Map();     // url -> Promise<boolean>
let currentUrl = null;
const views = new Set();      // live button views to keep in sync

function check(url) {
  if (!exists.has(url)) {
    exists.set(url, fetch(url, { method: 'HEAD', cache: 'no-cache' })
      .then((r) => r.ok && !(r.headers.get('content-type') || '').includes('text/html'))
      .catch(() => false));
  }
  return exists.get(url);
}

/** Find the best audio file for a page and language, or null. */
export async function findNarration(pageId, lang) {
  const names = lang === 'zh' ? [`${pageId}_zh`, pageId] : lang === 'en' ? [`${pageId}_en`, pageId] : [pageId];
  for (const n of names) {
    const url = `${AUDIO_DIR}${n}.mp3`;
    if (await check(url)) return url;
  }
  return null;
}

const fmt = (s) => (isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` : '0:00');

function sync() {
  views.forEach((v) => v.update());
}
['play', 'pause', 'ended', 'timeupdate', 'loadedmetadata', 'error'].forEach((ev) => audio.addEventListener(ev, sync));

export function stopNarration() {
  audio.pause();
  if (audio.src) { audio.removeAttribute('src'); audio.load(); }
  currentUrl = null;
  views.clear();
}

function toggle(url) {
  if (currentUrl !== url) { currentUrl = url; audio.src = url; audio.currentTime = 0; }
  if (audio.paused) audio.play().catch(() => {}); else audio.pause();
  sync();
}

/**
 * A narration control. variant 'full' = pill with label, progress and time (panel);
 * 'mini' = round icon button (floating dock).
 */
export function narrationControl(pageId, lang, variant = 'full') {
  const C = CONTENT.common;
  const btn = el('button', { class: `narr-btn narr-${variant} is-checking`, type: 'button', disabled: true });
  const ic = el('span', { class: 'narr-ic', 'aria-hidden': 'true', html: icon('speaker') });
  const label = el('span', { class: 'narr-label' });
  const bar = el('span', { class: 'narr-bar' }, el('i'));
  const time = el('span', { class: 'narr-time' });
  if (variant === 'full') btn.append(ic, el('span', { class: 'narr-text' }, label, bar), time);
  else btn.append(ic);

  let url = null;
  const view = {
    update() {
      const mine = url && currentUrl === url;
      const playing = mine && !audio.paused;
      btn.classList.toggle('is-playing', playing);
      ic.innerHTML = icon(playing ? 'pause' : 'speaker');
      if (variant === 'full') {
        label.replaceChildren(bi(url ? (playing ? C.pause : C.listen) : C.audioSoon, { layout: 'inline' }));
        const d = mine ? audio.duration : NaN, t = mine ? audio.currentTime : 0;
        bar.firstChild.style.width = mine && isFinite(d) && d > 0 ? `${(t / d) * 100}%` : '0%';
        time.textContent = url && mine && isFinite(d) ? `${fmt(t)} / ${fmt(d)}` : '';
      }
      btn.setAttribute('aria-label', (url ? (playing ? C.pause : C.listen) : C.audioSoon).en);
      btn.title = btn.getAttribute('aria-label');
    },
  };
  views.add(view);
  view.update();
  findNarration(pageId, lang).then((found) => {
    url = found;
    btn.classList.remove('is-checking');
    btn.classList.toggle('is-missing', !url);
    btn.disabled = !url;
    view.update();
  });
  btn.addEventListener('click', () => { if (url) toggle(url); });
  return btn;
}
