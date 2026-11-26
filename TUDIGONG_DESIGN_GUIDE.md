# AR-2 Tudigong's Neighborhood — Team Build Guide (AI-ready)

土地公的街坊：地方守護與社區生活 · Plain web (HTML/CSS/JS + MindAR) · Landscape · English + Traditional Chinese · v1, 2026-10-16

**How to use this file:** give the whole file to your coding AI, or paste sections in this order: Project Context → tokens.css → Component Spec → Layout → one page prompt. For images, use the Image AI section.

## 1. Project Context (paste first)

```text
=== PROJECT CONTEXT — paste this at the start of EVERY coding-AI chat ===

You are helping a 3-person student team build "AR-2 Tudigong's Neighborhood: Local Guardian and Community Life" (土地公的街坊：地方守護與社區生活), a bilingual (English + Traditional Chinese) AR learning web app for junior- and senior-high school students in Kaohsiung, Taiwan. English level B1–B2. One session lasts 5–10 minutes and is self-guided.
Core inquiry question: "Why do we often find Tudigong near street corners, fields, markets, and settlements in Taiwan?"

TECH (do not change without asking me):
- Plain HTML + CSS + vanilla JavaScript ES modules. No React, no TypeScript, no build step, no npm.
- AR: MindAR image tracking with A-Frame. Exactly ONE image target: assets/targets/tudigong-card.mind.
    <script src="https://cdn.jsdelivr.net/npm/aframe@1.5.0/dist/aframe-v1.5.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-aframe.prod.js"></script>
  (Both versions confirmed on npm. Never change them without telling the team.)
- Served over HTTPS (camera needs it). Hosting: GitHub Pages or Netlify. Local testing: a local HTTPS server or the hosted URL on a phone.
- Landscape first (laptops, tablets, phones held sideways). Since late Nov 2026 phones held upright also get their own portrait layout (css/portrait.css, everything inside @media (orientation: portrait), so the landscape view never changes); the old "Please rotate your device" overlay is no longer shown. Do not depend on screen.orientation.lock().
- Touch input with Pointer Events (pointerdown / pointermove / pointerup + setPointerCapture). Never the HTML5 Drag-and-Drop API (it fails on touch screens). Every drag task also supports tap-card-then-tap-target.
- All visible text comes from content/content.js. Never hard-code UI strings in HTML or page modules.
- Use only CSS variables from css/tokens.css. Never invent new colors, fonts, sizes or radii.
- Icons: inline SVG from js/icons.js (icon(name)). No icon fonts.
- The shell already exists in the repo (js/app.js, js/ui.js, js/drag.js, js/ar.js, js/icons.js, css/*.css). Build pages against it and use js/pages/p04-intro.js as the reference page.
- No backend, no login, no GPS, no analytics. Only CDN scripts + Google Fonts online.

FILE STRUCTURE:
index.html
css/tokens.css      css/base.css      css/components.css
js/app.js           (page router, progress state, top bar, panel)
js/ui.js            (bilingual text + shared component helpers)
js/drag.js          (shared pointer drag + tap-to-place helper)
js/ar.js            (start/stop MindAR, events)
js/pages/p01-home.js … js/pages/p12-end.js   (each exports render(stageEl, panelEl, ctx) and destroy())
content/content.js  (export default CONTENT)
assets/img/ assets/icons/ assets/targets/ assets/audio/

PAGE MODULE CONTRACT:
- render(stageEl, panelEl, ctx): build the page. ctx gives { t(key), bi(key), go(id), next(), complete(pageId), state, toast(key, type), openVocab(term) }.
- destroy(): remove listeners, stop timers, stop AR if this page started it.
- The panel's primary "Next 下一步" button stays disabled until the page calls ctx.complete(pageId).

LAYOUT (landscape):
- Top bar (60px lacquered teal band + 10px gold meander strip; 48px when height < 500px): Back icon button | progress dots (12) | Language icon button.
- Under it: STAGE on the left (flex:1) for AR / art / map / interaction; PANEL on the right (width: var(--panel-w)) with eyebrow, title EN then ZH, scrollable narration, task checklist, and the primary button pinned to the bottom.
- Stage art is 3:2. Maps with pins sit in a wrapper with aspect-ratio:3/2 and object-fit:contain so pin % positions stay correct.
- Compact type scale when height < 500px (already in tokens.css). Touch targets ≥ 44×44px. Safe-area side padding.
- The panel already shows a narration button under the title (js/narration.js, files assets/audio/pXX.mp3) and the top bar has a full-screen toggle that hides the panel; a floating dock then shows narration, Show panel and Next. Keep the top-right corner of the stage free for that dock.
- Stage background is the cloud mural (var(--img-mural)); put a .stage-paper veil behind dense content.

BILINGUAL PATTERN:
- English is the main line (learning target). Traditional Chinese (Taiwan) is the support line directly below, smaller, color --color-text-2. Never Simplified Chinese.
- Primary buttons: two lines, EN on top (bold), ZH below.
- Chips and small labels: one line "English 中文", Chinese part in --color-text-2.
- Language button cycles Bilingual 雙語 → English → 中文 (state.lang = 'bi' | 'en' | 'zh'). Default 'bi'.

CULTURAL SAFETY RULES (non-negotiable):
- This is cultural learning, not religious practice. Never simulate worship, praying, bowing, incense lighting, divination (moon blocks), arranging offerings, or asking for blessings, luck or wealth. Do not use the words pray, bless, blessing, luck, fortune, wish in UI text.
- The Tudigong deity image is never a character, guide, NPC or task-giver, never a close-up, never tappable. At most a tiny, distant background detail.
- Interactive objects allowed: small shrine/temple structure, offering table (observe only), stone lions, old tree, community-map nodes, land-use layers, vocabulary cards.
- Never interactive: incense burner, moon blocks, temple plaque, deity image.
- No glowing rays, halos, smoke, fireworks, black-and-gold or red-and-gold festival styling.
- Maps are schematic and conceptual. Show "Conceptual map, not a historical record 示意地圖，非歷史實測" on P06 and P08. Never claim real temple locations.
- Feedback is gentle: correct = green check + short culture note; wrong = small shake + gold hint toast. No red X, no "Wrong!", no scores or penalties.

STATE (js/app.js):
state = { lang:'bi', page:'p01', done:{}, p08Route:[], p11Sentences:[], badges:[], arAvailable:false }
Keep state in memory only (no localStorage): moving between pages keeps progress, a reload starts fresh from P01. "Experience Again" clears it.

HOW TO ANSWER ME:
- Return complete files, not fragments, with the file path as a heading above each file.
- Stay consistent with this context and the tokens/components I paste. If something is unclear, ask before guessing.
- End with a short list: what you assumed, and what I should test on a real phone.
```

## 2. css/tokens.css

```css
/* tokens.css — AR-2 Tudigong's Neighborhood · v2 "Temple craft"
   The ONLY place colors, fonts, sizes, radii, ornaments and motion are defined.
   Components use the semantic --color-* roles, never raw hex.
   Look: glazed-teal lacquer + vermilion + gold trim on warm paper, like a temple museum exhibit.
   Gold is for trim, frames, ornaments and achievements only: never large black-and-gold areas, never text below 18px bold. */
/* The web fonts are linked in index.html (not @import-ed here) so the browser starts downloading them straight away:
   Alegreya, Alegreya Sans, Nunito, Noto Serif (Latin); Noto Serif TC 400–900 and Noto Sans TC 400–700 (Chinese, variable fonts:
   one file per character slice serves every weight); Ma Shan Zheng only for the three characters 土地公.
   If you add a family or a weight, add it to that link. */

:root{
  /* ---------- Raw palette ---------- */
  /* Glazed teal (temple roof glaze, lacquer): brand, buttons, top bar */
  --teal-50:#E6F2F1; --teal-100:#CDE8E5; --teal-300:#7FBDB8; --teal-500:#2F8C88; --teal-600:#1F6B66; --teal-800:#123F3C;
  /* Plant green: fields, trees, success */
  --green-100:#DCEBCB; --green-300:#A9C98C; --green-500:#6E9F4E; --green-700:#3F6A2B;
  /* Warm paper */
  --beige-50:#FFFBF3; --beige-100:#F6EEDF; --beige-200:#EADCC2; --beige-300:#D9CBB2;
  /* Wood: text, carved frames */
  --wood-400:#9A7A5E; --wood-600:#6B4A32; --wood-900:#3A2A1E;
  /* Temple gold: trim, ornaments, medallions, achievements */
  --gold-100:#F5E3B3; --gold-300:#F0CF7A; --gold-500:#C9952E; --gold-700:#8A6416;
  /* Vermilion (temple pillars, seals, lanterns) */
  --red-100:#F4D9D0; --red-500:#B23A27; --red-700:#7E2418;
  /* Brick (temple node) — kept as aliases */
  --brick-100:var(--red-100); --brick-500:var(--red-500); --brick-700:var(--red-700);

  /* ---------- Gradients & textures ---------- */
  --grad-gold: linear-gradient(180deg, #F0CF7A 0%, #C9952E 55%, #8A6416 100%);
  --grad-gold-h: linear-gradient(90deg, #8A6416 0%, #F0CF7A 30%, #C9952E 60%, #8A6416 100%);
  --grad-lacquer: linear-gradient(180deg, #2A7D77 0%, #1F6B66 45%, #123F3C 100%);
  --grad-vermilion: linear-gradient(180deg, #D2593F 0%, #B23A27 55%, #7E2418 100%);
  --grad-wood: linear-gradient(135deg, #9A7A5E 0%, #6B4A32 45%, #3A2A1E 100%);
  --tex-paper: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .36 0 0 0 0 .26 0 0 0 0 .17 0 0 0 .09 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  /* 回紋 meander strip (gold), tile horizontally */
  --tex-meander: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='12'%3E%3Cpath d='M1 11V1h10v8H5V5h3' fill='none' stroke='%23E2B655' stroke-width='1.4'/%3E%3Cpath d='M13 11V1h10v8h-6V5h3' fill='none' stroke='%23E2B655' stroke-width='1.4'/%3E%3C/svg%3E");
  /* 祥雲 cloud scroll ornament (gold outline) */
  --orn-cloud: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='-4 -6 74 46'%3E%3Cpath d='M0 20C0 8 12 2 20 8c2-12 20-12 22 0 8-6 20 0 18 12 10 2 10 16-2 16H6C-6 36-8 22 0 20Zm18 2a6 6 0 1 1 10 0m6-4a7 7 0 1 1 12 2' fill='none' stroke='%23C9952E' stroke-width='2.4' stroke-linecap='round'/%3E%3C/svg%3E");

  /* ---------- Semantic roles ---------- */
  --color-bg:var(--beige-100);
  --color-surface:var(--beige-50);
  --color-surface-2:var(--beige-200);
  --color-line:var(--beige-300);
  --color-trim:var(--gold-500);           /* gold hairlines and frames */
  --color-text:var(--wood-900);
  --color-text-2:var(--wood-600);
  --color-text-muted:var(--wood-400);     /* >=18px only */
  --color-heading:var(--teal-800);
  --color-eyebrow:var(--gold-700);
  --color-primary:var(--teal-600);
  --color-primary-hover:var(--teal-800);
  --color-on-primary:var(--beige-50);
  --color-on-lacquer:var(--beige-50);
  --color-success-bg:var(--green-100); --color-success:var(--green-700);
  --color-hint-bg:var(--gold-100);     --color-hint-icon:var(--gold-500);
  --color-highlight:var(--gold-500);
  --color-temple:var(--red-500);
  --color-temple-text:var(--red-700);
  --color-seal:var(--red-500);
  --color-focus:var(--gold-500);
  --color-scrim:rgba(18,63,60,.55);       /* teal-800 @ 55% — never pure black */

  /* ---------- Type ---------- */
  --font-ui:'Nunito','Noto Sans TC','PingFang TC','Microsoft JhengHei',system-ui,sans-serif;
  --font-zh:'Noto Sans TC','PingFang TC','Microsoft JhengHei',sans-serif;
  --font-display:'Noto Serif','Noto Serif TC','Songti TC',Georgia,serif;   /* titles, culture-note heads */
  --font-display-zh:'Noto Serif TC','Songti TC','PMingLiU',serif;
  /* Regular = tablets (height >= 500px). EN line / ZH support line */
  --fs-display:40px; --fs-zh-display:27px;
  --fs-h1:28px;      --fs-zh-h1:19px;
  --fs-h2:20px;      --fs-zh-h2:15px;
  --fs-body:18px;    --fs-zh-body:16px;
  --fs-label:17px;   --fs-zh-label:13px;
  --fs-small:14px;   --fs-zh-small:12px;
  --lh-en:1.4; --lh-zh:1.6;
  --fw-en-heading:800; --fw-en-label:700; --fw-en-body:500;
  --fw-zh-heading:700; --fw-zh-body:400;

  /* ---------- Space, shape, depth ---------- */
  --space-1:4px; --space-2:8px; --space-3:12px; --space-4:16px; --space-5:24px; --space-6:32px; --space-7:48px;
  --radius-sm:6px; --radius-md:12px; --radius-lg:16px; --radius-pill:999px;
  --border:2px solid var(--color-line);
  --border-trim:1.5px solid var(--color-trim);
  --shadow-card:0 1px 0 rgba(255,255,255,.7) inset, 0 2px 0 var(--beige-300), 0 8px 18px rgba(58,42,30,.14);
  --shadow-lift:0 14px 30px rgba(58,42,30,.28);
  --shadow-medallion:0 3px 0 rgba(58,42,30,.25), 0 6px 14px rgba(58,42,30,.28);

  /* ---------- Layout ---------- */
  --topbar-h:60px;
  --panel-w:clamp(290px, 34vw, 410px);
  --tap-min:44px;

  /* ---------- Motion ---------- */
  --ease:cubic-bezier(.2,.8,.2,1);
  --dur-fast:150ms; --dur:250ms; --dur-slow:400ms;

  /* ---------- Layers ---------- */
  --z-stage:1; --z-panel:2; --z-popover:10; --z-toast:20; --z-modal:30; --z-rotate:100;
}

/* Compact = phones in landscape */
@media (max-height:500px){
  :root{
    --fs-display:28px; --fs-zh-display:19px;
    --fs-h1:20px;      --fs-zh-h1:15px;
    --fs-h2:17px;      --fs-zh-h2:13px;
    --fs-body:15px;    --fs-zh-body:14px;
    --fs-label:15px;   --fs-zh-label:12px;
    --fs-small:12px;   --fs-zh-small:12px;
    --topbar-h:48px;
  }
}
@media (prefers-reduced-motion:reduce){
  :root{ --dur-fast:0ms; --dur:0ms; --dur-slow:0ms; }
}
```

## 3. Component Spec

```text
COMPONENT SPEC (use exactly these; all colors via tokens.css)
v2 "TEMPLE CRAFT" LOOK — applies to everything below:
- Paper surfaces use var(--tex-paper) over beige; frames are gold hairlines (inset box-shadow 1–1.5px var(--gold-500)), often doubled (gold line, 4px paper gap, faint gold line).
- Titles: var(--font-display) (Noto Serif) in --color-heading; Chinese title line in var(--font-display-zh) (Noto Serif TC) colored --red-700.
- Top bar: var(--grad-lacquer) with a 10px meander strip (var(--tex-meander) on --red-700) under it. Progress dots are small gold diamonds.
- Primary button: var(--grad-lacquer) + inner gold frame + soft top highlight. Secondary: paper with a gold hairline.
- Map pins are gold-ringed medallions (teal, or vermilion for the temple). Info boxes carry a red seal stamp (問). Maps sit in a carved wood frame with a gold fillet.
- Gold is trim, ornament and achievement only. Never large gold or black-and-gold areas, never gold body text.

1. Primary button (.btn-primary)
   - Fill --color-primary, text --color-on-primary, radius --radius-md, min-height 56px (52px compact), padding 10px 24px.
   - Two lines, centered: EN (--fs-label, 700) then ZH (--fs-zh-label, 500, 85% opacity).
   - Pressed: translateY(1px), fill --color-primary-hover. Disabled: fill --beige-300, text --wood-400, no shadow.
   - One primary button per screen, pinned to the bottom of the panel.
2. Secondary button (.btn-secondary)
   - Fill --color-surface, 2px border --teal-600, text --teal-800, same size rules as primary.
3. Icon button (.icon-btn)
   - 44x44 circle, fill --color-surface, --border, icon 22px --wood-600. Used for Back, Language, Audio, Close.
4. Chip (.chip)
   - Pill, height 32px (min tap 44 via padding/hit area), fill --color-surface-2, text EN 600 + ZH in --color-text-2 on the same line.
   - Selected: fill --teal-50, border 2px --teal-600.
5. Node card (.node-card) — draggable everyday-place card
   - 120x88px (104x76 compact), fill --color-surface, --border, radius --radius-md, --shadow-card.
   - Top: 36px icon circle tinted (--teal-50, or --brick-100 for temple). Below: EN label 700, ZH label --color-text-2.
   - .is-dragging: --shadow-lift, scale 1.05, rotate 2deg, opacity 1. Original slot shows dashed outline.
   - .is-placed: fill --color-success-bg, border --green-500, small check badge top-right.
   - .is-hint: shake 300ms (translateX ±6px x3), then return to tray. Show hint toast. Never red, never an X.
6. Drop zone (.drop-zone)
   - Dashed 2px --teal-300, radius --radius-md, fill rgba(255,251,243,.6), faint icon 40% opacity.
   - .is-over: solid border --teal-600, fill --teal-50. .is-filled: fill --color-success-bg, border --green-500.
7. Map pin (.map-pin)
   - 40px circle (hit area 48px), fill --teal-500, 3px --beige-50 ring, icon --beige-50, --shadow-card. Label tag below on tap.
   - .is-temple: fill --color-temple. .is-done: extra 3px --color-highlight outer ring. .is-empty: dashed --wood-400 ring, no fill.
8. Culture note (.culture-note) — popover after tapping a pin/object
   - Max-width 300px, fill --color-surface, radius --radius-lg, --shadow-lift, 8px tail pointing to the pin.
   - Title EN (h2) + ZH, then 1–2 sentences EN + ZH. Close icon top-right. Max 40 English words.
9. Vocabulary card (.vocab-card)
   - Front: term EN (h2 800), ZH below, level chip (B1 / B2 / C1 / Culture-specific) in --gold-100 with --wood-900 text.
   - Back (tap to flip, 300ms Y-rotation): definition + example sentence. Speaker icon optional.
10. Hint toast (.toast)
   - Top-center of the STAGE, fill --color-hint-bg, lightbulb icon --color-hint-icon, text --color-text EN + ZH. Auto-hide 3.5s.
   - Success toast: fill --color-success-bg, check icon --color-success.
11. Timeline slider (.timeline)
   - Track 8px --beige-300, filled part --color-highlight, thumb 44px circle --color-surface with 3px --teal-600 ring.
   - End labels: "Past 過去" left, "Present 現在" right, --fs-label 700.
12. Progress dots (.progress-dots) in top bar
   - 12 dots 8px. Done --teal-300, current 20x8 pill --teal-600, upcoming --beige-300.
13. Task checklist (.checklist) in panel
   - Rows: 22px circle + EN label + ZH. Done: circle --green-500 with check, text stays readable (no strike-through).
14. Badge (.badge)
   - Map-pin shape (teardrop) 64px, fill --teal-600, 3px --color-highlight ring, icon --beige-50 inside, label EN/ZH below.
   - Locked: outline only, --beige-300. NOT a charm/amulet/talisman shape, no red pouch, no Chinese seal.
15. Sentence slot (.sentence-slot)
   - Inline blank 120px min, dashed 2px bottom border --teal-600; filled = chip style --teal-50.
16. Panel (.panel)
   - Right side, width --panel-w, fill --color-surface, left border --border.
   - Order top→bottom: eyebrow (P05 · Scene 1, --fs-small 700 --teal-600 uppercase letter-spacing .06em),
     title EN (--fs-h1 800 --color-heading) + ZH (--fs-zh-h1 700 --color-text-2), narration (scrollable, --fs-body),
     checklist, primary button.
17. Top bar (.topbar)
   - Height --topbar-h, fill --color-bg, bottom --border. Left: Back icon button. Middle: progress dots. Right: Language icon button.
18. Rotate overlay (#rotate-overlay)
   - Full screen --color-bg, phone-rotate icon 64px --teal-600, "Please rotate your device 請將裝置橫放". Shown via @media (orientation:portrait).
   - (Late Nov 2026: no longer shown; portrait now has its own layout, see 4. Layout.)

ICONS: Phosphor Icons, duotone weight, color --wood-600 (on light) or --beige-50 (on teal). 22–28px.
  <link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/duotone/style.css">  → <i class="ph-duotone ph-hand-tap"></i>
  Custom SVG icons (draw once, same 2px stroke): small shrine, stone lion, offering table, banyan tree, market stall.

MOTION: 150–250ms ease (--ease). Correct drop: snap + scale 1.05→1. Completion: badge scales in + 6 small gold dots burst (no rays, no glow).
  Pulse for "tap me" pins: scale 1→1.08, 1.6s, max 3 loops. Everything static under prefers-reduced-motion.
```

