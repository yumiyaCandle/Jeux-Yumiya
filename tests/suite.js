/* Suite de tests LIBRE. Chaque test lève une erreur (assert) en cas d’échec. */
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { page, profileState, seed, ROOT } = require('./helpers');

const T = [];
const test = (group, name, fn, o = {}) => T.push({ group, name, fn, o });
const noErr = p => assert.deepEqual(p.errors, [], 'erreurs JavaScript : ' + p.errors.join(' | '));

/* ---------- Démarrage, confidentialité réseau ---------- */
test('Démarrage', 'L’accueil s’affiche sans erreur ni requête externe', async (b, base) => {
  const p = await page(b, base); await p.goto(base); await p.waitForSelector('[data-a="obNext"]');
  assert.ok(await p.$('[data-a="demo"]'), 'le mode démo reste proposé dans la version web');
  await p.waitForTimeout(600); noErr(p); assert.deepEqual(p.external, [], 'requêtes externes : ' + p.external.join(', '));
});

test('Inscription', 'Créer un profil « cigarettes » de bout en bout, puis le retrouver après rechargement', async (b, base) => {
  const p = await page(b, base); await p.goto(base); await p.click('[data-a="obNext"]');
  for (let n = 0; n < 120; n++) {
    await p.waitForTimeout(200);
    const s = await p.state(); if (s && s.profile && s.habits.length) break;
    if (await p.$('[data-a="obToggleType"]')) { const sel = '[data-a="obToggleType"][data-k="cigarette"]'; if (await p.getAttribute(sel, 'aria-pressed') !== 'true') await p.click(sel); }
    for (const i of await p.$$('input[data-ob]')) { if (!(await i.isVisible()) || await i.inputValue()) continue; const k = await i.getAttribute('data-ob'), ty = await i.getAttribute('type');
      await i.fill(k === 'name' ? 'Camille' : k === 'age' ? '34' : k === 'height' ? '170' : k === 'weight' ? '65' : ty === 'datetime-local' ? '2026-11-10T20:00' : '10'); }
    const gs = await p.$$('[data-a="obPick"][data-p*="goal"]');
    if (gs.length && !(await p.$('[data-a="obPick"][data-p*="goal"][aria-pressed="true"]'))) { await p.click('[data-a="obPick"][data-p*="goal"][data-v="arreter"]'); continue; }
    for (const a of ['obPick', 'obSince', 'obLast']) { const els = await p.$$(`[data-a="${a}"]`); if (els.length && !(await p.$(`[data-a="${a}"][aria-pressed="true"]`))) { await els[0].click(); await p.waitForTimeout(120); break; } }
    const cta = await p.$('#obCta:not([disabled])'); if (cta) await cta.click();
  }
  let s = await p.state(); assert.ok(s && s.profile, 'profil créé'); assert.equal(s.habits[0].type, 'cigarette'); assert.equal(s.prefs.mainHabit, s.habits[0].id);
  await p.reload(); await p.waitForSelector('#app[data-view="accueil"]'); s = await p.state(); assert.equal(s.profile.name, 'Camille'); noErr(p);
});

test('Suivi', 'Noter une consommation remet le compteur à zéro et persiste', async (b, base) => {
  const p = await page(b, base, { init: seed(profileState()) }); await p.goto(base); await p.waitForSelector('[data-a="quickPlus"]'); await p.closeLayer();
  await p.click('[data-a="quickPlus"]'); await p.waitForTimeout(300);
  let s = await p.state(); assert.equal(s.logs.length, 1, 'une consommation enregistrée');
  await p.reload(); await p.waitForSelector('#app[data-view="accueil"]'); s = await p.state(); assert.equal(s.logs.length, 1); noErr(p);
});

test('Suivi', 'Plusieurs addictions : changer l’addiction principale', async (b, base) => {
  const p = await page(b, base, { init: seed(profileState({ types: ['alcool', 'jeux_argent', 'reseaux'] })) }); await p.goto(base);
  await p.go('habitudes'); await p.closeLayer(); await p.click('[data-a="setMain"][data-id="h1"]'); await p.waitForTimeout(200);
  assert.equal((await p.state()).prefs.mainHabit, 'h1'); noErr(p);
});

/* ---------- Journal ---------- */
test('Journal', 'Pagination par 30 et recherche sur toutes les entrées', async (b, base) => {
  const now = Date.now(), journal = Array.from({ length: 95 }, (_, i) => ({ id: 'j' + i, ts: now - i * 36e5, mood: 3, craving: 2, triggers: [], diff: '', win: '', text: i === 90 ? 'mot-unique-ancien' : 'Journée ' + i }));
  const p = await page(b, base, { init: seed(profileState({ extra: { journal } })) }); await p.goto(base); await p.go('journal'); await p.closeLayer();
  assert.equal(await p.$$eval('.jentry', x => x.length), 30, '30 entrées affichées');
  await p.click('[data-a="jMore"]'); await p.waitForTimeout(150); assert.equal(await p.$$eval('.jentry', x => x.length), 60);
  await p.fill('#jq', 'mot-unique-ancien'); await p.waitForTimeout(500);
  assert.equal(await p.$$eval('.jentry', x => x.length), 1, 'la recherche trouve une entrée hors de la première page');
  assert.equal(await p.evaluate(() => document.activeElement && document.activeElement.id), 'jq', 'le champ garde le focus');
  noErr(p);
});

