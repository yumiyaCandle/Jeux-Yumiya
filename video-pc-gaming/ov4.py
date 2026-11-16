# -*- coding: utf-8 -*-
"""v6 : températures & durabilité, consommation, entretien, OLED (VRR, burn-in),
« que signifient 100 / 200 / 300 FPS », habillages propres à chaque jeu."""
import math
from PIL import Image, ImageDraw, ImageFilter
from gfx import *  # noqa: F401,F403


def install(R):
    Ov, full = R.Ov, R.full

    def head(d, title, sub=None, y=90):
        d.text((120, y), title, font=F(46, "Black", True), fill=WHITE)
        if sub:
            d.text((122, y + 64), sub, font=F(24, "Medium"), fill=GREY)

    def tag(d, txt, x=120, y=930):
        d.text((x, y), txt, font=F(20, "SemiBold"), fill=(170, 175, 195))

    # ------------------------------------------------------------ jauges de température
    class OvThermo(Ov):
        static = False

        def draw(self, t):
            im, d = full()
            head(d, "Températures en jeu", "Valeurs indicatives (tests publiés et retours d'utilisateurs) · non mesurées sur ton PC")
            gauges = [("Ryzen 7 9800X3D", "avec watercooling 360 mm", 55, 70, 85, 95, "Limite AMD (Tjmax) : 95 °C", 1),
                      ("RTX 5070 Ventus 2X", "refroidissement double ventilateur", 62, 77, 83, 95, "FE : 77 °C · MSI Gaming Trio : 62 °C (TechPowerUp)", 2)]
            for i, (name, sub, lo, hi, warn, mx, note, si) in enumerate(gauges):
                st = self.sent[si] if si < len(self.sent) else 1 + i * 4
                a = ease((t - st + 0.3) / 0.7)
                if a <= 0:
                    continue
                cx, cy, r = 520 + i * 880, 560, 230
                A = int(255 * a)
                d.arc([cx - r, cy - r, cx + r, cy + r], 150, 390, fill=(255, 255, 255, int(30 * a)), width=34)
                ang = lambda v: 150 + 240 * (v - 20) / (mx - 20)
                g = ease((t - st) / 1.4)
                d.arc([cx - r, cy - r, cx + r, cy + r], ang(lo), ang(lo + (hi - lo) * g), fill=BLUE + (A,), width=34)
                d.arc([cx - r, cy - r, cx + r, cy + r], ang(warn), ang(mx), fill=(255, 90, 90, int(200 * a)), width=34)
                d.text((cx, cy - 60), f"{lo}–{hi} °C", font=F(64, "Black", True), fill=(255, 255, 255, A), anchor="mm")
                d.text((cx, cy + 10), "plage habituelle en jeu", font=F(24, "SemiBold"), fill=PINK + (A,), anchor="mm")
                d.text((cx, cy + 150), name, font=F(34, "Black", True), fill=(255, 255, 255, A), anchor="mm")
                d.text((cx, cy + 192), sub, font=F(22, "Medium"), fill=GREY + (A,), anchor="mm")
                d.text((cx, cy + 236), note, font=F(21, "SemiBold"), fill=(255, 160, 160, A), anchor="mm")
            tag(d, "Sources : AMD (Tjmax) · TechPowerUp (RTX 5070 FE / MSI Gaming Trio) · retours d'utilisateurs (9800X3D + AIO 360 mm)")
            return im

    # ------------------------------------------------------------ consommation
    class OvPower(Ov):
        static = False

        def draw(self, t):
            im, d = full()
            head(d, "Consommation en jeu", "RTX 5070 et 9800X3D : mesures TechPowerUp · reste du PC et total : estimation")
            parts = [("RTX 5070", 230, VIOLET, "≈ 230 W · mesuré (TechPowerUp)"), ("Ryzen 7 9800X3D", 65, RED, "≈ 65 W · moyenne en jeu (TechPowerUp)"),
                     ("Carte mère, RAM, SSD, ventilateurs, pompe", 55, (120, 125, 140), "≈ 50 à 60 W · estimation")]
            x0, y0, wmax = 140, 330, 1640
            sc = wmax / 750
            g = ease((t - 0.5) / 1.5)
            x = x0
            for i, (lab, w, col, note) in enumerate(parts):
                gi = ease((t - 0.5 - i * 0.5) / 0.9)
                ww = w * sc * gi
                d.rounded_rectangle([x, y0, x + max(2, ww), y0 + 90], 12, fill=col + (235,))
                if gi > 0.5:
                    yy = y0 + 120 + i * 56
                    d.rounded_rectangle([x0, yy + 4, x0 + 30, yy + 32], 6, fill=col)
                    d.text((x0 + 50, yy), f"{lab} : {note}", font=F(27, "SemiBold"), fill=WHITE)
                x += w * sc
            d.rounded_rectangle([x0, y0, x0 + wmax, y0 + 90], 12, outline=(255, 255, 255, 70), width=3)
            d.text((x0 + wmax - 14, y0 + 30), "750 W", font=F(30, "Black", True), fill=GREY, anchor="ra")
            a = ease((t - (self.sent[1] if len(self.sent) > 1 else 4)) / 0.6)
            if a > 0:
                s = text_sprite("≈ 350 W en jeu · environ la moitié de 750 W", F(44, "Black", True), WHITE, glow_col=RED, pad=30)
                im.alpha_composite(fade(s, a), (x0 - 30, 690))
                d.text((x0, 790), "Zone d'efficacité idéale d'une alimentation 80 PLUS Gold : autour de 50 % de charge · total estimé, non mesuré sur ton PC",
                       font=F(23, "Medium"), fill=(200, 205, 220, int(255 * a)))
            return im

    # ------------------------------------------------------------ entretien
    class OvCare(Ov):
        static = False

        def draw(self, t):
            im, d = full()
            head(d, "Entretien : simple et rapide")
            items = [("Tous les 1 à 2 mois", "PC éteint : dépoussiérer filtres, radiateur et ventilateurs à l'air sec"),
                     ("Watercooling Arctic", "Circuit fermé : jamais de liquide à ajouter"),
                     ("De temps en temps", "Vérifier que la pompe tourne (BIOS ou logiciel de surveillance)"),
                     ("Bon réflexe", "Laisser de l'espace autour du boîtier pour qu'il respire")]
            for i, (k, v) in enumerate(items):
                st = 0.6 + i * (max(1.0, self.D - 3) / len(items))
                a = ease((t - st) / 0.5)
                if a <= 0:
                    continue
                y = 240 + i * 150
                x = 140 + int(40 * (1 - a))
                im.alpha_composite(fade(panel(1640, 120, fill=(14, 10, 26, 215)), a), (x, y))
                d.text((x + 50, y + 22), k.upper(), font=F(22, "Bold"), fill=PINK + (int(255 * a),), spacing=3)
                d.text((x + 50, y + 58), v, font=F(32, "SemiBold"), fill=(255, 255, 255, int(255 * a)))
            return im

    # ------------------------------------------------------------ signes d'alerte
    class OvAlerts(Ov):
        static = False

        def draw(self, t):
            im, d = full()
            head(d, "Les signes qui doivent t'alerter")
            items = ["Processeur souvent au-dessus de 90 °C en jeu", "Chutes de FPS soudaines après quelques minutes",
                     "Ventilateurs bloqués à fond en permanence", "Bruit inhabituel de la pompe (cliquetis, gargouillis)"]
            for i, it in enumerate(items):
                a = ease((t - 0.6 - i * 0.7) / 0.5)
                if a <= 0:
                    continue
                y = 250 + i * 130
                d.rounded_rectangle([140, y, 1780, y + 100], 18, fill=(40, 12, 22, int(200 * a)), outline=(255, 110, 110, int(200 * a)), width=2)
                d.text((180, y + 50), "!", font=F(48, "Black", True), fill=(255, 120, 120, int(255 * a)), anchor="mm")
                d.text((230, y + 50), it, font=F(34, "SemiBold"), fill=(255, 255, 255, int(255 * a)), anchor="lm")
            a = ease((t - (self.sent[1] if len(self.sent) > 1 else 5)) / 0.6)
            d.text((140, 800), "Solution fréquente : dépoussiérer, puis vérifier la courbe des ventilateurs dans le BIOS",
                   font=F(28, "SemiBold"), fill=PINK + (int(255 * a),))
            return im

    # ------------------------------------------------------------ VRR / temps de réponse
    @staticmethod
    def _noop():
        pass

    class OvVRR(Ov):
        static = False

        def draw(self, t):
            im, d = full()
            head(d, "Temps de réponse & VRR", "Gigabyte MO27Q3 : 0,03 ms GtG annoncé · G-SYNC Compatible · FreeSync Premium Pro")
            # traînée : LCD vs OLED
            a = ease((t - 0.4) / 0.6)
            for i, (lab, trail, col) in enumerate([("LCD rapide · quelques ms", 6, GREY), ("OLED · 0,03 ms", 0, PINK)]):
                y = 290 + i * 120
                d.text((140, y + 10), lab, font=F(28, "Bold"), fill=col + (int(255 * a),))
                p = ((t * 0.5) % 1)
                x = 640 + p * 1000
                for k in range(trail, 0, -1):
                    d.rounded_rectangle([x - k * 22 - 30, y, x - k * 22 + 30, y + 60], 10, fill=col + (int(40 * a * (1 - k / (trail + 1))),))
                d.rounded_rectangle([x - 30, y, x + 30, y + 60], 10, fill=col + (int(255 * a),))
            # VRR : image déchirée vs image entière
            a2 = ease((t - (self.sent[1] if len(self.sent) > 1 else 5)) / 0.6)
            if a2 > 0:
                for i, (lab, tear, col) in enumerate([("Sans VRR : déchirement", True, (255, 120, 120)), ("Avec VRR : image entière", False, GREEN)]):
                    x0, y0 = 140 + i * 840, 560
                    w, h = 780, 300
                    d.rounded_rectangle([x0, y0, x0 + w, y0 + h], 16, fill=(16, 12, 30, int(220 * a2)), outline=col + (int(200 * a2),), width=3)
                    for k in range(6):
                        off = (40 if (tear and k >= 3) else 0)
                        yy = y0 + 30 + k * 42
                        d.rectangle([x0 + 80 + off, yy, x0 + 420 + off, yy + 34], fill=(90, 140, 255, int(200 * a2)))
                        d.polygon([(x0 + 420 + off, yy), (x0 + 520 + off, yy + 17), (x0 + 420 + off, yy + 34)], fill=(140, 90, 255, int(200 * a2)))
                    d.text((x0 + 24, y0 + h + 16), lab, font=F(28, "Bold"), fill=col + (int(255 * a2),))
            return im

    # ------------------------------------------------------------ burn-in
    class OvBurnin(Ov):
        static = False

        def draw(self, t):
            im, d = full()
            head(d, "OLED : le risque de burn-in", "Marquage possible après des centaines d'heures d'une même image fixe")
            x0, y0 = 140, 260
            im.alpha_composite(panel(780, 600, fill=(14, 10, 26, 220)), (x0, y0))
            d.text((x0 + 40, y0 + 34), "CE QUE PRÉVOIT GIGABYTE", font=F(22, "Bold"), fill=PINK, spacing=3)
            pro = ["Protections automatiques « OLED Care »", "Film graphène + dissipateur pour la dalle", "Garantie 3 ans, burn-in inclus*", "*selon Gigabyte · conditions selon les pays"]
            for i, s in enumerate(pro):
                a = ease((t - 0.6 - i * 0.4) / 0.5)
                d.text((x0 + 40, y0 + 100 + i * 70), s, font=F(28 if i < 3 else 21, "SemiBold" if i < 3 else "Medium"), fill=(255, 255, 255, int(255 * a)) if i < 3 else GREY + (int(255 * a),))
            x1 = 1000
            im.alpha_composite(panel(780, 600, fill=(14, 10, 26, 220)), (x1, y0))
            d.text((x1 + 40, y0 + 34), "TES BONNES HABITUDES", font=F(22, "Bold"), fill=PINK, spacing=3)
            habits = ["Masquer la barre des tâches", "Fond d'écran sombre ou diaporama", "Mise en veille rapide", "Laisser le rafraîchissement des pixels se faire",
                      "Discord & navigation sur l'écran AOC"]
            st0 = self.sent[2] if len(self.sent) > 2 else 6
            for i, s in enumerate(habits):
                a = ease((t - st0 - i * 0.6) / 0.5)
                if a <= 0:
                    continue
                y = y0 + 100 + i * 92
                d.ellipse([x1 + 44, y + 12, x1 + 58, y + 26], fill=PINK + (int(255 * a),))
                d.text((x1 + 76, y), s, font=F(29, "SemiBold"), fill=(255, 255, 255, int(255 * a)))
            return im

    # ------------------------------------------------------------ 100 / 200 / 300 FPS
    class OvFpsFeel(Ov):
        static = False

        def draw(self, t):
            im, d = full()
            head(d, "Jouer à 100, 200 ou 300 FPS, concrètement", "Chaque repère = une nouvelle image calculée pendant le même mouvement (ralenti)")
            lanes = [(100, "10 ms", BLUE), (200, "5 ms", RED), (300, "3,3 ms", PINK)]
            L0, L1 = 560, 1780
            p = ease_io(min(1, (t % 3.2) / 2.6))
            for i, (fps, ms, col) in enumerate(lanes):
                a = ease((t - 0.4 - i * 0.5) / 0.6)
                if a <= 0:
                    continue
                y = 290 + i * 190
                d.text((140, y), f"{fps} FPS", font=F(62, "Black", True), fill=col + (int(255 * a),))
                d.text((140, y + 76), f"une image toutes les {ms}", font=F(26, "Medium"), fill=GREY + (int(255 * a),))
                n = int(fps * 0.1)
                shown = int(p * n) + 1
                d.line([L0, y + 55, L1, y + 55], fill=(255, 255, 255, int(30 * a)), width=2)
                for k in range(min(shown, n + 1)):
                    x = L0 + 20 + (L1 - L0 - 40) * k / n
                    last = k == min(shown, n + 1) - 1
                    s_ = 22 if fps < 150 else (15 if fps < 250 else 11)
                    d.rounded_rectangle([x - s_, y + 33, x + s_, y + 77], 6, fill=col + (int(255 * a * (1 if last else 0.4)),))
            a = ease((t - (self.sent[2] if len(self.sent) > 2 else 7)) / 0.6)
            d.text((140, 860), "Plus d'images = mouvement plus net et réaction plus rapide à la souris · au-delà de 360 Hz, le gain devient minime",
                   font=F(26, "SemiBold"), fill=(230, 232, 240, int(255 * a)))
            return im

    # ------------------------------------------------------------ habillages par jeu
    class SkinWZ(Ov):
        """Warzone : cadre de visée militaire + légère teinte"""
        static = True

        def draw(self, t):
            im, d = full()
            im.paste((40, 60, 40, 30), (0, 0, W, H))
            col = (210, 230, 200, 200)
            for (x, y, sx, sy) in [(60, 60, 1, 1), (W - 60, 60, -1, 1), (60, H - 60, 1, -1), (W - 60, H - 60, -1, -1)]:
                d.line([x, y, x + 70 * sx, y], fill=col, width=4)
                d.line([x, y, x, y + 70 * sy], fill=col, width=4)
            d.text((W - 90, 80), "WARZONE", font=F(20, "Bold"), fill=col, anchor="ra", spacing=4)
            return im

        def alpha(self, t):
            return min(1, t / 0.4) * (1 - ease_io((t - (self.D - 0.3)) / 0.3))

        def offset(self, t):
            return (0, 0)

    class SkinBC(Ov):
        """Bodycam : témoin d'enregistrement + horodatage"""
        static = False

        def draw(self, t):
            im, d = full()
            if int(t * 1.6) % 2 == 0:
                d.ellipse([84, 82, 108, 106], fill=(255, 50, 50))
            d.text((122, 80), "REC", font=F(26, "Bold"), fill=(250, 250, 250))
            s = 12 * 3600 + 34 * 60 + 10 + int(self.o.get("t0", 0) + t)
            d.text((W - 90, 80), f"{s // 3600:02d}:{s % 3600 // 60:02d}:{s % 60:02d}", font=F(26, "Bold"), fill=(250, 250, 250), anchor="ra")
            return im

        def alpha(self, t):
            return min(1, t / 0.4) * (1 - ease_io((t - (self.D - 0.3)) / 0.3))

        def offset(self, t):
            return (0, 0)

    class SkinFH(Ov):
        """Forza Horizon 6 : bandes cinéma"""
        static = True

        def draw(self, t):
            im, d = full()
            d.rectangle([0, 0, W, 110], fill=(0, 0, 0, 255))
            d.rectangle([0, H - 110, W, H], fill=(0, 0, 0, 255))
            return im

        def alpha(self, t):
            return min(1, t / 0.5)

        def offset(self, t):
            return (0, 0)

    R.OVS.update({"thermo": OvThermo, "power": OvPower, "care": OvCare, "alerts": OvAlerts, "vrr": OvVRR, "burnin": OvBurnin,
                  "fpsfeel": OvFpsFeel, "skin_wz": SkinWZ, "skin_bc": SkinBC, "skin_fh": SkinFH})
