# -*- coding: utf-8 -*-
"""v7 : comparatif DLSS (natif / Super Résolution / Frame Generation / Multi Frame Generation),
FPS calculés vs affichés (Forza Horizon 6), stockage SSD, températures et consommation clarifiées,
flux d'air corrigé (3 ventilateurs fournis en façade, aucun ventilateur inventé), transitions de chapitre."""
import math
from PIL import Image, ImageDraw, ImageFilter
from gfx import *  # noqa: F401,F403

CALC = (125, 210, 255)   # image calculée (bleu glacier)
GEN = VIOLET             # image générée (lavande)


def install(R):
    Ov, full = R.Ov, R.full

    def head(d, title, sub=None, y=70):
        d.text((110, y), title, font=F(46, "Black", True), fill=WHITE)
        if sub:
            d.text((112, y + 64), sub, font=F(24, "Medium"), fill=GREY)

    def foot(d, txt, y=900):
        d.text((110, y), txt, font=F(19, "Medium"), fill=(165, 170, 190))

    def st_at(sent, i, default):
        return sent[i] - 0.1 if i < len(sent) else default

    def frame_box(d, x, y, w, h, kind, a=1.0):
        A = int(255 * a)
        if kind == "c":
            d.rounded_rectangle([x, y, x + w, y + h], 6, fill=CALC + (int(230 * a),))
        else:
            d.rounded_rectangle([x, y, x + w, y + h], 6, fill=GEN + (int(120 * a),), outline=GEN + (A,), width=2)
            for hx in range(int(x) - h, int(x + w), 10):
                x1, y1, x2, y2 = hx, y + h, hx + h, y
                if x1 < x:
                    y1 -= (x - x1); x1 = x
                if x2 > x + w:
                    y2 += (x2 - (x + w)); x2 = x + w
                if x2 > x1:
                    d.line([x1, y1, x2, y2], fill=(255, 255, 255, int(90 * a)), width=2)

    # ============================================================ DLSS : 4 modes
    class OvDLSS4(Ov):
        static = False
        MODES = [
            ("NATIF", "Sans DLSS", "2560 × 1440", 1.0, "c", 60, 60,
             ["+ image de référence", "− le mode le plus exigeant"]),
            ("DLSS SUPER RÉSOLUTION", "Mode Qualité", "≈ 1707 × 960 → IA → 1440p", 0.444, "c", 85, 85,
             ["+ vrais FPS en plus, latence réduite", "− détails reconstruits par l'IA"]),
            ("FRAME GENERATION ×2", "DLSS 3 / 4 · RTX 40 et 50", "1 image IA entre 2 calculées", 0.444, "cg", 150, 75,
             ["+ fluidité affichée ≈ doublée", "− latence en hausse, artefacts possibles"]),
            ("MULTI FRAME GEN. ×4", "DLSS 4 · RTX 50 uniquement", "jusqu'à 3 images IA par image calculée", 0.444, "cggg", 270, 68,
             ["+ idéal pour remplir un écran 360 Hz", "− base ≥ 60 FPS conseillée"]),
        ]

        def draw(self, t):
            im, d = full()
            head(d, "DLSS 4 : ce que tu vois, et ce que la carte calcule",
                 "Exemple illustratif, pas un benchmark · base : un jeu à 60 FPS en 1440p natif sur RTX 5070")
            cw, gap, x00, y0 = 420, 22, 74, 200
            for i, (name, sub, res, frac, pat, shown, calc, pc) in enumerate(self.MODES):
                st = st_at(self.sent, i + 1, 1.0 + i * 2.5) if i else 0.6
                a = ease((t - st) / 0.7)
                if a <= 0:
                    continue
                A = int(255 * a)
                x = x00 + i * (cw + gap)
                y = y0 + int(26 * (1 - a))
                col = CALC if pat == "c" else GEN
                im.alpha_composite(fade(panel(cw, 670, fill=(12, 9, 24, 228)), a), (x, y))
                d.rectangle([x + 18, y + 18, x + 24, y + 70], fill=col + (A,))
                d.text((x + 40, y + 16), name, font=F(23, "Black", True), fill=(255, 255, 255, A))
                d.text((x + 40, y + 48), sub, font=F(19, "Medium"), fill=GREY + (A,))
                # pixels réellement calculés
                gx, gy, gw, gh = x + 30, y + 96, cw - 60, 150
                d.rectangle([gx, gy, gx + gw, gy + gh], outline=(255, 255, 255, int(60 * a)), width=2)
                s = math.sqrt(frac)
                g = ease((t - st - 0.3) / 0.8)
                iw, ih = gw * s * (0.4 + 0.6 * g), gh * s * (0.4 + 0.6 * g)
                d.rectangle([gx, gy, gx + iw, gy + ih], fill=CALC + (int(150 * a),))
                for k in range(1, 8):
                    d.line([gx + iw * k / 8, gy, gx + iw * k / 8, gy + ih], fill=(10, 10, 20, int(90 * a)))
                    d.line([gx, gy + ih * k / 8, gx + iw, gy + ih * k / 8], fill=(10, 10, 20, int(90 * a)))
                if frac < 1:
                    d.text((gx + gw - 10, gy + gh - 10), "reconstruit en 1440p", font=F(18, "SemiBold"), fill=(230, 232, 245, A), anchor="rd")
                d.text((gx, gy + gh + 10), f"{res}", font=F(19, "SemiBold"), fill=(220, 224, 240, A))
                d.text((gx, gy + gh + 36), f"{round(frac * 100)} % des pixels calculés", font=F(19, "Medium"), fill=GREY + (A,))
                # bande d'images défilantes
                by = y + 330
                n = 10
                fw = (cw - 60 - (n - 1) * 6) / n
                off = (t * (1.6 + 0.9 * i)) % 1
                for k in range(n + 1):
                    idx = k + int(t * (1.6 + 0.9 * i))
                    kind = pat[idx % len(pat)]
                    fx = gx + (k - off) * (fw + 6)
                    if fx < gx - 1 or fx + fw > gx + gw + 1:
                        continue
                    frame_box(d, fx, by, fw, 46, kind, a)
                d.text((gx, by + 56), "■ calculée", font=F(17, "Bold"), fill=CALC + (A,))
                if "g" in pat:
                    d.text((gx + 130, by + 56), "■ générée par l'IA", font=F(17, "Bold"), fill=GEN + (A,))
                # chiffres
                d.text((gx, by + 100), "AFFICHÉS", font=F(18, "Bold"), fill=GREY + (A,), spacing=2)
                d.text((gx, by + 124), f"{'≈ ' if i else ''}{shown} FPS", font=F(38, "Black", True), fill=((GEN if 'g' in pat else WHITE) + (A,)))
                d.text((gx + 232, by + 100), "CALCULÉS", font=F(18, "Bold"), fill=GREY + (A,), spacing=2)
                d.text((gx + 232, by + 124), f"{'≈ ' if i else ''}{calc}", font=F(38, "Black", True), fill=CALC + (A,))
                d.text((gx, by + 180), "réactivité ≈ " + ("référence" if i == 0 else f"celle de {calc} FPS"), font=F(19, "SemiBold"), fill=(225, 228, 240, A))
                for k, line in enumerate(pc):
                    c = GREEN if line.startswith("+") else (255, 150, 120)
                    d.text((gx, by + 222 + k * 32), line, font=F(20, "SemiBold"), fill=c + (A,))
            foot(d, "Chiffres d'exemple arrondis · le gain réel dépend du jeu · la génération d'images ajoute Nvidia Reflex pour limiter la latence · source du principe : NVIDIA (DLSS 4)", y=896)
            return im

    # ============================================================ FH6 : FPS calculés vs affichés
    class OvFH6FPS(Ov):
        static = False

        def draw(self, t):
            im, d = full()
            im.alpha_composite(panel(1760, 800, fill=(10, 8, 18, 232)), (80, 60))
            d.text((130, 92), "FPS calculés ou FPS affichés ?", font=F(48, "Black", True), fill=WHITE)
            d.text((132, 156), "Forza Horizon 6 · RTX 5070 · 1440p · préréglage Extrême + ray tracing", font=F(25, "Medium"), fill=GREY)
            steps = [("Natif", 56, 0, "m", "MESURÉ · TechSpot", "toutes les images sont calculées"),
                     ("+ DLSS Qualité", 80, 0, "e", "ESTIMATION", "≈ 44 % des pixels calculés, puis reconstruits"),
                     ("+ Frame Generation ×2", 75, 75, "fg", "IMAGES GÉNÉRÉES", "≈ 75 calculées + ≈ 75 générées par l'IA")]
            bx, bw, mx = 560, 1080, 170
            sx = lambda v: bw * v / mx
            for i, (lab, c, g_, kind, bl, note) in enumerate(steps):
                st = st_at(self.sent, i, 0.6 + i * 2.5)
                a = ease((t - st) / 0.6)
                if a <= 0:
                    continue
                A = int(255 * a)
                y = 250 + i * 170
                d.text((130, y + 4), lab, font=F(36, "Black", True), fill=(255, 255, 255, A))
                d.text((130, y + 54), note, font=F(21, "Medium"), fill=(190, 194, 210, A))
                p = ease((t - st - 0.2) / 1.0)
                col = {"m": GREEN, "e": ORANGE, "fg": CALC}[kind]
                d.rounded_rectangle([bx, y, bx + bw, y + 64], 10, fill=(255, 255, 255, 14))
                xc = bx + sx(c) * p
                d.rounded_rectangle([bx, y, max(bx + 10, xc), y + 64], 10, fill=col + (235,))
                if g_:
                    pg = ease((t - st - 1.0) / 1.0)
                    if pg > 0:
                        frame_box(d, xc + 4, y, sx(g_) * pg, 64, "g", a)
                tot = c + g_
                num = ("≈ " if kind != "m" else "") + f"{tot}"
                d.text((bx + sx(c) * p + (sx(g_) * ease((t - st - 1.0) / 1.0) if g_ else 0) + 22, y + 4), num, font=F(48, "Black", True), fill=(255, 255, 255, A))
                bcol = {"m": GREEN, "e": ORANGE, "fg": VIOLET}[kind]
                f = F(19, "Bold"); tw = int(d.textlength(bl, font=f))
                d.rounded_rectangle([bx, y + 76, bx + tw + 36, y + 110], 17, outline=bcol + (A,), width=2, fill=bcol + (int(40 * a),))
                d.text((bx + 18, y + 83), bl, font=f, fill=bcol + (A,))
            a = ease((t - st_at(self.sent, 3, 9)) / 0.6)
            if a > 0:
                s = text_sprite("Affiché : ≈ 150 FPS  ·  ressenti à la souris : ≈ 75 FPS", F(40, "Black", True), WHITE, glow_col=RED, pad=26)
                im.alpha_composite(fade(s, a), (110, 740))
            d.text((130, 880), "Sources : TechSpot, « Forza Horizon 6 Benchmark: 47 GPUs Tested » (16 mai 2026) · DLSS et génération d'images : estimations",
                   font=F(19, "Medium"), fill=(165, 170, 190))
            return im

    # ============================================================ SSD : vitesse et place
    class OvStorage(Ov):
        static = False

        def draw(self, t):
            im, d = full()
            head(d, "Kioxia Exceria Plus G3 · 1 To", "SSD NVMe M.2 · PCIe 4.0 x4 · mémoire TLC · sans cache DRAM")
            # vitesses
            x0, y0 = 110, 230
            im.alpha_composite(panel(820, 620, fill=(12, 9, 24, 225)), (x0, y0))
            d.text((x0 + 40, y0 + 30), "VITESSE SÉQUENTIELLE", font=F(22, "Bold"), fill=PINK, spacing=3)
            rows = [("Kioxia G3 · lecture", 5000, CALC, "5 000 Mo/s*"), ("Kioxia G3 · écriture", 3900, BLUE, "3 900 Mo/s*"),
                    ("SSD SATA (typique)", 550, GREY, "≈ 550 Mo/s"), ("Disque dur (typique)", 180, DGREY, "≈ 150–200 Mo/s")]
            for i, (lab, v, col, txt) in enumerate(rows):
                g = ease((t - 0.6 - i * 0.35) / 1.0)
                y = y0 + 90 + i * 112
                d.text((x0 + 40, y), lab, font=F(26, "SemiBold"), fill=WHITE)
                w = 520 * v / 5000 * g
                d.rounded_rectangle([x0 + 40, y + 40, x0 + 40 + max(8, w), y + 78], 9, fill=col + (235,))
                d.text((x0 + 40 + max(8, w) + 16, y + 42), txt, font=F(28, "Black", True), fill=WHITE)
            d.text((x0 + 40, y0 + 552), "*Kioxia, CrystalDiskMark · valeurs maximales annoncées", font=F(18, "Medium"), fill=(165, 170, 190))
            # place disponible
            x1 = 980
            a = ease((t - st_at(self.sent, 1, 4)) / 0.6)
            if a > 0:
                im.alpha_composite(fade(panel(830, 620, fill=(12, 9, 24, 225)), a), (x1, y0))
                d.text((x1 + 40, y0 + 30), "LA PLACE POUR TES JEUX", font=F(22, "Bold"), fill=PINK + (int(255 * a),), spacing=3)
                d.text((x1 + 40, y0 + 70), "1 To = ≈ 931 Go affichés par Windows", font=F(26, "SemiBold"), fill=(255, 255, 255, int(255 * a)))
                parts = [("Windows + logiciels", 60, GREY, "≈ 60 Go", "e"), ("Forza Horizon 6", 160, CALC, "160 Go", "m"),
                         ("Call of Duty / Warzone", 130, BLUE, "100 Go et plus", "e"), ("Fortnite", 40, RED, "≈ 30–50 Go", "e")]
                bx, by, bw = x1 + 40, y0 + 130, 750
                sc = bw / 931
                x = bx
                d.rounded_rectangle([bx, by, bx + bw, by + 70], 12, fill=(255, 255, 255, 18))
                used = 0
                for i, (lab, v, col, txt, k) in enumerate(parts):
                    g = ease((t - st_at(self.sent, 1, 4) - 0.3 - i * 0.45) / 0.7)
                    if g <= 0:
                        continue
                    d.rectangle([x, by, x + v * sc * g, by + 70], fill=col + (235,))
                    d.line([x + v * sc * g, by, x + v * sc * g, by + 70], fill=(10, 8, 18), width=3)
                    yy = by + 100 + i * 60
                    d.rectangle([bx, yy + 6, bx + 26, yy + 32], fill=col)
                    d.text((bx + 44, yy), f"{lab} : {txt}", font=F(26, "SemiBold"), fill=WHITE)
                    lb = "officiel" if k == "m" else "estimation"
                    d.text((bx + bw, yy + 4), lb, font=F(20, "Bold"), fill=(GREEN if k == "m" else ORANGE), anchor="ra")
                    x += v * sc * g; used += v * g
                ag = ease((t - st_at(self.sent, 1, 4) - 2.4) / 0.6)
                if ag > 0:
                    d.text((bx, by + 360), f"Reste ≈ {int(931 - used)} Go", font=F(40, "Black", True), fill=(255, 255, 255, int(255 * ag)))
                    d.text((bx, by + 414), "Un 2e SSD pourra s'ajouter : 2 emplacements M.2 restent libres", font=F(22, "Medium"), fill=(200, 205, 220, int(255 * ag)))
            foot(d, "Forza Horizon 6 : 160 Go annoncés pour PC (la fiche Steam indique 167 Go) · tailles Call of Duty et Fortnite variables selon les mises à jour")
            return im

    # ============================================================ températures (valeurs indicatives)
    class OvThermo(Ov):
        static = False

        def draw(self, t):
            im, d = full()
            head(d, "Températures en jeu · valeurs indicatives", "Issues de tests publiés et de retours d'utilisateurs · NON mesurées sur ton PC", y=80)
            gauges = [("Ryzen 7 9800X3D", "avec un watercooling 360 mm", 55, 70, 85, 95, ["Limite fixée par AMD (Tjmax) : 95 °C", "Source : AMD · retours d'utilisateurs"], 1),
                      ("RTX 5070 · autres modèles testés", "ta Ventus 2X n'a pas été testée par ces sources", 62, 77, 83, 95,
                       ["Founders Edition : 77 °C · MSI Gaming Trio : 62 °C", "Source : TechPowerUp · valeurs indicatives"], 2)]
            for i, (name, sub, lo, hi, warn, mx, notes, si) in enumerate(gauges):
                st = self.sent[si] if si < len(self.sent) else 1 + i * 4
                a = ease((t - st + 0.3) / 0.7)
                if a <= 0:
                    continue
                cx, cy, r = 520 + i * 880, 520, 220
                A = int(255 * a)
                d.arc([cx - r, cy - r, cx + r, cy + r], 150, 390, fill=(255, 255, 255, int(30 * a)), width=34)
                ang = lambda v: 150 + 240 * (v - 20) / (mx - 20)
                g = ease((t - st) / 1.4)
                d.arc([cx - r, cy - r, cx + r, cy + r], ang(lo), ang(lo + (hi - lo) * g), fill=BLUE + (A,), width=34)
                d.arc([cx - r, cy - r, cx + r, cy + r], ang(warn), ang(mx), fill=(255, 90, 90, int(200 * a)), width=34)
                d.text((cx, cy - 60), f"{lo}–{hi} °C", font=F(64, "Black", True), fill=(255, 255, 255, A), anchor="mm")
                d.text((cx, cy + 10), "plage indicative en jeu", font=F(24, "SemiBold"), fill=ORANGE + (A,), anchor="mm")
                d.text((cx, cy + 150), name, font=F(32, "Black", True), fill=(255, 255, 255, A), anchor="mm")
                d.text((cx, cy + 190), sub, font=F(22, "Medium"), fill=GREY + (A,), anchor="mm")
                for k, nt in enumerate(notes):
                    d.text((cx, cy + 232 + k * 34), nt, font=F(21, "SemiBold"), fill=((255, 175, 160) if k == 0 else (175, 180, 200)) + (A,), anchor="mm")
            foot(d, "Ces plages varient selon la pièce, le boîtier, le jeu et la courbe des ventilateurs · seule une mesure sur ton PC donnera ses vraies températures", y=870)
            return im

    # ============================================================ consommation : composants vs prise
    class OvPower(Ov):
        static = False

        def draw(self, t):
            im, d = full()
            head(d, "Consommation en jeu", "Composants mesurés par TechPowerUp sur d'autres machines · total et prise : ESTIMATIONS", y=70)
            parts = [("RTX 5070", 230, VIOLET, "≈ 230 W · mesuré sur une RTX 5070 FE (TechPowerUp)"),
                     ("Ryzen 7 9800X3D", 65, RED, "≈ 65 W · moyenne en jeu (TechPowerUp)"),
                     ("Carte mère, RAM, SSD, 7 ventilateurs, pompe", 55, (120, 125, 140), "≈ 50 à 60 W · estimation")]
            x0, y0, wmax = 140, 250, 1640
            sc = wmax / 750
            x = x0
            for i, (lab, w, col, note) in enumerate(parts):
                gi = ease((t - 0.5 - i * 0.5) / 0.9)
                ww = w * sc * gi
                d.rounded_rectangle([x, y0, x + max(2, ww), y0 + 90], 12, fill=col + (235,))
                if gi > 0.5:
                    yy = y0 + 116 + i * 52
                    d.rounded_rectangle([x0, yy + 4, x0 + 30, yy + 32], 6, fill=col)
                    d.text((x0 + 50, yy), f"{lab} : {note}", font=F(26, "SemiBold"), fill=WHITE)
                x += w * sc
            d.rounded_rectangle([x0, y0, x0 + wmax, y0 + 90], 12, outline=(255, 255, 255, 70), width=3)
            d.text((x0 + wmax - 14, y0 + 30), "750 W", font=F(30, "Black", True), fill=GREY, anchor="ra")
            a = ease((t - st_at(self.sent, 1, 4)) / 0.6)
            if a > 0:
                A = int(255 * a)
                cards = [("≈ 350 W", "consommés par les composants", "estimation"),
                         ("≈ 390 W", "tirés à la prise (rendement ≈ 90 %)", "estimation"),
                         ("≈ 47 %", "de la capacité de l'alimentation", "charge idéale : 40–60 %")]
                for k, (big, txt, sm) in enumerate(cards):
                    ak = ease((t - st_at(self.sent, 1, 4) - k * 0.5) / 0.6)
                    if ak <= 0:
                        continue
                    cx = x0 + k * 560
                    im.alpha_composite(fade(panel(520, 240, fill=(14, 10, 28, 225)), ak), (cx, 560))
                    d.text((cx + 36, 590), big, font=F(64, "Black", True), fill=(255, 255, 255, int(255 * ak)))
                    d.text((cx + 36, 680), txt, font=F(25, "SemiBold"), fill=(225, 228, 240, int(255 * ak)))
                    d.text((cx + 36, 724), sm.upper(), font=F(19, "Bold"), fill=ORANGE + (int(255 * ak),), spacing=2)
                d.text((x0, 840), "be quiet! Pure Power 13 M : 80 PLUS Gold ≈ 90 % de rendement vers 50 % de charge · rien n'est mesuré sur ton PC",
                       font=F(22, "Medium"), fill=(200, 205, 220, A))
            return im

    # ============================================================ flux d'air (corrigé)
    class OvAirflow(Ov):
        static = False

        def draw(self, t):
            im, d = full()
            for k in range(3):  # entrée façade : 3 ventilateurs fournis
                y = 330 + k * 200
                for j in range(4):
                    x = 980 - ((t * 120 + j * 60) % 240)
                    d.polygon([(x, y - 14), (x - 40, y), (x, y + 14)], fill=BLUE + (200,))
            for j in range(4):  # sortie haut à travers le radiateur (montage supposé)
                yy = 120 - ((t * 90 + j * 40) % 160)
                for x in (360, 470, 580):
                    d.polygon([(x - 14, yy + 40), (x, yy), (x + 14, yy + 40)], fill=PINK + (190,))
            for j in range(3):  # sortie arrière : ventilateur arrière
                x = 150 - ((t * 90 + j * 50) % 150)
                d.polygon([(x + 40, 340), (x, 354), (x + 40, 368)], fill=PINK + (190,))
            d.text((110, 390), "ventilateur\narrière", font=F(18, "SemiBold"), fill=(190, 200, 220), spacing=4)
            x0, y0 = 1060, 170
            im.alpha_composite(panel(800, 640), (x0, y0))
            d.text((x0 + 44, y0 + 34), "CORSAIR FRAME 4000D RS ARGB", font=F(24, "Bold"), fill=PINK, spacing=2)
            d.text((x0 + 44, y0 + 70), "Flux d'air de ta config", font=F(44, "Black", True), fill=WHITE)
            items = [(BLUE, "Entrée : 3 ventilateurs RS120 ARGB en façade", "fournis avec le boîtier"),
                     (PINK, "Sortie : radiateur 360 mm au sommet*", "ses 3 ventilateurs Arctic rejettent l'air chaud"),
                     (PINK, "Sortie : ventilateur arrière ARGB", "installé en plus des 3 fournis en façade"),
                     (WHITE, "7 ventilateurs en tout : 4 + 3", "4 dans le boîtier + 3 sur le watercooling"),
                     (WHITE, "GPU jusqu'à 405 mm · radiateur 360 mm", "données constructeur Corsair")]
            for k, (c, s, s2) in enumerate(items):
                y = y0 + 160 + k * 82
                d.ellipse([x0 + 46, y + 12, x0 + 58, y + 24], fill=c)
                d.text((x0 + 76, y), s, font=F(27, "SemiBold"), fill=(235, 237, 245))
                d.text((x0 + 76, y + 36), s2, font=F(20, "Medium"), fill=GREY)
            d.text((x0 + 44, y0 + 586), "*Position du radiateur supposée (montage le plus courant) · flux schématisé", font=F(18, "Medium"), fill=(165, 170, 190))
            return im

    # ============================================================ ambiances lumineuses
    base_rgb = R.OVS["rgb"]

    class OvRGB(base_rgb):
        def draw(self, t):
            im = super().draw(t)
            d = ImageDraw.Draw(im)
            d.rectangle([1120 + 40, 300 + 380, 1120 + 680, 300 + 412], fill=(12, 12, 16, 255))
            d.text((1120 + 44, 300 + 386), "Éclairage : ventilateurs du boîtier et watercooling · RAM sans RGB", font=F(18, "Medium"), fill=(165, 170, 190))
            return im

    # ============================================================ chapitres : balayage lumineux
    base_ch = R.OVS["chapter"]

    class OvChapter(base_ch):
        def draw(self, t):
            im = super().draw(t)
            p = ease_io(t / 0.9)
            if 0 < p < 1:
                L = Image.new("RGBA", (W, H))
                ld = ImageDraw.Draw(L)
                x = -300 + p * (W + 600)
                ld.polygon([(x - 60, 0), (x + 60, 0), (x - 140, H), (x - 260, H)], fill=(150, 75, 255, 70))
                ld.polygon([(x + 40, 0), (x + 70, 0), (x - 130, H), (x - 160, H)], fill=(125, 210, 255, 120))
                L = L.filter(ImageFilter.GaussianBlur(18))
                L.alpha_composite(im)
                im = L
            return im

    R.OVS.update({"dlss4": OvDLSS4, "fh6fps": OvFH6FPS, "storage": OvStorage, "thermo": OvThermo, "power": OvPower,
                  "airflow": OvAirflow, "rgb": OvRGB, "chapter": OvChapter})
    install_rgbpc(R)


