# Kubera Yantra: Video Brief

*For the "Hidden in Plain Sight" long-form episode (12–14 min). Everything below is backed by `paper/kubera_yantra.pdf`, `SOURCES.md`, and the passages saved in `excerpts/`.*

Each claim carries a **solidity grade**:

- **A**: read directly in a primary text, or proved/computed by our code. Safe to state as fact.
- **B**: an interpretation that scholars hold, or a close reading of the text. Introduce it with "scholars read this as…" or "the text suggests…".
- **C**: our own new connection. Introduce it with "here's a pattern I noticed…" or "one way to read this…". Never call it "the secret the rishis encoded".

---

## 1. The 30-second version

The Kubera Yantra (27 20 25 / 22 24 26 / 23 28 21) is the ancient Chinese Lo Shu square (clearly documented by about the 1st century CE; legend makes it far older), flipped top-to-bottom, with 19 added to every number. The god it serves goes back to the Atharvaveda. There, Kubera's power is called **tirodhā, "concealment"**: he is a god of wealth that is hidden away. Kubera's best-known mantra comes from a 1588 manual, the *Mantramahodadhi*, and the seer of that mantra is his own father, Viśravas. The tradition's own explanation of how the yantra "brings and keeps" wealth depends less on the numbers than on Lakṣmī's checklist of conduct in the Mahābhārata.

---

## 2. Strongest verified facts (all grade A)

