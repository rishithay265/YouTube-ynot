import React from 'react';
import { staticFile } from 'remotion';
import { ShotProps } from '../../engine';
import { P, F, W, H, Defs, Field, Stars, Motes, Drop, DustBurst, clamp, lerp, ease, easeOut, rnd, fin, cam } from './world';
import { Asura, Shakti, KaliPresence, KaliFace, KaliForm, RaktabijaFace, Gods, EmblemG, Mini, Horde, Gada, Prabha, ShaktiKind, SHAKTI } from './cast';
import script from '../../../research/raktabija/script.json';

// The scenes of "मैं रक्तबीज नहीं था". Each is a pure function of its own clock t (frames since the shot began); marks
// (d.p.m) are the local frames of words in the narration (research/raktabija/shots.py), so reveals land on the voice.
// Figures come only from cast.tsx (the cast sheet), so every shot stays consistent with it. No gore: blood is a lacquer
// drop with a gold core, the fallen come apart into gold dust. Raktabija and everyone born of his blood are
// blood-red; Kali ma is shown in her traditional form (gold line-art, red tongue, khadga and khappar, no skulls), her
// shadow arriving first, her eyes open in battle and lowered in compassion at the end.

export type Def = { id: string; cue: string; kind: string; key?: number; note?: string; p?: any };
type SP = ShotProps & { d: Def };
const mk = (d: Def, name: string, fallback: number) => (d.p?.m && d.p.m[name] !== undefined ? d.p.m[name] : fallback);
const C = script.cards;

/** Slow push-in over the shot, the film's default camera breath. */
const push = (t: number, len: number, a = 1, b = 1.06) => lerp(a, b, ease(clamp(t / Math.max(1, len))));
const Dark: React.FC<{ o: number }> = ({ o }) => (o > 0 ? <rect width={W} height={H} fill={P.abyss} opacity={o} /> : null);
const Glow: React.FC<{ x: number; y: number; r: number; o: number; c?: string }> = ({ x, y, r, o, c }) => {
  if (o <= 0) return null;
  if (!c) return <circle cx={x} cy={y} r={r} fill="url(#rkHalo)" opacity={o} />;
  const id = `gl${c.replace('#', '')}`;
  return (
    <g>
      <defs><radialGradient id={id}><stop offset="0" stopColor={c} stopOpacity={0.9} /><stop offset="0.45" stopColor={c} stopOpacity={0.35} /><stop offset="1" stopColor={c} stopOpacity={0} /></radialGradient></defs>
      <circle cx={x} cy={y} r={r} fill={`url(#${id})`} opacity={o} />
    </g>
  );
};
const Txt: React.FC<{ x: number; y: number; size: number; o?: number; fam?: string; fill?: string; anchor?: 'start' | 'middle' | 'end'; ls?: number; w?: number; children: React.ReactNode }> =
  ({ x, y, size, o = 1, fam = F.deva, fill = P.goldHi, anchor = 'middle', ls = 0, w, children }) => (
    <text x={x} y={y} fontFamily={fam} fontSize={size} fill={fill} textAnchor={anchor} opacity={o} letterSpacing={ls} fontWeight={w}>{children}</text>
  );
/** Concentric rings spreading from (x, y) every `every` frames from a: sound, echo, command. */
const Rings: React.FC<{ x: number; y: number; t: number; a: number; every?: number; n?: number; max?: number; c?: string; stop?: number; w?: number }> = ({ x, y, t, a, every = 18, n = 6, max = 900, c = P.gold, stop = 1e9, w = 2 }) => (
  <g fill="none" stroke={c}>
    {Array.from({ length: n }, (_, i) => {
      const born = a + i * every;
      if (t < born || born > stop) return null;
      const k = clamp((t - born) / 70);
      return <circle key={i} cx={x} cy={y} r={20 + k * max} strokeWidth={w * (1 - k) + 0.3} opacity={(1 - k) * 0.8} />;
    })}
  </g>
);
/** A glowing crack line in the earth. */
const Crack: React.FC<{ x: number; y: number; p: number; w?: number; seed?: number }> = ({ x, y, p, w = 420, seed = 2 }) => {
  if (p <= 0) return null;
  let d = `M${x} ${y}`;
  for (let i = 1; i <= 10; i++) d += ` L${x + (i / 10 - 0.5) * w * 2 * 0 + (rnd(seed, i) - 0.5) * 20 + (i % 2 ? 1 : -1) * (i / 10) * w} ${y + (rnd(seed + 1, i) - 0.5) * 26}`;
  return (
    <g opacity={p}>
      <path d={`M${x - w} ${y + 6} Q${x - w / 2} ${y - 10} ${x} ${y} Q${x + w / 2} ${y + 10} ${x + w} ${y - 4}`} fill="none" stroke={P.goldHi} strokeWidth={4} filter="url(#rkGlow)" strokeDasharray={`${w * 2.2 * p} 4000`} />
      <ellipse cx={x} cy={y} rx={w * 0.7 * p} ry={40 * p} fill={P.gold} opacity={0.25} filter="url(#rkBlur30)" />
    </g>
  );
};
/** A falling drop from (x, y0) to (x, y1) between frames a and a + d. */
const fallY = (t: number, a: number, d: number, y0: number, y1: number) => lerp(y0, y1, clamp((t - a) / d) ** 2);
const Medallion: React.FC<{ x: number; y: number; r: number; o: number; children: React.ReactNode; id: string }> = ({ x, y, r, o, children, id }) => (
  <g opacity={o} transform={`translate(${x} ${y})`}>
    <defs><clipPath id={`md-${id}`}><circle r={r} /></clipPath></defs>
    <circle r={r} fill={P.deep} />
    <g clipPath={`url(#md-${id})`}>{children}</g>
    <circle r={r} fill="none" stroke={P.gold} strokeWidth={3} />
    <circle r={r + 12} fill="none" stroke={P.gold} strokeWidth={1} opacity={0.5} />
  </g>
);

// ---------------------------------------------------------------- cards
const Logo: React.FC<{ x: number; y: number; s: number; o: number }> = ({ x, y, s, o }) => (
  <image href={staticFile('raktabija/logo.webp')} x={x - s / 2} y={y - s / 2} width={s} height={s} opacity={o} />
);
const OpenCard: React.FC<SP> = ({ t, len }) => {
  const o = fin(t, 4, 24) * (1 - fin(t, len - 34, 30));
  return (
    <g>
      <rect width={W} height={H} fill={P.abyss} />
      <Glow x={960} y={470} r={420} o={0.5 * o} />
      <Motes t={t} n={30} o={0.4 * o} />
      <Logo x={960} y={450} s={420 + t * 0.15} o={o} />
      <Txt x={960} y={760} size={70} fam={F.brand} w={600} ls={6} o={o}>TheGodmanFiles</Txt>
    </g>
  );
};
const LowerThird: React.FC<{ t: number; a: number }> = ({ t, a }) => {
  const o = fin(t, a, 10) * (1 - fin(t, a + 80, 10));
  if (o <= 0) return null;
  return (
    <g opacity={o}>
      <rect x={90} y={890} width={1000} height={118} fill={P.abyss} opacity={0.55} />
      <path d={`M90 890 L${90 + 1000 * easeOut(fin(t, a, 16))} 890`} stroke={P.gold} strokeWidth={2} />
      <Txt x={120} y={942} size={38} anchor="start">{C.lower_third.hi}</Txt>
      <Txt x={120} y={986} size={28} anchor="start" fam={F.brand} fill={P.snow} w={600}>{C.lower_third.en}</Txt>
    </g>
  );
};
const VerseCard: React.FC<SP> = ({ t, len }) => {
  const v = C.verse;
  const o = (k: number) => fin(t, 10 + k * 22, 24) * (1 - fin(t, len - 24, 20));
  const [l1, l2] = v.sa.split(' / ');
  return (
    <g>
      <rect width={W} height={H} fill={P.abyss} />
      <Glow x={960} y={330} r={600} o={0.35} />
      <Stars t={t} n={90} o={0.5} box={[0, 0, W, H]} />
      <path d="M760 120 L1160 120" stroke={P.gold} strokeWidth={1.5} opacity={o(0)} />
      <Txt x={960} y={214} size={62} fam={F.sanskrit} o={o(0)}>{l1}</Txt>
      <Txt x={960} y={300} size={62} fam={F.sanskrit} o={o(0)}>{l2.replace(' ॥', '')} ॥</Txt>
      <Txt x={960} y={366} size={30} fam={F.brand} fill={P.snow} o={o(1) * 0.85}>{v.iast}</Txt>
      <Txt x={960} y={480} size={40} o={o(2)}>{v.hi.slice(0, v.hi.indexOf('—') + 1)}</Txt>
      <Txt x={960} y={540} size={40} o={o(2)}>{v.hi.slice(v.hi.indexOf('—') + 2)}</Txt>
      <Txt x={960} y={624} size={32} fam={F.brand} fill={P.snow} w={500} o={o(3)}>{v.en.slice(0, v.en.indexOf(':') + 1)}</Txt>
      <Txt x={960} y={668} size={32} fam={F.brand} fill={P.snow} w={500} o={o(3)}>{v.en.slice(v.en.indexOf(':') + 2)}</Txt>
      <Txt x={960} y={760} size={34} fill={P.gold} o={o(4)}>{v.src}</Txt>
      <path d="M760 806 L1160 806" stroke={P.gold} strokeWidth={1.5} opacity={o(4)} />
      <Txt x={960} y={872} size={28} fill={P.snow} o={o(6) * 0.8}>{v.note_hi}</Txt>
      <Txt x={960} y={912} size={24} fam={F.brand} fill={P.snow} w={500} o={o(6) * 0.7}>{v.note_en}</Txt>
    </g>
  );
};
const Closing: React.FC<SP> = ({ t, len }) => {
  const o = fin(t, 6, 30);
  const [h1, h2] = C.closing.hi.split('; ');
  const [e1, e2] = C.closing.en.split('. ');
  return (
    <g>
      <rect width={W} height={H} fill={P.abyss} />
      <Glow x={960} y={360} r={420} o={0.4 * o} />
      <Motes t={t} n={30} o={0.35 * o} rise={0.25} />
      <Logo x={960} y={330} s={340} o={o} />
      <Txt x={960} y={588} size={54} fam={F.brand} w={600} ls={5} o={o}>TheGodmanFiles</Txt>
      <Txt x={960} y={700} size={36} o={fin(t, 40, 30)}>{h1};</Txt>
      <Txt x={960} y={750} size={36} o={fin(t, 40, 30)}>{h2}</Txt>
      <Txt x={960} y={826} size={28} fam={F.brand} fill={P.snow} w={500} o={fin(t, 70, 30)}>{e1}.</Txt>
      <Txt x={960} y={866} size={28} fam={F.brand} fill={P.snow} w={500} o={fin(t, 70, 30)}>{e2}</Txt>
      <Dark o={fin(t, len - 40, 36)} />
    </g>
  );
};

