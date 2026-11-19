import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, Sequence, Video, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';
import {fonts} from './fonts';

const FPS = 30;
export const TOTAL_FRAMES = 14842;

const C = {bg: '#05070B', panel: '#0D121A', raised: '#151D29', text: '#F2F5F7', muted: '#8C9AAA', cyan: '#5DE4FF', red: '#FF3D5A', amber: '#FFB84A', green: '#55E6A5'};
const scenes = [
  {label: 'THE CALL', start: 0, end: 1740},
  {label: 'THE EVIDENCE', start: 1740, end: 3720},
  {label: 'THE VICTIM LOOP', start: 3720, end: 6480},
  {label: 'WHY IT WORKS', start: 6480, end: 8760},
  {label: 'THE SCALE', start: 8760, end: 10890},
  {label: 'THE NEWS LURE', start: 10890, end: 12510},
  {label: 'BREAK THE LOOP', start: 12510, end: TOTAL_FRAMES},
];
const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);

const Fade: React.FC<{children: React.ReactNode; frame: number; duration: number}> = ({children, frame, duration}) => {
  const opacity = interpolate(frame, [0, 18, duration - 18, duration], [0, 1, 1, 0], clamp);
  return <AbsoluteFill style={{opacity}}>{children}</AbsoluteFill>;
};

const GridBackground: React.FC<{danger?: boolean}> = ({danger = false}) => {
  const frame = useCurrentFrame();
  const glowX = interpolate(frame % 600, [0, 300, 600], [-10, 35, -10]);
  return <AbsoluteFill style={{background: C.bg, overflow: 'hidden'}}>
    <div style={{position: 'absolute', inset: 0, opacity: 0.22, backgroundImage: 'linear-gradient(rgba(93,228,255,.12) 1px,transparent 1px),linear-gradient(90deg,rgba(93,228,255,.12) 1px,transparent 1px)', backgroundSize: '64px 64px'}} />
    <div style={{position: 'absolute', width: 900, height: 900, left: `${glowX}%`, top: -300, borderRadius: 999, background: danger ? 'radial-gradient(circle,rgba(255,61,90,.18),transparent 66%)' : 'radial-gradient(circle,rgba(93,228,255,.15),transparent 66%)'}} />
    <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(5,7,11,.1),rgba(5,7,11,.8))'}} />
  </AbsoluteFill>;
};

const Chrome: React.FC<{children: React.ReactNode; url: string; source: string; accent?: string; style?: React.CSSProperties}> = ({children, url, source, accent = C.cyan, style}) => <div style={{position: 'relative', overflow: 'hidden', borderRadius: 24, background: '#090D13', border: '1px solid rgba(255,255,255,.14)', boxShadow: '0 36px 100px rgba(0,0,0,.55)', ...style}}>
  <div style={{height: 62, display: 'flex', alignItems: 'center', gap: 13, padding: '0 22px', background: '#131A24', borderBottom: '1px solid rgba(255,255,255,.1)'}}>
    <i style={{width: 13, height: 13, borderRadius: 99, background: C.red}}/><i style={{width: 13, height: 13, borderRadius: 99, background: C.amber}}/><i style={{width: 13, height: 13, borderRadius: 99, background: C.green}}/>
    <div style={{marginLeft: 18, flex: 1, height: 34, borderRadius: 10, padding: '0 16px', display: 'flex', alignItems: 'center', background: '#090D13', color: C.muted, fontSize: 18, overflow: 'hidden', whiteSpace: 'nowrap'}}>{url}</div>
    <div style={{fontWeight: 700, color: accent, fontSize: 17}}>{source}</div>
  </div>
  <div style={{position: 'absolute', inset: '62px 0 0'}}>{children}</div>
</div>;

const SourceBug: React.FC<{text: string}> = ({text}) => <div style={{position: 'absolute', left: 96, bottom: 62, display: 'flex', alignItems: 'center', gap: 12, color: C.muted, fontSize: 18, letterSpacing: 1.2}}><span style={{width: 10, height: 10, borderRadius: 99, background: C.cyan, boxShadow: `0 0 22px ${C.cyan}`}}/>SOURCE: {text}</div>;

