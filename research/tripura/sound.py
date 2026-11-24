"""Sound for "हम त्रिपुर थे" (adapted from research/tripura/sound.py): an original drone bed, SFX on the shots and marks, ducking, and the master.
Adapted from research/facestealer/v2/sound_v2.py.

  python research/tripura/sound.py     (from the repo root, after plan.py; needs ffmpeg, numpy, scipy)

Everything here is either synthesised in this file (the tanpura-style drone bed, wind, earth rumble, temple bells, the
bowstring, thunder, heartbeat, the gold-dust shimmer, drops) or one of three fitting clips from library/sfx
(drone_hit, title_boom, fall_whoosh). No third-party audio. See CREDITS.md.

Stems go to research/tripura/stems/ (not committed: rebuilt from the TTS takes and this script).
The master goes to public/tripura/master.wav (48 kHz stereo, -16 LUFS integrated, true peak <= -1.5 dBTP) and,
losslessly, to public/tripura/master.flac, which the film plays and which is committed.
"""
import glob, json, os, re, subprocess
import numpy as np
from scipy.signal import butter, sosfilt

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
EP = os.path.join(ROOT, 'src', 'episodes', 'tripura')
STEMS = os.path.join(HERE, 'stems')
SR, FPS = 48000, 30
TARGET_I, TARGET_TP = -16.0, -1.5
rng = np.random.default_rng(108)

tl = json.load(open(os.path.join(EP, 'timeline.json')))
defs = json.load(open(os.path.join(EP, 'defs.json')))
first = {s['id']: s['first'] for s in tl['shots']}
length = {s['id']: s['len'] for s in tl['shots']}
N = int(tl['total'] / FPS * SR)
sec = lambda f: f / FPS

def load(path, ch=2):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', str(ch), '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, ch).copy()

def lufs(path):
    out = subprocess.run(['ffmpeg', '-nostats', '-i', path, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
    return float(re.findall(r'I:\s+(-?[\d.]+) LUFS', out)[-1]), float(re.findall(r'Peak:\s+(-?[\d.]+) dBFS', out)[-1])

def write(path, x):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', str(x.shape[1]), '-i', '-', '-c:a', 'pcm_s24le', path], input=x.astype(np.float32).tobytes(), check=True)

# ---------------------------------------------------------------- synthesis kit (mono, peak ~1)
def T(d): return np.arange(int(d * SR)) / SR
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], 'band', fs=SR, output='sos'), x)
def norm(x): return x / (np.abs(x).max() + 1e-9)
def env(n, a, r, shape=2.0):
    """attack a seconds, exponential-ish release over the rest."""
    e = np.ones(n); na = max(1, int(a * SR)); e[:na] = np.linspace(0, 1, na)
    tail = np.linspace(0, 1, n - na); e[na:] = (1 - tail) ** shape
    return e
