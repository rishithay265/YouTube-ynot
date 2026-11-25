"""Order-4 results: Varahamihira (Brhatsamhita 76), Khajuraho, and counts.

Enumerates all normal 4x4 pandiagonal squares and all normal 4x4 magic
squares with a forward-checking constraint solver, then classifies the
historical squares. Run `python3 magic4.py`.
"""
from math import comb
from common import (KHAJURAHO, VARAHA, VARAHA_INGREDIENTS, is_magic, is_pandiagonal,
                    is_most_perfect_4, magic_sum, orbit, canonical, fmt, lines,
                    broken_diagonals)

N = 4
S = 34
CELLS = [(i, j) for i in range(N) for j in range(N)]


def build_lines(pandiagonal):
    L = [[(i, j) for j in range(N)] for i in range(N)]
    L += [[(i, j) for i in range(N)] for j in range(N)]
    if pandiagonal:
        L += [[(i, (i + k) % N) for i in range(N)] for k in range(N)]
        L += [[(i, (k - i) % N) for i in range(N)] for k in range(N)]
    else:
        L += [[(i, i) for i in range(N)], [(i, N - 1 - i) for i in range(N)]]
    return L


def enumerate_squares(pandiagonal):
    L = build_lines(pandiagonal)
    lines_of = {c: [l for l in L if c in l] for c in CELLS}
    grid = {}
    used = [False] * 17
    out = []

    def consistent(cell):
        for l in lines_of[cell]:
            filled = [grid[c] for c in l if c in grid]
            s = sum(filled)
            if len(filled) == N and s != S:
                return False
            if len(filled) < N and s >= S:
                return False
            if len(filled) == N - 1:
                need = S - s
                if need < 1 or need > 16 or used[need]:
                    return False
        return True

    def rec(k):
        if k == len(CELLS):
            out.append([[grid[(i, j)] for j in range(N)] for i in range(N)])
            return
        cell = CELLS[k]
        # forced value if some line through the cell is otherwise complete
        forced = None
        for l in lines_of[cell]:
            others = [c for c in l if c != cell]
            if all(c in grid for c in others):
                v = S - sum(grid[c] for c in others)
                if forced is None:
                    forced = v
                elif forced != v:
                    return
        cand = [forced] if forced is not None else range(1, 17)
        for v in cand:
            if v < 1 or v > 16 or used[v]:
                continue
            grid[cell] = v
            used[v] = True
            if consistent(cell):
                rec(k + 1)
            used[v] = False
            del grid[cell]

    rec(0)
    return out


def section(t):
    print("\n" + "=" * 72 + "\n" + t + "\n" + "=" * 72)


