import { defineEpisode, Timeline } from '../../engine';
import timeline from './timeline.json';
import defs from './defs.json';
import { buildShots, Def } from './scenes';
import { P } from '../raktabija/world';

// "हम त्रिपुर थे" (We Were Tripura), TheGodmanFiles, for Kartika Purnima. The burning of the three cities told by the
// cities themselves, after the Shiva Mahapurana (Gita Press, Rudra Samhita, Yuddha Khanda 1-12) and the pravachan of
// Sri Chaganti Koteswara Rao garu. 1920 x 1080, 30 fps, Hindi narration (ElevenLabs, voice Mohit). Gold line-art on navy,
// drawn in code (cast.tsx; the Raktabija world and Asura are reused, never modified). No burned-in captions: the .srt
// files for upload are written by research/tripura/plan.py.

export const tripura = defineEpisode('Tripura', {
  timeline: timeline as Timeline,
  bg: P.abyss,
  xfade: 8,
  grain: true,
  vignette: true,
  shots: buildShots(defs as Def[]),
});
