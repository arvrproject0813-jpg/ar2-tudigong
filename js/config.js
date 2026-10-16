// config.js — page order, asset paths and library URLs in one place.
// To swap placeholder art for the final images, change the paths here only.

export const PAGES = [
  { id: 'p01', file: 'p01-home' },
  { id: 'p02', file: 'p02-scan' },
  { id: 'p03', file: 'p03-howto' },
  { id: 'p04', file: 'p04-intro' },
  { id: 'p05', file: 'p05-street-corner' },
  { id: 'p06', file: 'p06-land-use' },
  { id: 'p07', file: 'p07-objects' },
  { id: 'p08', file: 'p08-community-map' },
  { id: 'p09', file: 'p09-touya-weiya' },
  { id: 'p10', file: 'p10-meinong-bogong' },
  { id: 'p11', file: 'p11-sentence' },
  { id: 'p12', file: 'p12-end' },
];

export const ASSETS = {
  // Current art: in-house semi-realistic illustrations (sources in assets/source-art). Replace freely.
  p01Hero: 'assets/img/p01_home_hero.webp',
  p04Map: 'assets/img/p04_culture_map.webp',
  // AR image target (compiled from assets/targets/tudigong-card.png with the MindAR compiler)
  target: 'assets/targets/tudigong-card.mind',
};

// Narration audio: assets/audio/p01.mp3 … p12.mp3 (optional p01_zh.mp3 / p01_en.mp3 per language)
export const AUDIO_DIR = 'assets/audio/';

// Pinned versions — do not change without telling the team.
export const AR_SCRIPTS = [
  'https://cdn.jsdelivr.net/npm/aframe@1.5.0/dist/aframe-v1.5.0.min.js',
  'https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-aframe.prod.js',
];

// localStorage key for progress
export const STORE_KEY = 'ar2-tudigong';
