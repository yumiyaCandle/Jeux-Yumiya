// Produit les images sources de l’icône et de l’écran de lancement à partir du logo LIBRE (libre/icons/icon.svg).
// Ensuite : npx @capacitor/assets generate  (génère toutes les tailles iOS et Android).
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const out = path.join(__dirname, '..', 'assets');
fs.mkdirSync(out, { recursive: true });
const NAVY = '#0E2747';
const mark = (size, s) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100"><g transform="translate(${50 - 32 * s / 1.3333} ${50 - 32 * s / 1.3333}) scale(${s})"><path d="M33 9.5A17 17 0 1 0 41 24" fill="none" stroke="#F7F5F0" stroke-width="4.5" stroke-linecap="round"/><path d="M24 30c0-8 5-14 15-17c-1 9-6 15-15 17z" fill="#2CC584"/><path d="M24 30l7-8" stroke="${NAVY}" stroke-width="1.6" stroke-linecap="round"/></g></svg>`;
const page = (body, bg, w, h) => `<html><body style="margin:0;width:${w}px;height:${h}px;background:${bg};display:grid;place-items:center">${body}</body></html>`;
(async () => {
  const b = await chromium.launch();
  const shot = async (name, html, w, h, transparent) => { const p = await b.newPage({ viewport: { width: w, height: h } }); await p.setContent(html); await p.screenshot({ path: path.join(out, name), omitBackground: !!transparent }); await p.close(); };
  // Icône complète (iOS, Android ancien format) : identique à l’icône actuelle de LIBRE
  await shot('icon-only.png', page(fs.readFileSync(path.join(__dirname, '..', '..', 'libre', 'icons', 'icon.svg'), 'utf8').replace('<svg ', '<svg width="1024" height="1024" '), NAVY, 1024, 1024), 1024, 1024);
  // Icône adaptative Android : logo au centre de la zone sûre (66 %), fond bleu nuit séparé
  await shot('icon-foreground.png', page(mark(1024, 1.0), 'transparent', 1024, 1024), 1024, 1024, true);
  await shot('icon-background.png', page('', NAVY, 1024, 1024), 1024, 1024);
  // Écran de lancement : logo sur fond bleu nuit (mêmes couleurs en mode clair et sombre)
  await shot('splash.png', page(mark(900, 0.9), NAVY, 2732, 2732), 2732, 2732);
  await shot('splash-dark.png', page(mark(900, 0.9), NAVY, 2732, 2732), 2732, 2732);
  await b.close(); console.log('images écrites dans', out);
})();
