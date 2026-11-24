"""Planner for "हम त्रिपुर थे" (adapted from research/tripura/plan.py; one take per section): chosen narration takes -> one voice stem + word timings -> shots cut on the voice.
Adapted from research/facestealer/v2/plan_v2.py for Hindi.

  python research/tripura/plan.py        (from the repo root; needs ffmpeg, numpy)

Reads  research/tripura/script.json       (the locked script: sections, lines, cards)
       research/tripura/tts/chosen.json   (the lowest-CER take per section, from pick_takes.py)
       research/tripura/tts/al/<take>.json (word timings of each take, from align.py)
       research/tripura/shots.py          (shot list: cue words, marks)
Writes research/tripura/stems/voice.wav  (processed narration, 48 kHz mono, already placed on the film's clock)
       src/episodes/tripura/{words,defs,timeline,episode}.json
       research/tripura/subs/tripura.{hi,en}.srt   (for YouTube upload; nothing is burned in)
"""
import json, os, re, subprocess, sys, unicodedata
from difflib import SequenceMatcher
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
EP = os.path.join(ROOT, 'src', 'episodes', 'tripura')
sys.path.insert(0, HERE)
from shots import SHOTS  # noqa: E402

FPS, SR = 30, 48000
OPEN = 6.0        # the opening card holds this long before the first word
GAP_AFTER = {'s1': 7.0, 's2': 1.4, 's3': 1.6, 's4': 1.6, 's5': 1.8, 's6': 1.6, 's7': 2.2, 's8': 1.6, 's9': 1.6, 's10': 2.6, 's11': 3.6}  # s1: the title card
# Pauses inserted inside a section, after the line ending with this phrase (seconds).
INSERT = [('s11', 'अपना नाम पुकारा', 0.6), ('s11', 'करोड़ सूर्यों जैसा', 0.8), ('s12', 'थे ही नहीं', 1.0), ('s12', 'उसका नाम लो', 1.8)]
# Whispered phrases that sit 15-18 dB under the rest of their take: lifted on just their word span (dB), so they stay
# whispers but survive the music. (section, phrase, which occurrence in the section, gain)
LIFT = []
TAIL = 16.0       # after the last word: silence, then the closing card
LEAD = 3          # frames a cut lands before its cue word
XFADE = 8         # default dissolve between shots (frames)

S = json.load(open(os.path.join(HERE, 'script.json')))
chosen = json.load(open(os.path.join(HERE, 'tts', 'chosen.json')))

NUKTA = str.maketrans({'़': None, 'ँ': 'ं'})
def norm(w):
    w = unicodedata.normalize('NFC', w).translate(NUKTA)
    return re.sub(r'[^ऀ-ॿ]', '', re.sub(r'[।॥]', '', w))
PUNCT = re.compile(r'([^ऀ-ॿ]*)$')

def pcm(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).copy()

# ---------------------------------------------------------------- 1. script tokens, with their line
def script_tokens(sec):
    toks = []
    for li, l in enumerate(sec['lines']):
        for w in l['hi'].replace('~', ' ').split():
            if norm(w): toks.append(dict(w=w, n=norm(w), line=li))
    return toks