// ---------------------------------------------------------------- s1 जन्म
const Birth: React.FC<SP> = ({ t, len, d }) => {
  const pu = mk(d, 'push', 90);
  const rise = easeOut(clamp((t - pu + 6) / 70));
  return (
    <g transform={cam(960, 700, push(t, len, 1.05, 1.0))}>
      <Field t={t} sun={0.15} stars={0.9} dark={0.82 - 0.35 * clamp((t - pu) / 80)} horizon={760} shrines={false} />
      <Crack x={960} y={900} p={clamp((t - pu + 20) / 24)} w={360} />
      <Glow x={960} y={890} r={260} o={0.5 * clamp((t - pu) / 30) * (1 - rise * 0.6)} />
      <Asura id="birth" x={960} y={905} s={1.15} pose="empty" mark rise={rise} t={t} rim={0.4 + 0.6 * rise} />
      <DustBurst x={960} y={905} p={clamp((t - pu) / 60)} seed={4} n={60} spread={260} h={60} />
      <Motes t={t} n={24} o={0.35 * rise} />
    </g>
  );
};
const Grip: React.FC<SP> = ({ t, len, d }) => {
  const g = mk(d, 'gada', 20), r = mk(d, 'roar', 60), fi = mk(d, 'fire', 100);
  const close = easeOut(clamp((t - g + 4) / 14));
  return (
    <g>
      <Field t={t} sun={0.3} stars={0.7} dark={0.4} horizon={820} />
      <g transform={cam(960, 690, push(t, len, 1.0, 1.08))}>
        <Glow x={1000} y={560} r={230} o={0.6 * fin(t, fi - 4, 20)} c={P.ember} />
        <Asura id="grip" x={1000} y={1240} s={2.3} pose="stand" mark t={t} />
        {/* the closing fist: gold knuckle lines tighten on the shaft */}
        <g opacity={close} transform="translate(778 900)">
          {[0, 1, 2, 3].map((i) => <path key={i} d={`M-22 ${-26 + i * 15} Q0 ${-34 + i * 15} 22 ${-26 + i * 15}`} fill="none" stroke={P.goldHi} strokeWidth={3} />)}
        </g>
        <Rings x={1000} y={420} t={t} a={r} n={4} every={8} max={600} />
      </g>
      <Motes t={t} n={30} o={0.3 + 0.3 * fin(t, fi, 30)} rise={0.8} />
    </g>
  );
};
const Memory: React.FC<SP> = ({ t, len, d }) => {
  const a = mk(d, 'shumbha', 20), b = mk(d, 'army', 60), c = mk(d, 'vajra', 100);
  const fl = (m: number) => easeOut(fin(t, m - 6, 16));
  return (
    <g>
      <rect width={W} height={H} fill="url(#rkVoid)" />
      <Motes t={t} n={40} o={0.4} />
      <Medallion id="m1" x={480} y={520} r={230} o={fl(a)}>
        {/* Shumbha's command: a throne beneath a royal parasol */}
        <path d="M-120 140 L-120 30 Q-120 -10 -80 -10 L80 -10 Q120 -10 120 30 L120 140" fill="none" stroke={P.gold} strokeWidth={4} />
        <path d="M-60 -10 L-60 -110 Q0 -150 60 -110 L60 -10" fill={P.navy2} stroke={P.gold} strokeWidth={3} />
        <path d="M-150 -150 Q0 -230 150 -150 Z" fill="none" stroke={P.goldHi} strokeWidth={3} />
        <path d="M0 -150 L0 -200" stroke={P.goldHi} strokeWidth={3} />
        <Mini x={0} y={120} s={0.42} />
      </Medallion>
      <Medallion id="m2" x={960} y={520} r={230} o={fl(b)}>
        {Array.from({ length: 4 }, (_, r) => Array.from({ length: 7 }, (_, i) => (
          <Mini key={`${r}-${i}`} x={-210 + i * 70 + ((t * 0.8 + r * 20) % 70) - 35} y={-40 + r * 60} s={0.14 + r * 0.03} mace />
        )))}
      </Medallion>
      <Medallion id="m3" x={1440} y={520} r={230} o={fl(c)}>
        <EmblemG k="vajra" x={0} y={0} s={3.2} />
        <path d="M-160 -170 L-40 -40 L-80 -30 L60 140" fill="none" stroke={P.goldHi} strokeWidth={4} opacity={clamp(1 - (t - c) / 20)} filter="url(#rkGlow)" />
      </Medallion>
      <Txt x={480} y={820} size={40} o={fl(a) * 0.9}>शुंभ का आदेश</Txt>
      <Txt x={960} y={820} size={40} o={fl(b) * 0.9}>कूच करती सेनाएँ</Txt>
      <Txt x={1440} y={820} size={40} o={fl(c) * 0.9}>ऐन्द्री का वज्र</Txt>
      <Dark o={1 - fin(t, 0, 14)} />
    </g>
  );
};
const IAm: React.FC<SP> = ({ t, len, d }) => {
  const n = mk(d, 'name', 60);
  return (
    <g transform={cam(960, 560, push(t, len, 1.0, 1.05))}>
      <rect width={W} height={H} fill="url(#rkSky)" />
      <Stars t={t} n={200} o={0.9} box={[0, 0, W, H]} />
      <Glow x={960} y={300} r={520} o={0.35 + 0.4 * fin(t, n, 20)} />
      <Asura id="iam" x={960} y={1300} s={2.6} pose="raise" mark t={t} rim={0.7 + 0.3 * fin(t, n, 20)} />
      <Motes t={t} n={40} o={0.3 + 0.4 * fin(t, n, 30)} rise={0.6} />
    </g>
  );
};

