/* Libre — service worker : l'app marche même sans réseau (SOS, compteur, Sam hors ligne). */
const C = "libre-v2-1";
const F = ["./", "index.html", "manifest.webmanifest", "icons/icon-180.png", "icons/icon-192.png", "icons/icon-512.png",
  "img/welcome.jpg", "img/programme.jpg", "img/banner.jpg",
  "fonts/inter-latin-400-normal.woff2", "fonts/inter-latin-500-normal.woff2", "fonts/inter-latin-600-normal.woff2", "fonts/inter-latin-700-normal.woff2"];
self.addEventListener("install", e => { e.waitUntil(caches.open(C).then(c => c.addAll(F))); self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== C).map(x => caches.delete(x)))));
  self.clients.claim();
});
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin || u.pathname.startsWith("/api/")) return;
  // Page : réseau d'abord (pour recevoir les mises à jour), cache si hors ligne
  if (e.request.mode === "navigate" || u.pathname.endsWith("/") || u.pathname.endsWith(".html")) {
    e.respondWith(fetch(e.request).then(res => {
      const cp = res.clone(); caches.open(C).then(c => c.put("index.html", cp)); return res;
    }).catch(() => caches.match("index.html")));
    return;
  }
  // Ressources : cache d'abord
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => {
    if (res.ok) { const cp = res.clone(); caches.open(C).then(c => c.put(e.request, cp)); }
    return res;
  })));
});
