"""Write the YouTube description (chapters from the real timeline) for "हम त्रिपुर थे".
  python research/tripura/publish.py   (after plan.py)  ->  research/tripura/description.md"""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
S = json.load(open(os.path.join(HERE, 'script.json')))
words = json.load(open(os.path.join(ROOT, 'src', 'episodes', 'tripura', 'words.json')))
tl = json.load(open(os.path.join(ROOT, 'src', 'episodes', 'tripura', 'timeline.json')))
starts, i = [], 0
for sec in S['sections']:
    n = sum(1 for l in sec['lines'] for w in l['hi'].replace('~', ' ').split() if any('ऀ' <= ch <= 'ॿ' for ch in w))
    starts.append(words[i]['s']); i += n
fmt = lambda x: f'{int(x // 60)}:{int(x % 60):02d}'
chap = [(0.0, S['sections'][0]['title'])] + [(starts[k], S['sections'][k]['title']) for k in range(1, len(S['sections']))]
chapters = '\n'.join(f'{fmt(t)} {title}' for t, title in chap)
dur = tl['total'] / tl['fps']
desc = f"""हम त्रिपुर थे | We Were Tripura · त्रिपुरासुर वध · Tripurasura Vadh

सोने, चाँदी और लोहे के तीन नगर, जो हज़ार वर्ष में केवल एक पल के लिए एक रेखा में आते थे। शिव ने उन्हें एक ही बाण से जलाया।
यह कथा उन्हीं नगरों की ज़ुबानी: ब्रह्मा का वर, शिव का इनकार ("वे मेरे भक्त हैं"), अरिहन् और नारद, पतन, देवताओं का रथ,
गिरते वेद-घोड़े, गणेश, वह एक पल, और दहन। और अंत में: त्रिपुर कहाँ हैं? हमारे भीतर।

Three cities of gold, silver and iron that came into one line for a single moment in a thousand years, and the one
arrow that burned them. The story of Tripurasura Vadh told by the cities themselves, as the Shiva Mahapurana tells it,
following the pravachan of Sri Chaganti Koteswara Rao garu.

For Kartika Purnima, kept by tradition as Tripurari Purnima. (The Purana's own clock for the arrow is midday, Abhijit
muhurta, the moon in Pushya; it does not name the month.)

CHAPTERS
{chapters}

SOURCES
- Shiva Mahapurana, Rudra Samhita, Yuddha Khanda, chapters 1 to 12 (Tripura-vadha), Gita Press, Gorakhpur (Sanskrit with
  Hindi translation). Verse references are given on screen (e.g. the bull is Shesha, 9.8; Ganesha on the thumb, 10.4;
  Tarakaksha's last words, 10.32-33; only Maya survives, 10.39-40).
- Pravachan: Sri Chaganti Koteswara Rao garu, "Lord Shiva v/s Tripurasura War" (Eha Bhakthi). The film follows his telling
  and his teaching (the three bodies and three states as the three cities; the balance of the Prabodha Sudhakara).
  Where his telling and the Gita Press text differ, the film follows the text and labels the tradition.
- Traditions quoted: Shivananda Lahari 83 (Vishnu as arrow and bull), Linga Purana (the gods in the arrow), Patanjali's
  Charana-shringa-rahita Nataraja Stotra (akhanda-daya), Prabodha Sudhakara (the balance), the Mahamrityunjaya mantra
  (Rigveda 7.59.12).

HOW THIS FILM WAS MADE (AI / production note)
- Narration: an AI voice (ElevenLabs, eleven_v4, voice "Mohit"), reading our own Hindi script.
- Picture: every frame is vector line-art drawn in code (Remotion, React/SVG). No AI image or video generation was used.
- Sound: the drone bed and the effects were synthesised in code for this film, with a few effects from our own library.
- Subtitles: Hindi and English.

Viewer note: the burning of the cities (from 8:42) is described as the Purana describes it.

#Tripurari #KartikPurnima #ShivaPurana #TripurasuraVadh #Mahadev

Search terms: त्रिपुरासुर वध, Tripurasura, Tripurantaka, त्रिपुरारी पूर्णिमा, कार्तिक पूर्णिमा, Kartika Purnima, Dev Deepawali,
Shiva Purana, Shiv Puran, Tarakaksha, Kamalaksha, Vidyunmali, Maya danava, Pashupati, Chaganti pravachan
"""
open(os.path.join(HERE, 'description.md'), 'w').write(desc)
print(chapters); print(f'film {fmt(dur)}')
