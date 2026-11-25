"""Shared definitions for the Kubera Yantra verification scripts.

All squares are lists of rows (top row first). No external data is read.
"""
from itertools import permutations

KUBERA = [[27, 20, 25],
          [22, 24, 26],
          [23, 28, 21]]

# Lo Shu in the orientation conventionally printed in Chinese sources
# (south at the top, so 9 = south at top-centre, 1 = north at bottom-centre).
LOSHU_CN = [[4, 9, 2],
            [3, 5, 7],
            [8, 1, 6]]

# Khajuraho, Parsvanatha temple (OEIS A126710 row order).
KHAJURAHO = [[7, 12, 1, 14],
             [2, 13, 8, 11],
             [16, 3, 10, 5],
             [9, 6, 15, 4]]

# Varahamihira, Brhatsamhita 76.23-24 (Tripathi ed. via GRETIL):
# aguru 2, patra 3, turuska 5, saileya 8 / priyangu 5, musta 8, rasa 2, kesa 3 /
# sprkka 4, tvak 1, tagara 7, mamsi 6 / malaya 7, nakha 6, srika 4, kunduruka 1.
VARAHA = [[2, 3, 5, 8],
          [5, 8, 2, 3],
          [4, 1, 7, 6],
          [7, 6, 4, 1]]

VARAHA_INGREDIENTS = [["aguru", "patra", "turuska", "saileya"],
                      ["priyangu", "musta", "rasa", "kesa"],
                      ["sprkka", "tvak", "tagara", "mamsi"],
                      ["malaya", "nakha", "srika", "kunduruka"]]


def lines(sq):
    """All rows, columns and the two main diagonals of a square."""
    n = len(sq)
    out = [list(r) for r in sq]
    out += [[sq[i][j] for i in range(n)] for j in range(n)]
    out.append([sq[i][i] for i in range(n)])
    out.append([sq[i][n - 1 - i] for i in range(n)])
    return out


def is_magic(sq):
    s = {sum(l) for l in lines(sq)}
    return len(s) == 1


def magic_sum(sq):
    return sum(sq[0])


def broken_diagonals(sq):
    n = len(sq)
    d1 = [[sq[i][(i + k) % n] for i in range(n)] for k in range(n)]
    d2 = [[sq[i][(k - i) % n] for i in range(n)] for k in range(n)]
    return d1, d2


def is_pandiagonal(sq):
    if not is_magic(sq):
        return False
    s = magic_sum(sq)
    d1, d2 = broken_diagonals(sq)
    return all(sum(d) == s for d in d1 + d2)


def is_most_perfect_4(sq):
    """Order-4 'most-perfect': pandiagonal, every 2x2 block (wrapping) sums to S,
    and entries n/2 apart on a diagonal sum to S/2 (complementary pairs)."""
    n = 4
    if not is_pandiagonal(sq):
        return False
    s = magic_sum(sq)
    for i in range(n):
        for j in range(n):
            blk = (sq[i][j] + sq[i][(j + 1) % n] + sq[(i + 1) % n][j]
                   + sq[(i + 1) % n][(j + 1) % n])
            if blk != s:
                return False
            if sq[i][j] + sq[(i + 2) % n][(j + 2) % n] != s // 2:
                return False
    return True


# --- dihedral group D4 acting on square grids --------------------------------
def rot90(sq):
    """Rotate clockwise by 90 degrees."""
    n = len(sq)
    return [[sq[n - 1 - j][i] for j in range(n)] for i in range(n)]


def flip_h(sq):
    """Mirror left<->right (reflection in the vertical axis)."""
    return [list(reversed(r)) for r in sq]


def flip_v(sq):
    """Mirror top<->bottom (reflection in the horizontal axis)."""
    return [list(r) for r in reversed(sq)]


def transpose(sq):
    n = len(sq)
    return [[sq[j][i] for j in range(n)] for i in range(n)]


def anti_transpose(sq):
    return rot90(rot90(transpose(sq)))


def d4_elements():
    """Return (name, function) for the 8 elements of D4."""
    ident = lambda s: [list(r) for r in s]
    r1 = rot90
    r2 = lambda s: rot90(rot90(s))
    r3 = lambda s: rot90(rot90(rot90(s)))
    return [("identity", ident), ("rot90", r1), ("rot180", r2), ("rot270", r3),
            ("flip_vertical_axis(LR)", flip_h), ("flip_horizontal_axis(TB)", flip_v),
            ("transpose(main diag)", transpose), ("anti-transpose", anti_transpose)]


def orbit(sq):
    seen = []
    for _, f in d4_elements():
        t = f(sq)
        if t not in seen:
            seen.append(t)
    return seen


def canonical(sq):
    """Lexicographically smallest member of the D4 orbit (as a tuple)."""
    return min(tuple(x for r in t for x in r) for t in orbit(sq))


def add(sq, c):
    return [[x + c for x in r] for r in sq]


def fmt(sq):
    w = max(len(str(x)) for r in sq for x in r)
    return "\n".join("  " + " ".join(str(x).rjust(w) for x in r) for r in sq)


def all_normal_3x3():
    out = []
    for p in permutations(range(1, 10)):
        sq = [list(p[0:3]), list(p[3:6]), list(p[6:9])]
        if is_magic(sq):
            out.append(sq)
    return out
