import React from 'react';
import { staticFile } from 'remotion';
import { ShotProps } from '../../engine';
import { P, F, W, H, Defs, Stars, Motes, DustBurst, Drop, clamp, lerp, ease, easeOut, rnd, fin, cam } from '../raktabija/world';
import { Asura, Gods, Mini } from '../raktabija/cast';
import {
  MetalDefs, METAL, Metal, City, Flame, FireLine, Embers, Shiva, Brahma, Lotus, Vishnu, Narada, Mundi, Wheel, Horse, Chariot, Bull, Ganesha, Linga, Tula,
  ThreeBodies, Clouds, MoonPushya,
} from './cast';

// The scenes of "हम त्रिपुर थे". Each is a pure function of its clock t (frames since the shot began); marks (d.p.m) are
// the local frames of words in the narration (research/tripura/shots.py), so reveals land on the voice. Figures come only
// from cast.tsx and the Raktabija cast (the brothers, Maya and Tarakasura are its Asura, in navy). The burning (s11) is
// shown as the text tells it, in fire, molten metal and ash; women are never sexualised.

export type Def = { id: string; cue: string; kind: string; key?: number; note?: string; p?: any };
type SP = ShotProps & { d: Def };
const mk = (d: Def, name: string, fallback: number) => (d.p?.m && d.p.m[name] !== undefined ? d.p.m[name] : fallback);
const push = (t: number, len: number, a = 1, b = 1.06) => lerp(a, b, ease(clamp(t / Math.max(1, len))));
const Dark: React.FC<{ o: number; c?: string }> = ({ o, c = P.abyss }) => (o > 0 ? <rect width={W} height={H} fill={c} opacity={o} /> : null);
const Glow: React.FC<{ x: number; y: number; r: number; o: number; heat?: boolean }> = ({ x, y, r, o, heat }) => (o > 0 ? <circle cx={x} cy={y} r={r} fill={heat ? 'url(#tpHeat)' : 'url(#rkHalo)'} opacity={o} /> : null);
const Txt: React.FC<{ x: number; y: number; size: number; o?: number; fam?: string; fill?: string; anchor?: 'start' | 'middle' | 'end'; ls?: number; w?: number; children: React.ReactNode }> =
  ({ x, y, size, o = 1, fam = F.deva, fill = P.goldHi, anchor = 'middle', ls = 0, w, children }) =>
    (o > 0 ? <text x={x} y={y} fontFamily={fam} fontSize={size} fill={fill} textAnchor={anchor} opacity={o} letterSpacing={ls} fontWeight={w} stroke="#02060F" strokeWidth={size > 60 ? 5 : 3} paintOrder="stroke">{children}</text> : null);
/** A name caption: Hindi above, small English below. */
const Label: React.FC<{ x: number; y: number; hi: string; en?: string; o: number; size?: number }> = ({ x, y, hi, en, o, size = 46 }) => (
  <g opacity={o}>
    <Txt x={x} y={y} size={size}>{hi}</Txt>
    {en ? <Txt x={x} y={y + size * 0.8} size={size * 0.52} fam={F.brand} fill={P.snow} w={600} ls={3}>{en}</Txt> : null}
  </g>
);
const Sky: React.FC<{ t: number; n?: number; o?: number }> = ({ t, n = 180, o = 0.9 }) => (<><rect width={W} height={H} fill="url(#rkSky)" /><Stars t={t} n={n} o={o} box={[0, 0, W, H]} /></>);
const Night: React.FC<{ t: number }> = ({ t }) => (<><rect width={W} height={H} fill={P.abyss} /><Stars t={t} n={160} o={0.6} box={[0, 0, W, H]} /></>);
const Ground: React.FC<{ y?: number; o?: number }> = ({ y = 900, o = 1 }) => (
  <g opacity={o}><rect x={0} y={y} width={W} height={H - y} fill="url(#rkGround)" /><path d={`M0 ${y} L${W} ${y}`} stroke={P.gold} strokeWidth={1.4} opacity={0.45} /></g>
);
const Rings: React.FC<{ x: number; y: number; t: number; a: number; every?: number; n?: number; max?: number; c?: string }> = ({ x, y, t, a, every = 16, n = 5, max = 700, c = P.gold }) => (
  <g fill="none" stroke={c}>
    {Array.from({ length: n }, (_, i) => {
      const born = a + i * every;
      if (t < born) return null;
      const k = clamp((t - born) / 60);
      return <circle key={i} cx={x} cy={y} r={20 + k * max} strokeWidth={2 * (1 - k) + 0.3} opacity={(1 - k) * 0.8} />;
    })}
  </g>
);
const Logo: React.FC<{ x: number; y: number; s: number; o: number }> = ({ x, y, s, o }) => (
  <image href={staticFile('raktabija/logo.webp')} x={x - s / 2} y={y - s / 2} width={s} height={s} opacity={o} />
);
const Brother: React.FC<{ k: Metal; x: number; y: number; s?: number; t: number; pose?: any; o?: number; dim?: number; flip?: boolean; label?: number }> = ({ k, x, y, s = 1, t, pose = 'stand', o = 1, dim = 0, flip, label = 0 }) => {
  const n = { gold: ['तारकाक्ष', 'TARAKAKSHA'], silver: ['कमलाक्ष', 'KAMALAKSHA'], iron: ['विद्युन्माली', 'VIDYUNMALI'] }[k];
  return (
    <g opacity={o}>
      <circle cx={x} cy={y - 300 * s} r={260 * s} fill={METAL[k].line} opacity={0.12} filter="url(#rkBlur30)" />
      <Asura id={`br-${k}-${x}`} x={x} y={y} s={s} pose={pose} tone="navy" fierce t={t} dim={dim} flip={flip} />
      <Label x={x} y={y + 60} hi={n[0]} en={n[1]} o={label} size={40} />
    </g>
  );
};
const X = (k: number) => [460, 960, 1460][k];
const METALS: Metal[] = ['gold', 'silver', 'iron'];

