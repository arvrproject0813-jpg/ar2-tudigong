// P11 · Ending — Introduce Tudigong and community culture in English.
//
//   Behind the card: the student's own community map from Scene 4 (js/community-board.js, faded), with their route.
//   The sentence card (team script claude/ui_narration_p10_p12.md): the core question on top, three sentence frames
//   (tabs: Connections · Landscape · Meinong). Tap a word card to fill the next blank; tap a filled blank to empty it.
//   Words that don't fit get a gentle hint ("Not quite…"), never "wrong". A finished sentence shows its Chinese line,
//   a short culture recap, and Listen (assets/audio/p11/<key>.mp3, Kokoro voice af_sol; the browser's own English
//   voice if a file is missing). Sentences are kept in state.p11Sentences for P12. Badge: Culture Introducer.
import { el, bi, chip, toast, clearToasts, plain, button, modal } from '../ui.js';
import { icon } from '../icons.js';
import { playChime, playMiss, playFlourish, playClick, duckMusic } from '../sound.js';
import { stopGuide } from '../guide.js';
import { earnBadge } from '../badges.js';
import { communityBoard, NODE_IDS } from '../community-board.js';
import { AUDIO_DIR } from '../config.js';

const BLANK_EN = '___', BLANK_ZH = '＿＿';
const audio = new Audio();
let timers = [];

/** The sentence's audio file: t1_<a>_<b>, t2_<a>, t3_<a> (option numbers). */
const audioKey = (tab, fill) => `t${tab + 1}_${fill.join('_')}`;

