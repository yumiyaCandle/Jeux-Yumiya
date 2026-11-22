// Produit toutes les icônes et écrans de lancement de LIBRE (identité « Envol ») à partir du logo :
// un cercle ouvert dont s'échappe un trait vers la lumière (point aube), sur un dégradé nuit → indigo.
// Usage : node libre-app/scripts/render-assets.js   (écrit libre/icons, libre-app/assets, et remplace les PNG iOS/Android
// aux tailles déjà présentes dans les projets natifs ; aucun outil externe requis).
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..', '..');
const APP = path.join(ROOT, 'libre-app');
const PINE = '#241F63', PAPER = '#FFFFFF', SUN = '#FF9A6B';
// Logo dans un repère 48×48 (même dessin que logoMark() dans libre/index.html)
const markPaths = (ink) => `<path d="M29.5 7.8A17 17 0 1 0 40.2 18.5" fill="none" stroke="${ink}" stroke-width="4.4" stroke-linecap="round"/><path d="M17 31L33.5 14.5" stroke="${ink}" stroke-width="4.4" stroke-linecap="round"/><circle cx="38" cy="10" r="4.2" fill="${SUN}"/>`;
// scale = part du côté occupée par le logo
const svg = (size, { bg, scale }) => { const s = size * scale / 48, o = (size - 48 * s) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${bg ? `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1E1A55"/><stop offset=".6" stop-color="#33299A"/><stop offset="1" stop-color="#5A43C9"/></linearGradient></defs><rect width="${size}" height="${size}" fill="url(#g)"/>` : ''}<g transform="translate(${o} ${o}) scale(${s})">${markPaths(PAPER)}</g></svg>`; };
const html = (body, bg, w, h) => `<html><body style="margin:0;width:${w}px;height:${h}px;background:${bg};display:grid;place-items:center;overflow:hidden">${body}</body></html>`;
(async () => {
  const b = await chromium.launch();
  const shot = async (file, body, bg, w, h, transparent) => { fs.mkdirSync(path.dirname(file), { recursive: true });
    const p = await b.newPage({ viewport: { width: w, height: h } }); await p.setContent(html(body, bg, w, h)); await p.screenshot({ path: file, omitBackground: !!transparent }); await p.close(); };
  // Icône vectorielle de référence (PWA, site)
  fs.writeFileSync(path.join(ROOT, 'libre', 'icons', 'icon.svg'), svg(100, { bg: PINE, scale: .62 }).replace(/ width="100" height="100"/, ''));
  const full = (n) => svg(n, { bg: PINE, scale: .62 }), mask = (n) => svg(n, { bg: PINE, scale: .5 });
  // PWA
  await shot(path.join(ROOT, 'libre/icons/icon-192.png'), full(192), PINE, 192, 192);
  await shot(path.join(ROOT, 'libre/icons/icon-512.png'), full(512), PINE, 512, 512);
  await shot(path.join(ROOT, 'libre/icons/maskable-512.png'), mask(512), PINE, 512, 512);
  await shot(path.join(ROOT, 'libre/icons/apple-touch-icon.png'), full(180), PINE, 180, 180);
  // Sources Capacitor (conservées pour @capacitor/assets si on l'utilise un jour)
  await shot(path.join(APP, 'assets/icon-only.png'), full(1024), PINE, 1024, 1024);
  await shot(path.join(APP, 'assets/icon-foreground.png'), svg(1024, { scale: .42 }), 'transparent', 1024, 1024, true);
  await shot(path.join(APP, 'assets/icon-background.png'), '', PINE, 1024, 1024);
  await shot(path.join(APP, 'assets/splash.png'), svg(900, { scale: .7 }), PINE, 2732, 2732);
  await shot(path.join(APP, 'assets/splash-dark.png'), svg(900, { scale: .7 }), PINE, 2732, 2732);
  // iOS : icône 1024 (sans transparence) et écrans de lancement
  const ios = path.join(APP, 'ios/App/App/Assets.xcassets');
  await shot(path.join(ios, 'AppIcon.appiconset/AppIcon-512@2x.png'), full(1024), PINE, 1024, 1024);
  for (const f of fs.readdirSync(path.join(ios, 'Splash.imageset')).filter(f => f.endsWith('.png')))
    await shot(path.join(ios, 'Splash.imageset', f), svg(900, { scale: .7 }), PINE, 2732, 2732);
  // Android : mêmes fichiers, mêmes tailles qu'avant
  const res = path.join(APP, 'android/app/src/main/res');
  for (const d of fs.readdirSync(res)) {
    const dir = path.join(res, d);
    if (d.startsWith('mipmap-') && !d.includes('anydpi')) {
      const n = { ldpi: 36, mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 }[d.slice(7)]; if (!n) continue;
      await shot(path.join(dir, 'ic_launcher.png'), full(n).replace('<rect ', `<rect rx="${n * .18}" `), 'transparent', n, n, true);
      await shot(path.join(dir, 'ic_launcher_round.png'), full(n).replace('<rect ', `<rect rx="${n / 2}" `), 'transparent', n, n, true);
      // Icône adaptative : premier plan = logo dans la zone sûre, arrière-plan = vert pin
      await shot(path.join(dir, 'ic_launcher_foreground.png'), svg(n, { scale: .42 }), 'transparent', n, n, true);
      await shot(path.join(dir, 'ic_launcher_background.png'), '', PINE, n, n);
    }
    if (d.startsWith('drawable') && fs.existsSync(path.join(dir, 'splash.png'))) {
      const { w, h } = await (async () => { const buf = fs.readFileSync(path.join(dir, 'splash.png')); return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) }; })();
      const m = Math.round(Math.min(w, h) * .4);
      await shot(path.join(dir, 'splash.png'), svg(m, { scale: .7 }), PINE, w, h);
    }
  }
  await b.close(); console.log('icônes et écrans de lancement écrits');
})();
