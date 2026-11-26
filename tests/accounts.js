#!/usr/bin/env node
/* Tests de bout en bout des comptes LIBRE : l'app (libre/index.html) contre le VRAI serveur de comptes (server/),
   démarré ici en mode test (e-mails et SMS gardés en mémoire, lus par le test au lieu d'être envoyés).
   Chaque « appareil » est un contexte de navigateur séparé : aucun stockage partagé.
   Lancement : node tests/accounts.js   (écrit tests/RESULTATS-COMPTES.md) */
const fs = require('fs'), os = require('os'), path = require('path');
const assert = require('assert/strict');
const H = require('./helpers'); const { launch, profileState, seed } = H; const ALL = [];
const page = async (...a) => { const p = await H.page(...a); ALL.push(p); return p; };
const { open } = require('../server/src/db');
const { createApp } = require('../server/src/app');

const T = []; const test = (name, fn) => T.push({ name, fn });
let base;
const outbox = async () => (await (await fetch(base + 'v1/test/outbox')).json()).outbox;
const lastCode = async to => { const m = (await outbox()).reverse().find(x => x.to === to); assert.ok(m, 'aucun code envoyé à ' + to); return /(\d{6})/.exec(m.text)[1]; };
const view = p => p.evaluate(() => document.getElementById('app').dataset.view);
const waitView = (p, v) => p.waitForFunction(v => document.getElementById('app').dataset.view === v, v, { timeout: 8000 });
const acct = p => p.evaluate(() => JSON.parse(localStorage.getItem('libre.acct.v1') || 'null'));
const synced = p => p.waitForFunction(() => { const a = JSON.parse(localStorage.getItem('libre.acct.v1') || 'null'); return a && a.ver >= 1 && !a.dirty; }, null, { timeout: 15000 });
const click = (p, sel) => p.locator(sel).first().click();
const confirmOk = async p => { await p.waitForSelector('#cfOk'); await p.click('#cfOk'); };
async function saveRecovery(p) {
  await p.waitForSelector('#au-rec', { timeout: 15000 }); const rec = (await p.textContent('#au-rec')).trim();
  assert.match(rec, /^([A-Z2-9]{4}-){7}[A-Z2-9]{4}$/, 'clé de récupération lisible');
  await click(p, '[data-a="authRecDone"]'); assert.equal(await view(p), 'auth', 'impossible de continuer sans confirmer avoir noté la clé');
  await p.check('#au-saved'); await click(p, '[data-a="authRecDone"]'); return rec;
}
async function emailForm(p, mode, email, pw) {
  if (mode) { const m = await p.evaluate(() => document.querySelector('[data-a="authMode"]')?.textContent || ''); if ((mode === 'login') !== /Créer un compte|Create an account/.test(m)) await click(p, '[data-a="authMode"]'); }
  await p.fill('#au-email', email); await p.fill('#au-pw', pw); await click(p, '[data-a="authSubmit"]');
}
const ctx = {};

test('Langue choisie avant l’inscription, depuis l’écran d’accueil', async (b) => {
  const p = await page(b, base); await p.goto(base); await waitView(p, 'onboarding');
  await p.waitForSelector('[data-a="acctGo"][data-m="create"]'); // le serveur est détecté : création de compte proposée
  await click(p, '.w4-lang'); await click(p, '[data-a="setLang"][data-l="en"]');
  await p.waitForFunction(() => document.querySelector('[data-a="acctGo"][data-m="create"]')?.textContent.includes('Create'));
  await click(p, '[data-a="acctGo"][data-m="create"]'); await waitView(p, 'auth');
  assert.match(await p.textContent('.au-body h1'), /Create your account/);
  await click(p, '.lang-btn'); await click(p, '[data-a="setLang"][data-l="de"]');
  await p.waitForFunction(() => /Konto/.test(document.querySelector('.au-body h1').textContent));
  assert.equal(await p.textContent('.lang-btn span'), 'DE');
});

