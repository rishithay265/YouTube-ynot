import React from 'react';
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, interpolate } from 'remotion';
import { P, F, Defs, Stars, Motes, clamp, ease, fin } from '../raktabija/world';
import { MetalDefs } from '../tripura/cast';
import { GitaChariot, Emblem } from './cast';

// GitaShort (1080 x 1920): one verse per chapter for Gita Jayanti. The hook on top; Kurukshetra with Krishna teaching
// Arjuna and the chapter's emblem; the verse chanted (Vāgdhenu) with its four padas lit as they are sung; then the
// English meaning while the chant repeats softly; an end card for the series. Timings (seconds) come from
// research/gita/build.py, which also mixes the audio (tanpura bed, bell, chant twice).

export type GitaDef = {
  id: string; day: number; ch: number; ref: string; chapter: string; chapter_en: string; hook: string[]; padas: string[]; meaning: string; speaker: string;
  len: number; audio: string; t: { chant: [number, number][]; meaning: [number, number]; end: number };
};
const W = 1080, H = 1920, FPS = 30;
const EN = "'Cormorant Garamond', serif";

/** Split a half-verse into its two padas at the space nearest the middle. */
const halve = (s: string): [string, string] => {
  const sp = [...s.matchAll(/ /g)].map((m) => m.index ?? 0);
  if (!sp.length) return [s, ''];
  const k = sp.reduce((a, b) => (Math.abs(b - s.length / 2) < Math.abs(a - s.length / 2) ? b : a));
  return [s.slice(0, k), s.slice(k + 1)];
};
/** Greedy word wrap by character count. */
const wrap = (s: string, n: number) => {
  const out: string[] = []; let cur = '';
  for (const w of s.split(' ')) { if ((cur + ' ' + w).trim().length > n && cur) { out.push(cur); cur = w; } else cur = (cur + ' ' + w).trim(); }
  if (cur) out.push(cur);
  return out;
};