def noise(d): return rng.standard_normal(int(d * SR))
def smooth(x, n):
    """moving average over n samples (cumulative sum: O(len), unlike np.convolve with a long kernel)."""
    c = np.cumsum(np.concatenate([np.zeros(n // 2 + 1), x, np.full(n // 2, x[-1])]))
    return (c[n:n + len(x)] - c[:len(x)]) / n
def brown(d):
    x = np.cumsum(noise(d)); return hp(x - x.mean(), 15)

def wind(d, lo=180, hi=1400):
    x = bp(noise(d), lo, hi)
    t = T(d); gust = 0.55 + 0.45 * np.sin(2 * np.pi * 0.11 * t + 1.3) * np.sin(2 * np.pi * 0.037 * t)
    return norm(x * gust)
def rumble(d, a=0.4, f=110):
    return norm(lp(brown(d), f, 4)) * env(int(d * SR), a, d - a, 1.5)
def thump(f0=55, d=0.9):
    t = T(d); f = f0 * (1 + 1.2 * np.exp(-t * 18)); ph = 2 * np.pi * np.cumsum(f) / SR
    return norm(np.sin(ph) * np.exp(-t * 4.5) + 0.25 * lp(noise(d), 900) * np.exp(-t * 40))
def heartbeat():
    a, b = thump(48, 0.45), thump(44, 0.5) * 0.7
    out = np.zeros(int(0.9 * SR)); out[:len(a)] += a; o = int(0.24 * SR); out[o:o + len(b)] += b
    return norm(out)
def crack(d=2.8):
    """vajra: a bright tearing crack and a long thunder roll."""
    n = int(d * SR); t = T(d)
    hit = hp(noise(0.09), 1800) * np.exp(-T(0.09) * 40)
    roll = lp(brown(d), 300, 2) * np.exp(-t * 1.3) * (1 + 0.5 * np.sin(2 * np.pi * 3.1 * t))
    out = norm(roll) * 0.9; out[:len(hit)] += norm(hit) * 1.2
    return norm(out)
def bell(f0, d=6.0, bright=1.0):
    """a temple bell (ghanta): inharmonic partials, each a detuned pair so it beats as it decays."""
    t = T(d); out = np.zeros_like(t)
    for ratio, amp, dec in ((0.5, 0.5, 0.5), (1, 1, 0.8), (2.0, 0.6 * bright, 1.2), (2.76, 0.45 * bright, 1.6), (5.4, 0.25 * bright, 2.6), (8.93, 0.12 * bright, 3.8)):
        for det in (-0.6, 0.6):
            out += amp * np.sin(2 * np.pi * (f0 * ratio + det) * t) * np.exp(-t * dec)
    out[:int(0.004 * SR)] += hp(noise(0.004), 3000) * 0.6
    return norm(out)
def twang(f0=73.4, d=3.0):
    """the great bowstring: Karplus-Strong, low and long."""
    n = int(d * SR); p = int(SR / f0); buf = rng.uniform(-1, 1, p); out = np.zeros(n)
    for i in range(n):
        out[i] = buf[i % p]; buf[i % p] = 0.996 * 0.5 * (buf[i % p] + buf[(i + 1) % p])
    return norm(out * env(n, 0.002, d, 1.2))
def shimmer(d=2.5, lo=2200, hi=6500, rate=28):
    """gold dust: many tiny high sine glints."""
    n = int(d * SR); out = np.zeros(n)
    for _ in range(int(rate * d)):
        o = int(rng.uniform(0, d - 0.3) * SR); f = rng.uniform(lo, hi); g = T(0.3)
        out[o:o + len(g)] += np.sin(2 * np.pi * f * g) * np.exp(-g * 14) * rng.uniform(0.3, 1)
    return norm(out * env(n, 0.3, d, 1.0))
def plink(f0=900):
    t = T(0.5); f = f0 * (1 + 0.6 * np.exp(-t * 30)); ph = 2 * np.pi * np.cumsum(f) / SR
    return norm(np.sin(ph) * np.exp(-t * 9))
def whoosh(d=1.2, up=True):
    n = int(d * SR); x = noise(d); t = np.linspace(0, 1, n)
    e = np.sin(np.pi * t) ** 2; out = np.zeros(n); step = 2400
    for i in range(0, n, step):  # a band sweeping up (or down)
        c = 300 + 2500 * (t[i] if up else 1 - t[i]); seg = x[i:i + step]
        out[i:i + len(seg)] = bp(seg, c * 0.6, min(c * 1.6, 20000))
    return norm(out * e)
def suction(d=2.0):
    return norm(whoosh(d, up=True)[::-1] * np.linspace(0.2, 1, int(d * SR)))
def swell(d=4.0, cut=False):
    t = T(d); x = np.sin(2 * np.pi * 36.7 * t) * 0.8 + 0.6 * norm(lp(brown(d), 160, 4))
    e = (t / d) ** 2.2 if cut else np.sin(np.pi * t / d) ** 1.5
    return norm(x * e)
def growl(d=1.6):
    """the lion: a band of noise with a fast flutter, in a swelling envelope."""
    t = T(d); x = bp(noise(d), 110, 700, 3) * (1 + 0.8 * np.sin(2 * np.pi * 28 * t)) * (0.6 + 0.4 * np.sin(2 * np.pi * 3.3 * t))
    return norm(x * env(len(t), 0.25, d, 1.2))
def crackle(d=2.0):
    n = int(d * SR); out = np.zeros(n)
    for _ in range(int(40 * d)):
        o = int(rng.uniform(0, d - 0.02) * SR); out[o:o + 200] += hp(noise(200 / SR), 2000) * rng.uniform(0.2, 1) * np.exp(-np.arange(200) / 40)
    return norm(out + 0.3 * norm(lp(brown(d), 200)))

LIB = {os.path.basename(f).rsplit('-', 1)[0]: f for f in glob.glob(os.path.join(ROOT, 'library', 'sfx', '*.mp3'))}
_lib = {}
def lib(name):
    if name not in _lib:
        x = load(LIB[name]); _lib[name] = x / (np.abs(x).max() + 1e-9)
    return _lib[name]

# ---------------------------------------------------------------- placing
sfx = np.zeros((N, 2), np.float32)
events = []
_cache = {}
def put(frame, snd, gain, pan=0.0, pitch=1.0, key=None):
    """snd: a library clip name, or a mono/stereo array. pan -1..1."""
    if isinstance(snd, str):
        x = lib(snd); name = snd
    else:
        x = snd; name = key or 'synth'
        if x.ndim == 1:
            l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
            x = np.stack([x * l * 1.41, x * r * 1.41], 1)
    if pitch != 1.0:
        idx = np.arange(0, len(x) - 1, pitch); x = np.stack([np.interp(idx, np.arange(len(x)), x[:, c]) for c in range(2)], 1)
    o = int(sec(frame) * SR)
    if o >= N or o < 0: return
    n = min(len(x), N - o); sfx[o:o + n] += x[:n] * gain
    events.append((frame, name, round(gain, 3)))
def S(key, fn, *a):
    k = (key,) + a
    if k not in _cache: _cache[k] = fn(*a)
    return _cache[k]
m = lambda d, k, fb: d['p'].get('m', {}).get(k, fb)

D = 73.42  # Sa = D2; the drone and every bell are tuned to it
def fire(d=6.0):
    """a city burning: a low roar of brown noise with a slow surge, and crackle on top."""
    t = T(d); roar = lp(brown(d), 380, 3) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.4 * t + 1) * np.sin(2 * np.pi * 0.13 * t))
    return norm(norm(roar) * 0.8 + crackle(d) * 0.5) * env(len(t), 0.6, d, 0.6)
def sizzle(d=3.0):
    """molten metal: a bright hiss with bubbling."""
    t = T(d); x = hp(noise(d), 3000) * (0.6 + 0.4 * np.abs(np.sin(2 * np.pi * 7 * t)))
    return norm(x * env(len(t), 0.2, d, 1.0))
def chant(d=4.0):
    """a soft hum of many voices on Sa and Pa (the japa)."""
    t = T(d); x = sum(np.sin(2 * np.pi * D * 2 * r * (1 + rng.uniform(-0.004, 0.004)) * t) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.7 * t + k)) for k, r in enumerate((1, 1, 1.5, 2, 1.5, 1)))
    return norm(lp(x, 1200)) * env(len(t), 0.8, d, 1.0)
