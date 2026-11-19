import React from 'react';
import { ShotProps } from '../../engine';
import {
  C, W, H, BG, T, Chip, Avatar, FACES, Tile, Win, DocShot, Cursor, Chat, Rec, Num, Scan, Corner, HL, View, Msg,
  kf, clamp, easeOut, easeInOut, backOut, rnd,
} from './ui';

export type Def = { id: string; cue: string; kind: string; key?: number; note?: string; p?: any };
type SP = ShotProps & { d: Def };

const stage = (t: number, text: string, sub?: string) => (
  <g>
    <Chip x={90} y={96} text={text} color={C.yel} size={26} op={clamp(t / 8)} />
    {sub ? <T x={90} y={150} size={30} anchor="start" color={C.dim} weight={500} op={clamp((t - 6) / 8)}>{sub}</T> : null}
  </g>
);

const Laptop: React.FC<{ x: number; y: number; w?: number; t: number; face?: number; children?: React.ReactNode; rec?: boolean; id: string; screen?: string }> = ({ x, y, w = 760, t, face = 0, children, rec, id, screen = '#101A38' }) => {
  const h = w * 0.62;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-w / 2 - 20} y={h + 10} width={w + 40} height={26} rx={13} fill="#1E2A4F" />
      <rect x={-w / 2} y={0} width={w} height={h} rx={20} fill="#0A0F1E" stroke="#2C3A6A" strokeWidth={6} />
      <rect x={-w / 2 + 18} y={18} width={w - 36} height={h - 36} rx={10} fill={screen} />
      {children ?? <Tile id={id} x={-w / 2 + 40} y={36} w={w - 80} h={h - 72} face={face} t={t} rec={rec} />}
      <circle cx={0} cy={9} r={5} fill={rec ? C.red : '#2A3358'} opacity={rec ? 0.5 + 0.5 * Math.abs(Math.sin(t * 0.12)) : 1} />
    </g>
  );
};

