"""Forced alignment with pocketsphinx (its English model ships in the pip package; no downloads).
usage: python align.py audio.wav section_index out.json   -> per display token {w,s,e,p,conf}"""
import sys, json, subprocess
from pocketsphinx import Decoder
from tokens import tokens
EXTRA = {'facestealer': 'F EY S S T IY L ER', 'webcam': 'W EH B K AE M', 'deepfake': 'D IY P F EY K', 'deepfakes': 'D IY P F EY K S',
         'chollima': 'CH OW L IY M AH', 'bluenoroff': 'B L UW N AO R AO F', 'telegram': 'T EH L AH G R AE M', 'keyloggers': 'K IY L AO G ER Z',
         'javascript': 'JH AA V AH S K R IH P T', 'crypto': 'K R IH P T OW', 'copycat': 'K AA P IY K AE T', "a's": 'EY Z', 'fbi': 'EH F B IY AY',
         'multi': 'M AH L T IY', 'lookalike': 'L UH K AH L AY K', 'unc': 'Y UW EH N S IY', 'sapphire': 'S AE F AY ER', 'teams': 'T IY M Z', 'capturers': 'K AE P CH ER ER Z', 'maintainer': 'M EY N T EY N ER'}
def run(wav, sec, out):
    text = json.load(open(__file__.rsplit('/', 1)[0] + '/script_v2.json'))['sections'][sec]
    toks = tokens(text)
    words = [w for t in toks for w in t[2]]
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', wav, '-ac', '1', '-ar', '16000', '-f', 's16le', '-'], capture_output=True, check=True).stdout
    d = Decoder(samprate=16000, bestpath=False)
    for w, ph in EXTRA.items():
        if d.lookup_word(w) is None: d.add_word(w, ph, True)
    miss = sorted({w for w in words if d.lookup_word(w) is None})
    if miss: raise SystemExit(f'OOV {miss}')
    d.set_align_text(' '.join(words))
    d.start_utt(); d.process_raw(raw, full_utt=True); d.end_utt()
    segs = [s for s in d.seg() if s.word not in ('<s>', '</s>', '<sil>', '(NULL)') and not s.word.startswith('[')]
    assert len(segs) == len(words), (len(segs), len(words))
    res, k = [], 0
    for disp, p, sp in toks:
        ss = segs[k:k + len(sp)]; k += len(sp)
        res.append(dict(w=disp, s=round(ss[0].start_frame / 100, 3), e=round((ss[-1].end_frame + 1) / 100, 3), p=p,
                        conf=round(min(s.ascore / max(1, s.end_frame - s.start_frame + 1) for s in ss), 1)))
    json.dump(res, open(out, 'w'), indent=0)
    return res
if __name__ == '__main__':
    r = run(sys.argv[1], int(sys.argv[2]), sys.argv[3]); print(len(r), 'tokens, end', r[-1]['e'])