if __name__ == "__main__":
    section("C1. Normal 4x4 pandiagonal magic squares")
    pan = enumerate_squares(pandiagonal=True)
    print("total pandiagonal squares:", len(pan))
    print("up to the 8 symmetries of the square (D4):", len({canonical(s) for s in pan}))
    print("all of them are 'most-perfect' (2x2 blocks = 34, diagonal complements = 17):",
          all(is_most_perfect_4(s) for s in pan))

    section("C2. All normal 4x4 magic squares (Frenicle 1693 count check)")
    allsq = enumerate_squares(pandiagonal=False)
    print("total:", len(allsq), " up to D4:", len({canonical(s) for s in allsq}))
    print("fraction that are pandiagonal:", f"{len(pan)}/{len(allsq)}")

    section("C3. Khajuraho, Parsvanatha temple square")
    print(fmt(KHAJURAHO))
    print("magic:", is_magic(KHAJURAHO), " sum:", magic_sum(KHAJURAHO),
          " pandiagonal:", is_pandiagonal(KHAJURAHO),
          " most-perfect:", is_most_perfect_4(KHAJURAHO),
          " in enumerated pandiagonal set:", KHAJURAHO in pan)
    d1, d2 = broken_diagonals(KHAJURAHO)
    print("broken-diagonal sums:", [sum(d) for d in d1], [sum(d) for d in d2])

    section("C4. Varahamihira, Brhatsamhita 76.23-25 (kacchaputa of 16 cells, 'astadasa bhagah')")
    for r, nm in zip(VARAHA, VARAHA_INGREDIENTS):
        print("  " + "  ".join(f"{n}:{v}" for n, v in zip(nm, r)))
    print("line sums (rows, cols, diagonals):", [sum(l) for l in lines(VARAHA)])
    print("pandiagonal:", is_pandiagonal(VARAHA), " magic sum:", magic_sum(VARAHA),
          " (text: 'ye 'tra astadasa bhagah' = 18 parts)")
    d1, d2 = broken_diagonals(VARAHA)
    print("broken-diagonal sums:", [sum(d) for d in d1], [sum(d) for d in d2])
    blocks = [VARAHA[i][j] + VARAHA[i][(j+1) % 4] + VARAHA[(i+1) % 4][j] + VARAHA[(i+1) % 4][(j+1) % 4]
              for i in range(4) for j in range(4)]
    print("all 16 wrapped 2x2 blocks sum to 18:", set(blocks) == {18})
    print("multiset of entries:", sorted(x for r in VARAHA for x in r), "(two copies of 1..8)")
    # Relation to normal pandiagonal squares: does reducing entries >8 by 8 give VARAHA?
    hits = [s for s in pan if [[x - 8 if x > 8 else x for x in r] for r in s] == VARAHA]
    print("normal pandiagonal squares P with (P mod 8, using 8 for 0) == Varaha square:", len(hits))
    for h in hits:
        print(fmt(h))
        print("   is it in the Khajuraho D4 orbit?", h in orbit(KHAJURAHO),
              "; canonical form equal to Khajuraho's?", canonical(h) == canonical(KHAJURAHO))
    hitsD4 = [s for s in pan if any([[x - 8 if x > 8 else x for x in r] for r in t] == VARAHA
                                     for t in [s])]
    # also: add 8 to the cells of the 2nd and 4th rows? (test the simplest pattern)
    add8 = [[VARAHA[i][j] + (8 if i in (1, 3) else 0) for j in range(4)] for i in range(4)]
    print("Varaha + 8 on rows 2 and 4:")
    print(fmt(add8))
    print("   normal? ", sorted(x for r in add8 for x in r) == list(range(1, 17)),
          " magic?", is_magic(add8), " pandiagonal?", is_pandiagonal(add8))
    add8c = [[VARAHA[i][j] + (8 if j in (2, 3) else 0) for j in range(4)] for i in range(4)]
    for name, cand in [("+8 on columns 3,4", add8c)]:
        print(name, "normal?", sorted(x for r in cand for x in r) == list(range(1, 17)),
              "pandiagonal?", is_pandiagonal(cand))

    section("C5. Brhatsamhita 76 combinatorics stated in the text")
    print("76.20: 16 substances taken 4 at a time: C(16,4) =", comb(16, 4), "(text: 18 hundreds + 20 = 1820)")
    print("76.19: proportions 1,2,3,4 over 4 substances: 4! =", 24, "; text total per set 96 = 4*24 =", 4 * 24)
    print("76.17: 1820 * 96 =", 1820 * 96, "; text: laksa + 4 sahasra + 70 sahasra + 7 sata + 20 =",
          100000 + 4000 + 70000 + 700 + 20)
    print("76.29-30: nine-cell kacchaputa, choose 3 of 9: C(9,3) =", comb(9, 3),
          "(text: kesaragandhas caturasitih = 84)")

    section("C6. European comparanda (layouts as commonly reproduced; see paper caveat)")
    DURER = [[16, 3, 2, 13], [5, 10, 11, 8], [9, 6, 7, 12], [4, 15, 14, 1]]
    AGRIPPA_JUP = [[4, 14, 15, 1], [9, 7, 6, 12], [5, 11, 10, 8], [16, 2, 3, 13]]
    for nm, sq in [("Durer, Melencolia I (1514)", DURER), ("Agrippa, table of Jupiter", AGRIPPA_JUP)]:
        print(nm, "magic:", is_magic(sq), "sum:", magic_sum(sq), "pandiagonal:", is_pandiagonal(sq),
              "same D4 orbit as Durer:", canonical(sq) == canonical(DURER),
              "same D4 orbit as Khajuraho:", canonical(sq) == canonical(KHAJURAHO))
