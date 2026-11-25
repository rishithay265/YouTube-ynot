"""The Kubera Code: audio mix + timeline.

  python research/kubera/build.py   ->  public/kubera/mix.wav  and  src/episodes/kubera/timeline.json

Narration: vo/S1..S8.mp3 (ElevenLabs, Shardul K), text in vo/scripts.json (tts = what was spoken, display = IAST for captions).
Chant: chant/k_*.wav (Vāgdhenu). Music: Saffron Morning (the creator's own track), pitched to the chant's Sa and looped.
Every visual beat starts on the word that cues it (Whisper large-v3 word times, aligned to the script).
"""
import json, os, re, subprocess, hashlib
from difflib import SequenceMatcher
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
SR = 48000
SCR = json.load(open(os.path.join(HERE, 'vo', 'scripts.json')))
BGM = os.path.join(ROOT, 'research', 'gita', 'bgm', 'saffron_morning_sa170.wav')

# ---- the verses (chanted in halves) ----
CH = {
 'av':  dict(ids=['k_av_1', 'k_av_2'], src='Atharvaveda 8.10.28',
             deva=['तस्याः कुबेरो वैश्रवणो वत्स आसीदामपात्रं पात्रम् ।', 'तां रजतनाभिः कबेरकोऽधोक्तां तिरोधामेवाधोक् ॥'],
             iast=['tasyāḥ kubero vaiśravaṇo vatsa āsīd āmapātraṃ pātram', 'tāṃ rajatanābhiḥ kaberako ’dhok tāṃ tirodhām evādhok']),
 'ram': dict(ids=['k_ram_1', 'k_ram_2'], src='Vālmīki Rāmāyaṇa 7.3.14',
             deva=['अथाब्रवीद्वैश्रवणः पितामहमुपस्थितम् ।', 'भगवँल्लोकपालत्वमिच्छेयं वित्तरक्षणम् ॥'],
             iast=['athābravīd vaiśravaṇaḥ pitāmaham upasthitam', 'bhagavaṃl lokapālatvam iccheyaṃ vittarakṣaṇam']),
 'amn': dict(ids=['k_amn_1', 'k_amn_2', 'k_amn_3', 'k_amn_4'], src='Amarakośa, Svargavarga: the names of Kubera',
             deva=['कुबेरस्त्र्यम्बकसखो यक्षराड्गुह्यकेश्वरः ।', 'मनुष्यधर्मा धनदो राजराजो धनाधिपः ॥', 'किन्नरेशो वैश्रवणः पौलस्त्यो नरवाहनः ।', 'यक्षैकपिङ्गैलविलश्रीदपुण्यजनेश्वराः ॥'],
             iast=['kuberas tryambakasakho yakṣarāḍ guhyakeśvaraḥ', 'manuṣyadharmā dhanado rājarājo dhanādhipaḥ', 'kinnareśo vaiśravaṇaḥ paulastyo naravāhanaḥ', 'yakṣaikapiṅgailavilaśrīdapuṇyajaneśvarāḥ']),
 'nidhi': dict(ids=['k_nidhi_1', 'k_nidhi_2'], src='Amarakośa: the nine treasures',
             deva=['महापद्मश्च पद्मश्च शङ्खो मकरकच्छपौ ।', 'मुकुन्दकुन्दनीलाश्च खर्वश्च निधयो नव ॥'],
             iast=['mahāpadmaś ca padmaś ca śaṅkho makarakacchapau', 'mukundakundanīlāś ca kharvaś ca nidhayo nava']),
 'kul': dict(ids=['k_kul_1', 'k_kul_2'], src='Kulārṇava Tantra 6.87',
             deva=['शरीरमिव जीवस्य दीपस्य स्नेहवत्प्रिये ।', 'सर्वेषामपि देवानां तथा यन्त्रं प्रतिष्ठितम् ॥'],
             iast=['śarīram iva jīvasya dīpasya snehavat priye', 'sarveṣām api devānāṃ tathā yantraṃ pratiṣṭhitam']),
 'ta':  dict(ids=['k_ta_1', 'k_ta_2', 'k_ta_3'], src='Taittirīya Āraṇyaka 1.31.6', img='kubera/TA_1872_p187_rajadhirajaya.png',
             credit='Taittirīya Āraṇyaka, ed. R. Mitra, Calcutta 1872, p. 187',
             deva=['राजाधिराजाय प्रसह्यसाहिने । नमो वयं वैश्रवणाय कुर्महे ।', 'स मे कामान्कामकामाय मह्यम् । कामेश्वरो वैश्रवणो ददातु ।', 'कुबेराय वैश्रवणाय । महाराजाय नमः ॥'],
             iast=['rājādhirājāya prasahyasāhine / namo vayaṃ vaiśravaṇāya kurmahe', 'sa me kāmān kāmakāmāya mahyam / kāmeśvaro vaiśravaṇo dadātu', 'kuberāya vaiśravaṇāya / mahārājāya namaḥ']),
 'mm':  dict(ids=['k_mm_1', 'k_mm_2'], src='Mantramahodadhi 16.105–107 (1588 CE)',
             deva=['ॐ यक्षाय कुबेराय वैश्रवणाय धनधान्याधिपतये', 'धनधान्यसमृद्धिं मे देहि दापय स्वाहा ॥'],
             iast=['oṃ yakṣāya kuberāya vaiśravaṇāya dhanadhānyādhipataye', 'dhanadhānyasamṛddhiṃ me dehi dāpaya svāhā']),
 'dh':  dict(ids=['k_dh_1', 'k_dh_2'], src='Mantramahodadhi 16.109: the meditation', img='kubera/kubera_nalanda_bronze.jpg',
             credit='Kubera, bronze, Nālandā, 10th c. Photo: Photo Division, Govt. of India (public domain)',
             deva=['मनुजवाह्यविमानवरस्थितं गरुडरत्ननिभं निधिनायकम् ।', 'शिवसखं मुकुटादिविभूषितं वरगदे दधतं भज तुन्दिलम् ॥'],
             iast=['manujavāhyavimānavarasthitaṃ garuḍaratnanibhaṃ nidhināyakam', 'śivasakhaṃ mukuṭādivibhūṣitaṃ varagade dadhataṃ bhaja tundilam']),
 'mbh': dict(ids=['k_mbh_1', 'k_mbh_2'], src='Mahābhārata 12.221.26',
             deva=['असुरेष्ववसं पूर्वं सत्यधर्मनिबन्धना ।', 'विपरीतांस्तु तान्बुद्ध्वा त्वयि वासमरोचयम् ॥'],
             iast=['asureṣv avasaṃ pūrvaṃ satyadharmanibandhanā', 'viparītāṃs tu tān buddhvā tvayi vāsam arocayam']),
}
CHANTS = {'S2': ['av'], 'S3': ['ram', 'amn', 'nidhi'], 'S6': ['kul', 'ta', 'mm', 'dh'], 'S7': ['mbh']}

