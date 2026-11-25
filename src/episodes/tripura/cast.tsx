import React from 'react';
import { P, clamp, lerp, rnd, ease } from '../raktabija/world';

// The cast of "हम त्रिपुर थे": the three cities, Shiva as Tripurari, Brahma, Vishnu, Narada, the Mundi (Arihan), the
// chariot of the gods (Sun and Moon wheels, the four Veda horses), the bull, Ganesha, and the fire. Gold line-art on navy
// as in the Raktabija film (its world.tsx is imported, never modified). Every frame is SVG drawn here in code.

export type Metal = 'gold' | 'silver' | 'iron';
export const METAL: Record<Metal, { line: string; hi: string; fill0: string; fill1: string; win: string; name: string; en: string }> = {
  gold: { line: '#E3BB44', hi: '#F8DF8C', fill0: '#3A2A08', fill1: '#120C02', win: '#FFE7A0', name: 'स्वर्णपुर', en: 'THE GOLDEN CITY' },
  silver: { line: '#D3DCEC', hi: '#F2F6FF', fill0: '#2A3242', fill1: '#0C1018', win: '#EAF0FF', name: 'रजतपुर', en: 'THE SILVER CITY' },
  iron: { line: '#8E99AB', hi: '#C3CCDA', fill0: '#1E232B', fill1: '#08090D', win: '#FFB070', name: 'लौहपुर', en: 'THE IRON CITY' },
};
export const MetalDefs: React.FC = () => (
  <defs>
    {(Object.keys(METAL) as Metal[]).map((k) => (
      <linearGradient key={k} id={`tpM-${k}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={METAL[k].fill0} />
        <stop offset="1" stopColor={METAL[k].fill1} />
      </linearGradient>
    ))}
    <linearGradient id="tpFire" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stopColor="#FFF1B0" />
      <stop offset="0.35" stopColor="#FFB040" />
      <stop offset="0.75" stopColor="#E8501E" />
      <stop offset="1" stopColor="#7E1426" stopOpacity={0} />
    </linearGradient>
    <radialGradient id="tpHeat" cx="50%" cy="50%" r="50%">
      <stop offset="0" stopColor="#FFE9A8" stopOpacity={0.9} />
      <stop offset="0.4" stopColor="#FF8A2A" stopOpacity={0.45} />
      <stop offset="1" stopColor="#7E1426" stopOpacity={0} />
    </radialGradient>
    <linearGradient id="tpVishnu" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#163A86" />
      <stop offset="1" stopColor="#081A44" />
    </linearGradient>
    <linearGradient id="tpShiva" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#1B2C58" />
      <stop offset="1" stopColor="#070F26" />
    </linearGradient>
  </defs>
);

// ---------------------------------------------------------------- fire, ash, molten metal
/** One flame tongue, base at (x, y), height h; flickers with t. */
export const Flame: React.FC<{ x: number; y: number; h: number; t: number; seed?: number; o?: number; w?: number }> = ({ x, y, h, t, seed = 1, o = 1, w }) => {
  if (h <= 1 || o <= 0) return null;
  const f = 0.82 + 0.18 * Math.sin(t * 0.37 + seed * 3.1) + 0.08 * Math.sin(t * 0.91 + seed);
  const hh = h * f, ww = w ?? h * 0.36;
  const sway = Math.sin(t * 0.21 + seed * 1.7) * ww * 0.5;
  return (
    <path d={`M${x - ww} ${y} Q${x - ww * 0.9} ${y - hh * 0.45} ${x + sway * 0.4} ${y - hh * 0.7} Q${x + sway} ${y - hh * 0.9} ${x + sway * 1.2} ${y - hh} Q${x + ww * 0.6 + sway * 0.4} ${y - hh * 0.55} ${x + ww} ${y} Z`}
      fill="url(#tpFire)" opacity={o} />
  );
};
/** A row of flames over [x0, x1] at height y. */
export const FireLine: React.FC<{ x0: number; x1: number; y: number; h: number; t: number; n?: number; seed?: number; o?: number }> = ({ x0, x1, y, h, t, n = 14, seed = 2, o = 1 }) => (
  <g opacity={o} style={{ mixBlendMode: 'screen' }}>
    {Array.from({ length: n }, (_, i) => {
      const x = lerp(x0, x1, (i + 0.5) / n) + (rnd(seed, i) - 0.5) * 20;
      return <Flame key={i} x={x} y={y} h={h * (0.5 + rnd(seed + 1, i) * 0.8)} t={t + i * 7} seed={seed + i} />;
    })}
  </g>
);
/** Ash and embers rising (p 0..1 how much is ash). */
export const Embers: React.FC<{ t: number; n?: number; seed?: number; o?: number; box?: [number, number, number, number]; ash?: number }> = ({ t, n = 60, seed = 5, o = 1, box = [0, 0, 1920, 1080], ash = 0 }) => (
  <g opacity={o}>
    {Array.from({ length: n }, (_, i) => {
      const [bx, by, bw, bh] = box;
      const sp = 0.6 + rnd(seed, i) * 1.6;
      const y = by + bh - ((rnd(seed + 1, i) * bh + t * sp * 2.2) % bh);
      const x = bx + rnd(seed + 2, i) * bw + Math.sin(t * 0.03 + i) * 14;
      const r = 1.2 + rnd(seed + 3, i) * 2.6;
      const isAsh = rnd(seed + 4, i) < ash;
      return <circle key={i} cx={x} cy={y} r={isAsh ? r * 1.3 : r} fill={isAsh ? '#8C8A86' : rnd(seed + 5, i) > 0.5 ? '#FFB040' : '#FFE08A'} opacity={(isAsh ? 0.55 : 0.85) * (0.4 + 0.6 * Math.abs(Math.sin(t * 0.08 + i)))} />;
    })}
  </g>
);

// ---------------------------------------------------------------- the three cities
const TOWERS: [number, number, number][] = [[-230, 120, 44], [-160, 180, 54], [-82, 150, 48], [0, 270, 70], [82, 150, 48], [160, 190, 54], [232, 116, 44]];
/** A temple tower (shikhara) of base half-width w and height h, standing on y=0. */
const towerPath = (x: number, h: number, w: number) =>
  `M${x - w} 0 L${x - w} ${-h * 0.32} Q${x - w * 0.95} ${-h * 0.75} ${x - w * 0.22} ${-h * 0.95} L${x} ${-h} L${x + w * 0.22} ${-h * 0.95} Q${x + w * 0.95} ${-h * 0.75} ${x + w} ${-h * 0.32} L${x + w} 0 Z`;
/**
 * A city: a floating rock with a walled skyline of temple towers. (x, y) is the top of the platform; s scales it (width
 * about 640 at s = 1). burn 0..1 sets it alight, heat 0..1 makes the metal glow from within (red, then white for iron),
 * melt 0..1 drips molten metal from the rock, ash 0..1 crumbles it away. lights 0..1: windows and the Shiva shrine lamps.
 */
export const City: React.FC<{ k: Metal; x: number; y: number; s?: number; t: number; o?: number; burn?: number; heat?: number; melt?: number; ash?: number; lights?: number; id: string; spin?: number }> =
  ({ k, x, y, s = 1, t, o = 1, burn = 0, heat = 0, melt = 0, ash = 0, lights = 1, id, spin = 0 }) => {
    if (o <= 0) return null;
    const M = METAL[k];
    const vis = 1 - clamp(ash * 1.15);
    const heatCol = k === 'iron' && heat > 0.6 ? '#FFF4E0' : heat > 0.3 ? '#FF7A2A' : '#C2361E';
    const rock = `M-320 0 L320 0 L300 34 L250 60 L262 96 L200 130 L170 190 L110 214 L84 268 L30 300 L0 352 L-24 304 L-80 276 L-118 214 L-176 196 L-206 130 L-262 100 L-252 62 L-302 34 Z`;
    return (
      <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
        <defs><clipPath id={`tpc-${id}`}><rect x={-400} y={-400} width={800} height={800 * vis + 1} transform={`translate(0 ${(1 - vis) * 400})`} /></clipPath></defs>
        {/* orbit trail: the city never stops moving */}
        {spin > 0 ? <ellipse cx={0} cy={20} rx={420} ry={60} fill="none" stroke={M.line} strokeWidth={1.6} strokeDasharray="6 14" strokeDashoffset={-t * 2} opacity={0.35 * spin} /> : null}
        <g clipPath={`url(#tpc-${id})`}>
          <path d={rock} fill="#060A18" stroke={M.line} strokeWidth={2.4} strokeOpacity={0.7} strokeLinejoin="round" />
          {[[-180, 60], [-60, 120], [90, 90], [150, 40], [-10, 220]].map(([a, b], i) => <path key={i} d={`M${a} ${b} l${30 + i * 6} ${18 + i * 3}`} stroke={M.line} strokeWidth={1.2} opacity={0.35} />)}
          {/* wall with battlements */}
          <path d={`M-300 0 L-300 -46 ${Array.from({ length: 25 }, (_, i) => { const xx = -300 + i * 25; return `L${xx} -46 L${xx} -58 L${xx + 12} -58 L${xx + 12} -46`; }).join(' ')} L300 -46 L300 0 Z`}
            fill={`url(#tpM-${k})`} stroke={M.line} strokeWidth={2.4} strokeLinejoin="round" />
          {/* gate */}
          <path d="M-30 0 L-30 -30 Q0 -58 30 -30 L30 0" fill="#040712" stroke={M.line} strokeWidth={2} />
          {TOWERS.map(([tx, th, tw], i) => (
            <g key={i}>
              <path d={towerPath(tx, th + 46, tw)} transform="translate(0 -46)" fill={`url(#tpM-${k})`} stroke={M.line} strokeWidth={2.4} strokeLinejoin="round" />
              {[0.35, 0.55, 0.75].map((q, j) => <path key={j} d={`M${tx - tw * (1 - q * 0.55)} ${-46 - (th + 46) * q} L${tx + tw * (1 - q * 0.55)} ${-46 - (th + 46) * q}`} stroke={M.line} strokeWidth={1.2} opacity={0.55} />)}
              <circle cx={tx} cy={-46 - th - 52} r={tw * 0.14} fill={M.line} />
              <path d={`M${tx} ${-46 - th - 58} L${tx} ${-46 - th - 82}`} stroke={M.line} strokeWidth={2} />
              <path d={`M${tx} ${-46 - th - 82} L${tx + 16} ${-46 - th - 76} L${tx} ${-46 - th - 70}`} fill={M.line} opacity={0.9} />
              {/* windows: lamps of the Shiva shrines */}
              <rect x={tx - 6} y={-46 - (th + 46) * 0.24 - 10} width={12} height={18} rx={6} fill={M.win} opacity={lights * (0.55 + 0.35 * Math.sin(t * 0.05 + i * 2))} />
            </g>
          ))}
          {/* the glow of heat inside the metal */}
          {heat > 0 ? (
            <g opacity={heat} style={{ mixBlendMode: 'screen' }}>
              {TOWERS.map(([tx, th, tw], i) => <path key={i} d={towerPath(tx, th + 46, tw)} transform="translate(0 -46)" fill={heatCol} opacity={0.55 + 0.2 * Math.sin(t * 0.2 + i)} />)}
              <rect x={-300} y={-58} width={600} height={58} fill={heatCol} opacity={0.6} />
            </g>
          ) : null}
        </g>
        {/* molten metal running off the rock */}
        {melt > 0 ? (
          <g>
            {Array.from({ length: 9 }, (_, i) => {
              const xx = -220 + i * 55 + (rnd(4, i) - 0.5) * 20;
              const base = 60 + Math.abs(xx) * -0.15 + 180 * (1 - Math.abs(xx) / 320);
              const len = melt * (120 + rnd(5, i) * 260);
              const dy = ((t * (2 + rnd(6, i) * 2)) % 200) * melt;
              return (
                <g key={i}>
                  <path d={`M${xx - 7} ${base} Q${xx} ${base + len} ${xx + 7} ${base}`} fill={k === 'iron' ? '#FFB060' : M.hi} opacity={0.85} />
                  <circle cx={xx} cy={base + len + dy} r={6 + rnd(7, i) * 5} fill={k === 'iron' ? '#FFB060' : M.hi} opacity={0.8 * (1 - dy / 200)} />
                </g>
              );
            })}
          </g>
        ) : null}
        {/* fire across the skyline */}
        {burn > 0 ? (
          <g>
            <ellipse cx={0} cy={-120} rx={420} ry={260} fill="url(#tpHeat)" opacity={0.7 * burn} />
            <FireLine x0={-300} x1={300} y={-40} h={120 + 260 * burn} t={t} n={16} seed={id.length + 3} o={clamp(burn * 1.4)} />
          </g>
        ) : null}
      </g>
    );
  };

// ---------------------------------------------------------------- figures
/** The common figure base: navy body, gold rim. Origin at the feet, height about 520 at s = 1. */
const FIG = { fill: 'url(#rkFigure)', stroke: P.gold, sw: 3 };

/** A limb as a tapered capsule through the points, widths w0 -> w1 (filled, no stroke: drawn twice by Fig for a clean rim). */
export const limb = (pts: [number, number][], w0: number, w1: number) => {
  const L: string[] = [], R: string[] = [];
  pts.forEach(([x, y], i) => {
    const [ax, ay] = pts[Math.max(0, i - 1)], [bx, by] = pts[Math.min(pts.length - 1, i + 1)];
    const dx = bx - ax, dy = by - ay, n = Math.hypot(dx, dy) || 1;
    const w = lerp(w0, w1, i / Math.max(1, pts.length - 1)) / 2;
    L.push(`${x - (dy / n) * w} ${y + (dx / n) * w}`); R.unshift(`${x + (dy / n) * w} ${y - (dx / n) * w}`);
  });
  const [ex, ey] = pts[pts.length - 1], [sx, sy] = pts[0];
  return `M${L.join(' L')} A${w1 / 2} ${w1 / 2} 0 0 1 ${R[0]} L${R.join(' L')} A${w0 / 2} ${w0 / 2} 0 0 1 ${L[0]} Z` + ` M${ex} ${ey} m0 0` + ` M${sx} ${sy}`;
};
/** Draws a set of shapes as one figure: a gold rim pass under a fill pass, so overlaps merge into one silhouette. */
export const Fig: React.FC<{ d: string[]; fill: string; rim?: string; w?: number }> = ({ d, fill, rim = P.gold, w = 6 }) => (
  <g>
    <g fill={rim} stroke={rim} strokeWidth={w} strokeLinejoin="round">{d.map((x, i) => <path key={i} d={x} />)}</g>
    <g fill={fill}>{d.map((x, i) => <path key={i} d={x} />)}</g>
  </g>
);
const SH = { l: [88, -428] as [number, number], r: [-88, -428] as [number, number] };
export const TORSO = 'M-62 -262 Q-70 -330 -94 -398 Q-102 -432 -74 -444 L74 -444 Q102 -432 94 -398 Q70 -330 62 -262 Z';
export const NECK = 'M-17 -472 L17 -472 L19 -436 L-19 -436 Z';

/**
 * Shiva as Tripurari: jata with the crescent and Ganga, the third eye (eye 0..1 opens it; anger 0..1 reddens the face),
 * the serpent at the neck, tiger-skin and dhoti. pose 'stand' holds the trishula; 'draw' is the archer: the Meru bow in
 * the left hand, Vishnu as the arrow drawn back to the face by `pull` 0..1; 'sit' is seated in meditation.
 */
export const Shiva: React.FC<{ x: number; y: number; s?: number; t?: number; o?: number; pose?: 'stand' | 'draw' | 'sit'; pull?: number; eye?: number; anger?: number; flip?: boolean; glow?: number; arrow?: boolean; smile?: number }> =
  ({ x, y, s = 1, t = 0, o = 1, pose = 'stand', pull = 0, eye = 0, anger = 0, flip = false, glow = 0, arrow = true, smile = 0 }) => {
    if (o <= 0) return null;
    const draw = pose === 'draw', sit = pose === 'sit';
    const lift = sit ? 160 : 0; // seated: the upper body drops
    const U = (dy: number) => dy + lift;
    const face = anger > 0 ? `rgb(${Math.round(lerp(22, 140, anger))},${Math.round(lerp(40, 26, anger))},${Math.round(lerp(86, 40, anger))})` : '#1B2C58';
    const pe = ease(clamp(pull));
    const hand: [number, number] = draw ? [lerp(236, -6, pe), U(lerp(-452, -498, pe))] : [0, 0];
    const elbow: [number, number] = draw ? [lerp(80, -150, pe), U(lerp(-420, -482, pe))] : [0, 0];
    const bowX = 252, bowY = U(-452);
    const legs = sit
      ? ['M-170 -10 Q-170 -96 -64 -112 L64 -112 Q170 -96 170 -10 Q100 6 0 0 Q-100 6 -170 -10 Z']
      : draw
        ? [limb([[-30, -262], [-70, -130], [-104, -10]], 54, 34), limb([[30, -262], [84, -140], [128, -10]], 54, 34)]
        : ['M-64 -262 Q-80 -130 -72 -12 L-20 -12 L-6 -160 L6 -160 L20 -12 L72 -12 Q80 -130 64 -262 Z'];
    const feet = sit ? [] : draw ? ['M-130 -16 Q-104 -30 -80 -16 L-78 0 L-134 0 Z', 'M106 -16 Q130 -30 160 -14 L162 0 L104 0 Z'] : ['M-84 -16 L-20 -16 L-18 0 L-90 0 Z', 'M20 -16 L84 -16 L90 0 L18 0 Z'];
    const arms = draw
      ? [limb([SH.l, [170, -440], [bowX - 14, -452]].map(([a, b]) => [a, U(b)]) as [number, number][], 42, 28),
        limb([[SH.r[0], U(SH.r[1])], elbow, hand], 42, 28)]
      : sit
        ? [limb([[SH.l[0], U(SH.l[1])], [118, U(-330)], [120, U(-250)]], 42, 28), limb([[SH.r[0], U(SH.r[1])], [-118, U(-330)], [-60, U(-268)]], 42, 28)]
        : [limb([SH.l, [124, -330], [104, -236]], 42, 28), limb([SH.r, [-126, -340], [-112, -260]], 42, 28)];
    const up = (d: string) => (lift ? d.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, (m, a, b) => `${a} ${+b + lift}`) : d);
    const hy = U(-520);
    return (
      <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} opacity={o}>
        {glow > 0 ? <circle cx={0} cy={U(-380)} r={330} fill="url(#rkHalo)" opacity={glow} /> : null}
        {/* hair falling behind the shoulders */}
        {[-1, 1].map((sd) => <path key={sd} d={`M${sd * 40} ${hy - 20} Q${sd * 110} ${hy + 60} ${sd * 96} ${hy + 170}`} fill="none" stroke={P.gold} strokeWidth={10} opacity={0.35} strokeLinecap="round" />)}
        <Fig fill="url(#tpShiva)" d={[...legs, ...feet, up(TORSO), up(NECK), ...arms]} />
        {/* dhoti folds and the tiger-skin at the waist */}
        <path d={sit ? 'M-120 -40 Q0 -70 120 -40' : 'M-60 -200 Q0 -170 60 -200 M-50 -120 Q0 -100 50 -120'} fill="none" stroke={P.gold} strokeWidth={1.6} opacity={0.5} />
        <path d={up('M-66 -262 L66 -262 L62 -300 L-62 -300 Z')} fill="#3A240A" stroke={P.gold} strokeWidth={2.4} />
        {[-44, -18, 8, 34].map((xx, i) => <path key={i} d={up(`M${xx} -266 l8 -30`)} stroke="#120A02" strokeWidth={4} />)}
        {/* chest: three lines of ash, rudraksha, the serpent */}
        {[0, 1, 2].map((i) => <path key={i} d={up(`M-34 ${-378 + i * 12} L34 ${-378 + i * 12}`)} stroke={P.snow} strokeWidth={2.6} opacity={0.6} />)}
        <path d={up('M-52 -440 Q0 -360 52 -440')} fill="none" stroke="#8C5A2A" strokeWidth={6} strokeDasharray="2 7" strokeLinecap="round" />
        <path d={up('M-60 -446 Q-14 -408 36 -446 Q62 -462 58 -486')} fill="none" stroke="#3E8A5A" strokeWidth={8} strokeLinecap="round" />
        <path d={up('M52 -490 Q62 -500 70 -486 Q62 -480 56 -484 Z')} fill="#3E8A5A" />
        {/* armlets */}
        {!draw ? [[1, 112, -360], [-1, -116, -370]].map(([sd, ax, ay], i) => <path key={i} d={up(`M${ax - 18} ${ay} L${ax + 18} ${ay + 6 * sd}`)} stroke={P.goldHi} strokeWidth={5} />) : null}
        {/* the trishula (standing) */}
        {pose === 'stand' ? (
          <g>
            <path d="M-112 0 L-112 -760" stroke={P.goldHi} strokeWidth={7} />
            <path d="M-152 -740 Q-152 -790 -138 -824 M-72 -740 Q-72 -790 -86 -824 M-152 -740 Q-112 -720 -72 -740 M-112 -760 L-112 -850" fill="none" stroke={P.goldHi} strokeWidth={7} strokeLinecap="round" />
            <path d="M-130 -706 L-94 -686 L-130 -666 L-94 -646" fill="none" stroke={P.gold} strokeWidth={3} />
            <path d="M-126 -700 L-98 -700 L-98 -650 L-126 -650 Z" fill="none" stroke={P.gold} strokeWidth={0} />
            <circle cx={-112} cy={-262} r={13} fill="#0B1736" stroke={P.goldHi} strokeWidth={3} />
          </g>
        ) : null}
        {/* the bow (Meru), the string (Shesha), the arrow (Vishnu, Agni at the tip) */}
        {draw ? (
          <g>
            <path d={`M${bowX - 20} ${bowY - 360} Q${bowX + 90 + 20 * pe} ${bowY} ${bowX - 20} ${bowY + 340}`} fill="none" stroke={P.goldHi} strokeWidth={12} strokeLinecap="round" filter="url(#rkGlow)" />
            <path d={`M${bowX - 20} ${bowY - 360} L${hand[0]} ${hand[1]} L${bowX - 20} ${bowY + 340}`} fill="none" stroke="#86D6A6" strokeWidth={3.4} />
            {arrow ? (
              <g>
                <path d={`M${hand[0] - 10} ${hand[1]} L${bowX + 250} ${hand[1]}`} stroke="#6FA0FF" strokeWidth={9} strokeLinecap="round" />
                <path d={`M${hand[0] - 10} ${hand[1] - 14} L${hand[0] + 30} ${hand[1]} L${hand[0] - 10} ${hand[1] + 14}`} fill="none" stroke="#A8C4FF" strokeWidth={3} />
                <path d={`M${bowX + 246} ${hand[1] - 18} L${bowX + 300} ${hand[1]} L${bowX + 246} ${hand[1] + 18} Z`} fill={P.goldHi} />
                <Flame x={bowX + 300} y={hand[1] + 10} h={44 + 26 * pe} t={t} seed={4} />
              </g>
            ) : null}
            <circle cx={bowX - 14} cy={bowY} r={16} fill="#1B2C58" stroke={P.gold} strokeWidth={3} />
            <circle cx={hand[0]} cy={hand[1]} r={15} fill="#1B2C58" stroke={P.gold} strokeWidth={3} />
          </g>
        ) : null}
        {/* the head */}
        <ellipse cx={0} cy={hy} rx={48} ry={58} fill={face} stroke={P.gold} strokeWidth={4} />
        {/* jata: a crown of coiled locks, a few strands loose */}
        <path d={`M-46 ${hy - 26} Q-74 ${hy - 80} -48 ${hy - 120} Q-30 ${hy - 160} 0 ${hy - 168} Q30 ${hy - 160} 48 ${hy - 120} Q74 ${hy - 80} 46 ${hy - 26} Q0 ${hy - 50} -46 ${hy - 26} Z`} fill="#0A1430" stroke={P.gold} strokeWidth={4} />
        {[0, 1, 2, 3].map((i) => <path key={i} d={`M${-44 + i * 4} ${hy - 44 - i * 28} Q0 ${hy - 70 - i * 30} ${44 - i * 4} ${hy - 44 - i * 28}`} fill="none" stroke={P.gold} strokeWidth={2} opacity={0.7} />)}
        <path d={`M30 ${hy - 150} A22 22 0 1 0 62 ${hy - 112} A17 17 0 1 1 30 ${hy - 150} Z`} fill={P.star} filter="url(#rkGlow)" />
        <path d={`M-14 ${hy - 166} Q-40 ${hy - 214} -8 ${hy - 252}`} fill="none" stroke="#9EC8FF" strokeWidth={4} opacity={0.65} strokeLinecap="round" />
        {/* brow: tripundra; eyes half-closed */}
        {[0, 1, 2].map((i) => <path key={i} d={`M-30 ${hy - 30 + i * 7} L30 ${hy - 30 + i * 7}`} stroke={P.snow} strokeWidth={2.2} opacity={0.8} />)}
        <path d={`M-32 ${hy + 2} Q-19 ${hy + 9} -7 ${hy + 2} M7 ${hy + 2} Q19 ${hy + 9} 32 ${hy + 2}`} fill="none" stroke={P.goldHi} strokeWidth={3.4} strokeLinecap="round" />
        <path d={`M-4 ${hy + 14} L0 ${hy + 22} L4 ${hy + 14}`} fill="none" stroke={P.gold} strokeWidth={2} opacity={0.7} />
        {/* the third eye */}
        <ellipse cx={0} cy={hy - 40} rx={4 + 3 * eye} ry={1.5 + 13 * eye} fill={anger > 0.2 ? '#FF4A2A' : P.goldHi} stroke={P.goldHi} strokeWidth={1.6} filter={eye > 0 ? 'url(#rkGlow)' : undefined} />
        {eye > 0.3 ? <circle cx={0} cy={hy - 40} r={70 * eye} fill="url(#tpHeat)" opacity={eye * (0.5 + 0.5 * anger)} /> : null}
        <path d={`M-15 ${hy + 34} Q0 ${hy + 34 + 9 * smile} 15 ${hy + 34}`} fill="none" stroke={P.goldHi} strokeWidth={2.6} strokeLinecap="round" />
        <circle cx={-50} cy={hy + 16} r={10} fill="none" stroke={P.gold} strokeWidth={3.4} />
        <circle cx={50} cy={hy + 16} r={10} fill="none" stroke={P.gold} strokeWidth={3.4} />
      </g>
    );
  };

/** Brahma: four faces (three visible), seated on a lotus, a palm-leaf Veda in hand. Origin at the lotus base. */
export const Brahma: React.FC<{ x: number; y: number; s?: number; o?: number; t?: number }> = ({ x, y, s = 1, o = 1, t = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <Lotus x={0} y={0} s={1.1} />
    <path d="M-120 -40 Q-120 -100 -50 -110 L50 -110 Q120 -100 120 -40 Z" fill={FIG.fill} stroke={P.gold} strokeWidth={3} />
    <path d="M-60 -110 Q-76 -200 -84 -240 Q-40 -260 0 -260 Q40 -260 84 -240 Q76 -200 60 -110 Z" fill={FIG.fill} stroke={P.gold} strokeWidth={3} />
    {/* palm-leaf Veda held across */}
    <rect x={-70} y={-170} width={140} height={22} rx={4} fill="#3A2A08" stroke={P.gold} strokeWidth={2} />
    {[-50, -20, 10, 40].map((xx) => <path key={xx} d={`M${xx} -165 L${xx + 14} -165`} stroke={P.goldHi} strokeWidth={1.4} />)}
    {/* three heads */}
    {[[-62, -300, 0.78, -1], [62, -300, 0.78, 1], [0, -318, 0.95, 0]].map(([hx, hy, hs, sd], i) => (
      <g key={i} transform={`translate(${hx} ${hy}) scale(${hs})`}>
        <ellipse cx={0} cy={0} rx={44} ry={56} fill={FIG.fill} stroke={P.gold} strokeWidth={3} />
        <path d="M-40 -30 L-34 -80 L-14 -66 L0 -96 L14 -66 L34 -80 L40 -30 Z" fill="#2A1A08" stroke={P.gold} strokeWidth={2.4} />
        {/* white beard */}
        <path d="M-34 18 Q-30 80 0 96 Q30 80 34 18 Q0 34 -34 18 Z" fill="#C9CFDC" opacity={0.85} />
        <path d={sd === 0 ? 'M-20 -4 Q-12 0 -4 -4 M4 -4 Q12 0 20 -4' : `M${sd * 6} -4 Q${sd * 14} 0 ${sd * 22} -4`} fill="none" stroke={P.goldHi} strokeWidth={2.6} strokeLinecap="round" />
      </g>
    ))}
    <circle cx={0} cy={-330} r={170 + Math.sin(t * 0.03) * 4} fill="none" stroke={P.gold} strokeWidth={1.4} opacity={0.4} />
  </g>
);

/** A lotus, centre (x, y). */
export const Lotus: React.FC<{ x: number; y: number; s?: number; o?: number; c?: string }> = ({ x, y, s = 1, o = 1, c = '#E890A8' }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    {[-4, -3, -2, -1, 0, 1, 2, 3, 4].map((i) => (
      <path key={i} d="M0 0 Q-30 -40 0 -96 Q30 -40 0 0 Z" transform={`rotate(${i * 18}) translate(0 6)`} fill="#3A1426" stroke={c} strokeWidth={2.4} opacity={0.95} />
    ))}
    <ellipse cx={0} cy={4} rx={110} ry={14} fill="#1A0812" stroke={c} strokeWidth={2} />
  </g>
);

/** Vishnu: kirita crown, four arms (chakra spinning, shankha, gada, padma), blue body, yellow silk, the vanamala. */
export const Vishnu: React.FC<{ x: number; y: number; s?: number; o?: number; t?: number; glow?: number }> = ({ x, y, s = 1, o = 1, t = 0, glow = 0.4 }) => {
  const hy = -520;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
      <circle cx={0} cy={-420} r={300} fill="url(#rkHalo)" opacity={glow} />
      <Fig fill="url(#tpVishnu)" d={[
        'M-64 -262 Q-80 -130 -72 -12 L-20 -12 L-6 -160 L6 -160 L20 -12 L72 -12 Q80 -130 64 -262 Z',
        'M-84 -16 L-20 -16 L-18 0 L-90 0 Z', 'M20 -16 L84 -16 L90 0 L18 0 Z',
        TORSO, NECK,
        limb([[88, -428], [176, -500], [196, -600]], 38, 26), limb([[-88, -428], [-176, -500], [-196, -600]], 38, 26),
        limb([[80, -410], [130, -330], [150, -262]], 38, 26), limb([[-80, -410], [-130, -330], [-150, -262]], 38, 26),
      ]} />
      {/* pitambara: yellow silk */}
      <path d="M-66 -262 Q-82 -130 -74 -40 L74 -40 Q82 -130 66 -262 Z" fill="#C8961C" stroke={P.goldHi} strokeWidth={2.4} />
      {[-40, -10, 20, 48].map((xx) => <path key={xx} d={`M${xx} -250 Q${xx + 6} -150 ${xx - 4} -50`} fill="none" stroke="#7A5A0A" strokeWidth={2} />)}
      {/* kaustubha, vanamala */}
      <path d="M-74 -440 Q-40 -250 0 -230 Q40 -250 74 -440" fill="none" stroke="#7FD09A" strokeWidth={6} strokeDasharray="1 9" strokeLinecap="round" />
      <circle cx={0} cy={-392} r={9} fill={P.lacquerHi} stroke={P.goldHi} strokeWidth={2} />
      {/* chakra, spinning (upper right) */}
      <g transform={`translate(204 -630) rotate(${t * 4})`}>
        <circle r={44} fill="none" stroke={P.goldHi} strokeWidth={6} filter="url(#rkGlow)" />
        {Array.from({ length: 12 }, (_, i) => <path key={i} d="M0 -12 L0 -44" transform={`rotate(${i * 30})`} stroke={P.goldHi} strokeWidth={3} />)}
        <circle r={12} fill={P.goldHi} />
      </g>
      {/* shankha (upper left) */}
      <path d="M-200 -616 Q-238 -636 -226 -672 Q-200 -690 -174 -662 Q-166 -632 -200 -616 Z" fill="#F2F0E8" stroke={P.gold} strokeWidth={2.4} />
      <path d="M-214 -660 Q-200 -650 -190 -664" fill="none" stroke={P.goldDeep} strokeWidth={2} />
      {/* gada (lower left), lotus (lower right) */}
      <path d="M-150 -262 L-150 -60" stroke={P.goldHi} strokeWidth={9} /><ellipse cx={-150} cy={-48} rx={20} ry={26} fill="#B08A1C" stroke={P.goldHi} strokeWidth={2.4} />
      <Lotus x={152} y={-250} s={0.36} />
      {/* head and kirita */}
      <ellipse cx={0} cy={hy} rx={48} ry={58} fill="#163A86" stroke={P.gold} strokeWidth={4} />
      <path d={`M-46 ${hy - 40} L-38 ${hy - 96} L-28 ${hy - 140} L-14 ${hy - 176} L0 ${hy - 196} L14 ${hy - 176} L28 ${hy - 140} L38 ${hy - 96} L46 ${hy - 40} Q0 ${hy - 56} -46 ${hy - 40} Z`} fill="#B08A1C" stroke={P.goldHi} strokeWidth={3} />
      {[0, 1, 2].map((i) => <path key={i} d={`M${-44 + i * 9} ${hy - 60 - i * 42} L${44 - i * 9} ${hy - 60 - i * 42}`} stroke={P.goldHi} strokeWidth={2.4} />)}
      {[-22, 0, 22].map((xx) => <circle key={xx} cx={xx} cy={hy - 76} r={5} fill={P.lacquerHi} />)}
      <circle cx={0} cy={hy - 200} r={7} fill={P.goldHi} />
      {/* face: urdhva pundra, eyes, smile */}
      <path d={`M-12 ${hy - 36} L0 ${hy - 12} L12 ${hy - 36}`} fill="none" stroke={P.snow} strokeWidth={3} /><path d={`M0 ${hy - 32} L0 ${hy - 16}`} stroke={P.lacquerHi} strokeWidth={3} />
      <path d={`M-32 ${hy + 2} Q-19 ${hy + 9} -7 ${hy + 2} M7 ${hy + 2} Q19 ${hy + 9} 32 ${hy + 2}`} fill="none" stroke={P.goldHi} strokeWidth={3.4} strokeLinecap="round" />
      <path d={`M-14 ${hy + 32} Q0 ${hy + 40} 14 ${hy + 32}`} fill="none" stroke={P.goldHi} strokeWidth={2.6} strokeLinecap="round" />
      {[-1, 1].map((sd) => <path key={sd} d={`M${sd * 48} ${hy + 6} Q${sd * 62} ${hy + 30} ${sd * 50} ${hy + 44}`} fill="none" stroke={P.goldHi} strokeWidth={4} />)}
    </g>
  );
};

/** Narada: topknot, the veena (Mahati) across the shoulder, walking. */
export const Narada: React.FC<{ x: number; y: number; s?: number; o?: number; t?: number; flip?: boolean; talk?: number }> = ({ x, y, s = 1, o = 1, t = 0, flip = false, talk = 0 }) => {
  const step = Math.sin(t * 0.12) * 12;
  const hy = -500;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} opacity={o}>
      <Fig fill="#3A2A10" d={[
        limb([[-24, -250], [-36 + step, -120], [-46 + step * 1.4, -10]], 46, 30), limb([[24, -250], [36 - step, -120], [46 - step * 1.4, -10]], 46, 30),
        'M-58 -240 Q-70 -330 -88 -400 Q-96 -432 -70 -444 L70 -444 Q96 -432 88 -400 Q70 -330 58 -240 Z', NECK,
        limb([[84, -428], [120, -360], [70, -300]], 36, 24), limb([[-84, -428], [-110, -340], [-90, -262]], 36, 24),
      ]} />
      <path d="M-60 -250 Q0 -230 60 -250" fill="none" stroke={P.gold} strokeWidth={2} opacity={0.6} />
      <path d="M-44 -440 Q0 -350 44 -440" fill="none" stroke="#8C5A2A" strokeWidth={6} strokeDasharray="2 7" strokeLinecap="round" />
      {/* the veena: resting on the right shoulder, gourd below at the hip */}
      <g>
        <path d="M120 -660 L-70 -250" stroke={P.goldHi} strokeWidth={9} strokeLinecap="round" />
        <circle cx={-80} cy={-232} r={44} fill="#2A1A08" stroke={P.goldHi} strokeWidth={3} />
        <circle cx={108} cy={-634} r={24} fill="#2A1A08" stroke={P.goldHi} strokeWidth={3} />
        <path d="M120 -660 Q132 -690 118 -708" fill="none" stroke={P.goldHi} strokeWidth={5} strokeLinecap="round" />
        {[-4, 0, 4].map((dd) => <path key={dd} d={`M${116 + dd} -660 L${-66 + dd} -262`} stroke={P.snow} strokeWidth={0.9} opacity={0.75} />)}
        {talk > 0 ? Array.from({ length: 4 }, (_, i) => {
          const k = ((t * 0.9 + i * 40) % 160) / 160;
          return <path key={i} d={`M${140 + k * 160} ${-640 - k * 60} q8 -18 16 0`} fill="none" stroke={P.goldHi} strokeWidth={3} opacity={talk * (1 - k)} />;
        }) : null}
      </g>
      <ellipse cx={0} cy={hy} rx={46} ry={56} fill="#1B2C58" stroke={P.gold} strokeWidth={4} />
      <path d={`M-30 ${hy - 40} Q-36 ${hy - 70} -10 ${hy - 76} Q0 ${hy - 108} 10 ${hy - 76} Q36 ${hy - 70} 30 ${hy - 40} Q0 ${hy - 52} -30 ${hy - 40} Z`} fill="#0A1430" stroke={P.gold} strokeWidth={3.4} />
      <circle cx={0} cy={hy - 100} r={14} fill="#0A1430" stroke={P.gold} strokeWidth={3.4} />
      <path d={`M-28 ${hy + 2} Q-17 ${hy + 9} -6 ${hy + 2} M6 ${hy + 2} Q17 ${hy + 9} 28 ${hy + 2}`} fill="none" stroke={P.goldHi} strokeWidth={3.2} strokeLinecap="round" />
      <path d={`M-14 ${hy + 30} Q0 ${hy + 40 + talk * 6 * Math.abs(Math.sin(t * 0.5))} 14 ${hy + 30}`} fill="none" stroke={P.goldHi} strokeWidth={2.6} strokeLinecap="round" />
      <path d={`M-10 ${hy - 36} L0 ${hy - 14} L10 ${hy - 36}`} fill="none" stroke={P.snow} strokeWidth={2.6} />
      {/* beard */}
      <path d={`M-30 ${hy + 28} Q-20 ${hy + 86} 0 ${hy + 94} Q20 ${hy + 86} 30 ${hy + 28} Q0 ${hy + 46} -30 ${hy + 28} Z`} fill="#A8AEBE" opacity={0.85} />
    </g>
  );
};

