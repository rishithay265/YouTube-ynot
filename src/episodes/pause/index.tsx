import React from 'react';
import { defineEpisode, Timeline, LookDef, HudChip } from '../../engine';
import timeline from './timeline.json';
import { S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11, S12, S13, S14, S15 } from './shots';

// The power's look: while PAUSE runs the picture cools and drains a touch, a PAUSE chip blinks and a thin cyan
// frame sits round the shot. The world itself freezes inside the shots (their sets get a fixed clock).
const pauseLook: LookDef = {
  grade: (lv) => `saturate(${1 - 0.35 * lv}) hue-rotate(${10 * lv}deg) brightness(${1 + 0.05 * lv})`,
  Overlay: ({ f }) => (
    <g>
      <rect x={14} y={14} width={1892} height={1052} fill="none" stroke="#7FD4FF" strokeWidth={4} opacity={0.35} />
      <HudChip f={f} label="PAUSE" icon="pause" />
    </g>
  ),
};

export const pause = defineEpisode('Pause', {
  timeline: timeline as Timeline,
  shots: { S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11, S12, S13, S14, S15 },
  looks: { pause: pauseLook },
});