# ---- visual beats: (cue words in the spoken text, scene, {sub-cue name: cue words}) ----
BEATS = {
 'S1': [('Every morning', 'doorstep', {'draw': 'draws nine numbers'}), ('Add any line', 'lines72', {}),
        ('This is the Kubera Yantra', 'yantraName', {}), ('No ancient book', 'hands', {}),
        ('Take nineteen away', 'minus19', {'turtle': 'and a square appears'}), ('Tonight we decode', 'agenda', {'god': 'The god', 'square': 'The square', 'mantra': 'The mantra', 'rules': 'The rules', 'logic': 'And the logic'})],
 'S2': [('Start with the god', 'cosmicCow', {}), ('Her calf was', 'calf', {'veil': 'concealment'}),
        ('Now listen to the word', 'roots', {'tiro': 'Concealment is'}), ('The Shatapatha', 'satapatha', {'robbers': 'robbers'}),
        ('And the Shiva Purana', 'thief', {'temple': 'One Shivaratri', 'lamp': 'tore his own cloth', 'caught': 'He was caught', 'ganas': "But Shiva's attendants", 'kubera': 'Lifetimes later'}),
        ('The Taittiriya Aranyaka', 'waters', {'brother': 'the first offering', 'remember': 'Remember this brother'})],
 'S3': [('Valmiki tells', 'tapas', {'water': 'living on water', 'air': 'then on air', 'nothing': 'then on nothing', 'brahma': 'Brahma appears'}),
        ('Lord, I wish', 'boon', {'guard': 'Not to own it'}), ('Brahma makes him', 'guardians', {'pushpaka': 'and gives him'}),
        ('He rules Lanka', 'lanka', {'ravana': 'until his half-brother', 'leave': 'Their father tells', 'pushpaka': 'Later Ravana'}),
        ('On Kailasa', 'kailasa', {'eye': 'and her radiance', 'friend': 'Shiva, pleased', 'name': 'From then on'}),
        ('Two thousand one hundred', 'bharhut', {'name': 'and wrote his name'}), ('Even the Buddhist canon', 'alaka', {}),
        ('The Amarakosha', 'amaraIntro', {}), ('Friend of the three-eyed', 'names', {'n1': 'King of the Yakshas', 'n2': 'Giver of wealth', 'n3': 'King of kings', 'n4': 'One-eyed', 'n5': 'And Shreeda', 'count': 'And it counts'}),
        ('Maha-padma', 'nidhis', {'cells': 'Nine cells'})],
 'S4': [('Now the square', 'sum216', {'split': 'Three rows'}), ('And the centre', 'centre', {'third': 'In every square'}),
        ('Now the astonishing part', 'count', {'eight': 'Only eight', 'one': 'In all of mathematics'}),
        ("So Kubera's yantra", 'loshu', {'sub': 'Subtract nineteen'}), ('In the Navagraha', 'navagraha', {'kubera': "Kubera's is that", 'c114': 'And of a hundred'}),
        ('India was building', 'perfume', {}), ('And on the wall', 'khajuraho', {}), ('These were never', 'doodles', {})],
 'S5': [('Now lay the yantra', 'compass', {'north': 'The north cell', 'one': 'And in China', 'south': 'The south cell', 'mirror': 'Mirror east'}),
        ('One more pattern', 'tortoise', {'fifth': 'The fifth lands', 'name': 'Its name is', 'turtle': 'The square China says', 'plain': 'No scripture says'})],
 'S6': [('But a yantra', 'copper', {}), ('As the body', 'bodySoul', {'breath': 'A body needs breath', 'veda': 'The oldest comes'}),
        ('To the king of kings', 'taMeaning', {'mm': 'The japa mantra'}),
        ('To the king of the Yakshas', 'mantraWords', {'w2': 'To Kubera', 'w3': 'To the lord', 'w4': 'Give me', 'w5': 'and daapaya', 'count': 'Thirty-five syllables', 'seer': 'And the seer', 'form': 'Then his form'}),
        ('Worship the round-bellied', 'dhyana', {}),
        ('And the rules', 'rules', {'temple': 'Or ten thousand', 'bilva': 'Or one lakh at', 'install': 'To install the yantra', 'material': 'Where no material', 'moon': 'The Vedic rite comes', 'grain': 'The Dharmasindhu says', 'deepavali': 'And on Deepavali'})],
 'S7': [('But wealth is not', 'lakshmi', {'left': 'she tells Indra'}), ('I lived among', 'lived', {}),
        ('She names what', 'checklist', {'c1': 'Houses left', 'c2': 'Sleeping past', 'c3': 'Eating fine', 'c4': 'Grain left', 'c5': 'Admiring wealth', 'virtues': 'In another dialogue'}),
        ('Now put it together', 'chain', {'s1': 'One:', 's2': 'Two:', 's3': 'Three:', 's4': 'Four:', 's5': 'Five:', 's6': 'Six:', 's7': 'Seven:', 'end': 'So this is how'})],
 'S8': [('The oldest Kubera', 'ending', {'keeps': 'It keeps', 'guard': 'Kubera never asked', 'code': 'Maybe that is the code'})],
}

