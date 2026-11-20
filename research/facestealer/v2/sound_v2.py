"""FaceStealer v2 sound: SFX placed on the shots and marks, the music bed, ducking, and the master.

  python research/facestealer/v2/sound_v2.py     (from the repo root, after plan_v2.py; needs ffmpeg, numpy)

Stems go to research/facestealer/v2/stems/ (not committed: rebuilt from the TTS takes and library/sfx).
The master goes to public/facestealer/master.wav: 48 kHz stereo, -16 LUFS integrated, true peak <= -1.5 dBTP.
"""
import glob, json, os, re, subprocess, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
EP = os.path.join(ROOT, 'src', 'episodes', 'facestealer')
STEMS = os.path.join(HERE, 'stems')
SR, FPS = 48000, 30
TARGET_I, TARGET_TP = -16.0, -1.5

tl = json.load(open(os.path.join(EP, 'timeline.json')))
defs = json.load(open(os.path.join(EP, 'defs.json')))
first = {s['id']: s['first'] for s in tl['shots']}
N = int(tl['total'] / FPS * SR)

def load(path, ch=2):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', str(ch), '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, ch).copy()

def lufs(path):
    out = subprocess.run(['ffmpeg', '-nostats', '-i', path, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
    i = float(re.findall(r'I:\s+(-?[\d.]+) LUFS', out)[-1]); tp = float(re.findall(r'Peak:\s+(-?[\d.]+) dBFS', out)[-1])
    return i, tp

def write(path, x):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', str(x.shape[1]), '-i', '-', '-c:a', 'pcm_s24le', path], input=x.astype(np.float32).tobytes(), check=True)

# ---------------------------------------------------------------- SFX
CLIP = {}
for f in glob.glob(os.path.join(ROOT, 'library', 'sfx', '*.mp3')):
    name = os.path.basename(f).rsplit('-', 1)[0]
    if name != 'music': CLIP[name] = f
cache = {}
def clip(name):
    if name not in cache:
        x = load(CLIP[name]); cache[name] = x / (np.abs(x).max() + 1e-9) * 0.89  # peak -1 dBFS
    return cache[name]

sfx = np.zeros((N, 2), np.float32)
events = []
def put(frame, name, gain, pitch=1.0):
    x = clip(name)
    if pitch != 1.0:
        idx = np.arange(0, len(x) - 1, pitch); x = np.stack([np.interp(idx, np.arange(len(x)), x[:, c]) for c in range(2)], 1)
    o = int(frame / FPS * SR)
    if o >= N: return
    n = min(len(x), N - o); sfx[o:o + n] += x[:n] * gain
    events.append((frame, name, gain))

def m(d, k, fb):
    return d['p'].get('m', {}).get(k, fb)

for d in defs:
    s, k, F = d['id'], d['kind'], first[d['id']]
    at = lambda off, name, g, pitch=1.0: put(F + off, name, g, pitch)
    if k == 'hook_call':
        E = m(d, 'Except', 88); P = min(E + 10, 100)
        at(4, 'notif', .22); at(E, 'glitch', .42); at(E, 'drone_hit', .32); at(P, 'title_boom', .3); at(P + 6, 'stamp', .3)
    elif k == 'hook_400':
        Fo = m(d, 'four', 130); at(max(0, Fo - 40), 'counter_tick', .2); at(Fo - 6, 'select_draw', .2); at(m(d, 'North', 40), 'pop', .18)
    elif k == 'twist':
        at(0, 'select_draw', .15); at(m(d, 'not', 58) + 2, 'stamp', .45)
    elif k == 'evidence':
        a = list(d['p']['m'].values())[0] if d['p'].get('m') else 8
        at(0, 'swoosh', .16); at(max(6, a - 4), 'select_draw', .2)
    elif k == 'title':
        at(1, 'title_boom', .55); at(1, 'drone_hit', .25)
    elif k in ('victimA', 'bigtext', 'checklist', 'compromised'):
        at(0, 'swoosh', .16)
        if k == 'checklist':
            for r in ('r1', 'r2', 'r3', 'r4', 'r5'): at(m(d, r, 0), 'pop', .2, 1.1)
        if k == 'compromised':
            for r in ('c1', 'c2', 'c3'): at(m(d, r, 0), 'pop', .22, 0.95)
    elif k == 'scan':
        at(4, 'counter_tick', .14)
    elif k == 'lock':
        at(4, 'switch_off', .3)
    elif k == 'rec_wait':
        at(20, 'ui_click', .3)
    elif k == 'become':
        at(10, 'glitch', .25)
    elif k == 'fanout':
        for i in range(12): at(6 + i * 3 + 12, 'pop', .1 + .06 * (i % 3) / 2, 0.9 + 0.03 * i)
    elif k == 'bubbles':
        at(m(d, 'c1', 8) - 4, 'pop', .25); at(m(d, 'c2', 38) - 4, 'pop', .25, 1.1)
    elif k == 'history':
        tl_ = m(d, 'tailored', 120); at(tl_ - 24, 'select_draw', .2); at(tl_ - 10, 'notif', .26)
    elif k == 'calendar':
        at(0, 'notif', .26)
    elif k == 'clock':
        at(0, 'counter_tick', .12); at(30, 'notif', .28)
    elif k == 'domains':
        A = m(d, 'alike', 70); at(0, 'swoosh', .16); at(8, 'select_draw', .2); at(A, 'pop', .25); at(A + 8, 'pop', .25, 1.1)
    elif k == 'twin':
        at(m(d, 'copycat', 20), 'glitch', .28)
    elif k == 'lobby2':
        at(m(d, 'admitted', 40), 'ui_click', .35)
    elif k == 'playback':
        at(0, 'ui_click', .4)
    elif k == 'tiles':
        for i in range(6): at(i * 6, 'pop', .12 + .02 * (i % 3), 0.95 + 0.04 * i)
    elif k == 'from_friend':
        A = m(d, 'audio', 100); at(A - 4, 'notif', .3); at(A + 26, 'buzzer', .14)
    elif k == 'steps':
        for i, r in enumerate(('s1', 's2', 's3')): at(m(d, r, 60) - 4, 'pop', .24, 1 + .08 * i)
    elif k == 'terminal':
        at(0, 'typing', .18); at(20, 'glitch', .3); at(30, 'stamp', .5)
    elif k == 'icons4':
        for i, r in enumerate(('i1', 'i2', 'i3', 'i4')): at(m(d, r, 30) - 4, 'pop', .22, 0.85 + .05 * i)
    elif k == 'rewind':
        at(0, 'rewind', .22)
    elif k == 'you_next':
        N_ = m(d, 'next', 30); at(N_, 'glitch', .3); at(N_, 'drone_hit', .26)
    elif k == 'chain':
        for i in range(14): at(10 + i * 6, 'pop', .1 + .05 * (i % 3) / 2, 0.85 + 0.03 * i)
    elif k == 'months':
        at(0, 'counter_tick', .14)
    elif k == 'grid900':
        Nn = m(d, 'nine', 80); at(max(0, Nn - 30), 'counter_tick', .22); at(10, 'select_draw', .18)
    elif k == 'ai':
        at(0, 'drone_hit', .25)
    elif k == 'morph':
        at(m(d, 'deepfake', 120) - 10, 'glitch', .18)
    elif k == 'enough':
        at(34, 'drone_hit', .3)
    elif k == 'lib':
        at(0, 'drone_hit', .3); at(m(d, 'Earlier', 40), 'swoosh', .16); at(m(d, 'maintainer', 120), 'pop', .2)
    elif k == 'follow':
        at(0, 'notif', .2)
    elif k == 'deps':
        at(24, 'glitch', .15)
    elif k == 'tens':
        at(0, 'counter_tick', .2)
    elif k == 'names':
        at(m(d, 'Sapphire', 160) - 6, 'select_draw', .2)
        for r in ('Sapphire', 'BlueNoroff', 'APT'): at(m(d, r, 0), 'pop', .2)
    elif k == 'cta':
        at(0, 'pop', .3)
    elif k == 'end':
        at(30, 'drone_hit', .35); at(30, 'glitch', .25)
os.makedirs(STEMS, exist_ok=True)
write(os.path.join(STEMS, 'sfx.wav'), sfx)

# ---------------------------------------------------------------- music bed (the episode's underscore, looped with crossfades)
src = load(os.path.join(ROOT, 'library', 'sfx', 'music-93f5c63f.mp3'))
xf = int(1.2 * SR)
bed = np.zeros((N + len(src), 2), np.float32)
o, step = 0, len(src) - xf
ramp_in = np.linspace(0, 1, xf)[:, None]; ramp_out = ramp_in[::-1]
while o < N:
    seg = src.copy()
    if o > 0: seg[:xf] *= ramp_in
    seg[-xf:] *= ramp_out
    bed[o:o + len(seg)] += seg
    o += step
bed = bed[:N]
env = np.ones(N, np.float32)
fi = int(1.5 * SR); env[:fi] = np.linspace(0.35, 1, fi)        # under the cold open, then up
fo = int(4.0 * SR); env[-fo:] = np.linspace(1, 0, fo) ** 1.5    # fade with the end card
bed *= env[:, None]
write(os.path.join(STEMS, 'music.wav'), bed)

# ---------------------------------------------------------------- mix + master
vi, _ = lufs(os.path.join(STEMS, 'voice.wav'))
mi, _ = lufs(os.path.join(STEMS, 'music.wav'))
voice_g = -18.0 - vi            # voice stem to -18 LUFS before the master gain
music_g = -29.5 - mi            # bed ~11.5 LU under the voice, more when ducked
pre = os.path.join(STEMS, 'premix.wav')
graph = (f'[0:a]volume={voice_g:.2f}dB,pan=stereo|c0=c0|c1=c0,asplit=2[v][key];'
         f'[1:a]volume={music_g:.2f}dB[mus];'
         f'[mus][key]sidechaincompress=threshold=0.03:ratio=4:attack=40:release=450:makeup=1[duck];'
         f'[2:a]volume=-3dB[fx];'
         f'[v][duck][fx]amix=inputs=3:normalize=0:duration=first[out]')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', os.path.join(STEMS, 'voice.wav'), '-i', os.path.join(STEMS, 'music.wav'), '-i', os.path.join(STEMS, 'sfx.wav'),
                '-filter_complex', graph, '-map', '[out]', '-c:a', 'pcm_f32le', pre], check=True)
pi, ptp = lufs(pre)
out = os.path.join(ROOT, 'public', 'facestealer', 'master.wav')
gain = TARGET_I - pi
for it in range(4):
    # gain to target, then a true-peak-safe limiter (oversampled 4x so inter-sample peaks are caught)
    lim = 10 ** ((TARGET_TP - 0.4) / 20)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', pre, '-af',
                    f'volume={gain:.3f}dB,aresample=192000,alimiter=limit={lim:.4f}:attack=2:release=60:level=disabled,aresample=48000',
                    '-c:a', 'pcm_s24le', out], check=True)
    I, TP = lufs(out)
    print(f'pass {it + 1}: gain {gain:+.2f} dB -> I {I:.1f} LUFS, TP {TP:.1f} dBTP')
    if abs(I - TARGET_I) <= 0.2 and TP <= TARGET_TP: break
    gain += TARGET_I - I
print(f'{len(events)} sfx events; voice stem {vi:.1f} LUFS, premix {pi:.1f} LUFS (TP {ptp:.1f}); master -> {out}')