/* ---------- Verrouillage ---------- */
test('Sécurité', 'Code PIN : PBKDF2 600 000, sel aléatoire, jamais en clair', async (b, base) => {
  const p = await page(b, base, { init: seed(profileState()) }); await p.goto(base); await p.settle(); await p.go('profil'); await p.closeLayer(); await p.openFold('p-data');
  await p.click('label.switch:has([data-a="lockToggle"])'); await p.fill('#ls1', '482915'); await p.fill('#ls2', '482915'); await p.click('#lockSet button[type="submit"]');
  await p.waitForFunction(() => JSON.parse(localStorage.getItem('libre.v1')).prefs.lock, null, { timeout: 8000 });
  const L = (await p.state()).prefs.lock; assert.equal(L.v, 2); assert.equal(L.iter, 600000); assert.match(L.salt, /^[0-9a-f]{32}$/); assert.match(L.hash, /^[0-9a-f]{64}$/);
  const raw = await p.evaluate(() => localStorage.getItem('libre.v1')); assert.ok(!raw.includes('482915'), 'le code n’apparaît pas en clair');
  await p.reload(); await p.waitForSelector('#lockPin'); await p.fill('#lockPin', '482915'); await p.click('#lockF button[type="submit"]');
  await p.waitForSelector('#app:not([data-view="lock"])', { timeout: 8000 }); noErr(p);
});

test('Sécurité', 'Code PIN : 5 erreurs bloquent l’accès, même après rechargement', async (b, base) => {
  const p = await page(b, base, { init: seed(profileState()) }); await p.goto(base); await p.settle(); await p.go('profil'); await p.closeLayer(); await p.openFold('p-data');
  await p.click('label.switch:has([data-a="lockToggle"])'); await p.fill('#ls1', '1357'); await p.fill('#ls2', '1357'); await p.click('#lockSet button[type="submit"]');
  await p.waitForFunction(() => JSON.parse(localStorage.getItem('libre.v1')).prefs.lock, null, { timeout: 8000 }); await p.reload();
  for (let i = 0; i < 5; i++) { await p.waitForSelector('#lockPin:not([disabled])', { timeout: 8000 }); await p.fill('#lockPin', '0000'); await p.click('#lockF button[type="submit"]'); await p.waitForTimeout(900); }
  assert.ok(+(await p.state()).prefs.lock.until > Date.now(), 'délai enregistré');
  await p.reload(); await p.waitForSelector('#lockPin'); assert.ok(await p.$eval('#lockPin', i => i.disabled), 'toujours bloqué après rechargement'); noErr(p);
});

test('Sécurité', 'Code PIN ancien format : accepté puis converti en PBKDF2', async (b, base) => {
  const legacy = async (pin, salt) => { const c = require('crypto'); let h = c.createHash('sha256').update(salt + ':' + pin).digest(); for (let i = 0; i < 999; i++) h = c.createHash('sha256').update(h).digest(); return h.toString('hex'); };
  const st = profileState(); st.prefs.lock = { salt: 'abc123', hash: await legacy('2468', 'abc123') };
  const p = await page(b, base, { init: seed(st) }); await p.goto(base); await p.waitForSelector('#lockPin'); await p.fill('#lockPin', '2468'); await p.click('#lockF button[type="submit"]');
  await p.waitForSelector('#app:not([data-view="lock"])', { timeout: 8000 }); const L = (await p.state()).prefs.lock; assert.equal(L.v, 2, 'converti'); noErr(p);
});

/* ---------- Sauvegardes ---------- */
async function exportEncrypted(p, pw) {
  await p.go('profil'); await p.closeLayer(); await p.openFold('p-data'); await p.click('[data-a="exportFile"]');
  await p.fill('#ep1', pw); await p.fill('#ep2', pw);
  const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 15000 }), p.click('#expF button[type="submit"]')]);
  return fs.readFileSync(await dl.path(), 'utf8');
}
async function importFile(p, txt) {
  await p.go('profil'); await p.closeLayer(); await p.openFold('p-data'); await p.waitForSelector('[data-a="importFile"]', { state: 'visible' });
  const f = path.join(require('os').tmpdir(), 'libre-test-' + Date.now() + '.json'); fs.writeFileSync(f, txt);
  const [fc] = await Promise.all([p.waitForEvent('filechooser'), p.click('[data-a="importFile"]')]); await fc.setFiles(f); await p.waitForTimeout(400);
}
test('Sauvegarde', 'Export chiffré : aucun texte lisible, mauvais mot de passe refusé, restauration exacte', async (b, base) => {
  const st = profileState({ name: 'Nom-Secret', extra: { journal: [{ id: 'j1', ts: Date.now(), mood: 2, text: 'Confidence-intime', triggers: [] }] } });
  const p = await page(b, base, { init: seed(st) }); await p.goto(base); await p.settle();
  const txt = await exportEncrypted(p, 'correct horse 42');
  const o = JSON.parse(txt); assert.equal(o._libre.encrypted, 'AES-256-GCM'); assert.equal(o._libre.iter, 600000);
  assert.ok(!txt.includes('Nom-Secret') && !txt.includes('Confidence-intime'), 'rien de lisible dans le fichier');
  await p.evaluate(() => { const s = JSON.parse(localStorage.getItem('libre.v1')); s.journal = []; s.profile.name = 'Autre'; localStorage.setItem('libre.v1', JSON.stringify(s)); }); await p.reload();
  await importFile(p, txt); await p.fill('#ip1', 'mauvais'); await p.click('#impF button[type="submit"]'); await p.waitForTimeout(1500);
  assert.match(await p.textContent('#ipErr'), /incorrect/i);
  await p.fill('#ip1', 'correct horse 42'); await p.click('#impF button[type="submit"]'); await p.waitForSelector('#cfOk', { timeout: 10000 }); await p.click('#cfOk'); await p.waitForTimeout(400);
  const s = await p.state(); assert.equal(s.profile.name, 'Nom-Secret'); assert.equal(s.journal[0].text, 'Confidence-intime');
  assert.ok(await p.evaluate(() => !!localStorage.getItem('libre.v1.avant')), 'copie de sécurité avant restauration'); noErr(p);
});