## 4. Layout

> Redesigned (Nov 2026): the side panel was in the way and pages felt crowded, so the frame is now a top bar, a full-width stage and a slim bar underneath with a slide-up sheet. Scenes become scrolling story pages, and a journey map is the home after P03. The README describes the details.

```text
LAYOUT (landscape only)
┌───────────────────────────────────────────────────────────────┐
│ TOP BAR  土地公 [Map] (6) Objects and landscape   (1 Learn)(2 Do)(3 Badge)  🔊 ♫ 文A │  60px (48px phone)
├───────────────────────────────────────────────────────────────┤
│ STAGE (full width) — a story page scrolls here:               │
│   Hero   seal 場景三 · title · one sentence · picture          │
│          "In this scene you will" 1 Learn 2 Do 3 Badge [Start] │
│   Learn  one idea per card, cards stick and stack on scroll    │
│   Do     the activity on a board as tall as the screen         │
│   Badge  result (locked until done) · badge · takeaway         │
│          [Back to the map] [Next stop: …]                      │
├───────────────────────────────────────────────────────────────┤
│ BAR  [📖 Story and words 故事與詞彙  ✓1/2  ˄]     [Next: <stop>] │  64px (52px phone)
└───────────────────────────────────────────────────────────────┘
  The sheet (title, narration + Listen, word chips, checklist) slides up over the stage from the bar.

JOURNEY MAP (#map, after P03): a winding trail of 11 numbered round stops in three parts
  一 Get ready (P02, P03) · 二 Explore the neighborhood (P04–P10) · 三 Share what you learned (P11, P12).
  Every stop is open. Next stop = teal + "Start here 從這裡開始"; finished = gold + red stamp (集章).
  Tap a stop → a card with what it is about + Go. Floating Continue = first unfinished stop.

PAGE CHANGE: cloud curtain — painted 祥雲 roll in from both sides, a medallion shows the stop's icon,
  red seal, "Stop N · Scene N" and title, then the clouds part (≈1.3 s; Reduce Motion = short fade).

- Stage art is authored at 3:2. Hero art (P01) uses object-fit: cover.
  Maps with pins use object-fit: contain inside a wrapper with aspect-ratio: 3/2, so pin % coordinates stay correct.
- Phone landscape ≈ 844×390 (compact type). Tablet landscape ≈ 1180×820 (regular type). Laptop ≈ 1536×722.
- Side padding: max(16px, env(safe-area-inset-left/right)) for the notch.

PHONE UPRIGHT (portrait, css/portrait.css, loaded last; landscape untouched)
┌──────────────────────────┐
│ 土地公 (7) My neighborhood │  52px: logo · stop number + title (2 lines) · 🔊 ♫ 文A
│          map  🔊 ♫ 文A    │  (story pages: step chips, numbers only + the current step's name)
├──────────────────────────┤
│ STAGE: one column that    │
│ scrolls — map first, then │
│ the cards / activity      │
│ under it                  │
├──────────────────────────┤
│ [extra actions row]       │  only when a page has them (Scan Again, Experience Again…)
│ [Map] [📖 Story… ✓1/2] [Next: …] │  60px
└──────────────────────────┘
- The Map button moves from the top bar to the bottom bar (thumb reach).
- Culture notes dock at the bottom of the screen (except next to pins on the big P04 3D view).
- The app is exactly the visible screen (100dvh). Tested at 390×844, 360×640, 768×1024.

SHORT LAPTOP SCREENS (e.g. 1920×1080 at 150 % scaling → about 1280×560 in the browser; the stage is ~425 px tall)
- A map never shrinks to fit a column: on a wide stage it takes the full height and its controls stand beside it
  (P06 chips + timeline, P08 place cards in 2 columns or the route, P10 the three culture cards).
- A page that is taller than the screen scrolls; a small "More below 往下還有" button in the bottom-right corner says so.
- P11 is three numbered steps (choose a sentence → fill in the blanks → listen and say it); only the current step is open.
```

## 5. Page prompts

### P00 — Setup: project skeleton, tokens, components, router  _(owner: Person B (with A's tokens))_

```text
Using the PROJECT CONTEXT above, create the project skeleton. I am also pasting tokens.css, the COMPONENT SPEC and the LAYOUT spec — follow them exactly.

Create these files in full:
1. index.html — loads css/tokens.css, css/base.css, css/components.css, the Phosphor duotone stylesheet, A-Frame + MindAR scripts, then js/app.js as type="module". Body contains: header.topbar, main.layout > section#stage + aside#panel, div#toast-layer, div#modal-layer, div#rotate-overlay.
2. css/tokens.css — exactly as pasted. Do not edit.
3. css/base.css — reset; html,body height:100%; body background var(--color-bg), font var(--font-ui), color var(--color-text); .layout grid (stage 1fr | panel var(--panel-w)) under the top bar filling the rest of the screen with no page scroll; safe-area side padding; #rotate-overlay shown only in @media (orientation:portrait); prefers-reduced-motion.
4. css/components.css — every component in the COMPONENT SPEC (.btn-primary, .btn-secondary, .icon-btn, .chip, .node-card + states, .drop-zone + states, .map-pin + states, .culture-note, .vocab-card, .toast, .timeline, .progress-dots, .checklist, .badge, .sentence-slot, .panel, .topbar).
5. js/app.js — PAGES = ['p01',…,'p12'], dynamic import of js/pages/pXX-*.js, go(id) / next() / back(), renders the top bar (back hidden on P01, progress dots, language button cycling bi → en → zh and re-rendering the page), renders the panel shell (eyebrow, title, narration, checklist, primary button disabled until ctx.complete). State kept in memory only; a reload starts fresh.
6. js/ui.js — bi(textObj, {tag, size}) returns an element with the EN line and ZH line according to state.lang; button(textObj, {variant, onClick}); toast(textObj, type); notePopover(anchorEl, titleObj, bodyObj); openVocab(term) shows a .vocab-card modal from CONTENT.vocab.
7. js/drag.js — makeDraggable(cardEl, {targets, accept(card, target) → true/false, onCorrect, onWrong}). Pointer events, setPointerCapture, a floating clone follows the finger, target found with document.elementFromPoint, .is-over highlight, snap animation 200ms, wrong → card returns to tray with .is-hint. Also tap-card-then-tap-target as an alternative.
8. js/pages/p01-home.js … p12-end.js — stubs that render the page title from CONTENT and call ctx.complete immediately (so navigation can be tested).
9. content/content.js — I will paste the real file; create a minimal placeholder export for now.

Acceptance: runs from a static HTTPS server; landscape shows top bar + stage + panel; portrait shows the rotate overlay; I can click Next through P01→P12; language button switches text everywhere.
```

### P01 — Home / Entry Page  _(owner: Person A)_

```text
Build js/pages/p01-home.js using the PROJECT CONTEXT and the existing ui.js helpers.

STAGE
- Full-bleed art assets/img/p01_home_hero.webp (object-fit: cover, object-position: left center).
- 5 decorative map pins over the art (temple pin brick, others teal) at % positions from a const array; gentle pulse (scale 1→1.08, 1.6s, 3 loops); no interaction.
- Top-left of the stage: tag chips row CONTENT.p01.tags (AR · Bilingual 雙語 · Digital Humanities 數位人文 · Place-based 在地學習).
- Bottom of the stage: menu chips (fill --color-surface, 2px --color-line ring): About Tudigong Culture, Community Culture Map, Local Cultural Objects, How to Use. "How to Use" → ctx.go('p03'). The other three open a small modal with CONTENT.p01.info.* (EN + ZH) and a Close button.
- Do not show any deity image.

PANEL (top → bottom)
- Eyebrow CONTENT.p01.eyebrow.
- Title CONTENT.meta.title at display size (EN then ZH).
- Core question box: fill --color-surface-2, radius --radius-md, a small map-pin icon, label "Core Inquiry 核心提問", then CONTENT.meta.coreQuestion EN + ZH.
- Primary button pinned at the bottom: "Start Experience 開始體驗" → ctx.go('p02').
- The core question box scrolls inside itself if it does not fit on a phone; the Start button must always be visible.
- CONTENT.meta.statement goes in the About Tudigong Culture modal, not on the home panel.

TOP BAR on P01: no Back button; Language button visible.
Completion: P01 has no task; call ctx.complete('p01') on render.
Acceptance: on an 844×390 phone the title, core question and Start button are all visible without scrolling; text from content.js only.
```

### P02 — Scan Activation (MindAR)  _(owner: Person B)_

```text
Build js/ar.js and js/pages/p02-scan.js.

js/ar.js
- startAR(stageEl, {onFound, onLost, onError}) inserts:
  <a-scene mindar-image="imageTargetSrc: assets/targets/tudigong-card.mind; maxTrack: 1; uiScanning: no; uiLoading: no; uiError: no; filterMinCF: 0.0001; filterBeta: 0.001"
           color-space="sRGB" renderer="colorManagement: true; alpha: true" vr-mode-ui="enabled: false" device-orientation-permission-ui="enabled: false" embedded>
    <a-camera position="0 0 0" look-controls="enabled: false" cursor="rayOrigin: mouse" raycaster="objects: .clickable"></a-camera>
    <a-entity id="target0" mindar-image-target="targetIndex: 0"></a-entity>
  </a-scene>
  The scene fills the STAGE only (not the panel). Listen to targetFound / targetLost on #target0 and "arError" on the scene.
- stopAR(): sceneEl.systems['mindar-image-system'].stop(), stop all video tracks, remove the scene element.
- getTarget(): returns #target0 so later pages (P07) can add entities.

P02 page
- STAGE: camera feed. On top (HTML overlay, pointer-events none): 4 rounded corner brackets in --teal-500 forming a 3:2 frame at 60% of stage height; a thin --teal-300 line sweeping top→bottom every 2s (static when reduced motion); status chip at bottom-center.
- Status chip states from CONTENT.p02.states: idle "Scan the Tudigong Culture Card 掃描土地公文化卡" → scanning "Scanning, please wait 掃描中，請稍候" (after camera starts) → found "Scan Complete 掃描完成" (success style).
- On targetFound: add 6 small "map light points" to #target0 (a-circle radius 0.05, teal and one gold, scattered over the card, animate scale 0→1 over 300ms), call ctx.complete('p02'), set state.arAvailable = true, show success toast.
- After 15s with no detection: hint toast CONTENT.p02.hintSlow.
- Camera denied / not HTTPS / arError: show a friendly box on the stage with CONTENT.p02.cameraError and a secondary button "Continue without AR 不使用 AR 繼續" that sets state.arAvailable = false and calls ctx.complete('p02'). The demo must never get stuck here.
- PANEL: narration, checklist item "Scan the culture card 掃描文化卡", secondary buttons "Scan Again 重新掃描" (stopAR + startAR) and "Back 返回"; primary "Next 下一步".
- destroy(): keep AR running only if the next page is p03/p04 (state flag); otherwise stopAR().
Acceptance: works on iOS Safari and Android Chrome over HTTPS; image target found within ~3s in normal light; no MindAR default UI visible.
```

### P03 — How to Use  _(owner: Person A)_

```text
Build js/pages/p03-howto.js.

STAGE
- Background --color-bg. A 3×2 grid of tiles (gap 16px, centered, max-width 720px) from CONTENT.p03.tiles.
- Tile: fill --color-surface, --border, radius --radius-lg, 56px icon circle --teal-50 with the Phosphor duotone icon (hand-tap, map-trifold, hand-grabbing, sliders-horizontal, puzzle-piece, cards) in --teal-600, EN label 700, ZH label, one-line description (--fs-small).
- Tapping a tile plays a 1.5s mini demo on that tile: a small hand icon moves (tap = press, drag = slide right, timeline = slide left→right, match = two chips join). Static under reduced motion.

PANEL: narration (short), checklist "Read the instructions 閱讀說明", primary "Got It 我知道了" → ctx.next().
Completion: ctx.complete('p03') after the user taps any tile OR after 3 seconds.
Keep the whole page readable in under 30 seconds.
```

### P04 — Introduction — tap 4 places  _(owner: Person B)_

```text
Build js/pages/p04-intro.js.

STAGE
- Wrapper with aspect-ratio 3/2 (object-fit: contain) holding assets/img/p04_culture_map.webp.
- 4 map pins at % positions (edit after the final art is in):
  const NODES = [ {id:'temple', x:56, y:46, temple:true}, {id:'fields', x:20, y:62}, {id:'market', x:78, y:70}, {id:'corner', x:44, y:24} ];
- Pins pulse until tapped. Each pin has its label from CONTENT.p04.nodes[id].label shown as a small tag under the pin.
- Tap a pin → culture note popover (CONTENT.p04.nodes[id].note, EN + ZH), pin gets .is-done (gold ring). Only one popover open at a time.
- A small collapsible chip at the top of the stage keeps the core question visible: "Core Inquiry 核心提問" → expands to the question.
- If state.arAvailable is true you may also show the map as an AR plane on the card; keep the 2D version as default (more reliable).

PANEL: narration; two vocab chips "Local Guardian 地方守護" and "Cultural Landscape 文化地景" → ctx.openVocab(); checklist "Observe at least 3 places 觀察至少 3 個地點 (n/3)".
Completion: 3 of 4 pins observed → ctx.complete('p04') + success toast.
```

### P05 — Scene 1 — drag 4 cards to the map  _(owner: Person C)_

```text
Build js/pages/p05-street-corner.js using js/drag.js.

STAGE
- Wrapper aspect-ratio 3/2 with assets/img/p05_base_map.webp (top-down map with 4 zones in a 2×2 layout).
- 4 .drop-zone elements at fixed % rects over the zones: residential (top-left), road (top-right), market (bottom-left), temple (bottom-right). Each zone shows a faint icon of its type.
- Card tray along the bottom of the stage (fill --color-surface-2, radius top --radius-lg) with 4 .node-card in shuffled order: Residential Area 住宅區, Road 道路, Market 市場, Small Temple 小廟 (CONTENT.p05.cards). Temple card icon uses --brick-100 tint.
- Drag (or tap card → tap zone). accept() = card id equals zone id.
  Correct: card snaps into zone, zone .is-filled, small success toast with the card name.
  Wrong: card returns to tray with .is-hint shake + hint toast CONTENT.p05.hints[cardId].
- When all 4 are placed: the temple zone pulses and the stage toast says CONTENT.p05.tapTemple. Tapping it adds a temple map pin with the tag "Community Node 社區節點".

PANEL: narration; checklist "Place all 4 cards 放好 4 張卡片 (n/4)" and "Mark the Community Node 標記社區節點".
Completion: all 4 placed + temple tapped → ctx.complete('p05'), add badge 'node', toast "Community Task Complete 社區任務完成".
```

### P06 — Scene 2 — Past/Present timeline  _(owner: Person C)_

```text
Build js/pages/p06-land-use.js. This is a core digital-humanities scene.

STAGE
- Wrapper aspect-ratio 3/2. Two stacked, perfectly aligned images: assets/img/p06_map_past.webp (bottom) and assets/img/p06_map_present.webp (top). The present image is revealed from the left as the slider moves right: set --t (0–100) on the wrapper and use clip-path: inset(0 calc(100% - var(--t) * 1%) 0 0) on the present image, with a thin vertical divider line at the reveal edge. Add a "Compare Land Use 比較土地利用" toggle that switches to a fixed 50/50 split with a divider.
- Two cultural node pins sit ABOVE both images and never move or fade: small temple (temple pin) and old tree (teal pin). This is the learning point: land use changes, these nodes remain.
- Timeline (.timeline) along the bottom of the stage: "Past 過去" ← range 0–100 → "Present 現在". Thumb 44px.
- Layer legend chips at the top of the stage: Fields 田地, Settlement 聚落, Homes 住家, Local Businesses 在地商家. Each chip's opacity follows the slider (Fields/Settlement strong at 0, Homes/Local Businesses strong at 100).
- Caption bottom-left of the art: CONTENT.common.conceptualMap.

LOGIC
- "One full comparison" = the slider has been ≤ 5 and later ≥ 95 in the same visit.
- After that, show a secondary button on the stage: "Find Cultural Clues 尋找文化線索". Tapping it pulses the 2 persistent pins. Tapping either pin opens a culture note with CONTENT.p06.clueNote.

PANEL: narration; checklist "Slide from Past to Present 從過去滑到現在" and "Select a Cultural Clue 選出一個文化線索".
Completion: comparison done + clue selected → ctx.complete('p06'), badge 'clue'.
```

### P07 — Scene 3 — cultural objects (AR) + meaning match  _(owner: Person B)_

> Built (Nov 2026): `js/pages/p07-objects.js`. Rebuilt (late Nov 2026) as the first scrolling story page (`js/story.js`, `css/story.css`): Hero, three Learn cards, Do (four exhibits + the meaning cards in a fan that turn over after three objects), Badge (the whole landscape). The prompt below is the original plan; the README describes what was built.

```text
Build js/pages/p07-objects.js.

OBJECTS (only these 4 are interactive): temple, table, lions, tree — CONTENT.p07.objects.
Assets: assets/img/p07_obj_temple.png, p07_obj_table.png, p07_obj_lions.png, p07_obj_tree.png (transparent PNG, 1024px). Optional .glb models under 1.5 MB each may replace the PNGs later.

AR MODE (state.arAvailable true)
- Add to #target0 four <a-image class="clickable"> (or a-plane with the PNG) in a gentle arc above the card (z 0.1–0.3), each 0.35 units wide, facing the camera.
- Click (raycaster via cursor rayOrigin: mouse) → object scales 1.1 for 200ms and its card appears in the panel.
- If tracking is lost for >2s: toast "Point the camera back at the card 將鏡頭對準文化卡" + secondary button "Show without AR" that switches to 2D mode.

2D MODE (default fallback)
- Stage background --color-bg with a soft paper texture; the 4 objects as 2.5D cards in a row (each: image on top, label EN/ZH below, --shadow-card, slight 3D tilt rotateX(8deg) that flattens on hover/tap).

FLOW
- Tap → object card in panel: name EN/ZH + its tap prompt; marks object observed (.is-done ring).
- After 3 observed, the panel shows "Match Cultural Meanings 配對文化意義": 4 object chips on the left, 4 meaning cards (CONTENT.p07.objects[id].meaning) shuffled on the right. Tap chip then tap meaning (drag also allowed). Correct: both turn green and stay paired. Wrong: gold hint toast, no penalty.
- Never render the deity, incense burner, moon blocks or plaque as separate objects. The temple image shows no deity close-up.

PANEL: narration; checklist "Observe at least 3 objects 觀察至少 3 個物件 (n/3)" and "Match the meanings 完成意義配對 (n/4)".
Completion: ≥3 observed + 4/4 matched → ctx.complete('p07'), badge 'landscape', toast "Object Task Complete 物件任務完成".
```

### P08 — Scene 4 — build a community route  _(owner: Person C)_

> Built (Nov 2026): `js/pages/p08-community-map.js` + `css/scenes.css`. The prompt below is the original plan; the README describes what was built.

