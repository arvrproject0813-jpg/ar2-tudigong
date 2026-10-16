// P04 · Introduction — explore the neighbourhood and tap 4 places; observe 3 to continue.
// Default view: a 3D model of the neighbourhood (the same one that rises from the card in AR) that you can
// drag to turn 360°, pinch / scroll to zoom. The info pins are attached to the model and follow it.
// If WebGL or three.js is not available, the flat illustrated map is shown instead (same pins, same task).
import { el, bi, chip, toast, notePopover, plain, iconButton } from '../ui.js';
import { ASSETS } from '../config.js';
import { icon } from '../icons.js';

const NODES = [
  { id: 'corner', x: 64.8, y: 34.5, icon: 'corner', tagAbove: true },
  { id: 'fields', x: 30, y: 41, icon: 'fields' },
  { id: 'temple', x: 64.6, y: 55, icon: 'temple', temple: true },
  { id: 'market', x: 41, y: 65.5, icon: 'market' },
];
const NEED = 3;
// 2D fallback: the map art has wide parchment margins, so it is shown zoomed in around its centre.
const ZOOM = { s: 1.22, ox: 52, oy: 50 };
const zx = (x) => ZOOM.ox + (x - ZOOM.ox) * ZOOM.s;
const zy = (y) => ZOOM.oy + (y - ZOOM.oy) * ZOOM.s;

// 3D camera: starting view, zoom limits
const VIEW = { pos: [0.62, 0.62, 0.98], target: [0, 0.04, 0], minDist: 0.45, maxDist: 2.2 };

let alive = false;
let stop3D = null;

