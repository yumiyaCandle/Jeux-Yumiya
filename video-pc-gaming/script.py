# -*- coding: utf-8 -*-
"""Scénario v3 — montage cinématographique (plans multiples synchronisés sur la voix).

Beat = fond (ou LISTE de plans, qui s'enchaînent au rythme des phrases) + overlays + phrases.
Plans :
  "c:<clip>@<s>"           extrait de bande-annonce officielle (Steam)
  "i:<capture>"            capture officielle (Steam), mouvement de caméra
  "p:<photo>"              photo produit (fournie), plan large, halo + reflet
  "pz:<photo>:x0,y0,x1,y1" gros plan sur une zone de la photo (zoom lent + mise au point)
  "fn:<scène>"             illustration ORIGINALE façon battle royale (pas une capture)
  "split:<clip>@<s>"       simulation visuelle réglages compétitifs / élevés (signalée)
  "dark" | "gta"           fonds animés
Statut des chiffres : "m" mesuré (source citée) · "e" estimation · "fg" génération d'images.
"""


def B(bg, ov=None, *s, dur=None, dim=None, energy=None, labels=None):
    if labels is None and isinstance(bg, list):
        labels = LABELS.get("|".join(bg))
    return {"bg": bg, "ov": ov or [], "s": list(s), "dur": dur, "dim": dim, "energy": energy, "labels": labels}


LABELS = {}


def L(shots, labels):
    LABELS["|".join(shots)] = labels


def chapter(num, title, sub, bg="dark"):
    return B(bg, [{"k": "chapter", "num": num, "title": title, "sub": sub}], dur=3.4, dim=0.75, energy=1.0)


def shot_times(n, sent, dur):
    """instants de changement de plan (relatifs au beat) : calés sur les phrases quand c'est possible"""
    if n <= 1:
        return [0.0]
    if sent and n <= len(sent):
        return [0.0] + [sent[round(i * len(sent) / n)] - 0.15 for i in range(1, n)]
    return [dur * i / n for i in range(n)]


def chip_times(n, sent, dur):
    """apparition progressive des caractéristiques pendant la narration"""
    span = max(2.0, dur - 2.5)
    return [0.9 + span * 0.8 * i / max(1, n) for i in range(n)]


def chips(title, sub, items):
    return {"k": "chips", "title": title, "sub": sub, "items": items}




# ------------------------------------------------- légendes affichées à chaque changement de plan
_F, _W, _B = "c:fh6_1@", "c:wz_0@", "c:bc_0@"
L([_F + "0.2", _B + "36.2", _W + "28.4", _F + "43.2"], ["Forza Horizon 6 · champ de fleurs et mont Fuji", "Bodycam · réalisme Unreal Engine 5", "Warzone · parachutage sur la ville", "Forza Horizon 6 · Tokyo de nuit"])
L([_F + "20.1", _W + "36.2", _B + "93.2", _F + "75.4"], ["Forza Horizon 6 · voitures japonaises", "Warzone · chute entre les immeubles", "Bodycam · vue caméra-piéton", "Forza Horizon 6 · rallye en forêt d'automne"])
L(["p:cpu", "pz:cpu:0.52,0.68,0.92,0.88", "pz:cpu:0.0,0.12,0.42,0.42"], ["AMD Ryzen 7 9800X3D · boîte et processeur", "Gros plan · la puce Ryzen 7 9800X3D", "Gros plan · la technologie 3D V-Cache"])
L(["p:gpu", "pz:gpu:0.44,0.45,1.0,0.88", "pz:gpu:0.0,0.25,0.25,0.5"], ["MSI GeForce RTX 5070 Ventus 2X OC", "Gros plan · le double ventilateur", "Gros plan · 12 Go de mémoire GDDR7"])
L(["pz:gpu:0.0,0.0,0.62,0.62", "pz:gpu:0.38,0.7,0.62,1.0"], ["La boîte MSI Ventus 2X · 12 Go GDDR7", "Gros plan · la carte et son équerre de sortie"])
L(["p:ram", "pz:ram:0.0,0.0,0.4,0.48", "pz:ram:0.55,0.0,1.0,0.48"], ["Patriot Viper Venom · 2 × 16 Go", "Gros plan · le dissipateur Viper", "Gros plan · DDR5 à 6000 MT/s"])
L(["p:mobo", "pz:mobo:0.6,0.12,0.86,0.42", "pz:mobo:0.74,0.1,0.92,0.45", "pz:mobo:0.5,0.45,0.98,0.95"], ["Gigabyte B650 Gaming X AX V2", "Gros plan · le socket AM5 du processeur", "Gros plan · les emplacements de mémoire DDR5", "Gros plan · la zone PCIe et les SSD M.2"])
L(["p:ssd", "pz:ssd:0.0,0.0,0.45,1.0", "pz:ssd:0.5,0.2,1.0,0.8"], ["Kioxia Exceria Plus G3 · 1 To", "Gros plan · l'étiquette Kioxia", "Gros plan · NVMe en PCIe 4.0"])
L(["p:psu", "pz:psu:0.0,0.0,0.2,0.22", "pz:psu:0.44,0.38,0.92,1.0"], ["be quiet! Pure Power 13 M · 750 W", "Gros plan · la certification 80 PLUS Gold", "Gros plan · le ventilateur silencieux"])
L(["p:aio", "pz:aio:0.0,0.0,0.25,1.0", "pz:aio:0.06,0.0,0.6,1.0", "pz:aio:0.6,0.0,0.92,1.0"], ["Arctic Liquid Freezer III Pro 360 A-RGB", "Gros plan · le radiateur de 38 mm", "Gros plan · les 3 ventilateurs P12 Pro A-RGB", "Gros plan · la pompe posée sur le CPU"])
L(["pz:case:0.45,0.06,0.95,0.86", "pz:case:0.03,0.04,0.52,0.72", "pz:case:0.55,0.84,0.95,1.0"], ["Gros plan · la façade et ses 3 ventilateurs ARGB", "Gros plan · le panneau vitré", "Gros plan · la connectique avant"])
L(["p:mo27q3", "pz:mo27q3:0.0,0.0,1.0,0.64", "pz:mo27q3:0.0,0.38,0.6,0.64"], ["Gigabyte MO27Q3 · ton écran principal", "Gros plan · la dalle QD-OLED en 1440p", "Gros plan · 0,03 ms · 360 Hz · HDR True Black 400"])
L(["p:aoc", "pz:aoc:0.0,0.0,1.0,0.48", "pz:aoc:0.1,0.45,0.9,1.0"], ["AOC C27G2ZU/BK · ton écran secondaire", "Gros plan · la dalle VA incurvée 1500R", "Gros plan · le pied réglable"])
L(["fn:run", "fn:build", "fn:fight"], ["Illustration · déplacements rapides", "Illustration · construction", "Illustration · combat"])
L(["fn:run", "fn:build"], ["Illustration · fluidité à 360 Hz", "Illustration · constructions bien nettes"])
L([_W + "3.2", _W + "28.4", _W + "36.2"], ["Warzone · vue sur la ville", "Warzone · parachutage", "Warzone · chute entre les immeubles"])
L([_W + "52.2", _W + "61.3", _W + "108.4"], ["Warzone · combat rapproché", "Warzone · véhicules", "Warzone · explosions"])
L([_W + "15.2", _W + "19.2", _W + "69.2"], ["Warzone · rues étroites", "Warzone · combat au temple", "Warzone · engagement à distance"])
L([_W + "77.2", _W + "88.2"], ["Warzone · visée à la lunette", "Warzone · lunette de précision"])
L([_W + "119.2", _W + "54.2"], ["Warzone · saut en wingsuit", "Warzone · combat"])
L([_B + "6.2", _B + "13.2", _B + "36.2", _B + "93.2"], ["Bodycam · objectif grand angle", "Bodycam · tranchées", "Bodycam · combat en intérieur", "Bodycam · bâtiment en ruine"])
L([_B + "11.2", _B + "31.2", _B + "49.2"], ["Bodycam · tranchées", "Bodycam · combat en intérieur", "Bodycam · forêt dévastée"])
L([_B + "38.2", _B + "90.2", _B + "111.2"], ["Bodycam · éclairage dynamique Lumen", "Bodycam · décors photoréalistes", "Bodycam · couloirs sombres"])
L([_B + "55.2", _B + "88.2"], ["Bodycam · tunnel éclairé par le feu", "Bodycam · progression en intérieur"])
L([_B + "114.2", _B + "117.2"], ["Bodycam · tranchées", "Bodycam · progression"])
L([_F + "0.2", _F + "3.1", _F + "6.2", _F + "68.2"], ["Forza Horizon 6 · champ de fleurs et mont Fuji", "Forza Horizon 6 · cerisiers puis port de nuit", "Forza Horizon 6 · pagode et forêt", "Forza Horizon 6 · coucher de soleil sur le Fuji"])
L([_F + "7.3", _F + "50.3"], ["Forza Horizon 6 · route de montagne", "Forza Horizon 6 · touge d'automne"])
L(["i:fh6_05", _F + "43.1", _F + "74.1"], ["Forza Horizon 6 · Tokyo de nuit", "Forza Horizon 6 · rue aux néons", "Forza Horizon 6 · carrefour illuminé"])
L([_F + "36.2", _F + "30.2", "i:fh6_07"], ["Forza Horizon 6 · drift en forêt", "Forza Horizon 6 · murs de neige", "Forza Horizon 6 · cerisiers et mont Fuji"])
L(["i:fh6_00", _F + "12.1"], ["Forza Horizon 6 · reflets sur la carrosserie", "Forza Horizon 6 · port de nuit"])
L([_F + "73.2", _F + "84.6"], ["Forza Horizon 6 · BMW en ville", "Forza Horizon 6 · festival de nuit"])
L([_W + "105.2", _B + "36.2"], ["Warzone", "Bodycam"])
L([_F + "75.1", _F + "36.1"], ["Forza Horizon 6 · rallye en forêt", "Forza Horizon 6 · drift"])
L([_F + "0.2", _B + "93.2", _F + "84.2"], ["Forza Horizon 6", "Bodycam", "Forza Horizon 6 · festival de nuit"])