for d in defs:
    k, F, L = d['kind'], first[d['id']], length[d['id']]
    at = lambda off, snd, g, pan=0.0, pitch=1.0, key=None: put(F + off, snd, g, pan, pitch, key)
    if k == 'open_card':
        at(8, S('swell', swell, 5.0), .25); at(20, S('bell', bell, D * 4, 7.0, 0.8), .16); at(30, S('shim', shimmer, 4.0), .07)
    elif k == 'sky3' and d['p'].get('mode') == 'intro':
        for i, mk in enumerate(('gold', 'silver', 'iron')): at(m(d, mk, 20 + 40 * i), S('bl', bell, D * 8 * (1, 6 / 5, 3 / 2)[i], 4.0, 0.6), .13, pan=-0.5 + 0.5 * i)
    elif k == 'names':
        at(m(d, 'tri', 60), 'drone_hit', .25); at(m(d, 'ari', 140) - 2, 'title_boom', .4)
    elif k == 'title_card':
        at(4, 'title_boom', .5); at(8, S('bellBig', bell, D * 2, 10.0, 1.0), .22)
    elif k == 'taraka':
        at(m(d, 'kama', 200), S('crack', crack, 2.8), .3); at(m(d, 'kama', 200), S('fire', fire, 3.0), .2)
    elif k == 'skanda':
        at(m(d, 'kill', 50) - 20, 'fall_whoosh', .3, pan=0.4); at(m(d, 'kill', 50), 'drone_hit', .35); at(m(d, 'kill', 50) + 4, S('shimL', shimmer, 4.0), .1)
    elif k == 'sons':
        for i, mk in enumerate(('tk', 'vm', 'km')): at(m(d, mk, 40 + 40 * i), S('th', thump, 50, 0.9), .25, pan=-0.5 + 0.5 * i)
    elif k == 'tapas':
        for mk in ('foot', 'air', 'head'): at(m(d, mk, 100), S('bl', bell, D * 4, 4.0, 0.6), .08)
    elif k in ('brahma_appears', 'evamastu'):
        at(m(d, 'b', m(d, 'ev', 20)), S('bellBig', bell, D * 2, 10.0, 1.0), .2); at(m(d, 'b', m(d, 'ev', 20)), S('shimL', shimmer, 4.0), .1)
    elif k == 'mock':
        at(0, S('rum', rumble, 3.5, 1.2), .25)
    elif k == 'condition':
        at(m(d, 'clouds', 200), S('crack', crack, 2.8), .25, pan=0.3); at(m(d, 'line', 300), 'drone_hit', .3)
    elif k == 'impossible':
        at(m(d, 'die', 200), 'title_boom', .3, pitch=0.85)
    elif k == 'maya':
        for i in range(4): at(10 + i * 12, S('pl', plink, 500), .1)
    elif k == 'inside':
        at(m(d, 'linga', 150), S('bell', bell, D * 4, 7.0, 0.8), .12); at(m(d, 'fire', 200), S('crk', crackle, 2.0), .08)
    elif k == 'conquer':
        at(0, S('rumL', rumble, 6.0, 2.0), .45); at(m(d, 'amaravati', 40), 'drone_hit', .3)
    elif k == 'command':
        at(m(d, 'rain', 80), S('crack', crack, 2.8), .22)
    elif k == 'strength':
        at(m(d, 'weak', 100) - 10, S('th', thump, 50, 0.9), .3)
    elif k == 'three_strengths':
        for mk in ('a', 'b', 'c'): at(m(d, mk, 100), S('bl', bell, D * 8, 4.0, 0.6), .1)
    elif k == 'kailasa':
        at(0, S('bellBig', bell, D * 2, 10.0, 1.0), .16); at(m(d, 'no', 250), 'drone_hit', .26)
    elif k == 'bhutas':
        at(m(d, 'rise', 90), S('fire', fire, 3.0), .22); at(m(d, 'burn', 220), S('shim', shimmer, 2.5), .12)
    elif k == 'understand':
        at(m(d, 'fall', 200), S('crack', crack, 2.8), .2)
    elif k == 'mundi_born':
        at(30, S('swl', swell, 4.0), .25); at(m(d, 'dharma', 430), 'drone_hit', .2, pitch=0.8)
    elif k == 'mundi_name':
        at(m(d, 'name', 50), 'title_boom', .3, pitch=0.8); at(m(d, 'poison', 310), S('swC', swell, 2.6, True), .35)
    elif k == 'narada_cert':
        at(m(d, 'believe', 380), 'drone_hit', .28, pitch=0.8)
    elif k == 'doctrine':
        at(m(d, 'fire', 300), S('suc', suction, 3.0), .15)
    elif k == 'proclaim':
        at(m(d, 'rel', 60) - 4, 'title_boom', .4, pitch=0.75); at(m(d, 'take', 200), 'drone_hit', .3, pitch=0.7)
    elif k == 'abandon':
        at(m(d, 'linga', 10) + 30, S('th', thump, 40, 1.0), .45); at(m(d, 'linga', 10) + 32, S('ring', bell, D * 6, 2.5, 1.4), .1)
    elif k == 'alakshmi':
        at(0, S('swL', swell, 8.0), .3)
    elif k == 'fault':
        at(m(d, 'ours', 110), 'drone_hit', .3, pitch=0.8)
    elif k == 'japa':
        at(0, S('chant', chant, 5.0), .3)
    elif k == 'mantra':
        at(m(d, 'om', 70) - 10, S('chantL', chant, 8.0), .35); at(m(d, 'appear', 240), S('bellBig', bell, D * 2, 10.0, 1.0), .2)
    elif k == 'kumbhodara':
        for i in range(3): at(m(d, 'beat', 190) + i * 12, S('th', thump, 70, 0.6), .3)
    elif k == 'wheels':
        at(m(d, 'sun', 30), S('ring', bell, D * 6, 2.5, 1.4), .12); at(m(d, 'moon', 130), S('ring', bell, D * 5, 2.5, 1.4), .12)
    elif k == 'driver':
        for i in range(6): at(20 + i * 18, S('th', thump, 60, 0.6), .12, pan=0.4)
    elif k == 'bow':
        at(m(d, 'shesha', 40), S('tw', twang, D, 3.0), .3, pan=-0.3); at(m(d, 'sarasvati', 90), S('bell', bell, D * 4, 7.0, 0.8), .16)
        at(m(d, 'agni', 240), S('fire', fire, 3.0), .14)
    elif k == 'horses_fall':
        at(m(d, 'fall', 80), S('rumL', rumble, 6.0, 2.0), .55); at(m(d, 'fall', 80), 'drone_hit', .35, pitch=0.8)
    elif k == 'shesha_bull':
        at(m(d, 'lift', 80), S('rum', rumble, 3.5, 1.2), .4); at(m(d, 'knees', 110), S('th', thump, 40, 1.0), .4)
    elif k == 'vishnu_bull':
        at(m(d, 'bull', 70), S('rumL', rumble, 6.0, 2.0), .35); at(m(d, 'verse', 160), S('bell', bell, D * 4, 7.0, 0.8), .14)
    elif k == 'pashupati':
        at(m(d, 'name', 300) - 2, 'title_boom', .35)
    elif k == 'ascend':
        at(0, 'fall_whoosh', .25, pitch=0.7); at(m(d, 'laugh', 110), S('rum', rumble, 3.5, 1.2), .2)
    elif k == 'stand':
        at(0, S('swL', swell, 8.0), .35)
    elif k == 'ganesha':
        at(m(d, 'voice', 160), S('bellBig', bell, D * 2, 10.0, 1.0), .2); at(m(d, 'puja', 330), S('shimL', shimmer, 4.0), .12)
    elif k == 'merge':
        at(m(d, 'one', 60) - 30, S('swC', swell, 2.6, True), .5); at(m(d, 'one', 60), 'title_boom', .55); at(m(d, 'one', 60), S('bellBig', bell, D * 2, 10.0, 1.0), .25)
    elif k == 'eye':
        at(m(d, 'red', 120), S('swl', swell, 4.0), .4); at(m(d, 'lid', 160), S('fire', fire, 3.0), .2)
    elif k == 'plead':
        at(m(d, 'laugh', 210), S('shimL', shimmer, 4.0), .12)
    elif k == 'draw':
        at(m(d, 'draw', 80), S('whU', whoosh, 1.6, True), .12, pan=-0.3); at(m(d, 'twang', 120), S('tw', twang, D, 3.0), .6, pan=-0.3)
        at(m(d, 'name', 160), S('bellBig', bell, D * 2, 10.0, 1.0), .22)
        at(m(d, 'release', 230) - 6, 'fall_whoosh', .4, pitch=0.8); at(m(d, 'release', 230), S('crack', crack, 2.8), .6); at(m(d, 'release', 230), 'title_boom', .55)
    elif k == 'melt_gold':
        at(0, S('fireL', fire, 10.0), .55); at(m(d, 'melt', 40), S('siz', sizzle, 3.0), .2); at(m(d, 'skin', 190) - 20, S('siz', sizzle, 3.0), .22)
    elif k == 'melt_silver':
        at(0, S('fireL', fire, 10.0), .5); at(10, S('siz', sizzle, 3.0), .25)
    elif k == 'melt_iron':
        at(0, S('fireL', fire, 10.0), .55); at(m(d, 'white', 60), S('crack', crack, 2.8), .4); at(m(d, 'scream', 100), S('swC', swell, 2.6, True), .3)
    elif k in ('runners', 'mothers', 'everything'):
        at(0, S('fireL', fire, 10.0), .55 if k != 'mothers' else .4)
        if k == 'everything': at(m(d, 'nothing', 140), 'drone_hit', .4, pitch=0.7); at(0, S('rumX', rumble, 8.0, 3.0), .4)
    elif k == 'tk_prayer':
        at(0, S('fireL', fire, 10.0), .35); at(m(d, 'bhava', 100), S('bell', bell, D * 4, 7.0, 0.8), .14)
    elif k == 'ashfall':
        at(m(d, 'ash', 80), S('th', thump, 40, 1.0), .5); at(m(d, 'ash', 80), S('rumL', rumble, 6.0, 2.0), .4)
        for i in range(5): at(m(d, 'drums', 120) + i * 9, S('th', thump, 60, 0.6), .25)
        at(m(d, 'flowers', 200), S('shimL', shimmer, 4.0), .14)
    elif k == 'maya_vitala':
        at(m(d, 'ganas', 280), S('shim', shimmer, 2.5), .1)
    elif k == 'patanjali':
        at(6, S('bellBig', bell, D * 2, 10.0, 1.0), .22)
    elif k == 'within':
        for i, mk in enumerate(('sthula', 'sukshma', 'karana')): at(m(d, mk, 50 + 30 * i), S('bl', bell, D * 8 * (1, 5 / 4, 3 / 2)[i], 4.0, 0.6), .1)
    elif k == 'turiya':
        at(m(d, 'witness', 80), S('shimL', shimmer, 4.0), .12)
    elif k == 'tula':
        at(m(d, 'sits', 300), S('th', thump, 50, 0.9), .2); at(m(d, 'still', 390), S('bell', bell, D * 4, 7.0, 0.8), .12)
    elif k == 'arrow_in':
        at(m(d, 'arrow', 100) - 6, 'fall_whoosh', .3); at(m(d, 'burn', 180), S('fire', fire, 3.0), .25); at(m(d, 'burn', 180), S('bellBig', bell, D * 2, 10.0, 1.0), .2)
    elif k == 'fruit':
        at(m(d, 'free', 230) + 28, S('th', thump, 70, 0.7), .2)
    elif k == 'night':
        for i in range(11): at(m(d, 'eleven', 110) + i * 8, S('pl', plink, 600), .06)
    elif k == 'final':
        at(m(d, 'ari', 50), S('bellBig', bell, D * 2, 10.0, 1.0), .28); at(m(d, 'ari', 50), S('shimL', shimmer, 4.0), .14)
    elif k == 'closing':
        at(20, S('bell', bell, D * 4, 7.0, 0.8), .12)
