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
import { vapid, sendPush } from "./push.js";

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
    D.prepare("CREATE TABLE IF NOT EXISTS invites (token TEXT PRIMARY KEY, user TEXT NOT NULL UNIQUE, created INTEGER NOT NULL)"),
    D.prepare("CREATE TABLE IF NOT EXISTS words (id INTEGER PRIMARY KEY AUTOINCREMENT, user TEXT NOT NULL, from_name TEXT NOT NULL, msg TEXT NOT NULL, created INTEGER NOT NULL)"),
    D.prepare("DELETE FROM invites WHERE user=?").bind(a.user),
    D.prepare("DELETE FROM words WHERE user=?").bind(a.user),
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
Tu peux proposer un outil en ajoutant à la toute fin UNE seule balise, seulement si c'est vraiment utile : [[respirer]] (respiration guidée), [[vague]] (laisser passer l'envie), [[raisons]] (ses raisons), [[symptomes]] (ce que je ressens), [[plan]] (plan anti-envies), [[ancrage]] (exercice 5-4-3-2-1 pour l'anxiété), [[sons]] (sons apaisants pour dormir ou se calmer), [[allie]] (écrire à la personne de confiance), [[alcool]] (plan sécurité alcool et préparer un rendez-vous médecin), [[soiree]] (phrases pour dire non, boissons sans alcool, plan de soirée), [[decoder]] (exercice guidé pour comprendre une envie et le vrai besoin derrière), [[idee]] (une idée au hasard de quoi faire à la place), [[pieges]] (cartes « pensées pièges » et quoi leur répondre), et des techniques guidées validées : [[tipp]] (DBT, envie très forte, 3 min), [[surf]] (surf de l'envie, Marlatt, 4 min), [[film]] (dérouler le film, TCC), [[halt]] (faim, colère, solitude, fatigue), [[stop]] (DBT, avant d'agir sur un coup de tête), [[balance]] (balance décisionnelle, entretien motivationnel), [[compassion]] (auto-compassion après un écart), [[relax]] (relaxation musculaire de Jacobson). Privilégie ces techniques qu'elle peut faire seule ; ne renvoie vers un numéro d'aide que si c'est vraiment nécessaire (danger, idées noires, symptômes de sevrage graves).

## Mémoire
Si la personne t'apprend quelque chose d'important et durable sur elle (situation de vie, déclencheur précis, ce qui l'aide, un événement à venir, un prénom de proche), ajoute à la toute fin une ligne au format [[note: fait court en 12 mots maximum]]. Au plus une note par message, seulement si c'est nouveau. La personne ne voit pas ces balises.

## Sécurité, sans être alarmiste
- Jamais de dosage de médicament ni de substance.
- Alcool : quelqu'un qui boit beaucoup tous les jours doit réduire progressivement avec un médecin plutôt qu'arrêter net. Tremblements importants, confusion, hallucinations ou convulsions = urgence, appeler le 144.
- Si la personne parle de mourir, de se faire du mal ou de ne plus en pouvoir : reste chaleureux et présent, prends-la au sérieux, encourage clairement à contacter le 147 (Pro Juventute, pour les jeunes, appel, SMS ou chat, gratuit, 24 h/24) ou La Main Tendue au 143, et le 144 en cas de danger immédiat.
- La personne est probablement jeune (16-18 ans). Adapte ton ton, sans infantiliser. Ne minimise jamais l'alcool. La dépendance à l'alcool est une maladie qui se soigne, pas un manque de volonté : dis-le avec douceur, et encourage à en parler à un médecin (médecin de famille, pédiatre) ou au 147. Pour les soirées et la pression des potes, aide-la à préparer des phrases pour dire non et un plan concret.
- Pas de diagnostic médical. Pour un symptôme physique inquiétant qui dure, suggère d'en parler à un pharmacien ou un médecin.
- Les numéros d'aide sont suisses (147 pour les jeunes, 143, 144, Stop-tabac 0848 000 181, SafeZone.ch, addictionsuisse.ch).`;

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

/* ---------------- Rappels quotidiens (notifications push) ---------------- */
async function pushTable(env) {
  const D = await db(env);
  await D.prepare("CREATE TABLE IF NOT EXISTS push_subs (endpoint TEXT PRIMARY KEY, p256dh TEXT NOT NULL, auth TEXT NOT NULL, user TEXT, name TEXT, tz TEXT, prefs TEXT, last TEXT, created INTEGER, site TEXT)").run();
  return D;
}
const HM = /^([01]\d|2[0-3]):[0-5]\d$/;
function cleanPrefs(p) {
  const o = {};
  for (const k of ["morning", "evening", "risk"]) o[k] = p && HM.test(p[k]) ? p[k] : null;
  return o;
}
async function pushSubscribe(req, env) {
  const body = await readJSON(req);
  const s = body.sub || {};
  const keys = s.keys || {};
  if (!/^https:\/\//.test(s.endpoint || "") || !keys.p256dh || !keys.auth) return err("bad_sub", 400, "Abonnement invalide.");
  if ((await bump(env, "psub:" + ip(req), 3600)) > 30) return err("rate", 429, "Trop d'essais.");
  const D = await pushTable(env);
  const a = await auth(req, env).catch(() => null);
  let tz = String(body.tz || "Europe/Zurich").slice(0, 60);
  try { new Intl.DateTimeFormat("fr-CH", { timeZone: tz }); } catch { tz = "Europe/Zurich"; }
  const site = new URL(req.url).origin;
  await D.prepare("INSERT INTO push_subs (endpoint,p256dh,auth,user,name,tz,prefs,last,created,site) VALUES (?,?,?,?,?,?,?,?,?,?) ON CONFLICT(endpoint) DO UPDATE SET p256dh=excluded.p256dh, auth=excluded.auth, user=excluded.user, name=excluded.name, tz=excluded.tz, prefs=excluded.prefs, site=excluded.site")
    .bind(s.endpoint, keys.p256dh, keys.auth, a ? a.user : null, String(body.name || "").slice(0, 30), tz, JSON.stringify(cleanPrefs(body.prefs)), "{}", Date.now(), site).run();
  return json({ ok: true });
}
async function pushUnsubscribe(req, env) {
  const body = await readJSON(req);
  const D = await pushTable(env);
  await D.prepare("DELETE FROM push_subs WHERE endpoint=?").bind(String(body.endpoint || "")).run();
  return json({ ok: true });
}
const pick = (a) => a[Math.floor(Math.random() * a.length)];
async function personal(D, row) {
  // Quelques infos pour personnaliser (si la personne a un compte)
  const out = { name: row.name || "", days: null, thing: "" };
  if (!row.user) return out;
  try {
    const r = await D.prepare("SELECT json FROM data WHERE user=?").bind(row.user).first();
    if (!r) return out;
    const S = JSON.parse(r.json);
    out.name = S.name || out.name;
    const h = S.habits && (S.habits[S.active] || Object.values(S.habits)[0]);
    if (h && !(h.mode === "reduce" && h.plan && Date.now() < h.plan.end) && h.quitAt < Date.now()) {
      out.days = Math.floor((Date.now() - h.quitAt) / 864e5);
      out.thing = { vape: "la vape", smoke: "la cigarette", weed: "le cannabis", alcohol: "l'alcool" }[h.type] || "";
    }
  } catch {}
  return out;
}
function message(kind, P) {
  const n = P.name ? " " + P.name : "";
  const streak = P.days != null && P.days > 0 ? `Jour ${P.days + 1} sans ${P.thing}. ` : "";
  if (kind === "morning") return { title: pick(["☀️ Bonjour" + n + " !", "☀️ Nouvelle journée" + (n ? "," + n : ""), "🌱 Coucou" + n]), body: streak + pick(["Prends 10 secondes pour ton engagement du jour : « Aujourd'hui, je reste libre. »", "Comment tu te sens ce matin ? Dis-le à Libre en un geste.", "Un verre d'eau, une grande respiration, et c'est parti. Tu es capable."]), tag: "morning", go: "checkin" };
  if (kind === "evening") return { title: pick(["🌙 Comment ça va" + (n ? "," + n : "") + " ?", "🌙 Ta journée s'est bien passée ?", "💬 Sam prend de tes nouvelles"]), body: streak + pick(["Raconte ta journée en 20 secondes : ça t'aide à voir tes progrès.", "Une journée de plus, ça compte. Note comment tu te sens ce soir.", "Facile, ça va ou difficile ? Dis-le à Libre, sans jugement."]), tag: "evening", go: "checkin" };
  return { title: "🌊 Ton moment sensible approche", body: pick(["C'est souvent l'heure où l'envie arrive. Prépare ce que tu feras à la place.", "Si l'envie monte : respire 90 secondes avec Libre, elle redescend.", "Garde ton plan en tête. Et Sam est là si besoin."]), tag: "risk", go: "sos" };
}
async function runReminders(env, onlyEndpoint) {
  if (!env.DB) return { sent: 0 };
  const D = await pushTable(env);
  const rows = onlyEndpoint
    ? (await D.prepare("SELECT * FROM push_subs WHERE endpoint=?").bind(onlyEndpoint).all()).results
    : (await D.prepare("SELECT * FROM push_subs").all()).results;
  let sent = 0;
  for (const row of rows || []) {
    try {
      const prefs = JSON.parse(row.prefs || "{}"), last = JSON.parse(row.last || "{}");
      const parts = Object.fromEntries(new Intl.DateTimeFormat("en-CA", { timeZone: row.tz || "Europe/Zurich", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date()).map((x) => [x.type, x.value]));
      const day = `${parts.year}-${parts.month}-${parts.day}`, now = +parts.hour * 60 + +parts.minute;
      const due = onlyEndpoint ? ["test"] : ["morning", "evening", "risk"].filter((k) => {
        if (!prefs[k] || last[k] === day) return false;
        const [h, m] = prefs[k].split(":").map(Number);
        const t = h * 60 + m;
        return now >= t && now < t + 45;
      });
      if (!due.length) continue;
      const P = await personal(D, row);
      for (const k of due) {
        const msg = k === "test" ? { title: "✅ Rappels activés", body: "Parfait" + (P.name ? " " + P.name : "") + " ! Libre te fera signe chaque jour. Tu peux changer les heures dans Réglages.", tag: "test", go: "home" } : message(k, P);
        const status = await sendPush(D, row, msg, "mailto:rappels@libre.app");
        if (status === 404 || status === 410) { await D.prepare("DELETE FROM push_subs WHERE endpoint=?").bind(row.endpoint).run(); break; }
        if (status >= 200 && status < 300) { sent++; if (k !== "test") last[k] = day; }
        else console.error("push status", status, new URL(row.endpoint).host);
      }
      if (!onlyEndpoint) await D.prepare("UPDATE push_subs SET last=? WHERE endpoint=?").bind(JSON.stringify(last), row.endpoint).run();
    } catch (e) {
      console.error("reminder error", e && e.message);
    }
  }
  return { sent };
}

/* ---------------- Mots des proches ----------------
 * Elle partage un lien ; le proche ouvre ce lien, écrit son mot, et le mot arrive dans son app. */
async function wordsTables(env) {
  const D = await db(env);
  await D.batch([
    D.prepare("CREATE TABLE IF NOT EXISTS invites (token TEXT PRIMARY KEY, user TEXT NOT NULL UNIQUE, created INTEGER NOT NULL)"),
    D.prepare("CREATE TABLE IF NOT EXISTS words (id INTEGER PRIMARY KEY AUTOINCREMENT, user TEXT NOT NULL, from_name TEXT NOT NULL, msg TEXT NOT NULL, created INTEGER NOT NULL)"),
    D.prepare("CREATE INDEX IF NOT EXISTS words_user ON words(user)"),
  ]);
  return D;
}
async function inviteCreate(env, a) {
  const D = await wordsTables(env);
  let row = await D.prepare("SELECT token FROM invites WHERE user=?").bind(a.user).first();
  if (!row) {
    const token = randomHex(12);
    await D.prepare("INSERT INTO invites (token,user,created) VALUES (?,?,?)").bind(token, a.user, Date.now()).run();
    row = { token };
  }
  return json({ token: row.token });
}
async function inviteOwner(env, token) {
  if (!/^[0-9a-f]{24}$/.test(token)) return null;
  const D = await wordsTables(env);
  const inv = await D.prepare("SELECT user FROM invites WHERE token=?").bind(token).first();
  if (!inv) return null;
  let name = "";
  try {
    const r = await D.prepare("SELECT json FROM data WHERE user=?").bind(inv.user).first();
    if (r) name = String(JSON.parse(r.json).name || "").slice(0, 30);
  } catch {}
  return { user: inv.user, name, D };
}
async function inviteInfo(env, token) {
  const o = await inviteOwner(env, token);
  if (!o) return err("bad_link", 404, "Ce lien n'est plus valable. Demande-lui de t'en renvoyer un.");
  return json({ name: o.name });
}
async function inviteWrite(req, env, token) {
  const o = await inviteOwner(env, token);
  if (!o) return err("bad_link", 404, "Ce lien n'est plus valable. Demande-lui de t'en renvoyer un.");
  const body = await readJSON(req);
  const from = String(body.from || "").trim().slice(0, 30);
  const msg = String(body.msg || "").trim().slice(0, 500);
  if (!from) return err("no_name", 400, "Écris ton prénom pour qu'elle sache que c'est toi.");
  if (msg.length < 2) return err("no_msg", 400, "Écris ton message.");
  if ((await bump(env, "word:" + ip(req), 3600)) > 12) return err("rate", 429, "Beaucoup de messages d'un coup : réessaie un peu plus tard.");
  const { D } = o;
  if (((await D.prepare("SELECT COUNT(*) AS n FROM words WHERE user=?").bind(o.user).first()) || {}).n > 300) return err("full", 429, "Sa boîte à mots est pleine.");
  await D.prepare("INSERT INTO words (user,from_name,msg,created) VALUES (?,?,?,?)").bind(o.user, from, msg, Date.now()).run();
  // Notification à la personne
  try {
    await pushTable(env);
    const subs = (await D.prepare("SELECT * FROM push_subs WHERE user=?").bind(o.user).all()).results || [];
    for (const s of subs) {
      const st = await sendPush(D, s, { title: "💌 " + from + " t'a écrit un mot", body: msg.length > 120 ? msg.slice(0, 117) + "…" : msg, tag: "word", go: "words" }, "mailto:rappels@libre.app");
      if (st === 404 || st === 410) await D.prepare("DELETE FROM push_subs WHERE endpoint=?").bind(s.endpoint).run();
    }
  } catch (e) { console.error("word push", e && e.message); }
  return json({ ok: true });
}
async function wordsList(env, a) {
  const D = await wordsTables(env);
  const r = await D.prepare("SELECT id, from_name, msg, created FROM words WHERE user=? ORDER BY created DESC LIMIT 200").bind(a.user).all();
  return json({ words: (r.results || []).map((w) => ({ id: w.id, from: w.from_name, msg: w.msg, t: w.created })) });
}
async function wordDelete(env, a, id) {
  const D = await wordsTables(env);
  await D.prepare("DELETE FROM words WHERE id=? AND user=?").bind(+id || 0, a.user).run();
  return json({ ok: true });
}

/* ---------------- Routeur ---------------- */
/* Le site peut aussi être hébergé ailleurs (ex. GitHub Pages) et appeler ce serveur. */
const CORS_OK = [/^https:\/\/[a-z0-9-]+\.github\.io$/i, /^http:\/\/localhost(:\d+)?$/];
function corsHeaders(origin) {
  return { "Access-Control-Allow-Origin": origin, "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS", "Access-Control-Allow-Headers": "content-type, authorization", "Access-Control-Max-Age": "86400", Vary: "Origin" };
}
async function route(req, env, ctx) {
    const url = new URL(req.url);
    if (!url.pathname.startsWith("/api/")) return env.ASSETS ? env.ASSETS.fetch(req) : new Response("Libre", { status: 404 });
    // Écritures : même site, ou site autorisé (GitHub Pages)
    const origin = req.headers.get("origin");
    if (req.method !== "GET" && origin && new URL(origin).host !== url.host && !CORS_OK.some((r) => r.test(origin))) return err("origin", 403, "Origine refusée.");
    try {
      const p = url.pathname.replace(/\/+$/, ""), m = req.method;
      if (p === "/api/status" && m === "GET") return json({ ok: true, ai: !!(env.ANTHROPIC_API_KEY || env.AI), engine: env.ANTHROPIC_API_KEY ? "claude" : env.AI ? "cloudflare" : "offline", accounts: !!env.DB });
      if (p === "/api/chat" && m === "POST") return await chat(req, env, ctx);
      if (p === "/api/register" && m === "POST") return await register(req, env);
      const im = p.match(/^\/api\/invite\/([0-9a-f]{24})$/);
      if (im && m === "GET") return await inviteInfo(env, im[1]);
      if (im && m === "POST") return await inviteWrite(req, env, im[1]);
      if (p === "/api/push/key" && m === "GET") return json({ key: (await vapid(await db(env))).pub });
      if (p === "/api/push/subscribe" && m === "POST") return await pushSubscribe(req, env);
      if (p === "/api/push/unsubscribe" && m === "POST") return await pushUnsubscribe(req, env);
      if (p === "/api/push/test" && m === "POST") {
        const b = await readJSON(req);
        if ((await bump(env, "ptest:" + ip(req), 3600)) > 10) return err("rate", 429, "Trop d'essais.");
        return json(await runReminders(env, String(b.endpoint || "")));
      }
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
      if (p === "/api/invite" && m === "POST") return await inviteCreate(env, a);
      if (p === "/api/words" && m === "GET") return await wordsList(env, a);
      const wd = p.match(/^\/api\/words\/(\d+)$/);
      if (wd && m === "DELETE") return await wordDelete(env, a, wd[1]);
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
}

export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(runReminders(env));
  },
  async fetch(req, env, ctx) {
    const origin = req.headers.get("origin") || "";
    const cross = origin && CORS_OK.some((r) => r.test(origin)) && new URL(req.url).pathname.startsWith("/api/");
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cross ? corsHeaders(origin) : {} });
    const res = await route(req, env, ctx);
    if (!cross) return res;
    const h = new Headers(res.headers);
    for (const [k, v] of Object.entries(corsHeaders(origin))) h.set(k, v);
    return new Response(res.body, { status: res.status, headers: h });
  },
};