# Version allégée : une légende seulement quand elle apporte une information (None = pas de légende)
for _k in list(LABELS):
    LABELS[_k] = None
L(["p:cpu", "pz:cpu:0.52,0.68,0.92,0.88", "pz:cpu:0.0,0.12,0.42,0.42"], [None, "Gros plan · la puce Ryzen 7 9800X3D", "Gros plan · la technologie 3D V-Cache"])
L(["p:gpu", "pz:gpu:0.44,0.45,1.0,0.88", "pz:gpu:0.0,0.25,0.25,0.5"], [None, "Gros plan · le double ventilateur", "Gros plan · 12 Go de mémoire GDDR7"])
L(["p:mobo", "pz:mobo:0.6,0.12,0.86,0.42", "pz:mobo:0.74,0.1,0.92,0.45", "pz:mobo:0.5,0.45,0.98,0.95"], [None, "Gros plan · le socket AM5 du processeur", "Gros plan · les emplacements de mémoire DDR5", "Gros plan · la zone PCIe et les SSD M.2"])
L(["p:psu", "pz:psu:0.0,0.0,0.2,0.22", "pz:psu:0.44,0.38,0.92,1.0"], [None, "Gros plan · la certification 80 PLUS Gold", None])
L(["p:aio", "pz:aio:0.0,0.0,0.25,1.0", "pz:aio:0.06,0.0,0.6,1.0", "pz:aio:0.6,0.0,0.92,1.0"], [None, "Gros plan · le radiateur de 38 mm", "Gros plan · les 3 ventilateurs P12 Pro A-RGB", "Gros plan · la pompe posée sur le CPU"])
L(["pz:case:0.45,0.06,0.95,0.86", "pz:case:0.03,0.04,0.52,0.72", "pz:case:0.55,0.84,0.95,1.0"], ["Gros plan · la façade et ses 3 ventilateurs ARGB", None, None])
L(["p:mo27q3", "pz:mo27q3:0.0,0.0,1.0,0.64", "pz:mo27q3:0.0,0.38,0.6,0.64"], [None, None, "Gros plan · 0,03 ms · 360 Hz · HDR True Black 400"])
L(["p:aoc", "pz:aoc:0.0,0.0,1.0,0.48", "pz:aoc:0.1,0.45,0.9,1.0"], [None, "Gros plan · la dalle VA incurvée 1500R", None])
L([_W + "77.2", _W + "88.2"], ["Warzone · visée à la lunette", None])
L([_B + "38.2", _B + "90.2", _B + "111.2"], ["Bodycam · éclairage dynamique Lumen", None, None])
L(["i:fh6_00", _F + "12.1"], ["Forza Horizon 6 · reflets sur la carrosserie", None])

FH = "c:fh6_1@"
WZ = "c:wz_0@"
BC = "c:bc_0@"

# zones de gros plan sur les photos (fractions de l'image : x0, y0, x1, y1)
ZONES = {
    "cpu_text": ("cpu", "0.52,0.68,0.92,0.88"), "cpu_chip": ("cpu", "0.45,0.56,0.97,0.98"), "cpu_vcache": ("cpu", "0.0,0.12,0.42,0.42"),
    "gpu_fans": ("gpu", "0.44,0.45,1.0,0.88"), "gpu_box": ("gpu", "0.0,0.0,0.62,0.62"), "gpu_mem": ("gpu", "0.0,0.25,0.25,0.5"), "gpu_io": ("gpu", "0.38,0.7,0.62,1.0"),
    "ram_logo": ("ram", "0.0,0.0,0.4,0.48"), "ram_viper": ("ram", "0.55,0.0,1.0,0.48"),
    "mobo_socket": ("mobo", "0.6,0.12,0.86,0.42"), "mobo_dimm": ("mobo", "0.74,0.1,0.92,0.45"), "mobo_m2": ("mobo", "0.5,0.45,0.98,0.95"), "mobo_box": ("mobo", "0.0,0.15,0.45,1.0"),
    "ssd_label": ("ssd", "0.0,0.0,0.45,1.0"), "ssd_nvme": ("ssd", "0.5,0.2,1.0,0.8"),
    "psu_gold": ("psu", "0.0,0.0,0.2,0.22"), "psu_fan": ("psu", "0.44,0.38,0.92,1.0"), "psu_box": ("psu", "0.0,0.0,0.65,0.75"),
    "aio_rad": ("aio", "0.0,0.0,0.25,1.0"), "aio_fans": ("aio", "0.06,0.0,0.6,1.0"), "aio_pump": ("aio", "0.6,0.0,0.92,1.0"),
    "case_front": ("case", "0.45,0.06,0.95,0.86"), "case_glass": ("case", "0.03,0.04,0.52,0.72"), "case_io": ("case", "0.55,0.84,0.95,1.0"),
    "mo_screen": ("mo27q3", "0.0,0.0,1.0,0.64"), "mo_specs": ("mo27q3", "0.0,0.38,0.6,0.64"), "mo_stand": ("mo27q3", "0.2,0.6,0.8,1.0"),
    "aoc_screen": ("aoc", "0.0,0.0,1.0,0.48"), "aoc_stand": ("aoc", "0.1,0.45,0.9,1.0"),
}


def Z(k):
    p, r = ZONES[k]
    return f"pz:{p}:{r}"


SCENES = []