os.makedirs(STEMS, exist_ok=True)

# ambience: night wind in the sky shots; none in the doctrine; the fire bed carries the burning
amb = np.zeros(N)
w = wind(N / SR + 1)[:N]
lvl = np.zeros(N)
def span(kinds, g):
    for d in defs:
        if d['kind'] in kinds:
            a = int(sec(first[d['id']]) * SR); b = int(sec(first[d['id']] + length[d['id']]) * SR); lvl[a:b] = g
span(('sky3', 'question', 'taraka', 'skanda', 'sons', 'nolearn', 'tapas', 'ask', 'mock', 'assign', 'condition', 'conquer', 'command', 'strength', 'kailasa',
      'bhutas', 'hesitate', 'driver', 'laugh_chariot', 'horses_fall', 'shesha_bull', 'vishnu_bull', 'ascend', 'stand', 'merge', 'draw', 'ashfall', 'mundis_desert'), 0.6)
lvl = smooth(lvl, SR)
amb = w * lvl
sfx += np.stack([amb * 0.06, np.roll(amb, 900) * 0.06], 1).astype(np.float32)
write(os.path.join(STEMS, 'sfx.wav'), sfx)

# ---------------------------------------------------------------- music: an original tanpura-style drone bed
def pluck(f0, d=4.5):
    """one tanpura string: rich harmonics with the jivari's moving bright band."""
    t = T(d); out = np.zeros_like(t)
    for n in range(1, 28):
        centre = 4 + 14 * (1 - np.exp(-t * 0.8))  # the buzz climbs the harmonics as the string rings
        a = (1 / n ** 0.7) * (0.35 + np.exp(-((n - centre) ** 2) / 10))
        out += a * np.sin(2 * np.pi * f0 * n * t + n) * np.exp(-t * (0.5 + n * 0.03))
    return norm(lp(out, 5000)) * env(len(t), 0.01, d, 1.1)