// ---------------------------------------------------------------- s2 झूठा यक़ीन
const FieldWide: React.FC<SP> = ({ t, len }) => (
  <g>
    <g transform={cam(960, 540, push(t, len, 1.0, 1.04))}>
      <Field t={t} sun={1} stars={0.5} horizon={690} />
      <g transform="translate(1460 700)"><Shakti k="chandika" x={0} y={0} s={0.28} t={t} /></g>
      <Glow x={1460} y={630} r={180} o={0.5} />
      <Horde t={t} count={120} horizon={690} rows={5} per={10} x0={-60} x1={1180} nearS={0.55} nearY={1010} />
    </g>
    <LowerThird t={t} a={14} />
  </g>
);
const Bow: React.FC<SP> = ({ t, len, d }) => {
  const pull = mk(d, 'pull', 20), tw = mk(d, 'twang', 70);
  const draw = easeOut(clamp((t - pull + 4) / 30)) * (1 - easeOut(clamp((t - tw) / 6)));
  return (
    <g>
      <g transform={cam(1000, 560, push(t, len, 1.0, 1.05))}>
        <Field t={t} sun={0.8} stars={0.6} horizon={820} dark={0.15} />
        <Shakti k="chandika" x={1000} y={960} s={0.95} t={t} />
        {/* the great bow, drawn */}
        <g transform="translate(560 520)">
          <path d={`M0 -260 Q${120 + draw * 60} 0 0 260`} fill="none" stroke={P.goldHi} strokeWidth={8} filter="url(#rkGlow)" />
          <path d={`M0 -260 L${-draw * 180} 0 L0 260`} fill="none" stroke={P.goldHi} strokeWidth={2} />
        </g>
      </g>
      <Rings x={560} y={520} t={t} a={tw} n={5} every={7} max={1400} w={3} />
    </g>
  );
};
const Roar: React.FC<SP> = ({ t, len, d }) => {
  const bell = mk(d, 'bell', 30), kali = mk(d, 'kali', 70), sw = mk(d, 'swallow', 110);
  const k = easeOut(clamp((t - kali) / (sw - kali + 20)));
  return (
    <g>
      <Field t={t} sun={0.8 * (1 - k)} stars={0.5} horizon={760} />
      <g transform="translate(700 760)"><Shakti k="chandika" x={0} y={0} s={0.55} t={t} glow={1 - k * 0.6} /></g>
      <Rings x={760} y={600} t={t} a={0} n={3} every={9} max={900} />
      <g transform={`translate(1360 ${520 + Math.sin(t * 0.3) * 3})`} opacity={fin(t, bell - 4, 8) * (1 - k)}><EmblemG k="ghanta" x={0} y={0} s={4} /></g>
      <Rings x={1360} y={520} t={t} a={bell} n={4} every={10} max={900} />
      {/* Kali's roar: a darkness sweeping in and swallowing every ring */}
      <rect width={W} height={H} fill={P.abyss} opacity={0.94 * k} />
      <KaliFace x={960} y={470} s={0.85} eyes={1} tone="gold" glow={0.6} t={t} o={k * fin(t, kali + 10, 30)} />
    </g>
  );
};
const MATRIKAS: [ShaktiKind, string][] = [['brahmani', 'b'], ['maheshvari', 'm'], ['kaumari', 'k'], ['vaishnavi', 'v'], ['varahi', 'va'], ['narasimhi', 'n'], ['aindri', 'a'], ['shivaduti', 's']];
const Matrikas: React.FC<SP> = ({ t, len, d }) => {
  const marks = MATRIKAS.map(([, m], i) => mk(d, m, 30 + i * 40));
  const SP_ = 720;
  // the camera glides to each form as her name is spoken
  let cx = -SP_ * 0.5;
  for (let i = 0; i < marks.length; i++) cx = lerp(cx, i * SP_, ease(clamp((t - marks[i] + 10) / 22)));
  return (
    <g>
      <rect width={W} height={H} fill="url(#rkSky)" />
      <Stars t={t} n={160} o={0.7} />
      <g transform={`translate(${960 - cx} 0)`}>
        <path d={`M-1200 900 L${SP_ * 9} 900`} stroke={P.gold} strokeWidth={1.5} opacity={0.4} />
        {MATRIKAS.map(([k], i) => {
          const a = marks[i];
          const o = easeOut(fin(t, a - 14, 18));
          return (
            <g key={k}>
              <Shakti k={k} x={i * SP_} y={k === 'aindri' || k === 'vaishnavi' || k === 'brahmani' || k === 'maheshvari' || k === 'kaumari' ? 840 : 880} s={0.95} p={o} t={t} />
              <Txt x={i * SP_} y={1000} size={58} o={o}>{SHAKTI[k].name}</Txt>
            </g>
          );
        })}
      </g>
      <Motes t={t} n={30} o={0.35} />
    </g>
  );
};
const Scatter: React.FC<SP> = ({ t, len, d }) => {
  const br = mk(d, 'break', 60);
  return (
    <g>
      <Field t={t} sun={0.8} stars={0.4} horizon={700} />
      <Glow x={1700} y={640} r={420} o={0.7} />
      <rect x={1560} y={0} width={360} height={H} fill={P.goldHi} opacity={0.06} />
      <g transform={`translate(${t * 3.2} 0)`}>
        <Horde t={t} count={90} horizon={700} rows={5} per={9} x0={-300} x1={1200} nearS={0.5} nearY={1000}
          dust={(i) => clamp((t - br + 10 - rnd(3, i) * 30) / 40)} />
      </g>
    </g>
  );
};
const Advance: React.FC<SP> = ({ t, len, d }) => {
  const rb = mk(d, 'rb', 50);
  const k = ease(clamp(t / len));
  return (
    <g>
      <Field t={t} sun={0.6} stars={0.5} horizon={740} dark={0.1} />
      <Horde t={t} count={60} horizon={740} rows={4} per={9} nearS={0.35} nearY={900} o={0.7} />
      <Asura id="adv" x={960} y={lerp(980, 1120, k)} s={lerp(1.3, 1.9, k)} pose="stand" t={t} rim={0.8 + 0.2 * fin(t, rb, 20)} />
      <Glow x={960} y={600} r={300} o={0.25 * fin(t, rb, 20)} />
    </g>
  );
};
const Power: React.FC<SP> = ({ t, len, d }) => {
  const f = mk(d, 'fall', 40), r = mk(d, 'rise', 100);
  const y = fallY(t, f - 26, 26, 240, 880);
  return (
    <g transform={cam(960, 640, push(t, len, 1.08, 1.0))}>
      <Field t={t} sun={0.3} stars={0.7} dark={0.45} horizon={760} />
      {t < f + 2 ? <Drop x={960} y={y} s={2} /> : null}
      <Rings x={960} y={880} t={t} a={f} n={2} every={8} max={220} />
      <Crack x={960} y={880} p={clamp((t - f) / 10) * (1 - clamp((t - r - 40) / 40) * 0.6)} w={200} />
      <Asura id="pow" x={960} y={885} s={1.2} pose="stand" rise={easeOut(clamp((t - r + 10) / 50))} t={t} />
    </g>
  );
};
const Vajra: React.FC<SP> = ({ t, len, d }) => {
  const hit = mk(d, 'hit', 40), bl = mk(d, 'blood', 70), ri = mk(d, 'rise', 100);
  const bolt = clamp(1 - Math.abs(t - hit) / 6);
  return (
    <g>
      <Field t={t} sun={0.6} stars={0.5} horizon={780} dark={0.2} />
      <Shakti k="aindri" x={300} y={760} s={0.55} t={t} />
      <Asura id="vj" x={1180} y={940} s={1.75} pose="strike" wound={fin(t, hit, 6)} t={t} tilt={-6 * bolt} />
      {/* the thunderbolt */}
      <path d="M420 300 L700 350 L660 372 L1000 330 L960 352 L1180 326" fill="none" stroke={P.goldHi} strokeWidth={8 * bolt} opacity={bolt} filter="url(#rkGlowBig)" />
      {[0, 1, 2].map((i) => {
        const a = bl + i * 9;
        return t > a ? <Drop key={i} x={1170 + i * 22} y={fallY(t, a, 26, 350, 945)} s={0.8} o={clamp(1 - (t - a - 26) / 6)} /> : null;
      })}
      <Asura id="vjn" x={1460} y={1000} s={1.25} pose="stand" mark rise={easeOut(clamp((t - ri + 8) / 46))} t={t} />
      <Crack x={1460} y={1000} p={clamp((t - ri + 16) / 10) * 0.9} w={150} />
    </g>
  );
};
const Laugh: React.FC<SP> = ({ t, len, d }) => {
  const more = mk(d, 'more', 70);
  const n = Math.floor(clamp(t / len) * 10 + fin(t, more, 30) * 14);
  return (
    <g transform={cam(960, 600, push(t, len, 1.0, 1.08))}>
      <Field t={t} sun={0.5} stars={0.6} horizon={760} dark={0.15} />
      <Rings x={960} y={520} t={t} a={4} n={3} every={14} max={700} />
      <g transform={`rotate(${Math.sin(t * 0.25) * 1.2} 960 520)`}><RaktabijaFace x={960} y={470} s={1.05} t={t} rage={0.75 + 0.25 * Math.abs(Math.sin(t * 0.3))} /></g>
      <Horde t={t} count={22} horizon={860} rows={3} per={9} nearS={0.62} nearY={1120} rise={(i) => clamp((n - i) / 3)} />
    </g>
  );
};

