import React from 'react';
import { staticFile } from 'remotion';
import { kf, clamp, easeOut, easeInOut, backOut, rnd, FONT } from '../../engine';

export const C = {
  bg: '#060912', panel: '#0E1424', panel2: '#141C33', line: '#243056', red: '#FF2D4D', cyan: '#35E1FF',
  yel: '#FFE14A', grn: '#3DFF9A', wht: '#F3F6FF', dim: '#8B97B8', purple: '#9B6BFF',
};
export const W = 1920;
export const H = 1080;

/** Dark cyber backdrop: gradient, faint grid, drifting motes. */
export const BG: React.FC<{ t: number; id: string; tint?: string; grid?: boolean }> = ({ t, id, tint = '#0E1A3D', grid = true }) => (
  <g>
    <defs>
      <radialGradient id={`bgr-${id}`} cx="50%" cy="38%" r="75%">
        <stop offset="0" stopColor={tint} />
        <stop offset="1" stopColor={C.bg} />
      </radialGradient>
    </defs>
    <rect width={W} height={H} fill={`url(#bgr-${id})`} />
    {grid ? (
      <g opacity={0.09} stroke={C.cyan} strokeWidth={1}>
        {Array.from({ length: 25 }, (_, i) => <line key={'v' + i} x1={i * 80} y1={0} x2={i * 80} y2={H} />)}
        {Array.from({ length: 14 }, (_, i) => <line key={'h' + i} x1={0} y1={i * 80 + ((t * 0.4) % 80)} x2={W} y2={i * 80 + ((t * 0.4) % 80)} />)}
      </g>
    ) : null}
    {Array.from({ length: 26 }, (_, i) => (
      <circle key={i} cx={(rnd(3, i) * W + t * (0.2 + rnd(4, i) * 0.5)) % W} cy={(rnd(5, i) * H - t * (0.15 + rnd(6, i) * 0.3) + H * 2) % H} r={1 + rnd(7, i) * 2} fill={C.cyan} opacity={0.12 + rnd(8, i) * 0.2} />
    ))}
  </g>
);

export const T: React.FC<{ x: number; y: number; size?: number; color?: string; weight?: number; anchor?: 'start' | 'middle' | 'end'; mono?: boolean; op?: number; children: React.ReactNode; ls?: number; rot?: number; stroke?: string }> = ({ x, y, size = 60, color = C.wht, weight = 800, anchor = 'middle', mono, op = 1, children, ls = 0, rot = 0, stroke }) => (
  <text x={x} y={y} fontSize={size} fill={color} fontWeight={weight} textAnchor={anchor} fontFamily={mono ? FONT.ui : FONT.title} opacity={op} letterSpacing={ls} transform={rot ? `rotate(${rot} ${x} ${y})` : undefined} stroke={stroke} strokeWidth={stroke ? size * 0.12 : 0} paintOrder="stroke fill" strokeLinejoin="round">
    {children}
  </text>
);

export const Chip: React.FC<{ x: number; y: number; text: string; color?: string; op?: number; size?: number; fill?: string }> = ({ x, y, text, color = C.cyan, op = 1, size = 26, fill }) => {
  const w = text.length * size * 0.62 + 40;
  return (
    <g opacity={op}>
      <rect x={x} y={y - size - 8} width={w} height={size + 24} rx={(size + 24) / 2} fill={fill ?? color + '22'} stroke={color} strokeWidth={2} />
      <T x={x + w / 2} y={y + 4} size={size} color={color} mono weight={400} ls={2}>{text}</T>
    </g>
  );
};

