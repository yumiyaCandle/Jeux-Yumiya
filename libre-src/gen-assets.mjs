// Emballe le contenu de ../libre (sauf _worker.js et _headers) dans assets.gen.js
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative, extname } from "node:path";

const ROOT = new URL("../libre/", import.meta.url).pathname;
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".webmanifest": "application/manifest+json",
  ".png": "image/png", ".jpg": "image/jpeg", ".woff2": "font/woff2", ".json": "application/json" };
const out = {};
(function walk(d) {
  for (const n of readdirSync(d)) {
    const p = join(d, n);
    if (statSync(p).isDirectory()) { walk(p); continue; }
    const rel = "/" + relative(ROOT, p);
    if (rel === "/_worker.js" || rel === "/_headers" || n.startsWith(".")) continue;
    out[rel] = { t: TYPES[extname(n)] || "application/octet-stream", b: readFileSync(p).toString("base64") };
  }
})(ROOT);
writeFileSync(new URL("./assets.gen.js", import.meta.url), "export const FILES = " + JSON.stringify(out) + ";\n");
console.log(Object.keys(out).length + " fichiers emballés");
