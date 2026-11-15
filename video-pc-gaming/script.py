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


def B(bg, ov=None, *s, dur=None, dim=None, energy=None):
    return {"bg": bg, "ov": ov or [], "s": list(s), "dur": dur, "dim": dim, "energy": energy}


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


FH = "c:fh6_1@"
SCENES = []

# 1 — INTRODUCTION CINÉMATOGRAPHIQUE
SCENES.append(("intro", [
    B([FH + "0.2", FH + "3.1", FH + "7.3", FH + "43.2"], [{"k": "kicker", "text": "FORZA HORIZON 6 · JAPON"}], dur=8.0, dim=0.05, energy=1.0),
    B([FH + "20.1", FH + "50.4", FH + "43.3", FH + "75.4"], [],
      "Imagine un instant.",
      "Le mont Fuji au loin, une route de montagne, et une voiture qui n'attend que toi.",
      "Tout ça sur un écran OLED à 360 hertz, avec des noirs parfaits et des couleurs éclatantes.",
      "Ce n'est pas un rêve : c'est ce que ton futur PC gaming va te permettre de vivre.", dim=0.05, energy=1.0),
    B("p:hero", [{"k": "title", "text": "TON FUTUR PC GAMING", "sub": "Ryzen 7 9800X3D  ·  RTX 5070  ·  OLED 360 Hz"}, {"k": "tag", "text": "VISUEL D'ILLUSTRATION · image générée"}],
      "Ryzen 7 9800X3D, GeForce RTX 5070, 32 gigaoctets de DDR5, watercooling de 360 millimètres, dans un boîtier noir illuminé de RGB.",
      "On va découvrir chaque composant, et voir ce que cette machine donne vraiment dans tes jeux, avec de vrais benchmarks et sans rien enjoliver.",
      "Installe-toi. On commence.", energy=0.95),
]))

# 2 — PRÉSENTATION GÉNÉRALE
SCENES.append(("config", [
    chapter("01", "LA CONFIGURATION", "Huit composants, une machine cohérente"),
    B("dark", [{"k": "grid"}],
      "Voici ta configuration complète.",
      "Le processeur AMD Ryzen 7 9800X3D, et la carte graphique MSI GeForce RTX 5070 Ventus, en version OC.",
      "32 gigaoctets de Patriot Viper Venom en DDR5, et un watercooling Arctic Liquid Freezer 3 Pro de 360 millimètres.",
      "La carte mère Gigabyte B650 Gaming X AX V2, un SSD Kioxia d'un téraoctet, et une alimentation be quiet! de 750 watts.",
      "Le tout dans un boîtier Corsair FRAME 4000D RS ARGB, en noir.", energy=1.0),
    B("dark", [{"k": "flow"}],
      "Mais un PC, ce n'est pas une simple liste de pièces. C'est une équipe.",
      "Quand tu lances un jeu, le SSD charge les fichiers dans la mémoire vive. Le processeur calcule la partie, la physique, les joueurs, et prépare le travail de la carte graphique.",
      "La carte graphique dessine chaque image et l'envoie à l'écran. L'alimentation fournit l'énergie, et le watercooling évacue la chaleur.",
      "Si un maillon est trop faible, toute la chaîne ralentit. Et ta configuration est très bien équilibrée.", energy=0.8),
]))

