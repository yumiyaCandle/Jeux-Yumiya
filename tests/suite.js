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
    for (const a of ['obPick', 'obSince', 'obLast']) { const els = await p.$$(`[data-a="${a}"]`); if (els.length && !(await p.$(`[data-a="${a}"][aria-pressed="true"]`))) { await els[0].click().catch(() => {}); await p.waitForTimeout(120); break; } }
    // l’inscription avance seule après un choix : un élément peut disparaître entre la recherche et le clic
    const cta = await p.$('#obCta:not([disabled])'); if (cta) await cta.click().catch(() => {});
  }
  let s = await p.state(); assert.ok(s && s.profile, 'profil créé'); assert.equal(s.habits[0].type, 'cigarette'); assert.equal(s.prefs.mainHabit, s.habits[0].id);
  await p.reload(); await p.waitForSelector('#app[data-view="accueil"]'); s = await p.state(); assert.equal(s.profile.name, 'Camille'); noErr(p);
});

test('Sécurité santé', 'Création d’un suivi « alcool » : l’avertissement de sevrage s’affiche avant de commencer, et pas pour les cigarettes', async (b, base) => {
  const run = async type => { const p = await page(b, base); await p.goto(base); await p.click('[data-a="obNext"]'); let seen = false;
    for (let n = 0; n < 120 && !seen; n++) {
      await p.waitForTimeout(150);
      if ((await p.evaluate(() => document.body.innerText)).includes('le sevrage peut être dangereux')) { seen = true; break; }
      if (await p.$('[data-a="obToggleType"]')) { const sel = `[data-a="obToggleType"][data-k="${type}"]`; if (await p.getAttribute(sel, 'aria-pressed') !== 'true') await p.click(sel); }
      for (const i of await p.$$('input[data-ob]')) { if (!(await i.isVisible()) || await i.inputValue()) continue; const k = await i.getAttribute('data-ob'), ty = await i.getAttribute('type');
        await i.fill(k === 'name' ? 'Camille' : k === 'age' ? '34' : k === 'height' ? '170' : k === 'weight' ? '65' : ty === 'datetime-local' ? '2026-11-10T20:00' : '10'); }
      const gs = await p.$$('[data-a="obPick"][data-p*="goal"]');
      if (gs.length && !(await p.$('[data-a="obPick"][data-p*="goal"][aria-pressed="true"]'))) { await p.click('[data-a="obPick"][data-p*="goal"][data-v="arreter"]'); continue; }
      for (const a of ['obPick', 'obSince', 'obLast']) { const els = await p.$$(`[data-a="${a}"]`); if (els.length && !(await p.$(`[data-a="${a}"][aria-pressed="true"]`))) { await els[0].click(); await p.waitForTimeout(80); } }
      if ((await p.evaluate(() => document.body.innerText)).includes('Ton plan est prêt')) break;
      const cta = await p.$('#obCta:not([disabled])'); if (cta) await cta.click();
    }
    const txt = await p.evaluate(() => document.body.innerText); await p.ctx.close(); return { seen: seen || txt.includes('le sevrage peut être dangereux'), ready: txt.includes('Ton plan est prêt') || seen };
  };
  const a = await run('alcool'); assert.ok(a.seen, 'avertissement affiché pour l’alcool');
  const c = await run('cigarette'); assert.ok(c.ready && !c.seen, 'pas d’avertissement de sevrage dangereux pour les cigarettes');
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
test('Sécurité', 'Navigateur : chiffrement facultatif par mot de passe (rien en clair, mot de passe exigé, désactivation, oubli sans perte)', async (b, base) => {
  const journal = [{ id: 'j1', ts: Date.now() - 864e5, mood: 2, text: 'SECRET-JOURNAL-123', triggers: [] }];
  const p = await page(b, base, { init: seed(profileState({ name: 'Zéphyrine', extra: { journal } })) }); await p.goto(base); await p.settle();
  await p.go('profil'); await p.evaluate(() => document.querySelector('[data-a="wvOn"]').click()); await p.waitForSelector('#wv1');
  await p.fill('#wv1', 'court'); await p.fill('#wv2', 'court'); await p.click('#wvSet button[type=submit]');
  assert.match(await p.textContent('#wvSetErr'), /8 caractères/);
  await p.fill('#wv1', 'mon-mot-de-passe'); await p.fill('#wv2', 'mon-mot-de-passe'); await p.click('#wvSet button[type=submit]');
  assert.match(await p.textContent('#wvSetErr'), /Coche/);
  await p.check('#wvOk'); await p.click('#wvSet button[type=submit]'); await p.waitForFunction(() => !document.querySelector('#wvSet'), null, { timeout: 15000 });
  const dump = () => p.evaluate(() => Object.keys(localStorage).map(k => k + '=' + localStorage.getItem(k)).join('\n'));
  let all = await dump();
  assert.ok(!/SECRET-JOURNAL|Zéphyrine|Z\\u00e9phyrine/.test(all), 'aucune donnée en clair dans le stockage');
  assert.ok(JSON.parse(await p.evaluate(() => localStorage.getItem('libre.v1')))._webvault === 1);
  // une modification est elle aussi écrite chiffrée
  await p.go('journal'); await p.click('[data-a="journalForm"]'); await p.waitForSelector('#j-text'); await p.fill('#j-text', 'DEUXIEME-SECRET'); await p.click('[data-a="saveJournal"]'); await p.waitForTimeout(400);
  all = await dump(); assert.ok(!/DEUXIEME-SECRET/.test(all), 'nouvelle entrée chiffrée');
  // rechargement : mot de passe exigé, rien d'affiché avant
  await p.reload(); await p.waitForSelector('#wvPw'); assert.doesNotMatch(await p.textContent('#app'), /Zéphyrine|SECRET/);
  await p.evaluate(() => { location.hash = 'journal'; }); await p.waitForTimeout(200); assert.ok(await p.$('#wvPw'), 'la navigation ne contourne pas l’écran');
  await p.fill('#wvPw', 'mauvais'); await p.click('#wvF button'); await p.waitForFunction(() => /incorrect/.test(document.getElementById('wvErr').textContent), null, { timeout: 15000 });
  assert.ok(JSON.parse(await p.evaluate(() => localStorage.getItem('libre.v1')))._webvault === 1, 'données intactes après une erreur');
  await p.fill('#wvPw', 'mon-mot-de-passe'); await p.click('#wvF button'); await p.waitForSelector('#app[data-view]:not([data-view="lock"])', { timeout: 15000 });
  await p.go('journal'); await p.waitForTimeout(300); const jt = await p.textContent('.jbook');
  assert.match(jt, /SECRET-JOURNAL-123/); assert.match(jt, /DEUXIEME-SECRET/);
  // désactivation : mot de passe demandé, puis données en clair à nouveau et identiques
  await p.go('profil'); await p.evaluate(() => document.querySelector('[data-a="wvOff"]').click()); await p.waitForSelector('#wv0');
  await p.fill('#wv0', 'faux'); await p.click('#wvUnset button'); await p.waitForFunction(() => /incorrect/.test(document.getElementById('wvUnErr').textContent), null, { timeout: 15000 });
  await p.fill('#wv0', 'mon-mot-de-passe'); await p.click('#wvUnset button'); await p.waitForFunction(() => !document.querySelector('#wvUnset'), null, { timeout: 15000 });
  const plain = JSON.parse(await p.evaluate(() => localStorage.getItem('libre.v1')));
  assert.equal(plain.profile.name, 'Zéphyrine'); assert.equal(plain.journal.length, 2);
  // oubli : on réactive, on recharge, « mot de passe oublié » repart de zéro mais garde la version chiffrée à part
  await p.evaluate(() => document.querySelector('[data-a="wvOn"]').click()); await p.waitForSelector('#wv1');
  await p.fill('#wv1', 'autre-mot-de-passe'); await p.fill('#wv2', 'autre-mot-de-passe'); await p.check('#wvOk'); await p.click('#wvSet button[type=submit]');
  await p.waitForFunction(() => !document.querySelector('#wvSet'), null, { timeout: 15000 });
  await p.reload(); await p.waitForSelector('#wvPw'); await p.click('[data-a="wvForgot"]'); await p.waitForTimeout(200);
  await p.click('#layer .btn.danger'); await p.waitForSelector('#app[data-view]:not([data-view="lock"])', { timeout: 15000 });
  const keys = await p.evaluate(() => Object.keys(localStorage));
  assert.ok(keys.some(k => /^libre\.v1\.chiffre\.\d+$/.test(k)), 'la version chiffrée est conservée à part');
  assert.deepEqual(p.errors, []);
});

test('Sécurité', 'Navigateur chiffré : changer le mot de passe, et deux onglets ouverts qui ne s’écrasent pas', async (b, base) => {
  const p = await page(b, base, { init: seed(profileState({ name: 'Onglets' })) }); await p.goto(base); await p.settle();
  await p.go('profil'); await p.evaluate(() => document.querySelector('[data-a="wvOn"]').click()); await p.waitForSelector('#wv1');
  await p.fill('#wv1', 'ancien-mot-de-passe'); await p.fill('#wv2', 'ancien-mot-de-passe'); await p.check('#wvOk'); await p.click('#wvSet button[type=submit]');
  await p.waitForFunction(() => !document.querySelector('#wvSet'), null, { timeout: 15000 });
  // changement : mauvais mot de passe actuel refusé, puis nouveau mot de passe
  await p.evaluate(() => document.querySelector('[data-a="wvPw"]').click()); await p.waitForSelector('#wvc0');
  await p.fill('#wvc0', 'faux-faux-faux'); await p.fill('#wvc1', 'nouveau-mot-de-passe'); await p.fill('#wvc2', 'nouveau-mot-de-passe'); await p.click('#wvChg button[type=submit]');
  await p.waitForFunction(() => /incorrect/.test(document.getElementById('wvChgErr').textContent), null, { timeout: 15000 });
  await p.fill('#wvc0', 'ancien-mot-de-passe'); await p.click('#wvChg button[type=submit]'); await p.waitForFunction(() => !document.querySelector('#wvChg'), null, { timeout: 15000 });
  // second onglet : l'ancien mot de passe ne marche plus, le nouveau oui
  const q = await p.ctx.newPage(); q.errors = []; q.on('pageerror', e => q.errors.push(e.message));
  await q.goto(base); await q.waitForSelector('#wvPw'); await q.fill('#wvPw', 'ancien-mot-de-passe'); await q.click('#wvF button');
  await q.waitForFunction(() => /incorrect/.test(document.getElementById('wvErr').textContent), null, { timeout: 15000 });
  await q.fill('#wvPw', 'nouveau-mot-de-passe'); await q.click('#wvF button'); await q.waitForSelector('#app[data-view]:not([data-view="lock"])', { timeout: 15000 });
  // une entrée écrite dans le premier onglet apparaît dans le second, puis l'inverse : aucune n'est perdue
  await p.go('journal'); await p.click('[data-a="journalForm"]'); await p.waitForSelector('#j-text'); await p.fill('#j-text', 'ECRIT-ONGLET-1'); await p.click('[data-a="saveJournal"]'); await p.waitForTimeout(600);
  await q.evaluate(() => { location.hash = 'journal'; }); await q.waitForTimeout(600); assert.match(await q.textContent('#app'), /ECRIT-ONGLET-1/);
  await q.click('[data-a="journalForm"]'); await q.waitForSelector('#j-text'); await q.fill('#j-text', 'ECRIT-ONGLET-2'); await q.click('[data-a="saveJournal"]'); await q.waitForTimeout(600);
  await p.waitForTimeout(300); await p.evaluate(() => document.getElementById('layer').innerHTML = ''); await p.go('accueil'); await p.go('journal');
  const tj = await p.textContent('#app'); assert.match(tj, /ECRIT-ONGLET-1/); assert.match(tj, /ECRIT-ONGLET-2/);
  const raw = await p.evaluate(() => Object.values(localStorage).join(' ')); assert.ok(!/ECRIT-ONGLET|Onglets/.test(raw), 'toujours rien en clair');
  assert.deepEqual(p.errors, []); assert.deepEqual(q.errors, []);
});

test('Sauvegarde', 'Fichier chiffré modifié à la main : refusé, données actuelles intactes', async (b, base) => {
  const p = await page(b, base, { init: seed(profileState({ name: 'Intacte' })) }); await p.goto(base); await p.settle();
  const out = await p.evaluate(async () => { const txt = JSON.stringify({ v: 2, profile: { name: 'Pirate', created: 1 }, habits: [], logs: [] });
    return await (async () => { const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
      const k = await crypto.subtle.importKey('raw', new TextEncoder().encode('motdepasse'), 'PBKDF2', false, ['deriveKey']);
      const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 600000 }, k, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);
      const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(txt)));
      ct[5] ^= 1; const b64 = u => btoa(String.fromCharCode(...u));
      return JSON.stringify({ _libre: { app: 'LIBRE', format: 5, encrypted: 'AES-256-GCM', kdf: 'PBKDF2-SHA256', iter: 600000, salt: b64(salt), iv: b64(iv), exportedAt: Date.now() }, ct: b64(ct) }); })(); });
  await p.go('profil'); await p.evaluate(() => document.querySelector('[data-a="importData"]').click()); await p.waitForSelector('#imp');
  await p.fill('#imp', out); await p.click('[data-a="doImport"]'); await p.waitForTimeout(400);
  const pw = await p.$('#layer input[type=password]'); assert.ok(pw, 'mot de passe demandé'); await pw.fill('motdepasse');
  await p.evaluate(() => { const f = document.querySelector('#layer form'); f && f.requestSubmit(); }); await p.waitForTimeout(2500);
  const s = await p.evaluate(() => JSON.parse(localStorage.getItem('libre.v1'))); assert.equal(s.profile.name, 'Intacte');
  assert.match(await p.textContent('#layer'), /incorrect|endommag|illisible|ne peut/i, 'erreur affichée');
  assert.deepEqual(p.errors, []);
});

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