def load(path, ch=1, sr=SR):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', str(ch), '-ar', str(sr), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    x = np.frombuffer(raw, np.float32).copy()
    return x.reshape(-1, ch) if ch > 1 else x
def trim(x, db=-42):
    n = 480; e = np.sqrt(np.convolve(x ** 2, np.ones(n) / n, 'same')) + 1e-9
    on = np.where(20 * np.log10(e / e.max()) > db)[0]
    return x[max(0, on[0] - n):min(len(x), on[-1] + 6 * n)]
rms = lambda x: float(np.sqrt(np.mean(x[np.abs(x) > 0.02 * np.abs(x).max()] ** 2)))
key = lambda w: re.sub(r"[^a-z0-9']", '', w.lower().replace('’', "'"))

_model = None
def words_of(path, text):
    """Whisper word times mapped onto the script's words. Cached in vo/al/."""
    h = hashlib.sha1((open(path, 'rb').read()[:200000].hex() + text).encode()).hexdigest()[:16]
    cache = os.path.join(HERE, 'vo', 'al', f"{os.path.basename(path).split('.')[0]}_{h}.json")
    if os.path.exists(cache): return json.load(open(cache))
    global _model
    from faster_whisper import WhisperModel
    if _model is None: _model = WhisperModel('large-v3', device='cpu', compute_type='int8')
    audio = load(path, sr=16000); disp = text.split()
    def heard_times(prompt):
        segs, _ = _model.transcribe(audio, language='en', word_timestamps=True, initial_prompt=prompt, beam_size=5)
        heard = [w for s in segs for w in s.words]
        sm = SequenceMatcher(a=[key(w) for w in disp], b=[key(w.word) for w in heard], autojunk=False)
        t = {}
        for b in sm.get_matching_blocks():
            for k in range(b.size): t[b.a + k] = (heard[b.b + k].start, heard[b.b + k].end)
        return t
    t = heard_times(text.replace('\n', ' '))
    if len(t) < 0.9 * len(disp):
        t2 = heard_times(None)
        if len(t2) > len(t): t = t2
    out = []
    for i, w in enumerate(disp):
        if i in t: s, e = t[i]
        else:
            p = max([j for j in t if j < i], default=None); q = min([j for j in t if j > i], default=None)
            s0 = t[p][1] if p is not None else 0.0; e0 = t[q][0] if q is not None else s0 + 0.4
            run = [j for j in range(len(disp)) if j not in t and (p is None or j > p) and (q is None or j < q)]
            k = run.index(i); st = (e0 - s0) / len(run); s, e = s0 + k * st, s0 + (k + 1) * st
        out.append(dict(w=w, s=round(s, 3), e=round(e, 3)))
    print(f"  {os.path.basename(path)}: {len(t)}/{len(disp)} words matched")
    os.makedirs(os.path.dirname(cache), exist_ok=True); json.dump(out, open(cache, 'w'))
    return out