test('Sauvegarde', 'Export sans mot de passe : demande une confirmation explicite', async (b, base) => {
  const p = await page(b, base, { init: seed(profileState()) }); await p.goto(base); await p.settle(); await p.go('profil'); await p.closeLayer(); await p.openFold('p-data');
  await p.click('[data-a="exportFile"]'); await p.click('[data-a="expPlain"]'); await p.waitForSelector('#cfOk');
  const [dl] = await Promise.all([p.waitForEvent('download'), p.click('#cfOk')]); const o = JSON.parse(fs.readFileSync(await dl.path(), 'utf8'));
  assert.equal(o._libre.format, 5); assert.equal(o.profile.name, 'Camille'); noErr(p);
});

test('Sauvegarde', 'Fichier d’une version future, fichier corrompu, fichier hostile', async (b, base) => {
  const p = await page(b, base, { init: seed(profileState()) }); p.on('dialog', d => { p.errors.push('dialog ' + d.message()); d.dismiss(); }); await p.goto(base); await p.settle();
  await importFile(p, JSON.stringify({ _libre: { app: 'LIBRE', format: 99 }, profile: { name: 'X' } })); assert.match(await p.textContent('.toast'), /récente/i); await p.closeLayer();
  await importFile(p, '{"profile": {'); assert.match(await p.textContent('.toast'), /invalide/i); await p.closeLayer();
  const evil = profileState({ name: '<img src=x onerror=alert(1)>' }); evil.habits[0].label = '<script>alert(2)</script>'; evil.health = { enabled: true, read: ['steps'], days: { '2026-11-01': { steps: '<b>1</b>' } } };
  await importFile(p, JSON.stringify(evil)); await p.click('#cfOk'); await p.waitForTimeout(500); await p.go('profil'); await p.go('accueil');
  const s = await p.state(); assert.deepEqual(s.health.days, {}, 'valeurs santé non numériques écartées'); noErr(p);
});

test('Sauvegarde', 'Revenir à l’état d’avant une restauration', async (b, base) => {
  const p = await page(b, base, { init: seed(profileState({ name: 'Avant' })) }); await p.goto(base); await p.settle();
  await importFile(p, JSON.stringify(profileState({ name: 'Après' }))); await p.click('#cfOk'); await p.waitForTimeout(300);
  assert.equal((await p.state()).profile.name, 'Après'); await p.go('profil'); await p.closeLayer(); await p.openFold('p-data');
  await p.click('[data-a="snapRestore"]'); await p.click('#cfOk'); await p.waitForTimeout(300); assert.equal((await p.state()).profile.name, 'Avant'); noErr(p);
});

test('Sauvegarde', 'Effacer toutes les données', async (b, base) => {
  const p = await page(b, base, { init: seed(profileState()) }); await p.goto(base); await p.settle(); await p.go('profil'); await p.closeLayer(); await p.openFold('p-data');
  await p.click('[data-a="resetAsk"]'); await p.click('#cfOk'); await p.waitForTimeout(300);
  const s = await p.state(); assert.equal(s.profile, null); assert.equal(s.habits.length, 0); assert.equal(s.journal.length, 0); noErr(p);
});

/* ---------- Application native (plugins simulés) ---------- */
test('Natif', 'Coffre chiffré : migration des anciennes données, plus rien en clair', async (b, base) => {
  const p = await page(b, base, { native: { platform: 'ios' }, init: seed(profileState({ name: 'Migré' })) }); await p.goto(base); await p.waitForSelector('#app[data-view="accueil"]');
  const v = await p.vault(); assert.ok(v.state && v.state.startsWith('ENC:'), 'données dans le coffre');
  assert.equal(await p.evaluate(() => localStorage.getItem('libre.v1')), null, 'copie en clair supprimée');
  await p.closeLayer(); await p.click('[data-a="quickPlus"]'); await p.waitForTimeout(400);
  assert.equal(await p.evaluate(() => localStorage.getItem('libre.v1')), null, 'les nouvelles écritures restent dans le coffre');
  await p.reload(); await p.waitForSelector('#app[data-view="accueil"]'); await p.go('habitudes');
  const s = await p.evaluate(() => { const v = JSON.parse(sessionStorage.getItem('__vault')); return JSON.parse(decodeURIComponent(escape(atob(v.state.slice(4))))); });
  assert.equal(s.profile.name, 'Migré'); assert.equal(s.logs.length, 1); noErr(p);
});