# 3 — COMPOSANTS EN DÉTAIL
SCENES.append(("composants", [
    chapter("02", "LES COMPOSANTS EN DÉTAIL", "Rôle · fonctionnement · intérêt en jeu"),
    B(["p:cpu", "pz:cpu:0.42,0.52,0.99,0.99"], [chips("AMD Ryzen 7 9800X3D", "PROCESSEUR · SOCKET AM5", ["8 cœurs / 16 threads · Zen 5", "Jusqu'à 5,2 GHz", "96 Mo de cache L3", "Technologie 3D V-Cache"])],
      "On commence par le cerveau de la machine : le Ryzen 7 9800X3D.",
      "Sous son capot métallique se cache une particularité rare : une couche de mémoire cache empilée directement contre ses huit cœurs.",
      "C'est la technologie 3D V-Cache, et c'est elle qui fait de ce processeur une référence pour le jeu."),
    B("dark", [{"k": "vcache"}],
      "AMD ajoute 64 mégaoctets de cache contre la puce : 96 mégaoctets au total.",
      "Cette mémoire ultra-rapide, placée juste à côté des cœurs, évite d'aller chercher les données dans la mémoire vive, bien plus lente.",
      "Résultat : plus d'images par seconde, et des images plus régulières."),
    B("c:cs2_0@33", [{"k": "chart", "title": "Counter-Strike 2 · test processeur", "sub": "FPS moyens · CPU testés avec une RTX 4090 pour supprimer la limite graphique",
                      "rows": [("Ryzen 7 9800X3D", 668, None, "m", "TechSpot", "1080p · RT non · DLSS non · 1 % low : non relevé ici"),
                               ("Ryzen 7 7800X3D", 591, None, "m", "TechSpot", "1080p · même banc · écart mesuré : −13 %")], "max": 760}],
      "Dans les tests de TechSpot, avec une RTX 4090, le 9800X3D atteint 668 images par seconde dans Counter-Strike 2 en 1080p : 13 pour cent de plus que le 7800X3D, l'ancien champion.",
      "C'est l'un des meilleurs processeurs gaming du marché.", dim=0.6),
    B(["p:gpu", "pz:gpu:0.40,0.42,1.0,0.99", "pz:gpu:0.0,0.0,0.62,0.62"], [chips("MSI RTX 5070 Ventus 2X OC", "CARTE GRAPHIQUE · NVIDIA BLACKWELL", ["12 Go de GDDR7", "DLSS 4 · génération d'images", "Ray tracing · Reflex", "≈ 250 W · double ventilateur"])],
      "La carte graphique, maintenant : la MSI RTX 5070 Ventus, légèrement overclockée d'usine.",
      "Son double ventilateur refroidit une puce Blackwell épaulée par 12 gigaoctets de mémoire GDDR7, le tout pour environ 250 watts.",
      "Selon TechPowerUp, elle est environ 20 pour cent devant une RTX 4070 en 1440p, au niveau d'une RTX 4070 Super. Une carte taillée pour la définition de ton écran."),
    B("dark", [{"k": "dlss"}],
      "Sa grande force, c'est le DLSS 4.",
      "La carte calcule l'image en plus basse définition, puis une IA la reconstruit en 1440p. En mode Qualité, le rendu reste très proche du natif, avec bien plus de fluidité.",
      "La génération d'images, elle, insère des images créées par l'IA entre les vraies : le compteur grimpe, mais la réactivité reste celle des vraies images.",
      "Ici, FPS réels et FPS générés sont donc toujours séparés. Quant au ray tracing, il simule le trajet de la lumière, pour des reflets et des éclairages réalistes."),
    B([FH + "64.1", FH + "12.1"], [chips("12 Go de VRAM", "LE POINT DE VIGILANCE", ["Suffisant dans la grande majorité des jeux en 1440p", "Limite possible : textures max + ray tracing très poussé", "Constat TechSpot : Indiana Jones en path tracing", "Solution : baisser d'un cran les textures"])],
      "Un mot honnête sur les 12 gigaoctets de mémoire vidéo.",
      "C'est suffisant dans la grande majorité des jeux en 1440p. Mais avec textures maximales et ray tracing très poussé, elle peut devenir une limite, comme l'a constaté TechSpot dans Indiana Jones.",
      "Il suffit alors de baisser d'un cran les textures.", dim=0.35),
    B("dark", [{"k": "duo"}],
      "Pourquoi ce duo est-il si intéressant ?",
      "En jeu compétitif, réglages bas, c'est le processeur qui fixe la limite. Et c'est là que le 9800X3D excelle.",
      "Dans un jeu très beau, c'est l'inverse : la RTX 5070 et son DLSS prennent le relais.",
      "Un processeur qui ne freine jamais, une carte efficace : l'idéal pour faire les deux."),
    B(["p:ram", "pz:ram:0.0,0.0,0.6,0.55"], [chips("Patriot Viper Venom", "MÉMOIRE VIVE · 32 GO", ["2 × 16 Go · double canal", "DDR5 · 6000 MT/s", "Profil EXPO dans le BIOS"])],
      "La mémoire vive : deux barrettes Patriot Viper Venom de 16 gigaoctets, en DDR5 à 6000 mégahertz.",
      "Trente-deux gigaoctets, c'est l'idéal aujourd'hui : les jeux récents dépassent souvent 16 avec Discord ouvert.",
      "Et 6000 mégahertz est la fréquence idéale des Ryzen 9000, avec le profil EXPO à activer dans le BIOS."),
    B(["p:mobo", "pz:mobo:0.38,0.0,1.0,1.0"], [chips("Gigabyte B650 Gaming X AX V2", "CARTE MÈRE · ATX · AM5", ["Ryzen 7000 / 8000 / 9000", "3 emplacements M.2 · LAN 2,5 Gb", "Wi-Fi 6E + Bluetooth"])],
      "La carte mère Gigabyte, c'est la colonne vertébrale du PC : elle relie tous les composants.",
      "Socket AM5, DDR5, trois emplacements M.2, réseau 2,5 gigabits, Wi-Fi 6E et Bluetooth intégrés.",
      "Et la plateforme AM5 est faite pour durer."),
    B(["p:ssd", "pz:ssd:0.0,0.0,0.62,1.0"], [chips("Kioxia Exceria Plus G3", "SSD NVMe M.2 · 1 To", ["PCIe 4.0 x4", "Jusqu'à 5 000 Mo/s en lecture*", "*donnée constructeur"])],
      "Le SSD Kioxia Exceria Plus G3 est un modèle NVMe en PCIe 4.0, annoncé jusqu'à 5000 mégaoctets par seconde en lecture.",
      "Démarrage et chargements rapides. Seule vigilance : un téraoctet se remplit vite, Call of Duty peut dépasser une centaine de gigaoctets."),
    B(["p:psu", "pz:psu:0.38,0.25,1.0,1.0"], [chips("be quiet! Pure Power 13 M", "ALIMENTATION · 750 W", ["80 PLUS Gold · modulaire", "ATX 3.1 · connecteur 12V-2x6", "Marge confortable pour ta config"])],
      "Enfin, l'alimentation be quiet! Pure Power 13 M de 750 watts : 80 Plus Gold, modulaire, et compatible ATX 3.1.",
      "Avec environ 250 watts pour la carte et 120 au maximum pour le processeur, la marge est confortable."),
]))