# ---------------------------------------------------------------- 2. narration
voice = np.zeros(int(SR * 900), np.float32)
words, t = [], OPEN
for sec in S['sections']:
    sid = sec['id']; take = chosen[sid]
    al = [w for w in json.load(open(os.path.join(HERE, 'tts', 'al', f'{take}.json'))) if norm(w['w'])]
    toks = script_tokens(sec)
    # Map the aligner's words onto the script's words (they should match one to one; difflib covers any split/merge).
    sm = SequenceMatcher(a=[w['n'] for w in toks], b=[norm(w['w']) for w in al], autojunk=False)
    timed = [None] * len(toks)
    for blk in sm.get_matching_blocks():
        for k in range(blk.size): timed[blk.a + k] = al[blk.b + k]
    for k, w in enumerate(toks):  # unmatched: interpolate between neighbours
        if timed[k] is None:
            prev = next((timed[j] for j in range(k - 1, -1, -1) if timed[j]), None)
            nxt = next((timed[j] for j in range(k + 1, len(toks)) if timed[j]), None)
            s0 = prev['e'] if prev else (nxt['s'] - 0.3 if nxt else 0); e0 = nxt['s'] if nxt else s0 + 0.3
            timed[k] = dict(w=w['w'], s=s0, e=max(e0, s0 + 0.05), guess=True)
    miss = sum(1 for x in timed if x.get('guess'))
    if miss: print(f'{sid}: {miss} of {len(toks)} words interpolated')
    x = pcm(os.path.join(HERE, 'tts', f'{take}.mp3'))
    for (lsid, phrase, nth, gdb) in LIFT:
        if lsid != sid: continue
        q = [norm(p) for p in phrase.split()]
        hits = [k for k in range(len(toks) - len(q) + 1) if [w['n'] for w in toks[k:k + len(q)]] == q]
        k = hits[nth - 1]; a0, b0 = timed[k]['s'] - 0.05, timed[k + len(q) - 1]['e'] + 0.12
        env = np.ones(len(x)); g = 10 ** (gdb / 20); r = int(0.04 * SR)
        i0, i1 = int(a0 * SR), int(b0 * SR); env[i0:i1] = g
        env[i0 - r:i0] = np.linspace(1, g, r); env[i1:i1 + r] = np.linspace(g, 1, r)
        x = x * env.astype(np.float32)
    # Cut points: the section's ends plus any inserted pauses (split in the gap after the phrase's last word).
    cuts = []
    for (isid, phrase, secs) in INSERT:
        if isid != sid: continue
        q = [norm(p) for p in phrase.split()]
        for k in range(len(toks) - len(q) + 1):
            if [w['n'] for w in toks[k:k + len(q)]] == q and k + len(q) < len(toks) and toks[k + len(q) - 1]['line'] != toks[k + len(q)]['line']:
                j = k + len(q) - 1; cuts.append((j, secs)); break
        else: raise SystemExit(f'insert phrase not found at a line end in {sid}: {phrase}')
    a = max(0.0, timed[0]['s'] - 0.06)
    pieces, start_k = [], 0
    for (j, secs) in sorted(cuts) + [(len(toks) - 1, None)]:
        b = min(len(x) / SR, timed[j]['e'] + 0.14) if secs is None else (timed[j]['e'] + timed[j + 1]['s']) / 2
        pieces.append((a, b, start_k, j, secs)); a = b if secs is None else (timed[j]['e'] + timed[j + 1]['s']) / 2; start_k = j + 1
    for (a, b, k0, k1, secs) in pieces:
        seg = x[int(a * SR):int(b * SR)].copy()
        f = int(0.012 * SR); seg[:f] *= np.linspace(0, 1, f); seg[-f:] *= np.linspace(1, 0, f)
        o = int(t * SR); voice[o:o + len(seg)] += seg
        for k in range(k0, k1 + 1):
            w = toks[k]; tw = timed[k]
            p = PUNCT.search(w['w']).group(1)
            words.append(dict(w=w['w'][:len(w['w']) - len(p)] if p else w['w'], p=p, s=round(tw['s'] - a + t, 3), e=round(tw['e'] - a + t, 3),
                              sec=sid, line=w['line']))
        t += (b - a) + (secs or 0)
    t += GAP_AFTER.get(sid, 0)
end_voice = words[-1]['e']
total_s = end_voice + TAIL
voice = voice[:int(total_s * SR)]
os.makedirs(os.path.join(HERE, 'stems'), exist_ok=True)
raw_path = os.path.join(HERE, 'stems', 'voice_raw.wav')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-', '-c:a', 'pcm_s24le', raw_path], input=voice.tobytes(), check=True)
# Remaster as in v2 (rumble cut, less mud, a little presence, gentle levelling, plosive catcher, light de-essing), plus a
# faint short room so the dry TTS sits in the film's space.
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', raw_path, '-af',
                'highpass=f=70,equalizer=f=280:t=q:w=1.1:g=-1.5,equalizer=f=4200:t=q:w=1.2:g=1.0,loudnorm=I=-20:linear=true:TP=0,'
                'acompressor=threshold=-24dB:ratio=2:attack=1:release=60:knee=6,acompressor=threshold=-13dB:ratio=8:attack=0.3:release=25,'
                'deesser=i=0.25:m=0.5:f=0.5,aecho=0.9:0.9:38|61:0.10|0.06,aresample=48000',
                '-c:a', 'pcm_s24le', os.path.join(HERE, 'stems', 'voice.wav')], check=True)