// ---------------------------------------------------------------- s3 पहचान
const Twin: React.FC<SP> = ({ t, len, d }) => {
  const q = mk(d, 'q', 120);
  return (
    <g transform={cam(960, 470, push(t, len, 1.0, 1.1))}>
      <Field t={t} sun={0.4} stars={0.6} horizon={860} dark={0.3} />
      <Asura id="tw1" x={720} y={1300} s={2.3} pose="stand" mark t={t} />
      <Asura id="tw2" x={1220} y={1300} s={2.3} pose="stand" flip t={t} tilt={-3 * fin(t, q, 20)} />
      <Glow x={970} y={500} r={200} o={0.25 * fin(t, q, 20)} />
    </g>
  );
};
const Count: React.FC<SP> = ({ t, len, d }) => {
  const one = mk(d, 'one', 10), ten = mk(d, 'ten', 50), stop = mk(d, 'stop', 100);
  const n = t < ten ? (t > one ? 1 : 0) : t < stop ? 10 : 10 + Math.floor((t - stop) * 1.6);
  return (
    <g>
      <Field t={t} sun={0.4} stars={0.6} horizon={740} dark={0.2} />
      <Horde t={t} count={Math.max(0, n)} horizon={740} rows={6} per={14} seed={9} rise={(i) => {
        const born = i === 0 ? one : i < 10 ? ten + i * 2 : stop + (i - 10) / 1.6;
        return easeOut(clamp((t - born) / 26));
      }} />
      <Asura id="cn" x={420} y={1080} s={1.3} pose="stand" mark t={t} />
    </g>
  );
};
const Front: React.FC<SP> = ({ t, len, d }) => {
  const rb = mk(d, 'rb', 60), wd = mk(d, 'wound', 120);
  const z = lerp(1.0, 1.9, ease(clamp((t - rb + 20) / 60)));
  return (
    <g><g transform={cam(960, lerp(700, 560, ease(clamp((t - rb + 20) / 60))), z)}>
      <Field t={t} sun={0.7} stars={0.4} horizon={720} />
      <Asura id="fr" x={960} y={770} s={1.0} pose="raise" wound={fin(t, wd, 12)} t={t} rim={1} />
      <Horde t={t} count={100} horizon={760} rows={5} per={12} nearS={0.8} nearY={1150} seed={12} />
    </g>
    {/* on the wound: his face, the tilak running */}
    <g opacity={fin(t, wd - 6, 14)}>
      <rect width={W} height={H} fill={P.abyss} />
      <RaktabijaFace x={960} y={480} s={1.0} t={t} drip={fin(t, wd, 50)} />
    </g></g>
  );
};
const Touch: React.FC<SP> = ({ t, len, d }) => {
  const no = mk(d, 'none', 70);
  const reach = ease(clamp(t / 40));
  return (
    <g transform={cam(960, 330, push(t, len, 1.0, 1.06))}>
      <rect width={W} height={H} fill="url(#rkSky)" />
      <Stars t={t} n={120} o={0.6} />
      <Asura id="tc" x={960} y={1500} s={3.2} pose="empty" mark t={t} />
      {/* his hand rising to his brow */}
      <path d={`M${960 - 250} ${1500 - 3.2 * 280} Q${lerp(560, 760, reach)} ${lerp(800, 500, reach)} ${lerp(720, 930, reach)} ${lerp(820, 1500 - 3.2 * 350, reach)}`} fill="none" stroke={P.gold} strokeWidth={84} strokeLinecap="round" />
      <path d={`M${960 - 250} ${1500 - 3.2 * 280} Q${lerp(560, 760, reach)} ${lerp(800, 500, reach)} ${lerp(720, 930, reach)} ${lerp(820, 1500 - 3.2 * 350, reach)}`} fill="none" stroke="#08122D" strokeWidth={72} strokeLinecap="round" />
      <circle cx={960} cy={1500 - 3.2 * 350} r={46} fill={P.goldHi} opacity={0.3 * fin(t, no, 10) * (1 - fin(t, no + 40, 30))} filter="url(#rkBlur8)" />
    </g>
  );
};
const BloodNotBody: React.FC<SP> = ({ t, len, d }) => {
  const bo = mk(d, 'body', 60), bl = mk(d, 'blood', 140);
  return (
    <g>
      <Field t={t} sun={0.3} stars={0.7} horizon={860} dark={0.45} />
      <Asura id="bb1" x={560} y={1000} s={1.8} pose="stand" wound={1} t={t} dim={0.65 * fin(t, bo, 30)} />
      <Asura id="bb2" x={1360} y={980} s={1.5} pose="empty" mark t={t} />
      {/* from his wound, a thread of drops reaches the narrator */}
      {Array.from({ length: 12 }, (_, i) => {
        const u = clamp((t - bl - i * 4) / 50);
        if (u <= 0) return null;
        const x = lerp(560, 1360, u), y = 470 - Math.sin(u * Math.PI) * 180 + u * 120;
        return <Drop key={i} x={x} y={y} s={0.5} o={1 - clamp((u - 0.85) / 0.15)} />;
      })}
      <Glow x={1360} y={700} r={260} o={0.45 * fin(t, bl + 50, 30)} c={P.lacquer} />
    </g>
  );
};
const DropTitle: React.FC<SP> = ({ t, len, d }) => {
  const nr = mk(d, 'notrb', 60), dr = mk(d, 'drop', 130), ti = mk(d, 'title', dr + 30);
  const z = lerp(1, 6, ease(clamp((t - nr + 30) / (dr - nr + 50))));
  const tt = fin(t, ti + 8, 30);
  return (
    <g>
      <rect width={W} height={H} fill={P.abyss} />
      <g transform={cam(960, 470, z)} opacity={1 - fin(t, ti - 14, 20)}>
        <Field t={t} sun={0.2} stars={0.6} horizon={860} dark={0.6} />
        <Asura id="dt" x={960} y={1000} s={1.4} pose="empty" mark t={t} dim={0.7 * fin(t, nr, 30)} />
        <Drop x={960} y={470} s={1.4 * (0.4 + 0.6 * fin(t, nr - 20, 40))} glow={1 + fin(t, dr, 20)} />
      </g>
      <g opacity={tt}>
        <Glow x={960} y={500} r={520} o={0.4} />
        <Drop x={960} y={330} s={2.2} />
        <Txt x={960} y={560} size={124}>{script.title}</Txt>
        <path d={`M${960 - 380 * easeOut(fin(t, ti + 20, 30))} 610 L${960 + 380 * easeOut(fin(t, ti + 20, 30))} 610`} stroke={P.gold} strokeWidth={2} />
        <Txt x={960} y={672} size={42} fam={F.brand} fill={P.snow} w={600} ls={6} o={fin(t, ti + 36, 30)}>{script.title_en.toUpperCase()}</Txt>
      </g>
    </g>
  );
};

