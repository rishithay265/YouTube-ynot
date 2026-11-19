import React from 'react';
import {
  Hero, Pose, basePose, poseAt, faceAt, kf, clamp, easeOut, easeIn, backOut, rnd, camP, LOOKS, joints, toWorld,
  Glow, FocusRings, Dial, ShotProps, FONT, SCH, SchLabel, CountUp, DrawOn,
} from '../../engine';
import { PIP, MO, SpaceBg, BendStars, BlackHole, floatPose, Helmet, Spacer, Blueprint, Pill, PortraitTitle } from './parts';

// "What if you fell into a black hole?" Thirty-two shots in portrait (1080 x 1920). Sets: open space with a black hole,
// a space-station window with Mo, a blueprint for the science, a plate of spaghetti, a galaxy and the void.
// Each shot is a pure function of its own clock t.

const ORANGE = '#FF8A3D';
const CREAM = '#F6EFE3';
const quad = (p0: number[], p1: number[], p2: number[], u: number) => [
  (1 - u) * (1 - u) * p0[0] + 2 * (1 - u) * u * p1[0] + u * u * p2[0],
  (1 - u) * (1 - u) * p0[1] + 2 * (1 - u) * u * p1[1] + u * u * p2[1],
];

// =============== COLD OPEN ===============
export const S1: React.FC<ShotProps> = ({ t, len }) => {
  const pose = floatPose(t, 540, 430 + t * 2.4, 0.8, { ...faceAt(t, [[0, 'worried']]), look: 0.3 });
  return (
    <g transform={camP(540, 960, kf(t, [[0, 1], [len, 1.1]]))}>
      <SpaceBg t={t} id="s1" />
      <BlackHole x={540} y={1420} r={190} t={t} id="bh1" />
      <Spacer pose={pose} id="h1" />
    </g>
  );
};

export const S2: React.FC<ShotProps> = ({ t, len }) => {
  const pose = floatPose(t, 540, 1000, 1.3, { yaw: 0.15, ...faceAt(t, [[0, 'worried']]), look: -0.3 });
  return (
    <g transform={camP(540, 790, kf(t, [[0, 3.1], [len, 3.5]]))}>
      <SpaceBg t={t} id="s2" seed={5} />
      <Glow x={540} y={1150} r={560} kind="warm" o={0.55} />
      <Spacer pose={pose} id="h2" glow={0.8} />
    </g>
  );
};

export const S3: React.FC<ShotProps> = ({ t, len }) => {
  const pose = floatPose(t, 540, 1050, 1.35, { yaw: 0.1, armL: { a: 58, b: -4 }, armR: { a: 58, b: -4 }, ...faceAt(t, [[0, 'worried'], [10, 'cool']]) });
  return (
    <g transform={camP(540, 880, kf(t, [[0, 1.45], [len, 1.7]]))}>
      <SpaceBg t={t} id="s3" seed={7} />
      <BlackHole x={540} y={1760} r={330} t={t} id="bh3" />
      <Spacer pose={pose} id="h3" />
    </g>
  );
};

export const S4: React.FC<ShotProps> = ({ t, len }) => {
  const pose = floatPose(t, 540, 1020, 1.4, { yaw: 0, handR: 'point', armR: { a: 125, b: -28 }, armL: { a: 22, b: -10 }, headTilt: -4, ...faceAt(t, [[0, 'smug']]) });
  return (
    <g transform={`rotate(-5 540 960)`}>
      <g transform={camP(540, 900, kf(t, [[0, 1.7], [len, 1.9]]))}>
        <SpaceBg t={t} id="s4" seed={9} />
        <BlackHole x={540} y={1900} r={360} t={t} id="bh4" />
        <Spacer pose={pose} id="h4" />
      </g>
    </g>
  );
};

export const S5: React.FC<ShotProps> = ({ t, len }) => {
  const pose = floatPose(t, 540, 1000 + t * 0.8, 0.5, { ...faceAt(t, [[0, 'worried']]) });
  return (
    <g transform={camP(540, 960, kf(t, [[0, 1.05], [len, 1]]))}>
      <SpaceBg t={t} id="s5" seed={3} />
      <BlackHole x={540} y={1400} r={210} t={t} id="bh5" />
      <Spacer pose={pose} id="h5" />
      <PortraitTitle t={t} y={330} />
    </g>
  );
};

// =============== FIRST, THE SKY BENDS ===============
export const S6: React.FC<ShotProps> = ({ t, len }) => {
  const k = easeOut(clamp(t / 44));
  const pose = floatPose(t, 540, 1350, 0.75, { yaw: 0.2, headTilt: -10, ...faceAt(t, [[0, 'shock']]) });
  return (
    <g transform={camP(540, 1000, kf(t, [[0, 1], [len, 1.12]]))}>
      <SpaceBg t={t} id="s6" seed={13} n={120} />
      <BendStars cx={540} cy={2150} t={t} bend={k} minR={380} maxR={1500} n={160} />
      <BlackHole x={540} y={2150} r={330} t={t} id="bh6" disk={0.7} />
      <Spacer pose={pose} id="h6" />
    </g>
  );
};

