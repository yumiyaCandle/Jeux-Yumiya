// Copie l’application web LIBRE (../libre) dans www/ pour Capacitor.
// Le service worker n’est pas utile dans l’app native : il n’est pas copié.
import { cpSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = dirname(dirname(fileURLToPath(import.meta.url)));
const src = join(root, '..', 'libre'), out = join(root, 'www');
if (!existsSync(join(src, 'index.html'))) { console.error('Introuvable : ' + src + '/index.html'); process.exit(1); }
if (existsSync(out)) rmSync(out, { recursive: true });
mkdirSync(out, { recursive: true });
for (const f of ['index.html', 'manifest.webmanifest', 'fonts', 'photos', 'icons']) cpSync(join(src, f), join(out, f), { recursive: true });
console.log('LIBRE copiée dans www/');
