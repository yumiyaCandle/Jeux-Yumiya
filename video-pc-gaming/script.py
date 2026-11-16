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
WZ = "c:wz_0@"
SCENES = []

# 1 — INTRODUCTION CINÉMATOGRAPHIQUE
SCENES.append(("intro", [
    B([FH + "0.2", FH + "3.1", WZ + "28.4", FH + "43.2"], [{"k": "kicker", "text": "FORTNITE · CALL OF DUTY · FORZA HORIZON 6 · GTA VI"}], dur=8.0, dim=0.05, energy=1.0),
    B([FH + "20.1", WZ + "36.2", FH + "43.3", FH + "75.4"], [],
      "Imagine un instant.",
      "Le mont Fuji au loin, une route de montagne, et une voiture qui n'attend que toi.",
      "Tout ça sur un écran OLED à 360 hertz, avec des noirs parfaits et des couleurs éclatantes.",
      "Ce n'est pas un rêve : c'est ce que ton futur PC gaming va te permettre de vivre.", dim=0.05, energy=1.0),
    B("p:hero", [{"k": "title", "text": "TON FUTUR PC GAMING", "sub": "Fortnite · Call of Duty · Forza Horizon 6 · GTA VI"}, {"k": "tag", "text": "VISUEL D'ILLUSTRATION · image générée"}],
      "Fortnite, Call of Duty, Forza Horizon 6, et bientôt GTA VI : voici ce que ta nouvelle machine va donner dans tes jeux.",
      "Avec de vrais benchmarks, des estimations clairement signalées, et sans rien enjoliver.",
      "Installe-toi. On commence.", energy=0.95),
]))

# 2 — TON SETUP EN BREF
SCENES.append(("setup", [
    chapter("01", "TON SETUP", "La machine, en quelques minutes"),
    B("dark", [{"k": "grid"}],
      "Voici ta configuration complète.",
      "Le processeur AMD Ryzen 7 9800X3D, et la carte graphique MSI GeForce RTX 5070 Ventus, en version OC.",
      "32 gigaoctets de Patriot Viper Venom en DDR5, et un watercooling Arctic Liquid Freezer 3 Pro de 360 millimètres.",
      "La carte mère Gigabyte B650 Gaming X AX V2, un SSD Kioxia d'un téraoctet, et une alimentation be quiet! de 750 watts.",
      "Le tout dans un boîtier Corsair FRAME 4000D RS ARGB, en noir.", energy=1.0),
    B(["p:cpu", "pz:cpu:0.42,0.52,0.99,0.99"], [chips("AMD Ryzen 7 9800X3D", "PROCESSEUR · SOCKET AM5", ["8 cœurs / 16 threads · Zen 5", "Jusqu'à 5,2 GHz", "96 Mo de cache L3 · 3D V-Cache"])],
      "Le cœur du système, c'est le Ryzen 7 9800X3D : huit cœurs, et surtout 96 mégaoctets de cache grâce à la technologie 3D V-Cache.",
      "On va voir dans Fortnite et dans Warzone pourquoi ce détail change tout."),
    B(["p:gpu", "pz:gpu:0.40,0.42,1.0,0.99"], [chips("MSI RTX 5070 Ventus 2X OC", "CARTE GRAPHIQUE · NVIDIA BLACKWELL", ["12 Go de GDDR7", "DLSS 4 · génération d'images", "Ray tracing · Reflex"])],
      "Pour l'image, la MSI RTX 5070 Ventus, avec 12 gigaoctets de mémoire vidéo, le ray tracing et le DLSS 4.",
      "Selon TechPowerUp, elle est environ 20 pour cent devant une RTX 4070 en 1440p, au niveau d'une RTX 4070 Super. Une carte taillée pour la définition de ton écran."),
    B(["p:ram", "p:mobo", "p:ssd", "p:psu"], [chips("Le reste de la machine", "SANS MAILLON FAIBLE", ["32 Go DDR5-6000 · Patriot Viper Venom", "Gigabyte B650 · Wi-Fi 6E + Bluetooth", "SSD NVMe Kioxia 1 To · PCIe 4.0", "be quiet! 750 W · 80 PLUS Gold"])],
      "Autour, 32 gigaoctets de DDR5 à 6000 mégahertz, une carte mère Gigabyte avec Wi-Fi 6E, un SSD NVMe d'un téraoctet et une alimentation be quiet! de 750 watts.",
      "Rien d'exotique : des composants bien choisis, et aucun maillon faible."),
    B(["p:aio", "pz:aio:0.0,0.0,0.62,1.0", "p:case"], [chips("Refroidissement & boîtier", "SILENCE ET STYLE", ["Watercooling Arctic 360 mm", "Corsair FRAME 4000D · façade aérée", "RGB personnalisable"])],
      "Le watercooling Arctic de 360 millimètres et le boîtier Corsair très aéré gardent le tout au frais et silencieux, même après des heures de jeu.",
      "Et avec leur RGB, ton PC devient une vraie vitrine.", energy=0.9),
    B("dark", [{"k": "duel"}],
      "Côté écrans : ton Gigabyte OLED en 1440p et 360 hertz pour jouer, et l'AOC incurvé en 1080p et 240 hertz à côté, pour Discord ou un guide."),
    B("dark", [{"k": "duo"}],
      "Pourquoi ce duo est-il si intéressant ?",
      "En jeu compétitif, réglages bas, c'est le processeur qui fixe la limite. Et c'est là que le 9800X3D excelle.",
      "Dans un jeu très beau, c'est l'inverse : la RTX 5070 et son DLSS prennent le relais.",
      "Un processeur qui ne freine jamais, une carte efficace : l'idéal pour faire les deux."),
]))

