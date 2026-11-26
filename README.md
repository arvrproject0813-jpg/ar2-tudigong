# AR-2 Tudigong's Neighborhood · 土地公的街坊

Bilingual (English + Traditional Chinese) AR learning web app. Plain HTML/CSS/JS, MindAR image tracking. Laptops, tablets and phones held sideways use the landscape layout; phones held upright get their own portrait layout (`css/portrait.css`).
Built from the team build guide (`TUDIGONG_DESIGN_GUIDE.md`).

## Status

| Page | Status | Owner |
|---|---|---|
| P00 shell (router, top bar, bar + story sheet, cloud transitions, tokens, components, drag helper, AR helper) | Done (Nov 2026 redesign: no side panel) | B |
| Journey map (`#map`) | Done: the home of the experience after P03. A winding trail of 11 numbered stops in three parts (Get ready · Explore the neighborhood · Share what you learned); every stop is open, the next one glows with Start here, finished stops get a red stamp | B |
| P01 Welcome | Done: full-screen opening animation (shrine rises from the earth, gold 土地公 calligraphy) | A |
| P02 Scan (MindAR) | Done, tested with the placeholder card | B |
| P03 How to Use | Done | A |
| P04 Introduction | Done: 3D neighborhood (drag to turn 360°, pinch/scroll to zoom) with 4 attached info pins; flat map as fallback | B |
| P05 Street Corner | Done: riddle cards, misty map that wakes up, vertical Neighborhood Passport, meeting-point question; afterwards every place opens in the AR camera | B |
| P06 Land Use | Done: the same land long ago and today (aligned 3D renders), timeline + handle on the map, layer chips, Compare Land Use, Find Cultural Clues (temple + old tree stay) | C |
| P07 Cultural Objects | Done, **in the new scrolling story format** (Hero · Learn · Do · Badge; the model for the other scenes): a small museum of the four allowed objects (small temple, offering table, stone lions, old tree) on the team's display stands: look closely (picture, what to notice, View in AR), then the meaning cards, face down in a fan until three objects are seen, turn over and are fixed to their exhibits like brass labels; the four come together as one cultural landscape (also in AR). Badge: Landscape Observer | C |
| P08 Community Map | Done: a schematic map of Kaohsiung zooms into "My Neighborhood"; put places on empty lots (any place on any lot), then tap them in order to draw a cultural route (saved for P11/P12). Badge: Route Builder | C |
| P09 Touya and Weiya | Done: a lunar-year strip with two ya days a month; match Zuoya, Touya and Weiya to their date cards (red seals, the year lights up), story cards with pictures, then two context cards to flip. Badge: Calendar Matcher | C |
| P10 Bogong in Meinong | Done: map from downtown Kaohsiung to Meinong (with a note) and three Meinong culture cards from the team's models (settlement, tobacco barn, Bogong shrine, each with View in AR); match Tudigong, Bogong and the fuchang case to their meanings (culture notes, hints); Compare Cultural Expressions card with the Yong'an fuchang case and its source. Badge: Local Variation | C |
| P11 Ending | Done: the core question, three sentence frames with word cards (gentle hints, no "wrong"), the Chinese line, a culture recap and Listen (recorded voice); the student's own route map behind the card. Badge: Culture Introducer | C |
| P12 Project Information | Done: my route map, my 7 badges (tap one for how it was earned, or go back for a locked one), words learned today; panel: back to the core question, my sentences, Story / Further Reading / Teacher Questions, a 1–5 feedback rating, Back to Home and Experience Again (asks first) | C |

## Run it

The camera only works over **HTTPS** (or `localhost`).

- On your computer: `python3 -m http.server 8000` in this folder, then open `http://localhost:8000`.
- On a phone/tablet: push the folder to GitHub and turn on **GitHub Pages** (Settings → Pages → deploy from branch), or drag the folder onto **Netlify Drop**. Open the HTTPS link on the device; it works upright or sideways.

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
- Audio: `assets/audio/guide/p01_en.mp3 … p12_zh.mp3` and `map_en.mp3`, `map_zh.mp3`, made with the open-source Kokoro-82M voice model (Apache-2.0): English voice `af_sol`, Mandarin voice `zf_018`, spoken a little slower than normal (0.92), level-matched. To change a line, change the text and remake that page's two files (or record your own and save them under the same names).
- Code: `js/guide.js`.