test('Inscription par e-mail : code obligatoire, données locales migrées et chiffrées', async (b) => {
  const st = profileState({ name: 'Camille', types: ['cigarette', 'alcool'] }); st.reasons = ['Ma santé', 'Mes enfants'];
  const p = await page(b, base, { init: seed(st) }); await p.goto(base); await waitView(p, 'auth');
  assert.match(await p.textContent('.au-sub'), /transférées/, 'explique que les données actuelles seront transférées');
  await emailForm(p, 'create', 'camille@example.ch', 'court'); await p.waitForSelector('.au-err'); // le serveur refuse un mot de passe trop court
  assert.match(await p.textContent('.au-err'), /10 caractères/);
  await emailForm(p, null, 'camille@example.ch', 'un-mot-de-passe-solide');
  await p.waitForSelector('#au-code'); await p.fill('#au-code', '000000'); await click(p, '[data-a="authCode"]');
  await p.waitForSelector('.au-err'); assert.match(await p.textContent('.au-err'), /Code incorrect/);
  await p.fill('#au-code', await lastCode('camille@example.ch')); await click(p, '[data-a="authCode"]');
  ctx.recA = await saveRecovery(p); await waitView(p, 'accueil'); await synced(p);
  const a = await acct(p);
  const r = await (await fetch(base + 'v1/vault', { headers: { Authorization: 'Bearer ' + a.token } })).json();
  assert.ok(r.vault.blob.length > 200, 'coffre enregistré sur le serveur');
  assert.ok(!/Camille|cigarette|Ma santé/.test(JSON.stringify(r.vault)), 'le serveur ne reçoit que du chiffré');
  assert.ok(r.vault.keys.pw && r.vault.keys.rec, 'clé enveloppée par le mot de passe et par la clé de récupération');
  assert.equal((await p.state()).profile.name, 'Camille', 'rien n’est perdu sur cet appareil');
  ctx.pA = p;
});

test('Connexion sur un autre appareil : mêmes données, puis modification synchronisée', async (b) => {
  const p = await page(b, base); await p.goto(base); await waitView(p, 'onboarding');
  await click(p, '[data-a="acctGo"][data-m="login"]'); await waitView(p, 'auth');
  await emailForm(p, 'login', 'camille@example.ch', 'mauvais-mot-de-passe'); await p.waitForSelector('.au-err');
  assert.match(await p.textContent('.au-err'), /incorrect/);
  await emailForm(p, 'login', 'camille@example.ch', 'un-mot-de-passe-solide'); await waitView(p, 'accueil');
  const s = await p.state(); assert.equal(s.profile.name, 'Camille'); assert.equal(s.habits.length, 2); assert.deepEqual(s.reasons, ['Ma santé', 'Mes enfants']);
  // Nouvelle raison sur l'appareil 2 → visible sur l'appareil 1 après synchronisation
  await p.go('profil'); await p.openFold('p-goals'); await click(p, '[data-a="reasonForm"]'); await p.fill('#rs', 'Respirer mieux'); await click(p, '[data-a="saveReason"]');
  await p.waitForFunction(() => { const a = JSON.parse(localStorage.getItem('libre.acct.v1')); return a.ver >= 2 && !a.dirty; }, null, { timeout: 15000 });
  const p1 = ctx.pA; await p1.go('profil'); await p1.openFold('p-acct'); await click(p1, '[data-a="acctSync"]');
  await p1.waitForFunction(() => JSON.parse(localStorage.getItem('libre.v1')).reasons.includes('Respirer mieux'), null, { timeout: 10000 });
  ctx.pB = p;
});

test('Langue mémorisée par le compte et retrouvée à la connexion', async (b) => {
  const p = ctx.pB; await p.go('profil'); await p.evaluate(() => document.querySelector('[data-a="langPicker"]').click());
  await click(p, '[data-a="setLang"][data-l="it"]'); await p.waitForTimeout(600);
  const q = await page(b, base); await q.goto(base); await waitView(q, 'onboarding'); await click(q, '[data-a="acctGo"][data-m="login"]');
  await emailForm(q, 'login', 'camille@example.ch', 'un-mot-de-passe-solide'); await waitView(q, 'accueil');
  assert.equal(await q.evaluate(() => document.documentElement.lang), 'it');
});

