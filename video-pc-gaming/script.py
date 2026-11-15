# -*- coding: utf-8 -*-
"""Scénario complet de la vidéo : narration (FR), visuels et données de benchmark.

Chaque scène = liste de « beats ». Un beat = un visuel de fond + des overlays
+ les phrases de narration lues pendant ce visuel. La durée d'un beat est
calculée à partir de la durée réelle de la voix.

Fonds :
  "c:<clip>@<sec>"  extrait vidéo (bande-annonce officielle Steam)
  "i:<image>"       capture d'écran officielle Steam (effet Ken Burns)
  "dark"            fond animé noir / rouge / RGB
  "hero"            fond animé + illustration du PC

Statut des chiffres : "m" = mesuré (média spécialisé cité),
                      "e" = estimation, "fg" = avec génération d'images.
"""

def B(bg, ov=None, *s, dur=None, dim=None):
    return {"bg": bg, "ov": ov or [], "s": list(s), "dur": dur, "dim": dim}

def chapter(num, title, sub, bg="dark"):
    return B(bg, [{"k": "chapter", "num": num, "title": title, "sub": sub}], dur=3.2, dim=0.75)

SOURCES_TS = "TechSpot"

# ---------------------------------------------------------------- SCÈNES
SCENES = []

# 1 — INTRO CINÉMATOGRAPHIQUE
SCENES.append(("intro", [
    B("c:fh6_1@3.0", [{"k": "kicker", "text": "FORZA HORIZON 6 · JAPON"}],
      "Imagine un instant.",
      "Le mont Fuji au loin, un champ de fleurs à perte de vue, et une route de montagne qui t'attend.", dim=0.15),
    B("c:fh6_1@42", [],
      "Tout ça, sur un écran OLED de 360 hertz, avec des noirs parfaits et des couleurs qui claquent.",
      "Ce n'est pas un rêve : c'est ce que ton futur PC gaming va te permettre de vivre.", dim=0.15),
    B("hero", [{"k": "title", "text": "TON FUTUR PC GAMING", "sub": "Ryzen 7 9800X3D  ·  RTX 5070  ·  OLED 360 Hz", "side": "right"}],
      "Ryzen 7 9800X3D, GeForce RTX 5070, 32 gigaoctets de DDR5, un watercooling de 360 millimètres, le tout dans un boîtier noir illuminé de RGB.",
      "Dans cette vidéo, on va décortiquer cette machine pièce par pièce, regarder ce qu'elle donne vraiment en jeu, avec de vrais benchmarks, et sans jamais enjoliver la réalité.",
      "Installe-toi. On commence."),
]))

# 2 — LA CONFIGURATION
SCENES.append(("config", [
    chapter("01", "LA CONFIGURATION", "Huit composants, une machine cohérente"),
    B("hero", [{"k": "complist", "side": "right"}],
      "Commençons par la fiche technique complète.",
      "Au cœur de la machine, le processeur AMD Ryzen 7 9800X3D.",
      "Pour l'image, une MSI GeForce RTX 5070 Ventus 2X OC, avec 12 gigaoctets de mémoire vidéo.",
      "Côté mémoire vive, 32 gigaoctets de Patriot Viper Venom en DDR5 à 6000 mégahertz.",
      "Le refroidissement est confié à un Arctic Liquid Freezer III Pro 360 A-RGB, sur une carte mère Gigabyte B650 Gaming X AX V2.",
      "Et on complète avec un SSD Kioxia Exceria Plus G3 d'un téraoctet, une alimentation be quiet! Pure Power 13 M de 750 watts, et un boîtier Corsair FRAME 4000D RS ARGB noir."),
    B("dark", [{"k": "component", "id": "ram"}],
      "Trente-deux gigaoctets, c'est aujourd'hui la quantité idéale pour un PC de jeu.",
      "Les jeux récents dépassent souvent 16 gigaoctets avec un navigateur, Discord et un lanceur ouverts en arrière-plan. Avec 32, tu as de la marge pour plusieurs années.",
      "Et 6000 mégahertz, c'est la fréquence recommandée pour les Ryzen 9000 : le meilleur équilibre entre performance et stabilité, en activant simplement le profil EXPO dans le BIOS."),
    B("dark", [{"k": "component", "id": "aio"}],
      "Le Liquid Freezer III Pro 360, c'est un radiateur de 36 centimètres et trois ventilateurs A-RGB.",
      "Le 9800X3D chauffe raisonnablement, donc ce watercooling est largement dimensionné : des températures basses, des ventilateurs qui tournent lentement, et donc un PC silencieux.",
      "Et esthétiquement, ces trois couronnes lumineuses vont donner énormément de caractère au boîtier."),
    B("dark", [{"k": "component", "id": "mobo"}],
      "La carte mère Gigabyte B650 Gaming X AX V2 intègre le Wi-Fi 6E et le Bluetooth : pas besoin de câble réseau si ta box est loin.",
      "Elle repose sur la plateforme AM5, qu'AMD continue de faire évoluer : c'est une vraie porte ouverte pour les améliorations futures."),
    B("dark", [{"k": "component", "id": "ssd"}],
      "Le SSD Kioxia Exceria Plus G3 est un modèle NVMe en PCIe 4.0, annoncé jusqu'à 5000 mégaoctets par seconde en lecture.",
      "Concrètement : Windows démarre en quelques secondes, et les chargements sont rapides.",
      "Seul point à surveiller : un téraoctet se remplit vite. Un jeu comme Call of Duty peut occuper à lui seul plus d'une centaine de gigaoctets."),
    B("dark", [{"k": "component", "id": "psu"}],
      "L'alimentation be quiet! Pure Power 13 M de 750 watts est certifiée 80 Plus Gold, modulaire, et compatible ATX 3.1, avec le connecteur dédié aux cartes graphiques récentes.",
      "Ta RTX 5070 consomme environ 250 watts, et le processeur rarement plus de 120 watts en jeu : il te reste une marge confortable."),
    B("dark", [{"k": "component", "id": "case"}],
      "Enfin, le Corsair FRAME 4000D RS ARGB : un boîtier moyen tour modulaire, livré avec trois ventilateurs RS120 ARGB.",
      "Il accepte les radiateurs de 360 millimètres, et sa façade très aérée laisse respirer les composants.",
      "Noir, vitré, avec un éclairage synchronisé : c'est une vraie vitrine pour ta configuration."),
]))

