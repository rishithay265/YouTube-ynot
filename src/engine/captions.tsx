import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { FONT } from './fonts';

export type CapWord = { w: string; s: number; e: number; p?: string };

/** Group words into short on-screen chunks: up to `max` words, and always break after punctuation. */
const chunk = (words: CapWord[], max = 3): CapWord[][] => {
  const out: CapWord[][] = [];
  let cur: CapWord[] = [];
  words.forEach((w, i) => {
    cur.push(w);
    const punct = (w.p ?? '').trim().length > 0;
    const longRun = cur.join(' ').length > 18;
    if (punct || cur.length >= max || longRun || i === words.length - 1) {
      out.push(cur);
      cur = [];
    }
  });
  return out;
};

/**
 * Viral-style captions: big uppercase heavy type, two or three words at a time, the word being spoken pops in
 * yellow with a small bounce. Sits at `y` (fraction of the height), clear of the Shorts UI at the bottom.
 */
export const Captions: React.FC<{ words: CapWord[]; accent?: string; y?: number; size?: number }> = ({ words, accent = '#FFE14A', y = 0.7, size = 104 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  const chunks = React.useMemo(() => chunk(words), [words]);
  const ci = chunks.findIndex((c, i) => {
    const start = c[0].s;
    const end = i + 1 < chunks.length ? chunks[i + 1][0].s : c[c.length - 1].e + 0.3;
    return t >= start - 0.02 && t < end;
  });
  if (ci < 0) return null;
  const c = chunks[ci];
  const ai = c.reduce((a, w, i) => (t >= w.s - 0.02 ? i : a), 0);
  const age = Math.max(0, t - c[0].s) * fps; // frames since this chunk appeared
  const pop = Math.min(1, age / 5);
  const chunkScale = 0.86 + 0.14 * (1 - Math.pow(1 - pop, 3));
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-start', alignItems: 'center', pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          top: `${y * 100}%`,
          left: 40,
          right: 40,
          transform: `translateY(-50%) scale(${chunkScale})`,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '0 26px',
          fontFamily: FONT.title,
          fontWeight: 800,
          fontSize: size,
          lineHeight: 1.08,
          letterSpacing: 1,
          textTransform: 'uppercase',
          textAlign: 'center',
        }}
      >
        {c.map((w, i) => {
          const on = i === ai;
          const wAge = Math.max(0, t - w.s) * fps;
          const bounce = on ? 1 + 0.16 * Math.exp(-wAge / 3) * Math.cos(wAge * 0.9) : 1;
          const text = w.w.replace(/[.,!?;:]+$/g, '');
          return (
            <span
              key={`${ci}-${i}`}
              style={{
                display: 'inline-block',
                color: on ? accent : '#FFFFFF',
                transform: `scale(${bounce}) rotate(${on ? -1.5 : 0}deg)`,
                WebkitTextStroke: `${size * 0.14}px #0A0612`,
                paintOrder: 'stroke fill',
                textShadow: '0 8px 0 #0A0612, 0 14px 28px rgba(0,0,0,0.55)',
                filter: on ? `drop-shadow(0 0 22px ${accent}88)` : undefined,
              }}
            >
              {text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
