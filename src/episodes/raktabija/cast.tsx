import React from 'react';
import { P, F, clamp, rnd, Stars, DustBurst } from './world';

// The cast. Every figure is a dark silhouette with a gold rim and gold line ornament, like a temple bronze against
// the evening. One Asura component draws Raktabija, every blood-born clone and the narrator, so they are identical by
// construction; the narrator differs ONLY by the earth-mark on his chest (mark), Raktabija only by the thunderbolt
// wound on his brow (wound). The Devi's forms follow the Devi Mahatmya ch. 8 (forms, mounts, weapons): see
// research/raktabija/script.json and the source ledger.

const G = P.gold;
const DARK = 'url(#rkFigure)';

/** A limb drawn as a gold outline round a dark core (two strokes), so arms and weapons read as silhouettes. */
const Limb: React.FC<{ d: string; w: number; rim?: number }> = ({ d, w, rim = 1 }) => (
  <g fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} stroke={G} strokeWidth={w + 5} opacity={0.85 * rim} />
    <path d={d} stroke="#08122D" strokeWidth={w} />
  </g>
);

/** Point at distance r and angle a (degrees, 0 = down, positive = towards +x) from (x, y). */
const at = (x: number, y: number, r: number, a: number): [number, number] => [x + Math.sin((a * Math.PI) / 180) * r, y + Math.cos((a * Math.PI) / 180) * r];

export const Gada: React.FC<{ x: number; y: number; a: number; len?: number; rim?: number }> = ({ x, y, a, len = 170, rim = 1 }) => {
  const [hx, hy] = at(x, y, len, a);
  return (
    <g>
      <Limb d={`M${x} ${y} L${hx} ${hy}`} w={8} rim={rim} />
      <g transform={`translate(${hx} ${hy}) rotate(${-a + 180})`}>
        <ellipse cx={0} cy={-26} rx={24} ry={32} fill="#08122D" stroke={G} strokeWidth={3} opacity={1} />
        {[-12, 0, 12].map((o) => <path key={o} d={`M${o} -56 Q${o * 1.4} -26 ${o} 4`} fill="none" stroke={G} strokeWidth={1.4} opacity={0.75} />)}
        <path d="M-6 -58 L0 -70 L6 -58" fill={G} />
      </g>
    </g>
  );
};

export type Pose = 'stand' | 'raise' | 'strike' | 'hold' | 'lower' | 'empty' | 'rest';
const ARMS: Record<Pose, { r: [number, number]; l: [number, number]; mace: number | null; len?: number }> = {
  stand: { r: [-14, 8], l: [14, -6], mace: 180 }, // arm at the side, mace held upright like a standard
  raise: { r: [-160, -40], l: [30, 20], mace: 190 },
  strike: { r: [-95, -70], l: [30, 20], mace: 150 },
  hold: { r: [-55, 60], l: [55, -60], mace: null }, // both arms forward, cradling
  lower: { r: [-12, 0], l: [18, 6], mace: 10 }, // mace hanging, head to the ground
  empty: { r: [-12, 0], l: [18, 6], mace: null },
  rest: { r: [-16, 6], l: [16, -4], mace: -10, len: 70 }, // a gada resting on its head beside the foot, hand on the short handle
};

/**
 * Raktabija / a blood-born clone / the narrator. Feet at (x, y); s = scale (1 = 400 px tall).
 * rise 0..1: emerging from the earth (clipped at the ground line). dust 0..1: coming apart into gold motes.
 */
