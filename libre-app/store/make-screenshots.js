#!/usr/bin/env node
/* Captures d’écran des fiches App Store et Google Play, à partir des vrais écrans de LIBRE.
   Usage (depuis la racine du dépôt) : node libre-app/store/make-screenshots.js
   Produit libre-app/store/out/{fr,en}/{ios,android}/NN-nom.jpg (JPEG qualité 90, accepté par les deux stores)
   et out/raw/ (écrans bruts, non versionnés, utilisés pour libre/site/img)
   - iOS : 1320 × 2868 (iPhone 6,9", taille demandée par App Store Connect)
   - Android : 1080 × 1920 (Google Play : rapport largeur/hauteur ≤ 2)
   Les données affichées sont celles du profil d’exemple ; l’étiquette « Démo » est masquée sur les captures. */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { serve } = require('../../tests/helpers');

const OUT = path.join(__dirname, 'out');
const SHOTS = [
  { id: '01-accueil', view: 'accueil', fr: ['Chaque jour', 'compte.'], en: ['Every day', 'counts.'],
    sfr: 'Ton compteur, ton record, tes économies. En direct.', sen: 'Your counter, your record, your savings. Live.' },
  { id: '02-sos', view: 'accueil', sos: true, fr: ['Une envie ?', '5 minutes.'], en: ['A craving?', '5 minutes.'],
    sfr: 'Un accompagnement guidé, le temps que la vague passe.', sen: 'Guided support while the wave passes.' },
  { id: '03-progres', view: 'stats', fr: ['Tes progrès,', 'enfin visibles.'], en: ['Your progress,', 'made visible.'],
    sfr: 'Statistiques, calendrier et bilans de la semaine.', sen: 'Statistics, calendar and weekly reviews.' },
  { id: '04-journal', view: 'journal', fr: ['Un journal', 'rien qu’à toi.'], en: ['A journal', 'just for you.'],
    sfr: 'Humeur, envies, réussites. LIBRE en tire ce qui te fait craquer.', sen: 'Mood, cravings, wins. LIBRE shows what sets you off.' },
  { id: '05-biblio', view: 'biblio', fr: ['Des infos sûres.', 'Sourcées.'], en: ['Reliable facts.', 'With sources.'],
    sfr: 'OMS, NIDA, HAS, NICE… Et quand consulter un médecin.', sen: 'WHO, NIDA, NICE… And when to see a doctor.' },
  { id: '06-prive', view: 'accueil', lock: true, fr: ['Rien ne sort', 'de ton téléphone.'], en: ['Nothing leaves', 'your phone.'],
    sfr: 'Pas de compte, pas de pub. Données chiffrées sur l’appareil.', sen: 'No account, no ads. Data encrypted on the device.' }
];

const HIDE = `.demo-tag,.demo-foot,#layer .toast,.toast{display:none!important}`;