```text
Build js/pages/p08-community-map.js. Core digital-humanities scene.

STAGE
- Start state: art dimmed with a centered secondary button "Open Kaohsiung Community Map 打開高雄社區地圖". Tap → map un-dims (250ms).
- Wrapper aspect-ratio 3/2 with assets/img/p08_kaohsiung_map.webp. 6 empty slots (.map-pin.is-empty) at fixed % positions over open ground.
- Node tray at the bottom: School 學校, Homes 住家, Market 市場, Park and Old Tree 公園與老樹, Local Temple 地方廟宇, Old Street 老街 (CONTENT.p08.nodes).
- Drag a node (or tap node → tap slot) into ANY empty slot (this is building, not testing — every slot accepts every node). Placed slot becomes a real .map-pin with icon + label; show a 1-sentence culture note toast.
- After ≥4 placed, enable "Build a Cultural Route 建立文化路線". Route mode: tap placed pins in order; draw an SVG overlay path through them: stroke --teal-600, width 4, stroke-dasharray 10 8, round caps/joins, small step numbers on pins. "Undo 復原" removes the last step. "Finish Route 完成路線" enabled at ≥4 steps.
- Save the route to state.p08Route as [{id, x, y}] (P12 redraws it).
- Caption: CONTENT.common.conceptualMap.

PANEL: narration; checklist "Place at least 4 places 放上至少 4 個地點 (n/4)" and "Connect a route 連成一條路線"; after completion show the reflection question CONTENT.p08.reflect in the core-question box style.
Completion: ≥4 nodes + finished route → ctx.complete('p08'), badge 'route'.
```

### P09 — Scene 5 — Zuoya / Touya / Weiya matching (nice-to-have)  _(owner: Person C)_

> Built (Nov 2026): `js/pages/p09-touya-weiya.js` + `css/scenes.css`. The prompt below is the original plan; the README describes what was built.

```text
Build js/pages/p09-touya-weiya.js.

STAGE
- Two columns. Left: 3 term cards (Zuoya 做牙, Touya 頭牙, Weiya 尾牙) styled as .vocab-card fronts. Right: 3 answer cards shuffled (CONTENT.p09.terms[id].answer).
- Above the answers, a simple lunar-calendar strip built in HTML (NOT an AI image): 12 small month boxes; month 2 day 2 and month 12 day 16 get gold dots when matched.
- Tap a term → tap an answer (drag also OK). Draw an SVG connector line (--teal-600, 3px) between matched pairs.
  Correct: pair turns green; show a small explanation card with an illustration: Zuoya → calendar strip highlight, Touya → assets/img/p09_shopping_street.webp, Weiya → assets/img/p09_weiya_meal.webp.
  Wrong: gold hint toast, cards stay unmatched.
- Chips under the stage: "Local Business Culture 在地商業文化", "Everyday Language 日常用語" → ctx.openVocab('Weiya').
- No offerings, no worship steps, no "ask for business luck" wording anywhere.

PANEL: narration; checklist "Match all 3 terms 完成 3 個詞彙配對 (n/3)".
Completion: 3/3 → ctx.complete('p09'), badge 'calendar', toast "Culture Match Complete 文化配對完成".
```

### P10 — Scene 6 — Bogong in Meinong (nice-to-have)  _(owner: Person C)_

> Built (Nov 2026): `js/pages/p10-meinong-bogong.js` + `css/scenes.css`. The prompt below is the original plan; the README describes what was built.

```text
Build js/pages/p10-meinong-bogong.js.

STAGE
- Left third: a schematic SVG map card (draw it in code, not an image): simple outline shape labelled "Kaohsiung 高雄", a highlighted area "Meinong, Kaohsiung 高雄美濃" with a teal pin, and a dashed line from a "You are here" city pin to Meinong. Under it the landscape art assets/img/p10_meinong.webp (3:2).
- Right two-thirds: matching. 3 concept cards: Tudigong 土地公, Bogong 伯公, Fuchang Case 福廠案例. 3 meaning cards shuffled (CONTENT.p10.concepts[id].meaning). Tap-to-match as in P09.
- After 3/3, button "Compare Cultural Expressions 比較文化表現" opens a 2-column comparison card: Tudigong (common name across Taiwan) | Bogong (Hakka name in Meinong), plus a note box: Fuchang is a culture-specific case from Yong'an, not a general temple name.
- Source credit line with a link (opens new tab): CONTENT.p10.credit → https://www.khm.org.tw/tw/event/past/detail/338
- Bogong/Fuchang images: use only real photos the team has permission to use (with credit) or no image. Do NOT use AI-generated images of the fuchang.

PANEL: narration; checklist "Match all 3 concepts 完成 3 個概念配對 (n/3)".
Completion: 3/3 → ctx.complete('p10'), badge 'local', toast "Local Culture Task Complete 在地文化任務完成".
```

### P11 — Ending — build an English sentence  _(owner: Person A)_

> Built (Nov 2026): `js/pages/p11-sentence.js` + `css/scenes.css`. The prompt below is the original plan; the README describes what was built.

```text
Build js/pages/p11-sentence.js.

STAGE
- Background: assets/img/p08_kaohsiung_map.webp at opacity .2, plus the student's P08 route redrawn on top at opacity .35.
- Center card (fill --color-surface, radius --radius-lg, --shadow-lift, max-width 640px) with 3 tabs: one per sentence frame in CONTENT.p11.frames.
- Frame text with .sentence-slot blanks. Below, option chips. Tap a chip → it fills the next empty slot (tap a filled slot to clear it).
  ok:true → slot turns --teal-50. ok:false → chip shakes, hint toast with option.hint, slot stays empty.
  Frame 1 needs 2 different options.
- When a frame is complete: show the assembled sentence large (--fs-h2 800) and the Chinese support line below (built from frame.zh + option.zh). A "Listen 聆聽" icon button reads the English sentence with speechSynthesis (lang en-US, rate 0.9) if available; hide the button if not.
- Starter chips above the card (decorative prompts): "I learned that… 我學到…" etc. from CONTENT.p11.starters.

PANEL: narration; checklist "Complete 1 English sentence 完成 1 個英文句子"; secondary buttons "Experience Again 再體驗一次" and "Give Feedback 給予回饋" (→ p12 feedback section); primary Next.
Completion: ≥1 frame completed → ctx.complete('p11'), badge 'speaker'; save sentences to state.p11Sentences.
```

### P12 — Project information, results & feedback  _(owner: Person A)_

> Built (Nov 2026): `js/pages/p12-end.js` + `css/scenes.css`. The prompt below is the original plan; the README describes what was built.

```text
Build js/pages/p12-end.js — a digital-exhibition ending page.

STAGE (scrollable inside the stage if needed)
- Row 1: "My Community Culture Map 我的社區文化地圖": small 3:2 thumbnail of p08 art with the saved route (state.p08Route) redrawn as SVG.
- Row 2: badges (7): node, clue, landscape, route, calendar, local, speaker (CONTENT.p12.badges). Earned = filled badge; not earned = outline. On first render, earned badges scale in one after another (80ms stagger) with 6 tiny gold dots each. No rays, no glow.
- Row 3: "Words You Learned Today 今日學到的詞彙": all CONTENT.vocab terms as chips → ctx.openVocab(term).

PANEL
- Recap box (core-question style): CONTENT.meta.coreQuestion + narration answer sentence.
- "I Can Introduce Local Culture 我能介紹在地文化": the student's sentences from state.p11Sentences.
- Accordion sections: Story Introduction 故事簡介 (CONTENT.meta.statement), Further Reading 延伸閱讀 (CONTENT.references as links, target=_blank rel=noopener), Teacher Questions 教師提問 (studentPrompt + teacherPrompt), User Feedback 使用者回饋.
- Feedback: 5 map-pin icons as a 1–5 rating (radio group, keyboard accessible) + optional textarea + "Submit 送出" → show "Thank you for your feedback! 謝謝你的回饋！". (If the team needs to collect answers, replace with a link to a Google Form.)
- Buttons: secondary "Back to Home 回到首頁" (go p01, keep state), primary "Experience Again 再體驗一次" (clear state, go p01).
Completion: reaching P12 completes it.
```

## 6. content/content.js

This is a copy of `content/content.js` as built (P01–P12). The repo file is the source of truth.