export const Asura: React.FC<{
  x: number; y: number; s?: number; pose?: Pose; mark?: boolean; wound?: number; rim?: number; rise?: number; dust?: number;
  id: string; flip?: boolean; dim?: number; tilt?: number; t?: number;
  /** Contrapposto: weight on the +x leg, the other knee relaxed, hips and shoulders counter-tilted. Off by default. */
  contra?: boolean;
  /** Head turn, -1..1 (+ = towards +x), with a slight lift. 0 by default. */
  look?: number;
}> = ({ x, y, s = 1, pose = 'stand', mark = false, wound = 0, rim = 1, rise = 1, dust = 0, id, flip = false, dim = 0, tilt = 0, t = 0, contra = false, look = 0 }) => {
  const A = ARMS[pose];
  const rs: [number, number] = [-78, -280], ls: [number, number] = [78, -280];
  const relb = at(rs[0], rs[1], 88, A.r[0]), rh = at(relb[0], relb[1], 82, A.r[0] + A.r[1]);
  const lelb = at(ls[0], ls[1], 88, A.l[0]), lh = at(lelb[0], lelb[1], 82, A.l[0] + A.l[1]);
  // Legs, a pleated dhoti flaring to the knee, a broad bare V torso, rounded shoulders, neck: one closed silhouette.
  const body = 'M-48 0 L-20 0 Q-18 -56 -12 -112 L12 -112 Q18 -56 20 0 L48 0 Q46 -56 40 -112 Q66 -116 64 -128 Q70 -170 52 -212 '
    + 'Q60 -248 74 -270 Q98 -280 90 -298 Q66 -308 24 -304 L14 -306 L14 -320 L-14 -320 L-14 -306 L-24 -304 Q-66 -308 -90 -298 '
    + 'Q-98 -280 -74 -270 Q-60 -248 -52 -212 Q-70 -170 -64 -128 Q-66 -116 -40 -112 Q-46 -56 -48 0 Z';
  // Contrapposto: the same outline split at the dhoti hem; the weight leg straight under the hip, the free leg bent.
  const upper = 'M-64 -128 Q-66 -116 -40 -112 L40 -112 Q66 -116 64 -128 Q70 -170 52 -212 Q60 -248 74 -270 Q98 -280 90 -298 '
    + 'Q66 -308 24 -304 L14 -306 L14 -320 L-14 -320 L-14 -306 L-24 -304 Q-66 -308 -90 -298 Q-98 -280 -74 -270 Q-60 -248 -52 -212 Q-70 -170 -64 -128 Z';
  const legW = 'M4 -116 L42 -116 Q40 -56 38 0 L10 0 Q12 -56 4 -116 Z';
  const legF = 'M-42 -116 L-8 -116 Q-16 -62 -34 -14 L-40 0 L-68 0 L-62 -10 Q-48 -62 -42 -116 Z';
  const upperT = contra ? 'translate(5 0) rotate(-3 0 -116)' : '';
  const sink = (1 - clamp(rise)) * 420;
  const o = 1 - clamp(dust * 1.6);
  const breathe = Math.sin(t * 0.06) * 1.5;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s}) rotate(${tilt})`}>
      <defs><clipPath id={`rise-${id}`}><rect x={-400} y={-900} width={800} height={900} /></clipPath></defs>
      <g clipPath={`url(#rise-${id})`}>
        <g transform={`translate(0 ${sink})`} opacity={o}>
          {contra ? <g>{[legF, legW].map((d, i) => <path key={i} d={d} fill={DARK} stroke={G} strokeWidth={3} strokeLinejoin="round" />)}</g> : null}
          <g transform={upperT}>
          {/* hair behind */}
          <path d="M-24 -348 Q-46 -300 -54 -262 L-34 -286 Q-26 -318 -22 -340 Z M24 -348 Q46 -300 54 -262 L34 -286 Q26 -318 22 -340 Z" fill="#060D22" stroke={G} strokeWidth={1.2} opacity={0.9} />
          {/* far arm (left) */}
          <Limb d={`M${ls[0]} ${ls[1]} L${lelb[0]} ${lelb[1]} L${lh[0]} ${lh[1]}`} w={22} rim={rim} />
          <path d={contra ? upper : body} fill={DARK} stroke={G} strokeWidth={3} strokeLinejoin="round" opacity={1} transform={`translate(0 ${breathe * 0.3})`} />
          {/* ornament */}
          <g fill="none" stroke={G} strokeLinecap="round">
            <path d="M-30 -298 Q0 -266 30 -298" strokeWidth={2.4} opacity={0.9} />
            <path d="M-22 -296 Q0 -276 22 -296" strokeWidth={1.2} opacity={0.6} />
            <path d="M-46 -212 L46 -212" strokeWidth={3} opacity={0.85} />
            <path d="M-6 -210 Q-12 -170 -18 -128 M6 -210 Q12 -170 18 -128 M-30 -206 Q-44 -170 -50 -132 M30 -206 Q44 -170 50 -132" strokeWidth={1.3} opacity={0.55} />
            <path d="M-62 -128 Q0 -112 62 -128" strokeWidth={1.6} opacity={0.6} />
            <path d="M-36 -246 Q-18 -236 -4 -244 M36 -246 Q18 -236 4 -244" strokeWidth={1.2} opacity={0.4} />
          </g>
          {/* head and crown (turned by `look`) */}
          <g transform={look ? `rotate(${look * 9} 0 -318) translate(${look * 3} ${-Math.abs(look) * 2})` : undefined}>
          <circle cx={0} cy={-340} r={24} fill="#0A1533" stroke={G} strokeWidth={2.4} />
          <path d="M-25 -352 L-21 -384 L-11 -370 L0 -404 L11 -370 L21 -384 L25 -352 Z" fill="#08122D" stroke={G} strokeWidth={2.4} strokeLinejoin="round" />
          <path d="M-24 -356 L24 -356" stroke={G} strokeWidth={2} />
          <circle cx={0} cy={-366} r={3.5} fill={G} />
          <path d={`M${-12 + look * 7} -341 L${-4 + look * 7} -339 M${4 + look * 7} -339 L${12 + look * 7} -341`} stroke={P.goldHi} strokeWidth={2.2} strokeLinecap="round" />
          {wound > 0 ? (
            <g opacity={wound}>
              <path d="M-9 -352 L-2 -346 L-6 -344 L3 -338" fill="none" stroke={P.lacquerHi} strokeWidth={3.2} strokeLinecap="round" />
              <circle cx={0} cy={-346} r={12} fill={P.gold} opacity={0.25} filter="url(#rkBlur8)" />
            </g>
          ) : null}
          </g>
          {mark ? (
            <g>
              <path d="M-26 -262 Q-34 -244 -22 -228 Q-8 -220 4 -232 Q10 -250 0 -262 Q-12 -270 -26 -262 Z" fill="#8C5A2A" opacity={0.95} />
              <path d="M-22 -258 Q-28 -246 -18 -236 M-12 -262 Q-16 -246 -8 -234 M-2 -258 Q-4 -246 2 -238" fill="none" stroke="#C08A4A" strokeWidth={2} strokeLinecap="round" opacity={0.9} />
              <circle cx={-10} cy={-246} r={26} fill="#B07A3C" opacity={0.18} filter="url(#rkBlur8)" />
            </g>
          ) : null}
          {/* near arm (right) with armlet, and the mace */}
          {A.mace !== null ? <Gada x={rh[0]} y={rh[1]} a={A.r[0] + A.r[1] + A.mace} len={A.len} rim={rim} /> : null}
          <Limb d={`M${rs[0]} ${rs[1]} L${relb[0]} ${relb[1]} L${rh[0]} ${rh[1]}`} w={24} rim={rim} />
          <circle cx={(rs[0] + relb[0]) / 2} cy={(rs[1] + relb[1]) / 2} r={9} fill="none" stroke={G} strokeWidth={2.4} />
          <circle cx={rh[0]} cy={rh[1]} r={12} fill="#08122D" stroke={G} strokeWidth={2} />
          {dim > 0 ? <path d={contra ? upper : body} fill={P.abyss} opacity={dim} /> : null}
          </g>
        </g>
      </g>
      {dust > 0 ? <DustBurst x={0} y={-20} p={dust} seed={id.length * 7 + 3} spread={110} h={400} /> : null}
    </g>
  );
};