# 1 — INTRODUCTION
SCENES.append(("intro", [
    B([FH + "0.2", BC + "36.2", WZ + "28.4", FH + "43.2"], [{"k": "kicker", "text": "FORTNITE · CALL OF DUTY · BODYCAM · FORZA HORIZON 6 · GTA VI"}], dur=8.0, dim=0.05, energy=1.0),
    B([FH + "20.1", WZ + "36.2", BC + "93.2", FH + "75.4"], [],
      "Imagine un instant.",
      "Le mont Fuji au loin, une route de montagne, et une voiture qui n'attend que toi.",
      "Tout ça sur un écran OLED à 360 hertz, avec des noirs parfaits et des couleurs éclatantes.",
      "Ce n'est pas un rêve : c'est ce que ton futur PC gaming va te permettre de vivre.", dim=0.05, energy=1.0),
    B("p:hero", [{"k": "title", "text": "TON FUTUR PC GAMING", "sub": "Ryzen 7 9800X3D  ·  RTX 5070  ·  OLED 360 Hz"}, {"k": "tag", "text": "VISUEL D'ILLUSTRATION · image générée"}],
      "On va découvrir chaque composant de ta machine, puis voir ce qu'elle donne dans tes jeux : Fortnite, Call of Duty, Bodycam, Forza Horizon 6, et bientôt GTA VI.",
      "Avec de vrais benchmarks, des estimations clairement signalées, et sans rien enjoliver.",
      "Installe-toi. On commence.", energy=0.95),
]))

# 2 — LA CONFIGURATION
SCENES.append(("config", [
    chapter("01", "LA CONFIGURATION", "Huit composants, une machine cohérente"),
    B("dark", [{"k": "grid"}],
      "Voici ta configuration : huit composants choisis pour former un ensemble cohérent, du processeur jusqu'au boîtier.", energy=1.0),
    B("dark", [{"k": "flow"}],
      "Quand tu lances un jeu, le SSD charge les fichiers dans la mémoire vive. Le processeur calcule la partie, la physique, les joueurs, et prépare le travail de la carte graphique.",
      "La carte graphique dessine chaque image et l'envoie à l'écran. L'alimentation fournit l'énergie, et le watercooling évacue la chaleur.", energy=0.8),
]))

# 3 — LES COMPOSANTS EN DÉTAIL (gros plans synchronisés)
SCENES.append(("composants", [
    chapter("02", "LES COMPOSANTS EN DÉTAIL", "Rôle · fonctionnement · intérêt en jeu"),
    B(["p:cpu", Z("cpu_text"), Z("cpu_vcache")], [chips("AMD Ryzen 7 9800X3D", "PROCESSEUR · SOCKET AM5", ["8 cœurs / 16 threads · Zen 5", "Jusqu'à 5,2 GHz", "96 Mo de cache L3", "Technologie 3D V-Cache"])],
      "On commence par le cerveau de la machine : le Ryzen 7 9800X3D.",
      "Sous son capot métallique se cache une particularité rare : une couche de mémoire cache empilée directement contre ses huit cœurs.",
      "C'est la technologie 3D V-Cache, et c'est elle qui fait de ce processeur une référence pour le jeu."),
    B("dark", [{"k": "vcache"}],
      "AMD ajoute 64 mégaoctets de cache contre la puce : 96 mégaoctets au total.",
      "Cette mémoire ultra-rapide, placée juste à côté des cœurs, évite d'aller chercher les données dans la mémoire vive, bien plus lente.",
      "Résultat : plus d'images par seconde, et des images plus régulières."),
    B("dark", [{"k": "chart", "title": "La preuve par la mesure · test processeur", "sub": "Counter-Strike 2 · FPS moyens · CPU testés avec une RTX 4090 pour supprimer la limite graphique",
                "rows": [("Ryzen 7 9800X3D", 668, None, "m", "TechSpot", "1080p · RTX 4090 · RT non · DLSS non · préréglage non précisé dans l'extrait consulté"),
                         ("Ryzen 7 7800X3D", 591, None, "m", "TechSpot", "1080p · RTX 4090 · même banc · le 9800X3D est 13 % devant")], "max": 760,
                "src": "Source : TechSpot, « AMD Ryzen 7 9800X3D vs 7800X3D » · test processeur, pas un résultat de ta RTX 5070"}],
      "Dans les tests de TechSpot, avec une RTX 4090, le 9800X3D atteint 668 images par seconde dans Counter-Strike 2 en 1080p : 13 pour cent de plus que le 7800X3D, l'ancien champion.",
      "C'est l'un des meilleurs processeurs gaming du marché."),
    B(["p:gpu", Z("gpu_fans"), Z("gpu_mem")], [chips("MSI RTX 5070 Ventus 2X OC", "CARTE GRAPHIQUE · NVIDIA BLACKWELL", ["12 Go de GDDR7", "DLSS 4 · génération d'images", "Ray tracing · Reflex", "≈ 250 W max · double ventilateur"])],
      "La carte graphique, maintenant : la MSI RTX 5070 Ventus, légèrement overclockée d'usine.",
      "Son double ventilateur refroidit une puce Blackwell épaulée par 12 gigaoctets de mémoire GDDR7, le tout pour environ 250 watts.",
      "Selon TechPowerUp, elle est environ 20 pour cent devant une RTX 4070 en 1440p, au niveau d'une RTX 4070 Super. Une carte taillée pour la définition de ton écran."),
    B("dark", [{"k": "dlss4"}],
      "Sa grande force, c'est le DLSS 4. Prenons un jeu qui tourne à 60 images par seconde en 1440p natif : chaque pixel de chaque image est calculé par la carte.",
      "Avec la Super Résolution en mode Qualité, la carte ne calcule qu'environ 44 pour cent des pixels, puis une IA reconstruit l'image en 1440p. Ce sont de vraies images en plus, et le jeu réagit plus vite.",
      "La Frame Generation va plus loin : entre deux images calculées, l'IA en invente une. Le compteur double presque, mais la réactivité reste celle des images calculées, avec un peu de latence en plus.",
      "Enfin, la Multi Frame Generation, réservée aux RTX 50, crée jusqu'à trois images pour une seule calculée. Parfaite pour remplir un écran 360 hertz, à condition de partir d'au moins 60 images réelles.",
      "Retiens bien ceci : FPS affichés et FPS calculés ne sont pas la même chose. Dans cette vidéo, ils sont toujours séparés.", energy=0.85),
    B([Z("gpu_box"), Z("gpu_io")], [chips("12 Go de VRAM", "LE POINT DE VIGILANCE", ["Suffisant dans la grande majorité des jeux en 1440p", "Limite possible : textures max + ray tracing très poussé", "Constat TechSpot : Indiana Jones en path tracing", "Solution : baisser d'un cran les textures"])],
      "Un mot honnête sur les 12 gigaoctets de mémoire vidéo : c'est suffisant dans la grande majorité des jeux en 1440p. Mais avec textures maximales et ray tracing très poussé, elle peut devenir une limite, comme l'a constaté TechSpot dans Indiana Jones.",
      "Il suffit alors de baisser d'un cran les textures."),
    B("dark", [{"k": "duo"}],
      "Pourquoi ce duo est-il si intéressant ?",
      "En jeu compétitif, réglages bas, c'est le processeur qui fixe la limite. Et c'est là que le 9800X3D excelle.",
      "Dans un jeu très beau, c'est l'inverse : la RTX 5070 et son DLSS prennent le relais."),
    B(["p:ram", Z("ram_logo"), Z("ram_viper")], [chips("Patriot Viper Venom", "MÉMOIRE VIVE · 32 GO", ["2 × 16 Go · double canal", "DDR5 · 6000 MT/s", "Profil EXPO dans le BIOS"])],
      "La mémoire vive : deux barrettes Patriot Viper Venom de 16 gigaoctets, en DDR5 à 6000 mégahertz.",
      "Trente-deux gigaoctets, c'est l'idéal aujourd'hui : les jeux récents dépassent souvent 16 avec Discord ouvert.",
      "Et 6000 mégahertz est la fréquence idéale des Ryzen 9000, avec le profil EXPO à activer dans le BIOS."),
    B(["p:mobo", Z("mobo_socket"), Z("mobo_dimm"), Z("mobo_m2")], [chips("Gigabyte B650 Gaming X AX V2", "CARTE MÈRE · ATX · AM5", ["Socket AM5 · Ryzen 7000 / 8000 / 9000", "4 emplacements DDR5", "3 emplacements M.2 · LAN 2,5 Gb", "Wi-Fi 6E + Bluetooth"])],
      "La carte mère Gigabyte, c'est la colonne vertébrale du PC : elle relie tous les composants.",
      "Socket AM5, DDR5, trois emplacements M.2, réseau 2,5 gigabits, Wi-Fi 6E et Bluetooth intégrés.",
      "Et la plateforme AM5 est faite pour durer."),
    B(["p:ssd", Z("ssd_label"), Z("ssd_nvme")], [chips("Kioxia Exceria Plus G3", "SSD NVMe M.2 · 1 To", ["PCIe 4.0 x4", "Jusqu'à 5 000 Mo/s en lecture*", "*donnée constructeur"])],
      "Le SSD Kioxia Exceria Plus G3 est un modèle NVMe en PCIe 4.0, annoncé jusqu'à 5000 mégaoctets par seconde en lecture.",
      "Démarrage de Windows et chargements rapides, sans aucun disque mécanique à attendre."),
    B("dark", [{"k": "storage"}],
      "Kioxia annonce 5000 mégaoctets par seconde en lecture et 3900 en écriture : environ neuf fois un SSD SATA, et des dizaines de fois un disque dur. En jeu, les chargements dépendent aussi du processeur et du jeu lui-même.",
      "Côté place, un téraoctet, c'est environ 931 gigaoctets affichés par Windows. Forza Horizon 6 en demande à lui seul 160 sur PC, et Call of Duty peut dépasser la centaine.",
      "Avec Windows et Fortnite, il te restera un peu plus de la moitié. Et si un jour ça ne suffit plus, ta carte mère a encore deux emplacements libres pour un second SSD."),
    B(["p:psu", Z("psu_gold"), Z("psu_fan")], [chips("be quiet! Pure Power 13 M", "ALIMENTATION · 750 W", ["80 PLUS Gold · modulaire", "ATX 3.1 · connecteur 12V-2x6", "Marge confortable pour ta config"])],
      "Enfin, l'alimentation be quiet! Pure Power 13 M de 750 watts : 80 Plus Gold, modulaire, et compatible ATX 3.1.",
      "Avec une carte graphique limitée à environ 250 watts, et un processeur de 120 watts de TDP, la marge est confortable."),
    B(["p:aio", Z("aio_rad"), Z("aio_fans"), Z("aio_pump")], [chips("Arctic Liquid Freezer III Pro 360 A-RGB", "WATERCOOLING TOUT-EN-UN", ["Radiateur 360 mm · 38 mm d'épaisseur", "3 ventilateurs P12 Pro A-RGB", "Pompe PWM + ventilateur VRM"])],
      "Côté refroidissement : l'Arctic Liquid Freezer 3 Pro de 360 millimètres.",
      "Un watercooling tout-en-un, avec un radiateur de 38 millimètres d'épaisseur et trois ventilateurs RGB de 120 millimètres."),
    B("dark", [{"k": "loop"}],
      "La pompe, posée sur le processeur, absorbe sa chaleur grâce à un liquide en boucle fermée.",
      "Le liquide chaud rejoint le radiateur, où les trois ventilateurs soufflent l'air à travers de fines ailettes et évacuent la chaleur.",
      "Refroidi, il revient vers le processeur, en continu."),
    B("p:case", [{"k": "airflow"}],
      "Le boîtier Corsair FRAME 4000D complète l'ensemble. Il est livré avec trois ventilateurs de 120 millimètres en façade, qui aspirent l'air frais à travers la façade perforée.",
      "Si le radiateur est monté au sommet, comme c'est le plus courant, ses trois ventilateurs rejettent l'air chaud vers le haut. À l'arrière, pas de ventilateur fourni : la grille laisse simplement sortir le reste.",
      "Six ventilateurs en tout, et de la place : jusqu'à 405 millimètres pour une carte graphique."),
    B("rgbpc", [{"k": "rgbpc"}],
      "Côté lumière, seuls les ventilateurs du boîtier et le watercooling s'illuminent, et c'est toi qui choisis l'ambiance.",
      "Noir et violet, pour une ambiance sombre.",
      "Bleu glacier, plus froid.",
      "Blanc pur, très épuré.",
      "Ou arc-en-ciel, si tu veux du spectacle.",
      "La mémoire, elle, reste sobre : sans RGB.", dim=0.0, energy=0.9),
]))