```js
// content/content.js — single source of all visible text (EN + Traditional Chinese)
// Owner: Person A. Chinese narration = draft translation, please proofread.
const CONTENT = {
  "meta": {
    "title": {
      "en": "Tudigong's Neighborhood: Local Guardian and Community Life",
      "zh": "土地公的街坊：地方守護與社區生活"
    },
    "shortTitle": {
      "en": "Tudigong's Neighborhood",
      "zh": "土地公的街坊"
    },
    "subtitle": {
      "en": "Local Guardian and Community Life",
      "zh": "地方守護與社區生活"
    },
    "coreQuestion": {
      "en": "Why do we often find Tudigong near street corners, fields, markets, and settlements in Taiwan?",
      "zh": "為什麼在臺灣，我們常在街角、田邊、市場與聚落附近看到土地公？"
    },
    "statement": {
      "en": "This experience uses Tudigong belief in Taiwan as cultural learning material. It focuses on local culture, community life, AR interaction, bilingual expression, and digital humanities learning. It does not simulate worship, divination, or blessing rituals.",
      "zh": "本體驗以臺灣土地公信仰作為文化學習素材，聚焦在地文化、社區生活、AR 互動、雙語表達與數位人文學習，不模擬祭拜、擲筊或祈福儀式。"
    }
  },
  "common": {
    "next": {
      "en": "Next",
      "zh": "下一步"
    },
    "back": {
      "en": "Back",
      "zh": "返回"
    },
    "close": {
      "en": "Close",
      "zh": "關閉"
    },
    "skipTitle": {
      "en": "You haven't finished this page yet",
      "zh": "這一頁還沒完成"
    },
    "voiceOn": {
      "en": "Turn on voice guide",
      "zh": "開啟語音導覽"
    },
    "voiceOff": {
      "en": "Turn off voice guide",
      "zh": "關閉語音導覽"
    },
    "guideReplay": {
      "en": "Listen again",
      "zh": "再聽一次"
    },
    "guideHide": {
      "en": "Hide",
      "zh": "隱藏"
    },
    "skipLeft": {
      "en": "Still to do:",
      "zh": "還沒完成："
    },
    "skipEyebrow": {
      "en": "Wait a moment!",
      "zh": "等一下！"
    },
    "loading3d": {
      "en": "Building the neighborhood…",
      "zh": "正在建立街坊…"
    },
    "skipProgress": {
      "en": "Your progress on this page",
      "zh": "這一頁的進度"
    },
    "skipDone": {
      "en": "done",
      "zh": "已完成"
    },
    "skipLater": {
      "en": "You can come back anytime.",
      "zh": "隨時都可以回來。"
    },
    "skipBody": {
      "en": "You can keep exploring, or go on to the next page and come back later.",
      "zh": "你可以繼續探索，或先前往下一頁，之後再回來。"
    },
    "skipStay": {
      "en": "Keep Exploring",
      "zh": "繼續探索"
    },
    "skipGo": {
      "en": "Go to Next Page",
      "zh": "前往下一頁"
    },
    "language": {
      "en": "Language",
      "zh": "語言"
    },
    "langModes": {
      "bi": {
        "en": "Bilingual",
        "zh": "雙語"
      },
      "en": {
        "en": "English",
        "zh": "英文"
      },
      "zh": {
        "en": "中文",
        "zh": "中文"
      }
    },
    "rotate": {
      "en": "Please rotate your device",
      "zh": "請將裝置橫放"
    },
    "coreInquiry": {
      "en": "Core Inquiry",
      "zh": "核心提問"
    },
    "tryAgainHint": {
      "en": "Not yet. Look at the hint and try again.",
      "zh": "還差一點，看看提示再試一次。"
    },
    "conceptualMap": {
      "en": "Conceptual map, not a historical record",
      "zh": "示意地圖，非歷史實測"
    },
    "continueNoAR": {
      "en": "Continue without AR",
      "zh": "不使用 AR 繼續"
    },
    "pointBack": {
      "en": "Point the camera back at the card",
      "zh": "將鏡頭對準文化卡"
    },
    "undo": {
      "en": "Undo",
      "zh": "復原"
    },
    "comingSoon": {
      "en": "This page is planned for a later milestone. Tap Next to continue.",
      "zh": "此頁將於後續階段完成，請點選「下一步」繼續。"
    },
    "observed": {
      "en": "Observed",
      "zh": "已觀察"
    },
    "readMore": {
      "en": "Tap to read",
      "zh": "點一下閱讀"
    },
    "listen": {
      "en": "Listen to narration",
      "zh": "聆聽旁白"
    },
    "pause": {
      "en": "Pause narration",
      "zh": "暫停旁白"
    },
    "audioSoon": {
      "en": "Narration coming soon",
      "zh": "旁白即將上線"
    },
    "fullScreen": {
      "en": "Full screen",
      "zh": "全螢幕"
    },
    "showPanel": {
      "en": "Show panel",
      "zh": "顯示面板"
    },
    "skip": {
      "en": "Skip",
      "zh": "略過"
    },
    "zoomIn": {
      "en": "Zoom in",
      "zh": "放大"
    },
    "zoomOut": {
      "en": "Zoom out",
      "zh": "縮小"
    },
    "resetView": {
      "en": "Reset view",
      "zh": "重設視角"
    },
    "musicOn": {
      "en": "Music on",
      "zh": "音樂開啟"
    },
    "musicOff": {
      "en": "Music off",
      "zh": "音樂關閉"
    },
    "touchEarth": {
      "en": "Touch the earth",
      "zh": "輕觸大地"
    },
    "badgeEarned": {
      "en": "Badge earned",
      "zh": "獲得徽章"
    },
    "simpleMap": {
      "en": "Simplified map, not to scale",
      "zh": "簡化示意圖，未依實際比例"
    },
    "step": {
      "en": "Stop",
      "zh": "站"
    },
    "clear": {
      "en": "Clear",
      "zh": "清除"
    },
    "goodMatch": [
      {
        "en": "Good match!",
        "zh": "配對成功！"
      },
      {
        "en": "Well done!",
        "zh": "做得好！"
      },
      {
        "en": "That's right!",
        "zh": "答對了！"
      },
      {
        "en": "Great!",
        "zh": "太棒了！"
      }
    ],
    "youWill": {
      "en": "In this scene you will",
      "zh": "在這個場景，你會"
    },
    "stepNames": [
      {
        "en": "Learn",
        "zh": "認識"
      },
      {
        "en": "Do",
        "zh": "動手"
      },
      {
        "en": "Badge",
        "zh": "徽章"
      }
    ],
    "start": {
      "en": "Start",
      "zh": "開始"
    },
    "scrollHint": {
      "en": "Scroll down",
      "zh": "往下滑"
    },
    "cardOf": {
      "en": "Card",
      "zh": "第"
    },
    "badgeLockedTitle": {
      "en": "Badge waiting",
      "zh": "徽章等你來拿"
    },
    "nextStopBtn": {
      "en": "Next stop",
      "zh": "下一站"
    },
    "moreBelow": {
      "en": "More below",
      "zh": "往下還有"
    }
  },
  "p01": {
    "guide": {
      "en": "Welcome to Tudigong's Neighborhood. Take a breath, and when you're ready, tap Start Experience to begin our journey together.",
      "zh": "歡迎來到土地公的街坊。深呼吸一下，準備好了，就點「開始體驗」，我們一起出發吧。"
    },
    "eyebrow": {
      "en": "P01 · Home",
      "zh": "P01 · 首頁"
    },
    "heading": {
      "en": "Entry Page",
      "zh": "入口頁"
    },
    "tags": [
      {
        "en": "AR",
        "zh": "AR"
      },
      {
        "en": "Bilingual",
        "zh": "雙語"
      },
      {
        "en": "Digital Humanities",
        "zh": "數位人文"
      },
      {
        "en": "Place-based",
        "zh": "在地學習"
      }
    ],
    "start": {
      "en": "Start Experience",
      "zh": "開始體驗"
    },
    "menu": {
      "about": {
        "en": "About Tudigong Culture",
        "zh": "認識土地公文化"
      },
      "map": {
        "en": "Community Culture Map",
        "zh": "社區文化地圖"
      },
      "objects": {
        "en": "Local Cultural Objects",
        "zh": "在地文化物件"
      },
      "howTo": {
        "en": "How to Use",
        "zh": "使用說明"
      }
    },
    "menuShort": {
      "about": {
        "en": "About",
        "zh": "認識"
      },
      "map": {
        "en": "Map",
        "zh": "地圖"
      },
      "objects": {
        "en": "Objects",
        "zh": "物件"
      },
      "howTo": {
        "en": "How to",
        "zh": "說明"
      }
    },
    "info": {
      "about": {
        "en": "Tudigong, also called Fude Zhengshen, is a common local guardian in Taiwanese folk belief. In this experience we study Tudigong as part of local culture: land, farming, neighborhoods, markets, and community memory.",
        "zh": "土地公又稱福德正神，是臺灣民間信仰中常見的地方守護神。在這個體驗中，我們把土地公當作地方文化的一部分來認識：土地、農業、街坊、市場與社區記憶。"
      },
      "map": {
        "en": "A community culture map shows everyday places and how they are connected. You will build your own map later in the journey.",
        "zh": "社區文化地圖呈現日常場所以及它們之間的連結。旅程後段你會建立自己的地圖。"
      },
      "objects": {
        "en": "You will observe a small temple, an offering table, stone lions, and an old tree as parts of a cultural landscape.",
        "zh": "你將觀察小廟、供桌、石獅與老樹，認識它們如何成為文化地景的一部分。"
      }
    },
    "narration": {
      "en": "Welcome to Tudigong's Neighborhood: Local Guardian and Community Life. This AR bilingual experience begins with one question: Why do we often find Tudigong near street corners, fields, markets, and settlements in Taiwan? Starting from Kaohsiung's local living spaces, we will explore the connections among land, community, and local memory.",
      "zh": "歡迎來到「土地公的街坊：地方守護與社區生活」。這個雙語 AR 體驗從一個問題開始：為什麼在臺灣，我們常在街角、田邊、市場與聚落附近看到土地公？我們將從高雄在地的生活空間出發，探索土地、社區與地方記憶之間的連結。"
    }
  },
  "p02": {
    "guide": {
      "en": "First, let's set up the camera. Read the four tips, tap Start Camera, and choose Allow. Then hold the culture card inside the frame, about thirty to fifty centimeters away.",
      "zh": "我們先來設定相機。看看四個小提示，點「開啟相機」，再按「允許」。接著把文化卡放進框框裡，距離大約三十到五十公分。"
    },
    "eyebrow": {
      "en": "P02 · Enter AR",
      "zh": "P02 · 進入 AR"
    },
    "heading": {
      "en": "Scan Activation",
      "zh": "掃描啟動"
    },
    "states": {
      "idle": {
        "en": "Scan the Tudigong Culture Card",
        "zh": "掃描土地公文化卡"
      },
      "scanning": {
        "en": "Scanning, please wait",
        "zh": "掃描中，請稍候"
      },
      "found": {
        "en": "Scan Complete",
        "zh": "掃描完成"
      },
      "loading": {
        "en": "Starting the camera…",
        "zh": "正在啟動相機…"
      },
      "lost": {
        "en": "Point the camera back at the card",
        "zh": "將鏡頭對準文化卡"
      }
    },
    "foundToast": {
      "en": "Card found! A 3D neighborhood rises from the card. Move your device around it.",
      "zh": "找到文化卡了！立體街坊從卡片上升起，移動裝置從不同角度看看。"
    },
    "noCamera": {
      "en": "This device or browser cannot use the camera here. Open the HTTPS link on a phone or tablet, or continue without AR.",
      "zh": "此裝置或瀏覽器無法在這裡使用相機。請用手機或平板開啟 HTTPS 連結，或不使用 AR 繼續。"
    },
    "targetMissing": {
      "en": "The AR card data could not be loaded. Check your internet connection and tap Scan Again, or continue without AR.",
      "zh": "AR 卡片資料無法載入。請確認網路連線後點選「重新掃描」，或不使用 AR 繼續。"
    },
    "noARdone": {
      "en": "You can continue without AR. Later pages work as normal screens.",
      "zh": "你可以不使用 AR 繼續，後面的頁面會以一般畫面呈現。"
    },
    "scanAgain": {
      "en": "Scan Again",
      "zh": "重新掃描"
    },
    "task": {
      "en": "Scan the culture card",
      "zh": "掃描文化卡"
    },
    "skipTitle": {
      "en": "You haven't scanned the card yet",
      "zh": "你還沒有掃描文化卡"
    },
    "skipBody": {
      "en": "Scan the culture card to see the neighborhood rise in AR, or go on to the next page and come back later.",
      "zh": "掃描文化卡，就能看到街坊在 AR 中出現；也可以先前往下一頁，之後再回來。"
    },
    "skipStay": {
      "en": "Continue Scanning",
      "zh": "繼續掃描"
    },
    "setup": {
      "title": {
        "en": "Camera Setup",
        "zh": "相機設定"
      },
      "intro": {
        "en": "Before scanning the culture card, let's get the camera ready.",
        "zh": "掃描文化卡之前，我們先把相機準備好。"
      },
      "steps": [
        {
          "icon": "camera",
          "title": {
            "en": "Allow Camera",
            "zh": "允許相機"
          },
          "text": {
            "en": "When the browser asks, tap Allow. The camera is only used to find the culture card. Nothing is recorded or uploaded.",
            "zh": "瀏覽器詢問時請點「允許」。相機只用來尋找文化卡，不會錄影，也不會上傳。"
          }
        },
        {
          "icon": "scan",
          "title": {
            "en": "Fit the Card",
            "zh": "對準卡片"
          },
          "text": {
            "en": "Keep the whole card inside the frame, about 30–50 cm away.",
            "zh": "讓整張文化卡留在框線內，距離大約 30 到 50 公分。"
          }
        },
        {
          "icon": "bulb",
          "title": {
            "en": "Good Light",
            "zh": "光線充足"
          },
          "text": {
            "en": "Find good light and hold the device steady.",
            "zh": "找一個光線充足的地方，拿穩裝置。"
          }
        },
        {
          "icon": "hand",
          "title": {
            "en": "Stay Safe",
            "zh": "注意安全"
          },
          "text": {
            "en": "Stay where you are and keep an eye on the people and things around you.",
            "zh": "請待在原地，留意身邊的人和物品。"
          }
        }
      ],
      "start": {
        "en": "Start Camera",
        "zh": "開啟相機"
      },
      "eyebrow": {
        "en": "4 quick steps",
        "zh": "4 個小步驟"
      },
      "allow": {
        "en": "Allow",
        "zh": "允許"
      },
      "ready": {
        "en": "Ready? Let's find the card!",
        "zh": "準備好了嗎？一起找文化卡吧！"
      }
    },
    "hintSlow": {
      "en": "Move a little closer (about 30 cm), hold the card flat and find good light.",
      "zh": "再靠近一點（大約 30 公分），把卡片平放，並找光線充足的地方。"
    },
    "cameraError": {
      "en": "Camera is not available. Allow camera access in your browser settings, then tap Scan Again.",
      "zh": "無法使用相機。請在瀏覽器設定中允許相機權限，再點選「重新掃描」。"
    },
    "narration": {
      "en": "Please scan the Tudigong culture card. After a successful scan, stories of Kaohsiung neighborhoods, farming life, markets, local cultural objects, and community life will appear in AR.",
      "zh": "請掃描土地公文化卡。掃描成功後，高雄街坊、農業生活、市場、在地文化物件與社區生活的故事，將以 AR 的方式出現在你眼前。"
    }
  },
  "p03": {
    "guide": {
      "en": "Here is how this journey works. Read the tips, and tap Got It whenever you're ready.",
      "zh": "這裡說明這趟旅程怎麼進行。看完小提示，準備好了就點「我知道了」。"
    },
    "eyebrow": {
      "en": "P03 · How to Use",
      "zh": "P03 · 使用說明"
    },
    "heading": {
      "en": "How to Use",
      "zh": "使用說明"
    },
    "tiles": [
      {
        "icon": "hand-tap",
        "label": {
          "en": "Tap Objects",
          "zh": "點選物件"
        },
        "desc": {
          "en": "Tap places and objects to read culture notes.",
          "zh": "點選地點與物件，閱讀文化小知識。"
        }
      },
      {
        "icon": "map-trifold",
        "label": {
          "en": "Explore the Neighborhood",
          "zh": "探索街坊"
        },
        "desc": {
          "en": "Move around the community map.",
          "zh": "瀏覽社區地圖。"
        }
      },
      {
        "icon": "hand-grabbing",
        "label": {
          "en": "Drag Cards",
          "zh": "拖曳卡片"
        },
        "desc": {
          "en": "Drag a card onto the right place.",
          "zh": "把卡片拖到正確的位置。"
        }
      },
      {
        "icon": "sliders-horizontal",
        "label": {
          "en": "Compare Past and Present",
          "zh": "比較過去與現在"
        },
        "desc": {
          "en": "Slide the timeline to see change.",
          "zh": "滑動時間軸，看見改變。"
        }
      },
      {
        "icon": "puzzle-piece",
        "label": {
          "en": "Match Cultural Meanings",
          "zh": "配對文化意義"
        },
        "desc": {
          "en": "Connect objects with their meanings.",
          "zh": "把物件與文化意義配對。"
        }
      },
      {
        "icon": "cards",
        "label": {
          "en": "Match Words",
          "zh": "配對詞彙"
        },
        "desc": {
          "en": "Match English and Chinese terms.",
          "zh": "配對中英文詞彙。"
        }
      }
    ],
    "gotIt": {
      "en": "Got It",
      "zh": "我知道了"
    },
    "task": {
      "en": "Read the instructions",
      "zh": "閱讀說明"
    },
    "tapHint": {
      "en": "Tap a card to see the gesture.",
      "zh": "點一下卡片，看看手勢示範。"
    },
    "narration": {
      "en": "You can tap cultural objects, explore a community map, drag daily-life cards, compare past and present land use, and complete cultural matching and bilingual vocabulary tasks. Each task will help you answer the core inquiry question.",
      "zh": "你可以點選文化物件、探索社區地圖、拖曳日常生活卡片、比較過去與現在的土地利用，並完成文化配對與雙語詞彙任務。每一項任務都能幫助你回答核心提問。"
    }
  },
  "p04": {
    "guide": {
      "en": "Let's explore the map. Turn it with one finger, pinch to zoom, and tap at least three places to learn about them.",
      "zh": "我們來探索地圖吧。用一根手指轉動，用兩根手指縮放，再點選至少三個地點，認識它們。"
    },
    "eyebrow": {
      "en": "P04 · Introduction",
      "zh": "P04 · 導論"
    },
    "heading": {
      "en": "Why Is Tudigong Often Close to Everyday Life?",
      "zh": "為什麼土地公常在日常生活附近？"
    },
    "nodes": {
      "temple": {
        "label": {
          "en": "Find the Small Temple",
          "zh": "找找小廟"
        },
        "note": {
          "en": "Many Tudigong temples are small and tucked inside neighborhoods. Even a small temple can be an important local landmark.",
          "zh": "許多土地公廟規模不大，就藏身在社區之中；即使是小廟，也可能是重要的地方地標。"
        }
      },
      "fields": {
        "label": {
          "en": "Look at the Fields",
          "zh": "看看田野"
        },
        "note": {
          "en": "Tudigong culture has long been tied to the land and to farming life, and some small temples stand right beside the fields.",
          "zh": "土地公文化長期與土地和農業生活息息相關，有些小廟就坐落在田邊。"
        }
      },
      "market": {
        "label": {
          "en": "Visit the Market",
          "zh": "逛逛市場"
        },
        "note": {
          "en": "Markets are the busy heart of community life, and local business culture is part of Tudigong traditions too.",
          "zh": "市場是社區生活熱鬧的中心，而在地商業文化也是土地公傳統的一部分。"
        }
      },
      "corner": {
        "label": {
          "en": "Explore the Street Corner",
          "zh": "探索街角"
        },
        "note": {
          "en": "A street corner is where roads and people meet. A small temple here can become both a landmark and a meeting point.",
          "zh": "街角是道路交會、人們相遇的地方；位在這裡的小廟可能成為地標與集合點。"
        }
      }
    },
    "task": {
      "en": "Observe at least 3 places",
      "zh": "觀察至少 3 個地點"
    },
    "tapPins": {
      "en": "Tap the glowing pins on the map.",
      "zh": "點選地圖上閃動的圖釘。"
    },
    "spinHint": {
      "en": "Drag to turn the neighborhood. Pinch or scroll to zoom. Tap the glowing pins.",
      "zh": "拖曳可旋轉街坊，雙指或滾輪可縮放，點選閃動的圖釘。"
    },
    "complete": {
      "en": "Great observing! You can go on.",
      "zh": "觀察得很好！可以繼續了。"
    },
    "chips": [
      {
        "en": "Local Guardian",
        "zh": "地方守護"
      },
      {
        "en": "Cultural Landscape",
        "zh": "文化地景"
      }
    ],
    "narration": {
      "en": "As we explore Kaohsiung's neighborhoods, fields, markets, and settlements, we find many cultural traces of Tudigong. Also known as Fude Zhengshen, Tudigong is a common local guardian in Taiwanese folk belief. His small temples and the cultural landscapes around them also record how people use the land, build communities, and create local memory.",
      "zh": "走訪高雄的街坊、田野、市場與聚落，我們可以發現許多土地公的文化痕跡。土地公又稱福德正神，是臺灣民間信仰中常見的地方守護神。土地公廟與周圍的文化地景，也記錄了人們如何利用土地、建立社區，並創造地方記憶。"
    }
  },
  "p05": {
    "guide": {
      "en": "Read each riddle, then drag the card to the right place on the map. When all four are placed, find the spot where everyone meets.",
      "zh": "讀一讀謎題，再把卡片拖到地圖上正確的地方。四張都放好之後，找出大家交會的地方。"
    },
    "eyebrow": {
      "en": "P05 · Scene 1",
      "zh": "P05 · 場景一"
    },
    "heading": {
      "en": "Street-Corner Temple: A Cultural Node in Community Life",
      "zh": "街角小廟：社區生活的文化節點"
    },
    "cards": {
      "residential": {
        "en": "Residential Area",
        "zh": "住宅區"
      },
      "road": {
        "en": "Road",
        "zh": "道路"
      },
      "market": {
        "en": "Market",
        "zh": "市場"
      },
      "temple": {
        "en": "Small Temple",
        "zh": "小廟"
      }
    },
    "explore": {
      "en": "Explore the Street Corner",
      "zh": "探索街角"
    },
    "tapTemple": {
      "en": "Tap the small temple to mark it as a Community Node",
      "zh": "點選小廟，將它標記為社區節點"
    },
    "node": {
      "en": "Community Node",
      "zh": "社區節點"
    },
    "hints": {
      "residential": {
        "en": "Look for the zone with rows of houses.",
        "zh": "找找有一排排房子的區域。"
      },
      "road": {
        "en": "Look for the street that runs between the buildings.",
        "zh": "找找建築物之間的那條街道。"
      },
      "market": {
        "en": "Look for the striped awnings.",
        "zh": "找找有條紋遮陽棚的地方。"
      },
      "temple": {
        "en": "Look for the small red-tile roof.",
        "zh": "找找紅瓦小屋頂。"
      }
    },
    "task1": {
      "en": "Place all 4 cards",
      "zh": "放好 4 張卡片"
    },
    "task2": {
      "en": "Mark the Community Node",
      "zh": "標記社區節點"
    },
    "complete": {
      "en": "Community Task Complete",
      "zh": "社區任務完成"
    },
    "dragHint": {
      "en": "Read the riddle, then drag the card to the right place on the map, or tap the card and then a circle.",
      "zh": "讀一讀謎題，再把卡片拖到地圖上正確的位置，或先點卡片再點圓圈。"
    },
    "riddle": {
      "en": "Riddle",
      "zh": "謎題"
    },
    "riddles": {
      "residential": {
        "en": "Rows of windows and laundry on the balconies. Families live here. What am I?",
        "zh": "一排排窗戶，陽臺上曬著衣服，許多家庭住在這裡。我是什麼？"
      },
      "road": {
        "en": "Scooters and cars travel along me every day and link every place. What am I?",
        "zh": "機車和汽車每天在我身上來來往往，把各個地方連在一起。我是什麼？"
      },
      "market": {
        "en": "Striped awnings, baskets of fruit and busy voices in the morning. What am I?",
        "zh": "條紋遮陽棚、一籃籃水果，早上人聲熱鬧。我是什麼？"
      },
      "temple": {
        "en": "I am small, with a curved red-tile roof, right by the street corner. What am I?",
        "zh": "我小小的，有彎彎的紅瓦屋頂，就在街角旁。我是什麼？"
      }
    },
    "passport": {
      "en": "Neighborhood Passport",
      "zh": "街坊護照"
    },
    "goldSeal": {
      "en": "No mistakes: a gold seal!",
      "zh": "零失誤：金色印章！"
    },
    "meetQ": {
      "en": "Where do the homes, the street and the market all meet? Tap that place on the map.",
      "zh": "住家、街道和市場在哪裡交會？在地圖上點點看。"
    },
    "meetWrong": {
      "en": "Not quite. Look at the small place right on the street corner.",
      "zh": "還差一點，看看街角上那個小小的地方。"
    },
    "placed": {
      "en": "Placed",
      "zh": "已放好"
    },
    "park": {
      "en": "Park",
      "zh": "公園"
    },
    "street": {
      "en": "Whole Street Corner",
      "zh": "整個街角"
    },
    "arTry": {
      "en": "Now tap any place on the map to learn about it and view it in AR!",
      "zh": "現在點地圖上的任何地點，認識它，再用 AR 看看！"
    },
    "arOpen": {
      "en": "View in AR",
      "zh": "用 AR 看看"
    },
    "arHint": {
      "en": "Drag to turn · pinch to zoom",
      "zh": "拖曳旋轉・雙指縮放"
    },
    "arPlace": {
      "en": "Place it in the room",
      "zh": "放進真實空間"
    },
    "arNoCam": {
      "en": "The camera isn't available, so here is the 3D model.",
      "zh": "無法開啟相機，先看看 3D 模型。"
    },
    "arLoading": {
      "en": "Loading the 3D model…",
      "zh": "3D 模型載入中…"
    },
    "arFacts": {
      "temple": {
        "en": "This small Tudigong temple stands where the homes, the street and the market meet. Neighbors stop here to chat and meet friends, so it is a landmark and a meeting point.",
        "zh": "這座土地公小廟就在住家、街道和市場交會的地方。鄰居們會在這裡聊天、和朋友碰面，所以它是地標，也是聚集點。"
      },
      "residential": {
        "en": "Rows of houses where families live. Every day, many neighbors walk past the small temple on their way to school, work or the market.",
        "zh": "一排排房子，許多家庭住在這裡。每天，很多鄰居上學、上班或去市場時，都會經過小廟。"
      },
      "road": {
        "en": "The road links the homes, the market and the temple. Scooters, cars and people move along it all day long.",
        "zh": "道路把住家、市場和小廟連在一起。機車、汽車和行人整天都在這裡來來往往。"
      },
      "market": {
        "en": "Stalls sell food and everyday things, and neighbors stop to eat and chat. After shopping, many of them walk past the temple.",
        "zh": "攤位賣吃的和日常用品，鄰居們在這裡吃東西、聊天。逛完市場，很多人會順路經過小廟。"
      },
      "park": {
        "en": "A big banyan tree gives cool shade. Neighbors rest, play and meet here, close to the small temple.",
        "zh": "大榕樹帶來涼爽的樹蔭。鄰居們在這裡休息、玩耍、聚會，離小廟很近。"
      },
      "street": {
        "en": "The whole street corner in 3D. Find the small temple where the homes, the street and the market all meet.",
        "zh": "立體的整個街角。找一找住家、街道和市場交會處的小廟。"
      }
    },
    "nodeNote": {
      "en": "The small temple sits where homes, the street, and the market come together, so it becomes a landmark and a meeting place for the neighborhood.",
      "zh": "小廟正好位在住家、街道與市場交會的地方，因此成為街坊的地標與聚集點。"
    },
    "chips": [
      {
        "en": "Local Temple",
        "zh": "地方廟宇／小廟"
      },
      {
        "en": "Neighborhood",
        "zh": "街坊／社區"
      }
    ],
    "narration": {
      "en": "In Kaohsiung and many other parts of Taiwan, a Tudigong temple does not have to be large. Some stand on street corners or beside roads, and others sit inside neighborhoods. These small temples are places of belief, but they can also become local landmarks that keep community memory.",
      "zh": "在高雄以及臺灣許多地方，土地公廟不一定很大。有些位在街角或路旁，有些就藏身在社區之中。這些小廟是信仰的場所，也可能成為保存社區記憶的地方地標。"
    }
  },
  "p06": {
    "guide": {
      "en": "Slide the timeline slowly from Past to Present, and watch how the land changes. Then look for the cultural clues that stayed the same.",
      "zh": "把時間軸慢慢從過去滑到現在，看看土地怎麼改變。然後找一找，哪些文化線索一直沒有改變。"
    },
    "eyebrow": {
      "en": "P06 · Scene 2",
      "zh": "P06 · 場景二"
    },
    "heading": {
      "en": "From Fields to Neighborhoods: How Does Land Use Change?",
      "zh": "從田野到街坊：土地利用如何改變？"
    },
    "past": {
      "en": "Past",
      "zh": "過去"
    },
    "present": {
      "en": "Present",
      "zh": "現在"
    },
    "pastAndPresent": {
      "en": "Past and Present",
      "zh": "過去與現在"
    },
    "layers": {
      "fields": {
        "en": "Fields",
        "zh": "田地"
      },
      "settlement": {
        "en": "Settlement",
        "zh": "聚落"
      },
      "homes": {
        "en": "Homes",
        "zh": "住家"
      },
      "business": {
        "en": "Local Businesses",
        "zh": "在地商家"
      }
    },
    "compare": {
      "en": "Compare Land Use",
      "zh": "比較土地利用"
    },
    "findClues": {
      "en": "Find Cultural Clues",
      "zh": "尋找文化線索"
    },
    "clueNote": {
      "en": "The land around it has changed, but the small temple has stayed in or near the same spot. Places like this hold on to cultural memory.",
      "zh": "周圍的土地改變了，小廟卻仍留在原處或附近。這樣的地方保存了文化記憶。"
    },
    "clueNotes": {
      "temple": {
        "en": "The land around it has changed, but the small temple has stayed in or near the same spot. Places like this hold on to cultural memory.",
        "zh": "周圍的土地改變了，小廟卻仍留在原處或附近。這樣的地方保存了文化記憶。"
      },
      "tree": {
        "en": "Fields became streets, but the old banyan tree still stands beside the small temple. In many Kaohsiung neighborhoods, people gather and rest under trees like this one. Over time, the tree becomes part of cultural memory.",
        "zh": "田地變成了街道，老榕樹依然立在小廟旁。在高雄許多街坊，人們常在這樣的老樹下相聚、休息。久而久之，老樹也成了文化記憶的一部分。"
      }
    },
    "task1": {
      "en": "Slide from Past to Present",
      "zh": "從過去滑到現在"
    },
    "task2": {
      "en": "Select a Cultural Clue",
      "zh": "選出一個文化線索"
    },
    "pins": {
      "temple": {
        "en": "Small Temple",
        "zh": "小廟"
      },
      "tree": {
        "en": "Old Tree",
        "zh": "老樹"
      }
    },
    "timeline": {
      "en": "Timeline",
      "zh": "時間軸"
    },
    "slideHint": {
      "en": "Drag the timeline from Past to Present and watch the land change.",
      "zh": "把時間軸從過去拖到現在，看看土地怎麼改變。"
    },
    "reached": {
      "en": "This is the neighborhood today. What stayed the same?",
      "zh": "這是今天的街坊。哪些東西沒有改變？"
    },
    "clueHint": {
      "en": "Tap the small temple or the old tree.",
      "zh": "點選小廟或老樹。"
    },
    "notYet": {
      "en": "First slide all the way from Past to Present.",
      "zh": "先把時間軸從過去一路滑到現在。"
    },
    "complete": {
      "en": "Land-Use Task Complete",
      "zh": "土地利用任務完成"
    },
    "chips": [
      {
        "en": "Farming Life",
        "zh": "農業生活"
      },
      {
        "en": "Cultural Memory",
        "zh": "文化記憶"
      }
    ],
    "narration": {
      "en": "Tudigong culture has long been tied to fields, settlements, and life on the land. As parts of Kaohsiung changed, some fields became roads, homes, or business districts, yet some small temples stayed in or near their original locations. Comparing maps of the past and present helps us read how a place has changed and what cultural memory it keeps.",
      "zh": "土地公文化長久以來與田野、聚落和土地上的生活緊密相連。隨著高雄部分地區的變遷，有些田地變成了道路、住家或商業區，但也有些小廟仍留在原本的位置或附近。比較過去與現在的地圖，能幫助我們解讀地方的變化，以及其中保留的文化記憶。"
    }
  },
  "p07": {
    "guide": {
      "en": "Scroll down to learn what to look for. Then tap each object to look closely, and match the meaning cards.",
      "zh": "往下滑，認識觀察的重點。接著點一點每個物件仔細看，再配對意義卡。"
    },
    "eyebrow": {
      "en": "P07 · Scene 3",
      "zh": "P07 · 場景三"
    },
    "heading": {
      "en": "Cultural Objects and Landscape",
      "zh": "文化物件與地景"
    },
    "objects": {
      "temple": {
        "label": {
          "en": "Small Temple",
          "zh": "小廟"
        },
        "tap": {
          "en": "Tap the Small Temple",
          "zh": "點選小廟"
        },
        "meaning": {
          "en": "A local landmark and community node",
          "zh": "地方地標與社區節點"
        },
        "note": {
          "en": "Many Tudigong temples are small, one-room buildings with curved tile roofs. They stand beside lanes, street corners, or fields, close to where people live.",
          "zh": "許多土地公廟是只有一個房間的小建築，屋頂是彎曲的瓦片。它們位在巷口、街角或田邊，就在人們生活的地方旁邊。"
        },
        "hint": {
          "en": "Hint: Which object helps people find their way in a neighborhood?",
          "zh": "提示：哪個物件能幫人在街坊中認路？"
        }
      },
      "table": {
        "label": {
          "en": "Offering Table",
          "zh": "供桌"
        },
        "tap": {
          "en": "Tap the Offering Table",
          "zh": "點選供桌"
        },
        "meaning": {
          "en": "Shows local life and festival preparation",
          "zh": "呈現地方生活與節慶準備"
        },
        "note": {
          "en": "The offering table stands in front of the shrine. Before festivals, neighbors get it ready together, so it tells us about local life and festival preparation.",
          "zh": "供桌放在神龕前方。節慶前，街坊會一起準備，因此它能讓我們認識地方生活與節慶準備。"
        },
        "hint": {
          "en": "Hint: Which object is used when people get ready for a festival?",
          "zh": "提示：哪個物件和節慶準備有關？"
        }
      },
      "lions": {
        "label": {
          "en": "Stone Lions",
          "zh": "石獅"
        },
        "tap": {
          "en": "Tap the Stone Lions",
          "zh": "點選石獅"
        },
        "meaning": {
          "en": "A symbol connected with temple architecture",
          "zh": "與廟宇建築相關的象徵"
        },
        "note": {
          "en": "Stone lions often sit in pairs at a temple entrance. One usually rests a paw on a ball, and the other holds a small cub. They are part of temple architecture.",
          "zh": "石獅常成對坐在廟門口。通常一隻腳踩著繡球，另一隻護著小獅子。它們是廟宇建築的一部分。"
        },
        "hint": {
          "en": "Hint: Which object is part of the temple building?",
          "zh": "提示：哪個物件是廟宇建築的一部分？"
        }
      },
      "tree": {
        "label": {
          "en": "Old Tree",
          "zh": "老樹"
        },
        "tap": {
          "en": "Observe the Old Tree",
          "zh": "觀察老樹"
        },
        "meaning": {
          "en": "Part of the cultural landscape and cultural memory",
          "zh": "文化地景與文化記憶的一部分"
        },
        "note": {
          "en": "Big banyan trees often give shade beside small temples, and neighbors chat and rest under them. Not every old tree is linked to Tudigong, but many are local landmarks.",
          "zh": "大榕樹常在小廟旁帶來樹蔭，街坊會在樹下聊天、休息。不是每棵老樹都和土地公有關，但許多老樹是地方地標。"
        },
        "hint": {
          "en": "Hint: Which one is part of nature and gives shade?",
          "zh": "提示：哪個是大自然的一部分，還能遮陽？"
        }
      }
    },
    "match": {
      "en": "Match Cultural Meanings",
      "zh": "配對文化意義"
    },
    "task1": {
      "en": "Observe at least 3 objects",
      "zh": "觀察至少 3 個物件"
    },
    "task2": {
      "en": "Match the meanings",
      "zh": "完成意義配對"
    },
    "complete": {
      "en": "Object Task Complete",
      "zh": "物件任務完成"
    },
    "narration": {
      "en": "When observing a Tudigong temple, we can look beyond the deity image and notice the building and the area around it. The small temple, the offering table, and the stone lions can all be part of a cultural landscape. In some places, an old tree nearby is part of it too.",
      "zh": "觀察土地公廟時，我們可以把目光放到神像以外，留意建築本身和周圍的環境。小廟、供桌和石獅，都可以是文化地景的一部分。在有些地方，附近的老樹也是其中之一。"
    },
    "gallery": {
      "en": "Neighborhood Temple Gallery",
      "zh": "街坊小廟展"
    },
    "exhibit": {
      "en": "Exhibit",
      "zh": "展品"
    },
    "tapToLook": {
      "en": "Tap to look closely",
      "zh": "點一下仔細看"
    },
    "matchIntro": {
      "en": "Drag each meaning card to the object it describes. You can also tap a card, then tap an object.",
      "zh": "把每張意義卡拖到它描述的物件上；也可以先點卡片，再點物件。"
    },
    "matchUnlock": {
      "en": "Great observing! Now match the cultural meanings.",
      "zh": "觀察得真仔細！現在來配對文化意義。"
    },
    "moreToSee": {
      "en": "Look at one more object to unlock the matching task.",
      "zh": "再觀察一個物件，就能開始配對。"
    },
    "meaningTitle": {
      "en": "Cultural Meanings",
      "zh": "文化意義"
    },
    "arOpen": {
      "en": "View in AR",
      "zh": "用 AR 看看"
    },
    "landscapeTitle": {
      "en": "Together, They Make a Cultural Landscape",
      "zh": "它們一起構成文化地景"
    },
    "landscapeNote": {
      "en": "A small temple, an offering table, a pair of stone lions and an old tree: together with the people who meet here, they make a place full of local memory.",
      "zh": "一座小廟、一張供桌、一對石獅和一棵老樹，加上在這裡相聚的人們，就成了充滿地方記憶的地方。"
    },
    "arLandscape": {
      "en": "View the Landscape in AR",
      "zh": "用 AR 看整個地景"
    },
    "seeLandscape": {
      "en": "See the Landscape",
      "zh": "看看整個地景"
    },
    "chips": [
      {
        "en": "Cultural Landscape",
        "zh": "文化地景"
      },
      {
        "en": "Local Temple",
        "zh": "地方廟宇／小廟"
      }
    ],
    "skipStay": {
      "en": "Keep Exploring",
      "zh": "繼續探索"
    },
    "backToExhibits": {
      "en": "Back to the Exhibits",
      "zh": "回到展品"
    },
    "unlockHint": {
      "en": "Look closely at 3 objects to unlock the meaning cards.",
      "zh": "仔細看 3 個物件，就能打開意義卡。"
    },
    "dropHere": {
      "en": "Place a meaning here",
      "zh": "把意義卡放這裡"
    },
    "intro": {
      "en": "A small temple is more than a building. Let's look at what stands around it.",
      "zh": "小廟不只是一棟建築。一起來看看它的周圍有些什麼。"
    },
    "plan": [
      {
        "en": "Read 3 short cards about what to look for",
        "zh": "讀 3 張小卡，認識觀察重點"
      },
      {
        "en": "Look closely at 4 objects and match their meanings",
        "zh": "仔細看 4 個物件，配對它們的意義"
      },
      {
        "en": "See the whole landscape and earn a badge",
        "zh": "看見整個地景，獲得徽章"
      }
    ],
    "learnTitle": {
      "en": "What to look for",
      "zh": "觀察重點"
    },
    "learn": [
      {
        "title": {
          "en": "Look beyond the deity image",
          "zh": "把目光放到神像以外"
        },
        "text": {
          "en": "When we observe a Tudigong temple, we can look beyond the deity image and notice the building and the area around it.",
          "zh": "觀察土地公廟時，我們可以把目光放到神像以外，留意建築本身和周圍的環境。"
        },
        "img": "p07_obj_temple.webp"
      },
      {
        "title": {
          "en": "Objects make a landscape",
          "zh": "物件構成地景"
        },
        "text": {
          "en": "The small temple, the offering table and the stone lions can all be part of a cultural landscape. In some places, an old tree nearby is part of it too.",
          "zh": "小廟、供桌和石獅，都可以是文化地景的一部分。在有些地方，附近的老樹也是其中之一。"
        },
        "img": "p07_obj_lions.webp"
      },
      {
        "title": {
          "en": "Words to know",
          "zh": "認識詞彙"
        },
        "vocab": [
          "cultural landscape",
          "local temple"
        ],
        "text": {
          "en": "Tap a word to see its card.",
          "zh": "點一下詞彙，看看詞彙卡。"
        },
        "img": "p07_obj_tree.webp"
      }
    ],
    "doTitle": {
      "en": "Look closely, then match",
      "zh": "仔細看，再配對"
    },
    "doIntro": {
      "en": "Tap each object to learn what it shows. After three, the meaning cards turn over: drag each one onto its object.",
      "zh": "點選每個物件，看看它代表什麼。看完三個，意義卡就會翻開：把每張卡拖到對應的物件上。"
    },
    "cardBack": {
      "en": "Meaning card",
      "zh": "意義卡"
    },
    "badgeTitle": {
      "en": "The whole landscape",
      "zh": "整個地景"
    },
    "badgeLocked": {
      "en": "Match all four meanings to see the whole landscape and earn your badge.",
      "zh": "完成四個意義配對，就能看見整個地景，並獲得徽章。"
    }
  },
  "p08": {
    "guide": {
      "en": "Open the map. Put at least four places in the neighborhood, then tap them in order to build a cultural route.",
      "zh": "打開地圖。在街坊放上至少四個地點，再依序點選它們，建立一條文化路線。"
    },
    "eyebrow": {
      "en": "P08 · Scene 4",
      "zh": "P08 · 場景四"
    },
    "heading": {
      "en": "From Kaohsiung to My Neighborhood",
      "zh": "從高雄到我的街坊"
    },
    "open": {
      "en": "Open Kaohsiung Community Map",
      "zh": "打開高雄社區地圖"
    },
    "nodes": {
      "school": {
        "en": "School",
        "zh": "學校"
      },
      "homes": {
        "en": "Homes",
        "zh": "住家"
      },
      "market": {
        "en": "Market",
        "zh": "市場"
      },
      "park": {
        "en": "Park and Old Tree",
        "zh": "公園與老樹"
      },
      "temple": {
        "en": "Local Temple",
        "zh": "地方廟宇"
      },
      "oldStreet": {
        "en": "Old Street",
        "zh": "老街"
      }
    },
    "buildRoute": {
      "en": "Build a Cultural Route",
      "zh": "建立文化路線"
    },
    "finishRoute": {
      "en": "Finish Route",
      "zh": "完成路線"
    },
    "task1": {
      "en": "Place at least 4 places",
      "zh": "放上至少 4 個地點"
    },
    "task2": {
      "en": "Connect a route",
      "zh": "連成一條路線"
    },
    "reflect": {
      "en": "Which places in your neighborhood belong on a community culture map?",
      "zh": "你的街坊中，哪些地方應該出現在社區文化地圖上？"
    },
    "narration": {
      "en": "Local culture lives in more than one building. This simple community culture map of Kaohsiung shows how schools, homes, markets, parks, old trees, and local temples come together in everyday life. Now think about your own neighborhood: which places belong on a community culture map?",
      "zh": "地方文化不只存在於一棟建築裡。這張簡化的高雄社區文化地圖，呈現了學校、住家、市場、公園、老樹與地方廟宇如何在日常生活中連結在一起。現在想一想你自己的街坊：哪些地方應該出現在社區文化地圖上？"
    },
    "kaohsiung": {
      "en": "Kaohsiung",
      "zh": "高雄"
    },
    "strait": {
      "en": "Taiwan Strait",
      "zh": "臺灣海峽"
    },
    "harbor": {
      "en": "Kaohsiung Harbor",
      "zh": "高雄港"
    },
    "loveRiver": {
      "en": "Love River",
      "zh": "愛河"
    },
    "myNeighborhood": {
      "en": "My Neighborhood",
      "zh": "我的街坊"
    },
    "openPrompt": {
      "en": "This is Kaohsiung. Open the map to zoom in to a neighborhood.",
      "zh": "這是高雄。打開地圖，放大來看一個街坊。"
    },
    "placePrompt": {
      "en": "Drag a place card to an empty spot on the map, or tap a card and then a spot.",
      "zh": "把地點卡片拖到地圖上的空位，或先點卡片再點空位。"
    },
    "emptyLot": {
      "en": "Empty lot",
      "zh": "空地"
    },
    "nodeNotes": {
      "school": {
        "en": "Schools bring children and families together every day.",
        "zh": "學校每天把孩子和家庭聚在一起。"
      },
      "homes": {
        "en": "Homes are where neighbors live side by side.",
        "zh": "住家是街坊鄰居比鄰而居的地方。"
      },
      "market": {
        "en": "Markets are where neighbors shop, talk, and share news.",
        "zh": "市場是街坊買東西、聊天、交換消息的地方。"
      },
      "park": {
        "en": "People rest and meet in the shade of old trees.",
        "zh": "人們在老樹的樹蔭下休息、相聚。"
      },
      "temple": {
        "en": "A small temple can be a landmark and a meeting place.",
        "zh": "小廟可以是地標，也是聚集的地方。"
      },
      "oldStreet": {
        "en": "Old streets keep shops and stories from the past.",
        "zh": "老街保留了過去的商店與故事。"
      }
    },
    "canRoute": {
      "en": "Great! Now you can build a cultural route.",
      "zh": "很好！現在可以建立文化路線了。"
    },
    "allPlaced": {
      "en": "All six places are on the map!",
      "zh": "六個地點都放上地圖了！"
    },
    "routeIntro": {
      "en": "Tap the places in the order you want to visit them.",
      "zh": "依照你想走訪的順序點選地點。"
    },
    "routeNeedMore": {
      "en": "Connect at least 4 places to finish your route.",
      "zh": "至少連接 4 個地點才能完成路線。"
    },
    "routeAlready": {
      "en": "This place is already on your route.",
      "zh": "這個地點已經在路線上了。"
    },
    "complete": {
      "en": "Route Complete!",
      "zh": "路線完成！"
    },
    "myRoute": {
      "en": "My Cultural Route",
      "zh": "我的文化路線"
    },
    "reflectLabel": {
      "en": "Think About It",
      "zh": "想一想"
    },
    "chips": [
      {
        "en": "Community Map",
        "zh": "社區地圖"
      },
      {
        "en": "Neighborhood",
        "zh": "街坊／社區"
      }
    ],
    "skipStay": {
      "en": "Keep Building",
      "zh": "繼續建立"
    },
    "rivers": {
      "en": "Rivers",
      "zh": "河流"
    },
    "canFinish": {
      "en": "You can finish now, or add more stops.",
      "zh": "現在可以完成，也可以再加幾站。"
    },
    "editRoute": {
      "en": "Change the Route",
      "zh": "修改路線"
    },
    "viewAR": {
      "en": "View in AR",
      "zh": "用 AR 看看"
    }
  },
  "p09": {
    "guide": {
      "en": "Match zuoya, Touya and Weiya with their dates, and watch the lunar calendar light up.",
      "zh": "把做牙、頭牙和尾牙和它們的日期配對起來，看看農曆月曆怎麼亮起來。"
    },
    "eyebrow": {
      "en": "P09 · Scene 5",
      "zh": "P09 · 場景五"
    },
    "heading": {
      "en": "Touya and Weiya: Tudigong Culture and the Rhythm of Everyday Life",
      "zh": "頭牙與尾牙：土地公文化與日常生活的節奏"
    },
    "terms": {
      "zuoya": {
        "label": {
          "en": "Zuoya",
          "zh": "做牙"
        },
        "learn": {
          "en": "Learn Zuoya",
          "zh": "認識做牙"
        },
        "answer": {
          "en": "The 2nd and 16th days of each lunar month",
          "zh": "每個農曆月的初二與十六"
        }
      },
      "touya": {
        "label": {
          "en": "Touya",
          "zh": "頭牙"
        },
        "learn": {
          "en": "Learn Touya",
          "zh": "認識頭牙"
        },
        "answer": {
          "en": "The 2nd day of the 2nd lunar month",
          "zh": "農曆二月初二"
        }
      },
      "weiya": {
        "label": {
          "en": "Weiya",
          "zh": "尾牙"
        },
        "learn": {
          "en": "Learn Weiya",
          "zh": "認識尾牙"
        },
        "answer": {
          "en": "The 16th day of the 12th lunar month, now also a year-end company dinner",
          "zh": "農曆十二月十六，現在也指公司年終聚餐"
        }
      }
    },
    "matchCalendar": {
      "en": "Match the Calendar",
      "zh": "配對日期"
    },
    "chips": [
      {
        "en": "Zuoya",
        "zh": "做牙"
      },
      {
        "en": "Touya",
        "zh": "頭牙"
      },
      {
        "en": "Weiya",
        "zh": "尾牙"
      }
    ],
    "complete": {
      "en": "Culture Match Complete",
      "zh": "文化配對完成"
    },
    "task": {
      "en": "Match all 3 terms",
      "zh": "完成 3 個詞彙配對"
    },
    "narration": {
      "en": "In traditional Taiwanese folk culture, zuoya is observed on the second and sixteenth days of each lunar month. The second day of the second lunar month is called Touya, and the sixteenth day of the twelfth lunar month is called Weiya. Over time, Weiya has also become the everyday word for a company's year-end dinner.",
      "zh": "在臺灣傳統民間文化中，每個農曆月的初二與十六都有「做牙」的習俗。農曆二月初二稱為「頭牙」，十二月十六則稱為「尾牙」。隨著時間演變，「尾牙」也成為公司年終聚餐的常見說法。"
    },
    "calendarTitle": {
      "en": "Match the Calendar",
      "zh": "配對日期"
    },
    "months": [
      {
        "en": "1",
        "zh": "正月"
      },
      {
        "en": "2",
        "zh": "二月"
      },
      {
        "en": "3",
        "zh": "三月"
      },
      {
        "en": "4",
        "zh": "四月"
      },
      {
        "en": "5",
        "zh": "五月"
      },
      {
        "en": "6",
        "zh": "六月"
      },
      {
        "en": "7",
        "zh": "七月"
      },
      {
        "en": "8",
        "zh": "八月"
      },
      {
        "en": "9",
        "zh": "九月"
      },
      {
        "en": "10",
        "zh": "十月"
      },
      {
        "en": "11",
        "zh": "十一月"
      },
      {
        "en": "12",
        "zh": "十二月"
      }
    ],
    "monthWord": {
      "en": "Month",
      "zh": "月"
    },
    "day2": {
      "en": "2nd",
      "zh": "初二"
    },
    "day16": {
      "en": "16th",
      "zh": "十六"
    },
    "yaDay": {
      "en": "ya day",
      "zh": "牙日"
    },
    "termsTitle": {
      "en": "Terms",
      "zh": "詞彙"
    },
    "answersTitle": {
      "en": "Dates and Meanings",
      "zh": "日期與意義"
    },
    "matchIntro": {
      "en": "Tap a word, then tap the date or meaning that matches it.",
      "zh": "先點詞彙，再點相配的日期或意義。"
    },
    "hints": {
      "zuoya": {
        "en": "Hint: Zuoya happens twice every month.",
        "zh": "提示：做牙每個月有兩次。"
      },
      "touya": {
        "en": "Hint: \"Tou\" means \"head\" or \"first.\"",
        "zh": "提示：「頭」就是第一個。"
      },
      "weiya": {
        "en": "Hint: \"Wei\" means \"tail\" or \"last.\"",
        "zh": "提示：「尾」就是最後一個。"
      }
    },
    "notes": {
      "zuoya": {
        "en": "Zuoya happens twice every lunar month, on the 2nd and the 16th. It is part of Taiwan's traditional calendar.",
        "zh": "做牙每個農曆月有兩次：初二與十六。它是臺灣傳統曆法的一部分。"
      },
      "touya": {
        "en": "Touya is the first zuoya of the year. Some shops and companies share a meal with their staff around this time.",
        "zh": "頭牙是一年中的第一個做牙，有些商家和公司會在這時候和員工一起聚餐。"
      },
      "weiya": {
        "en": "Weiya is the last zuoya of the year. Today, many people use the word for a company's year-end dinner.",
        "zh": "尾牙是一年中最後一個做牙。現在，許多人用這個詞指公司的年終聚餐。"
      }
    },
    "captions": {
      "zuoya": {
        "en": "Two ya days in every lunar month",
        "zh": "每個農曆月有兩個牙日"
      },
      "touya": {
        "en": "Family shops on a shopping street",
        "zh": "商店街上的家庭商店"
      },
      "weiya": {
        "en": "A year-end company meal",
        "zh": "公司的年終聚餐"
      }
    },
    "context": {
      "business": {
        "title": {
          "en": "Local Business Culture",
          "zh": "在地商業文化"
        },
        "text": {
          "en": "Many family shops in Taiwan have kept the ya days for generations. The ya days follow the rhythm of a working year, from Touya to Weiya.",
          "zh": "臺灣許多家庭商店世代都記得牙日。牙日跟著一整年的工作節奏，從頭牙一路到尾牙。"
        }
      },
      "language": {
        "title": {
          "en": "Everyday Language",
          "zh": "日常用語"
        },
        "text": {
          "en": "Weiya is now an everyday word: people say \"our company's Weiya\" for the year-end party. The phrase 打牙祭 means \"to treat yourself to a good meal.\"",
          "zh": "「尾牙」已經是日常用語：大家會說「公司的尾牙」來指年終聚餐。「打牙祭」則是「好好吃一頓」的意思。"
        }
      }
    },
    "contextPrompt": {
      "en": "Tap a card to see how ya days live on today.",
      "zh": "點一張卡片，看看牙日如何延續到今天。"
    },
    "skipStay": {
      "en": "Keep Matching",
      "zh": "繼續配對"
    },
    "everyMonth": {
      "en": "Every month",
      "zh": "每個月"
    },
    "yearArc": {
      "en": "A working year: from Touya to Weiya",
      "zh": "一整年的工作節奏：從頭牙到尾牙"
    },
    "dropHere": {
      "en": "Place a term here",
      "zh": "把詞彙放這裡"
    },
    "viewAR": {
      "en": "View in AR",
      "zh": "用 AR 看看"
    }
  },
  "p10": {
    "guide": {
      "en": "Now let's travel to Meinong, a Hakka community in Kaohsiung. Match three cards to find out what Tudigong, Bogong and fuchang mean.",
      "zh": "現在我們出發到高雄的客家社區美濃。把三張卡片配對起來，看看土地公、伯公和福廠各是什麼意思。"
    },
    "eyebrow": {
      "en": "P10 · Scene 6",
      "zh": "P10 · 場景六"
    },
    "heading": {
      "en": "Bogong in Meinong: One Belief, Different Local Expressions",
      "zh": "美濃的伯公：同一信仰，不同的在地表現"
    },
    "place": {
      "en": "Meinong, Kaohsiung",
      "zh": "高雄美濃"
    },
    "concepts": {
      "tudigong": {
        "label": {
          "en": "Tudigong",
          "zh": "土地公"
        },
        "meaning": {
          "en": "A common name in many places in Taiwan (Fude Zhengshen)",
          "zh": "臺灣許多地方常見的稱呼（福德正神）"
        }
      },
      "bogong": {
        "label": {
          "en": "Bogong",
          "zh": "伯公"
        },
        "meaning": {
          "en": "A Hakka name often used in Meinong",
          "zh": "美濃等客家社區常用的稱呼"
        }
      },
      "fuchang": {
        "label": {
          "en": "Fuchang Case",
          "zh": "福廠案例"
        },
        "meaning": {
          "en": "A special festival space in Yong'an, Meinong, not a name for every Tudigong temple",
          "zh": "美濃永安特有的節慶空間，不是所有土地公廟的通稱"
        }
      }
    },
    "localCulture": {
      "en": "Local Culture",
      "zh": "在地文化"
    },
    "compare": {
      "en": "Compare Cultural Expressions",
      "zh": "比較文化表現"
    },
    "complete": {
      "en": "Local Culture Task Complete",
      "zh": "在地文化任務完成"
    },
    "task": {
      "en": "Match all 3 concepts",
      "zh": "完成 3 個概念配對"
    },
    "credit": {
      "en": "Source: Kaohsiung Museum of History",
      "zh": "資料來源：高雄市立歷史博物館"
    },
    "narration": {
      "en": "In Hakka communities such as Meinong in Kaohsiung, Tudigong is often called Bogong. Local language, history, and community life have given Bogong traditions their own local style. In the Yong'an area of Meinong, a fuchang is a special space or structure for a local festival. It is not just another name for a Tudigong temple.",
      "zh": "在高雄美濃等客家社區，土地公常被稱為「伯公」。在地的語言、歷史與社區生活，讓伯公傳統有了自己的在地特色。在美濃永安地區，「福廠」是當地節慶使用的特別空間或結構，並不是土地公廟的另一個名稱。"
    },
    "chips": [
      {
        "en": "Bogong",
        "zh": "伯公"
      },
      {
        "en": "Fuchang",
        "zh": "福廠"
      }
    ],
    "chipLabels": [
      {
        "en": "Local Culture",
        "zh": "在地文化"
      },
      {
        "en": "Fuchang",
        "zh": "福廠"
      }
    ],
    "kaohsiung": {
      "en": "Kaohsiung",
      "zh": "高雄"
    },
    "downtown": {
      "en": "Downtown Kaohsiung",
      "zh": "高雄市區"
    },
    "mapPrompt": {
      "en": "Tap the pin to learn about Meinong.",
      "zh": "點一下圖釘，認識美濃。"
    },
    "meinongNote": {
      "en": "Meinong is a Hakka farming community at the foot of green mountains in Kaohsiung. It is known for rice fields, old tobacco-curing barns and oil-paper umbrellas.",
      "zh": "美濃位在高雄的青山腳下，是一個客家農業社區，以稻田、老菸樓和油紙傘聞名。"
    },
    "meinongTitle": {
      "en": "Meinong",
      "zh": "美濃"
    },
    "artCaption": {
      "en": "Illustration inspired by Meinong's farmland",
      "zh": "以美濃田園為靈感的插畫"
    },
    "matchIntro": {
      "en": "Tap a concept card, then tap the meaning that matches it.",
      "zh": "先點概念卡，再點相配的意思。"
    },
    "conceptsTitle": {
      "en": "Concepts",
      "zh": "概念"
    },
    "meaningsTitle": {
      "en": "Meanings",
      "zh": "意思"
    },
    "notes": {
      "tudigong": {
        "en": "Tudigong is the name used in many places across Taiwan. His formal title is Fude Zhengshen. 土地 means \"land,\" and 公 is a respectful word for an older man.",
        "zh": "臺灣許多地方都稱祂為「土地公」，正式名稱是「福德正神」。名稱裡的「公」，是對年長男性的尊稱。"
      },
      "bogong": {
        "en": "In Hakka, Bogong is also a family word for a great-uncle. Calling Tudigong \"Bogong\" makes him feel like an elder in the family. One study counted about 380 Bogong shrines in Meinong.",
        "zh": "在客家話裡，「伯公」也是對家族長輩（爸爸的伯父）的稱呼。把土地公叫作伯公，就像把祂當成家中的長輩。有研究統計，美濃約有 380 座伯公。"
      },
      "fuchang": {
        "en": "A fuchang is a festival space that people in Yong'an, Meinong, build together every year. It is a space for a festival, not a temple, so Tudigong temples are not called \"fuchang.\"",
        "zh": "福廠是美濃永安的居民每年一起搭建的節慶空間。它是節慶用的場地，不是廟，所以土地公廟並不叫「福廠」。"
      }
    },
    "hints": {
      "tudigong": {
        "en": "Hint: Which name do people use all over Taiwan?",
        "zh": "提示：臺灣各地最常用的是哪一個稱呼？"
      },
      "bogong": {
        "en": "Hint: Bogong is a word from the Hakka language.",
        "zh": "提示：「伯公」是客家話的稱呼。"
      },
      "fuchang": {
        "en": "Hint: A fuchang is a place, not a name for Tudigong.",
        "zh": "提示：福廠是一個地方，不是土地公的稱呼。"
      }
    },
    "comparePrompt": {
      "en": "Great matching! Tap Compare Cultural Expressions to see the two names side by side.",
      "zh": "配對完成！點「比較文化表現」，看看兩個稱呼有什麼異同。"
    },
    "compareSub": {
      "en": "One belief, different local expressions",
      "zh": "同一信仰，不同的在地表現"
    },
    "rows": [
      {
        "q": {
          "en": "Who uses this name?",
          "zh": "誰這樣稱呼？"
        },
        "tudigong": {
          "en": "Many communities across Taiwan",
          "zh": "臺灣各地許多社區"
        },
        "bogong": {
          "en": "Hakka communities, such as Meinong",
          "zh": "美濃等客家社區"
        }
      },
      {
        "q": {
          "en": "What does the name mean?",
          "zh": "名稱的意思"
        },
        "tudigong": {
          "en": "土地 \"land\" + 公, a respectful word for an older man",
          "zh": "「土地」加上對年長男性的尊稱「公」"
        },
        "bogong": {
          "en": "Also a family word for a great-uncle",
          "zh": "也是對家族長輩（爸爸的伯父）的稱呼"
        }
      },
      {
        "q": {
          "en": "What might you see?",
          "zh": "可能會看到什麼？"
        },
        "tudigong": {
          "en": "Small temples on street corners, beside fields and near markets",
          "zh": "街角、田邊與市場附近的小廟"
        },
        "bogong": {
          "en": "Many are simple shrines with only a stone or stone tablet, often with a big tree nearby",
          "zh": "許多樸素的伯公壇只有一塊石頭或石碑，旁邊常有大樹"
        }
      }
    ],
    "bothLine": {
      "en": "Both names are tied to land, farming and community life, close to where people live.",
      "zh": "兩個稱呼都與土地、農業和社區生活緊密相連，也都在人們生活的地方附近。"
    },
    "didYouKnow": {
      "en": "Did you know?",
      "zh": "你知道嗎？"
    },
    "didYouKnowText": {
      "en": "Hakka speakers often call a Bogong shrine and the shady space around it 伯公下 (\"Bogong's place\"). Neighbors rest, chat and drink tea there, so it works like a small community center.",
      "zh": "客家人常把伯公廟和周圍的空間叫作「伯公下」。鄰居們會在這裡休息、聊天、泡茶，就像一個小小的社區活動中心。"
    },
    "caseTitle": {
      "en": "A Local Case: Fuchang",
      "zh": "在地案例：福廠"
    },
    "caseText": {
      "en": "Every year, people in Yong'an, Meinong, build a fuchang together for a Hakka festival. It is used from the 25th day of the 12th lunar month to the Lantern Festival, the 15th day of the 1st lunar month. Traditional Hakka bayin music leads the way.",
      "zh": "每年，美濃永安的居民都會一起搭建福廠，作為客家節慶的場地，從農曆十二月二十五日一直使用到元宵節（正月十五日）。祭典由傳統的客家八音開道演奏。"
    },
    "caseStatus": {
      "en": "Kaohsiung City lists this festival as an official folk custom.",
      "zh": "這項祭典（瀰濃永安庄伯公福廠入年駕祭典）已是高雄市市定民俗。"
    },
    "caseReminder": {
      "en": "Remember: \"fuchang\" is the name of this local festival space. It is not another name for Tudigong temples.",
      "zh": "記住：「福廠」是這個在地節慶空間的名稱，不是土地公廟的另一個名字。"
    },
    "creditLink": {
      "en": "Read more",
      "zh": "了解更多"
    },
    "creditUrl": "https://www.khm.org.tw/tw/event/past/detail/338",
    "badge": {
      "en": "Local Variation",
      "zh": "在地差異"
    },
    "skipStay": {
      "en": "Keep Matching",
      "zh": "繼續配對"
    },
    "viewAR": {
      "en": "View in AR",
      "zh": "用 AR 看看"
    },
    "cardsTitle": {
      "en": "Meinong culture cards: tap one",
      "zh": "美濃文化卡：點一張看看"
    },
    "cards": {
      "settlement": {
        "title": {
          "en": "Hakka Settlement",
          "zh": "客家聚落"
        },
        "note": {
          "en": "A Hakka farmhouse with a front courtyard sits among rice fields at the foot of green mountains. Many families in Meinong have farmed here for generations.",
          "zh": "一座有禾埕的客家伙房，坐落在青山腳下的稻田之間。美濃許多家庭世代在這裡耕作。"
        }
      },
      "barn": {
        "title": {
          "en": "Tobacco Barn",
          "zh": "菸樓"
        },
        "note": {
          "en": "Meinong was once famous for growing tobacco. Tall barns like this one were used to dry the leaves, and many old barns still stand among the fields.",
          "zh": "美濃過去以種植菸草聞名。像這樣高高的菸樓用來烘乾菸葉，許多老菸樓至今仍立在田野間。"
        }
      },
      "bogong": {
        "title": {
          "en": "Bogong Shrine",
          "zh": "伯公壇"
        },
        "note": {
          "en": "Many Bogong shrines in Meinong are simple and open to the sky, by fields, roads and village entrances. Some have a small mound (化胎) behind them.",
          "zh": "美濃許多伯公壇樸素而開放，位在田邊、路旁或庄頭。有些伯公壇的後方有一個小土丘（化胎）。"
        },
        "caption": {
          "en": "This 3D model is an illustration made for this project, not a copy of a real shrine.",
          "zh": "這個 3D 模型是本專案製作的示意，並非真實伯公壇的複製。"
        }
      }
    }
  },
  "p11": {
    "guide": {
      "en": "Now it's your turn! Choose word cards to finish an English sentence about Tudigong and community culture. Take your time.",
      "zh": "現在輪到你了！選擇字卡，完成一句介紹土地公與社區文化的英文句子。慢慢來，不用急。"
    },
    "eyebrow": {
      "en": "P11 · Ending",
      "zh": "P11 · 結尾"
    },
    "heading": {
      "en": "Introduce Tudigong and Community Culture in English",
      "zh": "用英文介紹土地公與社區文化"
    },
    "starters": [
      {
        "en": "I learned that…",
        "zh": "我學到…"
      },
      {
        "en": "Tudigong culture connects…",
        "zh": "土地公文化連結了…"
      },
      {
        "en": "Community culture includes…",
        "zh": "社區文化包含…"
      },
      {
        "en": "In Meinong, Bogong…",
        "zh": "在美濃，伯公…"
      }
    ],
    "frames": [
      {
        "en": "Tudigong culture connects ___ and ___.",
        "zh": "土地公文化連結了＿＿與＿＿。",
        "options": [
          {
            "en": "land",
            "zh": "土地",
            "ok": true
          },
          {
            "en": "farming life",
            "zh": "農業生活",
            "ok": true
          },
          {
            "en": "neighborhoods",
            "zh": "街坊",
            "ok": true
          },
          {
            "en": "communities",
            "zh": "社區",
            "ok": true
          },
          {
            "en": "cultural memory",
            "zh": "文化記憶",
            "ok": true
          }
        ]
      },
      {
        "en": "A neighborhood temple can be part of ___.",
        "zh": "街坊的小廟可以是＿＿的一部分。",
        "options": [
          {
            "en": "a cultural landscape",
            "zh": "文化地景",
            "ok": true
          },
          {
            "en": "a community map",
            "zh": "社區地圖",
            "ok": true
          },
          {
            "en": "Weiya",
            "zh": "尾牙",
            "ok": false,
            "hint": {
              "en": "Not quite. Weiya is a date and a year-end meal, not a place.",
              "zh": "還差一點！尾牙是一個日子，也指年終聚餐，不是一個地方。"
            }
          }
        ]
      },
      {
        "en": "In Meinong, Tudigong is often called ___.",
        "zh": "在美濃，土地公常被稱為＿＿。",
        "options": [
          {
            "en": "Bogong",
            "zh": "伯公",
            "ok": true
          },
          {
            "en": "Fuchang",
            "zh": "福廠",
            "ok": false,
            "hint": {
              "en": "Not quite. A fuchang is a festival space in Yong'an, not a name for Tudigong.",
              "zh": "還差一點！福廠是永安的節慶空間，不是土地公的稱呼。"
            }
          },
          {
            "en": "Touya",
            "zh": "頭牙",
            "ok": false,
            "hint": {
              "en": "Not quite. Touya is a date: the 2nd day of the 2nd lunar month.",
              "zh": "還差一點！頭牙是一個日子：農曆二月初二。"
            }
          }
        ]
      }
    ],
    "complete": {
      "en": "Complete the English Sentence",
      "zh": "完成英文句子"
    },
    "again": {
      "en": "Experience Again",
      "zh": "再體驗一次"
    },
    "feedback": {
      "en": "Give Feedback",
      "zh": "給予回饋"
    },
    "listen": {
      "en": "Listen",
      "zh": "聆聽"
    },
    "narration": {
      "en": "On this journey, we started from everyday places in Kaohsiung and learned how Tudigong culture connects land, fields, street corners, markets, communities, and cultural memory. We also learned that in Meinong, Tudigong is called Bogong and has its own local traditions. Now, answer the core question in one English sentence.",
      "zh": "在這段旅程中，我們從高雄的日常場所出發，認識了土地公文化如何連結土地、田野、街角、市場、社區與文化記憶。我們也認識到，在美濃，土地公被稱為「伯公」，並有自己的在地傳統。現在，請用一句英文回答核心提問。"
    },
    "cardTitle": {
      "en": "Complete the English Sentence",
      "zh": "完成英文句子"
    },
    "instruction": {
      "en": "Choose a sentence. Tap a word card to fill the next blank. To change a word, tap the blank again.",
      "zh": "選一個句子，點字卡填入下一個空格。想換字，就再點一次那個空格。"
    },
    "tabs": [
      {
        "en": "Connections",
        "zh": "連結"
      },
      {
        "en": "Landscape",
        "zh": "地景"
      },
      {
        "en": "Meinong",
        "zh": "美濃"
      }
    ],
    "prompts": [
      {
        "en": "What does Tudigong culture bring together? Pick two different words.",
        "zh": "土地公文化連結了哪些事物？選兩個不同的詞。"
      },
      {
        "en": "What can a small temple in your neighborhood be part of?",
        "zh": "街坊裡的小廟可以是什麼的一部分？"
      },
      {
        "en": "What do Hakka communities in Meinong call Tudigong?",
        "zh": "美濃的客家社區怎麼稱呼土地公？"
      }
    ],
    "sameWord": {
      "en": "You already used this word. Choose a different one.",
      "zh": "這個詞已經用過了，換一個吧。"
    },
    "sentenceDone": {
      "en": "Sentence complete!",
      "zh": "句子完成了！"
    },
    "recaps": [
      {
        "en": "Fields, markets and street corners: Tudigong culture lives in everyday places.",
        "zh": "田野、市場和街角：土地公文化就在日常場所之中。"
      },
      {
        "en": "Small temples, stone lions and old trees can all be part of a cultural landscape.",
        "zh": "小廟、石獅和老樹，都可以是文化地景的一部分。"
      },
      {
        "en": "Bogong is the Hakka name. In Hakka, it is also a family word for a great-uncle.",
        "zh": "「伯公」是客家人的稱呼，在客家話裡也是對家族長輩的稱呼。"
      }
    ],
    "speakPrompt": {
      "en": "Tap Listen, then read your sentence aloud.",
      "zh": "點「聆聽」，再把句子大聲唸出來。"
    },
    "nextPrompt": {
      "en": "Try another sentence, or tap Next to see your results.",
      "zh": "再試一個句子，或點「下一步」看看你的成果。"
    },
    "taskDone": {
      "en": "Sentence Task Complete",
      "zh": "句子任務完成"
    },
    "badge": {
      "en": "Culture Introducer",
      "zh": "文化介紹員"
    },
    "startersTitle": {
      "en": "You can also say…",
      "zh": "你也可以這樣說…"
    },
    "startersTip": {
      "en": "Use these to make your own sentence with a classmate.",
      "zh": "和同學一起用這些開頭，說出你自己的句子。"
    },
    "task": {
      "en": "Complete 1 English sentence",
      "zh": "完成 1 個英文句子"
    },
    "listenSentence": {
      "en": "Listen",
      "zh": "聆聽"
    },
    "skipStay": {
      "en": "Keep Writing",
      "zh": "繼續造句"
    },
    "chips": [
      {
        "en": "Cultural Memory",
        "zh": "文化記憶"
      },
      {
        "en": "Bogong",
        "zh": "伯公"
      }
    ],
    "tapBlank": {
      "en": "To change a word, tap the blank first.",
      "zh": "想換字，先點一下那個空格。"
    },
    "goal": {
      "en": "Answer the core question in one English sentence, step by step.",
      "zh": "一步一步，用一句英文回答核心提問。"
    },
    "stepWord": {
      "en": "Step",
      "zh": "步驟"
    },
    "steps": [
      {
        "title": {
          "en": "Choose a sentence",
          "zh": "選一個句子"
        },
        "hint": {
          "en": "Tap one of the three sentences.",
          "zh": "點選三個句子中的一個。"
        }
      },
      {
        "title": {
          "en": "Fill in the blanks",
          "zh": "填入空格"
        },
        "hint": {
          "en": "Tap a word card to put it in the next blank. To take a word out, tap it in the sentence.",
          "zh": "點一張字卡，放進下一個空格。想拿出來，就點句子裡的那個字。"
        },
        "locked": {
          "en": "First choose a sentence in step 1.",
          "zh": "先在步驟 1 選一個句子。"
        }
      },
      {
        "title": {
          "en": "Listen and say it aloud",
          "zh": "聆聽，再大聲說出來"
        },
        "hint": {
          "en": "Tap Listen, then read your sentence aloud.",
          "zh": "點「聆聽」，再把句子大聲唸出來。"
        },
        "locked": {
          "en": "Finish the sentence in step 2 to open this step.",
          "zh": "完成步驟 2 的句子，就能打開這一步。"
        }
      }
    ]
  },
  "p12": {
    "guide": {
      "en": "Well done! You finished the journey. Look at your map, your badges and your sentences. Then think about the places in your own neighborhood.",
      "zh": "做得很好！你完成了這趟旅程。看看你的地圖、徽章和句子，再想一想你自己街坊裡的地方。"
    },
    "eyebrow": {
      "en": "P12 · Project Information",
      "zh": "P12 · 專案資訊"
    },
    "heading": {
      "en": "You Completed the Journey",
      "zh": "你完成了這趟旅程"
    },
    "sections": {
      "story": {
        "en": "Story Introduction",
        "zh": "故事簡介"
      },
      "reading": {
        "en": "Further Reading",
        "zh": "延伸閱讀"
      },
      "words": {
        "en": "Words You Learned Today",
        "zh": "今日學到的詞彙"
      },
      "myMap": {
        "en": "My Community Culture Map",
        "zh": "我的社區文化地圖"
      },
      "canIntroduce": {
        "en": "I Can Introduce Local Culture",
        "zh": "我能介紹在地文化"
      },
      "teacher": {
        "en": "Teacher Questions",
        "zh": "教師提問"
      },
      "feedback": {
        "en": "User Feedback",
        "zh": "使用者回饋"
      }
    },
    "again": {
      "en": "Experience Again",
      "zh": "再體驗一次"
    },
    "home": {
      "en": "Back to Home",
      "zh": "回到首頁"
    },
    "submit": {
      "en": "Submit",
      "zh": "送出"
    },
    "thanks": {
      "en": "Thank you for your feedback!",
      "zh": "謝謝你的回饋！"
    },
    "studentPrompt": {
      "en": "What places in your neighborhood can tell a local story?",
      "zh": "你的街坊中，有哪些地方能說出在地故事？"
    },
    "teacherPrompt": {
      "en": "How can AR help students connect everyday places with local cultural memory?",
      "zh": "AR 如何幫助學生把日常場所與在地文化記憶連結起來？"
    },
    "badges": {
      "node": {
        "en": "Community Node",
        "zh": "社區節點"
      },
      "clue": {
        "en": "Clue Finder",
        "zh": "線索發現者"
      },
      "landscape": {
        "en": "Landscape Observer",
        "zh": "地景觀察員"
      },
      "route": {
        "en": "Route Builder",
        "zh": "路線設計師"
      },
      "calendar": {
        "en": "Calendar Matcher",
        "zh": "日期配對員"
      },
      "local": {
        "en": "Local Variation",
        "zh": "在地差異"
      },
      "speaker": {
        "en": "Culture Introducer",
        "zh": "文化介紹員"
      }
    },
    "narration": {
      "en": "You have completed a bilingual AR journey through Tudigong belief, life on the land, local communities, cultural landscapes, zuoya culture, and Bogong culture in Meinong. Now let's return to the first question: why is Tudigong so often found close to everyday life? One answer is that the belief has become connected with land use, community relationships, and local memory.",
      "zh": "你已完成一段雙語 AR 旅程，認識了土地公信仰、土地上的生活、地方社區、文化地景、做牙文化，以及美濃的伯公文化。現在回到最初的問題：為什麼土地公常出現在日常生活附近？其中一個答案是：這份信仰逐漸與土地利用、社區關係和地方記憶連結在一起。"
    },
    "arrival": {
      "en": "Journey Complete!",
      "zh": "旅程完成！"
    },
    "recapLabel": {
      "en": "Back to the Core Inquiry",
      "zh": "回到核心提問"
    },
    "oneAnswer": {
      "en": "One answer: Tudigong culture grew together with farming, neighborhoods and markets, so small temples are often found where people live, work and meet.",
      "zh": "一個可能的答案：土地公文化和農業、街坊、市場一起發展，所以小廟常出現在人們生活、工作與相聚的地方。"
    },
    "yourAnswer": {
      "en": "What would your answer be?",
      "zh": "你的答案會是什麼？"
    },
    "mapCaption": {
      "en": "This is the cultural route you built in Scene 4.",
      "zh": "這是你在場景四建立的文化路線。"
    },
    "noRoute": {
      "en": "No route yet. You can build one in Scene 4: From Kaohsiung to My Neighborhood.",
      "zh": "還沒有路線。你可以到場景四「從高雄到我的街坊」建立一條。"
    },
    "goScene4": {
      "en": "Go to Scene 4",
      "zh": "前往場景四"
    },
    "badgesTitle": {
      "en": "My Badges",
      "zh": "我的徽章"
    },
    "badgeCount": {
      "en": "Badges earned: {n}/7",
      "zh": "已獲得徽章：{n}/7"
    },
    "locked": {
      "en": "Not earned yet. You can go back and try!",
      "zh": "尚未獲得，可以回去挑戰！"
    },
    "wordsTip": {
      "en": "Tap a word to review its meaning.",
      "zh": "點一下詞彙，複習它的意思。"
    },
    "badgeHow": {
      "node": {
        "en": "Marked the small temple as a community node (Scene 1)",
        "zh": "在場景一把小廟標記為社區節點"
      },
      "clue": {
        "en": "Found a cultural clue on the timeline (Scene 2)",
        "zh": "在場景二的時間軸上找到文化線索"
      },
      "landscape": {
        "en": "Matched cultural objects with their meanings (Scene 3)",
        "zh": "在場景三完成文化物件的意義配對"
      },
      "route": {
        "en": "Built a cultural route on the community map (Scene 4)",
        "zh": "在場景四的社區地圖上建立文化路線"
      },
      "calendar": {
        "en": "Matched zuoya, Touya and Weiya (Scene 5)",
        "zh": "在場景五配對做牙、頭牙與尾牙"
      },
      "local": {
        "en": "Matched Tudigong, Bogong and fuchang (Scene 6)",
        "zh": "在場景六配對土地公、伯公與福廠"
      },
      "speaker": {
        "en": "Introduced local culture in an English sentence (Ending)",
        "zh": "在結尾用英文句子介紹在地文化"
      }
    },
    "badgePage": {
      "node": "p05",
      "clue": "p06",
      "landscape": "p07",
      "route": "p08",
      "calendar": "p09",
      "local": "p10",
      "speaker": "p11"
    },
    "sentencesIntro": {
      "en": "Your sentences from this journey:",
      "zh": "你在這趟旅程中完成的句子："
    },
    "speakTip": {
      "en": "Read them aloud to a friend or family member.",
      "zh": "唸給朋友或家人聽聽看。"
    },
    "noSentence": {
      "en": "No sentence yet. Go back to the Ending page to make one!",
      "zh": "還沒有句子。回到結尾頁，完成一句吧！"
    },
    "storyText": {
      "en": "Tudigong's Neighborhood is a bilingual AR learning experience for junior- and senior-high school students. It starts from everyday places in Kaohsiung, such as street corners, fields, markets and neighborhoods, and asks one question: why do we often find Tudigong close to daily life?",
      "zh": "「土地公的街坊」是為國高中生設計的雙語 AR 學習體驗。它從高雄的街角、田野、市場與街坊等日常場所出發，探討一個問題：為什麼土地公常出現在日常生活附近？"
    },
    "credits": {
      "en": "Made by: [names] · [school or unit]",
      "zh": "製作團隊：【待補】"
    },
    "readingIntro": {
      "en": "Want to learn more? These are the sources behind this experience.",
      "zh": "想知道更多嗎？以下是本體驗參考的資料。"
    },
    "forStudents": {
      "en": "For students",
      "zh": "給學生"
    },
    "forTeachers": {
      "en": "For teachers",
      "zh": "給老師"
    },
    "fieldStudy": {
      "en": "Field-study idea: Find a small temple, an old tree or a market near your school. Add it to a community map and write one English sentence about it.",
      "zh": "走讀小任務：在學校附近找一座小廟、一棵老樹或一個市場，把它畫進社區地圖，再用一句英文介紹它。"
    },
    "rateQ": {
      "en": "How much did you enjoy this journey?",
      "zh": "你有多喜歡這趟旅程？"
    },
    "rates": [
      {
        "en": "Not really",
        "zh": "不太喜歡"
      },
      {
        "en": "It was OK",
        "zh": "還可以"
      },
      {
        "en": "I liked it",
        "zh": "喜歡"
      },
      {
        "en": "I really liked it",
        "zh": "很喜歡"
      },
      {
        "en": "I loved it!",
        "zh": "超喜歡！"
      }
    ],
    "tellMore": {
      "en": "Tell us more (optional)",
      "zh": "想說的話（選填）"
    },
    "tellMorePh": {
      "en": "What did you like? What could be better?",
      "zh": "你喜歡哪個部分？哪裡可以更好？"
    },
    "rateFirst": {
      "en": "Please choose a rating first.",
      "zh": "請先選擇評分。"
    },
    "confirmAgain": {
      "en": "Start again? Your badges, route and sentences will be cleared.",
      "zh": "要重新開始嗎？你的徽章、路線和句子都會清除。"
    },
    "startAgain": {
      "en": "Start Again",
      "zh": "重新開始"
    },
    "cancel": {
      "en": "Cancel",
      "zh": "取消"
    },
    "endTitle": {
      "en": "Thank you for exploring!",
      "zh": "謝謝你的探索！"
    },
    "words": {
      "en": "Words You Learned Today",
      "zh": "今日學到的詞彙"
    },
    "goBack": {
      "en": "Go back",
      "zh": "回去看看"
    },
    "sheetLabel": {
      "en": "Recap and feedback",
      "zh": "回顧與回饋"
    }
  },
  "vocab": [
    {
      "en": "Tudigong (Fude Zhengshen)",
      "zh": "土地公／福德正神",
      "level": "Culture-specific",
      "def": "A local land deity closely connected with land and community life.",
      "ex": "Tudigong culture is connected with land and local communities."
    },
    {
      "en": "local guardian",
      "zh": "地方守護",
      "level": "B1",
      "def": "A guardian connected with a local area.",
      "ex": "Tudigong is often understood as a local guardian."
    },
    {
      "en": "neighborhood",
      "zh": "街坊／社區",
      "level": "B1",
      "def": "The area where people live near one another.",
      "ex": "A neighborhood can have its own cultural landmarks."
    },
    {
      "en": "daily life",
      "zh": "日常生活",
      "level": "B1",
      "def": "Everyday activities and experiences.",
      "ex": "Tudigong culture is part of everyday life in many communities."
    },
    {
      "en": "local temple",
      "zh": "地方廟宇／小廟",
      "level": "B1",
      "def": "A temple connected with a local community.",
      "ex": "A local temple can become a cultural landmark."
    },
    {
      "en": "community map",
      "zh": "社區地圖",
      "level": "B1",
      "def": "A map showing places and relationships in a community.",
      "ex": "We can use a community map to explore local culture."
    },
    {
      "en": "cultural landscape",
      "zh": "文化地景",
      "level": "B2",
      "def": "A place shaped by people, land use, and culture over time.",
      "ex": "Small temples and old trees can be part of a cultural landscape."
    },
    {
      "en": "farming life",
      "zh": "農業生活",
      "level": "B1",
      "def": "Daily life connected with farming and fields.",
      "ex": "Tudigong culture has long been connected with farming life."
    },
    {
      "en": "marketplace",
      "zh": "市場",
      "level": "B1",
      "def": "A place where people buy and sell goods.",
      "ex": "Markets are important parts of community life."
    },
    {
      "en": "zuoya",
      "zh": "做牙",
      "level": "Culture-specific",
      "def": "A traditional practice connected with the second and sixteenth days of the lunar month.",
      "ex": "Zuoya is part of Taiwan's traditional calendar and community culture."
    },
    {
      "en": "Touya",
      "zh": "頭牙",
      "level": "Culture-specific",
      "def": "The first important ya observance of the year, on the second day of the second lunar month.",
      "ex": "Touya is a culture-specific term in Taiwan."
    },
    {
      "en": "Weiya",
      "zh": "尾牙",
      "level": "Culture-specific",
      "def": "The final ya observance of the year, on the sixteenth day of the twelfth lunar month; also used for year-end company meals.",
      "ex": "Weiya is now also part of everyday language in Taiwan."
    },
    {
      "en": "Bogong",
      "zh": "伯公",
      "level": "Culture-specific",
      "def": "A Hakka term commonly used for Tudigong in local cultural contexts.",
      "ex": "In Meinong, Tudigong is often called Bogong."
    },
    {
      "en": "fuchang",
      "zh": "福廠",
      "level": "Culture-specific",
      "def": "A culture-specific festival space or structure in particular local ritual contexts, such as the Yong'an case in Meinong.",
      "ex": "A fuchang is not simply another name for every Tudigong temple."
    },
    {
      "en": "cultural memory",
      "zh": "文化記憶",
      "level": "B2",
      "def": "Memory preserved through places, objects, land use, and everyday life.",
      "ex": "Cultural memory can remain even when a neighborhood changes."
    },
    {
      "en": "digital humanities",
      "zh": "數位人文",
      "level": "C1 / academic",
      "def": "Using digital tools to study culture, place, and society.",
      "ex": "AR, timelines, and community maps can support digital humanities learning."
    }
  ],
  "references": [
    {
      "title": "Taiwan Cultural Memory Bank: Fude Zhengshen / Tudigong",
      "url": "https://tcmb.culture.tw/zh-tw/detail?id=247133&indexCode=Culture_Place"
    },
    {
      "title": "Taiwan Religious Culture Map: Beitou Huangtian Fuyou Temple",
      "url": "https://taiwangods.moi.gov.tw/html/cultural/3_0011.aspx?i=209"
    },
    {
      "title": "Kaohsiung Museum of History: Meinong Yong'an Settlement Bogong Fuchang New-Year Ritual",
      "url": "https://www.khm.org.tw/tw/event/past/detail/338"
    },
    {
      "title": "Taiwan Folk Culture Dictionary: Zuoya / Weiya",
      "url": "https://dict.th.gov.tw/detailPage.aspx?Ca=183&ID=2419"
    },
    {
      "title": "Kaohsiung Gushou Temple: Fude Zhengshen",
      "url": "https://cushow.org.tw/?act=menuinfo&cmd=detail&mi_id=20240202008&ml_id=20240202004"
    },
    {
      "title": "MOE Hakka Dictionary resource: 伯公下 (Bogong's place)",
      "url": "https://hakkadict.moe.edu.tw/static/resource/%E7%A6%AE%E4%BF%97/109_024_%E4%BC%AF%E5%85%AC%E4%B8%8B.pdf"
    },
    {
      "title": "MOE Hakka Dictionary resource: 化胎式伯公 (Bogong shrines)",
      "url": "https://hakkadict.moe.edu.tw/static/resource/%E4%BF%A1%E4%BB%B0/109_015_%E5%8C%96%E8%83%8E%E5%BC%8F%E4%BC%AF%E5%85%AC.pdf"
    }
  ],
  "journey": {
    "title": {
      "en": "Journey Map",
      "zh": "街坊旅程圖"
    },
    "mapKicker": {
      "en": "Your route",
      "zh": "你的路線"
    },
    "mapButton": {
      "en": "Map",
      "zh": "地圖"
    },
    "sheet": {
      "en": "Story and words",
      "zh": "故事與詞彙"
    },
    "intro": {
      "en": "Visit the stops in order, or tap any stop to go there. Each stop you finish gets a stamp.",
      "zh": "照順序走訪每一站，也可以點任何一站直接前往。完成一站，就能蓋上一個章。"
    },
    "startHere": {
      "en": "Start here",
      "zh": "從這裡開始"
    },
    "continue": {
      "en": "Continue",
      "zh": "繼續"
    },
    "go": {
      "en": "Go",
      "zh": "出發"
    },
    "again": {
      "en": "Visit again",
      "zh": "再去一次"
    },
    "done": {
      "en": "Stamped",
      "zh": "已蓋章"
    },
    "stop": {
      "en": "Stop",
      "zh": "第"
    },
    "allDone": {
      "en": "Every stop is stamped! See your badges.",
      "zh": "每一站都蓋好章了！看看你的徽章。"
    },
    "seeBadges": {
      "en": "See my badges",
      "zh": "看我的徽章"
    },
    "stamps": {
      "en": "stamps",
      "zh": "個章"
    },
    "backToMap": {
      "en": "Back to the map",
      "zh": "回到地圖"
    },
    "nextStop": {
      "en": "Next stop",
      "zh": "下一站"
    },
    "sections": [
      {
        "id": "ready",
        "title": {
          "en": "Get ready",
          "zh": "準備出發"
        },
        "stops": [
          "p02",
          "p03"
        ]
      },
      {
        "id": "explore",
        "title": {
          "en": "Explore the neighborhood",
          "zh": "走訪街坊"
        },
        "stops": [
          "p04",
          "p05",
          "p06",
          "p07",
          "p08",
          "p09",
          "p10"
        ]
      },
      {
        "id": "share",
        "title": {
          "en": "Share what you learned",
          "zh": "分享所學"
        },
        "stops": [
          "p11",
          "p12"
        ]
      }
    ],
    "stops": {
      "p02": {
        "icon": "scan",
        "seal": "卡",
        "kicker": {
          "en": "Get ready",
          "zh": "準備"
        },
        "title": {
          "en": "Scan the card",
          "zh": "掃描文化卡"
        },
        "blurb": {
          "en": "Point the camera at the Tudigong culture card.",
          "zh": "用相機對準土地公文化卡。"
        },
        "img": "card_thumb.webp"
      },
      "p03": {
        "icon": "tap",
        "seal": "手",
        "kicker": {
          "en": "Get ready",
          "zh": "準備"
        },
        "title": {
          "en": "How to play",
          "zh": "使用說明"
        },
        "blurb": {
          "en": "Try the moves you will use: tap, drag, slide and match.",
          "zh": "試試會用到的操作：點選、拖曳、滑動與配對。"
        }
      },
      "p04": {
        "icon": "map",
        "seal": "問",
        "kicker": {
          "en": "Introduction",
          "zh": "導論"
        },
        "title": {
          "en": "Why is Tudigong close by?",
          "zh": "土地公為什麼在身邊？"
        },
        "blurb": {
          "en": "Turn a 3D neighborhood and find the big question.",
          "zh": "轉動立體街坊，認識這趟旅程的核心提問。"
        },
        "img": "p05_dawn.webp"
      },
      "p05": {
        "icon": "corner",
        "seal": "廟",
        "kicker": {
          "en": "Scene 1",
          "zh": "場景一"
        },
        "title": {
          "en": "The street-corner temple",
          "zh": "街角小廟"
        },
        "blurb": {
          "en": "Solve riddles and find where the community meets.",
          "zh": "解開謎題，找出社區交會的地方。"
        },
        "img": "p05_place_temple.webp"
      },
      "p06": {
        "icon": "fields",
        "seal": "田",
        "kicker": {
          "en": "Scene 2",
          "zh": "場景二"
        },
        "title": {
          "en": "From fields to neighborhoods",
          "zh": "從田野到街坊"
        },
        "blurb": {
          "en": "Slide from past to present and watch the land change.",
          "zh": "從過去滑到現在，看看土地怎麼改變。"
        },
        "img": "p06_map_past.webp"
      },
      "p07": {
        "icon": "lion",
        "seal": "景",
        "kicker": {
          "en": "Scene 3",
          "zh": "場景三"
        },
        "title": {
          "en": "Objects and landscape",
          "zh": "文化物件與地景"
        },
        "blurb": {
          "en": "Look closely at four objects and match their meanings.",
          "zh": "仔細觀察四個物件，配對它們的文化意義。"
        },
        "img": "p07_landscape.webp"
      },
      "p08": {
        "icon": "route",
        "seal": "坊",
        "kicker": {
          "en": "Scene 4",
          "zh": "場景四"
        },
        "title": {
          "en": "My neighborhood map",
          "zh": "我的街坊地圖"
        },
        "blurb": {
          "en": "Place everyday places and connect a cultural route.",
          "zh": "放上日常地點，連成一條文化路線。"
        },
        "img": "p08_node_market.webp"
      },
      "p09": {
        "icon": "calendar",
        "seal": "牙",
        "kicker": {
          "en": "Scene 5",
          "zh": "場景五"
        },
        "title": {
          "en": "Touya and Weiya",
          "zh": "頭牙與尾牙"
        },
        "blurb": {
          "en": "Match the dates and light up the lunar calendar.",
          "zh": "配對日期，點亮農曆月曆。"
        },
        "img": "p09_meal.webp"
      },
      "p10": {
        "icon": "compare",
        "seal": "伯",
        "kicker": {
          "en": "Scene 6",
          "zh": "場景六"
        },
        "title": {
          "en": "Bogong in Meinong",
          "zh": "美濃的伯公"
        },
        "blurb": {
          "en": "Travel to a Hakka community and compare three ideas.",
          "zh": "前往客家社區，比較三個概念。"
        },
        "img": "p10_settlement.webp"
      },
      "p11": {
        "icon": "chat",
        "seal": "說",
        "kicker": {
          "en": "Ending",
          "zh": "結尾"
        },
        "title": {
          "en": "Say it in English",
          "zh": "用英文介紹"
        },
        "blurb": {
          "en": "Build an English sentence about Tudigong culture.",
          "zh": "組出一句介紹土地公文化的英文句子。"
        }
      },
      "p12": {
        "icon": "star",
        "seal": "成",
        "kicker": {
          "en": "Finish",
          "zh": "完成"
        },
        "title": {
          "en": "Your badges",
          "zh": "你的徽章"
        },
        "blurb": {
          "en": "See your badges and think about your own neighborhood.",
          "zh": "看看你的徽章，想一想自己的街坊。"
        }
      }
    }
  },
  "map": {
    "heading": {
      "en": "Journey Map",
      "zh": "街坊旅程圖"
    },
    "guide": {
      "en": "This is your journey map. Start at the glowing stop, or tap any stop to see what it is about.",
      "zh": "這是你的旅程地圖。從發光的那一站開始，也可以點任何一站，看看那一站要做什麼。"
    }
  }
};
export default CONTENT;
```

