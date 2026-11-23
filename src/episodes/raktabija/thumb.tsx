import React from 'react';
import { AbsoluteFill, staticFile } from 'remotion';
import { P, F, W, H, Defs, Stars, Drop, rnd } from './world';
import { Asura, Mini, KaliFace } from './cast';

// RaktabijaThumb (1920 x 1080): the brand thumbnail template's composition, drawn in code. Logo top left; the left
// half a dark stone panel carrying the words, bright and high-contrast; the right half an eclipse over Indian temple
// towers. In the eclipse, Kali ma's face (cast.tsx KaliFace): the gold ring becomes her halo, her gaze lowered to the
// field. In front, the narrator, blood-red like everyone born of Raktabija, the earth-mark on his chest, weight on one
// leg, mace resting, looking up at her. Behind him, rows of identical red warriors face her; at the right edge, drops
// fall and bloom into new warriors.

const Gopuram: React.FC<{ x: number; y: number; s: number; o?: number }> = ({ x, y, s, o = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <path d="M-90 0 L-70 -60 L-74 -60 L-56 -120 L-60 -120 L-42 -180 L-46 -180 L-30 -240 L30 -240 L46 -180 L42 -180 L60 -120 L56 -120 L74 -60 L70 -60 L90 0 Z" fill="#06091A" />
    {[-60, -120, -180, -240].map((yy, i) => <path key={i} d={`M${-84 + i * 16} ${yy + 2} L${84 - i * 16} ${yy + 2}`} stroke={P.gold} strokeWidth={2} opacity={0.5} />)}
    <path d="M-34 -240 Q0 -276 34 -240 Z" fill="#06091A" stroke={P.gold} strokeWidth={2} opacity={0.8} />
    {[-24, -12, 0, 12, 24].map((xx) => <path key={xx} d={`M${xx} -262 L${xx} -276`} stroke={P.gold} strokeWidth={3} opacity={0.8} />)}
  </g>
);

export const RaktabijaThumb: React.FC = () => {
  const cx = 1440, cy = 345, r = 285;
  return (
    <AbsoluteFill style={{ backgroundColor: P.abyss }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <Defs />
        <defs>
          <radialGradient id="thCorona" cx="50%" cy="50%" r="50%">
            <stop offset="0.62" stopColor={P.goldHi} stopOpacity={1} />
            <stop offset="0.7" stopColor={P.gold} stopOpacity={0.75} />
            <stop offset="1" stopColor={P.gold} stopOpacity={0} />
          </radialGradient>
          <radialGradient id="thSky" cx="72%" cy="38%" r="70%">
            <stop offset="0" stopColor="#5A3E12" />
            <stop offset="0.35" stopColor="#1E1A2E" />
            <stop offset="1" stopColor={P.abyss} />
          </radialGradient>
          <linearGradient id="thWall" x1="0" x2="1">
            <stop offset="0" stopColor="#060B1E" />
            <stop offset="0.85" stopColor="#0A1230" />
            <stop offset="1" stopColor="#0A1230" stopOpacity={0} />
          </linearGradient>
          <filter id="thTextGlow" x="-20%" y="-40%" width="140%" height="180%">
            <feGaussianBlur stdDeviation="14" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {/* sky and the eclipse */}
        <rect width={W} height={H} fill="url(#thSky)" />
        <Stars t={30} n={120} o={0.6} box={[900, 0, 1020, 700]} />
        <circle cx={cx} cy={cy} r={r * 1.7} fill="url(#thCorona)" opacity={0.85} />
        <circle cx={cx} cy={cy} r={r} fill={P.goldHi} opacity={0.35} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={P.goldHi} strokeWidth={6} />
        {/* Kali ma in the halo, her gaze lowered */}
        <KaliFace x={cx} y={cy + 20} s={0.9} eyes={0} />
        {/* temple towers in the haze */}
        <defs><linearGradient id="thHaze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={P.gold} stopOpacity={0} /><stop offset="0.6" stopColor={P.gold} stopOpacity={0.14} /><stop offset="1" stopColor={P.gold} stopOpacity={0} /></linearGradient></defs>
        <Gopuram x={1080} y={800} s={0.62} o={0.9} />
        <Gopuram x={1190} y={806} s={0.45} o={0.8} />
        <Gopuram x={1680} y={806} s={0.85} />
        <Gopuram x={1560} y={806} s={0.5} o={0.85} />
        <rect x={900} y={790} width={1020} height={290} fill="#04060F" />
        <rect x={900} y={640} width={1020} height={230} fill="url(#thHaze)" />
        {/* the plain below the ledge, and the rows of identical warriors facing her, fading with distance */}
        <path d="M940 812 L1920 796 L1920 1080 L900 1080 Z" fill="#05081A" />
        <path d="M940 812 L1920 796" stroke={P.gold} strokeWidth={2} opacity={0.45} />
        {Array.from({ length: 6 }, (_, r) => {
          const k = r / 5; // 0 = far row, 1 = nearest row
          const y = 812 + 150 * k * k, sc = 0.13 + 0.27 * k * k, n = Math.round(15 - 7 * k);
          return (
            <g key={r} opacity={0.3 + 0.6 * k}>
              {Array.from({ length: n }, (_, i) => {
                const x = 960 + (i + 0.5 + (rnd(7, r * 31 + i) - 0.5) * 0.5) * (960 / n);
                return Math.abs(x - 1140) < 130 * (0.5 + k) && r > 2 ? null : <Mini key={i} x={x} y={y} s={sc} back tone="blood" rim={0.6 + 0.4 * k} />;
              })}
            </g>
          );
        })}
        <rect x={900} y={780} width={1020} height={120} fill="url(#thHaze)" opacity={0.7} />
        {/* drops falling at the edge, each blooming into another warrior */}
        <Drop x={1835} y={640} s={0.9} />
        <Drop x={1752} y={760} s={0.8} />
        <ellipse cx={1752} cy={846} rx={38} ry={8} fill="none" stroke={P.goldHi} strokeWidth={2.4} opacity={0.8} />
        <Mini x={1680} y={900} s={0.36} rise={0.55} tone="blood" />
        <Mini x={1850} y={930} s={0.42} rise={0.85} tone="blood" />
        <ellipse cx={1680} cy={900} rx={46} ry={9} fill={P.gold} opacity={0.35} />
        {/* the narrator */}
        <ellipse cx={1125} cy={1042} rx={140} ry={14} fill="#000" opacity={0.5} />
        <Asura id="thumb" x={1135} y={1040} s={0.86} pose="rest" contra look={0.8} mark tone="blood" fierce t={0} rim={1} />
        <circle cx={1135 - 0.86 * 6} cy={1040 - 0.86 * 246} r={56} fill="#E0A050" opacity={0.25} filter="url(#rkBlur8)" />
        {/* the stone panel for the words */}
        <rect x={0} y={0} width={1060} height={H} fill="url(#thWall)" />
        {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M0 ${120 * i + 40} L${980 + (i % 2) * 40} ${120 * i + 40}`} stroke="#121A3A" strokeWidth={2} />)}
        <image href={staticFile('raktabija/logo.webp')} x={40} y={30} width={210} height={210} />
        {/* the words: bright, high-contrast */}
        <g filter="url(#thTextGlow)">
          <text x={90} y={500} fontFamily={F.deva} fontSize={196} fill="#FFF4CF" stroke="#2A1A00" strokeWidth={3} paintOrder="stroke">मैं रक्तबीज</text>
          <text x={90} y={740} fontFamily={F.deva} fontSize={210} fill={P.goldHi} stroke="#2A1A00" strokeWidth={3} paintOrder="stroke">नहीं था</text>
        </g>
        <path d="M96 800 L780 800" stroke={P.lacquerHi} strokeWidth={10} strokeLinecap="round" />
        <g transform="translate(830 800) scale(1.6)">
          <path d="M0 -24 Q14 -4 14 8 A14 14 0 0 1 -14 8 Q-14 -4 0 -24 Z" fill={P.lacquerHi} />
          <circle cx={-3} cy={5} r={3.5} fill={P.goldHi} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
