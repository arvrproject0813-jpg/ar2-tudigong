# AR-2 Tudigong's Neighborhood · 土地公的街坊

Bilingual (English + Traditional Chinese) AR learning web app. Plain HTML/CSS/JS, MindAR image tracking, landscape only.
Built from the team build guide (`TUDIGONG_DESIGN_GUIDE.md`).

## Status

| Page | Status | Owner |
|---|---|---|
| P00 shell (router, top bar, panel, tokens, components, drag helper, AR helper) | Done | B |
| P01 Welcome | Done: full-screen opening animation (shrine rises from the earth, gold 土地公 calligraphy) | A |
| P02 Scan (MindAR) | Done, tested with the placeholder card | B |
| P03 How to Use | Done | A |
| P04 Introduction | Done: 3D neighborhood (drag to turn 360°, pinch/scroll to zoom) with 4 attached info pins; flat map as fallback | B |
| P05 Street Corner | Done: riddle cards, misty map that wakes up, vertical Neighborhood Passport, meeting-point question; afterwards every place opens in the AR camera | B |
| P06 Land Use | Done: the same land long ago and today (aligned 3D renders), timeline + handle on the map, layer chips, Compare Land Use, Find Cultural Clues (temple + old tree stay) | C |
| P07–P12 | Stubs: show "planned for a later milestone" and let you tap Next | see guide |

## Run it

The camera only works over **HTTPS** (or `localhost`).

- On your computer: `python3 -m http.server 8000` in this folder, then open `http://localhost:8000`.
- On a phone/tablet: push the folder to GitHub and turn on **GitHub Pages** (Settings → Pages → deploy from branch), or drag the folder onto **Netlify Drop**. Open the HTTPS link on the device and turn it sideways.

Updates show up within about 2 minutes of a push: `index.html` stamps every CSS/JS file with a `?v=` that changes every 2 minutes, so browsers never keep an old copy. **If you add a new .js or .css file, add its name to the lists at the top of `index.html`.**

Developer shortcuts: add `#p04` to the URL to jump to a page, `#reset` to clear progress, `#reset-p05` to replay one page.

## Narration audio

Upload one MP3 per page into `assets/audio/`, named `p01.mp3` … `p12.mp3` (optional `p01_zh.mp3` / `p01_en.mp3` for the 中文 / English modes). The "Listen to narration 聆聽旁白" button under each page title finds them automatically; pages without a file show "Narration coming soon". On GitHub: open the `assets/audio` folder → **Add file → Upload files** → drag the MP3s in → **Commit changes**. See `assets/audio/README.md`.

## Background music and button sound

`js/sound.js` generates both in the browser, so there are no files to download and no copyright to worry about:
- **Music:** an original, calm Taiwanese-countryside tune in the Chinese five-note scale: plucked zither (like a 古箏), bamboo flute (笛子), a soft wooden clapper and a low drone. It lasts about 1 min 40 s and loops. Tudigong guards the land and the fields, so it is pastoral, not ceremonial.
- **Button sound:** a short wooden "tock" like a 拍板/梆子 folk-opera clapper, on every button. It is deliberately not a 木魚 (temple wooden fish), so no worship sounds.

- **Opening sound (P01):** when the shrine rises there is a deep earth rumble, the soil bursting and gravel falling back, stone grinding upward, a low thud as it settles, leaves rustling as the banyan grows, a brush stroke for 土地公, the seal stamp and a rising zither run. It is timed to `css/welcome.css` (`scheduleRise()` in `js/sound.js`).

Browsers only allow sound after the first tap. So on the first visit the welcome page waits on a dim landscape with a gold 土 button, "Touch the earth 輕觸大地"; tapping it raises the shrine with its sound, and the music comes in once the title is written. Coming back through the logo, it plays straight away. The note button (top bar, and the welcome page corner) turns music on and off, and the choice is remembered. Music goes quiet while narration plays.

To use your own audio instead, upload `assets/audio/bgm.mp3` (looped background music) and/or `assets/audio/click.mp3` (button sound); the app uses them automatically. Volumes are `MUSIC_LEVEL`, `DUCK_LEVEL` and `CLICK_LEVEL` at the top of `js/sound.js`.

Current background music: `assets/audio/bgm.mp3` is "When Peach Blossoms Bloom" (Song of Everlasting Sorrow ambient music), a 6 min 20 s section of the team's 65-minute file, cut so the end blends into the start, level-matched (-20 LUFS) and saved at 96 kbps (4.6 MB). It plays through a Web Audio gain node so fading, ducking and the music button also work on iPad/iPhone. To change it, replace that file.

