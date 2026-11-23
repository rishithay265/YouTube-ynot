import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { FONT } from './fonts';

export type CapWord = { w: string; s: number; e: number; p?: string };

/** How captions are chunked, timed and drawn. Every field is optional; the defaults keep the original Shorts look. */
export type CapStyle = {
  maxWords: number; // words per on-screen chunk
  maxChars: number; // a chunk's text (words joined by spaces) never grows past this many characters
  lead: number; // seconds a chunk appears before its first word is spoken
  hold: number; // seconds a chunk stays after its last word when a pause follows
  minShow: number; // a chunk is never on screen for less than this (seconds)
  size: number; // font size in px
  plate: boolean; // a dark rounded plate behind the words (readability over busy pictures and on small screens)
  bounce: number; // how hard the spoken word pops (0 = none)
  tilt: number; // degrees the spoken word tilts
  gap: number; // px between words
  balance: boolean; // split each phrase into even chunks (no orphan words, "Victim A" kept together) instead of filling greedily
  /** Uppercase the words (Latin captions). Set false for Devanagari and other scripts without case. */
  upper?: boolean;
  /** Font family override (e.g. a Devanagari face); unset uses the studio title font. */
  font?: string;
  /** Letter spacing in px. Keep 0 for Devanagari: spacing splits conjuncts and matras apart. */
  spacing?: number;
};

// hold 999: by default a chunk stays up until the next one (the original behaviour); episodes can hide captions in pauses.
const DEFAULT: CapStyle = { maxWords: 3, maxChars: 18, lead: 0.02, hold: 999, minShow: 0, size: 104, plate: false, bounce: 0.16, tilt: -1.5, gap: 26, balance: false };

/** Small words that read badly as the last word of a chunk ("GO TO THE" / "SHOP"): they move to the next chunk. */
const WEAK = new Set(['a', 'an', 'the', 'to', 'of', 'and', 'or', 'in', 'on', 'for', 'with', 'from', 'at', 'by', 'your', 'their', 'his', 'her', 'its', 'is']);

const clean = (w: string) => w.replace(/[.,!?;:।॥]+$/g, ''); // also the Devanagari danda
const textOf = (ws: CapWord[]) => ws.map((x) => clean(x.w)).join(' ');

/**
 * Group words into short on-screen chunks: up to `maxWords` words and `maxChars` characters, always breaking after
 * punctuation and never ending a chunk on a dangling small word when the break is forced by length.
 */
export const chunk = (words: CapWord[], maxWords = DEFAULT.maxWords, maxChars = DEFAULT.maxChars): CapWord[][] => {
  const out: CapWord[][] = [];
  let cur: CapWord[] = [];
  words.forEach((w, i) => {
    // Would this word push the chunk past the character budget? Then close the chunk first.
    if (cur.length > 0 && textOf([...cur, w]).length > maxChars) {
      let carry: CapWord[] = [];
      if (cur.length > 1 && WEAK.has(clean(cur[cur.length - 1].w).toLowerCase())) carry = [cur.pop() as CapWord];
      out.push(cur);
      cur = carry;
    }
    cur.push(w);
    const punct = (w.p ?? '').trim().length > 0;
    if (punct || cur.length >= maxWords || i === words.length - 1) {
      if (!punct && i < words.length - 1 && cur.length > 1 && WEAK.has(clean(cur[cur.length - 1].w).toLowerCase())) {
        const last = cur.pop() as CapWord;
        out.push(cur);
        cur = [last];
        return;
      }
      out.push(cur);
      cur = [];
    }
  });
  if (cur.length) out.push(cur);
  return out;
};

/** "Victim" + "A", "$400" + "million": pairs a chunk boundary should not split. */
const glued = (a: CapWord, b: CapWord) => /^[A-Z]$/.test(clean(b.w)) || (/^\$?\d/.test(a.w) && /^(million|billion|thousand)/i.test(b.w));

/**
 * Balanced chunking: each phrase (words up to punctuation) is split into the fewest, most even chunks that respect
 * maxWords / maxChars, with penalties for one-word chunks, chunks ending on a small word, and split pairs.
 */