export const GitaShort: React.FC<{ d: GitaDef }> = ({ d }) => {
  const f = useCurrentFrame();
  const s = f / FPS;
  const [c1, c2] = d.t.chant;
  const lines = [...halve(d.padas[0]), ...halve(d.padas[1])];
  // which pada is being sung: each half split in two by time
  const active = s < c1[0] ? -1 : s < c1[1] ? (s < (c1[0] + c1[1]) / 2 ? 0 : 1) : s < c2[0] ? 1.5 : s < c2[1] ? (s < (c2[0] + c2[1]) / 2 ? 2 : 3) : 9;
  const verseO = interpolate(s, [c1[0] - 0.6, c1[0], d.t.meaning[0] - 0.4, d.t.meaning[0]], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const meanO = interpolate(s, [d.t.meaning[0], d.t.meaning[0] + 0.6, d.t.end - 0.4, d.t.end], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const endO = clamp((s - d.t.end) / 0.5);
  const mean = wrap(d.meaning, 30);
  const push = 1 + 0.05 * ease(clamp(s / (d.len / FPS)));
  const teach = d.ch === 1 ? 0 : 1;
  return (
    <AbsoluteFill style={{ backgroundColor: P.abyss }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <Defs /><MetalDefs />
        <defs>
          <linearGradient id="gSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#02050E" /><stop offset="0.45" stopColor={P.navy} /><stop offset="0.62" stopColor="#3A2A40" /><stop offset="0.7" stopColor="#7A4A30" /><stop offset="1" stopColor="#02050E" />
          </linearGradient>
        </defs>
        <rect width={W} height={H} fill="url(#gSky)" />
        <Stars t={f} n={160} o={0.7} box={[0, 0, W, 900]} />
        {/* series badge and hook */}
        <text x={W / 2} y={92} textAnchor="middle" fontFamily={EN} fontSize={30} fontWeight={600} letterSpacing={6} fill={P.gold}>GITA JAYANTI · DAY {d.day} OF 18</text>
        <g opacity={fin(f, 2, 10)}>
          <text x={W / 2} y={186} textAnchor="middle" fontFamily={EN} fontSize={64} fontWeight={700} fill={P.goldHi} stroke="#02060F" strokeWidth={5} paintOrder="stroke">{d.hook[0]}</text>
          <text x={W / 2} y={262} textAnchor="middle" fontFamily={EN} fontSize={64} fontWeight={700} fill="#FF9A3A" stroke="#02060F" strokeWidth={5} paintOrder="stroke">{d.hook[1]}</text>
        </g>
        {/* Kurukshetra: the field at dawn, the armies far off, the chariot, the emblem in the sky */}
        <g transform={`translate(540 760) scale(${push}) translate(-540 -760)`}>
          <circle cx={540} cy={540} r={330} fill="url(#rkHalo)" opacity={0.35} />
          <g transform="translate(540 540) scale(1.45)"><Emblem ch={d.ch} t={f} p={fin(f, 4, 20)} /></g>
          <path d="M0 900 L1080 900" stroke={P.gold} strokeWidth={1.4} opacity={0.4} />
          <rect x={0} y={900} width={W} height={300} fill="#0A0E1E" />
          {Array.from({ length: 30 }, (_, i) => <path key={i} d={`M${20 + i * 36} 900 l6 -22 l6 22`} fill="#140A10" stroke={P.goldDim} strokeWidth={1} opacity={0.7} />)}
          <GitaChariot x={360} y={1170} s={0.86} t={f} teach={teach} low={d.ch === 1 ? 0.8 : 0} />
        </g>
        <Motes t={f} n={30} o={0.4} rise={0.2} />
        {/* the verse */}
        <rect x={0} y={1200} width={W} height={560} fill="#02050E" opacity={0.78} />
        <path d="M140 1210 L940 1210" stroke={P.gold} strokeWidth={1.4} opacity={0.5} />
        <g opacity={verseO}>
          <text x={W / 2} y={1262} textAnchor="middle" fontFamily={EN} fontSize={28} fill={P.snow} letterSpacing={4}>{d.speaker.toUpperCase()}</text>
          {lines.map((l, i) => {
            const on = Math.floor(active) === i || (active === 1.5 && i === 1);
            return <text key={i} x={W / 2} y={1350 + i * 86 + (i >= 2 ? 20 : 0)} textAnchor="middle" fontFamily={F.sanskrit} fontSize={56} fill={on ? '#FFB040' : P.goldHi} opacity={active < 0 || on || active > 3 ? 1 : 0.55} stroke="#02060F" strokeWidth={3} paintOrder="stroke">{l}</text>;
          })}
          <text x={W / 2} y={1720} textAnchor="middle" fontFamily={F.sanskrit} fontSize={34} fill={P.gold}>॥ {d.ref} ॥</text>
        </g>
        <g opacity={meanO}>
          <text x={W / 2} y={1268} textAnchor="middle" fontFamily={EN} fontSize={30} fill={P.gold} letterSpacing={4}>MEANING · BHAGAVAD GITA {d.ref}</text>
          {mean.map((l, i) => <text key={i} x={W / 2} y={1360 + i * 66 + (6 - mean.length) * 26} textAnchor="middle" fontFamily={EN} fontSize={54} fontWeight={600} fill={P.snow} stroke="#02060F" strokeWidth={3} paintOrder="stroke">{l}</text>)}
        </g>
        <text x={W / 2} y={1810} textAnchor="middle" fontFamily={F.sanskrit} fontSize={34} fill={P.goldHi}>अध्याय {d.ch} · {d.chapter}</text>
        <text x={W / 2} y={1852} textAnchor="middle" fontFamily={EN} fontSize={26} fill={P.snow} letterSpacing={3} opacity={0.8}>CHAPTER {d.ch} · {d.chapter_en.toUpperCase()}</text>
        <text x={W / 2} y={1896} textAnchor="middle" fontFamily={EN} fontSize={22} fill={P.snow} opacity={0.55}>TheGodmanFiles · chant: Vāgdhenu (IISc)</text>
        {/* end card */}
        {endO > 0 ? (
          <g opacity={endO}>
            <rect width={W} height={H} fill="#02050E" opacity={0.92} />
            <circle cx={540} cy={820} r={320} fill="url(#rkHalo)" opacity={0.6} />
            <text x={540} y={760} textAnchor="middle" fontFamily={F.deva} fontSize={110} fill={P.goldHi}>गीता जयंती</text>
            <text x={540} y={850} textAnchor="middle" fontFamily={EN} fontSize={46} fontWeight={600} fill={P.snow} letterSpacing={6}>GITA JAYANTI · 20 DECEMBER</text>
            <text x={540} y={950} textAnchor="middle" fontFamily={EN} fontSize={40} fill="#FF9A3A">18 chapters · 18 verses · 18 days</text>
            <text x={540} y={1030} textAnchor="middle" fontFamily={EN} fontSize={36} fill={P.snow}>{d.day < 18 ? `Chapter ${d.ch + 1} tomorrow` : 'हरि ॐ तत् सत्'}</text>
            <text x={540} y={1160} textAnchor="middle" fontFamily={EN} fontSize={40} fontWeight={600} letterSpacing={5} fill={P.gold}>TheGodmanFiles</text>
          </g>
        ) : null}
      </svg>
      <Audio src={staticFile(d.audio)} />
    </AbsoluteFill>
  );
};