# 3 bis — TEMPÉRATURES & DURABILITÉ
SCENES.append(("temps", [
    chapter("00", "TEMPÉRATURES & DURABILITÉ", "Des heures de jeu, sans souci"),
    B("dark", [{"k": "thermo"}],
      "Comment ton PC va-t-il se comporter après plusieurs heures de jeu ? Voici des valeurs indicatives, issues de tests publiés et de retours d'utilisateurs, pas des mesures faites sur ta machine.",
      "Avec un watercooling de 360 millimètres, un 9800X3D tourne en général entre 55 et 70 degrés en jeu, avec des pointes possibles vers 80. Sa limite fixée par AMD est de 95 degrés.",
      "Pour la carte graphique, attention : ta Ventus 2X n'a pas été testée par ces sources. TechPowerUp relève 77 degrés sur la Founders Edition de Nvidia, et 62 sur une MSI Gaming Trio, bien plus massive. Ces chiffres donnent seulement un ordre d'idée.",
      "Les ventilateurs n'accélèrent que lorsque c'est nécessaire : c'est pour ça qu'un bon refroidissement rend aussi le PC plus silencieux."),
    B("dark", [{"k": "power"}],
      "Côté consommation, TechPowerUp mesure environ 230 watts en jeu sur une RTX 5070 Founders Edition, et environ 65 watts en moyenne pour le 9800X3D.",
      "Avec le reste des composants, j'estime l'ensemble à environ 350 watts. À la prise, avec un rendement proche de 90 pour cent, cela ferait autour de 390 watts.",
      "Ton alimentation de 750 watts travaille donc à un peu moins de la moitié de sa capacité : c'est là qu'une alimentation 80 Plus Gold est la plus efficace et la plus silencieuse."),
    B("dark", [{"k": "care"}],
      "Pour que tout reste frais pendant des années, l'entretien est simple.",
      "Tous les un à deux mois, PC éteint, dépoussière les filtres, le radiateur et les ventilateurs avec une bombe d'air sec.",
      "Le watercooling Arctic est un circuit fermé : il n'y a jamais de liquide à ajouter. Vérifie simplement, de temps en temps, que la pompe tourne normalement."),
    B("dark", [{"k": "alerts"}],
      "Les signes qui doivent t'alerter : un processeur souvent au-dessus de 90 degrés en jeu, des chutes de FPS soudaines, des ventilateurs bloqués à fond, ou un bruit inhabituel de la pompe.",
      "Dans ce cas, un dépoussiérage ou un réglage de la courbe des ventilateurs dans le BIOS suffit souvent."),
]))