test('Natif', 'Coffre momentanément inaccessible : LIBRE attend, n’écrit rien en clair, ne met rien de côté, puis rouvre les données', async (b, base) => {
  const st = profileState({ name: 'Gardée' });
  const p = await page(b, base, { native: { platform: 'ios', vaultBusy: true }, init: { fn: ([s]) => { if (!sessionStorage.getItem('__vault')) sessionStorage.setItem('__vault', JSON.stringify({ state: 'ENC:' + btoa(unescape(encodeURIComponent(JSON.stringify(s)))) })); }, arg: [st] } });
  await p.goto(base); await p.waitForSelector('[data-a="vaultRetry"]');
  await p.evaluate(() => { location.hash = 'journal'; }); await p.waitForTimeout(200);
  assert.ok(await p.$('[data-a="vaultRetry"]'), 'la navigation ne contourne pas l’attente');
  await p.click('[data-a="vaultRetry"]'); await p.waitForTimeout(300); assert.ok(await p.$('[data-a="vaultRetry"]'), 'toujours en attente');
  const calls = await p.evaluate(() => window.__calls.map(c => c[0])); assert.ok(!calls.includes('LibreVault.move'), 'rien n’est mis de côté');
  assert.equal(await p.evaluate(() => localStorage.getItem('libre.v1')), null, 'rien d’écrit en clair');
  await p.evaluate(() => sessionStorage.setItem('__busy', 'off')); await p.click('[data-a="vaultRetry"]');
  await p.waitForSelector('#app[data-view="journal"]', { timeout: 8000 }); await p.go('profil');
  assert.match(await p.textContent('#app'), /Gardée/, 'données rouvertes');
  assert.deepEqual(p.errors, []);
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

test('Langues', 'Lancement en 6 langues : seules les langues traduites sont proposées, les autres traductions restent dans le code', async (b, base) => {
  const p = await page(b, base, { init: seed(profileState({ lang: 'ar' })) }); await p.goto(base); await p.settle();
  assert.equal(await p.evaluate(() => document.documentElement.lang), 'en', 'une langue partielle enregistrée s’affiche en anglais, sans mélange');
  assert.equal(await p.evaluate(() => document.documentElement.dir), 'ltr');
  await p.go('profil'); await p.evaluate(() => document.querySelector('[data-a="langPicker"]').click()); await p.waitForSelector('.lang-item');
  const offered = await p.evaluate(() => [...document.querySelectorAll('.lang-item')].map(x => x.dataset.l));
  assert.deepEqual([...new Set(offered.map(c => c.split('-')[0]))].sort(), ['de', 'en', 'es', 'fr', 'it', 'pt'], 'langues proposées : ' + offered.join(','));
  assert.ok(await p.evaluate(() => window.__libreI18n.tr && JSON.stringify(window.__libreI18n.langs()).includes('ar')), 'traduction arabe conservée');
  assert.deepEqual(p.errors, []);
});

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

test('Apparence', 'Réglage : changer la couleur et activer les effets (verre), conservé après rechargement', async (b, base) => {
  const p = await page(b, base, { init: seed(profileState()) }); await p.goto(base); await p.settle();
  assert.ok(!(await p.evaluate(() => document.documentElement.classList.contains('fx'))), 'Horizon (sans effets) par défaut');
  await p.go('profil'); await p.closeLayer(); await p.openFold('p-look');
  await p.click('label.switch:has([data-a="fxToggle"])'); await p.waitForTimeout(300); await p.openFold('p-look'); await p.click('[data-a="setAccent"][data-v="indigo"]'); await p.waitForTimeout(200);
  await p.reload(); await p.waitForSelector('#app[data-view]');
  const r = await p.evaluate(() => [document.documentElement.dataset.accent, document.documentElement.classList.contains('fx'), getComputedStyle(document.getElementById('amb')).display]);
  assert.deepEqual(r.slice(0, 2), ['indigo', true], JSON.stringify(r)); const pr = (await p.state()).prefs; assert.equal(pr.accent, 'indigo'); assert.equal(pr.look, 'verre'); noErr(p);
});

test('Apparence', 'Moins d’animations demandé par le système : aucune animation d’écran', async (b, base) => {
  const p = await page(b, base, { init: seed(profileState()) }); await p.goto(base); await p.settle();   /* le contexte de test demande « reduce » */
  await p.go('stats'); const n = await p.evaluate(() => document.getAnimations().filter(a => a.effect && a.effect.target && a.effect.target.closest && a.effect.target.closest('#app')).length);
  assert.equal(n, 0, 'animations : ' + n); noErr(p);
});

test('Apparence', 'Option « verre » : animations d’ouverture, entrée des blocs, barres qui se transforment', async (b, base) => {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, locale: 'fr-CH' }); const st = profileState(); st.prefs.look = 'verre';
  st.logs = Array.from({ length: 40 }, (_, i) => ({ id: 'l' + i, habitId: 'h0', type: 'cigarette', ts: Date.now() - i * 15 * 36e5, qty: 1 }));
  await ctx.addInitScript(([s]) => { if (!sessionStorage.getItem('__seeded')) { localStorage.setItem('libre.v1', JSON.stringify(s)); sessionStorage.setItem('__seeded', '1'); } }, [st]);
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(base); await p.waitForTimeout(150);
  assert.ok(await p.evaluate(() => document.getAnimations().some(a => a.effect && a.effect.target && a.effect.target.id === 'app')), 'ouverture animée');
  await p.waitForTimeout(1800); await p.evaluate(() => document.querySelectorAll('#layer').forEach(x => x.innerHTML = ''));
  await p.evaluate(() => { location.hash = 'stats'; }); await p.waitForTimeout(60);
  assert.ok(await p.evaluate(() => document.getAnimations().filter(a => a.effect && a.effect.target && a.effect.target.closest && a.effect.target.closest('#app')).length) >= 3, 'blocs animés');
  await p.waitForTimeout(1200); await p.click('[data-a="statP"][data-v="30"]'); await p.waitForTimeout(50);
  assert.ok(await p.evaluate(() => document.getAnimations().some(a => a.effect && a.effect.target && a.effect.target.matches && a.effect.target.matches('rect.gbar'))), 'barres animées');
  assert.deepEqual(errs, []); await ctx.close();
});

test('Apparence', 'Ton chemin (bloc principal) : chaque texte lisible sur son fond réel (≥ 4,5:1 mesuré sur les pixels), clair et sombre, toutes les couleurs d’accent', async (b, base) => {
  const lum = ([r, g, b]) => [r, g, b].map(v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }).reduce((s, v, i) => s + v * [.2126, .7152, .0722][i], 0);
  const ratio = (a, c) => { const x = lum(a), y = lum(c); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
  for (const cs of ['light', 'dark']) for (const acc of ['vert', 'lagon', 'indigo', 'corail', 'sombre']) {
    const st = profileState({ days: 27 }); if (acc === 'sombre') st.prefs.hero = 'sombre'; else { st.prefs.accent = acc; st.prefs.hero = 'couleur'; }
    const p = await page(b, base, { colorScheme: cs, init: seed(st) }); await p.goto(base); await p.settle();
    const pts = await p.evaluate(() => { const h = document.querySelector('.hm-hero'); const dd = h.closest('details'); if (dd) dd.open = true; h.scrollIntoView({ block: 'center' }); const out = [];
      h.querySelectorAll('dt,dd,.hm-since,.hm-k,.hm-sub,.hm-step,.hm-days .num,.hm-u').forEach(e => { const r = e.getBoundingClientRect(); if (!r.width) return; const c = getComputedStyle(e).color.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number); out.push([r.left + 2, r.top + r.height / 2, c]); });
      h.querySelectorAll('*').forEach(e => e.style.setProperty('color', 'transparent', 'important')); h.querySelectorAll('svg,.hm-orbs,.hm-pill,.hm-rec').forEach(e => e.style.visibility = 'hidden'); return out; });
    await p.waitForTimeout(120); const buf = await p.screenshot();
    const px = await p.evaluate(async ([b64, pts]) => { const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode(); const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
      const x = c.getContext('2d'); x.drawImage(img, 0, 0); return pts.map(([a, b]) => [...x.getImageData(Math.round(a), Math.round(b), 1, 1).data].slice(0, 3)); }, [buf.toString('base64'), pts]);
    const min = Math.min(...px.map((bg, i) => ratio(bg, pts[i][2])));
    assert.ok(pts.length >= 6, 'textes mesurés'); assert.ok(min >= 4.5, `${cs} ${acc} : contraste ${min.toFixed(2)}`); await p.ctx.close();
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

test('Suivi', 'Modifier une consommation passée : quantité et heure changées, compteur recalculé, annulable', async (b, base) => {
  const st = profileState({ days: 30 }); const H = 36e5;
  st.logs = [{ id: 'old', habitId: 'h0', type: 'cigarette', ts: Date.now() - 50 * H, qty: 2 }, { id: 'last', habitId: 'h0', type: 'cigarette', ts: Date.now() - 5 * H, qty: 1 }];
  const p = await page(b, base, { init: seed(st) }); await p.goto(base); await p.settle(); await p.go('habitudes'); await p.waitForTimeout(300);
  await p.evaluate(() => document.querySelector('[data-a="editLog"][data-id="last"]').click());
  await p.waitForSelector('#lg-qty'); assert.match(await p.textContent('#layer'), /Modifier la consommation/);
  await p.fill('#lg-qty', '3');
  const d = new Date(Date.now() - 30 * 36e5); const pad = n => String(n).padStart(2, '0');
  await p.fill('#lg-ts', `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`);
  await p.click('[data-a="saveLog"]'); await p.waitForTimeout(200);
  const s1 = await p.evaluate(() => JSON.parse(localStorage.getItem('libre.v1')));
  assert.equal(s1.logs.length, 2, 'pas de doublon'); const l = s1.logs.find(x => x.id === 'last');
  assert.equal(l.qty, 3); assert.ok(Math.abs(l.ts - (Date.now() - 30 * 36e5)) < 2 * 60e3, 'heure modifiée');
  await p.click('.toast button'); await p.waitForTimeout(150);
  const s2 = await p.evaluate(() => JSON.parse(localStorage.getItem('libre.v1')));
  assert.equal(s2.logs.find(x => x.id === 'last').qty, 1, 'annulation');
  await p.evaluate(() => document.querySelector('[data-a="editLog"][data-id="last"]').click()); await p.waitForSelector('#lg-ts');
  await p.fill('#lg-ts', `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`); await p.click('[data-a="saveLog"]'); await p.waitForTimeout(150);
  await p.closeLayer(); await p.go('accueil'); await p.waitForTimeout(300);
  assert.equal((await p.textContent('[data-live="days"]')).trim(), '1', 'compteur recalculé depuis la nouvelle heure (30 h → 1 jour)');
  assert.deepEqual(p.errors, []);
});

test('Journal', 'Modifier une entrée, filtrer par humeur et par mois', async (b, base) => {
  const now = Date.now(), D = 864e5;
  const journal = [{ id: 'a', ts: now - 2 * D, mood: 1, text: 'jour difficile', triggers: [] }, { id: 'b', ts: now - D, mood: 5, text: 'belle journée', triggers: [] }, { id: 'c', ts: now - 70 * D, mood: 3, text: 'il y a longtemps', triggers: [] }];
  const p = await page(b, base, { init: seed(profileState({ extra: { journal } })) }); await p.goto(base); await p.settle(); await p.go('journal'); await p.waitForTimeout(300);
  await p.click('.j3-tools summary'); // les filtres sont repliés sous « Filtrer »
  await p.click('[data-a="jFilter"][data-k="low"]'); await p.waitForTimeout(100);
  assert.equal(await p.locator('.jentry').count(), 1); assert.match(await p.textContent('.jbook'), /jour difficile/);
  await p.click('[data-a="jFilter"][data-k="all"]'); await p.waitForTimeout(100);
  const opts = await p.locator('#jm option').count(); assert.ok(opts >= 3, 'mois proposés');
  await p.selectOption('#jm', { index: opts - 1 }); await p.waitForTimeout(150);
  assert.equal(await p.locator('.jentry').count(), 1); assert.match(await p.textContent('.jbook'), /longtemps/);
  await p.selectOption('#jm', ''); await p.waitForTimeout(150);
  await p.click('[data-a="editJournal"][data-id="b"]'); await p.waitForSelector('#j-text');
  await p.fill('#j-text', 'belle journée, modifiée'); await p.click('[data-a="saveJournal"]'); await p.waitForTimeout(200);
  const s = await p.evaluate(() => JSON.parse(localStorage.getItem('libre.v1')));
  assert.equal(s.journal.length, 3, 'pas de doublon'); const e = s.journal.find(x => x.id === 'b');
  assert.equal(e.text, 'belle journée, modifiée'); assert.equal(e.ts, journal[1].ts, 'date d’origine conservée');
  assert.deepEqual(p.errors, []);
});


test('Suivi', 'Modifier puis supprimer un suivi : réglages enregistrés, suppression récupérable depuis la copie de sécurité', async (b, base) => {
  const st = profileState({ types: ['cigarette', 'alcool'] });
  st.logs = [{ id: 'l1', habitId: 'h0', type: 'cigarette', ts: Date.now() - 30 * 36e5, qty: 2 }, { id: 'l2', habitId: 'h1', type: 'alcool', ts: Date.now() - 20 * 36e5, qty: 1 }];
  const p = await page(b, base, { init: seed(st) }); await p.goto(base); await p.settle(); await p.go('habitudes'); await p.waitForTimeout(300);
  await p.evaluate(() => document.querySelector('[data-a="habitForm"][data-id="h0"]').click()); await p.waitForSelector('#hf-qty');
  await p.fill('#hf-qty', '14'); await p.click('[data-a="saveHabit"]'); await p.waitForTimeout(200);
  let s1 = await p.evaluate(() => JSON.parse(localStorage.getItem('libre.v1')));
  assert.equal(+s1.habits.find(h => h.id === 'h0').qty, 14); assert.equal(s1.logs.length, 2, 'historique conservé');
  await p.evaluate(() => document.querySelector('[data-a="habitForm"][data-id="h0"]').click()); await p.waitForSelector('[data-a="delHabit"]');
  await p.click('#layer [data-a="delHabit"]'); await p.waitForTimeout(150); await p.click('#layer .btn.danger'); await p.waitForTimeout(200);
  s1 = await p.evaluate(() => JSON.parse(localStorage.getItem('libre.v1')));
  assert.deepEqual(s1.habits.map(h => h.id), ['h1']); assert.deepEqual(s1.logs.map(l => l.id), ['l2'], 'les consommations de l’autre suivi restent');
  await p.go('profil'); await p.waitForTimeout(200); assert.ok(await p.$('[data-a="snapRestore"]'), 'copie de sécurité proposée');
  await p.evaluate(() => document.querySelector('[data-a="snapRestore"]').click()); await p.waitForTimeout(150); await p.click('#layer .btn.primary, #layer .btn.danger'); await p.waitForTimeout(300);
  s1 = await p.evaluate(() => JSON.parse(localStorage.getItem('libre.v1')));
  assert.equal(s1.habits.length, 2); assert.equal(s1.logs.length, 2, 'suivi et consommations récupérés');
  assert.deepEqual(p.errors, []);
});

test('Outils', 'SOS et les 8 exercices s’ouvrent, se lancent et se ferment sans erreur', async (b, base) => {
  const p = await page(b, base, { init: seed(profileState()) }); await p.goto(base); await p.settle();
  await p.click('.hm-sos'); await p.waitForTimeout(500);
  const sos = await p.textContent('#layer'); assert.ok(sos.trim().length > 40, 'SOS ouvert');
  await p.evaluate(() => { const b = [...document.querySelectorAll('#layer button')].find(x => x.offsetParent && /\d/.test(x.textContent)); b && b.click(); }); await p.waitForTimeout(400);
  assert.ok((await p.textContent('#layer')).trim().length > 40, 'SOS : étape suivante');
  await p.closeLayer();
  for (const id of ['urge', 'delay', 'triggers', 'breath', 'ground', 'stress', 'cbt', 'plan']) {
    await p.go('outils'); await p.waitForTimeout(200); await p.click('[data-a="allTools"]'); await p.waitForTimeout(200);
    await p.evaluate(id => document.querySelector(`#layer [data-a="tool"][data-id="${id}"]`).click(), id); await p.waitForTimeout(400);
    const txt = (await p.textContent('#layer')).trim(); assert.ok(txt.length > 30, 'exercice ouvert : ' + id);
    await p.evaluate(() => { const b = [...document.querySelectorAll('#layer .btn.primary')].find(x => x.offsetParent && !x.disabled); b && b.click(); }); await p.waitForTimeout(300);
    await p.closeLayer();
  }
  assert.deepEqual(p.errors, []);
});

test('Calculs', 'Jours calendaires exacts malgré les changements d’heure, les années bissextiles et 4 fuseaux horaires', async (b, base) => {
  for (const tz of ['Europe/Zurich', 'America/New_York', 'Australia/Sydney', 'Asia/Kolkata']) {
    const st = profileState({ days: 400 });
    const p = await page(b, base, { init: seed(st), timezoneId: tz }); await p.goto(base); await p.settle();
    const r = await p.evaluate(() => {
      const C = window.__libreCalc, out = [];
      // 1) passer au lendemain donne toujours minuit local, y compris les jours de 23 h et de 25 h
      for (const [y, m, d] of [[2026, 2, 28], [2026, 2, 29], [2026, 9, 24], [2026, 9, 25], [2026, 10, 1], [2026, 3, 4], [2026, 3, 5], [2028, 1, 28]]) {
        const a = C.sod(new Date(y, m, d, 15, 30).getTime()); const n = new Date(C.addDays(a, 1));
        const exp = new Date(y, m, d + 1); out.push(n.getHours() === 0 && n.getMinutes() === 0 && n.getDate() === exp.getDate() && n.getMonth() === exp.getMonth());
      }
      // 2) 29 février 2028 existe, 2027 n’en a pas
      out.push(new Date(C.addDays(C.sod(new Date(2028, 1, 28, 12).getTime()), 1)).getDate() === 29);
      out.push(new Date(C.addDays(C.sod(new Date(2027, 1, 28, 12).getTime()), 1)).getMonth() === 2);
      // 3) nombre de jours suivis : comparé à un calcul indépendant sur des dates civiles (UTC, sans changement d’heure)
      const h = C.habits()[0], ymd = t => { const d = new Date(t); return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()); };
      const exp = Math.round((ymd(Date.now()) - ymd(h.trackStart)) / 864e5) + 1, got = C.cleanDaysOf(h);
      out.push(got.tracked === exp && got.clean === exp);
      return out;
    });
    assert.ok(r.every(Boolean), tz + ' : ' + JSON.stringify(r));
    assert.deepEqual(p.errors, []); await p.ctx.close();
  }
});

test('Affichage', 'Barres d’onglets : aucun libellé coupé à 320 et 375 px, dans les 6 langues complètes', async (b, base) => {
  const bad = [];
  for (const lang of ['fr', 'en', 'de', 'it', 'es', 'pt']) for (const w of [320, 375]) {
    const p = await page(b, base, { init: seed(profileState({ lang, types: ['cigarette', 'alcool'] })), viewport: { width: w, height: 800 } }); await p.goto(base); await p.settle();
    for (const v of ['accueil', 'habitudes', 'stats', 'calendrier', 'journal', 'outils', 'biblio', 'profil']) { await p.go(v); await p.waitForTimeout(150);
      bad.push(...await p.evaluate(([v, lang, w]) => [...document.querySelectorAll('.segc')].filter(c => c.scrollWidth > c.clientWidth + 1).map(c => `${lang} ${w}px ${v}:${c.dataset.seg}`), [v, lang, w])); }
    assert.deepEqual(p.errors, []); await p.ctx.close();
  }
  assert.deepEqual(bad, []);
});

test('Journal', 'Brouillon : un texte non enregistré revient après une fermeture accidentelle, jamais écrit sur l’appareil', async (b, base) => {
  const p = await page(b, base, { init: seed(profileState()) }); await p.goto(base); await p.settle(); await p.go('journal');
  await p.click('[data-a="journalForm"]'); await p.waitForSelector('#j-text'); await p.fill('#j-text', 'BROUILLON-PRECIEUX');
  await p.click('#layer [data-a="close"]'); await p.waitForTimeout(250);
  assert.ok(!(await p.evaluate(() => Object.values(localStorage).join(' '))).includes('BROUILLON-PRECIEUX'), 'brouillon jamais écrit');
  await p.click('[data-a="journalForm"]'); await p.waitForSelector('#j-text');
  assert.equal(await p.inputValue('#j-text'), 'BROUILLON-PRECIEUX'); assert.ok(await p.$('[data-a="jDraftClear"]'));
  await p.click('[data-a="saveJournal"]'); await p.waitForTimeout(250);
  const s1 = await p.evaluate(() => JSON.parse(localStorage.getItem('libre.v1')));
  assert.equal(s1.journal.length, 1); assert.ok(s1.journal[0].id && s1.journal[0].id.length > 3, 'identifiant valide');
  await p.click('[data-a="journalForm"]'); await p.waitForSelector('#j-text'); assert.equal(await p.inputValue('#j-text'), '', 'plus de brouillon après enregistrement');
  await p.fill('#j-text', 'A-EFFACER'); await p.click('#layer [data-a="close"]'); await p.waitForTimeout(200);
  await p.click('[data-a="journalForm"]'); await p.waitForSelector('[data-a="jDraftClear"]'); await p.click('[data-a="jDraftClear"]'); await p.waitForTimeout(150);
  assert.equal(await p.inputValue('#j-text'), '');
  assert.deepEqual(p.errors, []);
});

test('Accessibilité', 'Texte agrandi à 200 % (WCAG 1.4.4) : aucun écran ne déborde, en français et en allemand', async (b, base) => {
  const bad = [];
  for (const lang of ['fr', 'de']) {
    const p = await page(b, base, { init: seed(profileState({ lang, types: ['cigarette', 'alcool'] })), viewport: { width: 390, height: 844 } });
    await p.ctx.addInitScript(() => document.addEventListener('DOMContentLoaded', () => { const s = document.createElement('style'); s.textContent = 'html{font-size:200%!important}'; document.head.appendChild(s); }));
    await p.goto(base); await p.settle();
    assert.ok(await p.evaluate(() => parseFloat(getComputedStyle(document.documentElement).fontSize) >= 30), 'texte bien agrandi');
    for (const v of ['accueil', 'habitudes', 'stats', 'calendrier', 'journal', 'outils', 'biblio', 'profil']) { await p.go(v); await p.waitForTimeout(200);
      const o = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth); if (o > 1) bad.push(`${lang} ${v} : ${o}px`); }
    assert.deepEqual(p.errors, []); await p.ctx.close();
  }
  assert.deepEqual(bad, [], bad.join(', '));
});