/** Simple original stick-figure face: no real person is depicted anywhere in this film. */
export const Avatar: React.FC<{ x: number; y: number; s?: number; skin?: string; hair?: string; shirt?: string; style?: number; t?: number; talk?: boolean; mask?: boolean; worry?: number }> = ({ x, y, s = 1, skin = '#F2C6A0', hair = '#2E2018', shirt = '#3A6BFF', style = 0, t = 0, talk = false, mask = false, worry = 0 }) => {
  const blink = (t + style * 23) % 96 > 92 ? 0.12 : 1;
  const mouth = talk ? 3 + Math.abs(Math.sin(t * 0.55)) * 9 : 2 + worry * 3;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-120 170 Q-120 70 0 66 Q120 70 120 170 Z" fill={shirt} />
      <rect x={-16} y={44} width={32} height={30} fill={skin} />
      {style === 1 ? <path d="M-66 -10 Q-76 -86 0 -84 Q76 -86 66 -10 Q60 -52 0 -54 Q-60 -52 -66 -10 Z" fill={hair} /> : null}
      <circle cx={0} cy={0} r={62} fill={skin} />
      {style === 0 ? <path d="M-64 -12 Q-70 -76 0 -70 Q70 -76 64 -12 Q40 -46 0 -44 Q-40 -46 -64 -12 Z" fill={hair} /> : null}
      {style === 2 ? <path d="M-62 -20 Q-60 -66 0 -64 Q60 -66 62 -20 Q50 -34 0 -32 Q-50 -34 -62 -20 Z" fill={hair} /> : null}
      {style === 3 ? <g><path d="M-66 10 Q-80 -80 0 -78 Q80 -80 66 10 Q60 -40 0 -44 Q-60 -40 -66 10 Z" fill={hair} /><path d="M-66 10 L-70 70 L-50 60 Z M66 10 L70 70 L50 60 Z" fill={hair} /></g> : null}
      <ellipse cx={-22} cy={2} rx={7} ry={8 * blink} fill="#1B1426" />
      <ellipse cx={22} cy={2} rx={7} ry={8 * blink} fill="#1B1426" />
      <path d={`M-16 ${26} Q0 ${26 + mouth} 16 ${26}`} stroke="#1B1426" strokeWidth={4} fill={talk ? '#3a1020' : 'none'} strokeLinecap="round" />
      {mask ? <g><rect x={-70} y={-30} width={140} height={64} rx={30} fill="#0A0A14" stroke={C.red} strokeWidth={3} /><path d="M-40 4 L-10 4 M10 4 L40 4" stroke={C.red} strokeWidth={4} /></g> : null}
    </g>
  );
};

export const FACES = [
  { name: 'Sam', skin: '#F2C6A0', hair: '#2E2018', shirt: '#3A6BFF', style: 0 },
  { name: 'Priya', skin: '#B97A56', hair: '#15101C', shirt: '#E5486B', style: 3 },
  { name: 'Marcus', skin: '#7A4B32', hair: '#0E0A0A', shirt: '#2FBF8A', style: 2 },
  { name: 'Lena', skin: '#F6D7BE', hair: '#C9892B', shirt: '#8E5BFF', style: 1 },
  { name: 'Jo', skin: '#D9A07A', hair: '#3B2A20', shirt: '#F28A2E', style: 0 },
  { name: 'Wei', skin: '#EBC59B', hair: '#101018', shirt: '#26A9E0', style: 1 },
];