// ---------------------------------------------------------------- the Devi's forms

/** A flaming prabha (aureole) of a temple bronze, centred (cx, cy), radius r. */
export const Prabha: React.FC<{ cx: number; cy: number; r: number; o?: number; t?: number; flames?: number }> = ({ cx, cy, r, o = 1, t = 0, flames = 26 }) => (
  <g opacity={o}>
    <circle cx={cx} cy={cy} r={r * 1.1} fill="url(#rkHalo)" />
    <path d={`M${cx - r} ${cy + r * 0.9} L${cx - r} ${cy} A${r} ${r} 0 0 1 ${cx + r} ${cy} L${cx + r} ${cy + r * 0.9}`} fill="none" stroke={G} strokeWidth={4} />
    <path d={`M${cx - r * 0.9} ${cy + r * 0.9} L${cx - r * 0.9} ${cy} A${r * 0.9} ${r * 0.9} 0 0 1 ${cx + r * 0.9} ${cy} L${cx + r * 0.9} ${cy + r * 0.9}`} fill="none" stroke={G} strokeWidth={1.5} opacity={0.6} />
    {Array.from({ length: flames }, (_, i) => {
      const a = Math.PI + (i / (flames - 1)) * Math.PI;
      const fl = 1 + 0.12 * Math.sin(t * 0.15 + i * 1.7);
      const x0 = cx + Math.cos(a) * r, y0 = cy + Math.sin(a) * r;
      const x1 = cx + Math.cos(a) * r * (1.16 * fl), y1 = cy + Math.sin(a) * r * (1.16 * fl);
      const nx = -Math.sin(a) * 9, ny = Math.cos(a) * 9;
      return <path key={i} d={`M${x0 - nx} ${y0 - ny} Q${(x0 + x1) / 2 + nx * 1.4} ${(y0 + y1) / 2 + ny * 1.4} ${x1} ${y1} Q${(x0 + x1) / 2} ${(y0 + y1) / 2} ${x0 + nx} ${y0 + ny}`} fill={G} opacity={0.85} />;
    })}
  </g>
);