test('Natif', 'Coffre illisible : le fichier est mis de côté, jamais écrasé', async (b, base) => {
  const p = await page(b, base, { native: { platform: 'android', vaultBroken: true }, init: { fn: () => { if (!sessionStorage.getItem('__vault')) sessionStorage.setItem('__vault', JSON.stringify({ state: 'ENC:xxx' })); } } });
  await p.goto(base); await p.waitForTimeout(1500);
  assert.ok((await p.evaluate(() => window.__calls)).some(c => c[0] === 'LibreVault.move'), 'fichier déplacé');
  assert.match(await p.textContent('body'), /introuvables/i); noErr(p);
});

test('Natif', 'Version store : pas de mode démo, pas de service worker, pas d’installation PWA', async (b, base) => {
  const p = await page(b, base, { native: { platform: 'android' } }); await p.goto(base); await p.waitForSelector('[data-a="obNext"]'); await p.waitForTimeout(800);
  assert.equal(await p.$('[data-a="demo"]'), null, 'mode démo absent');
  assert.equal(await p.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).length), 0, 'aucun service worker');
  noErr(p);
});

test('Natif', 'Export et bilan : feuille de partage du système', async (b, base) => {
  const p = await page(b, base, { native: { platform: 'ios' }, init: seed(profileState()) }); await p.goto(base); await p.waitForSelector('#app[data-view="accueil"]');
  await p.go('profil'); await p.closeLayer(); await p.openFold('p-data'); await p.click('[data-a="exportFile"]'); await p.fill('#ep1', 'motdepasse1'); await p.fill('#ep2', 'motdepasse1');
  await p.click('#expF button[type="submit"]'); await p.waitForFunction(() => window.__calls.some(c => c[0] === 'Share.share'), null, { timeout: 15000 });
  const f = await p.evaluate(() => window.__lastFile); assert.equal(f.directory, 'CACHE'); assert.ok(JSON.parse(f.data)._libre.encrypted);
  await p.closeLayer(); await p.go('bilans'); const btn = await p.$('[data-a="printMonth"]');
  if (btn) { await btn.click(); await p.waitForFunction(() => window.__calls.filter(c => c[0] === 'Share.share').length >= 2, null, { timeout: 8000 }); assert.match(await p.evaluate(() => window.__lastFile.path), /^libre-bilan-\d{4}-\d\d\.html$/); }
  noErr(p);
});

test('Natif', 'Bouton Retour Android : ferme la fenêtre, revient en arrière, puis réduit l’app', async (b, base) => {
  const p = await page(b, base, { native: { platform: 'android' }, init: seed(profileState()) }); await p.goto(base); await p.waitForSelector('#app[data-view="accueil"]'); await p.closeLayer();
  await p.go('stats'); await p.evaluate(() => document.querySelector('[data-a="sos"],.sosfab')?.click()); await p.waitForTimeout(300);
  await p.evaluate(() => window.__fire('backButton')); await p.waitForTimeout(200); assert.equal(await p.evaluate(() => document.getElementById('layer').innerHTML), '', 'fenêtre fermée');
  await p.evaluate(() => window.__fire('backButton')); await p.waitForFunction(() => document.getElementById('app').dataset.view === 'accueil', null, { timeout: 3000 });
  await p.evaluate(() => window.__fire('backButton')); await p.waitForTimeout(200); assert.ok((await p.evaluate(() => window.__calls)).some(c => c[0] === 'App.minimizeApp')); noErr(p);
});

test('Notifications', 'Rappels natifs : discrets, ≤ 60, dans le futur, aucun pendant la période calme', async (b, base) => {
  const st = profileState(); st.prefs.nt = { enabled: true, system: true, discreet: true, pauseUntil: 0, quiet: { on: true, from: '19:00', to: '22:00' },
    items: { daily: { on: true, time: '20:30', days: [0,1,2,3,4,5,6], text: '' }, motivation: { on: true, time: '09:00', days: [0,1,2,3,4,5,6], text: '' } } };
  const p = await page(b, base, { native: { platform: 'ios', noVault: true }, init: seed(st) }); await p.goto(base); await p.waitForTimeout(2500);
  const sc = await p.evaluate(() => window.__sched.map(n => ({ at: new Date(n.schedule.at).getTime(), h: new Date(n.schedule.at).getHours(), body: n.body, title: n.title })));
  assert.ok(sc.length > 0 && sc.length <= 60, 'nombre : ' + sc.length); assert.ok(sc.every(n => n.at > Date.now()));
  assert.ok(sc.every(n => !(n.h >= 19 && n.h < 22)), 'période calme respectée');
  assert.ok(sc.every(n => !/cigarette|tabac|alcool|cannabis|jours sans/i.test(n.body + ' ' + n.title)), 'aucun texte sensible'); noErr(p);
});

