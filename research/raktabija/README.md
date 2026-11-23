# मैं रक्तबीज नहीं था (I Was Not Raktabija): production pipeline

TheGodmanFiles' first film in this repository. The Devi Mahatmya's Raktabija battle (ch. 8), told by one of the warriors
born from his blood. Hindi narration, gold line-art on navy, 1920 x 1080 at 30 fps. Adapted from `research/facestealer/v2`
(the scripts here never touch another episode's files).

## Steps (from the repo root)

1. **Script**: `script.json` is the locked, approved script (sections, lines, cards). `~` marks a held pause.
2. **Narration**: `python research/raktabija/tts_prompts.py` writes `tts/prompts.json` (the exact ElevenLabs prompts,
   stage tags included). Generated with ElevenLabs `eleven_v4`, voice Mohit, two takes per section where the credits
   allowed (`tts/sessions.json`, `tts/generations.json`). Takes are `tts/<section>_<a|b>.mp3`.
3. **Word timings**: ElevenLabs Scribe forced alignment of each take (raw output `tts/al/raw_<take>.json`), then
   `python research/raktabija/align.py` writes `tts/al/<take>.json` and the spot-checks (`tts/al/check.json`: Scribe start
   times against the speech onsets in the waveform, and against Whisper's independent word times).
4. **Pick takes**: `python research/raktabija/pick_takes.py` has Whisper large-v3 hear each take line by line, without the
   script, and keeps the lowest character error rate per section (`tts/asr.json`, `tts/chosen.json`). This replaces
   v2's English-only pocketsphinx check. `asr_check.py` is the same check for any single file.
5. **Plan**: `python research/raktabija/plan.py` assembles the chosen takes into `stems/voice.wav` with the inserted
   pauses (the opening card, the title drop, the verse card), writes `src/episodes/raktabija/{words,defs,timeline,episode}.json`,
   and the subtitles `subs/raktabija.hi.srt` and `subs/raktabija.en.srt` (one cue per script line). Shots come from
   `shots.py`: each cuts on a cue word, and its marks are local frames of words, so reveals land on the voice.
6. **Sound**: `python research/raktabija/sound.py` writes the SFX and music stems and the master
   `public/raktabija/master.wav` (-16 LUFS integrated, true peak <= -1.5 dBTP). Everything is synthesised in the script
   except three clips from `library/sfx`. See `CREDITS.md`.
7. **Description**: `python research/raktabija/publish.py` writes `description.md` with chapters from the real timeline.
8. **Check**: `npm run typecheck`. Stills: the `RaktabijaBoard` composition (one frame per shot), `RaktabijaCast`
   (the cast sheet, 3 frames) and `RaktabijaThumb`.
9. **Render**:
   `npx remotion render src/index.ts Raktabija out/raktabija.mp4 --codec=h264 --crf=17 --audio-codec=aac --audio-bitrate=320k`
   and `npx remotion still src/index.ts RaktabijaThumb out/raktabija-thumb.png`.
   In a cloud session behind the agent proxy, add `--browser-executable=<wrapper>`: a script that drops Remotion's
   `--no-proxy-server` flag and passes `--proxy-server=$HTTPS_PROXY`, so Chrome can fetch the Google Fonts.

## Where things are
- `src/episodes/raktabija/world.tsx`: palette, fonts, battlefield, peaks, Nagara shikhara, stars, drops, gold dust.
- `src/episodes/raktabija/cast.tsx`: the one Asura component (Raktabija, every clone and the narrator: identical by
  construction; the narrator differs only by the earth-mark on his chest), the Devi's forms as temple bronzes (the seven
  Matrikas, Shivaduti, Chandika: mounts and weapons per the ledger), Kali felt not shown, the gods.
- `src/episodes/raktabija/scenes.tsx`: the 55 shots. `thumb.tsx`: the thumbnail. `castsheet.tsx`: the cast sheet.
- `src/studio.config.ts` (`brand`): the wordmark and Devanagari fonts.
- Captions are off (the .srt files go to YouTube). The engine's captions gained `upper`, `font` and `spacing` options so
  Devanagari is never uppercased or letter-spaced apart, if they are ever burned in.

## Not committed
`stems/` (rebuilt by plan.py and sound.py) and `out/`. `public/raktabija/master.wav` (the lossless `master.flac` beside it is committed: the render plays it).