## 7. Image AI

```text
HOW TO USE (one person generates all images so the style stays the same)
1. The app already has in-house semi-realistic art for P01 (hero), P04 (culture map) and the scan card (sources in assets/source-art/). Use assets/img/p01_home_hero.webp as style_anchor.png so new art matches it.
2. For every other image, give the AI: MASTER STYLE + the asset's SUBJECT + AVOID list, and attach style_anchor.png:
   - Midjourney: [SUBJECT] [MASTER STYLE] --ar 3:2 --style raw --sref <url of style_anchor> --no text, letters, smoke, halo, light rays, deity close-up, worship, black and gold
   - ChatGPT / Gemini / other chat image tools: "Create an image. Match the exact illustration style, line color, texture and palette of the attached image. Style: [MASTER STYLE]. Subject: [SUBJECT]. [AVOID]. Landscape 3:2."
3. Post-process in Figma/Photoshop/Canva: nudge colors toward the palette, remove any accidental text, crop to 3:2.
4. Export: stage art 2400×1600 master → app copy 1600×1067 WebP, quality 80, ≤ 300 KB. Objects: transparent PNG 1024×1024, ≤ 200 KB. Name files exactly as listed (lowercase, page prefix).
5. Keep the main content of every stage image inside the middle 2/3 of the width: on tablets the stage is almost square and the sides get cropped.
6. Do NOT use image AI for: text, calendars, maps that must be exact, badges, icons, the logo, or the Bogong/Fuchang images. Build those in SVG/Figma or use real photos with permission.
```

