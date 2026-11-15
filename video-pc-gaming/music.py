# -*- coding: utf-8 -*-
"""Musique électronique épique et discrète, générée de façon procédurale
(aucun droit d'auteur tiers), + mixage final voix / musique / impacts."""
import numpy as np, json, sys, subprocess, wave
from scipy.signal import lfilter, butter, sosfilt

SR = 48000
OUT = sys.argv[1]
tl = json.load(open(f"{OUT}/timeline.json"))
TOTAL = tl["total"] + 0.5
N = int(TOTAL * SR)
rng = np.random.default_rng(7)

BPM = 96
BEAT = 60 / BPM
BAR = 4 * BEAT
A4 = 440.0
def hz(m): return A4 * 2 ** ((m - 69) / 12)

# progressions (MIDI) : Am F C G  /  Dm Am F E
PROG = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62],
        [50, 53, 57], [57, 60, 64], [53, 57, 60], [52, 56, 59]]


def saw(f, t):
    return 2 * ((f * t) % 1.0) - 1


def lp(x, fc, order=2):
    sos = butter(order, fc / (SR / 2), output="sos")
    return sosfilt(sos, x)


def hp(x, fc):
    sos = butter(2, fc / (SR / 2), btype="high", output="sos")
    return sosfilt(sos, x)


pad = np.zeros(N); bass = np.zeros(N); arp = np.zeros(N); kick = np.zeros(N); hat = np.zeros(N)
nbars = int(TOTAL / BAR) + 1
for b in range(nbars):
    chord = PROG[b % 8]
    s0 = int(b * BAR * SR); s1 = min(N, int((b + 1) * BAR * SR))
    if s0 >= N: break
    n = s1 - s0
    t = np.arange(n) / SR
    # pad : 3 notes x 3 voix désaccordées
    env = np.minimum(1, t / 0.6) * np.minimum(1, (BAR - t) / 0.4 + 0.2)
    p = np.zeros(n)
    for m in chord + [chord[0] + 12]:
        for d in (-0.12, 0, 0.11):
            p += saw(hz(m) * 2 ** (d / 12), t + rng.random())
    pad[s0:s1] += p * env * 0.05
    # basse : croches
    for k in range(8):
        a = s0 + int(k * BEAT / 2 * SR); e = min(N, a + int(BEAT / 2 * SR * 0.9))
        tt = np.arange(e - a) / SR
        bass[a:e] += saw(hz(chord[0] - 24), tt) * np.exp(-tt * 5) * 0.35
    # arpège : doubles croches
    notes = [chord[0] + 12, chord[1] + 12, chord[2] + 12, chord[1] + 24]
    for k in range(16):
        a = s0 + int(k * BEAT / 4 * SR); e = min(N, a + int(0.25 * SR))
        tt = np.arange(e - a) / SR
        f = hz(notes[(k * 3) % 4])
        arp[a:e] += (np.sin(2 * np.pi * f * tt) + 0.3 * saw(f, tt)) * np.exp(-tt * 14) * 0.12
    # batterie
    for k in range(4):
        a = s0 + int(k * BEAT * SR); e = min(N, a + int(0.35 * SR))
        tt = np.arange(e - a) / SR
        kick[a:e] += np.sin(2 * np.pi * (45 + 90 * np.exp(-tt * 30)) * tt) * np.exp(-tt * 9) * 0.6
        a2 = s0 + int((k + 0.5) * BEAT * SR); e2 = min(N, a2 + int(0.06 * SR))
        hat[a2:e2] += rng.standard_normal(e2 - a2) * np.exp(-np.arange(e2 - a2) / SR * 60) * 0.15

pad = lp(pad, 1800); bass = lp(bass, 400); hat = hp(hat, 7000)
# écho sur l'arpège
d = int(BEAT * 0.75 * SR)
arp_e = arp.copy(); arp_e[d:] += arp[:-d] * 0.35; arp_e[2 * d:] += arp[:-2 * d] * 0.15
arp = lp(arp_e, 5000)

# intensité : intro douce, montée, sections plus calmes autour des chapitres
tt = np.arange(N) / SR
inten = np.clip(tt / 25, 0.25, 1.0)
drums_on = (tt > 22).astype(float)
drums_on = lp(drums_on, 2)
music = pad * (0.8 + 0.2 * inten) + bass * inten + arp * (0.6 + 0.4 * inten) + (kick + hat) * drums_on * inten

# impacts sur les cartes de chapitre
imp = np.zeros(N)
for sc in tl["scenes"]:
    for b in sc["beats"]:
        if not b["sent"] and b["dur"] < 4:  # carte de chapitre
            a = int(b["start"] * SR); n = int(2.2 * SR); e = min(N, a + n)
            t2 = np.arange(e - a) / SR
            boom = np.sin(2 * np.pi * (38 + 60 * np.exp(-t2 * 6)) * t2) * np.exp(-t2 * 2.2)
            noise = lp(rng.standard_normal(e - a), 900) * np.exp(-t2 * 4) * 0.6
            imp[a:e] += (boom + noise) * 0.55
            # montée (riser) juste avant
            r0 = max(0, a - int(1.2 * SR)); t3 = np.arange(a - r0) / SR
            if len(t3):
                imp[r0:a] += hp(rng.standard_normal(a - r0), 2500) * (t3 / t3[-1]) ** 2 * 0.12

# voix
voice = np.zeros(N)
active = np.zeros(N)
for sc in tl["scenes"]:
    for b in sc["beats"]:
        for s in b["sent"]:
            with wave.open(s["wav"]) as w:
                x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768
            a = int(s["t"] * SR); e = min(N, a + len(x))
            voice[a:e] += x[:e - a]
            active[max(0, a - int(0.15 * SR)):e + int(0.25 * SR)] = 1

# ducking : musique plus basse sous la voix
duck = lp(active, 3, order=1)
mgain = 10 ** ((-23 + (1 - duck) * 7) / 20)       # -23 dB sous la voix, -16 dB dans les pauses
music = music / (np.abs(music).max() + 1e-9)
voice = voice / (np.abs(voice).max() + 1e-9) * 0.89
mix = voice + music * mgain + imp * 10 ** (-12 / 20)
# fondu final
fo = int(4 * SR); mix[-fo:] *= np.linspace(1, 0, fo)
mix = np.tanh(mix * 1.1) / np.tanh(1.1)
pcm = (mix * 32767 * 0.95).astype(np.int16)
with wave.open(f"{OUT}/mix.wav", "w") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print("mix ok", TOTAL)
