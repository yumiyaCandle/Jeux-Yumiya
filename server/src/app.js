// Serveur de comptes LIBRE : HTTP natif de Node, JSON uniquement.
'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const S = require('./security');
const { makeSenders, outbox } = require('./senders');

const CODE_TTL = 10 * 60e3, CODE_TRIES = 5, MAX_BODY = 4 * 1024 * 1024;
const LANGS = ['fr', 'en', 'de', 'it', 'es', 'pt'];

function createApp(cfg, db) {
  const send = makeSenders(cfg);
  const q = sql => db.prepare(sql);
  const now = () => Date.now();
  // ---------- Limitation du débit (en mémoire, par IP et par identifiant) ----------
  const buckets = new Map();
  function limited(key, max, windowMs) {
    const t = now(), b = buckets.get(key) || { n: 0, reset: t + windowMs };
    if (t > b.reset) { b.n = 0; b.reset = t + windowMs; }
    b.n++; buckets.set(key, b); return b.n > max;
  }
  setInterval(() => { const t = now(); for (const [k, b] of buckets) if (t > b.reset) buckets.delete(k); q('DELETE FROM codes WHERE expires < ?').run(t - 864e5); q('DELETE FROM sessions WHERE expires < ?').run(t); }, 60e3).unref();

  // ---------- Codes à usage unique ----------
  async function issueCode(purpose, channel, target, userId, lang) {
    if (limited(`code:${target}`, 5, 3600e3)) throw httpErr(429, 'too_many_codes');
    q('DELETE FROM codes WHERE purpose=? AND target=?').run(purpose, target);
    const cid = S.id(), code = S.code6();
    q('INSERT INTO codes(id,purpose,target,user_id,code_hash,expires,created) VALUES(?,?,?,?,?,?,?)').run(cid, purpose, target, userId || null, S.codeHash(cid, code), now() + CODE_TTL, now());
    await send.code(channel, target, code, lang);
  }
  function checkCode(purpose, target, code) {
    const row = q('SELECT * FROM codes WHERE purpose=? AND target=?').get(purpose, target);
    if (!row || row.expires < now()) throw httpErr(400, 'code_invalid');
    if (row.attempts >= CODE_TRIES) { q('DELETE FROM codes WHERE id=?').run(row.id); throw httpErr(400, 'code_invalid'); }
    if (!/^\d{6}$/.test(String(code || '')) || !S.safeEq(row.code_hash, S.codeHash(row.id, code))) { q('UPDATE codes SET attempts=attempts+1 WHERE id=?').run(row.id); throw httpErr(400, 'code_invalid'); }
    q('DELETE FROM codes WHERE id=?').run(row.id); return row;
  }
  // ---------- Sessions ----------
  function newSession(userId) {
    const tok = S.token(), t = now();
    q('INSERT INTO sessions(token_hash,user_id,created,expires,last_seen) VALUES(?,?,?,?,?)').run(S.sha256(tok), userId, t, t + cfg.sessionDays * 864e5, t);
    return tok;
  }
  function auth(req) {
    const m = /^Bearer ([A-Za-z0-9_-]{20,100})$/.exec(req.headers.authorization || ''); if (!m) throw httpErr(401, 'unauthorized');
    const h = S.sha256(m[1]), s = q('SELECT * FROM sessions WHERE token_hash=?').get(h);
    if (!s || s.expires < now()) { if (s) q('DELETE FROM sessions WHERE token_hash=?').run(h); throw httpErr(401, 'unauthorized'); }
    // Session glissante : prolongée à l'usage (au plus une écriture par heure)
    if (now() - s.last_seen > 3600e3) q('UPDATE sessions SET last_seen=?, expires=? WHERE token_hash=?').run(now(), now() + cfg.sessionDays * 864e5, h);
    const u = q('SELECT * FROM users WHERE id=?').get(s.user_id); if (!u) throw httpErr(401, 'unauthorized');
    return { user: u, tokenHash: h };
  }
  const pub = u => ({ id: u.id, email: u.email_verified ? u.email : null, emailPending: !u.email_verified && u.email ? u.email : null, phone: u.phone_verified ? u.phone : null, lang: u.lang, created: u.created, hasPassword: !!u.pw_hash });
  const lang = l => LANGS.includes(l) ? l : 'fr';
  const vaultOf = uid => { const v = q('SELECT version,blob,keys,updated FROM vaults WHERE user_id=?').get(uid); return v ? { version: v.version, blob: v.blob, keys: JSON.parse(v.keys), updated: v.updated } : null; };
  const signedIn = u => ({ token: newSession(u.id), user: pub(u), vault: vaultOf(u.id) });

  // ---------- Routes ----------
  const R = {
    'GET /v1/health': () => ({ ok: true, service: 'libre-accounts', version: 1 }),

    // Création d'un compte par e-mail : mot de passe + code envoyé à l'adresse (vérification obligatoire)
    'POST /v1/auth/email/register': async (req, b) => {
      const email = S.normEmail(b.email); if (!email) throw httpErr(400, 'email_invalid');
      if (!S.passwordOk(b.password)) throw httpErr(400, 'password_weak');
      const u = q('SELECT * FROM users WHERE email=?').get(email);
      if (u && u.email_verified) { await send.exists(email, lang(b.lang)); return { pending: true }; } // réponse identique : pas de révélation des comptes existants
      let uid = u && u.id;
      if (u) q('UPDATE users SET pw_hash=?, lang=? WHERE id=?').run(S.hashPassword(b.password), lang(b.lang), u.id);
      else { uid = S.id(); q('INSERT INTO users(id,email,pw_hash,lang,created) VALUES(?,?,?,?,?)').run(uid, email, S.hashPassword(b.password), lang(b.lang), now()); }
      await issueCode('verify_email', 'email', email, uid, lang(b.lang));
      return { pending: true };
    },
    'POST /v1/auth/email/verify': (req, b) => {
      const email = S.normEmail(b.email); if (!email) throw httpErr(400, 'email_invalid');
      const row = checkCode('verify_email', email, b.code);
      q('UPDATE users SET email_verified=1 WHERE id=?').run(row.user_id);
      return signedIn(q('SELECT * FROM users WHERE id=?').get(row.user_id));
    },
    'POST /v1/auth/email/login': async (req, b) => {
      const email = S.normEmail(b.email), u = email && q('SELECT * FROM users WHERE email=?').get(email);
      if (limited(`login:${email}`, 10, 900e3)) throw httpErr(429, 'too_many_attempts');
      const ok = S.verifyPassword(String(b.password || ''), u && u.pw_hash ? u.pw_hash : S.DUMMY);
      if (!u || !u.pw_hash || !ok) throw httpErr(401, 'credentials_invalid');
      if (!u.email_verified) { await issueCode('verify_email', 'email', email, u.id, u.lang); throw httpErr(403, 'email_unverified'); }
      return signedIn(u);
    },
    'POST /v1/auth/email/resend': async (req, b) => {
      const email = S.normEmail(b.email), u = email && q('SELECT * FROM users WHERE email=?').get(email);
      if (u && !u.email_verified) await issueCode('verify_email', 'email', email, u.id, u.lang);
      return { pending: true };
    },
    // Mot de passe oublié : code par e-mail, puis nouveau mot de passe ; toutes les sessions sont fermées
    'POST /v1/auth/email/forgot': async (req, b) => {
      const email = S.normEmail(b.email), u = email && q('SELECT * FROM users WHERE email=? AND email_verified=1').get(email);
      if (u) await issueCode('reset', 'email', email, u.id, u.lang);
      return { pending: true };
    },
    'POST /v1/auth/email/reset': (req, b) => {
      const email = S.normEmail(b.email); if (!email) throw httpErr(400, 'email_invalid');
      if (!S.passwordOk(b.password)) throw httpErr(400, 'password_weak');
      const row = checkCode('reset', email, b.code);
      q('UPDATE users SET pw_hash=? WHERE id=?').run(S.hashPassword(b.password), row.user_id);
      q('DELETE FROM sessions WHERE user_id=?').run(row.user_id);
      return signedIn(q('SELECT * FROM users WHERE id=?').get(row.user_id));
    },
    // Compte par téléphone : un code SMS crée le compte ou connecte
    'POST /v1/auth/phone/start': async (req, b) => {
      const phone = S.normPhone(b.phone); if (!phone) throw httpErr(400, 'phone_invalid');
      const u = q('SELECT * FROM users WHERE phone=?').get(phone);
      await issueCode('phone', 'sms', phone, u && u.id, lang(b.lang));
      return { pending: true };
    },
    'POST /v1/auth/phone/verify': (req, b) => {
      const phone = S.normPhone(b.phone); if (!phone) throw httpErr(400, 'phone_invalid');
      checkCode('phone', phone, b.code);
      let u = q('SELECT * FROM users WHERE phone=?').get(phone);
      if (!u) { const uid = S.id(); q('INSERT INTO users(id,phone,phone_verified,lang,created) VALUES(?,?,1,?,?)').run(uid, phone, lang(b.lang), now()); u = q('SELECT * FROM users WHERE id=?').get(uid); }
      else if (!u.phone_verified) { q('UPDATE users SET phone_verified=1 WHERE id=?').run(u.id); u.phone_verified = 1; }
      return signedIn(u);
    },
    'POST /v1/auth/logout': req => { const a = auth(req); q('DELETE FROM sessions WHERE token_hash=?').run(a.tokenHash); return { ok: true }; },
    'POST /v1/auth/logout-all': req => { const a = auth(req); q('DELETE FROM sessions WHERE user_id=?').run(a.user.id); return { ok: true }; },

    // Compte
    'GET /v1/me': req => ({ user: pub(auth(req).user) }),
    'PATCH /v1/me': (req, b) => { const a = auth(req); if (b.lang) q('UPDATE users SET lang=? WHERE id=?').run(lang(b.lang), a.user.id); return { user: pub(q('SELECT * FROM users WHERE id=?').get(a.user.id)) }; },
    'POST /v1/me/email': async (req, b) => {
      const a = auth(req), email = S.normEmail(b.email); if (!email) throw httpErr(400, 'email_invalid');
      const other = q('SELECT id FROM users WHERE email=? AND email_verified=1').get(email);
      if (other && other.id !== a.user.id) throw httpErr(409, 'email_taken');
      if (!a.user.pw_hash && !S.passwordOk(b.password)) throw httpErr(400, 'password_weak'); // un compte par téléphone qui ajoute un e-mail choisit un mot de passe
      await issueCode('change_email', 'email', email, a.user.id, a.user.lang);
      if (!a.user.pw_hash) q('UPDATE users SET pw_hash=? WHERE id=?').run(S.hashPassword(b.password), a.user.id);
      return { pending: true };
    },
    'POST /v1/me/email/confirm': (req, b) => {
      const a = auth(req), email = S.normEmail(b.email); if (!email) throw httpErr(400, 'email_invalid');
      const row = checkCode('change_email', email, b.code); if (row.user_id !== a.user.id) throw httpErr(400, 'code_invalid');
      q('UPDATE users SET email=NULL WHERE email=? AND id<>? AND email_verified=0').run(email, a.user.id);
      q('UPDATE users SET email=?, email_verified=1 WHERE id=?').run(email, a.user.id);
      return { user: pub(q('SELECT * FROM users WHERE id=?').get(a.user.id)) };
    },
    'POST /v1/me/phone': async (req, b) => {
      const a = auth(req), phone = S.normPhone(b.phone); if (!phone) throw httpErr(400, 'phone_invalid');
      const other = q('SELECT id FROM users WHERE phone=?').get(phone); if (other && other.id !== a.user.id) throw httpErr(409, 'phone_taken');
      await issueCode('change_phone', 'sms', phone, a.user.id, a.user.lang); return { pending: true };
    },
    'POST /v1/me/phone/confirm': (req, b) => {
      const a = auth(req), phone = S.normPhone(b.phone); if (!phone) throw httpErr(400, 'phone_invalid');
      const row = checkCode('change_phone', phone, b.code); if (row.user_id !== a.user.id) throw httpErr(400, 'code_invalid');
      q('UPDATE users SET phone=?, phone_verified=1 WHERE id=?').run(phone, a.user.id);
      return { user: pub(q('SELECT * FROM users WHERE id=?').get(a.user.id)) };
    },
    // Suppression définitive : compte, sessions, coffre et codes
    'DELETE /v1/me': (req, b) => {
      const a = auth(req); if (b.confirm !== 'DELETE') throw httpErr(400, 'confirm_required');
      q('DELETE FROM codes WHERE user_id=?').run(a.user.id); q('DELETE FROM users WHERE id=?').run(a.user.id);
      return { deleted: true };
    },
    // Coffre chiffré de bout en bout : le serveur ne stocke que du texte chiffré et les clés enveloppées
    'GET /v1/vault': req => ({ vault: vaultOf(auth(req).user.id) }),
    'PUT /v1/vault': (req, b) => {
      const a = auth(req);
      if (typeof b.blob !== 'string' || b.blob.length > MAX_BODY || !b.keys || typeof b.keys !== 'object') throw httpErr(400, 'vault_invalid');
      if (!/^[A-Za-z0-9+/=_.:{}",\- \[\]]+$/.test(b.blob) && !b.blob.startsWith('{')) throw httpErr(400, 'vault_invalid');
      const cur = q('SELECT version FROM vaults WHERE user_id=?').get(a.user.id), have = cur ? cur.version : 0;
      if (+b.version !== have) { const e = httpErr(409, 'version_conflict'); e.extra = { version: have }; throw e; }
      const keys = JSON.stringify(b.keys); if (keys.length > 8192) throw httpErr(400, 'vault_invalid');
      if (cur) q('UPDATE vaults SET version=?, blob=?, keys=?, updated=? WHERE user_id=?').run(have + 1, b.blob, keys, now(), a.user.id);
      else q('INSERT INTO vaults(user_id,version,blob,keys,updated) VALUES(?,?,?,?,?)').run(a.user.id, 1, b.blob, keys, now());
      return { version: have + 1 };
    },
  };
  if (cfg.env === 'test') R['GET /v1/test/outbox'] = () => ({ outbox }); // uniquement en test : lecture des codes envoyés

  // ---------- Serveur HTTP ----------
  const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2', '.jpg': 'image/jpeg', '.ico': 'image/x-icon' };
  return http.createServer(async (req, res) => {
    const origin = req.headers.origin, url = new URL(req.url, 'http://x');
    const headers = { 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer', 'X-Frame-Options': 'DENY', 'Cross-Origin-Resource-Policy': 'same-site' };
    if (cfg.production) headers['Strict-Transport-Security'] = 'max-age=63072000; includeSubDomains';
    if (origin && cfg.origins.includes(origin)) Object.assign(headers, { 'Access-Control-Allow-Origin': origin, 'Vary': 'Origin', 'Access-Control-Allow-Headers': 'Authorization, Content-Type', 'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE', 'Access-Control-Max-Age': '600' });
    const json = (code, obj) => { res.writeHead(code, Object.assign({ 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }, headers)); res.end(JSON.stringify(obj)); };
    if (req.method === 'OPTIONS') { res.writeHead(204, headers); return res.end(); }
    if (url.pathname.startsWith('/v1/')) {
      const ip = (cfg.trustProxy && String(req.headers['x-forwarded-for'] || '').split(',')[0].trim()) || req.socket.remoteAddress;
      if (cfg.production && cfg.trustProxy && req.headers['x-forwarded-proto'] !== 'https') return json(400, { error: 'https_required' });
      if (url.pathname.startsWith('/v1/auth/') && limited(`ip:${ip}`, 60, 60e3)) return json(429, { error: 'too_many_requests' });
      const fn = R[`${req.method} ${url.pathname}`]; if (!fn) return json(404, { error: 'not_found' });
      try {
        let body = {};
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
          if (req.method !== 'DELETE' && !String(req.headers['content-type'] || '').startsWith('application/json')) return json(415, { error: 'json_required' });
          let size = 0; const chunks = [];
          for await (const c of req) { size += c.length; if (size > MAX_BODY + 4096) return json(413, { error: 'too_large' }); chunks.push(c); }
          const raw = Buffer.concat(chunks).toString('utf8'); if (raw) { try { body = JSON.parse(raw); } catch (e) { return json(400, { error: 'json_invalid' }); } }
          if (!body || typeof body !== 'object' || Array.isArray(body)) body = {};
        }
        json(200, await fn(req, body));
      } catch (e) {
        if (e.status) return json(e.status, Object.assign({ error: e.message }, e.extra || {}));
        console.error(`[erreur] ${req.method} ${url.pathname} : ${e.message}`); // jamais de données personnelles dans les journaux
        json(e.message && /^(mail|sms)_/.test(e.message) ? 502 : 500, { error: e.message && /^(mail|sms)_/.test(e.message) ? 'send_failed' : 'server_error' });
      }
      return;
    }
    // Fichiers de l'app (facultatif) : même origine que l'API
    if (!cfg.staticDir) return json(404, { error: 'not_found' });
    const root = path.resolve(cfg.staticDir); let f = path.resolve(root, '.' + decodeURIComponent(url.pathname));
    if (!f.startsWith(root)) return json(403, { error: 'forbidden' });
    if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
    if (!fs.existsSync(f)) return json(404, { error: 'not_found' });
    res.writeHead(200, Object.assign({ 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-cache' }, headers));
    fs.createReadStream(f).pipe(res);
  });
}
function httpErr(status, message) { const e = new Error(message); e.status = status; return e; }
module.exports = { createApp };
