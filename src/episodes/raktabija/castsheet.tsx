import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { P, F, W, H, Defs, Field, Motes } from './world';
import { Asura, Shakti, ShaktiKind, SHAKTI, KaliFace, KaliForm, RaktabijaFace } from './cast';

// The cast sheet (RaktabijaCast, 1920 x 1080, 4 frames), the consistency reference for every shot:
// 0 = Raktabija's line, all blood-red (Raktabija, a blood-born, the narrator, the dissolve);
// 1 = the Matrikas and Shivaduti; 2 = the faces (Kali ma in battle and in compassion, Raktabija);
// 3 = Chandika and Kali ma's full form.

const Tag: React.FC<{ x: number; y: number; hi: string; en: string; note?: string }> = ({ x, y, hi, en, note }) => (
  <g>
    <text x={x} y={y} textAnchor="middle" fontFamily={F.deva} fontSize={40} fill={P.goldHi}>{hi}</text>
    <text x={x} y={y + 38} textAnchor="middle" fontFamily={F.brand} fontSize={28} fontWeight={600} fill={P.snow} letterSpacing={2}>{en}</text>
    {note ? <text x={x} y={y + 72} textAnchor="middle" fontFamily={F.brand} fontSize={22} fill={P.snow} opacity={0.75}>{note}</text> : null}
  </g>
);
const Head: React.FC<{ n: number }> = ({ n }) => (
  <text x={60} y={70} fontFamily={F.brand} fontSize={30} fontWeight={600} letterSpacing={3} fill={P.gold}>मैं रक्तबीज नहीं था · CAST SHEET {n}/4</text>
);

const Asuras: React.FC = () => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
    <Defs />
    <Field t={40} sun={0.6} stars={0.5} dark={0.35} />
    <Motes t={40} o={0.4} />
    <Head n={1} />
    <Asura id="cs-rb" x={330} y={880} s={1.5} pose="raise" wound={1} tone="blood" fierce t={40} />
    <Tag x={330} y={930} hi="रक्तबीज" en="RAKTABIJA" note="larger · crowned · the blood-drop tilak" />
    <Asura id="cs-cl" x={820} y={880} s={1.12} pose="stand" tone="blood" fierce t={40} />
    <Tag x={820} y={930} hi="रक्त-जन्मा" en="A BLOOD-BORN" note="his face, his mace · no tilak" />
    <Asura id="cs-nr" x={1270} y={880} s={1.12} pose="rest" contra look={0.5} mark tone="blood" fierce t={40} />
    <Tag x={1270} y={930} hi="कथावाचक" en="THE NARRATOR" note="identical but for the earth-mark" />
    <Asura id="cs-ds" x={1690} y={880} s={0.95} pose="lower" dust={0.45} tone="blood" fierce t={40} />
    <Tag x={1690} y={930} hi="विलय" en="DISSOLVE" note="gold dust, never gore" />
  </svg>
);

const Matrikas: React.FC = () => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
    <Defs />
    <Field t={40} sun={0.6} stars={0.5} dark={0.35} />
    <Motes t={40} o={0.4} />
    <Head n={2} />
    {(['brahmani', 'maheshvari', 'kaumari', 'vaishnavi', 'varahi', 'narasimhi', 'aindri', 'shivaduti'] as ShaktiKind[]).map((k, i) => {
      const x = 250 + (i % 4) * 470, y = i < 4 ? 470 : 950;
      return (
        <g key={k}>
          <Shakti k={k} x={x} y={y} s={0.62} t={40} />
          <text x={x} y={y + 70} textAnchor="middle" fontFamily={F.deva} fontSize={34} fill={P.goldHi}>{SHAKTI[k].name}</text>
          <text x={x} y={y + 102} textAnchor="middle" fontFamily={F.brand} fontSize={22} fontWeight={600} fill={P.snow} letterSpacing={2}>{SHAKTI[k].label.toUpperCase()}</text>
        </g>
      );
    })}
  </svg>
);

const Faces: React.FC = () => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
    <Defs />
    <rect width={W} height={H} fill={P.abyss} />
    <Motes t={40} o={0.3} />
    <Head n={3} />
    <KaliFace x={330} y={420} s={0.58} eyes={1} tone="gold" glow={0.5} />
    <Tag x={330} y={900} hi="काली माँ · रण में" en="KALI MA, IN BATTLE" note="eyes open · red tongue · no skulls" />
    <KaliFace x={960} y={420} s={0.58} eyes={0} tone="gold" glow={0.5} />
    <Tag x={960} y={900} hi="काली माँ · करुणा" en="KALI MA, IN COMPASSION" note="gaze lowered: the ending (DM 4.22)" />
    <RaktabijaFace x={1590} y={440} s={0.66} />
    <Tag x={1590} y={900} hi="रक्तबीज" en="RAKTABIJA" note="crown · burning eyes · the blood-drop tilak" />
  </svg>
);

const Devi: React.FC = () => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
    <Defs />
    <Field t={40} sun={0.25} stars={0.8} dark={0.55} />
    <Head n={4} />
    <Shakti k="chandika" x={480} y={880} s={0.85} t={40} />
    <Tag x={480} y={940} hi="चंडिका" en="CHANDIKA" note="radiant and still · eight arms · lion" />
    <KaliForm x={1380} y={880} s={0.8} eyes={1} />
    <Tag x={1380} y={940} hi="काली माँ · चामुंडा" en="KALI MA (CHAMUNDA)" note="khadga · khappar for the blood · abhaya · varada" />
  </svg>
);

export const RaktabijaCast: React.FC = () => {
  const f = useCurrentFrame();
  const Page = [Asuras, Matrikas, Faces, Devi][Math.min(3, f)];
  return <AbsoluteFill style={{ backgroundColor: P.abyss }}><Page /></AbsoluteFill>;
};
