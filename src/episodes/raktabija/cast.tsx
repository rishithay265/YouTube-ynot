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
const Limb: React.FC<{ d: string; w: number; rim?: number; core?: string }> = ({ d, w, rim = 1, core = '#08122D' }) => (
  <g fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} stroke={G} strokeWidth={w + 5} opacity={0.85 * rim} />
    <path d={d} stroke={core} strokeWidth={w} />
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
  /** 'blood' (default): deep lacquer-red skin, Raktabija and everyone born of his blood. 'navy': the original look. */
  tone?: 'navy' | 'blood';
  /** An asura's face: heavy brows, wide eyes, curled moustache, small fangs, gold earrings. On by default. */
  fierce?: boolean;
}> = ({ x, y, s = 1, pose = 'stand', mark = false, wound = 0, rim = 1, rise = 1, dust = 0, id, flip = false, dim = 0, tilt = 0, t = 0, contra = false, look = 0, tone = 'blood', fierce = true }) => {
  const red = tone === 'blood';
  const SKIN = red ? 'url(#rkBlood)' : DARK, CORE = red ? '#5A0E1A' : '#08122D', HEAD = red ? '#6A1222' : '#0A1533';
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
          {contra ? <g>{[legF, legW].map((d, i) => <path key={i} d={d} fill={SKIN} stroke={G} strokeWidth={3} strokeLinejoin="round" />)}</g> : null}
          <g transform={upperT}>
          {/* hair behind */}
          <path d="M-24 -348 Q-46 -300 -54 -262 L-34 -286 Q-26 -318 -22 -340 Z M24 -348 Q46 -300 54 -262 L34 -286 Q26 -318 22 -340 Z" fill={red ? '#1A0408' : '#060D22'} stroke={G} strokeWidth={1.2} opacity={0.9} />
          {/* far arm (left) */}
          <Limb d={`M${ls[0]} ${ls[1]} L${lelb[0]} ${lelb[1]} L${lh[0]} ${lh[1]}`} w={22} rim={rim} core={CORE} />
          <path d={contra ? upper : body} fill={SKIN} stroke={G} strokeWidth={3} strokeLinejoin="round" opacity={1} transform={`translate(0 ${breathe * 0.3})`} />
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
          <circle cx={0} cy={-340} r={24} fill={HEAD} stroke={G} strokeWidth={2.4} />
          <path d="M-25 -352 L-21 -384 L-11 -370 L0 -404 L11 -370 L21 -384 L25 -352 Z" fill="#08122D" stroke={G} strokeWidth={2.4} strokeLinejoin="round" />
          <path d="M-24 -356 L24 -356" stroke={G} strokeWidth={2} />
          <circle cx={0} cy={-366} r={3.5} fill={G} />
          {fierce ? (
            <g transform={`translate(${look * 6} 0)`} strokeLinecap="round">
              {[-1, 1].map((sd) => (
                <g key={sd}>
                  <path d={`M${sd * 19} -352 L${sd * 4} -346`} stroke="#1A0604" strokeWidth={4.2} />
                  <path d={`M${sd * 16} -342 Q${sd * 10} -347 ${sd * 4} -342 Q${sd * 10} -338 ${sd * 16} -342 Z`} fill={P.goldHi} />
                  <circle cx={sd * 10} cy={-342} r={1.6} fill="#1A0604" />
                  <path d={`M0 -330 C${sd * 7} -335 ${sd * 17} -333 ${sd * 21} -325 C${sd * 23} -320 ${sd * 19} -318 ${sd * 17} -321`} fill="none" stroke="#1A0604" strokeWidth={3.2} />
                  <path d={`M${sd * 6} -322 L${sd * 5} -315 L${sd * 3} -322 Z`} fill="#FFF4D6" />
                  <circle cx={sd * 25} cy={-328} r={5} fill="none" stroke={P.gold} strokeWidth={2.4} />
                </g>
              ))}
              <path d="M-6 -321 Q0 -318 6 -321" stroke="#1A0604" strokeWidth={2} fill="none" />
            </g>
          ) : (
            <path d={`M${-12 + look * 7} -341 L${-4 + look * 7} -339 M${4 + look * 7} -339 L${12 + look * 7} -341`} stroke={P.goldHi} strokeWidth={2.2} strokeLinecap="round" />
          )}
          {wound > 0 ? (
            <g opacity={wound}>
              {/* his mark: a blood-drop tilak on the brow (where Aindri's vajra struck), dripping to the nose */}
              <circle cx={0} cy={-350} r={12} fill="#FF3B30" opacity={0.3} filter="url(#rkBlur8)" />
              <path d="M0 -362 Q6 -352 5 -347 A5 5 0 0 1 -5 -347 Q-6 -352 0 -362 Z" fill="#E8222E" stroke={P.goldHi} strokeWidth={0.8} />
              <path d="M0 -342 L0 -333" stroke="#E8222E" strokeWidth={2} strokeLinecap="round" />
            </g>
          ) : null}
          </g>
          {mark ? (
            <g>
              <path d="M-26 -262 Q-34 -244 -22 -228 Q-8 -220 4 -232 Q10 -250 0 -262 Q-12 -270 -26 -262 Z" fill={red ? '#C8913F' : '#8C5A2A'} stroke={red ? P.goldHi : 'none'} strokeWidth={1.6} opacity={0.95} />
              <path d="M-22 -258 Q-28 -246 -18 -236 M-12 -262 Q-16 -246 -8 -234 M-2 -258 Q-4 -246 2 -238" fill="none" stroke="#C08A4A" strokeWidth={2} strokeLinecap="round" opacity={0.9} />
              <circle cx={-10} cy={-246} r={26} fill="#B07A3C" opacity={0.18} filter="url(#rkBlur8)" />
            </g>
          ) : null}
          {/* near arm (right) with armlet, and the mace */}
          {A.mace !== null ? <Gada x={rh[0]} y={rh[1]} a={A.r[0] + A.r[1] + A.mace} len={A.len} rim={rim} /> : null}
          <Limb d={`M${rs[0]} ${rs[1]} L${relb[0]} ${relb[1]} L${rh[0]} ${rh[1]}`} w={24} rim={rim} core={CORE} />
          <circle cx={(rs[0] + relb[0]) / 2} cy={(rs[1] + relb[1]) / 2} r={9} fill="none" stroke={G} strokeWidth={2.4} />
          <circle cx={rh[0]} cy={rh[1]} r={12} fill={CORE} stroke={G} strokeWidth={2} />
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
export const Mini: React.FC<{ x: number; y: number; s: number; o?: number; rim?: number; rise?: number; mace?: boolean; flip?: boolean; dust?: number; seed?: number; back?: boolean; tone?: 'navy' | 'blood' }> = ({ x, y, s, o = 1, rim = 1, rise = 1, mace = true, flip = false, dust = 0, seed = 1, back = false, tone = 'blood' }) => {
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
              <path d={MINI} fill={tone === 'blood' ? 'url(#rkBlood)' : 'url(#rkFigure)'} stroke={P.gold} strokeWidth={3 / Math.max(0.4, s)} strokeOpacity={0.85 * rim} strokeLinejoin="round" />
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

// ---------------------------------------------------------------- Kali ma, shown
const KB0 = '#3C7BE0', KBHI0 = '#86B8FF', KBDEEP0 = '#1D3F8C', KSKIN = '#03050D';

/**
 * Kali ma's face in the film's line-art: dark skin drawn in blue strokes, the third eye, wild flowing hair, a gold
 * crown with a lotus-flame, the nath, gold earrings and collar, and the red tongue (the one red besides the blood she
 * drinks). Origin: between the eyes. eyes: 0 = lowered, half-closed (compassion), 1 = open (the battle).
 * Drawn for this film in the spirit of traditional and devotional images; no skulls, no severed heads.
 */
export const KaliFace: React.FC<{ x: number; y: number; s?: number; eyes?: number; t?: number; o?: number; tone?: 'blue' | 'gold'; glow?: number; spread?: number }> = ({ x, y, s = 1, eyes = 0, t = 0, o = 1, tone = 'blue', glow = 0, spread = 1 }) => {
  const gold = tone === 'gold';
  const KB = gold ? P.gold : KB0, KBHI = gold ? P.goldHi : KBHI0, KBDEEP = gold ? P.goldDeep : KBDEEP0, HAIRDEEP = gold ? '#3A2A08' : '#0B1A3E';
  // Hair: long wavy locks rooted along the curve of the skull, rising over the crown, then falling past the shoulders.
  const strands = Array.from({ length: gold ? 64 : 96 }, (_, i) => {
    const side = i % 2 ? 1 : -1, u = rnd(91, i);
    const ang = -Math.PI / 2 + side * (0.08 + u * 1.25);           // root position on the skull arc
    const rx0 = Math.cos(ang) * 168, ry0 = -60 + Math.sin(ang) * 200;
    const L = 420 + rnd(92, i) * 320, ph = rnd(94, i) * 6.28, amp = 22 + rnd(97, i) * 34;
    const lift = 70 + (1 - u) * 90;                                  // locks from the crown rise higher before falling
    const pts = Array.from({ length: 9 }, (_, k) => {
      const q = k / 8;
      const px = rx0 + (side * (60 + 220 * u) * Math.sin(q * 1.7) + amp * Math.sin(q * 6 + ph + t * 0.02) * q) * spread;
      const py = ry0 - lift * Math.sin(Math.min(1, q * 2.4) * Math.PI) * (q < 0.42 ? 1 : 0.25) + L * q * q;
      return [px, py];
    });
    let d = `M${pts[0][0]} ${pts[0][1]}`;
    for (let k = 1; k < pts.length - 1; k++) {
      const mx = (pts[k][0] + pts[k + 1][0]) / 2, my = (pts[k][1] + pts[k + 1][1]) / 2;
      d += ` Q${pts[k][0]} ${pts[k][1]} ${mx} ${my}`;
    }
    const deep = gold ? i % 3 === 0 : i % 5 === 0;
    return { d, w: deep ? 16 + rnd(95, i) * 10 : 3 + rnd(95, i) * 7, c: deep ? HAIRDEEP : [KB, KBHI, KBDEEP, KB][i % 4], op: deep ? 0.9 : (gold ? 0.35 : 0.5) + rnd(96, i) * (gold ? 0.4 : 0.45) };
  });
  const lid = (sd: number) => {
    // lowered: a lit crescent lid; open: an almond eye with a dark iris
    const open = clamp(eyes);
    return (
      <g key={sd}>
        <path d={`M${sd * 138} -8 C${sd * 112} ${-32 - 10 * open} ${sd * 60} ${-34 - 10 * open} ${sd * 32} -10 C${sd * 60} ${-2 + 14 * open} ${sd * 110} ${2 + 14 * open} ${sd * 138} -8 Z`} fill={KB} opacity={0.95} />
        {open > 0.05 ? <g opacity={open}><circle cx={sd * 84} cy={-12} r={17} fill={KBHI} /><circle cx={sd * 84} cy={-12} r={8} fill={KSKIN} /><circle cx={sd * 80} cy={-16} r={2.6} fill="#FFFFFF" opacity={0.8} /></g> : null}
        <path d={`M${sd * 140} -9 C${sd * 112} -36 ${sd * 60} -38 ${sd * 30} -11`} fill="none" stroke={KBHI} strokeWidth={4} strokeLinecap="round" />
      </g>
    );
  };
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
      {glow > 0 ? <circle cx={0} cy={20} r={420} fill="url(#rkHalo)" opacity={glow} /> : null}
      {/* hair */}
      <path d="M-170 -170 Q-120 -300 0 -300 Q120 -300 170 -170 Q260 -40 290 160 Q310 330 250 460 Q200 400 150 440 Q90 380 0 400 Q-90 380 -150 440 Q-200 400 -250 460 Q-310 330 -290 160 Q-260 -40 -170 -170 Z" fill={KSKIN} opacity={0.92} />
      <g fill="none" strokeLinecap="round">{strands.map((h, i) => <path key={i} d={h.d} stroke={h.c} strokeWidth={h.w} opacity={h.op} />)}</g>
      {/* neck and collar, snug under the chin */}
      <path d="M-70 220 L70 220 L96 330 L-96 330 Z" fill={KSKIN} />
      <path d="M-104 268 Q0 316 104 268" fill="none" stroke={P.gold} strokeWidth={10} strokeLinecap="round" />
      {Array.from({ length: 9 }, (_, i) => {
        const u = i / 8, px = -96 + 192 * u, py = 270 + Math.sin(u * Math.PI) * 40;
        return <path key={i} d={`M${px - 9} ${py} Q${px} ${py + 34} ${px + 9} ${py} Z`} fill={i === 4 ? P.goldHi : P.gold} />;
      })}
      <path d="M0 312 C18 330 15 356 0 368 C-15 356 -18 330 0 312 Z" fill={P.gold} />
      {/* face */}
      <path d="M0 -196 C150 -196 166 -40 152 60 C138 170 72 252 0 264 C-72 252 -138 170 -152 60 C-166 -40 -150 -196 0 -196 Z" fill={KSKIN} />
      <g fill="none" strokeLinecap="round">
        {[-1, 1].map((sd) => (
          <g key={sd}>
            <path d={`M${sd * 150} -30 C${sd * 160} 80 ${sd * 122} 192 ${sd * 40} 252`} stroke={KB} strokeWidth={8} opacity={0.85} />
            <path d={`M${sd * 128} 30 C${sd * 126} 110 ${sd * 98} 170 ${sd * 60} 206`} stroke={KBDEEP} strokeWidth={5} opacity={0.8} />
            <path d={`M${sd * 24} -48 C${sd * 60} -80 ${sd * 112} -76 ${sd * 146} -44`} stroke={KB} strokeWidth={10} />
          </g>
        ))}
      </g>
      {/* crown: gold band and lotus-flame */}
      <path d="M-156 -150 Q0 -222 156 -150" fill="none" stroke={P.gold} strokeWidth={10} strokeLinecap="round" />
      <path d="M0 -340 C34 -296 38 -254 0 -216 C-38 -254 -34 -296 0 -340 Z" fill={P.gold} />
      <path d="M0 -312 C14 -290 16 -266 0 -246 C-16 -266 -14 -290 0 -312 Z" fill={KSKIN} opacity={0.75} />
      {[-1, 1].map((sd) => <path key={sd} d={`M${sd * 18} -222 C${sd * 60} -246 ${sd * 100} -226 ${sd * 92} -194 C${sd * 86} -180 ${sd * 70} -184 ${sd * 72} -196`} fill="none" stroke={P.gold} strokeWidth={8} strokeLinecap="round" />)}
      <circle cx={0} cy={-206} r={13} fill={P.goldHi} />
      {/* third eye and bindu */}
      <path d="M0 -172 C24 -142 24 -102 0 -78 C-24 -102 -24 -142 0 -172 Z" fill="none" stroke={KBHI} strokeWidth={5} />
      <circle cx={0} cy={-124} r={11} fill={KB} />
      <circle cx={0} cy={-124} r={4} fill={KSKIN} />
      <circle cx={0} cy={-60} r={6} fill={P.goldHi} />
      {/* eyes */}
      {[-1, 1].map(lid)}
      {/* nose and lips */}
      <g fill="none" stroke={KB} strokeLinecap="round">
        <path d="M-4 -40 C-10 4 -12 32 -14 50" strokeWidth={7} />
        <path d="M-34 62 C-22 78 22 78 34 62" strokeWidth={7} />
        <path d="M-36 106 C-16 96 16 96 36 106" strokeWidth={6} />
      </g>
      {/* the tongue */}
      <path d="M-27 104 C-32 168 -22 222 0 240 C22 222 32 168 27 104 Z" fill="#D2333D" />
      <path d="M0 116 L0 214" stroke="#8C1420" strokeWidth={4} strokeLinecap="round" />
      <path d="M-16 120 C-18 160 -12 196 -4 214" stroke="#F07A72" strokeWidth={3} fill="none" opacity={0.6} />
      {/* nath (on her left nostril) with its chain to the ear, and earrings */}
      <circle cx={62} cy={80} r={50} fill="none" stroke={P.gold} strokeWidth={7} strokeDasharray="260 60" transform="rotate(200 62 80)" />
      {Array.from({ length: 7 }, (_, i) => <circle key={i} cx={108 + i * 8} cy={58 - i * 11} r={5} fill={P.gold} />)}
      {[-1, 1].map((sd) => <g key={sd}><circle cx={sd * 166} cy={40} r={20} fill="none" stroke={P.gold} strokeWidth={7} /><circle cx={sd * 166} cy={68} r={8} fill={P.goldHi} /></g>)}
    </g>
  );
};

// ---------------------------------------------------------------- Raktabija, close up
/**
 * Raktabija's face for close-ups: blood-red skin with a gold edge, a dark-gold crown, heavy flame brows, burning eyes,
 * a great curled moustache, fangs, gold crescent earrings, and his mark, the blood-drop tilak dripping from the brow.
 * A trail of blood curls around him. Origin: between the eyes. rage 0..1 brightens the eyes; drip 0..1 runs the tilak.
 */
export const RaktabijaFace: React.FC<{ x: number; y: number; s?: number; t?: number; rage?: number; drip?: number; o?: number; trail?: boolean; hair?: number }> = ({ x, y, s = 1, t = 0, rage = 1, drip = 1, o = 1, trail = true, hair = 1 }) => {
  const DK = '#1A0406', R = '#B3202E';
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
      {/* the trail of blood */}
      {trail ? <g fill="none" strokeLinecap="round">
        <path d="M-60 -420 C-260 -380 -330 -200 -300 -60" stroke={R} strokeWidth={26} opacity={0.75} />
        <path d="M-60 -420 C-260 -380 -330 -200 -300 -60" stroke="#FF4A3C" strokeWidth={6} opacity={0.6} />
        <path d="M250 120 C320 260 220 380 40 420" stroke={R} strokeWidth={24} opacity={0.75} />
        <path d="M250 120 C320 260 220 380 40 420" stroke="#FF4A3C" strokeWidth={5} opacity={0.6} />
        {Array.from({ length: 9 }, (_, i) => <circle key={i} cx={-300 + rnd(71, i) * 120} cy={-300 + rnd(72, i) * 260} r={3 + rnd(73, i) * 5} fill={R} stroke="none" />)}
      </g> : null}
      {/* hair sweeping back (hair={0} hides it) */}
      {hair > 0 ? <g fill="none" strokeLinecap="round">
        {Array.from({ length: 26 }, (_, i) => {
          const side = i % 2 ? 1 : -1, u = rnd(74, i);
          const x0 = side * (60 + u * 110), y0 = -190 + u * 90;
          return <path key={i} d={`M${x0} ${y0} C${x0 + side * 90 * hair} ${y0 - 40 - u * 60} ${x0 + side * 200 * hair} ${y0 + 10} ${x0 + side * (240 + u * 120) * hair} ${y0 + 140 + u * 160}`} stroke={i % 3 ? '#5A0E18' : P.goldDeep} strokeWidth={6 + rnd(75, i) * 10} opacity={0.85} />;
        })}
      </g> : null}
      {/* ears */}
      {[-1, 1].map((sd) => <path key={sd} d={`M${sd * 160} -20 C${sd * 196} -30 ${sd * 200} 40 ${sd * 166} 70`} fill="#7A1424" stroke={P.gold} strokeWidth={4} />)}
      {/* head: broad cheekbones, a heavy jaw */}
      <path d="M0 -212 C130 -212 172 -110 172 -10 C172 70 150 150 112 210 C80 252 40 270 0 272 C-40 270 -80 252 -112 210 C-150 150 -172 70 -172 -10 C-172 -110 -130 -212 0 -212 Z" fill="url(#rkBlood)" stroke={P.gold} strokeWidth={5} />
      <g fill="none" stroke="#4A0810" strokeLinecap="round">
        {[-1, 1].map((sd) => <path key={sd} d={`M${sd * 150} 20 C${sd * 140} 80 ${sd * 118} 120 ${sd * 92} 150 M${sd * 128} -40 C${sd * 110} -10 ${sd * 96} 20 ${sd * 64} 40`} strokeWidth={5} opacity={0.8} />)}
      </g>
      {/* a short beard along the jaw */}
      <g fill="none" stroke="#1A0406" strokeLinecap="round">
        {Array.from({ length: 15 }, (_, i) => { const u = i / 14, a0 = Math.PI * (0.15 + 0.7 * u), r0 = 150; const bx = Math.cos(a0) * r0 * 0.78, by = 120 + Math.sin(a0) * 120; return <path key={i} d={`M${bx} ${by - 30} Q${bx * 1.05} ${by} ${bx * 0.95} ${by + 26}`} strokeWidth={7} opacity={0.85} />; })}
      </g>
      {/* crown: a tiered mukut with a tall central peak and jewels */}
      <path d="M-150 -168 Q0 -214 150 -168 L140 -214 Q0 -252 -140 -214 Z" fill="#3A2408" stroke={P.gold} strokeWidth={5} />
      <path d="M-128 -222 C-120 -270 -90 -282 -70 -262 C-60 -300 -30 -320 0 -372 C30 -320 60 -300 70 -262 C90 -282 120 -270 128 -222 Q0 -258 -128 -222 Z" fill="#2A1606" stroke={P.gold} strokeWidth={5} strokeLinejoin="round" />
      <path d="M-100 -238 C-60 -260 60 -260 100 -238 M-60 -262 C-30 -290 30 -290 60 -262" fill="none" stroke={P.goldDeep} strokeWidth={3} />
      <path d="M0 -360 C10 -340 10 -326 0 -316 C-10 -326 -10 -340 0 -360 Z" fill="#E8222E" stroke={P.goldHi} strokeWidth={2} />
      {[-96, -48, 0, 48, 96].map((cx) => <circle key={cx} cx={cx} cy={-188 - (96 - Math.abs(cx)) * 0.12} r={7} fill={cx === 0 ? '#E8222E' : P.goldHi} />)}
      {/* brows */}
      {[-1, 1].map((sd) => (
        <g key={sd}>
          <path d={`M${sd * 18} -40 C${sd * 60} -70 ${sd * 120} -92 ${sd * 165} -70 C${sd * 130} -66 ${sd * 90} -52 ${sd * 30} -28 Z`} fill={DK} stroke={P.goldDeep} strokeWidth={2} />
          {/* burning eyes */}
          <path d={`M${sd * 32} -18 C${sd * 60} -36 ${sd * 110} -36 ${sd * 132} -22 C${sd * 110} -2 ${sd * 60} 0 ${sd * 32} -18 Z`} fill="#FF3B30" opacity={0.6 + 0.4 * rage} />
          <ellipse cx={sd * 80} cy={-18} rx={44} ry={20} fill="#FF3B30" opacity={0.25 * rage} filter="url(#rkBlur8)" />
          <circle cx={sd * 82} cy={-18} r={5} fill="#FFE2A8" opacity={rage} />
          {/* gold crescent earrings */}
          <path d={`M${sd * 172} 40 A26 26 0 1 0 ${sd * 172} 92 A18 18 0 1 1 ${sd * 172} 40 Z`} fill={P.gold} />
        </g>
      ))}
      {/* nose */}
      <path d="M-6 -10 C-14 40 -20 62 -30 80 M30 80 C10 92 -10 92 -30 80" fill="none" stroke={DK} strokeWidth={6} strokeLinecap="round" />
      {/* the great moustache and the fangs */}
      {[-1, 1].map((sd) => (
        <g key={sd}>
          <path d={`M0 108 C${sd * 40} 88 ${sd * 110} 96 ${sd * 150} 132 C${sd * 170} 150 ${sd * 160} 176 ${sd * 136} 168 C${sd * 150} 160 ${sd * 146} 144 ${sd * 120} 136 C${sd * 80} 124 ${sd * 30} 130 0 124 Z`} fill={DK} stroke={P.goldDeep} strokeWidth={2} />
          <path d={`M${sd * 30} 134 Q${sd * 34} 166 ${sd * 22} 186 Q${sd * 22} 160 ${sd * 18} 136 Z`} fill="#FFF1D2" />
        </g>
      ))}
      <path d="M-26 150 Q0 160 26 150" fill="none" stroke={DK} strokeWidth={5} strokeLinecap="round" />
      {/* his mark: the blood-drop tilak, dripping */}
      <circle cx={0} cy={-100} r={46} fill="#FF3B30" opacity={0.25} filter="url(#rkBlur8)" />
      <path d="M0 -170 C22 -130 26 -100 24 -84 A24 24 0 0 1 -24 -84 C-26 -100 -22 -130 0 -170 Z" fill="#E8222E" stroke={P.goldHi} strokeWidth={2.5} />
      <path d={`M0 -60 L0 ${-60 + 70 * clamp(drip)}`} stroke="#E8222E" strokeWidth={6} strokeLinecap="round" />
      {[-1, 1].map((sd) => <circle key={sd} cx={sd * 34} cy={-120} r={5} fill="#E8222E" />)}
    </g>
  );
};

