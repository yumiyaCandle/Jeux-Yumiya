# -*- coding: utf-8 -*-
"""v3 : plans multiples synchronisés, gros plans photo avec mise au point, typographie animée,
graphiques XL avec légende permanente, illustrations originales façon battle royale,
simulation réglages compétitifs / élevés, comparaison des écrans."""
import math
import functools
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance
from gfx import *  # noqa: F401,F403
from script import shot_times, chip_times

XFS = 8  # images de fondu entre deux plans d'un même beat


def install(R):
    Ov, full = R.Ov, R.full
    base_make = R.make_bg

    # ================================================================ typographie animée
    def kin_sprite(text, font, t, fill=WHITE, glow=None, stagger=0.028, dur=0.38, pad=36, spacing=0):
        tmp = ImageDraw.Draw(Image.new("RGBA", (1, 1)))
        bb = font.getbbox(text)
        w = int(tmp.textlength(text, font=font) + spacing * len(text) + pad * 2)
        h = int(bb[3] - bb[1] + pad * 2 + 24)
        im = Image.new("RGBA", (w, h))
        d = ImageDraw.Draw(im)
        x = pad
        for i, ch in enumerate(text):
            a = ease((t - i * stagger) / dur)
            if a > 0:
                d.text((x, pad - bb[1] + int(22 * (1 - a))), ch, font=font, fill=fill[:3] + (int(255 * a),))
            x += tmp.textlength(ch, font=font) + spacing
        if glow:
            g = Image.new("RGBA", im.size, glow + (0,))
            g.putalpha(im.getchannel("A").filter(ImageFilter.GaussianBlur(pad / 2.4)))
            out = Image.new("RGBA", im.size)
            out.alpha_composite(g); out.alpha_composite(g); out.alpha_composite(im)
            return out
        return im

    class OvChapter(Ov):
        static = False

        def draw(self, t):
            im, d = full()
            a = ease(t / 0.8)
            num = text_sprite(self.o["num"], F(300, "Black", True), (255, 255, 255, 16), pad=10)
            im.alpha_composite(fade(num, a), (140 + int(30 * (1 - a)), 250))
            d.rectangle([150, 560, 150 + int(300 * ease((t - 0.15) / 0.9)), 566], fill=RED)
            d.rectangle([150, 572, 150 + int(120 * ease((t - 0.35) / 0.9)), 576], fill=PINK)
            d.text((156, 386), f"CHAPITRE {self.o['num']}", font=F(26, "Bold"), fill=RED + (int(255 * a),), spacing=6)
            s = kin_sprite(self.o["title"], F(84, "Black", True), t - 0.2, glow=RED, stagger=0.022)
            im.alpha_composite(s, (150 - 36, 440 - 36))
            s2 = kin_sprite(self.o["sub"], F(36, "Medium"), t - 0.75, fill=GREY, stagger=0.012)
            im.alpha_composite(s2, (152 - 36, 598 - 36))
            return im

        def alpha(self, t):
            return 1 - ease_io((t - (self.D - 0.4)) / 0.4)

        def offset(self, t):
            return (0, 0)

    class OvGameTitle(Ov):
        static = False

        def draw(self, t):
            im, d = full()
            s = kin_sprite(self.o["text"], F(120, "Black", True), t - 0.5, glow=(0, 0, 0), stagger=0.04, dur=0.5)
            im.alpha_composite(s, (90 - 36, 640 - 36))
            d.rectangle([94, 620, 94 + int(260 * ease((t - 0.3) / 0.8)), 627], fill=RED)
            s2 = kin_sprite(self.o["sub"].upper(), F(26, "SemiBold"), t - 1.3, fill=(225, 225, 235), stagger=0.012)
            im.alpha_composite(s2, (94 - 36, 790 - 36))
            return im

        def offset(self, t):
            return (0, 0)

    class OvTitle(Ov):
        static = False

        def draw(self, t):
            im, d = full()
            x = 1070
            s = kin_sprite(self.o["text"], F(66, "Black", True), t - 0.3, glow=RED, stagger=0.035, dur=0.45)
            im.alpha_composite(s, (x - 36, 380 - 36))
            d.rectangle([x, 500, x + int(170 * ease((t - 0.6) / 0.8)), 507], fill=RED)
            s2 = kin_sprite(self.o["sub"], F(34, "Medium"), t - 1.0, fill=GREY, stagger=0.012)
            im.alpha_composite(s2, (x - 36, 528 - 36))
            return im

        def offset(self, t):
            return (0, 0)

    class OvKicker(Ov):
        static = False

        def draw(self, t):
            im, d = full()
            d.rectangle([90, 90, 98, 90 + int(50 * ease((t - 0.2) / 0.5))], fill=RED)
            s = kin_sprite(self.o["text"], F(30, "Bold"), t - 0.35, stagger=0.02)
            im.alpha_composite(s, (118 - 36, 96 - 36))
            return im

        def offset(self, t):
            return (0, 0)

    # ================================================================ caractéristiques progressives
    class OvChips(Ov):
        static = False

        def __init__(self, *a):
            super().__init__(*a)
            self.times = chip_times(len(self.o["items"]), self.sent, self.D)

        def draw(self, t):
            im, d = full()
            x0 = 1130
            d.text((x0, 196), self.o["sub"], font=F(22, "Bold"), fill=PINK + (int(255 * ease((t - 0.2) / 0.5)),), spacing=3)
            title = self.o["title"]
            f = F(54 if len(title) < 24 else 44, "Black", True)
            lines = wrap(d, title, f, 740)
            for j, ln in enumerate(lines[:2]):
                s = kin_sprite(ln, f, t - 0.35 - j * 0.25, glow=(0, 0, 0), stagger=0.018)
                im.alpha_composite(s, (x0 - 36, 230 + j * 62 - 36))
            y = 250 + 62 * min(2, len(lines)) + 40
            for i, it in enumerate(self.o["items"]):
                a = ease((t - self.times[i]) / 0.5)
                if a <= 0:
                    continue
                sz = 30
                f2 = F(sz, "SemiBold")
                while d.textlength(it, font=f2) > 650 and sz > 20:
                    sz -= 2; f2 = F(sz, "SemiBold")
                tw = int(d.textlength(it, font=f2))
                cw = min(760, tw + 84)
                xx = x0 + int(60 * (1 - a))
                d.rounded_rectangle([xx, y, xx + cw, y + 64], 32, fill=(14, 10, 26, int(205 * a)), outline=RED + (int(150 * a),), width=2)
                d.ellipse([xx + 24, y + 26, xx + 36, y + 38], fill=PINK + (int(255 * a),))
                d.text((xx + 54, y + 32), it, font=f2, fill=(255, 255, 255, int(255 * a)), anchor="lm")
                y += 82
            return im

        def offset(self, t):
            return (0, 0)

    # ================================================================ graphique XL + légende permanente
    def legend_strip(im, x, y):
        d = ImageDraw.Draw(im)
        for k, (col, lab) in enumerate([(GREEN, "MESURÉ"), (ORANGE, "ESTIMATION"), (VIOLET, "IMAGES GÉNÉRÉES")]):
            f = F(19, "Bold")
            tw = int(d.textlength(lab, font=f))
            d.rounded_rectangle([x, y, x + tw + 44, y + 36], 18, fill=col + (40,), outline=col + (220,), width=2)
            d.ellipse([x + 12, y + 12, x + 24, y + 24], fill=col)
            d.text((x + 32, y + 7), lab, font=f, fill=col)
            x += tw + 56

    class OvChart(Ov):
        static = False

        def draw(self, t):
            o = self.o
            im, d = full()
            rows = o["rows"]; n = len(rows)
            compact = o.get("compact")
            x0, pw = 80, 1760
            y0 = 60
            top = y0 + 160
            rh = 88 if compact else min(150, int(660 / n))
            ph = 160 + n * rh + 60
            im.alpha_composite(panel(pw, ph, fill=(10, 8, 18, 232)), (x0, y0))
            d.text((x0 + 48, y0 + 30), o["title"], font=F(48 if not compact else 44, "Black", True), fill=WHITE)
            d.text((x0 + 50, y0 + 96), o["sub"], font=F(25, "Medium"), fill=GREY)
            legend_strip(im, x0 + pw - 560, y0 + 36)
            mx = o["max"]
            if compact:
                lx, bx, bw = x0 + 50, x0 + 620, pw - 620 - 330
            else:
                lx, bx, bw = x0 + 50, x0 + 50, pw - 50 - 360
            sx = lambda v: bx + bw * v / mx
            for r_ in o.get("ref", []):
                if r_ <= mx:
                    xr = sx(r_)
                    col = PINK if r_ == 360 else (130, 134, 146)
                    for yy in range(top - 10, top + n * rh - 20, 16):
                        d.line([xr, yy, xr, yy + 8], fill=col, width=3)
                    d.text((xr, top + n * rh - 8), "360 Hz" if r_ == 360 else f"{r_} FPS", font=F(22, "Bold"), fill=col, anchor="ma")
            for i, row in enumerate(rows):
                lab, v, rng, kind, src = row[:5]
                cond = row[5] if len(row) > 5 else None
                st = 0.5 + i * 0.35
                g = ease((t - st) / 1.1)
                y = top + i * rh
                col = {"m": GREEN, "e": ORANGE, "fg": VIOLET, "na": GREY}[kind]
                if compact:
                    d.text((lx, y + 4), lab, font=F(31, "SemiBold"), fill=WHITE)
                    by, bh = y + 4, 40
                else:
                    d.text((lx, y), lab, font=F(32, "SemiBold"), fill=WHITE)
                    by, bh = y + 44, 42
                d.rounded_rectangle([bx, by, bx + bw, by + bh], 10, fill=(255, 255, 255, 14))
                if kind == "na":
                    d.text((bx + 20, by + bh // 2), "Aucun chiffre : version PC non annoncée", font=F(26, "SemiBold"), fill=GREY + (int(255 * g),), anchor="lm")
                if rng and g > 0:
                    d.rounded_rectangle([sx(rng[0] * g), by, sx(rng[1] * g), by + bh], 10, fill=col + (70,))
                if g > 0 and kind != "na":
                    xe = max(bx + 12, sx(v * g))
                    d.rounded_rectangle([bx, by, xe, by + bh], 10, fill=col + (240,))
                    if kind == "fg":
                        for hx in range(int(bx), int(xe) - 10, 20):
                            d.line([hx, by + bh, hx + 16, by], fill=(255, 255, 255, 90), width=4)
                    num = f"{int(round(v * g))}"
                    if rng:
                        num = "≈" + num
                    d.text((xe + 18, by - 6), num, font=F(50 if not compact else 42, "Black", True), fill=WHITE)
                ab = ease((t - st - 0.7) / 0.5)
                if ab > 0:
                    f = F(21, "Bold")
                    labb = {"m": "MESURÉ · " + src, "e": "ESTIMATION", "fg": "IMAGES GÉNÉRÉES", "na": "AUCUNE DONNÉE"}[kind]
                    tw = int(d.textlength(labb, font=f))
                    xb = x0 + pw - tw - 80
                    yb = by + (bh - 38) // 2
                    d.rounded_rectangle([xb, yb, xb + tw + 40, yb + 38], 19, fill=col + (int(45 * ab),), outline=col + (int(230 * ab),), width=2)
                    d.text((xb + 20, yb + 8), labb, font=f, fill=col + (int(255 * ab),))
                    if cond and not compact:
                        tx = cond + (f"  ·  fourchette {rng[0]}–{rng[1]} FPS" if rng else "")
                        d.text((lx, by + bh + 6), tx, font=F(21, "Medium"), fill=(185, 188, 205, int(255 * ab)))
            return im

    # ================================================================ fréquences : 60 / 144 / 240 / 360 Hz
    class OvHz(Ov):
        static = False

        def draw(self, t):
            im, d = full()
            d.text((140, 90), "Combien d'images par seconde ?", font=F(48, "Black", True), fill=WHITE)
            d.text((140, 156), "Un mouvement rapide décomposé au ralenti : chaque carré = une image affichée", font=F(24, "Medium"), fill=GREY)
            lanes = [(60, "16,7", GREY, ""), (144, "6,9", CYAN, ""), (240, "4,2", BLUE, "AOC C27G2ZU"), (360, "2,8", PINK, "Gigabyte MO27Q3")]
            L0, L1 = 560, 1780
            p = ease_io(min(1, (t % 3.0) / 2.4))
            for i, (hz_, ms, col, who) in enumerate(lanes):
                a = ease((t - 0.3 - i * 0.35) / 0.6)
                if a <= 0:
                    continue
                y = 240 + i * 168
                d.text((140, y), f"{hz_} Hz", font=F(62, "Black", True), fill=col + (int(255 * a),))
                d.text((140, y + 76), f"1 image toutes les {ms} ms", font=F(24, "Medium"), fill=GREY + (int(255 * a),))
                if who:
                    d.text((L1, y - 4), who, font=F(22, "Bold"), fill=col + (int(255 * a),), anchor="ra")
                d.line([L0, y + 60, L1, y + 60], fill=(255, 255, 255, int(30 * a)), width=2)
                n = int(0.1 * hz_)
                shown = int(p * n) + 1
                for k in range(min(shown, n + 1)):
                    x = L0 + 20 + (L1 - L0 - 40) * k / n
                    last = (k == min(shown, n + 1) - 1)
                    s_ = 24 if hz_ < 200 else (16 if hz_ < 300 else 12)
                    d.rounded_rectangle([x - s_, y + 60 - 22, x + s_, y + 60 + 22], 6, fill=col + (int(255 * a * (1.0 if last else 0.45)),))
            return im

    # ================================================================ duel des écrans
    class OvDuel(Ov):
        static = False

        def draw(self, t):
            im, d = full()
            for k, (pid, cx, name, col) in enumerate([("mo27q3", 500, "Gigabyte MO27Q3", PINK), ("aoc", 1420, "AOC C27G2ZU/BK", BLUE)]):
                a = ease((t - 0.2 - k * 0.3) / 0.6)
                th = R.load_photo(pid).copy(); th.thumbnail((560, 330), Image.LANCZOS)
                im.alpha_composite(fade(th, a), (cx - th.width // 2, 60 + int(20 * (1 - a))))
                s = kin_sprite(name, F(34, "Black", True), t - 0.5 - k * 0.3, fill=col)
                im.alpha_composite(s, (cx - s.width // 2, 400 - 36))
            rows = [("Fréquence", 360, 240, "360 Hz", "240 Hz", 360), ("Pixels", 3.69, 2.07, "3,69 M (1440p)", "2,07 M (1080p)", 3.69),
                    ("Dalle", 1, 0.6, "QD-OLED · noirs parfaits", "VA incurvée 1500R", 1), ("Diagonale", 1, 1, "27\" annoncés · ≈26,7\" visibles", "27\"", 1)]
            for i, (lab, lv, rv, lt, rt, mx) in enumerate(rows):
                g = ease((t - 1.0 - i * 0.4) / 0.9)
                if g <= 0:
                    continue
                y = 480 + i * 100
                d.text((960, y + 4), lab.upper(), font=F(22, "Bold"), fill=GREY, anchor="ma")
                wl = int(620 * lv / mx * g); wr = int(620 * rv / mx * g)
                d.rounded_rectangle([890 - wl, y + 38, 890, y + 74], 10, fill=PINK + (230,))
                d.rounded_rectangle([1030, y + 38, 1030 + wr, y + 74], 10, fill=BLUE + (230,))
                d.text((890 - 14, y + 40), lt, font=F(25, "Bold"), fill=WHITE, anchor="ra") if wl > 360 else d.text((890 - wl - 14, y + 40), lt, font=F(25, "Bold"), fill=WHITE, anchor="ra")
                d.text((1030 + 14, y + 40), rt, font=F(25, "Bold"), fill=WHITE) if wr > 360 else d.text((1030 + wr + 14, y + 40), rt, font=F(25, "Bold"), fill=WHITE)
            d.text((960, 905), "Données constructeurs · diagonale visible calculée d'après la zone d'affichage Gigabyte (590,42 × 333,72 mm)", font=F(19, "Medium"), fill=DGREY, anchor="ma")
            return im

    # ================================================================ tableau des sources XL
    class OvSourceTable(Ov):
        def draw(self, t):
            im, d = full()
            hdr = ["Mesure", "Déf.", "Réglages", "RT", "DLSS", "FG", "Processeur", "Résultat", "Source"]
            xs = [130, 470, 570, 820, 900, 1000, 1075, 1330, 1560]
            rows = [("Forza Horizon 6", "1440p", "Extrême", "Non", "Non", "Non", "n. p.", "112 FPS", "TechSpot"),
                    ("Forza Horizon 6", "1440p", "Extrême", "Oui", "Non", "Non", "n. p.", "56 FPS", "TechSpot"),
                    ("Forza Horizon 6", "1440p", "Protocole CB", "n. p.", "n. p.", "Non", "n. p.", "118 FPS", "ComputerBase"),
                    ("Cyberpunk 2077", "1440p", "Ultra", "Non", "Non", "Non", "n. p.", "102,6 FPS", "CGMagazine"),
                    ("CS2 · test CPU*", "1080p", "—", "Non", "Non", "Non", "9800X3D / 7800X3D", "668 / 591", "TechSpot"),
                    ("Moyenne 25 jeux", "1440p", "Raster", "Non", "Non", "Non", "Ryzen 7 9800X3D", "+22 % / 4070", "TechPowerUp")]
            im.alpha_composite(panel(1780, 150 + len(rows) * 92 + 90, fill=(10, 8, 18, 238)), (70, 60))
            d.text((120, 88), "Mesures réelles utilisées", font=F(46, "Black", True), fill=WHITE)
            legend_strip(im, 1250, 96)
            for k, h_ in enumerate(hdr):
                d.text((xs[k], 172), h_.upper(), font=F(20, "Bold"), fill=PINK, spacing=2)
            for i, r_ in enumerate(rows):
                y = 218 + i * 92
                d.line([110, y - 18, 1830, y - 18], fill=(255, 255, 255, 24))
                d.ellipse([92, y + 10, 108, y + 26], fill=GREEN)
                for k, v in enumerate(r_):
                    f = F(26 if k != 6 else 23, "Bold" if k in (0, 7) else "Medium")
                    c = GREEN if k == 8 else (WHITE if k in (0, 7) else (220, 222, 232))
                    d.text((xs[k], y), v, font=f, fill=c)
            yb = 218 + len(rows) * 92
            d.text((120, yb), "Carte : RTX 5070, sauf *CS2 (RTX 4090, test processeur) · n. p. = non précisé dans la source consultée · 1 % low : non relevés ici",
                   font=F(21, "Medium"), fill=GREY)
            d.text((120, yb + 34), "Toutes les autres valeurs de la vidéo sont des ESTIMATIONS (badge orange) · FG = génération d'images",
                   font=F(21, "SemiBold"), fill=ORANGE)
            return im

    # ================================================================ plans : gros plan photo
    @functools.lru_cache(24)
    def zoom_base(name, reg, boxw, boxh):
        p = R.load_photo(name)
        x0, y0, x1, y1 = reg
        c = p.crop((int(x0 * p.width), int(y0 * p.height), int(x1 * p.width), int(y1 * p.height)))
        bb = c.getchannel("A").getbbox()
        if bb:
            c = c.crop(bb)
        r = min(boxw / c.width, boxh / c.height) * 1.12
        c = c.resize((int(c.width * r), int(c.height * r)), Image.LANCZOS)
        c = c.filter(ImageFilter.UnsharpMask(radius=2, percent=60, threshold=2))
        g = Image.new("RGBA", (c.width + 240, c.height + 240), (130, 70, 255, 0))
        al = Image.new("L", g.size); al.paste(c.getchannel("A"), (120, 120))
        g.putalpha(al.filter(ImageFilter.GaussianBlur(50)).point(lambda v: int(v * 0.7)))
        return c, g

    class PhotoZoomBG:
        def __init__(self, name, reg, dur, k):
            self.dark = R.DarkBG("dark"); self.name = name; self.reg = reg; self.dur = dur; self.k = k

        def frame(self, t):
            base = Image.fromarray(self.dark.frame(t)).convert("RGBA")
            c, g = zoom_base(self.name, self.reg, 1050, 820)
            u = ease_io(t / max(self.dur, 0.1))
            z = 0.9 + 0.1 * u
            cw, ch = int(c.width * z), int(c.height * z)
            sp = c.resize((cw, ch), Image.BILINEAR)
            blur = 9 * (1 - ease(t / 0.9))
            if blur > 0.4:
                sp = sp.filter(ImageFilter.GaussianBlur(blur))
            gs = g.resize((int(g.width * z), int(g.height * z)), Image.BILINEAR)
            dx = int(40 * (u - 0.5) * (1 if self.k % 2 else -1))
            cx, cy = 600 + dx, 520
            base.alpha_composite(gs, (cx - gs.width // 2, cy - gs.height // 2))
            base.alpha_composite(sp, (cx - cw // 2, cy - ch // 2))
            # reflet lumineux qui balaie le produit
            ph = ((t * 0.25) % 1.5) - 0.25
            xs = np.arange(cw)[None, :] / cw; ys = np.arange(ch)[:, None] / ch
            band = np.exp(-((xs + ys * 0.5 - ph * 1.5) / 0.05) ** 2) * 60
            a = np.asarray(sp.getchannel("A")).astype(np.float32) / 255
            L = np.zeros((ch, cw, 4), np.uint8); L[..., :3] = 255; L[..., 3] = (band * a).astype(np.uint8)
            base.alpha_composite(Image.fromarray(L), (cx - cw // 2, cy - ch // 2))
            return np.asarray(base.convert("RGB"))

        def close(self): pass

    # ================================================================ plans : simulation compétitif / élevé
    class SplitBG:
        def __init__(self, clip, ss, dur, k):
            self.c = R.ClipBG(clip, ss, dur, k)

        def frame(self, t):
            f = self.c.frame(t).astype(np.float32)
            left = f[:, :960]
            gray = left.mean(axis=2, keepdims=True)
            left = gray + (left - gray) * 0.55
            left = 255 * (left / 255) ** 0.8
            right = f[:, 960:]
            gray2 = right.mean(axis=2, keepdims=True)
            right = np.clip(gray2 + (right - gray2) * 1.18, 0, 255)
            right = np.clip((right - 128) * 1.08 + 128, 0, 255)
            out = np.concatenate([left, right], axis=1)
            im = Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)).convert("RGBA")
            d = ImageDraw.Draw(im)
            d.rectangle([957, 0, 963, 1080], fill=(255, 255, 255, 220))
            for x, lab, col in [(60, "RÉGLAGES COMPÉTITIFS", GREEN), (1020, "RÉGLAGES ÉLEVÉS", PINK)]:
                d.rounded_rectangle([x, 60, x + 470, 120], 30, fill=(10, 8, 18, 200), outline=col, width=3)
                d.text((x + 235, 74), lab, font=F(28, "Black", True), fill=col, anchor="ma")
            d.text((960, 860), "Simulation du principe sur une image officielle · pas une capture comparative du jeu", font=F(22, "SemiBold"), fill=(240, 240, 250), anchor="ma")
            return np.asarray(im.convert("RGB"))

        def close(self):
            self.c.close()

    # ================================================================ illustrations originales façon battle royale
    SKY = {}

    def sky(style):
        if style not in SKY:
            y = np.linspace(0, 1, 1080)[:, None, None]
            if style == "epic":
                top, bot = np.array([30, 60, 170]), np.array([255, 170, 200])
            else:
                top, bot = np.array([90, 150, 230]), np.array([150, 200, 245])
            SKY[style] = (top * (1 - y) + bot * y).astype(np.float32) * np.ones((1, 1920, 1))
        return SKY[style]

    def figure(d, x, y, t, col, run=True, s=1.0, shadow=False):
        sw = math.sin(t * 12) if run else 0
        if shadow:
            d.ellipse([x - 60 * s, y + 150 * s, x + 60 * s, y + 170 * s], fill=(0, 0, 0, 90))
        for k, sg in ((-1, sw), (1, -sw)):  # jambes
            d.line([x + k * 14 * s, y + 70 * s, x + k * 14 * s + sg * 26 * s, y + 160 * s], fill=(40, 40, 70), width=int(18 * s))
        d.rounded_rectangle([x - 34 * s, y - 20 * s, x + 34 * s, y + 80 * s], int(20 * s), fill=col)  # buste
        d.rounded_rectangle([x - 52 * s, y - 6 * s, x - 30 * s, y + 60 * s], int(8 * s), fill=(90, 70, 50))  # sac
        d.line([x + 24 * s, y + 10 * s, x + 70 * s, y + 30 * s - sw * 10 * s], fill=col, width=int(16 * s))  # bras
        d.ellipse([x - 26 * s, y - 72 * s, x + 26 * s, y - 20 * s], fill=(240, 200, 170))  # tête
        d.pieslice([x - 30 * s, y - 80 * s, x + 30 * s, y - 30 * s], 180, 360, fill=(250, 210, 60))  # casque

    def draw_fn(mode, t, style):
        epic = style == "epic"
        arr = sky(style).copy()
        im = Image.fromarray(arr.astype(np.uint8)).convert("RGBA")
        d = ImageDraw.Draw(im)
        if epic:  # soleil + nuages
            d.ellipse([1380, 120, 1600, 340], fill=(255, 230, 180, 200))
            for k in range(5):
                cx = (k * 420 + t * 25) % 2300 - 200
                d.ellipse([cx, 140 + k * 30, cx + 300, 220 + k * 30], fill=(255, 255, 255, 110))
        spd = 260 if mode == "run" else 40
        for layer, (yb, col, amp, par) in enumerate([(640, (60, 110, 160), 90, 0.2), (700, (50, 140, 90), 60, 0.5), (760, (60, 170, 80), 40, 1.0)]):
            off = (t * spd * par) % 600
            pts = [(-10, 1080)]
            for x in range(-600, 2600, 60):
                xx = x - off
                pts.append((xx, yb - amp * (0.5 + 0.5 * math.sin(x / 210 + layer))))
            pts.append((2600, 1080))
            c = col if not epic else tuple(int(v * 0.9) for v in col)
            d.polygon(pts, fill=c)
        off = (t * spd) % 380
        for k in range(8):  # arbres
            x = k * 380 - off
            if epic:
                d.ellipse([x - 8, 870, x + 70, 890], fill=(0, 0, 0, 70))
            d.rectangle([x + 22, 790, x + 38, 880], fill=(110, 70, 40))
            d.ellipse([x - 20, 700, x + 80, 810], fill=(40, 150, 70) if epic else (70, 170, 90))
        d.rectangle([0, 880, 1920, 1080], fill=(70, 160, 70) if epic else (90, 175, 90))
        figure(d, 700, 640, t, (150, 90, 255) if epic else (160, 120, 230), run=(mode in ("run", "fight", "storm")), s=1.5, shadow=epic)
        if mode in ("build", "split"):  # constructions qui apparaissent
            for k in range(6):
                a = ease(((t + 2.0) % 6) - k * 0.35)
                if a <= 0:
                    continue
                x = 1000 + (k % 3) * 170; y = 560 + (k // 3) * -170 + 160
                if a < 0.6:
                    d.rectangle([x, y, x + 160, y + 160], outline=(120, 220, 255), width=5)
                else:
                    d.rectangle([x, y, x + 160, y + 160], fill=(190, 130, 70) if epic else (200, 150, 90), outline=(120, 80, 40), width=4)
                    for j in range(1, 4):
                        d.line([x, y + j * 40, x + 160, y + j * 40], fill=(150, 100, 55), width=3)
                    if epic:
                        d.polygon([(x + 160, y), (x + 190, y + 20), (x + 190, y + 180), (x + 160, y + 160)], fill=(0, 0, 0, 60))
            d.polygon([(1510, 720), (1700, 560), (1700, 720)], fill=(190, 130, 70) if epic else (200, 150, 90), outline=(120, 80, 40))
        if mode == "fight":
            figure(d, 1520, 700, t + 1.3, (255, 90, 120), run=False, s=1.1, shadow=epic)
            for k in range(3):
                p = ((t * 2.2) + k / 3) % 1
                x1 = 840 + p * 600
                d.line([x1, 742, x1 + 70, 742], fill=(255, 230, 90), width=6)
                if epic:
                    d.line([x1, 742, x1 + 70, 742], fill=(255, 250, 200, 120), width=14)
            if (t * 2.2) % 1 > 0.85:
                d.ellipse([1450, 690, 1550, 790], fill=(255, 240, 160, 170))
            d.text((1520, 600 - ((t * 60) % 60)), "+30", font=F(44, "Black", True), fill=(255, 255, 255))
        if mode == "run":
            for k in range(14):
                y = 250 + k * 45
                x = (1920 - (t * 1600 + k * 300) % 2300)
                d.line([x, y, x + 180, y], fill=(255, 255, 255, 90), width=3)
        if mode == "storm" or epic:
            r = 1500 - 80 * math.sin(t * 0.4)
            d.ellipse([1920 - r * 0.4, -400, 1920 + r, 1500], outline=(170, 80, 255, 150 if mode == "storm" else 70), width=60)
        if epic and mode != "storm":  # lumière d'ambiance
            glow = Image.new("RGBA", im.size, (255, 180, 120, 0))
            ImageDraw.Draw(glow).ellipse([1200, 0, 2000, 600], fill=(255, 190, 140, 50))
            im.alpha_composite(glow.filter(ImageFilter.GaussianBlur(80)))
        return im

    class FnBG:
        def __init__(self, mode, dur, k):
            self.mode = mode

        def frame(self, t):
            if self.mode == "split":
                a = draw_fn("build", t, "perf"); b = draw_fn("build", t, "epic")
                a.paste(b.crop((960, 0, 1920, 1080)), (960, 0))
                d = ImageDraw.Draw(a)
                d.rectangle([957, 0, 963, 1080], fill=(255, 255, 255))
                for x, lab, col in [(60, "MODE PERFORMANCE", GREEN), (1020, "ÉPIQUE · DIRECTX 12", PINK)]:
                    d.rounded_rectangle([x, 60, x + 470, 120], 30, fill=(10, 8, 18, 210), outline=col, width=3)
                    d.text((x + 235, 74), lab, font=F(28, "Black", True), fill=col, anchor="ma")
                return np.asarray(a.convert("RGB"))
            style = "perf" if self.mode == "perf" else "epic"
            return np.asarray(draw_fn(self.mode, t, style).convert("RGB"))

        def close(self): pass

    class OvFnTag(Ov):
        def draw(self, t):
            im, d = full()
            d.rounded_rectangle([1460, 30, 1890, 74], 22, fill=(10, 8, 18, 190))
            d.text((1675, 40), "ILLUSTRATION ORIGINALE · pas une capture", font=F(18, "Bold"), fill=(235, 235, 250), anchor="ma")
            return im

        def offset(self, t):
            return (0, 0)

    class OvTag(Ov):
        def draw(self, t):
            im, d = full()
            f = F(18, "Bold")
            tw = int(d.textlength(self.o["text"], font=f))
            d.rounded_rectangle([1890 - tw - 40, 30, 1890, 74], 22, fill=(10, 8, 18, 190))
            d.text((1890 - tw / 2 - 20, 40), self.o["text"], font=f, fill=(235, 235, 250), anchor="ma")
            return im

        def offset(self, t):
            return (0, 0)

    # ================================================================ séquence de plans
    class ShotSeq:
        def __init__(self, specs, dur, k, sent):
            self.specs = specs; self.dur = dur; self.k = k
            self.times = shot_times(len(specs), sent, dur)
            self.i = -1; self.cur = None; self.last = None; self.xf = 0

        def make(self, i):
            st = self.times[i]
            en = self.times[i + 1] if i + 1 < len(self.times) else self.dur
            return make_one(self.specs[i], en - st + 0.6, self.k + i)

        def frame(self, t):
            i = 0
            while i + 1 < len(self.times) and t >= self.times[i + 1]:
                i += 1
            if i != self.i:
                if self.cur is not None:
                    self.cur.close()
                self.xf = XFS if self.i >= 0 else 0
                self.i = i; self.cur = self.make(i)
            f = self.cur.frame(t - self.times[i]).astype(np.float32)
            if self.xf > 0 and self.last is not None:
                kk = 1 - self.xf / (XFS + 1)
                f = self.last * (1 - kk) + f * kk
                self.xf -= 1
            else:
                self.last = f
            return f.astype(np.uint8)

        def close(self):
            if self.cur is not None:
                self.cur.close()

    def make_one(spec, dur, k):
        if spec.startswith("pz:"):
            _, name, reg = spec.split(":")
            return PhotoZoomBG(name, tuple(float(v) for v in reg.split(",")), dur, k)
        if spec.startswith("fn:"):
            return FnBG(spec[3:], dur, k)
        if spec.startswith("split:"):
            n, ss = spec[6:].split("@")
            return SplitBG(n, float(ss), dur, k)
        return base_make(spec, dur, k)

    def make_bg(spec, dur, k, sent=None):
        if isinstance(spec, list):
            return ShotSeq(spec, dur, k, sent or [])
        return make_one(spec, dur, k)

    R.make_bg = make_bg
    R.OVS.update({"chapter": OvChapter, "gametitle": OvGameTitle, "title": OvTitle, "kicker": OvKicker, "chips": OvChips,
                  "chart": OvChart, "hz": OvHz, "duel": OvDuel, "sourcetable": OvSourceTable, "fn_tag": OvFnTag, "tag": OvTag})
