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
| P04 Introduction | Done (aerial culture map) | B |
| P05–P12 | Stubs: show "planned for a later milestone" and let you tap Next | see guide |

## Run it

The camera only works over **HTTPS** (or `localhost`).

- On your computer: `python3 -m http.server 8000` in this folder, then open `http://localhost:8000`.
- On a phone/tablet: push the folder to GitHub and turn on **GitHub Pages** (Settings → Pages → deploy from branch), or drag the folder onto **Netlify Drop**. Open the HTTPS link on the device and turn it sideways.

Developer shortcuts: add `#p04` to the URL to jump to a page, `#reset` to clear saved progress.

## Narration audio

Upload one MP3 per page into `assets/audio/`, named `p01.mp3` … `p12.mp3` (optional `p01_zh.mp3` / `p01_en.mp3` for the 中文 / English modes). The "Listen to narration 聆聽旁白" button under each page title finds them automatically; pages without a file show "Narration coming soon". On GitHub: open the `assets/audio` folder → **Add file → Upload files** → drag the MP3s in → **Commit changes**. See `assets/audio/README.md`.

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

## When the final scan-card art is ready

The `.mind` file must be compiled from the exact image you print.

1. Save the final card as `assets/targets/tudigong-card.png`.
2. Compile it with the MindAR image-target compiler (MindAR docs → Tools → Compile Image Targets).
3. Download the result as `assets/targets/tudigong-card.mind` (same name, replace the old one).
4. Check that the compiler shows feature points spread over the whole card. If one area has none, add detail there.

## Design: v2 "Temple craft"

Glazed-teal lacquer, temple gold trim and vermilion on warm paper, serif titles, gold-ringed medallion pins, a red seal stamp on question boxes and a carved-wood frame around maps. Everything is defined in `css/tokens.css`. Gold is used for trim and ornaments only (no deity close-ups, no black-and-gold, no rays or smoke), so the storyboard's cultural rules still hold.

## Art

The stage background is a semi-realistic dawn landscape of misty mountains and terraced rice paddies (`bg_mural.webp`; the welcome page uses `welcome_bg.webp` plus the transparent `sprite_shrine.webp` / `sprite_banyan.webp`) with two transparent cloud layers (`bg_clouds_far.webp`, `bg_clouds_near.webp`) that drift left on a loop, like clouds in the wind. Motion stops automatically when a device has Reduce Motion switched on.


`assets/img/p01_home_hero.webp`, `assets/img/p04_culture_map.webp` and `assets/targets/tudigong-card.png` are in-house semi-realistic illustrations. Their editable SVG sources are in `assets/source-art/`. To use other art, change the paths in `js/config.js` → `ASSETS`:

- `welcomeBg`, `shrine`, `banyan`: the welcome scene. Shrine/banyan positions are `.w-shrine` / `.w-banyan` in `css/welcome.css` (% of the 16:9 scene).
- `p04Map`: adjust the pin positions in `NODES` at the top of `js/pages/p04-intro.js` (% of the 3:2 image). The map is shown zoomed (see `ZOOM`).

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
js/ar-diorama.js    the 3D pop-up neighbourhood shown on the card (three.js, no model files)
js/narration.js     narration player + Listen button
js/config.js        page list, asset paths, library URLs
js/pages/           one file per page
assets/img/         placeholder SVG art (replace with final WebP)
assets/targets/     printable scan card + compiled .mind target
```

## Notes

- Chinese narration slots show 【待補：請貼上原始中文旁白】 until the original Chinese script is pasted into `content/content.js`.
- Icons are inline SVG in `js/icons.js`, so the app has no icon-font dependency.
- Progress is saved on the device (localStorage). `#reset` or "Experience Again" clears it.
