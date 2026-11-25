import React from 'react';
import { P, lerp, rnd } from '../raktabija/world';
import { Fig, limb, Wheel, Horse, Lotus, Flame } from '../tripura/cast';

// The Gita Jayanti Shorts cast: Krishna as Parthasarathi (blue, peacock feather, yellow silk, the reins in one hand and
// the jnana-mudra in the other), Arjuna standing with the Gandiva, the chariot with its white horses and the Hanuman
// flag, and one emblem per chapter. Gold line-art on navy, as in the other films; drawn in code.

const SKIN_K = '#1E4FA8';
const SKIN_A = '#2A2A44';

/** Krishna, seated as charioteer, facing left (towards Arjuna behind him); (x, y) is the seat. teach 0..1 raises the mudra. */
export const Krishna: React.FC<{ x: number; y: number; s?: number; t?: number; teach?: number; o?: number }> = ({ x, y, s = 1, t = 0, teach = 1, o = 1 }) => {
  const hy = -360;
  const mud = lerp(0, 1, teach);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
      <circle cx={0} cy={hy} r={150} fill="url(#rkHalo)" opacity={0.55} />
      <Fig fill={SKIN_K} d={[
        'M-90 0 Q-96 -70 -40 -90 L60 -90 Q110 -70 100 0 Z',
        'M-50 -90 Q-58 -170 -70 -220 Q-74 -244 -52 -252 L52 -252 Q74 -244 70 -220 Q58 -170 50 -90 Z',
        'M-13 -276 L13 -276 L14 -250 L-14 -250 Z',
        limb([[60, -236], [110, -170], [150, -130]], 26, 18),                      // reins hand, forward
        limb([[-60, -236], [-96, -190], [lerp(-80, -110, mud), lerp(-150, -260, mud)]], 26, 18), // teaching hand, raised
      ]} />
      {/* yellow silk */}
      <path d="M-92 0 Q-98 -60 -44 -88 L62 -88 Q112 -60 102 0 Z" fill="#E0A81C" stroke={P.goldHi} strokeWidth={2} />
      {[-50, -10, 30, 70].map((xx) => <path key={xx} d={`M${xx} -80 Q${xx + 6} -40 ${xx - 2} -4`} fill="none" stroke="#8A6008" strokeWidth={2} />)}
      {/* vanamala */}
      <path d="M-46 -246 Q0 -150 46 -246" fill="none" stroke="#7FD09A" strokeWidth={5} strokeDasharray="1 8" strokeLinecap="round" />
      {/* jnana mudra: the palm and a small circle of light */}
      <circle cx={lerp(-80, -110, mud)} cy={lerp(-150, -268, mud)} r={12} fill={SKIN_K} stroke={P.gold} strokeWidth={3} />
      <circle cx={lerp(-80, -110, mud)} cy={lerp(-150, -268, mud)} r={26} fill="url(#rkHalo)" opacity={mud} />
      {/* reins */}
      <path d="M150 -130 Q260 -150 420 -120" fill="none" stroke={P.goldDeep} strokeWidth={3} />
      {/* head */}
      <ellipse cx={0} cy={hy} rx={40} ry={48} fill={SKIN_K} stroke={P.gold} strokeWidth={3} />
      <path d={`M-38 ${hy - 28} L-30 ${hy - 84} Q0 ${hy - 110} 30 ${hy - 84} L38 ${hy - 28} Q0 ${hy - 40} -38 ${hy - 28} Z`} fill="#C8961C" stroke={P.goldHi} strokeWidth={3} />
      {[-18, 0, 18].map((xx) => <circle key={xx} cx={xx} cy={hy - 56} r={4} fill={P.lacquerHi} />)}
      {/* the peacock feather */}
      <g transform={`translate(18 ${hy - 92}) rotate(${18 + Math.sin(t * 0.05) * 3})`}>
        <path d="M0 0 Q6 -60 0 -110" fill="none" stroke="#2E8A5A" strokeWidth={3} />
        <ellipse cx={0} cy={-100} rx={16} ry={24} fill="#1E8A7A" stroke={P.goldHi} strokeWidth={2} />
        <ellipse cx={0} cy={-98} rx={8} ry={12} fill="#16407A" />
        <circle cx={0} cy={-96} r={4} fill={P.goldHi} />
      </g>
      <path d={`M-24 ${hy + 2} Q-14 ${hy + 8} -4 ${hy + 2} M8 ${hy + 2} Q18 ${hy + 8} 28 ${hy + 2}`} fill="none" stroke={P.goldHi} strokeWidth={3} strokeLinecap="round" />
      <path d={`M-12 ${hy + 26} Q0 ${hy + 34} 12 ${hy + 26}`} fill="none" stroke={P.goldHi} strokeWidth={2.6} strokeLinecap="round" />
      <path d={`M-10 ${hy - 30} L0 ${hy - 12} L10 ${hy - 30}`} fill="none" stroke={P.snow} strokeWidth={2.6} />
    </g>
  );
};