export const S7: React.FC<ShotProps> = ({ t }) => {
  const cy = 960;
  const bs = [-420, -330, -250, -190, 190, 250, 330, 420];
  return (
    <g>
      <Blueprint t={t} id="s7" />
      {bs.map((b, i) => {
        const p0 = [30, cy + b];
        const p1 = [540, cy + b];
        const p2 = [1050, cy + b - Math.sign(b) * clamp(52000 / Math.abs(b), 0, 360)];
        const u = (t * 0.016 + i * 0.37) % 1;
        const [x, y] = quad(p0, p1, p2, u);
        const drawn = t - i * 2 > 14;
        return (
          <g key={i}>
            <DrawOn d={`M ${p0[0]} ${p0[1]} Q ${p1[0]} ${p1[1]} ${p2[0]} ${p2[1]}`} t={t - i * 2} dur={14} color="#FFD27A" width={5} />
            {drawn ? <circle cx={x} cy={y} r={11} fill="#FFF3D6" style={{ filter: 'drop-shadow(0 0 10px #FFB15A)' }} /> : null}
          </g>
        );
      })}
      <BlackHole x={540} y={cy} r={120} t={t} id="bh7" disk={0.5} glow={0.6} />
      <Pill x={540} y={250} text="GRAVITY BENDS LIGHT" t={t - 12} />
    </g>
  );
};

export const S8: React.FC<ShotProps> = ({ t, len }) => {
  const pose = floatPose(t, 540, 1600, 1.0, { yaw: 0.1, headTilt: -8, ...faceAt(t, [[0, 'shock']]) });
  return (
    <g transform={camP(540, 1000, kf(t, [[0, 1], [len, 1.15]]))}>
      <SpaceBg t={t} id="s8" seed={17} n={90} />
      <BendStars cx={540} cy={860} t={t} bend={1} minR={170} maxR={560} n={230} seed={23} />
      <circle cx={540} cy={860} r={158} fill="none" stroke="#FFEBC2" strokeWidth={7} opacity={0.9} />
      <BlackHole x={540} y={860} r={128} t={t} id="bh8" disk={0} glow={0.6} />
      <Spacer pose={pose} id="h8" rim="rimR" />
    </g>
  );
};

// =============== THE EVENT HORIZON ===============
export const S9: React.FC<ShotProps> = ({ t, len }) => {
  const y = kf(t, [[0, 560], [44, 1123], [len, 1240]], (x) => x);
  const crossed = t >= 44;
  const pose = floatPose(t, 540, y - Math.sin(t / 15) * 7, 0.55, { yaw: 0, ...faceAt(t, [[0, 'worried'], [46, 'oops']]) });
  return (
    <g transform={camP(540, 1060, 1)}>
      <SpaceBg t={t} id="s9" seed={29} />
      <BlackHole x={540} y={1500} r={300} t={t} id="bh9" tilt={-7} disk={0.55} />
      <circle cx={540} cy={1500} r={300} fill="none" stroke="#7FD4FF" strokeWidth={5} strokeDasharray="22 16" strokeDashoffset={-t * 1.4} opacity={0.9} />
      <path d="M 330 1130 L 420 1215" stroke="#7FD4FF" strokeWidth={4} opacity={0.9} fill="none" />
      <Pill x={230} y={1110} text="EVENT HORIZON" t={t - 6} color="#BFE8FF" />
      <Spacer pose={pose} id="h9" rim={crossed ? 'rimRed' : 'rimR'} />
    </g>
  );
};

export const S10: React.FC<ShotProps> = ({ t }) => {
  const pose = poseAt(t, [
    { f: 0, p: { ...floatPose(0, 450, 1050, 1.4, { yaw: 0.8, handR: 'point', armR: { a: 40, b: -6 }, expr: 'neutral' }) } },
    { f: 8, p: { armR: { a: 94, b: -4 } }, ease: easeOut },
    { f: 25, p: { armR: { a: 96, b: -4 } } },
  ]);
  const face = faceAt(t, [[0, 'neutral'], [10, 'oops']]);
  const hand = toWorld({ ...pose, scale: 1.4 }, joints(pose).armR.end);
  return (
    <g transform={camP(560, 1000, 1.5)}>
      <SpaceBg t={t} id="s10" seed={31} />
      <BlackHole x={1250} y={1000} r={640} t={t} id="bh10" disk={0} glow={0.5} ring={false} />
      <circle cx={1250} cy={1000} r={642} fill="none" stroke="#7FD4FF" strokeWidth={5} strokeDasharray="22 16" strokeDashoffset={-t * 1.2} />
      <Hero look={PIP} pose={{ ...pose, ...face }} rimId="rimR" shadow={0} />
      <Helmet pose={pose} id="h10" />
      {t > 8 ? <circle cx={hand.x + 20} cy={hand.y} r={18 + (t - 8) * 3} fill="none" stroke="#BFE8FF" strokeWidth={3} opacity={clamp(1 - (t - 8) / 14)} /> : null}
    </g>
  );
};