// ---------------------------------------------------------------- cards
const OpenCard: React.FC<SP> = ({ t, len }) => {
  const o = fin(t, 4, 24) * (1 - fin(t, len - 30, 26));
  return (
    <g>
      <rect width={W} height={H} fill={P.abyss} />
      <Glow x={960} y={460} r={420} o={0.5 * o} />
      <Motes t={t} n={30} o={0.4 * o} />
      <Logo x={960} y={440} s={400 + t * 0.15} o={o} />
      <Txt x={960} y={750} size={68} fam={F.brand} w={600} ls={6} o={o}>TheGodmanFiles</Txt>
    </g>
  );
};
const TitleCard: React.FC<SP> = ({ t, len }) => {
  const o = fin(t, 6, 24) * (1 - fin(t, len - 24, 20));
  return (
    <g>
      <rect width={W} height={H} fill={P.abyss} />
      <Stars t={t} n={200} o={0.7} box={[0, 0, W, H]} />
      {METALS.map((k, i) => <City key={k} id={`tc${k}`} k={k} x={480 + i * 480} y={260 + Math.sin(t * 0.03 + i * 2) * 10} s={0.34} t={t} o={0.85 * o} spin={0.6} />)}
      <Txt x={960} y={660} size={190} o={o}>हम त्रिपुर थे</Txt>
      <path d={`M${960 - 380 * easeOut(fin(t, 14, 30))} 712 L${960 + 380 * easeOut(fin(t, 14, 30))} 712`} stroke={P.gold} strokeWidth={2} opacity={o} />
      <Txt x={960} y={776} size={40} fam={F.brand} fill={P.snow} w={600} ls={8} o={fin(t, 24, 24) * o}>WE WERE TRIPURA</Txt>
      <Txt x={960} y={880} size={30} fill={P.snow} o={fin(t, 40, 24) * o * 0.85}>शिव महापुराण, रुद्रसंहिता, युद्धखण्ड १–१२ · प्रवचन: श्री चागंटि कोटेश्वर राव गारु</Txt>
      <Txt x={960} y={924} size={24} fam={F.brand} fill={P.snow} w={500} o={fin(t, 40, 24) * o * 0.7}>Shiva Mahapurana (Gita Press), Rudra Samhita, Yuddha Khanda 1–12 · after the pravachan of Sri Chaganti Koteswara Rao garu</Txt>
    </g>
  );
};
const Closing: React.FC<SP> = ({ t, len }) => {
  const o = fin(t, 6, 30);
  return (
    <g>
      <rect width={W} height={H} fill={P.abyss} />
      <Glow x={960} y={330} r={420} o={0.4 * o} />
      <Motes t={t} n={30} o={0.35 * o} rise={0.25} />
      <Logo x={960} y={300} s={320} o={o} />
      <Txt x={960} y={548} size={52} fam={F.brand} w={600} ls={5} o={o}>TheGodmanFiles</Txt>
      <Txt x={960} y={660} size={40} o={fin(t, 30, 30)}>त्रिपुरारी पूर्णिमा: कार्तिक पूर्णिमा पर जलते दीप</Txt>
      <Txt x={960} y={712} size={26} fam={F.brand} fill={P.snow} w={500} o={fin(t, 30, 30) * 0.8}>Tradition keeps Kartika Purnima as Tripurari Purnima. The Purana's own clock: midday, Abhijit, the moon in Pushya.</Txt>
      {Array.from({ length: 9 }, (_, i) => <Flame key={i} x={600 + i * 90} y={860} h={36} t={t + i * 9} seed={i} o={fin(t, 50 + i * 6, 20)} />)}
      {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${580 + i * 90} 864 L${620 + i * 90} 864 L${612 + i * 90} 880 L${588 + i * 90} 880 Z`} fill={P.goldDeep} opacity={fin(t, 50 + i * 6, 20)} />)}
      <Txt x={960} y={970} size={26} fill={P.snow} o={fin(t, 90, 30) * 0.8}>ॐ नमः शिवाय</Txt>
      <Dark o={fin(t, len - 40, 36)} />
    </g>
  );
};

// ---------------------------------------------------------------- s1
/** The three cities in the night sky. mode intro: each appears on its word; orbit: they circle; laugh: they shake with laughter. */
const Sky3: React.FC<SP> = ({ t, len, d }) => {
  const mode = d.p?.mode ?? 'intro';
  const a = [mk(d, 'gold', 20), mk(d, 'silver', 60), mk(d, 'iron', 100)];
  return (
    <g transform={cam(960, 540, push(t, len, 1, 1.05))}>
      <Sky t={t} />
      {METALS.map((k, i) => {
        const orbit = mode === 'orbit' ? (t * 0.012 + i * 2.1) : 0;
        const x = mode === 'orbit' ? 960 + Math.cos(orbit) * 560 : X(i);
        const y = mode === 'orbit' ? 440 + Math.sin(orbit) * 140 : 420 + (i - 1) * 40 + Math.sin(t * 0.03 + i) * 12;
        const s = mode === 'orbit' ? 0.36 + 0.12 * (Math.sin(orbit) + 1) / 2 : 0.46;
        const o = mode === 'intro' ? easeOut(fin(t, a[i] - 6, 24)) : 1;
        return <City key={k} id={`s3${k}${d.id}`} k={k} x={x} y={y} s={s} t={t} o={o} spin={mode === 'orbit' ? 1 : 0.5} />;
      })}
      {mode === 'orbit' ? <Txt x={960} y={980} size={40} o={fin(t, mk(d, 'see', 60), 20) * 0.9} fill={P.snow}>ताकि सब देखें</Txt> : null}
    </g>
  );
};
const Names: React.FC<SP> = ({ t, len, d }) => {
  const tri = mk(d, 'tri', 60), ari = mk(d, 'ari', 140);
  return (
    <g>
      <Night t={t} />
      <Glow x={960} y={430} r={500} o={0.3 * fin(t, tri, 30)} />
      <Txt x={960} y={480} size={230} o={easeOut(fin(t, tri - 4, 20))}>त्रिपुर</Txt>
      <Txt x={960} y={560} size={36} fam={F.brand} fill={P.snow} w={600} ls={6} o={fin(t, tri + 10, 20)}>TRIPURA · THE THREE CITIES</Txt>
      <Txt x={960} y={820} size={150} fill="#FF9A3A" o={easeOut(fin(t, ari - 4, 20))}>त्रिपुरारि</Txt>
      <Txt x={960} y={882} size={32} fam={F.brand} fill={P.snow} w={600} ls={6} o={fin(t, ari + 10, 20)}>TRIPURARI · ENEMY OF THE CITIES</Txt>
    </g>
  );
};
const Question: React.FC<SP> = ({ t, len, d }) => {
  const q = mk(d, 'q', 100);
  return (
    <g transform={cam(960, 540, push(t, len))}>
      <Sky t={t} />
      <Ground y={940} />
      <Asura id="qa" x={560} y={950} s={0.9} pose="stand" tone="navy" fierce t={t} />
      <City id="qc" k="gold" x={1340} y={560} s={0.6} t={t} />
      <Txt x={960} y={240} size={200} fill={P.goldHi} o={easeOut(fin(t, q - 6, 18))}>?</Txt>
    </g>
  );
};
const Listen: React.FC<SP> = ({ t, len, d }) => (
  <g transform={cam(960, 540, push(t, len, 1, 1.25))}>
    <Night t={t} />
    <Glow x={960} y={540} r={300} o={0.5} />
    <Motes t={t} n={60} o={0.6} rise={0.2} />
    <Txt x={960} y={560} size={70} o={fin(t, mk(d, 'where', 60) - 10, 20) * 0.9}>हम कहाँ हैं?</Txt>
  </g>
);

// ---------------------------------------------------------------- s2
const Taraka: React.FC<SP> = ({ t, len, d }) => {
  const boon = mk(d, 'boon', 80), kama = mk(d, 'kama', 200);
  return (
    <g transform={cam(960, 540, push(t, len))}>
      <Sky t={t} />
      <Ground />
      <Asura id="tk0" x={560} y={920} s={1.35} pose="raise" tone="navy" fierce t={t} />
      <Label x={560} y={990} hi="तारकासुर" en="TARAKASURA" o={fin(t, 10, 20)} />
      {/* the boon: "only Shiva's son" */}
      <Txt x={1320} y={300} size={52} o={fin(t, boon, 20)}>“मुझे केवल शिव का पुत्र मारे”</Txt>
      {/* Kama burnt: Shiva in tapas, a burst of fire where Kama stood */}
      <g opacity={fin(t, kama - 30, 30)}>
        <Shiva x={1320} y={900} s={0.8} pose="sit" t={t} eye={fin(t, kama, 10)} anger={0.6} glow={0.3} />
        {t > kama ? <g><Glow x={1560} y={720} r={200} o={(1 - fin(t, kama + 20, 40)) * 0.9} heat /><DustBurst x={1560} y={840} p={fin(t, kama, 50)} seed={4} n={60} spread={120} h={300} /></g> : null}
        <Txt x={1560} y={600} size={36} fill={P.snow} o={fin(t, kama, 20) * (1 - fin(t, kama + 60, 20))}>कामदेव</Txt>
      </g>
    </g>
  );
};
const Skanda: React.FC<SP> = ({ t, len, d }) => {
  const kill = mk(d, 'kill', 50);
  const sx = lerp(1700, 760, easeOut(fin(t, kill - 30, 28)));
  return (
    <g>
      <Sky t={t} />
      <Ground />
      <Asura id="tk1" x={620} y={920} s={1.35} pose="strike" tone="navy" fierce t={t} dust={fin(t, kill, 40)} />
      {/* Skanda's spear of light */}
      <path d={`M${sx + 300} 380 L${sx} 520`} stroke={P.goldHi} strokeWidth={10} strokeLinecap="round" filter="url(#rkGlow)" />
      <path d={`M${sx} 520 L${sx + 40} 480 L${sx + 20} 530 Z`} fill={P.goldHi} />
      {/* peacock feather eyes */}
      {Array.from({ length: 6 }, (_, i) => <circle key={i} cx={1500 + i * 50} cy={260 + Math.sin(i) * 30} r={12} fill="#1E8A7A" stroke={P.goldHi} strokeWidth={3} opacity={fin(t, 0, 20)} />)}
      <Label x={1600} y={180} hi="स्कंद" en="SKANDA" o={fin(t, 4, 16)} />
    </g>
  );
};
const Sons: React.FC<SP> = ({ t, len, d }) => {
  const a = [mk(d, 'tk', 40), mk(d, 'km', 120), mk(d, 'vm', 80)];
  return (
    <g transform={cam(960, 560, push(t, len))}>
      <Sky t={t} />
      <Ground y={940} />
      {METALS.map((k, i) => <Brother key={k} k={k} x={X(i)} y={940} s={0.95} t={t} o={easeOut(fin(t, a[i] - 6, 20))} label={fin(t, a[i], 16)} />)}
    </g>
  );
};
const NoLearn: React.FC<SP> = ({ t, len, d }) => (
  <g transform={cam(960, 560, push(t, len, 1.04, 1))}>
    <Sky t={t} />
    <Ground y={940} />
    {/* the father's shadow behind them */}
    <g opacity={0.25}><Asura id="nlf" x={960} y={940} s={2.0} pose="lower" tone="navy" fierce t={t} dim={0.6} /></g>
    {METALS.map((k, i) => <Brother key={k} k={k} x={X(i)} y={940} s={0.85} t={t} pose={i === 1 ? 'raise' : 'stand'} />)}
    <Txt x={960} y={180} size={64} o={fin(t, mk(d, 'bigger', 120), 20)}>वर और बड़ा माँगो</Txt>
  </g>
);
const Prahlada: React.FC<SP> = ({ t, len, d }) => {
  const n = mk(d, 'narada', 50), ours = mk(d, 'ours', 120);
  return (
    <g>
      <Night t={t} />
      {/* the child in the womb, a circle of light; Narada's veena */}
      <g opacity={1 - fin(t, ours, 24) * 0.6}>
        <Glow x={640} y={520} r={260} o={0.8} />
        <circle cx={640} cy={520} r={150} fill="none" stroke={P.goldHi} strokeWidth={3} />
        <path d="M600 560 Q580 500 620 470 Q660 450 680 490 Q700 540 660 580 Q630 600 600 560 Z" fill="#0B1736" stroke={P.goldHi} strokeWidth={3} />
        <Narada x={1000} y={900} s={0.8} t={t} o={fin(t, n - 10, 20)} talk={1} />
        <Label x={640} y={760} hi="प्रह्लाद" en="PRAHLADA" o={fin(t, 6, 16)} />
      </g>
      <g opacity={fin(t, ours, 20)}>
        {METALS.map((k, i) => <Brother key={k} k={k} x={1300 + i * 200} y={940} s={0.55} t={t} flip />)}
      </g>
    </g>
  );
};
const Tapas: React.FC<SP> = ({ t, len, d }) => {
  const f = mk(d, 'foot', 80), a = mk(d, 'air', 150), h = mk(d, 'head', 210);
  const phase = t < a ? 0 : t < h ? 1 : 2;
  const yrs = phase === 0 ? '१०० वर्ष · एक पैर पर' : phase === 1 ? '१००० वर्ष · केवल वायु' : '१००० वर्ष · सिर के बल';
  return (
    <g>
      <rect width={W} height={H} fill={P.abyss} />
      {/* Meru's cave */}
      <path d="M0 1080 L0 300 Q300 120 600 220 Q960 60 1320 220 Q1620 120 1920 300 L1920 1080 Z" fill="#050A1A" stroke={P.goldDim} strokeWidth={3} />
      <path d="M520 1080 Q520 520 960 480 Q1400 520 1400 1080 Z" fill="#02050E" stroke={P.gold} strokeWidth={2} opacity={0.7} />
      <Glow x={960} y={760} r={400} o={0.25} />
      {METALS.map((k, i) => (
        <g key={k} transform={phase === 2 ? `rotate(180 ${760 + i * 200} 720)` : undefined}>
          <Asura id={`tp${k}`} x={760 + i * 200} y={phase === 2 ? 520 : 940} s={0.62} pose={phase === 0 ? 'raise' : 'rest'} tone="navy" fierce={false} t={t} />
        </g>
      ))}
      <Txt x={960} y={200} size={56} o={fin(t, f - 6, 16)}>{yrs}</Txt>
      <Motes t={t} n={30} o={0.4} rise={0.2} />
    </g>
  );
};
const BrahmaAppears: React.FC<SP> = ({ t, len, d }) => (
  <g transform={cam(960, 560, push(t, len, 1.08, 1))}>
    <Sky t={t} />
    <Glow x={960} y={500} r={600} o={0.6 * fin(t, mk(d, 'b', 10), 30)} />
    <Brahma x={960} y={940} s={1.0} t={t} o={easeOut(fin(t, mk(d, 'b', 10) - 6, 30))} />
  </g>
);

// ---------------------------------------------------------------- s3
const Ask: React.FC<SP> = ({ t, len, d }) => (
  <g transform={cam(960, 560, push(t, len))}>
    <Sky t={t} />
    <Ground y={960} />
    <Brahma x={1420} y={960} s={0.85} t={t} />
    {METALS.map((k, i) => <Asura key={k} id={`ak${k}`} x={360 + i * 220} y={960} s={0.7} pose="raise" tone="navy" fierce t={t} />)}
    <Txt x={640} y={200} size={56} o={fin(t, 20, 20)}>“हमें कोई न मारे”</Txt>
    <Txt x={640} y={280} size={44} fill={P.snow} o={fin(t, mk(d, 'death', 100), 20)}>न बुढ़ापा, न मृत्यु</Txt>
  </g>
);
const Atma: React.FC<SP> = ({ t, len, d }) => {
  const body = mk(d, 'body', 80), choose = mk(d, 'choose', 190);
  const crumble = fin(t, body + 10, 70);
  return (
    <g>
      <Night t={t} />
      <Brahma x={360} y={980} s={0.7} t={t} />
      {/* the body crumbles; the flame within stays */}
      <g transform="translate(1180 960)">
        <path d="M-60 0 L-50 -200 L-100 -210 L-110 -380 Q-70 -420 -30 -420 L-24 -440 A46 46 0 1 1 24 -440 L30 -420 Q70 -420 110 -380 L100 -210 L50 -200 L60 0 Z" fill="#0B1736" stroke={P.gold} strokeWidth={3} opacity={1 - crumble} />
        <DustBurst x={0} y={-200} p={crumble} seed={8} n={80} spread={140} h={420} />
        <Flame x={0} y={-270} h={70} t={t} seed={2} />
        <Glow x={0} y={-300} r={120} o={0.6} />
      </g>
      <Txt x={1180} y={180} size={48} o={fin(t, 10, 20)}>आत्मा नहीं मरती</Txt>
      <Txt x={1180} y={250} size={40} fill={P.snow} o={fin(t, body, 20)}>देह को जाना ही है</Txt>
      <Txt x={760} y={1040} size={40} o={fin(t, choose, 20)}>अपनी मृत्यु का कारण चुन लो</Txt>
    </g>
  );
};
const Mock: React.FC<SP> = ({ t, len, d }) => {
  const lotus = mk(d, 'lotus', 80), go = mk(d, 'go', 160);
  const shake = Math.sin(t * 0.9) * 4;
  return (
    <g transform={cam(960, 560, push(t, len))}>
      <Sky t={t} />
      <Ground y={960} />
      {METALS.map((k, i) => <g key={k} transform={`translate(0 ${shake * (i % 2 ? 1 : -1)})`}><Asura id={`mk${k}`} x={400 + i * 220} y={960} s={0.8} pose="raise" tone="navy" fierce t={t} /></g>)}
      <Lotus x={1400} y={760} s={1.6} o={1 - 0.6 * fin(t, go, 40)} />
      <Txt x={1400} y={300} size={80} o={fin(t, 6, 16)}>सरसिज-सुत!</Txt>
      <Txt x={1400} y={380} size={36} fam={F.brand} fill={P.snow} w={600} ls={3} o={fin(t, lotus, 16)}>LOTUS-BORN!</Txt>
      <Txt x={1400} y={460} size={44} fill={P.snow} o={fin(t, go - 30, 20)}>तुम भी जाओगे</Txt>
    </g>
  );
};
const BigHeart: React.FC<SP> = ({ t, len, d }) => (
  <g>
    <Night t={t} />
    <Glow x={960} y={500} r={lerp(300, 620, fin(t, 0, len))} o={0.5} />
    <Brahma x={960} y={940} s={0.9} t={t} />
    <Txt x={960} y={160} size={56} o={fin(t, mk(d, 'bhishma', 60), 20)}>इच्छा-मृत्यु</Txt>
    <Txt x={960} y={230} size={36} fill={P.snow} o={fin(t, mk(d, 'bhishma', 60) + 10, 20)}>भीष्म की तरह: अपनी मृत्यु ख़ुद चुनो</Txt>
  </g>
);
const Blueprint: React.FC<SP> = ({ t, len, d }) => (
  <g>
    <rect width={W} height={H} fill="#030A1C" />
    {Array.from({ length: 30 }, (_, i) => <path key={i} d={`M${i * 66} 0 L${i * 66} 1080 M0 ${i * 40} L1920 ${i * 40}`} stroke="#0E2250" strokeWidth={1} />)}
    {METALS.map((k, i) => (
      <g key={k} opacity={fin(t, mk(d, 'three', 40) - 20 + i * 8, 16)}>
        <City id={`bp${k}`} k={k} x={X(i)} y={560} s={0.48} t={t} lights={0} />
      </g>
    ))}
    <Txt x={960} y={200} size={80} o={fin(t, mk(d, 'three', 40), 14)}>तीन नगर</Txt>
  </g>
);
const Assign: React.FC<SP> = ({ t, len, d }) => {
  const a = [mk(d, 'gold', 20), mk(d, 'silver', 100), mk(d, 'iron', 190)];
  const lv = [['स्वर्ग', 'HEAVEN'], ['आकाश', 'SKY'], ['धरती', 'EARTH']];
  return (
    <g>
      <rect width={W} height={H} fill="url(#rkSky)" />
      <Stars t={t} n={160} o={0.8} box={[0, 0, W, 600]} />
      <Ground y={940} />
      {[220, 540, 860].map((y, i) => <path key={i} d={`M0 ${y + 60} L1920 ${y + 60}`} stroke={P.gold} strokeWidth={1} opacity={0.18} strokeDasharray="8 10" />)}
      {METALS.map((k, i) => {
        const y = [250, 560, 900][i];
        return (
          <g key={k} opacity={easeOut(fin(t, a[i] - 6, 20))}>
            <City id={`as${k}`} k={k} x={1100} y={y - (i === 2 ? 60 : 0)} s={0.36} t={t} />
            <Label x={420} y={y - 40} hi={`${['तारकाक्ष', 'कमलाक्ष', 'विद्युन्माली'][i]} · ${METAL[k].name}`} en={lv[i][1]} o={1} size={42} />
            <Txt x={1560} y={y - 40} size={40} fill={P.snow}>{lv[i][0]}</Txt>
          </g>
        );
      })}
    </g>
  );
};
const Condition: React.FC<SP> = ({ t, len, d }) => {
  const noon = mk(d, 'noon', 100), pu = mk(d, 'pushya', 160), cl = mk(d, 'clouds', 200), line = mk(d, 'line', 300);
  const al = easeOut(fin(t, line - 30, 50));
  return (
    <g>
      <Sky t={t} n={120} />
      <Clouds t={t} y={420} o={0.7 * fin(t, cl, 30)} rain={fin(t, cl + 20, 30)} />
      {/* the sun at its zenith (midday, Abhijit) */}
      <circle cx={960} cy={120} r={70} fill="url(#rkSun)" opacity={fin(t, noon, 20)} />
      <circle cx={960} cy={120} r={34} fill={P.goldHi} opacity={fin(t, noon, 20)} />
      <Txt x={960} y={240} size={34} o={fin(t, noon, 20)}>मध्याह्न · अभिजित् मुहूर्त</Txt>
      <MoonPushya x={300} y={200} o={fin(t, pu, 20)} t={t} />
      <Txt x={420} y={320} size={32} o={fin(t, pu, 20)}>चंद्रमा पुष्य में</Txt>
      <Txt x={1560} y={320} size={32} o={fin(t, cl, 20)}>पुष्कर · आवर्त मेघ</Txt>
      {/* three cities drift into one line for one moment */}
      {METALS.map((k, i) => <City key={k} id={`cd${k}`} k={k} x={lerp(X(i), 960, 0) + (i - 1) * lerp(120, 0, al)} y={lerp(560 + (i - 1) * 140, 560 + (i - 1) * 2, al) + (i - 1) * 140 * (1 - al)} s={0.3} t={t} />)}
      <path d="M960 380 L960 860" stroke={P.goldHi} strokeWidth={3} strokeDasharray="10 10" opacity={al * 0.8} />
      <Txt x={960} y={1010} size={44} o={fin(t, line, 16)}>हज़ार वर्ष में एक पल</Txt>
    </g>
  );
};
const Impossible: React.FC<SP> = ({ t, len, d }) => {
  const ch = mk(d, 'chariot', 90), ar = mk(d, 'arrow', 150), die = mk(d, 'die', 200);
  return (
    <g>
      <Night t={t} />
      <g opacity={fin(t, ch - 6, 20)} strokeDasharray="12 10">
        <g opacity={0.6}><Chariot x={760} y={760} s={0.6} t={t} brahma={false} /></g>
      </g>
      <g opacity={fin(t, ar - 6, 20)}>
        <path d="M1150 520 L1720 520" stroke="#6FA0FF" strokeWidth={8} strokeDasharray="20 14" />
        <path d="M1720 500 L1770 520 L1720 540 Z" fill={P.goldHi} />
      </g>
      <Txt x={760} y={240} size={50} o={fin(t, ch, 16)}>असंभव रथ</Txt>
      <Txt x={1440} y={440} size={50} o={fin(t, ar, 16)}>एक ही असंभव बाण</Txt>
      <Txt x={960} y={1000} size={60} fill="#FF9A3A" o={fin(t, die, 16)}>तभी हम मरेंगे</Txt>
    </g>
  );
};
const Evamastu: React.FC<SP> = ({ t, len, d }) => {
  const ev = mk(d, 'ev', 80), care = mk(d, 'care', 210);
  return (
    <g transform={cam(960, 560, push(t, len))}>
      <Sky t={t} />
      <Glow x={960} y={500} r={600} o={0.4 + 0.4 * fin(t, ev, 20)} />
      <Rings x={960} y={400} t={t} a={ev} />
      <Brahma x={960} y={940} s={0.95} t={t} />
      <Txt x={960} y={150} size={96} o={easeOut(fin(t, ev - 4, 16))}>एवमस्तु</Txt>
      <Txt x={960} y={1040} size={40} fill={P.snow} o={fin(t, care, 20)}>“सँभलकर बरतना”</Txt>
    </g>
  );
};

// ---------------------------------------------------------------- s4
const Maya: React.FC<SP> = ({ t, len, d }) => (
  <g>
    <rect width={W} height={H} fill="#030A1C" />
    {Array.from({ length: 30 }, (_, i) => <path key={i} d={`M${i * 66} 0 L${i * 66} 1080 M0 ${i * 40} L1920 ${i * 40}`} stroke="#0E2250" strokeWidth={1} />)}
    <Asura id="maya" x={420} y={960} s={1.0} pose="hold" tone="navy" fierce={false} t={t} />
    <Label x={420} y={1020} hi="मय दानव" en="MAYA, THE BUILDER" o={fin(t, 4, 14)} size={40} />
    <City id="mycity" k="gold" x={1260} y={560} s={0.7} t={t} o={fin(t, mk(d, 'build', 30) - 10, 30)} />
  </g>
);
const Inside: React.FC<SP> = ({ t, len, d }) => {
  const li = mk(d, 'linga', 120), fi = mk(d, 'fire', 180), si = mk(d, 'sinner', 230);
  return (
    <g transform={cam(960, 560, push(t, len, 1, 1.05))}>
      <Sky t={t} n={100} />
      {/* a street of homes, each with its linga and its fire */}
      {Array.from({ length: 5 }, (_, i) => {
        const x = 220 + i * 370;
        return (
          <g key={i}>
            <path d={`M${x - 150} 900 L${x - 150} 620 L${x} 520 L${x + 150} 620 L${x + 150} 900 Z`} fill="url(#tpM-gold)" stroke={P.gold} strokeWidth={2.4} />
            <rect x={x - 90} y={680} width={180} height={220} fill="#050812" stroke={P.gold} strokeWidth={1.6} />
            <Linga x={x - 10} y={890} s={0.5} t={t} o={fin(t, li + i * 4, 14)} lit={1} />
            <g opacity={fin(t, fi + i * 4, 14)}><Flame x={x + 60} y={890} h={50} t={t} seed={i} /><path d={`M${x + 36} 890 L${x + 84} 890 L${x + 76} 900 L${x + 44} 900 Z`} fill={P.goldDeep} /></g>
          </g>
        );
      })}
      {/* Kalpavriksha, elephants: glimpses on the skyline */}
      <path d="M1700 520 Q1660 420 1720 380 Q1780 330 1820 400 Q1880 440 1840 520 Z" fill="#0B2A1A" stroke={P.gold} strokeWidth={2} />
      <Ground y={900} />
      {/* the sinner below cannot see us */}
      <g opacity={fin(t, si - 10, 16)}>
        <rect width={W} height={H} fill={P.abyss} opacity={0.7} />
        <Asura id="sin" x={960} y={1060} s={0.7} pose="lower" tone="navy" fierce={false} t={t} dim={0.5} />
        <Txt x={960} y={300} size={48} fill={P.snow}>पापी हमें देख भी नहीं सकता था</Txt>
      </g>
    </g>
  );
};
const Conquer: React.FC<SP> = ({ t, len, d }) => (
  <g>
    <Sky t={t} />
    <Gods t={t} o={0.6 * (1 - fin(t, 20, 40))} y={300 + fin(t, 20, 40) * 200} />
    {METALS.map((k, i) => <City key={k} id={`cq${k}`} k={k} x={X(i)} y={260} s={0.28} t={t} />)}
    {/* Amaravati's gate, taken */}
    <path d="M760 960 L760 640 Q960 520 1160 640 L1160 960" fill="none" stroke={P.goldHi} strokeWidth={6} opacity={0.8} />
    <Txt x={960} y={1030} size={50} o={fin(t, mk(d, 'amaravati', 30), 14)}>अमरावती छिनी</Txt>
    <Ground y={960} />
  </g>
);
const Command: React.FC<SP> = ({ t, len, d }) => {
  const rn = mk(d, 'rain', 80), sn = mk(d, 'sun', 110), mn = mk(d, 'moon', 200);
  return (
    <g>
      <rect width={W} height={H} fill={t > sn ? '#1A2550' : P.navy} />
      <Stars t={t} n={80} o={0.4} box={[0, 0, W, 600]} />
      <Clouds t={t} y={140} o={fin(t, rn - 10, 20) * (1 - fin(t, sn, 20))} rain={fin(t, rn, 10)} />
      {/* the sun, burning softly */}
      <g opacity={fin(t, sn - 6, 16)}>
        <circle cx={1400} cy={260} r={lerp(120, 60, fin(t, sn + 10, 40))} fill="url(#rkSun)" />
        <circle cx={1400} cy={260} r={lerp(60, 30, fin(t, sn + 10, 40))} fill={P.goldHi} opacity={lerp(1, 0.4, fin(t, sn + 10, 40))} />
      </g>
      {/* the moon by day */}
      <g opacity={fin(t, mn - 6, 16)}><circle cx={500} cy={260} r={70} fill={P.star} filter="url(#rkGlow)" /><circle cx={526} cy={248} r={64} fill="#1A2550" opacity={0.75} /></g>
      <Ground y={900} />
      <Brother k="gold" x={960} y={900} s={0.9} t={t} pose="raise" />
      <Txt x={960} y={1010} size={38} fill={P.snow} o={fin(t, rn, 16)}>इंद्र: बरसो · सूर्य: धीमे जलो · चंद्र: दिन में उगो</Txt>
    </g>
  );
};
const Seasons: React.FC<SP> = ({ t, len, d }) => {
  const leaf = mk(d, 'leaf', 90), sp = mk(d, 'spring', 150);
  const ly = t < leaf ? lerp(380, 600, clamp(t / leaf)) : 600;
  return (
    <g>
      <Night t={t} />
      <Ground y={900} />
      <path d="M960 900 L960 520 M960 640 L820 480 M960 600 L1110 450 M960 560 L940 380" stroke={P.goldDim} strokeWidth={14} strokeLinecap="round" />
      {Array.from({ length: 40 }, (_, i) => <ellipse key={i} cx={760 + rnd(3, i) * 420} cy={340 + rnd(4, i) * 220} rx={16} ry={8} fill={t > sp ? '#5AC08A' : '#A86A2A'} opacity={0.9} />)}
      {/* one leaf, frozen mid-fall */}
      <ellipse cx={1180} cy={ly} rx={18} ry={9} fill="#A86A2A" transform={`rotate(${t < leaf ? t * 3 : leaf * 3} 1180 ${ly})`} />
      {t > leaf ? <circle cx={1180} cy={600} r={40} fill="none" stroke={P.goldHi} strokeWidth={2} opacity={1 - fin(t, leaf, 40)} /> : null}
      <Txt x={960} y={1010} size={44} o={fin(t, sp, 16)}>हर जगह वसंत</Txt>
    </g>
  );
};
const Strength: React.FC<SP> = ({ t, len, d }) => (
  <g transform={cam(960, 600, push(t, len))}>
    <Sky t={t} />
    <Ground y={940} />
    <Asura id="st" x={760} y={940} s={1.25} pose="strike" tone="navy" fierce t={t} />
    <g transform="translate(1260 940)"><g transform="rotate(-20) scale(0.8)"><path d="M-60 0 Q-70 -120 -20 -160 Q0 -200 20 -160 Q70 -120 60 0 Z" fill="#0B1736" stroke={P.snow} strokeWidth={3} opacity={0.8} /><circle cx={0} cy={-200} r={36} fill="#0B1736" stroke={P.snow} strokeWidth={3} opacity={0.8} /></g></g>
    <Txt x={960} y={170} size={50} o={fin(t, mk(d, 'weak', 100), 16)}>रोज़ कोई कमज़ोर चाहिए</Txt>
  </g>
);

// ---------------------------------------------------------------- s5
const ThreeStrengths: React.FC<SP> = ({ t, len, d }) => {
  const a = mk(d, 'a', 170), b = mk(d, 'b', 120), c = mk(d, 'c', 300), r = mk(d, 'raised', 390);
  const items: [number, string, string][] = [[Math.max(a, 40), 'वर', 'THE BOON'], [Math.max(b, a + 30), 'देह का बल', 'THEIR STRENGTH'], [c, 'शिव-भक्ति', 'DEVOTION TO SHIVA']];
  return (
    <g>
      <Night t={t} />
      <Brahma x={300} y={1000} s={0.6} t={t} />
      {items.map(([m, hi, en], i) => (
        <g key={i} opacity={easeOut(fin(t, m - 6, 18))}>
          <circle cx={800 + i * 420} cy={480} r={150} fill="none" stroke={i === 2 ? P.goldHi : P.gold} strokeWidth={i === 2 ? 6 : 3} filter="url(#rkGlow)" />
          {i === 2 ? <Linga x={1640} y={560} s={0.8} t={t} /> : null}
          {i === 0 ? <Txt x={800} y={510} size={90}>वर</Txt> : null}
          {i === 1 ? <Asura id="ts1" x={1220} y={610} s={0.42} pose="raise" tone="navy" fierce t={t} /> : null}
          <Label x={800 + i * 420} y={700} hi={hi} en={en} o={1} size={42} />
        </g>
      ))}
      <Txt x={1220} y={900} size={40} fill={P.snow} o={fin(t, r, 16)}>“इस दैत्य को मैंने ही बढ़ाया है”</Txt>
    </g>
  );
};
const Kailasa: React.FC<SP> = ({ t, len, d }) => {
  const bh = mk(d, 'bhakt', 140), no = mk(d, 'no', 250);
  return (
    <g transform={cam(960, 540, push(t, len, 1, 1.12))}>
      <rect width={W} height={H} fill="url(#rkSky)" />
      <Stars t={t} n={200} o={0.9} box={[0, 0, W, H]} />
      <path d="M200 1080 L760 360 L860 420 L960 250 L1060 420 L1160 360 L1720 1080 Z" fill="#0C1430" stroke="#E6ECFA" strokeWidth={3} opacity={0.9} />
      <path d="M880 400 L960 250 L1040 400 L1000 380 L960 420 L920 380 Z" fill="#E6ECFA" opacity={0.7} />
      <Shiva x={960} y={760} s={0.62} pose="sit" t={t} glow={0.5} />
      {/* his devotees, far below, worshipping */}
      <g opacity={fin(t, bh, 20)}>{[300, 1620].map((x) => <Linga key={x} x={x} y={1000} s={0.6} t={t} />)}</g>
      <Txt x={960} y={140} size={52} o={fin(t, bh, 16)}>“वे दैत्य मेरे भक्त हैं”</Txt>
      <Txt x={960} y={960} size={44} fill="#FF9A3A" o={fin(t, no, 16)}>मैं उन्हें नहीं मारूँगा</Txt>
    </g>
  );
};
const Bhutas: React.FC<SP> = ({ t, len, d }) => {
  const rise = mk(d, 'rise', 90), burn = mk(d, 'burn', 220);
  return (
    <g>
      <Sky t={t} />
      <City id="bhc" k="gold" x={1400} y={420} s={0.6} t={t} />
      <Vishnu x={360} y={1000} s={0.6} t={t} />
      {/* the yajna kund */}
      <path d="M560 960 L760 960 L740 1000 L580 1000 Z" fill={P.goldDeep} />
      <FireLine x0={580} x1={740} y={960} h={90} t={t} n={6} seed={3} />
      {/* bhuta-ganas rush up toward the city */}
      {Array.from({ length: 16 }, (_, i) => {
        const k = clamp((t - rise - i * 4) / 110);
        if (k <= 0) return null;
        const x = lerp(660, 1300 + (i % 5) * 40, k), y = lerp(940, 480 + (i % 4) * 30, k);
        const burnt = t > burn - 20 + i * 2;
        return burnt
          ? <DustBurst key={i} x={x} y={y} p={fin(t, burn - 20 + i * 2, 30)} seed={i} n={16} spread={40} h={80} />
          : <Mini key={i} x={x} y={y} s={0.12} tone="navy" rim={0.9} />;
      })}
      <Txt x={960} y={150} size={46} o={fin(t, burn, 16)}>जैसे आग में पतंगे</Txt>
    </g>
  );
};
const Understand: React.FC<SP> = ({ t, len, d }) => (
  <g transform={cam(960, 540, push(t, len))}>
    <Night t={t} />
    <Vishnu x={520} y={1000} s={0.75} t={t} glow={0.6} />
    <g opacity={fin(t, mk(d, 'linga', 90), 16)}>
      <Linga x={1360} y={760} s={1.3} t={t} />
      <Txt x={1360} y={420} size={42}>वेद-धर्म · शिवलिंग</Txt>
    </g>
    <path d="M1300 520 L1340 600 L1310 660 L1370 760" fill="none" stroke="#FF9A3A" strokeWidth={4} strokeDasharray={`${300 * fin(t, mk(d, 'fall', 200), 30)} 400`} />
    <Txt x={960} y={1040} size={46} o={fin(t, mk(d, 'fall', 200), 16)}>तो इनका धर्म ही गिराना होगा</Txt>
  </g>
);

// ---------------------------------------------------------------- s6
const MundiBorn: React.FC<SP> = ({ t, len, d }) => {
  const br = mk(d, 'broom', 230), cl = mk(d, 'cloth', 350), dh = mk(d, 'dharma', 430);
  return (
    <g transform={cam(1100, 600, push(t, len, 1, 1.12))}>
      <Night t={t} />
      <Vishnu x={460} y={1000} s={0.75} t={t} glow={0.7} />
      <Glow x={1180} y={700} r={300} o={0.5 * (1 - fin(t, 80, 60))} />
      <Ground y={1000} />
      <Mundi x={1180} y={1000} s={0.95} t={t} o={fin(t, 30, 50)} sweep={fin(t, br, 10)} cloth={fin(t, cl, 10)} />
      <Txt x={1180} y={200} size={56} o={fin(t, dh, 14)}>“धर्म, धर्म”</Txt>
    </g>
  );
};
const MundiName: React.FC<SP> = ({ t, len, d }) => {
  const nm = mk(d, 'name', 50), six = mk(d, 'sixteen', 90), hon = mk(d, 'honey', 280), po = mk(d, 'poison', 310);
  return (
    <g>
      <Night t={t} />
      <Mundi x={420} y={1000} s={0.8} t={t} sweep={0.3} />
      <Txt x={420} y={220} size={90} o={fin(t, nm - 4, 14)}>अरिहन्</Txt>
      {/* a scroll of sixteen thousand verses */}
      <g opacity={fin(t, six - 6, 16)}>
        <rect x={900} y={280} width={760} height={520} rx={16} fill="#2A1C08" stroke={P.gold} strokeWidth={3} />
        {Array.from({ length: 14 }, (_, i) => <path key={i} d={`M950 ${330 + i * 34} L${1610 - (i % 3) * 60} ${330 + i * 34}`} stroke={P.goldHi} strokeWidth={3} opacity={0.5} strokeDasharray="14 6" />)}
        <Txt x={1280} y={260} size={44}>१६,००० श्लोक</Txt>
      </g>
      {/* honey that blackens */}
      {Array.from({ length: 6 }, (_, i) => {
        const y = 800 + ((t * 2 + i * 30) % 160);
        return <ellipse key={i} cx={960 + i * 120} cy={y} rx={10} ry={16} fill={t > po ? '#14100A' : '#E8A020'} opacity={fin(t, hon, 14)} />;
      })}
      <Txt x={1280} y={1020} size={50} fill={t > po ? '#9A9A9A' : P.goldHi} o={fin(t, hon, 14)}>शहद लगा ज़हर</Txt>
    </g>
  );
};
const MundiFail: React.FC<SP> = ({ t, len, d }) => (
  <g>
    <Sky t={t} n={100} />
    <Ground y={920} />
    <Mundi x={640} y={920} s={0.75} t={t} teach={1} />
    {Array.from({ length: 6 }, (_, i) => <Mini key={i} x={((1100 + i * 140 + t * 1.5) % 2000)} y={920} s={0.3} tone="navy" flip />)}
    <Linga x={1640} y={920} s={0.8} t={t} />
    <Txt x={960} y={180} size={50} o={fin(t, mk(d, 'none', 40), 14)}>कोई नहीं रुका</Txt>
    <Txt x={960} y={250} size={38} fill={P.snow} o={fin(t, mk(d, 'puja', 90), 14)}>हमारी शिव-पूजा के आगे उसकी माया नहीं चली</Txt>
  </g>
);
const NaradaCert: React.FC<SP> = ({ t, len, d }) => {
  const di = mk(d, 'diksha', 120), tk = mk(d, 'tk', 150), nv = mk(d, 'never', 310), be = mk(d, 'believe', 380);
  return (
    <g transform={cam(960, 560, push(t, len))}>
      <Sky t={t} n={100} />
      <Ground y={940} />
      {t < tk ? (
        <g>
          <Narada x={lerp(-100, 760, easeOut(fin(t, 0, 80)))} y={940} s={0.85} t={t} />
          <Mundi x={1240} y={940} s={0.85} t={t} sweep={0.2} />
          <Txt x={960} y={180} size={50} o={fin(t, di - 6, 14)}>नारद ने पहले स्वयं दीक्षा ली</Txt>
        </g>
      ) : (
        <g>
          <Narada x={640} y={940} s={0.85} t={t} talk={1} />
          <Brother k="gold" x={1300} y={940} s={0.95} t={t} label={fin(t, tk, 14) * (1 - fin(t, be - 10, 10))} />
          <Txt x={960} y={170} size={44} o={fin(t, tk + 20, 14)}>“तुम्हारे राज्य में एक महापुरुष आया है”</Txt>
          <Txt x={960} y={240} size={44} o={fin(t, nv - 20, 14)}>“ऐसा धर्म मैंने पहले नहीं देखा”</Txt>
          <Txt x={960} y={1040} size={44} fill="#FF9A3A" o={fin(t, be, 14)}>नारद कह रहे थे, तो हमने मान लिया</Txt>
        </g>
      )}
    </g>
  );
};
const Initiation: React.FC<SP> = ({ t, len, d }) => {
  const bro = mk(d, 'bro', 60), all = mk(d, 'all', 120);
  return (
    <g>
      <Sky t={t} n={90} />
      <Ground y={940} />
      <Mundi x={260} y={940} s={0.7} t={t} sweep={0.2} />
      <Brother k="gold" x={620} y={940} s={0.8} t={t} pose="lower" />
      <g opacity={fin(t, bro - 6, 16)}><Brother k="silver" x={880} y={940} s={0.75} t={t} pose="lower" /><Brother k="iron" x={1120} y={940} s={0.75} t={t} pose="lower" /></g>
      {Array.from({ length: 18 }, (_, i) => <Mini key={i} x={1280 + (i % 6) * 100} y={940 - Math.floor(i / 6) * 40} s={0.26 - Math.floor(i / 6) * 0.04} tone="navy" o={fin(t, all - 10 + i * 2, 12)} />)}
      <Txt x={960} y={180} size={46} o={fin(t, all, 14)}>तीनों नगरों का हर निवासी</Txt>
    </g>
  );
};

// ---------------------------------------------------------------- s7
const Doctrine: React.FC<SP> = ({ t, len, d }) => {
  const he = mk(d, 'heaven', 110), nm = mk(d, 'names', 260), fi = mk(d, 'fire', 300);
  return (
    <g>
      <rect width={W} height={H} fill="#0A0A12" />
      <Mundi x={360} y={1000} s={0.8} t={t} teach={1} sweep={0} cloth={0} />
      <Txt x={1160} y={260} size={52} o={fin(t, 20, 14)}>न सृष्टिकर्ता, न कर्म</Txt>
      <Txt x={1160} y={360} size={52} o={fin(t, he, 14)}>स्वर्ग यहीं, नरक यहीं</Txt>
      <Txt x={1160} y={460} size={44} fill={P.snow} o={fin(t, nm, 14)}>ब्रह्मा, विष्णु, महेश: बस नाम</Txt>
      {/* the sacrificial fire goes out */}
      <g transform="translate(1160 860)">
        <path d="M-80 0 L80 0 L64 30 L-64 30 Z" fill={P.goldDeep} />
        <FireLine x0={-60} x1={60} y={0} h={lerp(90, 0, fin(t, fi, 30))} t={t} n={5} seed={2} />
        {t > fi ? <path d={`M0 0 Q${-20 + Math.sin(t * 0.1) * 10} -80 0 -160`} fill="none" stroke="#5A5A6A" strokeWidth={6} opacity={0.6} /> : null}
      </g>
    </g>
  );
};
const BodyFood: React.FC<SP> = ({ t, len, d }) => {
  const dg = mk(d, 'dogs', 20), en = mk(d, 'enjoy', 130), sn = mk(d, 'snatch', 210), bk = mk(d, 'back', 300);
  return (
    <g>
      <rect width={W} height={H} fill="#0A0A12" />
      {t < sn ? (
        <g>
          <path d="M760 940 L1160 940" stroke={P.goldDim} strokeWidth={2} />
          <path d="M800 930 Q960 890 1120 930 L1120 940 L800 940 Z" fill="#141826" stroke={P.snow} strokeWidth={2} opacity={0.7} />
          {/* crows circling */}
          {Array.from({ length: 5 }, (_, i) => {
            const a = t * 0.03 + i * 1.3;
            return <path key={i} d="M-24 0 Q-12 -14 0 0 Q12 -14 24 0" transform={`translate(${960 + Math.cos(a) * 300} ${620 + Math.sin(a) * 80})`} fill="none" stroke={P.snow} strokeWidth={4} opacity={fin(t, dg, 20)} />;
          })}
          <Txt x={960} y={240} size={50} o={fin(t, dg, 14)}>यह देह कुत्तों और कौओं का भोजन</Txt>
          <Txt x={960} y={330} size={56} fill="#FF9A3A" o={fin(t, en, 14)}>जब तक स्वस्थ है, भोगो</Txt>
        </g>
      ) : (
        <g>
          <Asura id="bf1" x={720} y={960} s={1.0} pose="strike" tone="navy" fierce t={t} />
          <g transform="translate(1260 960)"><path d="M-60 0 Q-70 -120 -20 -160 Q0 -200 20 -160 Q70 -120 60 0 Z" fill="#0B1736" stroke={P.snow} strokeWidth={3} /><circle cx={0} cy={-200} r={36} fill="#0B1736" stroke={P.snow} strokeWidth={3} /></g>
          <ellipse cx={lerp(1200, 860, easeOut(fin(t, sn, 20)))} cy={760} rx={40} ry={24} fill="#C8963A" />
          <Txt x={960} y={220} size={56} o={fin(t, sn, 14)}>भूखा और बलवान? छीनकर खा</Txt>
          <Txt x={960} y={310} size={44} fill={P.snow} o={fin(t, bk, 14)}>मरने के बाद पाप? कोई लौटकर बताने आया?</Txt>
        </g>
      )}
    </g>
  );
};
const Caste: React.FC<SP> = ({ t, len, d }) => (
  <g>
    <rect width={W} height={H} fill="#0A0A12" />
    {Array.from({ length: 4 }, (_, i) => <path key={i} d={`M300 ${300 + i * 150} L1620 ${300 + i * 150}`} stroke={P.gold} strokeWidth={3} strokeDasharray={`${1320 * (1 - fin(t, 30 + i * 10, 30))} 2000`} />)}
    <Txt x={960} y={200} size={60} o={fin(t, 4, 14)}>वर्ण झूठ है</Txt>
    <Txt x={960} y={960} size={44} fill={P.snow} o={fin(t, mk(d, 'kashyapa', 80), 14)}>“कश्यप ने तेरह बहनों से विवाह किया था”</Txt>
  </g>
);
const Proclaim: React.FC<SP> = ({ t, len, d }) => {
  const rel = mk(d, 'rel', 60), take = mk(d, 'take', 200);
  return (
    <g transform={cam(960, 560, push(t, len, 1, 1.1))}>
      <rect width={W} height={H} fill="#12060A" />
      <Stars t={t} n={60} o={0.3} box={[0, 0, W, 500]} />
      <Ground y={940} />
      <Brother k="gold" x={960} y={940} s={1.15} t={t} pose="raise" />
      <Txt x={960} y={170} size={56} fill="#FF6A4A" o={fin(t, rel, 14)}>न रिश्ता, न मर्यादा, न पत्नी, न संतान</Txt>
      <Txt x={960} y={1040} size={50} fill="#FF6A4A" o={fin(t, take, 14)}>जिसे जो चाहिए, ले ले</Txt>
    </g>
  );
};
const Abandon: React.FC<SP> = ({ t, len, d }) => {
  const li = mk(d, 'linga', 10), vw = mk(d, 'vows', 90);
  return (
    <g>
      <rect width={W} height={H} fill="#0A0A12" />
      <Ground y={900} />
      <Linga x={960} y={900} s={1.6} t={t} lit={1 - fin(t, li + 20, 20)} broken={easeOut(fin(t, li + 10, 30))} />
      <Txt x={960} y={200} size={52} o={fin(t, li, 14)}>हमने शिवलिंग छोड़ दिए</Txt>
      <Txt x={960} y={290} size={40} fill={P.snow} o={fin(t, vw - 30, 14)}>श्राद्ध · यज्ञ · व्रत</Txt>
    </g>
  );
};
const Wives: React.FC<SP> = ({ t, len, d }) => {
  const sp = mk(d, 'spell', 90), lu = mk(d, 'lust', 220);
  const sep = easeOut(fin(t, 10, 50));
  return (
    <g>
      <rect width={W} height={H} fill="#12060A" />
      <Ground y={940} />
      {/* a household splits apart */}
      <path d="M760 940 L760 620 L960 500 L1160 620 L1160 940 Z" fill="none" stroke={P.gold} strokeWidth={2} opacity={0.4} />
      <Mini x={960 - 80 - sep * 360} y={940} s={0.62} tone="navy" mace={false} />
      <g transform={`translate(${960 + 80 + sep * 360} 940)`}>
        <path d="M-40 0 Q-50 -140 -20 -180 L20 -180 Q50 -140 40 0 Z" fill="#0B1736" stroke={P.snow} strokeWidth={3} />
        <circle cx={0} cy={-210} r={28} fill="#0B1736" stroke={P.snow} strokeWidth={3} />
        <path d="M-30 -230 Q0 -260 30 -230 L34 -170 Q0 -160 -34 -170 Z" fill="none" stroke={P.snow} strokeWidth={2} opacity={0.6} />
      </g>
      {/* spells: a dark spiral */}
      <g opacity={fin(t, sp, 20)} transform={`translate(960 560) rotate(${t * 3})`}>
        <path d="M0 0 m-10 0 a10 10 0 1 1 20 0 a20 20 0 1 1 -40 0 a40 40 0 1 1 80 0 a70 70 0 1 1 -140 0 a110 110 0 1 1 220 0" fill="none" stroke="#8A3AA8" strokeWidth={4} />
      </g>
      <Txt x={960} y={160} size={46} o={fin(t, 10, 14)}>पत्नियों ने पति छोड़े</Txt>
      <Txt x={960} y={230} size={40} fill={P.snow} o={fin(t, sp, 14)}>पुरुषों ने पराई स्त्रियों पर वशीकरण के मंत्र चलाए</Txt>
      <Txt x={960} y={1030} size={46} fill="#FF6A4A" o={fin(t, lu, 14)}>दिन और रात, बस धन और काम</Txt>
    </g>
  );
};
const Alakshmi: React.FC<SP> = ({ t, len, d }) => {
  const lk = mk(d, 'lak', 40), dr = mk(d, 'dry', 130);
  return (
    <g>
      <Sky t={t} n={60} />
      <City id="alc" k="gold" x={960} y={620} s={0.7} t={t} lights={1 - fin(t, dr, 30)} />
      {/* a smoke enters; a golden lotus leaves */}
      {Array.from({ length: 12 }, (_, i) => <circle key={i} cx={lerp(-100, 900, fin(t, i * 3, 90)) + Math.sin(t * 0.05 + i) * 30} cy={500 + (i % 4) * 40} r={60} fill="#1A1A22" opacity={0.5} />)}
      <Lotus x={lerp(1100, 1900, fin(t, lk, 60))} y={lerp(380, 120, fin(t, lk, 60))} s={0.6} c={P.goldHi} />
      <Label x={360} y={200} hi="अलक्ष्मी" en="ALAKSHMI ENTERS" o={fin(t, 4, 14)} size={44} />
      <Label x={1560} y={200} hi="लक्ष्मी" en="LAKSHMI LEAVES" o={fin(t, lk, 14)} size={44} />
    </g>
  );
};
const Fault: React.FC<SP> = ({ t, len, d }) => (
  <g>
    <rect width={W} height={H} fill="#0A0A12" />
    {Array.from({ length: 30 }, (_, i) => <Mini key={i} x={120 + (i % 10) * 190} y={760 + Math.floor(i / 10) * 120} s={0.24 + Math.floor(i / 10) * 0.05} tone="navy" back mace={false} />)}
    <Mundi x={960} y={700} s={0.42} t={t} teach={1} cloth={0} sweep={0} />
    <Txt x={960} y={170} size={50} o={fin(t, 4, 14)}>दोष कहने वाले का नहीं था</Txt>
    <Txt x={960} y={250} size={56} fill="#FF9A3A" o={fin(t, mk(d, 'listen', 70), 14)}>दोष सुनने वालों का था</Txt>
    <Txt x={960} y={330} size={64} o={fin(t, mk(d, 'ours', 110), 12)}>हमारा</Txt>
  </g>
);

// ---------------------------------------------------------------- s8
const Japa: React.FC<SP> = ({ t, len, d }) => (
  <g transform={cam(960, 560, push(t, len))}>
    <Night t={t} />
    <rect x={0} y={760} width={W} height={320} fill="#081A3A" />
    {Array.from({ length: 6 }, (_, i) => <ellipse key={i} cx={960} cy={800} rx={((t * 3 + i * 60) % 360) + 60} ry={(((t * 3 + i * 60) % 360) + 60) * 0.18} fill="none" stroke="#6FA0FF" strokeWidth={2} opacity={1 - ((t * 3 + i * 60) % 360) / 360} />)}
    <Vishnu x={960} y={900} s={0.8} t={t} glow={0.7} />
    <Txt x={960} y={160} size={52} o={fin(t, mk(d, 'crore', 60), 14)}>डेढ़ करोड़ रुद्र-जप</Txt>
  </g>
);
const Hesitate: React.FC<SP> = ({ t, len, d }) => (
  <g transform={cam(960, 560, push(t, len))}>
    <Sky t={t} />
    <Ground y={960} />
    <Shiva x={960} y={960} s={0.95} t={t} glow={0.5} />
    <Vishnu x={360} y={960} s={0.6} t={t} glow={0.2} />
    <Brahma x={1560} y={960} s={0.6} t={t} />
    <Txt x={960} y={140} size={46} o={fin(t, mk(d, 'bhakt', 90), 14)}>“वे मेरे भक्त थे। विष्णु ने गिराया, विष्णु ही मारें।”</Txt>
    <Txt x={960} y={1040} size={44} fill={P.snow} o={fin(t, mk(d, 'dharma', 250), 14)}>ब्रह्मा: राजा का धर्म है, धर्म की रक्षा</Txt>
  </g>
);
const NoChariot: React.FC<SP> = ({ t, len, d }) => (
  <g transform={cam(960, 560, push(t, len))}>
    <Night t={t} />
    <Shiva x={960} y={980} s={1.0} t={t} pose="sit" glow={0.4} />
    {['रथ', 'धनुष', 'बाण'].map((w, i) => <g key={i} opacity={fin(t, mk(d, 'ratha', 90) + i * 12, 12)}><Txt x={500 + i * 460} y={260} size={64} fill={P.snow}>{w}</Txt><path d={`M${430 + i * 460} 240 L${570 + i * 460} 240`} stroke="#FF6A4A" strokeWidth={5} /></g>)}
    <Txt x={960} y={1050} size={48} o={fin(t, mk(d, 'we', 200), 14)}>देवता: “हम बनेंगे”</Txt>
  </g>
);
const Kumbhodara: React.FC<SP> = ({ t, len, d }) => {
  const sk = mk(d, 'skanda', 50), bt = mk(d, 'beat', 190);
  const swing = t > bt ? Math.sin((t - bt) * 0.5) * 40 : 0;
  return (
    <g>
      <Night t={t} />
      {/* Kailasa's door, closing */}
      <path d="M760 960 L760 400 Q960 300 1160 400 L1160 960" fill="#0C1430" stroke={P.gold} strokeWidth={4} />
      <rect x={lerp(760, 920, fin(t, sk, 40))} y={420} width={lerp(400, 80, fin(t, sk, 40))} height={540} fill="#02050E" opacity={0.9} />
      <Txt x={960} y={240} size={40} o={fin(t, sk - 10, 14)}>शिव भीतर, स्कंद का मुख निहारते</Txt>
      <Gods t={t} o={0.6} y={760} />
      {/* the gana with the staff */}
      <g transform={`translate(1400 960)`}>
        <Mini x={0} y={0} s={0.5} tone="navy" mace={false} />
        <path d="M-40 -180 L-220 -300" transform={`rotate(${swing} -40 -180)`} stroke={P.goldHi} strokeWidth={10} strokeLinecap="round" />
      </g>
      <Label x={1400} y={1020} hi="कुम्भोदर" en="KUMBHODARA" o={fin(t, bt - 20, 14)} size={36} />
    </g>
  );
};
const Mantra: React.FC<SP> = ({ t, len, d }) => {
  const om = mk(d, 'om', 70), ap = mk(d, 'appear', 240), bu = mk(d, 'build', 270);
  return (
    <g>
      <Night t={t} />
      <Gods t={t} o={0.5} y={880} />
      <Txt x={960} y={300} size={58} o={fin(t, om - 10, 14) * (1 - fin(t, ap, 20))}>ॐ नमः शिवाय शुभं शुभं</Txt>
      <Txt x={960} y={390} size={58} o={fin(t, om + 20, 14) * (1 - fin(t, ap, 20))}>कुरु कुरु शिवाय नमः ॐ</Txt>
      <Txt x={960} y={480} size={40} fill={P.snow} o={fin(t, om + 40, 14) * (1 - fin(t, ap, 20))}>× १,००,००,०००</Txt>
      <g opacity={fin(t, ap - 6, 20)}><Glow x={960} y={460} r={500} o={0.6} /><Shiva x={960} y={820} s={0.8} t={t} glow={0.4} /></g>
      <Label x={1600} y={200} hi="विश्वकर्मा" en="VISHWAKARMA BUILDS" o={fin(t, bu, 14)} size={40} />
    </g>
  );
};
const Wheels: React.FC<SP> = ({ t, len, d }) => {
  const su = mk(d, 'sun', 30), mo = mk(d, 'moon', 130), se = mk(d, 'seasons', 200), yr = mk(d, 'year', 260);
  return (
    <g>
      <Night t={t} />
      <Wheel x={1340} y={540} r={300} k="sun" rot={t * 0.6} o={fin(t, su - 6, 20)} />
      <Wheel x={580} y={540} r={300} k="moon" rot={-t * 0.6} o={fin(t, mo - 6, 20)} />
      <circle cx={1340} cy={540} r={330} fill="none" stroke={P.lacquerHi} strokeWidth={8} opacity={fin(t, se, 20)} strokeDasharray="160 20" />
      <circle cx={580} cy={540} r={330} fill="none" stroke={P.lacquerHi} strokeWidth={8} opacity={fin(t, se, 20)} strokeDasharray="160 20" />
      <Label x={1340} y={950} hi="सूर्य · १२ आदित्य" en="SUN WHEEL · 12 SPOKES" o={fin(t, su, 14)} size={40} />
      <Label x={580} y={950} hi="चंद्र · १६ कलाएँ" en="MOON WHEEL · 16 SPOKES" o={fin(t, mo, 14)} size={40} />
      <Txt x={960} y={120} size={40} o={fin(t, se, 14)}>ऋतुएँ: नेमि · वर्ष: गति</Txt>
    </g>
  );
};
const Driver: React.FC<SP> = ({ t, len, d }) => (
  <g transform={cam(960, 560, push(t, len))}>
    <Sky t={t} />
    <Ground y={900} />
    <Chariot x={560} y={900} s={0.8} t={t} rot={t} />
    {[0, 1, 2, 3].map((i) => <Horse key={i} x={1180 + i * 60} y={900 - i * 14} s={0.9} t={t} label={['ऋक्', 'यजुः', 'साम', 'अथर्व'][i]} o={fin(t, mk(d, 'vedas', 100) - 6 + i * 4, 14)} />)}
    <Txt x={960} y={140} size={46} o={fin(t, 4, 14)}>ब्रह्मा सारथी · ॐकार चाबुक · चारों वेद घोड़े</Txt>
  </g>
);
const Bow: React.FC<SP> = ({ t, len, d }) => {
  const sh = mk(d, 'shesha', 40), sa = mk(d, 'sarasvati', 90), ar = mk(d, 'arrow', 150), vi = mk(d, 'vishnu', 190), ag = mk(d, 'agni', 240);
  return (
    <g>
      <Night t={t} />
      <path d="M560 120 Q900 540 560 960" fill="none" stroke={P.goldHi} strokeWidth={16} strokeLinecap="round" filter="url(#rkGlow)" />
      <Label x={360} y={540} hi="सुमेरु" en="THE BOW" o={1} size={44} />
      <path d="M560 120 L560 960" stroke="#86D6A6" strokeWidth={5} opacity={fin(t, sh - 6, 16)} />
      <Label x={360} y={700} hi="शेषनाग" en="THE STRING" o={fin(t, sh, 14)} size={40} />
      <g opacity={fin(t, sa - 6, 16)}><circle cx={740} cy={300} r={26} fill={P.goldHi} /><Label x={860} y={250} hi="सरस्वती" en="THE BELL" o={1} size={36} /></g>
      <g opacity={fin(t, ar - 6, 16)}>
        <path d="M600 540 L1600 540" stroke="#6FA0FF" strokeWidth={12} strokeLinecap="round" />
        <Glow x={1100} y={540} r={300} o={0.5 * fin(t, vi, 20)} />
        <path d="M1600 510 L1680 540 L1600 570 Z" fill={P.goldHi} />
        <Flame x={1690} y={556} h={lerp(0, 90, fin(t, ag, 16))} t={t} seed={3} />
      </g>
      <Label x={1100} y={460} hi="बाण: स्वयं विष्णु" en="THE ARROW: VISHNU" o={fin(t, vi, 14)} size={40} />
      <Label x={1690} y={680} hi="नोक: अग्नि" en="THE TIP: AGNI" o={fin(t, ag, 14)} size={36} />
    </g>
  );
};

// ---------------------------------------------------------------- s9
const LaughChariot: React.FC<SP> = ({ t, len, d }) => {
  const la = mk(d, 'laugh', 50), be = mk(d, 'beans', 400);
  return (
    <g>
      <Sky t={t} />
      <Ground y={940} />
      {t < be - 80 ? (
        <g>
          <Chariot x={1180} y={940} s={0.75} t={t} rot={0} />
          <Shiva x={400} y={940} s={0.95} t={t} smile={fin(t, la, 20)} glow={0.3} />
          <Txt x={1180} y={140} size={40} fill={P.snow} o={fin(t, la + 30, 20)}>सूर्य आगे बढ़े, तो चंद्रमा पीछे</Txt>
        </g>
      ) : (
        <g>
          {/* a child's chariot of beans for Ratha Saptami */}
          <Glow x={960} y={640} r={300} o={0.4} />
          <g transform="translate(960 760)">
            <rect x={-160} y={-60} width={320} height={60} rx={20} fill="#4A8A3A" stroke={P.goldHi} strokeWidth={3} />
            {[-100, 100].map((x) => <g key={x}><circle cx={x} cy={20} r={50} fill="none" stroke="#4A8A3A" strokeWidth={10} /><path d={`M${x - 50} 20 L${x + 50} 20 M${x} -30 L${x} 70`} stroke="#3A6A2A" strokeWidth={4} /></g>)}
            {[-120, -60, 0, 60, 120].map((x) => <path key={x} d={`M${x} -60 L${x - 6} -160`} stroke="#C8B48A" strokeWidth={3} />)}
            <circle cx={0} cy={-200} r={40} fill="url(#rkSun)" />
          </g>
          <Txt x={960} y={240} size={46} o={fin(t, be - 70, 20)}>भक्ति से बनी हर चीज़ ईश्वर स्वीकार करता है</Txt>
        </g>
      )}
    </g>
  );
};
const HorsesFall: React.FC<SP> = ({ t, len, d }) => {
  const fa = mk(d, 'fall', 80), sh = mk(d, 'shake', 120), ve = mk(d, 'vedas', 150);
  const f = easeOut(fin(t, fa, 24));
  return (
    <g transform={`translate(${t > sh && t < sh + 30 ? Math.sin(t * 2) * 6 : 0} 0)`}>
      <Sky t={t} />
      <Ground y={900} />
      <Chariot x={520} y={900} s={0.75} t={t} rot={0} sink={f} shiva={<Shiva x={0} y={-250} s={0.42} t={t} glow={0.4} />} />
      {[0, 1, 2, 3].map((i) => <Horse key={i} x={1120 + i * 70} y={900 - i * 14} s={0.9} t={t} gallop={1 - f} fall={f} />)}
      <Txt x={960} y={150} size={42} o={fin(t, ve, 16)}>वेद ब्रह्म की ओर इशारा कर सकते हैं, ब्रह्म को ढो नहीं सकते</Txt>
    </g>
  );
};
const SheshaBull: React.FC<SP> = ({ t, len, d }) => {
  const li = mk(d, 'lift', 80), kn = mk(d, 'knees', 110);
  return (
    <g>
      <Sky t={t} />
      <Ground y={900} />
      <Chariot x={560} y={900 - 40 * fin(t, li, 16) * (1 - fin(t, kn, 16))} s={0.75} t={t} sink={fin(t, kn, 16)} />
      <Bull x={1240} y={900} s={1.0} t={t} strain={fin(t, li - 20, 20)} kneel={easeOut(fin(t, kn, 20))} fill="#D8E8D0" rim="#7FD0A0" />
      <Label x={1240} y={980} hi="शेष: वृषभ रूप" en="SHESHA AS THE BULL · SP 9.8" o={fin(t, 4, 14)} size={38} />
    </g>
  );
};
const VishnuBull: React.FC<SP> = ({ t, len, d }) => {
  const bu = mk(d, 'bull', 70), ve = mk(d, 'verse', 160);
  const mv = fin(t, bu + 20, len - bu);
  return (
    <g>
      <Sky t={t} />
      <Ground y={900} />
      <Chariot x={lerp(460, 640, mv)} y={900} s={0.75} t={t} rot={mv * 90} />
      <Bull x={lerp(1160, 1340, mv)} y={900} s={1.0} t={t} strain={0.8} fill="#2A5AC8" rim={P.goldHi} />
      <Glow x={lerp(1200, 1380, mv)} y={760} r={260} o={0.5 * fin(t, bu, 20)} />
      <Txt x={960} y={150} size={40} fill={P.snow} o={fin(t, 6, 14)}>परंपरा: विष्णु स्वयं बैल बने</Txt>
      <Txt x={960} y={230} size={46} fam={F.sanskrit} o={fin(t, ve, 14)}>बाणत्वं वृषभत्वम्…</Txt>
      <Txt x={960} y={280} size={26} fam={F.brand} fill={P.snow} w={500} o={fin(t, ve, 14)}>Shivananda Lahari 83 · Adi Shankaracharya</Txt>
    </g>
  );
};
const Pashupati: React.FC<SP> = ({ t, len, d }) => {
  const pa = mk(d, 'pashu', 90), vo = mk(d, 'vow', 190), nm = mk(d, 'name', 300);
  return (
    <g transform={cam(960, 560, push(t, len))}>
      <Night t={t} />
      <Shiva x={960} y={980} s={1.0} t={t} glow={0.5} smile={fin(t, vo - 20, 20)} />
      <Gods t={t} o={0.5 * fin(t, pa, 20)} y={300} />
      <Txt x={960} y={140} size={46} o={fin(t, pa, 14)}>“मानो कि तुम सब मेरे पशु हो”</Txt>
      <Txt x={960} y={1050} size={40} fill={P.snow} o={fin(t, vo, 14) * (1 - fin(t, nm - 10, 10))}>जो पाशुपत व्रत रखेगा, वह छूटेगा</Txt>
      <Txt x={960} y={1050} size={60} o={fin(t, nm, 14)}>पशुपति</Txt>
    </g>
  );
};
const Ascend: React.FC<SP> = ({ t, len, d }) => {
  const we = mk(d, 'we', 60), la = mk(d, 'laugh', 110);
  const up = easeOut(fin(t, 0, we));
  return (
    <g>
      <Sky t={t} />
      {t < we ? (
        <g transform={`translate(0 ${-up * 300})`}>
          <Chariot x={700} y={1000} s={0.6} t={t} rot={t * 2} />
          <Bull x={1180} y={1000} s={0.8} t={t} strain={0.6} fill="#2A5AC8" rim={P.goldHi} />
        </g>
      ) : (
        <g>
          {METALS.map((k, i) => <City key={k} id={`ac${k}`} k={k} x={X(i)} y={440 + Math.sin(t * 0.6 + i) * (t > la ? 10 : 0)} s={0.42} t={t} spin={1} />)}
          <Txt x={960} y={980} size={56} o={fin(t, mk(d, 'moment', 150), 14)}>एक पल में क्या मारेगा?</Txt>
        </g>
      )}
    </g>
  );
};

// ---------------------------------------------------------------- s10
const Stand: React.FC<SP> = ({ t, len, d }) => (
  <g transform={cam(960, 560, push(t, len))}>
    <Sky t={t} />
    <Shiva x={720} y={1000} s={0.95} t={t} pose="draw" pull={0.5} glow={0.4} />
    <Txt x={1400} y={260} size={58} o={fin(t, mk(d, 'years', 110), 14)}>१,००,००० वर्ष</Txt>
    <Txt x={1400} y={340} size={46} fill={P.snow} o={fin(t, mk(d, 'still', 140), 14)}>निश्चल</Txt>
  </g>
);
const GaneshaShot: React.FC<SP> = ({ t, len, d }) => {
  const th = mk(d, 'thumb', 20), vo = mk(d, 'voice', 160), pu = mk(d, 'puja', 330);
  return (
    <g>
      <Night t={t} />
      {/* the thumb on the bow-grip, Ganesha seated on it */}
      <path d="M200 1080 L200 760 Q200 640 420 620 L980 600 Q1100 600 1100 700 Q1100 800 980 800 L700 820 L700 1080 Z" fill="#1B2C58" stroke={P.gold} strokeWidth={4} />
      <path d="M1000 620 Q1080 640 1080 700" fill="none" stroke={P.gold} strokeWidth={2} />
      <path d="M1180 0 Q1260 540 1180 1080" fill="none" stroke={P.goldHi} strokeWidth={30} filter="url(#rkGlow)" />
      <Ganesha x={920} y={600} s={0.9} t={t} o={fin(t, th - 6, 16)} />
      <Txt x={1550} y={260} size={44} o={fin(t, vo, 14)}>आकाशवाणी:</Txt>
      <Txt x={1550} y={330} size={44} o={fin(t, vo + 10, 14)}>पहले विघ्नेश्वर की पूजा</Txt>
      {t > pu - 20 ? Array.from({ length: 24 }, (_, i) => <circle key={i} cx={700 + rnd(2, i) * 500} cy={((t - pu + 20) * 4 + rnd(3, i) * 300) % 700} r={8} fill={i % 2 ? '#FFB040' : P.lacquerHi} opacity={0.9} />) : null}
      <Label x={1550} y={620} hi="भद्रकाली की सहायता से" en="WITH BHADRAKALI" o={fin(t, pu - 30, 14)} size={36} />
    </g>
  );
};
const Merge: React.FC<SP> = ({ t, len, d }) => {
  const one = mk(d, 'one', 60);
  const k = easeOut(fin(t, 0, one));
  return (
    <g>
      <Sky t={t} n={120} />
      <circle cx={960} cy={110} r={60} fill="url(#rkSun)" />
      {METALS.map((m, i) => <City key={m} id={`mg${m}`} k={m} x={lerp(X(i), 960, k)} y={lerp(440 + (i - 1) * 160, 300 + i * 210, k)} s={lerp(0.36, 0.3, k)} t={t} />)}
      <path d="M960 160 L960 1000" stroke={P.goldHi} strokeWidth={30} opacity={0.3 * fin(t, one, 6) * (1 - fin(t, one + 30, 30))} /><path d="M960 160 L960 1000" stroke={P.goldHi} strokeWidth={5} opacity={fin(t, one, 6) * (1 - fin(t, one + 30, 30))} />
      <Txt x={1500} y={560} size={70} o={fin(t, one, 10)}>एक पल</Txt>
    </g>
  );
};
const Eye: React.FC<SP> = ({ t, len, d }) => {
  const gl = mk(d, 'glance', 50), rd = mk(d, 'red', 120), ld = mk(d, 'lid', 160), st = mk(d, 'stop', 200);
  const eye = t < ld ? 0 : t < st ? fin(t, ld, 20) * 0.6 : 0.6 * (1 - fin(t, st, 30));
  return (
    <g transform={cam(960, 330, lerp(1.6, 2.2, ease(fin(t, 0, len))))}>
      <Night t={t} />
      <Shiva x={960} y={900} s={1.0} t={t} anger={fin(t, rd, 30) * (1 - fin(t, st, 40))} eye={eye} />
      <Txt x={960} y={120} size={26} o={fin(t, gl, 12) * (1 - fin(t, rd, 12))}>“आप तो एक दृष्टि से जला सकते हैं”</Txt>
    </g>
  );
};
const Plead: React.FC<SP> = ({ t, len, d }) => {
  const re = mk(d, 'release', 170), la = mk(d, 'laugh', 210);
  return (
    <g>
      <Night t={t} />
      <path d="M200 540 L1640 540" stroke="#6FA0FF" strokeWidth={16} strokeLinecap="round" />
      <path d="M1640 500 L1740 540 L1640 580 Z" fill={P.goldHi} />
      <Flame x={1750} y={560} h={80} t={t} seed={5} />
      {[['विष्णु', '#6FA0FF'], ['सोम', P.star], ['कालाग्नि', '#FF8A3A'], ['वायु', '#B8D8E8']].map(([n, c], i) => (
        <g key={i} opacity={fin(t, 20 + i * 18, 14)}>
          <circle cx={420 + i * 320} cy={540} r={70} fill={c} opacity={0.25} filter="url(#rkBlur8)" />
          <Txt x={420 + i * 320} y={440} size={44} fill={c}>{n}</Txt>
        </g>
      ))}
      <Txt x={960} y={780} size={52} o={fin(t, re - 30, 14)}>“प्रभु, हमारे लिए, बाण छोड़िए”</Txt>
      <Txt x={960} y={900} size={34} fill={P.snow} o={fin(t, re - 20, 14)}>लिंग पुराण</Txt>
      <Glow x={960} y={540} r={700} o={0.4 * fin(t, la, 20)} />
    </g>
  );
};

// ---------------------------------------------------------------- s11 the burning
const DrawShot: React.FC<SP> = ({ t, len, d }) => {
  const dr = mk(d, 'draw', 80), tw = mk(d, 'twang', 120), rl = mk(d, 'release', 230);
  const pull = t < rl ? easeOut(fin(t, dr - 20, 50)) : 0;
  const ax = t < rl ? -1 : lerp(1000, 2600, clamp((t - rl) / 14));
  return (
    <g transform={cam(960, 560, push(t, len, 1.0, 1.08))}>
      <Sky t={t} />
      <circle cx={1500} cy={120} r={70} fill="url(#rkSun)" />
      <Shiva x={560} y={1020} s={1.0} t={t} pose="draw" pull={pull} arrow={t < rl} eye={0.3} glow={0.5} />
      {t > tw ? <Rings x={812} y={560} t={t} a={tw} n={3} c="#86D6A6" /> : null}
      <Txt x={1360} y={300} size={48} o={fin(t, 6, 14) * (1 - fin(t, rl, 10))}>अभिजित् मुहूर्त</Txt>
      {ax > 0 ? <g><path d={`M${ax - 760} 568 L${ax} 568`} stroke="#FFB040" strokeWidth={60} strokeLinecap="round" opacity={0.35} /><path d={`M${ax - 700} 568 L${ax} 568`} stroke="#FFE9B0" strokeWidth={14} strokeLinecap="round" /><Flame x={ax} y={580} h={120} t={t} seed={7} /></g> : null}
      <Txt x={1360} y={900} size={64} o={fin(t, rl + 6, 12)}>करोड़ सूर्यों जैसा</Txt>
    </g>
  );
};
const MeltGold: React.FC<SP> = ({ t, len, d }) => {
  const me = mk(d, 'melt', 40), sk = mk(d, 'skin', 190);
  return (
    <g transform={`translate(${Math.sin(t * 1.3) * 3} 0)`}>
      <rect width={W} height={H} fill="#1A0804" />
      <Embers t={t} n={90} o={0.9} />
      <City id="mgold" k="gold" x={960} y={460} s={1.0} t={t} burn={fin(t, 0, 30)} heat={fin(t, me - 20, 40)} melt={fin(t, me, 60)} />
      {/* figures in the street below, gold pouring over them */}
      {Array.from({ length: 7 }, (_, i) => {
        const x = 420 + i * 180, hit = sk - 60 + i * 8;
        return (
          <g key={i}>
            <Mini x={x} y={1060} s={0.34} tone="navy" mace={false} dust={fin(t, hit + 40, 50)} seed={i} />
            <path d={`M${x - 20} ${720} Q${x} ${lerp(720, 1040, fin(t, hit, 30))} ${x + 20} 720`} fill={METAL.gold.hi} opacity={fin(t, hit, 6) * 0.95} />
          </g>
        );
      })}
      <Txt x={960} y={120} size={44} o={fin(t, sk, 14)}>खाल से चिपकता सोना, मांस तक उतरता</Txt>
    </g>
  );
};
const MeltSilver: React.FC<SP> = ({ t, len, d }) => {
  const se = mk(d, 'set', 110);
  const lvl = lerp(1080, 880, fin(t, 0, se));
  return (
    <g>
      <rect width={W} height={H} fill="#140A10" />
      <Embers t={t} n={70} o={0.8} />
      <City id="msil" k="silver" x={960} y={380} s={0.8} t={t} burn={1} heat={0.7} melt={1} />
      {Array.from({ length: 6 }, (_, i) => <Mini key={i} x={360 + i * 240} y={1040} s={0.32} tone="navy" mace={false} />)}
      <rect x={0} y={lvl} width={W} height={H - lvl} fill="#E8EEF8" opacity={0.92} />
      {Array.from({ length: 30 }, (_, i) => <circle key={i} cx={rnd(5, i) * 1920} cy={lvl + 10 + rnd(6, i) * 40} r={4 + 6 * Math.abs(Math.sin(t * 0.2 + i))} fill="#FFFFFF" opacity={0.6} />)}
      <Txt x={960} y={120} size={44} o={fin(t, se - 20, 14)}>जो खड़े थे, उनके पैर उसी में जम गए</Txt>
    </g>
  );
};
const MeltIron: React.FC<SP> = ({ t, len, d }) => {
  const wh = mk(d, 'white', 60), sc = mk(d, 'scream', 100), ha = mk(d, 'hair', 150), ey = mk(d, 'eyes', 190);
  return (
    <g>
      <rect width={W} height={H} fill="#1A0604" />
      <Embers t={t} n={90} o={0.9} />
      <City id="miron" k="iron" x={960} y={500} s={1.05} t={t} burn={1} heat={0.35 + 0.65 * fin(t, wh - 20, 40)} melt={0.6} />
      {t > sc ? <Rings x={960} y={360} t={t} a={sc} n={4} c="#FFB060" /> : null}
      {/* hair first, then the eyes */}
      <g opacity={fin(t, ha - 10, 14)}>
        {Array.from({ length: 5 }, (_, i) => (
          <g key={i} transform={`translate(${520 + i * 220} 980)`}>
            <circle cx={0} cy={-60} r={46} fill="#0A0606" stroke="#FF8A3A" strokeWidth={3} />
            <Flame x={0} y={-96} h={lerp(20, 90, fin(t, ha, 30))} t={t + i * 9} seed={i} />
            <circle cx={-14} cy={-64} r={6} fill={t > ey ? '#FFB040' : '#E8E0D0'} />
            <circle cx={14} cy={-64} r={6} fill={t > ey ? '#FFB040' : '#E8E0D0'} />
            {t > ey ? <Flame x={0} y={-56} h={40} t={t + i * 5} seed={i + 3} /> : null}
          </g>
        ))}
      </g>
      <Txt x={960} y={120} size={44} o={fin(t, sc, 14)}>भीतर की चीख़ें धातु में ही सिक गईं</Txt>
    </g>
  );
};
const Runners: React.FC<SP> = ({ t, len, d }) => {
  const as = mk(d, 'ash', 50), sm = mk(d, 'smoke', 130), ol = mk(d, 'old', 170), co = mk(d, 'coal', 250);
  return (
    <g>
      <rect width={W} height={H} fill="#1A0804" />
      <FireLine x0={0} x1={1920} y={760} h={260} t={t} n={22} seed={9} />
      <rect x={0} y={760} width={W} height={320} fill="#0A0402" />
      {t < ol ? Array.from({ length: 6 }, (_, i) => {
        const x = 200 + i * 260 + t * 3;
        const a = as - 20 + i * 10;
        return (
          <g key={i}>
            <g opacity={1 - fin(t, a, 30)}><Mini x={x} y={1000} s={0.38} tone="navy" mace={false} flip={i % 2 === 0} /><Flame x={x} y={860} h={80} t={t + i * 3} seed={i} /></g>
            <DustBurst x={x + 30} y={980} p={fin(t, a, 50)} seed={i + 2} n={40} spread={70} h={300} />
          </g>
        );
      }) : (
        <g>
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(${520 + i * 440} 980)`}>
              <rect x={-150} y={-40} width={300} height={40} fill="#2A1408" stroke="#FF8A3A" strokeWidth={2} />
              <path d="M-120 -40 Q-60 -90 0 -60 Q60 -40 120 -50 L120 -40 L-120 -40 Z" fill={t > co ? '#14100C' : '#0B1736'} stroke={t > co ? '#3A3430' : P.snow} strokeWidth={3} />
              <circle cx={-110} cy={-70} r={26} fill={t > co ? '#14100C' : '#0B1736'} stroke={t > co ? '#3A3430' : P.snow} strokeWidth={3} />
              <FireLine x0={-150} x1={150} y={-40} h={120} t={t} n={6} seed={i + 4} />
            </g>
          ))}
        </g>
      )}
      <Embers t={t} n={80} o={0.9} ash={0.5} />
      <Txt x={960} y={120} size={44} o={fin(t, sm - 20, 14) * (1 - fin(t, ol - 10, 10))}>एक क़दम मांस का, अगला धुएँ का</Txt>
      <Txt x={960} y={120} size={44} o={fin(t, co - 10, 14)}>बूढ़े, बिस्तर पर ही कोयला हुए</Txt>
    </g>
  );
};
const Mothers: React.FC<SP> = ({ t, len, d }) => {
  const as = mk(d, 'ash', 140), sl = mk(d, 'sleep', 210);
  const gone = fin(t, as, 40);
  return (
    <g>
      <rect width={W} height={H} fill="#1A0804" />
      <Embers t={t} n={80} o={0.8} ash={gone} />
      {t < sl - 10 ? (
        <g transform="translate(960 1000)">
          <g opacity={1 - gone}>
            <path d="M-70 0 Q-90 -200 -40 -280 L40 -280 Q90 -200 70 0 Z" fill="#0B1736" stroke="#FF8A3A" strokeWidth={4} />
            <circle cx={0} cy={-320} r={44} fill="#0B1736" stroke="#FF8A3A" strokeWidth={4} />
            {/* the child held to her chest */}
            <circle cx={10} cy={-220} r={26} fill="#0B1736" stroke="#FF8A3A" strokeWidth={3} />
            <path d="M-50 -250 Q0 -170 60 -230" fill="none" stroke="#FF8A3A" strokeWidth={10} strokeLinecap="round" />
            <FireLine x0={-90} x1={90} y={0} h={lerp(80, 340, fin(t, 0, as))} t={t} n={7} seed={6} />
          </g>
          <DustBurst x={0} y={-160} p={gone} seed={12} n={120} spread={140} h={420} />
          <ellipse cx={0} cy={0} rx={lerp(0, 80, gone)} ry={lerp(0, 14, gone)} fill="#3A3430" />
        </g>
      ) : (
        <g transform="translate(960 900)">
          {/* two figures asleep, never waking */}
          <path d="M-260 0 Q-120 -60 0 -40 Q120 -60 260 0 Z" fill="#0B1736" stroke="#FF8A3A" strokeWidth={3} />
          <circle cx={-270} cy={-30} r={34} fill="#0B1736" stroke="#FF8A3A" strokeWidth={3} />
          <circle cx={-200} cy={-40} r={30} fill="#0B1736" stroke="#FF8A3A" strokeWidth={3} />
          <FireLine x0={-300} x1={300} y={0} h={240} t={t} n={10} seed={8} />
        </g>
      )}
      <Txt x={960} y={120} size={44} o={fin(t, as, 14) * (1 - fin(t, sl - 10, 10))}>एक मुट्ठी राख</Txt>
      <Txt x={960} y={120} size={44} o={fin(t, sl, 14)}>जागीं भी नहीं</Txt>
    </g>
  );
};
const Everything: React.FC<SP> = ({ t, len, d }) => (
  <g transform={cam(960, 540, push(t, len, 1.1, 1))}>
    <rect width={W} height={H} fill="#200A04" />
    {METALS.map((k, i) => <City key={k} id={`ev${k}`} k={k} x={X(i)} y={500} s={0.45} t={t} burn={1} heat={0.8} melt={0.8} ash={fin(t, mk(d, 'nothing', 140) - 20 + i * 6, 60) * 0.5} />)}
    <FireLine x0={0} x1={1920} y={1080} h={460} t={t} n={24} seed={11} />
    <Embers t={t} n={120} o={1} ash={0.4} />
    <Txt x={960} y={140} size={56} fill="#FFE9B0" o={fin(t, mk(d, 'nothing', 140), 14)}>आज्ञा थी: कुछ न बचे</Txt>
  </g>
);
const TkPrayer: React.FC<SP> = ({ t, len, d }) => (
  <g transform={cam(960, 540, push(t, len, 1, 1.15))}>
    <rect width={W} height={H} fill="#1A0604" />
    <FireLine x0={500} x1={1420} y={1060} h={520} t={t} n={14} seed={13} o={0.9} />
    <Asura id="tkp" x={960} y={1000} s={1.15} pose="rest" tone="navy" fierce={false} t={t} />
    <Glow x={960} y={420} r={260} o={0.5 * fin(t, mk(d, 'bhava', 100), 30)} />
    <Embers t={t} n={70} o={0.9} ash={0.3} />
    <Txt x={960} y={140} size={56} o={fin(t, mk(d, 'bhava', 100), 14)}>“हे भव”</Txt>
    <Txt x={960} y={220} size={40} fill={P.snow} o={fin(t, mk(d, 'bhakti', 200) - 40, 14)}>जन्म-जन्मांतर हमारी बुद्धि तुम्हारी भक्ति में रहे</Txt>
    <Txt x={960} y={1050} size={26} fam={F.brand} fill={P.snow} w={500} o={fin(t, 30, 14) * 0.8}>Tarakaksha, burning · Shiva Mahapurana, Yuddha Khanda 10.32–33</Txt>
  </g>
);