def find(words, phrase, start=0):
    ph = [key(x) for x in phrase.split()]
    ks = [key(w['w']) for w in words]
    for i in range(start, len(ks) - len(ph) + 1):
        if ks[i:i + len(ph)] == ph: return i
    raise SystemExit(f'cue not found: {phrase!r}')

def main():
    os.makedirs(os.path.join(ROOT, 'public', 'kubera'), exist_ok=True)
    secs = [k for k in SCR if os.path.exists(os.path.join(HERE, 'vo', k + '.mp3')) and all(os.path.exists(os.path.join(HERE, 'chant', i + '.wav')) for c in CHANTS.get(k, []) for i in CH[c]['ids'])]
    t = 0.9; pieces = []; beats = []; words_out = []; chants_out = []; spans = []
    for si, sk in enumerate(secs):
        sc = SCR[sk]; paras = [p for p in sc['tts'] if p != '<<CHANT>>']; dparas = [p for p in sc['display'] if p != '<<CHANT>>']
        text = '\n\n'.join(paras); path = os.path.join(HERE, 'vo', sk + '.mp3')
        ws = words_of(path, text); x = load(path)
        disp_words = []
        for tp, dp in zip(paras, dparas):
            a, b = tp.split(), dp.split()
            disp_words += b if len(a) == len(b) else a
        # paragraph boundaries (word index ranges) and the chant that follows each paragraph
        bounds = []; i = 0
        for p in paras: n = len(p.split()); bounds.append((i, i + n)); i += n
        order = []; ci = 0
        for p in sc['tts']:
            if p == '<<CHANT>>': order[-1] = (order[-1][0], CHANTS[sk][ci]); ci += 1
            else: order.append((len(order), None))
        sec_start = t
        for (pi, chant) in order:
            a, b = bounds[pi]
            s0 = 0.0 if pi == 0 else (ws[a - 1]['e'] + ws[a]['s']) / 2
            s1 = len(x) / SR if pi == len(paras) - 1 else (ws[b - 1]['e'] + ws[b]['s']) / 2
            seg = x[int(s0 * SR):int(s1 * SR)]
            off = t - s0
            pieces.append(('vo', seg, t))
            for k in range(a, b): words_out.append(dict(w=disp_words[k], s=round(ws[k]['s'] + off, 3), e=round(ws[k]['e'] + off, 3)))
            spans.append(('vo', t, t + len(seg) / SR))
            for k in range(a, b): ws[k]['abs'] = ws[k]['s'] + off
            t += len(seg) / SR
            if chant:
                c = CH[chant]; t += 0.7; halves = []
                for cid in c['ids']:
                    y = trim(load(os.path.join(HERE, 'chant', cid + '.wav'))); pieces.append(('chant', y, t))
                    halves.append([round(t, 3), round(t + len(y) / SR, 3)]); t += len(y) / SR + 0.55
                t += 0.6
                chants_out.append(dict(key=chant, s=halves[0][0] - 0.5, e=round(t - 0.3, 3), halves=halves, deva=c['deva'], iast=c['iast'], src=c['src'], img=c.get('img'), credit=c.get('credit')))
                spans.append(('chant', halves[0][0], halves[-1][1]))
        # beats for this section
        last = 0
        for cue, scene, sub in BEATS.get(sk, []):
            i0 = find(ws, cue, last); last = i0
            cues = {}
            for nm, ph in sub.items():
                j = find(ws, ph, i0); cues[nm] = round(ws[j]['abs'], 3)
            beats.append(dict(scene=scene, s=round(ws[i0]['abs'] - (0.35 if i0 else 0.6), 3), cues=cues, sec=sk))
        t += 1.3
        if sk == 'S1':
            beats.append(dict(scene='title', s=round(t - 0.6, 3), cues={}, sec='S1')); t += 5.0
    total = t + 4.0
    beats.sort(key=lambda b: b['s'])
    for i, b in enumerate(beats): b['e'] = beats[i + 1]['s'] if i + 1 < len(beats) else round(total, 3)
    # ---- mix ----
    buf = np.zeros((int(total * SR), 2))
    vo = [p for p in pieces if p[0] == 'vo']; ch = [p for p in pieces if p[0] == 'chant']
    rv = rms(np.concatenate([p[1] for p in vo])); rc = rms(np.concatenate([p[1] for p in ch])) if ch else 1
    for kind, y, at in pieces:
        g = 0.18 / rv if kind == 'vo' else 0.16 / rc
        o = int(at * SR); n = min(len(y), len(buf) - o); buf[o:o + n] += (y[:n] * g)[:, None]
    m = load(BGM, ch=2); m /= rms(m[:, 0]); L = len(m); xf = int(2.0 * SR)
    bed = np.zeros_like(buf); pos = 0
    while pos < len(bed):
        n = min(L, len(bed) - pos); seg = m[:n].copy()
        if pos: seg[:min(xf, n)] *= np.linspace(0, 1, min(xf, n))[:, None]
        if n == L: seg[-xf:] *= np.linspace(1, 0, xf)[:, None]
        bed[pos:pos + n] += seg; pos += L - xf
    lvl = np.full(len(buf), 0.085)
    for kind, a, b in spans: lvl[int(a * SR):int(b * SR)] = 0.04 if kind == 'vo' else 0.058
    k = int(0.4 * SR); lvl = np.convolve(np.pad(lvl, k, mode='edge'), np.ones(2 * k) / (2 * k), 'same')[k:-k][:len(buf)]
    lvl[:int(1.0 * SR)] *= np.linspace(0, 1, int(1.0 * SR)); fo = int(4.0 * SR); lvl[-fo:] *= np.linspace(1, 0, fo) ** 1.5
    buf += bed * lvl[:, None]
    raw = os.path.join(ROOT, 'public', 'kubera', 'mix_raw.wav'); fin = os.path.join(ROOT, 'public', 'kubera', 'mix.wav')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s24le', raw], input=buf.astype(np.float32).tobytes(), check=True)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', raw, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', str(SR), '-c:a', 'pcm_s16le', fin], check=True)
    os.remove(raw)
    out = dict(total=round(total, 3), len=int(round(total * 30)), audio='kubera/mix.wav', beats=beats, words=words_out, chants=chants_out)
    os.makedirs(os.path.join(ROOT, 'src', 'episodes', 'kubera'), exist_ok=True)
    json.dump(out, open(os.path.join(ROOT, 'src', 'episodes', 'kubera', 'timeline.json'), 'w'), ensure_ascii=False, indent=1)
    print(f'sections {secs}  total {total:.1f}s  beats {len(beats)}  chants {len(chants_out)}')

if __name__ == '__main__':
    main()
