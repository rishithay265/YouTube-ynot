import React from 'react';
import { P, clamp, ease, rnd } from '../raktabija/world';

// Drawn-in-code pieces for "The Kubera Code": the yantra grid, the Lo Shu shell, the cosmic cow, temples, lamps,
// lotus, mountains, compass. Gold line art on deep indigo, like the Gita Shorts.

export const EN = "'Cormorant Garamond', serif";
export const KUBERA = [27, 20, 25, 22, 24, 26, 23, 28, 21];
export const LOSHU_FLIP = [8, 1, 6, 3, 5, 7, 4, 9, 2];
export const LINES: number[][] = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
const DEVA_DIGIT = '०१२३४५६७८९';
export const deva = (n: number) => String(n).split('').map((d) => DEVA_DIGIT[+d]).join('');

/** A 3×3 grid. `nums` per cell (string or number), `shown` 0..1 per cell, `lit` line indices with strength, `hi` cell glow. */
export const Grid: React.FC<{
  x: number; y: number; c: number; nums: (string | number)[]; shown?: number[]; draw?: number; lit?: { i: number; o: number }[];
  hi?: number[]; color?: string; text?: string; fs?: number; rice?: boolean; o?: number; sub?: (string | null)[];
}> = ({ x, y, c, nums, shown, draw = 1, lit = [], hi = [], color = P.gold, text = P.goldHi, fs, rice = false, o = 1, sub }) => {
  const x0 = x - 1.5 * c, y0 = y - 1.5 * c, L = 3 * c;
  const stroke = rice ? '#EFE7D2' : color;
  const seg = (k: number) => clamp(draw * 8 - k);
  const lines = [
    [x0, y0, x0 + L, y0], [x0, y0 + L, x0 + L, y0 + L], [x0, y0, x0, y0 + L], [x0 + L, y0, x0 + L, y0 + L],
    [x0 + c, y0, x0 + c, y0 + L], [x0 + 2 * c, y0, x0 + 2 * c, y0 + L], [x0, y0 + c, x0 + L, y0 + c], [x0, y0 + 2 * c, x0 + L, y0 + 2 * c],
  ];
  const ctr = (i: number) => [x0 + (i % 3 + 0.5) * c, y0 + (Math.floor(i / 3) + 0.5) * c];
  return (
    <g opacity={o}>
      {hi.map((v, i) => v > 0 ? <rect key={'h' + i} x={x0 + (i % 3) * c + 4} y={y0 + Math.floor(i / 3) * c + 4} width={c - 8} height={c - 8} fill={P.gold} opacity={0.22 * v} rx={6} /> : null)}
      <g filter={rice ? undefined : 'url(#kLineGlow)'}>{lines.map(([a, b, cc, d], k) => {
        const p = seg(k); return p > 0 ? <line key={k} x1={a} y1={b} x2={a + (cc - a) * p} y2={b + (d - b) * p} stroke={stroke} strokeWidth={rice ? 7 : 4} strokeLinecap="round" opacity={rice ? 0.92 : 0.9} /> : null;
      })}</g>
      {rice && [0, 1, 2, 3].flatMap((i) => [0, 1, 2, 3].map((j) => <circle key={`d${i}${j}`} cx={x0 + i * c} cy={y0 + j * c} r={7} fill="#F6EFDD" opacity={clamp(draw * 2)} />))}
      <g filter="url(#kLineGlow)">{lit.map(({ i, o: lo }) => {
        const [a, b] = ctr(LINES[i][0]), [cx2, cy2] = ctr(LINES[i][2]);
        const ex = (cx2 - a) * 0.18, ey = (cy2 - b) * 0.18;
        return <line key={'l' + i} x1={a - ex} y1={b - ey} x2={cx2 + ex} y2={cy2 + ey} stroke={P.ember} strokeWidth={10} strokeLinecap="round" opacity={0.75 * lo} />;
      })}</g>
      {nums.map((n, i) => {
        const [cx, cy] = ctr(i); const s = shown ? shown[i] ?? 1 : 1;
        return s > 0 ? (
          <g key={'n' + i} opacity={s} transform={`translate(${cx} ${cy + (1 - ease(s)) * 14})`}>
            <text y={(fs ?? c * 0.42) * 0.36} textAnchor="middle" fontFamily={EN} fontWeight={700} fontSize={fs ?? c * 0.42} fill={rice ? '#FBF5E6' : text}>{n}</text>
            {sub && sub[i] ? <text y={c * 0.38} textAnchor="middle" fontFamily={EN} fontStyle="italic" fontSize={c * 0.13} fill={P.snow}>{sub[i]}</text> : null}
          </g>
        ) : null;
      })}
    </g>
  );
};