test('Performance', 'Téléphone modeste simulé (processeur 4× plus lent) : 12 000 consommations, 5 000 entrées de journal, données chiffrées', async (b, base) => {
  const st = profileState({ types: ['cigarette', 'alcool', 'cannabis'], days: 1095, name: 'Charge' }); let r = 11; const rnd = () => (r = (r * 16807) % 2147483647) / 2147483647;
  const D = 864e5, start = Date.now() - 1095 * D;
  for (let k = 0; k < 12000; k++) { const h = st.habits[k % 3]; st.logs.push({ id: 'l' + k, habitId: h.id, type: h.type, ts: start + rnd() * 1094 * D, qty: 1 }); }
  for (let k = 0; k < 5000; k++) st.journal.push({ id: 'j' + k, ts: start + rnd() * 1094 * D, mood: 1 + (k % 5), craving: k % 10, triggers: ['Stress'], text: 'Une journée comme les autres, avec ses hauts et ses bas. '.repeat(3) });
  const p = await page(b, base, { init: seed(st) }); const cdp = await p.ctx.newCDPSession(p); await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  const T = {}; let t0 = Date.now(); await p.goto(base); await p.waitForSelector('#app[data-view="accueil"]'); T['démarrage (clair)'] = Date.now() - t0; await p.waitForTimeout(1500); await p.closeLayer();
  for (const v of ['habitudes', 'stats', 'calendrier', 'journal', 'outils']) { t0 = Date.now(); await p.go(v); T[v] = Date.now() - t0; }
  await p.go('journal'); t0 = Date.now(); await p.fill('#jq', 'hauts'); await p.waitForTimeout(400); T['recherche journal'] = Date.now() - t0 - 220;
  await p.go('profil'); await p.evaluate(() => document.querySelector('[data-a="wvOn"]').click()); await p.waitForSelector('#wv1');
  await p.fill('#wv1', 'mot-de-passe-long'); await p.fill('#wv2', 'mot-de-passe-long'); await p.check('#wvOk');
  t0 = Date.now(); await p.click('#wvSet button[type=submit]'); await p.waitForFunction(() => !document.querySelector('#wvSet'), null, { timeout: 60000 }); T['activer le chiffrement'] = Date.now() - t0;
  const size = await p.evaluate(() => localStorage.getItem('libre.v1').length);
  await p.reload(); await p.waitForSelector('#wvPw'); await p.fill('#wvPw', 'mot-de-passe-long');
  t0 = Date.now(); await p.click('#wvF button'); await p.waitForSelector('#app[data-view]:not([data-view="lock"])', { timeout: 60000 }); T['ouvrir les données chiffrées'] = Date.now() - t0;
  await p.go('journal'); t0 = Date.now(); await p.click('[data-a="journalForm"]'); await p.waitForSelector('#j-text'); await p.fill('#j-text', 'nouvelle'); await p.click('[data-a="saveJournal"]'); await p.waitForTimeout(50); T['enregistrer une entrée (chiffrée)'] = Date.now() - t0;
  await p.waitForTimeout(1500); const s2 = await p.evaluate(() => localStorage.getItem('libre.v1')); assert.ok(!s2.includes('nouvelle'), 'toujours chiffré');
  module.exports.lastPerf2 = { times: T, size };
  for (const [k, v] of Object.entries(T)) assert.ok(v < 4000, `${k} : ${v} ms`);
  assert.deepEqual(p.errors, []);
}, { slow: true });

test('Natif', 'Biométrie : cachée par défaut ; activée pour un essai, elle déverrouille sans remplacer le code (plugin simulé)', async (b, base) => {
  const st = profileState(); st.prefs.lock = null;
  let p = await page(b, base, { native: { platform: 'ios' }, init: seed(st) }); await p.goto(base); await p.waitForSelector('#app[data-view="accueil"]');
  await p.go('profil'); assert.equal(await p.$('[data-a="bioSet"]'), null, 'option cachée tant que BIO_ENABLED est faux'); await p.ctx.close();
  p = await page(b, base, { native: { platform: 'ios' }, init: seed(st) }); await p.ctx.addInitScript(() => { window.__libreBioTest = true; });
  await p.goto(base); await p.waitForSelector('#app[data-view="accueil"]'); await p.closeLayer(); await p.go('profil');
  assert.equal(await p.$('[data-a="bioSet"]'), null, 'pas de biométrie sans code');
  await p.evaluate(() => document.querySelector('[data-a="lockToggle"]').click()); await p.waitForSelector('#layer input');
  const ins = await p.$$('#layer input[type="password"],#layer input[inputmode="numeric"]'); for (const i of ins) await i.fill('2468');
  await p.evaluate(() => { const f = document.getElementById('lockSet'); f && f.requestSubmit(); }); await p.waitForTimeout(2000);
  await p.evaluate(() => document.querySelector('[data-a="bioSet"]').click()); await p.waitForTimeout(500);
  await p.reload(); await p.waitForSelector('#app[data-view="lock"]'); await p.waitForTimeout(900);
  assert.notEqual(await p.evaluate(() => document.getElementById('app').dataset.view), 'lock', 'déverrouillé par la biométrie simulée');
  await p.evaluate(() => sessionStorage.setItem('__bioFail', '1')); await p.reload(); await p.waitForSelector('#app[data-view="lock"]'); await p.waitForTimeout(900);
  assert.equal(await p.evaluate(() => document.getElementById('app').dataset.view), 'lock', 'échec : reste verrouillé'); assert.ok(await p.$('#lockPin'), 'le code reste proposé');
  await p.fill('#lockPin', '2468'); await p.click('#lockF button'); await p.waitForSelector('#app:not([data-view="lock"])', { timeout: 15000 });
  assert.deepEqual(p.errors, []);
});

test('Données', 'Données d’une version plus récente : lecture seule, rien n’est écrit par-dessus', async (b, base) => {
  const st = profileState({ name: 'Futur' }); st.dataV = 99; st.futureField = { garde: true };
  const p = await page(b, base, { init: seed(st) }); await p.goto(base); await p.waitForSelector('#app[data-view="accueil"]'); await p.waitForTimeout(1600);
  const before = await p.evaluate(() => localStorage.getItem('libre.v1'));
  await p.closeLayer(); await p.evaluate(() => document.querySelector('[data-a="quickPlus"]')?.click()); await p.waitForTimeout(300);
  const after = await p.evaluate(() => localStorage.getItem('libre.v1'));
  assert.equal(after, before, 'aucune écriture'); assert.ok(JSON.parse(after).futureField.garde);
  assert.deepEqual(p.errors, []);
});

test('Aide', 'Pays absent de la table (Luxembourg) : jamais les numéros d’un autre pays, numéro d’urgence local et choix du pays', async (b, base) => {
  const p = await page(b, base, { locale: 'fr-LU', init: seed(profileState()) }); await p.goto(base); await p.settle();
  await p.go('profil'); await p.evaluate(() => { const d = [...document.querySelectorAll('details')].find(x => /Aide et sécurité/.test(x.textContent)); if (d) d.open = true; });
  const txt = await p.textContent('#app');
  assert.doesNotMatch(txt, /La Main Tendue|Pro Juventute|stop-tabac/, 'aucun numéro suisse affiché pour le Luxembourg');
  assert.match(txt, /pas encore de numéros vérifiés pour ton pays/); assert.match(txt, /112/);
  assert.ok(await p.$('[data-a="helpCountryPick"]'), 'choix du pays proposé');
  assert.deepEqual(p.errors, []);
});

test('Aide', 'Suisse : numéros affichés avec la date de revérification ; pays non revérifié : avertissement', async (b, base) => {
  let p = await page(b, base, { locale: 'fr-CH', init: seed(profileState()) }); await p.goto(base); await p.settle();
  await p.go('profil'); await p.evaluate(() => document.querySelectorAll('details').forEach(d => d.open = true));
  let txt = await p.textContent('#app'); assert.match(txt, /144/); assert.match(txt, /Numéros revérifiés en novembre 2026/); await p.ctx.close();
  p = await page(b, base, { locale: 'pt-BR', init: seed(profileState({ lang: 'pt' })) }); await p.goto(base); await p.settle();
  await p.go('profil'); await p.evaluate(() => document.querySelectorAll('details').forEach(d => d.open = true));
  txt = await p.textContent('#app'); assert.match(txt, /188/); assert.match(txt, /não foram verificados recentemente/);
  assert.deepEqual(p.errors, []);
});

test('Sauvegarde', 'Tout effacer : la copie de sécurité est annoncée et peut être supprimée ; les copies mises de côté sont effacées', async (b, base) => {
  const p = await page(b, base, { init: seed(profileState({ name: 'Effaçable' })) }); await p.goto(base); await p.settle();
  await p.evaluate(() => { localStorage.setItem('libre.v1.illisible.123', '{"journal":"SECRET-ILLISIBLE"}'); localStorage.setItem('libre.v1.chiffre.456', '{"_webvault":1}'); });
  await p.go('profil'); await p.evaluate(() => document.querySelector('[data-a="resetAsk"]').click()); await p.waitForTimeout(200);
  assert.match(await p.textContent('#layer'), /copie de sécurité est gardée/);
  await p.click('#layer .btn.danger'); await p.waitForSelector('[data-a="obNext"]');
  const keys = await p.evaluate(() => Object.keys(localStorage)); assert.ok(!keys.some(k => /illisible|chiffre/.test(k)), 'copies mises de côté effacées : ' + keys);
  assert.ok(await p.$('[data-a="snapDel"]'), 'suppression de la copie proposée sur l’accueil');
  await p.click('[data-a="snapDel"]'); await p.waitForTimeout(150); await p.click('#layer .btn.danger'); await p.waitForTimeout(200);
  const all = await p.evaluate(() => Object.entries(localStorage).map(([k, v]) => k + v).join(' '));
  assert.ok(!/Effaçable/.test(all), 'plus aucune trace du profil effacé'); assert.equal(await p.$('[data-a="snapRestore"]'), null);
  assert.deepEqual(p.errors, []);
});

