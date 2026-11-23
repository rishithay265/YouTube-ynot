"""Pick the lowest-error take per section (the v2 "keep the best take" step, with Whisper CER for Hindi).

  python research/raktabija/pick_takes.py   -> tts/asr.json (per take: cer, per-line heard text), tts/chosen.json

Whisper large-v3 hears each take WITHOUT seeing the script, one script line at a time: the take is cut at the gaps
between lines (from the Scribe word timings in tts/al/<take>.json, run align.py first). On whole 20-60 s takes
Whisper silently dropped entire sentences (s3_a lost ten seconds it transcribes perfectly on their own), which made
good takes score 20-35% and swapped the ranking between runs; line-sized clips don't trigger that.
The character error rate is taken against the script after normalising nukta and chandrabindu (asr_check.norm).
"""
import json, os, re, subprocess, sys, unicodedata
from difflib import SequenceMatcher
import numpy as np
sys.path.insert(0, os.path.dirname(__file__))
import asr_check
from asr_check import norm, cer

D = os.path.dirname(os.path.abspath(__file__))
S = json.load(open(f'{D}/script.json'))
SR = 16000
NUK = str.maketrans({'़': None, 'ँ': 'ं'})
wn = lambda w: re.sub(r'[^ऀ-ॿ]', '', re.sub(r'[।॥]', '', unicodedata.normalize('NFC', w).translate(NUK)))

def clips(take):
    """(line text, audio) per script line, cut at the midpoints of the gaps between lines."""
    sec = next(s for s in S['sections'] if s['id'] == take.split('_')[0])
    toks = [(li, w) for li, l in enumerate(sec['lines']) for w in l['hi'].replace('~', ' ').split() if wn(w)]
    al = json.load(open(f'{D}/tts/al/{take}.json'))
    sm = SequenceMatcher(a=[wn(w) for _, w in toks], b=[wn(w['w']) for w in al], autojunk=False)
    t = {}
    for b in sm.get_matching_blocks():
        for k in range(b.size): t[b.a + k] = al[b.b + k]
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f'{D}/tts/{take}.mp3', '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    x = np.frombuffer(raw, np.float32)
    lines = sorted(set(li for li, _ in toks))
    span = {li: [min(t[k]['s'] for k in t if toks[k][0] == li), max(t[k]['e'] for k in t if toks[k][0] == li)] for li in lines}
    out = []
    for i, li in enumerate(lines):
        a = (span[lines[i - 1]][1] + span[li][0]) / 2 if i else 0
        b = (span[li][1] + span[lines[i + 1]][0]) / 2 if i + 1 < len(lines) else len(x) / SR
        out.append((sec['lines'][li]['hi'].replace('~', ' '), x[int(a * SR):int(b * SR)]))
    return out

def hear(audio):
    if asr_check._model is None:
        from faster_whisper import WhisperModel
        asr_check._model = WhisperModel('large-v3', device='cpu', compute_type='int8')
    segs, _ = asr_check._model.transcribe(audio, language='hi', beam_size=5, vad_filter=False, condition_on_previous_text=False)
    return ' '.join(s.text.strip() for s in segs)

out_path = f'{D}/tts/asr.json'
out = json.load(open(out_path)) if os.path.exists(out_path) else {}
for f in sorted(os.listdir(f'{D}/tts/al')):
    m = re.match(r'(s\d_[ab])\.json$', f)
    if not m or m.group(1) in out: continue
    take = m.group(1)
    pairs = [(ref, hear(a)) for ref, a in clips(take)]
    ref = norm(' '.join(r for r, _ in pairs)); hyp = norm(' '.join(h for _, h in pairs))
    out[take] = dict(cer=round(cer(ref, hyp), 4), lines=[dict(ref=r, heard=h, cer=round(cer(norm(r), norm(h)), 3)) for r, h in pairs])
    print(take, out[take]['cer'], flush=True)
    json.dump(out, open(out_path, 'w'), ensure_ascii=False, indent=1)
best = {}
for k in sorted(out):
    sid = k.split('_')[0]
    if sid not in best or out[k]['cer'] < out[best[sid]]['cer']: best[sid] = k
json.dump(dict(sorted(best.items())), open(f'{D}/tts/chosen.json', 'w'), indent=1)
print('chosen', best)
