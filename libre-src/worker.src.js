/* Libre — serveur Cloudflare (Pages, mode avancé _worker.js)
 *
 * Ce fichier est la source. Il est compilé (avec le SDK Anthropic inclus) vers libre/_worker.js
 * par `npm run build` dans libre-src/. Tu n'as pas besoin de le modifier.
 *
 * Réglages à faire une seule fois dans Cloudflare (voir GUIDE-CLOUDFLARE.md) :
 *   - Liaison D1 nommée  DB                 → comptes et sauvegarde des données
 *   - Liaison Workers AI nommée  AI         → IA GRATUITE de Sam (aucune clé, quota gratuit quotidien)
 *   - Secret            ANTHROPIC_API_KEY   → (facultatif, payant) Sam avec Claude, prioritaire sur l'IA gratuite
 *   - (facultatif)      AI_MODEL            → modèle Workers AI, par défaut @cf/meta/llama-3.3-70b-instruct-fp8-fast
 *   - (facultatif)      MODEL               → modèle Claude, par défaut claude-opus-5-5
 *   - (facultatif)      CHAT_DAILY_LIMIT    → messages par jour et par personne, par défaut 200
 */
import Anthropic from "@anthropic-ai/sdk";

const DEFAULT_MODEL = "claude-opus-5-5";
const MAX_BODY = 4_000_000; // 4 Mo (photos compressées comprises)

/* ---------------- Utilitaires ---------------- */
const enc = new TextEncoder();
const json = (data, status = 200, extra = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...extra },
  });
const err = (code, status, message) => json({ error: code, message }, status);
const b64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
const randomHex = (n) => hex(crypto.getRandomValues(new Uint8Array(n)));
const sha256 = async (s) => hex(await crypto.subtle.digest("SHA-256", enc.encode(s)));
const today = () => new Date().toISOString().slice(0, 10);