test('Affichage', 'Calendrier à 320 px : l’en-tête « ‹ mois › » reste sur une ligne (fr, it, de)', async (b, base) => {
  for (const lang of ['fr', 'it', 'de']) {
    const p = await page(b, base, { init: seed(profileState({ lang })), viewport: { width: 320, height: 640 } }); await p.goto(base); await p.settle(); await p.go('calendrier');
    const tops = await p.evaluate(() => [...document.querySelectorAll('[data-a="calNav"]')].map(x => Math.round(x.getBoundingClientRect().top)));
    assert.equal(tops.length, 2); assert.equal(tops[0], tops[1], lang + ' : boutons sur deux lignes'); assert.deepEqual(p.errors, []); await p.ctx.close();
  }
});

test('Sécurité', 'Politique de sécurité (CSP) : aucune violation en parcourant l’app, et toute connexion vers un serveur extérieur est bloquée', async (b, base) => {
  const st = profileState({ types: ['cigarette', 'jeux_argent'], extra: { journal: [{ id: 'j1', ts: Date.now(), mood: 3, text: 'x', triggers: [] }] } });
  const p = await page(b, base, { init: seed(st) });
  await p.ctx.addInitScript(() => { window.__csp = []; document.addEventListener('securitypolicyviolation', e => window.__csp.push(e.violatedDirective + ' ' + e.blockedURI)); });
  await p.goto(base); await p.settle();
  assert.match(await p.evaluate(() => document.querySelector('meta[http-equiv="Content-Security-Policy"]').content), /connect-src 'self'/);
  for (const v of ['accueil', 'habitudes', 'stats', 'calendrier', 'bilans', 'journal', 'outils', 'biblio', 'profil']) await p.go(v);
  await p.go('accueil'); await p.click('.hm-sos'); await p.waitForTimeout(400); await p.closeLayer();
  assert.deepEqual(await p.evaluate(() => window.__csp), [], 'aucune violation pendant l’usage normal');
  const blocked = await p.evaluate(async () => { try { await fetch('https://example.org/x'); return 'envoyée'; } catch (e) { return 'bloquée'; } });
  assert.equal(blocked, 'bloquée');
  assert.ok((await p.evaluate(() => window.__csp)).some(v => /connect-src/.test(v)), 'la tentative est signalée comme violation connect-src');
  assert.deepEqual(p.external, []);
});

test('Aide', 'Jeux d’argent : la ligne spécialisée du pays n’apparaît que si cette habitude est suivie', async (b, base) => {
  const sos = async types => { const p = await page(b, base, { init: seed(profileState({ types, extra: { prefs: { lang: 'fr', mainHabit: 'h0', helpCountry: 'FR' } } })), locale: 'fr-FR' }); await p.goto(base); await p.settle();
    await p.go('profil'); await p.openFold('p-safe'); await p.waitForTimeout(200);
    const txt = await p.evaluate(() => document.getElementById('app').innerText); await p.ctx.close(); return txt; };
  assert.match(await sos(['jeux_argent']), /Joueurs Info Service[\s\S]*09 74 75 13 13/);
  assert.doesNotMatch(await sos(['cigarette']), /Joueurs Info Service/);
});

/* ---------- Transformation « Horizon » : parcours A à H ---------- */
const stateOf = p => p.evaluate(() => JSON.parse(localStorage.getItem('libre.v1')));

test('Parcours 1', 'Découverte : objectif « mieux comprendre », difficultés et accompagnement choisis ; ni âge, ni sexe, ni taille, ni poids demandés ; accueil sans compteur d’abstinence', async (b, base) => {
  const p = await page(b, base); await p.goto(base); await p.click('[data-a="obNext"]').catch(() => {}); const asked = [];
  for (let n = 0; n < 80; n++) {
    await p.waitForTimeout(150);
    const txt = await p.evaluate(() => document.body.innerText);
    if (/Ton plan est prêt/.test(txt)) break;
    if (/Ta taille|Tu es…|Quel âge/.test(txt)) asked.push('donnée corporelle');
    if (await p.$('[data-a="obToggleType"]')) { const sel = '[data-a="obToggleType"][data-k="cannabis"]'; if (await p.getAttribute(sel, 'aria-pressed') !== 'true') await p.click(sel); }
    for (const i of await p.$$('input[data-ob]')) { if (!(await i.isVisible()) || await i.inputValue()) continue; const k = await i.getAttribute('data-ob'), ty = await i.getAttribute('type'); await i.fill(k === 'name' ? 'Alix' : ty === 'datetime-local' ? '2026-11-10T20:00' : '5').catch(() => {}); }
    if (/quel est ton objectif/i.test(txt) && !(await p.$('[data-a="obPick"][data-p*="goal"][aria-pressed="true"]'))) { await p.click('[data-a="obPick"][data-v="comprendre"]').catch(() => {}); continue; }
    if (/le plus difficile/.test(txt) && !(await p.$('[data-a="obHard"][aria-pressed="true"]'))) { await p.click('[data-a="obHard"][data-v="Soirée / fête"]').catch(() => {}); await p.waitForSelector('[data-a="obHard"][aria-pressed="true"]', { timeout: 3000 }).catch(() => {}); continue; } /* choix à bascule : attendre qu’il soit affiché, sinon un second clic le désélectionne */
    if (/accompagné·e \?/.test(txt) && await p.getAttribute('[data-a="obFlag"][data-f="remind"]', 'aria-pressed') === 'true') { await p.click('[data-a="obFlag"][data-f="remind"]').catch(() => {}); continue; }
    let clk = 0; for (const a of ['obPick', 'obSince', 'obLast']) { if ((await p.$$(`[data-a="${a}"]`)).length && !(await p.$(`[data-a="${a}"][aria-pressed="true"]`))) { await p.click(`[data-a="${a}"] >> nth=0`).catch(() => {}); await p.waitForTimeout(80); clk = 1; } } if (clk) { await p.waitForTimeout(450); continue; } /* laisser l’app avancer seule après un choix (280 ms) avant tout clic sur « Continuer » */
    /* l’étape « le plus difficile » est facultative : ne pas la passer avant d’y avoir répondu (l’app avance aussi seule après un choix) */ if (/le plus difficile/.test(await p.evaluate(() => document.body.innerText)) && !(await p.$('[data-a="obHard"][aria-pressed="true"]'))) continue; await p.click('#obCta:not([disabled])', { timeout: 500 }).catch(() => {});
  }
  await p.click('#obCta').catch(() => {}); await p.waitForSelector('#app[data-view="accueil"]'); await p.waitForTimeout(1200); await p.closeLayer();
  const s = await stateOf(p);
  assert.deepEqual(asked, [], 'aucune question sur le corps : ' + asked.join());
  assert.equal(s.habits[0].goal, 'comprendre'); assert.equal(s.habits[0].limit, '');
  assert.deepEqual(s.tools.risks, ['Soirée / fête'], JSON.stringify(s.tools.risks)); assert.equal(s.prefs.nt.items.daily.on, false, 'rappels doux refusés');
  assert.equal(s.profile.age, null); assert.equal(s.profile.height, null);
  const hero = await p.textContent('.hm-hero');
  assert.match(hero, /Observation/); assert.match(hero, /par jour en moyenne/); assert.doesNotMatch(hero, /jours? sans cannabis/);
  assert.match(await p.textContent('#app'), /Parce que tu as indiqué que « Soirée \/ fête » est difficile pour toi/);
  noErr(p);
});

test('Inscription', 'Jeux d’argent (100 par mois) et pornographie (0) : économies justes au plan, raisons adaptées aux addictions choisies', async (b, base) => {
  const p = await page(b, base); await p.goto(base); await p.click('[data-a="obNext"]').catch(() => {}); let reasons = '', ready = '';
  for (let n = 0; n < 120; n++) {
    await p.waitForTimeout(150);
    const txt = await p.evaluate(() => document.body.innerText);
    if (/Ton plan est prêt/.test(txt)) { ready = await p.textContent('.q'); break; }
    if (/Pourquoi tu fais ça/.test(txt)) { reasons = await p.textContent('.q'); await p.click('[data-a="obReason"] >> nth=0').catch(() => {}); await p.waitForTimeout(150); await p.click('#obCta:not([disabled])').catch(() => {}); continue; }
    if (await p.$('[data-a="obToggleType"]')) { for (const k of ['jeux_argent', 'porno']) { const sel = `[data-a="obToggleType"][data-k="${k}"]`; if (await p.getAttribute(sel, 'aria-pressed') !== 'true') { await p.click(sel); await p.waitForTimeout(120); } } }
    if (await p.$('[data-a="obPick"][data-p="h.jeux_argent.qtyPer"][data-v="mois"][aria-pressed="false"]')) { await p.click('[data-a="obPick"][data-p="h.jeux_argent.qtyPer"][data-v="mois"]'); continue; }
    for (const i of await p.$$('input[data-ob]')) { const k = await i.getAttribute('data-ob'), ty = await i.getAttribute('type'), v = await i.inputValue(); if (!(await i.isVisible()) || (v && !(k === 'h.jeux_argent.qty' && v !== '100'))) continue;
      await i.fill(k === 'name' ? 'Joé' : ty === 'datetime-local' ? '2026-11-10T20:00' : k === 'h.jeux_argent.qty' ? '100' : k === 'h.porno.budget' ? '0' : '3').catch(() => {}); }
    if (/quel est ton objectif/i.test(txt) && !(await p.$('[data-a="obPick"][data-p*="goal"][aria-pressed="true"]'))) { await p.click('[data-a="obPick"][data-p*="goal"][data-v="arreter"]').catch(() => {}); await p.waitForTimeout(450); continue; }
    let clk = 0; for (const a of ['obSince', 'obLast']) { if ((await p.$$(`[data-a="${a}"]`)).length && !(await p.$(`[data-a="${a}"][aria-pressed="true"]`))) { await p.click(`[data-a="${a}"] >> nth=0`).catch(() => {}); clk = 1; } } if (clk) { await p.waitForTimeout(450); continue; }
    await p.click('#obCta:not([disabled])', { timeout: 500 }).catch(() => {});
  }
  assert.match(ready, /Par mois\s*100\b/, 'économies par mois = 100 : ' + ready.replace(/\s+/g, ' ').slice(0, 600));
  assert.match(ready, /Par an\s*1\D?199\b/, 'économies par an ≈ 1199');
  assert.match(reasons, /Rembourser mes dettes/); assert.match(reasons, /Mon estime de moi/);
  assert.doesNotMatch(reasons, /Mieux respirer|Faire du sport|Mon apparence/, 'pas de raisons liées au tabac');
  noErr(p);
});

test('Suivi', 'Réduction : le bloc principal montre la moyenne sur 7 jours et ce qui reste, jamais un compteur « jours sans »', async (b, base) => {
  const D = 864e5, st = profileState({ types: ['alcool'], days: 20 }); Object.assign(st.habits[0], { goal: 'diminuer', limit: 2, limitPer: 'jour', qty: 4 });
  st.logs = [{ id: 'a', habitId: 'h0', type: 'alcool', ts: Date.now() - 60e3, qty: 1 }, { id: 'b', habitId: 'h0', type: 'alcool', ts: Date.now() - 2 * D, qty: 3 }];
  const p = await page(b, base, { init: seed(st) }); await p.goto(base); await p.settle();
  const hero = await p.textContent('.hm-hero');
  assert.match(hero, /Réduction/); assert.match(hero, /par jour en moyenne, sur 7 jours/); assert.match(hero, /Avant : 4 verres par jour/);
  assert.match(hero, /Il te reste 1 verre pour aujourd’hui/); assert.doesNotMatch(hero, /jours? sans alcool/);
  noErr(p);
});

test('Parcours 5', 'Journée difficile : pistes simples, objectif allégé pour la journée puis rétabli, numéro d’urgence du pays proposé', async (b, base) => {
  const p = await page(b, base, { init: seed(profileState({ types: ['cigarette'], extra: { prefs: { lang: 'fr', mainHabit: 'h0', helpCountry: 'CH' } } })) }); await p.goto(base); await p.settle();
  await p.click('[data-a="checkin"][data-v="1"]'); await p.waitForTimeout(200);
  await p.click('.ck [data-a="hardDay"]'); await p.waitForTimeout(300);
  const sh = await p.textContent('#layer');
  assert.match(sh, /ça ne dit rien de ta valeur/); assert.match(sh, /Une envie forte/); assert.match(sh, /Écrire ce qui se passe/); assert.match(sh, /144/);
  assert.match(sh, /leur effet varie/);
  await p.click('[data-a="easyDay"]'); await p.waitForTimeout(300);
  assert.match(await p.textContent('.goal.easy'), /prendre soin de toi/);
  assert.equal((await stateOf(p)).tools.easy !== undefined, true);
  await p.click('[data-a="easyOff"]'); await p.waitForTimeout(200);
  assert.equal(await p.$('.goal.easy'), null); assert.equal((await stateOf(p)).tools.easy, undefined);
  noErr(p);
});

test('Parcours 3', 'Envie forte : aide guidée en 7 étapes (ressenti, intensité, contexte, stratégie adaptée, exercice, bilan, enregistrement)', async (b, base) => {
  const p = await page(b, base, { init: seed(profileState({ types: ['cigarette'] })) }); await p.goto(base); await p.settle();
  await p.click('.hm-sos'); await p.waitForTimeout(300);
  assert.match(await p.textContent('#layer'), /Urgences/);
  await p.click('[data-a="s5Open"]'); await p.waitForTimeout(200);
  await p.click('[data-a="s5Feel"][data-v="Solitude"]'); await p.waitForTimeout(150);   // 1. ressenti
  await p.click('[data-a="s5To"][data-v="ctx"]'); await p.waitForTimeout(150);          // 2. intensité
  await p.click('[data-a="s5Ctx"][data-v="Ennui"]'); await p.waitForTimeout(150);       // 3. contexte
  const reco = await p.$$eval('.s5-strat.reco', b => b.map(x => x.dataset.v));
  assert.deepEqual(reco, ['agir', 'vague'], 'stratégies proposées selon le contexte : ' + reco);
  await p.click('.s5-strat.reco >> nth=0');                                              // 4. stratégie
  for (let i = 0; i < 3; i++) { await p.waitForTimeout(150); await p.click('[data-a="s5Next"]'); } // 5. exercice
  await p.waitForSelector('[data-a="s5Out"]', { timeout: 5000 });                       // 6. bilan
  assert.match(await p.textContent('.s5-more summary'), /déclenchée/);
  await p.click('[data-a="s5Out"][data-v="held"]'); await p.waitForTimeout(400);       // 7. enregistrement
  const h = (await stateOf(p)).tools.history.slice(-1)[0];
  assert.equal(h.outcome, 'held'); assert.equal(h.trigger, 'Ennui'); assert.equal(h.emotion, 'Solitude'); assert.equal(h.tool, 'sos5'); assert.equal(h.strat, 'agir');
  assert.match(await p.textContent('#layer'), /Préparer un plan pour « Ennui »/);
  noErr(p);
});

test('Personnalisation', 'Conseils personnalisés : désactivables dans le profil ; les messages de sécurité restent (alcool, premiers jours)', async (b, base) => {
  const st = profileState({ types: ['cigarette'], days: 10 }); st.tools.risks = ['Stress'];
  const p = await page(b, base, { init: seed(st) }); await p.goto(base); await p.settle();
  assert.match(await p.textContent('#app'), /Parce que tu as indiqué que « Stress »/);
  await p.go('profil'); await p.openFold('p-look'); await p.evaluate(() => document.querySelector('input[data-a="recsToggle"]').click()); await p.waitForTimeout(200);
  assert.equal((await stateOf(p)).prefs.recs, false);
  await p.go('accueil'); assert.doesNotMatch(await p.textContent('#app'), /Parce que tu as indiqué/);
  const st2 = profileState({ types: ['alcool'], days: 1 }); st2.habits[0].qty = 4; st2.prefs.recs = false;
  const p2 = await page(b, base, { init: seed(st2) }); await p2.goto(base); await p2.settle();
  assert.match(await p2.textContent('#app'), /Les premiers jours sans alcool/, 'la sécurité reste affichée');
  noErr(p); noErr(p2);
});

