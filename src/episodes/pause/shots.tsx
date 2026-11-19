import React from 'react';
import {
  Hero, Pose, basePose, poseAt, faceAt, kf, clamp, easeOut, backOut, rnd, camT, LOOKS, LEG_LEN, HEAD, reachAngle, walkPose, joints, toWorld,
  Kitchen, KitchenIsland, KITCHEN, stand, Tabletop, Stairwell, hipGround, Rooftop, Classroom, SchoolDesk, Kid,
  Schematic, SCH, SchLabel, Paper, Foreground, Sparkle, TitleCard, Glow, FocusRings, ShotProps, FONT,
} from '../../engine';

// "What if you could pause everyone but you?" Fifteen shots on four sets (classroom, stairwell, kitchen, rooftop) and
// the schematic. The power: the world stops (its set gets a fixed clock, so dust, sways and flicker freeze) while Pip
// keeps moving. Each shot is a pure function of its own clock t.

const PIP = LOOKS.pipHood;
const MO = LOOKS.mo;
const TEACHER = LOOKS.mom;
const SUIT = LOOKS.suit;
const CYAN = '#7FD4FF';
const DARK = '#07040C';

// ---------- the sleeve and mitten of an arm drawn by hand, for inserts ----------
const Mitten: React.FC<{ x: number; y: number; rot?: number; s?: number; look?: typeof PIP; sleeveFrom: [number, number]; sleeveW?: number; rim?: string }> = ({
  x, y, rot = 0, s = 4.6, look = PIP, sleeveFrom, sleeveW = 110, rim = 'rimR',
}) => {
  const d = `M ${sleeveFrom[0]} ${sleeveFrom[1]} Q ${(sleeveFrom[0] + x) / 2} ${(sleeveFrom[1] + y) / 2 - 60} ${x} ${y}`;
  return (
    <g filter={`url(#${rim})`}>
      <path d={d} stroke={look.line} strokeWidth={sleeveW + 16} fill="none" strokeLinecap="round" />
      <path d={d} stroke={look.limb} strokeWidth={sleeveW} fill="none" strokeLinecap="round" />
      <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
        <rect x={-4} y={10} width={8} height={24} rx={4} fill={look.hand} stroke={look.line} strokeWidth={2.4} />
        <path d="M -11 -2 Q -14 14 -6 18 L 7 18 Q 14 14 11 -2 Z" fill={look.hand} stroke={look.line} strokeWidth={2.6} strokeLinejoin="round" />
        <ellipse cx={-10} cy={6} rx={4.5} ry={7} fill={look.hand} stroke={look.line} strokeWidth={2.4} />
      </g>
    </g>
  );
};

// ======================= CLASSROOM =======================
const CLS_FROZEN = 248; // the clock the classroom stops at
const TEACH_X = 740;
const teacherPose = (t: number): Pose => {
  const tt = Math.min(t, 16); // she moves until the pause lands, then stops dead
  const swing = Math.sin(tt / 1.6) * 5;
  return {
    ...basePose, x: TEACH_X, y: 612 - LEG_LEN * 0.9, scale: 0.9, yaw: 0.45, look: 0.5,
    armR: { a: 128 + swing, b: 24 }, armL: { a: 16, b: -6 }, headTilt: 3 + swing * 0.2, handR: 'open',
    expr: 'happy',
  };
};
// chalk dust that hangs in the air once the world has stopped
const ChalkDust: React.FC<{ x: number; y: number; o?: number; n?: number }> = ({ x, y, o = 0.85, n = 26 }) => (
  <g opacity={o}>
    {Array.from({ length: n }).map((_, i) => {
      const a = rnd(5, i) * Math.PI * 2;
      const d = 14 + rnd(6, i) * 110;
      return <circle key={i} cx={x + Math.cos(a) * d * 1.15} cy={y + Math.sin(a) * d * 0.7 + 18} r={1.6 + rnd(7, i) * 4} fill="#F4EEE0" opacity={0.35 + rnd(8, i) * 0.55} />;
    })}
  </g>
);
const pipDeskPose = (t: number): Pose =>
  poseAt(t, [
    { f: 0, p: { x: 1260, y: 760, yaw: -0.35, look: -0.5, armL: { a: 10, b: -8 }, armR: { a: 12, b: -6 } } },
    { f: 6, p: { armL: { a: 12, b: -8 } } },
    { f: 15, p: { armL: { a: 110, b: -12 }, handL: 'open', look: -0.8 }, ease: easeOut },
    { f: 22, p: { armL: { a: 100, b: -10 } } },
  ]);