| # | Fact | Source |
|---|------|--------|
| 1 | Every row, column and diagonal of the Kubera square sums to 72, and the centre is 24 = 72 ÷ 3. | computed (`code/magic3.py`) |
| 2 | Kubera square − 19 = 8 1 6 / 3 5 7 / 4 9 2. This is the Lo Shu with its rows flipped top↔bottom. | computed; Lo Shu as printed in Chinese sources |
| 3 | There is essentially **one** 3×3 magic square of 1–9. All 8 versions are rotations or reflections of it. | proof + exhaustive search of 362,880 arrangements |
| 4 | Of 114 different 3×3 magic squares with distinct positive numbers summing to 72, **only one** uses nine consecutive numbers: Kubera's. | computed |
| 5 | Atharvaveda 8.10.28: the cosmic cow comes to the "Other Folk", who call her "Concealment!". Her calf is **Kubera Vaiśravaṇa**, and from her they milk **concealment (tirodhā)**. | AV Śaunaka 8.10.28 (TITUS) |
| 6 | Śatapatha Brāhmaṇa 13.4.3.10: "King Kubera Vaiśravaṇa; his people are the Rakṣas", and the people present that day are "evil-doers, robbers". | ŚB 13.4.3.10 (Eggeling, SBE 44) |
| 7 | The Mantrapuṣpam verse *rājādhirājāya prasahyasāhine…* is **Taittirīya Āraṇyaka 1.31.6**, part of a Vedic "Vaiśravaṇa sacrifice" (1.31). | Mitra's 1872 edition with Sāyaṇa |
| 8 | That same Vedic rite says: "Concealment was born from the waters". It offers the first rice-ball to "your **obstructing brother who lives in my heart**, so that he may not destroy my aims". It also says the rite must not be taught to the careless. | TA 1.31.1, 1.31.5 |
| 9 | Kubera asked Brahmā for "**lokapāla-hood and the protection of wealth**" (*vittarakṣaṇam*). He did not ask to be rich: he asked to be its guardian. Brahmā made him the 4th world-guardian and gave him the Puṣpaka. | Rāmāyaṇa 7.3.14–18 |
| 10 | Rāvaṇa demanded Laṅkā. Their father Viśravas told Kubera to leave for Kailāsa. Rāvaṇa later seized the Puṣpaka. | Rām. 7.11.27–41; 7.15.29 |
| 11 | **Ekapiṅgala**: Kubera's **left** eye fell on Pārvatī and was scorched yellow. Śiva, pleased with Kubera's 800-year vow, made him his **friend**: "your name will be Ekākṣi-piṅgala forever". | Rām. 7.13.21–30 |
| 12 | The Amarakośa's list of Kubera's names includes **Śrīda, "giver of Śrī/Lakṣmī"**, Tryambakasakha ("Śiva's friend"), Ekapiṅga and Naravāhana. It lists the **nine nidhis**: Mahāpadma, Padma, Śaṅkha, Makara, Kacchapa, Mukunda, Kunda, Nīla, Kharva. Kubera is the guardian of the **north**. | Amarakośa, Svargavarga |
| 13 | Mārkaṇḍeya Purāṇa 68: **eight** nidhis (Padma, Mahāpadma, Makara, Kacchapa, Mukunda, Nandaka, Nīla, Śaṅkha) serve the *Padminī vidyā*, whose presiding deity is **Lakṣmī**. Each nidhi shapes its owner's character. The Śaṅkha-owner eats well while his family eats poor rice. | MkP 68.4–47 (Dutt 1896) |
| 14 | **Mahābhārata 12.221**: Lakṣmī tells Indra she once lived with the asuras because they were truthful and generous. She left when their conduct reversed. Her list includes houses swept clean, rising before sunrise, never eating good food alone, grain scattered for crows and rats, admiring wealth earned unrighteously, and sleeping past sunrise. | MBh crit. ed. 12.221 = Ganguli §CCXXVIII |
| 15 | The famous **35-syllable mantra** is in the **Mantramahodadhi** of Mahīdhara (dated 1588 CE), taraṅga 16, verses 105–107. Its seer is **Viśravas**, its metre Bṛhatī, its deity "lord of wealth, friend of Śiva". The procedure: 100,000 japa, 10,000 sesame oblations, 10,000 japa in a Śiva temple for increase of wealth, or 100,000 japa sitting at the root of a **bilva** tree. | MM 16.105–111 |
| 16 | The Kulārṇava Tantra says the **yantra is to the deity what the body is to the soul**, and what oil is to a lamp. | Kulārṇava 6.85–87 |
| 17 | Varāhamihira (c. 550 CE) used a 4×4 square of perfume proportions in which every line sums to **18**, broken diagonals included. In the same chapter he counts 16-choose-4 = **1820** combinations, and uses a **9-cell grid**, choosing 3 of 9 to get **84** perfumes. | Bṛhatsaṃhitā 76.17–30; all numbers checked |
| 18 | Khajuraho's Pārśvanātha temple square (sum 34) is "most-perfect": every row, column, diagonal, broken diagonal and 2×2 block sums to 34. There are exactly 384 such 4×4 squares (48 up to rotation/reflection). | computed |
| 19 | In Agrippa's *Occult Philosophy* (1533), the 3×3 square belongs to **Saturn**. The square for **"gain and riches"** is Jupiter's 4×4, engraved on **silver**. | Agrippa II.22 |
| 20 | The Kubera kolam was used in a 2013 steganography paper (hiding data in images). | Amirtharajan et al., RJIT 5(3):304–316, doi:10.3923/rjit.2013.304.316 |

---

## 3. The "dot-connecting" reveals, ranked by wow-factor

