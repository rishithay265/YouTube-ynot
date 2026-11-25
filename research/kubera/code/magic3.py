"""Order-3 results for the Kubera Yantra paper.

Every printed claim is computed here; run `python3 magic3.py`.
"""
from fractions import Fraction
from itertools import permutations, product
from common import (KUBERA, LOSHU_CN, lines, is_magic, magic_sum, d4_elements,
                    orbit, canonical, add, fmt, all_normal_3x3, flip_v, flip_h)


def section(t):
    print("\n" + "=" * 72 + "\n" + t + "\n" + "=" * 72)


# ---------------------------------------------------------------------------
section("T1. Normal 3x3 magic squares (entries 1..9): exhaustive search over 9! = 362880")
sqs = all_normal_3x3()
print("number found:", len(sqs))
canon = {canonical(s) for s in sqs}
print("distinct D4-orbits:", len(canon))
print("orbit size of Lo Shu:", len(orbit(LOSHU_CN)))
print("every square found lies in the Lo Shu orbit:",
      all(s in orbit(LOSHU_CN) for s in sqs))
print("centre of every one = 5:", all(s[1][1] == 5 for s in sqs))
print("corners always even, edges always odd:",
      all(all(s[i][j] % 2 == 0 for i, j in [(0, 0), (0, 2), (2, 0), (2, 2)]) and
          all(s[i][j] % 2 == 1 for i, j in [(0, 1), (1, 0), (1, 2), (2, 1)]) for s in sqs))

# ---------------------------------------------------------------------------
section("T2. Centre lemma: in ANY 3x3 magic square (real entries) centre = S/3")
# Linear-algebra certificate: middle row + middle column + both diagonals
# count the centre 4 times and every other cell once; total = 4S.
# All nine cells once = 3S (three rows). Hence 3c = 4S - 3S + ... -> c = S/3.
coeff = [[0] * 3 for _ in range(3)]
for (i, j) in [(1, 0), (1, 1), (1, 2), (0, 1), (2, 1), (0, 0), (2, 2), (0, 2), (2, 0)]:
    pass
# build the four lines through the centre and count multiplicities
four = [[(1, 0), (1, 1), (1, 2)], [(0, 1), (1, 1), (2, 1)],
        [(0, 0), (1, 1), (2, 2)], [(0, 2), (1, 1), (2, 0)]]
for l in four:
    for (i, j) in l:
        coeff[i][j] += 1
print("multiplicity of each cell in the 4 centre lines:")
print(fmt(coeff))
print("=> sum(4 lines) = 4S = (sum of all cells) + 3c = 3S + 3c  => c = S/3")
# exhaustive numeric check on random-free grid: all magic squares with entries 0..6
cnt = 0
ok = True
for a, b, c in product(range(-6, 7), repeat=3):
    sq = [[c - b, c + a + b, c - a], [c - a + b, c, c + a - b], [c + a, c - a - b, c + b]]
    assert is_magic(sq)
    ok &= (3 * sq[1][1] == magic_sum(sq))
    cnt += 1
print(f"checked {cnt} parametrised squares: centre*3 == S always:", ok)

# Dimension of the solution space of the 8 magic equations (Lucas 1891 form):
# unknowns x0..x8, equations: each line sum equal to the first row sum.
def rank(mat):
    m = [[Fraction(x) for x in r] for r in mat]
    rk, cols = 0, len(m[0])
    for c in range(cols):
        piv = next((r for r in range(rk, len(m)) if m[r][c] != 0), None)
        if piv is None:
            continue
        m[rk], m[piv] = m[piv], m[rk]
        for r in range(len(m)):
            if r != rk and m[r][c] != 0:
                f = m[r][c] / m[rk][c]
                m[r] = [x - f * y for x, y in zip(m[r], m[rk])]
        rk += 1
    return rk