export const chunkBalanced = (words: CapWord[], maxWords = DEFAULT.maxWords, maxChars = DEFAULT.maxChars): CapWord[][] => {
  const phrases: CapWord[][] = [];
  let cur: CapWord[] = [];
  words.forEach((w) => { cur.push(w); if ((w.p ?? '').trim()) { phrases.push(cur); cur = []; } });
  if (cur.length) phrases.push(cur);
  const out: CapWord[][] = [];
  for (const ph of phrases) {
    const n = ph.length;
    const best: number[] = [0, ...Array(n).fill(Infinity)];
    const from: number[] = Array(n + 1).fill(0);
    for (let i = 1; i <= n; i++) {
      for (let j = Math.max(0, i - maxWords); j < i; j++) {
        const seg = ph.slice(j, i);
        const len = textOf(seg).length;
        if (len > maxChars && seg.length > 1) continue;
        let c = 1 + 0.002 * Math.pow(Math.max(0, maxChars - len), 2);
        if (seg.length === 1 && n > 1) c += 2.5;
        if (i < n && WEAK.has(clean(seg[seg.length - 1].w).toLowerCase())) c += 1.5;
        if (i < n && glued(ph[i - 1], ph[i])) c += 6;
        if (best[j] + c < best[i]) { best[i] = best[j] + c; from[i] = j; }
      }
    }
    const cuts: number[] = [];
    for (let i = n; i > 0; i = from[i]) cuts.unshift(i);
    let a = 0;
    for (const b of cuts) { out.push(ph.slice(a, b)); a = b; }
  }
  return out;
};

/** When each chunk is on screen: [start, end) in seconds. */
const windows = (chunks: CapWord[][], st: CapStyle) =>
  chunks.map((c, i) => {
    const start = c[0].s - st.lead;
    const last = c[c.length - 1].e;
    if (i + 1 >= chunks.length) return [start, Math.max(last + Math.min(st.hold, 0.3), start + st.minShow)] as const;
    const next = chunks[i + 1][0].s - st.lead;
    const end = Math.min(next, Math.max(last + st.hold, start + st.minShow));
    return [start, end] as const;
  });

/**
 * Viral-style captions: big uppercase heavy type, a few words at a time, the word being spoken pops in the accent
 * colour. Sits at `y` (fraction of the height, the chunk's vertical centre).
 */
export const Captions: React.FC<{ words: CapWord[]; accent?: string; y?: number; size?: number; style?: Partial<CapStyle> }> = ({ words, accent = '#FFE14A', y = 0.7, size, style }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const st: CapStyle = { ...DEFAULT, ...(size ? { size } : {}), ...style };
  const t = f / fps;
  const chunks = React.useMemo(() => (st.balance ? chunkBalanced : chunk)(words, st.maxWords, st.maxChars), [words, st.maxWords, st.maxChars, st.balance]);
  const win = React.useMemo(() => windows(chunks, st), [chunks, st.lead, st.hold, st.minShow]);
  const ci = win.findIndex(([a, b]) => t >= a && t < b);
  if (ci < 0) return null;
  const c = chunks[ci];
  const ai = c.reduce((a, w, i) => (t >= w.s - 0.02 ? i : a), 0);
  const age = Math.max(0, t - win[ci][0]) * fps; // frames since this chunk appeared
  const pop = Math.min(1, age / 4);
  const chunkScale = 0.9 + 0.1 * (1 - Math.pow(1 - pop, 3));
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-start', alignItems: 'center', pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', top: `${y * 100}%`, left: 40, right: 40, display: 'flex', justifyContent: 'center', transform: `translateY(-50%) scale(${chunkScale})` }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: `0 ${st.gap}px`,
            fontFamily: st.font ?? FONT.title,
            fontWeight: st.font ? 400 : 800,
            fontSize: st.size,
            lineHeight: 1.08,
            letterSpacing: st.spacing ?? 1,
            textTransform: st.upper === false ? 'none' : 'uppercase',
            textAlign: 'center',
            ...(st.plate
              ? { background: 'rgba(4,6,14,0.78)', padding: `${st.size * 0.16}px ${st.size * 0.42}px ${st.size * 0.2}px`, borderRadius: st.size * 0.32, boxShadow: '0 10px 30px rgba(0,0,0,0.45)' }
              : {}),
          }}
        >
          {c.map((w, i) => {
            const on = i === ai && t >= w.s - 0.02;
            const wAge = Math.max(0, t - w.s) * fps;
            const bounce = on ? 1 + st.bounce * Math.exp(-wAge / 3) * Math.cos(wAge * 0.9) : 1;
            return (
              <span
                key={`${ci}-${i}`}
                style={{
                  display: 'inline-block',
                  color: on ? accent : '#FFFFFF',
                  transform: `scale(${bounce}) rotate(${on ? st.tilt : 0}deg)`,
                  WebkitTextStroke: st.plate ? `${st.size * 0.06}px #0A0612` : `${st.size * 0.14}px #0A0612`,
                  paintOrder: 'stroke fill',
                  textShadow: st.plate ? '0 4px 0 #0A0612' : '0 8px 0 #0A0612, 0 14px 28px rgba(0,0,0,0.55)',
                  filter: on && !st.plate ? `drop-shadow(0 0 22px ${accent}88)` : undefined,
                }}
              >
                {clean(w.w)}
              </span>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
