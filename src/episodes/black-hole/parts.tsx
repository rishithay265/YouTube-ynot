import React from 'react';
import { Hero, Pose, basePose, joints, toWorld, HEAD, LOOKS, rnd, clamp, backOut, FONT, C, SCH } from '../../engine';

// Shared pieces for the black hole episode. It is a portrait episode: the world is 1080 x 1920 and the camera is camP.

export const PIP = LOOKS.pipHood;
export const MO = LOOKS.mo;

// ---------- the sky ----------
/** A deep-violet sky with a field of twinkling stars. Draws well past the frame so a zoomed camera never sees the edge. */
export const SpaceBg: React.FC<{ t: number; id: string; seed?: number; n?: number; tint?: string }> = ({ t, id, seed = 3, n = 220, tint = '#1A0D32' }) => (
  <g>
    <defs>
      <linearGradient id={`${id}sky`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#04020A" />
        <stop offset="0.6" stopColor="#0B0618" />
        <stop offset="1" stopColor={tint} />
      </linearGradient>
      <radialGradient id={`${id}neb`}>
        <stop offset="0" stopColor="#5A2A8A" stopOpacity={0.35} />
        <stop offset="1" stopColor="#5A2A8A" stopOpacity={0} />
      </radialGradient>
    </defs>
    <rect x={-900} y={-900} width={2880} height={3720} fill={`url(#${id}sky)`} />
    <circle cx={220} cy={520} r={520} fill={`url(#${id}neb)`} />
    <circle cx={900} cy={1400} r={620} fill={`url(#${id}neb)`} opacity={0.7} />
    {Array.from({ length: n }).map((_, i) => {
      const x = -700 + rnd(seed, i) * 2480;
      const y = -700 + rnd(seed + 1, i) * 3320;
      const r = 0.8 + rnd(seed + 2, i) * 2.6;
      const tw = 0.45 + 0.55 * Math.abs(Math.sin(t / (9 + rnd(seed + 3, i) * 14) + i));
      return <circle key={i} cx={x} cy={y} r={r} fill={i % 7 === 0 ? '#FFD9A8' : i % 5 === 0 ? '#BBD4FF' : '#F6F1FF'} opacity={tw * (0.35 + rnd(seed + 4, i) * 0.65)} />;
    })}
  </g>
);

/** Stars smeared into arcs round (cx, cy): bend 0 is plain dots, 1 is long arcs hugging the hole (the lensed sky). */
export const BendStars: React.FC<{ cx: number; cy: number; t: number; bend: number; minR: number; maxR: number; n?: number; seed?: number; spin?: number }> = ({
  cx, cy, t, bend, minR, maxR, n = 130, seed = 11, spin = 0.0012,
}) => (
  <g>
    {Array.from({ length: n }).map((_, i) => {
      const rho = minR + Math.pow(rnd(seed, i), 1.7) * (maxR - minR);
      const th0 = rnd(seed + 1, i) * Math.PI * 2 + t * spin * (minR / rho + 0.4);
      const len = (0.012 + bend * (0.55 * (minR / rho) + 0.06)) * (0.6 + rnd(seed + 2, i) * 0.8);
      const a = (th: number) => [cx + Math.cos(th) * rho, cy + Math.sin(th) * rho * 0.92];
      const [x0, y0] = a(th0);
      const [x1, y1] = a(th0 + len);
      const w = 1.4 + rnd(seed + 3, i) * 3.2;
      const warm = rnd(seed + 5, i) > 0.7;
      return (
        <path key={i} d={`M ${x0} ${y0} A ${rho} ${rho * 0.92} 0 0 1 ${x1} ${y1}`} stroke={warm ? '#FFD9A8' : '#E9F0FF'} strokeWidth={w} strokeLinecap="round" fill="none" opacity={0.35 + rnd(seed + 4, i) * 0.6} />
      );
    })}
  </g>
);

// ---------- the black hole ----------
/** A black hole with a tilted, glowing accretion disk. r is the dark disc's radius. */
export const BlackHole: React.FC<{ x: number; y: number; r: number; t: number; id: string; tilt?: number; disk?: number; glow?: number; ring?: boolean }> = ({
  x, y, r, t, id, tilt = -11, disk = 1, glow = 1, ring = true,
}) => {
  const bands = [
    { k: 1.32, c: '#FFF4D8', w: 0.06, o: 1 },
    { k: 1.62, c: '#FFD680', w: 0.11, o: 0.95 },
    { k: 2.05, c: '#FF9A3D', w: 0.15, o: 0.88 },
    { k: 2.65, c: '#E5521F', w: 0.17, o: 0.62 },
    { k: 3.4, c: '#8A2A3A', w: 0.2, o: 0.34 },
  ];
  const ry = 0.2;
  const ell = (clip: string) => (
    <g clipPath={clip ? `url(#${id}${clip})` : undefined}>
      {bands.map((b, i) => (
        <ellipse key={i} rx={r * b.k} ry={r * b.k * ry} fill="none" stroke={b.c} strokeWidth={r * b.w} opacity={b.o * disk} />
      ))}
      <ellipse rx={r * 2.05} ry={r * 2.05 * ry} fill="none" stroke="#FFFFFF" strokeWidth={r * 0.03} opacity={0.5 * disk} strokeDasharray={`${r * 0.5} ${r * 0.42}`} strokeDashoffset={-t * 3.2} />
      <ellipse rx={r * 1.62} ry={r * 1.62 * ry} fill="none" stroke="#FFFFFF" strokeWidth={r * 0.02} opacity={0.45 * disk} strokeDasharray={`${r * 0.3} ${r * 0.5}`} strokeDashoffset={-t * 4.6} />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y})`}>
      <defs>
        <radialGradient id={`${id}glow`}>
          <stop offset="0" stopColor="#FF9A3D" stopOpacity={0.5} />
          <stop offset="0.35" stopColor="#B83A22" stopOpacity={0.24} />
          <stop offset="1" stopColor="#2A0F3A" stopOpacity={0} />
        </radialGradient>
        <filter id={`${id}soft`} x="-30%" y="-80%" width="160%" height="260%">
          <feGaussianBlur stdDeviation={Math.max(1.5, r * 0.028)} />
        </filter>
        <clipPath id={`${id}bot`}>
          <rect x={-r * 8} y={0} width={r * 16} height={r * 8} />
        </clipPath>
      </defs>
      {glow > 0 ? <circle r={r * 5} fill={`url(#${id}glow)`} opacity={glow} /> : null}
      <g transform={`rotate(${tilt})`}>
        <g filter={`url(#${id}soft)`}>{ell('')}</g>
      </g>
      {/* the far side of the disk bent over the top and under the bottom of the hole */}
      {disk > 0 ? (
        <g filter={`url(#${id}soft)`} opacity={disk}>
          <path d={`M ${-r * 1.16} 0 A ${r * 1.16} ${r * 1.16} 0 0 1 ${r * 1.16} 0`} stroke="#FFC46A" strokeWidth={r * 0.13} fill="none" />
          <path d={`M ${-r * 1.34} 0 A ${r * 1.34} ${r * 1.34} 0 0 1 ${r * 1.34} 0`} stroke="#FF8A3D" strokeWidth={r * 0.08} fill="none" opacity={0.7} />
          <path d={`M ${-r * 1.1} 0 A ${r * 1.1} ${r * 1.1} 0 0 0 ${r * 1.1} 0`} stroke="#FF9A3D" strokeWidth={r * 0.05} fill="none" opacity={0.5} />
        </g>
      ) : null}
      <circle r={r} fill="#020104" />
      {ring ? <circle r={r * 1.025} fill="none" stroke="#FFEBC2" strokeWidth={r * 0.028} opacity={0.95} /> : null}
      {/* the near side of the disk, over the hole */}
      <g transform={`rotate(${tilt})`}>
        <g filter={`url(#${id}soft)`}>{ell('bot')}</g>
      </g>
    </g>
  );
};

