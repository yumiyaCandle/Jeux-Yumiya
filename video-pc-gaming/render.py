# -*- coding: utf-8 -*-
"""Moteur de rendu : fonds (extraits vidéo / captures / fonds animés),
overlays animés (graphiques FPS, schémas, fiches), sous-titres, encodage."""
import os, sys, json, math, subprocess, functools
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance
sys.path.insert(0, os.path.dirname(__file__))
from gfx import *
import gfx
from script import SCENES, CREDITS

FPS = 30
XF = 10            # images de fondu enchaîné entre deux plans
OUT = sys.argv[1]
DL = sys.argv[2]   # dossier des médias téléchargés (vid_*.mp4, shots/)
SW, SH = 2112, 1188

PRECROP = {"rdr2_0": "crop=iw:ih*0.78,"}
ZOOM = {"fh6_1": 1.3, "fh5_1": 1.3, "fh6_0": 1.3}   # masque logos / mentions des bandes-annonces


# ------------------------------------------------------------- FONDS
class ClipBG:
    def __init__(self, name, ss, dur, k):
        z = ZOOM.get(name, 1.1)
        sw, sh = int(W * z) // 2 * 2, int(H * z) // 2 * 2
        x0, x1 = (0, sw - W) if k % 2 == 0 else (sw - W, 0)
        if z > 1.2:
            x0, x1 = (int(0.3 * (sw - W)), sw - W) if k % 2 == 0 else (sw - W, int(0.3 * (sw - W)))
        y = (sh - H) // 2
        vf = (PRECROP.get(name, "") +
              f"scale={sw}:{sh}:force_original_aspect_ratio=increase,crop={sw}:{sh},"
              f"crop={W}:{H}:x='{x0}+({x1 - x0})*t/{dur:.3f}':y={y},fps={FPS}")
        self.p = subprocess.Popen(["ffmpeg", "-v", "error", "-stream_loop", "-1", "-ss", str(ss), "-i", f"{DL}/vid_{name}.mp4",
                                   "-t", f"{dur + 1:.3f}", "-vf", vf, "-pix_fmt", "rgb24", "-f", "rawvideo", "-"],
                                  stdout=subprocess.PIPE, bufsize=W * H * 3 * 2)
        self.last = None

    def frame(self, t):
        b = self.p.stdout.read(W * H * 3)
        if len(b) == W * H * 3:
            self.last = np.frombuffer(b, np.uint8).reshape(H, W, 3)
        return self.last if self.last is not None else np.zeros((H, W, 3), np.uint8)

    def close(self):
        self.p.kill()


@functools.lru_cache(8)
def load_shot(name):
    im = Image.open(f"{DL}/shots/{name}.jpg").convert("RGB")
    r = max(SW / im.width, SH / im.height)
    im = im.resize((int(im.width * r + 0.5), int(im.height * r + 0.5)), Image.LANCZOS)
    return np.asarray(im)


class ImgBG:
    def __init__(self, name, dur, k):
        self.a = load_shot(name); self.dur = dur; self.k = k

    def frame(self, t):
        hh, ww = self.a.shape[:2]
        u = ease_io(t / self.dur) if self.k % 2 == 0 else 1 - ease_io(t / self.dur)
        x = int(u * (ww - W)); y = int((0.3 + 0.4 * u) * (hh - H))
        return self.a[y:y + H, x:x + W]

    def close(self): pass


_BASE = None
_Y, _X = None, None