// ---------------------------------------------------------------- s4 बढ़ती सेना
const Chakra: React.FC<SP> = ({ t, len, d }) => {
  const ch = mk(d, 'chakra', 20), many = mk(d, 'many', 110);
  const u = clamp((t - ch + 24) / 30);
  return (
    <g>
      <Field t={t} sun={0.7} stars={0.5} horizon={720} />
      <Shakti k="vaishnavi" x={1640} y={720} s={0.4} t={t} />
      <g transform={`translate(${lerp(1560, 760, u)} ${lerp(470, 600, u)}) rotate(${t * 24})`} opacity={u > 0 && u < 1 ? 1 : u >= 1 ? clamp(1 - (t - ch - 6) / 10) : 0}>
        <EmblemG k="chakra" x={0} y={0} s={3} />
      </g>
      <Asura id="ck" x={760} y={920} s={1.4} pose="strike" wound={1} t={t} />
      {Array.from({ length: 8 }, (_, i) => {
        const a = ch + 6 + i * 3;
        if (t < a) return null;
        const v = (t - a) / 30;
        return <Drop key={i} x={760 + (i - 4) * 30 * v * 4} y={600 - 200 * v + 400 * v * v} s={0.5} o={clamp(1 - v)} />;
      })}
      <Horde t={t} count={120} horizon={720} rows={6} per={12} seed={21} rise={(i) => easeOut(clamp((t - many + 30 - rnd(5, i) * 40) / 30))} />
    </g>
  );
};
const WEAP: [ShaktiKind, string, 'gada' | 'spear' | 'khadga' | 'trishul'][] = [['aindri', 'a', 'gada'], ['kaumari', 'k', 'spear'], ['varahi', 'v', 'khadga'], ['maheshvari', 'm', 'trishul']];
const Weapons: React.FC<SP> = ({ t, len, d }) => (
  <g>
    <rect width={W} height={H} fill={P.abyss} />
    {WEAP.map(([k, m, e], i) => {
      const a = mk(d, m, 10 + i * 30);
      const o = fin(t, a - 6, 8);
      const x = 240 + i * 480;
      return (
        <g key={k} opacity={o}>
          <defs><clipPath id={`wp${i}`}><rect x={x - 230} y={60} width={460} height={960} /></clipPath></defs>
          <g clipPath={`url(#wp${i})`}>
            <Field t={t} sun={0.5} stars={0.5} horizon={780} dark={0.25} />
            <g transform={`translate(${x} ${420}) rotate(${-30 + 60 * easeOut(clamp((t - a) / 10))})`}><EmblemG k={e} x={0} y={0} s={2.6} /></g>
            {[0, 1, 2, 3].map((j) => <Mini key={j} x={x - 150 + j * 100} y={930} s={0.42} rise={easeOut(clamp((t - a - 8 - j * 5) / 24))} />)}
          </g>
          <rect x={x - 230} y={60} width={460} height={960} fill="none" stroke={P.gold} strokeWidth={2} />
          <Txt x={x} y={1000} size={34} o={o}>{SHAKTI[k].name}</Txt>
        </g>
      );
    })}
  </g>
);
const Fill: React.FC<SP> = ({ t, len, d }) => {
  const wd = mk(d, 'world', 100);
  const n = Math.floor(lerp(40, 260, ease(clamp(t / Math.max(1, wd + 20)))));
  return (
    <g transform={cam(960, 600, push(t, len, 1.08, 1.0))}>
      <Field t={t} sun={0.6} stars={0.5} horizon={640} />
      <Horde t={t} count={n} horizon={640} rows={9} per={20} seed={33} nearS={0.6} nearY={1080} rise={(i) => clamp((n - i) / 8)} />
    </g>
  );
};
const Echo: React.FC<SP> = ({ t, len, d }) => {
  const nm = mk(d, 'name', 80), ls = mk(d, 'less', 140);
  const fade = 1 - 0.75 * fin(t, ls, 60);
  return (
    <g>
      <rect width={W} height={H} fill="url(#rkVoid)" />
      {/* veins: gold branching lines pulsing like a heartbeat */}
      <g transform={`translate(960 540) scale(${1 + 0.02 * Math.sin(t * 0.21)})`}>
        {Array.from({ length: 9 }, (_, i) => {
          const a = (i / 9) * 6.283;
          return <path key={i} d={`M0 0 Q${Math.cos(a + 0.4) * 220} ${Math.sin(a + 0.4) * 220} ${Math.cos(a) * 520} ${Math.sin(a) * 420} M${Math.cos(a) * 300} ${Math.sin(a) * 240} Q${Math.cos(a + 0.3) * 420} ${Math.sin(a + 0.3) * 340} ${Math.cos(a + 0.25) * 640} ${Math.sin(a + 0.25) * 500}`} fill="none" stroke={P.lacquerHi} strokeWidth={3} opacity={0.5 + 0.3 * Math.sin(t * 0.21 - i)} />;
        })}
        <Drop x={0} y={0} s={2.4} />
      </g>
      <Rings x={960} y={540} t={t} a={0} every={22} n={20} max={900} c={P.lacquerHi} />
      {/* his name, called again and again, each time a little less his */}
      {Array.from({ length: 7 }, (_, i) => {
        const a = nm - 30 + i * 22;
        const u = clamp((t - a) / 60);
        if (u <= 0 || u >= 1) return null;
        return <Txt key={i} x={960} y={560} size={70 + u * 140} o={(1 - u) * 0.7 * Math.pow(fade, i * 0.6 + 1)}>रक्तबीज</Txt>;
      })}
    </g>
  );
};
const Faces: React.FC<SP> = ({ t, len, d }) => {
  const who = mk(d, 'who', 120);
  return (
    <g transform={cam(960, 540, push(t, len, 1.0, 1.12))}>
      <rect width={W} height={H} fill={P.abyss} />
      {Array.from({ length: 6 }, (_, r) => Array.from({ length: 11 }, (_, c) => {
        const s = 0.9 + r * 0.06;
        const x = 60 + c * 180 + (r % 2) * 90, y = 120 + r * 170;
        return (
          <g key={`${r}-${c}`} transform={`translate(${x} ${y}) scale(${s})`} opacity={0.5 + 0.5 * (r / 5)}>
            <circle r={44} fill="url(#rkBlood)" stroke={P.gold} strokeWidth={2.4} />
            <path d="M-46 -20 L-40 -72 L-22 -52 L0 -100 L22 -52 L40 -72 L46 -20 Z" fill="#2A1606" stroke={P.gold} strokeWidth={2.4} />
            <path d="M-28 -12 L-6 -2 M6 -2 L28 -12" stroke="#1A0604" strokeWidth={5} strokeLinecap="round" />
            <path d="M-24 0 Q-15 -5 -6 3 Q-15 6 -24 0 Z M24 0 Q15 -5 6 3 Q15 6 24 0 Z" fill="#FF5A3C" />
            <path d="M0 18 C-10 12 -24 14 -30 24 C-26 30 -20 28 -18 24 M0 18 C10 12 24 14 30 24 C26 30 20 28 18 24" stroke="#1A0604" strokeWidth={4} fill="none" strokeLinecap="round" />
            <path d="M-8 26 L-6 36 L-4 26 Z M8 26 L6 36 L4 26 Z" fill="#FFF1D2" />
          </g>
        );
      }))}
      <Dark o={0.35 * fin(t, who, 30)} />
    </g>
  );
};
const EarthMark: React.FC<SP> = ({ t, len, d }) => {
  const m = mk(d, 'mark', 80), to = mk(d, 'touch', 160);
  return (
    <g transform={cam(940, 300, push(t, len, 1.0, 1.08))}>
      <Field t={t} sun={0.3} stars={0.5} horizon={900} dark={0.4} />
      <Asura id="em" x={960} y={1500} s={3.6} pose="empty" mark t={t} />
      <Glow x={924} y={1500 - 3.6 * 246} r={180} o={0.5 * fin(t, m, 20)} c="#B07A3C" />
      <Motes t={t} n={40} o={0.5 * fin(t, to, 30)} rise={0.3} seed={17} />
    </g>
  );
};
const GodsFear: React.FC<SP> = ({ t, len, d }) => {
  const fe = mk(d, 'fear', 60), won = mk(d, 'won', 120);
  return (
    <g>
      <Field t={t} sun={0.4} stars={0.6} horizon={760} />
      <Gods t={t} o={0.55 - 0.3 * fin(t, fe, 30)} y={190} />
      <Horde t={t} count={140} horizon={760} rows={6} per={14} seed={41} nearS={0.55} />
      <Glow x={960} y={900} r={600} o={0.15 * fin(t, won, 20)} />
    </g>
  );
};