export const Tile: React.FC<{ x: number; y: number; w?: number; h?: number; face?: number; t: number; rec?: boolean; label?: string; glitch?: number; talk?: boolean; dim?: boolean; id: string; border?: string; mask?: boolean; room?: string; empty?: boolean; mic?: boolean }> = ({ x, y, w = 520, h = 330, face = 0, t, rec, label, glitch = 0, talk, dim, id, border, mask, room = '#26365F', empty, mic }) => {
  const f = FACES[face % FACES.length];
  const sc = h / 330;
  const jx = glitch > 0 ? (rnd(9, Math.floor(t / 2)) - 0.5) * 26 * glitch : 0;
  return (
    <g transform={`translate(${x} ${y})`}>
      <defs>
        <clipPath id={`tc-${id}`}><rect width={w} height={h} rx={18} /></clipPath>
        <linearGradient id={`tg-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={room} /><stop offset="1" stopColor="#0B1226" />
        </linearGradient>
      </defs>
      <g clipPath={`url(#tc-${id})`}>
        <rect width={w} height={h} fill={`url(#tg-${id})`} />
        <rect x={w * 0.64} y={h * 0.12} width={w * 0.26} height={h * 0.34} rx={8} fill="#FFFFFF" opacity={0.08} />
        {empty ? (
          <T x={w / 2} y={h / 2 + 14} size={44} color={C.dim} mono weight={400}>joining...</T>
        ) : (
          <g transform={`translate(${jx} 0)`}>
            <Avatar x={w / 2} y={h * 0.5} s={sc * 1.18} skin={f.skin} hair={f.hair} shirt={f.shirt} style={f.style} t={t} talk={talk} mask={mask} />
            {glitch > 0 ? (
              <g opacity={0.5 * glitch}>
                <Avatar x={w / 2 + 14} y={h * 0.5} s={sc * 1.18} skin="#35E1FF" hair="#35E1FF" shirt="#35E1FF" style={f.style} t={t} />
              </g>
            ) : null}
          </g>
        )}
        {dim ? <rect width={w} height={h} fill="#000" opacity={0.45} /> : null}
        {glitch > 0 ? Array.from({ length: 5 }, (_, i) => <rect key={i} x={0} y={rnd(11, i + Math.floor(t / 3)) * h} width={w} height={4 + rnd(12, i) * 8} fill={C.cyan} opacity={0.35 * glitch} />) : null}
        <rect width={w} height={h} fill="url(#scan)" opacity={0.0} />
      </g>
      <rect width={w} height={h} rx={18} fill="none" stroke={border ?? C.line} strokeWidth={border ? 5 : 2} />
      {label ? (
        <g>
          <rect x={14} y={h - 52} width={label.length * 17 + 34} height={38} rx={19} fill="#000" opacity={0.6} />
          <T x={31} y={h - 24} size={24} anchor="start" weight={600}>{label}</T>
        </g>
      ) : null}
      {mic !== undefined ? (
        <g transform={`translate(${w - 46} ${h - 34})`}>
          <circle r={20} fill={mic ? '#000' : C.red} opacity={0.75} />
          <rect x={-5} y={-11} width={10} height={16} rx={5} fill={C.wht} />
          {!mic ? <line x1={-13} y1={13} x2={13} y2={-13} stroke={C.wht} strokeWidth={4} /> : null}
        </g>
      ) : null}
      {rec ? (
        <g transform={`translate(${w - 108} 30)`}>
          <rect x={-14} y={-18} width={100} height={36} rx={18} fill="#000" opacity={0.65} />
          <circle cx={6} cy={0} r={9} fill={C.red} opacity={0.55 + 0.45 * Math.abs(Math.sin(t * 0.12))} />
          <T x={26} y={8} size={22} anchor="start" color={C.red} mono weight={700}>REC</T>
        </g>
      ) : null}
    </g>
  );
};

/** A framed window. Children draw in window coordinates (0,0 = top-left of the content area). */
export const Win: React.FC<{ x: number; y: number; w: number; h: number; title?: string; url?: string; id: string; children: React.ReactNode; op?: number; scale?: number; rot?: number; bar?: boolean; danger?: boolean }> = ({ x, y, w, h, title, url, id, children, op = 1, scale = 1, rot = 0, bar = true, danger }) => {
  const bh = bar ? 56 : 0;
  return (
    <g transform={`translate(${x + w / 2} ${y + h / 2}) rotate(${rot}) scale(${scale}) translate(${-w / 2} ${-h / 2})`} opacity={op}>
      <defs><clipPath id={`wc-${id}`}><rect x={0} y={bh} width={w} height={h - bh} rx={0} /></clipPath></defs>
      <rect x={-6} y={-6} width={w + 12} height={h + 12} rx={22} fill={danger ? C.red : C.cyan} opacity={0.18} />
      <rect width={w} height={h} rx={16} fill="#0A0F1E" stroke={danger ? C.red : C.line} strokeWidth={3} />
      {bar ? (
        <g>
          <rect width={w} height={bh} rx={16} fill="#18213D" />
          <rect y={bh - 16} width={w} height={16} fill="#18213D" />
          {['#FF5F57', '#FEBC2E', '#28C840'].map((c, i) => <circle key={i} cx={28 + i * 26} cy={bh / 2} r={8} fill={c} />)}
          {url !== undefined ? (
            <g>
              <rect x={128} y={10} width={w - 256} height={bh - 20} rx={(bh - 20) / 2} fill="#0A1026" stroke={danger ? C.red : C.line} strokeWidth={2} />
              <T x={158} y={bh / 2 + 8} size={22} anchor="start" mono weight={400} color={danger ? C.red : C.dim}>{url}</T>
            </g>
          ) : title ? <T x={w / 2} y={bh / 2 + 9} size={24} color={C.dim} weight={600}>{title}</T> : null}
        </g>
      ) : null}
      <g clipPath={`url(#wc-${id})`}>{children}</g>
    </g>
  );
};

export type HL = { x: number; y: number; w: number; h: number; at: number; color?: string };
export type View = [number, number, number]; // [frame, centre y in image px, zoom]

/**
 * A real screenshot in a browser frame: it pans and zooms over the page (view keyframes) while highlights draw on
 * the exact sentences being spoken. The page images are captures of the FBI FLASH PDF and the DOJ press release.
 */
export const DocShot: React.FC<{ src: string; iw: number; ih: number; t: number; view: View[]; hl?: HL[]; url: string; id: string; x?: number; y?: number; w?: number; h?: number; cx?: number; src2?: string; tag?: string; op?: number; cursor?: boolean }> = ({ src, iw, ih, t, view, hl = [], url, id, x = 150, y = 60, w = 1620, h = 800, cx, tag, op = 1, cursor }) => {
  const bh = 56;
  const vw = w, vh = h - bh;
  const z = kf(t, view.map((v) => [v[0], v[2]] as [number, number]));
  const cy = kf(t, view.map((v) => [v[0], v[1]] as [number, number]));
  const sc = (vw / iw) * z;
  const imgCx = cx ?? iw / 2;
  const tx = vw / 2 - imgCx * sc;
  const ty = vh / 2 - cy * sc;
  const last = hl.length ? hl.filter((hh) => t >= hh.at).slice(-1)[0] : undefined;
  return (
    <g opacity={op}>
      <Win x={x} y={y} w={w} h={h} url={url} id={id}>
        <g transform={`translate(0 ${bh})`}>
          <rect width={vw} height={vh} fill="#fff" />
          <g transform={`translate(${tx} ${ty}) scale(${sc})`}>
            <image href={staticFile(src)} x={0} y={0} width={iw} height={ih} />
            {hl.map((hh, i) => {
              const p = easeOut(clamp((t - hh.at) / 12));
              if (p <= 0) return null;
              const pad = 8;
              return (
                <g key={i}>
                  <rect x={hh.x - pad} y={hh.y - pad / 2} width={(hh.w + pad * 2) * p} height={hh.h + pad} fill={hh.color ?? '#FFE14A'} opacity={0.42} />
                  <rect x={hh.x - pad} y={hh.y - pad / 2} width={(hh.w + pad * 2) * p} height={hh.h + pad} fill="none" stroke={hh.color ?? '#FF2D4D'} strokeWidth={4 / Math.max(0.5, sc * 1.5)} />
                </g>
              );
            })}
          </g>
          {cursor && last ? (
            <g transform={`translate(${tx + (last.x + last.w * 0.9) * sc} ${ty + (last.y + last.h) * sc})`} opacity={0.95}>
              <path d="M0 0 L0 34 L9 26 L16 42 L24 38 L17 23 L30 23 Z" fill="#111" stroke="#fff" strokeWidth={2.5} />
            </g>
          ) : null}
        </g>
      </Win>
      {tag ? <Chip x={x} y={y - 14} text={tag} color={C.yel} size={22} /> : null}
    </g>
  );
};

/** Mouse pointer. */
export const Cursor: React.FC<{ x: number; y: number; s?: number; click?: number }> = ({ x, y, s = 1.4, click = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {click > 0 ? <circle r={10 + click * 40} fill="none" stroke={C.cyan} strokeWidth={4} opacity={1 - click} /> : null}
    <path d="M0 0 L0 34 L9 26 L16 42 L24 38 L17 23 L30 23 Z" fill="#fff" stroke="#111" strokeWidth={2.5} />
  </g>
);

export type Msg = { who: 'them' | 'me'; text: string; at: number; link?: boolean; danger?: boolean };

/** A generic messenger window (no brand look) with a contact in the header and messages that arrive on cue. */
export const Chat: React.FC<{ x: number; y: number; w?: number; h?: number; t: number; msgs: Msg[]; who?: number; name?: string; id: string; sub?: string; locked?: boolean; ghost?: boolean }> = ({ x, y, w = 760, h = 760, t, msgs, who = 0, name, id, sub = 'online', locked, ghost }) => {
  const f = FACES[who % FACES.length];
  let cy = 112;
  const bubbles = msgs.map((m, i) => {
    const age = t - m.at;
    const p = backOut(clamp(age / 10));
    const typing = age > -22 && age < 0 && m.who === 'them';
    const size = 30;
    const tw = Math.min(w - 170, Math.max(120, m.text.length * size * 0.55 + 50));
    const lines = Math.max(1, Math.ceil((m.text.length * size * 0.55) / (tw - 40)));
    const bh = lines * 40 + 34 + (m.link ? 62 : 0);
    const y0 = cy;
    if (age > -22) cy += bh + 18;
    return { m, i, p, typing, tw, bh, y0, lines, vis: age >= 0 };
  });
  return (
    <Win x={x} y={y} w={w} h={h} title={name ?? f.name} id={id} bar={false}>
      <rect width={w} height={h} fill="#0C1226" />
      <rect width={w} height={92} fill="#162043" />
      <circle cx={52} cy={46} r={28} fill={f.shirt} />
      <circle cx={52} cy={40} r={11} fill={f.skin} />
      <path d="M32 62 Q52 36 72 62 Z" fill={f.skin} opacity={0.9} />
      <T x={96} y={44} size={30} anchor="start" weight={700}>{name ?? f.name}</T>
      <T x={96} y={76} size={22} anchor="start" color={C.grn} weight={400} mono>{sub}</T>
      {locked ? <Chip x={w - 280} y={58} text="LOCKED OUT" color={C.red} size={20} /> : null}
      {bubbles.map(({ m, i, p, typing, tw, bh, y0, vis }) => {
        const mine = m.who === 'me';
        const bx = mine ? w - tw - 30 : 30;
        if (typing) {
          return (
            <g key={i}>
              <rect x={30} y={y0} width={110} height={56} rx={28} fill="#1B2748" />
              {[0, 1, 2].map((d) => <circle key={d} cx={58 + d * 26} cy={y0 + 28 + Math.sin(t * 0.3 + d) * 5} r={7} fill={C.dim} />)}
            </g>
          );
        }
        if (!vis) return null;
        return (
          <g key={i} opacity={p} transform={`translate(0 ${(1 - p) * 20})`}>
            <rect x={bx} y={y0} width={tw} height={bh} rx={26} fill={m.danger ? '#5A1226' : mine ? '#2F5BFF' : '#1B2748'} stroke={m.danger ? C.red : 'none'} strokeWidth={3} />
            <T x={bx + 24} y={y0 + 46} size={30} anchor="start" weight={500} color={C.wht}>{m.text}</T>
            {m.link ? (
              <g>
                <rect x={bx + 20} y={y0 + bh - 66} width={tw - 40} height={48} rx={12} fill="#0A0F1E" stroke={C.cyan} strokeWidth={2} />
                <T x={bx + 38} y={y0 + bh - 33} size={22} anchor="start" mono weight={400} color={C.cyan}>meet-link ▸ join call</T>
              </g>
            ) : null}
          </g>
        );
      })}
      {ghost ? <rect width={w} height={h} fill="#000" opacity={0.35} /> : null}
    </Win>
  );
};

export const Rec: React.FC<{ x: number; y: number; t: number; size?: number; label?: string }> = ({ x, y, t, size = 1, label = 'REC' }) => (
  <g transform={`translate(${x} ${y}) scale(${size})`}>
    <rect x={-22} y={-30} width={170} height={60} rx={30} fill="#000" opacity={0.7} stroke={C.red} strokeWidth={3} />
    <circle cx={14} cy={0} r={14} fill={C.red} opacity={0.5 + 0.5 * Math.abs(Math.sin(t * 0.11))} />
    <T x={44} y={13} size={38} anchor="start" color={C.red} mono weight={700}>{label}</T>
  </g>
);

/** Counter that rolls up. */
export const Num: React.FC<{ t: number; to: number; at?: number; dur?: number; prefix?: string; suffix?: string; x: number; y: number; size?: number; color?: string; decimals?: number; comma?: boolean }> = ({ t, to, at = 0, dur = 40, prefix = '', suffix = '', x, y, size = 200, color = C.wht, decimals = 0, comma = true }) => {
  const v = to * easeOut(clamp((t - at) / dur));
  const s = decimals ? v.toFixed(decimals) : Math.round(v).toString();
  const out = comma ? s.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : s;
  return <T x={x} y={y} size={size} color={color} stroke="#04060C">{prefix + out + suffix}</T>;
};

export const Scan: React.FC<{ t: number; op?: number }> = ({ t, op = 0.07 }) => (
  <g opacity={op} pointerEvents="none">
    {Array.from({ length: 108 }, (_, i) => <rect key={i} x={0} y={i * 10} width={W} height={3} fill="#000" />)}
    <rect x={0} y={((t * 9) % (H + 200)) - 100} width={W} height={100} fill={C.cyan} opacity={0.12} />
  </g>
);

export const Corner: React.FC<{ x: number; y: number; w: number; h: number; color?: string; p?: number }> = ({ x, y, w, h, color = C.red, p = 1 }) => {
  const L = 46 * p;
  return (
    <g stroke={color} strokeWidth={6} fill="none" strokeLinecap="round">
      <path d={`M${x} ${y + L} V${y} H${x + L}`} /><path d={`M${x + w - L} ${y} H${x + w} V${y + L}`} />
      <path d={`M${x} ${y + h - L} V${y + h} H${x + L}`} /><path d={`M${x + w - L} ${y + h} H${x + w} V${y + h - L}`} />
    </g>
  );
};

export { kf, clamp, easeOut, easeInOut, backOut, rnd };