// ---------- S1: wide, the classroom: Pip's palm goes up, the teacher stops mid-word ----------
export const S1: React.FC<ShotProps> = ({ t, len }) => {
  const pip = pipDeskPose(t);
  return (
    <g transform={camT(kf(t, [[0, 980], [len, 1000]]), 500, kf(t, [[0, 0.98], [len, 1.04]]))}>
      <Classroom t={CLS_FROZEN - 16 + Math.min(t, 16)} id="c1" />
      <Hero look={TEACHER} pose={teacherPose(t)} rimId="rimR" shadow={0} />
      <Hero look={PIP} pose={{ ...pip, ...faceAt(t, [[0, 'neutral'], [8, 'smug']]) }} rimId="rimL" shadow={0} />
      <SchoolDesk x={1260} />
      <Foreground blur={10}>
        <Kid x={470} y={1070} s={2.3} look={{ hair: 'short', hairC: '#120E18', top: '#1E1A28' }} t={Math.min(t, 16)} />
      </Foreground>
    </g>
  );
};

// ---------- S2: medium, push in: the teacher, frozen mid-word, chalk dust hanging ----------
export const S2: React.FC<ShotProps> = ({ t, len }) => {
  const tp = teacherPose(99);
  const chalk = toWorld(tp, joints(tp).armR.end);
  return (
    <g transform={camT(kf(t, [[0, 800], [len, 770]]), kf(t, [[0, 500], [len, 480]]), kf(t, [[0, 1.8], [len, 2.15]]))}>
      <Classroom t={CLS_FROZEN} id="c2" />
      <Hero look={TEACHER} pose={tp} rimId="rimR" shadow={0} />
      <ChalkDust x={chalk.x} y={chalk.y} />
      <Sparkle x={chalk.x + 20} y={chalk.y - 20} t={t - 4} s={0.6} />
      <Foreground blur={10}>
        <path d="M 1060 1000 Q 1000 760 1100 700 Q 1180 650 1260 720 Q 1330 770 1360 1000 Z" fill="#0E0C14" />
        <circle cx={1160} cy={640} r={96} fill="#14111C" />
        <path d="M 1070 600 Q 1090 520 1160 520 Q 1230 520 1250 600" stroke="#FFB46A" strokeWidth={5} fill="none" opacity={0.35} />
      </Foreground>
    </g>
  );
};

// ---------- S3: macro insert, top-down on the desk: the quiz fills itself in ----------
export const S3: React.FC<ShotProps> = ({ t, len }) => {
  const fill = clamp((t - 2) / 18);
  const hx = 780 + 380 * (0.5 + 0.5 * Math.sin(t * 1.4));
  const hy = 330 + fill * 520;
  const hand = { x: hx, y: Math.min(hy, 820) };
  return (
    <g transform={`translate(960 540) scale(${1 + t * 0.003}) translate(-960 -540)`}>
      <Tabletop edge={1400} wood="#8A6452" grain="#7A5747" lip="#6A4A3E" />
      <Glow x={960} y={420} r={760} o={0.3} />
      <rect x={1480} y={170} width={300} height={16} rx={8} fill="#E9C46A" transform="rotate(24 1630 178)" />
      <rect x={120} y={640} width={150} height={150} fill="#9BD3A8" transform="rotate(8 195 715)" />
      <Paper x={960} y={540} w={560} rot={-2} done fill={fill} grade={fill >= 1 ? 'A+' : ''} />
      <Mitten x={hand.x} y={hand.y} rot={20} s={4.4} sleeveFrom={[hand.x + 520, -300]} sleeveW={120} />
      {t > 20 ? <Sparkle x={1200} y={300} t={t - 20} s={1.6} /> : null}
    </g>
  );
};

