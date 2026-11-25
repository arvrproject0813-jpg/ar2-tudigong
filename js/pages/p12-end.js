// P12 · Project Information & User Feedback — "You Completed the Journey".
//
//   Stage: my community culture map (the route from Scene 4, js/community-board.js), my seven badges (earned ones
//   in colour with how they were earned; locked ones go back to their page), and the words learned today.
//   Panel (team script claude/ui_narration_p10_p12.md): back to the core question with one answer, my sentences from
//   P11, Story Introduction · Further Reading · Teacher Questions, a 1–5 feedback rating, Back to Home and
//   Experience Again (asks first: everything is cleared).
// Feedback is not sent anywhere yet (team decision): Submit shows the thank-you message.
import { el, bi, chip, toast, plain, button, modal, infoBox } from '../ui.js';
import { icon } from '../icons.js';
import { playClick, playFlourish } from '../sound.js';
import { BADGES, medal } from '../badges.js';
import { communityBoard } from '../community-board.js';

let timers = [];

export function render(stage, ctx) {
  const c = ctx.content, k = ctx.CONTENT.common, C = ctx.CONTENT;
  const S = ctx.state;
  const earned = (id) => S.badges.includes(id) || !!S.done[c.badgePage[id]];
  const nEarned = BADGES.filter(earned).length;

  /* ---------- my community culture map ---------- */
  const placed = S.seen.p08?.placed || {};
  const route = (S.p08Route || []).map((r) => r.id);
  const mapBody = route.length
    ? el('div', { class: 'p12-map' }, communityBoard({ placed, route, tags: true }).root, el('span', { class: 'p12-map-note' }, bi(k.conceptualMap, { layout: 'inline' })))
    : el('div', { class: 'p12-map is-empty' },
      el('span', { class: 'p12-empty-ic', html: icon('route') }),
      el('p', {}, bi(c.noRoute, { layout: 'stack' })),
      (() => { const b = el('button', { class: 'btn btn-primary p12-go', type: 'button' }, el('span', { class: 'ic', html: icon('map') }), bi(c.goScene4, { layout: 'stack' })); b.addEventListener('click', () => ctx.go('p08')); return b; })());
  const mapCard = el('section', { class: 'paper-card p12-card p12-mapcard' },
    el('h2', { class: 'p12-h' }, el('span', { class: 'ic', html: icon('map') }), bi(c.sections.myMap, { layout: 'stack' })),
    route.length ? el('p', { class: 'p12-sub' }, bi(c.mapCaption, { layout: 'inline' })) : null,
    mapBody);

  /* ---------- my badges ---------- */
  // tap a badge: how it was earned (or, if locked, a way back to its page) shows in the strip under the badges
  const info = el('div', { class: 'p12-badge-info', 'aria-live': 'polite' });
  const showInfo = (id) => {
    const on = earned(id);
    badgeEls.forEach((b) => b.classList.toggle('is-picked', b.dataset.id === id));
    const go = on ? null : el('button', { class: 'chip p12-badge-go', type: 'button' }, bi(c.goBack, { layout: 'inline' }), el('span', { class: 'ic', html: icon('chevRight') }));
    go?.addEventListener('click', () => { playClick(); ctx.go(c.badgePage[id]); });
    info.replaceChildren(...[medal(id, { earned: on, cls: 'is-mini' }),
      el('span', { class: 'p12-badge-info-text' }, el('b', {}, bi(c.badges[id], { layout: 'inline' })), bi(on ? c.badgeHow[id] : c.locked, { layout: 'stack' })), go].filter(Boolean));
  };
  const badgeEls = BADGES.map((id, i) => {
    const on = earned(id);
    const b = el('button', { class: `p12-badge${on ? ' is-earned' : ' is-locked'}`, type: 'button', 'data-id': id, style: { '--i': i }, 'aria-label': plain(c.badges[id]) },
      medal(id, { earned: on }),
      el('span', { class: 'p12-badge-name' }, bi(c.badges[id], { layout: 'stack' })));
    b.addEventListener('click', () => { playClick(); showInfo(id); });
    return b;
  });
  const badgesCard = el('section', { class: 'paper-card p12-card p12-badges' },
    el('div', { class: 'p12-badges-head' },
      el('h2', { class: 'p12-h' }, el('span', { class: 'ic', html: icon('star') }), bi(c.badgesTitle, { layout: 'stack' })),
      el('span', { class: 'p12-count' }, bi({ en: c.badgeCount.en.replace('{n}', nEarned), zh: c.badgeCount.zh.replace('{n}', nEarned) }, { layout: 'inline' })),
      el('span', { class: 'p12-meter', 'aria-hidden': 'true' }, el('i', { style: { width: `${(nEarned / BADGES.length) * 100}%` } }))),
    el('div', { class: 'p12-badge-row' }, badgeEls),
    info);
  showInfo(BADGES.find(earned) || BADGES[0]);

  /* ---------- words learned today ---------- */
  const wordsCard = el('section', { class: 'paper-card p12-card p12-words' },
    el('h2', { class: 'p12-h' }, el('span', { class: 'ic', html: icon('book') }), bi(c.words, { layout: 'stack' })),
    el('p', { class: 'p12-sub' }, bi(c.wordsTip, { layout: 'inline' })),
    el('div', { class: 'p12-word-chips' }, C.vocab.map((v) => chip({ en: v.en, zh: v.zh }, { iconName: 'book', onClick: () => ctx.openVocab(v.en) }))));

  const hero = el('div', { class: 'p12-hero' },
    el('div', { class: 'board-title p12-title' }, el('span', { class: 'board-orn', 'aria-hidden': 'true' }), bi(c.endTitle, { layout: 'inline' }), el('span', { class: 'board-orn is-r', 'aria-hidden': 'true' })),
    el('span', { class: 'p12-confetti', 'aria-hidden': 'true' }, Array.from({ length: 14 }, (_, i) => el('i', { style: { '--i': i } }))));
  stage.append(el('div', { class: 'scene p12' }, el('div', { class: 'p12-wrap' }, hero, el('div', { class: 'p12-grid' }, mapCard, badgesCard, wordsCard))));

  /* ---------- panel ---------- */
  const sentences = S.p11Sentences || [];
  const recap = el('div', { class: 'p12-recap' },
    infoBox(c.recapLabel, C.meta.coreQuestion, '問'),
    el('p', { class: 'p12-answer' }, bi(c.oneAnswer, { layout: 'stack' })),
    el('p', { class: 'p12-your' }, el('span', { class: 'ic', html: icon('chat') }), bi(c.yourAnswer, { layout: 'inline' })));
  const said = el('div', { class: 'p12-said' },
    el('h3', {}, bi(c.sections.canIntroduce, { layout: 'stack' })),
    sentences.length
      ? [el('p', { class: 'p12-said-intro' }, bi(c.sentencesIntro, { layout: 'inline' })),
        el('ol', { class: 'p12-sentences' }, sentences.map((s) => el('li', {}, el('span', { class: 'en', lang: 'en' }, s.en), S.lang !== 'en' ? el('span', { class: 'zh', lang: 'zh-Hant' }, s.zh) : null))),
        el('p', { class: 'p12-said-tip' }, bi(c.speakTip, { layout: 'inline' }))]
      : el('p', { class: 'p12-said-none' }, bi(c.noSentence, { layout: 'stack' })));
  const section = (title, ...kids) => el('details', { class: 'p12-acc' }, el('summary', {}, bi(title, { layout: 'inline' }), el('span', { class: 'chev', html: icon('chevRight') })), el('div', { class: 'p12-acc-body' }, ...kids));
  const filled = (t) => t && !/\[names\]|【待補/.test(`${t.en}${t.zh}`);
  const story = section(c.sections.story,
    el('p', {}, bi(c.storyText, { layout: 'stack' })),
    el('p', { class: 'p12-statement' }, bi(C.meta.statement, { layout: 'stack' })),
    filled(c.credits) ? el('p', { class: 'p12-credits' }, bi(c.credits, { layout: 'stack' })) : null);
  const reading = section(c.sections.reading,
    el('p', {}, bi(c.readingIntro, { layout: 'stack' })),
    el('ul', { class: 'p12-refs' }, C.references.map((r) => el('li', {}, el('a', { href: r.url, target: '_blank', rel: 'noopener noreferrer' }, r.title, el('span', { class: 'ic', html: icon('link') }))))));
  const teacher = section(c.sections.teacher,
    el('p', { class: 'p12-q' }, el('b', {}, bi(c.forStudents, { layout: 'inline' })), bi(c.studentPrompt, { layout: 'stack' })),
    el('p', { class: 'p12-q' }, el('b', {}, bi(c.forTeachers, { layout: 'inline' })), bi(c.teacherPrompt, { layout: 'stack' })),
    el('p', { class: 'p12-field' }, bi(c.fieldStudy, { layout: 'stack' })));

  /* feedback: 1–5 and an optional note (not sent anywhere yet) */
  let rating = ctx.seen('rating') || 0;
  const rateBtns = c.rates.map((r, i) => {
    const b = el('button', { class: 'p12-rate', type: 'button', 'aria-pressed': 'false', title: plain(r) }, el('b', {}, String(i + 1)), bi(r, { layout: 'stack' }));
    b.addEventListener('click', () => { rating = i + 1; playClick(); rateBtns.forEach((x, j) => { x.classList.toggle('is-on', j < rating); x.setAttribute('aria-pressed', String(j === i)); }); });
    return b;
  });
  const note = el('textarea', { class: 'p12-note', rows: '3', placeholder: plain(c.tellMorePh), maxlength: '500' });
  const submit = button(c.submit, { variant: 'primary', onClick: () => {
    if (!rating) { toast(c.rateFirst, 'hint'); return; }
    ctx.seen('rating', rating); ctx.seen('feedback', note.value.trim());
    playFlourish();
    form.replaceChildren(el('p', { class: 'p12-thanks' }, el('span', { class: 'ic', html: icon('check') }), bi(c.thanks, { layout: 'stack' })));
  } });
  const form = el('div', { class: 'p12-form' },
    el('p', { class: 'p12-rate-q' }, bi(c.rateQ, { layout: 'stack' })),
    el('div', { class: 'p12-rates' }, rateBtns),
    el('label', { class: 'p12-note-label' }, bi(c.tellMore, { layout: 'inline' }), note),
    submit);
  if (ctx.seen('feedback') !== undefined) form.replaceChildren(el('p', { class: 'p12-thanks' }, el('span', { class: 'ic', html: icon('check') }), bi(c.thanks, { layout: 'stack' })));
  else rateBtns.forEach((x, j) => x.classList.toggle('is-on', j < rating));
  const feedback = el('div', { class: 'p12-feedback' }, el('h3', {}, bi(c.sections.feedback, { layout: 'stack' })), form);

  const homeBtn = button(c.home, { variant: 'secondary', onClick: () => ctx.go('p01') });
  ctx.panel({
    body: [recap, said, el('div', { class: 'p12-accs' }, story, reading, teacher), feedback],
    secondary: [homeBtn],
    primary: { text: c.again, alwaysEnabled: true, onClick: () => confirmAgain() },
    sheetLabel: c.sheetLabel,
  });
  function confirmAgain() {
    const close = modal({
      title: c.startAgain,
      body: [el('p', {}, bi(c.confirmAgain))],
      actions: [button(c.cancel, { variant: 'secondary', onClick: () => close() }), button(c.startAgain, { variant: 'primary', onClick: () => { close(); ctx.resetAll(); } })],
    });
  }

  /* ---------- arrival ---------- */
  ctx.complete();
  if (!ctx.seen('arrived')) {
    ctx.seen('arrived', true);
    timers.push(setTimeout(() => { playFlourish(); toast(c.arrival, 'success', 3200); }, 500));
  }
}

export function destroy() { timers.forEach(clearTimeout); timers = []; }