// ---------- Pip in space ----------
/** A weightless pose: a slow bob, arms and legs drifting. */
export const floatPose = (t: number, x: number, y: number, scale = 1, extra: Partial<Pose> = {}): Pose => ({
  ...basePose,
  x,
  y: y + Math.sin(t / 15) * 7,
  scale,
  yaw: 0.3,
  armL: { a: 36 + Math.sin(t / 12) * 6, b: -12 },
  armR: { a: 40 + Math.cos(t / 13) * 6, b: -10 },
  legL: { a: 10 + Math.sin(t / 14) * 4, b: 14 },
  legR: { a: -8 + Math.cos(t / 11) * 4, b: 18 },
  sway: Math.sin(t / 10) * 8,
  ...extra,
});

/** A glass helmet over Pip's head, with a glint and an orange reflection of the hole from below. */
export const Helmet: React.FC<{ pose: Pose; id: string; glow?: number }> = ({ pose, id, glow = 0.55 }) => {
  const h = toWorld(pose, joints(pose).head);
  const r = (HEAD.r + 16) * pose.scale;
  const s = pose.scale;
  return (
    <g transform={`translate(${h.x} ${h.y})`}>
      <defs>
        <radialGradient id={`${id}hg`} cx="0.5" cy="0.98" r="0.85">
          <stop offset="0" stopColor="#FFB060" stopOpacity={glow} />
          <stop offset="0.55" stopColor="#FF8A3D" stopOpacity={glow * 0.12} />
          <stop offset="1" stopColor="#9CC8FF" stopOpacity={0.06} />
        </radialGradient>
      </defs>
      <circle r={r} fill={`url(#${id}hg)`} stroke="#DDEBFF" strokeOpacity={0.7} strokeWidth={4 * s} />
      <path d={`M ${-r * 0.66} ${-r * 0.4} A ${r * 0.8} ${r * 0.8} 0 0 1 ${-r * 0.12} ${-r * 0.8}`} stroke="#FFFFFF" strokeOpacity={0.8} strokeWidth={6 * s} fill="none" strokeLinecap="round" />
      <path d={`M ${r * 0.5} ${-r * 0.55} A ${r * 0.8} ${r * 0.8} 0 0 1 ${r * 0.72} ${-r * 0.2}`} stroke="#FFFFFF" strokeOpacity={0.35} strokeWidth={4 * s} fill="none" strokeLinecap="round" />
      <ellipse cx={0} cy={r * 0.94} rx={r * 0.64} ry={r * 0.15} fill="#4A4E68" stroke="#14121C" strokeWidth={3 * s} />
    </g>
  );
};