test('Mot de passe oublié : nouveau mot de passe, données rouvertes par la clé de récupération', async (b) => {
  const p = await page(b, base); await p.goto(base); await waitView(p, 'onboarding'); await click(p, '[data-a="acctGo"][data-m="login"]');
  await click(p, '[data-a="authForgot"]'); await p.fill('#au-email', 'camille@example.ch'); await click(p, '[data-a="authForgotSend"]');
  await p.waitForSelector('#au-pw2'); await p.fill('#au-code', await lastCode('camille@example.ch')); await p.fill('#au-pw2', 'nouveau-mot-de-passe-1'); await click(p, '[data-a="authCode"]');
  await p.waitForSelector('#au-rk'); await p.fill('#au-rk', 'AAAA-BBBB-CCCC-DDDD-EEEE-FFFF-GGGG-HHHH'); await click(p, '[data-a="authUnlock"]');
  await p.waitForSelector('.au-err'); assert.match(await p.textContent('.au-err'), /ne correspond pas/);
  await p.fill('#au-rk', ctx.recA.toLowerCase()); await click(p, '[data-a="authUnlock"]'); await waitView(p, 'accueil');
  assert.equal((await p.state()).profile.name, 'Camille');
  await p.waitForFunction(() => !JSON.parse(localStorage.getItem('libre.acct.v1')).dirty, null, { timeout: 15000 });
  // Le nouveau mot de passe suffit désormais sur un nouvel appareil ; l'ancienne session a été fermée
  const q = await page(b, base); await q.goto(base); await waitView(q, 'onboarding'); await click(q, '[data-a="acctGo"][data-m="login"]');
  await emailForm(q, 'login', 'camille@example.ch', 'nouveau-mot-de-passe-1'); await waitView(q, 'accueil'); ctx.pReset = q;
  const old = await acct(ctx.pA); assert.equal((await fetch(base + 'v1/me', { headers: { Authorization: 'Bearer ' + old.token } })).status, 401);
});

test('Inscription par téléphone (SMS), puis connexion sur un autre appareil avec la clé de récupération', async (b) => {
  const p = await page(b, base, { init: seed(profileState({ name: 'Noa', types: ['cannabis'] })) }); await p.goto(base); await waitView(p, 'auth');
  await click(p, '[data-a="authCh"][data-v="phone"]'); assert.equal(await p.locator('#au-pw').count(), 0, 'aucun mot de passe exigé par SMS');
  await p.fill('#au-phone', '079 12'); await click(p, '[data-a="authSubmit"]'); await p.waitForSelector('.au-err'); assert.match(await p.textContent('.au-err'), /indicatif/);
  await p.fill('#au-phone', '+41 79 555 01 02'); await click(p, '[data-a="authSubmit"]');
  await p.waitForSelector('#au-code'); await p.fill('#au-code', await lastCode('+41795550102')); await click(p, '[data-a="authCode"]');
  const rec = await saveRecovery(p); await waitView(p, 'accueil'); await synced(p);
  const q = await page(b, base); await q.goto(base); await waitView(q, 'onboarding'); await click(q, '[data-a="acctGo"][data-m="login"]');
  await click(q, '[data-a="authCh"][data-v="phone"]'); await q.fill('#au-phone', '+41795550102'); await click(q, '[data-a="authSubmit"]');
  await q.waitForSelector('#au-code'); await q.fill('#au-code', await lastCode('+41795550102')); await click(q, '[data-a="authCode"]');
  await q.waitForSelector('#au-rk'); await q.fill('#au-rk', rec); await click(q, '[data-a="authUnlock"]'); await waitView(q, 'accueil');
  assert.equal((await q.state()).habits[0].type, 'cannabis');
  ctx.pPhone = q;
});