export const S11: React.FC<ShotProps> = ({ t }) => {
  const y = kf(t, [[0, 1130], [7, 1062], [13, 1130], [17, 1130], [23, 1072], [28, 1130]], (x) => x);
  const land = (t >= 12 && t <= 16) || t >= 27;
  const pose = floatPose(0, 540, y, 1.5, { yaw: 0.1, armL: { a: 30, b: -8 }, armR: { a: 30, b: -8 }, legL: { a: land ? 20 : 4, b: land ? 30 : 4 }, legR: { a: land ? -18 : -4, b: land ? 30 : 4 }, ...faceAt(t, [[0, 'oops'], [14, 'happy']]) });
  return (
    <g transform={camP(540, 1150, 1.35)}>
      <SpaceBg t={t} id="s11" seed={37} />
      <BlackHole x={540} y={2050} r={760} t={t} id="bh11" disk={0} glow={0.5} />
      <path d="M 40 1285 Q 540 1345 1040 1285" fill="none" stroke="#7FD4FF" strokeWidth={5} strokeDasharray="22 16" strokeDashoffset={-t} opacity={0.85} />
      <Spacer pose={pose} id="h11" />
    </g>
  );
};

export const S12: React.FC<ShotProps> = ({ t, len }) => {
  const R = kf(t, [[0, 330], [len, 130]]);
  const pose = floatPose(t, 700, 1250, 1.35, { yaw: -0.85, headTilt: 6, ...faceAt(t, [[0, 'worried']]) });
  return (
    <g transform={camP(540, 960, 1.05)}>
      <rect x={-300} y={-300} width={1680} height={2520} fill="#0A0508" />
      <Glow x={330} y={700} r={R * 2.3} kind="cool" o={0.45} />
      <defs>
        <clipPath id="s12c">
          <circle cx={330} cy={700} r={R} />
        </clipPath>
      </defs>
      <defs>
        <radialGradient id="s12rg">
          <stop offset="0" stopColor="#E4EEFF" />
          <stop offset="0.5" stopColor="#6B8BE0" />
          <stop offset="1" stopColor="#1E2E66" />
        </radialGradient>
      </defs>
      <g clipPath="url(#s12c)">
        <circle cx={330} cy={700} r={R + 4} fill="url(#s12rg)" />
        {Array.from({ length: 110 }).map((_, i) => (
          <circle key={i} cx={330 + (rnd(43, i) * 2 - 1) * R} cy={700 + (rnd(44, i) * 2 - 1) * R} r={1.5 + rnd(45, i) * 3.5} fill="#FFFFFF" opacity={0.5 + rnd(46, i) * 0.5} />
        ))}
      </g>
      <circle cx={330} cy={700} r={R} fill="none" stroke="#DDEBFF" strokeWidth={7} opacity={0.9} />
      <Spacer pose={pose} id="h12" rim="rimL" />
    </g>
  );
};