/** Background: indigo sky, stars, slow motes. */
export const Sky: React.FC<{ t: number; warm?: number }> = ({ t, warm = 0 }) => (
  <g>
    <rect width={1920} height={1080} fill="url(#kSky)" />
    <rect width={1920} height={1080} fill="url(#kWarm)" opacity={warm} />
    {Array.from({ length: 150 }, (_, i) => {
      const x = rnd(4, i) * 1920, y = rnd(7, i) * 1080, tw = 0.5 + 0.5 * Math.sin(t * (0.6 + rnd(9, i)) + i);
      return <circle key={i} cx={x} cy={y} r={0.6 + rnd(2, i) * 1.6} fill={P.star} opacity={(0.25 + 0.6 * tw) * (1 - warm * 0.7)} />;
    })}
  </g>
);

export const KDefs: React.FC = () => (
  <defs>
    <linearGradient id="kSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#020717" /><stop offset="0.6" stopColor="#081638" /><stop offset="1" stopColor="#1A2350" /></linearGradient>
    <radialGradient id="kWarm" cx="50%" cy="90%" r="80%"><stop offset="0" stopColor="#C77B2E" stopOpacity={0.75} /><stop offset="0.5" stopColor="#6B3A2A" stopOpacity={0.4} /><stop offset="1" stopColor="#1A1430" stopOpacity={0} /></radialGradient>
    <radialGradient id="kGlowGold" cx="50%" cy="50%" r="50%"><stop offset="0" stopColor={P.goldHi} stopOpacity={0.9} /><stop offset="0.35" stopColor={P.gold} stopOpacity={0.35} /><stop offset="1" stopColor={P.gold} stopOpacity={0} /></radialGradient>
    <radialGradient id="kLamp" cx="50%" cy="50%" r="50%"><stop offset="0" stopColor="#FFE3A0" stopOpacity={0.95} /><stop offset="0.3" stopColor="#F0A040" stopOpacity={0.45} /><stop offset="1" stopColor="#F0A040" stopOpacity={0} /></radialGradient>
    <linearGradient id="kFloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3B2A22" /><stop offset="1" stopColor="#1A120E" /></linearGradient>
    <linearGradient id="kCopper" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#E59A62" /><stop offset="0.5" stopColor="#B8673A" /><stop offset="1" stopColor="#6E3518" /></linearGradient>
    <filter id="kLineGlow" filterUnits="userSpaceOnUse" x="0" y="0" width="1920" height="1080"><feGaussianBlur stdDeviation="5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
    <filter id="kSoft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" /></filter>
  </defs>
);

/** Text block helper. */
export const T: React.FC<{ x: number; y: number; s: number; children: React.ReactNode; c?: string; o?: number; a?: 'start' | 'middle' | 'end'; i?: boolean; w?: number; f?: string; ls?: number }> =
  ({ x, y, s, children, c = P.goldHi, o = 1, a = 'middle', i = false, w = 600, f = EN, ls = 0 }) => (
    <text x={x} y={y} fontSize={s} fill={c} opacity={o} textAnchor={a} fontStyle={i ? 'italic' : 'normal'} fontWeight={w} fontFamily={f} letterSpacing={ls}
      stroke="#020611" strokeWidth={s * 0.08} paintOrder="stroke">{children}</text>
  );

