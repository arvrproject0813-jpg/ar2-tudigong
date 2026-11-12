// guide.js — the voice guide: a short, calm spoken "what to do" when each page opens.
//
// Files: assets/audio/guide/p01_en.mp3 … p12_zh.mp3 (made with the open-source Kokoro voice model,
// English voice af_sol, Mandarin voice zf_018, a little slower than normal). The words are CONTENT.pXX.guide,
// shown in a small bar at the bottom of the stage while the voice speaks.
//   English mode → English, 中文 mode → Mandarin, 雙語 mode → English, then Mandarin.
// The speaker button in the top bar turns the voice on/off (the bar still shows the words).
import CONTENT from '../content/content.js';
import { AUDIO_DIR } from './config.js';
import { el, bi, plain } from './ui.js';
import { icon } from './icons.js';
import { duckMusic } from './sound.js';

const DIR = `${AUDIO_DIR}guide/`;
const audio = new Audio();
audio.preload = 'auto';
let token = 0, bar = null, hideTimer = null, speaking = false;

const setSpeaking = (v) => {
  speaking = v;
  duckMusic(v);
  bar?.classList.toggle('is-speaking', v);
};

/** Stop the voice (keeps the bar). */
export function stopGuide() {
  token++;
  audio.pause();
  if (speaking) setSpeaking(false);
}

/** Remove the bar and stop the voice (used when the page changes). */
export function clearGuide() {
  stopGuide();
  clearTimeout(hideTimer);
  bar?.remove(); bar = null;
}

function playFiles(files) {
  const my = ++token;
  const step = (i) => {
    if (my !== token) return;
    if (i >= files.length) { setSpeaking(false); scheduleHide(); return; }
    audio.src = files[i];
    if (bar) bar.dataset.line = /_zh\.mp3$/.test(files[i]) ? 'zh' : 'en';   // which line is being spoken (phones show just that one)
    audio.onended = () => step(i + 1);
    audio.onerror = () => step(i + 1);
    audio.play().then(() => { if (my === token) setSpeaking(true); })
      .catch(() => { if (my === token) { setSpeaking(false); bar?.classList.add('is-blocked'); } });   // autoplay not allowed yet: the ▶ button plays it
  };
  step(0);
}

function scheduleHide(ms = 7000) {
  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => bar?.classList.add('is-hidden'), ms);
}

/**
 * Show the guide for a page and, if the voice is on, speak it.
 * host = the element the bar goes in (the stage); lang = 'en' | 'zh' | 'bi'
 */
export function playGuide(pageId, { host, lang, voiceOn }) {
  clearGuide();
  const g = CONTENT[pageId]?.guide;
  if (!g || !host) return;
  host = host.querySelector('[data-guide-host]') || host;      // a page can offer a better spot (P02's camera setup card)
  const files = (lang === 'zh' ? ['zh'] : lang === 'en' ? ['en'] : ['en', 'zh']).map((l) => `${DIR}${pageId}_${l}.mp3`);
  const replay = el('button', { class: 'guide-btn', type: 'button', 'aria-label': plain(CONTENT.common.guideReplay), title: plain(CONTENT.common.guideReplay), html: icon('recenter') });
  const hide = el('button', { class: 'guide-btn', type: 'button', 'aria-label': plain(CONTENT.common.guideHide), title: plain(CONTENT.common.guideHide), html: icon('close') });
  bar = el('div', { class: 'guide-bar', role: 'status', 'data-line': voiceOn ? 'en' : 'both' },
    el('span', { class: 'guide-ic', 'aria-hidden': 'true', html: icon('speaker') }),
    el('div', { class: 'guide-text' }, bi(g, { layout: 'stack' })),
    replay, hide);
  replay.addEventListener('click', (e) => {
    e.stopPropagation();
    bar.classList.remove('is-hidden', 'is-blocked'); clearTimeout(hideTimer);
    playFiles(files);
  });
  hide.addEventListener('click', (e) => { e.stopPropagation(); stopGuide(); bar.classList.add('is-hidden'); });
  host.append(bar);
  if (voiceOn) playFiles(files); else scheduleHide(9000);
}
