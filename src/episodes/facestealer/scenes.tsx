import React from 'react';
import { ShotProps } from '../../engine';
import {
  C, W, H, BG, T, Chip, Avatar, FACES, Tile, Win, Cursor, Chat, Rec, Num, Scan, Corner, Evidence, Rect,
  kf, clamp, easeOut, easeInOut, backOut, rnd,
} from './ui';

// FaceStealer v2 scenes. Every scene is a pure function of its own clock t (frames since the shot began). Marks
// (d.p.m) are the local frames of words in the narration, so reveals land on the voice. Layout rule: nothing important
// below y = 880, where the captions sit.

export type Def = { id: string; cue: string; kind: string; key?: number; note?: string; p?: any };
type SP = ShotProps & { d: Def };

/** A mark's local frame, or a fallback when the shot has none. */
const mk = (d: Def, name: string, fallback: number) => (d.p?.m && d.p.m[name] !== undefined ? d.p.m[name] : fallback);

const stage = (t: number, text: string, sub?: string) => (
  <g>
    <Chip x={90} y={96} text={text} color={C.yel} size={26} op={clamp(t / 8)} />
    {sub ? <T x={90} y={150} size={30} anchor="start" color={C.dim} weight={500} op={clamp((t - 6) / 8)}>{sub}</T> : null}
  </g>
);

const Laptop: React.FC<{ x: number; y: number; w?: number; t: number; face?: number; children?: React.ReactNode; rec?: boolean; id: string; screen?: string; mood?: any }> = ({ x, y, w = 760, t, face = 0, children, rec, id, screen = '#101A38', mood }) => {
  const h = w * 0.62;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-w / 2 - 20} y={h + 10} width={w + 40} height={26} rx={13} fill="#1E2A4F" />
      <rect x={-w / 2} y={0} width={w} height={h} rx={20} fill="#0A0F1E" stroke="#2C3A6A" strokeWidth={6} />
      <rect x={-w / 2 + 18} y={18} width={w - 36} height={h - 36} rx={10} fill={screen} />
      {children ?? <Tile id={id} x={-w / 2 + 40} y={36} w={w - 80} h={h - 72} face={face} t={t} rec={rec} mood={mood} />}
      <circle cx={0} cy={9} r={5} fill={rec ? C.red : '#2A3358'} opacity={rec ? 0.5 + 0.5 * Math.abs(Math.sin(t * 0.12)) : 1} />
    </g>
  );
};

const Glow: React.FC<{ x: number; y: number; r: number; color: string; op?: number }> = ({ x, y, r, color, op = 0.35 }) => (
  <circle cx={x} cy={y} r={r} fill={color} opacity={op} filter="url(#blur40)" />
);

