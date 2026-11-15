# -*- coding: utf-8 -*-
"""Assemble les segments, ajoute le mix audio, exporte les sous-titres .srt."""
import json, os, subprocess, sys
sys.path.insert(0, os.path.dirname(__file__))
from render import captions  # noqa: E402  (réutilise le découpage des sous-titres)

OUT, DEST = sys.argv[1], sys.argv[2]
tl = json.load(open(f"{OUT}/timeline.json"))
n = len(tl["scenes"])
with open(f"{OUT}/list.txt", "w") as f:
    for i in range(n):
        f.write(f"file '{OUT}/seg_{i:02d}.mp4'\n")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", f"{OUT}/list.txt", "-c", "copy", f"{OUT}/video.mp4"], check=True)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f"{OUT}/video.mp4", "-i", f"{OUT}/mix.wav",
                "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-ac", "2",
                "-af", "loudnorm=I=-15:TP=-1.5:LRA=11", "-shortest", "-movflags", "+faststart",
                f"{DEST}/PC_Gaming_Final.mp4"], check=True)


def ts(x):
    h = int(x // 3600); m = int(x % 3600 // 60); s = x % 60
    return f"{h:02d}:{m:02d}:{int(s):02d},{int((s % 1) * 1000):03d}"


k = 1
with open(f"{DEST}/PC_Gaming_Final.srt", "w") as f:
    for sc in tl["scenes"]:
        for a, b, txt in captions(sc):
            f.write(f"{k}\n{ts(a)} --> {ts(b)}\n{txt}\n\n"); k += 1
print("ok")
