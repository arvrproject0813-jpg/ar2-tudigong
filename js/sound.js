// sound.js — background music + the wooden "tock" for buttons, generated live with the Web Audio API
// (no audio files to download, no copyright issues).
//
// Music: an original, gentle Taiwanese-countryside tune in the Chinese pentatonic scale (D gong mode).
// Tudigong is the guardian of the land and the fields, so the mood is pastoral and calm, not ceremonial.
// Instruments: plucked zither (like a guzheng, Karplus-Strong string model), bamboo flute (dizi-like),
// a soft wooden clapper (paiban / bangzi) and a low drone. 32 bars, about 1 min 40 s, then it loops.
// Button sound: a short wooden "tock", like a folk-opera clapper (deliberately NOT a temple wooden fish).
//
// To use your own files instead, upload them to assets/audio/:
//   bgm.mp3    → replaces the generated music (looped)
//   click.mp3  → replaces the generated button sound
import { AUDIO_DIR } from './config.js';

const BPM = 76;
const BEAT = 60 / BPM;
const BAR = 4 * BEAT;
const MUSIC_LEVEL = 0.2;          // overall music volume (0–1)
const DUCK_LEVEL = 0.06;          // music volume while narration is playing
const CLICK_LEVEL = 0.55;

/* ---------- the tune ---------- */
// note names → frequency (D gong pentatonic: D E F# A B)
const NOTE = (() => {
  const st = { C: -9, D: -7, E: -5, F: -4, 'F#': -3, G: -2, A: 0, B: 2 };
  const f = (n) => { const m = n.match(/^([A-G]#?)(\d)$/); return 440 * 2 ** ((st[m[1]] + (+m[2] - 4) * 12) / 12); };
  return new Proxy({}, { get: (_, k) => f(k) });
})();
// melody bars: [beat offset, length in beats, note]
const A = [
  [[0, 1, 'A4'], [1, .5, 'B4'], [1.5, .5, 'A4'], [2, 1, 'F#4'], [3, 1, 'E4']],
  [[0, 1.5, 'D4'], [1.5, .5, 'E4'], [2, 2, 'F#4']],
  [[0, 1, 'A4'], [1, 1, 'D5'], [2, .5, 'B4'], [2.5, .5, 'A4'], [3, 1, 'F#4']],
  [[0, 3, 'E4']],
  [[0, .5, 'F#4'], [.5, .5, 'A4'], [1, 1, 'B4'], [2, 1, 'A4'], [3, .5, 'F#4'], [3.5, .5, 'E4']],
  [[0, 1, 'D4'], [1, 1, 'E4'], [2, 1, 'A3'], [3, 1, 'B3']],
  [[0, 1, 'D4'], [1, .5, 'F#4'], [1.5, .5, 'E4'], [2, 1, 'D4'], [3, 1, 'B3']],
  [[0, 4, 'D4']],
];
const B = [
  [[0, 1.5, 'D5'], [1.5, .5, 'E5'], [2, 1, 'D5'], [3, 1, 'B4']],
  [[0, 1, 'A4'], [1, .5, 'B4'], [1.5, .5, 'D5'], [2, 2, 'A4']],
  [[0, 1, 'F#4'], [1, 1, 'A4'], [2, 1, 'B4'], [3, 1, 'D5']],
  [[0, 3, 'E5']],
  [[0, 1, 'D5'], [1, .5, 'B4'], [1.5, .5, 'A4'], [2, 1, 'F#4'], [3, 1, 'A4']],
  [[0, 1.5, 'B4'], [1.5, .5, 'A4'], [2, 1, 'F#4'], [3, 1, 'E4']],
  [[0, 1, 'D4'], [1, .5, 'E4'], [1.5, .5, 'F#4'], [2, 1, 'A4'], [3, 1, 'E4']],
  [[0, 4, 'D4']],
];
// harmony (root + fifth for the zither's low arpeggio), one per bar of a section
const HA = [['D3', 'A3'], ['D3', 'A3'], ['B2', 'F#3'], ['A2', 'E3'], ['D3', 'A3'], ['B2', 'F#3'], ['A2', 'E3'], ['D3', 'A3']];
const HB = [['B2', 'F#3'], ['D3', 'A3'], ['B2', 'F#3'], ['A2', 'E3'], ['D3', 'A3'], ['B2', 'F#3'], ['A2', 'E3'], ['D3', 'A3']];
// four sections: who plays what
const SECTIONS = [
  { mel: A, har: HA, flute: false, perc: false },        // zither alone
  { mel: A, har: HA, flute: true, perc: false },         // flute joins
  { mel: B, har: HB, flute: true, perc: true },          // higher phrase, clapper
  { mel: A, har: HA, flute: false, perc: true, ornament: true },
];
export const LOOP_BARS = SECTIONS.length * 8;

/* ---------- instruments ---------- */
const plucks = new WeakMap();      // ctx -> Map(freq -> AudioBuffer)
function pluckBuffer(ctx, freq, bright = 0.5) {
  if (!plucks.has(ctx)) plucks.set(ctx, new Map());
  const cache = plucks.get(ctx);
  const key = `${freq.toFixed(2)}-${bright}`;
  if (cache.has(key)) return cache.get(key);
  // Karplus-Strong: a burst of noise fed through a short delay line with a soft low-pass = a plucked string
  const sr = ctx.sampleRate, len = Math.floor(sr * 2.6), N = Math.max(2, Math.round(sr / freq));
  const buf = ctx.createBuffer(1, len, sr), d = buf.getChannelData(0);
  const line = new Float32Array(N);
  let seed = Math.round(freq * 1000) % 2147483647 || 1;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
  for (let i = 0; i < N; i++) line[i] = rnd() * (0.6 + 0.4 * Math.sin((i / N) * Math.PI));
  // decay per round trip so every note rings for about the same time (low notes a little longer)
  const t60 = 2.4 - Math.min(1, freq / 1200) * 0.9;
  const decay = Math.pow(0.001, 1 / (freq * t60));
  const wa = 0.5 + bright * 0.3, wb = 1 - wa;     // 'bright' keeps more of the high partials
  for (let i = 0; i < len; i++) {
    const j = i % N, v = line[j];
    d[i] = v;
    line[j] = decay * (v * wa + line[(j + 1) % N] * wb);
  }
  // gentle fade at the end
  for (let i = len - 2000; i < len; i++) d[i] *= (len - i) / 2000;
  cache.set(key, buf);
  return buf;
}

function zither(ctx, out, t, freq, vel = 1, bright = 0.5) {
  const src = ctx.createBufferSource();
  src.buffer = pluckBuffer(ctx, freq, bright);
  const g = ctx.createGain();
  g.gain.value = 0.42 * vel;
  // the guzheng's little pitch "press" right after the pluck
  src.detune.setValueAtTime(18, t); src.detune.exponentialRampToValueAtTime(1, t + 0.12);
  src.connect(g).connect(out);
  src.start(t); src.stop(t + 2.6);
}

function flute(ctx, out, t, freq, dur, vel = 1) {
  const o = ctx.createOscillator(), o2 = ctx.createOscillator();
  o.type = 'sine'; o2.type = 'triangle';
  o.frequency.value = freq; o2.frequency.value = freq * 2;
  // vibrato that comes in after the attack, as a player would
  const lfo = ctx.createOscillator(), lg = ctx.createGain();
  lfo.frequency.value = 5.3; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(freq * 0.006, t + Math.min(0.35, dur * 0.5));
  lfo.connect(lg); lg.connect(o.frequency); lg.connect(o2.frequency);
  const g = ctx.createGain(), g2 = ctx.createGain();
  g2.gain.value = 0.12;
  const a = 0.07, r = Math.min(0.22, dur * 0.3), peak = 0.06 * vel;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(peak, t + a);
  g.gain.setValueAtTime(peak * 0.85, t + Math.max(a, dur - r));
  g.gain.linearRampToValueAtTime(0.0001, t + dur + 0.05);
  // breath noise
  const nb = ctx.createBufferSource(); nb.buffer = noiseBuffer(ctx);
  const nf = ctx.createBiquadFilter(); nf.type = 'bandpass'; nf.frequency.value = freq * 2; nf.Q.value = 2;
  const ng = ctx.createGain(); ng.gain.value = 0.05;
  nb.connect(nf).connect(ng).connect(g);
  o.connect(g); o2.connect(g2).connect(g); g.connect(out);
  [o, o2, lfo].forEach((x) => { x.start(t); x.stop(t + dur + 0.1); });
  nb.start(t); nb.stop(t + dur + 0.1);
}

const noises = new WeakMap();
function noiseBuffer(ctx) {
  if (noises.has(ctx)) return noises.get(ctx);
  const b = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate), d = b.getChannelData(0);
  let s = 12345; for (let i = 0; i < d.length; i++) { s = (s * 16807) % 2147483647; d[i] = (s / 2147483647) * 2 - 1; }
  noises.set(ctx, b); return b;
}

/** Wooden clapper "tock" (also the button sound). */
export function woodTock(ctx, out, t, vel = 1, pitch = 1) {
  const o = ctx.createOscillator(); o.type = 'sine';
  o.frequency.setValueAtTime(1180 * pitch, t); o.frequency.exponentialRampToValueAtTime(760 * pitch, t + 0.03);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.6 * vel, t + 0.002); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
  const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = 2650 * pitch;
  const g2 = ctx.createGain();
  g2.gain.setValueAtTime(0.0001, t); g2.gain.exponentialRampToValueAtTime(0.18 * vel, t + 0.001); g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
  const nb = ctx.createBufferSource(); nb.buffer = noiseBuffer(ctx);
  const nf = ctx.createBiquadFilter(); nf.type = 'bandpass'; nf.frequency.value = 2200 * pitch; nf.Q.value = 3;
  const ng = ctx.createGain();
  ng.gain.setValueAtTime(0.0001, t); ng.gain.exponentialRampToValueAtTime(0.35 * vel, t + 0.001); ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.025);
  o.connect(g).connect(out); o2.connect(g2).connect(out); nb.connect(nf).connect(ng).connect(out);
  o.start(t); o.stop(t + 0.12); o2.start(t); o2.stop(t + 0.05); nb.start(t, Math.random()); nb.stop(t + 0.04);
}

