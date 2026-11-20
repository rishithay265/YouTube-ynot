"""FaceStealer v2 shot list. Each shot cuts in on its cue word (searched forward through the narration) and may name
marks: words inside the shot whose local frame the scene receives as p['m'][name], so animation lands on the voice.

Evidence rects are the quoted words' boxes on the page images, found with tesseract + findquote.py (image px)."""

IC3 = dict(iw=1445, ih=1870, colX=[110, 1320])
DOJ = dict(src='facestealer/doj.png', iw=1440, ih=5200, colX=[470, 1210])
FLASH = 'FBI FLASH AC-111226-MS · 12 NOV 2026'
DOJ_SRC = 'DOJ PRESS RELEASE 26-1356 · 12 NOV 2026'

def ic3(page, rects, quote, emph, tag, **kw):
    return dict(IC3, src=f'facestealer/ic3-p{page}.png', rects=rects, quote=quote, emph=emph, tag=tag, source=f'{FLASH} · PAGE {page}', **kw)

SHOTS = [
    # ------------------------------------------------------------ cold open (hook)
    dict(cue='f:0', kind='hook_call', marks=['Except', 'recording'], note='friend on a call, revealed as a looping recording; $400M on screen', x=0),
    dict(cue='And the FBI', kind='hook_400', marks=['North', 'four'], note='$400M+ with the FBI line highlighted'),
    dict(cue="Here's", kind='twist', marks=['not', 'deepfake'], note='AI deepfake? crossed out'),
    dict(cue="It's real", kind='evidence', p=ic3(1, [dict(x=520, y=1556, w=706, h=22), dict(x=129, y=1590, w=734, h=22)],
        'hackers play prerecorded webcam videos of previous victims to simulate a legitimate video call with participants the target knows.',
        'prerecorded webcam videos of previous victims', 'REAL SOURCE · FBI'), marks=['real'], note='FBI: prerecorded webcam videos of previous victims'),
    dict(cue='The FBI calls', kind='title', note='FACESTEALER title', x=0),
    # ------------------------------------------------------------ stage 1-2
    dict(cue='It starts', kind='victimA', note='Victim A, already compromised'),
    dict(cue='scanned', kind='scan', note='scan for wallets'),
    dict(cue='taken', kind='lock', note='Telegram taken over'),
    dict(cue='while', kind='rec_wait', note='secretly recorded while waiting'),
    dict(cue='Now the hackers', kind='become', note='hackers become Victim A'),
    dict(cue='They message', kind='fanout', note="messages to Victim A's contacts"),
    dict(cue="Let's", kind='bubbles', marks=['c1=catch', 'c2=discuss'], note='the pretexts'),
    dict(cue='They can even', kind='history', marks=['tailored'], note='chat history -> tailored message'),
    # ------------------------------------------------------------ stage 3-4
    dict(cue='Say', kind='calendar', note='invite without a link'),
    dict(cue='The link only', kind='clock', note='link arrives shortly before'),
    dict(cue='It looks like', kind='domains', p=ic3(3, [dict(x=361, y=589, w=928, h=25), dict(x=129, y=626, w=549, h=22)],
        'one of many typo-squatted domain addresses the North Korean hackers registered previously to impersonate Zoom and Teams links.',
        'typo-squatted domain addresses', 'REAL SOURCE · FBI', dom=[dict(x=427, y=713, w=197, h=17), dict(x=425, y=747, w=208, h=17)]),
        marks=['alike=look-alike'], note='typo-squatted domains from the FLASH'),
    dict(cue='leading', kind='twin', marks=['copycat'], note='copycat meeting room'),
    dict(cue='You wait', kind='lobby2', marks=['admitted'], note='lobby then admitted'),
    dict(cue='And the hackers press', kind='playback', note='press play on the stored video'),
    dict(cue='often', kind='tiles', note='extra videos fill the room'),
    # ------------------------------------------------------------ stage 5-6
    dict(cue='After', kind='from_friend', marks=['audio'], note='"friend": nobody can hear you'),
    dict(cue='The other', kind='pressure', note='fake participants add pressure'),
    dict(cue='So your friend', kind='steps', marks=['s1=Click', 's2=Run', 's3=Or'], note='the fix'),
    dict(cue="That's", kind='terminal', note='the infection', x=0),
    dict(cue='The malware', kind='icons4', marks=['i1=cookie', 'i2=keyloggers', 'i3=screen', 'i4=backdoor'], note='malware installed'),
    dict(cue='And from the moment', kind='rewind', note='recording since the first click'),
    dict(cue="Now you're", kind='you_next', marks=['next'], note='you become the next Victim A'),
    dict(cue='With', kind='chain', p=dict(big=True), note='exponential'),
    # ------------------------------------------------------------ patience, evidence, AI
    dict(cue='The hackers are patient', kind='months', note='months, even more than a year'),
    dict(cue='as they waited', kind='wallet', note='waiting for balances to grow'),
    dict(cue='Under', kind='grid900', p=dict(DOJ, rects=[dict(x=938, y=2780, w=247, h=14), dict(x=489, y=2804, w=430, h=12)]), marks=['nine'], note='900+ webcam videos seized'),
    dict(cue='So where', kind='ai', note='where does AI fit in?', x=0),
    dict(cue='The FBI says the hackers', kind='morph', marks=['deepfake'], note='deepfakes of well-known people'),
    dict(cue='But', kind='evidence', p=ic3(4, [dict(x=283, y=782, w=1003, h=22), dict(x=128, y=816, w=152, h=17)],
        'the FaceStealer scheme currently continues to overwhelmingly rely on the theft of genuine victim videos.',
        'overwhelmingly rely on the theft of genuine victim videos', 'REAL SOURCE · FBI'), marks=['overwhelmingly'], note='FBI: overwhelmingly genuine video'),
    dict(cue='No deepfake', kind='enough', note='a real face was enough'),
    # ------------------------------------------------------------ supply chain + attribution
    dict(cue='It gets worse', kind='lib', marks=['Earlier', 'maintainer'], note='open-source library maintainer'),
    dict(cue='A fake Teams', kind='follow', note='fake Teams call, someone he recognized'),
    dict(cue='He followed', kind='bigtext', p=dict(lines=[dict(text='HE FOLLOWED', size=140), dict(text='THE “FIX”', size=200, color='#FF2D4D')], y0=420, step=200, sub='and infected his own computer'), note='he followed the fix'),
    dict(cue='The hackers then', kind='deps', note='malicious dependencies'),
    dict(cue='for a library', kind='tens', note='tens of millions of downloads a week'),
    dict(cue='The FBI says that', kind='evidence', p=ic3(4, [dict(x=1247, y=1420, w=54, h=17), dict(x=128, y=1454, w=1140, h=22), dict(x=128, y=1488, w=329, h=22)],
        'If not for the quick detection and response to the compromise, the failed attack could easily have resulted in very large-scale victimization.',
        'very large-scale victimization', 'REAL SOURCE · FBI', qsize=50), note='FBI: quick detection'),
    dict(cue='The FBI attributes', kind='names', marks=['North', 'Sapphire', 'BlueNoroff', 'APT', 'among'], p=dict(src='facestealer/ic3-p1.png', iw=1445, ih=1870, rects=[dict(x=129, y=1313, w=1095, h=30), dict(x=130, y=1351, w=382, h=17)]), note='attribution: the names'),
    # ------------------------------------------------------------ defence
    dict(cue='So how', kind='bigtext', p=dict(lines=[dict(text='HOW TO', size=120), dict(text='PROTECT YOURSELF', size=150, color='#3DFF9A')], y0=420, step=180, glow='#3DFF9A', sub='what the FBI advises'), note='defence intro', x=0),
    dict(cue='Join', kind='checklist', marks=['r1=Join', 'r2=Keep', 'r3=Never', 'r4=Confirm', 'r5=secure'], note='FBI recommendations'),
    dict(cue='If', kind='compromised', marks=['c1=move', 'c2=warn', 'c3=report'], note='if you were hit'),
    # ------------------------------------------------------------ close
    dict(cue='A familiar', kind='bigtext', p=dict(lines=[dict(text='A FAMILIAR FACE', size=130), dict(text='IS NO LONGER', size=130), dict(text='PROOF', size=230, color='#FFE14A')], ys=[300, 460, 690], glow='#FFE14A'), note='the lesson'),
    dict(cue='Before', kind='ask', note='is this person really here?'),
    dict(cue='Subscribe', kind='cta', note='subscribe and share'),
    dict(cue='Because', kind='end', note='the next call might not be a friend'),
]
