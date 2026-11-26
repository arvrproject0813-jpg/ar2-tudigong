# Narration audio

The page narration (the **Listen to narration** button in "Story and words") has one set of MP3s per page:

p01.mp3 … p12.mp3 plays in bilingual mode (English, then Mandarin), and as the fallback
p01_en.mp3 … plays in English mode
p01_zh.mp3 … plays in 中文 mode

They are read from `CONTENT.pXX.narration` in `content/content.js` by the open-source Kokoro voice model
(English voice af_sol, Mandarin voice zf_018), the same voice as the voice guide. If you change a page's narration text,
make its audio again with `assets/source-art/tts/make.py narration p06` (setup notes are at the top of that file).
To use a recording of a real person instead, replace the files with the same names
(MP3, mono, 48–128 kbps, so each file stays under about 1 MB).

Other folders:

- `guide/` the short voice guide that speaks when a page opens (`make.py guide p06`)
- `p11/` every sentence a student can build on P11, for its Listen button (`make.py p11`)
- `bgm.mp3` the background music

Pages without a narration file show "Narration coming soon 旁白即將上線".