// ---------------------------------------------------------------- s12
const AshFall: React.FC<SP> = ({ t, len, d }) => {
  const as = mk(d, 'ash', 80), fl = mk(d, 'flowers', 200);
  return (
    <g>
      <Sky t={t} n={120} />
      <Ground y={940} />
      <City id="af" k="iron" x={960} y={lerp(300, 1000, easeOut(fin(t, 0, as)))} s={0.6} t={t} burn={1 - fin(t, as, 30)} heat={0.6} ash={fin(t, as, 30)} />
      <path d={`M${960 - 300 * fin(t, as, 30)} 940 Q960 ${940 - 60 * fin(t, as, 30)} ${960 + 300 * fin(t, as, 30)} 940`} fill="#3A3430" />
      <Embers t={t} n={60} o={0.6} ash={1} />
      <g opacity={fin(t, fl - 30, 20)}><Shiva x={1560} y={940} s={0.6} t={t} glow={0.5} /></g>
      {t > fl ? Array.from({ length: 40 }, (_, i) => <circle key={i} cx={1300 + rnd(7, i) * 520} cy={((t - fl) * 3 + rnd(8, i) * 600) % 700 + 100} r={7} fill={i % 3 ? P.lacquerHi : '#FFB040'} />) : null}
    </g>
  );
};
const MayaVitala: React.FC<SP> = ({ t, len, d }) => {
  const vi = mk(d, 'vitala', 140), ga = mk(d, 'ganas', 280);
  return (
    <g>
      <Night t={t} />
      <rect x={0} y={900} width={W} height={180} fill="#2A2420" opacity={0.6} />
      <g transform={`translate(0 ${lerp(0, 220, easeOut(fin(t, vi, 60)))})`}>
        <Asura id="mv" x={760} y={900} s={0.95} pose="rest" tone="navy" fierce={false} t={t} />
        <Glow x={760} y={600} r={260} o={0.5} />
      </g>
      <Label x={760} y={180} hi="केवल मय बचा" en="ONLY MAYA SURVIVED · TO VITALA" o={fin(t, 10, 14)} size={46} />
      {Array.from({ length: 10 }, (_, i) => <g key={i} opacity={fin(t, ga - 20 + i * 4, 14)}><Mini x={1260 + (i % 5) * 120} y={lerp(900, 500 - Math.floor(i / 5) * 80, fin(t, ga, 60))} s={0.24} tone="navy" rim={1} /><circle cx={1260 + (i % 5) * 120} cy={lerp(900, 500 - Math.floor(i / 5) * 80, fin(t, ga, 60)) - 60} r={50} fill="url(#rkHalo)" /></g>)}
      <Txt x={1500} y={300} size={36} o={fin(t, ga, 14)}>जो जलते-जलते भी शिव को पूज रहे थे: गणों के स्वामी</Txt>
    </g>
  );
};
const MundisDesert: React.FC<SP> = ({ t, len, d }) => (
  <g>
    <rect width={W} height={H} fill="#1A1408" />
    <circle cx={1500} cy={260} r={90} fill="url(#rkSun)" />
    <path d="M0 760 Q300 700 600 760 Q900 820 1200 740 Q1500 690 1920 760 L1920 1080 L0 1080 Z" fill="#3A2A10" stroke="#C8963A" strokeWidth={2} />
    {[0, 1, 2, 3, 4].map((i) => <Mundi key={i} x={lerp(300, 1400, fin(t, 0, len)) - i * 130} y={820 + i * 12} s={0.42 - i * 0.03} t={t + i * 9} sweep={1} />)}
    <Txt x={960} y={160} size={44} o={fin(t, mk(d, 'desert', 60), 14)}>मरुस्थल में छिपे रहो, कलियुग तक</Txt>
    <Txt x={960} y={240} size={38} fill="#FF9A3A" o={fin(t, mk(d, 'kali', 130), 14)}>कलियुग में जो यह मत अपनाएगा, वह नष्ट होगा</Txt>
  </g>
);
const Patanjali: React.FC<SP> = ({ t, len, d }) => {
  const da = mk(d, 'daya', 50), wh = mk(d, 'why', 160), nv = mk(d, 'never', 240);
  return (
    <g>
      <Night t={t} />
      <Glow x={960} y={420} r={560} o={0.35} />
      <Txt x={960} y={260} size={52} fam={F.sanskrit} o={fin(t, 6, 16)}>हरं त्रिपुरभञ्जनम् अनन्तकृतकङ्कणम्</Txt>
      <Txt x={960} y={340} size={52} fam={F.sanskrit} o={fin(t, 16, 16)}>अखण्डदयम् अन्तरहितम्…</Txt>
      <Txt x={960} y={400} size={26} fam={F.brand} fill={P.snow} w={500} o={fin(t, 26, 16)}>Patanjali · Charana-shringa-rahita Nataraja Stotra</Txt>
      <Txt x={960} y={560} size={72} o={fin(t, da, 14)}>अखण्ड-दय</Txt>
      <Txt x={960} y={630} size={34} fam={F.brand} fill={P.snow} w={600} ls={3} o={fin(t, da + 10, 14)}>HE BURNED TRIPURA OUT OF BOUNDLESS COMPASSION</Txt>
      <Txt x={960} y={800} size={50} fill="#FF9A3A" o={fin(t, wh, 14)}>दया से जलाना?</Txt>
      <Txt x={960} y={900} size={50} o={fin(t, nv, 14)}>हम कभी आकाश में थे ही नहीं</Txt>
    </g>
  );
};
const Within: React.FC<SP> = ({ t, len, d }) => {
  const a = [mk(d, 'sthula', 50), mk(d, 'sukshma', 80), mk(d, 'karana', 110)];
  const b = [mk(d, 'j', 140), mk(d, 's', 170), mk(d, 'ss', 190)];
  const ci = mk(d, 'circle', 270);
  return (
    <g>
      <Night t={t} />
      <ThreeBodies x={960} y={1000} s={1.6} t={t} lit={[fin(t, a[0], 14), fin(t, a[1], 14), fin(t, a[2], 14)]} />
      {['स्थूल', 'सूक्ष्म', 'कारण'].map((w, i) => <Label key={w} x={360} y={300 + i * 180} hi={`${w} देह`} en={['GROSS BODY · IRON', 'SUBTLE BODY · SILVER', 'CAUSAL BODY · GOLD'][i]} o={fin(t, a[i], 14)} size={46} />)}
      {['जाग्रत', 'स्वप्न', 'सुषुप्ति'].map((w, i) => <Label key={w} x={1560} y={300 + i * 180} hi={w} en={['WAKING', 'DREAM', 'DEEP SLEEP'][i]} o={fin(t, b[i], 14)} size={46} />)}
      {t > ci ? METALS.map((k, i) => {
        const ang = (t - ci) * 0.03 + i * 2.1;
        return <circle key={k} cx={960 + Math.cos(ang) * 420} cy={560 + Math.sin(ang) * 120} r={16} fill={METAL[k].line} filter="url(#rkGlow)" />;
      }) : null}
    </g>
  );
};
const Turiya: React.FC<SP> = ({ t, len, d }) => (
  <g>
    <Night t={t} />
    <ThreeBodies x={960} y={1000} s={1.6} t={t} lit={[0.5, 0.5, 0.5]} witness={fin(t, mk(d, 'witness', 80), 30)} />
    <Label x={960} y={180} hi="तुरीय" en="THE FOURTH · THE WITNESS" o={fin(t, 10, 14)} size={64} />
    <Txt x={1560} y={560} size={40} fill={P.snow} o={fin(t, mk(d, 'ramana', 110), 14)}>रमण महर्षि:</Txt>
    <Txt x={1560} y={620} size={44} o={fin(t, mk(d, 'sakshi', 230) - 20, 14)}>“मैं नींद का साक्षी हूँ”</Txt>
  </g>
);
const TulaShot: React.FC<SP> = ({ t, len, d }) => {
  const wo = mk(d, 'world', 120), lo = mk(d, 'lord', 170), em = mk(d, 'empty', 200), si = mk(d, 'sits', 300), st = mk(d, 'still', 390);
  const tilt = t < si ? Math.sin(t * 0.18) * 0.5 * fin(t, em, 20) : -lerp(0, 1, easeOut(fin(t, si, 40)));
  return (
    <g>
      <Night t={t} />
      <Tula x={960} y={1000} s={1.05} tilt={tilt}
        left={t > si ? <g><Glow x={0} y={-60} r={140} o={0.7} /><Lotus x={0} y={-10} s={0.6} c={P.goldHi} /></g> : null}
        right={t > wo ? <g opacity={fin(t, wo, 14)}>{METALS.map((k, i) => <City key={k} id={`tw${k}`} k={k} x={(i - 1) * 70} y={-50 - (i % 2) * 30} s={0.1} t={t} />)}</g> : null} />
      <Txt x={960} y={130} size={48} o={fin(t, 6, 14)}>मन को तराज़ू बनाओ</Txt>
      <Txt x={960} y={200} size={36} fill={P.snow} o={fin(t, lo, 14)}>एक पलड़े में संसार, दूसरे में श्रीपति</Txt>
      <Txt x={960} y={1050} size={40} o={fin(t, st, 14)}>दूसरे में कुछ भी रखो, वह नहीं उठता</Txt>
      <Txt x={1660} y={480} size={24} fam={F.brand} fill={P.snow} w={500} o={fin(t, 20, 14) * 0.8}>Prabodha Sudhakara · Adi Shankaracharya</Txt>
    </g>
  );
};
const ArrowIn: React.FC<SP> = ({ t, len, d }) => {
  const ar = mk(d, 'arrow', 100), bu = mk(d, 'burn', 180);
  const ax = lerp(-200, 900, clamp((t - ar) / 16));
  return (
    <g>
      <Night t={t} />
      <ThreeBodies x={960} y={1000} s={1.5} t={t} witness={1} burn={fin(t, bu, 10)} lit={[1 - fin(t, bu, 40), 1 - fin(t, bu + 10, 40), 1 - fin(t, bu + 20, 40)]} />
      {t > ar ? <g><path d={`M${ax - 520} 560 L${ax} 560`} stroke="#FFB040" strokeWidth={40} strokeLinecap="round" opacity={0.35} /><path d={`M${ax - 500} 560 L${ax} 560`} stroke="#FFE9B0" strokeWidth={10} strokeLinecap="round" /><Flame x={ax} y={572} h={60} t={t} seed={2} /></g> : null}
      {t > bu ? <g><Glow x={960} y={560} r={500} o={0.6 * (1 - fin(t, bu + 40, 60))} heat /><Embers t={t} n={60} o={0.8} ash={0.2} box={[560, 200, 800, 800]} /></g> : null}
      <Txt x={960} y={140} size={48} o={fin(t, 6, 14)}>सुख आए, दुख आए, पलड़ा न हिले</Txt>
      <Txt x={960} y={1050} size={52} fill="#FF9A3A" o={fin(t, bu, 14)}>उस दिन तुम्हारा त्रिपुर जलता है</Txt>
    </g>
  );
};
const Fruit: React.FC<SP> = ({ t, len, d }) => {
  const ur = mk(d, 'urva', 120), fr = mk(d, 'free', 230);
  const fy = t < fr ? 460 : lerp(460, 900, clamp((t - fr) / 30) ** 2);
  return (
    <g>
      <Night t={t} />
      <path d="M300 300 Q700 260 960 340 Q1200 410 1620 320" fill="none" stroke="#3A6A2A" strokeWidth={10} />
      {[500, 800, 1300].map((x) => <ellipse key={x} cx={x} cy={300 + (x % 3) * 10} rx={40} ry={18} fill="#3A6A2A" />)}
      <path d={`M960 340 L960 ${t < fr ? 400 : 380}`} stroke="#3A6A2A" strokeWidth={5} />
      <ellipse cx={960} cy={fy} rx={50} ry={70} fill="#C8A040" stroke={P.goldHi} strokeWidth={3} />
      <Txt x={960} y={160} size={46} fam={F.sanskrit} o={fin(t, ur - 20, 14)}>उर्वारुकमिव बन्धनान् मृत्योर्मुक्षीय मामृतात्</Txt>
      <Txt x={960} y={1040} size={42} o={fin(t, fr, 14)}>पके फल की तरह, बंधन से छूट जाऊँ</Txt>
      <Txt x={960} y={220} size={26} fam={F.brand} fill={P.snow} w={500} o={fin(t, ur, 14) * 0.8}>The Mahamrityunjaya mantra · Rigveda 7.59.12</Txt>
    </g>
  );
};
const NightShot: React.FC<SP> = ({ t, len, d }) => {
  const ct = mk(d, 'count', 40), el = mk(d, 'eleven', 110);
  const n = t < el ? 0 : Math.min(11, Math.floor((t - el) / 8) + 1);
  return (
    <g>
      <rect width={W} height={H} fill={P.abyss} />
      <Stars t={t} n={80} o={0.5} box={[0, 0, W, 500]} />
      <Flame x={960} y={820} h={90} t={t} seed={1} />
      <path d="M900 826 L1020 826 L1000 850 L920 850 Z" fill={P.goldDeep} />
      <Glow x={960} y={760} r={300} o={0.5} />
      {Array.from({ length: 11 }, (_, i) => <circle key={i} cx={960 + Math.cos((i / 11) * Math.PI * 2 - Math.PI / 2) * 220} cy={560 + Math.sin((i / 11) * Math.PI * 2 - Math.PI / 2) * 220} r={14} fill={i < n ? '#8C5A2A' : 'none'} stroke="#8C5A2A" strokeWidth={3} />)}
      <Txt x={960} y={160} size={44} o={fin(t, ct, 14)}>आज कितनी बार डगमगाए?</Txt>
      <Txt x={960} y={580} size={56} o={fin(t, el, 14)}>शिव</Txt>
    </g>
  );
};
const Final: React.FC<SP> = ({ t, len, d }) => {
  const ari = mk(d, 'ari', 50);
  return (
    <g>
      <Night t={t} />
      {METALS.map((k, i) => <City key={k} id={`fn${k}`} k={k} x={X(i)} y={320} s={0.3} t={t} o={0.6 * (1 - fin(t, ari, 30))} />)}
      <Shiva x={960} y={1060} s={0.85} t={t} glow={0.6 * fin(t, ari, 20)} o={fin(t, ari - 10, 20)} />
      <Txt x={960} y={180} size={90} o={fin(t, 2, 12) * (1 - fin(t, ari, 14))}>हम त्रिपुर थे</Txt>
      <Txt x={960} y={180} size={90} fill="#FF9A3A" o={fin(t, ari, 14)}>वह त्रिपुरारि है</Txt>
    </g>
  );
};