# 3 — FORTNITE
SCENES.append(("fortnite", [
    chapter("02", "FORTNITE", "Mode Performance · 360 Hz · réglages compétitifs", bg="fn:storm"),
    B(["fn:run", "fn:build", "fn:fight"], [{"k": "fn_tag"}],
      "Commençons par Fortnite, où la fluidité fait la différence.",
      "Son mode Performance simplifie l'affichage et soulage énormément la carte graphique.",
      "C'est alors le processeur qui fixe les FPS, et ton 9800X3D est l'un des meilleurs dans ce rôle.", energy=0.9),
    B("fn:storm", [{"k": "vcache"}, {"k": "fn_tag"}],
      "Pourquoi ton processeur brille ici ? Grâce à la 3D V-Cache : 64 mégaoctets de cache ajoutés contre la puce, 96 au total.",
      "Cette mémoire ultra-rapide, placée juste à côté des cœurs, évite d'aller chercher les données dans la mémoire vive, bien plus lente.",
      "Résultat : plus d'images par seconde, et des images plus régulières.", dim=0.72),
    B("fn:fight", [{"k": "chart", "title": "La preuve par la mesure · test processeur", "sub": "Counter-Strike 2 · FPS moyens · CPU testés avec une RTX 4090 pour supprimer la limite graphique",
                    "rows": [("Ryzen 7 9800X3D", 668, None, "m", "TechSpot", "1080p · RT non · DLSS non · 1 % low : non relevé ici"),
                             ("Ryzen 7 7800X3D", 591, None, "m", "TechSpot", "1080p · même banc · écart mesuré : −13 %")], "max": 760}, {"k": "fn_tag"}],
      "Dans les tests de TechSpot, avec une RTX 4090, le 9800X3D atteint 668 images par seconde dans Counter-Strike 2 en 1080p : 13 pour cent de plus que le 7800X3D, l'ancien champion.",
      "C'est l'un des meilleurs processeurs gaming du marché.", dim=0.7),
    B("fn:split", [{"k": "fn_tag"}],
      "Voici le principe, en illustration : à gauche, le mode Performance, avec des formes simplifiées et sans effets superflus, pour une lisibilité maximale.",
      "À droite, le rendu Épique en DirectX 12, avec un éclairage dynamique, des ombres et des effets bien plus riches."),
    B("fn:run", [{"k": "hz"}, {"k": "fn_tag"}],
      "Et puis il y a les 360 hertz : jusqu'à 360 images différentes par seconde.",
      "À 60 hertz, une image reste affichée 16,7 millisecondes. À 240 hertz, comme ton écran AOC, 4,2. Et à 360 hertz, seulement 2,8.",
      "Dans Fortnite ou Warzone : des mouvements ultra fluides, des adversaires plus lisibles, et un affichage plus réactif.",
      "Et si un jeu n'atteint pas 360 images par seconde, la synchronisation adaptative aligne l'écran sur la carte graphique : à 90 comme à 300, l'image reste fluide.", dim=0.8),
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

# 4 — CALL OF DUTY / WARZONE
SCENES.append(("cod", [
    chapter("03", "CALL OF DUTY · WARZONE", "Fluidité, régularité, lisibilité", bg="i:wz_02"),
    B([WZ + "3.2", WZ + "28.4", WZ + "36.2"], [],
      "Place à Call of Duty et Warzone : de grandes cartes, des dizaines de joueurs, et des explosions partout.", dim=0.05, energy=1.0),
    B([WZ + "52.2", WZ + "61.3", WZ + "108.4"], [],
      "Le processeur suit énormément de joueurs et d'objets : le cache 3D du 9800X3D garde l'image stable dans les combats chargés.",
      "La RTX 5070 apporte un rendu détaillé, et le DLSS un supplément de fluidité.", dim=0.1, energy=0.9),
    B([WZ + "15.2", WZ + "19.2", WZ + "69.2"], [],
      "Des villes entières, des toits, des rues étroites : chaque combat peut éclater à longue distance ou au corps à corps.",
      "Pour repérer un adversaire au loin, la définition 1440p de ton écran OLED aide vraiment : l'image est plus fine, et les détails lointains plus lisibles.", dim=0.05, energy=0.95),
    B([WZ + "77.2", WZ + "88.2"], [],
      "Et quand tu vises à travers une lunette, les 360 hertz rendent chaque mouvement de caméra plus net.",
      "Avec plus de 200 images par seconde en compétitif, tu profites déjà largement de la fréquence élevée de ton écran.", dim=0.05, energy=0.95),
    B([WZ + "113.2", WZ + "45.2"], [chips("La régularité compte", "1 % LOW · FLUIDITÉ RESSENTIE", ["Moyenne = vitesse globale", "1 % low = les moments les plus chargés", "Plus ils sont proches, plus c'est fluide"])],
      "Dans Warzone, la moyenne ne dit pas tout : ce qui compte, ce sont les moments les plus chargés.",
      "Les 1 pour cent les plus bas mesurent justement ces instants, et le cache du 9800X3D aide à les garder élevés.", dim=0.3),
    B("split:wz_0@90.2", [],
      "Pour bien comprendre la différence entre réglages compétitifs et réglages élevés, voici une simulation du principe.",
      "Les réglages compétitifs suppriment ce qui gêne la vue, comme le flou ou certains effets, tandis que les réglages élevés privilégient l'ambiance et les détails.", dim=0.0),
    B(WZ + "96.2", [{"k": "chart", "title": "Call of Duty · RTX 5070", "sub": "FPS moyens · fourchettes issues de tests aux conditions variées",
                     "rows": [("Réglages maximum · natif", 125, (105, 150), "e", "Estimation", "1440p · tests Black Ops 6 · DLSS non · CPU variés"),
                              ("Compétitif · Warzone", 225, (200, 250), "e", "Estimation", "1440p · réglages bas · DLSS Qualité · Reflex · FG non")],
                     "max": 420, "ref": [60, 360]}],
      "Les tests publiés pour Black Ops 6 situent la RTX 5070 entre 105 et 150 images par seconde en 1440p, réglages maximum. Leurs conditions varient : je les classe en estimation.",
      "En compétitif, avec le DLSS Qualité et Reflex, j'estime 200 à 250 images par seconde sur Warzone.", dim=0.65),
    B([WZ + "119.2", WZ + "54.2"], [{"k": "settings", "title": "Réglages conseillés · Warzone",
                                   "rows": [("Préréglage", "Bas / personnalisé"), ("Upscaling", "DLSS · Qualité"), ("Nvidia Reflex", "Activé + boost"),
                                            ("Textures", "Moyennes à élevées"), ("Effets & flou", "Désactivés")]}],
      "Mon conseil : garde des textures élevées, mais coupe les effets et le flou de mouvement.",
      "Résultat : une image propre et une réactivité de niveau compétitif.", dim=0.4),
    B([WZ + "96.6", WZ + "131.0"], [], dur=4.0, dim=0.0, energy=1.0),
]))

# 5 — FORZA HORIZON 6
SCENES.append(("fh6", [
    chapter("04", "FORZA HORIZON 6", "La beauté du Japon", bg="i:fh6_bg"),
    B([FH + "0.2", FH + "3.1", FH + "6.2", FH + "10.1", FH + "68.2"], [{"k": "gametitle", "text": "FORZA HORIZON 6", "sub": "Images officielles · Playground Games"}], dur=9.0, dim=0.0, energy=1.0),
    B([FH + "7.3", FH + "50.3"], [],
      "Et voici le jeu qui va sans doute le plus tourner sur ton PC : Forza Horizon 6.",
      "Ici, on cherche la plus belle image possible, avec une excellente fluidité.", dim=0.0, energy=1.0),
    B(["i:fh6_05", FH + "43.1", FH + "74.1"], [],
      "Imagine les rues de Tokyo de nuit dans Forza Horizon 6 : c'est exactement là que l'OLED brille.", dim=0.0, energy=1.0),
    B("dark", [{"k": "oled"}],
      "Sur un LCD, un rétroéclairage reste allumé : les noirs sont en réalité gris foncé.",
      "Sur un OLED, chaque pixel s'éteint complètement : noirs parfaits, contraste quasi infini, couleurs éclatantes."),
    B([FH + "36.2", FH + "25.1"], [],
      "Les routes de montagne qui serpentent entre les forêts,", dim=0.0, energy=1.0),
    B([FH + "30.2", "i:fh6_07", FH + "50.2"], [],
      "les murs de neige vertigineux, les cerisiers en fleurs et les forêts d'automne.", dim=0.0, energy=1.0),
    B([FH + "52.2", FH + "70.1", FH + "72.1"], [],
      "Les textures de l'asphalte, la peinture métallisée, les jantes chromées : c'est bluffant.", dim=0.0, energy=1.0),
    B("dark", [{"k": "res", "img": "fh6_06"}],
      "Côté définition, le 1440p affiche 3,7 millions de pixels, contre 2,1 millions en 1080p : 78 pour cent de pixels en plus.",
      "Pour les beaux jeux, c'est une image plus fine et des paysages lointains bien plus précis."),
    B(["i:fh6_00", FH + "12.1"], [chips("Options graphiques PC", "FORZA HORIZON 6", ["Illumination globale en ray tracing", "Reflets en ray tracing quasi miroir", "DLSS 4.5 · génération d'images", "Réglages fins · FPS débloqués"])],
      "Sur PC, le jeu propose une illumination globale en ray tracing, pour une lumière plus naturelle, et des reflets quasi miroir.",
      "Pour Digital Foundry, c'est la principale amélioration de la version PC.", dim=0.25),
    B(FH + "56.1", [{"k": "dlss"}],
      "Pour garder une belle fluidité avec le ray tracing, ta carte a un atout : le DLSS 4.",
      "La carte calcule l'image en plus basse définition, puis une IA la reconstruit en 1440p. En mode Qualité, le rendu reste très proche du natif, avec bien plus de fluidité.",
      "La génération d'images, elle, insère des images créées par l'IA entre les vraies : le compteur grimpe, mais la réactivité reste celle des vraies images.",
      "Ici, FPS réels et FPS générés sont donc toujours séparés.", dim=0.85),
    B(FH + "13.1", [{"k": "chart", "title": "Forza Horizon 6 · RTX 5070", "sub": "FPS moyens · conditions de test sous chaque barre",
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
    B([FH + "64.1", FH + "66.1"], [chips("12 Go de VRAM", "LE POINT DE VIGILANCE", ["Recommandé en 1440p par ComputerBase", "Limite possible : textures max + RT très poussé", "Solution : baisser d'un cran les textures"])],
      "Un mot honnête sur les 12 gigaoctets de mémoire vidéo : ComputerBase les recommande pour Forza Horizon 6 en 1440p, ta carte est donc pile dans la cible.",
      "Dans quelques jeux très gourmands, avec textures maximales et ray tracing très poussé, ils peuvent devenir une limite : il suffit alors de baisser d'un cran les textures.", dim=0.35),
    B(FH + "45.1", [{"k": "settings", "title": "Réglages conseillés · Forza Horizon 6",
                     "rows": [("Préréglage", "Extrême"), ("Ray tracing", "Activé"), ("Upscaling", "DLSS · Qualité"),
                              ("Génération d'images", "En balade / photo"), ("Course en ligne", "RT désactivé · >110 FPS")]}],
      "Mon réglage idéal : Extrême, ray tracing activé, DLSS Qualité, et génération d'images en balade.",
      "En ligne, coupe le ray tracing pour dépasser 110 images par seconde.", dim=0.45),
    B(FH + "50.1", [{"k": "versus"}],
      "Face à la Xbox Series X, Digital Foundry décrit un mode 60 images par seconde en 4K dynamique, et un mode 4K native à 30 images par seconde, avec un ray tracing limité.",
      "Ton PC, en 1440p, va bien au-delà des 60 images par seconde avec plus de ray tracing. La console garde ses atouts : un prix plus bas et aucun réglage.", dim=0.78),
    B([FH + "73.2", FH + "84.6"], [], dur=4.0, dim=0.0, energy=1.0),
]))

# 6 — GTA VI
SCENES.append(("gta", [
    chapter("05", "GTA VI", "Ce que l'on sait vraiment", bg="gta"),
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
    B("dark", [{"k": "upgrade"}],
      "Et si GTA VI, ou un autre jeu futur, se montre très exigeant sur PC ? Ton PC pourra évoluer, sans que ce soit indispensable aujourd'hui.",
      "Option un : la RTX 5070 Ti, environ 20 à 25 pour cent plus rapide en 1440p, avec 16 gigaoctets, pour 300 watts.",
      "Nvidia recommande 750 watts : ton alimentation actuelle convient.",
      "Option deux : la RTX 5080, environ 35 à 45 pour cent plus rapide selon mon estimation, avec 16 gigaoctets, mais 360 watts.",
      "Nvidia recommande alors 850 watts : changer d'alimentation serait le choix prudent."),
    B("dark", [{"k": "fit"}],
      "Côté taille, la plupart des 5070 Ti et 5080 mesurent 30 à 34 centimètres, et ton boîtier accepte 405 millimètres. Il suffira de vérifier le modèle choisi.",
      "Et le 9800X3D a largement les épaules pour une carte plus puissante."),
]))

# 7 — TES JEUX EN CHIFFRES
SCENES.append(("bench", [
    chapter("06", "TES JEUX EN CHIFFRES", "Le récapitulatif"),
    B("dark", [{"k": "legend"}],
      "Quelques clés pour lire les chiffres.",
      "Badge vert : une mesure réelle, publiée par un média spécialisé. Badge orange : une estimation."),
    B(FH + "20.4", [{"k": "chart", "title": "Récapitulatif · RTX 5070 + Ryzen 7 9800X3D · 1440p", "sub": "Réglage conseillé par jeu · FPS moyens réels, sans génération d'images",
                     "rows": [("Fortnite · Performance", 330, (280, 380), "e", "Estimation"),
                              ("Warzone · compétitif + DLSS Q", 225, (200, 250), "e", "Estimation"),
                              ("Call of Duty · réglages max", 125, (105, 150), "e", "Estimation"),
                              ("Forza Horizon 6 · Extrême", 112, None, "m", "TechSpot"),
                              ("FH6 · Extrême + RT + DLSS Q", 80, (75, 85), "e", "Estimation"),
                              ("FH6 · Extrême + RT · natif", 56, None, "m", "TechSpot"),
                              ("GTA VI · version PC", 0, None, "na", "Non annoncée")],
                     "max": 420, "ref": [60, 360], "compact": True}],
      "Le récapitulatif : en rose, les 360 hertz de ton écran ; en gris, les 60 images par seconde.",
      "Fortnite s'approche des 360 hertz, Warzone est très confortable, et Forza Horizon 6 reste au-dessus de 60 avec les réglages conseillés.",
      "Pour GTA VI, pas de chiffre tant que la version PC n'existe pas.", dim=0.82),
    B("dark", [{"k": "sourcetable"}],
      "Voici le détail de chaque mesure : définition, réglages, DLSS, processeur, carte graphique et source.",
      "Les estimations, elles, varient selon la version du jeu et la scène."),
]))

# 8 — CONCLUSION
SCENES.append(("outro", [
    chapter("07", "CONCLUSION", "Ton futur setup"),
    B("p:case", [{"k": "bullets", "title": "Ce que tu vas recevoir",
                  "items": ["Fortnite & Warzone : fluidité de niveau compétitif", "Forza Horizon 6 : 1440p, ray tracing, OLED", "GTA VI : une base solide, prête à évoluer", "OLED 360 Hz + second écran 240 Hz"]}],
      "Alors, que retenir ?",
      "Une machine équilibrée, sans maillon faible : un processeur gaming de pointe, une carte taillée pour le 1440p, un refroidissement silencieux, et un écran OLED 360 hertz qui sublime chaque image.", energy=0.95),
    B([FH + "75.1", FH + "36.1"], [],
      "D'un côté, le Japon de Forza Horizon 6 en ray tracing, et une machine prête pour l'avenir.", dim=0.0, energy=1.0),
    B([WZ + "105.2", WZ + "119.2"], [],
      "De l'autre, Fortnite et Warzone avec une fluidité de niveau compétitif.", dim=0.0, energy=1.0),
    B([FH + "0.2", FH + "68.2", FH + "84.2"], [],
      "Aucune machine n'est parfaite en tout, mais pour ce que tu veux faire, c'est un choix remarquablement intelligent.",
      "Il ne reste plus qu'à attendre la livraison. Et franchement, l'attente en vaut la peine.", dim=0.0, energy=1.0),
    B("p:hero", [{"k": "title", "text": "BON JEU !", "sub": "Fortnite · Call of Duty · Forza Horizon 6 · GTA VI"}, {"k": "tag", "text": "VISUEL D'ILLUSTRATION · image générée"}],
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
