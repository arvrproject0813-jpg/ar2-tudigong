// P04 · Introduction — tap 4 places on the culture map; observe 3 to continue.
import { el, bi, chip, toast, notePopover, plain } from '../ui.js';
import { ASSETS } from '../config.js';
import { icon } from '../icons.js';

// Pin positions in % of the 3:2 map image (assets/img/p04_culture_map.webp). Update if the art changes.
const NODES = [
  { id: 'corner', x: 64.8, y: 34.5, icon: 'corner', tagAbove: true },
  { id: 'fields', x: 30, y: 41, icon: 'fields' },
  { id: 'temple', x: 64.6, y: 55, icon: 'temple', temple: true },
  { id: 'market', x: 41, y: 65.5, icon: 'market' },
];
const NEED = 3;
// The map art has wide parchment margins, so it is shown zoomed in around its centre.
const ZOOM = { s: 1.22, ox: 52, oy: 50 };
const zx = (x) => ZOOM.ox + (x - ZOOM.ox) * ZOOM.s;
const zy = (y) => ZOOM.oy + (y - ZOOM.oy) * ZOOM.s;

export function render(stage, ctx) {
  const c = ctx.content;
  const { CONTENT } = ctx;
  const seen = new Set(ctx.seen('nodes') || []);

  const frame = el('div', { class: 'map-frame' },
    el('img', { src: ASSETS.p04Map, alt: '', style: { transform: `scale(${ZOOM.s})`, transformOrigin: `${ZOOM.ox}% ${ZOOM.oy}%` } }));
  const framed = el('div', { class: 'map-carved' }, frame);
  const pins = {};

  const progress = () => {
    const n = Math.min(seen.size, NEED);
    ctx.setTasks([{ text: c.task, done: seen.size >= NEED, count: `${n}/${NEED}` }]);
  };

  NODES.forEach((node) => {
    const data = c.nodes[node.id];
    const pin = el('button', {
      class: `map-pin ${node.temple ? 'is-temple' : ''} ${seen.has(node.id) ? 'is-done' : 'is-pulse-loop'}`,
      type: 'button',
      style: { left: `${zx(node.x)}%`, top: `${zy(node.y)}%` },
      'aria-label': plain(data.label),
      html: icon(node.icon),
    });
    const tag = el('div', { class: `pin-tag ${node.tagAbove ? 'is-above' : ''}`, style: { left: `${zx(node.x)}%`, top: `${zy(node.y)}%` } }, bi(data.label, { layout: 'stack' }));
    pin.addEventListener('click', () => {
      Object.values(pins).forEach((p) => p.classList.remove('is-active'));
      pin.classList.add('is-active');
      pin.classList.remove('is-pulse-loop');
      pin.classList.add('is-done');
      notePopover(frame, { xPct: zx(node.x), yPct: zy(node.y), title: data.label, body: data.note, onClose: () => pin.classList.remove('is-active') });
      const before = seen.size;
      seen.add(node.id);
      ctx.seen('nodes', [...seen]);
      progress();
      if (before < NEED && seen.size >= NEED) {
        ctx.complete();
        toast(c.complete, 'success');
      }
    });
    pins[node.id] = pin;
    frame.append(pin, tag);
  });

  // Core question stays visible as a small collapsible chip
  const q = el('div', { class: 'p04-question' });
  let open = false;
  const drawQ = () => {
    q.replaceChildren(chip(CONTENT.common.coreInquiry, { cls: 'on-art', iconName: 'pin', onClick: () => { open = !open; drawQ(); } }));
    if (open) q.append(el('div', { class: 'p04-question-text' }, bi(CONTENT.meta.coreQuestion)));
  };
  drawQ();

  stage.append(el('div', { class: 'map-area' }, framed), q);
  if (!seen.size) setTimeout(() => toast(c.tapPins, 'hint'), 400);

  ctx.panel({
    body: [el('div', { class: 'chip-row' },
      c.chips.map((v) => chip(v, { iconName: 'book', onClick: () => ctx.openVocab(v.en) })))],
  });
  progress();
  if (seen.size >= NEED) ctx.complete();
}

export function destroy() {}