# ================================================================ PC éclairé : couleurs changées selon la narration
THEMES = [("Noir & violet", (140, 70, 255)), ("Bleu glacier", (125, 210, 255)), ("Blanc pur", (240, 244, 255)), ("Arc-en-ciel", None)]


def install_rgbpc(R):
    import numpy as np
    Ov, full = R.Ov, R.full
    cache = {}

    def prep():
        if cache:
            return cache
        im = R.load_photo("pc_rgb")
        sc = 1000 / im.height
        im = im.resize((int(im.width * sc), 1000), Image.LANCZOS)
        a = im.getchannel("A").filter(ImageFilter.GaussianBlur(3))
        arr = np.asarray(im).astype(np.float32)[..., :3] / 255
        mx = arr.max(-1); mn = arr.min(-1); s = (mx - mn) / (mx + 1e-6); v = mx
        m = np.clip((s - 0.2) / 0.35, 0, 1) * np.clip((v - 0.15) / 0.45, 0, 1)
        # RAM Patriot sans RGB : éclairage éteint, bords adoucis
        reg = Image.new("L", im.size)
        rd = ImageDraw.Draw(reg)
        for (x0, y0, x1, y1) in [(612, 325, 680, 610)]:
            rd.rectangle([x0 * sc, y0 * sc, x1 * sc, y1 * sc], fill=255)
        wreg = np.asarray(reg.filter(ImageFilter.GaussianBlur(7))).astype(np.float32) / 255
        k = (wreg * np.maximum(m, np.clip((v - 0.25) / 0.4, 0, 1)))[..., None]
        g = arr.mean(-1, keepdims=True)
        arr = arr * (1 - k) + np.minimum(g * 0.6, 0.16) * k
        m = m * (1 - wreg)
        v = arr.max(-1)
        # fondu des bords de l'image
        aa = np.asarray(a).astype(np.float32) / 255
        hh_, ww_ = aa.shape
        ex = np.minimum(np.arange(ww_), np.arange(ww_)[::-1]) / 90.0
        ey = np.minimum(np.arange(hh_), np.arange(hh_)[::-1]) / 90.0
        aa = aa * np.clip(ey, 0, 1)[:, None] * np.clip(ex, 0, 1)[None, :]
        hh, ww = v.shape
        yy, xx = np.mgrid[0:hh, 0:ww]
        cache.update(arr=arr, m=m[..., None], lum=v[..., None], a=aa[..., None],
                     xx=xx / ww, yy=yy / hh, sc=sc, size=(ww, hh))
        return cache

    def colored(c, idx, t):
        lum = c["lum"]
        if idx < 0:
            return c["arr"]
        col = THEMES[idx][1]
        if col is None:
            h = (c["xx"] * 0.9 + c["yy"] * 0.4 + t * 0.12) % 1
            cc = np.clip(np.stack([np.abs(h * 6 - 3) - 1, 2 - np.abs(h * 6 - 2), 2 - np.abs(h * 6 - 4)], -1), 0, 1)
        else:
            cc = np.array(col, np.float32) / 255
        new = np.clip(cc * lum * 1.4 + lum ** 4 * 0.18, 0, 1)
        return c["arr"] * (1 - c["m"]) + new * c["m"]

    def theme_at(sent, t):
        """-1 = photo d'origine, puis un thème par phrase (phrases 1 à 4)"""
        idx, st = -1, 0.0
        for i in range(4):
            if i + 1 < len(sent) and t >= sent[i + 1] - 0.15:
                idx, st = i, sent[i + 1] - 0.15
        return idx, st

    class RgbPC:
        def __init__(self, dur, k, sent):
            self.dark = R.DarkBG("dark"); self.dur = dur; self.sent = sent or []; self.prev = -1

        def frame(self, t):
            c = prep()
            bg = self.dark.frame(t).astype(np.float32) / 255
            idx, st = theme_at(self.sent, t)
            img = colored(c, idx, t)
            k = ease_io((t - st) / 0.5) if idx >= 0 else 1
            if k < 1:
                img = colored(c, idx - 1, t) * (1 - k) + img * k
            ww, hh = c["size"]
            x0, y0 = 120 + int(20 * math.sin(t * 0.3)), 40
            reg = bg[y0:y0 + hh, x0:x0 + ww]
            bg[y0:y0 + hh, x0:x0 + ww] = img * c["a"] + reg * (1 - c["a"])
            return (np.clip(bg, 0, 1) * 255).astype(np.uint8)

        def close(self):
            pass

    class OvRgbPC(Ov):
        static = False

        def draw(self, t):
            im, d = full()
            idx, st = theme_at(self.sent, t)
            x0, y0 = 1300, 250
            im.alpha_composite(panel(540, 470, fill=(12, 10, 22, 215)), (x0, y0))
            d.text((x0 + 40, y0 + 32), "AMBIANCES LUMINEUSES", font=F(22, "Bold"), fill=PINK, spacing=3)
            for j, (n_, c_) in enumerate(THEMES):
                y = y0 + 96 + j * 74
                on = j == idx
                col = hue(t * 0.15) if c_ is None else c_
                d.rounded_rectangle([x0 + 40, y + 4, x0 + 92, y + 42], 9, fill=col + (255 if on else 110,))
                d.text((x0 + 116, y + 2), n_, font=F(34 if on else 30, "Black" if on else "Medium", on), fill=WHITE if on else GREY)
            d.text((x0 + 40, y0 + 412), "Éclairage : ventilateurs du boîtier + watercooling", font=F(19, "Medium"), fill=(170, 175, 195))
            a = ease((t - (self.sent[5] - 0.1 if len(self.sent) > 5 else self.D)) / 0.5)
            if a > 0:
                c = prep(); sc = c["sc"]
                rx, ry = 120 + int(646 * sc), 40 + int(470 * sc)
                A = int(255 * a)
                d.ellipse([rx - 60, ry - 150, rx + 60, ry + 150], outline=(255, 255, 255, A), width=4)
                d.line([rx + 60, ry, 1290, 820], fill=(255, 255, 255, A), width=3)
                im.alpha_composite(fade(panel(540, 110, fill=(12, 10, 22, 230)), a), (1300, 770))
                d.text((1340, 790), "RAM Patriot Viper Venom", font=F(28, "Black", True), fill=(255, 255, 255, A))
                d.text((1340, 834), "sans RGB · éclairage éteint sur ce visuel", font=F(21, "Medium"), fill=GREY + (A,))
            d.text((120, 1000), "VISUEL D'ILLUSTRATION · couleurs simulées", font=F(18, "Bold"), fill=(170, 175, 195))
            return im

    base = R.make_bg

    def make_bg(spec, dur, k, sent=None):
        if spec == "rgbpc":
            return RgbPC(dur, k, sent)
        return base(spec, dur, k, sent)

    R.make_bg = make_bg
    R.OVS["rgbpc"] = OvRgbPC
    R.rgbpc_prep = prep