# 3 — CPU + GPU
SCENES.append(("cpugpu", [
    chapter("02", "LE DUO DE CHOC", "Ryzen 7 9800X3D  ×  GeForce RTX 5070"),
    B("dark", [{"k": "component", "id": "cpu"}],
      "Parlons maintenant du cerveau de la machine : le Ryzen 7 9800X3D.",
      "Huit cœurs, seize threads, et surtout une technologie qui change tout pour le jeu : la 3D V-Cache."),
    B("dark", [{"k": "vcache"}],
      "AMD ajoute 64 mégaoctets de cache supplémentaire directement contre la puce, pour un total de 96 mégaoctets de cache L3.",
      "Ce cache, c'est une mémoire ultra-rapide placée juste à côté des cœurs. Les jeux y trouvent leurs données immédiatement, au lieu d'aller les chercher dans la RAM, beaucoup plus lente.",
      "Résultat : plus d'images par seconde, et surtout des images plus régulières."),
    B("c:cs2_0@33", [{"k": "chart", "title": "Counter-Strike 2 · test processeur", "sub": "1080p · RTX 4090 pour éliminer la limite GPU · FPS moyens",
                      "rows": [("Ryzen 7 9800X3D", 668, None, "m", "TechSpot"), ("Ryzen 7 7800X3D", 591, None, "m", "TechSpot (−13 %)")], "max": 760}],
      "Dans les tests de TechSpot, avec une RTX 4090 pour supprimer toute limite graphique, le 9800X3D atteint 668 images par seconde dans Counter-Strike 2 en 1080p, soit 13 pour cent de plus que le 7800X3D, l'ancien champion.",
      "C'est l'un des meilleurs processeurs gaming du marché, et exactement ce qu'il faut pour viser les 360 hertz de ton écran.", dim=0.6),
    B("dark", [{"k": "component", "id": "gpu"}],
      "Pour la partie graphique, la RTX 5070 de MSI, en version Ventus 2X OC.",
      "Architecture Blackwell, 12 gigaoctets de mémoire GDDR7, et environ 250 watts de consommation.",
      "En rastérisation pure, elle se place au niveau d'une RTX 4070 Super, et environ 20 pour cent devant une RTX 4070 en 1440p, selon TechPowerUp.",
      "C'est une carte taillée pour le 1440p, exactement la définition de ton écran."),
    B("dark", [{"k": "dlss"}],
      "Sa grande force, c'est le DLSS 4.",
      "Le principe : la carte calcule l'image dans une définition plus basse, puis une intelligence artificielle la reconstruit en 1440p. En mode Qualité, le rendu reste très proche du natif, avec beaucoup plus de fluidité.",
      "Il y a aussi la génération d'images, qui insère des images créées par l'IA entre les vraies images. Le compteur grimpe fortement, mais la réactivité reste celle des vraies images, et la latence augmente légèrement.",
      "C'est pour ça que, dans cette vidéo, on séparera toujours les FPS réels des FPS générés."),
    B("i:cp_05", [{"k": "note", "title": "12 Go de VRAM : le point de vigilance",
                   "lines": ["Suffisant dans la grande majorité des jeux en 1440p", "Peut devenir juste : textures max + ray tracing / path tracing poussé",
                             "Ex. TechSpot : Indiana Jones, path tracing complet", "Solution : baisser d'un cran textures ou ray tracing"]}],
      "Un mot honnête sur les 12 gigaoctets de mémoire vidéo.",
      "En 1440p, c'est suffisant dans la grande majorité des jeux. Mais dans quelques titres très gourmands, avec les textures au maximum et un ray tracing poussé, cette mémoire peut devenir une limite. TechSpot l'a constaté dans Indiana Jones avec le path tracing complet.",
      "La solution est simple : baisser d'un cran la qualité des textures ou du ray tracing dans ces cas précis.", dim=0.65),
]))