// ---------------------------------------------------------------- s5 गिरने के लिए जन्मा
const Charge: React.FC<SP> = ({ t, len, d }) => {
  const fi = mk(d, 'first', 80);
  const stride = (k: number) => Math.sin(t * 0.35 + k) * 6;
  return (
    <g>
      <Field t={t * 4} sun={0.5} stars={0.4} horizon={760} />
      <g transform={`translate(${-(t * 6) % 200} 0)`}>
        <Horde t={t * 3} count={80} horizon={760} rows={4} per={12} x0={-100} x1={2200} nearS={0.45} nearY={930} seed={51} />
      </g>
      <Asura id="ch1" x={760} y={1060 + stride(0)} s={1.4} pose="strike" mark t={t} />
      <Asura id="ch2" x={1160} y={1060 + stride(2)} s={1.4} pose="strike" t={t} rim={1} />
      <Glow x={1160} y={720} r={160} o={0.3 * fin(t, fi, 20)} />
    </g>
  );
};
const Fall: React.FC<SP> = ({ t, len, d }) => {
  const fl = mk(d, 'flash', 50), fa = mk(d, 'fall', 100), ho = mk(d, 'hold', 170);
  const tip = ease(clamp((t - fa + 10) / 30));
  const dust = clamp((t - fa) / 90);
  return (
    <g transform={cam(1000, 640, push(t, len, 1.0, 1.1))}>
      <Field t={t} sun={0.4} stars={0.5} horizon={800} dark={0.2} />
      <Shakti k="kaumari" x={300} y={760} s={0.4} t={t} />
      <path d={`M380 520 L${lerp(380, 1150, clamp((t - fl + 8) / 8))} ${lerp(520, 640, clamp((t - fl + 8) / 8))}`} stroke={P.goldHi} strokeWidth={6} opacity={clamp(1 - Math.abs(t - fl) / 10)} filter="url(#rkGlow)" />
      <Asura id="fl1" x={1160} y={980} s={1.3} pose={t > fa ? 'lower' : 'strike'} t={t} tilt={-60 * tip} dust={dust} />
      <Asura id="fl2" x={820} y={980} s={1.3} pose={t > ho - 10 ? 'hold' : 'strike'} mark t={t} />
      <Motes t={t} n={30} o={0.5 * fin(t, ho, 30)} rise={0.6} seed={23} />
    </g>
  );
};
const Words: React.FC<SP> = ({ t, len, d }) => {
  const wd = mk(d, 'words', 120);
  const txt = 'मैं रक्तबीज हूँ';
  const shown = Math.floor(clamp(t / Math.max(1, wd)) * 9);
  return (
    <g transform={cam(960, 500, push(t, len, 1.0, 1.06))}>
      <rect width={W} height={H} fill="url(#rkSky)" />
      <Stars t={t} n={120} o={0.6} />
      <Asura id="wd" x={960} y={1350} s={2.4} pose="hold" mark t={t} />
      <DustBurst x={960} y={720} p={0.3 + 0.7 * clamp(t / len)} seed={8} n={80} spread={300} h={100} />
      <Txt x={960} y={260} size={74} o={0.85 * (1 - fin(t, wd + 10, 40))}>{txt.slice(0, Math.min(txt.length, 4 + shown))}…</Txt>
    </g>
  );
};
const Wall: React.FC<SP> = ({ t, len, d }) => {
  const wl = mk(d, 'wall', 60), sh = mk(d, 'shield', 110), fr = mk(d, 'front', 200);
  return (
    <g>
      <Field t={t} sun={0.6} stars={0.5} horizon={760} />
      <Asura id="wl0" x={960} y={830} s={1.15} pose="raise" wound={1} t={t} rim={0.6 + 0.4 * fin(t, fr, 20)} />
      <Glow x={960} y={560} r={220} o={0.35 * fin(t, fr, 20)} />
      {Array.from({ length: 9 }, (_, i) => (
        <g key={i}>
          <Mini x={160 + i * 200} y={1060} s={0.85} rim={0.6 + 0.4 * fin(t, wl, 20)} />
          <g opacity={fin(t, sh + i * 3, 12)}><Drop x={160 + i * 200} y={760} s={0.9} /></g>
        </g>
      ))}
    </g>
  );
};
const Born: React.FC<SP> = ({ t, len, d }) => {
  const ri = mk(d, 'rise', 90);
  return (
    <g>
      <Field t={t} sun={0.3} stars={0.7} horizon={800} dark={0.35} />
      <Asura id="bn" x={700} y={980} s={1.4} pose="lower" mark t={t} dust={clamp((t - ri + 30) / 160) * 0.6} />
      <Asura id="bn2" x={1300} y={900} s={1.0} pose="stand" t={t} rise={easeOut(clamp((t - ri + 6) / 44))} />
      <Crack x={1300} y={900} p={clamp((t - ri + 16) / 10) * 0.8} w={120} />
    </g>
  );
};
const Ego: React.FC<SP> = ({ t, len, d }) => {
  const ma = mk(d, 'mace', 40), ind = mk(d, 'indra', 140), nw = mk(d, 'new', 240);
  return (
    <g>
      <Field t={t} sun={0.3} stars={0.6} horizon={860} dark={0.3} />
      <g transform={cam(760, 760, 1.4)}>
        <Asura id="eg" x={760} y={1300} s={2.0} pose="stand" mark t={t} rim={0.7 + 0.3 * fin(t, nw, 30)} />
      </g>
      <Medallion id="eg1" x={1400} y={420} r={220} o={fin(t, ind - 8, 20) * (1 - 0.6 * fin(t, nw - 10, 30))}>
        <rect x={-260} y={-260} width={520} height={520} fill={P.navy} />
        <path d="M-260 120 Q-120 60 0 110 Q120 60 260 120 L260 260 L-260 260 Z" fill={P.snow} opacity={0.25} />
        {[-140, -40, 60, 150].map((x, i) => (
          <g key={i} transform={`translate(${x} ${100}) scale(${0.5 + (i % 2) * 0.2})`}>
            <path d="M-60 0 L-60 -40 L-48 -40 Q-50 -150 0 -230 Q50 -150 48 -40 L60 -40 L60 0 Z" fill="#050B1D" stroke={P.gold} strokeWidth={3} />
          </g>
        ))}
        <rect x={-260} y={-260} width={520} height={520} fill={P.lacquer} opacity={0.35 * fin(t, ind + 30, 30)} />
      </Medallion>
      <Txt x={1400} y={720} size={36} o={fin(t, ind, 20) * 0.9 * (1 - 0.6 * fin(t, nw - 10, 30))}>इंद्र का स्वर्ग · यज्ञ-भाग</Txt>
    </g>
  );
};

// ---------------------------------------------------------------- s6 आदेश
const Slow: React.FC<SP> = ({ t, len, d }) => {
  const ch = mk(d, 'chandika', 60), bl = mk(d, 'blood', 200);
  const st = t * 0.3; // the world slows
  return (
    <g>
      <Field t={st} sun={0.5} stars={0.7} horizon={760} dark={0.2} />
      <Gods t={st} o={0.3} y={170} />
      <g transform="translate(1340 800)"><Shakti k="chandika" x={0} y={0} s={0.55} t={st} glow={0.6 + 0.4 * fin(t, ch, 30)} /></g>
      <KaliForm x={1700} y={900} s={0.42} eyes={1} t={st} />
      <Horde t={st} count={50} horizon={760} rows={3} per={8} x0={-60} x1={900} nearS={0.4} nearY={900} />
      <path d={`M1340 820 Q900 860 ${lerp(1340, 380, clamp((t - bl) / 60))} 900`} fill="none" stroke={P.lacquerHi} strokeWidth={3} opacity={0.8 * fin(t, bl, 10)} filter="url(#rkGlow)" />
      <Asura id="sl" x={380} y={1000} s={1.1} pose="stand" mark t={st} />
    </g>
  );
};
const Command: React.FC<SP> = ({ t, len, d }) => {
  const mo = mk(d, 'mouth', 40), sw = mk(d, 'swallow', 200), no = mk(d, 'none', 300);
  return (
    <g>
      <rect width={W} height={H} fill={P.abyss} />
      <KaliFace x={960} y={400} s={0.95} eyes={1} tone="gold" glow={0.4 + 0.3 * ease(clamp((t - mo) / 50))} t={t} />
      {Array.from({ length: 24 }, (_, i) => {
        const a = sw + i * 4;
        const u = clamp((t - a) / 50);
        if (u <= 0 || u >= 1) return null;
        return <Drop key={i} x={lerp(200 + rnd(61, i) * 1520, 960, u)} y={lerp(1000, 560, u)} s={0.6 * (1 - u * 0.7)} o={1 - u} />;
      })}
      <path d="M0 1000 L1920 1000" stroke={P.gold} strokeWidth={2} opacity={0.5 * (1 - fin(t, no, 30))} />
    </g>
  );
};
const Sentence: React.FC<SP> = ({ t, len, d }) => {
  const en = mk(d, 'end', 80);
  return (
    <g transform={cam(960, 600, push(t, len, 1.08, 1.0))}>
      <Field t={t} sun={0.2} stars={0.8} horizon={740} dark={0.3 + 0.3 * fin(t, en, 60)} />
      <Horde t={t} count={200} horizon={740} rows={8} per={18} seed={71} nearS={0.5} o={1 - 0.4 * fin(t, en, 60)} />
      <Asura id="se" x={960} y={1000} s={0.9} pose="empty" mark t={t} />
    </g>
  );
};

