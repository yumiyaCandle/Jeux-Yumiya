# -*- coding: utf-8 -*-
"""Primitives graphiques : polices, couleurs, panneaux, texte lumineux,
illustrations stylisées des composants (dessinées, pas des photos)."""
import math, colorsys, functools
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageChops

W, H = 1920, 1080
FD = "/usr/share/fonts/opentype/inter/"

RED = (150, 75, 255)      # violet électrique (accent principal)
RED2 = (120, 50, 200)
BLUE = (70, 140, 255)
PINK = (125, 210, 255)    # bleu glacier (nom historique conservé)
WHITE = (245, 246, 250)
GREY = (150, 156, 168)
DGREY = (70, 74, 84)
GREEN = (40, 215, 120)
ORANGE = (255, 158, 30)
VIOLET = (205, 170, 255)  # images générées (lavande)
CYAN = (0, 220, 255)
BG = (7, 7, 10)


@functools.lru_cache(None)
def F(size, w="SemiBold", disp=False):
    return ImageFont.truetype(f"{FD}{'InterDisplay' if disp else 'Inter'}-{w}.otf", size)


def ease(x):
    x = min(1, max(0, x))
    return 1 - (1 - x) ** 3


def ease_io(x):
    x = min(1, max(0, x))
    return 3 * x * x - 2 * x * x * x


def hue(h, s=1.0, v=1.0):
    r, g, b = colorsys.hsv_to_rgb(h % 1.0, s, v)
    return (int(r * 255), int(g * 255), int(b * 255))


def fade(img, a):
    """multiplie l'alpha d'une image RGBA"""
    if a >= 0.999:
        return img
    im = img.copy()
    al = im.getchannel("A").point(lambda v: int(v * max(0, a)))
    im.putalpha(al)
    return im


def panel(w, h, r=22, fill=(12, 12, 16, 215), border=(255, 255, 255, 28), accent=True):
    im = Image.new("RGBA", (w, h))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([0, 0, w - 1, h - 1], r, fill=fill, outline=border, width=2)
    if accent:
        d.rounded_rectangle([0, 18, 6, h - 18], 3, fill=RED + (255,))
    return im


def glow(layer, radius=14, strength=1.6):
    g = layer.filter(ImageFilter.GaussianBlur(radius))
    if strength != 1:
        a = g.getchannel("A").point(lambda v: min(255, int(v * strength)))
        g.putalpha(a)
    out = Image.new("RGBA", layer.size)
    out.alpha_composite(g)
    out.alpha_composite(layer)
    return out


def text_sprite(txt, font, fill=WHITE, glow_col=None, pad=40, spacing=0):
    bb = font.getbbox(txt)
    w = bb[2] - bb[0] + pad * 2 + spacing * len(txt)
    h = bb[3] - bb[1] + pad * 2
    im = Image.new("RGBA", (w, h))
    d = ImageDraw.Draw(im)
    if spacing:
        x = pad - bb[0]
        for ch in txt:
            d.text((x, pad - bb[1]), ch, font=font, fill=fill)
            x += d.textlength(ch, font=font) + spacing
    else:
        d.text((pad - bb[0], pad - bb[1]), txt, font=font, fill=fill)
    if glow_col:
        gl = Image.new("RGBA", im.size)
        gl.paste(Image.new("RGBA", im.size, glow_col + (255,)), mask=im.getchannel("A"))
        g = gl.filter(ImageFilter.GaussianBlur(pad / 2.2))
        out = Image.new("RGBA", im.size)
        out.alpha_composite(g); out.alpha_composite(g); out.alpha_composite(im)
        return out
    return im


def wrap(d, txt, font, maxw):
    words, lines, cur = txt.split(), [], ""
    for w_ in words:
        t = (cur + " " + w_).strip()
        if d.textlength(t, font=font) <= maxw:
            cur = t
        else:
            lines.append(cur); cur = w_
    if cur:
        lines.append(cur)
    return lines


