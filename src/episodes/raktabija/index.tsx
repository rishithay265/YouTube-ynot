import { defineEpisode, Timeline } from '../../engine';
import timeline from './timeline.json';
import defs from './defs.json';
import { buildShots, Def } from './scenes';
import { P } from './world';

// "मैं रक्तबीज नहीं था" (I Was Not Raktabija), TheGodmanFiles. An imagined perspective rooted in the Devi Mahatmya,
// ch. 8: the battle with Raktabija told by one of the warriors born from his blood. 1920 x 1080, 30 fps, Hindi
// narration (ElevenLabs, voice Mohit). Gold line-art and silhouettes on navy, drawn in code (cast.tsx, world.tsx).
// No burned-in captions: Hindi and English .srt files for upload are written by research/raktabija/plan.py, which also
// writes timeline.json, defs.json and words.json from the narration's word timings.

export const raktabija = defineEpisode('Raktabija', {
  timeline: timeline as Timeline,
  bg: P.abyss,
  xfade: 8,
  grain: true,
  vignette: true,
  shots: buildShots(defs as Def[]),
  // Captions are off by design (the .srt files go to YouTube). To burn Hindi captions in, pass words.json here with
  // capStyle { upper: false, font: F.deva, spacing: 0, plate: true, size: 58, maxWords: 5, maxChars: 30 }: no
  // uppercasing (Devanagari has no case) and no letter-spacing (it splits conjuncts and matras).
});