// ---------------------------------------------------------------- s7 काली का आगमन
const ShadowArrives: React.FC<SP> = ({ t, len, d }) => {
  const su = mk(d, 'sun', 60), nm = mk(d, 'name', 160);
  const k = ease(clamp(t / (su + 30)));
  return (
    <g>
      <Field t={t} sun={1 - k} stars={0.5} horizon={740} />
      <Horde t={t} count={80} horizon={740} rows={4} per={12} seed={81} nearS={0.45} nearY={960} />
      <g transform={`translate(${lerp(-900, 0, k)} 0)`}><KaliPresence t={t} p={0.96 * (1 - fin(t, nm - 8, 30))} eyes={fin(t, nm - 30, 14)} cx={1100} cy={420} s={1.5} /></g>
      <KaliForm x={1100} y={1010} s={0.92} eyes={1} t={t} o={fin(t, nm - 8, 30)} />
    </g>
  );
};
const Strike: React.FC<SP> = ({ t, len, d }) => {
  const bl = mk(d, 'blood', 60), mo = mk(d, 'mouth', 150);
  return (
    <g>
      <Field t={t} sun={0.1} stars={0.7} horizon={780} dark={0.3} />
      <KaliForm x={1330} y={990} s={0.72} eyes={1} t={t} />
      <g transform="translate(1600 860)"><Shakti k="chandika" x={0} y={0} s={0.42} t={t} /></g>
      <Asura id="st" x={600} y={980} s={1.55} pose="strike" wound={1} t={t} />
      <path d={`M1500 700 L${lerp(1500, 620, clamp((t - bl + 10) / 8))} ${lerp(700, 560, clamp((t - bl + 10) / 8))}`} stroke={P.goldHi} strokeWidth={5} opacity={clamp(1 - Math.abs(t - bl + 4) / 10)} filter="url(#rkGlow)" />
      {Array.from({ length: 10 }, (_, i) => {
        const a = bl + i * 5;
        const u = clamp((t - a) / (mo - bl + 20));
        if (u <= 0 || u >= 1) return null;
        // the arc never falls to earth: it ends in her khappar
        const x = lerp(600, 1330 - 252, u), y = lerp(560, 990 - 333, u) - Math.sin(u * Math.PI) * 200; // into the khappar
        return <Drop key={i} x={x} y={y} s={0.6 * (1 - u * 0.6)} o={1 - clamp((u - 0.8) / 0.2)} />;
      })}
    </g>
  );
};
const Still: React.FC<SP> = ({ t, len, d }) => {
  const sp = mk(d, 'stop', 60), si = mk(d, 'silent', 130), no = mk(d, 'none', 200);
  return (
    <g>
      <Field t={t} sun={0.1} stars={0.9} horizon={800} dark={0.4} />
      <Rings x={960} y={900} t={t} a={-40} every={20} n={20} max={700} c={P.lacquerHi} stop={sp} />
      <path d="M0 900 L1920 900" stroke={P.gold} strokeWidth={1.5} opacity={0.6 * (1 - fin(t, si, 30))} />
      {t > no ? <Drop x={960} y={fallY(t, no, 30, 300, 896)} s={0.9} o={1 - fin(t, no + 50, 20)} /> : null}
      <Asura id="sti" x={600} y={1000} s={1.1} pose="empty" mark t={t} />
    </g>
  );
};
const Roam: React.FC<SP> = ({ t, len, d }) => {
  const ro = mk(d, 'roam', 60), va = mk(d, 'vanish', 200);
  const kx = lerp(-200, 2100, clamp((t - ro + 20) / (len - ro + 40)));
  return (
    <g>
      <Field t={t} sun={0.05} stars={0.8} horizon={740} dark={0.35} />
      <Horde t={t} count={120} horizon={740} rows={5} per={13} seed={91} nearS={0.55}
        dust={(i) => 0} rise={() => 1} o={1} />
      {/* where her shadow passes, they are gone into the night */}
      <defs><linearGradient id="roamG" x1="0" x2="1"><stop offset="0" stopColor={P.abyss} stopOpacity={0.98} /><stop offset="0.8" stopColor={P.abyss} stopOpacity={0.9} /><stop offset="1" stopColor={P.abyss} stopOpacity={0} /></linearGradient></defs>
      <rect x={-200} y={0} width={kx + 200} height={H} fill="url(#roamG)" />
      <Stars t={t} n={80} o={0.8} box={[0, 600, Math.max(0, kx), 480]} seed={13} />
      <KaliForm x={kx} y={1010} s={0.72} eyes={1} t={t} />
      <Dark o={0.3 * fin(t, va, 60)} />
    </g>
  );
};
const Relief: React.FC<SP> = ({ t, len, d }) => {
  const re = mk(d, 'relief', 160);
  return (
    <g transform={cam(960, 420, push(t, len, 1.0, 1.1))}>
      <rect width={W} height={H} fill="url(#rkSky)" />
      <Stars t={t} n={160} o={0.8} />
      <Glow x={960} y={320} r={420} o={0.6 * fin(t, re, 40)} />
      <Asura id="rl" x={960} y={1400} s={2.8} pose="empty" mark t={t} rim={0.5 + 0.5 * fin(t, re, 40)} />
      <Motes t={t} n={40} o={0.6 * fin(t, re, 40)} rise={0.4} />
    </g>
  );
};
const LastStrike: React.FC<SP> = ({ t, len, d }) => {
  const hi = mk(d, 'hit', 70), np = mk(d, 'nopain', 130);
  return (
    <g>
      <Field t={t} sun={0.1} stars={0.7} horizon={800} dark={0.3} />
      <Shakti k="chandika" x={1320} y={920} s={0.78} t={t} glow={1 + 0.4 * fin(t, np, 20)} />
      <Asura id="ls" x={620} y={1000} s={1.8} pose={t < hi - 12 ? 'raise' : 'strike'} wound={1} t={t} />
      <Rings x={1080} y={560} t={t} a={hi} n={2} every={6} max={160} w={4} />
    </g>
  );
};

// ---------------------------------------------------------------- s8 स्रोत का अंत
const Rain: React.FC<SP> = ({ t, len, d }) => {
  const dr = mk(d, 'drink', 100), fa = mk(d, 'fall', 200);
  const tip = ease(clamp((t - fa + 6) / 40));
  const items: ['spear' | 'vajra' | 'khadga' | 'trishul', number][] = [['spear', 0], ['vajra', 12], ['khadga', 26], ['trishul', 40], ['spear', 54], ['vajra', 70]];
  return (
    <g>
      <Field t={t} sun={0.05} stars={0.8} horizon={820} dark={0.4} />
      <KaliForm x={1560} y={1010} s={0.75} eyes={1} t={t} />
      <Asura id="rn" x={820} y={1010} s={1.8} pose="lower" wound={1} t={t} tilt={-80 * tip} dim={0.6 * tip} />
      {items.map(([k, a], i) => {
        const u = clamp((t - a) / 22);
        if (u <= 0 || u >= 1) return null;
        return <g key={i} transform={`translate(${lerp(300 + i * 120, 900, u)} ${lerp(-60, 640, u)}) rotate(${150})`} opacity={1 - u * 0.3}><EmblemG k={k} x={0} y={0} s={1.4} /></g>;
      })}
      {Array.from({ length: 10 }, (_, i) => {
        const u = clamp((t - dr + 30 - i * 8) / 50);
        if (u <= 0 || u >= 1) return null;
        return <Drop key={i} x={lerp(820, 1560 - 262, u)} y={lerp(640, 1010 - 347, u) - Math.sin(u * Math.PI) * 160} s={0.5} o={1 - u} />;
      })}
    </g>
  );
};
const Fallen: React.FC<SP> = ({ t, len, d }) => {
  const sd = mk(d, 'stand', 120);
  return (
    <g>
      <Field t={t} sun={0.05} stars={0.9} horizon={820} dark={0.45} />
      <Asura id="fa1" x={1100} y={920} s={1.4} pose="empty" wound={1} t={0} tilt={88} dim={0.55} />
      <Asura id="fa2" x={640} y={1040} s={1.6} pose="stand" mark t={t} rim={0.6 + 0.4 * fin(t, sd, 20)} />
      <Glow x={640} y={700} r={240} o={0.3 * fin(t, sd, 20)} />
    </g>
  );
};
const Alone: React.FC<SP> = ({ t, len, d }) => {
  const q = mk(d, 'q', 130), wh = mk(d, 'what', 230);
  return (
    <g transform={cam(960, 620, push(t, len, 0.98, 1.1))}>
      <Field t={t} sun={0} stars={1} horizon={800} dark={0.3} shrines={false} />
      <Asura id="al" x={960} y={960} s={1.0} pose="empty" mark t={t} rim={0.6 + 0.4 * fin(t, q, 30)} />
      <Glow x={960} y={700} r={200} o={0.2 + 0.25 * fin(t, wh, 30)} />
      <Motes t={t} n={20} o={0.3} rise={0.2} />
    </g>
  );
};