/** Arjuna, standing in the chariot facing right (towards Krishna), the Gandiva in his left hand; low 0..1 lowers the bow (despair). */
export const Arjuna: React.FC<{ x: number; y: number; s?: number; t?: number; low?: number; o?: number }> = ({ x, y, s = 1, t = 0, low = 0, o = 1 }) => {
  const hy = -470;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
      {/* the Gandiva */}
      <g transform={`rotate(${low * 50} -100 -200)`}>
        <path d="M-120 -470 Q-40 -270 -120 -60" fill="none" stroke={P.goldHi} strokeWidth={8} strokeLinecap="round" />
        <path d="M-120 -470 L-120 -60" stroke={P.snow} strokeWidth={1.6} opacity={0.8} />
      </g>
      <Fig fill={SKIN_A} d={[
        limb([[-24, -230], [-30, -110], [-34, 0]], 44, 30), limb([[24, -230], [30, -110], [34, 0]], 44, 30),
        'M-56 -230 Q-64 -300 -84 -360 Q-90 -390 -64 -400 L64 -400 Q90 -390 84 -360 Q64 -300 56 -230 Z',
        'M-15 -424 L15 -424 L16 -398 L-16 -398 Z',
        limb([[-70, -384], [-100, -300], [-96, -240]], 30, 20),
        limb([[70, -384], [100, -320], [80, -270]], 30, 20),
      ]} />
      <path d="M-60 -240 L60 -240 L56 -200 L-56 -200 Z" fill="#7E1426" stroke={P.goldHi} strokeWidth={2} />
      <path d="M-40 -396 Q0 -330 40 -396" fill="none" stroke={P.goldHi} strokeWidth={4} />
      {/* quiver */}
      <path d="M50 -380 L90 -250" stroke="#5A3A1A" strokeWidth={18} strokeLinecap="round" />
      {[0, 1, 2].map((i) => <path key={i} d={`M${54 + i * 8} -384 L${58 + i * 8} -414`} stroke={P.goldHi} strokeWidth={3} />)}
      <ellipse cx={0} cy={hy} rx={40} ry={48} fill={SKIN_A} stroke={P.gold} strokeWidth={3} />
      <path d={`M-38 ${hy - 26} L-30 ${hy - 80} L-14 ${hy - 66} L0 ${hy - 96} L14 ${hy - 66} L30 ${hy - 80} L38 ${hy - 26} Q0 ${hy - 38} -38 ${hy - 26} Z`} fill="#B08A1C" stroke={P.goldHi} strokeWidth={3} />
      <path d={`M-24 ${hy + 2} Q-14 ${hy + 8} -4 ${hy + 2} M8 ${hy + 2} Q18 ${hy + 8} 28 ${hy + 2}`} fill="none" stroke={P.goldHi} strokeWidth={3} strokeLinecap="round" />
      <path d={`M-12 ${hy + 28} Q0 ${hy + 24} 12 ${hy + 28}`} fill="none" stroke={P.goldHi} strokeWidth={2.4} strokeLinecap="round" />
    </g>
  );
};

