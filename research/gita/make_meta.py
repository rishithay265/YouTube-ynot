"""Upload metadata for the 18 Gita Jayanti Shorts (Instagram Reel + YouTube Short), one section per day.

  python research/gita/make_meta.py  ->  research/gita/SHORTS_METADATA.md

Verse text, translation and chapter come from verses.json and vo/scripts.json (the quoted translation is the one spoken in the video).
The hand-written lines per day are below.
"""
import json, os, re
HERE = os.path.dirname(os.path.abspath(__file__))
V = json.load(open(os.path.join(HERE, 'verses.json'))); S = json.load(open(os.path.join(HERE, 'vo', 'scripts.json')))

# title (YouTube), opener (Instagram first lines), insight, question, 2 topic hashtags, extra YouTube tags
D = {
 1: ("The Gita's First Verse Isn't Krishna's",
     "The Bhagavad Gita doesn't begin with Krishna. 🕉️\nIt begins with a blind king… asking a question he is afraid to hear answered.",
     "My sons. And Pandu's sons.\nBefore a single arrow flies, the divide is already in his heart. 💔",
     'Which word hit you hardest: "my sons" or "Pandu\'s sons"? 👇',
     "#mahabharata #sanatandharma", "dharmakshetre kurukshetre, dhritarashtra, sanjaya, first verse of gita"),
 2: ("Why Hard Work Still Feels Empty",
     "Why do we work so hard… and still feel empty, anxious, never satisfied? 🕉️\nKrishna's answer is the most famous verse of the Gita.",
     "The result was never in your hands. The effort always was. 🙏",
     "What would you do differently if you stopped chasing the result? 👇",
     "#karmayoga #sanatandharma", "karmanye vadhikaraste, karma yoga, nishkama karma, detachment from results"),
 3: ("Stop Living Someone Else's Life",
     "Why does living someone else's life feel so empty… and so frightening? 🕉️",
     "Comparison feels like ambition. Krishna calls it fear. 🔥",
     "Whose path have you been trying to walk? 👇",
     "#dharma #selfdiscovery", "shreyan swadharmo vigunah, svadharma, paradharma, comparison"),
 4: ("When Evil Wins, Krishna Makes a Promise",
     "What happens when evil starts winning… when truth is forgotten, and injustice takes over? 🕉️",
     "Evil may rise. Truth may suffer.\nBut darkness never gets the final word. 🔱",
     "Type 🙏 if this promise gives you hope.",
     "#dharma #sanatandharma", "yada yada hi dharmasya, avatar, krishna promise, dharma"),
 5: ("How to Spot a Truly Wise Person",
     "How do you recognise a truly wise person? 🕉️\nNot by what they know… but by how they see.",
     "Birth, status, form… these are only the surface.\nTrue wisdom is seeing the one light in all. ✨",
     "Who in your life sees everyone with equal eyes? 👇",
     "#wisdom #oneness", "vidya vinaya sampanne, sama darshinah, equal vision, pandita"),
 6: ("Your Greatest Enemy Isn't Who You Think",
     "Who is your greatest enemy? 🕉️\nThe one who can pull you down further than anyone else…",
     "Be the hand that lifts you, not the weight that drags you down.\nYour greatest battle isn't out there. It's within. ⚔️",
     "Is your mind your friend today, or your enemy? 👇",
     "#selfmastery #mindset", "uddhared atmanatmanam, mind is your friend, self control, dhyana yoga"),
 7: ("Only One in Millions Understands This",
     "After countless lifetimes… what does the wise soul finally understand? 🕉️",
     "It takes many lives to learn. Very few ever do. 🌌",
     "What do you think it means to see Vasudeva in everything? 👇",
     "#vasudeva #surrender", "bahunam janmanam ante, vasudeva sarvam iti, mahatma sudurlabhah, rebirth"),
 8: ("What Will You Remember at the Very End?",
     "In your final moment… what will your mind hold on to? 🕉️",
     "Krishna doesn't ask Arjuna to leave the battlefield.\nHe asks him to remember while he fights. ⚔️",
     "What would you want your mind to hold on to? 👇",
     "#bhakti #devotion", "tasmat sarveshu kaleshu, mam anusmara yudhya cha, remembering god, last thought"),
 9: ("What God Really Wants From You",
     "What does God really want from you? 🕉️\nGold? Grand rituals? Lavish offerings?",
     "The Divine doesn't measure the gift. He sees the heart that gives it.\nA single leaf, offered with love… is enough. 🌿",
     "What would you offer with love today? 👇",
     "#bhakti #devotion", "patram pushpam phalam toyam, offering to god, bhakti, puja"),
 10: ("Where Does God Actually Live?",
     "Where does God live? 🕉️\nIn a temple? Beyond the sky?",
     "You don't have to search far… only deep. 💛",
     "Where do you feel the Divine closest? 👇",
     "#atman #spirituality", "aham atma gudakesha, god in the heart, atman, vibhuti yoga"),
 11: ('"I Am Time": The Gita\'s Most Terrifying Verse',
     "Arjuna sees the universal form, blazing, devouring armies… 🕉️\nAnd trembling, he asks: who are You?",
     "The outcome was decided before the first arrow flew.\nArjuna isn't the destroyer… he is only the instrument. 🔥",
     "Oppenheimer famously quoted this verse. Had you heard it before? 👇",
     "#vishvarupa #mahabharata", "kalo smi, i am time, destroyer of worlds, vishwaroop, universal form, oppenheimer gita"),
 12: ("Who Is Truly Dear to God?",
     "What kind of person is truly dear to God? 🕉️",
     "Not wealth. Not status… a gentle heart. 🪷",
     "Which is hardest for you: no hatred, no ego, or forgiving? 👇",
     "#bhaktiyoga #kindness", "adveshta sarva bhutanam, qualities of a devotee, bhakti yoga, forgiveness"),
 13: ("Your Body Is a Field. Who Is the Knower?",
     "Krishna says your body is a field… 🕉️\nSo who is the one who knows it?",
     "The body changes… the knower within never does. 👁️",
     "Have you ever noticed the one who watches your thoughts? 👇",
     "#selfrealization #consciousness", "kshetrajna, kshetra kshetrajna, field and knower, consciousness"),
 14: ("The Three Invisible Ropes That Bind Your Soul",
     "What are the three invisible ropes that bind every soul? 🕉️",
     "Even goodness is a rope.\nA golden one… but still a rope. 🪢",
     "Which guna rules your day: sattva, rajas or tamas? 👇",
     "#gunas #selfawareness", "sattva rajas tamas, three gunas, gunatraya, prakriti"),
 15: ("Who Are You, Really?",
     "Who are you, really? 🕉️\nBeyond your name, your body, your story…",
     "The mind and the senses are what the soul carries… not what it is. ✨",
     "If you're not your name or your body, who are you? 👇",
     "#atman #selfrealization", "mamaivamsho jiva loke, soul is part of god, jiva, purushottama yoga"),
 16: ("The Three Gates of Hell, Named by Krishna",
     "Krishna names three gates that lead straight to hell. 🕉️\nDo you know what they are?",
     "Every fall begins at one of these three gates.\nClose them… and you guard your soul. 🚪",
     "Which gate is hardest to close: desire, anger or greed? 👇",
     "#selfcontrol #dharma", "trividham narakasyedam, three gates of hell, kama krodha lobha, lust anger greed"),
 17: ("Is Your Charity Really Charity?",
     "What is true charity? 🕉️\nIs every gift really a gift?",
     "Give because it is right. Not for praise. Not for return.\nThe purest gift is the one that asks for nothing back. 🤲",
     "What's the kindest gift you've received that asked nothing back? 👇",
     "#seva #charity", "datavyam iti yad danam, sattvic charity, daan, seva"),
 18: ("Krishna's Final Promise: Do Not Grieve",
     "After all His teachings… what is Krishna's final, most secret word to Arjuna, and to all of us? 🕉️",
     "After all the battles, all the questions…\nthe Gita ends with a promise: do not grieve. 🙏",
     "Happy Gita Jayanti! 🪔 Which of these 18 verses stayed with you most? 👇",
     "#surrender #sanatandharma", "sarva dharman parityajya, charama shloka, surrender to krishna, ma shuchah"),
}
NOTE = {
 1: "Spoken by Dhritarashtra, not Krishna: the Gita opens with the blind king asking Sanjaya.",
 12: 'Verse 12.13 lists the qualities; "such a devotee is dear to Me" closes the next verse, 12.14.',
 13: "Numbered 13.2 as in the Gita Press edition (13.3 in editions that count Arjuna's opening question as a verse).",
 18: "Translation following the Gita Press edition (sarva-dharmān: all dharmas / duties).",
}