json.dump([dict(w=w['w'], s=w['s'], e=w['e'], **({'p': w['p']} if w['p'] else {})) for w in words],
          open(os.path.join(EP, 'words.json'), 'w'), indent=0, ensure_ascii=False)

# ---------------------------------------------------------------- 3. subtitles (one cue per script line; long Hindi lines split at a word gap)
def ts(x):
    ms = int(round(x * 1000)); return f'{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}'
lines = []
for sec in S['sections']:
    for li, l in enumerate(sec['lines']):
        ws = [w for w in words if w['sec'] == sec['id'] and w['line'] == li]
        lines.append(dict(ws=ws, hi=re.sub(r' +', ' ', l['hi'].replace('~', ' ')), en=l['en']))
def srt(cues):
    return '\n'.join(f'{i + 1}\n{ts(a)} --> {ts(b)}\n{txt}\n' for i, (a, b, txt) in enumerate(cues))
hi_cues, en_cues = [], []
for L in lines:
    ws = L['ws']; a, b = ws[0]['s'], ws[-1]['e'] + 0.35
    en_cues.append((a, b, L['en']))
    if len(L['hi']) <= 58: hi_cues.append((a, b, L['hi'])); continue
    # split at the largest pause near the middle
    mid = len(ws) // 2
    k = max(range(max(1, mid - 3), min(len(ws) - 1, mid + 4)), key=lambda k: ws[k]['s'] - ws[k - 1]['e'])
    hi_cues.append((a, ws[k - 1]['e'] + 0.2, ' '.join(w['w'] + w['p'] for w in ws[:k])))
    hi_cues.append((ws[k]['s'], b, ' '.join(w['w'] + w['p'] for w in ws[k:])))
# no overlaps
for cues in (hi_cues, en_cues):
    for i in range(len(cues) - 1):
        if cues[i][1] > cues[i + 1][0] - 0.05: cues[i] = (cues[i][0], cues[i + 1][0] - 0.05, cues[i][2])
os.makedirs(os.path.join(HERE, 'subs'), exist_ok=True)
open(os.path.join(HERE, 'subs', 'tripura.hi.srt'), 'w').write(srt(hi_cues))
open(os.path.join(HERE, 'subs', 'tripura.en.srt'), 'w').write(srt(en_cues))

# ---------------------------------------------------------------- 4. shots
N = [norm(w['w']) for w in words]
def find(phrase, start, nth=1):
    q = [norm(x) for x in phrase.split()]
    for i in range(start, len(N) - len(q) + 1):
        if N[i:i + len(q)] == q:
            nth -= 1
            if nth == 0: return i, i + len(q) - 1
    raise SystemExit(f'cue not found after word {start}: {phrase!r}')
def parse(c):
    m = re.match(r'(.*?)(?:@(\d+))?$', c); return m.group(1), int(m.group(2) or 1)

frame = lambda sec: int(round(sec * FPS))
total = frame(total_s)
idx, starts, pos = [], [], 0
for d in SHOTS:
    c = d['cue']
    if c == 'f:0': idx.append(0); starts.append(0); continue
    if c.startswith('after:'):
        _, j = find(c[6:], pos); idx.append(j + 1); starts.append(frame(words[j]['e'] + d.get('delay', 0.4))); pos = j; continue
    ph, nth = parse(c)
    i, _ = find(ph, pos + (1 if len(idx) > 1 else 0), nth); idx.append(i); pos = i
    starts.append(max(frame(words[i]['s']) - LEAD, 0))
for k in range(1, len(starts)):
    assert starts[k] > starts[k - 1] + 20, (SHOTS[k]['kind'], starts[k - 1], starts[k])