async function pbkdf2(password, saltHex) {
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const salt = new Uint8Array(saltHex.match(/../g).map((h) => parseInt(h, 16)));
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations: 100000 }, key, 256);
  return b64(bits);
}
function safeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}
const normUser = (u) =>
  String(u || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
const validUser = (u) => /^[a-z0-9._@+-]{3,40}$/.test(u);
// Code de secours lisible : 4 groupes de 4 caractères sans lettres ambiguës
function recoveryCode() {
  const A = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const r = crypto.getRandomValues(new Uint8Array(16));
  let s = "";
  for (let i = 0; i < 16; i++) {
    s += A[r[i] % A.length];
    if (i % 4 === 3 && i < 15) s += "-";
  }
  return s;
}
const normCode = (c) => String(c || "").toUpperCase().replace(/[^A-Z0-9]/g, "");

async function readJSON(req) {
  const len = +req.headers.get("content-length") || 0;
  if (len > MAX_BODY) throw Object.assign(new Error("too_big"), { status: 413 });
  const t = await req.text();
  if (t.length > MAX_BODY) throw Object.assign(new Error("too_big"), { status: 413 });
  try {
    return JSON.parse(t || "{}");
  } catch {
    throw Object.assign(new Error("bad_json"), { status: 400 });
  }
}

/* ---------------- Base de données ---------------- */
let schemaReady = false;
async function db(env) {
  if (!env.DB) throw Object.assign(new Error("no_db"), { status: 503 });
  if (!schemaReady) {
    await env.DB.batch([
      env.DB.prepare(
        "CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, display TEXT, salt TEXT NOT NULL, hash TEXT NOT NULL, rec_salt TEXT, rec_hash TEXT, created INTEGER NOT NULL)"
      ),
      env.DB.prepare(
        "CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, user TEXT NOT NULL, created INTEGER NOT NULL, last INTEGER NOT NULL)"
      ),
      env.DB.prepare("CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user)"),
      env.DB.prepare(
        "CREATE TABLE IF NOT EXISTS data (user TEXT PRIMARY KEY, json TEXT NOT NULL, rev INTEGER NOT NULL, updated INTEGER NOT NULL)"
      ),
      env.DB.prepare("CREATE TABLE IF NOT EXISTS counters (k TEXT PRIMARY KEY, n INTEGER NOT NULL, exp INTEGER NOT NULL)"),
    ]);
    schemaReady = true;
  }
  return env.DB;
}

// Compteur simple (limites anti-abus). Renvoie la nouvelle valeur.
async function bump(env, key, ttlSec) {
  const D = await db(env);
  const now = Date.now();
  const row = await D.prepare("SELECT n, exp FROM counters WHERE k=?").bind(key).first();
  if (!row || row.exp < now) {
    await D.prepare("INSERT OR REPLACE INTO counters (k,n,exp) VALUES (?,?,?)").bind(key, 1, now + ttlSec * 1000).run();
    if (Math.random() < 0.02) await D.prepare("DELETE FROM counters WHERE exp < ?").bind(now).run();
    return 1;
  }
  await D.prepare("UPDATE counters SET n=n+1 WHERE k=?").bind(key).run();
  return row.n + 1;
}

async function newSession(env, user) {
  const token = randomHex(32);
  const now = Date.now();
  await (await db(env)).prepare("INSERT INTO sessions (token,user,created,last) VALUES (?,?,?,?)").bind(await sha256(token), user, now, now).run();
  return token;
}

async function auth(req, env) {
  const h = req.headers.get("authorization") || "";
  const token = h.startsWith("Bearer ") ? h.slice(7).trim() : "";
  if (!/^[0-9a-f]{64}$/.test(token)) return null;
  const D = await db(env);
  const th = await sha256(token);
  const row = await D.prepare("SELECT user, last FROM sessions WHERE token=?").bind(th).first();
  if (!row) return null;
  if (Date.now() - row.last > 6 * 3600e3) await D.prepare("UPDATE sessions SET last=? WHERE token=?").bind(Date.now(), th).run();
  return { user: row.user, th };
}

const ip = (req) => req.headers.get("cf-connecting-ip") || "local";

/* ---------------- Comptes ---------------- */
async function register(req, env) {
  const body = await readJSON(req);
  const user = normUser(body.username);
  const pw = String(body.password || "");
  if (!validUser(user)) return err("bad_username", 400, "Identifiant : 3 à 40 caractères, lettres, chiffres, point ou tiret.");
  if (pw.length < 6) return err("weak_password", 400, "Le mot de passe doit faire au moins 6 caractères.");
  if ((await bump(env, "reg:" + ip(req), 3600)) > 10) return err("rate", 429, "Trop d'essais. Réessaie dans une heure.");
  const D = await db(env);
  if (await D.prepare("SELECT id FROM users WHERE id=?").bind(user).first())
    return err("taken", 409, "Cet identifiant est déjà pris. Si c'est le tien, connecte-toi.");
  const salt = randomHex(16), recSalt = randomHex(16), code = recoveryCode();
  await D.prepare("INSERT INTO users (id,display,salt,hash,rec_salt,rec_hash,created) VALUES (?,?,?,?,?,?,?)")
    .bind(user, String(body.username).trim().slice(0, 40), salt, await pbkdf2(pw, salt), recSalt, await pbkdf2(normCode(code), recSalt), Date.now())
    .run();
  const token = await newSession(env, user);
  return json({ token, user, recovery: code });
}

async function login(req, env) {
  const body = await readJSON(req);
  const user = normUser(body.username);
  const pw = String(body.password || "");
  if ((await bump(env, "login:" + ip(req), 900)) > 30 || (await bump(env, "loginu:" + user, 900)) > 12)
    return err("rate", 429, "Trop d'essais. Attends 15 minutes puis réessaie.");
  const row = await (await db(env)).prepare("SELECT salt, hash FROM users WHERE id=?").bind(user).first();
  if (!row || !safeEqual(await pbkdf2(pw, row.salt), row.hash))
    return err("bad_credentials", 401, "Identifiant ou mot de passe incorrect.");
  return json({ token: await newSession(env, user), user });
}

async function resetWithCode(req, env) {
  const body = await readJSON(req);
  const user = normUser(body.username);
  const pw = String(body.password || "");
  if (pw.length < 6) return err("weak_password", 400, "Le mot de passe doit faire au moins 6 caractères.");
  if ((await bump(env, "reset:" + ip(req), 3600)) > 10) return err("rate", 429, "Trop d'essais. Réessaie dans une heure.");
  const D = await db(env);
  const row = await D.prepare("SELECT rec_salt, rec_hash FROM users WHERE id=?").bind(user).first();
  if (!row || !row.rec_salt || !safeEqual(await pbkdf2(normCode(body.code), row.rec_salt), row.rec_hash))
    return err("bad_code", 401, "Identifiant ou code de secours incorrect.");
  const salt = randomHex(16), recSalt = randomHex(16), code = recoveryCode();
  await D.batch([
    D.prepare("UPDATE users SET salt=?, hash=?, rec_salt=?, rec_hash=? WHERE id=?").bind(salt, await pbkdf2(pw, salt), recSalt, await pbkdf2(normCode(code), recSalt), user),
    D.prepare("DELETE FROM sessions WHERE user=?").bind(user),
  ]);
  return json({ token: await newSession(env, user), user, recovery: code });
}

async function changePassword(req, env, a) {
  const body = await readJSON(req);
  const pw = String(body.password || "");
  if (pw.length < 6) return err("weak_password", 400, "Le mot de passe doit faire au moins 6 caractères.");
  const D = await db(env);
  const row = await D.prepare("SELECT salt, hash FROM users WHERE id=?").bind(a.user).first();
  if (!row || !safeEqual(await pbkdf2(String(body.old || ""), row.salt), row.hash))
    return err("bad_credentials", 401, "Ancien mot de passe incorrect.");
  const salt = randomHex(16);
  await D.batch([
    D.prepare("UPDATE users SET salt=?, hash=? WHERE id=?").bind(salt, await pbkdf2(pw, salt), a.user),
    D.prepare("DELETE FROM sessions WHERE user=? AND token<>?").bind(a.user, a.th),
  ]);
  return json({ ok: true });
}

async function newRecovery(req, env, a) {
  const body = await readJSON(req);
  const D = await db(env);
  const row = await D.prepare("SELECT salt, hash FROM users WHERE id=?").bind(a.user).first();
  if (!row || !safeEqual(await pbkdf2(String(body.password || ""), row.salt), row.hash))
    return err("bad_credentials", 401, "Mot de passe incorrect.");
  const recSalt = randomHex(16), code = recoveryCode();
  await D.prepare("UPDATE users SET rec_salt=?, rec_hash=? WHERE id=?").bind(recSalt, await pbkdf2(normCode(code), recSalt), a.user).run();
  return json({ recovery: code });
}

async function deleteAccount(req, env, a) {
  const body = await readJSON(req);
  const D = await db(env);
  const row = await D.prepare("SELECT salt, hash FROM users WHERE id=?").bind(a.user).first();
  if (!row || !safeEqual(await pbkdf2(String(body.password || ""), row.salt), row.hash))
    return err("bad_credentials", 401, "Mot de passe incorrect.");
  await D.batch([
    D.prepare("DELETE FROM data WHERE user=?").bind(a.user),
    D.prepare("DELETE FROM sessions WHERE user=?").bind(a.user),
    D.prepare("DELETE FROM users WHERE id=?").bind(a.user),
  ]);
  return json({ ok: true });
}

/* ---------------- Données (sauvegarde) ---------------- */
async function getData(env, a) {
  const row = await (await db(env)).prepare("SELECT json, rev, updated FROM data WHERE user=?").bind(a.user).first();
  return json(row ? { data: JSON.parse(row.json), rev: row.rev, updated: row.updated, user: a.user } : { data: null, rev: 0, user: a.user });
}

async function putData(req, env, a) {
  const body = await readJSON(req);
  if (!body.data || typeof body.data !== "object") return err("bad_data", 400, "Données invalides.");
  const D = await db(env);
  const cur = await D.prepare("SELECT json, rev, updated FROM data WHERE user=?").bind(a.user).first();
  const base = +body.baseRev || 0;
  if (cur && cur.rev !== base && !body.force) {
    // Quelqu'un (un autre appareil) a sauvegardé entre-temps : le client fusionne puis renvoie.
    return json({ conflict: true, data: JSON.parse(cur.json), rev: cur.rev, updated: cur.updated }, 409);
  }
  const rev = (cur ? cur.rev : 0) + 1, now = Date.now();
  await D.prepare("INSERT OR REPLACE INTO data (user,json,rev,updated) VALUES (?,?,?,?)").bind(a.user, JSON.stringify(body.data), rev, now).run();
  return json({ ok: true, rev, updated: now });
}

/* ---------------- Coach Sam (IA) ---------------- */
const COACH_SYSTEM = `Tu es Sam, le coach de l'application Libre. Tu accompagnes des personnes qui veulent arrêter ou réduire la vape, la cigarette, le cannabis ou l'alcool. Beaucoup n'ont jamais parlé de ça à personne : tu es souvent leur premier soutien, de jour comme de nuit. Tu es une IA, tu ne prétends jamais être humain, mais tu parles comme un ami proche qui s'y connaît vraiment.

## Ton style
- Français naturel, tutoiement, phrases simples, ton chaleureux et vrai. Un peu d'humour quand l'ambiance s'y prête, jamais quand la personne va mal.
- Comme dans une vraie conversation par messages : en général 2 à 5 phrases. Plus long seulement si la personne demande un plan ou une explication.
- Varie tes formulations. Ne commence pas deux messages de suite de la même façon. Jamais de phrases toutes faites (« reste fort », « tu peux le faire », « bois de l'eau » balancé sans contexte). Pas de morale, pas de sermon, pas de culpabilisation.
- Une seule idée concrète à la fois, adaptée à ce que la personne vient de dire.
- Pas de titres ni de listes à puces dans une conversation normale. Tu peux mettre un mot en **gras** de temps en temps.

## Comment tu aides vraiment
1. Comprendre avant de conseiller : si tu ne sais pas encore ce qui se passe, pose UNE question précise et curieuse (quand, où, avec qui, ce qu'elle ressentait juste avant, ce que la substance lui apporte).
2. Refléter : montre que tu as compris en reformulant ce qu'elle vit et ressent, valide l'émotion.
3. Trouver la fonction cachée : chaque consommation répond à un besoin (se détendre, dormir, être à l'aise en groupe, s'occuper, gérer une émotion). Aide à trouver une autre façon d'y répondre.
4. Ses mots, ses raisons : fais émerger ses propres motivations. Utilise ce que tu sais d'elle (contexte et souvenirs) pour personnaliser, sans réciter ses données.
5. Du concret, sur mesure : un micro-plan précis pour SA situation, construit avec elle.
6. Pendant une envie forte : sois bref, présent, rassurant. La vague redescend en quelques minutes ; propose une seule action immédiate et reste avec elle (« dis-moi dans 5 minutes où tu en es »).
7. Après un écart : zéro jugement. Normalise, comprends ce qui s'est passé, retiens la leçon, et repars tout de suite. Un écart n'efface jamais les progrès.
8. Célèbre chaque victoire, même petite, avec les chiffres concrets du contexte (jours, argent économisé, verres évités).
9. Si la personne veut juste discuter (sa journée, un film, un souci), discute vraiment, avec intérêt. Ne ramène pas tout à l'addiction.
10. La nuit (entre minuit et 6 h), sois particulièrement doux et apaisant, phrases courtes.

Tu maîtrises sans jargon : entretien motivationnel, TCC (pensées pièges comme « juste une », plans « si… alors »), surf de l'envie, cohérence cardiaque, sommeil, déclencheurs sociaux, substituts nicotiniques (en pharmacie, sans ordonnance, le pharmacien conseille sur place), sevrage du cannabis (irritabilité, sommeil, rêves intenses 1 à 2 semaines), réduction de l'alcool (unités, jours sans, boissons alternatives).

## Outils de l'app
Tu peux proposer un outil en ajoutant à la toute fin UNE seule balise, seulement si c'est vraiment utile : [[respirer]] (respiration guidée), [[vague]] (laisser passer l'envie), [[raisons]] (ses raisons), [[symptomes]] (ce que je ressens), [[plan]] (plan anti-envies), [[ancrage]] (exercice 5-4-3-2-1 pour l'anxiété), [[sons]] (sons apaisants pour dormir ou se calmer), [[allie]] (écrire à la personne de confiance).

## Mémoire
Si la personne t'apprend quelque chose d'important et durable sur elle (situation de vie, déclencheur précis, ce qui l'aide, un événement à venir, un prénom de proche), ajoute à la toute fin une ligne au format [[note: fait court en 12 mots maximum]]. Au plus une note par message, seulement si c'est nouveau. La personne ne voit pas ces balises.

## Sécurité, sans être alarmiste
- Jamais de dosage de médicament ni de substance.
- Alcool : quelqu'un qui boit beaucoup tous les jours doit réduire progressivement avec un médecin plutôt qu'arrêter net. Tremblements importants, confusion, hallucinations ou convulsions = urgence, appeler le 144.
- Si la personne parle de mourir, de se faire du mal ou de ne plus en pouvoir : reste chaleureux et présent, prends-la au sérieux, encourage clairement à appeler La Main Tendue au 143 (gratuit, 24 h/24) ou le 144 en cas de danger immédiat.
- Pas de diagnostic médical. Pour un symptôme physique inquiétant qui dure, suggère d'en parler à un pharmacien ou un médecin.
- Les numéros d'aide sont suisses (143, 144, Stop-tabac 0848 000 181, SafeZone.ch).`;

function cleanMessages(list) {
  const out = [];
  for (const m of (Array.isArray(list) ? list : []).slice(-24)) {
    const role = m && m.role === "assistant" ? "assistant" : "user";
    const content = String((m && m.content) || "").slice(0, 3000).trim();
    if (!content) continue;
    if (out.length && out[out.length - 1].role === role) out[out.length - 1].content += "\n\n" + content;
    else out.push({ role, content });
  }
  while (out.length && out[0].role !== "user") out.shift();
  while (out.length && out[out.length - 1].role !== "user") out.pop();
  return out;
}

async function chat(req, env, ctx) {
  if (!env.ANTHROPIC_API_KEY && !env.AI) return err("ai_off", 503, "L'IA n'est pas configurée sur le serveur.");
  const body = await readJSON(req);
  const messages = cleanMessages(body.messages);
  if (!messages.length) return err("bad_messages", 400, "Message vide.");
  const a = env.DB ? await auth(req, env).catch(() => null) : null;
  const limit = +env.CHAT_DAILY_LIMIT || 200;
  if (env.DB) {
    const n = await bump(env, "chat:" + today() + ":" + (a ? "u:" + a.user : "ip:" + ip(req)), 86400);
    if (n > limit) return err("quota", 429, "Sam a beaucoup parlé aujourd'hui. Il revient demain, et les outils SOS restent disponibles.");
  }
  const context = String(body.context || "").slice(0, 6000);
  if (!env.ANTHROPIC_API_KEY) return freeChat(env, ctx, messages, context);
  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY, maxRetries: 2, ...(env.ANTHROPIC_BASE_URL ? { baseURL: env.ANTHROPIC_BASE_URL } : {}) });

  const { readable, writable } = new TransformStream();
  const w = writable.getWriter();
  const run = (async () => {
    let wrote = false;
    try {
      const stream = client.beta.messages.stream({
        model: env.MODEL || DEFAULT_MODEL,
        max_tokens: 4000,
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        output_config: { effort: "low" },
        system: [
          { type: "text", text: COACH_SYSTEM, cache_control: { type: "ephemeral" } },
          { type: "text", text: "Contexte de la personne (à jour, fourni par l'app) :\n" + context },
        ],
        messages,
      });
      for await (const ev of stream) {
        if (ev.type === "content_block_delta" && ev.delta && ev.delta.type === "text_delta") {
          wrote = true;
          await w.write(enc.encode(ev.delta.text));
        }
      }
      const final = await stream.finalMessage();
      if (final.stop_reason === "refusal" && !wrote)
        await w.write(enc.encode("Je préfère ne pas répondre à ça, mais je suis toujours là pour toi. On parle d'autre chose ?"));
    } catch (e) {
      console.error("chat error", e && (e.status || ""), e && e.message);
      if (!wrote) await w.write(enc.encode("\u0000ERR"));
    } finally {
      try {
        await w.close();
      } catch {}
    }
  })();
  ctx.waitUntil(run);
  return new Response(readable, {
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store", "x-accel-buffering": "no" },
  });
}

