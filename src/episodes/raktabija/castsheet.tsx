import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { P, F, W, H, Defs, Field, Motes } from './world';
import { Asura, Shakti, KaliPresence, ShaktiKind, SHAKTI } from './cast';

// The cast sheet (RaktabijaCast, 1920 x 1080, 3 frames): frame 0 = the Asura side (Raktabija, a clone, the narrator),
// frame 1 = the Matrikas and Shivaduti, frame 2 = Chandika and Kali (felt, not shown). Every shot in the film draws its figures from these components, so this sheet is the
// consistency reference for the quality gate.

const Tag: React.FC<{ x: number; y: number; hi: string; en: string; note?: string }> = ({ x, y, hi, en, note }) => (
  <g>
    <text x={x} y={y} textAnchor="middle" fontFamily={F.deva} fontSize={40} fill={P.goldHi}>{hi}</text>
    <text x={x} y={y + 38} textAnchor="middle" fontFamily={F.brand} fontSize={28} fontWeight={600} fill={P.snow} letterSpacing={2}>{en}</text>
    {note ? <text x={x} y={y + 72} textAnchor="middle" fontFamily={F.brand} fontSize={22} fill={P.snow} opacity={0.7}>{note}</text> : null}
  </g>
);

const Sheet: React.FC<{ page: number }> = ({ page }) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
    <Defs />
    <Field t={40} sun={0.6} stars={0.5} dark={0.35} />
    <Motes t={40} o={0.4} />
    <text x={60} y={70} fontFamily={F.brand} fontSize={30} fontWeight={600} letterSpacing={3} fill={P.gold}>मैं रक्तबीज नहीं था · CAST SHEET {page + 1}/3</text>
    {page === 0 ? (
      <g>
        <Asura id="cs-rb" x={330} y={860} s={1.25} pose="raise" wound={1} t={40} />
        <Tag x={330} y={920} hi="रक्तबीज" en="RAKTABIJA" note="thunderbolt wound on the brow" />
        <Asura id="cs-cl" x={800} y={860} s={1.25} pose="stand" t={40} />
        <Tag x={800} y={920} hi="रक्त-जन्मा" en="A BLOOD-BORN" note="identical: same component, no marks" />
        <Asura id="cs-nr" x={1270} y={860} s={1.25} pose="stand" mark t={40} />
        <Tag x={1270} y={920} hi="कथावाचक" en="THE NARRATOR" note="only the earth-mark on the chest" />
        <g>
          <Asura id="cs-ds" x={1680} y={860} s={0.9} pose="lower" dust={0.45} t={40} />
          <Tag x={1680} y={920} hi="विलय" en="DISSOLVE" note="gold dust, never gore" />
        </g>
      </g>
    ) : (
      <g>
        {(['brahmani', 'maheshvari', 'kaumari', 'vaishnavi'] as ShaktiKind[]).map((k, i) => (
          <g key={k}>
            <Shakti k={k} x={250 + i * 470} y={470} s={0.62} t={40} />
            <text x={250 + i * 470} y={540} textAnchor="middle" fontFamily={F.deva} fontSize={34} fill={P.goldHi}>{SHAKTI[k].name}</text>
            <text x={250 + i * 470} y={572} textAnchor="middle" fontFamily={F.brand} fontSize={22} fontWeight={600} fill={P.snow} letterSpacing={2}>{SHAKTI[k].label.toUpperCase()}</text>
          </g>
        ))}
        {(['varahi', 'narasimhi', 'aindri', 'shivaduti'] as ShaktiKind[]).map((k, i) => (
          <g key={k}>
            <Shakti k={k} x={250 + i * 470} y={950} s={0.62} t={40} />
            <text x={250 + i * 470} y={1010} textAnchor="middle" fontFamily={F.deva} fontSize={34} fill={P.goldHi}>{SHAKTI[k].name}</text>
            <text x={250 + i * 470} y={1042} textAnchor="middle" fontFamily={F.brand} fontSize={22} fontWeight={600} fill={P.snow} letterSpacing={2}>{SHAKTI[k].label.toUpperCase()}</text>
          </g>
        ))}
      </g>
    )}
  </svg>
);

const Sheet3: React.FC = () => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
    <Defs />
    <Field t={40} sun={0.25} stars={0.8} dark={0.55} />
    <text x={60} y={70} fontFamily={F.brand} fontSize={30} fontWeight={600} letterSpacing={3} fill={P.gold}>मैं रक्तबीज नहीं था · CAST SHEET 3/3</text>
    <Shakti k="chandika" x={520} y={900} s={0.85} t={40} />
    <Tag x={520} y={960} hi="चंडिका" en="CHANDIKA" note="radiant and still · eight arms · lion" />
    <KaliPresence t={40} cx={1400} cy={420} s={0.72} mouth={0.8} />
    <Tag x={1400} y={960} hi="काली · चामुंडा" en="KALI, FELT NOT SHOWN" note="shadow · ember eyes · garland glints · a mouth of stars" />
  </svg>
);

export const RaktabijaCast: React.FC = () => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ backgroundColor: P.abyss }}>{f === 2 ? <Sheet3 /> : <Sheet page={f} />}</AbsoluteFill>;
};