export type Emblem = 'rosary' | 'kamandalu' | 'trishul' | 'spear' | 'chakra' | 'shankha' | 'gada' | 'bow' | 'khadga' | 'vajra' | 'ghanta' | 'abhaya' | 'none';
/** An emblem held in a hand at (x, y). */
export const EmblemG: React.FC<{ k: Emblem; x: number; y: number; s?: number }> = ({ k, x, y, s = 1 }) => {
  const st = { fill: 'none', stroke: G, strokeWidth: 3, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  let g: React.ReactNode = null;
  switch (k) {
    case 'rosary': g = <g>{Array.from({ length: 12 }, (_, i) => <circle key={i} cx={Math.cos(i / 12 * 6.283) * 16} cy={14 + Math.sin(i / 12 * 6.283) * 20} r={3} fill={G} />)}</g>; break;
    case 'kamandalu': g = <g><path d="M-14 0 Q-20 22 0 26 Q20 22 14 0 Z" {...st} fill="#08122D" /><path d="M14 6 Q26 0 30 -10" {...st} /><path d="M-10 0 Q0 -12 10 0" {...st} /></g>; break;
    case 'trishul': g = <g {...st}><path d="M0 60 L0 -70" /><path d="M-22 -40 Q-24 -62 -14 -76 M22 -40 Q24 -62 14 -76 M-22 -40 Q0 -30 22 -40" /><path d="M0 -70 L-6 -58 M0 -70 L6 -58" /></g>; break;
    case 'spear': g = <g {...st}><path d="M0 70 L0 -60" /><path d="M0 -92 Q12 -72 0 -56 Q-12 -72 0 -92 Z" fill={G} /></g>; break;
    case 'chakra': g = <g {...st}><circle r={26} /><circle r={8} fill={G} />{Array.from({ length: 8 }, (_, i) => <path key={i} d={`M0 0 L${Math.cos(i * 0.785) * 26} ${Math.sin(i * 0.785) * 26}`} strokeWidth={1.6} />)}{Array.from({ length: 16 }, (_, i) => <path key={'f' + i} d={`M${Math.cos(i * 0.3927) * 26} ${Math.sin(i * 0.3927) * 26} L${Math.cos(i * 0.3927 + 0.1) * 34} ${Math.sin(i * 0.3927 + 0.1) * 34}`} strokeWidth={2} />)}</g>; break;
    case 'shankha': g = <g {...st}><path d="M-18 10 Q-22 -16 0 -24 Q22 -16 16 6 Q8 20 -6 18 Q-14 14 -18 10 Z" fill="#08122D" /><path d="M-8 -6 Q0 -14 8 -6 Q4 4 -4 2" /></g>; break;
    case 'gada': g = <g {...st}><path d="M0 50 L0 -30" /><ellipse cx={0} cy={-50} rx={16} ry={22} fill="#08122D" /></g>; break;
    case 'bow': g = <g {...st}><path d="M-6 -80 Q34 0 -6 80" strokeWidth={4} /><path d="M-6 -80 L-6 80" strokeWidth={1.2} /></g>; break;
    case 'khadga': g = <g {...st}><path d="M0 20 L0 -84 Q8 -94 4 -100" strokeWidth={5} /><path d="M-14 20 L14 20" /></g>; break;
    case 'vajra': g = <g {...st}><path d="M0 -14 L0 14" strokeWidth={5} /><path d="M0 -14 Q-14 -30 0 -54 Q14 -30 0 -14 M-10 -18 Q-20 -36 -8 -48 M10 -18 Q20 -36 8 -48" /><path d="M0 14 Q-14 30 0 54 Q14 30 0 14 M-10 18 Q-20 36 -8 48 M10 18 Q20 36 8 48" /></g>; break;
    case 'ghanta': g = <g {...st}><path d="M-16 20 Q-16 -14 0 -16 Q16 -14 16 20 Z" fill="#08122D" /><path d="M0 -16 L0 -34 M-6 -34 L6 -34" /><circle cy={24} r={3} fill={G} /></g>; break;
    case 'abhaya': g = <g {...st}><path d="M-8 10 L-8 -16 M-2 10 L-2 -22 M4 10 L4 -20 M10 10 L10 -14" strokeWidth={3.4} /></g>; break;
    default: g = null;
  }
  return <g transform={`translate(${x} ${y}) scale(${s})`}>{g}</g>;
};

export type ShaktiKind = 'brahmani' | 'maheshvari' | 'kaumari' | 'vaishnavi' | 'varahi' | 'narasimhi' | 'aindri' | 'chandika' | 'shivaduti';
const SH: Record<ShaktiKind, { name: string; label: string; emblems: [Emblem, Emblem, Emblem, Emblem]; head: 'crown' | 'boar' | 'lion' | 'flame'; mount: string | null; arms?: number }> = {
  brahmani: { name: 'ब्रह्माणी', label: 'Brahmani', emblems: ['rosary', 'kamandalu', 'abhaya', 'none'], head: 'crown', mount: 'hamsa' },
  maheshvari: { name: 'माहेश्वरी', label: 'Maheshvari', emblems: ['trishul', 'abhaya', 'none', 'none'], head: 'crown', mount: 'bull' },
  kaumari: { name: 'कौमारी', label: 'Kaumari', emblems: ['spear', 'abhaya', 'none', 'none'], head: 'crown', mount: 'peacock' },
  vaishnavi: { name: 'वैष्णवी', label: 'Vaishnavi', emblems: ['chakra', 'shankha', 'gada', 'bow'], head: 'crown', mount: 'garuda' },
  varahi: { name: 'वाराही', label: 'Varahi', emblems: ['khadga', 'chakra', 'none', 'none'], head: 'boar', mount: null },
  narasimhi: { name: 'नारसिंही', label: 'Narasimhi', emblems: ['abhaya', 'none', 'none', 'none'], head: 'lion', mount: null },
  aindri: { name: 'ऐन्द्री', label: 'Aindri', emblems: ['vajra', 'abhaya', 'none', 'none'], head: 'crown', mount: 'elephant' },
  chandika: { name: 'चंडिका', label: 'Chandika', emblems: ['bow', 'ghanta', 'trishul', 'khadga'], head: 'crown', mount: 'lion', arms: 8 },
  shivaduti: { name: 'शिवदूती', label: 'Shivaduti', emblems: ['khadga', 'trishul', 'none', 'none'], head: 'flame', mount: null },
};
export const SHAKTI = SH;

/** The mount (vahana) drawn below and behind a figure whose seat is at (0, 0). */
const Mount: React.FC<{ k: string; t: number }> = ({ k, t }) => {
  const st = { fill: '#071230', stroke: G, strokeWidth: 3, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
  const line = { fill: 'none', stroke: G, strokeWidth: 2, strokeLinecap: 'round' as const };
  switch (k) {
    case 'hamsa':
      return (
        <g transform="translate(0 40)">
          <path d="M-150 20 Q-60 70 90 30 Q150 10 170 -30 Q120 -10 80 -20 Q40 -60 -40 -30 Q-120 -10 -150 20 Z" {...st} />
          <path d="M150 -18 Q170 -90 140 -120 Q120 -140 104 -118 Q120 -110 128 -96 Q140 -60 120 -24" {...st} />
          <path d="M104 -118 L84 -112 L104 -106" fill={G} />
          <path d="M-100 0 Q-30 -40 50 -10 M-80 20 Q-10 -12 60 10" {...line} opacity={0.7} />
        </g>
      );
    case 'bull':
      return (
        <g transform="translate(0 50)">
          <path d="M-170 30 Q-170 -30 -110 -40 Q-40 -60 60 -40 Q120 -40 150 -70 Q176 -76 184 -50 Q190 -20 160 -6 Q130 10 110 30 Z" {...st} />
          <path d="M150 -70 Q140 -100 160 -110 M176 -70 Q196 -96 184 -112" {...line} />
          <path d="M-60 -56 Q-40 -86 -10 -60" {...st} />
          <circle cx={168} cy={-48} r={3} fill={G} />
        </g>
      );
    case 'peacock':
      return (
        <g transform="translate(0 40)">
          {Array.from({ length: 15 }, (_, i) => {
            const a = Math.PI + (i / 14) * Math.PI;
            const x = Math.cos(a) * 230, y = Math.sin(a) * 200 - 20;
            return <g key={i}><path d={`M0 -10 L${x} ${y}`} {...line} opacity={0.5} /><ellipse cx={x} cy={y} rx={12} ry={16} fill="none" stroke={G} strokeWidth={2} /><circle cx={x} cy={y} r={5} fill={G} opacity={0.8 + 0.2 * Math.sin(t * 0.1 + i)} /></g>;
          })}
          <path d="M-80 30 Q-40 -10 40 0 Q90 6 110 -40 Q118 -70 104 -84 Q92 -70 96 -50 Q80 -14 30 -20 Q-40 -30 -80 30 Z" {...st} />
          <path d="M104 -84 L112 -100 M104 -84 L98 -102 M104 -84 L118 -94" {...line} />
        </g>
      );
    case 'garuda':
      return (
        <g transform="translate(0 -60)">
          {[-1, 1].map((sd) => (
            <g key={sd} transform={`scale(${sd} 1)`}>
              <path d="M30 0 Q160 -120 300 -90 Q240 -60 260 -30 Q200 -40 210 0 Q150 -10 150 30 Q90 10 30 40 Z" {...st} />
              {[0, 1, 2, 3].map((i) => <path key={i} d={`M${70 + i * 45} ${-10 - i * 14} Q${110 + i * 45} ${-40 - i * 16} ${150 + i * 40} ${-50 - i * 10}`} {...line} opacity={0.6} />)}
            </g>
          ))}
        </g>
      );
    case 'elephant':
      return (
        <g transform="translate(0 60)">
          <path d="M-190 40 Q-200 -60 -120 -90 Q-20 -120 80 -90 Q150 -70 170 -10 Q176 30 160 60 L140 60 Q150 20 130 0 L120 60 L90 60 L92 0 Q20 10 -60 0 L-62 60 L-92 60 L-96 10 Q-130 20 -150 60 L-180 60 Z" {...st} />
          <path d="M160 -20 Q200 0 196 60 Q194 80 182 84" fill="none" stroke={G} strokeWidth={5} strokeLinecap="round" />
          <path d="M150 0 Q176 20 200 10" fill="none" stroke={P.goldHi} strokeWidth={4} strokeLinecap="round" />
          <path d="M100 -80 Q130 -50 110 -20 Q90 -40 100 -80 Z" fill="none" stroke={G} strokeWidth={2} />
          <circle cx={140} cy={-46} r={3.5} fill={G} />
          <path d="M-80 -110 Q0 -140 80 -110" {...line} opacity={0.6} />
        </g>
      );
    case 'lion':
      return (
        <g transform="translate(0 60)">
          <path d="M-200 50 Q-210 -30 -130 -40 Q-40 -50 80 -40 Q120 -40 140 -70 L150 -70 Q190 -60 196 -20 Q200 20 170 30 L160 60 L130 60 L128 20 L-60 20 L-64 60 L-94 60 L-100 20 Q-140 30 -160 60 L-190 60 Z" {...st} />
          {Array.from({ length: 12 }, (_, i) => { const a = -2.2 + i * 0.28; return <path key={i} d={`M${160 + Math.cos(a) * 30} ${-30 + Math.sin(a) * 30} Q${160 + Math.cos(a) * 56} ${-30 + Math.sin(a) * 56} ${160 + Math.cos(a + 0.12) * 66} ${-30 + Math.sin(a + 0.12) * 66}`} {...line} />; })}
          <path d="M-200 0 Q-240 -40 -220 -80" {...line} />
          <circle cx={180} cy={-34} r={3.5} fill={G} />
        </g>
      );
    default:
      return null;
  }
};

/**
 * A form of the Devi as a temple bronze: prabha, figure, emblems, mount. Seat/feet at (x, y). p 0..1 = reveal.
 * Never caricatured: still, symmetrical, crowned, the face suggested only by the crown and a calm line.
 */
export const Shakti: React.FC<{ k: ShaktiKind; x: number; y: number; s?: number; p?: number; t?: number; label?: boolean; glow?: number }> = ({ k, x, y, s = 1, p = 1, t = 0, label = false, glow = 1 }) => {
  const d = SH[k];
  const arms = d.arms ?? (d.emblems.filter((e) => e !== 'none').length > 2 ? 4 : 4);
  const seated = !!d.mount;
  const hy = seated ? -300 : -360; // head centre
  const reveal = clamp(p);
  // arm hand positions (upper pair raised, lower pair forward), more for 8-armed Chandika
  const hands: [number, number][] = arms === 8
    ? [[-150, hy - 30], [150, hy - 30], [-175, hy + 60], [175, hy + 60], [-160, hy + 150], [160, hy + 150], [-70, hy + 170], [70, hy + 170]]
    : [[-110, hy - 20], [110, hy - 20], [-70, hy + 150], [70, hy + 150]];
  const emblemFor = (i: number): Emblem => {
    if (arms === 8) return (['bow', 'ghanta', 'trishul', 'khadga', 'chakra', 'shankha', 'gada', 'abhaya'] as Emblem[])[i];
    return [d.emblems[0], d.emblems[1], d.emblems[2], d.emblems[3]][i] as Emblem;
  };
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={reveal}>
      <g transform={`translate(0 ${(1 - reveal) * 30})`}>
        <Prabha cx={0} cy={hy + 40} r={arms === 8 ? 260 : 190} t={t} o={glow} />
        {d.mount ? <Mount k={d.mount} t={t} /> : null}
        {/* arms behind the body */}
        {hands.map(([hx, hhy], i) => {
          const sx = hx < 0 ? -40 : 40, sy = hy + 70;
          const ex = (sx + hx) / 2 + (hx < 0 ? -20 : 20), ey = (sy + hhy) / 2;
          return <Limb key={i} d={`M${sx} ${sy} Q${ex} ${ey} ${hx} ${hhy}`} w={14} />;
        })}
        {/* body: seated (padmasana-like) or standing */}
        {seated ? (
          <path d={`M-90 0 Q-100 -40 -60 -50 L-34 ${hy + 160} Q-40 ${hy + 110} -36 ${hy + 70} L-14 ${hy + 52} L14 ${hy + 52} L36 ${hy + 70} Q40 ${hy + 110} 34 ${hy + 160} L60 -50 Q100 -40 90 0 Z`} fill="url(#rkFigure)" stroke={G} strokeWidth={3} strokeLinejoin="round" />
        ) : (
          <path d={`M-40 0 L-16 0 L-10 -120 L10 -120 L16 0 L40 0 L44 -150 L34 ${hy + 160} Q40 ${hy + 110} 36 ${hy + 70} L14 ${hy + 52} L-14 ${hy + 52} L-36 ${hy + 70} Q-40 ${hy + 110} -34 ${hy + 160} L-44 -150 Z`} fill="url(#rkFigure)" stroke={G} strokeWidth={3} strokeLinejoin="round" />
        )}
        <g fill="none" stroke={G} strokeLinecap="round">
          <path d={`M-30 ${hy + 66} Q0 ${hy + 100} 30 ${hy + 66}`} strokeWidth={2.4} />
          <path d={`M-24 ${hy + 74} Q0 ${hy + 120} 24 ${hy + 74}`} strokeWidth={1.4} opacity={0.6} />
          <path d={`M-34 ${hy + 160} L34 ${hy + 160}`} strokeWidth={2.6} />
        </g>
        {/* head */}
        {d.head === 'boar' ? (
          <g>
            {/* Varahi: a sow's head, crowned: drooping ears, a long snout, small upturned tusks (never horns) */}
            <path d={`M-28 ${hy - 10} Q-52 ${hy - 4} -50 ${hy + 16} Q-38 ${hy + 10} -27 ${hy + 4} Z M28 ${hy - 10} Q52 ${hy - 4} 50 ${hy + 16} Q38 ${hy + 10} 27 ${hy + 4} Z`} fill="#0A1533" stroke={G} strokeWidth={2.2} />
            <path d={`M-27 ${hy - 18} Q-30 ${hy + 18} -16 ${hy + 40} L16 ${hy + 40} Q30 ${hy + 18} 27 ${hy - 18} Q0 ${hy - 34} -27 ${hy - 18} Z`} fill="#0A1533" stroke={G} strokeWidth={2.6} />
            <ellipse cx={0} cy={hy + 44} rx={17} ry={10} fill="#0A1533" stroke={G} strokeWidth={2.4} />
            <circle cx={-6} cy={hy + 44} r={2.4} fill={G} /><circle cx={6} cy={hy + 44} r={2.4} fill={G} />
            <path d={`M-15 ${hy + 38} Q-24 ${hy + 34} -24 ${hy + 24} M15 ${hy + 38} Q24 ${hy + 34} 24 ${hy + 24}`} stroke={P.goldHi} strokeWidth={3} fill="none" strokeLinecap="round" />
            <path d={`M-12 ${hy + 2} L-5 ${hy + 4} M5 ${hy + 4} L12 ${hy + 2}`} stroke={P.goldHi} strokeWidth={2} />
            <path d={`M-22 ${hy - 20} L-18 ${hy - 52} Q0 ${hy - 80} 18 ${hy - 52} L22 ${hy - 20} Z`} fill="#08122D" stroke={G} strokeWidth={2.2} strokeLinejoin="round" />
            <circle cx={0} cy={hy - 82} r={5} fill={G} />
          </g>
        ) : d.head === 'lion' ? (
          <g>
            {Array.from({ length: 22 }, (_, i) => { const a = (i / 22) * 6.283; const r1 = 34, r2 = 62 + 6 * Math.sin(t * 0.12 + i); return <path key={i} d={`M${Math.cos(a) * r1} ${hy + Math.sin(a) * r1} Q${Math.cos(a + 0.2) * (r2 - 10)} ${hy + Math.sin(a + 0.2) * (r2 - 10)} ${Math.cos(a + 0.1) * r2} ${hy + Math.sin(a + 0.1) * r2}`} fill="none" stroke={G} strokeWidth={2.6} />; })}
            <circle cx={0} cy={hy} r={30} fill="#0A1533" stroke={G} strokeWidth={2.6} />
            <path d={`M-12 ${hy - 4} L-4 ${hy - 2} M4 ${hy - 2} L12 ${hy - 4} M-6 ${hy + 14} Q0 ${hy + 20} 6 ${hy + 14}`} stroke={P.goldHi} strokeWidth={2} fill="none" />
          </g>
        ) : (
          <g>
            <circle cx={0} cy={hy} r={23} fill="#0A1533" stroke={G} strokeWidth={2.4} />
            <path d={`M-22 ${hy - 10} L-18 ${hy - 46} Q0 ${hy - 82} 18 ${hy - 46} L22 ${hy - 10} Z`} fill="#08122D" stroke={G} strokeWidth={2.4} strokeLinejoin="round" />
            {[-34, -50, -64].map((o, i) => <path key={i} d={`M${-18 + i * 4} ${hy + o} Q0 ${hy + o - 6} ${18 - i * 4} ${hy + o}`} fill="none" stroke={G} strokeWidth={1.3} opacity={0.7} />)}
            <circle cx={0} cy={hy - 86} r={5} fill={G} />
            {k === 'maheshvari' ? <path d={`M-14 ${hy - 50} Q0 ${hy - 36} 14 ${hy - 50} Q0 ${hy - 42} -14 ${hy - 50} Z`} fill={P.goldHi} /> : null}
            {d.head === 'flame' ? Array.from({ length: 9 }, (_, i) => { const a = -2.6 + i * 0.4; return <path key={i} d={`M${Math.cos(a) * 26} ${hy + Math.sin(a) * 26} Q${Math.cos(a) * 46} ${hy + Math.sin(a) * 46 - 10} ${Math.cos(a) * 60} ${hy + Math.sin(a) * 60}`} fill="none" stroke={G} strokeWidth={2} />; }) : null}
            <path d={`M-10 ${hy + 1} L-3 ${hy + 2} M3 ${hy + 2} L10 ${hy + 1}`} stroke={P.goldHi} strokeWidth={2} />
            <path d={`M-5 ${hy + 13} Q0 ${hy + 15} 5 ${hy + 13}`} stroke={G} strokeWidth={1.4} fill="none" />
          </g>
        )}
        {/* emblems in the hands */}
        {hands.map(([hx, hhy], i) => <EmblemG key={i} k={emblemFor(i)} x={hx} y={hhy} s={arms === 8 ? 0.85 : 1} />)}
        {/* Aindri's thousand eyes */}
        {k === 'aindri' ? Array.from({ length: 34 }, (_, i) => {
          const a = rnd(41, i) * 6.283, r = 60 + rnd(42, i) * 120;
          return <g key={i} transform={`translate(${Math.cos(a) * r} ${hy + 60 + Math.sin(a) * r * 0.9})`} opacity={0.5 + 0.5 * Math.abs(Math.sin(t * 0.05 + i))}><path d="M-7 0 Q0 -5 7 0 Q0 5 -7 0 Z" fill="none" stroke={P.goldHi} strokeWidth={1.4} /><circle r={1.6} fill={P.goldHi} /></g>;
        }) : null}
        {/* Narasimhi's mane scatters the stars */}
        {k === 'narasimhi' ? <g>{Array.from({ length: 26 }, (_, i) => { const a = rnd(51, i) * 6.283; const r = 90 + ((t * 1.2 + rnd(52, i) * 300) % 300); return <circle key={i} cx={Math.cos(a) * r} cy={hy + Math.sin(a) * r} r={1.5 + rnd(53, i) * 2.5} fill={P.star} opacity={clamp(1 - (r - 90) / 300)} />; })}</g> : null}
      </g>
      {label ? <text x={0} y={120} textAnchor="middle" fontFamily={F.deva} fontSize={54} fill={P.goldHi}>{d.name}</text> : null}
    </g>
  );
};

/** Kali, felt rather than shown: a vast shadow, ember eyes, gold glints on the garland, the mouth a night of stars. */
export const KaliPresence: React.FC<{ t: number; p?: number; eyes?: number; mouth?: number; cx?: number; cy?: number; s?: number }> = ({ t, p = 1, eyes = 1, mouth = 0, cx = 960, cy = 380, s = 1 }) => (
  <g opacity={p} transform={`translate(${cx} ${cy}) scale(${s})`}>
    {/* the shadow: a towering gaunt silhouette with wild hair, edges lost in the dark */}
    <path d="M-520 760 Q-470 300 -300 120 Q-360 -60 -250 -260 Q-180 -420 0 -440 Q180 -420 250 -260 Q360 -60 300 120 Q470 300 520 760 Z" fill="#000208" opacity={0.92} />
    {Array.from({ length: 30 }, (_, i) => { const a = -2.9 + i * 0.1; const r = 430 + 40 * Math.sin(t * 0.03 + i * 1.3); return <path key={i} d={`M${Math.cos(a) * 300} ${-140 + Math.sin(a) * 300} Q${Math.cos(a + 0.08) * r} ${-140 + Math.sin(a + 0.08) * r} ${Math.cos(a + 0.15) * (r + 80)} ${-140 + Math.sin(a + 0.15) * (r + 80)}`} fill="none" stroke="#02050F" strokeWidth={22} strokeLinecap="round" />; })}
    {/* garland: gold glints only */}
    {Array.from({ length: 27 }, (_, i) => { const u = i / 26; const x = -330 + u * 660; const y = 150 + Math.sin(u * Math.PI) * 330; return <circle key={i} cx={x} cy={y} r={5 + (i % 3)} fill={P.gold} opacity={(0.35 + 0.5 * Math.abs(Math.sin(t * 0.04 + i))) * p} />; })}
    {/* ember eyes */}
    {[-1, 1].map((sd) => (
      <g key={sd} transform={`translate(${sd * 78} -200)`} opacity={eyes}>
        <ellipse rx={46} ry={20} fill={P.ember} opacity={0.25} filter="url(#rkBlur8)" />
        <path d="M-34 0 Q0 -18 34 0 Q0 16 -34 0 Z" fill={P.ember} />
        <circle r={7} fill={P.goldHi} />
      </g>
    ))}
    {/* the mouth: a night sky full of stars */}
    {mouth > 0 ? (
      <g>
        <defs><clipPath id="kaliMouth"><ellipse cx={0} cy={-40} rx={260 * mouth} ry={150 * mouth} /></clipPath></defs>
        <ellipse cx={0} cy={-40} rx={262 * mouth} ry={152 * mouth} fill="none" stroke={P.gold} strokeWidth={2} opacity={0.4} />
        <g clipPath="url(#kaliMouth)">
          <rect x={-300} y={-220} width={600} height={360} fill="url(#rkVoid)" />
          <Stars t={t} n={120} seed={77} box={[-300, -220, 600, 360]} />
        </g>
      </g>
    ) : null}
  </g>
);

/** The gods, faint in the clouds above the field. */
export const Gods: React.FC<{ t: number; o?: number; y?: number }> = ({ t, o = 0.5, y = 150 }) => (
  <g opacity={o}>
    {[[-560, 0.9], [-260, 1.05], [60, 1.15], [380, 1], [660, 0.85]].map(([dx, s], i) => (
      <g key={i} transform={`translate(${960 + dx} ${y + Math.sin(t * 0.01 + i) * 6}) scale(${s})`}>
        <path d="M-120 120 Q-110 40 -40 30 Q-30 0 0 -6 Q30 0 40 30 Q110 40 120 120" fill="none" stroke={P.snow} strokeWidth={2} opacity={0.6} />
        <circle cx={0} cy={-30} r={26} fill="none" stroke={P.snow} strokeWidth={2} opacity={0.6} />
        <path d="M-20 -50 L-14 -86 Q0 -104 14 -86 L20 -50" fill="none" stroke={P.snow} strokeWidth={2} opacity={0.6} />
        <path d="M-10 -26 Q-6 -22 -2 -26 M2 -26 Q6 -22 10 -26" fill="none" stroke={P.snow} strokeWidth={1.6} opacity={0.6} />
      </g>
    ))}
  </g>
);

/** The Asura silhouette as one path (same outline as Asura, head and crown merged), for crowds: cheap to draw by the hundred. */
const MINI = 'M-48 0 L-20 0 Q-18 -56 -12 -112 L12 -112 Q18 -56 20 0 L48 0 Q46 -56 40 -112 Q66 -116 64 -128 Q70 -170 52 -212 '
  + 'Q60 -248 74 -270 L96 -150 L112 -160 L92 -290 Q66 -308 24 -304 L14 -306 L14 -318 A24 24 0 0 0 25 -352 L21 -384 L11 -370 L0 -404 '
  + 'L-11 -370 L-21 -384 L-25 -352 A24 24 0 0 0 -14 -318 L-14 -306 L-24 -304 Q-66 -308 -92 -290 L-112 -160 L-96 -150 L-74 -270 '
  + 'Q-60 -248 -52 -212 Q-70 -170 -64 -128 Q-66 -116 -40 -112 Q-46 -56 -48 0 Z';
export const Mini: React.FC<{ x: number; y: number; s: number; o?: number; rim?: number; rise?: number; mace?: boolean; flip?: boolean; dust?: number; seed?: number; back?: boolean }> = ({ x, y, s, o = 1, rim = 1, rise = 1, mace = true, flip = false, dust = 0, seed = 1, back = false }) => {
  if (o <= 0) return null;
  const sink = (1 - clamp(rise)) * 404;
  const vis = 1 - clamp(dust * 1.8);
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} opacity={o}>
      {vis > 0 ? (
        <g opacity={vis}>
          <svg x={-200} y={-460} width={400} height={460} viewBox="-200 -460 400 460" overflow="hidden">
            <g transform={`translate(0 ${sink})`}>
              {mace ? <g><path d="M104 -150 L104 -330" stroke={P.gold} strokeWidth={14} opacity={0.8 * rim} /><path d="M104 -150 L104 -330" stroke="#08122D" strokeWidth={8} /><ellipse cx={104} cy={-350} rx={24} ry={32} fill="#08122D" stroke={P.gold} strokeWidth={3} opacity={rim} /></g> : null}
              <path d={MINI} fill="url(#rkFigure)" stroke={P.gold} strokeWidth={3 / Math.max(0.4, s)} strokeOpacity={0.85 * rim} strokeLinejoin="round" />
              {back
                ? <path d="M-20 -334 Q-26 -300 -18 -270 M0 -330 L0 -268 M20 -334 Q26 -300 18 -270 M-40 -212 L40 -212" fill="none" stroke={P.gold} strokeWidth={2.4} opacity={0.6 * rim} />
                : <path d="M-12 -341 L-4 -339 M4 -339 L12 -341" stroke={P.goldHi} strokeWidth={3} opacity={0.8 * rim} />}
            </g>
          </svg>
        </g>
      ) : null}
      {dust > 0 ? <DustBurst x={0} y={-20} p={dust} seed={seed} n={40} spread={110} h={380} /> : null}
    </g>
  );
};