# 4 — LES DEUX MONITEURS
SCENES.append(("ecrans", [
    chapter("03", "TES DEUX ÉCRANS", "Gigabyte MO27Q3  ·  AOC C27G2ZU/BK"),
    B(["p:mo27q3", "pz:mo27q3:0.0,0.0,1.0,0.64"], [chips("Gigabyte MO27Q3", "ÉCRAN PRINCIPAL · QD-OLED", ["2560 × 1440 · 360 Hz", "0,03 ms GtG*", "27\" annoncés · ≈ 26,7\" visibles*", "*fiche Gigabyte"])],
      "Une machine pareille mérite un écran à sa hauteur.",
      "Ton écran principal, le Gigabyte OLED : une dalle QD-OLED en 2560 par 1440, à 360 hertz, et 0,03 milliseconde de temps de réponse annoncé."),
    B("dark", [{"k": "oled"}],
      "Sur un LCD, un rétroéclairage reste allumé : les noirs sont en réalité gris foncé.",
      "Sur un OLED, chaque pixel s'éteint complètement : noirs parfaits, contraste quasi infini, couleurs éclatantes."),
    B(["i:fh6_05", FH + "74.2", FH + "43.2"], [{"k": "kicker", "text": "NOIRS PARFAITS · NÉONS ÉCLATANTS"}],
      "Imagine les rues de Tokyo de nuit dans Forza Horizon 6 : c'est exactement là que l'OLED brille.", dim=0.1, energy=0.85),
    B("dark", [{"k": "hz"}],
      "Et puis il y a les 360 hertz : jusqu'à 360 images différentes par seconde.",
      "À 60 hertz, une image reste affichée 16,7 millisecondes. À 240 hertz, comme ton écran AOC, 4,2. Et à 360 hertz, seulement 2,8.",
      "Dans Fortnite ou Warzone : des mouvements ultra fluides, des adversaires plus lisibles, et un affichage plus réactif.",
      "Et si un jeu n'atteint pas 360 images par seconde, la synchronisation adaptative aligne l'écran sur la carte graphique : à 90 comme à 300, l'image reste fluide."),
    B("dark", [{"k": "res", "img": "fh6_06"}],
      "Côté définition, le 1440p affiche 3,7 millions de pixels, contre 2,1 millions en 1080p : 78 pour cent de pixels en plus.",
      "Pour les beaux jeux, c'est une image plus fine et des paysages lointains bien plus précis."),
    B(["p:aoc", "pz:aoc:0.0,0.0,1.0,0.62"], [chips("AOC C27G2ZU/BK", "ÉCRAN SECONDAIRE · VA INCURVÉ 1500R", ["27\" · 1920 × 1080", "240 Hz", "1 ms GtG · 0,5 ms MPRT*", "FreeSync Premium*"])],
      "Ton second écran, l'AOC C27G2ZU : 27 pouces, incurvé, en 1920 par 1080, à 240 hertz.",
      "Très fluide, il est parfait pour Discord, une vidéo ou un guide, pendant que l'OLED reste dédié au jeu."),
    B("dark", [{"k": "duel"}],
      "En résumé : l'OLED Gigabyte offre la meilleure image, la plus grande finesse et la fréquence la plus élevée.",
      "L'AOC, en VA incurvé, est le complément idéal."),
]))