## Voice guide and camera setup

**Voice guide.** When a page opens, a calm voice says what to do there (for P01, after the welcome tap). The words also show in a small dark bar at the bottom of the stage, which fades away after a few seconds; ↻ plays it again and × hides it. English mode speaks English, 中文 mode speaks Mandarin, 雙語 mode speaks English and then Mandarin (on phones the bar shows only the line being spoken). Music goes quiet while it speaks. The speaker button in the top bar (and in the P01 corner) turns the voice off and on.
- Words: `guide` on every page in `content/content.js` (from the content sheet).
- Audio: `assets/audio/guide/p01_en.mp3 … p12_zh.mp3`, made with the open-source Kokoro-82M voice model (Apache-2.0): English voice `af_sol`, Mandarin voice `zf_018`, spoken a little slower than normal (0.92), level-matched. To change a line, change the text and remake that page's two files (or record your own and save them under the same names).
- Code: `js/guide.js`.

**Into the shrine (P01 → P02).** Pressing Start Experience walks you into the shrine: the view glides toward it and pauses at the doorway, where warm lamplight glows inside; then you pass through: the scene is cut by an arch-shaped hole the shape of the doorway, which grows past the screen, and P02 is waiting inside, settling into place as the light fades (about 2 s, with a soft rush of air and a zither chord). A sharp copy of the shrine with its doorway cut out exactly (`assets/img/shrine_doorcut.webp`, made from `assets/source-art/sprite_shrine.svg`) moves on top of the scene, so the opening is always the shrine's own gold frame. For smoothness the scene is lifted into its own layer and only scaled, with its own animations paused (`enterShrine()` in `js/pages/p01-home.js`, `.enter-host` / `.enter-glow` in `css/welcome.css`, `playEnter()` in `js/sound.js`). With Reduce Motion on, it simply goes to P02.

**3D models load once, early.** The team's 3D models (`assets/models/kit/`, about 6.6 MB) start downloading in the background 2.5 s after the site opens, so P02's AR and P04's map are ready when students get there. P04 shows a "Building the neighborhood… 正在建立街坊…" loader with a progress bar until the models are in (each file gets a second try); the simple built-in models are only used if the files cannot be loaded at all.

**P04 camera flights.** Tapping a place on the 3D map glides the camera in to it, then its note opens; tapping another place pulls back to the whole neighbourhood first, then glides in to the new one; closing the note pulls back out (`focusHook` in `js/pages/p04-intro.js`).

**Vocabulary in the panel text.** The page's vocabulary words (its word chips) are bold with a soft gold highlight wherever they appear in the panel text, in English and Chinese, and tapping one opens its word card (`markKeywords()` in `js/app.js`).

**"Not finished yet" pop-up.** Next always works; on an unfinished page it opens a pop-up with the page's badge and a ring showing how much is done (e.g. 1 / 2), the page's checklist (done ✓ / still to do), and two big choices: Go to Next Page, or stay (Continue Scanning / Keep Exploring). `askSkip()` in `js/app.js`, `.skd*` in `css/components.css`.

**Camera setup (P02).** Before the scanner starts, a Camera Setup card shows a small animated scene (a tablet framing the culture card) and four steps: Allow Camera, Fit the Card (30–50 cm), Good Light, Stay Safe. The steps light up one after another and the scene acts each one out (the Allow button being tapped, the scan frame and beam, the light coming on, a safety ring); tap a step to see it. The camera only turns on after Start Camera. The voice guide shows as a small speaker pill in the card's corner.

## Full-screen mode

The gold-framed arrow tab on the panel's left edge (or the frame icon in the top bar) slides the side panel away so the activity uses the whole screen; the same tab, now at the screen edge, brings it back. The choice is remembered, except on P02 (Scan): arriving there always slides the panel in from the right so the scan instructions are seen (`playPanelEnter()` in `js/app.js`).

## Welcome page (P01) and the 土地公 logo

P01 is a full-screen welcome with no top bar or panel (`export const chrome = false` in `js/pages/p01-home.js`). The ground trembles, soil bursts up, the street-corner shrine rises out of the earth with a banyan beside it, then 土地公 is brushed in gold calligraphy and "Start Experience" appears (about 5 s; tap anywhere to skip). Tudigong is the god of the land, so the shrine rising from the soil carries the idea without showing the deity himself (storyboard rule). Animation lives in `css/welcome.css`.

