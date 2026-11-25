"""Gita Jayanti Shorts, voice-over structure: one continuous music bed (Saffron Morning, pitched to the chant's Sa) under
  narrator Part A (hook + "Krishna answers this…")  ->  Vāgdhenu chant (half, 0.7 s, half)  ->  narrator Part B  ->  end card.

  python research/gita/build_vo.py   ->  public/gita/vNN.wav  and  src/episodes/gita/shorts.json

Needs research/gita/vo/gNN_A.mp3 + gNN_B.mp3 (ElevenLabs, Shardul K), research/gita/vo/scripts.json (the exact text, used
for the captions) and research/gita/chant/gNN_{1,2}.wav. Word timings come from Whisper large-v3 heard against the script.
"""
import json, os, re, subprocess
from difflib import SequenceMatcher
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
SR = 48000
V = {f"g{v['ch']:02d}": dict(v, day=i) for i, v in enumerate(json.load(open(os.path.join(HERE, 'verses.json'))), 1)}
SCR = json.load(open(os.path.join(HERE, 'vo', 'scripts.json')))
BGM = os.path.join(HERE, 'bgm', 'saffron_morning_sa170.wav')

def load(path, ch=1, sr=SR):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', str(ch), '-ar', str(sr), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    x = np.frombuffer(raw, np.float32).copy()
    return x.reshape(-1, ch) if ch > 1 else x
def trim(x, db=-42):
    n = 480; e = np.sqrt(np.convolve(x ** 2, np.ones(n) / n, 'same')) + 1e-9
    on = np.where(20 * np.log10(e / e.max()) > db)[0]
    a, b = max(0, on[0] - n), min(len(x), on[-1] + 6 * n)
    return x[a:b], a / SR
rms = lambda x: float(np.sqrt(np.mean(x[np.abs(x) > 0.02 * np.abs(x).max()] ** 2)))
def put(buf, x, t, g=1.0):
    o = int(t * SR); n = min(len(x), len(buf) - o)
    if n > 0: buf[o:o + n] += (x[:n] * g)[:, None]

_model = None
def words_of(path, text):
    """Whisper word timings, mapped onto the script's own words (display text keeps its punctuation)."""
    global _model
    from faster_whisper import WhisperModel
    if _model is None: _model = WhisperModel('large-v3', device='cpu', compute_type='int8')
    audio = load(path, sr=16000)
    segs, _ = _model.transcribe(audio, language='en', word_timestamps=True, initial_prompt=text.replace('\n', ' '), beam_size=5)
    heard = [w for s in segs for w in s.words]
    key = lambda w: re.sub(r"[^a-z0-9']", '', w.lower().replace('’', "'"))
    disp = text.split()
    sm = SequenceMatcher(a=[key(w) for w in disp], b=[key(w.word) for w in heard], autojunk=False)
    t = {}
    for b in sm.get_matching_blocks():
        for k in range(b.size): t[b.a + k] = (heard[b.b + k].start, heard[b.b + k].end)
    out = []
    for i, w in enumerate(disp):  # unmatched words: share the gap between their matched neighbours
        if i in t: s, e = t[i]
        else:
            p = max([j for j in t if j < i], default=None); q = min([j for j in t if j > i], default=None)
            s0 = t[p][1] if p is not None else 0.0; e0 = t[q][0] if q is not None else s0 + 0.4
            run = [j for j in range(len(disp)) if j not in t and (p is None or j > p) and (q is None or j < q)]
            k = run.index(i); step = (e0 - s0) / len(run); s, e = s0 + k * step, s0 + (k + 1) * step
        out.append(dict(w=w, s=round(s, 2), e=round(e, 2)))
    print(f"  {os.path.basename(path)}: {len(t)}/{len(disp)} words matched")
    return out

def chunks(ws, off):
    """caption groups: break after . ? ! … : and after a comma once 4+ words are up; never more than 10 words."""
    out, cur = [], []
    for i, w in enumerate(ws):
        cur.append(dict(w=w['w'], s=round(w['s'] + off, 2), e=round(w['e'] + off, 2)))
        end = re.search(r'[.?!…:"”]$', w['w']) or (w['w'].endswith(',') and len(cur) >= 4) or len(cur) >= 10
        if end or i == len(ws) - 1: out.append(cur); cur = []
    res = []
    for i, c in enumerate(out):
        q = any(x['w'].startswith(('"', '“')) or x['w'].endswith(('"', '”', '."', '.”')) for x in c)
        res.append(dict(s=c[0]['s'], e=round(out[i + 1][0]['s'] if i + 1 < len(out) and out[i + 1][0]['s'] - c[-1]['e'] < 1.2 else c[-1]['e'] + 0.5, 2),
                        q=bool(q), words=c))
    # the quoted translation: every chunk between an opening and a closing quote is gold
    inq = False
    for c in res:
        txt = ' '.join(x['w'] for x in c['words'])
        if re.search(r'^["“]', txt) or re.search(r'\s["“]', txt): inq = True
        c['q'] = inq or c['q']
        if re.search(r'["”]$', txt.rstrip('.')) or txt.endswith(('"', '”')): inq = False
    return res

