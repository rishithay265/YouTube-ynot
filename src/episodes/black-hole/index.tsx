import React from 'react';
import { defineEpisode, Timeline } from '../../engine';
import timeline from './timeline.json';
import words from './words.json';
import * as shots from './shots';

// "What if you fell into a black hole?" A portrait (1080 x 1920) science episode for YouTube Shorts.
const { S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11, S12, S13, S14, S15, S16, S17, S18, S19, S20, S21, S22, S23, S24, S25, S26, S27, S28, S29, S30, S31, S32 } = shots;

export const blackHole = defineEpisode('BlackHole', {
  timeline: timeline as Timeline,
  portrait: true, captions: words, capY: 0.72,
  bg: '#04020A',
  shots: { S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11, S12, S13, S14, S15, S16, S17, S18, S19, S20, S21, S22, S23, S24, S25, S26, S27, S28, S29, S30, S31, S32 },
});
