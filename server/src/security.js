// Primitives de sécurité : uniquement le module crypto de Node (aucun algorithme maison).
'use strict';
const crypto = require('node:crypto');
const SCRYPT = { N: 32768, r: 8, p: 1, keylen: 64, maxmem: 96 * 1024 * 1024 };
function hashPassword(pw) {
  const salt = crypto.randomBytes(16);
  const h = crypto.scryptSync(pw, salt, SCRYPT.keylen, { N: SCRYPT.N, r: SCRYPT.r, p: SCRYPT.p, maxmem: SCRYPT.maxmem });
  return `scrypt$${SCRYPT.N}$${SCRYPT.r}$${SCRYPT.p}$${salt.toString('base64')}$${h.toString('base64')}`;
}
function verifyPassword(pw, stored) {
  try {
    const [alg, N, r, p, salt, hash] = String(stored).split('$'); if (alg !== 'scrypt') return false;
    const want = Buffer.from(hash, 'base64');
    const got = crypto.scryptSync(pw, Buffer.from(salt, 'base64'), want.length, { N: +N, r: +r, p: +p, maxmem: SCRYPT.maxmem });
    return crypto.timingSafeEqual(want, got);
  } catch (e) { return false; }
}
// Mot de passe factice : même durée de calcul quand le compte n'existe pas (pas d'indice par le temps de réponse)
const DUMMY = hashPassword(crypto.randomBytes(12).toString('hex'));
const sha256 = s => crypto.createHash('sha256').update(s).digest('hex');
const token = (n = 32) => crypto.randomBytes(n).toString('base64url');
const id = () => crypto.randomUUID();
const code6 = () => String(crypto.randomInt(0, 1000000)).padStart(6, '0');
const codeHash = (cid, code) => sha256(cid + ':' + code);
const safeEq = (a, b) => { const x = Buffer.from(String(a)), y = Buffer.from(String(b)); return x.length === y.length && crypto.timingSafeEqual(x, y); };
// Normalisation et validation des identifiants
function normEmail(e) { e = String(e || '').trim().toLowerCase(); return e.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e) ? e : null; }
function normPhone(p) { p = String(p || '').replace(/[\s().-]/g, ''); if (p.startsWith('00')) p = '+' + p.slice(2); return /^\+[1-9]\d{6,14}$/.test(p) ? p : null; }
function passwordOk(pw) { return typeof pw === 'string' && pw.length >= 10 && pw.length <= 200; }
module.exports = { hashPassword, verifyPassword, DUMMY, sha256, token, id, code6, codeHash, safeEq, normEmail, normPhone, passwordOk };
