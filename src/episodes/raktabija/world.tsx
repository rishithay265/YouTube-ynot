import React from 'react';
import { loadFont as loadTiroHindi } from '@remotion/google-fonts/TiroDevanagariHindi';
import { loadFont as loadTiroSanskrit } from '@remotion/google-fonts/TiroDevanagariSanskrit';
import { loadFont as loadCormorant } from '@remotion/google-fonts/CormorantGaramond';
import { loadFont as loadMarcellus } from '@remotion/google-fonts/Marcellus';
import { STUDIO } from '../../studio.config';

// The world of "मैं रक्तबीज नहीं था": gold line-art and silhouettes on deep navy, lit like temple bronze at dusk.
// Every shape is drawn here in code. Palette sampled from the TheGodmanFiles brand assets.

loadTiroHindi('normal', { subsets: ['devanagari', 'latin'] });
loadTiroSanskrit('normal', { subsets: ['devanagari', 'latin'] });
loadCormorant('normal', { weights: ['500', '600', '700'], subsets: ['latin'] });
loadMarcellus('normal', { subsets: ['latin'] });

export const F = {
  deva: `'${STUDIO.brand.devanagari}', 'Tiro Devanagari Hindi', serif`,
  sanskrit: "'Tiro Devanagari Sanskrit', serif",
  brand: `'${STUDIO.brand.wordmark}', serif`,
};

export const P = {
  abyss: '#01040C', deep: '#030A19', navy: '#071434', navy2: '#0C1D46', rim: '#1A2E62',
  gold: '#E3BB44', goldHi: '#F4D77A', goldDeep: '#A87C22', goldDim: '#6E5418',
  ember: '#E8643A', lacquer: '#7E1426', lacquerHi: '#B8323A', snow: '#B9C4DC', star: '#F6E7B8',
};
export const W = 1920;
export const H = 1080;

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
export const rnd = (seed: number, i: number) => Math.abs(Math.sin(seed * 31.7 + i * 12.9898) * 43758.5453) % 1;
/** Fade in from `a` over `d` frames. */
export const fin = (t: number, a: number, d = 12) => clamp((t - a) / d);

/** Filters and gradients used across the film. */
export const Defs: React.FC = () => (
  <defs>
    <filter id="rkGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="6" result="b" />
      <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
    </filter>
    <filter id="rkGlowBig" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="18" result="b" />
      <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
    </filter>
    <filter id="rkBlur30" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="30" /></filter>
    <filter id="rkBlur8" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="8" /></filter>
    <filter id="rkHaze" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.004 0.012" numOctaves={3} seed={7} />
      <feColorMatrix type="matrix" values="0 0 0 0 0.85  0 0 0 0 0.7  0 0 0 0 0.35  0 0 0 0.9 -0.35" />
    </filter>
    <radialGradient id="rkSun" cx="50%" cy="50%" r="50%">
      <stop offset="0" stopColor={P.goldHi} stopOpacity={0.95} />
      <stop offset="0.25" stopColor={P.gold} stopOpacity={0.55} />
      <stop offset="1" stopColor={P.gold} stopOpacity={0} />
    </radialGradient>
    <radialGradient id="rkHalo" cx="50%" cy="50%" r="50%">
      <stop offset="0" stopColor={P.goldHi} stopOpacity={0.55} />
      <stop offset="0.6" stopColor={P.gold} stopOpacity={0.15} />
      <stop offset="1" stopColor={P.gold} stopOpacity={0} />
    </radialGradient>
    <linearGradient id="rkSky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={P.abyss} />
      <stop offset="0.55" stopColor={P.navy} />
      <stop offset="0.8" stopColor="#1C2550" />
      <stop offset="1" stopColor="#3A3150" />
    </linearGradient>
    <linearGradient id="rkGround" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#0B1430" />
      <stop offset="1" stopColor={P.abyss} />
    </linearGradient>
    <linearGradient id="rkFigure" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#0B1736" />
      <stop offset="1" stopColor="#040917" />
    </linearGradient>
    <linearGradient id="rkBlood" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#8A1A28" />
      <stop offset="1" stopColor="#3E0812" />
    </linearGradient>
    <radialGradient id="rkVoid" cx="50%" cy="45%" r="55%">
      <stop offset="0" stopColor="#0A1438" />
      <stop offset="0.7" stopColor="#030817" />
      <stop offset="1" stopColor="#000000" />
    </radialGradient>
  </defs>
);