export function render(stage, ctx) {
  const c = ctx.content, k = ctx.CONTENT.common, P12 = ctx.CONTENT.p12;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let tab = ctx.seen('tab') ?? 0;
  const fills = ctx.seen('fills') || c.frames.map((f) => f.en.split(BLANK_EN).slice(1).map(() => null));

  /* ---------- the community map from Scene 4, faded behind the card ---------- */
  const placed = ctx.state.seen.p08?.placed;
  const route = (ctx.state.p08Route || []).map((r) => r.id);
  const board = communityBoard({ placed: placed && Object.keys(placed).length ? placed : Object.fromEntries(NODE_IDS.map((id, i) => [i, id])), route, tags: false });
  const bg = el('div', { class: 'p11-bg', 'aria-hidden': 'true' }, board.root);

  /* ---------- the card ---------- */
  const tabs = c.tabs.map((t, i) => {
    const b = el('button', { class: 'p11-tab', type: 'button', role: 'tab', 'data-i': i }, el('b', {}, String(i + 1)), bi(t, { layout: 'stack' }));
    b.addEventListener('click', () => { if (i !== tab) { playClick(); setTab(i); } });
    return b;
  });
  const promptEl = el('p', { class: 'p11-prompt' });
  const sentenceEl = el('div', { class: 'p11-sentence', 'aria-live': 'polite' });
  const zhEl = el('p', { class: 'p11-zh', lang: 'zh-Hant' });
  const wordsEl = el('div', { class: 'p11-words' });
  const listenBtn = el('button', { class: 'btn btn-primary p11-listen', type: 'button' }, el('span', { class: 'ic', html: icon('speaker') }), bi(c.listen, { layout: 'stack' }));
  const doneEl = el('div', { class: 'p11-done', hidden: true });
  const card = el('div', { class: 'paper-card p11-card' },
    el('div', { class: 'p11-core' }, el('span', { class: 'seal', 'aria-hidden': 'true', lang: 'zh-Hant' }, '問'),
      el('p', {}, el('b', {}, bi(k.coreInquiry, { layout: 'inline' })), bi(ctx.CONTENT.meta.coreQuestion, { layout: 'stack' }))),
    el('div', { class: 'p11-head' },
      el('h2', {}, bi(c.cardTitle, { layout: 'stack' })),
      el('p', { class: 'p11-instruction' }, bi(c.instruction, { layout: 'stack' }))),
    el('div', { class: 'p11-tabs', role: 'tablist' }, tabs),
    el('div', { class: 'p11-body' }, promptEl, sentenceEl, zhEl, wordsEl, doneEl));
  const starters = el('div', { class: 'p11-starters' },
    el('span', { class: 'p11-starters-title' }, el('span', { class: 'ic', html: icon('chat') }), bi(c.startersTitle, { layout: 'stack' })),
    el('div', { class: 'p11-starter-chips' }, c.starters.map((s) => el('span', { class: 'p11-starter' }, bi(s, { layout: 'stack' })))),
    el('span', { class: 'p11-starters-tip' }, bi(c.startersTip, { layout: 'stack' })));
  stage.append(el('div', { class: 'scene p11' }, bg, el('div', { class: 'p11-wrap' }, starters, card)));

  /* ---------- panel: Experience Again · Give Feedback · Next ---------- */
  const againBtn = button(c.again, { variant: 'secondary', onClick: () => confirmAgain() });
  // Give Feedback: the ending page opens with its sheet scrolled to the feedback form
  const feedbackBtn = button(c.feedback, { variant: 'secondary', onClick: () => { ctx.state.toFeedback = true; ctx.go('p12'); } });
  ctx.panel({
    body: [el('div', { class: 'chip-row' }, c.chips.map((v) => chip(v, { iconName: 'book', onClick: () => ctx.openVocab(v.en) })))],
    secondary: [againBtn, feedbackBtn],
  });
  const sentences = () => ctx.state.p11Sentences || [];
  const progress = () => ctx.setTasks([{ text: c.task, done: sentences().length > 0, count: `${Math.min(sentences().length, 1)}/1` }]);

  function confirmAgain() {
    const close = modal({
      title: P12.startAgain,
      body: [el('p', {}, bi(P12.confirmAgain))],
      actions: [button(P12.cancel, { variant: 'secondary', onClick: () => close() }), button(P12.startAgain, { variant: 'primary', onClick: () => { close(); ctx.resetAll(); } })],
    });
  }

  /* ---------- building a sentence ---------- */
  const frame = () => c.frames[tab];
  const isFull = () => fills[tab].every((v) => v !== null);
  function setTab(i) {
    tab = i; ctx.seen('tab', i);
    tabs.forEach((t, j) => { t.classList.toggle('is-on', j === i); t.setAttribute('aria-selected', String(j === i)); });
    promptEl.replaceChildren(el('span', { class: 'ic', html: icon('bulb') }), bi(c.prompts[i], { layout: 'stack' }));
    draw(false);
  }
  function draw(justFinished) {
    const f = frame(), fill = fills[tab];
    const parts = f.en.split(BLANK_EN);
    const nodes = [];
    parts.forEach((p, i) => {
      if (p) nodes.push(el('span', { class: 'p11-text' }, p));
      if (i < parts.length - 1) {
        const opt = fill[i] !== null ? f.options[fill[i]] : null;
        const next = !opt && fill.indexOf(null) === i;
        const slot = el('button', { class: `p11-blank${opt ? ' is-filled' : ''}${next ? ' is-next' : ''}`, type: 'button', 'aria-label': opt ? `${opt.en} ✕` : `blank ${i + 1}` },
          opt ? el('span', { class: 'p11-blank-word' }, opt.en, el('span', { class: 'x', html: icon('close') })) : el('span', { class: 'p11-blank-line' }));
        if (opt) slot.addEventListener('click', () => { fill[i] = null; save(); playClick(); draw(false); });
        nodes.push(slot);
      }
    });
    sentenceEl.replaceChildren(...nodes);
    sentenceEl.classList.toggle('is-complete', isFull());
    if (justFinished && !reduce) { sentenceEl.classList.remove('is-pop'); void sentenceEl.offsetWidth; sentenceEl.classList.add('is-pop'); }
    // the Chinese line of a finished sentence
    const zh = isFull() ? f.zh.split(BLANK_ZH).reduce((acc, p, i, arr) => acc + p + (i < arr.length - 1 ? f.options[fill[i]].zh : ''), '') : '';
    zhEl.textContent = zh;
    zhEl.hidden = !zh || ctx.state.lang === 'en';
    // word cards
    wordsEl.replaceChildren(...f.options.map((o, j) => {
      const used = fill.includes(j);
      // the sentence is English in every language mode, so the cards always show the English word (with its Chinese)
      const w = el('button', { class: `p11-word${used ? ' is-used' : ''}`, type: 'button', 'aria-pressed': String(used), 'aria-label': o.en },
        el('span', { class: 'bi stack' }, el('span', { class: 'en', lang: 'en' }, o.en), ctx.state.lang !== 'en' ? el('span', { class: 'zh', lang: 'zh-Hant' }, o.zh) : null));
      w.addEventListener('click', () => pick(j, w));
      return w;
    }));
    // finished: recap, Listen, what next
    doneEl.hidden = !isFull();
    card.classList.toggle('is-done', isFull());
    if (isFull()) {
      doneEl.replaceChildren(
        el('p', { class: 'p11-done-line' }, el('span', { class: 'ic', html: icon('check') }), bi(c.sentenceDone, { layout: 'inline' })),
        el('p', { class: 'p11-recap' }, el('span', { class: 'ic', html: icon('bulb') }), bi(c.recaps[tab], { layout: 'stack' })),
        el('div', { class: 'p11-speak' }, el('p', {}, bi(c.speakPrompt, { layout: 'stack' })), listenBtn),
        el('p', { class: 'p11-next' }, bi(c.nextPrompt, { layout: 'stack' })));
    }
  }
  function pick(j, w) {
    const f = frame(), fill = fills[tab], o = f.options[j];
    const shake = () => { w.classList.remove('is-hint'); void w.offsetWidth; w.classList.add('is-hint'); };
    if (o.ok === false) { playMiss(); shake(); clearToasts(); toast(o.hint, 'hint', 4200); return; }
    if (fill.includes(j)) { playMiss(); shake(); clearToasts(); toast(c.sameWord, 'hint'); return; }
    const at = fill.indexOf(null);
    if (at < 0) { shake(); clearToasts(); toast(c.tapBlank, 'hint'); return; }
    fill[at] = j; save();
    playChime(at);
    const finished = isFull();
    draw(finished);
    if (finished) finishSentence();
  }
  function save() { ctx.seen('fills', fills.map((f) => [...f])); }
  function finishSentence() {
    const f = frame(), fill = fills[tab];
    const en = f.en.split(BLANK_EN).reduce((acc, p, i, arr) => acc + p + (i < arr.length - 1 ? f.options[fill[i]].en : ''), '');
    const zh = f.zh.split(BLANK_ZH).reduce((acc, p, i, arr) => acc + p + (i < arr.length - 1 ? f.options[fill[i]].zh : ''), '');
    const list = sentences().filter((s) => s.tab !== tab);          // one sentence per frame (the newest)
    list.push({ tab, en, zh, key: audioKey(tab, fill) });
    ctx.state.p11Sentences = list.sort((a, b) => a.tab - b.tab); ctx.save();
    progress();
    const first = !ctx.isComplete();
    ctx.complete();
    playFlourish();
    if (first) {
      earnBadge(ctx, 'speaker');
      timers.push(setTimeout(() => { clearToasts(); toast(c.taskDone, 'success', 3000); }, 4100));
    } else { clearToasts(); toast(c.sentenceDone, 'success', 2200); }
  }

  /* ---------- Listen ---------- */
  function speak() {
    const f = frame(), fill = fills[tab];
    if (!isFull()) return;
    stopGuide();
    const text = f.en.split(BLANK_EN).reduce((acc, p, i, arr) => acc + p + (i < arr.length - 1 ? f.options[fill[i]].en : ''), '');
    listenBtn.classList.add('is-playing');
    const end = () => { listenBtn.classList.remove('is-playing'); duckMusic(false); };
    duckMusic(true);
    let fell = false;
    const fallback = () => {                                 // no recording: the browser's own English voice
      if (fell) return; fell = true;
      if (!('speechSynthesis' in window)) { end(); return; }
      const u = new SpeechSynthesisUtterance(text.replace(/Tudigong/g, 'Too-dee-gong').replace(/Bogong/g, 'Bo-gong').replace(/Meinong/g, 'May-nong'));
      u.lang = 'en-US'; u.rate = 0.85; u.onend = end; u.onerror = end;
      speechSynthesis.cancel(); speechSynthesis.speak(u);
    };
    audio.src = `${AUDIO_DIR}p11/${audioKey(tab, fill)}.mp3`;
    audio.onended = end;
    audio.onerror = fallback;
    audio.play().catch(fallback);
  }
  listenBtn.addEventListener('click', () => { playClick(); speak(); });

  /* ---------- start ---------- */
  setTab(tab);
  if (sentences().length) ctx.complete();
  progress();
}

export function destroy() {
  timers.forEach(clearTimeout); timers = [];
  audio.pause(); audio.onended = null; audio.onerror = null;
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  duckMusic(false);
}