function drone(ctx, out, t, dur) {
  [[NOTE.D2, 0.012], [NOTE.A2, 0.008]].forEach(([f, v]) => {
    const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + 2); g.gain.setValueAtTime(v, t + dur - 2); g.gain.linearRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(out); o.start(t); o.stop(t + dur + 0.05);
  });
}

function reverb(ctx) {
  const c = ctx.createConvolver(), sr = ctx.sampleRate, len = Math.floor(sr * 2.8);
  const b = ctx.createBuffer(2, len, sr);
  for (let ch = 0; ch < 2; ch++) {
    const d = b.getChannelData(ch); let s = 777 + ch;
    for (let i = 0; i < len; i++) { s = (s * 16807) % 2147483647; d[i] = ((s / 2147483647) * 2 - 1) * Math.pow(1 - i / len, 3.2); }
  }
  c.buffer = b; return c;
}

/** Build the mixing chain on a context: returns { input, output }. */
function makeBus(ctx) {
  const input = ctx.createGain(), output = ctx.createGain();
  const wet = ctx.createGain(); wet.gain.value = 0.28;
  const rv = reverb(ctx);
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 4200;
  input.connect(lp); lp.connect(output); lp.connect(rv).connect(wet).connect(output);
  return { input, output };
}

/** Schedule one bar (index within the whole loop) starting at time t. */
export function scheduleBar(ctx, out, bar, t) {
  const sec = SECTIONS[Math.floor(bar / 8) % SECTIONS.length], k = bar % 8;
  // melody on the zither (+ flute in some sections)
  sec.mel[k].forEach(([b, len, n], i) => {
    const f = NOTE[n], tt = t + b * BEAT;
    zither(ctx, out, tt, f, 0.9 + (b === 0 ? 0.15 : 0), 0.35);
    if (sec.ornament && len >= 1 && i % 2 === 0) zither(ctx, out, tt + BEAT * 0.5, f * 2, 0.25, 0.7);   // light harmonic echo
    if (sec.flute) flute(ctx, out, tt, f * (n.endsWith('3') ? 2 : 1), len * BEAT * 0.98, 0.8);
  });
  // low arpeggio: root, fifth, octave, fifth on the eighth notes of beats 1–2 and 3–4
  const [r, fifth] = sec.har[k];
  const arp = [NOTE[r], NOTE[fifth], NOTE[r] * 2, NOTE[fifth]];
  [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5].forEach((b, i) => zither(ctx, out, t + b * BEAT, arp[i % 4], i % 4 === 0 ? 0.36 : 0.24, 0.15));
  // clapper on 1 and 3, a lighter tick on the off-beat of 4
  if (sec.perc) {
    woodTock(ctx, out, t, 0.32, 0.92);
    woodTock(ctx, out, t + 2 * BEAT, 0.22, 0.92);
    woodTock(ctx, out, t + 3.5 * BEAT, 0.12, 1.08);
  }
  if (k === 0) drone(ctx, out, t, 8 * BAR);
}