test('Santé Apple', 'Connexion, synchronisation sans doublon, déconnexion qui efface', async (b, base) => {
  const init = { fn: () => { const day = t => { const x = new Date(t); return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); };
    window.Capacitor.Plugins.LibreHealth = { isAvailable: async () => ({ available: true }), requestAuthorization: async () => ({ requested: true }),
      queryDaily: async ({ from, to }) => { const out = []; for (let t = new Date(from).getTime(); t < new Date(to).getTime(); t += 864e5) out.push({ date: day(t), steps: 6000, sleep: 7 }); return { days: out }; } }; } };
  const st = profileState();
  const p = await page(b, base, { native: { platform: 'ios', noVault: true }, init: { fn: ([a, s]) => { if (!sessionStorage.getItem('__seeded')) { localStorage.setItem('libre.v1', JSON.stringify(s)); sessionStorage.setItem('__seeded', '1'); } }, arg: [0, st] } });
  await p.ctx.addInitScript(init.fn); await p.goto(base); await p.settle(); await p.go('profil'); await p.closeLayer(); await p.openFold('p-hk'); await p.waitForSelector('[data-a="hkConnect"]');
  await p.click('[data-a="hkConnect"]'); await p.waitForTimeout(1200); const n1 = Object.keys((await p.state()).health.days).length; assert.ok(n1 >= 90);
  await p.openFold('p-hk'); await p.waitForSelector('[data-a="hkSync"]', { state: 'visible' }); await p.click('[data-a="hkSync"]'); await p.waitForTimeout(800); assert.equal(Object.keys((await p.state()).health.days).length, n1, 'pas de doublon');
  await p.waitForSelector('[data-a="hkOff"]', { state: 'visible' }); await p.click('[data-a="hkOff"]'); await p.click('#cfOk'); await p.waitForTimeout(300); const h = (await p.state()).health; assert.equal(h.enabled, false); assert.deepEqual(h.days, {}); noErr(p);
});

test('Santé Apple', 'Navigateur : aucune fausse connexion proposée', async (b, base) => {
  const p = await page(b, base, { init: seed(profileState()) }); await p.goto(base); await p.go('profil'); await p.closeLayer(); await p.openFold('p-hk'); await p.waitForTimeout(400);
  assert.equal(await p.$('[data-a="hkConnect"]'), null); assert.match(await p.textContent('#hkBox'), /Indisponible ici/); noErr(p);
});

/* ---------- Langues ---------- */
test('Langues', 'Chaque langue : navigation traduite, aucune erreur', async (b, base) => {
  const langs = ['fr', 'en', 'de', 'it', 'es', 'pt', 'nl', 'sv', 'da', 'nb', 'pl', 'ru', 'tr', 'ar', 'hi', 'id', 'vi', 'zh', 'ja', 'ko'];
  for (const lang of langs) {
    const p = await page(b, base, { init: seed(profileState({ lang })) }); await p.goto(base); await p.waitForSelector('#app[data-view="accueil"]');
    const nav = await p.evaluate(() => [...document.querySelectorAll('nav a, nav button')].map(x => x.textContent.trim()).join('|'));
    if (lang !== 'fr') assert.ok(!/Accueil|Habitudes|Outils|Progrès/.test(nav), `${lang} : navigation en français (${nav})`);
    noErr(p); await p.ctx.close();
  }
}, { slow: true });

test('Langues', 'Formats régionaux : dates et devise', async (b, base) => {
  const st = profileState({ lang: 'de' }); st.prefs.currency = 'CHF';
  const p = await page(b, base, { locale: 'de-CH', init: seed(st) }); await p.goto(base); await p.waitForSelector('#app[data-view="accueil"]');
  const txt = await p.textContent('#app'); assert.match(txt, /CHF/); noErr(p);
});

/* ---------- Accessibilité et affichage ---------- */
const VIEWS = ['accueil', 'habitudes', 'stats', 'calendrier', 'bilans', 'outils', 'journal', 'envies', 'biblio', 'sante', 'profil'];
test('Accessibilité', 'Boutons et champs nommés, images décrites, sur tous les écrans', async (b, base) => {
  const p = await page(b, base, { init: seed(profileState({ types: ['alcool', 'cigarette'] })) }); await p.goto(base);
  for (const v of VIEWS) { await p.go(v); await p.closeLayer();
    const bad = await p.evaluate(() => { const name = e => (e.getAttribute('aria-label') || e.getAttribute('title') || e.textContent || (e.labels && [...e.labels].map(l => l.textContent).join('')) || e.getAttribute('placeholder') || '').trim();
      const out = []; document.querySelectorAll('#app button, #app a[href], #app input:not([type=hidden]), #app select, #app textarea').forEach(e => { if (e.offsetParent && !name(e)) out.push(e.outerHTML.slice(0, 90)); });
      document.querySelectorAll('#app img').forEach(i => { if (!i.hasAttribute('alt')) out.push('img sans alt ' + i.src.slice(-30)); }); return out; });
    assert.deepEqual(bad, [], v + ' : éléments sans nom accessible'); }
  noErr(p);
});

test('Accessibilité', 'Cibles tactiles d’au moins 24 px (WCAG 2.2) sur les actions principales', async (b, base) => {
  const p = await page(b, base, { init: seed(profileState()) }); await p.goto(base);
  for (const v of ['accueil', 'outils', 'profil']) { await p.go(v); await p.closeLayer();
    const small = await p.evaluate(() => [...document.querySelectorAll('#app .btn, nav a, .sosfab, .iconbtn')].filter(e => e.offsetParent).map(e => { const r = e.getBoundingClientRect(); return [e.textContent.trim().slice(0, 20) || e.getAttribute('aria-label'), Math.round(r.width), Math.round(r.height)]; }).filter(x => x[1] < 24 || x[2] < 24));
    assert.deepEqual(small, [], v); }
  noErr(p);
});