# 4 — L'ÉCRAN
SCENES.append(("ecran", [
    chapter("03", "L'ÉCRAN OLED 360 Hz", "Gigabyte MO27Q3  +  AOC C27G2ZU"),
    B("dark", [{"k": "monitor"}],
      "Une machine pareille mérite un écran à sa hauteur. Et c'est le cas.",
      "Ton écran principal, le Gigabyte MO27Q3, c'est une dalle QD-OLED en 2560 par 1440 pixels, à 360 hertz."),
    B("dark", [{"k": "oled"}],
      "La différence avec un écran classique est énorme. Sur un écran LCD, un rétroéclairage reste allumé derrière l'image : les noirs sont en réalité gris foncé.",
      "Sur un OLED, chaque pixel produit sa propre lumière, et peut s'éteindre complètement. Les noirs sont parfaits, le contraste est quasi infini, et les couleurs ressortent avec une intensité incroyable."),
    B("i:fh6_05", [{"k": "kicker", "text": "NOIRS PARFAITS · NÉONS ÉCLATANTS"}],
      "Imagine les rues de Tokyo de nuit dans Forza Horizon 6 : c'est exactement là que l'OLED brille.",
      "Autre atout : le temps de réponse. Gigabyte annonce 0,03 milliseconde, contre plusieurs millisecondes sur un bon LCD. Le mouvement reste net, sans traînée.", dim=0.2),
    B("dark", [{"k": "hz"}],
      "Et puis il y a les 360 hertz. L'écran peut afficher jusqu'à 360 images différentes chaque seconde.",
      "À 60 hertz, une image reste affichée 16,7 millisecondes. À 144 hertz, 6,9. À 360 hertz, seulement 2,8.",
      "Dans Fortnite ou Counter-Strike, ça veut dire des mouvements de caméra ultra fluides, des adversaires plus lisibles quand ils bougent vite, et un affichage plus réactif à chacun de tes gestes.",
      "Bien sûr, tous les jeux n'atteindront pas 360 images par seconde. Mais ce n'est pas un problème : grâce à la synchronisation adaptative, l'écran s'aligne en permanence sur le nombre d'images envoyées par la carte. Que tu sois à 90 ou à 300, l'image reste fluide, sans déchirement."),
    B("dark", [{"k": "res", "img": "fh6_06"}],
      "Côté définition, le 1440p affiche 3,7 millions de pixels, contre 2,1 millions en 1080p : 78 pour cent de pixels en plus.",
      "Sur un écran de cette taille, ça se traduit par une image nettement plus fine, des textes plus lisibles, et des détails lointains bien plus précis.",
      "Ton second écran, l'AOC de 27 pouces en 1080p, sera parfait pour Discord, une vidéo ou un guide pendant que tu joues."),
]))