// ======================= STAIRWELL =======================
const SW_FROZEN = 222;
const SUIT_X = 20;
const PIP_X = 340;
const landingHip = (scale: number) => 420 - LEG_LEN * scale;
const suitPose = (t: number): Pose => {
  const tt = Math.min(t, 19);
  const lunge = kf(tt, [[0, 0], [19, 1]], easeOut);
  const base: Pose = { ...basePose, x: SUIT_X - 30 + lunge * 50, y: landingHip(0.95), scale: 0.95, yaw: 0.7, look: 0.8, tilt: 10 * lunge, expr: 'shock', armL: { a: 20, b: 10 } };
  const aim = reachAngle(base, { x: PIP_X - 6, y: landingHip(0.95) - 60 });
  return { ...base, armR: { a: lunge * aim, b: 0 }, handR: 'open' };
};
const pipDodge = (t: number): Pose => {
  const tt = Math.min(t, 19);
  const flinch = kf(tt, [[0, 0], [19, 1]], easeOut);
  return { ...basePose, x: PIP_X + flinch * 16, y: landingHip(0.9), scale: 0.9, yaw: -0.7, look: -1, tilt: -9 * flinch, armL: { a: 30 + 30 * flinch, b: 40 }, armR: { a: 20, b: 30 } };
};

// ---------- S4: wide, the landing: a man in a suit throws a punch; the world stops ----------
export const S4: React.FC<ShotProps> = ({ t, len }) => (
  <g transform={camT(kf(t, [[0, 215], [len, 210]]), 270, kf(t, [[0, 1.5], [len, 1.56]]))}>
    <Stairwell t={SW_FROZEN - 19 + Math.min(t, 19)} id="sw4" />
    <Hero look={SUIT} pose={{ ...suitPose(t), ...faceAt(t, [[0, 'shock']]) }} rimId="rimL" shadow={0.5} />
    <Hero look={PIP} pose={{ ...pipDodge(t), ...faceAt(t, [[0, 'oops'], [22, 'neutral']]) }} rimId="rimR" shadow={0.5} />
  </g>
);

// ---------- S5: extreme close-up: the frozen fist, an inch from his face ----------
export const S5: React.FC<ShotProps> = ({ t, len }) => {
  const sc = 4.4;
  const lean = kf(t, [[0, 0], [14, 0], [30, 60]]);
  const head = { x: 1330 + lean, y: 600 };
  const pose: Pose = {
    ...basePose, x: head.x, y: head.y - HEAD.y * sc, scale: sc, yaw: -0.85, look: -1,
    headTilt: kf(t, [[0, 0], [30, 6]]), armL: { a: 14, b: -6 }, armR: { a: 14, b: -6 },
    ...faceAt(t, [[0, 'oops'], [12, 'neutral'], [38, 'smug']]),
  };
  return (
    <g transform={camT(kf(t, [[0, 940], [len, 970]]), 560, kf(t, [[0, 1.0], [len, 1.1]]))}>
      <g filter="url(#blur16)">
        <g transform="translate(-300 -420) scale(2.3)">
          <Stairwell t={SW_FROZEN} id="sw5" />
        </g>
      </g>
      <rect x={-200} y={-200} width={2320} height={1480} fill={DARK} opacity={0.3} />
      <Hero look={PIP} pose={pose} rimId="rimR" shadow={0} />
      {/* the suit's arm from the left edge, the fist an inch from the nose */}
      <g filter="url(#rimL)">
        <path d="M -200 640 L 520 560" stroke="#0B0A12" strokeWidth={330} strokeLinecap="round" />
        <path d="M -200 640 L 520 560" stroke="#2B2A33" strokeWidth={300} strokeLinecap="round" />
        <rect x={470} y={410} width={70} height={300} fill="#F1ECE4" transform="rotate(-6 505 560)" />
        <g transform="translate(560 540) rotate(-6)">
          <rect x={-10} y={-120} width={290} height={250} rx={64} fill={SUIT.hand} stroke={SUIT.line} strokeWidth={12} />
          {[-62, -8, 46, 100].map((y, i) => (
            <path key={i} d={`M 80 ${y} L 280 ${y}`} stroke={SUIT.line} strokeWidth={9} strokeLinecap="round" opacity={0.7} />
          ))}
          <ellipse cx={90} cy={-128} rx={96} ry={40} fill={SUIT.hand} stroke={SUIT.line} strokeWidth={10} />
        </g>
      </g>
      <FocusRings x={820} y={520} t={t - 24} />
      <ChalkDust x={1010} y={420} o={0.0} n={0} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <circle key={i} cx={760 + rnd(3, i) * 260} cy={300 + rnd(4, i) * 360} r={2 + rnd(5, i) * 3} fill="#FFE9C7" opacity={0.5} />
      ))}
    </g>
  );
};