const Stamp: React.FC<{ x: number; y: number; text: string; t: number; at: number; color?: string; size?: number; rot?: number }> = ({ x, y, text, t, at, color = C.red, size = 120, rot = -8 }) => {
  const p = clamp((t - at) / 6);
  if (p <= 0) return null;
  const sc = 1 + (1 - easeOut(p)) * 1.2;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${sc})`} opacity={easeOut(p)}>
      <rect x={-(text.length * size * 0.33 + 34)} y={-size * 0.82} width={text.length * size * 0.66 + 68} height={size * 1.2} rx={14} fill="#000" opacity={0.6} stroke={color} strokeWidth={10} />
      <T x={0} y={size * 0.1} size={size} color={color} ls={4}>{text}</T>
    </g>
  );
};

const Arrow: React.FC<{ x1: number; y1: number; x2: number; y2: number; color?: string; p?: number; w?: number }> = ({ x1, y1, x2, y2, color = C.cyan, p = 1, w = 8 }) => {
  const ex = x1 + (x2 - x1) * p, ey = y1 + (y2 - y1) * p;
  const a = Math.atan2(y2 - y1, x2 - x1);
  return (
    <g stroke={color} strokeWidth={w} strokeLinecap="round" fill="none">
      <line x1={x1} y1={y1} x2={ex} y2={ey} />
      {p > 0.9 ? <path d={`M${x2 - Math.cos(a - 0.5) * 40} ${y2 - Math.sin(a - 0.5) * 40} L${x2} ${y2} L${x2 - Math.cos(a + 0.5) * 40} ${y2 - Math.sin(a + 0.5) * 40}`} /> : null}
    </g>
  );
};

/** Call controls under a video tile: mic, camera, people, red hang-up. */
const Controls: React.FC<{ x: number; y: number; micOn?: boolean }> = ({ x, y, micOn = true }) => (
  <g transform={`translate(${x} ${y})`}>
    {[0, 1, 2, 3].map((i) => (
      <g key={i} transform={`translate(${i * 110} 0)`}>
        <circle r={36} fill={i === 3 ? C.red : '#1B2748'} />
        {i === 0 ? <g><rect x={-7} y={-18} width={14} height={24} rx={7} fill={C.wht} /><path d="M-13 0 Q0 16 13 0 M0 10 V18" stroke={C.wht} strokeWidth={3} fill="none" />{!micOn ? <line x1={-16} y1={16} x2={16} y2={-16} stroke={C.red} strokeWidth={4} /> : null}</g> : null}
        {i === 1 ? <g><rect x={-18} y={-11} width={24} height={22} rx={4} fill={C.wht} /><path d="M6 -4 L18 -11 V11 L6 4 Z" fill={C.wht} /></g> : null}
        {i === 2 ? <g fill={C.wht}><circle cx={-6} cy={-7} r={7} /><circle cx={9} cy={-5} r={6} /><path d="M-20 14 Q-6 -2 8 14 Z M2 14 Q10 2 22 14 Z" /></g> : null}
        {i === 3 ? <path d="M-18 4 Q0 -10 18 4 L14 10 L6 6 V2 Q0 0 -6 2 V6 L-14 10 Z" fill={C.wht} /> : null}
      </g>
    ))}
  </g>
);

/** A player scrub bar: the "friend" is a looping file. */
const Scrub: React.FC<{ x: number; y: number; w: number; t: number; op?: number; loop?: number; label?: string }> = ({ x, y, w, t, op = 1, loop = 240, label = '▶  victim_A_webcam.mp4  ·  LOOP' }) => {
  const ph = (t % loop) / loop;
  return (
    <g opacity={op} transform={`translate(${x} ${y})`}>
      <rect x={0} y={-58} width={w} height={96} rx={14} fill="#000" opacity={0.72} />
      <T x={22} y={-20} size={26} anchor="start" mono weight={700} color={C.red}>{label}</T>
      <rect x={22} y={6} width={w - 44} height={10} rx={5} fill="#2A3358" />
      <rect x={22} y={6} width={(w - 44) * ph} height={10} rx={5} fill={C.red} />
      <circle cx={22 + (w - 44) * ph} cy={11} r={11} fill={C.wht} />
    </g>
  );
};

const CheckRow: React.FC<{ t: number; at: number; y: number; n: string; text: string; color?: string; sub?: string; x?: number; w?: number }> = ({ t, at, y, n, text, color = C.grn, sub, x = 230, w = 1460 }) => {
  const p = backOut(clamp((t - at) / 12));
  const lit = t >= at;
  return (
    <g opacity={lit ? Math.max(0.15, p) : 0.15} transform={`translate(${x + (1 - clamp((t - at) / 12)) * 60} ${y})`}>
      <rect width={w} height={104} rx={26} fill="#0F1A2E" stroke={lit ? color : C.line} strokeWidth={4} />
      <circle cx={64} cy={52} r={34} fill={lit ? color : '#1B2748'} />
      <T x={64} y={68} size={40} color="#04060C">{n}</T>
      <T x={128} y={sub ? 50 : 68} size={sub ? 40 : 46} anchor="start" weight={700}>{text}</T>
      {sub ? <T x={128} y={88} size={28} anchor="start" weight={500} color={C.dim}>{sub}</T> : null}
    </g>
  );
};

// ---------------------------------------------------------------- scene kinds
const K: Record<string, React.FC<SP>> = {
  // ---------- cold open: the call, the reveal, the stakes (mirrors the thumbnail: call window left, $400M right)
  hook_call: ({ t, d }) => {
    const E = mk(d, 'Except', 88);
    const P = Math.min(E + 10, 100); // $400M on screen by ~3.3 s
    const rev = clamp((t - E) / 8);
    const g = t >= E ? 0.15 + 0.6 * Math.exp(-(t - E) / 10) : 0;
    const money = backOut(clamp((t - P) / 12));
    return (
      <g>
        <Glow x={540} y={460} r={420} color={t >= E ? C.red : C.cyan} op={0.18} />
        <g opacity={easeOut(clamp(t / 8))}>
          <Win x={80} y={110} w={1000} h={720} id="hk" title="Meeting" rot={-1.5} danger={t >= E}>
            <Tile id="hk1" x={30} y={76} w={940} h={520} face={0} t={t} talk={t < E} mood="smile" label="Sam" mic={true} glitch={g} border={t >= E ? C.red : undefined} />
            <g opacity={1 - rev}><Chip x={56} y={128} text="● LIVE" color={C.grn} size={24} /></g>
            <g opacity={rev}><Rec x={78} y={118} t={t} size={0.8} /></g>
            <Scrub x={52} y={520} w={896} t={t - E + 80} op={rev} />
            <Controls x={325} y={652} />
          </Win>
        </g>
        <g opacity={clamp((t - P) / 5)} transform={`translate(1480 470) scale(${0.85 + 0.15 * money}) translate(-1480 -470)`}>
          <g transform="translate(1480 430) rotate(-3)"><T x={0} y={0} size={220} color={C.red} stroke="#04060C">$400M</T></g>
          <g transform="translate(1490 560) rotate(-3)">
            <rect x={-200} y={-74} width={400} height={104} rx={14} fill={C.yel} />
            <T x={0} y={4} size={84} color="#05060C">STOLEN</T>
          </g>
          <T x={1490} y={680} size={34} color={C.dim} weight={600} op={clamp((t - P - 10) / 10)}>in crypto · per the FBI</T>
        </g>
        <Corner x={1150} y={250} w={680} h={500} color={C.red} p={money} />
      </g>
    );
  },
  hook_400: ({ t, d, len }) => {
    const N = mk(d, 'North', 40);
    const F = mk(d, 'four', 130);
    const rects: Rect[] = [{ x: 872, y: 1349, w: 427, h: 22 }, { x: 129, y: 1385, w: 550, h: 22 }];
    return (
      <g>
        <Glow x={960} y={300} r={420} color={C.red} op={0.2} />
        <g transform={`translate(960 270) scale(${1 + 0.06 * Math.exp(-Math.max(0, t - F) / 6) * (t >= F ? 1 : 0)}) translate(-960 -270)`}>
          <T x={960} y={340} size={250} color={C.red} stroke="#04060C">$400M+</T>
        </g>
        <T x={960} y={420} size={40} weight={700} op={clamp((t - F) / 10)}>STOLEN IN CRYPTO · OVER 18 MONTHS</T>
        <g opacity={backOut(clamp((t - N) / 12))}><Chip x={640} y={110} text="NORTH KOREAN STATE HACKERS · PER FBI" color={C.red} size={26} /></g>
        <Evidence id={d.id} t={t} src="facestealer/ic3-p1.png" iw={1445} ih={1870} rects={rects} quote="" source="FBI FLASH AC-111226-MS · 12 NOV 2026 · PAGE 1" at={F - 6} dur={24} colX={[110, 1320]} y0={470} ctx={1} />
      </g>
    );
  },
  twist: ({ t, d }) => {
    const N = mk(d, 'not', 58);
    const sweep = (t * 9) % 560;
    return (
      <g>
        <Glow x={960} y={430} r={460} color={C.purple} op={0.2} />
        <Tile id="tw0" x={460} y={130} w={1000} h={560} face={0} t={t} talk={true} mood="smile" label="Sam" />
        {t < N ? <rect x={460} y={130 + sweep} width={1000} height={6} fill={C.purple} opacity={0.8} /> : null}
        <g transform="translate(960 790)">
          <rect x={-330} y={-58} width={660} height={96} rx={48} fill="#1E1438" stroke={C.purple} strokeWidth={4} />
          <T x={0} y={8} size={50} color={C.purple}>AI DEEPFAKE?</T>
          {t >= N ? <line x1={-300} y1={-6} x2={-300 + 600 * easeOut(clamp((t - N) / 6))} y2={-6} stroke={C.red} strokeWidth={10} /> : null}
        </g>
        <Stamp x={1340} y={240} text="NOT AI" t={t} at={N + 2} size={96} rot={-8} />
      </g>
    );
  },
  evidence: ({ t, d }) => {
    const p = d.p;
    const at = d.p.m ? (Object.values(d.p.m)[0] as number | undefined) : undefined;
    return <Evidence id={d.id} t={t} src={p.src} iw={p.iw} ih={p.ih} rects={p.rects} quote={p.quote} emph={p.emph} source={p.source} tag={p.tag} at={at !== undefined ? Math.max(6, at - 4) : 8} colX={p.colX} qsize={p.qsize ?? 60} />;
  },
  title: ({ t }) => {
    const g = t < 10 || (t > 40 && t < 44) ? 1 : 0;
    return (
      <g>
        <Glow x={960} y={470} r={520} color={C.red} op={0.18} />
        {[[-8, C.cyan], [8, C.red]].map(([dx, c], i) => (g ? <T key={i} x={960 + (dx as number)} y={480} size={214} color={c as string} op={0.7} ls={4}>FACESTEALER</T> : null))}
        <T x={960} y={480} size={214} ls={4} stroke="#04060C">FACESTEALER</T>
        <rect x={420} y={530} width={1080 * easeOut(clamp((t - 4) / 16))} height={8} fill={C.red} />
        <T x={960} y={630} size={54} weight={700} op={clamp((t - 10) / 8)} ls={3}>THE FAKE VIDEO CALL SCAM</T>
        <T x={960} y={710} size={30} mono weight={400} color={C.dim} op={clamp((t - 18) / 8)}>FBI FLASH AC-111226-MS · DOJ RELEASE 26-1356 · 12 NOV 2026</T>
        <Corner x={300} y={250} w={1320} h={520} p={clamp(t / 10)} />
      </g>
    );
  },
  // ---------- stage 1-2
  victimA: ({ t }) => (
    <g>
      {stage(t, 'STAGE 1', 'Victim A has already been hacked')}
      <Laptop x={960} y={220} w={880} t={t} face={1} id="vA" mood="neutral" />
      <Chip x={700} y={160} text="VICTIM A" color={C.red} size={30} op={clamp(t / 10)} />
    </g>
  ),
  scan: ({ t }) => {
    const sy = 260 + ((t * 5) % 380);
    const items = ['WALLET · browser extension', 'WALLET · desktop app', 'SEED PHRASE · ▓▓▓ ▓▓▓ ▓▓▓', 'OTHER VALUABLE ACCESS'];
    return (
      <g>
        {stage(t, 'STAGE 1', 'The hackers scan the computer')}
        <Laptop x={640} y={220} w={860} t={t} id="sc" screen="#0B1430">
          <g>
            {items.map((s, i) => (
              <g key={i} opacity={clamp((t - 4 - i * 8) / 6)}>
                <rect x={-370} y={60 + i * 100} width={740} height={76} rx={14} fill="#16224A" stroke={t > 14 + i * 8 ? C.red : '#2C3A6A'} strokeWidth={3} />
                <T x={-340} y={108 + i * 100} size={30} anchor="start" mono weight={400} color={C.wht}>{s}</T>
                <T x={350} y={108 + i * 100} size={30} anchor="end" mono weight={700} color={C.red} op={clamp((t - 14 - i * 8) / 5)}>FOUND</T>
              </g>
            ))}
            <rect x={-400} y={sy - 230} width={800} height={6} fill={C.cyan} opacity={0.8} />
          </g>
        </Laptop>
        <g transform="translate(1500 500)">
          <circle r={180} fill="none" stroke={C.red} strokeWidth={8} opacity={0.5 + 0.4 * Math.sin(t * 0.2)} />
          <T x={0} y={26} size={68} color={C.red}>SCANNED</T>
        </g>
      </g>
    );
  },
  lock: ({ t }) => (
    <g>
      {stage(t, 'STAGE 1', 'Their Telegram account is taken over')}
      <Chat id="lk" x={300} y={190} w={740} h={640} t={t} who={1} name="Victim A" msgs={[{ who: 'them', text: 'Session ended on this device', at: 6, danger: true }]} locked sub="hijacked" />
      <g transform={`translate(1440 500) scale(${backOut(clamp((t - 4) / 12))})`}>
        <path d="M-90 -40 V-110 Q-90 -190 0 -190 Q90 -190 90 -110 V-40" fill="none" stroke={C.red} strokeWidth={30} strokeLinecap="round" />
        <rect x={-150} y={-50} width={300} height={240} rx={30} fill={C.red} />
        <circle cx={0} cy={60} r={30} fill="#1a0610" /><rect x={-9} y={70} width={18} height={70} rx={9} fill="#1a0610" />
      </g>
    </g>
  ),
  rec_wait: ({ t }) => (
    <g>
      {stage(t, 'STAGE 1', 'Secretly recorded while waiting for a call to start')}
      <Win x={380} y={190} w={1160} h={660} id="rw" title="Waiting for the host…">
        <Tile id="rw1" x={60} y={76} w={1040} h={540} face={1} t={t} rec={t > 20} label="Victim A" mic={true} mood="bored" look={Math.sin(t * 0.03)} />
      </Win>
      <g opacity={clamp((t - 20) / 8)}><Rec x={1560} y={112} t={t} size={1} label="REC" /><Chip x={1180} y={128} text="SECRETLY RECORDED" color={C.red} size={24} /></g>
    </g>
  ),
  become: ({ t }) => {
    const p = easeInOut(clamp((t - 10) / 22));
    return (
      <g>
        {stage(t, 'STAGE 2', 'The hackers become Victim A')}
        <g transform="translate(620 560)"><Avatar x={0} y={0} s={2.1} skin={FACES[1].skin} hair={FACES[1].hair} shirt={FACES[1].shirt} style={3} t={t} mood="neutral" /></g>
        <g transform="translate(1300 560)" opacity={p}><Avatar x={0} y={0} s={2.1} skin="#2B2F40" hair="#0A0A12" shirt="#151A2C" style={0} t={t} mask /></g>
        <Arrow x1={800} y1={500} x2={1100} y2={500} p={p} color={C.red} />
        <T x={620} y={290} size={44} color={C.dim} weight={700}>REAL ACCOUNT</T>
        <T x={1300} y={290} size={44} color={C.red} weight={700} op={p}>HACKERS IN CONTROL</T>
      </g>
    );
  },
  fanout: ({ t }) => {
    const n = 12;
    return (
      <g>
        {stage(t, 'STAGE 2', "Messages go to Victim A's contacts, from the real account")}
        {Array.from({ length: n }, (_, i) => {
          const a = (i / n) * Math.PI * 2 - Math.PI / 2;
          const x = 960 + Math.cos(a) * 560, y = 520 + Math.sin(a) * 270;
          const p = clamp((t - 6 - i * 3) / 12);
          const f = FACES[(i + 2) % FACES.length];
          return (
            <g key={i}>
              <line x1={960} y1={520} x2={x} y2={y} stroke={C.cyan} strokeWidth={3} opacity={0.35} />
              <circle cx={960 + (x - 960) * p} cy={520 + (y - 520) * p} r={10} fill={C.yel} opacity={p > 0 && p < 1 ? 1 : 0} />
              <g opacity={0.9}><circle cx={x} cy={y} r={46} fill={f.shirt} /><circle cx={x} cy={y - 8} r={20} fill={f.skin} /></g>
              {p >= 1 ? <g><circle cx={x + 34} cy={y - 34} r={14} fill={C.red} /><T x={x + 34} y={y - 26} size={20} color="#fff">!</T></g> : null}
            </g>
          );
        })}
        <Avatar x={960} y={500} s={1.1} skin={FACES[1].skin} hair={FACES[1].hair} shirt={FACES[1].shirt} style={3} t={t} />
      </g>
    );
  },
  bubbles: ({ t, d }) => {
    const L = ["let's catch up", "let's discuss collaboration"];
    const at = [mk(d, 'c1', 8), mk(d, 'c2', 38)];
    return (
      <g>
        {stage(t, 'STAGE 2', 'The pretext, per the FBI')}
        {L.map((s, i) => {
          const p = backOut(clamp((t - at[i] + 4) / 12));
          const w = s.length * 30 + 100;
          return (
            <g key={i} opacity={clamp((t - at[i] + 4) / 6)} transform={`translate(${i % 2 ? 1700 - w : 220} ${300 + i * 230 + (1 - p) * 30})`}>
              <rect width={w} height={140} rx={70} fill={i % 2 ? '#2F5BFF' : '#1B2748'} stroke={C.cyan} strokeWidth={2} />
              <T x={w / 2} y={90} size={54} weight={600}>{s}</T>
            </g>
          );
        })}
        <T x={960} y={800} size={34} color={C.dim} weight={500} op={clamp((t - 50) / 10)}>sent from Victim A's real, hijacked account</T>
      </g>
    );
  },
  history: ({ t, d }) => {
    const old = ['“did you see the deck?”', '“call tomorrow, 3pm?”', '“sent the invoice”', "“let's sync on the token launch”", '“thanks for the intro!”'];
    const tl = mk(d, 'tailored', 120);
    const hi = Math.min(3, Math.floor(t / 22));
    return (
      <g>
        {stage(t, 'STAGE 2', 'They read the chat history')}
        <Win x={160} y={190} w={820} h={650} id="h1" title="Chat history · Victim A">
          {old.map((s, i) => (
            <g key={i}>
              <rect x={30} y={80 + i * 100} width={760} height={74} rx={16} fill={i === hi ? '#3B2A12' : '#16224A'} stroke={i === hi ? C.yel : 'none'} strokeWidth={3} />
              <T x={56} y={128 + i * 100} size={30} anchor="start" weight={500}>{s}</T>
            </g>
          ))}
        </Win>
        <Arrow x1={1010} y1={520} x2={1140} y2={520} p={clamp((t - tl + 24) / 12)} color={C.yel} />
        <g opacity={clamp((t - tl + 10) / 10)} transform="translate(1170 380)">
          <rect width={620} height={270} rx={34} fill="#1B2748" stroke={C.red} strokeWidth={4} />
          <T x={40} y={70} size={28} anchor="start" mono weight={400} color={C.red}>TAILORED · HIGH-VALUE TARGET</T>
          <T x={40} y={140} size={38} anchor="start" weight={600}>“Still keen to sync on</T>
          <T x={40} y={196} size={38} anchor="start" weight={600}>that token launch?”</T>
        </g>
      </g>
    );
  },
  // ---------- stage 3-4
  calendar: ({ t }) => (
    <g>
      {stage(t, 'STAGE 3', 'A calendar invite, but no meeting link')}
      <Win x={480} y={200} w={960} h={600} id="cal" title="Calendar invite">
        <rect x={40} y={84} width={880} height={110} rx={16} fill="#16224A" />
        <T x={70} y={156} size={46} anchor="start">Catch-up call</T>
        <T x={900} y={156} size={30} anchor="end" mono weight={400} color={C.dim}>Thu · 15:00</T>
        <rect x={40} y={230} width={880} height={110} rx={16} fill="#0A0F1E" stroke={C.red} strokeWidth={3} strokeDasharray="12 10" />
        <T x={70} y={298} size={36} anchor="start" mono weight={400} color={C.dim}>Meeting link:</T>
        <T x={380} y={298} size={36} anchor="start" mono weight={700} color={C.red} op={0.6 + 0.4 * Math.sin(t * 0.3)}>— none yet —</T>
        <Chip x={60} y={440} text="LINK ARRIVES LATER" color={C.yel} size={28} op={clamp((t - 60) / 10)} />
      </Win>
    </g>
  ),
  clock: ({ t }) => {
    const a = (t / 60) * Math.PI * 2 * 3 - Math.PI / 2;
    const env = clamp((t - 30) / 14);
    return (
      <g>
        {stage(t, 'STAGE 3', 'The link only arrives shortly before the call')}
        <g transform="translate(620 500)">
          <circle r={250} fill="#0F1730" stroke={C.cyan} strokeWidth={10} />
          {Array.from({ length: 12 }, (_, i) => <line key={i} x1={Math.cos(i * 0.5236) * 210} y1={Math.sin(i * 0.5236) * 210} x2={Math.cos(i * 0.5236) * 235} y2={Math.sin(i * 0.5236) * 235} stroke={C.dim} strokeWidth={6} />)}
          <line x1={0} y1={0} x2={Math.cos(a) * 190} y2={Math.sin(a) * 190} stroke={C.red} strokeWidth={12} strokeLinecap="round" />
          <circle r={16} fill={C.wht} />
        </g>
        <g transform={`translate(${1500 - env * 220} 480)`} opacity={env}>
          <rect x={-150} y={-100} width={300} height={200} rx={20} fill="#16224A" stroke={C.red} strokeWidth={5} />
          <path d="M-150 -100 L0 20 L150 -100" fill="none" stroke={C.red} strokeWidth={5} />
          <T x={0} y={150} size={34} color={C.red} mono weight={700}>MEETING LINK</T>
        </g>
      </g>
    );
  },
  domains: ({ t, d }) => {
    const p = d.p;
    const A = mk(d, 'alike', 70);
    return (
      <Evidence id={d.id} t={t} src={p.src} iw={p.iw} ih={p.ih} rects={p.rects} quote={p.quote} emph={p.emph} source={p.source} tag={p.tag} at={8} colX={p.colX} qsize={50} y0={110}>
        {['uu01webzoom.us', 'teams.livemeet.us'].map((s, i) => {
          const q = backOut(clamp((t - A - i * 8) / 12));
          return (
            <g key={i} opacity={clamp((t - A - i * 8) / 6)} transform={`translate(${560 + i * 800} 770) scale(${0.8 + 0.2 * q})`}>
              <rect x={-330} y={-56} width={660} height={100} rx={50} fill="#2A0F1E" stroke={C.red} strokeWidth={4} />
              <T x={0} y={14} size={44} mono weight={700} color={C.wht}>{s}</T>
            </g>
          );
        })}
        <T x={960} y={862} size={26} color={C.dim} weight={500} op={clamp((t - A - 20) / 10)}>examples of hacker-controlled look-alike domains listed by the FBI</T>
      </Evidence>
    );
  },
  twin: ({ t, d }) => {
    const R = mk(d, 'copycat', 20);
    const rev = clamp((t - R) / 8);
    return (
      <g>
        {stage(t, 'STAGE 3', 'A copycat meeting room')}
        {[0, 1].map((k) => (
          <g key={k}>
            <Win x={150 + k * 880} y={200} w={760} h={540} id={'tw' + k} title="Meeting" danger={k === 1 && rev > 0.5} url={k === 0 ? 'the real app' : 'look-alike address'}>
              <Tile id={'twt' + k} x={40} y={76} w={680} h={400} face={0} t={t} label="Sam" />
            </Win>
            <T x={530 + k * 880} y={830} size={50} color={k === 1 && rev > 0.5 ? C.red : C.dim} weight={800}>{k === 1 && rev > 0.5 ? 'COPYCAT' : k === 0 ? 'REAL' : '?'}</T>
          </g>
        ))}
        <T x={960} y={500} size={60} color={C.dim}>≈</T>
      </g>
    );
  },
  lobby2: ({ t, d }) => {
    const A = mk(d, 'admitted', 40);
    return (
      <g>
        {stage(t, 'STAGE 4', 'In the lobby')}
        <Win x={380} y={190} w={1160} h={640} id="l2" title={t < A ? 'Waiting for the host to admit you…' : 'Meeting'}>
          <Tile id="l2a" x={60} y={76} w={1040} h={500} face={0} t={t} empty={t < A} label="Sam" mic={true} mood="smile" />
          <Chip x={80} y={110} text={t < A ? 'WAITING…' : 'ADMITTED'} color={t < A ? C.yel : C.grn} size={26} />
        </Win>
      </g>
    );
  },
  playback: ({ t }) => (
    <g>
      {stage(t, 'STAGE 4', 'The hackers press play')}
      <Tile id="pb" x={420} y={180} w={1080} h={560} face={1} t={t} talk={true} mood="smile" label="Victim A" />
      <g transform="translate(960 460)" opacity={1 - clamp((t - 14) / 10)}>
        <circle r={110} fill="#000" opacity={0.6} stroke={C.wht} strokeWidth={6} />
        <path d="M-34 -52 L62 0 L-34 52 Z" fill={C.wht} />
      </g>
      <Scrub x={420} y={820} w={1080} t={t * 3} label="▶  VICTIM A'S STORED WEBCAM VIDEO" />
    </g>
  ),
  tiles: ({ t }) => (
    <g>
      {stage(t, 'STAGE 4', 'Extra videos make the room look full')}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const p = backOut(clamp((t - i * 6) / 12));
        const x = 220 + (i % 3) * 500, y = 220 + Math.floor(i / 3) * 320;
        const face = [1, 0, 2, 3, 4, 5][i];
        return (
          <g key={i} opacity={clamp((t - i * 6) / 6)} transform={`translate(${x + 240} ${y + 150}) scale(${0.6 + 0.4 * p}) translate(-240 -150)`}>
            <Tile id={'tl' + i} x={0} y={0} w={480} h={290} face={face} t={t + i * 9} talk={i % 2 === 0} mood="smile" label={i === 0 ? 'Victim A' : FACES[face].name} room={['#26365F', '#4A2D5F', '#2D5F4A', '#5F4A2D', '#2D4A5F', '#5F2D4A'][i]} />
            <T x={466} y={30} size={20} anchor="end" mono weight={700} color={C.red}>▶ REC FILE</T>
          </g>
        );
      })}
    </g>
  ),
  // ---------- stage 5-6
  from_friend: ({ t, d }) => {
    const A = mk(d, 'audio', 100);
    return (
      <g>
        {stage(t, 'STAGE 5', 'A message from “your friend”')}
        <Win x={300} y={190} w={1320} h={640} id="ff" title="Meeting chat">
          <Tile id="ff1" x={40} y={76} w={720} h={460} face={1} t={t} label="Victim A" mood="smile" />
          <rect x={800} y={90} width={480} height={460} rx={20} fill="#0C1226" stroke={C.line} strokeWidth={2} />
          <g opacity={backOut(clamp((t - A + 4) / 12))}>
            <rect x={820} y={120} width={440} height={180} rx={22} fill="#1B2748" stroke={C.yel} strokeWidth={3} />
            <T x={846} y={174} size={30} anchor="start" weight={700} color={C.yel}>Victim A</T>
            <T x={846} y={222} size={30} anchor="start" weight={500}>audio problem on your</T>
            <T x={846} y={262} size={30} anchor="start" weight={500}>side, nobody can hear you!</T>
          </g>
          <g opacity={backOut(clamp((t - A - 30) / 12))}>
            <rect x={820} y={320} width={440} height={86} rx={22} fill="#2A0F1E" stroke={C.red} strokeWidth={3} />
            <T x={846} y={374} size={30} anchor="start" weight={600} color={C.wht}>🔇 Your mic: not detected</T>
          </g>
        </Win>
      </g>
    );
  },
  pressure: ({ t }) => (
    <g>
      {stage(t, 'STAGE 5', 'Fake participants add pressure')}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const x = 200 + (i % 3) * 520, y = 200 + Math.floor(i / 3) * 330;
        const me = i === 4;
        const face = [1, 0, 2, 3, 4, 5][i];
        return (
          <g key={i}>
            <Tile id={'pr' + i} x={x} y={y} w={480} h={300} face={face} t={t} label={me ? 'You' : i === 0 ? 'Victim A' : FACES[face].name} mic={me ? false : true} border={me ? C.red : undefined} room={me ? '#5F2D2D' : '#26365F'} mood={me ? 'worry' : 'neutral'} talk={!me && Math.floor(t / 14) % 5 === i % 5} />
            {!me && t > 8 + i * 5 ? <T x={x + 240} y={y - 14} size={26} mono weight={400} color={C.yel} op={0.6 + 0.4 * Math.sin(t * 0.2 + i)}>“…we can't hear you”</T> : null}
          </g>
        );
      })}
    </g>
  ),
  steps: ({ t, d }) => {
    const S = [['1', 'Click an “update” prompt'], ['2', 'Run a script'], ['3', 'Paste code into your terminal']];
    const at = [mk(d, 's1', 60), mk(d, 's2', 100), mk(d, 's3', 140)];
    return (
      <g>
        {stage(t, 'STAGE 5', '“Your friend” walks you through the fix')}
        {(() => {
          const k = easeInOut(clamp((t - at[0] + 14) / 14));
          return (
            <g opacity={1 - k * 0.55}>
              <Tile id="st0" x={460 + k * 920} y={150 - k * 40} w={1000 - k * 580} h={600 - k * 350} face={1} t={t} talk={t < at[0]} mood="smile" label="Victim A" />
              <g opacity={1 - k}>
                <rect x={560} y={780} width={800} height={70} rx={35} fill="#1B2748" stroke={C.yel} strokeWidth={3} />
                <T x={960} y={826} size={32} weight={600}>“don't worry, I'll walk you through it”</T>
              </g>
            </g>
          );
        })()}
        {S.map(([n, s], i) => {
          const p = backOut(clamp((t - at[i] + 4) / 12));
          return (
            <g key={i} opacity={clamp((t - at[i] + 4) / 6)} transform={`translate(${200 + (1 - p) * 120} ${400 + i * 150})`}>
              <rect width={1520} height={124} rx={28} fill="#16224A" stroke={i === 2 ? C.red : C.cyan} strokeWidth={4} />
              <circle cx={80} cy={62} r={40} fill={i === 2 ? C.red : C.cyan} /><T x={80} y={78} size={48} color="#04060C">{n}</T>
              <T x={160} y={82} size={54} anchor="start" weight={700}>{s}</T>
            </g>
          );
        })}
      </g>
    );
  },
  terminal: ({ t }) => {
    const prog = clamp((t - 20) / 24);
    return (
      <g>
        {stage(t, 'THE INFECTION', 'Illustration: the command is blurred on purpose')}
        <Win x={300} y={190} w={1320} h={560} id="tm" title="Terminal" danger={t > 20}>
          <rect width={1320} height={560} fill="#05080F" />
          <T x={40} y={120} size={36} anchor="start" mono weight={400} color={C.grn}>$ ▓▓▓▓ ▓▓▓▓▓▓▓ ▓▓ ▓▓▓▓▓▓▓▓▓▓▓▓ | ▓▓</T>
          <T x={40} y={190} size={32} anchor="start" mono weight={400} color={C.dim} op={clamp((t - 6) / 6)}>fixing audio driver…</T>
          <rect x={40} y={240} width={1240} height={34} rx={17} fill="#16224A" />
          <rect x={40} y={240} width={1240 * prog} height={34} rx={17} fill={C.red} />
          <T x={40} y={350} size={34} anchor="start" mono weight={700} color={C.red} op={clamp((t - 34) / 6)}>▓ malware installed</T>
        </Win>
        <Stamp x={1480} y={170} text="DON'T" t={t} at={30} size={90} />
      </g>
    );
  },
  icons4: ({ t, d }) => {
    const I = [['COOKIE', 'HARVESTER', '🍪'], ['KEY-', 'LOGGERS', '⌨'], ['SCREEN', 'CAPTURERS', '🖥'], ['BACK-', 'DOOR', '🚪']];
    const at = [mk(d, 'i1', 30), mk(d, 'i2', 60), mk(d, 'i3', 90), mk(d, 'i4', 120)];
    return (
      <g>
        {stage(t, 'THE INFECTION', 'What the FBI says gets installed')}
        {I.map(([a, b, ic], i) => {
          const p = backOut(clamp((t - at[i] + 4) / 12));
          const on = clamp((t - at[i] + 4) / 6);
          return (
            <g key={i}>
            <rect x={210 + i * 400} y={290} width={360} height={430} rx={30} fill="none" stroke={C.line} strokeWidth={3} strokeDasharray="14 10" opacity={clamp(t / 8) * (1 - on)} />
            <g opacity={on} transform={`translate(${210 + i * 400} ${290 + (1 - p) * 60})`}>
              <rect width={360} height={430} rx={30} fill="#16224A" stroke={C.red} strokeWidth={4} />
              <T x={180} y={200} size={140}>{ic}</T>
              <T x={180} y={320} size={38} weight={800} color={C.red}>{a}</T>
              <T x={180} y={368} size={38} weight={800} color={C.red}>{b}</T>
            </g>
            </g>
          );
        })}
      </g>
    );
  },
  rewind: ({ t }) => {
    const p = easeInOut(clamp(t / 50));
    const x = 300 + 1320 * (1 - p);
    return (
      <g>
        {stage(t, 'THE INFECTION', 'Per the FBI: recording starts at the first click')}
        <rect x={300} y={500} width={1320} height={20} rx={10} fill="#1B2748" />
        <rect x={300} y={500} width={1320 * (1 - p)} height={20} rx={10} fill={C.red} />
        <circle cx={x} cy={510} r={24} fill={C.wht} />
        <T x={300} y={460} size={34} anchor="start" mono weight={400} color={C.yel}>1st click · REC starts</T>
        <T x={1620} y={460} size={34} anchor="end" mono weight={400} color={C.dim}>“fix audio” click</T>
        <Rec x={960} y={280} t={t} size={1.6} label="REC" />
        <T x={960} y={700} size={60} ls={2} op={clamp((t - 40) / 10)}>THEY WERE ALREADY RECORDING YOU</T>
      </g>
    );
  },
  you_next: ({ t, d }) => {
    const N = mk(d, 'next', 30);
    const p = easeInOut(clamp((t - N) / 14));
    return (
      <g>
        <Glow x={960} y={430} r={440} color={C.red} op={0.12 + 0.12 * p} />
        <Tile id="yn" x={510} y={130} w={900} h={540} face={4} t={t} rec={p > 0.5} mood={p > 0.5 ? 'shock' : 'neutral'} glitch={p > 0.5 ? 0.18 : 0} label={p > 0.5 ? 'stored webcam video' : 'You'} border={p > 0.5 ? C.red : undefined} />
        <g transform="translate(960 790)">
          <rect x={-300} y={-62} width={600} height={104} rx={52} fill={p > 0.5 ? C.red : '#1B2748'} />
          <T x={0} y={8} size={56} color={p > 0.5 ? '#fff' : C.wht}>{p > 0.5 ? 'THE NEXT VICTIM A' : 'YOU'}</T>
        </g>
      </g>
    );
  },
  chain: ({ t }) => {
    const gens = 4;
    const nodes: { x: number; y: number; g: number }[] = [{ x: 240, y: 520, g: 0 }];
    const edges: [number, number][] = [];
    let prevIds = [0];
    for (let g = 1; g <= gens; g++) {
      const count = 2 ** g;
      const ids: number[] = [];
      for (let i = 0; i < count; i++) {
        nodes.push({ x: 240 + g * 360, y: 210 + ((i + 0.5) / count) * 620, g });
        edges.push([prevIds[Math.floor(i / 2)], nodes.length - 1]);
        ids.push(nodes.length - 1);
      }
      prevIds = ids;
    }
    return (
      <g>
        {stage(t, 'STAGE 6', 'Each victim becomes the next lure')}
        {edges.map(([a, b], i) => {
          const na = nodes[a], nb = nodes[b];
          const p = clamp((t - nb.g * 22) / 14);
          return <line key={i} x1={na.x} y1={na.y} x2={na.x + (nb.x - na.x) * p} y2={na.y + (nb.y - na.y) * p} stroke={C.red} strokeWidth={4} opacity={0.7} />;
        })}
        {nodes.map((n, i) => {
          const p = backOut(clamp((t - n.g * 22 - 10) / 12));
          const f = FACES[i % FACES.length];
          const r = 30;
          if (i > 0 && p <= 0) return null;
          return (
            <g key={i} transform={`translate(${n.x} ${n.y}) scale(${i === 0 ? 1 : p})`}>
              <circle r={r + 10} fill={C.red} opacity={0.25} />
              <circle r={r} fill={f.shirt} stroke={C.red} strokeWidth={5} /><circle cy={-r * 0.2} r={r * 0.45} fill={f.skin} />
            </g>
          );
        })}
        <T x={1720} y={170} size={30} anchor="end" color={C.dim} weight={600} op={clamp((t - 80) / 10)}>the pool of targets grows exponentially · FBI</T>
      </g>
    );
  },
  // ---------- patience, the seizure, AI
  months: ({ t, len }) => {
    const m = Math.min(13, 1 + Math.floor(t / Math.max(6, (len - 40) / 13)));
    return (
      <g>
        {stage(t, 'PATIENCE', 'Months, even more than a year later')}
        <g transform="translate(960 500)">
          <rect x={-300} y={-260} width={600} height={500} rx={30} fill="#16224A" stroke={C.cyan} strokeWidth={6} />
          <rect x={-300} y={-260} width={600} height={120} rx={30} fill={C.red} />
          <T x={0} y={-178} size={64} color="#fff">MONTH</T>
          <T x={0} y={80} size={260} color={C.wht}>{m}</T>
          {m >= 13 ? <T x={0} y={190} size={54} color={C.yel}>+ more than a year</T> : null}
        </g>
      </g>
    );
  },
  wallet: ({ t }) => {
    const bars = 9;
    return (
      <g>
        {stage(t, 'PATIENCE', 'Waiting for the wallet balance to grow')}
        <g transform="translate(300 230)">
          {Array.from({ length: bars }, (_, i) => {
            const hgt = (60 + i * 38 + (i === bars - 1 ? 90 : 0)) * easeOut(clamp((t - i * 5) / 12));
            return <rect key={i} x={i * 90} y={540 - hgt} width={66} height={hgt} rx={10} fill={i === bars - 1 ? C.grn : '#2C4A8A'} />;
          })}
          <T x={0} y={600} size={30} anchor="start" mono weight={400} color={C.dim}>wallet balance →</T>
        </g>
        <g transform="translate(1430 470)">
          <ellipse rx={150} ry={90} fill="#0A0F1E" stroke={C.red} strokeWidth={8} />
          <circle cx={Math.sin(t * 0.08) * 40} r={52} fill={C.red} /><circle cx={Math.sin(t * 0.08) * 40} r={22} fill="#1a0610" />
          <T x={0} y={190} size={44} color={C.red}>WATCHING</T>
        </g>
      </g>
    );
  },
  grid900: ({ t, d }) => {
    const N = mk(d, 'nine', 80);
    const cols = 30, rows = 5;
    const p = d.p;
    return (
      <g>
        {Array.from({ length: cols * rows }, (_, i) => {
          const on = i < clamp((t - 4) / Math.max(20, N)) * cols * rows;
          return <rect key={i} x={110 + (i % cols) * 58} y={120 + Math.floor(i / cols) * 40} width={50} height={34} rx={5} fill={['#3A6BFF', '#E5486B', '#2FBF8A', '#8E5BFF', '#F28A2E', '#26A9E0'][Math.floor(rnd(5, i) * 6)]} opacity={on ? 0.3 + rnd(6, i) * 0.35 : 0.05} />;
        })}
        <rect x={600} y={110} width={720} height={220} rx={30} fill="#04060C" opacity={0.88} stroke={C.red} strokeWidth={5} />
        <Num t={t} to={900} at={0} dur={Math.max(24, N)} suffix="+" x={960} y={250} size={160} color={C.red} />
        <T x={960} y={306} size={32} color={C.wht} weight={600}>stolen webcam videos seized</T>
        <Evidence id={d.id} t={t} src={p.src} iw={p.iw} ih={p.ih} rects={p.rects} quote="Pursuant to a federal warrant, the FBI seized over 900 webcam videos of FaceStealer victims." emph="seized over 900 webcam videos" source="DOJ PRESS RELEASE 26-1356 · 12 NOV 2026" at={10} colX={p.colX} y0={350} ctx={1} qsize={46} />
      </g>
    );
  },
  ai: ({ t }) => (
    <g>
      <Glow x={960} y={480} r={460} color={C.purple} op={0.25} />
      <T x={960} y={330} size={70} weight={700} op={clamp(t / 8)}>SO WHERE DOES</T>
      <T x={960} y={640} size={380} color={C.purple} stroke="#04060C" op={(t % 50 > 46 ? 0.6 : 1) * clamp((t - 4) / 8)}>AI?</T>
    </g>
  ),
  morph: ({ t, d }) => {
    const D = mk(d, 'deepfake', 120);
    const p = easeInOut(clamp((t - D + 10) / 24));
    return (
      <g>
        {stage(t, 'EMERGING', 'FBI: “super intelligence” used to make deepfakes')}
        <Tile id="mo1" x={190} y={250} w={620} h={420} face={3} t={t} label="public photos" room="#3A4A2D" mood="smile" />
        <Arrow x1={850} y1={460} x2={1070} y2={460} p={clamp((t - D + 20) / 12)} color={C.purple} />
        <g opacity={p}><Tile id="mo2" x={1110} y={250} w={620} h={420} face={3} t={t} glitch={0.5} label="deepfake" room="#3A2D5F" talk={true} /></g>
        <Chip x={1110} y={740} text="WELL-KNOWN CRYPTO FIGURES" color={C.purple} size={26} op={p} />
        <T x={500} y={760} size={30} color={C.dim} weight={500} op={clamp((t - 20) / 10)}>public photos or videos</T>
      </g>
    );
  },
  enough: ({ t }) => (
    <g>
      <Glow x={960} y={470} r={470} color={C.red} op={0.2} />
      <Tile id="en" x={560} y={120} w={800} h={470} face={1} t={t} rec={true} glitch={t > 30 ? 0.2 : 0} label="Victim A · real webcam video" />
      <T x={960} y={700} size={60} weight={700} color={C.dim} op={clamp((t - 2) / 8)}>NO DEEPFAKE NEEDED.</T>
      <T x={960} y={820} size={104} stroke="#04060C" op={clamp((t - 34) / 8)}>A REAL FACE WAS ENOUGH</T>
    </g>
  ),
  // ---------- supply chain + attribution
  lib: ({ t, d }) => {
    const E = mk(d, 'Earlier', 40);
    const M = mk(d, 'maintainer', 120);
    const intro = 1 - clamp((t - E + 6) / 8);
    return (
      <g>
        {intro > 0 ? <g opacity={intro}><Glow x={960} y={480} r={420} color={C.red} op={0.2} /><T x={960} y={540} size={170} color={C.red} stroke="#04060C">IT GETS WORSE</T></g> : null}
        <g opacity={clamp((t - E + 4) / 10)}>
          {stage(t - E, 'SUPPLY CHAIN', 'Earlier this year, per the FBI')}
          <g transform="translate(640 470)">
            <path d="M-200 -100 L0 -200 L200 -100 L200 120 L0 220 L-200 120 Z" fill="#16224A" stroke={C.cyan} strokeWidth={8} />
            <path d="M-200 -100 L0 0 L200 -100 M0 0 V220" fill="none" stroke={C.cyan} strokeWidth={6} />
            <T x={0} y={320} size={40} color={C.wht}>OPEN-SOURCE JAVASCRIPT LIBRARY</T>
          </g>
          <g opacity={backOut(clamp((t - M + 4) / 12))}>
            <Arrow x1={1080} y1={470} x2={870} y2={470} color={C.cyan} p={clamp((t - M) / 10)} />
            <Avatar x={1320} y={430} s={1.6} skin={FACES[2].skin} hair={FACES[2].hair} shirt={FACES[2].shirt} style={2} t={t} mood="neutral" />
            <T x={1320} y={790} size={40} color={C.wht}>THE MAINTAINER</T>
          </g>
        </g>
      </g>
    );
  },
  follow: ({ t }) => (
    <g>
      {stage(t, 'SUPPLY CHAIN', 'A fake Teams call with several participants')}
      {[0, 1, 2].map((i) => <Tile key={i} id={'fo' + i} x={260 + i * 460} y={220} w={420} h={300} face={[2, 3, 0][i]} t={t} mood={i === 0 ? 'neutral' : 'smile'} talk={i === 2 && t > 30} label={['Maintainer', 'participant', 'someone he recognized'][i]} border={i === 2 ? C.yel : undefined} />)}
      <g opacity={clamp((t - 30) / 10)}>
        <rect x={260} y={600} width={1300} height={130} rx={26} fill="#16224A" stroke={C.red} strokeWidth={4} />
        <T x={910} y={682} size={44} weight={700}>…including someone he recognized</T>
      </g>
    </g>
  ),
  deps: ({ t }) => {
    const pts = [[960, 240], [620, 400], [1300, 400], [440, 580], [800, 580], [1120, 580], [1480, 580], [620, 760], [960, 760], [1300, 760]];
    const ed = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6], [4, 7], [5, 8], [6, 9]];
    const bad = new Set([0, 2, 5, 8]);
    const infected = (i: number) => bad.has(i) && t > 18 + i * 5;
    return (
      <g>
        {stage(t, 'SUPPLY CHAIN', 'Malicious dependencies, downloaded with the real library')}
        {ed.map(([a, b], i) => <line key={i} x1={pts[a][0]} y1={pts[a][1]} x2={pts[b][0]} y2={pts[b][1]} stroke={infected(b) ? C.red : '#2C3A6A'} strokeWidth={5} />)}
        {pts.map(([x, y], i) => <g key={i}><circle cx={x} cy={y} r={44} fill={infected(i) ? C.red : '#16224A'} stroke={infected(i) ? '#fff' : C.cyan} strokeWidth={4} /><T x={x} y={y + 14} size={36}>{infected(i) ? '☠' : '📦'}</T></g>)}
      </g>
    );
  },
  tens: ({ t }) => (
    <g>
      {stage(t, 'SUPPLY CHAIN', 'One maintainer, potentially millions of victims')}
      <T x={960} y={430} size={190} stroke="#04060C" color={C.yel}>TENS OF MILLIONS</T>
      <T x={960} y={540} size={72} color={C.wht}>OF DOWNLOADS EVERY WEEK</T>
      <rect x={300} y={640} width={1320} height={40} rx={20} fill="#1B2748" />
      <rect x={300} y={640} width={1320 * easeOut(clamp(t / 50))} height={40} rx={20} fill={C.red} />
    </g>
  ),
  names: ({ t, d }) => {
    const N = ['SAPPHIRE SLEET', 'BLUENOROFF', 'APT38', 'UNC1069', 'DANGEROUS PASSWORD', 'CRYPTOCORE', 'STARDUST CHOLLIMA'];
    const said = [mk(d, 'Sapphire', 160), mk(d, 'BlueNoroff', 200), mk(d, 'APT', 230)];
    const among = mk(d, 'among', 260);
    const p = d.p;
    return (
      <g>
        <Evidence id={d.id} t={t} src={p.src} iw={p.iw} ih={p.ih} rects={p.rects} quote="" source="FBI FLASH AC-111226-MS · 12 NOV 2026 · PAGE 1" tag="ATTRIBUTION · FBI" at={said[0] - 6} dur={60} colX={[110, 1320]} y0={110} ctx={1} />
        <g opacity={backOut(clamp((t - mk(d, 'North', 40) + 4) / 12))}>
          <T x={960} y={500} size={58} color={C.red} stroke="#04060C">NORTH KOREAN STATE-SPONSORED HACKERS</T>
        </g>
        {N.map((s, i) => {
          const at = i < 3 ? said[i] : among;
          const q = backOut(clamp((t - at + 2) / 12));
          const big = i < 3;
          const w = big ? 520 : 380;
          const x = big ? 170 + i * 545 : 165 + (i - 3) * 400;
          const y = big ? 580 : 730;
          return (
            <g key={i} opacity={clamp((t - at + 2) / 6) * (big ? 1 : 0.7)} transform={`translate(${x + w / 2} ${y + 50}) scale(${0.85 + 0.15 * q}) translate(${-w / 2} -50)`}>
              <rect width={w} height={big ? 100 : 84} rx={big ? 50 : 42} fill="#2A0F1E" stroke={C.red} strokeWidth={big ? 4 : 2} />
              <T x={w / 2} y={big ? 64 : 54} size={big ? 42 : 28} color={C.wht} mono weight={700}>{s}</T>
            </g>
          );
        })}
        <T x={960} y={862} size={28} color={C.dim} weight={500} op={clamp((t - among - 8) / 10)}>names the FBI says these hackers are publicly known by</T>
      </g>
    );
  },
  // ---------- defence
  checklist: ({ t, d }) => {
    const R = [
      ['Join with the official app + an invite code', 'not a link', 'r1'],
      ['Webcam off until you see and hear the inviter', '', 'r2'],
      ['Never run a script or paste code to “fix” a call', '', 'r3'],
      ['Confirm the call on a different channel', 'text or phone', 'r4'],
      ['Turn on multi-factor authentication', 'on Telegram, WhatsApp, Slack…', 'r5'],
    ];
    return (
      <g>
        <Chip x={230} y={150} text="FBI RECOMMENDATIONS" color={C.grn} size={28} op={clamp(t / 8)} />
        <T x={1690} y={150} size={24} anchor="end" mono weight={400} color={C.dim} op={clamp(t / 8)}>FBI FLASH AC-111226-MS · PAGE 5</T>
        {R.map(([a, b, m], i) => <CheckRow key={i} t={t} at={mk(d, m, i * 80)} y={200 + i * 128} n={String(i + 1)} text={a} sub={b || undefined} />)}
      </g>
    );
  },
  compromised: ({ t, d }) => {
    const R = [
      ['Move crypto to a NEW wallet', 'with new seed phrases, on a clean device', 'c1'],
      ['Warn your contacts', 'they are the next targets', 'c2'],
      ['Report it at IC3.gov', 'keyword: “FaceStealer”', 'c3'],
    ];
    return (
      <g>
        <Chip x={230} y={180} text="IF YOU THINK YOU'VE BEEN HIT" color={C.red} size={28} op={clamp(t / 8)} />
        {R.map(([a, b, m], i) => <CheckRow key={i} t={t} at={mk(d, m, 30 + i * 80)} y={250 + i * 170} n={String(i + 1)} text={a} sub={b} color={i === 2 ? C.yel : C.red} />)}
      </g>
    );
  },
  bigtext: ({ t, d }) => {
    const L: { text: string; color?: string; size?: number }[] = d.p.lines;
    return (
      <g>
        <Glow x={960} y={500} r={500} color={d.p.glow ?? C.red} op={0.16} />
        {L.map((l, i) => {
          const p = backOut(clamp((t - i * 10) / 12));
          return <T key={i} x={960} y={d.p.ys ? d.p.ys[i] : d.p.y0 + i * (d.p.step ?? 150)} size={l.size ?? 130} color={l.color ?? C.wht} stroke="#04060C" op={clamp((t - i * 10) / 6)} rot={(1 - p) * -3}>{l.text}</T>;
        })}
        {d.p.sub ? <T x={960} y={d.p.subY ?? 820} size={44} color={C.dim} weight={600} op={clamp((t - 24) / 10)}>{d.p.sub}</T> : null}
      </g>
    );
  },
  // ---------- close
  ask: ({ t }) => (
    <g>
      <Tile id="ak" x={520} y={110} w={880} h={520} face={0} t={t} border={C.yel} mood="smile" talk={true} label="Sam" />
      <g transform={`translate(1360 150) scale(${1 + 0.1 * Math.sin(t * 0.2)})`}><circle r={70} fill={C.yel} /><T x={0} y={34} size={100} color="#04060C">?</T></g>
      <T x={960} y={770} size={84} stroke="#04060C" op={clamp((t - 30) / 10)}>IS THIS PERSON REALLY HERE?</T>
    </g>
  ),
  cta: ({ t }) => (
    <g>
      <Glow x={960} y={480} r={460} color={C.red} op={0.18} />
      <g transform={`translate(960 420) scale(${backOut(clamp(t / 12)) * (1 + 0.04 * Math.sin(t * 0.2))})`}>
        <rect x={-300} y={-80} width={600} height={160} rx={40} fill={C.red} />
        <T x={0} y={34} size={90} color="#fff">SUBSCRIBE</T>
      </g>
      <T x={960} y={620} size={46} weight={700} op={clamp((t - 40) / 10)}>and send this to someone who needs it</T>
    </g>
  ),
  end: ({ t, len }) => {
    const p = clamp((t - 10) / 40);
    return (
      <g>
        <Tile id="ed" x={560} y={140} w={800} h={470} face={0} t={t} glitch={p * 0.9} rec={true} label="Sam" />
        <T x={960} y={730} size={70} op={clamp((t - 6) / 12)} stroke="#04060C">THE NEXT CALL MIGHT NOT BE A FRIEND</T>
        <rect width={W} height={H} fill="#000" opacity={clamp((t - (len - 40)) / 38)} />
      </g>
    );
  },
};

const MAIN = (d: Def): React.FC<ShotProps> => {
  const Scene = K[d.kind];
  const Comp: React.FC<ShotProps> = ({ t, len, f }) => {
    const z = kf(t, [[0, 1], [len, 1.03]]);
    return (
      <g>
        <defs>
          <filter id="blur40" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="46" /></filter>
        </defs>
        <BG t={t} id={d.id} tint={d.p?.tint} />
        <g transform={`translate(960 540) scale(${z}) translate(-960 -540)`}>
          {Scene ? <Scene t={t} len={len} f={f} d={d} /> : <T x={960} y={540} size={80}>{d.kind}?</T>}
        </g>
        <Scan t={t} />
      </g>
    );
  };
  return Comp;
};

export const buildShots = (defs: Def[]) => Object.fromEntries(defs.map((d) => [d.id, MAIN(d)]));
