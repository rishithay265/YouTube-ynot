"""FaceStealer v2 planner: narration takes -> one voice stem + word timings -> shots cut on the voice.

  python research/facestealer/v2/plan_v2.py        (from the repo root; needs ffmpeg, numpy)

Reads  research/facestealer/v2/script_v2.json   (sections + the chosen take of each)
       research/facestealer/v2/al/<take>.json    (forced alignment of each take, from align.py)
       research/facestealer/v2/shots_v2.py       (shot list: cue words, marks, scene params)
Writes research/facestealer/v2/stems/voice.wav  (processed narration, 48 kHz mono)
       src/episodes/facestealer/{words,defs,timeline,episode}.json
"""
import json, os, re, subprocess, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
EP = os.path.join(ROOT, 'src', 'episodes', 'facestealer')
sys.path.insert(0, HERE)
from shots_v2 import SHOTS  # noqa: E402

FPS, SR = 30, 48000
START = 0.12          # seconds of air before the first word
GAP_AFTER = {0: 0.85, 1: 0.5, 2: 0.5, 3: 0.5, 4: 0.55, 5: 0.55, 6: 0.6}  # pause after section i
TAIL = 2.4            # after the last word (end card fade)
LEAD = 3              # frames a cut lands before its cue word
XFADE = 6             # default dissolve between shots (frames)

S = json.load(open(os.path.join(HERE, 'script_v2.json')))
picks = S['picks']

def pcm(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).copy()

# ---------------------------------------------------------------- 1. narration
voice = np.zeros(int(SR * 400), np.float32)
words, t = [], START
for i, take in enumerate(picks):
    al = json.load(open(os.path.join(HERE, 'al', f'{take}.json')))
    x = pcm(os.path.join(HERE, 'tts', f'{take}.mp3'))
    a = max(0.0, al[0]['s'] - 0.06)
    b = min(len(x) / SR, al[-1]['e'] + 0.14)
    seg = x[int(a * SR):int(b * SR)].copy()
    f = int(0.012 * SR); seg[:f] *= np.linspace(0, 1, f); seg[-f:] *= np.linspace(1, 0, f)
    o = int(t * SR); voice[o:o + len(seg)] += seg
    for w in al:
        words.append(dict(w=w['w'], s=round(w['s'] - a + t, 3), e=round(w['e'] - a + t, 3), p=w['p'], sec=i))
    t += (b - a) + GAP_AFTER.get(i, 0)
end_voice = words[-1]['e']
total_s = end_voice + TAIL
voice = voice[:int(total_s * SR)]
os.makedirs(os.path.join(HERE, 'stems'), exist_ok=True)
raw_path = os.path.join(HERE, 'stems', 'voice_raw.wav')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-', '-c:a', 'pcm_s24le', raw_path], input=voice.tobytes(), check=True)
# Remaster: rumble cut, a touch less mud, a little presence; then a gentle 2:1 leveller and a fast peak stage that
# only catches plosives (the raw TTS peaks sit ~20 dB above its loudness), and light de-essing. Measured on this
# narration: loudness range 3.1 -> 2.4 LU, 99th-percentile peak 19.2 -> 15.0 dB above loudness.
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', raw_path, '-af',
                'highpass=f=70,equalizer=f=280:t=q:w=1.1:g=-1.5,equalizer=f=4200:t=q:w=1.2:g=1.2,loudnorm=I=-20:linear=true:TP=0,'
                'acompressor=threshold=-24dB:ratio=2:attack=1:release=60:knee=6,acompressor=threshold=-13dB:ratio=8:attack=0.3:release=25,'
                'deesser=i=0.25:m=0.5:f=0.5',
                '-c:a', 'pcm_s24le', os.path.join(HERE, 'stems', 'voice.wav')], check=True)

# ---------------------------------------------------------------- 2. caption tokens (numbers read better as digits)
def caption_words(ws):
    out, i = [], 0
    low = lambda k: ws[k]['w'].lower() if k < len(ws) else ''
    while i < len(ws):
        if low(i) == 'four' and low(i + 1) == 'hundred' and low(i + 2) == 'million' and low(i + 3).startswith('dollars'):
            out.append(dict(ws[i], w='$400', e=ws[i + 1]['e'], p=''))
            out.append(dict(ws[i + 2], w='million', e=ws[i + 3]['e'], p=ws[i + 3]['p'])); i += 4; continue
        if low(i) == 'nine' and low(i + 1) == 'hundred':
            out.append(dict(ws[i], w='900', e=ws[i + 1]['e'], p=ws[i + 1]['p'])); i += 2; continue
        out.append(dict(ws[i])); i += 1
    return [dict(w=w['w'], s=w['s'], e=w['e'], **({'p': w['p']} if w['p'] else {})) for w in out]

json.dump(caption_words(words), open(os.path.join(EP, 'words.json'), 'w'), indent=0)