| Rank | Reveal | Solidity | How to say it |
|---|---|---|---|
| 1 | **The Kubera Yantra is the Chinese Lo Shu in disguise.** Subtract 19 from every number and you get the turtle-shell square of ancient China, upside down. | **A** (math) | "Take 19 away from every number… and look what's left." |
| 2 | **The Vedic Kubera is a god of *concealment*.** AV 8.10.28: what is milked in Kubera's presence is *tirodhā*, "concealment". TA 1.31 opens with "Concealment was born from the waters". In Sanskrit, *nidhi* (treasure) and *tirodhā* (concealment) are both built on the root *dhā*, "to put/place": treasure is wealth that has been put away. | text **A**; reading **B/C** | "The oldest Kubera isn't a god of displayed wealth; he is a god of wealth that has been put away." Perfect for "Hidden in Plain Sight". |
| 3 | **Kubera never asked to be rich. He asked to be the *guardian* of wealth** (*vittarakṣaṇa*, Rām. 7.3.14). The tradition splits the job: Lakṣmī is the flow (she comes and goes), Kubera is the vault (he guards). | **A** text; the "flow/vault" framing is **C** | "Lakṣmī brings. Kubera keeps." Say it as the tradition's logic, not a guarantee. |
| 4 | **The obstacle lives in your heart.** The Vedic rite feeds the first offering to "your obstructing brother who lives in my heart". The Mahābhārata gives the other half: Lakṣmī leaves because of the asuras' own habits. | text **A**; linking them **C** | "The Vedic ritual itself already locates the blocker inside the worshipper." |
| 5 | **Lakṣmī's household checklist** (MBh 12.221): sweep the house, rise before the sun, share food, keep grain covered, don't admire ill-gotten money. The Mārkaṇḍeya says the same thing about the Śaṅkha-treasure owner who eats alone. | **A** each; the "one theory of retention" is **C** | Show it as a literal checklist on screen. |
| 6 | **The mantra's seer is Kubera's own father.** In MM 16 the ṛṣi of the 35-syllable mantra is Viśravas, the father who gave Kubera his name ("Vaiśravaṇa") and who told him to give up Laṅkā. | **A** | A nice emotional beat. |
| 7 | **Put North on top.** Lay the yantra with its top row toward the north (Kubera's direction). The north cell then holds 20, and 20 − 19 = 1, which is exactly the number the Chinese Lo Shu assigns to the north (the Water trigram). South gets 28 → 9 = Fire, south. If you also mirror east and west, all 9 cells match the Chinese directional scheme. | math **A**; "designed that way" **C** | "Coincidence, or design? No text tells us." Be honest about it. |
| 8 | **72 is unique.** 114 different magic squares add to 72, and only one uses nine numbers in a row. | **A** | Good on-screen counter animation (code-drawn). |
| 9 | **India puts the 3×3 square under the Sun; Europe put it under Saturn. Europe's "riches" square is Jupiter's, on silver. The Matsya Purāṇa places Jupiter in the North, Kubera's quarter.** | facts **A** (the Navagraha Sun-square is from secondary sources, so **B**); the link is **C** | "Two civilisations, two different squares for wealth… and they meet in the north." |
| 10 | **Varāhamihira, 1,400+ years ago**, built a perfume recipe where every line sums to 18, broken diagonals included, and in the same chapter counted 3-from-9 = 84 perfumes from a 9-cell grid. | **A** | Use it to show Indian magic squares are old and practical, not just mystical. |
| 11 | **Nine cells, nine treasures.** Write the Amarakośa's nine nidhis onto 20…28 in order. The 5th, *Kacchapa* (the **tortoise**), lands on the centre, 24. The Lo Shu legend says the square appeared on a **turtle's** back. | **C** (pure pattern; no text assigns nidhis to cells, and list orders differ) | Say outright: "No scripture says this; it's a pattern I found." |
| 12 | **Kolam drawing order**: Wikipedia's order (24, 28, 23, 22, 27, 20, 25, 26, 21) starts at the centre, then walks the outer ring clockwise, like a pradakṣiṇā. | geometry **A**; the order's source is a weak blog citation → **B−** | "One drawing tradition goes like this…" |
| 13 | **Hidden maths in every 3×3 magic square**: top row 27²+20²+25² = 1754 = bottom row 23²+28²+21². The same holds for the columns (1742). | **A**, but true of *every* 3×3 magic square | Present as a property of all 3×3 magic squares, not a Kubera secret. |
| 14 | **The kolam as encryption.** Engineers used it to scramble where data hides in a picture. Honest caveat: as a "password" it is only 3 bits strong (8 possible versions). | **A** | Nice modern ending. |

---

## 4. The mantras: exact texts, sources, meanings

### 4a. Vedic: *Rājādhirājāya* (Mantrapuṣpam)
**Source:** Taittirīya Āraṇyaka 1.31.6 (Kṛṣṇa Yajurveda), within the Vaiśravaṇa-yajña of TA 1.31. Verified in R. Mitra's 1872 edition with Sāyaṇa's commentary. In temple liturgy it is recited as part of the Mantrapuṣpam, after the "yo 'pāṃ puṣpaṃ veda" passage (TA 1.22). That sequence is liturgical practice, not one continuous Vedic passage. **Grade A.**

```
राजाधिराजाय प्रसह्यसाहिने । नमो वयं वैश्रवणाय कुर्महे ।
स मे कामान्कामकामाय मह्यम् । कामेश्वरो वैश्रवणो ददातु ।
कुबेराय वैश्रवणाय । महाराजाय नमः ॥
```
rājādhirājāya prasahyasāhine | namo vayaṃ vaiśravaṇāya kurmahe |
sa me kāmān kāmakāmāya mahyam | kāmeśvaro vaiśravaṇo dadātu |
kuberāya vaiśravaṇāya | mahārājāya namaḥ ||

| word | meaning |
|---|---|
| rājādhirājāya | to the king over kings |
| prasahya-sāhine | to the one who overpowers by force (Sāyaṇa seems to read: who can forcibly block gains; the OCR of this gloss is damaged) |
| namo … kurmahe | we make obeisance |
| vayam | we |
| vaiśravaṇāya | to Vaiśravaṇa, "son of Viśravas" |
| sa | he |
| me … mahyam | to me |
| kāmān | the things desired |
| kāma-kāmāya | to [me,] one who desires desires |
| kāmeśvaraḥ | lord of desires (Sāyaṇa: "master of all desires") |
| dadātu | may he give |
| kuberāya vaiśravaṇāya | to Kubera Vaiśravaṇa |
| mahārājāya namaḥ | homage to the Great King |

Syllables: 12 + 12 + 11 + 11 in the four verse lines, followed by two prose formulae.

### 4b. The 35-syllable Kubera mantra
**Source:** *Mantramahodadhi* of Mahīdhara, taraṅga 16, vv. 105–107 (text dated 1588 CE), with ṛṣi **Viśravas**, chandas **Bṛhatī**, devatā "lord of wealth, friend of Śiva". It is repeated in the *Mantra Mahārṇava*, which cites the Mantramahodadhi as its source. Drik Panchang gives the same ṛṣi and chandas but no source. **Grade A.**

```
(ॐ) यक्षाय कुबेराय वैश्रवणाय धनधान्याधिपतये धनधान्यसमृद्धिं मे देहि दापय स्वाहा ॥
```
(oṃ) yakṣāya kuberāya vaiśravaṇāya dhanadhānyādhipataye dhanadhānyasamṛddhiṃ me dehi dāpaya svāhā

| word | meaning |
|---|---|
| yakṣāya | to the Yakṣa (Kubera is king of the yakṣas) |
| kuberāya | to Kubera |
| vaiśravaṇāya | to the son of Viśravas |
| dhana-dhānya-adhipataye | to the overlord of wealth (dhana) and grain (dhānya) |
| dhana-dhānya-samṛddhim | abundance of wealth and grain |
| me | to me |
| dehi | give |
| dāpaya | **cause to be given**: a causative ("make it come to me", e.g. through others) |
| svāhā | the offering-call |

- **Count (code-verified):** 35 syllables **without** oṃ. The Naukā commentary writes "bāṇa-rāma-akṣaraḥ" = 35. With oṃ it is 36, exactly a classical Bṛhatī (4 × 9). Without oṃ it is a "one-short" (nicṛt) Bṛhatī; that last point is our interpretation (**B**).
- The text's six-fold *nyāsa* splits it 3 / 4 / 5 / 8 / 8 / 7, which we verified.
- **Meditation verse** (MM 16.109; the same verse appears on Drik Panchang):
  मनुजवाह्यविमानवरस्थितं गरुडरत्ननिभं निधिनायकम् । शिवसखं मुकुटादिविभूषितं वरगदे दधतं भज तुन्दिलम् ॥
  *manujavāhya-vimānavara-sthitaṃ garuḍaratna-nibhaṃ nidhināyakam / śivasakhaṃ mukuṭādi-vibhūṣitaṃ varagade dadhataṃ bhaja tundilam*
  "Worship the pot-bellied lord of treasures, seated in a fine aerial car borne by men, gleaming like the garuḍa-gem (emerald, per Bühnemann; the translators say blue sapphire), friend of Śiva, adorned with crown and ornaments, showing the boon-gesture and holding a mace."

### 4c. Other textual Kubera mantras (Grade A)
- **8-syllable:** ॐ वैश्रवणाय स्वाहा, *oṃ vaiśravaṇāya svāhā*. MM 9.81–84. It comes with a homa visualisation of Kubera in the fire, holding a golden pot of money and a jewel-box, seated under a banyan tree. Notably, this rite closes MM's worship of Bhū and **Śrī**.
- **16-syllable:** ॐ श्रीं ॐ ह्रीं श्रीं ह्रीं क्लीं श्रीं क्लीं वित्तेश्वराय नमः, *oṃ śrīṃ oṃ hrīṃ śrīṃ hrīṃ klīṃ śrīṃ klīṃ vitteśvarāya namaḥ*. MM 16.112–113, "destroys all poverty".
- **Grain mantra** (Dharmasindhu, 18th c.): ॐ धनदाय सर्वलोकहिताय देहि मे धान्यं स्वाहा, *oṃ dhanadāya sarvalokahitāya dehi me dhānyaṃ svāhā*. **Write it and put it in the granary** for increase of grain. This is a real textual precedent for keeping a written Kubera formula where wealth is stored. Our text is reconstructed from OCR, so the wording is **A−**.

### 4d. "Kubera Gāyatrī"
*oṃ yakṣarājāya vidmahe vaiśravaṇāya dhīmahi tanno kuberaḥ pracodayāt*. **No classical source found** in any text we searched. Call it "a popular devotional Gāyatrī".

---

## 5. Ritual conditions, with sources

| Condition | What the text says | Source | Grade |
|---|---|---|---|
| Direction | Kubera guards the **north** | Amarakośa 1.3; Rām. 7.3 | A |
| Vedic timing | the Vaiśravaṇa rite is for one who wants food or all desires, done **at every parvan** (new/full moon); also "after people are asleep" | TA 1.31 + Sāyaṇa quoting Baudhāyana | A |
| Japa / homa | 1,00,000 japa; 10,000 homas with sesame | MM 16.110 | A |
| Place | 10,000 japa in a **Śiva temple** "for increase of wealth"; or 1,00,000 japa **at the root of a bilva tree** | MM 16.111 | A |
| Yantra worship | gold (or other metal) image or yantra placed in a copper dish, anointed with ghee, bathed with milk and water, set in a sarvatobhadra maṇḍala, given **prāṇa-pratiṣṭhā**, then worshipped through a hexagon (six limbs) and an outer square (ten guardians) | Mantra Mahārṇava pp. 710–712 (citing MM) | A |
| General yantra rule | if no material is named, write on **bhūrja (birch bark), silk or palm leaf**; do japa and homa; soak in oblation-ghee; seal in a **gold, silver or copper** amulet; write the prāṇa-pratiṣṭhā mantra around it | MM 20.1–14 | A |
| Why a yantra works (insider theory) | yantra = deity's body; "worshipped in the yantra, the deity is pleased at once" | Kulārṇava 6.85–87 | A |
| Dīpāvalī | Āśvina new moon: morning oil-bath; at dusk lamps, torches and **Lakṣmī-pūjā**; after midnight the women drive **Alakṣmī** out of the courtyards | Dharmasindhu | A |
| Days | spending wealth or grain on **Wednesday or Saturday** is not auspicious | Dharmasindhu | A |
| Conduct | clean house, rise before the sun, share food, keep grain stored, don't envy, don't admire ill-gotten wealth | MBh 12.221 | A |
| Kubera on Dhanteras / with Lakṣmī on Dīpāvalī | living practice in modern manuals; **not** found in Dharmasindhu's Dīpāvalī section | Drik Panchang | practice (not scripture) |
| The numeric 27-20-25 yantra itself | **not** found in Mantramahodadhi, Mantra Mahārṇava, Śāradātilaka or Dharmasindhu | our search | say "popular tradition" |

---

## 6. The logic chain in plain English (the tradition's own reasoning, *not* a promise)

1. **Wealth is a person who chooses.** Lakṣmī lives where there is truth, generosity, cleanliness and effort, and leaves when they go (Mahābhārata).
2. **Treasures answer to her.** The nidhis are the "supports" of Lakṣmī's Padminī knowledge (Mārkaṇḍeya).
3. **Kubera is the keeper.** He asked to *guard* wealth, became lord of the nine treasures and of the North, and is called "giver of Śrī" (Rāmāyaṇa, Amarakośa).
4. **He can also block.** The Vedic rite feeds "the obstructing brother in my heart" so that he won't destroy one's aims (TA 1.31).
5. **A yantra is the god's body.** Install life in it with mantra, and the deity is present and "pleased at once" (Kulārṇava).
6. **The diagram is a little cosmos.** Nine cells = eight directions + centre. Every line sums to 72: no direction poorer than another. *(Our reading.)*
7. **The practice has conditions:** counts, places, days, the north (Mantramahodadhi, Dharmasindhu).
8. **Keeping wealth is about conduct.** The same faults that drove Lakṣmī from the asuras make wealth leak away (Mahābhārata + Mārkaṇḍeya). *(Joining these two is our synthesis.)*

Inside the tradition, then, "attract and retain" means that Lakṣmī comes through worship and conduct, and stays because Kubera guards and the devotee doesn't drive her away. **Say clearly on screen: this is what the tradition believes, not a scientific claim.**

---

## 7. Suggested 7-act structure (≈13 min)

| Act | Time | Content | Key visual (code-drawn only) |
|---|---|---|---|
| 1. The Hook | 0:00–1:30 | A rice-flour kolam: nine numbers, every line 72. "This square is far older than Kubera's famous mantra… and it's hiding something." Reveal: minus 19 → the Lo Shu. | animated grid, 19 subtracted cell-by-cell |
| 2. The Hidden God | 1:30–3:30 | Atharvaveda: Kubera's power is *tirodhā*, concealment. Śatapatha: king of rakṣas and robbers. TA 1.31: "Concealment born from the waters"; the "obstructing brother in my heart". | Sanskrit lines with transliteration |
| 3. The Guardian | 3:30–5:30 | Rāmāyaṇa: tapas, the boon of *vittarakṣaṇa*, 4th lokapāla, Puṣpaka, Laṅkā lost to Rāvaṇa, Kailāsa, the yellow eye and Śiva's friendship. Amarakośa's names (Śrīda!) and the nine nidhis. | map of quarters; name list |
| 4. The Code | 5:30–8:00 | The maths: one square only; centre = 72/3; the Navagraha family (Sun 15 … Ketu 39); Kubera at offset 19; 1 of 114; quadratic surprise; Varāhamihira's perfume square (18) and Khajuraho (34). | Fig. 2 and Fig. 3 from the paper; counters |
| 5. The Compass | 8:00–9:30 | North on top: 20 → Lo Shu's North "1"; the mirror makes 9/9. Agrippa: Saturn's 3-square, Jupiter's silver "riches" square; Matsya puts Jupiter in the north. *(Label: pattern, not proof.)* | rotating grid with N/E/S/W labels |
| 6. Lakṣmī's Conditions | 9:30–11:30 | MBh 12.221 checklist; Śaṅkha-nidhi miser; the 35-syllable mantra (seer: Viśravas, his father) and its rules: 1 lakh japa, Śiva temple, bilva tree; Dharmasindhu's granary mantra; Alakṣmī driven out at midnight. | checklist overlay; mantra karaoke text |
| 7. Hidden in Plain Sight | 11:30–13:00 | The logic chain; the honest line "the maths explains the balance, not the blessing"; the 2013 steganography paper (the kolam hides data). Close on the tirodhā idea: true wealth is guarded, not flaunted. | stego cover/stego/difference panel (Fig. 5) |

---

## 8. Claims to AVOID (false or unverified)

- ❌ "The Kubera Yantra is described in the Vedas/Purāṇas." We found **no** pre-modern text with the numeric square. The textual "Kubera yantra" is a hexagon-in-square enclosure diagram, not numbers.
- ❌ "Rishis chose 72 because of 72,000 nāḍīs / 72 melakartas / precession." No text links any of these to Kubera. The 72,000 channels (Bṛhadāraṇyaka 2.1.19) are real but unrelated; precession is ~71.6 years per degree, not 72.
- ❌ "The yantra guarantees money" or "scientifically proven". Never say this. You may say "devotees believe…".
- ❌ "Kubera Gāyatrī is Vedic." No source found.
- ❌ "The 35-syllable mantra is Vedic / from the Taittirīya." It is from a **1588** tantric manual (Mantramahodadhi). Only *rājādhirājāya* is Vedic (TA 1.31.6).
- ❌ "Dhanteras Kubera-pūjā is ordained in scripture." It is living practice. Dharmasindhu's Dīpāvalī section names Lakṣmī-pūjā, not Kubera.
- ❌ "Hayashi wrote 'Islamic and Indian Magic Squares' in Isis." It was **Schuyler Cammann**, *History of Religions* 8 (1969).
- ❌ "Varāhamihira 587 CE" as the date of the square. The Bṛhatsaṃhitā is usually dated **c. 550 CE**; 587 is his often-cited death year.
- ❌ "Khajuraho square carved in the 10th century" stated flatly. The temple is c. 950–970, but some authors date the square's inscription to the 12th–13th c. Say "on a 10th-century temple".
- ❌ "Lakṣmī's 8th companion is Jayā" as *the* text. True of the vulgate (Ganguli); the critical edition (12.221.82) has Vṛtti.
- ❌ "Kubera's eye was burned by Śiva." In the Rāmāyaṇa it was **Pārvatī's** power that scorched his **left** eye; Śiva then made him a friend.
- ❌ Anything calling the nidhi-to-cell mapping or the "north-on-top" alignment ancient or intentional. Both are **our** patterns.
- ⚠️ The "Navagraha Sun square = Lo Shu" attribution to "Garga" comes from secondary literature; we did not see the primary text.
- ⚠️ The NCERT *Ganita Prakash* (Class 7) appears to show the Kubera yantra according to a tutoring site, but we could not open the NCERT PDF. Don't cite it.

---

## 9. Pronunciation crib
Vaiśravaṇa = *vai-SHRA-va-na*; Viśravas = *vi-SHRA-vas*; tirodhā = *ti-RO-dhaa*; nidhi = *ni-dhi*; vittarakṣaṇa = *vit-ta-RAK-sha-na*; Mantramahodadhi = *man-tra-ma-HO-da-dhi*; Kulārṇava = *ku-LAAR-na-va*; Ekākṣipiṅgala = *e-KAAK-shi-PING-ga-la*.