# 5 — FORTNITE
SCENES.append(("fortnite", [
    chapter("04", "FORTNITE", "Mode Performance · réglages compétitifs", bg="fn:storm"),
    B(["fn:run", "fn:build", "fn:fight"], [{"k": "fn_tag"}],
      "Commençons par Fortnite, où la fluidité fait la différence.",
      "Son mode Performance simplifie l'affichage et soulage énormément la carte graphique.",
      "C'est alors le processeur qui fixe les FPS, et ton 9800X3D est l'un des meilleurs dans ce rôle.", energy=0.9),
    B("fn:split", [{"k": "fn_tag"}],
      "Voici le principe, en illustration : à gauche, le mode Performance, avec des formes simplifiées et sans effets superflus, pour une lisibilité maximale.",
      "À droite, le rendu Épique en DirectX 12, avec un éclairage dynamique, des ombres et des effets bien plus riches."),
    B("fn:fight", [{"k": "chart", "title": "Fortnite · RTX 5070 + Ryzen 7 9800X3D", "sub": "FPS moyens · aucun benchmark exact publié pour cette configuration",
                    "rows": [("Mode Performance · réglages bas", 330, (280, 380), "e", "Estimation", "1440p · RT non · DLSS non · FG non"),
                             ("DirectX 12 · Épique", 120, (100, 140), "e", "Estimation", "1440p · Lumen · DLSS Qualité · FG non")],
                    "max": 420, "ref": [60, 360]}, {"k": "fn_tag"}],
      "En mode Performance, j'estime que tu dépasseras les 300 images par seconde, en t'approchant des 360 hertz.",
      "C'est une estimation : aucun benchmark fiable n'existe pour cette combinaison exacte, et les FPS varient selon la zone.",
      "Pour la beauté, le mode DirectX 12 Épique offre un rendu superbe, autour de 100 à 140 images par seconde avec le DLSS, selon mon estimation.", dim=0.55),
    B("fn:build", [{"k": "settings", "title": "Réglages compétitifs conseillés · Fortnite",
                    "rows": [("Mode de rendu", "Performance"), ("Distance d'affichage", "Épique"), ("Ombres · effets", "Désactivés / bas"),
                             ("Nvidia Reflex", "Activé (si proposé)"), ("Limite de FPS", "Illimitée ou 360")]}, {"k": "fn_tag"}],
      "En compétitif : mode Performance, distance d'affichage au maximum, le reste au minimum, et Reflex activé quand il est proposé.",
      "Le processeur pousse les FPS, la carte garde de la réserve, et l'écran 360 hertz affiche chaque construction et chaque tir avec une netteté exceptionnelle.", dim=0.35),
]))

