import React, { useMemo } from 'react';
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame } from 'remotion';
import { P, F, Defs, clamp, ease, easeOut, rnd } from '../raktabija/world';
import { EN, KUBERA, LOSHU_FLIP, LINES, Grid, Sky, KDefs, T, Cow, Temple, Lamp, Lotus, Mountains, Seated, Card, Compass, Shell, deva } from './art';
import TL from './timeline.json';

// The Kubera Code (Hidden in Plain Sight, ep. 1). 1920×1080. Every beat starts on its cue word (research/kubera/build.py).
// Four real images (Bharhut 1879 plate, TA 1872 page, Khajuraho square, Nālandā bronze) appear as credited evidence;
// everything else is drawn in code.

type Beat = { scene: string; s: number; e: number; cues: Record<string, number>; sec: string };
type Word = { w: string; s: number; e: number };
type Chant = { key: string; s: number; e: number; halves: number[][]; deva: string[]; iast: string[]; src: string; img?: string | null; credit?: string | null };
const tl = TL as unknown as { total: number; len: number; audio: string; beats: Beat[]; words: Word[]; chants: Chant[] };
const W = 1920, H = 1080;

type SP = { t: number; b: Beat; lt: number; on: (k: string, d?: number) => number; at: (k: string) => number };

const Photo: React.FC<{ src: string; x: number; y: number; w: number; h: number; o?: number; credit?: string; zoom?: number; fit?: 'cover' | 'contain' }> = ({ src, x, y, w, h, o = 1, credit, zoom = 1, fit = 'contain' }) => (
  <g opacity={o}>
    <rect x={x - 14} y={y - 14} width={w + 28} height={h + 28} fill="#0A0F1E" stroke={P.gold} strokeWidth={3} rx={6} />
    <foreignObject x={x} y={y} width={w} height={h}>
      <div style={{ width: w, height: h, overflow: 'hidden', background: '#0A0F1E' }}>
        <Img src={staticFile(src)} style={{ width: w, height: h, objectFit: fit, transform: `scale(${zoom})`, transformOrigin: '50% 40%' }} />
      </div>
    </foreignObject>
    {credit && <text x={x + w / 2} y={y + h + 46} textAnchor="middle" fontFamily={EN} fontStyle="italic" fontSize={24} fill={P.snow}>{credit}</text>}
  </g>
);