# 4 — LES DEUX ÉCRANS
SCENES.append(("ecrans", [
    chapter("03", "TES DEUX ÉCRANS", "Gigabyte MO27Q3  ·  AOC C27G2ZU/BK"),
    B(["p:mo27q3", Z("mo_screen"), Z("mo_specs")], [chips("Gigabyte MO27Q3", "ÉCRAN PRINCIPAL · QD-OLED", ["2560 × 1440 · 360 Hz", "0,03 ms GtG*", "27\" annoncés · ≈ 26,7\" visibles*", "*fiche Gigabyte"])],
      "Une machine pareille mérite un écran à sa hauteur.",
      "Ton écran principal, le Gigabyte OLED : une dalle QD-OLED en 2560 par 1440, à 360 hertz, et 0,03 milliseconde de temps de réponse annoncé."),
    B("dark", [{"k": "oled"}],
      "Sur un LCD, un rétroéclairage reste allumé : les noirs sont en réalité gris foncé.",
      "Sur un OLED, chaque pixel s'éteint complètement : noirs parfaits, contraste quasi infini, couleurs éclatantes."),
    B("dark", [{"k": "hz"}],
      "Et puis il y a les 360 hertz : jusqu'à 360 images différentes par seconde.",
      "À 60 hertz, une image reste affichée 16,7 millisecondes. À 240 hertz, comme ton écran AOC, 4,2. Et à 360 hertz, seulement 2,8.",
      "Dans Fortnite ou Warzone : des mouvements ultra fluides, des adversaires plus lisibles, et un affichage plus réactif."),
    B("dark", [{"k": "vrr"}],
      "Autre atout de l'OLED : un temps de réponse annoncé de 0,03 milliseconde. Les pixels changent presque instantanément, sans traînée derrière les objets en mouvement.",
      "Et grâce au VRR, compatible G-Sync et FreeSync Premium Pro, l'écran suit la carte graphique en permanence : à 90 comme à 300 images par seconde, pas de déchirement ni de saccade."),
    B("dark", [{"k": "burnin"}],
      "Seul point à connaître avec l'OLED : le risque de marquage, qu'on appelle burn-in. Une même image fixe affichée pendant des centaines d'heures peut laisser une trace.",
      "Gigabyte intègre des protections automatiques, et annonce une garantie de trois ans qui couvre le burn-in, selon les conditions de ton pays.",
      "Les bonnes habitudes : masquer la barre des tâches, un fond d'écran sombre, une mise en veille rapide, et Discord ou la navigation plutôt sur ton écran AOC."),
    B("dark", [{"k": "res", "img": "fh6_06"}],
      "Côté définition, le 1440p affiche 3,7 millions de pixels, contre 2,1 millions en 1080p : 78 pour cent de pixels en plus.",
      "Pour les beaux jeux, c'est une image plus fine et des paysages lointains bien plus précis."),
    B(["p:aoc", Z("aoc_screen"), Z("aoc_stand")], [chips("AOC C27G2ZU/BK", "ÉCRAN SECONDAIRE · VA INCURVÉ 1500R", ["27\" · 1920 × 1080", "240 Hz", "1 ms GtG · 0,5 ms MPRT*", "FreeSync Premium*"])],
      "Ton second écran, l'AOC C27G2ZU : 27 pouces, incurvé, en 1920 par 1080, à 240 hertz.",
      "Très fluide, il est parfait pour Discord, une vidéo ou un guide, pendant que l'OLED reste dédié au jeu."),
    B("dark", [{"k": "duel"}],
      "En résumé : l'OLED Gigabyte offre la meilleure image, la plus grande finesse et la fréquence la plus élevée.",
      "L'AOC, en VA incurvé, est le complément idéal."),
]))

# 5 — FORTNITE
SCENES.append(("fortnite", [
    chapter("04", "FORTNITE", "Mode Performance · 360 Hz · réglages compétitifs", bg="fn:storm"),
    B(["fn:storm", "fn:build", "fn:fight"], [{"k": "gametitle", "text": "FORTNITE", "sub": "Illustrations originales"}, {"k": "fn_tag"}], dur=6.0, energy=1.0),
    B(["fn:run", "fn:build", "fn:fight"], [{"k": "fn_tag"}],
      "Place aux jeux, et on commence par Fortnite, où la fluidité fait la différence.",
      "Son mode Performance simplifie l'affichage et soulage énormément la carte graphique.",
      "C'est alors le processeur qui fixe les FPS, et ton 9800X3D est l'un des meilleurs dans ce rôle.", energy=0.9),
    B("fn:split", [{"k": "fn_tag"}],
      "Voici le principe, en illustration : à gauche, le mode Performance, avec des formes simplifiées et sans effets superflus, pour une lisibilité maximale.",
      "À droite, le rendu Épique en DirectX 12, avec un éclairage dynamique, des ombres et des effets bien plus riches."),
    B(["fn:run", "fn:build"], [{"k": "fn_tag"}],
      "En mode Performance, tu peux t'approcher des 360 images par seconde : c'est exactement là que ton écran OLED 360 hertz prend tout son sens.",
      "Chaque construction, chaque virage rapide reste parfaitement net.", energy=0.9),
    B("fn:fight", [{"k": "chart", "title": "Fortnite · RTX 5070 + Ryzen 7 9800X3D", "sub": "FPS moyens · aucun benchmark exact publié pour cette configuration",
                    "rows": [("Mode Performance · réglages bas", 330, (280, 380), "e", "Estimation", "1440p · RT non · DLSS non · FG non"),
                             ("DirectX 12 · Épique", 120, (100, 140), "e", "Estimation", "1440p · Lumen · DLSS Qualité · FG non")],
                    "max": 420, "ref": [60, 360],
                    "src": "Aucune mesure publiée pour cette combinaison exacte · estimations, FPS variables selon la zone et la saison du jeu"}, {"k": "fn_tag"}],
      "En mode Performance, j'estime que tu dépasseras les 300 images par seconde, en t'approchant des 360 hertz.",
      "C'est une estimation : aucun benchmark fiable n'existe pour cette combinaison exacte, et les FPS varient selon la zone.",
      "Pour la beauté, le mode DirectX 12 Épique offre un rendu superbe, autour de 100 à 140 images par seconde avec le DLSS, selon mon estimation.", dim=0.55),
    B("fn:build", [{"k": "settings", "title": "Réglages compétitifs conseillés · Fortnite",
                    "rows": [("Mode de rendu", "Performance"), ("Distance d'affichage", "Épique"), ("Ombres · effets", "Désactivés / bas"),
                             ("Nvidia Reflex", "Activé (si proposé)"), ("Limite de FPS", "Illimitée ou 360")]}, {"k": "fn_tag"}],
      "En compétitif : mode Performance, distance d'affichage au maximum, le reste au minimum, et Reflex activé quand il est proposé.",
      "Le processeur pousse les FPS, la carte garde de la réserve, et l'écran fait le reste.", dim=0.35),
]))