# 5 — PARTIE A : intro + FH6 focus
SCENES.append(("fh6", [
    chapter("04", "PARTIE A · LA BEAUTÉ AVANT TOUT", "Les jeux aux graphismes spectaculaires", bg="i:fh6_bg"),
    B("i:fh6_bg", [{"k": "legend"}],
      "Place maintenant aux jeux. Première grande partie : les jeux aux graphismes spectaculaires.",
      "Ici, l'objectif n'est pas de battre des records de FPS. On cherche la plus belle image possible, tout en gardant une fluidité confortable, idéalement au-dessus de 60 images par seconde.",
      "Petit rappel pour les chiffres qui suivent : un badge vert indique un benchmark réel, publié par un média spécialisé. Un badge orange indique une estimation, que je t'expliquerai à chaque fois.", dim=0.55),
    B("c:fh6_1@3.0", [{"k": "gametitle", "text": "FORZA HORIZON 6", "sub": "Focus · Japon"}],
      "Et on commence par le jeu qui va sans doute tourner le plus sur ton PC : Forza Horizon 6.",
      "Cette fois, direction le Japon.", dim=0.1),
    B("i:fh6_05", [],
      "Les rues de Tokyo illuminées de néons, avec leurs enseignes qui se reflètent sur les carrosseries.", dim=0.1),
    B("c:fh6_1@6", [],
      "Les routes de montagne qui serpentent entre les forêts, les cols enneigés,", dim=0.1),
    B("c:fh6_1@30", [],
      "les murs de neige vertigineux, les cerisiers en fleurs et les forêts d'automne.", dim=0.1),
    B("i:fh6_07", [],
      "Chaque saison transforme complètement la carte, et le rendu des matériaux, de la peinture métallisée aux jantes chromées, est franchement bluffant.", dim=0.1),
    B("c:fh6_1@51", [],
      "Les voitures sont modélisées avec un niveau de détail incroyable. Et c'est là que le PC peut faire la différence.", dim=0.1),
    B("i:fh6_00", [{"k": "note", "title": "Forza Horizon 6 · options PC",
                    "lines": ["Illumination globale en ray tracing (RTGI)", "Reflets en ray tracing quasi miroir", "DLSS 4.5 · génération d'images", "Réglages individuels, FPS débloqués"]}],
      "Sur PC, le jeu propose de nouvelles options de ray tracing : une illumination globale en ray tracing, qui rend la lumière plus naturelle dans les rues et les forêts, et des reflets en ray tracing d'une précision quasi miroir.",
      "Digital Foundry résume bien la situation : le ray tracing est la principale amélioration de la version PC.", dim=0.45),
    B("c:fh6_1@75", [{"k": "chart", "title": "Forza Horizon 6 · RTX 5070", "sub": "1440p · moyenne des FPS · test TechSpot avec Ryzen 7 9800X3D",
                      "rows": [("Extrême · sans RT · natif", 112, None, "m", "TechSpot"),
                               ("WQHD · protocole ComputerBase", 118, None, "m", "ComputerBase"),
                               ("Extrême + RT · natif", 56, None, "m", "TechSpot"),
                               ("Extrême + RT · DLSS Qualité", 80, (75, 85), "e", "Estimation"),
                               ("Extrême + RT · DLSS Q + Frame Gen ×2", 150, (140, 160), "fg", "Images générées")],
                      "max": 200, "ref": [60]}],
      "Passons aux chiffres, et cette fois ce sont de vrais benchmarks.",
      "TechSpot a testé 47 cartes graphiques. En 1440p natif, préréglage Extrême sans ray tracing, la RTX 5070 atteint 112 images par seconde de moyenne. ComputerBase, de son côté, mesure 118 images par seconde en 1440p avec son propre protocole.",
      "Avec le préréglage Extrême et le ray tracing activé, toujours en natif, TechSpot relève 56 images par seconde.",
      "C'est là que le DLSS entre en jeu. En mode Qualité, j'estime qu'on remonte autour de 75 à 85 images par seconde avec le ray tracing. Et avec la génération d'images, le compteur peut dépasser les 140, mais ce sont des images générées, à ne pas confondre avec des images réelles.", dim=0.72),
    B("c:fh6_1@12", [{"k": "settings", "title": "Réglages conseillés · Forza Horizon 6",
                      "rows": [("Préréglage", "Extrême"), ("Ray tracing", "Activé (RTGI + reflets)"), ("Upscaling", "DLSS · Qualité"),
                               ("Génération d'images", "Option · balade / photo"), ("Course en ligne", "RT désactivé · >110 FPS natifs"), ("VRAM", "12 Go recommandés en 1440p ✓")]}],
      "Mon réglage idéal pour toi : préréglage Extrême, ray tracing activé, DLSS en mode Qualité, et la génération d'images si tu veux maximiser la fluidité visuelle en balade.",
      "Pour les courses en ligne, où la réactivité compte, tu peux couper le ray tracing et viser plus de 110 images par seconde en natif.",
      "Et côté mémoire vidéo, ComputerBase recommande 12 gigaoctets en 1440p : ta carte est pile dans la cible.", dim=0.6),
]))

