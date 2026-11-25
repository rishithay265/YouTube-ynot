"""Generate the paper's data figures (vector PDF) into ../paper/figs/.

Palette: blue #257de0 (Navagraha family / data) and orange #f47230 (Kubera /
highlight), validated for colour-vision deficiency; every mark is also
direct-labelled so colour never carries identity alone.
"""
import os
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle
from common import KUBERA, KHAJURAHO, VARAHA
from directions import CONVENTIONS

BLUE, ORANGE, INK, MUTED, GRID = "#257de0", "#f47230", "#1a1a1a", "#6b6b6b", "#d9d9d9"
OUT = os.path.join(os.path.dirname(__file__), "..", "paper", "figs")
os.makedirs(OUT, exist_ok=True)
plt.rcParams.update({"font.family": "serif", "font.size": 8, "axes.edgecolor": MUTED,
                     "axes.labelcolor": INK, "xtick.color": MUTED, "ytick.color": MUTED,
                     "pdf.fonttype": 42})

# --- Fig. 2: the affine family S = 15 + 3m -----------------------------------
names = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"]
fig, ax = plt.subplots(figsize=(3.4, 2.3))
m = np.arange(0, 22)
ax.plot(m, 15 + 3 * m, color=GRID, lw=1.2, zorder=1)
ax.scatter(range(9), [15 + 3 * k for k in range(9)], s=22, color=BLUE, zorder=3,
           edgecolor="white", linewidth=0.8)
for k, n in enumerate(names):
    if k in (0, 4, 8):
        ax.annotate(f"{n} ({15+3*k})", (k, 15 + 3 * k), xytext=(5, -10) if k else (6, -4),
                    textcoords="offset points", fontsize=7, color=INK)
ax.scatter([19], [72], s=40, color=ORANGE, zorder=4, edgecolor="white", linewidth=0.8)
ax.annotate("Kubera (72)", (19, 72), xytext=(-48, 2), textcoords="offset points",
            fontsize=7, color=INK)
ax.set_xlabel("offset m added to every Lo Shu entry")
ax.set_ylabel("magic sum S = 15 + 3m")
ax.set_xlim(-1, 21.5); ax.set_ylim(10, 80)
for s in ("top", "right"):
    ax.spines[s].set_visible(False)
ax.grid(axis="y", color=GRID, lw=0.5)
ax.set_axisbelow(True)
fig.tight_layout()
fig.savefig(os.path.join(OUT, "fig_family.pdf"))
plt.close(fig)


# --- Fig. 3: orientation conventions -----------------------------------------
def draw_grid(ax, sq, labels=None, hilite=None, title=""):
    n = len(sq)
    for i in range(n):
        for j in range(n):
            fc = "#fde3d6" if hilite and (i, j) in hilite else "white"
            ax.add_patch(Rectangle((j, n - 1 - i), 1, 1, fc=fc, ec=MUTED, lw=0.8))
            ax.text(j + 0.5, n - 1 - i + 0.55, str(sq[i][j]), ha="center", va="center",
                    fontsize=10 if n == 3 else 8, color=INK)
            if labels:
                ax.text(j + 0.5, n - 1 - i + 0.18, labels[(i, j)], ha="center",
                        va="center", fontsize=6, color=MUTED)
    ax.set_xlim(0, n); ax.set_ylim(0, n); ax.set_aspect("equal"); ax.axis("off")
    ax.set_title(title, fontsize=7, color=INK)


picks = ["North-up, East-right (modern map)", "East-up, North-left (Vastu-mandala plans)",
         "South-up, East-left (Chinese Lo Shu convention)", "North-up, East-left (mirror)"]
short = ["N up, E right", "E up, N left", "S up, E left", "N up, E left"]
fig, axs = plt.subplots(1, 4, figsize=(7.0, 2.0))
for ax, p, s in zip(axs, picks, short):
    conv = CONVENTIONS[p]
    north = [c for c, d in conv.items() if d == "N"]
    draw_grid(ax, KUBERA, labels=conv, hilite=north, title=s)
fig.tight_layout()
fig.savefig(os.path.join(OUT, "fig_orient.pdf"))
plt.close(fig)

# --- Fig. 4: the two historical order-4 squares ------------------------------
fig, axs = plt.subplots(1, 2, figsize=(3.5, 1.9))
bd = [(i, (i + 1) % 4) for i in range(4)]              # one broken diagonal
draw_grid(axs[0], VARAHA, hilite=bd, title="Varahamihira (S = 18)")
draw_grid(axs[1], KHAJURAHO, hilite=bd, title="Khajuraho (S = 34)")
fig.tight_layout()
fig.savefig(os.path.join(OUT, "fig_squares4.pdf"))
plt.close(fig)

# --- Fig. 5: steganography toy ----------------------------------------------
arr_path = os.path.join(os.path.dirname(__file__), "stego_demo_arrays.npy")
if os.path.exists(arr_path):
    cover, stego = np.load(arr_path)
    diff = (stego.astype(int) - cover.astype(int))
    fig, axs = plt.subplots(1, 3, figsize=(3.5, 1.35))
    axs[0].imshow(cover, cmap="gray", vmin=0, vmax=255); axs[0].set_title("cover", fontsize=7)
    axs[1].imshow(stego, cmap="gray", vmin=0, vmax=255); axs[1].set_title("stego", fontsize=7)
    axs[2].imshow(np.abs(diff), cmap="Blues", vmin=0, vmax=1)
    axs[2].set_title("|difference| (0 or 1)", fontsize=7)
    for a in axs:
        a.axis("off")
    fig.tight_layout()
    fig.savefig(os.path.join(OUT, "fig_stego.pdf"))
    plt.close(fig)

print("figures written to", os.path.abspath(OUT), sorted(os.listdir(OUT)))