### Master style

```text
Semi-realistic illustrated scene for a bilingual educational app about everyday neighborhood life in Kaohsiung, southern Taiwan. Detailed digital painting with soft realistic lighting (warm morning sun), believable materials (red brick, terracotta roof tiles, glazed teal ridge tiles, carved stone, weathered plaster, wood), gentle depth haze and a subtle paper-grain texture. Realistic proportions and perspective; the style sits between a museum-exhibition illustration and a high-quality picture book: not cartoon, not anime, not photographic. Palette: glazed teal (#1F6B66, #2F8C88), plant green (#6E9F4E), warm paper beige (#F6EEDF), wood brown (#6B4A32), temple-gold accents (#C9952E with #F0CF7A highlights) on trim, ridge ornaments and lanterns, vermilion red (#B23A27) on pillars, lanterns and couplet boards. Cultural details: Taiwanese street-corner Tudigong shrine with a swallowtail ridge and gold ridge ornaments, small red lanterns with gold caps and tassels, stone lions, qilou arcade houses with metal window grilles and rooftop water tanks, scooters, banyan trees with aerial roots, rice paddies with irrigation canals, traditional market awnings. No text or letters anywhere in the image.
```

### Avoid list

```text
Avoid: deity statue close-up or any god figure as the subject, glowing light rays, halos, sacred beams, incense smoke or burning incense, people praying or bowing, worship scenes, moon blocks, readable writing on plaques, signboards or couplet boards, firecrackers, fireworks, large black-and-gold areas or gold as a full background, dark or mysterious mood, night scenes, anime or chibi style, plastic 3D-render look, photorealism, text, letters, numbers, watermark, logo, a copy of any specific real temple.
```