/** The chariot of Kurukshetra, facing right: Arjuna behind, Krishna at the front, four white horses, the Hanuman flag. */
export const GitaChariot: React.FC<{ x: number; y: number; s?: number; t: number; teach?: number; low?: number }> = ({ x, y, s = 1, t, teach = 1, low = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {/* the Hanuman flag (kapidhvaja) */}
    <path d="M-170 -250 L-170 -760" stroke={P.goldHi} strokeWidth={6} />
    <path d={`M-170 -760 L${-30 + Math.sin(t * 0.08) * 12} -730 L-170 -690 Z`} fill={P.lacquerHi} stroke={P.goldHi} strokeWidth={2} />
    <g transform={`translate(-128 -726) scale(0.5)`}>
      <circle r={18} fill="#E89A3A" /><path d="M-10 18 Q0 40 10 18" fill="#E89A3A" /><path d="M14 0 Q40 -30 30 -50" fill="none" stroke="#E89A3A" strokeWidth={5} />
    </g>
    <Arjuna x={-120} y={-250} s={0.62} t={t} low={low} />
    {/* body */}
    <path d="M-260 -250 L240 -250 L270 -150 L-270 -150 Z" fill="#2A1A06" stroke={P.goldHi} strokeWidth={3} />
    {Array.from({ length: 7 }, (_, i) => <circle key={i} cx={-220 + i * 70} cy={-200} r={11} fill="none" stroke={P.gold} strokeWidth={2} />)}
    <Krishna x={170} y={-250} s={0.62} t={t} teach={teach} />
    <path d="M260 -190 L560 -220" stroke={P.goldHi} strokeWidth={7} />
    <Wheel x={-150} y={-130} r={120} k="sun" rot={0} />
    <Wheel x={150} y={-130} r={120} k="sun" rot={0} />
    {[0, 1, 2, 3].map((i) => <Horse key={i} x={470 + i * 50} y={-10 - i * 12} s={0.8} t={t} />)}
  </g>
);

/** The emblem of each chapter, centred at (0, 0), about 320 px across. */
export const Emblem: React.FC<{ ch: number; t: number; p?: number }> = ({ ch, t, p = 1 }) => {
  const G = P.goldHi;
  const glow = <circle r={200} fill="url(#rkHalo)" opacity={0.6 * p} />;
  const conch = (x: number, f: number) => <g transform={`translate(${x} 0) scale(${f} 1)`}><path d="M-60 40 Q-90 -20 -40 -70 Q20 -100 60 -40 Q70 10 30 50 Q-10 70 -60 40 Z" fill="#F2F0E8" stroke={G} strokeWidth={3} /><path d="M-30 -30 Q0 -10 30 -30 M-40 0 Q0 20 40 -5" fill="none" stroke={P.goldDeep} strokeWidth={3} /></g>;
  const E: Record<number, React.ReactNode> = {
    1: <g>{conch(-80, 1)}{conch(80, -1)}</g>,
    2: <g><path d="M-120 60 Q-60 20 0 40 Q60 60 110 20" fill="none" stroke={G} strokeWidth={10} strokeLinecap="round" /><path d="M-60 40 Q-70 -10 -40 -20 Q0 -10 -10 40" fill="#1B2C58" stroke={G} strokeWidth={4} /><circle cx={40 + (t % 60) * 1.2} cy={-60 + (t % 60) * (t % 60) * 0.04} r={22} fill="#C8963A" opacity={1 - (t % 60) / 60} /><Flame x={-40} y={-30} h={50} t={t} /></g>,
    3: <g><path d="M0 120 L0 40 M0 40 L-110 -110 M0 40 L110 -110" stroke={G} strokeWidth={8} strokeLinecap="round" /><path d="M0 40 L-110 -110" stroke="#FFE9B0" strokeWidth={14} opacity={0.5} /><circle cx={-110} cy={-110} r={18} fill={G} /><circle cx={110} cy={-110} r={18} fill="#5A5A6A" /></g>,
    4: <g><circle r={90} fill="url(#rkSun)" /><g transform={`rotate(${t * 0.6})`}><circle r={70} fill="none" stroke={G} strokeWidth={6} />{Array.from({ length: 24 }, (_, i) => <path key={i} d="M0 -16 L0 -68" transform={`rotate(${i * 15})`} stroke={G} strokeWidth={2.4} />)}<circle r={14} fill={G} /></g></g>,
    5: <g>{[-160, -80, 0, 80, 160].map((x, i) => <circle key={i} cx={x} cy={40} r={30} fill="#1B2C58" stroke={G} strokeWidth={4} />)}<path d="M-80 -70 Q0 -130 80 -70 Q0 -10 -80 -70 Z" fill="none" stroke={G} strokeWidth={5} /><circle cx={0} cy={-70} r={18} fill={G} />{[-160, -80, 0, 80, 160].map((x, i) => <path key={i} d={`M0 -52 L${x} 10`} stroke={G} strokeWidth={1.5} opacity={0.5} />)}</g>,
    6: <g><path d="M-40 140 L-40 -140 M40 140 L40 -140" stroke={G} strokeWidth={6} />{Array.from({ length: 7 }, (_, i) => <path key={i} d={`M-40 ${120 - i * 40} L40 ${120 - i * 40}`} stroke={G} strokeWidth={4} />)}<circle cx={0} cy={lerp(100, -110, (t % 150) / 150)} r={20} fill="#FFE9B0" /></g>,
    7: <g>{Array.from({ length: 40 }, (_, i) => <circle key={i} cx={(rnd(3, i) - 0.5) * 320} cy={(rnd(4, i) - 0.5) * 240} r={3} fill={P.snow} opacity={0.4} />)}<circle r={30} fill={G} /><circle r={80} fill="url(#rkHalo)" /></g>,
    8: <g><path d="M-80 60 Q0 100 80 60 L60 30 L-60 30 Z" fill="#B87A2A" stroke={G} strokeWidth={4} /><Flame x={0} y={32} h={130} t={t} /></g>,
    9: <g><path d="M-170 40 Q-150 -40 -110 -50 Q-110 20 -170 40 Z" fill="#3E8A5A" stroke={G} strokeWidth={3} /><Lotus x={-40} y={40} s={0.6} /><circle cx={60} cy={10} r={30} fill="#D8501E" stroke={G} strokeWidth={3} /><path d="M160 -30 Q190 20 160 40 Q130 20 160 -30 Z" fill="#6FA0FF" stroke={G} strokeWidth={3} /></g>,
    10: <g><path d="M0 100 Q-150 -10 -100 -80 Q-50 -130 0 -60 Q50 -130 100 -80 Q150 -10 0 100 Z" fill="#7E1426" stroke={G} strokeWidth={5} /><circle cx={0} cy={-10} r={22} fill={G} /><circle cx={0} cy={-10} r={60} fill="url(#rkHalo)" /></g>,
    11: <g><circle r={150} fill="url(#tpHeat)" />{Array.from({ length: 18 }, (_, i) => <Flame key={i} x={Math.cos((i / 18) * Math.PI * 2) * 110} y={Math.sin((i / 18) * Math.PI * 2) * 110} h={60} t={t + i * 5} seed={i} />)}{Array.from({ length: 14 }, (_, i) => <g key={i} transform={`translate(${(rnd(7, i) - 0.5) * 160} ${(rnd(8, i) - 0.5) * 160})`}><ellipse rx={12} ry={6} fill="#FFF4E0" /><circle r={4} fill="#1A0804" /></g>)}</g>,
    12: <g><Lotus x={0} y={60} s={1.4} c={G} /><circle cx={0} cy={-20} r={70} fill="url(#rkHalo)" /></g>,
    13: <g>{Array.from({ length: 6 }, (_, i) => <path key={i} d={`M-180 ${40 + i * 18} Q0 ${30 + i * 18} 180 ${40 + i * 18}`} fill="none" stroke="#7A5A2A" strokeWidth={4} />)}<path d="M-80 -70 Q0 -130 80 -70 Q0 -10 -80 -70 Z" fill="none" stroke={G} strokeWidth={5} /><circle cx={0} cy={-70} r={18} fill={G} /></g>,
    14: <g>{['#F2F0E8', '#D8501E', '#3A3440'].map((c, i) => <path key={i} d={`M-180 ${-40 + i * 40} ${Array.from({ length: 8 }, (_, k) => `Q${-160 + k * 45} ${-40 + i * 40 + (k % 2 ? 30 : -30)} ${-140 + k * 45} ${-40 + i * 40}`).join(' ')}`} fill="none" stroke={c} strokeWidth={12} strokeLinecap="round" />)}</g>,
    15: <g><path d="M0 120 L0 -40" stroke="#7A5A2A" strokeWidth={14} />{[-1, 1].map((sd) => <path key={sd} d={`M0 -40 Q${sd * 60} -100 ${sd * 140} -130 M0 -10 Q${sd * 80} -40 ${sd * 160} -50`} fill="none" stroke="#7A5A2A" strokeWidth={8} />)}{Array.from({ length: 16 }, (_, i) => <ellipse key={i} cx={(rnd(9, i) - 0.5) * 300} cy={60 + rnd(10, i) * 70} rx={14} ry={8} fill="#3E8A5A" />)}<circle cx={0} cy={-150} r={20} fill={G} /><circle cx={0} cy={-150} r={60} fill="url(#rkHalo)" /></g>,
    16: <g>{[-120, 0, 120].map((x, i) => <g key={i} transform={`translate(${x} 0)`}><path d="M-44 90 L-44 -50 Q0 -100 44 -50 L44 90 Z" fill="#14080A" stroke="#FF6A4A" strokeWidth={4} /><Flame x={0} y={90} h={110} t={t + i * 13} seed={i} /></g>)}</g>,
    17: <g><path d="M-170 40 Q-110 0 -40 20 L-20 50 Q-100 60 -170 70 Z" fill="#1B2C58" stroke={G} strokeWidth={4} /><path d="M170 60 Q110 30 40 40 L20 70 Q100 90 170 100 Z" fill="#1B2C58" stroke={G} strokeWidth={4} /><circle cx={lerp(-20, 30, (Math.sin(t * 0.05) + 1) / 2)} cy={20} r={16} fill={G} /></g>,
    18: <g><path d="M-60 120 Q-70 0 -40 -60 L-20 -120 L0 -60 L20 -130 L36 -60 L56 -110 L66 -40 Q80 40 60 120 Z" fill="#1E4FA8" stroke={G} strokeWidth={4} /><circle cx={0} cy={0} r={180} fill="url(#rkHalo)" /></g>,
  };
  return <g opacity={p}>{glow}{E[ch]}</g>;
};