/** The Mundi (Arihan): shaven head, soiled cloth, a cloth over the mouth, a wooden vessel, a broom sweeping at each step. */
export const Mundi: React.FC<{ x: number; y: number; s?: number; o?: number; t?: number; sweep?: number; flip?: boolean; cloth?: number; teach?: number }> = ({ x, y, s = 1, o = 1, t = 0, sweep = 1, flip = false, cloth = 1, teach = 0 }) => {
  const sw = Math.sin(t * 0.14) * 30 * sweep;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} opacity={o}>
      <path d="M-24 -170 L-40 0 L-12 0 L0 -150 Z M24 -170 L40 0 L12 0 L0 -150 Z" fill="#141008" stroke="#9A8A6A" strokeWidth={3} />
      <path d="M-60 -160 Q-70 -310 -76 -350 Q-30 -370 0 -370 Q30 -370 76 -350 Q70 -310 60 -160 Z" fill="#2A2418" stroke="#9A8A6A" strokeWidth={3} />
      {/* stains of the soiled cloth */}
      {[[-30, -250], [20, -210], [-10, -300], [36, -290]].map(([a, b], i) => <ellipse key={i} cx={a} cy={b} rx={12} ry={7} fill="#12100A" opacity={0.7} />)}
      {/* broom (right hand), sweeping the ground ahead */}
      <path d={`M60 -300 Q100 -200 ${110 + sw} -10`} fill="none" stroke="#9A8A6A" strokeWidth={6} />
      <path d={`M${80 + sw} -14 L${140 + sw} -14 L${150 + sw} 4 L${70 + sw} 4 Z`} fill="#5A4A2A" stroke="#C8B48A" strokeWidth={2} />
      {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M${78 + i * 10 + sw} -12 L${74 + i * 11 + sw} 4`} stroke="#C8B48A" strokeWidth={1.4} />)}
      {/* wooden vessel (left hand) */}
      <path d="M-60 -300 Q-110 -240 -104 -180" fill="none" stroke="#9A8A6A" strokeWidth={14} strokeLinecap="round" />
      <path d="M-130 -184 Q-130 -140 -104 -136 Q-78 -140 -78 -184 Z" fill="#5A3A1A" stroke="#C8B48A" strokeWidth={2} />
      {/* head: shaven */}
      <ellipse cx={0} cy={-420} rx={46} ry={54} fill="#3A3020" stroke="#C8B48A" strokeWidth={3} />
      <path d="M-28 -428 Q-18 -424 -8 -428 M8 -428 Q18 -424 28 -428" fill="none" stroke="#E8D8B0" strokeWidth={3} strokeLinecap="round" />
      {/* cloth over the mouth */}
      {cloth > 0 ? <path d="M-40 -408 L40 -408 L36 -372 Q0 -362 -36 -372 Z" fill="#D8D0BC" opacity={cloth} stroke="#9A8A6A" strokeWidth={1.4} /> : <path d="M-12 -392 Q0 -386 12 -392" fill="none" stroke="#E8D8B0" strokeWidth={2.4} />}
      {/* teaching: words that rise as honey-gold drips */}
      {teach > 0 ? Array.from({ length: 6 }, (_, i) => {
        const k = ((t * 0.8 + i * 30) % 180) / 180;
        return <circle key={i} cx={60 + k * 180} cy={-420 - k * 80 + Math.sin(k * 6 + i) * 20} r={6 * (1 - k) + 2} fill="#E8B030" opacity={teach * (1 - k)} />;
      }) : null}
    </g>
  );
};

// ---------------------------------------------------------------- the chariot of the gods
/** A wheel: the Sun (12 spokes, gold) or the Moon (16 spokes, silver), rotating by rot degrees. */
export const Wheel: React.FC<{ x: number; y: number; r: number; k: 'sun' | 'moon'; rot?: number; o?: number }> = ({ x, y, r, k, rot = 0, o = 1 }) => {
  const n = k === 'sun' ? 12 : 16, c = k === 'sun' ? P.goldHi : '#E6ECFA';
  return (
    <g transform={`translate(${x} ${y})`} opacity={o}>
      <circle r={r * 1.35} fill={k === 'sun' ? 'url(#rkSun)' : 'url(#rkHalo)'} opacity={k === 'sun' ? 0.55 : 0.3} />
      <g transform={`rotate(${rot})`}>
        <circle r={r} fill="none" stroke={c} strokeWidth={r * 0.09} filter="url(#rkGlow)" />
        <circle r={r * 0.82} fill="none" stroke={c} strokeWidth={2} opacity={0.6} />
        {Array.from({ length: n }, (_, i) => <path key={i} d={`M0 ${-r * 0.2} L0 ${-r * 0.86}`} transform={`rotate(${(i * 360) / n})`} stroke={c} strokeWidth={r * 0.035} />)}
        <circle r={r * 0.2} fill={k === 'sun' ? '#3A2A08' : '#1A2234'} stroke={c} strokeWidth={3} />
        {k === 'moon' ? <path d={`M${-r * 0.08} ${-r * 0.14} A${r * 0.14} ${r * 0.14} 0 1 0 ${r * 0.14} ${r * 0.04} A${r * 0.1} ${r * 0.1} 0 1 1 ${-r * 0.08} ${-r * 0.14} Z`} fill={c} /> : <circle r={r * 0.09} fill={c} />}
      </g>
    </g>
  );
};
/** A horse in profile facing right (one of the four Vedas), feet at (x, y); gallop 0..1 swings the legs; fall 0..1 drops it onto its head. */
export const Horse: React.FC<{ x: number; y: number; s?: number; t?: number; gallop?: number; fall?: number; o?: number; label?: string }> = ({ x, y, s = 1, t = 0, gallop = 0, fall = 0, o = 1, label }) => {
  const g = Math.sin(t * 0.4) * 22 * gallop;
  return (
    <g transform={`translate(${x} ${y}) rotate(${fall * 38} 120 -20) translate(0 ${fall * 40}) scale(${s})`} opacity={o}>
      {/* legs */}
      {[[-80, g], [-50, -g], [70, -g], [100, g]].map(([lx, a], i) => (
        <path key={i} d={`M${lx} -130 L${lx + a * 0.6} -60 L${lx + a} ${fall > 0.5 && i > 1 ? -30 : 0}`} fill="none" stroke={P.goldHi} strokeWidth={9} strokeLinecap="round" />
      ))}
      {/* body */}
      <path d="M-110 -140 Q-120 -200 -60 -206 L80 -210 Q140 -214 150 -170 Q150 -130 110 -122 L-80 -118 Q-112 -120 -110 -140 Z" fill="#F2EEE2" stroke={P.gold} strokeWidth={3} />
      {/* neck and head */}
      <path d="M100 -200 Q130 -270 160 -300 L210 -280 Q216 -262 196 -256 L170 -262 Q160 -220 146 -176 Z" fill="#F2EEE2" stroke={P.gold} strokeWidth={3} />
      <path d="M150 -300 L162 -326 L170 -298" fill="#F2EEE2" stroke={P.gold} strokeWidth={2} />
      <circle cx={180} cy={-282} r={3.5} fill="#1A1408" />
      {/* mane and tail */}
      <path d="M150 -296 Q120 -260 104 -206" fill="none" stroke={P.gold} strokeWidth={8} strokeLinecap="round" />
      <path d={`M-110 -170 Q-150 ${-150 + g * 0.4} -150 -90`} fill="none" stroke={P.gold} strokeWidth={8} strokeLinecap="round" />
      {/* plume and harness */}
      <path d="M160 -320 Q150 -360 172 -380" fill="none" stroke={P.lacquerHi} strokeWidth={6} strokeLinecap="round" />
      <path d="M100 -200 L-60 -190" stroke={P.lacquerHi} strokeWidth={4} />
      {label ? <text x={10} y={-150} textAnchor="middle" fontFamily="'Tiro Devanagari Sanskrit', serif" fontSize={28} fill="#7E5A10">{label}</text> : null}
    </g>
  );
};
/** The chariot body with its two wheels (Sun right, Moon left), a canopy (the sky), banners; (x, y) is the ground under the axle. */
export const Chariot: React.FC<{ x: number; y: number; s?: number; t: number; rot?: number; o?: number; sink?: number; brahma?: boolean; shiva?: React.ReactNode }> = ({ x, y, s = 1, t, rot = 0, o = 1, sink = 0, brahma = true, shiva }) => (
  <g transform={`translate(${x} ${y + sink * 40}) scale(${s}) rotate(${sink * -6})`} opacity={o}>
    {/* the canopy: the sky with stars */}
    <path d="M-260 -560 Q0 -700 260 -560 L240 -540 Q0 -660 -240 -540 Z" fill="#0A1840" stroke={P.gold} strokeWidth={3} />
    {Array.from({ length: 10 }, (_, i) => <circle key={i} cx={-200 + i * 44} cy={-575 - Math.sin((i / 9) * Math.PI) * 50} r={3} fill={P.star} opacity={0.6 + 0.4 * Math.sin(t * 0.1 + i)} />)}
    <path d="M-230 -548 L-230 -250 M230 -548 L230 -250" stroke={P.gold} strokeWidth={6} />
    {/* banners: svarga and moksha */}
    <path d={`M0 -660 L0 -760 L${70 + Math.sin(t * 0.1) * 10} -740 L0 -720`} fill={P.lacquerHi} stroke={P.gold} strokeWidth={2} />
    {/* body */}
    <path d="M-280 -250 L280 -250 L300 -160 L-300 -160 Z" fill="#2A1A06" stroke={P.goldHi} strokeWidth={3} />
    {Array.from({ length: 8 }, (_, i) => <circle key={i} cx={-245 + i * 70} cy={-205} r={12} fill="none" stroke={P.gold} strokeWidth={2} />)}
    {/* the pole (isha) to the horses */}
    <path d="M300 -190 L640 -230" stroke={P.goldHi} strokeWidth={8} />
    {brahma ? <Brahma x={190} y={-250} s={0.4} t={t} /> : null}
    {shiva}
    <Wheel x={-200} y={-140} r={140} k="moon" rot={-rot} />
    <Wheel x={200} y={-140} r={140} k="sun" rot={rot} />
  </g>
);

/** The bull (vrishabha), facing right, feet at (x, y); strain 0..1 lowers the head and digs in; kneel 0..1 drops the forelegs. */
export const Bull: React.FC<{ x: number; y: number; s?: number; o?: number; t?: number; strain?: number; kneel?: number; fill?: string; rim?: string }> = ({ x, y, s = 1, o = 1, t = 0, strain = 0, kneel = 0, fill = '#ECE6D6', rim = P.gold }) => {
  const k = kneel;
  const fl = (lx: number) => k > 0 ? limb([[lx, -110], [lx + 20 + 10 * k, lerp(-56, -40, k)], [lx - 40 * k + 6, lerp(-6, -34, k)]], 34, 20) : limb([[lx, -110], [lx - 10 * strain, -56], [lx - 30 * strain, -6]], 34, 20);
  const hl = (lx: number) => limb([[lx, -120], [lx - 16 - 20 * strain, -60], [lx - 30 * strain, -6]], 40, 20);
  return (
    <g transform={`translate(${x} ${y + k * 30}) scale(${s}) rotate(${k * 8})`} opacity={o}>
      <Fig fill={fill} rim={rim} w={5} d={[
        hl(-150), hl(-110), fl(110), fl(150),
        'M-196 -160 Q-206 -104 -170 -96 L130 -90 Q186 -100 196 -150 Q206 -204 170 -238 Q146 -284 100 -270 Q60 -232 -60 -226 Q-160 -224 -196 -160 Z',
        `M150 -220 Q200 ${-226 + strain * 30} 236 ${-190 + strain * 40} L264 ${-132 + strain * 50} Q264 ${-112 + strain * 50} 242 ${-112 + strain * 50} L196 ${-130 + strain * 40} Q166 -140 156 -170 Z`,
        'M150 -110 Q168 -60 140 -52 Q120 -70 120 -110 Z',
      ]} />
      {/* horns, eye, nose-ring, bell */}
      <path d={`M206 ${-212 + strain * 34} Q194 ${-262 + strain * 34} 214 ${-286 + strain * 34} M232 ${-206 + strain * 36} Q252 ${-252 + strain * 36} 276 ${-260 + strain * 36}`} fill="none" stroke={P.goldHi} strokeWidth={9} strokeLinecap="round" />
      <circle cx={232} cy={-176 + strain * 40} r={5} fill="#1A1408" />
      <circle cx={258} cy={-122 + strain * 50} r={7} fill="none" stroke={P.goldHi} strokeWidth={2.4} />
      <path d="M160 -172 Q180 -150 172 -126" fill="none" stroke={P.lacquerHi} strokeWidth={7} strokeLinecap="round" />
      <circle cx={172} cy={-116} r={9} fill={P.goldHi} />
      {/* tail */}
      <path d={`M-196 -170 Q-232 -130 ${-226 + Math.sin(t * 0.1) * 8} -50`} fill="none" stroke={rim} strokeWidth={6} strokeLinecap="round" />
      {/* hump shading */}
      <path d="M100 -262 Q80 -238 60 -232" fill="none" stroke={rim} strokeWidth={2} opacity={0.5} />
    </g>
  );
};

/** Ganesha, small, seated, elephant head turned left (on Shiva's thumb). */
export const Ganesha: React.FC<{ x: number; y: number; s?: number; o?: number; t?: number }> = ({ x, y, s = 1, o = 1, t = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <circle cx={0} cy={-150} r={170} fill="url(#rkHalo)" opacity={0.6} />
    <path d="M-90 0 Q-100 -70 -60 -100 Q0 -130 60 -100 Q100 -70 90 0 Z" fill="#B8323A" stroke={P.goldHi} strokeWidth={3} />
    <ellipse cx={0} cy={-110} rx={60} ry={50} fill="#E89A3A" stroke={P.goldHi} strokeWidth={3} />
    {/* ears */}
    <path d="M-50 -200 Q-120 -220 -110 -150 Q-90 -120 -46 -150 Z M50 -200 Q120 -220 110 -150 Q90 -120 46 -150 Z" fill="#E89A3A" stroke={P.goldHi} strokeWidth={3} />
    {/* head and trunk */}
    <ellipse cx={0} cy={-190} rx={54} ry={56} fill="#E89A3A" stroke={P.goldHi} strokeWidth={3} />
    <path d={`M-6 -170 Q-20 -110 ${-40 + Math.sin(t * 0.1) * 8} -96 Q${-60 + Math.sin(t * 0.1) * 8} -94 ${-56 + Math.sin(t * 0.1) * 8} -110`} fill="none" stroke="#E89A3A" strokeWidth={22} strokeLinecap="round" />
    <path d="M16 -160 L28 -138" stroke="#F2EEE2" strokeWidth={8} strokeLinecap="round" />
    <path d="M-22 -200 Q-14 -196 -6 -200 M6 -200 Q14 -196 22 -200" fill="none" stroke="#1A1408" strokeWidth={3} strokeLinecap="round" />
    <path d="M-40 -238 L-30 -290 L0 -270 L30 -290 L40 -238 Z" fill={P.gold} stroke={P.goldHi} strokeWidth={2} />
    {/* modaka */}
    <circle cx={70} cy={-90} r={14} fill="#F4D77A" />
  </g>
);

/** A Shiva-linga on its pedestal, a lamp beside it; (x, y) is the base. */
export const Linga: React.FC<{ x: number; y: number; s?: number; o?: number; lit?: number; t?: number; broken?: number }> = ({ x, y, s = 1, o = 1, lit = 1, t = 0, broken = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${broken * 80})`} opacity={o}>
    <path d="M-90 0 L90 0 L80 -30 L-80 -30 Z" fill="#1A1A22" stroke={P.gold} strokeWidth={2.4} />
    <path d="M-110 -30 L110 -30 Q130 -44 110 -56 L-110 -56 Q-130 -44 -110 -30 Z M110 -44 L170 -40 L110 -36" fill="#22222C" stroke={P.gold} strokeWidth={2.4} />
    <path d="M-44 -56 L-44 -150 Q0 -200 44 -150 L44 -56 Z" fill="#14141C" stroke={P.gold} strokeWidth={2.4} />
    {[0, 1, 2].map((i) => <path key={i} d={`M-36 ${-120 + i * 9} L36 ${-120 + i * 9}`} stroke={P.snow} strokeWidth={2} opacity={0.7} />)}
    <circle cx={0} cy={-104} r={5} fill={P.lacquerHi} />
    {lit > 0 ? <g><Flame x={-150} y={-10} h={46} t={t} seed={3} o={lit} /><path d="M-170 -6 L-130 -6 L-140 4 L-160 4 Z" fill={P.goldDeep} /></g> : null}
  </g>
);

