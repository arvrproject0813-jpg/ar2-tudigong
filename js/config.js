// config.js — page order, asset paths and library URLs in one place.
// To swap placeholder art for the final images, change the paths here only.

export const PAGES = [
  { id: 'p01', file: 'p01-home' },
  { id: 'p02', file: 'p02-scan' },
  { id: 'p03', file: 'p03-howto' },
  { id: 'map', file: 'map' },               // the journey map: home of the experience after the opening pages
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
  welcomeBg: 'assets/img/welcome_bg.webp',
  shrine: 'assets/img/sprite_shrine.webp',
  banyan: 'assets/img/sprite_banyan.webp',
  p04Map: 'assets/img/p04_culture_map.webp',
  // AR image target (compiled from assets/targets/tudigong-card.png with the MindAR compiler)
  target: 'assets/targets/tudigong-card.mind',
};

// Narration audio: assets/audio/p01.mp3 … p12.mp3 (optional p01_zh.mp3 / p01_en.mp3 per language)
export const AUDIO_DIR = 'assets/audio/';

// Optional files: set one to true after adding the file, and the app uses it instead of its built-in version.
// (Listing them here means the app never asks the server for a file that is not there.)
export const OPTIONAL_FILES = {
  music: true,               // assets/audio/bgm.mp3: replaces the generated background music
  click: false,              // assets/audio/click.mp3: replaces the generated button sound
  neighborhoodModel: false,  // assets/models/tudigong-neighborhood.glb: replaces the built-in neighbourhood (P02 AR, P04 3D)
};

// The 3D models (assets/models/**/*.glb) are compressed with meshopt (gltf-transform meshopt --level high):
// about half the download, same look. Three.js uses three/addons/libs/meshopt_decoder.module.js; <model-viewer> this file.
export const MESHOPT_DECODER_URL = 'https://cdn.jsdelivr.net/npm/meshoptimizer@0.21.0/meshopt_decoder.js';

// Pinned versions — do not change without telling the team.
export const AR_SCRIPTS = [
  'https://cdn.jsdelivr.net/npm/aframe@1.5.0/dist/aframe-v1.5.0.min.js',
  'https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-aframe.prod.js',
];

// Old localStorage key: progress is no longer saved; app.js only clears this key on start
export const STORE_KEY = 'ar2-tudigong';
