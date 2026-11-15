# -*- coding: utf-8 -*-
"""Overlays v2 : photos produits, schémas explicatifs, écrans, refroidissement,
évolutions, illustrations originales (Fortnite, GTA VI)."""
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from gfx import *  # noqa: F401,F403
import gfx

COMP = {
    "cpu": ("AMD Ryzen 7 9800X3D", "Processeur · socket AM5",
            ["8 cœurs / 16 threads · architecture Zen 5", "Jusqu'à 5,2 GHz", "96 Mo de cache L3 (3D V-Cache)", "Rôle : calcule le jeu, prépare les images"]),
    "gpu": ("MSI GeForce RTX 5070 Ventus 2X OC", "Carte graphique · NVIDIA Blackwell",
            ["12 Go GDDR7 · bus 192 bits", "DLSS 4 · génération d'images", "Ray tracing matériel · Reflex", "≈ 250 W · 2 ventilateurs"]),
    "ram": ("Patriot Viper Venom DDR5", "Mémoire vive · 32 Go",
            ["2 × 16 Go (dual channel)", "DDR5 · 6000 MT/s", "Profil EXPO à activer dans le BIOS", "Rôle : données du jeu en accès rapide"]),
    "mobo": ("Gigabyte B650 Gaming X AX V2", "Carte mère · ATX · AM5",
             ["Ryzen 7000 / 8000 / 9000 · DDR5", "3 emplacements M.2 · LAN 2,5 Gb", "Wi-Fi 6E + Bluetooth intégrés", "Rôle : relie tous les composants"]),
    "ssd": ("Kioxia Exceria Plus G3", "SSD NVMe M.2 · 1 To",
            ["PCIe 4.0 x4", "Jusqu'à 5 000 Mo/s en lecture*", "Démarrage et chargements rapides", "*donnée constructeur"]),
    "psu": ("be quiet! Pure Power 13 M", "Alimentation · 750 W",
            ["80 PLUS Gold · entièrement modulaire", "ATX 3.1 · connecteur 12V-2x6", "Config. actuelle : ≈ 400 W en jeu (estim.)", "Rôle : énergie stable et silencieuse"]),
    "aio": ("Arctic Liquid Freezer III Pro 360 A-RGB", "Watercooling tout-en-un",
            ["Radiateur 360 mm · 38 mm d'épaisseur", "3 ventilateurs P12 Pro A-RGB 120 mm", "Pompe PWM + ventilateur VRM intégré", "Rôle : évacuer la chaleur du CPU"]),
}