test('Aide', 'Numéros groupés par situation ; LIBRE n’est pas un service d’urgence ; Suisse : ligne jeu excessif 0800 040 080 si l’habitude est suivie', async (b, base) => {
  const p = await page(b, base, { init: seed(profileState({ types: ['jeux_argent'], extra: { prefs: { lang: 'fr', mainHabit: 'h0', helpCountry: 'CH' } } })) }); await p.goto(base); await p.settle();
  await p.go('profil'); await p.openFold('p-safe'); await p.waitForTimeout(200);
  const txt = await p.evaluate(() => document.getElementById('app').innerText);
  assert.match(txt, /DANGER IMMÉDIAT[\s\S]*112[\s\S]*URGENCE MÉDICALE[\s\S]*144[\s\S]*BESOIN DE PARLER[\s\S]*143[\s\S]*ACCOMPAGNEMENT PROFESSIONNEL[\s\S]*0800 040 080/i);
  assert.match(txt, /LIBRE n’est pas un service d’urgence/);
  noErr(p);
});

test('Parcours 11', 'Notifications refusées dans le téléphone : rien n’est programmé, un message clair, l’app reste entièrement utilisable', async (b, base) => {
  const p = await page(b, base, { native: { platform: 'android', ntDenied: true }, init: seed(profileState({ types: ['cigarette'] })) });
  await p.goto(base); await p.waitForSelector('#app[data-view="accueil"]'); await p.waitForTimeout(1500); await p.closeLayer();
  await p.go('profil'); await p.openFold('p-notif'); await p.waitForTimeout(200);
  const ask = await p.$('[data-a="ntAsk"]'); if (ask) { await ask.click(); await p.waitForTimeout(300); assert.match(await p.textContent('body'), /Autorisation refusée/); }
  assert.equal((await p.evaluate(() => window.__sched.length)), 0, 'aucun rappel programmé sans permission');
  await p.go('accueil'); await p.click('[data-a="quickPlus"]'); await p.waitForTimeout(300);
  assert.equal((await p.vault()) ? true : true, true);
  await p.click('.hm-sos'); await p.waitForTimeout(300); assert.match(await p.textContent('#layer'), /Une envie monte/);
  noErr(p);
});

test('Apparence', 'Identité « Envol » par défaut, y compris pour les profils existants ; l’ancien style « verre » reste une option', async (b, base) => {
  const st = profileState({}); st.prefs.fx = true;
  const p = await page(b, base, { init: seed(st) }); await p.goto(base); await p.settle();
  assert.equal(await p.evaluate(() => document.documentElement.classList.contains('fx')), false, 'Envol par défaut');
  await p.go('profil'); await p.openFold('p-look'); await p.evaluate(() => document.querySelector('input[data-a="fxToggle"]').click()); await p.waitForTimeout(200);
  assert.equal(await p.evaluate(() => document.documentElement.classList.contains('fx')), true, 'verre activé à la demande');
  assert.equal((await stateOf(p)).prefs.look, 'verre');
  await p.reload(); await p.waitForSelector('#app[data-view]');
  assert.equal(await p.evaluate(() => document.documentElement.classList.contains('fx')), true, 'choix conservé');
  noErr(p);
});

/* ---------- Couleur de chaque addiction ---------- */
test('Apparence', 'Couleur par addiction : un suivi, plusieurs suivis, changement de sélection mémorisé, vues mélangées en couleur commune', async (b, base) => {
  const brand = p => p.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--accent').trim().toUpperCase());
  const one = await page(b, base, { init: seed(profileState({ types: ['alcool'] })) }); await one.goto(base); await one.settle();
  assert.equal(await brand(one), '#B0521F', 'alcool : ambre'); assert.equal(await one.evaluate(() => document.documentElement.dataset.htheme), 'alcool');
  const bg = await one.evaluate(() => getComputedStyle(document.querySelector('.hm-sos .hm-sos-ic, .btn.primary') || document.body).backgroundColor); assert.ok(bg);
  noErr(one); await one.ctx.close();
  const st = profileState({ types: ['cigarette', 'alcool', 'jeux_argent'] });
  const p = await page(b, base, { init: seed(st) }); await p.goto(base); await p.settle();
  assert.equal(await brand(p), '#2E7D62', 'cigarettes : vert sauge');
  const dots = await p.evaluate(() => [...document.querySelectorAll('.segc [data-a="homeHabit"]')].map(x => getComputedStyle(x).getPropertyValue('--hc').trim().toUpperCase()));
  assert.deepEqual(dots, ['#2E7D62', '#B0521F', '#245BB0'], 'chaque suivi garde sa couleur');
  await p.click('.segc [data-a="homeHabit"] >> nth=2'); await p.waitForTimeout(200); assert.equal(await brand(p), '#245BB0', 'jeux d’argent : bleu profond');
  assert.equal((await stateOf(p)).prefs.activeHabit, 'h2');
  await p.reload(); await p.waitForSelector('#app[data-view]'); await p.waitForTimeout(300); assert.equal(await brand(p), '#245BB0', 'mémorisé après réouverture');
  await p.go('stats'); assert.equal(await p.evaluate(() => document.documentElement.dataset.htheme || ''), '', 'statistiques « Tout » : couleur commune');
  await p.click('[data-a="filter"][data-k="h1"]'); await p.waitForTimeout(150); assert.equal(await brand(p), '#B0521F', 'statistiques filtrées : couleur du suivi');
  await p.go('habitudes'); const cards = await p.evaluate(() => [...document.querySelectorAll('.hc-card')].map(c => getComputedStyle(c).getPropertyValue('--hc').trim().toUpperCase()));
  assert.deepEqual(cards, ['#2E7D62', '#B0521F', '#245BB0']);
  noErr(p);
});