// ---------------- scenes ----------------
const S: Record<string, React.FC<SP>> = {
  doorstep: ({ t, lt }) => {
    const d = clamp(lt / 6);
    return (<g>
      <Sky t={t} warm={0.9} />
      <path d="M0 640 L1920 640 L1920 1080 L0 1080 Z" fill="url(#kFloor)" />
      <path d="M0 640 L1920 640" stroke="#6B4A33" strokeWidth={6} />
      <path d="M560 640 L560 360 Q960 250 1360 360 L1360 640" fill="#120C14" stroke="#6B4A33" strokeWidth={8} />
      <g transform="translate(960 800) scale(1 0.62)"><Grid x={0} y={0} c={165} nums={KUBERA} rice draw={d} shown={KUBERA.map((_, i) => clamp(d * 10 - 1 - i))} /></g>
    </g>);
  },
  lines72: ({ t, lt }) => {
    const k = Math.min(8, Math.floor(lt / 0.75) + 1);
    return (<g><Sky t={t} warm={0.4} />
      <Grid x={960} y={500} c={230} nums={KUBERA} lit={LINES.map((_, i) => ({ i, o: i < k ? (i === k - 1 ? 1 : 0.35) : 0 })).filter((l) => l.o > 0)} />
      <T x={960} y={968} s={64} o={clamp(lt / 0.8)}>{'= 72'}</T>
    </g>);
  },
  yantraName: ({ t, lt }) => (<g><Sky t={t} warm={0.2} />
    <circle cx={960} cy={470} r={380} fill="url(#kGlowGold)" opacity={0.35 * clamp(lt)} />
    <Grid x={960} y={470} c={200} nums={KUBERA} />
    <T x={960} y={930} s={92} o={clamp(lt / 0.7)} ls={10}>KUBERA YANTRA</T>
    <T x={960} y={968} s={36} o={clamp((lt - 0.8) / 0.7)} c={P.snow} i>the seat of the guardian of treasure</T>
  </g>),
  hands: ({ t, lt }) => (<g><Sky t={t} warm={0.6} />
    {[0, 1, 2, 3, 4].map((i) => <g key={i} opacity={clamp((lt - i * 0.6) / 0.6) * (0.25 + 0.15 * i)}><Grid x={300 + i * 330} y={540 + (i % 2 ? 60 : -60)} c={80} nums={KUBERA} rice fs={30} /></g>)}
    <T x={960} y={960} s={44} c={P.snow} i o={clamp((lt - 1) / 0.8)}>no book · only hands · generation after generation</T>
  </g>),
  minus19: ({ t, lt, on }) => {
    const p = clamp(lt / 2.2), tu = on('turtle', 1.4);
    const nums = KUBERA.map((n, i) => (p * 9 > i ? n - 19 : n));
    return (<g><Sky t={t} />
      <Shell x={960} y={520} s={1.25} o={tu} />
      <Grid x={960} y={520} c={180} nums={nums} text={p > 0.98 ? P.goldHi : P.ember} />
      <T x={960} y={110} s={58} o={1 - tu}>− 19</T>
      <T x={960} y={968} s={44} c={P.snow} i o={tu}>洛書 · Lo Shu, the turtle-shell square of China</T>
    </g>);
  },
  agenda: ({ t, on }) => (<g><Sky t={t} />
    {[['god', 'THE GOD'], ['square', 'THE SQUARE'], ['mantra', 'THE MANTRA'], ['rules', 'THE RULES'], ['logic', 'THE LOGIC']].map(([k, l], i) => (
      <T key={k} x={960} y={300 + i * 130} s={70} ls={8} o={on(k, 0.5)} c={i === 4 ? P.ember : P.goldHi}>{l}</T>))}
  </g>),
  title: ({ t, lt }) => (<g><Sky t={t} />
    <circle cx={960} cy={520} r={520} fill="url(#kGlowGold)" opacity={0.25 + 0.1 * Math.sin(lt * 2)} />
    <Grid x={960} y={520} c={110} nums={KUBERA} o={0.12} />
    <T x={960} y={520} s={150} ls={14} o={clamp(lt / 1.2)}>THE KUBERA CODE</T>
    <T x={960} y={620} s={44} c={P.snow} i o={clamp((lt - 1) / 1)}>Hidden in Plain Sight</T>
  </g>),
  cosmicCow: ({ t, lt }) => (<g><Sky t={t} /><Cow x={960} y={520} s={1.6} o={clamp(lt / 1.2)} calf={clamp((lt - 2) / 1)} />
    <T x={960} y={980} s={40} c={P.snow} i o={clamp(lt / 1)}>Atharvaveda 8.10 · Virāj, the cosmic cow</T></g>),
  calf: ({ t, lt, on }) => (<g><Sky t={t} /><Cow x={960} y={500} s={1.6} calf={1} glow={clamp(lt)} />
    <T x={1300} y={880} s={54} o={clamp(lt)}>Kubera Vaiśravaṇa</T>
    <rect x={0} y={0} width={W} height={H} fill="#020611" opacity={0.55 * on('veil', 1.5)} />
    <T x={960} y={980} s={70} ls={6} o={on('veil', 1)}>tirodhā · concealment</T></g>),
  roots: ({ t, lt, on }) => (<g><Sky t={t} />
    <T x={960} y={250} s={150} o={clamp(lt / 0.6)}>√dhā</T><T x={960} y={320} s={40} c={P.snow} i o={clamp(lt / 0.6)}>“to place, to put”</T>
    <path d="M900 360 L560 560 M1020 360 L1360 560" stroke={P.gold} strokeWidth={4} opacity={clamp(lt - 0.5)} />
    <T x={540} y={660} s={110} o={clamp(lt - 0.6)}>ni-dhi</T><T x={540} y={730} s={40} c={P.snow} i o={clamp(lt - 0.6)}>treasure: put away</T>
    <T x={1380} y={660} s={110} o={on('tiro', 0.6)}>tiro-dhā</T><T x={1380} y={730} s={40} c={P.snow} i o={on('tiro', 0.6)}>concealment: put out of sight</T>
  </g>),
  satapatha: ({ t, lt, on }) => (<g><Sky t={t} />
    <Card x={360} y={260} w={1200} h={500} o={clamp(lt / 0.6)}>
      <T x={960} y={360} s={40} c={P.snow} i>Śatapatha Brāhmaṇa 13.4.3.10</T>
      <T x={960} y={500} s={66}>“King Kubera Vaiśravaṇa;</T>
      <T x={960} y={590} s={66}>his people are the Rakṣas”</T>
      <T x={960} y={700} s={52} c={P.ember} o={on('robbers', 0.5)}>… present: evil-doers, robbers</T>
    </Card></g>),
  thief: ({ t, lt, on }) => {
    const lamp = on('lamp', 1.2), k = on('kubera', 2);
    return (<g><Sky t={t} />
      <Temple x={960} y={930} s={1.1} door={0.15 + lamp * 0.8} o={on('temple', 1) * (1 - k * 0.6)} />
      <g opacity={1 - on('caught', 1)}><Seated x={760} y={900} s={0.55} o={on('temple', 1)} /></g>
      <Lamp x={960} y={890} s={1.3} lit={lamp} t={t} />
      {on('ganas', 1) > 0 && Array.from({ length: 12 }, (_, i) => <line key={i} x1={960} y1={840} x2={960 + Math.cos(i / 12 * 6.283) * 600} y2={840 + Math.sin(i / 12 * 6.283) * 600} stroke={P.goldHi} strokeWidth={3} opacity={0.4 * on('ganas', 1) * (1 - k)} />)}
      <g opacity={k}><circle cx={960} cy={520} r={330} fill="url(#kGlowGold)" opacity={0.6} /><Seated x={960} y={820} s={1} crown belly /></g>
      <T x={60} y={70} s={32} a="start" c={P.snow} i o={clamp(lt / 0.6)}>Śiva Purāṇa · Rudra-saṃhitā, Sṛṣṭi-khaṇḍa 17–19 · Guṇanidhi</T>
    </g>);
  },
  waters: ({ t, lt, on }) => {
    const br = on('brother', 1);
    return (<g><Sky t={t} />
      {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M0 ${700 + i * 40} Q480 ${680 + i * 40 + 20 * Math.sin(t + i)} 960 ${700 + i * 40} T1920 ${700 + i * 40}`} stroke={P.gold} strokeOpacity={0.15 + 0.05 * i} strokeWidth={2} fill="none" />)}
      <T x={960} y={300} s={64} o={clamp(lt / 0.8) * (1 - br)} i>“Concealment was born from the waters”</T>
      <T x={960} y={380} s={38} c={P.snow} o={clamp(lt / 0.8)}>Taittirīya Āraṇyaka 1.31 · the Vaiśravaṇa rite</T>
      <g opacity={br}>
        <path d="M960 520 C860 420 700 520 960 760 C1220 520 1060 420 960 520 Z" fill="none" stroke={P.ember} strokeWidth={5} filter="url(#rkGlow)" />
        <Seated x={960} y={720} s={0.38} />
        <T x={960} y={900} s={50} i>“your obstructing brother, who lives in my heart”</T>
      </g>
    </g>);
  },
  tapas: ({ t, on }) => (<g><Sky t={t} /><Mountains y={820} o={0.8} />
    {[0, 1, 2, 3, 4].map((i) => <circle key={i} cx={960} cy={620} r={((t * 60 + i * 80) % 400) + 60} fill="none" stroke={P.gold} strokeWidth={2} opacity={0.35 * (1 - (((t * 60 + i * 80) % 400) / 400))} />)}
    <Seated x={960} y={860} s={0.9} />
    {[['water', 'water'], ['air', 'air'], ['nothing', 'nothing']].map(([k, l], i) => <T key={k} x={520 + i * 440} y={200} s={56} o={on(k, 0.5)} c={i === 2 ? P.ember : P.goldHi} i>{l}</T>)}
    <g opacity={on('brahma', 1)}><Lotus x={1560} y={560} s={0.9} glow={0.8} /><T x={1560} y={660} s={44}>Brahmā</T></g>
  </g>),
  boon: ({ t, lt, on }) => (<g><Sky t={t} />
    <T x={960} y={380} s={88} o={clamp(lt / 0.6)}>lokapālatvam</T><T x={960} y={440} s={38} c={P.snow} i o={clamp(lt / 0.6)}>guardianship of the world</T>
    <T x={960} y={600} s={88} o={clamp((lt - 1.4) / 0.6)} c={P.ember}>vittarakṣaṇam</T><T x={960} y={660} s={38} c={P.snow} i o={clamp((lt - 1.4) / 0.6)}>the protection of wealth</T>
    <T x={960} y={880} s={64} ls={4} o={on('guard', 0.6)}>not to own it · to guard it</T>
    <T x={960} y={120} s={36} c={P.snow} o={clamp(lt)}>Rāmāyaṇa 7.3.14</T>
  </g>),
  guardians: ({ t, lt, on }) => (<g><Sky t={t} />
    <Compass x={960} y={520} r={300} />
    {[['Indra', 1260, 520], ['Yama', 960, 860], ['Varuṇa', 660, 520], ['Kubera', 960, 180]].map(([n, x, y], i) => (
      <g key={n as string} opacity={clamp((lt - i * 0.4) / 0.5)}><circle cx={x as number} cy={y as number} r={i === 3 ? 70 : 50} fill={i === 3 ? 'url(#kGlowGold)' : P.navy2} stroke={P.gold} strokeWidth={3} />
        <T x={x as number} y={(y as number) + (i === 3 ? 118 : 96)} s={i === 3 ? 52 : 40} c={i === 3 ? P.goldHi : P.snow}>{n}</T></g>))}
    <g opacity={on('pushpaka', 0.8)} transform={`translate(${-300 + on('pushpaka', 4) * 2200} 360)`}>
      <path d="M-120 0 L120 0 L90 40 L-90 40 Z M-60 0 L-40 -50 L40 -50 L60 0" fill={P.goldDeep} stroke={P.goldHi} strokeWidth={3} />
      <T x={0} y={100} s={36} c={P.snow} i>Puṣpaka</T></g>
  </g>),
  lanka: ({ t, on }) => {
    const r = on('ravana', 1.2), lv = on('leave', 3);
    return (<g><Sky t={t} />
      <ellipse cx={760} cy={860} rx={520} ry={70} fill="#0A1A3C" />
      {[-3, -2, -1, 0, 1, 2, 3].map((k) => <path key={k} d={`M${760 + k * 110 - 40} 850 L${760 + k * 110 - 40} ${700 - Math.abs(3 - Math.abs(k)) * 60} L${760 + k * 110} ${640 - Math.abs(3 - Math.abs(k)) * 60} L${760 + k * 110 + 40} ${700 - Math.abs(3 - Math.abs(k)) * 60} L${760 + k * 110 + 40} 850 Z`} fill={P.goldDeep} stroke={P.goldHi} strokeWidth={2} opacity={0.9} />)}
      <T x={760} y={980} s={46}>Laṅkā</T>
      <rect x={0} y={0} width={W} height={H} fill="#1A0408" opacity={0.45 * r} />
      <T x={760} y={200} s={60} c={P.ember} o={r}>Rāvaṇa demands it</T>
      <g opacity={lv}><Mountains y={760} o={0.0} /><path d={`M1300 900 Q1500 500 ${1500 + lv * 200} 300`} stroke={P.gold} strokeWidth={4} strokeDasharray="10 14" fill="none" /><T x={1640} y={260} s={52}>Kailāsa</T></g>
      <T x={1400} y={980} s={36} c={P.snow} i o={on('pushpaka', 0.6)}>… and later the Puṣpaka too</T>
    </g>);
  },
  kailasa: ({ t, on }) => (<g><Sky t={t} /><Mountains y={900} peak />
    <circle cx={960} cy={420} r={140 + 20 * on('eye')} fill="url(#kGlowGold)" opacity={0.3 + 0.5 * on('eye')} />
    <path d="M880 420 Q960 360 1040 420 Q960 480 880 420 Z" fill="none" stroke={P.goldHi} strokeWidth={5} />
    <circle cx={960} cy={420} r={26} fill={on('eye') > 0 ? '#F2C230' : P.navy2} />
    <T x={960} y={160} s={48} o={on('friend', 0.6)}>Śiva makes him a friend</T>
    <T x={960} y={968} s={64} ls={4} o={on('name', 0.6)}>Ekākṣi-piṅgala</T>
  </g>),
  bharhut: ({ lt, on }) => (<g><rect width={W} height={H} fill="#080A12" />
    <Photo src="kubera/bharhut_kupira_plateXXII.jpg" x={700} y={60} w={312} h={970} zoom={1 + lt * 0.006} credit="" />
    <T x={1460} y={360} s={46} c={P.snow} i o={clamp(lt / 0.8)}>Bharhut stūpa · north gate</T>
    <T x={1460} y={430} s={40} c={P.snow} i o={clamp(lt / 0.8)}>c. 125–100 BCE</T>
    <T x={1460} y={600} s={86} o={on('name', 0.6)}>Kupiro Yakho</T>
    <T x={1460} y={670} s={44} c={P.snow} i o={on('name', 0.6)}>“Kubera the Yakṣa”</T>
    <text x={1460} y={1030} textAnchor="middle" fontFamily={EN} fontStyle="italic" fontSize={22} fill={P.snow}>Photo: A. Cunningham, The Stûpa of Bharhut (1879), Pl. XXII · public domain</text>
  </g>),
  alaka: ({ t, lt }) => (<g><Sky t={t} /><Mountains y={860} peak />
    <circle cx={1300} cy={420} r={90} fill="url(#kGlowGold)" opacity={clamp(lt)} />
    <T x={1300} y={560} s={64} o={clamp(lt)}>Alakā</T>
    <T x={1300} y={620} s={36} c={P.snow} i o={clamp(lt - 0.5)}>Āḷakamandā · Dīgha Nikāya 32</T>
    <T x={960} y={140} s={56} o={clamp(lt)} c={P.snow}>N ↑</T>
  </g>),
  amaraIntro: ({ t, lt }) => (<g><Sky t={t} />
    <T x={960} y={500} s={110} o={clamp(lt / 0.6)}>Amarakośa</T><T x={960} y={580} s={40} c={P.snow} i o={clamp(lt / 0.6)}>the oldest Sanskrit thesaurus</T></g>),
  names: ({ t, on }) => {
    const ns: [string, string, string][] = [['', 'Tryambaka-sakha', 'friend of the three-eyed Śiva'], ['n1', 'Yakṣa-rāṭ', 'king of the Yakṣas'], ['n2', 'Dhanada', 'giver of wealth'], ['n3', 'Rāja-rāja', 'king of kings'], ['n4', 'Eka-piṅga', 'one-eyed, yellow-eyed'], ['n5', 'Śrīda', 'giver of Śrī, of Lakṣmī']];
    return (<g><Sky t={t} />{ns.map(([k, n, m], i) => {
      const o = k ? on(k, 0.5) : 1; const big = i === 5;
      return <g key={n} opacity={o * (on('count', 0.6) > 0 ? 0.5 : 1)}><T x={big ? 960 : 520 + (i % 2) * 880} y={big ? 820 : 230 + Math.floor(i / 2) * 190} s={big ? 96 : 62} c={big ? P.ember : P.goldHi}>{n}</T>
        <T x={big ? 960 : 520 + (i % 2) * 880} y={big ? 880 : 280 + Math.floor(i / 2) * 190} s={34} c={P.snow} i>{m}</T></g>;
    })}</g>);
  },
  nidhis: ({ t, lt, on }) => {
    const nm = ['Mahāpadma', 'Padma', 'Śaṅkha', 'Makara', 'Kacchapa', 'Mukunda', 'Kunda', 'Nīla', 'Kharva'];
    const g = on('cells', 0.8);
    return (<g><Sky t={t} />
      {nm.map((n, i) => { const a = i / 9 * 6.283 - 1.57, r = 380 * (1 - g); return <T key={n} x={960 + Math.cos(a) * r + (g ? ((i % 3) - 1) * 230 * g : 0)} y={540 + Math.sin(a) * r * 0.85 + (g ? (Math.floor(i / 3) - 1) * 230 * g : 0) + 14} s={44} o={clamp((lt - i * 0.35) / 0.4)}>{n}</T>; })}
      <Grid x={960} y={540} c={230} nums={[]} o={g} />
    </g>);
  },
  sum216: ({ t, lt, on }) => (<g><Sky t={t} />
    {Array.from({ length: 9 }, (_, i) => <T key={i} x={360 + i * 150} y={360} s={80} o={clamp((lt - i * 0.12) / 0.3)}>{20 + i}</T>)}
    <T x={960} y={520} s={90} c={P.ember} o={clamp((lt - 1.4) / 0.5)}>= 216</T>
    <T x={960} y={760} s={100} o={on('split', 0.6)}>216 ÷ 3 = 72</T>
  </g>),
  centre: ({ t, lt, on }) => (<g><Sky t={t} />
    <Grid x={960} y={520} c={220} nums={KUBERA} hi={[0, 0, 0, 0, 1, 0, 0, 0, 0]} lit={[{ i: 1, o: clamp(lt) }, { i: 4, o: clamp(lt) }, { i: 6, o: clamp(lt) }, { i: 7, o: clamp(lt) }]} />
    <T x={960} y={968} s={60} o={on('third', 0.6)}>centre = 72 ÷ 3 = 24</T></g>),
  count: ({ t, lt, on }) => {
    const c = Math.min(362880, Math.floor(362880 * clamp(lt / 2.4) ** 2)), e8 = on('eight', 1), one = on('one', 1.2);
    const ls = [[2, 7, 6, 9, 5, 1, 4, 3, 8], [4, 9, 2, 3, 5, 7, 8, 1, 6], [8, 1, 6, 3, 5, 7, 4, 9, 2], [6, 1, 8, 7, 5, 3, 2, 9, 4], [2, 9, 4, 7, 5, 3, 6, 1, 8], [4, 3, 8, 9, 5, 1, 2, 7, 6], [6, 7, 2, 1, 5, 9, 8, 3, 4], [8, 3, 4, 1, 5, 9, 6, 7, 2]];
    return (<g><Sky t={t} />
      <T x={960} y={200} s={110} o={1 - e8 * 0.6}>{c.toLocaleString('en-US')}</T>
      <T x={960} y={270} s={38} c={P.snow} i o={1 - e8}>ways to arrange 1 … 9</T>
      {ls.map((n, i) => { const x = 260 + (i % 4) * 466, y = 470 + Math.floor(i / 4) * 330; const cx = x + (960 - x) * one, cy = y + (620 - y) * one;
        return <g key={i} opacity={e8 * (i === 2 ? 1 : 1 - one)}><Grid x={cx} y={cy} c={70 + one * (i === 2 ? 80 : 0)} nums={n} fs={36 + one * (i === 2 ? 40 : 0)} /></g>; })}
      <T x={960} y={968} s={56} o={one}>one square</T>
    </g>);
  },
  loshu: ({ t, lt, on }) => {
    const s = on('sub', 2);
    return (<g><Sky t={t} /><Shell x={960} y={520} s={1.2} o={s} />
      <Grid x={960} y={520} c={190} nums={KUBERA.map((n, i) => (s * 9 > i ? n - 19 : n))} />
      <T x={960} y={968} s={50} o={clamp(lt)} i>Kubera = Lo Shu + 19</T></g>);
  },
  navagraha: ({ t, lt, on }) => {
    const pts = Array.from({ length: 9 }, (_, i) => [i, 15 + 3 * i]);
    const X = (m: number) => 260 + m * 66, Y = (s: number) => 900 - (s - 10) * 10;
    return (<g><Sky t={t} />
      <line x1={X(0)} y1={Y(15)} x2={X(20)} y2={Y(75)} stroke={P.goldDim} strokeWidth={2} strokeDasharray="6 10" />
      {pts.map(([m, s], i) => <g key={i} opacity={clamp((lt - i * 0.15) / 0.3)}><circle cx={X(m)} cy={Y(s)} r={12} fill={P.snow} /><text x={X(m)} y={Y(s) - 22} textAnchor="middle" fontFamily={EN} fontSize={26} fill={P.snow}>{s}</text></g>)}
      <T x={X(0)} y={Y(15) + 60} s={36} c={P.snow}>Sun 15</T>
      <g opacity={on('kubera', 0.6)}><circle cx={X(19)} cy={Y(72)} r={22} fill={P.ember} filter="url(#rkGlow)" /><T x={X(19) - 40} y={Y(72) - 40} s={52} a="end">Kubera 72</T></g>
      <g opacity={on('c114', 0.6)}><T x={1500} y={760} s={64}>114 squares sum to 72</T><T x={1500} y={840} s={48} c={P.ember}>only one in a row: 20 … 28</T></g>
      <T x={960} y={120} s={36} c={P.snow} i>Navagraha yantras as drawn today</T>
    </g>);
  },
  perfume: ({ t, lt }) => {
    const sq = [2, 3, 5, 8, 5, 8, 2, 3, 4, 1, 7, 6, 7, 6, 4, 1]; const cols = ['#E3BB44', '#C77B2E', '#8FB6D8', '#B85A6A', '#7FB08A', '#D8C27A', '#9C86C8', '#E8643A'];
    return (<g><Sky t={t} />
      {sq.map((n, i) => { const x = 660 + (i % 4) * 150, y = 220 + Math.floor(i / 4) * 150, o = clamp((lt - i * 0.12) / 0.3);
        return <g key={i} opacity={o}><rect x={x} y={y} width={140} height={140} rx={10} fill={cols[n - 1]} fillOpacity={0.25} stroke={P.gold} strokeWidth={2} /><T x={x + 70} y={y + 92} s={64}>{n}</T></g>; })}
      <T x={960} y={900} s={60} o={clamp((lt - 2) / 0.6)}>every line, even the broken diagonals: 18</T>
      <T x={960} y={980} s={36} c={P.snow} i o={clamp((lt - 2) / 0.6)}>Varāhamihira, Bṛhat Saṃhitā 76 (c. 550 CE)</T>
    </g>);
  },
  khajuraho: ({ lt }) => (<g><rect width={W} height={H} fill="#080A12" />
    <Photo src="kubera/khajuraho_magic_square.png" x={560} y={80} w={520} h={790} zoom={1 + lt * 0.004} />
    <T x={1480} y={420} s={60} o={clamp(lt / 0.6)}>Pārśvanātha temple</T><T x={1480} y={480} s={40} c={P.snow} i o={clamp(lt / 0.6)}>Khajuraho</T>
    <T x={1480} y={640} s={96} c={P.ember} o={clamp((lt - 1) / 0.6)}>= 34</T>
    <text x={820} y={950} textAnchor="middle" fontFamily={EN} fontStyle="italic" fontSize={24} fill={P.snow}>Photo: RainerTypke, CC BY-SA 3.0, via Wikimedia Commons</text>
  </g>),
  doodles: ({ t, lt }) => (<g><Sky t={t} /><T x={960} y={520} s={80} o={clamp(lt / 0.6)}>recipes · and seats for the gods</T></g>),
  compass: ({ t, lt, on }) => {
    const r = clamp(lt / 1.2), n = on('north', 0.6), o1 = on('one', 0.6), s = on('south', 0.6), m = on('mirror', 0.8);
    const sub: (string | null)[] = [m ? '6' : null, n ? (o1 ? '1 · water' : '1') : null, m ? '8' : null, m ? '7' : null, m ? '5' : null, m ? '3' : null, m ? '2' : null, s ? '9 · fire' : null, m ? '4' : null];
    return (<g><Sky t={t} /><Compass x={960} y={520} r={395} o={r} />
      <g transform={`rotate(${(1 - ease(r)) * -90} 960 520)`}><Grid x={960} y={520} c={215} nums={KUBERA} sub={sub} hi={[0, n, 0, 0, 0, 0, 0, s, 0]} /></g>
      <T x={1650} y={540} s={34} c={P.snow} i o={m}>mirrored: all nine match</T>
    </g>);
  },
  tortoise: ({ t, lt, on }) => {
    const nm = ['Mahāpadma', 'Padma', 'Śaṅkha', 'Makara', 'Kacchapa', 'Mukunda', 'Kunda', 'Nīla', 'Kharva'];
    const f = on('fifth', 0.8), tu = on('turtle', 1);
    return (<g><Sky t={t} /><Shell x={960} y={520} s={1.25} o={tu * 0.9} />
      <Grid x={960} y={520} c={230} nums={KUBERA} fs={60} sub={nm.map((n, i) => (clamp((lt - i * 0.3) / 0.3) > 0 ? n : null))} hi={[0, 0, 0, 0, f, 0, 0, 0, 0]} />
      <T x={960} y={968} s={52} o={on('name', 0.6)} c={P.ember}>Kacchapa · the tortoise</T>
      <T x={960} y={70} s={40} c={P.snow} i o={on('plain', 0.6)}>no scripture says this · it is simply there</T>
    </g>);
  },
  copper: ({ t, lt }) => (<g><Sky t={t} warm={0.3} />
    <ellipse cx={960} cy={600} rx={560} ry={330} fill="url(#kCopper)" stroke={P.goldDeep} strokeWidth={6} />
    <ellipse cx={960} cy={590} rx={500} ry={285} fill="none" stroke="#F0B48A" strokeOpacity={0.5} strokeWidth={3} />
    <g transform="translate(960 590) scale(1 0.6)"><Grid x={0} y={0} c={150} nums={KUBERA} color="#5A2A10" text="#3A1A08" /></g>
    <Lamp x={1560} y={900} s={1.4} lit={clamp(lt / 1)} t={t} />
  </g>),
  bodySoul: ({ t, lt, on }) => (<g><Sky t={t} />
    {on('veda', 0.6) === 0 ? (<g>
      <T x={560} y={360} s={70} o={clamp(lt / 0.6)}>body : soul</T><T x={1360} y={360} s={70} o={clamp((lt - 0.8) / 0.6)}>oil : lamp</T>
      <T x={960} y={600} s={90} c={P.ember} o={clamp((lt - 1.6) / 0.6)}>yantra : deity</T>
      <T x={960} y={820} s={60} o={on('breath', 0.6)}>and its breath: the mantra</T></g>) : (
      <Photo src="kubera/TA_1872_p187_full.png" x={660} y={40} w={600} h={950} o={on('veda', 0.8)} />)}
  </g>),
  taMeaning: ({ t, lt, on }) => (<g><Sky t={t} />
    {on('mm', 0.6) === 0 ? (<g>
      {['To the king of kings,', 'who overcomes all by his might,', 'to Vaiśravaṇa, we bow.', 'May he, the lord of desires,', 'grant my desires.'].map((l, i) => <T key={i} x={960} y={260 + i * 110} s={62} i o={clamp((lt - i * 0.9) / 0.6)}>{l}</T>)}</g>) : (
      <g opacity={on('mm', 0.6)}><T x={960} y={460} s={100}>Mantramahodadhi</T><T x={960} y={560} s={48} c={P.snow} i>Mahīdhara · completed 1588 CE · wave 16</T></g>)}
  </g>),
  mantraWords: ({ t, on }) => {
    const ws: [string, string, string][] = [['', 'yakṣāya', 'to the king of the Yakṣas'], ['w2', 'kuberāya · vaiśravaṇāya', 'to Kubera, son of Viśravas'], ['w3', 'dhanadhānyādhipataye', 'to the lord of wealth and grain'], ['w4', 'samṛddhiṃ me dehi', 'give me abundance'], ['w5', 'dāpaya', 'cause it to be given']];
    const cnt = on('count', 0.6), seer = on('seer', 0.6);
    return (<g><Sky t={t} />
      {cnt === 0 ? ws.map(([k, a, b], i) => <g key={a} opacity={k ? on(k, 0.4) : 1}><T x={760} y={220 + i * 150} s={58} a="end" c={i === 4 ? P.ember : P.goldHi}>{a}</T><T x={820} y={220 + i * 150} s={44} a="start" c={P.snow} i>{b}</T></g>) : (
        <g><T x={960} y={380} s={130} o={cnt}>35 + oṃ = 36</T><T x={960} y={470} s={46} c={P.snow} i o={cnt}>a perfect Bṛhatī (4 × 9)</T>
          <T x={960} y={720} s={70} o={seer}>ṛṣi: Viśravas</T><T x={960} y={790} s={44} c={P.ember} i o={seer}>Kubera’s own father</T></g>)}
    </g>);
  },
  dhyana: ({ lt }) => (<g><rect width={W} height={H} fill="#080A12" />
    <Photo src="kubera/kubera_nalanda_bronze.jpg" x={250} y={90} w={620} h={808} zoom={1 + lt * 0.004} />
    {['the round-bellied lord of treasures', 'in a chariot borne by men', 'shining like the garuḍa gem', 'friend of Śiva, crowned', 'giving boons, holding a mace'].map((l, i) => <T key={i} x={1400} y={300 + i * 110} s={50} i o={clamp((lt - i * 1.1) / 0.6)}>{l}</T>)}
    <text x={560} y={960} textAnchor="middle" fontFamily={EN} fontStyle="italic" fontSize={22} fill={P.snow}>Kubera, bronze, Nālandā, 10th c. · Photo Division, Govt. of India (public domain)</text>
  </g>),
  rules: ({ t, on }) => {
    const cards: [string, string, string][] = [['', '1,00,000 japa', '+ 10,000 sesame offerings into fire'], ['temple', '10,000 japa in a Śiva temple', 'for increase of wealth'], ['bilva', '1,00,000 japa at a bilva root', ''],
      ['install', 'copper dish · ghee · milk and water', 'maṇḍala · prāṇa-pratiṣṭhā'], ['material', 'birch bark · silk · palm leaf', 'sealed in gold, silver or copper'], ['moon', 'every new and full moon', 'the Vedic rite'], ['grain', 'Kubera’s grain mantra', 'kept in the granary'], ['deepavali', 'Dīpāvalī night', 'Alakṣmī driven out']];
    const cur = cards.reduce((a, c, i) => (c[0] === '' || on(c[0], 0.01) > 0 ? i : a), 0);
    return (<g><Sky t={t} warm={0.25} />
      {cards.map(([k, a, b], i) => { const o = k ? on(k, 0.5) : 1; const x = 300 + (i % 4) * 440, y = 260 + Math.floor(i / 4) * 360;
        return <g key={i} opacity={o * (i === cur ? 1 : 0.55)}><Card x={x - 200} y={y - 110} w={400} h={260} /><T x={x} y={y - 10} s={i === cur ? 40 : 36} w={700}>{a}</T><T x={x} y={y + 50} s={28} c={P.snow} i>{b}</T></g>; })}
      <T x={960} y={968} s={30} c={P.snow} i>Mantramahodadhi 16.110–111, 20.1–14 · Mantra Mahārṇava · Dharmasindhu</T>
    </g>);
  },
  lakshmi: ({ t, lt, on }) => (<g><Sky t={t} />
    <g opacity={1 - on('left', 2) * 0.7}>{[-2, -1, 0, 1, 2].map((k) => <path key={k} d={`M${300 + k * 90 + 300} 900 L${300 + k * 90 + 300} ${600 - Math.abs(k) * 40} L${300 + k * 90 + 340} ${540 - Math.abs(k) * 40} L${300 + k * 90 + 380} ${600 - Math.abs(k) * 40} L${300 + k * 90 + 380} 900 Z`} fill="#3A1418" stroke={P.lacquerHi} strokeWidth={2} />)}</g>
    <Lotus x={1360 - on('left', 2) * 0} y={620} s={1.1} glow={0.7 + 0.2 * Math.sin(lt * 2)} />
    <T x={960} y={140} s={52} o={clamp(lt)}>Śrī · Lakṣmī</T>
  </g>),
  lived: ({ t, lt }) => (<g><Sky t={t} /><Lotus x={960} y={720} s={0.9} glow={0.8} />
    <T x={960} y={260} s={60} i o={clamp(lt / 0.6)}>“I lived among the asuras, bound to truth and dharma.</T>
    <T x={960} y={350} s={60} i o={clamp((lt - 2) / 0.6)}>Finding them reversed, I chose to live with you.”</T>
    <T x={960} y={968} s={34} c={P.snow} o={clamp(lt)}>Mahābhārata 12.221.26</T></g>),
  checklist: ({ t, on }) => {
    const it: [string, string][] = [['c1', 'houses left unswept'], ['c2', 'sleeping past sunrise'], ['c3', 'eating fine food alone'], ['c4', 'grain scattered for crows and rats'], ['c5', 'admiring wealth earned wrongly']];
    const v = on('virtues', 0.8);
    return (<g><Sky t={t} />
      <g opacity={1 - v * 0.75}>{it.map(([k, l], i) => <g key={k} opacity={on(k, 0.4)}><T x={420} y={250 + i * 120} s={56} a="start" c={P.snow}>{l}</T><line x1={410} y1={232 + i * 120} x2={420 + l.length * 25 * on(k, 0.8)} y2={232 + i * 120} stroke={P.ember} strokeWidth={5} /></g>)}</g>
      <g opacity={v}>{['truth', 'gifts', 'good vows', 'penance', 'prowess', 'virtue'].map((w, i) => <T key={w} x={500 + (i % 3) * 460} y={500 + Math.floor(i / 3) * 160} s={80}>{w}</T>)}<T x={960} y={900} s={36} c={P.snow} i>Mahābhārata, Śānti Parva: “I live in …”</T></g>
    </g>);
  },
  chain: ({ t, on }) => {
    const steps = ['Lakṣmī chooses where she lives', 'the treasures serve her', 'Kubera guards them', 'yantra · mantra · prāṇa', 'every direction equal: 72', 'north · counts · places · days', 'feed the brother in the heart'];
    const cells = [1, 3, 5, 7, 0, 8, 4];
    const k = ['s1', 's2', 's3', 's4', 's5', 's6', 's7'].filter((x) => on(x, 0.01) > 0).length; const end = on('end', 1);
    return (<g><Sky t={t} />
      <Grid x={600} y={540} c={200} nums={KUBERA.map((n, i) => (cells.indexOf(i) < k && cells.indexOf(i) >= 0 ? cells.indexOf(i) + 1 : '·'))} hi={KUBERA.map((_, i) => (cells.indexOf(i) >= 0 && cells.indexOf(i) < k ? (cells.indexOf(i) === k - 1 ? 1 : 0.4) : 0)).map((v, i) => Math.max(v, end * (i === 4 ? 1 : 0.3)))} />
      {steps.map((s, i) => <T key={i} x={1000} y={220 + i * 100} s={i === k - 1 ? 46 : 38} a="start" o={i < k ? (i === k - 1 ? 1 : 0.55) : 0} c={i === k - 1 ? P.goldHi : P.snow}>{`${i + 1}. ${s}`}</T>)}
      <T x={960} y={968} s={52} c={P.ember} o={end}>Lakṣmī comes · Kubera keeps</T>
    </g>);
  },
  ending: ({ t, on, at }) => (<g><Sky t={t} warm={0.8} />
    <path d="M0 640 L1920 640 L1920 1080 L0 1080 Z" fill="url(#kFloor)" /><path d="M560 640 L560 360 Q960 250 1360 360 L1360 640" fill="#120C14" stroke="#6B4A33" strokeWidth={8} />
    <g transform="translate(960 800) scale(1 0.62)"><Grid x={0} y={0} c={165} nums={KUBERA} rice /></g>
    <T x={960} y={200} s={84} o={on('code', 1)}>Lakṣmī brings.</T><T x={960} y={300} s={84} c={P.ember} o={clamp((at('code') - 1.4) / 0.8)}>Kubera keeps.</T>
  </g>),
};

// ---------------- overlays ----------------
const VerseCard: React.FC<{ c: Chant; t: number }> = ({ c, t }) => {
  const o = clamp((t - c.s) / 0.6) * clamp((c.e - t) / 0.6);
  if (o <= 0) return null;
  const cur = c.halves.findIndex(([a, b]) => t >= a - 0.1 && t < b + 0.4);
  const n = c.deva.length, img = !!c.img, cx = img ? 1240 : 960, fs = n > 3 ? 46 : 54, gap = n > 3 ? 120 : 160;
  const top = 540 - ((n - 1) * gap) / 2;
  return (
    <g opacity={o}>
      <rect width={W} height={H} fill="#020611" opacity={0.78} />
      {img && <Photo src={c.img as string} x={110} y={150} w={620} h={720} fit="contain" />}
      {img && c.credit && <text x={420} y={930} textAnchor="middle" fontFamily={EN} fontStyle="italic" fontSize={20} fill={P.snow}>{c.credit}</text>}
      <T x={cx} y={120} s={36} c={P.snow} i>{c.src}</T>
      {c.deva.map((d, i) => (
        <g key={i}>
          <text x={cx} y={top + i * gap} textAnchor="middle" fontFamily={F.sanskrit} fontSize={fs} fill={i === cur ? P.goldHi : P.gold} opacity={i === cur ? 1 : i < (cur < 0 ? 99 : cur) ? 0.75 : 0.45}
            stroke="#020611" strokeWidth={4} paintOrder="stroke" filter={i === cur ? 'url(#rkGlow)' : undefined}>{d}</text>
          <text x={cx} y={top + i * gap + 52} textAnchor="middle" fontFamily={EN} fontStyle="italic" fontSize={30} fill={P.snow} opacity={i === cur ? 1 : 0.55}>{c.iast[i]}</text>
        </g>
      ))}
      <text x={cx} y={968} textAnchor="middle" fontFamily={EN} fontSize={22} fill={P.snow} opacity={0.7}>chant: Vāgdhenu (Prof. Prathosh A.P., IISc)</text>
    </g>
  );
};

type Chunk = { s: number; e: number; words: Word[] };
const chunks = (ws: Word[]): Chunk[] => {
  const out: Chunk[] = []; let cur: Word[] = [];
  ws.forEach((w, i) => {
    cur.push(w);
    const nx = ws[i + 1];
    const end = /[.?!…:;”"]$/.test(w.w) || (w.w.endsWith(',') && cur.length >= 5) || cur.length >= 11 || !nx || nx.s - w.e > 0.9;
    if (end) { out.push({ s: cur[0].s, e: cur[cur.length - 1].e, words: cur }); cur = []; }
  });
  return out.map((c, i) => ({ ...c, e: out[i + 1] && out[i + 1].s - c.e < 1.0 ? out[i + 1].s : c.e + 0.5 }));
};
const Captions: React.FC<{ t: number; cs: Chunk[] }> = ({ t, cs }) => {
  const c = cs.find((x) => t >= x.s - 0.05 && t < x.e);
  if (!c) return null;
  return (
    <text x={W / 2} y={1046} textAnchor="middle" fontFamily={EN} fontSize={40} fontWeight={700} stroke="#02060F" strokeWidth={6} paintOrder="stroke">
      {c.words.map((w, j) => <tspan key={j} fill={t >= w.s && t < w.e + 0.08 ? '#FF9A3A' : P.snow} opacity={t >= w.s ? 1 : 0.55}>{(j ? ' ' : '') + w.w}</tspan>)}
    </text>
  );
};

export const KuberaFilm: React.FC = () => {
  const f = useCurrentFrame(); const t = f / 30;
  const cs = useMemo(() => chunks(tl.words), []);
  const i = Math.max(0, tl.beats.findIndex((b) => t >= b.s && t < b.e));
  const draw = (b: Beat, o: number, key: string) => {
    const Sc = S[b.scene]; if (!Sc) return null;
    const on = (k: string, d = 0.6) => (b.cues[k] == null ? 0 : clamp((t - b.cues[k]) / d));
    const at = (k: string) => (b.cues[k] == null ? -1e9 : t - b.cues[k]);
    return <g key={key} opacity={o}><Sc t={t} b={b} lt={t - b.s} on={on} at={at} /></g>;
  };
  const b = tl.beats[i], prev = tl.beats[i - 1];
  const fade = clamp((t - b.s) / 0.5);
  const chant = tl.chants.find((c) => t >= c.s && t < c.e);
  const endO = clamp((tl.total - t) / 2.5);
  return (
    <AbsoluteFill style={{ background: '#020611' }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <Defs /><KDefs />
        <g opacity={endO}>
          {prev && fade < 1 && draw(prev, 1, 'p')}
          {draw(b, prev ? ease(fade) : 1, 'c')}
          {chant && <VerseCard c={chant} t={t} />}
          {!chant && <Captions t={t} cs={cs} />}
        </g>
      </svg>
      <Audio src={staticFile(tl.audio)} />
    </AbsoluteFill>
  );
};
export const KUBERA_LEN = tl.len;
