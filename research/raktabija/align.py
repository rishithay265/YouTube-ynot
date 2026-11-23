"""Word timings for each chosen take, and the spot-check against the audio.

  python research/raktabija/align.py

ElevenLabs Scribe (eleven_scribe_v1, run on each chosen generation in the ElevenLabs flow; 0 credits) returns the
prompt's words with start/end times: a forced alignment. Its raw output is kept in tts/al/raw_<take>.json; this
writes tts/al/<take>.json as [{w, s, e}] without the stage tags ([softly], [pause]...).

Spot-checks, saved to tts/al/check.json:
- against the audio: for every word that follows a pause of 0.25 s or more, the speech onset in the waveform
  (first 10 ms frame within 30 dB of the take's loudest) is found and compared with Scribe's start time;
- against Whisper large-v3 (whole-take word times, tts/asr_novad.json): start times of the words both agree on.
"""
import subprocess
import json, os, re, sys, unicodedata
from difflib import SequenceMatcher
import numpy as np

D = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'tts')
NUKTA = str.maketrans({'़': None, 'ँ': 'ं'})
norm = lambda w: re.sub(r'[^ऀ-ॿ]', '', re.sub(r'[।॥]', '', unicodedata.normalize('NFC', w).translate(NUKTA)))
asr = json.load(open(os.path.join(D, 'asr_novad.json'))) if os.path.exists(os.path.join(D, 'asr_novad.json')) else {}
def rms(take):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', os.path.join(D, f'{take}.mp3'), '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    x = np.frombuffer(raw, np.float32); n = len(x) // 160
    r = 20 * np.log10(np.sqrt((x[:n * 160].reshape(n, 160) ** 2).mean(1)) + 1e-9)
    return r - r.max()
check = {}
for f in sorted(os.listdir(os.path.join(D, 'al'))):
    m = re.match(r'raw_(s\d_[ab])\.json$', f)
    if not m: continue
    take = m.group(1)
    raw = json.load(open(os.path.join(D, 'al', f)))['words']
    words, tag = [], False
    for w in raw:
        txt = w['text']
        if txt.startswith('['): tag = not txt.endswith(']'); continue
        if tag: tag = not txt.endswith(']'); continue
        if not norm(txt): continue
        words.append(dict(w=txt, s=round(w['start'], 3), e=round(w['end'], 3)))
    json.dump(words, open(os.path.join(D, 'al', f'{take}.json'), 'w'), ensure_ascii=False, indent=0)
    r = rms(take); on = []
    for a, b in zip(words, words[1:]):
        if b['s'] - a['e'] < 0.25: continue
        lo, hi = int(a['e'] * 100), min(len(r), int((b['s'] + 0.5) * 100))
        idx = next((i for i in range(lo, hi) if r[i] > -30), None)
        if idx is not None: on.append(idx / 100 - b['s'])
    check.setdefault(take, {})['audio'] = dict(n=len(on), median=round(float(np.median(on)), 3), abs_median=round(float(np.median(np.abs(on))), 3), p95=round(float(np.percentile(np.abs(on), 95)), 3)) if on else None
    if take in asr:
        hw = [w for w in asr[take]['words'] if norm(w['w'])]
        sm = SequenceMatcher(a=[norm(w['w']) for w in words], b=[norm(w['w']) for w in hw], autojunk=False)
        gaps = [abs(words[b.a + k]['s'] - hw[b.b + k]['s']) for b in sm.get_matching_blocks() for k in range(b.size)]
        if gaps:
            check[take]['whisper'] = dict(matched=len(gaps), of=len(words), median=round(float(np.median(gaps)), 3), p95=round(float(np.percentile(gaps, 95)), 3))
    print(take, check[take])
    print(take, len(words), 'words', words[0]['s'], '->', words[-1]['e'])
json.dump(check, open(os.path.join(D, 'al', 'check.json'), 'w'), indent=1)