def badge(kind, src=""):
    col = {"m": GREEN, "e": ORANGE, "fg": VIOLET}[kind]
    lab = {"m": "MESURÉ", "e": "ESTIMATION", "fg": "IMAGES GÉNÉRÉES"}[kind]
    f = F(19, "Bold")
    txt = lab + (f" · {src}" if src and kind == "m" else "")
    tw = int(ImageDraw.Draw(Image.new("RGBA", (1, 1))).textlength(txt, font=f))
    im = Image.new("RGBA", (tw + 28, 34))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([0, 0, tw + 27, 33], 17, fill=col + (40,), outline=col + (220,), width=2)
    d.text((14, 6), txt, font=f, fill=col)
    return im


# ======================================================= ILLUSTRATIONS
def fan(d, cx, cy, r, ring_col, blades=9, rot=0.0, body=(18, 18, 22)):
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=body, outline=(40, 40, 46), width=3)
    hub = r * 0.3
    for i in range(blades):
        a = rot + i * 2 * math.pi / blades
        pts = []
        for k in range(8):
            rr = hub + (r * 0.88 - hub) * k / 7
            aa = a + 0.55 * k / 7
            pts.append((cx + rr * math.cos(aa), cy + rr * math.sin(aa)))
        for k in range(7, -1, -1):
            rr = hub + (r * 0.88 - hub) * k / 7
            aa = a + 0.55 * k / 7 + 0.32
            pts.append((cx + rr * math.cos(aa), cy + rr * math.sin(aa)))
        d.polygon(pts, fill=(34, 34, 40))
    d.ellipse([cx - hub, cy - hub, cx + hub, cy + hub], fill=(26, 26, 30), outline=(55, 55, 62), width=2)
    if ring_col is not None:
        d.ellipse([cx - r + 2, cy - r + 2, cx + r - 2, cy + r - 2], outline=ring_col, width=max(4, int(r * 0.07)))


def rgb_ring_layer(size, rings, ph):
    """couche lumineuse : anneaux arc-en-ciel (cx,cy,r)"""
    L = Image.new("RGBA", size)
    d = ImageDraw.Draw(L)
    for j, (cx, cy, r) in enumerate(rings):
        n = 48
        for i in range(n):
            a0 = 360 * i / n; a1 = 360 * (i + 1) / n + 1
            col = hue(ph + i / n + j * 0.08)
            d.arc([cx - r, cy - r, cx + r, cy + r], a0, a1, fill=col + (255,), width=max(5, int(r * 0.08)))
    return L


