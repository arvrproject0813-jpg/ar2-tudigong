# Your own 3D model

Upload **`tudigong-neighborhood.glb`** to this folder and the app uses it automatically:
- **P02**: it rises out of the culture card in AR.
- **P04**: it appears in the 3D view students can turn and zoom.

When there is no file here, the built-in model is used. If the file fails to load, the built-in model is used too, and the browser console says why.

See `assets/source-art/tudigong_3d_reference_sheet.png` for the layout plan, palette and look.
`assets/source-art/tudigong-neighborhood-starter.glb` is today's built-in model as a starting point (open it in Blender: File → Import → glTF 2.0).

## Specs

| | |
|---|---|
| Format | one `.glb` (glTF 2.0 binary), named `tudigong-neighborhood.glb` |
| File size | under 5 MB, ideally 2–3 MB; Draco compression is supported |
| Triangles | under 60,000 in total |
| Textures | 1024 px (2048 max), JPG for colour, at most 8, embedded |
| Materials | Principled BSDF only (bake procedural textures); roughness 0.7–0.85; metallic 0 except gold trim (0.5 / roughness 0.35) |
| Scale | 1 unit = card width; footprint 0.92 × 0.62; nothing taller than 0.35. The app re-fits size and position anyway |
| Facing | Blender Front view (numpad 1) = the card's bottom edge (title banner side). Z up in Blender; keep the exporter's **+Y Up** ticked |
| Before export | apply all transforms (Ctrl+A), apply modifiers; no lights or cameras |
| Pop-up | keep the temple, houses, trees, market, etc. as separate top-level objects: each rises in turn, largest first |
| P04 pins (optional) | empties named `pin_temple`, `pin_fields`, `pin_market`, `pin_corner` where each info pin should float; without them the pins use the built-in positions |
| Animation (optional) | any animation clip in the file plays on a loop |

Cultural rules: shrine architecture, an empty offering table, stone lions, lanterns and the old banyan only. No deity statue or close-up, no incense burner, moon blocks, smoke, glow or light rays, no readable plaque text, and no copy of a specific real temple.
