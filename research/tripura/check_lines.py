"""Line-by-line Whisper large-v3 check of each Tripura section (adapted from raktabija/pick_takes.py: one take per
section here). Cuts each take at the gaps between script lines (Scribe timings, tts/al/<sec>.json) and has Whisper hear
each line without the script. Writes tts/asr.json and tts/chosen.json ({sec: sec})."""
import json, os, re, subprocess, sys, unicodedata
from difflib import SequenceMatcher
import numpy as np
D = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(D, '..', 'raktabija'))
import asr_check
from asr_check import norm, cer
S = json.load(open(f'{D}/script.json')); SR = 16000
NUK = str.maketrans({'़': None, 'ँ': 'ं'})
wn = lambda w: re.sub(r'[^ऀ-ॿ]', '', re.sub(r'[।॥]', '', unicodedata.normalize('NFC', w).translate(NUK)))
def clips(sid):
    sec = next(s for s in S['sections'] if s['id'] == sid)
    toks = [(li, w) for li, l in enumerate(sec['lines']) for w in l['hi'].replace('~', ' ').split() if wn(w)]
    al = json.load(open(f'{D}/tts/al/{sid}.json'))
    sm = SequenceMatcher(a=[wn(w) for _, w in toks], b=[wn(w['w']) for w in al], autojunk=False)
    t = {}
    for b in sm.get_matching_blocks():
        for k in range(b.size): t[b.a + k] = al[b.b + k]
    x = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', f'{D}/tts/{sid}.mp3', '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout, np.float32)
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
out = {}
for sec in S['sections']:
    sid = sec['id']
    pairs = [(r, hear(a)) for r, a in clips(sid)]
    ref = norm(' '.join(r for r, _ in pairs)); hyp = norm(' '.join(h for _, h in pairs))
    out[sid] = dict(cer=round(cer(ref, hyp), 4), lines=[dict(ref=r, heard=h, cer=round(cer(norm(r), norm(h)), 3)) for r, h in pairs])
    print(sid, out[sid]['cer'], [l['cer'] for l in out[sid]['lines']], flush=True)
    json.dump(out, open(f'{D}/tts/asr.json', 'w'), ensure_ascii=False, indent=1)
json.dump({s['id']: s['id'] for s in S['sections']}, open(f'{D}/tts/chosen.json', 'w'), indent=1)