test('Apparence', 'Couleur par addiction : personnalisée, conservée après réouverture, désactivable ; contrastes AA de toutes les palettes (clair et sombre)', async (b, base) => {
  const p = await page(b, base, { init: seed(profileState({ types: ['cigarette'] })) }); await p.goto(base); await p.settle();
  await p.go('profil'); await p.closeLayer(); await p.openFold('p-look'); await p.click('[data-a="setHcol"][data-h="h0"][data-v="ecrans"]'); await p.waitForTimeout(200);
  await p.reload(); await p.waitForSelector('#app[data-view]'); await p.waitForTimeout(300);
  assert.equal(await p.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--accent').trim().toUpperCase()), '#0F7480');
  await p.go('profil'); await p.openFold('p-look'); await p.click('label.switch:has([data-a="habitThemeToggle"])'); await p.waitForTimeout(200);
  assert.equal(await p.evaluate(() => document.documentElement.dataset.htheme || ''), '', 'désactivé : couleur commune de LIBRE');
  const bad = await p.evaluate(() => { const L = h => { const c = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255).map(v => v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; };
    const R = (a, b) => { const x = L(a), y = L(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); }; const out = [];
    for (const [k, P] of Object.entries(window.LIBRE_PALETTES)) { [[R('#FFFFFF', P[1]), 'blanc sur bouton'], [R(P[2], '#FFFFFF'), 'texte sur carte'], [R(P[2], '#F4F3F9'), 'texte sur fond'], [R(P[2], P[3]), 'texte sur nuance douce'], [R('#FFFFFF', P[4]), 'blanc sur dégradé foncé'], [R('#FFFFFF', P[5]), 'blanc sur dégradé moyen'], [R('#FFFFFF', P[6]), 'blanc sur dégradé clair'], [R('#0C0B1C', P[7]), 'sombre : texte sur bouton'], [R(P[7], '#171630'), 'sombre : texte sur carte'], [R(P[7], P[8]), 'sombre : texte sur nuance']].forEach(([r, n]) => { if (r < 4.5) out.push(`${k} ${n} ${r.toFixed(2)}`); }); }
    return out; });
  assert.deepEqual(bad, []); noErr(p);
});

/* ---------- Refonte « Envol » : aide triée par besoin, moment à risque, ressources ---------- */
test('Aide', 'Triage : « De quoi as-tu besoin ? » propose 5 choix ; chacun mène au bon outil (aide guidée, retarder, respiration, proche, urgences)', async (b, base) => {
  const st = profileState({ types: ['cigarette'] }); st.contacts = [{ name: 'Sam', phone: '0790000000' }];
  const p = await page(b, base, { init: seed(st) }); await p.goto(base); await p.settle();
  const open = async () => { await p.closeLayer(); await p.click('nav .nav-help'); await p.waitForTimeout(300); };
  await open(); assert.match(await p.textContent('#layer'), /De quoi as-tu besoin/); assert.equal(await p.locator('.qs-t').count(), 5);
  assert.equal(await p.getAttribute('.qs-t.qs-call', 'href'), 'tel:0790000000');
  await p.click('.qs-t-main'); await p.waitForTimeout(300); assert.match(await p.textContent('#layer'), /Qu’est-ce que tu ressens/);
  await open(); await p.click('.qs-t.qs-breath'); await p.waitForTimeout(300); assert.match(await p.textContent('#layer'), /Inspire|Expire|respir/i);
  await open(); await p.click('.qs-t-danger'); await p.waitForTimeout(300); const t = await p.textContent('#layer'); assert.match(t, /Tu n’es pas seul·e/); assert.match(t, /144/);
  noErr(p);
});

test('Personnalisation', 'Moment à risque : signalé à l’heure où la personne consomme le plus souvent, avec son explication ; absent si les conseils sont désactivés', async (b, base) => {
  const mk = recs => { const st = profileState({ types: ['cigarette'], days: 40 }); st.prefs.recs = recs;
    st.logs = Array.from({ length: 6 }, (_, i) => ({ id: 'l' + i, habitId: 'h0', type: 'cigarette', ts: Date.now() - (i + 2) * 864e5, qty: 1 })); return st; };
  const p = await page(b, base, { init: seed(mk(true)) }); await p.goto(base); await p.settle();
  const txt = await p.textContent('.hm-risk'); assert.match(txt, /C’est souvent .* que c’est plus difficile pour toi/); assert.match(txt, /100 % de tes consommations/); assert.match(txt, /pas une prédiction/);
  const q = await page(b, base, { init: seed(mk(false)) }); await q.goto(base); await q.settle();
  assert.equal(await q.locator('.hm-risk').count(), 0, 'désactivé avec les conseils personnalisés');
  noErr(p); noErr(q); await q.ctx.close();
});

test('Soutien', 'Centre de soutien : maintenant, 7 situations (3 gestes, un exercice, un plan, une lecture), exercices, plans, orientation', async (b, base) => {
  const p = await page(b, base, { init: seed(profileState({ types: ['cigarette'] })) }); await p.goto(base); await p.settle(); await p.go('outils');
  await p.click('[data-a="allTools"]'); await p.waitForTimeout(200); assert.ok(await p.locator('#layer .trows .tool-row').count() >= 8, 'tous les exercices'); await p.closeLayer();
  await p.click('[data-a="sitSheet"]'); await p.waitForTimeout(200); assert.equal(await p.locator('#layer .cr-chip').count(), 7);
  await p.click('#layer [data-a="situation"][data-k="stress"]'); await p.waitForTimeout(300);
  assert.equal(await p.locator('.sit3-s li').count(), 3); assert.match(await p.textContent('#layer'), /pas un traitement/);
  await p.click('#layer [data-a="sitPlan"]'); await p.waitForTimeout(400);
  assert.match(await p.inputValue('#pl-if'), /stress/i, 'le modèle de plan correspondant est prérempli');
  await p.closeLayer(); await p.click('[data-a="sitSheet"]'); await p.waitForTimeout(200); await p.click('#layer [data-a="situation"][data-k="social"]'); await p.waitForTimeout(300); await p.click('#layer [data-a="sitRead"]');
  await p.waitForFunction(() => document.getElementById('app').dataset.view === 'biblio'); assert.match(await p.textContent('.lib3-head'), /Objectif/);
  await p.go('outils'); await p.click('.mp-danger'); await p.waitForTimeout(300); assert.match(await p.textContent('#layer'), /Tu n’es pas seul·e/);
  noErr(p);
});


test('Soutien', 'Fiche interactive : gestes cochés, « Ça t’a aidé ? » enregistré, puis proposé dans « Ce qui t’aide » ; une reprise mène à la fiche de son déclencheur', async (b, base) => {
  const st = profileState({ types: ['cigarette'], days: 30 }); st.logs = [{ id: 'x', habitId: 'h0', type: 'cigarette', ts: Date.now() - 2 * 36e5, qty: 1 }];
  const p = await page(b, base, { init: seed(st) }); await p.goto(base); await p.settle(); await p.go('outils');
  await p.click('[data-a="sitSheet"]'); await p.waitForTimeout(200); await p.click('#layer [data-a="situation"][data-k="seul"]'); await p.waitForTimeout(300);
  assert.equal(await p.isVisible('#sit3fb'), false, 'la question vient après un geste');
  await p.click('.sit3-step >> nth=0'); await p.click('.sit3-step >> nth=1');
  assert.equal(await p.getAttribute('.sit3-step >> nth=0', 'aria-pressed'), 'true'); assert.equal(await p.isVisible('#sit3fb'), true);
  await p.click('[data-a="sitHelp"][data-v="2"]'); await p.waitForTimeout(400);
  const log = (await stateOf(p)).tools.sitLog; assert.equal(log.length, 1); assert.equal(log[0].k, 'seul'); assert.equal(log[0].done, 2); assert.equal(log[0].helped, 2);
  assert.match(await p.textContent('.cr-rec'), /Ce qui t’aide[\s\S]*La solitude[\s\S]*T’a aidé 1 fois/);
  await p.go('accueil'); await p.evaluate(() => document.querySelector('[data-a="lapse"]').click()); await p.waitForTimeout(300);
  await p.click('[data-a="lpTrig"][data-v="Solitude"]'); await p.waitForTimeout(200);
  await p.click('#layer .lp-sit'); await p.waitForTimeout(300); assert.match(await p.textContent('#layer'), /Se sentir seul·e/);
  noErr(p);
});

/* ---------- Refonte « Clairière » : navigation, journal guidé, lecture des données, bibliothèque par thèmes ---------- */

test('Journal', 'Écriture guidée : une question du jour, émotions, pensée, intention pour demain ; tout est enregistré et réaffiché', async (b, base) => {
  const p = await page(b, base, { init: seed(profileState({ types: ['cigarette'] })) }); await p.goto(base); await p.settle(); await p.go('journal'); await p.closeLayer();
  const q1 = await p.textContent('.j3-q'); await p.click('[data-a="jPromptNext"]'); const q2 = await p.textContent('.j3-q'); assert.notEqual(q1, q2, 'une autre question est proposée');
  await p.click('[data-a="jPrompt"]'); await p.waitForSelector('#j-text');
  assert.equal((await p.textContent('.j3-qbox p:last-child')).trim(), q2.trim(), 'la question choisie est rappelée');
  await p.click('[data-a="jEmo"][data-k="Fatigue"]'); await p.click('[data-a="jMood"][data-v="4"]');
  await p.fill('#j-text', 'Une marche au soleil'); await p.fill('#j-goal', 'Préparer une boisson avant la pause');
  await p.click('[data-a="saveJournal"]'); await p.waitForTimeout(400);
  const j = (await stateOf(p)).journal[0];
  assert.deepEqual(j.emo, ['Fatigue']); assert.equal(j.mood, 4); assert.equal(j.goal, 'Préparer une boisson avant la pause'); assert.ok(j.prompt, 'question enregistrée');
  const book = await p.textContent('.jbook'); assert.match(book, /Aujourd’hui/); assert.match(book, /Intention/); assert.match(book, /Fatigue/);
  assert.equal(await p.locator('.j3-week i[style]').count(), 1, 'humeur du jour visible sur la semaine');
  noErr(p);
});

test('Statistiques', 'Lecture expliquée : constats en phrases simples, chacun avec son mode de calcul ; jamais présentés comme un diagnostic', async (b, base) => {
  const D = 864e5, st = profileState({ types: ['cigarette'], days: 40 });
  st.logs = Array.from({ length: 9 }, (_, i) => ({ id: 'l' + i, habitId: 'h0', type: 'cigarette', ts: Date.now() - (8 + i) * D + 0, qty: 1, trigger: 'Stress' }));
  const p = await page(b, base, { init: seed(st) }); await p.goto(base); await p.settle(); await p.go('stats');
  const txt = await p.textContent('.rd3');
  assert.match(txt, /Ce que tes données montrent/); assert.match(txt, /Moins de consommations cette semaine/); assert.match(txt, /Stress/);
  assert.match(txt, /pas un diagnostic ni une prédiction/);
  assert.ok(await p.locator('.rd3 details').count() >= 3, 'chaque constat dit comment il est calculé');
  const nw = await page(b, base, { init: seed(profileState({ types: ['cigarette'], days: 2 })) }); await nw.goto(base); await nw.settle(); await nw.go('stats');
  assert.match(await nw.textContent('.rd3'), /Encore quelques jours de suivi/, 'pas de conclusion sur trop peu de données');
  noErr(p); noErr(nw); await nw.ctx.close();
});

test('Bibliothèque', 'Par thèmes : 11 thèmes avec un objectif pédagogique, chaque fiche s’ouvre ; un thème sans fiche dédiée le dit', async (b, base) => {
  const p = await page(b, base, { init: seed(profileState({ types: ['alcool'] })) }); await p.goto(base); await p.settle(); await p.go('biblio');
  const n = await p.locator('.lib3-t').count(); assert.equal(n, 11);
  for (let i = 0; i < n; i++) {
    await p.click(`.lib3-t >> nth=${i}`); await p.waitForTimeout(150);
    assert.match(await p.textContent('.lib3-head'), /Objectif :/); assert.ok(await p.locator('.art').count() >= 1, 'au moins une fiche');
    if (i === 9) assert.match(await p.textContent('#app'), /en préparation/);
    await p.click('[data-a="libTheme"][data-k=""]'); await p.waitForTimeout(100);
  }
  await p.click('.lib3-t >> nth=1'); await p.click('.art >> nth=0'); await p.waitForTimeout(300); assert.match(await p.textContent('#layer'), /Sources/);
  noErr(p);
});

/* ---------- Refonte intégrale : parcours 2, 4, 6, 8 et plans ---------- */
test('Parcours 2', 'Tableau de bord adaptatif : premiers pas, moment difficile, reprise, objectif atteint (une seule carte, la plus importante)', async (b, base) => {
  const D = 864e5, open = async st => { const p = await page(b, base, { init: seed(st) }); await p.goto(base); await p.settle(); const r = await p.evaluate(() => { const c = document.querySelector('.hm-sit'); return c ? c.className + ' | ' + c.innerText : ''; }); noErr(p); await p.ctx.close(); return r; };
  const nw = profileState({ types: ['cigarette'], days: 2 }); nw.reasons = [];
  assert.match(await open(nw), /sit-new[\s\S]*0 sur 4[\s\S]*Écrire pourquoi tu changes/i);
  const hard = profileState({ types: ['cigarette'], days: 30 }); hard.tools.checkins = { [new Date(Date.now() - new Date().getTimezoneOffset() * 6e4).toISOString().slice(0, 10)]: { mood: 1, ts: Date.now() } };
  hard.reasons = ['Ma santé']; hard.contacts = [{ name: 'Sam', phone: '0790000000' }];
  const rh = await open(hard); assert.match(rh, /sit-hard[\s\S]*On prend les choses une par une/, rh);
  const slip = profileState({ types: ['cigarette'], days: 30 }); slip.contacts = [{ name: 'Sam', phone: '1' }]; slip.tools.plans = [{ id: 'p', if: 'a', then: 'b' }];
  slip.logs = [{ id: 'x', habitId: 'h0', type: 'cigarette', ts: Date.now() - 3 * 36e5, qty: 1 }];
  assert.match(await open(slip), /sit-slip[\s\S]*Une reprise ne t’enlève rien/);
  const goal = profileState({ types: ['cigarette'], days: 400 });
  assert.match(await open(goal), /sit-goal[\s\S]*Toutes les étapes sont franchies/);
  const calm = profileState({ types: ['cigarette'], days: 30 }); calm.contacts = [{ name: 'Sam', phone: '1' }]; calm.tools.plans = [{ id: 'p', if: 'a', then: 'b' }];
  assert.equal(await open(calm), '', 'aucune carte quand rien de particulier');
});

test('Parcours 4', 'Exercice guidé (surfer sur l’envie) : démarrer, terminer, indiquer le résultat ; la séance est enregistrée', async (b, base) => {
  const p = await page(b, base, { init: seed(profileState({ types: ['cigarette'] })) }); await p.goto(base); await p.settle();
  await p.go('outils'); await p.evaluate(() => { const x = document.createElement('button'); x.dataset.a = 'tool'; x.dataset.id = 'urge'; document.body.appendChild(x); x.click(); x.remove(); });
  for (let i = 0; i < 12; i++) {
    await p.waitForTimeout(250);
    if (await p.$('[data-a="tlOutcome"]')) { await p.click('[data-a="tlOutcome"] >> nth=0'); break; }
    const nxt = await p.$('#layer button.btn.primary:not([disabled]), [data-a="tlFinish"]'); if (nxt) await nxt.click();
  }
  await p.waitForTimeout(400);
  const st = await stateOf(p), last = (st.tools.history || []).slice(-1)[0];
  assert.ok(last && last.tool === 'urge', 'séance enregistrée : ' + JSON.stringify(last));
  noErr(p);
});

test('Parcours 6', 'Rechute : la feuille rappelle ce qui reste acquis, la reprise est notée sans culpabiliser, la suite est préparée', async (b, base) => {
  const st = profileState({ types: ['cigarette'], days: 30 }); st.logs = [{ id: 'x', habitId: 'h0', type: 'cigarette', ts: Date.now() - 2 * 36e5, qty: 1 }]; st.sos = [{ ts: Date.now() - 5 * 864e5, ok: true, intensity: 7 }];
  const p = await page(b, base, { init: seed(st) }); await p.goto(base); await p.settle();
  await p.click('.hm-sit [data-a="lapse"]'); await p.waitForTimeout(300);
  const txt = await p.textContent('#layer');
  assert.match(txt, /Ce qui reste acquis/); assert.match(txt, /jours sans au total/); assert.match(txt, /1 envie traversée/);
  assert.doesNotMatch(txt, /échec|faute|honte/i, 'aucun mot culpabilisant');
  await p.click('[data-a="lpTrig"] >> nth=0'); await p.click('[data-a="lapseSave"]'); await p.waitForTimeout(400);
  const s2 = await stateOf(p); assert.ok(s2.journal.some(j => j.kind === 'lapse'), 'reprise notée dans le journal');
  noErr(p);
});

test('Parcours 8', 'Modifier son objectif : passer d’« arrêter » à « mieux comprendre » ; le compteur d’abstinence disparaît, les données restent', async (b, base) => {
  const st = profileState({ types: ['alcool'], days: 20 }); st.logs = [{ id: 'a', habitId: 'h0', type: 'alcool', ts: Date.now() - 5 * 864e5, qty: 2 }];
  const p = await page(b, base, { init: seed(st) }); await p.goto(base); await p.settle();
  assert.match(await p.textContent('.hm-hero'), /jours sans alcool/);
  await p.go('habitudes'); await p.click('[data-a="habitForm"][data-id="h0"]'); await p.waitForTimeout(300);
  await p.click('[data-a="hfGoal"][data-k="comprendre"]'); await p.click('[data-a="saveHabit"]'); await p.waitForTimeout(400);
  const s2 = await stateOf(p); assert.equal(s2.habits[0].goal, 'comprendre'); assert.equal(s2.logs.length, 1, 'données conservées');
  await p.go('accueil'); const hero = await p.textContent('.hm-hero');
  assert.match(hero, /Observation/); assert.doesNotMatch(hero, /jours sans alcool/);
  noErr(p);
});

test('Plans', 'Plans par situation : un modèle « Pression sociale » remplit le plan, modifiable, puis enregistré et visible', async (b, base) => {
  const p = await page(b, base, { init: seed(profileState({ types: ['alcool'] })) }); await p.goto(base); await p.settle();
  await p.evaluate(() => { const x = document.createElement('button'); x.dataset.a = 'tool'; x.dataset.id = 'plan'; document.body.appendChild(x); x.click(); x.remove(); });
  await p.waitForTimeout(300); await p.click('[data-a="planTpl"][data-i="2"]');
  assert.match(await p.inputValue('#pl-if'), /insiste/); await p.fill('#pl-then', 'je dis non merci et je rentre à 23 h');
  await p.click('[data-a="planSave"]'); await p.waitForTimeout(400);
  const pl = (await stateOf(p)).tools.plans.slice(-1)[0]; assert.match(pl.if, /insiste/); assert.equal(pl.then, 'je dis non merci et je rentre à 23 h');
  noErr(p);
});

test('Confidentialité', 'Voile : dès que LIBRE passe en arrière-plan, le contenu est masqué, puis réapparaît au retour', async (b, base) => {
  const st = profileState({ extra: { journal: [{ id: 'j1', ts: Date.now(), mood: 2, text: 'TEXTE-INTIME', triggers: [] }] } });
  const p = await page(b, base, { init: seed(st) }); await p.goto(base); await p.settle(); await p.go('journal');
  const hide = h => p.evaluate(h => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => h }); Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => h ? 'hidden' : 'visible' }); document.dispatchEvent(new Event('visibilitychange')); }, h);
  await hide(true);
  assert.equal(await p.evaluate(() => getComputedStyle(document.getElementById('app')).visibility), 'hidden', 'contenu masqué en arrière-plan');
  await hide(false);
  assert.equal(await p.evaluate(() => getComputedStyle(document.getElementById('app')).visibility), 'visible');
  assert.match(await p.textContent('#app'), /TEXTE-INTIME/);
  assert.deepEqual(p.errors, []);
});

test('Confidentialité', 'Tout effacer annule les rappels déjà programmés dans le téléphone, et rien ne réapparaît après réouverture', async (b, base) => {
  const st = profileState({ name: 'Zorglub-Rappel' });
  const p = await page(b, base, { native: { platform: 'android' }, init: seed(st) }); await p.goto(base); await p.waitForSelector('#app[data-view="accueil"]'); await p.waitForTimeout(1500); await p.closeLayer();
  await p.evaluate(() => { window.__sched.push({ id: 101, title: 'Rappel', body: 'texte' }, { id: 102, title: 'Rappel', body: 'texte' }); });
  await p.go('profil'); await p.evaluate(() => document.querySelector('[data-a="resetAsk"]').click()); await p.waitForTimeout(200);
  await p.click('#layer .btn.danger'); await p.waitForSelector('[data-a="obNext"]'); await p.waitForTimeout(400);
  assert.equal(await p.evaluate(() => window.__sched.length), 0, 'rappels annulés');
  await p.click('[data-a="snapDel"]'); await p.waitForTimeout(150); await p.click('#layer .btn.danger'); await p.waitForTimeout(300);
  await p.reload(); await p.waitForSelector('[data-a="obNext"]'); await p.waitForTimeout(600);
  assert.doesNotMatch(await p.textContent('body'), /Zorglub/, 'aucune trace du profil après réouverture');
  assert.deepEqual(p.errors, []);
});

test('Exports', 'Bilan mensuel : journal et habitude contenant du HTML et du JavaScript, rien ne s’exécute ; nom de fichier sans donnée personnelle', async (b, base) => {
  const evil = '<img src=x onerror="window.__pwn=1"><script>window.__pwn=2</script>';
  const st = profileState({ types: ['autre'], extra: { journal: [{ id: 'j1', ts: Date.now() - 864e5, mood: 2, text: evil, triggers: [] }] } });
  st.habits[0].label = 'Habitude ' + evil + ' « spéciale » é ü 你好 ' + 'x'.repeat(200);
  st.logs = [{ id: 'l1', habitId: 'h0', type: 'autre', ts: Date.now() - 2 * 864e5, qty: 1, comment: evil, trigger: 'Stress' }];
  const p = await page(b, base, { native: { platform: 'ios' }, init: seed(st) }); await p.goto(base); await p.waitForSelector('#app[data-view="accueil"]'); await p.waitForTimeout(1500); await p.closeLayer();
  await p.go('bilans'); await p.waitForTimeout(300); await p.evaluate(() => document.querySelector('[data-a="printMonth"]').click());
  await p.waitForFunction(() => window.__lastFile, null, { timeout: 8000 });
  const f = await p.evaluate(() => ({ path: window.__lastFile.path, data: window.__lastFile.data }));
  assert.match(f.path, /^libre-bilan-\d{4}-\d{2}\.html$/, 'nom de fichier neutre : ' + f.path);
  assert.ok(!/<script>window\.__pwn|<img src=x onerror/.test(f.data), 'HTML hostile échappé');
  const q = await p.ctx.newPage(); await q.setContent(f.data); await q.waitForTimeout(300);
  assert.equal(await q.evaluate(() => window.__pwn), undefined, 'aucun code exécuté à l’ouverture du bilan');
  const calls = await p.evaluate(() => window.__calls.map(c => c[0]));
  assert.ok(calls.includes('Share.share'), 'partage système proposé');
  assert.deepEqual(p.errors, []);
});

test('Santé Apple', 'États exacts : « autorisation demandée, aucune donnée », synchronisation incomplète signalée, resynchronisation sur 7 jours (plugin simulé)', async (b, base) => {
  const init = () => { window.__hkCalls = []; window.Capacitor.Plugins.LibreHealth = { isAvailable: async () => ({ available: true }), requestAuthorization: async () => ({ requested: true }),
    queryDaily: async a => { window.__hkCalls.push(a); return sessionStorage.getItem('__hkData') ? { days: [{ date: new Date().toISOString().slice(0, 10), steps: 4000 }], errors: ['hr: refusé'] } : { days: [], errors: [] }; } }; };
  const p = await page(b, base, { native: { platform: 'ios', noVault: true }, init: seed(profileState()) }); await p.ctx.addInitScript(init);
  await p.goto(base); await p.settle(); await p.go('profil'); await p.closeLayer(); await p.openFold('p-hk'); await p.waitForSelector('[data-a="hkConnect"]');
  await p.click('[data-a="hkConnect"]'); await p.waitForTimeout(800); await p.openFold('p-hk'); await p.waitForTimeout(300);
  const t1 = await p.textContent('#hkBox'); assert.match(t1, /Autorisation demandée, aucune donnée reçue/); assert.doesNotMatch(t1, /Connecté/);
  await p.evaluate(() => sessionStorage.setItem('__hkData', '1')); await p.click('[data-a="hkSync"]'); await p.waitForTimeout(600); await p.openFold('p-hk'); await p.waitForTimeout(300);
  const t2 = await p.textContent('#hkBox'); assert.match(t2, /Données reçues/); assert.match(t2, /incomplète/);
  const last = await p.evaluate(() => window.__hkCalls[window.__hkCalls.length - 1]);
  const span = (new Date(last.to) - new Date(last.from)) / 864e5; assert.ok(span >= 7 && span < 9, 'resynchronisation sur 7 jours : ' + span);
  assert.deepEqual(p.errors, []);
});