class DarkBG:
    """noir profond + halos rouge / magenta / cyan qui dérivent lentement"""
    def __init__(self, kind="dark"):
        global _BASE, _Y, _X
        if _BASE is None:
            _BASE = dark_bg_base()
            _Y, _X = np.mgrid[0:H // 4, 0:W // 4].astype(np.float32)
        self.kind = kind

    def frame(self, t):
        if self.kind == "gta":
            cols = [((255, 40, 140), 0.55), ((255, 140, 40), 0.45), ((90, 40, 255), 0.6)]
        elif self.kind == "fortnite":
            cols = [((60, 120, 255), 0.6), ((170, 60, 255), 0.6), ((0, 210, 255), 0.4)]
        else:
            cols = [((140, 60, 255), 0.40), ((40, 110, 255), 0.30), ((255, 50, 160), 0.16)]
        acc = np.zeros((H // 4, W // 4, 3), np.float32)
        for i, (c, s) in enumerate(cols):
            cx = (0.5 + 0.38 * math.sin(t * 0.13 + i * 2.1)) * W / 4
            cy = (0.5 + 0.35 * math.cos(t * 0.11 + i * 1.7)) * H / 4
            r2 = ((_X - cx) ** 2 + (_Y - cy) ** 2) / (W / 4 * 0.33) ** 2
            acc += np.exp(-r2)[..., None] * np.array(c, np.float32) * s
        up = np.repeat(np.repeat(acc, 4, 0), 4, 1)
        return np.clip(_BASE + up, 0, 255).astype(np.uint8)

    def close(self): pass


class PhotoBG:
    """photo produit sur fond animé : léger travelling avant, halo, reflet lumineux"""
    def __init__(self, name, dur, k):
        self.dark = DarkBG("dark"); self.dur = dur; self.name = name

    def frame(self, t):
        base = Image.fromarray(self.dark.frame(t)).convert("RGBA")
        sp = photo_shot(self.name, t, self.dur, 860)
        base.alpha_composite(sp, (int(560 - sp.width / 2), int(540 - sp.height / 2)))
        return np.asarray(base.convert("RGB"))

    def close(self): pass


def make_bg(spec, dur, k):
    if spec.startswith("p:"):
        return PhotoBG(spec[2:], dur, k)
    if spec.startswith("c:"):
        n, ss = spec[2:].split("@")
        return ClipBG(n, float(ss), dur, k)
    if spec.startswith("i:"):
        return ImgBG(spec[2:], dur, k)
    return DarkBG(spec if spec in ("gta", "fortnite") else "dark")


@functools.lru_cache(16)
def load_photo(name):
    return Image.open(f"{DL}/photos/{name}.png").convert("RGBA")


@functools.lru_cache(16)
def photo_glow(name, h):
    p = load_photo(name)
    r = h / p.height
    a = p.getchannel("A").resize((int(p.width * r), h))
    pad = 140
    g = Image.new("L", (a.width + 2 * pad, a.height + 2 * pad))
    g.paste(a, (pad, pad))
    g = g.filter(ImageFilter.GaussianBlur(45))
    col = Image.new("RGBA", g.size, (130, 70, 255, 0))
    col.putalpha(g.point(lambda v: int(v * 0.75)))
    return col, pad


def photo_shot(name, t, dur, h, sweep=True):
    """photo avec travelling avant lent, halo violet et reflet lumineux qui balaie le produit"""
    p = load_photo(name)
    z = 1.0 + 0.05 * ease_io(t / max(dur, 0.1))
    hh = int(h * z)
    r = hh / p.height
    ww = int(p.width * r)
    if ww > 1050:
        ww = 1050; hh = int(p.height * ww / p.width)
    sp = p.resize((ww, hh), Image.BILINEAR)
    gl, pad = photo_glow(name, h)
    if z > 1.001:
        gl = gl.resize((int(gl.width * z), int(gl.height * z)), Image.BILINEAR)
    out = Image.new("RGBA", gl.size)
    out.alpha_composite(gl)
    ox, oy = (gl.width - ww) // 2, (gl.height - hh) // 2
    out.alpha_composite(sp, (ox, oy))
    if sweep:
        ph = ((t * 0.22) % 1.4) - 0.2
        xs = np.arange(ww)[None, :] / ww; ys = np.arange(hh)[:, None] / hh
        band = np.exp(-((xs + ys * 0.5 - ph * 1.5) / 0.06) ** 2) * 70
        a = np.asarray(sp.getchannel("A")).astype(np.float32) / 255
        L = np.zeros((hh, ww, 4), np.uint8)
        L[..., :3] = 255
        L[..., 3] = (band * a).astype(np.uint8)
        out.alpha_composite(Image.fromarray(L), (ox, oy))
    return out


_VIG = None


def vignette():
    global _VIG
    if _VIG is None:
        y, x = np.mgrid[0:H, 0:W].astype(np.float32)
        r = np.sqrt(((x - W / 2) / (W / 2)) ** 2 + ((y - H / 2) / (H / 2)) ** 2)
        v = 1 - 0.45 * np.clip(r - 0.55, 0, 1) ** 1.5
        # assombrit le bas pour les sous-titres
        v *= 1 - 0.35 * np.clip((y - H * 0.78) / (H * 0.22), 0, 1)
        _VIG = v[..., None]
    return _VIG


# ------------------------------------------------------------- OVERLAYS
def appear(t, D, delay=0.25, dur=0.7):
    a_in = ease((t - delay) / dur)
    a_out = 1 - ease_io((t - (D - 0.45)) / 0.45)
    return max(0, min(a_in, a_out))


class Ov:
    static = True

    def __init__(self, o, D, sent):
        self.o = o; self.D = D; self.sent = sent; self.cache = None

    def layer(self, t):  # -> image RGBA plein cadre
        if self.static:
            if self.cache is None:
                self.cache = self.draw(0)
            return self.cache
        return self.draw(t)

    def alpha(self, t):
        return appear(t, self.D)

    def offset(self, t):
        return (0, int(30 * (1 - ease((t - 0.25) / 0.7))))


def full():
    im = Image.new("RGBA", (W, H)); return im, ImageDraw.Draw(im)


class OvKicker(Ov):
    def draw(self, t):
        im, d = full()
        f = F(30, "Bold")
        tw = d.textlength(self.o["text"], font=f)
        d.rectangle([90, 90, 98, 140], fill=RED)
        d.text((118, 96), self.o["text"], font=f, fill=WHITE)
        return im


class OvTitle(Ov):
    def draw(self, t):
        im, d = full()
        x = 1000
        s = text_sprite(self.o["text"], F(80, "Black", True), WHITE, glow_col=RED, pad=50)
        im.alpha_composite(s, (x - 50, 360))
        d.rectangle([x, 500, x + 160, 508], fill=RED)
        d.text((x, 530), self.o["sub"], font=F(36, "Medium"), fill=GREY)
        return im


class OvGameTitle(Ov):
    def draw(self, t):
        im, d = full()
        s = text_sprite(self.o["text"], F(92, "Black", True), WHITE, glow_col=(0, 0, 0), pad=40)
        im.alpha_composite(s, (90 - 40, 610 - 40))
        d.rectangle([92, 600, 260, 607], fill=RED)
        d.text((94, 735), self.o["sub"].upper(), font=F(30, "SemiBold"), fill=(220, 222, 228), spacing=4)
        return im

    def offset(self, t):
        return (int(-60 * (1 - ease((t - 0.25) / 0.8))), 0)


class OvChapter(Ov):
    static = False

    def draw(self, t):
        im, d = full()
        a = ease(t / 0.8)
        num = text_sprite(self.o["num"], F(300, "Black", True), (255, 255, 255, 18), pad=10)
        im.alpha_composite(fade(num, a), (140, 250))
        d.rectangle([150, 560, 150 + int(260 * ease((t - 0.2) / 0.8)), 568], fill=RED)
        tt = text_sprite(self.o["title"], F(84, "Black", True), WHITE, glow_col=RED, pad=40)
        im.alpha_composite(fade(tt, ease((t - 0.3) / 0.6)), (150 - 40 + int(40 * (1 - ease((t - 0.3) / 0.6))), 440 - 40))
        d.text((152, 600), self.o["sub"], font=F(38, "Medium"), fill=GREY + (int(255 * ease((t - 0.6) / 0.6)),))
        d.text((156, 380), f"CHAPITRE {self.o['num']}", font=F(26, "Bold"), fill=RED + (int(255 * a),), spacing=6)
        return im

    def alpha(self, t):
        return 1 - ease_io((t - (self.D - 0.4)) / 0.4)

    def offset(self, t):
        return (0, 0)


COMPS = [("cpu", "PROCESSEUR", "AMD Ryzen 7 9800X3D"), ("gpu", "CARTE GRAPHIQUE", "MSI RTX 5070 Ventus 2X OC 12 Go"),
         ("ram", "MÉMOIRE", "Patriot Viper Venom 32 Go DDR5-6000"), ("aio", "WATERCOOLING", "Arctic Liquid Freezer III Pro 360 A-RGB"),
         ("mobo", "CARTE MÈRE", "Gigabyte B650 Gaming X AX V2"), ("ssd", "STOCKAGE", "Kioxia Exceria Plus G3 1 To"),
         ("psu", "ALIMENTATION", "be quiet! Pure Power 13 M 750 W"), ("case", "BOÎTIER", "Corsair FRAME 4000D RS ARGB")]
REVEAL = [1, 2, 3, 4, 4, 5, 5, 5]


class OvCompList(Ov):
    static = False

    def draw(self, t):
        im, d = full()
        x0, y0 = 960, 150
        im.alpha_composite(panel(880, 760), (x0, y0))
        d.text((x0 + 40, y0 + 30), "CONFIGURATION", font=F(30, "Black", True), fill=RED, spacing=4)
        for i, (k, cat, name) in enumerate(COMPS):
            st = self.sent[REVEAL[i]] if REVEAL[i] < len(self.sent) else 0
            st += 0.25 * (i - REVEAL.index(REVEAL[i]))
            a = ease((t - st) / 0.5)
            if a <= 0:
                continue
            y = y0 + 95 + i * 80
            dx = int(30 * (1 - a))
            c = lambda col: col + (int(255 * a),)
            d.rectangle([x0 + 40 + dx, y + 8, x0 + 46 + dx, y + 58], fill=c(RED))
            d.text((x0 + 64 + dx, y + 4), cat, font=F(20, "Bold"), fill=c(GREY), spacing=3)
            d.text((x0 + 64 + dx, y + 28), name, font=F(32, "SemiBold"), fill=c(WHITE))
        return im


COMP_INFO = {
    "cpu": ("AMD Ryzen 7 9800X3D", "Processeur · socket AM5", ["8 cœurs / 16 threads · Zen 5", "96 Mo de cache L3 (3D V-Cache)", "Jusqu'à 5,2 GHz", "Référence du jeu PC"]),
    "gpu": ("MSI RTX 5070 Ventus 2X OC", "Carte graphique · NVIDIA Blackwell", ["12 Go GDDR7 · bus 192 bits", "DLSS 4 · Multi Frame Generation", "Ray tracing 4e génération", "≈ 250 W"]),
    "ram": ("Patriot Viper Venom", "Mémoire vive", ["32 Go (2 × 16 Go)", "DDR5 · 6000 MT/s", "Profil EXPO à activer", "Le « sweet spot » des Ryzen 9000"]),
    "aio": ("Arctic Liquid Freezer III Pro 360", "Watercooling AIO · A-RGB", ["Radiateur 360 mm", "3 ventilateurs A-RGB", "Températures basses, PC silencieux", "Éclairage synchronisable"]),
    "mobo": ("Gigabyte B650 Gaming X AX V2", "Carte mère · AM5", ["Wi-Fi 6E + Bluetooth intégrés", "PCIe 4.0 · emplacements M.2", "DDR5 · profils EXPO", "Plateforme évolutive"]),
    "ssd": ("Kioxia Exceria Plus G3", "SSD NVMe · 1 To", ["PCIe 4.0 x4", "Jusqu'à 5 000 Mo/s en lecture*", "Windows et jeux chargent vite", "*donnée constructeur"]),
    "psu": ("be quiet! Pure Power 13 M", "Alimentation · 750 W", ["80 PLUS Gold · modulaire", "ATX 3.1 · connecteur 12V-2x6", "Charge en jeu estimée ≈ 400 W", "Marge confortable"]),
    "case": ("Corsair FRAME 4000D RS ARGB", "Boîtier moyen tour · noir", ["3 ventilateurs RS120 ARGB", "Radiateurs jusqu'à 360 mm", "Façade très aérée · modulaire", "Vitre trempée : une vitrine"]),
}


class OvComponent(Ov):
    def __init__(self, *a):
        super().__init__(*a)
        self.static = self.o["id"] in ("cpu", "gpu", "ram", "mobo", "ssd", "psu")

    def sprite(self, t):
        i = self.o["id"]
        if i == "aio":
            return comp_aio(int(t * 12))
        if i == "case":
            return hero_pc(int(t * 12) % 36)
        return {"cpu": comp_cpu, "gpu": comp_gpu, "ram": comp_ram, "mobo": comp_mobo, "ssd": comp_ssd, "psu": comp_psu}[i]()

    def draw(self, t):
        im, d = full()
        sp = self.sprite(t)
        maxw, maxh = 940, 780
        r = min(maxw / sp.width, maxh / sp.height, 1.0)
        if r < 1:
            sp = sp.resize((int(sp.width * r), int(sp.height * r)), Image.LANCZOS)
        fl = 8 * math.sin(t * 1.3)
        im.alpha_composite(sp, (int(520 - sp.width / 2), int(470 - sp.height / 2 + fl)))
        title, sub, specs = COMP_INFO[self.o["id"]]
        x0, y0 = 1040, 200
        im.alpha_composite(panel(800, 560), (x0, y0))
        d.text((x0 + 44, y0 + 36), sub.upper(), font=F(22, "Bold"), fill=RED, spacing=3)
        lines = wrap(d, title, F(50, "Black", True), 720)
        y = y0 + 74
        for ln in lines:
            d.text((x0 + 44, y), ln, font=F(50, "Black", True), fill=WHITE); y += 60
        y += 22
        for s in specs:
            d.ellipse([x0 + 46, y + 14, x0 + 56, y + 24], fill=RED)
            d.text((x0 + 74, y), s, font=F(31, "Medium"), fill=(225, 228, 234)); y += 58
        d.text((x0 + 44, y0 + 520), "Illustration stylisée", font=F(18, "Medium"), fill=DGREY)
        return im

    def layer(self, t):
        if self.static:
            if self.cache is None:
                self.cache = self.draw(0)
            # léger flottement : on décale la couche entière
            return self.cache
        return self.draw(t)


class OvChart(Ov):
    static = False

    def draw(self, t):
        o = self.o
        im, d = full()
        rows = o["rows"]; n = len(rows)
        compact = o.get("compact")
        rh = 64 if compact else 92
        top = 250 if not compact else 285
        ph = (140 if not compact else 175) + n * rh + (70 if compact else 100)
        x0, y0, pw = 120, top - 140, 1680
        im.alpha_composite(panel(pw, ph, fill=(10, 10, 14, 228)), (x0, y0))
        d.text((x0 + 48, y0 + 34), o["title"], font=F(44 if not compact else 38, "Black", True), fill=WHITE)
        d.text((x0 + 50, y0 + 92 if not compact else y0 + 84), o["sub"], font=F(24, "Medium"), fill=GREY)
        lx = x0 + 50; bx = x0 + (640 if not compact else 690); bw = pw - (bx - x0) - 260
        mx = o["max"]
        sx = lambda v: bx + bw * v / mx
        # lignes de référence
        for r in o.get("ref", []):
            if r <= mx:
                xr = sx(r)
                col = PINK if r == 360 else (120, 124, 134)
                for yy in range(top - 14, top + n * rh - 10, 14):
                    d.line([xr, yy, xr, yy + 7], fill=col, width=3)
                lab = "360 Hz" if r == 360 else f"{r} FPS"
                d.text((xr, top + n * rh + (4 if compact else 30)), lab, font=F(20, "Bold"), fill=col, anchor="ma")
        for i, (lab, v, rng, kind, src) in enumerate(rows):
            st = 0.5 + i * 0.22
            g = ease((t - st) / 1.3)
            y = top + i * rh
            col = {"m": GREEN, "e": ORANGE, "fg": VIOLET}[kind]
            d.text((lx, y + (8 if compact else 10)), lab, font=F(28 if compact else 30, "SemiBold"), fill=WHITE)
            bh = 30 if compact else 40
            d.rounded_rectangle([bx, y + 6, bx + bw, y + 6 + bh], 8, fill=(255, 255, 255, 12))
            if rng and g > 0:
                d.rounded_rectangle([sx(rng[0] * g), y + 6, sx(rng[1] * g), y + 6 + bh], 8, fill=col + (70,))
            if g > 0:
                xe = sx(v * g)
                d.rounded_rectangle([bx, y + 6, max(bx + 10, xe), y + 6 + bh], 8, fill=col + (235,))
                if kind == "fg":
                    for hx in range(int(bx), int(xe) - 8, 18):
                        d.line([hx, y + 6 + bh, hx + 14, y + 6], fill=(255, 255, 255, 90), width=4)
                num = f"{int(round(v * g))}"
                if rng:
                    num = f"≈{num}"
                d.text((max(bx + 10, xe) + 16, y + 2 + (0 if compact else 2)), num, font=F(36 if compact else 42, "Black", True), fill=WHITE)
            if not compact:
                bd = badge(kind, src if kind == "m" else "")
                if kind == "e" and rng:
                    pass
                im.alpha_composite(fade(bd, ease((t - st - 0.8) / 0.5)), (bx, y + 52))
                if rng:
                    d.text((bx + bd.width + 14, y + 56), f"fourchette {rng[0]}–{rng[1]} FPS", font=F(20, "Medium"), fill=(GREY + (int(255 * ease((t - st - 0.8) / 0.5)),)))
            else:
                bd = badge(kind, "")
                im.alpha_composite(fade(bd, ease((t - st - 0.8) / 0.5)), (x0 + pw - 210, y + 2))
        return im


class OvSettings(Ov):
    def draw(self, t):
        im, d = full()
        rows = self.o["rows"]
        x0, y0, pw = 1030, 150, 790
        ph = 140 + len(rows) * 82
        im.alpha_composite(panel(pw, ph, fill=(8, 8, 12, 232)), (x0, y0))
        d.text((x0 + 44, y0 + 32), self.o["title"], font=F(30, "Bold"), fill=WHITE)
        d.line([x0 + 44, y0 + 92, x0 + pw - 44, y0 + 92], fill=(255, 255, 255, 40), width=2)
        for i, (k, v) in enumerate(rows):
            y = y0 + 116 + i * 82
            if i % 2 == 0:
                d.rounded_rectangle([x0 + 30, y - 10, x0 + pw - 30, y + 62], 10, fill=(255, 255, 255, 10))
            d.text((x0 + 50, y + 8), k, font=F(28, "Medium"), fill=GREY)
            d.text((x0 + pw - 50, y + 8), v, font=F(28, "Bold"), fill=WHITE, anchor="ra")
            d.rectangle([x0 + 34, y, x0 + 38, y + 50], fill=RED)
        return im


class OvNote(Ov):
    def draw(self, t):
        im, d = full()
        lines = self.o["lines"]
        x0, y0, pw = 100, 170, 980
        ph = 150 + len(lines) * 78
        im.alpha_composite(panel(pw, ph, fill=(8, 8, 12, 225)), (x0, y0))
        d.text((x0 + 48, y0 + 40), self.o["title"], font=F(42, "Black", True), fill=WHITE)
        for i, ln in enumerate(lines):
            y = y0 + 130 + i * 78
            d.ellipse([x0 + 52, y + 13, x0 + 64, y + 25], fill=RED)
            for j, l2 in enumerate(wrap(d, ln, F(30, "Medium"), pw - 140)[:2]):
                d.text((x0 + 84, y + j * 34), l2, font=F(30, "Medium"), fill=(228, 230, 236))
        return im


class OvBullets(Ov):
    static = False

    def draw(self, t):
        im, d = full()
        items = self.o["items"]
        x0, y0, pw = 1000, 230, 840
        im.alpha_composite(panel(pw, 140 + len(items) * 100), (x0, y0))
        d.text((x0 + 44, y0 + 36), self.o["title"].upper(), font=F(30, "Black", True), fill=RED, spacing=3)
        for i, it in enumerate(items):
            st = self.sent[min(i, len(self.sent) - 1)] if i < len(self.sent) else (self.sent[-1] + 0.6 * (i - len(self.sent) + 1))
            st = min(st, 0.6 + 0.5 * i) if i == 0 else st
            a = ease((t - (0.5 + i * 0.45)) / 0.5)
            if a <= 0:
                continue
            y = y0 + 110 + i * 100
            c = lambda col: col + (int(255 * a),)
            xx = x0 + 50 + int(20 * (1 - a))
            d.polygon([(xx, y + 10), (xx + 16, y + 21), (xx, y + 32)], fill=c(RED))
            for j, l2 in enumerate(wrap(d, it, F(31, "SemiBold"), pw - 140)[:2]):
                d.text((x0 + 90 + int(20 * (1 - a)), y + j * 38), l2, font=F(31, "SemiBold"), fill=c(WHITE))
        return im


class OvVCache(Ov):
    static = False

    def draw(self, t):
        im, d = full()
        cx, cy = 600, 560
        # pile : CCD au-dessus, V-Cache dessous (2e génération)
        layers = [("SUBSTRAT", (30, 70, 50), 0), ("3D V-CACHE · 64 Mo", (255, 120, 40), 1), ("PUCE ZEN 5 · 8 cœurs · 32 Mo L3", (200, 30, 60), 2)]
        for i, (lab, col, k) in enumerate(layers):
            a = ease((t - 0.4 - k * 0.5) / 0.6)
            if a <= 0:
                continue
            y = cy + 150 - k * 120 - int(60 * (1 - a))
            pts = [(cx - 330, y), (cx + 110, y), (cx + 330, y - 80), (cx - 110, y - 80)]
            d.polygon(pts, fill=col + (int(220 * a),), outline=(255, 255, 255, int(120 * a)))
            d.polygon([(cx - 330, y), (cx + 110, y), (cx + 110, y + 34), (cx - 330, y + 34)], fill=tuple(int(c * 0.55) for c in col) + (int(240 * a),))
            d.polygon([(cx + 110, y), (cx + 330, y - 80), (cx + 330, y - 46), (cx + 110, y + 34)], fill=tuple(int(c * 0.4) for c in col) + (int(240 * a),))
            d.text((cx - 300, y + 4), lab, font=F(22, "Bold"), fill=(255, 255, 255, int(255 * a)))
        a = ease((t - 2.0) / 0.7)
        s = text_sprite("96 Mo de cache L3", F(64, "Black", True), WHITE, glow_col=RED, pad=40)
        im.alpha_composite(fade(s, a), (1020, 250))
        # flux de données
        x0, y0 = 1060, 450
        a2 = ease((t - 3.0) / 0.7)
        if a2 > 0:
            d.text((x0, y0), "Données du jeu", font=F(30, "Bold"), fill=(255, 255, 255, int(255 * a2)))
            for k, (lab, col, length, spd) in enumerate([("Cache L3 · tout près des cœurs", GREEN, 260, 3.0), ("RAM DDR5 · beaucoup plus loin", ORANGE, 640, 1.0)]):
                y = y0 + 80 + k * 130
                d.text((x0, y), lab, font=F(26, "SemiBold"), fill=col + (int(255 * a2),))
                d.line([x0, y + 60, x0 + length, y + 60], fill=col + (int(120 * a2),), width=4)
                p = ((t * spd * 0.6) % 1.0)
                px = x0 + p * length
                d.ellipse([px - 9, y + 51, px + 9, y + 69], fill=col + (int(255 * a2),))
                d.text((x0 + length + 20, y + 44), "rapide" if k == 0 else "lent", font=F(24, "Bold"), fill=col + (int(255 * a2),))
        return im


@functools.lru_cache(None)
def dlss_imgs():
    src = Image.open(f"{DL}/shots/fh6_05.jpg").convert("RGB")
    crop = src.crop((760, 300, 1400, 660))
    low = crop.resize((crop.width // 3, crop.height // 3), Image.BILINEAR).resize((480, 270), Image.NEAREST)
    hi = crop.resize((480, 270), Image.LANCZOS)
    return low, hi


class OvDLSS(Ov):
    static = False

    def draw(self, t):
        im, d = full()
        low, hi = dlss_imgs()
        y = 170
        steps = [(150, low, "Rendu en définition réduite", "≈ 960p (DLSS Qualité)"), (1290, hi, "Image reconstruite", "affichée en 1440p")]
        for i, (x, img, a1, a2) in enumerate(steps):
            a = ease((t - 0.4 - i * 1.6) / 0.6)
            if a <= 0: continue
            im.alpha_composite(fade(img.convert("RGBA"), a), (x, y))
            d.rectangle([x, y, x + 480, y + 270], outline=(255, 255, 255, int(80 * a)), width=2)
            d.text((x, y + 290), a1, font=F(28, "Bold"), fill=(255, 255, 255, int(255 * a)))
            d.text((x, y + 328), a2, font=F(24, "Medium"), fill=GREY + (int(255 * a),))
        a = ease((t - 1.2) / 0.6)
        if a > 0:
            s = text_sprite("IA · DLSS 4", F(46, "Black", True), WHITE, glow_col=(118, 185, 0), pad=40)
            im.alpha_composite(fade(s, a), (760, 230))
            d.line([660, 305, 1260, 305], fill=(118, 185, 0, int(200 * a)), width=4)
            d.polygon([(1260, 290), (1285, 305), (1260, 320)], fill=(118, 185, 0, int(255 * a)))
        # génération d'images
        a = ease((t - (self.sent[2] if len(self.sent) > 2 else 6)) / 0.7)
        if a > 0:
            y2 = 620
            d.text((150, y2), "Génération d'images (Frame Generation ×2)", font=F(30, "Bold"), fill=(255, 255, 255, int(255 * a)))
            for k in range(12):
                real = k % 2 == 0
                col = RED if real else VIOLET
                x = 150 + k * 135
                d.rounded_rectangle([x, y2 + 60, x + 115, y2 + 150], 10, fill=col + (int((230 if real else 120) * a),), outline=col + (int(255 * a),), width=3)
                d.text((x + 57, y2 + 105), "R" if real else "IA", font=F(32, "Black", True), fill=(255, 255, 255, int(255 * a)), anchor="mm")
            d.text((150, y2 + 172), "R = image réellement calculée   ·   IA = image générée : plus fluide à l'œil, mais réactivité des images réelles",
                   font=F(24, "Medium"), fill=GREY + (int(255 * a),))
        return im


class OvMonitor(Ov):
    def draw(self, t):
        im, d = full()
        m = monitor_sprite(f"{DL}/shots/fh6_00.jpg")
        m = m.resize((int(m.width * 0.82), int(m.height * 0.82)), Image.LANCZOS)
        im.alpha_composite(m, (40, 140))
        specs = [("Dalle", "QD-OLED"), ("Définition", "2560 × 1440"), ("Fréquence", "360 Hz"), ("Réponse", "0,03 ms GtG*"),
                 ("HDR", "DisplayHDR True Black 400*"), ("Diagonale", "27\" annoncés*")]
        x0, y0 = 1040, 170
        im.alpha_composite(panel(780, 640), (x0, y0))
        d.text((x0 + 44, y0 + 34), "ÉCRAN PRINCIPAL", font=F(22, "Bold"), fill=RED, spacing=3)
        d.text((x0 + 44, y0 + 70), "Gigabyte MO27Q3", font=F(50, "Black", True), fill=WHITE)
        for i, (k, v) in enumerate(specs):
            y = y0 + 160 + i * 66
            d.text((x0 + 48, y), k, font=F(28, "Medium"), fill=GREY)
            d.text((x0 + 740, y), v, font=F(30, "Bold"), fill=WHITE, anchor="ra")
        d.text((x0 + 48, y0 + 570), "* données constructeur  ·  2e écran : AOC C27G2ZU 27\" 1080p", font=F(20, "Medium"), fill=DGREY)
        return im


@functools.lru_cache(None)
def oled_imgs():
    src = Image.open(f"{DL}/shots/fh6_00.jpg").convert("RGB").resize((760, 428), Image.LANCZOS)
    a = np.asarray(src).astype(np.float32)
    lcd = a * 0.86 + 30           # noirs relevés (rétroéclairage)
    lcd = lcd * np.array([0.98, 0.98, 1.03])
    oled = np.clip((a / 255) ** 1.25 * 255 * 1.08, 0, 255)
    return Image.fromarray(np.clip(lcd, 0, 255).astype(np.uint8)), Image.fromarray(oled.astype(np.uint8))


class OvOLED(Ov):
    static = False

    def draw(self, t):
        im, d = full()
        lcd, oled = oled_imgs()
        for i, (x, img, ttl, sub, col) in enumerate([(130, lcd, "LCD (IPS / VA)", "Rétroéclairage toujours allumé → noirs grisâtres", GREY),
                                                     (1030, oled, "OLED", "Chaque pixel s'éteint → noir absolu", RED)]):
            a = ease((t - 0.3 - (self.sent[1] if i and len(self.sent) > 1 else 0)) / 0.7)
            if a <= 0: continue
            im.alpha_composite(fade(img.convert("RGBA"), a), (x, 230))
            d.rectangle([x - 2, 228, x + 762, 660], outline=col + (int(200 * a),), width=3)
            d.text((x, 150), ttl, font=F(48, "Black", True), fill=col + (int(255 * a),))
            d.text((x, 690), sub, font=F(28, "SemiBold"), fill=(230, 232, 238, int(255 * a)))
            # schéma pixels
            for k in range(10):
                px = x + 20 + k * 74
                lit = (k % 3 != 1)
                c = hue(k / 10) if lit else ((40, 40, 46) if i == 0 else (0, 0, 0))
                d.rounded_rectangle([px, 750, px + 56, 790], 6, fill=c + (int(255 * a),), outline=(80, 80, 90, int(200 * a)))
            if i == 0:
                d.rectangle([x + 10, 800, x + 750, 812], fill=(255, 255, 220, int(160 * a)))
                d.text((x + 10, 822), "rétroéclairage", font=F(20, "Medium"), fill=GREY + (int(255 * a),))
        return im


class OvHz(Ov):
    static = False

    def draw(self, t):
        im, d = full()
        d.text((140, 110), "Fréquence d'affichage : combien d'images par seconde ?", font=F(40, "Black", True), fill=WHITE)
        d.text((140, 170), "Un mouvement rapide décomposé au ralenti : chaque carré = une image affichée", font=F(24, "Medium"), fill=GREY)
        lanes = [(60, 16.7, GREY), (144, 6.9, CYAN), (360, 2.8, RED)]
        L0, L1 = 520, 1780
        win = 0.1            # 100 ms de mouvement
        period = 3.0
        p = ease_io(min(1, (t % period) / (period * 0.8)))
        for i, (hz_, ms, col) in enumerate(lanes):
            a = ease((t - 0.3 - i * 0.4) / 0.6)
            if a <= 0: continue
            y = 280 + i * 200
            d.text((140, y), f"{hz_} Hz", font=F(64, "Black", True), fill=col + (int(255 * a),))
            d.text((140, y + 78), f"1 image toutes les {str(ms).replace('.', ',')} ms", font=F(24, "Medium"), fill=GREY + (int(255 * a),))
            d.line([L0, y + 55, L1, y + 55], fill=(255, 255, 255, int(30 * a)), width=2)
            n = int(win * hz_)
            shown = int(p * n) + 1
            for k in range(min(shown, n + 1)):
                x = L0 + 20 + (L1 - L0 - 40) * k / n
                last = (k == min(shown, n + 1) - 1)
                al = int(255 * a * (1.0 if last else 0.45))
                s_ = 26 if hz_ < 300 else 14
                d.rounded_rectangle([x - s_, y + 55 - 22, x + s_, y + 55 + 22], 6, fill=col + (al,))
            d.text((L1, y + 92), f"{n} images en 100 ms", font=F(22, "SemiBold"), fill=col + (int(255 * a),), anchor="ra")
        a = ease((t - (self.sent[1] if len(self.sent) > 1 else 4)) / 0.6)
        d.text((140, 880), "Plus de Hz = plus de positions intermédiaires = mouvement plus net et plus réactif",
               font=F(28, "SemiBold"), fill=(230, 232, 238, int(255 * a)))
        return im


@functools.lru_cache(None)
def res_imgs(name):
    src = Image.open(f"{DL}/shots/{name}.jpg").convert("RGB")
    crop = src.crop((900, 380, 1260, 582))  # détail
    a = crop.resize((int(360 * 0.75 * 0.75), int(202 * 0.75 * 0.75)), Image.LANCZOS).resize((720, 404), Image.NEAREST)
    b = crop.resize((int(360 * 0.75), int(202 * 0.75)), Image.LANCZOS).resize((720, 404), Image.NEAREST)
    return a, b


class OvRes(Ov):
    static = False

    def draw(self, t):
        im, d = full()
        a1, a2 = res_imgs(self.o["img"])
        for i, (x, img, ttl, mp, col) in enumerate([(160, a1, "1080p", "1920 × 1080 · 2,1 millions de pixels", GREY),
                                                    (1040, a2, "1440p", "2560 × 1440 · 3,7 millions de pixels", RED)]):
            a = ease((t - 0.3 - i * 0.7) / 0.6)
            if a <= 0: continue
            im.alpha_composite(fade(img.convert("RGBA"), a), (x, 230))
            d.rectangle([x - 2, 228, x + 722, 636], outline=col + (int(220 * a),), width=3)
            d.text((x, 140), ttl, font=F(64, "Black", True), fill=col + (int(255 * a),))
            d.text((x, 656), mp, font=F(28, "SemiBold"), fill=(230, 232, 238, int(255 * a)))
        a = ease((t - 2.0) / 0.6)
        if a > 0:
            s = text_sprite("+78 % de pixels", F(56, "Black", True), WHITE, glow_col=RED, pad=40)
            im.alpha_composite(fade(s, a), (690, 700))
        d.text((160, 800), "Détail agrandi · simulation de densité de pixels", font=F(20, "Medium"), fill=DGREY + (int(255 * a),))
        return im


class OvLegend(Ov):
    def draw(self, t):
        im, d = full()
        x0, y0 = 560, 300
        im.alpha_composite(panel(800, 420), (x0, y0))
        d.text((x0 + 44, y0 + 34), "COMMENT LIRE LES CHIFFRES", font=F(26, "Black", True), fill=RED, spacing=3)
        for i, (k, txt) in enumerate([("m", "Benchmark réel publié par un média spécialisé"), ("e", "Estimation expliquée (pas de test exact publié)"),
                                      ("fg", "FPS affichés avec génération d'images (IA)")]):
            y = y0 + 110 + i * 95
            b = badge(k)
            im.alpha_composite(b, (x0 + 44, y))
            d.text((x0 + 44, y + 44), txt, font=F(26, "Medium"), fill=(230, 232, 238))
        return im


class OvPresets(Ov):
    def draw(self, t):
        im, d = full()
        src = Image.open(f"{DL}/shots/wz_02.jpg").convert("RGB").resize((400, 225), Image.LANCZOS)
        names = [("FAIBLE", "FPS max · très lisible"), ("MOYEN", "Bon compromis"), ("ÉLEVÉ", "Ombres & effets riches"), ("ULTRA", "Beau, mais coûteux")]
        for i, (n, s) in enumerate(names):
            q = i / 3
            img = src.resize((int(400 * (0.35 + 0.65 * q)), int(225 * (0.35 + 0.65 * q))), Image.BILINEAR).resize((400, 225), Image.BILINEAR)
            img = ImageEnhance.Color(img).enhance(0.55 + 0.5 * q)
            img = ImageEnhance.Contrast(img).enhance(0.8 + 0.25 * q)
            x = 120 + i * 430
            im.paste(img, (x, 300))
            d.rectangle([x, 300, x + 400, 525], outline=(255, 255, 255, 60), width=2)
            d.text((x, 240), n, font=F(40, "Black", True), fill=WHITE)
            d.text((x, 545), s, font=F(26, "Medium"), fill=GREY)
        d.text((120, 640), "‹  plus de FPS, latence plus faible", font=F(30, "Bold"), fill=GREEN)
        d.text((1800, 640), "plus de détails visuels  ›", font=F(30, "Bold"), fill=ORANGE, anchor="ra")
        d.rectangle([120, 700, 1800, 710], fill=(255, 255, 255, 25))
        d.text((120, 730), "Illustration de la perte de détails · capture officielle retravaillée", font=F(20, "Medium"), fill=DGREY)
        return im


class OvFnNote(Ov):
    def draw(self, t):
        im, d = full()
        d.text((96, 790), "Visuel d'ambiance : Fortnite n'est pas distribué sur Steam, pas d'extrait officiel utilisé ici",
               font=F(20, "Medium"), fill=(200, 200, 220))
        return im


class OvGTA(Ov):
    def draw(self, t):
        im, d = full()
        s = text_sprite("GTA VI", F(200, "Black", True), WHITE, glow_col=(255, 60, 170), pad=60)
        im.alpha_composite(s, (100, 150))
        rows = [("Consoles (PS5 / Xbox Series)", "19 novembre 2026", WHITE), ("Version PC", "Non annoncée", ORANGE),
                ("Rumeur (non confirmée)", "Début 2027 ?", GREY), ("Configuration requise PC", "Aucune", GREY), ("Benchmarks", "Aucun · pas de chiffres inventés", RED)]
        x0, y0 = 1000, 220
        im.alpha_composite(panel(830, 520, fill=(10, 6, 16, 220)), (x0, y0))
        d.text((x0 + 44, y0 + 34), "CE QUE L'ON SAIT VRAIMENT", font=F(26, "Black", True), fill=(255, 80, 180), spacing=3)
        for i, (k, v, c) in enumerate(rows):
            y = y0 + 110 + i * 78
            d.text((x0 + 48, y), k, font=F(26, "Medium"), fill=GREY)
            d.text((x0 + 790, y + 30), v, font=F(30, "Bold"), fill=c, anchor="ra")
        d.text((110, 470), "Sources : Rockstar Games (Newswire), Take-Two", font=F(22, "Medium"), fill=(200, 190, 210))
        return im


class OvSourceTable(Ov):
    def draw(self, t):
        im, d = full()
        rows = [("Forza Horizon 6", "Extrême · sans RT / avec RT", "112 / 56", "m", "TechSpot"),
                ("Forza Horizon 6", "1440p · protocole maison", "118", "m", "ComputerBase"),
                ("Cyberpunk 2077", "Ultra sans RT", "102,6", "m", "CGMagazine"),
                ("Counter-Strike 2 (CPU)", "1080p · RTX 4090", "668", "m", "TechSpot"),
                ("Black Ops 6 / CS2", "Réglages max", "105–150 / 300+", "m", "Tests multiples"),
                ("Cyberpunk RT · RDR2 · Hogwarts", "Divers", "fourchettes", "e", "Estimations"),
                ("Fortnite · Warzone · CS2 compétitif", "Bas / compétitif", "fourchettes", "e", "Estimations"),
                ("FH5 · FH6 + DLSS", "Extrême · DLSS Qualité", "fourchettes", "e", "Estimations")]
        x0, y0, pw = 120, 120, 1680
        im.alpha_composite(panel(pw, 140 + len(rows) * 74, fill=(10, 10, 14, 230)), (x0, y0))
        d.text((x0 + 48, y0 + 34), "D'où viennent les chiffres ?", font=F(42, "Black", True), fill=WHITE)
        for i, (g, s, v, k, src) in enumerate(rows):
            y = y0 + 120 + i * 74
            col = GREEN if k == "m" else ORANGE
            d.ellipse([x0 + 50, y + 12, x0 + 66, y + 28], fill=col)
            d.text((x0 + 84, y), g, font=F(28, "SemiBold"), fill=WHITE)
            d.text((x0 + 720, y), s, font=F(26, "Medium"), fill=GREY)
            d.text((x0 + 1250, y), v, font=F(28, "Bold"), fill=WHITE, anchor="ra")
            d.text((x0 + pw - 48, y), src, font=F(26, "SemiBold"), fill=col, anchor="ra")
        return im


class OvVersus(Ov):
    static = False

    def draw(self, t):
        im, d = full()
        rows = [("Définition", "4K dyn. (Perf.) / 4K native (Qualité)", "1440p natif ou DLSS"),
                ("Fluidité", "60 FPS (Perf.) / 30 FPS (Qualité)", "112 FPS moy. sans RT · 56 avec RT natif"),
                ("Ray tracing", "Limité (reflets des voitures, Qualité)", "RTGI + reflets RT"),
                ("Réglages", "2 modes prédéfinis", "Chaque option ajustable"),
                ("Simplicité / prix", "+ Brancher et jouer, moins cher", "Plus cher, à régler"),
                ("Évolutivité", "Matériel figé", "+ Carte graphique, SSD, CPU…")]
        x0, y0, pw = 100, 110, 1720
        im.alpha_composite(panel(pw, 170 + len(rows) * 100, fill=(10, 10, 14, 232)), (x0, y0))
        d.text((x0 + 48, y0 + 30), "Forza Horizon 6", font=F(40, "Black", True), fill=WHITE)
        d.text((x0 + 620, y0 + 90), "XBOX SERIES X", font=F(28, "Black", True), fill=(16, 200, 80), spacing=2)
        d.text((x0 + 1180, y0 + 90), "TON PC", font=F(28, "Black", True), fill=RED, spacing=2)
        for i, (k, a_, b_) in enumerate(rows):
            al = ease((t - 0.4 - i * 0.45) / 0.5)
            if al <= 0: continue
            y = y0 + 150 + i * 100
            A = int(255 * al)
            d.line([x0 + 40, y - 14, x0 + pw - 40, y - 14], fill=(255, 255, 255, int(25 * al)))
            d.text((x0 + 48, y + 10), k, font=F(28, "Bold"), fill=GREY + (A,))
            for j, ln in enumerate(wrap(d, a_, F(26, "Medium"), 520)[:2]):
                d.text((x0 + 620, y + j * 32), ln, font=F(26, "Medium"), fill=(225, 228, 234, A))
            for j, ln in enumerate(wrap(d, b_, F(26, "SemiBold"), 500)[:2]):
                d.text((x0 + 1180, y + j * 32), ln, font=F(26, "SemiBold"), fill=(255, 255, 255, A))
        d.text((x0 + 48, y0 + 170 + len(rows) * 100 - 40), "Xbox : Digital Foundry · PC : TechSpot (RTX 5070, 1440p)", font=F(20, "Medium"), fill=DGREY)
        return im


class OvUpgrade(Ov):
    static = False

    def draw(self, t):
        im, d = full()
        d.text((140, 130), "Évolution possible : RTX 5070  →  RTX 5080", font=F(50, "Black", True), fill=WHITE)
        bars = [("RTX 5070 (actuelle)", 100, "100 %", RED), ("RTX 5080", 145, "≈ +40 à 50 %", ORANGE)]
        for i, (lab, v, txt, col) in enumerate(bars):
            g = ease((t - (self.sent[1] if len(self.sent) > 1 else 1) - i * 0.4) / 1.2)
            y = 300 + i * 130
            d.text((140, y + 10), lab, font=F(32, "SemiBold"), fill=WHITE)
            d.rounded_rectangle([600, y, 600 + int(800 * v / 150 * g), y + 56], 10, fill=col)
            if g > 0:
                d.text((620 + int(800 * v / 150 * g), y + 6), txt, font=F(36, "Black", True), fill=WHITE)
        d.text((140, 580), "Performances relatives en 1440p · ordre de grandeur issu des tests publiés (estimation)", font=F(22, "Medium"), fill=GREY)
        cards = [("VRAM", "12 Go → 16 Go"), ("Processeur", "9800X3D : aucun frein"), ("Alimentation", "NVIDIA recommande 850 W · 750 W à vérifier")]
        for i, (k, v) in enumerate(cards):
            a = ease((t - (self.sent[2] if len(self.sent) > 2 else 3) - i * 0.3) / 0.6)
            if i == 2:
                a = ease((t - (self.sent[3] if len(self.sent) > 3 else 5)) / 0.6)
            if a <= 0: continue
            x = 140 + i * 560
            im.alpha_composite(fade(panel(520, 170), a), (x, 660))
            d.text((x + 36, 690), k.upper(), font=F(22, "Bold"), fill=RED + (int(255 * a),), spacing=3)
            for j, ln in enumerate(wrap(d, v, F(30, "SemiBold"), 450)[:2]):
                d.text((x + 36, 730 + j * 38), ln, font=F(30, "SemiBold"), fill=(255, 255, 255, int(255 * a)))
        return im


class OvCredits(Ov):
    def draw(self, t):
        im, d = full()
        d.text((W // 2, 150), CREDITS[0], font=F(46, "Black", True), fill=WHITE, anchor="mm")
        d.rectangle([W // 2 - 80, 195, W // 2 + 80, 201], fill=RED)
        for i, ln in enumerate(CREDITS[1:]):
            d.text((W // 2, 270 + i * 66), ln, font=F(27, "Medium"), fill=(210, 214, 222), anchor="mm")
        return im


class OvHeroSprite(Ov):
    """le PC illustré, à gauche, RGB animé"""
    static = False

    def draw(self, t):
        im = Image.new("RGBA", (W, H))
        sp = hero_pc(int(t * 12) % 36)
        r = 0.98
        fl = 10 * math.sin(t * 1.1)
        im.alpha_composite(sp, (int(80), int(H / 2 - sp.height * r / 2 + fl)))
        return im

    def alpha(self, t):
        return min(1, ease(t / 0.8)) * (1 - ease_io((t - (self.D - 0.4)) / 0.4))

    def offset(self, t):
        return (0, 0)


OVS = {"kicker": OvKicker, "title": OvTitle, "gametitle": OvGameTitle, "chapter": OvChapter, "complist": OvCompList,
       "component": OvComponent, "chart": OvChart, "settings": OvSettings, "note": OvNote, "bullets": OvBullets,
       "vcache": OvVCache, "dlss": OvDLSS, "monitor": OvMonitor, "oled": OvOLED, "hz": OvHz, "res": OvRes,
       "legend": OvLegend, "presets": OvPresets, "fn_note": OvFnNote, "gta": OvGTA, "sourcetable": OvSourceTable,
       "versus": OvVersus, "upgrade": OvUpgrade, "credits": OvCredits}
import ov2  # noqa: E402  (overlays v2 : photos, schémas, écrans)
ov2.install(sys.modules[__name__])
import ov3  # noqa: E402  (v3 : plans multiples, gros plans photo, typographie animée, graphiques XL)
ov3.install(sys.modules[__name__])


# ------------------------------------------------------------- SOUS-TITRES
def split_caption(s, maxc=88):
    if len(s) <= maxc:
        return [s]
    words = s.split()
    n = math.ceil(len(s) / maxc)
    target = len(s) / n
    out, cur = [], ""
    for w_ in words:
        if cur and len(cur) + 1 + len(w_) > target * 1.12 and len(out) < n - 1:
            out.append(cur); cur = w_
        else:
            cur = (cur + " " + w_).strip()
        if cur.endswith((",", ":", ";", ".")) and len(cur) > target * 0.7 and len(out) < n - 1:
            out.append(cur); cur = ""
    if cur:
        out.append(cur)
    return out


def captions(sc):
    caps = []
    for b in sc["beats"]:
        for s in b["sent"]:
            parts = split_caption(s["text"])
            tot = sum(len(p) for p in parts)
            t = s["t"]
            for p in parts:
                d = s["d"] * len(p) / tot
                caps.append((t, t + d, p)); t += d
    return caps


@functools.lru_cache(64)
def cap_sprite(txt):
    f = F(38, "SemiBold")
    tmp = ImageDraw.Draw(Image.new("RGBA", (1, 1)))
    lines = wrap(tmp, txt, f, 1500)
    lw = max(tmp.textlength(l, font=f) for l in lines)
    w = int(lw + 56); h = 18 + 50 * len(lines) + 8
    im = Image.new("RGBA", (w, h))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([0, 0, w - 1, h - 1], 14, fill=(0, 0, 0, 150))
    for i, l in enumerate(lines):
        d.text((w / 2, 14 + i * 50), l, font=f, fill=(255, 255, 255), anchor="ma")
    return im


# ------------------------------------------------------------- RENDU D'UNE SCÈNE
def render_scene(si):
    tl = json.load(open(f"{OUT}/timeline.json"))
    sc = tl["scenes"][si]
    name, beats_spec = SCENES[si]
    caps = captions(sc)
    f0 = round(sc["start"] * FPS)
    f1 = round((sc["start"] + sc["dur"]) * FPS)
    nfr = f1 - f0
    enc = None if os.environ.get("PREVIEW") else subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS),
                            "-i", "-", "-c:v", "libx264", "-preset", "medium", "-crf", "19", "-pix_fmt", "yuv420p", "-threads", "3",
                            f"{OUT}/seg_{si:02d}.mp4"], stdin=subprocess.PIPE)
    vig = vignette()
    prev_last = None
    cur = -1
    bg = None; ovs = []; xf = 0
    prev = [float(x) for x in os.environ["PREVIEW"].split(",")] if os.environ.get("PREVIEW") else None
    for fi in range(nfr):
        T = (f0 + fi) / FPS
        if prev is not None and fi / FPS > max(prev) + 0.1:
            break
        # beat courant
        bi = cur
        while bi + 1 < len(sc["beats"]) and T >= sc["beats"][bi + 1]["start"] - 1e-6:
            bi += 1
        bi = max(bi, 0)
        if bi != cur:
            if bg is not None:
                bg.close()
            spec = beats_spec[bi]; bt = sc["beats"][bi]
            sent_rel = [s["t"] - bt["start"] for s in bt["sent"]]
            bg = make_bg(spec["bg"], bt["dur"], bi + si, sent_rel)
            ovs = [OVS[o["k"]](o, bt["dur"], sent_rel) for o in spec["ov"]]
            b0 = spec["bg"] if isinstance(spec["bg"], str) else spec["bg"][0]
            dim = spec["dim"] if spec["dim"] is not None else (0.0 if b0 in ("dark", "gta") or b0[:2] in ("p:", "pz", "fn", "sp") else 0.35)
            xf = XF if cur >= 0 else 0
            cur = bi
        bt = sc["beats"][cur]
        t = T - bt["start"]
        if prev is not None and not any(abs(fi / FPS - p) < 0.5 / FPS for p in prev):
            bg.frame(t); continue
        frame = bg.frame(t).astype(np.float32)
        frame = frame * vig * (1 - dim)
        img = Image.fromarray(np.clip(frame, 0, 255).astype(np.uint8)).convert("RGBA")
        for ov in ovs:
            a = ov.alpha(t)
            if a <= 0.003:
                continue
            L = ov.layer(t)
            dx, dy = ov.offset(t)
            L = fade(L, a)
            if dx or dy:
                img.alpha_composite(L.crop((max(0, -dx), max(0, -dy), W - max(0, dx), H - max(0, dy))), (max(0, dx), max(0, dy)))
            else:
                img.alpha_composite(L)
        # sous-titres
        for (c0, c1, txt) in caps:
            if c0 - 0.05 <= T < c1 + 0.12:
                sp = cap_sprite(txt)
                img.alpha_composite(sp, ((W - sp.width) // 2, H - 60 - sp.height))
                break
        out = np.asarray(img.convert("RGB"))
        # fondu enchaîné entre plans (sur l'image figée du plan précédent)
        if xf > 0 and prev_last is not None:
            k = 1 - xf / (XF + 1)
            out = (prev_last * (1 - k) + out * k).astype(np.uint8)
            xf -= 1
        # fondu au noir en début / fin de scène
        fin = min(1, (fi + 1) / 10, (nfr - fi) / 10)
        if fin < 1:
            out = (out * fin).astype(np.uint8)
        nxt_change = (fi + 1 < nfr) and cur + 1 < len(sc["beats"]) and (f0 + fi + 1) / FPS >= sc["beats"][cur + 1]["start"] - 1e-6
        if nxt_change:
            prev_last = out.astype(np.float32)
        if prev is not None:
            Image.fromarray(out).resize((960, 540)).save(f"{OUT}/prev_{si:02d}_{fi / FPS:06.1f}.jpg"); continue
        enc.stdin.write(np.ascontiguousarray(out).tobytes())
    bg.close()
    if enc:
        enc.stdin.close(); enc.wait()
    return si


if __name__ == "__main__":
    import multiprocessing as mp
    which = [int(x) for x in sys.argv[3].split(",")] if len(sys.argv) > 3 else list(range(len(SCENES)))
    with mp.Pool(int(os.environ.get("JOBS", "4"))) as pool:
        for si in pool.imap_unordered(render_scene, which):
            print("scène", si, "ok", flush=True)