export const Spacer: React.FC<{ pose: Pose; id: string; rim?: string; glow?: number; helmet?: boolean }> = ({ pose, id, rim = 'rimR', glow, helmet = true }) => (
  <g>
    <Hero look={PIP} pose={pose} rimId={rim} shadow={0} />
    {helmet ? <Helmet pose={pose} id={id} glow={glow} /> : null}
  </g>
);

// ---------- a portrait blueprint ----------
export const Blueprint: React.FC<{ t: number; id: string; cy?: number }> = ({ t, id, cy = 900 }) => (
  <g>
    <defs>
      <pattern id={`${id}g`} width={40} height={40} patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke={SCH.grid} strokeWidth={1.5} />
      </pattern>
      <pattern id={`${id}g5`} width={200} height={200} patternUnits="userSpaceOnUse">
        <path d="M 200 0 L 0 0 0 200" fill="none" stroke={SCH.grid} strokeWidth={3} />
      </pattern>
      <radialGradient id={`${id}gl`}>
        <stop offset="0%" stopColor="#2A4466" stopOpacity={0.9} />
        <stop offset="100%" stopColor="#2A4466" stopOpacity={0} />
      </radialGradient>
    </defs>
    <rect x={-400} y={-400} width={1880} height={2720} fill={SCH.ground} />
    <circle cx={540} cy={cy} r={820} fill={`url(#${id}gl)`} />
    <g transform={`translate(${(t * 0.4) % 40} 0)`}>
      <rect x={-440} y={-400} width={1960} height={2720} fill={`url(#${id}g)`} />
      <rect x={-440} y={-400} width={1960} height={2720} fill={`url(#${id}g5)`} />
    </g>
    {[
      [70, 70, 1, 1],
      [1010, 70, -1, 1],
      [70, 1850, 1, -1],
      [1010, 1850, -1, -1],
    ].map(([x, y, sx, sy], i) => (
      <path key={i} d={`M ${x} ${y + sy * 40} L ${x} ${y} L ${x + sx * 40} ${y}`} stroke={SCH.dim} strokeWidth={3} fill="none" />
    ))}
  </g>
);

/** A small mono readout in a dark pill, for the few labels the genre allows. */
export const Pill: React.FC<{ x: number; y: number; text: string; t?: number; size?: number; color?: string; w?: number }> = ({ x, y, text, t = 99, size = 34, color = '#F6EFE3', w }) => {
  if (t < 0) return null;
  const s = backOut(clamp(t / 6));
  const ww = w ?? text.length * size * 0.62 + 56;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-ww / 2} y={-size * 0.95} width={ww} height={size * 1.7} rx={size * 0.5} fill="#0B0816" opacity={0.72} />
      <text textAnchor="middle" y={size * 0.2} fontFamily={FONT.ui} fontSize={size} fill={color} letterSpacing={2}>
        {text}
      </text>
    </g>
  );
};

// ---------- the portrait title card ----------
export const PortraitTitle: React.FC<{ t: number; y?: number }> = ({ t, y = 300 }) => {
  const pop = (d: number) => backOut(clamp((t - d) / 9));
  const pulse = t >= 34 && t < 46 ? 1 + 0.12 * Math.sin(((t - 34) / 12) * Math.PI) : 1;
  const row = (txt: string, dy: number, size: number, fill: string, d: number, sc = 1) => (
    <g transform={`translate(540 ${y + dy}) scale(${pop(d) * sc})`}>
      <text textAnchor="middle" fontFamily={FONT.title} fontWeight={d === 2 ? 600 : 700} fontSize={size} letterSpacing={d === 2 ? 4 : 0} fill={fill} stroke="#1A1230" strokeWidth={size * 0.1} paintOrder="stroke" style={d === 8 ? { filter: 'drop-shadow(0 0 22px rgba(255,138,61,0.55))' } : undefined}>
        {txt}
      </text>
    </g>
  );
  return (
    <g>
      {row('WHAT IF YOU', 0, 70, '#F6EFE3', 2)}
      {row('FELL INTO A', 128, 124, C.orange, 5)}
      {row('BLACK HOLE?', 268, 146, '#FFE27A', 8, pulse)}
    </g>
  );
};