# 6 — CALL OF DUTY / WARZONE
SCENES.append(("cod", [
    chapter("05", "CALL OF DUTY · WARZONE", "Fluidité, réactivité, lisibilité", bg="i:wz_02"),
    B(["c:wz_0@3.2", "c:wz_0@28.4", "c:wz_0@36.2"], [],
      "Place à Call of Duty et Warzone : de grandes cartes, des dizaines de joueurs, et des explosions partout.", dim=0.05, energy=1.0),
    B(["c:wz_0@52.2", "c:wz_0@61.3", "c:wz_0@108.4"], [],
      "Le processeur suit énormément de joueurs et d'objets : le cache 3D du 9800X3D garde l'image stable dans les combats chargés.",
      "La RTX 5070 apporte un rendu détaillé, et le DLSS un supplément de fluidité.", dim=0.1, energy=0.9),
    B("split:wz_0@90.2", [],
      "Pour bien comprendre la différence entre réglages compétitifs et réglages élevés, voici une simulation du principe.",
      "Les réglages compétitifs suppriment ce qui gêne la vue, comme le flou ou certains effets, tandis que les réglages élevés privilégient l'ambiance et les détails.", dim=0.0),
    B("c:wz_0@96.2", [{"k": "chart", "title": "Call of Duty · RTX 5070", "sub": "FPS moyens · fourchettes issues de tests aux conditions variées",
                       "rows": [("Réglages maximum · natif", 125, (105, 150), "e", "Estimation", "1440p · tests Black Ops 6 · DLSS non · CPU variés"),
                                ("Compétitif · Warzone", 225, (200, 250), "e", "Estimation", "1440p · réglages bas · DLSS Qualité · Reflex · FG non")],
                       "max": 420, "ref": [60, 360]}],
      "Les tests publiés pour Black Ops 6 situent la RTX 5070 entre 105 et 150 images par seconde en 1440p, réglages maximum. Leurs conditions varient : je les classe en estimation.",
      "En compétitif, avec le DLSS Qualité et Reflex, j'estime 200 à 250 images par seconde sur Warzone.", dim=0.65),
    B(["c:wz_0@119.2", "c:wz_0@54.2"], [{"k": "settings", "title": "Réglages conseillés · Warzone",
                                       "rows": [("Préréglage", "Bas / personnalisé"), ("Upscaling", "DLSS · Qualité"), ("Nvidia Reflex", "Activé + boost"),
                                                ("Textures", "Moyennes à élevées"), ("Effets & flou", "Désactivés")]}],
      "Mon conseil : garde des textures élevées, mais coupe les effets et le flou de mouvement.",
      "Résultat : une image propre et une réactivité de niveau compétitif.", dim=0.4),
]))

