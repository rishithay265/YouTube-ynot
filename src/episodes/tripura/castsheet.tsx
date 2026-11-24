import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { P, F, W, H, Defs, Stars, Motes } from '../raktabija/world';
import { Asura } from '../raktabija/cast';
import { MetalDefs, City, Shiva, Brahma, Vishnu, Narada, Mundi, Chariot, Horse, Bull, Ganesha, Linga, Tula, ThreeBodies, Metal, METAL } from './cast';

// TripuraCast (1920 x 1080, 4 frames): the consistency reference for every shot.
// 0 = the three cities; 1 = Shiva (stand, archer), Brahma, Vishnu; 2 = the brothers, Maya, the Mundi, Narada;
// 3 = the chariot, the Veda horses, the bull, Ganesha, the linga, the balance, the three bodies.

const Tag: React.FC<{ x: number; y: number; hi: string; en: string; note?: string }> = ({ x, y, hi, en, note }) => (
  <g>
    <text x={x} y={y} textAnchor="middle" fontFamily={F.deva} fontSize={38} fill={P.goldHi}>{hi}</text>
    <text x={x} y={y + 36} textAnchor="middle" fontFamily={F.brand} fontSize={26} fontWeight={600} fill={P.snow} letterSpacing={2}>{en}</text>
    {note ? <text x={x} y={y + 68} textAnchor="middle" fontFamily={F.brand} fontSize={21} fill={P.snow} opacity={0.75}>{note}</text> : null}
  </g>
);
const Head: React.FC<{ n: number }> = ({ n }) => (
  <text x={60} y={70} fontFamily={F.brand} fontSize={30} fontWeight={600} letterSpacing={3} fill={P.gold}>हम त्रिपुर थे · CAST SHEET {n}/4</text>
);
const Bg: React.FC = () => (<><rect width={W} height={H} fill={P.abyss} /><Stars t={40} n={160} o={0.6} box={[0, 0, W, H]} /></>);

const Cities: React.FC = () => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
    <Defs /><MetalDefs /><Bg /><Head n={1} />
    {(['gold', 'silver', 'iron'] as Metal[]).map((k, i) => (
      <g key={k}>
        <City id={`cs${k}`} k={k} x={330 + i * 630} y={560} s={0.78} t={40} spin={1} />
        <Tag x={330 + i * 630} y={900} hi={METAL[k].name} en={METAL[k].en} note={['Tarakaksha · heaven', 'Kamalaksha · sky', 'Vidyunmali · earth'][i]} />
      </g>
    ))}
  </svg>
);
const Gods: React.FC = () => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
    <Defs /><MetalDefs /><Bg /><Head n={2} />
    <Shiva x={260} y={900} s={1.05} t={40} eye={0.2} glow={0.3} />
    <Tag x={260} y={950} hi="शिव" en="SHIVA" note="jata, crescent, third eye, trishula" />
    <Shiva x={720} y={900} s={1.0} t={40} pose="draw" pull={0.9} eye={0.6} anger={0.5} />
    <Tag x={830} y={950} hi="त्रिपुरारि" en="TRIPURARI" note="Meru bow · Shesha string · Vishnu arrow · Agni tip" />
    <Brahma x={1340} y={880} s={1.0} t={40} />
    <Tag x={1340} y={950} hi="ब्रह्मा" en="BRAHMA" note="four faces · the Veda · the lotus" />
    <Vishnu x={1720} y={900} s={0.95} t={40} />
    <Tag x={1720} y={950} hi="विष्णु" en="VISHNU" note="chakra · shankha · gada · padma" />
  </svg>
);
const People: React.FC = () => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
    <Defs /><MetalDefs /><Bg /><Head n={3} />
    <Asura id="cs-tk" x={250} y={880} s={1.25} pose="stand" tone="navy" fierce t={40} />
    <Tag x={250} y={930} hi="तारकाक्ष · विद्युन्माली · कमलाक्ष" en="THE THREE BROTHERS" note="Tarakasura's sons" />
    <Asura id="cs-maya" x={720} y={880} s={1.05} pose="hold" tone="navy" fierce={false} t={40} />
    <Tag x={720} y={930} hi="मय दानव" en="MAYA" note="the builder · survives" />
    <Mundi x={1180} y={880} s={1.05} t={40} />
    <Tag x={1180} y={930} hi="अरिहन् · मुंडी" en="ARIHAN, THE MUNDI" note="SP 4.1–3: broom, vessel, mouth-cloth" />
    <Narada x={1640} y={880} s={1.0} t={40} />
    <Tag x={1640} y={930} hi="नारद" en="NARADA" note="the veena · the certificate" />
  </svg>
);
const Things: React.FC = () => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
    <Defs /><MetalDefs /><Bg /><Head n={4} />
    <Chariot x={420} y={560} s={0.62} t={40} rot={20} />
    {[0, 1, 2, 3].map((i) => <Horse key={i} x={720 + i * 36} y={540 - i * 6} s={0.5} t={40} label={['ऋक्', 'यजुः', 'साम', 'अथर्व'][i]} />)}
    <Tag x={560} y={640} hi="देवताओं का रथ" en="THE CHARIOT OF THE GODS" note="Sun and Moon wheels · four Vedas · Brahma drives" />
    <Bull x={1360} y={520} s={0.9} t={40} />
    <Tag x={1360} y={600} hi="वृषभ" en="THE BULL" note="Shesha (SP 9.8), Vishnu (Shivananda Lahari)" />
    <Ganesha x={1750} y={520} s={0.9} t={40} />
    <Tag x={1750} y={600} hi="गणेश" en="GANESHA" note="on the thumb (SP 10.4)" />
    <Linga x={260} y={1000} s={0.9} t={40} />
    <Tula x={900} y={1020} s={0.55} tilt={-1} left={<circle cx={0} cy={-30} r={30} fill={P.goldHi} />} />
    <ThreeBodies x={1500} y={1040} s={0.75} t={40} witness={1} />
    <Motes t={40} n={30} o={0.3} />
  </svg>
);
export const TripuraCast: React.FC = () => {
  const f = useCurrentFrame();
  const Page = [Cities, Gods, People, Things][Math.min(3, f)];
  return <AbsoluteFill style={{ backgroundColor: P.abyss }}><Page /></AbsoluteFill>;
};
