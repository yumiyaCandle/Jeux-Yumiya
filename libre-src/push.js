/* Libre — notifications push (Web Push, RFC 8291 + VAPID RFC 8292), sans dépendance.
 * Les clés VAPID sont générées automatiquement et gardées dans la base D1 : rien à configurer. */

const enc = new TextEncoder();
export const b64u = (buf) => {
  const b = new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};
export const unb64u = (s) => {
  s = String(s).replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  const bin = atob(s);
  const u = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  return u;
};
const concat = (...arrs) => {
  const n = arrs.reduce((a, x) => a + x.length, 0);
  const out = new Uint8Array(n);
  let o = 0;
  for (const x of arrs) { out.set(x, o); o += x.length; }
  return out;
};

async function hkdf(salt, ikm, info, len) {
  const key = await crypto.subtle.importKey("raw", ikm, "HKDF", false, ["deriveBits"]);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: "HKDF", hash: "SHA-256", salt, info }, key, len * 8));
}

/* Chiffrement du message pour un abonné (aes128gcm) */
export async function encryptPayload(p256dhB64, authB64, payload) {
  const uaPublic = unb64u(p256dhB64);
  const authSecret = unb64u(authB64);
  const as = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]);
  const asPublic = new Uint8Array(await crypto.subtle.exportKey("raw", as.publicKey));
  const uaKey = await crypto.subtle.importKey("raw", uaPublic, { name: "ECDH", namedCurve: "P-256" }, false, []);
  const ecdh = new Uint8Array(await crypto.subtle.deriveBits({ name: "ECDH", public: uaKey }, as.privateKey, 256));
  const ikm = await hkdf(authSecret, ecdh, concat(enc.encode("WebPush: info\0"), uaPublic, asPublic), 32);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const cek = await hkdf(salt, ikm, enc.encode("Content-Encoding: aes128gcm\0"), 16);
  const nonce = await hkdf(salt, ikm, enc.encode("Content-Encoding: nonce\0"), 12);
  const key = await crypto.subtle.importKey("raw", cek, "AES-GCM", false, ["encrypt"]);
  const plain = concat(enc.encode(payload), new Uint8Array([2]));
  const cipher = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, key, plain));
  const header = new Uint8Array(21 + asPublic.length);
  header.set(salt, 0);
  new DataView(header.buffer).setUint32(16, 4096);
  header[20] = asPublic.length;
  header.set(asPublic, 21);
  return concat(header, cipher);
}

/* Clés VAPID (créées une fois, stockées dans D1) */
let vapidCache = null;
export async function vapid(D) {
  if (vapidCache) return vapidCache;
  await D.prepare("CREATE TABLE IF NOT EXISTS kv (k TEXT PRIMARY KEY, v TEXT NOT NULL)").run();
  let row = await D.prepare("SELECT v FROM kv WHERE k='vapid'").first();
  if (!row) {
    const kp = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]);
    const jwk = await crypto.subtle.exportKey("jwk", kp.privateKey);
    const pub = b64u(await crypto.subtle.exportKey("raw", kp.publicKey));
    await D.prepare("INSERT OR IGNORE INTO kv (k,v) VALUES ('vapid',?)").bind(JSON.stringify({ jwk, pub })).run();
    row = await D.prepare("SELECT v FROM kv WHERE k='vapid'").first();
  }
  const v = JSON.parse(row.v);
  const key = await crypto.subtle.importKey("jwk", v.jwk, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
  vapidCache = { pub: v.pub, key };
  return vapidCache;
}

async function vapidHeader(D, endpoint, subject) {
  const v = await vapid(D);
  const aud = new URL(endpoint).origin;
  const h = b64u(enc.encode(JSON.stringify({ typ: "JWT", alg: "ES256" })));
  const p = b64u(enc.encode(JSON.stringify({ aud, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: subject })));
  const sig = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, v.key, enc.encode(h + "." + p));
  return `vapid t=${h}.${p}.${b64u(sig)}, k=${v.pub}`;
}

/* Envoie une notification. Renvoie le code HTTP du service de push. */
export async function sendPush(D, sub, data, subject) {
  const body = await encryptPayload(sub.p256dh, sub.auth, JSON.stringify(data));
  const res = await fetch(sub.endpoint, {
    method: "POST",
    headers: {
      Authorization: await vapidHeader(D, sub.endpoint, subject),
      "Content-Encoding": "aes128gcm",
      "Content-Type": "application/octet-stream",
      TTL: "43200",
      Urgency: "normal",
    },
    body,
  });
  return res.status;
}