# 7 — FORZA HORIZON 6 (séquence cinématographique)
SCENES.append(("fh6", [
    chapter("06", "FORZA HORIZON 6", "La beauté du Japon", bg="i:fh6_bg"),
    B([FH + "0.2", FH + "3.1", FH + "6.2", FH + "10.1", FH + "68.2"], [{"k": "gametitle", "text": "FORZA HORIZON 6", "sub": "Images officielles · Playground Games"}], dur=9.0, dim=0.0, energy=1.0),
    B([FH + "7.3", FH + "50.3"], [],
      "Et voici le jeu qui va sans doute le plus tourner sur ton PC : Forza Horizon 6.",
      "Ici, on cherche la plus belle image possible, avec une excellente fluidité.", dim=0.0, energy=1.0),
    B(["i:fh6_05", FH + "43.1", FH + "74.1"], [],
      "Les rues de Tokyo illuminées de néons, avec leurs enseignes qui se reflètent sur les carrosseries.", dim=0.0, energy=1.0),
    B([FH + "36.2", FH + "25.1"], [],
      "Les routes de montagne qui serpentent entre les forêts,", dim=0.0, energy=1.0),
    B([FH + "30.2", "i:fh6_07", FH + "50.2"], [],
      "les murs de neige vertigineux, les cerisiers en fleurs et les forêts d'automne.", dim=0.0, energy=1.0),
    B([FH + "52.2", FH + "70.1", FH + "72.1"], [],
      "Les textures de l'asphalte, la peinture métallisée, les jantes chromées : c'est bluffant.", dim=0.0, energy=1.0),
    B([FH + "66.1", FH + "83.1"], [],
      "Et c'est là que le PC peut faire la différence.", dim=0.0, energy=0.9),
    B(["i:fh6_00", FH + "12.1"], [chips("Options graphiques PC", "FORZA HORIZON 6", ["Illumination globale en ray tracing", "Reflets en ray tracing quasi miroir", "DLSS 4.5 · génération d'images", "Réglages fins · FPS débloqués"])],
      "Sur PC, le jeu propose une illumination globale en ray tracing, pour une lumière plus naturelle, et des reflets quasi miroir.",
      "Pour Digital Foundry, c'est la principale amélioration de la version PC.", dim=0.25),
    B(FH + "75.1", [{"k": "chart", "title": "Forza Horizon 6 · RTX 5070", "sub": "FPS moyens · conditions de test sous chaque barre",
                     "rows": [("Extrême · natif", 112, None, "m", "TechSpot", "1440p · RT non · DLSS non · FG non · 1 % low : non relevé ici"),
                              ("Protocole ComputerBase", 118, None, "m", "ComputerBase", "1440p · réglages ComputerBase · upscaling non précisé"),
                              ("Extrême + ray tracing · natif", 56, None, "m", "TechSpot", "1440p · RT oui · DLSS non · FG non"),
                              ("Extrême + RT + DLSS Qualité", 80, (75, 85), "e", "Estimation", "1440p · RT oui · DLSS Qualité · FG non"),
                              ("+ génération d'images ×2", 150, (140, 160), "fg", "Images générées", "FPS affichés, incluant des images créées par l'IA")],
                     "max": 200, "ref": [60]}],
      "Les chiffres, maintenant, et ce sont de vrais benchmarks.",
      "TechSpot a testé 47 cartes : en 1440p natif, préréglage Extrême sans ray tracing, la RTX 5070 atteint 112 images par seconde. ComputerBase mesure 118 avec son propre protocole.",
      "Avec le ray tracing activé, toujours en natif, TechSpot relève 56 images par seconde.",
      "Avec le DLSS Qualité, j'estime qu'on remonte à 75 ou 85. La génération d'images peut dépasser 140, mais ce sont des images générées.", dim=0.75),
    B([FH + "20.1", FH + "55.1", FH + "81.1"], [], dur=5.0, dim=0.0, energy=1.0),
    B(FH + "45.1", [{"k": "settings", "title": "Réglages conseillés · Forza Horizon 6",
                     "rows": [("Préréglage", "Extrême"), ("Ray tracing", "Activé"), ("Upscaling", "DLSS · Qualité"),
                              ("Génération d'images", "En balade / photo"), ("Course en ligne", "RT désactivé · >110 FPS")]}],
      "Mon réglage idéal : Extrême, ray tracing activé, DLSS Qualité, et génération d'images en balade.",
      "En ligne, coupe le ray tracing pour dépasser 110 images par seconde. Et ComputerBase recommande 12 gigaoctets de mémoire vidéo en 1440p : pile ta carte.", dim=0.45),
    B(FH + "84.1", [{"k": "versus"}],
      "Face à la Xbox Series X, Digital Foundry décrit un mode 60 images par seconde en 4K dynamique, et un mode 4K native à 30 images par seconde, avec un ray tracing limité.",
      "Ton PC, en 1440p, va bien au-delà des 60 images par seconde avec plus de ray tracing. La console garde ses atouts : un prix plus bas et aucun réglage.", dim=0.78),
    B([FH + "73.2", FH + "84.6"], [], dur=4.0, dim=0.0, energy=1.0),
]))

# 8 — GTA VI
SCENES.append(("gta", [
    chapter("07", "GTA VI", "Ce que l'on sait vraiment", bg="gta"),
    B("gta", [{"k": "gta_world"}],
      "Et puis il y a le jeu que tout le monde attend : GTA VI.",
      "Direction Leonida, un État inspiré de la Floride, avec Vice City, des marais, des plages et des îles.",
      "Deux héros : Jason et Lucia, un couple pris dans une spirale criminelle.",
      "Les bandes-annonces montrent une ville très dense, des foules, des reflets et des éclairages qui visent un nouveau palier graphique."),
    B("gta", [{"k": "gta"}],
      "Mais soyons clairs : GTA VI sort le 19 novembre 2026 sur PlayStation 5 et Xbox Series, et aucune version PC n'est officiellement annoncée.",
      "Des rumeurs parlent de début 2027, sans confirmation. Il n'existe ni configuration requise, ni benchmark.",
      "En théorie, ta configuration est une très bonne base, avec un processeur de pointe pour une ville aussi dense.",
      "Mais tout chiffre de FPS serait inventé : il faudra attendre les premiers tests."),
]))