export const S13: React.FC<ShotProps> = ({ t }) => {
  const cx = 540;
  const cy = 960;
  return (
    <g>
      <Blueprint t={t} id="s13" />
      <circle cx={cx} cy={cy} r={270} fill="none" stroke="#7FD4FF" strokeWidth={5} strokeDasharray="22 16" strokeDashoffset={-t * 1.2} />
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const th = (i / 6) * Math.PI * 2 + 0.3;
        const at = (r: number, a: number) => [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
        const p0 = at(160, th);
        const p1 = at(470, th + 0.45);
        const p2 = at(110, th + 0.95);
        const u = (t * 0.02 + i * 0.17) % 1;
        const [x, y] = quad(p0, p1, p2, u);
        return (
          <g key={i}>
            <DrawOn d={`M ${p0[0]} ${p0[1]} Q ${p1[0]} ${p1[1]} ${p2[0]} ${p2[1]}`} t={t - i * 3} dur={16} color="#FFD27A" width={4} />
            {t - i * 3 > 16 ? <circle cx={x} cy={y} r={11} fill="#FFF3D6" style={{ filter: 'drop-shadow(0 0 10px #FFB15A)' }} /> : null}
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r={100} fill="#020104" stroke="#FFEBC2" strokeWidth={4} />
      <Pill x={540} y={1380} text="EVENT HORIZON" t={t - 4} color="#BFE8FF" />
      <Pill x={540} y={1500} text="LIGHT CAN'T LEAVE" t={t - 22} color="#FFD27A" />
    </g>
  );
};

// =============== YOUR FRIEND WATCHES ===============
const Station: React.FC<{ t: number; id: string; dot?: number }> = ({ t, id, dot = 1 }) => (
  <g>
    <rect x={-300} y={-300} width={1680} height={2520} fill="#121A31" />
    <defs>
      <clipPath id={`${id}win`}>
        <rect x={110} y={300} width={860} height={1200} rx={90} />
      </clipPath>
    </defs>
    <g clipPath={`url(#${id}win)`}>
      <SpaceBg t={t} id={`${id}sp`} seed={53} n={120} />
      <BlackHole x={650} y={850} r={80} t={t} id={`${id}bh`} disk={0.8} />
      <circle cx={650} cy={765} r={4 + 2 * Math.sin(t / 3)} fill="#FFB060" opacity={dot} />
    </g>
    <rect x={110} y={300} width={860} height={1200} rx={90} fill="none" stroke="#2A3558" strokeWidth={34} />
    <rect x={110} y={300} width={860} height={1200} rx={90} fill="none" stroke="#4A5782" strokeWidth={5} opacity={0.7} />
    <path d="M 160 380 L 300 340" stroke="#fff" strokeOpacity={0.18} strokeWidth={10} strokeLinecap="round" />
    <Glow x={200} y={1650} r={700} kind="warm" o={0.4} />
  </g>
);

export const S14: React.FC<ShotProps> = ({ t, len }) => {
  const mo = floatPose(0, 300, 2000, 2.6, { yaw: 0.9, look: 0.8, armR: { a: 118, b: -12 }, armL: { a: 12, b: -8 }, expr: 'worried', legL: { a: 2, b: 0 }, legR: { a: -2, b: 0 }, sway: 0 });
  return (
    <g transform={camP(540, 960, kf(t, [[0, 1], [len, 1.08]]))}>
      <Station t={t} id="s14" />
      <Hero look={MO} pose={{ ...mo, y: 2000 + Math.sin(t / 20) * 3 }} rimId="rimR" shadow={0} />
    </g>
  );
};

export const S15: React.FC<ShotProps> = ({ t }) => {
  const at = (tt: number) => 950 - 70 - 230 * Math.exp(-Math.max(0, tt) / 22);
  const rate = Math.exp(-t / 24);
  return (
    <g transform={camP(540, 1000, 1.2)}>
      <SpaceBg t={t} id="s15" seed={59} />
      <BlackHole x={540} y={1250} r={300} t={t} id="bh15" disk={0.6} />
      <circle cx={540} cy={1250} r={300} fill="none" stroke="#7FD4FF" strokeWidth={4} strokeDasharray="22 16" strokeDashoffset={-t} opacity={0.8} />
      {[5, 4, 3, 2, 1].map((k) => (
        <g key={k} opacity={0.5 / k}>
          <Hero look={PIP} pose={floatPose(0, 540, at(t - k * 5), 0.42, { yaw: 0, expr: 'worried' })} rimId="rimR" shadow={0} />
        </g>
      ))}
      <Spacer pose={floatPose(0, 540, at(t), 0.42, { yaw: 0, ...faceAt(t, [[0, 'worried']]) })} id="h15" />
      <Dial x={820} y={430} r={100} size={42} p={rate} readout={`x${rate.toFixed(1)}`} />
      <Pill x={540} y={310} text="SEEN FROM FAR AWAY" t={t - 2} />
    </g>
  );
};

const RS: React.FC<{ id: string; a: number }> = ({ id, a }) => (
  <filter id={id} x="-30%" y="-30%" width="160%" height="160%">
    <feColorMatrix type="matrix" values={`1 ${0.38 * a} ${0.3 * a} 0 ${0.16 * a}  0 ${1 - 0.7 * a} 0 0 0  0 0 ${1 - 0.75 * a} 0 0  0 0 0 1 0`} />
  </filter>
);

export const S16: React.FC<ShotProps> = ({ t }) => {
  const a = easeOut(clamp(t / 22));
  const pose = floatPose(t, 540, 1050, 1.1, { yaw: 0.3, ...faceAt(t, [[0, 'worried']]) });
  return (
    <g transform={camP(540, 1000, 1.25)}>
      <SpaceBg t={t} id="s16" seed={61} />
      <BlackHole x={540} y={1750} r={420} t={t} id="bh16" disk={0.5} />
      <defs><RS id="s16rs" a={a} /></defs>
      <g filter="url(#s16rs)">
        <Spacer pose={pose} id="h16" />
      </g>
      <g transform="translate(140 330)">
        <defs>
          <linearGradient id="s16bar" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#5B7BFF" />
            <stop offset="0.5" stopColor="#FFE27A" />
            <stop offset="1" stopColor="#FF3B2E" />
          </linearGradient>
        </defs>
        <rect width={800} height={28} rx={14} fill="url(#s16bar)" />
        <path transform={`translate(${a * 780 + 10} -12)`} d="M -16 -10 L 16 -10 L 0 14 Z" fill={CREAM} />
      </g>
    </g>
  );
};

export const S17: React.FC<ShotProps> = ({ t, len }) => {
  const o = kf(t, [[0, 1], [len, 0.14]]);
  const pose = floatPose(t, 540, 1000, 0.9, { yaw: 0.3, ...faceAt(t, [[0, 'tired']]) });
  return (
    <g transform={camP(540, 1000, 1.5)}>
      <SpaceBg t={t} id="s17" seed={67} />
      <BlackHole x={540} y={1700} r={420} t={t} id="bh17" disk={0.4} />
      <ellipse cx={540} cy={1060} rx={120} ry={200} fill="#FF3B2E" opacity={0.18 * (1 - o) + 0.1} style={{ filter: 'blur(26px)' }} />
      <defs><RS id="s17rs" a={1} /></defs>
      <g filter="url(#s17rs)" opacity={o} style={{ filter: undefined }}>
        <g filter="url(#s17rs)">
          <Spacer pose={pose} id="h17" />
        </g>
      </g>
    </g>
  );
};

export const S18: React.FC<ShotProps> = ({ t, len }) => {
  const mo = floatPose(0, 330, 1790, 2.3, { yaw: 0.5, look: 0.7, armL: { a: 14, b: -8 }, armR: { a: 14, b: -8 }, legL: { a: 2, b: 0 }, legR: { a: -2, b: 0 }, sway: 0, ...faceAt(t, [[0, 'worried']]) });
  return (
    <g transform={camP(480, 1200, kf(t, [[0, 1.7], [len, 1.95]]))}>
      <Station t={t} id="s18" dot={0} />
      <circle cx={650} cy={765} r={6 + 2 * Math.sin(t / 2)} fill="#FF3B2E" opacity={0.7 + 0.3 * Math.sin(t / 4)} style={{ filter: 'drop-shadow(0 0 8px #FF3B2E)' }} />
      <Hero look={MO} pose={mo} rimId="rimR" shadow={0} />
    </g>
  );
};

// =============== INSIDE ===============
export const S19: React.FC<ShotProps> = ({ t }) => {
  const pose = floatPose(t, 540, 780, 1.0, { yaw: 0, armL: { a: 150, b: -10 }, armR: { a: 150, b: -10 }, ...faceAt(t, [[0, 'shock']]) });
  return (
    <g transform={camP(540, 960, 1)}>
      <rect x={-300} y={-300} width={1680} height={2520} fill="#0A0306" />
      <Glow x={540} y={1500} r={800} kind="red" o={0.6} />
      {Array.from({ length: 70 }).map((_, i) => {
        const a = rnd(71, i) * Math.PI * 2;
        const ph = (rnd(72, i) + t * 0.035) % 1;
        const r0 = 90 + ph * 1100;
        const r1 = r0 + 40 + ph * 260;
        return <line key={i} x1={540 + Math.cos(a) * r0} y1={1500 + Math.sin(a) * r0 * 1.15} x2={540 + Math.cos(a) * r1} y2={1500 + Math.sin(a) * r1 * 1.15} stroke="#FF6A4A" strokeWidth={2 + ph * 5} opacity={0.15 + ph * 0.5} strokeLinecap="round" />;
      })}
      <Spacer pose={pose} id="h19" rim="rimRed" glow={0.3} />
    </g>
  );
};

const BigArrow: React.FC<{ x: number; y: number; len: number; w: number; p: number; color?: string }> = ({ x, y, len, w, p, color = '#FF5A4A' }) => {
  const L = len * p;
  if (L < 4) return null;
  const head = Math.min(L, w * 1.1);
  return (
    <path d={`M ${x - w / 2} ${y} L ${x + w / 2} ${y} L ${x + w / 2} ${y + L - head} L ${x + w} ${y + L - head} L ${x} ${y + L} L ${x - w} ${y + L - head} L ${x - w / 2} ${y + L - head} Z`} fill={color} opacity={0.95} style={{ filter: `drop-shadow(0 0 14px ${color}88)` }} />
  );
};

export const S20: React.FC<ShotProps> = ({ t }) => {
  const pose = floatPose(t, 540, 960, 1.0, { yaw: 0.1, armL: { a: 140, b: -10 }, armR: { a: 140, b: -10 }, ...faceAt(t, [[0, 'worried'], [26, 'shock']]) });
  return (
    <g>
      <SpaceBg t={t} id="s20" seed={73} />
      <BlackHole x={540} y={2150} r={520} t={t} id="bh20" disk={0} glow={0.8} />
      <Spacer pose={pose} id="h20" />
      <BigArrow x={800} y={1100} len={430} w={44} p={easeOut(clamp((t - 22) / 12))} />
      <BigArrow x={290} y={700} len={110} w={14} p={easeOut(clamp((t - 52) / 10))} />
      <Pill x={760} y={1600} text="FEET: PULLED HARD" t={t - 30} color="#FFB0A0" />
      <Pill x={300} y={610} text="HEAD: PULLED LESS" t={t - 60} color="#FFD27A" />
    </g>
  );
};

export const S21: React.FC<ShotProps> = ({ t }) => {
  const sy = kf(t, [[0, 1], [18, 2.4]], easeIn);
  const sx = kf(t, [[0, 1], [18, 0.55]], easeIn);
  const pose = floatPose(0, 540, 1360, 1.0, { yaw: 0, armL: { a: 155, b: -8 }, armR: { a: 155, b: -8 }, legL: { a: 4, b: 0 }, legR: { a: -4, b: 0 }, ...faceAt(t, [[0, 'shock']]) });
  return (
    <g>
      <SpaceBg t={t} id="s21" seed={79} />
      <BlackHole x={540} y={2150} r={520} t={t} id="bh21" disk={0} glow={0.8} />
      <g transform={`translate(540 1500) scale(${sx} ${sy}) translate(-540 -1500)`}>
        <Spacer pose={pose} id="h21" rim="rimRed" />
      </g>
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1={150 + i * 30} y1={500 + i * 120} x2={150 + i * 30} y2={500 + i * 120 + 120 * clamp(t / 10)} stroke="#FF6A4A" strokeWidth={5} opacity={0.4} strokeLinecap="round" />
      ))}
    </g>
  );
};