# 6 — Autres jeux visuels
SCENES.append(("visuels", [
    B("c:fh5_1@18", [{"k": "gametitle", "text": "FORZA HORIZON 5", "sub": "Mexique"}],
      "Petit détour par le Mexique avec Forza Horizon 5.",
      "Déserts, jungles, villages colorés, volcans : le jeu reste magnifique, et très bien optimisé.", dim=0.1),
    B("c:fh5_1@39", [{"k": "chart", "title": "Forza Horizon 5 · RTX 5070", "sub": "1440p · préréglage Extrême · natif",
                      "rows": [("Extrême · natif", 130, (120, 140), "e", "Estimation")], "max": 200, "ref": [60]}],
      "En 1440p, préréglage Extrême, j'estime la RTX 5070 entre 120 et 140 images par seconde en natif. C'est une estimation, basée sur les tests de cartes de puissance équivalente.",
      "Tu peux tout mettre au maximum, et profiter d'une fluidité excellente sur ton écran 360 hertz.", dim=0.6),
    B("i:cp_bg", [{"k": "gametitle", "text": "CYBERPUNK 2077", "sub": "Night City"}],
      "Cyberpunk 2077, la référence absolue du ray tracing sur PC.",
      "Night City, ce sont des néons partout, de la pluie sur l'asphalte, et des reflets qui transforment chaque rue en carte postale futuriste.", dim=0.1),
    B("i:cp_02", [{"k": "chart", "title": "Cyberpunk 2077 · RTX 5070", "sub": "1440p · moyenne des FPS",
                   "rows": [("Ultra · sans RT · natif", 100, None, "m", "CGMagazine : 102,6"),
                            ("RT Ultra · natif", 42, (40, 45), "e", "Estimation"),
                            ("RT Ultra · DLSS Qualité", 70, (65, 75), "e", "Estimation"),
                            ("Path tracing · DLSS Qualité", 45, (40, 50), "e", "Estimation"),
                            ("Path tracing · DLSS Performance", 70, (60, 80), "e", "Estimation")],
                   "max": 160, "ref": [60]}],
      "En Ultra sans ray tracing, en 1440p natif, la RTX 5070 tourne autour de 100 images par seconde : CGMagazine mesure 102 images par seconde de moyenne.",
      "Active le ray tracing Ultra en natif, et on tombe vers 40 images par seconde : c'est trop juste.",
      "Avec le DLSS en mode Qualité, on remonte autour de 65 à 75 images par seconde, d'après mon estimation à partir de plusieurs tests.",
      "Et le mode le plus spectaculaire, le path tracing, l'éclairage le plus réaliste du jeu, devient jouable autour de 60 à 80 images par seconde avec le DLSS en mode Performance.", dim=0.7),
    B("i:cp_09", [{"k": "settings", "title": "Réglages conseillés · Cyberpunk 2077",
                     "rows": [("Préréglage", "Ray Tracing Ultra"), ("Upscaling", "DLSS · Qualité"), ("Ray Reconstruction", "Activé"),
                              ("Génération d'images", "En option (×2)"), ("Path tracing", "Possible en DLSS Performance")]}],
      "Mon réglage conseillé : préréglage Ray Tracing Ultra, DLSS Qualité, reconstruction de rayons activée, et la génération d'images en option si tu veux encore plus de fluidité visuelle.", dim=0.55),
    B("c:rdr2_0@12", [{"k": "gametitle", "text": "RED DEAD REDEMPTION 2", "sub": "L'Ouest sauvage"}],
      "Red Dead Redemption 2, c'est un autre genre de beauté : des paysages naturels immenses, des lumières de fin de journée, des forêts denses et des montagnes enneigées.",
      "Même plusieurs années après sa sortie, c'est toujours l'un des plus beaux mondes ouverts jamais créés.", dim=0.05),
    B("c:rdr2_0@36", [{"k": "chart", "title": "Red Dead Redemption 2 · RTX 5070", "sub": "1440p · moyenne des FPS",
                       "rows": [("Ultra · natif", 90, (85, 100), "e", "Estimation"), ("Ultra · DLSS Qualité", 115, (105, 125), "e", "Estimation")],
                       "max": 160, "ref": [60]}],
      "Le jeu n'utilise pas le ray tracing, et il est plutôt bien optimisé. En 1440p avec des réglages Ultra, plusieurs tests situent la RTX 5070 autour de 90 images par seconde. Je le présente comme une estimation, car les chiffres publiés varient beaucoup selon les réglages.",
      "Mon conseil : tout en Ultra, sauf quelques options très coûteuses comme la qualité de l'eau ou l'herbe à distance maximale, et le DLSS en mode Qualité si tu veux dépasser les 100 images par seconde.", dim=0.6),
    B("c:hl_0@15", [{"k": "gametitle", "text": "HOGWARTS LEGACY", "sub": "L'Héritage de Poudlard"}],
      "Hogwarts Legacy te plonge dans un château gigantesque, avec ses couloirs éclairés à la bougie, ses serres, et Pré-au-Lard sous la neige.", dim=0.05),
    B("c:hl_0@99", [{"k": "chart", "title": "Hogwarts Legacy · RTX 5070", "sub": "1440p · moyenne des FPS",
                     "rows": [("Ultra · sans RT · natif", 92, (85, 100), "e", "Estimation"), ("Ultra + RT · DLSS Qualité", 68, (60, 75), "e", "Estimation")],
                     "max": 160, "ref": [60]}],
      "En 1440p Ultra sans ray tracing, j'estime la RTX 5070 entre 85 et 100 images par seconde. Avec le ray tracing, le jeu devient beaucoup plus exigeant, notamment en mémoire vidéo.",
      "Ici, ton processeur a aussi un rôle clé : Pré-au-Lard est une zone très gourmande en CPU, et le cache 3D du 9800X3D aide à garder une image stable.",
      "Réglage conseillé : Ultra, DLSS Qualité, et le ray tracing uniquement sur les reflets, pour préserver les 12 gigaoctets de mémoire vidéo.", dim=0.6),
    B("gta", [{"k": "gta"}],
      "Et puis il y a le jeu que tout le monde attend : GTA VI.",
      "Soyons clairs. À l'heure où je prépare cette vidéo, GTA VI sort le 19 novembre 2026 sur PS5 et Xbox Series, mais aucune version PC n'a été officiellement annoncée par Rockstar.",
      "Des rumeurs évoquent le début de l'année 2027, sans aucune confirmation. Il n'existe donc ni configuration requise officielle, ni benchmark.",
      "Ce qu'on peut dire, c'est que ta configuration est une très bonne base : un processeur de pointe pour une ville très dense, et une carte compatible avec les dernières technologies de Nvidia. Mais tout chiffre de FPS aujourd'hui serait inventé, alors je ne t'en donnerai pas."),
]))