/** The cosmic cow (Virāj) in gold line, with a calf. */
export const Cow: React.FC<{ x: number; y: number; s?: number; o?: number; calf?: number; glow?: number }> = ({ x, y, s = 1, o = 1, calf = 1, glow = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o} fill="none" stroke={P.gold} strokeWidth={4} strokeLinejoin="round" strokeLinecap="round" filter="url(#rkGlow)">
    <path d="M-220 -40 Q-180 -110 -60 -105 Q80 -100 170 -95 Q215 -92 230 -60 L262 -88 Q276 -96 286 -84 L300 -40 Q306 -20 288 -6 L262 2 Q246 8 236 0 Q226 40 214 90 L204 180 M180 92 L176 180 M-150 70 L-160 180 M-110 74 L-104 180 M-220 -40 Q-246 0 -232 60 Q-220 80 -196 70 Q-120 60 -60 70 Q80 84 214 90" />
    <path d="M262 -88 Q258 -122 236 -134 M286 -84 Q300 -118 324 -126" />
    <circle cx={272} cy={-52} r={4} fill={P.gold} />
    <path d="M-232 0 Q-262 30 -270 90" />
    {calf > 0 && (
      <g opacity={calf} transform="translate(40 120) scale(0.5)" stroke={glow > 0 ? P.goldHi : P.gold} strokeWidth={6}>
        <path d="M-150 -20 Q-110 -70 0 -66 Q90 -62 130 -40 L156 -62 L170 -20 Q172 -2 150 6 Q140 40 130 110 M104 50 L100 110 M-100 40 L-108 110 M-60 44 L-56 110 M-150 -20 Q-168 20 -150 40 Q-80 30 130 50" />
        {glow > 0 && <circle cx={0} cy={0} r={190} fill="url(#kGlowGold)" stroke="none" opacity={glow * 0.6} />}
      </g>
    )}
  </g>
);

/** A small shrine / temple silhouette with a doorway. */
export const Temple: React.FC<{ x: number; y: number; s?: number; o?: number; door?: number }> = ({ x, y, s = 1, o = 1, door = 0.3 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <path d="M-260 0 L-260 -260 L-200 -260 L-150 -420 L-90 -500 L0 -620 L90 -500 L150 -420 L200 -260 L260 -260 L260 0 Z" fill="#0A1430" stroke={P.goldDim} strokeWidth={4} />
    <path d="M-150 -420 L150 -420 M-200 -260 L200 -260 M-90 -500 L90 -500" stroke={P.goldDim} strokeWidth={3} />
    <path d="M0 -620 L0 -680 M-14 -680 L14 -680" stroke={P.gold} strokeWidth={5} />
    <path d="M-70 0 L-70 -170 Q0 -240 70 -170 L70 0 Z" fill="#000" opacity={0.85} />
    <path d="M-70 0 L-70 -170 Q0 -240 70 -170 L70 0 Z" fill="url(#kLamp)" opacity={door} />
  </g>
);

/** An oil lamp (diya) with a flickering flame. */
export const Lamp: React.FC<{ x: number; y: number; s?: number; lit?: number; t: number }> = ({ x, y, s = 1, lit = 1, t }) => {
  const f = 1 + 0.08 * Math.sin(t * 13) + 0.05 * Math.sin(t * 7.3);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {lit > 0 && <circle cx={0} cy={-46} r={150 * lit * f} fill="url(#kLamp)" opacity={0.85 * lit} />}
      <path d="M-60 0 Q-50 30 0 34 Q50 30 60 0 Q30 -8 0 -8 Q-30 -8 -60 0 Z" fill="url(#kCopper)" stroke={P.goldDeep} strokeWidth={2} />
      <path d="M44 -4 Q66 -12 76 -24" stroke={P.goldDeep} strokeWidth={6} fill="none" strokeLinecap="round" />
      {lit > 0 && <path d={`M0 -10 Q-${14 * f} -36 0 -${70 * f * lit} Q${14 * f} -36 0 -10 Z`} fill="#FFD27A" opacity={lit} />}
      {lit > 0 && <path d={`M0 -12 Q-6 -28 0 -${42 * f * lit} Q6 -28 0 -12 Z`} fill="#FFF6DA" opacity={lit} />}
    </g>
  );
};