idx = [[0, 1, 2], [3, 4, 5], [6, 7, 8]]
L = [[idx[i][0], idx[i][1], idx[i][2]] for i in range(3)]
L += [[idx[0][j], idx[1][j], idx[2][j]] for j in range(3)]
L += [[0, 4, 8], [2, 4, 6]]
rows = []
for l in L[1:]:
    v = [0] * 9
    for k in l:
        v[k] += 1
    for k in L[0]:
        v[k] -= 1
    rows.append(v)
rk = rank(rows)
print("rank of the 7 independent-looking line equations:", rk,
      "-> solution space dimension =", 9 - rk, "(3 parameters a, b, c)")

# ---------------------------------------------------------------------------
section("T3. Consecutive integers k..k+8: S = 3k+12, centre = k+4, exactly 8 squares")
for k in [20, -3, 0, 1, 7, 19, 100]:
    vals = list(range(k, k + 9))
    found = []
    for p in permutations(vals):
        sq = [list(p[0:3]), list(p[3:6]), list(p[6:9])]
        if is_magic(sq):
            found.append(sq)
    S = {magic_sum(s) for s in found}
    C = {s[1][1] for s in found}
    print(f"k={k:4d}: squares={len(found)}  sums={S} (3k+12={3*k+12})  centres={C} (k+4={k+4})"
          f"  all = LoShu+(k-1): {all(s in orbit(add(LOSHU_CN, k-1)) for s in found)}")

# ---------------------------------------------------------------------------
section("T4. The Kubera square")
print(fmt(KUBERA))
print("is magic:", is_magic(KUBERA), " magic sum:", magic_sum(KUBERA),
      " centre:", KUBERA[1][1], " entries:", sorted(x for r in KUBERA for x in r))
print("line sums:", [sum(l) for l in lines(KUBERA)])
K19 = add(KUBERA, -19)
print("Kubera - 19 =")
print(fmt(K19))
print("Lo Shu as conventionally printed (south at top):")
print(fmt(LOSHU_CN))
for name, f in d4_elements():
    if f(LOSHU_CN) == K19:
        print("D4 element g with g(LoShu_CN) = Kubera-19:", name)
print("check: flip top<->bottom of Lo Shu + 19 == Kubera:", add(flip_v(LOSHU_CN), 19) == KUBERA)
print("Kubera-19 mirrored left<->right =")
print(fmt(flip_h(K19)))
print("(this 6 1 8 / 7 5 3 / 2 9 4 layout is the Lo Shu drawn with NORTH at top and EAST at right)")

# Lucas parameters (a, b, c) of Kubera
c = KUBERA[1][1]
a = KUBERA[2][0] - c        # bottom-left = c + a
b = KUBERA[2][2] - c        # bottom-right = c + b
lucas = [[c - b, c + a + b, c - a], [c - a + b, c, c + a - b], [c + a, c - a - b, c + b]]
print(f"Lucas form with c={c}, a={a}, b={b} reproduces Kubera:", lucas == KUBERA)

# ---------------------------------------------------------------------------
section("T5. Hidden quadratic identities (follow from magic-ness; shown, not mystical)")
r1, r3 = KUBERA[0], KUBERA[2]
c1 = [KUBERA[i][0] for i in range(3)]
c3 = [KUBERA[i][2] for i in range(3)]
print("sum of squares, top row   :", sum(x * x for x in r1))
print("sum of squares, bottom row:", sum(x * x for x in r3))
print("sum of squares, left col  :", sum(x * x for x in c1))
print("sum of squares, right col :", sum(x * x for x in c3))
# general proof check over the Lucas family
okq = True
for a_, b_, c_ in product(range(-5, 6), repeat=3):
    sq = [[c_ - b_, c_ + a_ + b_, c_ - a_], [c_ - a_ + b_, c_, c_ + a_ - b_],
          [c_ + a_, c_ - a_ - b_, c_ + b_]]
    okq &= sum(x * x for x in sq[0]) == sum(x * x for x in sq[2])
    okq &= sum(sq[i][0] ** 2 for i in range(3)) == sum(sq[i][2] ** 2 for i in range(3))