@functools.lru_cache(None)
def hero_pc(step, steps=36):
    """Illustration stylisée : boîtier Corsair FRAME 4000D noir vitré, RGB."""
    ph = step / steps
    w, h = 760, 880
    im = Image.new("RGBA", (w, h))
    d = ImageDraw.Draw(im)
    # châssis
    d.rounded_rectangle([20, 20, w - 20, h - 20], 26, fill=(14, 14, 17), outline=(48, 48, 56), width=4)
    # trame "FRAME" (cadre ajouré) en façade droite
    d.rectangle([w - 120, 40, w - 40, h - 40], fill=(10, 10, 12))
    for y in range(56, h - 50, 18):
        d.line([w - 112, y, w - 48, y + 10], fill=(36, 36, 42), width=3)
    # vitre
    gx0, gy0, gx1, gy1 = 50, 50, w - 140, h - 50
    d.rounded_rectangle([gx0, gy0, gx1, gy1], 14, fill=(9, 9, 12), outline=(70, 70, 80), width=2)
    # carte mère
    d.rectangle([90, 110, 520, 640], fill=(20, 20, 24), outline=(40, 40, 46), width=2)
    for i in range(4):
        d.rectangle([400 + i * 22, 170, 412 + i * 22, 400], fill=(28, 28, 32))
    # RAM Viper (2 barrettes noires + bord rouge)
    for i in (1, 3):
        d.rectangle([400 + i * 22, 160, 414 + i * 22, 410], fill=(10, 10, 12), outline=(60, 60, 66))
        d.rectangle([400 + i * 22, 160, 414 + i * 22, 172], fill=RED2)
    # pompe AIO
    d.ellipse([210, 210, 330, 330], fill=(16, 16, 20), outline=(60, 60, 70), width=3)
    # tubes
    d.line([300, 220, 360, 120, 470, 95], fill=(25, 25, 28), width=16, joint="curve")
    d.line([320, 245, 390, 135, 500, 110], fill=(25, 25, 28), width=16, joint="curve")
    # radiateur haut (360 mm)
    d.rectangle([70, 64, 600, 104], fill=(22, 22, 26), outline=(50, 50, 56))
    for x in range(80, 590, 9):
        d.line([x, 68, x, 100], fill=(34, 34, 38))
    # GPU (MSI Ventus 2X : 2 ventilateurs, noir/gris)
    d.rounded_rectangle([90, 470, 560, 560], 10, fill=(24, 24, 28), outline=(70, 70, 78), width=2)
    d.rectangle([90, 470, 560, 482], fill=(46, 46, 52))
    d.text((120, 500), "GEFORCE RTX 5070", font=F(26, "Bold"), fill=(205, 208, 215))
    d.rectangle([90, 556, 560, 564], fill=(60, 60, 66))
    # alim (cache)
    d.rectangle([60, 700, 600, 810], fill=(16, 16, 19), outline=(40, 40, 46))
    d.text((90, 735), "be quiet!  750W", font=F(24, "SemiBold"), fill=(110, 114, 124))
    # ventilateurs arrière + façade (vus de côté = anneaux)
    rings = [(560, 300, 52), (w - 80 - 120, 200, 0)]
    rings = [(84 + 0, 300, 0)]
    front = [(w - 200, 190 + k * 190, 78) for k in range(3)]
    for (cx, cy, r) in front:
        fan(d, cx, cy, r, None)
    rear = (130, 180, 50)
    fan(d, *rear, None)
    fan(d, 270, 270, 46, None, blades=0)
    # couche RGB
    L = rgb_ring_layer((w, h), front + [rear, (270, 270, 46)], ph)
    dl = ImageDraw.Draw(L)
    for i in range(30):  # bandeau lumineux GPU
        dl.line([94 + i * 15.5, 480, 108 + i * 15.5, 480], fill=hue(ph + i / 30) + (255,), width=4)
    for i in range(20):  # sous-carte (éclairage d'ambiance)
        dl.line([120 + i * 22, 660, 140 + i * 22, 660], fill=hue(ph + 0.5 + i / 20) + (180,), width=3)
    im = Image.alpha_composite(im, L)
    g = L.filter(ImageFilter.GaussianBlur(22))
    out = Image.new("RGBA", (w + 160, h + 160))
    out.alpha_composite(g.resize((w, h)), (80, 80))
    out.alpha_composite(g.resize((w, h)), (80, 80))
    sh = Image.new("RGBA", out.size)
    ImageDraw.Draw(sh).ellipse([110, h + 50, w + 50, h + 120], fill=(0, 0, 0, 160))
    out = Image.alpha_composite(sh.filter(ImageFilter.GaussianBlur(20)), out)
    out.alpha_composite(im, (80, 80))
    # reflet vitre
    ref = Image.new("RGBA", out.size)
    ImageDraw.Draw(ref).polygon([(150, 130), (300, 130), (150, 600)], fill=(255, 255, 255, 14))
    out.alpha_composite(ref)
    return out


def _canvas(w, h):
    im = Image.new("RGBA", (w, h)); return im, ImageDraw.Draw(im)


@functools.lru_cache(None)
def comp_cpu():
    im, d = _canvas(640, 640)
    d.rounded_rectangle([40, 40, 600, 600], 24, fill=(20, 70, 50), outline=(180, 150, 70), width=6)
    for i in range(14):
        for j in (0, 1):
            x = 80 + i * 35
            d.rectangle([x, 52 if j == 0 else 572, x + 14, 66 if j == 0 else 586], fill=(200, 170, 80))
    d.rounded_rectangle([110, 110, 530, 530], 30, fill=(190, 194, 202), outline=(230, 232, 238), width=4)
    # dégradé métallique
    g = Image.new("RGBA", (420, 420))
    gd = ImageDraw.Draw(g)
    for y in range(420):
        v = int(150 + 70 * math.sin(y / 420 * math.pi))
        gd.line([0, y, 420, y], fill=(v, v + 3, v + 8, 120))
    mask = Image.new("L", (420, 420)); ImageDraw.Draw(mask).rounded_rectangle([0, 0, 419, 419], 30, fill=255)
    im.paste(g, (110, 110), mask)
    d.text((320, 250), "RYZEN", font=F(64, "Black", True), fill=(40, 40, 46), anchor="mm")
    d.text((320, 320), "7  9800X3D", font=F(46, "Bold", True), fill=(40, 40, 46), anchor="mm")
    d.text((320, 390), "3D V-CACHE", font=F(26, "SemiBold"), fill=(80, 80, 88), anchor="mm")
    return glow_under(im, (255, 120, 40))


