// Tests du serveur de comptes : node --test server/test/
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const os = require('node:os'), fs = require('node:fs'), path = require('node:path');
const { open } = require('../src/db');
const { createApp } = require('../src/app');
const { outbox } = require('../src/senders');
const S = require('../src/security');

const cfg = { env: 'test', origins: ['capacitor://localhost'], staticDir: '', trustProxy: false, sessionDays: 30, mail: { provider: 'memory' }, sms: { provider: 'memory' }, production: false };
let base, server;
test.before(async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'libre-srv-'));
  server = createApp(cfg, open(path.join(dir, 't.db')));
  await new Promise(r => server.listen(0, '127.0.0.1', r)); base = `http://127.0.0.1:${server.address().port}`;
});
test.after(() => server.close());
const call = async (method, p, body, token) => {
  const r = await fetch(base + p, { method, headers: Object.assign(body ? { 'Content-Type': 'application/json' } : {}, token ? { Authorization: 'Bearer ' + token } : {}), body: body ? JSON.stringify(body) : undefined });
  return { status: r.status, body: await r.json(), headers: r.headers };
};
const lastCode = to => { const m = [...outbox].reverse().find(x => x.to === to); return m && /(\d{6})/.exec(m.text)[1]; };

test('mots de passe : scrypt salé, vérification en temps constant', () => {
  const h = S.hashPassword('un mot de passe long'); assert.match(h, /^scrypt\$32768\$8\$1\$/);
  assert.ok(S.verifyPassword('un mot de passe long', h)); assert.ok(!S.verifyPassword('mauvais mot de passe', h));
  assert.notEqual(S.hashPassword('x'.repeat(10)), S.hashPassword('x'.repeat(10)), 'sel aléatoire');
});

test('compte e-mail : inscription, code obligatoire, connexion, session', async () => {
  let r = await call('POST', '/v1/auth/email/register', { email: 'Alice@Example.ch', password: 'court' }); assert.equal(r.body.error, 'password_weak');
  r = await call('POST', '/v1/auth/email/register', { email: 'Alice@Example.ch', password: 'motdepasse-solide', lang: 'fr' }); assert.equal(r.status, 200);
  r = await call('POST', '/v1/auth/email/login', { email: 'alice@example.ch', password: 'motdepasse-solide' }); assert.equal(r.body.error, 'email_unverified', 'connexion impossible avant vérification');
  r = await call('POST', '/v1/auth/email/verify', { email: 'alice@example.ch', code: '000000' }); assert.equal(r.body.error, 'code_invalid');
  r = await call('POST', '/v1/auth/email/verify', { email: 'alice@example.ch', code: lastCode('alice@example.ch') }); assert.equal(r.status, 200); assert.ok(r.body.token);
  assert.equal(r.body.user.email, 'alice@example.ch'); assert.equal(r.body.vault, null);
  r = await call('POST', '/v1/auth/email/login', { email: 'alice@example.ch', password: 'faux-mot-de-passe' }); assert.equal(r.status, 401);
  r = await call('POST', '/v1/auth/email/login', { email: 'alice@example.ch', password: 'motdepasse-solide' }); assert.equal(r.status, 200);
  const me = await call('GET', '/v1/me', null, r.body.token); assert.equal(me.body.user.email, 'alice@example.ch');
  assert.equal(me.headers.get('cache-control'), 'no-store');
  await call('POST', '/v1/auth/logout', {}, r.body.token);
  assert.equal((await call('GET', '/v1/me', null, r.body.token)).status, 401, 'session révoquée à la déconnexion');
});

test('codes : 5 essais au plus, puis le code est détruit', async () => {
  await call('POST', '/v1/auth/phone/start', { phone: '+41 79 000 00 01' }); const good = lastCode('+41790000001');
  for (let i = 0; i < 5; i++) assert.equal((await call('POST', '/v1/auth/phone/verify', { phone: '+41790000001', code: '111111' })).status, 400);
  assert.equal((await call('POST', '/v1/auth/phone/verify', { phone: '+41790000001', code: good })).status, 400, 'bon code refusé après 5 échecs');
});

test('compte téléphone : code SMS crée puis reconnecte le même compte', async () => {
  await call('POST', '/v1/auth/phone/start', { phone: '0041 79 123 45 67' });
  let r = await call('POST', '/v1/auth/phone/verify', { phone: '+41791234567', code: lastCode('+41791234567') }); assert.equal(r.status, 200);
  const uid = r.body.user.id; assert.equal(r.body.user.phone, '+41791234567'); assert.equal(r.body.user.email, null);
  await call('POST', '/v1/auth/phone/start', { phone: '+41791234567' });
  r = await call('POST', '/v1/auth/phone/verify', { phone: '+41791234567', code: lastCode('+41791234567') }); assert.equal(r.body.user.id, uid);
});

