# AR-2 Tudigong's Neighborhood · 土地公的街坊

Bilingual (English + Traditional Chinese) AR learning web app. Plain HTML/CSS/JS, MindAR image tracking, landscape only.
Built from the team build guide (`TUDIGONG_DESIGN_GUIDE.md`).

## Status

| Page | Status | Owner |
|---|---|---|
| P00 shell (router, top bar, panel, tokens, components, drag helper, AR helper) | Done | B |
| P01 Home | Done (placeholder art) | A |
| P02 Scan (MindAR) | Done, tested with the placeholder card | B |
| P03 How to Use | Done | A |
| P04 Introduction | Done (placeholder art) | B |
| P05–P12 | Stubs: show "planned for a later milestone" and let you tap Next | see guide |

## Run it

The camera only works over **HTTPS** (or `localhost`).

- On your computer: `python3 -m http.server 8000` in this folder, then open `http://localhost:8000`.
- On a phone/tablet: push the folder to GitHub and turn on **GitHub Pages** (Settings → Pages → deploy from branch), or drag the folder onto **Netlify Drop**. Open the HTTPS link on the device and turn it sideways.

Developer shortcuts: add `#p04` to the URL to jump to a page, `#reset` to clear saved progress.

## Test the scan (P02)

1. Print `assets/targets/tudigong-card.png` (postcard or A5, **matte**, not glossy), or show it full-screen on a second device.
2. Open P02, allow the camera, hold the card flat 20–30 cm from the camera in good light.
3. "Scan Complete 掃描完成" appears, map light points pop up on the card, and Next unlocks.

If the camera is blocked, the page offers **Continue without AR 不使用 AR 繼續** so a demo never gets stuck.

## When the final scan-card art is ready

The `.mind` file must be compiled from the exact image you print.

1. Save the final card as `assets/targets/tudigong-card.png`.
2. Compile it with the MindAR image-target compiler (MindAR docs → Tools → Compile Image Targets).
3. Download the result as `assets/targets/tudigong-card.mind` (same name, replace the old one).
4. Check that the compiler shows feature points spread over the whole card. If one area has none, add detail there.

## Swap placeholder art

All paths are in `js/config.js` → `ASSETS`. Put the final images in `assets/img/` and change the path:

- `p01Hero`: `assets/img/p01_home_hero.webp` (IMG-01)
- `p04Map`: `assets/img/p04_culture_map.webp` (IMG-03). Then adjust the pin positions in `NODES` at the top of `js/pages/p04-intro.js` (values are % of the 3:2 image).

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
js/config.js        page list, asset paths, library URLs
js/pages/           one file per page
assets/img/         placeholder SVG art (replace with final WebP)
assets/targets/     printable scan card + compiled .mind target
```

## Notes

- Chinese narration slots show 【待補：請貼上原始中文旁白】 until the original Chinese script is pasted into `content/content.js`.
- Icons are inline SVG in `js/icons.js` instead of the Phosphor icon font, so the app has no extra online dependency.
- Progress is saved on the device (localStorage). `#reset` or "Experience Again" clears it.