// ---------- S6: wide, camera follows: he strolls away down the stairs, the suit frozen mid-lunge ----------
export const S6: React.FC<ShotProps> = ({ t, len }) => {
  const x = kf(t, [[0, PIP_X], [len, 560]], (v) => v);
  const walk = walkPose(x, t * 0.6, hipGround, 0.9, { armL: { a: 150, b: 130 }, armR: { a: 150, b: 130 }, look: 0.4 });
  return (
    <g transform={camT(kf(t, [[0, 300], [len, 520]]), kf(t, [[0, 290], [len, 380]]), kf(t, [[0, 1.35], [len, 1.3]]))}>
      <Stairwell t={SW_FROZEN} id="sw6" />
      <Hero look={SUIT} pose={suitPose(99)} rimId="rimL" shadow={0.5} />
      <Hero look={PIP} pose={{ ...walk, ...faceAt(t, [[0, 'smug']]) }} rimId="rimR" shadow={0.4} />
    </g>
  );
};

// ======================= KITCHEN =======================
const K_FROZEN = 66;
const MO_STAND = stand(KITCHEN, 0.42, 0.4);
const PIP_STAND = stand(KITCHEN, 0.66, 0.4);
const moLaugh = (t: number): Pose => {
  const tt = Math.min(t, 19);
  const bob = Math.abs(Math.sin(tt / 1.3)) * 6;
  return {
    ...basePose, x: MO_STAND.x, y: MO_STAND.y - bob, scale: MO_STAND.scale, yaw: 0.3, look: 0.4, tilt: -9, headTilt: -14,
    armL: { a: 40, b: 70 }, armR: { a: 36, b: 80 }, expr: 'happy',
  };
};

// ---------- S7: medium, the kitchen: Mo is laughing; the world stops mid-laugh ----------
export const S7: React.FC<ShotProps> = ({ t, len }) => {
  const pipP = poseAt(t, [
    { f: 0, p: { ...basePose, x: PIP_STAND.x, y: PIP_STAND.y, scale: PIP_STAND.scale, yaw: -0.5, look: -0.8, armL: { a: 12, b: -8 }, armR: { a: 14, b: -6 } } },
    { f: 14, p: { armR: { a: 110, b: -8 }, handR: 'open' }, ease: easeOut },
  ]);
  const tear = { x: MO_STAND.x + 40, y: MO_STAND.y - 190 };
  return (
    <g transform={camT(kf(t, [[0, 960], [len, 940]]), 560, kf(t, [[0, 1.85], [len, 1.95]]))}>
      <Kitchen t={K_FROZEN - 19 + Math.min(t, 19)} id="k7" />
      <Hero look={MO} pose={moLaugh(t)} rimId="rimR" shadow={0} />
      <Hero look={PIP} pose={{ ...pipP, ...faceAt(t, [[0, 'neutral'], [20, 'smug']]) }} rimId="rimL" shadow={0} />
      <KitchenIsland />
      <g opacity={t > 19 ? 1 : 0}>
        <path d={`M ${tear.x} ${tear.y} q 5 12 0 20 q -6 -8 0 -20 Z`} fill="#BFE6FF" />
        <path d={`M ${tear.x + 44} ${tear.y - 20} q 5 12 0 20 q -6 -8 0 -20 Z`} fill="#BFE6FF" />
      </g>
    </g>
  );
};