# 9 — BENCHMARKS ET COMPARAISONS
SCENES.append(("bench", [
    chapter("08", "BENCHMARKS & COMPARAISONS", "Comprendre les chiffres"),
    B("dark", [{"k": "legend"}],
      "Quelques clés pour lire les chiffres.",
      "Badge vert : une mesure réelle, publiée par un média spécialisé. Badge orange : une estimation."),
    B("dark", [{"k": "concepts"}],
      "Un : en 1440p, la carte calcule 78 pour cent de pixels en plus qu'en 1080p. Moins de FPS dans les jeux exigeants, mais une image bien plus fine.",
      "Deux : le mode Performance maximise les FPS, la qualité élevée maximise la beauté. Ton PC sait faire les deux.",
      "Trois : la moyenne ne dit pas tout. Les 1 pour cent les plus bas mesurent les moments lents : plus ils sont proches de la moyenne, plus c'est fluide.",
      "Quatre : si baisser les graphismes ne fait plus monter les FPS, c'est le processeur qui limite. Avec ton 9800X3D, cette limite est très haute."),
    B("dark", [{"k": "chart", "title": "Récapitulatif · RTX 5070 + Ryzen 7 9800X3D · 1440p", "sub": "Réglage conseillé par jeu · FPS moyens réels, sans génération d'images",
                "rows": [("Fortnite · Performance", 330, (280, 380), "e", "Estimation"),
                         ("Warzone · compétitif + DLSS Q", 225, (200, 250), "e", "Estimation"),
                         ("Call of Duty · réglages max", 125, (105, 150), "e", "Estimation"),
                         ("Forza Horizon 6 · Extrême", 112, None, "m", "TechSpot"),
                         ("Cyberpunk 2077 · Ultra sans RT", 103, None, "m", "CGMagazine"),
                         ("FH6 · Extrême + RT + DLSS Q", 80, (75, 85), "e", "Estimation"),
                         ("FH6 · Extrême + RT · natif", 56, None, "m", "TechSpot")],
                "max": 420, "ref": [60, 360], "compact": True}],
      "Le récapitulatif : en rose, les 360 hertz de ton écran ; en gris, les 60 images par seconde.",
      "Fortnite s'approche des 360 hertz, Warzone est très confortable, et Forza Horizon 6 reste au-dessus de 60 avec les réglages conseillés.",
      "Et entre 60 et 120, la synchronisation adaptative garde une image fluide."),
    B("dark", [{"k": "sourcetable"}],
      "Voici le détail de chaque mesure : définition, réglages, DLSS, processeur, carte graphique et source.",
      "Les estimations, elles, varient selon la version du jeu et la scène."),
]))

# 10 — REFROIDISSEMENT ET QUALITÉ
SCENES.append(("cooling", [
    chapter("09", "REFROIDISSEMENT & QUALITÉ", "Des températures maîtrisées, même après des heures"),
    B(["p:aio", "pz:aio:0.0,0.0,0.62,1.0", "pz:aio:0.56,0.0,1.0,1.0"], [chips("Arctic Liquid Freezer III Pro 360 A-RGB", "WATERCOOLING TOUT-EN-UN", ["Radiateur 360 mm · 38 mm d'épaisseur", "3 ventilateurs P12 Pro A-RGB", "Pompe PWM + ventilateur VRM"])],
      "Côté refroidissement : l'Arctic Liquid Freezer 3 Pro de 360 millimètres.",
      "Un watercooling tout-en-un, avec un radiateur de 38 millimètres d'épaisseur et trois ventilateurs RGB de 120 millimètres."),
    B("dark", [{"k": "loop"}],
      "La pompe, posée sur le processeur, absorbe sa chaleur grâce à un liquide en boucle fermée.",
      "Le liquide chaud rejoint le radiateur, où les trois ventilateurs soufflent l'air à travers de fines ailettes et évacuent la chaleur.",
      "Refroidi, il revient vers le processeur, en continu. Un petit ventilateur sur la pompe refroidit même l'alimentation de la carte mère."),
    B("dark", [{"k": "temps"}],
      "Le liquide absorbe beaucoup de chaleur : en longue session, la température monte lentement, puis se stabilise.",
      "Pour un 9800X3D, ce watercooling est largement dimensionné : ventilateurs lents, PC silencieux, même après des heures."),
    B("p:case", [{"k": "airflow"}],
      "Le boîtier Corsair complète l'ensemble.",
      "Trois ventilateurs aspirent l'air frais par la façade perforée ; l'air chaud ressort par le haut et l'arrière.",
      "L'espace est généreux : radiateurs de 360 millimètres, cartes graphiques jusqu'à 405 millimètres, et une structure modulaire."),
    B(["pz:case:0.45,0.15,1.0,0.85", "p:case"], [{"k": "rgb"}],
      "Et c'est une vraie vitrine : noir et violet, bleu glacier, rose néon, ou arc-en-ciel, à toi de choisir.", energy=0.9),
]))