/** A lotus in gold line, optionally glowing (Lakṣmī is shown only as light). */
export const Lotus: React.FC<{ x: number; y: number; s?: number; o?: number; glow?: number; open?: number }> = ({ x, y, s = 1, o = 1, glow = 0, open = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    {glow > 0 && <circle cx={0} cy={-60} r={260} fill="url(#kGlowGold)" opacity={glow} />}
    {[-3, -2, -1, 0, 1, 2, 3].map((k) => (
      <path key={k} transform={`rotate(${k * 22 * open})`} d="M0 0 Q-38 -70 0 -150 Q38 -70 0 0 Z" fill={P.navy2} fillOpacity={0.6} stroke={P.gold} strokeWidth={3.5} filter="url(#rkGlow)" />
    ))}
    <path d="M-120 10 Q0 50 120 10" stroke={P.gold} strokeWidth={3} fill="none" />
  </g>
);

/** Mountain range (Kailāsa when `peak`). */
export const Mountains: React.FC<{ y?: number; o?: number; peak?: boolean }> = ({ y = 760, o = 1, peak = false }) => (
  <g opacity={o}>
    <path d={`M0 ${y} L220 ${y - 160} L380 ${y - 60} L560 ${y - 230} L760 ${y - 80} L960 ${y - (peak ? 420 : 200)} L1160 ${y - 90} L1360 ${y - 240} L1560 ${y - 70} L1740 ${y - 190} L1920 ${y - 40} L1920 1080 L0 1080 Z`} fill="#081333" stroke={P.goldDim} strokeWidth={3} />
    {peak && <path d={`M960 ${y - 420} L900 ${y - 330} L930 ${y - 340} L960 ${y - 300} L990 ${y - 340} L1020 ${y - 330} Z`} fill="#DCE3F2" opacity={0.85} />}
  </g>
);

/** A seated figure (ascetic / guardian) silhouette with a gold rim. */
export const Seated: React.FC<{ x: number; y: number; s?: number; o?: number; crown?: boolean; belly?: boolean }> = ({ x, y, s = 1, o = 1, crown = false, belly = false }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o} fill="#081230" stroke={P.gold} strokeWidth={4} filter="url(#rkGlow)">
    <path d={`M-150 0 Q-150 -40 -90 -60 Q${belly ? -110 : -70} -150 -60 -200 Q-70 -250 -40 -270 L40 -270 Q70 -250 60 -200 Q${belly ? 110 : 70} -150 90 -60 Q150 -40 150 0 Z`} />
    <circle cx={0} cy={-320} r={48} />
    {crown && <path d="M-44 -352 L-30 -400 L-12 -362 L0 -414 L12 -362 L30 -400 L44 -352 Z" fill={P.goldDeep} />}
  </g>
);

/** Vedic text card: a framed panel with a label. */
export const Card: React.FC<{ x: number; y: number; w: number; h: number; o?: number; children?: React.ReactNode }> = ({ x, y, w, h, o = 1, children }) => (
  <g opacity={o}>
    <rect x={x} y={y} width={w} height={h} rx={14} fill="#06102A" fillOpacity={0.88} stroke={P.gold} strokeWidth={2.5} />
    <rect x={x + 10} y={y + 10} width={w - 20} height={h - 20} rx={10} fill="none" stroke={P.goldDim} strokeWidth={1.5} />
    {children}
  </g>
);

/** Compass rose with N/E/S/W labels; `rot` in degrees. */
export const Compass: React.FC<{ x: number; y: number; r: number; o?: number }> = ({ x, y, r, o = 1 }) => (
  <g opacity={o}>
    <circle cx={x} cy={y} r={r} fill="none" stroke={P.goldDim} strokeWidth={2} strokeDasharray="4 10" />
    {[['N', 0, -1], ['E', 1, 0], ['S', 0, 1], ['W', -1, 0]].map(([l, dx, dy]) => (
      <text key={l as string} x={x + (dx as number) * (r + 40)} y={y + (dy as number) * (r + 40) + 16} textAnchor="middle" fontFamily={EN} fontWeight={700} fontSize={46} fill={l === 'N' ? P.goldHi : P.snow}>{l}</text>
    ))}
  </g>
);

/** A turtle-shell outline (for the Lo Shu legend). */
export const Shell: React.FC<{ x: number; y: number; s?: number; o?: number }> = ({ x, y, s = 1, o = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o} fill="none" stroke={P.gold} strokeWidth={4} filter="url(#rkGlow)">
    <ellipse cx={0} cy={0} rx={300} ry={250} fill="#0B1A40" fillOpacity={0.6} />
    <path d="M0 -330 Q-40 -300 -40 -250 M0 -330 Q40 -300 40 -250 M-300 -60 L-380 -120 M300 -60 L380 -120 M-280 120 L-360 190 M280 120 L360 190 M0 250 L0 300" strokeWidth={12} />
    <path d="M-150 -200 L150 -200 L240 0 L150 200 L-150 200 L-240 0 Z" strokeOpacity={0.6} />
  </g>
);