# 6 — CALL OF DUTY / WARZONE
SCENES.append(("cod", [
    chapter("05", "CALL OF DUTY · WARZONE", "Fluidité, régularité, lisibilité", bg="i:wz_02"),
    B([WZ + "10.1", WZ + "30.5", WZ + "112.2", WZ + "131.0"], [{"k": "gametitle", "text": "WARZONE", "sub": "Images officielles · Call of Duty"}], dur=7.0, dim=0.0, energy=1.0),
    B([WZ + "3.2", WZ + "28.4", WZ + "36.2"], [],
      "Place à Call of Duty et Warzone : de grandes cartes, des dizaines de joueurs, et des explosions partout.", dim=0.05, energy=1.0),
    B([WZ + "52.2", WZ + "61.3", WZ + "108.4"], [],
      "Le processeur suit énormément de joueurs et d'objets : le cache 3D du 9800X3D garde l'image stable dans les combats chargés.",
      "La RTX 5070 apporte un rendu détaillé, et le DLSS un supplément de fluidité.", dim=0.1, energy=0.9),
    B([WZ + "15.2", WZ + "19.2", WZ + "69.2"], [],
      "Des villes entières, des toits, des rues étroites : chaque combat peut éclater à longue distance ou au corps à corps.",
      "Pour repérer un adversaire au loin, la définition 1440p de ton écran OLED aide vraiment : l'image est plus fine, et les détails lointains plus lisibles.", dim=0.05, energy=0.95),
    B([WZ + "77.2", WZ + "88.2"], [],
      "Et quand tu vises à travers une lunette, les 360 hertz rendent chaque mouvement de caméra plus net.", dim=0.05, energy=0.95),
    B("split:wz_0@90.2", [],
      "Réglages compétitifs ou élevés ? Voici une simulation du principe.",
      "Les réglages compétitifs suppriment ce qui gêne la vue, comme le flou ou certains effets, tandis que les réglages élevés privilégient l'ambiance et les détails.", dim=0.0),
    B(WZ + "96.2", [{"k": "chart", "title": "Call of Duty · RTX 5070", "sub": "FPS moyens · fourchettes issues de tests aux conditions variées",
                     "rows": [("Réglages maximum · natif", 125, (105, 150), "e", "Estimation", "1440p · tests Black Ops 6 · DLSS non · CPU variés"),
                              ("Compétitif · Warzone", 225, (200, 250), "e", "Estimation", "1440p · réglages bas · DLSS Qualité · Reflex · FG non")],
                     "max": 420, "ref": [60, 360],
                     "src": "Ordres de grandeur de tests Black Ops 6 publiés (scènes et processeurs variés) · classés en estimation"}],
      "Les tests publiés pour Black Ops 6 situent la RTX 5070 entre 105 et 150 images par seconde en 1440p, réglages maximum. Leurs conditions varient : je les classe en estimation.",
      "En compétitif, avec le DLSS Qualité et Reflex, j'estime 200 à 250 images par seconde sur Warzone.", dim=0.65),
    B([WZ + "119.2", WZ + "54.2"], [{"k": "settings", "title": "Réglages conseillés · Warzone",
                                   "rows": [("Préréglage", "Bas / personnalisé"), ("Upscaling", "DLSS · Qualité"), ("Nvidia Reflex", "Activé + boost"),
                                            ("Textures", "Moyennes à élevées"), ("Effets & flou", "Désactivés")]}],
      "Mon conseil : garde des textures élevées, mais coupe les effets et le flou de mouvement.",
      "Résultat : une image propre et une réactivité de niveau compétitif.", dim=0.4),
    B([WZ + "96.6", WZ + "131.0"], [], dur=5.0, dim=0.0, energy=1.0),
]))

# 7 — BODYCAM
SCENES.append(("bodycam", [
    chapter("06", "BODYCAM", "Le réalisme poussé à l'extrême", bg="i:bc_01"),
    B([BC + "6.2", BC + "13.2", BC + "36.2", BC + "93.2"], [{"k": "gametitle", "text": "BODYCAM", "sub": "Images officielles · Reissad"}], dur=8.0, dim=0.0, energy=1.0),
    B([BC + "11.2", BC + "31.2", BC + "49.2"], [],
      "Bodycam, c'est un FPS multijoueur tactique d'un réalisme saisissant, développé par Reissad sous Unreal Engine 5.",
      "Tout est filmé comme par une caméra-piéton : objectif grand angle, lumière brute, et des décors photoréalistes.", dim=0.0, energy=1.0),
    B([BC + "38.2", BC + "90.2", BC + "111.2"], [],
      "Ce réalisme a un prix : l'Unreal Engine 5 utilise des technologies comme Lumen et Nanite, très exigeantes pour la carte graphique.",
      "Ici, c'est donc la RTX 5070 qui travaille le plus, et le DLSS devient ton meilleur allié.", dim=0.05, energy=0.95),
    B("i:bc_04", [{"k": "chart", "title": "Bodycam · RTX 5070 + Ryzen 7 9800X3D", "sub": "FPS moyens · aucun test publié fiable pour cette carte · estimations",
                      "rows": [("Élevé · natif", 70, (55, 85), "e", "Estimation", "1440p · Lumen · DLSS non · FG non"),
                               ("Élevé · DLSS Qualité", 98, (85, 110), "e", "Estimation", "1440p · DLSS Qualité · FG non")],
                      "max": 200, "ref": [60],
                      "src": "Aucun test fiable publié avec une RTX 5070 · estimations · témoignage RTX 5070 Ti cité à titre de comparaison"}],
      "Aucun média spécialisé n'a publié de test fiable de Bodycam avec une RTX 5070, et les estimations en ligne se contredisent fortement.",
      "Mon estimation : environ 55 à 85 images par seconde en 1440p natif avec des réglages élevés, et autour de 85 à 110 avec le DLSS en mode Qualité.",
      "Un joueur équipé d'une RTX 5070 Ti, plus puissante, et du même processeur rapporte environ 120 images par seconde en 1440p Ultra avec le DLSS Qualité : c'est cohérent avec cet ordre de grandeur.", dim=0.72),
    B([BC + "55.2", BC + "88.2"], [{"k": "settings", "title": "Réglages conseillés · Bodycam",
                                  "rows": [("Préréglage", "Élevé"), ("Upscaling", "DLSS · Qualité"), ("Génération d'images", "Désactivée en multijoueur"),
                                           ("Ombres", "Moyennes à élevées"), ("Flou de mouvement", "Désactivé")]}],
      "Mon conseil : réglages élevés, DLSS Qualité, et pas de génération d'images en multijoueur, pour garder la meilleure réactivité.",
      "Et ton écran OLED fera le reste : dans les bâtiments sombres et les tranchées, ses noirs profonds rendent l'ambiance encore plus saisissante.", dim=0.45),
    B([BC + "114.2", BC + "117.2"], [], dur=6.0, dim=0.0, energy=1.0),
]))

