"""Count akshara (syllables) in the Kubera mantras from their IAST text.

A syllable = one vowel nucleus (a ā i ī u ū ṛ ṝ ḷ e ai o au). Anusvara (ṃ) and
visarga (ḥ) do not add syllables. This is the standard counting used for
mantra lengths and Vedic metre.
"""
import re

VOWEL = re.compile(r"ai|au|[aāiīuūṛṝḷeo]")


def syllables(s):
    s = s.lower().replace("-", "").replace("'", "")
    return len(VOWEL.findall(s))


MANTRAS = {
    # Mantramahodadhi 16.105-107 (Mahidhara, 1588 CE); Nauka: 'bana-rama-aksarah' = 35
    "MM 16.105-107 (no om)": "yakṣāya kuberāya vaiśravaṇāya dhanadhānyādhipataye "
                             "dhanadhānyasamṛddhiṃ me dehi dāpaya svāhā",
    "same with initial om": "oṃ yakṣāya kuberāya vaiśravaṇāya dhanadhānyādhipataye "
                            "dhanadhānyasamṛddhiṃ me dehi dāpaya svāhā",
    # Mantramahodadhi 9.81-84: 'the eight-syllabled mantra of Kubera'
    "MM 9.81-84 (8 syllables)": "oṃ vaiśravaṇāya svāhā",
    # Mantramahodadhi 16.112-113: 'sixteen-syllabled mantra'
    "MM 16.112-113 (16 syllables)": "oṃ śrīṃ oṃ hrīṃ śrīṃ hrīṃ klīṃ śrīṃ klīṃ vitteśvarāya namaḥ",
}

SADANGA = ["yakṣāya", "kuberāya", "vaiśravaṇāya", "dhanadhānyādhipataye",
           "dhanadhānyasamṛddhiṃ me", "dehi dāpaya svāhā"]

TA_1_31_6 = ["rājādhirājāya prasahyasāhine", "namo vayaṃ vaiśravaṇāya kurmahe",
             "sa me kāmān kāmakāmāya mahyam", "kāmeśvaro vaiśravaṇo dadātu",
             "kuberāya vaiśravaṇāya", "mahārājāya namaḥ"]

if __name__ == "__main__":
    for k, v in MANTRAS.items():
        print(f"{k:32s} {syllables(v):3d}  | {v}")
    parts = [syllables(p) for p in SADANGA]
    print("\nsadanga split of the 35-syllable mantra:", parts, "sum", sum(parts),
          "(MM 16.108 prescribes 3,4,5,8,8,7)")
    print("classical Brhati = 4 x 9 = 36 syllables; 35 = 'nicrt' (one short) form; 36 with om")
    print("\nTaittiriya Aranyaka 1.31.6 (Mantrapuspam verse) syllables per line:")
    for p in TA_1_31_6:
        print(f"  {syllables(p):3d}  {p}")
    print("  first four padas: 12 + 12 + 11 + 11 (Jagati/Tristubh mixture); "
          "last two lines are prose formulae")
