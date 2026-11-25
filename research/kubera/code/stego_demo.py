"""Toy demonstration of Kubera-square-ordered LSB embedding.

This is NOT a re-implementation of Amirtharajan et al. (2013), whose scheme
also uses a pulli-kolam bit-allocation matrix and a pixel-indicator channel.
It isolates the one idea that the Kubera square contributes -- a fixed
visiting order of the nine pixels in each 3x3 block -- and measures what that
idea does and does not buy. A synthetic image is used (no external data).
"""
import math
import numpy as np
from common import KUBERA, d4_elements

rng = np.random.default_rng(72)
H = W = 96
yy, xx = np.mgrid[0:H, 0:W]
img = (96 + 60 * np.sin(xx / 11.0) + 40 * np.cos(yy / 7.0) + rng.normal(0, 6, (H, W)))
img = np.clip(img, 0, 255).astype(np.uint8)


def order_from(square):
    flat = [x for r in square for x in r]
    return [int(i) for i in np.argsort(flat)]          # visit cells by increasing value


def embed(cover, bits, order):
    out = cover.copy()
    k = 0
    for bi in range(0, H, 3):
        for bj in range(0, W, 3):
            for idx in order:
                if k >= len(bits):
                    return out, k
                i, j = bi + idx // 3, bj + idx % 3
                out[i, j] = (out[i, j] & 0xFE) | bits[k]
                k += 1
    return out, k


def extract(stego, n, order):
    bits = []
    for bi in range(0, H, 3):
        for bj in range(0, W, 3):
            for idx in order:
                if len(bits) >= n:
                    return bits
                i, j = bi + idx // 3, bj + idx % 3
                bits.append(int(stego[i, j] & 1))
    return bits


def psnr(a, b):
    mse = np.mean((a.astype(float) - b.astype(float)) ** 2)
    return float("inf") if mse == 0 else 10 * math.log10(255 ** 2 / mse), mse


msg = "rajadhirajaya prasahyasahine".encode("ascii")
bits = [(byte >> (7 - t)) & 1 for byte in msg for t in range(8)]
bits = bits * 20                                        # longer payload
bits = bits[:H * W]

if __name__ == "__main__":
    ok_order = order_from(KUBERA)
    print("Kubera visiting order within each 3x3 block (cell indices 0..8, row-major):", ok_order)
    stego, n = embed(img, bits, ok_order)
    p, mse = psnr(img, stego)
    rec = extract(stego, n, ok_order)
    print(f"payload bits: {n}  capacity used: {n/(H*W):.3f} bpp  MSE: {mse:.4f}  PSNR: {p:.2f} dB")
    print("bit errors with the correct order:", sum(a != b for a, b in zip(rec, bits[:n])))
    print("\nExtraction with each of the 8 D4 variants of the Kubera square as the 'key':")
    for name, f in d4_elements():
        o = order_from(f(KUBERA))
        r = extract(stego, n, o)
        ber = sum(a != b for a, b in zip(r, bits[:n])) / n
        print(f"  {name:26s} BER = {ber:.3f}")
    print("\nKey-space remarks: there are 9! =", math.factorial(9),
          "orders of 9 cells but only 8 magic ones;"
          " using 'some magic square of 3' as a secret is log2(8) = 3 bits of key.")
    np.save("stego_demo_arrays.npy", np.stack([img, stego]))