/** Depth-sorted rows of identical warriors, from the horizon (small) to the foreground (large). n0..n1 shown by `count`. */
export const Horde: React.FC<{ t: number; count: number; horizon?: number; rows?: number; per?: number; seed?: number; rise?: (i: number) => number; dust?: (i: number) => number; o?: number; x0?: number; x1?: number; nearY?: number; nearS?: number; mace?: boolean }> =
  ({ t, count, horizon = 700, rows = 6, per = 14, seed = 4, rise, dust, o = 1, x0 = -60, x1 = 1980, nearY = 1040, nearS = 0.75, mace = true }) => {
  const items: React.ReactNode[] = [];
  let i = 0;
  for (let r = 0; r < rows; r++) {
    const k = r / Math.max(1, rows - 1);
    const y = horizon + 14 + (nearY - horizon - 14) * k * k;
    const s = 0.1 + (nearS - 0.1) * k * k;
    const n = Math.round(per * (1.6 - k * 0.8));
    for (let c = 0; c < n; c++, i++) {
      if (i >= count) continue;
      const x = x0 + (x1 - x0) * ((c + 0.5 + (rnd(seed, i) - 0.5) * 0.6) / n);
      const bob = Math.sin(t * 0.12 + i) * 2 * s;
      items.push(<Mini key={i} x={x} y={y + bob + rnd(seed + 1, i) * 10 * k} s={s * (0.94 + rnd(seed + 2, i) * 0.12)} rise={rise ? rise(i) : 1} dust={dust ? dust(i) : 0} seed={i} rim={0.5 + 0.5 * k} mace={mace} flip={rnd(seed + 3, i) > 0.5} />);
    }
  }
  return <g opacity={o}>{items}</g>;
};