def install(R):
    Ov, full, appear = R.Ov, R.full, R.appear

    def photo(name, t, dur, h, sweep=True):
        return R.photo_shot(name, t, dur, h, sweep)

    # ---------------------------------------------------------- composant + photo
    class OvPhoto(Ov):
        static = False

        def __init__(self, *a):
            super().__init__(*a); self.panel = None

        def draw(self, t):
            im, d = full()
            i = self.o["id"]
            h = {"cpu": 700, "gpu": 640, "ram": 520, "mobo": 600, "ssd": 300, "psu": 600, "aio": 330}[i]
            sp = photo(i, t, self.D, h)
            maxw = 1000
            if sp.width > maxw + 300:
                r_ = (maxw + 300) / sp.width
                sp = sp.resize((int(sp.width * r_), int(sp.height * r_)), Image.BILINEAR)
            fl = 6 * math.sin(t * 1.2)
            im.alpha_composite(sp, (int(530 - sp.width / 2), int(500 - sp.height / 2 + fl)))
            if self.panel is None:
                self.panel = self.mk_panel()
            im.alpha_composite(self.panel, (1080, 190))
            return im

        def mk_panel(self):
            title, sub, specs = COMP[self.o["id"]]
            p = panel(760, 600)
            d = ImageDraw.Draw(p)
            d.text((44, 36), sub.upper(), font=F(22, "Bold"), fill=PINK, spacing=3)
            y = 74
            for ln in wrap(d, title, F(46, "Black", True), 680):
                d.text((44, y), ln, font=F(46, "Black", True), fill=WHITE); y += 56
            y += 24
            for s in specs:
                d.ellipse([46, y + 14, 56, y + 24], fill=RED)
                for j, l2 in enumerate(wrap(d, s, F(29, "Medium"), 640)[:2]):
                    d.text((74, y + j * 34), l2, font=F(29, "Medium"), fill=(228, 230, 238))
                y += 62
            d.text((44, 560), "Photo produit", font=F(18, "Medium"), fill=DGREY)
            return p

    # ---------------------------------------------------------- grille des 8 composants
    GRID = [("cpu", "Ryzen 7 9800X3D", 1), ("gpu", "RTX 5070 Ventus 2X OC", 1), ("ram", "Viper Venom 32 Go", 2), ("aio", "Liquid Freezer III Pro 360", 2),
            ("mobo", "B650 Gaming X AX V2", 3), ("ssd", "Exceria Plus G3 1 To", 3), ("psu", "Pure Power 13 M 750 W", 3), ("case", "FRAME 4000D RS ARGB", 4)]

    class OvGrid(Ov):
        static = False

        def draw(self, t):
            im, d = full()
            cw, ch = 400, 330
            x0, y0 = 120, 120
            for k, (pid, lab, si) in enumerate(GRID):
                st = (self.sent[si] if si < len(self.sent) else 0) + 0.35 * (k % 4 if si != 3 else k - 4)
                if si == 3:
                    st = self.sent[3] + 0.4 * (k - 4) if len(self.sent) > 3 else 0
                a = ease((t - st) / 0.6)
                if a <= 0:
                    continue
                cx = x0 + (k % 4) * (cw + 20); cy = y0 + (k // 4) * (ch + 30)
                card = panel(cw, ch, r=20, fill=(14, 10, 24, 220), accent=False)
                p = R.load_photo(pid)
                th = p.copy(); th.thumbnail((cw - 50, ch - 100), Image.LANCZOS)
                card.alpha_composite(th, ((cw - th.width) // 2, 20 + (ch - 100 - th.height) // 2))
                cd = ImageDraw.Draw(card)
                cd.text((cw // 2, ch - 56), lab, font=F(24, "Bold"), fill=WHITE, anchor="mm")
                cd.rectangle([cw // 2 - 30, ch - 30, cw // 2 + 30, ch - 26], fill=RED)
                im.alpha_composite(fade(card, a), (cx, cy + int(30 * (1 - a))))
            return im

    # ---------------------------------------------------------- comment ils travaillent ensemble
    class OvFlow(Ov):
        static = False

        def draw(self, t):
            im, d = full()
            nodes = [("ssd", "SSD", "charge les fichiers"), ("ram", "RAM", "données en accès rapide"), ("cpu", "CPU", "calcule le jeu"),
                     ("gpu", "GPU", "dessine les images"), ("mo27q3", "ÉCRAN", "affiche jusqu'à 360 i/s")]
            xs = [190, 545, 900, 1255, 1610]; y = 430
            for i, (pid, lab, sub) in enumerate(nodes):
                a = ease((t - 0.3 - i * 0.5) / 0.6)
                if a <= 0: continue
                card = panel(300, 300, r=22, fill=(14, 10, 24, 225), accent=False)
                th = R.load_photo(pid).copy(); th.thumbnail((230, 150), Image.LANCZOS)
                card.alpha_composite(th, ((300 - th.width) // 2, 30 + (150 - th.height) // 2))
                cd = ImageDraw.Draw(card)
                cd.text((150, 210), lab, font=F(40, "Black", True), fill=WHITE, anchor="mm")
                cd.text((150, 256), sub, font=F(21, "Medium"), fill=GREY, anchor="mm")
                im.alpha_composite(fade(card, a), (xs[i] - 150, y - 150))
                if i < 4:
                    a2 = ease((t - 0.6 - i * 0.5) / 0.5)
                    x1, x2 = xs[i] + 155, xs[i + 1] - 155
                    d.line([x1, y, x2, y], fill=RED + (int(200 * a2),), width=4)
                    p_ = (t * 0.9 + i * 0.25) % 1
                    px = x1 + (x2 - x1) * p_
                    d.ellipse([px - 7, y - 7, px + 7, y + 7], fill=PINK + (int(255 * a2),))
            # alimentation + refroidissement
            a = ease((t - (self.sent[2] if len(self.sent) > 2 else 5)) / 0.6)
            if a > 0:
                for pid, lab, yy, col, txt in [("psu", "ALIMENTATION", 760, (255, 200, 60), "énergie pour tous les composants"), ("aio", "WATERCOOLING", 120, BLUE, "évacue la chaleur du processeur")]:
                    th = R.load_photo(pid).copy(); th.thumbnail((170, 110), Image.LANCZOS)
                    bx = 900 - 330
                    card = panel(660, 130, r=20, fill=(14, 10, 24, 225), accent=False)
                    card.alpha_composite(th, (20, (130 - th.height) // 2))
                    cd = ImageDraw.Draw(card)
                    cd.text((210, 30), lab, font=F(28, "Black", True), fill=col)
                    cd.text((210, 74), txt, font=F(24, "Medium"), fill=(225, 228, 236))
                    im.alpha_composite(fade(card, a), (bx, yy))
                for xx in xs[:4]:
                    for yy in range(595, 760, 16):
                        d.line([xx, yy, xx, yy + 8], fill=(255, 200, 60, int(120 * a)), width=3)
                for yy in range(250, 280, 10):
                    d.line([900, yy, 900, yy + 6], fill=BLUE + (int(200 * a),), width=4)
            return im

    # ---------------------------------------------------------- limite CPU / GPU
    class OvDuo(Ov):
        static = False

        def draw(self, t):
            im, d = full()
            d.text((140, 120), "Qui fixe la limite des FPS ?", font=F(48, "Black", True), fill=WHITE)
            cases = [("Jeu compétitif · réglages bas", "ex. Fortnite mode Performance, Warzone compétitif", [("Processeur", 1.0, True), ("Carte graphique", 0.55, False)], 1),
                     ("Jeu très beau · réglages élevés", "ex. Forza Horizon 6 Extrême + ray tracing", [("Processeur", 0.45, False), ("Carte graphique", 1.0, True)], 2)]
            for i, (ttl, sub, bars, si) in enumerate(cases):
                st = self.sent[si] if si < len(self.sent) else 1 + i * 3
                a = ease((t - st) / 0.6)
                if a <= 0: continue
                x = 140 + i * 840
                im.alpha_composite(fade(panel(780, 520), a), (x, 230))
                d.text((x + 44, 266), ttl, font=F(34, "Black", True), fill=(255, 255, 255, int(255 * a)))
                d.text((x + 44, 314), sub, font=F(22, "Medium"), fill=GREY + (int(255 * a),))
                for j, (lab, v, lim) in enumerate(bars):
                    g = ease((t - st - 0.4 - j * 0.3) / 1.0)
                    y = 400 + j * 140
                    col = PINK if lim else BLUE
                    d.text((x + 44, y), lab, font=F(28, "SemiBold"), fill=(255, 255, 255, int(255 * a)))
                    d.rounded_rectangle([x + 44, y + 44, x + 700, y + 84], 10, fill=(255, 255, 255, int(16 * a)))
                    d.rounded_rectangle([x + 44, y + 44, x + 44 + int(656 * v * g), y + 84], 10, fill=col + (int(235 * a),))
                    if lim and g > 0.9:
                        d.text((x + 700, y), "LIMITE", font=F(24, "Black", True), fill=PINK, anchor="ra")
            d.text((140, 790), "Charge relative illustrative · pas une mesure", font=F(20, "Medium"), fill=DGREY)
            return im

    # ---------------------------------------------------------- écrans
    MON = {
        "mo27q3": ("Gigabyte MO27Q3", "ÉCRAN PRINCIPAL", [("Dalle", "QD-OLED"), ("Définition", "2560 × 1440 (QHD)"), ("Fréquence", "360 Hz"),
                                                          ("Réponse", "0,03 ms GtG*"), ("HDR", "DisplayHDR True Black 400*"), ("Couleurs", "10 bits*"),
                                                          ("Synchro", "G-SYNC · FreeSync Prem. Pro*"), ("Diagonale", "27\" selon Gigabyte*")]),
        "aoc": ("AOC C27G2ZU/BK", "ÉCRAN SECONDAIRE", [("Dalle", "VA incurvée 1500R"), ("Définition", "1920 × 1080 (Full HD)"), ("Fréquence", "240 Hz"),
                                                        ("Réponse", "1 ms GtG · 0,5 ms MPRT*"), ("Synchro", "FreeSync Premium*"), ("Diagonale", "27\"")]),
    }

    class OvMonitor(Ov):
        static = False

        def draw(self, t):
            im, d = full()
            i = self.o["id"]
            sp = photo(i, t, self.D, 640)
            im.alpha_composite(sp, (int(520 - sp.width / 2), int(520 - sp.height / 2)))
            name, cat, specs = MON[i]
            x0, y0 = 1060, 150
            im.alpha_composite(panel(780, 120 + 64 * len(specs) + 80), (x0, y0))
            d.text((x0 + 44, y0 + 34), cat, font=F(22, "Bold"), fill=PINK, spacing=3)
            d.text((x0 + 44, y0 + 68), name, font=F(46, "Black", True), fill=WHITE)
            for k, (a_, b_) in enumerate(specs):
                y = y0 + 150 + k * 64
                d.text((x0 + 48, y), a_, font=F(26, "Medium"), fill=GREY)
                d.text((x0 + 740, y), b_, font=F(27, "Bold"), fill=WHITE, anchor="ra")
            d.text((x0 + 44, y0 + 120 + 64 * len(specs) + 30), "* données constructeur · photo produit", font=F(19, "Medium"), fill=DGREY)
            return im

    class OvMonitors(Ov):
        def draw(self, t):
            im, d = full()
            for k, (pid, x) in enumerate([("mo27q3", 560), ("aoc", 1360)]):
                th = R.load_photo(pid).copy(); th.thumbnail((520, 300), Image.LANCZOS)
                im.alpha_composite(th, (x - th.width // 2, 80))
            rows = [("Technologie", "QD-OLED", "VA incurvée"), ("Définition", "2560 × 1440", "1920 × 1080"), ("Fréquence", "360 Hz", "240 Hz"),
                    ("Noirs / contraste", "Parfaits (pixels éteints)", "Bons pour du VA"), ("Usage idéal", "Jeu principal", "Discord · vidéo · guides")]
            x0, y0 = 160, 420
            im.alpha_composite(panel(1600, 110 + len(rows) * 82), (x0, y0))
            d.text((x0 + 680, y0 + 30), "GIGABYTE MO27Q3", font=F(28, "Black", True), fill=PINK, anchor="ma")
            d.text((x0 + 1200, y0 + 30), "AOC C27G2ZU/BK", font=F(28, "Black", True), fill=BLUE, anchor="ma")
            for k, (a_, b_, c_) in enumerate(rows):
                y = y0 + 100 + k * 82
                d.line([x0 + 40, y - 14, x0 + 1560, y - 14], fill=(255, 255, 255, 22))
                d.text((x0 + 48, y), a_, font=F(28, "SemiBold"), fill=GREY)
                d.text((x0 + 680, y), b_, font=F(28, "Bold"), fill=WHITE, anchor="ma")
                d.text((x0 + 1200, y), c_, font=F(28, "Medium"), fill=(225, 228, 236), anchor="ma")
            return im

    # ---------------------------------------------------------- notions de benchmark
    class OvConcepts(Ov):
        static = False

        def draw(self, t):
            im, d = full()
            cards = [("1080p vs 1440p", "+78 % de pixels à calculer", "Image plus fine, FPS plus bas dans les jeux exigeants"),
                     ("Performance vs Qualité", "Lisibilité & FPS  ↔  Beauté", "Fortnite / Warzone d'un côté, Forza Horizon 6 de l'autre"),
                     ("Moyenne vs 1 % low", "La régularité compte", "Plus les 1 % bas sont proches de la moyenne, plus c'est fluide"),
                     ("Limite CPU vs GPU", "Qui freine ?", "Baisser les graphismes ne change rien ? → limite processeur")]
            for i, (ttl, big, sub) in enumerate(cards):
                st = self.sent[i] if i < len(self.sent) else i * 4
                a = ease((t - st) / 0.6)
                if a <= 0: continue
                x = 120 + (i % 2) * 850; y = 110 + (i // 2) * 400
                act = (i == max([j for j in range(len(self.sent)) if self.sent[j] <= t] or [0]))
                p = panel(800, 360, fill=(16, 10, 28, 235 if act else 170))
                pd = ImageDraw.Draw(p)
                pd.text((44, 36), ttl.upper(), font=F(24, "Bold"), fill=PINK if act else GREY, spacing=3)
                pd.text((44, 82), big, font=F(40, "Black", True), fill=WHITE)
                for j, l2 in enumerate(wrap(pd, sub, F(26, "Medium"), 700)[:2]):
                    pd.text((44, 150 + j * 34), l2, font=F(26, "Medium"), fill=(220, 222, 232))
                if i == 2:  # mini graphe frametimes
                    for k in range(60):
                        v = 30 + 10 * math.sin(k * 0.7) + (45 if k in (17, 41) else 0)
                        pd.rectangle([44 + k * 11, 330 - v, 52 + k * 11, 330], fill=(BLUE if v < 70 else PINK) + (220,))
                if i == 0:
                    pd.rectangle([44, 250, 44 + 260, 250 + 70], outline=GREY, width=3); pd.text((174, 285), "1080p", font=F(24, "Bold"), fill=GREY, anchor="mm")
                    pd.rectangle([340, 236, 340 + 347, 236 + 98], outline=RED, width=3); pd.text((513, 285), "1440p", font=F(24, "Bold"), fill=RED, anchor="mm")
                im.alpha_composite(fade(p, a), (x, y))
            return im

    class OvSourceTable(Ov):
        def draw(self, t):
            im, d = full()
            hdr = ["Mesure", "Déf.", "Réglages", "DLSS", "Processeur", "Carte", "Résultat", "Source"]
            xs = [150, 520, 640, 950, 1080, 1340, 1500, 1660]
            rows = [("Forza Horizon 6", "1440p", "Extrême · sans RT", "Non", "non précisé", "RTX 5070", "112 FPS", "TechSpot"),
                    ("Forza Horizon 6", "1440p", "Extrême · RT", "Non", "non précisé", "RTX 5070", "56 FPS", "TechSpot"),
                    ("Forza Horizon 6", "1440p", "protocole maison", "n. p.", "non précisé", "RTX 5070", "118 FPS", "ComputerBase"),
                    ("Cyberpunk 2077", "1440p", "Ultra · sans RT", "Non", "non précisé", "RTX 5070", "102,6 FPS", "CGMagazine"),
                    ("Counter-Strike 2", "1080p", "test CPU", "Non", "9800X3D / 7800X3D", "RTX 4090", "668 / 591", "TechSpot"),
                    ("Moyenne 25 jeux", "1440p", "raster, sans RT", "Non", "Ryzen 7 9800X3D", "RTX 5070", "+22 % / 4070", "TechPowerUp")]
            im.alpha_composite(panel(1720, 150 + len(rows) * 84 + 60, fill=(10, 8, 18, 235)), (100, 110))
            d.text((150, 140), "Mesures réelles utilisées (badge vert)", font=F(38, "Black", True), fill=WHITE)
            for k, h_ in enumerate(hdr):
                d.text((xs[k], 216), h_.upper(), font=F(18, "Bold"), fill=PINK, spacing=2)
            for i, r_ in enumerate(rows):
                y = 260 + i * 84
                d.line([140, y - 16, 1780, y - 16], fill=(255, 255, 255, 22))
                d.ellipse([124, y + 8, 138, y + 22], fill=GREEN)
                for k, v in enumerate(r_):
                    f = F(23, "Bold" if k in (0, 6) else "Medium")
                    col = GREEN if k == 7 else (WHITE if k in (0, 6) else (215, 218, 228))
                    d.text((xs[k], y), v, font=f, fill=col)
            yb = 260 + len(rows) * 84
            d.text((150, yb), "Toutes les autres valeurs (Fortnite, Call of Duty, DLSS, fourchettes) sont des ESTIMATIONS · badge orange · « n. p. » = non précisé par la source consultée",
                   font=F(21, "Medium"), fill=ORANGE)
            return im

    # ---------------------------------------------------------- refroidissement
    class OvLoop(Ov):
        static = False

        def draw(self, t):
            im, d = full()
            sp = photo("aio", t, self.D, 260, sweep=False)
            im.alpha_composite(sp, (int(960 - sp.width / 2), 60))
            cpu = (520, 700); rad = (1400, 700)
            d.rounded_rectangle([cpu[0] - 150, cpu[1] - 110, cpu[0] + 150, cpu[1] + 110], 24, fill=(30, 20, 46, 230), outline=RED, width=3)
            d.text(cpu, "POMPE + CPU", font=F(30, "Black", True), fill=WHITE, anchor="mm")
            d.text((cpu[0], cpu[1] + 50), "absorbe la chaleur", font=F(22, "Medium"), fill=GREY, anchor="mm")
            d.rounded_rectangle([rad[0] - 230, rad[1] - 130, rad[0] + 230, rad[1] + 130], 18, fill=(18, 18, 30, 230), outline=BLUE, width=3)
            for x in range(rad[0] - 210, rad[0] + 210, 12):
                d.line([x, rad[1] - 110, x, rad[1] + 60], fill=(70, 80, 110), width=2)
            d.text((rad[0], rad[1] + 92), "RADIATEUR 360 mm · ailettes", font=F(24, "Bold"), fill=WHITE, anchor="mm")
            # tubes : chaud en haut, froid en bas
            hot = [(cpu[0] + 150, cpu[1] - 60), (rad[0] - 230, rad[1] - 60)]
            cold = [(rad[0] - 230, rad[1] + 40), (cpu[0] + 150, cpu[1] + 40)]
            d.line(hot, fill=PINK, width=14); d.line(cold, fill=BLUE, width=14)
            for k in range(6):
                p = ((t * 0.35) + k / 6) % 1
                x = hot[0][0] + (hot[1][0] - hot[0][0]) * p
                d.ellipse([x - 8, hot[0][1] - 8, x + 8, hot[0][1] + 8], fill=(255, 220, 240))
                x2 = cold[0][0] + (cold[1][0] - cold[0][0]) * p
                d.ellipse([x2 - 8, cold[0][1] - 8, x2 + 8, cold[0][1] + 8], fill=(200, 230, 255))
            d.text(((hot[0][0] + hot[1][0]) // 2, hot[0][1] - 44), "liquide chaud", font=F(24, "Bold"), fill=PINK, anchor="mm")
            d.text(((cold[0][0] + cold[1][0]) // 2, cold[0][1] + 34), "liquide refroidi", font=F(24, "Bold"), fill=BLUE, anchor="mm")
            # air expulsé
            a = ease((t - (self.sent[1] if len(self.sent) > 1 else 3)) / 0.6)
            for k in range(3):
                x = rad[0] - 150 + k * 150
                for j in range(3):
                    yy = rad[1] - 150 - j * 40 - ((t * 60) % 40)
                    d.line([x, yy, x, yy - 24], fill=(200, 200, 220, int(160 * a)), width=4)
            d.text((rad[0], rad[1] - 300 + 40), "3 ventilateurs → air chaud évacué", font=F(24, "SemiBold"), fill=(230, 232, 240, int(255 * a)), anchor="mm")
            return im

    class OvTemps(Ov):
        static = False

        def draw(self, t):
            im, d = full()
            x0, y0, w, h = 200, 220, 1500, 520
            im.alpha_composite(panel(w + 120, h + 220), (x0 - 60, y0 - 110))
            d.text((x0, y0 - 80), "Température du processeur pendant une longue session", font=F(36, "Black", True), fill=WHITE)
            d.line([x0, y0 + h, x0 + w, y0 + h], fill=GREY, width=2); d.line([x0, y0, x0, y0 + h], fill=GREY, width=2)
            d.text((x0 + w, y0 + h + 14), "temps de jeu →", font=F(22, "Medium"), fill=GREY, anchor="ra")
            g = ease(t / 6)
            pts = []
            for k in range(int(200 * g)):
                u = k / 200
                v = 1 - math.exp(-u * 7)
                pts.append((x0 + u * w, y0 + h - (0.15 + 0.55 * v) * h))
            if len(pts) > 1:
                d.line(pts, fill=BLUE, width=6)
            d.line([x0, y0 + h * 0.3 - 1, x0 + w, y0 + h * 0.3], fill=(255, 255, 255, 30), width=2)
            d.text((x0 + w - 10, y0 + h * 0.3 - 36), "palier stable", font=F(24, "Bold"), fill=BLUE, anchor="ra")
            d.text((x0 + 20, y0 + h + 60), "Illustration du principe · courbe non mesurée", font=F(20, "Medium"), fill=DGREY)
            return im

    class OvAirflow(Ov):
        static = False

        def draw(self, t):
            im, d = full()
            # boîtier dessiné par PhotoBG centré en (560, 540), hauteur ≈ 860 → façade à droite
            for k in range(3):  # entrée façade
                y = 330 + k * 200
                for j in range(4):
                    x = 980 - ((t * 120 + j * 60) % 240)
                    d.polygon([(x, y - 14), (x - 40, y), (x, y + 14)], fill=BLUE + (200,))
            for j in range(4):  # sortie haut
                yy = 120 - ((t * 90 + j * 40) % 160)
                for x in (360, 470, 580):
                    d.polygon([(x - 14, yy + 40), (x, yy), (x + 14, yy + 40)], fill=PINK + (190,))
            for j in range(3):  # sortie arrière
                x = 150 - ((t * 90 + j * 50) % 150)
                d.polygon([(x + 40, 340), (x, 354), (x + 40, 368)], fill=PINK + (190,))
            x0, y0 = 1080, 200
            im.alpha_composite(panel(760, 560), (x0, y0))
            d.text((x0 + 44, y0 + 34), "CORSAIR FRAME 4000D RS ARGB", font=F(24, "Bold"), fill=PINK, spacing=2)
            d.text((x0 + 44, y0 + 70), "Flux d'air & espace", font=F(44, "Black", True), fill=WHITE)
            items = [(BLUE, "Entrée : 3 ventilateurs RS120 ARGB en façade"), (PINK, "Sortie : haut (radiateur) et arrière"),
                     (WHITE, "Radiateurs jusqu'à 360 mm"), (WHITE, "GPU jusqu'à 405 mm (430 sans ventilos avant)"), (WHITE, "Ventirad jusqu'à 170 mm · modulaire")]
            for k, (c, s) in enumerate(items):
                y = y0 + 170 + k * 72
                d.ellipse([x0 + 46, y + 12, x0 + 58, y + 24], fill=c)
                d.text((x0 + 76, y), s, font=F(27, "Medium"), fill=(228, 230, 238))
            d.text((x0 + 44, y0 + 520), "Données constructeur Corsair · flux schématisé", font=F(18, "Medium"), fill=DGREY)
            return im

    class OvRGB(Ov):
        static = False

        def draw(self, t):
            im, d = full()
            themes = [("Noir & violet", [(130, 60, 255)]), ("Bleu glacier", [(40, 170, 255)]), ("Rose néon", [(255, 50, 170)]), ("Arc-en-ciel", None)]
            k = int(t / 2.6) % 4
            name, cols = themes[k]
            ph = t * 0.3
            L = Image.new("RGBA", (W, H))
            ld = ImageDraw.Draw(L)
            for j in range(3):
                c = hue(ph + j / 3) if cols is None else cols[0]
                cy_ = 368 + j * 146
                ld.ellipse([664 - 88, cy_ - 88, 664 + 88, cy_ + 88], outline=c + (190,), width=24)
            L = L.filter(ImageFilter.GaussianBlur(26))
            im.alpha_composite(L)
            x0, y0 = 1120, 300
            im.alpha_composite(panel(700, 420), (x0, y0))
            d.text((x0 + 44, y0 + 34), "AMBIANCES RGB", font=F(24, "Bold"), fill=PINK, spacing=3)
            for j, (n_, c_) in enumerate(themes):
                y = y0 + 100 + j * 72
                col = hue(ph) if c_ is None else c_[0]
                d.rounded_rectangle([x0 + 44, y + 4, x0 + 94, y + 40], 8, fill=col)
                d.text((x0 + 116, y + 2), n_, font=F(32, "Bold" if j == k else "Medium"), fill=WHITE if j == k else GREY)
            d.text((x0 + 44, y0 + 390), "Halo lumineux illustratif", font=F(18, "Medium"), fill=DGREY)
            return im

    # ---------------------------------------------------------- évolutions
    class OvUpgrade(Ov):
        static = False

        def draw(self, t):
            im, d = full()
            d.text((120, 70), "Évolutions possibles (non installées)", font=F(46, "Black", True), fill=WHITE)
            cols = [("RTX 5070", "actuelle", 100, "100 %", None, "12 Go", "250 W", "650 W", "✓ OK", GREEN),
                    ("RTX 5070 Ti", "option 1", 122, "≈ +20 à 25 %", "e", "16 Go", "300 W", "750 W", "✓ ta 750 W suffit", GREEN),
                    ("RTX 5080", "option 2", 140, "≈ +35 à 45 %", "e", "16 Go", "360 W", "850 W", "→ passer à 850 W", ORANGE)]
            labels = ["Performances 1440p", "Mémoire vidéo", "Consommation (TGP)", "Alim. recommandée NVIDIA", "Ton alimentation 750 W"]
            x0 = 120
            for i, lab in enumerate(labels):
                d.text((x0, 360 + i * 110), lab, font=F(27, "SemiBold"), fill=GREY)
            starts = [0, self.sent[1] if len(self.sent) > 1 else 3, self.sent[3] if len(self.sent) > 3 else 8]
            for j, (n_, tag, perf, ptxt, kind, vram, tgp, psu, ok, okc) in enumerate(cols):
                a = ease((t - starts[j] - 0.2) / 0.6)
                if a <= 0: continue
                x = 600 + j * 420
                im.alpha_composite(fade(panel(390, 860 - 150, accent=(j == 0)), a), (x, 170))
                A = int(255 * a)
                d.text((x + 30, 196), n_, font=F(40, "Black", True), fill=(255, 255, 255, A))
                d.text((x + 30, 250), tag.upper(), font=F(20, "Bold"), fill=(PINK if j else GREEN) + (A,), spacing=3)
                g = ease((t - starts[j] - 0.5) / 1.0)
                d.rounded_rectangle([x + 30, 360, x + 30 + int(320 * perf / 140 * g), 396], 8, fill=(BLUE if j == 0 else RED) + (A,))
                d.text((x + 30, 402), ptxt, font=F(24, "Bold"), fill=(255, 255, 255, A))
                if kind == "e":
                    im.alpha_composite(fade(badge("e"), a), (x + 230, 404))
                for i, v in enumerate([vram, tgp, psu, ok]):
                    d.text((x + 30, 470 + i * 110), v, font=F(30, "Bold"), fill=(okc if i == 3 else WHITE) + (A,))
            d.text((120, 930 - 40), "Sources : NVIDIA (TGP, alimentations recommandées) · écarts de performance : ordre de grandeur des tests publiés",
                   font=F(20, "Medium"), fill=DGREY)
            return im

    class OvFit(Ov):
        static = False

        def draw(self, t):
            im, d = full()
            d.text((140, 120), "Longueur de carte graphique : est-ce que ça rentre ?", font=F(44, "Black", True), fill=WHITE)
            x0, x1 = 300, 1700
            sx = lambda mm: x0 + (x1 - x0) * mm / 450
            bars = [("RTX 5070 Ventus 2X OC (actuelle)", 0, 236, BLUE, "≈ 236 mm*"), ("RTX 5070 Ti / 5080 courantes", 300, 340, RED, "≈ 300 à 340 mm")]
            for i, (lab, a_, b_, col, txt) in enumerate(bars):
                g = ease((t - 0.4 - i * 0.6) / 1.0)
                y = 330 + i * 150
                d.text((x0, y - 46), lab, font=F(28, "SemiBold"), fill=WHITE)
                if a_:
                    d.rounded_rectangle([sx(0), y, sx(a_), y + 50], 10, fill=col + (60,))
                d.rounded_rectangle([sx(0), y, sx(0) + (sx(b_) - sx(0)) * g, y + 50], 10, fill=col + (220,))
                d.text((sx(b_) + 16, y + 8), txt, font=F(28, "Bold"), fill=WHITE)
            for mm, lab, col in [(405, "405 mm : limite avec ventilateurs avant", PINK), (430, "430 mm sans ventilateurs avant", GREY)]:
                for yy in range(260, 640, 16):
                    d.line([sx(mm), yy, sx(mm), yy + 8], fill=col, width=4)
            d.text((sx(405) - 10, 650), "limite boîtier : 405 mm", font=F(26, "Bold"), fill=PINK, anchor="ra")
            for mm in range(0, 451, 50):
                d.line([sx(mm), 600, sx(mm), 615], fill=GREY, width=2)
                d.text((sx(mm), 620), f"{mm}", font=F(18, "Medium"), fill=GREY, anchor="ma")
            d.text((300, 740), "✓ Une RTX 5070 Ti ou 5080 de taille standard rentre dans le FRAME 4000D — vérifier la longueur exacte du modèle choisi",
                   font=F(26, "SemiBold"), fill=GREEN)
            d.text((300, 790), "* longueur relevée sur une base de données tierce · limites : données Corsair", font=F(19, "Medium"), fill=DGREY)
            return im

    # ---------------------------------------------------------- illustrations originales
    class OvFnArt(Ov):
        static = False

        def draw(self, t):
            im, d = full()
            # île stylisée + tempête qui se referme (illustration originale)
            cx, cy = 560, 600
            d.ellipse([cx - 380, cy - 120, cx + 380, cy + 160], fill=(40, 170, 110, 230))
            d.ellipse([cx - 300, cy - 150, cx + 260, cy + 90], fill=(70, 200, 120, 240))
            for k, (x, y, s) in enumerate([(-180, -60, 50), (-60, -100, 70), (90, -70, 55), (200, 0, 40)]):
                d.polygon([(cx + x - s, cy + y), (cx + x, cy + y - s * 1.6), (cx + x + s, cy + y)], fill=(30, 120, 80, 255))
            for k in range(4):  # constructions stylisées
                bx = cx - 40 + k * 46
                d.rectangle([bx, cy - 40 - k * 30, bx + 40, cy - k * 30], outline=(120, 220, 255), width=4)
            r_ = 520 - 120 * ((t * 0.08) % 1)
            d.ellipse([cx - r_, cy - r_ * 0.55, cx + r_, cy + r_ * 0.55], outline=(190, 90, 255, 200), width=10)
            d.text((cx, cy + 230), "Illustration originale · pas une capture du jeu", font=F(20, "Medium"), fill=(220, 220, 240), anchor="mm")
            x0, y0 = 1080, 240
            im.alpha_composite(panel(760, 480, fill=(10, 14, 40, 215)), (x0, y0))
            d.text((x0 + 44, y0 + 34), "MODE PERFORMANCE", font=F(24, "Bold"), fill=PINK, spacing=3)
            items = ["Rendu simplifié, effets réduits", "Carte graphique très soulagée", "Le processeur fixe les FPS", "Objectif : approcher 360 images/s"]
            for k, s in enumerate(items):
                a = ease((t - 0.6 - k * 0.5) / 0.5)
                y = y0 + 110 + k * 82
                d.polygon([(x0 + 50, y + 8), (x0 + 66, y + 19), (x0 + 50, y + 30)], fill=RED + (int(255 * a),))
                d.text((x0 + 84, y), s, font=F(31, "SemiBold"), fill=(255, 255, 255, int(255 * a)))
            return im

    class OvFnTag(Ov):
        def draw(self, t):
            im, d = full()
            d.text((96, 900 - 60), "Fond : illustration originale (pas une capture de Fortnite)", font=F(20, "Medium"), fill=(210, 210, 235))
            return im

    class OvGTAWorld(Ov):
        static = False

        def draw(self, t):
            im, d = full()
            # coucher de soleil néon, palmiers, skyline : illustration originale
            sun = (520, 470)
            for k in range(30, 0, -1):
                c = (255, int(80 + 4 * k), int(150 - 2 * k))
                d.ellipse([sun[0] - 8 * k, sun[1] - 8 * k, sun[0] + 8 * k, sun[1] + 8 * k], fill=c + (int(40 + 6 * (30 - k)),))
            for k, (x, hgt) in enumerate([(120, 260), (190, 330), (260, 200), (700, 300), (780, 380), (860, 240), (930, 300)]):
                d.rectangle([x, 640 - hgt, x + 60, 640], fill=(25, 10, 45, 255))
                for wy in range(640 - hgt + 14, 630, 26):
                    if (wy + k * 13) % 3:
                        d.rectangle([x + 12, wy, x + 22, wy + 10], fill=(255, 120, 200, 160)); d.rectangle([x + 36, wy, x + 46, wy + 10], fill=(120, 200, 255, 140))
            for px in (60, 1000):
                d.line([px, 640, px + 20, 380], fill=(20, 8, 35), width=14)
                for a_ in range(6):
                    ang = math.radians(200 + a_ * 28 + 3 * math.sin(t + a_))
                    d.line([px + 20, 380, px + 20 + 120 * math.cos(ang), 380 + 60 * math.sin(ang) + 40], fill=(20, 8, 35), width=10)
            for k in range(10):
                y = 660 + k * 22
                d.line([300 - k * 10, y, 740 + k * 10, y], fill=(255, 90, 170, max(20, 140 - k * 12)), width=4)
            d.text((520, 790), "Illustration originale · pas une image officielle", font=F(20, "Medium"), fill=(230, 210, 240), anchor="mm")
            x0, y0 = 1100, 170
            im.alpha_composite(panel(740, 640, fill=(16, 6, 26, 220)), (x0, y0))
            s = text_sprite("GTA VI", F(84, "Black", True), WHITE, glow_col=(255, 60, 170), pad=30)
            im.alpha_composite(s, (x0 + 14, y0 + 6))
            rows = [("Univers", "État de Leonida (inspiré de la Floride)"), ("Ville", "Vice City · marais · plages · îles"), ("Héros", "Jason & Lucia"),
                    ("Ambition", "Ville dense, foules, reflets, éclairages")]
            for k, (a_, b_) in enumerate(rows):
                al = ease((t - (self.sent[min(k + 1, len(self.sent) - 1)] if self.sent else k)) / 0.6)
                y = y0 + 170 + k * 108
                d.text((x0 + 44, y), a_.upper(), font=F(20, "Bold"), fill=PINK + (int(255 * al),), spacing=3)
                for j, l2 in enumerate(wrap(d, b_, F(30, "SemiBold"), 650)[:2]):
                    d.text((x0 + 44, y + 30 + j * 36), l2, font=F(30, "SemiBold"), fill=(255, 255, 255, int(255 * al)))
            d.text((x0 + 44, y0 + 600), "Source : Rockstar Games (bandes-annonces officielles)", font=F(18, "Medium"), fill=(170, 150, 190))
            return im

    R.OVS.update({"photo": OvPhoto, "grid": OvGrid, "flow": OvFlow, "duo": OvDuo, "monitor": OvMonitor, "monitors": OvMonitors,
                  "concepts": OvConcepts, "sourcetable": OvSourceTable, "loop": OvLoop, "temps": OvTemps, "airflow": OvAirflow,
                  "rgb": OvRGB, "upgrade": OvUpgrade, "fit": OvFit, "fn_art": OvFnArt, "fn_tag": OvFnTag, "gta_world": OvGTAWorld})