// ---------------------------------------------------------------- s9 अंतिम क्षण
const Before: React.FC<SP> = ({ t, len, d }) => {
  const dn = mk(d, 'down', 40);
  return (
    <g>
      <rect width={W} height={H} fill={P.abyss} />
      <Stars t={t} n={120} o={0.5} box={[0, 0, W, H]} />
      <KaliForm x={1220} y={1070} s={1.0} eyes={1} t={t} />
      <Asura id="bf" x={560} y={1030} s={1.25} pose={t < dn ? 'stand' : 'empty'} mark t={t} />
      {t >= dn ? <Gada x={680} y={1030} a={lerp(180, 90, ease(clamp((t - dn) / 20)))} len={200} /> : null}
    </g>
  );
};
const Eyes: React.FC<SP> = ({ t, len, d }) => {
  const fe = mk(d, 'fierce', 60), un = mk(d, 'under', 160), ka = mk(d, 'karuna', 260);
  return (
    <g>
      <rect width={W} height={H} fill={P.abyss} />
      <g transform={cam(960, 470, lerp(1.0, 1.25, ease(clamp(t / len))))}>
        <Glow x={960} y={480} r={520} o={0.3 + 0.5 * fin(t, ka, 40)} />
        <KaliFace x={960} y={480} s={1.05} eyes={1 - ease(clamp((t - un) / (ka - un + 30)))} tone="gold" glow={0.3 + 0.4 * fin(t, fe, 20)} t={t} />
      </g>
    </g>
  );
};
const Seen: React.FC<SP> = ({ t, len, d }) => {
  const me = mk(d, 'me', 160);
  const k = ease(clamp((t - me + 20) / 40));
  return (
    <g transform={cam(lerp(960, 1200, k), lerp(600, 740, k), lerp(1, 2.4, k))}>
      <Field t={t} sun={0} stars={0.9} horizon={760} dark={0.5} />
      <Horde t={t} count={140} horizon={760} rows={6} per={14} seed={101} nearS={0.55} o={1 - 0.6 * fin(t, me - 20, 40)} />
      <Glow x={1200} y={780} r={200} o={0.7 * fin(t, me - 30, 30)} />
      <path d={`M1100 0 L1300 0 L1240 900 L1160 900 Z`} fill={P.goldHi} opacity={0.08 * fin(t, me - 30, 30)} />
      <Asura id="sn" x={1200} y={890} s={0.62} pose="empty" mark t={t} />
    </g>
  );
};
const Recog: React.FC<SP> = ({ t, len, d }) => {
  const ma = mk(d, 'maa', 140);
  return (
    <g transform={cam(960, 420, push(t, len, 1.1, 1.0))}>
      <rect width={W} height={H} fill="url(#rkSky)" />
      <Stars t={t} n={160} o={0.7} />
      <Glow x={960} y={360} r={520} o={0.3 + 0.5 * fin(t, ma, 40)} />
      <Asura id="rc" x={960} y={1500} s={3.1} pose="empty" mark t={t} rim={0.6 + 0.4 * fin(t, ma, 30)} />
      <Glow x={924} y={1500 - 3.1 * 246} r={140} o={0.6 * fin(t, ma, 30)} c="#B07A3C" />
    </g>
  );
};
const Lived: React.FC<SP> = ({ t, len, d }) => {
  const wr = mk(d, 'war', 60), dr = mk(d, 'drop', 120);
  return (
    <g>
      <rect width={W} height={H} fill={P.abyss} />
      <g transform={`translate(960 ${lerp(380, 560, ease(clamp(t / len)))})`}>
        <defs><clipPath id="livedDrop"><path d="M0 -240 Q140 -40 140 80 A140 140 0 0 1 -140 80 Q-140 -40 0 -240 Z" /></clipPath></defs>
        <path d="M0 -240 Q140 -40 140 80 A140 140 0 0 1 -140 80 Q-140 -40 0 -240 Z" fill={P.lacquer} />
        <g clipPath="url(#livedDrop)" opacity={fin(t, wr, 30)}>
          <g transform="translate(-960 -640) scale(1)"><Field t={t} sun={0.8} stars={0.4} horizon={700} /><Horde t={t} count={60} horizon={700} rows={4} per={10} nearS={0.4} nearY={900} /></g>
          <rect x={-200} y={-300} width={400} height={500} fill={P.lacquer} opacity={0.45} />
        </g>
        <path d="M0 -240 Q140 -40 140 80 A140 140 0 0 1 -140 80 Q-140 -40 0 -240 Z" fill="none" stroke={P.gold} strokeWidth={3} />
        <circle cx={-40} cy={60} r={18} fill={P.goldHi} opacity={0.6 + 0.4 * fin(t, dr, 20)} />
      </g>
    </g>
  );
};
const Purify: React.FC<SP> = ({ t, len, d }) => {
  const pu = mk(d, 'purify', 150), re = mk(d, 'realms', 220);
  return (
    <g>
      <rect width={W} height={H} fill="url(#rkSky)" />
      <Stars t={t} n={200} o={0.9} box={[0, 0, W, H]} />
      {/* the higher worlds: tiers of temple-cities above the clouds */}
      <g opacity={0.3 + 0.6 * fin(t, re, 40)}>
        {[0, 1, 2].map((r) => (
          <g key={r} transform={`translate(0 ${140 + r * 110})`} opacity={1 - r * 0.25}>
            <path d={`M0 60 Q480 ${20 + r * 10} 960 50 Q1440 ${20 + r * 10} 1920 60`} fill="none" stroke={P.snow} strokeWidth={1.5} opacity={0.5} />
            {Array.from({ length: 7 }, (_, i) => (
              <g key={i} transform={`translate(${200 + i * 260 + r * 60} 54) scale(${0.32 - r * 0.06})`}>
                <path d="M-60 0 L-60 -40 L-48 -40 Q-50 -150 0 -230 Q50 -150 48 -40 L60 -40 L60 0 Z" fill="#050B1D" stroke={P.gold} strokeWidth={4} />
              </g>
            ))}
          </g>
        ))}
      </g>
      <path d="M0 920 L1920 920" stroke={P.gold} strokeWidth={1.5} opacity={0.5} />
      {[360, 760, 1160, 1560].map((x, i) => (
        <g key={i}>
          <Mini x={x} y={920} s={0.55} dust={clamp((t - pu - i * 12) / 120)} seed={i + 3} />
          <g transform={`translate(0 ${-clamp((t - pu - i * 12) / 120) * 500})`}><Motes t={t} n={6} o={fin(t, pu + i * 12, 40)} seed={i + 30} rise={1.2} /></g>
        </g>
      ))}
    </g>
  );
};
const NoFear: React.FC<SP> = ({ t, len, d }) => {
  const nf = mk(d, 'nofear', 160);
  return (
    <g transform={cam(960, 560, push(t, len, 1.0, 1.06))}>
      <rect width={W} height={H} fill="url(#rkSky)" />
      <Stars t={t} n={200} o={0.9} box={[0, 0, W, H]} />
      <Glow x={960} y={380} r={520} o={0.25 + 0.5 * fin(t, nf, 40)} />
      <Asura id="nf" x={960} y={1060} s={1.4} pose="empty" mark t={t} tilt={-6 * ease(fin(t, nf, 60))} rim={0.6 + 0.4 * fin(t, nf, 30)} />
      <Motes t={t} n={50} o={0.6 * fin(t, nf, 40)} rise={0.6} />
    </g>
  );
};
const Final: React.FC<SP> = ({ t, len, d }) => {
  const dr = mk(d, 'drop', 120), ma = mk(d, 'maa', 200), ca = mk(d, 'caught', 260);
  const y = t < ca ? lerp(160, 780, clamp((t - dr + 40) / (ca - dr + 40)) ** 1.6) : 780;
  const hand = easeOut(fin(t, ma - 10, 40));
  return (
    <g>
      <rect width={W} height={H} fill={P.abyss} />
      <Stars t={t} n={140} o={0.6} box={[0, 0, W, H]} />
      {/* above, faintly, the mother's lowered gaze */}
      <KaliFace x={960} y={330} s={0.62} eyes={0} tone="gold" t={t} o={0.32 * fin(t, ma - 20, 50)} />
      <path d="M0 960 L1920 960" stroke={P.gold} strokeWidth={1.2} opacity={0.4} />
      {/* a cupped palm of light, just above the ground */}
      <g opacity={hand} transform="translate(960 860)">
        <Glow x={0} y={-30} r={260} o={0.5 + 0.4 * fin(t, ca, 30)} />
        <path d="M-210 -40 Q-200 60 0 70 Q200 60 210 -40 Q120 20 0 24 Q-120 20 -210 -40 Z" fill="none" stroke={P.goldHi} strokeWidth={4} filter="url(#rkGlow)" />
        {[-150, -100, -50, 50, 100, 150].map((x, i) => <path key={i} d={`M${x} ${-30 + Math.abs(x) * 0.08} Q${x * 1.05} ${-70} ${x * 1.1} ${-90 - (i % 3) * 10}`} fill="none" stroke={P.gold} strokeWidth={2} opacity={0.6} />)}
      </g>
      <Drop x={960} y={y} s={1.6} glow={1 + 2 * fin(t, ca, 30)} />
      <Motes t={t} n={40} o={0.6 * fin(t, ca, 40)} rise={0.3} />
    </g>
  );
};

// ---------------------------------------------------------------- registry
const KINDS: Record<string, React.FC<SP>> = {
  open_card: OpenCard, birth: Birth, grip: Grip, memory: Memory, iam: IAm,
  field: FieldWide, bow: Bow, roar: Roar, matrikas: Matrikas, scatter: Scatter, advance: Advance, power: Power, vajra: Vajra, laugh: Laugh,
  twin: Twin, count: Count, front: Front, touch: Touch, blood: BloodNotBody, drop: DropTitle,
  chakra: Chakra, weapons: Weapons, fill: Fill, echo: Echo, faces: Faces, mark: EarthMark, gods: GodsFear,
  charge: Charge, fall: Fall, words: Words, wall: Wall, born: Born, ego: Ego,
  slow: Slow, command: Command, sentence: Sentence,
  shadow: ShadowArrives, strike: Strike, still: Still, roam: Roam, relief: Relief, laststrike: LastStrike,
  rain: Rain, fallen: Fallen, alone: Alone,
  before: Before, eyes: Eyes, verse: VerseCard, seen: Seen, recog: Recog, lived: Lived, purify: Purify, nofear: NoFear, final: Final, closing: Closing,
};

export const buildShots = (defs: Def[]) => {
  const map: Record<string, React.FC<ShotProps>> = {};
  for (const d of defs) {
    const K = KINDS[d.kind];
    map[d.id] = (props: ShotProps) => (
      <g>
        <Defs />
        {K ? <K {...props} d={d} /> : <Txt x={960} y={540} size={40}>{d.kind}</Txt>}
      </g>
    );
  }
  return map;
};
export { Prabha };