# 7 — PARTIE B : compétitif
SCENES.append(("compet", [
    chapter("05", "PARTIE B · LA VITESSE PURE", "Les jeux compétitifs à très haut FPS", bg="i:cs2_03"),
    B("c:wz_0@30", [],
      "Deuxième grande partie : les jeux compétitifs. Ici, on change complètement de philosophie.",
      "On ne cherche plus la plus belle image, mais le plus d'images par seconde, la latence la plus faible, et la meilleure lisibilité.",
      "Et c'est là que ton Ryzen 7 9800X3D devient la star. Quand les réglages graphiques baissent, c'est le processeur qui fixe la limite, et son cache 3D fait des merveilles.", dim=0.15),
    B("dark", [{"k": "presets"}],
      "Petit point sur les préréglages graphiques.",
      "En Faible, tu sacrifies les ombres, la végétation et les effets, mais tu obtiens un maximum de FPS et une image très lisible.",
      "En Moyen, c'est un bon compromis.",
      "En Élevé et en Ultra, les ombres, les reflets et l'éclairage deviennent beaucoup plus riches, mais chaque cran supplémentaire coûte des images par seconde, parfois beaucoup pour un gain visuel minime."),
    B("fortnite", [{"k": "gametitle", "text": "FORTNITE", "sub": "Battle royale · Unreal Engine 5"}, {"k": "fn_note"}],
      "Commençons par Fortnite.",
      "En mode Performance, avec des réglages bas et la distance d'affichage au maximum, ta configuration devrait dépasser les 300 images par seconde dans la plupart des situations, et s'approcher des 360 hertz de ton écran."),
    B("fortnite", [{"k": "chart", "title": "Fortnite · RTX 5070 + 9800X3D", "sub": "1440p · moyenne des FPS",
                    "rows": [("Mode Performance · réglages bas", 330, (280, 380), "e", "Estimation"),
                             ("DirectX 12 · Épique · DLSS Qualité", 120, (100, 140), "e", "Estimation")],
                    "max": 420, "ref": [60, 360]}],
      "Je précise que c'est une estimation : je n'ai pas trouvé de benchmark fiable publié pour cette combinaison exacte, et les FPS varient beaucoup selon la zone et le nombre de joueurs.",
      "Si tu préfères la beauté, le mode DirectX 12 en Épique, avec Lumen et Nanite, offre un rendu superbe, autour de 100 à 140 images par seconde avec le DLSS, toujours selon mon estimation.",
      "Pour le compétitif, mon conseil : mode Performance, distance d'affichage Épique, tout le reste au minimum, et Nvidia Reflex activé quand il est proposé."),
    B("c:wz_0@6", [{"k": "gametitle", "text": "CALL OF DUTY · WARZONE", "sub": "& Black Ops 7"}],
      "Call of Duty Warzone et Black Ops 7 sont plus exigeants.", dim=0.1),
    B("c:wz_0@96", [{"k": "chart", "title": "Call of Duty · RTX 5070", "sub": "1440p · moyenne des FPS",
                     "rows": [("Réglages max · natif (tests Black Ops 6)", 125, (105, 150), "m", "Plusieurs tests"),
                              ("Compétitif · bas + DLSS Qualité", 225, (200, 250), "e", "Estimation")],
                     "max": 420, "ref": [60, 360]}],
      "Les tests publiés pour Black Ops 6 situent la RTX 5070 entre 105 et 150 images par seconde en 1440p avec les réglages les plus élevés, selon les sources.",
      "En compétitif, avec des réglages bas, le DLSS en mode Qualité et Reflex, j'estime qu'on peut viser 200 à 250 images par seconde sur Warzone. Et dans les combats chargés de fin de partie, c'est ton processeur qui fait la différence.", dim=0.65),
    B("c:cs2_0@36", [{"k": "gametitle", "text": "COUNTER-STRIKE 2", "sub": "Le roi du compétitif"}],
      "Enfin, Counter-Strike 2, le terrain de jeu idéal pour ton écran.",
      "Le jeu est beaucoup moins gourmand graphiquement, et c'est le processeur qui fait presque tout.", dim=0.1),
    B("c:cs2_0@18", [{"k": "chart", "title": "Counter-Strike 2 · RTX 5070 + 9800X3D", "sub": "1440p · moyenne des FPS",
                      "rows": [("Réglages max", 320, (300, 340), "m", "Plusieurs tests"),
                               ("Compétitif · réglages bas", 450, (400, 500), "e", "Estimation")],
                      "max": 520, "ref": [60, 360]}],
      "En 1440p avec les réglages les plus élevés, les tests publiés situent la RTX 5070 au-delà de 300 images par seconde.",
      "En réglages compétitifs, j'estime entre 400 et 500 images par seconde en moyenne. Là, tu dépasses largement les 360 hertz de ton écran : chaque image affichée est la plus récente possible, avec une latence minimale.",
      "Et dans les moments les plus chargés, avec les fumigènes et les explosions, c'est encore le 9800X3D qui garde les 1 pour cent les plus bas à un niveau élevé, pour une fluidité régulière.", dim=0.65),
]))