/** Render the whole loop offline (used to make a preview file). Returns an AudioBuffer. */
export async function renderPreview(bars = LOOP_BARS, sampleRate = 44100) {
  const ctx = new OfflineAudioContext(2, Math.ceil(sampleRate * (bars * BAR + 3)), sampleRate);
  const bus = makeBus(ctx); bus.output.gain.value = 0.9; bus.output.connect(ctx.destination);
  for (let b = 0; b < bars; b++) scheduleBar(ctx, bus.input, b, 0.2 + b * BAR);
  return ctx.startRendering();
}

/* ---------- live playback ---------- */
let ctx = null, bus = null, musicGain = null, sfxGain = null;
let timer = null, nextBarTime = 0, barIndex = 0;
let wanted = false, ducked = false;
let fileMusic = null, clickFile = null;            // optional uploaded files
let filesChecked = null;

function ensureCtx() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  bus = makeBus(ctx);
  musicGain = ctx.createGain(); musicGain.gain.value = 0;
  sfxGain = ctx.createGain(); sfxGain.gain.value = CLICK_LEVEL;
  bus.output.connect(musicGain).connect(ctx.destination);
  sfxGain.connect(ctx.destination);
  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    if (document.hidden) ctx.suspend(); else ctx.resume();
  });
  return ctx;
}

