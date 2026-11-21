"""Vérifie que chaque lien cité dans LIBRE répond (sources médicales, lignes d'aide, crédits photo).
Usage : python3 tools/check-sources.py   (accès Internet nécessaire ; aucune dépendance)
Un code 403 sur certains sites (Pexels, GitHub, éditeurs scientifiques) peut venir d'un blocage des robots :
ouvrir ces liens à la main dans un navigateur."""
import re, sys, urllib.request, os
H = open(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'libre', 'index.html'), encoding='utf-8').read()
urls = sorted({u.rstrip('.,;') for u in re.findall(r"https?://[^\s'\"<>`)\\]+", H) if 'w3.org' not in u})
bad = 0
for u in urls:
    try:
        r = urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0 (verification de liens LIBRE)'}), timeout=20); c = r.status
    except urllib.error.HTTPError as e: c = e.code
    except Exception as e: c = type(e).__name__
    ok = c == 200
    bad += not ok
    print(('OK  ' if ok else 'À VÉRIFIER ') + str(c), u)
print(f'{len(urls)} liens, {bad} à vérifier'); sys.exit(1 if bad else 0)