strings = {'Pa': pluck(D * 1.5), 'Sa1': pluck(D * 2), 'Sa2': pluck(D * 2 * 1.002), 'Sa': pluck(D)}
tan = np.zeros((N + 12 * SR, 2))
cyc, f, i = 4.4, 0.0, 0
while f < N / SR:
    for j, (s, pan) in enumerate((('Pa', -0.3), ('Sa1', 0.1), ('Sa2', 0.3), ('Sa', -0.1))):
        o = max(0, int((f + j * cyc / 4 + rng.uniform(-0.02, 0.02)) * SR)); x = strings[s] * rng.uniform(0.85, 1.0)
        l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        n = min(len(x), len(tan) - o)
        if n > 0: tan[o:o + n, 0] += x[:n] * l; tan[o:o + n, 1] += x[:n] * r
    f += cyc
tan = tan[:N]
# a low pad (Sa and Pa, slowly breathing) and, for the last chapter, a high warm pad (Sa, Ga, Pa) that resolves the film
t = np.arange(N) / SR
pad = (np.sin(2 * np.pi * D / 2 * t) * 0.6 + np.sin(2 * np.pi * D * 0.75 * t) * 0.25 + np.sin(2 * np.pi * D * t) * 0.3) * (0.75 + 0.25 * np.sin(2 * np.pi * 0.05 * t))
warm = sum(np.sin(2 * np.pi * D * 4 * r * t + k) for k, r in enumerate((1, 5 / 4, 3 / 2, 2))) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.07 * t))
warm = lp(warm, 2500)
# levels per shot kind (tanpura, low pad, warm pad), smoothed
LV = dict(open_card=(0, .5, .3), title_card=(.5, .5, .4), closing=(.3, .2, .8),
          kailasa=(.6, .4, .5), evamastu=(.6, .5, .4), brahma_appears=(.5, .5, .5),
          doctrine=(0, .8, 0), body_food=(0, .9, 0), caste=(0, .8, 0), proclaim=(0, 1, 0), abandon=(0, .9, 0), wives=(0, 1, 0), alakshmi=(0, .9, 0), fault=(.2, .7, 0),
          stand=(.2, .8, 0), merge=(0, 1, 0), eye=(0, 1, 0), plead=(.3, .6, .4), draw=(0, 1, 0),
          melt_gold=(0, .9, 0), melt_silver=(0, .9, 0), melt_iron=(0, .9, 0), runners=(0, .9, 0), mothers=(0, .7, 0), everything=(0, 1, 0), tk_prayer=(.2, .6, .4),
          ashfall=(.2, .4, .4), maya_vitala=(.4, .3, .5), patanjali=(.5, .3, .8), within=(.5, .3, .8), turiya=(.5, .3, .9), tula=(.5, .3, .8), arrow_in=(.3, .5, .9),
          fruit=(.5, .3, .9), night=(.4, .2, .8), final=(.4, .3, 1.0))
