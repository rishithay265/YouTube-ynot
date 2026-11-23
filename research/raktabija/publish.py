"""Write the YouTube description (with chapters from the real timeline) for "मैं रक्तबीज नहीं था".

  python research/raktabija/publish.py      (after plan.py)  ->  research/raktabija/description.md

Chapters start at each section's first spoken word (the first chapter at 0:00, as YouTube requires).
"""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
S = json.load(open(os.path.join(HERE, 'script.json')))
words = json.load(open(os.path.join(ROOT, 'src', 'episodes', 'raktabija', 'words.json')))
tl = json.load(open(os.path.join(ROOT, 'src', 'episodes', 'raktabija', 'timeline.json')))

# section starts: walk the words in order, a section's word count from the script
starts, i = [], 0
for sec in S['sections']:
    n = sum(1 for l in sec['lines'] for w in l['hi'].replace('~', ' ').split() if any('ऀ' <= ch <= 'ॿ' for ch in w))
    starts.append(words[i]['s']); i += n
fmt = lambda x: f'{int(x // 60)}:{int(x % 60):02d}'
chap = [(0.0, S['sections'][0]['title'])] + [(starts[k], S['sections'][k]['title']) for k in range(1, len(S['sections']))]
chapters = '\n'.join(f'{fmt(t)} {title}' for t, title in chap)
dur = tl['total'] / tl['fps']

desc = f"""मैं रक्तबीज नहीं था | I Was Not Raktabija

रक्तबीज की हर बूँद से एक नया असुर जन्म लेता था। पर उनमें से एक को अगर पता चल जाए कि वह रक्तबीज नहीं, उसकी एक बूँद है?
देवी माहात्म्य के आठवें अध्याय का युद्ध, उस एक बूँद की आँखों से: माँ दुर्गा, सप्त मातृकाएँ, और महाकाली।

Every drop of Raktabija's blood that touched the earth became another Raktabija. This is that battle from the Devi
Mahatmya, chapter 8, told by one of those drops: a warrior who realises he is not Raktabija, only a drop of him.

An imagined perspective rooted in the Devi Mahatmya. The narrator is our invention; every battle event is from the text.
Linking the hymn of Devi Mahatmya 4.22 (sung after Mahishasura's fall) to Raktabija's story is our interpretation, and
the film labels it so on screen.

CHAPTERS
{chapters}

SOURCES
- Devi Mahatmya (Markandeya Purana, chapters 81 to 93; Durga Saptashati), chapter 8 (Raktabija), with chapter 7
  (Chamunda's name, from Chanda and Munda) and chapter 4, verses 18 to 22 (the gods' hymn: compassion in the heart,
  relentlessness in battle).
- Durga Saptashati, Gita Press, Gorakhpur (Sanskrit with Hindi translation), the reference for verse numbers.
- Swami Jagadiswarananda, Devi-Mahatmyam (Sri Ramakrishna Math, Chennai), English translation.
- F. E. Pargiter, The Markandeya Purana (Asiatic Society of Bengal, 1904), English translation.

HOW THIS FILM WAS MADE (AI / production note)
- Narration: an AI voice (ElevenLabs, eleven_v4, voice "Mohit"), reading our own Hindi script.
- Picture: every frame is vector line-art drawn in code (Remotion, React/SVG). No AI image or video generation was used.
- Sound: the drone bed and most effects were synthesised in code for this film; a few effects are from our own
  AI-generated sound library. Details in the production credits.
- Word timings: ElevenLabs Scribe; take selection checked with Whisper.
- Subtitles: Hindi and English.

#माँदुर्गा #Mahakali #Raktabija #DeviMahatmya #Navratri

Search terms: माँ दुर्गा, Maa Durga, Mahakali, महाकाली, Raktbeej, Raktabeej, Raktabija, रक्तबीज, Chamunda, Saptamatrika,
Devi Mahatmya, Durga Saptashati, Chandi Path
"""
open(os.path.join(HERE, 'description.md'), 'w').write(desc)
print(chapters); print(f'film {fmt(dur)}')