On every other page the top bar shows the gold 土地公 calligraphy logo; tapping it returns to the welcome page.

## Test the scan (P02)

1. Print `assets/targets/tudigong-card.png` (postcard or A5, **matte**, not glossy), or show it full-screen on a second device.
2. Open P02, allow the camera, hold the card flat 20–30 cm from the camera in good light.
3. "Scan Complete 掃描完成" appears, a 3D neighbourhood (shrine, banyan, qilou houses, market, fields) rises out of the card, and Next unlocks. Tilt the phone to look at it from the side.

If the camera is blocked, the page offers **Continue without AR 不使用 AR 繼續** so a demo never gets stuck.

## Using your own 3D model

Upload `tudigong-neighborhood.glb` to `assets/models/` and it replaces the built-in pop-up on P02 (AR) and the P04 3D view. Specs, the layout plan and the palette are in `assets/models/README.md` and `assets/source-art/tudigong_3d_reference_sheet.png`; `assets/source-art/tudigong-neighborhood-starter.glb` is today's model to start from.

## When the final scan-card art is ready

The `.mind` file must be compiled from the exact image you print.

1. Save the final card as `assets/targets/tudigong-card.png`.
2. Compile it with the MindAR image-target compiler (MindAR docs → Tools → Compile Image Targets).
3. Download the result as `assets/targets/tudigong-card.mind` (same name, replace the old one).
4. Check that the compiler shows feature points spread over the whole card. If one area has none, add detail there.

## Design: v2 "Temple craft"

The side panel is gold-leaf paper (灑金): faint gold flecks and soft gilded hills (`assets/img/panel_mural.svg`, generated by `assets/source-art/panel_murals.py`). Panel text uses its own typefaces, set on `.panel` in `css/components.css`: Alegreya for titles and buttons, Alegreya Sans for text and 昭源宋體 (Chiron Sung HK) for Chinese. The rest of the site keeps the original fonts.

Buttons are carved wooden plaques (匾額): cut corners, a gold rim, teal lacquer for the main action and plain wood for secondary actions (`.btn` in `css/components.css`). Back is the small round wooden button next to Next at the bottom of the panel. Labels are sentence case, with no spaced capitals. The narration button stays hidden until that page's MP3 exists, and unwritten 【待補】 Chinese lines are hidden (中文 mode shows the English instead).


Glazed-teal lacquer, temple gold trim and vermilion on warm paper, serif titles, gold-ringed medallion pins, a red seal stamp on question boxes and a carved-wood frame around maps. Everything is defined in `css/tokens.css`. Gold is used for trim and ornaments only (no deity close-ups, no black-and-gold, no rays or smoke), so the storyboard's cultural rules still hold.

## Art

The stage background is a semi-realistic dawn landscape of misty mountains and terraced rice paddies (`bg_mural.webp`; the welcome page uses `welcome_bg.webp` plus the transparent `sprite_shrine.webp` / `sprite_banyan.webp`) with two transparent cloud layers (`bg_clouds_far.webp`, `bg_clouds_near.webp`, classic 祥雲 drawn by `assets/source-art/xiangyun_clouds.py`: round lobes with curls that start in the notches, a smooth underside and a tapering tail) that drift left on a loop, like clouds in the wind. Motion stops automatically when a device has Reduce Motion switched on.


`assets/img/p01_home_hero.webp`, `assets/img/p04_culture_map.webp` and `assets/targets/tudigong-card.png` are in-house semi-realistic illustrations. Their editable SVG sources are in `assets/source-art/`. To use other art, change the paths in `js/config.js` → `ASSETS`:

- `welcomeBg`, `shrine`, `banyan`: the welcome scene. Shrine/banyan positions are `.w-shrine` / `.w-banyan` in `css/welcome.css` (% of the 16:9 scene).
- Model kit (`assets/models/kit/`): the team's 3D models (ornate temple, corner shrine, Tudigong statue, stone lion, incense burner, banyan, storefront, food and accessories stalls, road tiles), made web-ready (about 1 MB each, from 67 MB originals). `loadKit()` in `js/ar-diorama.js` loads them and `buildNeighborhood(THREE, { kit })` places them: P02 AR (shows the built-in model first, then switches), P04, and the P05/P06 renders and AR models. Following the storyboard's Object Usage Rules, the statue sits small inside the shrine/temple doorway and the incense burner stands to one side: background only, never tappable. To swap a model, replace its file with one that faces +Z and stands on the ground; any size is fitted. After changing the kit, re-render the P05/P06 pictures and the P05 AR models.
- P06 maps: `assets/img/p06_map_past.webp` and `p06_map_present.webp` (1500 × 1000) are rendered from `buildNeighborhood(THREE, { era: 'past' | 'present' })` with the same camera as P05, so the shrine and banyan line up exactly; pin and road positions are in `NODES` and the CSS keyframes in `js/pages/p06-land-use.js` / `css/pages.css`.
- P05 Market in AR: `assets/models/p05/market.glb` is the team's All-in-One night market (12 stalls, lanterns, 13 people, clip "Market_Loop"), scaled to 60 cm across for tabletop AR. It is not re-exported by the render scripts.
- P05 AR models: `assets/models/p05/{temple,residential,market,road,park}.glb`, about 40 cm across in AR, exported from `buildNeighborhood(THREE, { place: id })`. To use your own model for a place, export a GLB (Y up, metres, base at y = 0) with the same file name.
- P04 shows the 3D neighborhood from `js/ar-diorama.js` (`buildNeighborhood()`, the same model that rises from the card in AR) using three.js 0.160 from jsDelivr (mapped as `three` in the import map in `index.html`). The pins are attached to `anchors` in `buildNeighborhood()`; the start view and zoom limits are `VIEW` in `js/pages/p04-intro.js`. If WebGL is not available, the flat map `p04Map` is shown instead, with pin positions in `NODES` (% of the 3:2 image).

## Building the next pages

1. Open `js/pages/p05-street-corner.js` (etc.). It is a stub.
2. In a coding AI: paste the Project Context, tokens.css, the Component Spec and the page prompt from the guide, then add: *"The shell already exists. Use `ctx.panel()`, `ctx.setTasks()`, `ctx.complete()`, `ctx.seen()` from js/app.js, helpers from js/ui.js and `createDragGroup` from js/drag.js."* Paste `js/pages/p04-intro.js` as the example to follow.
3. Replace the stub file with the result.

### Page module contract

```js
export function render(stage, ctx) {
  // build the stage…
  ctx.panel({ body: [...], tasks: [{ text, done, count }], secondary: [...], primary: { text, onClick } });
  ctx.complete();            // unlocks Next and saves progress
}
export function destroy() {} // remove timers / listeners, stop AR
```

`ctx` gives: `content` (this page's text), `CONTENT`, `state`, `go(id)`, `next()`, `back()`, `panel()`, `setTasks()`, `complete()`, `isComplete()`, `seen(key, value)`, `toast(text, type)`, `openVocab(term)`, `save()`, `resetAll()`.

## Files

```
index.html
css/tokens.css      only place colors, fonts, sizes are defined (Person A)
css/base.css        reset, layout, rotate overlay
css/components.css  all components from the spec
css/pages.css       page-specific layout
content/content.js  every visible string, EN + 繁中 (Person A only)
js/app.js           router, state, top bar, panel
js/ui.js            bi(), button(), chip(), toast(), modal(), openVocab(), notePopover()
js/icons.js         inline SVG icons (no icon font needed, works offline)
js/drag.js          drag + tap-to-place for touch (for P05, P07–P10)
js/ar.js            loads A-Frame 1.5.0 + MindAR 1.2.5 on demand, startAR() / stopAR()
js/ar-diorama.js    the 3D pop-up neighbourhood shown on the card (three.js, no model files); buildNeighborhood(THREE, { place }) builds one place for P05
js/ar-place.js      P05 "See it in AR": camera view + 3D place (<model-viewer> from jsDelivr), real AR on supported phones/tablets
js/narration.js     narration player + Listen button
js/config.js        page list, asset paths, library URLs
js/pages/           one file per page
assets/img/         placeholder SVG art (replace with final WebP)
assets/targets/     printable scan card + compiled .mind target
```

## Notes

- The Traditional Chinese narration in `content/content.js` is a draft translation of the storyboard's English narration. Please proofread it, or replace it with the original Chinese script if you have one.
- Icons are inline SVG in `js/icons.js`, so the app has no icon-font dependency.
- Progress is kept only while the page is open: moving between pages keeps it, a reload starts fresh from the welcome page. Nothing is stored on the device. `#reset` or "Experience Again" also clears it.