defs, shots, segs = [], [], []
for k, d in enumerate(SHOTS):
    a = starts[k]; b = starts[k + 1] if k + 1 < len(starts) else total
    nxt = idx[k + 1] if k + 1 < len(idx) else len(words)
    m = {}
    for mk in d.get('marks', []):
        name, word = mk.split('=')
        end = word.endswith('+e'); word = word[:-2] if end else word
        ph, nth = parse(word)
        i, j = find(ph, idx[k], nth)
        assert i < nxt, f'mark {mk} of shot {k + 1} ({d["kind"]}) falls in the next shot'
        m[name] = (frame(words[j]['e']) if end else frame(words[i]['s'])) - a
    p = dict(d.get('p', {})); p['m'] = m
    line = ' '.join(w['w'] + w['p'] for w in words[idx[k]:nxt]) if d['cue'] != 'f:0' else ''
    sid = f'S{k + 1}'
    key = max(8, min(b - a - 1, max(m.values()) + 24 if m else int((b - a) * 0.6)))
    defs.append(dict(id=sid, cue=d['cue'], kind=d['kind'], p=p, note=d.get('note', ''), key=key))
    info = dict(id=sid, size='screen', key=key, len=b - a, first=a, line=line, note=d.get('note', d['kind']))
    if 'x' in d: info['x'] = d['x']
    shots.append(info)
    segs.append(dict(shot=sid, a=a, b=b, t0=0, t1=b - a, line=line))
json.dump(defs, open(os.path.join(EP, 'defs.json'), 'w'), indent=1, ensure_ascii=False)

def at(kind, mark=None, off=0):
    ds = next(d for d in defs if d['kind'] == kind)
    s = next(x for x in shots if x['id'] == ds['id'])
    return s['first'] + (ds['p']['m'][mark] if mark else 0) + off
fx = [
    dict(kind='flash', color='#F4D77A', o=0.35, f=at('skanda', 'kill', 0)),
    dict(kind='shake', len=12, amp=10, f=at('horses_fall', 'fall', 2)),
    dict(kind='flash', color='#F4D77A', o=0.5, f=at('merge', 'one', 4)),
    dict(kind='flash', color='#FFE9B0', o=0.7, f=at('draw', 'release', 2)), dict(kind='shake', len=16, amp=14, f=at('draw', 'release', 2)),
    dict(kind='shake', len=10, amp=8, f=at('melt_iron', 'white', 0)),
]
timeline = dict(slug='tripura', title='हम त्रिपुर थे', fps=FPS, total=total, segments=segs, shots=shots, fx=sorted(fx, key=lambda e: e['f']),
                audio=dict(voice='tripura/master.flac', voiceVol=1))
json.dump(timeline, open(os.path.join(EP, 'timeline.json'), 'w'), indent=1, ensure_ascii=False)

# ---------------------------------------------------------------- 5. episode record
ep_path = os.path.join(EP, 'episode.json')
e = json.load(open(ep_path)) if os.path.exists(ep_path) else {}
e.update(id='Tripura', slug='tripura', topic=S['title_en'], title=[S['title']], title_en=S['title_en'],
         script=[dict(beat=sec['id'], title=sec['title'], anchor=sec['anchor'], text=' '.join(l['hi'].replace('~', ' ') for l in sec['lines']))
                 for sec in S['sections']],
         voice=dict(provider='ElevenLabs', model='eleven_v4', voice='Mohit (XuoDMtv7nNW0kZq3o1W2)', takes=chosen),
         shots=[dict(id=d['id'], size='screen', set=d['kind'], key=d['key'], note=d['note'] or d['kind']) for d in defs],
         edit=[dict(shot=d['id'], at=d['cue']) for d in defs],
         sound=dict(note='built by research/tripura/sound.py; mastered to -16 LUFS integrated, true peak <= -1.5 dBTP'))
json.dump(e, open(ep_path, 'w'), indent=1, ensure_ascii=False)
print(f'{len(words)} words, voice ends {end_voice:.2f}s, total {total} frames ({total / FPS / 60:.2f} min), {len(shots)} shots')
for d, s in zip(defs, shots):
    print(f"{d['id']:>4} {s['first'] / FPS:7.1f}s {s['len'] / FPS:5.1f}s {d['kind']:<11} {d['p']['m']}")