def quote(day):
    b = S[f"g{V[day - 1]['ch']:02d}"]['B']
    return re.search(r'["“](.+?)["”]', b, re.S).group(1)
def teaser(day):
    a = S[f"g{V[day - 1]['ch']:02d}"]['A'].split('\n\n')[0]
    return a.replace('…', '…').strip()

out = ["# Gita Jayanti Shorts: upload metadata, all 18 days\n",
       "Generated by `research/gita/make_meta.py`. Video: `out/gita/gita-dayNN-REF-vo.mp4`. Cover: `out/gita/cover-dayNN.png` "
       "(Instagram: **Edit cover → Add from camera roll**; YouTube Shorts: pick the cover frame in the app).\n",
       "## Same settings every day\n",
       "| | Instagram Reel | YouTube Short |\n|---|---|---|\n"
       "| AI label | **ON** (Advanced settings): AI voice and AI chant | **Altered or synthetic content: Yes** |\n"
       "| Audience | | Not made for kids |\n"
       "| Category | | Education |\n"
       "| Playlist | | **Gita Jayanti: 18 Days, 18 Verses** |\n"
       "| Location | Kurukshetra, Haryana (optional) | |\n"
       "| Related video | | The Tripura film |\n"
       "| Time | 7–9 PM IST | 7–9 PM IST |\n",
       "**Music:** Saffron Morning plays under every Short and its source and licence are still unconfirmed. "
       "Add its credit line to both descriptions if it comes from a stock library; if it isn't cleared for monetised use, YouTube may place a Content ID claim.\n"]