export const S22: React.FC<ShotProps> = ({ t, len }) => {
  const wob = (i: number, k: number) => Math.sin(t / 5 + i * 1.7) * k;
  const pop = backOut(clamp((t - 5) / 8));
  return (
    <g transform={camP(540, 960, kf(t, [[0, 1], [len, 1.1]]))}>
      <rect x={-300} y={-300} width={1680} height={2520} fill="#1B1030" />
      <Glow x={540} y={960} r={900} kind="warm" o={0.25} />
      <ellipse cx={540} cy={1010} rx={420} ry={400} fill="#00000066" />
      <circle cx={540} cy={960} r={400} fill="#F4EEE0" stroke="#D8CDB8" strokeWidth={10} />
      <circle cx={540} cy={960} r={290} fill="#EADFC8" />
      {Array.from({ length: 16 }).map((_, i) => {
        const a = (i / 16) * Math.PI * 2;
        const x0 = 540 + Math.cos(a) * 60;
        const y0 = 960 + Math.sin(a) * 60;
        const x1 = 540 + Math.cos(a + 0.9) * 270 + wob(i, 14);
        const y1 = 960 + Math.sin(a + 0.9) * 270 + wob(i + 4, 14);
        const mx = 540 + Math.cos(a + 0.4) * 340;
        const my = 960 + Math.sin(a + 0.4) * 340;
        return <path key={i} d={`M ${x0} ${y0} Q ${mx} ${my} ${x1} ${y1}`} stroke="#F2CF7E" strokeWidth={20} fill="none" strokeLinecap="round" />;
      })}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <circle key={i} cx={430 + rnd(81, i) * 230} cy={860 + rnd(82, i) * 230} r={28 + rnd(83, i) * 26} fill="#C8452D" opacity={0.85} />
      ))}
      {/* the strand that is Pip: his hoodie colours, and his head at the end of it */}
      <path d={`M 540 990 Q 700 880 ${520 + wob(1, 10)} ${700 + wob(2, 10)}`} stroke="#2E2B3D" strokeWidth={30} fill="none" strokeLinecap="round" />
      <path d={`M 540 990 Q 700 880 ${520 + wob(1, 10)} ${700 + wob(2, 10)}`} stroke="#F2B33D" strokeWidth={5} strokeDasharray="22 40" fill="none" />
      <g transform={`translate(${520 + wob(1, 10)} ${650 + wob(2, 10)}) scale(${pop})`}>
        <circle r={66} fill={CREAM} stroke="#1D2033" strokeWidth={6} />
        <circle cx={-22} cy={-8} r={9} fill="#1D2033" />
        <circle cx={22} cy={-8} r={9} fill="#1D2033" />
        <ellipse cx={0} cy={28} rx={14} ry={18} fill="#1D2033" />
      </g>
      <g transform={`translate(${700 + wob(0, 6)} ${690}) rotate(28)`}>
        <rect x={-10} y={0} width={20} height={300} rx={10} fill="#C8CCD6" />
        {[-26, -9, 9, 26].map((dx) => (
          <rect key={dx} x={dx - 4} y={-120} width={8} height={130} rx={4} fill="#DDE1EA" />
        ))}
        <rect x={-30} y={-6} width={60} height={26} rx={10} fill="#C8CCD6" />
      </g>
    </g>
  );
};