### Assets

#### IMG-01 · `p01_home_hero.webp` · P01 · 3:2

```text
A wide panorama of a conceptual Kaohsiung neighborhood on a sunny morning, eye-level slightly elevated view. Left to right: green rice fields with a narrow irrigation canal; a big old banyan tree at the edge of the field; a quiet lane of low two- and three-story houses with arcade sidewalks; a small street-corner Tudigong shrine seen from a distance (a tiny traditional Taiwanese shrine about the height of a person, red clay roof tiles with gently upturned swallowtail ridge ends, beige stucco walls, a small empty wooden table in front, no visible statue details); a traditional morning market with teal and beige striped awnings. Small everyday people: students with backpacks, a vegetable vendor, an elderly neighbor on a bench, parked scooters. Low hills on the far horizon. Keep the main content in the left and center; the far right edge is calm sky and soft background.
```

> Style anchor for everything else. Pick the calmest, least busy version.


#### IMG-02 · `scan_card_art.png` · P02 (printed card) · 3:2, 3000×2000

```text
A detailed community culture map illustration seen from above at a 3/4 angle, designed to be printed as a scanning card. Include: a small street-corner shrine with a red-tile roof, a pair of small stone lions, a big banyan tree, rice fields with crop rows, a curving canal, a market with striped awnings, houses with different roof colors, winding roads, and dotted route lines connecting six round map-node markers. Dense, asymmetric composition with many small distinct shapes and strong edge contrast across the WHOLE image. No large empty or flat areas, no repeating patterns, no text.
```