print("identity holds for every 3x3 magic square in a 11^3 parameter grid:", okq)
# Lo Shu 'palindromic' digit-row identity
rows = ["".join(map(str, r)) for r in LOSHU_CN]
fw = sum(int(s) ** 2 for s in rows)
bw = sum(int(s[::-1]) ** 2 for s in rows)
print(f"Lo Shu rows as numbers {rows}: sum of squares {fw}; reversed rows: {bw}; equal: {fw == bw}")
rowsK = [r for r in KUBERA]
fwK = sum((r[0] * 10000 + r[1] * 100 + r[2]) ** 2 for r in rowsK)
bwK = sum((r[2] * 10000 + r[1] * 100 + r[0]) ** 2 for r in rowsK)
print(f"Kubera rows read in base 100 (e.g. 27|20|25): forward {fwK} reversed {bwK} equal: {fwK == bwK}")

# ---------------------------------------------------------------------------
section("T6. The Navagraha arithmetic family and the position of 72")
names = ["Surya", "Candra", "Mangala", "Budha", "Guru", "Sukra", "Sani", "Rahu", "Ketu"]
for k, n in enumerate(names):
    sq = add(LOSHU_CN, k)
    print(f"{n:8s} offset {k}: entries {k+1}..{k+9}, sum {magic_sum(sq)}, centre {sq[1][1]}")
print("Kubera offset 19: entries 20..28, sum", 15 + 3 * 19, "centre", 5 + 19)
print("72 is in the progression 15+3m for m =", (72 - 15) // 3, "(not among m = 0..8)")
print("any 3x3 square of consecutive integers has S divisible by 3:",
      all((3 * k + 12) % 3 == 0 for k in range(-100, 100)))

# ---------------------------------------------------------------------------
section("T7. How special is 'consecutive' for S = 72? count 3x3 magic squares with DISTINCT POSITIVE integers and S = 72")
c = 24
sols = set()
for a_ in range(-23, 24):
    for b_ in range(-23, 24):
        sq = [[c - b_, c + a_ + b_, c - a_], [c - a_ + b_, c, c + a_ - b_],
              [c + a_, c - a_ - b_, c + b_]]
        flat = [x for r in sq for x in r]
        if min(flat) >= 1 and len(set(flat)) == 9:
            sols.add(canonical(sq))
print("essentially different (up to D4) magic squares, distinct positive entries, S=72:", len(sols))
consec = [s for s in sols if sorted(s) == list(range(min(s), min(s) + 9))]
print("of these, using 9 consecutive integers:", len(consec), "->", consec)

# ---------------------------------------------------------------------------
section("T8. Numbers around 72 (each later classified in the paper)")
tot = sum(x for r in KUBERA for x in r)
print("total of all nine cells:", tot, "= 3*72 =", 3 * 72, "= 2*108 =", 2 * 108, "= 6^3 =", 6 ** 3)
print("72 = 8*9 =", 8 * 9, "; 72 = 3*24 =", 3 * 24)
print("precession: 360 deg / 25772 yr -> years per degree = %.2f" % (25772 / 360))
print("melakarta count 72 = 2 (madhyama) * 6 (ri-ga) * 6 (dha-ni) =", 2 * 6 * 6)

# ---------------------------------------------------------------------------
section("T9. Kolam drawing order reported by Wikipedia (24,28,23,22,27,20,25,26,21)")
order = [24, 28, 23, 22, 27, 20, 25, 26, 21]
pos = {KUBERA[i][j]: (i, j) for i in range(3) for j in range(3)}
names_pos = {(0, 0): "top-left", (0, 1): "top", (0, 2): "top-right", (1, 0): "left",
             (1, 1): "centre", (1, 2): "right", (2, 0): "bottom-left", (2, 1): "bottom",
             (2, 2): "bottom-right"}
print(" -> ".join(f"{v}({names_pos[pos[v]]})" for v in order))
ring = [(2, 1), (2, 0), (1, 0), (0, 0), (0, 1), (0, 2), (1, 2), (2, 2)]
path = [pos[v] for v in order[1:]]
print("after the centre, the order walks the outer ring clockwise starting at bottom-centre:",
      path == ring)