const Progress: React.FC = () => {
  const frame = useCurrentFrame();
  const scene = scenes.find((s) => frame >= s.start && frame < s.end) ?? scenes.at(-1)!;
  const width = interpolate(frame, [0, TOTAL_FRAMES], [0, 100], clamp);
  return <><div style={{position: 'absolute', top: 54, left: 96, right: 96, display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: C.muted, fontSize: 17, letterSpacing: 2.4, zIndex: 80}}><span>CASE FILE / FACESTEALER</span><span style={{color: C.text}}>{scene.label}</span></div><div style={{position: 'absolute', left: 0, bottom: 0, height: 7, width: `${width}%`, background: `linear-gradient(90deg,${C.cyan},${C.red})`, zIndex: 90}}/></>;
};

const Caption: React.FC<{text: string; start: number; end: number; accent?: string}> = ({text, start, end, accent}) => {
  const frame = useCurrentFrame();
  if (frame < start || frame >= end) return null;
  const local = frame - start;
  const opacity = interpolate(local, [0, 8, end - start - 10, end - start], [0, 1, 1, 0], clamp);
  const y = interpolate(local, [0, 10], [28, 0], {...clamp, easing: easeOut});
  return <div style={{position: 'absolute', left: 280, right: 280, bottom: 78, display: 'flex', justifyContent: 'center', zIndex: 70, transform: `translateY(${y}px)`, opacity}}><div style={{maxWidth: 1320, padding: '16px 28px', borderRadius: 14, background: 'rgba(5,7,11,.88)', border: '1px solid rgba(255,255,255,.12)', color: accent ?? C.text, fontSize: 34, lineHeight: 1.22, textAlign: 'center', fontWeight: 700, boxShadow: '0 14px 45px rgba(0,0,0,.4)'}}>{text}</div></div>;
};

