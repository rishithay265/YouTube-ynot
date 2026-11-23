"""Independent Hindi check of a narration take (replaces the English-only pocketsphinx wer.py of FaceStealer v2).

  python research/raktabija/asr_check.py <audio> <reference-text-file> [--names ऐन्द्री,नारसिंही,...]

Whisper large-v3 (faster-whisper, CPU int8; the model downloads from Hugging Face on first use) transcribes the take
WITHOUT seeing the script. Prints the character error rate against the script (CER suits Hindi better than WER:
spelling variants like ख़ून/खून or nukta and chandrabindu differences are normalised away first) and whether each hard
name was heard. The take with the lowest CER is kept, as in v2.

Note: ElevenLabs "transcription" of its own TTS generations returns the prompt text with timings (a forced alignment),
so it can't serve as this independent check; we use those timings only for captions.
"""
import json, re, sys, unicodedata

NUKTA = str.maketrans({'़': None, 'ँ': 'ं'})  # drop nukta; chandrabindu -> anusvara


def norm(s):
    s = re.sub(r'\[[^\]]*\]|<[^>]*>', ' ', s)  # stage tags
    s = unicodedata.normalize('NFC', s).translate(NUKTA)
    s = re.sub(r'[^ऀ-ॿ ]', ' ', s)
    s = re.sub(r'[।॥]', ' ', s)  # danda
    return re.sub(r'\s+', ' ', s).strip()


def cer(ref, hyp):
    a, b = ref.replace(' ', ''), hyp.replace(' ', '')
    d = list(range(len(b) + 1))
    for i, x in enumerate(a, 1):
        p, d[0] = d[0], i
        for j, y in enumerate(b, 1):
            p, d[j] = d[j], min(d[j] + 1, d[j - 1] + 1, p + (x != y))
    return d[-1] / max(1, len(a))


def best_match(name, words):
    """Closest heard word (or adjacent pair) to a name, by character error."""
    n = norm(name)
    cands = words + [a + b for a, b in zip(words, words[1:])]
    return min(((cer(n, w), w) for w in cands), default=(1.0, ''))


_model = None
def transcribe(path):
    global _model
    from faster_whisper import WhisperModel
    if _model is None:
        _model = WhisperModel('large-v3', device='cpu', compute_type='int8')
    import subprocess, numpy as np  # decode with ffmpeg (sidesteps PyAV version mismatches)
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    segs, _ = _model.transcribe(np.frombuffer(raw, np.float32), language='hi', beam_size=5, word_timestamps=True, vad_filter=False,
                                condition_on_previous_text=False)
    words = [dict(w=w.word.strip(), s=round(w.start, 2), e=round(w.end, 2)) for s in segs for w in (s.words or [])]
    return ' '.join(w['w'] for w in words), words


if __name__ == '__main__':
    audio, ref_file = sys.argv[1], sys.argv[2]
    names = []
    if '--names' in sys.argv: names = sys.argv[sys.argv.index('--names') + 1].split(',')
    ref = norm(open(ref_file).read())
    text, words = transcribe(audio)
    hyp = norm(text)
    out = dict(audio=audio, cer=round(cer(ref, hyp), 4), heard=text,
               names={n: dict(zip(('err', 'heard'), (round(e, 2), w))) for n, (e, w) in ((n, best_match(n, hyp.split())) for n in names)})
    print(json.dumps(out, ensure_ascii=False, indent=1))
