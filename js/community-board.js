// community-board.js — the neighbourhood board of P08 ("From Kaohsiung to My Neighborhood"), also shown on P11 and P12.
//
// The board is one picture (assets/img/p08_board.webp, 1700 × 1000): harbour, canal, roads and six empty lots, drawn
// from the same 3D kit as the rest of the app with an orthographic camera (assets/source-art/render, scene 'p08.board').
// Each place is its own picture (assets/img/p08_node_<id>.webp) rendered with the same camera, so any place fits on
// any lot: put the picture so that its anchor (ax, ay) sits on the lot's point. All numbers are board pixels.
//
//   const b = communityBoard({ placed: { 0: 'school', 3: 'temple' }, route: ['school', 'temple'] });
//   stage.append(b.root);  b.place(lot, id, animate);  b.setRoute(ids, animate);  b.lots[i] = the lot's tap target
import { el, bi } from './ui.js';
import { icon } from './icons.js';
import CONTENT from '../content/content.js';

export const BOARD_W = 1700, BOARD_H = 1000;
export const LOTS = [[396.6, 358.4], [877.5, 417.0], [1358.3, 475.5], [325.4, 633.0], [806.2, 691.5], [1287.1, 750.1]];
export const NODES = {
  school: { w: 262, h: 251, ax: 139.0, ay: 159.6 },
  homes: { w: 280, h: 280, ax: 157.0, ay: 188.6 },
  market: { w: 248, h: 205, ax: 125.0, ay: 113.6 },
  park: { w: 248, h: 232, ax: 125.0, ay: 140.6 },
  temple: { w: 255, h: 219, ax: 132.0, ay: 127.6 },
  oldStreet: { w: 249, h: 213, ax: 126.0, ay: 121.6 },
};
export const NODE_IDS = ['school', 'homes', 'market', 'park', 'temple', 'oldStreet'];
export const NODE_ICON = { school: 'school', homes: 'home', market: 'market', park: 'tree', temple: 'temple', oldStreet: 'street' };
export const nodeImg = (id) => `assets/img/p08_node_${id.toLowerCase()}.webp`;
const px = (x) => `${(x / BOARD_W) * 100}%`, py = (y) => `${(y / BOARD_H) * 100}%`;

/** Smooth path through points (Catmull-Rom → Bézier), in board pixels. */
function routePath(pts) {
  if (pts.length < 2) return '';
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(i + 2, pts.length - 1)];
    const t = 0.18;
    const c1 = [p1[0] + (p2[0] - p0[0]) * t, p1[1] + (p2[1] - p0[1]) * t], c2 = [p2[0] - (p3[0] - p1[0]) * t, p2[1] - (p3[1] - p1[1]) * t];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}

export function communityBoard({ placed = {}, route = [], tags = true, interactive = false } = {}) {
  const names = CONTENT.p08.nodes;
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${BOARD_W} ${BOARD_H}`);
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.setAttribute('class', 'cb-route');
  svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = '<path class="cb-route-case"/><path class="cb-route-line"/>';
  const [routeCase, routeLine] = svg.querySelectorAll('path');

  const nodesLayer = el('div', { class: 'cb-nodes' });
  const stopsLayer = el('div', { class: 'cb-stops', 'aria-hidden': 'true' });
  const lots = LOTS.map(([x, y], i) => el(interactive ? 'button' : 'span', {
    class: 'cb-lot', type: interactive ? 'button' : undefined, 'data-lot': i, style: { left: px(x), top: py(y) },
    'aria-label': interactive ? `${CONTENT.p08.emptyLot.en} ${i + 1}` : undefined,
  }, el('span', { class: 'cb-lot-plus', 'aria-hidden': 'true', html: icon('plus') })));
  const root = el('div', { class: `cboard${interactive ? ' is-interactive' : ''}` },
    el('img', { class: 'cb-img', src: 'assets/img/p08_board.webp', alt: '', width: BOARD_W, height: BOARD_H, draggable: 'false' }),
    svg, nodesLayer, el('div', { class: 'cb-lots' }, lots), stopsLayer);
  const at = {};                                   // lot → id

  function place(lot, id, animate = false) {
    const [x, y] = LOTS[lot], n = NODES[id];
    at[lot] = id;
    const left = x - n.ax, top = y - n.ay;
    const node = el('div', { class: `cb-node is-${id}${animate ? ' is-new' : ''}`, 'data-lot': lot, 'data-id': id, style: { left: px(left), top: py(top), width: px(n.w), height: py(n.h) } },
      el('img', { src: nodeImg(id), alt: '', draggable: 'false' }),
      tags ? el('span', { class: 'cb-tag', style: { top: `${((n.ay + 34) / n.h) * 100}%`, left: `${(n.ax / n.w) * 100}%` } },
        el('span', { class: 'ic', html: icon(NODE_ICON[id]) }), bi(names[id], { layout: 'stack' })) : null);
    nodesLayer.querySelector(`.cb-node[data-lot="${lot}"]`)?.remove();
    // later lots (further down the board) are drawn in front
    const after = [...nodesLayer.children].find((c) => LOTS[+c.dataset.lot][1] > y);
    nodesLayer.insertBefore(node, after || null);
    lots[lot].classList.add('is-filled');
    lots[lot].dataset.id = id;
    if (interactive) lots[lot].setAttribute('aria-label', names[id].en);
    return node;
  }

  /** route = node ids in visiting order */
  function setRoute(ids, animate = false) {
    const lotOf = (id) => +Object.keys(at).find((l) => at[l] === id);
    const pts = ids.map((id) => LOTS[lotOf(id)]).filter(Boolean);
    const d = routePath(pts);
    routeCase.setAttribute('d', d); routeLine.setAttribute('d', d);
    svg.classList.toggle('is-drawing', animate && pts.length > 1);
    if (animate && pts.length > 1) {
      const len = routeLine.getTotalLength();
      svg.style.setProperty('--len', len.toFixed(0));
      svg.classList.remove('is-drawing'); void svg.getBoundingClientRect(); svg.classList.add('is-drawing');
    }
    stopsLayer.replaceChildren(...ids.map((id, i) => {
      const lot = lotOf(id), [x, y] = LOTS[lot], n = NODES[id];
      return el('span', { class: `cb-stop${animate && i === ids.length - 1 ? ' is-new' : ''}`, style: { left: px(x), top: py(y - n.ay + 18) } }, String(i + 1));
    }));
    Object.keys(at).forEach((l) => lots[l].classList.toggle('is-stop', ids.includes(at[l])));
  }

  Object.entries(placed).forEach(([lot, id]) => place(+lot, id));
  if (route.length) setRoute(route);
  return { root, lots, place, setRoute, at };
}

/** Where a lot is on the board, in % (for notes and pop-ups). */
export const lotPct = (lot) => [(LOTS[lot][0] / BOARD_W) * 100, (LOTS[lot][1] / BOARD_H) * 100];