test('Mon compte : ajouter un e-mail à un compte téléphone', async () => {
  const p = ctx.pPhone; await p.go('profil'); await p.openFold('p-acct'); await click(p, '[data-a="acctEmail"]');
  await p.fill('#ae-email', 'noa@example.ch'); await p.fill('#ae-pw', 'mot-de-passe-de-noa'); await click(p, '[data-a="acctEmailSend"]');
  await p.waitForSelector('#ac-code'); await p.fill('#ac-code', await lastCode('noa@example.ch')); await click(p, '[data-a="acctChangeConfirm"]');
  await p.waitForFunction(() => JSON.parse(localStorage.getItem('libre.acct.v1')).email === 'noa@example.ch');
  await p.waitForFunction(() => !JSON.parse(localStorage.getItem('libre.acct.v1')).dirty, null, { timeout: 15000 });
  const r = await (await fetch(base + 'v1/auth/email/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'noa@example.ch', password: 'mot-de-passe-de-noa' }) })).json();
  assert.ok(r.vault.keys.pw, 'le mot de passe ouvre aussi les données');
});

test('Déconnexion : synchronisation puis effacement de cet appareil', async () => {
  const e = ctx.pB; await e.go('profil'); await e.openFold('p-acct'); await e.waitForSelector('[data-a="acctGo"][data-m="login"]'); // session fermée par la réinitialisation du mot de passe : reconnexion proposée
  const p = ctx.pReset; await p.go('profil'); await p.openFold('p-acct'); await click(p, '[data-a="acctLogout"]'); await confirmOk(p);
  await waitView(p, 'onboarding');
  assert.equal(await acct(p), null); const s = await p.state(); assert.ok(!s.profile, 'plus aucune donnée sur l’appareil');
});

test('Suppression définitive du compte et de ses données', async () => {
  const p = ctx.pPhone; await p.go('profil'); await p.openFold('p-acct'); await click(p, '[data-a="acctDelete"]'); await confirmOk(p);
  await waitView(p, 'onboarding'); assert.equal(await acct(p), null);
  const r = await fetch(base + 'v1/auth/email/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'noa@example.ch', password: 'mot-de-passe-de-noa' }) });
  assert.equal(r.status, 401, 'le compte n’existe plus');
});

test('Aucune erreur dans la console sur tous les appareils', async () => {
  for (const k of ['pA', 'pB', 'pPhone']) assert.deepEqual(ctx[k].errors.filter(e => !/401|409|Unauthorized/.test(e)), [], k);
});

(async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'libre-acc-'));
  const cfg = { env: 'test', origins: [], staticDir: path.join(__dirname, '..', 'libre'), trustProxy: false, sessionDays: 30, mail: { provider: 'memory' }, sms: { provider: 'memory' }, production: false };
  const srv = createApp(cfg, open(path.join(dir, 'acc.db')));
  await new Promise(r => srv.listen(0, '127.0.0.1', r)); base = `http://127.0.0.1:${srv.address().port}/`;
  const browser = await launch(); const res = [];
  for (const t of T) {
    const t0 = Date.now(); let status = 'réussi', msg = '';
    try { await Promise.race([t.fn(browser), new Promise((_, r) => setTimeout(() => r(new Error('délai dépassé (90 s)')), 90e3))]); }
    catch (e) { status = 'échoué'; msg = (e.message || String(e)).split('\n').slice(0, process.env.DEBUG ? 30 : 3).join(' '); if (process.env.DEBUG) { const lp = ALL[ALL.length - 1]; console.log(await lp.evaluate(() => document.getElementById('app').dataset.view + ' | ' + document.body.innerText.slice(0, 500)).catch(() => '?'), lp.errors); } }
    res.push({ ...t, status, msg, ms: Date.now() - t0 });
    console.log(`${status === 'réussi' ? '✔' : '✘'} ${t.name} (${Date.now() - t0} ms)${msg ? '\n    ' + msg : ''}`);
  }
  await browser.close(); srv.close();
  const ok = res.filter(r => r.status === 'réussi').length;
  let md = `# Tests des comptes (app + serveur réel)\n\nExécutés le ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC : Chromium (Playwright) contre server/ en mode test.\nLes e-mails et SMS ne sont pas envoyés : le serveur de test les garde en mémoire et le test y lit les codes. L'envoi réel exige un fournisseur e-mail et un fournisseur SMS configurés (voir server/README.md).\n\n**${ok} réussis sur ${res.length}.**\n\n| Test | Résultat | Durée |\n|---|---|---|\n`;
  for (const r of res) md += `| ${r.name} | ${r.status}${r.msg ? ' : ' + r.msg.replace(/\|/g, '/') : ''} | ${(r.ms / 1000).toFixed(1)} s |\n`;
  fs.writeFileSync(path.join(__dirname, 'RESULTATS-COMPTES.md'), md);
  process.exit(ok === res.length ? 0 : 1);
})();