test('Affichage', 'Aucun débordement horizontal de 320 px à 1280 px, clair et sombre', async (b, base) => {
  for (const [w, h, cs] of [[320, 640, 'light'], [390, 844, 'dark'], [768, 1024, 'light'], [1280, 800, 'dark']]) {
    const p = await page(b, base, { viewport: { width: w, height: h }, colorScheme: cs, init: seed(profileState({ types: ['alcool', 'jeux_video'] })) }); await p.goto(base);
    for (const v of VIEWS) { await p.go(v); const o = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth); assert.ok(o <= 1, `${w}px ${v} : débordement ${o}px`); }
    if (cs === 'dark') { const bg = await p.evaluate(() => getComputedStyle(document.body).backgroundColor); const m = bg.match(/\d+/g).map(Number); assert.ok(m[0] + m[1] + m[2] < 200, 'fond sombre : ' + bg); }
    noErr(p); await p.ctx.close();
  }
}, { slow: true });

/* ---------- Charge ---------- */
test('Performance', '3 ans d’historique, 4 addictions : chaque écran s’affiche en moins de 1,5 s', async (b, base) => {
  const st = profileState({ types: ['cigarette', 'alcool', 'cannabis', 'jeux_argent'], days: 1095 }); let r = 7; const rnd = () => (r = (r * 16807) % 2147483647) / 2147483647;
  const D = 864e5, start = Date.now() - 1095 * D;
  for (let d = 0; d < 1095; d++) { st.habits.forEach(h => { const n = Math.floor(rnd() * (d < 400 ? 12 : 4)); for (let k = 0; k < n; k++) st.logs.push({ id: 'l' + st.logs.length, habitId: h.id, type: h.type, ts: start + d * D + 8 * 36e5 + rnd() * 50e6, qty: 1, trigger: 'Stress' }); });
    st.journal.push({ id: 'j' + d, ts: start + d * D + 20 * 36e5, mood: 1 + Math.floor(rnd() * 5), craving: 3, triggers: [], text: 'Entrée '.repeat(20) }); }
  const p = await page(b, base, { init: seed(st) }); const t0 = Date.now(); await p.goto(base); await p.waitForSelector('#app[data-view="accueil"]'); const boot = Date.now() - t0;
  const times = { démarrage: boot };
  for (const v of VIEWS) { times[v] = await p.evaluate(v => new Promise(res => { const a = performance.now(); location.hash = v; const c = () => document.getElementById('app').dataset.view === v ? requestAnimationFrame(() => res(Math.round(performance.now() - a))) : setTimeout(c, 1); c(); }), v); }
  module.exports.lastPerf = { logs: st.logs.length, journal: st.journal.length, times };
  for (const [k, v] of Object.entries(times)) assert.ok(v < 1500, `${k} : ${v} ms`); noErr(p);
}, { slow: true });

/* ---------- Fichier autonome et PWA ---------- */
test('Distribution', 'LIBRE.html autonome : fonctionne depuis un fichier, sans aucune requête externe', async (b, base) => {
  const f = path.join(ROOT, 'LIBRE.html'); if (!fs.existsSync(f)) throw Object.assign(new Error('LIBRE.html absent (lancer la construction)'), { skip: true });
  const p = await page(b, 'file://'); await p.goto('file://' + f); await p.waitForSelector('[data-a="obNext"]'); await p.waitForTimeout(500);
  assert.deepEqual(p.external, []); noErr(p);
});

test('Distribution', 'PWA : service worker actif et fonctionnement hors ligne', async (b, base) => {
  const p = await page(b, base); await p.goto(base); await p.waitForFunction(() => navigator.serviceWorker && navigator.serviceWorker.controller, null, { timeout: 15000 }).catch(() => {});
  await p.waitForTimeout(500); await p.goto(base).catch(() => {}); await p.waitForFunction(() => navigator.serviceWorker.controller, null, { timeout: 15000 });
  await p.ctx.setOffline(true); await p.reload(); await p.waitForSelector('[data-a="obNext"]'); await p.ctx.setOffline(false); noErr(p);
});

/* ---------- Apparence (verre, lumière, animations, couleur d’accent) ---------- */
test('Apparence', 'Couleurs d’accent : contraste des boutons ≥ 4,5:1 en clair et en sombre', async (b, base) => {
  for (const cs of ['light', 'dark']) for (const acc of ['vert', 'lagon', 'indigo', 'corail']) {
    const st = profileState(); st.prefs.accent = acc;
    const p = await page(b, base, { colorScheme: cs, init: seed(st) }); await p.goto(base); await p.settle(); await p.go('habitudes'); await p.closeLayer();
    const r = await p.evaluate(() => { const b = document.querySelector('#app .btn.primary'); if (!b) return null; const cs = getComputedStyle(b);
      const rgb = c => c.match(/[\d.]+/g).slice(0, 3).map(Number), lum = c => { const [r, g, b] = rgb(c).map(v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }); return .2126 * r + .7152 * g + .0722 * b; };
      /* fond : couleur unie, sinon la couleur la plus claire / la plus foncée du dégradé (cas le moins favorable) */
      let bgs = [cs.backgroundColor]; if (/rgba\(0, 0, 0, 0\)/.test(cs.backgroundColor) && cs.backgroundImage !== 'none') {
        bgs = [...cs.backgroundImage.matchAll(/color\(srgb ([\d.]+) ([\d.]+) ([\d.]+)[^)]*\)|rgba?\(([\d.]+), ([\d.]+), ([\d.]+)/g)].map(m => m[1] != null ? `rgb(${m[1] * 255},${m[2] * 255},${m[3] * 255})` : `rgb(${m[4]},${m[5]},${m[6]})`); }
      const a = lum(cs.color); const ratios = bgs.map(x => { const c = lum(x); return (Math.max(a, c) + .05) / (Math.min(a, c) + .05); });
      return { ratio: Math.min(...ratios), fg: cs.color, bg: bgs.join(' → ') }; const c = 0; return { ratio: (Math.max(a, c) + .05) / (Math.min(a, c) + .05), fg: cs.color, bg: cs.backgroundColor }; });
    assert.ok(r, 'bouton principal introuvable'); assert.ok(r.ratio >= 4.5, `${cs} ${acc} : contraste ${r.ratio.toFixed(2)} (${r.fg} sur ${r.bg})`);
    noErr(p); await p.ctx.close();
  }
}, { slow: true });