// ---------------------------------------------------------------- Kali ma, full form
/**
 * Kali ma standing, towering, in gold line-art: KaliFace above a dark form with a gold girdle and a garland of gold
 * beads (no skulls, no severed heads), long hair falling behind. Four arms: khadga raised, khappar held out to catch
 * the blood, abhaya and varada mudras. Feet at (x, y); s = 1 is about 1000 px tall. eyes as in KaliFace.
 */
export const KaliForm: React.FC<{ x: number; y: number; s?: number; eyes?: number; t?: number; o?: number; bowl?: number }> = ({ x, y, s = 1, eyes = 1, t = 0, o = 1, bowl = 1 }) => {
  const SK = '#03050D', G2 = P.gold;
  const arm = (d: string) => (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} stroke={G2} strokeWidth={34} />
      <path d={d} stroke={SK} strokeWidth={26} />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
      <circle cx={0} cy={-620} r={520} fill="url(#rkHalo)" opacity={0.7} />
      {/* hair falling behind her, to the knees */}
      <g fill="none" strokeLinecap="round">
        {Array.from({ length: 40 }, (_, i) => {
          const side = i % 2 ? 1 : -1, u = rnd(81, i);
          const x0 = side * (40 + u * 90), y0 = -900;
          return <path key={i} d={`M${x0} ${y0} C${x0 + side * (160 + u * 120)} ${y0 + 120} ${x0 + side * (120 + u * 200)} ${y0 + 420} ${x0 + side * (200 + u * 160)} ${y0 + 700 + u * 120}`} stroke={i % 4 ? P.goldDeep : P.gold} strokeWidth={4 + rnd(82, i) * 8} opacity={0.55 + rnd(83, i) * 0.4} />;
        })}
      </g>
      {/* arms behind the body: khadga raised, khappar held out; abhaya and varada */}
      {arm('M-110 -640 L-240 -720 L-300 -860')}
      <g transform="translate(-300 -868) rotate(-14)"><path d="M0 0 L0 -230 Q14 -250 6 -270" fill="none" stroke={P.goldHi} strokeWidth={12} strokeLinecap="round" /><path d="M-30 6 L30 6" stroke={G2} strokeWidth={10} strokeLinecap="round" /><path d="M0 6 L0 40" stroke={G2} strokeWidth={10} /></g>
      {arm('M-100 -600 L-220 -500 L-330 -470')}
      <g transform="translate(-350 -462)" opacity={bowl}>
        <path d="M-70 -10 Q0 80 70 -10 Z" fill={SK} stroke={P.goldHi} strokeWidth={6} />
        <path d="M-70 -10 L70 -10" stroke={P.goldHi} strokeWidth={6} strokeLinecap="round" />
        <ellipse cx={0} cy={-8} rx={60} ry={10} fill="#B3202E" opacity={0.85} />
      </g>
      {arm('M110 -640 L230 -700 L260 -830')}
      <g transform="translate(262 -846)" fill="none" stroke={P.goldHi} strokeWidth={8} strokeLinecap="round">
        <path d="M-24 30 L-24 -20 M-8 30 L-8 -34 M8 30 L8 -32 M24 30 L24 -18" />
      </g>
      {arm('M100 -600 L210 -480 L250 -380')}
      <g transform="translate(254 -360)" fill="none" stroke={P.goldHi} strokeWidth={8} strokeLinecap="round">
        <path d="M-22 -20 L-22 30 M-7 -20 L-7 40 M8 -20 L8 38 M22 -20 L22 26" />
      </g>
      {/* body: shoulders, waist, a flaring skirt, legs */}
      <path d="M-130 -650 Q0 -690 130 -650 L100 -420 Q140 -380 150 -300 L190 -110 Q100 -90 60 -100 L50 0 L10 0 L4 -100 L-4 -100 L-10 0 L-50 0 L-60 -100 Q-100 -90 -190 -110 L-150 -300 Q-140 -380 -100 -420 Z" fill={SK} stroke={G2} strokeWidth={6} strokeLinejoin="round" />
      {/* girdle with gold leaf pendants, and the garland of gold beads */}
      <path d="M-104 -410 Q0 -380 104 -410" fill="none" stroke={G2} strokeWidth={12} />
      {Array.from({ length: 9 }, (_, i) => { const px = -96 + i * 24; return <path key={i} d={`M${px - 8} -398 Q${px} -360 ${px + 8} -398 Z`} fill={P.goldHi} />; })}
      {Array.from({ length: 21 }, (_, i) => { const u = i / 20, px = -110 + 220 * u, py = -640 + Math.sin(u * Math.PI) * 220; return <circle key={i} cx={px} cy={py} r={9} fill={P.gold} />; })}
      {/* her face */}
      <KaliFace x={0} y={-800} s={0.5} eyes={eyes} t={t} tone="gold" />
    </g>
  );
};