# 11 — ÉVOLUTIONS
SCENES.append(("upgrade", [
    chapter("10", "LES ÉVOLUTIONS POSSIBLES", "Rien d'indispensable, tout est possible"),
    B("dark", [{"k": "upgrade"}],
      "Et dans un ou deux ans ? Précision : rien de tout ça n'est installé, ni indispensable.",
      "Option un : la RTX 5070 Ti, environ 20 à 25 pour cent plus rapide en 1440p, avec 16 gigaoctets, pour 300 watts.",
      "Nvidia recommande 750 watts : ton alimentation actuelle convient.",
      "Option deux : la RTX 5080, environ 35 à 45 pour cent plus rapide selon mon estimation, avec 16 gigaoctets, mais 360 watts.",
      "Nvidia recommande alors 850 watts : changer d'alimentation serait le choix prudent."),
    B("dark", [{"k": "fit"}],
      "Côté taille, la plupart des 5070 Ti et 5080 mesurent 30 à 34 centimètres, et ton boîtier accepte 405 millimètres. Il suffira de vérifier le modèle choisi.",
      "Et le 9800X3D a largement les épaules pour une carte plus puissante."),
]))

# 12 — CONCLUSION
SCENES.append(("outro", [
    chapter("11", "CONCLUSION", "Ton futur setup"),
    B("p:case", [{"k": "bullets", "title": "Ce que tu vas recevoir",
                  "items": ["Un des meilleurs CPU gaming : Ryzen 7 9800X3D", "RTX 5070 · DLSS 4 · taillée pour le 1440p", "32 Go DDR5-6000 · watercooling 360 mm", "OLED 360 Hz + second écran 240 Hz"]}],
      "Alors, que retenir ?",
      "Une machine équilibrée, sans maillon faible : un processeur gaming de pointe, une carte taillée pour le 1440p, un refroidissement silencieux, et un écran OLED 360 hertz qui sublime chaque image.", energy=0.95),
    B([FH + "75.1", FH + "36.1"], [],
      "D'un côté, le Japon de Forza Horizon 6 en ray tracing, et une machine prête pour l'avenir.", dim=0.0, energy=1.0),
    B(["c:wz_0@105.2", "c:wz_0@119.2"], [],
      "De l'autre, Fortnite et Warzone avec une fluidité de niveau compétitif.", dim=0.0, energy=1.0),
    B([FH + "0.2", FH + "68.2", FH + "84.2"], [],
      "Aucune machine n'est parfaite en tout, mais pour ce que tu veux faire, c'est un choix remarquablement intelligent.",
      "Il ne reste plus qu'à attendre la livraison. Et franchement, l'attente en vaut la peine.", dim=0.0, energy=1.0),
    B("p:hero", [{"k": "title", "text": "BON JEU !", "sub": "Ryzen 7 9800X3D · RTX 5070 · OLED 360 Hz"}, {"k": "tag", "text": "VISUEL D'ILLUSTRATION · image générée"}],
      "Bon jeu !", energy=1.0),
    B("dark", [{"k": "credits"}], dur=12.0, dim=0.8),
]))

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
    "TechSpot / Hardware Unboxed — Forza Horizon 6 (47 GPU) ; Ryzen 7 9800X3D ; RTX 5070 (VRAM)",
    "ComputerBase — Forza Horizon 6 (WQHD, recommandations VRAM)  ·  CGMagazine — RTX 5070 / Cyberpunk 2077",
    "TechPowerUp — RTX 5070 Founders Edition  ·  Digital Foundry — Forza Horizon 6 PC / Xbox",
    "Rockstar Games — GTA VI  ·  NVIDIA — alimentations recommandées RTX 50  ·  Corsair — compatibilité FRAME 4000D",
    "Fiches constructeurs : AMD, NVIDIA, MSI, Gigabyte (MO27Q3 : zone d'affichage 590,42 × 333,72 mm), AOC, Kioxia, be quiet!, Arctic, Patriot",
    "Photos produits : fournies par le destinataire (visuels des fabricants / revendeurs) · page de titre : visuel d'illustration généré",
    "Images de jeu : bandes-annonces et captures officielles (Steam) — propriété de leurs éditeurs",
    "Fortnite, GTA VI et comparaison Warzone : illustrations / simulations originales, pas des captures de jeu",
    "Narration : voix de synthèse · Musique et effets : compositions générées · Usage privé uniquement",
]