const Burst: React.FC<{ x: number; y: number; t: number; at: number; color?: string }> = ({ x, y, t, at, color = C.cyan }) => {
  const p = clamp((t - at) / 18);
  if (p <= 0 || p >= 1) return null;
  return <circle cx={x} cy={y} r={20 + p * 140} fill="none" stroke={color} strokeWidth={8 * (1 - p)} opacity={1 - p} />;
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
      <rect x={-(text.length * size * 0.33 + 34)} y={-size * 0.82} width={text.length * size * 0.66 + 68} height={size * 1.2} rx={14} fill="#000" opacity={0.55} stroke={color} strokeWidth={10} />
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

// ---------------------------------------------------------------- scene kinds
const K: Record<string, React.FC<SP>> = {
  // ---------- cold open
  msg: ({ t, d }) => (
    <g>
      <Chat id="m1" x={560} y={130} t={t} who={0} msgs={[{ who: 'them', text: 'hey! got a minute?', at: 12 }, { who: 'them', text: 'quick call?', at: 38, link: true }]} />
      <Cursor x={kf(t, [[0, 1500], [60, 830]])} y={kf(t, [[0, 900], [60, 440]])} click={clamp((t - 78) / 14)} />
      <Chip x={90} y={96} text="INCOMING · A FRIEND" color={C.cyan} op={clamp(t / 8)} />
    </g>
  ),
  link_click: ({ t }) => (
    <g transform={`translate(960 540) scale(${kf(t, [[0, 1], [40, 1.35]])}) translate(-740 -430)`}>
      <Chat id="m2" x={560} y={130} t={t} who={0} msgs={[{ who: 'them', text: 'hey! got a minute?', at: -99 }, { who: 'them', text: 'quick call?', at: -99, link: true }]} />
      <Cursor x={kf(t, [[0, 900], [18, 745]])} y={kf(t, [[0, 600], [18, 430]])} s={1.2} click={clamp((t - 22) / 16)} />
    </g>
  ),
  lobby: ({ t }) => (
    <g>
      <Win x={300} y={90} w={1320} h={780} id="lb" title="Meeting lobby">
        <Tile id="lb1" x={60} y={76} w={1200} h={640} face={0} t={t} label="Sam" mic={true} />
        <Chip x={80} y={110} text="WAITING FOR HOST…" color={C.yel} size={24} op={0.9} />
      </Win>
    </g>
  ),
  face_zoom: ({ t, len }) => (
    <g transform={`translate(960 480) scale(${kf(t, [[0, 1], [len, 1.12]])}) translate(-960 -480)`}>
      <Win x={300} y={90} w={1320} h={780} id="fz" title="Meeting">
        <Tile id="fz1" x={60} y={76} w={1200} h={640} face={0} t={t} label="Sam" talk={t > 20} mic={true} />
      </Win>
    </g>
  ),
  toast: ({ t }) => {
    const p = backOut(clamp((t - 6) / 12));
    return (
      <g>
        <Win x={300} y={90} w={1320} h={780} id="ts" title="Meeting">
          <Tile id="ts1" x={60} y={76} w={1200} h={640} face={0} t={t} label="Sam" mic={false} />
        </Win>
        <g transform={`translate(960 ${-120 + p * 270})`}>
          <rect x={-420} y={0} width={840} height={140} rx={26} fill="#2A0F1E" stroke={C.red} strokeWidth={5} />
          <T x={-380} y={58} size={42} anchor="start" color={C.wht}>⚠ We can't hear you</T>
          <T x={-380} y={104} size={28} anchor="start" color={C.dim} weight={500} mono>Sam: click here to fix it</T>
        </g>
      </g>
    );
  },
  fix_click: ({ t }) => {
    const prog = clamp((t - 44) / 30);
    return (
      <g>
        <Win x={300} y={90} w={1320} h={780} id="fx" title="Meeting" danger={t > 40}>
          <Tile id="fx1" x={60} y={76} w={1200} h={640} face={0} t={t} label="Sam" mic={false} glitch={t > 40 ? 0.7 : 0} />
        </Win>
        <g transform="translate(960 400)">
          <rect x={-250} y={-48} width={500} height={96} rx={48} fill={t > 40 ? C.red : C.cyan} />
          <T x={0} y={14} size={42} color="#04060C">{t > 40 ? 'Installing…' : 'Fix audio'}</T>
          {t > 40 ? <rect x={-210} y={30} width={420 * prog} height={8} rx={4} fill="#04060C" /> : null}
        </g>
        <Cursor x={kf(t, [[0, 1300], [26, 1040]])} y={kf(t, [[0, 800], [26, 440]])} click={clamp((t - 30) / 14)} />
      </g>
    );
  },
  loop: ({ t }) => {
    const ph = (t % 60) / 60;
    return (
      <g>
        {[2, 1].map((k) => <g key={k} opacity={0.22 / k} transform={`translate(${-k * 44} ${-k * 26})`}><Tile id={'lp' + k} x={420} y={140} w={1080} h={580} face={0} t={t} glitch={0.2} /></g>)}
        <Tile id="lp0" x={420} y={140} w={1080} h={580} face={0} t={t} glitch={t > 20 ? 0.4 + 0.3 * Math.sin(t * 0.4) : 0} talk={true} rec={false} />
        <rect x={420} y={760} width={1080} height={16} rx={8} fill="#1B2748" />
        <rect x={420} y={760} width={1080 * ph} height={16} rx={8} fill={C.red} />
        <circle cx={420 + 1080 * ph} cy={768} r={16} fill={C.wht} />
        <T x={960} y={830} size={34} color={C.red} mono weight={700} ls={6}>↻ SAME 8 SECONDS ON LOOP</T>
        <Stamp x={1400} y={210} text="RECORDED" t={t} at={20} size={86} />
      </g>
    );
  },
  film: ({ t }) => (
    <g>
      <g transform={`translate(${-(t * 6) % 420} 0)`}>
        {Array.from({ length: 9 }, (_, i) => (
          <g key={i} transform={`translate(${i * 420 - 100} 300)`}>
            <rect x={-16} y={-34} width={380} height={420} rx={10} fill="#0A0F1E" stroke="#2C3A6A" strokeWidth={4} />
            <Tile id={'fl' + i} x={0} y={0} w={348} h={350} face={i} t={t} />
            {Array.from({ length: 6 }, (_, j) => <rect key={j} x={-8 + j * 62} y={-28} width={30} height={14} rx={4} fill="#1E2A4F" />)}
          </g>
        ))}
      </g>
      <Stamp x={960} y={190} text="STOLEN FOOTAGE" t={t} at={14} size={110} rot={-3} />
    </g>
  ),
  count400: ({ t, len }) => (
    <g>
      <Glow x={960} y={440} r={420} color={C.red} op={0.22 + 0.08 * Math.sin(t * 0.15)} />
      <T x={960} y={250} size={46} color={C.dim} mono weight={400} ls={4}>STOLEN IN THE LAST 18 MONTHS</T>
      <Num t={t} to={400} at={4} dur={60} prefix="$" suffix="M+" x={960} y={560} size={330} color={C.red} />
      <T x={960} y={700} size={44} color={C.wht} weight={600} op={clamp((t - 50) / 10)}>"more than $400 million" · FBI</T>
    </g>
  ),
  title: ({ t }) => {
    const g = t < 14 || (t > 40 && t < 46) ? 1 : 0;
    return (
      <g>
        <Glow x={960} y={470} r={520} color={C.red} op={0.18} />
        {[[-8, C.cyan], [8, C.red]].map(([dx, c], i) => g || t % 90 > 84 ? <T key={i} x={960 + (dx as number)} y={480} size={214} color={c as string} op={0.7} ls={4}>FACESTEALER</T> : null)}
        <T x={960} y={480} size={214} ls={4} stroke="#04060C">FACESTEALER</T>
        <rect x={420} y={530} width={1080 * easeOut(clamp((t - 10) / 22))} height={8} fill={C.red} />
        <T x={960} y={640} size={52} color={C.wht} weight={700} op={clamp((t - 22) / 10)} ls={2}>THE FAKE VIDEO CALL THAT STOLE $400 MILLION</T>
        <Corner x={300} y={250} w={1320} h={480} p={clamp(t / 14)} />
      </g>
    );
  },
  // ---------- documents
  doc: ({ t, len, d }) => {
    const p = d.p;
    return <DocShot id={d.id} src={p.src} iw={p.iw} ih={p.ih} t={t} view={p.view.map((v: View) => [v[0] < 0 ? len + v[0] : v[0], v[1], v[2]] as View)} hl={p.hl} url={p.url} tag={p.tag} cx={p.cx} cursor={p.cursor} x={p.x} y={p.y} w={p.w} h={p.h} />;
  },
  timeline18: ({ t }) => (
    <g>
      <T x={960} y={230} size={56} color={C.dim} weight={700} ls={4}>FOR THE LAST</T>
      <Num t={t} to={18} at={0} dur={44} x={960} y={470} size={300} color={C.yel} />
      <T x={960} y={560} size={80} ls={8}>MONTHS</T>
      {Array.from({ length: 18 }, (_, i) => {
        const on = t > i * 2.2 + 6;
        return <g key={i}><rect x={290 + i * 80} y={680} width={60} height={60} rx={10} fill={on ? C.red : '#18213D'} opacity={on ? 1 : 0.7} /><T x={320 + i * 80} y={720} size={26} mono weight={400} color={on ? '#fff' : C.dim}>{i + 1}</T></g>;
      })}
      <T x={960} y={820} size={38} mono weight={400} color={C.dim}>North Korean state hackers · FBI + DOJ · 12 Nov 2026</T>
    </g>
  ),
  webcam: ({ t }) => {
    const on = t > 30;
    return (
      <g>
        <Glow x={960} y={470} r={480} color={on ? C.red : C.cyan} op={0.2} />
        {[360, 270, 190, 120].map((r, i) => <circle key={i} cx={960} cy={470} r={r} fill={i === 3 ? '#05070F' : '#0F1730'} stroke={i === 3 ? (on ? C.red : '#35E1FF') : '#2C3A6A'} strokeWidth={i === 3 ? 10 : 6} />)}
        <circle cx={960} cy={470} r={48} fill={on ? C.red : '#0C1A34'} opacity={on ? 0.6 + 0.4 * Math.abs(Math.sin(t * 0.14)) : 1} />
        <circle cx={935} cy={445} r={14} fill="#fff" opacity={0.5} />
        <circle cx={960} cy={92} r={on ? 10 : 6} fill={on ? C.red : '#2A3358'} />
        <Rec x={1480} y={150} t={t} size={1.1} />
      </g>
    );
  },
  victimA: ({ t, d }) => (
    <g>
      {stage(t, 'STAGE 1', 'Victim A is already compromised')}
      <Laptop x={960} y={220} w={880} t={t} face={1} id="vA" />
      <Chip x={700} y={90 + 70} text="VICTIM A" color={C.red} size={30} op={clamp(t / 10)} />
    </g>
  ),
  scan: ({ t }) => {
    const sy = 260 + ((t * 5) % 380);
    const items = ['WALLET · extension', 'WALLET · desktop', 'SEED PHRASE · ▓▓▓ ▓▓▓ ▓▓▓', 'ACCESS · work VPN'];
    return (
      <g>
        {stage(t, 'STAGE 1', 'Hackers scan the computer')}
        <Laptop x={600} y={210} w={820} t={t} id="sc" screen="#0B1430">
          <g>
            {items.map((s, i) => (
              <g key={i} opacity={clamp((t - 14 - i * 12) / 8)}>
                <rect x={-350} y={60 + i * 96} width={700} height={72} rx={14} fill="#16224A" stroke={sy > 260 + i * 80 ? C.red : '#2C3A6A'} strokeWidth={3} />
                <T x={-320} y={106 + i * 96} size={28} anchor="start" mono weight={400} color={C.wht}>{s}</T>
                <T x={330} y={106 + i * 96} size={28} anchor="end" mono weight={700} color={C.red} op={clamp((t - 30 - i * 12) / 6)}>FOUND</T>
              </g>
            ))}
            <rect x={-390} y={sy - 230} width={780} height={6} fill={C.cyan} opacity={0.8} />
          </g>
        </Laptop>
        <g transform="translate(1440 520)">
          <circle r={190} fill="none" stroke={C.red} strokeWidth={8} opacity={0.5 + 0.4 * Math.sin(t * 0.2)} />
          <T x={0} y={26} size={72} color={C.red}>SCANNED</T>
        </g>
      </g>
    );
  },
  lock: ({ t }) => (
    <g>
      {stage(t, 'STAGE 1', 'Victim A is locked out of their messages')}
      <Chat id="lk" x={300} y={190} w={740} h={640} t={t} who={1} name="Victim A" msgs={[{ who: 'them', text: 'Session ended on this device', at: 6, danger: true }]} locked sub="hijacked" />
      <g transform={`translate(1440 500) scale(${1 + 0.04 * Math.sin(t * 0.2)})`}>
        <path d="M-90 -40 V-110 Q-90 -190 0 -190 Q90 -190 90 -110 V-40" fill="none" stroke={C.red} strokeWidth={30} strokeLinecap="round" />
        <rect x={-150} y={-50} width={300} height={240} rx={30} fill={C.red} />
        <circle cx={0} cy={60} r={30} fill="#1a0610" /><rect x={-9} y={70} width={18} height={70} rx={9} fill="#1a0610" />
      </g>
    </g>
  ),
  rec_wait: ({ t }) => (
    <g>
      {stage(t, 'STAGE 1', 'Recorded while waiting for a call to start')}
      <Win x={380} y={190} w={1160} h={660} id="rw" title="Waiting room">
        <Tile id="rw1" x={60} y={76} w={1040} h={540} face={1} t={t} rec={true} label="Victim A" mic={true} />
      </Win>
      <Rec x={1500} y={150} t={t} size={1} label="REC" /><Chip x={1180} y={236} text="SECRETLY RECORDED" color={C.red} size={24} />
    </g>
  ),
  become: ({ t }) => {
    const p = easeInOut(clamp((t - 12) / 24));
    return (
      <g>
        {stage(t, 'STAGE 2', 'The hackers become Victim A')}
        <g transform="translate(620 560)">
          <Avatar x={0} y={0} s={2.1} skin={FACES[1].skin} hair={FACES[1].hair} shirt={FACES[1].shirt} style={3} t={t} />
        </g>
        <g transform="translate(1300 560)" opacity={p}>
          <Avatar x={0} y={0} s={2.1} skin="#2B2F40" hair="#0A0A12" shirt="#151A2C" style={0} t={t} mask />
        </g>
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
        {stage(t, 'STAGE 2', 'Messages go to every contact, from the real account')}
        {Array.from({ length: n }, (_, i) => {
          const a = (i / n) * Math.PI * 2 - Math.PI / 2;
          const x = 960 + Math.cos(a) * 560, y = 520 + Math.sin(a) * 290;
          const p = clamp((t - 10 - i * 3) / 14);
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
        <rect x={1050} y={470} width={50} height={20} fill="none" />
      </g>
    );
  },
  bubbles: ({ t }) => {
    const L = ["let's catch up", "let's discuss collaboration", "let's talk about investment opportunities"];
    return (
      <g>
        {stage(t, 'STAGE 2', 'The pretext (FBI FLASH)')}
        {L.map((s, i) => {
          const p = backOut(clamp((t - 8 - i * 22) / 12));
          const w = s.length * 28 + 90;
          return (
            <g key={i} opacity={p} transform={`translate(${i % 2 ? 1040 : 320} ${240 + i * 190 + (1 - p) * 30})`}>
              <rect width={w} height={120} rx={60} fill={i % 2 ? '#2F5BFF' : '#1B2748'} stroke={C.cyan} strokeWidth={2} />
              <T x={w / 2} y={76} size={44} weight={600}>{s}</T>
            </g>
          );
        })}
      </g>
    );
  },
  history: ({ t }) => {
    const old = ['“did you see the deck?”', '“call tomorrow, 3pm?”', '“sent the invoice”', "“let's sync on the token launch”", '“thanks for the intro!”'];
    const sc = (t * 5) % 5;
    return (
      <g>
        {stage(t, 'STAGE 2', 'They read the chat history')}
        <Win x={200} y={190} w={780} h={650} id="h1" title="Chat history">
          {old.map((s, i) => <g key={i}><rect x={30} y={80 + i * 100} width={720} height={74} rx={16} fill={Math.abs(((t * 0.15) % 6) - i) < 0.6 ? '#3B2A12' : '#16224A'} stroke={Math.abs(((t * 0.15) % 6) - i) < 0.6 ? C.yel : 'none'} strokeWidth={3} /><T x={56} y={128 + i * 100} size={30} anchor="start" weight={500}>{s}</T></g>)}
        </Win>
        <Arrow x1={1010} y1={520} x2={1150} y2={520} p={clamp((t - 30) / 14)} color={C.yel} />
        <g opacity={clamp((t - 44) / 10)} transform={`translate(1170 380)`}>
          <rect width={600} height={270} rx={34} fill="#1B2748" stroke={C.red} strokeWidth={4} />
          <T x={40} y={70} size={28} anchor="start" mono weight={400} color={C.red}>TAILORED FOR YOU</T>
          <T x={40} y={140} size={38} anchor="start" weight={600}>“Still keen to sync on</T>
          <T x={40} y={196} size={38} anchor="start" weight={600}>that token launch?”</T>
        </g>
      </g>
    );
  },
  calendar: ({ t }) => (
    <g>
      {stage(t, 'STAGE 3', 'A calendar invite, but no meeting link')}
      <Win x={480} y={190} w={960} h={620} id="cal" title="Calendar invite">
        <rect x={40} y={84} width={880} height={110} rx={16} fill="#16224A" />
        <T x={70} y={156} size={46} anchor="start">Catch-up call</T>
        <T x={900} y={156} size={30} anchor="end" mono weight={400} color={C.dim}>Thu · 15:00</T>
        <rect x={40} y={230} width={880} height={110} rx={16} fill="#0A0F1E" stroke={C.red} strokeWidth={3} strokeDasharray="12 10" />
        <T x={70} y={298} size={36} anchor="start" mono weight={400} color={C.dim}>Meeting link:</T>
        <T x={380} y={298} size={36} anchor="start" mono weight={700} color={C.red} op={0.6 + 0.4 * Math.sin(t * 0.3)}>— none yet —</T>
        <Chip x={60} y={440} text="LINK ARRIVES LATER" color={C.yel} size={28} op={clamp((t - 24) / 10)} />
      </Win>
    </g>
  ),
  clock: ({ t }) => {
    const a = (t / 60) * Math.PI * 2 * 3 - Math.PI / 2;
    const env = clamp((t - 40) / 16);
    return (
      <g>
        {stage(t, 'STAGE 3', 'The link only arrives shortly before the call')}
        <g transform="translate(620 520)">
          <circle r={250} fill="#0F1730" stroke={C.cyan} strokeWidth={10} />
          {Array.from({ length: 12 }, (_, i) => <line key={i} x1={Math.cos(i * 0.5236) * 210} y1={Math.sin(i * 0.5236) * 210} x2={Math.cos(i * 0.5236) * 235} y2={Math.sin(i * 0.5236) * 235} stroke={C.dim} strokeWidth={6} />)}
          <line x1={0} y1={0} x2={Math.cos(a) * 190} y2={Math.sin(a) * 190} stroke={C.red} strokeWidth={12} strokeLinecap="round" />
          <circle r={16} fill={C.wht} />
        </g>
        <g transform={`translate(${1500 - env * 300} 480)`} opacity={env}>
          <rect x={-150} y={-100} width={300} height={200} rx={20} fill="#16224A" stroke={C.red} strokeWidth={5} />
          <path d="M-150 -100 L0 20 L150 -100" fill="none" stroke={C.red} strokeWidth={5} />
          <T x={0} y={150} size={34} color={C.red} mono weight={700}>LINK</T>
        </g>
      </g>
    );
  },
  twin: ({ t }) => {
    const rev = clamp((t - 56) / 10);
    return (
      <g>
        {stage(t, 'STAGE 3', 'A copycat meeting room')}
        {[0, 1].map((k) => (
          <g key={k}>
            <Win x={150 + k * 880} y={200} w={760} h={560} id={'tw' + k} title="Meeting" danger={k === 1 && rev > 0.5} url={k === 0 ? 'official meeting' : 'copycat site'}>
              <Tile id={'tw' + k} x={40} y={76} w={680} h={400} face={0} t={t} label="Sam" />
            </Win>
            <T x={530 + k * 880} y={850} size={50} color={k === 1 && rev > 0.5 ? C.red : C.yel} weight={800}>{k === 1 && rev > 0.5 ? 'COPYCAT' : '?'}</T>
          </g>
        ))}
        <T x={960} y={520} size={60} color={C.dim}>≈</T>
      </g>
    );
  },
  lobby2: ({ t }) => (
    <g>
      {stage(t, 'STAGE 4', 'In the lobby')}
      <Win x={380} y={190} w={1160} h={620} id="l2" title="Waiting for the host to admit you…">
        <Tile id="l2a" x={60} y={76} w={1040} h={500} face={0} t={t} empty={t < 40} label="Sam" mic={true} />
        <Chip x={80} y={110} text={t < 40 ? 'WAITING…' : 'ADMITTED'} color={t < 40 ? C.yel : C.grn} size={26} />
      </Win>
    </g>
  ),
  playback: ({ t }) => (
    <g>
      {stage(t, 'STAGE 4', 'The hackers press play')}
      <Tile id="pb" x={420} y={190} w={1080} h={580} face={0} t={t} talk={true} />
      <g transform="translate(960 480)" opacity={1 - clamp((t - 30) / 12)}>
        <circle r={110} fill="#000" opacity={0.6} stroke={C.wht} strokeWidth={6} />
        <path d="M-34 -52 L62 0 L-34 52 Z" fill={C.wht} />
      </g>
      <rect x={420} y={810} width={1080} height={14} rx={7} fill="#1B2748" /><rect x={420} y={810} width={1080 * clamp(t / 90)} height={14} rx={7} fill={C.red} />
      <Chip x={420} y={880} text="▶ VICTIM A'S STORED WEBCAM VIDEO" color={C.red} size={26} />
    </g>
  ),
  tiles: ({ t }) => (
    <g>
      {stage(t, 'STAGE 4', 'Extra videos make the room look full')}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const p = backOut(clamp((t - i * 7) / 12));
        const x = 220 + (i % 3) * 500, y = 220 + Math.floor(i / 3) * 330;
        return <g key={i} opacity={p} transform={`translate(${x + 240} ${y + 150}) scale(${0.6 + 0.4 * p}) translate(-240 -150)`}><Tile id={'tl' + i} x={0} y={0} w={480} h={300} face={i} t={t} label={FACES[i].name} rec={i > 0 ? false : true} dim={false} room={['#26365F', '#4A2D5F', '#2D5F4A', '#5F4A2D', '#2D4A5F', '#5F2D4A'][i]} /></g>;
      })}
    </g>
  ),
  from_friend: ({ t }) => (
    <g>
      {stage(t, 'STAGE 5', 'A message from “your friend”')}
      <Win x={300} y={190} w={1320} h={620} id="ff" title="Meeting chat">
        <Tile id="ff1" x={40} y={76} w={720} h={460} face={0} t={t} label="Sam" talk={false} />
        <rect x={800} y={90} width={480} height={430} rx={20} fill="#0C1226" stroke={C.line} strokeWidth={2} />
        <g opacity={backOut(clamp((t - 14) / 12))}>
          <rect x={820} y={120} width={440} height={170} rx={22} fill="#1B2748" stroke={C.yel} strokeWidth={3} />
          <T x={846} y={176} size={30} anchor="start" weight={700} color={C.yel}>Sam</T>
          <T x={846} y={228} size={32} anchor="start" weight={500}>nobody can hear you!</T>
        </g>
      </Win>
    </g>
  ),
  pressure: ({ t }) => (
    <g>
      {stage(t, 'STAGE 5', 'Fake participants add pressure')}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const x = 200 + (i % 3) * 520, y = 210 + Math.floor(i / 3) * 330;
        const me = i === 4;
        return (
          <g key={i}>
            <Tile id={'pr' + i} x={x} y={y} w={480} h={300} face={i} t={t} label={me ? 'You' : FACES[i].name} mic={me ? false : true} border={me ? C.red : undefined} room={me ? '#5F2D2D' : '#26365F'} />
            {!me && t > 20 + i * 4 ? <T x={x + 240} y={y - 14} size={26} mono weight={400} color={C.dim} op={0.5 + 0.5 * Math.sin(t * 0.2 + i)}>“…can't hear you”</T> : null}
          </g>
        );
      })}
      <T x={960} y={930} size={1} color="#000">.</T>
    </g>
  ),
  steps: ({ t }) => {
    const S = [['1', 'Click an “update” prompt'], ['2', 'Run a script'], ['3', 'Copy and paste code into your terminal']];
    return (
      <g>
        {stage(t, 'STAGE 5', 'Your “friend” guides you through the fix')}
        {S.map(([n, s], i) => {
          const p = backOut(clamp((t - 10 - i * 18) / 12));
          return (
            <g key={i} opacity={p} transform={`translate(${260 + (1 - p) * 120} ${230 + i * 190})`}>
              <rect width={1400} height={150} rx={28} fill="#16224A" stroke={i === 2 ? C.red : C.cyan} strokeWidth={4} />
              <circle cx={90} cy={75} r={44} fill={i === 2 ? C.red : C.cyan} /><T x={90} y={92} size={52} color="#04060C">{n}</T>
              <T x={180} y={96} size={56} anchor="start" weight={700}>{s}</T>
            </g>
          );
        })}
      </g>
    );
  },
  terminal: ({ t }) => {
    const prog = clamp((t - 30) / 50);
    return (
      <g>
        {stage(t, 'THE INFECTION', 'Illustration: command shown blurred on purpose')}
        <Win x={300} y={190} w={1320} h={560} id="tm" title="Terminal" danger={t > 30}>
          <rect width={1320} height={560} fill="#05080F" />
          <T x={40} y={120} size={36} anchor="start" mono weight={400} color={C.grn}>$ ▓▓▓▓ ▓▓▓▓▓▓▓ ▓▓ ▓▓▓▓▓▓▓▓▓▓▓▓ | ▓▓</T>
          <T x={40} y={190} size={32} anchor="start" mono weight={400} color={C.dim} op={clamp((t - 20) / 6)}>fixing audio driver…</T>
          <rect x={40} y={240} width={1240} height={34} rx={17} fill="#16224A" />
          <rect x={40} y={240} width={1240 * prog} height={34} rx={17} fill={C.red} />
          <T x={40} y={350} size={34} anchor="start" mono weight={700} color={C.red} op={clamp((t - 70) / 8)}>▓ backdoor installed</T>
        </Win>
        <Stamp x={1480} y={170} text="DON'T" t={t} at={34} size={90} />
      </g>
    );
  },
  icons4: ({ t }) => {
    const I = [['COOKIE HARVESTER', '🍪'], ['KEYLOGGERS', '⌨'], ['SCREEN CAPTURERS', '🖥'], ['BACKDOOR', '🚪']];
    return (
      <g>
        {stage(t, 'THE INFECTION', 'What the FBI says gets installed')}
        {I.map(([s, ic], i) => {
          const p = backOut(clamp((t - 6 - i * 26) / 14));
          return (
            <g key={i} opacity={p} transform={`translate(${210 + i * 400} ${300 + (1 - p) * 60})`}>
              <rect width={360} height={420} rx={30} fill="#16224A" stroke={C.red} strokeWidth={4} />
              <T x={180} y={200} size={140}>{ic}</T>
              <T x={180} y={330} size={34} weight={800} color={C.red}>{s.split(' ')[0]}</T>
              <T x={180} y={374} size={34} weight={800} color={C.red}>{s.split(' ')[1] ?? ''}</T>
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
        {stage(t, 'THE INFECTION', 'Recording started at the first click')}
        <rect x={300} y={500} width={1320} height={20} rx={10} fill="#1B2748" />
        <rect x={300} y={500} width={1320 * (1 - p)} height={20} rx={10} fill={C.red} />
        <circle cx={x} cy={510} r={24} fill={C.wht} />
        <T x={300} y={460} size={34} anchor="start" mono weight={400} color={C.yel}>1st click · REC starts</T>
        <T x={1620} y={460} size={34} anchor="end" mono weight={400} color={C.dim}>“fix audio” click</T>
        <Rec x={960} y={260} t={t} size={1.6} label="REC" />
        <T x={960} y={700} size={60} ls={2}>THEY WERE ALREADY RECORDING YOU</T>
      </g>
    );
  },
  chain: ({ t, d }) => {
    const big = !!d.p?.big;
    const gens = big ? 4 : 3;
    const nodes: { x: number; y: number; g: number; p: number }[] = [{ x: 240, y: 520, g: 0, p: -1 }];
    const edges: [number, number][] = [];
    let prevIds = [0];
    for (let g = 1; g <= gens; g++) {
      const count = 2 ** g;
      const ids: number[] = [];
      for (let i = 0; i < count; i++) {
        nodes.push({ x: 240 + g * (big ? 350 : 440), y: 230 + ((i + 0.5) / count) * 600, g, p: prevIds[Math.floor(i / 2)] });
        edges.push([prevIds[Math.floor(i / 2)], nodes.length - 1]);
        ids.push(nodes.length - 1);
      }
      prevIds = ids;
    }
    const T0 = big ? 0 : 6;
    return (
      <g>
        {stage(t, 'STAGE 6', big ? 'The pool of targets grows exponentially' : 'The next victim becomes the next lure')}
        {edges.map(([a, b], i) => {
          const na = nodes[a], nb = nodes[b];
          const p = clamp((t - T0 - nb.g * (big ? 16 : 22)) / 14);
          return <line key={i} x1={na.x} y1={na.y} x2={na.x + (nb.x - na.x) * p} y2={na.y + (nb.y - na.y) * p} stroke={C.red} strokeWidth={4} opacity={0.7} />;
        })}
        {nodes.map((n, i) => {
          const p = backOut(clamp((t - T0 - n.g * (big ? 16 : 22) - 10) / 12));
          const f = FACES[i % FACES.length];
          const r = big ? 30 : 42;
          if (i > 0 && p <= 0) return null;
          return (
            <g key={i} transform={`translate(${n.x} ${n.y}) scale(${i === 0 ? 1 : p})`}>
              <circle r={r + 10} fill={C.red} opacity={0.25} />
              <circle r={r} fill={f.shirt} stroke={C.red} strokeWidth={5} /><circle cy={-r * 0.2} r={r * 0.45} fill={f.skin} />
            </g>
          );
        })}
        {big && t > 70 ? <T x={960} y={900} size={1} color="#000">.</T> : null}
      </g>
    );
  },
  months: ({ t }) => {
    const m = Math.min(13, Math.floor(t / 7));
    return (
      <g>
        {stage(t, 'PATIENCE', 'Months, even more than a year later')}
        <g transform="translate(960 520)">
          <rect x={-300} y={-250} width={600} height={500} rx={30} fill="#16224A" stroke={C.cyan} strokeWidth={6} />
          <rect x={-300} y={-250} width={600} height={120} rx={30} fill={C.red} />
          <T x={0} y={-168} size={64} color="#fff">MONTH</T>
          <T x={0} y={90} size={260} color={C.wht}>{Math.max(1, m)}</T>
          {m >= 12 ? <T x={0} y={190} size={54} color={C.yel}>+ more than a year</T> : null}
        </g>
      </g>
    );
  },
  wallet: ({ t }) => {
    const bars = 9;
    return (
      <g>
        {stage(t, 'PATIENCE', 'They copy seed phrases and watch the balance')}
        <g transform="translate(300 250)">
          {Array.from({ length: bars }, (_, i) => {
            const hgt = (60 + i * 38 + (i === bars - 1 ? 90 : 0)) * easeOut(clamp((t - i * 6) / 14));
            return <rect key={i} x={i * 90} y={500 - hgt} width={66} height={hgt} rx={10} fill={i === bars - 1 ? C.grn : '#2C4A8A'} />;
          })}
          <T x={0} y={560} size={30} anchor="start" mono weight={400} color={C.dim}>wallet balance →</T>
        </g>
        <g transform="translate(1430 480)">
          <ellipse rx={150} ry={90} fill="#0A0F1E" stroke={C.red} strokeWidth={8} />
          <circle cx={Math.sin(t * 0.08) * 40} r={52} fill={C.red} /><circle cx={Math.sin(t * 0.08) * 40} r={22} fill="#1a0610" />
          <T x={0} y={190} size={44} color={C.red}>WATCHING</T>
        </g>
      </g>
    );
  },
  servers: ({ t }) => (
    <g>
      {stage(t, 'SEIZED', 'Cloud infrastructure behind the scheme')}
      {[0, 1, 2].map((k) => (
        <g key={k} transform={`translate(${380 + k * 400} 230)`}>
          <rect width={330} height={580} rx={20} fill="#0F1730" stroke={C.line} strokeWidth={4} />
          {Array.from({ length: 6 }, (_, i) => <g key={i}><rect x={24} y={30 + i * 90} width={282} height={68} rx={10} fill="#16224A" /><circle cx={56} cy={64 + i * 90} r={9} fill={t > 30 ? C.red : C.grn} opacity={0.5 + 0.5 * Math.abs(Math.sin(t * 0.2 + i + k))} /></g>)}
        </g>
      ))}
      <Stamp x={960} y={520} text="SEIZED" t={t} at={30} size={200} rot={-10} />
    </g>
  ),
  grid900: ({ t }) => {
    const cols = 30, rows = 15;
    return (
      <g>
        {stage(t, 'SEIZED', 'Blurred examples of the FBI’s 900+ victim videos')}
        {Array.from({ length: cols * rows }, (_, i) => {
          const on = i < clamp(t / 60) * cols * rows;
          return <rect key={i} x={110 + (i % cols) * 58} y={200 + Math.floor(i / cols) * 40} width={50} height={34} rx={5} fill={['#3A6BFF', '#E5486B', '#2FBF8A', '#8E5BFF', '#F28A2E', '#26A9E0'][Math.floor(rnd(5, i) * 6)]} opacity={on ? 0.35 + rnd(6, i) * 0.4 : 0.06} />;
        })}
        <rect x={500} y={330} width={920} height={300} rx={30} fill="#04060C" opacity={0.82} stroke={C.red} strokeWidth={5} />
        <Num t={t} to={900} at={0} dur={60} suffix="+" x={960} y={520} size={230} color={C.red} />
        <T x={960} y={600} size={40} color={C.wht} weight={600}>webcam videos of real victims · FBI</T>
      </g>
    );
  },
  ai: ({ t }) => (
    <g>
      <Glow x={960} y={500} r={460} color={C.purple} op={0.25} />
      <T x={960} y={620} size={420} color={C.purple} stroke="#04060C" op={0.95 - (t % 50 > 46 ? 0.5 : 0)}>A.I.?</T>
      <T x={960} y={800} size={46} color={C.dim} weight={600} mono>…where does the AI come in?</T>
    </g>
  ),
  morph: ({ t }) => {
    const p = easeInOut(clamp((t - 20) / 36));
    return (
      <g>
        {stage(t, 'EMERGING', 'FBI: “super intelligence” used to make deepfakes')}
        <Tile id="mo1" x={190} y={250} w={620} h={420} face={3} t={t} label="public photo" room="#3A4A2D" />
        <Arrow x1={850} y1={460} x2={1070} y2={460} p={clamp((t - 10) / 14)} color={C.purple} />
        <g opacity={p}><Tile id="mo2" x={1110} y={250} w={620} h={420} face={3} t={t} glitch={0.6} label="deepfake" room="#3A2D5F" /></g>
        <Chip x={1110} y={730} text="GOOD ENOUGH TO PASS AS A WEBCAM" color={C.purple} size={26} op={p} />
      </g>
    );
  },
  enough: ({ t }) => (
    <g>
      <Glow x={960} y={470} r={470} color={C.red} op={0.2} />
      <Tile id="en" x={560} y={140} w={800} h={470} face={0} t={t} rec={true} glitch={t > 30 ? 0.3 : 0} />
      <T x={960} y={730} size={110} stroke="#04060C" op={clamp((t - 14) / 10)}>YOUR FACE WAS ENOUGH</T>
    </g>
  ),
  lib: ({ t }) => (
    <g>
      {stage(t, 'SUPPLY CHAIN', 'An open-source JavaScript library maintainer')}
      <g transform="translate(960 530)">
        <path d="M-200 -100 L0 -200 L200 -100 L200 120 L0 220 L-200 120 Z" fill="#16224A" stroke={C.cyan} strokeWidth={8} />
        <path d="M-200 -100 L0 0 L200 -100 M0 0 V220" fill="none" stroke={C.cyan} strokeWidth={6} />
        <T x={0} y={330} size={46} color={C.wht}>OPEN-SOURCE LIBRARY</T>
        <T x={0} y={394} size={36} color={C.dim} weight={500}>tens of millions of downloads per week</T>
      </g>
    </g>
  ),
  follow: ({ t }) => (
    <g>
      {stage(t, 'SUPPLY CHAIN', 'A fake Teams call with several participants')}
      {[0, 1, 2].map((i) => <Tile key={i} id={'fo' + i} x={260 + i * 460} y={230} w={420} h={280} face={i + 1} t={t} label={['Maintainer', '?', '? (someone he knew)'][i]} />)}
      <g opacity={clamp((t - 24) / 10)}>
        <rect x={260} y={560} width={1300} height={130} rx={26} fill="#16224A" stroke={C.red} strokeWidth={4} />
        <T x={310} y={640} size={44} anchor="start" weight={700}>Several participants. A face he recognised.</T>
      </g>
    </g>
  ),
  names: ({ t }) => {
    const N = ['SAPPHIRE SLEET', 'UNC1069', 'DANGEROUS PASSWORD', 'CRYPTOCORE', 'APT38', 'BLUENOROFF', 'STARDUST CHOLLIMA'];
    return (
      <g>
        {stage(t, 'ATTRIBUTION', 'FBI: North Korean state-sponsored hackers, known publicly as')}
        {N.map((s, i) => {
          const p = backOut(clamp((t - 6 - i * 9) / 12));
          const x = 200 + (i % 2) * 760, y = 260 + Math.floor(i / 2) * 150;
          return <g key={i} opacity={p} transform={`translate(${x + (1 - p) * 60} ${y})`}><rect width={720} height={110} rx={55} fill="#2A0F1E" stroke={C.red} strokeWidth={4} /><T x={360} y={72} size={44} color={C.wht} mono weight={700}>{s}</T></g>;
        })}
      </g>
    );
  },
  deps: ({ t }) => {
    const pts = [[960, 240], [620, 400], [1300, 400], [440, 600], [800, 600], [1120, 600], [1480, 600], [620, 780], [960, 780], [1300, 780]];
    const ed = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6], [4, 7], [5, 8], [6, 9]];
    const bad = new Set([0, 2, 5, 8]);
    const infected = (i: number) => bad.has(i) && t > 24 + i * 5;
    return (
      <g>
        {stage(t, 'SUPPLY CHAIN', 'Malicious dependencies would ship with the real library')}
        {ed.map(([a, b], i) => <line key={i} x1={pts[a][0]} y1={pts[a][1]} x2={pts[b][0]} y2={pts[b][1]} stroke={infected(b) ? C.red : '#2C3A6A'} strokeWidth={5} />)}
        {pts.map(([x, y], i) => <g key={i}><circle cx={x} cy={y} r={44} fill={infected(i) ? C.red : '#16224A'} stroke={infected(i) ? '#fff' : C.cyan} strokeWidth={4} /><T x={x} y={y + 14} size={36}>{i === 0 ? '📦' : infected(i) ? '☠' : '📦'}</T></g>)}
      </g>
    );
  },
  tens: ({ t }) => (
    <g>
      {stage(t, 'SUPPLY CHAIN', 'One maintainer could become millions of victims')}
      <T x={960} y={430} size={190} stroke="#04060C" color={C.yel}>TENS OF MILLIONS</T>
      <T x={960} y={540} size={72} color={C.wht}>OF DOWNLOADS EVERY WEEK</T>
      <rect x={300} y={640} width={1320} height={40} rx={20} fill="#1B2748" />
      <rect x={300} y={640} width={1320 * easeOut(clamp(t / 50))} height={40} rx={20} fill={C.red} />
    </g>
  ),
  shield: ({ t }) => (
    <g>
      <Glow x={960} y={500} r={400} color={C.grn} op={0.2} />
      <g transform={`translate(960 500) scale(${1 + 0.03 * Math.sin(t * 0.15)})`}>
        <path d="M0 -260 L230 -170 V30 Q230 190 0 280 Q-230 190 -230 30 V-170 Z" fill="#0F2A24" stroke={C.grn} strokeWidth={14} />
        <path d="M-90 10 L-25 80 L100 -70" fill="none" stroke={C.grn} strokeWidth={30} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={400} strokeDashoffset={400 * (1 - clamp((t - 8) / 22))} />
      </g>
      <T x={960} y={850} size={64}>QUICK DETECTION STOPPED IT</T>
    </g>
  ),
  bigtext: ({ t, d }) => {
    const L: { text: string; color?: string; size?: number }[] = d.p.lines;
    return (
      <g>
        <Glow x={960} y={500} r={500} color={d.p.glow ?? C.red} op={0.16} />
        {L.map((l, i) => {
          const p = backOut(clamp((t - i * 12) / 12));
          return <T key={i} x={960} y={d.p.ys ? d.p.ys[i] : d.p.y0 + i * (d.p.step ?? 150)} size={l.size ?? 130} color={l.color ?? C.wht} stroke="#04060C" op={p} rot={(1 - p) * -3}>{l.text}</T>;
        })}
        {d.p.sub ? <T x={960} y={d.p.subY ?? 840} size={44} color={C.dim} weight={600} op={clamp((t - 30) / 10)}>{d.p.sub}</T> : null}
      </g>
    );
  },
  stat: ({ t, d }) => {
    const p = d.p;
    return (
      <g>
        {stage(t, p.tag, p.sub)}
        <Glow x={960} y={500} r={440} color={p.color ?? C.red} op={0.2} />
        <Num t={t} to={p.to} dur={50} prefix={p.prefix} suffix={p.suffix} decimals={p.dec ?? 0} x={960} y={p.y ?? 560} size={p.size ?? 300} color={p.color ?? C.red} />
        <T x={960} y={(p.y ?? 560) + 120} size={50} color={C.wht} weight={700}>{p.label}</T>
        {p.label2 ? <T x={960} y={(p.y ?? 560) + 190} size={38} color={C.dim} weight={500}>{p.label2}</T> : null}
      </g>
    );
  },
  compare: ({ t }) => (
    <g>
      {stage(t, 'TWO DIFFERENT CASES', 'The DOJ describes the Binance theft as separate')}
      {[
        ['FACESTEALER', ['FBI · social engineering', 'fake video calls', 'more than $400M · 18 months'], C.cyan],
        ['BINANCE', ['DOJ · TraderTraitor', 'exchange hack', 'more than $6B · on or about Oct. 29'], C.yel],
      ].map(([h, rows, c], i) => {
        const p = backOut(clamp((t - i * 14) / 14));
        return (
          <g key={i} opacity={p} transform={`translate(${220 + i * 760} 230)`}>
            <rect width={720} height={470} rx={30} fill="#0F1730" stroke={c as string} strokeWidth={5} />
            <T x={360} y={90} size={64} color={c as string}>{h as string}</T>
            {(rows as string[]).map((r, j) => <T key={j} x={360} y={190 + j * 80} size={38} weight={600} color={j === 2 ? C.wht : C.dim}>{r}</T>)}
          </g>
        );
      })}
      <g opacity={clamp((t - 34) / 10)}><rect x={620} y={740} width={680} height={90} rx={45} fill={C.red} /><T x={960} y={802} size={46} color="#fff">NOT THE SAME CASE</T></g>
    </g>
  ),
  freeze: ({ t }) => (
    <g>
      {stage(t, 'RECOVERY', 'DOJ press release 26-1356')}
      {[[2.7, '$', 'B+', 'FROZEN', C.cyan, 'more than $2.7 billion'], [1.2, '$', 'B+', 'SEIZE / RESTRAIN', C.grn, 'court-authorized, over $1.2 billion']].map(([v, pre, suf, lab, c, sub], i) => (
        <g key={i} transform={`translate(${520 + i * 880} 0)`}>
          <Num t={t} to={v as number} dur={44} at={i * 16} prefix={pre as string} suffix={suf as string} decimals={1} x={0} y={500} size={230} color={c as string} />
          <T x={0} y={600} size={60} color={C.wht}>{lab as string}</T>
          <T x={0} y={664} size={34} color={C.dim} weight={500}>{sub as string}</T>
        </g>
      ))}
    </g>
  ),
  card: ({ t, d }) => {
    const p = d.p;
    const a = backOut(clamp(t / 12));
    return (
      <g>
        <g transform={`translate(${80 + (1 - a) * -120} 190)`} opacity={a}>
          <rect width={800} height={640} rx={36} fill="#0F2A24" stroke={C.grn} strokeWidth={6} />
          <circle cx={100} cy={110} r={64} fill={C.grn} /><T x={100} y={136} size={80} color="#04060C">{p.n}</T>
          <T x={190} y={130} size={36} anchor="start" mono weight={700} color={C.grn} ls={3}>{p.tag}</T>
          {(p.lines as string[]).map((s, i) => <T key={i} x={50} y={270 + i * 82} size={58} anchor="start" weight={800}>{s}</T>)}
        </g>
        <DocShot id={d.id + 'd'} src="facestealer/ic3-p5.png" iw={1445} ih={1870} t={t} view={[[0, p.y, 1.12], [90, p.y + 30, 1.2]]} hl={(p.hls as any[]).map((h) => ({ x: 118, y: h.y, w: 1200, h: h.h, at: h.at ?? 14 }))} url="ic3.gov/CSA/2026/261112.pdf · FBI FLASH" x={940} y={190} w={900} h={640} />
      </g>
    );
  },
  intro_card: ({ t, d }) => (
    <g>
      <Glow x={960} y={470} r={480} color={d.p.color ?? C.grn} op={0.2} />
      <T x={960} y={420} size={d.p.size ?? 150} stroke="#04060C" color={d.p.color ?? C.wht}>{d.p.l1}</T>
      <T x={960} y={420 + (d.p.size ?? 150) * 0.95} size={d.p.size ?? 150} stroke="#04060C">{d.p.l2}</T>
      {d.p.sub ? <T x={960} y={800} size={44} color={C.dim} weight={600}>{d.p.sub}</T> : null}
    </g>
  ),
  ask: ({ t }) => (
    <g>
      <Tile id="ak" x={520} y={120} w={880} h={520} face={0} t={t} border={C.yel} />
      <g transform={`translate(1360 160) scale(${1 + 0.1 * Math.sin(t * 0.2)})`}><circle r={70} fill={C.yel} /><T x={0} y={34} size={100} color="#04060C">?</T></g>
      <T x={960} y={780} size={84} stroke="#04060C">IS THIS PERSON REALLY HERE?</T>
    </g>
  ),
  cta: ({ t }) => (
    <g>
      <Glow x={960} y={500} r={460} color={C.red} op={0.18} />
      <g transform={`translate(960 420) scale(${1 + 0.05 * Math.sin(t * 0.2)})`}>
        <rect x={-300} y={-80} width={600} height={160} rx={40} fill={C.red} />
        <T x={0} y={34} size={90} color="#fff">SUBSCRIBE</T>
      </g>
      <T x={960} y={640} size={50} weight={700}>and send this to someone in crypto or open source</T>
    </g>
  ),
  end: ({ t, len }) => {
    const p = clamp((t - 10) / 40);
    return (
      <g>
        <Tile id="ed" x={560} y={160} w={800} h={470} face={0} t={t} glitch={p * 0.9} rec={true} />
        <T x={960} y={740} size={70} op={clamp((t - 6) / 12)} stroke="#04060C">THE NEXT CALL MIGHT NOT BE A FRIEND</T>
        <rect width={W} height={H} fill="#000" opacity={clamp((t - (len - 40)) / 38)} />
      </g>
    );
  },
};

const MAIN = (d: Def): React.FC<ShotProps> => {
  const Scene = K[d.kind];
  const Comp: React.FC<ShotProps> = ({ t, len, f }) => {
    const z = kf(t, [[0, 1], [len, 1.035]]);
    return (
      <g>
        <defs>
          <filter id="blur40" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="46" /></filter>
        </defs>
        <BG t={t + (f ?? 0) * 0} id={d.id} tint={d.p?.tint} />
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