/** The balance (tula): beam tilts by tilt (-1 left heavy .. 1 right heavy), sway adds a breeze. */
export const Tula: React.FC<{ x: number; y: number; s?: number; o?: number; tilt?: number; left?: React.ReactNode; right?: React.ReactNode }> = ({ x, y, s = 1, o = 1, tilt = 0, left, right }) => {
  const a = tilt * 16;
  const dy = Math.sin((a * Math.PI) / 180) * 360;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
      <path d="M0 0 L0 -520" stroke={P.goldHi} strokeWidth={10} />
      <path d="M-120 0 L120 0" stroke={P.goldHi} strokeWidth={10} strokeLinecap="round" />
      <g transform={`translate(0 -520) rotate(${a})`}>
        <path d="M-360 0 L360 0" stroke={P.goldHi} strokeWidth={10} strokeLinecap="round" />
        {/* the needle */}
        <path d="M0 0 L0 -120" stroke={P.lacquerHi} strokeWidth={6} strokeLinecap="round" />
        <circle r={14} fill={P.gold} />
      </g>
      {[-1, 1].map((sd) => {
        const px = sd * 360 * Math.cos((a * Math.PI) / 180), py = -520 + sd * dy;
        return (
          <g key={sd} transform={`translate(${px} ${py})`}>
            <path d="M0 0 L-110 220 M0 0 L110 220" stroke={P.gold} strokeWidth={2.4} />
            <path d="M-130 220 Q0 280 130 220 Z" fill="#2A1A06" stroke={P.goldHi} strokeWidth={3} />
            <g transform="translate(0 220)">{sd < 0 ? left : right}</g>
          </g>
        );
      })}
    </g>
  );
};