// ---------- S8: medium, low angle: Pip waves a hand in front of Mo's open eyes; he doesn't blink ----------
export const S8: React.FC<ShotProps> = ({ t, len }) => {
  const mo = { ...moLaugh(99), x: 760, y: 820, scale: 1.55 };
  const wave = Math.sin(t / 3.2);
  const hx = 1000 + wave * 70;
  const hy = 560 + Math.cos(t / 3.2) * 16;
  const sc = kf(t, [[0, 1.0], [len, 1.06]]);
  return (
    <g transform={`translate(960 540) scale(${sc}) translate(-960 -540)`}>
      <g filter="url(#blur16)">
        <g transform="translate(-700 -330) scale(2.3)">
          <Kitchen t={K_FROZEN} id="k8" />
        </g>
      </g>
      <rect x={-100} y={-100} width={2120} height={1280} fill={DARK} opacity={0.22} />
      <Hero look={MO} pose={{ ...mo, tilt: -6, headTilt: -8, expr: 'shock', blink: 0, look: 0.3 }} rimId="rimR" shadow={0} />
      <path d="M 960 150 q 8 18 0 30 q -9 -12 0 -30 Z" fill="#BFE6FF" transform="scale(1.6) translate(-370 0)" />
      <Mitten x={hx} y={hy} rot={wave * 14} s={4.2} sleeveFrom={[1560, 1000]} sleeveW={130} rim="rimL" />
    </g>
  );
};

// ---------- S9: close-up: Pip, uneasy; Mo soft behind him, staring ----------
export const S9: React.FC<ShotProps> = ({ t, len }) => {
  const sc = 3.7 * (1 + 0.04 * clamp(t / len));
  const head = { x: 1230, y: 580 };
  const pose: Pose = { ...basePose, x: head.x, y: head.y - HEAD.y * sc, scale: sc, yaw: -0.3, look: -0.7, headTilt: kf(t, [[0, 0], [12, -6]]), armL: { a: 14, b: -6 }, armR: { a: 14, b: -6 }, ...faceAt(t, [[0, 'oops'], [18, 'worried']]) };
  return (
    <g>
      <g filter="url(#blur16)">
        <g transform="translate(-300 -330) scale(2.0)">
          <Kitchen t={K_FROZEN} id="k9" />
          <Hero look={MO} pose={{ ...moLaugh(99), x: 560, yaw: 0.6, headTilt: -14, blink: 0, expr: 'shock' }} rimId="rimR" shadow={0} />
        </g>
      </g>
      <rect x={0} y={0} width={1920} height={1080} fill={DARK} opacity={0.25} />
      <Hero look={PIP} pose={pose} rimId="rimL" shadow={0} />
    </g>
  );
};

// ======================= ROOFTOP =======================
const ROOF_FEET = 840;

