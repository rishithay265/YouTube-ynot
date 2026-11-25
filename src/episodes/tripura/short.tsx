import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, interpolate } from 'remotion';
import { Episode, Timeline } from '../../engine';
import { Captions } from '../../engine/captions';
import timeline from './timeline.json';
import defs from './defs.json';
import { buildShots, Def } from './scenes';
import { P, F } from '../raktabija/world';

// A vertical Short (1080 x 1920) cut from the film: a window [a, b) of the master, the picture re-framed into a square
// in the middle (zoom, focus x), the hook on top, word-by-word Hindi captions below, an end card pointing to the full
// film. The audio is the film's own master from frame a, faded in and out. Nothing is re-voiced.
export type ShortDef = { id: string; a: number; b: number; len: number; hook: string[]; cx: number; zoom: number; words: { w: string; s: number; e: number }[] };

const shots = buildShots(defs as Def[]);
const silent = { ...(timeline as Timeline), audio: {} } as Timeline;
const BOX = 1080; // the square picture window
const TOP = 430;  // its top edge

export const TripuraShort: React.FC<{ d: ShortDef }> = ({ d }) => {
  const f = useCurrentFrame();
  const s = d.zoom, cy = 540;
  const left = BOX / 2 - d.cx * s, top = BOX / 2 - cy * s;
  const endA = d.len - 75;
  const end = interpolate(f, [endA, endA + 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const vol = (fr: number) => interpolate(fr, [0, 8, d.len - 30, d.len - 2], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, #02050E 0%, ${P.navy} 50%, #02050E 100%)` }}>
      {/* the hook */}
      <div style={{ position: 'absolute', top: 120, left: 40, right: 40, textAlign: 'center', fontFamily: F.deva, color: P.goldHi, lineHeight: 1.12,
        fontSize: 86, textShadow: '0 6px 0 #02060F, 0 0 30px rgba(0,0,0,0.6)' }}>
        <div>{d.hook[0]}</div>
        <div style={{ color: '#FF9A3A' }}>{d.hook[1]}</div>
      </div>
      {/* the film, re-framed */}
      <div style={{ position: 'absolute', top: TOP, left: 0, width: BOX, height: BOX, overflow: 'hidden', boxShadow: '0 0 0 3px rgba(227,187,68,0.55)' }}>
        <div style={{ position: 'absolute', left, top, width: 1920, height: 1080, transform: `scale(${s})`, transformOrigin: '0 0' }}>
          <Sequence from={-d.a} layout="none">
            <Episode timeline={silent} shots={shots} bg={P.abyss} xfade={8} grain vignette />
          </Sequence>
        </div>
        {/* end card over the picture */}
        {end > 0 ? (
          <div style={{ position: 'absolute', inset: 0, background: `rgba(1,4,12,${0.94 * end})`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: end, fontFamily: F.deva, color: P.goldHi }}>
            <div style={{ fontSize: 60, color: P.snow }}>पूरी कथा देखें</div>
            <div style={{ fontSize: 120, marginTop: 10 }}>हम त्रिपुर थे</div>
            <div style={{ fontSize: 40, marginTop: 24, color: '#FF9A3A' }}>▶ नीचे दिए लिंक पर</div>
          </div>
        ) : null}
      </div>
      {/* captions */}
      <Captions words={d.words.filter((w) => w.s * 30 < endA)} accent="#FFB040" y={0.835} size={70}
        style={{ upper: false, font: F.deva, spacing: 0, plate: true, maxWords: 4, maxChars: 24, bounce: 0.1, tilt: 0, gap: 18, balance: true, hold: 0.4 }} />
      {/* brand */}
      <div style={{ position: 'absolute', bottom: 60, width: '100%', textAlign: 'center', fontFamily: F.brand, fontSize: 34, letterSpacing: 6, color: P.gold, fontWeight: 600 }}>
        <img src={staticFile('raktabija/logo.webp')} style={{ width: 56, height: 56, verticalAlign: 'middle', marginRight: 14 }} />TheGodmanFiles
      </div>
      <Sequence from={0} layout="none">
        <Audio src={staticFile('tripura/master.flac')} startFrom={d.a} volume={vol} />
      </Sequence>
    </AbsoluteFill>
  );
};