def glow_under(im, col, r=40):
    w, h = im.size
    out = Image.new("RGBA", (w + 200, h + 200))
    gl = Image.new("RGBA", out.size)
    ImageDraw.Draw(gl).ellipse([100, 100 + h * 0.15, 100 + w, 100 + h * 1.0], fill=col + (90,))
    out.alpha_composite(gl.filter(ImageFilter.GaussianBlur(r * 2)))
    out.alpha_composite(im, (100, 100))
    return out


@functools.lru_cache(None)
def comp_gpu():
    im, d = _canvas(980, 420)
    d.rounded_rectangle([20, 40, 960, 380], 30, fill=(22, 22, 26), outline=(80, 80, 90), width=3)
    d.polygon([(20, 40), (300, 40), (250, 90), (20, 90)], fill=(40, 40, 46))
    d.polygon([(960, 330), (700, 330), (660, 380), (960, 380)], fill=(40, 40, 46))
    fan(d, 290, 210, 150, (60, 60, 68))
    fan(d, 670, 210, 150, (60, 60, 68))
    d.text((480, 392), "MSI GEFORCE RTX 5070  VENTUS 2X OC  ·  12 GB GDDR7", font=F(22, "SemiBold"), fill=(170, 174, 184), anchor="mm")
    d.rectangle([20, 200, 34, 230], fill=(160, 160, 170))
    return glow_under(im, (118, 185, 0))


@functools.lru_cache(None)
def comp_ram():
    im, d = _canvas(900, 420)
    for k, y in enumerate((40, 230)):
        d.polygon([(40, y + 40), (120, y), (780, y), (860, y + 40), (860, y + 160), (40, y + 160)], fill=(16, 16, 19), outline=(70, 70, 78))
        d.polygon([(40, y + 40), (120, y), (300, y), (240, y + 60), (40, y + 60)], fill=RED2)
        d.text((420, y + 80), "VIPER  VENOM", font=F(42, "Black", True), fill=(225, 228, 234), anchor="mm")
        d.text((420, y + 125), "DDR5 · 6000 MT/s · 16 GB", font=F(22, "SemiBold"), fill=(150, 154, 164), anchor="mm")
        for i in range(34):
            d.rectangle([60 + i * 23, y + 162, 72 + i * 23, y + 180], fill=(200, 170, 80))
    return glow_under(im, RED)


def comp_aio(step, steps=36):
    return _comp_aio(step % steps)


@functools.lru_cache(None)
def _comp_aio(step):
    ph = step / 36
    im, d = _canvas(1000, 470)
    d.rounded_rectangle([20, 40, 980, 330], 16, fill=(20, 20, 24), outline=(70, 70, 78), width=3)
    centers = [(180, 185, 125), (500, 185, 125), (820, 185, 125)]
    for c in centers:
        fan(d, *c, None)
    d.rounded_rectangle([400, 350, 600, 450], 20, fill=(22, 22, 26), outline=(70, 70, 78), width=3)
    d.text((500, 400), "ARCTIC", font=F(28, "Bold"), fill=(200, 200, 210), anchor="mm")
    L = rgb_ring_layer(im.size, centers, ph)
    ImageDraw.Draw(L).rounded_rectangle([404, 354, 596, 446], 18, outline=hue(ph + 0.3) + (255,), width=5)
    im = Image.alpha_composite(im, L)
    out = Image.new("RGBA", im.size)
    out.alpha_composite(L.filter(ImageFilter.GaussianBlur(25)))
    out.alpha_composite(L.filter(ImageFilter.GaussianBlur(25)))
    out.alpha_composite(im)
    return out


