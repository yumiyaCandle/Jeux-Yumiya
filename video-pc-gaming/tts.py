# -*- coding: utf-8 -*-
"""Génère la narration phrase par phrase (voix neuronale FR) et la timeline."""
import asyncio, os, sys, json, subprocess, hashlib
import edge_tts
sys.path.insert(0, os.path.dirname(__file__))
from script import SCENES, spoken

OUT = sys.argv[1]
VOICE = "fr-FR-RemyMultilingualNeural"
RATE = "+12%"
os.makedirs(f"{OUT}/voice", exist_ok=True)

LEAD, GAP, TAIL = 0.35, 0.24, 0.45   # secondes


def key(t):
    return hashlib.md5((VOICE + RATE + t).encode()).hexdigest()[:12]


async def synth(t, sem):
    k = key(t)
    wav = f"{OUT}/voice/{k}.wav"
    if os.path.exists(wav):
        return
    async with sem:
        for attempt in range(10):
            try:
                mp3 = f"{OUT}/voice/{k}.mp3"
                await edge_tts.Communicate(spoken(t), VOICE, rate=RATE, proxy=os.environ.get("HTTPS_PROXY")).save(mp3)
                subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", mp3, "-af",
                                "silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse",
                                "-ar", "48000", "-ac", "1", wav], check=True)
                os.remove(mp3)
                return
            except Exception as e:
                print("retry", attempt, e, flush=True)
                await asyncio.sleep(4 + attempt * 5)
        raise RuntimeError("TTS failed: " + t)


def dur(wav):
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", wav]))


async def main():
    sem = asyncio.Semaphore(2)
    allt = [s for _, beats in SCENES for b in beats for s in b["s"]]
    await asyncio.gather(*(synth(t, sem) for t in allt))
    timeline = []
    T = 0.0
    for name, beats in SCENES:
        sc = {"name": name, "start": T, "beats": []}
        for b in beats:
            bt = {"start": T, "sent": []}
            if b["s"]:
                t = T + LEAD
                for s in b["s"]:
                    w = f"{OUT}/voice/{key(s)}.wav"
                    d = dur(w)
                    bt["sent"].append({"text": s, "wav": w, "t": t, "d": d})
                    t += d + GAP
                end = t - GAP + TAIL
                if b["dur"]:
                    end = max(end, T + b["dur"])
            else:
                end = T + b["dur"]
            bt["dur"] = round(end - T, 3)
            T = end
            sc["beats"].append(bt)
        sc["dur"] = T - sc["start"]
        timeline.append(sc)
    json.dump({"total": T, "scenes": timeline}, open(f"{OUT}/timeline.json", "w"), indent=1, ensure_ascii=False)
    print("TOTAL %.1f s = %d min %02d s" % (T, T // 60, T % 60))
    for sc in timeline:
        print("  %-10s %6.1f s" % (sc["name"], sc["dur"]))

asyncio.run(main())