// =============== THE NUMBERS ===============
export const S23: React.FC<ShotProps> = ({ t }) => (
  <g>
    <Blueprint t={t} id="s23" />
    <SchLabel x={540} y={520} t={t - 2} text="SMALL BLACK HOLE" size={50} />
    <circle cx={540} cy={860} r={70} fill="#020104" stroke={CREAM} strokeWidth={5} />
    <ellipse cx={540} cy={860} rx={150} ry={30} fill="none" stroke={ORANGE} strokeWidth={6} opacity={0.9} />
    <DrawOn d="M 470 1000 L 610 1000 M 470 984 L 470 1016 M 610 984 L 610 1016" t={t - 10} dur={10} color={SCH.dim} width={4} />
    <SchLabel x={540} y={1070} t={t - 18} text="59 KM ACROSS" size={40} color={SCH.dim} />
    <SchLabel x={540} y={1260} t={t - 26} text="10 SUNS" size={90} color={ORANGE} />
  </g>
);

export const S24: React.FC<ShotProps> = ({ t }) => {
  const h = easeOut(clamp((t - 20) / 60)) * 560;
  return (
    <g>
      <Blueprint t={t} id="s24" />
      <SchLabel x={540} y={620} t={t - 2} text="STRETCH ACROSS YOUR BODY" size={38} color={SCH.dim} />
      <CountUp x={540} y={800} t={t - 20} to={21000000} dur={46} size={110} suffix=" g" />
      <line x1={140} y1={1620} x2={940} y2={1620} stroke={SCH.dim} strokeWidth={4} />
      <rect x={260} y={1620 - 8} width={150} height={8} fill={CREAM} />
      <rect x={650} y={1620 - h} width={150} height={h} fill={ORANGE} style={{ filter: `drop-shadow(0 0 18px ${SCH.glow}66)` }} />
      <SchLabel x={335} y={1690} t={t - 4} text="EARTH: 1 g" size={34} />
      <SchLabel x={725} y={1690} t={t - 20} text="BLACK HOLE" size={34} color={ORANGE} />
    </g>
  );
};