lv = np.zeros((N, 3))
for d in defs:
    a = int(sec(first[d['id']]) * SR); b = int(sec(first[d['id']] + length[d['id']]) * SR)
    lv[a:b] = LV.get(d['kind'], (.7, .6, 0))
for c in range(3): lv[:, c] = smooth(lv[:, c], 2 * SR)
lv[-int(3 * SR):] *= np.linspace(1, 0, int(3 * SR))[:, None] ** 1.5
music = tan * lv[:, :1] * 0.5 + np.stack([pad, pad], 1) * lv[:, 1:2] * 0.35 + np.stack([warm, np.roll(warm, 1200)], 1) * lv[:, 2:3] * 0.06
write(os.path.join(STEMS, 'music.wav'), music)

# ---------------------------------------------------------------- mix + master
voice = os.path.join(STEMS, 'voice.wav')
vi, _ = lufs(voice); mi, _ = lufs(os.path.join(STEMS, 'music.wav'))
voice_g = -18.0 - vi
music_g = -30.0 - mi           # the bed ~12 LU under the voice, more when ducked
pre = os.path.join(STEMS, 'premix.wav')
graph = (f'[0:a]volume={voice_g:.2f}dB,pan=stereo|c0=c0|c1=c0,asplit=2[v][key];'
         f'[1:a]volume={music_g:.2f}dB[mus];'
         f'[mus][key]sidechaincompress=threshold=0.03:ratio=3:attack=60:release=600:makeup=1[duck];'
         f'[2:a]volume=-5dB[fx];'
         f'[v][duck][fx]amix=inputs=3:normalize=0:duration=first[out]')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', voice, '-i', os.path.join(STEMS, 'music.wav'), '-i', os.path.join(STEMS, 'sfx.wav'),
                '-filter_complex', graph, '-map', '[out]', '-c:a', 'pcm_f32le', pre], check=True)
