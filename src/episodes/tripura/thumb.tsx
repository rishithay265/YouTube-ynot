import React from 'react';
import { AbsoluteFill, staticFile } from 'remotion';
import { P, F, W, H, Defs, Stars } from '../raktabija/world';
import { MetalDefs, City, Shiva, Flame, Embers } from './cast';

// TripuraThumb (1920 x 1080), the film's own cast and look: Shiva as Tripurari on the left, the bow drawn, the third eye
// glowing; on the right the three cities in their one line, the top one already catching fire; the arrow between them.
// Title in the middle band. No elements that are not in the film.
export const TripuraThumb: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: P.abyss }}>
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <Defs /><MetalDefs />
      <rect width={W} height={H} fill="url(#rkSky)" />
      <Stars t={30} n={160} o={0.8} box={[0, 0, W, H]} />
      <circle cx={1560} cy={540} r={520} fill="url(#tpHeat)" opacity={0.55} />
      {/* the cities in one line */}
      <City id="th-g" k="gold" x={1580} y={250} s={0.4} t={30} burn={0.55} heat={0.4} />
      <City id="th-s" k="silver" x={1580} y={560} s={0.4} t={30} burn={0.2} />
      <City id="th-i" k="iron" x={1580} y={870} s={0.4} t={30} burn={0.1} />
      <path d="M1580 60 L1580 1040" stroke="#FFE9B0" strokeWidth={22} opacity={0.18} />
      {/* Tripurari */}
      <Shiva x={340} y={1150} s={1.12} t={30} pose="draw" pull={1} eye={0.8} anger={0.35} glow={0.7} arrow={false} />
      {/* the arrow, in flight */}
      <path d="M700 512 L1360 512" stroke="#FFB040" strokeWidth={46} strokeLinecap="round" opacity={0.3} />
      <path d="M700 512 L1360 512" stroke="#8FB4FF" strokeWidth={12} strokeLinecap="round" />
      <path d="M1350 486 L1420 512 L1350 538 Z" fill={P.goldHi} />
      <Flame x={1426} y={530} h={110} t={30} seed={3} />
      <Embers t={30} n={70} o={0.8} box={[1200, 0, 720, 1080]} />
      {/* title */}
      <g textAnchor="middle" fontFamily={F.deva}>
        <text x={1010} y={330} fontSize={170} fill={P.goldHi} stroke="#02060F" strokeWidth={8} paintOrder="stroke">हम</text>
        <text x={1010} y={800} fontSize={196} fill="#FF8A3A" stroke="#02060F" strokeWidth={8} paintOrder="stroke">त्रिपुर थे</text>
      </g>
      <text x={1010} y={935} textAnchor="middle" fontFamily={F.brand} fontSize={40} fontWeight={600} letterSpacing={8} fill={P.snow} stroke="#02060F" strokeWidth={4} paintOrder="stroke">WE WERE TRIPURA</text>
      <image href={staticFile('raktabija/logo.webp')} x={1740} y={20} width={150} height={150} />
    </svg>
  </AbsoluteFill>
);
