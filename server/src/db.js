// Base de données SQLite (module intégré à Node 22). Une table par notion ; aucune donnée de santé en clair :
// le coffre de chaque compte est chiffré sur l'appareil (le serveur ne possède pas la clé).
'use strict';
const { DatabaseSync } = require('node:sqlite');
function open(path) {
  const db = new DatabaseSync(path);
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;
  CREATE TABLE IF NOT EXISTS users(
    id TEXT PRIMARY KEY, email TEXT UNIQUE, email_verified INTEGER NOT NULL DEFAULT 0,
    phone TEXT UNIQUE, phone_verified INTEGER NOT NULL DEFAULT 0, pw_hash TEXT,
    lang TEXT, created INTEGER NOT NULL);
  CREATE TABLE IF NOT EXISTS codes(
    id TEXT PRIMARY KEY, purpose TEXT NOT NULL, target TEXT NOT NULL, user_id TEXT,
    code_hash TEXT NOT NULL, expires INTEGER NOT NULL, attempts INTEGER NOT NULL DEFAULT 0, created INTEGER NOT NULL);
  CREATE INDEX IF NOT EXISTS codes_target ON codes(purpose, target);
  CREATE TABLE IF NOT EXISTS sessions(
    token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created INTEGER NOT NULL, expires INTEGER NOT NULL, last_seen INTEGER NOT NULL);
  CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id);
  CREATE TABLE IF NOT EXISTS vaults(
    user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    version INTEGER NOT NULL, blob TEXT NOT NULL, keys TEXT NOT NULL, updated INTEGER NOT NULL);`);
  return db;
}
module.exports = { open };
