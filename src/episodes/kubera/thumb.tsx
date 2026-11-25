import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { P, Defs } from '../raktabija/world';
import { KUBERA, Grid, KDefs, EN } from './art';

// Thumbnail: the real Bharhut Kubera (Cunningham 1879, public domain) beside the glowing 72-grid.
export const KuberaThumb: React.FC = () => (
  <AbsoluteFill style={{ background: '#030A1C' }}>
    <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: 'absolute' }}>
      <Defs /><KDefs />
      <rect width={1920} height={1080} fill="url(#kSky)" />
      <circle cx={1260} cy={520} r={560} fill="url(#kGlowGold)" opacity={0.55} />
    </svg>
    <div style={{ position: 'absolute', left: 40, top: 30, width: 470, height: 1020, overflow: 'hidden', borderRadius: 8, boxShadow: '0 0 60px rgba(227,187,68,0.45)', border: `4px solid ${P.gold}` }}>
      <Img src={staticFile('kubera/bharhut_kupira_tight.jpg')} style={{ width: 470, height: 1020, objectFit: 'cover', objectPosition: '50% 12%', filter: 'sepia(0.35) contrast(1.15) brightness(1.05)' }} />
    </div>
    <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: 'absolute' }}>
      <Defs /><KDefs />
      <Grid x={1180} y={560} c={235} nums={KUBERA} fs={118} lit={[{ i: 6, o: 1 }, { i: 1, o: 0.8 }]} hi={[0, 0, 0, 0, 1, 0, 0, 0, 0]} />
      <text x={1180} y={150} textAnchor="middle" fontFamily={EN} fontWeight={700} fontSize={118} fill={P.goldHi} stroke="#020611" strokeWidth={10} paintOrder="stroke" letterSpacing={6}>KUBERA’S CODE</text>
      <text x={1760} y={1010} textAnchor="end" fontFamily={EN} fontWeight={700} fontSize={150} fill={P.ember} stroke="#020611" strokeWidth={12} paintOrder="stroke" filter="url(#rkGlow)">= 72</text>
    </svg>
  </AbsoluteFill>
);
