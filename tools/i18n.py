"""Contrôle et export des traductions de LIBRE (aucune dépendance).

Usage, depuis la racine du dépôt :
  python3 tools/i18n.py audit            -> nombre de textes manquants par langue (code de sortie 1 si une langue de lancement est incomplète)
  python3 tools/i18n.py export DOSSIER   -> un fichier CSV par langue partielle : identifiant, français, anglais, traduction à remplir

Les textes de l'interface sont dans libre/index.html : MSGIDS (textes sources en français), CAT (catalogues par langue)
et EXTRA (compléments). Un texte « utilisé » est un appel t('…'), N_('…') ou tn(n,'…','…') dans le code.
Les contenus longs (bibliothèque, frise « Mon corps ») sont à part : français et anglais seulement.
"""
import csv, json, os, re, sys

LAUNCH = ['fr', 'en', 'de', 'it', 'es', 'pt']
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
H = open(os.path.join(ROOT, 'libre', 'index.html'), encoding='utf-8').read()
L = H.split('\n')
M = json.loads([x for x in L if x.startswith('const MSGIDS=')][0][len('const MSGIDS='):-1])
IDX = {s: i for i, s in enumerate(M)}
CAT = json.loads([x for x in L if x.startswith('const CAT=')][0][len('const CAT='):].rstrip(';'))
E = {}
for x in L:
    if x.startswith('const EXTRA='): E.update(json.loads(x[len('const EXTRA='):].rstrip(';')))
    if x.startswith('Object.assign(EXTRA,'): E.update(json.loads(x[len('Object.assign(EXTRA,'):-2]))
code = '\n'.join(x for x in L if not x.startswith(('const MSGIDS=', 'const CAT=', 'const EXTRA=', 'Object.assign(EXTRA,')))
used = set()
for m in re.finditer(r"(?<![\w.])(?:t|N_|tn)\(\s*'((?:[^'\\]|\\.)*)'", code): used.add(m.group(1).replace("\\'", "'"))
for m in re.finditer(r"tn\([^,]+,\s*'((?:[^'\\]|\\.)*)'\s*,\s*'((?:[^'\\]|\\.)*)'", code): used.add(m.group(2).replace("\\'", "'"))
langs = sorted(set(CAT.keys()) | {'de', 'it', 'es', 'pt', 'en'})


def get(s, lg):
    b = lg.split('-')[0]
    if s in E:
        v = E[s].get(lg) if E[s].get(lg) is not None else E[s].get(b)
        if v is None and b == 'zh': v = E[s].get('zh')
        if v is not None: return v
    i = IDX.get(s); c = CAT.get(lg) or CAT.get(b)
    if i is not None and c is not None and i < len(c) and c[i] not in (None, ''): return c[i]
    return None


def missing(lg):
    return sorted(s for s in used if lg != 'fr' and get(s, lg) is None)


def flat(v):
    return json.dumps(v, ensure_ascii=False) if isinstance(v, (dict, list)) else (v or '')


if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'audit'
    if cmd == 'audit':
        res = {lg: len(missing(lg)) for lg in langs if lg != 'fr'}
        for lg, n in sorted(res.items(), key=lambda x: (x[0] not in LAUNCH, x[0])):
            print(f"{lg:8} {'lancement' if lg in LAUNCH else 'partielle':10} {n} texte(s) manquant(s)")
        bad = [lg for lg in LAUNCH if lg != 'fr' and res.get(lg)]
        if bad: print('Langues de lancement incomplètes :', ', '.join(bad)); sys.exit(1)
    elif cmd == 'export':
        out = sys.argv[2]; os.makedirs(out, exist_ok=True)
        for lg in langs:
            if lg in LAUNCH: continue
            rows = missing(lg)
            with open(os.path.join(out, f'{lg}.csv'), 'w', encoding='utf-8', newline='') as f:
                w = csv.writer(f)
                w.writerow(['n', 'francais_source', 'anglais_reference', f'traduction_{lg}', 'remarque'])
                for n, s in enumerate(rows, 1): w.writerow([n, s, flat(get(s, 'en')), '', ''])
            print(lg, len(rows))
    else:
        print(__doc__); sys.exit(2)