> AR tracking needs detail everywhere. Add the project title in Figma afterwards (text adds tracking features). Print matte (no gloss), postcard size or A5. Compile with the MindAR image-target compiler and check that feature points cover the whole card; regenerate if one area has none.


#### IMG-03 · `p04_culture_map.webp` · P04 · 3:2

```text
An illustrated neighborhood culture map at a 3/4 bird's-eye view, like a friendly museum map. Four clearly separated areas with open space around each one: (1) center: a small Tudigong shrine in a lane between houses; (2) left: rice fields with a canal; (3) lower right: a lively traditional market; (4) top center: a street corner where two roads meet, with a small shrine and a scooter repair shop. Light beige roads connect the areas. Calm, readable, not crowded.
```

> Pins are placed at % positions on this image. Leave open ground next to each of the 4 areas.


#### IMG-04 · `p05_base_map.webp` · P05 · 3:2

```text
A simple top-down (straight overhead) neighborhood base map in a flat picture-book style. Four distinct zones in a 2×2 layout separated by clear beige roads: top-left a block of residential houses (rooftops seen from above); top-right a road intersection with a zebra crossing and scooters; bottom-left a traditional market with striped awnings; bottom-right a small open plot with one tiny red-tile shrine roof and a tree. Soft shadows, very little detail inside each zone so drop zones can be drawn on top.
```

> The 4 zones must be clearly readable from above at phone size.


#### IMG-05a · `p06_map_past.webp` · P06 · 3:2

```text
Top-down conceptual map of a farming area in southern Taiwan decades ago. Mostly green rice fields in a patchwork, a curving irrigation canal, a few narrow dirt paths, a small cluster of traditional farmhouses (a settlement) near the top. A tiny red-tile shrine roof beside the fields slightly right of center, with one large banyan tree right next to it. Calm, slightly faded paper feeling that suggests the past, but still bright.
```

> Generate this one first. Note exactly where the shrine and tree are.


#### IMG-05b · `p06_map_present.webp` · P06 · 3:2

```text
EDIT the attached PAST map. Keep exactly the same framing, canal path, shrine position and banyan tree. Change the land use around them: most fields become paved streets, houses, a row of small shops and a market; one small field remains; zebra crossings and scooters on the roads. The small shrine and the banyan tree stay exactly where they were and the same size. Slightly more saturated, present-day feeling.
```

> Must be made by image EDITING of IMG-05a (ChatGPT/Gemini image edit, or Midjourney Vary Region), not a fresh generation, so the two maps align for the slider. Check alignment by overlaying at 50% opacity.


#### IMG-06 · `p07_obj_temple.png` · P07 · 1:1

```text
A small traditional Taiwanese street-corner Tudigong shrine, about human height, 3/4 front view: red clay roof tiles, gently upturned swallowtail ridge ends, beige stucco walls with simple brick details, an open front niche in soft shadow with no visible statue details, two tiny stone lions at the base. Isolated object centered on a plain flat warm-beige background (#F6EEDF), soft contact shadow.
```

> Remove the background → transparent PNG.


#### IMG-07 · `p07_obj_table.png` · P07 · 1:1

```text
A simple traditional Taiwanese wooden offering table, rectangular, red-brown wood with a carved front apron and four legs, completely empty with nothing on top, 3/4 front view. Isolated object centered on a plain flat warm-beige background (#F6EEDF), soft contact shadow.
```

> Keep the table EMPTY (no offerings, no incense burner).


#### IMG-08 · `p07_obj_lions.png` · P07 · 1:1

```text
A pair of small grey-stone guardian lions in traditional Taiwanese temple style, seated on low square bases facing slightly toward each other, friendly carved faces with curly manes, one with a ball under its paw and one with a small cub. Isolated pair centered on a plain flat warm-beige background (#F6EEDF), soft contact shadow.
```

> Grey stone is fine here; keep it warm grey, not blue grey.


#### IMG-09 · `p07_obj_tree.png` · P07 · 1:1

```text
A large old banyan tree with a wide rounded canopy, hanging aerial roots and a thick twisted trunk, a few round stones around its base for sitting. Isolated tree centered on a plain flat warm-beige background (#F6EEDF), soft contact shadow.
```


#### IMG-10 · `p08_kaohsiung_map.webp` · P08, P11, P12 · 3:2

```text
A simplified illustrated community map of a Kaohsiung neighborhood at a gentle 3/4 bird's-eye view, like a friendly museum map. Six places spaced evenly with open ground around each: a school with a sports field, rows of homes, a traditional market, a small park with a big old tree, a small local temple, and an old shopping street with arcade sidewalks. A canal in teal and roads in light beige. Far on the horizon, a hint of a harbor with cranes to suggest Kaohsiung, but no recognizable real landmark buildings.
```

> Six empty pin slots go on the open ground. Reused faded on P11 and as a thumbnail on P12.


#### IMG-11 · `p09_shopping_street.webp` · P09 · 3:2

```text
A cheerful daytime shopping street with small family businesses: a tea shop, a hardware store, a bakery. Shop owners chatting with neighbors under the arcade sidewalks, scooters parked. Blank signboards with no writing.
```

> Explains 'local business culture'. No offerings or rituals in the scene.


#### IMG-12 · `p09_weiya_meal.webp` · P09 · 3:2

```text
A year-end company dinner in Taiwan: colleagues in office-casual clothes sitting at round banquet tables with lazy Susans, sharing dishes and smiling, warm indoor lighting. No religious objects, no drinking focus, no text.
```

> Shows how 'Weiya' became an everyday social term.


#### IMG-13 · `p10_meinong.webp` · P10 · 3:2

```text
A peaceful rural landscape inspired by Meinong, Kaohsiung, a Hakka farming community: green rice fields, a low traditional brick courtyard farmhouse, a tall old tobacco-curing barn, low green mountains behind, a small river with a stone path, a farmer on a bicycle. Daylight, calm.
```

> Landscape only. For Bogong shrines and the Yong'an fuchang use real photos with permission and credit (e.g. from the Kaohsiung Museum of History) or no image. Do not AI-generate them: AI will invent the wrong form of a real living tradition.


## 8. Team & build order

- **Person A — Design & content lead:** tokens.css, content/content.js (sole editor), all images (one generator = one style), P01, P03, P11, P12, bilingual proofreading, final visual QA.
- **Person B — AR & app shell:** P00 setup (index.html, app.js router, ui.js), js/ar.js, the scan card + .mind target, P02, P04, P07, hosting (GitHub Pages/Netlify), phone + tablet testing.
- **Person C — Interactions:** js/drag.js, P05, P06 (timeline), P08 (route map), P09, P10, matching components reused by P07/P11.

1. **Milestone 1 — MVP flow (first review):** P00 setup → P01 → P02 (one working image target) → P03 → P07 (2D objects + match) → P12 (simple end). This alone meets every MUST HAVE row in the MVP Scope sheet.
2. **Milestone 2 — core learning:** P04, P05, P06, P08, P11 (all MUST in the Interaction Spec). Replace placeholder art with final images.
3. **Milestone 3 — nice to have:** P09, P10, AR mode for P07, narration audio, polish (only after phone + tablet tests pass).

## 9. QA checklist

- [ ] Tested on at least 1 phone + 1 tablet, iOS Safari and Android Chrome, in landscape, and on a phone held upright (portrait layout: one column, Map · Story and words · Next at the bottom).
- [ ] Opened from the HTTPS link; camera permission prompt works; 'Continue without AR' works when the camera is blocked.
- [ ] The printed card is detected within about 3 seconds in normal classroom light.
- [ ] Every instruction and button has English + Traditional Chinese. No Simplified characters (search for 这, 们, 时, 说).
- [ ] All text comes from content/content.js. Search the HTML and page files for stray English sentences.
- [ ] No deity close-up anywhere. Incense burner, moon blocks, plaque and deity are not tappable.
- [ ] Search all text for pray, bless, luck, fortune, wish, worship, 拜, 祈福, 求: none appear as instructions.
- [ ] Each page has one visual focus, one task, and one vocabulary item or learning check.
- [ ] Each page's completion condition matches the Interaction Spec sheet (P05: 4 cards + temple; P06: full Past→Present + clue; P07: 3 objects + match; P08: 4 nodes + route; P11: 1 sentence).
- [ ] Wrong answers show a gold hint, never red or an X. Reduced-motion setting stops pulses and sweeps.
- [ ] All tap targets at least 44 px; no text smaller than 12 px on the phone.
- [ ] Only colors from tokens.css (search the CSS for '#' outside tokens.css).
- [ ] Stage images ≤ 300 KB WebP, object PNGs ≤ 200 KB; first load under about 8 MB.
- [ ] A full run P01→P12 by someone who has never seen it takes 5–10 minutes with no help.

## 10. To confirm

- **Chinese narration:** The storyboard only contains the English narration. The Traditional Chinese narration in content.js is a draft translation written for this app; please proofread it (and replace it with the original Chinese script if one exists).
- **P05 card name:** The Storyboard sheet says 'Residential Area', the Interaction Spec sheet says 'Homes'. This guide uses Residential Area 住宅區 on P05 and Homes 住家 on P06/P08. Confirm with your supervisor.
- **Draft Chinese UI text:** All Traditional Chinese UI labels and the short culture notes (P01 info, P04 notes, P07 meanings) are drafts written for this guide. Please proofread them before they go into content.js.
- **Feedback storage:** P12 feedback is not stored anywhere (Submit only shows the thank-you message). If the team needs to collect responses, link to a Google Form instead.
- **P12 credits:** the credits line (`p12.credits`) appears once it has the team's names and school or unit.
- **P05 wording (fixed):** `p05.arFacts.temple` used to say neighbors stop "to pray" (拜拜), a word this checklist bans. It now reads "Neighbors stop here to chat and meet friends. · 鄰居們會在這裡聊天、和朋友碰面。"
- **Library versions:** MindAR 1.2.5 and A-Frame 1.5.0 are confirmed on npm and pinned in js/config.js. Do not change them mid-project.
- **Real photos:** Bogong / Fuchang (P10) need real photos with permission and credit, or no photo. P10 shows no photo of either. It shows the team's conceptual Bogong shrine 3D model, captioned "This 3D model is an illustration made for this project, not a copy of a real shrine." Fuchang is not pictured.