test('Apparence', 'Réglage : changer la couleur et couper les effets, conservé après rechargement', async (b, base) => {
  const p = await page(b, base, { init: seed(profileState()) }); await p.goto(base); await p.settle();
  assert.ok(await p.evaluate(() => document.documentElement.classList.contains('fx')), 'effets actifs par défaut');
  await p.go('profil'); await p.closeLayer(); await p.openFold('p-look'); await p.click('[data-a="setAccent"][data-v="indigo"]');
  await p.click('label.switch:has([data-a="fxToggle"])'); await p.waitForTimeout(200);
  await p.reload(); await p.waitForSelector('#app[data-view]');
  const r = await p.evaluate(() => [document.documentElement.dataset.accent, document.documentElement.classList.contains('fx'), getComputedStyle(document.getElementById('amb')).display]);
  assert.deepEqual(r, ['indigo', false, 'none'], JSON.stringify(r) + ' ' + JSON.stringify((await p.state()).prefs.accent)); const pr = (await p.state()).prefs; assert.equal(pr.accent, 'indigo'); assert.equal(pr.fx, false); noErr(p);
});

test('Apparence', 'Moins d’animations demandé par le système : aucune animation d’écran', async (b, base) => {
  const p = await page(b, base, { init: seed(profileState()) }); await p.goto(base); await p.settle();   /* le contexte de test demande « reduce » */
  await p.go('stats'); const n = await p.evaluate(() => document.getAnimations().filter(a => a.effect && a.effect.target && a.effect.target.closest && a.effect.target.closest('#app')).length);
  assert.equal(n, 0, 'animations : ' + n); noErr(p);
});

test('Apparence', 'Animations actives : ouverture, entrée des blocs, barres qui se transforment', async (b, base) => {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, locale: 'fr-CH' }); const st = profileState();
  st.logs = Array.from({ length: 40 }, (_, i) => ({ id: 'l' + i, habitId: 'h0', type: 'cigarette', ts: Date.now() - i * 15 * 36e5, qty: 1 }));
  await ctx.addInitScript(([s]) => { if (!sessionStorage.getItem('__seeded')) { localStorage.setItem('libre.v1', JSON.stringify(s)); sessionStorage.setItem('__seeded', '1'); } }, [st]);
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(base); await p.waitForTimeout(150);
  assert.ok(await p.evaluate(() => document.getAnimations().some(a => a.effect && a.effect.target && a.effect.target.id === 'app')), 'ouverture animée');
  await p.waitForTimeout(1800); await p.evaluate(() => document.querySelectorAll('#layer').forEach(x => x.innerHTML = ''));
  await p.evaluate(() => { location.hash = 'stats'; }); await p.waitForTimeout(60);
  assert.ok(await p.evaluate(() => document.getAnimations().filter(a => a.effect && a.effect.target && a.effect.target.closest && a.effect.target.closest('#app')).length) >= 3, 'blocs animés');
  await p.waitForTimeout(1200); await p.click('text=30 jours'); await p.waitForTimeout(50);
  assert.ok(await p.evaluate(() => document.getAnimations().some(a => a.effect && a.effect.target && a.effect.target.matches && a.effect.target.matches('rect.gbar'))), 'barres animées');
  assert.deepEqual(errs, []); await ctx.close();
});

test('Apparence', 'Carte principale (couleur et sombre) : texte blanc lisible (≥ 4,5:1 mesuré sur les pixels), 4 couleurs, clair et sombre', async (b, base) => {
  const lum = ([r, g, b]) => [r, g, b].map(v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }).reduce((s, v, i) => s + v * [.2126, .7152, .0722][i], 0);
  for (const cs of ['light', 'dark']) for (const acc of ['vert', 'lagon', 'indigo', 'corail', 'sombre']) {
    const st = profileState({ days: 27 }); if (acc === 'sombre') st.prefs.hero = 'sombre'; else { st.prefs.accent = acc; st.prefs.hero = 'couleur'; }
    const p = await page(b, base, { colorScheme: cs, init: seed(st) }); await p.goto(base); await p.settle();
    const pts = await p.evaluate(() => { const h = document.querySelector('.hm-hero'); h.scrollIntoView({ block: 'center' }); const out = [];
      h.querySelectorAll('dt,.hm-since,.hm-k,.hm-sub,.hm-step').forEach(e => { const r = e.getBoundingClientRect(); if (r.width) out.push([r.left + 4, r.top + r.height / 2], [r.right - 6, r.top + r.height / 2]); });
      h.querySelectorAll('*').forEach(e => e.style.setProperty('color', 'transparent', 'important')); h.querySelectorAll('svg,.hm-orbs,.hm-pill,.hm-rec').forEach(e => e.style.visibility = 'hidden'); return out; });
    await p.waitForTimeout(120); const buf = await p.screenshot();
    const px = await p.evaluate(async ([b64, pts]) => { const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode(); const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
      const x = c.getContext('2d'); x.drawImage(img, 0, 0); return pts.map(([a, b]) => [...x.getImageData(Math.round(a), Math.round(b), 1, 1).data].slice(0, 3)); }, [buf.toString('base64'), pts]);
    const min = Math.min(...px.map(c => 1.05 / (lum(c) + .05)));
    assert.ok(min >= 4.5, `${cs} ${acc} : contraste ${min.toFixed(2)}`); await p.ctx.close();
  }
}, { slow: true });

