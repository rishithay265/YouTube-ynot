# FaceStealer v2: how the cut is built

A ~4 minute re-edit of `src/episodes/facestealer` (the long-form folder is a separate project and is untouched).

## Pipeline (run from the repo root)

1. **Script**: `script_v2.json`, 8 narration sections plus the chosen take of each (`picks`).
2. **Narration**: ElevenLabs `eleven_v4`, voice "Ryan - American Documentary Narrator" (`GQQpeRnV5mCWTgxKhGo5`),
   two takes per section in `tts/`. `wer.py` scores each take against the script with pocketsphinx; the lower-error
   take was kept.
3. **Alignment**: `python align.py tts/<take>.mp3 <section> al/<take>.json` (pocketsphinx forced alignment; its
   English model ships inside the pip package). `tokens.py` maps script words to caption tokens and spoken words.
4. **Plan**: `python research/facestealer/v2/plan_v2.py` joins the takes into the voice stem (light EQ, 2:1 leveller,
   plosive peak stage, de-ess), writes `words.json` (captions), `defs.json` (shots), `timeline.json` and `episode.json`.
   Shots cut on cue words from `shots_v2.py`; marks give scenes the frame of words inside a shot.
5. **Sound**: `python research/facestealer/v2/sound_v2.py` places SFX from `library/sfx` on shots and marks, loops the
   episode's music bed with crossfades, ducks it under the voice, and masters to `public/facestealer/master.wav`
   (-16 LUFS integrated, true peak <= -1.5 dBTP).
6. **Render**: `npx remotion render src/index.ts FaceStealer out/facestealer.mp4 --codec=h264 --crf=17 --audio-codec=aac --audio-bitrate=320k`
   Thumbnails: compositions `FaceStealerThumb` (HE WASN'T THERE) and `FaceStealerThumbUserFixed`.

Python deps: `pip install -r research/facestealer/v2/requirements.txt` (plus ffmpeg). Evidence highlight boxes come
from `tesseract <page>.png out tsv` + `findquote.py out.tsv "<quote>"`; the results are written into `shots_v2.py`.

## Changelog (v1 -> v2)

- **Hook**: opens on the "friend" in a call; at 2.9 s it is revealed as a looping recorded file (REC + scrub bar), and
  $400M STOLEN is on screen by 3.3 s, mirroring the thumbnail. The "it's usually not an AI deepfake" twist and the FBI
  quote about prerecorded victim video now come in the first 20 s (was 2:30).
- **Length**: 5:06 -> 3:59. Script rewritten tighter (614 words); repeated beats merged (one chain shot, one AI beat,
  one checklist instead of six recommendation cards).
- **Focus**: Binance/TraderTraitor section removed (saved in `../binance-episode-notes.md`).
- **Evidence**: unreadable full-page screenshots replaced by crops of the exact lines, enlarged, with OCR-precise
  highlights that sweep as the words are spoken, plus the sentence set large and verbatim with the key phrase in yellow.
- **Visuals**: same palette and cast; avatars gained expressions (smile, worry, shock, bored, glances); 6-frame
  dissolves between shots (hard cuts kept on reveals); new scenes for the hook, twist, domains, "you're next",
  checklist and recovery steps; every layout keeps clear of the caption band (y > 880).
- **Captions** (`src/engine/captions.tsx`): fixed the chunk-length check, which joined objects
  (`cur.join(' ')` gave "[object Object]...", so every chunk broke after two words); chunks now measure their text.
  New opt-in style: dark plate, 64 px, max 3 words / 22 chars, no dangling small words, hidden during pauses, minimum
  on-screen time. Numbers shown as digits ($400 MILLION, 900). Other episodes keep their look.
- **Audio**: new narration, rebuilt SFX track and music bed, ducking, mastered to -16 LUFS / -1.5 dBTP (was -24.9 LUFS).
- **Thumbnail**: `FaceStealerThumb` simplified to one face in a call window, REC, and HE WASN'T THERE.