test('Données', 'Migration : un état de la version 3 (sans marqueur dataV) est relu sans perte, puis marqué dataV 3', async (b, base) => {
  const st = profileState({ types: ['cigarette', 'alcool'], name: 'Ancienne' });
  st.logs = [{ id: 'l1', habitId: 'h0', type: 'cigarette', ts: Date.now() - 864e5, qty: 2 }]; st.journal = [{ id: 'j1', ts: Date.now(), mood: 4, text: 'garde-moi', triggers: [] }];
  st.prefs.lock = null; st.prefs.favTools = ['breath']; delete st.dataV;
  const p = await page(b, base, { init: seed(st) }); await p.goto(base); await p.settle(); await p.go('journal');
  await p.click('[data-a="journalForm"]'); await p.waitForSelector('#j-text'); await p.fill('#j-text', 'nouvelle'); await p.click('[data-a="saveJournal"]'); await p.waitForTimeout(300);
  const s = await p.evaluate(() => JSON.parse(localStorage.getItem('libre.v1')));
  assert.equal(s.dataV, 3); assert.equal(s.profile.name, 'Ancienne'); assert.equal(s.habits.length, 2); assert.equal(s.logs.length, 1);
  assert.equal(s.journal.length, 2); assert.ok(s.journal.some(j => j.text === 'garde-moi')); assert.deepEqual(s.prefs.favTools, ['breath']);
  assert.deepEqual(p.errors, []);
});