**Into the shrine (P01 → P02).** Pressing Start Experience walks you into the shrine: the view glides toward it and pauses at the doorway, where warm lamplight glows inside; then you pass through: the scene is cut by an arch-shaped hole the shape of the doorway, which grows past the screen, and P02 is waiting inside, settling into place as the light fades (about 2 s, with a soft rush of air and a zither chord). A sharp copy of the shrine with its doorway cut out exactly (`assets/img/shrine_doorcut.webp`, made from `assets/source-art/sprite_shrine.svg`) moves on top of the scene, so the opening is always the shrine's own gold frame. For smoothness the scene is lifted into its own layer and only scaled, with its own animations paused (`enterShrine()` in `js/pages/p01-home.js`, `.enter-host` / `.enter-glow` in `css/welcome.css`, `playEnter()` in `js/sound.js`). With Reduce Motion on, it simply goes to P02.

**3D models load once, early.** The team's 3D models (`assets/models/kit/`, about 6.6 MB) start downloading in the background 2.5 s after the site opens, so P02's AR and P04's map are ready when students get there. P04 shows a "Building the neighborhood… 正在建立街坊…" loader with a progress bar until the models are in (each file gets a second try); the simple built-in models are only used if the files cannot be loaded at all.

**P04 camera flights.** Tapping a place on the 3D map glides the camera in to it, then its note opens; tapping another place pulls back to the whole neighbourhood first, then glides in to the new one; closing the note pulls back out (`focusHook` in `js/pages/p04-intro.js`).

**Vocabulary in the story sheet.** The page's vocabulary words (its word chips) are bold with a soft gold highlight wherever they appear in the sheet's text, in English and Chinese, and tapping one opens its word card (`markKeywords()` in `js/app.js`).

**"Not finished yet" pop-up.** Next always works; on an unfinished page it opens a pop-up with the page's badge and a ring showing how much is done (e.g. 1 / 2), the page's checklist (done ✓ / still to do), and two big choices: Go to Next Page, or stay (Continue Scanning / Keep Exploring). `askSkip()` in `js/app.js`, `.skd*` in `css/components.css`.

**Camera setup (P02).** Before the scanner starts, a Camera Setup card shows a small animated scene (a tablet framing the culture card) and four steps: Allow Camera, Fit the Card (30–50 cm), Good Light, Stay Safe. The steps light up one after another and the scene acts each one out (the Allow button being tapped, the scan frame and beam, the light coming on, a safety ring); tap a step to see it. The camera only turns on after Start Camera. The voice guide shows as a small speaker pill in the card's corner.

## The frame: journey map, top bar, story sheet, cloud transitions (Nov 2026 redesign)

The side panel is gone, so every activity uses the whole width. What used to be in it now lives in three places:

- **Top bar:** the 土地公 logo (back to the welcome page), a **Map** button, the stop's number and title, and on story pages the step chips **Learn · Do · Badge**, which follow the scroll (tap one to jump there; a finished step shows ✓). Then voice, music and language.
- **The bar under the stage:** **Story and words 故事與詞彙** (with a ✓ 1/2 task count) opens a sheet that slides up with the page's title, narration (Listen), vocabulary words and checklist; × or Esc closes it. On the right, **Next: <next stop>** (it glows once when the page is finished; on an unfinished page the "not finished yet" pop-up asks first). Extra page actions (P02 Scan Again, P11/P12 buttons) sit in the bar too. P12's sheet is called "Recap and feedback". `ctx.panel()` in `js/app.js`, `.sheet-*` in `css/shell.css`.
- **Journey map** (`js/pages/map.js`, `css/journey.css`): after P03 (How to play) students land on a map that works like collecting stamps (集章) at each place: a winding road through 11 round stops that look like roof-tile ends (瓦當). Clay = not visited, teal = the next stop (Start here 從這裡開始), gold with a red seal = finished (a stamp lands with a sound the first time you come back). Every stop is open: tap one to see what it is about, then Go. A floating **Continue** button always offers the first unfinished stop. The voice guide speaks only on the first visit.
- **Cloud curtain** (`js/curtain.js`, `.curtain` in `css/shell.css`): moving between pages, painted auspicious clouds (祥雲, the same style as the clouds behind every page) roll in from both sides, a medallion shows where you are going (its icon, a red seal, Stop N · Scene N and the title), and the clouds part (about 1.3 s, a soft rush of air and a zither note, no bells). Not used for the welcome page or a language switch; Reduce Motion gives a short fade. Tests can set `window.__noCurtain = true`.

### The phone version (portrait)

Holding a phone upright gets its own layout; nothing about the landscape view (laptops, tablets, phones held sideways) changes. Everything is in `css/portrait.css`, loaded last, with every rule inside `@media (orientation: portrait)`; a few small bits of JS check `matchMedia('(orientation: portrait)')`.

- **Frame:** a slimmer top bar (logo, the stop's number and its title on two lines, or the step chips with numbers only and the current step's name; voice, music, language). The **Map** button moves to the bar under the stage, where the thumb is: **Map · Story and words · Next**. Extra page actions (Scan Again, Experience Again, Give Feedback…) get their own row above it. The story sheet and dialogs use the full width (pictures above the words).
- **Pages are one column and scroll** when they do not fit: maps first, then the cards and activities under them (P05 map then the riddle deck and passport; P06 chips, map, timeline; P08 the Kaohsiung map with its legend underneath, then the board with the place cards 3 × 2 and the route bar; P09 the year in two rows of six months, the date sheets one under another; P10 the trip card, then the matching; P11 the sentence card first and the sentence starters under it; P12 my map, my badges, my words). P04's 3D view fills the screen with a wider lens so the whole neighbourhood fits. On P07 the exhibits are 2 × 2 and the meaning cards a 2 × 2 grid that shrinks as cards are placed.
- **Culture notes** (`notePopover` in `js/ui.js`): next to the pin on big maps (P04), otherwise docked at the bottom of the screen like a small sheet, so they never cover the cards you still have to tap.
- The "turn your phone sideways" screen is gone (portrait.css hides `#rotate-overlay`). The app's height is the visible screen (`100dvh`), so the bar is never under the browser's own toolbars.

Test sizes used: 390 × 844 and 360 × 640 (phones upright), 768 × 1024 (tablet upright), 844 × 390 and 667 × 375 (phones sideways), 1536 × 722, 1366 × 768, 1280 × 800 and 1180 × 820 (laptops and tablets, compared pixel by pixel with the previous version).

### The story page (P07 now; the other scenes next)

A scene is one page you scroll, with four parts (`js/story.js`, `css/story.css`):

1. **Hero:** the scene's seal (場景三), title, one sentence, a picture, and "In this scene you will" with the three steps; Start scrolls to Learn.
2. **Learn:** one idea per card; the cards stick and stack as you scroll (each one shrinks and dims a little as the next slides over it).
3. **Do:** the activity on a board as tall as the screen.
4. **Badge:** the result (locked and blurred until the activity is done), the badge, the takeaway, and Back to the map / Next stop.

To convert a page: `const story = createStory(stage, ctx); story.hero({...}); story.learn({...}); story.doSection({...}); const badge = story.badgeSection({...}); story.ready();` then call `badge.unlock(true)` when the activity is finished (see `js/pages/p07-objects.js`). The strings for the hero and the Learn cards are `intro`, `plan`, `learnTitle`, `learn` in the page's content.

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

