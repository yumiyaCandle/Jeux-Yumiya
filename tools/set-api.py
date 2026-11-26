#!/usr/bin/env python3
"""Indique à l'app l'adresse du serveur de comptes quand il n'est pas sur la même origine (apps natives, autre domaine).
Usage : python3 tools/set-api.py https://api.exemple.ch   (ou --clear pour revenir à « même origine »)
Ajoute/retire <meta name="libre-api"> et l'adresse dans connect-src de la CSP de libre/index.html."""
import re, sys, pathlib
P = pathlib.Path(__file__).resolve().parent.parent / 'libre' / 'index.html'
s = P.read_text(encoding='utf-8')
s = re.sub(r'<meta name="libre-api" content="[^"]*">\n?', '', s)
s = re.sub(r"connect-src 'self'[^;]*;", "connect-src 'self';", s)
if len(sys.argv) != 2: sys.exit(__doc__)
if sys.argv[1] != '--clear':
    url = sys.argv[1].rstrip('/')
    if not re.fullmatch(r'https://[a-z0-9.-]+(:\d+)?', url): sys.exit('Adresse HTTPS attendue, sans chemin : https://api.exemple.ch')
    s = s.replace("connect-src 'self';", f"connect-src 'self' {url};", 1)
    s = s.replace('<meta http-equiv="Content-Security-Policy"', f'<meta name="libre-api" content="{url}">\n<meta http-equiv="Content-Security-Policy"', 1)
P.write_text(s, encoding='utf-8')
print('libre/index.html mis à jour. Reconstruire : python3 tools/build-standalone.py && cd libre-app && npm run sync')