for day, v in enumerate(V, 1):
    title, opener, insight, q, tags2, ytags = D[day]
    ref, p = v['ref'], v['padas']
    h = len(p) // 2
    sk = ' '.join(p[:h]) + '।\n' + ' '.join(p[h:]) + '॥'
    date = f"{day + 2} December 2026"
    nxt = f'Follow so you don\'t miss Day {day + 1} → "{teaser(day + 1)}"' if day < 18 else "Watch all 18 verses in the series on our profile. 📿"
    series = (f"📿 Gita Jayanti · Day {day} of 18\nOne chapter. One verse. Every day till Gita Jayanti, 20 December." if day < 18 else
              "📿 Gita Jayanti · Day 18 of 18\nToday is Gita Jayanti, the day the Gita was spoken on the field of Kurukshetra.")
    yt_title = f"{title} 🕉️ | Bhagavad Gita {ref} | Gita Jayanti Day {day}/18"
    assert len(yt_title) <= 100, (day, len(yt_title))
    plain = lambda s: re.sub(r'\s*[^\w\s.,:;!?\'"…()-]+\s*$', '', s, flags=re.M).replace('\n', ' ')
    ig = f"""{opener}

{sk}
(Bhagavad Gita {ref})

"{quote(day)}"

{insight}

{series}
{nxt}

{q}

🎙️ Sanskrit chant: Vāgdhenu (Prof. Prathosh A.P., IISc Bengaluru) · Narration: AI voice

#bhagavadgita #gitajayanti #krishna {tags2}"""
    desc = f"""{plain(opener)} {plain(insight)}

{sk}
Bhagavad Gita {ref} · Chapter {v['ch']}: {v['chapter_en']} ({v['chapter']})

"{quote(day)}"
{('' if day not in NOTE else chr(10) + NOTE[day] + chr(10))}
📿 Gita Jayanti series: 18 chapters, 18 verses, 18 days, ending on Gita Jayanti, 20 December 2026.

Credits
Sanskrit chant: Vāgdhenu, a Sanskrit chanting model by Prof. Prathosh A.P., IISc Bengaluru (Apache-2.0)
Narration: AI voice (ElevenLabs)
Translation: following the Gita Press edition
Animation: TheGodmanFiles

#BhagavadGita #GitaJayanti #Krishna"""
    pin = f'Day {day + 1} tomorrow: {teaser(day + 1)} 📿' if day < 18 else "Happy Gita Jayanti! 🪔 All 18 verses are in the playlist: Gita Jayanti: 18 Days, 18 Verses."
    tags = f"bhagavad gita, gita jayanti, bhagavad gita {ref}, {ytags}, krishna, sanskrit shloka, gita in english"
    out.append(f"""
---

## Day {day} · Bhagavad Gita {ref} · post {date}

Video `out/gita/gita-day{day:02d}-{ref}-vo.mp4` · cover `out/gita/cover-day{day:02d}.png` · rename audio **"Gita {ref} · Sanskrit chant"**

### Instagram caption
```
{ig}
```

### YouTube title ({len(yt_title)}/100)
```
{yt_title}
```

### YouTube description
```
{desc}
```

**Tags:** `{tags}`

**Pinned comment:** `{pin}`
""")
open(os.path.join(HERE, 'SHORTS_METADATA.md'), 'w').write('\n'.join(out))
print('wrote SHORTS_METADATA.md')