# 8 — COMPARAISON GLOBALE
SCENES.append(("recap", [
    chapter("06", "COMPARAISON DES PERFORMANCES", "Tous les jeux face à ton écran 360 Hz"),
    B("dark", [{"k": "chart", "title": "Récapitulatif · RTX 5070 + Ryzen 7 9800X3D · 1440p", "sub": "Réglage conseillé pour chaque jeu · FPS moyens réels (sans génération d'images)",
                "rows": [("Counter-Strike 2 · compétitif", 450, (400, 500), "e", "Estimation"),
                         ("Fortnite · Performance", 330, (280, 380), "e", "Estimation"),
                         ("Warzone · compétitif", 225, (200, 250), "e", "Estimation"),
                         ("Forza Horizon 5 · Extrême", 130, (120, 140), "e", "Estimation"),
                         ("Forza Horizon 6 · Extrême", 112, None, "m", "TechSpot"),
                         ("Red Dead Redemption 2 · Ultra", 90, (85, 100), "e", "Estimation"),
                         ("Forza Horizon 6 · Extrême + RT + DLSS Q", 80, (75, 85), "e", "Estimation"),
                         ("Cyberpunk 2077 · RT Ultra + DLSS Q", 70, (65, 75), "e", "Estimation"),
                         ("Hogwarts Legacy · RT + DLSS Q", 68, (60, 75), "e", "Estimation")],
                "max": 520, "ref": [60, 360], "compact": True}],
      "Récapitulons tout ça sur un seul graphique.",
      "La ligne rouge, ce sont les 360 hertz de ton écran. La ligne grise, la barre des 60 images par seconde.",
      "Counter-Strike 2 dépasse les 360 hertz, Fortnite s'en approche, et Warzone se situe dans une zone très confortable.",
      "Pour les jeux spectaculaires, on reste au-dessus de 60 images par seconde avec les réglages conseillés. Et entre 60 et 120 images par seconde, la synchronisation adaptative de ton écran garantit une image parfaitement fluide."),
    B("dark", [{"k": "sourcetable"}],
      "Et pour être totalement transparent, voici l'origine de chaque chiffre : en vert, les mesures publiées par des médias spécialisés ; en orange, mes estimations, qui peuvent varier selon la version du jeu, les pilotes et la scène testée."),
]))

# 9 — PC vs XBOX
SCENES.append(("xbox", [
    chapter("07", "PC  vs  XBOX SERIES X", "L'exemple de Forza Horizon 6", bg="i:fh6_03"),
    B("c:fh6_1@18", [],
      "Maintenant, la question qu'on se pose souvent : qu'est-ce que ton PC apporte par rapport à une Xbox Series X, en prenant Forza Horizon 6 comme exemple ?", dim=0.15),
    B("dark", [{"k": "versus"}],
      "Sur Xbox Series X, Digital Foundry décrit deux modes. Le mode Performance vise 60 images par seconde avec une définition 4K dynamique. Le mode Qualité vise une 4K native, mais à 30 images par seconde, avec un ray tracing limité, principalement sur les reflets des voitures.",
      "Sur ton PC, c'est toi qui décides. Tu peux activer l'illumination globale et les reflets en ray tracing, régler chaque paramètre individuellement, utiliser le DLSS, et surtout dépasser les 60 images par seconde : 112 en moyenne sans ray tracing d'après TechSpot, sur un écran OLED 360 hertz.",
      "Mais soyons objectifs. La console a aussi ses atouts : elle est optimisée par les développeurs pour un matériel unique, elle se branche et fonctionne sans aucun réglage, et elle coûte bien moins cher.",
      "Note aussi que ton écran est en 1440p, alors que la Xbox affiche souvent de la 4K sur un téléviseur. Ce n'est donc pas une victoire sur tous les plans : c'est une expérience différente, plus fluide, plus réactive et beaucoup plus personnalisable.",
      "Et le PC garde un dernier avantage : il peut évoluer."),
]))

# 10 — ÉVOLUTIONS
SCENES.append(("upgrade", [
    chapter("08", "LES ÉVOLUTIONS POSSIBLES", "Rien d'indispensable, tout est possible"),
    B("dark", [{"k": "upgrade"}],
      "Justement, parlons évolution.",
      "La pièce la plus logique à changer un jour, c'est la carte graphique. Une RTX 5080 apporterait environ 40 à 50 pour cent de performances en plus en 1440p, et surtout 16 gigaoctets de mémoire vidéo, idéal pour le ray tracing poussé.",
      "Ton processeur, lui, ne sera pas un frein : le 9800X3D a largement les épaules pour une carte bien plus puissante.",
      "Côté alimentation, Nvidia recommande 850 watts pour un PC équipé d'une RTX 5080. Une 750 watts de qualité comme la tienne peut tenir la charge en pratique, mais il faudra vérifier ce point au moment de l'achat."),
    B("hero", [{"k": "bullets", "title": "Autres pistes", "side": "right",
                "items": ["Un 2e SSD NVMe quand la bibliothèque grandit", "Un futur processeur sur la plateforme AM5", "RGB synchronisé : noir & rouge… ou arc-en-ciel", "Et surtout : rien d'indispensable aujourd'hui"]}],
      "Mais je veux être clair : cette évolution n'a rien d'indispensable. Ta RTX 5070 fait déjà tourner tous les jeux de cette vidéo dans de très bonnes conditions en 1440p.",
      "Les autres évolutions sont plus simples : un deuxième SSD NVMe quand ta bibliothèque grandira, et plus tard, pourquoi pas, un nouveau processeur sur la même plateforme AM5.",
      "Et côté esthétique, tu pourras synchroniser l'éclairage du watercooling, des ventilateurs et du boîtier, pour créer une ambiance noire et rouge, ou un arc-en-ciel complet."),
]))