test('coffre : chiffré côté appareil, versions, conflit détecté, séparation entre comptes', async () => {
  await call('POST', '/v1/auth/phone/start', { phone: '+41790000002' }); const a = (await call('POST', '/v1/auth/phone/verify', { phone: '+41790000002', code: lastCode('+41790000002') })).body.token;
  await call('POST', '/v1/auth/phone/start', { phone: '+41790000003' }); const b = (await call('POST', '/v1/auth/phone/verify', { phone: '+41790000003', code: lastCode('+41790000003') })).body.token;
  let r = await call('PUT', '/v1/vault', { version: 0, blob: '{"v":1,"iv":"aa","ct":"bb"}', keys: { rec: { s: 'x' } } }, a); assert.equal(r.body.version, 1);
  r = await call('PUT', '/v1/vault', { version: 0, blob: '{"v":1,"iv":"aa","ct":"cc"}', keys: {} }, a); assert.equal(r.status, 409); assert.equal(r.body.version, 1);
  assert.equal((await call('GET', '/v1/vault', null, b)).body.vault, null, 'B ne voit pas le coffre de A');
  assert.equal((await call('GET', '/v1/vault', null, a)).body.vault.blob, '{"v":1,"iv":"aa","ct":"bb"}');
  assert.equal((await call('GET', '/v1/vault')).status, 401);
});

test('mot de passe oublié : code, nouveau mot de passe, anciennes sessions fermées ; aucune révélation des comptes', async () => {
  await call('POST', '/v1/auth/email/register', { email: 'bob@example.ch', password: 'ancien-mot-de-passe' });
  const t0 = (await call('POST', '/v1/auth/email/verify', { email: 'bob@example.ch', code: lastCode('bob@example.ch') })).body.token;
  assert.deepEqual((await call('POST', '/v1/auth/email/forgot', { email: 'inconnu@example.ch' })).body, { pending: true });
  await call('POST', '/v1/auth/email/forgot', { email: 'bob@example.ch' });
  const r = await call('POST', '/v1/auth/email/reset', { email: 'bob@example.ch', code: lastCode('bob@example.ch'), password: 'nouveau-mot-de-passe' }); assert.equal(r.status, 200);
  assert.equal((await call('GET', '/v1/me', null, t0)).status, 401);
  assert.equal((await call('POST', '/v1/auth/email/login', { email: 'bob@example.ch', password: 'nouveau-mot-de-passe' })).status, 200);
  // Réinscription d'une adresse déjà utilisée : même réponse, e-mail d'information au titulaire
  const r2 = await call('POST', '/v1/auth/email/register', { email: 'bob@example.ch', password: 'tentative-pirate' }); assert.deepEqual(r2.body, { pending: true });
  assert.equal((await call('POST', '/v1/auth/email/login', { email: 'bob@example.ch', password: 'tentative-pirate' })).status, 401, 'le mot de passe du titulaire n’est pas remplacé');
});

test('changer d’e-mail, ajouter un téléphone, supprimer le compte et toutes ses données', async () => {
  await call('POST', '/v1/auth/phone/start', { phone: '+41790000004' }); const tok = (await call('POST', '/v1/auth/phone/verify', { phone: '+41790000004', code: lastCode('+41790000004') })).body.token;
  await call('POST', '/v1/me/email', { email: 'carla@example.ch', password: 'mot-de-passe-carla' }, tok);
  let r = await call('POST', '/v1/me/email/confirm', { email: 'carla@example.ch', code: lastCode('carla@example.ch') }, tok); assert.equal(r.body.user.email, 'carla@example.ch');
  assert.equal((await call('POST', '/v1/auth/email/login', { email: 'carla@example.ch', password: 'mot-de-passe-carla' })).status, 200);
  await call('PUT', '/v1/vault', { version: 0, blob: '{"v":1}', keys: {} }, tok);
  assert.equal((await call('DELETE', '/v1/me', {}, tok)).status, 400, 'confirmation exigée');
  assert.equal((await call('DELETE', '/v1/me', { confirm: 'DELETE' }, tok)).body.deleted, true);
  assert.equal((await call('GET', '/v1/me', null, tok)).status, 401);
  assert.equal((await call('POST', '/v1/auth/email/login', { email: 'carla@example.ch', password: 'mot-de-passe-carla' })).status, 401);
});

test('protections HTTP : CORS limité, JSON obligatoire, limitation des envois de codes', async () => {
  let r = await fetch(base + '/v1/health', { headers: { Origin: 'https://site-malveillant.example' } }); assert.equal(r.headers.get('access-control-allow-origin'), null);
  r = await fetch(base + '/v1/health', { headers: { Origin: 'capacitor://localhost' } }); assert.equal(r.headers.get('access-control-allow-origin'), 'capacitor://localhost');
  assert.equal(r.headers.get('x-content-type-options'), 'nosniff');
  r = await fetch(base + '/v1/auth/phone/start', { method: 'POST', body: 'phone=1' }); assert.equal(r.status, 415);
  let last; for (let i = 0; i < 7; i++) last = await call('POST', '/v1/auth/phone/start', { phone: '+41790000099' });
  assert.equal(last.status, 429, 'au plus 5 codes par heure et par numéro');
});