The story sheet is gold-leaf paper (灑金): faint gold flecks and soft gilded hills (`assets/img/panel_mural.svg`, generated by `assets/source-art/panel_murals.py`). The frame, the sheet, the map and the story pages use Alegreya for titles and buttons, Alegreya Sans for text and 昭源宋體 (Chiron Sung HK) for Chinese (set on `.panel` in `css/components.css`, and in `css/shell.css`, `css/journey.css`, `css/story.css`). The older scene layouts keep the original fonts.

Buttons are carved wooden plaques (匾額): cut corners, a gold rim, teal lacquer for the main action and plain wood for secondary actions (`.btn` in `css/components.css`). Back is the small round wooden button next to Next at the bottom of the panel. Labels are sentence case, with no spaced capitals. The narration button stays hidden until that page's MP3 exists, and unwritten 【待補】 Chinese lines are hidden (中文 mode shows the English instead).


Glazed-teal lacquer, temple gold trim and vermilion on warm paper, serif titles, gold-ringed medallion pins, a red seal stamp on question boxes and a carved-wood frame around maps. Everything is defined in `css/tokens.css`. Gold is used for trim and ornaments only (no deity close-ups, no black-and-gold, no rays or smoke), so the storyboard's cultural rules still hold.

## Art

The stage background is a semi-realistic dawn landscape of misty mountains and terraced rice paddies (`bg_mural.webp`; the welcome page uses `welcome_bg.webp` plus the transparent `sprite_shrine.webp` / `sprite_banyan.webp`) with two transparent cloud layers (`bg_clouds_far.webp`, `bg_clouds_near.webp`, classic 祥雲 drawn by `assets/source-art/xiangyun_clouds.py`: round lobes with curls that start in the notches, a smooth underside and a tapering tail) that drift left on a loop, like clouds in the wind. Motion stops automatically when a device has Reduce Motion switched on.


`assets/img/p01_home_hero.webp`, `assets/img/p04_culture_map.webp` and `assets/targets/tudigong-card.png` are in-house semi-realistic illustrations. Their editable SVG sources are in `assets/source-art/`. To use other art, change the paths in `js/config.js` → `ASSETS`:

- `welcomeBg`, `shrine`, `banyan`: the welcome scene. Shrine/banyan positions are `.w-shrine` / `.w-banyan` in `css/welcome.css` (% of the 16:9 scene).
- Model kit (`assets/models/kit/`): the team's 3D models (ornate temple, corner shrine, Tudigong statue, stone lion, incense burner, banyan, storefront, food and accessories stalls, road tiles), made web-ready (about 1 MB each, from 67 MB originals). `loadKit()` in `js/ar-diorama.js` loads them and `buildNeighborhood(THREE, { kit })` places them: P02 AR (shows the built-in model first, then switches), P04, and the P05/P06 renders and AR models. Following the storyboard's Object Usage Rules, the statue sits small inside the shrine/temple doorway and the incense burner stands to one side: background only, never tappable. To swap a model, replace its file with one that faces +Z and stands on the ground; any size is fitted. After changing the kit, re-render the P05–P10 pictures and the P05/P07 AR models.
- P06 maps: `assets/img/p06_map_past.webp` and `p06_map_present.webp` (1500 × 1000) are rendered from `buildNeighborhood(THREE, { era: 'past' | 'present' })` with the same camera as P05, so the shrine and banyan line up exactly; pin and road positions are in `NODES` and the CSS keyframes in `js/pages/p06-land-use.js` / `css/pages.css`.
- P05 Market in AR: `assets/models/p05/market.glb` is the team's All-in-One night market (12 stalls, lanterns, 13 people, clip "Market_Loop"), scaled to 60 cm across for tabletop AR. It is not re-exported by the render scripts.
- P05 AR models: `assets/models/p05/{temple,residential,market,road,park}.glb`, about 40 cm across in AR, exported from `buildNeighborhood(THREE, { place: id })`. To use your own model for a place, export a GLB (Y up, metres, base at y = 0) with the same file name.
- P04 shows the 3D neighborhood from `js/ar-diorama.js` (`buildNeighborhood()`, the same model that rises from the card in AR) using three.js 0.160 from jsDelivr (mapped as `three` in the import map in `index.html`). The pins are attached to `anchors` in `buildNeighborhood()`; the start view and zoom limits are `VIEW` in `js/pages/p04-intro.js`. If WebGL is not available, the flat map `p04Map` is shown instead, with pin positions in `NODES` (% of the 3:2 image).