// ---------------------------------------------------------------- registry
const KINDS: Record<string, React.FC<SP>> = {
  open_card: OpenCard, title_card: TitleCard, closing: Closing,
  sky3: Sky3, names: Names, question: Question, listen: Listen,
  taraka: Taraka, skanda: Skanda, sons: Sons, nolearn: NoLearn, prahlada: Prahlada, tapas: Tapas, brahma_appears: BrahmaAppears,
  ask: Ask, atma: Atma, mock: Mock, bigheart: BigHeart, blueprint: Blueprint, assign: Assign, condition: Condition, impossible: Impossible, evamastu: Evamastu,
  maya: Maya, inside: Inside, conquer: Conquer, command: Command, seasons: Seasons, strength: Strength,
  three_strengths: ThreeStrengths, kailasa: Kailasa, bhutas: Bhutas, understand: Understand,
  mundi_born: MundiBorn, mundi_name: MundiName, mundi_fail: MundiFail, narada_cert: NaradaCert, initiation: Initiation,
  doctrine: Doctrine, body_food: BodyFood, caste: Caste, proclaim: Proclaim, abandon: Abandon, wives: Wives, alakshmi: Alakshmi, fault: Fault,
  japa: Japa, hesitate: Hesitate, nochariot: NoChariot, kumbhodara: Kumbhodara, mantra: Mantra, wheels: Wheels, driver: Driver, bow: Bow,
  laugh_chariot: LaughChariot, horses_fall: HorsesFall, shesha_bull: SheshaBull, vishnu_bull: VishnuBull, pashupati: Pashupati, ascend: Ascend,
  stand: Stand, ganesha: GaneshaShot, merge: Merge, eye: Eye, plead: Plead,
  draw: DrawShot, melt_gold: MeltGold, melt_silver: MeltSilver, melt_iron: MeltIron, runners: Runners, mothers: Mothers, everything: Everything, tk_prayer: TkPrayer,
  ashfall: AshFall, maya_vitala: MayaVitala, mundis_desert: MundisDesert, patanjali: Patanjali, within: Within, turiya: Turiya, tula: TulaShot, arrow_in: ArrowIn,
  fruit: Fruit, night: NightShot, final: Final,
};

export const buildShots = (defs: Def[]) => {
  const map: Record<string, React.FC<ShotProps>> = {};
  for (const d of defs) {
    const K = KINDS[d.kind];
    map[d.id] = (props: ShotProps) => (
      <g>
        <Defs />
        <MetalDefs />
        {K ? <K {...props} d={d} /> : <Txt x={960} y={540} size={40}>{d.kind}</Txt>}
      </g>
    );
  }
  return map;
};