@functools.lru_cache(None)
def comp_mobo():
    im, d = _canvas(640, 720)
    d.rectangle([30, 30, 610, 690], fill=(22, 22, 26), outline=(60, 60, 68), width=3)
    d.rectangle([50, 50, 170, 330], fill=(40, 40, 46))          # VRM / IO
    d.rectangle([230, 120, 410, 300], fill=(32, 32, 36), outline=(150, 150, 160), width=3)  # socket AM5
    d.text((320, 210), "AM5", font=F(40, "Bold"), fill=(170, 170, 180), anchor="mm")
    for i in range(4):
        d.rectangle([450 + i * 28, 70, 466 + i * 28, 420], fill=(14, 14, 16), outline=(70, 70, 78))
    d.rectangle([60, 400, 420, 430], fill=(52, 52, 58))           # PCIe x16
    d.rectangle([60, 500, 420, 530], fill=(36, 36, 40))
    for y in (350, 460, 570):                                      # M.2
        d.rectangle([90, y, 400, y + 22], fill=(56, 56, 62))
    d.rectangle([450, 470, 590, 610], fill=(40, 40, 46))
    d.text((520, 540), "B650", font=F(30, "Bold"), fill=(200, 120, 40), anchor="mm")
    d.text((320, 655), "GIGABYTE B650 GAMING X AX V2", font=F(24, "Bold"), fill=(180, 184, 194), anchor="mm")
    for k in range(3):  # antennes wifi
        d.arc([60, 40 + k * 0, 160, 140], 200 + k * 10, 340 - k * 10, fill=CYAN, width=3)
    return glow_under(im, (255, 140, 40))


@functools.lru_cache(None)
def comp_ssd():
    im, d = _canvas(940, 240)
    d.rounded_rectangle([30, 40, 910, 200], 10, fill=(18, 40, 30), outline=(90, 120, 100), width=3)
    d.rectangle([30, 60, 60, 180], fill=(200, 170, 80))
    d.rectangle([110, 55, 860, 185], fill=(240, 240, 244))
    d.text((485, 100), "KIOXIA  EXCERIA PLUS G3", font=F(36, "Black", True), fill=(30, 30, 36), anchor="mm")
    d.text((485, 150), "NVMe · PCIe 4.0 · 1 To", font=F(24, "SemiBold"), fill=(90, 90, 100), anchor="mm")
    d.ellipse([880, 108, 904, 132], outline=(160, 160, 170), width=3)
    return glow_under(im, CYAN)


@functools.lru_cache(None)
def comp_psu():
    im, d = _canvas(720, 460)
    d.rounded_rectangle([30, 30, 690, 430], 18, fill=(18, 18, 21), outline=(70, 70, 78), width=3)
    fan(d, 250, 230, 160, (60, 60, 68))
    for k in range(9):
        d.ellipse([250 - 160 + k * 18, 230 - 160 + k * 18, 250 + 160 - k * 18, 230 + 160 - k * 18], outline=(50, 50, 56), width=2)
    d.text((540, 170), "be quiet!", font=F(40, "Bold"), fill=(230, 230, 236), anchor="mm")
    d.text((540, 230), "PURE POWER 13 M", font=F(26, "SemiBold"), fill=(170, 174, 184), anchor="mm")
    d.text((540, 300), "750W", font=F(64, "Black", True), fill=(255, 140, 40), anchor="mm")
    d.text((540, 360), "80 PLUS GOLD", font=F(22, "SemiBold"), fill=(210, 180, 90), anchor="mm")
    return glow_under(im, (255, 140, 40))


@functools.lru_cache(None)
def monitor_sprite(shot_path):
    im, d = _canvas(1000, 680)
    d.rounded_rectangle([20, 20, 980, 560], 14, fill=(10, 10, 12), outline=(60, 60, 68), width=4)
    sc = Image.open(shot_path).convert("RGB").resize((936, 526))
    im.paste(sc, (32, 30))
    d.polygon([(440, 560), (560, 560), (590, 640), (410, 640)], fill=(26, 26, 30))
    d.rounded_rectangle([340, 636, 660, 660], 8, fill=(30, 30, 34))
    return glow_under(im, (120, 60, 255), r=50)


def dark_bg_base():
    y, x = np.mgrid[0:H, 0:W].astype(np.float32)
    base = np.zeros((H, W, 3), np.float32)
    base[:] = np.array(BG, np.float32)
    # grille subtile
    grid = ((x % 80 < 1.2) | (y % 80 < 1.2)).astype(np.float32) * 7
    base += grid[..., None]
    return base
