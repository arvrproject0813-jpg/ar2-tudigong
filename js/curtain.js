// curtain.js — the cloud curtain between pages.
// Painted auspicious clouds (祥雲, in the same style as the clouds drifting behind every page) roll in from both
// sides, a round medallion shows where we are going (its icon, a red seal and the stop's name), then the clouds
// part to reveal the new page. About 1.3 s in all; with reduced motion it is a short fade.
import { el, bi } from './ui.js';
import { icon } from './icons.js';
import { playClouds, playStamp } from './sound.js';
import CONTENT from '../content/content.js';

let layer = null;
let shownAt = 0;
let closing = null;
const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const HOLD = 820;            // the medallion stays at least this long after the curtain starts closing (ms)

/* ---------- the cloud edge: a column of puffs with gold outlines and spiral curls ---------- */
// A tiny seeded random, so the clouds look the same every time.
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

// A spiral curl (like the curls painted inside the clouds), as an SVG path.
function curl(cx, cy, size, start, dir) {
  const pts = [];
  const turns = 1.15, n = 26;
  for (let i = 0; i <= n; i++) {
    const t = i / n, a = start + dir * t * turns * Math.PI * 2, r = size * (1 - t * 0.78);
    pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return `M${pts.join('L')}`;
}

/**
 * One cloud bank as SVG markup: the cloud body fills x = 0 … edge, and a column of puffs runs down the edge.
 * w, h = size (px); edge = where the body ends; R = puff size; fill = cloud colour; seed = which clouds.
 */
function cloudBank(w, h, edge, R, fill, seed, sprites) {
  const rand = rng(seed);
  const puffs = [];
  for (let y = -R * 0.6; y < h + R; ) {
    const r = R * (0.72 + rand() * 0.42);
    puffs.push({ x: edge + (rand() - 0.35) * R * 0.5, y: y + r * 0.55, r });
    y += r * (1.2 + rand() * 0.35);
  }
  const shapes = `<rect x="-4" y="-4" width="${(edge + 4).toFixed(1)}" height="${h + 8}"/>` +
    puffs.map((p) => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${p.r.toFixed(1)}"/>`).join('');
  const curls = puffs.map((p, i) => {
    const s = p.r * (0.42 + rand() * 0.1);
    // the curl sits toward the outer side of the puff and winds back into the cloud
    return curl(p.x + p.r * 0.12, p.y + (i % 2 ? -1 : 1) * p.r * 0.08, s, Math.PI * (0.15 + rand() * 0.3), i % 2 ? 1 : -1);
  }).join(' ');
  const gid = `ccg${seed}`;
  return `<svg class="cc-svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true">
    <defs><linearGradient id="${gid}" gradientUnits="userSpaceOnUse" x1="0" x2="${w}" y1="0" y2="0"><stop offset="0" stop-color="${fill[0]}"/><stop offset="1" stop-color="${fill[1]}"/></linearGradient></defs>
    <g fill="url(#${gid})" stroke="#C9952E" stroke-width="5" stroke-linejoin="round">${shapes}</g>
    <g fill="url(#${gid})">${shapes}</g>
    <path d="${curls}" fill="none" stroke="#C9952E" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
    ${sprites || ''}
  </svg>`;
}

/* A small painted cloud with a trailing tail (like the clouds drifting behind every page), as SVG markup. */
function smallCloud(x, y, s, fill, rand) {
  const c = [[0, 0, 0.62], [0.62, -0.32, 0.6], [1.22, -0.05, 0.5], [0.6, 0.26, 0.46], [1.55, 0.3, 0.34]];
  const circles = c.map(([dx, dy, r]) => `<circle cx="${(x + dx * s).toFixed(1)}" cy="${(y + dy * s).toFixed(1)}" r="${(r * s).toFixed(1)}"/>`).join('');
  const L = s * (2.6 + rand() * 0.8), tx = x + 1.5 * s, ty = y + 0.55 * s;
  const tail = `<path d="M${tx},${ty} Q${tx + L * 0.55},${ty + 0.12 * s} ${tx + L},${ty - 0.42 * s} Q${tx + L * 0.5},${ty - 0.02 * s} ${tx},${ty - 0.22 * s}Z"/>`;
  const curls = [curl(x - 0.05 * s, y + 0.05 * s, 0.32 * s, Math.PI * 0.2, 1), curl(x + 0.66 * s, y - 0.3 * s, 0.3 * s, Math.PI * 0.9, -1), curl(x + 1.25 * s, y + 0.02 * s, 0.24 * s, Math.PI * 0.3, 1)].join(' ');
  return `<g class="cc-small"><g fill="${fill}" stroke="#C9952E" stroke-width="4" stroke-linejoin="round">${circles}${tail}</g><g fill="${fill}">${circles}${tail}</g>
    <path d="${curls}" fill="none" stroke="#C9952E" stroke-width="2.2" stroke-linecap="round"/></g>`;
}

// the three banks on each side, back to front: pale jade, peach and cream like the painted clouds' colours.
// reach = how far past the middle of the screen the puffs reach (in puff sizes); the front banks of the two sides
// interleave in the middle and the back banks show through the gaps.
const BANKS = [
  { fill: ['#CFE6E0', '#E4F1ED'], size: 1.15, reach: 2.0 },
  { fill: ['#F3D9C8', '#FAE8DC'], size: 1.0, reach: 0.4 },
  { fill: ['#F7EAD3', '#FFFAF0'], size: 0.9, reach: -0.3 },
];

function buildLayer(info) {
  const W = window.innerWidth, H = window.innerHeight;
  const R0 = Math.max(46, Math.min(96, H * 0.11));
  const banks = BANKS.map((b, li) => el('div', { class: `cc-layer b${li}` }, ['l', 'r'].map((side, si) => {
    const R = R0 * b.size;
    const edge = W / 2 + (b.reach - 1.0) * R;             // body ends here; puffs reach about one puff further
    const w = Math.ceil(edge + R * 1.3);
    let sprites = '';
    if (li === 2) {                                      // two small painted clouds drift on each front bank
      const rand = rng(31 + si * 17), s = R0 * 0.55;
      sprites = [[0.16, 0.2], [0.42, 0.74]].map(([fx, fy], k) => {
        const x = Math.max(s, edge * fx + (k ? -s : 0)), y = H * fy;
        return x + s * 4.4 < edge - R * 0.4 ? smallCloud(x, y, s, k ? '#FBE9DC' : '#E6F2EE', rand) : '';
      }).join('');
    }
    const d = el('div', { class: `cc-bank ${side}`, style: { width: `${w}px` } });
    d.innerHTML = cloudBank(w, H, edge, R, b.fill, 7 + li * 13 + si * 101, sprites);
    return d;
  })));
  const sealText = info.seal || '街';
  const J = CONTENT.journey;
  const kicker = info.num
    ? { en: `Stop ${info.num}${info.kicker ? ` · ${info.kicker.en}` : ''}`, zh: `第 ${info.num} 站${info.kicker ? ` · ${info.kicker.zh}` : ''}` }
    : info.kicker;
  const medal = el('div', { class: 'cc-medal' },
    el('div', { class: 'cc-disc' },
      el('span', { class: 'cc-beads', 'aria-hidden': 'true' }),
      el('span', { class: 'cc-icon', html: icon(info.icon || 'temple') })),
    el('span', { class: 'cc-seal', lang: 'zh-Hant', 'aria-hidden': 'true' }, sealText),
    kicker ? el('div', { class: 'cc-kicker' }, bi(kicker, { layout: 'inline' })) : null,
    el('div', { class: 'cc-title' }, bi(info.title || J.title, { layout: 'stack' })));
  return el('div', { class: `curtain${reduce() ? ' is-reduced' : ''}`, role: 'presentation' }, banks, medal);
}

/** Close the clouds over the screen, showing where we are going. Resolves once the screen is covered. */
export function curtainClose(info = {}) {
  layer?.remove();
  layer = buildLayer(info);
  document.body.append(layer);
  shownAt = performance.now();
  void layer.offsetWidth;                       // start the transition from the open position
  layer.classList.add('is-closed');
  if (!reduce()) {
    playClouds();
    setTimeout(() => { if (layer?.classList.contains('is-closed')) playStamp(); }, 560);
  }
  const wait = reduce() ? 180 : 560;
  closing = new Promise((res) => setTimeout(res, wait));
  return closing;
}

/** Part the clouds (after the new page is on screen) and remove the curtain. */
export async function curtainOpen() {
  const my = layer;
  if (!my || window.__curtainHold) return;          // (__curtainHold: keeps it closed, for screenshots)
  const left = HOLD - (performance.now() - shownAt);
  if (left > 0) await new Promise((r) => setTimeout(r, reduce() ? Math.min(left, 360) : left));
  if (layer !== my) return;
  my.classList.add('is-opening');
  my.classList.remove('is-closed');
  setTimeout(() => { my.remove(); if (layer === my) layer = null; }, reduce() ? 260 : 760);
}

/** Is a curtain on screen right now? */
export const curtainBusy = () => !!layer && !layer.classList.contains('is-opening');
