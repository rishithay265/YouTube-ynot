"""Cosmogram mapping: which number of the Kubera square falls in which quarter
under each drawing convention, compared with (i) the Lo Shu / Later-Heaven
directional numbering, (ii) the eight dikpalas (Amarakosa 1.3), (iii) the
navagraha placement of Matsya Purana 93.11-12, and (iv) an explicitly
HYPOTHETICAL nine-nidhi labelling (Amarakosa order -> 20..28).
"""
from common import KUBERA, add

# Directions as (row, col) for "North up, East right" (modern map view from above)
N_UP_E_RIGHT = {(0, 0): "NW", (0, 1): "N", (0, 2): "NE",
                (1, 0): "W", (1, 1): "C", (1, 2): "E",
                (2, 0): "SW", (2, 1): "S", (2, 2): "SE"}


def rotate_map(m, quarter_turns_ccw):
    """Rotate the drawing (not the world) counter-clockwise."""
    out = dict(m)
    for _ in range(quarter_turns_ccw):
        out = {(2 - j, i): d for (i, j), d in out.items()}
    return out


def mirror_lr(m):
    return {(i, 2 - j): d for (i, j), d in m.items()}


CONVENTIONS = {
    "North-up, East-right (modern map)": N_UP_E_RIGHT,
    "East-up, North-left (Vastu-mandala plans)": rotate_map(N_UP_E_RIGHT, 1),
    "South-up, East-left (Chinese Lo Shu convention)": rotate_map(N_UP_E_RIGHT, 2),
    "West-up": rotate_map(N_UP_E_RIGHT, 3),
    "North-up, East-left (mirror)": mirror_lr(N_UP_E_RIGHT),
}

LATER_HEAVEN = {"N": 1, "SW": 2, "E": 3, "SE": 4, "C": 5, "NW": 6, "W": 7, "NE": 8, "S": 9}
TRIGRAM = {1: "Kan (water)", 2: "Kun", 3: "Zhen", 4: "Xun", 5: "-", 6: "Qian",
           7: "Dui", 8: "Gen", 9: "Li (fire)"}
# Amarakosa 1.3 (GRETIL e-text lines 1.3.178-179): indro vahniH pitRpatir nairRto
# varuNo marut / kubera IzaH patayaH pUrvAdInAM dizAM kramAt
DIKPALA = {"E": "Indra", "SE": "Agni", "S": "Yama", "SW": "Nirrti", "W": "Varuna",
           "NW": "Vayu (Marut)", "N": "KUBERA", "NE": "Isa", "C": "(Brahma, not in list)"}
# Matsya Purana 93.11-12 (GRETIL): madhye tu bhaskaram ... lohitam daksinena,
# uttarena gurum, budham purvottarena, purvena bhargavam, somam daksinapurvake,
# pascimena sanim, rahum pascimadaksine, pascimottaratah ketum
GRAHA = {"C": "Surya", "S": "Mangala", "N": "Guru (Jupiter)", "NE": "Budha",
         "E": "Sukra", "SE": "Candra", "W": "Sani", "SW": "Rahu", "NW": "Ketu"}
# HYPOTHESIS ONLY: Amarakosa 1.1 nidhi list order mapped onto 20..28
NIDHI_AK = ["Mahapadma", "Padma", "Sankha", "Makara", "Kacchapa",
            "Mukunda", "Kunda", "Nila", "Kharva"]
NIDHI_OF = {20 + i: n for i, n in enumerate(NIDHI_AK)}

ORDER = ["N", "NE", "E", "SE", "S", "SW", "W", "NW", "C"]

if __name__ == "__main__":
    K19 = add(KUBERA, -19)
    for name, conv in CONVENTIONS.items():
        val = {d: KUBERA[i][j] for (i, j), d in conv.items()}
        agree = sum(1 for d in ORDER if val[d] - 19 == LATER_HEAVEN[d])
        print("\n" + name)
        print(f"  {'dir':3s} {'Kubera':>6s} {'-19':>4s} {'LoShu':>5s}  {'dikpala':14s} {'graha (MtP 93)':16s} nidhi-hypothesis")
        for d in ORDER:
            v = val[d]
            print(f"  {d:3s} {v:6d} {v-19:4d} {LATER_HEAVEN[d]:5d}  {DIKPALA[d]:14s} {GRAHA[d]:16s} {NIDHI_OF[v]}")
        print(f"  cells agreeing with Later-Heaven Lo Shu numbering: {agree}/9")
        print(f"  number in KUBERA's own quarter (North): {val['N']}  (Lo Shu value {val['N']-19})")

    # Is the Matsya navagraha layout itself a magic square if the grahas are
    # numbered in their canonical order Surya=1 ... Ketu=9?
    order9 = ["Surya", "Candra", "Mangala", "Budha", "Guru (Jupiter)", "Sukra", "Sani", "Rahu", "Ketu"]
    num = {g: i + 1 for i, g in enumerate(order9)}
    conv = N_UP_E_RIGHT
    sq = [[0] * 3 for _ in range(3)]
    for (i, j), d in conv.items():
        sq[i][j] = num[GRAHA[d]]
    from common import is_magic, fmt, lines
    print("\nMatsya 93 layout with grahas numbered 1..9 in canonical weekday-list order (N up):")
    print(fmt(sq))
    print("line sums:", [sum(l) for l in lines(sq)], " magic?", is_magic(sq))
    print("\nHypothetical nidhi labelling: centre value 24 ->", NIDHI_OF[24],
          "(5th of 9 in the Amarakosa list)")