os.makedirs(os.path.join(ROOT, 'public', 'gita'), exist_ok=True)
bgm_all = load(BGM, ch=2)
out = []
for g, sc in SCR.items():
    v = V[g]; vo = os.path.join(HERE, 'vo')
    pa, pb = os.path.join(vo, f'{g}_A.mp3'), os.path.join(vo, f'{g}_B.mp3')
    if not (os.path.exists(pa) and os.path.exists(pb)): print('waiting for voice-over', g); continue
    A, a0 = trim(load(pa)); B, b0 = trim(load(pb))
    h1, _ = trim(load(os.path.join(HERE, 'chant', f'{g}_1.wav'))); h2, _ = trim(load(os.path.join(HERE, 'chant', f'{g}_2.wav')))
    ref = rms(np.concatenate([A, B]))
    A, B = A / ref * 0.18, B / ref * 0.18                       # speech at a fixed level
    ch = rms(np.concatenate([h1, h2])); h1, h2 = h1 / ch * 0.16, h2 / ch * 0.16
    tA = 1.6; tA1 = tA + len(A) / SR
    c1 = (tA1 + 1.1, tA1 + 1.1 + len(h1) / SR); c2 = (c1[1] + 0.7, c1[1] + 0.7 + len(h2) / SR)
    tB = c2[1] + 1.2; tB1 = tB + len(B) / SR
    end = tB1 + 0.9; total = end + 3.6
    buf = np.zeros((int(total * SR), 2))
    # the music: continuous from frame 0, sitting under the voice, a little fuller under the chant and in the gaps
    m = bgm_all[:len(buf)].copy(); m /= rms(m[:, 0])
    lvl = np.full(len(buf), 0.085)                              # gaps / intro / end card
    for (s, e, l) in ((tA, tA1, 0.042), (c1[0], c2[1], 0.06), (tB, tB1, 0.042)):
        lvl[int(s * SR):int(e * SR)] = l
    k = int(0.35 * SR); lvl = np.convolve(np.pad(lvl, k, mode='edge'), np.ones(2 * k) / (2 * k), 'same')[k:-k][:len(buf)]
    lvl[:int(0.8 * SR)] *= np.linspace(0, 1, int(0.8 * SR)); fo = int(3.0 * SR); lvl[-fo:] *= np.linspace(1, 0, fo) ** 1.5
    buf += m * lvl[:, None]
    put(buf, A, tA); put(buf, h1, c1[0]); put(buf, h2, c2[0]); put(buf, B, tB)
    raw = os.path.join(ROOT, 'public', 'gita', f'v{g[1:]}_raw.wav'); fin = os.path.join(ROOT, 'public', 'gita', f'v{g[1:]}.wav')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s24le', raw], input=buf.astype(np.float32).tobytes(), check=True)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', raw, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', str(SR), '-c:a', 'pcm_s16le', fin], check=True)
    os.remove(raw)
    wa = words_of(pa, sc['A']); wb = words_of(pb, sc['B'])
    cap = chunks(wa, tA - a0) + chunks(wb, tB - b0)
    out.append(dict(id=f"GitaShort{v['ch']:02d}", day=v['day'], ch=v['ch'], ref=v['ref'], chapter=v['chapter'], chapter_en=v['chapter_en'], hook=v['hook'],
                    padas=v['padas'], meaning=v['meaning'], speaker=v['speaker'], len=int(round(total * 30)), audio=f"gita/v{g[1:]}.wav",
                    t=dict(a=[round(tA, 2), round(tA1, 2)], chant=[[round(c1[0], 2), round(c1[1], 2)], [round(c2[0], 2), round(c2[1], 2)]],
                           b=[round(tB, 2), round(tB1, 2)], meaning=[round(tB, 2), round(tB1, 2)], end=round(end, 2)), cap=cap))
    print(f"{v['ref']:>6}  {total:5.1f}s  A {len(A)/SR:.1f}s  chant {len(h1)/SR:.1f}+{len(h2)/SR:.1f}s  B {len(B)/SR:.1f}s")
json.dump(out, open(os.path.join(ROOT, 'src', 'episodes', 'gita', 'shorts.json'), 'w'), ensure_ascii=False, indent=1)
print(len(out), 'shorts ready')
