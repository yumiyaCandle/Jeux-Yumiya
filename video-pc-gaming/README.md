# Vidéo explicative : mon futur PC gaming

Pipeline complet qui génère une vidéo 1080p (≈ 15 min 45 s) en français, avec narration,
musique, sous-titres, extraits de gameplay, illustrations des composants et graphiques FPS animés.

**Configuration présentée :** Ryzen 7 9800X3D · MSI RTX 5070 Ventus 2X OC 12 Go · Patriot Viper Venom
32 Go DDR5-6000 · Arctic Liquid Freezer III Pro 360 A-RGB · Gigabyte B650 Gaming X AX V2 ·
Kioxia Exceria Plus G3 1 To · be quiet! Pure Power 13 M 750 W · Corsair FRAME 4000D RS ARGB ·
écrans Gigabyte MO27Q3 (QD-OLED 1440p 360 Hz) + AOC C27G2ZU (1080p).

## Fichiers

| Fichier | Rôle |
|---|---|
| `script.py` | Scénario : narration, visuels de chaque plan, données de benchmark (mesuré / estimation / génération d'images), prononciation |
| `tts.py` | Voix neuronale française phrase par phrase + timeline |
| `music.py` | Musique électronique générée (aucun droit tiers), impacts de chapitre, ducking sous la voix, mix final |
| `gfx.py` | Polices, panneaux, illustrations stylisées des composants (dessinées, ce ne sont pas des photos) |
| `render.py` | Rendu des scènes en parallèle : fonds vidéo / captures, overlays animés, sous-titres incrustés |
| `assemble.py` | Concaténation, mux audio, normalisation du volume, export `.srt` |

## Construire

```bash
pip install edge-tts scipy numpy pillow
W=work; DL=medias            # DL contient vid_<jeu>_<n>.mp4 et shots/<jeu>_<nn>.jpg (Steam)
python3 tts.py $W
python3 music.py $W
JOBS=4 python3 render.py $W $DL
python3 assemble.py $W .
```

Les médias de jeu (bandes-annonces et captures officielles Steam) ne sont pas versionnés :
ils appartiennent à leurs éditeurs. La vidéo est destinée à un **usage privé**.

## Chiffres : d'où viennent-ils ?

| Jeu | Réglage (1440p sauf mention) | FPS | Statut | Source |
|---|---|---|---|---|
| Forza Horizon 6 | Extrême, sans RT, natif | 112 | Mesuré | TechSpot (47 GPU) |
| Forza Horizon 6 | Extrême + RT, natif | 56 | Mesuré | TechSpot |
| Forza Horizon 6 | WQHD, protocole ComputerBase | 118 | Mesuré | ComputerBase |
| Forza Horizon 6 | Extrême + RT + DLSS Qualité | 75–85 | Estimation | — |
| Forza Horizon 6 | + Frame Generation ×2 | 140–160 | Images générées | — |
| Forza Horizon 5 | Extrême, natif | 120–140 | Estimation | — |
| Cyberpunk 2077 | Ultra sans RT, natif | 102,6 | Mesuré | CGMagazine |
| Cyberpunk 2077 | RT Ultra natif / + DLSS Q | 40–45 / 65–75 | Estimation | — |
| Cyberpunk 2077 | Path tracing DLSS Q / Perf. | 40–50 / 60–80 | Estimation | — |
| Red Dead Redemption 2 | Ultra natif / + DLSS Q | 85–100 / 105–125 | Estimation | — |
| Hogwarts Legacy | Ultra sans RT / RT + DLSS Q | 85–100 / 60–75 | Estimation | — |
| Fortnite | Performance bas / DX12 Épique + DLSS | 280–380 / 100–140 | Estimation | — |
| Call of Duty | Max natif (tests Black Ops 6) | 105–150 | Tests multiples | — |
| Warzone | Compétitif + DLSS Q | 200–250 | Estimation | — |
| Counter-Strike 2 | Max / compétitif | 300+ / 400–500 | Tests / estimation | — |
| Counter-Strike 2 (CPU) | 1080p, RTX 4090 | 668 (+13 % vs 7800X3D) | Mesuré | TechSpot |
| GTA VI | — | aucun | PC non annoncé | Rockstar (console : 19/11/2026) |

Xbox Series X (Forza Horizon 6) : mode Performance 4K dynamique / 60 FPS, mode Qualité 4K native / 30 FPS
avec ray tracing limité (Digital Foundry).
