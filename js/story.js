// story.js — the scrolling "story page" every scene uses, so each one reads the same way:
//   Hero   what this scene is, a picture, and the three things you will do (with a Start button)
//   Learn  short cards that stick and stack as you scroll (one idea per card)
//   Do     the activity, on a board as tall as the screen
//   Badge  what it all adds up to, the badge, and where to go next
// The top bar's step chips (Learn · Do · Badge) follow the scroll, and tapping one scrolls there.
import { el, bi, plain, openVocab } from './ui.js';
import { icon } from './icons.js';
import { medal } from './badges.js';
import CONTENT from '../content/content.js';

const SECS = ['learn', 'do', 'badge'];

export function createStory(stage, ctx) {
  const J = CONTENT.journey, k = CONTENT.common;
  const stop = J.stops[ctx.id] || {};
  const scroller = el('div', { class: 'story', tabindex: '-1' });
  stage.append(el('div', { class: 'stage-wash is-story', 'aria-hidden': 'true' }), scroller);
  const sections = {};
  const cleanups = [];
  let stack = null;

  const steps = ctx.steps(k.stepNames, { onClick: (i) => scrollTo(SECS[i]) });

  function scrollTo(name, smooth = true) {
    const s = sections[name];
    if (!s) return;
    const top = s.offsetTop - (name === 'learn' ? 0 : 6);
    scroller.scrollTo({ top, behavior: smooth && !matchMedia('(prefers-reduced-motion: reduce)').matches ? 'smooth' : 'auto' });
  }

  /** Section heading: step number + name, a title and a line of help. */
  function head(n, title, intro) {
    return el('header', { class: 'st-head' },
      el('span', { class: 'st-step' }, el('b', {}, String(n)), bi(k.stepNames[n - 1], { layout: 'inline' })),
      el('h2', { class: 'st-h2' }, bi(title, { layout: 'stack' })),
      intro ? el('p', { class: 'st-help' }, bi(intro, { layout: 'stack' })) : null);
  }

  return {
    scroller, steps, scrollTo,

    /** The opening: kicker seal, title, intro, "In this scene you will" and Start. */
    hero({ img, imgW, imgH, intro, plan, planIcons = ['book', 'tap', 'medal'] }) {
      const seal = (stop.kicker?.zh || '').replace(/\s/g, '');
      const start = el('button', { class: 'btn btn-primary st-start', type: 'button' }, bi(k.start, { layout: 'stack' }));
      start.addEventListener('click', () => scrollTo('learn'));
      const hint = el('button', { class: 'st-scrollhint', type: 'button', 'aria-label': plain(k.scrollHint) },
        bi(k.scrollHint, { layout: 'inline' }), el('span', { class: 'ic', html: icon('chevLeft') }));
      hint.addEventListener('click', () => scrollTo('learn'));
      const sec = el('section', { class: 'st-hero', 'data-sec': 'hero' },
        el('div', { class: 'st-hero-text' },
          el('div', { class: 'st-kicker' },
            seal ? el('span', { class: 'st-vseal', lang: 'zh-Hant', 'aria-hidden': 'true' }, seal) : null,
            el('span', { class: 'st-kicker-text' },
              el('span', { class: 'st-kicker-en' }, bi(stop.kicker ? { en: `${stop.kicker.en} · Stop ${Object.keys(J.stops).indexOf(ctx.id) + 1}`, zh: `${stop.kicker.zh} · 第 ${Object.keys(J.stops).indexOf(ctx.id) + 1} 站` } : J.title, { layout: 'inline' })))),
          el('h1', { class: 'st-title' }, bi(ctx.content.heading, { layout: 'stack' })),
          intro ? el('p', { class: 'st-intro' }, bi(intro, { layout: 'stack' })) : null,
          el('div', { class: 'st-plan' },
            el('h3', {}, bi(k.youWill, { layout: 'inline' })),
            el('ol', {}, plan.map((p, i) => el('li', { style: { '--i': i } },
              el('span', { class: 'st-plan-no' }, String(i + 1)),
              el('span', { class: 'st-plan-ic', html: icon(planIcons[i]) }),
              el('span', { class: 'st-plan-step' }, bi(k.stepNames[i], { layout: 'inline' })),
              el('span', { class: 'st-plan-text' }, bi(p, { layout: 'stack' })))))),
          start),
        el('div', { class: 'st-hero-art', 'aria-hidden': 'true' },
          el('span', { class: 'st-halo' }),
          el('img', { src: img, alt: '', width: imgW, height: imgH, draggable: 'false' })),
        hint);
      sections.hero = sec;
      scroller.append(sec);
      return sec;
    },

    /** Learn: one idea per card; the cards stick and stack while you scroll. */
    learn({ title, intro, cards }) {
      const cardEls = cards.map((c, i) => el('article', { class: 'st-card', style: { '--i': i } },
        el('div', { class: 'st-card-pic' }, el('img', { src: `assets/img/${c.img}`, alt: '', draggable: 'false', loading: 'lazy' })),
        el('div', { class: 'st-card-body' },
          el('span', { class: 'st-card-no' }, `${i + 1} / ${cards.length}`),
          el('h3', { class: 'st-card-title' }, bi(c.title, { layout: 'stack' })),
          c.vocab ? el('div', { class: 'st-words' }, c.vocab.map((term) => {
            const v = CONTENT.vocab.find((x) => x.en.toLowerCase() === term);
            if (!v) return null;
            const b = el('button', { class: 'st-word', type: 'button' },
              el('span', { class: 'ic', html: icon('book') }),
              el('span', { class: 'st-word-text' }, bi({ en: v.en, zh: v.zh }, { layout: 'inline', cls: 'st-word-term' }), el('small', { lang: 'en' }, v.def)));
            b.addEventListener('click', () => openVocab(v.en));
            return b;
          })) : null,
          c.text ? el('p', { class: 'st-card-text' }, bi(c.text, { layout: 'stack' })) : null)));
      const sec = el('section', { class: 'st-learn', 'data-sec': 'learn' }, head(1, title, intro), el('div', { class: 'st-stack' }, cardEls));
      sections.learn = sec;
      scroller.append(sec);
      stack = cardEls;
      return sec;
    },

    /** Do: the activity board (as tall as the screen). */
    doSection({ title, intro, body }) {
      const sec = el('section', { class: 'st-do', 'data-sec': 'do' }, head(2, title, intro), el('div', { class: 'st-board' }, body));
      sections.do = sec;
      scroller.append(sec);
      return sec;
    },

    /** Badge: the result picture, the badge, the takeaway and where to go next. Returns { sec, unlock(animate) }. */
    badgeSection({ title, badgeId, pic, takeTitle, takeText, extra = [], lockedText }) {
      const J2 = CONTENT.journey;
      const nextId = (() => { const ids = Object.keys(J2.stops); return ids[ids.indexOf(ctx.id) + 1]; })();
      const medalBox = el('div', { class: 'st-medal' }, medal(badgeId, { earned: false }),
        el('span', { class: 'st-medal-text' },
          el('small', {}, bi(k.badgeLockedTitle, { layout: 'inline' })),
          bi(CONTENT.p12.badges[badgeId], { layout: 'stack', cls: 'st-medal-name' })));
      const toMap = el('button', { class: 'btn btn-secondary st-tomap', type: 'button' }, el('span', { class: 'ic', html: icon('map') }), bi(J2.backToMap, { layout: 'stack' }));
      toMap.addEventListener('click', () => ctx.go('map'));
      const toNext = nextId ? el('button', { class: 'btn btn-primary st-tonext', type: 'button' },
        bi({ en: `${k.nextStopBtn.en}: ${J2.stops[nextId].title.en}`, zh: `${k.nextStopBtn.zh}：${J2.stops[nextId].title.zh}` }, { layout: 'stack' }),
        el('span', { class: 'ic', html: icon('chevRight') })) : null;
      toNext?.addEventListener('click', () => ctx.go(nextId));
      const lock = el('div', { class: 'st-lock' }, el('span', { class: 'ic', html: icon('puzzle') }), bi(lockedText, { layout: 'stack' }));
      const fin = el('div', { class: 'st-finale is-locked' },
        el('div', { class: 'st-finale-pic' }, pic, lock),
        el('div', { class: 'st-finale-text' },
          medalBox,
          el('h3', { class: 'st-take-title' }, bi(takeTitle, { layout: 'stack' })),
          el('p', { class: 'st-take' }, bi(takeText, { layout: 'stack' })),
          extra));
      const sec = el('section', { class: 'st-badge', 'data-sec': 'badge' }, head(3, title), fin,
        el('div', { class: 'st-nextrow' }, toMap, toNext));
      sections.badge = sec;
      scroller.append(sec, el('div', { class: 'st-end', 'aria-hidden': 'true' }));
      return {
        sec,
        unlock(animate) {
          fin.classList.remove('is-locked');
          if (animate) { fin.classList.add('is-unlocking'); setTimeout(() => fin.classList.remove('is-unlocking'), 1600); }
          medalBox.replaceChildren(medal(badgeId, { earned: true, cls: animate ? 'is-new' : '' }),
            el('span', { class: 'st-medal-text' },
              el('small', {}, bi(k.badgeEarned, { layout: 'inline' })),
              bi(CONTENT.p12.badges[badgeId], { layout: 'stack', cls: 'st-medal-name' })));
          steps.setDone(2);
        },
      };
    },

    /** Start watching the scroll: step chips + the stacking cards. Call after all sections are added. */
    ready() {
      // which section is on screen → the step chip
      const io = new IntersectionObserver((entries) => {
        const vis = SECS.map((n) => sections[n]).filter(Boolean)
          .map((s) => ({ s, r: s.getBoundingClientRect() }));
        const mid = scroller.getBoundingClientRect().top + scroller.clientHeight * 0.45;
        const on = vis.filter((v) => v.r.top <= mid).pop();
        steps.setActive(on ? SECS.indexOf(on.s.dataset.sec) : 0);
        if (sections.do && sections.do.getBoundingClientRect().top <= mid) steps.setDone(0);    // reached Do = Learn read
        void entries;
      }, { root: scroller, threshold: [0, 0.25, 0.5, 0.75, 1] });
      SECS.forEach((n) => sections[n] && io.observe(sections[n]));
      cleanups.push(() => io.disconnect());

      // the stacking cards: a card shrinks a little and dims as the next one slides over it
      let raf = 0;
      const onScroll = () => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          raf = 0;
          if (!stack?.length) return;
          const st = scroller.getBoundingClientRect().top;
          const tops = stack.map((c) => c.getBoundingClientRect().top - st);
          const h = stack[0].offsetHeight || 1;
          const pin = stack.map((c) => parseFloat(getComputedStyle(c).top) || 0);
          const t = stack.map((c, i) => (i === 0 ? 0 : Math.min(1, Math.max(0, 1 - (tops[i] - pin[i]) / h))));
          stack.forEach((c, i) => {
            const over = t.slice(i + 1).reduce((a, b) => a + b, 0);
            c.style.setProperty('--sc', (1 - 0.05 * over).toFixed(4));
            c.style.setProperty('--dim', Math.min(0.18, 0.09 * over).toFixed(3));
          });
        });
      };
      scroller.addEventListener('scroll', onScroll, { passive: true });
      cleanups.push(() => { scroller.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); });
      onScroll();
    },

    destroy() { cleanups.forEach((f) => f()); cleanups.length = 0; },
  };
}