/** Stars, twinkling slowly. */
export const Stars: React.FC<{ t: number; n?: number; seed?: number; o?: number; box?: [number, number, number, number] }> = ({ t, n = 140, seed = 3, o = 1, box = [0, 0, W, H * 0.6] }) => (
  <g opacity={o}>
    {Array.from({ length: n }, (_, i) => {
      const tw = 0.35 + 0.65 * Math.abs(Math.sin(t * (0.02 + rnd(seed + 2, i) * 0.05) + i));
      return <circle key={i} cx={box[0] + rnd(seed, i) * box[2]} cy={box[1] + rnd(seed + 1, i) * box[3]} r={0.6 + rnd(seed + 3, i) * 1.8} fill={P.star} opacity={tw * (0.3 + rnd(seed + 4, i) * 0.6)} />;
    })}
  </g>
);

/** Himalayan ridge lines: far, mid, near, with gold-lit snow edges. */
export const Peaks: React.FC<{ y?: number; t?: number; o?: number }> = ({ y = 640, t = 0, o = 1 }) => {
  const ridge = (seed: number, base: number, amp: number, step: number) => {
    let d = `M0 ${H} L0 ${base}`;
    for (let x = 0; x <= W + step; x += step) {
      const h = amp * (0.35 + rnd(seed, x) * 0.65) * (0.6 + 0.4 * Math.sin(x / 310 + seed));
      d += ` L${x} ${base - h} L${x + step / 2} ${base - h * (0.45 + rnd(seed + 1, x) * 0.3)}`;
    }
    return d + ` L${W} ${H} Z`;
  };
  return (
    <g opacity={o} transform={`translate(${-t * 0.05} 0)`}>
      <path d={ridge(11, y - 40, 300, 150)} fill="#0E1A40" />
      <path d={ridge(11, y - 40, 300, 150)} fill="none" stroke={P.snow} strokeWidth={1.4} opacity={0.35} />
      <path d={ridge(23, y + 20, 210, 120)} fill="#0A1433" />
      <path d={ridge(23, y + 20, 210, 120)} fill="none" stroke={P.gold} strokeWidth={1.2} opacity={0.3} />
      <path d={ridge(37, y + 90, 120, 90)} fill="#060E26" />
    </g>
  );
};

