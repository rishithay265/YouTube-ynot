import json
D=json.load(open('src/episodes/facestealer/defs.json'))
e=json.load(open('src/episodes/facestealer/episode.json'))
clips={
 'glitch':["a short digital glitch, an electric buzz and crackle flickering like an unstable hologram",1.5],
 'drone_hit':["a dark ominous low drone hit, deep cinematic horror sting",2.6],
 'title_boom':["a cinematic whoosh rising into a deep boom impact",1.6],
 'counter_tick':["a fast mechanical counter ticking up rapidly, digits rolling over, getting faster",1.6],
 'select_draw':["a quick digital selection sound, a soft rising electronic shimmer as a box is drawn on screen, short",0.6],
 'pop':["a cartoon speech bubble pop, short and bright",0.5],
 'switch_off':["a heavy electrical breaker switching off with a dull clunk",0.5],
 'ui_click':["a single crisp computer mouse click, close and dry, short",0.5],
 'notif':["a soft modern chat message notification ping, short and clean",0.6],
 'swoosh':["a quick smooth digital interface whoosh, a window sliding in, short",0.7],
 'stamp':["a heavy rubber stamp slamming down on a wooden desk, a dull thud, short",0.6],
 'typing':["fast keyboard typing on a mechanical keyboard, a burst of keystrokes",1.5],
 'rewind':None,
 'music':["dark tense cyber thriller underscore, slow pulsing synth bass, sparse high pings, minimal and suspenseful, 90 bpm, no vocals, loopable",20.0],
}
clips={k:v for k,v in clips.items() if v}
def ids(kind): return [d['id'] for d in D if d['kind']==kind]
ev=[]
def add(sid,off,clip,g,*extra): ev.append([f'{sid}+{off}' if off else sid,clip,g,*extra])
rep=[]
for d in D:
    s,k=d['id'],d['kind']
    if k=='msg': add(s,12,'notif',.3); add(s,38,'notif',.3)
    elif k=='link_click': add(s,22,'ui_click',.45)
    elif k=='toast': add(s,6,'notif',.3)
    elif k=='fix_click': add(s,30,'ui_click',.45); add(s,41,'glitch',.35)
    elif k=='loop': add(s,20,'glitch',.25)
    elif k in('film','card','bigtext'): add(s,0,'swoosh',.22)
    elif k=='doc': add(s,0,'swoosh',.22); add(s,14,'select_draw',.22)
    elif k=='count400': add(s,4,'counter_tick',.3)
    elif k=='title': add(s,32,'title_boom',.5,'peak'); add(s,32,'drone_hit',.2)
    elif k=='timeline18': add(s,0,'counter_tick',.2)
    elif k=='webcam': add(s,30,'ui_click',.4)
    elif k=='scan': add(s,10,'counter_tick',.15)
    elif k=='lock': add(s,6,'switch_off',.3)
    elif k=='become': add(s,14,'glitch',.25)
    elif k=='fanout': rep.append(dict(at=f'{s}+10',clip='pop',n=12,every=3,gain=[.1,.2],pitch=[.9,1.2]))
    elif k=='bubbles': add(s,8,'pop',.25); add(s,30,'pop',.25); add(s,52,'pop',.25)
    elif k=='history': add(s,30,'select_draw',.22); add(s,44,'notif',.3)
    elif k=='calendar': add(s,0,'notif',.3)
    elif k=='clock': add(s,40,'notif',.3)
    elif k=='twin': add(s,56,'glitch',.28)
    elif k=='lobby2': add(s,40,'ui_click',.35)
    elif k=='playback': add(s,0,'ui_click',.4)
    elif k=='tiles': rep.append(dict(at=f'{s}+0',clip='pop',n=6,every=7,gain=[.12,.2],pitch=[.9,1.1]))
    elif k=='from_friend': add(s,14,'notif',.3)
    elif k=='steps': add(s,10,'pop',.25); add(s,28,'pop',.25); add(s,46,'pop',.25)
    elif k=='terminal': add(s,0,'typing',.15); add(s,30,'glitch',.3); add(s,34,'stamp',.5)
    elif k=='icons4': rep.append(dict(at=f'{s}+6',clip='pop',n=4,every=26,gain=[.15,.22],pitch=[.8,1.0]))
    elif k=='chain': rep.append(dict(at=f'{s}+6',clip='pop',n=14 if d['p'].get('big') else 8,every=4 if d['p'].get('big') else 8,gain=[.1,.18],pitch=[.8,1.3]))
    elif k=='months': add(s,0,'counter_tick',.15)
    elif k=='servers': add(s,30,'stamp',.55)
    elif k=='grid900': add(s,0,'counter_tick',.15)
    elif k=='ai': add(s,0,'drone_hit',.2)
    elif k=='morph': add(s,20,'glitch',.15)
    elif k=='enough': add(s,40,'drone_hit',.32); add(s,40,'glitch',.2)
    elif k=='deps': add(s,24,'glitch',.15)
    elif k=='stat': add(s,0,'counter_tick',.3)
    elif k=='compare': add(s,34,'stamp',.45)
    elif k=='end': add(s,62,'drone_hit',.4); add(s,62,'glitch',.3)
# ids for card/bigtext also ding
e['sound']=dict(clips=clips,events=ev,repeats=rep,music=dict(clip='music'),levels=dict(sfx_lu=-6.0,music_lu=-15.0))
json.dump(e,open('src/episodes/facestealer/episode.json','w'),indent=1,ensure_ascii=False)
print(len(ev),'events',len(rep),'repeats')
