/* Libre — version « un seul fichier » pour Cloudflare Workers.
 * Le site entier (page, images, polices) est inclus dans ce script, avec le serveur (comptes + Sam).
 * Généré par `npm run single` → ../libre-worker.js */
import server from "./worker.src.js";
import { FILES } from "./assets.gen.js";

const cache = new Map();
function bytes(path) {
  if (!cache.has(path)) {
    const bin = atob(FILES[path].b);
    const u = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    cache.set(path, u);
  }
  return cache.get(path);
}

function serve(url) {
  let path = decodeURIComponent(url.pathname);
  if (path === "/") path = "/index.html";
  if (!FILES[path]) {
    if (/\.[a-z0-9]+$/i.test(path)) return new Response("Introuvable", { status: 404 });
    path = "/index.html";
  }
  const f = FILES[path];
  const noCache = /\.(html|js|webmanifest)$/.test(path);
  return new Response(bytes(path), {
    headers: {
      "content-type": f.t,
      "cache-control": noCache ? "no-cache" : "public, max-age=604800",
      "x-content-type-options": "nosniff",
      "referrer-policy": "same-origin",
    },
  });
}

export default {
  scheduled(event, env, ctx) {
    return server.scheduled(event, env, ctx);
  },
  fetch(req, env, ctx) {
    const url = new URL(req.url);
    if (url.pathname.startsWith("/api/")) return server.fetch(req, env, ctx);
    if (req.method !== "GET" && req.method !== "HEAD") return new Response(null, { status: 405 });
    return serve(url);
  },
};
