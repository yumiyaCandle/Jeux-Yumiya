"""Fabrique libre/LIBRE.html : une version autonome (un seul fichier, photos et police incluses, sans service worker).
Usage, depuis la racine du dépôt : python3 tools/build-standalone.py [dossier de copie facultatif]
       python3 tools/build-standalone.py --check   (vérifie que libre/LIBRE.html correspond à la source ; code 1 sinon)"""
import base64,json,re,sys
CHECK='--check' in sys.argv
SP=next((a for a in sys.argv[1:] if a!='--check'),None)
H=open('libre/index.html',encoding='utf-8').read()
m=json.load(open('libre/photos/photos.json'))
data={x['key']:'data:image/webp;base64,'+base64.b64encode(open(f"libre/photos/{x['key']}-720.webp",'rb').read()).decode() for x in m}
H=H.replace("const PH_OK=new Set();","const PH_OK=new Set();const PH_DATA="+json.dumps(data)+";",1)
H,n=re.subn(r'<picture><source type="image/avif" srcset="\$\{set\(\'avif\'\)\}" sizes="\$\{sizes\}"><source type="image/webp" srcset="\$\{set\(\'webp\'\)\}" sizes="\$\{sizes\}"><img src="\$\{PH_DIR\}\$\{p\.f\}-\$\{p\.s\[0\]\}\.webp"','<picture><img src="${PH_DATA[p.f]}"',H);assert n==1,n
for f in ['latin','latin-ext','cyrillic','vietnamese']:
    u=f'url("fonts/inter-{f}.woff2")';assert H.count(u)==1
    H=H.replace(u,'url("data:font/woff2;base64,'+base64.b64encode(open(f'libre/fonts/inter-{f}.woff2','rb').read()).decode()+'")')
# fichier autonome : pas de manifeste ni de service worker (impossible depuis un fichier ouvert directement)
H,n=re.subn(r'<!--pwa-->.*?<!--/pwa-->','<link rel="icon" href="data:image/svg+xml;base64,'+base64.b64encode(open('libre/icons/icon.svg','rb').read()).decode()+'">',H,flags=re.S);assert n==1
assert H.count('const PWA_BUILD=true;')==1;H=H.replace('const PWA_BUILD=true;','const PWA_BUILD=false;')
if CHECK:
    ok=open('libre/LIBRE.html',encoding='utf-8').read()==H
    print('LIBRE.html à jour' if ok else 'LIBRE.html N’EST PAS À JOUR : lancer python3 tools/build-standalone.py');sys.exit(0 if ok else 1)
open('libre/LIBRE.html','w',encoding='utf-8').write(H);(SP and open(SP+'/LIBRE.html','w',encoding='utf-8').write(H));print(len(H)//1024,'Ko')