// ---------- S10: the title, wide on the roof at dusk, Pip alone ----------
export const S10: React.FC<ShotProps> = ({ t, len }) => {
  const pose = poseAt(t, [
    { f: 0, p: { x: 960, y: ROOF_FEET - LEG_LEN * 0.62, scale: 0.62, yaw: 0, armL: { a: 20, b: 6 }, armR: { a: 20, b: 6 } } },
    { f: 20, p: {} },
    { f: 28, p: { armL: { a: 110, b: -6 }, armR: { a: 110, b: -6 } }, ease: easeOut },
  ]);
  return (
    <g transform={camT(960, kf(t, [[0, 520], [len, 545]]), kf(t, [[0, 1.0], [len, 1.07]]))}>
      <Rooftop t={120} sunX={960} sunY={690 - 40 * easeOut(clamp(t / 40))} />
      <Hero look={PIP} pose={{ ...pose, ...faceAt(t, [[0, 'happy'], [34, 'smug']]) }} rimId="rimR" shadow={0.6} />
      <TitleCard t={t} lines={['WHAT IF YOU COULD', 'PAUSE EVERYONE BUT YOU?']} accent="EVERYONE" accentT={28} size={84} y={170} />
    </g>
  );
};

// ---------- S11: medium, low angle: he looks round; nothing moves, no one is there ----------
export const S11: React.FC<ShotProps> = ({ t, len }) => {
  const pose = poseAt(t, [
    { f: 0, p: { x: 900, y: 790, scale: 1.8, yaw: 0.5, look: 0.8, armL: { a: 16, b: 6 }, armR: { a: 16, b: 6 } } },
    { f: 12, p: { yaw: 0.5 } },
    { f: 24, p: { yaw: -0.5, look: -0.8, headTilt: -5 }, ease: easeOut },
  ]);
  return (
    <g transform={camT(960, 540, kf(t, [[0, 1.0], [len, 1.05]]))}>
      <Rooftop t={120} sunX={1250} sunY={560} low={260} />
      <Hero look={PIP} pose={{ ...pose, ...faceAt(t, [[0, 'neutral'], [14, 'worried']]) }} rimId="rimR" shadow={0} />
    </g>
  );
};