const exists = (url) => fetch(url, { method: 'HEAD', cache: 'no-cache' })
  .then((r) => r.ok && !(r.headers.get('content-type') || '').includes('text/html')).catch(() => false);

function checkFiles() {
  if (!filesChecked) {
    filesChecked = Promise.all([exists(`${AUDIO_DIR}bgm.mp3`), exists(`${AUDIO_DIR}click.mp3`)]).then(async ([bgm, click]) => {
      if (bgm) { fileMusic = new Audio(`${AUDIO_DIR}bgm.mp3`); fileMusic.loop = true; fileMusic.volume = 0; }
      if (click && ensureCtx()) {
        try { clickFile = await ctx.decodeAudioData(await (await fetch(`${AUDIO_DIR}click.mp3`)).arrayBuffer()); } catch (e) { clickFile = null; }
      }
    });
  }
  return filesChecked;
}

function level() { return ducked ? DUCK_LEVEL : MUSIC_LEVEL; }

function tickScheduler() {
  while (nextBarTime < ctx.currentTime + 1.2) {
    scheduleBar(ctx, bus.input, barIndex % LOOP_BARS, nextBarTime);
    nextBarTime += BAR; barIndex++;
  }
}

/** Start (or resume) the music. Must be called from a tap/click the first time (browser autoplay rules). */
export async function startMusic() {
  wanted = true;
  if (!ensureCtx()) return;
  if (ctx.state !== 'running') { try { await ctx.resume(); } catch (e) { /* ignore */ } }
  await checkFiles();
  if (!wanted) return;
  if (fileMusic) {
    fileMusic.play().catch(() => {});
    fadeFile(level() * 2.5);
    return;
  }
  musicGain.gain.cancelScheduledValues(ctx.currentTime);
  musicGain.gain.setTargetAtTime(level(), ctx.currentTime, 0.6);
  if (!timer) {
    nextBarTime = ctx.currentTime + 0.15;
    timer = setInterval(tickScheduler, 120);
    tickScheduler();
  }
}

export function stopMusic() {
  wanted = false;
  if (fileMusic) { fadeFile(0, () => fileMusic.pause()); }
  if (!ctx) return;
  musicGain.gain.cancelScheduledValues(ctx.currentTime);
  musicGain.gain.setTargetAtTime(0, ctx.currentTime, 0.25);
  clearInterval(timer); timer = null;
}

function fadeFile(target, done) {
  const a = fileMusic; if (!a) return;
  const from = a.volume, t0 = performance.now();
  const step = (now) => {
    const k = Math.min(1, (now - t0) / 800);
    a.volume = Math.max(0, Math.min(1, from + (target - from) * k));
    if (k < 1) requestAnimationFrame(step); else done && done();
  };
  requestAnimationFrame(step);
}

/** Lower the music while narration plays. */
export function duckMusic(on) {
  ducked = on;
  if (fileMusic && wanted) fadeFile(level() * 2.5);
  if (ctx && wanted) { musicGain.gain.cancelScheduledValues(ctx.currentTime); musicGain.gain.setTargetAtTime(level(), ctx.currentTime, 0.3); }
}

/** The button sound. */
export function playClick() {
  if (!ensureCtx()) return;
  if (ctx.state !== 'running') ctx.resume().catch(() => {});
  checkFiles();
  const t = ctx.currentTime + 0.005;
  if (clickFile) {
    const s = ctx.createBufferSource(); s.buffer = clickFile; s.connect(sfxGain); s.start(t);
  } else {
    woodTock(ctx, sfxGain, t, 1, 0.97 + Math.random() * 0.06);   // tiny pitch variation so repeated taps sound natural
  }
}

/** Tock on every button press anywhere in the app. */
export function installClickSounds() {
  document.addEventListener('pointerdown', (e) => {
    if (e.button && e.button !== 0) return;
    const b = e.target.closest('button, .chip, [role="button"]');
    if (!b || b.disabled || b.closest('[data-no-click-sound]')) return;
    playClick();
  }, true);
}
