#!/usr/bin/env python3
"""Fabrique la version GitHub de Libre :
   - docs/index.html  (dossier docs/ avec images à côté)
   - Libre.html       (un seul fichier, images incluses) — à renommer index.html sur GitHub
Le code et le CSS sont minifiés avec esbuild pour que l'app s'ouvre plus vite.
Usage : python3 libre-src/build_github.py   (depuis la racine du dépôt)"""
import base64, re, subprocess, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ESBUILD = os.path.join(ROOT, "libre-src", "node_modules", ".bin", "esbuild")
HEAD = '''<script>/* Version GitHub. Mets ici l'adresse de ton Worker Cloudflare (libre-worker.js) pour activer comptes, IA et rappels : */
var LIBRE_SERVEUR="";
(function(){try{var q=new URLSearchParams(location.search).get("api");if(q&&/^https:\\/\\/[a-z0-9.-]+\\.workers\\.dev\\/?$/i.test(q)){localStorage.setItem("libre.api",q.replace(/\\/+$/,""));history.replaceState(null,"",location.pathname)}var a=LIBRE_SERVEUR||localStorage.getItem("libre.api")||"";if(a)window.LIBRE_API=a.replace(/\\/+$/,"");else window.LIBRE_STATIC=true}catch(e){window.LIBRE_STATIC=true}})();</script>'''

def esb(code, loader):
    r = subprocess.run([ESBUILD, "--minify", "--loader=" + loader, "--target=es2019" if loader == "js" else "--target=safari14"],
                       input=code.encode("utf-8"), capture_output=True)
    if r.returncode != 0:
        sys.exit("esbuild: " + r.stderr.decode())
    return r.stdout.decode("utf-8").strip()

def minify(t):
    t = re.sub(r"<style>(.*?)</style>", lambda m: "<style>" + esb(m.group(1), "css") + "</style>", t, flags=re.S)
    t = re.sub(r"<script>(.*?)</script>", lambda m: "<script>" + esb(m.group(1), "js").replace("</script", "<\\/script") + "</script>", t, flags=re.S)
    return t

def data(p, mime):
    return "data:" + mime + ";base64," + base64.b64encode(open(os.path.join(ROOT, "libre", p), "rb").read()).decode()

src = open(os.path.join(ROOT, "libre", "index.html"), encoding="utf-8").read()
src = src.replace("<title>Libre</title>", "<title>Libre</title>\n" + HEAD, 1)
mini = minify(src)
open(os.path.join(ROOT, "docs", "index.html"), "w", encoding="utf-8").write(mini)

one = mini
for p in ["img/welcome.jpg"]:
    one = one.replace('"' + p + '"', '"' + data(p, "image/jpeg") + '"')
one = one.replace('"img/banner.jpg"', '""')  # image de l'ancienne page d'abonnement, jamais affichée (version gratuite)
one = re.sub(r'<link rel="manifest"[^>]*>', "", one)
for a in ["href", "src"]:
    one = one.replace(a + '="icons/icon-192.png"', a + '="' + data("icons/icon-192.png", "image/png") + '"')
    one = one.replace(a + '="icons/icon-180.png"', a + '="' + data("icons/icon-180.png", "image/png") + '"')
open(os.path.join(ROOT, "Libre.html"), "w", encoding="utf-8").write(one)
print("docs/index.html", len(mini.encode()), "octets · Libre.html", len(one.encode()), "octets")