/** A human outline holding three nested bodies (gross, subtle, causal: iron, silver, gold), a witness light at the heart. */
const PERSON = 'M-30 -380 Q-90 -372 -100 -320 L-112 -196 L-86 -192 L-70 -300 L-62 -176 L-52 0 L-14 0 L0 -150 L14 0 L52 0 L62 -176 L70 -300 L86 -192 L112 -196 L100 -320 Q90 -372 30 -380 L22 -396 A46 46 0 1 0 -22 -396 Z';
export const ThreeBodies: React.FC<{ x: number; y: number; s?: number; o?: number; t?: number; lit?: [number, number, number]; witness?: number; burn?: number }> = ({ x, y, s = 1, o = 1, t = 0, lit = [1, 1, 1], witness = 0, burn = 0 }) => {
  const cols = [METAL.iron.line, METAL.silver.line, METAL.gold.line];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
      {[1.0, 0.74, 0.5].map((k, i) => (
        <path key={i} d={PERSON} transform={`translate(0 ${-250 * (1 - k)}) scale(${k})`} fill={i === 0 ? '#060C1E' : 'none'} stroke={burn > 0 ? '#FF9A3A' : cols[i]} strokeWidth={4 / k} opacity={lit[i]} filter="url(#rkGlow)" />
      ))}
      {witness > 0 ? <g><circle cx={0} cy={-280} r={90 * witness} fill="url(#rkHalo)" /><circle cx={0} cy={-280} r={9} fill={P.goldHi} opacity={witness} /></g> : null}
    </g>
  );
};

