"""Cut points for the Tripura Shorts: each window runs from the first word of a start phrase to the end of an end phrase
(word timings from src/episodes/tripura/words.json), padded a little. Writes src/episodes/tripura/shorts.json.
  python research/tripura/shorts.py"""
import json, os, re, unicodedata
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
EP = os.path.join(ROOT, 'src', 'episodes', 'tripura')
words = json.load(open(os.path.join(EP, 'words.json')))
NUK = str.maketrans({'़': None, 'ँ': 'ं'})
n = lambda w: re.sub(r'[^ऀ-ॿ]', '', re.sub(r'[।॥]', '', unicodedata.normalize('NFC', w).translate(NUK)))
N = [n(w['w']) for w in words]
def find(ph, start=0):
    q = [n(x) for x in ph.split()]
    for i in range(start, len(N) - len(q) + 1):
        if N[i:i + len(q)] == q: return i, i + len(q) - 1
    raise SystemExit(f'not found: {ph}')
FPS = 30
SHORTS = [
    # id, start phrase, end phrase, hook (two lines), focus x in the film, zoom
    ('TripuraShort1', 'फिर एक मुहूर्त', 'कहा: एवमस्तु', ['मौत की ऐसी शर्त', 'किसी ने नहीं रखी'], 960, 1.0),
    ('TripuraShort2', 'शिव ने बाण चढ़ाया', 'और शिव हँसे', ['शिव का बाण 1 लाख वर्ष', 'क्यों नहीं चला?'], 860, 1.0),
    ('TripuraShort3', 'शिव ने रथ देखा', 'बाण भी बने, बैल भी', ['जब वेद भी', 'शिव का भार न उठा सके'], 960, 1.0),
    ('TripuraShort4', 'विष्णु ने अपने ही', 'तीनों नगरों का हर निवासी', ['एक झूठा गुरु', 'और नारद का प्रमाणपत्र'], 960, 1.0),
    ('TripuraShort5', 'देवता ब्रह्मा के पास', 'धर्म ही गिराना होगा', ['शिव ने राक्षसों को', 'मारने से मना क्यों किया?'], 960, 1.0),
    ('TripuraShort6', 'दया से जलाना', 'वह त्रिपुरारि है', ['त्रिपुर आज कहाँ हैं?', 'तुम्हारे भीतर'], 960, 1.0),
]
out = []
for sid, a_ph, b_ph, hook, cx, zoom in SHORTS:
    i, _ = find(a_ph); _, j = find(b_ph, i)
    a = max(0, round((words[i]['s'] - 0.5) * FPS)); b = round((words[j]['e'] + 1.2) * FPS) + 75  # +2.5 s end card
    ws = [dict(w=w['w'] + w.get('p', ''), s=round(w['s'] - a / FPS, 3), e=round(w['e'] - a / FPS, 3)) for w in words[i:j + 1]]
    out.append(dict(id=sid, a=a, b=b, len=b - a, hook=hook, cx=cx, zoom=zoom, words=ws))
    print(f'{sid}: {a / FPS / 60:.0f}:{a / FPS % 60:04.1f} - {b / FPS / 60:.0f}:{b / FPS % 60:04.1f}  {(b - a) / FPS:.1f}s  {len(ws)} words')
json.dump(out, open(os.path.join(EP, 'shorts.json'), 'w'), ensure_ascii=False, indent=0)