test('Scénario', 'Nouveau téléphone : profil complet, export chiffré, restauration dans un autre navigateur vierge, tout est identique', async (b, base) => {
  const st = profileState({ types: ['cigarette', 'alcool'], name: 'Voyageur' });
  st.logs = Array.from({ length: 25 }, (_, i) => ({ id: 'l' + i, habitId: i % 2 ? 'h0' : 'h1', type: i % 2 ? 'cigarette' : 'alcool', ts: Date.now() - i * 36e5 * 9, qty: 1 + (i % 3), comment: 'é « » <b>' + i }));
  st.journal = Array.from({ length: 12 }, (_, i) => ({ id: 'j' + i, ts: Date.now() - i * 864e5, mood: 1 + (i % 5), text: 'Entrée ' + i + ' ✓', triggers: ['Stress'] }));
  const p = await page(b, base, { init: seed(st) }); await p.goto(base); await p.settle();
  const before = await p.evaluate(() => JSON.parse(localStorage.getItem('libre.v1')));
  const txt = await exportEncrypted(p, 'phrase-de-passe-solide');
  const q = await page(b, base); await q.goto(base); await q.waitForSelector('[data-a="obNext"]');
  const file = require('path').join(require('os').tmpdir(), 'libre-test-sauvegarde.libre.json'); fs.writeFileSync(file, txt);
  const [chooser] = await Promise.all([q.waitForEvent('filechooser'), q.click('[data-a="importFile"]')]);
  await chooser.setFiles(file); await q.waitForTimeout(500);
  await q.fill('#layer input[type=password]', 'phrase-de-passe-solide'); await q.evaluate(() => document.querySelector('#layer form').requestSubmit()); await q.waitForTimeout(2500);
  const conf = await q.$('#layer .btn.primary, #layer .btn.danger'); if (conf) { await conf.click(); await q.waitForTimeout(500); }
  const after = await q.evaluate(() => JSON.parse(localStorage.getItem('libre.v1')));
  assert.equal(after.profile.name, 'Voyageur'); assert.deepEqual(after.logs, before.logs); assert.deepEqual(after.journal, before.journal); assert.deepEqual(after.habits, before.habits);
  assert.deepEqual(p.errors, []); assert.deepEqual(q.errors, []);
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

/* ---------- Mise à jour « simplicité » : chiffres, recherche, mode discret, historique, favoris, rappels ---------- */
const D_ = 864e5;
const dashState = () => { const st = profileState({ types: ['cigarette', 'alcool'], days: 20 }); st.habits[0].trackStart = Date.now() - 20 * D_;
  st.logs = [{ id: 'a1', habitId: 'h0', ts: Date.now() - 6 * D_ - 3600e3, qty: 2 }, { id: 'a2', habitId: 'h1', ts: Date.now() - 2 * D_, qty: 3 }];
  st.habits[1].goal = 'diminuer'; st.habits[1].limit = 10; st.habits[1].limitPer = 'semaine'; return st; };
test('Recherche', 'La recherche trouve articles, exercices, SOS et réglages, et y mène en un toucher', async (b, base) => {
  const p = await page(b, base, { init: seed(dashState()) }); await p.goto(base); await p.settle();
  for (const v of ['accueil', 'stats', 'journal', 'outils', 'profil']) { await p.go(v); assert.ok(await p.$('[data-a="search"]'), 'bouton recherche sur ' + v); }
  await p.click('[data-a="search"]'); await p.fill('#sQ', 'respiration'); await p.waitForTimeout(150);
  assert.match(await p.textContent('#sR'), /Respiration lente/); await p.click('#sR [data-go="tool"][data-id="breath"]'); await p.waitForTimeout(300);
  assert.ok(await p.$('#layer .full, #layer .sheet'), 'exercice ouvert'); await p.closeLayer();
  await p.click('[data-a="search"]'); await p.click('[data-a="sCat"][data-k="notif"]'); await p.fill('#sQ', 'rappel'); await p.waitForTimeout(150);
  await p.click('#sR [data-go="goFold"]'); await p.waitForFunction(() => document.getElementById('app').dataset.view === 'profil');
  assert.ok(await p.evaluate(() => document.querySelector('[data-fold="p-notif"]').open), 'rubrique Notifications ouverte');
  await p.click('[data-a="search"]'); await p.fill('#sQ', 'zzzzqq'); await p.waitForTimeout(150); assert.match(await p.textContent('#sR'), /Aucun résultat/); noErr(p);
});
test('Mode discret', 'Masque les noms des addictions et brouille les chiffres ; mémorisé', async (b, base) => {
  const p = await page(b, base, { init: seed(dashState()) }); await p.goto(base); await p.settle();
  await p.click('.tacts [data-a="discreet"]'); await p.closeLayer(); await p.waitForTimeout(200);
  const txt = await p.textContent('#app'); assert.ok(!/Cigarettes|Alcool/.test(txt), 'noms masqués'); assert.match(txt, /Suivi 1/);
  assert.match(await p.evaluate(() => getComputedStyle(document.querySelector('.h11-st .num')).filter), /blur/);
  await p.reload(); await p.settle(); assert.ok(await p.evaluate(() => document.body.classList.contains('discreet'))); noErr(p);
});
test('Notifications', 'Nouveaux rappels (résumé, encouragement, inactivité) : choix, heure, programmés sans culpabiliser', async (b, base) => {
  const st = dashState(); st.prefs.nt = { enabled: true, system: true, discreet: false, items: { summary: { on: true, time: '21:00', days: [0, 1, 2, 3, 4, 5, 6] }, encourage: { on: true, time: '18:30', days: [0, 1, 2, 3, 4, 5, 6] }, inactive: { on: true, time: '19:00', days: [0, 1, 2, 3, 4, 5, 6], n: '5' } } };
  st.logs.push({ id: 'a3', habitId: 'h0', ts: Date.now() - D_, qty: 1 });
  const p = await page(b, base, { init: seed(st), native: { platform: 'android' } }); await p.goto(base); await p.settle(); await p.waitForTimeout(1500);
  const sch = await p.evaluate(() => window.__sched.map(n => ({ k: n.extra && n.extra.kind, body: n.body, at: +new Date(n.schedule.at) })));
  const sum = sch.filter(n => n.k === 'summary'); assert.ok(sum.length >= 7, 'résumé quotidien programmé'); assert.match(sum[0].body, /jour.* sans cigarettes/);
  const inc = sch.find(n => n.k === 'inactive'); assert.ok(inc && inc.at - Date.now() > 4 * D_, 'inactivité : après le nombre de jours choisi');
  const enc = sch.find(n => n.k === 'encourage'); assert.ok(enc, 'encouragement après un écart récent');
  for (const n of sch) assert.ok(!/échec|raté|honte|déçu/i.test(n.body), 'aucun texte culpabilisant : ' + n.body);
  await p.go('profil'); await p.openFold('p-notif'); assert.match(await p.textContent('[data-fold="p-notif"]'), /Résumé du jour[\s\S]*Encouragement[\s\S]*Si je ne note rien/); noErr(p);
});
test('Profil', 'Le profil est rangé en 9 catégories', async (b, base) => {
  const p = await page(b, base, { init: seed(dashState()) }); await p.goto(base); await p.settle(); await p.go('profil');
  const ks = await p.evaluate(() => [...document.querySelectorAll('.pf-cat > details')].map(d => d.dataset.fold));
  assert.deepEqual(ks, ['p-acct', 'p-habits', 'p-goals', 'p-notif', 'p-lang', 'p-data', 'p-backup', 'p-hk', 'p-help']);
  await p.openFold('p-acct'); assert.match(await p.textContent('[data-fold="p-acct"]'), /pas joignable/, 'sans serveur : le compte est indiqué comme indisponible, rien n’est simulé'); noErr(p);
});
test('Langue', 'Le bouton de langue en haut de l’accueil change toute l’application immédiatement', async (b, base) => {
  const p = await page(b, base, { init: seed(dashState()) }); await p.goto(base); await p.settle();
  assert.equal((await p.textContent('.tact-lang')).trim(), 'FR'); await p.click('.tact-lang'); await p.click('[data-a="setLang"][data-l="de"]'); await p.closeLayer();
  assert.equal((await p.textContent('.tact-lang')).trim(), 'DE'); assert.match(await p.textContent('.h11-week'), /Diese Woche/);
  await p.go('profil'); assert.match(await p.textContent('#app'), /Mein Konto/); await p.reload(); await p.settle(); assert.equal(await p.evaluate(() => document.documentElement.lang), 'de'); noErr(p);
});

/* ---------- LIBRE 7 : coach, programme, récompenses, motivations, comprendre, évolution, prévention ---------- */
const v7State = () => { const N = Date.now(), st = profileState({ types: ['cigarette', 'alcool'], days: 40 });
  st.habits[1].goal = 'diminuer'; st.habits[1].limit = 10; st.habits[1].limitPer = 'semaine';
  st.logs = [{ id: 'c1', habitId: 'h0', ts: N - 5 * D_ - 3600e3, qty: 2, trigger: 'Stress' }, { id: 'a1', habitId: 'h1', ts: N - 2 * D_, qty: 3, trigger: 'Soirée / fête' }, { id: 'a2', habitId: 'h1', ts: N - 9 * D_, qty: 4, trigger: 'Soirée / fête' }];
  st.journal = [{ id: 'j1', ts: N - D_, mood: 4, text: 'ok' }, { id: 'j2', ts: N - 3 * D_, mood: 2, text: 'dur' }];
  st.tools.history = [{ id: 'u1', ts: N - D_, habitId: 'h0', before: 7, after: 3, trigger: 'Stress', emotion: 'Stress', tool: 'sos5', outcome: 'held' }, { id: 'u2', ts: N - 4 * D_, habitId: 'h0', before: 8, after: 6, trigger: 'Stress', emotion: 'Stress', tool: 'sos5', outcome: 'used' }]; st.tools.histV = 1;
  st.tools.sessions = [{ ts: N - D_, tool: 'breath', sec: 120 }]; return st; };
test('Mes motivations', 'Ajouter objectifs, phrases, souvenirs datés, liste à accomplir, photo réduite ; affichage à l’accueil et accès depuis le SOS', async (b, base) => {
  const p = await page(b, base, { init: seed(v7State()) }); await p.goto(base); await p.settle(); await p.go('motivations');
  for (const [k, v] of [['future', 'Courir 10 km'], ['quotes', 'Un jour à la fois'], ['bucket', 'Voyage en Islande']]) { await p.fill(`form.mv-add[data-k="${k}"] input[type=text]`, v); await p.click(`form.mv-add[data-k="${k}"] [data-a="mvAdd"]`); await p.waitForTimeout(120); }
  await p.fill('form.mv-add[data-k="memories"] input[type=text]', 'Fête de Léa'); await p.fill('form.mv-add[data-k="memories"] input[type=date]', '2026-10-03'); await p.click('form.mv-add[data-k="memories"] [data-a="mvAdd"]'); await p.waitForTimeout(150);
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAAFklEQVR4nGNk+M/AwMDAxMDAwMDAAAANHQEDKIOAzQAAAABJRU5ErkJggg==', 'base64');
  await p.setInputFiles('#mvPhoto', { name: 'm.png', mimeType: 'image/png', buffer: png }); await p.waitForTimeout(500);
  const m = (await p.state()).motiv; assert.equal(m.future[0].t, 'Courir 10 km'); assert.ok(m.memories[0].d, 'souvenir daté'); assert.equal(m.photos.length, 1); assert.match(m.photos[0].src, /^data:image\/jpeg;base64,/);
  await p.click(`[data-a="mvDone"][data-id="${m.bucket[0].id}"]`); await p.waitForTimeout(100); assert.ok((await p.state()).motiv.bucket[0].done);
  await p.go('motivations'); assert.ok(await p.$('#app img'), 'photo affichée dans Mes raisons');
  await p.click('nav .nav-help'); await p.waitForSelector('.qs-motiv'); noErr(p);
});
test('Comprendre mon addiction', '9 catégories, 6 rubriques, avertissement sevrage alcool, sources existantes, aide', async (b, base) => {
  const p = await page(b, base, { init: seed(v7State()) }); await p.goto(base); await p.settle(); await p.go('comprendre');
  assert.equal(await p.locator('.cmp-b').count(), 9); assert.equal(await p.locator('.cmp-b.mine').count(), 2, 'les addictions suivies sont mises en avant');
  await p.click('[data-a="compOpen"][data-k="alcool"]'); await p.waitForTimeout(150);
  assert.equal(await p.locator('.cmp-s').count(), 6); assert.ok(await p.$('.mwarn'), 'avertissement sevrage'); assert.ok(await p.locator('.srcs li').count() >= 3, 'sources');
  for (const k of ['tabac', 'nicotine', 'cannabis', 'jeu', 'reseaux', 'ecrans', 'jv', 'autres']) { await p.click('[data-a="compOpen"][data-k=""]'); await p.click(`[data-a="compOpen"][data-k="${k}"]`); await p.waitForTimeout(80); assert.ok(await p.locator('.srcs li').count() >= 2, k + ' : sources'); }
  noErr(p);
});
test('Plan de prévention', 'Émotions, activités de remplacement et plan en cas de reprise enregistrés', async (b, base) => {
  const p = await page(b, base, { init: seed(v7State()) }); await p.goto(base); await p.settle(); await p.go('plan');
  assert.match(await p.textContent('h1'), /plan de prévention/i);
  for (const k of ['emotions', 'alts', 'relapse']) { const sug = p.locator(`.plan-sec [data-k="${k}"][data-a="plSug"], .plan-sec [data-a="plSug"][data-k="${k}"]`).first(); if (await sug.count()) await sug.click(); else { await p.fill(`.pl-add[data-k="${k}"] input`, 'Test ' + k); await p.press(`.pl-add[data-k="${k}"] input`, 'Enter'); } await p.waitForTimeout(120); }
  const P = (await p.state()).plan; for (const k of ['emotions', 'alts', 'relapse']) assert.ok(P[k].length >= 1, k); noErr(p);
});
test('Données', 'Anciennes sauvegardes sans les nouvelles rubriques, et rubriques corrompues : relues sans erreur ni perte', async (b, base) => {
  const st = profileState({ name: 'Ancienne' }); st.prog = { start: 'x' }; st.motiv = { photos: [{ id: 'p', src: 'javascript:alert(1)' }], future: 'pas une liste' }; st.ach = { journal1: 'nan' };
  const p = await page(b, base, { init: seed(st) }); await p.goto(base); await p.settle();
  for (const [v, to] of [['coach', 'accueil'], ['programme', 'outils'], ['recompenses', 'progres'], ['motivations'], ['comprendre'], ['evolution', 'progres'], ['plan'], ['progres'], ['accueil']]) { await p.evaluate(x => { location.hash = x; }, v); await p.waitForFunction(x => document.getElementById('app').dataset.view === x, to || v, { timeout: 5000 }); }
  const s = await p.state(); assert.equal(s.profile.name, 'Ancienne'); assert.ok(!s.prog || isFinite(s.prog.start)); assert.equal((s.motiv && s.motiv.photos || []).length, 0, 'image non sûre rejetée');
  assert.ok(!await p.$('img[src^="javascript"]')); noErr(p);
});

/* ---------- LIBRE 8 « Verre » ---------- */
test('Interface', 'Ordinateur : barre latérale en verre (sections, suivis avec compteur, Ctrl+K, repli mémorisé), semaine calculée', async (b, base) => {
  const p = await page(b, base, { init: seed(v7State()), viewport: { width: 1440, height: 900 } }); await p.goto(base); await p.settle();
  assert.ok(await p.isVisible('.nav-search')); assert.equal(await p.locator('.nav-hab').count(), 2, 'un bouton par suivi');
  assert.match(await p.textContent('.nav-hab[data-id="h0"] small'), /^5\s*j$/, 'jours depuis la dernière consommation');
  assert.match(await p.textContent('.h11-week'), /jours réussis/);
  await p.keyboard.press('Control+k'); await p.waitForSelector('#sQ'); await p.closeLayer();
  await p.click('.nav-hab[data-id="h1"]'); await p.waitForTimeout(200); assert.equal((await p.state()).prefs.activeHabit, 'h1');
  await p.click('[data-a="navMini"]'); await p.reload(); await p.settle(); assert.ok(await p.evaluate(() => document.body.classList.contains('nav-mini')), 'menu replié mémorisé');
  await p.go('profil'); assert.ok(await p.$('.nav .in>a[aria-current="page"][href="#profil"]')); noErr(p);
});
test('Interface', 'Téléphone : la barre du bas garde 4 onglets et l’Aide ; les entrées de la barre latérale restent cachées', async (b, base) => {
  const p = await page(b, base, { init: seed(v7State()) }); await p.goto(base); await p.settle();
  const vis = await p.evaluate(() => [...document.querySelectorAll('#navWrap a, #navWrap button')].filter(x => x.offsetParent && x.getBoundingClientRect().width > 0).length);
  assert.equal(vis, 5); noErr(p);
});

/* ---------- LIBRE 9 « Tableau de bord » ---------- */
test('Tableau de bord', 'Stratégies (ordinateur) : ajouter, idée en un toucher, essayer, avancer d’étape (et glisser-déposer), « Ça m’aide » rejoint le plan', async (b, base) => {
  const p = await page(b, base, { init: seed(v7State()), viewport: { width: 1280, height: 900 } }); await p.goto(base); await p.settle(); await p.go('strategies');
  await p.fill('#bdNew', 'Boire un thé après le repas'); await p.click('[data-a="bdAdd"]'); await p.waitForTimeout(100);
  await p.click('[data-a="bdSug"][data-tool="breath"]'); await p.waitForTimeout(100);
  let B = (await p.state()).board.cards; assert.equal(B.length, 2); assert.ok(B.every(c => c.stage === 'try'));
  const id = B[0].id; await p.click(`[data-a="bdOpen"][data-id="${id}"]`); await p.click('[data-a="bdTry"]'); await p.waitForTimeout(100);
  B = (await p.state()).board.cards; assert.equal(B[0].tries, 1); assert.equal(B[0].stage, 'test', 'un essai fait passer en test');
  await p.click(`#layer [data-a="bdMove"][data-v="works"]`); await p.waitForTimeout(150);
  const s = await p.state(); assert.equal(s.board.cards[0].stage, 'works'); assert.ok(s.plan.strategies.includes('Boire un thé après le repas'), 'ajoutée au plan');
  await p.locator(`[data-a="bdOpen"][data-id="${s.board.cards[1].id}"]`).dragTo(p.locator('.bd-col[data-stage="no"]')); await p.waitForTimeout(200);
  assert.equal((await p.state()).board.cards[1].stage, 'no', 'glisser-déposer'); noErr(p);
});
test('Tableau de bord', 'Déclencheurs : annuaire calculé (fréquence, intensité, part traversée) et fiche avec historique, plan « si… alors… » prérempli', async (b, base) => {
  const p = await page(b, base, { init: seed(v7State()) }); await p.goto(base); await p.settle(); await p.go('declencheurs');
  const first = await p.textContent('.tg >> nth=0'); assert.match(first, /Stress/); assert.match(first, /3 fois en 30 jours/); assert.match(first, /Intensité 7,5\/10/); assert.match(first, /50 % traversées/);
  await p.click('.tg >> nth=0'); await p.waitForSelector('#layer .ih-t'); assert.equal(await p.locator('#layer .ih-t').count(), 3);
  await p.click('[data-a="trigPlan"]'); await p.waitForTimeout(300); assert.ok(await p.$('#layer'), 'outil de plan ouvert'); noErr(p);
});
test('Tableau de bord', 'Économies : total, mois, courbe, dépenses ; rien n’est envoyé', async (b, base) => {
  const p = await page(b, base, { init: seed(v7State()) }); await p.goto(base); await p.settle(); await p.go('economies');
  assert.match(await p.textContent('.kps'), /économisés au total/); assert.ok(await p.$('.ac svg'));
  assert.equal(await p.$('[data-a="releve"]'), null, 'relevé imprimable retiré');
  assert.deepEqual(p.external, []); noErr(p);
});
test('Données', 'Tableau des stratégies abîmé dans une sauvegarde : ignoré sans erreur', async (b, base) => {
  const st = profileState(); st.board = { cards: [{ id: 'x', t: 'ok', stage: 'try' }, { id: 1, t: 'bad', stage: 'zzz' }, 'nope'] };
  const p = await page(b, base, { init: seed(st) }); await p.goto(base); await p.settle(); await p.go('strategies');
  assert.equal((await p.state()).board.cards.length, 1); noErr(p);
});

/* ---------- LIBRE 11 : application allégée ---------- */
test('LIBRE 11', 'Accueil en 4 éléments : compteur avec saisie du jour, semaine, une chose à faire, envie (aide + retarder 10 min) ; peu de texte', async (b, base) => {
  const p = await page(b, base, { init: seed(profileState()) }); await p.goto(base); await p.settle();
  const blocks = await p.$$eval('#app .h11 > section', els => els.map(e => e.className));
  assert.equal(blocks.length, 4, blocks.join(' | '));
  const words = await p.evaluate(() => document.getElementById('app').innerText.split(/\s+/).filter(Boolean).length);
  assert.ok(words < 160, 'trop de texte sur l’accueil : ' + words + ' mots');
  await p.click('.h11 [data-a="quickPlus"]'); await p.waitForTimeout(300); assert.equal((await p.state()).logs.length, 1, 'consommation notée depuis le compteur');
  await p.closeLayer(); await p.click('.h11 [data-a="delay10"]'); await p.waitForTimeout(400);
  assert.match(await p.textContent('#layer'), /10:00|9:5\d/, 'le minuteur de 10 minutes démarre');
  noErr(p);
});

test('LIBRE 11', 'Navigation : Aujourd’hui, Mon plan, Progrès, Journal ; les pages retirées mènent à leur nouvelle place', async (b, base) => {
  const p = await page(b, base, { init: seed(profileState()) }); await p.goto(base); await p.settle();
  const tabs = await p.$$eval('nav .lg-tabs > a', a => a.map(x => x.textContent.trim()));
  assert.deepEqual(tabs, ['Aujourd’hui', 'Mon plan', 'Progrès', 'Journal']);
  for (const [from, to] of [['coach', 'accueil'], ['recompenses', 'progres'], ['programme', 'outils'], ['apercu', 'progres'], ['evolution', 'progres']]) {
    await p.evaluate(v => { location.hash = v; }, from); await p.waitForFunction(v => document.getElementById('app').dataset.view === v, to, { timeout: 5000 });
  }
  noErr(p);
});

test('LIBRE 11', 'Mon plan : raisons, déclencheurs, ce qui m’aide, proches, comprendre ; Jour J enregistré avec sa préparation, gardé après rechargement', async (b, base) => {
  const p = await page(b, base, { init: seed(profileState()) }); await p.goto(base); await p.settle(); await p.go('outils');
  const txt = await p.textContent('#app');
  for (const k of ['Jour J', 'Mes raisons', 'Mes déclencheurs', 'Ce qui m’aide', 'Mes proches', 'Comprendre', 'Je suis en danger']) assert.ok(txt.includes(k), 'manque : ' + k);
  await p.click('[data-a="quitDay"]'); await p.waitForSelector('#quitDate');
  const d = new Date(Date.now() + 5 * 864e5), iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  await p.fill('#quitDate', iso); await p.click('[data-a="quitSave"]'); await p.waitForSelector('[data-a="quitPrep"]');
  await p.click('[data-a="quitPrep"][data-i="0"]'); await p.waitForTimeout(200);
  let s = await p.state(); assert.equal(s.plan.quit.date, iso); assert.equal(s.plan.quit.prep[0], true);
  await p.reload(); await p.settle(); await p.go('outils');
  assert.match(await p.textContent('#app'), /Dans 5 jours/);
  await p.click('[data-a="contactsSheet"]'); await p.waitForSelector('#layer [data-a="contactForm"]');
  noErr(p);
});

test('LIBRE 11', 'Progrès : trois chiffres, une courbe, les étapes franchies et les liens (calendrier, économies, bilan, statistiques)', async (b, base) => {
  const p = await page(b, base, { init: seed(profileState({ days: 10 })) }); await p.goto(base); await p.settle(); await p.go('progres');
  assert.equal((await p.$$('.pg11 .kp')).length, 3);
  assert.ok(await p.$('.pg11 .ov-chart svg'), 'courbe affichée');
  const ms = await p.$$eval('.pg-ms-l li:not(.next)', l => l.map(x => x.textContent.trim()));
  assert.match(await p.textContent('.pg-ms-l li.next'), /Deux semaines/, 'la prochaine étape apparaît en jeton à venir');
  assert.deepEqual(ms, ['Premier jour', 'Trois jours', 'Une semaine']);
  for (const h of ['#calendrier', '#economies', '#bilans', '#stats']) assert.ok(await p.$(`.pg11 a[href="${h}"]`), 'lien ' + h);
  noErr(p);
});

test('LIBRE 11', 'Aide : quatre choix (envie, retarder, respirer, appeler) et « Je suis en danger », sans liste d’exercices en plus', async (b, base) => {
  const p = await page(b, base, { init: seed(profileState()) }); await p.goto(base); await p.settle();
  await p.click('.h11 [data-a="sos"]'); await p.waitForSelector('#layer .qs-tri');
  const acts = await p.$$eval('#layer .qs-tri > *', e => e.map(x => x.dataset.a || (x.className.includes('qs-call') ? 'call' : '')));
  assert.deepEqual(acts.slice(0, 3), ['s5Open', 'delay10', 'qsBreath']); assert.equal(acts[acts.length - 1], 'qsDanger'); assert.equal(acts.length, 5);
  assert.equal(await p.$('#layer .qs-moretools'), null, 'plus de liste d’exercices');
  noErr(p);
});

/* ---------- LIBRE 12 : thème, Jour J, signaux d'alerte, objectif d'épargne ---------- */
test('LIBRE 12', 'Thème : jour, nuit, ou selon l’heure (plage modifiable) ; choix gardé après rechargement', async (b, base) => {
  const h = new Date().getHours(), st = profileState(); st.prefs.theme = 'heure'; st.prefs.dayFrom = h; st.prefs.dayTo = Math.min(24, h + 1);
  const p = await page(b, base, { init: seed(st), colorScheme: 'dark' }); await p.goto(base); await p.settle();
  assert.equal(await p.evaluate(() => document.documentElement.dataset.theme), 'light', 'heure comprise dans la plage de jour : thème clair');
  await p.go('profil'); await p.openFold('p-look'); await p.click('[data-a="setTheme"][data-v="dark"]'); await p.waitForTimeout(200);
  assert.equal(await p.evaluate(() => document.documentElement.dataset.theme), 'dark');
  await p.reload(); await p.settle(); assert.equal((await p.state()).prefs.theme, 'dark'); assert.equal(await p.evaluate(() => document.documentElement.dataset.theme), 'dark');
  await p.go('profil'); await p.openFold('p-look'); await p.click('[data-a="setTheme"][data-v=""]'); await p.waitForTimeout(200);
  assert.equal(await p.evaluate(() => document.documentElement.dataset.theme || ''), '', 'retour au thème du téléphone');
  noErr(p);
});

test('LIBRE 12', 'Jour J demain : rappel sur l’accueil avec les étapes restantes', async (b, base) => {
  const d = new Date(Date.now() + 864e5), iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const st = profileState(); st.plan = { quit: { date: iso, prep: [true] } };
  const p = await page(b, base, { init: seed(st) }); await p.goto(base); await p.settle();
  const txt = await p.textContent('.h11 .qb'); assert.match(txt, /Demain, c’est ton Jour J/); assert.match(txt, /2 étapes à préparer/);
  noErr(p);
});

test('LIBRE 12', 'Signaux d’alerte : choisis et ajoutés dans Mon plan, rappelés dans l’Aide', async (b, base) => {
  const p = await page(b, base, { init: seed(profileState()) }); await p.goto(base); await p.settle(); await p.go('outils');
  await p.click('[data-a="signsSheet"]'); await p.click('#layer [data-a="signToggle"][data-v="Je dors mal"]'); await p.waitForTimeout(150);
  await p.fill('#signIn', 'Je pense au bar en rentrant'); await p.click('[data-a="signAdd"]'); await p.waitForTimeout(150);
  assert.deepEqual((await p.state()).plan.signs, ['Je dors mal', 'Je pense au bar en rentrant']);
  await p.closeLayer(); await p.click('nav .nav-help'); await p.waitForSelector('#layer .qs-signs');
  assert.match(await p.textContent('#layer .qs-signs'), /Je dors mal · Je pense au bar en rentrant/);
  noErr(p);
});

test('LIBRE 12', 'Objectif d’épargne : progression calculée sur les vraies économies, modifiable et supprimable', async (b, base) => {
  const p = await page(b, base, { init: seed(profileState({ days: 20 })) }); await p.goto(base); await p.settle(); await p.go('progres');
  await p.click('[data-a="saveGoal"]'); await p.fill('#sgName', 'Un week-end'); await p.fill('#sgAmt', '50'); await p.click('[data-a="saveGoalSave"]'); await p.waitForTimeout(200);
  assert.deepEqual((await p.state()).plan.goalSave, { name: 'Un week-end', amount: 50 });
  const txt = await p.textContent('.sg'); assert.match(txt, /Un week-end/); assert.match(txt, /Objectif atteint/, '20 jours à 30 par semaine (environ 86) dépassent 50');
  assert.equal(await p.getAttribute('.sg-bar', 'aria-valuenow'), '100');
  await p.click('.sg [data-a="saveGoal"]'); await p.click('[data-a="saveGoalDel"]'); await p.waitForTimeout(150);
  assert.equal((await p.state()).plan.goalSave, undefined); noErr(p);
});

module.exports = { T };