/** Rain-clouds (Pushkara and Avarta): dark banks with rain streaks. */
export const Clouds: React.FC<{ t: number; y?: number; o?: number; rain?: number }> = ({ t, y = 160, o = 1, rain = 1 }) => (
  <g opacity={o}>
    {Array.from({ length: 9 }, (_, i) => {
      const cx = ((i * 260 + t * 0.6) % 2300) - 190;
      return (
        <g key={i}>
          <ellipse cx={cx} cy={y + (i % 3) * 30} rx={220} ry={70} fill="#0B1430" stroke={P.rim} strokeWidth={2} />
          <ellipse cx={cx + 90} cy={y - 30 + (i % 2) * 20} rx={140} ry={60} fill="#0D1838" />
        </g>
      );
    })}
    {rain > 0 ? Array.from({ length: 120 }, (_, i) => {
      const x = rnd(11, i) * 1920, y0 = y + 60 + ((rnd(12, i) * 900 + t * 14) % 900);
      return <path key={i} d={`M${x} ${y0} l-6 26`} stroke="#8EA8D8" strokeWidth={1.6} opacity={0.35 * rain} />;
    }) : null}
  </g>
);

/** Moon in Pushya: the moon beside the three-star arrow of Pushya. */
export const MoonPushya: React.FC<{ x: number; y: number; o?: number; t?: number }> = ({ x, y, o = 1, t = 0 }) => (
  <g opacity={o} transform={`translate(${x} ${y})`}>
    <circle r={60} fill={P.star} opacity={0.9} filter="url(#rkGlow)" />
    <circle cx={22} cy={-10} r={56} fill={P.abyss} opacity={0.75} />
    {[[140, -40], [180, 10], [220, -20]].map(([a, b], i) => <circle key={i} cx={a} cy={b} r={6} fill={P.star} opacity={0.7 + 0.3 * Math.sin(t * 0.1 + i)} filter="url(#rkGlow)" />)}
    <path d="M140 -40 L180 10 L220 -20" fill="none" stroke={P.star} strokeWidth={1} opacity={0.5} />
  </g>
);
