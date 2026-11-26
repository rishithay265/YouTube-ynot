import React from 'react';
import { AbsoluteFill, staticFile } from 'remotion';
import { F } from '../raktabija/world';
import { EN } from './art';

// The creator's generated Kubera artwork, corrected: the garbled pseudo-Sanskrit arc is blurred away and replaced
// with the real 35-syllable mantra (Mantramahodadhi 16.105–107), the empty yantra gets the exact Kubera square
// mapped onto its tilted plane, and the title is added in the brand serif. Drawn in the image's own 1376×768 space.
const ARC = 'M 165 452 C 120 300 210 140 330 85 C 420 45 520 40 600 75 C 700 120 750 250 712 420';
const ARC_OUT = 'M 140 452 C 92 285 188 100 318 42 C 420 2 535 4 615 40 C 728 92 785 240 748 425';
const MANTRA = 'ॐ यक्षाय कुबेराय वैश्रवणाय धनधान्याधिपतये धनधान्यसमृद्धिं मे देहि दापय स्वाहा';
const NUMS = [27, 20, 25, 22, 24, 26, 23, 28, 21];
// yantra inner grid: TL (1010,286), TR (1211,279), BL (969,472) -> affine map from a 300×300 unit square
const M = `matrix(${201 / 300} ${-7 / 300} ${-41 / 300} ${186 / 300} 1010 286)`;

export const KuberaThumbAI: React.FC = () => (
  <AbsoluteFill style={{ background: '#000' }}>
    <svg width={1920} height={1080} viewBox="0 0 1376 768">
      <defs>
        <filter id="tBlur" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="9" /></filter>
        <mask id="tBand"><rect width={1376} height={768} fill="black" /><path d={ARC} stroke="white" strokeWidth={70} fill="none" strokeLinecap="round" filter="url(#tBlur)" /><path d={ARC_OUT} stroke="white" strokeWidth={70} fill="none" strokeLinecap="round" filter="url(#tBlur)" /></mask>
        <filter id="tGlow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        <path id="tArc" d={ARC} />
      </defs>
      <image href={staticFile('kubera/thumb_ai_base.png')} width={1376} height={768} />
      {/* erase the garbled script: a heavily blurred copy of the picture, only along the arc band */}
      <g mask="url(#tBand)"><image href={staticFile('kubera/thumb_ai_base.png')} width={1376} height={768} filter="url(#tBlur)" /><image href={staticFile('kubera/thumb_ai_base.png')} width={1376} height={768} filter="url(#tBlur)" opacity={0.9} /></g>
      {/* the real mantra on the same arc */}
      <text fontFamily={F.sanskrit} fontSize={31} fill="#FFE9A8" stroke="#5A2E00" strokeWidth={2.2} paintOrder="stroke" filter="url(#tGlow)">
        <textPath href="#tArc" startOffset="50%" textAnchor="middle">{MANTRA}</textPath>
      </text>
      {/* the yantra numbers, on the grid's own plane */}
      <g transform={M}>
        {NUMS.map((n, i) => (
          <text key={i} x={(i % 3) * 100 + 50} y={Math.floor(i / 3) * 100 + 74} textAnchor="middle" fontFamily={EN} fontWeight={700} fontSize={68}
            fill={i === 4 ? '#FFF4C8' : '#FFD86B'} stroke="#3A1E00" strokeWidth={3} paintOrder="stroke" filter="url(#tGlow)">{n}</text>
        ))}
      </g>
      {/* title */}
      <g fontFamily={EN} fontWeight={700} textAnchor="end" stroke="#120800" paintOrder="stroke">
        <text x={1352} y={84} fontSize={66} fill="#FFD86B" strokeWidth={9} letterSpacing={2}>KUBERA YANTRA</text>
        <text x={1352} y={156} fontSize={60} fill="#FFD86B" strokeWidth={9} letterSpacing={2}>&amp; MANTRA</text>
      </g>
      <text x={1060} y={712} textAnchor="middle" fontFamily={EN} fontWeight={700} fontStyle="italic" fontSize={58} fill="#FF9A3A" stroke="#160800" strokeWidth={9} paintOrder="stroke">for Wealth</text>
    </svg>
  </AbsoluteFill>
);
