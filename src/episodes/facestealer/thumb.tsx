import React from 'react';
import { AbsoluteFill } from 'remotion';
import { ShotFrame } from '../../engine';
import { C, Tile, Win, T, Avatar, FACES, Chip } from './ui';

// Thumbnail (1280 x 720, drawn in the 1920 x 1080 world): a familiar face in a call window, a red REC badge, "$400M",
// and the line THAT FACE WAS STOLEN. The face is an original avatar, not a real person.
export const FaceStealerThumb: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: '#060912' }}>
    <ShotFrame>
      <defs>
        <radialGradient id="tb" cx="30%" cy="40%" r="80%"><stop offset="0" stopColor="#3A0F24" /><stop offset="1" stopColor="#060912" /></radialGradient>
        <filter id="tbl"><feGaussianBlur stdDeviation="50" /></filter>
      </defs>
      <rect width={1920} height={1080} fill="url(#tb)" />
      <circle cx={560} cy={500} r={420} fill={C.red} opacity={0.25} filter="url(#tbl)" />
      <Win x={70} y={90} w={1000} h={720} id="th" title="Meeting" danger rot={-2}>
        <Tile id="th1" x={30} y={76} w={940} h={610} face={0} t={0} rec={true} glitch={0.22} label="Sam" mic={true} border={C.red} />
      </Win>
      <g transform="translate(1440 430) rotate(3)">
        <T x={0} y={0} size={215} color={C.red} stroke="#04060C">$400M</T>
      </g>
      <g transform="translate(1440 560) rotate(3)">
        <T x={0} y={0} size={84} stroke="#04060C" color={C.wht}>STOLEN IN</T>
        <T x={0} y={92} size={84} stroke="#04060C" color={C.wht}>18 MONTHS</T>
      </g>
      <g transform="translate(960 960)">
        <rect x={-720} y={-100} width={1440} height={150} rx={30} fill="#FFE14A" />
        <T x={0} y={18} size={118} color="#05060C">THAT FACE WAS STOLEN</T>
      </g>
    </ShotFrame>
  </AbsoluteFill>
);