/* ---------------- IA gratuite : Cloudflare Workers AI (liaison « AI », sans clé) ---------------- */
const FREE_MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";
const FREE_EXTRA = `

## Règles très importantes
- Réponds UNIQUEMENT en français, en tutoyant, comme un message de téléphone : 2 à 5 phrases courtes, chaleureuses et naturelles.
- Ne récite jamais le contexte. Pas de listes, pas de titres.
- N'écris une balise [[...]] que si elle est vraiment utile, une seule, à la toute fin.`;
function freeChat(env, ctx, messages, context) {
  const { readable, writable } = new TransformStream();
  const w = writable.getWriter();
  const run = (async () => {
    let wrote = false;
    try {
      const res = await env.AI.run(env.AI_MODEL || FREE_MODEL, {
        messages: [{ role: "system", content: COACH_SYSTEM + FREE_EXTRA + "\n\nContexte de la personne (à jour, fourni par l'app) :\n" + context }, ...messages.slice(-12)],
        max_tokens: 700,
        temperature: 0.7,
        stream: true,
      });
      if (res && typeof res.getReader === "function") {
        const rd = res.getReader(), dec = new TextDecoder();
        let buf = "";
        for (;;) {
          const { done, value } = await rd.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          let i;
          while ((i = buf.indexOf("\n")) >= 0) {
            const line = buf.slice(0, i).trim();
            buf = buf.slice(i + 1);
            if (!line.startsWith("data:")) continue;
            const data = line.slice(5).trim();
            if (!data || data === "[DONE]") continue;
            try {
              const j = JSON.parse(data);
              const piece = typeof j.response === "string" ? j.response : (j.choices && j.choices[0] && j.choices[0].delta && j.choices[0].delta.content) || "";
              if (piece) { wrote = true; await w.write(enc.encode(piece)); }
            } catch {}
          }
        }
      } else {
        const text = (res && (res.response || (res.choices && res.choices[0] && res.choices[0].message && res.choices[0].message.content))) || "";
        if (text) { wrote = true; await w.write(enc.encode(text)); }
      }
      if (!wrote) throw new Error("empty");
    } catch (e) {
      console.error("free chat error", e && e.message);
      if (!wrote) await w.write(enc.encode("\u0000ERR"));
    } finally {
      try { await w.close(); } catch {}
    }
  })();
  ctx.waitUntil(run);
  return new Response(readable, { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" } });
}

/* ---------------- Routeur ---------------- */
export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    if (!url.pathname.startsWith("/api/")) return env.ASSETS.fetch(req);
    if (req.method === "OPTIONS") return new Response(null, { status: 204 });
    // Même origine uniquement pour les écritures
    const origin = req.headers.get("origin");
    if (req.method !== "GET" && origin && new URL(origin).host !== url.host) return err("origin", 403, "Origine refusée.");
    try {
      const p = url.pathname.replace(/\/+$/, ""), m = req.method;
      if (p === "/api/status" && m === "GET") return json({ ok: true, ai: !!(env.ANTHROPIC_API_KEY || env.AI), engine: env.ANTHROPIC_API_KEY ? "claude" : env.AI ? "cloudflare" : "offline", accounts: !!env.DB });
      if (p === "/api/chat" && m === "POST") return await chat(req, env, ctx);
      if (p === "/api/register" && m === "POST") return await register(req, env);
      if (p === "/api/login" && m === "POST") return await login(req, env);
      if (p === "/api/reset" && m === "POST") return await resetWithCode(req, env);
      const a = await auth(req, env);
      if (!a) return err("auth", 401, "Session expirée. Reconnecte-toi.");
      if (p === "/api/data" && m === "GET") return await getData(env, a);
      if (p === "/api/data" && m === "PUT") return await putData(req, env, a);
      if (p === "/api/logout" && m === "POST") {
        await (await db(env)).prepare("DELETE FROM sessions WHERE token=?").bind(a.th).run();
        return json({ ok: true });
      }
      if (p === "/api/password" && m === "POST") return await changePassword(req, env, a);
      if (p === "/api/recovery" && m === "POST") return await newRecovery(req, env, a);
      if (p === "/api/account" && m === "DELETE") return await deleteAccount(req, env, a);
      return err("not_found", 404, "Introuvable.");
    } catch (e) {
      const s = (e && e.status) || 500;
      if (s === 503) return err("no_db", 503, "La sauvegarde en ligne n'est pas encore activée : dans Cloudflare, ajoute la liaison D1 nommée DB.");
      if (s === 500) console.error(e);
      return err(e.message || "error", s, s === 413 ? "Données trop volumineuses." : "Erreur serveur, réessaie.");
    }
  },
};
