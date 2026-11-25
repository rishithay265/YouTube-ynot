"""Gita Jayanti Shorts: timings + audio for each verse whose two chanted halves exist in research/gita/chant/.

  python research/gita/build.py   ->  public/gita/gNN.wav  and  src/episodes/gita/shorts.json

Timeline (seconds): the hook (bell at 0.3), the verse chanted once (half, 0.7 s gap, half), the English meaning while the
chant repeats softly, an end card (3 s). The tanpura bed is tuned to the chant: its Sa is the median pitch of the
chanting, one octave down, so the two never clash. Chant: Vāgdhenu (Prof. Prathosh A.P., IISc; Apache-2.0).
"""
import json, os, re, subprocess
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
SR = 48000
rng = np.random.default_rng(18)
V = json.load(open(os.path.join(HERE, 'verses.json')))

def load(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).copy()
def trim(x, db=-40):
    """cut leading/trailing silence (frames below db of the peak)."""
    n = 480; e = np.sqrt(np.convolve(x ** 2, np.ones(n) / n, 'same')) + 1e-9
    on = np.where(20 * np.log10(e / e.max()) > db)[0]
    a, b = max(0, on[0] - n), min(len(x), on[-1] + 4 * n)
    return x[a:b]
def median_f0(x):
    """median pitch of the voiced frames (autocorrelation, 70-400 Hz)."""
    fs = []; n = 2048
    for i in range(0, len(x) - n, n):
        f = x[i:i + n] * np.hanning(n)
        if np.sqrt((f ** 2).mean()) < 0.02: continue
        ac = np.correlate(f, f, 'full')[n - 1:]
        lo, hi = SR // 400, SR // 70
        k = lo + np.argmax(ac[lo:hi])
        if ac[k] > 0.3 * ac[0]: fs.append(SR / k)
    return float(np.median(fs)) if fs else 130.0
T = lambda d: np.arange(int(d * SR)) / SR
def env(n, a, shape=1.1):
    e = np.ones(n); na = max(1, int(a * SR)); e[:na] = np.linspace(0, 1, na); e[na:] = (1 - np.linspace(0, 1, n - na)) ** shape; return e
def pluck(f0, d=4.5):
    t = T(d); out = np.zeros_like(t)
    for k in range(1, 24):
        centre = 4 + 12 * (1 - np.exp(-t * 0.8))
        out += (1 / k ** 0.7) * (0.35 + np.exp(-((k - centre) ** 2) / 10)) * np.sin(2 * np.pi * f0 * k * t + k) * np.exp(-t * (0.5 + k * 0.03))
    return out / np.abs(out).max() * env(len(t), 0.01)
def bell(f0, d=5.0):
    t = T(d); out = np.zeros_like(t)
    for r, a, dec in ((0.5, 0.5, 0.5), (1, 1, 0.8), (2.0, 0.6, 1.2), (2.76, 0.45, 1.6), (5.4, 0.25, 2.6)):
        for det in (-0.6, 0.6): out += a * np.sin(2 * np.pi * (f0 * r + det) * t) * np.exp(-t * dec)
    return out / np.abs(out).max()
def tanpura(sa, dur):
    s = {'Pa': pluck(sa * 1.5), 'Sa1': pluck(sa * 2), 'Sa2': pluck(sa * 2 * 1.002), 'Sa': pluck(sa)}
    out = np.zeros((int((dur + 6) * SR), 2)); f, cyc = 0.0, 4.4
    while f < dur:
        for j, (k, pan) in enumerate((('Pa', -0.3), ('Sa1', 0.1), ('Sa2', 0.3), ('Sa', -0.1))):
            o = int((f + j * cyc / 4) * SR); x = s[k]; n = min(len(x), len(out) - o)
            out[o:o + n, 0] += x[:n] * np.cos((pan + 1) * np.pi / 4); out[o:o + n, 1] += x[:n] * np.sin((pan + 1) * np.pi / 4)
        f += cyc
    return out[:int(dur * SR)]
def put(buf, x, t, g):
    o = int(t * SR); n = min(len(x), len(buf) - o)
    if n > 0: buf[o:o + n] += (x[:n] * g)[:, None] if x.ndim == 1 else x[:n] * g

os.makedirs(os.path.join(ROOT, 'public', 'gita'), exist_ok=True)
out = []
for day, v in enumerate(V, 1):
    p = [os.path.join(HERE, 'chant', f"g{v['ch']:02d}_{i}.wav") for i in (1, 2)]
    if not all(os.path.exists(x) for x in p): print('waiting for chant', v['ref']); continue
    h1, h2 = (trim(load(x)) for x in p)
    h1 /= np.abs(h1).max(); h2 /= np.abs(h2).max()
    d1, d2 = len(h1) / SR, len(h2) / SR
    c1 = (2.2, 2.2 + d1); c2 = (c1[1] + 0.7, c1[1] + 0.7 + d2)
    words = len(v['meaning'].split())
    m0 = c2[1] + 1.0; m1 = m0 + max(9.0, words / 2.4 + 1.5)
    end = m1; total = end + 3.2
    sa = median_f0(np.concatenate([h1, h2])) / 2
    buf = np.zeros((int(total * SR), 2))
    bed = tanpura(sa, total); bed /= np.abs(bed).max()
    fade = np.ones(len(bed)); fl = int(1.2 * SR); fade[:fl] = np.linspace(0, 1, fl); fade[-int(2.5 * SR):] = np.linspace(1, 0, int(2.5 * SR))
    buf += bed * fade[:, None] * 0.10
    put(buf, bell(sa * 4), 0.3, 0.18)
    put(buf, h1, c1[0], 0.8); put(buf, h2, c2[0], 0.8)
    # the soft repeat under the meaning, faded out before the end card
    rep = np.concatenate([h1, np.zeros(int(0.7 * SR)), h2]); rl = min(len(rep), int((end - m0 - 0.5) * SR)); rep = rep[:rl].copy()
    rep[-int(0.8 * SR):] *= np.linspace(1, 0, int(0.8 * SR)); put(buf, rep, m0 + 0.5, 0.32)
    put(buf, bell(sa * 4), end + 0.1, 0.14)
    raw = os.path.join(ROOT, 'public', 'gita', f"g{v['ch']:02d}_raw.wav"); fin = os.path.join(ROOT, 'public', 'gita', f"g{v['ch']:02d}.wav")
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s24le', raw], input=buf.astype(np.float32).tobytes(), check=True)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', raw, '-af', 'loudnorm=I=-15:TP=-1.5:LRA=11', '-ar', str(SR), '-c:a', 'pcm_s16le', fin], check=True)
    os.remove(raw)
    out.append(dict(id=f"GitaShort{v['ch']:02d}", day=day, ch=v['ch'], ref=v['ref'], chapter=v['chapter'], chapter_en=v['chapter_en'], hook=v['hook'], padas=v['padas'],
                    meaning=v['meaning'], speaker=v['speaker'], len=int(round(total * 30)), audio=f"gita/g{v['ch']:02d}.wav",
                    t=dict(chant=[[round(c1[0], 2), round(c1[1], 2)], [round(c2[0], 2), round(c2[1], 2)]], meaning=[round(m0, 2), round(m1, 2)], end=round(end, 2))))
    print(f"{v['ref']:>6}  {total:5.1f}s  Sa {sa:5.1f} Hz  chant {d1:.1f}+{d2:.1f}s")
json.dump(out, open(os.path.join(ROOT, 'src', 'episodes', 'gita', 'shorts.json'), 'w'), ensure_ascii=False, indent=1)
print(len(out), 'shorts ready')