export const S25: React.FC<ShotProps> = ({ t, len }) => {
  const pose = floatPose(t, 540, 1000, 1.3, { yaw: 0.1, ...faceAt(t, [[0, 'shock']]) });
  return (
    <g transform={camP(540, 800, kf(t, [[0, 3], [len, 3.3]]))}>
      <SpaceBg t={t} id="s25" seed={89} />
      <Glow x={540} y={1100} r={560} kind="red" o={0.5} />
      <Spacer pose={pose} id="h25" rim="rimRed" glow={0.5} />
      <g transform="translate(540 770) scale(0.45) translate(-540 -770)">
        <FocusRings x={540} y={770} t={t} r0={100} />
      </g>
    </g>
  );
};

// =============== THE GIANT ONE ===============
export const S26: React.FC<ShotProps> = ({ t, len }) => {
  const pose = floatPose(t, 540, 520, 0.4, { yaw: 0, armL: { a: 30, b: -10 }, armR: { a: 30, b: -10 }, ...faceAt(t, [[0, 'neutral']]) });
  return (
    <g transform={camP(540, 1000, kf(t, [[0, 1], [len, 1.2]]))}>
      <SpaceBg t={t} id="s26" seed={91} />
      <BlackHole x={540} y={1280} r={400} t={t} id="bh26" tilt={-9} />
      <Spacer pose={pose} id="h26" />
    </g>
  );
};

export const S27: React.FC<ShotProps> = ({ t, len }) => {
  const pulse = 1 + 0.12 * Math.sin(t / 5);
  return (
    <g transform={camP(540, 960, kf(t, [[0, 1], [len, 1.12]]))}>
      <SpaceBg t={t} id="s27" seed={97} n={140} />
      <g transform="translate(540 960) rotate(-20) scale(1.55 0.85)">
        <g transform={`rotate(${t * 0.25})`}>
          {Array.from({ length: 460 }).map((_, i) => {
            const r = 36 + Math.pow(rnd(101, i), 1.4) * 470;
            const th = Math.log(r / 36) * 2.3 + (i % 2) * Math.PI + (rnd(102, i) - 0.5) * 0.7;
            const near = 1 - clamp(r / 470);
            return <circle key={i} cx={Math.cos(th) * r} cy={Math.sin(th) * r} r={1.6 + rnd(103, i) * 4.2} fill={near > 0.55 ? '#FFE3B0' : near > 0.25 ? '#FFFFFF' : '#A8C4FF'} opacity={0.4 + rnd(104, i) * 0.6} />;
          })}
        </g>
      </g>
      <Glow x={540} y={960} r={190 * pulse} kind="warm" o={0.9} />
      <circle cx={540} cy={960} r={34 * pulse} fill="#FFF3D6" />
      <circle cx={540} cy={960} r={64} fill="none" stroke="#7FD4FF" strokeWidth={4} strokeDasharray="14 10" strokeDashoffset={-t} />
      <Pill x={540} y={1500} text="SAGITTARIUS A*" t={t - 16} />
      <Pill x={540} y={1590} text="4.3 MILLION SUNS" t={t - 24} color="#FFD27A" />
    </g>
  );
};

export const S28: React.FC<ShotProps> = ({ t, len }) => {
  const pose = floatPose(t, 540, 1000, 1.35, { yaw: 0.2, armL: { a: 74, b: -20 }, armR: { a: 74, b: -20 }, expr: 'happy', blink: 1 });
  return (
    <g transform={camP(540, 960, kf(t, [[0, 1.0], [len, 1.1]]))}>
      <SpaceBg t={t} id="s28" seed={103} />
      <BlackHole x={540} y={2250} r={980} t={t} id="bh28" disk={0.35} glow={0.6} />
      <Spacer pose={pose} id="h28" />
      <Pill x={540} y={1640} text="FELT AT THE EDGE: 0.0001 g" t={t - 16} color="#9CF0B8" />
    </g>
  );
};