# 8 — FORZA HORIZON 6
SCENES.append(("fh6", [
    chapter("07", "FORZA HORIZON 6", "La beauté du Japon", bg="i:fh6_bg"),
    B([FH + "0.2", FH + "3.1", FH + "6.2", FH + "68.2"], [{"k": "gametitle", "text": "FORZA HORIZON 6", "sub": "Images officielles · Playground Games"}], dur=9.0, dim=0.0, energy=1.0),
    B([FH + "7.3", FH + "50.3"], [],
      "Changement d'ambiance avec Forza Horizon 6.",
      "Ici, on cherche la plus belle image possible, avec une excellente fluidité.", dim=0.0, energy=1.0),
    B(["i:fh6_05", FH + "43.1", FH + "74.1"], [],
      "Les rues de Tokyo illuminées de néons, avec leurs enseignes qui se reflètent sur les carrosseries.", dim=0.0, energy=1.0),
    B([FH + "36.2", FH + "30.2", "i:fh6_07"], [],
      "Les routes de montagne, les murs de neige vertigineux, les cerisiers en fleurs et les forêts d'automne.", dim=0.0, energy=1.0),
    B(["i:fh6_00", FH + "12.1"], [chips("Options graphiques PC", "FORZA HORIZON 6", ["Illumination globale en ray tracing", "Reflets en ray tracing quasi miroir", "DLSS 4.5 · génération d'images", "Réglages fins · FPS débloqués"])],
      "Sur PC, le jeu propose une illumination globale en ray tracing, pour une lumière plus naturelle, et des reflets quasi miroir.",
      "Pour Digital Foundry, c'est la principale amélioration de la version PC.", dim=0.25),
    B(FH + "13.1", [{"k": "chart", "title": "Forza Horizon 6 · RTX 5070 · 1440p", "sub": "FPS moyens · résolution, réglages, RT, DLSS et FG sous chaque barre",
                     "rows": [("Extrême · sans RT · natif", 112, None, "m", "TechSpot", "1440p · RT non · DLSS non · FG non · RTX 5070 · processeur du test non confirmé"),
                              ("Extrême · sans RT · DLSS Qualité", 118, None, "m", "ComputerBase", "1440p · RT non · DLSS Qualité (protocole ComputerBase) · FG non · autre scène"),
                              ("Extrême + RT · natif", 56, None, "m", "TechSpot", "1440p · RT oui · DLSS non · FG non · RTX 5070"),
                              ("Extrême + RT · DLSS Qualité", 80, (75, 85), "e", "Estimation", "1440p · RT oui · DLSS Qualité · FG non · extrapolé de la mesure à 56"),
                              ("Extrême + RT · DLSS Q · FG ×2", 150, (140, 160), "fg", "Images générées", "FPS affichés : ≈ 75 calculés + ≈ 75 générés par l'IA")],
                     "max": 200, "ref": [60],
                     "src": "Sources : TechSpot, « Forza Horizon 6 Benchmark: 47 GPUs Tested » (16 mai 2026) · ComputerBase, « Forza Horizon 6 im Benchmark-Test »"}],
      "Les chiffres, maintenant, avec leurs conditions exactes.",
      "TechSpot a testé 47 cartes graphiques : en 1440p natif, préréglage Extrême sans ray tracing, la RTX 5070 atteint 112 images par seconde.",
      "ComputerBase mesure 118 images par seconde, mais avec le DLSS Qualité activé dans son protocole, et sur une autre scène : les deux chiffres ne se comparent donc pas directement.",
      "Avec le ray tracing, en natif, TechSpot relève 56 images par seconde. Les deux lignes suivantes ne sont plus des mesures : le DLSS Qualité est mon estimation, et la dernière barre compte des images générées.", dim=0.75),
    B(FH + "16.1", [{"k": "fh6fps"}],
      "Regardons ce que ça change vraiment. En natif avec ray tracing : 56 images, toutes calculées par la carte.",
      "Avec le DLSS Qualité, la carte calcule moins de pixels par image, et j'estime qu'elle en produit environ 80 par seconde.",
      "Ajoute la génération d'images : la carte calcule un peu moins, environ 75, et l'IA en insère autant. Le compteur affiche environ 150.",
      "Visuellement, c'est très fluide. Mais à la manette ou au volant, le jeu réagit comme à 75 images par seconde. Pour une balade, c'est parfait ; pour une course en ligne, mieux vaut des images réelles.", dim=0.8),
    B([FH + "20.1", FH + "55.1", FH + "81.1"], [], dur=6.0, dim=0.0, energy=1.0),
    B(FH + "45.1", [{"k": "settings", "title": "Réglages conseillés · Forza Horizon 6",
                     "rows": [("Préréglage", "Extrême"), ("Ray tracing", "Activé"), ("Upscaling", "DLSS · Qualité"),
                              ("Génération d'images", "En balade / photo"), ("Course en ligne", "RT désactivé · >110 FPS")]}],
      "Mon réglage idéal : Extrême, ray tracing activé, DLSS Qualité, et génération d'images en balade.",
      "En ligne, coupe le ray tracing : TechSpot mesure alors 112 images par seconde en natif. Et ComputerBase recommande 12 gigaoctets de mémoire vidéo en 1440p : pile ta carte.", dim=0.45),
    B(FH + "50.1", [{"k": "versus"}],
      "Face à la Xbox Series X, Digital Foundry décrit un mode 60 images par seconde en 4K dynamique, et un mode 4K native à 30 images par seconde, avec un ray tracing limité.",
      "Ton PC, en 1440p, va bien au-delà des 60 images par seconde avec plus de ray tracing. La console garde ses atouts : un prix plus bas et aucun réglage.", dim=0.78),
    B([FH + "73.2", FH + "84.6"], [], dur=6.0, dim=0.0, energy=1.0),
]))

# 9 — GTA VI
SCENES.append(("gta", [
    chapter("08", "GTA VI", "Ce que l'on sait vraiment", bg="gta"),
    B("gta", [{"k": "gta_world"}],
      "Et puis il y a le jeu que tout le monde attend : GTA VI.",
      "Direction Leonida, un État inspiré de la Floride, avec Vice City, des marais, des plages et des îles.",
      "Deux héros : Jason et Lucia, un couple pris dans une spirale criminelle.",
      "Les bandes-annonces montrent une ville très dense, des foules, des reflets et des éclairages qui visent un nouveau palier graphique."),
    B("gta", [{"k": "gta"}],
      "Mais soyons clairs : GTA VI sort le 19 novembre 2026 sur PlayStation 5 et Xbox Series, et aucune version PC n'est officiellement annoncée.",
      "Des rumeurs parlent de début 2027, sans confirmation. Il n'existe ni configuration requise, ni benchmark.",
      "En théorie, ta configuration est une très bonne base, mais tout chiffre de FPS serait inventé : il faudra attendre les premiers tests."),
]))

# 10 — ÉVOLUTIONS
SCENES.append(("upgrade", [
    chapter("09", "LES ÉVOLUTIONS POSSIBLES", "Rien d'indispensable, tout est possible"),
    B("dark", [{"k": "chart", "title": "RTX 5070 · 5070 Ti · 5080", "sub": "Performances relatives en 1440p · RTX 5070 = 100 · ordre de grandeur des tests publiés, projection", "unit": "%",
                "rows": [("RTX 5070 (ta carte)", 100, None, "ref", "Base", "12 Go · 250 W · alimentation recommandée : 650 W"),
                         ("RTX 5070 Ti", 122, (120, 125), "e", "Projection", "16 Go · 300 W · alimentation recommandée : 750 W"),
                         ("RTX 5080", 140, (135, 145), "e", "Projection", "16 Go · 360 W · alimentation recommandée : 850 W")],
                "max": 160,
                "src": "Projection d'après les écarts moyens publiés (TechPowerUp, TechSpot) · alimentations : recommandations NVIDIA"}],
      "Et si GTA VI, ou un autre jeu futur, se montre très exigeant sur PC ? Ton PC pourra évoluer, sans que ce soit indispensable aujourd'hui.",
      "Option un : la RTX 5070 Ti, environ 20 à 25 pour cent plus rapide en 1440p.",
      "Option deux : la RTX 5080, environ 35 à 45 pour cent plus rapide, selon mon estimation."),
    B("dark", [{"k": "upgrade"}],
      "La 5070 Ti apporte 16 gigaoctets de mémoire vidéo pour 300 watts, et Nvidia recommande 750 watts : ton alimentation actuelle convient.",
      "La 5080 consomme 360 watts, et Nvidia recommande alors 850 watts : changer d'alimentation serait le choix prudent."),
    B("dark", [{"k": "fit"}],
      "Côté taille, la plupart des 5070 Ti et 5080 mesurent 30 à 34 centimètres, et ton boîtier accepte 405 millimètres. Il suffira de vérifier le modèle choisi.",
      "Et le 9800X3D a largement les épaules pour une carte plus puissante."),
]))