/* ---------- Page de présentation (libre/site) ---------- */
test('Distribution', 'Page de présentation : sans erreur, sans requête externe, sans débordement, FR et EN', async (b, base) => {
  for (const [w, h] of [[360, 780], [1280, 800]]) {
    const p = await page(b, base, { viewport: { width: w, height: h } }); const failed = []; p.on('requestfailed', r => failed.push(r.url()));
    await p.goto(base + 'site/'); await p.waitForTimeout(500);
    assert.equal(await p.evaluate(() => document.documentElement.scrollWidth - innerWidth), 0, w + ' px : débordement');
    assert.ok((await p.evaluate(() => parseFloat(getComputedStyle(document.querySelector('.ch .num')).fontSize))) > 80, 'chiffres géants');
    await p.click('#l-en'); assert.match(await p.textContent('h1'), /Quit/); assert.match(await p.getAttribute('[data-img="02-sos"]', 'src'), /en-02-sos/);
    assert.deepEqual(failed, []); assert.deepEqual(p.external, []); noErr(p); await p.ctx.close();
  }
});

test('Statistiques', 'Graphiques à parcourir : glisser le doigt ou les flèches affiche la valeur, puis le résumé revient', async (b, base) => {
  const st = profileState({ days: 40 });
  st.logs = Array.from({ length: 30 }, (_, i) => ({ id: 'l' + i, habitId: 'h0', type: 'cigarette', ts: Date.now() - i * 11 * 36e5, qty: 1 + (i % 3) }));
  const p = await page(b, base, { init: seed(st) }); await p.goto(base); await p.settle(); await p.go('stats'); await p.waitForTimeout(900);
  const w = p.locator('.chart-w').first(); await w.scrollIntoViewIfNeeded();
  const sum = await w.locator('.ch-read').textContent(); assert.match(sum, /Plus haut : \d/);
  assert.equal(await p.evaluate(() => document.querySelectorAll('.chart-w rect.gbar[tabindex]').length), 0, 'une seule tabulation par graphique');
  const box = await w.locator('svg.chart').boundingBox(); const yy = box.y + box.height / 2;
  await p.mouse.move(box.x + box.width * 0.2, yy); await p.waitForTimeout(80);
  const a = await w.locator('.ch-read').textContent();
  await p.mouse.move(box.x + box.width * 0.95, yy); await p.waitForTimeout(80);
  const z = await w.locator('.ch-read').textContent();
  assert.ok(a !== sum && z !== a, 'la lecture suit le pointeur : ' + a + ' / ' + z);
  assert.equal(await w.locator('rect.gbar.sel').count(), 1);
  await p.mouse.move(box.x + box.width / 2, box.y - 120); await p.waitForTimeout(800);
  assert.equal(await w.locator('.ch-read').textContent(), sum, 'résumé revenu');
  await w.focus(); await p.keyboard.press('Home'); const h = await w.locator('.ch-read').textContent();
  await p.keyboard.press('ArrowRight'); const r = await w.locator('.ch-read').textContent();
  assert.ok(h !== sum && r !== h, 'flèches : ' + h + ' → ' + r);
  assert.equal(await w.evaluate(x => +x.dataset.i), 1);
  await p.keyboard.press('Escape'); await p.waitForTimeout(50);
  assert.equal(await w.locator('.ch-read').textContent(), sum);
  assert.deepEqual(p.errors || [], []);
});

test('Suivi', 'Après un écart : le total des jours sans est mis en avant, pas un grand « 0 » (fr et en)', async (b, base) => {
  for (const lang of ['fr', 'en']) {
    const st = profileState({ days: 40, lang }); st.logs = [{ id: 'l1', habitId: 'h0', type: 'cigarette', ts: Date.now() - 36e5, qty: 1 }];
    const p = await page(b, base, { init: seed(st) }); await p.goto(base); await p.settle();
    const big = await p.textContent('.hm-hero .hm-days .num'); assert.notEqual(big.trim(), '0', lang + ' : grand zéro');
    assert.ok(+big.replace(/\D/g, '') >= 39, lang + ' : total ' + big);
    assert.match(await p.textContent('.hm-hero .hm-slip'), lang === 'fr' ? /ne t’enlève rien/ : /takes nothing away/);
    assert.ok(await p.$('.hm-hero [data-a="lapse"]'), 'lien « Comprendre ce moment »'); noErr(p); await p.ctx.close();
  }
});

module.exports = { T };