export const S29: React.FC<ShotProps> = ({ t }) => {
  const n = 66 * (1 - easeIn(clamp((t - 62) / 42)));
  const pose = floatPose(t, 540, 1420, 0.85, { yaw: 0.2, ...faceAt(t, [[0, 'worried']]) });
  return (
    <g>
      <SpaceBg t={t} id="s29" seed={107} />
      <BlackHole x={540} y={2050} r={560} t={t} id="bh29" disk={0.3} />
      <Pill x={540} y={330} text="AT MOST" t={t - 40} />
      <Dial x={540} y={700} r={250} size={150} p={n / 66} readout={`${Math.round(n)}s`} />
      <Spacer pose={pose} id="h29" />
    </g>
  );
};

// =============== THE CENTRE ===============
export const S30: React.FC<ShotProps> = ({ t }) => {
  const k = easeIn(clamp(t / 56));
  const glitch = t >= 56;
  const jit = glitch ? (rnd(111, Math.floor(t / 2)) - 0.5) * 30 : 0;
  const f = (d: number) => 1 - 0.95 * k * Math.exp(-Math.pow(d / 400, 2));
  const lines = (color: string, dx: number, o: number) => (
    <g transform={`translate(${dx} 0)`} opacity={o}>
      {Array.from({ length: 19 }).map((_, i) => {
        const x0 = 540 + (i - 9) * 75;
        const pts = Array.from({ length: 33 }).map((__, j) => {
          const y = -60 + j * 65;
          return `${540 + (x0 - 540) * f(y - 960)},${y}`;
        });
        return <polyline key={`v${i}`} points={pts.join(' ')} fill="none" stroke={color} strokeWidth={3} />;
      })}
      {Array.from({ length: 28 }).map((_, i) => {
        const y0 = 960 + (i - 13) * 75;
        const pts = Array.from({ length: 19 }).map((__, j) => {
          const x = -60 + j * 65;
          return `${x},${960 + (y0 - 960) * f(x - 540)}`;
        });
        return <polyline key={`h${i}`} points={pts.join(' ')} fill="none" stroke={color} strokeWidth={3} />;
      })}
    </g>
  );
  return (
    <g transform={`translate(${jit} 0)`}>
      <rect x={-300} y={-300} width={1680} height={2520} fill="#04020A" />
      {glitch ? lines('#FF3B2E', -10, 0.6) : null}
      {glitch ? lines('#3BD9FF', 10, 0.6) : null}
      {lines(CREAM, 0, 0.75)}
      <Glow x={540} y={960} r={120 + k * 340} kind="warm" o={0.3 + 0.7 * k} />
      <circle cx={540} cy={960} r={6 + 18 * k} fill="#FFFFFF" style={{ filter: 'drop-shadow(0 0 22px #FFB15A)' }} />
      {glitch
        ? Array.from({ length: 7 }).map((_, i) => (
            <rect key={i} x={0} y={rnd(113, Math.floor(t / 2) * 7 + i) * 1920} width={1080} height={6 + rnd(114, i + Math.floor(t / 2)) * 40} fill={i % 2 ? '#FFFFFF' : '#FF3B2E'} opacity={0.35} />
          ))
        : null}
    </g>
  );
};

export const S31: React.FC<ShotProps> = ({ t, len }) => {
  const pose = floatPose(t, 540, 900 + t * 1.5, 0.3, { yaw: 0, armL: { a: 30, b: -10 }, armR: { a: 30, b: -10 }, ...faceAt(t, [[0, 'neutral']]) });
  const o = easeOut(clamp((t - 14) / 24));
  return (
    <g transform={camP(540, 1000, kf(t, [[0, 1.2], [len, 1]]))}>
      <rect x={-300} y={-300} width={1680} height={2520} fill="#030208" />
      <SpaceBg t={t} id="s31" seed={117} n={40} tint="#030208" />
      <text x={540} y={1760} textAnchor="middle" fontFamily={FONT.title} fontWeight={800} fontSize={820} fill="none" stroke="#FF9A3D" strokeWidth={10} strokeDasharray="1 22" strokeLinecap="round" opacity={0.85 * o} style={{ filter: 'drop-shadow(0 0 18px #FF8A3D)' }}>
        ?
      </text>
      <Hero look={PIP} pose={pose} rimId="rimR" shadow={0} />
    </g>
  );
};

export const S32: React.FC<ShotProps> = ({ t, len }) => {
  const pose = floatPose(t, 540, 1050, 1.4, { yaw: 0.05, ...faceAt(t, [[0, 'neutral'], [16, 'smug']]) });
  return (
    <g>
      <g transform={camP(540, 820, kf(t, [[0, 2.5], [len, 2.8]]))}>
        <SpaceBg t={t} id="s32" seed={121} />
        <BlackHole x={540} y={2000} r={500} t={t} id="bh32" />
        <Spacer pose={pose} id="h32" glow={0.85} />
      </g>
      <rect x={-300} y={-300} width={1680} height={2520} fill="#000" opacity={kf(t, [[len - 12, 0], [len - 1, 1]])} />
    </g>
  );
};