const FaceTile: React.FC<{name: string; tint: string; frozen?: boolean; delay?: number}> = ({name, tint, frozen = false, delay = 0}) => {
  const frame = useCurrentFrame();
  const flicker = frozen && frame % 74 < 5 ? 0.48 : 1;
  const lift = spring({frame: Math.max(0, frame - delay), fps: FPS, config: {damping: 18, stiffness: 90}});
  return <div style={{position: 'relative', height: 310, borderRadius: 24, overflow: 'hidden', background: `linear-gradient(145deg,${tint}44,#0A0E15 66%)`, border: `1px solid ${frozen ? C.red : 'rgba(255,255,255,.14)'}`, opacity: lift * flicker, transform: `scale(${0.92 + lift * 0.08})`}}>
    <div style={{position: 'absolute', width: 120, height: 120, left: '50%', top: 52, marginLeft: -60, borderRadius: 999, background: `linear-gradient(160deg,${tint},#243142)`}}/><div style={{position: 'absolute', width: 210, height: 120, left: '50%', bottom: 0, marginLeft: -105, borderRadius: '110px 110px 0 0', background: `linear-gradient(160deg,${tint}CC,#17202C)`}}/>
    <div style={{position: 'absolute', left: 18, bottom: 18, padding: '8px 13px', borderRadius: 9, background: 'rgba(0,0,0,.58)', color: C.text, fontSize: 19, fontWeight: 700}}>{name}</div>
    {frozen ? <div style={{position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg,transparent 0 22px,rgba(255,61,90,.14) 23px 25px)', mixBlendMode: 'screen'}}/> : null}
  </div>;
};

const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const alarm = frame > 420;
  const titleIn = interpolate(frame, [780, 830], [80, 0], {...clamp, easing: easeOut});
  const titleOpacity = interpolate(frame, [770, 820], [0, 1], clamp);
  const cursorX = interpolate(frame, [240, 460], [1480, 1040], {...clamp, easing: easeOut});
  const cursorY = interpolate(frame, [240, 460], [820, 700], {...clamp, easing: easeOut});
  return <Fade frame={frame} duration={1740}><GridBackground danger={alarm}/>
    <div style={{position: 'absolute', left: 170, right: 170, top: 130, bottom: 150}}><div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20}}><FaceTile name="MAYA — PRODUCT" tint="#5DE4FF" delay={8}/><FaceTile name="ALEX — ENGINEERING" tint="#A58BFF" frozen={alarm} delay={18}/><FaceTile name="YOU" tint="#55E6A5" delay={28}/><div style={{height: 310, borderRadius: 24, background: '#0A0E15', border: '1px solid rgba(255,255,255,.1)', display: 'grid', placeItems: 'center', color: C.muted, fontSize: 26}}>Waiting for participant…</div></div></div>
    {frame >= 315 && frame < 760 ? <div style={{position: 'absolute', left: 500, right: 500, top: 410, padding: 32, borderRadius: 24, background: '#121925', border: `2px solid ${C.red}`, boxShadow: '0 30px 120px rgba(0,0,0,.7)', textAlign: 'center'}}><div style={{color: C.red, fontSize: 20, fontWeight: 900, letterSpacing: 2}}>AUDIO DEVICE ERROR</div><div style={{fontSize: 34, fontWeight: 700, marginTop: 15}}>Microphone component missing</div><div style={{marginTop: 25, display: 'inline-block', padding: '16px 28px', borderRadius: 12, background: C.red, fontSize: 24, fontWeight: 900}}>INSTALL QUICK FIX</div></div> : null}
    {frame >= 240 && frame < 760 ? <div style={{position: 'absolute', left: cursorX, top: cursorY, width: 28, height: 38, background: C.text, clipPath: 'polygon(0 0,0 100%,30% 72%,52% 100%,67% 91%,45% 64%,100% 60%)', filter: 'drop-shadow(0 4px 8px #000)'}}/> : null}
    {frame >= 760 ? <div style={{position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', background: 'rgba(5,7,11,.87)'}}><div style={{textAlign: 'center', opacity: titleOpacity, transform: `translateY(${titleIn}px)`}}><div style={{fontSize: 28, letterSpacing: 7, color: C.red, fontWeight: 900}}>THE FACE WAS REAL. THE CALL WASN'T.</div><div style={{fontFamily: fonts.display, fontSize: 112, lineHeight: 0.96, maxWidth: 1500, marginTop: 30}}>THE FAKE VIDEO CALL<br/><span style={{color: C.cyan}}>THAT STOLE $400 MILLION</span></div></div></div> : null}
    <Caption text="The repair button is a trap. Your face may be the next piece of bait." start={330} end={710}/><Caption text="Investigators seized more than 900 webcam recordings." start={1160} end={1580} accent={C.cyan}/>
  </Fade>;
};

const EvidenceScene: React.FC = () => {
  const frame = useCurrentFrame();
  const first = frame < 1000;
  const zoom = interpolate(frame, [0, 900], [1.02, 1.16], {...clamp, easing: Easing.inOut(Easing.sin)});
  return <Fade frame={frame} duration={1980}><GridBackground/>
    <div style={{position: 'absolute', inset: '125px 110px 120px'}}><Chrome url={first ? 'ic3.gov/CSA/2026/261112.pdf' : 'justice.gov/opa/pr/…massive-theft-of-cryptocurrency'} source={first ? 'FBI / IC3' : 'U.S. DOJ'} style={{width: '100%', height: '100%'}}>{first ? <Video src={staticFile('video/fbi-flash-scroll.mp4')} muted style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${zoom})`}}/> : <Video src={staticFile('video/doj-scroll.mp4')} muted style={{width: '100%', height: '100%', objectFit: 'cover'}}/>}</Chrome></div>
    <div style={{position: 'absolute', right: 105, top: 170, width: 500, padding: '24px 28px', borderRadius: 18, background: 'rgba(5,7,11,.92)', border: `1px solid ${first ? C.cyan : C.amber}`, boxShadow: '0 20px 70px rgba(0,0,0,.5)'}}><div style={{fontSize: 17, letterSpacing: 2.5, color: first ? C.cyan : C.amber, fontWeight: 900}}>{first ? 'PRIMARY ADVISORY' : 'ENFORCEMENT ACTION'}</div><div style={{fontFamily: fonts.display, fontSize: 48, lineHeight: 1.02, marginTop: 12}}>{first ? '900+ WEBCAM VIDEOS' : '$400M IN 18 MONTHS'}</div></div>
    <SourceBug text={first ? 'FBI FLASH 261112 — 11 NOV 2026' : 'U.S. DOJ — 12 NOV 2026'}/><Caption text="The invitation can arrive through a real account the next victim already trusts." start={700} end={1180}/><Caption text="The Justice Department says the campaign stole more than $400 million in 18 months." start={1290} end={1840} accent={C.cyan}/>
  </Fade>;
};

const loopNodes = [
  {x: 230, y: 510, name: '1  RECORD', color: C.red},
  {x: 520, y: 265, name: '2  HIJACK', color: C.amber},
  {x: 930, y: 210, name: '3  MESSAGE', color: C.cyan},
  {x: 1335, y: 300, name: '4  FAKE CALL', color: '#A58BFF'},
  {x: 1570, y: 585, name: '5  “FIX”', color: C.red},
  {x: 1180, y: 765, name: '6  REPEAT', color: C.green},
  {x: 660, y: 780, name: 'NEXT VICTIM', color: C.text},
];

const LoopScene: React.FC = () => {
  const frame = useCurrentFrame();
  const active = Math.min(loopNodes.length - 1, Math.floor(frame / 360));
  return <Fade frame={frame} duration={2760}><GridBackground danger/>
    <svg width="1920" height="1080" style={{position: 'absolute', inset: 0}}><defs><filter id="glow"><feGaussianBlur stdDeviation="8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>{loopNodes.map((n, i) => {const next = loopNodes[(i + 1) % loopNodes.length]; const p = interpolate(frame, [i * 300, i * 300 + 220], [0, 1], clamp); return <line key={`l${n.name}`} x1={n.x} y1={n.y} x2={n.x + (next.x - n.x) * p} y2={n.y + (next.y - n.y) * p} stroke={i <= active ? n.color : '#273241'} strokeWidth={i === active ? 7 : 3} opacity={0.85} filter={i === active ? 'url(#glow)' : undefined}/>;})}</svg>
    <div style={{position: 'absolute', left: 120, right: 120, top: 140, bottom: 120}}>{loopNodes.map((n, i) => {const s = spring({frame: Math.max(0, frame - i * 300), fps: FPS, config: {damping: 16, stiffness: 85}}); const isActive = i === active; return <div key={n.name} style={{position: 'absolute', left: n.x - 120, top: n.y - 140, width: 240, height: 156, borderRadius: 22, display: 'grid', placeItems: 'center', textAlign: 'center', background: isActive ? `${n.color}24` : C.panel, border: `2px solid ${isActive ? n.color : '#263241'}`, color: isActive ? n.color : C.text, boxShadow: isActive ? `0 0 60px ${n.color}33` : '0 18px 55px rgba(0,0,0,.4)', opacity: s, transform: `scale(${0.78 + s * 0.22})`}}><div style={{fontFamily: fonts.display, fontSize: 29, lineHeight: 1.1}}>{n.name}</div></div>;})}
      <div style={{position: 'absolute', left: 720, top: 360, width: 480, height: 250, borderRadius: 999, display: 'grid', placeItems: 'center', textAlign: 'center', background: 'radial-gradient(circle,rgba(255,61,90,.22),rgba(13,18,26,.94) 66%)', border: `1px solid ${C.red}`, boxShadow: '0 0 100px rgba(255,61,90,.2)'}}><div><div style={{color: C.red, fontSize: 20, letterSpacing: 4, fontWeight: 900}}>STOLEN ASSET</div><div style={{fontFamily: fonts.display, fontSize: 61, marginTop: 6}}>CREDIBILITY</div></div></div>
    </div>
    <Caption text="Each successful compromise creates the access and footage needed to approach the next person." start={1150} end={1740}/><Caption text="The stolen asset is not only a password. It is the victim’s credibility." start={2140} end={2650} accent={C.red}/>
  </Fade>;
};

const WhyScene: React.FC = () => {
  const frame = useCurrentFrame();
  const defects = ['DELAY', 'COMPRESSION', 'FROZEN FRAME', 'BAD AUDIO'];
  return <Fade frame={frame} duration={2280}><GridBackground/>
    <div style={{position: 'absolute', left: 110, top: 145, width: 1040, bottom: 150}}><Chrome url="meeting.example / quarterly-review" source="RECONSTRUCTION" accent={C.amber} style={{height: '100%'}}><div style={{padding: 28, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20}}><FaceTile name="TRUSTED CONTACT" tint="#5DE4FF" frozen={frame > 600}/><FaceTile name="TARGET" tint="#55E6A5"/></div>{frame > 790 ? <div style={{position: 'absolute', left: 250, right: 250, bottom: 90, padding: 22, borderRadius: 14, textAlign: 'center', background: C.red, color: 'white', fontSize: 25, fontWeight: 900}}>AUDIO ERROR — INSTALL COMPONENT</div> : null}</Chrome></div>
    <div style={{position: 'absolute', right: 120, top: 170, width: 560}}><div style={{fontSize: 22, color: C.cyan, letterSpacing: 4, fontWeight: 900}}>WHY THE ILLUSION HOLDS</div><div style={{fontFamily: fonts.display, fontSize: 63, lineHeight: 1.02, marginTop: 18}}>VIDEO CALLS ALREADY LOOK BROKEN</div><div style={{display: 'grid', gap: 16, marginTop: 38}}>{defects.map((d, i) => {const p = spring({frame: Math.max(0, frame - 250 - i * 130), fps: FPS, config: {damping: 18}}); return <div key={d} style={{padding: '19px 22px', borderRadius: 13, background: C.panel, border: '1px solid rgba(255,255,255,.12)', color: i === Math.floor(frame / 420) % 4 ? C.red : C.text, fontSize: 27, fontWeight: 900, opacity: p, transform: `translateX(${(1 - p) * 50}px)`}}>{d}</div>;})}</div></div>
    <Caption text="The attack does not need a perfect synthetic person. It only needs to survive the moment of doubt." start={360} end={950}/><Caption text="The attackers borrow trust that already exists between two real people." start={1500} end={2160} accent={C.cyan}/>
  </Fade>;
};

const ScaleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const n400 = Math.round(interpolate(frame, [180, 650], [0, 400], clamp));
  const n63 = interpolate(frame, [680, 1150], [0, 6.3], clamp).toFixed(1);
  const separation = frame > 1180;
  return <Fade frame={frame} duration={2130}><GridBackground danger/>
    <div style={{position: 'absolute', left: 90, top: 130, width: 930, height: 760}}><Chrome url="justice.gov / press release / 12 Nov 2026" source="U.S. DOJ" style={{width: '100%', height: '100%'}}><Img src={staticFile('sources/doj-crypto-disruption.png')} style={{width: '100%', height: 'auto', transform: `translateY(${-interpolate(frame, [0, 1800], [0, 1060], clamp)}px)`}}/></Chrome></div>
    <div style={{position: 'absolute', right: 95, top: 170, width: 700}}><div style={{padding: 30, borderRadius: 20, background: C.panel, border: `1px solid ${C.cyan}`}}><div style={{color: C.cyan, fontSize: 20, fontWeight: 900, letterSpacing: 3}}>FACESTEALER</div><div style={{fontFamily: fonts.display, fontSize: 88, marginTop: 4}}>${n400}M</div><div style={{color: C.muted, fontSize: 22}}>social engineering campaign</div></div><div style={{height: 26, display: 'grid', placeItems: 'center', color: separation ? C.red : C.muted, fontSize: 18, letterSpacing: 4, fontWeight: 900}}>{separation ? 'SEPARATE OPERATION' : 'SAME DOJ ANNOUNCEMENT'}</div><div style={{padding: 30, borderRadius: 20, background: C.panel, border: `1px solid ${C.amber}`}}><div style={{color: C.amber, fontSize: 20, fontWeight: 900, letterSpacing: 3}}>BINANCE THEFT</div><div style={{fontFamily: fonts.display, fontSize: 88, marginTop: 4}}>${n63}B</div><div style={{color: C.muted, fontSize: 22}}>attributed to TraderTraitor</div></div>{separation ? <div style={{marginTop: 28, padding: '22px 25px', borderRadius: 14, background: 'rgba(255,61,90,.12)', border: `1px solid ${C.red}`, color: C.text, fontSize: 25, lineHeight: 1.25, fontWeight: 700}}>Public evidence does not show that AI or deepfakes caused the Binance theft.</div> : null}</div>
    <SourceBug text="U.S. DOJ — ACTIONS DESCRIBED SEPARATELY"/><Caption text="The connection is scale, timing, and a state-backed focus on cryptocurrency — not proof of one technique." start={1240} end={1960}/>
  </Fade>;
};

const PatternScene: React.FC = () => {
  const frame = useCurrentFrame();
  const speed = interpolate(frame, [160, 900], [0, 5.4], clamp).toFixed(1);
  const lines = ['Invitation: Nvidia Executive Partnership Discussion', 'Confidential: 2026 Investment Parameters', 'Request for Strategic Finance Call'];
  return <Fade frame={frame} duration={1620}><GridBackground/>
    <div style={{position: 'absolute', left: 130, right: 130, top: 150, bottom: 150, display: 'grid', gridTemplateColumns: '1.2fr .8fr', gap: 38}}><div style={{borderRadius: 24, background: C.panel, border: '1px solid rgba(255,255,255,.12)', padding: 34, boxShadow: '0 30px 100px rgba(0,0,0,.4)'}}><div style={{display: 'flex', justifyContent: 'space-between', color: C.muted, fontSize: 18}}><span>INBOX / BREAKING-NEWS LURES</span><span>17 NOV 2026</span></div><div style={{marginTop: 32, display: 'grid', gap: 16}}>{lines.map((line, i) => {const p = spring({frame: Math.max(0, frame - 180 - i * 170), fps: FPS, config: {damping: 18}}); return <div key={line} style={{padding: 24, borderRadius: 16, background: i === 0 ? 'rgba(255,61,90,.12)' : C.raised, border: `1px solid ${i === 0 ? C.red : 'rgba(255,255,255,.1)'}`, opacity: p, transform: `translateY(${(1-p)*36}px)`}}><div style={{fontSize: 16, color: i === 0 ? C.red : C.cyan, fontWeight: 900, letterSpacing: 2}}>{i === 0 ? 'FLAGGED LURE' : 'VARIATION'}</div><div style={{fontSize: 30, fontWeight: 700, marginTop: 8}}>{line}</div></div>;})}</div><div style={{marginTop: 26, color: C.muted, fontSize: 19}}>Source: Axios reporting on KnowBe4 observations. Losses and attacker identity were not established.</div></div>
      <div style={{display: 'grid', placeItems: 'center', textAlign: 'center'}}><div><div style={{color: C.cyan, letterSpacing: 5, fontSize: 21, fontWeight: 900}}>HEADLINE RESPONSE SPEED</div><div style={{fontFamily: fonts.display, fontSize: 166, lineHeight: .95, marginTop: 20}}>{speed}×</div><div style={{fontSize: 30, lineHeight: 1.25, marginTop: 20, color: C.muted}}>faster in 2026 than in 2022<br/>according to KnowBe4 data cited by Axios</div></div></div>
    </div>
    <Caption text="Criminals use the short period when people urgently want documents, access, or insider context." start={650} end={1260}/>
  </Fade>;
};

const DefenseScene: React.FC = () => {
  const frame = useCurrentFrame();
  const items = [['01', 'CALL BACK', 'Use a number or account you already had.'], ['02', 'INSTALL NOTHING', 'Open the official meeting app yourself.'], ['03', 'CHECK THE DOMAIN', 'Read the complete address, not the logo.'], ['04', 'LOCK THE ACCOUNT', 'Use security keys and review active sessions.']];
  const active = Math.min(3, Math.floor(frame / 430));
  return <Fade frame={frame} duration={TOTAL_FRAMES - 12510}><GridBackground/>
    <div style={{position: 'absolute', left: 105, top: 135, right: 105, bottom: 125}}><div style={{fontSize: 22, letterSpacing: 4, color: C.cyan, fontWeight: 900}}>BREAK THE VICTIM LOOP</div><div style={{fontFamily: fonts.display, fontSize: 76, marginTop: 10}}>VERIFY THE CHANNEL, NOT THE FACE</div><div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22, marginTop: 44}}>{items.map(([num, title, desc], i) => {const p = spring({frame: Math.max(0, frame - 220 - i * 190), fps: FPS, config: {damping: 17, stiffness: 90}}); const on = i === active; return <div key={title} style={{height: 222, padding: 28, borderRadius: 22, background: on ? 'rgba(93,228,255,.1)' : C.panel, border: `2px solid ${on ? C.cyan : '#263241'}`, boxShadow: on ? '0 0 70px rgba(93,228,255,.14)' : 'none', opacity: p, transform: `scale(${0.9 + p * 0.1})`}}><div style={{display: 'flex', gap: 20, alignItems: 'center'}}><div style={{fontFamily: fonts.display, fontSize: 48, color: on ? C.cyan : C.muted}}>{num}</div><div style={{fontFamily: fonts.display, fontSize: 42}}>{title}</div></div><div style={{marginTop: 17, color: C.muted, fontSize: 25, lineHeight: 1.25}}>{desc}</div></div>;})}</div>
      {frame > 1750 ? <div style={{position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', background: 'rgba(5,7,11,.93)'}}><div style={{textAlign: 'center', maxWidth: 1500}}><div style={{fontFamily: fonts.display, fontSize: 98, lineHeight: 1.02}}>THE NEXT FAKE CALL<br/>MAY NOT <span style={{color: C.red}}>LOOK FAKE</span></div><div style={{marginTop: 30, fontSize: 31, color: C.muted}}>FaceStealer case study · Sources: FBI, IC3, DOJ, AP, Axios · 18 Nov 2026</div></div></div> : null}
    </div>
    <Caption text="No familiar face should be enough to approve a high-value change." start={1180} end={1710} accent={C.cyan}/>
  </Fade>;
};

export const FaceStealerFilm: React.FC = () => <AbsoluteFill style={{background: C.bg, color: C.text, fontFamily: fonts.body}}>
  <Sequence from={0} durationInFrames={1740}><HookScene/></Sequence>
  <Sequence from={1740} durationInFrames={1980}><EvidenceScene/></Sequence>
  <Sequence from={3720} durationInFrames={2760}><LoopScene/></Sequence>
  <Sequence from={6480} durationInFrames={2280}><WhyScene/></Sequence>
  <Sequence from={8760} durationInFrames={2130}><ScaleScene/></Sequence>
  <Sequence from={10890} durationInFrames={1620}><PatternScene/></Sequence>
  <Sequence from={12510} durationInFrames={TOTAL_FRAMES - 12510}><DefenseScene/></Sequence>
  <Audio src={staticFile('audio/narration.m4a')} volume={1}/><Audio src={staticFile('audio/music.mp3')} volume={0.07} loop/>
  <Sequence from={765} durationInFrames={180}><Audio src={staticFile('audio/title-boom.mp3')} volume={0.45}/></Sequence><Sequence from={420} durationInFrames={120}><Audio src={staticFile('audio/glitch.mp3')} volume={0.33}/></Sequence><Sequence from={1180} durationInFrames={140}><Audio src={staticFile('audio/drone-hit.mp3')} volume={0.22}/></Sequence>
  <Progress/>
</AbsoluteFill>;

export const FaceStealerStill: React.FC = () => <AbsoluteFill style={{background: C.bg, color: C.text, fontFamily: fonts.body, overflow: 'hidden'}}><GridBackground danger/><div style={{position: 'absolute', left: 105, top: 95, padding: '14px 22px', borderRadius: 12, background: C.red, fontSize: 25, fontWeight: 900, letterSpacing: 3}}>REAL FBI CASE</div><div style={{position: 'absolute', left: 100, top: 245, width: 1150}}><div style={{fontFamily: fonts.display, fontSize: 118, lineHeight: .92}}>THAT FACE<br/><span style={{color: C.cyan}}>WAS STOLEN</span></div><div style={{marginTop: 40, display: 'inline-block', padding: '16px 24px', borderRadius: 14, background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.2)', fontFamily: fonts.display, fontSize: 56}}>$400,000,000</div></div><div style={{position: 'absolute', right: 100, top: 160, width: 590, height: 700, borderRadius: 32, overflow: 'hidden', background: C.panel, border: `4px solid ${C.red}`, boxShadow: '0 0 100px rgba(255,61,90,.27)'}}><FaceTile name="TRUSTED CONTACT?" tint="#5DE4FF" frozen/><div style={{position: 'absolute', left: 30, right: 30, bottom: 38, padding: 22, borderRadius: 15, background: C.red, textAlign: 'center', fontSize: 28, fontWeight: 900}}>FAKE VIDEO CALL</div></div></AbsoluteFill>;

