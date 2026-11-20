/* LIBRE – service worker
   Rôle : rendre l’app utilisable hors ligne après une première visite, et proposer les mises à jour.
   Aucune donnée personnelle ne passe par ici : elles restent dans le stockage local du navigateur.
   À chaque nouvelle version publiée, changer VERSION : l’app propose alors « Mettre à jour ». */
const VERSION='libre-2026-11-20';
const CORE=[
 "./",
 "./index.html",
 "./manifest.webmanifest",
 "./fonts/inter-latin.woff2",
 "./fonts/inter-latin-ext.woff2",
 "./fonts/inter-cyrillic.woff2",
 "./fonts/inter-vietnamese.woff2",
 "./icons/icon-192.png",
 "./icons/icon-512.png",
 "./icons/maskable-512.png",
 "./icons/apple-touch-icon.png",
 "./icons/icon.svg",
 "./photos/aube-720.webp",
 "./photos/sommet-720.webp",
 "./photos/biblio-720.webp",
 "./photos/journal-720.webp",
 "./photos/tabac-720.webp",
 "./photos/alcool-720.webp",
 "./photos/cannabis-720.webp",
 "./photos/autres-720.webp",
 "./photos/stress-720.webp",
 "./photos/sommeil-720.webp",
 "./photos/motivation-720.webp",
 "./photos/mental-720.webp",
 "./photos/rechute-720.webp",
 "./photos/sevrage-720.webp",
 "./photos/comprendre-720.webp",
 "./photos/aide-720.webp",
 "./photos/plan-720.webp",
 "./photos/envies-720.webp",
 "./photos/corps-720.webp"
];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(CORE)))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('message',e=>{if(e.data==='skip')self.skipWaiting()});
self.addEventListener('fetch',e=>{const r=e.request,u=new URL(r.url);
  if(r.method!=='GET'||u.origin!==location.origin)return; // rien d’extérieur n’est intercepté
  if(r.mode==='navigate'){ // page : réseau d’abord (version la plus récente), sinon la copie locale
    e.respondWith(fetch(r).then(res=>{const c=res.clone();caches.open(VERSION).then(x=>x.put('./index.html',c));return res}).catch(()=>caches.match('./index.html')));return}
  e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(res=>{if(res.ok&&res.type==='basic'){const c=res.clone();caches.open(VERSION).then(x=>x.put(r,c))}return res})));
});