# 11 — CONCLUSION
SCENES.append(("outro", [
    chapter("09", "CONCLUSION", "Ton futur setup"),
    B("hero", [{"k": "bullets", "title": "Ce que tu vas recevoir", "side": "right",
                "items": ["Un des meilleurs CPU gaming : Ryzen 7 9800X3D", "RTX 5070 · DLSS 4 · taillée pour le 1440p", "32 Go DDR5-6000 · watercooling 360 mm", "OLED 360 Hz : noirs parfaits, fluidité extrême"]}],
      "Alors, que retenir ?",
      "Tu vas recevoir une machine équilibrée, sans maillon faible : l'un des meilleurs processeurs gaming du marché, une carte graphique taillée pour le 1440p avec le DLSS 4, 32 gigaoctets de mémoire, un refroidissement surdimensionné et silencieux, et un écran OLED 360 hertz qui va sublimer chaque image."),
    B("c:fh6_1@75", [],
      "D'un côté, tu pourras explorer le Japon de Forza Horizon 6 avec le ray tracing, te perdre dans les néons de Night City ou dans les plaines de Red Dead.", dim=0.1),
    B("c:cs2_0@39", [],
      "De l'autre, enchaîner les parties de Fortnite, de Warzone ou de Counter-Strike avec une fluidité et une réactivité de niveau compétitif.", dim=0.1),
    B("c:fh6_1@3.0", [],
      "Ce n'est pas une machine parfaite en tout : aucune ne l'est. Mais pour ce que tu veux faire, c'est un choix remarquablement intelligent.",
      "Il ne reste plus qu'une chose à faire : attendre la livraison. Et franchement, l'attente en vaut la peine.", dim=0.1),
    B("hero", [{"k": "title", "text": "BON JEU !", "sub": "Ryzen 7 9800X3D · RTX 5070 · OLED 360 Hz", "side": "right"}],
      "Bon jeu !"),
    B("dark", [{"k": "credits"}], dur=11.0, dim=0.8),
]))

# ------------------------------------------------- prononciation (TTS)
SPOKEN = [
    ("9800X3D", "neuf-mille-huit-cents X 3 D"),
    ("7800X3D", "sept-mille-huit-cents X 3 D"),
    ("RTX 5070", "RTX cinquante-soixante-dix"),
    ("RTX 5080", "RTX cinquante-quatre-vingts"),
    ("RTX 4070 Super", "RTX quarante-soixante-dix Super"),
    ("RTX 4070", "RTX quarante-soixante-dix"),
    ("RTX 4090", "RTX quarante-quatre-vingt-dix"),
    ("1440p", "1440 p"),
    ("1080p", "1080 p"),
    ("Ventus 2X OC", "Ventus 2 X O C"),
    ("GDDR7", "G D D R 7"),
    ("DDR5", "D D R 5"),
    ("DLSS", "D L S S"),
    ("QD-OLED", "Q D OLED"),
    ("A-RGB", "A RGB"),
    ("Wi-Fi 6E", "Wi-Fi 6 E"),
    ("B650", "B 650"),
    ("AX V2", "A X V 2"),
    ("FRAME 4000D RS ARGB", "Frame 4000 D, R S, A RGB"),
    ("RS120 ARGB", "R S 120 A RGB"),
    ("Pure Power 13 M", "Pure Power 13 M"),
    ("GTA VI", "GTA 6"),
    ("PS5", "PS 5"),
    ("AM5", "A M 5"),
    ("L3", "L 3"),
    ("EXPO", "Expo"),
    ("be quiet!", "bi quaïette"),
    ("MO27Q3", "M O 27 Q 3"),
]

def spoken(t):
    for a, b in SPOKEN:
        t = t.replace(a, b)
    return t

CREDITS = [
    "Sources des mesures citées",
    "TechSpot / Hardware Unboxed — Forza Horizon 6 : 47 GPU testés ; test Ryzen 7 9800X3D ; RTX 5070",
    "ComputerBase — Forza Horizon 6 benchmark (WQHD) ; recommandations VRAM",
    "TechPowerUp — GeForce RTX 5070 Founders Edition (1440p, +22 % vs RTX 4070)",
    "CGMagazine — RTX 5070 : Cyberpunk 2077, 1440p Ultra (102,6 FPS)",
    "Digital Foundry — Forza Horizon 6 PC / Xbox ; Rockstar Newswire — GTA VI",
    "Fiches constructeurs : AMD, NVIDIA, MSI, Gigabyte, Kioxia, be quiet!, Corsair, Arctic, Patriot",
    "Images de jeu : bandes-annonces et captures officielles (Steam) — propriété de leurs éditeurs",
    "Composants : illustrations stylisées · Narration : voix de synthèse · Musique : composition générée",
    "Usage privé uniquement",
]
