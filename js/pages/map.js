// Journey map — the home of the experience after the opening pages.
// A winding route (like a stamp-collecting trail, 集章) with every stop open: the next stop glows with
// "Start here", finished stops are gold with a red stamp, and tapping a stop shows what it is about.
import { el, bi, plain } from '../ui.js';
import { icon } from '../icons.js';
import { playStamp } from '../sound.js';

export const guideOnce = true;      // the voice guide speaks only on the first visit

let timers = [];
let ro = null;
let offDoc = null;

const CN_NUM = ['一', '二', '三', '四'];
const WAVE = [0, 1, 1.55, 1, 0, -1, -1.55, -1];     // sideways offsets of the stops along the route

export function render(stage, ctx) {
  const J = ctx.CONTENT.journey;
  const order = J.sections.flatMap((s) => s.stops);
  const done = (id) => !!ctx.state.done[id];
  const nextId = order.find((id) => !done(id)) || null;
  const stamped = new Set(ctx.seen('stamped') || []);
  const fresh = order.filter((id) => done(id) && !stamped.has(id));    // finished since the last visit: stamp them now
  const nDone = order.filter(done).length;

  const scroller = el('div', { class: 'jmap' });
  const col = el('div', { class: 'jm-col' });
  const pathSvg = el('div', { class: 'jm-path', 'aria-hidden': 'true' });
  col.append(pathSvg);

  /* ---------- heading ---------- */
  col.append(el('header', { class: 'jm-head' },
    el('h1', { class: 'jm-title' }, bi(J.title, { layout: 'stack' })),
    el('p', { class: 'jm-intro' }, bi(J.intro, { layout: 'stack' })),
    el('div', { class: 'jm-tally' },
      el('span', { class: 'jm-tally-seal', lang: 'zh-Hant', 'aria-hidden': 'true' }, '章'),
      el('b', {}, `${nDone} / ${order.length}`), bi(J.stamps, { layout: 'inline' }))));

  /* ---------- sections and stops ---------- */
  const stopEls = {};
  let k = 0;
  J.sections.forEach((sec, si) => {
    const secDone = sec.stops.filter(done).length;
    const banner = el('div', { class: `jm-banner${secDone === sec.stops.length ? ' is-done' : ''}` },
      el('span', { class: 'jm-roller l', 'aria-hidden': 'true' }),
      el('span', { class: 'jm-banner-seal', lang: 'zh-Hant', 'aria-hidden': 'true' }, CN_NUM[si]),
      el('h2', { class: 'jm-banner-title' }, bi(sec.title, { layout: 'stack' })),
      el('span', { class: 'jm-banner-count' }, secDone === sec.stops.length ? el('span', { class: 'ic', html: icon('check') }) : null, `${secDone}/${sec.stops.length}`),
      el('span', { class: 'jm-roller r', 'aria-hidden': 'true' }));
    const rows = sec.stops.map((id) => {
      const s = J.stops[id], i = order.indexOf(id), x = WAVE[k++ % WAVE.length];
      const state = done(id) ? 'is-done' : id === nextId ? 'is-next' : 'is-todo';
      const stop = el('button', {
        class: `jm-stop ${state}${fresh.includes(id) ? ' is-fresh' : ''}`, type: 'button', 'data-id': id,
        'aria-label': `${plain(J.stop)} ${i + 1}: ${plain(s.title)}${done(id) ? ` (${plain(J.done)})` : ''}`,
      },
        el('span', { class: 'jm-medal' }, el('span', { class: 'jm-beads' }), el('span', { class: 'jm-icon', html: icon(s.icon) })),
        el('span', { class: 'jm-num' }, String(i + 1)),
        el('span', { class: 'jm-stamp', lang: 'zh-Hant', 'aria-hidden': 'true' }, s.seal));
      stopEls[id] = stop;
      const side = x > 0 ? 'left' : x < 0 ? 'right' : (i % 2 ? 'left' : 'right');
      const row = el('div', { class: `jm-row ${state}`, style: { '--x': x } },
        id === nextId ? el('div', { class: 'jm-start' }, bi(J.startHere, { layout: 'stack' })) : null,
        stop,
        el('div', { class: 'jm-label' }, bi(s.title, { layout: 'stack' })),
        s.img ? el('img', { class: `jm-vig ${side}`, src: `assets/img/${s.img}`, alt: '', loading: 'lazy', draggable: 'false' }) : null);
      stop.addEventListener('click', (e) => { e.stopPropagation(); togglePop(row, id); });
      return row;
    });
    col.append(el('section', { class: 'jm-sec', 'data-sec': sec.id }, banner, el('div', { class: 'jm-stops' }, rows)));
  });

  /* ---------- the floating Continue button ---------- */
  const target = nextId || 'p12';
  const ts = J.stops[target];
  const cont = el('button', { class: 'jm-continue', type: 'button' },
    el('span', { class: 'jm-cont-ic', html: icon(nextId ? ts.icon : 'star') }),
    el('span', { class: 'jm-cont-text' },
      el('small', {}, bi(nextId ? { en: `${J.continue.en} · Stop ${order.indexOf(target) + 1}`, zh: `${J.continue.zh} · 第 ${order.indexOf(target) + 1} 站` } : J.allDone, { layout: 'inline' })),
      bi(nextId ? ts.title : J.seeBadges, { layout: 'inline' })),
    el('span', { class: 'jm-cont-go', html: icon('chevRight') }));
  cont.addEventListener('click', () => ctx.go(target));

  scroller.append(col, el('div', { class: 'jm-foot' }));
  stage.append(el('div', { class: 'stage-wash', 'aria-hidden': 'true' }), scroller, cont,
    el('div', { class: 'jm-guide', 'data-guide-host': '' }));      // the voice guide sits above the Continue button

  /* ---------- the stop card (what this stop is about) ---------- */
  let pop = null;
  function closePop() { if (!pop) return; pop.row.classList.remove('has-pop'); pop.node.remove(); pop = null; }
  function togglePop(row, id) {
    const same = pop?.id === id;
    closePop();
    if (same) return;
    const s = J.stops[id], i = order.indexOf(id);
    const go = el('button', { class: 'btn btn-primary jm-pop-go', type: 'button' },
      bi(done(id) ? J.again : J.go, { layout: 'stack' }));
    go.addEventListener('click', (e) => { e.stopPropagation(); ctx.go(id); });
    const node = el('div', { class: `jm-pop${done(id) ? ' is-done' : ''}`, role: 'dialog', 'aria-label': plain(s.title) },
      el('div', { class: 'jm-pop-kicker' }, bi({ en: `Stop ${i + 1} · ${s.kicker.en}`, zh: `第 ${i + 1} 站 · ${s.kicker.zh}` }, { layout: 'inline' })),
      el('div', { class: 'jm-pop-title' }, bi(s.title, { layout: 'stack' })),
      el('p', { class: 'jm-pop-blurb' }, bi(s.blurb, { layout: 'stack' })),
      done(id) ? el('div', { class: 'jm-pop-done' }, el('span', { class: 'ic', html: icon('check') }), bi(J.done, { layout: 'inline' })) : null,
      go);
    node.addEventListener('click', (e) => e.stopPropagation());
    row.classList.add('has-pop');
    row.append(node);
    pop = { id, row, node };
    // keep the card in view
    requestAnimationFrame(() => {
      const r = node.getBoundingClientRect(), sr = scroller.getBoundingClientRect();
      const over = r.bottom - (sr.bottom - 86);
      if (over > 0) scroller.scrollBy({ top: over, behavior: 'smooth' });
    });
  }
  const onDoc = () => closePop();
  document.addEventListener('click', onDoc);
  offDoc = () => document.removeEventListener('click', onDoc);

  /* ---------- the route: a winding road through the stops ---------- */
  function drawPath() {
    const cr = col.getBoundingClientRect();
    const pts = order.map((id) => {
      const r = stopEls[id].querySelector('.jm-medal').getBoundingClientRect();
      return { x: r.left - cr.left + r.width / 2, y: r.top - cr.top + r.height / 2, done: done(id) };
    });
    // Catmull-Rom → cubic Bézier, one segment per pair of stops
    const seg = (i) => {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
      const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
      return `M${p1.x.toFixed(1)},${p1.y.toFixed(1)} C${c1.x.toFixed(1)},${c1.y.toFixed(1)} ${c2.x.toFixed(1)},${c2.y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
    };
    let road = '', dots = '', gold = '';
    for (let i = 0; i < pts.length - 1; i++) {
      const d = seg(i);
      road += d;
      if (pts[i].done && pts[i + 1].done) gold += d; else dots += d;
    }
    pathSvg.innerHTML = `<svg width="${cr.width}" height="${col.scrollHeight}" viewBox="0 0 ${cr.width} ${col.scrollHeight}">
      <path class="jm-road" d="${road}"/><path class="jm-road-in" d="${road}"/>
      <path class="jm-dots" d="${dots}"/><path class="jm-gold" d="${gold}"/></svg>`;
  }
  ro = new ResizeObserver(() => drawPath());
  ro.observe(col);

  /* ---------- arrive: show the next stop, then stamp the stops finished since last time ---------- */
  const focusId = fresh[0] || nextId || order[order.length - 1];
  requestAnimationFrame(() => {
    drawPath();
    const r = stopEls[focusId].getBoundingClientRect(), sr = scroller.getBoundingClientRect();
    scroller.scrollTop += r.top - sr.top - sr.height * 0.42;
  });
  fresh.forEach((id, n) => timers.push(setTimeout(() => {
    const st = stopEls[id];
    st.classList.add('is-stamping');
    playStamp(Math.min(4, 1 + n));
    timers.push(setTimeout(() => st.classList.remove('is-fresh', 'is-stamping'), 700));
  }, 1150 + n * 650)));
  ctx.seen('stamped', order.filter(done));
}

export function destroy() {
  timers.forEach(clearTimeout); timers = [];
  ro?.disconnect(); ro = null;
  offDoc?.(); offDoc = null;
}
