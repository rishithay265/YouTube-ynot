import React from 'react';
import { AbsoluteFill, staticFile } from 'remotion';
import { ShotFrame, FONT } from '../../engine';
import { C, Tile, Win, T } from './ui';

// Thumbnail (1920 x 1080; YouTube scales it): one familiar face in a fake video-call window, a REC indicator, and
// three words, HE WASN'T THERE. Built to read at phone size: one subject, two text lines over 200 px tall, high
// contrast. The face is an original avatar, not a real person.
export const FaceStealerThumb: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: '#060912' }}>
    <ShotFrame>
      <defs>
        <radialGradient id="tbg" cx="32%" cy="45%" r="80%"><stop offset="0" stopColor="#3A0F24" /><stop offset="1" stopColor="#060912" /></radialGradient>
        <filter id="tbl"><feGaussianBlur stdDeviation="60" /></filter>
      </defs>
      <rect width={1920} height={1080} fill="url(#tbg)" />
      <circle cx={560} cy={540} r={430} fill={C.red} opacity={0.28} filter="url(#tbl)" />
      <Win x={60} y={120} w={1040} h={840} id="th" title="Meeting" danger rot={-3}>
        <Tile id="th1" x={30} y={76} w={980} h={734} face={0} t={0} glitch={0.18} mood="smile" label="Sam" mic={true} border={C.red} />
        <g transform="translate(70 150)">
          <rect x={-10} y={-50} width={250} height={100} rx={50} fill="#000" opacity={0.75} stroke={C.red} strokeWidth={5} />
          <circle cx={42} cy={0} r={22} fill={C.red} />
          <T x={82} y={20} size={56} anchor="start" color={C.red} mono weight={700}>REC</T>
        </g>
      </Win>
      <g transform="translate(1470 450) rotate(-4)">
        <T x={0} y={0} size={210} color={C.wht} stroke="#04060C">HE</T>
        <T x={0} y={200} size={200} color={C.wht} stroke="#04060C">WASN'T</T>
      </g>
      <g transform="translate(1470 880) rotate(-4)">
        <rect x={-310} y={-180} width={620} height={226} rx={26} fill={C.yel} />
        <T x={0} y={0} size={210} color="#05060C">THERE</T>
      </g>
    </ShotFrame>
  </AbsoluteFill>
);

// The creator's own thumbnail (public/facestealer/thumb-user.webp, 1672 x 941) with one wording fix: "ONE FAKE CALL" said a
// single call stole $400M; the FBI figure is the scheme's total over 18 months, so the line becomes FAKE VIDEO CALLS.
export const FaceStealerThumbUserFixed: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: '#000' }}>
    <svg width={1672} height={941} viewBox="0 0 1672 941">
      <defs>
        <filter id="ufb" x="-10%" y="-30%" width="120%" height="160%"><feGaussianBlur stdDeviation="26" /></filter>
        <filter id="uff" x="-20%" y="-60%" width="140%" height="220%"><feGaussianBlur stdDeviation="16" /></filter>
        <mask id="ufm"><rect x={664} y={146} width={1002} height={182} rx={60} fill="#fff" filter="url(#uff)" /></mask>
        <filter id="ufglow" x="-10%" y="-50%" width="120%" height="200%"><feGaussianBlur stdDeviation="8" /></filter>
      </defs>
      <image href={staticFile('facestealer/thumb-user.webp')} width={1672} height={941} />
      <g mask="url(#ufm)">
        <image href={staticFile('facestealer/thumb-user.webp')} width={1672} height={941} filter="url(#ufb)" />
        <rect x={680} y={140} width={980} height={210} fill="#08070d" opacity={0.78} />
      </g>
      <rect x={900} y={318} width={660} height={10} rx={5} fill="#FF2340" filter="url(#ufglow)" opacity={0.9} />
      <rect x={900} y={318} width={660} height={8} rx={4} fill="#FF2340" />
      <g transform="translate(1160 290) skewX(-9)">
        <text x={0} y={0} fontSize={108} fontWeight={800} fontFamily={FONT.title} textAnchor="middle" fill="#fff" stroke="#05060c" strokeWidth={12} paintOrder="stroke fill" strokeLinejoin="round" letterSpacing={-1}>FAKE VIDEO CALLS</text>
      </g>
    </svg>
  </AbsoluteFill>
);