pi, ptp = lufs(pre)
os.makedirs(os.path.join(ROOT, 'public', 'tripura'), exist_ok=True)
out = os.path.join(ROOT, 'public', 'tripura', 'master.wav')
gain = TARGET_I - pi
for it in range(5):
    lim = 10 ** ((TARGET_TP - 0.5) / 20)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', pre, '-af',
                    f'volume={gain:.3f}dB,aresample=192000,alimiter=limit={lim:.4f}:attack=2:release=60:level=disabled,aresample=48000',
                    '-c:a', 'pcm_s24le', out], check=True)
    I, TP = lufs(out)
    print(f'pass {it + 1}: gain {gain:+.2f} dB -> I {I:.1f} LUFS, TP {TP:.1f} dBTP')
    if abs(I - TARGET_I) <= 0.2 and TP <= TARGET_TP: break
    gain += TARGET_I - I
# the committed copy: lossless FLAC (the WAV is over GitHub's 100 MB file limit); the timeline plays this one
flac = os.path.join(ROOT, 'public', 'tripura', 'master.flac')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', out, '-c:a', 'flac', '-compression_level', '8', '-sample_fmt', 's32', flac], check=True)
json.dump(dict(events=events, voice_lufs=vi, premix_lufs=pi, master=dict(I=I, TP=TP)), open(os.path.join(STEMS, 'sound_log.json'), 'w'), indent=0, ensure_ascii=False)
print(f'{len(events)} sfx events; voice stem {vi:.1f} LUFS, premix {pi:.1f} LUFS (TP {ptp:.1f}); master -> {out}')
