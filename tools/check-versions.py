"""Cohérence des versions et des fichiers générés.

Vérifie que :
- la version (1.0.0) et le numéro de build sont identiques sur Android, iOS et dans libre-app/package.json ;
- les copies web des projets natifs (après « npx cap sync ») sont identiques à libre/ (index.html, privacy.html) ;
- libre/LIBRE.html est à jour (délégué à tools/build-standalone.py --check).

Usage : python3 tools/check-versions.py   (code 1 en cas d'écart)
"""
import json, re, subprocess, sys, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
errors = []

gradle = open('libre-app/android/app/build.gradle', encoding='utf-8').read()
a_name = re.search(r'versionName\s+"([^"]+)"', gradle).group(1)
a_code = re.search(r'versionCode\s+(\d+)', gradle).group(1)
pbx = open('libre-app/ios/App/App.xcodeproj/project.pbxproj', encoding='utf-8').read()
i_names = set(re.findall(r'MARKETING_VERSION = ([^;]+);', pbx))
i_codes = set(re.findall(r'CURRENT_PROJECT_VERSION = ([^;]+);', pbx))
p_ver = json.load(open('libre-app/package.json', encoding='utf-8'))['version']

if i_names != {a_name}: errors.append(f'Version iOS {sorted(i_names)} ≠ Android {a_name}')
if i_codes != {a_code}: errors.append(f'Build iOS {sorted(i_codes)} ≠ versionCode Android {a_code}')
if p_ver != a_name: errors.append(f'libre-app/package.json {p_ver} ≠ Android {a_name}')

for d in ['libre-app/android/app/src/main/assets/public', 'libre-app/ios/App/App/public']:
    for f in ['index.html', 'privacy.html']:  # sw.js : volontairement absent des apps natives
        src, dst = os.path.join('libre', f), os.path.join(d, f)
        if not os.path.isfile(dst):
            errors.append(f'{dst} absent : lancer « cd libre-app && npm run sync »')
        elif open(src, 'rb').read() != open(dst, 'rb').read():
            errors.append(f'{dst} diffère de {src} : lancer « cd libre-app && npm run sync »')

r = subprocess.run([sys.executable, 'tools/build-standalone.py', '--check'], capture_output=True, text=True)
if r.returncode: errors.append(r.stdout.strip())

print(f'Version {a_name} (build {a_code}) sur Android, iOS et package.json')
if errors:
    print('\n'.join('ÉCART : ' + e for e in errors)); sys.exit(1)
print('Versions et fichiers générés cohérents')