export function render(stage, ctx) {
  alive = true;
  const c = ctx.content;
  const { CONTENT } = ctx;
  const seen = new Set(ctx.seen('nodes') || []);

  const frame = el('div', { class: 'map-frame' });
  const framed = el('div', { class: 'map-carved' }, frame);
  const pins = {};

  const progress = () => {
    const n = Math.min(seen.size, NEED);
    ctx.setTasks([{ text: c.task, done: seen.size >= NEED, count: `${n}/${NEED}` }]);
  };

  /** Shared: build a pin + label for a node. position(pin, tag) is called by the 2D or 3D view. */
  const makePin = (node, getPct) => {
    const data = c.nodes[node.id];
    const pin = el('button', {
      class: `map-pin ${node.temple ? 'is-temple' : ''} ${seen.has(node.id) ? 'is-done' : 'is-pulse-loop'}`,
      type: 'button', 'aria-label': plain(data.label), html: icon(node.icon),
    });
    const tag = el('div', { class: `pin-tag ${node.tagAbove ? 'is-above' : ''}` }, bi(data.label, { layout: 'stack' }));
    pin.addEventListener('click', () => {
      Object.values(pins).forEach((p) => p.classList.remove('is-active'));
      pin.classList.add('is-active');
      pin.classList.remove('is-pulse-loop');
      pin.classList.add('is-done');
      const { x, y } = getPct();
      notePopover(frame, { xPct: x, yPct: y, title: data.label, body: data.note, onClose: () => pin.classList.remove('is-active') });
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
    return { pin, tag };
  };

  /* ---------- flat map (fallback) ---------- */
  const mount2D = () => {
    frame.classList.remove('is-3d', 'is-loading');
    frame.replaceChildren(el('img', { src: ASSETS.p04Map, alt: '', style: { transform: `scale(${ZOOM.s})`, transformOrigin: `${ZOOM.ox}% ${ZOOM.oy}%` } }));
    NODES.forEach((node) => {
      const { pin, tag } = makePin(node, () => ({ x: zx(node.x), y: zy(node.y) }));
      [pin, tag].forEach((n) => { n.style.left = `${zx(node.x)}%`; n.style.top = `${zy(node.y)}%`; });
      frame.append(pin, tag);
    });
    if (!seen.size) setTimeout(() => alive && toast(c.tapPins, 'hint'), 400);
  };

  /* ---------- 3D neighbourhood ---------- */
  const mount3D = async () => {
    const probe = document.createElement('canvas');
    if (!(probe.getContext('webgl2') || probe.getContext('webgl'))) throw new Error('NO_WEBGL');
    const THREE = await import('three');
    const { OrbitControls } = await import('three/addons/controls/OrbitControls.js');
    const { buildNeighborhood, tickNeighborhood } = await import('../ar-diorama.js');
    if (!alive) return;

    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    const scene = new THREE.Scene();
    const n = buildNeighborhood(THREE, { markers: false, shadows: true });
    // the model's lights were tuned for A-Frame's legacy light units; three r160 uses physical units
    n.root.traverse((o) => { if (o.isLight) o.intensity *= Math.PI; });
    scene.add(n.root);

    const camera = new THREE.PerspectiveCamera(34, 1.5, 0.01, 20);
    camera.position.set(...VIEW.pos);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(...VIEW.target);
    Object.assign(controls, {
      enableDamping: true, dampingFactor: 0.08, enablePan: false,
      minDistance: VIEW.minDist, maxDistance: VIEW.maxDist,
      minPolarAngle: 0.15, maxPolarAngle: 1.32,             // never go under the table
      rotateSpeed: 0.8, zoomSpeed: 0.9,
      autoRotate: !reduce, autoRotateSpeed: 0.7,            // a slow turn invites the first drag
    });
    controls.update();

    const view = el('div', { class: 'map3d' });
    view.append(renderer.domElement);
    const stems = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    stems.setAttribute('class', 'map3d-stems'); stems.setAttribute('aria-hidden', 'true');
    view.append(stems);

    // pins: one per node, attached to a point above each place, with a gold stem down to the ground
    const items = NODES.map((node) => {
      const top = n.anchors[node.id].clone();
      const base = top.clone(); base.y = 0.008;
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      stems.append(line);
      const item = { node, top, base, line, x: 50, y: 50 };
      const { pin, tag } = makePin(node, () => ({ x: item.x, y: item.y }));
      item.pin = pin; item.tag = tag;
      view.append(pin, tag);
      return item;
    });

    // zoom / reset buttons (mouse users, and anyone who has not discovered pinch)
    const dolly = (f) => {
      const off = camera.position.clone().sub(controls.target);
      off.setLength(Math.min(VIEW.maxDist, Math.max(VIEW.minDist, off.length() * f)));
      camera.position.copy(controls.target).add(off);
      controls.update();
    };
    let flyBack = null;
    const tools = el('div', { class: 'map3d-tools' },
      iconButton('plus', plain(CONTENT.common.zoomIn), () => { controls.autoRotate = false; dolly(0.8); }),
      iconButton('minus', plain(CONTENT.common.zoomOut), () => { controls.autoRotate = false; dolly(1.25); }),
      iconButton('recenter', plain(CONTENT.common.resetView), () => { flyBack = { from: camera.position.clone(), t: 0 }; }));
    view.append(tools);

    frame.classList.remove('is-loading');
    frame.classList.add('is-3d');
    frame.replaceChildren(view);

    // the first touch stops the slow turn and closes any open note
    controls.addEventListener('start', () => {
      controls.autoRotate = false; flyBack = null;
      frame.querySelector('.culture-note')?.__close?.();
    });

    const resize = () => {
      const w = view.clientWidth, h = view.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h; camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize); ro.observe(view); resize();

    const v = new THREE.Vector3();
    const toScreen = (p, w, h) => { v.copy(p).project(camera); return [(v.x * 0.5 + 0.5) * w, (-v.y * 0.5 + 0.5) * h, v.z]; };
    const t0 = performance.now();
    let raf = 0;
    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      const t = (now - t0) / 1000;
      tickNeighborhood(n, t, { entrance: !reduce });
      if (flyBack) {
        flyBack.t = Math.min(1, flyBack.t + 0.04);
        const k = 1 - Math.pow(1 - flyBack.t, 3);
        camera.position.lerpVectors(flyBack.from, new THREE.Vector3(...VIEW.pos), k);
        if (flyBack.t >= 1) flyBack = null;
      }
      controls.update();
      renderer.render(scene, camera);
      // move the pins with the model
      const w = view.clientWidth, h = view.clientHeight;
      const ready = reduce || t > 1.3;            // pins appear once the neighbourhood has popped up
      items.forEach((it) => {
        const [x, y, z] = toScreen(it.top, w, h);
        const [bx, by] = toScreen(it.base, w, h);
        it.x = (x / w) * 100; it.y = (y / h) * 100;
        const show = ready && z < 1;
        for (const node of [it.pin, it.tag]) {
          node.style.left = `${x}px`; node.style.top = `${y}px`;
          node.style.visibility = show ? '' : 'hidden';
        }
        // nearer pins sit on top of farther ones
        const depth = Math.round((1 - z) * 1000);
        it.pin.style.zIndex = String(10 + depth); it.tag.style.zIndex = String(9 + depth);
        it.line.setAttribute('x1', x); it.line.setAttribute('y1', y);
        it.line.setAttribute('x2', bx); it.line.setAttribute('y2', by);
        it.line.style.visibility = show ? '' : 'hidden';
        it.z = z;
      });
      // when the model is turned, labels can pile up: keep the nearer one, hide the farther label
      const placed = [];
      [...items].sort((a, b) => a.z - b.z).forEach((it) => {
        if (it.tag.style.visibility === 'hidden') return;
        const r = it.tag.getBoundingClientRect();
        const hit = placed.some((q) => r.left < q.right && r.right > q.left && r.top < q.bottom && r.bottom > q.top);
        it.tag.style.opacity = hit ? '0' : '';
        if (!hit) placed.push(r);
        placed.push(it.pin.getBoundingClientRect());
      });
    };
    raf = requestAnimationFrame(loop);
    if (!seen.size) setTimeout(() => alive && toast(c.spinHint, 'hint'), 1400);

    stop3D = () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      controls.dispose();
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) [].concat(o.material).forEach((m) => { m.map?.dispose(); m.dispose(); });
      });
      renderer.dispose();
      renderer.forceContextLoss?.();
    };
  };

  frame.classList.add('is-loading');
  mount3D().catch((e) => {
    console.warn('P04: 3D view not available, showing the flat map.', e);
    if (alive) mount2D();
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

  ctx.panel({
    body: [el('div', { class: 'chip-row' },
      c.chips.map((v) => chip(v, { iconName: 'book', onClick: () => ctx.openVocab(v.en) })))],
  });
  progress();
  if (seen.size >= NEED) ctx.complete();
}

export function destroy() {
  alive = false;
  if (stop3D) { stop3D(); stop3D = null; }
}