// ======================= SCHEMATIC =======================
const Person: React.FC<{ x: number; y: number; s: number; color: string; o?: number }> = ({ x, y, s, color, o = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <circle cx={0} cy={-52} r={24} fill="none" stroke={color} strokeWidth={7} />
    <path d="M -38 40 Q -38 -14 0 -14 Q 38 -14 38 40 Z" fill="none" stroke={color} strokeWidth={7} strokeLinejoin="round" />
  </g>
);

// ---------- S12: schematic: a crowd of people fades away until one orange figure is alone ----------
export const S12: React.FC<ShotProps> = ({ t, len }) => {
  const N = 11;
  return (
    <g transform={`translate(960 540) scale(${kf(t, [[0, 1], [len, 1.04]])}) translate(-960 -540)`}>
      <Schematic t={t + 40} id="sch12" />
      {Array.from({ length: N }).map((_, i) => {
        const a = (i / N) * Math.PI * 2 - Math.PI / 2;
        const go = clamp((t - 6 - i * 1.6) / 14);
        const r = 330 + go * 150;
        return <Person key={i} x={960 + Math.cos(a) * r * 1.45} y={500 + Math.sin(a) * r * 0.62} s={0.95} color={SCH.line} o={1 - go * 0.9} />;
      })}
      <Person x={960} y={510} s={1.8} color={SCH.live} />
      <circle cx={960} cy={510} r={150 + Math.sin(t / 4) * 4} fill="none" stroke={SCH.live} strokeWidth={3} strokeDasharray="10 14" opacity={0.6} />
      <SchLabel x={960} y={1010} t={t - 22} text="ISOLATED" size={64} color={SCH.live} />
    </g>
  );
};

// ---------- S13: schematic: the risk bar climbs to +29% ----------
export const S13: React.FC<ShotProps> = ({ t, len }) => {
  const p = easeOut(clamp((t - 14) / 34));
  const base = 340;
  const top = 540 - base;
  return (
    <g transform={`translate(960 540) scale(${kf(t, [[0, 1], [len, 1.04]])}) translate(-960 -540)`}>
      <Schematic t={t + 70} id="sch13" />
      <SchLabel x={960} y={170} t={t - 2} text="RISK OF EARLY DEATH" size={58} />
      {/* the two bars: connected, and isolated */}
      <rect x={470} y={850 - base} width={220} height={base} fill={SCH.dim} opacity={0.55} />
      <SchLabel x={580} y={910} t={t - 8} text="CONNECTED" size={34} color={SCH.dim} />
      <rect x={1070} y={850 - base * (1 + 0.29 * p)} width={220} height={base * (1 + 0.29 * p)} fill={SCH.live} style={{ filter: `drop-shadow(0 0 14px ${SCH.glow})` }} />
      <rect x={1070} y={850 - base} width={220} height={4} fill={SCH.line} />
      <SchLabel x={1180} y={910} t={t - 8} text="ISOLATED" size={34} color={SCH.live} />
      <path d={`M 470 ${850 - base} L 1290 ${850 - base}`} stroke={SCH.dim} strokeWidth={2} strokeDasharray="12 10" />
      <text x={1560} y={560} textAnchor="middle" fontFamily={FONT.ui} fontSize={150} fill={SCH.live} style={{ filter: `drop-shadow(0 0 16px ${SCH.glow})` }}>
        {`+${Math.round(29 * p)}%`}
      </text>
      <SchLabel x={1560} y={640} t={t - 20} text="LINKED TO" size={34} color={SCH.dim} />
      <SchLabel x={960} y={1010} t={t - 40} text="70 STUDIES · 3.4 MILLION PEOPLE" size={32} color={SCH.dim} />
    </g>
  );
};

// ---------- S14: extreme close-up: "That's real." Pip, worried, the light starting to turn ----------
export const S14: React.FC<ShotProps> = ({ t, len }) => {
  const sc = 6.6 * (1 + 0.04 * clamp(t / len));
  const head = { x: 960, y: 720 };
  const red = 0.35 * clamp(t / len);
  const pose: Pose = { ...basePose, x: head.x, y: head.y - HEAD.y * sc, scale: sc, yaw: 0.12, look: 0.1, armL: { a: 14, b: -6 }, armR: { a: 14, b: -6 }, ...faceAt(t, [[0, 'worried']]) };
  return (
    <g>
      <g filter="url(#blur16)">
        <g transform="translate(-600 -560) scale(2)">
          <Rooftop t={140} sunX={980} sunY={600} red={red} low={180} />
        </g>
      </g>
      <rect x={0} y={0} width={1920} height={1080} fill={DARK} opacity={0.22} />
      <Hero look={PIP} pose={pose} rimId={t > len * 0.6 ? 'rimRed' : 'rimR'} shadow={0} />
    </g>
  );
};

// ---------- S15: wide, low angle: the city goes dark in a sweep toward him; he is the only one left ----------
export const S15: React.FC<ShotProps> = ({ t, len }) => {
  const red = easeOut(clamp((t - 54) / 14));
  const pose = poseAt(t, [
    { f: 0, p: { x: 960, y: 905 - LEG_LEN * 1.1, scale: 1.1, yaw: -0.15, look: -0.6, armL: { a: 40, b: 70 }, armR: { a: 40, b: 70 } } },
    { f: 30, p: { look: 0.4, headTilt: 4 } },
    { f: 60, p: { look: -0.2, headTilt: 0 } },
  ]);
  return (
    <g transform={camT(kf(t, [[0, 960], [len, 950]]), kf(t, [[0, 520], [len, 500]]), kf(t, [[0, 1.0], [len, 1.18]]))}>
      <Rooftop t={150} sunX={1180} sunY={600} red={red} blackout={clamp((t - 58) / 24)} lightsOut={clamp((t - 66) / 14)} low={40} cityLit={2.6} />
      <Hero look={PIP} pose={{ ...pose, ...faceAt(t, [[0, 'neutral'], [14, 'worried'], [54, 'shock']]) }} rimId="rimRed" shadow={0} />
    </g>
  );
};