# 11 — TES JEUX EN CHIFFRES
SCENES.append(("bench", [
    chapter("10", "TES JEUX EN CHIFFRES", "Le récapitulatif"),
    B("dark", [{"k": "legend"}],
      "Quelques clés pour lire les chiffres.",
      "Badge vert : une mesure réelle, publiée par un média spécialisé. Badge orange : une estimation.",
      "Et le badge lavande signale des FPS affichés avec génération d'images."),
    B("dark", [{"k": "fpsfeel"}],
      "Mais que signifie concrètement jouer à 100, 200 ou 300 images par seconde ?",
      "À 100 FPS, une nouvelle image arrive toutes les 10 millisecondes. À 200 FPS, toutes les 5. Et à 300 FPS, toutes les 3,3.",
      "Plus les images sont rapprochées, plus le mouvement est net et plus le jeu réagit vite à ta souris. Au-delà des 360 hertz de ton écran, le gain devient minime."),
    B("dark", [{"k": "chart", "title": "Récapitulatif · RTX 5070 + Ryzen 7 9800X3D · 1440p", "sub": "Réglage conseillé par jeu · FPS moyens réels, sans génération d'images",
                "rows": [("Fortnite · Performance", 330, (280, 380), "e", "Estimation"),
                         ("Warzone · compétitif + DLSS Q", 225, (200, 250), "e", "Estimation"),
                         ("Call of Duty · réglages max", 125, (105, 150), "e", "Estimation"),
                         ("Forza Horizon 6 · Extrême natif", 112, None, "m", "TechSpot"),
                         ("Bodycam · élevé + DLSS Q", 98, (85, 110), "e", "Estimation"),
                         ("FH6 · Extrême + RT + DLSS Q", 80, (75, 85), "e", "Estimation"),
                         ("GTA VI · version PC", 0, None, "na", "Non annoncée")],
                "max": 420, "ref": [60, 360], "compact": True,
                "src": "1440p · RTX 5070 · seule mesure : Forza Horizon 6 (TechSpot, sans RT, sans DLSS) · tout le reste : estimations, sans génération d'images"}],
      "Le récapitulatif : en bleu glacier, les 360 hertz de ton écran ; en gris, les 60 images par seconde.",
      "Fortnite s'approche des 360 hertz, Warzone est très confortable, et Bodycam comme Forza Horizon 6 restent bien au-dessus de 60. Pour GTA VI, pas de chiffre tant que la version PC n'existe pas."),
    B("dark", [{"k": "sourcetable"}],
      "Voici le détail de chaque mesure : définition, réglages, ray tracing, DLSS, carte graphique, processeur et source.",
      "Les estimations, elles, varient selon la version du jeu et la scène."),
]))

# 12 — CONCLUSION
SCENES.append(("outro", [
    chapter("11", "CONCLUSION", "Ton futur setup"),
    B("p:case", [{"k": "bullets", "title": "Ce que tu vas recevoir",
                  "items": ["Ryzen 7 9800X3D + RTX 5070 : un duo sans maillon faible", "Fortnite & Warzone : fluidité de niveau compétitif", "Bodycam & Forza Horizon 6 : réalisme et beauté en 1440p", "OLED 360 Hz + second écran 240 Hz"]}],
      "Alors, que retenir ?",
      "Une machine équilibrée, sans maillon faible : un processeur gaming de pointe, une carte taillée pour le 1440p, un refroidissement silencieux, et un écran OLED 360 hertz qui sublime chaque image.", energy=0.95),
    B([WZ + "105.2", BC + "36.2"], [],
      "D'un côté, Fortnite, Warzone et Bodycam avec une fluidité et une réactivité de niveau compétitif.", dim=0.0, energy=1.0),
    B([FH + "75.1", FH + "36.1"], [],
      "De l'autre, le Japon de Forza Horizon 6 en ray tracing, et une machine prête pour GTA VI et pour l'avenir.", dim=0.0, energy=1.0),
    B([FH + "0.2", BC + "93.2", FH + "84.2"], [],
      "Aucune machine n'est parfaite en tout, mais pour ce que tu veux faire, c'est un choix remarquablement intelligent.",
      "Il ne reste plus qu'à attendre la livraison. Et franchement, l'attente en vaut la peine.", dim=0.0, energy=1.0),
    B("p:hero", [{"k": "title", "text": "BON JEU !", "sub": "Ryzen 7 9800X3D · RTX 5070 · OLED 360 Hz"}, {"k": "tag", "text": "VISUEL D'ILLUSTRATION · image générée"}],
      "Bon jeu !", energy=1.0),
    B("dark", [{"k": "credits"}], dur=12.0, dim=0.8),
]))

# numérotation automatique des chapitres
_n = 0
for _name, _beats in SCENES:
    for _b in _beats:
        for _o in _b["ov"]:
            if _o["k"] == "chapter":
                _n += 1
                _o["num"] = f"{_n:02d}"

# ------------------------------------------------- prononciation (TTS)
SPOKEN = [
    ("9800X3D", "neuf-mille-huit-cents X 3 D"),
    ("7800X3D", "sept-mille-huit-cents X 3 D"),
    ("RTX 5070 Ti", "RTX cinquante-soixante-dix Ti"),
    ("5070 Ti", "cinquante-soixante-dix Ti"),
    ("RTX 5070", "RTX cinquante-soixante-dix"),
    ("RTX 5080", "RTX cinquante-quatre-vingts"),
    ("5080", "cinquante-quatre-vingts"),
    ("ta 5070", "ta cinquante-soixante-dix"),
    ("RTX 4070 Super", "RTX quarante-soixante-dix Super"),
    ("RTX 4070", "RTX quarante-soixante-dix"),
    ("RTX 4090", "RTX quarante-quatre-vingt-dix"),
    ("FRAME 4000D", "Frame 4000 D"),
    ("TDP", "T D P"),
    ("1440p", "1440 p"),
    ("1080p", "1080 p"),
    ("GDDR7", "G D D R 7"),
    ("DDR5", "D D R 5"),
    ("DLSS", "D L S S"),
    ("QD-OLED", "Q D OLED"),
    ("Wi-Fi 6E", "Wi-Fi 6 E"),
    ("B650 Gaming X AX V2", "B 650 Gaming X, A X, V 2"),
    ("FRAME 4000D RS ARGB", "Frame 4000 D, R S, A RGB"),
    ("RS120 ARGB", "R S 120 A RGB"),
    ("C27G2ZU", "C 27 G 2 Z U"),
    ("GTA VI", "GTA 6"),
    ("AM5", "A M 5"),
    ("M.2", "M 2"),
    ("EXPO", "Expo"),
    ("be quiet!", "bi kouaïette"),
    ("Zen 5", "Zen cinq"),
]


def spoken(t):
    for a, b in SPOKEN:
        t = t.replace(a, b)
    return t


CREDITS = [
    "Sources",
    "TechSpot — Forza Horizon 6 Benchmark: 47 GPUs Tested (16/05/2026) ; Ryzen 7 9800X3D vs 7800X3D ; RTX 5070 (VRAM)",
    "ComputerBase — Forza Horizon 6 im Benchmark-Test (WQHD, DLSS Qualité, VRAM)  ·  CGMagazine — RTX 5070 / Cyberpunk 2077",
    "Kioxia — Exceria Plus G3 (5 000 / 3 900 Mo/s, CrystalDiskMark) · Xbox / Playground — Forza Horizon 6 : 160 Go sur PC (Steam : 167 Go) · NVIDIA — DLSS 4",
    "TechPowerUp — RTX 5070 Founders Edition  ·  Digital Foundry — Forza Horizon 6 PC / Xbox",
    "Rockstar Games — GTA VI  ·  NVIDIA — alimentations recommandées RTX 50  ·  Corsair — compatibilité FRAME 4000D",
    "Températures & consommation : AMD (Tjmax 95 °C) · TechPowerUp (RTX 5070 FE / MSI, 9800X3D) · retours d'utilisateurs (valeurs indicatives)",
    "Gigabyte — garantie MO27Q3 3 ans burn-in inclus, OLED Care · Patriot — Viper Venom PVV532G600C30K (sans RGB)",
    "Fiches constructeurs : AMD, NVIDIA, MSI, Gigabyte (MO27Q3 : zone d'affichage 590,42 × 333,72 mm), AOC, Kioxia, be quiet!, Arctic, Patriot",
    "Photos produits : fournies par le destinataire (visuels des fabricants / revendeurs) · page de titre : visuel d'illustration généré",
    "Images de jeu : bandes-annonces et captures officielles (Steam : Forza Horizon 6, Call of Duty Warzone, Bodycam) — propriété de leurs éditeurs",
    "Fortnite, GTA VI et comparaison Warzone : illustrations / simulations originales, pas des captures de jeu",
    "Narration : voix de synthèse · Musique et effets : compositions générées · Usage privé uniquement",
]