## Scenes 3–6 and the ending (P07–P12)

All six pages share `css/scenes.css` (loaded after `pages.css`) and the same look as P05/P06: carved wood frames, paper cards with gold hairlines, the panel's typefaces, chimes for right answers, a soft clapper and a gold hint for "not yet" (never "wrong"), and the zither flourish when a task is done.

- **Badges.** Seven learning badges (`js/badges.js`): a map-pin medallion with a gold ring and the badge's icon (never a charm, amulet or seal). P07–P11 give theirs with a short "Badge earned" pop-up at the top of the stage; P05 and P06 count as earned once those pages are finished. P12 shows all seven.
- **The neighbourhood board** (`js/community-board.js`): one picture of the harbour neighbourhood with six empty lots (`assets/img/p08_board.webp`, 1700 × 1000) and one picture per place (`p08_node_*.webp`), all rendered with the same orthographic camera, so any place fits on any lot (each place picture has an anchor that sits on the lot's point). Used on P08 (building), P11 (faded background) and P12 (my map). The route is kept in `state.p08Route`.
- **Kaohsiung map** (`js/kaohsiung-map.js`): a simplified SVG map of Kaohsiung (coast, Kaoping River, Love River, Cijin, northern border, hills), labelled "Simplified map, not to scale". P08 shows the whole city, P10 a crop from downtown to Meinong.
- **Voice for P11.** Listen plays `assets/audio/p11/t<frame>_<words>.mp3` (all 23 possible sentences, Kokoro voice `af_sol`); if a file is missing, the browser's own English voice reads it.
- **Feedback (P12)** is not sent anywhere yet: Submit only shows the thank-you message. Link a form here if the team wants to collect answers. The credits line appears once `p12.credits` in `content/content.js` has the team's names.

### The team's Phase II 3D models (P07–P10)

The team's models (Drive folders "Phase II_3D elements" and "ROSIE", about 60–67 MB each) are made web-ready: simplified to about 38,000 triangles, textures 1024 px WebP, about 1.2–1.8 MB each, then turned so their front faces the viewer, centred, standing on the ground and scaled for tabletop AR (about 40 cm across).

| Page | Model (original file) | In the app |
|---|---|---|
| P07 | museum display stand, offering table | every exhibit stands on the display stand; the Offering Table exhibit and the landscape use the team's table (`assets/models/p07/table.glb`, `stand.glb`) |
| P08 | school building, townhouses, market, old town | the School, Homes, Market and Old Street places on the board; each place's note has View in AR (`assets/models/p08/`) |
| P09 | lunar calendar, storefront, Weiya table | the Zuoya, Touya and Weiya story cards (picture + View in AR), the shopping street and the year-end meal (`assets/models/p09/`) |
| P10 | terrain tile, tobacco barn, Bogong shrine | three Meinong culture cards under the map (picture, note, View in AR); the Bogong card says the model is an illustration, not a copy of a real shrine (`assets/models/p10/`) |

To replace one, run `gltf-transform optimize in.glb out.glb --compress false --texture-compress webp --texture-size 1024 --simplify true --simplify-ratio 0.02 --simplify-error 0.004`, fit it with `node prep_team.mjs out.glb assets/models/pXX/name.glb <turn°> <size m>` (in `assets/source-art/render/`), then re-render the pictures (`render.py`, see below). `preview.html?files=a.glb,b.glb` shows models side by side.

### Making the pictures and AR models (P07–P10)

The P07 exhibits and landscape, the P08 board and places, the P09 street and meal and the P10 Meinong farmland are rendered from the same 3D kit as the rest of the app, so everything matches:

- `assets/source-art/render/scenes.js` builds each scene with the kit (`P07`, `P08`, `P09`, `P10`); `render.html` renders one in the browser; `render.py jobs.json` (Playwright) saves the pictures (`{"out": "assets/img/x.webp", "ss": 2, "opts": {...}}`) or a GLB for AR (`{"glb": "assets/models/p07/x.glb", "opts": {...}}`). Compress new GLBs with `gltf-transform optimize --texture-compress webp --texture-size 1024`.
- P07 AR models: `assets/models/p07/{temple,table,lions,tree,landscape}.glb`. The shrine's niche is empty and there is no incense burner (Object Usage Rules); the offering table is always empty.
- Voice guide and P11 audio: `assets/source-art/tts/make.py` (setup and model links are at the top of the file): `make.py guide p07 p08` remakes those pages' guide files, `make.py p11` the sentences.

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

`ctx` gives: `content` (this page's text), `CONTENT`, `state`, `go(id)`, `next()`, `back()`, `panel()` (the bar + story sheet; extra options `sheetLabel`, `sheetOpen`), `steps(items)` (step chips in the top bar), `openSheet()`, `nextStop()`, `setTasks()`, `complete()`, `isComplete()`, `seen(key, value)`, `toast(text, type)`, `openVocab(term)`, `save()`, `resetAll()`. A page can export `chrome = false` (full screen, like P01) or `guideOnce = true` (voice guide only on the first visit, like the map).

## Files

```
index.html
css/tokens.css      only place colors, fonts, sizes are defined (Person A)
css/base.css        reset, layout (full visible screen), rotate overlay (no longer shown: portrait has its own layout)
css/components.css  all components from the spec
css/pages.css       page-specific layout (P01–P06)
css/scenes.css      P08–P12, badges, Kaohsiung map
css/shell.css       top bar, the bar + story sheet, the cloud curtain
css/journey.css     the journey map
css/story.css       the scrolling story page (P07, then the other scenes)
css/portrait.css    the phone version (portrait only; loaded last, landscape untouched)
content/content.js  every visible string, EN + 繁中 (Person A only)
js/app.js           router, state, top bar, the bar + story sheet, page changes
js/curtain.js       the cloud curtain between pages
js/story.js         the scrolling story page: createStory() → hero, learn, doSection, badgeSection
js/ui.js            bi(), button(), chip(), toast(), modal(), openVocab(), notePopover()
js/icons.js         inline SVG icons (no icon font needed, works offline)
js/drag.js          drag + tap-to-place for touch (for P05, P07–P10)
js/badges.js        the seven badges: medal(), earnBadge(), the "Badge earned" pop-up
js/community-board.js  the P08 neighbourhood board (lots, places, route), also on P11/P12
js/kaohsiung-map.js the simplified SVG map of Kaohsiung (P08, P10)
js/ar.js            loads A-Frame 1.5.0 + MindAR 1.2.5 on demand, startAR() / stopAR()
js/ar-diorama.js    the 3D pop-up neighbourhood shown on the card (three.js, no model files); buildNeighborhood(THREE, { place }) builds one place for P05
js/ar-place.js      "See it in AR" (P05 places, P07 exhibits): camera view + 3D model (<model-viewer> from jsDelivr), real AR on supported phones/tablets
js/narration.js     narration player + Listen button
js/config.js        page list (p01, p02, p03, map, p04 … p12), asset paths, library URLs
js/pages/           one file per page
assets/img/         placeholder SVG art (replace with final WebP)
assets/targets/     printable scan card + compiled .mind target
```

## Notes

- The Traditional Chinese narration in `content/content.js` is a draft translation of the storyboard's English narration. Please proofread it, or replace it with the original Chinese script if you have one.
- Icons are inline SVG in `js/icons.js`, so the app has no icon-font dependency.
- Progress is kept only while the page is open: moving between pages keeps it, a reload starts fresh from the welcome page. Nothing is stored on the device. `#reset` or "Experience Again" also clears it.