async function capture(browser, base, lang) {
  const ctx = await browser.newContext({ viewport: { width: 440, height: 956 }, deviceScaleFactor: 3, locale: lang === 'fr' ? 'fr-CH' : 'en-GB', reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  await p.goto(base); await p.click('[data-a="demo"]'); await p.waitForTimeout(1600);
  await p.evaluate(lang => { const s = JSON.parse(localStorage.getItem('libre.v1')); s.prefs.lang = lang; s.prefs.langAuto = false; s.seenIntro = true; (s.contacts || []).forEach(c => { c.name = String(c.name || '').replace(/\s*\((exemple|example)\)/i, ''); }); localStorage.setItem('libre.v1', JSON.stringify(s)); }, lang);
  await p.reload(); await p.waitForTimeout(1600);
  await p.addStyleTag({ content: HIDE });
  const shots = {};
  for (const s of SHOTS) {
    await p.evaluate(() => { const l = document.getElementById('layer'); if (l) l.innerHTML = ''; });
    if (s.lock) {
      await p.evaluate(() => { const s = JSON.parse(localStorage.getItem('libre.v1')); s.prefs.lock = { v: 2, salt: '00', iter: 1, hash: 'x' }; localStorage.setItem('libre.v1', JSON.stringify(s)); });
      await p.reload(); await p.waitForSelector('#lockPin'); await p.addStyleTag({ content: HIDE }); await p.waitForTimeout(500);
      await p.evaluate(() => document.activeElement && document.activeElement.blur());
    } else {
      await p.evaluate(v => { location.hash = v; }, s.view); await p.waitForTimeout(700);
      await p.evaluate(() => { const l = document.getElementById('layer'); if (l) l.innerHTML = ''; scrollTo(0, 0); });
      if (s.sos) { await p.click('[data-a="sos"]'); await p.waitForTimeout(900); }
    }
    await p.waitForTimeout(300);
    shots[s.id] = (await p.screenshot()).toString('base64');
  }
  await ctx.close();
  return shots;
}

function card(s, lang, img, W, H) {
  const [l1, l2] = s[lang], sub = lang === 'fr' ? s.sfr : s.sen;
  const phoneW = Math.round(W * 0.74), phoneH = Math.round(phoneW * 956 / 440);
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  @font-face{font-family:Inter;src:url("${'file://' + path.resolve(__dirname, '../../libre/fonts/inter-latin.woff2')}") format("woff2");font-weight:100 900}
  *{box-sizing:border-box;margin:0}
  body{width:${W}px;height:${H}px;overflow:hidden;font-family:Inter,system-ui,sans-serif;color:#fff;
    background:radial-gradient(70% 45% at 85% 8%,rgba(242,168,119,.30),transparent 70%),radial-gradient(60% 40% at 0% 60%,rgba(141,185,169,.2),transparent 70%),linear-gradient(170deg,#1A4A41,#0A1F1B 70%)}
  .t{position:absolute;left:0;right:0;top:${Math.round(H * 0.055)}px;text-align:center;padding:0 ${Math.round(W * 0.07)}px}
  h1{font-size:${Math.round(W * 0.092)}px;line-height:1.02;font-weight:800;letter-spacing:-.04em}
  h1 em{display:block;font-family:"Newsreader","New York",Georgia,serif;font-style:italic;font-weight:500;color:#F2A877}
  p{margin-top:${Math.round(W * 0.03)}px;font-size:${Math.round(W * 0.036)}px;line-height:1.35;color:rgba(255,255,255,.72);font-weight:500}
  .ph{position:absolute;left:50%;bottom:${-Math.round(phoneH * 0.1)}px;transform:translateX(-50%);width:${phoneW}px;height:${phoneH}px;border-radius:${Math.round(phoneW * 0.13)}px;
    background:#05070B;padding:${Math.round(phoneW * 0.028)}px;box-shadow:0 0 0 ${Math.max(2, Math.round(W * 0.003))}px #24453E,0 40px 120px -20px rgba(0,0,0,.7),0 0 160px -40px rgba(227,164,94,.28)}
  .ph img{width:100%;height:100%;border-radius:${Math.round(phoneW * 0.105)}px;display:block;object-fit:cover;object-position:top}
  .ph:after{content:"";position:absolute;top:${Math.round(phoneW * 0.05)}px;left:50%;transform:translateX(-50%);width:${Math.round(phoneW * 0.28)}px;height:${Math.round(phoneW * 0.08)}px;border-radius:99px;background:#05070B}
  </style></head><body><div class="t"><h1>${l1}<em>${l2}</em></h1><p>${sub}</p></div><div class="ph"><img src="data:image/png;base64,${img}"></div></body></html>`;
}

(async () => {
  const { srv, url } = await serve();
  const browser = await chromium.launch();
  for (const lang of ['fr', 'en']) {
    const shots = await capture(browser, url, lang);
    const raw = path.join(OUT, 'raw', lang); fs.mkdirSync(raw, { recursive: true });
    for (const [k, b64] of Object.entries(shots)) fs.writeFileSync(path.join(raw, k + '.png'), Buffer.from(b64, 'base64'));
    for (const [plat, W, H] of [['ios', 1320, 2868], ['android', 1080, 1920]]) {
      const dir = path.join(OUT, lang, plat); fs.mkdirSync(dir, { recursive: true });
      const p = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
      for (const s of SHOTS) {
        await p.setContent(card(s, lang, shots[s.id], W, H)); await p.waitForTimeout(150);
        await p.screenshot({ path: path.join(dir, s.id + '.jpg'), type: 'jpeg', quality: 90 });
      }
      await p.close();
      console.log('écrit', dir);
    }
  }
  await browser.close(); srv.close();
})();