/** A Nagara shikhara (curvilinear north-Indian temple tower) silhouette, gold edged. */
export const Shikhara: React.FC<{ x: number; y: number; s?: number; o?: number }> = ({ x, y, s = 1, o = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <path d="M-60 0 L-60 -40 L-48 -40 Q-50 -150 0 -230 Q50 -150 48 -40 L60 -40 L60 0 Z" fill="#050B1D" />
    <path d="M-48 -40 Q-50 -150 0 -230 Q50 -150 48 -40" fill="none" stroke={P.gold} strokeWidth={2} opacity={0.6} />
    {[-80, -120, -160, -195].map((yy, i) => <path key={i} d={`M${-44 + i * 9} ${yy} Q0 ${yy - 8} ${44 - i * 9} ${yy}`} fill="none" stroke={P.gold} strokeWidth={1.2} opacity={0.35} />)}
    <ellipse cx={0} cy={-236} rx={14} ry={6} fill="none" stroke={P.gold} strokeWidth={2} opacity={0.7} />
    <path d="M0 -242 L0 -262" stroke={P.gold} strokeWidth={2} opacity={0.7} />
    <path d="M-30 0 L-30 -30 Q0 -52 30 -30 L30 0" fill="none" stroke={P.gold} strokeWidth={1.2} opacity={0.4} />
  </g>
);

/** The battlefield at dusk below the snow peaks: sky, low sun, ridges, a far shrine, cracked earth. */
export const Field: React.FC<{ t: number; sun?: number; horizon?: number; stars?: number; dark?: number; shrines?: boolean }> = ({ t, sun = 1, horizon = 700, stars = 0.6, dark = 0, shrines = true }) => (
  <g>
    <rect width={W} height={H} fill="url(#rkSky)" />
    <Stars t={t} o={stars} />
    <circle cx={1360} cy={horizon - 80} r={260} fill="url(#rkSun)" opacity={0.7 * sun} />
    <circle cx={1360} cy={horizon - 80} r={46} fill={P.goldHi} opacity={0.85 * sun} />
    <Peaks y={horizon - 40} t={t} />
    {shrines ? <><Shikhara x={420} y={horizon - 8} s={0.55} o={0.85} /><Shikhara x={1660} y={horizon + 2} s={0.42} o={0.7} /></> : null}
    <rect x={0} y={horizon} width={W} height={H - horizon} fill="url(#rkGround)" />
    <g stroke={P.goldDim} strokeWidth={1.1} opacity={0.45} fill="none">
      {Array.from({ length: 26 }, (_, i) => {
        const x0 = rnd(5, i) * W, y0 = horizon + 30 + rnd(6, i) * (H - horizon - 40);
        return <path key={i} d={`M${x0} ${y0} l${30 + rnd(7, i) * 60} ${(rnd(8, i) - 0.5) * 18} l${20 + rnd(9, i) * 40} ${(rnd(10, i) - 0.5) * 22}`} />;
      })}
    </g>
    <rect width={W} height={H} filter="url(#rkHaze)" opacity={0.08} />
    {dark > 0 ? <rect width={W} height={H} fill={P.abyss} opacity={dark} /> : null}
  </g>
);

/** Drifting gold motes. */
export const Motes: React.FC<{ t: number; n?: number; seed?: number; o?: number; rise?: number }> = ({ t, n = 40, seed = 9, o = 0.7, rise = 0.4 }) => (
  <g opacity={o}>
    {Array.from({ length: n }, (_, i) => {
      const x = (rnd(seed, i) * W + Math.sin(t * 0.01 + i) * 30) % W;
      const y = ((rnd(seed + 1, i) * H - t * rise * (0.5 + rnd(seed + 2, i))) % H + H) % H;
      return <circle key={i} cx={x} cy={y} r={1 + rnd(seed + 3, i) * 2.4} fill={P.goldHi} opacity={0.25 + 0.5 * rnd(seed + 4, i)} />;
    })}
  </g>
);

/** A stylised blood drop: deep lacquer with a gold core, never graphic. */
export const Drop: React.FC<{ x: number; y: number; s?: number; o?: number; glow?: number }> = ({ x, y, s = 1, o = 1, glow = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <circle r={26} fill={P.gold} opacity={0.18 * glow} filter="url(#rkBlur8)" />
    <path d="M0 -24 Q14 -4 14 8 A14 14 0 0 1 -14 8 Q-14 -4 0 -24 Z" fill={P.lacquer} />
    <path d="M0 -14 Q7 -2 7 6 A7 7 0 0 1 -7 6 Q-7 -2 0 -14 Z" fill={P.lacquerHi} opacity={0.8} />
    <circle cx={-3} cy={5} r={3} fill={P.goldHi} opacity={0.9} />
  </g>
);

/** Gold dust: a body coming apart into motes that drift up and fade (p 0..1). */
export const DustBurst: React.FC<{ x: number; y: number; p: number; seed?: number; n?: number; spread?: number; h?: number }> = ({ x, y, p, seed = 1, n = 90, spread = 90, h = 380 }) => {
  if (p <= 0) return null;
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const bx = (rnd(seed, i) - 0.5) * spread * 1.4, by = -rnd(seed + 1, i) * h;
        const k = clamp(p * 1.3 - rnd(seed + 2, i) * 0.3);
        const dx = bx + (rnd(seed + 3, i) - 0.5) * 160 * k, dy = by - 220 * k * (0.4 + rnd(seed + 4, i));
        return <circle key={i} cx={x + dx} cy={y + dy} r={(1 + rnd(seed + 5, i) * 2.6) * (1 - k * 0.5)} fill={i % 3 ? P.gold : P.goldHi} opacity={(1 - k) * 0.95} />;
      })}
    </g>
  );
};

/** The film's camera: centre world point (cx, cy) at zoom s. */
export const cam = (cx: number, cy: number, s: number) => `translate(960 540) scale(${s}) translate(${-cx} ${-cy})`;
