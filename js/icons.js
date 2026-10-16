// icons.js — inline SVG icons (no icon font, works offline). 24×24, stroke = currentColor.
const s = (body, extra = '') =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${body}</svg>`;

export const ICONS = {
  back: s('<path d="M15 5l-7 7 7 7"/>'),
  close: s('<path d="M6 6l12 12M18 6L6 18"/>'),
  lang: s('<path d="M3 5h9M7.5 3v2M5 5c0 4 3 7 7 8M10 5c0 4-3 7-7 8"/><path d="M13 21l4-9 4 9M14.5 18h5"/>'),
  pin: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg>`,
  temple: s('<path d="M2 5.5Q4 8.5 7 8.5H17Q20 8.5 22 5.5"/><path d="M4 12h16l-2.5-3.5h-11z" fill="currentColor" fill-opacity=".25"/><path d="M6.5 12v8.5h11V12"/><path d="M10 20.5v-3.5a2 2 0 0 1 4 0v3.5"/>'),
  fields: s('<path d="M3 20c3-6 6-9 9-9s6 3 9 9"/><path d="M12 11V4M12 7c-2-1-3-2.5-3-4M12 7c2-1 3-2.5 3-4M7 20l2-4M17 20l-2-4M12 20v-4"/>'),
  market: s('<path d="M3 9l2-5h14l2 5"/><path d="M3 9c0 1.5 1.3 2.5 3 2.5S9 10.5 9 9c0 1.5 1.3 2.5 3 2.5s3-1 3-2.5c0 1.5 1.3 2.5 3 2.5s3-1 3-2.5"/><path d="M5 12v8h14v-8"/>'),
  corner: s('<path d="M4 20V10h10M4 10V4M14 10v10M20 20H14"/><path d="M8 14h2M8 17h2"/>'),
  home: s('<path d="M4 11l8-6 8 6v9H4z"/><path d="M10 20v-5h4v5"/>'),
  road: s('<path d="M8 3L5 21M16 3l3 18M12 4v3M12 11v3M12 18v2"/>'),
  tree: s('<circle cx="12" cy="9" r="6"/><path d="M12 15v6M9 21h6"/>'),
  school: s('<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3 2 9 2 12 0v-5"/>'),
  street: s('<path d="M3 20V9l4-3 4 3v11M11 20v-8l5-3 5 3v8M3 20h18"/>'),
  bulb: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2zM9 19h6v1.5a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 20.5z"/></svg>`,
  check: s('<circle cx="12" cy="12" r="9.5"/><path d="M7.5 12.5l3 3 6-6.5"/>', 'stroke-width="2.4"'),
  tap: s('<path d="M9 11V5a2 2 0 0 1 4 0v5l4 .8a2 2 0 0 1 1.6 2.3L17.8 18a3 3 0 0 1-3 2.5H11a3 3 0 0 1-2.4-1.2L5.5 15a1.6 1.6 0 0 1 2.4-2.1L9 14"/><path d="M5 5.5A5 5 0 0 1 17 5"/>'),
  hand: s('<path d="M9 11V5a2 2 0 0 1 4 0v5l4 .8a2 2 0 0 1 1.6 2.3L17.8 18a3 3 0 0 1-3 2.5H11a3 3 0 0 1-2.4-1.2L5.5 15a1.6 1.6 0 0 1 2.4-2.1L9 14"/>'),
  map: s('<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/>'),
  grab: s('<rect x="3" y="7" width="10" height="13" rx="2"/><path d="M16 4h3a2 2 0 0 1 2 2v3M21 4l-6 6"/>'),
  slider: s('<path d="M3 12h18"/><circle cx="14" cy="12" r="3.2" fill="currentColor"/><path d="M3 7v2M21 7v2"/>'),
  puzzle: s('<path d="M4 8h4a2 2 0 1 1 4 0h4v4a2 2 0 1 1 0 4v4H4v-4a2 2 0 1 0 0-4z"/>'),
  cards: s('<rect x="3" y="6" width="12" height="15" rx="2"/><path d="M8 3h11a2 2 0 0 1 2 2v13"/>'),
  camera: s('<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>'),
  scan: s('<path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M4 12h16"/>'),
  info: s('<circle cx="12" cy="12" r="9.5"/><path d="M12 11v6M12 7.5v.5"/>'),
  book: s('<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 21V5M8 7h7"/>'),
};

// Icon names used by the How-to tiles (content.js uses Phosphor-style names)
export const TILE_ICON = {
  'hand-tap': 'tap', 'map-trifold': 'map', 'hand-grabbing': 'grab',
  'sliders-horizontal': 'slider', 'puzzle-piece': 'puzzle', 'cards': 'cards',
};

export function icon(name) {
  return ICONS[name] || ICONS.pin;
}