# ---------------------------------------------------------------- 3. shots
norm = lambda w: re.sub(r"[^a-z0-9']", '', w.lower().replace('’', "'"))
W = [norm(w['w']) for w in words]

def find(phrase, start):
    q = [norm(x) for x in phrase.split()]
    for i in range(start, len(W) - len(q) + 1):
        if W[i:i + len(q)] == q: return i
    raise SystemExit(f'cue not found after word {start}: {phrase!r}')

idx, pos = [], 0
for d in SHOTS:
    if d['cue'] == 'f:0': idx.append(0); continue
    i = find(d['cue'], pos + 1 if idx else 0); idx.append(i); pos = i
frame = lambda sec: int(round(sec * FPS))
total = frame(total_s)
starts = [0] + [max(frame(words[i]['s']) - LEAD, 0) for i in idx[1:]]
for k in range(1, len(starts)):
    assert starts[k] > starts[k - 1] + 10, (SHOTS[k]['cue'], starts[k - 1], starts[k])
defs, shots, segs = [], [], []
for k, d in enumerate(SHOTS):
    a = starts[k]; b = starts[k + 1] if k + 1 < len(starts) else total
    nxt = idx[k + 1] if k + 1 < len(idx) else len(words)
    m = {}
    for mk in d.get('marks', []):
        name, word = mk.split('=') if '=' in mk else (mk, mk)
        j = find(word, idx[k])
        assert j < nxt, f'mark {mk} of shot {k + 1} falls in the next shot'
        m[name] = frame(words[j]['s']) - a
    p = dict(d.get('p', {})); p['m'] = m
    line = ' '.join(w['w'] + w['p'] for w in words[idx[k]:nxt])
    sid = f'S{k + 1}'
    key = max(8, min(b - a - 1, max(m.values()) + 20 if m else int((b - a) * 0.6)))
    defs.append(dict(id=sid, cue=d['cue'], kind=d['kind'], p=p, note=d.get('note', ''), key=key))
    info = dict(id=sid, size='screen', key=key, len=b - a, first=a, line=line, note=d.get('note', d['kind']))
    if 'x' in d: info['x'] = d['x']
    shots.append(info)
    segs.append(dict(shot=sid, a=a, b=b, t0=0, t1=b - a, line=line))
json.dump(defs, open(os.path.join(EP, 'defs.json'), 'w'), indent=1, ensure_ascii=False)

def at(kind, off=0, n=1, mark=None):
    ds = [d for d in defs if d['kind'] == kind][n - 1]
    s = next(x for x in shots if x['id'] == ds['id'])
    return s['first'] + (ds['p']['m'][mark] if mark else 0) + off
fx = [
    dict(kind='flash', color='#FF2D4D', o=0.35, f=at('hook_call', 2, mark='Except')), dict(kind='shake', len=8, amp=8, f=at('hook_call', 2, mark='Except')),
    dict(kind='flash', color='#FF2D4D', o=0.55, f=at('title', 1)), dict(kind='shake', len=10, amp=14, f=at('title', 1)),
    dict(kind='shake', len=8, amp=8, f=at('twist', 4, mark='not')),
    dict(kind='shake', len=8, amp=8, f=at('terminal', 34)),
    dict(kind='flash', color='#FFFFFF', o=0.3, f=at('enough', 2)),
    dict(kind='flash', color='#FF2D4D', o=0.25, f=at('chain', 0)),
]
timeline = dict(slug='facestealer', title='FaceStealer', fps=FPS, total=total, segments=segs, shots=shots, fx=sorted(fx, key=lambda e: e['f']),
                audio=dict(voice='facestealer/master.wav', voiceVol=1))
json.dump(timeline, open(os.path.join(EP, 'timeline.json'), 'w'), indent=1, ensure_ascii=False)

# ---------------------------------------------------------------- 4. episode record
e = json.load(open(os.path.join(EP, 'episode.json')))
e['script'] = [dict(beat=str(i + 1), text=s) for i, s in enumerate(S['sections'])]
e['voice'] = S['voice']
e['science'] = [c for c in e.get('science', []) if 'Binance' not in c['claim']]
e['shots'] = [dict(id=d['id'], size='screen', set=d['kind'], key=d['key'], note=d['note'] or d['kind']) for d in defs]
e['edit'] = [dict(shot=d['id'], at=d['cue']) for d in defs]
e['fx'] = []
e.pop('sound', None)
e['sound'] = dict(note='built by research/facestealer/v2/sound_v2.py from library/sfx clips; mastered to -16 LUFS / -1.5 dBTP')
json.dump(e, open(os.path.join(EP, 'episode.json'), 'w'), indent=1, ensure_ascii=False)
print(f'{len(words)} words, voice ends {end_voice:.2f}s, total {total} frames ({total / FPS:.1f}s), {len(shots)} shots')
